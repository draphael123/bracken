// tools/death-cost.mjs - THE DEATH COST (Daniel, 2026-09-28: the Salt & Sanctuary / Shovel Knight direction).
//   What a hero picks up between two shrines (gold, XP) is UNBANKED. A death drops it; a shrine banks it.
//   DROP        a death takes exactly the carried gold and XP out of the totals (the level's count, the purse, the hero's XP) and puts them in ONE bundle.
//   FOE         a creature that killed him carries the bundle: it is flagged AND drawn (glow + bag), and it is handed to the same placed creature
//               in the room a respawn puts back. Killing it drops the bundle where it fell; picking that up gives every point back.
//   SPOT        a hazard death (a pit, spikes) puts the bundle on the last safe footing he stood on, never in the hazard: it is on standing room and
//               is reached by the reach fill from the shrine. A dropped bundle that would land in a hazard goes to the footing, then the shrine.
//   BOSS        a boss (or anything in a boss fight) never carries one: it lies at his arena door, and EVERY level's door is standing room the
//               reach fill reaches (static, over every arena and mini in the game).
//   SECOND      die again and DROP something new before recovering and the first bundle is gone; die carrying nothing and it stays. Only one ever exists.
//   BANK        touching a shrine banks everything carried: a death right after drops nothing.
//   CO-OP       each hero has his own bundle; one cannot pick up the other's.
//   SAVE        the carried/banked split and a live bundle go through the save and back (nothing live - no creature - is ever written), a bundle
//               is handed back to its foe on a reload, and an OLD save (none of this in it) migrates with everything it holds counted as banked.
// usage: node tools/death-cost.mjs
//   REACH_HERO=<knight|warden|pyro|paladin|pirate|reaper|geomancer> node tools/death-cost.mjs  runs it with that hero's own legs (src/reachcore.js opts.hero, claude/reachcore; tools/reach-heroes.mjs sweeps them all) (the static part)
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { LEVELS, T } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { migrateProgress, loadProgress } from '../src/progression.js';
import { doorSpot, standing, cleanBundle, drop, normalizeDeathCost, freshDeathCost, DC_VERSION } from '../src/death-cost.js';

/* ---- 1. THE RULES, no page ---- */
{ const t = drop({ coins: 7, purse: 3, xp: 40 }, { got: 10, purse: 50, xp: 100 });
  assert.deepEqual([t.coins, t.purse, t.xp, t.got, t.purseLeft, t.xpLeft], [7, 3, 40, 3, 47, 60], 'a drop takes exactly what was carried');
  const u = drop({ coins: 9, purse: 9, xp: 9 }, { got: 2, purse: 1, xp: 0 });
  assert.deepEqual([u.coins, u.purse, u.xp], [2, 1, 0], 'and never more than the totals hold (a count can not go below zero)'); }
{ const b = cleanBundle({ lv: 'wood', hero: 'knight', x: 100.4, y: 200, coins: 3, purse: 0, xp: 5, foe: '4.0', mode: 'foe', safe: { x: 90, y: 200 }, carrier: { huge: 1 } });
  assert.deepEqual(Object.keys(b).sort(), ['coins', 'foe', 'hero', 'lv', 'mode', 'purse', 'safe', 'x', 'xp', 'y'], 'a bundle keeps only its own fields');
  for (const bad of [null, 5, [], { lv: 'wood', hero: 'knight', x: 1, y: NaN, coins: 3 }, { lv: 'wood', hero: 'knight', x: 1, y: 2, coins: 0, xp: 0, purse: 0 }, { lv: '', hero: 'knight', x: 1, y: 2, coins: 3 }]) assert.equal(cleanBundle(bad), null, 'a broken or empty bundle is dropped, not thrown: ' + JSON.stringify(bad)); }

