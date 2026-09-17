import { timingSafeEqual } from 'node:crypto';
import { sanitize, decide, DecisionError } from '../server/jev.js';

const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(body));
};
const equal = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); };

export function createHandler({ env = process.env, decideImpl = decide, now = Date.now } = {}) {
  let windowStart = 0, calls = 0, active = 0;
  return async function handler(req, res) {
    const key = env.TYPESAFE_API_KEY?.trim(), token = env.DUEL_ACCESS_TOKEN?.trim();
    const protectedConfig = !env.VERCEL || Boolean(token);
    if (req.method === 'GET') return json(res, 200, { configured: Boolean(key) && protectedConfig, accessRequired: Boolean(token), deploymentLocked: !protectedConfig, model: env.TYPESAFE_DEFAULT_MODEL || 'jev-latest' });
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(res, 405, { error: 'method_not_allowed' }); }
    if (!protectedConfig) return json(res, 503, { error: 'deployment_access_token_required' });
    if (token && !equal(String(req.headers.authorization || ''), `Bearer ${token}`)) return json(res, 401, { error: 'access_denied' });
    if (req.headers.origin) {
      try { if (new URL(req.headers.origin).host !== req.headers.host) return json(res, 403, { error: 'cross_origin_denied' }); }
      catch { return json(res, 403, { error: 'cross_origin_denied' }); }
    }
    if (!String(req.headers['content-type']).toLowerCase().startsWith('application/json')) return json(res, 415, { error: 'json_required' });
    try {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? null);
      if (Buffer.byteLength(raw) > 16384) return json(res, 413, { error: 'body_too_large' });
      let body;
      try { body = JSON.parse(raw); } catch { throw new DecisionError('invalid_json', 400); }
      const { game, doctrine } = sanitize(body);
      if (!key) throw new DecisionError('typesafe_not_configured', 503);
      const time = now();
      if (time - windowStart >= 60000) { windowStart = time; calls = 0; }
      if (calls >= 24 || active >= 2) { res.setHeader('Retry-After', '10'); return json(res, 429, { error: 'local_rate_limited' }); }
      calls++; active++;
      try { return json(res, 200, await decideImpl(game, doctrine, { apiKey: key, model: env.TYPESAFE_DEFAULT_MODEL || 'jev-latest' })); }
      finally { active--; }
    } catch (error) {
      // Deliberately never log request bodies, headers, keys, or upstream error bodies.
      return json(res, error instanceof DecisionError ? error.status : 500, { error: error instanceof DecisionError ? error.code : 'server_error' });
    }
  };
}
export default createHandler();
