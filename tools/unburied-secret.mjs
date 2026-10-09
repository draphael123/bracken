// tools/unburied-secret.mjs - THE UNBURIED FIELD IS A SECRET (claude/unburiedsecret, Daniel 10-08).
// Three LOST BANNERS (one hidden off the road in THE HEXED FIELDS, THE BURIAL CAVERNS and THE WITCHLIGHT STAIR) open it; the silver-medal rule is gone.
//  1. GEOMETRY (node, no page): each banner is one ent in its level, stands on footing the reach fill (the slowest hero's moves, no god mode) gets to from the
//     START, is off the main route (pacing's route), outside the arena, and in clear air.
//  2. EVERY HERO takes each banner through the REAL game loop: loaded as that hero, the pickup runs in updatePlay (not a setter), it is saved on the profile
//     and counted ('LOST BANNER n/3').
//  3. THE MAP: a fresh save shows NO path and NO tip and no node (a dim spot only: BK.mapNodes().secret), UP/DOWN at the Witchlight do not step onto it;
//     2 of 3 banners -> still locked; 3 of 3 -> unlocked, the toast 'THE FIELD REMEMBERS', the ghost-path draws itself from the Witchlight (BK.mapGhost) and
//     the map's own press walks onto the field and back.
//  4. A MIGRATED SAVE keeps access: a stored save with silver on the Witchlight Stair (the old rule), or the field cleared, loads with it open; a fresh
//     save that earns silver later does NOT open it.
//  PORT=8768 node tools/unburied-secret.mjs
import assert from 'node:assert/strict';
import { LEVELS, T, LOST_BANNERS } from '../src/level.js';
import { floodReach } from '../src/reachcore.js';
import { pacing } from './pacing.mjs';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const IDS = Object.keys(LOST_BANNERS).sort();
assert.deepEqual(IDS, ['burial', 'fields', 'witchlight'], 'the three banners are in the Hexed Fields, the Burial Caverns and the Witchlight Stair');
const field = LEVELS.find(l => l.id === 'unburied');
assert.ok(field.secretBanners && !field.opensOn && field.classFor === 'reaper' && field.spurOf === 'witchlight', "the field: banner-gated (no opensOn), still the Death Knight's level, off the Witchlight");

// 1. GEOMETRY
const spots = {};
for (const id of IDS) {
  const lv = LEVELS.find(l => l.id === id), L = lv.build(), W = L.W, H = L.H;
  const b = L.ents.filter(e => e.t === 'lostbanner'); assert.equal(b.length, 1, id + ': exactly one lost banner ent'); const e = b[0]; assert.equal(e.id, id);
  assert.deepEqual([e.x, e.y], LOST_BANNERS[id]);
  const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? T.SOLID : L.grid[y * W + x];
  for (const dy of [0, -1, -2]) assert.ok(at(e.x, e.y + dy) !== T.SOLID && at(e.x, e.y + dy) !== T.SPIKE, id + ': the banner stands in clear air, row ' + (e.y + dy));
  const R = floodReach(L, T, { rides: true });
  assert.ok(R.footing.has(e.x + ',' + e.y), id + ": the reach fill (the slowest hero) gets to the banner's footing from the START");
  const plain = floodReach(L, T, { noAssist: true });
  assert.ok(plain.footing.has(e.x + ',' + e.y), id + ': ...with legs alone (no vine, mover or plank): every hero has base moves');
  const route = pacing(lv).route; let d = 1e9; for (const [rx, ry] of route) d = Math.min(d, Math.hypot(rx - e.x, ry - e.y));
  assert.ok(d >= 6, id + ': the banner is OFF the main route (' + d.toFixed(1) + ' tiles from it)');
  const A = L.arena; if (A) assert.ok(e.x * 16 < A.x0 - 80 || e.x * 16 > A.x1 + 80, id + ': never in a boss arena');
  for (const o of L.ents) if (['silver', 'check', 'gate'].includes(o.t)) assert.ok(Math.hypot(o.x - e.x, o.y - e.y) >= 4, id + ': the banner is not stacked on a ' + o.t);
  spots[id] = { x: e.x, y: e.y, route: +d.toFixed(1) };
}
console.log('geometry: ' + IDS.map(i => i + ' (' + spots[i].x + ',' + spots[i].y + ') ' + spots[i].route + ' tiles off the road').join('; '));

