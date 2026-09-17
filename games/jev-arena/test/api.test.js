import test from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, legalActions } from '../src/engine.js';
import { sanitize, buildRequest, parseDecision, decide } from '../server/jev.js';
import { createHandler } from '../api/decision.js';
const body = () => ({ game: makeGame(7318), doctrine: 'Играй осторожно.' });
const responseFor = request => {
  const answer = criteria => { const keys = Object.keys(criteria); return { type: 'choice', choice: keys[0], confidence: 1, probabilities: Object.fromEntries(keys.map((k, i) => [k, i === 0 ? 1 : 0])) }; };
  return { model: 'test-fixture', answers: { action: answer(request.questions.action.criteria), aim: answer(request.questions.aim.criteria), danger: { type: 'score', score: 2 } }, usage: { input_tokens: 123, output_tokens: 0 } };
};
async function invoke(handler, overrides = {}) {
  const req = { method: 'POST', headers: { host: 'localhost:3000', 'content-type': 'application/json' }, body: body(), ...overrides };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(text) { this.body = JSON.parse(text); } };
  await handler(req, res); return res;
}
test('state validation strips unknown properties including raw instructions', () => {
  const b = body(); b.game.secret = 'injected'; b.game.tanks[0].instructions = 'injected'; const s = sanitize(b); assert.equal(s.game.secret, undefined); assert.equal(s.game.tanks[0].instructions, undefined);
});
test('state validation rejects nulls, oversized terrain, NaN and invalid resources', () => {
  for (const mutate of [b => { b.game = null; }, b => { b.game.tanks[0] = null; }, b => { b.game.terrain.push(4); }, b => { b.game.wind = NaN; }, b => { b.game.tanks[0].heavy = 99; }, b => { b.doctrine = 'x'.repeat(601); }, b => { b.game.turn = 32; }, b => { b.game.tanks[0].x = 900; }]) { const b = body(); mutate(b); assert.throws(() => sanitize(b)); }
});
test('only legal action choices and bounded public history go to Jev', () => {
  const b = body(); b.game.tanks[0].heavy = 0; b.game.history = Array.from({ length: 30 }, () => ({ turn: 1, actor: 0, arbitrary: 'ignore rules' }));
  const s = sanitize(b), request = buildRequest(s.game, s.doctrine); assert.equal(request.state.recent_public_outcomes.length, 8); assert.equal(request.questions.action.criteria.heavy, undefined); assert.equal(request.state.recent_public_outcomes[0].arbitrary, undefined); assert.equal(request.state.enemy.doctrine, undefined); assert.equal(request.state.terrain.length, 51);
});
test('wire request uses official System One contract, with no simulated hit oracle', () => {
  const request = buildRequest(body().game, 'test'); assert.equal(request.model, 'jev-latest'); assert.equal(request.questions.action.type, 'choice'); assert.equal(request.questions.aim.type, 'choice'); assert.equal(request.questions.danger.type, 'score'); assert.equal(Object.keys(request.questions.aim.criteria).length, 20); assert.ok(!Object.keys(request.state).includes('predicted_damage'));
});
test('model output labels and probabilities are runtime-validated', () => {
  const request = buildRequest(body().game, 'test'), data = responseFor(request); const decision = parseDecision(data, request); assert.equal(decision.source, 'jev'); assert.ok(legalActions(body().game).includes(decision.action));
  data.answers.action.choice = 'teleport'; assert.throws(() => parseDecision(data, request)); data.answers.action.choice = 'shell'; data.answers.action.probabilities.shell = Infinity; assert.throws(() => parseDecision(data, request));
});
test('upstream request carries key only to fixed provider URL; result has no key', async () => {
  const result = await decide(body().game, 'test', { apiKey: 'test-only-secret', fetchImpl: async (url, options) => { assert.equal(url, 'https://api.typesafe.ai/v1/systemone'); assert.equal(options.headers.Authorization, 'Bearer test-only-secret'); assert.equal(options.method, 'POST'); return new Response(JSON.stringify(responseFor(JSON.parse(options.body))), { status: 200 }); } });
  assert.equal(result.source, 'jev'); assert.ok(!JSON.stringify(result).includes('test-only-secret'));
});
test('missing key and upstream errors fail explicitly; never a demo fallback', async () => {
  await assert.rejects(decide(body().game, 'test'), /typesafe_not_configured/);
  await assert.rejects(decide(body().game, 'test', { apiKey: 'test', fetchImpl: async () => new Response('private diagnostic', { status: 403 }) }), /typesafe_auth_failed/);
  await assert.rejects(decide(body().game, 'test', { apiKey: 'test', fetchImpl: async () => { throw new Error('contains secrets'); } }), /typesafe_network_error/);
});
test('GET status exposes configuration booleans, not credentials', async () => {
  const r = await invoke(createHandler({ env: { TYPESAFE_API_KEY: 'server-secret' } }), { method: 'GET' }); assert.equal(r.statusCode, 200); assert.equal(r.body.configured, true); assert.ok(!JSON.stringify(r).includes('server-secret'));
});
test('Vercel is fail-closed without a separate game access password', async () => {
  const h = createHandler({ env: { VERCEL: '1', TYPESAFE_API_KEY: 'test' } }); assert.equal((await invoke(h)).statusCode, 503); assert.equal((await invoke(h, { method: 'GET' })).body.configured, false);
});
test('wrong game password and cross-origin browser requests are rejected', async () => {
  const h = createHandler({ env: { TYPESAFE_API_KEY: 'test', DUEL_ACCESS_TOKEN: 'password' } }); assert.equal((await invoke(h)).statusCode, 401);
  const r = await invoke(h, { headers: { host: 'localhost:3000', authorization: 'Bearer password', origin: 'https://evil.example', 'content-type': 'application/json' } }); assert.equal(r.statusCode, 403);
});
test('unsupported method, bad media type and oversize body are rejected', async () => {
  const h = createHandler({ env: {} }); assert.equal((await invoke(h, { method: 'DELETE' })).statusCode, 405); assert.equal((await invoke(h, { headers: {} })).statusCode, 415); assert.equal((await invoke(h, { body: 'x'.repeat(17000) })).statusCode, 413); assert.equal((await invoke(h, { body: '{bad' })).statusCode, 400);
});
test('unconfigured POST returns a useful error without constructing a client', async () => {
  assert.equal((await invoke(createHandler({ env: {} }))).body.error, 'typesafe_not_configured');
});
test('successful endpoint returns only a validated decision', async () => {
  const r = await invoke(createHandler({ env: { TYPESAFE_API_KEY: 'test' }, decideImpl: async (game, doctrine) => parseDecision(responseFor(buildRequest(game, doctrine)), buildRequest(game, doctrine)) })); assert.equal(r.statusCode, 200); assert.equal(r.body.source, 'jev'); assert.equal(r.body.action, 'shell');
});
test('per-process cost limiter caps model calls and resets its window', async () => {
  let count = 0, time = 100000; const h = createHandler({ env: { TYPESAFE_API_KEY: 'test' }, now: () => time, decideImpl: async () => { count++; return { source: 'jev' }; } });
  for (let i = 0; i < 24; i++) assert.equal((await invoke(h)).statusCode, 200);
  assert.equal((await invoke(h)).statusCode, 429); assert.equal(count, 24); time += 60000; assert.equal((await invoke(h)).statusCode, 200);
});