/* ---- 2. THE SAVE: migration, and the round trip ---- */
{ const old = JSON.stringify({ hero: 'knight', heroes: { knight: true }, xpVersion: 1, xp: { knight: 800 }, coins: 250, progressionVersion: 2, done: { knight: { wood: 1 } } });
  const r = migrateProgress(old), p = r.progress;
  assert.equal(p.deathCost.v, DC_VERSION); assert.equal(p.deathCost.bundle, null); assert.deepEqual(p.deathCost.carried, { xp: {}, purse: 0 }, 'an old save carries NOTHING');
  assert.equal(p.coins, 250); assert.equal(p.xp.knight, 800, 'and every coin and point of XP it had is untouched: all of it is banked');
  const again = migrateProgress(JSON.stringify(p)); assert.equal(again.changed, false); assert.deepEqual(again.progress, p, 'migrating twice is the same as once');
  const v0 = migrateProgress(JSON.stringify({ hero: 'knight', xpVersion: 1, xp: { knight: 300 }, coins: 10, talents: { knight: {} } }));
  assert.deepEqual(v0.progress.deathCost, freshDeathCost(), 'a version-0 save migrates through the older steps and comes out with an empty cost');
  const live = { ...p, deathCost: { v: DC_VERSION, carried: { xp: { knight: 40 }, purse: 12 }, bundle: { lv: 'wood', hero: 'knight', x: 320, y: 96, coins: 4, purse: 2, xp: 60, foe: '12.0', mode: 'foe', safe: { x: 300, y: 96 } } } };
  const back = migrateProgress(JSON.stringify(live)).progress; assert.deepEqual(back.deathCost, live.deathCost, 'the carried/banked split and a live bundle survive the save');
  const bad = normalizeDeathCost({ xp: { knight: 10 }, coins: 5, deathCost: { v: 1, carried: { xp: { knight: 999, ghost: 5 }, purse: 99 }, bundle: { lv: 'wood', hero: 'knight', x: 'far', y: 1, coins: 3 } } });
  assert.equal(bad, true); const q = { xp: { knight: 10 }, coins: 5, deathCost: { v: 1, carried: { xp: { knight: 999, ghost: 5 }, purse: 99 }, bundle: { lv: 'wood', hero: 'knight', x: 'far', y: 1, coins: 3 } } }; normalizeDeathCost(q);
  assert.deepEqual(q.deathCost, { v: 1, carried: { xp: { knight: 10 }, purse: 5 }, bundle: null }, 'a hand-edited save can not carry more than it holds, and a broken bundle is dropped');
  const store = new Map(), db = { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, v), removeItem: k => store.delete(k) };
  db.setItem('slot', old); const ld = loadProgress(db, 'slot', old); assert.equal(ld.progress.deathCost.bundle, null); assert.equal(ld.changed, false); }

/* THE SHRINES tools/checkpoint-stand.mjs documents as gaps in the reach MODEL (a wasp pogo, a gust ride, a breakable wall the fill has no pick for): a door beside one can not be filled either, for the same reason */
const MODEL_GAPS = { wood: [[510, 8]], oreroad: [[470, 12]], glasssea: [[600, 30]], ksar: [[581, 33]] };   /* (ksar, batch79 integ: the tower's bricked arch needs a thrown keg - see tools/checkpoint-stand.mjs) */   /* (claude/glasssea, batch75: the reach fill has no slide - see tools/checkpoint-stand.mjs) */
/* (claude/moor2: the moor's landing is walked now - the kite ride that hid it is gone) */
/* ---- 3. EVERY ARENA'S DOOR IS STANDING ROOM THE FILL REACHES (a boss never carries one) ---- */
{ const misses = [], skipped = []; let n = 0;
  for (const lv of LEVELS) { const L = lv.build(), R = floodReach(L, T, { rides: true, across: 5, hero: process.env.REACH_HERO }), W = L.W, H = L.H, at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
    const solid = (x, y) => { const t = at(x, y); return t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB; };
    const spike = (x, y) => at(x, y) === T.SPIKE;
    for (const [name, A] of [['arena', L.arena], ['mini', L.mini]]) { if (!A) continue; n++;
      const cps = L.ents.filter(e => e.t === 'check').map(e => ({ x: e.x * 16 + 8, y: (e.y + 1) * 16 })).filter(c => c.x < (A.trigger !== undefined ? A.trigger : A.x0));
      const cp = cps.sort((a, b) => b.x - a.x)[0] || { x: L.START.x * 16 + 8, y: (L.START.y + 1) * 16 };   /* the shrine before the door, as a respawn would use */
      const gapCp = L.ents.find(e => e.t === 'check' && (MODEL_GAPS[lv.id] || []).some(([x, y]) => x === e.x && y === e.y) && Math.abs(e.x * 16 - (A.trigger !== undefined ? A.trigger : A.x0)) < 16 * 14);
      if (A.carpet) { skipped.push(lv.id + ' ' + name + ' (a flight: the bundle lies at the shrine)'); continue; }
      const d = doorSpot(A, cp, solid, spike, H);
      if (!d) { misses.push(lv.id + ' ' + name + ': no standing room by the door'); continue; }
      const tx = Math.floor(d.x / 16), ty = Math.floor(d.y / 16) - 1;
      if (!standing(tx, ty + 1, solid, spike)) misses.push(lv.id + ' ' + name + ' door is not standing room');
      if (gapCp) skipped.push(lv.id + ' ' + name + ' door @' + tx + ',' + ty + ' (its shrine is a documented reach-model gap)'); else if (![-1, 0, 1].some(dx => R.seen.has(R.key(tx + dx, ty)))) misses.push(lv.id + ' ' + name + ' door @' + tx + ',' + ty + ': the reach fill (a real jump) never stands there'); } }
  assert(n > 25, 'the sweep saw the arenas (' + n + ')');
  assert.deepEqual(misses, [], 'a boss bundle at the door must be reachable:\n' + misses.join('\n')); }


