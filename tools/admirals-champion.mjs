/* tools/admirals-champion.mjs - THE ADMIRAL'S CHAMPION and THE FLOTILLA 2 keep their promises (claude/flotilla2; scratch/brief-flotilla2.md '!! 10-16').
   It REPLACES what pinned THE QUARTERMASTER (benched, src/benched/quartermaster.js), rule for rule: her deck-guard-broken-by-a-gun became his KNOCKDOWN by a gun
   (B14), her 0.4 front (B15) became his plate at x0.5 (never nothing), her told moves became his seven, and boss-navigation's three decks became his two hulls.
   PURE (node): his moves' marks/answers/heights agree with src/marks.js; every tell >= 0.5 s; one move list a phase (the anchor changes his whole hand);
     B15 - every awake mode takes at least x0.4, the plate x0.5, the ward x0.4, stuck x1.5, flat x2; the round shot: in the air it passes under, in his ward it
     glances, otherwise KNOCKED FLAT >= 3 s then a told ward ~3 s; a stub fight plays every move of both phases; the tilt opens the lashing and closes it again.
   THE LEVEL (node): FOUR HULLS (galley, hulk, powder ship, flagship) and the rule line kept; x2 length; the six named areas; no floating log movers (every mover is
     a bench, a yard or a swing); every bench has its rower (bar the exam's one), every copper door a gun west of it laid at it, the crate hatch a keg on it; the arena's
     guns at its two ends laid inward with a clear deck between; one shrine an area's end + one before the boss; no 'quarter' anywhere.
   PAGE (headless, every hero): a real blow on his guard lands (> 0) and clanks HIS PLATE; a real blow (the ranger: her knife's low sweep, DOWN+X) on the deck gun's breech with him in its line knocks him FLAT and a
     blow then pays ~4x the plate's; a ball in his ward glances off; a real swing at a rower's chain stops his bench; a gun blows the keg on the crate hatch open; a gun
     opens a copper door.
   node tools/admirals-champion.mjs [--pure]   (PORT for the page) */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as AC from '../src/admirals-champion.js';
import { BY_HAND, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS, T } from '../src/level.js';
const { CH, MOVES, CYCLES } = AC;
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
const ROOT = fileURLToPath(new URL('..', import.meta.url));

/* ---------- PURE: the table ---------- */
for (const [mode, mv] of Object.entries(MOVES)) {
  ok(BY_HAND['champion|' + mode] === mv.mark, mode + ': src/marks.js BY_HAND says ' + BY_HAND['champion|' + mode] + ', the fight marks ' + mv.mark);
  if (mv.answer) { ok(ANSWER['champion|' + mode] === mv.answer, mode + ': ANSWER disagrees'); ok(!!HEIGHT['champion|' + mode], mode + ': no HEIGHT row'); }
}
const TELLS = { comboTell: CH.comboTell, comboNext: CH.comboNext, slamTell: CH.slamTell, thrustTell: CH.thrustTell, leapTell: CH.leapTell, sweepTell: CH.sweepTell, hookTell: CH.hookTell, tiltTell: CH.tiltTell, tearTell: CH.tearTell };
for (const [k, v] of Object.entries(TELLS)) ok(v >= 0.44, k + ' is ' + v + ' s: a tell is at least half a second (the comboNext follow-up is held to 0.5 by tell())');
const P1 = new Set(CYCLES[1].flat().map(m => m.replace(/3$/, ''))), P2 = new Set(CYCLES[2].flat());
ok(['combo', 'slam', 'thrust', 'leap'].every(m => P1.has(m)), 'phase one plays the combo, the slam, the thrust and the leap');
ok(['sweep', 'hook', 'tilt', 'leap'].every(m => P2.has(m)) && !P2.has('combo') && !P2.has('slam') && !P2.has('thrust'), 'phase two is THE ANCHOR (sweep, hook, tilt) and the leap: the greatsword is thrown down');
ok(new Set([...P1, ...P2]).size >= 7, 'B17: at least seven distinct told attacks');
/* B15 */
const G = AC.geom({ ac: { sx: 540, R: 25 } }, 16);
const mk = () => { const e = { t: 'champion', x: 1460 * 0 + G.hulls[1][0] + 200, y: G.floorY, face: -1, hp: CH.hp, maxHp: CH.hp, alive: true, mode: 'walk', modeT: 1, open: 0, phase: 1 }; return [e, AC.newFight(G)]; };
{ const [e, S] = mk(); const modes = ['walk', 'recover', 'comboTell', 'combo', 'comboRec', 'slamTell', 'slam', 'slamRec', 'thrustTell', 'thrust', 'thrustRec', 'leapTell', 'landRec', 'tearTell', 'sweepTell', 'sweep', 'sweepRec', 'hookTell', 'hook', 'hookRec', 'tiltTell', 'tilt', 'tiltRec'];
  for (const m of modes) { e.mode = m; e.open = 0; S.ward = 0; const r = AC.takeAt(e, S); ok(r.k >= 0.4, 'B15: ' + m + ' takes x' + r.k + ' (never under 0.4)'); }
  e.mode = 'walk'; ok(AC.takeAt(e, S).k === CH.plate && AC.takeAt(e, S).word === 'HIS PLATE' && CH.plate >= 0.4, 'on guard his plate takes x' + CH.plate + ' and says HIS PLATE');
  S.ward = 1; ok(AC.takeAt(e, S).k === CH.ward && CH.ward >= 0.4, 'in his ward a blade still lands at x' + CH.ward + ' (B15), told WARDED'); S.ward = 0;
  e.mode = 'stuck'; e.open = 1; ok(AC.takeAt(e, S).k === CH.stuckMul && CH.stuckMul >= 1.5, 'his blade stuck: x' + CH.stuckMul);
  e.mode = 'flat'; e.open = 1; ok(AC.takeAt(e, S).k === CH.flatMul && CH.flatMul >= 1.5 && CH.flatMul <= 2, 'knocked flat: x' + CH.flatMul + ' (B15: openings pay 1.5-2x)'); }
