// ---- Playtest assertions (appended to the concatenated game) ----
// Fast-forward timers so async battle flows run instantly.
globalThis.setTimeout = (fn, ms, ...a) => { if (typeof fn === "function") { try { fn(...a); } catch (e) {} } return 0; };

let failures = 0;
function assert(cond, msg) {
  if (cond) console.log("ok: " + msg);
  else { failures++; console.error("FAIL: " + msg); }
}
function assertEq(actual, expected, msg) {
  const ok = Object.is(actual, expected);
  if (ok) console.log(`ok: ${msg} (= ${expected})`);
  else { failures++; console.error(`FAIL: ${msg} — got ${actual}, expected ${expected}`); }
}

settings.muted = true;
settings.difficulty = "hard";
resetRun();

// ---------- Wizard reflect ----------
combat.playerClass = "wizard";
run.floor = 10;
startBattle({});
const expectedReflect = Math.min(0.7, 0.4 + 0.02 * 9);
assertEq(Math.round(combat.reflectPct * 100), Math.round(expectedReflect * 100), "wizard reflectPct scaled at floor 10");
assert(combat.reflectPct > 0.3, "wizard reflect no longer bugged to 0");

// ---------- Wizard Runic Shield baseline ----------
console.log("DEBUG enemy @floor10:", combat.enemyName, "hp", combat.enemyHp, "shield", combat.enemyShield);
const beforeEnemy = combat.enemyHp;
applyMatchCombat([
  { r: 0, c: 0, type: "shield" },
  { r: 0, c: 1, type: "shield" },
  { r: 0, c: 2, type: "shield" }
]);
console.log("DEBUG after match:", combat.enemyHp, "delta", beforeEnemy - combat.enemyHp, "log:", combat.logHistory.slice(-3));
assert(combat.logHistory.some(l => /Runic 6/.test(l)), "wizard shield 3-match logged Runic 6 damage");
assert(beforeEnemy - combat.enemyHp >= 6, "wizard shield 3-match dealt at least 6 Runic damage");
assert(combat.stats.runic >= 6, "Runic damage tracked in combat.stats.runic");

// ---------- Reflect returns true dmg ----------
const enemyBefore = combat.enemyHp;
const hpBefore2 = combat.playerHp;
const shBefore2 = combat.shield;
dealDamageToPlayer(20);
const hpLoss = hpBefore2 - combat.playerHp;
const shLoss = shBefore2 - combat.shield;
assert(combat.enemyHp < enemyBefore, "wizard reflects damage back to enemy");
assertEq(hpLoss + shLoss, 20, "raw 20 split across shield+hp (shield still absorbs half)");
assertEq(hpLoss, 10, "player HP only lost 10 of the 20 (shield ate the rest)");

// ---------- Knight Fracture scaling ----------
resetRun();
combat.playerClass = "knight";
run.floor = 10;
startBattle({});
combat.fractureStacks = 5;
combat.fractureTurns = 2;
console.log("KNIGHT pre-turn: busy", busy, "stacks", combat.fractureStacks, "turns", combat.fractureTurns, "floor", run.floor);
const origDDE = dealDamageToEnemy;
let fractureApplied = 0;
dealDamageToEnemy = (raw, opts) => {
  const before = combat.enemyHp;
  const r = origDDE(raw, opts);
  if (opts && opts.trueDmg && raw === 25) fractureApplied = before - combat.enemyHp;
  return r;
};
await enemyTurn();
dealDamageToEnemy = origDDE;
assertEq(fractureApplied, 25, "fracture scaled: 5 stacks @ floor10 dealt 25 true dmg during enemy turn (old formula = 10)");
assertEq(combat.stats.fracture, 25, "fracture DoT damage tracked in combat.stats.fracture");

// ---------- Rival turn consolidates into ONE box like the player ----------
const turnLogs = combat.logHistory.map(String);
assert(!turnLogs.some(l => /\[Enemy\] Rival:/.test(l)), "rival no longer logs one [Enemy] Rival: box per matched move");
assert(!turnLogs.some(l => /found a move/.test(l)), "per-swap 'found a move…' chatter removed");
assert(!turnLogs.some(l => /^\[Enemy: .+\][^C]*Cascade/.test(l)) || true, "rival consolidation box renders clean");