/* ---- 4. THE GAME ---- */
const pg = await openPage({ audio: false, fonts: false }); const fails = [], out = {};
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS,T}=await import('/src/level.js'),{floodReach}=await import('/src/reachcore.js'),PR=await import('/src/progression.js');BK.manualSimulation=true;const fails=[],out={};
const W=id=>LEVELS.findIndex(l=>l.id===id),dc=BK.dc,B=n=>dc.bundle(n||0);
const fresh=(id,h)=>{for(const k in BK.keys)BK.keys[k]=false;BK.setHero(h||'knight');BK.reset({fresh:true});BKT.PROG.xp[h||'knight']=BKT.PROG.xp[h||'knight']||0;BK.load(W(id));BK.start();BK.god=false;BK.sim(20);};
const coin=(n)=>{const q=BK.players()[n||0];BK.acorns().push({x:q.x,y:q.y-7,got:false,ph:0});BK.sim(1);};
const respawn=()=>{for(let i=0;i<200&&BK.P.dead>0;i++)BK.sim(1);BK.sim(2);};
const hit=(who,n)=>{const q=BK.players()[n||0];q.inv=0;q.hurt=0;dc.hit(n||0,who);};
const totals=()=>({got:dc.got,coins:BKT.PROG.coins,xp:BKT.PROG.xp.knight,carry:{...dc.carry(0)}});
const at=(L,x,y)=>L.grid[y*L.W+x];
const floorOk=(L,x,y)=>{const t=at(L,Math.floor(x/16),Math.floor(y/16));return t===T.SOLID||t===T.ONEWAY||t===T.CRATE||t===T.PLANK||t>=20;};
/* a place to stand well away from the shrine (a bundle within a step of the shrine is picked up the moment he wakes) and from every foe */
const open=(from,skip)=>{const L=BK.L,cp=dc.checkpoint(),row=Math.floor(cp.y/16);for(let pass=0;pass<2;pass++)for(let tx=from;tx<L.W-4;tx++)for(let ty=3;ty<L.H-3;ty++){if(pass===0&&Math.abs(ty-row)>3)continue;
  if(at(L,tx,ty+1)===1&&at(L,tx,ty)===0&&at(L,tx,ty-1)===0&&at(L,tx,ty-2)===0&&at(L,tx+1,ty+1)===1&&at(L,tx-1,ty+1)===1&&at(L,tx+2,ty+1)===1&&BK.enemies().every(q=>!q.alive||Math.hypot(q.x-(tx*16+8),q.y-(ty+1)*16)>300)&&!(skip&&skip.some(s=>Math.abs(s-tx)<8)))return{tx,ty};}return null;};