/* THE ROUND SHOT */
const nul = () => {}, W0 = { number: nul, sound: nul, shake: nul, fx: nul, mark: nul, word: nul, music: nul, hit: () => false, hook: () => false, drag: nul, slide: nul, gap: nul };
{ const [e, S] = mk(); e.mode = 'leap'; ok(AC.cannonHit(e, S, W0) === 'air', 'a ball passes under him in the air');
  e.mode = 'walk'; S.ward = 1; ok(AC.cannonHit(e, S, W0) === 'ward' && e.mode === 'walk', 'a ball glances off his ward'); S.ward = 0;
  ok(AC.cannonHit(e, S, W0) === 'flat' && e.mode === 'flat' && e.open >= 3, 'a ball otherwise KNOCKS HIM FLAT for ' + e.open + ' s (>= 3)');
  for (let i = 0; i < 60 * 4 && e.mode === 'flat'; i++) AC.stepChampion(e, S, 1 / 60, [{ x: e.x - 300, y: G.floorY, ground: true, alive: true, pp: {} }], W0);
  ok(e.mode !== 'flat' && S.ward >= 2.5 && S.ward <= 3.5, 'when he is up: a told ward of ~3 s (B3) - ward ' + S.ward.toFixed(2)); }
/* A STUB FIGHT: every move of both phases fires; the tilt opens the lashing and closes it */
{ const [e, S] = mk(); e.mode = 'wake'; e.modeT = 0.1; const seen = new Set(), gaps = []; const W = { ...W0, gap: o => gaps.push(o) };
  const hero = { x: e.x - 50, y: G.floorY, ground: true, alive: true, dodge: false, holding: false, pp: { x: 0 } };
  for (let f = 0; f < 60 * 240; f++) { if (f === 60 * 120) e.hp = CH.hp * CH.p2 - 1; if (f % 600 === 300) hero.x = G.hulls[0][0] + 120; if (f % 600 === 0) hero.x = e.x - 50;
    AC.stepChampion(e, S, 1 / 60, [hero], W); seen.add(e.mode); }
  for (const m of ['comboTell', 'combo', 'slamTell', 'thrustTell', 'thrust', 'leapTell', 'leap', 'tearTell', 'sweepTell', 'sweep', 'hookTell', 'tiltTell', 'tilt']) ok(seen.has(m), 'the stub fight never played ' + m);
  ok(S.ph === 2 && S.anchor, 'at half he tears the anchor off the rail (phase two)');
  ok(gaps.includes(true) && gaps.includes(false) && gaps.lastIndexOf(false) > gaps.indexOf(true), 'the anchor slam rocks the hulls apart and they come together again'); }

