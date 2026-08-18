    // ---- Tutorial + contextual tips ----
    // Short, non-blocking guided tour for the first run (floor 1). Each tip is a
    // one-shot milestone that fires on its real event regardless of order, so the
    // tutorial can never get "stuck" showing stale text.
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
      tutCard: null,
      tutText: null,
      sigTimer: null,
      seen: {} // one-shot flags per milestone
    };

    const TUT_SIG = { ninja: "⚔️", wizard: "🛡️", knight: "❤️" };

    function ensureCard() {
      if (!tut.tutCard) tut.tutCard = document.getElementById("tutCard");
      if (!tut.tutText) tut.tutText = document.getElementById("tutText");
    }
    function tutShow(text, arrowTarget, arrowPos, arrowAnim) {
      ensureCard();
      if (!tut.tutCard) return;
      tut.tutCard.classList.remove("hidden");
      tut.tutText.textContent = text;
      hideArrow();
      if (arrowTarget) {
        const el = typeof arrowTarget === "string" ? document.getElementById(arrowTarget) : arrowTarget;
        if (el) showArrow(el, arrowPos || "bottom", arrowAnim || "bounce");
      }
    }
    function tutHide() {
      if (!tut.tutCard) return;
      tut.tutCard.classList.add("hidden");
      clearTutHighlight();
      hideArrow();
    }

    function tutComplete() {
      if (!tut.active) return;
      tut.active = false;
      setTutorialSeen(true);
      tutHide();
    }

    // Called on a fresh New Run (floor 1, no retry/continue)
    function startTutorialIfNeeded() {
      if (getTutorialSeen()) return;
      tut.active = true;
      tut.step = 0;
      tut.seen = {};
      // Step 0: Welcome — point at the BOARD, not the shuffle button
      tutShow(
        "Swap adjacent tiles to match 3+. ⚔️ Damage · ❤️ Heal · 🛡️ Shield · ⭐ Damage (x2 in Meteor!) · 🎲 Mystery!",
        "grid", "bottom"
      );
    }

    function skipTutorial() {
      tutComplete();
    }

    // Called when the run advances past floor 1 (tutorial floor done)
    function tutorialOnFloorAdvance() {
      if (!tut.active) return;
      tutComplete();
    }

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

    // ---- Arrow pointer system ----
    let tutArrowEl = null;
    let tutArrowTarget = null;
    let tutArrowRaf = null;

    function createArrowEl() {
      if (tutArrowEl) return tutArrowEl;
      const el = document.createElement("div");
      el.className = "tut-arrow";
      el.innerHTML = '<svg width="28" height="32" viewBox="0 0 28 32"><polygon points="14,0 0,28 28,28" fill="#ffd700" stroke="#c9a020" stroke-width="2"/></svg>';
      document.body.appendChild(el);
      tutArrowEl = el;
      return el;
    }

    function positionArrow(target, pos) {
      if (!target || !tutArrowEl) return;
      const r = target.getBoundingClientRect();
      const ax = 14, ay = 32;
      let left, top;
      switch (pos) {
        case "top":
          left = r.left + r.width / 2 - ax;
          top = r.top - ay - 6;
          break;
        case "left":
          left = r.left - 28 - 6;
          top = r.top + r.height / 2 - ay / 2;
          break;
        case "right":
          left = r.right + 6;
          top = r.top + r.height / 2 - ay / 2;
          break;
        default: // "bottom"
          left = r.left + r.width / 2 - ax;
          top = r.bottom + 6;
      }
      tutArrowEl.style.left = left + "px";
      tutArrowEl.style.top = top + "px";
    }

    function repositionLoop() {
      if (!tutArrowTarget || !tutArrowEl) return;
      positionArrow(tutArrowTarget, tut._arrowPos || "bottom");
      tutArrowRaf = requestAnimationFrame(repositionLoop);
    }

    function showArrow(targetEl, pos, anim) {
      const el = createArrowEl();
      tutArrowTarget = targetEl;
      tut._arrowPos = pos || "bottom";
      el.classList.remove("bounce", "pulse");
      if (anim === "bounce") el.classList.add("bounce");
      else if (anim === "pulse") el.classList.add("pulse");
      else el.classList.add("bounce");
      positionArrow(targetEl, tut._arrowPos);
      void tutArrowEl.offsetWidth;
      el.classList.add("show");
      if (tutArrowRaf) cancelAnimationFrame(tutArrowRaf);
      tutArrowRaf = requestAnimationFrame(repositionLoop);
    }

    function hideArrow() {
      if (tutArrowEl) tutArrowEl.classList.remove("show");
      tutArrowTarget = null;
      if (tutArrowRaf) { cancelAnimationFrame(tutArrowRaf); tutArrowRaf = null; }
    }

    function showArrowById(id, pos, anim) {
      const el = document.getElementById(id);
      if (el) showArrow(el, pos, anim);
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
        maybeTip("mystery", "🎲 Mystery! A random buff or debuff — during Star Impact it's always a buff.");
      }
      if (shape.isCross) {
        if (shape.crossKind === "l") {
          maybeTip("sealX", "L shape = cross seal! Clears both diagonals and refunds 1 AP.");
        } else {
          maybeTip("sealCross", "T/+ shape = cross seal! Clears the whole row + column and refunds 1 AP.");
        }
      }

      if (!tut.active) return;

      // 1) First match — teach AP + End Turn (always shows first)
      if (!tut.seen.match) {
        tut.seen.match = true;
        tut.step = 1;
        tutShow("Nice! Each swap costs 1 of your 3 AP. When you're done, press End Turn.", "endWrap", "top");
        return;
      }

      // 2) Charged clear (4+ in a line) — one-shot, any time after first match
      const charged = shape.charged || (shape.tags && shape.tags.includes("star"));
      if (!tut.seen.charged && charged) {
        tut.seen.charged = true;
        tutShow("⚡ Charged! Matching 4+ in a line doubles the power!", "btnShuffle", "top");
        return;
      }

      // 3) Signature tile — one-shot, any time after first match
      if (!tut.seen.sig) {
        const sig = (typeof playerSignature === "function" && playerSignature()) || "sword";
        if (matchedList.some(t => t.type === sig)) {
          tut.seen.sig = true;
          tut.step = 4;
          tutShow(
            `That's your signature tile ${TUT_SIG[combat.playerClass] || "⭐"} — matching it charges your ultimate!`,
            "btnShuffle", "top"
          );
          if (typeof board !== "undefined" && typeof ROWS !== "undefined" && typeof COLS !== "undefined") {
            for (let r = 0; r < ROWS; r++) {
              for (let c = 0; c < COLS; c++) {
                if (board[r][c] === sig) { tutHighlight(r, c); r = ROWS; break; }
              }
            }
          }
          if (combat.sigBank >= settings.ultNeed) tutorialOnUltReady();
        }
      }
    }

    function tutorialOnEndTurn() {
      if (!tut.active || tut.seen.endturn) return;
      tut.seen.endturn = true;
      tut.step = 2;
      tutShow("Now the rival takes its turn — out-damage it before it does the same to you!", "enemyPortrait", "left");
    }

    function tutorialOnEnemyTurn() {
      if (!tut.active || tut.seen.enemyturn) return;
      tut.seen.enemyturn = true;
      tut.step = 3;
      tutShow("Watch its moves. Tap any portrait or status chip to read the details.", null);
    }

    function tutorialOnShuffle() {
      if (!tut.active || tut.seen.shuffle) return;
      tut.seen.shuffle = true;
      tutShow("Shuffle rerolls the board. Every 3rd turn it's FREE — use it or lose it!", "btnShuffle", "top");
    }

    function tutorialOnUltReady() {
      maybeTip("ult", "🔥 Ultimate ready! Tap your portrait to unleash it.");
      if (!tut.active || tut.seen.ult) return;
      tut.seen.ult = true;
      tut.step = 5;
      tutShow("🔥 Ultimate ready — tap your portrait to unleash it!", "playerPortrait", "left", "pulse");
    }

    function tutorialOnCombo(level) {
      maybeTip("combo", "🔥 Combo! Chaining clears builds momentum for more damage!");
      // keep the guided card calm — no card spam during the intro
    }

    function tutorialOnFreeShuffleTurn() {
      if (!tut.active) {
        maybeTip("freeShuffle", "🎉 Free shuffle this turn! Use it or lose it!");
        return;
      }
      if (tut.seen.freetip) return;
      tut.seen.freetip = true;
      tutShow("🎉 Free shuffle this turn (every 3rd turn)! The rival gets one too — grab yours first.", "btnShuffle", "top", "pulse");
    }

    function tutorialOnFloorComplete(floor) {
      // Toast, not a stuck card — the run advances and completes the tutorial next battle
      showTipToast("🎁 Floor clear! Pick a reward — some grant permanent bonuses.");
    }

    function tutorialOnPhase(phase) {
      if (phase === "fever") {
        maybeTip("fever", "⭐ Star Fever! ⭐ tiles deal x2 damage — push for big clears!");
      } else if (phase === "impact") {
        maybeTip("impact", "☄️ Star Impact! ⭐ tiles deal x2 AND 🎲 mystery tiles are always buffs!");
      }
    }
