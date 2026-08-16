    function sfxVol(base) {
      if (settings.muted) return 0;
      // Aggressive master scale for mobile speakers
      const scaled = (base || 0.4) * settings.volume * 3.5;
      return Math.max(0, Math.min(1, scaled));
    }

    let audioCtx = null;

    function ensureAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
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

    // Soft, pleasant "pop" – short sine + gentle noise-like transient
    function playPop(pitch = 1, volume = 0.55) {
      volume = sfxVol(volume);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;

      // Main soft tone
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(380 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, t + 0.09);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.15);

      // Tiny high click for definition (very soft)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(900 * pitch, t);
      gain2.gain.setValueAtTime(0.0001, t);
      gain2.gain.exponentialRampToValueAtTime(volume * 0.25, t + 0.005);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(t);
      osc2.stop(t + 0.05);
    }

    function playUiClick(kind = "tap") {
      // Short soft tick for buttons
      const vol = sfxVol(kind === "end" ? 0.55 : 0.42);
      if (vol <= 0) return;
      ensureAudio();
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

    // Bouncy "toink" – a springy pitch-drop (cartoon boing) with a resonant body
    // Technique: triangle osc sweeping fast from high to low, bandpass resonance, quick decay
    function playGooeyPlop(pitch = 1, volume = 0.65) {
      volume = sfxVol(volume);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const filt = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(620 * pitch, t);
      osc.frequency.exponentialRampToValueAtTime(95 * pitch, t + 0.1);

      filt.type = "bandpass";
      filt.frequency.setValueAtTime(900 * pitch, t);
      filt.frequency.exponentialRampToValueAtTime(220 * pitch, t + 0.12);
      filt.Q.value = 2.2;

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(volume * 0.55, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);

      osc.connect(filt);
      filt.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    }

    function playMatch(count) {
      const base = 0.92 + Math.min(count, 5) * 0.03;
      playCorrect(base);
      hapticMatch();
    }

    // "Correct!" answer chime – a bright rising bell ding (quiz-show style)
    function playCorrect(pitch = 1) {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;
      [784, 1046.5].forEach((f, i) => {
        const at = t + i * 0.08;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = "sine";
        o.frequency.value = f * pitch;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(volume, at + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.28);
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start(at);
        o.stop(at + 0.3);

        const o2 = audioCtx.createOscillator();
        const g2 = audioCtx.createGain();
        o2.type = "sine";
        o2.frequency.value = f * 2.76 * pitch;
        g2.gain.setValueAtTime(0.0001, at);
        g2.gain.exponentialRampToValueAtTime(volume * 0.3, at + 0.004);
        g2.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
        o2.connect(g2);
        g2.connect(audioCtx.destination);
        o2.start(at);
        o2.stop(at + 0.22);
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

    function playSparkle(ratio = 3, vol = 0.3) {
      const volume = sfxVol(vol);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(660 * ratio * 0.5, t);
      o.frequency.exponentialRampToValueAtTime(880 * ratio * 0.5, t + 0.08);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(volume, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.18);
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

    // Punchy impact — big hits thump lower and harder
    function playHit(strength = 1, opts = {}) {
      const volume = sfxVol(0.6);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;
      const s = Math.max(0.35, Math.min(1.5, strength));

      const osc = audioCtx.createOscillator();
      const og = audioCtx.createGain();
      const base = opts.down ? 150 : 185;
      osc.type = "sine";
      osc.frequency.setValueAtTime(base * s, t);
      osc.frequency.exponentialRampToValueAtTime(base * 0.45 * s, t + 0.12);
      og.gain.setValueAtTime(0.0001, t);
      og.gain.exponentialRampToValueAtTime(volume * 0.9, t + 0.008);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.connect(og);
      og.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.18);

      playNoiseBurst(t, volume * 0.5, 0.08, 1600);

      const c = audioCtx.createOscillator();
      const cg = audioCtx.createGain();
      c.type = "triangle";
      c.frequency.setValueAtTime(700 * s, t);
      cg.gain.setValueAtTime(0.0001, t);
      cg.gain.exponentialRampToValueAtTime(volume * 0.3, t + 0.004);
      cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      c.connect(cg);
      cg.connect(audioCtx.destination);
      c.start(t);
      c.stop(t + 0.06);
      hapticMatch();
    }

    // Rising two-note chime for healing
    function playHeal() {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      ensureAudio();
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

    // Metallic clink for shield gain
    function playShield() {
      const volume = sfxVol(0.45);
      if (volume <= 0) return;
      ensureAudio();
      const t = audioCtx.currentTime;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(880, t);
      o.frequency.exponentialRampToValueAtTime(720, t + 0.06);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(volume, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.14);
      const o2 = audioCtx.createOscillator();
      const g2 = audioCtx.createGain();
      o2.type = "sine";
      o2.frequency.setValueAtTime(1760, t + 0.01);
      g2.gain.setValueAtTime(0.0001, t + 0.01);
      g2.gain.exponentialRampToValueAtTime(volume * 0.25, t + 0.015);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
      o2.connect(g2);
      g2.connect(audioCtx.destination);
      o2.start(t + 0.01);
      o2.stop(t + 0.1);
    }

    // Low warning hum when the enemy is charging its ultimate
    function playEnemyCharge() {
      const volume = sfxVol(0.5);
      if (volume <= 0) return;
      ensureAudio();
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
      ensureAudio();
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
      ensureAudio();
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
      ensureAudio();
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

    // Distinct ult sting — brighter than match plops
    function playUltSfx(cls = "ninja") {
      const volume = sfxVol(0.72);
      if (volume <= 0) {
        hapticUlt();
        return;
      }
      ensureAudio();
      const t = audioCtx.currentTime;
      const base = cls === "wizard" ? 520 : cls === "knight" ? 280 : 400;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = cls === "knight" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.exponentialRampToValueAtTime(base * (cls === "wizard" ? 1.6 : 0.55), t + 0.22);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cls === "wizard" ? 2200 : 1400, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.28);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(volume * 0.45, t + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.4);

      // High sparkle layer
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(base * 2.2, t);
      osc2.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.15);
      gain2.gain.setValueAtTime(0.0001, t);
      gain2.gain.exponentialRampToValueAtTime(volume * 0.35, t + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(t);
      osc2.stop(t + 0.2);

      hapticUlt();
    }

    // ---------- helpers ----------
