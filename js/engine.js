// ---- Pure board-logic engine ----
    // Extracted from board.js: match detection, shape analysis, and valid-move
    // checks. No DOM, audio, or particle coupling — operates purely on the
    // grid state plus ROWS/COLS/MIN_MATCH (settings.js). Loaded before board.js.
    //
    // These use the shared globals `board` (board.js), `ROWS`/`COLS`/`MIN_MATCH`
    // (settings.js), and `combat.boundTiles` (combat.js). They are only called
    // after all scripts have loaded, so declaration order is safe.

    // ---------- valid move check ----------
    // Tests every adjacent swap to see if any would create a match.
    // Called after cascades settle to detect deadlock.
    function hasValidMove() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          // Try swap right
          if (c + 1 < COLS) {
            const tmp = board[r][c]; board[r][c] = board[r][c+1]; board[r][c+1] = tmp;
            if (findMatches().any) { board[r][c+1] = board[r][c]; board[r][c] = tmp; return true; }
            board[r][c+1] = board[r][c]; board[r][c] = tmp;
          }
          // Try swap down
          if (r + 1 < ROWS) {
            const tmp = board[r][c]; board[r][c] = board[r+1][c]; board[r+1][c] = tmp;
            if (findMatches().any) { board[r+1][c] = board[r][c]; board[r][c] = tmp; return true; }
            board[r+1][c] = board[r][c]; board[r][c] = tmp;
          }
        }
      }
      return false;
    }

    // ---------- match detection ----------
    // Also collects runs of length >= 4 so we can spawn bloom specials
    function findMatches(g = board) {
      const mark = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      const specialSpawns = []; // {r, c, type}
      let any = false;
      const bound = (typeof combat !== "undefined" && combat.boundTiles) || new Set();

      // Horizontal runs
      for (let r = 0; r < ROWS; r++) {
        let n = 1;
        for (let c = 1; c <= COLS; c++) {
          if (c < COLS && g[r][c] === g[r][c-1] && g[r][c] !== null && !bound.has(r + "," + c) && !bound.has(r + "," + (c-1))) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r][c-1-k] = true;
              if (n >= 4) {
                const mid = c - 1 - Math.floor((n - 1) / 2);
                specialSpawns.push({ r, c: mid, type: g[r][mid], kind: "bloom" });
                // 5+ in a line: drop TWO bloom tiles so it visibly beats a 4-line
                if (n >= 5) {
                  const adj = Math.min(COLS - 1, mid + 1);
                  specialSpawns.push({ r, c: adj, type: g[r][adj], kind: "bloom" });
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
          if (r < ROWS && g[r][c] === g[r-1][c] && g[r][c] !== null && !bound.has(r + "," + c) && !bound.has((r-1) + "," + c)) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r-1-k][c] = true;
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
      } else if (maxRun >= 5) {
        mult = 1.5;
        tags.push("star");
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