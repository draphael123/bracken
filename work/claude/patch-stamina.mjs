// One-shot patch script for the stamina rework (claude/botfix, task 3).
// Node, not Python (no Python on this machine). Every replacement asserts its
// expected occurrence count BEFORE any write; the file is written only once,
// after every assertion has passed.
import { readFileSync, writeFileSync } from 'fs';
const path = new URL('../../src/main.js', import.meta.url);
let s = readFileSync(path, 'utf8');

function rep(old, neu, expect) {
  const parts = s.split(old);
  const got = parts.length - 1;
  if (got !== expect) throw new Error(`expected ${expect} of [${old}], found ${got}`);
  s = parts.join(neu);
}

// ---- the ST table itself ----
rep(
  "const ST = { swing: 12, plunge: 28, dodge: 16, blockHit: 11, hold: 6, knightHold: 15, regen: 48, delay: 0.5 };",
  "const ST = { swing: 15, plunge: 35, dodge: 20, blockHit: 14, hold: 7.5, knightHold: 18.75, regen: 75, delay: 0.2 };",
  1
);
rep(
  "hold: 6 -> 15 a second (the knight rework)",
  "hold: 7.5 -> 18.75 a second (the knight rework)",
  1
);

// ---- the Warden's deflect ----
rep("const DEF_LIVE = 0.5, DEF_REC = 0.26, DEF_COST = 7, DEF_REACH = 44;", "const DEF_LIVE = 0.5, DEF_REC = 0.26, DEF_COST = 9, DEF_REACH = 44;", 1);

// ---- the Death Knight's ward ----
rep(
  "const WARD_UP = 0.08, WARD_HOLD = 12, WARD_RAISE = 6, WARD_HIT = 5, WARD_BASE = 60, WARD_BEAT = 0.22, WARD_BEAT_PAL = 0.45, NOVA_CD = 0.6, SURGE_HOLD = 0.3;",
  "const WARD_UP = 0.08, WARD_HOLD = 15, WARD_RAISE = 8, WARD_HIT = 6, WARD_BASE = 60, WARD_BEAT = 0.22, WARD_BEAT_PAL = 0.45, NOVA_CD = 0.6, SURGE_HOLD = 0.3;",
  1
);

// ---- the base swing cost for the fixed-weapon heroes (paladin/pirate/reaper) ----
rep(
  "isPaladin() ? 22 : isPirate() ? 7 : isReaper() ? 18 : sword().cost",
  "isPaladin() ? 28 : isPirate() ? 9 : isReaper() ? 23 : sword().cost",
  2
);
rep("isPaladin() ? 22 : sword().cost", "isPaladin() ? 28 : sword().cost", 3);
rep("isPaladin()?22:sword().cost", "isPaladin()?28:sword().cost", 1);

// ---- the sword table (steel/ember/frost/gilded/thorn/silverleaf: 12; shadow: 7; laurel: 11; moon: 16) ----
rep("dmg: 10, cost: 12, desc: 'the plain blade'", "dmg: 10, cost: 15, desc: 'the plain blade'", 1);
rep("dmg: 9, cost: 12, burn: true", "dmg: 9, cost: 15, burn: true", 1);
rep("dmg: 10, cost: 12, freeze: true, desc: 'hits hold foes still'", "dmg: 10, cost: 15, freeze: true, desc: 'hits hold foes still'", 1);
rep("dmg: 10, cost: 12, gold: true", "dmg: 10, cost: 15, gold: true", 1);
rep("dmg: 8, cost: 7, desc: 'light: swings cost little'", "dmg: 8, cost: 9, desc: 'light: swings cost little'", 1);
rep("dmg: 10, cost: 12, leech: true", "dmg: 10, cost: 15, leech: true", 1);
rep("dmg: 10, cost: 12, freeze: true, gold: true", "dmg: 10, cost: 15, freeze: true, gold: true", 1);
rep(
  "dmg: 11, cost: 11, desc: 'won, not forged: 11 a swing for 11 stamina'",
  "dmg: 11, cost: 14, desc: 'won, not forged: 11 a swing for 14 stamina'",
  1
);
rep("dmg: 15, cost: 16, heavy: true", "dmg: 15, cost: 20, heavy: true", 1);

// ---- the F/G abilities, shown to the player in the store ----
rep("F: hurl the shield. 20 stamina, 2.5s", "F: hurl the shield. 25 stamina, 2.5s", 1);
rep("F: quake the floor both ways. 25 stamina, 3s", "F: quake the floor both ways. 31 stamina, 3s", 1);
rep("F: a line of flame ahead for 3s. 25 stamina, 4s", "F: a line of flame ahead for 3s. 31 stamina, 4s", 1);
rep("F: a burning dash you cannot be hit in. 20 stamina, 3s", "F: a burning dash you cannot be hit in. 25 stamina, 3s", 1);
rep(
  "F: an upward cut that carries the foe up with you and holds it there. 20 stamina, 2s",
  "F: an upward cut that carries the foe up with you and holds it there. 25 stamina, 2s",
  1
);
rep("the hotter, the harder. lights lamps. 15 stamina", "the hotter, the harder. lights lamps. 19 stamina", 1);
rep(
  "F: a flame that follows you, lights every lamp it passes and dives at foes. 20 stamina, 8s",
  "F: a flame that follows you, lights every lamp it passes and dives at foes. 25 stamina, 8s",
  1
);

