/* tools/gear-tiers.mjs - VISUAL GEAR TIERS (claude/geartiers). Held here:
     1. the one table: gearTier(level) is 0 below 10, 1 at 10 (cape), 2 at 20 (crest), 3 at 30 (aura), 4 at 50 (full set); hidden gives 0 whatever the level
     2. every hero x tier 0..4 bakes (the full set, every pose, both ways round, hurt, white, bare) with the same pose keys and sizes, and each tier
        up changes the idle frame (tier 0 is the old hero: nothing drawn)
     3. LAYERING + WEAPON SKINS: a weapon's own pixels are identical at tier 0 and tier 4 (gear is drawn behind the weapon, aura only on empty pixels),
        and swapping the weapon skin changes only weapon pixels at tier 4 as it does at tier 0 (gear never reads the weapon palette)
     4. the hide option: SET.gear false makes gearNow 0 at level 50, and the game's own bake wears nothing; regear() re-bakes on a level crossing a tier
     5. the save-slot card path (heroSet 'idle' with a tier) bakes for every hero and wears the tier
   Needs the page (Chrome over CDP). */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { gearTier, GEAR_TIERS } from '../src/gear-tiers.js';
/* suite2 11-11: the tier levels are tuning (progression is moving: A/B forks, level-up card ~L50); assert the table's INVARIANTS and derive every expectation from GEAR_TIERS, not 10/20/30/50 */
const TIER_LV = GEAR_TIERS.map(g => g.level), TOP = GEAR_TIERS.length;
assert(TOP >= 3 && TOP <= 6, 'tiers: ' + TOP); assert(TIER_LV.every((l, i) => Number.isInteger(l) && l > 0 && (i === 0 || l > TIER_LV[i - 1])), 'tier levels must be ascending: ' + TIER_LV);
assert(TIER_LV[TIER_LV.length - 1] <= 60, 'the full set is within reach of the level cap');
let prevT = 0; for (let lv = 0; lv <= 70; lv++) { const want = TIER_LV.filter(l => l <= lv).length; assert.equal(gearTier(lv), want, 'level ' + lv); assert(gearTier(lv) >= prevT, 'gear never goes down with level'); prevT = gearTier(lv); assert.equal(gearTier(lv, true), 0, 'hidden at level ' + lv); }
assert.equal(gearTier(TIER_LV[0] - 1), 0); assert.equal(gearTier(TIER_LV[0]), 1); assert.equal(gearTier(TIER_LV[TOP - 1]), TOP);
const TIERS_ALL = Array.from({ length: TOP + 1 }, (_, i) => i), TIERS_UP = TIERS_ALL.slice(1), LV_TOP = TIER_LV[TOP - 1], LV_1 = TIER_LV[0];
const HEROES = ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer'];
const pg = await openPage({ audio: false, fonts: false });
try {
  const out = await pg.evalp(`(async () => {
    BK.manualSimulation = true;
    const canv = (o, path, acc) => { if (!o) return; if (o.getContext) { acc.push([path, o]); return; } if (Array.isArray(o)) o.forEach((v, i) => canv(v, path + '[' + i + ']', acc)); else if (typeof o === 'object') for (const k in o) canv(o[k], path + '.' + k, acc); };
    const grab = set => { const acc = []; canv(set, '', acc); const m = new Map(); for (const [p, c] of acc) m.set(p, { w: c.width, h: c.height, d: c.getContext('2d').getImageData(0, 0, c.width, c.height).data }); return m; };
    const same = (a, b, i) => a[i] === b[i] && a[i + 1] === b[i + 1] && a[i + 2] === b[i + 2] && a[i + 3] === b[i + 3];
    const res = { rows: [], bad: [], slot: [], hide: {} };
    for (const h of ${JSON.stringify(HEROES)}) {
      const g = ${JSON.stringify(TIERS_ALL)}.map(t => grab(BKT.heroSet('bracken', 'steel', false, h, t)));
      const n0 = g[0].size; for (let t = 1; t <= ${TOP}; t++) { if (g[t].size !== n0) res.bad.push(h + ' tier ' + t + ' has ' + g[t].size + ' canvases, tier 0 has ' + n0);
        for (const [p, A] of g[0]) { const B = g[t].get(p); if (!B || B.w !== A.w || B.h !== A.h) res.bad.push(h + ' tier ' + t + ' ' + p + ' changed size or went missing'); } }
      const idle = t => { const A = g[t].get('.R.idle[0]'); return A; };
      const idleDiff = ${JSON.stringify(TIERS_UP)}.map(t => { const A = idle(t - 1), B = idle(t); let n = 0; for (let i = 0; i < A.d.length; i += 4) if (!same(A.d, B.d, i)) n++; return n; });
      const poseDiff = ${JSON.stringify(TIERS_UP)}.map(t => { let n = 0; for (const [p, A] of g[t - 1]) { if (/.white./.test(p)) continue; const B = g[t].get(p); if (!B) continue; let d = 0; for (let i = 0; i < A.d.length; i += 4) if (!same(A.d, B.d, i)) { d++; break; } n += d; } return n; });
      /* weapons: ember vs steel at tier 0 gives the weapon's pixels; at tier 4 only those may change, and they must be the same ones */
      const w0 = grab(BKT.heroSet('bracken', 'ember', false, h, 0)), w4 = grab(BKT.heroSet('bracken', 'ember', false, h, ${TOP}));
      let underWeapon = 0, outsideWeapon = 0, weaponPx = 0;
      for (const [p, A0] of g[0]) { const B0 = w0.get(p), A4 = g[${TOP}].get(p), B4 = w4.get(p); if (!B0 || !A4 || !B4 || A4.w !== B4.w) continue;
        for (let i = 0; i < A0.d.length; i += 4) { const isW = !same(A0.d, B0.d, i); if (isW) { weaponPx++; if (!same(A0.d, A4.d, i) && same(A0.d, B0.d, i) === false && !same(B0.d, B4.d, i)) underWeapon++; }
          else if (!same(A4.d, B4.d, i)) outsideWeapon++; } }
      res.rows.push({ h, idleDiff, poseDiff, canvases: [...g[0].keys()].filter(p => !/.white./.test(p)).length, weaponPx, underWeapon, outsideWeapon });
      /* the slot card's bake */
      for (let t = 0; t <= ${TOP}; t++) { const s = BKT.heroSet('bracken', 'steel', 'idle', h, t); res.slot.push([h, t, !!(s && s.R && s.R.idle && s.R.idle.length), s.gearT]); }
    }
    /* the hide option and the re-bake */
    BKT.setHeroLevel('knight', ${LV_TOP}); BK.setHero('knight'); BKT.regear();
    res.hide.on = [BKT.gearNow('knight'), BK.heroSet.gearT];
    BKT.gearHidden = true; BKT.regear(); res.hide.off = [BKT.gearNow('knight'), BK.heroSet.gearT, BKT.gearHidden];
    BKT.gearHidden = false; BKT.regear(); res.hide.back = [BKT.gearNow('knight'), BK.heroSet.gearT];
    BKT.setHeroLevel('knight', ${LV_1}); BKT.regear(); res.hide.l10 = [BKT.gearNow('knight'), BK.heroSet.gearT];
    BKT.setHeroLevel('knight', ${LV_1 - 1}); BKT.regear(); res.hide.l9 = [BKT.gearNow('knight'), BK.heroSet.gearT];
    return res; })()`);
  const fails = [...out.bad];
  for (const r of out.rows) {
    console.log(r.h.padEnd(10), 'idle px changed per tier', r.idleDiff.join('/'), ' poses changed', r.poseDiff.join('/') + ' of ' + r.canvases, ' weapon px', r.weaponPx, ' gear under weapon', r.underWeapon, ' outside-weapon diffs', r.outsideWeapon);
    r.idleDiff.forEach((n, i) => { if (n < 3) fails.push(r.h + ': tier ' + (i + 1) + ' changes only ' + n + ' idle pixels (it must show)'); });
    r.poseDiff.forEach((n, i) => { if (n < r.canvases * 0.85) fails.push(r.h + ': tier ' + (i + 1) + ' reaches ' + n + ' of ' + r.canvases + ' pose frames (every pose must wear it)'); });
    if (r.underWeapon) fails.push(r.h + ': gear changed ' + r.underWeapon + ' weapon pixels');
    if (r.outsideWeapon) fails.push(r.h + ': a weapon skin changed ' + r.outsideWeapon + ' non-weapon pixels at tier 4 that it did not at tier 0');
  }
  for (const [h, t, ok, gt] of out.slot) { if (!ok) fails.push('slot card bake of ' + h + ' tier ' + t + ' has no idle'); if (gt !== t) fails.push('slot card bake of ' + h + ' did not wear tier ' + t); }
  assert.deepEqual(out.hide.on, [TOP, TOP], 'the top level wears the full set'); assert.deepEqual(out.hide.off, [0, 0, true], 'hidden: nothing is worn'); assert.deepEqual(out.hide.back, [4, 4]);
  assert.deepEqual(out.hide.l10, [1, 1], 'the first tier level re-bakes in the cape'); assert.deepEqual(out.hide.l9, [0, 0]);
  if (fails.length) { console.log(fails.join('\n')); process.exit(1); }
  console.log('gear-tiers OK: 7 heroes x 5 tiers, every pose, weapon skins untouched, hide + re-bake');
} finally { pg.close(); }
