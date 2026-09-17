import { makeGame, resolveTurn } from '../src/engine.js';
import { decide } from '../server/jev.js';
// Two actual API calls, one for each tank. No credentials or full payloads logged.
let game = makeGame(7318);
for (const doctrine of ['Играй агрессивно, наноси урон.', 'Играй осторожно, учитывай ветер.']) {
  try {
    const decision = await decide(game, doctrine, { apiKey: process.env.TYPESAFE_API_KEY, model: process.env.TYPESAFE_DEFAULT_MODEL || 'jev-latest' });
    console.log(JSON.stringify({ actor: game.active, source: decision.source, action: decision.action, aim: decision.aim, latency_ms: decision.latency_ms, model: decision.model }));
    game = resolveTurn(game, decision).state;
  } catch (e) { console.error('Live check failed:', e.code || 'request_failed'); process.exitCode = 1; break; }
}
