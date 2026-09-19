    const ROWS = 7;
    const COLS = 6;
    const TYPES = ["sword", "shield", "hp", "star", "question"];
    const MIN_MATCH = 3;

    // ---- Shared game constants (loaded first → safe for every other file) ----
    // AP_MAX is mutated by upgrades/blessings during a run. BASE_HP/MAX_FLOOR
    // are fixed. Keep these here, NOT in enemies.js: many modules (board, combat,
    // main) read them and settings.js is always the first script loaded.
    let AP_MAX = 3;
    const BASE_HP = 100;
    const MAX_FLOOR = 45;

    // Global settings (difficulty, mute, admin numbers)
    const SETTINGS_KEY = "puzzleGridSettings_v1";
    const settings = {
      muted: false,
      volume: 1.0, // 0–1 master SFX gain (max by default)
      difficulty: "normal", // easy | normal | hard
      swordDmg: 3,
      starDmg: 4,
      healAmt: 3,
      shieldOn3: 2,      // 3-match shields → 2 stacks
      shieldMax: 18,
      enemyAtk: 5,
      ultDmg: 14,      // fallback; scaled ult still uses 12 + (charge-6)*2
      ultNeed: 5,
      ultMaxCharge: 10,
      feverTurn: 6,
      impactTurn: 11,
      // cosmetics: per-class costume + weapon choices
      costume: { ninja: "classic", wizard: "classic", knight: "classic" },
      weapon: { ninja: "katana", wizard: "staff", knight: "shield" },
      tutorialCompleted: false,
      clearedOnce: false,  // 🌟 Golden Cosmos unlocked after first final victory
      ngLoopsDone: 0,      // completed Golden Cosmos loops
      bestFloor: 0,        // career-best floor reached (unlocks global skills)
      skills: { shuffleSurge: true }, // global skill toggles
      liteMode: null,        // null = auto-detect, true = forced lite, false = forced full
      musicEnabled: true,    // background music on/off
      musicVolume: 0.5,      // music volume 0-1 (separate from SFX)
      ultTips: true,         // in-battle rotating tip line (gameplay tutorial)
      accentColor: "#4f7a33", // player accent (names, HP, log, gear, AP pills, glow)
      accentColor2: "#efd48a", // player accent 2 (ult charge pips / pill fill)
      fxDamage: true,        // floating damage/heal popups over the board
      fxCombo: true,         // combo glow wash + screen flash
      fxShake: true,         // board/combat screen shake + hit shake
      skin: "paper",         // paper | midnight (dark UI theme)
      pipStyle: "circle",    // circle | square | diamond
      stampTheme: "leaf"     // passport stamp look: leaf | gold | ink
    };

    // ---- Global skills (account-wide, unlock via milestones) ----
    const GLOBAL_SKILLS = {
      shuffleSurge: {
        name: "🌀 Shuffle Surge",
        desc: "Every shuffle empowers your next turn: +25% damage per shuffle used.",
        unlockAt: 10,
        unlockLabel: "Reach floor 10"
      }
    };
    function skillUnlocked(id) {
      const s = GLOBAL_SKILLS[id];
      return !!s && (settings.bestFloor || 0) >= s.unlockAt;
    }
    function skillEnabled(id) {
      return skillUnlocked(id) && (!settings.skills || settings.skills[id] !== false);
    }

    function persistSettings() {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({
          muted: settings.muted,
          volume: settings.volume,
          difficulty: settings.difficulty,
          swordDmg: settings.swordDmg,
          starDmg: settings.starDmg,
          healAmt: settings.healAmt,
          shieldOn3: settings.shieldOn3,
          shieldMax: settings.shieldMax,
          enemyAtk: settings.enemyAtk,
          ultDmg: settings.ultDmg,
          ultNeed: settings.ultNeed,
          feverTurn: settings.feverTurn,
          impactTurn: settings.impactTurn,
          costume: settings.costume,
          weapon: settings.weapon,
          tutorialCompleted: settings.tutorialCompleted,
          clearedOnce: settings.clearedOnce,
          ngLoopsDone: settings.ngLoopsDone,
          bestFloor: settings.bestFloor || 0,
          skills: settings.skills || { shuffleSurge: true },
          liteMode: settings.liteMode,
          musicEnabled: settings.musicEnabled,
          musicVolume: settings.musicVolume,
          ultTips: settings.ultTips,
          accentColor: settings.accentColor,
          accentColor2: settings.accentColor2,
          fxDamage: settings.fxDamage,
          fxCombo: settings.fxCombo,
          fxShake: settings.fxShake,
          skin: settings.skin,
          pipStyle: settings.pipStyle,
          stampTheme: settings.stampTheme
        }));
      } catch (_) {}
    }

    function loadSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return;
        const o = JSON.parse(raw);
        if (typeof o.muted === "boolean") settings.muted = o.muted;
        if (typeof o.volume === "number") settings.volume = Math.max(0, Math.min(1, o.volume));
        if (["easy", "normal", "hard"].includes(o.difficulty)) settings.difficulty = o.difficulty;
        ["swordDmg","starDmg","healAmt","shieldOn3","shieldMax","enemyAtk","ultDmg","ultNeed","feverTurn","impactTurn"].forEach(k => {
          if (typeof o[k] === "number") settings[k] = o[k];
        });
        ["ninja","wizard","knight"].forEach(cls => {
          if (o.costume && typeof o.costume[cls] === "string") settings.costume[cls] = o.costume[cls];
          if (o.weapon && typeof o.weapon[cls] === "string") settings.weapon[cls] = o.weapon[cls];
        });
        if (typeof o.tutorialCompleted === "boolean") settings.tutorialCompleted = o.tutorialCompleted;
        if (typeof o.clearedOnce === "boolean") settings.clearedOnce = o.clearedOnce;
        if (typeof o.ngLoopsDone === "number") settings.ngLoopsDone = o.ngLoopsDone;
        if (typeof o.bestFloor === "number") settings.bestFloor = o.bestFloor;
        if (o.skills && typeof o.skills === "object") {
          Object.keys(settings.skills).forEach(k => {
            if (typeof o.skills[k] === "boolean") settings.skills[k] = o.skills[k];
          });
        }
        if (typeof o.liteMode === "boolean" || o.liteMode === null) settings.liteMode = o.liteMode;
        if (typeof o.musicEnabled === "boolean") settings.musicEnabled = o.musicEnabled;
        if (typeof o.musicVolume === "number") settings.musicVolume = Math.max(0, Math.min(1, o.musicVolume));
        if (typeof o.ultTips === "boolean") settings.ultTips = o.ultTips;
        if (typeof o.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(o.accentColor)) settings.accentColor = o.accentColor;
        if (typeof o.accentColor2 === "string" && /^#[0-9a-fA-F]{6}$/.test(o.accentColor2)) settings.accentColor2 = o.accentColor2;
        if (typeof o.fxDamage === "boolean") settings.fxDamage = o.fxDamage;
        if (typeof o.fxCombo === "boolean") settings.fxCombo = o.fxCombo;
        if (typeof o.fxShake === "boolean") settings.fxShake = o.fxShake;
        if (["paper", "midnight"].includes(o.skin)) settings.skin = o.skin;
        if (["circle", "square", "diamond"].includes(o.pipStyle)) settings.pipStyle = o.pipStyle;
        if (["leaf", "gold", "ink"].includes(o.stampTheme)) settings.stampTheme = o.stampTheme;
      } catch (_) {}
    }
    loadSettings();

    // Auto-detect lite mode on first visit (null = undecided)
    function autoDetectLite() {
      if (settings.liteMode !== null) return; // user already chose
      const cores = navigator.hardwareConcurrency || 4;
      settings.liteMode = cores <= 4;
      persistSettings();
    }
    autoDetectLite();

    function isLite() {
      return settings.liteMode === true;
    }
