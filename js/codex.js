// ─── Bloom Tower Codex ───
// Tracks enemies, modifiers, upgrades, passives, and statuses.
// Entries are revealed as you encounter them. Progress persists in localStorage.

(function () {
  "use strict";

  const STORAGE_KEY = "bloomCodexRevealed";

  // ─── Codex entries by category ───
  const CODEX = {
    creatures: [
      { id: "slime", icon: "💧", name: "Dewdrop", tier: "common", passive: "Water Shield", desc: "When hit, gains 1 shield. A gelatinous orb that hardens when threatened." },
      { id: "bat", icon: "🦋", name: "Moth", tier: "common", passive: "Flutter", desc: "25% chance to dodge your match. Quick and evasive, it flits between tiles." },
      { id: "mush", icon: "🍄", name: "Fungling", tier: "common", passive: "Spore", desc: "Attacks apply 1 poison. A tiny fungal scout that releases toxic spores." },
      { id: "golem", icon: "🪨", name: "Mudwarden", tier: "common", passive: "Thick Skin", desc: "Takes 1 less damage from all sources. Dense and durable, it shrugs off blows." },
      { id: "skull", icon: "💀", name: "Husk", tier: "common", passive: "Desiccated", desc: "Attacks strip 2 shield first. A withered shell that drains defenses." },
      { id: "thorn", icon: "🌿", name: "Bramble", tier: "common", passive: "Thorns", desc: "Reflects 1 damage when hit. A tangle of thorns that bites back." },
      { id: "wisp", icon: "✨", name: "Petalwisp", tier: "common", passive: "Drift", desc: "At turn start, shifts one random tile. A playful spirit that rearranges the board." },
      { id: "root", icon: "🌱", name: "Rootling", tier: "common", passive: "Sprout", desc: "Heals 1 HP each turn. A tiny root that regenerates relentlessly." },
      { id: "bloodroot", icon: "🩸", name: "Bloodroot", tier: "elite", passive: "Lifesteal", desc: "Heals 4 HP on every hit. A predatory plant that feeds on combat." },
      { id: "stormglass", icon: "⛈️", name: "Stormglass", tier: "elite", passive: "Chain Shock", desc: "Every hit chains 35% extra damage. A crystalline entity crackling with electricity." },
      { id: "thorncoil", icon: "🐍", name: "Thorncoil", tier: "elite", passive: "Poison + Weaken", desc: "Attacks apply Poison (2t) and Weaken. A coiled serpent of thorns and venom." },
      { id: "bracken", icon: "🌳", name: "Bracken the Rootbound", tier: "boss", passive: "Root Snare", desc: "Ultimate: Blind + heavy hit + Disoriented (controls reversed 2t) + Corrupts 3 tiles. Warden of the Sprout, bound to ancient roots." },
      { id: "cinder", icon: "🌨️", name: "Squall Queen", tier: "boss", passive: "Bloom Counter", desc: "Each hit adds a Bloom stack (+4% DR, cap 8). At 5+ stacks she heals 2 HP/turn. Ultimate: Ashstorm — Poison + burst + Corrupts 2 tiles." },
      { id: "lastrival", icon: "⚔️", name: "The Last Rival", tier: "boss", passive: "Regen + Fracture", desc: "Regenerates 3 HP/turn. Every hit applies Fracture (2 true dmg/stack). Ultimate: Earthshatter — Massive hit + Mortal Wound + Root Bind + Corrupts 2 tiles." }
    ],

    modifiers: [
      { id: "swordMastery", icon: "⚔️", name: "Sword Mastery", tier: "easy", desc: "Sword damage +2 this floor." },
      { id: "starBurst", icon: "⭐", name: "Star Burst", tier: "easy", desc: "Star damage +2 this floor." },
      { id: "ironSkin", icon: "🛡️", name: "Iron Skin", tier: "easy", desc: "+5 max HP this floor." },
      { id: "firstStrike", icon: "💥", name: "First Strike", tier: "easy", desc: "First match of the floor is charged (4+)." },
      { id: "signatureSurge", icon: "🔥", name: "Signature Surge", tier: "easy", desc: "Start floor with +4 ult charge." },
      { id: "freeShuffles", icon: "🔀", name: "Lucky Shuffle", tier: "easy", desc: "+2 free shuffles this floor." },
      { id: "tileBloom", icon: "🌸", name: "Tile Bloom", tier: "easy", desc: "Start each turn with a random special tile." },
      { id: "shieldBoon", icon: "🏰", name: "Fortify", tier: "easy", desc: "+5 max shield this floor." },
      { id: "gentleRain", icon: "☔", name: "Gentle Rain", tier: "easy", desc: "Heal 2 HP at the start of each of your turns." },
      { id: "deepRoots", icon: "🌱", name: "Deep Roots", tier: "easy", desc: "Gain +2 Shield at the start of each of your turns." },
      { id: "pollenPuff", icon: "🌼", name: "Pollen Puff", tier: "easy", desc: "Your first match each turn deals +50% damage." },
      { id: "thornAura", icon: "🌵", name: "Thorn Aura", tier: "easy", desc: "When hit, deal 2 true damage back." },
      { id: "wilt", icon: "🥀", name: "Wilt", tier: "hard", desc: "Your healing is halved this floor." },
      { id: "eclipse", icon: "🌑", name: "Eclipse", tier: "hard", desc: "Mystery tiles are always debuffs this floor." },
      { id: "twinStorm", icon: "🌪️", name: "Twin Storm", tier: "hard", desc: "Rival gains +1 AP every 3rd turn." },
      { id: "mirrorMatch", icon: "🦴", name: "Mirror Match", tier: "hard", desc: "Enemy starts with Fracture 3 — plan your Shatter." },
      { id: "toxicMist", icon: "☠️", name: "Toxic Mist", tier: "hard", desc: "Both fighters start poisoned 3 turns." },
      { id: "volatileFloor", icon: "🌋", name: "Scorched Soil", tier: "hard", desc: "Every match deals 1 damage to you." },
      { id: "bloodPrice", icon: "🩸", name: "Blood Price", tier: "hard", desc: "Enemy heals 3 HP per turn." },
      { id: "quickening", icon: "⚡", name: "Quickening", tier: "hard", desc: "Enemy gains +1 ATK every 2 turns." }
    ],

    upgrades: [
      { id: "hp10", icon: "❤️", name: "+10 Max HP", desc: "Permanently boost your health." },
      { id: "shield5", icon: "🛡️", name: "+5 Max Shield", desc: "Higher shield ceiling." },
      { id: "ultCharge", icon: "🔥", name: "Faster Ult", desc: "Signature charge +1 per signature match." },
      { id: "swordDmg", icon: "⚔️", name: "+1 Sword Damage", desc: "Permanently stronger swords." },
      { id: "healAmt", icon: "💚", name: "+2 Heal Amount", desc: "Potions heal more." },
      { id: "floorShield", icon: "🛡️", name: "+1 Shield at Floor Start", desc: "Begin each floor shielded." },
      { id: "feverEarly", icon: "☀️", name: "Surge 1 Turn Earlier", desc: "Sun Surge arrives sooner." },
      { id: "enemyUltSlow", icon: "⛓️", name: "Enemy Ult +1 Turn", desc: "Rival ultimates charge slower." },
      { id: "crossAp", icon: "✚", name: "Seal Mastery", desc: "T/+ and L seals refund 1 additional AP." },
      { id: "overflowBoost", icon: "💚", name: "Overflow Surge", desc: "Overflow heal/shield damage +50%." },
      { id: "bloomCharge", icon: "🌸", name: "Bloom Signature", desc: "Detonating a Bloom gives +1 Sig charge." },
      { id: "sigDouble", icon: "⭐", name: "Signature Echo", desc: "Your signature tile also counts as a small star." },
      { id: "boardWhisper", icon: "🔄", name: "Board Whisper", desc: "1 free Shuffle each floor." },
      { id: "phasePower", icon: "🌠", name: "Phase Attunement", desc: "Signature effects stronger in Fever; Mystery +1 charge in Impact." },
      { id: "startShield", icon: "🛡️", name: "Fortified Start", desc: "Begin every floor with +4-6 extra Shield." },
      { id: "poisonMaster", icon: "☠️", name: "Venomous", desc: "Sword matches can poison the enemy (30%).", classReq: "ninja" },
      { id: "reflectBoost", icon: "🪞", name: "Arcane Mirror", desc: "Wizard reflection +10% (scales with floor).", classReq: "wizard" },
      { id: "enemySlow2", icon: "⛓️", name: "Heavy Chains", desc: "Enemy specials/ults +1 additional turn." },
      { id: "apCarry", icon: "⚡", name: "Momentum", desc: "Unused AP carries over up to +2 next turn." },
      { id: "mysteryBias", icon: "🎲", name: "Lucky Dice", desc: "Mystery tiles are 70% buffs before Full Bloom." },
      { id: "mortalStrike", icon: "⚔️", name: "Mortal Strike", desc: "Knight: Ultimate also reduces enemy damage by 25% for 2 turns.", classReq: "knight" },
      { id: "bulwark", icon: "🛡️", name: "Bulwark", desc: "Knight: Shield matches apply 1 Fracture stack (once per turn).", classReq: "knight" },
      { id: "venomousBlade", icon: "🗡️", name: "Venomous Blade", desc: "Ninja: Matches of 4+ Swords or cascades apply +2 Poison.", classReq: "ninja" },
      { id: "miasmaReflex", icon: "💨", name: "Miasma Reflex", desc: "Ninja: Dodging triggers 100% of Poison stacks as immediate damage.", classReq: "ninja" },
      { id: "acidicBarrier", icon: "🧪", name: "Acidic Barrier", desc: "Wizard: Every 10 damage absorbed by Shield applies +1 Poison.", classReq: "wizard" },
      { id: "contagionCatalyst", icon: "☣️", name: "Contagion Catalyst", desc: "Wizard: Clearing a Mystery tile while Shielded doubles enemy Poison.", classReq: "wizard" },
      { id: "corrosiveOverheal", icon: "🩸", name: "Corrosive Overheal", desc: "Knight: Excess healing converts to Acid stacks (1 per 5 HP).", classReq: "knight" },
      { id: "toxicFortitude", icon: "🏰", name: "Toxic Fortitude", desc: "Knight: Start of turn, gain Shield = 2x total (Poison + Acid) on rival.", classReq: "knight" }
    ],

    passives: [
      // Ninja
      { id: "shd1", icon: "🗡️", name: "Swift Strikes", classReq: "ninja", tier: 1, desc: "+1 max AP per turn." },
      { id: "shd2", icon: "🗡️", name: "Cascade Master", classReq: "ninja", tier: 2, desc: "Every cascade after the first refunds 1 AP." },
      { id: "shd3", icon: "🗡️", name: "Blitz", classReq: "ninja", tier: 3, desc: "First match each turn costs 0 AP." },
      { id: "vnw1", icon: "☠️", name: "Toxic Blade", classReq: "ninja", tier: 1, desc: "Sword matches poison enemy for 2 turns." },
      { id: "vnw2", icon: "☠️", name: "Lethal Poison", classReq: "ninja", tier: 2, desc: "Poison damage +1 per stack, duration +1." },
      { id: "vnw3", icon: "☠️", name: "Plague", classReq: "ninja", tier: 3, desc: "Poisoned enemy death deals 10 splash to next enemy." },
      { id: "bld1", icon: "🔪", name: "Sharp Edge", classReq: "ninja", tier: 1, desc: "Sword damage +3." },
      { id: "bld2", icon: "🔪", name: "Critical Edge", classReq: "ninja", tier: 2, desc: "25% chance sword matches deal x2." },
      { id: "bld3", icon: "🔪", name: "Assassinate", classReq: "ninja", tier: 3, desc: "Enemies below 30% HP take x2 sword damage." },
      { id: "aft1", icon: "🌑", name: "Lingering Shadow", classReq: "ninja", tier: 1, desc: "Afterglow lasts 2 turns." },
      { id: "aft2", icon: "🌑", name: "Shadow Echo", classReq: "ninja", tier: 2, desc: "Afterglow deals 3 true damage per turn." },
      { id: "aft3", icon: "🌑", name: "Shadow Army", classReq: "ninja", tier: 3, desc: "Afterglow: 3 turns, 5 dmg/turn." },
      // Wizard
      { id: "rnc1", icon: "🔮", name: "Runic Edge", classReq: "wizard", tier: 1, desc: "Shield matches deal +4 damage." },
      { id: "rnc2", icon: "🔮", name: "Runic Burst", classReq: "wizard", tier: 2, desc: "Shield matches deal x2 damage." },
      { id: "rnc3", icon: "🔮", name: "Thornburst", classReq: "wizard", tier: 3, desc: "Shield matches also deal 5 splash." },
      { id: "mna1", icon: "💎", name: "Arcane Pool", classReq: "wizard", tier: 1, desc: "Start each floor +3 ult charge." },
      { id: "mna2", icon: "💎", name: "Mana Surge", classReq: "wizard", tier: 2, desc: "Full charge — sig matches refund 1 AP." },
      { id: "mna3", icon: "💎", name: "Infinite Mana", classReq: "wizard", tier: 3, desc: "4+ matches grant 1 AP." },
      { id: "arc1", icon: "⭐", name: "Star Power", classReq: "wizard", tier: 1, desc: "Star matches deal +3 damage." },
      { id: "arc2", icon: "⭐", name: "Mystic Insight", classReq: "wizard", tier: 2, desc: "Mystery tiles are 100% buffs." },
      { id: "arc3", icon: "⭐", name: "Sun-Kissed", classReq: "wizard", tier: 3, desc: "Star matches also heal 3 + shield 1." },
      { id: "aeg1", icon: "🛡️", name: "Arcane Barrier", classReq: "wizard", tier: 1, desc: "+8 max shield." },
      { id: "aeg2", icon: "🛡️", name: "Mana Shield", classReq: "wizard", tier: 2, desc: "Shield absorbs 60% of damage." },
      { id: "aeg3", icon: "🛡️", name: "Reflective Aura", classReq: "wizard", tier: 3, desc: "When hit, reflect 2 damage." },
      // Knight
      { id: "frc1", icon: "💥", name: "Deep Fracture", classReq: "knight", tier: 1, desc: "Fracture +1 true dmg/stack." },
      { id: "frc2", icon: "💥", name: "Shatter+", classReq: "knight", tier: 2, desc: "Shatter deals x1.5 damage." },
      { id: "frc3", icon: "💥", name: "Earthquake", classReq: "knight", tier: 3, desc: "Shatter stuns enemy 1 turn." },
      { id: "frt1", icon: "🏰", name: "Iron Will", classReq: "knight", tier: 1, desc: "+15 max HP." },
      { id: "frt2", icon: "🏰", name: "Fortified", classReq: "knight", tier: 2, desc: "+8 max shield." },
      { id: "frt3", icon: "🏰", name: "Unbreakable", classReq: "knight", tier: 3, desc: "Start each floor with 10 shield." },
      { id: "ret1", icon: "⚔️", name: "Vengeance", classReq: "knight", tier: 1, desc: "Take 2 less damage." },
      { id: "ret2", icon: "⚔️", name: "Counter Strike", classReq: "knight", tier: 2, desc: "After taking damage, deal 3 true." },
      { id: "ret3", icon: "⚔️", name: "Retribution", classReq: "knight", tier: 3, desc: "Counter = missing HP (max 15)." },
      { id: "vlr1", icon: "🔥", name: "Battle Cry", classReq: "knight", tier: 1, desc: "Ult charge +2." },
      { id: "vlr2", icon: "🔥", name: "Earthshatter+", classReq: "knight", tier: 2, desc: "Ult deals +15 true damage." },
      { id: "vlr3", icon: "🔥", name: "Devastation", classReq: "knight", tier: 3, desc: "Ult consumes all shield for damage." }
    ],

    statuses: [
      { id: "poison", icon: "☠️", name: "Poison", desc: "3 true damage at the start of the affected side's turn. Counts down each player turn." },
      { id: "burn", icon: "🔥", name: "Burn", desc: "Enemy takes fire damage each time they spend AP to attack." },
      { id: "stun", icon: "⚡", name: "Stun", desc: "Enemy skips their next turn entirely." },
      { id: "frost", icon: "❄️", name: "Frost", desc: "Enemy loses 1 AP at the start of their turn." },
      { id: "corrupted", icon: "💜", name: "Corrupted", desc: "Matching this tile deals 8 damage to YOU instead of the enemy!" },
      { id: "disoriented", icon: "🔄", name: "Disoriented", desc: "Controls reversed — drag left to go right, drag right to go left." },
      { id: "afterglow", icon: "🛡️", name: "Afterglow", desc: "Take 50% less damage for the listed turns." },
      { id: "empower", icon: "💪", name: "Empower", desc: "Your next damaging match deals +50% damage, then clears." },
      { id: "blind", icon: "🌫️", name: "Blind", desc: "Your next damaging match deals -50% damage, then clears." },
      { id: "weaken", icon: "❌", name: "Weaken", desc: "Your next Sword match deals -2 damage, then clears." },
      { id: "mark", icon: "🎯", name: "Mark", desc: "Enemy takes +15% damage per stack (max 3). Applied by Ninja Cross shapes." },
      { id: "fracture", icon: "🦴", name: "Fracture", desc: "At the start of the enemy's turn they take 2 true damage per stack (max 5)." },
      { id: "mortal", icon: "💔", name: "Mortal Wound", desc: "Healing is halved for the listed turns." },
      { id: "manalock", icon: "🔒", name: "Mana Lock", desc: "Enemy cannot gain shield for the listed turns." },
      { id: "poisonStacks", icon: "🧪", name: "Poison Stacks", desc: "Deals stacks × (3 + Floor×0.5) true damage at the start of your turn, then decays by 1." },
      { id: "acidStacks", icon: "🩸", name: "Acid", desc: "All incoming damage is amplified by +2% per stack (cap 30 → +60% max)." },
      { id: "bloom", icon: "🌺", name: "Bloom", desc: "Each stack = 4% damage reduction (cap 8). At 5+ stacks, heals 2 HP/turn. Decays -1/turn." }
    ]
  };

  // ─── Revealed state ───
  let revealed = {};

  function loadRevealed() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) revealed = JSON.parse(raw);
    } catch (_) { revealed = {}; }
  }

  function saveRevealed() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(revealed)); } catch (_) {}
  }

  function reveal(category, id) {
    if (!revealed[category]) revealed[category] = {};
    if (!revealed[category][id]) {
      revealed[category][id] = true;
      saveRevealed();
    }
  }

  function isRevealed(category, id) {
    return !!(revealed[category] && revealed[category][id]);
  }

  function getProgress(category) {
    const entries = CODEX[category] || [];
    const rev = revealed[category] || {};
    const total = entries.length;
    const done = entries.filter(e => rev[e.id]).length;
    return { done, total };
  }

  function getAllProgress() {
    let totalDone = 0, totalAll = 0;
    for (const cat of Object.keys(CODEX)) {
      const p = getProgress(cat);
      totalDone += p.done;
      totalAll += p.total;
    }
    return { done: totalDone, total: totalAll };
  }

  // ─── UI ───
  let overlay = null;
  let activeTab = "creatures";

  const TAB_META = [
    { key: "creatures", label: "🐾 Creatures" },
    { key: "modifiers", label: "🎲 Modifiers" },
    { key: "upgrades", label: "⬆️ Upgrades" },
    { key: "passives", label: "🌳 Passives" },
    { key: "statuses", label: "💫 Statuses" }
  ];

  function buildOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "codex-overlay";
    overlay.innerHTML = `
      <div class="codex-panel">
        <div class="codex-header">
          <h2 class="codex-title">📖 Codex</h2>
          <span class="codex-progress" id="codexProgress"></span>
          <button class="codex-close" id="codexClose" aria-label="Close codex">✕</button>
        </div>
        <div class="codex-tabs" id="codexTabs"></div>
        <div class="codex-body" id="codexBody"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#codexClose").addEventListener("click", closeCodex);
    overlay.addEventListener("click", e => { if (e.target === overlay) closeCodex(); });

    // Build tabs
    const tabsEl = overlay.querySelector("#codexTabs");
    TAB_META.forEach(tab => {
      const btn = document.createElement("button");
      btn.className = "codex-tab";
      btn.dataset.tab = tab.key;
      btn.textContent = tab.label;
      btn.addEventListener("click", () => switchTab(tab.key));
      tabsEl.appendChild(btn);
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    overlay.querySelectorAll(".codex-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    renderBody();
  }

  function renderBody() {
    const body = overlay.querySelector("#codexBody");
    const entries = CODEX[activeTab] || [];
    const totalP = getAllProgress();
    const catP = getProgress(activeTab);
    overlay.querySelector("#codexProgress").textContent = `${totalP.done}/${totalP.total} discovered`;

    let html = `<div class="codex-cat-progress">${catP.done}/${catP.total} discovered</div>`;
    html += `<div class="codex-grid">`;

    entries.forEach(entry => {
      const rev = isRevealed(activeTab, entry.id);
      if (rev) {
        html += `
          <div class="codex-card revealed ${entry.tier || ""}">
            <div class="codex-card-icon">${entry.icon}</div>
            <div class="codex-card-name">${entry.name}</div>
            <div class="codex-card-desc">${entry.desc}</div>
            ${entry.passive ? `<div class="codex-card-passive">🛡️ ${entry.passive}</div>` : ""}
            ${entry.classReq ? `<div class="codex-card-class">${entry.classReq}</div>` : ""}
          </div>
        `;
      } else {
        html += `
          <div class="codex-card locked">
            <div class="codex-card-icon">❓</div>
            <div class="codex-card-name">???</div>
            <div class="codex-card-desc">Encounter to discover</div>
          </div>
        `;
      }
    });

    html += `</div>`;
    body.innerHTML = html;
  }

  function openCodex(tab) {
    buildOverlay();
    if (tab) activeTab = tab;
    switchTab(activeTab);
    overlay.classList.add("open");
  }

  function closeCodex() {
    if (overlay) overlay.classList.remove("open");
  }

  // ─── Expose to window ───
  window.CODEX = CODEX;
  window.codexReveal = reveal;
  window.codexOpen = openCodex;
  window.codexProgress = getAllProgress;

  // ─── Init ───
  loadRevealed();
})();
