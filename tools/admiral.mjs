/* tools/admiral.mjs - THE ADMIRAL and THE FLOTILLA 3 keep their promises (claude/flotilla3; scratch/brief-flotilla3-1018.md C + D and the APPROVED review
   scratch/review-flotilla-1018.md). The Flotilla's checks moved here from tools/admirals-champion.mjs (the Champion is off the Flotilla, registered for the Keep).
   PURE (node): his moves' marks/answers/heights agree with src/marks.js; every tell >= 0.5 s; B15 + Daniel's armour exception - every awake mode takes > 0, armoured
     the chip is 0.15 / 0.25 / 0.35 by plates left (never under 0.15), bare >= 1 outside openings, openings x1 armoured / x1.6 bare; his plate holds him over AD.floor;
     a round shot on his line passes under, in his ward glances, otherwise A PLATE goes (staggered OPEN) - three plates, then bare, then a ball knocks him FLAT; his keg
     struck back blows a plate on him; his line cut drops him (into the harbour: he climbs out SOAKED, open); a stub fight plays every move of both phases (the list too).
   THE LEVEL (node): the rule line is the guns; the named areas; no crabs; one new foe (the grapnel boarder) and the pirate reskins; every copper door a gun west of it laid
     at it; the crate hatch a keg on it; his broadside zones inside the level, one told by a signal hoist each; the laid guns' targets are what they open; the arena his,
     a gun at each end laid inward, a clear deck; the light steps to night; one shrine an area's end + one before the boss.
   PAGE (headless, every hero): a real blow on his iron CHIPS it (> 0, <= 0.35 of the open blow) and says IRON PLATE; a real blow on the deck gun's breech with him in its
     line BLOWS A PLATE (3 -> 2) and opens him; a ball in his ward glances; his keg struck back blows a plate; his grapnel line cut drops him; THE WORLD: the swivel blows the
     hulk's deck open, the top gun drops the yard, his broadside costs ~a quarter of a hero's health, a rower's chain stops his bench, a gun blows the crate hatch, a gun
     opens a copper door, a grapnel boarder cut off his line over the harbour is gone.
   node tools/admiral.mjs [--pure]   (PORT for the page) */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as AD0 from '../src/admiral.js';
import { BY_HAND, ANSWER, HEIGHT } from '../src/marks.js';
import { LEVELS, T } from '../src/level.js';
const { AD } = AD0;
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } };

/* ---------- PURE: the table ---------- */
for (const [mode, mv] of Object.entries(AD0.MOVES)) {
  ok(BY_HAND['admiral|' + mode] === mv.mark, mode + ': src/marks.js BY_HAND says ' + BY_HAND['admiral|' + mode] + ', the fight marks ' + mv.mark);
  if (mv.answer) { ok(ANSWER['admiral|' + mode] === mv.answer, mode + ': ANSWER disagrees'); ok(!!HEIGHT['admiral|' + mode], mode + ': no HEIGHT row'); }
  const t = AD[mode]; ok(typeof t === 'number' && t >= 0.5, mode + ': a tell of ' + t + ' s (>= 0.5)'); }
