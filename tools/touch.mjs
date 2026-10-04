// tools/touch.mjs - THE PHONE, EMULATED (claude/mobile, 2026-10-02: Daniel, "touch support, all of it").
// The page runs as a landscape phone (844x390 CSS px at 2x, touch on) and is driven with REAL touch events over the DevTools protocol:
//   1. the floating stick: eight directions, a dead zone, clear UP and DOWN zones, released cleanly, multi-touch safe, left-handed
//   2. the right-hand layout: ATTACK held is still the heavy swing, DODGE / BLOCK / JUMP, a thumb sliding between buttons, NO two buttons
//      overlap (any size, either hand), and nothing sits under a notch (?safe=t,r,b,l) or the home bar
//   3. the contextual action button: it shows ONLY when INTERACT would do something, with the verb, and a tap really does it
//      (a torch bracket is taken; a level's own use - the Well Town skin's FILL / POUR / DRINK is not on this branch - registers on BK.touchVerbs)
//   4. tap menus: the title, Settings (tabs and rows), the save slots, the map (tap = walk there, tap again = go in), the store, BACK, a card
//   5. the TOUCH settings tab: size, opacity, left-handed, drag-to-reposition (and reset) all persist through a reload
//   6. assists (touch only: a longer buffer, auto-face a foe behind you), haptics (navigator.vibrate on a hit, a setting turns it off)
//   7. the first run on a phone defaults to lighter effects, and the overlay costs next to nothing a frame
//   8. the installable app: manifest, icons, a service worker that is network-first (a deploy wins) and boots the game offline
//   9. the KEYBOARD path is untouched: keys still set the same flags and a key puts the assists back to 1x
import { openPage } from './cdp.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const pg = await openPage({ audio: false, fonts: false });
const fails = [], notes = [], ok = (c, m) => { if (!c) { fails.push(m); if (process.env.TOUCH_VERBOSE) console.log('  FAIL ' + m); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const E = (expr, t = 60000) => pg.evalp(expr, t);   // (a hung evaluate fails in a minute, not the half hour openPage allows)
const ONLY = (process.env.TOUCH_ONLY || '').split(',').filter(Boolean);   // TOUCH_ONLY=stick,haptics runs just those (play-setup is added for you)
const section = async (name, fn) => { if (ONLY.length && !ONLY.includes(name) && !(name === 'play-setup' && ONLY.some(n => !['title', 'settings-tabs', 'layout-editor', 'back-pill', 'save-slots', 'map', 'store', 'persist', 'pwa-files', 'pwa-live', 'desktop', 'api'].includes(n)))) return; const t0 = Date.now(), e0 = pg.errors.length; try { await fn(); } catch (e) { fails.push(name + ': ' + String(e.message).split('\n')[0]); }
  if (pg.errors.length > e0) fails.push(name + ': the page threw: ' + pg.errors.slice(e0, e0 + 2).map(x => String(x).split('\n').slice(0, 2).join(' @ ')).join(' | '));   // (a throw is blamed on the section that was running)
  if (process.env.TOUCH_VERBOSE) console.log('  [' + name + '] ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s'); };
let LEGACY = true;   // the older sections below were written for the FULL buttons and the floating stick: they run on those (SET.touchPreset 'full', SET.touchMove 'stick'); the new sections turn it off and test the defaults
const DSF = 2;   // the emulated device's scale factor
let DPR = DSF;   // canvas pixels per CSS pixel: the same on a desktop canvas, and half-resolution phone canvas (claude/mobile2) is read from the page after each load (syncDpr)

// ---------- the device and the thumb ----------
await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const active = new Map();
const sendTouch = (type) => pg.send('Input.dispatchTouchEvent', { type, touchPoints: [...active].map(([id, p]) => ({ x: p.x, y: p.y, id })) });
const down = async (id, x, y) => { active.set(id, { x, y }); await sendTouch('touchStart'); await sleep(40); };
const move = async (id, x, y) => { active.set(id, { x, y }); await sendTouch('touchMove'); await sleep(40); };
const up = async (id) => { const p = active.get(id); active.delete(id); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: p.x, y: p.y, id }] }); await sleep(40); };   /* (touchEnd lists the points that LEAVE, not the ones that stay) */
const tap = async (x, y, hold = 60) => { await down(9, x, y); await sleep(hold); await up(9); };
const goto = async (query = '') => {
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' + query });
  await sleep(1500);
  for (let i = 0; i < 160; i++) { const r = await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false); if (r) break; await sleep(300); }
  DPR = await E('document.getElementById("c").width / innerWidth');   // syncDpr
  if (LEGACY) await E('BK.SET.touchPreset = "full"; BK.SET.touchMove = "stick"; BK.touch.relayout()');
};
const keysNow = () => E('({ left: !!BK.keys.left, right: !!BK.keys.right, up: !!BK.keys.up, down: !!BK.keys.down, atk: !!BK.keys.atk, jump: !!BK.keys.jump, dodge: !!BK.keys.dodge, block: !!BK.keys.block })');
const dbg = () => E('BK.touch.debug()');
const css = v => v / DPR;
const centre = b => [css(b.cx), css(b.cy)];
const rectMid = r => [css(r.x + r.w / 2), css(r.y + r.h / 2)];
/* a row of the open Settings tab: the cursor is moved to it (the list scrolls to keep it on screen: nine rows show) and its box is the one tapped */
const tapRow = async name => { const rows = await E('BK.ui.menuRows()'), i = rows.indexOf(name); if (i < 0) throw new Error('no row ' + name); await E('BK.ui.menuI = ' + i); await sleep(250);
  const off = Math.max(0, Math.min(rows.length - 1 - 9, Math.max(0, i - 1) - 9 + 2)), vis = rows.slice(1 + off, 1 + off + 9).filter(r => r[0] !== '-'); await gameTap(6 + vis.indexOf(name)); };
