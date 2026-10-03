// src/touch.js - THE PHONE'S HANDS (claude/mobile, 2026-10-02). Everything a thumb does lives here; main.js keeps a few small hooks.
//
//   FLOATING STICK   a thumb down anywhere on the left ~45% is the stick's centre. Eight ways with a dead zone, and UP and DOWN are real
//                    zones of their own: up-slash, ladder, look up / crouch, duck, lift, and the menus' up and down. Drawn as a base and a knob.
//   ACTION BUTTON    one button that appears ONLY when INTERACT would do something, labelled with its verb (src/touch-interact.js).
//   RIGHT HAND       big ATTACK + JUMP, DODGE and BLOCK arced round the thumb, smaller skill buttons (only the slotted ones), pause top corner.
//                    Safe-area insets keep all of it off the notch and the home bar. ATTACK held is still the heavy swing.
//   TAP MENUS        main.js registers a hit box for each row it draws (hit()); a tap picks it. Where nothing is drawn to tap, a pill button
//                    (OK / BACK / the state's own extra) does what the key would. The stick still walks any list.
//   SETTINGS         a TOUCH tab (size, opacity, left-handed, DRAG-TO-REPOSITION, reset, assists, haptics, lighter effects).
//   ASSISTS          a longer input buffer and an auto-face on ATTACK - for touch presses only; keyboard and pad never see either.
//   HAPTICS          navigator.vibrate on a hit taken, a block, a parry, a level-up (silent where the platform has none: iPhone).
//
// The module owns no game state: main.js hands it an `env` of small accessors. All layout is in DISPLAY pixels (the canvas's own), and the
// hit boxes are in GAME pixels (the 320x180 sheet) because that is what the menus draw in.
import { TABS, TAB_ITEMS } from './settings-ui.js';

