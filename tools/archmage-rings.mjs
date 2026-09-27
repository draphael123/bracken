// tools/archmage-rings.mjs — THE UNDEAD ARCHMAGE'S PORTALS (Falling Tower round 2, docs/briefs/falling-tower-round2.md §3), proved.
//   STEP     stepTell opens a pair - the entry by him, the exit near you - and the EXIT FLARES (the tell, in windingUp); then he comes
//            out of the exit already casting, the next tell half gone; left alone, the step opens nothing
//   BENT     bendTell opens an entry by his hand and an exit above or behind you, BOTH glowing the bolt's colour; the bolts come out of the
//            exit at you, and a shield turns them (the mark is '!')
//   OPENING  caused (A11): a dodge through an open exit ring carries you out beside him, his spell broken, and he is BREACHED - open,
//            taking double; the same ring with no dodge through it opens nothing
//   STAGES   (A10) two: "HIS RINGS STAY OPEN" - a spare exit stays by you, three rings at once, his fire comes out of it; three: "HE FIGHTS
//            RING TO RING" - the blink is a ring pair and the fire comes across the room from a ring behind you
//   KIT      every tell of his, old and new, is reached in a long fight (A3), and the death mark still opens him (his identity is kept)
//   IN PLAY  on the carpet, a real dodge through the flared exit breaches him and a real swing lands double
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { updateUndeadMage, MAGE, mageOpen, mageStage, RING_COL } from '../src/undead-mage.js';
import { MARK } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const box = { x0: 100, x1: 1000, y0: 560, y1: 796 };
const rig = (o = {}) => { const P = { x: 500, y: 700, dead: 0 }, hits = [], said = [], carried = [];
  const e = { alive: true, hp: 1000, hp0: 1000, maxHp: 1000, x: 700, y: 690, mode: 'hover', modeT: 0, anim: 0, turn: 0, face: -1, blinkT: 99, ...o };
  const c = { P, box, hit: (x, y, d, hard, blow) => hits.push({ d, hard, blow }), say: m => said.push(m), sound: () => {}, venom: () => {}, rnd: () => 0.5, dodging: () => false, carry: (x, y) => { carried.push([x, y]); P.x = x; P.y = y + 8; } };
  return { P, e, c, hits, said, carried }; };
const run = (r, s, dt = 1 / 60) => { for (let i = 0; i < s / dt; i++) updateUndeadMage(r.e, dt, r.c); };
const force = (r, spell) => { r.e.mode = 'hover'; r.e.modeT = 0; r.e.turn = MAGE.order.indexOf(spell); updateUndeadMage(r.e, 1 / 60, r.c); assert.equal(r.e.mode, spell + 'Tell', 'forcing ' + spell); };
const exitOf = r => r.e.rings.find(q => q.kind === 'exit' && !q.spare);
// ---- STEP ----
{ const r = rig(); force(r, 'step'); const ex = exitOf(r), en = r.e.rings.find(q => q.kind === 'entry');
  assert.ok(ex && en, 'the step opens a pair of rings'); assert.ok(ex.flare, 'the EXIT flares: that is the tell');
  assert.ok(Math.hypot(ex.x - r.P.x, ex.y - (r.P.y - 8)) < 80, 'the exit opens near you: ' + Math.round(Math.hypot(ex.x - r.P.x, ex.y - r.P.y)));
  assert.ok(Math.hypot(en.x - r.e.x, en.y - (r.e.y - 24)) < 4, 'the entry is by him');
  let opened = 0; for (let i = 0; i < 60 * (MAGE.tell.step + 0.05); i++) { updateUndeadMage(r.e, 1 / 60, r.c); if (r.e.open > 0) opened++; }
  assert.ok(Math.abs(r.e.x - ex.x) < 1 && Math.abs(r.e.y - (ex.y + 24)) < 1, 'he comes out of the exit: ' + [r.e.x, r.e.y] + ' vs ' + [ex.x, ex.y]);
  assert.ok(r.e.mode.endsWith('Tell') && r.e.mode !== 'stepTell' && r.e.mode !== 'bendTell', 'and he comes out casting: ' + r.e.mode);
  assert.ok(r.e.modeT <= MAGE.tell[r.e.spell] * 0.55, 'mid-cast: the tell already half gone (' + r.e.modeT.toFixed(2) + ' of ' + MAGE.tell[r.e.spell] + ')');
  assert.equal(opened, 0, 'left alone, the step opens nothing'); }
