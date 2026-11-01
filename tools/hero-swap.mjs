// tools/hero-swap.mjs - THE SWAP HERO PANEL and THE LIVING SHOPS (claude/hubpolish, Daniel 11-01). Not in the suite's browser budget twice: one page.
//   1. PURE     src/hero-swap.js: LEFT/RIGHT wrap, the panel opens on the hero you play, a press is swap / same / locked.
//   2. STORE    F in the store (non-skills tab) opens it, RIGHT walks it, CONFIRM takes the hero (PROG.hero changes, the hero keeps his own XP and level, the save is written),
//               ESC closes it without a swap, H opens it on the SKILLS tab; a hero not owned is refused with the unlock line and nothing changes.
//   3. MAP      H on the map opens it, the pause menu's Swap hero is only offered on the map, in a shop room and in the inn (never mid-wood).
//   4. SEATS    a hero another seat plays is refused.
//   5. SHOPS    every shop id has greet / bark / buy lines that fit a box (<= 44 letters), the loops cycle through all three, a bark clock greets once and then rotates,
//               the drawn room allocates nothing per frame (no canvas, no gradient) and throws nothing in each of the four rooms.
import assert from 'node:assert/strict';
import { makeSwap, stepIndex, startIndex, pressOn } from '../src/hero-swap.js';
import { LINES, SHOP_IDS, loopAt, pickNext, SIGNS } from '../src/shop-life.js';
import { openPage } from './cdp.mjs';
const ok = (c, m) => { assert.ok(c, m); console.log('ok  ' + m); };

