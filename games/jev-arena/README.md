# JEV / TANK DUEL

Two AI-controlled tanks, two editable doctrines, one deterministic artillery arena.
This pivots the earlier JEV ARENA drone shooter into a turn-based artillery duel.
The directory remains `games/jev-arena` so existing review/deployment paths stay stable.
The parent Taste Duel application is unchanged.

## Run

Node.js 22 or newer. No runtime or build dependencies and no installation required:

```sh
cd games/jev-arena
cp .env.example .env.local
# Set TYPESAFE_API_KEY in .env.local with your editor, never in client code.
npm run dev
```

Open `http://127.0.0.1:3000`. Without a key, an explicitly labelled local demo is available.
With a configured server, select **Jev × Jev**. A key's presence does not prove it is valid:
the first actual decision request checks connectivity and authorization.

```sh
npm test        # 29 tests, including 100 complete deterministic matches + replay
npm run build  # copies only public HTML/CSS/JS to dist; no package registry needed
npm run test:live # TWO real upstream calls, one per tank; uses your API allowance
```

Optional browser checks: install Python Playwright and Chromium, then run
`CHROMIUM=/path/to/chromium python test/browser-smoke.py`. The browser suite bundles
the actual client into an isolated page. Its API responses are fixtures, not live Jev.

## Play

Choose a preset for each commander and edit its doctrine. In real Jev mode the free-form
text influences the next turn. In demo mode only the preset affects the local controller.
The tanks act alternately; the seed determines who starts. Odd/even seeds alternate that advantage.

Actions: standard shell, heavy shell, digging shell, advance, retreat, repair, shield.
Each tank starts with 100 health, two heavy shells, two digging shells, two repairs,
two shields and four movement charges. Repair restores 26 health; a shield absorbs 32 damage.
All non-shooting actions consume a turn. Standard shells are unlimited.
Terrain is destructible, craters change positions vertically, and long falls damage tanks.
Wind stays fixed for two turns. From turn 25 both tanks take 6 storm damage after each action.
The match ends on a destroyed tank or after 32 turns, with remaining health as the tiebreaker.

Use **One turn**, **Start/Pause**, animation speed 1×/2×/4×, new-map reset, and JSON export.
Edits to a doctrine apply to the next request, not one already in flight.
Pausing stops simulation and new requests; an already submitted upstream call may still be billed.
Switching modes starts a fresh match: sources are never silently mixed.
Export contains the seed, per-turn doctrine, selected decisions and outcomes, not credentials.
The engine's `resolveTurn()` can replay those recorded decisions without further API calls.

## What Jev actually controls

Each turn goes through `POST /api/decision`, then exactly one
`POST https://api.typesafe.ai/v1/systemone` call with model `jev-latest` (overridable server-side).
The dependency-free HTTP adapter follows the official TypeSafe System One contract:

- `action`: a `choice` among the actions currently legal for this tank.
- `aim`: a `choice` among up to 20 coherent angle/power pairs.
- `danger`: a `score` from 0 to 4, displayed as a tactical assessment only.

The server provides the acting tank's doctrine, both tanks' public state, sampled terrain,
wind and the last eight public outcomes. It does not send the opponent's private doctrine.
Past misses are signed: positive is long, negative is short relative to firing direction.
This is context-based adaptation, not model training.

Aim candidates are centered on a windless range table, at 30/45/60/75 degrees and five
power corrections. It is an aiming aid, NOT an exact hit solver: the table omits wind,
obstacles and muzzle offset. Jev chooses the arc/correction; deterministic physics determines
collision, damage, craters and resource spending. The live model receives no predicted-hit oracle.
Only the clearly labelled demo controller runs a local trajectory search.

The displayed probabilities are model probabilities over **actions**, not hit probabilities
or independently validated tactical competence. No invented model reasoning is shown.
Returned labels, numeric bounds and choice distributions are validated at runtime.
Invalid or unavailable model responses STOP the duel. There is no hidden fallback to local AI.

## Architecture

- `src/engine.js`: seeded world, legal moves, aim menu, fixed-step physics, resolution, demo bot.
- `src/render.js`: Canvas landscape, tanks, zoomed flight trace, explosions and craters.
- `src/main.js`: controls, alternating API turns, pause, stale-response protection, replay export.
- `server/jev.js`: bounded state reconstruction, typed questions, fixed-origin HTTP adapter, response validation.
- `api/decision.js`: shared local/Vercel handler with access gate and cost limiter.
- `server/dev.js`: loopback-only development server, with an explicit public-file allowlist.

## Deploy

Import the repository into Vercel with **Root Directory `games/jev-arena`** and Node.js 22+.
`vercel.json` uses the dependency-free build and serves `dist` with the server-side API route.
Set `TYPESAFE_API_KEY` and a separate strong `DUEL_ACCESS_TOKEN` in the project's server
environment. On Vercel, paid inference fails closed without the access token. Players enter
that game password, never the provider key. Do not prefix the provider key with `VITE_`.

The browser requests no faster than once per 3 seconds. The handler additionally limits
to 24 requests/minute and 2 concurrent requests **per process**. This is NOT a durable,
distributed rate limiter. Keep a deployment private; a broad public release needs durable
rate limiting, account authentication and a provider spending cap.
Client-supplied game state is bounded and sanitized but not authoritative: this is a
spectator sandbox, not an anti-cheat multiplayer or leaderboard implementation.

## Verification and limits

Checked for this revision: build, all 29 Node tests, 100 seeded full demo matches,
local HTTP status/asset serving, and eight browser scenarios (demo turn, export, pause,
reset, error without fallback, stale-response rejection, mocked API turns for both tanks,
and mobile interaction). Browser runtime reported no JavaScript errors.

A live request was attempted, but the execution environment could not resolve the
TypeSafe API hostname. **Live Jev gameplay and the supplied key's validity are unverified.**
No public deployment was created. There are no credentials in this repository or its build.

Whether doctrines produce meaningfully different play is still an empirical question.
Evaluate the same seeds with swapped sides, compare decision/outcome logs, and only then
claim improvement over the local baseline.

## References

- Official TypeSafe JavaScript SDK / HTTP contract: https://github.com/typesafe-ai/typesafe-sdk-js
- TypeSafe: https://typesafe.ai
- Vercel Node functions: https://vercel.com/docs/functions/runtimes/node-js
