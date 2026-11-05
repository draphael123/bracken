/* tools/demo-transitions.mjs - THE DEMO'S LEVEL-TO-LEVEL TRANSITIONS, pinned (claude/demotransitions, Daniel 11-02 13:33).
   Every connected level of the demo road (Lumber Trail -> Hornet's Nest -> Marsh -> Fen Road -> Stockade -> Sporewood -> Rootway -> Underleaf -> Palisade Wood -> Kingswood + the Burning Village spur) has a row in
   src/transitions.js; three have a scene on top (Nest -> Marsh: the FERRY; Fen Road -> Stockade: the ROAD to the walls; Kingswood -> Burning Village: SMOKE on the horizon).
     node tools/demo-transitions.mjs                node only: the table (every pair, in road order), the beats of every row, a skip at every moment of every row lands done, the scene maths, the source wiring, the files' names
     node tools/demo-transitions.mjs --browser      adds the page, one run per row: the boss falls (or the party walks into the gate), the clear is credited and SAVED first, the way opens (tiles go to air), the walk, the scene, the fade,
                                                    the next level loads and the party ARRIVES at its start (solid footing, clear of walls, unhurt, control returns); a skip mid-scene; 4 seats; reduce-motion; console clean
     node tools/demo-transitions.mjs --browser --shots=<dir>   also writes pictures per row (the scenes at three moments)
   ACT II (claude/act2tr): rows scree>hanging ... skyroad>oreroad + a derived-road check (the ACT2_* block below; lanes B/C add their letter to ACT2_BUILT). Exit 1 on any red row. */
import { readFileSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const artSrc = readFileSync(new URL('../src/transitions-art.js', import.meta.url), 'utf8');
const levelSrc = readFileSync(new URL('../src/level.js', import.meta.url), 'utf8');

/* ---- the table: every pair of the demo road, in order ---- */
const ROAD = ['wood', 'hornetsnest', 'marsh', 'fenroad', 'stockade', 'spore', 'rootway', 'underleaf', 'palisadewood', 'kings'];
const SCENES = { 'hornetsnest>marsh': 'ferry', 'fenroad>stockade': 'road', 'kings>burning': 'smoke' };
const rowOf = (a, b) => TRM.TABLE.find(e => e.from === a && e.to === b);
for (let i = 0; i < ROAD.length - 1; i++) {
  const a = ROAD[i], b = ROAD[i + 1], key = a + '>' + b, e = rowOf(a, b);
  ok('the table has a row ' + key, !!e);
  if (!e) continue;
  ok(key + ': ' + (SCENES[key] ? 'a ' + SCENES[key] + ' SCENE on top of the walk' : 'a plain WALK-OUT (no scene)'), (SCENES[key] ? e.scene === SCENES[key] : e.scene === null));
}
ok('the spur row kings > burning (scene smoke, plays only when the spur is open) and the shut-spur fallback kings > scree exist', rowOf('kings', 'burning') && rowOf('kings', 'burning').scene === 'smoke' && rowOf('kings', 'burning').when.burningOpen === true && rowOf('kings', 'scree') && rowOf('kings', 'scree').when.burningOpen === false);
ok('entryFor honours when: kings with the spur open -> burning, shut -> scree; every other level ignores the flags', TRM.entryFor('kings', undefined, { burningOpen: true }).to === 'burning' && TRM.entryFor('kings', undefined, { burningOpen: false }).to === 'scree' && TRM.entryFor('marsh', undefined, {}).to === 'fenroad' && TRM.entryFor('marsh', undefined, { burningOpen: true }).to === 'fenroad');
ok('no row for the wood > marsh ferry any more (the road runs through the nest) and every row\'s `from` is unique per flag state', !rowOf('wood', 'marsh') && TRM.TABLE.every((e, i) => TRM.TABLE.findIndex(q => q.from === e.from && JSON.stringify(q.when || {}) === JSON.stringify(e.when || {})) === i));
for (const e of TRM.TABLE) {
  const key = e.from + '>' + e.to, ids = e.beats.map(b => b.id), last = ids[ids.length - 1], hasScene = e.beats.some(TRM.isSceneBeat);
  ok(key + ': beats walk -> (scene) -> fade, fade last, walk before any scene, an open beat (if any) first', ids.includes('walk') && last === 'fade' && (!ids.includes('open') || ids[0] === 'open') && (!hasScene || ids.indexOf('walk') < e.beats.findIndex(TRM.isSceneBeat)), ids.join());
  ok(key + ': a scene row has scene beats and a scene name, a walk-out has neither', !!e.scene === hasScene, JSON.stringify([e.scene, hasScene]));
  ok(key + ': the walk is capped (max) and short; the whole row is ' + TRM.length(e).toFixed(1) + ' s (a walk-out <= 6 s, a scene <= 15 s)', e.beats.find(b => b.id === 'walk').max >= e.beats.find(b => b.id === 'walk').dur && TRM.length(e) <= (hasScene ? 15 : 6), TRM.length(e).toFixed(1));
  if (e.endOnMap) ok(key + ': it ENDS ON THE MAP (endOnMap, no arrival): the spur is chosen by the player, not auto-loaded', e.endOnMap === true && !e.arrive && e.to === 'burning'); else ok(key + ': it arrives walking in from the left for 1-3 s' + (e.arrive.ferry ? ' off the ferry' : ''), e.arrive && e.arrive.walk >= 1 && e.arrive.walk <= 3 && (e.scene === 'ferry' || !!e.arrive.raft) === !!e.arrive.ferry);
  if (e.open) ok(key + ': the way opens in the arena\'s last column(s) - ' + (e.open.kind || 'pine') + (e.open.w ? ' x' + e.open.w : ''), e.open.rows[0] < e.open.rows[1] && ['pine', 'bog', 'palisade', 'leaf', 'light', 'cairn', 'ledge', 'rope', 'bell', 'crumble', 'adit', 'arch', 'hatch', undefined].includes(e.open.kind) && (e.open.w || 1) <= 6);
  /* a skip at ANY moment lands in the same place: the timeline reaches done, with fade once, never stuck (soft-lock) */
  let worst = 0, bad = '';
  for (let t = 0.05; t < TRM.length(e) + 1; t += 0.11) {
    const tl = TRM.start(e); let g = 0, time = 0;
    while (!tl.done && g++ < 3000 && time < t) { TRM.step(tl, 1 / 60, { ready: true }); time += 1 / 60; }
    if (!tl.done) { TRM.step(tl, 1 / 60, { press: true }); const sk = tl.skipped; let n = 0; while (!tl.done && n++ < 60 * (TRM.length(e) + 4)) TRM.step(tl, 1 / 60, {}); if (!tl.done) bad = 'stuck after a press at ' + t.toFixed(2); if (sk) worst = Math.max(worst, n); }   /* a press under MIN_SKIP (0.8 s) is ignored by design: the row then plays on; later it skips */
    if (tl.log[tl.log.length - 1] !== 'done' || tl.log.filter(x => x === 'fade').length > 1) bad = bad || 'log ' + tl.log.join();
  }
  ok(key + ': a skip at any moment ends done through a short fade (worst ' + (worst / 60).toFixed(2) + ' s)', !bad && worst <= 0.35 * 60 + 3, bad);
  const tl2 = TRM.start(e); while (TRM.phase(tl2) !== 'walk') TRM.step(tl2, 1 / 60, {}); let t2 = 0; while (TRM.phase(tl2) === 'walk' && t2 < 10) { TRM.step(tl2, 1 / 60, { ready: false }); t2 += 1 / 60; }
  ok(key + ': the walk cannot run past its cap if a hero never arrives', t2 <= e.beats.find(b => b.id === 'walk').max + 0.05, t2.toFixed(2));
}
/* ---- every `to` is the NEXT level on the road (needs), or a spur hanging off the level ---- */
for (const e of TRM.TABLE) {
  const re = new RegExp("id: '" + e.to + "'[^\\n]*?needs: (?:ROAD_OPEN[.][a-z]+ [?] )?'([a-z]+)'"), m = levelSrc.match(re);
  const spur = /opensOn: \{ level: '([a-z]+)'/.exec((levelSrc.match(new RegExp("id: '" + e.to + "'[^\\n]*\\n?[^\\n]*opensOn: \\{ level: '[a-z]+'")) || [''])[0]);
  ok(e.from + '>' + e.to + ': level.js has ' + e.to + ' needing ' + e.from + (spur ? ' (or a spur: opensOn ' + spur[1] + ')' : ''), (m && m[1] === e.from) || (spur && spur[1] === e.from), m ? m[1] : 'no needs found');
}
/* ---- ACT II: THE CRAGS - the main road, scree to longwater (claude/act2tr, brief-act2transitions-1104). Side paths excluded. ----
   LANES: A built rows 1-6 (scree>hanging ... skyroad>oreroad), B owns 7-11 (oreroad>minecart ... kitchengate>crown) and C row 12 (crown>longwater, the hand-off). When a lane merges it ADDS ITS LETTER TO ACT2_BUILT below: from then
   on a missing row of that lane is RED (until then it reports "pending"). Every row that exists is checked against the BUILT levels, so a level/arena edit that moves a wall, a floor or a start fails loud here. */
const ACT2_BUILT = ['A', 'B', 'C'];
const ACT2_EXPECT = [['scree', 'hanging', 'A'], ['hanging', 'spire', 'A'], ['spire', 'moor', 'A'], ['moor', 'rookery', 'A'], ['rookery', 'skyroad', 'A'], ['skyroad', 'oreroad', 'A'],
  ['oreroad', 'minecart', 'B'], ['minecart', 'storm', 'B'], ['storm', 'undercrown', 'B'], ['undercrown', 'kitchengate', 'B'], ['kitchengate', 'crown', 'B'], ['crown', 'longwater', 'C']];
{ const { LEVELS, T } = await import('../src/level.js');
  const isSpur = l => !!(l.spurOf || l.opensOn);
  /* the chain, derived from the road itself (needs:), never a hand list: a road change fails here */
  const chain = ['scree']; for (let g = 0; g < 40 && chain[chain.length - 1] !== 'longwater'; g++) { const nx = LEVELS.filter(l => l.needs === chain[chain.length - 1] && !isSpur(l)); if (nx.length !== 1) break; chain.push(nx[0].id); }
  ok('ACT II chain derived from needs: (spurs left out) is scree > ... > longwater, 12 pairs', chain.join('>') === ACT2_EXPECT.map(x => x[0]).concat('longwater').join('>'), chain.join('>'));
  const spurIds = new Set(LEVELS.filter(isSpur).map(l => l.id));
  ok('no row touches a SPUR (Burning Village is act I\'s and the only one; the War Cairn, the Church, the Unburied Field have none)', TRM.TABLE.every(e => e.to === 'burning' ? e.from === 'kings' : !spurIds.has(e.from) && !spurIds.has(e.to)), [...spurIds].join());
  ok('no row for the side paths: kitchengate>warcairn, crown>warcairn, any mini or tower', !rowOf('kitchengate', 'warcairn') && !rowOf('crown', 'warcairn') && !TRM.TABLE.some(e => /tower|mini|warcairn/.test(e.to + e.from)));
  const solidT = t => t === T.SOLID || t === T.CRATE || t === T.PALISADE || t === T.PORT || t === T.CLIMB || t === T.SOFT || t === T.ICE || t === T.WEB;   /* main.js isSolid */
  const levels = {}; const lv = id => levels[id] || (levels[id] = LEVELS.find(l => l.id === id).build());
  const artKinds = new Set([...artSrc.matchAll(/^  ([a-z]+): \{ bark:/gm)].map(m => m[1]));   /* GATE_PAL's keys */
  for (const [a, b, lane] of ACT2_EXPECT) {
    const key = a + '>' + b, e = rowOf(a, b);
    if (!e) { ok(key + ': ' + (ACT2_BUILT.includes(lane) ? 'HAS A ROW (lane ' + lane + ' is built)' : 'pending (lane ' + lane + ' not merged yet)'), !ACT2_BUILT.includes(lane)); continue; }
    ok(key + ': row exists, an Act II walk-out (scene ' + (e.scene || 'none') + '), no spur flag', !e.when && !e.endOnMap && !!e.arrive);
    const L = lv(a), A = L.arena, W = L.W, H = L.grid.length / W, at = (c, r) => (c < 0 || r < 0 || c >= W || r >= H ? 1 : L.grid[r * W + c]), floorRow = e.walk && e.walk.floor ? e.walk.floor : Math.round(A.floor / 16);   /* walk.floor: a row whose floor is not the arena's (Ore Road: the winch landing, row 14) */
    let fr = floorRow, c0 = Math.ceil(A.wallR);   /* the walk is east of the arena's own wall: from wallR to the walk target (or the level's end) */
    const target = e.walk && e.walk.to ? e.walk.to : W - 1;
    if (L.gateAfterBoss) { const g = L.ents.find(x => x.t === 'gate'); ok(key + ': GATE-END: the level has L.gateAfterBoss + a gate ent, the row has no open beat', !!g && !e.open && e.beats[0].id === 'walk'); if (g) { fr = g.y + 1; c0 = g.x; } }
    else ok(key + ': a WALK-OUT: the arena ends the level on the boss (no gateAfterBoss), the row opens a way (open beat first)', !!A.boss && !!e.open && e.beats[0].id === 'open');
    const o = e.open;
    if (o) {
      const cells = []; for (let c = o.col; c < o.col + (o.w || 1); c++) for (let r = o.rows[0]; r <= o.rows[1]; r++) cells.push([c, r]);
      ok(key + ': the opening (' + o.kind + ') is inside the level, east of the arena\'s wall (col ' + o.col + ' >= wallR ' + A.wallR + '), and its bottom is the arena floor (row ' + (o.rows[1] + 1) + ' = ' + floorRow + ')', o.col + (o.w || 1) - 1 >= A.wallR && o.col + (o.w || 1) <= W && o.rows[0] >= 0 && o.rows[1] + 1 === floorRow, JSON.stringify([o.col, A.wallR, W, o.rows[1] + 1, floorRow]));
      if (TRM.isBareKind(o.kind)) ok(key + ': ' + o.kind + ' is a BARE kind - there really is no wall in those cells (all air)', cells.every(([c, r]) => at(c, r) === T.AIR));
      else ok(key + ': ' + o.kind + ' opens a REAL wall - every cell of the gap is solid in the built level (it goes to air only after the kill)', cells.every(([c, r]) => at(c, r) === T.SOLID), cells.filter(([c, r]) => at(c, r) !== T.SOLID).slice(0, 4).join(' '));
      ok(key + ': the art knows the kind (' + o.kind + ' in GATE_PAL or BARE_KINDS)', artKinds.has(o.kind) || TRM.isBareKind(o.kind), [...artKinds].join());
      ok(key + ': the dust is told (open.kind in DUST) or it is a bare kind', !!TRM.DUST[o.kind] || TRM.isBareKind(o.kind));
    }
    if (o && o.fill) { const f = o.fill, cells = []; for (let c = f.col; c < f.col + (f.w || 1); c++) for (let r = f.rows[0]; r <= f.rows[1]; r++) cells.push([c, r]);
      ok(key + ': open.fill bridges a PIT - its cells are air, the tile beside (col ' + (f.col - 1) + ') and the tiles under are solid, the top row is the floor row', cells.every(([c, r]) => at(c, r) === T.AIR) && f.rows[0] === floorRow && f.rows.every(r => solidT(at(f.col - 1, r))) && Array.from({ length: f.w || 1 }, (_, i) => solidT(at(f.col + i, f.rows[1] + 1))).every(Boolean), JSON.stringify(f)); }
    /* the walk: floor under every column from the arena wall to the target, and the two body rows clear (except the opening's own cells, which are air by then) */
    const inOpen = (c, r) => o && c >= o.col && c < o.col + (o.w || 1) && r >= o.rows[0] && r <= o.rows[1];
    const inFill = (c, r) => o && o.fill && c >= o.fill.col && c < o.fill.col + (o.fill.w || 1) && r >= o.fill.rows[0] && r <= o.fill.rows[1];
    const bad = []; for (let c = c0; c <= Math.min(W - 1, Math.max(c0, target)); c++) { if (!(solidT(at(c, fr)) || inFill(c, fr))) bad.push('floor@' + c); for (const r of [fr - 1, fr - 2]) if (solidT(at(c, r)) && !inOpen(c, r)) bad.push('body@' + c + ',' + r); }
    ok(key + ': the walk from col ' + c0 + ' to ' + Math.min(W - 1, target) + ' has floor under every column and clear air above (no pit, no wall, no rock but the opening)', bad.length === 0, bad.slice(0, 6).join(' '));
    /* the ARRIVAL (main.js trnArriveBegin, replayed on the built level): x0 = the leftmost column of the open floored run that leads to START; four seats 12 px apart; walk to goal; foot solid, body clear, no spike */
    { const N = lv(b), s = N.START, sy = s.y; let cx = Math.min(s.x, N.W - 1); const nat = (c, r) => (c < 0 || r < 0 || c >= N.W || r >= N.grid.length / N.W ? 1 : N.grid[r * N.W + c]);
      while (cx > 0 && !solidT(nat(cx - 1, sy)) && !solidT(nat(cx - 1, sy - 1)) && solidT(nat(cx - 1, sy + 1))) cx--;
      let x0 = cx * 16 + 8, goal = Math.max(92, x0 + 36); if (e.arrive.ferry) { x0 = 12; goal = 92; }   /* a ferry / raft arrival: main.js x0 12, goal 92 (the Long Water's bank is solid for cols 0-7) */
      const cA = Math.floor(x0 / 16), cB = Math.floor((goal + (e.arrive.ferry ? 35 : 36)) / 16), w = [];
      for (let c = cA; c <= cB; c++) { if (!solidT(nat(c, sy + 1)) || nat(c, sy + 1) === T.SPIKE) w.push('foot@' + c); if (solidT(nat(c, sy)) || solidT(nat(c, sy - 1))) w.push('body@' + c); if (nat(c, sy) === T.SPIKE) w.push('spike@' + c); }
      ok(key + ': the ARRIVAL in ' + b + ' (start col ' + s.x + ', run from col ' + cA + ' to ' + cB + ', 4 seats) stands on solid footing in clear air, no spike', w.length === 0 && !!e.arrive.walk && e.arrive.walk >= 1 && e.arrive.walk <= 3, w.slice(0, 6).join(' ')); }
  }
}
/* ---- the scenes' maths ---- */
{ const VW = 320;
  ok('ROAD: the world slides monotonically after a short ramp; the stockade grows 0 -> 1 over the scene; reduce-motion slows the slide', TRM.roadScroll(0) === 0 && TRM.roadScroll(3) < TRM.roadScroll(4) && TRM.roadScroll(7) > TRM.roadScroll(6) && TRM.roadGrowth(0) === 0 && Math.abs(TRM.roadGrowth(TRM.ROAD.dur) - 1) < 1e-9 && TRM.roadScroll(6, true) < TRM.roadScroll(6) * 0.6);
  ok('ROAD: every hero walks in from off-screen left and takes a station on the screen (4 seats side by side, inside the left half)', [0, 1, 2, 3].every(i => TRM.roadHero(i, 4, 0, VW).x < 0 && TRM.roadHero(i, 4, 4, VW).x > 0 && TRM.roadHero(i, 4, 4, VW).x < VW * 0.6));
  ok('SMOKE: the party walks in and STOPS (not walking after inT); the glow and the plumes both start at 0 and end at 1', TRM.smokeHero(0, 4, 0, VW).x < 0 && TRM.smokeHero(0, 4, 0.5, VW).walking && !TRM.smokeHero(0, 4, 6, VW).walking && TRM.smokeHero(0, 4, 6, VW).x > 0 && TRM.smokeRise(8) === 1 && TRM.smokeGlow(8) === 1 && TRM.smokeRise(0) === 0 && TRM.smokeGlow(0) === 0);
  { const S = TRM.SMOKE, e = TRM.entryFor('kings', 'burning', { burningOpen: true }), sc = e.beats.find(q => q.id === 'smoke'), at = (s, r) => TRM.smokeStance(s, r);
  ok('KINGSCENE: a SHORT beat (the scene <= 6 s, the whole row <= 9 s), ends on the map (endOnMap, no arrive), thinner bars (entry.bar < the default 22)', sc.dur === S.dur && S.dur <= 6 && TRM.length(e) <= 9 && e.endOnMap === true && e.arrive === null && e.bar > 0 && e.bar < TRM.BAR && TRM.barIn(9, e.bar) === e.bar && TRM.barIn(9) === TRM.BAR);
  ok('KINGSCENE: the order of the beat - walk in, pick up, lift, look back + horn, turn, pan, caption - all inside the scene, the horn while the leader looks back', S.inT < S.pickAt && S.pickAt + 0.3 + S.liftT < S.backAt + 0.2 && S.backAt <= S.hornAt && S.hornAt < S.turnAt && S.turnAt <= S.panAt && S.panAt + S.panDur <= S.dur && S.wordAt < S.dur - 0.5);
  ok('KINGSCENE: the leader stoops and the crown goes from the road (0) to overhead (1) and stays held; he looks back (face -1) then turns (+1) and walks on with the pan', at(0).crown === 0 && at(S.pickAt + 0.2).stoop > 0.5 && at(S.pickAt + 0.3 + S.liftT + 0.05).crown === 1 && at(S.dur).crown === 1 && at(S.backAt + 0.1).face === -1 && at(S.turnAt + 0.1).face === 1 && at(S.panAt + 1).walking && !at(S.backAt + 0.1).walking);
  ok('KINGSCENE: the camera pan 0 -> 1 is monotonic and complete by the end of the scene; reduce-motion never slides (0 then 1, no value between) and walks nothing on', TRM.smokePan(0) === 0 && TRM.smokePan(S.panAt + 1) > 0.2 && TRM.smokePan(S.panAt + 1) < 0.8 && TRM.smokePan(S.dur) === 1 && TRM.smokePan(S.panAt + 0.5) < TRM.smokePan(S.panAt + 1) && [0, 1, 2, 3, 4, 5, 5.4].every(s => [0, 1].includes(TRM.smokePan(s, true))) && !at(S.panAt + 1, true).walking);
  ok('KINGSCENE: the caption fades in after the pan starts and is full before the fade', TRM.smokeWord(S.wordAt - 0.01) === 0 && TRM.smokeWord(S.dur) === 1 && S.wordAt >= S.panAt); }
  ok('SMOKE: every seat is on the screen when it stops', [0, 1, 2, 3].every(i => { const x = TRM.smokeHero(i, 4, 8, VW).x; return x > 0 && x < VW * 0.7; })); }
/* ---- ACT II LANE C: the 3 BIG SCENES (claude/act2tr): minecart>storm 'daylight' (S1), storm>undercrown 'drop' (S2), crown>longwater 'descent' (S3, the act hand-off). Static checks; the page checks are the --browser / --perf loops above. ---- */
{ const VW = 320, C3 = [['minecart', 'storm', 'daylight', TRM.DAYLIGHT], ['storm', 'undercrown', 'drop', TRM.DROP], ['crown', 'longwater', 'descent', TRM.DESCENT]];
  const cartLevels = {}; const { LEVELS: LV3, T: T3 } = await import('../src/level.js'); const lv3 = id => cartLevels[id] || (cartLevels[id] = LV3.find(l => l.id === id).build());
  const trSrc = readFileSync(new URL('../src/transitions.js', import.meta.url), 'utf8');
  ok('no TODO-LANE-C marker is left in src/transitions.js', !/TODO-LANE-C/.test(trSrc));
  for (const [a, b, sc, K] of C3) {
    const key = a + '>' + b, e = rowOf(a, b), sb = e && e.beats.find(TRM.isSceneBeat), ids = e ? e.beats.map(x => x.id) : [];
    ok(key + ': scene ' + sc + ' - a row with scene ' + sc + ' and exactly one scene beat named ' + sc + ' (sc: true) of ' + K.dur + ' s', !!e && e.scene === sc && e.beats.filter(TRM.isSceneBeat).length === 1 && !!sb && sb.id === sc && sb.dur === K.dur);
    ok(key + ': short cinematic beat - the scene is 4.5-7 s, the whole row <= 12 s, thin letterbox bars (bar 8-16), the order [open,] walk, ' + sc + ', fade', !!e && K.dur >= 4.5 && K.dur <= 7 && TRM.length(e) <= 12 && e.bar >= 8 && e.bar <= 16 && ids.indexOf('walk') < ids.indexOf(sc) && ids[ids.length - 1] === 'fade' && (!ids.includes('open') || ids[0] === 'open'), ids.join());
    ok(key + ': ONE caption line, short (6-24 chars, upper case, letters and spaces only), it appears once the scene is under way and before it ends', !!e && !!e.caption && /^[A-Z ]{6,24}$/.test(e.caption.text) && e.caption.at >= 1 && e.caption.at < K.dur - 1.2);
    ok(key + ': it arrives in the next level (no endOnMap, no auto-load skip): arrive.walk 1-3 s', !!e && !e.endOnMap && !!e.arrive && e.arrive.walk >= 1 && e.arrive.walk <= 3);
    /* the skip contract: a press at every 0.11 s (reduce on) lands done through a short fade; the timeline does not depend on the seat count or on reduce */
    let bad = '', worst = 0; for (let t = 0.9; t < TRM.length(e) + 0.5; t += 0.11) { const tl = TRM.start(e, { reduce: true }); let tt = 0; while (!tl.done && tt < t) { TRM.step(tl, 1 / 60, { ready: true }); tt += 1 / 60; } if (!tl.done) { TRM.step(tl, 1 / 60, { press: true }); const sk = tl.skipped; let n = 0; while (!tl.done && n++ < 1200) TRM.step(tl, 1 / 60, {}); if (!tl.done) bad = 'stuck ' + t.toFixed(2); if (sk) worst = Math.max(worst, n); } }
    ok(key + ': skippable at every moment after 0.8 s, also under reduce-motion (done in <= 0.35 s of fade, worst ' + (worst / 60).toFixed(2) + ' s)', !bad && worst <= 0.35 * 60 + 3, bad);
  }
  /* S1: the world scrolls (monotone), the mouth is dark then lit BEFORE the cart is out, the town grows only outside; four seats on the cart's deck; reduce slows */
  ok('S1 DAYLIGHT: scroll starts at 0, never goes backwards, reduce is slower; the mouth lights (0 -> 1) BEFORE the cart is out (out 0 -> 1 after outAt); the town grows only once outside', TRM.daylightScroll(0) === 0 && TRM.daylightScroll(2) < TRM.daylightScroll(3) && TRM.daylightScroll(5, true) < TRM.daylightScroll(5) * 0.6 && TRM.daylightLight(0) === 0 && TRM.daylightLight(TRM.DAYLIGHT.outAt) > 0.6 && TRM.daylightOut(TRM.DAYLIGHT.outAt - 0.01) < 0.01 && TRM.daylightOut(5.6) === 1 && TRM.daylightTown(TRM.DAYLIGHT.outAt) === 0 && TRM.daylightTown(5.6) > 0.9);
  ok('S1 DAYLIGHT: all 4 seats climb onto the cart from off-screen left and stand on its 80 px deck, not walking after inT', [0, 1, 2, 3].every(i => TRM.daylightHero(i, 4, 0, VW).x < 0 && TRM.daylightHero(i, 4, 0.4, VW).walking && !TRM.daylightHero(i, 4, 2, VW).walking && TRM.daylightHero(i, 4, 2, VW).x >= VW * 0.20 && TRM.daylightHero(i, 4, 2, VW).x <= VW * 0.20 + 80));
  /* S2: cracks first, the deck goes at breakAt, the fall accelerates then holds a terminal speed, reduce is gentler, the light goes out; the party never leaves the screen */
  ok('S2 DROP: the crack grows 0 -> 1 before the break; nothing falls before breakAt; the fall accelerates to a terminal speed (never past vT); reduce-motion falls slower; the dark comes after the break', TRM.dropCrack(0) === 0 && TRM.dropCrack(TRM.DROP.breakAt) > 0.9 && TRM.dropFall(TRM.DROP.breakAt - 0.1) === 0 && TRM.dropFall(2.2) < TRM.dropFall(3) && (TRM.dropFall(4.9) - TRM.dropFall(4.8)) / 0.1 <= TRM.DROP.vT + 1 && TRM.dropFall(4, true) < TRM.dropFall(4) * 0.6 && TRM.dropDark(TRM.DROP.breakAt) < 0.1 && TRM.dropDark(5.2) > 0.9);
  ok('S2 DROP: every seat stays on the screen all the way down (x inside the screen, the sink 0-40 px) for 1-4 seats', [0, 1, 2, 3].every(i => { for (let s = 0; s <= 5.2; s += 0.2) { const h = TRM.dropHero(i, 4, s, VW); if (!(h.x > 8 && h.x < VW - 8 && h.sink >= 0 && h.sink <= 40)) return false; } return true; }));
  /* S3: the pull is 0 -> 1 (a step + a dip under reduce: no slide), the river comes up after the pull begins, the raft scrolls only once afloat, 4 seats take stations before it */
  ok('S3 DESCENT: the pull-back eases 0 -> 1; under reduce-motion it is a step with a dip to dark (never a slide); the water rises after the pull begins; the raft moves only once afloat', TRM.descentPull(0) === 0 && TRM.descentPull(TRM.DESCENT.pullAt + 1.2) > 0.3 && TRM.descentPull(TRM.DESCENT.pullAt + TRM.DESCENT.pullDur + 0.1) === 1 && [0, 1, 2, 3, 4, 5, 6].every(s => { const p = TRM.descentPull(s, true); return p === 0 || p === 1; }) && TRM.descentDip(TRM.DESCENT.pullAt + 0.3, true) > 0.9 && TRM.descentDip(1, true) === 0 && TRM.descentDip(2.2, false) === 0 && TRM.descentWater(TRM.DESCENT.pullAt) === 0 && TRM.descentWater(6) === 1 && TRM.descentScroll(TRM.DESCENT.raftAt) === 0 && TRM.descentScroll(6) > TRM.descentScroll(5) && TRM.descentScroll(6, true) < TRM.descentScroll(6));
  ok('S3 DESCENT: all 4 seats walk in from off-screen left and take their stations in the left 60% before the raft', [0, 1, 2, 3].every(i => TRM.descentHero(i, 4, 0, VW).x < 0 && !TRM.descentHero(i, 4, 2, VW).walking && TRM.descentHero(i, 4, 2, VW).x > 0 && TRM.descentHero(i, 4, 2, VW).x < VW * 0.6));
  ok('captionAlpha: 0 before the line\'s time, 1 after 0.6 s, 0 for a row without a caption', TRM.captionAlpha({ caption: { text: 'X', at: 3 } }, 2.9) === 0 && TRM.captionAlpha({ caption: { text: 'X', at: 3 } }, 3.7) === 1 && TRM.captionAlpha({}, 5) === 0);
  /* S2's arrival: the Undercrown's ledge takes the party (arrive.drop = dust + a thud, no physics): solid floor under, clear air above, for the standing room of 4 seats */
  { const N = lv3('undercrown'), s = N.START, nat = (c, r) => (c < 0 || r < 0 || c >= N.W || r >= N.grid.length / N.W ? 1 : N.grid[r * N.W + c]);
    ok('S2 arrival: the Undercrown ledge (start ' + s.x + ',' + s.y + ') has solid floor under the 4 seats\' standing room and clear air to stand in', [0, 1, 2, 3, 4, 5, 6, 7].every(i => nat(s.x + i - 1, s.y + 1) !== T3.AIR && nat(s.x + i - 1, s.y) === T3.AIR && nat(s.x + i - 1, s.y - 1) === T3.AIR)); }
  /* S3's arrival: the raft beached on the Long Water's first bank (arrive.ferry + raft; main.js x0 = 12, goal = 92, four seats 12 px apart): the first 8 columns are solid at the start row, clear above, no spike */
  { const N = lv3('longwater'), s = N.START, nat = (c, r) => (c < 0 || r < 0 || c >= N.W || r >= N.grid.length / N.W ? 1 : N.grid[r * N.W + c]), bad = [];
    for (let c = 0; c <= Math.floor((92 + 3 * 12 - 1) / 16); c++) { if (nat(c, s.y + 1) === T3.AIR || nat(c, s.y + 1) === T3.SPIKE) bad.push('foot@' + c); if (nat(c, s.y) !== T3.AIR || nat(c, s.y - 1) !== T3.AIR) bad.push('body@' + c); }
    ok('S3 arrival: the raft on the Long Water\'s first bank (start row ' + s.y + '): solid under the 4 seats, clear air above, no spike', bad.length === 0, bad.join(' ')); }
  /* the crown hand-off row: the broken gate is the Banquet Hall's REAL east wall (all solid before the kill), the dais is the walk line (row 18), follow is on, and the walk to the level's end is floored + clear */
  { const L = lv3('crown'), A = L.arena, e = rowOf('crown', 'longwater'), o = e.open, at = (c, r) => (c < 0 || r < 0 || c >= L.W || r >= L.grid.length / L.W ? 1 : L.grid[r * L.W + c]), cells = [];
    for (let c = o.col; c < o.col + o.w; c++) for (let r = o.rows[0]; r <= o.rows[1]; r++) cells.push([c, r]);
    ok('crown>longwater: the gate (cols ' + o.col + '-' + (o.col + o.w - 1) + ', rows ' + o.rows.join('-') + ') is the hall\'s east wall: every cell solid, it starts at the arena wall (' + A.wallR + ') and ends at the level\'s last column, the walk line is the dais top (row ' + e.walk.floor + '), follow on', cells.every(([c, r]) => at(c, r) === T3.SOLID) && o.col === A.wallR && o.col + o.w === L.W && o.rows[1] + 1 === e.walk.floor && e.walk.follow === true);
    const inO = (c, r) => c >= o.col && c < o.col + o.w && r >= o.rows[0] && r <= o.rows[1], bad = [];
    for (let c = Math.ceil(A.wallR); c < L.W; c++) { if (at(c, e.walk.floor) !== T3.SOLID) bad.push('floor@' + c); for (const r of [e.walk.floor - 1, e.walk.floor - 2]) if (at(c, r) === T3.SOLID && !inO(c, r)) bad.push('body@' + c + ',' + r); }
    ok('crown>longwater: from the arena wall to the level\'s end the dais has floor under every column and clear air above (the opening aside)', bad.length === 0, bad.slice(0, 6).join(' '));
    /* walk.follow (main.js): the hero's y follows the first solid tile at or below row (y/16 - 3), so a hero on the hall floor (row 20) climbs the dais steps instead of floating: replay the scan on the built level with the gate already open */
    const gy = (x, y) => { let ty = Math.floor(y / 16) - 3; const tx = Math.floor(x / 16); while (ty < 400 && !(at(tx, ty) === T3.SOLID && !inO(tx, ty))) ty++; return ty * 16; };
    ok('crown>longwater: the follow scan lands on the hall floor (y 320) in the hall and on the dais (y 288) at the gate, from either standing height', gy(565 * 16, 20 * 16) === 320 && gy(570 * 16, 20 * 16) === 320 && gy(605 * 16, 18 * 16) === 288 && gy(605 * 16, 20 * 16) === 288 && gy(595 * 16, 19 * 16) === 288, [gy(565 * 16, 20 * 16), gy(605 * 16, 18 * 16), gy(605 * 16, 20 * 16), gy(595 * 16, 19 * 16)].join()); }
  /* the source wiring: the three scenes drawn, the caption, the thin bars, the raft arrival, the drop's landing, the follow walk */
  ok('main.js: the three scenes dispatch (daylight / drop / descent), main.js draws the caption (not the art), thin bars (entry.bar) in and out, the raft arrival, the drop landing, walk.follow', src.includes('TRA.drawDaylightScene(env, s)') && src.includes('TRA.drawDropScene(env, s)') && src.includes('TRA.drawDescentScene(env, s)') && src.includes('trnDrawCaption(tr, s)') && src.includes('TRM.barIn(tl.t, TRN.entry.bar || TRM.BAR)') && src.includes('TRM.barOut(trnArrive.t, trnArrive.dur, trnArrive.entry.bar || TRM.BAR)') && src.includes('TRA.drawArrivalRaft(') && src.includes('entry.arrive.drop') && src.includes('tr.entry.walk.follow'));
  ok('the art file exports the three scenes + the raft; every scene reads reduce (calm) and the raft is world-space', ['drawDaylightScene', 'drawDropScene', 'drawDescentScene', 'drawArrivalRaft'].every(f => artSrc.includes('export function ' + f)) && (artSrc.match(/calm = !!reduce/g) || []).length >= 6);
  ok('every seat is drawn through env.drawHero in each new scene (1-4 seats: the loop runs to n)', ['drawDaylightScene', 'drawDropScene', 'drawDescentScene'].every(f => { const i0 = artSrc.indexOf('export function ' + f), i1 = artSrc.indexOf('\nexport function', i0 + 10), body = artSrc.slice(i0, i1 < 0 ? artSrc.length : i1); return /for \(let i = 0; i < n; i\+\+\)/.test(body) && body.includes('env.drawHero('); }));
}
/* ---- the source wiring ---- */
ok('main.js: a GATE-END level starts the transition at the gate (winLevel then trnBegin)', /else \{ winLevel\(\); trnBegin\(\); \} \}/.test(src));
ok('main.js: trnBegin passes the spur flag to the table and lets a SPUR (opensOn.level) through the needs check', src.includes("TRM.entryFor(LEVELS[levelIndex].id, undefined, { burningOpen: !!PROG.burningOpen })") && src.includes('LEVELS[to].opensOn.level === LEVELS[levelIndex].id'));
ok('main.js: the walk target honours walk.to; the way opens across open.w columns; kind light has no wall', src.includes('entry.walk.to * TS') && src.includes('o.col + (o.w || 1)') && src.includes('TRM.isBareKind(o.kind)') && src.includes('o.fill') && src.includes('TRM.DUST[o.kind]'));
ok('main.js: the scene is drawn by kind (ferry / road / smoke) and for every scene beat; the arrival keeps its level\'s own ambience unless it is a ferry', src.includes('TRA.drawRoadScene(env, s)') && src.includes('TRA.drawSmokeScene(env, s)') && src.includes('TRM.isSceneBeat(TRN.tl.beats[TRN.tl.i])') && src.includes("if (entry.arrive.ferry) ambient.set('water');"));
ok('KINGSCENE main.js: the war horn (SFX.hornBlast) sounds once at hornAt, the caption THE VILLAGE BURNS is drawn by main (fitText, house text), the thin bar + smaller skip hint follow entry.bar, the lit spur path draws on the map', src.includes('SFX.hornBlast(); if (!SET.reduceMotion) shakeCam(2)') && src.includes("fitText('THE VILLAGE BURNS'") && src.includes('TRM.barIn(tl.t, TRN.entry.bar || TRM.BAR)') && src.includes("THE SPUR'S PATH LIT"));
ok('KINGSCENE art: the red standard heap / stump are gone (no gormStandard), the crown is baked, and the scene reads reduce (smokePan with calm)', !artSrc.includes('gormStandard()') && artSrc.includes('const gormCrown') && artSrc.includes('smokePan(s, calm)'));
ok('the art is dialogue-free (no text() in transitions-art.js)', !/\btext\(/.test(artSrc.replace(/\/\*[^]*?\*\//g, '')));
ok('NEW FILES have no ad-block-looking names (admiral, ads, banner, track, analytics...)', !readdirSync(new URL('.', import.meta.url)).concat(readdirSync(new URL('../src/', import.meta.url))).some(n => /(^|[-_.])(ad|ads|admiral|banner|track|tracker|analytics|pixel|beacon)([-_.]|$)/i.test(n) && /demo-transitions|transitions/.test(n)));

/* ---- the page ---- */
if (process.argv.includes('--browser')) {
  const shotsArg = process.argv.find(a => a.startsWith('--shots=')), SHOTS = shotsArg ? shotsArg.slice(8) : null; if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const { openPage } = await import('./cdp.mjs'); let pg = await openPage({ audio: false }); const oldErrors = [];
  const ev = x => pg.evalp(x, 600000);
  const shot = async n => { if (!SHOTS) return; await ev('BK.step(1);0'); await new Promise(r => setTimeout(r, 250)); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(SHOTS + '/' + n + '.png', Buffer.from(r.result.data, 'base64')); };
  /* the browser side: set a level up, bring the party to the end of it, end it, and watch the transition. mode: { seats, reduce, skipAt: a beat id to press in (after 1 s), shots: name prefix } */
  const run = (from, mode = {}) => ev(`(async()=>{ const MODE = ${JSON.stringify(mode)}; const { LEVELS } = await import('/src/level.js'); const idx = id => LEVELS.findIndex(l => l.id === id); const out = { log: [], shots: [] };
    BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.SET.transitions = 'always'; BK.SET.reduceMotion = !!MODE.reduce; BK.trans.force(true);
    if (MODE.burning === true) BK.PROG.burningOpen = 1; else if (MODE.burning === false) delete BK.PROG.burningOpen;
    BK.load(idx(${JSON.stringify(from)})); BK.start(); BK.sim(20);
    if (MODE.seats > 1) { BK.coopStart('warden', false, MODE.seats > 2 ? [{ hero: 'warden' }, { hero: 'pyro' }, { hero: 'knight' }].slice(0, MODE.seats - 1) : undefined); BK.sim(4); }
    const L = BK.L, A = L.arena; out.seats = BK.players().length; out.W = L.W;
    const dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };   /* the level-up card a fresh knight earns off the boss: a player picks (or leaves it) and goes on */
    const killBoss = () => { const e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.players().forEach((p, i) => { if (i) { p.x = BK.P.x - 10 * i; p.y = BK.P.y; } }); BK.sim(200);
      for (let n = 0; n < 1500 && e && e.alive; n++) { BK.players().forEach(p => { p.inv = 99; p.hp = p.maxHp; }); e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); } return !!e && !e.alive; };
    if (MODE.direct) { BK.state = 'win'; out.began = BK.trans.begin(); }   /* the shut-spur fallback: begin straight off the table */
    else { out.killed = killBoss();
      if (L.gateAfterBoss || ${JSON.stringify(from)} === 'stockade') { for (let i = 0; i < 400 && !(L.gateOpen || (${JSON.stringify(from)} === 'stockade' && i > 30)); i++) { dismiss(); BK.sim(1); } out.gateOpen = !!L.gateOpen; const g = BK.gate; BK.players().forEach((p, i) => { p.x = g.x - i * 2; p.y = g.y; p.vx = p.vy = 0; }); }
      for (let i = 0; i < 900 && !BK.trans.tr && BK.state !== 'win'; i++) { dismiss(); BK.sim(1); } }
    for (let i = 0; i < 200 && !BK.trans.tr && BK.state === 'win'; i++) { dismiss(); BK.sim(1); }
    out.tr = !!BK.trans.tr; if (!out.tr) { out.state = BK.state; return out; }
    out.to = BK.trans.tr.entry.to; out.walkers = BK.trans.tr.pos.length; out.scene = BK.trans.tr.entry.scene; out.cleared = !!(BK.PROG[${JSON.stringify(from)}] && BK.PROG[${JSON.stringify(from)}].cleared);
    out.saved = Object.keys(localStorage).some(k => new RegExp('"${from}":\\\\{[^}]*"cleared":(true|1)').test(localStorage.getItem(k) || ''));
    const open = BK.trans.tr.entry.open, tl0 = BK.trans.tr.tl; let skipped = false, opened = false;
    out.minX = 1e9; out.shotAt = [];
    for (let f = 0; f < 4000 && BK.trans.tr; f++) {
      const tr = BK.trans.tr, tl = tr.tl, ph = BK.trans.TRM.phase(tl);
      if (open && tr.opened && !opened) { opened = true; out.openedTiles = []; for (let c = open.col; c < open.col + (open.w || 1); c++) for (let r = open.rows[0]; r <= open.rows[1]; r++) out.openedTiles.push(BK.L.grid[r * BK.L.W + c]); out.wallWas = true; if (open.fill) { out.fillTiles = []; for (let c = open.fill.col; c < open.fill.col + (open.fill.w || 1); c++) for (let r = open.fill.rows[0]; r <= open.fill.rows[1]; r++) out.fillTiles.push(BK.L.grid[r * BK.L.W + c]); } }
      if (MODE.skipAt && !skipped && ph === MODE.skipAt && tl.pt > 1.0) { BK.trans.press(); skipped = true; out.skipPhase = ph; }
      if (MODE.shots && !skipped) { const want = MODE.shots.find(w => !out.shotAt.includes(w.n) && w.ph === ph && tl.pt >= w.pt); if (want) { BK.step(1); out.shotAt.push(want.n); out.pending = want.n; out.pendingReady = true; return Object.assign(out, { stoppedFor: want.n, f }); } }
      BK.sim(1);
    }
    for (const until = Date.now() + 20000; BK.trans.tr && Date.now() < until;) { BK.sim(2); await new Promise(r => setTimeout(r, 40)); }   /* the next level loads on its own clock */
    out.done = !BK.trans.tr; out.lvl = BK.trans.levelId();
    return out; })()`);
  /* a run that pauses for a picture: the page keeps its state, the tool shoots, then continues */
  let runs = 0;   /* a fresh page every 3 runs: one page that loads thirty levels in a row grew until Chrome crashed it (Inspector.targetCrashed) */
  const watch = async (from, mode = {}) => {
    if (runs++ % 2 === 1) { oldErrors.push(...pg.errors); pg.close(); pg = await openPage({ audio: false }); }
    const key = from + '-' + (mode.tag || 'full');
    const base = await run(from, { ...mode, shots: SHOTS && mode.shots ? mode.shots : null });
    let r = base; const shotsDone = [];
    while (r.stoppedFor) { await shot(key + '-' + r.stoppedFor); shotsDone.push(r.stoppedFor); r = await ev(`(async()=>{ const out = { shotAt: ${JSON.stringify(shotsDone)} }; const want = ${JSON.stringify(mode.shots || [])};
      for (let f = 0; f < 4000 && BK.trans.tr; f++) { const tr = BK.trans.tr, tl = tr.tl, ph = BK.trans.TRM.phase(tl); const w = want.find(q => !out.shotAt.includes(q.n) && q.ph === ph && tl.pt >= q.pt); if (w) { BK.step(1); out.shotAt.push(w.n); return Object.assign(out, { stoppedFor: w.n }); } BK.sim(1); }
      for (const until = Date.now() + 20000; BK.trans.tr && Date.now() < until;) { BK.sim(2); await new Promise(r => setTimeout(r, 40)); }
      out.done = !BK.trans.tr; out.lvl = BK.trans.levelId(); return out; })()`); }
    return { base, end: r };
  };
  try {
    for (const e of TRM.TABLE) {
      const key = e.from + '>' + e.to, fl = e.from === 'kings' && e.to === 'scree';
      if (process.env.DT_ONLY && key !== process.env.DT_ONLY) continue;   /* (claude/kingscene) DT_ONLY=kings>burning [DT_SEATS=3] [DT_REDUCE=1]: one row, six pictures through the beat */
      const shots = SHOTS ? (process.env.DT_ONLY === 'kings>burning' ? [0.9, 1.9, 2.7, 3.7, 4.5, 5.2].map((pt, i) => ({ n: 'k' + (i + 1), ph: 'smoke', pt })) : e.scene ? [{ n: 'a', ph: e.beats.find(TRM.isSceneBeat).id, pt: 1.6 }, { n: 'b', ph: e.beats.find(TRM.isSceneBeat).id, pt: e.beats.find(TRM.isSceneBeat).dur * 0.5 }, { n: 'c', ph: e.beats.find(TRM.isSceneBeat).id, pt: e.beats.find(TRM.isSceneBeat).dur * 0.9 }].concat(e.scene === 'ferry' ? [{ n: 'd', ph: 'ride', pt: 4.5 }, { n: 'e', ph: 'ride', pt: 7.0 }] : []) : e.open ? (process.env.DT_GATES ? [{ n: 'g', ph: 'open', pt: 0.15 }, { n: 'h', ph: 'open', pt: 0.6 }] : []).concat([{ n: 'a', ph: 'open', pt: 1.25 }, { n: 'b', ph: 'walk', pt: 1.2 }]) : [{ n: 'a', ph: 'walk', pt: 0.4 }]) : null;
      const w = await watch(e.from, { tag: process.env.DT_ONLY ? 'only' + (process.env.DT_SEATS || '') + (process.env.DT_REDUCE ? 'r' : '') : 'full', seats: +process.env.DT_SEATS || undefined, reduce: !!process.env.DT_REDUCE, direct: fl, burning: e.when ? e.when.burningOpen : undefined, shots });
      const a = w.base, z = w.end;
      ok(key + ': the boss falls' + (fl ? '' : '') + (fl ? ' (begun off the table)' : '') + ' and the transition PLAYS (state win, TRN set)', a.tr, JSON.stringify(a).slice(0, 300));
      if (!a.tr) continue;
      ok(key + ': it is the ' + (e.scene || 'walk-out') + ' row into ' + e.to, a.to === e.to && (a.scene || null) === (e.scene || null), JSON.stringify([a.to, a.scene]));
      if (!fl) ok(key + ': the clear is CREDITED and SAVED before the cutscene', a.cleared && a.saved, JSON.stringify([a.cleared, a.saved]));
      if (e.open && !TRM.isBareKind(e.open.kind)) ok(key + ': the way OPENED - every tile of the gap is air after the open beat', a.openedTiles && a.openedTiles.length > 0 && a.openedTiles.every(v => v === 0), JSON.stringify(a.openedTiles));
      if (e.open && e.open.fill) ok(key + ': the PIT on the way out is BRIDGED (open.fill: every cell is solid after the open beat) so the walk has a floor', a.fillTiles && a.fillTiles.length > 0 && a.fillTiles.every(v => v === 1), JSON.stringify(a.fillTiles));
      if (e.endOnMap) { const mp = await ev(`(()=>{ for (let i = 0; i < 30; i++) BK.sim(1); return { state: BK.state, node: BK.map ? BK.map.node : null, lit: BK.mapSpurLit ? BK.mapSpurLit() : null, trn: !!BK.trans.tr }; })()`);
        ok(key + ': the transition ends ON THE MAP with the Burning Village node selected and LIT (no level loaded)', z.done && (mp.state === 'map' || mp.state === 'card') && !mp.trn && mp.lit === e.to, JSON.stringify([z, mp]).slice(0, 260)); await ev('(()=>{ if (BK.state === "card") BK.cardClose(); for (let i = 0; i < 20; i++) BK.sim(1); return 0; })()'); await shot('after-kings-map-lit'); continue; }
      ok(key + ': the transition ends, the next level (' + e.to + ') is loaded', z.done && z.lvl === e.to, JSON.stringify(z).slice(0, 200));
      const arr = await ev(`(async()=>{ const out = {}; const A = BK.trans.arrive; out.hasArrive = !!A; const L = BK.L, W = L.W, ps = BK.players();
        const solid = (cx, cy) => cx < 0 || cy < 0 || cy >= L.grid.length / W || (L.grid[cy * W + cx] === 1);
        out.start = L.START; out.pos = ps.map(p => [Math.round(p.x), Math.round(p.y)]); out.hp0 = ps.map(p => p.hp / p.maxHp);
        out.foot = ps.every(p => solid(Math.floor(p.x / 16), Math.floor((p.y + 1) / 16))); out.clear = ps.every(p => !solid(Math.floor(p.x / 16), Math.floor((p.y - 6) / 16)) && !solid(Math.floor(p.x / 16), Math.floor((p.y - 20) / 16)));
        const t0 = ps.map(p => p.x); for (let i = 0; i < 60 * 4; i++) BK.sim(1);
        out.afterX = ps.map(p => Math.round(p.x)); out.afterY = ps.map(p => Math.round(p.y)); out.hp1 = ps.map(p => p.hp / p.maxHp); out.alive = ps.every(p => !p.dead && p.hp > 0); out.state = BK.state; out.arriveDone = BK.trans.arrive ? BK.trans.arrive.done : true;
        out.moved = ps.every((p, i) => p.x > t0[i] - 1); out.fell = ps.some((p, i) => Math.abs(p.y - out.pos[i][1]) > 20); out.errors = 0; return out; })()`);
      ok(key + ': the party ARRIVES at the start of ' + e.to + ' on SOLID footing, in clear air, left of the first fight', arr.foot && arr.clear && arr.pos.every(p => p[0] < 200), JSON.stringify([arr.pos, arr.foot, arr.clear]));
      ok(key + ': after the arrival walk control is back (state play, arrival done), nobody fell, nobody was hurt, nobody died', arr.state === 'play' && arr.arriveDone && !arr.fell && arr.alive && arr.hp1.every((h, i) => h >= arr.hp0[i] - 0.001), JSON.stringify([arr.state, arr.arriveDone, arr.afterY, arr.hp0, arr.hp1]));
    }
    /* a skip in the middle of each scene and in a walk-out lands in the SAME state as a full watch: the next level, the party in it, the clear credited */
    for (const [from, tag, at] of [['hornetsnest', 'skip-ride', 'ride'], ['fenroad', 'skip-road', 'road'], ['kings', 'skip-smoke', 'smoke'], ['marsh', 'skip-walk', 'walk'], ['underleaf', 'skip-open', 'open'], ['palisadewood', 'skip-walk', 'walk'],
      /* ACT II (claude/act2tr): a skip in the open beat of a bare kind, a real wall, and in the gate-end walk */ ['scree', 'skip-open', 'open'], ['moor', 'skip-open', 'open'], ['hanging', 'skip-walk', 'walk'], ['skyroad', 'skip-walk', 'walk'],
      /* LANE C: a skip inside each of the three big scenes */ ['minecart', 'skip-daylight', 'daylight'], ['storm', 'skip-drop', 'drop'], ['crown', 'skip-descent', 'descent']]) {
      const e = TRM.entryFor(from, undefined, { burningOpen: true });
      const w = await watch(from, { tag, skipAt: at, burning: from === 'kings' ? true : undefined });
      if (e.endOnMap) { const mp = await ev(`(()=>{ for (let i = 0; i < 30; i++) BK.sim(1); return { state: BK.state, lit: BK.mapSpurLit ? BK.mapSpurLit() : null }; })()`); ok(from + ' > ' + e.to + ': a SKIP in the ' + at + ' beat ends on the map with the spur lit', w.end.done && w.base.skipPhase === at && (mp.state === 'map' || mp.state === 'card') && mp.lit === e.to, JSON.stringify([w.end, mp]).slice(0, 260)); continue; }
      ok(from + ' > ' + e.to + ': a SKIP in the ' + at + ' beat ends in ' + e.to + ' with the party standing in it (control back)', w.end.done && w.end.lvl === e.to && w.base.skipPhase === at, JSON.stringify(w).slice(0, 260));
      const st = await ev(`(()=>{ for (let i = 0; i < 300; i++) BK.sim(1); const ps = BK.players(); return { state: BK.state, alive: ps.every(p => p.hp > 0), cleared: !!(BK.PROG['${from}'] && BK.PROG['${from}'].cleared), a: BK.trans.arrive ? BK.trans.arrive.done : true }; })()`);
      ok(from + ': after the skip the state is play, the arrival done, the party alive, the clear credited', st.state === 'play' && st.alive && st.cleared && st.a, JSON.stringify(st));
    }
    /* four seats, reduce motion, ?trans off, the setting NEVER */
    for (const [from, tag, m] of [['fenroad', '4seats', { seats: 4 }], ['hornetsnest', '3seats', { seats: 3 }], ['kings', 'reduce', { reduce: true, burning: true }], ['fenroad', 'reduce', { reduce: true }], ['hornetsnest', 'reduce', { reduce: true }],
      ['rookery', '4seats', { seats: 4 }], ['spire', '3seats', { seats: 3 }], ['moor', 'reduce', { reduce: true }]]) {
      const e = TRM.entryFor(from, undefined, { burningOpen: true });
      const w = await watch(from, { tag, ...m });
      if (e.endOnMap) { ok(from + ' > ' + e.to + ' (' + tag + '): the transition plays through to the map' + (m.reduce ? ' and reduce-motion' : ''), w.base.tr && w.end.done, JSON.stringify([w.base.tr, w.end]).slice(0, 200)); continue; }
      ok(from + ' > ' + e.to + ' (' + tag + '): the transition plays through to the next level' + (m.seats ? ' with ' + m.seats + ' seats' : '') + (m.reduce ? ' and reduce-motion' : ''), w.base.tr && w.end.done && w.end.lvl === e.to && (!m.seats || w.base.walkers === m.seats), JSON.stringify([w.base.tr, w.base.walkers, w.end]).slice(0, 260));   /* every seat is walked out (BK.load drops a co-op session in the harness, so the arrival of 4 is not measurable here - owed to a hand test) */
    }
    { const off = await ev(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); delete BK.PROG.transSeen; BK.trans.force(false); BK.load(LEVELS.findIndex(l => l.id === 'fenroad')); BK.start(); BK.sim(5); BK.state = 'win'; const a = BK.trans.begin();
        BK.trans.force(true); BK.SET.transitions = 'never'; const b = BK.trans.begin(); BK.SET.transitions = 'first'; BK.PROG.transSeen = { 'fenroad>stockade': 1 }; const c = BK.trans.begin(); BK.SET.transitions = 'always'; const d = BK.trans.begin(); return { a, b, c, d }; })()`);
      ok('?trans off, the setting NEVER and FIRST TIME on a seen pair do not play the Fen Road scene; ALWAYS does', !off.a && !off.b && !off.c && off.d, JSON.stringify(off)); }
    const errs = oldErrors.concat(pg.errors).filter(x => !/favicon/.test(JSON.stringify(x)));
    ok('no page errors / console clean through every row', errs.length === 0, JSON.stringify(errs.slice(0, 3)));
  } finally { pg.close(); }
}
/* ---- the three scenes on a phone: 915x412 landscape at DPR 2.625, CPU throttled (MP_CPU, default 4x), the game on its own requestAnimationFrame loop; frames per second over the scene beats (>= MP_FPS_MIN, default 40) ---- */
if (process.argv.includes('--perf')) {
  const { openPage } = await import('./cdp.mjs'); const sleep = ms => new Promise(r => setTimeout(r, ms));
  const CPU = +(process.env.MP_CPU || 4), FPS_MIN = +(process.env.MP_FPS_MIN || 40);
  for (const from of ['hornetsnest', 'fenroad', 'kings', 'minecart', 'storm', 'crown']) {   /* (lane C: + the three Act II scenes) */
    const pg = await openPage({ audio: false, fonts: false, speed: 0.6 });
    try {
      await pg.send('Emulation.setDeviceMetricsOverride', { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
      await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
      await pg.send('Emulation.setCPUThrottlingRate', { rate: CPU });
      await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.setHero('knight'); BK.reset({ fresh: true }); BK.trans.force(true); BK.SET.transitions = 'always'; BK.PROG.burningOpen = 1; BK.manualSimulation = true;
        BK.load(LEVELS.findIndex(l => l.id === '${from}')); BK.start(); BK.sim(20); const L = BK.L, A = L.arena, e = BK.enemies().find(q => q.t === A.boss && q.alive); BK.god = true; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200);
        const dismiss = () => { for (let k = 0; k < 12 && BK.state === 'card'; k++) { for (let i = 0; i < 4 && BK.state === 'card'; i++) { try { BK.cardTake(i); } catch (e) {} } if (BK.state === 'card') { try { BK.cardClose(); } catch (e) {} } } };
        for (let n = 0; n < 1500 && e && e.alive; n++) { BK.P.inv = 99; BK.P.hp = BK.P.maxHp; e.hp = Math.min(e.hp, 1); e.inv = 0; e.open = 9; e.passThrough = true; BKT.hurtEnemy(e, 1e6, e.x + (n % 2 ? 10 : -10), n % 3 === 0); dismiss(); if (e.alive) BK.sim(6); }
        if (L.gateAfterBoss) { for (let i = 0; i < 400 && !L.gateOpen; i++) { dismiss(); BK.sim(1); } BK.P.x = BK.gate.x; BK.P.y = BK.gate.y; }
        for (let i = 0; i < 900 && !BK.trans.tr && BK.state !== 'win'; i++) { dismiss(); BK.sim(1); }
        BK.manualSimulation = false; return 1; })()`, 600000);
      const wait = async (pred, ms) => { for (const until = Date.now() + ms; Date.now() < until;) { if (await pg.evalp(pred, 5000).catch(() => false)) return true; await sleep(100); } return false; };
      const inScene = await wait("!!(BK.trans.tr && !BK.trans.tr.loading && BK.trans.TRM.isSceneBeat(BK.trans.tr.tl.beats[BK.trans.tr.tl.i]))", 120000);
      ok('PERF ' + from + ': the page reached the scene on its own loop', inScene);
      if (inScene) {
        await pg.evalp("(() => { const a = window.__fr = { n: 0, dts: [], last: performance.now(), on: true }; const f = t => { if (!a.on) return; a.n++; a.dts.push(t - a.last); a.last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); window.__t0 = performance.now(); })()");
        await wait("!BK.trans.tr || BK.trans.TRM.phase(BK.trans.tr.tl) === 'fade'", 60000);
        const r = await pg.evalp("(() => { const a = window.__fr; a.on = false; const d = a.dts.slice().sort((x, y) => x - y); return { n: a.n, wall: (performance.now() - window.__t0) / 1000, p95: d[Math.floor(d.length * 0.95)] || 0, worst: d[d.length - 1] || 0 }; })()");
        const fps = r.n / r.wall; console.log(from + ' scene: ' + JSON.stringify({ fps: +fps.toFixed(1), p95: +r.p95.toFixed(1), worst: +r.worst.toFixed(1), secs: +r.wall.toFixed(1), cpu: CPU + 'x' }));
        ok('PERF ' + from + ': >= ' + FPS_MIN + ' fps over the scene at ' + CPU + 'x CPU on a phone viewport', fps >= FPS_MIN, fps.toFixed(1) + ' fps');
      }
      ok('PERF ' + from + ': no page errors', pg.errors.length === 0, JSON.stringify(pg.errors.slice(0, 3)));
    } finally { pg.close(); }
  }
}
const bad = rows.filter(x => !x.pass); console.log(bad.length ? bad.length + ' red of ' + rows.length : 'all ' + rows.length + ' green'); process.exit(bad.length ? 1 : 0);
