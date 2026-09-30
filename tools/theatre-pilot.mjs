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
      const TH = () => BK.theatre();
      const onRow = r => Math.abs(P().y - r * TS) < 10;   /* standing on (about) the surface of row r */
      /* OUT OF A TRAP ROOM: up its rope (a bite, and a climb, never a shortcut) */
      const outOfPit = () => { const tr = TH().traps.find(q => P().x > (q.x0 - 1) * TS && P().x < (q.x1 + 2) * TS && P().y > 35 * TS && P().y < 40 * TS); if (!tr) return;
        const rx = (tr.x0 + 1) * TS + 8; for (let j = 0; j < 400 && P().y > 34 * TS + 2; j++) { clear(); if (Math.abs(P().x - rx) > 3) k[rx > P().x ? 'right' : 'left'] = true; else k.up = true; if (j % 60 === 59) { k.jump = true; BK.press('jump'); } tick(1); } clear(); tick(10); };
      // ---- 1. the stage door and the costume store: over the rail, down beside the lamp, strike it ----
      leg('the stage door', walk(20));
      leg('the rail walk', walk(46));
      walk(51); strike(1); leg('struck the costume lamp (it swings back)', TH().spots[0].i === 1);
      // ---- 2. the workshop, the dock: the winch, the ground row, up the sill ----
      leg('through the workshop', walk(110));
      walk(111, { tol: 3 }); strike(1); wait(80); leg('the ground row slid to the sill', TH().flats[0].at === TH().flats[0].b);
      walk(120); hop(1, 16); hop(1, 20); leg('up the sill into the fly tower', walk(129));
      // ---- 3. the fly tower: batten A up, call B, ride B ----
      const on = id => !!(P().onMover && P().onMover.line === id);
      for (let i = 0; i < 4 && !on('A'); i++) { walk(131, { noFight: true }); hop(1, 12); walk(133, { tol: 4, noFight: true }); wait(20); }
      leg('on batten A', on('A'));
      strike(1); wait(100); leg('batten A flown out', onRow(25));
      walk(134, { tol: 3, noFight: true }); strike(1); wait(110); hop(1, 16); walk(138, { tol: 3, noFight: true }); leg('across onto batten B', onRow(25) && P().x > 137 * TS);
      walk(137, { tol: 3, noFight: true }); strike(-1); wait(110); leg('batten B flown out to the fly floor', onRow(16));
      leg('on the fly floor (checkpoint one)', walk(142, { noFight: true }));
      // ---- 4. the bridge and the bag, the lighting bridge, the weight ----
      walk(143, { tol: 3 }); strike(1); wait(90); leg('the bridge is up', Math.abs(BK.movers().find(m => m.theatre && m.line === 'D' && m.role === 'batten').y - 16 * TS) < 2);
      leg('across the bridge', walk(156) && onRow(16));
      leg('the lighting bridge, to the pin rail', walk(211));
      hop(1, 14); walk(214, { tol: 3, noFight: true }); leg('on the sandbag', P().y < 16 * TS && P().x > 212 * TS);
      strike(1); for (let j = 0; j < 400 && !onRow(34) && P().y < 34 * TS - 20; j++) { clear(); k.right = P().x < 213.4 * TS; k.left = P().x > 214.6 * TS; tick(1); } wait(20);
      if (P().y < 30 * TS) { walk(215, { noFight: true }); wait(60); }
      leg('the weight rode down to the wing', P().y > 32 * TS);
      // ---- 5. the performance: across the stage to the trap at stage left ----
      leg('the curtain is up', TH().show.on);
      walk(172); outOfPit(); walk(172); let n = 0; while (TH().flats[1].at !== TH().flats[1].b && n++ < 900) { if (P().y > 35 * TS) { outOfPit(); walk(172); } wait(1); } leg('the scene-change flat opened', TH().flats[1].at === TH().flats[1].b);
      for (let i = 0; i < 6 && P().y < 36 * TS; i++) { walk(161, { noFight: true, trap: 160 }); for (let j = 0; j < 120 && P().y < 36 * TS; j++) { clear(); k.down = true; tick(1); } clear(); }
      wait(30); leg('down through the trap into the under-stage', P().y > 36 * TS);
      // ---- 6. the under-stage: the floor flat, across the sump, the star trap ----
      walk(173, { tol: 3 }); strike(-1); wait(90); leg('the floor flat slid over the sump', TH().flats[2].at === TH().flats[2].b);
      walk(183); hop(1, 18); walk(190); hop(1, 18); leg('across the sump', walk(196) && P().y > 40 * TS);
      leg('to the star trap', walk(221)); hop(1, 14); hop(1, 14); walk(226, { tol: 3, noFight: true });
      for (let i = 0; i < 8 && P().y > 34 * TS; i++) { if (P().x < 225 * TS || P().y > 40 * TS) { walk(221); hop(1, 14); hop(1, 14); walk(226, { tol: 3, noFight: true }); }
        clear(); k.jump = true; BK.press('jump'); k.right = true; for (let j = 0; j < 90 && P().y > 34 * TS - 2; j++) { k.right = P().x < 229 * TS || P().y < 34 * TS; tick(1); } clear(); tick(4); }
      walk(233); leg('up through the star trap into the far wing', P().y <= 34 * TS && P().x > 231 * TS);
      // ---- 7. the wings: the flat door, batten G, the gallery, the stage door ----
      for (let i = 0; i < 5 && TH().flats[4].at !== TH().flats[4].b; i++) { walk(245, { tol: 3 }); if (TH().flats[4].to !== TH().flats[4].b) strike(1); for (let j = 0; j < 200 && TH().flats[4].at !== TH().flats[4].b; j++) { if (!fight()) wait(1); } }
      leg('the wing flat slid to B (' + TH().flats[4].at + ')', TH().flats[4].at === TH().flats[4].b);
      for (let i = 0; i < 4 && !on('G'); i++) { walk(252); hop(1, 12); walk(254, { tol: 3, noFight: true }); wait(20); }
      strike(-1); wait(120); leg('batten G flown up to the loading gallery', P().y < 27 * TS);
      leg('along the loading gallery', walk(290));
      leg('the stage door (checkpoint three)', walk(297));
      walk(303); wait(30);
      return { hero: ${JSON.stringify(hero)}, lifted, log, state: BK.state, deaths: deaths(), s: +(frames / 60).toFixed(1) };
    })()`, 1200000);
    console.log('== ' + r.hero + (god ? ' (god)' : '') + ': ' + r.state + ', ' + r.deaths + ' deaths, ' + r.s + ' s' + (r.lifted.length ? '; lifted out (the hand cannot parry): ' + r.lifted.join(' ') : ''));
    for (const l of r.log) { console.log('  ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(48) + ' at ' + l.at.join(',') + '  hp ' + l.hp + '  deaths ' + l.deaths + '  ' + l.s + 's'); if (!l.ok) bad++; }
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