ok(AD.chip[3] === 0.15 && AD.chip[2] > AD.chip[3] && AD.chip[1] > AD.chip[2] && AD.chip[1] < 0.4, 'the armour chip: 0.15 with all three plates (Daniel\'s option a), more with each gone, under the 0.4 floor only while armoured');
/* a stub arena and a stub world */
const A = { ac: { sx: 540, R: 25 } }, G = AD0.geom(A, 16);
const W0 = { hit: () => false, slide: () => {}, number: () => {}, word: () => {}, mark: () => {}, sound: () => {}, fx: () => {}, shake: () => {}, music: () => {}, list: () => {} };
const mk = () => ({ t: 'admiral', x: G.hulls[1][0] + 200, y: G.floorY, face: -1, hp: AD.hp, maxHp: AD.hp, alive: true, mode: 'walk', modeT: 1, open: 0, phase: 1 });
{ const S = AD0.newFight(G), e = mk();
  for (const m of ['walk', 'cutTell', 'cut', 'pistolTell', 'kegTell', 'whistleRec', 'grapTell', 'landRec']) { e.mode = m; const r = AD0.takeAt(e, S); ok(r.k > 0 && r.k <= 0.15 + 1e-9 && r.word === 'IRON PLATE', m + ': armoured, a blade chips 0.15 and says IRON PLATE (took ' + r.k + ')'); }
  e.mode = 'reload'; e.open = 1; ok(AD0.takeAt(e, S).k === 1, 'RELOADING (armoured) pays x1');
  e.mode = 'walk'; e.open = 0; S.ward = 1; ok(AD0.takeAt(e, S).k > 0 && AD0.takeAt(e, S).word === 'WARDED', 'warded: never nothing'); S.ward = 0;
  ok(AD0.floorHp(e, S) === AD.hp * AD.floor, 'armoured, his plate holds him over ' + AD.floor + ' of his health');
  /* THE GUNS: three plates, then bare, then flat */
  e.mode = 'swing'; ok(AD0.blowPlate(e, S, W0, 'gun', -1) === 'air', 'on his line a ball passes under him'); e.mode = 'walk';
  for (let i = 3; i >= 1; i--) { const r = AD0.blowPlate(e, S, W0, 'gun', i % 2 ? 1 : -1); ok(r === 'plate' && S.plates === i - 1 && e.mode === 'stagger' && e.open > 2, 'a ball blows a plate (' + i + ' -> ' + S.plates + '), staggered OPEN ' + e.open);
    ok(AD0.blowPlate(e, S, W0, 'gun', 1) === 'busy', 'staggered, a second ball is spent'); e.mode = 'walk'; e.open = 0; S.ward = 1; ok(AD0.blowPlate(e, S, W0, 'gun', 1) === 'ward', 'in his ward a ball glances'); S.ward = 0; }
  ok(new Set(S.off).size === 3, 'the three plates are three different plates: ' + S.off);
  e.mode = 'walk'; ok(AD0.takeAt(e, S).k === 1, 'bare: x1 outside his openings'); ok(AD0.floorHp(e, S) === 0, 'bare: no floor');
  ok(AD0.blowPlate(e, S, W0, 'gun', 1) === 'flat' && AD0.adFlat(e), 'bare, a ball knocks him FLAT'); ok(AD0.takeAt(e, S).k === AD.openMul, 'flat, bare: x' + AD.openMul); }
