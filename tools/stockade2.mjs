// tools/stockade2.mjs - PINS THE STOCKADE 2's NEW BEATS (claude/stockade2, scratch/brief-stockade2-1014.md; report work/claude/lane-done/claude-stockade2.md)
// so a later merge cannot silently drop them. STATIC (node, the built level):
//   watchtowers  the section is built: the dozing blower who drops his horn, two log piles, the barred gate (T.PORT, opened by the horn - reachDoors),
//                three exam blowers (exam 1..3, packOnly, their own packs) on three towers over a netted pit, rope bridges between them, and the crow's
//                nest silver off the route (the level still holds exactly three silvers)
//   areas        L.stockade.areas names the level's areas in order, the last the Great Hall
//   war tower    L.stockade.tower stands in the Chieftain's arena with a peg each side; the Chieftain is on the B15 floor (GREED.chipBy.chief >= 0.4)
// PAGE (one headless page, PORT from tools/ports.mjs or PORT=):
//   the horn     the dozer sleeps at range, wakes at your back, drops his horn; you take it; E blows it and the cooks run under the pile; one blow
//                on the lashing drops it and crushes them
//   the gate     the horn blown before it opens the barred gate (its tiles go) and its crew come out to the sound
//   the exam     climbing the first tower winds all three horns at once (even the one off the screen); a horn left to sound wakes its own pack
//                and NOT the camp squad
//   the tower    at his second wind the Chieftain climbs his war tower; a blow up there lands at half (never nothing); both pegs cut, it falls and
//                he is down in the wreck (planted: x2)
// PROVED RED FIRST on master 45d7d8a1 (a throwaway worktree): none of these exist there.
import assert from 'node:assert/strict';
import { LEVELS, T, TS } from '../src/level.js';
import { GREED } from '../src/boss-greed.js';
import { pacing } from './pacing.mjs';
import { openPage } from './cdp.mjs';

const fails = [], ok = (c, m) => { if (!c) fails.push(m); };
const lv = LEVELS.find(l => l.id === 'stockade'); const L = lv.build(), S = L.stockade || {};
const at = (x, y) => L.grid[y * L.W + x];
// ---- STATIC ----
ok(!!L.stockade, 'L.stockade: the level carries no Stockade 2 data (gate, exam, tower, areas)');
const archers = L.ents.filter(e => e.t === 'archer'), stk = e => e.stk || {};
const dozer = archers.find(e => e.horn && stk(e).dozing && stk(e).drops);
ok(!!dozer, 'watchtowers: no dozing blower who drops his horn');
const piles = L.ents.filter(e => e.t === 'logpile'); ok(piles.length >= 2, 'watchtowers: ' + piles.length + ' log piles (want 2: the teach over the cook fire, the gate)');
ok(L.ents.filter(e => stk(e).cook).length >= 2, 'watchtowers: no cook goblins under the first pile');
const G = S.gate; ok(!!G, 'watchtowers: no barred gate');
if (G) { let port = 0; for (let y = G.y0; y <= G.y1; y++) if (at(G.x, y) === T.PORT) port++; ok(port === G.y1 - G.y0 + 1, 'watchtowers: the gate column ' + G.x + ' is not barred (T.PORT) rows ' + G.y0 + '-' + G.y1);
  ok((L.reachDoors || []).some(d => d.x0 <= G.x && d.x1 >= G.x), 'watchtowers: the gate is not in L.reachDoors (the reach fill would call the far side unreachable)');
  ok(L.ents.filter(e => stk(e).gateGuard && e.x > G.x).length >= 3, 'watchtowers: the gate has no crew behind it'); }
const exam = [1, 2, 3].map(n => archers.find(e => e.horn && stk(e).exam === n));
ok(exam.every(Boolean), 'exam: the three exam blowers (exam 1, 2, 3) are not all there');
if (exam.every(Boolean)) { ok(exam.every(e => stk(e).packOnly && Array.isArray(e.pack) && e.pack.length >= 2), 'exam: every exam horn wakes its own pack (packOnly) - not the camp squad');
  ok(exam[0].x < exam[1].x && exam[1].x < exam[2].x, 'exam: the three towers stand in order');
  ok((S.exam && S.exam.draw || []).length === 3 && S.exam.draw[0] < S.exam.draw[1] && S.exam.draw[1] < S.exam.draw[2], 'exam: three draws, each longer than the last (' + JSON.stringify(S.exam && S.exam.draw) + ')');
  const bridges = L.ents.filter(e => e.t === 'bridge' && e.x > exam[0].x - 2 && e.x < exam[2].x); ok(bridges.length >= 2, 'exam: ' + bridges.length + ' rope spans between the towers (want 2+)');
  let net = 0; for (let x = exam[0].x; x < exam[2].x; x++) if (at(x, 25) === T.NET) net++; ok(net > 20, 'exam: no net over the stake pit under the towers (' + net + ' cells)'); }
