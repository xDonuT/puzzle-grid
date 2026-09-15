#!/bin/sh
set -e
cd "$(dirname "$0")/.."
cat tests/mock.mjs js/utils.js js/settings.js js/audio.js js/engine.js js/board.js js/enemies.js js/map.js js/ai.js js/combat.js js/main.js tests/tests.mjs > /tmp/puzzle-grid-run.mjs
exec deno run /tmp/puzzle-grid-run.mjs