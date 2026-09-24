// tools/ability-poses.mjs — EVERY ABILITY HAS A BODY. A bought active that selects no pose of its own is drawn as whatever the
// hero was already doing, so the effect plays NEXT TO a hero who does not move (that is why Rising Cut once "looked like a jump").
// Each ACTIVE in the catalog (src/progression-catalog.js SKILLS, which already carries STARTER_SKILLS) is bought alone, pressed
// on a flat floor in the real page, and stepped with the draw on (BK.step): the pose key the draw chose is read off P.lastKey
// every frame. The ability passes when, in the frames after the press, the draw chose a key that is NOT
//   - locomotion or a state the hero is in anyway (idle, run, jump, fall, land, apex, skid, crouch, fidget, roll, hurt, block...),
//   - one of the combo's own swings (atk, atkB, atkC, air) - a BORROWED blow reads as the blow, not the ability - unless the
//     ability is in BORROW_OK below, with the reason the borrowed frame reads right,
//   - the key the hero was drawn in just before the press.
// EVERY HERO is held to it (lane E gave the Knight and the Warden their poses on 2026-09-23, lane P the other four on 2026-09-24),
// and each of a hero's actives must also have a pose no other of that hero's actives uses - so a hero's casts can no longer all
// fall through to the one generic `cast` or `blast` frame, which is how the Death Knight's five casts and the Freebooter's two
// shots and two hook throws were drawn identically. SHARED_OK is the short list of pairs that honestly share, each with its
// reason. KNOWN_POSELESS was the ratchet on the debt measured on 2026-09-23 (13 actives); it is EMPTY, and it stays empty - a
// pose-less active is a plain failure now. `node tools/ability-poses.mjs --report` prints every active's key run without asserting.
// THE JUMP: every hero leaves the ground on a TAKE-OFF frame, shows four or more poses in the air, and lands in three (impact,
// settle, stand).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { SKILLS } from '../src/progression-catalog.js';

const ACTIVES = [...new Map(SKILLS.filter(s => s.active).map(s => [s.id, s])).values()];
const GENERIC = new Set(['idle', 'run', 'jump', 'fall', 'land', 'apex', 'skid', 'crouch', 'fidget', 'roll', 'hurt', 'block', 'climb', 'swim', 'tread', 'recover', 'slump', 'dance']);
const COMBO = new Set(['atk', 'atkB', 'atkC', 'air']);
/* a borrowed swing that IS the ability: allowed, with the reason */
const BORROW_OK = {
  spearDance: 'SPEAR DANCE is a flurry of her own thrusts, stood still: the thrust frames are exactly what it is',
};
/* THE HEROES HELD TO IT: the starters (lane E), each of the other four as lane P (2026-09-24) gives it its poses, and THE GEOMANCER
   (2026-09-24), built to it from her first day: never debt */
const HELD = ['knight', 'warden', 'geomancer', 'paladin', 'pyro', 'pirate', 'reaper'];
/* A SHARED POSE THAT IS RIGHT, with the reason (keyed by either active of the pair): two of hers are the same movement at heart */
const SHARED_OK = { harrier: 'HARRIER is the vault taken at a foe instead of at a gap: it is drawn as the vault Pole Spring also uses' };
/* THE DEBT, measured on master 313e0da (2026-09-23): 13 actives with no body of their own. Paid off by lane P (2026-09-24); a
   new entry here is a step backwards and wants a reason in the commit that adds it. */
const KNOWN_POSELESS = {};
/* LANE E's WORK LIST (2026-09-23), proved red on master first: the Knight's and the Warden's faults not yet fixed on this branch.
   It only shrinks - a fixed one must come off it - and it is empty when the lane is done. */
const LANE_TODO = [];
const REPORT = process.argv.includes('--report');

