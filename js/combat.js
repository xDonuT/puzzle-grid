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
      combat.logHistory.push(full);
      if (combat.logHistory.length > 5) combat.logHistory.shift();
      if (logBarText) logBarText.textContent = msg || full;
    }

    function refreshLogModal() {
      if (!actionLogScroll) return;
      actionLogScroll.innerHTML = "";
      const entries = combat.logHistory.slice(-5);
      for (const text of entries) {
        const el = document.createElement("div");
        el.className = "log-entry";
        el.textContent = text;
        actionLogScroll.appendChild(el);
      }
      actionLogScroll.scrollTop = actionLogScroll.scrollHeight;
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
      if (asLog) {
        combat.logHistory.push(line);
        if (combat.logHistory.length > 5) combat.logHistory.shift();
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
      const isBuff = phase === "impact" || (run.luckyDice ? Math.random() < 0.7 : Math.random() < 0.5);
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
      if (playerHeartHp) playerHeartHp.classList.toggle("low", pPct < 30);
      if (enemyHeartHp) enemyHeartHp.classList.toggle("low", ePct < 30);
      if (turnNumEl) {
        turnNumEl.textContent = `Turn ${combat.turn}`;
      }
      if (btnShuffle) {
        const free = (combat.freeShuffles || 0) > 0;
        btnShuffle.title = free ? `Shuffle board (${combat.freeShuffles} free)` : "Shuffle board";
        btnShuffle.classList.toggle("free", free);
      }
      // End button: AP ring shows the active side's AP for the current turn
      if (endWrap) {
        const activeAp = combat.playerTurn ? combat.ap : (combat.enemyAp ?? 0);
        const frac = Math.max(0, Math.min(1, activeAp / AP_MAX));
        endWrap.style.setProperty("--ap", frac);
        const dimmed = busy || !combat.playerTurn;
        endWrap.classList.toggle("dim", dimmed);
        endWrap.classList.toggle("enemy-turn", !combat.playerTurn);
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

      // Enemy AP (mirror of the player's — same pips, drains as the rival acts)
      const enemyApPipsEl = document.getElementById("enemyApPips");
      if (enemyApPipsEl) {
        const epipCount = Math.max(AP_MAX, combat.enemyAp || 0);
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
      const maxSh = hero.maxShieldCap + run.bonusShieldMax;
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
      let dmg = Math.max(0, raw | 0);
      if (dmg <= 0) return;

      // Ninja: first hit of battle always dodged; then 20% dodge
      if (combat.playerClass === "ninja") {
        if (!combat.firstHitDodged) {
          combat.firstHitDodged = true;
          setLog("Shadow Step · Dodge!");
          return;
        }
        if (Math.random() < 0.20) {
          setLog("Shadow Step · Dodge!");
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

      // Wizard Arcane Reflection: 30% of pre-mitigation dmg reflected as true dmg
      if (combat.playerClass === "wizard" && dmg > 0) {
        const reflected = Math.max(1, Math.round(dmg * combat.reflectPct));
        // True damage — ignore enemy shield
        combat.enemyHp = Math.max(0, combat.enemyHp - reflected);
        dmgPop("enemy", `↩${reflected}`, "true");
        // Reflect can kill the enemy mid-enemy-turn; register the kill now
        if (combat.enemyHp <= 0) checkGameOver();
      }

      const before = combat.playerHp;
      if (combat.shield > 0) {
        const toShield = Math.min(combat.shield, Math.floor(dmg / 2));
        const toHp = dmg - toShield;
        combat.shield -= toShield;
        if (toHp > 0) combat.playerHp = Math.max(0, combat.playerHp - toHp);
        if (toShield > 0) dmgPop("player", `🛡${toShield}`, "shielded");
      } else {
        combat.playerHp = Math.max(0, combat.playerHp - dmg);
      }
      const lost = before - combat.playerHp;
      if (lost > 0) {
        dmgPop("player", `-${lost}`, "dmg");
        hpFlash("player", "down");
        playHit(Math.min(1.2, 0.5 + dmg / 12), { down: true });
        if (!opts.noFracture) animatePortraits("enemy");
        if (dmg >= 8) shakeBoard("light");
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
      let dmg = 0, heal = 0, shieldTiles = 0, questionCount = 0, swordCount = 0, healCount = 0, shieldCount = 0;
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
          dmg += settings.swordDmg + (run.bonusSwordDmg || 0) + (combat.tempSwordDmg || 0);
          swordCount++;
          if (!forEnemy && sigType === "sword") { hasSigMatch = true; sigSwordCount++; }
        } else if (type === "star") {
          dmg += settings.starDmg + (run.bonusStarDmg || 0) + (combat.tempStarDmg || 0);
        } else if (type === "hp") {
          healCount++;
          // Knight signature: +6 per potion tile
          if (!forEnemy && sigType === "hp") {
            heal += 6;
            hasSigMatch = true;
            sigHpCount++;
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
        bitsExtra.push("Poison 2t");
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

      // Knight signature: +1 Fracture once per clear (not per tile)
      if (!forEnemy && combat.playerClass === "knight" && hasSigMatch && sigHpCount > 0) {
        combat.fractureStacks = Math.min(5, combat.fractureStacks + 1);
        combat.fractureTurns = Math.max(combat.fractureTurns, 2);
        bitsExtra.push(`Fracture ${combat.fractureStacks}`);
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
            const n = convertRandomTiles(3, "sword");
            bitsExtra.push(`Shadow Dance +2 AP · ${n}→⚔️`);
          }
          if (isCross) {
            combat.markStacks = Math.min(3, combat.markStacks + 1);
            bitsExtra.push(`Mark ${combat.markStacks}`);
          }
          if (isCharged) {
            heal += 4;
            bitsExtra.push("Shadow Strike +4 HP");
          }
        } else if (cls === "knight") {
          if (isStar) {
            const bonus = combat.fractureStacks * 5;
            if (bonus > 0) {
              dealDamageToEnemy(bonus, { trueDmg: true });
              bitsExtra.push(`Earthquake ${bonus}`);
            }
            const n = convertRandomTiles(2, "hp");
            bitsExtra.push(`${n}→❤️`);
          }
          if (isCross) {
            combat.fractureStacks = Math.min(5, combat.fractureStacks + 2);
            combat.fractureTurns = Math.max(combat.fractureTurns, 2);
            bitsExtra.push(`Sunder Fracture ${combat.fractureStacks}`);
          }
          if (isCharged) {
            combat.fractureStacks = Math.min(5, combat.fractureStacks + 2);
            combat.fractureTurns = Math.max(combat.fractureTurns, 2);
            bitsExtra.push("Shattering Blow +2 Fracture");
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
      }

      const maxSh = settings.shieldMax + run.bonusShieldMax;

      if (forEnemy) {
        if (dmg > 0) dealDamageToPlayer(dmg);
        if (heal > 0) healEnemy(heal);
        // Mana Lock: enemy cannot gain shield
        if (sh > 0 && combat.manaLockTurns <= 0) {
          combat.enemyShield = Math.min(maxSh, combat.enemyShield + sh);
          playShield();
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
        if (dmg > 0) dealDamageToEnemy(dmg);
        let healApplied = 0, shieldApplied = 0;
        if (heal > 0) healApplied = applyHealing(heal, healCount);
        if (sh > 0) shieldApplied = applyShielding(sh, shieldCount);
        // Runic Shield (Wizard): shield matches deal damage equal to shield gained
        if (!forEnemy && shieldApplied > 0 && run.runicShield && Math.random() < 0.25) {
          dealDamageToEnemy(shieldApplied);
          dmgPop("enemy", `🔮${shieldApplied}`, "true");
          bitsExtra.push(`Runic ${shieldApplied}`);
        }
        // Bulwark (Knight): shield matches apply 1 Fracture stack (once per turn)
        if (!forEnemy && shieldApplied > 0 && run.bulwark && !combat._bulwarkUsed) {
          combat._bulwarkUsed = true;
          combat.fractureStacks = Math.min(5, combat.fractureStacks + 1);
          combat.fractureTurns = Math.max(combat.fractureTurns, 2);
          bitsExtra.push(`Bulwark Fracture ${combat.fractureStacks}`);
        }
        if (hasSigMatch) {
          const before = combat.sigBank;
          combat.sigBank = Math.min(settings.ultMaxCharge, combat.sigBank + 1 + (run.ultChargeBonus || 0));
          if (before < settings.ultNeed && combat.sigBank >= settings.ultNeed) {
            showUltReadyBanner();
          }
          // Mana Surge (Wizard): full charge — signature matches refund 1 AP
          if (run.manaSurge && combat.sigBank >= settings.ultMaxCharge) {
            combat.ap = Math.min(AP_MAX, combat.ap + 1);
            bitsExtra.push("Mana Surge +1 AP");
          }
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
      combat.enemyAp = AP_MAX;
      if (typeof tutorialOnEnemyTurn === "function") tutorialOnEnemyTurn();

      // Boss turn-start passive (e.g. Last Rival regeneration)
      if (combat.bossKit && typeof combat.bossKit.turnStart === "function") {
        combat.bossKit.turnStart();
      }

      // Knight Fracture: true dmg at start of enemy turn
      if (combat.fractureStacks > 0 && combat.fractureTurns > 0) {
        const fDmg = combat.fractureStacks * (run.deepFracture ? 3 : 2);
        dealDamageToEnemy(fDmg, { trueDmg: true });
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

      setLog(`${combat.enemyName} is thinking…`);
      const archAtk = (combat.enemyArchetype && combat.enemyArchetype.atkMul) || 1;
      const eliteAtk = (combat.eliteKit && combat.eliteKit.atkMul) || 1;
      const atkScale = archAtk * eliteAtk;

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
        const a = getCell(move.r1, move.c1);
        const b = getCell(move.r2, move.c2);
        a.classList.add("highlight");
        b.classList.add("highlight");
        setLog("Rival found a move…");
        await sleep(320);
        a.classList.remove("highlight");
        b.classList.remove("highlight");

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

      if (gameOver) {
        busy = true;
        return;
      }

      combat.ap = AP_MAX + unusedApBonus;
      unusedApBonus = 0; // Reset for this turn
      combat.enemyAp = AP_MAX;
      combat.turn += 1;
      combat.playerTurn = true;
      combat.cascadeApRefunded = false; // Cascade Refund: once per turn
      combat._bulwarkUsed = false; // Bulwark: once per turn
      if (typeof tutorialOnPhase === "function") tutorialOnPhase(getPhase());

      // Decay timed statuses
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

      // Poison ticks
      if (combat.poisonTurns > 0) {
        dealDamageToPlayer(3, { noFracture: true });
        combat.poisonTurns--;
      }
      if (combat.enemyPoisonTurns > 0) {
        dealDamageToEnemy(3, { trueDmg: true });
        combat.enemyPoisonTurns--;
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
      if (healed > 0) {
        dmgPop("player", `+${healed}`, "heal");
        hpFlash("player", "up");
        playHeal();
      }
      // Overflow: any healing beyond max HP becomes damage equal to the number of potion tiles matched
      const overflow = amount - healed;
      if (overflow > 0) {
        dealDamageToEnemy(run.overflowBoost ? Math.max(2, Math.round(healCount * 1.5)) : healCount);
      }
      return healed;
    }

    // Helper function to apply shielding with overflow-to-damage mechanic
    function applyShielding(amt, shieldCount = 0) {
      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      const maxSh = combat.shieldCapOverride || (hero.maxShieldCap + run.bonusShieldMax);
      const shielded = Math.min(amt, maxSh - combat.shield);
      combat.shield += shielded;
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
      const charge = combat.sigBank;
      const dmg = 12 + Math.max(0, charge - 6) * 2;
      const cls = combat.playerClass;
      const bits = [];
      const playerPort = document.getElementById("playerPortrait");
      const enemyPort = document.getElementById("enemyPortrait");

      // --- Wind-up ---
      if (playerPort) {
        playerPort.classList.remove("ult-ready");
        playerPort.classList.add("ult-cast");
      }
      playUltSfx(cls);
      await sleep(cls === "knight" ? 140 : 110);

      // Class-specific pre-impact
      if (cls === "ninja") {
        combat.playerHp = Math.max(1, combat.playerHp - 3);
        combat.afterglowTurns = run.lingeringShadow ? 2 : 1;
        bits.push("Assassinate", `${dmg} true`, "Afterglow", "-3 HP");
        refreshCombatUI();
      } else if (cls === "wizard") {
        bits.push("Meteor", `${dmg} true`);
      } else if (cls === "knight") {
        combat.fractureStacks = Math.min(5, combat.fractureStacks + 2);
        combat.fractureTurns = Math.max(combat.fractureTurns, 2);
        combat.mortalWoundTurns = Math.max(combat.mortalWoundTurns, 2);
        bits.push("Earthshatter", `${dmg} true`, `Fracture ${combat.fractureStacks}`, "Mortal Wound");
        // Mortal Strike (Knight): ult also reduces enemy damage by 25% for 2 turns
        if (run.mortalStrike) {
          combat.enemyWeakenTurns = Math.max(combat.enemyWeakenTurns || 0, 2);
          bits.push("Weaken 25%");
        }
      } else {
        bits.push("Ultimate", `${dmg} dmg`);
      }

      // --- Hit-stop + flash + flinch ---
      document.body.classList.add("ult-hitstop");
      runUltFlash(cls);
      shakeBoard("strong");
      if (enemyPort) {
        enemyPort.classList.remove("ult-flinch");
        void enemyPort.offsetWidth;
        enemyPort.classList.add("ult-flinch");
      }
      dealDamageToEnemy(dmg, { trueDmg: true });
      showUltDamagePop(dmg, cls);
      combat.sigBank = 0;
      combat.ultAnnounced = false;
      const liveBits = bits.filter((b) => b !== `${dmg} true` && b !== `${dmg} dmg`);
      setLog(liveBits.join(" · "), bits.join(" · "));
      refreshCombatUI();

      await sleep(cls === "knight" ? 240 : 200);
      document.body.classList.remove("ult-hitstop");

      // --- Board residue ---
      let residueNote = "";
      if (cls === "ninja") {
        const n = convertRandomTiles(3, "sword");
        if (n > 0) residueNote = `${n}→⚔️`;
      } else if (cls === "wizard") {
        const n = convertRandomTiles(3, "shield");
        if (n > 0) residueNote = `${n}→🛡️`;
        // Small mana steal if enemy has shield
        if (combat.enemyShield > 0) {
          const steal = Math.min(3, combat.enemyShield);
          combat.enemyShield -= steal;
          applyShielding(steal);
          residueNote = (residueNote ? residueNote + " · " : "") + `steal ${steal}🛡️`;
        }
      } else if (cls === "knight") {
        const n = convertRandomTiles(2, "hp");
        if (n > 0) residueNote = `${n}→❤️`;
      }
      if (residueNote) {
        setLog(liveBits.join(" · ") + " · " + residueNote, bits.join(" · ") + " · " + residueNote);
      }
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
  if (typeof tutorialOnEndTurn === "function") tutorialOnEndTurn();
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
  enemyTurn();
});

    btnShuffle.addEventListener("click", () => {
      if (busy || !combat.playerTurn) return;
      if ((combat.freeShuffles || 0) > 0) {
        combat.freeShuffles -= 1;
      } else {
        if (combat.ap <= 0) return;
        combat.ap -= 1;
      }
      shuffleBoard();
      playGooeyPlop(0.9, 0.5);
      refreshCombatUI();
    });

    playerPortraitEl.addEventListener("click", () => {
      if (ultReady() && combat.playerTurn && !busy && combat.ap > 0) {
        useUltimate();
      } else {
        openInfo("player");
      }
    });

    // ----- Screens & settings -----
