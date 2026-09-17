import { ACTIONS, DOCTRINES, WEAPONS, aimOptions, makeGame, resolveTurn, demoDecision, clamp } from './engine.js';
import { Renderer } from './render.js';
const $ = id => document.getElementById(id);
const renderer = new Renderer($('battle'));
let state = makeGame(7319), mode = 'demo', config = { configured: false, accessRequired: false };
let auto = false, frozen = false, busy = false, epoch = 0, controller = null, animation = null;
let decisions = [null, null], records = [], lastTrace = [], requests = 0, lastLatency = 0;
let nextAt = 0, nextApiAt = 0, lastTime = performance.now();
for (const id of [0, 1]) $('doctrine' + id).value = DOCTRINES[$('preset' + id).value].text;
const newSeed = () => 1000 + crypto.getRandomValues(new Uint32Array(1))[0] % 9000;
const errorMessages = {
  typesafe_not_configured: 'На сервере не задан ключ TypeSafe. Jev недоступен.',
  typesafe_auth_failed: 'TypeSafe отклонил серверный ключ или доступ к модели.',
  typesafe_network_error: 'Сервер не смог соединиться с TypeSafe. Ход не выполнен.',
  typesafe_timeout: 'TypeSafe не ответил вовремя. Ход не выполнен.',
  typesafe_unavailable: 'TypeSafe сейчас недоступен. Ход не выполнен.',
  invalid_model_response: 'Ответ модели не прошёл проверку допустимых решений. Ход не выполнен.',
  typesafe_rate_limited: 'TypeSafe ограничил частоту запросов. Повтори ход позже.',
  local_rate_limited: 'Сработал лимит защиты расходов. Повтори ход через несколько секунд.',
  access_denied: 'Неверный пароль доступа к игре. Это не ключ TypeSafe.',
  deployment_access_token_required: 'На хостинге нужно задать отдельный пароль DUEL_ACCESS_TOKEN.',
};
function showError(message) { $('error').textContent = message; $('error').hidden = false; }
function hideError() { $('error').hidden = true; }
function reset(seed = newSeed()) {
  epoch++; controller?.abort(); controller = null;
  state = makeGame(seed); mode = $('mode').value;
  auto = frozen = busy = false; animation = null; decisions = [null, null]; records = []; lastTrace = [];
  requests = lastLatency = 0; nextAt = 0;
  $('result').hidden = true; hideError(); $('narration').textContent = 'Выбери доктрины и начни дуэль.';
  $('log').replaceChildren(); const p = document.createElement('p'); p.className = 'empty-log'; p.textContent = 'Здесь появятся выстрелы, промахи и смены тактики.'; $('log').append(p);
  update();
}
function update() {
  $('turn').replaceChildren(document.createTextNode(String(state.turn).padStart(2, '0') + ' '));
  const small = document.createElement('small'); small.textContent = '/ 32'; $('turn').append(small);
  $('turn').dataset.turn = state.turn;
  $('sector').textContent = state.seed;
  $('wind').textContent = `ВЕТЕР ${state.wind < 0 ? '←' : state.wind > 0 ? '→' : '·'} ${Math.abs(state.wind)}`;
  $('phase').textContent = state.ended ? 'ДУЭЛЬ ОКОНЧЕНА' : busy ? 'JEV ВЫБИРАЕТ' : frozen ? 'ПАУЗА' : `ХОД: ${state.tanks[state.active].name}`;
  $('source').textContent = mode === 'jev' ? records.length ? 'JEV × JEV · LIVE' : 'JEV × JEV · ОЖИДАНИЕ' : 'ДЕМО · НЕ JEV';
  $('source').classList.toggle('live', mode === 'jev');
  $('play').textContent = auto ? 'Ⅱ Пауза' : state.ended ? '↻ Новая дуэль' : frozen || state.turn ? '▶ Продолжить' : mode === 'demo' ? '▶ Начать демодуэль' : '▶ Начать дуэль';
  $('step').disabled = busy || state.ended || Boolean(animation && !frozen) || auto;
  $('export').disabled = records.length === 0;
  $('latency').textContent = mode === 'jev' ? `${requests} запросов${lastLatency ? ' · ' + lastLatency + ' мс' : ''}` : 'Локальное демо · без API';
  $('access-box').hidden = !config.accessRequired || mode !== 'jev';
  for (const id of [0, 1]) {
    const t = state.tanks[id], d = decisions[id];
    $('hp' + id).textContent = Math.round(t.hp); $('bar' + id).style.width = t.hp + '%';
    $('shield' + id).textContent = t.shield ? ` +${t.shield} ЩИТ` : '';
    $('role' + id).textContent = DOCTRINES[$('preset' + id).value].title;
    $('stock' + id).replaceChildren();
    for (const [label, value] of [['Фугас', t.heavy], ['Землерой', t.drill], ['Ремонт', t.repairs], ['Щит', t.cells], ['Топливо', t.fuel]]) {
      const span = document.createElement('span'), b = document.createElement('b'); span.textContent = label; b.textContent = value; span.append(b); $('stock' + id).append(span);
    }
    $('order' + id).replaceChildren(document.createTextNode(d ? ACTIONS[d.action] : 'Пока без приказа'));
    const detail = document.createElement('span');
    detail.textContent = d ? (WEAPONS[d.action] ? `${d.angle}° · мощность ${d.power}` : 'Без выстрела в этом ходу') + (d.danger !== null ? ` · опасность ${d.danger.toFixed(1)}/4` : '') : 'Первый ход ещё впереди';
    $('order' + id).append(detail);
    $('confidence' + id).textContent = d?.source === 'jev' ? `ВЫБОР: ${Math.round(d.confidence * 100)}%` : d ? 'ЛОКАЛЬНЫЙ БОТ' : 'ОЖИДАНИЕ';
    $('prob' + id).replaceChildren();
    if (d?.probabilities) for (const [action, probability] of Object.entries(d.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 3)) {
      const row = document.createElement('div'), label = document.createElement('span'), track = document.createElement('div'), bar = document.createElement('i'), percent = document.createElement('span');
      row.className = 'row'; track.className = 'track'; label.textContent = ACTIONS[action]; percent.textContent = Math.round(probability * 100) + '%'; bar.style.width = clamp(probability * 100, 0, 100) + '%'; track.append(bar); row.append(label, track, percent); $('prob' + id).append(row);
    } else if (d) { const note = document.createElement('span'); note.className = 'demo-note'; note.textContent = 'Демо: вероятности модели отсутствуют.'; $('prob' + id).append(note); }
  }
}
async function takeTurn() {
  if (busy || animation || state.ended || (mode === 'jev' && performance.now() < nextApiAt)) return;
  const myEpoch = epoch, actor = state.active, doctrine = $('doctrine' + actor).value.trim();
  if (!doctrine) { auto = false; showError('Задай доктрину командиру перед ходом.'); update(); return; }
  busy = true; hideError(); update();
  $('narration').textContent = `${state.tanks[actor].name}: ${mode === 'jev' ? 'Jev выбирает тактику…' : 'локальный бот выбирает ход…'}`;
  try {
    let decision;
    if (mode === 'jev') {
      if (!config.configured) throw new Error('typesafe_not_configured');
      const access = $('access').value.trim();
      if (access.startsWith('apikey_')) throw new Error('В поле пароля нужен пароль игры, не API-ключ. Ключ TypeSafe хранится только на сервере.');
      controller = new AbortController();
      const currentController = controller;
      const timer = setTimeout(() => currentController.abort(), 9000);
      requests++; nextApiAt = performance.now() + 3000;
      try {
        const response = await fetch('/api/decision', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(access ? { Authorization: `Bearer ${access}` } : {}) }, body: JSON.stringify({ game: state, doctrine }), signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'typesafe_unavailable');
        if (body.source !== 'jev') throw new Error('invalid_model_response');
        decision = body;
      } finally { clearTimeout(timer); }
    } else decision = demoDecision(state, $('preset' + actor).value);
    if (myEpoch !== epoch) return;
    // This also rejects out-of-menu action/aim values on the client.
    const resolved = resolveTurn(state, decision), aim = aimOptions(state).find(a => a.id === decision.aim);
    decisions[actor] = { ...decision, angle: aim?.angle ?? 45, power: aim?.power ?? 0 };
    lastLatency = decision.latency_ms;
    animation = { ...resolved, elapsed: 0, duration: resolved.event.path.length ? clamp(resolved.event.path.length / 55, 1.2, 3.7) : .85, decision, doctrine };
    $('narration').textContent = `${state.tanks[actor].name}: ${ACTIONS[decision.action]}${WEAPONS[decision.action] ? ` · ${aim.angle}° / ${aim.power}` : ''}`;
  } catch (error) {
    if (myEpoch !== epoch) return;
    auto = false; frozen = false;
    showError((errorMessages[error.message] || (error.name === 'AbortError' ? 'Запрос отменён или истёк таймаут.' : 'Не удалось выполнить ход: ' + error.message)) + ' Скрытого переключения на бота нет.');
    $('narration').textContent = 'Бой остановлен. Можно повторить ход или начать отдельное демо.';
  } finally { if (myEpoch === epoch) { busy = false; controller = null; update(); } }
}
function completeAnimation() {
  const a = animation, event = a.event; state = a.state; lastTrace = event.path;
  records.push({ decision: a.decision, doctrine: a.doctrine, event: { ...event, path: undefined } });
  animation = null; nextAt = performance.now() + (mode === 'jev' ? 900 : 650);
  const enemyDamage = event.damage[1 - event.actor], ownDamage = event.damage[event.actor];
  const outcome = WEAPONS[event.action] ? enemyDamage ? `−${enemyDamage} брони` : 'Промах' : event.action === 'repair' ? '+26 брони' : event.action === 'shield' ? '+32 щита' : 'Новая позиция';
  const log = $('log'); log.querySelector('.empty-log')?.remove();
  const row = document.createElement('div'); row.className = `log-row ${event.actor === 0 ? 'teal' : 'amber'}`;
  for (const [css, text] of [['number', String(event.turn).padStart(2, '0')], ['actor', state.tanks[event.actor].name], ['', ACTIONS[event.action] + (event.angle ? ` · ${event.angle}° / ${event.power}` : '')], ['outcome', outcome]]) { const span = document.createElement('span'); span.className = css; span.textContent = text; row.append(span); }
  log.prepend(row);
  $('narration').textContent = `${state.tanks[event.actor].name}: ${outcome}${ownDamage ? ` · себе −${ownDamage}` : ''}${state.turn > 24 ? ' · БУРЯ' : ''}`;
  if (state.ended) {
    auto = false; $('result').hidden = false;
    $('winner').textContent = state.winner === 'draw' ? 'НИЧЬЯ' : state.tanks[state.winner].name + ' ПОБЕЖДАЕТ';
    $('result-detail').textContent = `${state.turn} ходов · ${mode === 'jev' ? 'решения TypeSafe Jev' : 'демо, локальные боты'} · карта ${state.seed}`;
  }
  update();
}
function frame(time) {
  const dt = Math.min((time - lastTime) / 1000, .06); lastTime = time;
  if (animation && !frozen) {
    animation.elapsed += dt * Number($('speed').value);
    if (animation.elapsed > animation.duration + .65) completeAnimation();
  }
  renderer.draw(state, animation, decisions, time, lastTrace);
  if (auto && !document.hidden && !busy && !animation && !state.ended && time > nextAt) void takeTurn();
  requestAnimationFrame(frame);
}
$('play').addEventListener('click', () => { if (state.ended) reset(); auto = !auto; frozen = !auto; update(); });
$('step').addEventListener('click', () => { auto = false; frozen = false; if (!animation) void takeTurn(); update(); });
$('reset').addEventListener('click', () => reset());
$('rematch').addEventListener('click', () => { reset(); auto = true; update(); });
$('mode').addEventListener('change', () => reset(state.seed));
for (const id of [0, 1]) $('preset' + id).addEventListener('change', () => { $('doctrine' + id).value = DOCTRINES[$('preset' + id).value].text; update(); });
$('export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ format: 'jev-tank-duel/v1', seed: state.seed, mode, finished: state.ended, winner: state.winner, turns: records }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = `tank-duel-${state.seed}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { auto = false; frozen = true; update(); } });
window.addEventListener('keydown', e => { if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) { e.preventDefault(); $('play').click(); } });
update(); requestAnimationFrame(frame);
try {
  const response = await fetch('/api/decision', { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error('config');
  config = await response.json();
  $('mode').querySelector('[value="jev"]').disabled = !config.configured;
  if (config.configured && !state.turn && !busy && !animation && !auto) { mode = 'jev'; $('mode').value = 'jev'; }
  $('mode-note').textContent = config.configured ? 'Сервер настроен. Связь проверится на первом ходе.' : config.deploymentLocked ? 'Хостинг закрыт: настрой пароль доступа.' : 'Сервер не настроен. Демо работает без ключа.';
} catch { $('mode-note').textContent = 'API недоступен. Доступен только деморежим.'; }
update();