// 2-4. THE PAGE
const pg = await openPage({ port: +process.env.PORT || portFor(8), audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const {LEVELS, LOST_BANNERS} = await import('/src/level.js');
    const idx = id => LEVELS.findIndex(l=>l.id===id), out = { heroes: {} };
    const wipe = () => { for (const l of LEVELS) delete BKT.PROG[l.id]; delete BKT.PROG.lostBanners; delete BKT.PROG.fieldOpen; delete BKT.PROG.fieldPathDrawn; delete BKT.PROG.bossDown; BKT.PROG.bannerMig = 1; };
    const goTo = id => { BK.load(idx(id)); BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); return BKT.PROG.mapNodeId; };
    const press = key => { dispatchEvent(new KeyboardEvent('keydown', { key })); BK.sim(2); dispatchEvent(new KeyboardEvent('keyup', { key })); BK.sim(1); };
    const fieldNode = () => { const m = BK.mapNodes(), i = m.ids.indexOf('unburied'); return { locked: m.locked[i], secret: m.secret[i], ghost: m.ghost[i], hit: m.hitOrder.includes(i) }; };
    BK.manualSimulation = true;
    for (const h of ['knight','warden','pyro','paladin','pirate','reaper','geomancer','silverknight']) {
      out.heroes[h] = {};
      for (const id of Object.keys(LOST_BANNERS)) {
        wipe(); BK.setHero(h); BK.reset({fresh:true}); wipe(); BK.load(idx(id)); BK.state = 'play'; BK.god = false; BK.sim(2);
        const live = BK.banners().live.find(q => q.id === id);
        if (!live) { out.heroes[h][id] = 'no banner live'; continue; }
        const P = BK.P; P.x = live.x; P.y = live.y + 8; P.vx = 0; P.vy = 0; BK.sim(4);
        out.heroes[h][id] = BK.banners().owned.includes(id) && !!(BKT.PROG.lostBanners || {})[id] && BK.banners().live[0].got;
      }
    }
    wipe(); BK.setHero('knight'); BK.reset({fresh:true}); wipe();
    for (const id of ['fair','fields','burial','witchlight']) BKT.PROG[id] = { cleared: true, medal: 1 };
    out.fresh = { at: goTo('witchlight'), node: fieldNode(), ghost: BK.mapGhost(), tip: BK.mapTip().id };
    press('ArrowDown'); out.fresh.afterDown = BKT.PROG.mapNodeId; goTo('witchlight'); press('ArrowUp'); out.fresh.afterUp = BKT.PROG.mapNodeId; out.fresh.tip2 = BK.mapTip();
    BKT.PROG.witchlight = { cleared: true, medal: 3 }; goTo('witchlight'); press('ArrowDown'); out.fresh.silverGold = BKT.PROG.mapNodeId;
    BKT.PROG.witchlight = { cleared: true, medal: 1 };
    const take = id => { BK.load(idx(id)); BK.state = 'play'; BK.sim(2); BK.banners().pickup(id); };
    take('fields'); out.one = { owned: BK.banners().owned.length, node: fieldNode() };
    take('burial'); out.two = { owned: BK.banners().owned.length, node: fieldNode() };
    take('witchlight'); out.three = { owned: BK.banners().owned.length, node: fieldNode(), hint: BK.hint.msg, all: BK.banners().all };
    out.three.at = goTo('witchlight'); out.three.ghost0 = BK.mapGhost();
    BK.state = 'map'; BK.step(1); BK.sim(200); BK.step(1); out.three.ghost1 = BK.mapGhost();
    goTo('witchlight'); press('ArrowDown'); out.three.afterDown = BKT.PROG.mapNodeId; press('ArrowUp'); out.three.afterUp = BKT.PROG.mapNodeId;
    const loadSave = save => { localStorage.setItem('bracken.progress.0', JSON.stringify(save)); BK.loadSlot(0); return { open: !!BKT.PROG.fieldOpen, node: fieldNode() }; };
    out.migSilver = loadSave({ hero: 'knight', heroes: { knight: true }, witchlight: { cleared: true, medal: 2 } });
    goTo('witchlight'); press('ArrowDown'); out.migSilver.step = BKT.PROG.mapNodeId;
    out.migCleared = loadSave({ hero: 'knight', heroes: { knight: true }, witchlight: { cleared: true, medal: 0 }, unburied: { cleared: true } });
    out.migFresh = loadSave({ hero: 'knight', heroes: { knight: true }, witchlight: { cleared: true, medal: 1 } });
    BKT.PROG.witchlight = { cleared: true, medal: 3 }; out.migFresh.laterSilver = fieldNode();
    localStorage.removeItem('bracken.progress.0');
    /* THE BAKED MAP DRAWS NO STUB TO A GHOST SPUR: the same region baked with the spur flagged ghost has none of the stub's pale centre line the plain spur has */
    { const ART = await import('/src/art.js'); const path = [[20, 90], [100, 90], [200, 90]];
      const bake = ghost => { const nodes = [{ id: 'a', kind: 'level', level: 0, x: 100, y: 90, plate: 'left', name: 'A' }, { id: 's', kind: 'level', level: 1, x: 100, y: 112, spur: true, ghost, name: 'S' }];
        const c = ART.bakeWorldMap(320, 180, [{ x: 0, y: 0, w: 320, h: 180, nodes, path, seed: 47, style: 'haunted' }], []); const d = c.getContext('2d').getImageData(90, 96, 20, 12).data; let n = 0;
        for (let i = 0; i < d.length; i += 4) if (d[i] === 200 && d[i + 1] === 176 && d[i + 2] === 136) n++; return n; };
      out.stub = { plain: bake(false), ghost: bake(true) }; }
    return out;
  })()`);
  for (const [h, o] of Object.entries(r.heroes)) for (const id of IDS) assert.equal(o[id], true, h + ' could not take the ' + id + ' banner: ' + o[id]);
  assert.equal(r.fresh.at, 'witchlight');
  assert.deepEqual([r.fresh.node.secret, r.fresh.node.locked, r.fresh.node.ghost, r.fresh.node.hit], [true, true, true, false], 'a fresh save: the field is a dim spot only (secret), not a node you can hit or walk to');
  assert.equal(r.fresh.ghost.shown, 0, 'a fresh save draws NO ghost-path'); assert.equal(r.fresh.tip, null, 'a fresh save raises NO locked tip');
  assert.equal(r.fresh.afterDown, 'witchlight', 'DOWN at the Witchlight stepped onto a secret'); assert.equal(r.fresh.afterUp, 'witchlight'); assert.equal(r.fresh.tip2.id, null, 'pressing at the secret raised a tip');
  assert.equal(r.fresh.silverGold, 'witchlight', 'gold at the Witchlight Stair still opens the field: the medal rule must be gone');
  assert.equal(r.one.owned, 1); assert.equal(r.one.node.locked, true); assert.equal(r.two.owned, 2); assert.equal(r.two.node.locked, true, '2 of 3 banners opened the field'); assert.equal(r.two.node.secret, true);
  assert.equal(r.three.owned, 3); assert.equal(r.three.all, true); assert.equal(r.three.node.locked, false, '3 of 3 banners did not open the field'); assert.equal(r.three.node.secret, false);
  assert.equal(r.three.hint, 'THE FIELD REMEMBERS', 'no THE FIELD REMEMBERS toast');
  assert.ok(r.three.ghost1.shown >= 1 && r.three.ghost1.done, 'the ghost-path did not draw itself on the map once open: ' + JSON.stringify(r.three.ghost1));
  assert.equal(r.three.afterDown, 'unburied', "the map's press did not walk onto the open field"); assert.equal(r.three.afterUp, 'witchlight');
  assert.ok(r.migSilver.open && !r.migSilver.node.locked && r.migSilver.step === 'unburied', 'a save that held silver on the Witchlight lost the field: ' + JSON.stringify(r.migSilver));
  assert.ok(r.migCleared.open && !r.migCleared.node.locked, 'a save that cleared the field lost it');
  assert.ok(!r.migFresh.open && r.migFresh.node.locked && r.migFresh.laterSilver.locked, 'a fresh profile opened the field on silver: ' + JSON.stringify(r.migFresh));
  assert.ok(r.stub.plain >= 3 && r.stub.ghost === 0, 'the baked map must draw a dashed stub to a plain spur and NONE to a ghost (secret) spur: ' + JSON.stringify(r.stub));
  assert.deepEqual(pg.errors, []);
  console.log('The Unburied Field is a secret: ' + Object.keys(r.heroes).length + ' heroes take all three banners in the real loop; fresh save = dim spot, no path, no tip; 2/3 locked; 3/3 opens + toast + ghost-path; migrated saves keep it.');
} finally { await pg.close(); }
