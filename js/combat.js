    // Bits that re-print a number already shown as a floating pop → keep out of the live line
    const skipNumericBit = (b) => (
      /^\d+ dmg$/.test(b) ||
      /^\+\d+ HP$/.test(b) ||
      /^\+\d+ shield \(\d+\)$/.test(b) ||
      /^\(\+\d+ dmg to enemy\)$/.test(b)
    );

    const logBarText = document.getElementById("logBarText");
    const actionLogBar = document.getElementById("actionLogBar");
    const actionLogModal = document.getElementById("actionLogModal");
    const actionLogClose = document.getElementById("actionLogClose");
    const actionLogScroll = document.getElementById("actionLogScroll");

    function pushLog(msg, detail) {
      const full = String(detail != null ? detail : msg);
      const entry = `[T${combat.turn}] ${full}`;
      combat.logHistory.push(entry);
      if (combat.logHistory.length > 400) combat.logHistory.shift();
      if (logBarText) logBarText.textContent = msg || full;
    }

    // Cap concurrent FX elements so big cascades stay cheap on mobile.
    // When the budget is exhausted, new elements are skipped (the stream thins
    // out) instead of piling up DOM nodes + animations.
    let activeFx = 0;
    const MAX_FX = 90;
    function fxSpawn() {
      if (activeFx >= MAX_FX) return null;
      activeFx++;
      return document.createElement("div");
    }
    function fxFree() { if (activeFx > 0) activeFx--; }

    // ─── Combat FX: particle-stream flight ───
    // Streams a swarm of small particles from `fromEl` to `toEl` (`kind` picks the
    // color: sword | star | shield | hp | poison | enemy | fracture). As they
    // converge on the target they assemble into the tile's icon, which flashes
    // briefly and then scatters (ring + sparks). Subtle by design.
    function flyEffect(fromEl, toEl, kind, opts) {
      if (!fromEl || !toEl) return;
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      if (fr.width === 0 || tr.width === 0) return; // off-screen / hidden

      const sx = fr.left + fr.width / 2;
      const sy = fr.top + fr.height / 2;
      const ex = tr.left + tr.width / 2;
      const ey = tr.top + tr.height / 2;
      const dx = ex - sx;
      const dy = ey - sy;
      const dist = Math.hypot(dx, dy);

      // Zero-distance (self-buff) → just pulse the target, no flight.
      if (dist < 8) {
        triggerHit(toEl);
        return;
      }

      // Perpendicular unit vector → gives the stream its converging spread
      const px = -dy / dist;
      const py = dx / dist;

      // Total timeline stays snappy (≈0.45–0.6s); ults are slightly slower for drama.
      const T = Math.min(600, Math.max(440, dist / 1.6)) * (opts && opts.mega ? 1.15 : 1);

      // Stream: colored motes leave the source staggered, drift toward the
      // impact point, and shrink to nothing right as they converge.
      const N = opts && opts.mega ? 40 : 16;
      const pSize = opts && opts.mega ? 28 : 12;
      for (let i = 0; i < N; i++) {
        const p = fxSpawn();
        if (!p) break;
        p.className = "fx-particle fx-particle-" + kind;
        p.style.left = sx + "px";
        p.style.top = sy + "px";
        p.style.width = pSize + "px";
        p.style.height = pSize + "px";
        if (opts && opts.mega) p.style.filter = "brightness(1.4) drop-shadow(0 0 6px rgba(255,255,255,0.5))";
        document.body.appendChild(p);
        const jit = (Math.random() * 2 - 1) * 16;
        const dur = T * (0.6 + Math.random() * 0.3);
        const delay = (i / N) * T * 0.4;
        const anim = p.animate(
          [
            { transform: `translate(-50%,-50%) translate(${px * jit}px, ${py * jit}px) scale(1)`, opacity: 1, offset: 0 },
            { transform: `translate(-50%,-50%) translate(${dx * 0.6 + px * jit * 0.2}px, ${dy * 0.6 + py * jit * 0.2}px)`, opacity: 1, offset: 0.6 },
            { transform: `translate(-50%,-50%) translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0, offset: 1 }
          ],
          { duration: dur, delay, easing: "cubic-bezier(0.3, 0.6, 0.4, 1)", fill: "forwards" }
        );
        anim.onfinish = () => { p.remove(); fxFree(); };
      }

      // The motes converge into the tile's icon: it pops in at the impact point,
      // holds a blink, then scatters outward.
      setTimeout(() => {
        const iconEl = fxSpawn();
        if (iconEl) {
          iconEl.className = "fx-proj fx-" + kind;
          iconEl.style.left = ex + "px";
          iconEl.style.top = ey + "px";
          if (ICONS[kind]) iconEl.innerHTML = ICONS[kind];
          document.body.appendChild(iconEl);
          iconEl.animate(
            [
              { transform: "translate(-50%,-50%) scale(0.2)", opacity: 0, offset: 0 },
              { transform: "translate(-50%,-50%) scale(1.6)", opacity: 1, offset: 0.5 },
              { transform: "translate(-50%,-50%) scale(1.2)", opacity: 1, offset: 0.72 },
              { transform: "translate(-50%,-50%) scale(1.8)", opacity: 0, offset: 1 }
            ],
            { duration: 400, easing: "ease-out", fill: "forwards" }
          ).onfinish = () => { iconEl.remove(); fxFree(); };
        }
        spawnImpactBurst(ex, ey, kind);
        triggerHit(toEl);
      }, T);
    }

    // Small radial ring + sparks at the impact point
    function spawnImpactBurst(x, y, kind) {
      const ring = fxSpawn();
      if (ring) {
        ring.className = "fx-burst fx-burst-" + kind;
        ring.style.left = x + "px";
        ring.style.top = y + "px";
        document.body.appendChild(ring);
        const ringAnim = ring.animate(
          [
            { transform: "translate(-50%, -50%) scale(0.4)", opacity: 0.5, offset: 0 },
            { transform: "translate(-50%, -50%) scale(2.1)", opacity: 0, offset: 1 }
          ],
          { duration: 320, easing: "cubic-bezier(0.2, 0.6, 0.35, 1)", fill: "forwards" }
        );
        ringAnim.onfinish = () => { ring.remove(); fxFree(); };
      }

      const N = 4;
      for (let i = 0; i < N; i++) {
        const a = (Math.PI * 2 * i) / N + Math.random() * 0.6;
        const d = 18 + Math.random() * 16;
        const p = fxSpawn();
        if (!p) break;
        p.className = "fx-particle fx-particle-" + kind;
        p.style.left = x + "px";
        p.style.top = y + "px";
        document.body.appendChild(p);
        const pAnim = p.animate(
          [
            { transform: `translate(-50%, -50%) translate(${Math.cos(a) * 3}px, ${Math.sin(a) * 3}px)`, opacity: 0.8, offset: 0 },
            { transform: `translate(-50%, -50%) translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`, opacity: 0, offset: 1 }
          ],
          { duration: 260 + Math.random() * 140, easing: "ease-out", fill: "forwards" }
        );
        pAnim.onfinish = () => { p.remove(); fxFree(); };
      }
    }

    function triggerHit(el) {
      if (!el) return;
      el.classList.remove("fx-shake", "fx-flash");
      void el.offsetWidth; // restart animation
      el.classList.add("fx-shake", "fx-flash");
      setTimeout(() => el.classList.remove("fx-shake", "fx-flash"), 450);
    }

    function classifyLog(text) {
      if (/Ultimate|Meteor|Earthshatter|Starfall/i.test(text)) return "ult";
      if (/Fracture|Sunder|Earthquake|Bulwark/i.test(text)) return "fracture";
      if (/Poison|☠|Miasma|Venom|Acid|Corrosive|Toxic/i.test(text)) return "poison";
      if (/to you|on you|Void Reflection/i.test(text)) return "taken";
      if (/Heal|\+\d+ HP|Shadow Strike/i.test(text)) return "heal";
      if (/shield|Shield|Arcane Nova|Mana Steal/i.test(text)) return "shield";
      if (/dmg|CRIT|\d+ true/i.test(text)) return "dmg";
      return "voice";
    }

    function refreshLogModal() {
      if (!actionLogScroll) return;
      const title = document.querySelector(".action-log-modal-title");
      if (title) title.textContent = `Action Log · Floor ${run.floor} · ${combat.logHistory.length} entries`;
      actionLogScroll.innerHTML = "";
      let currentTurn = null;
      for (const text of [...combat.logHistory].reverse()) {
        const m = text.match(/^\[T(\d+)\]\s*/);
        const turn = m ? Number(m[1]) : null;
        const body = m ? text.slice(m[0].length) : text;
        if (turn !== null && turn !== currentTurn) {
          currentTurn = turn;
          const head = document.createElement("div");
          head.className = "log-turn-head";
          head.textContent = `Turn ${turn}`;
          actionLogScroll.appendChild(head);
        }
        const el = document.createElement("div");
        el.className = "log-entry type-" + classifyLog(body);
        el.textContent = body;
        actionLogScroll.appendChild(el);
      }
      actionLogScroll.scrollTop = 0;
    }

    if (actionLogBar) {
      actionLogBar.addEventListener("click", () => {
        refreshLogModal();
        actionLogModal.classList.add("open");
      });
    }
    if (actionLogClose) {
      actionLogClose.addEventListener("click", () => {
        actionLogModal.classList.remove("open");
      });
    }
    if (actionLogModal) {
      actionLogModal.addEventListener("click", (e) => {
        if (e.target === actionLogModal) actionLogModal.classList.remove("open");
      });
    }

    // ---------- Dynamic trash-talk / voice lines ----------
    const VOICE = {
      floorStart: [
        "Another climber? Cute.",
        "The tower doesn’t care about your feelings.",
        "Try not to embarrass yourself.",
        "I’ve seen worse. Barely.",
        "Board’s ready. Are you?"
      ],
      weakTurn: [
        "Was that a strategy or a nap?",
        "My turn. Try to keep up.",
        "You blinked. I noticed.",
        "Save the dramatic pauses for the credits."
      ],
      bigHit: [
        "…Okay. Rude.",
        "Lucky tiles. Don’t get attached.",
        "Fine. You can have that one.",
        "That almost looked intentional."
      ],
      playerLow: [
        "One more nudge.",
        "You’re leaking. Fix it.",
        "The floor remembers the soft ones.",
        "Still standing? Temporary."
      ],
      enemyLow: [
        "Don’t get cocky.",
        "I’m not done talking.",
        "This is the part where you miss.",
        "Close only counts in horseshoes."
      ],
      playerUlt: [
        "—!",
        "Not the face.",
        "Okay. That one counted.",
        "Show-off.",
        "You spent it. Make it worth it."
      ],
      enemySpecial: [
        "Watch this.",
        "My turn to be dramatic.",
        "You left an opening. Rude of you.",
        "Tower rules. My rules."
      ],
      victory: [
        "Lucky board. Don’t get used to it.",
        "Fine. Climb. The next one talks more.",
        "You win the floor. Not the argument.",
        "Go. Before I change my mind."
      ],
      defeat: [
        "Tower 1, you 0.",
        "Same floor tomorrow?",
        "The board tried to help. You didn’t.",
        "Told you."
      ],
      classJab: {
        ninja: "Shadow tricks. How original.",
        wizard: "Sparkles aren’t a personality.",
        knight: "Armor’s cute. Try dodging next time."
      }
    };

    let voiceCooldown = 0; // skip voice for a few log pushes after a mechanical line if needed

    // Centered chat-style popup for trash-talk (temporary, auto-fades)
    let _bubble = null;
    function showSpeechBubble(line) {
      if (!line || typeof document === "undefined") return;
      if (_bubble) { _bubble.remove(); _bubble = null; }
      const b = document.createElement("div");
      b.className = "speech-bubble";
      b.textContent = line;
      b.style.left = "50%";
      b.style.top = "16%";
      document.body.appendChild(b);
      _bubble = b;
      const anim = b.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.85)", opacity: 0, offset: 0 },
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.15 },
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.82 },
          { transform: "translate(-50%, -50%) scale(0.95)", opacity: 0, offset: 1 }
        ],
        { duration: 3000, easing: "ease-out", fill: "forwards" }
      );
      anim.onfinish = () => { b.remove(); if (_bubble === b) _bubble = null; };
    }

    // Ninja Shadow Step prompt: shown when 4+ swords cleared this turn
    function showShadowStepPrompt() {
      return new Promise(resolve => {
        const ov = document.createElement("div");
        ov.className = "overlay open";
        ov.style.zIndex = "10001";
        ov.innerHTML = `
          <div class="overlay-panel" style="max-width:280px;text-align:center;padding:20px">
            <div style="font-size:1.4rem;font-weight:800;color:#2a3a5c;margin-bottom:10px">⚡ Shadow Step</div>
            <div style="font-size:0.9rem;color:#5a5048;margin-bottom:16px;line-height:1.5">Clear 4+ Swords this turn!<br><b>−3 HP</b> · <b>+1 extra swap</b><br><span style="font-size:0.72rem;color:#8a7e74">(once per turn)</span></div>
            <div style="display:flex;gap:10px;justify-content:center">
              <button type="button" class="action-btn primary" id="shadowStepYes" style="min-height:48px;min-width:100px;font-size:0.85rem;font-weight:700">Use it</button>
              <button type="button" class="action-btn" id="shadowStepNo" style="min-height:48px;min-width:100px;font-size:0.85rem;font-weight:700">Skip</button>
            </div>
          </div>`;
        document.body.appendChild(ov);
        const cleanup = (result) => { ov.remove(); resolve(result); };
        ov.querySelector("#shadowStepYes").addEventListener("click", () => cleanup(true));
        ov.querySelector("#shadowStepNo").addEventListener("click", () => cleanup(false));
      });
    }

    function pickVoice(arr) {
      if (!arr || !arr.length) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function sayVoice(category, opts = {}) {
      const { force = false, chance = 1, asLog = true } = opts;
      if (!force && Math.random() > chance) return null;
      if (voiceCooldown > 0 && !force) {
        voiceCooldown--;
        return null;
      }
      let line = null;
      if (category === "classJab") {
        line = VOICE.classJab[combat.playerClass] || null;
      } else {
        line = pickVoice(VOICE[category]);
      }
      if (!line) return null;
      showSpeechBubble(line);
      if (asLog) {
        combat.logHistory.push(line);
        if (combat.logHistory.length > 400) combat.logHistory.shift();
      }
      return line;
    }

    function maybePlayerLowVoice() {
      const pct = combat.playerHp / Math.max(1, combat.playerMaxHp);
      if (pct > 0 && pct <= 0.35) sayVoice("playerLow", { chance: 0.45, force: false });
    }

    function maybeEnemyLowVoice() {
      const pct = combat.enemyHp / Math.max(1, combat.enemyMaxHp);
      if (pct > 0 && pct <= 0.35) sayVoice("enemyLow", { chance: 0.4, force: false });
    }

    function diffStats() {
      // Everyone 100 HP; difficulty mainly affects AI + attack pressure
      if (settings.difficulty === "easy") return { hp: BASE_HP, atkMul: 0.75 };
      if (settings.difficulty === "hard") return { hp: BASE_HP, atkMul: 1.25 };
      return { hp: BASE_HP, atkMul: 1 };
    }

    function playerSignature() {
      return SIGNATURE[combat.playerClass] || "sword";
    }

    // Star phases (user-specified thresholds)
    // Normal 1–5 · Star Fever 6–10 · Star Impact 11+
    function getPhase() {
      if (combat.turn >= (settings.impactTurn || 11)) return "impact";
      if (combat.turn >= Math.max(2, (settings.feverTurn || 6) - (run.feverEarly || 0) - (combat.feverBoost || 0))) return "fever";
      return "normal";
    }

    function phaseLabel() {
      const p = getPhase();
      if (p === "fever") return "⭐ Star Fever";
      if (p === "impact") return "☄️ Star Impact";
      return "Normal";
    }

    function updatePhaseVisual() {
      const wrap = document.querySelector(".board-wrap");
      const p = getPhase();
      // One-time banner when a new phase kicks in mid-fight
      if (combat.lastPhase !== p) {
        const prev = combat.lastPhase;
        combat.lastPhase = p;
        if (prev === "normal" && p === "fever") showBannerCard("Phase Up", "⭐ Star Fever", "Signature tiles hit harder");
        else if (p === "impact") showBannerCard("Phase Up", "☄️ Star Impact", "Mystery tiles always buff");
      }
      document.body.classList.remove("phase-fever", "phase-impact");
      if (wrap) {
        wrap.classList.remove("phase-fever", "phase-impact");
        if (p === "fever") wrap.classList.add("phase-fever");
        else if (p === "impact") wrap.classList.add("phase-impact");
      }
      if (p === "fever") document.body.classList.add("phase-fever");
      else if (p === "impact") document.body.classList.add("phase-impact");

      const pill = document.getElementById("phasePill");
      if (pill) {
        pill.classList.remove("show", "fever", "impact");
        pill.style.cursor = "pointer";
        if (p === "fever") {
          pill.textContent = "⭐ Star Fever";
          pill.classList.add("show", "fever");
          pill.title = "Tap for event info";
        } else if (p === "impact") {
          pill.textContent = "☄️ Star Impact";
          pill.classList.add("show", "impact");
          pill.title = "Tap for event info";
        } else {
          pill.textContent = "";
          pill.title = "";
        }
      }
    }

    function showPhaseInfo() {
      const p = getPhase();
      const ft = Math.max(2, (settings.feverTurn || 6) - (run.feverEarly || 0) - (combat.feverBoost || 0));
      const it = settings.impactTurn || 11;
      if (p === "fever") {
        openStatusDetail(
          "⭐ Star Fever",
          `Active from turn ${ft}–${it - 1}.\n\n• Matching your signature tile is stronger (damage fully boosted; heals about +50%).\n• Board and background turn pastel yellow.\n• Plan signature clears for extra value.`
        );
      } else if (p === "impact") {
        openStatusDetail(
          "☄️ Star Impact",
          `Active from turn ${it} onward.\n\n• Mystery (🎲) tiles always give a buff — no debuffs.\n• Board and background turn pastel orange.\n• Safe to clear 🎲 tiles for heals, shield, charge, or empower.`
        );
      }
    }

    // Mystery tile (question) buffs / debuffs
    const MYSTERY_BUFFS = [
      { id: "heal", label: "Heal", apply: () => {
        const amt = 4 + Math.floor(Math.random() * 4); // 4–7
        const healed = applyHealing(amt);
        const dmgDealt = amt - healed;
        let text = `+${healed} HP`;
        if (dmgDealt > 0) text += ` (overflow: ${dmgDealt} to enemy)`;
        return text;
      }},
      { id: "shield", label: "Shield", apply: () => {
        const amt = 3 + Math.floor(Math.random() * 4); // 3–6
        const shielded = applyShielding(amt);
        const dmgDealt = amt - shielded;
        let text = `+${shielded} shield`;
        if (dmgDealt > 0) text += ` (overflow: ${dmgDealt} to enemy)`;
        return text;
      }},
      { id: "charge", label: "Charge", apply: () => {
        combat.sigBank = Math.min(settings.ultMaxCharge, combat.sigBank + 2);
        dmgPop("player", "+2 charge", "heal");
        return `+2 charge`;
      }},
      { id: "empower", label: "Empower", apply: () => {
        combat.empowerNext = true;
        dmgPop("player", "Empower!", "heal");
        return `next atk +50%`;
      }}
    ];
    const MYSTERY_DEBUFFS = [
      { id: "damage", label: "Damage", apply: () => {
        const amt = 3 + Math.floor(Math.random() * 4); // 3–6
        dealDamageToPlayer(amt, { noFracture: true });
        return `self ${amt} dmg`;
      }},
      { id: "poison", label: "Poison", apply: () => {
        combat.poisonTurns = Math.max(combat.poisonTurns || 0, 2);
        combat.enemyPoisonTurns = Math.max(combat.enemyPoisonTurns || 0, 2);
        dmgPop("player", "Poison!", "dmg");
        flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison");
        return `poison 2 turns`;
      }},
      { id: "blind", label: "Blind", apply: () => {
        combat.blindNext = true;
        dmgPop("player", "Blind!", "dmg");
        return `next atk -50%`;
      }},
      { id: "weaken", label: "Weaken", apply: () => {
        combat.weakenNextSword = true;
        dmgPop("player", "Weaken!", "dmg");
        return `next sword -2`;
      }}
    ];

    function rollMysteryEffect() {
      const phase = getPhase();
      // Lucky Dice: mystery tiles are 70% buffs before Star Impact (Impact is always a buff)
      // Mystic Insight: mystery tiles are 100% buffs
      const isBuff = run.mysticInsight || phase === "impact" || (run.luckyDice ? Math.random() < 0.7 : Math.random() < 0.5);
      let pool = isBuff ? MYSTERY_BUFFS : MYSTERY_DEBUFFS;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      let detail = pick.apply();
      // Phase Attunement: mystery gets the best buff during Star Impact (+1 charge)
      let extra = "";
      if (phase === "impact" && run.phasePower && isBuff) {
        combat.sigBank = Math.min(settings.ultMaxCharge, combat.sigBank + 1);
        extra = " +1 charge";
      }
      playDice();
      return { isBuff, label: pick.label, detail: detail + extra };
    }

    function renderPortrait(el, key, opts = {}) {
      const data = CHARACTERS[key];
      if (!el || !data) return;
      const badge = el.querySelector(".shield-badge");
      el.classList.remove(
        "ninja", "wizard", "knight", "enemy", "ult-ready",
        "eslime", "ebat", "emush", "egolem", "eskull",
        "c-bracken", "c-cinder", "c-ironjaw", "c-bloodroot", "c-stormglass",
        "c-nightcoil", "c-ashcrown", "c-umbral", "c-nox", "c-lastrival"
      );
      el.classList.add(data.role);
      el.innerHTML = characterSvg(key, opts.costume, opts.weapon);
      if (badge) el.appendChild(badge);
    }

    // Rebuild the status-chip row between HP and AP (tap a chip for details)
    function syncPortraitChips(el, chips) {
      if (!el) return;
      const combatant = el.closest ? el.closest(".combatant") : el.parentElement.parentElement;
      if (!combatant) return;
      const box = combatant.querySelector(".status-row");
      if (!box) return;
      box.innerHTML = chips.map(c => {
        const info = STATUS_INFO[c.key];
        const label = c.count > 0 ? `${c.emoji}<span class="status-num">${c.count}</span>` : c.emoji;
        return `<span class="status-icon ${c.key}" data-status="${c.key}" role="button" title="${info ? info.name : c.key}">${label}</span>`;
      }).join("");
      box.style.display = chips.length ? "" : "none";
      box.querySelectorAll(".status-icon").forEach(span => {
        span.addEventListener("click", e => {
          e.stopPropagation();
          const info = STATUS_INFO[span.dataset.status];
          if (!info) return;
          let extra = "";
          if (span.dataset.status === "arch" && combat.enemyArchetype) {
            extra = `\n\n${combat.enemyArchetype.label}: ${combat.enemyArchetype.passive}\nPlays: ${personalityStrategy()}`;
          }
          openStatusDetail(info.name, info.detail + extra);
        });
      });
    }

    function setupFighters() {
      renderPortrait(document.getElementById("playerPortrait"), combat.playerClass, {
        costume: settings.costume && settings.costume[combat.playerClass],
        weapon: settings.weapon && settings.weapon[combat.playerClass]
      });
      renderPortrait(document.getElementById("enemyPortrait"), combat.enemyClass);
      document.getElementById("playerName").textContent = CHARACTERS[combat.playerClass].name;
      document.getElementById("enemyName").textContent = CHARACTERS[combat.enemyClass].name;
    }

    const enemyHpText = document.getElementById("enemyHpText");
    const playerHpText = document.getElementById("playerHpText");
    const playerHpFill = document.getElementById("playerHpFill");
    const enemyHpFill = document.getElementById("enemyHpFill");
    const playerHeartHp = document.getElementById("playerHeartHp");
    const enemyHeartHp = document.getElementById("enemyHeartHp");
    const turnNumEl = document.getElementById("turnNum");
    const ultPipsEl = document.getElementById("ultPips");
    const apPipsEl = document.getElementById("apPips");
    const btnShuffle = document.getElementById("btnShuffle");
    const btnEnd = document.getElementById("btnEnd");
    const endWrap = document.getElementById("endWrap");
    const shieldBadgeEl = document.getElementById("shieldBadge");
    const playerPortraitEl = document.getElementById("playerPortrait");
    const enemyThinkingEl = document.getElementById("enemyThinking");

    // Analyze what a move will match and return a label for the thinking indicator
    function analyzeMoveTarget(move) {
      if (!move) return null;
      const { r1, c1, r2, c2 } = move;
      const t = board[r1][c1];
      board[r1][c1] = board[r2][c2];
      board[r2][c2] = t;
      const { mark, any } = findMatches();
      // revert
      board[r2][c2] = board[r1][c1];
      board[r1][c1] = t;
      if (!any) return null;
      const counts = {};
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (mark[r][c]) counts[board[r][c]] = (counts[board[r][c]] || 0) + 1;
      let best = null, bestN = 0;
      for (const k in counts) { if (counts[k] > bestN) { bestN = counts[k]; best = k; } }
      const icons = { sword: "⚔️", star: "⭐", hp: "❤️", shield: "🛡️", question: "🎲" };
      const names = { sword: "swords", star: "stars", hp: "hearts", shield: "shields", question: "mystery" };
      return best ? { icon: icons[best] || "🎯", name: names[best] || best, count: bestN } : null;
    }
    function showEnemyThinking(target) {
      if (!enemyThinkingEl || !target) return;
      enemyThinkingEl.textContent = `Hunting ${target.icon} ${target.name}`;
      enemyThinkingEl.classList.add("show");
    }
    function hideEnemyThinking() {
      if (enemyThinkingEl) enemyThinkingEl.classList.remove("show");
    }

    function setLog(msg, detail) {
      pushLog(msg, detail);
    }

    function ultReady() {
      return combat.sigBank >= settings.ultNeed;
    }

    function refreshCombatUI() {
      const pPct = Math.max(0, Math.min(100, (combat.playerHp / combat.playerMaxHp) * 100));
      const ePct = Math.max(0, Math.min(100, (combat.enemyHp / combat.enemyMaxHp) * 100));
      const pHp = `${combat.playerHp}/${combat.playerMaxHp}`;
      const eHp = `${combat.enemyHp}/${combat.enemyMaxHp}`;
      if (playerHpText) playerHpText.textContent = pHp;
      if (enemyHpText) enemyHpText.textContent = eHp;
      if (playerHpFill) { playerHpFill.style.width = pPct + "%"; playerHpFill.classList.toggle("low", pPct < 30); }
      if (enemyHpFill) { enemyHpFill.style.width = ePct + "%"; enemyHpFill.classList.toggle("low", ePct < 30); }
      if (playerHeartHp) playerHeartHp.classList.toggle("low", pPct < 30);
      if (enemyHeartHp) enemyHeartHp.classList.toggle("low", ePct < 30);
      if (turnNumEl) {
        turnNumEl.textContent = `Turn ${combat.turn} \u00b7 F${run.floor}`;
      }
      if (btnShuffle) {
        const free = (combat.freeShuffles || 0) > 0;
        const extraFree = (combat.extraFreeShuffles || 0) > 0;
        const anyFree = free || extraFree;
        btnShuffle.title = anyFree ? "Shuffle board (free)" : "Shuffle board (1 AP)";
        btnShuffle.classList.toggle("free", anyFree);
        // Build label + badge together so textContent doesn't wipe children
        let badgeHtml = "";
        if (combat.playerTurn && !busy) {
          if (free) {
            badgeHtml = '<span class="shuffle-badge free">FREE</span>';
          } else if (extraFree) {
            badgeHtml = `<span class="shuffle-badge free">${combat.extraFreeShuffles}</span>`;
          } else {
            const turnsUntilFree = 3 - ((combat.turn - 1) % 3);
            badgeHtml = `<span class="shuffle-badge">${turnsUntilFree <= 1 ? "Next!" : turnsUntilFree}</span>`;
          }
        }
        btnShuffle.innerHTML = (anyFree ? "Shuffle FREE" : "Shuffle (1AP)") + badgeHtml;
      }
      // End button: AP ring shows the active side's AP for the current turn
      if (endWrap) {
        const activeAp = combat.playerTurn ? combat.ap : (combat.enemyAp ?? 0);
        const frac = Math.max(0, Math.min(1, activeAp / AP_MAX));
        endWrap.style.setProperty("--ap", frac);
        const dimmed = busy || !combat.playerTurn;
        endWrap.classList.toggle("dim", dimmed);
        endWrap.classList.toggle("enemy-turn", !combat.playerTurn);
        endWrap.classList.toggle("ap-empty", combat.playerTurn && !busy && combat.ap <= 0);
      }
      updatePhaseVisual();
      const turnPill = document.getElementById("turnPill") || (turnNumEl ? turnNumEl.parentElement : null);
      if (turnPill) {
        const p = getPhase();
        if (p === "fever") {
          turnPill.title = "⭐ Star Fever — signature effects ×2";
          turnPill.style.background = "rgba(239, 212, 138, 0.55)";
        } else if (p === "impact") {
          turnPill.title = "☄️ Star Impact — mystery tiles always buff";
          turnPill.style.background = "rgba(200, 120, 140, 0.45)";
        } else {
          turnPill.title = "Normal phase";
          turnPill.style.background = "";
        }
      }

      const filled = Math.min(combat.ultMax, Math.floor((combat.sigBank / settings.ultMaxCharge) * combat.ultMax));
      ultPipsEl.querySelectorAll(".ult-pip").forEach((pip, i) => {
        pip.classList.toggle("filled", i < filled);
      });
      const chargeNumEl = document.getElementById("chargeNum");
      if (chargeNumEl) {
        chargeNumEl.textContent = `${combat.sigBank}/${settings.ultMaxCharge}`;
        chargeNumEl.classList.toggle("ready", ultReady());
      }
     // Show at least AP_MAX pips, but also show extra if combat.ap > AP_MAX
const pipCount = Math.max(AP_MAX, combat.ap);
if (apPipsEl.children.length !== pipCount) {
  apPipsEl.innerHTML = "";
  for (let i = 0; i < pipCount; i++) {
    const d = document.createElement("div");
    d.className = "ap-pip";
    d.dataset.pip = String(i + 1);
    apPipsEl.appendChild(d);
  }
}
apPipsEl.querySelectorAll(".ap-pip").forEach((pip, i) => {
  const on = i < combat.ap;
  pip.classList.toggle("filled", on);
  pip.classList.toggle("empty", !on);
});

      // Enemy AP (own economy — capped at base 3 regardless of player bonuses)
      const enemyApPipsEl = document.getElementById("enemyApPips");
      if (enemyApPipsEl) {
        const eCap = Math.min(AP_MAX, 3);
        const epipCount = Math.max(eCap, combat.enemyAp || 0);
        if (enemyApPipsEl.children.length !== epipCount) {
          enemyApPipsEl.innerHTML = "";
          for (let i = 0; i < epipCount; i++) {
            const d = document.createElement("div");
            d.className = "ap-pip";
            d.dataset.pip = String(i + 1);
            enemyApPipsEl.appendChild(d);
          }
        }
        enemyApPipsEl.querySelectorAll(".ap-pip").forEach((pip, i) => {
          const on = i < (combat.enemyAp || 0);
          pip.classList.toggle("filled", on);
          pip.classList.toggle("empty", !on);
        });
      }

      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      const maxSh = hero.maxShieldCap + run.bonusShieldMax + (combat.tempShieldCapBonus || 0);
      const shieldNumEl = document.getElementById("shieldNum");
      if (shieldBadgeEl) {
        shieldBadgeEl.style.opacity = combat.shield > 0 ? "1" : "0.4";
        shieldBadgeEl.title = `Shield: ${combat.shield}/${maxSh}`;
      }
      if (shieldNumEl) shieldNumEl.textContent = String(combat.shield);

      if (playerPortraitEl) {
        playerPortraitEl.classList.toggle("ult-ready", ultReady() && combat.afterglowTurns <= 0);
        playerPortraitEl.classList.toggle("afterglow-aura", combat.afterglowTurns > 0);
      }
      const enemyPortraitEl = document.getElementById("enemyPortrait");
      if (enemyPortraitEl) {
        enemyPortraitEl.classList.toggle("fracture-mark", combat.fractureStacks > 0 && combat.fractureTurns > 0);
        enemyPortraitEl.classList.toggle("mortal-mark", combat.mortalWoundTurns > 0);
      }

      // Cute status chips along the top of each portrait (tap for details)
      const pChips = [];
      if (combat.afterglowTurns > 0) pChips.push({ key: "afterglow", emoji: "🛡️", count: combat.afterglowTurns });
      if (combat.poisonTurns > 0) pChips.push({ key: "poison", emoji: "☠️", count: combat.poisonTurns });
      if (combat.empowerNext) pChips.push({ key: "empower", emoji: "💪", count: 0 });
      if (combat.blindNext) pChips.push({ key: "blind", emoji: "🌫️", count: 0 });
      if (combat.weakenNextSword) pChips.push({ key: "weaken", emoji: "❌", count: 0 });
      if (combat.playerMortalWoundTurns > 0) pChips.push({ key: "mortal", emoji: "💔", count: combat.playerMortalWoundTurns });
      syncPortraitChips(playerPortraitEl, pChips);

      const eChips = [];
      if (combat.markStacks > 0) eChips.push({ key: "mark", emoji: "🎯", count: combat.markStacks });
      if (combat.fractureStacks > 0 && combat.fractureTurns > 0) eChips.push({ key: "fracture", emoji: "🦴", count: combat.fractureStacks });
      if (combat.mortalWoundTurns > 0) eChips.push({ key: "mortal", emoji: "💔", count: combat.mortalWoundTurns });
      if (combat.manaLockTurns > 0) eChips.push({ key: "manalock", emoji: "🔒", count: combat.manaLockTurns });
      if (combat.enemyPoisonTurns > 0) eChips.push({ key: "poison", emoji: "☠️", count: combat.enemyPoisonTurns });
      if (combat.poisonStacks > 0) eChips.push({ key: "poisonStacks", emoji: "🧪", count: combat.poisonStacks });
      if (combat.acidStacks > 0) eChips.push({ key: "acidStacks", emoji: "🩸", count: combat.acidStacks });
      syncPortraitChips(enemyPortraitEl, eChips);

      // Enemy shield badge (mirror of the player's)
      const enemyShieldBadgeEl = document.getElementById("enemyShieldBadge");
      const enemyShieldNumEl = document.getElementById("enemyShieldNum");
      const enemyShMax = settings.shieldMax + run.bonusShieldMax;
      if (enemyShieldBadgeEl) {
        enemyShieldBadgeEl.style.opacity = combat.enemyShield > 0 ? "1" : "0.4";
        enemyShieldBadgeEl.title = `Shield: ${combat.enemyShield}/${enemyShMax}`;
      }
      if (enemyShieldNumEl) enemyShieldNumEl.textContent = String(combat.enemyShield);

      // Enemy charge: bosses charge a big ult, normal enemies a Power Strike; elites have none
      const enemyChargeRowEl = document.getElementById("enemyChargeRow");
      const enemyChargePipsEl = document.getElementById("enemyChargePips");
      if (enemyChargePipsEl) {
        const isBoss = !!combat.bossKit;
        const isElite = !!combat.eliteKit;
        const need = isBoss ? combat.enemyUltNeed : (isElite ? 0 : combat.enemySpecialNeed);
        const cur = isBoss ? combat.enemyUltCharge : (isElite ? 0 : combat.enemySpecialCharge);
        if (enemyChargeRowEl) enemyChargeRowEl.style.display = need > 0 ? "" : "none";
        const pips = enemyChargePipsEl.querySelectorAll(".ult-pip");
        const filled = need > 0 ? Math.round((cur / need) * pips.length) : 0;
        pips.forEach((pip, i) => pip.classList.toggle("filled", i < filled));
        if (enemyChargeRowEl) {
          enemyChargeRowEl.title = isBoss
            ? `${combat.enemyName}: ultimate ${cur}/${need}`
            : isElite ? `${combat.enemyName}: no charge` : `${combat.enemyName}: special ${cur}/${need}`;
        }
      }
    }

    const STATUS_INFO = {
      afterglow: { name: "Afterglow", detail: "Take 50% less damage for the listed turns (from Ninja ultimate)." },
      poison: { name: "Poison", detail: "3 true-ish damage at the start of the affected side’s relevant turn. Counts down each player turn." },
      empower: { name: "Empower", detail: "Your next damaging match deals +50% damage, then clears." },
      blind: { name: "Blind", detail: "Your next damaging match deals −50% damage, then clears." },
      weaken: { name: "Weaken", detail: "Your next Sword match deals −2 damage, then clears." },
      mark: { name: "Mark", detail: "Enemy takes +15% damage per stack (max 3). Applied by Ninja Cross shapes." },
      fracture: { name: "Fracture", detail: "At the start of the enemy’s turn they take 2 true damage per stack (max 5). From Knight skills." },
      mortal: { name: "Mortal Wound", detail: "Enemy healing is halved for the listed turns." },
      manalock: { name: "Mana Lock", detail: "Enemy cannot gain shield for the listed turns." },
      poisonStacks: { name: "Poison", detail: "Deals stacks × (3 + Floor×0.5) true damage at the start of your turn, then decays by 1. Applied by class perks." },
      acidStacks: { name: "Acid", detail: "All incoming damage is amplified by +2% per stack (cap 30 → +60% max). Applied by class perks." },
      gauntlet: { name: "Gauntlet", detail: "Multi-enemy floor. Shows which foe you are fighting now." },
      arch: { name: "Archetype", detail: "This foe’s special behavior (see name)." }
    };

    function openStatusDetail(title, body) {
      const ov = document.getElementById("infoOverlay");
      const t = document.getElementById("infoTitle");
      const b = document.getElementById("infoBody");
      if (!ov || !t || !b) return;
      t.textContent = title;
      b.innerHTML = `<div class="info-body">${body.replace(/\n/g, "<br>")}</div>`;
      ov.classList.add("open");
    }

    // Shield active: half damage to shield stacks, half to HP
    // Ninja dodge / afterglow, Wizard reflect
    function dealDamageToPlayer(raw, opts = {}) {
      // Tutorial: the Training Dummy never harms the player.
      if (combat.tutorial) return;
      let dmg = Math.max(0, raw | 0);
      if (dmg <= 0) return;

      // Ninja: first hit of battle always dodged; then 20% dodge
      if (combat.playerClass === "ninja") {
        if (!combat.firstHitDodged) {
          combat.firstHitDodged = true;
          setLog("Shadow Step · Dodge!");
          // Miasma Reflex: dodge triggers 100% of Poison stacks as immediate damage
          if (run.miasmaReflex && combat.poisonStacks > 0) {
            const miasmaDmg = combat.poisonStacks;
            combat.enemyHp = Math.max(0, combat.enemyHp - miasmaDmg);
            dmgPop("enemy", `☠${miasmaDmg}`, "true");
            if (combat.stats) combat.stats.poison += miasmaDmg;
            setLog("Miasma Reflex", `Miasma Reflex · ${miasmaDmg} Poison dmg`);
            if (combat.enemyHp <= 0) checkGameOver();
          }
          return;
        }
        if (Math.random() < 0.20) {
          setLog("Shadow Step · Dodge!");
          // Miasma Reflex
          if (run.miasmaReflex && combat.poisonStacks > 0) {
            const miasmaDmg = combat.poisonStacks;
            combat.enemyHp = Math.max(0, combat.enemyHp - miasmaDmg);
            dmgPop("enemy", `☠${miasmaDmg}`, "true");
            if (combat.stats) combat.stats.poison += miasmaDmg;
            setLog("Miasma Reflex", `Miasma Reflex · ${miasmaDmg} Poison dmg`);
            if (combat.enemyHp <= 0) checkGameOver();
          }
          return;
        }
      }

      // Afterglow: 50% less damage for 1 turn after ult
      if (combat.afterglowTurns > 0) {
        dmg = Math.round(dmg * 0.5);
      }
      // Mortal Strike (Knight): enemy deals 25% less damage for duration
      if ((combat.enemyWeakenTurns || 0) > 0) {
        dmg = Math.round(dmg * 0.75);
      }
      // Vengeance (Knight Retaliate T1): take 2 less damage
      if (run.vengeance) dmg = Math.max(1, dmg - 2);

      // Wizard Arcane Reflection: 30% of pre-mitigation dmg reflected as true dmg
      if (combat.playerClass === "wizard" && dmg > 0) {
        const reflected = Math.max(1, Math.round(dmg * combat.reflectPct));
        // True damage — ignore enemy shield
        combat.enemyHp = Math.max(0, combat.enemyHp - reflected);
        dmgPop("enemy", `↩${reflected}`, "true");
        if (combat.stats) combat.stats.reflect += reflected;
        // Reflect can kill the enemy mid-enemy-turn; register the kill now
        if (combat.enemyHp <= 0) checkGameOver();
      }

      const before = combat.playerHp;
      if (combat.shield > 0) {
        // Mana Shield passive: shield absorbs 60% instead of 50%
        const shieldRatio = run.manaShield ? 0.6 : 0.5;
        const toShield = Math.min(combat.shield, Math.floor(dmg * shieldRatio));
        const toHp = dmg - toShield;
        combat.shield -= toShield;
        if (toHp > 0) combat.playerHp = Math.max(0, combat.playerHp - toHp);
        if (toShield > 0) dmgPop("player", `🛡${toShield}`, "shielded");
        // Acidic Barrier (Wizard): every 10 damage absorbed by Shield applies +1 Poison
        if (toShield >= 10 && run.acidicBarrier && combat.playerClass === "wizard") {
          const acidPiles = Math.floor(toShield / 10);
          combat.poisonStacks += acidPiles;
          dmgPop("enemy", `🧪+${acidPiles}`, "poison");
        }
      } else {
        combat.playerHp = Math.max(0, combat.playerHp - dmg);
      }
      // Knight passive — Iron Will: survive a lethal hit once per battle
      if (combat.playerHp <= 0 && combat.playerClass === "knight" && !combat.knightDeathSaveUsed) {
        combat.playerHp = 1;
        combat.knightDeathSaveUsed = true;
        combat.fractureStacks = Math.min(5, combat.fractureStacks + 5);
        combat.fractureTurns = Math.max(combat.fractureTurns, 3);
        setLog("Iron Will", "Survived with 1 HP! +5 Fracture");
        dmgPop("player", "Iron Will!", "heal");
      }
      const lost = before - combat.playerHp;
      if (combat.stats) combat.stats.taken += lost;
      if (lost > 0) {
        dmgPop("player", `-${lost}`, "dmg");
        hpFlash("player", "down");
        playHit(Math.min(1.2, 0.5 + dmg / 12), { down: true });
        if (!opts.noFracture) animatePortraits("enemy");
        if (dmg >= 8) shakeBoard("light");
        // Counter Strike (Knight Retaliate T2): deal 3 true damage when hit
        if (run.counterStrike || run.retribution) {
          const counterDmg = run.retribution
            ? Math.min(15, combat.playerMaxHp - combat.playerHp)
            : 3;
          if (counterDmg > 0) {
            dealDamageToEnemy(counterDmg, { trueDmg: true, source: "counter" });
            dmgPop("enemy", `⚔${counterDmg}`, "true");
          }
        }
        // Reflective Aura (Wizard Aegis T3): reflect 2 damage when hit
        if (run.reflectiveAura && dmg > 0) {
          dealDamageToEnemy(2, { trueDmg: true, source: "reflect" });
          dmgPop("enemy", `🛡2`, "true");
        }
        // The Last Rival (dark knight): every hit you take adds Fracture
        if (!opts.noFracture && combat.bossKit && combat.bossKit.id === "lastrival") {
          combat.playerFractureStacks = Math.min(5, combat.playerFractureStacks + 1);
          combat.playerFractureTurns = Math.max(combat.playerFractureTurns, 3);
          setLog("Fracture", `Fracture ${combat.playerFractureStacks} on you`);
        }
      }
    }

    function dealDamageToEnemy(raw, opts = {}) {
      let dmg = Math.max(0, raw | 0);
      if (dmg <= 0) return;
      const src = opts.source || "sword";

      // Critical Edge (temp reward): 1.5× on normal damage; true damage never crits
      const isCrit = !opts.trueDmg && (combat.critChance || 0) > 0 && Math.random() * 100 < combat.critChance;
      if (isCrit) {
        dmg = Math.round(dmg * 1.5);
        playSparkle(2.2, 0.35);
      }

      // Umbral Herald (dark ninja): first hit of the fight is halved
      if (combat.bossKit && combat.bossKit.id === "umbral" && !combat.enemyVeilUsed) {
        combat.enemyVeilUsed = true;
        dmg = Math.max(1, Math.round(dmg * 0.5));
        setLog("Shadow Veil", "Shadow Veil · first hit halved");
      }
      // Afterglow: 50% less damage for 1 turn after its ultimate
      if (combat.enemyAfterglowTurns > 0) {
        dmg = Math.round(dmg * 0.5);
      }
      // Nox (dark wizard): reflect a portion of damage taken as true damage
      if (combat.bossKit && combat.bossKit.id === "nox" && dmg > 0) {
        const reflected = Math.max(1, Math.round(dmg * 0.2));
        dealDamageToPlayer(reflected, { noFracture: true });
        setLog("Void Reflection", `Void Reflection · ${reflected} to you`);
      }

      // Mark amplifier (Ninja cross): +15% per stack, max 3
      if (combat.markStacks > 0) {
        dmg = Math.round(dmg * (1 + 0.15 * Math.min(3, combat.markStacks)));
      }

      // Acid amplifier: +2% per stack, cap 30 stacks (+60%)
      if (combat.acidStacks > 0) {
        dmg = Math.round(dmg * (1 + Math.min(30, combat.acidStacks) * 0.02));
      }

      const trueDmg = !!opts.trueDmg; // ultimates & fracture
      const before = combat.enemyHp;
      let toShield = 0;
      if (trueDmg || combat.enemyShield <= 0) {
        combat.enemyHp = Math.max(0, combat.enemyHp - dmg);
      } else {
        toShield = Math.min(combat.enemyShield, Math.floor(dmg / 2));
        const toHp = dmg - toShield;
        combat.enemyShield -= toShield;
        if (toHp > 0) combat.enemyHp = Math.max(0, combat.enemyHp - toHp);
      }
      const lost = before - combat.enemyHp;
      if (combat.stats && combat.stats[src] != null) combat.stats[src] += lost + toShield;
      if (lost > 0) {
        if (isCrit) dmgPop("enemy", "CRIT!", "crit");
        dmgPop("enemy", `-${lost}`, trueDmg ? "true" : "dmg");
        hpFlash("enemy", "down");
        animatePortraits("player");
        playHit(Math.min(1.2, 0.5 + dmg / 12), { down: false });
      } else if (toShield > 0) {
        dmgPop("enemy", `🛡${toShield}`, "shielded");
        playShield();
      }
      if (combat.enemyHp < before && combat.eliteKit && typeof combat.eliteKit.onDamaged === "function") {
        combat.eliteKit.onDamaged();
      }
    }

    // Shield stacks: 3 tiles → settings.shieldOn3 (default 2), each extra +1
    function shieldFromCount(n) {
      if (n < 3) return 0;
      return settings.shieldOn3 + Math.max(0, n - 3);
    }

    function describeClear(matchedList) {
      const counts = { sword: 0, star: 0, hp: 0, shield: 0, question: 0 };
      for (const { type } of matchedList) if (counts[type] != null) counts[type]++;
      const parts = [];
      if (counts.sword) parts.push(`${counts.sword} sword`);
      if (counts.star) parts.push(`${counts.star} star`);
      if (counts.hp) parts.push(`${counts.hp} heart`);
      if (counts.shield) parts.push(`${counts.shield} shield`);
      if (counts.question) parts.push(`${counts.question} 🎲`);
      return parts.join(" · ") || "match";
    }

    function convertRandomTiles(count, toType) {
      const empties = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (board[r][c] && board[r][c] !== toType) empties.push({ r, c });
      for (let i = empties.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [empties[i], empties[j]] = [empties[j], empties[i]];
      }
      const n = Math.min(count, empties.length);
      for (let i = 0; i < n; i++) {
        const { r, c } = empties[i];
        board[r][c] = toType;
        specials[r][c] = false;
      }
      if (n > 0) rebuildVisual();
      return n;
    }

    function applyMatchCombat(matchedList, forEnemy = false, shape = { mult: 1, charged: false, apRefund: false, tags: ["normal"] }) {
      let dmg = 0, heal = 0, shieldTiles = 0, questionCount = 0, swordCount = 0, healCount = 0, shieldCount = 0, starCount = 0;
      const sigType = playerSignature();
      let hasSigMatch = false;
      let sigSwordCount = 0, sigShieldCount = 0, sigHpCount = 0;
      const mult = shape.mult || 1;
      const phase = getPhase();
      const fever = phase === "fever";
      const isCharged = !!shape.charged || (shape.tags && shape.tags.includes("charged"));
      const isCross = shape.tags && shape.tags.includes("cross");
      const isStar = shape.tags && shape.tags.includes("star");
      const bitsExtra = [];

      for (const { type } of matchedList) {
        if (type === "sword") {
          let sDmg = settings.swordDmg + (run.bonusSwordDmg || 0) + (combat.tempSwordDmg || 0);
          // Critical Edge: 25% chance ×2 sword damage
          if (!forEnemy && run.criticalEdge && Math.random() < 0.25) {
            sDmg *= 2;
            bitsExtra.push("Crit ×2");
          }
          // Assassinate: enemies below 30% HP take ×2
          if (!forEnemy && run.assassinate && combat.enemyHp < combat.enemyMaxHp * 0.3) {
            sDmg *= 2;
            bitsExtra.push("Assassinate");
          }
          dmg += sDmg;
          swordCount++;
          if (!forEnemy && sigType === "sword") { hasSigMatch = true; sigSwordCount++; }
          if (!forEnemy) combat.swordsClearedThisTurn++;
          // Toxic Blade: sword matches poison enemy
          if (!forEnemy && run.toxicBlade && combat.enemyPoisonTurns <= 0) {
            const toxicDuration = run.lethalPoison ? 3 : 2;
            combat.enemyPoisonTurns = Math.max(combat.enemyPoisonTurns, toxicDuration);
            combat.enemyPoisonDmg = Math.max(combat.enemyPoisonDmg || 0, 2 + (run.lethalPoison ? 1 : 0));
            bitsExtra.push("Toxic Blade");
          }
        } else if (type === "star") {
          dmg += settings.starDmg + (run.bonusStarDmg || 0) + (combat.tempStarDmg || 0);
          starCount++;
          // Celestial passive: star matches also heal 3 + shield 1
          if (!forEnemy && run.celestial) {
            heal += 3;
            applyShielding(1);
          }
        } else if (type === "hp") {
          healCount++;
          // Knight signature: +6 per potion tile + Fracture per tile
          if (!forEnemy && sigType === "hp") {
            heal += 6;
            hasSigMatch = true;
            sigHpCount++;
            combat.fractureStacks = Math.min(5, combat.fractureStacks + 1);
            combat.fractureTurns = Math.max(combat.fractureTurns, 2);
            bitsExtra.push(`Fracture ${combat.fractureStacks}`);
          } else {
            heal += settings.healAmt + (run.bonusHeal || 0);
          }
        } else if (type === "shield") {
          shieldTiles++;
          shieldCount++;
          if (!forEnemy && sigType === "shield") { hasSigMatch = true; sigShieldCount++; }
        } else if (type === "question") {
          questionCount++;
        }
      }

      // Star Fever: signature damage/shield boosted; heals only +50% (not full double)
      if (!forEnemy && fever && hasSigMatch) {
        // Phase Attunement: signature effects are stronger during Star Fever
        const phBoost = run.phasePower ? 1.5 : 1;
        if (sigType === "sword") dmg += Math.round((settings.swordDmg + (run.bonusSwordDmg || 0)) * sigSwordCount * phBoost);
        if (sigType === "hp") heal += Math.round(6 * sigHpCount * 0.5 * phBoost);
        if (sigType === "shield") shieldTiles += Math.ceil(sigShieldCount * 0.5 * phBoost);
      }

      // Venomous: sword clears can poison the enemy
      if (!forEnemy && run.venomous && swordCount > 0 && Math.random() < 0.3) {
        combat.enemyPoisonTurns = Math.max(combat.enemyPoisonTurns || 0, 2);
        flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("playerPortrait"),
                  document.getElementById("enemyPortrait"), "poison");
        bitsExtra.push("Poison 2t");
      }

      // Venomous Blade (Ninja): 4+ Swords or cascade (combo >= 2) applies +2 Poison stacks
      if (!forEnemy && run.venomousBlade && combat.playerClass === "ninja") {
        if (swordCount >= 4 || (shape.comboLevel || 0) >= 2) {
          combat.poisonStacks += 2;
          flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("playerPortrait"),
                    document.getElementById("enemyPortrait"), "poison");
          bitsExtra.push(`Venom Blade +2 ☠`);
        }
      }

      // Infinite Mana: 4+ tile matches grant 1 AP
      if (!forEnemy && run.infiniteMana && matchedList.length >= 4) {
        combat.ap = Math.min(AP_MAX, combat.ap + 1);
        bitsExtra.push("Infinite Mana +1");
      }

      // Signature Echo: matching your signature tile also counts as a small star
      if (!forEnemy && hasSigMatch && run.sigDouble) {
        const sigN = sigType === "sword" ? sigSwordCount : sigType === "hp" ? sigHpCount : sigShieldCount;
        if (sigN > 0) dmg += (settings.starDmg + (run.bonusStarDmg || 0)) * sigN;
      }

      // Damage gets full shape mult; heals only partial (prevents 60+ HP clears)
      dmg = Math.round(dmg * mult);
      const healMult = mult > 1 ? Math.min(1.25, 1 + (mult - 1) * 0.5) : 1;
      heal = Math.round(heal * healMult);

      // Base shield from tiles
      let sh = 0;
      if (shieldTiles >= 3) {
        // Wizard signature: +6 per 3-match
        if (!forEnemy && combat.playerClass === "wizard" && hasSigMatch) {
          sh = 6 + Math.max(0, shieldTiles - 3);
        } else {
          sh = shieldFromCount(shieldTiles);
        }
      }
      if (combat.armorPlating && !forEnemy) sh += combat.armorPlating;
      if (mult > 1 && sh > 0) sh = Math.round(sh * Math.min(1.25, mult));

      // Glass Cannon: player damage +50%, healing -50%
      if (!forEnemy && combat.glassCannon) {
        dmg = Math.round(dmg * 1.5);
        heal = Math.round(heal * 0.5);
      }
      // Cascade Boost: cascade damage +50%
      if (!forEnemy && combo >= 2 && combat.cascadeDamageMult) {
        dmg = Math.round(dmg * combat.cascadeDamageMult);
      }

      // Ninja lifesteal (toned down)
      let lifeSteal = 0;
      if (!forEnemy && combat.playerClass === "ninja" && swordCount > 0) {
        lifeSteal = swordCount * (isCharged ? 3 : 2);
        heal += lifeSteal;
      }

      // Knight signature: fracture orb flies to enemy on heart match
      if (!forEnemy && combat.playerClass === "knight" && hasSigMatch && sigHpCount > 0) {
        flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("playerPortrait"),
                  document.getElementById("enemyPortrait"), "fracture");
      }

      // ---- Hero shape bonuses (player only) ----
      if (!forEnemy) {
        const cls = combat.playerClass;
        if (cls === "wizard") {
          if (isStar) {
            sh += 12;
            const n = convertRandomTiles(3, "shield");
            bitsExtra.push(`Arcane Nova +12 shield · ${n}→🛡️`);
          }
          if (isCross) {
            combat.manaLockTurns = Math.max(combat.manaLockTurns, 2);
            bitsExtra.push("Mana Lock 2t");
          }
          if (isCharged) {
            const steal = Math.min(3, combat.enemyShield);
            if (steal > 0) {
              combat.enemyShield -= steal;
              const shielded = applyShielding(steal);
              const dmgFromOverflow = steal - shielded;
              let stealMsg = `Mana Steal ${steal}`;
              if (dmgFromOverflow > 0) stealMsg += ` (+${dmgFromOverflow} overflow dmg)`;
              bitsExtra.push(stealMsg);
            }
          }
        } else if (cls === "ninja") {
          if (isStar) {
            combat.ap = Math.min(AP_MAX, combat.ap + 2);
            const n = convertRandomTiles(4, "sword");
            bitsExtra.push(`Shadow Dance +2 AP · ${n}→⚔️`);
          }
          if (isCross) {
            combat.markStacks = Math.min(3, combat.markStacks + 2);
            combat.ap = Math.min(AP_MAX, combat.ap + 1);
            bitsExtra.push(`Marked ${combat.markStacks} · +1 AP`);
          }
          if (isCharged) {
            const swords = combat.swordsClearedThisTurn;
            const execDmg = Math.max(8, Math.min(24, swords * 4));
            dealDamageToEnemy(execDmg, { trueDmg: true, source: "sword" });
            bitsExtra.push(`Shadow Strike ${execDmg}!`);
          }
        } else if (cls === "knight") {
          if (isStar) {
            combat.fractureStacks = Math.min(5, combat.fractureStacks + 2);
            combat.fractureTurns = Math.max(combat.fractureTurns, 2);
            const n = convertRandomTiles(3, "hp");
            bitsExtra.push(`Earthquake +2 Fracture · ${n}→❤️`);
          }
          if (isCross) {
            combat.fractureStacks = Math.min(5, combat.fractureStacks + 3);
            combat.fractureTurns = Math.max(combat.fractureTurns, 2);
            combat.ap = Math.min(AP_MAX, combat.ap + 1);
            bitsExtra.push(`Sunder +3 Fracture · +1 AP`);
          }
          if (isCharged && combat.fractureStacks > 0) {
            let shatterDmg = combat.fractureStacks * 3;
            // Shatter+ passive: ×1.5 damage
            if (run.shatterPlus) shatterDmg = Math.round(shatterDmg * 1.5);
            combat.fractureStacks = 0;
            combat.fractureTurns = 0;
            dealDamageToEnemy(shatterDmg, { trueDmg: true, source: "fracture" });
            bitsExtra.push(`Shatter ${shatterDmg}!`);
            // Earthquake passive: stun enemy 1 turn on shatter
            if (run.earthquake) {
              combat.enemyStunTurns = Math.max(combat.enemyStunTurns || 0, 1);
              bitsExtra.push("Earthquake Stun!");
            }
          }
        }
      }

      // Empower / blind / weaken
      if (!forEnemy && dmg > 0) {
        if (combat.empowerNext) {
          dmg = Math.round(dmg * 1.5);
          combat.empowerNext = false;
        }
        if (combat.blindNext) {
          dmg = Math.round(dmg * 0.5);
          combat.blindNext = false;
        }
        if (combat.weakenNextSword && swordCount > 0) {
          dmg = Math.max(0, dmg - 2);
          combat.weakenNextSword = false;
        }
      }

      // Mortal Wound: enemy healing halved
      if (forEnemy && combat.mortalWoundTurns > 0 && heal > 0) {
        heal = Math.floor(heal / 2);
      }

      const label = describeClear(matchedList);
      const shapeTag = (shape.tags && shape.tags[0] !== "normal") ? shape.tags.join("+") : "";
      const mysteryBits = [];

      // One mystery roll per clear (not per ? tile) — less swingy
      if (!forEnemy && questionCount > 0) {
        const res = rollMysteryEffect();
        mysteryBits.push(`🎲 ${res.isBuff ? "Buff" : "Debuff"}: ${res.label} (${res.detail})`);
        // Contagion Catalyst (Wizard): Mystery tile clear while Shielded doubles enemy Poison
        if (run.contagionCatalyst && combat.playerClass === "wizard" && combat.shield > 0 && combat.poisonStacks > 0) {
          combat.poisonStacks *= 2;
          mysteryBits.push(`☣️ Poison doubled → ${combat.poisonStacks}`);
        }
      }

      const maxSh = settings.shieldMax + run.bonusShieldMax;

      if (forEnemy) {
        if (dmg > 0) {
          dealDamageToPlayer(dmg);
          // Enemy fires from the tile it just matched, like the player's projectiles
          flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("enemyPortrait"),
                    document.getElementById("playerPortrait"), "enemy");
        }
        if (heal > 0) {
          healEnemy(heal);
          flyEffect(document.getElementById("enemyPortrait"), document.getElementById("enemyPortrait"), "hp");
        }
        // Mana Lock: enemy cannot gain shield
        if (sh > 0 && combat.manaLockTurns <= 0) {
          combat.enemyShield = Math.min(maxSh, combat.enemyShield + sh);
          playShield();
          flyEffect(document.getElementById("enemyPortrait"), document.getElementById("enemyPortrait"), "shield");
        }
        const bits = [label];
        if (shapeTag) bits.push(shapeTag);
        if (dmg) bits.push(`${dmg} dmg`);
        if (heal) bits.push(`+${heal} HP`);
        if (sh && combat.manaLockTurns <= 0) bits.push(`+${sh} shield`);
        else if (sh && combat.manaLockTurns > 0) bits.push("shield locked");
        const full = `Rival: ${bits.join(" · ")}`;
        const live = `Rival: ${bits.filter((b) => !skipNumericBit(b)).join(" · ")}`;
        setLog(live, full);
      } else {
        if (dmg > 0) dealDamageToEnemy(dmg, { source: swordCount >= starCount ? "sword" : "star" });
        // FX: damage → enemy portrait; heal/shield → player portrait
        if (dmg > 0) {
          const kind = swordCount >= starCount ? "sword" : "star";
          flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("playerPortrait"),
                    document.getElementById("enemyPortrait"), kind);
        }
        let healApplied = 0, shieldApplied = 0;
        if (heal > 0) healApplied = applyHealing(heal, healCount);
        if (sh > 0) shieldApplied = applyShielding(sh, shieldCount);
        if (healApplied > 0 || shieldApplied > 0) {
          const kind = shieldCount > healCount ? "shield" : "hp";
          flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("enemyPortrait"),
                    document.getElementById("playerPortrait"), kind);
        }
        // Runic Shield (Wizard baseline): shield matches deal Runic damage equal to
        // the shield gained (×2 with the Runic Shield upgrade). Uses raw sh so it
        // still hits at the shield cap.
        if (!forEnemy && combat.playerClass === "wizard" && sh > 0 && hasSigMatch) {
          let runic = sh * (run.runicShield ? 2 : 1);
          // Runic Edge passive: shield matches +4 damage
          if (run.runicEdge) runic += 4;
          dealDamageToEnemy(runic, { trueDmg: true, source: "runic" });
          dmgPop("enemy", `🔮${runic}`, "true");
          bitsExtra.push(`Runic ${runic}`);
          // Runic Nova passive: shield matches also deal 5 splash
          if (run.runicNova) {
            dealDamageToEnemy(5, { trueDmg: true, source: "runic" });
            dmgPop("enemy", `🔮+5`, "true");
            bitsExtra.push("Nova +5");
          }
        }
        // Bulwark (Knight): shield matches apply 1 Fracture stack (once per turn)
        if (!forEnemy && shieldApplied > 0 && run.bulwark && !combat._bulwarkUsed) {
          combat._bulwarkUsed = true;
          combat.fractureStacks = Math.min(5, combat.fractureStacks + 1);
          combat.fractureTurns = Math.max(combat.fractureTurns, 2);
          flyEffect(matchedList[0] ? getCell(matchedList[0].r, matchedList[0].c) : document.getElementById("playerPortrait"),
                    document.getElementById("enemyPortrait"), "fracture");
          bitsExtra.push(`Bulwark Fracture ${combat.fractureStacks}`);
        }
        if (hasSigMatch) {
          // Track total signature tiles cleared this turn (3 tiles = 1 charge, cascades count)
          const sigTiles = sigSwordCount + sigShieldCount + sigHpCount;
          combat.sigTilesThisTurn += sigTiles;
          // Faster Ult / Battle Cry: each signature match grants bonus charge(s)
          combat._sigMatchesThisTurn = (combat._sigMatchesThisTurn || 0) + 1;
          const totalCharges = Math.floor(combat.sigTilesThisTurn / 3) + combat._sigMatchesThisTurn * (run.ultChargeBonus || 0);
          const chargesToAdd = totalCharges - (combat._lastSigChargeTotal || 0);
          combat._lastSigChargeTotal = totalCharges;
          if (chargesToAdd > 0) {
            const before = combat.sigBank;
            combat.sigBank = Math.min(settings.ultMaxCharge, combat.sigBank + chargesToAdd);
            if (before < settings.ultNeed && combat.sigBank >= settings.ultNeed) {
              showUltReadyBanner();
            }
          }
          // Mana Surge (Wizard): full charge — signature matches refund 1 AP
          if (run.manaSurge && combat.sigBank >= settings.ultMaxCharge) {
            combat.ap = Math.min(AP_MAX, combat.ap + 1);
            bitsExtra.push("Mana Surge +1 AP");
          }
        }
        // Volatile Floor: every player match deals 1 self-damage
        if (!forEnemy && combat.volatileFloor && matchedList.length > 0) {
          dealDamageToPlayer(1, { noFracture: true });
          dmgPop("player", "-1", "dmg");
          bitsExtra.push("Volcano 1");
        }
        const bits = [label];
        if (shapeTag) bits.push(shapeTag + (mult !== 1 ? ` ×${mult}` : ""));
        if (fever && hasSigMatch) bits.push("Fever ×2");
        if (dmg) bits.push(`${dmg} dmg`);
        if (heal) {
          bits.push(`+${healApplied} HP`);
          if (heal > healApplied) bits.push(`(+${heal - healApplied} dmg to enemy)`);
        }
        if (sh) {
          bits.push(`+${shieldApplied} shield (${combat.shield})`);
          if (sh > shieldApplied) bits.push(`(+${sh - shieldApplied} dmg to enemy)`);
        }
        if (!forEnemy && shape.apRefund) bits.push("AP refund");
        if (hasSigMatch) bits.push(`charge ${combat.sigBank}/${settings.ultMaxCharge}`);
        if (bitsExtra.length) bits.push(...bitsExtra);
        if (mysteryBits.length) bits.push(...mysteryBits);
        setLog(bits.filter((b) => !skipNumericBit(b)).join(" · "), bits.join(" · "));
        // Trash talk: big clear / charged / cross → rival reacts
        const isBig = (shape.charged || (shape.tags && (shape.tags.includes("cross") || shape.tags.includes("star"))) || matchedList.length >= 6 || dmg >= 12);
        if (isBig) {
          setTimeout(() => {
            if (!gameOver && combat.enemyHp > 0) sayVoice("bigHit", { chance: 0.55, force: false });
          }, 420);
        } else if (dmg > 0 || heal > 0) {
          setTimeout(() => maybeEnemyLowVoice(), 400);
        }
      }
      refreshCombatUI();
      checkGameOver();
    }

    // Score a hypothetical clear for AI (higher = better for rival)
    async function enemyTurn() {
      if (busy) return;
      busy = true;
      combat.playerTurn = false;
      document.body.classList.remove("your-turn");
      combat.enemyAp = Math.min(AP_MAX, 3); // rival caps at base AP — player bonuses are pure upside

      // Boss turn-start passive (e.g. Last Rival regeneration)
      if (combat.bossKit && typeof combat.bossKit.turnStart === "function") {
        combat.bossKit.turnStart();
      }

      // Blood Price: floor modifier enemy regen
      if (combat.enemyRegen > 0 && combat.enemyHp > 0 && combat.enemyHp < combat.enemyMaxHp) {
        healEnemy(combat.enemyRegen);
        flyEffect(document.getElementById("enemyPortrait"), document.getElementById("enemyPortrait"), "hp");
        refreshCombatUI();
        await sleep(200);
      }

      // Quickening: enemy gains +1 ATK every 2 turns
      if (combat.quickening) {
        combat.quickeningTicks = (combat.quickeningTicks || 0) + 1;
        if (combat.quickeningTicks % 2 === 0) {
          combat.enemyAtkBonus = (combat.enemyAtkBonus || 0) + 0.25;
          dmgPop("enemy", "+ATK", "true");
          refreshCombatUI();
          await sleep(250);
        }
      }

      // Knight Fracture: true dmg at start of enemy turn
      if (combat.fractureStacks > 0 && combat.fractureTurns > 0) {
        const fBase = 2 + Math.floor(run.floor * 0.3);
        const fDmg = combat.fractureStacks * (run.deepFracture ? fBase + 1 : fBase);
        dealDamageToEnemy(fDmg, { trueDmg: true, source: "fracture" });
        setLog("Fracture", `Fracture · ${fDmg} true dmg`);
        refreshCombatUI();
        await sleep(350);
        if (combat.enemyHp <= 0) {
          checkGameOver();
          return;
        }
      }

      // Boss ultimate charge
      if (combat.bossKit) {
        combat.enemyUltCharge += 1;
        if (combat.enemyUltCharge >= combat.enemyUltNeed) {
          sayVoice("enemySpecial", { force: true });
          await sleep(320);
          setLog(`${combat.enemyName}: ${combat.bossKit.ultName}!`);
          await sleep(400);
          combat.bossKit.ultFn();
          combat.enemyUltCharge = 0;
          refreshCombatUI();
          await sleep(400);
          if (combat.playerHp <= 0) {
            checkGameOver();
            return;
          }
          maybePlayerLowVoice();
        } else if (combat.enemyUltCharge === combat.enemyUltNeed - 1) {
          setLog(`${combat.enemyName} ultimate charging…`);
          playEnemyCharge();
          await sleep(280);
        }
      }

      applyArchetypeTurnStart();
      refreshCombatUI();

      // --- Normal Enemy Special Move ---
      if (!combat.bossKit && !combat.eliteKit) {
        combat.enemySpecialCharge += 1;
        if (combat.enemySpecialCharge >= combat.enemySpecialNeed) {
          combat.enemySpecialCharge = 0;
          combat.enemySpecialNeed = 4 + Math.floor(Math.random() * 2);
          // Use special: Heavy Strike (150% damage)
          sayVoice("enemySpecial", { force: true });
          await sleep(280);
          const spDmg = Math.max(1, Math.round(enemyAtkForFloor(run.floor) * diffStats().atkMul * 1.5));
          dealDamageToPlayer(spDmg);
          applyArchetypePassiveOnHit();
          setLog(`${combat.enemyName} uses Power Strike!`, `${combat.enemyName} uses Power Strike! ${spDmg} dmg`);
          refreshCombatUI();
          if (combat.playerHp <= 0) { checkGameOver(); return; }
          maybePlayerLowVoice();
          // Small pause so the player sees the special
          await sleep(400);
        } else if (combat.enemySpecialCharge === combat.enemySpecialNeed - 1) {
          setLog(`${combat.enemyName} is charging a special...`);
          await sleep(300);
        }
      }

      if (combat.tutorial) {
        hideEnemyThinking();
        setLog("Training Dummy · watching…");
      } else {
      setLog(`${combat.enemyName} is thinking…`);
      const archAtk = (combat.enemyArchetype && combat.enemyArchetype.atkMul) || 1;
      const eliteAtk = (combat.eliteKit && combat.eliteKit.atkMul) || 1;
      const quickBonus = combat.quickening ? (combat.enemyAtkBonus || 0) : 0;
      const atkScale = archAtk * eliteAtk + quickBonus;

      for (let i = 0; i < AP_MAX && combat.enemyAp > 0 && combat.playerHp > 0; i++) {
        await sleep(settings.difficulty === "hard" ? 280 : 380);
        const move = pickEnemyMove();
        if (!move) {
          const poke = Math.max(1, Math.round(enemyAtkForFloor(run.floor) * diffStats().atkMul * 0.6 * atkScale));
          dealDamageToPlayer(poke);
          applyArchetypePassiveOnHit();
          if (combat.eliteKit && combat.eliteKit.onHit) combat.eliteKit.onHit();
          setLog(`${combat.enemyName} attacks`, `${combat.enemyName} attacks · ${poke} dmg`);
          combat.enemyAp--;
          refreshCombatUI();
          maybePlayerLowVoice();
          continue;
        }

        // Preview glow on tiles rival will swap
        const target = analyzeMoveTarget(move);
        showEnemyThinking(target);
        const a = getCell(move.r1, move.c1);
        const b = getCell(move.r2, move.c2);
        a.classList.add("highlight");
        b.classList.add("highlight");
        setLog("Rival found a move…");
        await sleep(380);
        a.classList.remove("highlight");
        b.classList.remove("highlight");
        hideEnemyThinking();

        const { r1, c1, r2, c2 } = move;
        const tmp = board[r1][c1];
        board[r1][c1] = board[r2][c2];
        board[r2][c2] = tmp;
        const ts = specials[r1][c1];
        specials[r1][c1] = specials[r2][c2];
        specials[r2][c2] = ts;
        rebuildVisual();

        const { any } = findMatches();
        if (any) {
          combat.enemyAp--;
          await resolveBoardEnemy();
        } else {
          board[r2][c2] = board[r1][c1];
          board[r1][c1] = tmp;
          specials[r2][c2] = specials[r1][c1];
          specials[r1][c1] = ts;
          rebuildVisual();
          if (settings.difficulty !== "easy" && Math.random() < 0.35) {
            const poke = Math.max(1, Math.round(enemyAtkForFloor(run.floor) * diffStats().atkMul * 0.45 * atkScale));
            dealDamageToPlayer(poke);
            applyArchetypePassiveOnHit();
            if (combat.eliteKit && combat.eliteKit.onHit) combat.eliteKit.onHit();
          setLog(`${combat.enemyName} attacks`, `${combat.enemyName} attacks · ${poke} dmg`);
            combat.enemyAp--;
            maybePlayerLowVoice();
          } else {
            setLog(`${combat.enemyName} missed a match`);
          }
        }
        refreshCombatUI();
      }
      } // end tutorial else

      if (gameOver) {
        busy = true;
        return;
      }

      combat.ap = AP_MAX + unusedApBonus;
      unusedApBonus = 0; // Reset for this turn
      combat.enemyAp = Math.min(AP_MAX, 3); // rival caps at base AP
      combat.turn += 1;
      combat.playerTurn = true;
      document.body.classList.add("your-turn");
      combat.cascadeApRefunded = false; // Cascade Refund: once per turn
      combat._bulwarkUsed = false; // Bulwark: once per turn
      combat.swordsClearedThisTurn = 0; // ninja Shadow Step
      combat.shadowStepUsed = false;     // ninja Shadow Step
      combat.sigTilesThisTurn = 0;       // sig tile charge accumulator (3 tiles = 1 charge)
      combat._sigMatchesThisTurn = 0;    // sig match counter (for ultChargeBonus)
      combat._lastSigChargeTotal = 0;
      combat._blitzUsedThisTurn = false;  // Blitz passive: first match free
      // Free shuffle every 3rd turn (use it or lose it)
      if (combat.turn % 3 === 0) {
        combat.freeShuffles = 1;
      } else {
        combat.freeShuffles = 0;
      }

      // Tile Bloom modifier: place a random special each turn
      if (combat.tileBloomPerTurn && typeof window.placeRandomSpecial === "function") {
        window.placeRandomSpecial();
      }

      // Decay timed statuses
      // Shadow Echo / Shadow Army: afterglow deals damage per turn
      if (combat.afterglowTurns > 0 && (run.shadowEcho || run.shadowArmy)) {
        const afterglowDmg = run.shadowArmy ? 5 : 3;
        dealDamageToEnemy(afterglowDmg, { trueDmg: true, source: "afterglow" });
        dmgPop("enemy", `🌑${afterglowDmg}`, "true");
      }
      if (combat.afterglowTurns > 0) combat.afterglowTurns--;
      if (combat.manaLockTurns > 0) combat.manaLockTurns--;
      if (combat.mortalWoundTurns > 0) combat.mortalWoundTurns--;
      if (combat.fractureTurns > 0) {
        combat.fractureTurns--;
        if (combat.fractureTurns <= 0) combat.fractureStacks = 0;
      }
      if (combat.enemyAfterglowTurns > 0) combat.enemyAfterglowTurns--;
      if (combat.playerMortalWoundTurns > 0) combat.playerMortalWoundTurns--;
      if (combat.enemyWeakenTurns > 0) combat.enemyWeakenTurns--;

      // Knight Regeneration at start of own turn
      if (combat.playerClass === "knight" && combat.playerHp > 0) {
        applyHealing(3);
      }

      // Player Fracture (The Last Rival): true dmg at start of own turn
      if (combat.playerFractureStacks > 0 && combat.playerFractureTurns > 0) {
        const fDmg = combat.playerFractureStacks * 2;
        dealDamageToPlayer(fDmg, { noFracture: true });
        setLog("Fracture", `Fracture · ${fDmg} true dmg`);
        combat.playerFractureTurns--;
        if (combat.playerFractureTurns <= 0) combat.playerFractureStacks = 0;
      }

      // Poison ticks (legacy duration-based)
      if (combat.poisonTurns > 0) {
        dealDamageToPlayer(3, { noFracture: true });
        combat.poisonTurns--;
      }
      if (combat.enemyPoisonTurns > 0) {
        dealDamageToEnemy(3, { trueDmg: true, source: "poison" });
        combat.enemyPoisonTurns--;
      }

      // --- New Poison/Acid stack system (ticks at start of player turn) ---
      // Poison DoT: stacks × (3 + floorLevel × 0.5), then decay 1 stack
      if (combat.poisonStacks > 0) {
        const poisonBase = 3 + (run.lethalPoison ? 1 : 0);
        const poisonDmg = Math.round(combat.poisonStacks * (poisonBase + run.floor * 0.5));
        dealDamageToEnemy(poisonDmg, { trueDmg: true, source: "poison" });
        dmgPop("enemy", `☠${poisonDmg}`, "poison");
        combat.poisonStacks = Math.max(0, combat.poisonStacks - 1);
      }

      // Toxic Fortitude (Knight): start-of-turn shield = 2× (poison + acid) on rival
      if (combat.playerClass === "knight" && run.toxicFortitude && combat.playerHp > 0) {
        const totalStacks = combat.poisonStacks + combat.acidStacks;
        if (totalStacks > 0) {
          const toxicShield = totalStacks * 2;
          const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
          const maxSh = combat.shieldCapOverride || (hero.maxShieldCap + run.bonusShieldMax + (combat.tempShieldCapBonus || 0));
          const shielded = Math.min(toxicShield, maxSh - combat.shield);
          if (shielded > 0) {
            combat.shield += shielded;
            dmgPop("player", `🏰+${shielded}`, "shield");
          }
        }
      }

      refreshCombatUI();
      await sleep(450);
      if (combat.turn === 6) setLog("⭐ Star Fever begins — signature ×2");
      else if (combat.turn === 11) setLog("☄️ Star Impact — mystery always buffs");
      else setLog("Your turn · " + phaseLabel());
      busy = false;
      refreshCombatUI();
    }

    // Enemy-side board resolve (matches help the rival)
    async function resolveBoardEnemy() {
      while (true) {
        let { mark, any, specialSpawns } = findMatches();
        if (!any) {
          combo = 0;
          clearComboTheater();
          break;
        }
        // Expand clear based on each matched special's kind (bloom 3x3 / cross row+col / x diagonals)
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
            }
          }
        }
        const matchedList = [];
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (mark[r][c]) matchedList.push({ r, c, type: board[r][c] });

        const shape = analyzeShapes(mark);
        shape.apRefund = false; // enemy never refunds the player AP
        applyMatchCombat(matchedList, true, shape);

        // Same visible feedback as player
        for (const { r, c } of matchedList) {
          getCell(r, c).classList.add("highlight");
        }
        await sleep(360);
        for (const { r, c, type } of matchedList) {
          const el = getCell(r, c);
          el.classList.remove("highlight");
          el.classList.add("matching");
          if (combo >= 4) el.classList.add("c4");
          else if (combo >= 3) el.classList.add("c3");
          else if (combo >= 2) el.classList.add("c2");
          spawnParticles(r, c, type, combo);
        }
        if (shape.isCross && shape.crossCell) {
          spawnCrossFlash(shape.crossCell.r, shape.crossCell.c);
        }
        await sleep(280);
        const crossType = shape.crossCell ? board[shape.crossCell.r][shape.crossCell.c] : null;
        for (const { r, c } of matchedList) {
          board[r][c] = null;
          specials[r][c] = false;
          const el = getCell(r, c);
          el.classList.remove("matching");
          el.style.opacity = "0";
        }
        for (const s of specialSpawns) {
          if (s.type && mark[s.r] && mark[s.r][s.c]) {
            board[s.r][s.c] = s.type;
            specials[s.r][s.c] = s.kind || "bloom";
          }
        }
        // Place a seal on the enemy's crossing cell too
        if (shape.isCross && shape.crossCell && crossType) {
          const { r, c } = shape.crossCell;
          if (specials[r][c] === false) {
            board[r][c] = crossType;
            specials[r][c] = shape.crossKind === "l" ? "x" : "cross";
          }
        }
        await applyGravityAndFill();
      }
    }
    function applyHealing(amt, healCount = 0) {
      let amount = amt;
      // Mortal Wound (Last Rival ult): your healing is halved
      if (combat.playerMortalWoundTurns > 0 && amount > 0) {
        amount = Math.floor(amount / 2);
      }
      const healed = Math.min(amount, combat.playerMaxHp - combat.playerHp);
      combat.playerHp += healed;
      if (combat.stats) combat.stats.healed += healed;
      if (healed > 0) {
        dmgPop("player", `+${healed}`, "heal");
        hpFlash("player", "up");
        playHeal();
      }
      // Overflow: any healing beyond max HP becomes damage equal to the number of potion tiles matched
      const overflow = amount - healed;
      if (overflow > 0) {
        dealDamageToEnemy(run.overflowBoost ? Math.max(2, Math.round(healCount * 1.5)) : healCount);
        // Corrosive Overheal (Knight): excess heal converts to Acid stacks (1 per 5 HP)
        if (combat.playerClass === "knight" && run.corrosiveOverheal && overflow >= 5) {
          const acidGain = Math.floor(overflow / 5);
          combat.acidStacks = Math.min(30, combat.acidStacks + acidGain);
          dmgPop("enemy", `🩸+${acidGain}`, "acid");
        }
      }
      return healed;
    }

    // Helper function to apply shielding with overflow-to-damage mechanic
    function applyShielding(amt, shieldCount = 0) {
      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      const maxSh = combat.shieldCapOverride || (hero.maxShieldCap + run.bonusShieldMax + (combat.tempShieldCapBonus || 0));
      const shielded = Math.min(amt, maxSh - combat.shield);
      combat.shield += shielded;
      if (combat.stats) combat.stats.shield += shielded;
      if (shielded > 0) {
        dmgPop("player", `+${shielded}`, "shield");
        playShield();
        // Guard Breaker (temp reward): a slice of gained shield becomes damage
        if ((combat.shieldConvertPct || 0) > 0) {
          const conv = Math.max(1, Math.round(shielded * combat.shieldConvertPct));
          dealDamageToEnemy(conv);
          dmgPop("enemy", `⚔${conv}`, "convert");
        }
      }
      // Overflow: any shield beyond max becomes damage equal to the number of shield tiles matched
      const overflow = amt - shielded;
      if (overflow > 0) {
        dealDamageToEnemy(run.overflowBoost ? Math.max(2, Math.round(shieldCount * 1.5)) : shieldCount);
      }
      return shielded;
    }

    // Enemy heals are clamped so a dead enemy can never be resurrected
    function healEnemy(amt) {
      if (combat.enemyHp <= 0 || amt <= 0) return 0;
      const healed = Math.min(amt, combat.enemyMaxHp - combat.enemyHp);
      combat.enemyHp += healed;
      if (healed > 0) {
        dmgPop("enemy", `+${healed}`, "heal");
        hpFlash("enemy", "up");
        playHeal();
      }
      return healed;
    }

    // Floating damage/heal numbers over the board (third row — right in the player's
    // line of sight), direction-split: enemy-affecting events float on the left,
    // player-affecting on the right. Absolutely positioned so nothing reflows.
    let popCount = 0;
    let popCountReset = null;
    function dmgPop(side, text, kind = "dmg") {
      const board = document.querySelector(".board-wrap");
      if (!board) return;
      const br = board.getBoundingClientRect();
      const pop = document.createElement("div");
      pop.className = `dmg-pop ${kind}`;
      pop.textContent = text;
      const sideX = side === "enemy" ? 0.25 : 0.75;
      popCount++;
      if (popCountReset) clearTimeout(popCountReset);
      popCountReset = setTimeout(() => { popCount = 0; }, 600);
      const stackOffset = Math.min(popCount - 1, 5) * 22;
      const jitterX = Math.random() * 60 - 30;
      const jitterY = Math.random() * 20 - 10;
      pop.style.left = Math.round(br.width * sideX + jitterX) + "px";
      pop.style.top = Math.round(br.height * 0.42 + jitterY + stackOffset) + "px";
      board.appendChild(pop);
      const drift = 10 + Math.random() * 14;
      const anim = pop.animate([
        { transform: "translate(-50%, -50%) scale(0.6)", opacity: 0 },
        { transform: `translate(-50%, -50%) translateY(-${drift}px) scale(1.18)`, opacity: 1, offset: 0.12 },
        { transform: `translate(-50%, -50%) translateY(-${drift}px) scale(1.18)`, opacity: 1, offset: 0.52 },
        { transform: `translate(-50%, -50%) translateY(-${drift + 24}px) scale(1)`, opacity: 0 }
      ], { duration: 1150, easing: "ease-out", fill: "forwards" });
      anim.onfinish = () => pop.remove();
    }

    // Flash the HP indicator when it changes (down = damage, up = heal)
    function hpFlash(side, dir) {
      const hpEl = document.getElementById(side === "player" ? "playerHeartHp" : "enemyHeartHp");
      if (!hpEl) return;
      hpEl.classList.remove("hp-hit", "hp-heal");
      void hpEl.offsetWidth;
      hpEl.classList.add(dir === "down" ? "hp-hit" : "hp-heal");
      setTimeout(() => hpEl.classList.remove("hp-hit", "hp-heal"), 480);
    }

    // Portrait juice: attacker lunges toward the opponent, the target hurt-shakes.
    function animatePortraits(attacker) {
      const playerPort = document.getElementById("playerPortrait");
      const enemyPort = document.getElementById("enemyPortrait");
      if (attacker === "player") {
        if (playerPort) {
          playerPort.classList.remove("lunge-left");
          void playerPort.offsetWidth;
          playerPort.classList.add("lunge-left");
          setTimeout(() => playerPort.classList.remove("lunge-left"), 500);
        }
        if (enemyPort) {
          enemyPort.classList.remove("hurt");
          void enemyPort.offsetWidth;
          enemyPort.classList.add("hurt");
          setTimeout(() => enemyPort.classList.remove("hurt"), 420);
        }
      } else if (attacker === "enemy") {
        if (enemyPort) {
          enemyPort.classList.remove("lunge-right");
          void enemyPort.offsetWidth;
          enemyPort.classList.add("lunge-right");
          setTimeout(() => enemyPort.classList.remove("lunge-right"), 500);
        }
        if (playerPort) {
          playerPort.classList.remove("hurt");
          void playerPort.offsetWidth;
          playerPort.classList.add("hurt");
          setTimeout(() => playerPort.classList.remove("hurt"), 420);
        }
      }
    }

    function showUltDamagePop(dmg, cls) {
      const wrap = document.querySelector(".board-wrap");
      if (!wrap) return;
      const pop = document.createElement("div");
      pop.className = `score-popup ult-pop huge ${cls}`;
      pop.textContent = `−${dmg}`;
      wrap.appendChild(pop);
      setTimeout(() => pop.remove(), 1200);
    }

    function runUltFlash(cls) {
      const wrap = document.querySelector(".board-wrap");
      if (!wrap) return;
      const flash = document.createElement("div");
      flash.className = `ult-flash ${cls}`;
      wrap.appendChild(flash);
      // force reflow then animate
      void flash.offsetWidth;
      flash.classList.add("go");
      setTimeout(() => flash.remove(), 600);
    }

    async function useUltimate() {
      if (!ultReady() || busy || !combat.playerTurn) return;
      if (combat.ap <= 0) {
        setLog("Need 1 AP for ultimate");
        return;
      }
      busy = true;
      combat.ap -= 1;
      const cls = combat.playerClass;
      const sig = playerSignature(); // "sword" | "shield" | "hp"
      const bits = [];
      const playerPort = document.getElementById("playerPortrait");
      const enemyPort = document.getElementById("enemyPortrait");

      // Count all signature tiles on board, then consume them
      const tilesOnBoard = typeof window.countTilesOfType === "function" ? window.countTilesOfType(sig) : 0;
      const tilesConsumed = typeof window.consumeTilesOfType === "function" ? await window.consumeTilesOfType(sig) : 0;
      const perTileDmg = sig === "sword" ? 6 : sig === "shield" ? 5 : 5;
      const baseDmg = 5;
      let ultDmg = baseDmg + tilesConsumed * perTileDmg;
      // Earthshatter+ passive: ult +15 true damage
      if (run.earthshatterPlus) ultDmg += 15;
      // Devastation passive: ult consumes all shield, adding it to damage
      let shieldBonus = 0;
      if (run.devastation && combat.shield > 0) {
        shieldBonus = combat.shield;
        ultDmg += shieldBonus;
        combat.shield = 0;
      }

      // --- Wind-up ---
      if (playerPort) {
        playerPort.classList.remove("ult-ready");
        playerPort.classList.add("ult-cast");
      }
      playUltSfx(cls);
      await sleep(cls === "knight" ? 140 : 110);

      // Class-specific pre-impact bonuses
      if (cls === "ninja") {
        combat.playerHp = Math.max(1, combat.playerHp - 3);
        combat.afterglowTurns = run.shadowArmy ? 3 : (run.lingeringShadow ? 2 : 1);
        const enemyPct = combat.enemyHp / Math.max(1, combat.enemyMaxHp);
        if (enemyPct < 0.3) ultDmg = Math.round(ultDmg * 2);
        bits.push("Assassinate", `${ultDmg} true`, enemyPct < 0.3 ? "Execute!" : "", `${tilesConsumed} ⚔️ consumed`, "Afterglow", "-3 HP");
        refreshCombatUI();
      } else if (cls === "wizard") {
        bits.push("Meteor", `${ultDmg} true`, `${tilesConsumed} 🛡️ consumed`);
        // Mana steal if enemy has shield
        if (combat.enemyShield > 0) {
          const steal = Math.min(3, combat.enemyShield);
          combat.enemyShield -= steal;
          applyShielding(steal);
          bits.push(`steal ${steal}🛡️`);
        }
      } else if (cls === "knight") {
        const shatterBonus = combat.fractureStacks * 4;
        combat.fractureStacks = 0;
        combat.fractureTurns = 0;
        combat.mortalWoundTurns = Math.max(combat.mortalWoundTurns, 2);
        bits.push("Earthshatter", `${ultDmg} true`, `${tilesConsumed} ❤️ consumed`, shatterBonus > 0 ? `Shatter +${shatterBonus}` : "No Fracture", "Mortal Wound");
        if (shatterBonus > 0) {
          await sleep(90);
          dealDamageToEnemy(shatterBonus, { trueDmg: true, source: "ult" });
          showUltDamagePop(shatterBonus, cls);
        }
        if (run.mortalStrike) {
          combat.enemyWeakenTurns = Math.max(combat.enemyWeakenTurns || 0, 2);
          bits.push("Weaken 25%");
        }
      } else {
        bits.push("Ultimate", `${ultDmg} dmg`, `${tilesConsumed} consumed`);
      }

      // --- Hit-stop + flash + flinch + cinematic ---
      document.body.classList.add("ult-hitstop");
      runUltFlash(cls);
      shakeBoard("strong");
      const cinEl = document.createElement("div");
      cinEl.className = "ult-cinematic " + cls;
      document.body.appendChild(cinEl);
      void cinEl.offsetWidth;
      cinEl.classList.add("go");
      document.body.classList.add("ult-cin-" + cls);
      if (cls === "knight") {
        [144, 216, 288].forEach((deg, i) => {
          const crack = document.createElement("div");
          crack.className = "ult-crack";
          crack.style.cssText = `position:fixed;top:50%;left:50%;width:0;height:2px;background:linear-gradient(90deg,rgba(184,204,224,0.8),transparent);transform-origin:left center;transform:translate(-50%,-50%) rotate(${deg}deg);pointer-events:none;z-index:10000;animation:crackLine 0.4s ${0.06 + i * 0.07}s ease-out forwards;`;
          cinEl.appendChild(crack);
        });
      }
      if (cls === "ninja") {
        const extraSlash = document.createElement("div");
        extraSlash.className = "ult-slash-extra";
        extraSlash.style.cssText = "position:fixed;width:200%;height:3px;background:linear-gradient(90deg,transparent,rgba(123,159,212,0.9),transparent);transform:rotate(-35deg);top:42%;left:-50%;pointer-events:none;z-index:10000;animation:slashLine 0.35s 0.1s ease-out forwards;opacity:0;";
        cinEl.appendChild(extraSlash);
      }
      flyEffect(playerPort || document.getElementById("playerPortrait"),
                enemyPort || document.getElementById("enemyPortrait"),
                sig, { mega: true });
      if (enemyPort) {
        enemyPort.classList.remove("ult-flinch");
        void enemyPort.offsetWidth;
        enemyPort.classList.add("ult-flinch");
      }
      dealDamageToEnemy(ultDmg, { trueDmg: true, source: "ult" });
      showUltDamagePop(ultDmg, cls);
      combat.sigBank = 0;
      combat.ultAnnounced = false;
      const liveBits = bits.filter((b) => b !== `${ultDmg} true` && b !== `${ultDmg} dmg`);
      setLog(liveBits.join(" · "), bits.join(" · "));
      refreshCombatUI();

      await sleep(cls === "knight" ? 240 : 200);
      document.body.classList.remove("ult-hitstop");
      document.body.classList.remove("ult-cin-ninja", "ult-cin-wizard", "ult-cin-knight");
      setTimeout(() => cinEl.remove(), 500);

      refreshCombatUI();

      // Rival voice
      await sleep(160);
      if (!gameOver) sayVoice("playerUlt", { force: true });

      if (playerPort) {
        setTimeout(() => playerPort.classList.remove("ult-cast"), 100);
      }
      if (enemyPort) {
        setTimeout(() => enemyPort.classList.remove("ult-flinch"), 450);
      }

      checkGameOver();
      busy = false;
      refreshCombatUI();
    }

    btnEnd.addEventListener("click", () => {
  if (busy || !combat.playerTurn) return;
  // Track unused AP for next turn bonus – always +1 if any AP is left (Momentum: up to +2)
  const leftover = combat.ap;
  if (combat.ap > 0) {
    unusedApBonus = run.momentum ? Math.min(2, combat.ap) : 1;
    setLog(`Unused AP → +${unusedApBonus} AP next turn`);
  }
  // Trash talk if turn looked passive (most AP left unused)
  if (leftover >= Math.max(2, AP_MAX - 1)) {
    setTimeout(() => {
      if (!gameOver) sayVoice("weakTurn", { chance: 0.7, force: false });
    }, 200);
  }
  // Ninja Shadow Step: prompt if 4+ swords cleared this turn and not used yet
  if (combat.playerClass === "ninja" && combat.swordsClearedThisTurn >= 4 && !combat.shadowStepUsed) {
    (async () => {
      const use = await showShadowStepPrompt();
      if (use && combat.playerHp > 3) {
        combat.playerHp = Math.max(1, combat.playerHp - 3);
        combat.ap = Math.min(AP_MAX, combat.ap + 1);
        combat.shadowStepUsed = true;
        setLog("Shadow Step · −3 HP · +1 AP");
        refreshCombatUI();
        return; // don't end turn — player continues with extra AP
      }
      enemyTurn();
    })();
  } else {
    enemyTurn();
  }
});

    btnShuffle.addEventListener("click", () => {
      if (busy || !combat.playerTurn) return;
      if ((combat.freeShuffles || 0) > 0) {
        combat.freeShuffles -= 1;
      } else if ((combat.extraFreeShuffles || 0) > 0) {
        combat.extraFreeShuffles -= 1;
      } else {
        if (combat.ap <= 0) return;
        combat.ap -= 1;
      }
      busy = true;
      playGooeyPlop(0.9, 0.5);
      shuffleBoard().finally(() => {
        busy = false;
        refreshCombatUI();
      });
    });

    playerPortraitEl.addEventListener("click", () => {
      if (ultReady() && combat.playerTurn && !busy && combat.ap > 0) {
        useUltimate();
      } else {
        openInfo("player");
      }
    });

    // ----- Screens & settings -----