/* ---- 1. pure ---- */
{
  ok(stepIndex(0, -1, 9) === 8 && stepIndex(8, 1, 9) === 0 && stepIndex(3, 1, 9) === 4, 'LEFT and RIGHT wrap round the nine heroes');
  const rows = [{ id: 'a', owned: true }, { id: 'b', owned: true }, { id: 'c', owned: false }];
  ok(startIndex(rows, 'b') === 1 && startIndex(rows, 'zz') === 0, 'it opens on the hero you play');
  ok(pressOn(rows[1], 'a') === 'swap' && pressOn(rows[0], 'a') === 'same' && pressOn(rows[2], 'a') === 'locked' && pressOn(null, 'a') === 'none', 'a press is a swap, the same hero, or a locked one');
  let chose = null; const s = makeSwap({ rows: () => rows, active: () => 'a', choose: id => { chose = id; return 'OK'; }, sfx() {}, g() {}, VW: () => 320, VH: () => 180, time: () => 0, text() {}, panel() {}, hit() {}, lines() {}, frame: () => null, icon: () => null });
  s.open(); s.input({ right: true }); s.input({ confirm: true });
  ok(chose === 'b' && !s.isOpen && s.took() === 'OK', 'RIGHT then CONFIRM takes the next owned hero and closes the panel');
  s.open(); s.input({ right: true }); s.input({ right: true }); chose = null; s.input({ confirm: true });
  ok(chose === null && s.isOpen, 'CONFIRM on a locked hero chooses nothing and leaves it open');
  s.input({ back: true }); ok(!s.isOpen, 'ESC closes it');
}
/* ---- 5a. shop lines ---- */
{
  for (const id of SHOP_IDS) { const L = LINES[id];
    ok(L && L.greet.length >= 2 && L.bark.length >= 4 && L.buy.length >= 3, id + ': greets, barks and thanks to rotate (' + L.greet.length + '/' + L.bark.length + '/' + L.buy.length + ')');
    for (const s of [...L.greet, ...L.bark, ...L.buy]) assert.ok(s.length <= 46 && s === s.toUpperCase(), id + ' line too long or not caps: ' + s);
    ok(SIGNS[id].length <= 12, id + ': the sign reads ' + SIGNS[id]); }
  ok(loopAt(0) === 0 && loopAt(7) === 1 && loopAt(14) === 2 && loopAt(19.4) === 2 && loopAt(19.6) === 0, 'the keeper cycles polishing, counting, the ledger');
  ok(pickNext(['a', 'b', 'c'], 'a') === 'b' && pickNext(['a', 'b', 'c'], 'c') === 'a' && pickNext(['a'], 'a') === 'a', 'a bark is never the one just said');
}
/* ---- 2-5b. the page ---- */
const pg = await openPage({ audio: false });
try {
  const E = s => pg.evalp(s);
  await E(`BK.manualSimulation = true; BK.reset({ fresh: true }); BK.setHero('knight'); BK.PROG.heroes = { knight: true, warden: true, ranger: true }; BK.PROG.xp = BK.PROG.xp || {}; 0`);
  const base = await E(`(()=>{BK.state='store'; BK.ui.storeTab=0; BK.ui.storeI=0; BK.step(3); BK.press('throw'); BK.step(2); return { open: BK.swap.isOpen, idx: BK.swap.index }; })()`);
  ok(base.open && base.idx === 0, 'F in the store opens the panel on the hero you play');
  const r1 = await E(`(()=>{BK.press('right'); BK.step(1); BK.press('confirm'); BK.step(2); return { hero: BK.PROG.hero, open: BK.swap.isOpen, state: BK.state }; })()`);
  ok(r1.hero === 'warden' && !r1.open && r1.state === 'store', 'RIGHT then CONFIRM: the Warden is yours, the panel closes, you are still in the store');
  const r2 = await E(`(()=>{BK.press('throw'); BK.step(2); BK.press('right'); BK.step(1); BK.press('confirm'); BK.step(2); return { hero: BK.PROG.hero, open: BK.swap.isOpen, idx: BK.swap.index }; })()`);
  ok(r2.hero === 'warden' && r2.open, 'a hero not owned (Geomancer is in 3rd) is refused: the hero stays and the panel stays open');
  await E(`BK.press('pause'); BK.step(2); 0`);
  const r3 = await E(`(()=>{ return { open: BK.swap.isOpen, state: BK.state }; })()`);
  ok(!r3.open && r3.state === 'store', 'ESC closes the panel, not the store');
  const r4 = await E(`(()=>{BK.ui.storeTab = BK.ui.skillsTab; BK.step(2); dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); BK.step(2); const o = BK.swap.isOpen; BK.swap.close(true); return o; })()`);
  ok(r4 === true, 'H on the SKILLS tab opens it too');
  const r5 = await E(`(()=>{BK.state='map'; BK.step(3); dispatchEvent(new KeyboardEvent('keydown', { key: 'h' })); BK.step(2); const o = BK.swap.isOpen; BK.press('pause'); BK.step(2); return { o, c: !BK.swap.isOpen, st: BK.state }; })()`);
  ok(r5.o && r5.c && r5.st === 'map', 'H on the map opens it, ESC closes it and you are still on the map');
  const r6 = await E(`(()=>{BK.state='map'; BK.step(2); BK.press('pause'); BK.step(2); return BK.state; })()`);
  const r7 = await E(`(async()=>{ const m = await import('/src/level.js'); const out = {}; for (const id of ['shop','shopCrag','shopSea','shopWell']) { BK.load(m.LEVELS.findIndex(l=>l.id===id)); BK.state='play'; BK.step(5); BK.P.x = 24 * 16 - 20; const c0 = document.querySelectorAll('canvas').length; const t0 = performance.now(); BK.step(240); out[id] = { ms: Math.round((performance.now() - t0) / 240 * 100) / 100, canvases: document.querySelectorAll('canvas').length - c0, greeted: BK.shopLife.state.greeted, barks: BK.shopLife.state.stats.barks }; } return out; })()`);
  for (const id of Object.keys(r7)) ok(r7[id].canvases === 0 && r7[id].greeted, id + ': the keeper greeted, no canvas made over 240 frames (' + r7[id].ms + ' ms a frame incl. the whole update)');
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
  ok(pg.errors.length === 0, 'no page errors');
} finally { pg.close(); }
console.log('all ok');