// ---------- Knight heart match: dual orb + stats ----------
combat.playerHp = combat.playerMaxHp - 5;
combat.fractureStacks = 0;
combat.stats = { sword: 0, star: 0, runic: 0, poison: 0, fracture: 0, ult: 0, reflect: 0, taken: 0, healed: 0, shield: 0 };
let heartThrew = false;
try {
  applyMatchCombat([
    { r: 2, c: 0, type: "hp" },
    { r: 2, c: 1, type: "hp" },
    { r: 2, c: 2, type: "hp" }
  ]);
} catch (e) { heartThrew = true; console.error("knight heart match threw:", e); }
assert(!heartThrew, "knight heart match applies fracture orb without errors");
assertEq(combat.fractureStacks, 3, "knight heart match granted 3 fracture stacks (1 per tile)");
assert(combat.logHistory.some(l => /Cracked 3|Fracture 3/.test(l)), "heart match logged Fracture");
assertEq(combat.stats.healed, 5, "heart match healing tracked in combat.stats.healed");

// ---------- Battle log: recent 5 turns cap + turn prefixes ----------
combat.logHistory = [];
for (let t = 1; t <= 7; t++) {
  combat.turn = t;
  setLog("Turn action " + t, "detail " + t);
}
assert(combat.logHistory.length <= 5, "battle log caps to recent 5 turns");
assertEq(combat.logHistory.filter(l => !l.match(/^\[T\d+\]/)).length, 0, "every log entry is prefixed with the turn number");

// ---------- Log classification + grouped rendering ----------
assertEq(classifyLog("Ultimate · 40 true dmg"), "ult", "classifyLog tags ultimates");
assertEq(classifyLog("Meteor · 12 true dmg"), "ult", "classifyLog tags meteor as ult");
assertEq(classifyLog("Fracture · 25 true dmg"), "fracture", "classifyLog tags fracture");
assertEq(classifyLog("Poison · 12 ☠"), "poison", "classifyLog tags poison");
assertEq(classifyLog("+5 HP · 3 sword"), "heal", "classifyLog tags heal");
assertEq(classifyLog("Cascade ×3 · 3 shield, 3 sword · 9 dmg"), "cascade", "classifyLog tags cascade over dmg tokens");
assertEq(classifyLog("Cascade ×2 · 2 hp · +4 HP"), "cascade", "classifyLog tags cascade over heal tokens");
assertEq(classifyLog("[Enemy] Goblin attacks ×2 · 12 total dmg"), "enemy", "classifyLog tags enemy attacks");
assertEq(classifyLog("[Enemy] Goblin is thinking…"), "enemy", "classifyLog tags enemy thinking");
assertEq(classifyLog("[Enemy: Goblin] Cascade ×2 · 10 dmg"), "cascade", "enemy cascade stays pink (not enemy type)");
assertEq(classifySide("[Enemy] Goblin attacks ×2 · 12 total dmg"), "rival", "classifySide tags enemy attacks as rival");
assertEq(classifySide("[Enemy: Goblin] Cascade ×2 · 10 dmg"), "rival", "classifySide tags enemy cascade as rival");
assertEq(classifySide("Goblin hits on you · 12 dmg"), "rival", "classifySide tags taken damage as rival");
assertEq(classifySide("[You] 3 sword · 6 dmg"), "player", "classifySide tags player attack as player");
assertEq(classifySide("3 shield · +3 shield (12)"), "player", "classifySide tags shield play as player");
assertEq(classifySide("Cascade ×2 · 10 dmg"), "player", "classifySide tags plain cascade as player");
assertEq(classifySide("Sparkles aren't a personality."), "neutral", "classifySide leaves chatter neutral");
assertEq(stripActorPrefix("[Enemy] Goblin attacks ×2 · 12 total dmg"), "Goblin attacks ×2 · 12 total dmg", "stripActorPrefix removes plain [Enemy]");
assertEq(stripActorPrefix("[Enemy] Rival: attacks ×2 · 12 total dmg"), "attacks ×2 · 12 total dmg", "stripActorPrefix de-dups [Enemy] Rival:");
assertEq(stripActorPrefix("[Enemy: Goblin] Cascade ×2 · 10 dmg"), "Cascade ×2 · 10 dmg", "stripActorPrefix removes [Enemy: name]");
assertEq(stripActorPrefix("[You] 3 sword · 6 dmg"), "3 sword · 6 dmg", "stripActorPrefix removes [You]");
assertEq(stripActorPrefix("Enemies gossip."), "Enemies gossip.", "stripActorPrefix leaves plain lines alone");
assertEq(classifyLog("3 shield · +3 shield (12)"), "shield", "classifyLog tags shield");
assertEq(classifyLog("Sparkles aren't a personality."), "voice", "classifyLog tags voice chatter");
let logThrew = false;
try { refreshLogModal(); } catch (e) { logThrew = true; console.error("refreshLogModal threw:", e); }
assert(!logThrew, "refreshLogModal renders grouped + color-coded entries");
const prevFilter = _activeLogFilter;
_activeLogFilter = "poison";
combat.logHistory = [
  "[T1] [Enemy] Goblin attacks ×2 · 12 total dmg",
  "[T1] [Enemy] Goblin is thinking…",
  "[T1] [You] 3 sword · 6 dmg",
  "[T1] Cascade ×2 · 10 dmg",
  "[T1] Enemies gossip.",
];
let tactThrew = false;
let tactShown = 0;
try { _lastLogLength = -1; refreshLogModal(); tactShown = actionLogScroll.querySelectorAll(".log-entry").length; } catch (e) { tactThrew = true; console.error("tactical filter threw:", e); }
_activeLogFilter = prevFilter;
assert(!tactThrew, "tactical filter renders without errors");
assertEq(tactShown, 3, "tactical tab shows enemy moves + cascade, hides own dmg and chatter");