const sv = L.ents.filter(e => e.t === 'silver'); ok(sv.length === 3, 'secrets: the level holds ' + sv.length + ' silvers (exactly three - VAULT order)');
const P0 = pacing(lv); ok(P0.stats.offLoot.filter(s => /^silver@/.test(s)).length >= 2, 'secrets: ' + P0.stats.offLoot.join(' ') + ' - the crow\'s nest silver is not off the route');
ok(Array.isArray(S.areas) && S.areas.length >= 5 && /HALL/.test(S.areas[S.areas.length - 1][0]), 'areas: L.stockade.areas does not name the level\'s areas ending in the Great Hall');
const A = L.arena, TW = S.tower; ok(!!TW && A && TW.x > A.x0 && TW.x < A.x1 && TW.pegs.length === 2 && TW.pegs.every(x => x > A.x0 && x < A.x1), 'war tower: none in the Chieftain\'s arena, or its pegs stand outside it');
ok((GREED.chipBy.chief ?? GREED.chip) >= 0.4, 'B15: the Chieftain takes ' + (GREED.chipBy.chief ?? GREED.chip) + 'x outside his openings (the floor is 0.4)');
console.log('stockade2 (static): dozer ' + (dozer ? dozer.x + ',' + dozer.y : '-') + ' | piles ' + piles.map(p => p.x + ',' + p.y).join(' ') + ' | gate ' + (G ? G.x : '-') + ' | exam ' + exam.map(e => e ? e.x + ',' + e.y : '-').join(' ') + ' | silvers off route ' + P0.stats.offLoot.join(' ') + ' | tower ' + (TW ? Math.round(TW.x / TS) : '-'));