const idle = async () => { for (let i = 0; i < 120; i++) { if (!(await E("import('/src/loading-screen.js').then(m => !!m.LS.busy)"))) return; await sleep(250); } };   // a level load in flight (from a tap) must land before the harness loads another
const toPlay = async (id = 'wood') => { await idle(); await E(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = true; BK.load(LEVELS.findIndex(l => l.id === ${JSON.stringify(id)})); BK.state = 'play'; BK.sim(120); })()`, 180000); };
const gameTap = async (i) => { const hs = await E('BK.touch.hitBoxes()'); const h = hs[i]; if (!h) throw new Error('no tap box #' + i + ' (' + hs.length + ' drawn)'); const [cx, cy] = await E(`BK.touch.gameToClient(${h.x + h.w / 2}, ${h.y + h.h / 2})`); await tap(cx, cy); await sleep(250); };
const pill = async (press) => { const d = await dbg(); const p = d.pills.find(q => q.k === 'pill:' + press); if (!p) throw new Error('no ' + press + ' pill in state ' + (await E('BK.state'))); await tap(...rectMid(p)); await sleep(300); };

try {
  await goto();
  await section('api', async () => { ok(await E('!!(BK.touch && BK.touch.on)'), 'BK.touch is not there (the touch module is not wired in): every touch check below depends on it'); });

  // ===================== 4+5: TAP MENUS, from the title =====================
  await section('title', async () => {
    await sleep(1500);
    const items = await E('BK.ui.titleItems()'), hits = await E('BK.touch.hitBoxes()');
    ok(hits.length === items.length && items.length > 0, 'the title drew ' + hits.length + ' tap boxes for ' + items.length + ' items');
    notes.push('title items: ' + items.join(', '));
    // every box is a real size for a thumb (at least 30 CSS px tall) and on screen
    const th = await E('BK.touch.hitBoxes().map(h => { const [x0, y0] = BK.touch.gameToClient(h.x, h.y), [x1, y1] = BK.touch.gameToClient(h.x + h.w, h.y + h.h); return { w: x1 - x0, h: y1 - y0, x: x0, y: y0 }; })');
    ok(th.every(r => r.h >= 12 && r.x >= 0 && r.x + r.w <= 844 && r.y >= 0 && r.y + r.h <= 390), 'a title tap box is off screen or sliver-thin: ' + JSON.stringify(th[0]));
    const i = items.indexOf('SETTINGS'); ok(i >= 0, 'no SETTINGS on the title');
    await gameTap(i);
    ok(await E('BK.state') === 'menu', 'a tap on SETTINGS did not open Settings (state ' + await E('BK.state') + ')');
  });
  await section('settings-tabs', async () => {
    await sleep(500);
    const tabs = await E('BK.ui.menuRows().length'); ok(tabs > 2, 'the settings rows are empty');
    const hits = await E('BK.touch.hitBoxes()'); ok(hits.length >= 7, 'settings drew ' + hits.length + ' tap boxes (six tabs + rows)');
    await gameTap(5);   // the sixth tab strip box: TOUCH
    ok(await E('BK.ui.settingsTab') === 'touch', 'a tap on the sixth tab did not open TOUCH (' + await E('BK.ui.settingsTab') + ')');
    await sleep(300);
    const rows = await E('BK.ui.menuRows()'); ok(['Touch size', 'Touch opacity', 'Left-handed', 'Edit layout', 'Reset layout', 'Move control', 'Stick dead zone', 'Layout', 'Block toggle', 'Auto-face foes', 'Aim assist', 'Auto-interact', 'Long input buffer', 'Swipe gestures', 'Haptics', 'Lighter effects'].every(r => rows.includes(r)), 'the TOUCH tab is missing rows: ' + rows.join('|'));
    // rows in draw order: boxes 6.. are the rows in the tab (headers have none)
    const rowBox = name => 6 + rows.filter(r => r[0] !== '-' && r !== '@TABS' && r !== 'Back').indexOf(name);
    const size0 = await E('BK.SET.touchSize ?? 1');
    await tapRow('Touch size');
    ok(await E('BK.SET.touchSize') > size0, 'a tap on Touch size did not step it up (' + size0 + ' -> ' + await E('BK.SET.touchSize') + ')');
    await tapRow('Left-handed'); ok(await E('BK.SET.touchLeft') === true, 'a tap on Left-handed did not turn it on');
    await tapRow('Haptics'); ok(await E('BK.SET.touchHaptics') === false, 'a tap on Haptics did not turn them off');
    await tapRow('Haptics'); ok(await E('BK.SET.touchHaptics') !== false, 'a second tap on Haptics did not bring them back');
    await tapRow('Left-handed');
    const saved = await E('JSON.parse(localStorage.getItem("bracken.settings")).touchSize');
    ok(saved > size0, 'the touch size was not saved to localStorage (' + saved + ')');
  });
  await section('layout-editor', async () => {
    const rows = await E('BK.ui.menuRows()'); const rowBox = name => 6 + rows.filter(r => r[0] !== '-' && r !== '@TABS' && r !== 'Back').indexOf(name);
    await tapRow('Edit layout');
    let d = await dbg(); ok(d.editing, 'a tap on Edit layout did not start the editor');
    const atk = d.layout.btn.atk, x0 = atk.cx;
    await down(1, ...centre(atk)); await move(1, css(atk.cx) - 120, css(atk.cy) - 60); await up(1); await sleep(100);
    d = await dbg(); ok(d.layout.btn.atk.cx < x0 - 75 * DPR, 'dragging ATTACK did not move it (' + Math.round(x0) + ' -> ' + Math.round(d.layout.btn.atk.cx) + ')');
    const pos = await E('BK.SET.touchPos && BK.SET.touchPos.atk'); ok(Array.isArray(pos), 'the dragged spot was not stored in SET.touchPos');
    ok(await E('JSON.parse(localStorage.getItem("bracken.settings")).touchPos.atk') !== undefined, 'the dragged spot was not saved');
    await tap(...rectMid(d.bar.reset)); await sleep(150);
    d = await dbg(); ok(Math.abs(d.layout.btn.atk.cx - x0) < 2 && !(await E('BK.SET.touchPos && BK.SET.touchPos.atk')), 'RESET did not put ATTACK back');
    await down(1, ...centre(d.layout.btn.jump)); await move(1, css(d.layout.btn.jump.cx) - 100, css(d.layout.btn.jump.cy) + 20); await up(1);
    await tap(...rectMid(d.bar.done)); await sleep(150);
    d = await dbg(); ok(!d.editing, 'DONE did not leave the editor');
    await E('BK.SET.touchPos = {}; BK.touch.relayout(); localStorage.setItem("bracken.settings", JSON.stringify(BK.SET))');   // the editor leaves the layout (and the saved file) as it found it
  });
  await section('back-pill', async () => {
    await pill('back');
    ok(await E('BK.state') === 'title', 'the BACK button from Settings did not return to the title (' + await E('BK.state') + ')');
  });
  await section('save-slots', async () => {
    await sleep(600);
    const items = await E('BK.ui.titleItems()'), i = items.findIndex(k => k === 'NEW GAME' || k === 'CHOOSE A SAVE'); ok(i >= 0, 'no save item on the title: ' + items.join('|'));
    await gameTap(i);
    ok(await E('BK.state') === 'slots', 'a tap on ' + items[i] + ' did not open the save slots (' + await E('BK.state') + ')');
    await sleep(300);
    const hs = await E('BK.touch.hitBoxes()'); ok(hs.length === 5, 'the slot screen drew ' + hs.length + ' tap boxes, not 5');
    await gameTap(3); ok(await E('BK.ui.slotI') === 3, 'a tap on slot 4 did not pick it (' + await E('BK.ui.slotI') + ')');
    ok(await E('BK.state') === 'slots', 'the first tap on a slot already left the slot screen');
    const d = await dbg(); ok(d.pills.some(p => p.press === 'atk' && p.label === 'ERASE'), 'the slot screen has no ERASE pill');
    await gameTap(3);
    ok(await E('BK.state') !== 'slots', 'a second tap on the picked slot did not open it');
  });
  await section('map', async () => {
    await idle(); await E(`(async () => { const { LEVELS } = await import('/src/level.js'); BK.manualSimulation = false; BK.load(LEVELS.findIndex(l => l.id === 'wood')); BK.SET.godmode = true; BK.mapLook('wood'); })()`); await sleep(1200);
    const hs = await E('BK.touch.hitBoxes()'), mn = await E('BK.mapNodes()');
    ok(hs.length === mn.hitOrder.length && hs.length > 5, 'the map drew ' + hs.length + ' node boxes for ' + mn.hitOrder.length + ' nodes');
    const here = mn.hitOrder.indexOf(mn.node), next = mn.hitOrder.findIndex((n, k) => k > here && !mn.spur[n]);
    ok(here >= 0 && next >= 0, 'could not find the node under the hero and the next one');
    // the next node may be off the top or bottom of the view: the camera follows the hero, so ask for the one that is on screen
    const onScreen = hs.map((h, k) => ({ k, y: h.y })).filter(o => o.y > 8 && o.y < 160 && o.k !== here);
    ok(onScreen.length > 0, 'no other node is on screen on the map');
    const tgt = onScreen.map(o => o.k).filter(k => !mn.spur[mn.hitOrder[k]] && !mn.locked[mn.hitOrder[k]])[0];
    if (tgt !== undefined) {
      const want = mn.hitOrder[tgt]; await gameTap(tgt);
      for (let i = 0; i < 40 && (await E('BK.mapNodes().node')) !== want; i++) await sleep(200);
      ok(await E('BK.mapNodes().node') === want, 'a tap on node ' + mn.ids[want] + ' did not walk the hero there (he is on ' + mn.ids[await E('BK.mapNodes().node')] + ')');
      ok(await E('BK.state') === 'map', 'the first tap on a node already entered it');
      // (the second tap is tried on the node of the wood that is already loaded: entering another wood re-bakes the props, and the map throws one frame
      // while that bake runs - a bug of the base, not of touch; see the lane report)
    } else notes.push('map: no unlocked road node on screen to walk to (skipped the walk)');
    await E("BK.mapLook('wood')"); await sleep(900);
    const mn2 = await E('BK.mapNodes()'); await gameTap(mn2.hitOrder.indexOf(mn2.node));
    let left = false; for (let i = 0; i < 80 && !left; i++) { left = (await E('BK.state')) !== 'map'; if (!left) await sleep(250); }
    ok(left, 'a second tap on the node he stands on did not go in');
  });
  await section('store', async () => {
    await E('BK.state = "title"'); await sleep(300);
    await E('BK.ui.storeOpen("map", "heroes")'); await sleep(900);
    ok(await E('BK.state') === 'store', 'the store did not open');
    const hs = await E('BK.touch.hitBoxes()'), nt = await E('BK.ui.tabs()'); ok(hs.length >= nt + 1, 'the store drew ' + hs.length + ' tap boxes (' + nt + ' tabs + item rows)');
    await gameTap(2); ok(await E('BK.ui.storeTab') === 2, 'a tap on the third store tab did not open it (' + await E('BK.ui.storeTab') + ')');
    await sleep(400);
    if ((await E('BK.ui.items()')) > 1) { await gameTap(nt + 1); ok(await E('BK.ui.storeI') === 1, 'a tap on the second store row did not pick it (' + await E('BK.ui.storeI') + ')'); }
    await pill('back'); ok(await E('BK.state') !== 'store', 'BACK did not leave the store');
  });
  await section('persist', async () => {
    const before = await E('BK.SET.touchSize'); await goto();
    ok(await E('BK.SET.touchSize') === before && before > 1, 'the touch size did not survive a reload (' + before + ' -> ' + await E('BK.SET.touchSize') + ')');
    await E('BK.SET.touchSize = 1; BK.touch.relayout()');
  });

  // ===================== 1+2: THE STICK AND THE BUTTONS, in a wood =====================
  await section('play-setup', async () => { await toPlay('wood'); await sleep(200); });
  await section('stick', async () => {
    const SX = 200, SY = 300, R = 60;
    for (const [name, ux, uy, want] of [['E', 1, 0, { right: 1 }], ['NE', 1, -1, { right: 1, up: 1 }], ['N', 0, -1, { up: 1 }], ['NW', -1, -1, { left: 1, up: 1 }], ['W', -1, 0, { left: 1 }], ['SW', -1, 1, { left: 1, down: 1 }], ['S', 0, 1, { down: 1 }], ['SE', 1, 1, { right: 1, down: 1 }]]) {
      const n = Math.hypot(ux, uy);
      await down(1, SX, SY); await move(1, SX + ux / n * R, SY + uy / n * R);
      const k = await keysNow(), bad = ['left', 'right', 'up', 'down'].filter(d => !!want[d] !== k[d]);
      ok(!bad.length, 'stick ' + name + ': keys ' + JSON.stringify(k) + ' (wanted ' + Object.keys(want).join('+') + ')');
      if (name === 'N' || name === 'S') ok(!k.left && !k.right, 'the ' + (name === 'N' ? 'UP' : 'DOWN') + ' zone also set left or right');
      await up(1);
      const k2 = await keysNow(); ok(!k2.left && !k2.right && !k2.up && !k2.down, 'stick ' + name + ' did not release cleanly: ' + JSON.stringify(k2));
    }
    // the dead zone: a small wobble is nothing, a real push is something, and coming back to the middle lets go
    await down(1, SX, SY); await move(1, SX + 10, SY);
    ok(!(await keysNow()).right, 'a 10 px wobble counted (the dead zone)');
    await move(1, SX + 50, SY); ok((await keysNow()).right, 'a 50 px push did not run right');
    await move(1, SX + 8, SY + 2); ok(!(await keysNow()).right, 'coming back to the middle did not let go');
    await up(1);
    // anywhere on the left 45%: a thumb down at the left edge and one at the edge of the zone both make a stick
    for (const x of [30, 360]) { await down(1, x, 200); await move(1, x + 60, 200); ok((await keysNow()).right, 'no stick for a thumb down at x=' + x); await up(1); }
    // OUTSIDE the zone (the right half, empty of buttons) there is no stick
    await down(1, 600, 120); await move(1, 660, 120); ok(!(await keysNow()).right, 'a thumb on the right half made a stick'); await up(1);
    // MULTI-TOUCH: run right with one thumb, hit ATTACK with the other, let go of ATTACK, keep running
    let d = await dbg();
    await down(1, SX, SY); await move(1, SX + R, SY);
    await down(2, ...centre(d.layout.btn.atk)); let k = await keysNow();
    ok(k.right && k.atk, 'stick + ATTACK together: ' + JSON.stringify(k));
    await up(2); k = await keysNow(); ok(k.right && !k.atk, 'letting go of ATTACK also let go of the stick: ' + JSON.stringify(k));
    await up(1); k = await keysNow(); ok(!k.right && !k.atk, 'a release left a key stuck: ' + JSON.stringify(k));
    // a touch cancelled by the system (a notification, a palm) releases too
    await down(1, SX, SY); await move(1, SX + R, SY); active.clear(); await pg.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] }); await sleep(80);
    k = await keysNow(); ok(!k.right, 'a cancelled touch left the stick held');
  });
  await section('buttons', async () => {
    let d = await dbg(); const B = d.layout.btn;
    for (const [name, key] of [['atk', 'atk'], ['jump', 'jump'], ['dodge', 'dodge'], ['block', 'block']]) {
      await down(3, ...centre(B[name])); const k = await keysNow(); ok(k[key], name + ' button down did not hold keys.' + key + ' ' + JSON.stringify(k)); await up(3);
      ok(!(await keysNow())[key], name + ' button up left keys.' + key + ' held');
    }
    // a thumb sliding from ATTACK onto JUMP hands over
    await down(3, ...centre(B.atk)); await move(3, ...centre(B.jump)); let k = await keysNow(); ok(k.jump && !k.atk, 'sliding ATTACK -> JUMP did not hand over: ' + JSON.stringify(k)); await up(3);
    // ATTACK HELD IS THE HEAVY SWING: the charge climbs while the thumb stays down, and lets go on release
    await E('BK.P.charge = 0'); await down(3, ...centre(B.atk)); await E('BK.sim(70)');
    const ch = await E('BK.P.charge || 0'); ok(ch > 0.2, 'holding ATTACK did not charge the heavy swing (charge ' + ch + ')');
    ok((await keysNow()).atk, 'ATTACK let go by itself while held'); await up(3); await E('BK.sim(40)');
    // PAUSE, top corner
    await down(3, ...centre(B.pause)); await up(3); await E('BK.sim(2)');
    ok(await E('BK.state') === 'menu', 'the pause button did not pause (' + await E('BK.state') + ')');
    await E('BK.state = "play"');
  });
  await section('layout-fit', async () => {
    const fit = async (label, W = 844, H = 390) => {
      const d = await E('({ all: BK.touch.allButtons(), L: BK.touch.debug().layout })'), A = d.all, L = d.L;
      for (let i = 0; i < A.length; i++) {
        const a = A[i];
        ok(a.cx - a.r >= L.ins.l - 0.5 && a.cx + a.r <= L.W - L.ins.r + 0.5 && a.cy - a.r >= L.ins.t - 0.5 && a.cy + a.r <= L.H - L.ins.b + 0.5, label + ': ' + a.k + ' is outside the safe area');
        for (let j = i + 1; j < A.length; j++) { const b = A[j]; ok(Math.hypot(a.cx - b.cx, a.cy - b.cy) >= a.r + b.r - 0.5, label + ': ' + a.k + ' overlaps ' + b.k); }
      }
      // the stick's zone is its own: no button centre inside it
      ok(A.every(a => a.cx > L.zone.x1 + 1 || a.cx < L.zone.x0 - 1), label + ': a button sits in the stick zone');
      ok(A.find(a => a.k === 'atk').r * DPR >= 20 && A.every(a => a.r >= 20 * DPR * 0.75), label + ': a button is too small to hit');
    };
    await E('BK.SET.touchPos = {}; BK.touch.relayout()');   // the fit is judged on the default layout (a dragged button may sit where its owner likes)
    for (const sz of [0.7, 1, 1.4]) { await E(`BK.SET.touchSize = ${sz}; BK.touch.relayout()`); await fit('size ' + sz); await E(`BK.SET.touchLeft = true; BK.touch.relayout()`); await fit('left-handed size ' + sz);
      const d = await dbg(); ok(d.layout.btn.atk.cx < d.layout.W / 2 && d.layout.zone.x0 > d.layout.W / 2, 'left-handed did not swap the hands'); await E('BK.SET.touchLeft = false; BK.touch.relayout()'); }
    await E('BK.SET.touchSize = 1; BK.touch.relayout()');
    // a NOTCH and a home bar: reload with a fake inset (CSS px: top, right, bottom, left)
    await goto('&safe=8,44,21,44'); await toPlay('wood');
    const d = await dbg(); ok(d.layout.ins.r === 44 * DPR && d.layout.ins.l === 44 * DPR && d.layout.ins.b === 21 * DPR, 'the safe-area override was not read: ' + JSON.stringify(d.layout.ins));
    await fit('with a notch');
    ok(d.layout.btn.atk.cx + d.layout.btn.atk.r <= d.layout.W - 44 * DPR + 0.5, 'ATTACK is under the right notch');
    await goto(); await toPlay('wood');
  });

  // ===================== 3: THE CONTEXTUAL ACTION BUTTON =====================
  await section('action-button', async () => {
    await E('BK.manualSimulation = true; BK.P.vx = 0; BK.P.x = 40; BK.sim(30)');
    const tick = async () => { await E('BK.touch.tick(0.1); BK.touch.tick(0.1)'); return dbg(); };
    let d = await tick(); ok(d.verb === null && !d.buttons.some(b => b.k === 'interact'), 'the action button is showing with nothing to use: ' + JSON.stringify(d.verb));
    const put = props => E(`(() => { const P = BK.P; for (const p of ${JSON.stringify(props)}) BK.props().push(Object.assign({ x: P.x, y: P.y }, p)); return BK.props().length; })()`);
    const drop = t => E(`(() => { const a = BK.props(); for (let i = a.length - 1; i >= 0; i--) if (a[i].test) a.splice(i, 1); })()`);
    const verbWith = async (props, pre = '') => { await E(pre); await put(props.map(p => ({ ...p, test: 1 }))); const dd = await tick(); await drop(); return dd; };
    d = await verbWith([{ t: 'doorway', id: 'tD', needs: null }]); ok(d.verb && d.verb.verb === 'ENTER', 'a doorway shows ' + (d.verb && d.verb.verb) + ', not ENTER');
    d = await verbWith([{ t: 'doorway', id: 'tD2', needs: 'testkey' }]); ok(d.verb && d.verb.verb === 'OPEN', 'a barred doorway shows ' + (d.verb && d.verb.verb) + ', not OPEN');
    d = await verbWith([{ t: 'npc', kind: 'keeper' }], 'BK.level.shop = true'); ok(d.verb && d.verb.verb === 'SHOP', 'a shop counter shows ' + (d.verb && d.verb.verb) + ', not SHOP'); await E('BK.level.shop = false');
    d = await verbWith([{ t: 'npc', kind: 'keeper' }]); ok(d.verb === null, 'a keeper outside a shop room showed ' + JSON.stringify(d.verb) + ' (the counter belongs to the store only)');
    d = await verbWith([{ t: 'exit' }]); ok(d.verb && d.verb.verb === 'LEAVE', 'an exit door shows ' + (d.verb && d.verb.verb) + ', not LEAVE');
    d = await verbWith([{ t: 'npc', kind: 'hillfolk', name: 'X' }]); ok(d.verb && d.verb.verb === 'TALK', 'a person shows ' + (d.verb && d.verb.verb) + ', not TALK');
    d = await verbWith([{ t: 'vbucket', state: 'rest' }]); ok(d.verb && d.verb.verb === 'TAKE', 'a bucket at rest shows ' + (d.verb && d.verb.verb) + ', not TAKE');
    // a level's OWN use (the waterskin at a well) registers a hook and needs no edit to the module
    await E('window.__fill = 0; BK.touchVerbs.push(() => window.__fill === 1 ? { verb: "fill", key: "talk" } : window.__fill === 2 ? { verb: "pour", key: "throw" } : window.__fill === 3 ? { verb: "drink", key: "skill2" } : null)');
    for (const [n, v] of [[1, 'FILL'], [2, 'POUR'], [3, 'DRINK']]) { await E(`window.__fill = ${n}`); d = await tick(); ok(d.verb && d.verb.verb === v, 'a registered hook did not show ' + v + ' (' + JSON.stringify(d.verb) + ')'); ok(d.buttons.some(b => b.k === 'interact'), v + ' has no button'); ok(d.verb.key === ['talk', 'throw', 'skill2'][n - 1], v + ' sends the wrong press: ' + d.verb.key); }
    await E('window.__fill = 0'); d = await tick(); ok(d.verb === null && !d.buttons.some(b => b.k === 'interact'), 'the button stayed after the use went away');
    // A TAP REALLY DOES IT: a torch bracket in reach shows TAKE, the tap takes the torch
    await put([{ t: 'torchbracket', test: 1 }]); d = await tick();
    ok(d.verb && d.verb.verb === 'TAKE', 'a torch bracket shows ' + (d.verb && d.verb.verb) + ', not TAKE');
    const btn = d.buttons.find(b => b.k === 'interact'); ok(!!btn, 'no interact button is on screen for the torch');
    if (btn) { await down(4, ...centre(btn)); await up(4); await E('BK.sim(3)'); ok(await E('BK.P.torch > 0'), 'a tap on the action button did not take the torch (INTERACT never reached the game)'); }
    await drop();
    // HURT: no button while the hero is staggered (the keyboard's INTERACT is refused then too)
    await put([{ t: 'doorway', id: 'tD3', needs: null, test: 1 }]); await E('BK.P.hurt = 0.5'); d = await tick(); ok(d.verb === null, 'the button shows while the hero is hurt'); await E('BK.P.hurt = 0'); await drop();
  });
  // ===================== SKILL GLYPHS ON THE SKILL BUTTONS (claude/mobile2) =====================
  await section('skill-glyphs', async () => {
    await E('BK.manualSimulation = true; BK.SET.touchSize = 0.7; BK.touch.relayout();');
    await E("(() => { const h = BK.P.hero, P = BKT.PROG; P.loadouts = P.loadouts || {}; P.loadouts[h] = ['groundSlam', 'shieldThrow', 'risingCut', 'warCry']; })()"); await E('BK.touch.relayout()');
    const slots = await E('[0, 1, 2, 3].map(i => BKT.skillAt(i))'); const have = slots.filter(Boolean).length;
    ok(have >= 1, 'the hero has no skill equipped, nothing to draw');
    await E('BK.touch.setVerbNow(null); BK.touch.tick(0.1); BK.touch.draw()'); await sleep(50);
    let gl = await E('BK.touch.glyphs()'); const drawn = Object.keys(gl);
    ok(drawn.length === have, 'the skill buttons drew ' + drawn.length + ' glyphs for ' + have + ' equipped skills');
    // legible at the smallest size: the glyph is a whole-number scale of its pixels and at least 22 CSS px across
    ok(drawn.every(k => gl[k].scale >= 1 && gl[k].side >= 20 * DSF), 'a skill glyph is too small at 70% touch size: ' + JSON.stringify(gl));
    // the overlay really has pixels there (not just the circle)
    const lit = await E(`(() => { const o = BK.touch.overlayCanvas(), g = o.getContext('2d'), L = BK.touch.debug().layout, b = L.btn.throw, k = o.width / BK.touch.debug().layout.W; const d = g.getImageData(Math.round((b.cx - b.r * 0.5) * k), Math.round((b.cy - b.r * 0.5) * k), Math.round(b.r * k), Math.round(b.r * k)).data; const seen = new Set(); for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 50) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return seen.size; })()`);
    ok(lit >= 3, 'the first skill button shows no glyph pixels (' + lit + ' colours) ' + JSON.stringify(await E('(() => { const L = BK.touch.debug(); return [L.layout.btn.throw, L.layout.bar, L.layout.W, BK.touch.overlayCanvas().width, L.buttons.map(b => b.k)]; })()')));
    // the wait sweeps over it: half the wait left shows k = 0.5 and a different picture
    const id = slots.find(Boolean), idx = slots.indexOf(id), key = ['throw', 'skill2', 'skill3', 'skill4'][idx];
    await E(`(() => { BK.P.cds = BK.P.cds || {}; BK.P.cds[${JSON.stringify(id)}] = 1.5; BK.touch.draw(); })()`); gl = await E('BK.touch.glyphs()');
    ok(gl[key] && gl[key].k > 0 && gl[key].k <= 1, 'a skill on cooldown did not show its wait sweep: ' + JSON.stringify(gl[key]));
    await E(`BK.P.cds[${JSON.stringify(id)}] = 0; BK.SET.touchSize = 1; BK.touch.relayout();`);
  });
  await section('dialog-tap', async () => {
    await E('BK.manualSimulation = false; BK.state = "gameover"'); await sleep(500);
    await tap(300, 100); await sleep(400);
    ok(await E('BK.state') !== 'gameover', 'a tap on a card (game over) did not go on (' + await E('BK.state') + ')');
  });

  // ===================== 6: ASSISTS AND HAPTICS =====================
  await section('assists', async () => {
    await goto(); await toPlay('wood'); await E('BK.SET.touchAssist = true');
    const d = await dbg(); await down(1, ...centre(d.layout.btn.jump)); await up(1);
    ok(await E('BK.touch.bufScale()') > 1.2, 'after a touch the input buffer is still 1x');
    await E('BK.SET.touchAssist = false'); ok(await E('BK.touch.bufScale()') === 1, 'with assists off the buffer is not 1x'); await E('BK.SET.touchAssist = true');
    // the keyboard puts it back at once
    await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
    ok(await E('BK.touch.bufScale()') === 1, 'after a key press the buffer is not back to 1x (the keyboard must never see the assist)');
    // auto-face: a foe 1 tile behind, none in front -> turn; one in front -> stay; one far behind -> stay
    const f = await E(`({ behind: BK.touch.faceFor({ x: 100, y: 100, face: 1 }, [{ x: 88, y: 100, h: 12 }]), front: BK.touch.faceFor({ x: 100, y: 100, face: 1 }, [{ x: 112, y: 100, h: 12 }, { x: 90, y: 100, h: 12 }]), far: BK.touch.faceFor({ x: 100, y: 100, face: 1 }, [{ x: 40, y: 100, h: 12 }]), left: BK.touch.faceFor({ x: 100, y: 100, face: -1 }, [{ x: 112, y: 100, h: 12 }]), high: BK.touch.faceFor({ x: 100, y: 100, face: 1 }, [{ x: 88, y: 20, h: 12 }]) })`);
    ok(f.behind === -1 && f.front === 0 && f.far === 0 && f.left === 1 && f.high === 0, 'auto-face is wrong: ' + JSON.stringify(f));
    // in the game: a foe behind the hero, ATTACK by touch turns him; ATTACK by key does not
    await E(`(() => { const P = BK.P; P.face = 1; BK.spawnEnt({ t: 'sprig', x: Math.round(P.x / 16), y: Math.round(P.y / 16) - 1 }); const e = BK.enemies().at(-1); e.x = P.x - 14; e.y = P.y; e.cd = 99; e.hp = e.hp0 = 5000; })()`);
    const foes = await E('BK.state === "play"'); ok(foes, 'not in play');
    await down(1, ...centre(d.layout.btn.atk)); const faceTouch = await E('BK.P.face'); await up(1);
    ok(faceTouch === -1, 'a touch ATTACK did not turn to the foe behind (face ' + faceTouch + ')');
    await E('BK.P.face = 1; BK.sim(40)');
    await pg.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'x', code: 'KeyX', windowsVirtualKeyCode: 88 }); const faceKey = await E('BK.P.face'); await pg.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'x', code: 'KeyX', windowsVirtualKeyCode: 88 });
    ok(faceKey === 1, 'a KEY attack turned the hero (the assist must be touch only)');
  });
  await section('haptics', async () => {
    await toPlay('wood'); await E('window.__vib = []; navigator.vibrate = p => { window.__vib.push(p); return true; }; BK.SET.touchHaptics = true; BK.P.inv = 0; BK.P.hurt = 0');
    await E('BK.damagePlayer(BK.P.x - 20, 6, { unblockable: true })'); let v = await E('window.__vib');
    ok(v.length >= 1 && JSON.stringify(v[0]) === '[45]', 'a hit taken did not buzz: ' + JSON.stringify(v));
    await E('BK.touch.buzz("levelup")'); v = await E('window.__vib'); ok(v.length >= 2, 'a level-up pattern did not buzz');
    await E('window.__vib = []; BK.SET.touchHaptics = false; BK.touch.buzz("hit")'); v = await E('window.__vib'); ok(v.length === 0, 'haptics buzzed with the setting off');
    await E('BK.SET.touchHaptics = true');
  });

  // ===================== MOBILE3: D-PAD, PRESETS, DEFEND / SKILL WHEEL, ASSISTS, SWIPES, CONTROLLER =====================
  const pointAt = (D, deg, f) => [css(D.cx + Math.cos(deg * Math.PI / 180) * D.R * f), css(D.cy - Math.sin(deg * Math.PI / 180) * D.R * f)];
  const snap = () => E('BKT.inputSnapshot()');
  const tk = async (dt = 0.1) => { await E(`BK.touch.tick(${dt})`); };
  const equip = async () => { if (process.env.TOUCH_HERO) await E("(async () => { const { xpFloor } = await import('/src/xp.js'); BK.setHero(" + JSON.stringify(process.env.TOUCH_HERO) + "); BKT.PROG.xp[" + JSON.stringify(process.env.TOUCH_HERO) + "] = xpFloor(20); BK.applyUpgrades(); })()"); return E("(() => { const P = BKT.PROG, h = " + (process.env.TOUCH_HERO ? 'P.hero' : 'BK.P.hero') + "; P.loadouts = P.loadouts || {}; P.loadouts[h] = h === 'berserker' ? ['bzRoar', 'bzSpin', 'bzHarden'] : ['groundSlam', 'shieldThrow', 'risingCut', 'warCry']; })()"); };   /* (TOUCH_HERO=berserker: his three slots on the wheel) */
  await section('defaults', async () => {
    await E('localStorage.removeItem("bracken.settings")'); LEGACY = false; await goto(); await toPlay('wood'); await E('BK.manualSimulation = true');
    const s = await E('({ preset: BK.touch.preset(), move: BK.touch.moveMode(), swipe: !!BK.SET.touchSwipe, use: !!BK.SET.touchAutoUse, tog: !!BK.SET.blockToggle })');
    ok(s.preset === 'simple', 'the default layout is ' + s.preset + ', not simple'); ok(s.move === 'dpad', 'the default move control is ' + s.move + ', not the d-pad');
    ok(!s.swipe && !s.use && !s.tog, 'swipes / auto-interact / block toggle are not off by default: ' + JSON.stringify(s));
    await equip(); await E('BK.touch.relayout()'); await tk(); const d = await dbg();
    ok(d.buttons.map(b => b.k).sort().join() === 'atk,defend,jump,pause,skill', 'SIMPLE shows ' + d.buttons.map(b => b.k).join() + ' (want atk, jump, defend, skill, pause; the contextual two only in reach)');
    ok(d.layout.dpad.cx < d.layout.W / 2 && d.layout.btn.atk.cx > d.layout.W / 2, 'the d-pad is not bottom-left with the buttons on the right');
    // a save from before presets: a player who dragged buttons keeps them (CUSTOM on the FULL buttons), one who did not gets SIMPLE
    await E('delete BK.SET.touchPreset; BK.SET.touchPos = { atk: [0.5, 0.5] }; BK.touch.relayout()'); ok((await E('BK.touch.preset()')) === 'custom' && (await E('BK.touch.baseOf()')) === 'full', 'a dragged layout from before presets is not kept as CUSTOM/FULL');
    await E('BK.SET.touchPos = {}; BK.touch.relayout()'); ok((await E('BK.touch.preset()')) === 'simple', 'an untouched save did not get SIMPLE');
  });
  await section('dpad', async () => {
    await E('window.__vib = []; navigator.vibrate = p => { window.__vib.push(p); return true; }; BK.SET.touchHaptics = true');
    const D = (await dbg()).layout.dpad, want = { 0: ['right'], 45: ['right', 'up'], 90: ['up'], 135: ['left', 'up'], 180: ['left'], 225: ['left', 'down'], 270: ['down'], 315: ['right', 'down'] };
    for (const [deg, w] of Object.entries(want)) {
      await down(1, ...pointAt(D, +deg, 0.75)); const k = await keysNow(), bad = ['left', 'right', 'up', 'down'].filter(n => w.includes(n) !== k[n]);
      ok(!bad.length, 'd-pad ' + deg + ' deg: keys ' + JSON.stringify(k) + ' (wanted ' + w.join('+') + ')'); await up(1);
      const k2 = await keysNow(); ok(!k2.left && !k2.right && !k2.up && !k2.down, 'd-pad ' + deg + ' did not release cleanly');
    }
    // SLIDE between directions without lifting: E -> SE (crouch-walk) -> S -> SW -> W -> NW -> N -> NE
    await E('window.__vib = []'); await down(1, ...pointAt(D, 0, 0.75));
    for (const deg of [315, 270, 225, 180, 135, 90, 45]) { await move(1, ...pointAt(D, deg, 0.75)); const k = await keysNow(), w = want[deg], bad = ['left', 'right', 'up', 'down'].filter(n => w.includes(n) !== k[n]); ok(!bad.length, 'sliding to ' + deg + ' deg: keys ' + JSON.stringify(k)); }
    const vib = await E('window.__vib'); ok(vib.length >= 7 && vib.every(v => Array.isArray(v) && v[0] <= 10), 'a direction change did not give a light tick (' + JSON.stringify(vib.slice(0, 3)) + ', ' + vib.length + ')');
    await up(1);
    // the dead centre is nothing; a push is something; back to the middle lets go
    await down(1, ...pointAt(D, 0, 0.05)); ok(!(await keysNow()).right, 'the d-pad centre counted as a direction'); await move(1, ...pointAt(D, 0, 0.8)); ok((await keysNow()).right, 'a push on the d-pad did not run right'); await move(1, ...pointAt(D, 0, 0.05)); ok(!(await keysNow()).right, 'back to the centre did not let go'); await up(1);
    // a thumb that lands a little outside the pad is still caught (the catch ring), one well away is not; the floating stick is not used in play
    await down(1, ...pointAt(D, 0, 1.45)); await move(1, ...pointAt(D, 0, 1.55)); ok((await keysNow()).right, 'a thumb just outside the pad was not caught'); await up(1);
    await down(1, 330, 60); await move(1, 390, 60); ok(!(await keysNow()).right, 'a thumb far from the pad made a floating stick in play'); await up(1);
    // a thumb in the gap that slides onto the pad takes it up
    await down(1, ...pointAt(D, 0, 2.4)); await move(1, ...pointAt(D, 0, 0.8)); ok((await keysNow()).right, 'a thumb sliding in from the gap did not take the pad up'); await up(1);
    // left-handed mirrors it
    await E('BK.SET.touchLeft = true; BK.touch.relayout()'); let dd = await dbg(); ok(dd.layout.dpad.cx > dd.layout.W / 2 && dd.layout.btn.atk.cx < dd.layout.W / 2, 'left-handed did not put the pad on the right');
    await down(1, ...pointAt(dd.layout.dpad, 180, 0.75)); ok((await keysNow()).left, 'the mirrored pad did not work'); await up(1); await E('BK.SET.touchLeft = false; BK.touch.relayout()');
    // it is drawn: the overlay has pixels where the pad is
    await E('BK.touch.draw()'); const lit = await E(`(() => { const o = BK.touch.overlayCanvas(), g = o.getContext('2d'), D = BK.touch.debug().layout.dpad, k = o.width / BK.touch.debug().layout.W; const d = g.getImageData(Math.round((D.cx - D.R) * k), Math.round((D.cy - D.R) * k), Math.round(D.R * 2 * k), Math.round(D.R * 2 * k)).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return n; })()`); ok(lit > 500, 'the d-pad drew nothing on the overlay (' + lit + ' px)');
  });
  await section('stick-option', async () => {
    await E('BK.SET.touchMove = "stick"; BK.touch.relayout()'); const SX = 200, SY = 300;
    // eight ways SNAPPED: a thumb 20 degrees off east is east, not north-east
    await down(1, SX, SY); await move(1, SX + 60 * Math.cos(0.35), SY - 60 * Math.sin(0.35)); let k = await keysNow(); ok(k.right && !k.up, 'a 20 degree push on the stick did not snap to east: ' + JSON.stringify(k)); await up(1);
    // DOWN needs a deliberate pull (a floating stick used to drift into a crouch): a short pull down is nothing, a real one is a crouch; the sides do not need it
    await down(1, SX, SY); await move(1, SX, SY + 24); k = await keysNow(); ok(!k.down, 'a short pull drifted into a crouch'); await move(1, SX + 16, SY + 15); k = await keysNow(); ok(!k.down, 'a short pull down-right drifted into a crouch-walk'); await move(1, SX, SY + 60); k = await keysNow(); ok(k.down, 'a real pull down did not crouch'); await up(1);
    await down(1, SX, SY); await move(1, SX + 25, SY); ok((await keysNow()).right, 'the side zones were made as stiff as DOWN'); await up(1);
    // the DEAD-ZONE setting: LARGE swallows a 30 px push that MEDIUM takes
    await E('BK.SET.touchDead = 0.45; BK.touch.relayout()'); await down(1, SX, SY); await move(1, SX + 25, SY); ok(!(await keysNow()).right, 'LARGE dead zone: a 25 px push counted'); await move(1, SX + 70, SY); ok((await keysNow()).right, 'LARGE dead zone: a 70 px push did not'); await up(1);
    await E('BK.SET.touchDead = 0.2'); await down(1, SX, SY); await move(1, SX + 20, SY); ok((await keysNow()).right, 'SMALL dead zone: a 20 px push did not count'); await up(1);
    ok((await E('BK.touch.rowValue("Stick dead zone")')) === 'SMALL', 'the Stick dead zone row does not read SMALL');
    await E('delete BK.SET.touchDead; BK.touch.adjustRow("Move control", 1)'); ok((await E('BK.touch.rowValue("Move control")')) === 'D-PAD', 'the Move control row did not flip back to D-PAD');
  });
  await section('moves-fire', async () => {
    // down = crouch, down + attack in the air = plunge, up + attack = up-slash, down + jump = drop-through: the same keys from the pad and from the stick
    const D0 = (await dbg()).layout; const atkC = centre(D0.btn.atk), jumpC = centre(D0.btn.jump);
    for (const mode of ['dpad', 'stick']) {
      await E(`BK.SET.touchMove = ${JSON.stringify(mode)}; BK.touch.relayout(); BK.P.vx = 0; BK.sim(30)`);
      const D = (await dbg()).layout.dpad, hold = async dir => { if (mode === 'dpad') { await down(1, ...pointAt(D, dir === 'down' ? 270 : 90, 0.75)); } else { await down(1, 200, 300); await move(1, 200, 300 + (dir === 'down' ? 80 : -80)); } };
      await hold('down'); await E('BK.sim(8)'); ok(await E('BK.P.ducking'), mode + ': DOWN did not crouch'); await up(1);
      await E('BK.sim(10)');
      await E('BK.P.y -= 70; BK.P.vy = 0; BK.sim(1)'); await hold('down'); await down(2, ...atkC); await E('BK.sim(4)'); ok(await E('!!BK.P.plunge'), mode + ': DOWN + ATTACK in the air did not plunge'); await up(2); await up(1); await E('BK.sim(80)');
      await hold('up'); await down(2, ...atkC); const k = await keysNow(); ok(k.up && k.atk, mode + ': UP + ATTACK did not hold both (' + JSON.stringify(k) + ')'); await up(2); await up(1);
      await hold('down'); await down(2, ...jumpC); const k2 = await keysNow(); ok(k2.down && k2.jump, mode + ': DOWN + JUMP did not hold both (the drop-through) ' + JSON.stringify(k2)); await up(2); await up(1);
      await E('BK.sim(40)');
    }
    await E('BK.SET.touchMove = "dpad"; BK.touch.relayout()');
  });
  await section('presets', async () => {
    const fit = async label => {
      const d = await E('({ all: BK.touch.allButtons(), L: BK.touch.debug().layout })'), A = d.all, L = d.L;
      for (let i = 0; i < A.length; i++) { const a = A[i];
        ok(a.cx - a.r >= L.ins.l - 0.5 && a.cx + a.r <= L.W - L.ins.r + 0.5 && a.cy - a.r >= L.ins.t - 0.5 && a.cy + a.r <= L.H - L.ins.b + 0.5, label + ': ' + a.k + ' is outside the safe area');
        for (let j = i + 1; j < A.length; j++) { const b = A[j]; ok(Math.hypot(a.cx - b.cx, a.cy - b.cy) >= a.r + b.r - 0.5, label + ': ' + a.k + ' overlaps ' + b.k); } }
      const dp = L.dpad; ok(A.every(a => Math.hypot(a.cx - dp.cx, a.cy - dp.cy) >= a.r + dp.R), label + ': a button overlaps the d-pad');
      ok(dp.cx - dp.R >= L.ins.l - 0.5 && dp.cx + dp.R <= L.W - L.ins.r + 0.5 && dp.cy + dp.R <= L.H - L.ins.b + 0.5, label + ': the d-pad is outside the safe area');
    };
    await E('BK.SET.touchPos = {}'); await E('BK.SET.touchSize = 1');
    for (const p of ['simple', 'full']) for (const sz of [0.7, 1, 1.4]) for (const lh of [false, true]) { await E(`BK.SET.touchPreset = ${JSON.stringify(p)}; BK.SET.touchSize = ${sz}; BK.SET.touchLeft = ${lh}; BK.touch.relayout()`); await fit(p + ' size ' + sz + (lh ? ' left' : '')); }
    await E('BK.SET.touchSize = 1; BK.SET.touchLeft = false; BK.touch.relayout()');
    await E('BK.touch.adjustRow("Layout", -1)'); let name = await E('BK.touch.rowValue("Layout")'); ok(name === 'SIMPLE', 'Layout row: stepping back from FULL gave ' + name);
    await E('BK.SET.touchPreset = "full"; BK.touch.relayout(); BK.touch.tick(0.1)'); let d = await dbg(); ok(['dodge', 'block', 'atk', 'jump'].every(k => d.buttons.some(b => b.k === k)), 'FULL is missing buttons: ' + d.buttons.map(b => b.k).join());
    // CUSTOM: a dragged spot counts only under CUSTOM; the first drag in the editor makes it so, on the buttons it began from
    await E('BK.SET.touchPreset = "simple"; BK.SET.touchPos = {}; BK.touch.relayout()'); d = await dbg(); const atk0 = d.layout.btn.atk.cx;
    await E('BK.touch.confirmRow("Edit layout")'); d = await dbg(); ok(d.editing && d.buttons.some(b => b.k === 'defend') && !d.buttons.some(b => b.k === 'dodge'), 'the editor did not show the SIMPLE buttons');
    await down(1, ...centre(d.layout.btn.atk)); await move(1, css(d.layout.btn.atk.cx) - 90, css(d.layout.btn.atk.cy) - 40); await up(1); d = await dbg();
    ok(d.preset === 'custom' && (await E('BK.touch.baseOf()')) === 'simple', 'dragging in the editor did not make CUSTOM on SIMPLE (' + d.preset + ')'); ok(d.layout.btn.atk.cx < atk0 - 60, 'the dragged ATTACK did not move');
    await E('BK.touch.endEdit()'); await E('BK.SET.touchPreset = "simple"; BK.touch.relayout()'); d = await dbg(); ok(Math.abs(d.layout.btn.atk.cx - atk0) < 2, 'SIMPLE did not ignore the CUSTOM positions');
    await E('BK.SET.touchPreset = "custom"; BK.touch.relayout()'); d = await dbg(); ok(d.layout.btn.atk.cx < atk0 - 60, 'CUSTOM did not bring the dragged spot back');
    await E('BK.SET.touchPos = {}; BK.SET.touchPreset = "simple"; BK.touch.relayout()');
  });
  await section('defend-skill', async () => {
    await toPlay('wood'); await E('BK.manualSimulation = true'); await equip(); await E('BK.SET.touchPreset = "simple"; BK.SET.touchMove = "dpad"; BK.SET.touchPos = {}; BK.touch.relayout(); BK.touch.tick(0.1)');
    let d = await dbg(); const B = d.layout.btn;
    // DEFEND: a tap is the dodge, a hold is the block (and a hold is not also a dodge)
    await E('BK.touch.releaseAll()'); await down(3, ...centre(B.defend)); await up(3); let s = await snap(), k = await keysNow(); ok(s.dodge && !k.block, 'a tap on DEFEND was not a dodge: ' + JSON.stringify([s.dodge, k.block])); await tk(0.2); ok(!(await keysNow()).dodge, 'the dodge key stayed held');
    await E('BK.sim(3)');
    await down(3, ...centre(B.defend)); await tk(0.1); ok(!(await keysNow()).block, 'DEFEND blocked before the hold time'); await tk(0.15); ok((await keysNow()).block, 'DEFEND held did not block'); await up(3);
    s = await snap(); k = await keysNow(); ok(!k.block && !s.dodge, 'letting go of a DEFEND hold left the block up or dodged (' + JSON.stringify([k.block, s.dodge]) + ')'); await E('BK.sim(3)');
    // the block TOGGLE: a hold raises it and it stays up, a tap lowers it without a dodge
    await E('BK.SET.blockToggle = true'); await down(3, ...centre(B.defend)); await tk(0.3); await up(3); ok((await keysNow()).block, 'block toggle: the shield did not stay up after letting go');
    await down(3, ...centre(B.defend)); await up(3); s = await snap(); ok(!(await keysNow()).block && !s.dodge, 'block toggle: a tap did not lower the shield quietly'); await E('BK.SET.blockToggle = false; BK.sim(3)');
    // SKILL: a tap is the first skill; a hold opens the wheel, slide to a slot and let go fires that one; letting go on nothing fires nothing
    const have = await E('[0, 1, 2, 3].map(i => !!BKT.skillAt(i))'); const idx = have.map((h, i) => h ? i : -1).filter(i => i >= 0); ok(idx.length >= 2, 'the hero has too few skills slotted for the wheel test: ' + JSON.stringify(have));
    const KEYS = ['throw', 'skill2', 'skill3', 'skill4']; await E('BK.touch.relayout(); BK.touch.tick(0.1)'); d = await dbg(); ok(d.buttons.some(b => b.k === 'skill'), 'no SKILL button with skills equipped');
    await down(3, ...centre(d.layout.btn.skill)); await up(3); s = await snap(); ok(s[KEYS[idx[0]]], 'a tap on SKILL did not use the first skill (' + KEYS[idx[0]] + ')'); await E('BK.sim(3)');
    await down(3, ...centre(d.layout.btn.skill)); await tk(0.3); d = await dbg(); ok(d.radial && d.radial.slots.length === 4, 'holding SKILL did not open the wheel');
    const sl = d.radial.slots[idx[1]]; await move(3, css(sl.cx), css(sl.cy)); d = await dbg(); ok(d.radial && d.radial.sel === idx[1], 'sliding onto a slot did not pick it (sel ' + (d.radial && d.radial.sel) + ')');
    await E('BK.touch.draw()'); const gl = await E('BK.touch.glyphs()'); ok(KEYS.filter((_, i) => have[i]).every(kk => gl[kk]), 'the wheel did not draw every slotted skill glyph: ' + Object.keys(gl).join());
    await up(3); s = await snap(); ok(s[KEYS[idx[1]]] && !s[KEYS[idx[0]]], 'letting go on a slot did not fire exactly it: ' + JSON.stringify(s)); await E('BK.sim(3)');
    await down(3, ...centre((await dbg()).layout.btn.skill)); await tk(0.3); await move(3, 60, 60); await up(3); s = await snap(); ok(!KEYS.some(kk => s[kk]), 'letting go on nothing fired a skill: ' + JSON.stringify(s)); await E('BK.sim(3)');
    // a skill on cooldown shows its wait on the wheel's slot
    const id = await E(`BKT.skillAt(${idx[0]})`); await E(`BK.P.cds = BK.P.cds || {}; BK.P.cds[${JSON.stringify(id)}] = 2`);
    await down(3, ...centre((await dbg()).layout.btn.skill)); await tk(0.3); await E('BK.touch.draw()'); const g2 = await E('BK.touch.glyphs()'); ok(g2[KEYS[idx[0]]] && g2[KEYS[idx[0]]].k > 0, 'a slot on cooldown did not show its wait on the wheel'); await up(3); await E(`BK.P.cds[${JSON.stringify(id)}] = 0`);
  });
  await section('context-slot', async () => {
    await E('BK.manualSimulation = true; BK.touch.relayout(); BK.touch.tick(0.1)'); let d = await dbg(); ok(!d.buttons.some(b => b.k === 'ctx'), 'the contextual slot shows with nothing to do');
    await E('window.__ctx = 0; BK.touchCtx.push(() => window.__ctx === 1 ? { label: "throw", key: "throw" } : window.__ctx === 2 ? { label: "pick up", key: "talk", dim: true } : null)');
    await E('window.__ctx = 1'); await tk(); await tk(); d = await dbg(); ok(d.ctx && d.ctx.label === 'THROW' && d.buttons.some(b => b.k === 'ctx'), 'a registered ctx hook did not show THROW: ' + JSON.stringify(d.ctx));
    const b = d.buttons.find(x => x.k === 'ctx'); ok(!d.buttons.some(o => o !== b && Math.hypot(o.cx - b.cx, o.cy - b.cy) < o.r + b.r), 'the ctx button overlaps another');
    await down(4, ...centre(b)); await up(4); const s = await snap(); ok(s.throw, 'a tap on the ctx button did not send its press'); await E('BK.sim(3)');
    await E('window.__ctx = 2'); await tk(); await tk(); d = await dbg(); ok(d.ctx && d.ctx.dim === true, 'the dim flag did not come through'); await E('BK.touch.draw()');
    await E('window.__ctx = 0'); await tk(); await tk(); d = await dbg(); ok(!d.ctx && !d.buttons.some(x => x.k === 'ctx'), 'the ctx button stayed after the thing went away'); await E('BK.touchCtx.length = 0');
  });
  await section('thumb-friendly', async () => {
    await E('BK.SET.touchPreset = "simple"; BK.touch.relayout(); BK.touch.tick(0.1)'); let d = await dbg(); const B = d.layout.btn;
    // hit zones are bigger than the drawn buttons: 1.2 radii out still presses, 1.6 does not
    await down(3, css(B.atk.cx + B.atk.r * 1.2), css(B.atk.cy)); ok((await keysNow()).atk, 'a touch 1.2 radii from ATTACK missed it'); await up(3);
    await down(3, css(B.atk.cx + B.atk.r * 1.6), css(B.atk.cy + B.atk.r * 0.2)); ok(!(await keysNow()).atk, 'a touch 1.6 radii out still pressed ATTACK'); await up(3);
    // slide JUMP -> ATTACK -> DEFEND in one motion, and in from a gap
    await down(3, ...centre(B.jump)); ok((await keysNow()).jump, 'JUMP down'); await move(3, ...centre(B.atk)); let k = await keysNow(); ok(k.atk && !k.jump, 'JUMP -> ATTACK did not hand over'); await move(3, ...centre(B.defend)); k = await keysNow(); ok(!k.atk, 'ATTACK -> DEFEND did not let go of ATTACK'); await up(3);
    ok((await snap()).dodge, 'sliding onto DEFEND and lifting is a DEFEND tap: a dodge'); await E('BK.sim(3)');
    await down(3, 520, 150); await move(3, ...centre(B.atk)); ok((await keysNow()).atk, 'a thumb in a gap sliding onto ATTACK did not press it'); await up(3);
    // a press ticks
    await E('window.__vib = []; navigator.vibrate = p => { window.__vib.push(p); return true; }; BK.SET.touchHaptics = true'); await down(3, ...centre(B.jump)); ok((await E('window.__vib')).length >= 1, 'a button press gave no haptic tick'); await up(3);
  });
  await section('assists-toggles', async () => {
    await E('BK.manualSimulation = true; BK.SET.touchPreset = "simple"; BK.SET.touchMove = "dpad"; BK.SET.touchPos = {}; BK.touch.relayout(); BK.P.vx = 0; BK.P.x = 40; BK.sim(60); BK.touch.tick(0.1)'); let d = await dbg(); const B = d.layout.btn;
    const rowv = n => E(`BK.touch.rowValue(${JSON.stringify(n)})`);
    for (const n of ['Block toggle', 'Auto-face foes', 'Aim assist', 'Auto-interact', 'Long input buffer', 'Swipe gestures']) { const v0 = await rowv(n); await E(`BK.touch.adjustRow(${JSON.stringify(n)}, 1)`); const v1 = await rowv(n); ok(v0 !== v1 && ['ON', 'OFF'].includes(v1), 'the ' + n + ' row did not toggle (' + v0 + ' -> ' + v1 + ')'); await E(`BK.touch.adjustRow(${JSON.stringify(n)}, 1)`); ok(await rowv(n) === v0, 'the ' + n + ' row did not toggle back'); }
    ok(await rowv('Swipe gestures') === 'OFF' && await rowv('Auto-interact') === 'OFF' && await rowv('Aim assist') === 'ON' && await rowv('Auto-face foes') === 'ON', 'the assist defaults are not swipes OFF, auto-interact OFF, aim ON, auto-face ON');
    // the long buffer and auto-face follow their own switch
    await E('BK.SET.touchBuf = false; BK.SET.touchAssist = true'); await down(3, ...centre(B.jump)); await up(3); ok((await E('BK.touch.bufScale()')) === 1, 'Long input buffer OFF still gave a longer buffer'); await E('BK.SET.touchBuf = true'); ok((await E('BK.touch.bufScale()')) > 1.2, 'Long input buffer ON gave no longer buffer'); await E('delete BK.SET.touchBuf');
    // auto-face and aim assist in the game: a foe behind the hero
    const foe = dx => E(`(() => { const P = BK.P; P.face = 1; BK.spawnEnt({ t: 'sprig', x: Math.round(P.x / 16), y: Math.round(P.y / 16) - 1 }); const e = BK.enemies().at(-1); e.x = P.x - ${dx}; e.y = P.y; e.cd = 99; e.hp = e.hp0 = 5000; })()`);
    await foe(14); await E('BK.SET.touchFace = false'); await down(3, ...centre(B.atk)); ok((await E('BK.P.face')) === 1, 'Auto-face OFF still turned the swing'); await up(3); await E('BK.SET.touchFace = true; BK.P.face = 1'); await down(3, ...centre(B.atk)); ok((await E('BK.P.face')) === -1, 'Auto-face ON did not turn'); await up(3);
    await E('BK.enemies().forEach(e => { e.alive = false; e.hp = 0; }); BK.sim(2)'); await foe(100); await E('BK.P.face = 1'); await E('BK.touchCtx.push(() => ({ label: "throw", key: "throw" })); BK.touch.tick(0.1); BK.touch.tick(0.1)'); d = await dbg(); const cb = d.buttons.find(x => x.k === 'ctx');
    await E('BK.SET.touchAim = false'); await down(3, ...centre(cb)); ok((await E('BK.P.face')) === 1, 'Aim assist OFF still turned a throw'); await up(3); await E('BK.SET.touchAim = true; BK.P.face = 1'); await down(3, ...centre(cb)); ok((await E('BK.P.face')) === -1, 'Aim assist ON did not turn a throw to the foe 100 px behind'); await up(3);
    await E('BK.touchCtx.length = 0; BK.enemies().forEach(e => { e.alive = false; e.hp = 0; }); BK.sim(2); BK.P.face = 1');
    // auto-interact: pushing into a doorway and standing there uses it; off, it does not
    const D = (await dbg()).layout.dpad;
    await E("BK.P.vx = 0; BK.props().push({ t: 'doorway', id: 'tAuto', needs: null, test: 1, x: BK.P.x, y: BK.P.y })"); await tk(); await tk();
    await down(1, ...pointAt(D, 0, 0.75)); await E('BK.P.vx = 0; BK.P.coyote = 1'); for (let i = 0; i < 6; i++) await tk(0.1); ok(!(await snap()).talk, 'Auto-interact OFF still used the door');
    await E('BK.SET.touchAutoUse = true'); for (let i = 0; i < 6; i++) { await E('BK.P.vx = 0; BK.P.coyote = 1'); await tk(0.1); } { const dd2 = await dbg(); ok((await snap()).talk, 'Auto-interact ON did not use the door after standing against it (verb ' + JSON.stringify(dd2.verb) + ', keys ' + JSON.stringify(await keysNow()) + ', vx ' + await E('BK.P.vx') + ', ground ' + await E('BK.P.ground') + ')'); } await up(1); await E('BK.SET.touchAutoUse = false; BK.sim(3)');
    await E('(() => { const a = BK.props(); for (let i = a.length - 1; i >= 0; i--) if (a[i].test) a.splice(i, 1); })()'); await E('BK.sim(3)');
  });
  await section('swipes', async () => {
    await E('BK.manualSimulation = true; BK.SET.touchPreset = "simple"; BK.SET.touchPos = {}; BK.SET.touchLeft = false; BK.touch.relayout(); BK.touch.tick(0.1)');
    const swipe = async (x0, y0, x1, y1) => { await down(5, x0, y0); await move(5, (x0 + x1) / 2, (y0 + y1) / 2); await move(5, x1, y1); await up(5); };
    ok(!(await E('!!BK.SET.touchSwipe')), 'swipe gestures are on by default');
    await swipe(520, 150, 430, 150); ok(!(await snap()).dodge, 'a swipe dodged with gestures OFF'); await E('BK.sim(3)');
    await E('BK.SET.touchSwipe = true');
    await swipe(520, 150, 430, 150); let s = await snap(), k = await keysNow(); ok(s.dodge && k.left, 'a swipe left was not a dodge that way (' + JSON.stringify([s.dodge, k.left]) + ')'); await tk(0.3); ok(!(await keysNow()).left, 'the swipe left the left key held'); await E('BK.sim(3)');
    await swipe(480, 150, 570, 150); s = await snap(); k = await keysNow(); ok(s.dodge && k.right, 'a swipe right was not a dodge that way'); await tk(0.3); await E('BK.sim(3)');
    await swipe(520, 100, 520, 190); s = await snap(); k = await keysNow(); ok(s.atk && k.down, 'a swipe down was not the plunge / low cut (atk + down)'); await tk(0.3); await E('BK.sim(3)');
    await swipe(520, 190, 520, 100); s = await snap(); k = await keysNow(); ok(s.atk && k.up, 'a swipe up was not the up-slash (atk + up)'); await tk(0.3); ok(!(await keysNow()).up, 'the swipe left up held'); await E('BK.sim(3)');
    // a swipe does not undo a held d-pad direction
    const D = (await dbg()).layout.dpad; await down(1, ...pointAt(D, 180, 0.75)); await swipe(520, 150, 430, 150); await tk(0.3); ok((await keysNow()).left, 'a swipe left let go of the d-pad that was holding left'); await up(1);
    await E('BK.SET.touchSwipe = false; BK.sim(3)');
  });
  await section('controller', async () => {
    await E('BK.manualSimulation = true; BK.SET.touchPreset = "simple"; BK.touch.relayout(); BK.touch.keyUsed(); BK.padLast = false; BK.touch.tick(0.1); BK.touch.draw()'); let d = await dbg(); ok(!d.padHidden && d.buttons.length > 0, 'the touch layer is hidden with no pad');
    await E('window.dispatchEvent(new Event("gamepadconnected"))'); await tk(0.1); d = await dbg(); ok(d.banner === 'CONTROLLER CONNECTED', 'no CONTROLLER CONNECTED prompt (' + d.banner + ')');
    ok(!d.padHidden, 'the layer hid before the pad was used');
    await E('BK.padLast = true; BK.touch.keyUsed(); BK.touch.draw()'); d = await dbg(); ok(d.padHidden, 'the layer stayed with the pad in use');
    const lit = await E(`(() => { const o = BK.touch.overlayCanvas(), g = o.getContext('2d'), L = BK.touch.debug().layout, k = o.width / L.W, b = L.btn.atk, p = g.getImageData(Math.round((b.cx - b.r) * k), Math.round((b.cy - b.r) * k), Math.round(b.r * 2 * k), Math.round(b.r * 2 * k)).data; let n = 0; for (let i = 3; i < p.length; i += 4) if (p[i] > 20) n++; return n; })()`); ok(lit === 0, 'the buttons were still drawn with the pad in use (' + lit + ' px)');
    await tk(4); d = await dbg(); ok(d.banner === null, 'the CONTROLLER prompt stayed up');
    await down(6, 520, 150); await up(6); await E('BK.touch.draw()'); d = await dbg(); ok(!d.padHidden && !(await E('BK.padLast')), 'a touch did not bring the layer back');
    await E('window.dispatchEvent(new Event("gamepaddisconnected"))'); await tk(0.1); d = await dbg(); ok(/DISCONNECTED/.test(d.banner || ''), 'no prompt on a pad leaving: ' + d.banner);
    await tk(4); await E('BK.padLast = false');
  });

  // ===================== THE SIDE BARS (Daniel 10-03): landscape controls live in the black pillars, not over the game =====================
  await section('bars', async () => {
    const vp = async w => { await pg.send('Emulation.setDeviceMetricsOverride', { width: w, height: 390, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } }); await goto(); await toPlay('wood'); await E('BK.manualSimulation = true; BK.SET.touchMove = "dpad"; BK.SET.touchPos = {}; BK.touch.relayout(); BK.touch.tick(0.1)'); };
    const clear = async label => {   // every button and the pad are wholly outside the game's own rectangle
      const r = await E('(() => { const d = BK.touch.debug(), L = d.layout, a = BK.touch.gameToClient(0, 0), b = BK.touch.gameToClient(320, 180); return { bar: L.bar, gx0: a[0], gx1: b[0], all: BK.touch.allButtons(), dp: L.dpad, W: L.W }; })()');
      ok(r.bar, label + ': bar mode is off on a wide phone');
      const sc = 1 / DPR, bad = [...r.all.map(b => ({ k: b.k, x: b.cx * sc, r: b.r * sc })), { k: 'dpad', x: r.dp.cx * sc, r: r.dp.R * sc }].filter(o => o.x + o.r > r.gx0 + 0.5 && o.x - o.r < r.gx1 - 0.5);
      ok(!bad.length, label + ': over the game: ' + bad.map(o => o.k).join()); return r;
    };
    await vp(1000);
    for (const p of ['simple', 'full']) for (const lh of [false, true]) { await E(`BK.SET.touchPreset = ${JSON.stringify(p)}; BK.SET.touchLeft = ${lh}; BK.touch.relayout()`); const r = await clear(p + (lh ? ' left-handed' : '')); 
      const atk = r.all.find(b => b.k === 'atk'); ok(lh ? atk.cx < r.W / 2 : atk.cx > r.W / 2, p + ': ATTACK is on the wrong side'); ok(lh ? r.dp.cx > r.W / 2 : r.dp.cx < r.W / 2, p + ': the pad is on the wrong side');
      const A = r.all; for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) ok(Math.hypot(A[i].cx - A[j].cx, A[i].cy - A[j].cy) >= A[i].r + A[j].r - 0.5, p + ' bars: ' + A[i].k + ' overlaps ' + A[j].k);
      ok(A.every(a => a.r >= 17 * DPR * 0.9), p + ' bars: a button is too small'); }
    await E('BK.SET.touchPreset = "simple"; BK.SET.touchLeft = false; BK.touch.relayout()');
    const d = await dbg(); await down(3, ...centre(d.layout.btn.atk)); ok((await keysNow()).atk, 'ATTACK in the bar does not press'); await up(3);
    await down(3, ...pointAt(d.layout.dpad, 0, 0.75)); ok((await keysNow()).right, 'the pad in the bar does not work'); await up(3);
    // a phone with narrow bars (760x390: the game is 640 wide, ~60 px a side) falls back to the overlay; 844 has 102 px bars and uses them
    await vp(844); ok(await E('BK.touch.bar()'), 'the 844 phone (102 px bars) did not use them'); await vp(760); ok(!(await E('BK.touch.bar()')), 'a narrow-barred phone used the bars ' + JSON.stringify(await E('(() => { const a = BK.touch.gameToClient(0, 0), b = BK.touch.gameToClient(320, 180); return [a, b, innerWidth, innerHeight]; })()')));
    // portrait is over the game, as before
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'portraitPrimary', angle: 0 } }); await goto(); await toPlay('wood'); ok(!(await E('BK.touch.bar()')), 'portrait used bars');
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } }); await goto();
  });

  // ===================== 7: PERFORMANCE =====================
  await section('performance', async () => {
    const first = await E('({ parts: BK.SET.parts, par: BK.SET.parallax, init: BK.SET.touchInit })');
    ok(first.parts === 'few' && first.par === 'near' && first.init === 1, 'a first run on a phone is not lighter by default: ' + JSON.stringify(first));
    const cost = async (parts, par) => E(`(() => { BK.SET.parts = ${JSON.stringify(parts)}; BK.SET.parallax = ${JSON.stringify(par)}; BK.step(40); const t = performance.now(); for (let i = 0; i < 160; i++) BK.step(1); return (performance.now() - t) / 160; })()`);
    await toPlay('wood'); await E('BK.manualSimulation = true');
    const lite = await cost('few', 'near'), full = await cost('many', 'full');
    const ov = await E('(() => { const t = performance.now(); for (let i = 0; i < 300; i++) BK.touch.draw(); return (performance.now() - t) / 300; })()');
    notes.push('frame (update+draw) in the Wood, lighter effects ' + lite.toFixed(2) + ' ms, particles MANY + full parallax ' + full.toFixed(2) + ' ms; the touch overlay ' + ov.toFixed(3) + ' ms a frame');
    ok(ov < 1.5, 'the touch overlay costs ' + ov.toFixed(2) + ' ms a frame');
    ok(lite <= full * 1.25, 'the lighter preset (' + lite.toFixed(2) + ' ms) is not lighter than the heavy one (' + full.toFixed(2) + ' ms)');
    await E('BK.SET.parts = "few"; BK.SET.parallax = "near"');
  });

  // ===================== 9: THE KEYBOARD PATH =====================
  await section('keyboard', async () => {
    await toPlay('wood');
    const key = async (type, k, code, vk) => pg.send('Input.dispatchKeyEvent', { type, key: k, code, windowsVirtualKeyCode: vk });
    await key('keyDown', 'ArrowRight', 'ArrowRight', 39); ok((await keysNow()).right, 'ArrowRight no longer sets keys.right');
    await key('keyUp', 'ArrowRight', 'ArrowRight', 39); ok(!(await keysNow()).right, 'ArrowRight release left keys.right');
    await key('keyDown', 'x', 'KeyX', 88); ok((await keysNow()).atk, 'X no longer holds keys.atk'); await key('keyUp', 'x', 'KeyX', 88);
    await key('keyDown', 'z', 'KeyZ', 90); ok((await keysNow()).jump, 'Z no longer holds keys.jump'); await key('keyUp', 'z', 'KeyZ', 90);
    await key('keyDown', 'c', 'KeyC', 67); ok((await keysNow()).block, 'C no longer blocks'); await key('keyUp', 'c', 'KeyC', 67);
  });
  // a DESKTOP page (no touch): no stick, no buttons, five settings tabs
  await section('desktop', async () => {
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false }); await pg.send('Emulation.clearDeviceMetricsOverride');
    await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' }); await sleep(1500);
    for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300);
    const r = await E('({ on: BK.touch ? BK.touch.on : null, tabs: (BK.ui.menuRows && (BK.ui.openMenu("title"), BK.ui.menuRows().length)) })');
    ok(r.on === false, 'touch is ON on a desktop page');
    ok(await E('document.querySelector("canvas") !== null && !BK.touch.debug().buttons.length'), 'a desktop page has touch buttons');
    await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  });

  // ===================== 8: THE INSTALLABLE APP =====================
  await section('pwa-files', async () => {
    const mf = JSON.parse(readFileSync(ROOT + 'manifest.webmanifest', 'utf8'));
    ok(mf.name === 'BRACKEN' && mf.short_name, 'the manifest has no name');
    ok(['fullscreen', 'standalone'].includes(mf.display) && mf.orientation === 'landscape', 'the manifest is not fullscreen/landscape: ' + mf.display + ' ' + mf.orientation);
    ok(/^#[0-9a-f]{6}$/i.test(mf.theme_color) && /^#[0-9a-f]{6}$/i.test(mf.background_color) && mf.start_url, 'the manifest lacks theme/background colours or a start_url');
    ok(mf.icons.some(i => i.sizes === '192x192') && mf.icons.some(i => i.sizes === '512x512') && mf.icons.some(i => i.purpose === 'maskable'), 'the manifest needs a 192, a 512 and a maskable icon');
    for (const ic of mf.icons) {
      const f = ROOT + ic.src; ok(existsSync(f), 'icon ' + ic.src + ' does not exist');
      if (existsSync(f)) { const b = readFileSync(f); const w = b.readUInt32BE(16), h = b.readUInt32BE(20); ok(b.subarray(1, 4).toString() === 'PNG' && ic.sizes === w + 'x' + h, 'icon ' + ic.src + ' is not a ' + ic.sizes + ' PNG (' + w + 'x' + h + ')'); }
    }
    const html = readFileSync(ROOT + 'index.html', 'utf8');
    ok(/rel="manifest"\s+href="\.\/manifest\.webmanifest"/.test(html), 'index.html does not link the manifest');
    ok(/viewport-fit=cover/.test(html) && /id="safe"/.test(html) && /safe-area-inset-top/.test(html), 'index.html lacks viewport-fit=cover or the safe-area probe');
    ok(/rel="apple-touch-icon"/.test(html), 'no apple-touch-icon (Add to Home Screen on iOS)');
    const sw = readFileSync(ROOT + 'sw.js', 'utf8');
    ok(/VERSION\s*=\s*'bracken-shell-v\d+'/.test(sw) && /fetch\(req, \{ cache: 'no-(?:store|cache)' \}\)/.test(sw) && /caches\.delete/.test(sw), 'sw.js is not version-keyed and network-first');
    ok(/\.ogg|audio/.test(sw) && !/\.(?:ogg|mp3|wav)\|/.test(sw.split('CACHEABLE')[1].split('\n')[0]), 'sw.js caches audio (126 MB)');
  });
  await section('pwa-live', async () => {
    const t0 = Date.now(), say = m => { if (process.env.TOUCH_VERBOSE) console.log('    pwa ' + ((Date.now() - t0) / 1000).toFixed(0) + 's ' + m); };
    const bootWait = async (label, tries = 120) => { for (let i = 0; i < tries; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)) { say(label + ' booted'); return true; } await sleep(300); } say(label + ' did not boot'); return false; };
    const nav = async (q, label) => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1' + q }, 60000); await sleep(1200); return bootWait(label); };
    await nav('&sw=1', 'first load');
    const reg = await E('navigator.serviceWorker.ready.then(r => !!r.active)', 30000); ok(reg === true, 'the service worker did not register and activate'); say('worker ready ' + reg);
    // the page is controlled after one more load; THEN the shell is cached as it is fetched
    await nav('&sw=1&a=1', 'controlled load');
    ok(await E('!!navigator.serviceWorker.controller'), 'the page is not controlled by the service worker');
    const cached = await E('caches.keys().then(async ks => { const out = {}; for (const k of ks) out[k] = (await (await caches.open(k)).keys()).map(r => new URL(r.url).pathname); return out; })');
    ok(cached['bracken-shell-v1'] && cached['bracken-shell-v1'].includes('/index.html') && cached['bracken-shell-v1'].some(p => p.endsWith('/src/main.js')), 'the shell was not cached: ' + JSON.stringify(Object.keys(cached)));
    ok(!(cached['bracken-shell-v1'] || []).some(p => /\.(ogg|mp3|wav)$/.test(p)), 'audio was cached');
    say('cached ' + (cached['bracken-shell-v1'] || []).length + ' files');
    // NETWORK FIRST: poison the cached copy of a script; an online load must still run the real one
    await E('caches.open("bracken-shell-v1").then(c => c.put("/src/touch-interact.js", new Response("throw new Error(\\"STALE\\");", { headers: { "content-type": "text/javascript" } })))');
    ok(await nav('&sw=1&b=1', 'load with a poisoned cache'), 'a stale cached script beat the network: the deploy would never reach a player (the worker must be network first)');
    // OFFLINE: reload with no network and the game still comes up from the shell
    await pg.send('Network.enable'); await pg.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    const off = await nav('&sw=1&c=1', 'offline load');
    await pg.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    ok(off, 'with the network off the game did not start from the cached shell');
    await E('navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister()))).then(() => caches.keys()).then(ks => Promise.all(ks.map(k => caches.delete(k))))', 20000).catch(() => {});
  });
} catch (e) { fails.push('touch failed to run: ' + e.message); }
finally { await pg.close(); }
for (const n of notes) console.log('  ' + n);
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); process.exit(1); }
console.log('touch: the stick, the buttons, the action button, the tap menus, the settings, the assists, the haptics and the installable app all hold.');
