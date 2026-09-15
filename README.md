# Bloom Tower 🌸

A match-3 combat tower-climb. Match tiles to attack the rival on the same board:
swords deal damage, shields block, hearts heal, stars charge your ultimate, and
mystery tiles roll the dice. Each hero — **Ninja**, **Wizard**, **Knight** —
plays through one signature tile type and a branching, STS-style act map up to
floor 45.

Built as a single-page vanilla JS game: no build step, no dependencies.

## Run it

Open `index.html` in any modern browser (touch + mouse supported). No server
required.

## Structure

| File | Role |
|---|---|
| `js/settings.js` | Global config, shared constants (`ROWS`/`COLS`/`AP_MAX`/`BASE_HP`/`MAX_FLOOR`), persistence. **Loads first.** |
| `js/audio.js` | WebAudio SFX + procedural BGM (initiates its own BGM listeners). |
| `js/board.js` | Board state (`board`, `specials`, `tileStatus`), matching, shapes, gravity, drag/swaps. |
| `js/enemies.js` | Enemy data/HP scaling, `run` state, upgrade/passive/blessing pools, `combat` object. |
| `js/map.js` | Branching act-map generation (pure, no DOM). |
| `js/ai.js` | Rival personalities + swap search. |
| `js/combat.js` | Turn engine: damage pipeline, statuses, enemy turn, FX budget. |
| `js/codex.js` | Bestiary/meta unlock, goblin-curse lore. |
| `js/main.js` | Screens/overlays, `startBattle`, reward pickers, save/load, victory/defeat. |
| `tests/` | Headless playtest suite (see below). |

## Load order

Script order in `index.html` is load-bearing: `settings → audio → board →
enemies → map → ai → combat → codex → main`. Shared constants live in
`settings.js` so every later file can rely on them.

## Testing

```sh
tests/run.sh        # needs Deno (https://deno.com)
```

Concatenates the game source + mocks into a single file and runs ~150 playtest
assertions: hero math (wizard reflect, knight fracture), battle log
classification, FX budget caps, map structure/connectivity, synthetic board
matching/shape analysis, and a full save→reset→load round-trip.

## Save data

Runs autosave to `localStorage` under `puzzleGridRun_v1`; settings under
`puzzleGridSettings_v1`. Use the **Continue** card on the menu to resume.