// ---- PAGE ----
let page = {};
if (L.stockade) { const pg = await openPage({ audio: false, fonts: false });
  try { page = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;const idx=LEVELS.findIndex(l=>l.id==='stockade');
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(10);};
    const o={};const S=()=>BK.stockade();const E=()=>BK.enemies();const P=()=>BK.P;load();
    const dz=E().find(e=>e.drops);BK.tp(Math.round(dz.x/16)-9,Math.round(dz.y/16));BK.sim(40);o.dozing=!!dz.dozing&&!(dz.hornT>0);
    BK.tp(Math.round(dz.x/16)-1,Math.round(dz.y/16));BK.sim(20);o.woke=!dz.dozing&&dz.hornT>0;
    BKT.hurtEnemy(dz,999,P().x,false);BK.sim(60);const pk=S().pickups[0];o.dropped=!!pk;if(pk){BK.tp(Math.floor(pk.x/16),Math.floor(pk.y/16)-1);BK.sim(20);}o.held=S().held;
    const p1=S().piles[0];BK.tp(Math.floor(p1.x/16)-1,Math.floor(p1.y/16)-1);BK.sim(5);const cooks=()=>E().filter(e=>e.alive&&e.cook!==undefined&&Math.abs(e.x-p1.x)<20*16&&e.y>p1.y+40);
    const c0=cooks().length;o.blew=S().blow();BK.sim(150);o.under=cooks().filter(e=>Math.abs(e.x-p1.x)<26).length;o.cooks=c0;
    P().face=Math.sign(p1.x-P().x)||1;BK.press('atk');BK.sim(90);o.pile=S().piles[0].st;o.crushed=c0-cooks().length;
    const g=BK.L.stockade.gate;BK.tp(g.x-4,19);BK.sim(60);o.gateShut=BK.L.grid[g.y0*BK.L.W+g.x+0]!==0;S().blow();BK.sim(90);o.gateOpen=S().gateOpen&&BK.L.grid[(g.y1)*BK.L.W+g.x]===0;
    o.crewOut=E().filter(e=>e.alive&&e.gateGuard==='out').length;
    for(const e of E())if(e.alive&&!e.maxHp&&Math.abs(e.x-g.x*16)<14*16)BKT.hurtEnemy(e,999,P().x,false);
    const ex=BK.L.stockade.exam;BK.tp(ex.x0+1,17);BK.sim(20);o.exam=S().examOn;const bl=E().filter(e=>e.exam).sort((a,b)=>a.exam-b.exam);o.winding=bl.map(e=>+(e.hornT||0).toFixed(2));
    const n0=E().filter(e=>e.alive).length;const sq0=E().filter(e=>e.alive&&e.t==='hound'&&e.x<ex.x0*16).length;let k=0;while(!bl[0].blown&&k++<900)BK.sim(1);o.blown1=bl[0].blown;BK.sim(90);
    o.pack=E().filter(e=>e.alive).length-n0;o.squad=E().filter(e=>e.alive&&e.t==='hound'&&e.x<ex.x0*16).length-sq0;
    load();const A=BK.L.arena;BK.tp(Math.round(A.trigger/16)+1,Math.round(A.floor/16)-1);BK.sim(200);const ch=E().find(q=>q.t==='chief'&&q.alive);
    ch.inv=0;const h0=ch.hp;BKT.hurtAs('light',ch,20,ch.x+(ch.face>0?-10:10),false);o.floorTake=(h0-ch.hp)/20;
    ch.hp=Math.round(ch.maxHp*0.51);ch.inv=0;BKT.hurtEnemy(ch,20,ch.x-10,false);k=0;while(S().tower.st!=='manned'&&k++<600)BK.sim(1);o.manned=S().tower.st==='manned';o.upMode=ch.mode;o.upY=Math.round(ch.y/16);
    ch.inv=0;const h1=ch.hp;BKT.hurtAs('light',ch,20,ch.x-10,false);o.upTake=(h1-ch.hp)/20;
    for(const p of S().tower.pegs){P().x=p.x-10;P().y=A.floor;P().face=1;BK.sim(5);BK.press('atk');BK.sim(12);}o.cut=S().tower.pegs.filter(p=>p.cut).length;
    k=0;while(ch.mode!=='planted'&&k++<200)BK.sim(1);o.wreck=ch.mode==='planted'&&S().tower.st==='down';ch.inv=0;const h2=ch.hp;BKT.hurtAs('light',ch,20,ch.x-10,false);o.wreckTake=(h2-ch.hp)/20;
    return o;})()`, 180000); page.errors = pg.errors.slice(0, 3); } finally { pg.close(); }
  const p = page;
  ok(p.dozing, 'horn: the dozer winds his horn at range (he should sleep until you are at his back)'); ok(p.woke, 'horn: the dozer did not wake at your back');
  ok(p.dropped && p.held, 'horn: his horn did not drop, or walking over it did not take it');
  ok(p.blew && p.cooks >= 2 && p.under >= 2, 'horn: blown by the pile, the cooks did not run under it (' + p.under + ' of ' + p.cooks + ')');
  ok(p.pile === 'down' && p.crushed >= 2, 'pile: one blow on the lashing did not drop it on them (' + p.pile + ', ' + p.crushed + ' crushed)');
  ok(p.gateShut && p.gateOpen && p.crewOut >= 2, 'gate: the horn did not open the barred gate and bring its crew out (' + JSON.stringify({ shut: p.gateShut, open: p.gateOpen, out: p.crewOut }) + ')');
  ok(p.exam && (p.winding || []).length === 3 && p.winding.every(v => v > 0), 'exam: climbing the first tower did not wind all three horns (' + JSON.stringify(p.winding) + ')');
  ok(p.blown1 && p.pack >= 2 && p.squad === 0, 'exam: a sounded exam horn did not wake its own pack, or woke the camp squad (pack ' + p.pack + ', squad hounds ' + p.squad + ')');
  ok(p.floorTake >= 0.4 && p.floorTake < 0.8, 'B15: a blow on the Chieftain outside an opening landed at ' + p.floorTake + 'x (want the 0.4 floor - not the old 0.05 chip, not whole)');
  ok(p.manned && p.upY < 18, 'tower: at his second wind he did not climb his war tower (' + p.upMode + ' at row ' + p.upY + ')');
  ok(p.upTake >= 0.4 && p.upTake < 0.9, 'tower: a blow on him up the tower landed at ' + p.upTake + 'x (want the 0.4-0.5 floor, told)');
  ok(p.cut === 2 && p.wreck && p.wreckTake >= 1.5, 'tower: both lashings cut did not bring him down open in the wreck (' + JSON.stringify({ cut: p.cut, wreck: p.wreck, x: p.wreckTake }) + ')');
  ok(!(p.errors || []).length, 'page errors ' + JSON.stringify(p.errors));
  console.log('stockade2 (page): ' + JSON.stringify(Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'errors'))));
}
if (fails.length) console.log(fails.map(f => '  FAIL ' + f).join('\n'));
assert.deepEqual(fails, []);
console.log('stockade2: the Watchtowers (horn, piles, gate, three-tower exam, crow\'s nest), the areas and the Chieftain\'s war tower all hold');