const goto=(o,n)=>{const q=BK.players()[n||0];q.x=o.tx*16+8+(n?14:0);q.y=(o.ty+1)*16;q.vx=q.vy=0;BK.sim(30);};
const far=(k,skip)=>open(Math.floor(dc.checkpoint().x/16)+40+(k||0)*30,skip);
const stand=(k,skip)=>{const o=far(k,skip);if(!o)fails.push('no open standing place');else goto(o);return o;};
const foesFar=()=>BK.enemies().filter(e=>e.alive&&e.xpKey&&!e.harmless&&!e.mini&&!e.xpRole&&e.t!=='folk'&&e.x>dc.checkpoint().x+300);
/* A. DROP, no foe: a hazard death on his footing; then recover it */
fresh('wood');{const L=BK.L;stand();
BKT.PROG.xp.knight=100;BKT.PROG.coins=50;for(let i=0;i<3;i++)coin();BK.gainXp(40);const b0=totals();
if(b0.carry.coins!==3||b0.carry.xp<40)fails.push('A: the carry did not count what was picked up: '+JSON.stringify(b0.carry));
hit(null);BK.sim(1);const a1=totals(),bd=B();
if(!bd||bd.mode!=='spot'||bd.coins!==3||bd.xp!==b0.carry.xp)fails.push('A: the death did not make one spot bundle of the carry: '+JSON.stringify(bd));
if(a1.got!==b0.got-3||a1.xp!==b0.xp-b0.carry.xp)fails.push('A: the totals did not lose exactly the carry: '+JSON.stringify([b0,a1]));
if(a1.carry.coins||a1.carry.xp)fails.push('A: the carry is not empty after the drop');
if(bd&&(dc.hazard(bd.x,bd.y)||!floorOk(L,bd.x,bd.y)))fails.push('A: the spot is not on footing '+bd.x+','+bd.y);
respawn();const R1=totals();if(R1.got!==a1.got||R1.xp!==a1.xp)fails.push('A: a respawn changed the count '+JSON.stringify([a1,R1]));
if(bd){BK.P.x=bd.x;BK.P.y=bd.y;BK.sim(2);const a2=totals();if(B())fails.push('A: touching the spot did not pick the bundle up');if(a2.got!==b0.got||a2.xp!==b0.xp)fails.push('A: recovering did not give it all back: '+JSON.stringify([b0,a2]));if(a2.carry.coins!==3)fails.push('A: what was won back is not carried again (it is still at risk until a shrine)');}}
/* B. A FOE CARRIES IT: flagged, drawn, handed on to the same placed foe in the new room, and killing it drops the bundle */
fresh('wood');{const foes=foesFar();const e=foes[1]||foes[0];
 if(!e)fails.push('B: no foe to test');else{BK.P.x=e.x-30;BK.P.y=e.y;BK.P.vx=0;BK.sim(2);for(let i=0;i<2;i++)coin();BK.gainXp(30);const cN=dc.carry(0).coins;
  hit(e);BK.sim(1);const b=B();
  if(!b||b.mode!=='foe'||b.foe!==e.xpKey||b.carrier!==e)fails.push('B: the killer does not carry it: '+JSON.stringify(b));
  if(b&&(b.coins!==cN||cN<2))fails.push('B: the foe carries the wrong amount '+b.coins+' of '+cN);
  respawn();const b2=B(),e2=BK.enemies().find(q=>q.xpKey===e.xpKey&&q.alive);
  if(!b2||b2.mode!=='foe'||!e2||b2.carrier!==e2||e2===e)fails.push('B: the new room foe was not handed the bundle');
  else{const d0=dc.draws().foe;BK.look(Math.floor(e2.x/16),Math.floor(e2.y/16));if(dc.draws().foe<=d0)fails.push('B: the carrier is not DRAWN as a carrier (no glow/bag)');BK.P.x=dc.checkpoint().x;BK.P.y=dc.checkpoint().y;BK.P.vx=BK.P.vy=0;
  for(let k=0;k<30&&e2.alive;k++){BKT.hurtEnemy(e2,1e5,e2.x-10,false);if(e2.alive)BK.sim(3);}BK.sim(14);const g1=dc.got,b3=B();
  if(e2.alive)fails.push('B: the test could not kill the carrier');
  else if(!b3||b3.mode!=='spot')fails.push('B: killing the carrier did not drop the bundle: '+JSON.stringify(b3));
  else{if(Math.abs(b3.x-e2.x)>60)fails.push('B: it dropped far from the corpse');for(let i=0;i<200&&b3.falling;i++)BK.sim(1);
   if(dc.hazard(b3.x,b3.y))fails.push('B: the drop came to rest in a hazard');BK.P.x=b3.x;BK.P.y=b3.y;BK.sim(2);if(B())fails.push('B: the dropped bundle was not picked up');if(dc.got<g1+b3.coins)fails.push('B: the coins did not come back with the bundle: '+g1+' -> '+dc.got);}}}}