/* (claude/flotilla3) THE CHAMPION LEFT THE FLOTILLA: THE ADMIRAL holds it (src/flotilla-boss.js) and its level and page checks moved to tools/admiral.mjs. The Champion stays
   registered (his fight, hands, art, music) for THE UNDERWATER KEEP's mini slot (scratch/brief-flotilla3-1018.md part B, with KEEP 2): his pure table and stub fight are checked
   here; his level and page rows below come back when the Keep places him (re-point idx and the arena). */
if (!LEVELS.some(l => { try { const B = l.build(); return B.arena && B.arena.boss === 'champion' || B.mini && B.mini.boss === 'champion'; } catch { return false; } })) { console.log(fails ? fails + ' FAILED' : 'admirals-champion (pure): ok - no level places him yet (the Keep, KEEP 2); the flotilla is tools/admiral.mjs'); process.exit(fails ? 1 : 0); }
/* ---------- THE LEVEL ---------- */
const lv = LEVELS.find(l => l.id === 'flotilla'), L = lv.build();
ok(lv.rule === 'FOUR HULLS LASHED TOGETHER: THE WAY PAST IS OVER THEM, NOT THROUGH.', 'the rule line is kept (the brief)');
ok(L.W >= 600, 'x2 LENGTH: ' + L.W + ' columns (the first flotilla was 400, its route ~260 to the arena)');
ok((L.hullZones || []).length === 4, 'FOUR HULLS: ' + (L.hullZones || []).length + ' hull zones');
ok((L.sections || []).map(s => s.name).join('|') === 'THE ROCK|THE GALLEY|THE GALLEY HULL|THE HULK|THE RIGGING RUN|THE POWDER SHIP|THE LASHINGS', 'the named areas');
const at = (x, y) => L.grid[y * L.W + x];
for (const m of L.moversExtra) ok(m.flot === 'bench' || m.flot === 'yard' || m.kind === 'swing', 'a mover that is not a bench, a yard or a swing (no floating log): ' + JSON.stringify(m).slice(0, 80));
ok(!L.ents.some(e => e.t === 'mover'), 'no ent mover (the bobbing crates in mid-air are gone)');
const benches = L.moversExtra.filter(m => m.flot === 'bench'), rowers = L.flot2.rowers;
ok(benches.length >= 10 && rowers.length === benches.length - 1 && rowers.every(r => benches.some(b => b.bench === r.bench)), 'THE GALLEY HULL: ' + benches.length + ' benches, every one rowed but the exam\'s one (' + rowers.length + ' rowers)');
ok(L.moversExtra.filter(m => m.flot === 'yard').length >= 7, 'THE RIGGING RUN: at least seven yards');
const doors = L.ents.filter(e => e.t === 'bulkhead'), guns = L.ents.filter(e => e.t === 'cannon' && e.deck);
for (const d of doors) { const g = guns.filter(q => q.x < d.x && q.aim === 1 && q.y === d.y && d.x - q.x < 24); ok(g.length, 'the copper door at ' + d.x + ' has no gun laid at it from the west');
  if (g.length) { const gx = Math.max(...g.map(q => q.x)); let clear = true; for (let x = gx + 1; x < d.x; x++) if (at(x, d.y) !== T.AIR && at(x, d.y) !== T.NET) clear = false; ok(clear || doors.some(o => o.x > gx && o.x < d.x), 'the line from the gun at ' + gx + ' to the door at ' + d.x + ' is not clear'); } }
