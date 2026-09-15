    function sfxVol(base) {
      if (settings.muted) return 0;
      // Aggressive master scale for mobile speakers
      const scaled = (base || 0.4) * settings.volume * 3.5;
      return Math.max(0, Math.min(1, scaled));
    }

    let audioCtx = null;

    function ensureAudio() {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        return !!audioCtx;
      } catch (_) {
        audioCtx = null;
        return false;
      }
    }

    // ---------- Haptics (Vibration API) ----------
    // Short, subtle patterns. Silently does nothing when unsupported
    // (iOS Safari, most desktops, reduced-motion / battery savers).
    const canVibrate = typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

    function haptic(pattern) {
      if (!canVibrate) return;
      try { navigator.vibrate(pattern); } catch (_) {}
    }

    function hapticLight()  { haptic(12); }          // pickup
    function hapticMatch()  { haptic(26); }          // single match
    function hapticTap()    { haptic(18); }          // UI button
    function hapticCombo(level) {                    // cascade / combo
      if (level >= 3) haptic([28, 35, 32]);
      else haptic([20, 28, 20]);
    }
    function hapticDrop()   { haptic(10); }          // soft land

    // Soft bell pop — warm sine + inharmonic bell overtone for acoustic feel
    function playPop(pitch = 1, volume = 0.55) {
      volume = sfxVol(volume);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;

      // Main bell tone — slower attack, longer ring
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(340 * pitch, t + 0.18);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume * 0.7, t + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.24);

      // Inharmonic bell partial (2.76x — the classic bell ratio)
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(520 * 2.76 * pitch, t);
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(volume * 0.2, t + 0.008);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o2.connect(g2);
      g2.connect(audioCtx.destination);
      o2.start(t);
      o2.stop(t + 0.14);
    }

    function playUiClick(kind = "tap") {
      // Short soft tick for buttons
      const vol = sfxVol(kind === "end" ? 0.55 : 0.42);
      if (vol <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      const f0 = kind === "end" ? 320 : kind === "primary" ? 420 : 520;
      osc.frequency.setValueAtTime(f0, t);
      osc.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.07);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
      if (kind === "end") haptic(28);
      else hapticTap();
    }

    function playSwap() {
      // Same gooey family – quieter, slightly higher
      playGooeyPlop(1.15, 0.45);
    }

    // Soft mallet plop — warm wood-strike feel with gentle ring
    function playGooeyPlop(pitch = 1, volume = 0.65) {
      volume = sfxVol(volume);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;

      // Wood-strike body
      const osc = audioCtx.createOscillator();
      const filt = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.12);
      filt.type = "lowpass";
      filt.frequency.setValueAtTime(1200 * pitch, t);
      filt.frequency.exponentialRampToValueAtTime(400 * pitch, t + 0.1);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume * 0.8, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(volume * 0.4, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.2);

      // Bell overtone
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(440 * 2.4 * pitch, t);
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(volume * 0.15, t + 0.006);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      o2.connect(g2);
      g2.connect(audioCtx.destination);
      o2.start(t);
      o2.stop(t + 0.1);
    }

    function playMatch(count) {
      // +1 semitone per combo tier above 3-match (semitone = 2^(1/12))
      const tier = Math.max(0, (count || 3) - 3);
      const semitone = Math.pow(2, 1 / 12);
      const pitch = Math.pow(semitone, tier);
      playCorrect(pitch);
      // Bigger combos get a sparkle layer
      if (tier >= 2) playSparkle(2.5 + tier * 0.3, 0.2 + tier * 0.05);
      hapticMatch();
    }

    // Match chime — warm bell two-note with resonant overtones
    function playCorrect(pitch = 1) {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      [523, 784].forEach((f, i) => {
        const at = t + i * 0.1;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = f * pitch;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(volume * 0.7, at + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(at);
        o.stop(at + 0.38);

        // Bell partial
        const o2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        o2.type = "sine";
        o2.frequency.value = f * 2.76 * pitch;
        g2.gain.setValueAtTime(0.0001, at);
        g2.gain.exponentialRampToValueAtTime(volume * 0.18, at + 0.005);
        g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
        o2.connect(g2);
        g2.connect(audioCtx.destination);
        o2.start(at);
        o2.stop(at + 0.2);

        // Soft shimmer overtone
        const o3 = audioCtx.createOscillator();
        const g3 = audioCtx.createGain();
        o3.type = "sine";
        o3.frequency.value = f * 4.17 * pitch;
        g3.gain.setValueAtTime(0.0001, at);
        g3.gain.exponentialRampToValueAtTime(volume * 0.08, at + 0.005);
        g3.gain.exponentialRampToValueAtTime(0.0001, at + 0.12);
        o3.connect(g3);
        g3.connect(audioCtx.destination);
        o3.start(at);
        o3.stop(at + 0.14);
      });
      hapticMatch();
    }

    // Musical cascade ramp — each link in a chain plays the next pentatonic step UP,
    // so chains feel like a rising scale (the "rewarding combo" trick).
    const COMBO_SCALE = [1.12, 1.27, 1.5, 1.68, 1.9, 2.25, 2.5];
    function playCombo(level) {
      const idx = Math.min(COMBO_SCALE.length - 1, Math.max(0, level - 2));
      playCorrect(COMBO_SCALE[idx]);
      if (level >= 4) playSparkle(1.5 + level * 0.12, 0.32);
      hapticCombo(level);
    }

    // Crystalline bell sparkle — three harmonics for shimmer
    function playSparkle(ratio = 3, vol = 0.3) {
      const volume = sfxVol(vol);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const base = 660 * ratio * 0.5;

      [1, 2.76, 5.4].forEach((h, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(base * h, t);
        o.frequency.exponentialRampToValueAtTime(base * h * 1.15, t + 0.1);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(volume * (1 - i * 0.3), t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2 - i * 0.04);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t);
        o.stop(t + 0.22);
      });
    }

    // ---------- Combat SFX (punchy, layered: thump + noise transient + click) ----------

    function playNoiseBurst(t, vol, dur, lowpassHz) {
      const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * dur));
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2.2);
      }
      const src = audioCtx.createBufferSource();
      src.buffer = buffer;
      const filter = audioCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lowpassHz;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      src.start(t);
    }

    // Soft wood knock — warm body with bell overtone, no harsh noise
    function playHit(strength = 1, opts = {}) {
      const volume = sfxVol(0.6);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const s = Math.max(0.35, Math.min(1.5, strength));

      // Wood body
      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      const base = opts.down ? 160 : 200;
      osc.type = "sine";
      osc.frequency.setValueAtTime(base * s, t);
      osc.frequency.exponentialRampToValueAtTime(base * 0.5 * s, t + 0.15);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(volume * 0.8, t + 0.012);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(og);
      og.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.22);

      // Bell overtone
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(base * 2.76 * s, t);
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.exponentialRampToValueAtTime(volume * 0.15, t + 0.008);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o2.connect(g2);
      g2.connect(audioCtx.destination);
      o2.start(t);
      o2.stop(t + 0.12);
      // Sub-bass thump for heavy hits (boss attacks)
      if (s > 1.0) {
        const bass = audioCtx.createOscillator();
        const bassG = audioCtx.createGain();
        bass.type = "sine";
        bass.frequency.setValueAtTime(60 * s, t);
        bass.frequency.exponentialRampToValueAtTime(30, t + 0.2);
        bassG.gain.setValueAtTime(0.0001, t);
        bassG.gain.exponentialRampToValueAtTime(volume * 0.5, t + 0.015);
        bassG.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        bass.connect(bassG);
        bassG.connect(audioCtx.destination);
        bass.start(t);
        bass.stop(t + 0.28);
      }
      hapticMatch();
    }

    // Rising two-note chime for healing
    function playHeal() {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      [523, 784].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, t + i * 0.07);
        g.gain.setValueAtTime(0.0001, t + i * 0.07);
        g.gain.exponentialRampToValueAtTime(volume * 0.6, t + i * 0.07 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.18);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t + i * 0.07);
        o.stop(t + i * 0.07 + 0.2);
      });
    }

    // Wind chime shimmer — three soft cascading notes
    function playShield() {
      const volume = sfxVol(0.45);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      [784, 988, 1175].forEach((f, i) => {
        const at = t + i * 0.06;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(volume * (0.6 - i * 0.1), at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(at);
        o.stop(at + 0.24);
      });
    }

    // Low warning hum when the enemy is charging its ultimate
    function playEnemyCharge() {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const f = audioCtx.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(95, t + 0.3);
      f.type = "lowpass";
      f.frequency.value = 500;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(volume * 0.4, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
      o.connect(f);
      f.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.36);
      haptic([18, 22, 18]);
    }

    // Rising fanfare on floor clear
    function playVictory() {
      const volume = sfxVol(0.6);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      [523, 659, 784, 1047].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(f, t + i * 0.09);
        g.gain.setValueAtTime(0.0001, t + i * 0.09);
        g.gain.exponentialRampToValueAtTime(volume * 0.7, t + i * 0.09 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.3);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 0.32);
      });
      haptic([30, 35, 45]);
    }

    // Low descending thud on defeat
    function playDefeat() {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      [392, 311, 233].forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, t + i * 0.14);
        g.gain.setValueAtTime(0.0001, t + i * 0.14);
        g.gain.exponentialRampToValueAtTime(volume * 0.55, t + i * 0.14 + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.14 + 0.35);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t + i * 0.14);
        o.stop(t + i * 0.14 + 0.38);
      });
      haptic([45, 30, 20]);
    }

    // Quick clatter for the mystery dice roll
    function playDice() {
      const volume = sfxVol(0.45);
      if (volume <= 0) return;
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      for (let i = 0; i < 3; i++) {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(600 + Math.random() * 300, t + i * 0.05);
        g.gain.setValueAtTime(0.0001, t + i * 0.05);
        g.gain.exponentialRampToValueAtTime(volume * 0.4, t + i * 0.05 + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.05 + 0.06);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t + i * 0.05);
        o.stop(t + i * 0.05 + 0.07);
      }
    }

    // ---------- helpers ----------

    function hapticUlt() {
      haptic([32, 45, 28, 40, 50]);
    }

    // Distinct ult sting — anticipation sweep, impact chord, low boom, sparkle tail
    function playUltSfx(cls = "ninja") {
      const volume = sfxVol(0.72);
      if (volume <= 0) {
        hapticUlt();
        return;
      }
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const root = cls === "wizard" ? 440 : cls === "knight" ? 180 : 330;

      // 1) Anticipation sweep (class-colored)
      const sweep = audioCtx.createOscillator();
      const sg = audioCtx.createGain();
      sweep.type = cls === "knight" ? "sawtooth" : "sine";
      sweep.frequency.setValueAtTime(cls === "wizard" ? root * 0.5 : root * 0.7, t);
      sweep.frequency.exponentialRampToValueAtTime(root * (cls === "wizard" ? 2.2 : 1.4), t + 0.16);
      sg.gain.setValueAtTime(0.0001, t);
      sg.gain.linearRampToValueAtTime(volume * 0.28, t + 0.06);
      sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      sweep.connect(sg);
      sg.connect(audioCtx.destination);
      sweep.start(t);
      sweep.stop(t + 0.2);

      // 2) Main impact chord
      const t2 = t + 0.2;
      const notes = cls === "wizard" ? [1, 5, 12] : cls === "knight" ? [0, 7, 12] : [0, 12];
      notes.forEach((semi, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = cls === "knight" ? "triangle" : "sine";
        const f = root * Math.pow(2, semi / 12);
        o.frequency.setValueAtTime(f, t2);
        o.frequency.exponentialRampToValueAtTime(f * (cls === "ninja" ? 0.6 : 0.8), t2 + 0.24);
        g.gain.setValueAtTime(0.0001, t2);
        g.gain.exponentialRampToValueAtTime(volume * (0.5 - i * 0.08), t2 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.42 + i * 0.04);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t2);
        o.stop(t2 + 0.5);
      });

      // Sub-bass boom
      const boom = audioCtx.createOscillator();
      const bg = audioCtx.createGain();
      boom.type = "sine";
      boom.frequency.setValueAtTime(cls === "wizard" ? 110 : 60, t2);
      boom.frequency.exponentialRampToValueAtTime(40, t2 + 0.3);
      bg.gain.setValueAtTime(0.0001, t2);
      bg.gain.exponentialRampToValueAtTime(volume * 0.5, t2 + 0.012);
      bg.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.4);
      boom.connect(bg);
      bg.connect(audioCtx.destination);
      boom.start(t2);
      boom.stop(t2 + 0.42);

      // 3) Sparkle tail (quiet shimmer on the knight, bright on wizard/ninja)
      [1, 2.76, 5.4].forEach((h, i) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "triangle";
        const tailRoot = cls === "knight" ? root * 2 : root * 2.4;
        o.frequency.setValueAtTime(tailRoot * h, t2 + 0.1);
        o.frequency.exponentialRampToValueAtTime(tailRoot * h * 1.1, t2 + 0.24);
        g.gain.setValueAtTime(0.0001, t2 + 0.1);
        g.gain.exponentialRampToValueAtTime(volume * (0.22 - i * 0.06) * (cls === "knight" ? 0.5 : 1), t2 + 0.11);
        g.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.4);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(t2 + 0.1);
        o.stop(t2 + 0.42);
      });

      hapticUlt();
    }

    // ---------- GENERATIVE RPG BGM (WebAudio) ----------
    // Synthesized live soundtrack - no audio files. Three act "families", each a
    // small song spec (tempo + 4-bar chord walk + a lead scale). Elites and
    // bosses pick a *variant* of their act's family (faster, darker chords,
    // sparser melody, heavier/steadier drum) instead of a different song.
    //
    // The three families take their *mood* from Slay the Spire (never their
    // notes - all original material, through the DP-style lens of silences and
    // space).  The arc leans hopeful but stays LOW and warm - nothing bright
    // or piercing, easy on sensitive ears:
    //   Act 1 "First Light"  ~ The Exordium : bright dawn, singable, forward
    //   Act 2 "The Hollow"    ~ The Unknown  : warm nocturnal, a lone voice
    //   Act 3 "The Crown"     ~ The City     : triumphant resolve, iron march
    // Every act/mode combo has its own scale, chord bed, lead texture and bell.
    // Leads sit in a low-mid register (roughly D3–A4); the bass drone, cello
    // and drums carry the weight.  An A/B melodic variant alternates each loop.
    const BGM_ACTS = {
      1: {
        bpm:    { field: 96,  elite: 110, boss: 132 },
        // 4-bar progression roots, I–vi–IV–V (C A F G): hopeful skeleton.
        chords: { field: [0, 9, 5, 7], elite: [0, 5, 9, 7], boss: [0, 7, 5, 9] },
        flute: {
          field: [0, 2, 4, 5, 7, 9, 11, 12],   // ionian: bright, singing
          elite: [0, 2, 4, 6, 7, 9, 11, 12],   // lydian: soaring lift
          boss:  [0, 2, 4, 5, 7, 9, 10, 12]    // mixolydian: resolved drive
        },
        fluteB: {                              // alt loop: warm fifth shapes
          field: [0, 2, 4, 7, 9, 12],
          elite: [0, 2, 4, 6, 9, 12],
          boss:  [0, 2, 4, 5, 7, 12]
        },
        lead: {
          field: { octave: 5, wave: "sine", vol: 0.055, attack: 0.25 },
          elite: { octave: 5, wave: "triangle", vol: 0.045, attack: 0.3 },
          boss:  { octave: 5, wave: "sine", vol: 0.06, attack: 0.2 }
        },
        ghost:  { field: [3, 5, 7], elite: [6, 3], boss: [2, 4, 6] },
        ghostB: { field: [2, 6],    elite: [4],    boss: [3, 7] },
        bell:   "none"
      },
      2: {
        bpm:    { field: 62,  elite: 58, boss: 96 },
        // i–VI–III–VII (Am F C G): warm minor, hopeful dusk.
        chords: { field: [0, 8, 3, 10], elite: [0, 8, 10, 3], boss: [0, 3, 8, 10] },
        flute: {
          field: [0, 2, 3, 5, 7, 9, 10, 12],   // dorian: warm, drifting
          elite: [0, 2, 3, 5, 7, 9, 11, 12],   // melodic minor: sun through mist
          boss:  [0, 2, 4, 5, 7, 9, 11, 12]    // lifted to major - desperate hope
        },
        fluteB: {
          field: [0, 2, 3, 5, 7, 10],
          elite: [0, 2, 3, 5, 7, 9],
          boss:  [0, 2, 4, 7, 9, 12]
        },
        lead: {
          field: { octave: 5, wave: "sine", vol: 0.045, attack: 0.45 },
          elite: { octave: 5, wave: "triangle", vol: 0.045, attack: 0.4 },
          boss:  { octave: 5, wave: "triangle", vol: 0.05, attack: 0.25 }
        },
        ghost:  { field: [3, 7], elite: [4, 6], boss: [2, 4, 6] },
        ghostB: { field: [5],    elite: [3],    boss: [3, 7] },
        bell:   "alternate"
      },
      3: {
        bpm:    { field: 104, elite: 118, boss: 140 },
        // Heroic bed in D: I–IV–V–vi shapes.
        chords: { field: [0, 5, 7, 9], elite: [0, 5, 9, 7], boss: [0, 7, 5, 9] },
        flute: {
          field: [0, 2, 4, 5, 7, 9, 10, 12],   // mixolydian: sure-footed
          elite: [0, 2, 4, 6, 7, 9, 11, 12],   // lydian: glory
          boss:  [0, 2, 4, 5, 7, 9, 11, 12]    // ionian: triumph
        },
        fluteB: {
          field: [0, 2, 4, 7, 9, 10],
          elite: [0, 2, 4, 6, 9, 12],
          boss:  [0, 2, 4, 7, 9, 12]
        },
        lead: {
          field: { octave: 4, wave: "triangle", vol: 0.055, attack: 0.2 },
          elite: { octave: 4, wave: "triangle", vol: 0.06, attack: 0.15 },
          boss:  { octave: 4, wave: "triangle", vol: 0.055, attack: 0.12 }
        },
        ghost:  { field: [0, 4, 6], elite: [6, 3], boss: [2, 4, 6] },
        ghostB: { field: [3, 5],    elite: [7],    boss: [3, 7] },
        bell:   "rare"
      }
    };
    // Drum patterns: eighth-step accent per mode, one per act so each act
    // marches/pulses differently while elites and bosses stay in-family.
    const BGM_DRUMS = {
      1: { field: "pulse",  elite: "sparse", boss: "drive" },
      2: { field: "uneven", elite: "bare",   boss: "drive" },
      3: { field: "march",  elite: "march",  boss: "drive" }
    };
    const BGM_DRUM_PAT = {
      pulse:  (s) => s === 0 || s === 3 || s === 5,
      uneven: (s) => s === 0 || s === 5,
      march:  (s) => s === 0 || s === 4,
      sparse: (s) => s === 0 || s === 6,
      bare:   (s) => s === 0,
      drive:  (s) => s % 2 === 0
    };
    const BGM_ACT_ROOTS = { 1: 130.81, 2: 110.0, 3: 146.83 }; // C3, A2, D3
    const SEMI = Math.pow(2, 1 / 12);
    const ftom = (root, semi) => root * Math.pow(SEMI, semi);

    // Per-act reverb character: longer/wetter for the cavernous act 2,
    // tighter and drier for the cold march of act 3.
    const BGM_REVERB = {
      1: { len: 1.4, decay: 3.2, wet: 0.50 },  // neutral stone hall
      2: { len: 2.5, decay: 2.0, wet: 0.65 },  // wide, echoing cavern
      3: { len: 0.9, decay: 4.5, wet: 0.35 }   // tight, cold chamber
    };

    let bgm = null;            // { mode, act, step, nextT, gain, running }
    let bgmDangerNode = null;  // low-HP layer bus (0..1)
    let bgmLowHp = false;
    let bgmTimer = null;
    let bgmStarted = false;
    let bgmHidden = false;

    function bgmVol() {
      if (settings.muted || settings.musicEnabled === false) return 0;
      // Gentle bed: liner on purpose. Sits quietly under SFX - never louder than
      // the music slider itself. *1.15 compensates for the compressor's -32dBFS
      // threshold so the perceived level matches the slider midpoint.
      return Math.max(0, Math.min(1.0, (settings.musicVolume || 0.5) * 1.15));
    }

    // Resolve the active theme: per-mode scale, ghost steps, lead texture and
    // the A/B melodic variant (odd loops use the "B" scale/phrasing).
    function bgmTheme() {
      const act = (bgm && bgm.act) || 1;
      const mode = (bgm && bgm.mode) || "field";
      const fam = BGM_ACTS[act] || BGM_ACTS[1];
      const alt = bgm && (bgm.loop % 2 === 1);
      const base = (fam.flute && fam.flute[mode]) || [0, 2, 4, 5, 7, 9, 11, 12];
      const flute = (alt && fam.fluteB && fam.fluteB[mode]) ? fam.fluteB[mode] : base;
      const ghost = (fam.ghost && fam.ghost[mode]) || [3];
      const ghostB = (alt && fam.ghostB && fam.ghostB[mode]) || ghost;
      return {
        ...fam,
        bpm: fam.bpm[mode] || fam.bpm.field,
        chords: fam.chords[mode] || fam.chords.field,
        drum: (BGM_DRUMS[act] || BGM_DRUMS[1])[mode] || "uneven",
        flute,
        ghost: ghostB,
        lead: (fam.lead && fam.lead[mode]) || fam.lead || {}
      };
    }
    function bgmRootFreq() { return (bgm && BGM_ACT_ROOTS[bgm.act]) || BGM_ACT_ROOTS[1]; }

    // Build a generated impulse response for the current act's reverb character.
    function bgmBuildIR(act) {
      const cfg = BGM_REVERB[act] || BGM_REVERB[1];
      const irLen = Math.max(1, Math.floor(audioCtx.sampleRate * cfg.len));
      const ir = audioCtx.createBuffer(1, irLen, audioCtx.sampleRate);
      const data = ir.getChannelData(0);
      for (let i = 0; i < irLen; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-cfg.decay * i / irLen) * 0.35;
      return ir;
    }

    // Swap the convolver's impulse response and reverb-send level for the given act.
    function bgmUpdateReverb() {
      if (!bgm || !bgm.rev) return;
      const cfg = BGM_REVERB[bgm.act] || BGM_REVERB[1];
      bgm.rev.buffer = bgmBuildIR(bgm.act);
      bgm.revSend.gain.setTargetAtTime(cfg.wet, audioCtx.currentTime, 0.1);
    }

    // Create a simple stereo splitter: mono input → left/right gains with pan.
    function bgmSplitStereo(input, target, pan) {
      const sp = audioCtx.createChannelSplitter(2);
      const lg = audioCtx.createGain();
      const rg = audioCtx.createGain();
      const p = Math.max(-1, Math.min(1, pan));
      lg.gain.value = p <= 0 ? 1 : 1 - p * 0.7;
      rg.gain.value = p >= 0 ? 1 : 1 + p * 0.7;
      input.connect(sp);
      sp.connect(lg, 0);
      sp.connect(rg, 1);
      lg.connect(target);
      rg.connect(target);
    }

    function bgmTone(freqV, t, dur, o = {}) {
      if (!audioCtx || !bgm) return;
      if (o.danger && !bgmDangerNode) return;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = o.wave || "sine";
      osc.frequency.setValueAtTime(freqV, t);
      if (o.glide) osc.frequency.exponentialRampToValueAtTime(o.glide, t + dur);
      const peak = o.vol != null ? o.vol : 0.05;
      const attackT = o.attack != null ? o.attack : 0.02;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(peak, t + attackT);
      if (o.hold) {
        // Sustained tones: attack up, hold near-peak for the note, then a short
        // linear release. exponential-fading to 0.0001 over a whole bar would
        // drop the chord to silence within the first half (learned the hard way).
        const hStart = t + attackT;
        const release = o.release != null ? o.release : 0.3;
        g.gain.setValueAtTime(peak, hStart);
        g.gain.exponentialRampToValueAtTime(peak, hStart + o.hold);
        g.gain.linearRampToValueAtTime(0.0001, hStart + o.hold + release);
      } else {
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      }
      osc.connect(g);
      if (o.pan != null && bgm && bgm.gain) {
        bgmSplitStereo(g, o.danger ? bgmDangerNode : bgm.gain, o.pan);
      } else {
        g.connect(o.danger ? bgmDangerNode : bgm.gain);
      }
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }

    // Low open-fifth drone: root + fifth + octave, slow-swelling sines. The deep
    // "hall of echoes" bed - mostly low end, so it feels cavernous, not busy.
    function bgmDrone(bar, t) {
      const th = bgmTheme();
      const stepDur = 60 / th.bpm / 2;
      const root = ftom(bgmRootFreq(), th.chords[bar % th.chords.length]);
      const held = stepDur * 8 - 1.2;
      const attack = 1.1;
      const release = 0.6;
      [
        { f: root,          v: 0.08 },
        { f: root * 1.5,    v: 0.05 },
        { f: root * 2,      v: 0.025 }
      ].forEach((n) => {
        bgmTone(n.f, t, held, { wave: "sine", vol: n.v, attack, hold: Math.max(held - attack - release, 0.2), release });
      });
    }

    // A lone low voice (cello-ish): the melody's foundation, one slow descending-
    // slash-wandering note every bar, grounded in the low register.
    function bgmCello(bar, t, stepDur) {
      const th = bgmTheme();
      const root = ftom(bgmRootFreq(), th.chords[bar % th.chords.length]);
      const idx = bar % th.flute.length;
      const semi = th.flute[idx] - 12;
      const dur = stepDur * 6.2;
      bgmTone(root * Math.pow(SEMI, semi), t, dur, {
        wave: "sine", vol: 0.07, attack: 0.5,
        hold: dur - 0.5 - 0.8, release: 0.8,
        glide: root * Math.pow(SEMI, semi - 1) // a gentle trailing bend
      });
    }

    // Lead voice: the act's "song". Act 1 sings (flute-ish, dorian) and carries the
    // track; Act 2 floats a rare breathy ghost in the reverb; Act 3 is a low
    // horn call. All original material, all mellow.
    function bgmFlute(bar, t, s, stepDur) {
      const th = bgmTheme();
      const root = ftom(bgmRootFreq(), th.chords[bar % th.chords.length]);
      const steps = th.ghost || [3];
      const gi = Math.max(steps.indexOf(s), 0);
      const idx = (bar * 2 + gi) % th.flute.length;
      const dur = stepDur * 3.4;
      const L = th.lead;
      // Subtle stereo spread: slight pan shifts each voice invocation for width
      const pan = ((bar * 3 + gi) % 5 - 2) * 0.12;
      bgmTone(root * Math.pow(SEMI, L.octave + th.flute[idx]), t, dur, {
        wave: L.wave || "sine", vol: L.vol != null ? L.vol : 0.05,
        attack: L.attack != null ? L.attack : 0.35,
        hold: dur - (L.attack != null ? L.attack : 0.35) - 0.9, release: 0.9,
        pan
      });
    }

    // Distant bell: alternate-bar stone whisper (act 2) or a cold tower toll
    // once per progression (act 3). Act 1 has no bell - the flute sings instead.
    // Pitched at the octave above root (low, dark toll), not the 5th above.
    function bgmBell(bar, t, stepDur) {
      const th = bgmTheme();
      const act = bgm.act;
      const root = ftom(bgmRootFreq(), th.chords[bar % th.chords.length]);
      const f = root * 2;
      const dur = stepDur * 7.5;
      const detBase = act === 3 ? 1.004 : 1.0025;
      const det = detBase + (Math.random() - 0.5) * 0.001;
      const vol = act === 3 ? 0.024 : 0.02;
      bgmTone(f, t, dur, { wave: "sine", vol, attack: 0.01, hold: dur - 0.01 - 1.8, release: 1.8, pan: -0.3 });
      bgmTone(f * det, t, dur, { wave: "sine", vol: vol * 0.8, attack: 0.01, hold: dur - 0.01 - 1.8, release: 1.8, pan: 0.3 });
      if (act === 3) bgmTone(f * 1.5, t, dur, { wave: "sine", vol: 0.015, attack: 0.01, hold: dur - 0.01 - 1.8, release: 1.8, pan: 0 });
    }

    function bgmBellOn(bar) {
      const act = bgm.act;
      if (act === 1) return false;
      if (act === 3) return bar === 3;
      return bar % 2 === 1;
    }

    // Deep sine thump sweeping downward - pressure, not punch. Pattern comes from
    // the act's drum map; boss variants drive steadily, field/elite stay sparse.
    function bgmDrums(s, t) {
      const th = bgmTheme();
      const stepDur = 60 / th.bpm / 2;
      const mode = bgm.mode;
      const act = bgm.act;
      const beat = BGM_DRUM_PAT[th.drum](s);
      if (beat) {
        const root = bgmRootFreq() / 4;
        const base = act === 3 ? 0.13 : act === 2 ? 0.11 : 0.10;
        const vol = mode === "boss" ? base + 0.045 : mode === "elite" ? base - 0.02 : base;
        bgmTone(root, t, stepDur * 2.2, { wave: "sine", vol, attack: 0.004, glide: root * 0.45 });
      }
      if (th.drum === "drive" && s % 2 === 1) {
        bgmTone(bgmRootFreq() / 4, t, stepDur * 0.9, { wave: "sine", vol: 0.05, attack: 0.004, glide: bgmRootFreq() / 7 });
      }
    }

    // Low-health layer: two detuned sines a minor third above the root hum
    // slowly against each other - uneasy but warm, no piercing harmonics.
    // Per-act: act 1 wider detune (panic), act 2 standard, act 3 tight (cold dread).
    function bgmDangerStep(s, t) {
      if (!bgmLowHp) return;
      const th = bgmTheme();
      const act = bgm.act;
      const stepDur = 60 / th.bpm / 2;
      const root = ftom(bgmRootFreq(), th.chords[Math.floor(bgm.step / 8) % 4]);
      if (s % 2 === 0) {
        const semi = act === 1 ? 3.5 : act === 3 ? 2.5 : 3;      // wider = more panic
        const detune = act === 1 ? 1.012 : act === 3 ? 1.005 : 1.008;
        const baseVol = act === 1 ? 0.045 : act === 3 ? 0.035 : 0.04;
        const dur = stepDur * 1.7;
        const t3 = root * Math.pow(SEMI, semi);
        bgmTone(t3, t, dur, { wave: "sine", vol: baseVol, attack: 0.3, hold: dur - 0.3 - 0.3, release: 0.3, danger: true });
        bgmTone(t3 * detune, t, dur, { wave: "sine", vol: baseVol * 0.65, attack: 0.3, hold: dur - 0.3 - 0.3, release: 0.3, danger: true });
      }
    }

    function bgmScheduleStep(step, t) {
      const th = bgmTheme();
      const stepDur = 60 / th.bpm / 2;
      // NOTE: chord arrays must have length 4 (or a divisor of 4) to stay in
      // sync with the 4-bar (32-step) loop.  All current arrays are length 4.
      const bar = Math.floor(step / 8) % 4;
      const s = step % 8;
      if (s === 0) {
        bgmDrone(bar, t);
        bgmCello(bar, t, stepDur);
        if (bgmBellOn(bar)) bgmBell(bar, t, stepDur);
      }
      const ghostSteps = th.ghost || [];
      if (ghostSteps.includes(s)) bgmFlute(bar, t, s, stepDur);
      bgmDrums(s, t);
      bgmDangerStep(s, t);
      bgm.step = (bgm.step + 1) % 32;
      if (bgm.step === 0) bgm.loop = (bgm.loop || 0) + 1; // advance A/B section
      bgm.nextT = t + stepDur;
    }

    function bgmScheduler() {
      if (!bgm || !bgm.running || !audioCtx) return;
      const now = audioCtx.currentTime;
      // Crossfade re-arm: once the fade-out has elapsed, flip the theme and
      // fade the new act/mode back in.
      if (bgm._flip && now >= bgm._flip.at) {
        bgm.act = bgm._flip.act;
        bgm.mode = bgm._flip.mode;
        bgm.step = 0;
        bgm.loop = 0;
        bgm.nextT = now + 0.01;
        bgm._flip = null;
        bgmUpdateReverb();
        bgm.gain.gain.cancelScheduledValues(now);
        bgm.gain.gain.setTargetAtTime(bgmVol(), now, 0.2);
      }
      while (bgm.nextT < now + 0.2) bgmScheduleStep(bgm.step, Math.max(bgm.nextT, now + 0.01));
    }

    function bgmPlay(act, mode) {
      mode = mode || "field";
      if (settings.musicEnabled === false) return;
      if (!ensureAudio()) return;
      if (bgm && bgm.running && bgm.act === act && bgm.mode === mode) return;
      if (!bgm) bgm = { mode, act, step: 0, loop: 0, nextT: 0, gain: null, running: false };
      if (!bgm.gain) {
        bgm.gain = audioCtx.createGain();
        // Bus compressor + makeup: lets the components run warm but soft, glues
        // the drone + chords + drums together, never pushing the level up.
        bgm.comp = audioCtx.createDynamicsCompressor();
        bgm.comp.threshold.value = -32;
        bgm.comp.knee.value = 6;
        bgm.comp.ratio.value = 2;
        bgm.comp.attack.value = 0.01;
        bgm.comp.release.value = 0.22;
        bgm.make = audioCtx.createGain();
        bgm.make.gain.value = 1.35;
        bgm.gain.connect(bgm.comp);
        bgm.comp.connect(bgm.make);
        bgm.make.connect(audioCtx.destination);
        // A decaying "stone hall" - generated impulse response, cheap and
        // self-contained.  Per-act: act 2 gets a wider, wetter cavern; act 3
        // a tight, cold chamber.  A wet send keeps the pitch content dry and
        // clear while space blooms behind it.
        bgm.rev = audioCtx.createConvolver();
        bgm.rev.buffer = bgmBuildIR(bgm.act);
        const revCfg = BGM_REVERB[bgm.act] || BGM_REVERB[1];
        bgm.revSend = audioCtx.createGain();
        bgm.revSend.gain.value = revCfg.wet;
        bgm.make.connect(bgm.revSend);
        bgm.revSend.connect(bgm.rev);
        bgm.rev.connect(audioCtx.destination);
      }
      if (!bgmDangerNode) {
        bgmDangerNode = audioCtx.createGain();
        bgmDangerNode.gain.value = bgmLowHp ? 1 : 0;
        bgmDangerNode.connect(bgm.gain);
      }
      if (bgm.mode !== mode || bgm.act !== act) {
        // Smooth crossfade: fade out, then flip the theme once the fade has
        // faded (re-armed inside bgmScheduler so nothing races bgmStop's
        // cleanup timer).  No abrupt silence gap between acts/modes.
        bgm.gain.gain.cancelScheduledValues(audioCtx.currentTime);
        bgm.gain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.06);
        bgm._flip = { act, mode, at: audioCtx.currentTime + 0.35 };
        bgm.nextT = audioCtx.currentTime + 0.4; // stay quiet until the flip fires
      } else {
        bgm.gain.gain.setTargetAtTime(bgmVol(), audioCtx.currentTime, 0.25);
      }
      bgm.running = true;
      bgmStarted = true;
      if (!bgmTimer) { bgmTimer = setInterval(bgmScheduler, 60); if (bgmTimer.unref) bgmTimer.unref(); }
      bgmScheduler();
    }

    function bgmStop() {
      if (!bgm) return;
      bgm.running = false;
      bgm._flip = null;
      if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
      if (bgm.gain) bgm.gain.gain.setTargetAtTime(0.001, audioCtx.currentTime, 0.08);
      // Lazy cleanup: let the fade finish, then disconnect the graph so nodes
      // don't accumulate across multiple runs.
      setTimeout(() => {
        if (!bgm || bgm.running) return;
        if (bgm.gain) {
          try { bgm.gain.disconnect(); } catch (_) {}
          try { if (bgm.comp) bgm.comp.disconnect(); } catch (_) {}
          try { if (bgm.make) bgm.make.disconnect(); } catch (_) {}
          try { if (bgm.rev) bgm.rev.disconnect(); } catch (_) {}
          try { if (bgm.revSend) bgm.revSend.disconnect(); } catch (_) {}
          bgm.gain = null; bgm.comp = null; bgm.make = null;
          bgm.rev = null; bgm.revSend = null;
        }
        if (bgmDangerNode) {
          try { bgmDangerNode.disconnect(); } catch (_) {}
          bgmDangerNode = null;
        }
      }, 250);
    }

    function bgmUpdateVolume() {
      if (!bgm || !bgm.gain) return;
      bgm.gain.gain.setTargetAtTime(bgmVol(), audioCtx.currentTime, 0.15);
    }

    // Low health: raise the danger bus (the pulsing layer, not just a volume nudge)
    function bgmSetLowHp(low) {
      bgmLowHp = !!low;
      if (bgmDangerNode && audioCtx) bgmDangerNode.gain.setTargetAtTime(bgmLowHp ? 1 : 0, audioCtx.currentTime, 0.35);
    }

    function bgmInit() {
      if (bgmStarted) return;
      const start = () => {
        const act = (typeof run !== "undefined" && run.currentAct) || 1;
        bgmPlay(act, "field");
        document.removeEventListener("pointerdown", start);
        document.removeEventListener("keydown", start);
      };
      document.addEventListener("pointerdown", start);
      document.addEventListener("keydown", start);

      // Pause the engine the moment the tab stops being visible, resume when
      // it comes back.  Combined with the fade-out in bgmStop() this guarantees
      // the BGM can't keep playing after you leave the game.
      const stopWhenHidden = () => {
        if (!bgm || !bgm.running) return;
        bgmHidden = true;
        bgmStop();
      };
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          stopWhenHidden();
        } else if (bgmHidden && settings.musicEnabled !== false) {
          bgmHidden = false;
          bgmPlay(bgm.act || 1, bgm.mode || "field");
        }
      });
      // Tab-recovery / discard corner case: pagehide covers bfcache restores
      // where visibilitychange may not fire.
      window.addEventListener("pagehide", stopWhenHidden);
    }

    // Must run after every dependency it touches is loaded. settings.js loads
    // first, so this is initiated here — never from settings.js.
    bgmInit();

    // ---------- helpers ----------
