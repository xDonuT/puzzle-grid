const screenMenu = document.getElementById("screen-menu");
    const screenGame = document.getElementById("screen-game");
    const settingsOverlay = document.getElementById("settingsOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const charPick = document.getElementById("charPick");
    let gameOver = false;

    function showScreen(name) {
      screenMenu.classList.toggle("active", name === "menu");
      screenGame.classList.toggle("active", name === "game");
      if (name !== "game") {
        document.body.classList.remove("phase-fever", "phase-impact", "tower-1", "tower-2", "tower-3", "tower-4");
      }
      if (name === "game") resumeRunTimer(); else pauseRunTimer();
    }

    // Tower ascent: background shifts as floors climb
    function updateTowerBand() {
      const b = document.body;
      b.classList.remove("tower-1", "tower-2", "tower-3", "tower-4");
      const f = run && typeof run.floor === "number" ? run.floor : 1;
      b.classList.add(f >= 20 ? "tower-4" : f >= 13 ? "tower-3" : f >= 6 ? "tower-2" : "tower-1");
    }

    // ─── Run timer (pure stats; pauses in menus/settings/overlays) ───
    function fmtTime(ms) {
      const t = Math.max(0, Math.floor((ms || 0) / 1000));
      const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
      return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${m}:${String(s).padStart(2, "0")}`;
    }
    let timerRunning = false;
    let timerLastResume = 0;
    function pauseRunTimer() {
      if (!timerRunning) return;
      const delta = Date.now() - timerLastResume;
      run.elapsedMs = (run.elapsedMs || 0) + delta;
      run.floorElapsedMs = (run.floorElapsedMs || 0) + delta;
      timerRunning = false;
    }
    function resumeRunTimer() {
      if (timerRunning) return;
      timerLastResume = Date.now();
      timerRunning = true;
    }

    // ─── Card builder helpers ───
    function detectArchetype(name, desc, icon) {
      const s = (name + " " + desc + " " + (icon || "")).toLowerCase();
      if (/poison|venom|miasma|acid|contagion|corrosive|toxic/.test(s)) return { tag: "🧪 Poison", cls: "poison" };
      if (/burn|fire|flame|scorch|ember/.test(s))                  return { tag: "🔥 Fire",   cls: "fire" };
      if (/frost|ice|freeze|chill|cold/.test(s))                   return { tag: "❄️ Ice",     cls: "ice" };
      if (/shock|lightning|spark|static/.test(s))                  return { tag: "⚡ Shock",   cls: "lightning" };
      if (/shield|armor|fortif|ward|barrier|defen/.test(s))        return { tag: "🛡️ Defense", cls: "defense" };
      if (/heal|hp|heart|regen|life/.test(s))                      return { tag: "❤️ Life",    cls: "life" };
      return { tag: "⭐ General", cls: "general" };
    }
    function extractCallout(name, desc) {
      // Pull the most prominent stat from name or desc
      const m = name.match(/[\+\-]?\d+\s*[a-z%×]+/i) || desc.match(/[\+\-]?\d+\s*[a-z%×]+/i);
      return m ? m[0].toUpperCase() : "";
    }
    function synergyTip(name, desc, cls) {
      const s = (name + " " + desc).toLowerCase();
      if (cls === "poison")  return "Best for stacking Poison & Acid builds";
      if (cls === "fire")    return "Best for high-damage aggressive builds";
      if (cls === "ice")     return "Best for control & survivability";
      if (cls === "defense") return "Best for Shield-focused Wizard & Knight";
      if (cls === "life")    return "Best for Knight sustain & overheal builds";
      if (/sword|slash|damage/.test(s))    return "Best for Ninja Sword & Combo setups";
      if (/shield|barrier/.test(s))        return "Best for Wizard Shield builds";
      if (/heal|heart|hp/.test(s))         return "Best for Knight sustain builds";
      if (/ap|action/.test(s))             return "Best for multi-action combo turns";
      if (/star|signature|charge/.test(s)) return "Best for fast Ultimate cycling";
      if (/cascade|combo/.test(s))         return "Best for cascade-heavy boards";
      if (/fracture/.test(s))              return "Best for Knight Fracture stacking";
      if (/ult|ultimate/.test(s))          return "Best for big burst damage turns";
      return "";
    }
    function buildRewardCard(btn, entry, opts) {
      const name = entry.name || "";
      const desc = entry.desc || "";
      const icon = entry.icon || "";
      const arch = detectArchetype(name, desc, icon);
      const callout = extractCallout(name, desc);
      const synergy = synergyTip(name, desc, arch.cls);
      const tier = entry.tier || "common";
      const isPerm = opts.permanent === true;
      btn.className = "upgrade-card glow-" + arch.cls;
      // Top row: archetype tag + tier badge + duration badge
      const top = document.createElement("div");
      top.className = "up-card-top";
      const archTag = document.createElement("span");
      archTag.className = "up-card-archetype " + arch.cls;
      archTag.textContent = arch.tag;
      const tierBadge = document.createElement("span");
      tierBadge.className = "reward-tier " + tier;
      tierBadge.textContent = tier.toUpperCase();
      const durBadge = document.createElement("span");
      durBadge.className = "reward-dur " + (isPerm ? "permanent" : "floor");
      durBadge.textContent = isPerm ? "PERMANENT" : "THIS FLOOR";
      top.append(archTag, tierBadge, durBadge);
      // Title
      const title = document.createElement("div");
      title.className = "up-card-title";
      title.textContent = name;
      // Stat callout box
      const calloutBox = document.createElement("div");
      calloutBox.className = "up-card-callout";
      calloutBox.textContent = callout || desc.toUpperCase();
      // Description
      const descEl = document.createElement("div");
      descEl.className = "up-card-desc";
      descEl.textContent = desc;
      btn.append(top, title, calloutBox, descEl);
      // Synergy footer
      if (synergy) {
        const syn = document.createElement("div");
        syn.className = "up-card-synergy";
        syn.textContent = "💡 " + synergy;
        btn.appendChild(syn);
      }
    }

    function applyRewardEntry(entry) {
      const res = entry.grant(run.floor + 1);
      run.rewardsClaimed[run.floor] = true;
      return res.label;
    }

    // Floor reward picker — choose 1 of 3, each card explains what it does
    function openRewardPicker(entries, opts = {}) {
      const ov = document.getElementById("upgradeOverlay");
      const wrap = document.getElementById("upgradeCards");
      if (!ov || !wrap) return;
      const t = document.getElementById("upgradeTitle");
      const s = document.getElementById("upgradeSub");
      if (t) t.textContent = opts.title || "Floor Reward";
      if (s) s.textContent = opts.sub || "Pick one";
      const rr = document.getElementById("upgradeReroll");
      if (rr) rr.style.display = "none";
      wrap.innerHTML = "";
      entries.forEach(e => {
        const btn = document.createElement("button");
        btn.type = "button";
        buildRewardCard(btn, e, opts);
        btn.title = e.desc;
        btn.addEventListener("click", () => {
          const label = applyRewardEntry(e);
          ov.classList.remove("open");
          opts.onPick(label);
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    function openModifierPicker(onPick) {
      const ov = document.getElementById("upgradeOverlay");
      const wrap = document.getElementById("upgradeCards");
      const t = document.getElementById("upgradeTitle");
      const s = document.getElementById("upgradeSub");
      const rr = document.getElementById("upgradeReroll");
      if (!ov || !wrap) { onPick(null); return; }
      if (rr) rr.style.display = "none";
      const easy = FLOOR_MODIFIERS.filter(m => m.tier === "easy");
      const hard = FLOOR_MODIFIERS.filter(m => m.tier === "hard");
      const poolE = easy.slice();
      const poolH = hard.slice();
      for (let i = poolE.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [poolE[i], poolE[j]] = [poolE[j], poolE[i]]; }
      for (let i = poolH.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [poolH[i], poolH[j]] = [poolH[j], poolH[i]]; }
      const choices = [...poolE.slice(0, 2), ...poolH.slice(0, 1)];
      if (t) t.textContent = "Floor Modifier";
      if (s) s.textContent = "Pick a buff or a challenge for this floor";
      wrap.innerHTML = "";
      choices.forEach(m => {
        const btn = document.createElement("button");
        btn.type = "button";
        const arch = detectArchetype(m.name, m.desc, m.icon);
        const callout = extractCallout(m.name, m.desc);
        btn.className = "upgrade-card glow-" + arch.cls;
        // Top row
        const top = document.createElement("div");
        top.className = "up-card-top";
        const archTag = document.createElement("span");
        archTag.className = "up-card-archetype " + arch.cls;
        archTag.textContent = arch.tag;
        const tierBadge = document.createElement("span");
        tierBadge.className = "modifier-tier " + m.tier;
        tierBadge.textContent = m.tier === "hard" ? "CHALLENGE" : "BENEFIT";
        top.append(archTag, tierBadge);
        // Title
        const title = document.createElement("div");
        title.className = "up-card-title";
        title.textContent = (m.icon || "") + " " + m.name;
        // Callout
        const calloutBox = document.createElement("div");
        calloutBox.className = "up-card-callout";
        calloutBox.textContent = callout || m.desc.toUpperCase();
        // Description
        const descEl = document.createElement("div");
        descEl.className = "up-card-desc";
        descEl.textContent = m.desc;
        btn.append(top, title, calloutBox, descEl);
        if (m.tier === "hard") {
          const reward = document.createElement("div");
          reward.className = "modifier-reward";
          reward.textContent = " Rare reward guaranteed next floor";
          btn.appendChild(reward);
        }
        btn.addEventListener("click", () => {
          ov.classList.remove("open");
          onPick(m);
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    function openHardStatPicker(onPick) {
      const ov = document.getElementById("upgradeOverlay");
      const wrap = document.getElementById("upgradeCards");
      const t = document.getElementById("upgradeTitle");
      const s = document.getElementById("upgradeSub");
      const rr = document.getElementById("upgradeReroll");
      if (!ov || !wrap) { onPick(); return; }
      if (rr) rr.style.display = "none";
      if (t) t.textContent = "Challenge Bonus";
      if (s) s.textContent = "Pick a permanent upgrade for taking the challenge";
      wrap.innerHTML = "";
      const stats = [
        { icon: "❤️", name: "+5 Max HP", desc: "Permanently boost your health", tier: "uncommon", apply() { run.bonusMaxHp += 5; } },
        { icon: "🛡️", name: "+2 Max Shield", desc: "Higher shield ceiling", tier: "uncommon", apply() { run.bonusShieldMax += 2; } },
        { icon: "⚔️", name: "+1 Sword Damage", desc: "Permanently stronger swords", tier: "uncommon", apply() { run.bonusSwordDmg += 1; } },
        { icon: "⭐", name: "+1 Star Damage", desc: "Permanently stronger stars", tier: "uncommon", apply() { run.bonusStarDmg += 1; } }
      ];
      stats.forEach(st => {
        const btn = document.createElement("button");
        btn.type = "button";
        buildRewardCard(btn, st, { permanent: true });
        btn.addEventListener("click", () => {
          st.apply();
          ov.classList.remove("open");
          onPick();
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    function showFloorBanner() {
      const ov = document.getElementById("floorBannerOverlay");
      const kicker = document.getElementById("floorBannerKicker");
      const title = document.getElementById("floorBannerTitle");
      const sub = document.getElementById("floorBannerSub");
      if (!ov) return;
      let kick = "Floor";
      let extra = "";
      if (BOSS_KITS[run.floor]) {
        kick = "Boss Floor";
        extra = BOSS_KITS[run.floor].name;
      } else if (isEliteFloor(run.floor)) {
        kick = "Elite Floor";
        extra = (ELITE_KITS[run.floor] && ELITE_KITS[run.floor].name) || "Powerful foe";
      }
      if (combat.floorModifier) {
        extra = (extra ? extra + " — " : "") + combat.floorModifier.icon + " " + combat.floorModifier.name;
      }
      kicker.textContent = kick;
      title.textContent = String(run.floor);
      sub.textContent = extra;
      ov.classList.add("open");
      setTimeout(() => ov.classList.remove("open"), 1400);
    }

    // Reusable centered banner (floors, phases, big moments)
    function showBannerCard(kicker, title, sub, variant) {
      const ov = document.getElementById("floorBannerOverlay");
      const card = document.getElementById("floorBannerCard");
      if (!ov || !card) return;
      const k = document.getElementById("floorBannerKicker");
      const t = document.getElementById("floorBannerTitle");
      const s = document.getElementById("floorBannerSub");
      if (k) k.textContent = kicker;
      if (t) t.textContent = title;
      if (s) s.textContent = sub;
      card.classList.remove("fever", "impact");
      if (variant) card.classList.add(variant);
      ov.classList.add("open");
      setTimeout(() => {
        ov.classList.remove("open");
        card.classList.remove("fever", "impact");
      }, 1500);
    }

    function showUltReadyBanner() {
      if (combat.ultAnnounced) return;
      combat.ultAnnounced = true;
      const ov = document.getElementById("ultReadyOverlay");
      if (!ov) return;
      ov.classList.add("open");
      setTimeout(() => ov.classList.remove("open"), 1600);
      setLog("🔥 ULTIMATE READY!");
    }

    function showVictoryOverlay(reward) {
      pauseRunTimer();
      // Context line + damage breakdown for the floor just cleared
      const s = combat.stats || {};
      const sub = document.getElementById("gameOverSubtitle");
      if (sub) {
        const diff = String(settings.difficulty || "normal");
        sub.textContent = `Floor ${run.floor} · ${combat.enemyName || "Rival"} · ${diff[0].toUpperCase() + diff.slice(1)} · ⏱ ${fmtTime(run.floorElapsedMs)}`;
      }
      const sum = document.getElementById("victorySummary");
      if (sum) {
        const totalDealt = (s.sword || 0) + (s.star || 0) + (s.runic || 0) + (s.poison || 0) + (s.fracture || 0) + (s.ult || 0) + (s.reflect || 0);
        sum.innerHTML =
          `<div class="victory-stat damage"><span>⚔️ Damage dealt</span><b>${totalDealt}</b></div>` +
          `<div class="victory-stat"><span>💔 Damage taken</span><b>${s.taken || 0}</b></div>` +
          `<div class="victory-stat heal"><span>💚 Healed</span><b>${s.healed || 0}</b></div>` +
          `<div class="victory-stat shield"><span>🛡️ Shield gained</span><b>${s.shield || 0}</b></div>` +
          `<div class="victory-stat"><span>🔁 Turns</span><b>${combat.turn || 0}</b></div>` +
          `<div class="victory-stat"><span>⭐ Charge</span><b>${combat.sigBank}/${settings.ultMaxCharge}</b></div>`;
      }
      const vs = document.getElementById("victoryStats");
      if (vs) {
        const chips = [];
        const add = (emoji, label, val) => { if (val > 0) chips.push(`<span class="victory-chip">${emoji} ${label} <b>${val}</b></span>`); };
        add("⚔️", "Sword", s.sword);
        add("⭐", "Star", s.star);
        add("🔮", "Runic", s.runic);
        add("☠️", "Poison", s.poison);
        add("🦴", "Fracture", s.fracture);
        add("💥", "Ult", s.ult);
        add("↩️", "Reflect", s.reflect);
        vs.innerHTML = chips.join("") || '<span class="victory-chip">No actions</span>';
      }
      // reward may be a string (picker pick) or { label, permanent, tempLabel }
      const label = typeof reward === "string" ? reward : reward && reward.label;
      const permanent = typeof reward === "string" ? true : reward && reward.permanent !== false;
      const temp = reward && reward.tempLabel;
      if (label) { if (!run.pickLog) run.pickLog = []; run.pickLog.push(label); }
      if (temp) { if (!run.pickLog) run.pickLog = []; run.pickLog.push(temp); }
      const rewardMsg = document.getElementById("rewardMsg");
      const mod = run.pendingModifier;
      const isFinal = run.floor >= MAX_FLOOR;
      gameOverOverlay.classList.remove("lose");
      gameOverOverlay.classList.add("win");
      if (isFinal) {
        document.getElementById("gameOverTitle").textContent = "Campaign Clear!";
        document.getElementById("gameOverMsg").textContent = `All ${MAX_FLOOR} floors conquered · ⏱ ${fmtTime(run.elapsedMs)}`;
        rewardMsg.innerHTML = label
          ? (permanent ? `🎁 Permanent: ${label}` : `🎁 ${label}`)
          : "🏆 Victory";
        document.getElementById("btnGoRetry").textContent = "Menu";
        clearSave();
      } else {
        document.getElementById("gameOverTitle").textContent = `Floor ${run.floor} Clear`;
        document.getElementById("gameOverMsg").textContent = isBossFloor(run.floor)
          ? "Boss defeated!"
          : isEliteFloor(run.floor)
            ? "Elite defeated!"
            : "Rival defeated.";
        let msg = "";
        if (label) {
          msg = permanent
            ? `🎁 Permanent: ${label}${temp ? `<br>⚡ Rare perk for next floor: ${temp}` : ""}`
            : `🎁 ${label}`;
        }
        if (mod) {
          msg += `<br>${mod.icon} Modifier: ${mod.name}`;
        }
        rewardMsg.innerHTML = msg;
        document.getElementById("btnGoRetry").textContent = "Next Floor";
        const savedFloor = run.floor;
        run.floor = savedFloor + 1;
        saveRun();
        run.floor = savedFloor;
      }
      // Mark tutorial complete after floor 1
      if (combat.tutorial && !settings.tutorialCompleted) {
        settings.tutorialCompleted = true;
        persistSettings();
      }
      sayVoice("victory", { force: true });
      playVictory();
      gameOverOverlay.classList.add("open");
      recordRun(true);
    }

    // --- Branch system (Whispering Staircase) ---
    const branchOverlay = () => document.getElementById("branchOverlay");
    const branchCards = () => document.getElementById("branchCards");
    const branchResult = () => document.getElementById("branchResult");
    const branchSubtitle = () => document.getElementById("branchSubtitle");

    function isBranchFloor(f) { return BRANCH_FLOORS.includes(f); }

    function showBranchOverlay() {
      const ov = branchOverlay();
      const sub = branchSubtitle();
      const cards = branchCards();
      const res = branchResult();
      if (!ov || !cards) return;
      if (sub) sub.textContent = `Floor ${run.floor} cleared — choose your path`;
      if (res) { res.textContent = ""; res.style.opacity = 0; }
      cards.innerHTML = "";
      const node = pickBranchNode();
      // Left door: always safe (normal fight)
      const left = makeBranchCard("⚔️", "A Guarded Hall", "Normal foe, no tricks", "safe", () => {
        hideBranchOverlay();
        startBattle({ fromVictory: true });
        saveRun();
      });
      // Right door: gamble
      const right = makeBranchCard(node.icon, node.name, node.desc, "gamble", () => {
        right.classList.add("disabled");
        left.classList.add("disabled");
        applyBranchOutcome(node, () => {
          hideBranchOverlay();
          startBattle({ fromVictory: true });
          saveRun();
        });
      });
      cards.appendChild(left);
      cards.appendChild(right);
      ov.classList.add("open");
    }

    function hideBranchOverlay() {
      const ov = branchOverlay();
      if (ov) ov.classList.remove("open");
    }

    function makeBranchCard(icon, name, desc, className, onClick) {
      const el = document.createElement("div");
      el.className = `upgrade-card branch-card ${className}`;
      el.innerHTML = `<div class="branch-card-icon">${icon}</div><div class="branch-card-name">${name}</div><div class="branch-card-desc">${desc}</div>`;
      el.addEventListener("click", onClick);
      return el;
    }

    function pickBranchNode() {
      const roll = Math.random();
      if (roll < 0.45) return pickMysteryNode();
      if (roll < 0.75) return pickShrineNode();
      return pickAltarNode();
    }

    function pickMysteryNode() {
      return { type: "mystery", icon: "🎲", name: "The Whispering Door", desc: "Flip for a mystery effect — buff or debuff" };
    }
    function pickShrineNode() {
      return { type: "shrine", icon: "🔮", name: "Shrine of Fortune", desc: "Pick 1 of 3 — two blessings, one curse" };
    }
    function pickAltarNode() {
      return { type: "altar", icon: "🩸", name: "Altar of the Tower", desc: "Sacrifice 15% max HP for a permanent upgrade" };
    }

    function applyBranchOutcome(node, cb) {
      if (node.type === "mystery") applyMysteryFlip(cb);
      else if (node.type === "shrine") applyShrinePick(cb);
      else if (node.type === "altar") applyBloodAltar(cb);
      else cb();
    }

    // --- Mystery Card: 70% buff / 30% debuff ---
    function applyMysteryFlip(cb) {
      const res = branchResult();
      const isBuff = Math.random() < 0.7;
      if (isBuff) {
        const pool = BRANCH_BUFFS.filter(b => !(run.branchSeenBuffs || []).includes(b.id));
        const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : BRANCH_BUFFS[Math.floor(Math.random() * BRANCH_BUFFS.length)];
        pick.apply();
        if (!run.branchSeenBuffs) run.branchSeenBuffs = [];
        run.branchSeenBuffs.push(pick.id);
        if (res) { res.innerHTML = `<span class="buff">${pick.icon} ${pick.name}</span> — ${pick.desc}`; res.style.opacity = 1; }
      } else {
        const pool = BRANCH_DEBUFFS.filter(d => !(run.branchSeenDebuffs || []).includes(d.id));
        const pick = pool.length ? pool[Math.floor(Math.random() * pool.length)] : BRANCH_DEBUFFS[Math.floor(Math.random() * BRANCH_DEBUFFS.length)];
        run.pendingBranchDebuff = pick.id;
        if (!run.branchSeenDebuffs) run.branchSeenDebuffs = [];
        run.branchSeenDebuffs.push(pick.id);
        if (res) { res.innerHTML = `<span class="debuff">${pick.icon} ${pick.name}</span> — ${pick.desc}`; res.style.opacity = 1; }
      }
      setTimeout(cb, 1200);
    }

    // --- Three Shrines: pick 1 of 3 (2 blessings, 1 curse) ---
    function applyShrinePick(cb) {
      const cards = branchCards();
      const res = branchResult();
      if (!cards) { cb(); return; }
      cards.innerHTML = "";
      // Pick 2 buffs + 1 debuff
      const buffPool = BRANCH_BUFFS.filter(b => !(run.branchSeenBuffs || []).includes(b.id));
      const debuffPool = BRANCH_DEBUFFS.filter(d => !(run.branchSeenDebuffs || []).includes(d.id));
      const b1 = buffPool.length ? buffPool[Math.floor(Math.random() * buffPool.length)] : BRANCH_BUFFS[Math.floor(Math.random() * BRANCH_BUFFS.length)];
      let b2Pool = buffPool.filter(b => b.id !== b1.id);
      const b2 = b2Pool.length ? b2Pool[Math.floor(Math.random() * b2Pool.length)] : BRANCH_BUFFS.find(b => b.id !== b1.id) || BRANCH_BUFFS[0];
      const d1 = debuffPool.length ? debuffPool[Math.floor(Math.random() * debuffPool.length)] : BRANCH_DEBUFFS[Math.floor(Math.random() * BRANCH_DEBUFFS.length)];
      const choices = [b1, b2, d1];
      // Shuffle
      for (let i = choices.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [choices[i], choices[j]] = [choices[j], choices[i]]; }
      const shrineWrap = document.createElement("div");
      shrineWrap.className = "branch-shrines";
      choices.forEach(node => {
        const isDebuff = node === d1;
        const card = document.createElement("div");
        card.className = `upgrade-card branch-card shrine`;
        card.innerHTML = `<div class="branch-card-icon">${node.icon}</div><div class="branch-card-name">${node.name}</div><div class="branch-card-desc">${node.desc}</div>`;
        card.addEventListener("click", () => {
          shrineWrap.querySelectorAll(".branch-card").forEach(c => c.style.pointerEvents = "none");
          if (isDebuff) {
            run.pendingBranchDebuff = node.id;
            if (!run.branchSeenDebuffs) run.branchSeenDebuffs = [];
            run.branchSeenDebuffs.push(node.id);
            if (res) { res.innerHTML = `<span class="debuff">${node.icon} ${node.name}</span> — ${node.desc}`; res.style.opacity = 1; }
          } else {
            node.apply();
            if (!run.branchSeenBuffs) run.branchSeenBuffs = [];
            run.branchSeenBuffs.push(node.id);
            if (res) { res.innerHTML = `<span class="buff">${node.icon} ${node.name}</span> — ${node.desc}`; res.style.opacity = 1; }
          }
          setTimeout(cb, 1200);
        });
        shrineWrap.appendChild(card);
      });
      cards.appendChild(shrineWrap);
    }

    // --- Blood Altar: pay 15% max HP → permanent upgrade ---
    function applyBloodAltar(cb) {
      const res = branchResult();
      const hpCost = Math.max(1, Math.floor(combat.playerMaxHp * 0.15));
      if (combat.playerHp <= Math.floor(combat.playerMaxHp * 0.3)) {
        // Too low HP — altar refuses
        if (res) { res.innerHTML = `<span class="debuff">💔 Not enough blood...</span> — The altar rejects you.`; res.style.opacity = 1; }
        run.pendingBranchBuff = "bHealFull"; // consolation: heal to full
        setTimeout(cb, 1200);
        return;
      }
      const cards = branchCards();
      if (!cards) { cb(); return; }
      cards.innerHTML = "";
      // Pick 3 upgrade options from RUN_UPGRADES (class-filtered, not yet picked)
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const avail = RUN_UPGRADES.filter(u => {
        if ((run.pickedUpgrades || []).includes(u.id)) return false;
        if (u.classRequirement === "ANY") return true;
        return u.classRequirement === hero;
      });
      const shuffled = avail.slice();
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      const picks = shuffled.slice(0, Math.min(3, shuffled.length));
      if (picks.length === 0) {
        // No upgrades available — heal as consolation
        if (res) { res.innerHTML = `<span class="buff">💚 Tower's Mercy</span> — No upgrades remain. Healed to full.`; res.style.opacity = 1; }
        combat.playerHp = combat.playerMaxHp;
        setTimeout(cb, 1200);
        return;
      }
      // Show pay prompt first
      if (res) { res.innerHTML = `🩸 Sacrifice <b>${hpCost} HP</b> for a permanent upgrade?`; res.style.opacity = 1; }
      const altWrap = document.createElement("div");
      altWrap.className = "branch-shrines";
      picks.forEach(upg => {
        const card = document.createElement("div");
        card.className = "upgrade-card branch-card altar";
        card.innerHTML = `<div class="branch-card-name">${upg.name}</div><div class="branch-card-desc">${upg.desc}</div>`;
        card.addEventListener("click", () => {
          altWrap.querySelectorAll(".branch-card").forEach(c => c.style.pointerEvents = "none");
          combat.playerHp = Math.max(1, combat.playerHp - hpCost);
          upg.apply();
          if (!run.pickedUpgrades) run.pickedUpgrades = [];
          run.pickedUpgrades.push(upg.id);
          if (res) { res.innerHTML = `<span class="buff">🩸 ${upg.name}</span> — −${hpCost} HP. Permanent!`; res.style.opacity = 1; }
          setTimeout(cb, 1200);
        });
        altWrap.appendChild(card);
      });
      cards.appendChild(altWrap);
    }

    // Boss win → choose 1 of 3 upgrades (4 with a pending extra-pick reward), then show the victory overlay
    function openUpgradePicker(onPick) {
      const wrap = document.getElementById("upgradeCards");
      const ov = document.getElementById("upgradeOverlay");
      if (!wrap || !ov) { onPick(null); return; }
      const pend = run.pending || {};
      let rerollLeft = pend.reroll || 0;
      const extra = pend.extraPick || 0;
      pend.extraPick = 0;
      pend.reroll = 0;
      const render = () => {
        const choices = pickUpgradeChoices(3 + extra);
        const hero = (combat.playerClass || "ninja").toUpperCase();
        wrap.innerHTML = "";
        choices.forEach(u => {
          const btn = document.createElement("button");
          btn.type = "button";
          if (u.desc) {
            buildRewardCard(btn, { name: u.name || u.label, desc: u.desc, tier: "uncommon" }, { permanent: true });
            btn.title = u.desc;
            // Synergy tag: BEST if class-specific for this hero, GOOD if general
            const topRow = btn.querySelector(".up-card-top");
            if (topRow) {
              const tag = document.createElement("span");
              tag.className = "up-card-synergy-tag";
              if (u.classRequirement && u.classRequirement !== "ANY") {
                tag.textContent = "★ BEST";
                tag.classList.add("best");
              } else {
                tag.textContent = "GOOD";
                tag.classList.add("ok");
              }
              topRow.appendChild(tag);
            }
          } else {
            btn.className = "upgrade-card glow-general";
            btn.textContent = u.name || u.label;
          }
          btn.addEventListener("click", () => {
            run.pickedUpgrades.push(u.id);
            run.rewardsClaimed[run.floor] = true;
            u.apply();
            ov.classList.remove("open");
            onPick(u.name || u.label);
          });
          wrap.appendChild(btn);
        });
      };
      render();
      const rrBtn = document.getElementById("upgradeReroll");
      if (rrBtn) {
        rrBtn.style.display = rerollLeft > 0 ? "" : "none";
        rrBtn.textContent = rerollLeft > 0 ? `Reroll (${rerollLeft})` : "Reroll";
        rrBtn.addEventListener("click", () => {
          if (rerollLeft <= 0) return;
          rerollLeft--;
          render();
          if (rerollLeft <= 0) rrBtn.style.display = "none";
        });
      }
      ov.classList.add("open");
    }

    function checkGameOver() {
      if (gameOver) return;
      document.body.classList.remove("your-turn");
      if (combat.enemyHp <= 0) {
        gameOver = true;
        busy = true;
        if (isBossFloor(run.floor)) {
          openUpgradePicker(rewardLabel => showVictoryOverlay(rewardLabel));
        } else if (isEliteFloor(run.floor)) {
          const perm = GAUNTLET_REWARDS[run.floor];
          let permanentLabel = null;
          if (perm) {
            perm.apply();
            permanentLabel = perm.label;
          }
          openRewardPicker(buildEliteTempChoices(), {
            title: "Elite Reward",
            sub: "Pick a rare perk for the next floor",
            onPick: label => openModifierPicker(mod => {
              run.pendingModifier = mod;
              if (mod && mod.tier === "hard") {
                run.pendingModifierRare = true;
                openHardStatPicker(() => {
                  showVictoryOverlay({ label: permanentLabel, permanent: true, tempLabel: label });
                });
              } else {
                showVictoryOverlay({ label: permanentLabel, permanent: true, tempLabel: label });
              }
            })
          });
        } else {
          openRewardPicker(buildFloorRewardChoices(), {
            title: "Floor Reward",
            sub: "Pick one — it applies to the next floor",
            onPick: label => openModifierPicker(mod => {
              run.pendingModifier = mod;
              if (mod && mod.tier === "hard") {
                run.pendingModifierRare = true;
                openHardStatPicker(() => {
                  showVictoryOverlay({ label, permanent: false });
                });
              } else {
                showVictoryOverlay({ label, permanent: false });
              }
            })
          });
        }
      } else if (combat.playerHp <= 0) {
        gameOver = true;
        busy = true;
        pauseRunTimer();
        gameOverOverlay.classList.remove("win");
        gameOverOverlay.classList.add("lose");
        shakeBoard("strong");
        document.getElementById("gameOverTitle").textContent = "Defeat";
        document.getElementById("gameOverMsg").textContent = `Fell on floor ${run.floor} · ⏱ ${fmtTime(run.elapsedMs)}`;
        document.getElementById("rewardMsg").textContent = "";
        document.getElementById("victoryStats").innerHTML = "";
        document.getElementById("victorySummary").innerHTML = "";
        document.getElementById("gameOverSubtitle").textContent = "";
        document.getElementById("btnGoRetry").textContent = "Retry Floor";
        saveRun(); // resume same floor
        sayVoice("defeat", { force: true });
        playDefeat();
        gameOverOverlay.classList.add("open");
        recordRun(false);
      }
    }

    const SAVE_KEY = "puzzleGridRun_v1";
    const HISTORY_KEY = "puzzleGridHistory_v1";
    const MAX_HISTORY = 20;

    function loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (_) { return []; }
    }

    function saveHistory(entry) {
      try {
        const list = loadHistory();
        list.unshift(entry);
        if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch (_) {}
    }

    function recordRun(won) {
      const s = combat.stats || {};
      const hero = CHARACTERS[combat.playerClass] || {};
      saveHistory({
        ts: Date.now(),
        hero: combat.playerClass,
        heroName: hero.name || combat.playerClass,
        diff: settings.difficulty || "normal",
        floor: run.floor,
        won: !!won,
        hp: combat.playerHp,
        maxHp: combat.playerMaxHp,
        picks: run.pickLog || [],
        dealt: (s.sword || 0) + (s.star || 0) + (s.runic || 0) + (s.poison || 0) + (s.fracture || 0) + (s.ult || 0) + (s.reflect || 0),
        timeMs: run.elapsedMs || 0
      });
    }

    function saveRun() {
      try {
        const data = {
          floor: run.floor,
          bonusMaxHp: run.bonusMaxHp,
          bonusShieldMax: run.bonusShieldMax,
          bonusApMax: run.bonusApMax,
          rewardsClaimed: run.rewardsClaimed,
          pickedUpgrades: run.pickedUpgrades,
          ultChargeBonus: run.ultChargeBonus,
          bonusSwordDmg: run.bonusSwordDmg,
          bonusStarDmg: run.bonusStarDmg,
          bonusHeal: run.bonusHeal,
          floorShieldBonus: run.floorShieldBonus,
          feverEarly: run.feverEarly,
          enemyUltSlow: run.enemyUltSlow,
          pending: run.pending,
          pendingModifier: run.pendingModifier,
          pendingModifierRare: run.pendingModifierRare,
          pendingBranchDebuff: run.pendingBranchDebuff || null,
          pendingBranchBuff: run.pendingBranchBuff || null,
          branchSeenBuffs: run.branchSeenBuffs || [],
          branchSeenDebuffs: run.branchSeenDebuffs || [],
          playerClass: combat.playerClass,
          difficulty: settings.difficulty,
          elapsedMs: run.elapsedMs || 0,
          floorElapsedMs: run.floorElapsedMs || 0
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      } catch (_) {}
    }

    function loadRun() {
      try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }

    function clearSave() {
      try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
    }

    function hasSave() {
      const d = loadRun();
      return d && d.floor >= 1 && d.floor <= MAX_FLOOR;
    }

    function refreshContinueBtn() {
      const btn = document.getElementById("btnContinue");
      const span = document.getElementById("continueFloor");
      if (!btn) return;
      if (hasSave()) {
        const d = loadRun();
        btn.style.display = "";
        if (span) span.textContent = String(d.floor);
      } else {
        btn.style.display = "none";
      }
    }

    function resetRun() {
      run.floor = 1;
      combat.tutorial = false;
      run.bonusMaxHp = 0;
      run.bonusShieldMax = 0;
      run.bonusApMax = 0;
      run.rewardsClaimed = {};
      run.pickedUpgrades = [];
      run.ultChargeBonus = 0;
      run.bonusSwordDmg = 0;
      run.bonusStarDmg = 0;
      run.bonusHeal = 0;
      run.floorShieldBonus = 0;
      run.feverEarly = 0;
      run.enemyUltSlow = 0;
      run.pickLog = [];
      run.cascadeAp = false; run.crossAp = false; run.overflowBoost = false;
      run.bloomCharge = false; run.sigDouble = false; run.boardWhisper = false;
      run.phasePower = false; run.fortifiedStart = false; run.venomous = false;
      run.deepFracture = false; run.arcaneMirror = false; run.lingeringShadow = false;
      run.heavyChains = false; run.momentum = false; run.luckyDice = false;
      run.runicShield = false; run.manaSurge = false; run.mortalStrike = false; run.bulwark = false;
      run.venomousBlade = false; run.miasmaReflex = false; run.acidicBarrier = false; run.contagionCatalyst = false;
      run.corrosiveOverheal = false; run.toxicFortitude = false;
      run.pending = { extraPick: 0, reroll: 0, bonusAp: 0, empower: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, feverBoost: 0, critChance: 0, shieldConvert: 0 };
      run.pendingModifier = null;
      run.pendingModifierRare = false;
      run.pendingBranchDebuff = null;
      run.pendingBranchBuff = null;
      run.branchSeenBuffs = [];
      run.branchSeenDebuffs = [];
      run.elapsedMs = 0;
      run.floorElapsedMs = 0;
      timerRunning = false;
      AP_MAX = 3;
      clearSave();
    }

    function applyLoadedRun(d) {
      run.floor = Math.max(1, Math.min(MAX_FLOOR, d.floor | 0));
      run.bonusMaxHp = d.bonusMaxHp | 0;
      run.bonusShieldMax = d.bonusShieldMax | 0;
      run.bonusApMax = d.bonusApMax | 0;
      run.rewardsClaimed = d.rewardsClaimed || {};
      run.pickedUpgrades = d.pickedUpgrades || [];
      run.ultChargeBonus = d.ultChargeBonus | 0;
      run.bonusSwordDmg = d.bonusSwordDmg | 0;
      run.bonusStarDmg = d.bonusStarDmg | 0;
      run.bonusHeal = d.bonusHeal | 0;
      run.floorShieldBonus = d.floorShieldBonus | 0;
      run.feverEarly = d.feverEarly | 0;
      run.enemyUltSlow = d.enemyUltSlow | 0;
      run.elapsedMs = d.elapsedMs | 0;
      run.floorElapsedMs = 0; // fresh floor timing on continue
      // Re-derive transformative upgrades from the picked list (not stored as flags)
      run.cascadeAp = (run.pickedUpgrades || []).includes("cascadeAp");
      run.crossAp = (run.pickedUpgrades || []).includes("crossAp");
      run.overflowBoost = (run.pickedUpgrades || []).includes("overflowBoost");
      run.bloomCharge = (run.pickedUpgrades || []).includes("bloomCharge");
      run.sigDouble = (run.pickedUpgrades || []).includes("sigDouble");
      run.boardWhisper = (run.pickedUpgrades || []).includes("boardWhisper");
      run.phasePower = (run.pickedUpgrades || []).includes("phasePower");
      run.fortifiedStart = (run.pickedUpgrades || []).includes("fortifiedStart");
      run.venomous = (run.pickedUpgrades || []).includes("venomous");
      run.deepFracture = (run.pickedUpgrades || []).includes("deepFracture");
      run.arcaneMirror = (run.pickedUpgrades || []).includes("arcaneMirror");
      run.lingeringShadow = (run.pickedUpgrades || []).includes("lingeringShadow");
      run.heavyChains = (run.pickedUpgrades || []).includes("heavyChains");
      run.momentum = (run.pickedUpgrades || []).includes("momentum");
      run.luckyDice = (run.pickedUpgrades || []).includes("luckyDice");
      run.runicShield = (run.pickedUpgrades || []).includes("runicShield");
      run.manaSurge = (run.pickedUpgrades || []).includes("manaSurge");
      run.mortalStrike = (run.pickedUpgrades || []).includes("mortalStrike");
      run.bulwark = (run.pickedUpgrades || []).includes("bulwark");
      run.venomousBlade = (run.pickedUpgrades || []).includes("venomousBlade");
      run.miasmaReflex = (run.pickedUpgrades || []).includes("miasmaReflex");
      run.acidicBarrier = (run.pickedUpgrades || []).includes("acidicBarrier");
      run.contagionCatalyst = (run.pickedUpgrades || []).includes("contagionCatalyst");
      run.corrosiveOverheal = (run.pickedUpgrades || []).includes("corrosiveOverheal");
      run.toxicFortitude = (run.pickedUpgrades || []).includes("toxicFortitude");
      run.pending = Object.assign(
        { extraPick: 0, reroll: 0, bonusAp: 0, empower: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, feverBoost: 0, critChance: 0, shieldConvert: 0 },
        d.pending || {}
      );
      AP_MAX = 3 + run.bonusApMax;
      run.pendingModifier = d.pendingModifier || null;
      run.pendingModifierRare = !!d.pendingModifierRare;
      run.pendingBranchDebuff = d.pendingBranchDebuff || null;
      run.pendingBranchBuff = d.pendingBranchBuff || null;
      run.branchSeenBuffs = d.branchSeenBuffs || [];
      run.branchSeenDebuffs = d.branchSeenDebuffs || [];
      if (d.playerClass && HERO_STATS[d.playerClass]) combat.playerClass = d.playerClass;
      if (d.difficulty) settings.difficulty = d.difficulty;
    }

    function startBattle(opts = {}) {
      // opts.fromVictory = true → advance floor; opts.retry = stay on floor
      if (opts.fromVictory) {
        if (run.floor >= MAX_FLOOR) {
          resetRun();
          showScreen("menu");
          buildCharPick();
          return;
        }
        run.floor += 1;
        // Tutorial ends after floor 1
        if (combat.tutorial) combat.tutorial = false;
      }
      // defeat retry keeps same floor; fresh start from the menu resets via resetRun

      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      const maxHp = hero.hp + run.bonusMaxHp;
      const maxSh = hero.maxShieldCap + run.bonusShieldMax;
      AP_MAX = 3 + run.bonusApMax;

      gameOver = false;
      gameOverOverlay.classList.remove("open");
      combat.playerMaxHp = maxHp;
      combat.playerHp = maxHp;
      combat.shield = Math.min(maxSh, hero.startShield + (run.floorShieldBonus || 0) + ((run.pending && run.pending.shield) || 0) + (run.fortifiedStart ? 4 + Math.floor(Math.random() * 3) : 0));
      combat.enemyShield = 0;
      combat.sigBank = 0;
      combat.ap = AP_MAX + ((run.pending && run.pending.bonusAp) || 0);
      combat.enemyAp = Math.min(AP_MAX, 3); // rival caps at base AP
      combat.tempSwordDmg = (run.pending && run.pending.swordBoost) || 0;
      combat.feverBoost = (run.pending && run.pending.feverBoost) || 0;
      combat.critChance = (run.pending && run.pending.critChance) || 0;
      combat.shieldConvertPct = (run.pending && run.pending.shieldConvert) || 0;
      combat.cascadeApRefunded = false;
      combat.reflectPct = Math.min(0.65, (hero.reflectPct || 0) + 0.02 * (run.floor - 1) + (run.arcaneMirror ? 0.1 : 0));
      combat.turn = 1;
      combat.playerTurn = true;
      combat.tutorial = !!opts.tutorial;
      combat.empowerNext = !!((run.pending && run.pending.empower) || 0);
      combat.blindNext = false;
      combat.weakenNextSword = false;
      combat.poisonTurns = 0;
      combat.enemyPoisonTurns = Math.max(combat.enemyPoisonTurns, (run.pending && run.pending.enemyPoison) || 0);
      combat.poisonStacks = 0;
      combat.acidStacks = 0;
      combat.firstHitDodged = false;
      combat.afterglowTurns = 0;
      combat.markStacks = 0;
      combat.enemyWeakenTurns = 0;
      combat.fractureStacks = 0;
      combat.fractureTurns = 0;
      combat.mortalWoundTurns = 0;
      combat.manaLockTurns = 0;
      combat.enemyVeilUsed = false;
      combat.enemyAfterglowTurns = 0;
      combat.playerFractureStacks = 0;
      combat.playerFractureTurns = 0;
      combat.playerMortalWoundTurns = 0;
      combat.logHistory = [];
      combat.stats = { sword: 0, star: 0, runic: 0, poison: 0, fracture: 0, ult: 0, reflect: 0, taken: 0, healed: 0, shield: 0 };
      combat.ultAnnounced = false;
      combat.enemyUltCharge = 0;
      combat.bossKit = BOSS_KITS[run.floor] || null;
      combat.eliteKit = ELITE_KITS[run.floor] || null;
      combat.enemyClass = pickEnemyVisual(run.floor);
      combat.enemyUltNeed = combat.bossKit ? combat.bossKit.ultTurns + (run.enemyUltSlow || 0) : 4 + (run.enemyUltSlow || 0);
      combat.enemyUltNeed += (run.pending && run.pending.enemySlow) || 0;
      combat.enemyUltNeed += run.heavyChains ? 1 : 0;
      combat.enemyArchetype = (combat.bossKit || combat.eliteKit) ? null : pickEnemyArchetype(run.floor);
      combat.enemySpecialCharge = 0;
      combat.enemySpecialNeed = 4 + Math.floor(Math.random() * 2) + ((run.pending && run.pending.enemySlow) || 0) + (run.heavyChains ? 1 : 0); // 4 or 5
      // Pending next-floor rewards are consumed when the floor begins
      run.pending = { extraPick: 0, reroll: 0, bonusAp: 0, empower: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, feverBoost: 0, critChance: 0, shieldConvert: 0 };
      // Apply floor modifier
      combat.floorModifier = run.pendingModifier || null;
      run.pendingModifier = null;
      // Clear previous floor's modifier state
      combat.tempStarDmg = 0;
      combat.armorPlating = 0;
      combat.glassCannon = false;
      combat.cascadeDamageMult = 0;
      combat.enemySpeedMult = 1;
      combat.shieldCapOverride = 0;
      if (combat.floorModifier) {
        combat.floorModifier.apply(combat);
        if (combat.enemySpeedMult && combat.enemySpeedMult !== 1) {
          combat.enemyUltNeed = Math.max(1, Math.round(combat.enemyUltNeed * combat.enemySpeedMult));
          combat.enemySpecialNeed = Math.max(1, Math.round(combat.enemySpecialNeed * combat.enemySpeedMult));
        }
        if (combat.shieldCapOverride) {
          combat.shield = Math.min(combat.shield, combat.shieldCapOverride);
        }
      }
      run.pendingModifierRare = false;
      // Apply pending branch debuff/buff from the Whispering Staircase
      if (run.pendingBranchDebuff) {
        const bd = BRANCH_DEBUFFS.find(d => d.id === run.pendingBranchDebuff);
        if (bd) {
          bd.apply(combat);
          if (combat.enemySpeedMult && combat.enemySpeedMult !== 1) {
            combat.enemyUltNeed = Math.max(1, Math.round(combat.enemyUltNeed * combat.enemySpeedMult));
            combat.enemySpecialNeed = Math.max(1, Math.round(combat.enemySpecialNeed * combat.enemySpeedMult));
          }
          if (combat.shieldCapOverride) {
            combat.shield = Math.min(combat.shield, combat.shieldCapOverride);
          }
        }
        run.pendingBranchDebuff = null;
      }
      if (run.pendingBranchBuff) {
        const bb = BRANCH_BUFFS.find(b => b.id === run.pendingBranchBuff);
        if (bb) bb.apply();
        run.pendingBranchBuff = null;
      }
      busy = false;

      // Single enemy setup (boss / elite / normal)
      const arch = combat.enemyArchetype;
      const elite = combat.eliteKit;
      let unitHp = enemyHpForFloor(run.floor);
      if (elite) unitHp = Math.round(unitHp * (elite.hpMul || 1.5));
      else if (arch) unitHp = Math.round(unitHp * (arch.hpMul || 1));

      if (combat.bossKit) {
        combat.enemyFullName = combat.bossKit.name;
        combat.enemyName = displayEnemyName(combat.bossKit.name);
      } else if (elite) {
        combat.enemyFullName = elite.name;
        combat.enemyName = displayEnemyName(elite.name);
      } else {
        const nm = randomEnemyName();
        combat.enemyFullName = nm;
        combat.enemyName = nm;
      }
      combat.enemyMaxHp = unitHp;
      combat.enemyHp = unitHp;
      combat.enemyShield = arch && arch.startShield ? arch.startShield : 0;

      if (opts.tutorial) {
        // Tutorial: weak passive dummy
        combat.bossKit = null;
        combat.eliteKit = null;
        combat.enemyArchetype = null;
        combat.enemyClass = "slime";
        combat.enemyFullName = "Training Dummy";
        combat.enemyName = "Training Dummy";
        combat.enemyMaxHp = Math.round(unitHp * 0.25);
        combat.enemyHp = combat.enemyMaxHp;
        combat.enemyShield = 0;
        combat.enemyUltCharge = 0;
        combat.enemySpecialCharge = 0;
      }

      const floorEl = document.getElementById("floorNum");
      if (floorEl) floorEl.textContent = String(run.floor);
      const floorTotalEl = document.getElementById("floorTotal");
      if (floorTotalEl) floorTotalEl.textContent = String(MAX_FLOOR);

      build();
      setupFighters();
      document.getElementById("enemyName").textContent = combat.enemyName;
      refreshCombatUI();
      const floorNote = combat.bossKit
        ? " · BOSS"
        : elite
          ? " · ELITE"
          : "";
      if (opts.tutorial) {
        setLog(`Floor ${run.floor} · Tutorial · ${combat.enemyName}`);
      } else {
        setLog(`Floor ${run.floor}${floorNote} · ${combat.enemyName}`);
        saveRun();
      }
      run.floorElapsedMs = 0;
      updateTowerBand();
      showScreen("game");
      if (opts.tutorial) {
        const ov = document.getElementById("floorBannerOverlay");
        const k = document.getElementById("floorBannerKicker");
        const t = document.getElementById("floorBannerTitle");
        const s = document.getElementById("floorBannerSub");
        if (ov && k && t) {
          k.textContent = `Floor ${run.floor}`;
          t.textContent = "Tutorial";
          if (s) s.textContent = combat.enemyName;
          ov.classList.add("open");
          setTimeout(() => {
            ov.classList.remove("open");
            setTimeout(() => showTutorialPopup(), 300);
          }, 1600);
        }
      } else {
        showFloorBanner();
      }
      // Trash talk after floor banner settles
      setTimeout(() => {
        if (!gameOver && combat.playerTurn) {
          // Occasional class jab on later floors
          if (run.floor >= 3 && Math.random() < 0.22) {
            sayVoice("classJab", { force: true });
          } else {
            sayVoice("floorStart", { force: true });
          }
        }
      }, 1500);
    }

    document.getElementById("btnGoMenu").addEventListener("click", () => {
      gameOverOverlay.classList.remove("open");
      gameOver = false;
      busy = false;
      // Keep save if mid-campaign victory already wrote next floor; only clear on abandon from menu intent
      // User chose Menu — keep existing save so Continue works
      showScreen("menu");
      buildCharPick();
      refreshContinueBtn();
    });
    document.getElementById("btnGoRetry").addEventListener("click", () => {
      if (combat.enemyHp <= 0 && run.floor < MAX_FLOOR) {
        if (isBranchFloor(run.floor)) {
          gameOverOverlay.classList.remove("open");
          showBranchOverlay();
        } else {
          startBattle({ fromVictory: true });
          saveRun();
        }
      } else if (combat.enemyHp <= 0 && run.floor >= MAX_FLOOR) {
        resetRun();
        showScreen("menu");
        buildCharPick();
        refreshContinueBtn();
      } else {
        // defeat — retry same floor
        startBattle({ retry: true });
      }
    });

    function buildCharPick() {
      charPick.innerHTML = "";
      ["ninja", "wizard", "knight"].forEach(key => {
        const c = CHARACTERS[key];
        const costKey = (settings.costume && COSTUMES[key][settings.costume[key]]) ? settings.costume[key] : "classic";
        const wpnKeys = Object.keys(WEAPONS[key]);
        const wpnKey = (settings.weapon && WEAPONS[key][settings.weapon[key]]) ? settings.weapon[key] : wpnKeys[0];
        const card = document.createElement("div");
        card.className = "char-card" + (combat.playerClass === key ? " selected" : "");
        card.innerHTML = `<div class="portrait ${c.role}">${characterSvg(key, costKey, wpnKey)}</div><div class="fighter-name">${c.name}</div>`;
        card.addEventListener("click", () => {
          combat.playerClass = key;
          buildCharPick();
        });
        charPick.appendChild(card);
      });
      buildCosmeticBar();
      renderRunHistory();
    }

    // Costume / weapon picker for the currently selected hero.
    function buildCosmeticBar() {
      const bar = document.getElementById("cosmeticBar");
      if (!bar) return;
      const cls = combat.playerClass;
      const costumes = COSTUMES[cls];
      const weapons = WEAPONS[cls];
      const curCost = costumes[settings.costume[cls]] ? settings.costume[cls] : "classic";
      const curWpn = weapons[settings.weapon[cls]] ? settings.weapon[cls] : Object.keys(weapons)[0];

      const dots = Object.keys(costumes).map(k =>
        `<button type="button" class="cosmetic-dot${k === curCost ? " active" : ""}" data-cost="${k}" data-cls="${cls}" title="${costumes[k].name}" style="background:${costumes[k].chip}"></button>`
      ).join("");
      const btns = Object.keys(weapons).map(k =>
        `<button type="button" class="cosmetic-btn${k === curWpn ? " active" : ""}" data-wpn="${k}" data-cls="${cls}">${weapons[k].name}</button>`
      ).join("");

      bar.classList.add("show");
      bar.innerHTML = `
        <div class="cosmetic-label">Costume</div>
        <div class="cosmetic-dots">${dots}</div>
        <div class="cosmetic-label">Weapon</div>
        <div class="cosmetic-btns">${btns}</div>
      `;
      bar.querySelectorAll("[data-cost]").forEach(btn => btn.addEventListener("click", () => {
        settings.costume[btn.dataset.cls] = btn.dataset.cost;
        persistSettings();
        buildCharPick();
      }));
      bar.querySelectorAll("[data-wpn]").forEach(btn => btn.addEventListener("click", () => {
        settings.weapon[btn.dataset.cls] = btn.dataset.wpn;
        persistSettings();
        buildCharPick();
      }));
    }

    function renderRunHistory() {
      const el = document.getElementById("runHistory");
      if (!el) return;
      const list = loadHistory();
      if (!list.length) { el.innerHTML = ""; return; }
      const last = list[0];
      const won = last.won;
      const hero = last.heroName || last.hero || "???";
      const result = won ? "Victory" : "Defeat";
      const cls = won ? "win" : "loss";
      el.innerHTML = `
        <div class="last-run-card ${cls}" id="lastRunCard">
          <div class="last-run-label">${result}</div>
          <div class="last-run-info">${hero} · Floor ${last.floor}${last.timeMs != null ? ` · ⏱ ${fmtTime(last.timeMs)}` : ""}</div>
        </div>`;
      el.querySelector(".last-run-card").addEventListener("click", () => {
        showLastRunOverlay(last);
      });
    }

    function showLastRunOverlay(run) {
      const won = run.won;
      const hero = run.heroName || run.hero || "???";
      const result = won ? "Victory" : "Defeat";
      const diff = (run.diff || "normal").charAt(0).toUpperCase() + (run.diff || "normal").slice(1);
      const picks = (run.picks || []).filter(Boolean);
      const picksHtml = picks.length
        ? `<div class="last-run-ov-picks">${picks.map(p => `<span class="last-run-ov-chip">${p}</span>`).join("")}</div>`
        : `<div class="last-run-ov-picks" style="color:#b0a89e;font-size:0.65rem">No upgrades picked</div>`;
      const ov = document.createElement("div");
      ov.className = "overlay open";
      ov.innerHTML = `
        <div class="overlay-panel" style="max-width:260px;text-align:center;padding:20px">
          <div class="last-run-ov-result ${won ? 'win' : 'loss'}">${result}</div>
          <div class="last-run-ov-hero">${hero}</div>
          <div class="last-run-ov-detail">Floor ${run.floor} · ${diff}${run.timeMs != null ? ` · ⏱ ${fmtTime(run.timeMs)}` : ""}</div>
          <div class="last-run-ov-section">Upgrades</div>
          ${picksHtml}
          <button type="button" class="action-btn primary" id="lastRunClose" style="margin-top:14px;min-height:48px;font-size:0.85rem">Close</button>
        </div>`;
      document.body.appendChild(ov);
      ov.querySelector("#lastRunClose").addEventListener("click", () => ov.remove());
      ov.addEventListener("click", e => { if (e.target === ov) ov.remove(); });
    }

    function openSettings() {
      pauseRunTimer();
      document.getElementById("admSword").value = settings.swordDmg;
      document.getElementById("admStar").value = settings.starDmg;
      document.getElementById("admHeal").value = settings.healAmt;
      document.getElementById("admShield").value = settings.shieldOn3;
      document.getElementById("admShieldMax").value = settings.shieldMax;
      document.getElementById("admEnemyAtk").value = settings.enemyAtk;
      document.getElementById("admUlt").value = settings.ultDmg;
      document.getElementById("admUltNeed").value = settings.ultNeed;
      const feverEl = document.getElementById("admFever");
      const impactEl = document.getElementById("admImpact");
      if (feverEl) feverEl.value = settings.feverTurn || 6;
      if (impactEl) impactEl.value = settings.impactTurn || 11;
      document.getElementById("muteToggle").classList.toggle("on", settings.muted);
      const volSlider = document.getElementById("volSlider");
      const volLabel = document.getElementById("volLabel");
      if (volSlider) {
        volSlider.value = Math.round(settings.volume * 100);
        if (volLabel) volLabel.textContent = String(volSlider.value);
      }
      document.getElementById("tabGame").style.display = "";
      document.getElementById("tabAdmin").style.display = "none";
      document.querySelectorAll("#settingsTabs button").forEach(b => {
        b.classList.toggle("on", b.dataset.tab === "game");
      });
      settingsOverlay.classList.add("open");
    }

    function closeSettings() {
      settingsOverlay.classList.remove("open");
      if (screenGame.classList.contains("active")) resumeRunTimer();
    }

    function saveSettings() {
      settings.swordDmg = +document.getElementById("admSword").value || 0;
      settings.starDmg = +document.getElementById("admStar").value || 0;
      settings.healAmt = +document.getElementById("admHeal").value || 0;
      settings.shieldOn3 = +document.getElementById("admShield").value || 0;
      settings.shieldMax = +document.getElementById("admShieldMax").value || 0;
      settings.enemyAtk = +document.getElementById("admEnemyAtk").value || 0;
      settings.ultDmg = +document.getElementById("admUlt").value || 0;
      settings.ultNeed = Math.max(1, +document.getElementById("admUltNeed").value || 5);
      const feverEl = document.getElementById("admFever");
      const impactEl = document.getElementById("admImpact");
      if (feverEl) settings.feverTurn = Math.max(1, +feverEl.value || 6);
      if (impactEl) settings.impactTurn = Math.max(settings.feverTurn + 1, +impactEl.value || 11);
      persistSettings();
      closeSettings();
      if (screenGame.classList.contains("active")) resumeRunTimer();
      refreshCombatUI();
    }

    document.getElementById("btnMenuSettings").addEventListener("click", openSettings);
    document.getElementById("btnGameSettings").addEventListener("click", openSettings);
    document.getElementById("btnSettingsClose").addEventListener("click", closeSettings);
    document.getElementById("btnSettingsSave").addEventListener("click", saveSettings);

    // Help overlay
    const helpOverlay = document.getElementById("helpOverlay");
    function openHelp() {
      if (helpOverlay) helpOverlay.classList.add("open");
    }
    function closeHelp() {
      if (helpOverlay) helpOverlay.classList.remove("open");
    }
    const btnMenuHelp = document.getElementById("btnMenuHelp");
    if (btnMenuHelp) btnMenuHelp.addEventListener("click", openHelp);
    const btnSettingsHelp = document.getElementById("btnSettingsHelp");
    if (btnSettingsHelp) btnSettingsHelp.addEventListener("click", openHelp);
    const btnHelpClose = document.getElementById("btnHelpClose");
    if (btnHelpClose) btnHelpClose.addEventListener("click", closeHelp);
    if (helpOverlay) helpOverlay.addEventListener("click", (e) => {
      if (e.target === helpOverlay) closeHelp();
    });

    document.getElementById("muteToggle").addEventListener("click", function () {
      settings.muted = !settings.muted;
      this.classList.toggle("on", settings.muted);
      persistSettings();
    });
    const volSliderEl = document.getElementById("volSlider");
    if (volSliderEl) {
      volSliderEl.addEventListener("input", () => {
        settings.volume = Math.max(0, Math.min(1, (+volSliderEl.value || 0) / 100));
        const lab = document.getElementById("volLabel");
        if (lab) lab.textContent = String(volSliderEl.value);
        persistSettings();
      });
    }
    document.querySelectorAll("#settingsTabs button").forEach(b => {
      b.addEventListener("click", () => {
        const tab = b.dataset.tab;
        document.querySelectorAll("#settingsTabs button").forEach(x => x.classList.toggle("on", x === b));
        document.getElementById("tabGame").style.display = tab === "game" ? "" : "none";
        document.getElementById("tabAdmin").style.display = tab === "admin" ? "" : "none";
      });
    });

    const DIFFICULTY_OPTIONS = [
      { id: "easy", icon: "🌱", name: "Easy", desc: "Enemy deals 25% less damage. AI makes random moves — perfect for learning the ropes." },
      { id: "normal", icon: "⚔️", name: "Normal", desc: "Balanced challenge. AI searches for good matches and plays strategically." },
      { id: "hard", icon: "💀", name: "Hard", desc: "Enemy deals 25% more damage. AI uses lookahead, chases charged clears, and plays aggressively." }
    ];

    function openDiffPicker() {
      const ov = document.getElementById("diffPickerOverlay");
      const wrap = document.getElementById("diffPickerCards");
      if (!ov || !wrap) { resetRun(); startBattle(); return; }
      wrap.innerHTML = "";
      DIFFICULTY_OPTIONS.forEach(d => {
        const btn = document.createElement("button");
        btn.type = "button";
        const arch = detectArchetype(d.name, d.desc, d.icon);
        const isActive = settings.difficulty === d.id;
        btn.className = "upgrade-card glow-" + arch.cls;
        // Top row
        const top = document.createElement("div");
        top.className = "up-card-top";
        const archTag = document.createElement("span");
        archTag.className = "up-card-archetype " + arch.cls;
        archTag.textContent = arch.tag;
        top.append(archTag);
        if (isActive) {
          const badge = document.createElement("span");
          badge.className = "reward-dur permanent";
          badge.textContent = "CURRENT";
          top.append(badge);
        }
        // Title
        const title = document.createElement("div");
        title.className = "up-card-title";
        title.textContent = d.icon + " " + d.name;
        // Callout
        const calloutBox = document.createElement("div");
        calloutBox.className = "up-card-callout";
        calloutBox.textContent = d.desc;
        btn.append(top, title, calloutBox);
        btn.addEventListener("click", () => {
          settings.difficulty = d.id;
          persistSettings();
          ov.classList.remove("open");
          resetRun();
          startBattle();
          refreshContinueBtn();
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    document.getElementById("btnStart").addEventListener("click", () => {
      openDiffPicker();
    });

    document.getElementById("btnDiffCancel").addEventListener("click", () => {
      document.getElementById("diffPickerOverlay").classList.remove("open");
    });
    document.getElementById("diffPickerOverlay").addEventListener("click", e => {
      if (e.target.id === "diffPickerOverlay") e.target.classList.remove("open");
    });

    document.getElementById("btnContinue").addEventListener("click", () => {
      const d = loadRun();
      if (!d) return;
      applyLoadedRun(d);
      startBattle({ retry: true }); // stay on saved floor
      refreshContinueBtn();
    });

    document.getElementById("btnExit").addEventListener("click", () => {
      // Exit from Settings → Menu
      if (!gameOver) saveRun();
      closeSettings();
      gameOver = false;
      busy = false;
      showScreen("menu");
      buildCharPick();
      refreshContinueBtn();
     });

    // ----- Hold portrait → character / enemy info -----
    const infoOverlay = document.getElementById("infoOverlay");
    const infoTitle = document.getElementById("infoTitle");
    const infoBody = document.getElementById("infoBody");
    let holdTimer = null;
    let holdTarget = null;

    function heroInfoHtml(cls) {
      const s = HERO_STATS[cls] || HERO_STATS.ninja;
      const sig = SIGNATURE[cls];
      const sigLabel = { sword: "⚔️ Sword", shield: "🛡️ Shield", hp: "❤️ Potion" }[sig] || sig;
      let passive = "", ult = "", shapes = "";
      if (cls === "ninja") {
        passive = "Shadow Step: First hit dodged, then 20% dodge. Clear 4+ Sword tiles in one turn → prompt: −3 HP for +1 extra swap (once per turn).";
        ult = "Assassinate: 15–30 true dmg (doubled if enemy <30% HP), −3 self HP, Afterglow (50% less dmg 1 turn).";
        shapes = "⭐ +2 AP + 4→Sword · 💥 +2 Mark (+15% dmg each) + 1 AP · ⚡ True dmg = Swords×4 (min 8, max 24)";
      } else if (cls === "wizard") {
        passive = "Arcane Reflection: 30%+ of damage taken reflected as true dmg (scales with floor). Shield matches deal Runic damage equal to shield gained.";
        ult = "Meteor: 12–24 true dmg (scales with charge).";
        shapes = "⭐ +12 Shield + 3→Shield · 💥 Mana Lock 2t · ⚡ Steal up to 3 Shield";
      } else {
        passive = "Regen +3 HP each turn. Iron Will: survive a lethal hit once per battle at 1 HP, gain +5 Fracture. Fracture stacks deal true dmg at enemy turn start — or cash them in early with a Charged match (Shatter: stacks×3).";
        ult = "Earthshatter: 12–24 true dmg + Shatter all Fracture stacks (stacks×4 bonus) + Mortal Wound 2t.";
        shapes = "⭐ +2 Fracture + 3→Potion · 💥 +3 Fracture + 1 AP · ⚡ Shatter (stacks×3)";
      }
      return `
        <div class="info-row"><span>Class</span><span>${s.name}</span></div>
        <div class="info-row"><span>HP</span><span>${s.hp} (+${run.bonusMaxHp} run)</span></div>
        <div class="info-row"><span>Start Shield</span><span>${s.startShield}</span></div>
        <div class="info-row"><span>Signature</span><span>${sigLabel}</span></div>
        <div class="info-row"><span>Charge</span><span>${combat.sigBank}/${settings.ultMaxCharge}</span></div>
        <div class="info-row"><span>AP</span><span>${combat.ap}/${AP_MAX}</span></div>
        <div class="info-section">Passive</div>
        <div class="info-body">${passive}</div>
        <div class="info-section">Ultimate</div>
        <div class="info-body">${ult}</div>
        <div class="info-section">Shape bonuses</div>
        <div class="info-body">${shapes}</div>
        <div class="info-section">Active statuses</div>
        <div class="info-body">${statusSummaryPlayer()}</div>
        ${runUpgradeSection()}
        ${combat.floorModifier ? `<div class="info-section">Floor Modifier</div><div class="info-body">${combat.floorModifier.icon} ${combat.floorModifier.name} — ${combat.floorModifier.desc}</div>` : ""}
      `;
    }

    function runUpgradeSection() {
      const picked = run.pickedUpgrades || [];
      if (!picked.length) return "";
      const names = picked.map(id => {
        const u = RUN_UPGRADES.find(u => u.id === id);
        return u ? u.name : id;
      });
      return `<div class="info-section">Permanent Upgrades</div><div class="info-body">${names.join(" · ")}</div>`;
    }

    function statusSummaryPlayer() {
      const parts = [];
      if (combat.afterglowTurns > 0) parts.push(`Afterglow ${combat.afterglowTurns}t`);
      if (combat.poisonTurns > 0) parts.push(`Poison ${combat.poisonTurns}t`);
      if (combat.playerFractureStacks > 0) parts.push(`Fracture ${combat.playerFractureStacks} (${combat.playerFractureTurns}t)`);
      if (combat.playerMortalWoundTurns > 0) parts.push(`Mortal Wound ${combat.playerMortalWoundTurns}t`);
      if (combat.empowerNext) parts.push("Empower");
      if (combat.blindNext) parts.push("Blind");
      if (combat.weakenNextSword) parts.push("Weaken");
      if (combat.shield > 0) parts.push(`Shield ${combat.shield}`);
      return parts.length ? parts.join(" · ") : "None";
    }

    function statusSummaryEnemy() {
      const parts = [];
      if (combat.markStacks > 0) parts.push(`Mark ${combat.markStacks}`);
      if (combat.fractureStacks > 0) parts.push(`Fracture ${combat.fractureStacks} (${combat.fractureTurns}t)`);
      if (combat.mortalWoundTurns > 0) parts.push(`Mortal Wound ${combat.mortalWoundTurns}t`);
      if (combat.manaLockTurns > 0) parts.push(`Mana Lock ${combat.manaLockTurns}t`);
      if (combat.enemyAfterglowTurns > 0) parts.push(`Afterglow ${combat.enemyAfterglowTurns}t`);
      if (combat.bossKit && combat.bossKit.id === "umbral" && !combat.enemyVeilUsed) parts.push("Shadow Veil");
      if (combat.enemyPoisonTurns > 0) parts.push(`Poison ${combat.enemyPoisonTurns}t`);
      if ((combat.enemyWeakenTurns || 0) > 0) parts.push(`Weakened ${combat.enemyWeakenTurns}t`);
      if (combat.enemyShield > 0) parts.push(`Shield ${combat.enemyShield}`);
      return parts.length ? parts.join(" · ") : "None";
    }

    function enemyInfoHtml() {
  let encounter = "Normal foe";
  let details = "";
  let passiveDetails = "";
  let specialDetails = "";
  let ultDetails = "";

  // ---- BOSS ----
  if (combat.bossKit) {
    const kit = combat.bossKit;
    encounter = "👑 Boss";
    const dmgMult = kit.ultFn.toString().match(/\* (\d+\.?\d*)/);
    const dmgPercent = dmgMult ? Math.round(parseFloat(dmgMult[1]) * 100) : "???";
    ultDetails = `
      <div class="info-section">⚔️ Ultimate</div>
      <div class="info-body">
        <strong>${kit.ultName}</strong><br>
        • Charges in <strong>${kit.ultTurns}</strong> turns<br>
        • Deals <strong>${dmgPercent}%</strong> base damage<br>
        • ${kit.ultDesc || kit.ultFn.toString().replace(/[{}]/g, '').replace(/setLog\(["']([^"']*)["']\)/g, '→ $1').split(';')[0] || 'Powerful effect'}
      </div>
    `;
    if (kit.passive) {
      passiveDetails = `
        <div class="info-section">🛡️ Boss Passive</div>
        <div class="info-body">${kit.passive}</div>
      `;
    }
  }

  // ---- ELITE ----
  if (combat.eliteKit) {
    const kit = combat.eliteKit;
    encounter = "⚡ Elite";
    let passiveText = kit.passive || "None";
    let onHitText = "";
    if (kit.onHit) {
      const fnStr = kit.onHit.toString();
      if (fnStr.includes('combat.enemyHp = Math.min(combat.enemyMaxHp, combat.enemyHp + 4)')) {
        onHitText = " • Lifesteal +4 HP on hit";
      } else if (fnStr.includes('dealDamageToPlayer(Math.max(2, Math.round(enemyAtkForFloor(run.floor) * 0.35)))')) {
        onHitText = " • Chain Shock: extra 35% damage on hit";
      } else if (fnStr.includes('combat.poisonTurns = Math.max(combat.poisonTurns || 0, 2)')) {
        onHitText = " • Applies Poison (2 turns) on hit";
      } else if (fnStr.includes('combat.enemyShield = Math.min(25, combat.enemyShield + 3)')) {
        onHitText = " • Gains +3 Shield when damaged";
      }
    }
    passiveDetails = `
      <div class="info-section">🛡️ Elite Passive</div>
      <div class="info-body">${passiveText}${onHitText}</div>
    `;
  }

  // ---- NORMAL ARCHETYPE ----
  if (combat.enemyArchetype) {
    const arch = combat.enemyArchetype;
    encounter = `🎯 ${arch.label}`;
    let passiveDesc = arch.passive || "None";
    if (arch.id === "viper") passiveDesc = "45% chance to apply Poison (2 turns) on hit";
    else if (arch.id === "hexer") passiveDesc = "40% chance to apply Blind OR Weaken on hit";
    else if (arch.id === "mender") passiveDesc = `Heals ~${Math.round(3 + run.floor * 0.15)} HP at turn start`;
    else if (arch.id === "bruiser") passiveDesc = "Heavy hits – +25% damage";
    else if (arch.id === "raider") passiveDesc = "Glass cannon – +35% damage, -10% HP";
    passiveDetails = `
      <div class="info-section">🛡️ Archetype Passive</div>
      <div class="info-body">${passiveDesc}</div>
    `;
  }

  // ---- POWER STRIKE (all normal enemies) ----
  if (!combat.bossKit && !combat.eliteKit) {
    const chargeTime = combat.enemySpecialNeed || "4-5";
    specialDetails = `
      <div class="info-section">💥 Special Move</div>
      <div class="info-body">
        <strong>Power Strike</strong><br>
        • Charges in <strong>${chargeTime}</strong> turns<br>
        • Deals <strong>150%</strong> base damage<br>
        • Warning: "Enemy is charging a special..." appears 1 turn before
      </div>
    `;
  }

  // ---- ENEMY ATTACK SCALING ----
  const atkNow = enemyAtkForFloor(run.floor);
  const atkNext = enemyAtkForFloor(run.floor + 1);
  const scalingInfo = `
    <div class="info-section">📈 Attack Scaling</div>
    <div class="info-body">
      Base: ${settings.enemyAtk} + (Floor-1) × 0.7 + ramp²<br>
      Current: <strong>~${atkNow}</strong> damage<br>
      Next floor: ~${atkNext} damage
    </div>
  `;

  // ---- BUILD FINAL HTML ----
  return `
    <div class="info-row"><span>Name</span><span>${combat.enemyFullName || combat.enemyName || "Rival"}</span></div>
    <div class="info-row"><span>HP</span><span>${combat.enemyHp}/${combat.enemyMaxHp}</span></div>
    <div class="info-row"><span>Floor</span><span>${run.floor}</span></div>
    <div class="info-row"><span>Type</span><span>${encounter}</span></div>
    <div class="info-row"><span>Attack</span><span>~${atkNow} damage</span></div>
    ${passiveDetails}
    ${specialDetails}
    ${ultDetails}
    ${scalingInfo}
    <div class="info-section">📊 Statuses on this foe</div>
    <div class="info-body">${statusSummaryEnemy()}</div>
  `;
}

    const passportOverlay = document.getElementById("passportOverlay");

    // Left "identity page" of the passport spread
    function passportIdentityHtml(who) {
      if (who === "player") {
        const s = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
        const sig = SIGNATURE[combat.playerClass];
        const sigLabel = { sword: "⚔️ Sword", shield: "🛡️ Shield", hp: "❤️ Potion" }[sig] || sig;
        return `
          <div class="pp-photo"><div class="portrait ${combat.playerClass}" id="ppPhotoSlot"></div></div>
          <div class="pp-id-name">${s.name}</div>
          <div class="info-row"><span>Class</span><span>${s.name}</span></div>
          <div class="info-row"><span>HP</span><span>${combat.playerHp}/${combat.playerMaxHp}</span></div>
          <div class="info-row"><span>Shield</span><span>${combat.shield}</span></div>
          <div class="info-row"><span>Signature</span><span>${sigLabel}</span></div>
          <div class="info-row"><span>Charge</span><span>${combat.sigBank}/${settings.ultMaxCharge}</span></div>
          <div class="info-row"><span>AP</span><span>${combat.ap}/${AP_MAX}</span></div>
          <div class="info-section">Stamps</div>
          <div class="info-body">${statusSummaryPlayer()}</div>
        `;
      }
      const isBoss = !!combat.bossKit, isElite = !!combat.eliteKit;
      return `
        <div class="pp-photo"><div class="portrait ${combat.enemyClass || "slime"}" id="ppPhotoSlot"></div></div>
        <div class="pp-id-name">${combat.enemyFullName || combat.enemyName || "Rival"}</div>
        <div class="info-row"><span>Type</span><span>${isBoss ? "👑 Boss" : isElite ? "⚡ Elite" : "Normal foe"}</span></div>
        <div class="info-row"><span>HP</span><span>${combat.enemyHp}/${combat.enemyMaxHp}</span></div>
        <div class="info-section">Stamps</div>
        <div class="info-body">${statusSummaryEnemy()}</div>
      `;
    }

    function openInfo(who) {
      const left = document.getElementById("ppLeft");
      const right = document.getElementById("ppRight");
      if (passportOverlay && left && right) {
        left.innerHTML = passportIdentityHtml(who);
        right.innerHTML = who === "player" ? heroInfoHtml(combat.playerClass) : enemyInfoHtml();
        const slot = document.getElementById("ppPhotoSlot");
        if (slot) {
          if (who === "player") {
            renderPortrait(slot, combat.playerClass, {
              costume: settings.costume && settings.costume[combat.playerClass],
              weapon: settings.weapon && settings.weapon[combat.playerClass]
            });
          } else {
            renderPortrait(slot, combat.enemyClass);
          }
        }
        passportOverlay.classList.remove("open");
        void passportOverlay.offsetWidth; // restart flip animation
        passportOverlay.classList.add("open");
        return;
      }
      if (who === "player") {
        infoTitle.textContent = (HERO_STATS[combat.playerClass] || {}).name || "Hero";
        infoBody.innerHTML = heroInfoHtml(combat.playerClass);
      } else {
        infoTitle.textContent = combat.enemyFullName || combat.enemyName || "Enemy";
        infoBody.innerHTML = enemyInfoHtml();
      }
      infoOverlay.classList.add("open");
    }

    function bindHold(el, who) {
      if (!el) return;
      const start = e => {
        if (holdTimer) clearTimeout(holdTimer);
        holdTarget = who;
        holdTimer = setTimeout(() => {
          holdTimer = null;
          openInfo(who);
        }, 420);
      };
      const cancel = () => {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
      };
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointerup", cancel);
      el.addEventListener("pointerleave", cancel);
      el.addEventListener("pointercancel", cancel);
    }

    bindHold(playerPortraitEl, "player");
    bindHold(document.getElementById("enemyPortrait"), "enemy");

    // Short click on player still triggers ult; long press opens info
    // (hold cancels before click fires if we prevent default on long press — skip for simplicity)

    document.getElementById("btnInfoClose").addEventListener("click", () => {
      infoOverlay.classList.remove("open");
    });
    infoOverlay.addEventListener("click", e => {
      if (e.target === infoOverlay) infoOverlay.classList.remove("open");
    });
    const btnPassportClose = document.getElementById("btnPassportClose");
    if (btnPassportClose) btnPassportClose.addEventListener("click", () => passportOverlay.classList.remove("open"));
    if (passportOverlay) passportOverlay.addEventListener("click", e => {
      if (e.target === passportOverlay) passportOverlay.classList.remove("open");
    });

    // Phase event pill → info
    const phasePillEl = document.getElementById("phasePill");
    if (phasePillEl) {
      phasePillEl.addEventListener("click", () => {
        if (getPhase() === "normal") return;
        playUiClick("tap");
        showPhaseInfo();
      });
    }

    // Turn pill → floor info + settings
    const floorPillEl = document.getElementById("turnNum");
    if (floorPillEl) {
      floorPillEl.style.cursor = "pointer";
      floorPillEl.addEventListener("click", () => {
        openFloorInfo();
      });
    }

    function openFloorInfo() {
      const infoTitle = document.getElementById("infoTitle");
      const infoBody = document.getElementById("infoBody");
      if (!infoTitle || !infoBody) return;
      infoTitle.textContent = `Floor ${run.floor}`;
      const parts = [];
      // Floor type
      if (isBossFloor(run.floor)) {
        const kit = BOSS_KITS[run.floor];
        parts.push(`<div class="info-section">Boss Floor</div>`);
        if (kit) parts.push(`<div class="info-body">${kit.icon || "💀"} ${kit.name} — a unique boss with special abilities.</div>`);
      } else if (isEliteFloor(run.floor)) {
        const kit = ELITE_KITS[run.floor];
        parts.push(`<div class="info-section">Elite Floor</div>`);
        if (kit) parts.push(`<div class="info-body">${kit.icon || "⚡"} ${kit.name} — a tough foe with a permanent reward.</div>`);
        else parts.push(`<div class="info-body">A powerful elite enemy. Defeat grants a permanent upgrade.</div>`);
      } else {
        parts.push(`<div class="info-section">Normal Floor</div>`);
        parts.push(`<div class="info-body">Standard floor — beat the rival to earn a reward and modifier.</div>`);
      }
      // Difficulty
      const diffLabel = { easy: "🌱 Easy", normal: "⚔️ Normal", hard: "💀 Hard" };
      const diffDesc = {
        easy: "Enemy deals 25% less damage. AI makes random moves.",
        normal: "Balanced challenge. AI searches for good matches.",
        hard: "Enemy deals 25% more damage. AI uses lookahead and plays aggressively."
      };
      const d = settings.difficulty || "normal";
      parts.push(`<div class="info-section">Difficulty</div>`);
      parts.push(`<div class="info-body">${diffLabel[d] || "⚔️ Normal"} — ${diffDesc[d] || diffDesc.normal}</div>`);
      // Floor modifier
      if (combat.floorModifier) {
        parts.push(`<div class="info-section">Active Modifier</div>`);
        parts.push(`<div class="info-body">${combat.floorModifier.icon} <strong>${combat.floorModifier.name}</strong> — ${combat.floorModifier.desc}</div>`);
      }
      // Phase
      const phase = typeof getPhase === "function" ? getPhase() : "normal";
      if (phase === "fever") {
        parts.push(`<div class="info-section">Star Fever</div>`);
        parts.push(`<div class="info-body">⭐ Star tiles deal x2 damage. Push for big clears!</div>`);
      } else if (phase === "impact") {
        parts.push(`<div class="info-section">Star Impact</div>`);
        parts.push(`<div class="info-body">☄️ ⭐ tiles deal x2 AND 🎲 mystery tiles are always buffs!</div>`);
      }
      // Progress
      parts.push(`<div class="info-section">Progress</div>`);
      parts.push(`<div class="info-body">Floor ${run.floor} of 20. ${isBossFloor(run.floor) ? "Final boss!" : isEliteFloor(run.floor) ? "Elite challenge ahead." : `${20 - run.floor} floors remaining.`}</div>`);
      infoBody.innerHTML = parts.join("");
      infoOverlay.classList.add("open");
    }

    // UI click SFX + haptic for every button
    document.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.disabled) return;
      if (btn.id === "btnEnd") playUiClick("end");
      else if (btn.classList.contains("primary") || btn.classList.contains("end-btn")) playUiClick("primary");
      else playUiClick("tap");
    }, true);

    // ---------- start ----------
    buildCharPick();
    refreshContinueBtn();
    showScreen("menu");
