// PAGE TOOL: launches headless Chrome
/* tools/fire-mage.mjs - THE GOBLIN FIRE MAGE (claude/pyroboss2, Daniel 11-01 09:05 #4 + 09:07; scratch/brief-pyroboss2-firemage-1101.md). What it proves:
     1. THE RULES (pure, src/fire-mage.js): the skins, the lob lands where it was aimed, a patch burns who stands in it on its own clock and hops once a gen
        on grass (three gens at most), the ward pops only when you rush him, spent/doused he takes x1.5
     2. THE PLACING (static): taught ALONE in THE ROOTWAY (his first level on the road) on a safe floor with water in reach; mixed into packs in the Palisade
        Wood, Kingswood and the Kitchen Gate; two in the Burning Village; NONE past the Goblin Queen (the THEME FIT rule - the CINDER ACOLYTE is the reskin
        for later, placed nowhere yet); he lights the village's fire grid (SPREADERS); every skin has a sprite, a bestiary card and a voice
     3. IN THE GAME (page, PORT=<port>): he casts the told lob (a yellow !) and a patch burns where it lands; a blow in the windup throws it off; rush him and
        his ward turns the blow and burns you, then he is SPENT and takes x1.5; a thrown bucket DOUSES him (no casts) and puts a patch out; in the village his
        patch lights the grid; on grass it runs; on stone it does not
   node tools/fire-mage.mjs           (1 + 2 only; FM_PAGE=1 PORT=<port> for 3) */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { FM, FIRE_SKINS, isFireMage, lobVel, lobTime, newPatch, patchStep, rushed, takeMul, FM_SAY } from '../src/fire-mage.js';
import { SPREADERS } from '../src/fire-spread.js';
import { MARK, ANSWER } from '../src/marks.js';

/* ---- 1. THE RULES ---- */
assert.ok(FIRE_SKINS.has('firemage') && FIRE_SKINS.has('cinderacolyte'));
assert.ok(isFireMage({ t: 'gobmage', cnSkin: 'firemage' }) && isFireMage({ t: 'gobmage', cnSkin: 'cinderacolyte' }));
assert.ok(!isFireMage({ t: 'gobmage' }) && !isFireMage({ t: 'gobmage', cnSkin: 'banditmystic' }) && !isFireMage({ t: 'sprig', cnSkin: 'firemage' }), 'only the fire skins on the mage');
for (const [dx, dy] of [[60, 0], [140, 0], [100, -40], [-120, 30]]) { const T = lobTime(dx), v = lobVel(0, 0, dx, dy, FM.lobG, T);
  const x = v.vx * T, y = v.vy * T + 0.5 * FM.lobG * T * T; assert.ok(Math.abs(x - dx) < 0.01 && Math.abs(y - dy) < 0.01, 'the lob lands where it was aimed: ' + [dx, dy, x, y]); assert.ok(v.vy < 0, 'it goes UP first (a lob, not a line)'); }
{ const p = newPatch(100, 200, 0), hero = { x: 100, y: 200, w: 10 }, foe = { x: 106, y: 200, w: 10 }, far = { x: 160, y: 200, w: 10 };
  let hh = 0, ff = 0, hop = 0; for (let t = 0; t < FM.patch.life + 0.5; t += 1 / 60) { const r = patchStep(p, [foe, far], [hero], 1 / 60); hh += r.heroes.length; ff += r.foes.filter(q => q === foe).length; if (r.foes.includes(far)) throw new Error('a patch burns only what stands in it'); if (r.hop) hop++; }
  assert.ok(p.out, 'a patch burns out on its own clock'); assert.ok(hh >= 6 && hh <= 10, 'a hero in it is burned on its tick, not every frame: ' + hh); assert.ok(ff >= 8, 'a foe in it too (his own side): ' + ff); assert.equal(hop, 1, 'it passes itself on once');
  const old = newPatch(0, 0, FM.patch.hops); let h2 = 0; for (let t = 0; t < 3; t += 1 / 60) if (patchStep(old, [], [], 1 / 60).hop) h2++; assert.equal(h2, 0, 'three gens and no more'); }
{ const e = { x: 100, y: 200 }; assert.ok(rushed(e, { x: 70, y: 200, vx: 120, atk: -1 }), 'coming at him close: the ward');
  assert.ok(rushed(e, { x: 80, y: 200, vx: 0, atk: 0.05 }), 'swinging at him close: the ward');
  assert.ok(!rushed(e, { x: 40, y: 200, vx: 120, atk: -1 }), 'not from across the room'); assert.ok(!rushed(e, { x: 80, y: 200, vx: -120, atk: -1 }), 'not walking away');
  assert.ok(!rushed(e, { x: 80, y: 140, vx: 120, atk: -1 }), 'not from another floor'); }
