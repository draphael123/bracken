// tools/gorm-unlock.mjs - THE BURNING VILLAGE OPENS ON KING GORM BEATEN IN ONE LIFE (claude/smallfix7, Daniel 11-01: "beating King Gorm
// without dying between the two phases"). In the real page, through the game's own hurtEnemy / die / save-load paths:
//   1. a clean fight (P1 spared, the burning wood, the glade, his death) -> PROG.burningOpen, the node unlocked
//   2. a death in P1 / in the burning wood (between the phases) / in the glade -> that clear does NOT open it; a flask or a revive is not
//      a death (neither calls die()); a death BEFORE the fight begins does not count; the next run (retry) can open it
//   3. an old save that had it (Stockade cleared, or the village played) keeps it; a Stockade clear on a new save does NOT open it
//   4. the Stockade's clear alone, with Gorm not beaten, leaves the node locked
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(7) });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js');
    BK.manualSimulation = true;
    const ki = LEVELS.findIndex(l => l.id === 'kings'), out = {};
    const burningLocked = () => { const g = BK.god; BK.god = false; const n = BK.mapNodes(), i = n.ids.indexOf('burning'); BK.god = g; return n.locked[i]; };
    /* a fresh Kingswood run, the way boss-fight-end starts a fight: on the King's trigger with the room live */
    const begin = () => { BK.setHero('knight'); BK.reset({ fresh: true }); BKT.PROG.stockade = { cleared: true, medal: 1, best: 400 }; BKT.PROG.burningMig = 1; BK.load(ki); BK.start(); BK.sim(10); BK.reset(); BK.P.inv = 99; BK.P.hp = BK.P.maxHp; };
    const king = () => BK.enemies().find(q => q.t === 'king' && q.alive);
    const enter = () => { const A = BK.L.arena, e = king(); for (const q of BK.enemies()) if (q !== e && !q.maxHp) q.alive = false; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); BK.sim(200); return e; };
    const blow = e => { e.hp = 1; e.open = 9; e.passThrough = true; e.mode = 'held'; e.inv = 0; BKT.hurtEnemy(e, 999, e.x - 10, false); BK.sim(30); };
    const toGlade = () => { BK.gorm().skipTo('glade'); const G = BK.L.glade; BK.tp(Math.round(G.trigger / 16) + 1, Math.round(G.floor / 16) - 1); BK.sim(200); };
    const finish = () => { let e = king(); if (e && e.stage === 'court') { blow(e); } toGlade(); e = king(); for (let n = 0; n < 40 && e && e.alive; n++) { BK.P.inv = 99; blow(e); } return !!(e && !e.alive); };
    const die = () => { BK.P.inv = 0; BKT.gormDie(); BK.sim(200); BK.reset(); BK.P.inv = 99; };

    /* 1. CLEAN */
    begin(); enter(); out.cleanLive = BKT.gormUnlock().live; out.cleanLocked0 = burningLocked(); out.cleanDead = finish(); out.cleanOpen = BKT.gormUnlock().open; out.cleanNode = burningLocked();
    /* 2a. DEATH IN P1 */
    begin(); enter(); die(); out.p1Fell = BKT.gormUnlock().fell; out.p1Dead = (enter(), finish()); out.p1Open = BKT.gormUnlock().open; out.p1Node = burningLocked();
    /* 2b. DEATH IN THE BURNING WOOD (between the phases) */
    begin(); { const e = enter(); blow(e); out.woodStage = (king() || {}).stage; out.woodLive = BKT.gormUnlock().live; die(); out.woodFell = BKT.gormUnlock().fell; out.woodDead = finish(); out.woodOpen = BKT.gormUnlock().open; }
    /* 2c. DEATH IN THE GLADE */
    begin(); { const e = enter(); blow(e); toGlade(); out.gladeLive = BKT.gormUnlock().live; die(); out.gladeFell = BKT.gormUnlock().fell; out.gladeDead = finish(); out.gladeOpen = BKT.gormUnlock().open; }
    /* 2d. A DEATH BEFORE THE FIGHT DOES NOT COUNT, and a flask is not a death */
    begin(); out.preLive = BKT.gormUnlock().live; BK.P.inv = 0; BKT.gormDie(); BK.sim(200); BK.reset(); BK.P.inv = 99; out.preFell = BKT.gormUnlock().fell; enter(); out.preDead = finish(); out.preOpen = BKT.gormUnlock().open;
    /* 2e. RETRY LATER: a run that fell, then a NEW run (the map's retry) with none */
    begin(); enter(); die(); finish(); out.retryFirst = BKT.gormUnlock().open; BK.start(); BK.sim(10); BK.reset(); BK.P.inv = 99; out.retryFell = BKT.gormUnlock().fell; enter(); out.retryDead = finish(); out.retryOpen = BKT.gormUnlock().open;

    /* 3. SAVES. A new save with the Stockade cleared: locked. An old save (no burningMig) that cleared the Stockade, or the village: open. One that did neither: locked. */
    const K = 'bracken.progress.4';
    BK.reset({ fresh: true }); const base = JSON.parse(JSON.stringify(BKT.PROG)); delete base.burningMig; delete base.burningOpen;
    const load = raw => { localStorage.setItem(K, JSON.stringify(raw)); BK.loadSlot(4); return { open: !!BKT.PROG.burningOpen, locked: burningLocked() }; };
    out.oldStockade = load({ ...base, stockade: { cleared: true, medal: 1, best: 400 } });
    out.oldVillage = load({ ...base, burning: { cleared: true } });
    out.oldNeither = load({ ...base, stockade: { best: 250 } });
    out.newStockade = load({ ...base, burningMig: 1, stockade: { cleared: true, medal: 3, best: 200 } });
    out.newStockadeKept = load({ ...base, burningMig: 1, burningOpen: 1 });
    localStorage.removeItem(K);
    return out;
  })()`, 900000);
  console.log(JSON.stringify(r));
  assert.equal(r.cleanLive, true, 'the fight is live once the King wakes in the court');
  assert.equal(r.cleanLocked0, true, 'the Burning Village is shut before Gorm falls (Stockade cleared on a new save)');
  assert.ok(r.cleanDead && r.cleanOpen && r.cleanNode === false, 'a clean fight (no death in either phase) did not open the Burning Village: ' + JSON.stringify(r));
  assert.ok(r.p1Fell && r.p1Dead && !r.p1Open && r.p1Node === true, 'a death in phase 1 still opened it');
  assert.ok(r.woodStage === 'flee' && r.woodLive && r.woodFell && r.woodDead && !r.woodOpen, 'a death in the burning wood (between the phases) still opened it: ' + JSON.stringify(r));
  assert.ok(r.gladeLive && r.gladeFell && r.gladeDead && !r.gladeOpen, 'a death in the glade still opened it');
  assert.ok(r.preLive === false && r.preFell === false && r.preDead && r.preOpen, 'a death BEFORE the fight began must not count');
  assert.ok(!r.retryFirst && r.retryFell === false && r.retryDead && r.retryOpen, 'a later retry with no death must open it');
  assert.deepEqual(r.oldStockade, { open: true, locked: false }, 'an old save that cleared the Stockade lost the village');
  assert.deepEqual(r.oldVillage, { open: true, locked: false }, 'an old save that played the village lost it');
  assert.deepEqual(r.oldNeither, { open: false, locked: true }, 'a save with neither is shut');
  assert.deepEqual(r.newStockade, { open: false, locked: true }, 'a Stockade clear on a migrated save must not open the village');
  assert.deepEqual(r.newStockadeKept, { open: true, locked: false }, 'burningOpen is saved per slot');
  assert.deepEqual(pg.errors, []);
  console.log('The Burning Village opens on King Gorm beaten in one life: clean opens, a fall in either phase or the burning wood does not, a retry can, old saves keep it, a Stockade clear alone does not.');
} finally { pg.close(); }
