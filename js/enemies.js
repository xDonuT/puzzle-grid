    // Monster silhouette bodies use currentColor so the role class can theme them.
    const MONSTER_SVG = {
      slime: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M5 14.2c0-3.4 3.1-6 7-6s7 2.6 7 6c0 3-2.7 5.1-7 5.1s-7-2.1-7-5.1z"/>
        <circle fill="#2b4123" cx="9.5" cy="13.4" r="0.7"/>
        <circle fill="#2b4123" cx="14.5" cy="13.4" r="0.7"/>
        <path fill="#2b4123" d="M10.8 16.2c0.7 0.7 1.7 0.7 2.4 0"/>
      </svg>`,
      bat: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3.5 9.4c0.9 2.4 2.4 4 4.7 4.6 0.7-0.9 1.6-1.6 2.9-2l1 0.2c1.1 0.4 2 1.1 2.7 2 2.4-0.5 3.9-2.1 4.7-4.5-1.2 0.2-2.3 0.5-3.3 1-0.8 0.5-1.5 1.1-1.9 2-0.5-0.9-1.2-1.5-2-2-1-0.5-2.1-0.8-3.3-1.1z"/>
        <circle fill="#2a2038" cx="9.6" cy="9.7" r="0.75"/>
        <circle fill="#2a2038" cx="14.4" cy="9.7" r="0.75"/>
        <path fill="currentColor" d="M12 5.2c1-0.6 2.3-0.6 3.3 0.1-0.4 0.6-1 1-1.7 1.1-0.5 0.1-1 0-1.6-0.2z"/>
        <path fill="currentColor" d="M12 5.2c-1-0.6-2.3-0.6-3.3 0.1 0.4 0.6 1 1 1.7 1.1 0.5 0.1 1 0 1.6-0.2z"/>
      </svg>`,
      mush: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M5 11.4c0-3.2 3.1-5.9 7-5.9s7 2.7 7 5.9c0 1-0.8 1.8-1.8 1.8H6.8c-1 0-1.8-0.8-1.8-1.8z"/>
        <rect fill="#f5ecdc" x="9.2" y="13.2" width="5.6" height="6" rx="2"/>
        <circle fill="#f5ecdc" cx="7.4" cy="14.6" r="1"/>
        <circle fill="#f5ecdc" cx="16.6" cy="14.6" r="1"/>
        <circle fill="#33261d" cx="9.4" cy="9.2" r="0.65"/>
        <circle fill="#33261d" cx="12" cy="7.9" r="0.65"/>
        <circle fill="#33261d" cx="14.6" cy="9.2" r="0.65"/>
      </svg>`,
      golem: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M6.5 8.2c0-1.8 1.4-3.2 3.2-3.2h4.6c1.8 0 3.2 1.4 3.2 3.2v1.8c0 1.8-1.4 3.2-3.2 3.2H9.7c-1.8 0-3.2-1.4-3.2-3.2V8.2z"/>
        <path fill="currentColor" d="M9 15.4c-0.6 1.3-0.9 2.7-0.9 4.1h7.8c0-1.4-0.3-2.8-0.9-4.1l-1.3-1.9H10.3L9 15.4z"/>
        <path fill="#2a3040" d="M10.3 8.9h3.4v1.7h-3.4z"/>
        <path fill="#2a3040" d="M11.3 11.9h1.4v1.5h-1.4z"/>
      </svg>`,
      skull: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 7.6c0-2.1 1.8-3.9 4-3.9s4 1.8 4 3.9c0 1.4-0.7 2.6-1.8 3.3v1.8H9.8v-1.8C8.7 10.2 8 9 8 7.6z"/>
        <rect fill="currentColor" x="8" y="12.8" width="8" height="3.1" rx="1.2"/>
        <rect fill="#33261d" x="8.1" y="15.9" width="7.8" height="1.6" rx="0.8"/>
        <circle fill="#33261d" cx="9.9" cy="8.7" r="0.9"/>
        <circle fill="#33261d" cx="14.1" cy="8.7" r="0.9"/>
        <path fill="#33261d" d="M10.6 12.3c0.4 0.3 0.9 0.4 1.4 0.4s1-0.1 1.4-0.4l-1.4-1.2-1.4 1.2z"/>
      </svg>`
    };

    const CHARACTERS = {
      ninja: {
        name: "Ninja",
        role: "ninja",
        svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- hood -->
          <path fill="#5a5048" d="M7 10.5c0-3.2 2.2-5.8 5-5.8s5 2.6 5 5.8v1.2H7v-1.2z"/>
          <!-- face -->
          <rect fill="#f0c4b4" x="8.2" y="9.2" width="7.6" height="5.2" rx="2.2"/>
          <!-- mask -->
          <path fill="#6b5f55" d="M8.2 12.2h7.6v2.2c0 1.2-1.7 2.2-3.8 2.2s-3.8-1-3.8-2.2v-2.2z"/>
          <!-- eyes -->
          <circle fill="#3a342e" cx="10.2" cy="11.2" r="0.7"/>
          <circle fill="#3a342e" cx="13.8" cy="11.2" r="0.7"/>
          <!-- body -->
          <path fill="#c96b52" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
          <!-- scarf accent -->
          <path fill="#b85a3f" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
        </svg>`
      },
      wizard: {
        name: "Wizard",
        role: "wizard",
        svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- hat (same massing as ninja hood) -->
          <path fill="#6a4a9e" d="M7 10.2c0-3.4 2.2-6.2 5-6.2s5 2.8 5 6.2v0.8H7v-0.8z"/>
          <path fill="#7d5faf" d="M12 2.2l2.6 5.4H9.4L12 2.2z"/>
          <!-- face -->
          <rect fill="#f0dcc8" x="8.2" y="9.4" width="7.6" height="5.2" rx="2.2"/>
          <!-- eyes -->
          <circle fill="#3a342e" cx="10.2" cy="11.4" r="0.7"/>
          <circle fill="#3a342e" cx="13.8" cy="11.4" r="0.7"/>
          <!-- body / robe -->
          <path fill="#9b7ec8" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
          <!-- collar accent -->
          <path fill="#d4c8e8" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
        </svg>`
      },
      knight: {
        name: "Knight",
        role: "knight",
        svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- helmet (same massing as ninja hood) -->
          <path fill="#6a7e98" d="M7 10.5c0-3.2 2.2-5.8 5-5.8s5 2.6 5 5.8v1.2H7v-1.2z"/>
          <!-- face / visor window -->
          <rect fill="#c5d4e4" x="8.2" y="9.2" width="7.6" height="5.2" rx="2.2"/>
          <!-- visor slit -->
          <rect fill="#4a5c70" x="8.8" y="11.2" width="6.4" height="1.5" rx="0.6"/>
          <!-- plume -->
          <path fill="#d4785c" d="M12 2.5c0 0 1.1 2 0.35 3.4h-0.7C10.9 4.5 12 2.5 12 2.5z"/>
          <!-- body / armor -->
          <path fill="#9fb4cc" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
          <!-- chest accent -->
          <path fill="#b8cce0" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
        </svg>`
      },
      enemy: {
        name: "Rival",
        role: "enemy",
        svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- horns -->
          <path fill="#6a4a9e" d="M8.2 8.2l-1.8-2.6 2.2 1.2z"/>
          <path fill="#6a4a9e" d="M15.8 8.2l1.8-2.6-2.2 1.2z"/>
          <!-- head -->
          <circle fill="#b89ad4" cx="12" cy="11" r="4.2"/>
          <!-- eyes -->
          <circle fill="#4a3a5a" cx="10.3" cy="10.6" r="0.75"/>
          <circle fill="#4a3a5a" cx="13.7" cy="10.6" r="0.75"/>
          <circle fill="#fff" cx="10.5" cy="10.4" r="0.25"/>
          <circle fill="#fff" cx="13.9" cy="10.4" r="0.25"/>
          <!-- mouth -->
          <path fill="#6a4a9e" d="M10.5 13c0.6 0.9 2.4 0.9 3 0"/>
          <!-- body -->
          <path fill="#8a6bb8" d="M8.2 15.5c0 0 1.4 5 3.8 5s3.8-5 3.8-5H8.2z"/>
          <!-- belt -->
          <rect fill="#efd48a" x="9.2" y="17.2" width="5.6" height="1.1" rx="0.4"/>
        </svg>`
      },

      // ---- Monster portraits ----
      slime:    { name: "Slime",    role: "eslime",    svg: MONSTER_SVG.slime },
      bat:      { name: "Bat",      role: "ebat",      svg: MONSTER_SVG.bat },
      mush:     { name: "Fungling", role: "emush",     svg: MONSTER_SVG.mush },
      golem:    { name: "Golem",    role: "egolem",    svg: MONSTER_SVG.golem },
      skull:    { name: "Bones",    role: "eskull",    svg: MONSTER_SVG.skull },

      // ---- Elite recolors (same shapes, themed palette) ----
      bracken:    { name: "Bracken",    role: "c-bracken",    svg: MONSTER_SVG.golem },
      cinder:     { name: "Cinder",     role: "c-cinder",     svg: MONSTER_SVG.slime },
      ironjaw:    { name: "Ironjaw",    role: "c-ironjaw",    svg: MONSTER_SVG.golem },
      bloodroot:  { name: "Bloodroot",  role: "c-bloodroot",  svg: MONSTER_SVG.slime },
      stormglass: { name: "Stormglass", role: "c-stormglass", svg: MONSTER_SVG.golem },
      nightcoil:  { name: "Nightcoil",  role: "c-nightcoil",  svg: MONSTER_SVG.bat },
      ashcrown:   { name: "Ashcrown",   role: "c-ashcrown",   svg: MONSTER_SVG.skull },

      // ---- The three dark heroes (full kits) ----
      umbral:    { name: "Umbral",    role: "c-umbral",    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4a3a5a" d="M7 10.5c0-3.2 2.2-5.8 5-5.8s5 2.6 5 5.8v1.2H7v-1.2z"/>
                  <rect fill="#c9a8d8" x="8.2" y="9.2" width="7.6" height="5.2" rx="2.2"/>
                  <path fill="#5a4a6a" d="M8.2 12.2h7.6v2.2c0 1.2-1.7 2.2-3.8 2.2s-3.8-1-3.8-2.2v-2.2z"/>
                  <circle fill="#2a2038" cx="10.2" cy="11.2" r="0.7"/>
                  <circle fill="#2a2038" cx="13.8" cy="11.2" r="0.7"/>
                  <circle fill="#ffd24a" cx="10.2" cy="11.2" r="0.28"/>
                  <circle fill="#ffd24a" cx="13.8" cy="11.2" r="0.28"/>
                  <path fill="#8a6bb8" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
                  <path fill="#6a4a9e" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
                </svg>` },
      nox:       { name: "Nox",       role: "c-nox",       svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4a3a6a" d="M7 10.2c0-3.4 2.2-6.2 5-6.2s5 2.8 5 6.2v0.8H7v-0.8z"/>
                  <path fill="#5a4a7a" d="M12 2.2l2.6 5.4H9.4L12 2.2z"/>
                  <rect fill="#c9b8e0" x="8.2" y="9.4" width="7.6" height="5.2" rx="2.2"/>
                  <circle fill="#2a2040" cx="10.2" cy="11.4" r="0.7"/>
                  <circle fill="#2a2040" cx="13.8" cy="11.4" r="0.7"/>
                  <circle fill="#ffd24a" cx="10.2" cy="11.4" r="0.28"/>
                  <circle fill="#ffd24a" cx="13.8" cy="11.4" r="0.28"/>
                  <path fill="#7a5aa8" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
                  <path fill="#9b7ec8" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
                </svg>` },
      lastrival: { name: "Last Rival", role: "c-lastrival", svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4a4a5a" d="M7 10.5c0-3.2 2.2-5.8 5-5.8s5 2.6 5 5.8v1.2H7v-1.2z"/>
                  <rect fill="#a8a8c0" x="8.2" y="9.2" width="7.6" height="5.2" rx="2.2"/>
                  <rect fill="#3a3a4a" x="8.8" y="11.2" width="6.4" height="1.5" rx="0.6"/>
                  <path fill="#c03a4a" d="M12 2.5c0 0 1.1 2 0.35 3.4h-0.7C10.9 4.5 12 2.5 12 2.5z"/>
                  <path fill="#5a5a6a" d="M8 16.2c0 0 1.2 4.5 4 4.5s4-4.5 4-4.5H8z"/>
                  <path fill="#6a6a7a" d="M9.5 15.6h5l-0.6 1.4h-3.8z"/>
                </svg>` }
    };

    // ---------- Cosmetics: costumes (recolors) + weapons ----------

    // Which base fill color feeds which palette field, per hero class.
    const COSTUME_FIELDS = {
      ninja:  [["#5a5048", "hood"], ["#6b5f55", "mask"], ["#c96b52", "suit"], ["#b85a3f", "accent"], ["#f0c4b4", "face"], ["#3a342e", "eyes"]],
      wizard: [["#6a4a9e", "hat"], ["#7d5faf", "hatTip"], ["#f0dcc8", "face"], ["#3a342e", "eyes"], ["#9b7ec8", "robe"], ["#d4c8e8", "collar"]],
      knight: [["#6a7e98", "helmet"], ["#c5d4e4", "visor"], ["#4a5c70", "slit"], ["#d4785c", "plume"], ["#9fb4cc", "armor"], ["#b8cce0", "accent"]]
    };

    // Per-hero costume palettes. chip = representative color for the picker swatch.
    const COSTUMES = {
      ninja: {
        classic:  { name: "Classic",  chip: "#c96b52", hood: "#5a5048", mask: "#6b5f55", suit: "#c96b52", accent: "#b85a3f", face: "#f0c4b4", eyes: "#3a342e" },
        crimson:  { name: "Crimson",  chip: "#c0392b", hood: "#4a2626", mask: "#5a3230", suit: "#c0392b", accent: "#922b21", face: "#f0c4b4", eyes: "#2a1818" },
        midnight: { name: "Midnight", chip: "#4a7abe", hood: "#24324e", mask: "#3a4a6a", suit: "#4a7abe", accent: "#3a5f9e", face: "#e8dcc8", eyes: "#16202e" }
      },
      wizard: {
        classic: { name: "Classic", chip: "#9b7ec8", hat: "#6a4a9e", hatTip: "#7d5faf", face: "#f0dcc8", eyes: "#3a342e", robe: "#9b7ec8", collar: "#d4c8e8" },
        arcane:  { name: "Arcane",  chip: "#4a9e9e", hat: "#2f6a6a", hatTip: "#3a7a7a", face: "#f0e6d8", eyes: "#2a342e", robe: "#4a9e9e", collar: "#9ed8d8" },
        void:    { name: "Void",    chip: "#6a5a9e", hat: "#2a2440", hatTip: "#3a3256", face: "#e6dcce", eyes: "#14102a", robe: "#4a4470", collar: "#8a84b8" }
      },
      knight: {
        classic:  { name: "Classic",  chip: "#9fb4cc", helmet: "#6a7e98", visor: "#c5d4e4", slit: "#4a5c70", plume: "#d4785c", armor: "#9fb4cc", accent: "#b8cce0" },
        royal:    { name: "Royal",    chip: "#d8b84a", helmet: "#8a7a3a", visor: "#f0e6c8", slit: "#5a5030", plume: "#c0392b", armor: "#d8b84a", accent: "#e8d47a" },
        obsidian: { name: "Obsidian", chip: "#5a5a6a", helmet: "#3a3a4a", visor: "#b8b8c8", slit: "#1e1e28", plume: "#c0392b", armor: "#5a5a6a", accent: "#7a7a8a" }
      }
    };

    // Per-hero weapon choices (drawn inside the same 24x24 viewBox, right-hand side).
    const WEAPONS = {
      ninja: {
        katana: { name: "Katana", svg: `<path fill="#ccd4de" d="M20.4 5.2c0.7 0 1.2 0.5 1.2 1.3v8.6c0 0.8-0.5 1.3-1.2 1.3s-1.2-0.5-1.2-1.3V6.5c0-0.8 0.5-1.3 1.2-1.3z"/><rect fill="#d4785c" x="19.3" y="16.3" width="4.4" height="1.1" rx="0.4"/><path fill="#4a423c" d="M19.1 17.6h4.8l-0.5 3.3c-0.2 1.3-1 1.7-1.9 1.7s-1.7-0.4-1.9-1.7z"/>` },
        kunai: { name: "Kunai", svg: `<path fill="#ccd4de" d="M21.2 5.6c0.9 0.2 1.1 1 0.6 1.9l-4.6 7.4-1.3-0.9 4.6-7.4c0.2-0.4 0.5-0.6 0.7-1z"/><path fill="#8a6a3a" d="M15.4 14.6l-1.3-0.9-0.3 1.5c-0.2 1 0.3 1.9 1.2 2.2l1.9 0.7z"/><circle fill="#9aa2ae" cx="19" cy="18.5" r="1.5"/><circle fill="#8a90a0" cx="19" cy="18.5" r="0.7"/>` }
      },
      wizard: {
        staff:   { name: "Staff",   svg: `<rect fill="#8a6a3a" x="20.4" y="5.8" width="1.1" height="14" rx="0.5"/><rect fill="#8a6a3a" x="19.6" y="6.8" width="2.7" height="1" rx="0.5"/><circle fill="#b89420" cx="21" cy="4.6" r="1.4"/><circle fill="#e8cf7e" cx="21" cy="4.6" r="0.6"/>` },
        crystal: { name: "Crystal", svg: `<rect fill="#6a4a9e" x="20.4" y="6.6" width="1.1" height="13.2" rx="0.5"/><path fill="#b89420" d="M21 3.2l2 3.4H19z"/><path fill="#bbd2e6" d="M21 4.4l1.1 1.8h-2.2z"/>` }
      },
      knight: {
        sword:      { name: "Sword & Shield", svg: `<path fill="#ccd4de" d="M20.5 5.4c0.6 0 1 0.5 1 1.2v8.4c0 0.7-0.4 1.2-1 1.2s-1-0.5-1-1.2V6.6c0-0.7 0.4-1.2 1-1.2z"/><path fill="#d4785c" d="M18.9 16.2h3.2v0.9h-3.2z"/><path fill="#5a6a7a" d="M18.7 17.3h3.6l-0.4 2.9c-0.1 1.1-0.8 1.5-1.4 1.5s-1.3-0.4-1.4-1.5z"/><path fill="#9fb4cc" d="M4.4 13.6c1.3 0 2.5 1.1 2.5 2.6v2.2c0 1.5-1.2 2.6-2.5 2.6S1.9 19.9 1.9 18.4v-2.2c0-1.5 1.2-2.6 2.5-2.6z"/><path fill="#ccd4de" d="M3.6 16.2h1.6v3H3.6z"/>` },
        greatsword: { name: "Greatsword", svg: `<path fill="#ccd4de" d="M20.2 4.4c0.8 0 1.4 0.6 1.4 1.6v9.8c0 1-0.6 1.6-1.4 1.6s-1.4-0.6-1.4-1.6V6c0-1 0.6-1.6 1.4-1.6z"/><rect fill="#c0392b" x="18.5" y="16.3" width="5.2" height="1.2" rx="0.4"/><path fill="#4a423c" d="M18.2 17.7h5.8l-0.6 3.6c-0.2 1.5-1 2-1.9 2s-1.7-0.5-1.9-2z"/><path fill="#b8cce0" d="M21.6 9.4l1.5 1.1-1.5 1.1z"/>` }
      }
    };

    // Apply a costume palette to a hero's base svg (split/join hex swap).
    function recolorSvg(svg, cls, costumeKey) {
      const fields = COSTUME_FIELDS[cls];
      const pal = (COSTUMES[cls] && COSTUMES[cls][costumeKey]) || (COSTUMES[cls] && COSTUMES[cls].classic);
      if (!fields || !pal) return svg;
      let out = svg;
      for (const [hex, field] of fields) {
        const color = pal[field] || hex;
        out = out.split(hex).join(color);
      }
      return out;
    }

    // Compose a hero portrait svg from class + costume + weapon.
    function characterSvg(cls, costumeKey, weaponKey) {
      const base = CHARACTERS[cls] ? CHARACTERS[cls].svg : "";
      if (!base) return "";
      let svg = costumeKey ? recolorSvg(base, cls, costumeKey) : base;
      const w = WEAPONS[cls] && WEAPONS[cls][weaponKey];
      if (w && w.svg) svg = svg.replace("</svg>", `<g class="weapon">${w.svg}</g></svg>`);
      return svg;
    }

    // ---------- Combat state ----------
    let AP_MAX = 3;
    const BASE_HP = 100;
    const MAX_FLOOR = 20;

    // Random enemy name pools
    const ENEMY_NAMES = [
      "Ashfang", "Bramble", "Cinder", "Dusk", "Ember",
      "Frost", "Grim", "Hollow", "Ironjaw", "Jinx",
      "Krag", "Lurker", "Mire", "Nox", "Obsidian",
      "Pox", "Quill", "Ravager", "Sable", "Thorn",
      "Umbral", "Vex", "Wraith", "Xorn", "Yew", "Zephyr",
      "Blight", "Cask", "Drift", "Fang", "Gloom"
    ];

    function randomEnemyName() {
      return ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)];
    }

    function displayEnemyName(full) {
      if (!full) return "Rival";
      // UI shows a short name; drop a leading article so "The Last Rival" reads as "Last Rival"
      const cleaned = String(full).replace(/^The\s+/i, "").trim();
      const words = cleaned.split(/\s+/);
      return words.length <= 2 ? cleaned : words.slice(0, 2).join(" ");
    }

    // Named encounters get a fixed portrait; normal floors cycle the 5 monsters.
    const ENEMY_VISUALS = {
      4:  "bloodroot",
      5:  "bracken",
      9:  "stormglass",
      10: "cinder",
      14: "nightcoil",
      15: "ironjaw",
      19: "ashcrown",
      20: "lastrival"
    };
    const MONSTER_POOL = ["slime", "bat", "mush", "golem", "skull"];

    function pickEnemyVisual(floor) {
      if (ENEMY_VISUALS[floor]) return ENEMY_VISUALS[floor];
      return MONSTER_POOL[(floor - 1) % MONSTER_POOL.length];
    }

    // Normal-floor enemy archetypes (stronger variety)
    const ENEMY_ARCHETYPES = [
      { id: "bruiser", label: "Bruiser", hpMul: 1.15, atkMul: 1.25, passive: "Heavy hits" },
      { id: "viper", label: "Viper", hpMul: 0.85, atkMul: 1.1, passive: "Applies poison on hit" },
      { id: "mender", label: "Mender", hpMul: 1.05, atkMul: 0.9, passive: "Heals each turn" },
      { id: "raider", label: "Raider", hpMul: 0.9, atkMul: 1.35, passive: "Glass cannon" },
      { id: "hexer", label: "Hexer", hpMul: 1.0, atkMul: 1.0, passive: "Can blind or weaken" }
    ];

    function pickEnemyArchetype(floor) {
      if (BOSS_KITS && BOSS_KITS[floor]) return null;
      // Weight by floor: later floors lean meaner
      const pool = ENEMY_ARCHETYPES.slice();
      if (floor >= 8) pool.push(ENEMY_ARCHETYPES[0], ENEMY_ARCHETYPES[4]);
      if (floor >= 14) pool.push(ENEMY_ARCHETYPES[0], ENEMY_ARCHETYPES[0], ENEMY_ARCHETYPES[4]);
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function applyArchetypePassiveOnHit() {
      const a = combat.enemyArchetype;
      if (!a) return;
      if (a.id === "viper" && Math.random() < 0.45) {
        combat.poisonTurns = Math.max(combat.poisonTurns || 0, 2);
        flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison");
        setLog(`${combat.enemyName} · venom`);
      }
      if (a.id === "hexer" && Math.random() < 0.4) {
        if (Math.random() < 0.5) {
          combat.blindNext = true;
          setLog(`${combat.enemyName} · hex blind`);
        } else {
          combat.weakenNextSword = true;
          setLog(`${combat.enemyName} · hex weaken`);
        }
      }
    }

    function applyArchetypeTurnStart() {
      const a = combat.enemyArchetype;
      if (!a) return;
      if (a.id === "mender" && combat.enemyHp > 0) {
        const h = Math.max(2, Math.round(3 + run.floor * 0.15));
        healEnemy(h);
        setLog(`${combat.enemyName} mends`, `${combat.enemyName} mends · +${h} HP`);
      }
    }

    function isEliteFloor(f) {
      return !!(GAUNTLET_REWARDS && GAUNTLET_REWARDS[f]);
    }

    // Former gauntlet floors → single elite with strong passive/skills
    const ELITE_KITS = {
      4: { name: "Bloodroot", persona: "raider", bias: { sword: 1.8 }, hpMul: 1.55, atkMul: 1.3, passive: "Lifesteal on hit",
            onHit: () => { healEnemy(4); } },
      9: { name: "Stormglass", persona: "viper", bias: { star: 1.8 }, hpMul: 1.45, atkMul: 1.4, passive: "Chain shock (extra poke)",
            onHit: () => { dealDamageToPlayer(Math.max(2, Math.round(enemyAtkForFloor(run.floor) * 0.35))); } },
      14: { name: "Nightcoil", persona: "bruiser", bias: { sword: 1.6 }, hpMul: 1.5, atkMul: 1.25, passive: "Applies poison + weaken",
            onHit: () => {
              combat.poisonTurns = Math.max(combat.poisonTurns || 0, 2);
              flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison");
              if (Math.random() < 0.5) combat.weakenNextSword = true;
            } },
      19: { name: "Ashcrown", persona: "mender", bias: { shield: 2.0 }, hpMul: 1.65, atkMul: 1.5, passive: "Gains shield when struck",
            onHit: () => {},
            onDamaged: () => { combat.enemyShield = Math.min(25, combat.enemyShield + 3); } }
    };

    // Signature tile per class (charges ultimate)
    const SIGNATURE = {
      ninja: "sword",
      wizard: "shield",
      knight: "hp"
    };

    // Hero base stats & signature extras
    const HERO_STATS = {
      ninja:  { hp: 85,  startShield: 15, maxShieldCap: 15, name: "Ninja" },
      wizard: { hp: 100, startShield: 20, maxShieldCap: 20, name: "Wizard", reflectPct: 0.3 },
      knight: { hp: 120, startShield: 10, maxShieldCap: 10, name: "Knight" }
    };

    // Permanent run progression (persists across floors until defeat / menu)
    const run = {
      floor: 1,
      bonusMaxHp: 0,
      bonusShieldMax: 0,
      bonusApMax: 0,
      rewardsClaimed: {}, // floor -> true (elites + boss upgrades already picked)
      pickedUpgrades: [], // ids chosen from the boss upgrade picker (each unique per run)
      ultChargeBonus: 0,
      bonusSwordDmg: 0,
      bonusStarDmg: 0,
      bonusHeal: 0,
      floorShieldBonus: 0,
      feverEarly: 0,
      enemyUltSlow: 0,
      pending: { extraPick: 0, reroll: 0, bonusAp: 0, empower: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, feverBoost: 0, critChance: 0, shieldConvert: 0 },
      pendingModifier: null,
      pendingModifierRare: false
    };

    // Boss floors are marked here (also drives boss HP scaling); rewards are now
    // chosen via the 3-card upgrade picker instead of fixed grants.
    const BOSS_REWARDS = {
      5:  { label: "Boss", apply: () => {} },
      10: { label: "Boss", apply: () => {} },
      15: { label: "Boss", apply: () => {} },
      20: { label: "Boss", apply: () => {} }
    };

    // Post-boss upgrade pool — each pick may be taken once per run.
    // name = card title · desc = short effect line
    const RUN_UPGRADES = [
      // ---- General / Stat boosts (any class) ----
      { id: "hp10", name: "❤️ +10 Max HP", desc: "Permanently boost your health", classRequirement: "ANY", apply: () => { run.bonusMaxHp += 10; } },
      { id: "shield5", name: "🛡️ +5 Max Shield", desc: "Higher shield ceiling", classRequirement: "ANY", apply: () => { run.bonusShieldMax += 5; } },
      { id: "ap1", name: "⚡ +1 Max AP", desc: "More actions each turn", classRequirement: "ANY", apply: () => { run.bonusApMax += 1; AP_MAX = 3 + run.bonusApMax; } },
      { id: "ultCharge", name: "🔥 Faster Ult", desc: "Signature charge +1 per signature match", classRequirement: "ANY", apply: () => { run.ultChargeBonus += 1; } },
      { id: "swordDmg", name: "⚔️ +1 Sword Damage", desc: "Permanently stronger swords", classRequirement: "ANY", apply: () => { run.bonusSwordDmg += 1; } },
      { id: "healAmt", name: "💚 +2 Heal Amount", desc: "Potions heal more", classRequirement: "ANY", apply: () => { run.bonusHeal += 2; } },
      { id: "floorShield", name: "🛡️ +1 Shield at Floor Start", desc: "Begin each floor shielded", classRequirement: "ANY", apply: () => { run.floorShieldBonus += 1; } },
      { id: "feverEarly", name: "⭐ Fever 1 Turn Earlier", desc: "Star Fever arrives sooner", classRequirement: "ANY", apply: () => { run.feverEarly += 1; } },
      { id: "enemyUltSlow", name: "⛓️ Enemy Ult +1 Turn", desc: "Rival ultimates charge slower", classRequirement: "ANY", apply: () => { run.enemyUltSlow += 1; } },
      // ---- Transformative upgrades (change how you play) ----
      { id: "cascadeAp", name: "⚡ Cascade Refund", desc: "Every cascade after the first refunds 1 AP", classRequirement: "ANY", apply: () => { run.cascadeAp = true; } },
      { id: "crossAp", name: "✚ Seal Mastery", desc: "T/+ and L seals refund 1 additional AP", classRequirement: "ANY", apply: () => { run.crossAp = true; } },
      { id: "overflowBoost", name: "💚 Overflow Surge", desc: "Overflow heal/shield damage +50%", classRequirement: "ANY", apply: () => { run.overflowBoost = true; } },
      { id: "bloomCharge", name: "🌸 Bloom Signature", desc: "Detonating a Bloom gives +1 Sig charge", classRequirement: "ANY", apply: () => { run.bloomCharge = true; } },
      { id: "sigDouble", name: "⭐ Signature Echo", desc: "Your signature tile also counts as a small star", classRequirement: "ANY", apply: () => { run.sigDouble = true; } },
      { id: "boardWhisper", name: "🔄 Board Whisper", desc: "1 free Shuffle each floor", classRequirement: "ANY", apply: () => { run.boardWhisper = true; } },
      { id: "phasePower", name: "🌠 Phase Attunement", desc: "Signature effects stronger in Fever; Mystery +1 charge in Impact", classRequirement: "ANY", apply: () => { run.phasePower = true; } },
      { id: "startShield", name: "🛡️ Fortified Start", desc: "Begin every floor with +4–6 extra Shield", classRequirement: "ANY", apply: () => { run.fortifiedStart = true; } },
      { id: "poisonMaster", name: "☠️ Venomous", desc: "Sword matches can poison the enemy (30%)", classRequirement: "NINJA", apply: () => { run.venomous = true; } },
      { id: "fractureBoost", name: "💥 Deep Fracture", desc: "Fracture deals +1 true damage per stack", classRequirement: "KNIGHT", apply: () => { run.deepFracture = true; } },
      { id: "reflectBoost", name: "🪞 Arcane Mirror", desc: "Wizard reflection +10% (scales with floor)", classRequirement: "WIZARD", apply: () => { run.arcaneMirror = true; } },
      { id: "afterglowPlus", name: "🌑 Lingering Shadow", desc: "Ninja Afterglow lasts 2 turns", classRequirement: "NINJA", apply: () => { run.lingeringShadow = true; } },
      { id: "enemySlow2", name: "⛓️ Heavy Chains", desc: "Enemy specials/ults +1 additional turn", classRequirement: "ANY", apply: () => { run.heavyChains = true; } },
      { id: "apCarry", name: "⚡ Momentum", desc: "Unused AP carries over up to +2 next turn", classRequirement: "ANY", apply: () => { run.momentum = true; } },
      { id: "mysteryBias", name: "🎲 Lucky Dice", desc: "Mystery tiles are 70% buffs before Star Impact", classRequirement: "ANY", apply: () => { run.luckyDice = true; } },
      // ---- Wizard-specific ----
      { id: "runicShield", name: "🔮 Runic Shield", desc: "Wizard: Shield matches deal double Runic damage", classRequirement: "WIZARD", apply: () => { run.runicShield = true; } },
      { id: "manaSurge", name: "⚡ Mana Surge", desc: "Wizard: Full charge — signature matches refund 1 AP", classRequirement: "WIZARD", apply: () => { run.manaSurge = true; } },
      // ---- Knight-specific ----
      { id: "mortalStrike", name: "⚔️ Mortal Strike", desc: "Knight: Ultimate also reduces enemy damage by 25% for 2 turns", classRequirement: "KNIGHT", apply: () => { run.mortalStrike = true; } },
      { id: "bulwark", name: "🛡️ Bulwark", desc: "Knight: Shield matches apply 1 Fracture stack (once per turn)", classRequirement: "KNIGHT", apply: () => { run.bulwark = true; } },
      // ---- Ninja-specific ----
      { id: "venomousBlade", name: "🗡️ Venomous Blade", desc: "Ninja: Matches of 4+ Swords or cascades apply +2 Poison", classRequirement: "NINJA", apply: () => { run.venomousBlade = true; } },
      { id: "miasmaReflex", name: "💨 Miasma Reflex", desc: "Ninja: Dodging triggers 100% of Poison stacks as immediate damage", classRequirement: "NINJA", apply: () => { run.miasmaReflex = true; } },
      // ---- Wizard-specific (Poison/Acid) ----
      { id: "acidicBarrier", name: "🧪 Acidic Barrier", desc: "Wizard: Every 10 damage absorbed by Shield applies +1 Poison", classRequirement: "WIZARD", apply: () => { run.acidicBarrier = true; } },
      { id: "contagionCatalyst", name: "☣️ Contagion Catalyst", desc: "Wizard: Clearing a Mystery tile while Shielded doubles enemy Poison", classRequirement: "WIZARD", apply: () => { run.contagionCatalyst = true; } },
      // ---- Knight-specific (Poison/Acid) ----
      { id: "corrosiveOverheal", name: "🩸 Corrosive Overheal", desc: "Knight: Excess healing converts to Acid stacks (1 per 5 HP)", classRequirement: "KNIGHT", apply: () => { run.corrosiveOverheal = true; } },
      { id: "toxicFortitude", name: "🏰 Toxic Fortitude", desc: "Knight: Start of turn, gain Shield = 2× total (Poison + Acid) on rival", classRequirement: "KNIGHT", apply: () => { run.toxicFortitude = true; } }
    ];

    function isBossFloor(f) {
      return !!(BOSS_REWARDS && BOSS_REWARDS[f]);
    }

    // 3 random upgrade choices, never repeating a pick already taken this run
    // Class-specific cards only show for the matching hero
    function pickUpgradeChoices(n = 3) {
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const avail = RUN_UPGRADES.filter(u => {
        if ((run.pickedUpgrades || []).includes(u.id)) return false;
        if (u.classRequirement === "ANY") return true;
        return u.classRequirement === hero;
      });
      const pool = avail.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, n);
    }

    // Non-permanent reward pools for regular floors — temporary perks that make
    // the next fight noticeably easier. Applied at floor start (or immediately
    // for the instant-heal perk).
    // Common (5) · Uncommon (4) · Rare (2), weighted 50 / 35 / 15.
    const FLOOR_REWARDS_COMMON = [
      { id: "healNow", tier: "common", name: "Patch Up", desc: "Restore 14 HP right now.",
        grant() {
          const amt = 14;
          combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp + amt);
          return { label: `Heal ${amt} HP right now` };
        } },
      { id: "shieldNext", tier: "common", name: "Ward", desc: "+6 shield at the start of next floor.",
        grant() { run.pending.shield += 6; return { label: "+6 shield next floor" }; } },
      { id: "swordBoost", tier: "common", name: "Sharpen", desc: "+3 sword damage next floor.",
        grant() { run.pending.swordBoost += 3; return { label: "+3 sword damage next floor" }; } },
      { id: "bonusAp", tier: "common", name: "Extra Action", desc: "+1 AP next floor.",
        grant() { run.pending.bonusAp += 1; return { label: "+1 AP next floor" }; } },
      { id: "enemySlow", tier: "common", name: "Slow Enemy", desc: "Enemy ultimate takes 1 more turn next floor.",
        grant() { run.pending.enemySlow += 1; return { label: "Enemy ult +1 turn next floor" }; } }
    ];
    const FLOOR_REWARDS_UNCOMMON = [
      { id: "empower", tier: "uncommon", name: "Empower", desc: "Your first damaging match next floor deals +50%.",
        grant() { run.pending.empower += 1; return { label: "Empower next floor" }; } },
      { id: "enemyPoison", tier: "uncommon", name: "Poison", desc: "The rival starts next floor poisoned for 2 turns.",
        grant() { run.pending.enemyPoison += 2; return { label: "Poison enemy 2 turns next floor" }; } },
      { id: "starBlessing", tier: "uncommon", name: "Star Blessing", desc: "Start next floor with +2 Star Fever charge.",
        grant() { run.pending.feverBoost += 2; return { label: "⭐ Start next floor with +2 Star Fever charge" }; } },
      { id: "critNext", tier: "uncommon", name: "Fated Edge", desc: "+15% Critical Chance next floor.",
        grant() { run.pending.critChance += 15; return { label: "⚔️ +15% Critical Chance next floor" }; } }
    ];
    const FLOOR_REWARDS_RARE = [
      { id: "shieldConvert", tier: "rare", name: "Blade Shield", desc: "25% of Shield gained becomes Sword Damage next floor.",
        grant() { run.pending.shieldConvert = 0.25; return { label: "🛡️⚔️ 25% of Shield gained becomes Sword Damage next floor" }; } },
      { id: "starFever", tier: "rare", name: "Star Surge", desc: "Start next floor very close to Star Fever.",
        grant() { run.pending.feverBoost += 4; return { label: "⭐ Start next floor significantly closer to Star Fever" }; } }
    ];

    // Floor modifiers — picked after the reward. Easy = benefits player (normal reward).
    // Hard = hurts player but guarantees a rare-tier reward next floor.
    const FLOOR_MODIFIERS = [
      { id: "swordMastery", tier: "easy", icon: "⚔️", name: "Sword Mastery", desc: "Sword damage +2 this floor.",
        apply(c) { c.tempSwordDmg += 2; } },
      { id: "starBurst", tier: "easy", icon: "⭐", name: "Star Burst", desc: "Star damage +2 this floor.",
        apply(c) { c.tempStarDmg = (c.tempStarDmg || 0) + 2; } },
      { id: "ironSkin", tier: "easy", icon: "🛡️", name: "Iron Skin", desc: "+5 max HP this floor.",
        apply(c) { c.playerMaxHp += 5; c.playerHp = Math.min(c.playerMaxHp, c.playerHp + 5); } },
      { id: "timeRush", tier: "hard", icon: "⏱️", name: "Time Rush", desc: "Enemy specials & ults charge 40% faster.",
        apply(c) { c.enemySpeedMult = 0.6; } },
      { id: "glassCannon", tier: "hard", icon: "💥", name: "Glass Cannon", desc: "Player damage +50%, healing -50%.",
        apply(c) { c.glassCannon = true; } },
      { id: "shieldWeakness", tier: "hard", icon: "🛡️", name: "Shield Weakness", desc: "Shield cap reduced to 8.",
        apply(c) { c.shieldCapOverride = 8; } },
      { id: "armorPlating", tier: "easy", icon: "🛡️", name: "Armor Plating", desc: "+2 shield per match.",
        apply(c) { c.armorPlating = (c.armorPlating || 0) + 2; } },
      { id: "cascadeBoost", tier: "easy", icon: "⚡", name: "Cascade Boost", desc: "Cascade damage +50%.",
        apply(c) { c.cascadeDamageMult = 1.5; } }
    ];

    function pickDistinct(pool, n, taken) {
      const available = pool.filter(e => !taken.has(e.id));
      const out = [];
      while (out.length < n && available.length) {
        const i = Math.floor(Math.random() * available.length);
        out.push(available.splice(i, 1)[0]);
      }
      return out;
    }

    // Regular floors: 2 Commons + 1 Uncommon (that top slot rolls Rare ~40%)
    function buildFloorRewardChoices() {
      const taken = new Set();
      if (run.pendingModifierRare) {
        run.pendingModifierRare = false;
        const rares = pickDistinct(FLOOR_REWARDS_RARE, 2, taken);
        const extra = pickDistinct(FLOOR_REWARDS_UNCOMMON, 1, taken);
        return [...rares, ...extra];
      }
      const commons = pickDistinct(FLOOR_REWARDS_COMMON, 2, taken);
      const topIsRare = Math.random() < 0.4;
      const topPool = topIsRare ? FLOOR_REWARDS_RARE : FLOOR_REWARDS_UNCOMMON;
      const top = pickDistinct(topPool, 1, taken)[0];
      return [top, ...commons];
    }

    // Elite floors: both Rares + 1 Uncommon for the temp perk
    function buildEliteTempChoices() {
      const taken = new Set();
      const rares = pickDistinct(FLOOR_REWARDS_RARE, FLOOR_REWARDS_RARE.length, taken);
      const extra = pickDistinct(FLOOR_REWARDS_UNCOMMON, 1, taken)[0];
      return [...rares, extra];
    }

    // Gauntlet floors: small permanent stat (paired with the Rare temp perk)
    const GAUNTLET_REWARDS = {
      4: { label: "+4 Max Shield", apply: () => { run.bonusShieldMax += 4; } },
      9: { label: "+1 Max AP", apply: () => { run.bonusApMax += 1; AP_MAX = 3 + run.bonusApMax; } },
      14: { label: "+8 Max HP", apply: () => { run.bonusMaxHp += 8; } },
      19: { label: "+5 Max Shield", apply: () => { run.bonusShieldMax += 5; } }
    };

    // Unique boss kits (floor → definition)
    const BOSS_KITS = {
      5:  { id: "bracken", name: "Bracken the Rootbound", persona: "bruiser", bias: { sword: 1.5 }, ultName: "Root Snare", ultTurns: 4,
            ultFn: () => { combat.blindNext = true; dealDamageToPlayer(Math.round(enemyAtkForFloor(run.floor) * 1.4)); setLog("Root Snare · blind + heavy hit"); } },
      10: { id: "cinder", name: "Cinder Queen", persona: "viper", bias: { star: 1.5, sword: 1.2 }, ultName: "Ashstorm", ultTurns: 4,
            ultFn: () => { combat.poisonTurns = Math.max(combat.poisonTurns, 3); flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison"); dealDamageToPlayer(Math.round(enemyAtkForFloor(run.floor) * 1.5)); setLog("Ashstorm · poison 3t + burst"); } },
      15: { id: "ironjaw", name: "Ironjaw the Unbroken", persona: "mender", bias: { shield: 2.0 }, ultName: "Shield Wall", ultTurns: 5,
            ultFn: () => { combat.enemyShield = Math.min(30, combat.enemyShield + 12); dealDamageToPlayer(Math.round(enemyAtkForFloor(run.floor) * 1.2)); setLog("Shield Wall · +12 shield + strike"); } },
      // The Last Rival = dark Knight kit: Regen 3/turn + Fracture on hit + Earthshatter ult
      20: { id: "lastrival", name: "The Last Rival", persona: "mender", bias: { hp: 1.8, shield: 1.3 }, ultName: "Earthshatter", ultTurns: 5,
            passive: "Regenerates 3 HP each turn · every hit applies Fracture (2 true dmg per stack at your turn start)",
            ultDesc: "Massive hit + Mortal Wound (your healing -50% for 2 turns)",
            turnStart: () => { if (combat.enemyHp > 0) healEnemy(3); },
            ultFn: () => {
              const d = Math.round(enemyAtkForFloor(run.floor) * 1.8);
              combat.playerMortalWoundTurns = Math.max(combat.playerMortalWoundTurns, 2);
              dealDamageToPlayer(d);
              setLog("Earthshatter", `Earthshatter · ${d} dmg + Mortal Wound 2t`);
            } }
    };

    function enemyHpForFloor(f) {
      let hp = Math.round(45 + 14 * f + 0.45 * (f - 1) * (f - 1));
      if (BOSS_REWARDS[f]) hp = Math.round(hp * 1.35);
      if (GAUNTLET_REWARDS[f]) hp = Math.round(hp * 1.2);
      return hp;
    }

    function enemyAtkForFloor(f) {
      return Math.max(3, Math.round(settings.enemyAtk + (f - 1) * 0.9 + 0.04 * (f - 1) * (f - 1)));
    }

    const combat = {
      turn: 1,
      playerHp: BASE_HP,
      playerMaxHp: BASE_HP,
      enemyHp: BASE_HP,
      enemyMaxHp: BASE_HP,
      enemyShield: 0,
      shield: 0,
      ult: 0,
      ultMax: 5,
      sigBank: 0,
      ap: AP_MAX,
      enemyAp: AP_MAX,
      playerClass: "ninja",
      enemyClass: "enemy",
      playerTurn: true,
      // status flags
      empowerNext: false,
      blindNext: false,
      weakenNextSword: false,
      poisonTurns: 0,
      enemyPoisonTurns: 0,
      // hero-specific
      firstHitDodged: false,   // ninja
      afterglowTurns: 0,       // ninja ult
      markStacks: 0,           // ninja cross
      fractureStacks: 0,       // knight
      fractureTurns: 0,
      mortalWoundTurns: 0,     // knight ult
      knightDeathSaveUsed: false, // knight passive: Iron Will
      manaLockTurns: 0,        // wizard cross
      reflectPct: 0.3,         // wizard passive
      // mirrored-kit enemy statuses
      enemyVeilUsed: false,          // Umbral Herald (dark ninja) veil
      enemyAfterglowTurns: 0,        // Umbral Herald afterglow
      playerFractureStacks: 0,       // The Last Rival (dark knight) fracture on player
      playerFractureTurns: 0,
      playerMortalWoundTurns: 0,     // The Last Rival mortal wound on player
      enemyName: "Rival",
      enemyFullName: "Rival",
      bossKit: null,
      eliteKit: null,
      enemyArchetype: null,
      enemyUltCharge: 0,
      enemyUltNeed: 4,
      // log (last 4 for modal; board shows 2-line clamp)
      logHistory: [],
      ultAnnounced: false,
      lastPhase: "normal",
      tempSwordDmg: 0,
      enemySpecialCharge: 0,
      enemySpecialNeed: 4,
      enemyWeakenTurns: 0,
      _bulwarkUsed: false,
      // Poison / Acid stacks
      poisonStacks: 0,
      acidStacks: 0
    };

    // Track unused AP bonus from previous turn
    let unusedApBonus = 0;
