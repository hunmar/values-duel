# JEV ARENA

A small top-down survival game whose companion drone makes tactical decisions with **TypeSafe AI / Jev**.

The point of the project is to use Jev where it is strongest: not as a chatbot, but as a fast typed decision function inside an ordinary game loop.

## What Jev controls

Every ~900 ms the browser sends a compact structured snapshot of the arena to `/api/decision`. The server asks four questions in one `systemOne` call:

- `posture` — `engage | guard | scavenge | retreat` (`choice`)
- `target` — one of the currently visible enemy IDs or `none` (`choice`)
- `danger` — an ordered 0–4 tactical danger scale (`score`)
- `overdrive` — whether a scarce drone overdrive charge is worth spending (`noul`)

The rest of the game is deterministic JavaScript. Jev never returns arbitrary game commands or code.

A confidence gate is applied in the client: low-confidence posture decisions fall back to `guard`. If TypeSafe is unavailable or no API key is configured, the game keeps running with a local heuristic and labels the HUD `SIM FALLBACK`.

## Run the game

```bash
cd games/jev-arena
npm install
npm run dev
```

That starts the Vite frontend. Without the API route it runs in fallback mode.

For real Jev decisions, deploy this directory as the project root on Vercel and set:

```bash
TYPESAFE_API_KEY=ts_...
```

The API key is deliberately server-side. Do not put it in Vite client environment variables.

## Controls

- `WASD` / arrows — move
- mouse — aim
- left click / `Space` — fire
- `J` — toggle AI decision calls on/off
- `R` — restart after death

## Architecture

```text
browser game state
       │
       ▼
/api/decision (serverless)
       │
       ▼
TypeSafe Jev systemOne
       │
       ├─ choice: posture
       ├─ choice: target
       ├─ score: danger
       └─ noul: overdrive
       │
       ▼
typed probabilities → confidence gate → drone controller
```

Built as a self-contained project so it does not modify the existing `values-duel` application.