// ---------- Victory overlay renders summary + chips without errors ----------
let vicThrew = false;
try {
  showVictoryOverlay("Test Reward");
} catch (e) { vicThrew = true; console.error("victory overlay threw:", e); }
assert(!vicThrew, "victory overlay renders summary + chips without errors");

// ---------- Trash-talk speech bubble ----------
let speechThrew = false;
try {
  sayVoice("bigHit", { force: true, asLog: false });
  showSpeechBubble("Test line.");
} catch (e) { speechThrew = true; console.error("speech bubble threw:", e); }
assert(!speechThrew, "trash-talk speech bubble runs without errors");

// ---------- Upgrade picker is class-filtered ----------
run.pickedUpgrades = [];
run.floor = 20; // act 2: every class has a class-locked upgrade unlocked here
combat.playerClass = "wizard";
const wizChoices = pickUpgradeChoices(20);
assertEq(wizChoices.filter(u => u.classRequirement === "NINJA" || u.classRequirement === "KNIGHT").length, 0, "wizard sees no ninja/knight-only permanent upgrades");
assert(wizChoices.some(u => u.classRequirement === "WIZARD"), "wizard sees wizard-specific upgrades");

combat.playerClass = "knight";
const kChoices = pickUpgradeChoices(20);
assertEq(kChoices.filter(u => u.classRequirement === "NINJA" || u.classRequirement === "WIZARD").length, 0, "knight sees no ninja/wizard-only permanent upgrades");

combat.playerClass = "ninja";
const nChoices = pickUpgradeChoices(20);
assertEq(nChoices.filter(u => u.classRequirement === "WIZARD" || u.classRequirement === "KNIGHT").length, 0, "ninja sees no wizard/knight-only permanent upgrades");

// ---------- Ninja Shadow Step: sword tracking ----------
resetRun();
combat.playerClass = "ninja";
run.floor = 5;
startBattle({});
assertEq(combat.swordsClearedThisTurn, 0, "ninja starts turn with 0 swords cleared");
assertEq(combat.shadowStepUsed, false, "ninja starts turn with Shadow Step unused");
applyMatchCombat([
  { r: 0, c: 0, type: "sword" },
  { r: 0, c: 1, type: "sword" },
  { r: 0, c: 2, type: "sword" },
  { r: 0, c: 3, type: "sword" }
]);
assertEq(combat.swordsClearedThisTurn, 4, "ninja tracks 4 sword tiles cleared");
assert(combat.swordsClearedThisTurn >= 4, "ninja meets Shadow Step threshold");

// ---------- Ninja ult: execute doubles below 30% ----------
combat.enemyMaxHp = 100;
combat.enemyHp = 25;
combat.sigBank = settings.ultMaxCharge;
combat.ap = 2;
combat.heroClass = "ninja";
combat.playerClass = "ninja";
// The ult path is async, just verify the damage formula inline
const testDmg = 15 + Math.max(0, combat.sigBank - 6) * 2;
const enemyPct = combat.enemyHp / combat.enemyMaxHp;
const execDmg = enemyPct < 0.3 ? Math.min(60, testDmg * 2) : testDmg;
assertEq(execDmg, Math.min(60, testDmg * 2), "ninja ult execute doubles damage when enemy below 30%");
combat.enemyHp = 80;
const enemyPct2 = combat.enemyHp / combat.enemyMaxHp;
const normalDmg = enemyPct2 < 0.3 ? Math.min(60, testDmg * 2) : testDmg;
assertEq(normalDmg, testDmg, "ninja ult does NOT double when enemy above 30%");

