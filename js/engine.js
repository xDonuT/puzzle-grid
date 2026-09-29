// ---- Pure board-logic engine ----
    // Extracted from board.js: match detection, shape analysis, and valid-move
    // checks. No DOM, audio, or particle coupling — operates purely on the
    // grid state plus ROWS/COLS/MIN_MATCH (settings.js). Loaded before board.js.
    //
    // These use the shared globals `board` (board.js), `ROWS`/`COLS`/`MIN_MATCH`
    // (settings.js), and `combat.boundTiles` (combat.js). They are only called
    // after all scripts have loaded, so declaration order is safe.

    // ---------- match detection (PERF REV: pooled scratch, zero per-call allocs) ----------
    // findMatches/hasValidMove reuse module-level Uint8Array scratch so the ~84
    // calls per deadlock check and ~250 per enemy turn stop allocating GC objects.
    // CONTRACT: the returned `mark` is a pooled buffer and is clobbered by the
    // next findMatches() call — every existing caller consumes it synchronously
    // before the next call, so this is safe. `mark` falsy/truthy reads and the
    // expansion writes in resolveBoard() behave identically on Uint8Array 0/1.

    let _markPool = null;     // Array[ROWS] of Uint8Array(COLS)
    function _ensureMark() {
      if (_markPool && _markPool.length === ROWS) return;
      _markPool = new Array(ROWS);
      for (let r = 0; r < ROWS; r++) _markPool[r] = new Uint8Array(COLS);
    }
    function _clearMark() {
      for (let r = 0; r < ROWS; r++) _markPool[r].fill(0);
    }

    // Bound tiles arrive as a Set of "r,c" strings (combat.boundTiles). Flatten
    // them once per resolve into integer keys r*COLS+c so the ~2 membership probes
    // per cell never allocate a string. When no tiles are bound (common case) we
    // skip the whole check.
    function _boundIdx(boundSet) {
      const s = new Set();
      for (const k of boundSet) {
        const i = k.indexOf(",");
        s.add((+k.slice(0, i)) * COLS + (+k.slice(i + 1)));
      }
      return s;
    }

    // ---------- valid move check ----------
    // Tests every adjacent swap to see if any would create a match.
    // Called after cascades settle to detect deadlock.
    function hasValidMove() {
      _ensureMark();
      for (let r = 0; r < ROWS; r++) {
        const row = board[r];
        for (let c = 0; c < COLS; c++) {
          // Try swap right
          if (c + 1 < COLS) {
            const t = row[c]; row[c] = row[c+1]; row[c+1] = t;
            if (findMatches().any) { row[c+1] = row[c]; row[c] = t; return true; }
            row[c+1] = row[c]; row[c] = t;
          }
          // Try swap down
          if (r + 1 < ROWS) {
            const nr = board[r+1];
            const t = row[c]; row[c] = nr[c]; nr[c] = t;
            if (findMatches().any) { nr[c] = row[c]; row[c] = t; return true; }
            nr[c] = row[c]; row[c] = t;
          }
        }
      }
      return false;
    }

    // ---------- match detection ----------
    // Also collects runs of length >= 4 so we can spawn bloom specials
    function findMatches(g = board) {
      _ensureMark();
      _clearMark();
      const mark = _markPool;

      const boundSet = (typeof combat !== "undefined" && combat.boundTiles && combat.boundTiles.size) ? combat.boundTiles : null;
      const bIdx = boundSet ? _boundIdx(boundSet) : null;
      const isBound = bIdx ? (r, c) => bIdx.has(r * COLS + c) : () => false;

      const specialSpawns = []; // {r, c, type}
      let any = false;

      // Horizontal runs
      for (let r = 0; r < ROWS; r++) {
        const row = g[r];
        let n = 1;
        for (let c = 1; c <= COLS; c++) {
          if (c < COLS && row[c] !== null && row[c] === row[c-1] &&
              !isBound(r, c) && !isBound(r, c-1)) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r][c-1-k] = 1;
              if (n >= 4) {
                const mid = c - 1 - Math.floor((n - 1) / 2);
                specialSpawns.push({ r, c: mid, type: row[mid], kind: "bloom" });
                // 5+ in a line: drop TWO bloom tiles so it visibly beats a 4-line
                if (n >= 5) {
                  const adj = Math.min(COLS - 1, mid + 1);
                  specialSpawns.push({ r, c: adj, type: row[adj], kind: "bloom" });
                }
              }
            }
            n = 1;
          }
        }
      }
      // Vertical runs
      for (let c = 0; c < COLS; c++) {
        let n = 1;
        for (let r = 1; r <= ROWS; r++) {
          if (r < ROWS && g[r][c] !== null && g[r][c] === g[r-1][c] &&
              !isBound(r, c) && !isBound(r-1, c)) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r-1-k][c] = 1;
              if (n >= 4) {
                const mid = r - 1 - Math.floor((n - 1) / 2);
                specialSpawns.push({ r: mid, c, type: g[mid][c], kind: "bloom" });
                // 5+ in a line: drop TWO bloom tiles so it visibly beats a 4-line
                if (n >= 5) {
                  const adj = Math.min(ROWS - 1, mid + 1);
                  specialSpawns.push({ r: adj, c, type: g[adj][c], kind: "bloom" });
                }
              }
            }
            n = 1;
          }
        }
      }
      return { mark, any, specialSpawns };
    }

    // ---------- shape analysis ----------
    // Shape analysis for combat multipliers
    // Charged: 4+ in a line → ×2
    // Star line: 5+ in a line → ×1.5 (charged takes priority if 4+)
    function analyzeShapes(mark, g = board) {
      let maxRun = 0;
      // Horizontal runs
      for (let r = 0; r < ROWS; r++) {
        let n = 0, prev = null;
        for (let c = 0; c <= COLS; c++) {
          const t = c < COLS && mark[r][c] ? g[r][c] : null;
          if (t && t === prev) n++;
          else {
            if (n >= MIN_MATCH) maxRun = Math.max(maxRun, n);
            n = t ? 1 : 0;
            prev = t;
          }
        }
      }
      // Vertical runs
      for (let c = 0; c < COLS; c++) {
        let n = 0, prev = null;
        for (let r = 0; r <= ROWS; r++) {
          const t = r < ROWS && mark[r][c] ? g[r][c] : null;
          if (t && t === prev) n++;
          else {
            if (n >= MIN_MATCH) maxRun = Math.max(maxRun, n);
            n = t ? 1 : 0;
            prev = t;
          }
        }
      }
      // Cross / T / L / +: cell that is in both a horizontal and vertical run of 3+
      let isCross = false;
      let crossCell = null;
      let crossKind = null;
      for (let r = 0; r < ROWS && !isCross; r++) {
        for (let c = 0; c < COLS && !isCross; c++) {
          if (!mark[r][c] || !g[r][c]) continue;
          const t = g[r][c];
          let h1 = 0, h2 = 0, v1 = 0, v2 = 0;
          for (let cc = c - 1; cc >= 0 && mark[r][cc] && g[r][cc] === t; cc--) h1++;
          for (let cc = c + 1; cc < COLS && mark[r][cc] && g[r][cc] === t; cc++) h2++;
          for (let rr = r - 1; rr >= 0 && mark[rr][c] && g[rr][c] === t; rr--) v1++;
          for (let rr = r + 1; rr < ROWS && mark[rr][c] && g[rr][c] === t; rr++) v2++;
          const h = h1 + h2 + 1, v = v1 + v2 + 1;
          if (h >= MIN_MATCH && v >= MIN_MATCH) {
            isCross = true;
            crossCell = { r, c };
            // L = corner (end of both arms), + = arms on all 4 sides, otherwise T
            const corner = (h1 === 0 || h2 === 0) && (v1 === 0 || v2 === 0);
            const plus = h1 > 0 && h2 > 0 && v1 > 0 && v2 > 0;
            crossKind = plus ? "plus" : corner ? "l" : "t";
          }
        }
      }

      let mult = 1;
      let tags = [];
      let charged = false;
      if (maxRun >= 4) {
        mult = 2;
        charged = true;
        tags.push(maxRun >= 5 ? "charged-star" : "charged");
      }
      if (isCross && mult < 2) {
        mult = Math.max(mult, 1.5);
        tags.push("cross");
      } else if (isCross && mult >= 2) {
        tags.push("cross");
      }
      if (!tags.length) tags.push("normal");
      return { mult, charged, isCross, crossCell, crossKind, maxRun, tags };
    }