// ---- THE OPENING: a dodge through the exit ----
{ const r = rig(); force(r, 'step'); run(r, 0.3); const ex = exitOf(r); r.P.x = ex.x; r.P.y = ex.y + 8; r.c.dodging = () => true; updateUndeadMage(r.e, 1 / 60, r.c); r.c.dodging = () => false;
  assert.equal(r.e.mode, 'breached', 'a dodge through his open exit ring breaches him: ' + r.e.mode); assert.ok(mageOpen(r.e) && r.e.open > MAGE.breachT - 0.1, 'and he is open: ' + r.e.open);
  assert.equal(r.carried.length, 1, 'you are carried through'); assert.ok(Math.abs(r.carried[0][0] - r.e.x) <= MAGE.beside + 2, 'out beside him: ' + r.carried[0][0] + ' vs ' + r.e.x);
  run(r, MAGE.breachT - 0.2); assert.equal(r.e.mode, 'breached', 'the window lasts ' + MAGE.breachT + ' s'); run(r, 0.4); assert.notEqual(r.e.mode, 'breached', 'and then it closes');
  const q = rig(); force(q, 'step'); run(q, 0.3); const e2 = exitOf(q); q.P.x = e2.x; q.P.y = e2.y + 8; run(q, 0.1); assert.notEqual(q.e.mode, 'breached', 'in the ring without a dodge: nothing'); }
// ---- BENT BOLTS ----
{ for (const n of [1, 2]) { const r = rig({ bendN: n - 1 }); force(r, 'bend'); const ex = exitOf(r), en = r.e.rings.find(q => q.kind === 'entry');
    assert.ok(ex && en && ex.glow === RING_COL.fire && en.glow === RING_COL.fire, 'both rings glow the bolt\'s colour before it fires');
    const toward = Math.sign(r.e.x - r.P.x); assert.ok(ex.y < r.P.y - 50 || Math.sign(ex.x - r.P.x) === -toward, 'the exit is above you or behind you: ' + [ex.x, ex.y]);
    run(r, MAGE.tell.bend + 0.02); const b = r.e.shots.filter(q => q.kind === 'bent'); assert.ok(b.length >= 1, 'the bolts come out');
    for (const q of b) { assert.ok(Math.hypot(q.x - ex.x, q.y - ex.y) < 12, 'out of the EXIT ring, not his hand'); assert.ok(q.vx * (r.P.x - q.x) + q.vy * (r.P.y - 8 - q.y) > 0, 'at you'); }
    run(r, 3); assert.ok(r.hits.some(h => h.blow === 'bent' && !h.hard), 'a bent bolt lands, and it is guarded (' + JSON.stringify(r.hits) + ')'); }
  assert.equal(MARK['undeadmage|bendTell'], '!'); assert.equal(MARK['undeadmage|stepTell'], ''); }
// ---- STAGES ----
{ const r = rig({ hp: 650 }); run(r, 0.02); assert.equal(mageStage(r.e), 2); assert.ok(r.said.includes('HIS RINGS STAY OPEN'), 'stage two is announced');
  force(r, 'step'); run(r, MAGE.tell.step + 0.05); const spare = r.e.rings.find(q => q.spare); assert.ok(spare && spare.life >= MAGE.spareLife, 'stage two: a spare exit stays open by you');
  r.e.mode = 'hover'; r.e.modeT = 0; r.e.turn = MAGE.order.indexOf('bend'); updateUndeadMage(r.e, 1 / 60, r.c); assert.ok(r.e.rings.length === 3, 'and he holds three rings: ' + r.e.rings.length);
  const f = rig({ hp: 650 }); force(f, 'step'); run(f, MAGE.tell.step + 0.05); const sp = f.e.rings.find(q => q.spare); f.e.shots = []; force(f, 'fire'); assert.equal(sp.glow, RING_COL.fire, 'the spare glows when his fire is coming out of it');
  run(f, MAGE.tell.fire + 0.02); const fb = f.e.shots.filter(q => q.kind === 'fire'); assert.ok(fb.length && fb.every(q => Math.hypot(q.x - sp.x, q.y - sp.y) < 12), 'stage two: his fire comes out of the spare ring');
  const t3 = rig({ hp: 300 }); run(t3, 0.05); assert.equal(mageStage(t3.e), 3); t3.e.mode = 'hover'; t3.e.modeT = 0; t3.e.blinkT = 0; updateUndeadMage(t3.e, 1 / 60, t3.c);
  assert.equal(t3.e.mode, 'blinkOut'); assert.ok(t3.e.rings.some(q => q.kind === 'exit' && q.flare), 'stage three: his blink is a ring pair, its exit flared');
  const a3 = rig({ hp: 300 }); run(a3, 0.05); a3.e.rings = []; force(a3, 'fire'); const far = a3.e.rings.find(q => q.across); assert.ok(far && Math.abs(far.x - a3.P.x) > 150 && Math.sign(far.x - a3.P.x) !== Math.sign(a3.e.x - a3.P.x), 'stage three: the fire comes across the room from a ring behind you'); }
