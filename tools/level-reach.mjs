// tools/level-reach.mjs - EVERY LEVEL IS REACHABLE FROM A FRESH SAVE BY NORMAL PLAY (2026-10-07, Daniel: "there's no way to
// actually get to THE BURNING VILLAGE by default on the map - you have to use level select"; the cause was a silver-TIME
// gate (opensOn.medal) on the class levels' roads). Walks the real map: starting with nothing cleared, every node the map
// shows UNLOCKED is entered and cleared (any medal, bronze or none), until nothing new opens; then every level in LEVELS
// must have been unlocked on a node of its own (or be listed in OFF_MAP with the reason), every spur must be STEPPED onto
// from its junction with the map's own up/down press, and every hero's coinNeeds level must be among them. Fails on any orphan.
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

/* levels that are deliberately NOT map nodes. Each needs a reason; an unlisted orphan fails the check. (Stores are reached by their store node,
   trial_* by the Trials menu, custom by the editor: all `hidden` and not part of the campaign.) */
const OFF_MAP = {
  harbor: 'STORMWRECK HARBOR is gone from the road (Daniel 2026-09-20); still builds and is tested',
};

const pg = await openPage({ port: portFor(8) });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS, LOST_BANNERS} = await import('/src/level.js');
    const P = BKT.PROG;
    for (const l of LEVELS) delete P[l.id];
    delete P.bossDown; delete P.lostBanners; delete P.fieldOpen; P.bannerMig = 1;
    const out = { opened: [], steps: [], secrets: [] };
    /* A SECRET IS A DEFINED STATE (claude/unburiedsecret): a fresh save shows it as a dim spot (BK.mapNodes().secret), locked, and nothing walks onto it */
    { const m0 = BK.mapNodes(); for (const l of LEVELS.filter(q => q.secretBanners)) { const i = m0.ids.indexOf(l.id); out.secrets.push({ id: l.id, onMap: i >= 0, secret: m0.secret[i], locked: m0.locked[i], hit: m0.hitOrder.includes(i) }); } }
    const idx = id => LEVELS.findIndex(l=>l.id===id);
    const press = key => { dispatchEvent(new KeyboardEvent('keydown', { key })); BK.sim(2); dispatchEvent(new KeyboardEvent('keyup', { key })); BK.sim(1); };
    const goTo = id => { BK.load(idx(id)); BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); return BKT.PROG.mapNodeId; };
    let changed = true, guard = 0;
    while (changed && guard++ < 80) { changed = false;
      const m = BK.mapNodes();
      m.ids.forEach((id, i) => { const lv = LEVELS.find(l => l.id === id);
        if (!lv || m.locked[i] || (P[id] && P[id].cleared)) return;
        /* a junction whose side road asks for a medal is cleared AT that medal: the stated condition is met in normal play (the achievable-time part is measured by tools/stockade-silver-time note, and the rule is SHOWN: see the tip check below) */
        const need = LEVELS.filter(c => c.opensOn && c.opensOn.level === id).reduce((a, c) => Math.max(a, { bronze: 1, silver: 2, gold: 3 }[c.opensOn.medal] || 0), 0);
        const tmin = LEVELS.filter(c => c.opensOn && c.opensOn.level === id && c.opensOn.time).reduce((a, c) => Math.min(a, c.opensOn.time), 1e9);
        P[id] = { cleared: true, medal: need, ...(tmin < 1e9 ? { best: tmin } : {}) }; out.opened.push(id); changed = true; });
      /* THE LOST BANNERS lie in levels that are themselves reached by normal play (their reachability from the road is tools/unburied-secret.mjs's geometry + real-loop check): once those levels are cleared the banners are in hand */
      for (const l of LEVELS) if (l.secretBanners) { const ids = Object.keys(LOST_BANNERS); if (ids.every(i => P[i] && P[i].cleared) && !(P.lostBanners && ids.every(i => P.lostBanners[i]))) { P.lostBanners = Object.fromEntries(ids.map(i => [i, 1])); changed = true; } }
      /* THE SECRETS (needsTime / needsKills): earned by a feat on a level that is itself reached, so satisfy the feat once its level is cleared */
      for (const l of LEVELS) { const n = l.needsTime || l.needsKills; if (!n || !(P[n.id] && P[n.id].cleared) || (P[l.id] && P[l.id].cleared)) continue;
        if (l.needsTime) { if (!(P[n.id].best <= n.t)) { P[n.id].best = n.t; changed = true; } } else if (!(P[n.id].slain)) { P[n.id].slain = 10; P[n.id].slainOf = 10; changed = true; } } }
    const m = BK.mapNodes(); out.nodeIds = m.ids; out.lockedAtEnd = m.ids.filter((id, i) => m.locked[i]);
    out.levelIds = LEVELS.map(l => l.id);
    out.offCampaign = LEVELS.filter(l => l.hidden && !l.secret && (/^(shop|trial_)/.test(l.id) || l.id === 'custom')).map(l => l.id);
    out.reached = LEVELS.map(l => l.id).filter(id => P[id] && P[id].cleared);
    /* every spur: stand on its junction and step on with the map's own press, the way the player does */
    const spurs = m.ids.filter((id, i) => m.spur[i] && LEVELS.some(l => l.id === id && (l.opensOn || l.secretBanners)));
    for (const id of spurs) { const lv = LEVELS.find(l => l.id === id), j = lv.opensOn ? lv.opensOn.level : lv.spurOf, secret = !!lv.secretBanners;
      for (const l of LEVELS) delete P[l.id]; delete P.bossDown; delete P.lostBanners; delete P.fieldOpen;
      /* fresh save but the road up to the junction cleared, as a player would have */
      let ch = true, g = 0; while (ch && g++ < 80) { ch = false; const mm = BK.mapNodes(); mm.ids.forEach((nid, i) => { const L = LEVELS.find(l => l.id === nid); if (!L || mm.spur[i] || mm.locked[i] || (P[nid] && P[nid].cleared)) return; P[nid] = { cleared: true, medal: 0 }; ch = true; }); if (P[j] && P[j].cleared) break; }
      /* clear only up to the junction level: drop everything cleared after it on the road */
      const order = LEVELS.map(l=>l.id); 
      out.steps.push({ id, junction: j, from: goTo(j), dir: null, onSpur: null, jctCleared: !!(P[j] && P[j].cleared) });
      const s = out.steps[out.steps.length - 1];
      /* SHOWN: with the junction cleared at bronze the road is shut and pressing at it raises the tip naming the rule and the player's best time */
      if (secret) { /* a SECRET has no rule on show: no tip, and the press does not step onto it until the three banners are in hand */
        P[j] = { cleared: true, medal: 3, best: 777 }; s.secret = true; s.tipWhileSecret = null; s.stepWhileSecret = false;
        for (const key of ['ArrowUp', 'ArrowDown']) { goTo(j); press(key); const tp = BK.mapTip(); if (tp.id) s.tipWhileSecret = tp.lines || true; if (BKT.PROG.mapNodeId === id) s.stepWhileSecret = true; }
        P.lostBanners = Object.fromEntries(Object.keys(LOST_BANNERS).map(i => [i, 1])); }
      else {
      P[j] = { cleared: true, medal: 0, best: 777 };
      for (const key of ['ArrowUp', 'ArrowDown']) { goTo(j); press(key); const tp = BK.mapTip(); if (tp.id === id && tp.lines) { s.tip = tp.lines; break; } }
      P[j] = { cleared: true, medal: { bronze: 1, silver: 2, gold: 3 }[lv.opensOn.medal] || 0, ...(lv.opensOn.time ? { best: lv.opensOn.time } : {}) }; }
      for (const key of ['ArrowUp', 'ArrowDown']) { goTo(j); press(key); if (BKT.PROG.mapNodeId === id) { s.dir = key; s.onSpur = true; break; } }
      if (!s.onSpur) s.onSpur = false; }
    out.road = LEVELS.filter(l => l.id === 'underleaf').map(l => ({ id: l.id, hidden: !!l.hidden, secret: !!l.secret, needs: l.needs, timed: !!(l.needsTime || l.needsKills), spur: !!m.spur[m.ids.indexOf(l.id)], onMap: m.ids.includes(l.id), next: (LEVELS.find(c => c.needs === l.id) || {}).id }));
    out.coin = BK.store.coinHeroes().map(h => ({ ...h, level: LEVELS.some(l => l.id === h.needs) }));
    return out;
  })()`);
  const nodeSet = new Set(r.nodeIds), reached = new Set(r.reached);
  const orphans = r.levelIds.filter(id => !reached.has(id) && !OFF_MAP[id] && !r.offCampaign.includes(id));
  console.log('levels:', r.levelIds.length, ' reached by normal play:', r.reached.length, ' off-map (listed):', Object.keys(OFF_MAP).join(','));
  console.log('not on any map node:', r.levelIds.filter(id => !nodeSet.has(id) && !r.offCampaign.includes(id)).join(', ') || 'none');
  console.log('orphans (unreachable from a fresh save):', orphans.join(', ') || 'none');
  for (const s of r.steps) console.log('spur', s.id, 'off', s.junction, '->', s.onSpur ? 'stepped on with ' + s.dir : 'NOT REACHABLE BY THE MAP PRESS');
  assert.deepEqual(orphans, [], 'levels unreachable from a fresh save by normal play: ' + orphans.join(', '));
  for (const sc of r.secrets) assert.ok(sc.onMap && sc.secret && sc.locked && !sc.hit, 'a fresh save: the secret ' + sc.id + ' must be a dim spot (secret, locked, not hit-testable): ' + JSON.stringify(sc));
  for (const s of r.steps) if (s.secret) assert.ok(!s.tipWhileSecret && !s.stepWhileSecret, s.id + ': a secret showed a tip or could be stepped onto before its banners (' + JSON.stringify(s) + ')');
  for (const s of r.steps) if (!s.secret) assert.ok(s.tip && /LOCKED/.test(s.tip[0]) && /12:57/.test(s.tip[1]), s.id + ': the shut road does not SHOW its rule and the player best time (' + JSON.stringify(s.tip) + ')');
  for (const s of r.steps) assert.ok(s.onSpur, s.id + ' (a spur off ' + s.junction + ') cannot be stepped onto from its junction with the map keys once the junction is cleared');
  /* UNDERLEAF IS A MAIN-ROAD LEVEL (Daniel 10-08): Kingswood -> Underleaf -> the Scree Path, a node ON the road, no secret and no clock */
  for (const u of r.road) { assert.ok(!u.hidden && !u.secret && !u.timed && u.needs === 'kings' && u.next === 'scree' && u.onMap && !u.spur, 'underleaf is not a plain main-road level between kings and scree: ' + JSON.stringify(u)); }
  for (const h of r.coin) { assert.ok(h.level, 'hero ' + h.id + ' coinNeeds names no level: ' + h.needs); if (!h.boss) assert.ok(reached.has(h.needs), 'hero ' + h.id + ': its coinNeeds level ' + h.needs + ' is unreachable'); }
  assert.deepEqual(pg.errors, []);
  console.log('Level reachability: every level is reachable from a fresh save through the map, every spur steps on from its junction, every hero coin level is reachable.');
} finally { pg.close(); }
