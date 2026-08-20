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
const expectedReflect = Math.min(0.65, 0.3 + 0.02 * 9);
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
assertEq(combat.fractureStacks, 1, "knight heart match granted 1 fracture stack");
assert(combat.logHistory.some(l => /Fracture 1/.test(l)), "heart match logged Fracture");
assertEq(combat.stats.healed, 5, "heart match healing tracked in combat.stats.healed");

// ---------- Battle log: full history + turn prefixes ----------
combat.logHistory = [];
combat.turn = 3;
for (let i = 0; i < 10; i++) setLog("Step " + i, "Step " + i + " detail");
assertEq(combat.logHistory.length, 10, "battle log keeps all actions (no 5-line cap)");
assertEq(combat.logHistory.filter(l => !l.startsWith("[T3]")).length, 0, "every log entry is prefixed with the turn number");

// ---------- Log classification + grouped rendering ----------
assertEq(classifyLog("Ultimate · 40 true dmg"), "ult", "classifyLog tags ultimates");
assertEq(classifyLog("Meteor · 12 true dmg"), "ult", "classifyLog tags meteor as ult");
assertEq(classifyLog("Fracture · 25 true dmg"), "fracture", "classifyLog tags fracture");
assertEq(classifyLog("Poison · 12 ☠"), "poison", "classifyLog tags poison");
assertEq(classifyLog("+5 HP · 3 sword"), "heal", "classifyLog tags heal");
assertEq(classifyLog("3 shield · +3 shield (12)"), "shield", "classifyLog tags shield");
assertEq(classifyLog("Sparkles aren't a personality."), "voice", "classifyLog tags voice chatter");
let logThrew = false;
try { refreshLogModal(); } catch (e) { logThrew = true; console.error("refreshLogModal threw:", e); }
assert(!logThrew, "refreshLogModal renders grouped + color-coded entries");

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

if (failures) { console.error(`\n${failures} FAILURE(S)`); Deno.exit(1); }
console.log("\nALL CHECKS PASSED");