assert.equal(takeMul({ mode: 'spent' }), FM.mul); assert.equal(takeMul({ mode: 'doused' }), FM.mul); assert.equal(takeMul({ mode: 'keep' }), 1); assert.equal(FM.mul, 1.5);
assert.equal(MARK['gobmage|lobTell'], '!', 'the lob: a yellow ! (a shield takes it)'); assert.equal(ANSWER['gobmage|lobTell'], 'block');
assert.ok(SPREADERS.has('firemage'), 'his patch lights the village grid (fire-spread.js SPREADERS)');
const hint = readFileSync(new URL('../src/hint-lines.js', import.meta.url), 'utf8'); assert.ok(/\.\.\.FM_SAY/.test(hint) && FM_SAY.includes('DOUSED'), 'his lines reach the hint box');

/* ---- 2. THE PLACING ---- */
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'), audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
for (const k of FIRE_SKINS) {
  assert.ok(new RegExp("\\{ t: '" + k + "', name: '").test(main), k + ' has a bestiary card');
  assert.ok(new RegExp('SPR\\.' + k + ' = ').test(main), k + ' has a sprite');
  assert.ok(new RegExp('\\b' + k + ": \\{ kit: '").test(audio), k + ' has a voice'); }
const depth = depthsOf(LEVELS), byId = Object.fromEntries(LEVELS.map(l => [l.id, l])), dQ = depth.crown, dR = depth.rootway;
const placed = {};
for (const l of LEVELS) { let L; try { L = l.build(); } catch { continue; } const fm = L.ents.filter(e => e.t === 'gobmage' && FIRE_SKINS.has(e.cnSkin)); if (fm.length) placed[l.id] = { L, fm }; }
console.log('placed: ' + Object.entries(placed).map(([id, p]) => id + ' x' + p.fm.length + ' (depth ' + depth[id] + ')').join(', '));
for (const id of ['rootway', 'palisadewood', 'kings', 'kitchengate', 'burning']) assert.ok(placed[id], 'a fire mage in ' + id);
for (const [id, p] of Object.entries(placed)) {
  if (id === 'burning') continue;   /* (a spur of the Stockade road: his order's own village) */
  assert.ok(depth[id] >= dR && depth[id] < dQ, id + ' is on the road from the Rootway up to (not past) the Goblin Queen: depth ' + depth[id] + ' (rootway ' + dR + ', crown ' + dQ + ')');
  for (const e of p.fm) assert.equal(e.cnSkin, 'firemage', 'before the Queen he is a goblin: ' + id); }
for (const [id, p] of Object.entries(placed)) for (const e of p.fm) assert.ok(!(depth[id] > dQ && e.cnSkin === 'firemage'), 'NO GOBLIN FIRE MAGE PAST THE GOBLIN QUEEN: ' + id);
{ const { L, fm } = placed.rootway, e = fm[0], sq = L.ents.filter(q => q.squad && q.squad === e.squad);
  assert.equal(fm.length, 1, 'TAUGHT: one in the Rootway'); assert.equal(sq.length, 1, 'ALONE: nobody else in his squad: ' + sq.map(q => q.t));
  assert.ok(!L.ents.some(q => q !== e && q.squad && q.y >= e.y - 4 && q.y <= e.y + 2 && Math.abs(q.x - e.x) < 9 && !['check', 'coin'].includes(q.t)), 'no other foe standing beside him');
  const W = L.W; assert.ok(L.grid[(e.y + 1) * W + e.x], 'on a floor');
  assert.ok(L.ents.some(q => q.t === 'villagewell' && q.bucket && Math.abs(q.x - e.x) <= 10 && Math.abs(q.y - e.y) <= 2), 'WATER IN REACH: a bucket at a butt within ten tiles, on his floor'); }
