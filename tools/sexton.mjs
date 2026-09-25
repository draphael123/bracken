/* tools/sexton.mjs — THE SEXTON, the Falling Tower's mini (src/sexton.js, docs/briefs/falling-tower-rework.md §3), proved.
     KIT      four told attacks (A1), every tell a named '<thing>Tell' mode long enough to read, in windingUp() (A2), each FORCED
              here and seen to fire and land (A3): the swing and the rush a shield turns, the toll and the bell nothing does
     ROOM     the toll strikes the deck and the pit but not a ringers' walk (A12: the room has the height the attack assumes), and it
              sets the planks near him counting; in phase two every plank, on a shorter count (A10), and the bells come in pairs
     OPENING  caused (A11): a rush over whole planks is only a rush; a rush over a COUNTING plank breaks it and he is caught in the
              bell pit, open, taking double; he never walks onto a counting plank of his own accord
     ART      his own frames (src/redraw/sexton.js), the table's poses inside the set, hurt last
     IN PLAY  the loft wakes him with his name, each attack forced lands on a hero, the toll counts real planks, a rush over a counting
              one drops him in the pit and the plank goes, and his death lifts the gate at col 52 and ends the fight */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SEXTON, SEXTON_F, updateSexton, sextonFrame, sextonTake, sextonOpen } from '../src/sexton.js';
import { LEVELS } from '../src/level.js';
import { MARK } from '../src/marks.js';
import { openPage } from './cdp.mjs';

const FLOOR = 1000;
const rig = (o = {}) => { const P = { x: 560, y: FLOOR, vx: 0, ground: true, dead: 0 }, hits = [], said = [], counted = [], broken = [], shadows = [];
  const planks = o.planks || [];
  const e = { alive: true, hp: 520, maxHp: 520, x: 500, y: FLOOR, mode: 'stalk', modeT: 0, cd: 5, turn: 0, face: 1, phase: 1, anim: 0, ...o.e };
  const c = { P, A: { x0: 0, x1: 2000, floor: FLOOR }, rnd: () => 0.5, hit: (x, d, hard, name) => hits.push({ d, hard, name }), say: (m, red) => said.push([m, red]),
    sound: () => {}, shake: () => {}, dust: () => {}, ring: () => {}, bell: () => {}, shadow: s => shadows.push(s.slice()),
    plank: x => planks.find(p => x >= p.x0 && x < p.x1) || null, breakPlank: p => { broken.push(p); p.st = 'down'; },
    count: (x, r, t) => counted.push({ r, t }), joist: () => 400 };   /* a joist is never a plank */
  return { P, e, c, hits, said, counted, broken, shadows, planks };
};
const step = (r, s, dt = 1 / 60) => { for (let i = 0; i < s / dt; i++) updateSexton(r.e, dt, r.c); };
const force = (r, mode) => { r.e.mode = mode; r.e.modeT = 0; if (mode === 'dropTell') r.e.spots = [r.P.x]; updateSexton(r.e, 1 / 60, r.c); };
// ---- KIT: every tell told, read-long, marked, and each forced to fire ----
{ const r = rig(), seen = new Set(); r.e.cd = 0;
  for (let i = 0; i < 60 * 60; i++) { updateSexton(r.e, 1 / 60, r.c); if (r.e.mode.endsWith('Tell')) seen.add(r.e.mode); r.P.x = 500 + ((i / 90 | 0) % 2 ? 150 : 30); r.e.hp = 520; if (r.e.mode === 'pit') r.e.mode = 'stalk'; }
  for (const m of ['swingTell', 'rushTell', 'tollTell', 'dropTell']) assert.ok(seen.has(m), 'he never tells ' + m + ' (A1/A3: an attack that never fires does not exist)'); }
