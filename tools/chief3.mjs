// tools/chief3.mjs - PINS THE CHIEFTAIN'S HORN AND POWDER, AND THE STOCKADE'S BARREL VERB (claude/chief3, Daniel 10-21: "the horn looks cool but we
// don't utilize it at all for the boss... the barrels that explode, there's more we can do"; report work/claude/lane-done/claude-chief3.md).
// STATIC (node, the built level):
//   barrels      the barrel is taught (a sign by the first one), remixed (the kennel lookout stands on PALISADE stakes with a barrel at its foot, and
//                L.stockade.lookouts names its box and stilts), and examined (the powder store: three barrels and its two sat guards on the plateau
//                before the hall's lift); the hall door's sign names the horn and the powder
//   constants    HORN (two blows silence it, a told draw) and KEG (a told fuse longer than the throw, a struck keg keeps a fuse)
// PAGE (one headless page, PORT from tools/ports.mjs or PORT=):
//   the horn     on the ground he winds his war horn; two blows on him silence it and he is OPEN (planted, x2); left to sound it brings his
//                crew (two, at the doors); your own horn blown while he winds his and nobody comes
//   the powder   in his club at range he heaves a keg (told kegTell); it lands lit; struck, it rolls away from you; a blast that catches him on
//                the ground knocks him down OPEN (planted); his crew go when he does
//   the tower    up his war tower a keg's blast at its legs takes both lashings - it falls and he is down in the wreck; his deck horn is
//                dropped when a lashing is cut
//   the lookout  a blast at the kennel lookout's stakes brings the whole lookout down, and its blower with it
import assert from 'node:assert/strict';
import { LEVELS, T } from '../src/level.js';
import { HORN, KEG } from '../src/stockade-hands.js';
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const L = LEVELS.find(l => l.id === 'stockade').build(), S = L.stockade || {}, at = (x, y) => L.grid[y * L.W + x];
const barrels = L.ents.filter(e => e.t === 'barrel'), signs = L.ents.filter(e => e.t === 'sign');
ok(signs.some(s => /BARREL/.test(s.text) && Math.abs(s.x - barrels[0].x) < 6), 'teach: no sign about the barrel by the first barrel (' + barrels[0].x + ')');
const lo = (S.lookouts || [])[0]; ok(!!lo, 'remix: L.stockade.lookouts names no lookout on stakes');
if (lo) { let pal = 0, n = 0; for (let x = lo.sx0; x <= lo.sx1; x++) for (let y = lo.sy0; y <= lo.sy1; y++) { n++; if (at(x, y) === T.PALISADE) pal++; }
  ok(pal === n, 'remix: the lookout\'s stilts are not all stakes (' + pal + ' of ' + n + ' PALISADE)');
  ok(barrels.some(b => b.x >= lo.x0 - 6 && b.x < lo.sx0), 'remix: no barrel at the lookout\'s foot');
  ok(L.ents.some(e => e.t === 'archer' && e.horn && e.stk && e.stk.lookout), 'remix: no horn blower on the lookout'); }
const lift = L.arena.x0 / 16 - 12, store = barrels.filter(b => b.y === 11 && b.x > lift - 16 && b.x < lift);
ok(store.length >= 3, 'exam: the powder store before the hall has ' + store.length + ' barrels (want 3)');
ok(L.ents.filter(e => e.stk && e.stk.cook && e.y === 11 && e.x > lift - 16 && e.x < lift).length >= 2, 'exam: the powder store has no sat guards');
ok(signs.some(s => /HORN/.test(s.text) && /POWDER/.test(s.text) && s.x > L.arena.x0 / 16 - 10 && s.x < L.arena.x0 / 16), 'boss: the hall door\'s sign does not name his horn and his powder');
ok(HORN.hits >= 2 && HORN.hits <= 4 && HORN.draw >= 2 && HORN.draw2 >= 1.8, 'boss: HORN ' + JSON.stringify(HORN) + ' (2-4 blows silence it, a draw of 2 s or more)');
ok(KEG.fuse > KEG.flight + 1 && KEG.kickMin >= 0.6 && KEG.tell >= 0.6, 'boss: KEG ' + JSON.stringify(KEG) + ' (a told heave, a fuse with time left after it lands, a struck keg keeps a fuse)');
console.log('chief3 (static): first barrel ' + barrels[0].x + ' | lookout ' + JSON.stringify(lo) + ' | store ' + store.map(b => b.x).join(',') + ' | HORN hits ' + HORN.hits + ' draw ' + HORN.draw + ' | KEG fuse ' + KEG.fuse);