for (const id of ['palisadewood', 'kings', 'kitchengate']) { const { L, fm } = placed[id]; for (const e of fm) assert.ok(L.ents.filter(q => q.squad === e.squad && q !== e).length >= 1, 'in a PACK in ' + id + ' (' + e.squad + ')'); }
assert.ok(placed.burning.fm.length >= 2, 'two in the village');

/* ---- 3. IN THE GAME ---- */
if (process.env.FM_PAGE) {
  const { openPage } = await import('./cdp.mjs');
  const pg = await openPage({ audio: false, fonts: false });
  try {
    const r = await pg.evalp(`(async()=>{
    const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
    const go=(id,hero)=>{const I=LEVELS.findIndex(l=>l.id===id);BK.setHero(hero||'knight');BK.reset({fresh:true});BK.load(I);BK.state='play';BK.god=true;BK.P.hp=BK.P.maxHp;BK.sim(2);if(!BK.enemies().some(q=>q.cnSkin==='firemage'))throw new Error('no fire mage in '+id+': '+BK.enemies().length+' foes, level '+(BK.L&&BK.L.id));};
    const P=()=>BK.P,FH=()=>BK.fireMageHands(),FS=()=>BK.fireMages();
    const mage=()=>BK.enemies().find(e=>e.alive&&e.t==='gobmage'&&(e.cnSkin==='firemage'||e.cnSkin==='cinderacolyte'));
    const blow=(e,n)=>{const h=e.hp;BKT.hurtAs('light',e,n,e.x-12,false);const d=h-e.hp;e.hp=h;return d;};
    /* THE ROOTWAY: the lob, the patch, the windup thrown off, the ward and SPENT, the bucket */
    go('rootway');let e=mage();BK.tp(Math.round(e.x/16)-8,Math.round(e.y/16));for(const q of BK.enemies())if(q!==e&&Math.abs(q.x-e.x)<400)q.alive=false;
    const seen=new Set();let patch=0,told=false;for(let i=0;i<60*8;i++){P().x=e.x-120;P().vx=0;BK.sim(1);seen.add(e.mode);if(e.mode==='lobTell'&&BK.markShown&&BK.markShown(e))told=true;patch=Math.max(patch,FS().patches.length);}
    out.cast={seen:[...seen],patch,lobs:FS().n.lobs,told,n:FS().n,py:Math.round(P().y),ey:Math.round(e.y),ground:P().ground};
    e.mode='lobTell';e.modeT=0.5;e.stagger=0.3;BK.sim(1);out.thrown={mode:e.mode};e.stagger=0;
    e.mode='keep';e.cd=99;e.fwCd=0;e.stagger=0;P().x=e.x-30;P().y=e.y;P().vx=0;P().atk=-1;BK.press('atk');let wardUp=false;for(let i=0;i<4&&!wardUp;i++){P().x=e.x-30;BK.sim(1);wardUp=e.mode==='flameWard';}BK.god=false;P().inv=0;const hp0=P().hp;const wb=blow(e,20);const sc=hp0-P().hp;BK.god=true;
    for(let i=0;i<60&&e.mode==='flameWard';i++){P().x=e.x-70;BK.sim(1);}out.ward={wardUp,blade:wb,scorched:sc,after:e.mode,x15:blow(e,20)};
    go('rootway');e=mage();for(const q of BK.enemies())if(q!==e&&Math.abs(q.x-e.x)<400)q.alive=false;e.mode='keep';e.cd=99;e.lobCd=99;e.fwCd=99;e.stagger=0;BK.tp(Math.round(e.x/16)-4,Math.round(e.y/16));BK.sim(5);FS().patches.length=0;FS().bolts.length=0;const pr=BK.village().buckets().find(q=>q.state==='rest');out.bucketHere=!!pr;
    if(pr){P().x=e.x-50;P().y=e.y;BK.village().take(pr);for(let i=0;i<8;i++){P().x=e.x-50;BK.sim(1);}P().face=1;BK.press('atk');let d=false;for(let i=0;i<90&&!d;i++){P().x=e.x-50;e.cd=99;e.fwCd=99;BK.sim(1);d=e.mode==='doused';}
      const casts=FS().n.lobs;for(let i=0;i<60;i++){P().x=e.x-120;BK.sim(1);}out.doused={mode:e.mode,doused:d,castWhile:FS().n.lobs-casts};}
    /* THE VILLAGE: his patch lights the grid */
    go('burning');e=mage();const G=BK.village().G();const before=G.cells.filter(c=>c.s===1||c.s===2).length;const cells=G.cells.filter(c=>!c.square&&c.x>=200&&c.x<=230).map(c=>c.x+','+c.y);const cell=G.cells.find(c=>!c.square&&c.s===0&&(c.y+1)*16===e.y&&Math.abs(c.x*16-e.x)<400);if(cell)FH().light(cell.x*16+8,(cell.y+1)*16);for(let i=0;i<60*3;i++)BK.sim(1);
    out.village={cells:cells.slice(0,6),patches:FH().read().patches,ey:e.y,grid:FS().n.grid,lit:G.cells.filter(c=>c.s===1||c.s===2).length-before};
    /* GRASS: the Palisade Wood's autumn wood - his patch runs; THE KITCHEN's stone - it does not */
    go('palisadewood');e=mage();FH().lob(e,e.x-40,e.y+0);for(let i=0;i<60*4;i++)BK.sim(1);out.grass={hops:FS().n.hops,patches:FS().n.patches};
    go('kitchengate');e=mage();FH().lob(e,e.x-40,e.y);for(let i=0;i<60*4;i++)BK.sim(1);out.stone={hops:FS().n.hops,patches:FS().n.patches};
    return out;})()`, 300000);
    console.log(JSON.stringify(r));
    assert.ok(r.cast.seen.includes('lobTell') && r.cast.seen.includes('lob') && r.cast.lobs >= 1, 'he casts the told lob: ' + JSON.stringify(r.cast));
    assert.ok(r.cast.patch >= 1, 'and the ground burns where it lands: ' + JSON.stringify(r.cast));
    assert.equal(r.thrown.mode, 'keep', 'a blow in the windup throws it off');
    assert.ok(r.ward.wardUp, 'rush him and his ward pops: ' + JSON.stringify(r.ward));
    assert.ok(r.ward.blade === 0 && r.ward.scorched > 0, 'it turns the blow and burns you: ' + JSON.stringify(r.ward));
    assert.ok(r.ward.after === 'spent' && r.ward.x15 >= 28, 'then he is SPENT and takes x1.5: ' + JSON.stringify(r.ward));
    assert.ok(r.bucketHere && r.doused && r.doused.doused && r.doused.castWhile === 0, 'a thrown bucket DOUSES him - no casts while his staff is out: ' + JSON.stringify(r.doused));
    assert.ok(r.village.grid >= 1 && r.village.lit >= 1, 'in the village his patch lights the grid: ' + JSON.stringify(r.village));
    assert.ok(r.grass.hops >= 1, 'on grass it runs: ' + JSON.stringify(r.grass));
    assert.equal(r.stone.hops, 0, 'on the kitchen stone it does not: ' + JSON.stringify(r.stone));
    assert.deepEqual(pg.errors.slice(0, 3), [], 'no page errors');
  } finally { pg.close(); }
}
console.log('fire-mage: ' + (process.env.FM_PAGE ? 'rules, placing and the game hold' : 'rules and placing hold (FM_PAGE=1 for the game)'));
