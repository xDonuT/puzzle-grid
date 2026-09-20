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
        <path fill="currentColor" d="M6.5 8.4c0-2 1.6-3.6 3.6-3.6h3.8c2 0 3.6 1.6 3.6 3.6V10c0 2-1.6 3.6-3.6 3.6h-3.8c-2 0-3.6-1.6-3.6-3.6V8.4z"/>
        <rect fill="#222a36" x="10.3" y="9" width="3.4" height="1.6" rx="0.5"/>
        <rect fill="#7db0e0" x="10.85" y="9.25" width="2.3" height="1.1" rx="0.5"/>
        <path fill="currentColor" d="M5.4 19.8c0.2-3.2 2.9-5.4 6.6-5.4s6.4 2.2 6.6 5.4z"/>
        <circle fill="#222a36" cx="12" cy="18" r="1.7"/>
        <circle fill="#7db0e0" cx="12" cy="18" r="0.7"/>
      </svg>`,
      skull: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M8 7.6c0-2.1 1.8-3.9 4-3.9s4 1.8 4 3.9c0 1.4-0.7 2.6-1.8 3.3v1.8H9.8v-1.8C8.7 10.2 8 9 8 7.6z"/>
        <rect fill="currentColor" x="8" y="12.8" width="8" height="3.1" rx="1.2"/>
        <rect fill="#33261d" x="8.1" y="15.9" width="7.8" height="1.6" rx="0.8"/>
        <circle fill="#33261d" cx="9.9" cy="8.7" r="0.9"/>
        <circle fill="#33261d" cx="14.1" cy="8.7" r="0.9"/>
        <path fill="#33261d" d="M10.6 12.3c0.4 0.3 0.9 0.4 1.4 0.4s1-0.1 1.4-0.4l-1.4-1.2-1.4 1.2z"/>
      </svg>`,
      thorn: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 4.5l2.5 3.8h3.2l-2.6 2.8 1 3.6L12 12.8l-4.1 1.9 1-3.6-2.6-2.8h3.2z"/>
        <circle fill="#3a2a1a" cx="10.8" cy="8.4" r="0.6"/>
        <circle fill="#3a2a1a" cx="13.2" cy="8.4" r="0.6"/>
        <path fill="currentColor" d="M8.5 14.8l-1.5 4.2h2.8l1.2-3.4z"/>
        <path fill="currentColor" d="M15.5 14.8l1.5 4.2h-2.8l-1.2-3.4z"/>
        <path fill="currentColor" d="M11.5 15.2l-0.5 3.8h2l-0.5-3.8z"/>
      </svg>`,
      wisp: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 3c1.5 0 2.8 1.2 2.8 2.8 0 0.8-0.3 1.5-0.9 2l0.9 2.2h-5.6l0.9-2.2c-0.6-0.5-0.9-1.2-0.9-2C9.2 4.2 10.5 3 12 3z"/>
        <path fill="currentColor" d="M7.5 8c-1.5 0.5-2.5 2-2.5 3.5s0.8 2.8 2 3.5l1.5-2.5z"/>
        <path fill="currentColor" d="M16.5 8c1.5 0.5 2.5 2 2.5 3.5s-0.8 2.8-2 3.5l-1.5-2.5z"/>
        <path fill="currentColor" d="M12 15.5c-1.5 0-2.8-1.2-2.8-2.8 0-0.8 0.3-1.5 0.9-2l-0.9-2.2h5.6l-0.9 2.2c0.6 0.5 0.9 1.2 0.9 2C14.8 14.3 13.5 15.5 12 15.5z"/>
        <circle fill="#3a2a1a" cx="10.8" cy="10" r="0.6"/>
        <circle fill="#3a2a1a" cx="13.2" cy="10" r="0.6"/>
      </svg>`,
      root: `<svg viewBox="0 0 24 24" aria-hidden="true">
        <ellipse fill="currentColor" cx="12" cy="10" rx="4" ry="3"/>
        <path fill="currentColor" d="M8 12c-1 1.5-2 3-3 5 1.5-0.5 2.5-0.5 3.5 0 0.5-1.5 1-3 0.5-5z"/>
        <path fill="currentColor" d="M16 12c1 1.5 2 3 3 5-1.5-0.5-2.5-0.5-3.5 0-0.5-1.5-1-3-0.5-5z"/>
        <path fill="currentColor" d="M10 13c-0.5 2-1 3.5-1.5 5.5 1-0.3 1.5-0.3 2 0 0.3-1.5 0.5-3 0-5.5z"/>
        <path fill="currentColor" d="M14 13c0.5 2 1 3.5 1.5 5.5-1-0.3-1.5-0.3-2 0-0.3-1.5-0.5-3 0-5.5z"/>
        <circle fill="#3a2a1a" cx="10.8" cy="9.5" r="0.6"/>
        <circle fill="#3a2a1a" cx="13.2" cy="9.5" r="0.6"/>
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
          <!-- arms: right reaches to the blade/hilt, left rests -->
          <path stroke="#c96b52" stroke-width="2.1" stroke-linecap="round" d="M15.1 15.7L18.6 18.3"/>
          <circle fill="#b85a3f" cx="19" cy="18.6" r="1.2"/>
          <path stroke="#c96b52" stroke-width="2.1" stroke-linecap="round" d="M8.9 15.7L7.6 18.2"/>
          <circle fill="#b85a3f" cx="7.4" cy="18.4" r="1.0"/>
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
          <!-- arms: right raises to grip the staff, left rests -->
          <path stroke="#9b7ec8" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" d="M15.2 15.6L18.4 15.9L20 13.1"/>
          <circle fill="#d4c8e8" cx="20.3" cy="13.2" r="1.15"/>
          <path stroke="#9b7ec8" stroke-width="2.1" stroke-linecap="round" d="M8.8 15.7L7.5 18.2"/>
          <circle fill="#d4c8e8" cx="7.3" cy="18.4" r="1.0"/>
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
          <!-- arms: left braces against the shield, right rests -->
          <path stroke="#9fb4cc" stroke-width="2.1" stroke-linecap="round" d="M8.7 15.6L6.3 13.4"/>
          <circle fill="#b8cce0" cx="6.1" cy="13.2" r="1.15"/>
          <path stroke="#9fb4cc" stroke-width="2.1" stroke-linecap="round" d="M15.3 15.6L16.4 18.3"/>
          <circle fill="#b8cce0" cx="16.6" cy="18.5" r="1.05"/>
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
      slime:    { name: "Dewdrop",   role: "eslime",    svg: MONSTER_SVG.slime },
      bat:      { name: "Moth",      role: "ebat",      svg: MONSTER_SVG.bat },
      mush:     { name: "Fungling", role: "emush",     svg: MONSTER_SVG.mush },
      golem:    { name: "Mudwarden", role: "egolem",    svg: MONSTER_SVG.golem },
      skull:    { name: "Husk",      role: "eskull",    svg: MONSTER_SVG.skull },
      thorn:    { name: "Bramble",   role: "ethorn",    svg: MONSTER_SVG.thorn },
      wisp:     { name: "Petalwisp", role: "ewisp",     svg: MONSTER_SVG.wisp },
      root:     { name: "Rootling",  role: "eroot",     svg: MONSTER_SVG.root },

      // ---- Elite recolors (same shapes, themed palette) ----
      bracken:    { name: "Bracken",    role: "c-bracken",    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- mossy boulder body -->
          <path fill="currentColor" d="M6.2 15.6c0.3-3.2 2.4-5.4 5.8-5.4s5.5 2.2 5.8 5.4l0.3 4.8H6z"/>
          <!-- hanging root tendrils -->
          <path fill="#4a6a2e" d="M5.4 20.4c-0.6-1.8-0.7-3.6-0.3-5.3 0.7 1.5 1.7 2.7 2.8 3.6-0.4 0.7-1.3 1.2-2.5 1.7z"/>
          <path fill="#57763c" d="M18.6 20.4c0.6-1.8 0.7-3.6 0.3-5.3-0.7 1.5-1.7 2.7-2.8 3.6 0.4 0.7 1.3 1.2 2.5 1.7z"/>
          <path fill="#4a6a2e" d="M8 20.5c-0.5-1.5-0.6-3-0.2-4.4 0.5 1.1 1.3 2 2.3 2.7-0.4 0.6-1.2 1.1-2.1 1.7z"/>
          <path fill="#57763c" d="M16 20.5c0.5-1.5 0.6-3 0.2-4.4-0.5 1.1-1.3 2-2.3 2.7 0.4 0.6 1.2 1.1 2.1 1.7z"/>
          <!-- chest moss rune -->
          <circle fill="#3f5a2a" cx="12" cy="18.4" r="1.7"/>
          <circle fill="#c8e99a" cx="12" cy="18.4" r="0.6"/>
          <!-- head: moss boulder -->
          <path fill="currentColor" d="M7 10.4c0-2.1 1.6-3.7 3.7-3.7h2.6c2.1 0 3.7 1.6 3.7 3.7v0.6c0 2.1-1.6 3.7-3.7 3.7h-2.6c-2.1 0-3.7-1.6-3.7-3.7v-0.6z"/>
          <!-- crest moss -->
          <path fill="#4a6a2e" d="M8.7 6.7C8.4 5 9.2 3.6 10.8 2.5c-0.1 1.3 0.4 2.3 1.4 3z"/>
          <path fill="#57763c" d="M15.3 6.7C15.6 5 14.8 3.6 13.2 2.5c0.1 1.3-0.4 2.3-1.4 3z"/>
          <!-- eyes -->
          <path fill="#2a4a20" d="M9.3 9.1h1.6v1.6H9.3z"/>
          <path fill="#2a4a20" d="M13.1 9.1h1.6v1.6h-1.6z"/>
          <circle fill="#d8f0a8" cx="10.1" cy="9.9" r="0.55"/>
          <circle fill="#d8f0a8" cx="13.9" cy="9.9" r="0.55"/>
        </svg>` },
      cinder:     { name: "Squall",     role: "c-cinder",     svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- icy sparkle -->
          <path fill="#bcd6f0" d="M6.8 5.6 L7.1 6.5 L8 6.8 L7.1 7.1 L6.8 8 L6.5 7.1 L5.6 6.8 L6.5 6.5 Z"/>
          <!-- golden crown -->
          <path fill="#f2c14e" d="M9 7.4 L9 4.2 L11 6 L12 3.4 L13 6 L15 4.2 L15 7.4 Z"/>
          <rect fill="#f2c14e" x="9" y="7.4" width="6" height="1.3" rx="0.5"/>
          <circle fill="#d64545" cx="12" cy="8.05" r="0.45"/>
          <!-- face -->
          <rect fill="currentColor" x="9.3" y="8.7" width="5.4" height="4.8" rx="2.2"/>
          <circle fill="#3a2a44" cx="10.7" cy="10.6" r="0.7"/>
          <circle fill="#3a2a44" cx="13.3" cy="10.6" r="0.7"/>
          <circle fill="#fff" cx="10.9" cy="10.3" r="0.24"/>
          <circle fill="#fff" cx="13.5" cy="10.3" r="0.24"/>
          <path fill="#7a3a22" d="M11 12.6c0.5 0.45 1.5 0.45 2 0"/>
          <!-- flowing gown -->
          <path fill="currentColor" d="M9.2 12.9 L14.8 12.9 c0.3 1.5 0.4 2.6 0.45 3.6 c0.15 1.9 0.45 3.1 1.35 3.8 c-1.3 0.9 -3 1.35 -4.6 1.35 c-1.6 0 -3.3-0.45 -4.6-1.35 c0.9-0.7 1.2-1.9 1.35-3.8 c0.05-1 0.15-2.1 0.45-3.6 Z"/>
          <!-- gold bodice trim -->
          <path fill="#f2c14e" d="M10.2 12.7h3.6l-0.6 1.2h-2.4z"/>
          <!-- arms: right holds a golden orb -->
          <path stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M15.1 16.2 L17.2 15"/>
          <circle fill="#f2c14e" cx="17.7" cy="14.4" r="1.25"/>
          <circle fill="#ffe89a" cx="17.5" cy="14.2" r="0.45"/>
          <path stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M8.9 16.2 L7.4 17.7"/>
        </svg>` },
      ironjaw:    { name: "Ironjaw",    role: "c-ironjaw",    svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- jagged iron horns -->
          <path fill="currentColor" d="M5.9 7.7 L5 3.6 L7.7 6.1 L8.3 7.7 Z"/>
          <path fill="currentColor" d="M18.1 7.7 L19 3.6 L16.3 6.1 L15.7 7.7 Z"/>
          <!-- helm -->
          <rect fill="currentColor" x="6.9" y="6.4" width="10.2" height="10.6" rx="3"/>
          <!-- riveted iron brow -->
          <rect fill="#565c64" x="6.9" y="6.9" width="10.2" height="1.7" rx="0.85"/>
          <circle fill="#394047" cx="8.4" cy="7.8" r="0.4"/>
          <circle fill="#394047" cx="15.6" cy="7.8" r="0.4"/>
          <!-- glowing visor slit -->
          <rect fill="#394047" x="10.3" y="9.2" width="3.4" height="1.4" rx="0.7"/>
          <rect fill="#f0b048" x="11.1" y="9.6" width="1.8" height="0.6" rx="0.3"/>
          <!-- iron jaw plate -->
          <path fill="#394047" d="M8.2 15.2 L15.8 15.2 L15.3 18.4 L8.7 18.4 Z"/>
          <path fill="#7d838b" d="M9.3 16.6 L9.9 16.6 L9.6 18.2 L9 18.2 Z"/>
          <path fill="#7d838b" d="M11.4 16.6 L12.6 16.6 L12.6 18.2 L11.4 18.2 Z"/>
          <path fill="#7d838b" d="M14.1 16.6 L14.7 16.6 L15 18.2 L14.4 18.2 Z"/>
          <!-- shoulders / torso -->
          <path fill="currentColor" d="M6.3 16.6 C7.5 18.6 9.6 20.4 12 20.4 C14.4 20.4 16.5 18.6 17.7 16.6 L18.6 21.4 L5.4 21.4 Z"/>
          <circle fill="#394047" cx="8.1" cy="17.9" r="0.55"/>
          <circle fill="#394047" cx="15.9" cy="17.9" r="0.55"/>
          <circle fill="#394047" cx="12" cy="19.6" r="1.5"/>
          <circle fill="#f0b048" cx="12" cy="19.6" r="0.7"/>
        </svg>` },
      bloodroot:  { name: "Bloodroot",  role: "c-bloodroot",  svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- petal thorns -->
          <path fill="#7a3333" d="M8.3 5.6 L6.9 3.4 L9.2 4.9 Z"/>
          <path fill="#7a3333" d="M15.7 5.6 L17.1 3.4 L14.8 4.9 Z"/>
          <path fill="#7a3333" d="M11 3.2 L12 1.3 L13 3.2 Z"/>
          <!-- bloom head -->
          <circle fill="currentColor" cx="12" cy="9.2" r="5.4"/>
          <!-- side thorns -->
          <path fill="#7a3333" d="M6.7 12.6 L5 13.9 L7.1 13.4 Z"/>
          <path fill="#7a3333" d="M17.3 12.6 L19 13.9 L16.9 13.4 Z"/>
          <!-- eyes -->
          <circle fill="#f6ecd9" cx="9.9" cy="7.6" r="1"/>
          <circle fill="#4d1f1f" cx="9.9" cy="7.6" r="0.5"/>
          <circle fill="#f6ecd9" cx="14.1" cy="7.6" r="1"/>
          <circle fill="#4d1f1f" cx="14.1" cy="7.6" r="0.5"/>
          <!-- hungry mouth -->
          <ellipse fill="#4d1f1f" cx="12" cy="10.6" rx="2.5" ry="1.9"/>
          <path fill="#f6ecd9" d="M10.3 9.4 L10.9 10.4 L11.5 9.35 Z"/>
          <path fill="#f6ecd9" d="M11.7 9.3 L12.2 10.4 L12.7 9.3 Z"/>
          <path fill="#f6ecd9" d="M12.9 9.4 L13.5 10.4 L14.1 9.35 Z"/>
          <!-- stem -->
          <path stroke="currentColor" stroke-width="1.7" stroke-linecap="round" d="M12 14.6 L12 17.6"/>
          <!-- root tendrils -->
          <path stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none" d="M12 17.6 C10 18 8.6 19.2 8.3 21"/>
          <path stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none" d="M12 17.6 C14 18 15.4 19.2 15.7 21"/>
          <!-- blood drips -->
          <circle fill="#7a3333" cx="6.2" cy="18.4" r="0.6"/>
          <circle fill="#7a3333" cx="17.8" cy="18.8" r="0.6"/>
        </svg>` },
      stormglass: { name: "Stormglass", role: "c-stormglass", svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- crackle sparks -->
          <path fill="#d8f4ff" d="M7.6 5.6 L8 6.4 L8.8 6.8 L8 7.2 L7.6 8 L7.2 7.2 L6.4 6.8 L7.2 6.4 Z"/>
          <path fill="#d8f4ff" d="M16.4 5.6 L16 6.4 L15.2 6.8 L16 7.2 L16.4 8 L16.8 7.2 L17.6 6.8 L16.8 6.4 Z"/>
          <!-- side shards (behind) -->
          <path fill="#2c6f8c" d="M7.2 9.4 L5.4 16.2 L9.2 16.2 Z"/>
          <path fill="#2c6f8c" d="M16.8 9.4 L18.6 16.2 L14.8 16.2 Z"/>
          <!-- left shard -->
          <path fill="currentColor" d="M9.4 7.6 L8 16.2 L11.2 16.2 Z"/>
          <path fill="#2c6f8c" d="M9.4 7.6 L9.6 16.2 L8 16.2 Z"/>
          <!-- right shard -->
          <path fill="currentColor" d="M14.6 7.6 L16 16.2 L12.8 16.2 Z"/>
          <path fill="#2c6f8c" d="M14.6 7.6 L14.4 16.2 L16 16.2 Z"/>
          <!-- center shard -->
          <path fill="currentColor" d="M12 3.8 L9.8 16.2 L14.2 16.2 Z"/>
          <path fill="#7cd4ec" d="M12 3.8 L10.4 16.2 L9.8 16.2 Z"/>
          <path fill="#2c6f8c" d="M12 3.8 L14 16.2 L14.2 16.2 Z"/>
          <!-- bolt over core -->
          <path fill="#ffd23f" d="M12.8 10.6 L11.4 13.3 L12.4 13.3 L11.1 15.9 L13.3 12.7 L12.3 12.7 Z"/>
          <circle fill="#fff7c0" cx="10.3" cy="14.6" r="1.1"/>
          <circle fill="#ffd23f" cx="10.3" cy="14.6" r="0.55"/>
        </svg>` },
      nightcoil:  { name: "Thorncoil",  role: "c-nightcoil",  svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- thorn spikes -->
          <path fill="#3e355a" d="M10.9 5.3 L12 3.4 L13.1 5.3 Z"/>
          <path fill="#3e355a" d="M8.4 10.6 L6.3 9.7 L8.7 11.6 Z"/>
          <path fill="#3e355a" d="M15.6 10.6 L17.7 9.7 L15.3 11.6 Z"/>
          <!-- cobra hood -->
          <path fill="currentColor" d="M8.4 6.4 C8.4 5 9.5 4.2 12 4.2 C14.5 5 15.6 6.4 L15.6 12.4 C15.6 14.3 14 15.5 12 15.5 C10 15.5 8.4 14.3 8.4 12.4 Z"/>
          <!-- head -->
          <ellipse fill="currentColor" cx="12" cy="8" rx="2.5" ry="1.8"/>
          <!-- eyes -->
          <circle fill="#b6a8e0" cx="10.8" cy="7.4" r="0.75"/>
          <circle fill="#3e355a" cx="10.8" cy="7.4" r="0.32"/>
          <circle fill="#b6a8e0" cx="13.2" cy="7.4" r="0.75"/>
          <circle fill="#3e355a" cx="13.2" cy="7.4" r="0.32"/>
          <!-- fangs -->
          <path fill="#b6a8e0" d="M10.9 9.6 L11.2 8.7 L11.5 9.6 Z"/>
          <path fill="#b6a8e0" d="M12.5 9.6 L12.8 8.7 L13.1 9.6 Z"/>
          <!-- forked tongue -->
          <path stroke="#c9a0de" stroke-width="1" stroke-linecap="round" fill="none" d="M12 9.3 L12 6.6 M12 6.6 L10.9 5.9 M12 6.6 L13.1 5.9"/>
          <!-- coil masses -->
          <path fill="currentColor" d="M7.6 14.8 C7.6 17.3 9.5 18.9 12 18.9 C14.5 18.9 16.4 17.3 16.4 14.8 Z"/>
          <path fill="currentColor" d="M6.2 18.7 C6.2 20.7 8.7 21.8 12 21.8 C15.3 21.8 17.8 20.7 17.8 18.7 Z"/>
          <!-- poison scales -->
          <circle fill="#8fd697" cx="7.2" cy="16.6" r="0.55"/>
          <circle fill="#8fd697" cx="16.8" cy="16.6" r="0.55"/>
          <circle fill="#8fd697" cx="10" cy="20.6" r="0.5"/>
          <circle fill="#8fd697" cx="14" cy="20.6" r="0.5"/>
          <!-- poison drips -->
          <path fill="#8fd697" d="M6.9 22 L6.6 21.2 L6.3 22 C6.1 22.5 6.4 22.9 6.9 22.9 C7.4 22.9 7.7 22.5 7.5 22 Z"/>
          <path fill="#8fd697" d="M17.1 22 L16.8 21.2 L16.5 22 C16.3 22.5 16.6 22.9 17.1 22.9 C17.6 22.9 17.9 22.5 17.7 22 Z"/>
        </svg>` },
      ashcrown:   { name: "Ashcrown",   role: "c-ashcrown",   svg: `<svg viewBox="0 0 24 24" aria-hidden="true">
          <!-- ashen crown -->
          <path fill="#4d483f" d="M8.2 6.8 L8.2 3.8 L10.2 5.1 L10.8 3.2 L12 4.9 L13.2 3.2 L13.8 5.1 L15.8 3.8 L15.8 6.8 Z"/>
          <path fill="#4d483f" d="M8.2 6.8 L15.8 6.8 L15.4 7.8 L8.6 7.8 Z"/>
          <!-- skull dome -->
          <rect fill="currentColor" x="8" y="7.6" width="8" height="6.4" rx="3"/>
          <!-- ash cracks -->
          <path stroke="#8a8070" stroke-width="0.9" stroke-linecap="round" fill="none" d="M9 10.6 L10 10.1 M9.2 11.4 L10.2 11"/>
          <path stroke="#8a8070" stroke-width="0.9" stroke-linecap="round" fill="none" d="M15 10.6 L14 10.1 M14.8 11.4 L13.8 11"/>
          <!-- ember eyes -->
          <circle fill="#ffe9a6" cx="10.1" cy="9" r="1"/>
          <circle fill="#ff9a3c" cx="10.1" cy="9" r="0.5"/>
          <circle fill="#ffe9a6" cx="13.9" cy="9" r="1"/>
          <circle fill="#ff9a3c" cx="13.9" cy="9" r="0.5"/>
          <!-- nose -->
          <path fill="#3c3a33" d="M11.5 10.4 h1 l-0.5 1.1 Z"/>
          <!-- jaw + teeth -->
          <rect fill="currentColor" x="8.2" y="13.6" width="7.6" height="3.2" rx="1.4"/>
          <rect fill="#3c3a33" x="8.5" y="15.6" width="7" height="1.3" rx="0.65"/>
          <!-- ash embers -->
          <circle fill="#ff9a3c" cx="5.6" cy="13.6" r="0.6"/>
          <circle fill="#ff9a3c" cx="18.4" cy="13.6" r="0.6"/>
          <circle fill="#ff9a3c" cx="6.4" cy="17.6" r="0.45"/>
          <circle fill="#ff9a3c" cx="17.6" cy="17.6" r="0.45"/>
        </svg>` },

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
        shield:     { name: "Shield", svg: `<path fill="#7e92ae" d="M5.2 7.6c2.1 0 3.8 1.6 3.8 3.8v4c0 2.2-1.7 3.8-3.8 3.8S1.4 17.6 1.4 15.4v-4c0-2.2 1.7-3.8 3.8-3.8z"/><path fill="#9fb4cc" d="M5.2 8.4c1.7 0 3 1.3 3 3v2.9c0 1.7-1.3 3-3 3s-3-1.3-3-3v-2.9c0-1.7 1.3-3 3-3z"/><path fill="#ccd4de" d="M4.2 11.9h2v2.7h-2z"/><circle fill="#b8cce0" cx="3.5" cy="10.3" r="0.55"/>` },
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
    // AP_MAX/BASE_HP/MAX_FLOOR are shared constants now defined in settings.js.
    const ENEMY_NAMES = [
      "Gale", "Bramble", "Frost", "Mist", "Sleet",
      "Jinx", "Clover", "Willow", "Burr", "Quill",
      "Pebble", "Puff", "Moss", "Nimbo", "Poppy",
      "Petal", "Thistle", "Iris", "Sprig", "Thorn",
      "Vex", "Wisp", "Xorn", "Yew", "Zephyr",
      "Wilt", "Cask", "Drift", "Dew", "Rain"
    ];

    function randomEnemyName(type) {
      // Nicknames matched to the mob's shape so a mushroom never gets a flower's name
      const BY_TYPE = {
        slime: ["Dew", "Rain", "Mist", "Drizzle", "Puddle", "Sprinkle"],
        bat:   ["Flit", "Wisp", "Glimmer", "Dusk", "Moonwing", "Flutter"],
        mush:  ["Puff", "Spore", "Morel", "Bracket", "Toadstool", "Truffle"],
        golem: ["Pebble", "Clod", "Loam", "Boulder", "Sod", "Mossy"],
        skull: ["Wilt", "Thorn", "Rattle", "Dryleaf", "Bramble", "Stub"],
        thorn: ["Spike", "Burr", "Briar", "Prickle", "Barb", "Nettle"],
        wisp:  ["Petal", "Bloom", "Flora", "Daisy", "Iris", "Poppy"],
        root:  ["Tendril", "Sprig", "Runner", "Fiber", "Rootlet", "Creeper"]
      };
      const pool = (type && BY_TYPE[type]) || ENEMY_NAMES;
      return pool[Math.floor(Math.random() * pool.length)];
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
      12: "bloodroot",
      15: "bracken",
      27: "stormglass",
      30: "cinder",
      42: "nightcoil",
      45: "lastrival"
    };
    const MONSTER_POOL = ["slime", "bat", "mush", "golem", "skull", "thorn", "wisp", "root"];

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
      12: { name: "Bloodroot", persona: "raider", bias: { sword: 1.8 }, hpMul: 1.55, atkMul: 1.3, passive: "Lifesteal on hit",
            onHit: () => { healEnemy(4); } },
      27: { name: "Stormglass", persona: "viper", bias: { star: 1.8 }, hpMul: 1.45, atkMul: 1.4, passive: "Chain shock (extra poke)",
            onHit: () => { dealDamageToPlayer(Math.max(2, Math.round(enemyAtkForFloor(run.floor) * 0.35))); } },
      42: { name: "Thorncoil", persona: "bruiser", bias: { sword: 1.6 }, hpMul: 1.5, atkMul: 1.25, passive: "Applies poison + weaken",
            onHit: () => {
              combat.poisonTurns = Math.max(combat.poisonTurns || 0, 2);
              flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison");
              if (Math.random() < 0.5) combat.weakenNextSword = true;
            } }
    };

    // ---- Common enemy passives ----
    const COMMON_PASSIVES = {
      slime:  { name: "Water Shield",  desc: "When hit, gains 1 shield",
                onHit: () => { combat.enemyShield = Math.min(settings.shieldMax, combat.enemyShield + 1); } },
      bat:    { name: "Flutter",       desc: "25% chance to dodge your match",
                onMatch: () => Math.random() < 0.25 },
      mush:   { name: "Spore",         desc: "Attacks apply 1 poison",
                onAttack: () => { combat.poisonTurns = Math.max(combat.poisonTurns, 1); flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison"); } },
      golem:  { name: "Thick Skin",    desc: "Takes 1 less damage from all sources",
                onDamaged: (dmg) => Math.max(1, dmg - 1) },
      skull:  { name: "Desiccated",    desc: "Attacks strip 2 shield first",
                onAttack: () => { if (combat.shield > 0) { const s = Math.min(2, combat.shield); combat.shield -= s; } } },
      thorn:  { name: "Thorns",        desc: "Reflects 1 damage when hit",
                onHit: () => { dealDamageToPlayer(1, { noFracture: true }); } },
      wisp:   { name: "Drift",         desc: "At turn start, shifts one random tile",
                onTurnStart: () => { if (typeof board !== "undefined" && typeof ROWS !== "undefined") { const r = Math.floor(Math.random() * ROWS); const c = Math.floor(Math.random() * COLS); const c2 = (c + 1) % COLS; const tmp = board[r][c]; board[r][c] = board[r][c2]; board[r][c2] = tmp; const ts = specials[r][c]; specials[r][c] = specials[r][c2]; specials[r][c2] = ts; const tst = tileStatus[r] && tileStatus[r][c]; if (tileStatus[r]) { tileStatus[r][c] = tileStatus[r][c2]; tileStatus[r][c2] = tst; } rebuildVisual(); } } },
      root:   { name: "Sprout",        desc: "Heals 1 HP each turn",
                onTurnStart: () => { if (combat.enemyHp > 0) healEnemy(1); } },
    };

    function getCommonPassive(type) { return COMMON_PASSIVES[type] || null; }

    // ---- Enemy Signature Tiles ----
    // Each enemy has a fixed signature type. When they match it, they get a bonus.
    // The player can see this on the enemy portrait and race to deny those tiles.
    const ENEMY_SIGNATURES = {
      // Common enemies
      slime:  { primary: "star",   label: "Slippery" },
      bat:    { primary: "hp",     label: "Draining" },
      mush:   { primary: "star",   label: "Spreading" },
      golem:  { primary: "shield", label: "Fortified" },
      skull:  { primary: "sword",  label: "Rending" },
      thorn:  { primary: "sword",  label: "Piercing" },
      wisp:   { primary: "hp",     label: "Soothing" },
      root:   { primary: "shield", label: "Rooted" },
      // Elites (primary + secondary)
      bloodroot:  { primary: "sword",  secondary: "hp",     label: "Bloodthirst" },
      stormglass: { primary: "star",   secondary: "sword",  label: "Arcane Surge" },
      nightcoil:  { primary: "sword",  secondary: "star",   label: "Toxic Strike" },
      // Bosses — priority-based, resolved dynamically
      bracken:    { primary: "sword",  label: "Root Snare" },
      cinder:     { primary: "star",   label: "Ashstorm" },
      lastrival:  { primary: "sword",  label: "Earthshatter" }
    };

    // Get the enemy's current signature tile type (bosses adapt to player HP)
    function getEnemySignature() {
      const cls = combat.enemyClass;
      const kit = combat.bossKit || combat.eliteKit;
      const sig = ENEMY_SIGNATURES[cls];
      if (!sig) return { primary: "sword", label: "" };

      // Boss priority: adapt based on player HP
      if (combat.bossKit) {
        const hpPct = combat.playerHp / Math.max(1, combat.playerMaxHp);
        if (cls === "bracken") {
          // Bracken: sword when healthy, shield when low, hp when critical
          if (hpPct > 0.5) return { primary: "sword", label: "Aggressive" };
          if (hpPct > 0.2) return { primary: "shield", label: "Defensive" };
          return { primary: "hp", label: "Desperate Heal" };
        }
        if (cls === "cinder") {
          // Squall Queen: always star (pure offense)
          return { primary: "star", label: "Ashstorm" };
        }
        if (cls === "lastrival") {
          // Rival: mirrors player signature + adapts
          const playerSig = SIGNATURE[combat.playerClass] || "sword";
          if (hpPct > 0.6) return { primary: playerSig, label: "Mirroring" };
          if (hpPct > 0.3) return { primary: "shield", label: "Defensive" };
          return { primary: "hp", label: "Regrouping" };
        }
      }

      // Elites: primary, with secondary fallback if primary tiles are scarce on board
      if (combat.eliteKit && sig.secondary) {
        // Count available primary tiles on board
        let primaryCount = 0;
        for (let r = 0; r < ROWS; r++)
          for (let c = 0; c < COLS; c++)
            if (board[r][c] === sig.primary) primaryCount++;
        // If few primary tiles available, switch to secondary
        if (primaryCount < 4) return { primary: sig.secondary, label: "Adapting" };
      }

      return sig;
    }

    // Signature tile match bonus for enemies
    function applyEnemySignatureBonus(matchedList, shape) {
      const sig = getEnemySignature();
      if (!sig || !sig.primary) return;
      let sigCount = 0;
      for (const item of matchedList) {
        if (item.type === sig.primary) sigCount++;
      }
      if (sigCount === 0) return;

      const mult = shape.mult || 1;
      if (sig.primary === "sword" || sig.primary === "star") {
        // +40% damage from signature tile matches
        const bonus = Math.round(sigCount * 2 * mult * 0.4);
        if (bonus > 0) dealDamageToPlayer(bonus);
      } else if (sig.primary === "shield") {
        // +1 shield per 2 signature tiles
        const bonus = Math.floor(sigCount / 2);
        if (bonus > 0) combat.enemyShield = Math.min(settings.shieldMax, combat.enemyShield + bonus);
      } else if (sig.primary === "hp") {
        // +1 heal per signature tile
        if (sigCount > 0) healEnemy(sigCount);
      }
    }

    // Signature tile per class (charges ultimate)
    const SIGNATURE = {
      ninja: "sword",
      wizard: "shield",
      knight: "hp"
    };

    // Hero base stats & signature extras
    const HERO_STATS = {
      ninja:  { hp: 85,  startShield: 15, maxShieldCap: 15, name: "Ninja" },
      wizard: { hp: 100, startShield: 20, maxShieldCap: 20, name: "Wizard", reflectPct: 0.4 },
      knight: { hp: 120, startShield: 15, maxShieldCap: 15, name: "Knight" }
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
      lastFloorRewardOffered: [], // ids offered on the previous floor (avoid immediate repeats)
      floorShieldBonus: 0,
      feverEarly: 0,
      enemyUltSlow: 0,
      pending: { extraPick: 0, reroll: 0, bonusAp: 0, enemySlow: 0, shield: 0, swordBoost: 0, enemyPoison: 0, critChance: 0 },
      pendingModifier: null,
      pendingModifierRare: false,
      pendingModifierEasy: null,
      blessings: {},         // special -> chosen blessing id ("bloom"/"cross"/"x")
      shapeSkills: { star: null, cross: null, charged: null }, // shape -> chosen skill id (any class)
      act1Unlocks: [],       // remaining Act-1 tutorial unlocks {kind, id} (first 6 battle wins)
      elapsedMs: 0,
      floorElapsedMs: 0,
      gameMap: null,     // STS-style branching map
      currentAct: 1
    };

    // Boss floors are marked here (also drives boss HP scaling); rewards are now
    // chosen via the 3-card upgrade picker instead of fixed grants.
    const BOSS_FLOORS = new Set([15, 30, 45]);

    // Post-boss upgrade pool — each pick may be taken once per run.
    // name = card title · desc = short effect line
    const RUN_UPGRADES = [
      // ---- Generic (any class) — small, friendly, non-overlapping ----
      { id: "hp10", name: "❤️ +10 Max HP", desc: "Permanently boost your health", classRequirement: "ANY", act: 1, apply: () => { run.bonusMaxHp += 10; } },
      { id: "shield5", name: "🛡️ +5 Max Shield", desc: "Higher shield ceiling", classRequirement: "ANY", act: 1, apply: () => { run.bonusShieldMax += 5; } },
      { id: "healAmt", name: "💚 +2 Heal Amount", desc: "Potions heal more", classRequirement: "ANY", act: 1, apply: () => { run.bonusHeal += 2; } },
      { id: "ultCharge", name: "🔥 Faster Ult", desc: "Signature charge +1 per signature match", classRequirement: "ANY", act: 1, apply: () => { run.ultChargeBonus += 1; } },
      { id: "apCarry", name: "⚡ Extra Action", desc: "Unused AP carries over up to +2 next turn", classRequirement: "ANY", act: 2, apply: () => { run.momentum = true; } },
      { id: "boardWhisper", name: "🔄 Free Shuffle", desc: "1 free Shuffle each floor", classRequirement: "ANY", act: 2, apply: () => { run.boardWhisper = true; } },
      // ---- Ninja-specific skills ----
      { id: "poisonMaster", name: "☠️ Venomous", desc: "Sword matches can poison the enemy (30%)", classRequirement: "NINJA", act: 1, apply: () => { run.venomous = true; } },
      { id: "venomousBlade", name: "🗡️ Venomous Blade", desc: "Matches of 4+ Swords or cascades apply +2 Poison", classRequirement: "NINJA", act: 2, apply: () => { run.venomousBlade = true; } },
      { id: "miasmaReflex", name: "💨 Miasma Reflex", desc: "Dodging triggers 100% of Poison stacks as immediate damage", classRequirement: "NINJA", act: 3, apply: () => { run.miasmaReflex = true; } },
      // ---- Wizard-specific skills ----
      { id: "reflectBoost", name: "🪞 Arcane Mirror", desc: "Wizard reflect +10% (scales with floor)", classRequirement: "WIZARD", act: 2, apply: () => { run.arcaneMirror = true; } },
      { id: "acidicBarrier", name: "🧪 Acidic Barrier", desc: "Every 10 damage absorbed by Shield applies +1 Poison", classRequirement: "WIZARD", act: 2, apply: () => { run.acidicBarrier = true; } },
      { id: "contagionCatalyst", name: "☣️ Contagion Catalyst", desc: "Clearing a Mystery tile while Shielded doubles enemy Poison", classRequirement: "WIZARD", act: 3, apply: () => { run.contagionCatalyst = true; } },
      // ---- Knight-specific skills ----
      { id: "bulwark", name: "🛡️ Bulwark", desc: "Shield matches apply 1 Cracked stack (once per turn)", classRequirement: "KNIGHT", act: 1, apply: () => { run.bulwark = true; } },
      { id: "mortalStrike", name: "⚔️ Weaken", desc: "Ultimate also weakens enemy damage by 25% for 2 turns", classRequirement: "KNIGHT", act: 2, apply: () => { run.mortalStrike = true; } },
      { id: "corrosiveOverheal", name: "🩸 Corrosive Overheal", desc: "Excess healing converts to Acid stacks (1 per 5 HP)", classRequirement: "KNIGHT", act: 3, apply: () => { run.corrosiveOverheal = true; } },
      { id: "toxicFortitude", name: "🏰 Toxic Fortitude", desc: "Start of turn, gain Shield = 2× total (Poison + Acid) on rival", classRequirement: "KNIGHT", act: 3, apply: () => { run.toxicFortitude = true; } }
    ];

    // ===================== PASSIVE TREE SYSTEM =====================
    // 4 paths × 3 tiers per class. Boss wins: flat upgrade + passive pick.
    // Elite wins: passive pick only.
    const PASSIVE_TREES = [
      // ---- NINJA ----
      // Path: Shadow (speed/AP)
      { id: "shd1", path: "shadow", tier: 1, act: 1, cls: "NINJA", icon: "🗡️", name: "Swift Strikes", desc: "+1 max AP per turn.",
        apply() { run.bonusApMax += 1; AP_MAX = 3 + run.bonusApMax; } },
      { id: "shd2", path: "shadow", tier: 2, act: 2, cls: "NINJA", icon: "🗡️", name: "Cascade Master", desc: "Every cascade after the first refunds 1 AP.",
        apply() { run.cascadeAp = true; } },
      { id: "shd3", path: "shadow", tier: 3, act: 3, cls: "NINJA", icon: "🗡️", name: "Blitz", desc: "First match each turn costs 0 AP.",
        apply() { run.blitz = true; } },
      // Path: Venom (poison)
      { id: "vnw1", path: "venom", tier: 1, act: 1, cls: "NINJA", icon: "☠️", name: "Toxic Blade", desc: "Sword matches poison the enemy for 2 turns.",
        apply() { run.toxicBlade = true; } },
      { id: "vnw2", path: "venom", tier: 2, act: 2, cls: "NINJA", icon: "☠️", name: "Lethal Poison", desc: "Poison damage +1 per stack, duration +1.",
        apply() { run.lethalPoison = true; } },
      { id: "vnw3", path: "venom", tier: 3, act: 3, cls: "NINJA", icon: "☠️", name: "Plague", desc: "A poisoned enemy's death deals 10 splash to the next enemy.",
        apply() { run.plague = true; } },
      // Path: Blade (raw sword damage)
      { id: "bld1", path: "blade", tier: 1, act: 1, cls: "NINJA", icon: "🔪", name: "Sharp Edge", desc: "Sword damage +3.",
        apply() { run.bonusSwordDmg += 3; } },
      { id: "bld2", path: "blade", tier: 2, act: 2, cls: "NINJA", icon: "🔪", name: "Critical Edge", desc: "25% chance sword matches deal ×2.",
        apply() { run.criticalEdge = true; } },
      { id: "bld3", path: "blade", tier: 3, act: 3, cls: "NINJA", icon: "🔪", name: "Assassinate", desc: "Enemies below 30% HP take ×2 sword damage.",
        apply() { run.assassinate = true; } },
      // Path: Afterglow (signature/ult)
      { id: "aft1", path: "afterglow", tier: 1, act: 1, cls: "NINJA", icon: "🌑", name: "Lingering Shadow", desc: "Afterglow lasts 2 turns.",
        apply() { run.lingeringShadow = true; } },
      { id: "aft2", path: "afterglow", tier: 2, act: 2, cls: "NINJA", icon: "🌑", name: "Shadow Echo", desc: "Afterglow deals 3 true damage per turn.",
        apply() { run.shadowEcho = true; } },
      { id: "aft3", path: "afterglow", tier: 3, act: 3, cls: "NINJA", icon: "🌑", name: "Shadow Army", desc: "Afterglow: 3 turns, 5 dmg/turn.",
        apply() { run.shadowArmy = true; run.lingeringShadow = true; } },

      // ---- WIZARD ----
      // Path: Runic (shield → damage)
      { id: "rnc1", path: "runic", tier: 1, act: 1, cls: "WIZARD", icon: "🔮", name: "Runic Edge", desc: "Shield matches deal +4 damage.",
        apply() { run.runicEdge = true; } },
      { id: "rnc2", path: "runic", tier: 2, act: 2, cls: "WIZARD", icon: "🔮", name: "Runic Burst", desc: "Shield matches deal ×2 damage.",
        apply() { run.runicShield = true; } },
      { id: "rnc3", path: "runic", tier: 3, act: 3, cls: "WIZARD", icon: "🔮", name: "Thornburst", desc: "Shield matches also deal 5 splash.",
        apply() { run.runicNova = true; } },
      // Path: Mana (AP/charge/economy)
      { id: "mna1", path: "mana", tier: 1, act: 1, cls: "WIZARD", icon: "💎", name: "Arcane Pool", desc: "Start each floor with +3 ult charge.",
        apply() { run.floorChargeBonus = (run.floorChargeBonus || 0) + 3; } },
      { id: "mna2", path: "mana", tier: 2, act: 2, cls: "WIZARD", icon: "💎", name: "Mana Surge", desc: "At full charge, signature matches refund 1 AP.",
        apply() { run.manaSurge = true; } },
      { id: "mna3", path: "mana", tier: 3, act: 3, cls: "WIZARD", icon: "💎", name: "Infinite Mana", desc: "4+ matches grant 1 AP.",
        apply() { run.infiniteMana = true; } },
      // Path: Arcana (star/mystery)
      { id: "arc1", path: "arcana", tier: 1, act: 1, cls: "WIZARD", icon: "⭐", name: "Star Power", desc: "Star matches deal +3 damage.",
        apply() { run.bonusStarDmg += 3; } },
      { id: "arc2", path: "arcana", tier: 2, act: 2, cls: "WIZARD", icon: "⭐", name: "Mystic Insight", desc: "Mystery tiles are always buffs.",
        apply() { run.mysticInsight = true; } },
      { id: "arc3", path: "arcana", tier: 3, act: 3, cls: "WIZARD", icon: "⭐", name: "Sun-Kissed", desc: "Star matches also heal 3 + shield 1.",
        apply() { run.celestial = true; } },
      // Path: Aegis (defense)
      { id: "aeg1", path: "aegis", tier: 1, act: 1, cls: "WIZARD", icon: "🛡️", name: "Arcane Barrier", desc: "+8 max shield.",
        apply() { run.bonusShieldMax += 8; } },
      { id: "aeg2", path: "aegis", tier: 2, act: 2, cls: "WIZARD", icon: "🛡️", name: "Mana Shield", desc: "Shield absorbs 60% of damage.",
        apply() { run.manaShield = true; } },
      { id: "aeg3", path: "aegis", tier: 3, act: 3, cls: "WIZARD", icon: "🛡️", name: "Reflective Aura", desc: "When hit, reflect 2 damage.",
        apply() { run.reflectiveAura = true; } },

      // ---- KNIGHT ----
      // Path: Fracture (DoT/shatter)
      { id: "frc1", path: "fracture", tier: 1, act: 1, cls: "KNIGHT", icon: "💥", name: "Deep Cracked", desc: "Cracked +1 true damage per stack.",
        apply() { run.deepFracture = true; } },
      { id: "frc2", path: "fracture", tier: 2, act: 2, cls: "KNIGHT", icon: "💥", name: "Shatter+", desc: "Shatter deals ×1.5 damage.",
        apply() { run.shatterPlus = true; } },
      { id: "frc3", path: "fracture", tier: 3, act: 3, cls: "KNIGHT", icon: "💥", name: "Earthquake", desc: "Shatter Dizzies the enemy 1 turn.",
        apply() { run.earthquake = true; } },
      // Path: Fortitude (HP/shield)
      { id: "frt1", path: "fortitude", tier: 1, act: 1, cls: "KNIGHT", icon: "🏰", name: "Iron Will", desc: "+15 max HP.",
        apply() { run.bonusMaxHp += 15; } },
      { id: "frt2", path: "fortitude", tier: 2, act: 2, cls: "KNIGHT", icon: "🏰", name: "Fortified", desc: "+8 max shield.",
        apply() { run.bonusShieldMax += 8; } },
      { id: "frt3", path: "fortitude", tier: 3, act: 3, cls: "KNIGHT", icon: "🏰", name: "Unbreakable", desc: "Start each floor with 10 shield.",
        apply() { run.unbreakable = true; } },
      // Path: Retaliate (counter-damage)
      { id: "ret1", path: "retaliate", tier: 1, act: 1, cls: "KNIGHT", icon: "⚔️", name: "Vengeance", desc: "Take 2 less damage.",
        apply() { run.vengeance = true; } },
      { id: "ret2", path: "retaliate", tier: 2, act: 2, cls: "KNIGHT", icon: "⚔️", name: "Counter Strike", desc: "After taking damage, deal 3 true.",
        apply() { run.counterStrike = true; } },
      { id: "ret3", path: "retaliate", tier: 3, act: 3, cls: "KNIGHT", icon: "⚔️", name: "Retribution", desc: "Counter equals your missing HP (max 15).",
        apply() { run.retribution = true; } },
      // Path: Valor (ult power)
      { id: "vlr1", path: "valor", tier: 1, act: 1, cls: "KNIGHT", icon: "🔥", name: "Battle Cry", desc: "Ult charge +2.",
        apply() { run.ultChargeBonus += 2; } },
      { id: "vlr2", path: "valor", tier: 2, act: 2, cls: "KNIGHT", icon: "🔥", name: "Earthshatter+", desc: "Ult deals +15 true damage.",
        apply() { run.earthshatterPlus = true; } },
      { id: "vlr3", path: "valor", tier: 3, act: 3, cls: "KNIGHT", icon: "🔥", name: "Power Strike", desc: "Ult spends all your shield for extra damage.",
        apply() { run.devastation = true; } }
    ];

    // A passive/upgrade with act N unlocks once you reach floor (N-1)*15.
    // act1 = floors 1–14, act2 = 15–29, act3 = 30–45. Free pick within an act.
    function actUnlocked(a) { return run.floor >= (a - 1) * 15; }

    // Helpers for passive picker
    function getPassiveChoices(n = 1) {
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const active = new Set(run.passives || []);
      const avail = PASSIVE_TREES.filter(p => {
        if (p.cls !== hero) return false;
        if (active.has(p.id)) return false;
        if (!actUnlocked(p.act)) return false; // gated by progression, not path order
        return true;
      });
      const pool = avail.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool.slice(0, n);
    }

    function isBossFloor(f) {
      return BOSS_FLOORS.has(f);
    }

    // 3 random upgrade choices, never repeating a pick already taken this run
    function pickUpgradeChoices(n = 3) {
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const act = Math.min(3, Math.ceil(run.floor / 15));
      const avail = RUN_UPGRADES.filter(u => {
        if ((run.pickedUpgrades || []).includes(u.id)) return false;
        if (!actUnlocked(u.act || 1)) return false;
        if (u.classRequirement === "ANY") return true;
        return u.classRequirement === hero;
      });
      const pool = avail.slice();
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const picks = pool.slice(0, n);
      // Guarantee one class-specific upgrade offer per act (RPG level-up feel):
      // if this act hasn't surfaced a class upgrade yet, force one into the choices.
      if (!run.classUpgradeOfferedActs) run.classUpgradeOfferedActs = [];
      const needClass = !run.classUpgradeOfferedActs.includes(act) &&
        avail.some(u => u.classRequirement === hero);
      if (needClass && !picks.some(u => u.classRequirement === hero)) {
        const classPick = avail.find(u => u.classRequirement === hero && !picks.includes(u));
        if (classPick) {
          const anyIdx = picks.findIndex(u => u.classRequirement === "ANY");
          picks[anyIdx >= 0 ? anyIdx : picks.length - 1] = classPick;
          run.classUpgradeOfferedActs.push(act);
        }
      }
      return picks;
    }

    // Non-permanent reward pools for regular floors — temporary perks that make
    // the next fight noticeably easier. Applied at floor start (or immediately
    // for the instant-heal perk).
    // Common (5) · Uncommon (4) · Rare (2), weighted 50 / 35 / 15.
    // Floor rewards are PERMANENT, compact stacking boons — every floor makes
    // your build a little stronger for the rest of the run (STS-style growth).
    // Small increments replace the old "next floor only" buffs that players
    // never got to feel.
    function permMaxHp(amt) {
      run.bonusMaxHp += amt;
      combat.playerMaxHp += amt;
      combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp + amt);
    }
    // Rare floor rewards are SYSTEM-CHANGING perks that reuse mechanics already
    // proven in RUN_UPGRADES / PASSIVE_TREES — perks the player actually feels,
    // not just bigger stat numbers. Each is granted by wrapping the existing
    // RUN_UPGRADES entry, so it inherits its (already load-safe) apply logic and
    // is persisted through run.pickedUpgrades exactly like picking it from a
    // boss. Pushing the id into pickedUpgrades also keeps it from being offered
    // twice by the upgrade picker.
    function floorRareFromUpgrade(u) {
      return {
        id: "floorRare_" + u.id,
        tier: "rare",
        name: u.name,
        desc: u.desc,
        grant() {
          if (u && typeof u.apply === "function") u.apply();
          if (u && !(run.pickedUpgrades || []).includes(u.id)) {
            if (!run.pickedUpgrades) run.pickedUpgrades = [];
            run.pickedUpgrades.push(u.id);
          }
          const lbl = u && u.name ? u.name.replace(/^[^ ]+\s/, "") : "Rare bonus";
          return { label: "⭐ " + (lbl || "Rare bonus") };
        }
      };
    }

    // Generic (any-class) Rares — impactful build-changers every hero can use.
    const FLOOR_REWARDS_RARE_GENERIC = [
      floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "apCarry")),
      floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "boardWhisper")),
      floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "ultCharge"))
    ];

    // Class-aware Rares — one build-defining perk per class, promoted from its
    // own RUN_UPGRADES pool so the Rare slot tails the hero's identity.
    const FLOOR_REWARDS_RARE_CLASS = {
      NINJA: [
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "poisonMaster")),
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "venomousBlade"))
      ],
      WIZARD: [
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "reflectBoost")),
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "acidicBarrier"))
      ],
      KNIGHT: [
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "bulwark")),
        floorRareFromUpgrade(RUN_UPGRADES.find(u => u.id === "mortalStrike"))
      ]
    };

    // ---- Act-scaled reward magnitudes (Option A) ----
    // Later acts grant bigger permanent bonuses so the everyday picks keep up
    // with enemy HP (130 → 1147). Card desc accepts the next-floor number.
    function actScale(nextFloor) {
      const t = Math.min(3, Math.ceil((nextFloor || run.floor + 1) / 15));
      return { stat: t, maxHp: 5 * t, sig: t + 1 };
    }

    const FLOOR_REWARDS_COMMON = [
      { id: "healNow", tier: "common", name: "Patch Up", desc: "Restore 12 HP right now.",
        grant() {
          const amt = 12;
          combat.playerHp = Math.min(combat.playerMaxHp, combat.playerHp + amt);
          return { label: `Heal ${amt} HP right now` };
        } },
      { id: "bark", tier: "common", name: "Bark Guard", desc: n => `+${actScale(n).stat} Shield cap forever.`,
        grant(nextFloor) { const s = actScale(nextFloor).stat; run.bonusShieldMax += s; return { label: `🛡️ +${s} Shield cap, forever` }; } },
      { id: "healAmp", tier: "common", name: "Herbal Remedy", desc: n => `+${actScale(n).stat} Heal Amount forever (potions and HP tiles heal more).`,
        grant(nextFloor) { const s = actScale(nextFloor).stat; run.bonusHeal += s; return { label: `💚 +${s} Heal Amount, forever` }; } },
      { id: "headStart", tier: "common", name: "Head Start", desc: n => `+${actScale(n).sig} Signature charge at the start of each floor.`,
        grant(nextFloor) { const s = actScale(nextFloor).sig; run.floorChargeBonus = (run.floorChargeBonus || 0) + s; return { label: `⚡ +${s} Signature charge at floor start` }; } }
    ];
    const FLOOR_REWARDS_UNCOMMON = [
      { id: "swordPerm", tier: "uncommon", name: "Sharpen", desc: n => `+${actScale(n).stat} sword damage forever.`,
        grant(nextFloor) { const s = actScale(nextFloor).stat; run.bonusSwordDmg += s; return { label: `⚔️ +${s} Sword damage, forever` }; } },
      { id: "starPerm", tier: "uncommon", name: "Dazzle", desc: n => `+${actScale(n).stat} star damage forever.`,
        grant(nextFloor) { const s = actScale(nextFloor).stat; run.bonusStarDmg += s; return { label: `⭐ +${s} Star damage, forever` }; } },
      { id: "vigor", tier: "uncommon", name: "Sun Salve", desc: n => `+${actScale(n).maxHp} Max HP & heal ${actScale(n).maxHp} forever.`,
        grant(nextFloor) { const s = actScale(nextFloor).maxHp; permMaxHp(s); return { label: `☀️ +${s} Max HP (heal ${s}), forever` }; } }
    ];

    // Tile Blessings — player picks what each enhanced tile (bloom/cross/X) DOES.
    // Previously cross/X seals auto-refunded AP; now that bonus is a chosen build.
    // Each blessing: { special, id, icon, name, desc, tier }. Applied once per run
    // on its blessed floor, stored in run.blessings[special] = id.
    const TILE_BLESSINGS = {
      bloom: [
        { id: "ripple", special: "bloom", icon: "🌸", name: "Ripple", tier: "base",
          desc: "Blooms burst a wide 3×3 clear. Keep the classic wide control." },
        { id: "quake", special: "bloom", icon: "🌋", name: "Quake", tier: "dmg",
          desc: "Each Bloom cleared deals bonus burst damage." },
        { id: "radiance", special: "bloom", icon: "☀️", name: "Radiance", tier: "ult",
          desc: "Each Bloom cleared grants ultimate charge." },
        { id: "field", special: "bloom", icon: "🕸️", name: "Field", tier: "status",
          desc: "Each Bloom leaves ember tiles that burn the rival." }
      ],
      cross: [
        { id: "flow", special: "cross", icon: "⚡", name: "Flow", tier: "ap",
          desc: "Each cross cleared refunds +1 action point. The engine choice." },
        { id: "burst", special: "cross", icon: "🔥", name: "Burst", tier: "dmg",
          desc: "Each cross cleared deals bonus damage down its row and column." },
        { id: "pump", special: "cross", icon: "⭐", name: "Pump", tier: "ult",
          desc: "Each cross cleared grants ultimate charge." },
        { id: "sustain", special: "cross", icon: "🩸", name: "Sustain", tier: "heal",
          desc: "Each cross cleared heals you." }
      ],
      x: [
        { id: "flow", special: "x", icon: "⚡", name: "Flow", tier: "ap",
          desc: "Each X cleared refunds +1 action point. The engine choice." },
        { id: "ward", special: "x", icon: "🛡️", name: "Ward", tier: "shld",
          desc: "Each X cleared grants you shield." },
        { id: "venom", special: "x", icon: "☠️", name: "Venom", tier: "status",
          desc: "Each X cleared poisons the rival." },
        { id: "momentum", special: "x", icon: "💨", name: "Momentum", tier: "combo",
          desc: "Each X cleared boosts this cascade's damage." }
      ]
    };

    // Act 1 tutorial unlocks. The first six battle wins of Act 1 each grant one
    // of these — three Tile Blessings + three Shape Skills — in a fully random
    // order, so both systems are taught one-at-a-time before the run deepens.
    const ACT1_BLESSINGS = ["bloom", "cross", "x"];
    const ACT1_SHAPES = ["star", "charged", "cross"];

    function buildAct1Unlocks() {
      const pool = ACT1_BLESSINGS.map(id => ({ kind: "blessing", id }))
        .concat(ACT1_SHAPES.map(id => ({ kind: "shape", id })));
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      return pool;
    }

    // Shape skills — the player picks one skill for each shape (Star / Cross /
    // Charged) from any class, one shape at a time, as they earn each milestone.
    // bestFor tags a skill as the "natural" pick for a class; untagged skills are
    // universal utilities usable by everyone.
    const SHAPE_SKILLS = {
      star: [
        { id: "petalWard", shape: "star", icon: "🛡️", name: "Petal Ward",
          desc: "Star: +12 Shield and turn 3 random tiles into Shield." },
        { id: "shadowDance", shape: "star", icon: "⚡", name: "Shadow Dance",
          desc: "Star: +2 Action Points and turn 4 random tiles into Swords." },
        { id: "earthquake", shape: "star", icon: "💥", name: "Earthquake",
          desc: "Star: +2 Cracked and turn 3 random tiles into Potions." },
        { id: "celestialBloom", shape: "star", icon: "🌸", name: "Celestial Bloom", bestFor: "knight",
          desc: "Star: heal 5 HP per Star matched." },
        { id: "starfall", shape: "star", icon: "🌠", name: "Starfall", bestFor: "wizard",
          desc: "Star: +8 Shield and turn 4 random tiles into Shield." },
        { id: "nova", shape: "star", icon: "✨", name: "Nova",
          desc: "Star: +1 Action Point per Star matched." }
      ],
      cross: [
        { id: "manaLock", shape: "cross", icon: "🔒", name: "Mana Lock",
          desc: "Cross: lock the rival's Mana for 2 turns (they gain no Shield)." },
        { id: "marked", shape: "cross", icon: "🎯", name: "Marked",
          desc: "Cross: +2 Mark stacks (+15% dmg each) and +1 Action Point." },
        { id: "sunder", shape: "cross", icon: "🧱", name: "Sunder",
          desc: "Cross: +3 Cracked and +1 Action Point." },
        { id: "venomCross", shape: "cross", icon: "☠️", name: "Venom Cross", bestFor: "ninja",
          desc: "Cross: Poison the rival for 3 stacks." },
        { id: "mirrorCross", shape: "cross", icon: "🪞", name: "Mirror Cross", bestFor: "knight",
          desc: "Cross: steal the rival's Shield (max 10)." },
        { id: "tidal", shape: "cross", icon: "🌊", name: "Tidal",
          desc: "Cross: +2 ultimate charge per Cross matched." }
      ],
      charged: [
        { id: "shieldStrike", shape: "charged", icon: "🛡️", name: "Shield Strike",
          desc: "Charged: steal up to 3 Shield from the rival." },
        { id: "shadowStrike", shape: "charged", icon: "🗡️", name: "Shadow Strike",
          desc: "Charged: deal true damage = Swords cleared ×4 (8–24)." },
        { id: "shatter", shape: "charged", icon: "🧨", name: "Shatter",
          desc: "Charged: consume all Cracked for true damage (stacks ×3)." },
        { id: "feedback", shape: "charged", icon: "🔮", name: "Feedback", bestFor: "wizard",
          desc: "Charged: +2 ultimate charge and turn 2 random tiles into Shield." },
        { id: "bloodSurge", shape: "charged", icon: "❤️", name: "Blood Surge", bestFor: "ninja",
          desc: "Charged: heal 3 HP per Sword cleared this turn." },
        { id: "brilliance", shape: "charged", icon: "💎", name: "Brilliance",
          desc: "Charged: +4 ultimate charge." }
      ]
    };

    // Floor modifiers — picked after the reward. Easy = benefits player (normal reward).
    // Hard = hurts player but guarantees a rare-tier reward next floor.
    const FLOOR_MODIFIERS = [
      // ---- Easy (benefits) ----
      { id: "swordMastery", tier: "easy", icon: "⚔️", name: "Sword Mastery", desc: "Sword damage +2 this floor.", color: "#c88060",
        apply(c) { c.tempSwordDmg += 2; } },
      { id: "starBurst", tier: "easy", icon: "⭐", name: "Star Burst", desc: "Star damage +2 this floor.", color: "#d4a840",
        apply(c) { c.tempStarDmg = (c.tempStarDmg || 0) + 2; } },
      { id: "ironSkin", tier: "easy", icon: "🛡️", name: "Iron Skin", desc: "+5 max HP this floor.", color: "#6a9a6a",
        apply(c) { c.playerMaxHp += 5; c.playerHp = Math.min(c.playerMaxHp, c.playerHp + 5); } },
        { id: "firstStrike", tier: "easy", icon: "💥", name: "First Strike", desc: "First match of the floor is a Bloom (4+).", color: "#d4783c",
        apply(c) { c.pendingChargedFirst = true; } },
      { id: "signatureSurge", tier: "easy", icon: "🔥", name: "Signature Surge", desc: "Start floor with +4 ult charge.", color: "#e06040",
        apply(c) { c.sigBank = Math.min(settings.ultMaxCharge, c.sigBank + 4); } },
      { id: "freeShuffles", tier: "easy", icon: "🔀", name: "Lucky Shuffle", desc: "+2 free shuffles this floor.", color: "#4eaa4e",
        apply(c) { c.extraFreeShuffles = (c.extraFreeShuffles || 0) + 2; } },
      { id: "tileBloom", tier: "easy", icon: "🌸", name: "Tile Bloom", desc: "Start each turn with a random special tile.", color: "#c080d0", fx: "petal",
        apply(c) { c.tileBloomPerTurn = true; } },
      { id: "shieldBoon", tier: "easy", icon: "🏰", name: "Fortify", desc: "+5 max shield this floor.", color: "#6090c8",
        apply(c) { c.tempShieldCapBonus = (c.tempShieldCapBonus || 0) + 5; } },
      { id: "gentleRain", tier: "easy", icon: "☔", name: "Gentle Rain", desc: "Heal 2 HP at the start of each of your turns.", color: "#5aa0b8", fx: "rain",
        apply(c) { c.playerHealPerTurn = (c.playerHealPerTurn || 0) + 2; } },
      { id: "deepRoots", tier: "easy", icon: "🌱", name: "Deep Roots", desc: "Gain +2 Shield at the start of each of your turns.", color: "#6a9a5a",
        apply(c) { c.shieldPerTurn = (c.shieldPerTurn || 0) + 2; } },
      { id: "pollenPuff", tier: "easy", icon: "🌼", name: "Pollen Puff", desc: "Your first match each turn deals +50% damage.", color: "#d4b040", fx: "petal",
        apply(c) { c.empowerEachTurn = true; } },
      { id: "thornAura", tier: "easy", icon: "🌵", name: "Thorn Aura", desc: "When hit, deal 2 true damage back.", color: "#7a9a4a",
        apply(c) { c.thornAura = (c.thornAura || 0) + 2; } },
      { id: "towerVigor", tier: "easy", icon: "🌿", name: "Tower's Vigor", desc: "+15 Max HP and +10 Shield this floor.", color: "#6a9a6a",
        apply(c) { c.playerMaxHp += 15; c.playerHp = Math.min(c.playerMaxHp, c.playerHp + 15); c.shield = Math.min(settings.shieldMax + (run.bonusShieldMax || 0), c.shield + 10); } },
      // ---- Hard (challenges) ----
      { id: "wilt", tier: "hard", icon: "🥀", name: "Wilt", desc: "Your healing is halved this floor.", color: "#9060a0", fx: "petal",
        apply(c) { c.wilt = true; } },
      { id: "eclipse", tier: "hard", icon: "🌑", name: "Eclipse", desc: "Mystery tiles are always debuffs this floor.", color: "#50506a",
        apply(c) { c.eclipse = true; } },
      { id: "twinStorm", tier: "hard", icon: "🌪️", name: "Twin Storm", desc: "Rival gains +1 AP every 3rd turn.", color: "#7078a0", fx: "snow",
        apply(c) { c.twinStorm = true; } },
      { id: "mirrorMatch", tier: "hard", icon: "🦴", name: "Mirror Match", desc: "Enemy starts with Fracture 3 — plan your Shatter.", color: "#8a50c0",
        apply(c) { c.fractureStacks = Math.min(6, c.fractureStacks + 3); c.fractureTurns = Math.max(c.fractureTurns, 5); } },
      { id: "toxicMist", tier: "hard", icon: "☠️", name: "Toxic Mist", desc: "Both fighters start poisoned 3 turns.", color: "#5a8a3a",
        apply(c) { c.poisonTurns = Math.max(c.poisonTurns || 0, 3); c.enemyPoisonTurns = Math.max(c.enemyPoisonTurns || 0, 3); } },
      { id: "volatileFloor", tier: "hard", icon: "🌋", name: "Scorched Soil", desc: "Every match deals 1 damage to you.", color: "#d44a2a", fx: "ember",
        apply(c) { c.volatileFloor = true; } },
      { id: "bloodPrice", tier: "hard", icon: "🩸", name: "Blood Price", desc: "Enemy heals 3 HP per turn.", color: "#b83030", fx: "ember",
        apply(c) { c.enemyRegen = (c.enemyRegen || 0) + 3; } },
      { id: "quickening", tier: "hard", icon: "⚡", name: "Quickening", desc: "Enemy gains +1 ATK every 2 turns.", color: "#c8a030",
        apply(c) { c.quickening = true; c.quickeningTicks = 0; } }
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
    // Rare pool for the current hero = their class perks mixed with the generic
    // system perks. Skips any perk the player already owns (its RUN_UPGRADES id
    // is in run.pickedUpgrades) and any that was just offered, so a hero never
    // sees the same Rare twice in a short stretch and never a duplicate of an
    // upgrade they've already picked.
    function buildRarePool() {
      const hero = (combat.playerClass || "ninja").toUpperCase();
      const owned = new Set(run.pickedUpgrades || []);
      const pool = (FLOOR_REWARDS_RARE_CLASS[hero] || []).concat(FLOOR_REWARDS_RARE_GENERIC);
      return pool.filter(r => {
        const baseId = r.id.replace(/^floorRare_/, "");
        return !owned.has(baseId);
      });
    }

    function buildFloorRewardChoices() {
      const taken = new Set();
      // Skip cards that were just offered last floor so the same pair doesn't
      // reappear back-to-back. Recycles when a slot's pool runs out.
      const recent = new Set(run.lastFloorRewardOffered || []);
      const fresh = (pool, n) => {
        const unpref = pickDistinct(pool.filter(e => !recent.has(e.id)), n, taken);
        return unpref.length === n ? unpref : pickDistinct(pool, n, taken);
      };
      const rares = buildRarePool();
      if (run.pendingModifierRare) {
        run.pendingModifierRare = false;
        const rarePicks = rares.length
          ? pickDistinct(rares, Math.min(2, rares.length), taken)
          : [];
        const extra = fresh(FLOOR_REWARDS_UNCOMMON, 3 - rarePicks.length);
        const offer = [...rarePicks, ...extra];
        run.lastFloorRewardOffered = offer.map(r => r.id);
        return offer;
      }
      const commons = fresh(FLOOR_REWARDS_COMMON, 2);
      const topIsRare = Math.random() < 0.4;
      let top;
      if (topIsRare && rares.length) {
        top = pickDistinct(rares, 1, taken)[0];
      } else {
        top = fresh(FLOOR_REWARDS_UNCOMMON, 1)[0];
      }
      // If every Rare is already owned we still want an Uncommon tier to show.
      if (!top) top = fresh(FLOOR_REWARDS_UNCOMMON, 1)[0];
      const offer = [top, ...commons];
      run.lastFloorRewardOffered = offer.map(r => r.id);
      return offer;
    }

    // Elite floors: both Rares + 1 Uncommon for the temp perk
    function buildEliteTempChoices() {
      const taken = new Set();
      const pool = buildRarePool();
      const rares = pool.length ? pickDistinct(pool, Math.min(2, pool.length), taken) : [];
      const extra = pickDistinct(FLOOR_REWARDS_UNCOMMON, 3 - rares.length, taken);
      return [...rares, ...extra];
    }

    // Gauntlet floors: small permanent stat (paired with the Rare temp perk)
    const GAUNTLET_REWARDS = {
      12: { label: "+4 Max Shield", apply: () => { run.bonusShieldMax += 4; } },
      27: { label: "+1 Max AP", apply: () => { run.bonusApMax += 1; AP_MAX = 3 + run.bonusApMax; } },
      42: { label: "+8 Max HP", apply: () => { run.bonusMaxHp += 8; } }
    };

    // Unique boss kits (floor → definition)
    const BOSS_KITS = {
      15: { id: "bracken", name: "Bracken the Rootbound", epithet: "Warden of the Sprout", introColor: "#7aa65e", persona: "bruiser", bias: { sword: 1.5 }, ultName: "Root Snare", ultTurns: 4,
            ultDesc: "Blind + heavy hit + Disoriented (controls reversed for 2 turns)",
            ultFn: () => { combat.blindNext = true; combat.disorientedTurns = Math.max(combat.disorientedTurns, 2); dealDamageToPlayer(Math.round(enemyAtkForFloor(run.floor) * 1.25)); if (typeof sprinkleStatusTiles === "function") sprinkleStatusTiles("corrupted", 3); document.body.classList.add("disoriented"); dmgPop("player", "DISORIENTED", "shielded"); setLog("Root Snare", "Root Snare · blind + heavy hit + Disoriented 2t + Curses 3 tiles"); } },
      30: { id: "cinder", name: "Squall Queen", epithet: "Crown of the Howling Gale", introColor: "#8a9cc8", persona: "viper", bias: { star: 1.5, sword: 1.2 }, ultName: "Ashstorm", ultTurns: 4,
            passive: "Bloom Counter — each hit she takes adds a Bloom stack (+4% DR per stack, cap 8). At 5+ stacks she heals 2 HP/turn. Stacks decay -1/turn.",
            ultDesc: "Poison + burst damage + Curses tiles. Punishes chip damage — hit her hard and few times.",
            ultFn: () => { combat.poisonTurns = Math.max(combat.poisonTurns, 3); flyEffect(document.getElementById("enemyPortrait"), document.getElementById("playerPortrait"), "poison"); dealDamageToPlayer(Math.round(enemyAtkForFloor(run.floor) * 1.35)); if (typeof sprinkleStatusTiles === "function") sprinkleStatusTiles("corrupted", 2); setLog("Ashstorm", "Ashstorm · poison 3t + burst + Curses 2 tiles"); } },
      // The Last Rival = dark Knight kit: final boss at floor 45
      45: { id: "lastrival", name: "The Last Rival", epithet: "The Tower's Final Fear", introColor: "#c86a5a", persona: "mender", bias: { hp: 1.8, shield: 1.3 }, ultName: "Earthshatter", ultTurns: 5,
            passive: "Regenerates 3 HP each turn · every hit applies Fracture (2 true dmg per stack at your turn start)",
            ultDesc: "Massive hit + Bleed (your healing -50% for 2 turns) + Root Bind (locks 50% of your signature tiles for 2 turns) + Curses 2 tiles",
            turnStart: () => { if (combat.enemyHp > 0) healEnemy(3); },
            ultFn: () => {
              const d = Math.round(enemyAtkForFloor(run.floor) * 1.6);
              combat.playerMortalWoundTurns = Math.max(combat.playerMortalWoundTurns, 2);
              dealDamageToPlayer(d);
              // Root Bind: lock 50% of player's signature tiles
              const sigType = typeof SIGNATURE !== "undefined" && SIGNATURE[combat.playerClass];
              if (sigType && typeof board !== "undefined") {
                const candidates = [];
                for (let r = 0; r < ROWS; r++)
                  for (let c = 0; c < COLS; c++)
                    if (board[r][c] === sigType && !combat.boundTiles.has(`${r},${c}`))
                      candidates.push(`${r},${c}`);
                const toBind = Math.max(1, Math.floor(candidates.length * 0.5));
                for (let i = candidates.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                }
                for (let i = 0; i < toBind; i++) combat.boundTiles.add(candidates[i]);
                if (typeof syncBoundVisuals === "function") syncBoundVisuals();
              }
              if (typeof sprinkleStatusTiles === "function") sprinkleStatusTiles("corrupted", 2);
              setLog("Earthshatter", `Earthshatter · ${d} dmg + Bleed 2t + Root Bind + Curses 2 tiles`);
            } }
    };

    // Enemy stats use clean per-act tiers (STS-style) instead of a runaway
    // floor² curve: a gentle climb within each act, peaking at the boss. This
    // keeps HP in the hundreds (no 1000+ sponges) and damage from one-shotting.
    function actTier(f) { return Math.min(3, Math.ceil(f / 15)); }
    function actPos(f) { return (f - (actTier(f) - 1) * 15 - 1) / 14; } // 0..1 within act

    function enemyHpForFloor(f) {
      // Raised to absorb the persistent floor boons (every clear now stacks a
      // permanent +Max HP / +dmg). Normal fights stay in the hundreds; only the
      // final boss edges past 1000.
      const tiers = [ { lo: 130, hi: 260 }, { lo: 290, hi: 520 }, { lo: 520, hi: 850 } ];
      const t = tiers[actTier(f) - 1];
      let hp = Math.round(t.lo + (t.hi - t.lo) * actPos(f));
      if (BOSS_FLOORS.has(f)) hp = Math.round(hp * 1.35);
      if (GAUNTLET_REWARDS[f]) hp = Math.round(hp * 1.2);
      // 🌟 Golden Cosmos: rivals grow with each golden loop
      const loop = (typeof run !== "undefined" && run.ngLoop) || 0;
      if (loop > 0) hp = Math.round(hp * (1 + 0.25 * loop));
      return hp;
    }

    function enemyAtkForFloor(f) {
      const tiers = [ { lo: 20, hi: 36 }, { lo: 42, hi: 66 }, { lo: 72, hi: 110 } ];
      const t = tiers[actTier(f) - 1];
      let atk = Math.round(t.lo + (t.hi - t.lo) * actPos(f));
      const loop = (typeof run !== "undefined" && run.ngLoop) || 0;
      if (loop > 0) atk += 2 * loop;
      return Math.max(3, atk);
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
      swordsClearedThisTurn: 0, // ninja Shadow Step
      shadowStepUsed: false,     // ninja Shadow Step (once per turn)
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
      disorientedTurns: 0,           // Bracken Root Snare: controls reversed
      squallBloom: 0,                // Squall Queen: bloom stacks (damage reduction + heal)
      enemyBurnTurns: 0,             // Burn tiles: enemy takes fire dmg when using AP
      enemyBurnDmg: 0,               // Burn: fire dmg per tick
      enemyStunTurns: 0,             // Stun tiles: skip enemy turn
      enemyFrostTurns: 0,            // Frost tiles: reduce enemy AP by 1
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
      acidStacks: 0,
      // Floor modifier flags
      volatileFloor: false,
      enemyRegen: 0,
      quickening: false,
      quickeningTicks: 0,
      pendingChargedFirst: false,
      enemyAtkBonus: 0,
      extraFreeShuffles: 0,
      tileBloomPerTurn: false,
      tempShieldCapBonus: 0,
      sigTilesThisTurn: 0,
      // Cascade log buffer (consolidates chain into 1 entry)
      _cascadeBuffer: [],
      _inCascade: false,
      _enemyTurnLog: false,
      // Enemy attack consolidation
      _enemyAttacksThisTurn: 0,
      boundTiles: new Set()   // "r,c" strings — tiles locked by Rival's Root Bind ult
    };

    // Track unused AP bonus from previous turn
    let unusedApBonus = 0;