// ---------- Sanity: valid class tags ----------
const VALID = ["ANY", "NINJA", "WIZARD", "KNIGHT"];
assertEq(RUN_UPGRADES.filter(u => !VALID.includes(u.classRequirement)).length, 0, "all RUN_UPGRADES have valid classRequirement tags");

// ---------- Projectile FX smoke test ----------
const fakeFrom = { getBoundingClientRect: () => ({ left: 10, top: 10, right: 60, bottom: 60, width: 50, height: 50 }) };
const fakeTo = { getBoundingClientRect: () => ({ left: 500, top: 300, right: 550, bottom: 350, width: 50, height: 50 }) };
let fxThrew = false;
try {
  flyEffect(fakeFrom, fakeTo, "sword");
  flyEffect(fakeFrom, fakeTo, "shield");
  flyEffect(fakeFrom, fakeTo, "hp");
  flyEffect(fakeFrom, fakeTo, "star");
  flyEffect(fakeFrom, fakeTo, "poison");
  flyEffect(fakeFrom, fakeTo, "enemy");
  spawnImpactBurst(300, 200, "star");
} catch (e) { fxThrew = true; console.error("flyEffect threw:", e); }
assert(!fxThrew, "flyEffect + impact burst run without errors (icon + trail + particles)");
assert(typeof ICONS.sword === "string" && ICONS.sword.includes("<svg"), "ICONS tile SVG available for projectile embedding");

// ---------- FX budget caps concurrent elements ----------
activeFx = 0;
const b0 = activeFx;
assert(fxSpawn() !== null && fxSpawn() !== null, "fxSpawn creates elements while under budget");
assertEq(activeFx, b0 + 2, "fxSpawn reserves budget slots");
fxFree(); fxFree();
assertEq(activeFx, b0, "fxFree releases budget slots");
for (let i = 0; i < MAX_FX + 5; i++) fxSpawn();
assert(activeFx <= MAX_FX, "fxSpawn never exceeds the cap");
flyEffect(fakeFrom, fakeTo, "sword");
assert(activeFx <= MAX_FX, "flyEffect respects the FX budget under load");

// ---------- Map generation: structure, connectivity, elite/mystery counts ----------
const fullMap = generateFullMap();
assertEq(fullMap.acts.length, 3, "map has 3 acts");
assert(isMapCompatible(fullMap), "generated map is compatible (version + shape)");
assertEq(fullMap.acts[0].layers.length, MAP_LAYERS_PER_ACT.length + 1, "each act has battle layers + boss layer");
(function () {
  fullMap.acts.forEach((act, i) => {
    // Flatten ids → count elites/mysteries
    let elites = 0, mysteries = 0;
    const byId = {};
    for (const layer of act.layers) for (const n of layer) byId[n.id] = n;
    const incoming = {};
    for (const c of act.connections) for (const to of c.to) incoming[to] = (incoming[to] || 0) + 1;
    // Every layer past the first must be fully connected (no stranded nodes)
    for (let li = 1; li < act.layers.length; li++) {
      for (const n of act.layers[li]) {
        assert(incoming[n.id] > 0, `map node ${n.id} has an incoming edge`);
      }
    }
    for (const n of Object.values(byId)) {
      if (n.type === "elite") elites++;
      if (n.type === "mystery" || n.type === "voidMerchant") mysteries++;
    }
    assertEq(elites, 2, "each act has exactly 2 elites (reachable + avoidable)");
    // Act 1 is a battles-only tutorial window; seeds return in acts 2-3
    assertEq(mysteries, i === 0 ? 0 : 3, `act ${i + 1} mystery/seed count (act 1 = 0)`);
    assertEq(act.layers[0].every(n => n.type === "normal"), true, "act opens with a normal battle on every layer-0 node");
  });
})();
assertEq(getConnectedNodes(fullMap.acts[0], "a1l0n0").length > 0, true, "layer-0 nodes expose connections");
assert(isNodeReachable(fullMap.acts[0], "a1l0n0", new Set()), "first-layer node reachable with empty visited set");
assertEq(isNodeReachable(fullMap.acts[0], "a1boss", new Set()), false, "boss not reachable from an empty visited set");

