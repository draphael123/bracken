// tools/ui-hud.mjs - UI POLISH A (claude/uihud): THE HUD's TOAST QUEUE + SAFE ZONE, THE STATUS ICONS, THE IDLE FADE, THE GRAPHICS PRESETS, THE
// ACCESSIBILITY TAB AND THE PAUSE MENU.   node tools/ui-hud.mjs
//   1. (static, src/ui-hud.js) the queue: a toast arriving over another WAITS (never replaces it), shows at least minShow, the same text only
//      refreshes, at most 3 wait, a stale one is dropped, a level change clears it
//   2. (static) the safe zone: right of the left cluster, under the coin panel, above the boss bar; the box never overlaps the HUD's rects
//      (the real ones, below) and falls to the foot only above the boss bar; the idle fade settles and recovers; the presets round-trip
//   3. (page, the Sunken Caravan) three toasts at once come out one at a time, in order, and every frame's box stays out of hudRects and the
//      water/flood row; the status is an ICON (shade, then the sun's bite by stage) and the words SHADE / STORM / BURNING / HOTTER /
//      SCORCHING / SKIN / DRY / FLOOD / HORN are never drawn; the CHANGE is said once as a toast
//   4. (page) the coins, the clock and the XP line fade after they last changed and come back when they change; Graphics LOW / MEDIUM /
//      HIGH set the fields together and say CUSTOM after a single change; ACCESS holds the timer, shake, flashes and text size; the
//      pause menu opens on resume / map / skills / settings / return to map and asks twice before it leaves a level
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import * as U from '../src/ui-hud.js';

/* ---- 1. the queue ---- */
{ const q = U.toastQueue();
  U.toastFeed(q, 'A', 4); assert.equal(q.cur.msg, 'A', 'the first message shows at once');
  U.toastFeed(q, 'B', 4); assert.equal(q.cur.msg, 'A', 'a second message does not replace it'); assert.deepEqual(q.wait.map(t => t.msg), ['B'], 'it waits');
  U.toastFeed(q, 'B', 3.98); assert.equal(q.wait.length, 1, 'the same text again is not queued twice');
  U.toastFeed(q, 'A', 4.1); assert.equal(q.wait.length, 1, 'the one on screen set again only refreshes');
  for (let i = 0; i < 60; i++) U.toastTick(q, 1 / 60); assert.equal(q.cur.msg, 'A', 'A has not had its minimum yet');
  for (let i = 0; i < 90; i++) U.toastTick(q, 1 / 60); assert.equal(q.cur.msg, 'B', 'A shows its minimum, then a short tail, then B comes up');
  for (let i = 0; i < 700; i++) U.toastTick(q, 1 / 60); assert.equal(q.cur, null, 'and it ends');
  for (const m of ['1', '2', '3', '4', '5', '6']) U.toastPush(q, m, 3); assert.equal(q.wait.length, U.TOAST.maxWait, 'at most three wait'); assert.deepEqual(q.wait.map(t => t.msg), ['4', '5', '6'], 'the oldest waiting one is the one dropped');
  U.toastClear(q); assert.equal(q.cur, null); assert.equal(q.wait.length, 0);
  U.toastPush(q, 'X', 3); U.toastPush(q, 'Y', 3); for (let i = 0; i < 60 * 9; i++) { q.clock += 1 / 60; } q.cur.ttl = 0; U.toastTick(q, 1 / 60); assert.equal(q.cur, null, 'a message that waited past the stale limit is dropped, not shown late');
  assert(U.toastAlpha({ ttl: 4, age: 0.05 }) < 0.5 && U.toastAlpha({ ttl: 4, age: 2 }) === 1 && U.toastAlpha({ ttl: 0.1, age: 3 }) < 0.3, 'it fades in and out'); }