for (const [k, t] of Object.entries(SEXTON.tell)) assert.ok(t >= 0.75, k + ': a tell of ' + t + ' s is too short to read');
assert.equal(MARK['sexton|swingTell'], '!'); assert.equal(MARK['sexton|rushTell'], '!'); assert.equal(MARK['sexton|tollTell'], '!!'); assert.equal(MARK['sexton|dropTell'], '!!');
{ const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8'); assert.ok(/e\.t === 'sexton' && typeof e\.mode === 'string' && e\.mode\.endsWith\('Tell'\)/.test(src.slice(src.indexOf('const windingUp'), src.indexOf('const windingUp') + 20000)), 'his tells are in windingUp() (A2)'); }
{ const r = rig(); r.P.x = 530; force(r, 'swingTell'); assert.equal(r.hits[0]?.name, 'THE SWING'); assert.equal(r.hits[0].hard, false, 'the swing is guarded'); }
{ const r = rig(); r.P.x = 590; force(r, 'rushTell'); step(r, 0.5); assert.equal(r.hits[0]?.name, 'THE RUSH'); assert.equal(r.hits[0].hard, false, 'the rush is guarded'); }
{ const r = rig(); r.P.x = 580; force(r, 'tollTell'); assert.equal(r.hits[0]?.name, 'THE TOLL'); assert.ok(r.hits[0].hard, 'the toll is not guarded');
  assert.deepEqual(r.counted[0], { r: SEXTON.tollR, t: SEXTON.count }, 'and it sets the planks near him counting');
  const up = rig(); up.P.x = 580; up.P.y = FLOOR - 32; force(up, 'tollTell'); assert.equal(up.hits.length, 0, 'a ringers\' walk two rows up is out of the toll (A12)');
  const air = rig(); air.P.x = 580; air.P.ground = false; air.P.y = FLOOR - 20; force(air, 'tollTell'); assert.equal(air.hits.length, 0, 'and so is the air: jump it'); }
{ const r = rig(); r.e.cd = 0; r.e.turn = 4; r.P.x = 700; step(r, 0.05); assert.equal(r.e.mode, 'dropTell'); assert.equal(r.shadows[0][0], 700, 'the shadow is where you stood');
  step(r, SEXTON.tell.drop); assert.equal(r.hits[0]?.name, 'THE BELL'); assert.ok(r.hits[0].hard);
  const q = rig(); q.e.cd = 0; q.e.turn = 4; q.P.x = 700; step(q, 0.05); q.P.x = 740; step(q, SEXTON.tell.drop); assert.equal(q.hits.length, 0, 'leave the shadow and the bell misses'); }
// ---- PHASE TWO: the whole deck, on a shorter count, and the bells in pairs ----
{ const r = rig({ e: { hp: 250 } }); step(r, 0.02); assert.equal(r.e.phase, 2); assert.ok(r.said.some(([m]) => m === 'HE RINGS THE WHOLE DECK'));
  r.P.x = 580; force(r, 'tollTell'); assert.deepEqual(r.counted.at(-1), { r: Infinity, t: SEXTON.countP2 }, 'phase two: every plank, a shorter count');
  const d = rig({ e: { hp: 250 } }); d.e.cd = 0; d.e.turn = 4; step(d, 0.05); assert.equal(d.e.mode, 'dropTell'); assert.equal(d.shadows[0].length, 2, 'the bells come in pairs'); }
// ---- THE OPENING IS CAUSED ----
{ const whole = [{ x0: 520, x1: 700, st: 'whole' }], counting = [{ x0: 520, x1: 700, st: 'count' }];
  const a = rig({ planks: whole }); a.P.x = 760; force(a, 'rushTell'); step(a, 1); assert.ok(!sextonOpen(a.e) && a.e.mode !== 'pit', 'a rush over whole planks opens nothing: ' + a.e.mode);
  const b = rig({ planks: counting }); b.P.x = 760; force(b, 'rushTell'); step(b, 1); assert.equal(b.e.mode, 'pit', 'a rush over a counting plank drops him in the pit');
  assert.equal(b.broken.length, 1, 'and breaks it'); assert.ok(b.e.open > 2 && b.e.y > FLOOR, 'caught, open, and down in the pit');
  assert.equal(sextonTake(b.e, 10), 10 * SEXTON.pitMul, 'double damage while he is caught'); assert.equal(sextonTake(a.e, 10), 10, 'and only then');
  step(b, SEXTON.pit + SEXTON.climb + 0.1); assert.equal(b.e.y, FLOOR, 'he climbs out onto a joist'); assert.notEqual(b.e.mode, 'pit');
  const w = rig({ planks: [{ x0: 520, x1: 700, st: 'count' }] }); w.e.cd = 99; w.P.x = 900; step(w, 3); assert.ok(w.e.x < 520, 'he will not WALK onto a counting plank: ' + Math.round(w.e.x)); }
// ---- ART ----
{ const { install } = await import('./node-canvas.mjs'); install(); const { bakeSexton } = await import('../src/redraw/sexton.js'); const S = bakeSexton();
  const idx = Object.values(SEXTON_F).flat(); assert.ok(idx.every(i => i < S.R.length), 'every pose in the table is in the set'); assert.equal(SEXTON_F.hurt, S.R.length - 1, 'hurt is the last frame (HAS_HURT)');
  assert.equal(sextonFrame({ mode: 'tollTell' }), SEXTON_F.tollTell); }
console.log('the Sexton in Node: four told attacks forced and landed, the toll off the ringers\' walks, phase two, and the caused pit');

// ---- IN PLAY ----
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const{LEVELS,T}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={};
   BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='fallingtower'));BK.state='play';BK.god=true;BK.sim(10);
   const L=BK.L,M=L.mini,D=L.bellDeck,P=BK.P,planks=L.crumbles.filter(c=>c.kind==='deck');
   BK.tp(43,D.deck+2);BK.sim(120);const s=BK.enemies().find(e=>e.t==='sexton');out.active=BK.miniActive;out.name=BK.textLab?BK.textLab.miniName():null;
   const ready=()=>{s.cd=99;s.mode='stalk';s.modeT=0;s.y=M.floor;P.x=39*16+8;P.y=M.floor-32;BK.god=true;BK.sim(90);for(const c of planks){c.st='whole';c.t=0;for(let x=c.x0;x<=c.x1;x++)L.grid[c.row*L.W+x]=T.PLANK;}s.cd=99;BK.god=false;P.hp=P.maxHp;P.dead=0;};
   const fire=(mode,px)=>{ready();s.x=30*16;P.x=px;P.y=M.floor;P.vx=0;const hp=P.hp;s.mode=mode;s.modeT=0;if(mode==='dropTell')s.spots=[P.x];for(let i=0;i<50;i++){P.x=px;BK.sim(1);}return {took:hp-P.hp,mode:s.mode};};
   out.swing=fire('swingTell',30*16+26);out.rush=fire('rushTell',32*16+8);   /* on a joist: a hero on a plank sets it counting, and the rush over it would be THE OPENING, not a hit */out.drop=fire('dropTell',34*16);
   out.toll=fire('tollTell',33*16);out.counting=planks.filter(c=>c.st==='count').length;
   /* THE OPENING in the page: the plank between them counting, and his rush */
   ready();s.x=24*16;s.face=1;P.x=40*16;const target=planks.find(c=>c.x0===27);target.st='count';target.t=2.5;s.mode='rushTell';s.modeT=0;BK.sim(40);
   out.pit=[s.mode,Math.round(s.y/16),target.st,+(s.open||0).toFixed(1)];
   const hp0=s.hp;BKT.hurtEnemy(s,10,s.x-10,false);out.double=hp0-s.hp;
   /* and his death lifts the gate */
   BK.god=true;s.hp=1;BKT.hurtEnemy(s,50,s.x-10,false);BK.sim(60);out.dead=!s.alive;out.done=BK.miniActive===false;
   out.gate=[...Array(D.deck-D.frame-2)].map((_,k)=>L.grid[(D.frame+2+k)*L.W+52]).every(t=>t===0);
   return out;})()`, 240000);
  assert.ok(r.active, 'coming up into the loft wakes him'); if (r.name !== null) assert.equal(r.name, 'THE SEXTON');
  for (const k of ['swing', 'rush', 'drop', 'toll']) assert.ok(r[k].took > 0, 'forced, THE ' + k.toUpperCase() + ' lands on a hero in the loft: ' + JSON.stringify(r[k]));
  assert.ok(r.counting >= 2, 'the toll set real planks counting: ' + r.counting);
  assert.equal(r.pit[0], 'pit', 'the rush over a counting plank drops him: ' + JSON.stringify(r.pit)); assert.equal(r.pit[2], 'down', 'and the plank goes'); assert.ok(r.pit[1] > 117);
  assert.ok(r.double >= 18, 'and he takes double in the pit: ' + r.double);
  assert.ok(r.dead && r.done && r.gate, 'his death ends the fight and lifts the gate at col 52: ' + JSON.stringify([r.dead, r.done, r.gate]));
  assert.deepEqual(pg.errors, []);
  console.log('in play: ' + JSON.stringify(r));
} finally { pg.close(); }
