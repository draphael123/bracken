/* tools/drowned-knights.mjs — THE DROWNED KNIGHT and THE DROWNED CAPTAIN do what their tells say (docs/briefs/keep-rework-2.md).
   Rule A3: an attack nobody has FORCED is an attack that may never once have fired. So, off updateDrownedKnight in src/main.js,
   run in Node with the game's pieces stubbed:
     - from his chase, in the water and on a floor, he gets to the LUNGE, and the captain to the COMBO on his next turn;
     - every windup resolves into its blow, every blow lands where it is aimed, and a shield turns it and leaves him OPEN;
     - every blow MISSES its answer: the lunge passes a hero who left the line, the return cut a hero who left the front;
     - a stagger breaks a windup; he chases in the water (closes on you, slower than you) and never walks off his floor;
     - his sounds are sounds that exist, called with what they take;
     - E6 at bake time: no pixel of either sprite is drawn off its grid (src/drowned-knights.js DK_CLIPPED);
   and in the page: both spawn, both are drawn, the knight takes about three of a hero's cuts, and the lunge hurts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DK, dkFrame, DK_TYPES } from '../src/drowned-knights.js';
import { SFX as REAL_SFX } from '../src/audio.js';
import { THREAT } from '../src/threat.js';
import { MARK } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const src = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const body = src.slice(src.indexOf('function updateDrownedKnight('), src.indexOf('/* ...and the lunge\'s line, drawn'));
assert(body.length > 500, 'cannot read updateDrownedKnight out of main.js');
const noop = () => {}, hits = [], P = { x: 300, y: 320, dead: false, swim: true, vx: 0, vy: 0 };
let floorY = 1e9, wetPool = true;
const ctx = vm.createContext({ P, TS: 16, T: { AIR: 0, SPIKE: 9, SOLID: 1 }, parts: [], Math, DKN: { DK },
  L: { get pools() { return wetPool ? [{ swim: true, x0: 0, x1: 2000, y: 0, bottom: 2000 }] : []; } },
  DMG: { dkLunge: DK.knight.dmg.lunge, dkCapLunge: DK.captain.dmg.lunge, dkSlash: DK.captain.dmg.slash, dkSlash2: DK.captain.dmg.slash2 },
  SFX: new Proxy({}, { get: (_, k) => { if (typeof k !== 'string') return noop; assert.equal(typeof REAL_SFX[k], 'function', 'SFX.' + k + ' is not a sound');
    return (...a) => assert(a.length >= REAL_SFX[k].length, 'SFX.' + k + ' takes ' + REAL_SFX[k].length + ' argument(s)'); } }),
  number: noop, block: false, damagePlayer: (x, d, o) => { hits.push({ x, d, o }); return ctx.block ? 'blocked' : 'hit'; },
  tileAt: (tx, ty) => ty * 16 >= floorY ? 1 : 0,   /* floor from floorY down; nothing else */
  moveBody: (q, dx, dy) => { q.x += dx; const was = q.y; q.y = Math.min(floorY, q.y + dy); return { ground: q.y >= floorY && was + dy >= floorY, hitX: false }; } });
