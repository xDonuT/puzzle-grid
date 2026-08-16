    // ---- Tutorial + contextual tips ----
    // Guided, non-blocking tutorial for the first run (floor 1). Narration fires
    // on observed actions; the player is free to play however they like.
    const TUTORIAL_KEY = "puzzleGridTutorialSeen_v1";
    const TIPS_KEY = "puzzleGridSeenTips_v1";

    function getTutorialSeen() {
      try { return localStorage.getItem(TUTORIAL_KEY) === "1"; } catch (_) { return true; }
    }
    function setTutorialSeen(v) {
      try { localStorage.setItem(TUTORIAL_KEY, v ? "1" : "0"); } catch (_) {}
    }
    function getSeenTips() {
      try { return JSON.parse(localStorage.getItem(TIPS_KEY)) || {}; } catch (_) { return {}; }
    }
    function markTipSeen(key) {
      const t = getSeenTips();
      t[key] = true;
      try { localStorage.setItem(TIPS_KEY, JSON.stringify(t)); } catch (_) {}
    }

    const tut = {
      active: false,
      step: 0,
      savedDifficulty: null,
      tutCard: null,
      tutText: null,
      sigTimer: null
    };

    // Signature tile display name per class
    const TUT_SIG = { ninja: "⚔️", wizard: "🛡️", knight: "❤️" };

    function ensureCard() {
      if (!tut.tutCard) tut.tutCard = document.getElementById("tutCard");
      if (!tut.tutText) tut.tutText = document.getElementById("tutText");
    }
    function tutShow(text) {
      ensureCard();
      if (!tut.tutCard) return;
      tut.tutCard.classList.remove("hidden");
      tut.tutText.textContent = text;
    }
    function tutHide() {
      if (!tut.tutCard) return;
      tut.tutCard.classList.add("hidden");
      clearTutHighlight();
    }

    // Restore difficulty after the guided floor (replay/next run stays on the real setting)
    function tutRestoreDifficulty() {
      if (tut.savedDifficulty && settings.difficulty === "easy" && tut.active) {
        settings.difficulty = tut.savedDifficulty;
        persistSettings();
      }
      tut.savedDifficulty = null;
    }

    function tutComplete() {
      if (!tut.active) return;
      tut.active = false;
      tutRestoreDifficulty();
      setTutorialSeen(true);
      tutHide();
    }

    // Called on a fresh New Run (floor 1, no retry/continue)
    function startTutorialIfNeeded() {
      if (getTutorialSeen()) return;
      tut.active = true;
      tut.step = 0;
      tut.savedDifficulty = settings.difficulty;
      settings.difficulty = "easy";
      persistSettings();
      // Nudge the player to make their first match
      tutShow("Welcome to Puzzle Grid! 👋 Tap two adjacent tiles to swap them. Match 3 to clear — ⚔️ damages the rival, ❤️ heals you, 🛡️ shields you, ⭐ damages, 🎲 mystery!");
    }

    function skipTutorial() {
      tutComplete();
    }

    // Called when the run advances past floor 1 (tutorial floor done)
    function tutorialOnFloorAdvance() {
      if (!tut.active) return;
      tutComplete();
      setTutorialSeen(true);
    }

    // Brief highlight pulse on matching tiles to point at something
    function tutHighlight(r, c) {
      clearTutHighlight();
      const el = getCell(r, c);
      if (el) el.classList.add("tut-pulse");
      tut.sigTimer = setTimeout(() => clearTutHighlight(), 6000);
    }
    function clearTutHighlight() {
      if (tut.sigTimer) { clearTimeout(tut.sigTimer); tut.sigTimer = null; }
      document.querySelectorAll(".tut-pulse").forEach(el => el.classList.remove("tut-pulse"));
    }

    // One-time contextual tip — small auto-hiding toast, separate from the tutorial card
    let tipTimer = null;
    function showTipToast(text) {
      const el = document.getElementById("tipToast");
      if (!el) return;
      el.textContent = text;
      el.classList.add("show");
      clearTimeout(tipTimer);
      tipTimer = setTimeout(() => el.classList.remove("show"), 4200);
    }
    function maybeTip(key, text) {
      if (tut.active) return; // the tutorial narrates the first run itself
      if (getSeenTips()[key]) return;
      markTipSeen(key);
      showTipToast(text);
    }

    // ---- Hooks called from board/combat/main ----

    function tutorialOnPlayerMatch(matchedList, shape) {
      // Contextual tips (any run): mystery tiles + seal shapes
      if (matchedList.some(t => t.type === "question")) {
        maybeTip("mystery", "🎲 Mystery! It's a random buff or debuff — during Star Impact it's always a buff.");
      }
      if (shape.isCross) {
        if (shape.crossKind === "l") {
          maybeTip("sealX", "L shape = cross seal! Clears both diagonals and refunds 1 AP.");
        } else {
          maybeTip("sealCross", "T/+ shape = cross seal! Clears the whole row + column and refunds 1 AP.");
        }
      }

      if (!tut.active) return;

      if (tut.step === 0) {
        tut.step = 1;
        tutShow("Good! Each swap costs 1 of your 3 actions (AP). When you're out of useful moves, press End Turn to let the rival play.");
      } else if (tut.step === 3 && (shape.charged || (shape.tags && shape.tags.includes("star")))) {
        tut.step = 4;
        tutShow("⚡ Charged! Matching 4+ in a line gives double power. Keep an eye out for those.");
      } else if (tut.step === 4) {
        const sig = (typeof playerSignature === "function" && playerSignature()) || "sword";
        if (matchedList.some(t => t.type === sig)) {
          tut.step = 5;
          tutShow(`That's your signature tile (${TUT_SIG[combat.playerClass] || "⭐"}) — matching it charges your ultimate, shown below your HP.`);
          // Point at a signature tile still on the board, if any
          if (typeof board !== "undefined" && typeof ROWS !== "undefined" && typeof COLS !== "undefined") {
            for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if (board[r][c] === sig) { tutHighlight(r, c); r = ROWS; break; }
              }
            }
          }
          // If the ultimate is already full, the banner already passed — finish now
          if (combat.sigBank >= settings.ultNeed) tutorialOnUltReady();
        }
      }
    }

    function tutorialOnEndTurn() {
      if (!tut.active || tut.step !== 1) return;
      tut.step = 2;
      tutShow("Now the rival matches tiles too — out-damage it before it out-damages you!");
    }

    function tutorialOnEnemyTurn() {
      if (!tut.active || tut.step !== 2) return;
      tut.step = 3;
      tutShow("Watch the rival's moves. You can tap a status chip or the portraits any time to read details.");
    }

    function tutorialOnUltReady() {
      maybeTip("ult", "🔥 Ultimate ready! Tap your portrait to unleash it.");
      if (!tut.active || tut.step !== 5) return;
      tut.step = 6;
      tutShow("🔥 Your ultimate is ready — tap your portrait to unleash it!");
    }

    function tutorialOnPhase(phase) {
      if (phase === "fever") {
        maybeTip("fever", "⭐ Star Fever! Your signature tile is boosted — match it for extra value.");
      } else if (phase === "impact") {
        maybeTip("impact", "☄️ Star Impact! Mystery tiles are now always a buff — safe to clear 🎲.");
      }
    }
