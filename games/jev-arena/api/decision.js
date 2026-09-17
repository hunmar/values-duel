import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk';

const POSTURES = {
  engage: 'Push toward the most useful enemy target and apply pressure while staying mobile.',
  guard: 'Stay close to the player, intercept nearby threats, and prioritize survival.',
  scavenge: 'Move toward a useful pickup when the tactical risk is acceptable.',
  retreat: 'Create distance from enemy pressure and preserve the drone until the situation improves.',
};

const DANGER = [
  'Calm: very little immediate pressure.',
  'Manageable: some enemies are present but the player has room to operate.',
  'Pressured: several threats are close or resources are getting low.',
  'Dangerous: the player is at meaningful risk of being overwhelmed.',
  'Critical: immediate survival is the dominant concern.',
];

function json(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(payload));
}

function sanitizeState(body) {
  const state = body?.state;
  if (!state || typeof state !== 'object') return null;

  const enemies = Array.isArray(state.enemies) ? state.enemies.slice(0, 5) : [];
  const pickups = Array.isArray(state.pickups) ? state.pickups.slice(0, 4) : [];

  return {
    objective: 'Keep the player alive and help defeat the current wave. Avoid wasting overdrive when it is not useful.',
    player: {
      health_pct: Number(state.player?.health_pct ?? 100),
      speed: Number(state.player?.speed ?? 0),
      currently_firing: Boolean(state.player?.currently_firing),
    },
    drone: {
      health_pct: Number(state.drone?.health_pct ?? 100),
      overdrive_charges: Number(state.drone?.overdrive_charges ?? 0),
      distance_to_player: Number(state.drone?.distance_to_player ?? 0),
    },
    wave: Number(state.wave ?? 1),
    enemies_alive: Number(state.enemies_alive ?? enemies.length),
    enemies,
    pickups,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'method_not_allowed' });
  }

  if (!process.env.TYPESAFE_API_KEY) {
    return json(res, 503, {
      error: 'typesafe_not_configured',
      message: 'Set TYPESAFE_API_KEY to enable Jev decisions.',
    });
  }

  const state = sanitizeState(req.body);
  if (!state) return json(res, 400, { error: 'invalid_state' });

  const targetCriteria = Object.fromEntries(
    state.enemies.map((enemy) => [
      String(enemy.id),
      `${enemy.type ?? 'enemy'} at distance ${Number(enemy.distance ?? 0).toFixed(1)}, health ${Number(enemy.health_pct ?? 100).toFixed(0)}%, threat ${enemy.threat ?? 'unknown'}`,
    ]),
  );
  targetCriteria.none = 'Do not select an enemy when none is worth committing to right now.';

  const client = new TypeSafeClient({
    timeout: 2500,
    retry: { maxRetries: 1 },
  });
  const started = Date.now();

  try {
    const response = await client.systemOne({
      state,
      questions: {
        posture: choice(
          'Choose the tactical posture the companion drone should use for the next moment.',
          POSTURES,
        ),
        target: choice(
          'Choose the best enemy for the drone to focus, or none when holding fire is preferable.',
          targetCriteria,
        ),
        danger: score(
          'Rate the immediate danger to the player using this ordered scale.',
          DANGER,
        ),
        overdrive: noul(
          'Should the drone spend one scarce overdrive charge right now? Use it only when the tactical value is high.',
          {
            true: 'Spending a charge now has high immediate tactical value.',
            false: 'Preserve the charge for a more important moment.',
          },
        ),
      },
    });

    return json(res, 200, {
      source: 'jev',
      model: response.model,
      latency_ms: Date.now() - started,
      usage: response.usage,
      answers: response.answers,
    });
  } catch (error) {
    console.error('TypeSafe decision failed', error);
    return json(res, 502, {
      error: 'typesafe_request_failed',
      message: error instanceof Error ? error.message : 'Unknown TypeSafe error',
      latency_ms: Date.now() - started,
    });
  }
}