const pg = await openPage({ audio: false, fonts: false });
try {
  await pg.evalp(`(async()=>{const {xpFloor}=await import('/src/xp.js');
    window.__kit=(hero,ids,foes)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero(hero);BK.reset({fresh:true});BKT.PROG.xp[hero]=xpFloor(24);
      BKT.PROG.skillOwned[hero]=Object.fromEntries(ids.map(i=>[i,true]));BKT.PROG.loadouts[hero]=ids.slice(0,4);BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<40;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(10,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;
      return foes.map(([t,dx])=>{BK.spawnEnt({t,x:(BK.P.x+dx)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=5000;e.cd=99;return e;});};return 1})()`);
  const rows = [];
  for (const s of ACTIVES) {
    const r = await pg.evalp(`(()=>{__kit(${JSON.stringify(s.hero)},[${JSON.stringify(s.id)}],[['sprig',40]]);const P=BK.P;P.heat=100;P.st=P.maxSt;BK.step(1);const before=P.lastKey;
      BK.press('throw');/* A PRESS EATEN BY A HITSTOP is pressed again once it is over: a METEOR from the row before still falls across the reset, and its landing froze the frame WISP was pressed on */if(BK.stop>0&&!(P.cds&&Object.keys(P.cds).length)){for(let i=0;i<120&&BK.stop>0;i++)BK.step(1);BK.press('throw');}const seq=[];for(let i=0;i<30;i++){BK.step(1);seq.push([P.lastKey,P.lastFrame]);}
      return {before,fired:!!(P.cds&&Object.keys(P.cds).length),seq}})()`);
    const own = [...new Set(r.seq.map(([k]) => k))].filter(k => !GENERIC.has(k) && k !== r.before && (!COMBO.has(k) || BORROW_OK[s.id]));
    const runs = []; for (const [k, f] of r.seq) { const t = k + ':' + f; if (!runs.length || runs.at(-1)[0] !== t) runs.push([t, 1]); else runs.at(-1)[1]++; }
    rows.push({ hero: s.hero, id: s.id, fired: r.fired, own, runs: runs.map(([t, n]) => t + 'x' + n).join(' ') });
  }
  const bad = rows.filter(r => !r.fired || !r.own.length);
  for (const h of [...new Set(Object.keys(KNOWN_POSELESS).concat(HELD))]) {
    const mine = rows.filter(r => r.hero === h);
    console.log(h.toUpperCase() + ':');
    for (const r of mine) console.log('  ' + (r.fired && r.own.length ? 'ok  ' : 'NONE') + ' ' + r.id.padEnd(15) + ' own=[' + r.own.join(',') + ']  ' + r.runs);
  }
  /* a pose shared between two actives of one hero (reported for all, asserted for the two held to it) */
  const shares = [];
  for (const h of new Set(rows.map(r => r.hero))) { const mine = rows.filter(r => r.hero === h && r.own.length);
    for (const a of mine) for (const b of mine) if (a.id < b.id && a.own.some(k => b.own.includes(k))) shares.push([h, a.id, b.id, a.own.filter(k => b.own.includes(k)).join(',')]); }
  if (shares.length) console.log('SHARED POSES: ' + shares.map(([h, a, b, k]) => h + ' ' + a + '/' + b + ' (' + k + ')').join('; '));
  if (!REPORT) {
    assert.deepEqual(pg.errors, []);
    const faults = bad.filter(r => HELD.includes(r.hero)).map(r => [r.id, r.hero.toUpperCase() + ' ' + r.id + ' plays with no body of its own' + (r.fired ? '' : ' (it did not even fire)') + ': the draw chose ' + r.runs]);
    for (const [h, a, b, k] of shares) if (HELD.includes(h) && !SHARED_OK[a] && !SHARED_OK[b]) faults.push([a + '/' + b, h.toUpperCase() + ' ' + a + ' and ' + b + ' are drawn in the same pose (' + k + '): each ability wants its own']);
    const fails = faults.filter(([id]) => !LANE_TODO.includes(id)).map(([, m]) => m), done = LANE_TODO.filter(id => !faults.some(([f]) => f === id));
    if (LANE_TODO.length) console.log('lane E still to do: ' + LANE_TODO.filter(id => !done.includes(id)).join(', '));
    assert.equal(fails.length, 0, fails.length + ' faults in the heroes\' actives:\n  ' + fails.join('\n  '));
    assert.equal(done.length, 0, done.join(', ') + ' has a body of its own now: take it off LANE_TODO');
    for (const [h, ids] of Object.entries(KNOWN_POSELESS)) {
      const now = bad.filter(r => r.hero === h).map(r => r.id).sort();
      const fresh = now.filter(i => !ids.includes(i)), fixed = ids.filter(i => !now.includes(i));
      assert.equal(fresh.length, 0, h.toUpperCase() + ': ' + fresh.join(', ') + ' newly plays with no pose of its own (the rule: every active selects one)');
      assert.equal(fixed.length, 0, h.toUpperCase() + ': ' + fixed.join(', ') + ' has its pose now - take it off KNOWN_POSELESS');
    }
  }
  /* THE JUMP ARC AND THE LANDING. Every hero had two jump frames, one apex, two fall and two land (docs/hero-animation-audit.md). All
     six are held to a real arc - a TAKE-OFF frame of its own, then at least four distinct poses in the air - and a landing of three
     distinct frames (impact, settle, stand) while standing still. */
  const arcs = {};
  for (const h of ['knight', 'pyro', 'paladin', 'pirate', 'reaper', 'warden', 'geomancer'])
    arcs[h] = await pg.evalp(`(()=>{__kit('${h}',[],[]);BKT.PROG.xp['${h}']=0;/* THE PLAIN JUMP: at level 24 passives now arrive by level, and the Warden's VAULTER turns her jump into the vault */const P=BK.P;BK.step(1);BK.keys.jump=true;BK.press('jump');const air=[],land=[];let n=0;
      for(let i=0;i<120;i++){BK.step(1);if(!P.ground)air.push(P.lastKey+':'+P.lastFrame);else if(air.length){BK.keys.jump=false;land.push(P.lastKey+':'+P.lastFrame);if(++n>=24)break;}}
      return {air:[...new Set(air)],land:[...new Set(land.filter(k=>k.startsWith('land:')))]}})()`);
  console.log('JUMP ARCS: ' + Object.entries(arcs).map(([h, a]) => h + ' air ' + a.air.length + ' [' + a.air.join(' ') + '] land ' + a.land.length).join('; '));
  if (!REPORT) for (const h of Object.keys(arcs)) { const a = arcs[h];
    assert(a.air.some(k => k.startsWith('takeoff:')), h.toUpperCase() + ' leaves the ground with no take-off frame of its own (drew ' + a.air.join(' ') + ')');
    assert(a.air.length >= 4, h.toUpperCase() + ' has only ' + a.air.length + ' poses in the air');
    assert(a.land.length >= 3, h.toUpperCase() + ' lands in ' + a.land.length + ' frame(s), not three (impact, settle, stand): ' + a.land.join(' ')); }
  console.log('ability poses: ' + (rows.length - bad.length) + ' of ' + rows.length + ' actives have a body of their own; known debt ' + Object.values(KNOWN_POSELESS).flat().length);
} finally { pg.close(); }
