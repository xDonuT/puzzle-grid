const screenMenu = document.getElementById("screen-menu");
    const screenGame = document.getElementById("screen-game");
    const settingsOverlay = document.getElementById("settingsOverlay");
    const gameOverOverlay = document.getElementById("gameOverOverlay");
    const charPick = document.getElementById("charPick");
    let gameOver = false;
    let _bannerWarnings = []; // one-shot "next floor" effects surfaced on the floor banner
    let defeatPending = false; // defeat screen up but not yet finalized (a revive can still happen)

    function showScreen(name) {
      screenMenu.classList.toggle("active", name === "menu");
      screenGame.classList.toggle("active", name === "game");
      document.body.classList.toggle("golden", name === "game" && (run.ngLoop || 0) > 0);
      if (name !== "game") {
        document.body.classList.remove("phase-fever", "phase-impact", "tower-1", "tower-2", "tower-3", "tower-4");
      }
      if (name === "game") resumeRunTimer(); else pauseRunTimer();
    }

    // Tower ascent: act-themed sky (Sprout meadow / Bloom rose / Flourish golden)
    // plus altitude bands — low / mid / summit within each act's 15 floors
    function updateTowerBand() {
      const b = document.body;
      b.classList.remove("tower-1", "tower-2", "tower-3", "tower-4", "alt-low", "alt-mid", "alt-top");
      const f = run && typeof run.floor === "number" ? run.floor : 1;
      const act = run && run.gameMap
        ? (run.gameMap.currentAct || 1)
        : Math.min(3, Math.floor((Math.max(1, f) - 1) / 15) + 1);
      b.classList.add(act >= 3 ? "tower-4" : act === 2 ? "tower-2" : "tower-1");
      const inAct = ((Math.max(1, f) - 1) % 15) + 1;
      b.classList.add(inAct <= 5 ? "alt-low" : inAct <= 10 ? "alt-mid" : "alt-top");
      b.classList.toggle("golden", (run.ngLoop || 0) > 0);
      bgmPlay(act);
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
      if (/fracture|cracked/.test(s))      return "Best for Knight Cracked stacking";
      if (/ult|ultimate/.test(s))          return "Best for big burst damage turns";
      return "";
    }
    function rewardDesc(entry, opts) {
      if (typeof entry.desc === "function") return (entry.desc((opts && opts.nextFloor) || run.floor + 1) || "");
      return entry.desc || "";
    }

    function buildRewardCard(btn, entry, opts) {
      const name = entry.name || "";
      const desc = rewardDesc(entry, opts);
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
        btn.title = rewardDesc(e, opts);
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
      // 🌟 Golden Cosmos: the tower decrees the modifier itself — no picking
      if ((run.ngLoop || 0) > 0) {
        const pool = FLOOR_MODIFIERS.slice();
        const mod = pool[Math.floor(Math.random() * pool.length)];
        if (!run.pickedModifierIds) run.pickedModifierIds = [];
        run.pickedModifierIds.push(mod.id);
        onPick(mod);
        return;
      }
      if (rr) rr.style.display = "none";
      const availE = () => FLOOR_MODIFIERS.filter(m => m.tier === "easy" && !(run.pickedModifierIds || []).includes(m.id));
      const availH = () => FLOOR_MODIFIERS.filter(m => m.tier === "hard" && !(run.pickedModifierIds || []).includes(m.id));
      // Pool exhausted → recycle (dedup only prevents repeats until full cycle)
      let easy = availE();
      let hard = availH();
      if (!easy.length) easy = FLOOR_MODIFIERS.filter(m => m.tier === "easy");
      if (!hard.length) hard = FLOOR_MODIFIERS.filter(m => m.tier === "hard");
      if (!easy.length && !hard.length) { onPick(null); return; }
      const poolE = easy.slice();
      const poolH = hard.slice();
      for (let i = poolE.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [poolE[i], poolE[j]] = [poolE[j], poolE[i]]; }
      for (let i = poolH.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [poolH[i], poolH[j]] = [poolH[j], poolH[i]]; }
      const choices = [...poolE.slice(0, 1), ...poolH.slice(0, 2)];
      if (t) t.textContent = "Floor Modifier";
      if (s) s.textContent = "Pick a benefit or a challenge for this floor";
      wrap.innerHTML = "";
      choices.forEach(m => {
        const btn = document.createElement("button");
        btn.type = "button";
        const arch = detectArchetype(m.name, m.desc, m.icon);
        const callout = extractCallout(m.name, m.desc);
        btn.className = "upgrade-card glow-" + arch.cls;
        if (m.color) btn.style.borderColor = m.color;
        const top = document.createElement("div");
        top.className = "up-card-top";
        const archTag = document.createElement("span");
        archTag.className = "up-card-archetype " + arch.cls;
        archTag.textContent = arch.tag;
        const tierBadge = document.createElement("span");
        tierBadge.className = "modifier-tier " + m.tier;
        tierBadge.textContent = m.tier === "hard" ? "CHALLENGE" : "BENEFIT";
        top.append(archTag, tierBadge);
        const title = document.createElement("div");
        title.className = "up-card-title";
        title.textContent = (m.icon || "") + " " + m.name;
        const calloutBox = document.createElement("div");
        calloutBox.className = "up-card-callout";
        calloutBox.textContent = callout || m.desc.toUpperCase();
        const descEl = document.createElement("div");
        descEl.className = "up-card-desc";
        descEl.textContent = m.desc;
        btn.append(top, title, calloutBox, descEl);
        if (m.tier === "hard") {
          const reward = document.createElement("div");
          reward.className = "modifier-reward";
          reward.textContent = " Also pick a bonus modifier";
          btn.appendChild(reward);
        }
        btn.addEventListener("click", () => {
          if (!run.pickedModifierIds) run.pickedModifierIds = [];
          run.pickedModifierIds.push(m.id);
          ov.classList.remove("open");
          onPick(m);
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    function openEasyBonusPicker(onPick) {
      const ov = document.getElementById("upgradeOverlay");
      const wrap = document.getElementById("upgradeCards");
      const t = document.getElementById("upgradeTitle");
      const s = document.getElementById("upgradeSub");
      const rr = document.getElementById("upgradeReroll");
      if (!ov || !wrap) { onPick(); return; }
      if (rr) rr.style.display = "none";
      if (t) t.textContent = "Challenge Reward";
      if (s) s.textContent = "You braved the risk — pick your permanent prize";
      wrap.innerHTML = "";
      // Chance-based payout — a gamble. Each bonus card independently rolls
      // rare (~40%) or uncommon, but we guarantee at least one rare so a
      // challenge always pays something real.
      const rarePool = (typeof buildRarePool === "function" ? buildRarePool() : []).slice();
      const unPool = (FLOOR_REWARDS_UNCOMMON || []).slice();
      const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      shuffle(rarePool); shuffle(unPool);
      const picks = [];
      let gotRare = false;
      for (let i = 0; i < 3; i++) {
        const useRare = Math.random() < 0.4;
        let boon = (useRare ? rarePool : unPool).pop();
        if (!boon) boon = (useRare ? unPool : rarePool).pop(); // fallback pool
        if (!boon) break;
        if (boon.tier === "rare") gotRare = true;
        picks.push(boon);
      }
      // Guarantee at least one rare so a challenge always pays something real.
      if (!gotRare && picks.length && rarePool.length) picks[0] = rarePool.pop();
      picks.slice(0, 3).forEach(boon => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "upgrade-card glow-general";
        buildRewardCard(btn, { name: boon.name, desc: boon.desc, tier: boon.tier || "common" }, { permanent: true });
        btn.addEventListener("click", () => {
          const label = boon.grant();
          ov.classList.remove("open");
          onPick();
          if (label && label.label) addRewardLabels([label.label]);
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

    // Ensure the challenge's permanent prize shows up on the victory recap.
    function addRewardLabels(labels) {
      if (!Array.isArray(labels)) return;
      if (!run.pickLog) run.pickLog = [];
      run.pickLog.push(...labels);
      const rewardMsg = document.getElementById("rewardMsg");
      if (rewardMsg) {
        const add = labels.map(l => `🏆 ${l}`).join("<br>");
        rewardMsg.innerHTML += (rewardMsg.innerHTML ? "<br>" : "") + add;
      }
    }

    // Tile Blessing ceremony — the player earns a choice for one enhanced tile
    // (bloom/cross/X) on its blessed floor. Icon-tile cards, tap to pick, ~1.5s.
    function openTileBlessingPicker(special, onDone, progress) {
      const ov = document.getElementById("tileBlessingOverlay");
      const panel = document.getElementById("blessingPanel");
      const em = document.getElementById("blessingEmblem");
      const title = document.getElementById("blessingTitle");
      const sub = document.getElementById("blessingSub");
      const cards = document.getElementById("blessingCards");
      if (!ov || !panel || !cards || !TILE_BLESSINGS || !TILE_BLESSINGS[special]) { onDone(); return; }

      const cfg = {
        bloom: { icon: "🌸", label: "Bloom Blessing", note: "Match a Bloom to trigger it stepping on the 3×3 clear", color: "#d4789a" },
        cross: { icon: "✚", label: "Cross Blessing", note: "Match a Cross to trigger it bursting its row + column", color: "#e0a52f" },
        x:     { icon: "✖", label: "X Blessing", note: "Match an X to trigger it cutting both diagonals", color: "#e06040" }
      }[special] || { icon: "🌸", label: "Tile Blessing", note: "", color: "#7aa65e" };

      panel.style.setProperty("--bc", cfg.color);
      em.textContent = cfg.icon;
      title.textContent = cfg.label;
      sub.textContent = progress ? `Unlock ${progress.at} of ${progress.of} — ${cfg.label}` : (cfg.note || "Choose what this tile does");
      sub.style.color = "#7a6e64";

      const current = run.blessings[special];
      const slotEl = document.getElementById("blessingSlot");
      const curBlessing = current ? (TILE_BLESSINGS[special] || []).find(b => b.id === current) : null;
      if (slotEl) {
        if (curBlessing) {
          slotEl.className = "blessing-slot filled";
          slotEl.textContent = `✓ Current: ${curBlessing.icon} ${curBlessing.name} — tap another to switch`;
        } else {
          slotEl.className = "blessing-slot empty";
          slotEl.textContent = "◎ Slot empty — choose this tile's blessing";
        }
      }

      cards.innerHTML = "";
      panel.classList.remove("plant", "show");

      TILE_BLESSINGS[special].forEach(b => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "blessing-card" + (b.id === current ? " on" : "");
        btn.style.setProperty("--bc", cfg.color);
        btn.innerHTML =
          `<span class="blessing-ico">${b.icon}</span>` +
          `<span class="blessing-text"><div class="blessing-name">${b.name}${b.id === current ? " ✓" : ""}</div>` +
          `<div class="blessing-note">${b.desc}</div></span>`;
        btn.addEventListener("click", () => {
          if (btn.classList.contains("on")) return;
          cards.querySelectorAll(".blessing-card").forEach(c => c.classList.remove("on"));
          btn.classList.add("on");
          run.blessings[special] = b.id;
          if (typeof codexReveal === "function") codexReveal("blessings", special);
          const chosen = btn.querySelector(".blessing-name");
          if (chosen) chosen.textContent = b.icon + " " + b.name;
          setTimeout(() => {
            ov.classList.remove("open");
            panel.classList.remove("plant", "show");
            onDone();
          }, 1500);
        });
        cards.appendChild(btn);
      });

      ov.classList.add("open");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        panel.classList.add("plant");
        setTimeout(() => panel.classList.add("show"), 350);
      }));
    }

    // Shape Skills training-pick — one shape at a time. openShapeSkillPicker(shapeKey)
    // shows only that shape's cards so the player reads each system one at a time
    // as milestones are earned (floor 6 Star, 12 Charged, 18 Cross). onDone() is
    // invoked to resume the victory flow.
    function openShapeSkillPicker(shapeKey, onDone, progress) {
      const ov = document.getElementById("shapeSkillOverlay");
      const rows = document.getElementById("shapeRows");
      const doneBtn = document.getElementById("btnShapeSkillDone");
      const emblem = document.getElementById("shapeEmblem");
      const title = document.getElementById("shapeSkillTitle");
      const sub = document.getElementById("shapeSkillSub");
      if (!ov || !rows || typeof SHAPE_SKILLS === "undefined") { if (onDone) onDone(); return; }
      pickerOnDone = onDone || null;
      pickerProgress = progress || null;
      // Surface the shape just earned (defaulting to Star for safety).
      const openShape = shapeKey && SHAPE_SKILLS[shapeKey] ? shapeKey : "star";
      pickerForceShape = progress ? openShape : null;
      if (emblem) emblem.textContent = "🏆";
      if (title) title.textContent = "Shape Skill Earned";
      if (sub) sub.textContent = progress
        ? `Unlock ${progress.at} of ${progress.of} — pick your ${shapeMeta(openShape).label} skill to continue`
        : `Choose your ${shapeMeta(openShape).label} skill — from any class`;
      const sk = run.shapeSkills || {};
      rows.innerHTML = "";
      const meta = shapeMeta(openShape);
      const cur = sk[openShape];

      // Slot strip: glance at every shape's slot state and jump between shapes.
      const strip = document.createElement("div");
      strip.className = "shape-slots";
      ["star", "cross", "charged"].forEach(shp => {
        const m = shapeMeta(shp);
        const curId = sk[shp];
        const curSkill = curId ? (SHAPE_SKILLS[shp] || []).find(s => s.id === curId) : null;
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "shape-slot-chip" + (shp === openShape ? " active" : "") + (curId ? "" : " empty");
        chip.setAttribute("data-shape", shp);
        if (progress && shp !== openShape) chip.disabled = true;
        chip.innerHTML =
          `<span class="shape-slot-ico">${m.icon}</span>` +
          `<span class="shape-slot-body"><span class="shape-slot-label">${m.label}</span>` +
          `<span class="shape-slot-state">${curSkill ? `${curSkill.icon} ${curSkill.name}` : "Empty slot"}</span></span>`;
        chip.addEventListener("click", () => openShapeSkillPicker(shp, pickerOnDone, pickerProgress));
        strip.appendChild(chip);
      });
      rows.appendChild(strip);

      let cards = "";
      SHAPE_SKILLS[openShape].forEach(s => {
        const active = s.id === cur;
        const best = s.bestFor ? `<span class="shape-skill-best">Best for ${(CHARACTERS[s.bestFor] && CHARACTERS[s.bestFor].name) || s.bestFor}</span>` : "";
        cards += `
          <button type="button" class="shape-skill-card${active ? " on" : ""}" data-shape="${openShape}" data-id="${s.id}">
            <span class="shape-skill-ico">${s.icon}</span>
            <span class="shape-skill-text">
              <div class="shape-skill-name">${s.name}${active ? " ✓" : ""}</div>
              <div class="shape-skill-owner">${s.desc}</div>
              ${best}
            </span>
          </button>`;
      });
      const row = document.createElement("div");
      row.className = "shape-row";
      row.innerHTML = `
        <div class="shape-row-head"><span class="shape-pill">${meta.icon} ${meta.label}</span>${meta.hint}</div>
        <div class="shape-row-grid">${cards}</div>`;
      row.querySelectorAll(".shape-skill-card").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const shp = btn.dataset.shape;
          // Tap again to clear that shape's skill.
          if (sk[shp] === id) sk[shp] = null;
          else sk[shp] = id;
          openShapeSkillPicker(shp, pickerOnDone, pickerProgress);
        });
      });
      rows.appendChild(row);
      if (doneBtn) {
        doneBtn.textContent = "Continue";
        doneBtn.disabled = !!(progress && !run.shapeSkills[openShape]);
      }
      ov.classList.add("open");
    }

    function shapeMeta(shape) {
      const m = {
        star:     { icon: "⭐", label: "Star",     hint: "5+ in a line" },
        cross:    { icon: "✚", label: "Cross",    hint: "plus-shaped" },
        charged:  { icon: "⚡", label: "Charged",  hint: "charged 4+" }
      };
      return m[shape] || { icon: "❔", label: shape, hint: "" };
    }

    let pickerOnDone = null;
    let pickerProgress = null;
    let pickerForceShape = null;

    function closeShapeSkillPicker() {
      // A tutorial pick must not be skipped: keep the overlay open until the
      // earned shape actually has a skill assigned.
      if (pickerForceShape && !run.shapeSkills[pickerForceShape]) return;
      const ov = document.getElementById("shapeSkillOverlay");
      if (ov) ov.classList.remove("open");
      if (typeof saveRun === "function") saveRun();
      pickerForceShape = null;
      pickerProgress = null;
      const fn = pickerOnDone;
      pickerOnDone = null;
      if (typeof fn === "function") fn();
    }

    // Tiny clickable gameplay-tip pills under the ultimate pips
    const ULT_TIPS = [
      "Match 3+ tiles to attack the rival",
      "⚔️ Swords & ⭐ Stars deal damage",
      "❤️ Hearts heal · 🛡️ Shields armor · 🎲 Mystery twists",
      "🟣 Corrupted tiles hit YOU for 8 — clear around them",
      "Status tiles: ☠️ Venom · 🔥 Burn · ⚡ Stun · ❄️ Chill",
      "4+ in a line = Charged double power",
      "5+ in a line = Star, extra strong",
      "T / + shapes clear a full row + column",
      "L shapes clear both diagonals",
      "✚/✕ seals are big clears — AP refunds come from Flow Blessing",
      "Bloom tiles clear a 3×3 burst",
      "You get 3 AP a turn — each swap costs 1",
      "Unused AP carries +1 into your next turn",
      "Shuffle is free every 3rd turn",
      "Pass Turn to hand the fight to the rival",
      "Every cascade step multiplies your damage",
      "Match your signature tile to charge your Ultimate",
      "Tap your portrait when pips are full — Ultimate!",
      "Sun Surge (turn 6+) doubles signature power",
      "Full Bloom (turn 11): mysteries always bless",
      "Charged tiles are your burst window — save them",
      "Tap status chips on a portrait to read them",
      "Tap the 'i' on a portrait to open its full passport",
      "Knight: hearts Crack the rival — Shatter cashes them",
      "Wizard: shields also reflect damage back",
      "Ninja dodges hits — the first hit always misses",
      "Tap the log bar to relive any turn",
      "🎲 Mystery tiles roll each match — buff or debuff",
      "🌱 Map mystery nodes gamble — curses can linger",
      "🛣️ Elites are brutal but drop a permanent upgrade",
      "🛡️ Each floor: pick a modifier — boon or risky rare loot",
      "🎯 Mark +15% dmg each (max 3); 🦴 Cracked bursts true dmg",
      "Bed down between fights to recover ~45% of lost HP",
      "☠️ Poison deals true damage each turn, then fades",
      "Bosses wait on floors 15, 30 and 45",
      "Every floor clear offers a perk + modifier pick",
      "Beating a boss unlocks a permanent upgrade",
      "Ultimates cost 1 AP — unleash from your portrait",
      "Ninja ult: burn ⚔️ for true dmg, ×2 on <30% rivals",
      "Wizard ult: spin 🛡️ into free hits + barrier",
      "Knight ult: cash 🦴 Cracked for true dmg, heal, bleed",
      "Boss wins (15/30/45): pick an upgrade + a passive",
      "Permanent upgrades and passives last the whole run",
      "Hero trees: 4 paths, 3 tiers — a free pick each act",
      "Ninja paths: Shadow/Venom/Blade · Wizard: Runic/Mana/Aegis",
      "Passives: Knight Fracture/Fortitude/Retaliate/Valor",
      "Blessed tiles (floors 3/9/15): empower a shape",
      "Boons vary: Radiance +ult · Ripple 3×3 · Venom · Ward",
      "Shape Skills retune ★ ✚ ⚡ mid-fight — pick 1 each",
      "🌸 Bloom: Ripple 3×3 · Quake · Radiance +ult · Field burn",
      "✚ Cross: Flow +AP · Burst dmg · Pump +ult · Sustain heal",
      "✕ X: Flow +AP · Ward shield · Venom · Momentum cascade",
      "⭐ Nova: +1 AP per ⭐ matched — chain matches all turn",
      "✚ Marked: +2 Marks (+15%) — stack, then unload",
      "⚡ Shatter cashes 🦴 Cracked ×3 (Deep/Shatter+ boost it)",
      "⭐ Earthquake feeds +2 🦴 Cracked — prep a Shatter",
      "🔮 Runic makes 🛡️ matches deal damage back",
      "☠️ Venom passives snowball — top off with Venom Cross",
      "🗡️ Shadow Dance turns ⚔️ into Shadow Strike ×4",
      "💎 Radiance/Pump/Tidal/Brilliance charge your ult fast",
      "🛡️ Petal Ward/Starfall make tiles → Shield (Mana armor)",
      "🏰 X-Ward + Fortitude raise Shield — prep before swings",
      "👀 Rival has a signature tile — matching it feeds them",
      "🛡️ Shield absorbs half (60% with Wizard Mana Shield)",
      "🛡️ Ninja Afterglow: −50% damage for turns after ult",
      "💪 Empower +50% / ☁️ Blind −50% your next match",
      "🔄 Disoriented flips your drags — reversed!",
      "🔒 Mana Lock: rival gets no Shield for 2 turns",
      "⏳ Mystery can slow the rival's Ultimate — more turns"
    ];

    // Hero-specific build hints — shown while that class is active. Every other
    // rotating tip pulls from this pool so classes advertise their own synergy.
    const HERO_TIPS = {
      ninja: [
        "Ninja: 4+ ⚔️ Swords → Shadow Step (+1 swap)",
        "Blade build: raw ⚔️ + Assassinate deletes <30% foes",
        "Venom tree: Lethal Poison +1/stack · Plague splashes",
        "Ult Assassinate ×2 on <30% rivals — save it to finish",
        "Shadow Strike: true dmg = ⚔️ cleared ×4 that turn",
        "Shadow tree: +1 AP (Swift) · cascade refunds (Cascade)",
        "Ninja Afterglow: −50% after ult — extend it",
        "Marked Cross: stack ⚡ Marks +15% → Assassinate burst",
        "Star Shadow Dance: +2 AP and ⚔️ conversion"
      ],
      wizard: [
        "Runic build: 🛡️ Shield matches deal damage (+4 splash)",
        "Ult Moonstorm: spend 🛡️ → free hits + barrier",
        "Arcane Reflection: return 40% true dmg when hit",
        "Arcana tree: Star Power +3 · mysteries always bless",
        "Aegis tree: +8 barrier · Mana Shield 60% · reflect",
        "Match 🛡️ to armor AND attack — Runic inverts them",
        "Mana tree: +3 charge · refund at full · +1 AP on 4+",
        "Petal Ward/Starfall → Shield — stack for Moonstorm"
      ],
      knight: [
        "Knight: ❤️ Crack the rival — Shatter cashes them ×3",
        "Deep Cracked +1 · Shatter+ ×1.5 · Earthquake feeds",
        "Ult Earthshatter: heal + burst 🦴 + Bleed — big nuke",
        "Fortitude: Iron Will +15 HP · Fortified +8 Shield",
        "Retaliate: Counter Strike 3 true · Retribution=mHp",
        "Valor: Battle Cry +2 ult · Earthshatter+ +15 true",
        "Iron Will keeps you at 1 HP once (+5 🦴 Cracked)"
      ]
    };
    let ultTipIndex = -1;
    let ultTipIsHero = false;
    const heroTipIndex = { ninja: -1, wizard: -1, knight: -1 };
    function nextUltTip() {
      const cls = (combat && combat.playerClass) || null;
      const heroPool = (cls && HERO_TIPS[cls]) || null;
      // Alternate: general tip, then a class tip (class tips only while in a run).
      ultTipIsHero = heroPool ? !ultTipIsHero : false;
      if (ultTipIsHero && heroPool) {
        heroTipIndex[cls] = (heroTipIndex[cls] + 1) % heroPool.length;
        return heroPool[heroTipIndex[cls]];
      }
      ultTipIndex = (ultTipIndex + 1) % ULT_TIPS.length;
      return ULT_TIPS[ultTipIndex];
    }
    function refreshUltTips() {
      const el = document.getElementById("ultTip");
      if (!el) return;
      if (settings.ultTips === false) {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      const tip = nextUltTip();
      el.textContent = "🌱 " + tip;
      el.title = tip;
    }

    // Player accent colors: applied live to --accent / --accent-2 (names, HP,
    // log, gear, pills, glow). Two-color scheme for the player's look.
    function applyAccent() {
      document.documentElement.style.setProperty("--accent", settings.accentColor || "#4f7a33");
      document.documentElement.style.setProperty("--accent-2", settings.accentColor2 || "#efd48a");
    }
    // Skins (paper / midnight), pip shapes and passport stamp themes ride on
    // body classes so CSS handles the visual switching.
    function applySkin() {
      document.body.classList.toggle("skin-midnight", settings.skin === "midnight");
    }
    function applyPips() {
      document.body.classList.toggle("pips-square", settings.pipStyle === "square");
      document.body.classList.toggle("pips-diamond", settings.pipStyle === "diamond");
    }
    function applyStamp() {
      const pp = document.getElementById("passportOverlay");
      if (!pp) return;
      pp.classList.toggle("stamp-leaf", settings.stampTheme === "leaf");
      pp.classList.toggle("stamp-gold", settings.stampTheme === "gold");
      pp.classList.toggle("stamp-ink", settings.stampTheme === "ink");
    }
    // ---- Floor modifier atmosphere ----
    // The battle background picks up the active floor modifier: body.mod-active +
    // body.mod-<id> tint the sky and board via --mod-c, and themed modifiers add
    // a lightweight particle ambience on #modFx (shared FX budget, lite/reduced-motion aware).
    const MODIFIER_FX_CLASS = { rain: "mod-fx-rain", snow: "mod-fx-snow", ember: "mod-fx-ember", petal: "mod-fx-petal" };
    let modAmbientTimer = null;

    function clearFloorModifierLook() {
      const b = document.body;
      if (!b || !b.classList) return;
      b.classList.remove("mod-active");
      (FLOOR_MODIFIERS || []).forEach(m => b.classList.remove("mod-" + m.id));
      Object.keys(MODIFIER_FX_CLASS).forEach(k => b.classList.remove(MODIFIER_FX_CLASS[k]));
      b.classList.remove("mod-eclipse");
      b.style.removeProperty("--mod-c");
      stopModAmbience();
    }
    function applyFloorModifierLook() {
      clearFloorModifierLook();
      const m = combat.floorModifier;
      if (!m) return;
      const b = document.body;
      b.classList.add("mod-active", "mod-" + m.id);
      if (m.color) b.style.setProperty("--mod-c", m.color);
      if (m.fx && MODIFIER_FX_CLASS[m.fx]) b.classList.add(MODIFIER_FX_CLASS[m.fx]);
      startModAmbience();
    }
    function startModAmbience() {
      stopModAmbience();
      if (settings.liteMode === true) return;
      if (typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const b = document.body;
      const group = b.classList.contains("mod-fx-rain") ? "rain"
        : b.classList.contains("mod-fx-snow") ? "snow"
        : b.classList.contains("mod-fx-ember") ? "ember"
        : b.classList.contains("mod-fx-petal") ? "petal"
        : null;
      if (!group) return;
      const layer = document.getElementById("modFx");
      if (!layer) return;
      layer.classList.add("on");
      modAmbientTimer = setInterval(() => spawnModParticle(layer, group), 230);
      if (modAmbientTimer.unref) modAmbientTimer.unref();
    }
    function stopModAmbience() {
      if (modAmbientTimer) { clearInterval(modAmbientTimer); modAmbientTimer = null; }
      const layer = document.getElementById("modFx");
      if (layer) layer.classList.remove("on");
    }
    function spawnModParticle(layer, group) {
      if (typeof fxNodeAllowed === "function" && !fxNodeAllowed()) return;
      const p = document.createElement("div");
      p.className = "mod-p";
      const vw = window.innerWidth || 320;
      const vh = window.innerHeight || 480;
      const size = group === "rain" ? 2 + Math.random() : 3 + Math.random() * 4;
      p.style.width = size + "px";
      p.style.height = (group === "rain" ? size * 8 : size) + "px";
      p.style.borderRadius = group === "rain" ? "2px" : "50%";
      p.style.left = Math.random() * vw + "px";
      p.style.top = (group === "ember" ? Math.random() * vh : -20 + Math.random() * vh * 0.35) + "px";
      p.style.background = group === "ember"
        ? "radial-gradient(circle at 40% 40%, color-mix(in srgb, var(--mod-c) 60%, #ff9b66) 0%, color-mix(in srgb, var(--mod-c) 70%, transparent) 60%)"
        : group === "rain"
          ? "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--mod-c) 55%, #d6ecff) 100%)"
          : "color-mix(in srgb, var(--mod-c) 55%, transparent)";
      if (group === "petal") p.style.filter = "blur(0.4px)";
      layer.appendChild(p);
      const dur = group === "rain" ? 620 : group === "snow" ? 3200 : group === "ember" ? 2100 : 2400;
      const drift = Math.random() * 60 - 30;
      let anim;
      if (group === "ember") {
        anim = p.animate([
          { transform: "translateY(0)", opacity: 0 },
          { transform: `translateY(${-30 - Math.random() * 70}px) translateX(${drift}px)`, opacity: 1, offset: 0.35 },
          { transform: `translateY(${-160 - Math.random() * 120}px) translateX(${drift * 2}px)`, opacity: 0 }
        ], { duration: dur, easing: "ease-out", fill: "forwards" });
      } else if (group === "rain") {
        anim = p.animate([
          { transform: "translateY(0)", opacity: 0.8 },
          { transform: `translateY(${vh + 40}px)`, opacity: 0 }
        ], { duration: dur, easing: "linear", fill: "forwards" });
      } else {
        anim = p.animate([
          { transform: "translateY(0) translateX(0)", opacity: 0 },
          { transform: `translateY(${vh * 0.5}px) translateX(${drift}px)`, opacity: 1, offset: 0.5 },
          { transform: `translateY(${vh + 30}px) translateX(${-drift}px)`, opacity: 0 }
        ], { duration: dur, easing: "ease-in-out", fill: "forwards" });
      }
      if (typeof fxTrack === "function") fxTrack(p, anim, dur);
      else { const done = () => p.remove(); if (anim && anim.onfinish !== undefined) anim.onfinish = done; else setTimeout(done, dur); }
    }
    applyAccent();
    applySkin();
    applyPips();
    applyStamp();

    function showFloorBanner() {
      // Boss floors get a dramatic intro splash instead of the quick banner
      if (BOSS_KITS[run.floor]) { showBossIntro(BOSS_KITS[run.floor]); return; }
      const ov = document.getElementById("floorBannerOverlay");
      const kicker = document.getElementById("floorBannerKicker");
      const title = document.getElementById("floorBannerTitle");
      const sub = document.getElementById("floorBannerSub");
      const card = document.getElementById("floorBannerCard");
      if (!ov) return;
      // Warn about one-shot pending effects this floor (consumed at battle start)
      const warns = _bannerWarnings;
      _bannerWarnings = [];
      let kick = "Floor";
      let extra = "";
      if (card) card.style.background = "";
      if (card) card.style.boxShadow = "";
      if (isEliteFloor(run.floor)) {
        kick = "Elite Floor";
        extra = (ELITE_KITS[run.floor] && ELITE_KITS[run.floor].name) || "Powerful foe";
      }
      if (combat.floorModifier) {
        extra = (extra ? extra + " — " : "") + combat.floorModifier.icon + " " + combat.floorModifier.name;
        // Tint the banner with the modifier's color
        if (combat.floorModifier.color && card) {
          const c = combat.floorModifier.color;
          card.style.background = `linear-gradient(160deg, ${c}30, #f3efe8)`;
          card.style.boxShadow = `0 12px 40px ${c}40`;
        }
      }
      kicker.textContent = kick;
      title.textContent = String(run.floor);
      if (!extra && run.gameMap) {
        const actIdx = run.gameMap.currentAct || 1;
        sub.textContent = ACT_NAMES[actIdx] || "";
      } else {
        sub.textContent = extra;
      }
      if (warns.length) {
        sub.textContent += (sub.textContent ? "  " : "") + warns.join("  ");
        sub.style.fontSize = "0.72rem";
        sub.style.color = (warns[0].startsWith("⚠️ −") ? "#b04830" : "#a06a10");
      } else {
        sub.style.fontSize = "";
        sub.style.color = "";
      }
      ov.classList.add("open");
      setTimeout(() => ov.classList.remove("open"), 1400);
    }

    function showBossIntro(kit) {
      const ov = document.getElementById("bossIntroOverlay");
      if (!ov || !kit) return;
      const card = document.getElementById("bossIntroCard");
      const actIdx = run.gameMap ? (run.gameMap.currentAct || 1) : (Math.ceil(run.floor / 15) || 1);
      const k = document.getElementById("biKicker");
      const n = document.getElementById("biName");
      const e = document.getElementById("biEpithet");
      const u = document.getElementById("biUlt");
      const btn = document.getElementById("biFaceBtn");
      if (k) k.textContent = `${actIdx === 3 ? "🌺" : actIdx === 2 ? "🌸" : "🌱"} The ${["Sprout", "Bloom", "Flourish"][actIdx - 1] || "Sprout"} · Floor ${run.floor}`;
      if (n) n.textContent = kit.name;
      if (e) e.textContent = kit.epithet || "A great trial stands in your way";
      if (u) u.textContent = `⚡ Ultimate — ${kit.ultName || "???"}`;
      if (card) card.style.setProperty("--bi-c", kit.introColor || "#7aa65e");
      ov.classList.add("open");
      if (btn) {
        btn.onclick = () => ov.classList.remove("open");
      }
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
        add("🦴", "Cracked", s.fracture);
        add("💥", "Ult", s.ult);
        add("↩️", "Reflect", s.reflect);
        vs.innerHTML = chips.join("") || '<span class="victory-chip">No actions</span>';
      }
      // reward may be a string (picker pick) or { label, permanent, tempLabel, upgradeLabel }
      const label = typeof reward === "string" ? reward : reward && reward.label;
      const permanent = typeof reward === "string" ? true : reward && reward.permanent !== false;
      const temp = reward && reward.tempLabel;
      const upg = reward && reward.upgradeLabel;
      if (label) { if (!run.pickLog) run.pickLog = []; run.pickLog.push(label); }
      if (upg) { if (!run.pickLog) run.pickLog = []; run.pickLog.push(upg); }
      if (temp) { if (!run.pickLog) run.pickLog = []; run.pickLog.push(temp); }
      const rewardMsg = document.getElementById("rewardMsg");
      const mod = run.pendingModifier;
      const isFinal = run.floor >= MAX_FLOOR;
      const payoff = document.getElementById("bloomPayoff");
      if (payoff) payoff.hidden = true;
      gameOverOverlay.classList.remove("lose");
      gameOverOverlay.classList.add("win");
      if (isFinal) {
        if (payoff) payoff.hidden = false;
        settings.clearedOnce = true;
        const goldenWin = (run.ngLoop || 0) > 0;
        if (goldenWin) settings.ngLoopsDone = Math.max(settings.ngLoopsDone || 0, run.ngLoop);
        persistSettings();
        if (goldenWin) {
          document.getElementById("gameOverTitle").textContent = "🌟 The Golden Tower Blooms!";
          document.getElementById("gameOverMsg").textContent = `Loop ${run.ngLoop} complete — the Cosmos burns brighter. Somewhere beyond the gold, another tower is waiting. · ⏱ ${fmtTime(run.elapsedMs)}`;
        } else {
          document.getElementById("gameOverTitle").textContent = "🌸 The Tower Blooms!";
          document.getElementById("gameOverMsg").textContent = `All ${MAX_FLOOR} floors climbed. The Storm parts, sunlight floods the grid — and the tower, no longer afraid, blooms. · ⏱ ${fmtTime(run.elapsedMs)}`;
        }
        rewardMsg.innerHTML = label
          ? (permanent ? `🎁 Permanent: ${label}` : `🎁 ${label}`)
          : "🏆 Victory";
        document.getElementById("btnGoRetry").textContent = "Menu";
        clearSave();
      } else {
        document.getElementById("gameOverTitle").textContent = `Floor ${run.floor} Clear`;
        document.getElementById("gameOverMsg").textContent = isBossFloor(run.floor)
          ? (run.floor >= 30 ? "Boss down — the Storm thins, light leaks through!" : "Boss down — the first storm layer breaks!")
          : isEliteFloor(run.floor)
            ? "Elite defeated!"
            : "Rival defeated.";
        let msg = "";
        if (label || upg) {
          let parts = [];
          if (label) parts.push(permanent ? `Permanent: ${label}` : label);
          if (upg) parts.push(`Upgrade: ${upg}`);
          msg = `🎁 ${parts.join("<br>🎁 ")}`;
          if (temp) msg += `<br>⚡ Rare permanent boon: ${temp}`;
        }
        if (mod) {
          msg += `<br>${mod.icon} Modifier: ${mod.name}`;
        }
        rewardMsg.innerHTML = msg;
        showRecap(null);
        if (run.gameMap) {
          document.getElementById("btnGoRetry").textContent = "View Map";
        } else {
          document.getElementById("btnGoRetry").textContent = "Next Floor";
          const savedFloor = run.floor;
          run.floor = savedFloor + 1;
          saveRun();
          run.floor = savedFloor;
        }
      }
      // Mark tutorial complete after floor 1
      if (combat.tutorial && !settings.tutorialCompleted) {
        settings.tutorialCompleted = true;
        persistSettings();
      }
      sayVoice("victory", { force: true });
      playVictory();
      clearFloorModifierLook();
      if (typeof srSay === "function") srSay(isFinal ? "Victory. The Bloom Tower is cleared!" : `Victory on floor ${run.floor}.`);
      gameOverOverlay.classList.add("open");
      recordRun(true);
      if (isFinal) showRecap(true); // after recordRun so final-battle stats are included
    }


    // Boss win → choose 1 of 3 upgrades (4 with a pending extra-pick reward), then show the victory overlay

    // ===================== STS-STYLE MAP SYSTEM =====================
    const ACT_NAMES = ["", "\ud83c\udf31 The Sprout", "\ud83c\udf38 The Bloom", "\ud83c\udf3a The Flourish"];
    // Story: the tower is a seed afraid to bloom; the Storm is its fear.
    const ACT_LORE = [
      "",
      "A seed woke beneath the village. Climb gently — the storm is thin here.",
      "Higher now. The Storm thickens — the tower fears what it might become.",
      "One last climb. The Storm isn't angry. It's afraid of the light."
    ];

    function showMap() {
      const ov = document.getElementById("mapOverlay");
      const layersEl = document.getElementById("mapLayers");
      const actLabel = document.getElementById("mapActLabel");
      if (!ov || !layersEl) return;
      const map = run.gameMap;
      if (!map) return;
      const act = map.currentAct;
      const actData = map.acts[act - 1];
      if (!actData) return;

      if (actLabel) actLabel.textContent = ACT_NAMES[act] || `Act ${act}`;
      layersEl.innerHTML = "";

      // Build a set of reachable node IDs
      const visitedSet = new Set(Object.keys(map.visitedNodes).filter(k => map.visitedNodes[k]));
      const currentId = map.currentNode;
      const reachable = new Set();
      if (!currentId) {
        // First layer: all nodes in layer 0 are reachable
        actData.layers[0].forEach(n => reachable.add(n.id));
      } else {
        const conn = getConnectedNodes(actData, currentId);
        conn.forEach(id => reachable.add(id));
      }

      // Softlock guard: if the current node has no forward moves (e.g. you exited
      // mid-boss and the boss — a terminal node — is already "current"), the map
      // would be dead with nothing clickable. Resume that encounter instead.
      if (currentId && reachable.size === 0) {
        resumeCurrentNode();
        return;
      }

      // Render layers top-to-bottom (boss at top, layer 0 at bottom) using column-reverse
      // Walked path blooms: a connector flowers once you've climbed through its lower layer
      const walked = actData.layers.map(layer => layer.some(n => visitedSet.has(n.id)));
      for (let li = 0; li < actData.layers.length; li++) {
        const layer = actData.layers[li];
        const layerEl = document.createElement("div");
        layerEl.className = "map-layer";
        layer.forEach(node => {
          const nodeEl = document.createElement("div");
          const isVisited = visitedSet.has(node.id);
          const isCurrent = currentId === node.id;
          const isReachable = reachable.has(node.id) && !isVisited;
          // An unfinished node you quit out of mid-battle is "current" but not
          // visited — keep it clickable so you can resume instead of being
          // forced past it (which used to skip the floor in the path).
          const isResumable = isCurrent && !isVisited;
          nodeEl.className = `map-node ${node.type}` + (isVisited ? " visited" : "") + (isCurrent ? " current" : "") + (isReachable ? " reachable" : "") + (isResumable ? " resumable" : "") + (!isVisited && !isCurrent && !isReachable ? " locked" : "");
          nodeEl.innerHTML = `<span class="node-icon">${NODE_ICONS[node.type] || "⚔️"}</span><span class="node-label">${NODE_LABELS[node.type] || ""}</span>`;
          if (isReachable || isResumable) {
            nodeEl.addEventListener("click", () => onMapNodeClick(node));
          }
          layerEl.appendChild(nodeEl);
        });
        layersEl.appendChild(layerEl);
        // Connector between layers (not above layer 0)
        if (li > 0) {
          const conn = document.createElement("div");
          conn.className = "map-connector" + (Math.random() < 0.5 ? " alt" : "") + (walked[li - 1] ? " bloomed" : "");
          if (walked[li - 1]) {
            conn.innerHTML = '<svg class="conn-bloom" viewBox="-33 -33 66 66" aria-hidden="true"><use href="#cosmosHead"/></svg>';
          }
          layersEl.appendChild(conn);
        }
      }
      ov.classList.add("open");
      updateTowerBand();
    }

    function hideMap() {
      const ov = document.getElementById("mapOverlay");
      if (ov) ov.classList.remove("open");
    }

    function onMapNodeClick(node) {
      const map = run.gameMap;
      if (!map) return;
      hideMap();
      // Set current node (visited only on victory)
      map.currentNode = node.id;

      // Route to the right encounter
      if (node.type === "boss") {
        // Boss floors are always at 15/30/45 for kit lookup
        const bossFloors = [15, 30, 45];
        run.floor = bossFloors[map.currentAct - 1] || calcMapFloor(map);
        startBattle({ fromVictory: false, isBoss: true });
      } else if (node.type === "mystery") {
        openMysteryNode(() => {
          map.visitedNodes[node.id] = true;
          showMap();
          saveRun();
        });
      } else if (node.type === "shop") {
        openShopNode(() => {
          map.visitedNodes[node.id] = true;
          showMap();
          saveRun();
        });
      } else if (node.type === "elite") {
        // Elite floors are always at 12/27/42 for kit lookup
        const eliteFloors = [12, 27, 42];
        run.floor = eliteFloors[map.currentAct - 1] || calcMapFloor(map);
        startBattle({ fromVictory: false });
      } else if (node.type === "voidMerchant") {
        openVoidMerchant(() => {
          map.visitedNodes[node.id] = true;
          showMap();
          saveRun();
        });
      } else {
        // Normal fight
        run.floor = calcMapFloor(map);
        startBattle({ fromVictory: false });
      }
      saveRun();
    }

    // Resume the encounter for the node you're currently parked on (used when a
    // run is restored mid-fight, since board/enemy state isn't persisted). This
    // re-fights the node from the start — correct for an unfinished boss/elite/
    // normal battle, and it also clears the dead-map softlock described above.
    function resumeCurrentNode() {
      const map = run.gameMap;
      if (!map || !map.currentNode) { showMap(); return; }
      const node = getNodeById(map.acts[map.currentAct - 1], map.currentNode);
      if (!node) { showMap(); return; }
      hideMap();
      if (node.type === "boss") {
        const bossFloors = [15, 30, 45];
        run.floor = bossFloors[map.currentAct - 1] || calcMapFloor(map);
        startBattle({ fromVictory: false, isBoss: true });
      } else if (node.type === "elite") {
        const eliteFloors = [12, 27, 42];
        run.floor = eliteFloors[map.currentAct - 1] || calcMapFloor(map);
        startBattle({ fromVictory: false });
      } else if (node.type === "mystery") {
        openMysteryNode(() => { map.visitedNodes[node.id] = true; showMap(); saveRun(); });
      } else if (node.type === "shop") {
        openShopNode(() => { map.visitedNodes[node.id] = true; showMap(); saveRun(); });
      } else if (node.type === "voidMerchant") {
        openVoidMerchant(() => { map.visitedNodes[node.id] = true; showMap(); saveRun(); });
      } else {
        run.floor = calcMapFloor(map);
        startBattle({ fromVictory: false });
      }
    }

    function calcMapFloor(map) {
      // Count visited battle nodes in current act to determine floor index.
      // The node currently being fought counts as in-progress (it is only
      // marked "visited" on victory), so the running floor number stays aligned.
      const actData = map.acts[map.currentAct - 1];
      let count = 0;
      for (const layer of actData.layers) {
        for (const node of layer) {
          if ((map.visitedNodes[node.id] || map.currentNode === node.id) && node.type !== "boss") count++;
        }
      }
      return (map.currentAct - 1) * 15 + count;
    }

    // --- New run with map ---
    function showStoryIntro(cb) {
      const ov = document.createElement("div");
      ov.className = "overlay open";
      ov.style.zIndex = 1500;
      ov.innerHTML = `
        <div class="overlay-panel" style="max-width:300px;text-align:center;padding:22px">
          <div style="font-size:2.2rem;line-height:1">🌱</div>
          <div class="last-run-ov-section" style="margin-top:8px">The Bloom Tower</div>
          <div class="info-body" style="text-align:left;font-size:0.72rem;line-height:1.55;margin-top:8px">
            One morning, a tiny seed sprouted in the village square — and grew straight toward the sun.<br><br>
            The village believes: <em>if it ever blooms, something wonderful happens.</em><br><br>
            But a grey Storm has settled at its peak, and the tower is too scared to grow past it.<br><br>
            So it sent for its three bravest friends. Climb the grid, little hero — be brave for the tower.
          </div>
          <button type="button" class="action-btn primary" id="btnStoryGo" style="margin-top:14px;min-height:48px;font-size:0.85rem">Begin the Climb</button>
        </div>`;
      document.body.appendChild(ov);
      ov.querySelector("#btnStoryGo").addEventListener("click", () => {
        ov.remove();
        if (cb) cb();
      });
    }

    function startNewRunMap() {
      const map = generateFullMap();
      run.gameMap = map;
      run.currentAct = 1;
      map.currentAct = 1;
      map.currentNode = null;
      map.visitedNodes = {};
      run.floor = 0;
      run.classUpgradeOfferedActs = [];
      run.act1Unlocks = (typeof buildAct1Unlocks === "function") ? buildAct1Unlocks() : [];
      showScreen("game");
      showStoryIntro(() => showMap());
    }

    function advanceActOrVictory() {
      const map = run.gameMap;
      if (!map) { showVictoryOverlay({ label: "Victory!" }); return; }
      if (map.currentAct < 3) {
        // Advance to next act
        map.currentAct++;
        run.currentAct = map.currentAct;
        map.currentNode = null;
        // Show act transition banner then map
        showActBanner(map.currentAct, () => showMap());
      } else {
        // Beat final boss → campaign clear
        showVictoryOverlay({ label: "Campaign Clear!" });
      }
    }

    function showActBanner(act, cb) {
      const ov = document.getElementById("floorBannerOverlay");
      const kicker = document.getElementById("floorBannerKicker");
      const title = document.getElementById("floorBannerTitle");
      const sub = document.getElementById("floorBannerSub");
      const card = document.getElementById("floorBannerCard");
      if (!ov) { if (cb) cb(); return; }
      if (kicker) kicker.textContent = "Growing Stronger";
      if (title) title.textContent = ACT_NAMES[act] || `Act ${act}`;
      if (sub) sub.innerHTML = `${ACT_LORE[act] || ""}<br><span style="font-size:0.62rem;opacity:.75">Floor ${(act - 1) * 15 + 1}–${act * 15}</span>`;
      if (card) { card.style.background = ""; card.style.boxShadow = ""; }
      ov.classList.add("open");
      setTimeout(() => { ov.classList.remove("open"); if (cb) cb(); }, 2200);
    }

    // ===================== MYSTERY NODE (Card Flip) =====================
    // ─── Mystery nodes: blind luck, PERMANENT consequences ───
    // Every effect outlives the battle. Icon-first, three words maximum.
    const MYSTERY_BLESSINGS = [
      { icon: "❤️", label: "+6 MAX HP", apply() { run.bonusMaxHp += 6; } },
      { icon: "🛡️", label: "+2 SHIELD CAP", apply() { run.bonusShieldMax += 2; } },
      { icon: "⚡", label: "+1 CHARGE AHEAD", apply() { run.floorChargeBonus = (run.floorChargeBonus || 0) + 1; } },
      { icon: "⚡", label: "+2 ULT CHARGE", apply() { run.ultChargeBonus = (run.ultChargeBonus || 0) + 2; } },
      { icon: "⏳", label: "+1 SLOWER ENEMY ULT", apply() { run.enemyUltSlow = (run.enemyUltSlow || 0) + 1; } },
      { icon: "✨", label: "FULL HEAL", apply() {
        const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
        combat.playerHp = hero.hp + run.bonusMaxHp;
      } },
      { icon: "☠️", label: "POISON TILES · 5 green tiles", apply() { run.pendingStatusTiles = { type: "poison", count: 5 }; } },
      { icon: "🔥", label: "BURN TILES · 5 ember tiles", apply() { run.pendingStatusTiles = { type: "burn", count: 5 }; } },
      { icon: "⚡", label: "STUN TILES · 4 lightning tiles", apply() { run.pendingStatusTiles = { type: "stun", count: 4 }; } },
      { icon: "❄️", label: "FROST TILES · 5 ice tiles", apply() { run.pendingStatusTiles = { type: "frost", count: 5 }; } }
    ];
    const MYSTERY_TWISTS = [
      { icon: "🔮", label: "+8 SHIELD · LOSE 4 HP", apply() {
        run.pending.shield += 8;
        combat.playerHp = Math.max(1, combat.playerHp - 4);
      } },
      { icon: "🌀", label: "+2 AP · LOSE 6 HP", apply() {
        run.pending.bonusAp += 2;
        combat.playerHp = Math.max(1, combat.playerHp - 6);
      } },
      { icon: "🎯", label: "+15% CRIT · RIVAL ULT SOONER", apply() {
        run.pending.critChance += 15;
        run.pending.enemySlow -= 1;
      } },
      { icon: "💥", label: "+5 SWORD NOW · −6 SHIELD CAP", apply() {
        run.pending.swordBoost += 5;
        run.bonusShieldMax = Math.max(0, run.bonusShieldMax - 1);
      } }
    ];
    const MYSTERY_CURSES = [
      { icon: "💔", label: "−4 MAX HP", apply() { run.bonusMaxHp = Math.max(0, run.bonusMaxHp - 4); combat.playerHp = Math.min(combat.playerHp, Math.max(1, (HERO_STATS[combat.playerClass] || HERO_STATS.ninja).hp + run.bonusMaxHp)); } },
      { icon: "⛓️", label: "−1 AP NEXT FLOOR", apply() { run.pending.bonusAp -= 1; } },
      { icon: "🥀", label: "WILTED · HEALS HALVED 3 FLOORS", apply() { run.healBlockFloors = 3; } },
      { icon: "🩸", label: "LOSE 12 HP NOW", apply() { combat.playerHp = Math.max(1, combat.playerHp - 12); } }
    ];
    const MYSTERY_JACKPOT = { icon: "🌸", label: "COSMOS BLESSING · +10 MAX HP & FULL HEAL", kind: "bless", apply() {
      run.bonusMaxHp += 10;
      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      combat.playerHp = hero.hp + run.bonusMaxHp;
    } };

    function dealMysteryHand() {
      // Weighted luck: ~56% blessing / 24% twist / 20% curse per card,
      // softened so a hand is never all-curses. ~8% jackpot swap.
      const rollKind = () => {
        const r = Math.random();
        return r < 0.56 ? "bless" : r < 0.80 ? "twist" : "curse";
      };
      const pickFrom = kind => {
        if (kind === "bless") return MYSTERY_BLESSINGS[Math.floor(Math.random() * MYSTERY_BLESSINGS.length)];
        if (kind === "twist") return MYSTERY_TWISTS[Math.floor(Math.random() * MYSTERY_TWISTS.length)];
        return MYSTERY_CURSES[Math.floor(Math.random() * MYSTERY_CURSES.length)];
      };
      const hand = [];
      let curses = 0;
      for (let i = 0; i < 3; i++) {
        let kind = rollKind();
        // Never more than one curse per hand, never all-nothing hands
        if (kind === "curse" && curses >= 1) kind = "bless";
        if (kind === "curse") curses++;
        hand.push({ ...pickFrom(kind), kind });
      }
      // Cosmos jackpot
      if (Math.random() < 0.08) hand[Math.floor(Math.random() * 3)] = { ...MYSTERY_JACKPOT };
      // Shuffle positions
      for (let i = hand.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [hand[i], hand[j]] = [hand[j], hand[i]]; }
      return hand;
    }

    function openMysteryNode(onDone) {
      const ov = document.getElementById("mysteryOverlay");
      const cardsEl = document.getElementById("mysteryCards");
      const resultEl = document.getElementById("mysteryResult");
      const btnDone = document.getElementById("btnMysteryDone");
      const titleEl = document.getElementById("mysteryTitle");
      const subEl = document.getElementById("mysterySub");
      if (!ov || !cardsEl) { if (onDone) onDone(); return; }

      const hand = dealMysteryHand();

      cardsEl.innerHTML = "";
      resultEl.textContent = "";
      resultEl.style.opacity = 0;
      if (btnDone) btnDone.style.display = "none";
      if (titleEl) titleEl.textContent = "🌱 Seed";
      if (subEl) subEl.textContent = "Pick a card — the tower decides";

      hand.forEach(effect => {
        const card = document.createElement("div");
        card.className = "mystery-card reachable";
        const inner = document.createElement("div");
        inner.className = "mystery-card-inner";
        const front = document.createElement("div");
        front.className = "mystery-card-front";
        const back = document.createElement("div");
        back.className = `mystery-card-back kind-${effect.kind}`;
        back.innerHTML = `<div class="mc-icon">${effect.icon}</div><div class="mc-label">${effect.label}</div>`;
        inner.appendChild(front);
        inner.appendChild(back);
        card.appendChild(inner);

        card.addEventListener("click", () => {
          cardsEl.querySelectorAll(".mystery-card").forEach(c => c.classList.add("flipped"));
          card.style.zIndex = 10;
          if (effect.kind === "curse") card.classList.add("cursed");
          if (effect.kind === "bless") card.classList.add("blessed");
          effect.apply();
          const mark = effect.kind === "bless" ? "✨" : effect.kind === "curse" ? "💀" : "🔮";
          resultEl.innerHTML = `${mark} ${effect.label}`;
          resultEl.style.opacity = 1;
          cardsEl.querySelectorAll(".mystery-card").forEach(c => c.style.pointerEvents = "none");
          if (btnDone) btnDone.style.display = "";
        });
        cardsEl.appendChild(card);
      });

      if (btnDone) {
        btnDone.onclick = () => { ov.classList.remove("open"); if (onDone) onDone(); };
      }
      ov.classList.add("open");
    }

    // ===================== SHOP NODE (Spend HP/Shield) =====================
    function generateShopItems() {
      const items = [
        { icon: "⚔️", name: "Sharpen", desc: "+3 sword damage", costType: "hp", cost: 10, apply() { combat.tempSwordDmg += 3; } },
        { icon: "⭐", name: "Star Focus", desc: "+3 star damage", costType: "hp", cost: 10, apply() { combat.tempStarDmg += 3; } },
        { icon: "❤️", name: "Blood Pact", desc: "+10 max HP", costType: "shield", cost: 8, apply() { combat.playerMaxHp += 10; combat.playerHp += 10; } },
        { icon: "🛡️", name: "Iron Mantle", desc: "+5 max shield", costType: "hp", cost: 8, apply() { combat.tempShieldCapBonus += 5; } },
        { icon: "⚡", name: "Surge", desc: "+1 max AP", costType: "hp", cost: 15, apply() { combat.ap = Math.min(AP_MAX + 1, combat.ap + 1); } },
        { icon: "🔮", name: "Enchant", desc: "Add a special tile to board", costType: "shield", cost: 5, apply() { if (typeof window.placeRandomSpecial === "function") window.placeRandomSpecial(); } },
        { icon: "💀", name: "Cracked Shard", desc: "Apply 2 Cracked to enemy", costType: "hp", cost: 12, apply() { combat.fractureStacks = Math.min(6, combat.fractureStacks + 2); combat.fractureTurns = Math.max(combat.fractureTurns, 3); } },
        { icon: "🌟", name: "Golden Nectar", desc: "+4 ult charge", costType: "shield", cost: 6, apply() { addSigCharge(4); } },
      ];
      // Pick 4 random items
      const shuffled = items.slice();
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      return shuffled.slice(0, 4);
    }

    function openShopNode(onDone) {
      const ov = document.getElementById("shopOverlay");
      const itemsEl = document.getElementById("shopItems");
      const hpDisplay = document.getElementById("shopHpDisplay");
      const btnDone = document.getElementById("btnShopDone");
      if (!ov || !itemsEl) { if (onDone) onDone(); return; }

      const items = generateShopItems();
      const bought = new Set();

      function renderShop() {
        itemsEl.innerHTML = "";
        if (hpDisplay) hpDisplay.innerHTML = `❤️ ${combat.playerHp}/${combat.playerMaxHp} HP &nbsp;·&nbsp; 🛡️ ${combat.shield} shield`;
        items.forEach((item, i) => {
          const el = document.createElement("div");
          el.className = "shop-item" + (bought.has(i) ? " bought" : "");
          const costClass = item.costType === "shield" ? " shield-cost" : "";
          const costIcon = item.costType === "hp" ? "❤️" : "🛡️";
          // Check if can afford
          const canAfford = item.costType === "hp" ? combat.playerHp > item.cost : combat.shield >= item.cost;
          if (!canAfford && !bought.has(i)) el.classList.add("cant-afford");
          el.innerHTML = `<span class="si-icon">${item.icon}</span><div class="si-info"><div class="si-name">${item.name}</div><div class="si-desc">${item.desc}</div></div><span class="si-cost${costClass}">${costIcon} ${item.cost}</span>`;
          if (!bought.has(i) && canAfford) {
            el.addEventListener("click", () => {
              bought.add(i);
              // Pay cost
              if (item.costType === "hp") combat.playerHp = Math.max(1, combat.playerHp - item.cost);
              if (item.costType === "shield") combat.shield = Math.max(0, combat.shield - item.cost);
              item.apply();
              renderShop();
            });
          }
          itemsEl.appendChild(el);
        });
      }
      renderShop();
      if (btnDone) btnDone.onclick = () => { ov.classList.remove("open"); if (onDone) onDone(); };
      ov.classList.add("open");
    }

    // ===================== VOID MERCHANT =====================
    // Rare replacement for a Seed node. Trades permanent Max HP/Shield for power.
    function openVoidMerchant(onDone) {
      const ov = document.getElementById("shopOverlay"); // reuse shop overlay
      const itemsEl = document.getElementById("shopItems");
      const hpDisplay = document.getElementById("shopHpDisplay");
      const btnDone = document.getElementById("btnShopDone");
      if (!ov || !itemsEl) { if (onDone) onDone(); return; }

      // Build stock: 2 items per visit, class-filtered, act-scaled cost
      const act = run.currentAct || 1;
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const allStock = [
        // Ninja
        { cls: "NINJA", name: "Bloodletter's Edge", cost: { maxHp: 15 }, effect: () => { run.bloodletter = true; }, desc: "Sword matches apply Bleed (enemy heal ÷2) + you heal 2" },
        { cls: "NINJA", name: "Hollow Vessel", cost: { maxShield: "all", maxShieldFlat: 10 }, effect: () => { run.manaShield = true; run.reflectiveAura = true; }, desc: "Lose all shield. Gain Mana Shield (60% absorb) + Reflect 2" },
        { cls: "NINJA", name: "Shadow of the Fallen", cost: { maxAp: 1 }, effect: () => { run.blitz = true; run.shadowStepEarly = true; }, desc: "Lose 1 Max AP. Gain Blitz (first match free) + Shadow Step at 3 swords" },
        { cls: "NINJA", name: "Plague Bearer", cost: { permanentPoison: 1 }, effect: () => { run.venomousBlade = true; run.miasmaReflex = true; run.lethalPoison = true; run.permanentPoison = true; }, desc: "Gain 1 Poison/turn forever. Gain Venomous Blade + Miasma Reflex + Lethal Poison" },
        // Wizard
        { cls: "WIZARD", name: "Cracked Mirror", cost: { maxHpPct: 20 }, effect: () => { run.arcaneMirror = true; run.contagionCatalyst = true; run.mysticInsight = true; }, desc: "Lose 20% Max HP. Gain Arcane Mirror + Contagion Catalyst + Mystic Insight" },
        { cls: "WIZARD", name: "Void Battery", cost: { maxShield: 15 }, effect: () => { run.floorChargeBonus = (run.floorChargeBonus || 0) + 5; run.infiniteMana = true; }, desc: "Lose 15 Max Shield. Gain +5 Ult charge/floor + Infinite Mana (4+ match = 1 AP)" },
        { cls: "WIZARD", name: "Starved Sage", cost: { maxHp: 10 }, effect: () => { run.celestial = true; run.runicShield = true; }, desc: "Lose 10 Max HP. Gain Sun-Kissed (star heal 3 + shield 1) + Runic Burst" },
        // Knight
        { cls: "KNIGHT", name: "Earth's Hunger", cost: { loseIronWill: true }, effect: () => { run.lostIronWill = true; run.shatterPlus = true; run.earthquake = true; run.toxicFortitude = true; }, desc: "Lose Iron Will cheat death. Gain Shatter+ + Earthquake + Toxic Fortitude" },
        { cls: "KNIGHT", name: "Hollow Knight", cost: { maxHp: 15 }, effect: () => { run.devastation = true; run.counterStrike = true; }, desc: "Lose 15 Max HP. Gain Power Strike (ult spends shield) + Counter Strike" },
        { cls: "KNIGHT", name: "Grave Warden", cost: { maxShield: 10 }, effect: () => { run.bulwark = true; run.corrosiveOverheal = true; }, desc: "Lose 10 Max Shield. Gain Bulwark (shield→fracture) + Corrosive Overheal" },
        // Any
        { cls: "ANY", name: "Gambler's Coin", cost: { currentHpPct: 50 }, effect: () => { run.nextSeedGuaranteed = true; }, desc: "Pay half current HP. Next Seed: 3 Blessings, 0 Curses, Guaranteed Jackpot" },
        { cls: "ANY", name: "Key to the Back Door", cost: { skipRewards: true }, effect: () => { run.skipNextElite = true; run.bossDoubleDrop = true; }, desc: "Skip floor rewards this act. Skip next Elite, Boss drops 2 upgrades" },
      ];
      const stock = allStock
        .filter(s => s.cls === "ANY" || s.cls === hero)
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);

      const dialogue = [
        "You smell like potential. And iron deficiency.",
        "I don't take gold. I take *tomorrows*.",
        "That HP? You're just borrowing it from the floor below.",
        "Go on. Bleed a little. Power likes the taste.",
        "The tower eats the weak. I just... help it digest.",
        "Your shield? A pretty lie. Sell it to me.",
      ][Math.floor(Math.random() * 6)];

      function renderMerchant() {
        itemsEl.innerHTML = "";
        if (hpDisplay) hpDisplay.innerHTML = `❤️ ${combat.playerHp}/${combat.playerMaxHp} HP &nbsp;·&nbsp; 🛡️ ${combat.shield} shield`;
        // Title card
        const titleCard = document.createElement("div");
        titleCard.className = "shop-item void-title";
        titleCard.innerHTML = `<span class="si-icon">👁️</span><div class="si-info"><div class="si-name">Void Merchant</div><div class="si-desc">${dialogue}</div></div>`;
        itemsEl.appendChild(titleCard);

        stock.forEach((item, i) => {
          const el = document.createElement("div");
          el.className = "shop-item void-item";
          let costText = "";
          if (item.cost.maxHp) costText = `❤️ −${item.cost.maxHp} Max HP`;
          else if (item.cost.maxHpPct) costText = `❤️ −${item.cost.maxHpPct}% Max HP`;
          else if (item.cost.currentHpPct) costText = `❤️ −${item.cost.currentHpPct}% Current HP`;
          else if (item.cost.maxShield) costText = `🛡️ −${item.cost.maxShield} Max Shield`;
          else if (item.cost.maxShieldFlat) costText = `🛡️ Lose All Shield + ${item.cost.maxShieldFlat} Max Shield`;
          else if (item.cost.maxAp) costText = `⚡ −${item.cost.maxAp} Max AP`;
          else if (item.cost.permanentPoison) costText = `☠️ Permanent: +${item.cost.permanentPoison} Poison/turn`;
          else if (item.cost.loseIronWill) costText = `💔 Lose Iron Will (cheat death)`;
          else if (item.cost.skipRewards) costText = `🎁 Skip This Act's Rewards`;

          const canAfford = checkVoidCost(item.cost);

          el.innerHTML = `
            <span class="si-icon">${item.cls === "ANY" ? "🎲" : hero === "NINJA" ? "🗡️" : hero === "WIZARD" ? "🔮" : "🏰"}</span>
            <div class="si-info">
              <div class="si-name">${item.name}</div>
              <div class="si-desc">${item.desc}</div>
            </div>
            <span class="si-cost${canAfford ? "" : " cant-afford"}">${costText}</span>
          `;
          if (canAfford) {
            el.addEventListener("click", () => {
              payVoidCost(item.cost);
              item.effect();
              if (!run.voidMerchantPurchases) run.voidMerchantPurchases = [];
              run.voidMerchantPurchases.push(item.name);
              ov.classList.remove("open");
              if (onDone) onDone();
              saveRun();
            });
          }
          itemsEl.appendChild(el);
        });
      }

      function checkVoidCost(cost) {
        if (cost.maxHp) return combat.playerMaxHp > cost.maxHp;
        if (cost.maxHpPct) return combat.playerMaxHp > Math.ceil(combat.playerMaxHp * cost.maxHpPct / 100);
        if (cost.currentHpPct) return combat.playerHp > Math.ceil(combat.playerHp * cost.currentHpPct / 100);
        if (cost.maxShield) return combat.shield >= cost.maxShield || (run.bonusShieldMax || 0) >= cost.maxShield;
        if (cost.maxShieldFlat) return true; // always can pay "lose all shield"
        if (cost.maxAp) return (run.bonusApMax || 0) > cost.maxAp || AP_MAX > 3 + cost.maxAp;
        if (cost.permanentPoison) return true;
        if (cost.loseIronWill) return run.lostIronWill !== true;
        if (cost.skipRewards) return true;
        return true;
      }

      function payVoidCost(cost) {
        if (cost.maxHp) {
          run.bonusMaxHp = Math.max(0, run.bonusMaxHp - cost.maxHp);
          combat.playerMaxHp = HERO_STATS[combat.playerClass].hp + run.bonusMaxHp;
          combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp);
        }
        if (cost.maxHpPct) {
          const loss = Math.ceil(combat.playerMaxHp * cost.maxHpPct / 100);
          run.bonusMaxHp = Math.max(0, run.bonusMaxHp - loss);
          combat.playerMaxHp = HERO_STATS[combat.playerClass].hp + run.bonusMaxHp;
          combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp);
        }
        if (cost.currentHpPct) {
          const loss = Math.ceil(combat.playerHp * cost.currentHpPct / 100);
          combat.playerHp = Math.max(1, combat.playerHp - loss);
        }
        if (cost.maxShield) {
          run.bonusShieldMax = Math.max(0, run.bonusShieldMax - cost.maxShield);
        }
        if (cost.maxShieldFlat) {
          combat.shield = 0;
          run.bonusShieldMax = (run.bonusShieldMax || 0) + cost.maxShieldFlat;
        }
        if (cost.maxAp) {
          run.bonusApMax = Math.max(0, run.bonusApMax - cost.maxAp);
          AP_MAX = 3 + run.bonusApMax;
        }
        if (cost.permanentPoison) {
          run.permanentPoison = true;
        }
        if (cost.loseIronWill) {
          run.lostIronWill = true;
        }
        if (cost.skipRewards) {
          run.skipActRewards = true;
        }
        // Visual feedback
        dmgPop("player", "PAID", "dmg");
        shakeBoard("heavy");
      }

      renderMerchant();
      if (btnDone) btnDone.onclick = () => { ov.classList.remove("open"); if (onDone) onDone(); };
      ov.classList.add("open");
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
        if (choices.length === 0) {
          // All upgrades claimed — heal as consolation
          const btn = document.createElement("button");
          btn.type = "button";
          buildRewardCard(btn, { name: "💚 Tower's Mercy", desc: "All upgrades claimed. Healed to full.", tier: "common" }, { permanent: true });
          btn.addEventListener("click", () => {
            combat.playerHp = combat.playerMaxHp;
            ov.classList.remove("open");
            onPick("Full Heal");
          });
          wrap.appendChild(btn);
          return;
        }
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
            if (typeof codexReveal === "function") codexReveal("upgrades", u.id);
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
        // onclick (not addEventListener) — this button persists across pickers,
        // so accumulating listeners would stack stale closures
        rrBtn.onclick = () => {
          if (rerollLeft <= 0) return;
          rerollLeft--;
          render();
          if (rerollLeft <= 0) rrBtn.style.display = "none";
        };
      }
      ov.classList.add("open");
    }

    // Passive tree picker — shows available passive upgrades for the player's class.
    // Tier 1 = start new path. Tier 2/3 = upgrade existing path (requires previous tier).
    function openPassivePicker(onPick) {
      const wrap = document.getElementById("upgradeCards");
      const ov = document.getElementById("upgradeOverlay");
      const t = document.getElementById("upgradeTitle");
      const s = document.getElementById("upgradeSub");
      const rr = document.getElementById("upgradeReroll");
      if (!wrap || !ov) { onPick(null); return; }
      if (rr) rr.style.display = "none";
      if (t) t.textContent = "Passive Upgrade";
      if (s) s.textContent = "Choose a new path or strengthen an existing one";
      wrap.innerHTML = "";
      const choices = getPassiveChoices(3);
      if (!choices.length) {
        const note = document.createElement("div");
        note.className = "up-card-desc";
        note.style.textAlign = "center";
        note.style.padding = "20px";
        note.textContent = "All passive paths mastered!";
        wrap.appendChild(note);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "upgrade-card glow-general";
        btn.textContent = "💚 Full Heal";
        btn.addEventListener("click", () => {
          combat.playerHp = combat.playerMaxHp;
          ov.classList.remove("open");
          onPick("Full Heal");
        });
        wrap.appendChild(btn);
        ov.classList.add("open");
        return;
      }
      choices.forEach(p => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "upgrade-card glow-" + (p.cls === "NINJA" ? "sword" : p.cls === "WIZARD" ? "shield" : "hp");
        const top = document.createElement("div");
        top.className = "up-card-top";
        const tierTag = document.createElement("span");
        tierTag.className = "up-card-archetype sword";
        tierTag.textContent = p.tier === 1 ? "NEW PATH" : "TIER " + p.tier;
        const pathTag = document.createElement("span");
        pathTag.className = "modifier-tier easy";
        pathTag.textContent = p.path.toUpperCase();
        top.append(tierTag, pathTag);
        const title = document.createElement("div");
        title.className = "up-card-title";
        title.textContent = (p.icon || "") + " " + p.name;
        const descEl2 = document.createElement("div");
        descEl2.className = "up-card-desc";
        descEl2.textContent = p.desc;
        btn.append(top, title, descEl2);
        btn.addEventListener("click", () => {
          if (!run.passives) run.passives = [];
          run.passives.push(p.id);
          if (typeof codexReveal === "function") codexReveal("passives", p.id);
          p.apply();
          ov.classList.remove("open");
          onPick(p.name);
        });
        wrap.appendChild(btn);
      });
      ov.classList.add("open");
    }