// ---- the pyromancer's skills ----
rep("if (spend(25)) { cdSet('fireWall');", "if (spend(31)) { cdSet('fireWall');", 1);
rep("if (spend(20)) { cdSet('cinderStep');", "if (spend(25)) { cdSet('cinderStep');", 1);
rep("if (spend(15)) { const heat = P.heat; cdSet('vent');", "if (spend(19)) { const heat = P.heat; cdSet('vent');", 1);
rep("if (spend(20)) { cdSet('wisp');", "if (spend(25)) { cdSet('wisp');", 1);
rep("if (spend(25)) { cdSet('meteor');", "if (spend(31)) { cdSet('meteor');", 1);
rep("if (spend(20)) { cdSet('flameRing');", "if (spend(25)) { cdSet('flameRing');", 1);

// ---- the bought RISING CUT (distinct from the free one, which spends the base swing cost inside risingCut()) ----
rep("if (spend(20)) { cdSet('risingCut');", "if (spend(25)) { cdSet('risingCut');", 1);

// ---- the paladin's skills ----
rep("if (spend(25)) { cdSet('consecrate');", "if (spend(31)) { cdSet('consecrate');", 1);
rep("if (spend(20)) { cdSet('holyCharge');", "if (spend(25)) { cdSet('holyCharge');", 1);
rep("if (spend(15)) { cdSet('blessedHammer');", "if (spend(19)) { cdSet('blessedHammer');", 1);
rep("if (spend(20)) { cdSet('lightLance');", "if (spend(25)) { cdSet('lightLance');", 1);
rep("if (spend(25)) { cdSet('hammerLeap');", "if (spend(31)) { cdSet('hammerLeap');", 1);

// ---- the knight's/common skills ----
rep("if (spend(25)) { cdSet('groundSlam');", "if (spend(31)) { cdSet('groundSlam');", 1);
rep("if (spend(20)) { thrown = {", "if (spend(25)) { thrown = {", 1);
rep("if (spend(18)) { cdSet('lunge');", "if (spend(23)) { cdSet('lunge');", 1);
rep("if (spend(25)) { cdSet('whirlwind');", "if (spend(31)) { cdSet('whirlwind');", 1);
rep("if (spend(20)) { cdSet('disarm');", "if (spend(25)) { cdSet('disarm');", 1);
rep("if (spend(25)) { cdSet('ironclad');", "if (spend(31)) { cdSet('ironclad');", 1);
rep("if (spend(40)) { cdSet('swordOfRealm');", "if (spend(50)) { cdSet('swordOfRealm');", 1);
rep(
  "it does not cost more for hitting three foes and its cooldown is the shortest in the game (3s). Cut to 0.5x here (~3.2 a stamina) rather than raising its 18-stamina cost",
  "it does not cost more for hitting three foes and its cooldown is the shortest in the game (3s). Cut to 0.5x here (~3.2 a stamina) rather than raising its 23-stamina cost",
  1
);

// ---- the Death Knight's skills ----
rep("if (P.st < 20) tired(); else if (deathGrip()) { spend(20); cdSet('deathGrip'); }", "if (P.st < 25) tired(); else if (deathGrip()) { spend(25); cdSet('deathGrip'); }", 1);
rep("if (spend(26)) { cdSet('unholyGround');", "if (spend(33)) { cdSet('unholyGround');", 1);
rep("if (spend(26)) { cdSet('scytheThrown');", "if (spend(33)) { cdSet('scytheThrown');", 1);
rep("if (spend(24)) { cdSet('graveTide');", "if (spend(30)) { cdSet('graveTide');", 1);
rep("if (spend(20)) { cdSet('harvestMoon');", "if (spend(25)) { cdSet('harvestMoon');", 1);
rep("if (spend(26)) { cdSet('gravecall');", "if (spend(33)) { cdSet('gravecall');", 1);

// ---- the Freebooter's skills ----
rep("if (spend(24)) { cdSet('broadside');", "if (spend(30)) { cdSet('broadside');", 1);
rep("else if (spend(16)) { cdSet('blackSpot');", "else if (spend(20)) { cdSet('blackSpot');", 1);
rep("else if (spend(18)) { cdSet('keelhaul');", "else if (spend(23)) { cdSet('keelhaul');", 1);
rep("if (spend(18)) { cdSet('grapeshot');", "if (spend(23)) { cdSet('grapeshot');", 1);
rep("if (spend(20)) { cdSet('boarding');", "if (spend(25)) { cdSet('boarding');", 1);