vm.runInContext(body, ctx);
const knight = (t, o = {}) => ({ t, x: 240, y: 330, vx: 0, vy: 0, face: 1, w: 12, h: 20, mode: 'swim', modeT: 0, cd: 0, anim: 0, stagger: 0, hit: false, comboNext: false, ...o });
const run = (e, s, stop = () => false) => { for (let i = 0; i < s * 60 && !stop(e); i++) { e.anim += 1 / 60; ctx.updateDrownedKnight(e, 1 / 60); } return e; };
const out = {};
for (const t of DK_TYPES) {
  const C = t === 'drownedcaptain' ? DK.captain : DK.knight;
  /* 1. THE CHASE: in the water he closes on you, and he is slower than you */
  { wetPool = true; floorY = 1e9; P.x = 420; P.y = 330; const e = knight(t, { x: 240, cd: 99 }); const d0 = Math.hypot(P.x - e.x, P.y - e.y); run(e, 1.5);
    const d1 = Math.hypot(P.x - e.x, P.y - e.y); assert(d1 < d0 - 40, t + ' does not chase in the water: ' + d0 + ' -> ' + d1); assert(Math.hypot(e.vx, e.vy) <= C.swim + 1, t + ' swims faster than ' + C.swim);
    assert.equal(e.swimming, true, t + ' in the water must be swimming'); assert(dkFrame(e) <= 1, t + ' swims in a swim frame'); out[t + ' chase'] = Math.round(d0 - d1); }
  /* 2. THE LUNGE, reached from the chase, told, and landing where it was aimed */
  { P.x = 300; P.y = 330; hits.length = 0; ctx.block = false; const e = knight(t, { x: 240 }); run(e, 1, q => q.mode === 'lungeTell');
    assert.equal(e.mode, 'lungeTell', t + ' never got to the lunge from its chase: ' + e.mode); assert.equal(MARK[t + '|lungeTell'], '!', t + ' lunge wears a yellow !');
    run(e, 2, q => q.mode !== 'lungeTell'); assert.equal(e.mode, 'lunge', t + ' lunge tell resolves into the lunge');
    run(e, 1, q => q.mode !== 'lunge'); assert.equal(hits.length, 1, t + ' lunge must land on a hero who stayed on its line'); assert(!hits[0].o?.unblockable, t + ' lunge is blockable'); }
  /* ...and a shield turns it and leaves him open */
  { P.x = 300; P.y = 330; hits.length = 0; ctx.block = true; const e = knight(t, { x: 240 }); run(e, 1, q => q.mode === 'lungeTell'); run(e, 2, q => q.mode === 'recoil');
    assert.equal(e.mode, 'recoil', t + ' a guarded lunge must throw him back open, not ' + e.mode); assert(e.stagger > 0.4, t + ' is open after a guarded lunge'); ctx.block = false; }
  /* ...and it passes a hero who got off the line during the tell */
  { P.x = 300; P.y = 330; hits.length = 0; const e = knight(t, { x: 240 }); run(e, 1, q => q.mode === 'lungeTell'); P.y = 260; run(e, 2, q => q.mode === 'rest');
    assert.equal(hits.length, 0, t + ' lunge must MISS a hero who left its line (it drives at where you were)'); }
  /* ON A FLOOR he walks, lunges along it, and never walks off the end of it */
  { wetPool = false; floorY = 320; P.x = 300; P.y = 320; P.swim = false; hits.length = 0; const e = knight(t, { x: 240, y: 320 }); run(e, 1, q => q.mode === 'lungeTell');
    assert.equal(e.swimming, false, t + ' on a floor is not swimming'); assert.equal(e.mode, 'lungeTell', t + ' on a floor gets to the lunge'); run(e, 2, q => q.mode === 'rest'); assert.equal(hits.length, 1, t + ' floor lunge lands');
    const f = knight(t, { x: 240, y: 320, mode: 'rest', modeT: 0.1 }); floorY = 320; ctx.tileAt = (tx, ty) => (ty * 16 >= 320 && tx * 16 < 260) ? 1 : 0; P.x = 420; run(f, 3);
    assert(f.x < 270, t + ' walked off the end of his floor to ' + f.x); ctx.tileAt = (tx, ty) => ty * 16 >= floorY ? 1 : 0; P.swim = true; }
  /* A STAGGER BREAKS THE WINDUP */
  { wetPool = true; floorY = 1e9; P.x = 300; P.y = 330; const e = knight(t, { x: 240 }); run(e, 1, q => q.mode === 'lungeTell'); e.stagger = 0.5; run(e, 1 / 60);
    assert.equal(e.mode, 'recoil', t + ' a stagger must break the lunge tell'); }
  /* THE CAPTAIN'S COMBO: on the turn after a lunge, a told cut and a return cut; guard the second and he is open; leave and it misses */
  if (t === 'drownedcaptain') {
    P.x = 270; P.y = 330; hits.length = 0; const e = knight(t, { x: 240, comboNext: true }); run(e, 1, q => q.mode === 'comboTell');
    assert.equal(e.mode, 'comboTell', 'the captain never got to his combo from his chase: ' + e.mode); assert.equal(MARK['drownedcaptain|comboTell'], '!', 'the combo wears a yellow !');
    run(e, 2, q => q.mode === 'rest'); assert.equal(hits.length, 2, 'both cuts land on a hero who stood in front of him: ' + hits.length);
    hits.length = 0; const f = knight(t, { x: 240, comboNext: true }); run(f, 1, q => q.mode === 'slash1'); run(f, 1, q => q.mode === 'slash2'); P.x = 200; run(f, 1, q => q.mode === 'rest');
    assert.equal(hits.length, 1, 'the return cut must MISS a hero who left his front after the first');
    P.x = 270; hits.length = 0; const g = knight(t, { x: 240, comboNext: true }); run(g, 1, q => q.mode === 'slash2'); ctx.block = true; run(g, 1, q => q.mode === 'recoil' || q.mode === 'rest'); ctx.block = false;
    assert.equal(g.mode, 'recoil', 'a guarded return cut leaves him open'); out.combo = 'two cuts, told';
  }
  assert(THREAT[t] > 0, t + ' has no threat weight (src/threat.js)');
}
/* THE PAGE: both baked with nothing drawn off the grid, both spawn and draw, the knight takes about three cuts, and the lunge hurts */
const pg = await openPage({ fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');const DKN=await import('/src/drowned-knights.js');BK.manualSimulation=true;BK.SET.speed=1;
    const out={clipped:DKN.DK_CLIPPED.slice(),frames:{knight:BK.SPR.drownedknight?BK.SPR.drownedknight.R.length:0,captain:BK.SPR.drownedcaptain?BK.SPR.drownedcaptain.R.length:0}};
    const{xpFloor}=await import('/src/xp.js');BK.setHero('knight');BK.reset({fresh:true});BKT.PROG.xp.knight=xpFloor(18);BK.applyUpgrades();BK.load(LEVELS.findIndex(l=>l.id==='keep'));BK.start();BK.sim(5);for(const e of BK.enemies())e.alive=false;BK.god=false;   /* a knight of the level the Keep expects (18, the curve at the Keep): three cuts is his, not a fresh one's */
    const P=BK.P,tx=Math.floor(P.x/16),ty=Math.floor(P.y/16)-1;const [k]=BK.spawnFoe({t:'drownedknight',x:tx+3,y:ty,face:-1});out.hp=k.hp;
    let cuts=0;for(let i=0;i<14&&k.alive&&k.hp>0;i++){k.mode='rest';k.modeT=1;k.cd=9;k.x=P.x+14;k.y=P.y;k.vx=k.vy=0;P.face=1;BK.press('atk');BK.sim(26);cuts++;}out.cuts=cuts;out.dead=!k.alive||k.hp<=0;
    const [q]=BK.spawnFoe({t:'drownedknight',x:tx+4,y:ty,face:-1});q.cd=0;q.mode='swim';const hp0=P.hp,px0=P.x,py0=P.y;for(let i=0;i<400&&P.hp>=hp0;i++){P.x=px0;P.y=py0;P.vx=P.vy=0;BK.sim(1);}   /* held still: the lunge drives at where you WERE, and the start vent lifts a hero who is left alone */out.lunged=hp0-P.hp;
    const [c]=BK.spawnFoe({t:'drownedcaptain',x:tx+5,y:ty,face:-1});BK.step(3);out.capDrawn=c.lastSet===BK.SPR.drownedcaptain;out.capHp=c.hp;return out;})()`, 300000);
  assert.deepEqual(r.clipped, [], 'pixels drawn off the sprite grid (E6): ' + r.clipped.slice(0, 8).join(' '));
  assert.equal(r.frames.knight, 7, 'the knight has 7 frames'); assert.equal(r.frames.captain, 10, 'the captain has 10 frames');
  assert(r.dead && r.cuts >= 2 && r.cuts <= 4, 'the knight should take about three cuts: ' + r.cuts + ' (hp ' + r.hp + ', dead ' + r.dead + ')');
  assert(r.lunged > 0, 'a knight left to lunge at a hero who stands there never hurt him');
  assert(r.capDrawn, 'the captain is drawn with his own sprite');
  assert.deepEqual(pg.errors, []);
  console.log('drowned-knights  ' + JSON.stringify(out) + '  page: ' + JSON.stringify(r));
} finally { pg.close(); }
