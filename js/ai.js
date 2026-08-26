    // ---- AI personalities ----
    // Tile weights shape each archetype's play style. `shape` is risk
    // tolerance: how much the rival chases charged / star / cross clears vs
    // safe simple matches.
    const PERSONALITY = {
      bruiser: { sword: 1.7, star: 1.1, hp: 0.5, shield: 0.9, question: 0.3, shape: 1.35 },
      viper:   { sword: 1.3, star: 1.6, hp: 0.4, shield: 0.7, question: 0.3, shape: 1.1 },
      mender:  { sword: 0.4, star: 0.5, hp: 1.9, shield: 1.6, question: 0.2, shape: 0.8 },
      raider:  { sword: 1.3, star: 1.5, hp: 0.5, shield: 0.5, question: 0.3, shape: 1.6 },
      hexer:   { sword: 1.0, star: 1.3, hp: 0.6, shield: 1.4, question: 0.4, shape: 1.2 }
    };

    // Current tile-preference weights, layered: personality → class mirror →
    // elite/boss bias → signature hunger → special hunger.
    function enemyTileWeights() {
      const kit = combat.eliteKit || combat.bossKit;
      const arch = combat.enemyArchetype || {};
      const base = PERSONALITY[(kit && kit.persona)] || PERSONALITY[arch.id] || PERSONALITY.bruiser;
      const w = Object.assign({}, base);

      // Class mirror: counter the player's hero
      if (combat.playerClass === "ninja") { w.shield *= 1.5; w.hp *= 1.2; }        // block swords
      else if (combat.playerClass === "wizard") { w.sword *= 1.4; w.star *= 1.4; } // break shields
      else if (combat.playerClass === "knight") { w.sword *= 1.3; w.star *= 1.3; } // pressure HP

      // Elite / boss biases
      if (kit && kit.bias) {
        for (const t in kit.bias) w[t] = (w[t] || 1) * kit.bias[t];
      }

      // Signature hunger: enemy strongly prefers their signature tile type
      if (typeof getEnemySignature === "function") {
        const sig = getEnemySignature();
        if (sig && sig.primary && w[sig.primary] !== undefined) {
          w[sig.primary] *= 2.2;  // strong priority on signature tiles
        }
      }

      // Special hunger: with a special/ult nearly ready, push aggression
      const specialClose =
        (combat.bossKit && combat.enemyUltCharge >= combat.enemyUltNeed - 1) ||
        (!combat.bossKit && !combat.eliteKit &&
          combat.enemySpecialCharge > 0 && combat.enemySpecialCharge >= combat.enemySpecialNeed - 1);
      if (specialClose) { w.sword *= 1.25; w.star *= 1.25; w.shape *= 1.3; }

      return w;
    }

    function scoreMatchList(list, w) {
      let s = 0;
      let shields = 0;
      for (const { type } of list) {
        if (type === "sword") s += settings.swordDmg * 2 * (w.sword || 1);
        else if (type === "star") s += settings.starDmg * 2 * (w.star || 1);
        else if (type === "hp") s += settings.healAmt * (w.hp || 1);
        else if (type === "shield") shields++;
        else if (type === "question") s += 2 * (w.question || 0.3);
      }
      s += shieldFromCount(shields) * 3 * (w.shield || 1);
      s += list.length; // prefer bigger clears
      return s;
    }

    // Short human-readable strategy hint for the status chip
    function personalityStrategy() {
      const kit = combat.eliteKit || combat.bossKit;
      const arch = combat.enemyArchetype || {};
      const base = PERSONALITY[(kit && kit.persona)] || PERSONALITY[arch.id] || PERSONALITY.bruiser;
      const s = [];
      if ((base.sword || 1) + (base.star || 1) > 2.4) s.push("aggressive attacker");
      if ((base.hp || 1) >= 1.5) s.push("focused on healing");
      if ((base.shield || 1) >= 1.5) s.push("shield-heavy defense");
      if ((base.shape || 1) >= 1.4) s.push("chases big clears");
      return s.length ? s.join(", ") : "balanced";
    }

    function collectMatchesFromMark(mark) {
      const list = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (mark[r][c]) list.push({ r, c, type: board[r][c] });
      return list;
    }

    // Expand a match mark by the special tiles it contains (bloom 3×3, cross
    // row+col, x diagonals) — mirrors resolveBoard so hard AI sees detonations.
    function expandSpecialMark(mark) {
      const m = [];
      for (let r = 0; r < ROWS; r++) {
        m.push([]);
        for (let c = 0; c < COLS; c++) m[r][c] = !!mark[r][c];
      }
      const add = (r, c) => {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !m[r][c] && board[r][c]) m[r][c] = true;
      };
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!m[r][c]) continue;
          const kind = specials[r][c];
          if (kind === "bloom") {
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) add(r + dr, c + dc);
          } else if (kind === "cross") {
            for (let nr = 0; nr < ROWS; nr++) add(nr, c);
            for (let nc = 0; nc < COLS; nc++) add(r, nc);
          } else if (kind === "x") {
            for (let k = 0; k < ROWS; k++) { add(r - k, c - k); add(r + k, c + k); add(r - k, c + k); add(r + k, c - k); }
          }
        }
      }
      return m;
    }

    // Find best adjacent swap for current board (normal/hard AI)
    function findBestSwap() {
      const w = enemyTileWeights();
      const lookahead = settings.difficulty === "hard";
      let best = null;
      let bestScore = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const neighbors = [[r, c + 1], [r + 1, c]];
          for (const [nr, nc] of neighbors) {
            if (nr >= ROWS || nc >= COLS) continue;
            // swap
            const t = board[r][c]; board[r][c] = board[nr][nc]; board[nr][nc] = t;
            const { mark, any } = findMatches();
            if (any) {
              const m = lookahead ? expandSpecialMark(mark) : mark;
              const list = collectMatchesFromMark(m);
              const shape = analyzeShapes(m);
              let sc = scoreMatchList(list, w);
              // risk tolerance: chase charged / star / cross shapes
              if (shape.charged || (shape.tags && (shape.tags.includes("star") || shape.tags.includes("cross")))) {
                sc *= w.shape || 1;
              }
              if (sc > bestScore) {
                bestScore = sc;
                best = { r1: r, c1: c, r2: nr, c2: nc, score: sc };
              }
            }
            // revert
            board[nr][nc] = board[r][c]; board[r][c] = t;
          }
        }
      }
      return best;
    }

    function pickEnemyMove() {
      const diff = settings.difficulty;
      if (diff === "easy") {
        // pure random adjacent
        for (let tries = 0; tries < 20; tries++) {
          const r1 = Math.floor(Math.random() * ROWS);
          const c1 = Math.floor(Math.random() * COLS);
          const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          const d = dirs[Math.floor(Math.random() * 4)];
          const r2 = r1 + d[0], c2 = c1 + d[1];
          if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) return { r1, c1, r2, c2 };
        }
        return null;
      }
      // normal + hard: search for real matches with personality weights
      const best = findBestSwap();
      if (best) return best;
      // hard: if no match, still try a structured random
      if (diff === "hard") {
        for (let tries = 0; tries < 30; tries++) {
          const r1 = Math.floor(Math.random() * ROWS);
          const c1 = Math.floor(Math.random() * COLS);
          const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
          const d = dirs[Math.floor(Math.random() * 4)];
          const r2 = r1 + d[0], c2 = c1 + d[1];
          if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) return { r1, c1, r2, c2 };
        }
      }
      return null;
    }