const pg = await openPage({ audio: false, fonts: false }); let p = {};
try { p = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='stockade');
  const o={};const S=()=>BK.stockade();const E=()=>BK.enemies();const P=()=>BK.P;let k=0;
  const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);};
  const fight=()=>{load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);const ch=E().find(q=>q.t==='chief'&&q.alive);ch.inv=0;return ch;};
  const horn=ch=>{ch.hornCd=0;ch.mode='walk';ch.modeT=0;k=0;while(ch.mode!=='horn'&&k++<120)BK.sim(1);return ch.mode==='horn';};
  const crewN=()=>E().filter(e=>e.alive&&e.chiefCrew).length;
  let ch=fight();o.horn=horn(ch);o.drawn=ch.hornDraw>=2;o.hits=0;for(let i=0;i<4&&ch.mode==='horn';i++){o.hits++;ch.inv=0;BKT.hurtAs('light',ch,10,ch.x-(ch.face||1)*10,false);BK.sim(2);}o.silenced=ch.mode==='planted';
  ch.inv=0;let h=ch.hp;BKT.hurtAs('light',ch,20,ch.x-10,false);o.silTake=(h-ch.hp)/20;
  ch=fight();P().x=ch.x-140;horn(ch);const c0=crewN();k=0;while(ch.mode==='horn'&&k++<400)BK.sim(1);BK.sim(5);o.crew=crewN()-c0;ch.hp=1;ch.inv=0;ch.mode='walk';BKT.hurtEnemy(ch,20,ch.x-10,false);BK.sim(30);BKT.stk().update(1/60);o.crewGone=crewN();o.chiefAlive=ch.alive;o.chiefHp=ch.hp;
  ch=fight();P().x=ch.x-140;BKT.stk().give();horn(ch);BK.sim(10);BKT.stk().blow();k=0;while(ch.mode==='horn'&&k++<400)BK.sim(1);BK.sim(5);o.answered=crewN();
  /* (claude/hookpolish) YOUR HORN PULLS HIS CREW AWAY: his horn has sounded and the crew are in; your captured horn sends every one of them to the far end from him */
  ch=fight();P().x=ch.x-140;horn(ch);k=0;while(ch.mode==='horn'&&k++<400)BK.sim(1);BK.sim(8);{const cw=E().filter(e=>e.alive&&e.chiefCrew);o.pullN=cw.length;BKT.stk().give();const A=BK.L.arena;P().x=(A.x0+A.x1)/2;P().y=A.floor;BKT.stk().blow();BK.sim(30);o.pulledLure0=cw.map(e=>[Math.round(e.x),e.lureT]);BK.sim(150);o.pullEnd=cw.map(e=>Math.round(e.x));o.pulledLure=cw.every(e=>e.lureT>0||!e.alive);o.pulledFar=cw.every(e=>!e.alive||Math.abs(e.x-(A.x0+40))<80||Math.abs(e.x-(A.x1-40))<80);}
  ch=fight();P().x=ch.x-150;P().y=BK.L.arena.floor;ch.stance='club';ch.hornCd=99;ch.kegCd=0;ch.mode='walk';ch.modeT=0;k=0;while(ch.mode!=='kegTell'&&k++<200)BK.sim(1);o.kegTell=ch.mode==='kegTell';
  k=0;while(!S().kegs.length&&k++<120)BK.sim(1);o.thrown=S().kegs.length;k=0;while(S().kegs.length&&S().kegs[0].st==='fly'&&k++<120)BK.sim(1);const kg=S().kegs[0];o.landed=!!kg&&kg.st==='roll'&&kg.fuse>0.8;
  if(kg){ch.x=kg.x+90;ch.mode='walk';ch.hornCd=99;ch.kegCd=99;P().x=kg.x-10;P().y=kg.y;P().face=1;BK.sim(2);BK.press('atk');BK.sim(10);const k2=S().kegs[0];o.kicked=!!k2&&k2.kicked&&k2.x>kg.x;}
  ch=fight();ch.mode='walk';ch.modeT=1;ch.hornCd=99;P().x=ch.x-120;BKT.stkExplode(ch.x+8,ch.y-12,44);BK.sim(1);o.blasted=ch.mode==='planted';
  ch=fight();P().x=ch.x-120;ch.hp=Math.round(ch.maxHp*0.51);ch.inv=0;BKT.hurtEnemy(ch,20,ch.x-10,false);k=0;while(S().tower.st!=='manned'&&k++<600)BK.sim(1);o.manned=S().tower.st==='manned';
  k=0;while(ch.mode!=='towerHorn'&&k++<600)BK.sim(1);o.deckHorn=ch.mode==='towerHorn';const pg0=S().tower.pegs[0];P().x=pg0.x-10;P().y=BK.L.arena.floor;P().face=1;BK.sim(3);BK.press('atk');BK.sim(10);o.dropped=ch.mode!=='towerHorn'&&S().tower.pegs.filter(q=>q.cut).length===1;
  ch=fight();P().x=ch.x-120;ch.hp=Math.round(ch.maxHp*0.51);ch.inv=0;BKT.hurtEnemy(ch,20,ch.x-10,false);k=0;while(S().tower.st!=='manned'&&k++<600)BK.sim(1);
  BKT.stkExplode(S().tower.x+6,S().tower.foot-6,44);k=0;while(ch.mode!=='planted'&&k++<200)BK.sim(1);o.powderTower=S().tower.pegs.every(q=>q.cut)&&ch.mode==='planted'&&S().tower.st==='down';
  
  load();const lo=BK.L.stockade.lookouts[0];const bl=E().find(e=>e.lookout&&e.alive);o.lookoutBlower=!!bl;BK.tp(lo.x0-10,19);BK.sim(5);BKT.stkExplode((lo.sx0)*16+4,19*16+10,40);BK.sim(30);
  o.lookoutDown=S().looks[0].down&&BK.L.grid[14*BK.L.W+lo.sx0+1]===0;o.blowerDown=!!bl&&!bl.alive;
  return o;})()`, 240000); p.errors = pg.errors.slice(0, 3); } finally { pg.close(); }
ok(p.horn && p.drawn, 'horn: he did not wind his war horn from a walk when it came due (' + p.horn + ', draw ' + p.drawn + ')');
ok(p.silenced && p.hits === HORN.hits && p.silTake >= 1.5, 'horn: HORN.hits blows did not silence it and open him (' + p.silenced + ' after ' + p.hits + ', a blow then at ' + p.silTake + 'x)');
ok(p.crew === HORN.crewMax, 'horn: left to sound it brought ' + p.crew + ' crew (want ' + HORN.crewMax + ')');
ok(p.answered === 0, 'horn: your horn blown while he winds his - ' + p.answered + ' crew still came (want none)');
ok(p.pullN === HORN.crewMax && p.pulledLure && p.pulledFar, 'horn: your horn did not pull his called crew to the far end (' + JSON.stringify({ n: p.pullN, lured: p.pulledLure, far: p.pulledFar }) + ')');
ok(p.kegTell && p.thrown === 1 && p.landed, 'powder: in his club at range he did not heave a keg that lands lit (' + JSON.stringify({ tell: p.kegTell, thrown: p.thrown, landed: p.landed }) + ')');
ok(p.kicked, 'powder: a keg struck did not roll away from the hero');
ok(p.blasted, 'powder: a blast on him on the ground did not knock him down open');
ok(p.manned && p.deckHorn && p.dropped, 'tower: up his tower he did not wind the deck horn, or a cut lashing did not knock it from his lips (' + JSON.stringify({ manned: p.manned, horn: p.deckHorn, dropped: p.dropped }) + ')');
ok(p.powderTower, 'tower: a blast at his war tower\'s legs did not take both lashings and bring him down in the wreck');
ok(p.crewGone === 0, 'horn: ' + p.crewGone + ' of his crew stayed after he fell');
ok(p.lookoutBlower && p.lookoutDown && p.blowerDown, 'lookout: a blast at its stakes did not bring the lookout and its blower down (' + JSON.stringify({ blower: p.lookoutBlower, down: p.lookoutDown, his: p.blowerDown }) + ')');
ok(!(p.errors || []).length, 'page errors ' + JSON.stringify(p.errors));
console.log('chief3 (page): ' + JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'errors'))));
if (fails.length) console.log(fails.map(f => '  FAIL ' + f).join('\n'));
assert.deepEqual(fails, []);
console.log('chief3: the Chieftain\'s horn (silenced = open, sounded = his crew, answered = none) and powder (heaved, struck back, blasted, his tower\'s legs), and the barrel verb (taught, the lookout, the store) all hold');