/* ---- 2. the zone ---- */
{ const VW = 320, VH = 180, real = [[0, 0, 118, 46], [260, 0, 56, 32], [192, 32, 122, 11], [142.5, 2, 35, 13], [74, 11, 70, 17]];   /* the plate, the coin panel, the quest line, the clock, the skill slots (the rects a real frame keeps) */
  for (const boss of [false, true]) for (const left of [118, 150]) {
    const z = U.toastZone(VW, VH, { left, top: 56, boss });
    assert(z.x >= left + 4 && z.x >= 128 && z.x + z.w <= VW - 4, 'the zone sits between the left cluster and the right edge');
    for (const hero of [null, [50, 110], [20, 60]]) for (const n of [1, 2, 3]) {
      const lines = Array.from({ length: n }, () => 'x'.repeat(26)), box = U.toastBox(z, lines, 8, l => l.length * 6, hero), r = [box.x, box.y, box.w, box.h];
      assert(box.x >= z.x && box.x + box.w <= z.x + z.w, 'the box is inside the zone');
      for (const h of real.slice(0, 4)) assert(!U.rectsOverlap(r, h), 'a toast box ' + JSON.stringify(r) + ' overlaps the HUD rect ' + JSON.stringify(h));
      if (boss) assert(box.y + box.h <= VH - 36, 'with a boss up the box never reaches the boss bar (' + (box.y + box.h) + ')'); else assert(box.y + box.h <= VH - 8, 'and never the foot'); } }
  assert(U.idleAlpha(1) === 1 && U.idleAlpha(3.5) === 1 && U.idleAlpha(30) === 0.38 && U.idleAlpha(4.1) < 1 && U.idleAlpha(4.1) > 0.38, 'the idle fade holds, settles to its floor and no lower');
  const S = { parts: 'normal', parallax: 'full', air: true, tint: 'full', weather: true, ambient: true, grain: false, vignette: true, scanlines: false };
  assert.equal(U.gfxOf(S), 'high', 'a new save is HIGH'); assert.equal(U.gfxStep(S, -1), 'medium'); assert.equal(S.parallax, 'near'); assert.equal(U.gfxStep(S, -1), 'low'); assert.equal(S.parts, 'few'); assert.equal(S.weather, false);
  assert.equal(U.gfxStep(S, -1), 'high', 'it wraps'); S.grain = true; assert.equal(U.gfxOf(S), 'custom', 'one change by hand is CUSTOM'); U.gfxStep(S, 1); assert.equal(U.gfxOf(S), 'low', 'and the next step from CUSTOM lands on a preset');
  for (const k of Object.keys(U.ICONS)) assert(U.ICONS[k].length === 7 && U.ICONS[k].every(r => r.length === 7 && /^[01]+$/.test(r)), 'icon ' + k + ' is 7 x 7');
  const sh = U.sunStatus({ shaded: true, stg: 0 }), h1 = U.sunStatus({ stg: 1 }), h2 = U.sunStatus({ stg: 2 });
  assert.equal(U.statusChange(null, sh), null, 'standing in shade at the start says nothing'); assert.equal(U.statusChange(sh, sh), null, 'no change, no toast');
  assert(/BITES/.test(U.statusChange(null, h1)) && /HOTTER/.test(U.statusChange(h1, h2)), 'the bite and each stage up are said once'); assert(/LETS GO/.test(U.statusChange(h2, sh)), 'and the shade after the sun'); assert.equal(U.statusChange(h2, h1), null, 'a stage down is silent');
  for (const old of ['Resume', 'Map', 'Skills', 'Level card', 'Store', 'Hero', 'Co-op', 'Co-op guide', 'Hero trial', 'Back to shrine', 'Restart level', 'Return to map', 'Music volume', 'Effects vol', 'Settings', 'Quit to title']) assert(U.PAUSE_ROWS.includes(old), 'the pause row ' + old + ' is kept');
  assert.deepEqual(U.PAUSE_ROWS.slice(0, 5), ['Resume', 'Map', 'Skills', 'Settings', 'Return to map'], 'the first screen is what a player pauses for'); }