/* HIS KEG struck back blows a plate on him; HIS LINE cut drops him */
{ const S = AD0.newFight(G), e = mk(); e.mode = 'walk'; S.keg = { x: e.x - 60, y: G.floorY, vx: -AD.kegV, fuse: 3, back: false, key: 'k' };
  ok(AD0.kegStruck(S, 1, W0), 'a blow on the keg strikes it back'); const hero = [{ x: e.x - 200, y: G.floorY, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 120 && S.plates === 3; i++) AD0.stepAdmiral(e, S, 1 / 60, hero, W0); ok(S.plates === 2 && S.n.platesByKeg === 1, 'his keg back on him blows a plate (plates ' + S.plates + ')'); }
{ const S = AD0.newFight(G), e = mk(); e.mode = 'swing'; e.modeT = 2; e.x = G.gapMid; e.y = G.floorY - 30; S.swing = { x0: G.hulls[1][0] + 40, x1: G.hulls[0][1] - 40, t: 0.5 };
  ok(AD0.cutLine(e, S, W0) && e.mode === 'fall', 'his line cut: he falls'); const hero = [{ x: G.x0 + 40, y: G.floorY, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 240 && !AD0.adOpen(e); i++) AD0.stepAdmiral(e, S, 1 / 60, hero, W0); ok(e.mode === 'soaked' && AD0.adOpen(e), 'over the harbour he climbs out SOAKED and OPEN (' + e.mode + ')'); }
/* A STUB FIGHT: every move of both phases (the plates blown on a timer) */
{ const S = AD0.newFight(G), e = mk(); e.mode = 'wake'; e.modeT = 0.1; const seen = new Set(); let t = 0;
  const hero = [{ x: G.hulls[1][0] + 120, y: G.floorY, ground: true, alive: true, pp: {} }];
  for (let i = 0; i < 60 * 240; i++) { t += 1 / 60; if (i % (60 * 18) === 60 * 17 && S.plates > 0) { e.mode = 'walk'; S.ward = 0; AD0.blowPlate(e, S, W0, 'gun', 1); }
    hero[0].x = i % 1200 < 600 ? G.hulls[1][0] + 120 : G.hulls[0][0] + 160; AD0.stepAdmiral(e, S, 1 / 60, hero, W0); seen.add(e.mode); }
  for (const m of ['cutTell', 'pistolTell', 'pistol2Tell', 'reload', 'kegTell', 'whistleTell', 'grapTell', 'swing', 'stagger', 'listTell', 'flurryTell', 'axeTell'])
    ok(seen.has(m), 'the stub fight never played ' + m); ok(S.ph === 2 && S.list, 'phase two: bare, the flagship listing'); }

/* ---------- THE LEVEL ---------- */
const lv = LEVELS.find(l => l.id === 'flotilla'), L = lv.build(), at = (x, y) => L.grid[y * L.W + x];
ok(lv.rule === 'STRIKE A BREECH AND THE GUN CLEARS ITS LINE. WHEN HIS FLAG RUNS RED, HIS GUNS CLEAR YOURS.', 'the rule line is the guns (review fix 1)');
ok((L.sections || []).map(s => s.name).join('|') === 'THE ROCK|THE GALLEY|THE GALLEY HULL|THE PRIZE|THE RIGGING RUN|THE POWDER SHIP|THE LASHINGS', 'the named areas');
ok(!L.ents.some(e => e.t === 'crab'), 'no crabs on a pirate town (review Q7)');
ok(L.ents.filter(e => e.t === 'grapnel').length >= 3, 'the grapnel boarder: taught, then the exam');
for (const sk of ['pistoleer', 'kegroller']) ok(L.ents.some(e => e.cnSkin === sk), 'the ' + sk + ' (the Admiral\'s kit, taught on his crew)');
for (const m of L.moversExtra) ok(m.flot === 'bench' || m.flot === 'yard' || m.kind === 'swing', 'a mover that is not a bench, a yard or a swing: ' + JSON.stringify(m).slice(0, 80));
const doors = L.ents.filter(e => e.t === 'bulkhead'), guns = L.ents.filter(e => e.t === 'cannon' && e.deck);
for (const d of doors) ok(guns.some(q => q.x < d.x && q.aim === 1 && q.y === d.y && d.x - q.x < 24), 'the copper door at ' + d.x + ' has a gun laid at it from the west');
{ const kg = L.ents.find(e => e.t === 'keg' && at(e.x, e.y + 1) === T.CRATE); ok(kg, 'a keg stands on the crate hatch'); }
const Z = L.flot3 && L.flot3.zones; ok(Z && Z.length >= 5, 'his broadside: ' + (Z ? Z.length : 0) + ' zones');
for (const z of Z || []) { ok(z.x0 >= 0 && z.x1 < L.W && z.y0 <= z.y1, z.id + ': inside the level'); ok(L.ents.some(e => e.t === 'signalhoist' && e.zone === z.id), z.id + ': told by a signal hoist in the play plane (A3)'); }
ok(Z && Z.some(z => z.harmless), 'the rock\'s zone is harmless: the tell taught safe');
for (const gn of L.ents.filter(e => e.t === 'aimgun')) { ok(gn.hole || gn.bridge, gn.id + ': a laid gun opens something');
  if (gn.hole) { const [x0, x1, y0, y1] = gn.hole; ok(gn.tx >= x0 && gn.tx <= x1 && gn.ty >= y0 && gn.ty <= y1, gn.id + ': its drawn target is the hole it opens'); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) ok(at(x, y) === T.SOLID, gn.id + ': the deck it blows is solid until then (' + x + ',' + y + ')'); }
  if (gn.bridge) { const [x0, x1, y] = gn.bridge; let open = 0; for (let x = x0; x <= x1; x++) if (at(x, y) === T.AIR) open++; ok(open === x1 - x0 + 1, gn.id + ': the gap its yard drops across is open until then'); } }
const Ar = L.arena; ok(Ar && Ar.boss === 'admiral' && Ar.ac && Ar.music === 'admiral', 'the arena is THE ADMIRAL\'s, on his own theme');
{ const g = AD0.geom(Ar, 16), R = Ar.ac.R, ag = guns.filter(q => q.x * 16 + 8 >= Ar.x0 && q.x * 16 + 8 <= Ar.x1);
  ok(ag.length === 2 && ag.some(q => q.aim === 1) && ag.some(q => q.aim === -1), 'a deck gun at each end of his decks, laid inward');
  let clear = true; for (let x = Ar.ac.sx; x < Ar.ac.sx + AD0.AD_STAGE.W; x++) if (at(x, R - 1) !== T.AIR && at(x, R - 1) !== T.NET) clear = false; ok(clear, 'nothing stands on his decks in a round shot\'s line');
  for (let x = g.cols.g0; x <= g.cols.g1; x++) ok(at(x, R) !== T.SOLID, 'the lashing at ' + x + ' is open water'); }
ok((L.tints || []).length >= 5 && L.tints[L.tints.length - 1][3] >= 0.25, 'the light steps from golden hour to night (review Q8)');
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
ok(checks.length >= 4 && checks.some(x => x > Ar.x0 / 16 - 12 && x < Ar.x0 / 16), 'shrines: ' + checks.join(',') + ' (one an area, one before the boss)');
ok(!L.ents.some(e => e.t === 'champion'), 'THE CHAMPION is off the flotilla (his code stays registered for the Keep)');

if (process.argv.includes('--pure') || fails) { console.log(fails ? fails + ' FAILED' : 'admiral (pure + level): ok'); process.exit(fails ? 1 : 0); }

/* ---------- PAGE ---------- */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let R;
try {
  R = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.speed=1;const out={heroes:{},world:{}};
    const idx=LEVELS.findIndex(l=>l.id==='flotilla');
    const boot=h=>{BK.setHero(h);BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);const A=BK.L.arena;BK.tp(A.start[0],A.start[1]);BK.sim(60*3);return BK.boss;};
    const keys=()=>{for(const k of ['left','right','up','down','jump','block','atk','dodge'])BK.keys[k]=false;};
    for(const h of ['knight','warden','pyro','ranger','paladin','pirate','reaper','geomancer','berserker']){const o={};try{
      const e=boot(h),AH=BK.admiralHands(),S=AH.show(),G=S.G;keys();
      const hold=()=>{e.mode='walk';e.modeT=99;S.script=['cut'];S.step=0;S.ward=0;e.open=0;S.lanes=null;S.keg=null;S.shots=[];};
      const blow=(x,face)=>{hold();BK.P.x=x;BK.P.y=G.floorY;BK.P.vx=0;BK.P.vy=0;BK.P.face=face;BK.P.inv=99;BK.sim(4);hold();const h0=e.hp,n0=S.n.chipped;BK.press('atk');for(let i=0;i<30;i++){if(e.mode!=='stagger')hold();BK.sim(1);}return {d:h0-e.hp,chipped:S.n.chipped-n0};};
      e.x=G.hulls[0][0]+260;e.face=-1;o.iron=blow(e.x-20,1);
      /* THE GUN: him in the west gun's line, the hero at its breech */
      hold();const gun=BK.props().find(q=>q.t==='cannon'&&q.deck&&q.aim===1&&q.x>G.x0-16&&q.x<G.gapMid);gun.cool=0;e.x=gun.x+150;BK.P.x=gun.x-14;BK.P.y=G.floorY;BK.P.face=1;BK.P.vx=0;BK.sim(4);hold();
      if(h==='ranger'){BK.keys.down=true;BK.sim(3);}BK.press('atk');let st=false;for(let i=0;i<60;i++){if(e.mode==='stagger'){st=true;break;}hold();BK.sim(1);}BK.keys.down=false;o.plate={st,plates:S.plates,open:+(e.open||0).toFixed(2)};
      if(st){const h0=e.hp;e.modeT=9;e.open=3;BK.P.x=e.x-20;BK.P.face=1;BK.sim(2);BK.press('atk');for(let i=0;i<30;i++){e.open=Math.max(e.open,2);e.modeT=9;BK.sim(1);}o.openD=h0-e.hp;}
      /* THE WARD: a ball glances */
      hold();S.ward=2;const r=AH.onBall(e,{x:e.x,y:G.floorY-9,vx:400});o.ward={spent:r,glanced:S.n.glanced,plates:S.plates};S.ward=0;
      /* HIS KEG struck back */
      hold();const p0=S.plates;e.x=G.hulls[0][0]+300;e.face=-1;BK.P.x=e.x-120;BK.P.y=G.floorY;BK.P.face=1;BK.P.inv=99;BK.sim(2);S.keg={x:BK.P.x+16,y:G.floorY,vx:-60,fuse:3,back:false,key:'kt'};if(h==='ranger'){BK.keys.down=true;BK.sim(2);}BK.press('atk');
      for(let i=0;i<150&&S.plates===p0;i++){if(e.mode!=='stagger'){e.mode='walk';e.modeT=99;S.script=['cut'];S.step=0;S.ward=0;}BK.sim(1);}BK.keys.down=false;o.keg={plates:S.plates,p0,back:S.n.kegBack};
      e.hp=e.maxHp;e.alive=true;}catch(err){o.err=String(err&&err.stack||err).slice(0,300);}out.heroes[h]=o;}
    /* THE WORLD (the knight, out of the fight) */
    {BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);keys();const F3=BK.flotilla3(),L=BK.L;BK.P.inv=99;
      const sw=F3.guns().find(g=>g.id==='swivel');BK.tp(sw.x-1,sw.y);BK.sim(20);BK.P.x=sw.x*16-4;BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(120);out.world.swivel={fired:sw.fired,hole:[257,258,259,260].map(x=>L.grid[22*L.W+x])};
      const tg=F3.guns().find(g=>g.id==='topgun');BK.tp(tg.x-1,tg.y-1);BK.sim(30);const tq={};for(let k=0;k<3&&!tg.fired;k++){BK.P.x=tg.x*16-4;BK.P.y=(tg.y+1)*16;BK.P.vy=0;BK.P.face=1;BK.sim(2);tq['p'+k]=[+(BK.P.x/16).toFixed(2),+(BK.P.y/16).toFixed(2),BK.P.ground];BK.press('atk');BK.sim(40);}BK.sim(80);out.world.topgun={tq,fired:tg.fired,bridge:[289,294,300].map(x=>L.grid[10*L.W+x])};
      /* HIS BROADSIDE on the galley's deck (no god: what it costs) */
      BK.god=false;const z=F3.zones().find(q=>q.id==='galley');BK.tp(91,22);BK.sim(10);BK.P.hp=BK.P.maxHp;BK.P.inv=0;z.st='tell';z.t=0.05;const hp0=BK.P.hp;for(let i=0;i<90;i++){BK.P.x=91*16+8;BK.P.vx=0;BK.sim(1);}out.world.broadside={cost:+((hp0-BK.P.hp)/BK.P.maxHp).toFixed(2)};BK.P.hp=BK.P.maxHp;BK.god=true;
      /* a grapnel boarder cut off his line over the harbour */
      const gb=BK.enemies().find(q=>q.t==='grapnel'&&q.alive&&q.x<263*16);if(gb){gb.gmode='swing';gb.sw={x0:gb.x,y0:gb.y,x1:230*16,y1:26*16,t:0.5};gb.x=252*16;gb.y=22*16;BK.flotilla3().strike({l:gb.x-10,r:gb.x+10,t:gb.y-30,b:gb.y});for(let i=0;i<120&&gb.alive;i++)BK.sim(1);out.world.grapnel={mode:gb.gmode,alive:gb.alive};}
      const r0=L.flot2.rowers[0],m=BK.movers().find(q=>q.flot==='bench'&&q.bench===r0.bench);
      for(let i=0;i<400&&!(m.y<=m.y0-m.rise+2);i++)BK.sim(1);BK.P.x=r0.x-16;BK.P.y=m.y;BK.P.vx=0;BK.P.vy=0;BK.P.face=1;BK.P.onMover=null;BK.sim(1);BK.P.x=r0.x-16;BK.P.y=m.y;BK.press('atk');BK.sim(20);
      const y1=m.y;BK.sim(90);out.world.rower={freed:r0.freed,halted:!!m.halted,still:Math.abs(m.y-y1)<0.5};
      const g2=BK.props().find(q=>q.t==='cannon'&&q.deck&&Math.round((q.x-8)/16)===448),kg=BK.props().find(q=>q.t==='keg'&&Math.round((q.x-8)/16)===454);
      BK.tp(446,24);BK.sim(20);BK.P.x=g2.x-14;BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(90);out.world.hatch={keg:kg?kg.gone:null,crates:[452,453,454,455,456].map(x=>L.grid[25*L.W+x])};
      const g1=BK.props().find(q=>q.t==='cannon'&&q.deck&&Math.round((q.x-8)/16)===398),d1=BK.props().find(q=>q.t==='bulkhead'&&Math.round((q.x-8)/16)===406);
      BK.tp(396,24);BK.sim(20);BK.P.x=g1.x-14;BK.P.face=1;BK.sim(2);BK.press('atk');BK.sim(60);out.world.door=d1?d1.open:null;}
    return out;})()`, 900000);
} finally { pg.close(); }
for (const [h, o] of Object.entries(R.heroes)) {
  if (o.err) { ok(false, h + ': ' + o.err); continue; }
  ok(o.iron.d > 0 && o.iron.chipped > 0, h + ': a real blow on his iron chips it (' + o.iron.d + ') and says IRON PLATE (' + o.iron.chipped + ')');
  ok(o.plate.st && o.plate.plates === 2 && o.plate.open >= 2, h + ': a real blow on the deck gun\'s breech, him in its line, blows a plate and opens him: ' + JSON.stringify(o.plate));
  ok(o.openD >= o.iron.d * 3, h + ': staggered, a blow pays ' + o.openD + ' (on his iron ' + o.iron.d + ')');
  ok(o.ward.spent && o.ward.glanced > 0, h + ': a ball in his ward glances off');
  ok(o.keg.plates === o.keg.p0 - 1 && o.keg.back > 0, h + ': his keg struck back blows a plate on him: ' + JSON.stringify(o.keg));
}
ok(R.world.swivel.fired && R.world.swivel.hole.every(t => t === T.AIR), 'the swivel blows the hulk\'s rotten deck open: ' + JSON.stringify(R.world.swivel));
ok(R.world.topgun.fired && R.world.topgun.bridge.every(t => t === T.ONEWAY), 'the top gun drops the yard across: ' + JSON.stringify(R.world.topgun));
ok(R.world.broadside.cost >= 0.2 && R.world.broadside.cost <= 0.32, 'his broadside costs about a quarter of a hero\'s health: ' + R.world.broadside.cost);
ok(R.world.grapnel && !R.world.grapnel.alive, 'a grapnel boarder cut off his line over the harbour is gone: ' + JSON.stringify(R.world.grapnel));
ok(R.world.rower.freed && R.world.rower.halted && R.world.rower.still, 'a real swing at a rower\'s chain stops his bench: ' + JSON.stringify(R.world.rower));
ok(R.world.hatch.keg === true && R.world.hatch.crates.every(t => t === T.AIR), 'the gun blows the keg on the crate hatch open: ' + JSON.stringify(R.world.hatch));
ok(R.world.door === true, 'a gun opens a copper door');
console.log(fails ? fails + ' FAILED' : 'admiral: ok (' + Object.keys(R.heroes).join(', ') + ')'); process.exit(fails ? 1 : 0);
