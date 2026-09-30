// tools/theatre-pilot.mjs - THE MASKWRIGHT'S THEATRE walked end to end with real keys (claude/theatre). Not in the suite: a route pilot.
// A scripted hand, not the play bot: the bot cannot strike a lamp, a rope-lock or a winch, so this walks each leg with the keys a player would
// press - hold a direction, jump what blocks, strike a machine from beside it, wait for a batten, hold jump on the star trap - and cuts down
// what stands in its way with plain swings (facing a mummer freezes it; that is the level's own answer). It says where each leg ended.
//   node tools/theatre-pilot.mjs [heroes=knight,pyro] [god=0|1]
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,pyro').split(','), god = process.argv[3] === '1';
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const hero of heroes) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const fi = LEVELS.findIndex(l => l.id === 'theatre'); BK.load(fi); BK.start ? BK.start() : (BK.state = 'play'); BK.god = ${god};
      const P = () => BK.P, k = BK.keys, log = [], t0 = { f: 0 }; let frames = 0;
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      const tick = n => { for (let i = 0; i < (n || 1); i++) { BK.sim(1); frames++; } };
      const at = () => [Math.floor(P().x / TS), Math.floor((P().y - 1) / TS)];
      const deaths = () => BK.stats().deaths;
      /* cut down anything close in front (a plain swing a third of a second) */
      const fight = () => { const e = BK.enemies().filter(q => q.alive && !q.harmless && Math.abs(q.x - P().x) < 56 && Math.abs(q.y - P().y) < 14).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 30 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); const d = Math.sign(e.x - P().x); k[d > 0 ? 'right' : 'left'] = true; if (P().ground && j === 12) { k.jump = true; BK.press('jump'); } tick(1); }   /* close in, facing it (a mummer faced stands still) */
        clear(); P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); tick(8); clear(); tick(4);
        /* THE HAND CANNOT PARRY: a sworn sword that turns forty plain swings is lifted out and SAID (a player times his shield; this pilot proves the route, not the duel) */
        e.pilotSwings = (e.pilotSwings || 0) + 1; if (e.pilotSwings > 40) { e.alive = false; lifted.push(e.t + '@' + Math.round(e.x / TS)); }
        return true; };
      const lifted = [];
      /* walk to column tx (and row ty if given, loosely): hold the way, jump what blocks, fight what stands in it */
      const walk = (tx, o = {}) => { const goal = tx * TS + 8; let still = 0, lx = P().x, n = 0;
        while (Math.abs(P().x - goal) > (o.tol || 5) && n++ < (o.max || 1500)) {
          if (BK.state !== 'play') return false;
          if (TH() && TH().traps.some(q => P().x > (q.x0 - 1) * TS && P().x < (q.x1 + 2) * TS && P().y > 35 * TS && P().y < 41 * TS)) { outOfPit(); continue; }
          if (!o.noFight && fight()) continue;
          clear(); const d = goal > P().x ? 1 : -1;
          /* A STAGE TRAP ahead that is glowing or open: wait for it (a player reads the glow) */
          if (TH() && P().ground && TH().traps.some(tr => tr.state !== 'shut' && tr.x0 * TS - 20 < P().x + d * 40 && (tr.x1 + 1) * TS + 20 > P().x + d * 4 && Math.abs(P().y - tr.row * TS) < 8 && !(o.trap === tr.x0))) { tick(1); continue; }
          k[d > 0 ? 'right' : 'left'] = true;
          if (Math.abs(P().x - lx) < 0.3) still++; else still = 0; lx = P().x;
          if (still > 6 && P().ground) { k.jump = true; BK.press('jump'); still = 0; tick(14); continue; }
          tick(1); }
        clear(); tick(2); return Math.abs(P().x - goal) <= (o.tol || 5) + 2; };
      const hop = (d, n = 18) => { clear(); k[d > 0 ? 'right' : 'left'] = true; k.jump = true; BK.press('jump'); tick(n); clear(); tick(12); };
      const strike = d => { clear(); P().face = d; k[d > 0 ? 'right' : 'left'] = true; tick(1); k.left = k.right = false; BK.press('atk'); tick(10); clear(); tick(8); };
      const wait = n => { clear(); tick(n); };
      const leg = (name, ok) => { log.push({ name, ok: !!ok, at: at(), deaths: deaths(), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1) }); return ok; };
      const TH = () => BK.theatre(), FL = n => TH().flats.find(f => f.name.includes(n));
      const onRow = r => Math.abs(P().y - r * TS) < 10;   /* standing on (about) the surface of row r */
      /* OUT OF A TRAP ROOM: up its rope (a bite, and a climb, never a shortcut) */
      const outOfPit = () => { const tr = TH().traps.find(q => P().x > (q.x0 - 1) * TS && P().x < (q.x1 + 2) * TS && P().y > 35 * TS && P().y < 40 * TS); if (!tr) return;
        const rx = (tr.x0 + 1) * TS + 8; for (let j = 0; j < 400 && P().y > 34 * TS + 2; j++) { clear(); if (Math.abs(P().x - rx) > 3) k[rx > P().x ? 'right' : 'left'] = true; else k.up = true; if (j % 60 === 59) { k.jump = true; BK.press('jump'); } tick(1); } clear(); tick(10); };
      const { HOUSE } = await import('/src/maskwright-theatre.js'); const X = x => x + HOUSE;   /* backstage columns: the house (THEATRE2) is grown in at the front */
      const on = id => !!(P().onMover && P().onMover.line === id);
      // ---- 0. THE HOUSE: the grand stair, the usher on the dress circle, the chandelier, down the stalls, the pit, the drum, the apron ----
      leg('up the grand stair to the dress circle', walk(20) && P().y < 25 * TS);
      walk(30); walk(36, { tol: 3 }); strike(1); wait(220); leg('the chandelier struck down onto the stalls', BK.movers().some(m => m.chandelier && m.y > 30 * TS));
      walk(40); walk(46); leg('down the raked stalls', P().y >= 33 * TS);
      walk(47); hop(1, 20); walk(51); hop(1, 12); hop(1, 12); walk(54, { tol: 3, noFight: true }); leg('into the pit, onto the drum riser', P().y > 37 * TS);
      for (let i = 0; i < 8 && P().y > 34 * TS; i++) { clear(); k.jump = true; BK.press('jump'); k.right = true; for (let j = 0; j < 90 && P().y > 34 * TS - 2; j++) { k.right = P().x < 55 * TS || P().y < 34 * TS; tick(1); } clear(); tick(4); if (P().x < 52 * TS) { walk(51); hop(1, 12); hop(1, 12); walk(54, { tol: 3, noFight: true }); } }
      leg('the kettle drum throws you onto the apron', walk(62) && P().y <= 34 * TS);
      leg('through the pass door (checkpoint one)', walk(X(15)));
      // ---- 1. the store and the rope up; the dressing rooms: the chorus plugged, the quick-change door, the mirror room, the fitting ----
      leg('the costume store, past the one held in the light', walk(X(56)));
      walk(X(58), { tol: 3, noFight: true }); for (let j = 0; j < 300 && P().y > 24 * TS + 4; j++) { clear(); k.up = true; tick(1); } clear(); k.right = true; k.jump = true; BK.press('jump'); tick(16); clear(); tick(10);
      leg('up the rope into the dressing rooms', P().y <= 25 * TS);
      walk(X(49), { tol: 3 }); strike(-1); const cl = TH().spots.find(s => Math.abs(s.x - (X(48) * TS + 8)) < 4); if (cl && cl.i !== 1) strike(-1); leg('the lamp swung onto the wardrobe door', cl && cl.i === 1);
      walk(X(69), { tol: 3 }); strike(-1); for (let j = 0; j < 400 && FL('quick-change').at !== FL('quick-change').b; j++) { if (!fight()) wait(1); } leg('the quick-change door flown out', FL('quick-change').at === FL('quick-change').b);
      walk(X(88), { tol: 3 }); const fl = TH().spots.find(s => Math.abs(s.x - (X(90) * TS + 8)) < 4); strike(1); if (fl && fl.i !== 1) strike(1); leg('the carvers lamp pinned on one of the fitting', fl && fl.i === 1);
      walk(X(92)); wait(20); leg('down into the workshop', P().y > 26 * TS);
      leg('through the workshop', walk(X(110)));
      // ---- 2. the dock: the winch, the ground row, up the sill ----
      walk(X(111), { tol: 3 }); strike(1); wait(80); leg('the ground row slid to the sill', FL('ground row').at === FL('ground row').b);
      walk(X(120)); hop(1, 16); hop(1, 20); leg('up the sill into the fly tower', walk(X(129)));
      // ---- 3. the fly tower: batten A up, call B, ride B ----
      for (let i = 0; i < 4 && !on('A'); i++) { walk(X(131), { noFight: true }); hop(1, 12); walk(X(133), { tol: 4, noFight: true }); wait(20); }
      leg('on batten A', on('A'));
      strike(1); wait(100); leg('batten A flown out', onRow(25));
      walk(X(134), { tol: 3, noFight: true }); strike(1); wait(110); hop(1, 16); walk(X(138), { tol: 3, noFight: true }); leg('across onto batten B', onRow(25) && P().x > X(137) * TS);
      walk(X(137), { tol: 3, noFight: true }); strike(-1); wait(110); leg('batten B flown out to the fly floor', onRow(16));
      leg('on the fly floor (checkpoint two)', walk(X(142), { noFight: true }));
      // ---- 4. the bridge and the bag, the lighting bridge, the weight ----
      walk(X(143), { tol: 3 }); strike(1); wait(90); leg('the bridge is up', Math.abs(BK.movers().find(m => m.theatre && m.line === 'D' && m.role === 'batten').y - 16 * TS) < 2);
      leg('across the bridge', walk(X(156)) && onRow(16));
      leg('the lighting bridge, to the pin rail', walk(X(211)));
      hop(1, 14); walk(X(214), { tol: 3, noFight: true }); leg('on the sandbag', P().y < 16 * TS && P().x > X(212) * TS);
      strike(1); for (let j = 0; j < 400 && !onRow(34) && P().y < 34 * TS - 20; j++) { clear(); k.right = P().x < (X(213) + 0.4) * TS; k.left = P().x > (X(214) + 0.6) * TS; tick(1); } wait(20);
      if (P().y < 30 * TS) { walk(X(215), { noFight: true }); wait(60); }
      leg('the weight rode down to the wing', P().y > 32 * TS);
      // ---- 5. the performance, in acts: across to stage left; the way off is open when the scene flat is up (act one's cue, or act three) ----
      leg('the curtain is up', TH().show.on);
      walk(X(172)); outOfPit(); walk(X(172)); let n = 0; while (FL('scene change').at !== FL('scene change').b && n++ < 4000) { if (P().y > 35 * TS) { outOfPit(); walk(X(172)); } if (!fight()) wait(1); } leg('the scene-change flat up (act ' + TH().show.act + ')', FL('scene change').at === FL('scene change').b);
      for (let i = 0; i < 6 && P().y < 36 * TS; i++) { walk(X(161), { noFight: true, trap: X(160) }); for (let j = 0; j < 120 && P().y < 36 * TS; j++) { clear(); k.down = true; tick(1); } clear(); }
      wait(30); leg('down through the trap into the under-stage', P().y > 36 * TS);
      // ---- 6. the under-stage: the floor flat on its own cue, the sump, the star trap ----
      walk(X(179), { tol: 3 }); for (let j = 0; j < 900 && FL('floor flat').at === FL('floor flat').b; j++) { if (!fight()) wait(1); } for (let j = 0; j < 900 && FL('floor flat').at !== FL('floor flat').b; j++) { if (!fight()) wait(1); }   /* wait for it to go home, then go the moment it is out again */
      walk(X(183)); hop(1, 18); walk(X(190)); hop(1, 18); leg('across the sump on the floor flat', walk(X(196)) && P().y > 40 * TS);
      leg('to the star trap', walk(X(221))); hop(1, 14); hop(1, 14); walk(X(226), { tol: 3, noFight: true });
      for (let i = 0; i < 8 && P().y > 34 * TS; i++) { if (P().x < X(225) * TS || P().y > 40 * TS) { walk(X(221)); hop(1, 14); hop(1, 14); walk(X(226), { tol: 3, noFight: true }); }
        clear(); k.jump = true; BK.press('jump'); k.right = true; for (let j = 0; j < 90 && P().y > 34 * TS - 2; j++) { k.right = P().x < X(229) * TS || P().y < 34 * TS; tick(1); } clear(); tick(4); }
      walk(X(233)); leg('up through the star trap into the far wing', P().y <= 34 * TS && P().x > X(231) * TS);
      // ---- 7. the exam: the floor lamp onto the one under the box, the winch, the flat, batten G, the gallery, the door guard, the stage door ----
      walk(X(237), { tol: 3 }); const l1 = TH().spots.find(s => Math.abs(s.x - (X(236) * TS + 8)) < 4); if (l1 && l1.i !== 0) strike(-1); leg('the floor lamp off you and onto him', l1 && l1.i === 0);
      for (let i = 0; i < 5 && FL('wing flat').at !== FL('wing flat').b; i++) { walk(X(244), { tol: 3 }); if (FL('wing flat').to !== FL('wing flat').b) strike(1); for (let j = 0; j < 200 && FL('wing flat').at !== FL('wing flat').b; j++) { if (!fight()) wait(1); } }
      leg('the wing flat slid open', FL('wing flat').at === FL('wing flat').b);
      for (let i = 0; i < 4 && !on('G'); i++) { walk(X(250)); hop(1, 12); walk(X(252), { tol: 3, noFight: true }); wait(20); }
      walk(X(251), { tol: 2, noFight: true });   /* the batten's left end, beside its lock */
      strike(-1); wait(120); leg('batten G flown up to the loading gallery', P().y < 27 * TS);
      leg('along the loading gallery', walk(X(290)));
      for (let i = 0; i < 10 && BK.enemies().some(e => e.elite && e.alive); i++) { walk(X(286)); for (let j = 0; j < 120; j++) { if (!fight()) wait(1); } }
      leg('the door guard down (the stage door opens)', !BK.enemies().some(e => e.elite && e.alive));
      leg('the stage door (checkpoint four)', walk(X(297)));
      walk(X(303)); wait(30);
      return { hero: ${JSON.stringify(hero)}, lifted, log, state: BK.state, deaths: deaths(), s: +(frames / 60).toFixed(1) };
    })()`, 1200000);
    console.log('== ' + r.hero + (god ? ' (god)' : '') + ': ' + r.state + ', ' + r.deaths + ' deaths, ' + r.s + ' s' + (r.lifted.length ? '; lifted out (the hand cannot parry): ' + r.lifted.join(' ') : ''));
    for (const l of r.log) { console.log('  ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(48) + ' at ' + l.at.join(',') + '  hp ' + l.hp + '  deaths ' + l.deaths + '  ' + l.s + 's'); if (!l.ok) bad++; }
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