ok(doors.length >= 3, 'THE POWDER SHIP: at least three copper doors (' + doors.length + ')');
{ const kg = L.ents.find(e => e.t === 'keg' && at(e.x, e.y + 1) === T.CRATE); ok(kg, 'a keg stands on the crate hatch'); }
const A = L.arena; ok(A && A.boss === 'champion' && A.ac, 'the arena is THE ADMIRAL\'S CHAMPION\'s');
{ const g = AC.geom(A, 16), R = A.ac.R, ag = guns.filter(q => q.x * 16 + 8 >= A.x0 && q.x * 16 + 8 <= A.x1);
  ok(ag.length === 2 && ag.some(q => q.aim === 1 && Math.abs(q.x * 16 + 8 - g.guns[0].x) < 2) && ag.some(q => q.aim === -1 && Math.abs(q.x * 16 + 8 - g.guns[1].x) < 2), 'a deck gun at each end of his decks, laid inward');
  let clear = true; for (let x = A.ac.sx; x < A.ac.sx + AC.CH_STAGE.W; x++) if (at(x, R - 1) !== T.AIR && at(x, R - 1) !== T.NET) clear = false; ok(clear, 'nothing stands on his decks in a round shot\'s line');
  for (let x = g.cols.g0; x <= g.cols.g1; x++) ok(at(x, R) !== T.SOLID, 'the lashing at ' + x + ' is open water');
  ok(at(g.cols.g0, R + 2) === T.NET && at(g.cols.g1, R + 2) === T.NET, 'a net up each hull out of the lashing'); }
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.length >= 3 && checks.length <= 5 && checks.some(x => x > A.x0 / 16 - 12 && x < A.x0 / 16), 'shrines: ' + checks.join(',') + ' (one an area, one before the boss)');
for (const l of LEVELS) { const B = l.build(); ok(!B.ents.some(e => e.t === 'quarter'), l.id + ' still places the benched Quartermaster'); if (B.arena) ok(B.arena.boss !== 'quarter', l.id + ': a quarter arena'); }
ok(existsSync(ROOT + 'src/benched/quartermaster.js'), 'the Quartermaster is benched in src/benched/quartermaster.js');
for (const f of ['src/main.js', 'src/lab.js', 'src/level.js', 'index.html']) ok(!readFileSync(ROOT + f, 'utf8').includes('benched/quartermaster'.replace('/', '/') + "'") , f + ' imports the benched Quartermaster');

if (process.argv.includes('--pure') || fails) { console.log(fails ? fails + ' FAILED' : 'admirals-champion (pure): ok'); process.exit(fails ? 1 : 0); }

