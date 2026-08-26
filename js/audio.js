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

    // Distinct ult sting — brief rise-up before the main impact
    function playUltSfx(cls = "ninja") {
      const volume = sfxVol(0.72);
      if (volume <= 0) {
        hapticUlt();
        return;
      }
      if (!ensureAudio()) return;
      const t = audioCtx.currentTime;
      const base = cls === "wizard" ? 520 : cls === "knight" ? 280 : 400;

      // Rise-up: 200ms ascending tone that builds anticipation
      const rise = audioCtx.createOscillator();
      const riseGain = audioCtx.createGain();
      rise.type = "sine";
      rise.frequency.setValueAtTime(base * 0.6, t);
      rise.frequency.exponentialRampToValueAtTime(base * 1.2, t + 0.2);
      riseGain.gain.setValueAtTime(0.0001, t);
      riseGain.gain.linearRampToValueAtTime(volume * 0.35, t + 0.08);
      riseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      rise.connect(riseGain);
      riseGain.connect(audioCtx.destination);
      rise.start(t);
      rise.stop(t + 0.22);

      // Main impact starts after rise-up
      const t2 = t + 0.18;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = cls === "knight" ? "triangle" : "sine";
      osc.frequency.setValueAtTime(base, t2);
      osc.frequency.exponentialRampToValueAtTime(base * (cls === "wizard" ? 1.6 : 0.55), t2 + 0.22);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(cls === "wizard" ? 2200 : 1400, t2);
      filter.frequency.exponentialRampToValueAtTime(600, t2 + 0.28);
      gain.gain.setValueAtTime(0.0001, t2);
      gain.gain.exponentialRampToValueAtTime(volume, t2 + 0.02);
      gain.gain.exponentialRampToValueAtTime(volume * 0.45, t2 + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.38);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t2);
      osc.stop(t2 + 0.4);

      // High sparkle layer
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(base * 2.2, t2);
      osc2.frequency.exponentialRampToValueAtTime(base * 0.9, t2 + 0.15);
      gain2.gain.setValueAtTime(0.0001, t2);
      gain2.gain.exponentialRampToValueAtTime(volume * 0.35, t2 + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.18);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.2);

      hapticUlt();
    }

    // ---------- BGM system ----------
    const BGM_FILES = {
      1: "music/Little Sprout.mp3",
      2: "music/Petal Peak.mp3",
      3: "music/Combo Blitz.mp3"
    };

    let bgmCurrent = null;
    let bgmStarted = false;
    let bgmFadeTimer = null;

    function bgmVol() {
      if (settings.muted || settings.musicEnabled === false) return 0;
      return Math.max(0, Math.min(0.5, (settings.musicVolume || 0.5) * 0.5));
    }

    function bgmFadeTo(el, target, duration) {
      if (bgmFadeTimer) clearInterval(bgmFadeTimer);
      const startVol = el.volume;
      const steps = Math.max(1, Math.round(duration / 50));
      const stepTime = duration / steps;
      const delta = (target - startVol) / steps;
      let i = 0;
      bgmFadeTimer = setInterval(() => {
        i++;
        el.volume = Math.max(0, Math.min(1, el.volume + delta));
        if (i >= steps) {
          clearInterval(bgmFadeTimer);
          bgmFadeTimer = null;
          el.volume = target;
        }
      }, stepTime);
    }

    function bgmPlay(act) {
      if (settings.musicEnabled === false) return;
      const file = BGM_FILES[act] || BGM_FILES[1];
      if (bgmCurrent && bgmCurrent.act === act && !bgmCurrent.el.paused) return;

      // Fade out old
      if (bgmCurrent && bgmCurrent.el) {
        const old = bgmCurrent.el;
        const oldVol = old.volume;
        bgmFadeTo(old, 0, 1200);
        setTimeout(() => { try { old.pause(); old.currentTime = 0; old.volume = oldVol; } catch(_){} }, 1300);
      }

      const el = new Audio(file);
      el.loop = true;
      el.volume = 0;
      el.preload = "auto";
      el.play().catch(() => {});
      bgmCurrent = { el, act };

      // Fade in
      const target = bgmVol();
      setTimeout(() => { bgmFadeTo(el, target, 1200); }, 100);
      bgmStarted = true;
    }

    function bgmUpdateVolume() {
      if (!bgmCurrent || !bgmCurrent.el) return;
      bgmFadeTo(bgmCurrent.el, bgmVol(), 400);
    }

    function bgmStop() {
      if (!bgmCurrent || !bgmCurrent.el) return;
      const old = bgmCurrent.el;
      const oldVol = old.volume;
      bgmFadeTo(old, 0, 1200);
      setTimeout(() => { try { old.pause(); old.currentTime = 0; old.volume = oldVol; } catch(_){} }, 1300);
      bgmCurrent = null;
    }

    // Low health: muffle BGM with lowpass filter
    let bgmLowHpFilter = null;
    function bgmSetLowHp(low) {
      if (!bgmCurrent || !bgmCurrent.el) return;
      if (low && !bgmLowHpFilter) {
        bgmLowHpFilter = audioCtx.createBiquadFilter();
        bgmLowHpFilter.type = "lowpass";
        bgmLowHpFilter.frequency.value = 800;
        bgmCurrent.el.crossOrigin = "anonymous";
        // Web Audio API can't easily process <audio> elements in all browsers
        // Instead, just duck the volume when low HP
        bgmFadeTo(bgmCurrent.el, bgmVol() * 0.4, 800);
      } else if (!low && bgmLowHpFilter) {
        bgmLowHpFilter = null;
        bgmFadeTo(bgmCurrent.el, bgmVol(), 800);
      }
    }

    let bgmPausedByHidden = false;

    function bgmInit() {
      if (bgmStarted) return;
      const start = () => {
        const act = (typeof run !== "undefined" && run.currentAct) || 1;
        bgmPlay(act);
        document.removeEventListener("pointerdown", start);
        document.removeEventListener("keydown", start);
      };
      document.addEventListener("pointerdown", start, { once: false });
      document.addEventListener("keydown", start, { once: false });

      // Pause BGM when tab/browser goes to background, resume when visible
      document.addEventListener("visibilitychange", () => {
        if (!bgmCurrent || !bgmCurrent.el) return;
        if (document.hidden) {
          if (!bgmCurrent.el.paused) {
            bgmPausedByHidden = true;
            bgmCurrent.el.pause();
          }
        } else if (bgmPausedByHidden && settings.musicEnabled !== false) {
          bgmPausedByHidden = false;
          bgmCurrent.el.play().catch(() => {});
        }
      });
    }

    // ---------- helpers ----------
