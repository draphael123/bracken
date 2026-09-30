// tools/canal-pilot.mjs - THE FOG CANAL walked end to end with real keys (claude/canal). Not in the suite: a route pilot.
// A scripted hand, not the play bot (the bot cannot strike a paddle, a capstan, a horn or a tiller): it walks each leg with the keys a player
// would press - hold a way, jump what blocks, board the barge, duck on her deck, strike a machine from beside it, wait for the water, drop onto
// her as she passes under - and cuts down what stands in its way with plain swings. A grindylow's grab is mashed off (three presses). It says
// where each leg ended, and the run ends at the lock door (JENNY GREENTEETH's room, claude/lockkeeper).
//   node tools/canal-pilot.mjs [heroes=knight,pyro] [god=0|1]
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,pyro').split(','), god = process.argv[3] === '1', from = +(process.argv[4] || 0), to = +(process.argv[5] || 7);   /* from: start at section n (1 quay .. 7 basin), set up as the run before it would leave it - for fixing one leg at a time */
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const hero of heroes) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const fi = LEVELS.findIndex(l => l.id === 'canal'); BK.load(fi); BK.start ? BK.start() : (BK.state = 'play'); BK.god = ${god}; const FROM = ${from} || 1, TO = ${to}, TRACE = ${+process.env.TRACE || 0};
      const P = () => BK.P, k = BK.keys, log = [], C = () => BK.canal(); let frames = 0; const lifted = [];
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      /* A GRAB IS MASHED OFF (three presses), and a hero knocked into the canal is back on the bank: both are the level working, not the pilot failing */
      const TR = [], tick = n => { for (let i = 0; i < (n || 1); i++) { if (TRACE && frames % (+TRACE || 30) === 0) TR.push([frames, Math.round(P().x), Math.round(P().y), P().onMover ? 1 : 0, Math.round(C().barge.x), C().barge.holdWhy, P().caged > 0 ? 1 : 0, C().bridges.map(b=>b.k.toFixed(1)).join(''), P().atk.toFixed(2), Object.keys(k).filter(q => k[q]).join('+')]); if (P().caged > 0 && BK.enemies().some(e => e.t === 'grindylow' && e.mode === 'grab')) BK.press(i % 2 ? 'jump' : 'atk'); BK.sim(1); frames++; } };
      const at = () => [Math.floor(P().x / TS), Math.floor((P().y - 1) / TS)];
      const deaths = () => BK.stats().deaths;
      const onBarge = () => !!(P().onMover && P().onMover.canal);
      const B = () => C().barge;
      const fight = (o = {}) => { const e = BK.enemies().filter(q => q.alive && !q.harmless && q.t !== 'grindylow' && Math.abs(q.x - P().x) < 48 && Math.abs(q.y - P().y) < 16).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 24 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        e.pilotSwings = (e.pilotSwings || 0) + 1; if (e.pilotSwings > 40) { e.alive = false; lifted.push(e.t + '@' + Math.round(e.x / TS)); }
        return true; };
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 5) && n++ < (o.max || 1500)) {
          if (BK.state !== 'play') return false;
          if (!o.noFight && fight()) continue;
          clear(); const d = goal > P().x ? 1 : -1; k[d > 0 ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 6 && P().ground) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 5) + 2; };
      const hop = (d, n = 18) => { clear(); if (d) k[d > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump'); tick(n); clear(); tick(10); };
      const strike = d => { clear(); for (let i = 0; i < 90 && !P().ground; i++) tick(1); P().face = d; k[d > 0 ? 'right' : 'left'] = true; tick(1); k.left = k.right = false; BK.press('atk'); tick(10); clear(); tick(8); };
      const wait = (n, duck) => { clear(); for (let i = 0; i < n; i++) { k.down = !!duck && onBarge(); tick(1); } clear(); };
      /* ride her, ducked, until test() (or n frames) */
      const ride = (test, n = 3000, o = {}) => { let i = 0; for (; i < n && !test(); i++) { clear(); if (!o.noFight && !onBarge() && fight()) continue; k.down = onBarge() && !o.stand; if (onBarge()) swat(); tick(1);
          if (onBarge() && o.stay) { const b = B(); if (P().x < b.x + 20) { k.down = false; k.right = true; } else if (P().x > b.x + b.w - 20) { k.down = false; k.left = true; } } } clear(); return test(); };
      /* drop onto her from a board over her (down + jump), once she is under */
      const dropOn = () => { for (let t = 0; t < 1800 && !onBarge(); t++) { const b = B(); clear(); if (P().x > b.x + 12 && P().x < b.x + b.w - 12 && P().y < b.y) { k.down = true; k.jump = true; BK.press('jump'); tick(2); k.jump = false; tick(20); } else tick(1); } clear(); tick(4); return onBarge(); };
      /* on her deck: strike what comes within reach at her level (a wisp, a grindylow up on the edge), without leaving her */
      const swat = () => { const e = BK.enemies().find(q => q.alive && (q.t === 'willowisp' || (q.t === 'grindylow' && q.mode === 'rippleTell')) && Math.abs(q.x - P().x) < 28 && Math.abs(q.y - P().y) < 30); if (e && P().atk < 0) { P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); } };
      const leg = (name, ok) => { log.push({ name, ok: !!ok, at: at(), deaths: deaths(), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1) }); return ok; };
      const reach = id => C().reaches.find(q => q.id === id), full = id => Math.abs(reach(id).y - (reach(id).hi * TS + 4)) < 1;
      const gate = id => C().gates.find(g => g.id === id);
      const go = async () => {
      if (FROM <= 1 && TO >= 1) { if (FROM === 1) {  }
      // ---- 1. THE WAYMEET QUAY: down through the warehouse, onto the barge ----
      leg('down through the warehouse', walk(28));
      leg('out onto the quay', walk(34));
      walk(37, { noFight: true }); tick(20); if (!onBarge()) { walk(38, { noFight: true }); tick(20); }
      leg('aboard the barge', onBarge());
      }
      if (FROM <= 2 && TO >= 2) { if (FROM === 2) { BK.tp(36, 37); tick(20); }
      // ---- 2. THE POUND AND THE FIRST LOCK ----
      ride(() => B().holdWhy === 'gate' && B().x > 70 * TS, 3000, { stay: true });
      leg('the barge held at the first lock\\'s upper gate', B().holdWhy === 'gate');
      walk(80, { tol: 3, noFight: true }); strike(1); ride(() => full('L1'), 600, { stay: true });
      leg('the paddle struck: the first lock full', full('L1') && P().y < 34 * TS);
      ride(() => B().holdWhy === 'bridge', 1200, { stay: true });
      leg('under the mill, held by the mill bridge', B().holdWhy === 'bridge');
      }
      if (FROM <= 3 && TO >= 3) { if (FROM === 3) { const r1=reach('L1'); r1.y=r1.to=r1.hi*TS+4; B().x=100*TS; tick(60); BK.tp(104,31); tick(20); }
      // ---- 3. THE MILL: up through its floors ----
      walk(108, { tol: 4, noFight: true }); hop(0, 20); tick(20); leg('up through the wharf floor into the mill', P().y <= 30 * TS + 2 && !onBarge());
      const up = (x, row) => { for (let i = 0; i < 4 && P().y > row * TS + 2; i++) { walk(x, { tol: 3 }); hop(0, 22); tick(10); } };
      up(88, 27); up(92, 24); up(91, 21); up(92, 18);
      leg('up the mill\\'s floors to the top (checkpoint one)', walk(99) && P().y < 19 * TS);
      walk(106); walk(112); walk(110); tick(40); walk(116); tick(10);
      leg('out of the miller\\'s door, down to the mill bridge', P().x > 111 * TS);
      walk(117, { tol: 3 }); if (C().bridges[0].across) strike(1); wait(80);
      leg('the mill bridge swung', !C().bridges[0].across);
      walk(121); leg('onto the barge as she passes under the far bank', dropOn());
      }
      if (FROM <= 4 && TO >= 4) { if (FROM === 4) { const r1=reach('L1'); r1.y=r1.to=r1.hi*TS+4; C().bridges[0].across=false; C().bridges[0].k=1; B().x=118*TS; tick(60); BK.tp(121,31); tick(20); }
      // ---- 4. THE FOG BANK: the weed reach, off at the loading step, over the roofs ----
      ride(() => B().x + B().w / 2 > 126 * TS, 900, { stay: true });
      clear(); hop(1, 16); walk(129, { noFight: true }); for (let i = 0; i < 160 && P().y > 21 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); hop(1, 16);
      leg('off at the loading step, up the ladder onto the roofs', P().y <= 22 * TS && P().x > 129 * TS);
      walk(136); hop(1, 20); walk(141); walk(144); hop(1, 20); walk(147); tick(20);
      leg('over the roofs, past the light-well and the belfry', P().x > 146 * TS);
      walk(150, { tol: 3 }); tick(30); if (C().bridges[1].across) strike(1); wait(90);
      leg('the bridge garrison swung into the canal', !C().bridges[1].across);
      leg('onto her at the arch\\'s end', dropOn());
      ride(() => B().holdWhy === 'fog', 900, { stay: true });
      leg('held at the fog wall', B().holdWhy === 'fog');
      clear(); hop(1, 18); walk(162, { tol: 3, noFight: true }); strike(1); tick(6); const blown = C().fogs.find(f => f.id === 'F2').clear > 0;
      walk(161, { noFight: true }); dropOn(); leg('the horn blown, back aboard', blown && onBarge());
      ride(() => B().x > 181 * TS, 900, { stay: true });
      if (B().x < 181 * TS) { clear(); hop(0, 18); walk(172, { tol: 3 }); strike(1); walk(172); dropOn(); ride(() => B().x > 181 * TS, 900, { stay: true }); }
      leg('through the fog wall', B().x > 181 * TS);
      }
      if (FROM <= 5 && TO >= 5) { if (FROM === 5) { const r1=reach('L1'); r1.y=r1.to=r1.hi*TS+4; for (const b of C().bridges.slice(0,2)) { b.across=false; b.k=1; } B().x=183*TS; tick(60); BK.tp(187,31); tick(20); }
      // ---- 5. THE FLIGHT ----
      ride(() => B().holdWhy === 'gate' && B().x > 198 * TS, 1200, { stay: true });
      walk(208, { tol: 3, noFight: true }); strike(1); ride(() => full('L2'), 600, { stay: true });
      leg('the first of the flight full', full('L2'));
      ride(() => B().holdWhy === 'gate' && B().x > 209 * TS, 900, { stay: true });
      walk(214, { tol: 2, noFight: true }); for (let i = 0; i < 400 && P().y > 16 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); hop(1, 12);
      walk(216, { tol: 3 }); if (Math.abs(reach('L3').to - (reach('L3').hi * TS + 4)) > 1) strike(1); wait(200);
      leg('up the balance beam, its paddle struck: the second full', full('L3'));
      walk(217, { noFight: true }); dropOn(); ride(() => B().holdWhy && B().x > 220 * TS, 900, { stay: true });
      walk(230, { tol: 2, noFight: true }); for (let i = 0; i < 400 && P().y > 17 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); hop(1, 14);
      hop(1, 18); walk(238, { tol: 3 });
      leg('up the summit gate and over the summit bridge', P().x > 237 * TS && P().y < 16 * TS);
      strike(1); ride(() => full('L4'), 400, { stay: true }); wait(40);
      leg('the last paddle: the flight full to the summit', full('L4'));
      strike(-1); wait(60); leg('the summit bridge swung behind you', !C().bridges[2].across);
      walk(242); leg('the summit (checkpoint two)', P().x > 241 * TS); dropOn();
      }
      if (FROM <= 6 && TO >= 6) { if (FROM === 6) { for (const id of ['L1','L2','L3','L4']) { const q=reach(id); q.y=q.to=q.hi*TS+4; } for (const b of C().bridges.slice(0,3)) { b.across=false; b.k=1; } B().x=235*TS; tick(60); BK.tp(240,16); tick(20); }
      // ---- 6. THE WEIR ----
      ride(() => B().mode === 'loose', 900, { stay: true });
      leg('the summit gate bursts', B().mode === 'loose');
      clear(); for (let t = 0; t < 200 && B().helm !== 'cut'; t++) { const b = B(), mid = b.x + b.w / 2; if (Math.abs(P().x - (mid - 12)) > 4) { clear(); k[P().x < mid - 12 ? 'right' : 'left'] = true; tick(1); continue; } clear(); P().face = 1; BK.press('atk'); tick(10); }
      leg('the tiller struck: steer for the mill cut', B().helm === 'cut');
      ride(() => B().mode !== 'loose', 1500, { stay: true, noFight: true });
      leg('down the race into the basin', B().mode === 'float' && B().x > 320 * TS);
      }
      if (FROM <= 7 && TO >= 7) { if (FROM === 7) { for (const b of C().bridges.slice(0,3)) { b.across=false; b.k=1; } B().x=326*TS; tick(30); BK.tp(329,42); tick(20); }
      // ---- 7. THE BASIN (the exam) ----
      ride(() => B().holdWhy === 'fog', 300, { stay: true });
      clear(); hop(1, 18); walk(335, { noFight: true }); walk(344);
      leg('over the bridge to the island', P().x > 342 * TS && P().y <= 41 * TS);
      for (let i = 0; i < 60 && BK.enemies().some(e => e.alive && e.elite); i++) { const el = BK.enemies().find(e => e.alive && e.elite); walk(Math.round(el.x / TS) - 1, { noFight: true }); if (!fight()) tick(10); }
      leg('the deck foreman down (the lock door opens)', !BK.enemies().some(e => e.alive && e.elite));
      walk(344, { tol: 3 }); if (!(C().horns.find(h => h.x > 342 * TS).cd > 0)) strike(1); walk(343, { tol: 3 }); if (C().bridges[3].across) strike(-1);
      leg('the horn blown and the bridge swung', !C().bridges[3].across && C().fogs.find(f => f.id === 'F5').clear > 0);
      walk(346, { noFight: true }); leg('onto her as she passes under the island', dropOn());
      ride(() => B().holdWhy === 'end' || B().x > 363 * TS, 900, { stay: true });
      walk(368, { tol: 3, noFight: true }); strike(1); ride(() => full('L5'), 400, { stay: true }); leg('the basin lock full: her deck up to the theatre door', full('L5'));
      walk(369, { tol: 3, noFight: true }); hop(1, 18); walk(371);
      leg('up onto the lock gate: the lock door (checkpoint three)', P().x > 370 * TS && P().y < 42 * TS);
      walk(375); leg('the checkpoint at her west door', BK.L.ents.some(e => e.t === 'check' && e.x === 375) && P().x > 374 * TS); walk(378); tick(30);
      }
      };
      await go();
      return { TR, hero: ${JSON.stringify(hero)}, lifted, log, state: BK.state, deaths: deaths(), s: +(frames / 60).toFixed(1) };
    })()`, 1800000);
    console.log('== ' + r.hero + (god ? ' (god)' : '') + ': ' + r.state + ', ' + r.deaths + ' deaths, ' + r.s + ' s' + (r.lifted.length ? '; lifted out (the hand cannot parry): ' + r.lifted.join(' ') : ''));
    if (r.TR.length) for (const t of r.TR) console.log('  t ' + JSON.stringify(t));
    for (const l of r.log) { console.log('  ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(56) + ' at ' + l.at.join(',') + '  hp ' + l.hp + '  deaths ' + l.deaths + '  ' + l.s + 's'); if (!l.ok) bad++; }
    if (r.state !== 'win' && r.state !== 'clear' && r.state !== 'levelclear') console.log('  (the run ended in state ' + r.state + ')');
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
