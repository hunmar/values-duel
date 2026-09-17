import test from 'node:test';
import assert from 'node:assert/strict';
import { makeGame, legalActions, aimOptions, resolveTurn, demoDecision, flight, ground, windFor } from '../src/engine.js';
const shot = state => ({ ...demoDecision(state), action: 'shell' });
test('same seed reproduces terrain, initial state and demo decisions', () => {
  const a = makeGame(7318), b = makeGame(7318); assert.deepEqual(a, b); assert.deepEqual(demoDecision(a), demoDecision(b));
});
test('different seeds change the terrain and alternate opening player', () => {
  assert.notDeepEqual(makeGame(12).terrain, makeGame(13).terrain); assert.notEqual(makeGame(12).active, makeGame(13).active);
});
test('wind changes only between pairs of turns', () => {
  for (let i = 0; i < 30; i += 2) assert.equal(windFor(73, i), windFor(73, i + 1));
});
test('aim options are unique and bounded coherent pairs', () => {
  const options = aimOptions(makeGame()); assert.equal(new Set(options.map(o => o.id)).size, options.length);
  assert.ok(options.length >= 16); assert.ok(options.every(o => o.power >= 24 && o.power <= 98 && o.angle >= 30 && o.angle <= 75));
});
test('unavailable resources and useless full-health repairs are not offered', () => {
  const s = makeGame(); Object.assign(s.tanks[s.active], { heavy: 0, drill: 0, fuel: 0, cells: 0, repairs: 0 }); assert.deepEqual(legalActions(s), ['shell']);
});
test('illegal action and forged aim are rejected without mutating state', () => {
  const s = makeGame(), before = structuredClone(s); assert.throws(() => resolveTurn(s, { action: 'teleport' })); assert.throws(() => resolveTurn(s, { action: 'shell', aim: 'a0p9999' })); assert.deepEqual(s, before);
});
test('turn alternation and source provenance are explicit', () => {
  const s = makeGame(), r = resolveTurn(s, demoDecision(s)); assert.equal(r.state.active, 1 - s.active); assert.equal(r.state.turn, 1); assert.equal(r.event.source, 'demo'); assert.equal(r.state.history[0].source, 'demo');
});
test('repair consumes stock and restores only the acting tank', () => {
  const s = makeGame(); s.tanks[s.active].hp = 40; const r = resolveTurn(s, { action: 'repair' }); assert.equal(r.state.tanks[s.active].hp, 66); assert.equal(r.state.tanks[s.active].repairs, 1); assert.equal(r.state.tanks[1 - s.active].hp, 100);
});
test('shield and movement consume resources', () => {
  const s = makeGame(); const shield = resolveTurn(s, { action: 'shield' }).state.tanks[s.active]; assert.equal(shield.shield, 32); assert.equal(shield.cells, 1);
  const move = resolveTurn(s, { action: 'advance' }).state.tanks[s.active]; assert.equal(Math.abs(move.x - s.tanks[s.active].x), 48); assert.equal(move.fuel, 3);
});
test('heavy shells consume exactly one stock and leave input untouched', () => {
  const s = makeGame(), d = { ...shot(s), action: 'heavy' }; const r = resolveTurn(s, d); assert.equal(r.state.tanks[s.active].heavy, 1); assert.equal(s.tanks[s.active].heavy, 2);
});
test('shells deform terrain downward, never create terrain or nonfinite coordinates', () => {
  const s = makeGame(), r = resolveTurn(s, shot(s)); assert.ok(r.state.terrain.some((y, i) => y > s.terrain[i])); assert.ok(r.state.terrain.every((y, i) => y >= s.terrain[i] && y <= 488)); assert.ok(r.event.path.every(p => Number.isFinite(p.x) && Number.isFinite(p.y)));
});
test('wind affects impact while identical shots are deterministic', () => {
  const s = makeGame(), aim = aimOptions(s)[7], a = flight(s, aim); assert.deepEqual(a, flight(s, aim)); s.wind = s.wind === 15 ? -15 : 15; assert.notEqual(a.impact.x, flight(s, aim).impact.x);
});
test('direct hits and splash can damage tanks', () => {
  let s = makeGame(7318), total = 0;
  for (let n = 0; n < 12 && !s.ended; n++) { const r = resolveTurn(s, demoDecision(s)); total += r.event.damage.reduce((a, b) => a + b, 0); s = r.state; }
  assert.ok(total > 60, `damage ${total}`);
});
test('ground interpolation is continuous and clamps outside the board', () => {
  const s = makeGame(); assert.equal(ground(s, -50), s.terrain[0]); assert.equal(ground(s, 1100), s.terrain.at(-1)); assert.equal(ground(s, 2), (s.terrain[0] + s.terrain[1]) / 2);
});
test('100 seeded full matches terminate, conserve stocks, and replay exactly', () => {
  for (let seed = 100; seed < 200; seed++) {
    let s = makeGame(seed), replay = makeGame(seed); const choices = [];
    while (!s.ended) { const d = demoDecision(s, s.active ? 'engineer' : 'hunter'); choices.push(d); s = resolveTurn(s, d).state; assert.ok(s.turn <= 32); for (const t of s.tanks) { assert.ok(t.hp >= 0 && t.hp <= 100); for (const key of ['heavy', 'drill', 'repairs', 'cells', 'fuel']) assert.ok(t[key] >= 0); } }
    for (const d of choices) replay = resolveTurn(replay, d).state;
    assert.deepEqual(s, replay); assert.ok([0, 1, 'draw'].includes(s.winner)); assert.throws(() => resolveTurn(s, choices[0]));
  }
});
