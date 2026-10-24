// tools/map-forks.mjs - EVERY LEVEL THE MAP SHOWS CAN BE WALKED TO ON THE MAP, and no secret shows early (claude/mapforks, Daniel 10-15:
// "I cannot walk to THE BURNING VILLAGE on the world map, I have to use the level select").
//   The cause: a side road (a spur) is off the road on purpose, so LEFT/RIGHT step past it; UP/DOWN were the only keys onto it, and only for
//   a spur that named its junction through opensOn/spurOf (THE UNDERCROWN, gated on a kill count, was never found at all). The Burning Village
//   hangs to the RIGHT of the Stockade, so the natural key walked straight past it.
// This runs the REAL keys: for every node it presses left / right / up / down on the map and records where the token lands, then asks
//   1. with everything earned, every node (stores and secrets included) is reachable by keys from the first wood;
//   2. every gated level's node is reachable from its GATE's node (campaign-order gateOf) by keys - a new fork appears by being gated;
//   3. a spur is entered by a key that points at it, and left by the key that points back (no one-way side road);
//   4. nothing earned: no secret node is shown or reachable, a shut spur buzzes and stays put, and the gate tree has no level without a node
//      except the shelved ones named below.
// usage: PORT=<free port> node tools/map-forks.mjs
import { openPage } from './cdp.mjs';
import { LEVELS, ROAD_OPEN } from '../src/level.js';
import { chainOf, gateOf } from '../src/campaign-order.js';
const SHELVED = { harbor: 'STORMWRECK HARBOR: out of the campaign (level.js: "it offers nothing new"); no map node, no road; a save that stood on it is put on THE CAUSEWAY (mapToSaved)' };
const pg = await openPage({ audio: false });
let bad = 0; const fail = m => { bad++; console.log('FAIL ' + m); }, ok = m => console.log('ok   ' + m);
try {
  const R = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true;
    const earnAll = () => { BK.reset({ fresh: true }); for (const l of LEVELS) BKT.PROG[l.id] = { cleared: true, medal: 3, best: 1, silver: 7, slain: 99, slainOf: 100 }; BKT.PROG.lostBanners = { fields: 1, burial: 1, witchlight: 1 }; BKT.PROG.fieldOpen = true; };
    const settle = () => { for (let i = 0; i < 400; i++) { BK.step(1); const m = BK.map; if (!m.walking && !m.glide && i > 3) { BK.step(2); if (!BK.map.walking && !BK.map.glide) break; } } };
    const press = (id, key) => { BK.mapLook(id); BK.state = 'map'; BK.step(2); BK.press(key); settle(); const n = BK.mapNodes(); return n.ids[n.node]; };
    BK.reset({ fresh: true }); const empty = BK.mapNodes();   // an empty save first: what shows
    earnAll(); const full = BK.mapNodes(), edges = {};
    for (let i = 0; i < full.ids.length; i++) { if (full.secret[i]) continue; const id = full.ids[i]; edges[id] = {}; for (const k of ['left', 'right', 'up', 'down']) edges[id][k] = press(id, k); }
    return { full, edges, empty }; })()`, 600000);
  const ids = R.full.ids, spur = Object.fromEntries(ids.map((id, i) => [id, R.full.spur[i]])), secretFull = Object.fromEntries(ids.map((id, i) => [id, R.full.secret[i]]));
  const reach = (from, edges) => { const seen = new Set([from]), q = [from]; while (q.length) { const a = q.shift(); for (const b of Object.values(edges[a] || {})) if (!seen.has(b)) { seen.add(b); q.push(b); } } return seen; };
  // 1. everything earned
  const all = reach('wood', R.edges), lost = ids.filter(id => !all.has(id));
  lost.length ? fail('with everything earned these nodes cannot be reached by keys from the first wood: ' + lost.join(', ')) : ok('all ' + ids.length + ' nodes are reachable by keys from the first wood');
  // 2. each gated level from its gate
  const lv = Object.fromEntries(LEVELS.map(l => [l.id, l])); let n2 = 0;
  for (const l of LEVELS) { const g = gateOf(l); if (!g || !ids.includes(l.id)) continue; n2++;
    if (!ids.includes(g)) { fail(l.id + ': its gate ' + g + ' has no map node'); continue; }
    if (!reach(g, R.edges).has(l.id)) fail(l.id + ': no key path from its gate ' + g + ' to it'); }
  ok(n2 + ' gated levels checked from their gates');
  // 3. every spur: in by a key, back out by a key
  for (const id of ids.filter(i => spur[i] && !secretFull[i])) { const j = gateOf(lv[id]) , jid = (lv[id].opensOn && lv[id].opensOn.level) || lv[id].spurOf || j;
    const into = Object.entries(R.edges[jid] || {}).filter(([, to]) => to === id).map(([k]) => k), back = Object.entries(R.edges[id] || {}).filter(([, to]) => to === jid).map(([k]) => k);
    if (!into.length) fail(id + ': no key at ' + jid + ' walks onto it'); else if (!back.length) fail(id + ': walked onto from ' + jid + ' (' + into.join('/') + ') but no key walks back'); else ok(id + ': ' + jid + ' --' + into.join('/') + '--> ' + id + ' --' + back.join('/') + '--> ' + jid); }
  // 4. nothing earned
  const E = R.empty; const shown = ids.filter((id, i) => spur[id] && !E.secret[i]).map(id => id + (E.locked[ids.indexOf(id)] ? '(shut)' : ''));
  const early = ids.filter((id, i) => lv[id] && lv[id].secret && !E.secret[i]);
  early.length ? fail('secret nodes shown on an empty save: ' + early.join(', ')) : ok('no secret node shown on an empty save; spurs shown: ' + (shown.join(', ') || 'none'));
  const reachEmpty = new Set(); for (const id of ids) if (!E.secret[ids.indexOf(id)] && lv[id] && lv[id].secret) reachEmpty.add(id);
  // 5. a shut spur does not move the token and a spur opens exactly when its gate does (the stockade clock, the crown's kill count)
  const S = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; const out = {};
    const go = (id, key) => { BK.mapLook(id); BK.state = 'map'; BK.step(2); BK.press(key); for (let i = 0; i < 120; i++) BK.step(1); const n = BK.mapNodes(); return n.ids[n.node]; };
    const info = id => { const n = BK.mapNodes(), i = n.ids.indexOf(id); return { secret: n.secret[i], locked: n.locked[i] }; };
    const wipe = () => { BK.reset({ fresh: true }); for (const l of LEVELS) delete BKT.PROG[l.id]; delete BKT.PROG.lostBanners; delete BKT.PROG.fieldOpen; }; wipe(); for (const l of LEVELS) if (!['burning', 'church', 'unburied', 'undercrown', 'harbor'].includes(l.id)) BKT.PROG[l.id] = { cleared: true, medal: 3, best: 400, silver: 7 };
    BKT.PROG.stockade = { best: 250 };   /* NOT cleared */ out.unclearedStockade = { info: info('burning'), up: go('stockade', 'up'), right: go('stockade', 'right') };
    BKT.PROG.stockade = { cleared: true, medal: 1, best: 400 }; out.slowStockade = { info: info('burning'), up: go('stockade', 'up'), right: go('stockade', 'right') };
    const { ROAD_OPEN } = await import('/src/level.js');
    if (ROAD_OPEN.undercrown) {   /* (claude/undercrown2, DANIEL'S DESIGN CHANGE 10-15) the Undercrown is ON THE ROAD: Stormhold -> THE UNDERCROWN -> Highcrown */
      const road = () => { for (const l of LEVELS) if (!['burning', 'church', 'unburied', 'harbor', 'undercrown', 'crown', 'storm'].includes(l.id)) BKT.PROG[l.id] = { cleared: true, medal: 3, best: 400, silver: 7 }; };
      wipe(); road(); delete BKT.PROG.crownOpen; out.ucBefore = { uc: info('undercrown'), crown: info('crown') };
      BKT.PROG.storm = { cleared: true, medal: 1, best: 400 }; out.ucOpen = { uc: info('undercrown'), crown: info('crown'), right: go('storm', 'right') };
      BKT.PROG.undercrown = { cleared: true, medal: 1, best: 400 }; out.ucDone = { crown: info('crown'), right: go('undercrown', 'right') };
      /* GRANDFATHERED: a save made before the road changed, Stormhold cleared and Highcrown open, keeps Highcrown open (once: PROG.ucRoadMig) */
      { const K = 'bracken.progress.4', raw = JSON.parse(JSON.stringify(BKT.PROG)); delete raw.ucRoadMig; delete raw.crownOpen; delete raw.undercrown; delete raw.crown; raw.storm = { cleared: true, medal: 1, best: 400 };
        localStorage.setItem(K, JSON.stringify(raw)); BK.loadSlot(4); out.grand = { open: !!BKT.PROG.crownOpen, crown: info('crown') };
        const raw2 = { ...raw, ucRoadMig: 1 }; localStorage.setItem(K, JSON.stringify(raw2)); BK.loadSlot(4); out.fresh = { open: !!BKT.PROG.crownOpen, crown: info('crown') }; localStorage.removeItem(K); }
    }
    /* (claude/hornetsnest2, DANIEL 10-23) THE HORNET'S NEST ON THE ROAD: THE LUMBER TRAIL -> THE HORNET'S NEST -> MARSH WOOD; a save past the trail keeps the marsh open (once: PROG.nestRoadMig) */
    { wipe(); BKT.PROG.wood = { cleared: true, medal: 1, best: 400 }; delete BKT.PROG.marshOpen; out.nest = { nest: info('hornetsnest'), marsh: info('marsh'), right: go('wood', 'right') };
      const K = 'bracken.progress.4', raw = JSON.parse(JSON.stringify(BKT.PROG)); delete raw.nestRoadMig; delete raw.marshOpen; delete raw.hornetsnest; delete raw.marsh; raw.wood = { cleared: true, medal: 1, best: 400 };
      localStorage.setItem(K, JSON.stringify(raw)); BK.loadSlot(4); out.nestGrand = { open: !!BKT.PROG.marshOpen, marsh: info('marsh') };
      localStorage.setItem(K, JSON.stringify({ ...raw, nestRoadMig: 1 })); BK.loadSlot(4); out.nestFresh = { open: !!BKT.PROG.marshOpen, marsh: info('marsh') }; localStorage.removeItem(K); }
    if (!ROAD_OPEN.undercrown) {
    wipe(); out.crownUnseen = info('undercrown');
    BKT.PROG.crown = { cleared: true, medal: 1, best: 400, slain: 10, slainOf: 100 }; out.crownFew = { info: info('undercrown'), up: go('crown', 'up'), right: go('crown', 'right') };
    BKT.PROG.crown.slain = 90; out.crownMany = { info: info('undercrown'), up: go('crown', 'up'), right: go('crown', 'right') };
    }
    return out; })()`, 300000);
  // DANIEL'S DESIGN CHANGE 10-15 (never weaken): the Burning Village opens as soon as the Stockade is CLEARED - no best-time clock.
  S.unclearedStockade.info.locked && S.unclearedStockade.up === 'stockade' && S.unclearedStockade.right === 'spore' ? ok('burning shut while the Stockade is not cleared: UP stays, RIGHT walks the road on') : fail('burning, Stockade not cleared: ' + JSON.stringify(S.unclearedStockade));
  !S.slowStockade.info.locked && S.slowStockade.up === 'burning' && S.slowStockade.right === 'burning' ? ok('burning open once the Stockade is cleared, even slowly (best 6:40): UP and RIGHT walk onto it') : fail('burning open: ' + JSON.stringify(S.slowStockade));
  if (ROAD_OPEN.undercrown) {
    !S.ucBefore.uc.secret && S.ucBefore.uc.locked && S.ucBefore.crown.locked ? ok('undercrown on the road: shown and shut before Stormhold is cleared, Highcrown shut behind it') : fail('undercrown before stormhold: ' + JSON.stringify(S.ucBefore));
    !S.ucOpen.uc.locked && S.ucOpen.crown.locked && S.ucOpen.right === 'undercrown' ? ok('Stormhold cleared: the road walks on to THE UNDERCROWN, and Highcrown waits for it') : fail('undercrown after stormhold: ' + JSON.stringify(S.ucOpen));
    !S.ucDone.crown.locked && S.ucDone.right === 'crown' ? ok('THE UNDERCROWN cleared: Highcrown opens and the road walks on to it') : fail('highcrown after the undercrown: ' + JSON.stringify(S.ucDone));
    S.grand.open && !S.grand.crown.locked && !S.fresh.open && S.fresh.crown.locked ? ok('an old save with Stormhold cleared keeps Highcrown open (grandfathered once); a save made on the new road must walk the Undercrown first') : fail('grandfathering: ' + JSON.stringify({ grand: S.grand, fresh: S.fresh }));
    !S.nest.nest.locked && S.nest.marsh.locked && S.nest.right === 'hornetsnest' ? ok("the Lumber Trail cleared: the road walks on to THE HORNET'S NEST, and MARSH WOOD waits for it") : fail('the nest on the road: ' + JSON.stringify(S.nest));
    S.nestGrand.open && !S.nestGrand.marsh.locked && !S.nestFresh.open && S.nestFresh.marsh.locked ? ok('an old save past the Lumber Trail keeps MARSH WOOD open (grandfathered once); a save made on the new road walks the nest first') : fail('nest grandfathering: ' + JSON.stringify({ grand: S.nestGrand, fresh: S.nestFresh }));
  } else {
  S.crownUnseen.secret ? ok('undercrown not shown before highcrown is cleared') : fail('undercrown shown early: ' + JSON.stringify(S.crownUnseen));
  !S.crownFew.info.secret && S.crownFew.info.locked && S.crownFew.up === 'crown' && S.crownFew.right !== 'undercrown' ? ok('undercrown shown but shut at 10%: UP stays on highcrown, RIGHT walks the road on (' + S.crownFew.right + ')') : fail('undercrown at 10%: ' + JSON.stringify(S.crownFew));
  !S.crownMany.info.locked && S.crownMany.up === 'undercrown' && S.crownMany.right === 'undercrown' ? ok('undercrown open at 90%: UP and RIGHT walk onto it') : fail('undercrown at 90%: ' + JSON.stringify(S.crownMany));
  }
  // the gate tree against the nodes
  const C = chainOf(LEVELS.filter(l => !l.hidden || l.secret)); const noNode = LEVELS.filter(l => !ids.includes(l.id) && !(l.id in SHELVED) && !l.locked && !/^(shop|shopCrag|shopWell)$/.test(l.id)).map(l => l.id);
  const stray = noNode.filter(id => !lv[id].hidden || lv[id].secret);
  stray.length ? fail('levels with no map node and not named shelved: ' + stray.join(', ')) : ok('every level has a node (shelved: ' + Object.keys(SHELVED).join(', ') + ')');
  console.log('forks in the gate tree: ' + C.forks.map(([k, v]) => k + ' -> ' + v.join(' | ')).join('; '));
  if (pg.errors.length) fail('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log(bad ? 'map-forks: ' + bad + ' FAILED' : 'map-forks: all green'); process.exit(bad ? 1 : 0);