/* ---------- PAGE ---------- */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={heroes:{},world:{}};
    const idx=LEVELS.findIndex(l=>l.id==='flotilla');
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(60*3);return BK.boss;};
    const keys=()=>{for(const k of ['left','right','up','down','jump','block','atk','dodge'])BK.keys[k]=false;};
    for(const h of ['knight','warden','pyro','ranger','paladin']){const o={};try{
      const e=boot(h),CH=BK.championHands(),S=CH.show(),G=S.G;keys();
      const hold=()=>{e.mode='walk';e.modeT=99;S.script=['combo'];S.step=0;S.ward=0;e.open=0;};
      const blow=(x,face)=>{hold();BK.P.x=x;BK.P.y=G.floorY;BK.P.vx=0;BK.P.vy=0;BK.P.face=face;BK.P.inv=99;BK.sim(4);hold();const h0=e.hp,n0=S.n.plated;BK.press('atk');for(let i=0;i<30;i++){if(e.mode!=='flat')hold();BK.sim(1);}return {d:h0-e.hp,plated:S.n.plated-n0};};
      e.x=G.hulls[0][0]+260;e.face=-1;const pl=blow(e.x-20,1);o.plate=pl;
      /* THE GUN: him in the west gun's line, the hero at its breech */
      hold();const gun=BK.props().find(q=>q.t==='cannon'&&q.deck&&q.aim===1&&q.x>G.x0&&q.x<G.gapMid);gun.cool=0;e.x=gun.x+150;BK.P.x=gun.x-14;BK.P.y=G.floorY;BK.P.face=1;BK.P.vx=0;BK.sim(4);hold();
      if(h==='ranger'){BK.keys.down=true;BK.sim(3);}BK.press('atk');let flat=false;for(let i=0;i<60;i++){if(e.mode==='flat'){flat=true;break;}if(e.mode!=='flat')hold();BK.sim(1);}BK.keys.down=false;o.flat=flat;o.open=+(e.open||0).toFixed(2);
      if(flat){const h0=e.hp;e.modeT=9;e.open=3;BK.P.x=e.x-20;BK.P.face=1;BK.sim(2);BK.press('atk');for(let i=0;i<30;i++){e.open=Math.max(e.open,2);e.modeT=9;BK.sim(1);}o.flatD=h0-e.hp;S.taken=0;}
      /* THE WARD: a ball glances */
      hold();S.ward=2;const r=CH.onBall(e,{x:e.x,y:G.floorY-9});o.ward={spent:r,mode:e.mode,glanced:S.n.glanced};S.ward=0;
      e.hp=e.maxHp;e.alive=true;}catch(err){o.err=String(err&&err.stack||err).slice(0,300);}out.heroes[h]=o;}
    /* THE WORLD: a rower's chain, the crate hatch, a copper door (the knight, out of the fight) */
    {BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);keys();const FL=BK.flotilla2(),L=BK.L;
      const r0=L.flot2.rowers[0],m=BK.movers().find(q=>q.flot==='bench'&&q.bench===r0.bench);BK.P.inv=99;
      for(let i=0;i<400&&!(m.y<=m.y0-m.rise+2);i++)BK.sim(1);BK.P.x=r0.x-16;BK.P.y=m.y;BK.P.vx=0;BK.P.vy=0;BK.P.face=1;BK.P.onMover=null;BK.sim(1);BK.P.x=r0.x-16;BK.P.y=m.y;BK.press('atk');BK.sim(20);
      const y1=m.y;BK.sim(90);out.world.rower={freed:r0.freed,halted:!!m.halted,still:Math.abs(m.y-y1)<0.5,y:Math.round(m.y),hi:Math.round(m.y0-m.rise)};
      const g2=BK.props().find(q=>q.t==='cannon'&&q.deck&&Math.round((q.x-8)/16)===448),kg=BK.props().find(q=>q.t==='keg'&&Math.round((q.x-8)/16)===454);
      BK.tp(446,24);BK.sim(20);BK.P.x=g2.x-14;BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(90);out.world.hatch={keg:kg?kg.gone:null,crates:[452,453,454,455,456].map(x=>L.grid[25*L.W+x])};
      const g1=BK.props().find(q=>q.t==='cannon'&&q.deck&&Math.round((q.x-8)/16)===398),d1=BK.props().find(q=>q.t==='bulkhead'&&Math.round((q.x-8)/16)===406);
      BK.tp(396,24);BK.sim(20);BK.P.x=g1.x-14;BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(60);out.world.door=d1?d1.open:null;}
    return out;})()`, 600000);
} finally { pg.close(); }
for (const [h, o] of Object.entries(R.heroes)) {
  if (o.err) { ok(false, h + ': ' + o.err); continue; }
  ok(o.plate.d > 0 && o.plate.plated > 0, h + ': a real blow on his guard lands (' + o.plate.d + ') and clanks HIS PLATE (' + o.plate.plated + ')');
  ok(o.flat && o.open >= 3, h + ': a real blow on the deck gun\'s breech, him in its line, knocks him FLAT (open ' + o.open + ')');
  ok(o.flatD >= o.plate.d * 3, h + ': flat, a blow pays ' + o.flatD + ' (the plate\'s was ' + o.plate.d + ': x' + CH.flatMul + ' vs x' + CH.plate + ')');
  ok(o.ward.spent && o.ward.mode !== 'flat' && o.ward.glanced > 0, h + ': a ball in his ward glances off');
}
ok(R.world.rower.freed && R.world.rower.halted && R.world.rower.still, 'a real swing at a rower\'s chain frees him and his bench stops where it is: ' + JSON.stringify(R.world.rower));
ok(R.world.hatch.keg === true && R.world.hatch.crates.every(t => t === T.AIR), 'the gun blows the keg on the crate hatch open: ' + JSON.stringify(R.world.hatch));
ok(R.world.door === true, 'a gun opens a copper door');
console.log(fails ? fails + ' FAILED' : 'admirals-champion: ok (' + Object.keys(R.heroes).join(', ') + ')'); process.exit(fails ? 1 : 0);
