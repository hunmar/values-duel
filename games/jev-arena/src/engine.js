/** Deterministic toy artillery physics. Units are fictional, not real ballistics. */
export const WORLD = Object.freeze({ width: 1000, height: 520, step: 4, gravity: 180, maxTurns: 32 });
export const WEAPONS = Object.freeze({
  shell: { title: 'Обычный', damage: 30, radius: 55, crater: 29, stock: null },
  heavy: { title: 'Фугас', damage: 46, radius: 74, crater: 46, stock: 'heavy' },
  drill: { title: 'Землерой', damage: 14, radius: 84, crater: 76, stock: 'drill' },
});
export const ACTIONS = Object.freeze({
  shell: 'Обычный снаряд', heavy: 'Фугас', drill: 'Разрушить укрытие',
  advance: 'Сблизиться', retreat: 'Отойти', repair: 'Ремонт', shield: 'Поднять щит',
});
export const DOCTRINES = Object.freeze({
  hunter: { title: 'Охотник', text: 'Дави на противника. Приоритет: урон и добивание. Не трать ремонт при почти полной броне. Используй фугас, когда уверен в выстреле. Исправляй промахи.' },
  engineer: { title: 'Инженер', text: 'Играй расчётливо. Учитывай ветер, рельеф и прошлые промахи. Береги спецснаряды. Ремонтируйся, когда это меняет исход. Разрушай укрытие землероем, если оно мешает.' },
  survivor: { title: 'Выживальщик', text: 'Сохраняй преимущество по броне. Применяй щит и ремонт в опасной ситуации, отходи от выгодных противнику позиций, но не забывай наносить урон.' },
});
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function random(seed) {
  let a = seed >>> 0;
  return () => { a += 0x6D2B79F5; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function ground(state, x) {
  const p = clamp(x / WORLD.step, 0, state.terrain.length - 1), i = Math.floor(p);
  return state.terrain[i] + ((state.terrain[i + 1] ?? state.terrain[i]) - state.terrain[i]) * (p - i);
}
export function makeGame(seed = 7319) {
  const rng = random(seed), phase = rng() * 6.28;
  const terrain = Array.from({ length: 251 }, (_, i) => {
    const x = i * 4;
    return Math.round(375 + Math.sin(x / 105 + phase) * 17 + Math.sin(x / 47) * 7 - Math.exp(-(((x - 510) / 130) ** 2)) * (48 + rng() * 4));
  });
  // Flat starting pads keep both tanks stable across random maps.
  for (const center of [145, 855]) {
    const level = terrain[Math.round(center / 4)];
    for (let i = 0; i < terrain.length; i++) if (Math.abs(i * 4 - center) < 36) terrain[i] = level;
  }
  const tank = (id, name, x) => ({ id, name, x, hp: 100, shield: 0, fuel: 4, heavy: 2, drill: 2, repairs: 2, cells: 2 });
  return { version: 1, seed: seed >>> 0, turn: 0, active: (seed >>> 0) % 2, wind: windFor(seed, 0), terrain,
    tanks: [tank(0, 'КЕДР', 145), tank(1, 'ЯНТАРЬ', 855)], history: [], winner: null, ended: false };
}
export function windFor(seed, turn) { return Math.round((random((seed >>> 0) + Math.floor(turn / 2) * 1033 + 809)() - 0.5) * 30); }
export function legalActions(state) {
  const t = state.tanks[state.active], enemy = state.tanks[1 - state.active];
  if (state.ended) return [];
  const result = ['shell'];
  if (t.heavy > 0) result.push('heavy');
  if (t.drill > 0) result.push('drill');
  if (t.fuel > 0 && Math.abs(t.x - enemy.x) > 150) result.push('advance');
  if (t.fuel > 0 && (state.active === 0 ? t.x > 78 : t.x < 922)) result.push('retreat');
  if (t.repairs > 0 && t.hp <= 76) result.push('repair');
  if (t.cells > 0 && t.shield < 10) result.push('shield');
  return result;
}
/** The menu contains angle/power pairs. The reference is a windless range table,
 * not a solver for terrain or wind. Jev must choose an arc and a correction. */
export function aimOptions(state) {
  const t = state.tanks[state.active], e = state.tanks[1 - state.active];
  const dx = Math.abs(e.x - t.x), dy = ground(state, e.x) - ground(state, t.x);
  const options = [];
  for (const angle of [30, 45, 60, 75]) {
    const a = angle * Math.PI / 180;
    const base = Math.sqrt(WORLD.gravity * dx * dx / (2 * Math.cos(a) ** 2 * Math.max(20, dx * Math.tan(a) + dy))) / 5.6;
    for (const offset of [-8, -4, 0, 4, 8]) {
      const power = Math.round(clamp(base + offset, 24, 98));
      const id = `a${angle}p${power}`;
      if (!options.some(o => o.id === id)) options.push({ id, angle, power, correction: offset });
    }
  }
  return options;
}
/** Pure flight trace. Rendering never determines hits or damage. */
export function flight(state, aim) {
  const t = state.tanks[state.active], dir = state.tanks[1 - state.active].x > t.x ? 1 : -1;
  const a = aim.angle * Math.PI / 180, speed = aim.power * 5.6;
  let x = t.x + dir * Math.cos(a) * 22, y = ground(state, t.x) - 20 - Math.sin(a) * 22;
  let vx = dir * Math.cos(a) * speed, vy = -Math.sin(a) * speed;
  const path = [{ x, y }], dt = 1 / 100;
  let direct = null;
  for (let n = 0; n < 1100; n++) {
    x += vx * dt + 0.5 * state.wind * dt * dt;
    y += vy * dt + 0.5 * WORLD.gravity * dt * dt;
    vx += state.wind * dt; vy += WORLD.gravity * dt;
    if (n % 3 === 0) path.push({ x, y });
    for (const tank of state.tanks) {
      if (n > 15 && Math.hypot(x - tank.x, y - (ground(state, tank.x) - 13)) < 18) { direct = tank.id; break; }
    }
    if (direct !== null || x < 0 || x > WORLD.width || y >= ground(state, x) || y > WORLD.height) break;
  }
  path.push({ x, y });
  return { path, impact: { x, y }, direct };
}
function damage(tank, amount) {
  const blocked = Math.min(tank.shield, amount);
  tank.shield -= blocked;
  const hpDamage = Math.min(tank.hp, Math.max(0, amount - blocked));
  tank.hp -= hpDamage;
  return hpDamage;
}
export function resolveTurn(input, decision) {
  if (input.ended) throw new Error('Match is over.');
  if (!legalActions(input).includes(decision.action)) throw new Error('Illegal action.');
  const state = structuredClone(input), actor = state.active, t = state.tanks[actor], enemy = state.tanks[1 - actor];
  const event = { turn: state.turn + 1, actor, action: decision.action, source: decision.source ?? 'unknown', wind: state.wind, damage: [0, 0], path: [], impact: null, direct: null };
  if (WEAPONS[decision.action]) {
    const aim = aimOptions(state).find(a => a.id === decision.aim);
    if (!aim) throw new Error('Illegal aim.');
    const weapon = WEAPONS[decision.action], trace = flight(state, aim);
    Object.assign(event, trace, { angle: aim.angle, power: aim.power, aim: aim.id });
    if (weapon.stock) t[weapon.stock]--;
    const oldHeights = state.tanks.map(tank => ground(state, tank.x));
    for (const tank of state.tanks) {
      const dist = Math.hypot(tank.x - trace.impact.x, oldHeights[tank.id] - 12 - trace.impact.y);
      const amount = trace.direct === tank.id ? weapon.damage : Math.round(weapon.damage * clamp(1 - dist / weapon.radius, 0, 1));
      event.damage[tank.id] += damage(tank, amount);
    }
    if (trace.impact.x >= 0 && trace.impact.x <= WORLD.width) {
      for (let i = 0; i < state.terrain.length; i++) {
        const dx = i * WORLD.step - trace.impact.x, radius = weapon.crater;
        if (Math.abs(dx) < radius) state.terrain[i] = Math.max(state.terrain[i], Math.min(488, trace.impact.y + Math.sqrt(radius * radius - dx * dx)));
      }
    }
    for (const tank of state.tanks) {
      const fall = ground(state, tank.x) - oldHeights[tank.id];
      if (fall > 24) event.damage[tank.id] += damage(tank, Math.min(22, Math.round((fall - 24) * .4)));
    }
    event.miss = Math.round((trace.impact.x - enemy.x) * (actor === 0 ? 1 : -1));
  } else if (decision.action === 'repair') { t.hp = Math.min(100, t.hp + 26); t.repairs--; }
  else if (decision.action === 'shield') { t.shield = 32; t.cells--; }
  else {
    const direction = enemy.x > t.x ? 1 : -1, dx = direction * (decision.action === 'advance' ? 48 : -48);
    t.x = clamp(t.x + dx, actor === 0 ? 55 : state.tanks[0].x + 125, actor === 0 ? state.tanks[1].x - 125 : 945);
    t.fuel--;
  }
  state.turn++;
  // Bounded games: storm pressure discourages indefinite defensive loops.
  if (state.turn > 24) for (const tank of state.tanks) event.damage[tank.id] += damage(tank, 6);
  state.history.push({ ...event, path: undefined });
  if (state.tanks.some(tank => tank.hp <= 0) || state.turn >= WORLD.maxTurns) {
    state.ended = true;
    const [a, b] = state.tanks;
    state.winner = a.hp === b.hp ? 'draw' : a.hp > b.hp ? 0 : 1;
  }
  state.active = 1 - actor; state.wind = windFor(state.seed, state.turn);
  return { state, event };
}
/** Demo-only local controller. It deliberately cannot claim Jev provenance. */
export function demoDecision(state, doctrine = 'hunter') {
  const actor = state.active, t = state.tanks[actor], allowed = legalActions(state);
  let action = 'shell';
  if (doctrine !== 'hunter' && t.hp < 53 && allowed.includes('repair')) action = 'repair';
  else if (doctrine === 'survivor' && t.hp < 70 && allowed.includes('shield')) action = 'shield';
  else if (allowed.includes('heavy') && (doctrine === 'hunter' || state.tanks[1 - actor].hp < 65)) action = 'heavy';
  const rng = random(state.seed + state.turn * 887);
  const candidates = aimOptions(state).map(aim => {
    const trace = flight(state, aim), e = state.tanks[1 - actor];
    const miss = Math.hypot(trace.impact.x - e.x, trace.impact.y - ground(state, e.x));
    return { aim, value: miss + rng() * (doctrine === 'hunter' ? 42 : 18) };
  }).sort((a, b) => a.value - b.value);
  return { action, aim: candidates[0].aim.id, source: 'demo', confidence: null, danger: null, probabilities: null, latency_ms: 0 };
}