function checkGameOver() {
      if (gameOver) return;
      document.body.classList.remove("your-turn");
      if (combat.enemyHp <= 0) {
        gameOver = true;
        busy = true;
        pauseRunTimer();
        // Mark map node as visited on victory
        if (run.gameMap && run.gameMap.currentNode) {
          run.gameMap.visitedNodes[run.gameMap.currentNode] = true;
        }
        // Plague passive: if enemy died while poisoned, next floor's enemy takes 10 damage
        if (run.plague && combat.poisonStacks > 0) {
          run.plagueDmg = (run.plagueDmg || 0) + 10;
        }
        const runFloorRewards = () => {
        if (isBossFloor(run.floor)) {
          run.bossesSlain = (run.bossesSlain || 0) + 1;
          // Final boss: no reward pick — the run just ended, and the last
          // permanent kit was already awarded before floor 45 (on floor 44).
          if (run.floor >= MAX_FLOOR) {
            showVictoryOverlay({ label: null, permanent: false });
            return;
          }
          openUpgradePicker(upgradeLabel => {
            openPassivePicker(passiveLabel => {
              showVictoryOverlay({ label: upgradeLabel, permanent: true, passiveLabel });
            });
          });
        } else if (isEliteFloor(run.floor)) {
          run.elitesSlain = (run.elitesSlain || 0) + 1;
          const perm = GAUNTLET_REWARDS[run.floor];
          let permanentLabel = null;
          if (perm) {
            // Claim-once guard — a replayed elite floor must not re-grant
            if (!run.rewardsClaimed) run.rewardsClaimed = {};
            if (!run.rewardsClaimed[run.floor]) {
              run.rewardsClaimed[run.floor] = true;
              perm.apply();
              permanentLabel = perm.label;
            }
          }
          // The floor-27 elite (last stop before the Act-2 boss) also grants a
          // permanent upgrade pick, so the player gets one more before floor 30.
          const afterUpgrade = (upgradeLabel) => {
            openPassivePicker(passiveLabel => {
              openRewardPicker(buildEliteTempChoices(), {
                title: "Elite Reward",
                sub: "Pick a rare, permanent boon",
                permanent: true,
                nextFloor: run.floor + 1,
                onPick: label => openModifierPicker(mod => {
                  run.pendingModifier = mod;
                  if (mod && mod.tier === "hard") {
                    run.pendingModifierRare = true;
                    openEasyBonusPicker(() => {
                      showVictoryOverlay({ label: permanentLabel, permanent: true, tempLabel: label, passiveLabel, upgradeLabel });
                    });
                  } else {
                    showVictoryOverlay({ label: permanentLabel, permanent: true, tempLabel: label, passiveLabel, upgradeLabel });
                  }
                })
              });
            });
          };
          if (run.floor === 27) {
            openUpgradePicker(afterUpgrade);
          } else {
            afterUpgrade(null);
          }
        } else if (run.floor === 44) {
          // The floor before the final boss is where the last permanent kit is
          // awarded — so it's actually usable for the floor-45 climax instead of
          // being wasted at the end of the run.
          openUpgradePicker(upgradeLabel => {
            openPassivePicker(passiveLabel => {
              showVictoryOverlay({ label: upgradeLabel, permanent: true, passiveLabel });
            });
          });
        } else {
          // Won a normal battle (not boss/elite): the usual floor reward chain.
          // Act-1 tutorial unlocks (Tile Blessings / Shape Skills) are handled by
          // the runFloorRewards caller for the first six battle wins.
          // Void Merchant: Skip act rewards
          if (run.skipActRewards) {
            run.skipActRewards = false;
            showVictoryOverlay({ label: "Rewards skipped — Key to the Back Door", permanent: false });
          } else {
            openRewardPicker(buildFloorRewardChoices(), {
              title: "Floor Reward",
              sub: "Pick a permanent boon — it stays all run",
              permanent: true,
              nextFloor: run.floor + 1,
              onPick: label => openModifierPicker(mod => {
                run.pendingModifier = mod;
                if (mod && mod.tier === "hard") {
                  run.pendingModifierRare = true;
                  openEasyBonusPicker(() => {
                    showVictoryOverlay({ label, permanent: false });
                  });
                } else {
                  showVictoryOverlay({ label, permanent: false });
                }
              })
            });
          }
        }
        };
        // Act 1 tutorial: the first six battle wins grant one Tile Blessing or
        // Shape Skill each (fully random order) before that floor's rewards.
        const act1Unlock = (run.gameMap && run.gameMap.currentAct === 1 &&
          Array.isArray(run.act1Unlocks) && run.act1Unlocks.length > 0)
          ? run.act1Unlocks.shift()
          : null;
        if (act1Unlock) {
          const unlockProgress = { at: 6 - run.act1Unlocks.length, of: 6 };
          if (act1Unlock.kind === "blessing") {
            openTileBlessingPicker(act1Unlock.id, runFloorRewards, unlockProgress);
          } else {
            openShapeSkillPicker(act1Unlock.id, runFloorRewards, unlockProgress);
          }
        } else {
          runFloorRewards();
        }
      } else if (combat.playerHp <= 0) {
        gameOver = true;
        busy = true;
        pauseRunTimer();
        gameOverOverlay.classList.remove("win");
        gameOverOverlay.classList.add("lose");
        shakeBoard("strong");
        document.getElementById("gameOverTitle").textContent = "Defeat";
        document.getElementById("gameOverMsg").textContent = `Fell on floor ${run.floor}${run.gameMap ? ` · ${ACT_NAMES[run.gameMap.currentAct || 1] || ""}` : ""} · ⏱ ${fmtTime(run.elapsedMs)}`;
        document.getElementById("rewardMsg").textContent = "";
        document.getElementById("gameOverSubtitle").textContent = `Floor ${run.floor} · ${combat.enemyName || "Rival"} · ⏱ ${fmtTime(run.floorElapsedMs)}`;
        const ls = combat.stats || {};
        const lossSum = document.getElementById("victorySummary");
        if (lossSum) {
          const totalDealt = (ls.sword || 0) + (ls.star || 0) + (ls.runic || 0) + (ls.poison || 0) + (ls.fracture || 0) + (ls.ult || 0) + (ls.reflect || 0);
          lossSum.innerHTML =
            `<div class="victory-stat damage"><span>⚔️ Damage dealt</span><b>${totalDealt}</b></div>` +
            `<div class="victory-stat"><span>💔 Damage taken</span><b>${ls.taken || 0}</b></div>` +
            `<div class="victory-stat heal"><span>💚 Healed</span><b>${ls.healed || 0}</b></div>` +
            `<div class="victory-stat shield"><span>🛡️ Shield gained</span><b>${ls.shield || 0}</b></div>` +
            `<div class="victory-stat"><span>🔁 Turns</span><b>${combat.turn || 0}</b></div>` +
            `<div class="victory-stat"><span>⭐ Charge</span><b>${combat.sigBank}/${settings.ultMaxCharge}</b></div>`;
        }
        const lossVs = document.getElementById("victoryStats");
        if (lossVs) {
          const chips = [];
          const add = (emoji, label, val) => { if (val > 0) chips.push(`<span class="victory-chip">${emoji} ${label} <b>${val}</b></span>`); };
          add("⚔️", "Sword", ls.sword);
          add("⭐", "Star", ls.star);
          add("🔮", "Runic", ls.runic);
          add("☠️", "Poison", ls.poison);
          add("🦴", "Cracked", ls.fracture);
          add("💥", "Ult", ls.ult);
          add("↩️", "Reflect", ls.reflect);
          lossVs.innerHTML = chips.join("") || '<span class="victory-chip">No actions</span>';
        }
        document.getElementById("btnGoRetry").textContent = "Retry Floor";
        // Death Defiance: the death screen doubles as a buy-to-continue. The
        // run is NOT finalized (stats/history/save) until the player actually
        // leaves the screen — a bought revive skips finalization and resumes
        // the very same battle instead.
        resetGameOverPanel(); // clear any lingering payment step
        defeatPending = true;
        const reviveBtn = document.getElementById("btnGoRevive");
        if (reviveBtn) {
          reviveBtn.hidden = false;
          const dc = settings.deathDefiance || 0;
          reviveBtn.textContent = dc > 0
            ? `💀 Death Defiance · Revive & continue (₱3) — ${dc} in stash`
            : `💀 Death Defiance · Revive & continue (₱3)`;
        }
        gameOverOverlay.classList.add("open");
      }
    }

    // Called only when the player walks away from the death screen (Menu/Retry).
    // A bought revive never runs this, so nothing is double-counted.
    function finalizeDefeat() {
      if (!defeatPending) return;
      defeatPending = false;
      const reviveBtn = document.getElementById("btnGoRevive");
      if (reviveBtn) reviveBtn.hidden = true;
      accumulateBattleStats(); // the losing battle still counts toward the story
      showRecap(false);
      saveRun(); // resume same floor
      if (typeof srSay === "function") srSay(`Defeat. Fell on floor ${run.floor}${run.gameMap ? `, ${ACT_NAMES[run.gameMap.currentAct || 1] || ""}` : ""}. ${fmtTime(run.elapsedMs)}.`);
      sayVoice("defeat", { force: true });
      playDefeat();
      clearFloorModifierLook();
      recordRun(false);
    }

    const SAVE_KEY = "puzzleGridRun_v1";
    const HISTORY_KEY = "puzzleGridHistory_v1";
    const MAX_HISTORY = 20;
    const SLOT_COUNT = 2;
    function slotKey(i) { return SAVE_KEY + "_s" + i; }
    function currentSlot() {
      const s = (typeof settings.activeSlot === "number") ? settings.activeSlot : 0;
      return (s >= 0 && s < SLOT_COUNT) ? s : 0;
    }

    // ---------- Run Recap Card ----------
    function buildRecapHtml(won) {
      const c = run.cumulative || {};
      const fmtN = n => (n || 0).toLocaleString();
      const hero = CHARACTERS[combat.playerClass] || {};
      const actName = run.gameMap ? (ACT_NAMES[run.gameMap.currentAct || 1] || "") : "";
      const rows = [
        [won ? "🌸" : "🥀", won ? `Tower cleared — all ${MAX_FLOOR} floors` : `Fell on floor ${run.floor}${actName ? ` · ${actName}` : ""}`],
        ["⏱️", fmtTime(run.elapsedMs || 0)],
        ["⚔️", `${fmtN(c.dealt)} damage dealt`],
        ["🛡️", `${fmtN(c.shield)} shield raised`],
        ["❤️", `${fmtN(c.healed)} HP healed`],
        ["💥", `${fmtN(c.taken)} damage taken`],
        ["⚡", `${c.ults || 0} ultimates cast`],
        ["🎲", `${run.mysteriesFlipped || 0} mysteries flipped`],
        ["🔗", `best chain ×${run.maxCombo || 0}`],
        ["🏆", `${run.elitesSlain || 0} elites · ${run.bossesSlain || 0} bosses felled`]
      ];
      const title = won ? "The Climb Remembered" : "Where the petals fell";
      return `<div class="recap-title">${title}</div>` +
        rows.map(([ic, tx]) => `<div class="recap-row"><span class="recap-ic">${ic}</span><span>${tx}</span></div>`).join("");
    }

    function buildRecapShareText(won) {
      const c = run.cumulative || {};
      const hero = CHARACTERS[combat.playerClass] || {};
      const lines = [
        `🌸 Bloom Tower — ${hero.name || combat.playerClass} (${settings.difficulty || "normal"})${(run.ngLoop || 0) > 0 ? ` · 🌟 Loop ${run.ngLoop}` : ""}`,
        won
          ? `🌸 Tower cleared — all ${MAX_FLOOR} floors · ⏱ ${fmtTime(run.elapsedMs || 0)}`
          : `🥀 Fell on floor ${run.floor} · ⏱ ${fmtTime(run.elapsedMs || 0)}`,
        `⚔️ ${(c.dealt || 0).toLocaleString()} dmg · 🛡️ ${(c.shield || 0).toLocaleString()} shield · ❤️ ${(c.healed || 0).toLocaleString()} healed`,
        `⚡ ${c.ults || 0} ults · 🎲 ${run.mysteriesFlipped || 0} mysteries · 🔗 best chain ×${run.maxCombo || 0}`,
        `🏆 ${run.elitesSlain || 0} elites · ${run.bossesSlain || 0} bosses`
      ];
      return lines.join("\n");
    }

    function showRecap(won) {
      const card = document.getElementById("recapCard");
      const btn = document.getElementById("btnCopyRecap");
      if (!card) return;
      if (won === null) { card.hidden = true; if (btn) btn.hidden = true; return; }
      card.innerHTML = buildRecapHtml(won);
      card.hidden = false;
      if (btn) {
        btn.hidden = false;
        btn.onclick = async () => {
          const text = buildRecapShareText(won);
          try {
            await navigator.clipboard.writeText(text);
            btn.textContent = "✓ Copied!";
          } catch (_) {
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); btn.textContent = "✓ Copied!"; } catch (_) { btn.textContent = "Copy failed"; }
            ta.remove();
          }
          setTimeout(() => { btn.textContent = "📋 Copy Recap"; }, 1600);
        };
      }
    }

    function loadHistory() {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (_) { return []; }
    }

    // Shared full-stats renderer. Data shape:
    // { heroName, loop, pills:[html], cumulative:{}, lastBattle:{s:{},turns}|null,
    //   milestones:{elites,bosses,mysteries,chain,rewards,careerBest},
    //   kit:[labels], career:{...records}|null }
    function buildRunStatsSections(d) {
      const pill = (t) => `<span class="rs-pill">${t}</span>`;
      const row = (k, v) => `<div><span>${k}</span><b>${v}</b></div>`;
      const kitPills = (list) => {
        const counts = {}; const order = [];
        (list || []).forEach(x => { if (!counts[x]) { counts[x] = 0; order.push(x); } counts[x]++; });
        return order.map(x => pill(counts[x] > 1 ? `${x} ×${counts[x]}` : x));
      };
      const head = `<div class="rs-head">${d.heroName || "Hero"}${(d.loop || 0) > 0 ? " · 🌟 Loop " + d.loop : ""}</div>
        <div>${(d.pills || []).map(pill).join("")}</div>`;
      const c = d.cumulative || {};
      const battles = `<div class="rs-sec">Combat Totals</div>
        <div class="rs-grid">
          ${row("⚔️ Damage dealt", (c.dealt || 0).toLocaleString())}
          ${row("💔 Damage taken", (c.taken || 0).toLocaleString())}
          ${row("💚 Healed", (c.healed || 0).toLocaleString())}
          ${row("🛡️ Shield raised", (c.shield || 0).toLocaleString())}
          ${row("⚡ Ultimates", c.ults || 0)}
        </div>`;
      const s = d.lastBattle && d.lastBattle.s;
      const lastBattle = s && s.taken !== undefined ? `<div class="rs-sec">Last Battle</div>
        <div class="rs-grid">
          ${((s.sword||0)>0 ? row("⚔️ Sword", s.sword) : "")}
          ${((s.star||0)>0 ? row("⭐ Star", s.star) : "")}
          ${((s.runic||0)>0 ? row("🔮 Runic", s.runic) : "")}
          ${((s.poison||0)>0 ? row("☠️ Poison", s.poison) : "")}
          ${((s.fracture||0)>0 ? row("🦴 Cracked", s.fracture) : "")}
          ${((s.ult||0)>0 ? row("💥 Ultimate", s.ult) : "")}
          ${((s.reflect||0)>0 ? row("↩️ Reflect", s.reflect) : "")}
          ${row("💔 Taken", s.taken || 0)}
          ${row("💚 Healed", s.healed || 0)}
          ${row("🛡️ Shield", s.shield || 0)}
          ${row("🔁 Turns", (d.lastBattle.turns || 0))}
        </div>` : "";
      const m = d.milestones || {};
      const milestones = `<div class="rs-sec">Milestones</div>
        <div class="rs-grid">
          ${row("🏆 Elites felled", m.elites || 0)}
          ${row("👑 Bosses felled", m.bosses || 0)}
          ${row("🎲 Mysteries flipped", m.mysteries || 0)}
          ${row("🔗 Best chain", "×" + (m.chain || 0))}
          ${row("🎁 Rewards taken", m.rewards || 0)}
          ${row("🧭 Career best floor", m.careerBest || 1)}
        </div>`;
      const kitList = kitPills(d.kit || []).join("");
      const kit = kitList ? `<details class="rs-kit-details"><summary class="rs-kit-summary"><span class="rs-caret">▸</span><span class="rs-sec">Kit Collected</span><span class="rs-kit-count">${(d.kit || []).length}</span></summary><div class="rs-kit">${kitList}</div></details>` : "";
      const cur = d.career;
      const career = cur && (cur.bestFloor || cur.clears) ? `<div class="rs-sec">🏆 ${cur.name || "Hero"} Career Records</div>
        <div class="rs-kit">
          ${pill("Best floor " + (cur.bestFloor || 1))}
          ${pill("Cleared " + (cur.clears || 0))}
          ${pill(cur.bestTimeMs ? "Best clear " + fmtDuration(cur.bestTimeMs) : (cur.clears ? "No best clear yet" : "No clear yet"))}
          ${pill("Most dmg " + (cur.mostDealt || 0).toLocaleString())}
          ${pill("Peak ults " + (cur.mostUlts || 0))}
          ${pill("Chain ×" + (cur.bestChain || 0))}
        </div>` : "";
      return head + battles + lastBattle + milestones + kit + career;
    }

    // Full run-level stats modal (accessible from the victory/defeat overlay,
    // and from the menu last-run card with a saved history entry)
    function openRunStats(entry) {
      const ov = document.getElementById("runStatsOverlay");
      const body = document.getElementById("runStatsBody");
      const title = document.getElementById("runStatsTitle");
      if (!ov || !body) return;
      let data;
      if (entry) {
        const cur = settings.career && settings.career[entry.hero || ""];
        data = {
          heroName: entry.heroName || entry.hero || "Hero",
          loop: entry.loop,
          pills: [
            (entry.won ? "🏆 Victory" : "💀 Defeat") + " · Floor " + (entry.floor || 1) + (entry.act ? " · " + (ACT_NAMES[entry.act] || "") : ""),
            (entry.diff || "normal")[0].toUpperCase() + (entry.diff || "normal").slice(1),
            "⏱ " + fmtTime(entry.timeMs || 0)
          ],
          cumulative: entry.cumulative || {},
          lastBattle: entry.lastBattle && entry.lastBattle.s ? { s: entry.lastBattle.s, turns: entry.lastBattle.turns || 0 } : null,
          milestones: {
            elites: entry.elites || 0,
            bosses: entry.bosses || 0,
            mysteries: entry.mysteries || 0,
            chain: entry.maxCombo || 0,
            rewards: (entry.picks || []).length,
            careerBest: (cur && cur.bestFloor) || 1
          },
          kit: entry.picks || [],
          career: cur && (cur.bestFloor || cur.clears) ? { ...cur, name: entry.heroName || entry.hero || "Hero" } : null
        };
        if (title) title.textContent = entry.won ? "🏆 Victory Stats" : "💀 Defeat Stats";
      } else {
        const c = run.cumulative || {};
        const s = combat.stats || {};
        const hero = CHARACTERS[combat.playerClass] || {};
        const inRun = run.floor >= 1 && run.floor <= MAX_FLOOR;
        const finalWin = inRun && combat.enemyHp <= 0 && run.floor >= MAX_FLOOR;
        const actName = run.gameMap ? (ACT_NAMES[run.gameMap.currentAct || 1] || "") : "";
        const cur = settings.career && settings.career[combat.playerClass || "ninja"];
        data = {
          heroName: hero.name || combat.playerClass || "Hero",
          loop: run.ngLoop || 0,
          pills: [
            finalWin ? "🌸 Tower cleared" : "Floor " + run.floor + (actName ? " · " + actName : ""),
            (settings.difficulty || "normal")[0].toUpperCase() + (settings.difficulty || "normal").slice(1),
            "⏱ " + fmtTime(run.elapsedMs || 0)
          ],
          cumulative: c,
          lastBattle: s.taken !== undefined ? { s, turns: combat.turn || 0 } : null,
          milestones: {
            elites: run.elitesSlain || 0,
            bosses: run.bossesSlain || 0,
            mysteries: run.mysteriesFlipped || 0,
            chain: run.maxCombo || 0,
            rewards: (run.pickLog || []).length,
            careerBest: settings.bestFloor || 1
          },
          kit: run.pickLog || [],
          career: cur && (cur.bestFloor || cur.clears) ? { ...cur, name: hero.name || "Hero" } : null
        };
        if (title) title.textContent = "📊 Run Stats";
      }
      body.innerHTML = buildRunStatsSections(data);
      ov.classList.add("open");
    }

    function saveHistory(entry) {
      try {
        const list = loadHistory();
        list.unshift(entry);
        if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
        localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      } catch (_) {}
    }

    // Fold the finished battle's stats into the run-cumulative recap totals
    function accumulateBattleStats() {
      const s = combat.stats || {};
      run.cumulative = run.cumulative || { dealt: 0, taken: 0, healed: 0, shield: 0, ults: 0 };
      const c = run.cumulative;
      c.dealt += (s.sword || 0) + (s.star || 0) + (s.runic || 0) + (s.poison || 0) + (s.fracture || 0) + (s.ult || 0) + (s.reflect || 0);
      c.taken += s.taken || 0;
      c.healed += s.healed || 0;
      c.shield += s.shield || 0;
      c.ults += s.ultCasts || 0;
    }

    function recordRun(won) {
      if (won) accumulateBattleStats();
      const s = combat.stats || {};
      const c = run.cumulative || {};
      const hero = CHARACTERS[combat.playerClass] || {};
      const act = run.gameMap ? (run.gameMap.currentAct || 1) : Math.max(1, Math.min(3, Math.ceil((run.floor || 1) / 15)));
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
        timeMs: run.elapsedMs || 0,
        loop: run.ngLoop || 0,
        act,
        cumulative: { dealt: c.dealt || 0, taken: c.taken || 0, healed: c.healed || 0, shield: c.shield || 0, ults: c.ults || 0 },
        lastBattle: { s: { ...s }, turns: combat.turn || 0 },
        elites: run.elitesSlain || 0,
        bosses: run.bossesSlain || 0,
        mysteries: run.mysteriesFlipped || 0,
        maxCombo: run.maxCombo || 0
      });
      // 🏆 Fold this run into the account-wide career records for this hero
      updateCareer({
        won: !!won,
        floor: run.floor,
        timeMs: run.elapsedMs || 0,
        dealt: (s.sword || 0) + (s.star || 0) + (s.runic || 0) + (s.poison || 0) + (s.fracture || 0) + (s.ult || 0) + (s.reflect || 0),
        ultCasts: s.ultCasts || 0,
        bestChain: run.maxCombo || 0
      });
    }

    // 🏆 Account-wide career records, keyed by hero class
    function updateCareer(entry) {
      try {
        if (!settings.career || typeof settings.career !== "object") settings.career = {};
        const e = settings.career;
        const cls = combat.playerClass || "ninja";
        const cur = e[cls] || (e[cls] = { bestFloor: 0, clears: 0, bestTimeMs: null, mostDealt: 0, mostUlts: 0, bestChain: 0 });
        cur.bestFloor = Math.max(cur.bestFloor || 0, entry.floor);
        if (entry.won) {
          cur.clears = (cur.clears || 0) + 1;
          if (!cur.bestTimeMs || entry.timeMs > 0 && entry.timeMs < cur.bestTimeMs) cur.bestTimeMs = entry.timeMs;
        }
        cur.mostDealt = Math.max(cur.mostDealt || 0, entry.dealt);
        cur.mostUlts = Math.max(cur.mostUlts || 0, entry.ultCasts);
        cur.bestChain = Math.max(cur.bestChain || 0, entry.bestChain);
        persistSettings();
        renderCareer();
      } catch (_) {}
    }

    function fmtDuration(ms) {
      if (!ms) return "—";
      const s = Math.max(1, Math.round(ms / 1000));
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
      return (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + sec + "s";
    }

    function renderCareer() {
      const el = document.getElementById("careerLine");
      if (!el) return;
      const cls = combat.playerClass || "ninja";
      const cur = settings.career && settings.career[cls];
      const heroName = (CHARACTERS[cls] || {}).name || "this hero";
      if (!cur || (!cur.bestFloor && !cur.clears)) {
        el.innerHTML = "";
        return;
      }
      const bits = [];
      if (cur.bestFloor) bits.push("best floor " + cur.bestFloor);
      if (cur.clears) bits.push(cur.clears === 1 ? "1 clear" : cur.clears + " clears");
      if (cur.bestTimeMs) bits.push("fastest clear " + fmtDuration(cur.bestTimeMs));
      el.innerHTML = `🏆 <span class="cc-label">${heroName}</span> · ${bits.join(" · ")}`;
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
          passives: run.passives || [],
          pickedModifierIds: run.pickedModifierIds || [],
          plagueDmg: run.plagueDmg || 0,
          ultChargeBonus: run.ultChargeBonus,
          bonusSwordDmg: run.bonusSwordDmg,
          bonusStarDmg: run.bonusStarDmg,
          bonusHeal: run.bonusHeal,
          floorShieldBonus: run.floorShieldBonus,
          feverEarly: run.feverEarly,
          enemyUltSlow: run.enemyUltSlow,
          pending: run.pending,
          pendingModifier: run.pendingModifier ? run.pendingModifier.id : null,
          pendingModifierRare: run.pendingModifierRare,
          pendingModifierEasy: run.pendingModifierEasy ? run.pendingModifierEasy.id : null,
          playerClass: combat.playerClass,
          shield: combat.shield,
          difficulty: settings.difficulty,
          elapsedMs: run.elapsedMs || 0,
          floorElapsedMs: run.floorElapsedMs || 0,
          cumulative: run.cumulative || { dealt: 0, taken: 0, healed: 0, shield: 0, ults: 0 },
          mysteriesFlipped: run.mysteriesFlipped || 0,
          pickLog: run.pickLog || [],
          healBlockFloors: run.healBlockFloors || 0,
          elitesSlain: run.elitesSlain || 0,
          bossesSlain: run.bossesSlain || 0,
          maxCombo: run.maxCombo || 0,
          ngLoop: run.ngLoop || 0,
          gameMap: run.gameMap || null,
          currentAct: run.currentAct || 1,
          classUpgradeOfferedActs: run.classUpgradeOfferedActs || [],
          blessings: run.blessings || {},
          shapeSkills: run.shapeSkills || { star: null, cross: null, charged: null },
          act1Unlocks: run.act1Unlocks || []
        };
        localStorage.setItem(slotKey(currentSlot()), JSON.stringify(data));
      } catch (_) {}
    }

    function loadRun() {
      try {
        const k = slotKey(currentSlot());
        let raw = localStorage.getItem(k);
        // Migration: the pre-slots single save becomes slot 0.
        if (!raw && currentSlot() === 0) {
          const legacy = localStorage.getItem(SAVE_KEY);
          if (legacy) {
            raw = legacy;
            try { localStorage.setItem(k, legacy); localStorage.removeItem(SAVE_KEY); } catch (_) {}
          }
        }
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (_) {
        return null;
      }
    }

    function clearSave() {
      try { localStorage.removeItem(slotKey(currentSlot())); } catch (_) {}
    }

    function slotHasRun(i) {
      try {
        const raw = localStorage.getItem(slotKey(i));
        if (!raw) return false;
        const d = JSON.parse(raw);
        return !!(d && d.floor >= 1 && d.floor <= MAX_FLOOR);
      } catch (_) { return false; }
    }

    function hasSave() {
      return slotHasRun(currentSlot());
    }

    function slotMeta(i) {
      try {
        let raw = localStorage.getItem(slotKey(i));
        // Migration display: a pre-slots single save still shows as slot 0.
        if (!raw && i === 0) raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const d = JSON.parse(raw);
        if (!(d && d.floor >= 1 && d.floor <= MAX_FLOOR)) return null;
        const hero = CHARACTERS[d.playerClass] || {};
        return {
          hero: d.playerClass || "ninja",
          heroName: hero.name || d.playerClass || "—",
          floor: d.floor,
          act: d.currentAct || Math.min(3, Math.ceil(d.floor / 15)),
          timeMs: d.elapsedMs || 0,
          loop: d.ngLoop || 0,
          diff: d.difficulty || settings.difficulty
        };
      } catch (_) { return null; }
    }

    function setActiveSlot(i) {
      if (i < 0 || i >= SLOT_COUNT) i = 0;
      settings.activeSlot = i;
      persistSettings();
      refreshContinueBtn();
    }

    function deleteSlotSave(i) {
      try {
        localStorage.removeItem(slotKey(i));
        buildSlotBar();
        refreshContinueBtn();
      } catch (_) {}
    }

    function refreshContinueBtn() {
      const btn = document.getElementById("btnContinue");
      const span = document.getElementById("continueFloor");
      const m = slotMeta(currentSlot());
      if (m) {
        if (btn) btn.style.display = "";
        if (span) span.textContent = String(m.floor);
      } else {
        if (btn) btn.style.display = "none";
      }
      buildSlotBar();
    }    let nextRunNg = 0; // 🌟 set by the Golden Cosmos card before resetRun()

    function buildSlotBar() {
      const wrap = document.getElementById("saveSlots");
      if (!wrap) return;
      wrap.innerHTML = "";
      const active = currentSlot();
      for (let i = 0; i < SLOT_COUNT; i++) {
        const m = slotMeta(i);
        const card = document.createElement("div");
        card.className = "save-slot" + (i === active ? " active" : "");
        if (m) {
          const portrait = `<div class="portrait ${(CHARACTERS[m.hero] || {}).role || ""}" style="width:34px;height:34px">${characterSvg(m.hero, "classic", "classic")}</div>`;
          card.innerHTML = `
            <div class="slot-head">${portrait}<div class="slot-name">${m.heroName}${m.loop > 0 ? ' · 🌟' : ''}</div><div class="slot-del" data-slot="${i}" role="button" tabindex="0" aria-label="Delete save slot ${i + 1}">🗑</div></div>
            <div class="slot-line">Floor ${m.floor} · ${ACT_NAMES[m.act] || "Act " + m.act}</div>
            <div class="slot-line">⏱ ${fmtTime(m.timeMs)}${m.diff !== "normal" ? ` · ${m.diff}` : ""}</div>
            <div class="slot-btns">
              <button type="button" class="action-btn primary" style="flex:1;padding:7px 8px;font-size:0.7rem" data-continue="${i}">Continue</button>
            </div>`;
        } else {
          card.innerHTML = `
            <div class="slot-head"><div class="slot-name">Save ${i + 1}</div></div>
            <div class="slot-line muted">Empty slot</div>
            <div class="slot-btns">
              <button type="button" class="action-btn" style="flex:1;padding:7px 8px;font-size:0.7rem" data-new="${i}">New Run here</button>
            </div>`;
        }
        wrap.appendChild(card);
        card.addEventListener("click", () => {
          if (i === active) return;
          setActiveSlot(i);
          buildSlotBar();
        });
      }
      wrap.querySelectorAll("[data-continue]").forEach(b => {
        b.addEventListener("click", e => {
          e.stopPropagation();
          setActiveSlot(+b.dataset.continue);
          continueActiveSlot();
        });
      });
      wrap.querySelectorAll("[data-new]").forEach(b => {
        b.addEventListener("click", e => {
          e.stopPropagation();
          setActiveSlot(+b.dataset.new);
          openDiffPicker();
        });
      });
      wrap.querySelectorAll(".slot-del").forEach(b => {
        const remove = () => deleteSlotSave(+b.dataset.slot);
        let armed = false;
        let timer = null;
        const arm = () => {
          armed = true;
          b.textContent = "Sure?";
          b.classList.add("armed");
          timer = setTimeout(() => {
            b.textContent = "🗑";
            b.classList.remove("armed");
            armed = false;
          }, 2400);
        };
        b.addEventListener("click", e => {
          e.stopPropagation();
          if (armed) { clearTimeout(timer); remove(); return; }
          arm();
        });
        b.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); b.click(); }
        });
      });
    }

    function continueActiveSlot() {
      const d = loadRun();
      if (!d) return;
      applyLoadedRun(d);
      saveRun(); // persists regenerated map if migration occurred
      if (run.gameMap) {
        showScreen("game");
        const map = run.gameMap;
        const cur = map.currentNode ? getNodeById(map.acts[map.currentAct - 1], map.currentNode) : null;
        const unfinished = cur && !map.visitedNodes[cur.id];
        if (unfinished) {
          // Quit out mid-battle on this node → resume it instead of parking on
          // the map, so the floor isn't skipped in the path.
          resumeCurrentNode();
        } else {
          showMap();
        }
      } else {
        startBattle({ retry: true }); // stay on saved floor
      }
      refreshContinueBtn();
    }

    function resetRun() {
      run.floor = 1;
      run.ngLoop = nextRunNg;
      nextRunNg = 0;
      run.classUpgradeOfferedActs = [];
      combat.tutorial = false;
      combat._inCascade = false;
      combat._cascadeBuffer = [];
      combat._enemyTurnLog = false;
      run.bonusMaxHp = 0;
      run.bonusShieldMax = 0;
      run.bonusApMax = 0;
      run.rewardsClaimed = {};
      run.pickedUpgrades = [];
      run.passives = [];
      run.pickedModifierIds = [];
      run.ultChargeBonus = 0;
      run.bonusSwordDmg = 0;
      run.bonusStarDmg = 0;
      run.bonusHeal = 0;
      run.lastFloorRewardOffered = [];
      run.floorShieldBonus = 0;
      run.feverEarly = 0;
      run.enemyUltSlow = 0;
      run.pickLog = [];
      run.cascadeAp = false; run.overflowBoost = false;
      run.bloomCharge = false; run.sigDouble = false; run.boardWhisper = false;
      run.phasePower = false; run.fortifiedStart = false; run.venomous = false;
      run.deepFracture = false; run.arcaneMirror = false; run.lingeringShadow = false;
      run.heavyChains = false; run.momentum = false; run.luckyDice = false;
      run.runicShield = false; run.manaSurge = false; run.mortalStrike = false; run.bulwark = false;
      run.venomousBlade = false; run.miasmaReflex = false; run.acidicBarrier = false; run.contagionCatalyst = false;
      run.corrosiveOverheal = false; run.toxicFortitude = false;
      run.fortifiedWard = false; run.rejuvenation = false; run.shuffleSurge = false; run.overclock = false;
      // Passive-tree flags (PASSIVE_TREES applies) — without these a "new run"
      // would silently inherit powers from the previous run
      run.blitz = false; run.toxicBlade = false; run.lethalPoison = false; run.plague = false;
      run.criticalEdge = false; run.assassinate = false; run.shadowEcho = false; run.shadowArmy = false;
      run.runicEdge = false; run.runicNova = false; run.infiniteMana = false; run.mysticInsight = false;
      run.celestial = false; run.manaShield = false; run.reflectiveAura = false; run.shatterPlus = false;
      run.earthquake = false; run.unbreakable = false; run.vengeance = false; run.counterStrike = false;
      run.retribution = false; run.earthshatterPlus = false; run.devastation = false;
      run.floorChargeBonus = 0;
      run.plagueDmg = 0;
      run.healBlockFloors = 0;
      run.pending = { extraPick: 0, reroll: 0, bonusAp: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, critChance: 0 };
      run.pendingModifier = null;
      run.pendingModifierRare = false;
      run.pendingModifierEasy = null;
      clearFloorModifierLook();
      run.blessings = {};
      run.shapeSkills = { star: null, cross: null, charged: null };
      run.elapsedMs = 0;
      run.floorElapsedMs = 0;
      run.gameMap = null;
      run.currentAct = 1;
      run.cumulative = { dealt: 0, taken: 0, healed: 0, shield: 0, ults: 0 };
      run.mysteriesFlipped = 0;
      run.elitesSlain = 0;
      run.bossesSlain = 0;
      run.maxCombo = 0;
      timerRunning = false;
      AP_MAX = 3;
      combat.shield = null; // next run's first battle restores the hero's starting shield
      clearSave();
    }

    function applyLoadedRun(d) {
      run.floor = clamp(d.floor | 0, 1, MAX_FLOOR);
      run.bonusMaxHp = d.bonusMaxHp | 0;
      run.bonusShieldMax = d.bonusShieldMax | 0;
      run.bonusApMax = d.bonusApMax | 0;
      run.rewardsClaimed = d.rewardsClaimed || {};
      run.pickedUpgrades = d.pickedUpgrades || [];
      run.passives = d.passives || [];
      run.pickedModifierIds = d.pickedModifierIds || [];
      run.plagueDmg = d.plagueDmg || 0;
      run.ultChargeBonus = d.ultChargeBonus | 0;
      run.bonusSwordDmg = d.bonusSwordDmg | 0;
      run.bonusStarDmg = d.bonusStarDmg | 0;
      run.bonusHeal = d.bonusHeal | 0;
      run.floorShieldBonus = d.floorShieldBonus | 0;
      run.feverEarly = d.feverEarly | 0;
      run.enemyUltSlow = d.enemyUltSlow | 0;
      run.elapsedMs = d.elapsedMs | 0;
      run.floorElapsedMs = 0; // fresh floor timing on continue
      run.cumulative = d.cumulative || { dealt: 0, taken: 0, healed: 0, shield: 0, ults: 0 };
      run.mysteriesFlipped = d.mysteriesFlipped | 0;
      run.pickLog = d.pickLog || [];
      run.healBlockFloors = d.healBlockFloors | 0;
      run.elitesSlain = d.elitesSlain | 0;
      run.bossesSlain = d.bossesSlain | 0;
      run.maxCombo = d.maxCombo | 0;
      run.ngLoop = d.ngLoop | 0;
      // Re-derive transformative upgrades from the picked list (not stored as flags)
      run.cascadeAp = (run.pickedUpgrades || []).includes("cascadeAp");
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
      run.fortifiedWard = (run.pickedUpgrades || []).includes("fortifiedWard");
      run.rejuvenation = (run.pickedUpgrades || []).includes("rejuvenation");
      run.shuffleSurge = (run.pickedUpgrades || []).includes("shuffleSurge");
      run.overclock = (run.pickedUpgrades || []).includes("overclock");
      // Re-derive passive tree flags from the passive list.
      // Stat-granting passives are skipped: their bonuses are already baked
      // into the saved bonus* numbers, so re-applying would stack them again.
      const PASSIVE_STAT_ONLY = ["shd1", "bld1", "arc1", "aeg1", "frt1", "frt2", "vlr1"];
      (run.passives || []).forEach(pid => {
        if (typeof PASSIVE_TREES !== "undefined") {
          const p = PASSIVE_TREES.find(x => x.id === pid);
          if (p && p.apply && !PASSIVE_STAT_ONLY.includes(pid)) p.apply();
        }
      });
      run.pending = Object.assign(
        { extraPick: 0, reroll: 0, bonusAp: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, critChance: 0 },
        d.pending || {}
      );
      AP_MAX = 3 + run.bonusApMax;
      run.pendingModifier = d.pendingModifier ? FLOOR_MODIFIERS.find(m => m.id === d.pendingModifier) || null : null;
      run.pendingModifierRare = !!d.pendingModifierRare;
      run.pendingModifierEasy = d.pendingModifierEasy ? FLOOR_MODIFIERS.find(m => m.id === d.pendingModifierEasy) || null : null;
      if (d.playerClass && HERO_STATS[d.playerClass]) combat.playerClass = d.playerClass;
      if (d.difficulty) settings.difficulty = d.difficulty;
      // Shield is persisted with the save; old saves without it get a fresh starting shield.
      combat.shield = (typeof d.shield === "number") ? Math.max(0, d.shield) : null;
      run.gameMap = d.gameMap || null;
      run.currentAct = d.currentAct || 1;
      run.classUpgradeOfferedActs = d.classUpgradeOfferedActs || [];
      run.blessings = d.blessings || {};
      run.shapeSkills = d.shapeSkills || { star: null, cross: null, charged: null };
      run.act1Unlocks = Array.isArray(d.act1Unlocks) ? d.act1Unlocks.slice() : [];
      // Map layout changed (45-floor campaign): regenerate incompatible maps.
      // Player restarts the current act with all upgrades/passives intact.
      if (run.gameMap && !isMapCompatible(run.gameMap)) {
        const savedAct = Math.min(3, Math.max(1, d.currentAct || Math.ceil((d.floor || 1) / 15)));
        const fresh = generateFullMap();
        fresh.currentAct = savedAct;
        run.gameMap = fresh;
        run.currentAct = savedAct;
      }
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
        if (run.healBlockFloors > 0) run.healBlockFloors -= 1; // 🥀 wilt fades each floor
        // Tutorial ends after floor 1
        if (combat.tutorial) combat.tutorial = false;
      }
      // defeat retry keeps same floor; fresh start from the menu resets via resetRun

      // Capture one-shot "next floor" effects BEFORE they're consumed below, so
      // the floor banner can warn the player instead of them feeling like a bug.
      _bannerWarnings = [];
      const _pend = run.pending || {};
      const _apStart = 3 + run.bonusApMax + (_pend.bonusAp || 0);
      if (_pend.bonusAp < 0) _bannerWarnings.push(`⚠️ −${-Math.floor(_pend.bonusAp)} AP: you start turns at ${_apStart} AP`);
      if (_pend.shield > 0) _bannerWarnings.push(`🛡️ +${_pend.shield} starting shield`);
      if (run.pendingStatusTiles) {
        const _tileLabel = { poison: "poisoned", burn: "on fire", stun: "stunning", frost: "frozen" }[run.pendingStatusTiles.type] || "cursed";
        _bannerWarnings.push(`⚠️ ${run.pendingStatusTiles.count || "5"} tiles are ${_tileLabel} this floor`);
      }

      const hero = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
      const maxHp = hero.hp + run.bonusMaxHp;
      const wardBonus = (run.fortifiedWard) ? 4 : 0;
      const maxSh = hero.maxShieldCap + run.bonusShieldMax + wardBonus;
      AP_MAX = 3 + run.bonusApMax;

      gameOver = false;
      gameOverOverlay.classList.remove("open");
      defeatPending = false;
      resetGameOverPanel();
      combat.boundTiles = new Set();
      combat.squallBloom = 0;
      combat.disorientedTurns = 0;
      combat.enemyBurnTurns = 0;
      combat.enemyBurnDmg = 0;
      combat.enemyStunTurns = 0;
      combat.enemyFrostTurns = 0;
      combat.playerMaxHp = maxHp;
      // Partial heal between battles: restore ~45% of missing HP (not full)
      const prevHp = combat.playerHp || maxHp;
      const missing = Math.max(0, maxHp - prevHp);
      let betweenHeal = Math.floor(missing * 0.45);
      // 💚 Rejuvenation run upgrade: gentler climb between floors
      if (run.rejuvenation) betweenHeal = Math.floor(missing * 0.55);
      if ((run.healBlockFloors || 0) > 0) betweenHeal = Math.floor(betweenHeal * 0.5); // 🥀 Wilted halves it
      combat.playerHp = Math.min(maxHp, prevHp + betweenHeal);
      // Shield carries over from the previous battle (it no longer refills each floor).
      // A brand-new run (resetRun marks shield as null) starts with the hero's starting shield.
      const shieldBase = (combat.shield === null || combat.shield === undefined) ? hero.startShield : Math.max(0, combat.shield || 0);
      // 🧙 Wizard class identity: rebuilds a chunk of his shield every floor (capped)
      const wizardRecover = (combat.playerClass === "wizard") ? Math.min(6, Math.max(0, maxSh - shieldBase)) : 0;
      const shieldBonus = wizardRecover + (run.floorShieldBonus || 0) + ((run.pending && run.pending.shield) || 0) + (run.fortifiedStart ? 4 + Math.floor(Math.random() * 3) : 0) + (run.unbreakable ? 10 : 0) + wardBonus;
      combat.shield = Math.min(maxSh, shieldBase + shieldBonus);
      if (run.pending) run.pending.shield = 0; // one-shot "start next battle" bonus is consumed here
      combat.enemyShield = 0;
      combat.sigBank = (run.floorChargeBonus || 0);
      combat.ap = AP_MAX + ((run.pending && run.pending.bonusAp) || 0);
      combat.enemyAp = Math.min(AP_MAX, 3); // rival caps at base AP
      combat.tempSwordDmg = (run.pending && run.pending.swordBoost) || 0;
      combat.critChance = (run.pending && run.pending.critChance) || 0;
      combat.cascadeApRefunded = false;
      // 🏆 career-best floor record
      if (run.floor > (settings.bestFloor || 0)) {
        settings.bestFloor = run.floor;
        persistSettings();
      }
      combat.pendingSurge = 0;
      combat.surgeActive = 0;
      combat.overCharge = 0;
      combat.reflectPct = Math.min(0.7, (hero.reflectPct || 0) + 0.02 * (run.floor - 1) + (run.arcaneMirror ? 0.1 : 0));
      combat.turn = 1;
      combat.playerTurn = true;
      combat.tutorial = !!opts.tutorial;
      combat.empowerNext = false;
      combat.blindNext = false;
      combat.weakenNextSword = false;
      combat.poisonTurns = 0;
      // Assign (not Math.max) — a leftover poison from the previous battle
      // must never leak into the fresh rival
      combat.enemyPoisonTurns = (run.pending && run.pending.enemyPoison) || 0;
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
      combat.deathDefianceUsed = false; // 💀 purchased revive refreshes each battle
      combat.enemyVeilUsed = false;
      combat.enemyAfterglowTurns = 0;
      combat.playerFractureStacks = 0;
      combat.playerFractureTurns = 0;
      combat.playerMortalWoundTurns = 0;
      combat.logHistory = [];
      combat._inCascade = false;
      combat._cascadeBuffer = [];
      combat._enemyTurnLog = false;
      combat.stats = { sword: 0, star: 0, runic: 0, poison: 0, fracture: 0, ult: 0, reflect: 0, taken: 0, healed: 0, shield: 0, ultCasts: 0 };
      combat.ultAnnounced = false;
      combat.enemyUltCharge = 0;
      combat.bossKit = BOSS_KITS[run.floor] || null;
      combat.eliteKit = ELITE_KITS[run.floor] || null;
      // Boss / elite fights get their own BGM theme
      const bgmMode = combat.bossKit ? "boss" : combat.eliteKit ? "elite" : "field";
      bgmPlay(Math.min(3, Math.ceil(run.floor / 15)), bgmMode);
      combat.enemyClass = pickEnemyVisual(run.floor);
      combat.commonPassive = (!combat.bossKit && !combat.eliteKit) ? getCommonPassive(combat.enemyClass) : null;
      // Codex: reveal encountered creature
      if (typeof codexReveal === "function") {
        if (combat.bossKit) codexReveal("creatures", combat.bossKit.id);
        else if (combat.eliteKit) codexReveal("creatures", combat.eliteKit.id);
        else if (combat.enemyClass) codexReveal("creatures", combat.enemyClass);
      }
      combat.enemyUltNeed = combat.bossKit ? combat.bossKit.ultTurns + (run.enemyUltSlow || 0) : 4 + (run.enemyUltSlow || 0);
      combat.enemyUltNeed += (run.pending && run.pending.enemySlow) || 0;
      combat.enemyUltNeed += run.heavyChains ? 1 : 0;
      combat.enemyArchetype = (combat.bossKit || combat.eliteKit) ? null : pickEnemyArchetype(run.floor);
      combat.enemySpecialCharge = 0;
      combat.enemySpecialNeed = 4 + Math.floor(Math.random() * 2) + ((run.pending && run.pending.enemySlow) || 0) + (run.heavyChains ? 1 : 0); // 4 or 5
      // Pending next-floor rewards are consumed when the floor begins
      run.pending = { extraPick: 0, reroll: 0, bonusAp: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, critChance: 0 };
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
      combat.volatileFloor = false;
      combat.enemyRegen = 0;
      combat.quickening = false;
      combat.quickeningTicks = 0;
      combat.pendingChargedFirst = false;
      combat.enemyAtkBonus = 0;
      combat.extraFreeShuffles = 0;
      if (run.boardWhisper) combat.extraFreeShuffles += 1;
      combat.tileBloomPerTurn = false;
      combat.tempShieldCapBonus = 0;
      // Per-turn / conditional modifier flags
      combat.playerHealPerTurn = 0;
      combat.shieldPerTurn = 0;
      combat.empowerEachTurn = false;
      combat.thornAura = 0;
      combat.wilt = false;
      combat.eclipse = false;
      combat.twinStorm = false;
      if (combat.floorModifier) {
        combat.floorModifier.apply(combat);
        if (typeof codexReveal === "function") codexReveal("modifiers", combat.floorModifier.id);
        if (combat.enemySpeedMult && combat.enemySpeedMult !== 1) {
          combat.enemyUltNeed = Math.max(1, Math.round(combat.enemyUltNeed * combat.enemySpeedMult));
          combat.enemySpecialNeed = Math.max(1, Math.round(combat.enemySpecialNeed * combat.enemySpeedMult));
        }
        if (combat.shieldCapOverride) {
          combat.shield = Math.min(combat.shield, combat.shieldCapOverride);
        }
      }
      // Make the battle background react to the floor modifier (sky tint, aura, ambience)
      applyFloorModifierLook();
      // Apply easy bonus modifier (challenge bonus from last fight)
      if (run.pendingModifierEasy) {
        run.pendingModifierEasy.apply(combat);
        run.pendingModifierEasy = null;
      }
      run.pendingModifierRare = false;
      busy = false;

      // Single enemy setup (boss / elite / normal)
      const arch = combat.enemyArchetype;
      const elite = combat.eliteKit;
      let unitHp = enemyHpForFloor(run.floor);
      if (settings.difficulty === "easy") unitHp = 1;
      if (elite) unitHp = Math.round(unitHp * (elite.hpMul || 1.5));
      else if (arch) unitHp = Math.round(unitHp * (arch.hpMul || 1));

      if (combat.bossKit) {
        combat.enemyFullName = combat.bossKit.name;
        combat.enemyName = displayEnemyName(combat.bossKit.name);
      } else if (elite) {
        combat.enemyFullName = elite.name;
        combat.enemyName = displayEnemyName(elite.name);
      } else {
        const nm = randomEnemyName(combat.enemyClass);
        combat.enemyFullName = nm;
        combat.enemyName = nm;
      }
      combat.enemyMaxHp = unitHp;
      combat.enemyHp = unitHp;
      combat.enemyShield = arch && arch.startShield ? arch.startShield : 0;
      // Plague passive: carryover damage from previous enemy's poisoned death
      if (run.plagueDmg && run.plagueDmg > 0) {
        combat.enemyHp = Math.max(1, combat.enemyHp - run.plagueDmg);
        run.plagueDmg = 0;
      }

      if (opts.tutorial) {
        // Tutorial: weak passive dummy
        combat.bossKit = null;
        combat.eliteKit = null;
        combat.commonPassive = null;
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
      // Show act name next to floor number
      const floorActEl = document.getElementById("floorActName");
      if (floorActEl && run.gameMap) {
        const actIdx = run.gameMap.currentAct || 1;
        floorActEl.textContent = ACT_NAMES[actIdx] || "";
      }

      clearComboTheater(true);
      build();
      if (run.pendingStatusTiles) {
        sprinkleStatusTiles(run.pendingStatusTiles.type, run.pendingStatusTiles.count);
        run.pendingStatusTiles = null;
      }
      setupFighters();
      document.getElementById("enemyName").textContent = combat.enemyName;
      refreshCombatUI();
      // Codex: reveal common combat statuses after first battle
      if (typeof codexReveal === "function" && run.floor <= 2) {
        ["poison", "burn", "stun", "frost", "corrupted", "disoriented", "afterglow", "empower", "blind", "weaken", "mark", "fracture", "mortal", "manalock"].forEach(s => codexReveal("statuses", s));
      }
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
      refreshUltTips();
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
      finalizeDefeat();
      gameOverOverlay.classList.remove("open");
      gameOver = false;
      busy = false;
      // Keep save if mid-campaign victory already wrote next floor; only clear on abandon from menu intent
      // User chose Menu — keep existing save so Continue works
      showScreen("menu");
      buildCharPick();
      refreshContinueBtn();
    });
    const btnRunStatsEl = document.getElementById("btnRunStats");
    if (btnRunStatsEl) {
      btnRunStatsEl.addEventListener("click", () => openRunStats());
    }
    const btnRunStatsClose = document.getElementById("btnRunStatsClose");
    if (btnRunStatsClose) {
      btnRunStatsClose.addEventListener("click", () => {
        document.getElementById("runStatsOverlay").classList.remove("open");
      });
    }
    const runStatsOverlayEl = document.getElementById("runStatsOverlay");
    if (runStatsOverlayEl) {
      runStatsOverlayEl.addEventListener("click", e => {
        if (e.target === runStatsOverlayEl) runStatsOverlayEl.classList.remove("open");
      });
    }
    document.getElementById("btnGoRetry").addEventListener("click", () => {
      if (combat.enemyHp <= 0 && run.floor < MAX_FLOOR) {
        gameOverOverlay.classList.remove("open");
        // Map system: after victory, show map (or advance act if boss)
        if (run.gameMap) {
          const map = run.gameMap;
          const node = getNodeById(map.acts[map.currentAct - 1], map.currentNode);
          if (node && node.type === "boss") {
            // Void Merchant: Boss double drop
            if (run.bossDoubleDrop) {
              run.bossDoubleDrop = false;
              openUpgradePicker(label => {
                openUpgradePicker(label2 => {
                  openPassivePicker(passiveLabel => {
                    showVictoryOverlay({ label, permanent: true, passiveLabel, upgradeLabel: label2 });
                  });
                });
              });
              return;
            }
            advanceActOrVictory();
          } else {
            // Void Merchant: Skip next elite
            if (run.skipNextElite) {
              run.skipNextElite = false;
              const actMap = map.acts[map.currentAct - 1];
              const eliteNode = actMap.layers.flat().find(n => n.type === "elite" && !map.visitedNodes[n.id]);
              if (eliteNode) {
                eliteNode.type = "normal";
                // Visual feedback
                const el = document.getElementById(eliteNode.id);
                if (el) {
                  el.textContent = "⚔️";
                  el.title = "Elite skipped — Void Merchant's Key";
                  el.style.opacity = "0.6";
                }
              }
            }
            showMap();
          }
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
        finalizeDefeat();
        startBattle({ retry: true });
      }
    });
    // Restores the overlay to its normal (victory/defeat) layout — used when a
    // fresh battle or a new death screen is shown, so no payment step lingers.
    function resetGameOverPanel() {
      const pay = document.getElementById("revivePay");
      if (pay) pay.hidden = true;
      const rv = document.getElementById("btnGoRevive");
      if (rv) rv.hidden = true;
      const hide = ["recapCard", "btnCopyRecap", "bloomPayoff"];
      hide.forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; });
      const show = ["victorySummary", "victoryStats", "gameOverMsg", "gameOverSubtitle", "btnRunStats", "btnGoRetry", "btnGoMenu", "rewardMsg"];
      show.forEach(id => { const el = document.getElementById(id); if (el) el.hidden = false; });
      const t = document.getElementById("gameOverTitle");
      if (t) t.textContent = "Victory";
    }
    // Death-screen → live payment step: swap the defeat buttons for the pay-card
    function showRevivePayment() {
      const pay = document.getElementById("revivePay");
      if (pay) pay.hidden = false;
      ["victorySummary", "victoryStats", "gameOverMsg", "gameOverSubtitle", "btnRunStats", "btnGoRetry", "btnGoMenu", "btnGoRevive", "rewardMsg"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      const t = document.getElementById("gameOverTitle");
      if (t) t.textContent = "💀 Pay ₱3 to keep climbing";
    }
    function backToDeathScreen() {
      const pay = document.getElementById("revivePay");
      if (pay) pay.hidden = true;
      ["victorySummary", "victoryStats", "gameOverMsg", "gameOverSubtitle", "btnRunStats", "btnGoRetry", "btnGoMenu", "btnGoRevive", "rewardMsg"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = false;
      });
      const t = document.getElementById("gameOverTitle");
      if (t) t.textContent = "Defeat";
    }
    // The actual revive: honor-system confirm resumes the very same battle at half HP
    async function doRevive() {
      const rv = document.getElementById("btnGoRevive");
      if (rv) rv.hidden = true;
      defeatPending = false;
      gameOverOverlay.classList.remove("open");
      gameOver = false;
      combat.playerHp = Math.max(1, Math.ceil(combat.playerMaxHp / 2));
      document.body.classList.remove("your-turn");
      if (typeof resumeRunTimer === "function") resumeRunTimer();
      if (typeof refreshCombatUI === "function") refreshCombatUI();
      if (typeof beginPlayerTurn === "function") {
        await beginPlayerTurn();
      } else {
        busy = false;
      }
    }
    const btnGoReviveEl = document.getElementById("btnGoRevive");
    if (btnGoReviveEl) {
      btnGoReviveEl.addEventListener("click", () => {
        if (!defeatPending) return;
        showRevivePayment();
      });
    }
    const btnReviveConfirm = document.getElementById("btnReviveConfirm");
    if (btnReviveConfirm) {
      btnReviveConfirm.addEventListener("click", async () => {
        if (!defeatPending) return;
        await doRevive();
      });
    }
    const btnReviveBack = document.getElementById("btnReviveBack");
    if (btnReviveBack) btnReviveBack.addEventListener("click", () => {
      if (!defeatPending) return;
      backToDeathScreen();
    });

    const CHAR_PROFILES = {
      ninja: {
        tag: "The Swift Shadow",
        blurb: "Fast, sharp and elusive — dodges strikes, saps enemies with venom, and finishes the wounded. Fragile, so she ends fights quickly.",
        sigIcon: "⚔️", sig: "Sword",
        ult: "Assassinate",
        ultDesc: "Spend 3 HP to strike true damage and leave an Afterglow aura (take 50% less). Doubles against enemies below 30% HP.",
        base: "85 HP · 15 shield · auto-dodge first hit"
      },
      wizard: {
        tag: "The Arcane Storm",
        blurb: "Wraps herself in shields that double as weapons — reflecting damage, dealing Runic hits, and chaining mana into storms.",
        sigIcon: "🛡️", sig: "Shield",
        ult: "Moonstorm",
        ultDesc: "Consume all shields into true damage, chain free hits from linked tiles, keep a barrier, and steal enemy shield.",
        base: "100 HP · 20 shield · 40% damage reflect"
      },
      knight: {
        tag: "The Unyielding Bastion",
        blurb: "A wall that heals, cracks and counters — hearts sustain him, and every hit he takes only makes his return swing heavier.",
        sigIcon: "❤️", sig: "Heart",
        ult: "Earthshatter",
        ultDesc: "Consume hearts into true damage, heal per heart, detonate all Cracked stacks, and wound the rival (−25% damage).",
        base: "120 HP · 15 shield · Iron Will death-save"
      }
    };

    function renderCharProfile(cls) {
      const el = document.getElementById("charInfoBody");
      if (!el || typeof HERO_STATS === "undefined" || typeof characterSvg !== "function") return;
      cls = (cls && CHAR_PROFILES[cls]) ? cls : (combat.playerClass || "ninja");
      const p = CHAR_PROFILES[cls] || CHAR_PROFILES.ninja;
      const h = HERO_STATS[cls] || HERO_STATS.ninja;
      const costKey = (settings.costume && COSTUMES[cls] && COSTUMES[cls][settings.costume[cls]]) ? settings.costume[cls] : "classic";
      const wpnKeys = Object.keys(WEAPONS[cls] || {});
      const wpnKey = (settings.weapon && settings.weapon[cls] && WEAPONS[cls][settings.weapon[cls]]) ? settings.weapon[cls] : (wpnKeys[0] || "classic");
      el.style.setProperty("--cp", `var(--${cls})`);
      el.innerHTML =
        `<div class="cp-head"><div class="portrait ${cls}">${characterSvg(cls, costKey, wpnKey)}</div>` +
        `<div><div class="cp-name">${h.name}</div><div class="cp-tag">${p.tag}</div></div></div>` +
        `<div class="cp-blurb">${p.blurb}</div>` +
        `<div class="cp-rows">` +
        `<div class="cp-row"><span class="cp-chip">${p.sigIcon}</span> Signature — ${p.sig}</div>` +
        `<div class="cp-row"><span class="cp-chip">🔥</span> Ultimate: ${p.ult}</div>` +
        `<div class="cp-row" style="padding-left:30px">${p.ultDesc}</div>` +
        `<div class="cp-row"><span class="cp-chip">❤️</span> ${p.base}</div>` +
        `</div>`;
    }

    function openCharInfo(cls) {
      renderCharProfile(cls);
      const ov = document.getElementById("charInfoOverlay");
      if (ov) ov.classList.add("open");
    }
    function closeCharInfo() {
      const ov = document.getElementById("charInfoOverlay");
      if (ov) ov.classList.remove("open");
    }

    function buildCharPick() {
      charPick.innerHTML = "";
      ["ninja", "wizard", "knight"].forEach(key => {
        const c = CHARACTERS[key];
        const costKey = (settings.costume && COSTUMES[key][settings.costume[key]]) ? settings.costume[key] : "classic";
        const wpnKeys = Object.keys(WEAPONS[key]);
        const wpnKey = (settings.weapon && WEAPONS[key][settings.weapon[key]]) ? settings.weapon[key] : wpnKeys[0];
        const card = document.createElement("div");
        card.className = "char-card" + (combat.playerClass === key ? " selected" : "");
        card.innerHTML = `<button type="button" class="char-info-btn" aria-label="${c.name} info" title="View ${c.name} info">i</button><div class="portrait ${c.role}">${characterSvg(key, costKey, wpnKey)}</div><div class="fighter-name">${c.name}</div>`;
        card.addEventListener("click", () => {
          combat.playerClass = key;
          buildCharPick();
        });
        const infoBtn = card.querySelector(".char-info-btn");
        if (infoBtn) infoBtn.addEventListener("click", e => {
          e.stopPropagation();
          openCharInfo(key);
        });
        charPick.appendChild(card);
      });
      buildCosmeticBar();
      renderRunHistory();
      renderCareer();
      refreshContinueBtn();
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
        openRunStats(last);
      });
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
      const floorInput = document.getElementById("admFloor");
      if (floorInput) floorInput.value = String(run.floor || 1);
      if (impactEl) impactEl.value = settings.impactTurn || 11;
      document.getElementById("muteToggle").classList.toggle("on", settings.muted);
      const mtEl = document.getElementById("musicToggle");
      if (mtEl) mtEl.classList.toggle("on", settings.musicEnabled !== false);
      const musicVolSlider = document.getElementById("musicVolSlider");
      const musicVolLabel = document.getElementById("musicVolLabel");
      if (musicVolSlider) {
        musicVolSlider.value = Math.round((settings.musicVolume || 0.5) * 100);
        if (musicVolLabel) musicVolLabel.textContent = String(musicVolSlider.value);
      }
      const ltEl = document.getElementById("liteToggle");
      if (ltEl) ltEl.classList.toggle("on", settings.liteMode === true);
      const tipsToggleEl = document.getElementById("tipsToggle");
      if (tipsToggleEl) tipsToggleEl.classList.toggle("on", settings.ultTips !== false);
      const accentPickerEl2 = document.getElementById("accentColorPicker");
      if (accentPickerEl2) accentPickerEl2.value = settings.accentColor || "#4f7a33";
      const accentPicker2B = document.getElementById("accentColorPicker2");
      if (accentPicker2B) accentPicker2B.value = settings.accentColor2 || "#efd48a";
      [["fxDamageToggle", "fxDamage"], ["fxComboToggle", "fxCombo"], ["fxShakeToggle", "fxShake"]].forEach(([id, key]) => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle("on", settings[key] !== false);
      });
      [["skinSeg", "skin"], ["pipSeg", "pipStyle"], ["stampSeg", "stampTheme"]].forEach(pair => {
        const wrap = document.getElementById(pair[0]);
        if (!wrap) return;
        wrap.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.val === settings[pair[1]]));
      });
      const volSlider = document.getElementById("volSlider");
      const volLabel = document.getElementById("volLabel");
      if (volSlider) {
        volSlider.value = Math.round(settings.volume * 100);
        if (volLabel) volLabel.textContent = String(volSlider.value);
      }
      document.getElementById("tabGame").style.display = "";
      document.getElementById("tabCustom").style.display = "none";
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
    document.getElementById("btnGameSettings").addEventListener("click", (e) => {
      e.stopPropagation();
      openSettings();
    });
    // Tiny tip line: click it to read the next tip
    const ultTipEl = document.getElementById("ultTip");
    if (ultTipEl) {
      ultTipEl.addEventListener("click", () => refreshUltTips());
      ultTipEl.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          refreshUltTips();
        }
      });
    }
    // Auto-advance the tip every 10s while a battle is showing
    const ultTipTimer = setInterval(() => {
      if (screenGame.classList.contains("active")) refreshUltTips();
    }, 10000);
    if (ultTipTimer && ultTipTimer.unref) ultTipTimer.unref();
    const btnShapeDone = document.getElementById("btnShapeSkillDone");
    if (btnShapeDone) btnShapeDone.addEventListener("click", closeShapeSkillPicker);
    const btnCharInfoClose = document.getElementById("btnCharInfoClose");
    if (btnCharInfoClose) btnCharInfoClose.addEventListener("click", closeCharInfo);
    // In-battle portrait "i" badges open the same info as the menu / long-press
    const playerPortraitInfoBtn = document.getElementById("playerPortraitInfoBtn");
    if (playerPortraitInfoBtn) playerPortraitInfoBtn.addEventListener("click", () => openInfo("player"));
    const enemyPortraitInfoBtn = document.getElementById("enemyPortraitInfoBtn");
    if (enemyPortraitInfoBtn) enemyPortraitInfoBtn.addEventListener("click", () => openInfo("enemy"));
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
    const btnCodex = document.getElementById("btnCodex");
    if (btnCodex) btnCodex.addEventListener("click", () => { if (typeof codexOpen === "function") codexOpen(); });

    // ----- Support: buy Death Defiance revives / donate via GCash -----
    const GCASH_REVIVE_PRICE = 3; // ₱ per revive
    let _supportQty = 1;
    function updateDefianceBadge() {
      const el = document.getElementById("menuDefiance");
      if (!el) return;
      const n = settings.deathDefiance || 0;
      el.textContent = n > 0 ? `💀 Death Defiance: ${n} run${n === 1 ? "" : "s"} ready` : "💀 Death Defiance: none — earn one via 💛 Support";
    }
    function refreshSupportOverlay() {
      const count = settings.deathDefiance || 0;
      const cnt = document.getElementById("supportCount");
      if (cnt) cnt.textContent = count > 0 ? `You have ${count} Death Defiance${count === 1 ? "" : "s"}` : `You have no Death Defiance yet`;
      const msg = document.getElementById("supportMsg");
      if (msg) msg.textContent = `Each revive is ₱${GCASH_REVIVE_PRICE}. Send via GCash, then tap below.`;
    }
    function openSupport() {
      refreshSupportOverlay();
      const buy = document.getElementById("supportBuy"), don = document.getElementById("supportDonate");
      const dn = document.getElementById("btnSupportDonate");
      if (buy) buy.style.display = "";
      if (don) don.style.display = "none";
      if (dn) dn.style.display = "";
      const hint = document.getElementById("supportHint");
      if (hint) {
        hint.style.display = "";
        hint.style.color = "#9c8b74";
        hint.textContent = "Send the amount via GCash, then tap the button above. Revives are credited instantly.";
      }
      const ov = document.getElementById("supportOverlay");
      if (ov) ov.classList.add("open");
    }
    function closeSupport() {
      const ov = document.getElementById("supportOverlay");
      if (ov) ov.classList.remove("open");
    }
    function setSupportQty(n) {
      _supportQty = n;
      [["supportQty1", 1], ["supportQty3", 3], ["supportQty5", 5]].forEach(([id, v]) => {
        const b = document.getElementById(id);
        if (b) b.classList.toggle("on", v === n);
      });
      const msg = document.getElementById("supportMsg");
      if (msg) msg.textContent = n === 1
        ? `Each revive is ₱${GCASH_REVIVE_PRICE}. Send via GCash, then tap below.`
        : `That's ${n} revives for ₱${n * GCASH_REVIVE_PRICE}. Send via GCash, then tap below.`;
    }
    const btnSupport = document.getElementById("btnSupport");
    if (btnSupport) btnSupport.addEventListener("click", openSupport);
    const btnSupportClose = document.getElementById("btnSupportClose");
    if (btnSupportClose) btnSupportClose.addEventListener("click", closeSupport);
    [["supportQty1", 1], ["supportQty3", 3], ["supportQty5", 5]].forEach(([id, n]) => {
      const b = document.getElementById(id);
      if (b) b.addEventListener("click", () => setSupportQty(n));
    });
    const btnSupportClaim = document.getElementById("btnSupportClaim");
    if (btnSupportClaim) btnSupportClaim.addEventListener("click", () => {
      settings.deathDefiance = (settings.deathDefiance || 0) + _supportQty;
      persistSettings();
      if (typeof srSay === "function") srSay(`${_supportQty} Death Defiance added.`);
      playHeal();
      updateDefianceBadge();
      refreshSupportOverlay();
      const hint = document.getElementById("supportHint");
      if (hint) {
        hint.style.display = "block";
        hint.textContent = `✅ Done! ${_supportQty} Death Defiance${_supportQty === 1 ? "" : "s"} added. Enjoy — thanks for supporting!`;
        hint.style.color = "#4f7a33";
      }
    });
    const btnSupportDonate = document.getElementById("btnSupportDonate");
    if (btnSupportDonate) btnSupportDonate.addEventListener("click", () => {
      const buy = document.getElementById("supportBuy"), don = document.getElementById("supportDonate");
      const dn = document.getElementById("btnSupportDonate");
      if (buy) buy.style.display = "none";
      if (don) don.style.display = "";
      if (dn) dn.style.display = "none";
    });
    const btnSupportDonateDone = document.getElementById("btnSupportDonateDone");
    if (btnSupportDonateDone) btnSupportDonateDone.addEventListener("click", closeSupport);
    updateDefianceBadge();
    const btnSettingsHelp = document.getElementById("btnSettingsHelp");
    if (btnSettingsHelp) btnSettingsHelp.addEventListener("click", openHelp);
    const btnHelpClose = document.getElementById("btnHelpClose");
    if (btnHelpClose) btnHelpClose.addEventListener("click", closeHelp);
    // Guide tabs — same pattern as the settings tabs
    const HELP_TAB_PANELS = { basics: "helpTabBasics", battle: "helpTabBattle", map: "helpTabMap", heroes: "helpTabHeroes" };
    document.querySelectorAll("#helpTabs button").forEach(b => {
      b.addEventListener("click", () => {
        document.querySelectorAll("#helpTabs button").forEach(x => x.classList.toggle("on", x === b));
        Object.entries(HELP_TAB_PANELS).forEach(([tab, id]) => {
          const el = document.getElementById(id);
          if (el) el.style.display = tab === b.dataset.tab ? "" : "none";
        });
      });
    });
    if (helpOverlay) helpOverlay.addEventListener("click", (e) => {
      if (e.target === helpOverlay) closeHelp();
    });

    document.getElementById("muteToggle").addEventListener("click", function () {
      settings.muted = !settings.muted;
      this.classList.toggle("on", settings.muted);
      persistSettings();
      bgmUpdateVolume();
    });

    document.getElementById("musicToggle").addEventListener("click", function () {
      settings.musicEnabled = settings.musicEnabled !== false ? false : true;
      this.classList.toggle("on", settings.musicEnabled);
      if (settings.musicEnabled) {
        const act = (run && run.currentAct) || 1;
        const bgmMode = combat && combat.bossKit ? "boss" : combat && combat.eliteKit ? "elite" : "field";
        bgmPlay(act, bgmMode);
      } else {
        bgmStop();
      }
      persistSettings();
    });

    // Lite mode toggle — applies body.lite-mode class which pauses all ambient CSS
    function applyLiteMode() {
      document.body.classList.toggle("lite-mode", settings.liteMode === true);
    }
    applyLiteMode();
    const liteToggleEl = document.getElementById("liteToggle");
    if (liteToggleEl) {
      // Show current state on open
      function syncLiteToggle() {
        const isOn = settings.liteMode === true;
        liteToggleEl.classList.toggle("on", isOn);
      }
      syncLiteToggle();
      liteToggleEl.addEventListener("click", () => {
        settings.liteMode = settings.liteMode === true ? false : true;
        persistSettings();
        syncLiteToggle();
        applyLiteMode();
      });
    }
    const tipsToggleEl = document.getElementById("tipsToggle");
    if (tipsToggleEl) {
      tipsToggleEl.addEventListener("click", () => {
        settings.ultTips = settings.ultTips === false ? true : false;
        persistSettings();
        tipsToggleEl.classList.toggle("on", settings.ultTips !== false);
        refreshUltTips();
      });
    }
    const accentPickerEl = document.getElementById("accentColorPicker");
    if (accentPickerEl) {
      accentPickerEl.addEventListener("input", () => {
        const c = accentPickerEl.value;
        if (!/^#[0-9a-fA-F]{6}$/.test(c)) return;
        settings.accentColor = c;
        persistSettings();
        applyAccent();
      });
    }
    const accentPicker2El = document.getElementById("accentColorPicker2");
    if (accentPicker2El) {
      accentPicker2El.addEventListener("input", () => {
        const c = accentPicker2El.value;
        if (!/^#[0-9a-fA-F]{6}$/.test(c)) return;
        settings.accentColor2 = c;
        persistSettings();
        applyAccent();
      });
    }
    const btnAccentReset = document.getElementById("btnAccentReset");
    if (btnAccentReset) {
      btnAccentReset.addEventListener("click", () => {
        settings.accentColor = "#4f7a33";
        settings.accentColor2 = "#efd48a";
        persistSettings();
        applyAccent();
        const p1 = document.getElementById("accentColorPicker");
        const p2 = document.getElementById("accentColorPicker2");
        if (p1) p1.value = settings.accentColor;
        if (p2) p2.value = settings.accentColor2;
      });
    }
    [["fxDamageToggle", "fxDamage"], ["fxComboToggle", "fxCombo"], ["fxShakeToggle", "fxShake"]].forEach((pair) => {
      const el = document.getElementById(pair[0]);
      if (!el) return;
      el.addEventListener("click", () => {
        settings[pair[1]] = !settings[pair[1]];
        persistSettings();
        el.classList.toggle("on", settings[pair[1]]);
      });
    });
    const speedToggleEl = document.getElementById("speedToggle");
    if (speedToggleEl) {
      // Show current state on open
      function syncSpeedToggle() {
        const isFast = (settings.animSpeed || 1) > 1;
        speedToggleEl.classList.toggle("on", isFast);
      }
      syncSpeedToggle();
      speedToggleEl.addEventListener("click", () => {
        settings.animSpeed = (settings.animSpeed || 1) > 1 ? 1 : 1.6;
        persistSettings();
        syncSpeedToggle();
      });
    }
    [["skinSeg", "skin", applySkin], ["pipSeg", "pipStyle", applyPips], ["stampSeg", "stampTheme", applyStamp]].forEach(pair => {
      const wrap = document.getElementById(pair[0]);
      if (!wrap) return;
      wrap.querySelectorAll("button").forEach(b => {
        b.addEventListener("click", () => {
          settings[pair[1]] = b.dataset.val;
          persistSettings();
          wrap.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
          pair[2]();
        });
      });
    });
    const volSliderEl = document.getElementById("volSlider");
    if (volSliderEl) {
      volSliderEl.addEventListener("input", () => {
        settings.volume = clamp((+volSliderEl.value || 0) / 100, 0, 1);
        const lab = document.getElementById("volLabel");
        if (lab) lab.textContent = String(volSliderEl.value);
        persistSettings();
      });
    }
    const musicVolSliderEl = document.getElementById("musicVolSlider");
    if (musicVolSliderEl) {
      musicVolSliderEl.addEventListener("input", () => {
        settings.musicVolume = clamp((+musicVolSliderEl.value || 0) / 100, 0, 1);
        const lab = document.getElementById("musicVolLabel");
        if (lab) lab.textContent = String(musicVolSliderEl.value);
        bgmUpdateVolume();
        persistSettings();
      });
    }
    document.querySelectorAll("#settingsTabs button").forEach(b => {
      b.addEventListener("click", () => {
        const tab = b.dataset.tab;
        document.querySelectorAll("#settingsTabs button").forEach(x => x.classList.toggle("on", x === b));
        document.getElementById("tabGame").style.display = tab === "game" ? "" : "none";
        document.getElementById("tabAdmin").style.display = tab === "admin" ? "" : "none";
        const tc = document.getElementById("tabCustom");
        if (tc) tc.style.display = tab === "custom" ? "" : "none";
      });
    });

    // Debug floor jump — testing tool: land on any floor with a fresh battle
    const btnFloorJump = document.getElementById("btnFloorJump");
    if (btnFloorJump) {
      btnFloorJump.addEventListener("click", () => {
        const input = document.getElementById("admFloor");
        const n = clamp(Math.floor(+input.value || 0), 1, MAX_FLOOR);
        if (!n) return;
        // No live run? Load the save into memory first (stays saved either way)
        let loadedHere = false;
        if (!screenGame.classList.contains("active")) {
          const d = loadRun();
          if (!d) { alert("No active run to jump — start one first."); return; }
          applyLoadedRun(d);
          loadedHere = true;
        }
        // Clear stale cross-floor perks so the jump starts clean
        run.pending = { extraPick: 0, reroll: 0, bonusAp: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, critChance: 0 };
        run.pendingModifier = null;
        run.pendingModifierRare = false;
        run.pendingModifierEasy = null;
        run.floor = n;
        const act = Math.min(3, Math.ceil(n / 15));
        run.currentAct = act;
        if (run.gameMap) run.gameMap.currentAct = act;
        updateTowerBand();
        if (loadedHere) {
          saveRun();
          refreshContinueBtn();
          closeSettings();
        } else {
          closeSettings();
          startBattle(); // fresh battle on the chosen floor
        }
      });
    }

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
          nextRunNg = 0; // plain run — never inherit a pending Golden Cosmos loop
          ov.classList.remove("open");
          resetRun();
          startNewRunMap();
          refreshContinueBtn();
        });
        wrap.appendChild(btn);
      });
      // 🌟 Golden Cosmos NG+ — unlocked after the first final victory
      if (settings.clearedOnce) {
        const loop = (settings.ngLoopsDone || 0) + 1;
        const btn = document.createElement("button");
        btn.type = "button";
        const arch = detectArchetype("Golden Cosmos", "The tower blooms gold.", "🌟");
        btn.className = "upgrade-card glow-" + arch.cls;
        btn.style.borderColor = "#d8a832";
        const top = document.createElement("div");
        top.className = "up-card-top";
        const tag = document.createElement("span");
        tag.className = "up-card-archetype " + arch.cls;
        tag.textContent = "NG+";
        const badge = document.createElement("span");
        badge.className = "reward-dur permanent";
        badge.textContent = `LOOP ${loop}`;
        top.append(tag, badge);
        const title = document.createElement("div");
        title.className = "up-card-title";
        title.textContent = "🌟 Golden Cosmos";
        const calloutBox = document.createElement("div");
        calloutBox.className = "up-card-callout";
        calloutBox.textContent = "THE TOWER'S GOLDEN WHIM";
        const descEl = document.createElement("div");
        descEl.className = "up-card-desc";
        descEl.textContent = `Loop ${loop}: rivals are stronger (+${25 * loop}% HP, +${2 * loop} atk), and the Cosmos decrees every floor's modifier itself. The whole tower glows gold.`;
        btn.append(top, title, calloutBox, descEl);
        btn.addEventListener("click", () => {
          nextRunNg = loop;
          ov.classList.remove("open");
          resetRun();
          startNewRunMap();
          refreshContinueBtn();
        });
        wrap.appendChild(btn);
      }
      ov.classList.add("open");
    }

    document.getElementById("btnStart").addEventListener("click", () => {
      openDiffPicker();
    });

    // 🌟 NG+ unlock badge on the menu once the tower has bloomed
    if (settings.clearedOnce) {
      const sub = document.querySelector(".menu-sub");
      if (sub) sub.textContent += " · 🌟 Golden Cosmos unlocked";
    }

    document.getElementById("btnDiffCancel").addEventListener("click", () => {
      document.getElementById("diffPickerOverlay").classList.remove("open");
    });
    document.getElementById("diffPickerOverlay").addEventListener("click", e => {
      if (e.target.id === "diffPickerOverlay") e.target.classList.remove("open");
    });

    document.getElementById("btnContinue").addEventListener("click", () => {
      continueActiveSlot();
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
      let passive = "", ult = "";
      if (cls === "ninja") {
        passive = "Shadow Step: First hit dodged, then 20% dodge. Clear 4+ Sword tiles in one turn → prompt: −3 HP for +1 extra swap (once per turn).";
        ult = "Assassinate: Spends ALL ⚔️ on board — 5 + 6 dmg per ⚔️, true. ×2 if enemy <30% HP. Costs −3 HP, grants Afterglow.";
      } else if (cls === "wizard") {
        passive = "Arcane Reflection: 40%+ of damage taken reflected as true dmg (scales with floor). Shield matches deal Runic damage if the Runic tree is picked.";
        ult = "Moonstorm: Spends ALL 🛡️ on board — 5 + 5 dmg per 🛡️, true. Each spent shield chains to a damage tile (⚔️/⭐) and fires its damage at the enemy as FREE separate damage. Leaves a Moonstorm Barrier (up to 12 Shield) and steals up to 3 enemy Shield.";
      } else {
        passive = "Regen +3 HP each turn. Iron Will: survive a lethal hit once per battle at 1 HP, gain +5 Cracked. Cracked stacks deal true dmg at enemy turn start — or cash them in early with a Bloom match (Shatter: stacks×3).";
        ult = "Earthshatter: Spends ALL ❤️ on board — 5 + 5 dmg per ❤️, true, heal 3 HP per ❤️ + Shatter all Cracked (stacks×4 bonus) + Bleed 2t.";
      }
      // Collapsible tap-to-read rows — keeps long descriptions compact.
      const expandable = (label, full) => {
        const preview = full.length > 44 ? full.slice(0, 44).trim() + "…" : full;
        return `
          <div class="expand-row" tabindex="0" role="button">
            <div class="info-section" style="margin:10px 0 2px">${label}</div>
            <div class="expand-preview">${preview}</div>
            <div class="expand-body" hidden><div class="info-body">${full}</div></div>
          </div>`;
      };
      return `
        ${expandable("Passive", passive)}
        ${expandable("Ultimate", ult)}
        ${shapeSkillsSection()}
        ${tileBlessingsSection()}
        <div class="info-section">Active statuses</div>
        <div class="info-body">${statusSummaryPlayer()}</div>
        ${runUpgradeSection()}
        ${combat.floorModifier ? `<div class="info-section">Floor Modifier</div><div class="info-body">${combat.floorModifier.icon} ${combat.floorModifier.name} — ${combat.floorModifier.desc}</div>` : ""}
      `;
    }

    function runUpgradeSection() {
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const picked = run.pickedUpgrades || [];
      const passives = run.passives || [];
      const firstEmoji = s => { const m = String(s).match(/^\s*(\p{Extended_Pictographic})/u); return m ? m[1] : "⭐"; };

      // Compact "skill slot" tile: number badge + icon, description via tap/hover.
      const tile = (num, ico, name, desc, variant) => `
        <div class="skill-tile ${variant}" tabindex="0" role="button"
             data-name="${esc(name)}" data-desc="${esc(desc)}"
             title="${esc(name)} — ${esc(desc)}">
          <span class="skill-num">${num}</span>
          <span class="skill-ico">${ico}</span>
        </div>`;

      const upgradeTiles = picked.map((id, i) => {
        const u = RUN_UPGRADES.find(z => z.id === id);
        if (!u) return "";
        return tile(i + 1, firstEmoji(u.name), u.name, u.desc, "upg");
      }).join("");

      const passiveTiles = passives.map((id, i) => {
        const p = typeof PASSIVE_TREES !== "undefined" ? PASSIVE_TREES.find(x => x.id === id) : null;
        if (!p) return "";
        return tile(i + 1, p.icon || "✨", p.name, p.desc || "", "psv");
      }).join("");

      const group = (label, tiles) => tiles
        ? `<div class="skill-group"><div class="info-section">${label}</div><div class="info-grid">${tiles}</div><div class="skill-cap" hidden>Tap a slot to read it</div></div>`
        : "";
      return group("Permanent Upgrades", upgradeTiles) + group("Passives", passiveTiles);
    }

    // Shape Skills passport section — the freely-assigned Star/Cross/Charged
    // kit (from any class), icon-only tiles, tap to read.
    function shapeSkillsSection() {
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const sk = run.shapeSkills || {};
      const meta = { star: { icon: "⭐", label: "Star" }, cross: { icon: "✚", label: "Cross" }, charged: { icon: "⚡", label: "Charged" } };
      const made = [];
      ["star", "cross", "charged"].forEach((shape, i) => {
        const id = sk[shape];
        let found = null;
        if (typeof SHAPE_SKILLS !== "undefined" && SHAPE_SKILLS[shape] && id) found = SHAPE_SKILLS[shape].find(o => o.id === id) || null;
        const icon = found ? found.icon : (meta[shape].icon);
        const name = found ? found.name : "Empty slot";
        const desc = found ? found.desc : "Not assigned — matches make extra shapes but nothing special";
        made.push(`
          <div class="skill-tile psv ${found ? "filled" : "empty"}" tabindex="0" role="button"
               data-name="${esc(name)}" data-desc="${esc(desc)}"
               title="${esc(name)} — ${esc(desc)}">
            <span class="skill-num">${i + 1}</span>
            <span class="skill-ico">${icon}</span>
          </div>`);
      });
      const allFilled = ["star", "cross", "charged"].every(s => sk[s]);
      const hint = allFilled
        ? "Tap a slot to read it"
        : (["star", "cross", "charged"].some(s => sk[s]) ? "Amber dashed = empty slot · assign mid-fight via ✦" : "All slots empty — assign skills mid-fight via the ✦ button");
      return `<div class="skill-group"><div class="info-section">Shape Skills</div><div class="info-grid">${made.join("")}</div><div class="skill-cap">${hint}</div></div>`;
    }

    // Tile Blessings passport section — the three chosen enhanced-tile styles
    // (Bloom → Cross → X), icon-only tiles, tap to read.
    function tileBlessingsSection() {
      const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
      const bs = run.blessings || {};
      const order = ["bloom", "cross", "x"];
      const made = [];
      order.forEach((special, i) => {
        const id = bs[special];
        const found = (typeof TILE_BLESSINGS !== "undefined" && TILE_BLESSINGS[special] && id)
          ? TILE_BLESSINGS[special].find(o => o.id === id) : null;
        const icon = found ? found.icon : (special === "bloom" ? "🌸" : special === "cross" ? "✚" : "✖");
        const name = found ? found.name : "Empty slot";
        const desc = found ? found.desc : "Not claimed — clear this tile's floor to earn the pick";
        made.push(`
          <div class="skill-tile psv ${found ? "filled" : "empty"}" tabindex="0" role="button"
               data-name="${esc(name)}" data-desc="${esc(desc)}"
               title="${esc(name)} — ${esc(desc)}">
            <span class="skill-num">${i + 1}</span>
            <span class="skill-ico">${icon}</span>
          </div>`);
      });
      const allFilled = order.every(s => bs[s]);
      const hint = allFilled
        ? "Tap a slot to read it"
        : (order.some(s => bs[s]) ? "Amber dashed = empty slot · earn picks on floors 3, 6, 9" : "All slots empty — earn picks on floors 3, 6, 9");
      return `<div class="skill-group"><div class="info-section">Tile Blessings</div><div class="info-grid">${made.join("")}</div><div class="skill-cap">${hint}</div></div>`;
    }

    function statusSummaryPlayer() {
      const parts = [];
      if (combat.afterglowTurns > 0) parts.push(`Afterglow ${combat.afterglowTurns}t`);
      if (combat.poisonTurns > 0) parts.push(`Poison ${combat.poisonTurns}t`);
      if (combat.playerFractureStacks > 0) parts.push(`Cracked ${combat.playerFractureStacks} (${combat.playerFractureTurns}t)`);
      if (combat.playerMortalWoundTurns > 0) parts.push(`Bleed ${combat.playerMortalWoundTurns}t`);
      if (combat.empowerNext) parts.push("Empower");
      if (combat.blindNext) parts.push("Blind");
      if (combat.weakenNextSword) parts.push("Weaken");
      if ((run.healBlockFloors || 0) > 0) parts.push(`🥀 Wilted ${run.healBlockFloors}f`);
      if (combat.shield > 0) parts.push(`Shield ${combat.shield}`);
      return parts.length ? parts.join(" · ") : "None";
    }

    function statusSummaryEnemy() {
      const parts = [];
      if (combat.markStacks > 0) parts.push(`Mark ${combat.markStacks}`);
      if (combat.fractureStacks > 0) parts.push(`Cracked ${combat.fractureStacks} (${combat.fractureTurns}t)`);
      if (combat.mortalWoundTurns > 0) parts.push(`Bleed ${combat.mortalWoundTurns}t`);
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

  // ---- COMMON MONSTER PASSIVE ----
  if (combat.commonPassive) {
    const cp = combat.commonPassive;
    passiveDetails += `
      <div class="info-section">🐾 Innate Ability</div>
      <div class="info-body"><strong>${cp.name}</strong> — ${cp.desc}</div>
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

  // ---- SIGNATURE TILE (all enemies) ----
  let sigDetails = "";
  if (typeof getEnemySignature === "function") {
    const sig = getEnemySignature();
    if (sig && sig.primary) {
      const icons = { sword: "⚔️", star: "⭐", shield: "🛡️", hp: "❤️", question: "❓" };
      const bonusText = {
        sword: "+40% damage from those tiles",
        star: "+40% damage from those tiles",
        shield: "+1 shield per 2 matched",
        hp: "+1 heal per tile matched"
      }[sig.primary] || "bonus effect";
      const adaptNote = combat.bossKit ? "<br>• Adapts its signature as the fight changes" : "";
      sigDetails = `
        <div class="info-section">🎯 Signature Tile</div>
        <div class="info-body">
          <strong>${icons[sig.primary] || "❓"} ${sig.primary.charAt(0).toUpperCase() + sig.primary.slice(1)}</strong> — ${sig.label || "Signature"}<br>
          • ${bonusText}${adaptNote}<br>
          • Marked with <span style="color:#e05a44">red dots</span> on the board — match them first to deny!
        </div>
      `;
    }
  }

  // ---- BUILD FINAL HTML ----
  return `
    <div class="info-row"><span>Floor</span><span>${run.floor}</span></div>
    <div class="info-row"><span>Attack</span><span>~${atkNow} damage</span></div>
    ${sigDetails}
    ${passiveDetails}
    ${specialDetails}
    ${ultDetails}
    ${scalingInfo}
  `;
}

    const passportOverlay = document.getElementById("passportOverlay");

    // Left "identity page" of the passport spread
    function passportIdentityHtml(who) {
      if (who === "player") {
        const s = HERO_STATS[combat.playerClass] || HERO_STATS.ninja;
        const sig = SIGNATURE[combat.playerClass];
        const sigLabel = { sword: "⚔️ Sword", shield: "🛡️ Shield", hp: "❤️ Potion" }[sig] || sig;
        const actIdx = run.gameMap ? (run.gameMap.currentAct || 1) : 1;
        const swordDmg = settings.swordDmg + (run.bonusSwordDmg || 0) + (combat.tempSwordDmg || 0);
        const starDmg = settings.starDmg + (run.bonusStarDmg || 0);
        const healAmt = settings.healAmt + (run.bonusHeal || 0);
        const markMult = combat.markStacks > 0 ? ` (+${Math.round(combat.markStacks * 15)}%)` : "";
        const critCh = combat.critChance || 0;
        const poisonInfo = combat.poisonTurns > 0 ? `${combat.poisonTurns}t` : combat.poisonStacks > 0 ? `${combat.poisonStacks} stacks` : "none";
        const maxSh = s.maxShieldCap + run.bonusShieldMax + (run.fortifiedWard ? 4 : 0);
        return `
          <div class="pp-photo"><div class="portrait ${combat.playerClass}" id="ppPhotoSlot"></div></div>
          <div class="pp-id-name">${s.name}</div>
          <div class="info-row"><span>Class</span><span>${s.name}</span></div>
          <div class="info-row"><span>Location</span><span>${ACT_NAMES[actIdx] || `Act ${actIdx}`}</span></div>
          <div class="info-row"><span>Floor</span><span>${run.floor}/${MAX_FLOOR}</span></div>
          <div class="info-row"><span>HP</span><span>${combat.playerHp}/${combat.playerMaxHp}</span></div>
          <div class="info-row"><span>Shield</span><span>${combat.shield}/${maxSh}</span></div>
          <div class="info-row"><span>Sword</span><span>⚔️ ${swordDmg}${markMult}</span></div>
          <div class="info-row"><span>Star</span><span>⭐ ${starDmg}</span></div>
          <div class="info-row"><span>Heal</span><span>💚 ${healAmt}</span></div>
          <div class="info-row"><span>Crit</span><span>🎯 ${critCh}%</span></div>
          <div class="info-row"><span>Poison</span><span>☠️ ${poisonInfo}</span></div>
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
        if (passportOverlay.classList) passportOverlay.classList.toggle("accent-player", who === "player");
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
      infoOverlay.classList.toggle("accent-player", who === "player");
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
    document.addEventListener("click", e => {
      const row = e.target.closest(".expand-row");
      if (row) {
        const open = row.classList.toggle("on");
        const body = row.querySelector(".expand-body");
        if (body) body.hidden = !open;
        return;
      }
      const tile = e.target.closest(".skill-tile");
      if (!tile) return;
      const group = tile.closest(".skill-group");
      if (!group) return;
      const cap = group.querySelector(".skill-cap");
      if (!cap) return;
      const isOpen = cap.dataset.open === tile.dataset.name;
      cap.dataset.open = isOpen ? "" : tile.dataset.name;
      cap.hidden = false;
      cap.innerHTML = isOpen
        ? `<span style="opacity:.7">Tap a slot to read it</span>`
        : `<b>${tile.dataset.name}</b> — ${tile.dataset.desc}`;
      group.querySelectorAll(".skill-tile").forEach(x => x.classList.toggle("on", x === tile && !isOpen));
    });
    const btnPassportClose = document.getElementById("btnPassportClose");
    if (btnPassportClose) btnPassportClose.addEventListener("click", () => passportOverlay.classList.remove("open"));
    if (passportOverlay) passportOverlay.addEventListener("click", e => {
      if (e.target === passportOverlay) passportOverlay.classList.remove("open");
    });

    const pickerInfoBtn = document.getElementById("pickerInfoBtn");
    if (pickerInfoBtn) pickerInfoBtn.addEventListener("click", () => openInfo("player"));

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
      // Act name
      if (run.gameMap) {
        const actIdx = run.gameMap.currentAct || 1;
        parts.push(`<div class="info-section">${ACT_NAMES[actIdx] || `Act ${actIdx}`}</div>`);
      }
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
        parts.push(`<div class="info-section">Sun Surge</div>`);
        parts.push(`<div class="info-body">☀️ Signature tiles hit harder. Push for big clears!</div>`);
      } else if (phase === "impact") {
        parts.push(`<div class="info-section">Full Bloom</div>`);
        parts.push(`<div class="info-body">🌸 The tower blooms — 🎲 mystery tiles always give a blessing!</div>`);
      }
      // Progress
      parts.push(`<div class="info-section">Progress</div>`);
      if (run.gameMap) {
        const act = run.gameMap.currentAct || 1;
        parts.push(`<div class="info-body">${ACT_NAMES[act] || ""} · Floor ${((act - 1) * 15) + 1}–${act * 15}. ${isBossFloor(run.floor) ? "Boss floor!" : isEliteFloor(run.floor) ? "Elite challenge ahead." : ""}</div>`);
      } else {
        parts.push(`<div class="info-body">Floor ${run.floor} of ${MAX_FLOOR}. ${isBossFloor(run.floor) ? "Boss floor!" : isEliteFloor(run.floor) ? "Elite challenge ahead." : `${MAX_FLOOR - run.floor} floors remaining.`}</div>`);
      }
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

    // Visible press pulse for action buttons that need unmistakable feedback
    function pressFx(btn) {
      if (!btn) return;
      btn.classList.remove("press-pulse");
      void btn.offsetWidth; // restart animation
      btn.classList.add("press-pulse");
      clearTimeout(btn._pressFxTimer);
      btn._pressFxTimer = setTimeout(() => btn.classList.remove("press-pulse"), 220);
    }

    // ---------- start ----------
    buildCharPick();
    refreshContinueBtn();
    showScreen("menu");
