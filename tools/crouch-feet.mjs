// tools/crouch-feet.mjs - EVERY CROUCH FRAME STANDS ON THE FLOOR. A hero's older crouch frames were drawn on the standing legs cut
// down to two rows and never moved down with the body (legsDy 0 against a body 3 px lower), so he ducked with his boots ~3 px above
// the ground. The bakers (knightFrame, pyroFrame in src/chars.js) record the row the boots stand on (canvas.feet), which is exact
// where a pixel scan is not (the sword point, laid beside a crouching hero, is the lowest opaque thing on the frame). Every crouch /
// duck frame of every hero, in every skin, must carry the same boot row as that hero's standing frame.
// AND NOTHING HANGS BELOW THE FLOOR: after crouchart dropped the body 3 px the crouch weapons (rest(3) on the sword, the cutlass, the greatsword, the
// spear, the maul; the staves; the holstered pistol; the harvest blade) were still placed for the old body and drew 5-10 px under the boots. The lowest
// opaque pixel of every crouch frame may sit at most BELOW rows under the boot row (the boot's own outline and the sole's shade: the standing hero has 1-2).
//   node tools/crouch-feet.mjs [--report]
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
const HEROES = ['knight', 'warden', 'pirate', 'paladin', 'geomancer', 'reaper', 'pyro'];
const BELOW = 2;   /* rows under the boots a crouch frame may reach: the boot outline (standing frames reach 1-2) */
const KEYS = ['crouch', 'lowGuard', 'set', 'reload', 'crouchShot', 'trip', 'lowPoke', 'kneel', 'sense', 'harvest', 'ward'];
const pg = await openPage({ audio: false, fonts: false });
let rows = [];
try {
  rows = await pg.evalp(`(()=>{const out=[];
    for(const h of ${JSON.stringify(HEROES)}) for(const s of BKT.skinIds()){
      const K=BKT.heroSet(s,BKT.PROG.sword,false,h),I=Array.isArray(K.R.idle)?K.R.idle[0]:K.R.idle;
      for(const k of ${JSON.stringify(KEYS)}){const f=K.R[k];if(!f)continue;(Array.isArray(f)?f:[f]).forEach((c,i)=>out.push({h,s,k,i,feet:c.feet,stand:I.feet,low:(()=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let y=c.height-1;y>=0;y--)for(let x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>40)return y;return -1})()}));}}
    return out})()`);
} finally { pg.close(); }
const bad = rows.filter(r => r.feet !== r.stand), poke = rows.filter(r => r.low - r.feet > BELOW);
if (process.argv.includes('--report')) { const seen = new Set(); for (const r of rows) { const t = r.h + ' ' + r.k + '#' + r.i + ' boots row ' + r.feet + ' standing ' + r.stand; if (!seen.has(t)) { seen.add(t); console.log(t); } } }
console.log(rows.length + ' crouch frames measured, ' + bad.length + ' off the floor, ' + poke.length + ' with a pixel under it (worst ' + Math.max(0, ...rows.map(r => r.low - r.feet)) + ' rows below the boots)');
assert.ok(rows.length >= 400, 'only ' + rows.length + ' crouch frames were measured: the check has stopped covering them');
assert.ok(rows.every(r => r.stand !== undefined && r.feet !== undefined), 'a crouch frame or a standing frame records no boot row: a baker stopped saying where the boots are');
assert.equal(bad.length, 0, 'crouch frames stand off the ground (boots row vs standing): ' + [...new Set(bad.map(r => r.h + '/' + r.k + '#' + r.i + ' ' + r.feet + ' vs ' + r.stand))].slice(0, 14).join('; '));
assert.equal(poke.length, 0, 'crouch frames draw below the floor (rows under the boots): ' + [...new Set(poke.map(r => r.h + '/' + r.k + '#' + r.i + ' +' + (r.low - r.feet)))].slice(0, 20).join('; '));
console.log('ok  crouch-feet     every crouch / duck frame of 7 heroes in ' + new Set(rows.map(r => r.s)).size + ' skins has its boots on the standing hero\'s row, and nothing more than ' + BELOW + ' rows under it.');