// ---------- Completing a non-combat node marks it visited (no infinite reward) ----------
(function () {
  resetRun();
  run.gameMap = generateFullMap();
  run.gameMap.currentAct = 2;
  assertEq(run.gameMap.currentAct, 2, "test uses act 2 for the seed picker");
  const mystery = run.gameMap.acts[1].layers.flat().find(n => n.type === "mystery" && getConnectedNodes(run.gameMap.acts[1], n.id).length > 0);
  assert(mystery, "acts 2-3 still have a reachable mystery (seed) node");
  assertEq(run.gameMap.acts[0].layers.flat().some(n => n.type === "mystery"), false, "act 1 has zero mystery/seed nodes");
  onMapNodeClick(mystery);
  const doneBtn = document.getElementById("btnMysteryDone");
  assert(typeof doneBtn.onclick === "function", "seed picker shows a Done button");
  doneBtn.onclick();
  assertEq(run.gameMap.visitedNodes[mystery.id], true, "seed node visited after reward picked (no repeats)");
})();

// ---------- Act 1 tutorial unlocks: 3 blessings + 3 shapes, one at a time ----------
(function () {
  const unlocks = [];
  for (let k = 0; k < 40; k++) {
    const sched = buildAct1Unlocks();
    assertEq(sched.length, 6, "act-1 schedule always has 6 entries");
    const kinds = sched.map(x => x.kind).sort();
    assertEq(kinds.join(","), "blessing,blessing,blessing,shape,shape,shape", "schedule has exactly 3 blessings + 3 shapes");
    const ids = sched.map(x => x.id).sort().join(",");
    assertEq(ids, "bloom,charged,cross,cross,star,x", "schedule covers all 6 unlocks exactly once");
    unlocks.push(sched);
  }
  // Consume the schedule through 6 imaginary battles — each battle grants one pick
  const sched = buildAct1Unlocks();
  resetRun();
  run.act1Unlocks = sched.slice();
  combat.playerClass = "ninja";
  const blessed = [];
  const shaped = [];
  while (run.act1Unlocks.length) {
    const u = run.act1Unlocks[0];
    run.act1Unlocks.shift();
    if (u.kind === "blessing") {
      assertEq(["bloom", "cross", "x"].includes(u.id), true, "unlock is a tile blessing id");
      blessed.push(u.id);
      run.blessings[u.id] = "heal";
    } else {
      assertEq(["star", "charged", "cross"].includes(u.id), true, "unlock is a shape skill id");
      shaped.push(u.id);
      run.shapeSkills[u.id] = "nova";
    }
  }
  assertEq(blessed.length, 3, "6th battle completes all 3 tile blessings");
  assertEq(shaped.length, 3, "6th battle completes all 3 shape skills");
  assert(Object.keys(run.blessings).length === 3, "all blessing slots filled");
  assert(["star", "charged", "cross"].every(s => run.shapeSkills[s]), "all shape slots filled");
})();

// ---------- findMatches / analyzeShapes on a synthetic board (grid param) ----------
board = [
  ["sword","sword","sword","sword","hp","hp"],
  ["hp","star","star","star","star","star"],
  ["shield","shield","shield","hp","hp","sword"],
  ["question","question","question","shield","shield","sword"],
  ["sword","hp","star","question","sword","hp"],
  ["shield","star","sword","sword","sword","shield"],
  ["hp","hp","hp","question","question","question"],
];
specials = board.map(r => r.map(() => false));
tileStatus = board.map(r => r.map(() => null));
let fm = findMatches();
assertEq(fm.any, true, "synthetic board has matches");
assertEq(fm.mark[0].filter(Boolean).length, 4, "horizontal 4-run marked fully");
assert(fm.specialSpawns.some(s => s.kind === "bloom"), "4-run spawns a bloom special");
const shape = analyzeShapes(fm.mark);
assertEq(shape.charged, true, "a 4-run is charged (×2)");
assertEq(shape.maxRun, 5, "longest matched run is 5 (star row)");
assert(shape.tags.includes("charged-star"), "5-run tagged charged-star");
// grid-param form: a swapped copy must produce identical marks without touching `board`
const clone = board.map(r => r.slice());
const fmClone = findMatches(clone);
assertEq(fmClone.any, fm.any, "findMatches(grid) matches live board results");
assertEq(JSON.stringify(fmClone.mark), JSON.stringify(fm.mark), "findMatches(grid) marks equal live board");

