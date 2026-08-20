#!/bin/sh
set -e
cd "$(dirname "$0")/.."
cat tests/mock.mjs js/settings.js js/audio.js js/board.js js/enemies.js js/ai.js js/combat.js js/main.js tests/tests.mjs > /tmp/puzzle-grid-run.mjs
exec deno run /tmp/puzzle-grid-run.mjs