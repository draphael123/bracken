// tools/camera-fill.mjs — THE CAMERA'S FOOT LINE AND THE GROUND'S FADE (look-and-feel review, 2026-09-26, Daniel: "the
// levels should feel more polished and look better"). Three things, red first against the OLD code (0.58, camBelow: 1,
// a flat 0.05-a-row fade):
//   1. FLAT-GROUND FOOTING: on ordinary flat ground the follow camera holds the hero's feet at CAM_FOOT down the
//      buffer (main.js, updateCamera and every other camY snap that shares the constant) - not the old 58%, which
//      left 40% of the screen a wall of dirt. CAM_FOOT itself must sit in 0.66-0.70 (Daniel's range) and nothing in
//      main.js may still read the old 0.58/0.6 camera ratios.
//   2. THE FILL FADES: groundFillAlpha(d), read straight out of main.js the way tools/ground-depth.mjs reads
//      groundDepth(), must stay near-invisible for the first two rows under the surface and fall away hard past
//      that, toward a dark plateau - so three rows down already reads as depth, not more dirt.
//   3. NO BOSS BAR ON A FIGHTER: the Hornet Queen's hive (wood) and THE GRANDMOTHER's bridge (underleaf) - the one
//      arena camBelow was built for - must frame so the boss plate (bossPlate, the bottom ~28px) never sits over the
//      hero's own feet, and the boss itself stays inside the visible frame while the fight is live.
// usage: node tools/camera-fill.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { openPage } from './cdp.mjs';

const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

// ---------- 1. the constant, and nothing left reading the old ratio ----------
const cm = MAIN.match(/const CAM_FOOT = ([\d.]+);/);
assert(cm, 'CAM_FOOT is not declared where the camera code expects it');
const CAM_FOOT = +cm[1];
assert(CAM_FOOT >= 0.66 && CAM_FOOT <= 0.70, `CAM_FOOT is ${CAM_FOOT}, outside Daniel's 0.66-0.70`);
assert(!/VH \* 0\.58/.test(MAIN) && !/VH\*0\.58/.test(MAIN), 'something in main.js still reads the old 58% camera ratio');
// updateCamera (both the solo and co-op targets), coopSoftStop's snap and updateWarp's landing snap all share CAM_FOOT now -
// four ordinary play-camera sites. (BK.look()'s own VH*0.6 is a level-review helper with no player in the loop; it is not this.)
const campFootUses = (MAIN.match(/VH \* CAM_FOOT/g) || []).length;
assert(campFootUses >= 4, `only ${campFootUses} camera sites read CAM_FOOT - expected the solo target, the co-op target, coopSoftStop and updateWarp`);
console.log(`camera-fill: CAM_FOOT is ${CAM_FOOT}, in range, and used at ${campFootUses} ordinary camera sites.`);

// ---------- 2. the fade, read straight out of main.js ----------
const fm = MAIN.match(/\n(function groundFillAlpha\(d\) \{.*?\})\n/);
assert(fm, 'cannot read groundFillAlpha out of src/main.js');
assert(/g\.globalAlpha = groundFillAlpha\(d\)/.test(MAIN), 'the ground-light renderer does not take its alpha from groundFillAlpha');
const groundFillAlpha = new Function('d', fm[1].replace(/^function groundFillAlpha\(d\) \{/, '').replace(/\}$/, ''));
const alphas = Array.from({ length: 10 }, (_, d) => groundFillAlpha(d));
assert.equal(alphas[0], 0, 'the surface row itself must not be darkened');
assert(alphas[2] < 0.12, `two rows down is already dark (${alphas[2]}) - it should still read as ground`);
assert(alphas[3] - alphas[2] >= 0.08, `the fade past two rows is too gentle (row 2: ${alphas[2]}, row 3: ${alphas[3]}) - it must fall away, not creep`);
assert(alphas[9] >= 0.5, `deep fill never gets dark enough (row 9: ${alphas[9]})`);
for (let d = 1; d < alphas.length; d++) assert(alphas[d] >= alphas[d - 1], `groundFillAlpha is not monotonic at row ${d}`);
console.log(`camera-fill: groundFillAlpha fades from ${alphas[2]} at row 2 to ${alphas[9]} at row 9 - quiet near the surface, dark past it.`);