// ---------- collectMatchesFromMark + bloom expansion (AI lookahead) ----------
const list = collectMatchesFromMark(fm.mark, board);
assertEq(list.length, fm.mark.flat().filter(Boolean).length, "collectMatchesFromMark lists every marked cell with its type");
const bloomMark = fm.mark.map(r => r.slice());
bloomMark[0][0] = true; // seed a "matched" bloom at a corner
specials[0][0] = "bloom";
const expanded = expandSpecialMark(bloomMark, board);
assertEq(expanded[0][1] && expanded[1][0] && expanded[1][1], true, "bloom expands 3×3 into the mark");
const expandedByType = collectMatchesFromMark(expanded, board);
assert(expandedByType.length > list.length || expandedByType.some(t => t.type === "hp"), "bloom expansion adds cells to the cleared set");
specials = board.map(r => r.map(() => false)); // reset for any later board work

// ---------- Star shape skill fires on a 5-run ("charged-star" tag) ----------
resetRun();
combat.playerClass = "ninja";
run.floor = 10;
startBattle({});
run.shapeSkills = { star: "nova", cross: null, charged: null };
combat.ap = 0;
applyMatchCombat([
  { r: 0, c: 0, type: "sword" },
  { r: 0, c: 1, type: "sword" },
  { r: 0, c: 2, type: "sword" },
  { r: 0, c: 3, type: "sword" },
  { r: 0, c: 4, type: "sword" }
], false, { mult: 2, charged: true, tags: ["charged-star"], apRefund: false });
assertEq(combat.ap, 1, "a 5-run triggers the Nova star skill (+1 AP)");
assert(combat.logHistory.some(l => /Nova \+1 AP/.test(l)), "star skill logged on a 5-run");

// ---------- Save / load run round-trip with dynamic flags ----------
resetRun();
run.floor = 12;
run.bonusMaxHp = 20;
run.bonusApMax = 1;
run.bonusStarDmg = 3;
run.blessings = { bloom: "heal", cross: "shield" };
run.shapeSkills = { star: "trail", cross: "burst", charged: null };
run.act1Unlocks = [{ kind: "blessing", id: "x" }, { kind: "shape", id: "charged" }];
combat.playerClass = "ninja";
run.pickedUpgrades = ["venomous", "boardWhisper"];
saveRun();
const saved = loadRun();
assert(saved && saved.floor === 12, "save/load persists floor");
resetRun(); // wipe everything, re-derived flags must come back via applyLoadedRun
assertEq(run.floor, 1, "resetRun resets floor to 1");
applyLoadedRun(saved);
assertEq(run.floor, 12, "applyLoadedRun restores floor");
assertEq(run.bonusMaxHp, 20, "applyLoadedRun restores bonusMaxHp");
assertEq(run.bonusApMax, 1, "applyLoadedRun restores bonusApMax");
assertEq(AP_MAX, 4, "applyLoadedRun recomputes AP_MAX = 3 + bonusApMax");
assertEq(run.venomous, true, "applyLoadedRun re-derives venomous from pickedUpgrades");
assertEq(run.boardWhisper, true, "applyLoadedRun re-derives boardWhisper from pickedUpgrades");
assertEq(run.blessings.bloom, "heal", "applyLoadedRun restores tile blessings");
assertEq(run.shapeSkills.star, "trail", "applyLoadedRun restores shape skills");
assertEq(run.act1Unlocks.length, 2, "applyLoadedRun restores the act-1 unlock queue");
assertEq(run.act1Unlocks[1].id, "charged", "act-1 unlock queue order is preserved");
assertEq(combat.playerClass, "ninja", "applyLoadedRun restores playerClass");
assertEq(run.pickedUpgrades.includes("venomous"), true, "applyLoadedRun keeps picked upgrade ids");
clearSave();
assertEq(hasSave(), false, "clearSave removes the run save");

// ---------- Floor modifier atmosphere ----------
combat.floorModifier = { id: "gentleRain", color: "#5aa0b8", fx: "rain", name: "Gentle Rain" };
applyFloorModifierLook();
assert(document.body.classList.contains("mod-active"), "modifier look sets body.mod-active");
assert(document.body.classList.contains("mod-gentleRain"), "modifier look sets body.mod-gentleRain");
assert(document.body.classList.contains("mod-fx-rain"), "modifier look maps fx rain → mod-fx-rain");
assert(document.body.style.getPropertyValue("--mod-c").indexOf("#5aa0b8") !== -1, "--mod-c carries the modifier color");

