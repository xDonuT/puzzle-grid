    const ROWS = 7;
    const COLS = 6;
    const TYPES = ["sword", "shield", "hp", "star", "question"];
    const MIN_MATCH = 3;

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
      weapon: { ninja: "katana", wizard: "staff", knight: "sword" }
    };

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
          weapon: settings.weapon
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
        if (o.difficulty) settings.difficulty = o.difficulty;
        ["swordDmg","starDmg","healAmt","shieldOn3","shieldMax","enemyAtk","ultDmg","ultNeed","feverTurn","impactTurn"].forEach(k => {
          if (typeof o[k] === "number") settings[k] = o[k];
        });
        ["ninja","wizard","knight"].forEach(cls => {
          if (o.costume && typeof o.costume[cls] === "string") settings.costume[cls] = o.costume[cls];
          if (o.weapon && typeof o.weapon[cls] === "string") settings.weapon[cls] = o.weapon[cls];
        });
      } catch (_) {}
    }
    loadSettings();