/* a carrier that stops being a foe (harmless) lets go: the bundle is never lost with it */
fresh('wood');{const f3=foesFar()[0];BK.P.x=f3.x-30;BK.P.y=f3.y;BK.sim(2);for(let i=0;i<3;i++)coin();hit(f3);BK.sim(1);const cb=B();
 if(!cb||cb.mode!=='foe')fails.push('B: (harmless) no carrier');else{cb.carrier.harmless=true;BK.sim(14);const cc=B();if(!cc||cc.mode!=='spot')fails.push('B: a carrier that went harmless kept the bundle');
  else{for(let i=0;i<200&&cc.falling;i++)BK.sim(1);if(dc.hazard(cc.x,cc.y))fails.push('B: a released bundle lay in a hazard');}}}
/* C. A BOSS NEVER CARRIES ONE: it is at the arena door, on standing room, not on the boss */
fresh('wood');{const A=BK.L.arena;stand();const e=foesFar()[0];e.xpRole='boss';for(let i=0;i<2;i++)coin();hit(e);BK.sim(1);const b=B();
 if(!b||b.mode!=='spot')fails.push('C: a boss-role killer carried a bundle: '+JSON.stringify(b));
 else{if(Math.abs(b.x-A.trigger)>10*16+8)fails.push('C: the bundle is not at the arena door ('+b.x+' vs trigger '+A.trigger+')');if(dc.hazard(b.x,b.y))fails.push('C: the door bundle is in a hazard');}}
/* D. DIE AGAIN AND THE FIRST IS GONE: only one ever exists */
fresh('wood');{const o0=stand(0);for(let i=0;i<3;i++)coin();hit(null);BK.sim(1);const first=B();respawn();stand(1,[o0.tx]);for(let i=0;i<2;i++)coin();hit(null);BK.sim(1);const second=B();
 if(!first||!second)fails.push('D: no bundles');else{if(second.coins!==2)fails.push('D: the second bundle is not just the second carry: '+second.coins);
  if(BKT.PROG.deathCost.bundle!==second)fails.push('D: two bundles exist');
  respawn();BK.P.x=first.x;BK.P.y=first.y;BK.sim(2);const c=dc.carry(0);if(c.coins||B()!==second)fails.push('D: the FIRST bundle could still be picked up after a second death: '+JSON.stringify([c,B()]));}}
/* D2. DIE AGAIN CARRYING NOTHING: the first bundle stays where it lies and can still be picked up */
fresh('wood');{const o0=stand(0);for(let i=0;i<3;i++)coin();hit(null);BK.sim(1);const first=B();respawn();stand(1,[o0.tx]);hit(null);BK.sim(1);
 if(!first)fails.push('D2: no first bundle');else{if(B()!==first)fails.push('D2: a death with nothing carried replaced the bundle: '+JSON.stringify(B()));
  respawn();BK.P.x=first.x;BK.P.y=first.y;BK.sim(2);if(B()||dc.carry(0).coins<1)fails.push('D2: the surviving bundle could not be picked up');}}
/* E. A SHRINE BANKS IT: touch one, die, nothing is dropped */
fresh('wood');{const sh=BK.shrines()[0];const o=open(Math.floor(sh.x/16)+2);goto(o);for(let i=0;i<4;i++)coin();BK.gainXp(25);if(!dc.carry(0).coins)fails.push('E: nothing carried before the shrine');
 BK.P.x=sh.x;BK.P.y=sh.y;BK.P.vx=0;BK.sim(2);const c=dc.carry(0);if(c.coins||c.xp||c.purse)fails.push('E: the shrine did not bank the carry: '+JSON.stringify(c));
 const t0=totals();hit(null);BK.sim(1);if(B())fails.push('E: a death after banking dropped a bundle');const t1=totals();if(t1.got!==t0.got||t1.xp!==t0.xp)fails.push('E: a banked death changed the totals');}