/* ---- 3. and 4. in the page ---- */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const out = {}, { LEVELS } = await import('/src/level.js'), ui = BK.ui, H = BK.uiHud;
    const words = /^(SHADE|STORM|BURNING|HOTTER|SCORCHING|SKIN|DRY|FLOOD|HORN)$/, seen = new Set();
    const frames = n => { for (let i = 0; i < n; i++) { window.__textRec = []; BK.step(1); for (const t of window.__textRec) if (t.kind === 'text' && words.test(String(t.s))) seen.add(t.s); window.__textRec = null; } };
    const rectOver = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
    BK.load(LEVELS.findIndex(l => l.id === 'caravan')); BK.start(); BK.god = true; BK.sim(300);
    /* the toast queue in the real frame: three at once, one at a time, in order, clear of the HUD */
    H.q.cur = null; H.q.wait.length = 0; H.hint('FIRST LINE ONE TWO', 3); BK.step(1); H.hint('SECOND LINE THREE FOUR', 3); BK.step(1); H.hint('THIRD LINE FIVE SIX', 3); BK.step(1);
    out.waiting = H.q.wait.map(t => t.msg); const order = [], bad = [];
    for (let f = 0; f < 60 * 9; f++) { BK.step(1); const c = H.q.cur; if (c && order[order.length - 1] !== c.msg) order.push(c.msg);
      if (c && H.q.box) { const b = H.q.box; for (const h of H.rects()) if (rectOver(b, h)) bad.push([f, b, h]); if (H.env() && b[0] < H.env()) bad.push([f, 'env', b, H.env()]); } }
    out.order = order; out.bad = bad.slice(0, 3);
    /* the status icon: in the shade, then in the sun's bite (BK.sim runs the world, step draws) */
    BK.load(LEVELS.findIndex(l => l.id === 'caravan')); BK.start(); BK.god = true; BK.sim(300); H.q.cur = null; H.q.wait.length = 0;
    { const z = BK.L.shadeArt[0]; BK.P.x = (z[0] + z[1]) / 2; BK.P.y = z[3] - 2; BK.P.vx = BK.P.vy = 0; BK.P.sun = { v: 0.4, tick: 0, n: 0 }; BK.sim(30); } frames(20); out.shade = H.sun() && H.sun().icon;
    BK.tp(60, 22); for (let f = 0; f < 200; f++) { BK.P.sun && (BK.P.sun.v = 1); BK.sim(1); if (f % 20 === 0) frames(1); } frames(2); out.heat = H.sun() && [H.sun().icon, H.sun().stage];
    out.toasts = [H.q.cur && H.q.cur.msg, ...H.q.wait.map(t => t.msg)]; out.words = [...seen];
    /* the fade: nothing changing for a while */
    BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.god = true; BK.sim(60); frames(1); const f0 = H.fade(); BK.sim(60 * 9); frames(1); const f1 = H.fade();
    out.fade = { coinSince: +(f1.now - f1.coinAt).toFixed(1), xpSince: +(f1.now - f1.xpAt).toFixed(1), freshSince: +(f0.now - f0.coinAt).toFixed(1) };
    /* settings: Graphics, the accessibility rows, the pause menu */
    ui.openMenu('title'); const S = H.SET(); ui.settingsTab = 'display'; const rows = ui.menuRows(); out.gfxRow = rows.indexOf('Graphics') > 0;
    ui.menuI = rows.indexOf('Graphics'); const key = k => { dispatchEvent(new KeyboardEvent('keydown', { key: k })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: k })); };
    S.parts = 'normal'; S.parallax = 'full'; S.air = true; S.tint = 'full'; S.weather = true; S.ambient = true; S.grain = false; S.vignette = true; S.scanlines = false; out.g0 = H.gfx();
    key('ArrowLeft'); out.g1 = [H.gfx(), S.parallax]; key('ArrowLeft'); out.g2 = [H.gfx(), S.parts, S.weather, S.vignette]; key('ArrowRight'); key('ArrowRight'); out.g3 = H.gfx(); S.grain = true; out.g4 = H.gfx(); S.grain = false;
    ui.settingsTab = 'access'; out.access = ui.menuRows(); ui.settingsTab = 'display'; out.display = ui.menuRows();
    BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.start(); BK.sim(30); ui.openMenu('play'); out.kind = ui.menuKind; out.pause = ui.menuRows().slice(0, 6);
    ui.menuI = ui.menuRows().indexOf('Return to map'); key('Enter'); out.leave1 = [BK.state, H.msg()]; key('Enter'); out.leave2 = BK.state;
    out.errors = 0; return out; })()`, 600000);
  const O = r;
  assert.deepEqual(O.waiting, ['SECOND LINE THREE FOUR', 'THIRD LINE FIVE SIX'], 'two toasts wait behind the first');
  assert.deepEqual(O.order, ['FIRST LINE ONE TWO', 'SECOND LINE THREE FOUR', 'THIRD LINE FIVE SIX'], 'they come out one at a time, in the order they arrived');
  assert.deepEqual(O.bad, [], 'a toast box overlapped a HUD rect or the water/flood row: ' + JSON.stringify(O.bad));
  assert.equal(O.shade, 'shade', 'in the shade the status is the parasol icon'); assert.deepEqual(O.heat, ['heat', 3], 'in the open sand it is the flame icon, at its stage');
  assert.deepEqual(O.words, [], 'status words are never drawn (icons only): ' + JSON.stringify(O.words));
  assert(O.toasts.some(t => /SUN BITES|HOTTER|SCORCHING|LETS GO/.test(t || '')), 'a status CHANGE is told once as a toast: ' + JSON.stringify(O.toasts));
  assert(O.fade.coinSince > 6 && O.fade.freshSince < 3.5, 'the coin counter had been idle long enough to fade: ' + JSON.stringify(O.fade));
  assert(O.gfxRow, 'Graphics is a DISPLAY row'); assert.equal(O.g0, 'high'); assert.deepEqual(O.g1, ['medium', 'near']); assert.deepEqual(O.g2, ['low', 'few', false, false]); assert.equal(O.g3, 'high'); assert.equal(O.g4, 'custom');
  for (const k of ['Big text', 'Timer', 'Reduce motion', 'Flashes', 'Screen shake', 'Shake strength']) assert(O.access.includes(k), 'ACCESSIBILITY holds ' + k); assert(!O.display.includes('Timer') && !O.display.includes('Screen shake'), 'and they left DISPLAY');
  assert.deepEqual(O.pause.slice(0, 5), ['Resume', 'Map', 'Skills', 'Settings', 'Return to map'], 'the pause menu opens on what a player pauses for');
  assert.equal(O.leave1[0], 'menu', 'one press on Return to map in a level only asks'); assert(/press again/.test(O.leave1[1]), 'and says so'); assert.equal(O.leave2, 'map', 'the second press goes');
  assert.deepEqual(pg.errors, [], 'no page errors: ' + JSON.stringify(pg.errors.slice(0, 3)));
  console.log('ui-hud ok: the toast queue (' + O.order.length + ' toasts in order, never over the HUD), status icons (shade, flame stage 3, no words), the idle fade, Graphics presets, the ACCESS rows, the pause menu\'s first screen and its leave-confirm');
} finally { pg.close(); }