// ---- KIT: every tell, old and new; the death mark still opens him ----
{ const r = rig(), seen = new Set(); for (let i = 0; i < 60 * 90; i++) { updateUndeadMage(r.e, 1 / 60, r.c); if (r.e.mode.endsWith('Tell')) seen.add(r.e.mode); r.P.x = 300 + (i % 500); if (r.e.hp < 500) r.e.hp = 1000; }
  for (const m of ['fireTell', 'iceTell', 'stormTell', 'poisonTell', 'handTell', 'markTell', 'stepTell', 'bendTell']) assert.ok(seen.has(m), 'he never casts ' + m + ' in a long fight (A3)');
  const q = rig({ mode: 'markTell', modeT: 0, spell: 'mark' }); updateUndeadMage(q.e, 0.01, q.c); q.P.x += 90; run(q, MAGE.markFuse + 0.1); assert.equal(q.e.mode, 'gather', 'the death mark that finds no one still opens him');
  const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); assert.ok(/e\.t==='undeadmage'&&\(e\.mode==='gather'\|\|e\.mode==='breached'\)\)dmg=Math\.round\(dmg\*LICH\.openMul\)/.test(src), 'main.js doubles a blow on him when he is breached'); }
console.log('the rings in Node: the step and its flared exit, bent bolts from above and behind, the dodge through that breaches him, the stages');

// ---- IN PLAY ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const out={};
    BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
    BK.tp(36,49);BK.sim(5);if(!BK.carpet())BK.board();BK.sim(30);const b=BK.boss||BK.enemies().find(e=>e.t==='undeadmage'&&e.alive);for(let i=0;i<300&&b.mode==='wake';i++)BK.sim(1);
    b.mode='hover';b.modeT=0;b.turn=${MAGE.order.indexOf('step')};b.blinkT=99;BK.sim(1);out.tell=b.mode;BK.sim(15);const ex=b.rings.find(q=>q.kind==='exit');out.flare=!!(ex&&ex.flare);
    const P=BK.P;P.x=ex.x-40;P.y=ex.y+8;P.face=1;P.vx=0;P.vy=0;P.st=P.maxSt;BK.keys.right=true;BK.press('dodge');for(let i=0;i<14&&b.mode!=='breached';i++)BK.sim(1);BK.keys.right=false;
    out.mode=b.mode;out.open=+(b.open||0).toFixed(2);out.beside=Math.round(Math.abs(P.x-b.x));const hp=b.hp;BKT.hurtEnemy(b,10,b.x-10,false);out.took=hp-b.hp;
    return out;})()`, 240000);
  assert.equal(r.tell, 'stepTell'); assert.ok(r.flare, 'in play the exit ring flares');
  assert.equal(r.mode, 'breached', 'in play, a dodge through the flared exit breaches him: ' + JSON.stringify(r)); assert.ok(r.beside <= MAGE.beside + 6, 'and you come out beside him: ' + r.beside);
  assert.ok(r.took >= 18, 'and a blow lands double: ' + r.took);
  assert.deepEqual(pg.errors, []);
  console.log('in play: ' + JSON.stringify(r));
} finally { pg.close(); }
console.log('ok  archmage-rings   the step, the bent bolts, the dodge-through opening, the stages - forced, landed and seen in play');
