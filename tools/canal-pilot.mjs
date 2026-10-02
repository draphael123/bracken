// tools/canal-pilot.mjs - THE FOG CANAL walked end to end with real keys (claude/canal; reworked by claude/canalfix for the fixed level). Not in the suite: a route pilot.
// A scripted hand, not the play bot (the bot cannot strike a paddle, a capstan, a horn or a tiller): it walks each leg with the keys a player
// would press - hold a way, jump what blocks, board the barge, duck on her deck, strike a machine from beside it, wait for the water, drop onto
// her as she passes under - and cuts down what stands in its way with plain swings (on her deck too: the boarders). A grindylow's grab is
// mashed off (three presses). It says where each leg ended, and the run ends at the lock door (JENNY GREENTEETH's room, claude/lockkeeper).
// (claude/canalfix) It also KEEPS THE TALLY the review asked for: damage taken by leg, the lowest health, and how many times health DIPPED under
// 40% (a dip: from 40% or more to under it) - the level-1 no-ability target is two dips or a death. Run it on a fresh save (level 1, no
// talents, no skills) with god=0.
//   node tools/canal-pilot.mjs [heroes=knight,pyro] [god=0|1]
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,pyro').split(','), god = process.argv[3] === '1', from = +(process.argv[4] || 1);   /* from: 2 starts at the arch's checkpoint, 3 at the summit's (the game's own respawn puts her at its mooring) - for fixing one stretch at a time */
const pg = await openPage({ audio: false, fonts: false });
let bad = 0;
try {
  for (const hero of heroes) {
    const r = await pg.evalp(`(async()=>{
      const { LEVELS } = await import('/src/level.js'); const TS = 16;
      BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
      const prog = BK.PROG, bare = !(prog.talents && Object.keys(prog.talents).length) && !(prog.skills && Object.keys(prog.skills).length);
      const fi = LEVELS.findIndex(l => l.id === 'canal'); BK.load(fi); BK.start ? BK.start() : (BK.state = 'play'); BK.god = ${god};
      const P = () => BK.P, k = BK.keys, log = [], C = () => BK.canal(); let frames = 0, ARMED = null; const lifted = [];
      const T = { taken: 0, minHp: 999, dips: 0, legTaken: 0, was: null, maxHp: 0 };
      const clear = () => { k.left = k.right = k.jump = k.down = k.up = k.atk = k.block = false; };
      /* THE TALLY: health lost frame to frame (a respawn's refill is not a gain we count), the lowest point, the dips under 40% */
      const tally = () => { const h = P().hp, m = P().maxHp || 100; T.maxHp = Math.max(T.maxHp, m); if (T.was !== null && h < T.was && !P().dead) { T.taken += T.was - h; T.legTaken += T.was - h; }
        if (T.was !== null && h < T.was && P().dead) { T.taken += T.was; T.legTaken += T.was; }
        if (!P().dead) { if (T.was !== null && T.was >= 0.4 * m && h < 0.4 * m) T.dips++; T.minHp = Math.min(T.minHp, h); } T.was = P().dead ? null : h; };
      /* A GRAB IS MASHED OFF (three presses), and a hero knocked into the canal is back on the bank: both are the level working, not the pilot failing */
      const TRACE = ${+process.env.TRACE || 0}, TR = [];   /* TRACE=n: every n frames, where he is, his health, her state and what is near him */
      const tick = n => { for (let i = 0; i < (n || 1); i++) { if (ARMED !== null && deaths() > ARMED) throw 'DIED'; if (TRACE && frames % TRACE === 0) TR.push([frames, +(P().x / TS).toFixed(1), +(P().y / TS).toFixed(1), Math.round(P().hp), onBarge() ? 1 : 0, +((B().x + B().w) / TS).toFixed(1), B().holdWhy, BK.enemies().filter(e => e.alive && Math.abs(e.x - P().x) < 100 && Math.abs(e.y - P().y) < 120).map(e => e.t.slice(0, 3) + (e.mode || '') + Math.round(e.x / TS)).join(' '), Object.keys(k).filter(q => k[q]).join('+')]); if (P().caged > 0 && BK.enemies().some(e => e.t === 'grindylow' && e.mode === 'grab')) BK.press(i % 2 ? 'jump' : 'atk'); BK.sim(1); frames++; tally(); } };
      const at = () => [Math.floor(P().x / TS), Math.floor((P().y - 1) / TS)];
      const deaths = () => BK.stats().deaths;
      const onBarge = () => !!(P().onMover && P().onMover.canal);
      const B = () => C().barge;
      const fight = (o = {}) => { const e = BK.enemies().filter(q => q.alive && !q.harmless && !q.waiting && !(q.t === 'grindylow' && !q.aboard && q.mode !== 'stranded') && Math.abs(q.x - P().x) < (o.r || 48) && Math.abs(q.y - P().y) < (q.t === 'willowisp' ? 34 : 16)).sort((a, b) => Math.abs(a.x - P().x) - Math.abs(b.x - P().x))[0];
        if (!e) return false; clear();
        for (let j = 0; j < 24 && Math.abs(e.x - P().x) > 14 && e.alive; j++) { clear(); if (onBarge() && (P().x < B().x + 10 || P().x > B().x + B().w - 10)) break; k[e.x > P().x ? 'right' : 'left'] = true; tick(1); }
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
      /* ride her, ducked, until test() (or n frames). o.stay: keep on her deck; o.at: where on her deck to stand (px from her stern); o.weir: jump the booms */
      const ride = (test, n = 3000, o = {}) => { let i = 0; for (; i < n && !test(); i++) { clear();
          if (!onBarge() && !o.noFight && fight()) continue;
          if (onBarge() && fight({ r: 40 })) continue;   /* a boarder or a grindylow come aboard: fight it on her deck */
          if (!onBarge() && o.weir && P().ground) { k.right = true; tick(1); continue; }   /* thrown off her into the race or the cut: wade on, the flood behind (a hero who stops is caught) */
          if (!onBarge() && o.weir && !P().ground && o.at !== undefined) { const w = B().x + o.at; k.right = P().x < w - 2; k.left = P().x > w + 2; tick(1); continue; }   /* in the air over her (a boom jumped): keep with her */
          if (onBarge() && o.weir) { const bm = (C().D.weir.booms || []).find(q => q.x - P().x > 2 && q.x - P().x < 22); if (bm && P().ground) { BK.press('jump'); k.jump = true; tick(1); continue; } }
          const b = B(), want = o.at !== undefined ? b.x + o.at : null;
          if (onBarge() && want !== null && Math.abs(P().x - want) > 6) { k[P().x < want ? 'right' : 'left'] = true; tick(1); continue; }
          k.down = onBarge() && !o.stand; if (onBarge()) swat(); tick(1);
          if (onBarge() && o.stay) { if (P().x < b.x + 20) { k.down = false; k.right = true; } else if (P().x > b.x + b.w - 20) { k.down = false; k.left = true; } } } clear(); return test(); };
      /* drop onto her from a board over her (down + jump), once she is under */
      const dropOn = () => { for (let t = 0; t < 1800 && !onBarge(); t++) { const b = B(); clear(); if (P().x > b.x + 12 && P().x < b.x + b.w - 12 && P().y < b.y) { k.down = true; k.jump = true; BK.press('jump'); tick(2); k.jump = false; tick(20); } else tick(1); } clear(); tick(4); return onBarge(); };
      /* on her deck: strike what comes within reach at her level (a wisp, a grindylow up on the edge), without leaving her */
      const swat = () => { const e = BK.enemies().find(q => q.alive && (q.t === 'willowisp' || (q.t === 'grindylow' && (q.mode === 'rippleTell' || q.mode === 'boardTell'))) && Math.abs(q.x - P().x) < 28 && Math.abs(q.y - P().y) < 30); if (e && P().atk < 0) { P().face = Math.sign(e.x - P().x) || P().face; BK.press('atk'); } };
      const leg = (name, ok) => { log.push({ name, ok: !!ok, at: at(), deaths: deaths(), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1), took: Math.round(T.legTaken) }); T.legTaken = 0; return ok; };
      const reach = id => C().reaches.find(q => q.id === id), full = id => Math.abs(reach(id).y - (reach(id).hi * TS + 4)) < 1, low = id => Math.abs(reach(id).y - (reach(id).lo * TS + 4)) < 1;
      /* THE THREE STRETCHES, one a checkpoint: a death sends the hand back to the stretch's start (where the game woke it), and it goes again */
      const seg = (name, fn) => { for (let t = 0; t < 6; t++) { ARMED = deaths(); try { fn(); ARMED = null; return true; } catch (err) { if (err !== 'DIED') throw err; ARMED = null;
          log.push({ name: name + ': died, from its checkpoint again', ok: true, died: true, at: at(), deaths: deaths(), hp: Math.round(P().hp), s: +(frames / 60).toFixed(1), took: Math.round(T.legTaken) }); T.legTaken = 0;
          clear(); for (let i = 0; i < 900 && (BK.state !== 'play' || P().dead); i++) { BK.sim(1); frames++; } for (let i = 0; i < 40; i++) { BK.sim(1); frames++; } T.was = null; } } ARMED = null; return false; };
      let ok1 = false, ok2 = false; const FROM = ${from};
      const wakeAt = (cx, cy, wx, wy) => { BK.tp(cx, cy - 1); for (let i = 0; i < 60; i++) { BK.sim(1); } P().hp = 1; BK.tp(wx, wy); for (let i = 0; i < 400 && !P().dead; i++) BK.sim(1); for (let i = 0; i < 900 && (BK.state !== 'play' || P().dead); i++) BK.sim(1); for (let i = 0; i < 40; i++) BK.sim(1); T.was = null; T.taken = 0; T.minHp = 999; T.dips = 0; };
      if (FROM === 2) { wakeAt(149, 29, 152, 33); ok1 = true; } else if (FROM === 3) { wakeAt(242, 15, 240, 19); ok1 = ok2 = true; } else
      ok1 = seg('to the arch\\'s end (checkpoint one)', () => {
      // ---- 1. THE WAYMEET QUAY: down through the warehouse, onto the barge ----
      leg('down through the warehouse', walk(28));
      leg('out onto the quay', walk(34));
      walk(37, { noFight: true }); tick(20); if (!onBarge()) { walk(38, { noFight: true }); tick(20); }
      leg('aboard the barge', onBarge());
      // ---- 2. THE POUND (her helm as she found it: the towpath side) AND THE FIRST LOCK ----
      ride(() => B().holdWhy === 'gate' && B().x > 70 * TS, 3000, { stay: true });
      leg('the barge held at the first lock\\'s upper gate', B().holdWhy === 'gate');
      walk(80, { tol: 3, noFight: true }); strike(1); ride(() => full('L1'), 600, { stay: true });
      leg('the paddle struck: the first lock full', full('L1') && P().y < 34 * TS);
      ride(() => B().holdWhy === 'bridge', 1200, { stay: true });
      ride(() => false, 240, { stay: true });   /* held under the wharf: the hookers over her, the grindylow that comes aboard */
      leg('under the mill wharf, held by the mill bridge', B().holdWhy === 'bridge');
      // ---- 3. THE MILL: up through its floors ----
      walk(108, { tol: 4, noFight: true }); hop(0, 20); tick(20); leg('up through the wharf floor into the mill', P().y <= 30 * TS + 2 && !onBarge());
      const up = (x, row) => { for (let i = 0; i < 4 && P().y > row * TS + 2; i++) { walk(x, { tol: 3 }); hop(0, 22); tick(10); } };
      up(88, 27); up(92, 24); up(91, 21); up(92, 18);
      leg('up the mill\\'s floors to the top', walk(99) && P().y < 19 * TS);
      walk(106); walk(112); walk(110); tick(40); walk(116); tick(10);
      leg('out of the miller\\'s door, down to the mill bridge', P().x > 111 * TS);
      walk(117, { tol: 3 }); if (C().bridges[0].across) strike(1); wait(80);
      leg('the mill bridge swung (under the capstan archer\\'s bow)', !C().bridges[0].across);
      walk(121); leg('onto the barge as she passes under the far bank', dropOn());
      // ---- 4. THE FOG BANK: the weed reach, off at the loading step, over the roofs ----
      ride(() => B().x + B().w / 2 > 126 * TS, 900, { stay: true });
      clear(); hop(1, 16); walk(129, { noFight: true }); for (let i = 0; i < 160 && P().y > 21 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); hop(1, 16);
      leg('off at the loading step, up the ladder onto the roofs', P().y <= 22 * TS && P().x > 129 * TS);
      walk(136); hop(1, 20); walk(141); walk(144); hop(1, 20); walk(147); tick(20);
      leg('over the roofs, past the light-well and the belfry', P().x > 146 * TS);
      walk(149, { noFight: true }); for (let i = 0; i < 120 && !P().ground; i++) tick(1); walk(149, { tol: 2, noFight: true }); tick(10);
      leg('down at the arch\\'s end (checkpoint one)', P().x > 148 * TS && P().y < 31 * TS);
      });
      if (ok1 && FROM < 3) ok2 = seg('to the summit (checkpoint two)', () => {
      // ---- THE BRIDGE GARRISON: the lamplighter first, the lantern out, across between the bows, the capstan on the far bank ----
      for (let i = 0; i < 30 && BK.enemies().some(e => e.alive && e.lamplighter && e.x < 156 * TS); i++) { const ll = BK.enemies().find(e => e.alive && e.lamplighter && e.x < 156 * TS); walk(Math.round(ll.x / TS) - 1, { noFight: true }); if (!fight()) tick(10); }
      leg('the garrison\\'s lamplighter cut down', !BK.enemies().some(e => e.alive && e.lamplighter && e.x < 156 * TS));
      walk(151, { tol: 3, noFight: true }); const post = C().posts.find(p => Math.abs(p.x - (152 * TS + 8)) < 4); if (post && post.lit) strike(1);
      leg('the bridge lantern put out', post && !post.lit);
      walk(161, { tol: 3, noFight: true }); strike(-1); wait(80);
      leg('across between the bows, the capstan swung from the far bank', !C().bridges[1].across);
      leg('onto her as she passes under the far bank', dropOn());
      // ---- THE FOG WALL: held at its edge, the boarding gang; the bank horn; the pier horn ----
      ride(() => B().holdWhy === 'fog', 900, { stay: true });
      ride(() => !BK.enemies().some(e => e.alive && e.boarder), 900, { stay: true });
      leg('held at the fog wall: the boarding gang fought off her deck', B().holdWhy === 'fog' && !BK.enemies().some(e => e.alive && e.boarder));
      clear(); hop(-1, 18); walk(162, { tol: 3, noFight: true }); strike(1); tick(6); const blown = C().fogs.find(f => f.id === 'F2').clear > 0;
      walk(161, { noFight: true }); dropOn(); leg('the bank horn blown, back aboard', blown && onBarge());
      ride(() => B().x + B().w > 191 * TS || (B().holdWhy === 'fog' && B().x > 170 * TS), 900, { stay: true });
      if (B().x + B().w <= 191 * TS) { ride(() => !BK.enemies().some(e => e.alive && e.aboard), 600, { stay: true }); clear(); hop(0, 20); walk(182, { tol: 3 }); strike(1); walk(180, { noFight: true }); dropOn(); ride(() => B().x + B().w > 191 * TS, 900, { stay: true }); }
      leg('through the fog wall (the pier horn)', B().x + B().w > 191 * TS);
      // ---- 5. THE FLIGHT: the first chamber set against her ----
      ride(() => B().holdWhy === 'gate' && B().x > 185 * TS, 1200, { stay: true });
      walk(197, { tol: 3, noFight: true }); strike(1); ride(() => low('L2'), 600, { stay: true });
      leg('the first chamber drained (it stood full against her)', low('L2'));
      ride(() => B().holdWhy === 'gate' && B().x > 198 * TS, 1200, { stay: true });
      walk(208, { tol: 3, noFight: true }); strike(1); ride(() => full('L2'), 600, { stay: true });
      leg('the first of the flight full', full('L2'));
      ride(() => B().holdWhy === 'gate' && B().x > 209 * TS, 900, { stay: true });
      walk(214, { tol: 2, noFight: true }); for (let i = 0; i < 400 && P().y > 16 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); hop(1, 12);
      walk(216, { tol: 3 }); if (Math.abs(reach('L3').to - (reach('L3').hi * TS + 4)) > 1) strike(1); wait(200);
      leg('up the balance beam, its paddle struck: the second full', full('L3'));
      walk(217, { noFight: true }); dropOn(); ride(() => B().holdWhy && B().x > 220 * TS, 900, { stay: true });
      walk(230, { tol: 2, noFight: true }); for (let i = 0; i < 400 && P().y > 17 * TS + 2; i++) { clear(); k.up = true; tick(1); } clear(); k.right = true; tick(12); clear(); walk(231, { tol: 3, noFight: true }); hop(1, 14);
      hop(1, 18); walk(238, { tol: 3 });
      leg('up the summit gate and over the summit bridge', P().x > 237 * TS && P().y <= 16 * TS + 2);
      strike(1); ride(() => full('L4'), 400, { stay: true }); wait(40);
      leg('the last paddle: the flight full to the summit', full('L4'));
      strike(-1); wait(60); leg('the summit bridge swung behind you', !C().bridges[2].across);
      walk(242); leg('the summit (checkpoint two)', P().x > 241 * TS);
      });
      if (ok2) seg('down the weir, across the basin, to her door', () => { dropOn();
      // ---- 6. THE WEIR: stand forward of the flood, the tiller in its window, duck the beams, jump the booms ----
      ride(() => B().mode === 'loose', 900, { stay: true });
      leg('the summit gate bursts', B().mode === 'loose');
      clear(); for (let t = 0; t < 300 && B().helm !== 'cut' && B().x + B().w / 2 < 268 * TS; t++) { const b = B(), mid = b.x + b.w / 2; if (Math.abs(P().x - (mid - 12)) > 4) { clear(); k[P().x < mid - 12 ? 'right' : 'left'] = true; tick(1); continue; } clear(); P().face = 1; BK.press('atk'); tick(10); }
      leg('the tiller struck in its window: steer for the mill cut', B().helm === 'cut');
      ride(() => B().mode !== 'loose', 1500, { stay: true, noFight: true, weir: true, at: 82 });
      leg('down the race into the basin', B().mode === 'float' && B().x > 320 * TS);
      // ---- 7. THE BASIN (the exam): the island's lamplighter and foreman first, in the dark; then the horn, the bridge, the capstan ----
      ride(() => B().holdWhy === 'fog', 300, { stay: true });
      clear(); hop(-1, 18); walk(335, { noFight: true }); walk(344);
      leg('over the bridge to the island, in the fog', P().x > 342 * TS && P().y <= 41 * TS);
      for (let i = 0; i < 60 && BK.enemies().some(e => e.alive && (e.elite || e.lamplighter) && e.x > 340 * TS); i++) { const el = BK.enemies().filter(e => e.alive && (e.elite || e.lamplighter) && e.x > 340 * TS).sort((a, b) => (b.lamplighter ? 1 : 0) - (a.lamplighter ? 1 : 0))[0]; walk(Math.round(el.x / TS) - 1, { noFight: true }); if (!fight()) tick(10); }
      leg('the lamplighter and the deck foreman down (the lock door opens)', !BK.enemies().some(e => e.alive && (e.elite || e.lamplighter) && e.x > 340 * TS));
      walk(330, { tol: 3 }); for (let i = 0; i < 700 && C().horns.find(h => h.x < 332 * TS).cd > 0; i++) tick(1); strike(-1);
      const hornOk = C().fogs.find(f => f.id === 'F5').clear > 0;
      walk(343, { tol: 3, noFight: true }); if (C().bridges[3].across) strike(-1);
      leg('the west-bank horn blown, over the bridge in the clear air, the bridge swung', hornOk && !C().bridges[3].across);
      walk(346, { noFight: true }); leg('onto her as she passes under the island', dropOn());
      ride(() => B().holdWhy === 'end' || B().x > 363 * TS, 900, { stay: true });
      walk(368, { tol: 3, noFight: true }); strike(1); ride(() => full('L5'), 400, { stay: true }); leg('the basin lock full: her deck up to the theatre door', full('L5'));
      walk(369, { tol: 3, noFight: true }); hop(1, 18); walk(371);
      leg('up onto the lock gate: the lock door', P().x > 370 * TS && P().y < 42 * TS);
      walk(375); leg('the checkpoint at her west door', BK.L.ents.some(e => e.t === 'check' && e.x === 375) && P().x > 374 * TS); walk(378); tick(30);
      });
      return { TR, hero: ${JSON.stringify(hero)}, bare, lifted, log, state: BK.state, deaths: deaths(), s: +(frames / 60).toFixed(1), taken: Math.round(T.taken), minHp: Math.round(T.minHp), dips: T.dips, maxHp: T.maxHp };
    })()`, 1800000);
    console.log('== ' + r.hero + (god ? ' (god)' : '') + (r.bare ? ', fresh save (level 1, no talents, no skills)' : ', NOT BARE') + ': ' + r.state + ', ' + r.deaths + ' deaths, ' + r.s + ' s' + (r.lifted.length ? '; lifted out (the hand cannot parry): ' + r.lifted.join(' ') : ''));
    console.log('   TALLY: ' + r.taken + ' damage taken, lowest health ' + r.minHp + ' of ' + r.maxHp + ', ' + r.dips + ' dip(s) under 40%' + ((r.dips >= 2 || r.deaths >= 1) ? '  (the level-1 target: met)' : '  (the level-1 target - two dips or a death: NOT met)'));
    for (const t of r.TR || []) console.log('  t ' + JSON.stringify(t));
    const last = new Map(); for (const l of r.log) last.set(l.name, l); for (const l of r.log) { if (!l.died && last.get(l.name) !== l) continue; console.log('  ' + (l.ok ? 'ok  ' : 'MISS') + ' ' + l.name.padEnd(72) + ' at ' + l.at.join(',') + '  hp ' + String(l.hp).padStart(3) + '  took ' + String(l.took).padStart(3) + '  deaths ' + l.deaths + '  ' + l.s + 's'); if (!l.ok) bad++; }
    if (r.state !== 'win' && r.state !== 'clear' && r.state !== 'levelclear') console.log('  (the run ended in state ' + r.state + ')');
  }
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
process.exitCode = bad ? 1 : 0;
