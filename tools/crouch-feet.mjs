// tools/crouch-feet.mjs - EVERY CROUCH FRAME STANDS ON THE FLOOR. A hero's older crouch frames were drawn on the standing legs cut
// down to two rows and never moved down with the body (legsDy 0 against a body 3 px lower), so he ducked with his boots ~3 px above
// the ground. The bakers (knightFrame, pyroFrame in src/chars.js) record the row the boots stand on (canvas.feet), which is exact
// where a pixel scan is not (the sword point, laid beside a crouching hero, is the lowest opaque thing on the frame). Every crouch /
// duck frame of every hero, in every skin, must carry the same boot row as that hero's standing frame.
//   node tools/crouch-feet.mjs [--report]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const HEROES = ['knight', 'warden', 'pirate', 'paladin', 'geomancer', 'reaper', 'pyro'];
const KEYS = ['crouch', 'lowGuard', 'set', 'reload', 'crouchShot', 'trip', 'lowPoke', 'kneel', 'sense', 'harvest', 'ward'];
const pg = await openPage({ audio: false, fonts: false });
let rows = [];
try {
  rows = await pg.evalp(`(()=>{const out=[];
    for(const h of ${JSON.stringify(HEROES)}) for(const s of BKT.skinIds()){
      const K=BKT.heroSet(s,BKT.PROG.sword,false,h),I=Array.isArray(K.R.idle)?K.R.idle[0]:K.R.idle;
      for(const k of ${JSON.stringify(KEYS)}){const f=K.R[k];if(!f)continue;(Array.isArray(f)?f:[f]).forEach((c,i)=>out.push({h,s,k,i,feet:c.feet,stand:I.feet}));}}
    return out})()`);
} finally { pg.close(); }
const bad = rows.filter(r => r.feet !== r.stand);
if (process.argv.includes('--report')) { const seen = new Set(); for (const r of rows) { const t = r.h + ' ' + r.k + '#' + r.i + ' boots row ' + r.feet + ' standing ' + r.stand; if (!seen.has(t)) { seen.add(t); console.log(t); } } }
console.log(rows.length + ' crouch frames measured, ' + bad.length + ' off the floor');
assert.ok(rows.length >= 400, 'only ' + rows.length + ' crouch frames were measured: the check has stopped covering them');
assert.ok(rows.every(r => r.stand !== undefined && r.feet !== undefined), 'a crouch frame or a standing frame records no boot row: a baker stopped saying where the boots are');
assert.equal(bad.length, 0, 'crouch frames stand off the ground (boots row vs standing): ' + [...new Set(bad.map(r => r.h + '/' + r.k + '#' + r.i + ' ' + r.feet + ' vs ' + r.stand))].slice(0, 14).join('; '));
console.log('ok  crouch-feet     every crouch / duck frame of 7 heroes in ' + new Set(rows.map(r => r.s)).size + ' skins has its boots on the standing hero\'s row.');