export const TOUCH_ROWS = ['- LAYOUT -', 'Touch size', 'Touch opacity', 'Left-handed', 'Edit layout', 'Reset layout', '- HELP -', 'Touch assists', 'Haptics', 'Lighter effects'];
export const TOUCH_TIPS = {
  'Touch size': 'how big the buttons and the stick are', 'Touch opacity': 'how see-through the buttons are',
  'Left-handed': 'swaps the stick and the buttons', 'Edit layout': 'drag any button where your thumb wants it', 'Reset layout': 'every button back where it started',
  'Touch assists': 'a longer input buffer, and ATTACK turns to a foe just behind you', 'Haptics': 'a buzz on a hit, a block, a parry and a level-up (not on iPhone)',
  'Lighter effects': 'fewer particles and background layers, for a phone',
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FONT = '"Press Start 2P", monospace';
/* states where a tap anywhere means "go on" (a card, a line of talk, a result): there is nothing to aim at */
const TAP_ANY = new Set(['talk', 'intro', 'win', 'victory', 'gameover', 'rushover', 'rushwin', 'credits', 'coophelp', 'herocard']);
/* states where a held stick direction repeats like a held key (the lists that do not repeat themselves) */
const REPEAT = new Set(['menu', 'store', 'title', 'slots', 'bestiary', 'soundtest', 'heropick', 'coop', 'practice', 'controls', 'rebind']);
/* what the pill buttons say in a state with no play buttons: [the press, the label] - the first is the main one */
const ACTIONS = {
  map: [['confirm', 'ENTER'], ['dodge', 'STORE'], ['atk', 'BEASTS'], ['map', 'LEVELS'], ['throw', 'CO-OP']],
  slots: [['confirm', 'PLAY'], ['atk', 'ERASE']],
  store: [['confirm', 'SELECT'], ['atk', 'MORE']],
  bestiary: [['confirm', 'MORE'], ['throw', 'REFIGHT']],
  coop: [['confirm', 'OK'], ['atk', 'ALLY']],
  title: [],   // the rows are the buttons: a tap picks and goes in
};
const PLAY_BTNS = ['atk', 'jump', 'dodge', 'block', 'throw', 'skill2', 'skill3', 'skill4', 'interact'];
const HOLD = { atk: 'atk', jump: 'jump', dodge: 'dodge', block: 'block', throw: 'throw' };   /* the keys[] entry each button holds down while it is touched */
const SKILL_OF = { throw: 0, skill2: 1, skill3: 2, skill4: 3 };
/* where every button sits, in units of s (the button size), from the thumb's rest point P: [dx, dy, radius]. Right-handed; left-handed mirrors dx. */
const SPOT = {
  atk: [0, 0, 0.78], jump: [-0.55, -1.75, 0.7], dodge: [-1.95, -0.35, 0.52], block: [-2.35, -1.55, 0.52],
  interact: [-0.4, -3.2, 0.6], throw: [-1.75, -3.0, 0.4], skill2: [-2.85, -2.5, 0.4], skill3: [-3.75, -1.6, 0.4], skill4: [-4.2, -0.4, 0.4],
};
const LABEL = { throw: 'F', skill2: 'G', skill3: '3', skill4: '4' };

export function createTouch(env) {
  const { disp, dg, q, SET } = env;
  const on = ('ontouchstart' in window && navigator.maxTouchPoints > 0) || q.get('touch') === '1';
  const touches = new Map();              // touch id -> { role: 'stick' | 'btn' | 'tap' | 'drag', k, ... }
  let stick = null;                       // { id, cx, cy, x, y, sec }  (display pixels)
  let lastTouchAt = -1e9, verb = null, verbAt = 0, lay = null, layKey = '', editing = false, drag = null, hitsNow = [];
  const held = {};                        // the keys[] entries WE are holding down, so a release never lets go of the keyboard's
  const rep = { t: 0, n: 0 };
  const num = (k, d) => (typeof SET[k] === 'number' && isFinite(SET[k]) ? SET[k] : d);
  const size = () => clamp(num('touchSize', 1), 0.7, 1.4), opacity = () => clamp(num('touchOpacity', 0.6), 0.2, 1);
  const left = () => !!SET.touchLeft;
  const recent = () => performance.now() - lastTouchAt < 6000;

  if (on) {   // the Touch tab joins Settings on a phone only (the strip has room for six when two names are short)
    if (!TABS.some(t => t.id === 'touch')) {
      TABS.push({ id: 'touch', name: 'TOUCH', short: 'TOUCH' }); TAB_ITEMS.touch = TOUCH_ROWS.slice();
      for (const t of TABS) { if (t.id === 'gameplay') t.short = 'GAME'; if (t.id === 'controls') t.short = 'CTRL'; }
    }
  }

  // ---------- geometry ----------
  function insets() {   // CSS px -> display px; ?safe=t,r,b,l fakes a notch for the test
    const { DPR } = env.geom(); let v = [0, 0, 0, 0]; const o = q.get('safe');
    if (o) v = o.split(',').map(x => +x || 0);
    else { const el = document.getElementById('safe'); if (el) { const cs = getComputedStyle(el); v = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(x => parseFloat(x) || 0); } }
    return { t: v[0] * DPR, r: (v[1] || 0) * DPR, b: (v[2] || 0) * DPR, l: (v[3] || 0) * DPR };
  }
  function layout() {
    const W = disp.width, H = disp.height, ins = insets(), key = [W, H, size(), left(), JSON.stringify(SET.touchPos || {}), ins.t, ins.r, ins.b, ins.l].join('|');
    if (lay && key === layKey) return lay; layKey = key;
    const { DPR } = env.geom(), s = Math.min(W, H) * 0.145 * size(), m = Math.max(10 * DPR, 0) , L = left(), sg = L ? -1 : 1;
    const pivX = L ? ins.l + m + s : W - ins.r - m - s, pivY = H - ins.b - m - 0.78 * s;
    const btn = {}; const put = (k, cx, cy, r) => { btn[k] = { k, cx: clamp(cx, ins.l + r, W - ins.r - r), cy: clamp(cy, ins.t + r, H - ins.b - r), r }; };
    for (const k of PLAY_BTNS) { const [dx, dy, r] = SPOT[k]; put(k, pivX + sg * dx * s, pivY + dy * s, r * s); }
    const pr = 0.4 * s; put('pause', L ? ins.l + m + pr : W - ins.r - m - pr, ins.t + m + pr, pr);
    // a button the player dragged keeps the spot he gave it (a fraction of the screen, so a resize or a turn does not lose it)
    for (const k of [...PLAY_BTNS, 'pause']) { const p = SET.touchPos && SET.touchPos[k]; if (Array.isArray(p) && btn[k]) put(k, p[0] * W, p[1] * H, btn[k].r); }
    // the pill buttons (no play buttons on screen): OK and its friends stacked up from the thumb's corner, BACK in the pause corner
    const pw = 2.1 * s, ph = 0.82 * s, gap = 0.14 * s, pills = [], pillX = L ? ins.l + m : W - ins.r - m - pw;
    for (let i = 0; i < 5; i++) pills.push({ x: pillX, y: H - ins.b - m - ph - i * (ph + gap), w: pw, h: ph });
    const back = { x: L ? W - ins.r - m - pw * 0.8 : ins.l + m, y: ins.t + m, w: pw * 0.8, h: ph };
    const stickR = 1.2 * s, zoneW = W * 0.45;
    lay = { W, H, s, ins, m, btn, pills, back, stickR, zone: L ? { x0: W - zoneW, x1: W } : { x0: 0, x1: zoneW }, rest: { x: L ? W - ins.r - m - stickR * 1.25 : ins.l + m + stickR * 1.25, y: H - ins.b - m - stickR * 1.25 } };
    return lay;
  }
  const relayout = () => { lay = null; };
  addEventListener('resize', relayout);
  const toDisp = t => { const r = disp.getBoundingClientRect(); return [(t.clientX - r.left) * disp.width / (r.width || 1), (t.clientY - r.top) * disp.height / (r.height || 1)]; };
  const toGame = (px, py) => { const { S, offX, offY } = env.geom(); return [(px - offX) / S, (py - offY) / S]; };
  const inCircle = (b, x, y, slop = 1.12) => Math.hypot(x - b.cx, y - b.cy) <= b.r * slop;
  const inRect = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

  // ---------- what is on screen ----------
  const playing = () => env.state() === 'play';
  function visibleBtns() {   // the play buttons that are drawn and can be touched right now
    const L = layout(), out = [];
    if (editing) { for (const k of [...PLAY_BTNS, 'pause']) out.push(L.btn[k]); return out; }
    if (!playing()) return out;
    for (const k of PLAY_BTNS) {
      if (k in SKILL_OF && !env.skillOn(SKILL_OF[k])) continue;
      if (k === 'interact' && !verb) continue;
      out.push(L.btn[k]);
    }
    out.push(L.btn.pause); return out;
  }
  function pillsNow() {   // [{k, press, label, x, y, w, h}] for a menu-ish state
    const st = env.state(), L = layout(), out = [];
    if (playing() || editing || st === 'edit' || st === 'editor') return out;
    const acts = ACTIONS[st] || [['confirm', 'OK']];
    acts.forEach(([press, label], i) => out.push({ k: 'pill:' + press, press, label, ...L.pills[i] }));
    if (st !== 'title') out.push({ k: 'pill:back', press: 'pause', label: 'BACK', ...L.back });
    return out;
  }

  // ---------- the stick ----------
  const SECT = [[1, 0, 0, 0], [1, 0, 1, 0], [0, 0, 1, 0], [0, 1, 1, 0], [0, 1, 0, 0], [0, 1, 0, 1], [0, 0, 0, 1], [1, 0, 0, 1]];   // [right, left, up, down] by 45-degree sector, counter-clockwise from East
  function sectorOf(dx, dy, prev) {
    const d = Math.hypot(dx, dy), L = layout(); if (d < L.stickR * 0.3) return -1;
    let a = Math.atan2(-dy, dx) * 180 / Math.PI; if (a < 0) a += 360;
    const raw = Math.round(a / 45) % 8;
    if (prev >= 0 && prev !== raw) { const c = prev * 45; let diff = Math.abs(a - c); if (diff > 180) diff = 360 - diff; if (diff < 27.5) return prev; }   // a few degrees of hysteresis, so the edge of a sector does not flicker
    return raw;
  }
  function stickMove(px, py) {
    const L = layout(); stick.x = px; stick.y = py;
    const dx = px - stick.cx, dy = py - stick.cy, d = Math.hypot(dx, dy), far = L.stickR * 1.5;
    if (d > far) { stick.cx += dx * (d - far) / d; stick.cy += dy * (d - far) / d; }   // dragged well past the base: the base follows the thumb
    const sec = sectorOf(px - stick.cx, py - stick.cy, stick.sec); applySector(sec); stick.sec = sec;
  }
  let curDirs = [0, 0, 0, 0];
  function applySector(sec) {
    const v = sec < 0 ? [0, 0, 0, 0] : SECT[sec], names = ['right', 'left', 'up', 'down'], k = env.keys, st = env.state();
    for (let i = 0; i < 4; i++) {
      const n = names[i];
      if (v[i]) { k[n] = true; held[n] = true; if (!curDirs[i] && st !== 'play') { env.press(n); rep.t = 0; rep.n = 0; } }   // a rising edge is a press - in the menus only: in play a press would count toward the double-tap dodge
      else if (curDirs[i] && held[n]) { k[n] = false; held[n] = false; }
    }
    curDirs = v.slice();
  }
  function stickEnd() { applySector(-1); stick = null; }

  // ---------- buttons ----------
  function press(k) {
    if (k === 'interact') { env.press(verb ? verb.key : 'talk'); return; }
    if (k === 'atk' && SET.touchAssist !== false) env.autoFace();
    if (k === 'jump') { env.press('jump'); env.press('confirm'); }
    else if (k === 'pause') env.press('pause');
    else if (k !== 'block') env.press(k);
    const h = HOLD[k]; if (h) { env.keys[h] = true; held[h] = true; }
  }
  function release(k) { const h = HOLD[k]; if (h && held[h]) { env.keys[h] = false; held[h] = false; } }
  function releaseAll() { for (const id of [...touches.keys()]) endTouch(id); for (const h in held) if (held[h]) { env.keys[h] = false; held[h] = false; } stick = null; curDirs = [0, 0, 0, 0]; }

  // ---------- touch events ----------
  function hitAt(px, py) { const [gx, gy] = toGame(px, py); for (let i = hitsNow.length - 1; i >= 0; i--) { const h = hitsNow[i]; if (gx >= h.x && gx < h.x + h.w && gy >= h.y && gy < h.y + h.h) return h; } return null; }
  function startTouch(id, px, py) {
    if (editing) { editStart(id, px, py); return; }
    const L = layout();
    for (const b of visibleBtns()) if (inCircle(b, px, py)) { touches.set(id, { role: 'btn', k: b.k }); press(b.k); return; }
    if (!playing()) {
      for (const p of pillsNow()) if (inRect(p, px, py)) { touches.set(id, { role: 'tap' }); env.press(p.press); return; }
      const h = hitAt(px, py); if (h) { touches.set(id, { role: 'tap' }); const [gx, gy] = toGame(px, py); h.fn(gx, gy); return; }
      if (TAP_ANY.has(env.state())) { touches.set(id, { role: 'tap' }); env.press('confirm'); return; }
    }
    if (!stick && px >= L.zone.x0 && px <= L.zone.x1) { stick = { id, cx: px, cy: py, x: px, y: py, sec: -1 }; touches.set(id, { role: 'stick' }); return; }
    touches.set(id, { role: 'none' });
  }
  function moveTouch(id, px, py) {
    const t = touches.get(id); if (!t) return;
    if (t.role === 'stick' && stick) stickMove(px, py);
    else if (t.role === 'drag') editMove(px, py);
    else if (t.role === 'btn') {   // a thumb sliding from one button into another takes the new one up (attack -> jump); sliding off into the gap keeps the old
      const L = layout(), cur = L.btn[t.k]; if (!cur || inCircle(cur, px, py)) return;
      for (const b of visibleBtns()) if (b.k !== t.k && b.k !== 'pause' && inCircle(b, px, py, 1.0)) { release(t.k); t.k = b.k; press(b.k); return; }
    }
  }
  function endTouch(id) {
    const t = touches.get(id); if (!t) return; touches.delete(id);
    if (t.role === 'stick') stickEnd(); else if (t.role === 'btn') release(t.k); else if (t.role === 'drag') editEnd();
  }
  if (on) {
    const each = (e, f) => { e.preventDefault(); lastTouchAt = performance.now(); for (const t of e.changedTouches) { const [px, py] = toDisp(t); f(t.identifier, px, py); } };
    disp.addEventListener('touchstart', e => { env.initAudio(); each(e, startTouch); }, { passive: false });
    disp.addEventListener('touchmove', e => each(e, moveTouch), { passive: false });
    const end = e => { e.preventDefault(); for (const t of e.changedTouches) endTouch(t.identifier); };
    disp.addEventListener('touchend', end, { passive: false }); disp.addEventListener('touchcancel', end, { passive: false });
    addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
  }

  // ---------- the layout editor (Settings > TOUCH > Edit layout): drag a button, it keeps the spot ----------
  function editStart(id, px, py) {
    const L = layout(), bar = editBar();
    if (inRect(bar.reset, px, py)) { SET.touchPos = {}; env.save(); relayout(); touches.set(id, { role: 'tap' }); return; }
    if (inRect(bar.done, px, py)) { editing = false; touches.set(id, { role: 'tap' }); return; }
    let best = null, bd = 1e9; for (const k of [...PLAY_BTNS, 'pause']) { const b = L.btn[k], d = Math.hypot(px - b.cx, py - b.cy); if (d <= b.r * 1.25 && d < bd) { best = k; bd = d; } }
    if (best) { drag = { k: best, ox: px - L.btn[best].cx, oy: py - L.btn[best].cy }; touches.set(id, { role: 'drag' }); } else touches.set(id, { role: 'none' });
  }
  function editMove(px, py) {
    if (!drag) return; const L = layout(), b = L.btn[drag.k];
    const x = clamp(px - drag.ox, L.ins.l + b.r, L.W - L.ins.r - b.r), y = clamp(py - drag.oy, L.ins.t + b.r, L.H - L.ins.b - b.r);
    SET.touchPos = SET.touchPos || {}; SET.touchPos[drag.k] = [x / L.W, y / L.H]; relayout();
  }
  function editEnd() { if (drag) { env.save(); drag = null; } }
  function editBar() { const L = layout(), w = 2.4 * L.s, h = 0.8 * L.s, y = L.ins.t + L.m; return { reset: { x: L.W / 2 - w - 8, y, w, h }, done: { x: L.W / 2 + 8, y, w, h } }; }

  // ---------- tick and draw ----------
  function tick(dt) {
    if (!on) return;
    verbAt -= dt; if (verbAt <= 0 && (playing() || editing)) { verbAt = 0.08; const v = playing() ? env.verb() : null; verb = v; }
    if (!playing()) verb = null;
    // a held direction repeats in the lists, like a held key: after 0.4 s, then every 0.16 s
    if (stick && stick.sec >= 0 && REPEAT.has(env.state())) {
      rep.t += dt; const first = 0.4, per = 0.16; if (rep.t >= first + rep.n * per) { rep.n++; const v = SECT[stick.sec]; const names = ['right', 'left', 'up', 'down']; for (let i = 0; i < 4; i++) if (v[i]) env.press(names[i]); }
    }
  }
  function roundRect(x, y, w, h, r) { dg.beginPath(); dg.roundRect(x, y, w, h, r); }
  function fit(text, maxW, px) { dg.font = px + 'px ' + FONT; while (px > 6 && dg.measureText(text).width > maxW) { px--; dg.font = px + 'px ' + FONT; } return px; }
  function icon(k, b, down) {
    const { cx, cy, r } = b, u = r * 0.5; dg.save(); dg.translate(cx, cy);
    dg.strokeStyle = 'rgba(255,246,224,0.95)'; dg.fillStyle = 'rgba(255,246,224,0.95)'; dg.lineWidth = Math.max(2, r * 0.12); dg.lineCap = 'round'; dg.lineJoin = 'round';
    if (k === 'atk') { dg.beginPath(); dg.moveTo(-u * 0.9, u * 0.9); dg.lineTo(u * 0.8, -u * 0.8); dg.stroke(); dg.beginPath(); dg.moveTo(-u * 0.55, u * 0.1); dg.lineTo(-u * 0.1, u * 0.55); dg.stroke(); dg.beginPath(); dg.moveTo(u * 0.8, -u * 0.8); dg.lineTo(u * 0.8, -u * 0.35); dg.moveTo(u * 0.8, -u * 0.8); dg.lineTo(u * 0.35, -u * 0.8); dg.stroke(); }
    else if (k === 'jump') { dg.beginPath(); dg.moveTo(-u * 0.8, u * 0.45); dg.lineTo(0, -u * 0.35); dg.lineTo(u * 0.8, u * 0.45); dg.stroke(); dg.beginPath(); dg.moveTo(-u * 0.8, u * 1.0); dg.lineTo(0, u * 0.2); dg.lineTo(u * 0.8, u * 1.0); dg.stroke(); }
    else if (k === 'dodge') { for (const o of [-0.5, 0.35]) { dg.beginPath(); dg.moveTo(u * (o - 0.3), -u * 0.7); dg.lineTo(u * (o + 0.3), 0); dg.lineTo(u * (o - 0.3), u * 0.7); dg.stroke(); } }
    else if (k === 'block') { dg.beginPath(); dg.moveTo(-u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, u * 0.1); dg.quadraticCurveTo(u * 0.7, u * 0.7, 0, u * 1.0); dg.quadraticCurveTo(-u * 0.7, u * 0.7, -u * 0.75, u * 0.1); dg.closePath(); dg.stroke(); }
    else if (k === 'pause') { dg.fillRect(-u * 0.55, -u * 0.7, u * 0.38, u * 1.4); dg.fillRect(u * 0.17, -u * 0.7, u * 0.38, u * 1.4); }
    else if (k === 'interact') { const word = (verb && verb.verb) || 'USE', px = fit(word, r * 1.55, Math.round(r * 0.55)); dg.font = px + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(word, 0, 1); }
    else { dg.font = Math.round(r * 0.9) + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(LABEL[k] || '?', 0, 1); }
    dg.restore();
  }
  function drawBtn(b, down, ghost) {
    dg.fillStyle = down ? 'rgba(143,209,96,0.62)' : ghost ? 'rgba(255,211,107,0.30)' : 'rgba(20,16,30,0.5)';
    dg.beginPath(); dg.arc(b.cx, b.cy, b.r, 0, 7); dg.fill();
    dg.strokeStyle = ghost ? 'rgba(255,211,107,0.95)' : 'rgba(255,246,224,0.7)'; dg.lineWidth = Math.max(2, b.r * 0.07); dg.stroke();
    icon(b.k, b, down);
  }
  function drawPill(p, down, label) {
    dg.fillStyle = down ? 'rgba(143,209,96,0.62)' : 'rgba(20,16,30,0.55)'; roundRect(p.x, p.y, p.w, p.h, p.h * 0.3); dg.fill();
    dg.strokeStyle = 'rgba(255,246,224,0.7)'; dg.lineWidth = 2; dg.stroke();
    const px = fit(label, p.w * 0.84, Math.round(p.h * 0.34)); dg.font = px + 'px ' + FONT; dg.fillStyle = 'rgba(255,246,224,0.95)'; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(label, p.x + p.w / 2, p.y + p.h / 2 + 1);
  }
  function drawStick(L) {
    const act = stick, cx = act ? act.cx : L.rest.x, cy = act ? act.cy : L.rest.y, R = L.stickR;
    if (!act && !playing()) return;
    dg.globalAlpha *= act ? 1 : 0.45;
    dg.fillStyle = 'rgba(20,16,30,0.3)'; dg.beginPath(); dg.arc(cx, cy, R, 0, 7); dg.fill();
    dg.strokeStyle = 'rgba(255,246,224,0.55)'; dg.lineWidth = 2; dg.stroke();
    // the up and down zones are marked on the base, and light while they are held
    for (const [name, a0, a1] of [['up', -135, -45], ['down', 45, 135]]) {
      const lit = act && act.sec >= 0 && SECT[act.sec][name === 'up' ? 2 : 3]; dg.beginPath(); dg.arc(cx, cy, R, a0 * Math.PI / 180, a1 * Math.PI / 180); dg.lineWidth = lit ? 5 : 2; dg.strokeStyle = lit ? 'rgba(143,209,96,0.9)' : 'rgba(255,246,224,0.35)'; dg.stroke();
      dg.fillStyle = lit ? 'rgba(143,209,96,0.95)' : 'rgba(255,246,224,0.55)'; const ty = cy + (name === 'up' ? -R * 0.72 : R * 0.72), u = R * 0.12; dg.beginPath(); if (name === 'up') { dg.moveTo(cx - u, ty + u * 0.6); dg.lineTo(cx, ty - u * 0.7); dg.lineTo(cx + u, ty + u * 0.6); } else { dg.moveTo(cx - u, ty - u * 0.6); dg.lineTo(cx, ty + u * 0.7); dg.lineTo(cx + u, ty - u * 0.6); } dg.closePath(); dg.fill();
    }
    let kx = cx, ky = cy; if (act) { const dx = act.x - cx, dy = act.y - cy, d = Math.hypot(dx, dy) || 1, c = Math.min(d, R * 0.85); kx = cx + dx / d * c; ky = cy + dy / d * c; }
    dg.fillStyle = act && act.sec >= 0 ? 'rgba(143,209,96,0.7)' : 'rgba(255,246,224,0.35)'; dg.beginPath(); dg.arc(kx, ky, R * 0.42, 0, 7); dg.fill();
    dg.strokeStyle = 'rgba(255,246,224,0.85)'; dg.lineWidth = 2; dg.stroke();
  }
  function draw() {
    if (!on) return;
    const L = layout(), a0 = dg.globalAlpha; dg.globalAlpha = opacity();
    if (editing) {
      dg.globalAlpha = 1; dg.fillStyle = 'rgba(10,14,12,0.72)'; dg.fillRect(0, 0, L.W, L.H);
      dg.globalAlpha = Math.max(0.6, opacity()); dg.strokeStyle = 'rgba(255,246,224,0.35)'; dg.setLineDash([8, 8]); dg.strokeRect(L.zone.x0 + 4, L.ins.t + L.m, L.zone.x1 - L.zone.x0 - 8, L.H - L.ins.t - L.ins.b - 2 * L.m); dg.setLineDash([]);
      dg.fillStyle = 'rgba(255,246,224,0.7)'; dg.font = Math.round(L.s * 0.3) + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText('STICK ZONE', (L.zone.x0 + L.zone.x1) / 2, L.H / 2);
      for (const k of [...PLAY_BTNS, 'pause']) { if (k === 'interact') verb = verb || { verb: 'USE', key: 'talk' }; drawBtn(L.btn[k], drag && drag.k === k, true); }
      const bar = editBar(); drawPill({ ...bar.reset }, false, 'RESET'); drawPill({ ...bar.done }, false, 'DONE');
      dg.font = Math.round(L.s * 0.26) + 'px ' + FONT; dg.fillStyle = 'rgba(255,246,224,0.8)'; dg.fillText('DRAG A BUTTON WHERE YOUR THUMB WANTS IT', L.W / 2, L.ins.t + L.m + L.s * 1.25);
      dg.globalAlpha = a0; return;
    }
    const downK = new Set([...touches.values()].filter(t => t.role === 'btn').map(t => t.k));
    if (playing()) { drawStick(L); for (const b of visibleBtns()) drawBtn(b, downK.has(b.k), false); }
    else {
      for (const p of pillsNow()) drawPill(p, false, p.label);
      if (stick) drawStick(L);
    }
    dg.globalAlpha = a0;
  }

  // ---------- Settings > TOUCH ----------
  const onoff = v => (v ? 'ON' : 'OFF');
  const lite = () => SET.parts === 'few' && SET.parallax !== 'full';
  const SIZES = [0.7, 0.85, 1, 1.15, 1.3], OPS = [0.25, 0.4, 0.6, 0.8, 1];
  const step = (list, cur, dir) => { let i = list.findIndex(v => Math.abs(v - cur) < 0.01); if (i < 0) i = 2; return list[(i + dir + list.length) % list.length]; };
  function applyLite(onNow) { if (onNow) { SET.parts = 'few'; SET.parallax = 'near'; SET.air = false; } else { SET.parts = 'normal'; SET.parallax = 'full'; SET.air = true; } }
  function rowValue(k) {
    switch (k) {
      case 'Touch size': return Math.round(size() * 100) + '%'; case 'Touch opacity': return Math.round(opacity() * 100) + '%';
      case 'Left-handed': return onoff(left()); case 'Touch assists': return onoff(SET.touchAssist !== false); case 'Haptics': return onoff(SET.touchHaptics !== false);
      case 'Lighter effects': return onoff(lite()); default: return null;
    }
  }
  /* a left / right on a Touch row: true when the row was ours (main.js then saves and plays the click) */
  function adjustRow(k, dir) {
    if (k === 'Touch size') SET.touchSize = step(SIZES, size(), dir); else if (k === 'Touch opacity') SET.touchOpacity = step(OPS, opacity(), dir);
    else if (k === 'Left-handed') { SET.touchLeft = !SET.touchLeft; SET.touchPos = {}; }   // (a dragged spot belongs to the hand it was made for) else if (k === 'Touch assists') SET.touchAssist = SET.touchAssist === false;
    else if (k === 'Haptics') { SET.touchHaptics = SET.touchHaptics === false; if (SET.touchHaptics) buzz([40]); } else if (k === 'Lighter effects') applyLite(!lite());
    else return false;
    relayout(); return true;
  }
  /* a confirm on a Touch row (Z or a tap): the two action rows start the editor / reset it; every other row turns like a right */
  function confirmRow(k) {
    if (k === 'Edit layout') { editing = true; relayout(); return true; }
    if (k === 'Reset layout') { SET.touchPos = {}; SET.touchSize = 1; SET.touchOpacity = 0.6; SET.touchLeft = false; env.save(); relayout(); return true; }
    return adjustRow(k, 1);
  }

  // ---------- haptics and assists ----------
  const PATTERNS = { hit: [45], block: [14], parry: [12, 36, 22], levelup: [30, 60, 30, 60, 70] };
  function buzz(kind) {
    if (!on || SET.touchHaptics === false) return;
    try { if (navigator.vibrate) navigator.vibrate(Array.isArray(kind) ? kind : PATTERNS[kind] || [20]); } catch {}
  }
  const bufScale = () => (on && SET.touchAssist !== false && recent() ? 1.4 : 1);
  /* AUTO-FACE: a swing starts toward the nearest foe within 1.5 tiles BEHIND you, when there is none that close in front. foes: [{x, y, h}] */
  function faceFor(P, foes) {
    if (!P || P.dead) return 0; const reach = 24, f = P.face || 1; let ahead = false, best = null, bd = 1e9;
    for (const e of foes) { const dx = e.x - P.x, dy = (e.y - (e.h || 12) / 2) - (P.y - 8); if (Math.abs(dy) > 20 || Math.abs(dx) > reach) continue; if (Math.sign(dx) === f || Math.abs(dx) < 6) ahead = true; else if (Math.abs(dx) < bd) { bd = Math.abs(dx); best = e; } }
    return !ahead && best ? Math.sign(best.x - P.x) : 0;
  }

  return {
    on, tick, draw, relayout, hit: (x, y, w, h, fn) => { if (on) hitsNow.push({ x, y, w, h, fn }); }, beginFrame: () => { if (on && hitsNow.length) hitsNow = []; },
    rowValue, adjustRow, confirmRow, applyLite, verbLabel: () => (verb ? verb.verb : null), tips: TOUCH_TIPS, buzz, bufScale, faceFor, releaseAll, keyUsed: () => { lastTouchAt = -1e9; },
    editing: () => editing, endEdit: () => { editing = false; editEnd(); },
    // the numbers the test reads
    debug: () => { const L = layout(); return { on, layout: L, buttons: visibleBtns().map(b => ({ ...b })), pills: pillsNow(), stick: stick ? { ...stick } : null, verb, hits: hitsNow.length, held: { ...held }, editing, recent: recent(), bar: editing ? editBar() : null }; },
    allButtons: () => { const L = layout(); return Object.values(L.btn).map(b => ({ ...b })); },
    hitBoxes: () => hitsNow.map(h => ({ x: h.x, y: h.y, w: h.w, h: h.h })),
    setVerbNow: v => { verb = v; },
    gameToClient: (gx, gy) => { const { S, offX, offY } = env.geom(), r = disp.getBoundingClientRect(); return [(offX + gx * S) * r.width / disp.width + r.left, (offY + gy * S) * r.height / disp.height + r.top]; },
    displayToClient: (px, py) => { const r = disp.getBoundingClientRect(); return [px * r.width / disp.width + r.left, py * r.height / disp.height + r.top]; },
  };
}
