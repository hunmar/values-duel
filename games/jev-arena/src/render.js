import { WORLD, ground, random, clamp, WEAPONS } from './engine.js';
export class Renderer {
  constructor(canvas) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.top = 0; }
  draw(state, animation, decisions, time, lastTrace) {
    const c = this.ctx, r = this.canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    if (this.canvas.width !== Math.round(r.width * dpr) || this.canvas.height !== Math.round(r.height * dpr)) { this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr); }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = '#e4d7b9'; c.fillRect(0, 0, r.width, r.height);
    const trace = animation?.event.path ?? [], desired = trace.length ? Math.min(0, ...trace.map(p => p.y - 45)) : 0;
    this.top += (desired - this.top) * .055;
    const scale = Math.min(r.width / WORLD.width, r.height / (WORLD.height - this.top));
    c.translate((r.width - WORLD.width * scale) / 2, r.height - WORLD.height * scale);
    c.scale(scale, scale);
    const sky = c.createLinearGradient(0, this.top, 0, 400); sky.addColorStop(0, '#ecdfc3'); sky.addColorStop(1, '#c3cbbb');
    c.fillStyle = sky; c.fillRect(-1000, this.top - 200, 3000, 1000 - this.top);
    // Pale sun and long, quiet cloud bands.
    c.fillStyle = '#f4ca8c'; c.beginPath(); c.arc(745, 105, 46, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#f6dcac'; c.lineWidth = 1; for (const radius of [55, 64]) { c.beginPath(); c.arc(745, 105, radius, 0, Math.PI * 2); c.stroke(); }
    c.fillStyle = '#f5edcf88'; for (const [x, y, w] of [[80, 91, 136], [295, 139, 112], [643, 77, 177], [817, 166, 120]]) { c.beginPath(); c.roundRect(x, y, w, 8, 4); c.fill(); }
    this.mountains(c, state.seed, 260, '#a9b5a7', 76);
    this.mountains(c, state.seed + 40, 323, '#91a396', 44);
    c.fillStyle = '#7b958753'; c.fillRect(-1000, 344, 3000, 200);
    const visible = animation && animation.elapsed >= animation.duration ? animation.state : state;
    const soil = c.createLinearGradient(0, 290, 0, 520); soil.addColorStop(0, '#b57853'); soil.addColorStop(1, '#664a3c');
    const groundPath = () => { c.beginPath(); c.moveTo(-1000, 520); c.lineTo(-1000, visible.terrain[0]); visible.terrain.forEach((y, i) => c.lineTo(i * WORLD.step, y)); c.lineTo(2000, visible.terrain.at(-1)); c.lineTo(2000, 520); c.closePath(); };
    groundPath(); c.fillStyle = soil; c.fill(); c.save(); c.clip();
    const rng = random(state.seed);
    for (let layer = 0; layer < 6; layer++) { c.beginPath(); for (let x = 0; x <= 1000; x += 8) c.lineTo(x, 363 + layer * 34 + Math.sin(x / 90 + layer) * 15); c.strokeStyle = layer % 2 ? '#cf967137' : '#503b323b'; c.lineWidth = 11; c.stroke(); }
    for (let i = 0; i < 650; i++) { c.fillStyle = i % 2 ? '#eac1942b' : '#3c3b3030'; c.fillRect(rng() * 1000, 320 + rng() * 220, 1 + rng() * 3, 1 + rng() * 2); }
    c.restore(); c.beginPath(); visible.terrain.forEach((y, i) => i ? c.lineTo(i * WORLD.step, y) : c.moveTo(0, y)); c.strokeStyle = '#e7bd80'; c.lineWidth = 4; c.stroke();
    // Distant ground plants and range markers follow the actual deformed surface.
    for (const x of [45, 290, 350, 648, 724, 939]) { const y = ground(visible, x); c.strokeStyle = '#73754e'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 4, y - 12); c.moveTo(x, y); c.lineTo(x + 7, y - 8); c.stroke(); }
    if (lastTrace?.length && !animation) this.path(c, lastTrace, '#f6e2ac4d');
    for (const tank of visible.tanks) this.tank(c, visible, tank, decisions[tank.id], animation, time);
    if (animation && trace.length) {
      const progress = clamp(animation.elapsed / animation.duration, 0, 1), index = Math.max(1, Math.floor(progress * (trace.length - 1)));
      this.path(c, trace.slice(0, index + 1), '#f8f0bd99');
      if (progress < 1) { const p = trace[index]; c.shadowBlur = 14; c.shadowColor = '#ffe2a4'; c.fillStyle = '#fff8d2'; c.beginPath(); c.arc(p.x, p.y, 4.5, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0; }
      else this.explosion(c, animation.event, clamp((animation.elapsed - animation.duration) / .65, 0, 1));
    }
    c.fillStyle = '#e5c9a285'; c.font = '8px ui-monospace,monospace'; c.textAlign = 'center';
    for (let x = 100; x < 1000; x += 100) { c.fillRect(x, 499, 1, 5); c.fillText(String(x).padStart(3, '0'), x, 515); }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  mountains(c, seed, base, color, amplitude) {
    const rng = random(seed); c.beginPath(); c.moveTo(-1000, 600); c.lineTo(-1000, base);
    for (let x = -80; x <= 1100; x += 70) { const y = base - rng() * amplitude; c.lineTo(x, y); c.lineTo(x + 38, y - 7); }
    c.lineTo(2000, base); c.lineTo(2000, 600); c.closePath(); c.fillStyle = color; c.fill();
  }
  path(c, points, color) { if (!points.length) return; c.save(); c.strokeStyle = color; c.lineWidth = 1.6; c.setLineDash([4, 7]); c.beginPath(); points.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.stroke(); c.restore(); }
  tank(c, state, t, decision, animation, time) {
    const color = t.id === 0 ? '#547e68' : '#bc794b', light = t.id === 0 ? '#a8d4a2' : '#f6ba79';
    let x = t.x, y = ground(state, x), angle = decision?.angle ?? 45;
    if (animation?.event.actor === t.id && ['advance', 'retreat'].includes(animation.event.action)) { const to = animation.state.tanks[t.id]; x += (to.x - x) * clamp(animation.elapsed / animation.duration, 0, 1); y = ground(state, x); }
    c.save(); c.translate(x, y - 7);
    c.fillStyle = '#263b3744'; c.beginPath(); c.ellipse(0, 6, 36, 6, 0, 0, Math.PI * 2); c.fill();
    const slope = clamp(Math.atan2(ground(state, x + 18) - ground(state, x - 18), 36), -.3, .3); c.rotate(slope);
    c.fillStyle = '#334039'; c.beginPath(); c.roundRect(-28, -7, 56, 16, 8); c.fill();
    for (let i = -20; i <= 20; i += 10) { c.fillStyle = '#7b8970'; c.beginPath(); c.arc(i, 1, 4.5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#39483f'; c.beginPath(); c.arc(i, 1, 2, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = t.hp > 0 ? color : '#5c5c4d'; c.beginPath(); c.roundRect(-25, -18, 50, 14, 4); c.fill();
    c.fillStyle = light; c.fillRect(-21, -17, 39, 3); c.fillStyle = color; c.beginPath(); c.roundRect(-13, -30, 27, 15, 5); c.fill();
    c.save(); c.translate(0, -23); c.scale(t.id === 0 ? 1 : -1, 1); c.rotate(-angle * Math.PI / 180 - slope * (t.id === 0 ? 1 : -1));
    c.fillStyle = '#34493c'; c.fillRect(4, -4, 31, 8); c.fillStyle = light; c.fillRect(5, -4, 28, 2); c.fillStyle = '#384438'; c.fillRect(31, -5, 7, 10); c.restore();
    c.fillStyle = '#f6e9c4'; c.font = 'bold 8px ui-monospace,monospace'; c.textAlign = 'center'; c.fillText(t.id === 0 ? '01' : '02', 0, -8);
    if (t.shield > 0) { c.strokeStyle = '#d7f3caaa'; c.lineWidth = 2; c.setLineDash([5, 3]); c.beginPath(); c.ellipse(0, -12, 41, 39, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
    if (t.hp < 40) for (let i = 0; i < 3; i++) { const p = ((time / 1200 + i / 3) % 1); c.fillStyle = `rgba(53,60,51,${(1 - p) * .45})`; c.beginPath(); c.arc(2 + p * 15, -35 - p * 38, 4 + p * 10, 0, Math.PI * 2); c.fill(); }
    c.restore();
    c.textAlign = 'center'; c.fillStyle = '#344d42'; c.font = 'bold 9px ui-sans-serif,system-ui'; c.fillText(t.name, x, y - 66); c.fillStyle = '#fff3c47a'; c.fillRect(x - 20, y - 58, 40, 3); c.fillStyle = color; c.fillRect(x - 20, y - 58, 40 * t.hp / 100, 3);
    if (state.active === t.id && !state.ended) { c.fillStyle = color; c.beginPath(); c.moveTo(x - 4, y - 81); c.lineTo(x + 4, y - 81); c.lineTo(x, y - 76); c.fill(); }
  }
  explosion(c, event, p) {
    if (!event.impact) return;
    const { x, y } = event.impact, rng = random(event.turn * 339);
    const size = WEAPONS[event.action]?.radius ?? 50;
    c.save(); c.globalAlpha = 1 - p;
    c.strokeStyle = '#fff0b3'; c.lineWidth = 4 * (1 - p); c.beginPath(); c.arc(x, y, 8 + p * size, 0, Math.PI * 2); c.stroke();
    for (let i = 0; i < 23; i++) { const a = rng() * Math.PI * 2, d = (18 + rng() * size) * p; c.fillStyle = i % 3 ? '#f7ca7b' : '#927052'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d - p * 20, (3 + rng() * 8) * (1 - p), 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
}