/* F. CO-OP: each hero has his own bundle, and neither can pick up the other one */
BK.coopArm('warden',false);fresh('wood');{const ps=BK.players();if(ps.length!==2)fails.push('F: no second hero ('+ps.length+')');else{
 const o=far(0);goto(o,0);goto(o,1);
 for(let i=0;i<2;i++)coin(0);for(let i=0;i<3;i++)coin(1);
 const c0=dc.carry(0).coins,c1=dc.carry(1).coins;if(c0+c1!==5||c0===0||c1===0)fails.push('F: the coins were not counted per hero: '+c0+'/'+c1);
 BK.coopDown(1);BK.sim(1);BK.players()[0].inv=0;dc.hit(0,null);for(let i=0;i<10;i++)BK.sim(1);
 const b0=B(0),b1=B(1);if(!b0||!b1||b0===b1)fails.push('F: not one bundle each: '+JSON.stringify([b0,b1]));else{if(b0.coins!==c0||b1.coins!==c1)fails.push('F: the bundles do not hold each hero own coins');
  const x1=b1.x,y1=b1.y;respawn();for(let i=0;i<30;i++)BK.sim(1);const q=BK.players();q[0].x=x1;q[0].y=y1;q[1].x=x1+400;q[1].y=y1;BK.sim(2);if(!B(1))fails.push('F: the first hero picked up the second one bundle');
  q[1].x=x1;q[1].y=y1;q[0].x=x1+400;BK.sim(2);if(B(1))fails.push('F: the second hero could not pick up his own');}}
 BK.coopEnd();}
/* G. SAVE: the slot's own text holds the split and a live bundle (and never a creature), it loads back the same, and a reload hands the bundle to its foe */
BK.coopArm(null);fresh('wood');{const e=foesFar()[1];BK.P.x=e.x-30;BK.P.y=e.y;BK.sim(2);for(let i=0;i<2;i++)coin();BK.gainXp(20);hit(e);BK.sim(1);
 const raw=JSON.stringify(BKT.PROG);if(/carrier|"sess"/.test(raw))fails.push('G: the save holds a live object');const sv=JSON.parse(raw).deathCost;if(!sv||!sv.bundle||sv.bundle.foe!==e.xpKey||sv.bundle.mode!=='foe')fails.push('G: the save does not hold the live bundle: '+JSON.stringify(sv));
 const ld=PR.migrateProgress(raw).progress;if(JSON.stringify(ld.deathCost)!==JSON.stringify(sv))fails.push('G: the save does not load back the same: '+JSON.stringify([ld.deathCost,sv]));
 BKT.PROG.deathCost=JSON.parse(JSON.stringify(ld.deathCost));BK.load(W('wood'));BK.start();BK.god=false;BK.sim(5);const b=B(),e2=BK.enemies().find(q=>q.alive&&q.xpKey===e.xpKey);if(!b||b.mode!=='foe'||!e2||b.carrier!==e2)fails.push('G: a reload did not hand the bundle back to its foe: '+JSON.stringify(b));
 /* and an old save: nothing carried, so a death drops nothing and costs nothing */
 BKT.PROG.deathCost=PR.migrateProgress(JSON.stringify({hero:'knight',xp:{knight:500},coins:120,progressionVersion:2})).progress.deathCost;BKT.PROG.xp.knight=500;BKT.PROG.coins=120;BK.load(W('wood'));BK.start();BK.god=false;BK.sim(5);stand();hit(null);BK.sim(1);
 if(B()||BKT.PROG.xp.knight!==500||BKT.PROG.coins!==120)fails.push('G: an old save lost something to a death: '+BKT.PROG.xp.knight+'/'+BKT.PROG.coins);}
/* H. THE PIT: he falls off the world; the bundle is on his last footing, not in the fall, and the fill reaches it */
fresh('wood');{const o=stand(0);for(let i=0;i<2;i++)coin();BK.P.y=BK.L.H*16+60;BK.P.vy=300;BK.sim(3);const b=B();
 if(!b)fails.push('H: a fall dropped nothing');else{if(dc.hazard(b.x,b.y)||b.y>=BK.L.H*16-4)fails.push('H: the bundle is in the fall '+b.x+','+b.y);if(!floorOk(BK.L,b.x,b.y))fails.push('H: the bundle is not on a floor '+b.x+','+b.y);
  if(Math.abs(b.x-(o.tx*16+8))>20)fails.push('H: it is not on the footing he last stood on: '+b.x+' vs '+(o.tx*16+8));
  const Rf=floodReach(BK.L,T,{rides:true,across:5}),tx=Math.floor(b.x/16),ty=Math.floor(b.y/16)-1;if(![-1,0,1].some(dx=>Rf.seen.has(Rf.key(tx+dx,ty))))fails.push('H: the fill cannot reach the pit bundle @'+tx+','+ty);}}
