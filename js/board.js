    const COLORS = {
      sword:    { bg: "#c8d1db", icon: "#55606e" },
      shield:   { bg: "#9fc4e0", icon: "#3a6f9e" },
      hp:       { bg: "#e9a8b4", icon: "#b8435c" },
      star:     { bg: "#efd48a", icon: "#b89420" },
      question: { bg: "#c4b0e0", icon: "#6a4a9e" }
    };

    const ICONS = {
      sword: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <!-- Slash sword -->
        <path class="swd-blade" d="M19.5 4.5L13.27 13.27L10.73 10.73Z"/>
        <path class="swd-fuller" d="M17.6 6.4L13.3 10.7" fill="none"/>
        <path class="swd-guard-ink" d="M8 8L16 16" fill="none"/>
        <path class="swd-guard" d="M8 8L16 16" fill="none"/>
        <path class="swd-grip" d="M11.2 12.8L9.2 14.8" fill="none"/>
        <circle class="swd-pommel" cx="8.7" cy="15.3" r="1.7"/>
        <circle class="swd-jewel" cx="8.7" cy="15.3" r="0.75"/>
        <circle class="swd-blood" cx="20.15" cy="3.95" r="1"/>
        <circle class="swd-blood" cx="20.75" cy="3.45" r="0.55"/>
        <circle class="swd-blood" cx="21.15" cy="3.15" r="0.35"/>
        <circle class="swd-blood" cx="17.4" cy="6.9" r="0.5"/>
      </svg>`,
      shield: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <!-- Shield -->
        <path class="shd-rim" d="M12 2.8L5.5 5.7v5.6c0 4.7 3.2 8.2 6.5 9.6 3.3-1.4 6.5-4.9 6.5-9.6V5.7L12 2.8z"/>
        <path class="shd-face" d="M12 5.6L8.2 7.4v4.3c0 2.8 1.8 5 3.8 5.9 2-0.9 3.8-3.1 3.8-5.9V7.4L12 5.6z"/>
      </svg>`,
      hp: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <!-- Heal potion -->
        <rect class="pot-glass" x="9.4" y="4.4" width="5.2" height="5.2" rx="1.1"/>
        <rect class="pot-glass" x="5" y="8.8" width="14" height="11.5" rx="4"/>
        <rect class="pot-cork" x="10.1" y="2.2" width="3.8" height="2.6" rx="0.8"/>
        <rect class="pot-liquid" x="6.6" y="11.2" width="10.8" height="7.6" rx="2.6"/>
        <path class="pot-heart" d="M12 16.8c-.7-.6-2.1-1.7-2.1-2.9 0-.85.65-1.35 1.3-1.35.38 0 .72.2.9.52.18-.32.52-.52.9-.52.65 0 1.3.5 1.3 1.35 0 1.2-1.4 2.3-2.1 2.9z"/>
      </svg>`,
      star: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l2.6 5.5 6 .7-4.5 4.2 1.2 5.9L12 16.2l-5.3 2.9 1.2-5.9-4.5-4.2 6-.7z"/>
      </svg>`,
      question: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <!-- Dice (mystery) -->
        <rect class="die-face" x="3.5" y="3.5" width="17" height="17" rx="3"/>
        <circle class="pip-b" cx="9" cy="9" r="1.6"/>
        <circle class="pip-r" cx="15" cy="9" r="1.6"/>
        <circle class="pip-b" cx="12" cy="12" r="1.6"/>
        <circle class="pip-r" cx="9" cy="15" r="1.6"/>
        <circle class="pip-b" cx="15" cy="15" r="1.6"/>
      </svg>`,
      fracture: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path class="bone" d="M7.2 4.4c-1.7-.4-3.1 1-2.7 2.6.2.9.9 1.5 1.8 1.7.1.8.1 1.6.1 2.4 0 .7 0 1.4-.1 2.1-.9.2-1.6.8-1.8 1.7-.4 1.6 1 3 2.7 2.6.9-.2 1.5-.8 1.8-1.6.9.7 2 .9 3.2.9s2.3-.2 3.2-.9c.3.8.9 1.4 1.8 1.6 1.7.4 3.1-1 2.7-2.6-.2-.9-.9-1.5-1.8-1.7-.1-.7-.1-1.4-.1-2.1 0-.8 0-1.6.1-2.4.9-.2 1.6-.8 1.8-1.7.4-1.6-1-3-2.7-2.6-.9.2-1.5.8-1.8 1.6-.9-.7-2-.9-3.2-.9s-2.3.2-3.2.9c-.3-.8-.9-1.4-1.8-1.6z"/>
      </svg>`
    };

    const gridEl = document.getElementById("grid");
    const scoreEl = document.getElementById("score");
    const comboEl = document.getElementById("combo");
    const comboTextEl = document.getElementById("comboText");
    const boardWrapEl = document.querySelector(".board-wrap");

    function setComboTheater(level) {
      // Combo text personality + scale
      comboTextEl.classList.remove("level-2", "level-3", "level-4", "level-5", "show");
      if (level >= 2) {
        const labels = { 2: "Yay!", 3: "Eyyyy!", 4: "Ayoo!", 5: "Sheeesh!", 6: "Let's Gooo!", 7: "Godlike!!" };
        comboTextEl.textContent = labels[Math.min(level, 7)] || "Divine!";
        const lv = Math.min(level, 5);
        comboTextEl.classList.add("show", `level-${lv}`);
        if (level >= 4) shakeBoard("strong");
        else if (level >= 2) shakeBoard("light");
      }
      // Board wash / glow
      boardWrapEl.classList.remove("combo-glow-1", "combo-glow-2", "combo-glow-3", "combo-glow-4");
      if (level >= 5) boardWrapEl.classList.add("combo-glow-4");
      else if (level >= 4) boardWrapEl.classList.add("combo-glow-3");
      else if (level >= 3) boardWrapEl.classList.add("combo-glow-2");
      else if (level >= 2) boardWrapEl.classList.add("combo-glow-1");
      // Screen flash on big combos
      if (level >= 3) {
        boardWrapEl.classList.add("combo-flash");
        setTimeout(() => boardWrapEl.classList.remove("combo-flash"), 200);
      }
    }

    // Subtle-to-strong board shake for impact moments
    function shakeBoard(strength = "light") {
      const wrap = document.querySelector(".board-wrap");
      if (!wrap) return;
      wrap.classList.remove("shake", "shake-strong");
      void wrap.offsetWidth;
      wrap.classList.add(strength === "strong" ? "shake-strong" : "shake");
      setTimeout(() => wrap.classList.remove("shake", "shake-strong"), 480);
    }

    function clearComboTheater() {
      comboTextEl.classList.remove("show", "level-2", "level-3", "level-4", "level-5");
      boardWrapEl.classList.remove("combo-glow-1", "combo-glow-2", "combo-glow-3", "combo-glow-4");
    }

    let board = [];
    let specials = []; // parallel 2D grid – false, or kind: "bloom" | "cross" (T/+) | "x" (L)
    let cells = [];
    let score = 0;
    let combo = 0;
    let busy = false;
    let pointer = null; // {row, col, x, y, startX, startY}

    // ---------- Soft Web Audio ----------
    const rand = () => TYPES[Math.floor(Math.random() * TYPES.length)];
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const idx = (r, c) => r * COLS + c;

    function makeTile(type, r, c) {
      const el = document.createElement("div");
      el.className = "tile";
      el.dataset.type = type;
      el.dataset.row = r;
      el.dataset.col = c;
      el.innerHTML = ICONS[type];
      return el;
    }

    // Direction glyphs for seals (rendered in the tile's own icon color)
    const SEAL_ICONS = {
      cross: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </g>
        <g fill="currentColor">
          <path d="M12 3.2L9.7 8h4.6z"/>
          <path d="M12 20.8L9.7 16h4.6z"/>
          <path d="M3.2 12L8 9.7v4.6z"/>
          <path d="M20.8 12L16 9.7v4.6z"/>
        </g>
      </svg>`,
      x: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M6.5 6.5l11 11"/>
          <path d="M17.5 6.5l-11 11"/>
        </g>
        <g fill="currentColor">
          <path d="M5 5L9 5.5l-.5 4z"/>
          <path d="M19 19l-4-.5.5-4z"/>
          <path d="M19 5l-4 .5.5 4z"/>
          <path d="M5 19l4-.5-.5 4z"/>
        </g>
      </svg>`
    };

    function setType(el, type, kind) {
      el.dataset.type = type;
      el.innerHTML = (kind === "cross" || kind === "x") ? SEAL_ICONS[kind] : ICONS[type];
    }

    const SPECIAL_CLASS = { bloom: "special", cross: "seal-cross", x: "seal-x" };
    function specialClassFor(kind) {
      return SPECIAL_CLASS[kind] ? " " + SPECIAL_CLASS[kind] : "";
    }
    function setSpecialClass(el, kind) {
      el.classList.remove("special", "seal-cross", "seal-x");
      const cls = SPECIAL_CLASS[kind];
      if (cls) el.classList.add(cls);
    }

    function getCell(r, c) {
      return cells[idx(r, c)];
    }

    // ---------- particles (soft blob-like bursts) ----------
    function spawnParticles(r, c, type, comboLevel) {
      const el = getCell(r, c);
      const rect = el.getBoundingClientRect();
      const gridRect = gridEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2 - gridRect.left;
      const cy = rect.top + rect.height / 2 - gridRect.top;
      const color = COLORS[type]?.icon || "#c9b8a8";
      const softColor = COLORS[type]?.bg || "#e8e0d4";

      const cl = Math.min(comboLevel || 1, 5);
      const count = 8 + Math.floor(Math.random() * 5) + (cl - 1) * 3;
      const distMul = 1 + (cl - 1) * 0.18;
      const sizeMul = 1 + (cl - 1) * 0.1;
      const durMul = 1 + (cl - 1) * 0.08;
      for (let i = 0; i < count; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = (6 + Math.random() * 9) * sizeMul;
        p.style.width = size + "px";
        p.style.height = size + "px";
        p.style.background = i % 2 === 0 ? color : softColor;
        p.style.left = cx + "px";
        p.style.top = cy + "px";
        p.style.marginLeft = -size / 2 + "px";
        p.style.marginTop = -size / 2 + "px";
        p.style.borderRadius = "50%";
        p.style.filter = "blur(0.4px)";

        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.7;
        const dist = (22 + Math.random() * 32) * distMul;
        const tx = Math.cos(angle) * dist;
        const ty = Math.sin(angle) * dist - 8;

        gridEl.appendChild(p);

        const anim = p.animate([
          { transform: "translate(0,0) scale(0.9)", opacity: 0.85 },
          { transform: `translate(${tx * 0.6}px, ${ty * 0.5}px) scale(1.05)`, opacity: 0.7, offset: 0.35 },
          { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 }
        ], {
          duration: (420 + Math.random() * 200) * durMul,
          easing: "cubic-bezier(0.15, 0.75, 0.3, 1)",
          fill: "forwards"
        });

        anim.onfinish = () => p.remove();
      }
    }

    // Golden plus-flash marking the crossing tile of a T / L / + clear
    function spawnCrossFlash(r, c) {
      const el = getCell(r, c);
      const rect = el.getBoundingClientRect();
      const gridRect = gridEl.getBoundingClientRect();
      const fx = document.createElement("div");
      fx.className = "cross-flash";
      fx.style.left = rect.left + rect.width / 2 - gridRect.left + "px";
      fx.style.top = rect.top + rect.height / 2 - gridRect.top + "px";
      gridEl.appendChild(fx);
      const anim = fx.animate([
        { transform: "translate(-50%,-50%) scale(0.35) rotate(0deg)", opacity: 0.95 },
        { transform: "translate(-50%,-50%) scale(2.3) rotate(180deg)", opacity: 0 }
      ], { duration: 460, easing: "cubic-bezier(0.15, 0.75, 0.3, 1)", fill: "forwards" });
      anim.onfinish = () => fx.remove();
    }

    // ---------- build ----------
    function build() {
      gridEl.innerHTML = "";
      board = [];
      specials = [];
      cells = [];

      for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        specials[r] = [];
        for (let c = 0; c < COLS; c++) {
          let t;
          do { t = rand(); }
          while (
            (c >= 2 && board[r][c-1] === t && board[r][c-2] === t) ||
            (r >= 2 && board[r-1][c] === t && board[r-2][c] === t)
          );
          board[r][c] = t;
          specials[r][c] = false;
          const el = makeTile(t, r, c);
          cells.push(el);
          gridEl.appendChild(el);
        }
      }
    }

    // ---------- shuffle (preserves tile types AND specials) ----------
    function prefersReducedMotion() {
      return typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function shuffleBoard(opts = {}) {
      const oldFaces = [];
      for (let i = 0; i < cells.length; i++) oldFaces.push(cells[i].innerHTML);
      const flat = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          flat.push({ type: board[r][c], special: specials[r][c] });
        }
      }
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      let k = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          board[r][c] = flat[k].type;
          specials[r][c] = flat[k].special;
          k++;
        }
      }
      rebuildVisual();
      if (opts.animated === false || prefersReducedMotion()) return Promise.resolve();
      return flipCascade(oldFaces);
    }

    // Flip cascade: tiles flip like cards along a diagonal wave.
    // Old face shows until the 90° edge-on point, then swaps to the new face.
    function flipCascade(oldFaces) {
      return new Promise(resolve => {
        if (!cells.length || typeof cells[0].animate !== "function") { resolve(); return; }
        const DUR = 240, STEP = 18;
        const anims = [];
        for (let i = 0; i < cells.length; i++) {
          const el = cells[i];
          const delay = ((+el.dataset.row) + (+el.dataset.col)) * STEP;
          const newFace = el.innerHTML;
          if (oldFaces[i] === newFace) {
            // Same tile landed here — small nudge keeps the wave continuous
            anims.push(el.animate(
              [{ transform: "scale(1)" }, { transform: "scale(1.07)", offset: 0.5 }, { transform: "scale(1)" }],
              { duration: DUR, delay, easing: "ease-in-out" }
            ));
            continue;
          }
          el.innerHTML = oldFaces[i]; // start from the pre-shuffle face
          anims.push(el.animate(
            [
              { transform: "perspective(420px) rotateY(0deg)" },
              { transform: "perspective(420px) rotateY(90deg)", offset: 0.5 },
              { transform: "perspective(420px) rotateY(0deg)" }
            ],
            { duration: DUR, delay, easing: "ease-in-out" }
          ));
          setTimeout(() => { el.innerHTML = newFace; }, delay + DUR / 2);
        }
        Promise.all(anims.map(a => a.finished.catch(() => {}))).then(resolve);
        setTimeout(resolve, DUR + (ROWS + COLS) * STEP + 300); // safety net
      });
    }

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
    function findMatches() {
      const mark = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
      const specialSpawns = []; // {r, c, type}
      let any = false;

      // Horizontal runs
      for (let r = 0; r < ROWS; r++) {
        let n = 1;
        for (let c = 1; c <= COLS; c++) {
          if (c < COLS && board[r][c] === board[r][c-1] && board[r][c] !== null) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r][c-1-k] = true;
              if (n >= 4) {
                const mid = c - 1 - Math.floor((n - 1) / 2);
                specialSpawns.push({ r, c: mid, type: board[r][mid], kind: "bloom" });
                // 5+ in a line: drop TWO bloom tiles so it visibly beats a 4-line
                if (n >= 5) {
                  const adj = Math.min(COLS - 1, mid + 1);
                  specialSpawns.push({ r, c: adj, type: board[r][adj], kind: "bloom" });
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
          if (r < ROWS && board[r][c] === board[r-1][c] && board[r][c] !== null) n++;
          else {
            if (n >= MIN_MATCH) {
              any = true;
              for (let k = 0; k < n; k++) mark[r-1-k][c] = true;
              if (n >= 4) {
                const mid = r - 1 - Math.floor((n - 1) / 2);
                specialSpawns.push({ r: mid, c, type: board[mid][c], kind: "bloom" });
                // 5+ in a line: drop TWO bloom tiles so it visibly beats a 4-line
                if (n >= 5) {
                  const adj = Math.min(ROWS - 1, mid + 1);
                  specialSpawns.push({ r: adj, c, type: board[adj][c], kind: "bloom" });
                }
              }
            }
            n = 1;
          }
        }
      }
      return { mark, any, specialSpawns };
    }

    // Shape analysis for combat multipliers
    // Charged: 4+ in a line → ×2
    // Star line: 5+ in a line → ×1.5 (charged takes priority if 4+)
    // Cross: tile in both H and V match → ×1.5
    function analyzeShapes(mark) {
      let maxRun = 0;
      // Horizontal runs
      for (let r = 0; r < ROWS; r++) {
        let n = 0, prev = null;
        for (let c = 0; c <= COLS; c++) {
          const t = c < COLS && mark[r][c] ? board[r][c] : null;
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
          const t = r < ROWS && mark[r][c] ? board[r][c] : null;
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
          if (!mark[r][c] || !board[r][c]) continue;
          const t = board[r][c];
          let h1 = 0, h2 = 0, v1 = 0, v2 = 0;
          for (let cc = c - 1; cc >= 0 && mark[r][cc] && board[r][cc] === t; cc--) h1++;
          for (let cc = c + 1; cc < COLS && mark[r][cc] && board[r][cc] === t; cc++) h2++;
          for (let rr = r - 1; rr >= 0 && mark[rr][c] && board[rr][c] === t; rr--) v1++;
          for (let rr = r + 1; rr < ROWS && mark[rr][c] && board[rr][c] === t; rr++) v2++;
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

    // ---------- core loop ----------
    async function resolveBoard() {
      while (true) {
        let { mark, any, specialSpawns } = findMatches();
        if (!any) {
          combo = 0;
          comboEl.textContent = "0";
          clearComboTheater();
          break;
        }

        // Expand clear based on each matched special's kind
        // bloom → 3x3 · cross (T/+) → full row + column · x (L) → both diagonals
        const xDetonated = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const kind = specials[r][c];
            if (!(mark[r][c] && kind)) continue;
            const expand = (nr, nc) => {
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !mark[nr][nc] && board[nr][nc]) {
                mark[nr][nc] = true;
              }
            };
            if (kind === "bloom") {
              for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++) expand(r + dr, c + dc);
            } else if (kind === "cross") {
              for (let nr = 0; nr < ROWS; nr++) expand(nr, c);
              for (let nc = 0; nc < COLS; nc++) expand(r, nc);
            } else if (kind === "x") {
              for (let k = 0; k < ROWS; k++) { expand(r - k, c - k); expand(r + k, c + k); }
              for (let k = 0; k < ROWS; k++) { expand(r - k, c + k); expand(r + k, c - k); }
              xDetonated.push({ r, c });
            }
          }
        }

        combo++;
        comboEl.textContent = combo;

        let count = 0;
        const matchedList = [];
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (mark[r][c]) {
              count++;
              matchedList.push({ r, c, type: board[r][c], wasSpecial: specials[r][c] });
            }
          }
        }

        const shape = analyzeShapes(mark);
        shape.apRefund = !!((shape.isCross && shape.crossKind !== "l") || xDetonated.length > 0);
        shape.comboLevel = combo; // current cascade depth for combat hooks
        // First Strike modifier: first player match is charged
        if (combat.playerTurn && combat.pendingChargedFirst && !shape.charged) {
          shape.charged = true;
          shape.mult = Math.max(shape.mult, 1.5);
          if (!shape.tags.includes("charged")) shape.tags.push("charged");
          combat.pendingChargedFirst = false;
        }
        applyMatchCombat(matchedList, false, shape);

        // Transformative upgrades (player turn only)
        if (combat.playerTurn) {
          // Cascade Refund: every cascade after the first refunds 1 AP, once per turn
          if (combo >= 2 && run.cascadeAp && !combat.cascadeApRefunded) {
            combat.cascadeApRefunded = true;
            combat.ap = Math.min(AP_MAX, combat.ap + 1);
            refreshCombatUI();
          }
          // Bloom Signature: detonating a Bloom gives +1 Signature charge per Bloom
          if (run.bloomCharge) {
            let blooms = 0;
            for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if (mark[r][c] && specials[r][c] === "bloom") blooms++;
              }
            }
            if (blooms > 0) {
              const before = combat.sigBank;
              combat.sigBank = Math.min(settings.ultMaxCharge, combat.sigBank + blooms);
              refreshCombatUI();
              if (before < settings.ultNeed && combat.sigBank >= settings.ultNeed) showUltReadyBanner();
            }
          }
        }

        // Shape AP refunds (player turn only) – charged 4-lines no longer refund AP
        if (combat.playerTurn) {
          const baseApGain = (shape.isCross && shape.crossKind !== "l" ? 1 : 0) + xDetonated.length;
          // Seal Mastery: seals refund 1 additional AP
          const apGain = baseApGain + (run.crossAp && baseApGain > 0 ? baseApGain : 0);
          if (apGain > 0) {
            combat.ap = Math.min(AP_MAX, combat.ap + apGain);
            refreshCombatUI();
          }
        }

        if (combo >= 2) {
          setComboTheater(combo);
          playCombo(combo);
        } else {
          playMatch(count);
        }

        // 1. Pre-match highlight + anticipation pause
        for (const { r, c } of matchedList) {
          getCell(r, c).classList.add("highlight");
        }
        await sleep(420);

        // 2. Particles + pop
        const comboClass = combo >= 4 ? "c4" : combo >= 3 ? "c3" : combo >= 2 ? "c2" : "";
        for (const { r, c, type } of matchedList) {
          const el = getCell(r, c);
          el.classList.remove("highlight");
          el.classList.add("matching");
          if (comboClass) el.classList.add(comboClass);
          spawnParticles(r, c, type, combo);
        }
        if (shape.isCross && shape.crossCell) {
          spawnCrossFlash(shape.crossCell.r, shape.crossCell.c);
        }
        await sleep(300);

        // 3. Clear matched (remember special spawns that aren't on cleared? they are on matched cells)
        // Filter special spawns: only keep if that cell was part of a 4+ run (it will be cleared, then we place special after gravity... 
        // Better: place specials after clear but before gravity on the cleared cell, then gravity carries them.
        const spawnsToPlace = [];
        for (const s of specialSpawns) {
          if (mark[s.r][s.c] && s.type) {
            spawnsToPlace.push(s);
          }
        }

        for (const { r, c } of matchedList) {
          board[r][c] = null;
          specials[r][c] = false;
          const el = getCell(r, c);
          el.classList.remove("matching", "special", "seal-cross", "seal-x");
          el.style.opacity = "0";
        }

        // Place bloom specials on cleared cells (center of 4+ runs) before gravity
        for (const s of spawnsToPlace) {
          board[s.r][s.c] = s.type;
          specials[s.r][s.c] = s.kind || "bloom";
          const el = getCell(s.r, s.c);
          setType(el, s.type, s.kind);
          setSpecialClass(el, specials[s.r][s.c]);
          el.style.opacity = "1";
          el.classList.remove("matching");
        }

        // Place a seal on the crossing cell of a cross clear (T/+ → row+col, L → diagonals)
        if (shape.isCross && shape.crossCell) {
          const { r, c } = shape.crossCell;
          if (specials[r][c] === false) {
            const entry = matchedList.find(m => m.r === r && m.c === c);
            if (entry) {
              const kind = shape.crossKind === "l" ? "x" : "cross";
              board[r][c] = entry.type;
              specials[r][c] = kind;
              const el = getCell(r, c);
              setType(el, entry.type, kind);
              setSpecialClass(el, kind);
              el.style.opacity = "1";
              el.classList.remove("matching");
            }
          }
        }

        await applyGravityAndFill();
      }
      // Deadlock: no existing matches and no valid swaps → auto-reshuffle
      if (!hasValidMove()) {
        shuffleBoard({ animated: false });
      }
    }

    async function applyGravityAndFill() {
      const drops = [];

      for (let c = 0; c < COLS; c++) {
        const stack = [];
        for (let r = ROWS - 1; r >= 0; r--) {
          if (board[r][c] !== null) {
            stack.push({ r, type: board[r][c], special: specials[r][c] });
          }
        }
        let write = ROWS - 1;
        // Clear column first
        for (let r = 0; r < ROWS; r++) {
          board[r][c] = null;
          specials[r][c] = false;
        }
        for (const item of stack) {
          if (item.r !== write) {
            drops.push({ fromR: item.r, toR: write, c, type: item.type, special: item.special });
          }
          board[write][c] = item.type;
          specials[write][c] = item.special;
          write--;
        }
      }

      const tileH = getCell(0, 0).offsetHeight;
      const gap = parseFloat(getComputedStyle(gridEl).gap) || 8;
      const step = tileH + gap;

      for (const d of drops) {
        const el = getCell(d.fromR, d.c);
        el.classList.add("falling");
        // Stretch while falling for weight
        const dy = (d.toR - d.fromR) * step;
        el.style.transform = `translateY(${dy}px) scale(0.94, 1.08)`;
      }

      await sleep(drops.length ? 360 : 40);
      rebuildVisual();

      // Landing squash on tiles that fell
      const landed = [];
      for (const d of drops) {
        const el = getCell(d.toR, d.c);
        el.classList.add("landing");
        landed.push(el);
      }
      if (landed.length) {
        await sleep(280);
        landed.forEach(el => el.classList.remove("landing"));
      }

      const newEls = [];
      for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
          if (board[r][c] === null) {
            board[r][c] = rand();
            specials[r][c] = false;
            const el = getCell(r, c);
            setType(el, board[r][c]);
            setSpecialClass(el, false);
            el.style.opacity = "1";
            el.classList.add("spawning");
            newEls.push(el);
          } else {
            getCell(r, c).style.opacity = "1";
          }
        }
      }

      if (newEls.length) playPop(0.7, 0.4);
      await sleep(newEls.length ? 290 : 40);
      newEls.forEach(el => el.classList.remove("spawning"));
    }

    function rebuildVisual() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const el = getCell(r, c);
          el.className = "tile" + specialClassFor(specials[r][c]);
          el.style.transform = "";
          el.style.opacity = board[r][c] ? "1" : "0";
          el.dataset.row = r;
          el.dataset.col = c;
          if (board[r][c]) setType(el, board[r][c], specials[r][c]);
        }
      }
    }

    // ---------- swap ----------
    async function trySwap(r1, c1, r2, c2) {
      if (busy || !combat.playerTurn) return;
      if (combat.ap <= 0) return;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

      busy = true;
      try {
      playSwap();

      const el1 = getCell(r1, c1);
      const el2 = getCell(r2, c2);
      const tileH = el1.offsetHeight;
      const gap = parseFloat(getComputedStyle(gridEl).gap) || 8;
      const step = tileH + gap;
      const dx = (c2 - c1) * step;
      const dy = (r2 - r1) * step;

      el1.classList.add("swapping");
      el2.classList.add("swapping");
      el1.style.transform = `translate(${dx}px, ${dy}px)`;
      el2.style.transform = `translate(${-dx}px, ${-dy}px)`;
      await sleep(210);

      const tmp = board[r1][c1];
      board[r1][c1] = board[r2][c2];
      board[r2][c2] = tmp;
      const tmpSp = specials[r1][c1];
      specials[r1][c1] = specials[r2][c2];
      specials[r2][c2] = tmpSp;

      el1.classList.remove("swapping");
      el2.classList.remove("swapping");
      el1.style.transform = "";
      el2.style.transform = "";
      setType(el1, board[r1][c1], specials[r1][c1]);
      setType(el2, board[r2][c2], specials[r2][c2]);
      setSpecialClass(el1, specials[r1][c1]);
      setSpecialClass(el2, specials[r2][c2]);

      const { any } = findMatches();
      if (any) {
        // Blitz passive: first match each turn is free
        if (run.blitz && !combat._blitzUsedThisTurn) {
          combat._blitzUsedThisTurn = true;
        } else {
          combat.ap = Math.max(0, combat.ap - 1);
        }
        refreshCombatUI();
        await resolveBoard();
      } else {
        await sleep(50);
        el1.classList.add("swapping");
        el2.classList.add("swapping");
        el1.style.transform = `translate(${dx}px, ${dy}px)`;
        el2.style.transform = `translate(${-dx}px, ${-dy}px)`;
        await sleep(180);

        board[r2][c2] = board[r1][c1];
        board[r1][c1] = tmp;
        specials[r2][c2] = specials[r1][c1];
        specials[r1][c1] = tmpSp;

        el1.classList.remove("swapping");
        el2.classList.remove("swapping");
        el1.style.transform = "";
        el2.style.transform = "";
        setType(el1, board[r1][c1], specials[r1][c1]);
        setType(el2, board[r2][c2], specials[r2][c2]);
        setSpecialClass(el1, specials[r1][c1]);
        setSpecialClass(el2, specials[r2][c2]);
      }
      } finally {
        busy = false;
        refreshCombatUI();
      }
    }

    // ---------- gestures + drag visual ----------
    function tileAt(x, y) {
      const el = document.elementFromPoint(x, y);
      if (!el) return null;
      const t = el.closest(".tile");
      if (!t || t.dataset.row === undefined) return null;
      return { row: +t.dataset.row, col: +t.dataset.col, el: t };
    }

    function playPickup() {
      playGooeyPlop(0.75, 0.5);
      hapticLight();
    }

    function playDrop() {
      playGooeyPlop(0.6, 0.4);
      hapticDrop();
    }

    function applyDropEffect(el) {
      el.classList.remove("selected", "drag-preview");
      el.style.transform = "";
      el.classList.add("dropping");
      playDrop();
      setTimeout(() => el.classList.remove("dropping"), 360);
    }

    function clearPotentialHighlights() {
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          getCell(r, c).classList.remove("potential-match");
    }

    function showPotentialMatches(row, col) {
      clearPotentialHighlights();
      const type = board[row][col];
      if (!type) return;
      const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
      const matchedCells = new Set();
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (!board[nr][nc]) continue;
        const tmp = board[row][col]; board[row][col] = board[nr][nc]; board[nr][nc] = tmp;
        const { mark, any } = findMatches();
        board[nr][nc] = board[row][col]; board[row][col] = tmp;
        if (any) {
          for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
              if (mark[r][c]) matchedCells.add(r * COLS + c);
        }
      }
      matchedCells.delete(row * COLS + col);
      for (const idx of matchedCells) {
        const r = Math.floor(idx / COLS), c = idx % COLS;
        getCell(r, c).classList.add("potential-match");
      }
    }

    gridEl.addEventListener("pointerdown", e => {
      if (busy || combat.ap <= 0) return;
      const t = tileAt(e.clientX, e.clientY);
      if (!t) return;

      ensureAudio();

      pointer = {
        row: t.row,
        col: t.col,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY
      };
      t.el.classList.add("selected");
      showPotentialMatches(t.row, t.col);
      playPickup();
      e.preventDefault();
    });

    window.addEventListener("pointermove", e => {
      if (!pointer || busy) return;
      const el = getCell(pointer.row, pointer.col);
      const dx = e.clientX - pointer.startX;
      const dy = e.clientY - pointer.startY;

      // Follow + soft tilt so it feels like a physical piece in your hand
      const max = 34;
      const follow = 0.55;
      const clampedX = Math.max(-max, Math.min(max, dx * follow));
      const clampedY = Math.max(-max, Math.min(max, dy * follow));

      // Subtle rotation based on horizontal drag
      const tilt = Math.max(-9, Math.min(9, dx * 0.06));

      el.classList.add("drag-preview");
      el.style.transform = `translate(${clampedX}px, ${clampedY - 8}px) scale(1.14) rotate(${tilt}deg)`;
    });

    window.addEventListener("pointerup", e => {
      if (!pointer) return;
      const el = getCell(pointer.row, pointer.col);
      clearPotentialHighlights();

      const dx = e.clientX - pointer.x;
      const dy = e.clientY - pointer.y;
      const ax = Math.abs(dx), ay = Math.abs(dy);
      const th = 22;

      let tr = pointer.row, tc = pointer.col;
      let willSwap = false;

      if (ax > th || ay > th) {
        if (ax > ay) tc += dx > 0 ? 1 : -1;
        else tr += dy > 0 ? 1 : -1;

        if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) {
          willSwap = true;
        }
      }

      if (willSwap) {
        // Clean up hold state before swap animation takes over
        el.classList.remove("selected", "drag-preview");
        el.style.transform = "";
        trySwap(pointer.row, pointer.col, tr, tc);
      } else {
        // Soft drop back into place
        applyDropEffect(el);
      }

      pointer = null;
    });

    window.addEventListener("pointercancel", () => {
      if (pointer) {
        const el = getCell(pointer.row, pointer.col);
        clearPotentialHighlights();
        applyDropEffect(el);
        pointer = null;
      }
    });

    // Place a random special (bloom/cross/x) on a random non-special tile.
    // Called by combat.js for the "Tile Bloom" floor modifier.
    window.placeRandomSpecial = function placeRandomSpecial() {
      const kinds = ["bloom", "cross", "x"];
      const candidates = [];
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] && !specials[r][c]) candidates.push({ r, c });
        }
      }
      if (!candidates.length) return;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      specials[pick.r][pick.c] = kind;
      const el = getCell(pick.r, pick.c);
      setSpecialClass(el, kind);
    };

    // Count all tiles of a given type on the board.
    window.countTilesOfType = function countTilesOfType(type) {
      let count = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] === type) count++;
        }
      }
      return count;
    };

    // Consume (remove) all tiles of a given type, then gravity-fill the board.
    // Returns the number of tiles consumed.
    window.consumeTilesOfType = async function consumeTilesOfType(type) {
      let count = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] === type) {
            board[r][c] = null;
            specials[r][c] = false;
            count++;
            const el = getCell(r, c);
            el.className = "tile";
            el.style.opacity = "0";
          }
        }
      }
      if (count > 0) {
        await applyGravityAndFill();
      }
      return count;
    };

    // ---------- Phase 2: character SVGs (simple, cute, flat) ----------