// ---- the Warden's skills (the six bought actives) ----
rep("if (spend(16)) { cdSet('wheel');", "if (spend(20)) { cdSet('wheel');", 1);
rep("if (spend(22)) { cdSet('javelin');", "if (spend(28)) { cdSet('javelin');", 1);
rep("if (spend(22)) { cdSet('poleSpring');", "if (spend(28)) { cdSet('poleSpring');", 1);
rep("if (spend(25)) { cdSet('fullStretch');", "if (spend(31)) { cdSet('fullStretch');", 1);
rep("if (spend(30)) { cdSet('spearDance');", "if (spend(38)) { cdSet('spearDance');", 1);
rep("if (spend(40)) { cdSet('rainOfSpears');", "if (spend(50)) { cdSet('rainOfSpears');", 1);
rep("if (spend(18)) { cdSet('skewer');", "if (spend(23)) { cdSet('skewer');", 1);
rep("if (spend(22)) { cdSet('setSpears');", "if (spend(28)) { cdSet('setSpears');", 1);
rep("if (spend(16)) { cdSet('harrier');", "if (spend(20)) { cdSet('harrier');", 1);

// ---- the Geomancer's nine bought actives ----
rep("if (act(skillPress('stoneStep'), 'stoneStep', 12, true)) GEO.kit.stoneStep();", "if (act(skillPress('stoneStep'), 'stoneStep', 15, true)) GEO.kit.stoneStep();", 1);
rep("if (act(skillPress('boulder'), 'boulder', 16)) GEO.kit.boulder();", "if (act(skillPress('boulder'), 'boulder', 20)) GEO.kit.boulder();", 1);
rep("if (act(skillPress('spikeRow'), 'spikeRow', 18)) GEO.kit.spikeRow();", "if (act(skillPress('spikeRow'), 'spikeRow', 23)) GEO.kit.spikeRow();", 1);
rep("if (act(skillPress('archway'), 'archway', 20)) GEO.kit.archway();", "if (act(skillPress('archway'), 'archway', 25)) GEO.kit.archway();", 1);
rep("if (act(skillPress('stoneWall'), 'stoneWall', 18))", "if (act(skillPress('stoneWall'), 'stoneWall', 23))", 1);
rep("if (act(skillPress('entomb'), 'entomb', 22, true)) GEO.kit.entomb();", "if (act(skillPress('entomb'), 'entomb', 28, true)) GEO.kit.entomb();", 1);
rep("if (act(skillPress('faultLine'), 'faultLine', 22)) GEO.kit.faultLine();", "if (act(skillPress('faultLine'), 'faultLine', 28)) GEO.kit.faultLine();", 1);
rep("if (act(skillPress('golem'), 'golem', 30)) GEO.kit.golem();", "if (act(skillPress('golem'), 'golem', 38)) GEO.kit.golem();", 1);
rep("if (act(skillPress('avalanche'), 'avalanche', 40, true)) GEO.kit.avalanche();", "if (act(skillPress('avalanche'), 'avalanche', 50, true)) GEO.kit.avalanche();", 1);

// ---- the free rising cut / low sweep (the base swing chain cost, not the bought skill) ----
rep("if (!spend(4)) { P.vx = P.face * 75; return; }", "if (!spend(5)) { P.vx = P.face * 75; return; }", 2);

// ---- odds and ends: the shoulder charge, the perfect-ward parry fail, the aegis hold drain, wading, spore cloud, the water/ground vault, and the boss's heavy light block ----
rep("P.st = Math.max(0, P.st - 6); P.shoulder = 0;", "P.st = Math.max(0, P.st - 8); P.shoulder = 0;", 1);
rep("P.st = Math.max(0, P.st - 8 * (1 - 0.15 * tal('stalwart')));", "P.st = Math.max(0, P.st - 10 * (1 - 0.15 * tal('stalwart')));", 1);
rep("P.st = Math.max(0, P.st - 22 * dt * (1 - 0.15 * tal('stalwart')));", "P.st = Math.max(0, P.st - 27.5 * dt * (1 - 0.15 * tal('stalwart')));", 1);
rep("if (wading) { P.st = Math.max(0, P.st - 5 * dt);", "if (wading) { P.st = Math.max(0, P.st - 6.25 * dt);", 1);
rep("P.st = Math.max(0, P.st - 8 * dt); P.stDelay = Math.max(P.stDelay, 0.3);", "P.st = Math.max(0, P.st - 10 * dt); P.stDelay = Math.max(P.stDelay, 0.3);", 1);
rep("P.st >= 10", "P.st >= 13", 3);
rep("spend(10)", "spend(13)", 3);
rep("P.st = Math.max(0, P.st - 18); P.stDelay = ST.delay; number(P.x, P.y - 30, 'THE LIGHT IS HEAVY'", "P.st = Math.max(0, P.st - 23); P.stDelay = ST.delay; number(P.x, P.y - 30, 'THE LIGHT IS HEAVY'", 1);

writeFileSync(path, s, 'utf8');
console.log('main.js patched: stamina rework applied.');
