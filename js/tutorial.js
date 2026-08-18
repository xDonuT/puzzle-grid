
    // ─── Tutorial: a separate "Training Grounds" stage before floor 1 ───
    // A Training Dummy (no damage, big HP) lets the player learn match-3 combat
    // via a staged objective checklist. Win = all objectives done.
    const TUT_KEY = "puzzleGridTutorialDone_v1";

    const TUT_OBJECTIVES = [
      { key: "match",   label: "Make a match",           icon: "🔗" },
      { key: "shuffle", label: "Use Shuffle",            icon: "🔀" },
      { key: "endTurn", label: "End your turn",          icon: "⏭️" },
      { key: "ult",     label: "Charge your Ultimate",   icon: "🔥" }
    ];

    let tut = { active: false, then: null, objectives: {} };

    function tutorialDone() {
      try { return localStorage.getItem(TUT_KEY) === "1"; } catch (_) { return false; }
    }
    function setTutorialDone() {
      try { localStorage.setItem(TUT_KEY, "1"); } catch (_) {}
    }

    function tutBarEl() {
      const el = document.getElementById("tutBar");
      if (el) el.classList.toggle("hidden", !tut.active);
      return el;
    }
    function tutOverlayEl() { return document.getElementById("tutorialOverlay"); }
    function tutListEl() { return document.getElementById("tutList"); }

    function resetTutObjectives() {
      tut.objectives = {};
      TUT_OBJECTIVES.forEach(o => tut.objectives[o.key] = false);
    }

    function startTutorial(opts = {}) {
      // Clean slate so the tutorial never touches a saved run.
      resetRun();
      combat.playerClass = combat.playerClass || "ninja";
      resetTutObjectives();
      tut.active = true;
      tut.then = opts.then || null;          // 'run' => Continue starts a real run at floor 1
      tutBarEl();
      renderTutBar();
      // The "Exit" control is in the objective bar; the overlay handles skip too.
      setLog("Training Grounds · learn the basics. The dummy won't fight back.");
      startBattle({ tutorial: true });
      if (typeof playUiClick === "function") playUiClick("primary");
    }

    function markTutorialObjective(key) {
      if (!tut.active) return;
      if (tut.objectives[key]) return;
      tut.objectives[key] = true;
      playCorrect?.();
      renderTutBar();
      if (typeof showBannerCard === "function") {
        const done = TUT_OBJECTIVES.find(o => o.key === key);
        showBannerCard("Objective", done ? done.label : "", "Complete!", "fever");
      }
      if (isTutorialComplete()) completeTutorial();
    }

    function isTutorialComplete() {
      return TUT_OBJECTIVES.every(o => tut.objectives[o.key] === true);
    }

    function renderTutBar() {
      const list = tutListEl();
      if (!list) return;
      list.innerHTML = TUT_OBJECTIVES.map(o => {
        const done = tut.objectives[o.key];
        return `<li class="tut-step ${done ? "done" : ""}">
          <span class="tut-step-icon">${done ? "✅" : o.icon}</span>
          <span class="tut-step-label">${o.label}</span>
        </li>`;
      }).join("");
    }

    function completeTutorial() {
      tut.active = false;
      tut.complete = true;
      setTutorialDone();
      tutBarEl();
      // Brief success banner, then show the victory panel.
      if (typeof showBannerCard === "function") {
        showBannerCard("Training", "All objectives done!", "Continue below", "fever");
      }
      setTimeout(showTutorialVictory, 900);
    }

    function showTutorialVictory() {
      const ov = tutOverlayEl();
      if (!ov) { finishTutorialProceed(); return; }
      ov.classList.add("open");
      // Keep the dummy on screen; this overlay sits above the board.
    }
    function hideTutorialVictory() {
      const ov = tutOverlayEl();
      if (ov) ov.classList.remove("open");
    }

    function finishTutorialProceed() {
      hideTutorialVictory();
      tut.then = null;
      // Start the real campaign at floor 1 (player already chose a class).
      startBattle();
      refreshContinueBtn();
    }

    function exitTutorial() {
      hideTutorialVictory();
      tut.active = false;
      tut.then = null;
      tutBarEl();
      setTutorialDone(); // so the auto-tutorial won't nag again
      gameOver = false;
      busy = false;
      showScreen("menu");
      buildCharPick();
      refreshContinueBtn();
    }

    // Exposed so the game flow can auto-start the tutorial for first-time players.
    function maybeAutoTutorial() {
      return (!tutorialDone());
    }