// ---------- 3 & the runtime half of 1: the real page ----------
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async () => {
    const out = {};
    // 1. flat ground: THE WOOD's own start, well clear of the hive
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(0); BK.start(); BK.god = true;
    BK.tp(6, 21); BK.sim(240);
    out.flat = { footScreen: (BK.P.y - BK.view.y), VH: BK.view.VH, ground: BK.P.ground };

    // 3. the two arenas the boss plate can sit on
    const { LEVELS } = await import('/src/level.js');
    async function arenaFrame(id) {
      const i = LEVELS.findIndex(l => l.id === id);
      BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(i); BK.start(); BK.god = true; BK.sim(10); BK.reset();
      const L = BK.L, A = L.arena;
      BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1);
      for (let k = 0; k < 240 && !BK.bossActive; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); }
      const boss = BK.boss;
      if (!boss || !BK.bossActive) return { id, started: false };
      for (let k = 0; k < 120; k++) { BK.P.hp = BK.P.maxHp; BK.P.inv = 9; BK.sim(1); }
      const v = BK.view, P = BK.P;
      // the plate's own rect, exactly as bossPlate lays it (VW/2 +- w/2, VH-28..VH; the pyromancer's lift does not apply to these two)
      const plateTop = v.VH - 28, heroTop = (P.y - v.y) - 20, heroBot = (P.y - v.y);
      return { id, started: true,
        heroClear: heroBot <= plateTop || heroTop >= v.VH,   // entirely above the plate, or (never here) entirely below the screen
        heroTop, heroBot, plateTop, VH: v.VH,
        bossOnScreen: boss.x > v.x && boss.x < v.x + v.VW && boss.y > v.y && boss.y < v.y + v.VH,
        bossY: boss.y, camY: v.y, camBot: v.y + v.VH };
    }
    out.wood = await arenaFrame('wood');
    out.underleaf = await arenaFrame('underleaf');
    return out;
  })()`, 60000);
} finally { pg.close(); }

const wantFoot = 180 * CAM_FOOT;   // the buffer's own resting height (VH may be doubled in a zoomed capture, but this run stays 'normal')
assert(r.flat.ground, 'the hero was not standing on flat ground for the footing measurement');
assert(Math.abs(r.flat.footScreen - wantFoot) < 1.5,
  `on flat ground the hero's feet sit ${r.flat.footScreen.toFixed(2)}px down a ${r.flat.VH}px screen, wanted ${wantFoot.toFixed(2)} (CAM_FOOT ${CAM_FOOT})`);
console.log(`camera-fill: on flat ground the feet settle at ${r.flat.footScreen.toFixed(1)}/${r.flat.VH}px, matching CAM_FOOT.`);

for (const id of ['wood', 'underleaf']) {
  const a = r[id];
  assert(a.started, `${id}'s boss fight never started - cannot judge its framing`);
  assert(a.bossOnScreen, `${id}: the boss (y=${a.bossY}) is off camera (${a.camY.toFixed(0)}-${a.camBot.toFixed(0)}) once the fight is up`);
  assert(a.heroClear, `${id}: the boss plate (top ${a.plateTop}) sits over the hero (${a.heroTop.toFixed(1)}-${a.heroBot.toFixed(1)} of ${a.VH})`);
  console.log(`camera-fill: ${id}'s arena keeps the boss on screen and the plate off the hero (hero ${a.heroTop.toFixed(0)}-${a.heroBot.toFixed(0)}, plate from ${a.plateTop}).`);
}
console.log('camera-fill: flat-ground footing, the ground fade by depth, and the two boss-plate arenas all hold.');