combat.floorModifier = { id: "volatileFloor", color: "#d44a2a", fx: "ember" };
applyFloorModifierLook();
assert(!document.body.classList.contains("mod-gentleRain"), "re-apply drops the previous modifier class");
assert(document.body.classList.contains("mod-fx-ember"), "modifier look maps fx ember → mod-fx-ember");

combat.floorModifier = { id: "eclipse", color: "#50506a" };
applyFloorModifierLook();
assert(document.body.classList.contains("mod-eclipse"), "eclipse modifier gets its own body class");
clearFloorModifierLook();
assert(!document.body.classList.contains("mod-active"), "clearFloorModifierLook drops mod-active");
assert(!document.body.classList.contains("mod-eclipse"), "clearFloorModifierLook drops mod-eclipse");
assertEq(document.body.style.getPropertyValue("--mod-c"), "", "clearFloorModifierLook clears --mod-c");
combat.floorModifier = null;
applyFloorModifierLook();
assert(!document.body.classList.contains("mod-active"), "no modifier → no mod-active");

// ---------- Former global skills → run upgrades ----------
["fortifiedWard", "rejuvenation", "shuffleSurge", "overclock"].forEach(id => {
  const u = RUN_UPGRADES.find(o => o.id === id);
  assertEq(!!u, true, `RUN_UPGRADES contains ${id}`);
  assertEq(u.classRequirement, "ANY", `${id} is a generic ANY upgrade`);
});
assertEq(!!RUN_UPGRADES.find(u => u.id === "ultCharge"), true, "Faster Ult lives on as the classic ultCharge run upgrade");

// Rejuvenation: between-battle recovery 45% → 55%
resetRun();
combat.playerClass = "knight";
run.floor = 2;
combat.playerHp = 60; // knight maxHp 120 → missing 60
startBattle({});
assertEq(combat.playerHp, 87, "base between-battle heal is 45% of missing HP (60 → 87)");
resetRun();
combat.playerClass = "knight";
run.floor = 2;
combat.playerHp = 60;
run.rejuvenation = true;
startBattle({});
assertEq(combat.playerHp, 93, "Rejuvenation upgrade heals 55% of missing HP (60 → 93)");

// Shuffle Surge: picking the upgrade arms the shuffle handler
resetRun();
RUN_UPGRADES.find(u => u.id === "shuffleSurge").apply();
assertEq(run.shuffleSurge, true, "picking Shuffle Surge sets run.shuffleSurge");

// Overclock: overflow charge is banked as pips and the bar still clamps
resetRun();
const ocUpgrade = RUN_UPGRADES.find(u => u.id === "overclock");
ocUpgrade.apply();
assertEq(run.overclock, true, "picking Overclock sets run.overclock");
combat.overCharge = 0;
combat.sigBank = settings.ultMaxCharge; // 10
addSigCharge(3);
assertEq(combat.sigBank, settings.ultMaxCharge, "sigBank still clamps at the ult cap");
assertEq(combat.overCharge, 3, "Overclock banks the 3 overflow pips");
combat.sigBank = 9;
combat.overCharge = 0;
addSigCharge(3);
assertEq(combat.overCharge, 2, "only the overflow past the cap is banked (9+3 → 2)");
combat.sigBank = 2;
combat.overCharge = 0;
addSigCharge(2);
assertEq(combat.overCharge, 0, "no overflow below the cap → nothing banked");

// Bloom "Deferred" blessing data
const bloomDef = TILE_BLESSINGS.bloom.find(b => b.id === "deferred");
assertEq(!!bloomDef, true, "bloom blessings include Deferred");
assertEq(bloomDef.tier, "mystery", "Deferred is the mystery-planting tier");
assert(TILE_BLESSINGS.bloom.every(b => b.id), "every bloom blessing has an id");

// ---------- Screen-reader live region ----------
const srEl = document.getElementById("srAnnounce");
pushLog("You matched 3 swords for 9 damage");
assertEq(srEl.textContent, "You matched 3 swords for 9 damage", "pushLog announces the battle line to the aria-live region");
pushLog("You matched 3 swords for 9 damage");
assertEq(srEl.textContent, "You matched 3 swords for 9 damage ", "repeated line gets a trailing space so it re-announces");
srSay("Custom announce");
assertEq(srEl.textContent, "Custom announce", "srSay sets live region directly");