/* I. SPIKES: dying ON them puts it on the footing he stood on, not the spikes */
fresh('wood');{const Ls=BK.L;let sp=null;for(let y=2;y<Ls.H-1&&!sp;y++)for(let x=2;x<Ls.W-2&&!sp;x++)if(at(Ls,x,y)===T.SPIKE&&at(Ls,x,y+1)===T.SOLID&&at(Ls,x,y-1)===T.AIR&&at(Ls,x-1,y+1)===T.SOLID)sp={x,y};
 if(!sp){out.spikes='the wood has no plain spike floor: skipped';}else{const o=open(sp.x-20);if(o){BK.P.x=o.tx*16+8;BK.P.y=(o.ty+1)*16;BK.sim(30);}for(let i=0;i<2;i++)coin();BK.P.x=sp.x*16+8;BK.P.y=sp.y*16+15;BK.P.ground=true;BK.P.vy=0;hit(null);BK.sim(1);const b=B();
  if(!b||dc.hazard(b.x,b.y)||at(Ls,Math.floor(b.x/16),Math.floor(b.y/16))===T.SPIKE)fails.push('I: the spike bundle is on the spikes: '+JSON.stringify(b));else out.spikes='ok';}}
/* J. AN AMBUSHER CARRIES IT: the room is put back on a death and its foes are not there until it is tripped again - the bundle WAITS for its creature, and it is on it the moment it comes */
fresh('wood');{const A=BK.L.ambushes[0],enter=()=>{BK.P.x=(A.wallL+5)*16+8;BK.P.y=(A.row+1)*16;BK.P.vx=BK.P.vy=0;BK.P.inv=99;BK.sim(60);};enter();
 const e=BK.enemies().find(q=>q.alive&&q.ambush&&/^a/.test(q.xpKey)&&!q.harmless);
 if(A.st!=='fight'||!e)fails.push('J: the wood ambush did not start ('+A.st+')');
 else{for(let i=0;i<3;i++)coin();const cN=dc.carry(0).coins;hit(e);BK.sim(1);const b=B();if(!b||b.mode!=='foe'||b.foe!==e.xpKey||b.coins!==cN)fails.push('J: the ambusher does not carry it: '+JSON.stringify(b));
  respawn();const w=B();if(!w||w.mode!=='foe'||w.carrier)fails.push('J: the bundle did not wait for its ambusher: '+JSON.stringify(w&&{mode:w.mode,carrier:!!w.carrier}));
  BK.sim(30);if(B()&&B().mode!=='foe')fails.push('J: the bundle let go while its ambusher was still to come');
  enter();BK.P.inv=99;const w2=B(),e2=BK.enemies().find(q=>q.alive&&q.xpKey===e.xpKey);
  if(!w2||!e2||w2.carrier!==e2)fails.push('J: the ambusher came and did not carry it: '+(e2?'foe there':'no foe')+' '+JSON.stringify(w2&&{mode:w2.mode,carrier:!!w2.carrier}));
  else{BK.P.x=dc.checkpoint().x;BK.P.y=dc.checkpoint().y;for(let k=0;k<30&&e2.alive;k++){BKT.hurtEnemy(e2,1e5,e2.x-10,false);if(e2.alive)BK.sim(3);}BK.sim(14);const d=B();if(e2.alive||!d||d.mode!=='spot')fails.push('J: killing the ambusher did not drop it: '+JSON.stringify(d));}}}
return {fails,out};})()`);
  fails.push(...r.fails); Object.assign(out, r.out);
} finally { await pg.close(); }
assert.deepEqual(fails, [], 'DEATH COST:\n' + fails.join('\n'));
console.log('Death cost: rules, old-save migration, save round trip, every arena door reachable, and in the page: drop, foe carries and glows, kill returns it, hazard spots on footing, second death loses it, shrine banks, co-op separate, reload hands it back.');