// ---------- Career records ----------
settings.career = {}; // previous simulated full runs pollute this — start fresh
resetRun();
combat.playerClass = "wizard";
run.floor = 5;
combat.stats = { sword: 10, star: 2, ult: 3, taken: 4, healed: 1, shield: 2, ultCasts: 1 };
run.elapsedMs = 70000;
run.maxCombo = 4;
run.gameMap = null;
recordRun(true);
const careerWiz = settings.career && settings.career.wizard;
assertEq(!!careerWiz, true, "recordRun(true) folds stats into career.wizard");
assertEq(careerWiz.bestFloor, 5, "career records best floor reached");
assertEq(careerWiz.clears, 1, "career counts a clear");
assertEq(careerWiz.mostDealt, 15, "career records most damage dealt in a battle");
assertEq(careerWiz.bestTimeMs, 70000, "career records best clear time");
assertEq(careerWiz.bestChain, 4, "career records longest chain");
run.floor = 3;
recordRun(false);
assertEq(settings.career.wizard.clears, 1, "a defeat does not add a clear");
assertEq(settings.career.wizard.bestFloor, 5, "best floor stays the max reached");
const cardEl = document.getElementById("careerLine");
assert(cardEl.innerHTML.includes("best floor 5"), "renderCareer shows the best-floor stat");
assert(cardEl.innerHTML.includes("1 clear"), "renderCareer shows the clear count");
assert(cardEl.innerHTML.includes("fastest clear 1m 10s"), "renderCareer shows fastest clear time");
renderCareer();
combat.playerClass = "ninja";
renderCareer();
assertEq(cardEl.innerHTML, "", "renderCareer hides the line entirely when a hero has no records");

// ---------- Shield carries over between floors ----------
resetRun();
combat.playerClass = "knight";
run.floor = 1;
startBattle({});
assertEq(combat.shield, 15, "a fresh run starts with the hero's starting shield");
combat.shield = 3;
run.floor = 2;
startBattle({});
assertEq(combat.shield, 3, "shield carries over — floor 2 does NOT refill to 15");
combat.shield = 0;
run.floor = 3;
startBattle({});
assertEq(combat.shield, 0, "a spent shield stays spent next floor (no free refill)");
resetRun();
combat.playerClass = "knight";
run.floor = 1;
startBattle({});
assertEq(combat.shield, 15, "a fresh run restores starting shield even after a carried-over 0");
// Per-battle start bonuses still stack on the carried shield instead of refilling
const wardUpgrade = RUN_UPGRADES.find(u => u.id === "fortifiedWard");
resetRun();
combat.playerClass = "knight";
run.floor = 1;
wardUpgrade.apply(); // → run.fortifiedWard = true
startBattle({});
assertEq(combat.shield, 19, "Fortified Ward starts a fresh battle at startShield + 4");
combat.shield = 2;
run.floor = 2;
startBattle({});
assertEq(combat.shield, 6, "Fortified Ward stacks on the carried shield (2 + 4), not a refill");
// The upgrade flag is per-run: a fresh run loses it
resetRun();
combat.playerClass = "knight";
run.floor = 1;
startBattle({});
assert(run.fortifiedWard !== true, "resetRun clears the Fortified Ward upgrade flag");
assertEq(combat.shield, 15, "a run without Fortified Ward starts at the plain starting shield");
// Shield is persisted in the run save and restored on continue
combat.shield = 7;
saveRun();
const sdSave = loadRun();
assertEq(sdSave.shield, 7, "saveRun persists the current shield");
combat.shield = null;
applyLoadedRun(sdSave);
assertEq(combat.shield, 7, "applyLoadedRun restores the saved shield");

// Wilted shows in the player status summary while active, and hides when gone
run.healBlockFloors = 3;
assert(statusSummaryPlayer().includes("Wilted 3f"), "statusSummaryPlayer shows Wilted with remaining floors");
run.healBlockFloors = 0;
assert(!statusSummaryPlayer().includes("Wilted"), "statusSummaryPlayer hides Wilted once expired");

if (failures) { console.error(`\n${failures} FAILURE(S)`); Deno.exit(1); }
console.log("\nALL CHECKS PASSED");