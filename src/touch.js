// src/touch.js - THE PHONE'S HANDS (claude/mobile, 2026-10-02). Everything a thumb does lives here; main.js keeps a few small hooks.
//
//   D-PAD (DEFAULT)  fixed bottom-left, EIGHT ways with real diagonal wedges (crouch-walk = down+right), slide between wedges without lifting,
//                    a tick of haptic on each change. Directions matter here (down = crouch / drop-through / plunge), so it does not float.
//   FLOATING STICK   an option (Settings > TOUCH > Move control): a thumb down anywhere on the left ~45% is the centre. Eight ways SNAPPED, a
//                    dead zone you can set, and DOWN needs a deliberate pull (a floating stick used to drift into a crouch). The menus always use it.
//   LAYOUT PRESETS   SIMPLE (default: d-pad, JUMP, ATTACK, DEFEND [tap = dodge, hold = block], SKILL [tap = first, hold + slide = a radial of the
//                    slots], and the CONTEXTUAL buttons Interact + ctx), FULL (every button), CUSTOM (drag them: Edit layout).
//   CONTEXT SLOT     'ctx': a second contextual button for a lane to fill - BK.touchCtx.push(c => c.nearX ? { label: 'THROW', key: 'throw' } : null).
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

export const TOUCH_ROWS = ['- MOVE -', 'Move control', 'Stick dead zone', '- LAYOUT -', 'Layout', 'Touch size', 'Touch opacity', 'Left-handed', 'Edit layout', 'Reset layout',
  '- ASSISTS -', 'Block toggle', 'Auto-face foes', 'Aim assist', 'Auto-interact', 'Long input buffer', 'Swipe gestures', '- HELP -', 'Haptics', 'Lighter effects', '- PHONE -', 'Phone mode', 'Frame rate'];
export const TOUCH_TIPS = {
  'Touch size': 'how big the buttons and the stick are', 'Touch opacity': 'how see-through the buttons are',
  'Left-handed': 'swaps the stick and the buttons', 'Edit layout': 'drag any button where your thumb wants it', 'Reset layout': 'every button back where it started',
  'Move control': 'D-PAD: a fixed pad with eight ways, slide between them. STICK: floats under your thumb', 'Stick dead zone': 'how far the stick must move before it counts (STICK only): bigger = no drift into a crouch',
  'Layout': 'SIMPLE: 5 buttons (defend = tap dodge, hold block; one skill button with a wheel). FULL: every button. CUSTOM: your own drag',
  'Block toggle': 'tap to raise the shield, tap again to lower it (instead of holding)', 'Auto-face foes': 'ATTACK turns to a foe just behind you',
  'Aim assist': 'throws and ranged skills turn toward the nearest foe in range', 'Auto-interact': 'walking into a door or lever uses it (stand still against it for a moment)',
  'Long input buffer': 'a press made a moment early still counts (touch only)', 'Swipe gestures': 'right side: swipe left or right = dodge that way, down = plunge, up = up-slash',
  'Haptics': 'a buzz on a hit, a block, a parry and a level-up (not on iPhone)',
  'Lighter effects': 'fewer particles and background layers, for a phone',
  'Phone mode': 'AUTO draws at a light resolution on a phone; OFF is the full-sharpness picture (heavier); ON forces it. Reload after changing it',
  'Frame rate': '30 halves the drawing work on a slow phone (the game still plays at full speed)',
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const FONT = '"Silkscreen", "Press Start 2P"';   /* the body face of the strict pair (main.js FONT) */
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
const FULL_BTNS = ['atk', 'jump', 'dodge', 'block', 'throw', 'skill2', 'skill3', 'skill4', 'interact', 'ctx'], SIMPLE_BTNS = ['atk', 'jump', 'defend', 'skill', 'interact', 'ctx'];
const PLAY_BTNS = [...new Set([...FULL_BTNS, ...SIMPLE_BTNS])];
const SLOT_KEYS = ['throw', 'skill2', 'skill3', 'skill4'];   /* the press each skill slot sends (a fifth slot is one more name here) */
const HOLD_DEFEND = 0.2, HOLD_SKILL = 0.25;   /* s: a DEFEND held this long is a block (shorter = a dodge); a SKILL held this long opens the wheel */
const AUTO_VERBS = new Set(['ENTER', 'OPEN', 'PULL', 'PUSH', 'TURN', 'LEVER', 'RAISE', 'LOWER', 'CALL']);   /* what AUTO-INTERACT may use (never a shop, a talk, a take or the way out) */
const DEADS = [0.2, 0.3, 0.45], DEAD_NAMES = ['SMALL', 'MEDIUM', 'LARGE'];
const HOLD = { atk: 'atk', jump: 'jump', dodge: 'dodge', block: 'block', throw: 'throw' };   /* the keys[] entry each button holds down while it is touched */
const SKILL_OF = { throw: 0, skill2: 1, skill3: 2, skill4: 3 };
/* where every button sits, in units of s (the button size), from the thumb's rest point P: [dx, dy, radius]. Right-handed; left-handed mirrors dx. */
const SPOT_FULL = {
  atk: [0, 0, 0.78], jump: [-0.55, -1.75, 0.7], dodge: [-1.95, -0.35, 0.52], block: [-2.35, -1.55, 0.52],
  interact: [-0.4, -3.2, 0.6], throw: [-1.75, -3.0, 0.4], skill2: [-2.85, -2.5, 0.4], skill3: [-3.75, -1.6, 0.4], skill4: [-4.2, -0.4, 0.4], ctx: [-3.2, -3.35, 0.42],
};
/* SIMPLE: fewer, bigger, an arc round the thumb. ATTACK at the rest point, JUMP above it, DEFEND to its left, SKILL up-left; the two contextual buttons above. */
const SPOT_SIMPLE = { atk: [0, 0, 0.9], jump: [-0.1, -1.95, 0.75], defend: [-2.0, -0.25, 0.68], skill: [-1.9, -1.95, 0.6], interact: [-1.15, -3.25, 0.55], ctx: [-2.95, -2.9, 0.5] };
const SPOTS = { simple: SPOT_SIMPLE, full: SPOT_FULL };
const LABEL = { throw: 'F', skill2: 'G', skill3: '3', skill4: '4' };

export function createTouch(env) {
  const { disp, q, SET } = env;
  let dg = env.dg;   // the context the buttons are drawn on: the main canvas's until the overlay is made, then the overlay's (see draw)
  const on = ('ontouchstart' in window && navigator.maxTouchPoints > 0) || q.get('touch') === '1';
  const touches = new Map();              // touch id -> { role: 'stick' | 'btn' | 'tap' | 'drag', k, ... }
  let stick = null;                       // { id, cx, cy, x, y, sec }  (display pixels)
  let lastTouchAt = -1e9, verb = null, ctx = null, clk = 0, banner = null, padSeen = false, useT = 0, useCd = 0, verbKey = '', verbAt = 0, lay = null, layKey = '', editing = false, drag = null, hitsNow = [];
  const held = {};                        // the keys[] entries WE are holding down, so a release never lets go of the keyboard's
  const rep = { t: 0, n: 0 };
  const pulses = [];   // [{ name, until }]: a key a swipe holds for a moment
  const num = (k, d) => (typeof SET[k] === 'number' && isFinite(SET[k]) ? SET[k] : d);
  const size = () => clamp(num('touchSize', 1), 0.7, 1.4), opacity = () => clamp(num('touchOpacity', 0.6), 0.2, 1);
  const left = () => !!SET.touchLeft;
  /* THE SETTINGS, READ HERE (a saved file from before this existed has none of them: every default is what an untouched phone gets) */
  const moveMode = () => (SET.touchMove === 'stick' ? 'stick' : 'dpad');
  const deadIdx = () => { const i = DEADS.findIndex(v => Math.abs(v - num('touchDead', 0.3)) < 0.01); return i < 0 ? 1 : i; };
  const dead = () => DEADS[deadIdx()];
  const hasPos = () => !!(SET.touchPos && Object.keys(SET.touchPos).length);
  const preset = () => (SET.touchPreset === 'simple' || SET.touchPreset === 'full' || SET.touchPreset === 'custom' ? SET.touchPreset : hasPos() ? 'custom' : 'simple');   /* (a player who dragged buttons before presets existed keeps his layout: it is CUSTOM on the FULL buttons) */
  const baseOf = () => { const p = preset(); return p === 'custom' ? (SET.touchBase === 'simple' ? 'simple' : 'full') : p; };
  const btnSet = () => (baseOf() === 'simple' ? SIMPLE_BTNS : FULL_BTNS);
  const legacyAssist = () => SET.touchAssist !== false;   /* the one old switch (buffer + auto-face) is what the two new ones default to */
  const faceOn = () => (SET.touchFace === undefined ? legacyAssist() : SET.touchFace !== false), bufOn = () => (SET.touchBuf === undefined ? legacyAssist() : SET.touchBuf !== false);
  const aimOn = () => SET.touchAim !== false, useOn = () => SET.touchAutoUse === true, swipeOn = () => SET.touchSwipe === true, blockTog = () => !!SET.blockToggle;
  const recent = () => performance.now() - lastTouchAt < 6000;

  if (on) {   // the Touch tab joins Settings on a phone only (the strip has room for six when two names are short)
    if (!TABS.some(t => t.id === 'touch')) {
      TABS.push({ id: 'touch', name: 'TOUCH', short: 'TOUCH' }); TAB_ITEMS.touch = TOUCH_ROWS.slice();
      for (const t of TABS) { if (t.id === 'gameplay') t.short = 'GAME'; if (t.id === 'controls') t.short = 'CTRL'; }
    }
  }

  // ---------- geometry ----------
  /* THE NOTCH, READ ONCE (claude/mobile2): getComputedStyle on every layout() call - several a frame and one per finger event - forced a style recalc each time.
     The safe area only changes with the window, so it is read again after a resize / turn and at most every 2 s, never in the frame. */
  let insCss = null, insAt = -1e9;
  const dropIns = () => { insCss = null; }; addEventListener('resize', dropIns); addEventListener('orientationchange', dropIns);
  function insets() {   // CSS px -> display px; ?safe=t,r,b,l fakes a notch for the test
    const { DPR } = env.geom(); let v = [0, 0, 0, 0]; const o = q.get('safe');
    if (o) v = o.split(',').map(x => +x || 0);
    else { const now = performance.now(); if (!insCss || now - insAt > 2000) { const el = document.getElementById('safe'); insCss = [0, 0, 0, 0]; insAt = now; if (el) { const cs = getComputedStyle(el); insCss = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(x => parseFloat(x) || 0); } } v = insCss; }
    return { t: v[0] * DPR, r: (v[1] || 0) * DPR, b: (v[2] || 0) * DPR, l: (v[3] || 0) * DPR };
  }
  function layout() {
    const W = disp.width, H = disp.height, ins = insets(), gm = env.geom(), key = [W, H, gm.S | 0, gm.offX | 0, size(), left(), layVer, preset(), baseOf(), ins.t, ins.r, ins.b, ins.l].join('|');
    if (lay && key === layKey) return lay; layKey = key;
    const { DPR } = env.geom(), s = Math.min(W, H) * 0.145 * size(), m = Math.max(10 * DPR, 0) , L = left(), sg = L ? -1 : 1;
    const pivX = L ? ins.l + m + s : W - ins.r - m - s, pivY = H - ins.b - m - 0.78 * s;
    const btn = {}; const put = (k, cx, cy, r) => { btn[k] = { k, cx: clamp(cx, ins.l + r, W - ins.r - r), cy: clamp(cy, ins.t + r, H - ins.b - r), r }; };
    const set = btnSet(), SP = SPOTS[baseOf()];
    for (const k of set) { const [dx, dy, r] = SP[k]; put(k, pivX + sg * dx * s, pivY + dy * s, r * s); }
    const pr = 0.4 * s; put('pause', L ? ins.l + m + pr : W - ins.r - m - pr, ins.t + m + pr, pr);
    /* THE SIDE BARS (Daniel 10-03): in landscape the 16:9 game leaves black pillars; the pad goes in one, the buttons in the other (mirrored left-handed), so nothing covers
       the game. Sized to the bar within the size setting. Too narrow (under ~76 CSS px of room) and it falls back to the overlay, drawn fainter. Portrait: over the game, as before. */
    let bar = false, dpadBar = null;
    if (W > H) {
      const gameW = 320 * gm.S, barL = Math.max(0, gm.offX), barR = Math.max(0, W - gm.offX - gameW), mb = 4 * DPR, need = 76 * DPR;
      const lx0 = ins.l + mb, lx1 = gm.offX - mb, rx0 = gm.offX + gameW + mb, rx1 = W - ins.r - mb;   // the two bars' room, clear of a notch
      const [bx0, bx1] = L ? [lx0, lx1] : [rx0, rx1], [px0, px1] = L ? [rx0, rx1] : [lx0, lx1], wi = bx1 - bx0, pwi = px1 - px0;
      if (barL > 0 && barR > 0 && wi >= need && pwi >= need) {
        const top = ins.t + mb, bot = H - ins.b - m, pauseR = Math.min(0.4 * s, wi * 0.35), limit = top + 2 * pauseR + 0.14 * s, avail = bot - limit, cx1 = (bx0 + bx1) / 2, pos = {};
        let ok = false, f = Math.min(1, size());
        if (baseOf() === 'simple') {   // one column, the thumb at the bottom: ATTACK, JUMP, DEFEND, SKILL, then the two contextual ones
          const order = ['atk', 'jump', 'defend', 'skill', 'interact', 'ctx'], wt = { atk: 1, jump: 0.88, defend: 0.82, skill: 0.78, interact: 0.74, ctx: 0.66 };
          const rmax = Math.min(wi / 2, 0.95 * s) * Math.max(0.7, f); let used = 0; for (const k of order) used += 2 * rmax * wt[k] + 0.12 * rmax;
          const k2 = Math.min(1, avail / used); if (k2 >= 0.5) { ok = true; let y = bot; for (const k of order) { const r = rmax * k2 * wt[k]; pos[k] = [cx1, y - r, r]; y -= 2 * r + 0.12 * rmax * k2; } }
        } else {   // FULL: two columns of five rows (ATTACK on the outer edge)
          const rows = [['atk', 'jump'], ['dodge', 'block'], ['throw', 'skill2'], ['skill3', 'skill4'], ['interact', 'ctx']];
          const r = Math.min(wi / 4, avail / 10.6) * Math.max(0.7, f); if (r >= 17 * DPR) { ok = true; const cxo = L ? bx0 + wi * 0.25 : bx0 + wi * 0.75, cxi = L ? bx0 + wi * 0.75 : bx0 + wi * 0.25; rows.forEach((pr2, i) => { const y = bot - r - i * (2 * r + 0.1 * r); pos[pr2[0]] = [cxo, y, r]; pos[pr2[1]] = [cxi, y, r]; }); }
        }
        if (ok) { bar = true; for (const k of set) if (pos[k]) { const [x, y, r] = pos[k]; btn[k] = { k, cx: x, cy: y, r }; } btn.pause = { k: 'pause', cx: cx1, cy: top + pauseR, r: pauseR };
          const dR2 = Math.min(1.45 * s, pwi / 2); dpadBar = { R: dR2, cx: (px0 + px1) / 2, cy: bot - dR2 * 0.1 - dR2, catchR: dR2 * 1.7 }; }
      }
    }
    // a button the player dragged keeps the spot he gave it (a fraction of the screen, so a resize or a turn does not lose it)
    if (preset() === 'custom') for (const k of [...set, 'pause']) { const p = SET.touchPos && SET.touchPos[k]; if (Array.isArray(p) && btn[k]) put(k, p[0] * W, p[1] * H, btn[k].r); }   /* (a dragged spot only counts under CUSTOM) */
    // the pill buttons (no play buttons on screen): OK and its friends stacked up from the thumb's corner, BACK in the pause corner
    const pw = 2.1 * s, ph = 0.82 * s, gap = 0.14 * s, pills = [], pillX = L ? ins.l + m : W - ins.r - m - pw;
    for (let i = 0; i < 5; i++) pills.push({ x: pillX, y: H - ins.b - m - ph - i * (ph + gap), w: pw, h: ph });
    const back = { x: L ? W - ins.r - m - pw * 0.8 : ins.l + m, y: ins.t + m, w: pw * 0.8, h: ph };
    const stickR = 1.2 * s, zoneW = W * 0.45;
    const dR = 1.45 * s, dpad = { R: dR, cx: L ? W - ins.r - m - dR * 1.05 : ins.l + m + dR * 1.05, cy: H - ins.b - m - dR * 1.05, catchR: dR * 1.7 };   /* THE D-PAD: fixed in the thumb's corner, a generous catch round it */
    lay = { W, H, s, ins, m, btn, dpad: dpadBar || dpad, bar, land: W > H, pills, back, stickR, zone: L ? { x0: W - zoneW, x1: W } : { x0: 0, x1: zoneW }, rest: { x: dpadBar ? dpadBar.cx : L ? W - ins.r - m - stickR * 1.25 : ins.l + m + stickR * 1.25, y: H - ins.b - m - stickR * 1.25 } };
    return lay;
  }
  let layVer = 0;
  const relayout = () => { lay = null; layVer++; };
  addEventListener('resize', relayout);
  let rect = null; addEventListener('resize', () => { rect = null; });   // the canvas is fixed to the window: its box is read once per finger-down, not per move
  const toDisp = t => { const r = rect || (rect = disp.getBoundingClientRect()); return [(t.clientX - r.left) * disp.width / (r.width || 1), (t.clientY - r.top) * disp.height / (r.height || 1)]; };
  const toGame = (px, py) => { const { S, offX, offY } = env.geom(); return [(px - offX) / S, (py - offY) / S]; };
  const inCircle = (b, x, y, slop = 1.12) => Math.hypot(x - b.cx, y - b.cy) <= b.r * slop;
  /* THE BUTTON UNDER A THUMB: hit zones are bigger than the drawn circles (slop), and where two reach the thumb the NEARER one (by its own radius) wins */
  function pickBtn(px, py, slop, skip) { let best = null, bd = 1e9; for (const b of visibleBtns()) { if (b.k === skip) continue; const d = Math.hypot(px - b.cx, py - b.cy) / b.r; if (d <= slop && d < bd) { best = b; bd = d; } } return best; }
  const inRect = (b, x, y) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;

  // ---------- what is on screen ----------
  const playing = () => env.state() === 'play';
  function visibleBtns() {   // the play buttons that are drawn and can be touched right now
    const L = layout(), out = [];
    if (editing) { for (const k of [...btnSet(), 'pause']) out.push(L.btn[k]); return out; }
    if (!playing()) return out;
    for (const k of btnSet()) {
      if (k in SKILL_OF && !env.skillOn(SKILL_OF[k])) continue;
      if (k === 'skill' && !SLOT_KEYS.some((_, i) => env.skillOn(i))) continue;
      if (k === 'interact' && !verb) continue;
      if (k === 'ctx' && !ctx) continue;
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
  /* dd: the dead radius; dn: when set, a sector with DOWN in it needs this radius (a floating stick drifts into a crouch; a deliberate pull is what it takes) - below it S is nothing and SW / SE are just W / E */
  function sectorOf(dx, dy, prev, dd, dn) {
    const d = Math.hypot(dx, dy); if (d < dd) return -1;
    let a = Math.atan2(-dy, dx) * 180 / Math.PI; if (a < 0) a += 360;
    let sec = Math.round(a / 45) % 8;
    if (prev >= 0 && prev !== sec) { const c = prev * 45; let diff = Math.abs(a - c); if (diff > 180) diff = 360 - diff; if (diff < 27.5) sec = prev; }   // a few degrees of hysteresis, so the edge of a sector does not flicker
    if (dn && d < dn && (sec === 5 || sec === 6 || sec === 7)) sec = sec === 6 ? -1 : sec === 5 ? 4 : 0;
    return sec;
  }
  function stickMove(px, py) {
    const L = layout(); stick.x = px; stick.y = py;
    let dd, dn = 0;
    if (stick.dp) { dd = L.dpad.R * 0.2; }   // the d-pad does not follow the thumb: it is where it is
    else {
      dd = L.stickR * dead(); dn = dd * 1.3;
      const dx = px - stick.cx, dy = py - stick.cy, d = Math.hypot(dx, dy), far = L.stickR * 1.5;
      if (d > far) { stick.cx += dx * (d - far) / d; stick.cy += dy * (d - far) / d; }   // dragged well past the base: the base follows the thumb
    }
    const sec = sectorOf(px - stick.cx, py - stick.cy, stick.sec, dd, dn);
    if (sec !== stick.sec && sec >= 0 && playing()) buzz('tick');   // a tick of haptic as a direction changes
    applySector(sec); stick.sec = sec;
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
  function pulse(name, secs) { const i = ['right', 'left', 'up', 'down'].indexOf(name); if (!(i >= 0 && curDirs[i])) { env.keys[name] = true; held[name] = true; } pulses.push({ name, until: clk + secs }); }
  const fireSlot = i => { if (aimOn()) env.autoFace('aim'); env.press(SLOT_KEYS[i]); buzz('tap'); };
  /* a button goes down: e = the touch's own record { role: 'btn', k, t0, ... } (DEFEND and SKILL decide later: on release, or after a hold) */
  function pressBtn(e) {
    const k = e.k; e.t0 = clk; e.blocking = e.radial = e.swallow = false; e.sel = -1;
    if (k !== 'pause') buzz('tap');
    if (k === 'interact') { env.press(verb ? verb.key : 'talk'); return; }
    if (k === 'ctx') { if (aimOn() && ctx && ctx.key === 'throw') env.autoFace('aim'); env.press(ctx ? ctx.key : 'throw'); return; }
    if (k === 'defend') { if (blockTog() && held.block) { env.keys.block = false; held.block = false; e.swallow = true; } return; }
    if (k === 'skill') return;
    if (k === 'block' && blockTog()) { env.keys.block = !env.keys.block; held.block = env.keys.block; return; }
    if (k === 'atk' && faceOn()) env.autoFace('atk');
    if (k in SKILL_OF && aimOn()) env.autoFace('aim');
    if (k === 'jump') { env.press('jump'); env.press('confirm'); }
    else if (k === 'pause') env.press('pause');
    else if (k !== 'block') env.press(k);
    const h = HOLD[k]; if (h) { env.keys[h] = true; held[h] = true; }
  }
  /* a button comes up (cancel: the thumb slid off to another button, so a half-decided DEFEND / SKILL does nothing) */
  function releaseBtn(e, cancel) {
    const k = e.k;
    if (k === 'defend') {
      if (e.blocking) { if (!blockTog()) { env.keys.block = false; held.block = false; } }
      else if (!e.swallow && !cancel) { env.press('dodge'); pulse('dodge', 0.1); }   // a tap is the dodge
      return;
    }
    if (k === 'skill') {
      if (cancel) return;
      if (e.radial) { if (e.sel >= 0) fireSlot(e.sel); }
      else { const i = SLOT_KEYS.findIndex((_, j) => env.skillOn(j)); if (i >= 0) fireSlot(i); }   // a tap is the first skill
      return;
    }
    if (k === 'block' && blockTog()) return;
    const h = HOLD[k]; if (h && held[h]) { env.keys[h] = false; held[h] = false; }
  }
  function releaseAll() { for (const id of [...touches.keys()]) endTouch(id); for (const h in held) if (held[h]) { env.keys[h] = false; held[h] = false; } pulses.length = 0; stick = null; curDirs = [0, 0, 0, 0]; }
  /* THE SKILL WHEEL: a fan of the slots round the SKILL button (up and away from the thumb), the slots that are slotted lit; slide to one and let go */
  function radialSlots() {
    const L = layout(), b = L.btn.skill; if (!b) return [];
    const sg = left() ? -1 : 1, R = 2.3 * L.s, n = SLOT_KEYS.length;
    return SLOT_KEYS.map((key, i) => { const a = Math.PI * (1 + 0.5 * i / Math.max(1, n - 1)); return { i, key, r: 0.5 * L.s, cx: clamp(b.cx + sg * Math.cos(a) * R, L.ins.l + 0.5 * L.s, L.W - L.ins.r - 0.5 * L.s), cy: clamp(b.cy + Math.sin(a) * R, L.ins.t + 0.5 * L.s, L.H - L.ins.b - 0.5 * L.s) }; });
  }
  function radialAt(px, py) { let best = -1, bd = 1e9; for (const s of radialSlots()) { if (!env.skillOn(s.i)) continue; const d = Math.hypot(px - s.cx, py - s.cy); if (d <= s.r * 1.7 && d < bd) { best = s.i; bd = d; } } return best; }
  /* a thumb slides from this button onto another (jump -> attack in one motion): the old one is let go of, the new one taken up */
  function takeover(e, k) { releaseBtn(e, true); e.k = k; pressBtn(e); }

  // ---------- touch events ----------
  function hitAt(px, py) { const [gx, gy] = toGame(px, py); for (let i = hitsNow.length - 1; i >= 0; i--) { const h = hitsNow[i]; if (gx >= h.x && gx < h.x + h.w && gy >= h.y && gy < h.y + h.h) return h; } return null; }
  function startTouch(id, px, py) {
    if (editing) { editStart(id, px, py); return; }
    const L = layout();
    const b = pickBtn(px, py, 1.3); if (b) { const e = { role: 'btn', k: b.k }; touches.set(id, e); pressBtn(e); return; }
    if (!playing()) {
      for (const p of pillsNow()) if (inRect(p, px, py)) { touches.set(id, { role: 'tap' }); env.press(p.press); return; }
      const h = hitAt(px, py); if (h) { touches.set(id, { role: 'tap' }); const [gx, gy] = toGame(px, py); h.fn(gx, gy); return; }
      if (TAP_ANY.has(env.state())) { touches.set(id, { role: 'tap' }); env.press('confirm'); return; }
    }
    if (!stick) {
      if (playing() && moveMode() === 'dpad') { if (Math.hypot(px - L.dpad.cx, py - L.dpad.cy) <= L.dpad.catchR) { stick = { id, dp: true, cx: L.dpad.cx, cy: L.dpad.cy, x: px, y: py, sec: -1 }; touches.set(id, { role: 'stick' }); stickMove(px, py); return; } }
      else if (px >= L.zone.x0 && px <= L.zone.x1) { stick = { id, cx: px, cy: py, x: px, y: py, sec: -1 }; touches.set(id, { role: 'stick' }); return; }
    }
    const swipe = playing() && swipeOn() && (left() ? px <= L.W * 0.5 : px >= L.W * 0.5);   // SWIPE GESTURES (off by default): the empty part of the button side
    touches.set(id, swipe ? { role: 'swipe', x0: px, y0: py, fired: false } : { role: 'none' });
  }
  function swipeDone(t, dx, dy) {
    t.fired = true; buzz('tap');
    if (Math.abs(dx) >= Math.abs(dy)) { pulse(dx < 0 ? 'left' : 'right', 0.16); env.press('dodge'); }   // a dodge that way
    else { pulse(dy > 0 ? 'down' : 'up', 0.2); env.press('atk'); }   // down: the plunge (in the air) or the low cut; up: the up-slash
  }
  function moveTouch(id, px, py) {
    const t = touches.get(id); if (!t) return;
    if (t.role === 'stick' && stick) stickMove(px, py);
    else if (t.role === 'drag') editMove(px, py);
    else if (t.role === 'btn') {
      if (t.radial) { const i = radialAt(px, py); if (i !== t.sel) { t.sel = i; if (i >= 0) buzz('tick'); } return; }
      const cur = layout().btn[t.k]; if (cur && inCircle(cur, px, py, 1.12)) return;   // still on it
      const b = pickBtn(px, py, 1.12, t.k); if (b && b.k !== 'pause') takeover(t, b.k);   // slid onto another; sliding off into the gap keeps the old one
    } else if (t.role === 'none' && playing()) {   // a thumb that landed in a gap slides into a button, or into the d-pad
      const b = pickBtn(px, py, 1.05); if (b && b.k !== 'pause') { t.role = 'btn'; t.k = b.k; pressBtn(t); return; }
      const L = layout(); if (!stick && moveMode() === 'dpad' && Math.hypot(px - L.dpad.cx, py - L.dpad.cy) <= L.dpad.catchR) { stick = { id, dp: true, cx: L.dpad.cx, cy: L.dpad.cy, x: px, y: py, sec: -1 }; t.role = 'stick'; stickMove(px, py); }
    } else if (t.role === 'swipe' && !t.fired) { const dx = px - t.x0, dy = py - t.y0; if (Math.hypot(dx, dy) >= 0.55 * layout().s) swipeDone(t, dx, dy); }
  }
  function endTouch(id) {
    const t = touches.get(id); if (!t) return; touches.delete(id);
    if (t.role === 'stick') stickEnd(); else if (t.role === 'btn') releaseBtn(t, false); else if (t.role === 'drag') editEnd();
  }
  if (on) {
    const each = (e, f) => { e.preventDefault(); lastTouchAt = performance.now(); for (const t of e.changedTouches) { const [px, py] = toDisp(t); f(t.identifier, px, py); } };
    disp.addEventListener('touchstart', e => { rect = null; env.initAudio(); if (env.touched) env.touched(); each(e, startTouch); }, { passive: false });
    disp.addEventListener('touchmove', e => each(e, moveTouch), { passive: false });
    const end = e => { e.preventDefault(); for (const t of e.changedTouches) endTouch(t.identifier); };
    /* A BLUETOOTH PAD (Android Chrome exposes it after its first button press): say so, and the touch layer steps aside while the pad is the hand in use */
    addEventListener('gamepadconnected', () => { padSeen = true; banner = { text: 'CONTROLLER CONNECTED', until: clk + 3.5 }; });
    addEventListener('gamepaddisconnected', () => { try { padSeen = !![...(navigator.getGamepads ? navigator.getGamepads() : [])].some(Boolean); } catch { padSeen = false; } banner = { text: padSeen ? 'CONTROLLER CHANGED' : 'CONTROLLER DISCONNECTED', until: clk + 2.5 }; });
    disp.addEventListener('touchend', end, { passive: false }); disp.addEventListener('touchcancel', end, { passive: false });
    addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); else wake(); });
    /* THE SCREEN STAYS ON while the game is open (a thumb on a stick is not a screen touch the phone counts as idle for long): the Screen Wake Lock, asked for on a touch
       and again when the page comes back (the browser drops it when the page is hidden). Silently nothing where it is not offered. */
    let wl = null; const wake = () => { try { if (navigator.wakeLock && !wl && !document.hidden) navigator.wakeLock.request('screen').then(l => { wl = l; l.addEventListener('release', () => { wl = null; }); }).catch(() => {}); } catch {} };
    disp.addEventListener('touchend', wake, { passive: true });
  }

  // ---------- the layout editor (Settings > TOUCH > Edit layout): drag a button, it keeps the spot ----------
  function editStart(id, px, py) {
    const L = layout(), bar = editBar();
    if (inRect(bar.reset, px, py)) { SET.touchPos = {}; env.save(); relayout(); touches.set(id, { role: 'tap' }); return; }
    if (inRect(bar.done, px, py)) { editing = false; touches.set(id, { role: 'tap' }); return; }
    let best = null, bd = 1e9; for (const k of [...btnSet(), 'pause']) { const b = L.btn[k], d = Math.hypot(px - b.cx, py - b.cy); if (d <= b.r * 1.25 && d < bd) { best = k; bd = d; } }
    if (best) { drag = { k: best, ox: px - L.btn[best].cx, oy: py - L.btn[best].cy }; touches.set(id, { role: 'drag' }); } else touches.set(id, { role: 'none' });
  }
  function editMove(px, py) {
    if (!drag) return; const L = layout(), b = L.btn[drag.k];
    const x = clamp(px - drag.ox, L.ins.l + b.r, L.W - L.ins.r - b.r), y = clamp(py - drag.oy, L.ins.t + b.r, L.H - L.ins.b - b.r);
    if (preset() !== 'custom') { SET.touchBase = baseOf(); SET.touchPreset = 'custom'; SET.touchPos = {}; }   // the first drag makes the layout the player's own (CUSTOM, on the buttons it started from)
    SET.touchPos = SET.touchPos || {}; SET.touchPos[drag.k] = [x / L.W, y / L.H]; relayout();
  }
  function editEnd() { if (drag) { env.save(); drag = null; } }
  function editBar() { const L = layout(), w = 2.4 * L.s, h = 0.8 * L.s, y = L.ins.t + L.m; return { reset: { x: L.W / 2 - w - 8, y, w, h }, done: { x: L.W / 2 + 8, y, w, h } }; }

  // ---------- tick and draw ----------
  function tick(dt) {
    if (!on) return;
    clk += dt;
    verbAt -= dt; if (verbAt <= 0 && (playing() || editing)) { verbAt = 0.08; verb = playing() ? env.verb() : null; ctx = playing() && env.ctx ? env.ctx() : null; }
    if (!playing()) { verb = null; ctx = null; }
    if (banner && clk > banner.until) banner = null;
    for (let i = pulses.length - 1; i >= 0; i--) { const p = pulses[i]; if (clk >= p.until) { pulses.splice(i, 1); const di = ['right', 'left', 'up', 'down'].indexOf(p.name); if (!(di >= 0 && curDirs[di]) && held[p.name]) { env.keys[p.name] = false; held[p.name] = false; } } }
    for (const e of touches.values()) {   // DEFEND held is a block; SKILL held opens the wheel
      if (e.role !== 'btn') continue;
      if (e.k === 'defend' && !e.blocking && !e.swallow && clk - e.t0 >= HOLD_DEFEND) { e.blocking = true; env.keys.block = true; held.block = true; buzz('tick'); }
      if (e.k === 'skill' && !e.radial && clk - e.t0 >= HOLD_SKILL && SLOT_KEYS.some((_, i) => env.skillOn(i))) { e.radial = true; e.sel = -1; buzz('tick'); }
    }
    // AUTO-INTERACT: pushing into a door or a lever and standing there for a moment uses it (never a shop, a talk, a take or the way out)
    if (useCd > 0) useCd -= dt;
    const pushing = !!(env.keys.left || env.keys.right), vk = verb ? verb.verb : '';
    if (useOn() && playing() && verb && AUTO_VERBS.has(vk) && pushing && (!env.speed || env.speed() < 14)) { useT = vk === verbKey ? useT + dt : 0; verbKey = vk; if (useT >= 0.3 && useCd <= 0) { env.press(verb.key); useCd = 1.5; useT = 0; buzz('tap'); } } else { useT = 0; verbKey = vk; }
    // a held direction repeats in the lists, like a held key: after 0.4 s, then every 0.16 s
    if (stick && stick.sec >= 0 && REPEAT.has(env.state())) {
      rep.t += dt; const first = 0.4, per = 0.16; if (rep.t >= first + rep.n * per) { rep.n++; const v = SECT[stick.sec]; const names = ['right', 'left', 'up', 'down']; for (let i = 0; i < 4; i++) if (v[i]) env.press(names[i]); }
    }
  }
  function roundRect(x, y, w, h, r) { dg.beginPath(); dg.roundRect(x, y, w, h, r); }
  function fit(text, maxW, px) { dg.font = px + 'px ' + FONT; while (px > 6 && dg.measureText(text).width > maxW) { px--; dg.font = px + 'px ' + FONT; } return px; }
  const glyphs = {};   // what each skill button last drew: { scale, side, r, k } (the test reads it)
  let skillNow = null;   // { icon, k (0..1 of the wait left), secs } for the skill button being drawn, or null
  function icon(k, b, down) {
    const { cx, cy, r } = b, u = r * 0.5; skillNow = k in SKILL_OF && env.skillInfo && !editing ? env.skillInfo(SKILL_OF[k]) : null; dg.save(); dg.translate(cx, cy);
    dg.strokeStyle = 'rgba(255,246,224,0.95)'; dg.fillStyle = 'rgba(255,246,224,0.95)'; dg.lineWidth = Math.max(2, r * 0.12); dg.lineCap = 'round'; dg.lineJoin = 'round';
    if (k === 'atk') { dg.beginPath(); dg.moveTo(-u * 0.9, u * 0.9); dg.lineTo(u * 0.8, -u * 0.8); dg.stroke(); dg.beginPath(); dg.moveTo(-u * 0.55, u * 0.1); dg.lineTo(-u * 0.1, u * 0.55); dg.stroke(); dg.beginPath(); dg.moveTo(u * 0.8, -u * 0.8); dg.lineTo(u * 0.8, -u * 0.35); dg.moveTo(u * 0.8, -u * 0.8); dg.lineTo(u * 0.35, -u * 0.8); dg.stroke(); }
    else if (k === 'jump') { dg.beginPath(); dg.moveTo(-u * 0.8, u * 0.45); dg.lineTo(0, -u * 0.35); dg.lineTo(u * 0.8, u * 0.45); dg.stroke(); dg.beginPath(); dg.moveTo(-u * 0.8, u * 1.0); dg.lineTo(0, u * 0.2); dg.lineTo(u * 0.8, u * 1.0); dg.stroke(); }
    else if (k === 'dodge') { for (const o of [-0.5, 0.35]) { dg.beginPath(); dg.moveTo(u * (o - 0.3), -u * 0.7); dg.lineTo(u * (o + 0.3), 0); dg.lineTo(u * (o - 0.3), u * 0.7); dg.stroke(); } }
    else if (k === 'block') { dg.beginPath(); dg.moveTo(-u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, u * 0.1); dg.quadraticCurveTo(u * 0.7, u * 0.7, 0, u * 1.0); dg.quadraticCurveTo(-u * 0.7, u * 0.7, -u * 0.75, u * 0.1); dg.closePath(); dg.stroke(); }
    else if (k === 'pause') { dg.fillRect(-u * 0.55, -u * 0.7, u * 0.38, u * 1.4); dg.fillRect(u * 0.17, -u * 0.7, u * 0.38, u * 1.4); }
    else if (k === 'defend') { dg.beginPath(); dg.moveTo(-u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, -u * 0.8); dg.lineTo(u * 0.75, u * 0.1); dg.quadraticCurveTo(u * 0.7, u * 0.7, 0, u * 1.0); dg.quadraticCurveTo(-u * 0.7, u * 0.7, -u * 0.75, u * 0.1); dg.closePath(); dg.stroke(); dg.beginPath(); dg.moveTo(-u * 0.3, -u * 0.1); dg.lineTo(0, u * 0.25); dg.lineTo(u * 0.3, -u * 0.1); dg.stroke(); }
    else if (k === 'skill') {   // a four-point spark, and a pip for each slotted skill (dim while it waits)
      dg.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? u * 0.28 : u * 0.95; dg.lineTo(Math.cos(a) * rr, Math.sin(a) * rr - u * 0.12); } dg.closePath(); dg.stroke();
      const n = SLOT_KEYS.length, a1 = dg.globalAlpha; for (let i = 0; i < n; i++) { if (!env.skillOn(i)) continue; const inf = env.skillInfo ? env.skillInfo(i) : null; dg.globalAlpha = a1 * (inf && inf.k > 0 ? 0.35 : 1); dg.beginPath(); dg.arc((i - (n - 1) / 2) * u * 0.42, u * 1.05, Math.max(1.5, u * 0.11), 0, 7); dg.fill(); } dg.globalAlpha = a1;
    }
    else if (k === 'interact' || k === 'ctx') { const word = (k === 'ctx' ? (ctx && ctx.label) : verb && verb.verb) || (k === 'ctx' ? 'THROW' : 'USE'), px = fit(String(word).toUpperCase(), r * 1.55, Math.round(r * 0.55)); dg.font = px + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(String(word).toUpperCase(), 0, 1); }
    else if (k in SKILL_OF && skillNow && skillNow.icon) skillFace(k, r, skillNow);   // THE SKILL'S OWN GLYPH (the same picture the HUD slot and the store use), a whole-number scale so the pixels stay square, the wait swept over it
        else { dg.font = Math.round(r * 0.9) + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(LABEL[k] || '?', 0, 1); }
    dg.restore();
  }
  /* the skill glyph + its wait sweep + its key letter, centred on the current origin (the button's own face and the wheel's slots share it) */
  function skillFace(k, r, info) {
    const ic = info.icon, iw = ic.width || 12, ih = ic.height || 12, ok = ov ? ov.width / disp.width : 1, sc = Math.max(1, Math.round(r * 1.45 * ok / Math.max(iw, ih))) / ok, dw = iw * sc, dh = ih * sc, busy = info.k > 0;
    glyphs[k] = { scale: sc * ok, side: Math.max(dw, dh) * ok / 1, r, k: info.k }; dg.imageSmoothingEnabled = false; dg.globalAlpha *= busy ? 0.5 : 1; dg.drawImage(ic, Math.round(-dw / 2), Math.round(-dh / 2), dw, dh); dg.globalAlpha /= busy ? 0.5 : 1;
    if (busy) {
      dg.save(); dg.beginPath(); dg.arc(0, 0, r * 0.94, 0, 7); dg.clip(); dg.fillStyle = 'rgba(8,8,16,0.62)'; dg.beginPath(); dg.moveTo(0, 0); dg.arc(0, 0, r * 1.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, info.k)); dg.closePath(); dg.fill(); dg.restore();
      if (info.secs >= 1) { const t = String(Math.ceil(info.secs)), px = Math.round(r * 0.62); dg.font = px + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.lineWidth = Math.max(2, px * 0.28); dg.strokeStyle = 'rgba(8,8,16,0.9)'; dg.strokeText(t, 0, 1); dg.fillStyle = '#fff6e0'; dg.fillText(t, 0, 1); }
    }
    const kp = Math.round(r * 0.4); dg.font = kp + 'px ' + FONT; dg.textAlign = 'right'; dg.textBaseline = 'alphabetic'; dg.lineWidth = Math.max(2, kp * 0.3); dg.strokeStyle = 'rgba(8,8,16,0.9)'; dg.strokeText(LABEL[k] || '', r * 0.86, r * 0.84); dg.fillStyle = 'rgba(255,246,224,0.9)'; dg.fillText(LABEL[k] || '', r * 0.86, r * 0.84);
  }
  /* b: the button; down: a thumb is on it (it squashes a little); ghost: the layout editor's; dim: it cannot be used right now */
  function drawBtn(b, down, ghost, dim) {
    if (down) b = { ...b, r: b.r * 0.92 };
    const a0 = dg.globalAlpha; if (dim) dg.globalAlpha = a0 * 0.5;
    dg.fillStyle = down ? 'rgba(143,209,96,0.62)' : ghost ? 'rgba(255,211,107,0.30)' : 'rgba(20,16,30,0.5)';
    dg.beginPath(); dg.arc(b.cx, b.cy, b.r, 0, 7); dg.fill();
    dg.strokeStyle = ghost ? 'rgba(255,211,107,0.95)' : 'rgba(255,246,224,0.7)'; dg.lineWidth = Math.max(2, b.r * 0.07); dg.stroke();
    icon(b.k, b, down); dg.globalAlpha = a0;
  }
  function drawPill(p, down, label) {
    dg.fillStyle = down ? 'rgba(143,209,96,0.62)' : 'rgba(20,16,30,0.55)'; roundRect(p.x, p.y, p.w, p.h, p.h * 0.3); dg.fill();
    dg.strokeStyle = 'rgba(255,246,224,0.7)'; dg.lineWidth = 2; dg.stroke();
    const px = fit(label, p.w * 0.84, Math.round(p.h * 0.34)); dg.font = px + 'px ' + FONT; dg.fillStyle = 'rgba(255,246,224,0.95)'; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(label, p.x + p.w / 2, p.y + p.h / 2 + 1);
  }
  /* THE D-PAD: a ring split in eight wedges (the lit one is where the thumb is), an arrow on each of the four ways, a dot for the thumb */
  function drawDpad(L) {
    const D = L.dpad, act = stick && stick.dp ? stick : null, R = D.R;
    dg.fillStyle = 'rgba(20,16,30,0.32)'; dg.beginPath(); dg.arc(D.cx, D.cy, R, 0, 7); dg.fill();
    if (act && act.sec >= 0) { const a0 = (-act.sec * 45 - 22.5) * Math.PI / 180; dg.fillStyle = 'rgba(143,209,96,0.55)'; dg.beginPath(); dg.moveTo(D.cx, D.cy); dg.arc(D.cx, D.cy, R, a0, a0 + Math.PI / 4); dg.closePath(); dg.fill(); }
    dg.strokeStyle = 'rgba(255,246,224,0.55)'; dg.lineWidth = 2; dg.beginPath(); dg.arc(D.cx, D.cy, R, 0, 7); dg.stroke();
    dg.strokeStyle = 'rgba(255,246,224,0.22)'; dg.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * 45 + 22.5) * Math.PI / 180; dg.moveTo(D.cx + Math.cos(a) * R * 0.2, D.cy + Math.sin(a) * R * 0.2); dg.lineTo(D.cx + Math.cos(a) * R, D.cy + Math.sin(a) * R); } dg.stroke();
    dg.beginPath(); dg.arc(D.cx, D.cy, R * 0.2, 0, 7); dg.stroke();
    for (let i = 0; i < 4; i++) {   // the four arrows (E, N, W, S: sectors 0, 2, 4, 6)
      const sec = i * 2, lit = act && act.sec >= 0 && (act.sec === sec || (sec === 0 && (act.sec === 1 || act.sec === 7)) || (sec === 2 && (act.sec === 1 || act.sec === 3)) || (sec === 4 && (act.sec === 3 || act.sec === 5)) || (sec === 6 && (act.sec === 5 || act.sec === 7)));
      const a = -sec * 45 * Math.PI / 180, ax = D.cx + Math.cos(a) * R * 0.66, ay = D.cy + Math.sin(a) * R * 0.66, u = R * 0.13, nx = Math.cos(a), ny = Math.sin(a);
      dg.fillStyle = lit ? 'rgba(143,209,96,0.98)' : 'rgba(255,246,224,0.6)'; dg.beginPath(); dg.moveTo(ax + nx * u, ay + ny * u); dg.lineTo(ax - nx * u * 0.6 - ny * u, ay - ny * u * 0.6 + nx * u); dg.lineTo(ax - nx * u * 0.6 + ny * u, ay - ny * u * 0.6 - nx * u); dg.closePath(); dg.fill();
    }
    if (act) { const dx = act.x - D.cx, dy = act.y - D.cy, d = Math.hypot(dx, dy) || 1, c = Math.min(d, R * 0.9); dg.fillStyle = 'rgba(255,246,224,0.55)'; dg.beginPath(); dg.arc(D.cx + dx / d * c, D.cy + dy / d * c, R * 0.16, 0, 7); dg.fill(); }
  }
  /* THE WHEEL (a SKILL held): each slot a disc on an arc round the button, its glyph and wait on it, the one under the thumb lit */
  function drawRadial(e) {
    for (const s of radialSlots()) {
      const on1 = env.skillOn(s.i), info = on1 && env.skillInfo ? env.skillInfo(s.i) : null, lit = e.sel === s.i;
      dg.save(); dg.globalAlpha *= on1 ? 1 : 0.35; dg.fillStyle = lit ? 'rgba(143,209,96,0.78)' : 'rgba(20,16,30,0.78)'; dg.beginPath(); dg.arc(s.cx, s.cy, s.r * (lit ? 1.15 : 1), 0, 7); dg.fill();
      dg.strokeStyle = lit ? 'rgba(255,246,224,1)' : 'rgba(255,246,224,0.7)'; dg.lineWidth = Math.max(2, s.r * 0.08); dg.stroke();
      if (info && info.icon) { dg.translate(s.cx, s.cy); skillFace(s.key, s.r, info); } dg.restore();
    }
  }
  function drawBanner(L) {
    if (!banner) return; const w = L.s * 6.4, h = L.s * 0.7, x = L.W / 2 - w / 2, y = L.ins.t + L.m;
    dg.save(); dg.globalAlpha = 1; dg.fillStyle = 'rgba(20,16,30,0.78)'; roundRect(x, y, w, h, h * 0.3); dg.fill(); dg.strokeStyle = 'rgba(143,209,96,0.9)'; dg.lineWidth = 2; dg.stroke();
    const px = fit(banner.text, w * 0.9, Math.round(h * 0.38)); dg.font = px + 'px ' + FONT; dg.fillStyle = '#fff6e0'; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText(banner.text, L.W / 2, y + h / 2 + 1); dg.restore();
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
  /* THE OVERLAY (claude/mobile2): the buttons are drawn on a canvas of their own, at the phone's FULL resolution, and only when something they show has changed
     (a thumb moved, a button went down, a skill's wait ticked a step). The game's own canvas is half-resolution on a phone (main.js resize), so drawing the
     buttons on it would be blocky; and redrawing them 60 times a second on top of a full-screen canvas was a cost for nothing - a still thumb costs nothing now. */
  let ov = null, ovg = null, ovSig = '';
  function overlay() {
    if (ov) return true; if (typeof document === 'undefined' || !disp.parentNode) return false;
    ov = document.createElement('canvas'); ov.id = 'touchlayer'; ov.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;touch-action:none;image-rendering:auto';
    disp.parentNode.insertBefore(ov, disp.nextSibling); ovg = ov.getContext('2d'); return true;
  }
  /* THE PAD IS THE HAND IN USE: the layer steps aside (the banner stays) until a finger touches the screen again */
  const padHidden = () => !!(on && padSeen && env.padUsed && env.padUsed() && !recent() && !editing);
  function sigNow(L) {
    const st = env.state(), dp = playing() && moveMode() === 'dpad', parts = [st, editing ? 1 : 0, layVer, L.W, L.H, opacity(), preset(), moveMode(), padHidden() ? 'pad' : '', banner ? banner.text : '', drag ? drag.k : '', stick ? (dp && stick.dp ? stick.sec : (stick.cx | 0) + ',' + (stick.cy | 0) + ',' + (stick.x | 0) + ',' + (stick.y | 0) + ',' + stick.sec) : ''];
    for (const t of touches.values()) if (t.role === 'btn') parts.push('d' + t.k + (t.radial ? 'R' + t.sel : '') + (t.blocking ? 'B' : ''));
    if (playing() || editing) { for (const b of visibleBtns()) parts.push(b.k + '@' + (b.cx | 0) + ',' + (b.cy | 0)); parts.push(verb ? verb.verb : '', ctx ? ctx.label + (ctx.dim ? '~' : '') : '');
      if (playing() && env.skillInfo) for (let i = 0; i < 4; i++) { const s = env.skillInfo(i); parts.push(s ? (s.icon && s.icon.__id || s.id || 'x') + ':' + Math.round(s.k * 32) + ':' + Math.ceil(s.secs || 0) : '-'); } }
    return parts.join('|');
  }
  function draw() {
    if (!on) return;
    const L = layout();
    if (!overlay()) { paint(L); return; }
    const g = env.geom(), k = (g.DEV || g.DPR) / g.DPR, w = Math.max(1, Math.round(disp.width * k)), h = Math.max(1, Math.round(disp.height * k)), sig = sigNow(L) + '|' + w + 'x' + h;
    if (sig === ovSig) return; ovSig = sig;
    if (ov.width !== w || ov.height !== h) { ov.width = w; ov.height = h; }
    dg = ovg; dg.setTransform(k, 0, 0, k, 0, 0); dg.clearRect(0, 0, disp.width, disp.height); dg.globalAlpha = 1;
    paint(L);
  }
  function paint(L) {
    const a0 = dg.globalAlpha; dg.globalAlpha = opacity() * (playing() && L.land && !L.bar ? 0.7 : 1);   // (over the game in landscape = fainter)
    if (editing) {
      dg.globalAlpha = 1; dg.fillStyle = 'rgba(10,14,12,0.72)'; dg.fillRect(0, 0, L.W, L.H);
      dg.globalAlpha = Math.max(0.6, opacity()); dg.strokeStyle = 'rgba(255,246,224,0.35)'; dg.setLineDash([8, 8]); dg.strokeRect(L.zone.x0 + 4, L.ins.t + L.m, L.zone.x1 - L.zone.x0 - 8, L.H - L.ins.t - L.ins.b - 2 * L.m); dg.setLineDash([]);
      dg.fillStyle = 'rgba(255,246,224,0.7)'; dg.font = Math.round(L.s * 0.3) + 'px ' + FONT; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText('STICK ZONE', (L.zone.x0 + L.zone.x1) / 2, L.H / 2);
      for (const k of [...btnSet(), 'pause']) { if (k === 'interact') verb = verb || { verb: 'USE', key: 'talk' }; if (k === 'ctx') ctx = ctx || { label: 'THROW', key: 'throw' }; drawBtn(L.btn[k], drag && drag.k === k, true); }
      const bar = editBar(); drawPill({ ...bar.reset }, false, 'RESET'); drawPill({ ...bar.done }, false, 'DONE');
      dg.font = Math.round(L.s * 0.26) + 'px ' + FONT; dg.fillStyle = 'rgba(255,246,224,0.8)'; dg.fillText('DRAG A BUTTON WHERE YOUR THUMB WANTS IT', L.W / 2, L.ins.t + L.m + L.s * 1.25);
      dg.globalAlpha = a0; return;
    }
    if (padHidden()) { drawBanner(L); dg.globalAlpha = a0; return; }
    const downK = new Set([...touches.values()].filter(t => t.role === 'btn').map(t => t.k));
    if (playing()) {
      if (moveMode() === 'dpad') drawDpad(L); else drawStick(L);
      for (const b of visibleBtns()) {
        const dim = b.k === 'ctx' ? !!(ctx && ctx.dim) : b.k === 'skill' ? SLOT_KEYS.every((_, i) => !env.skillOn(i) || (env.skillInfo && env.skillInfo(i) && env.skillInfo(i).k > 0)) : false;
        drawBtn(b, downK.has(b.k), false, dim);
      }
      for (const t of touches.values()) if (t.role === 'btn' && t.radial) drawRadial(t);
    } else {
      for (const p of pillsNow()) drawPill(p, false, p.label);
      if (stick) drawStick(L);
    }
    drawBanner(L);
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
      case 'Left-handed': return onoff(left()); case 'Haptics': return onoff(SET.touchHaptics !== false);
      case 'Move control': return moveMode() === 'stick' ? 'STICK' : 'D-PAD'; case 'Stick dead zone': return DEAD_NAMES[deadIdx()]; case 'Layout': return preset().toUpperCase();
      case 'Block toggle': return onoff(blockTog()); case 'Auto-face foes': return onoff(faceOn()); case 'Aim assist': return onoff(aimOn()); case 'Auto-interact': return onoff(useOn());
      case 'Long input buffer': return onoff(bufOn()); case 'Swipe gestures': return onoff(swipeOn());
      case 'Lighter effects': return onoff(lite()); case 'Phone mode': return (SET.phoneRes || 'auto').toUpperCase(); case 'Frame rate': return SET.fpsCap === 30 ? '30' : '60'; default: return null;
    }
  }
  /* a left / right on a Touch row: true when the row was ours (main.js then saves and plays the click) */
  function adjustRow(k, dir) {
    if (k === 'Touch size') SET.touchSize = step(SIZES, size(), dir); else if (k === 'Touch opacity') SET.touchOpacity = step(OPS, opacity(), dir);
    else if (k === 'Left-handed') { SET.touchLeft = !SET.touchLeft; SET.touchPos = {}; }   // (a dragged spot belongs to the hand it was made for)
    else if (k === 'Move control') { releaseAll(); SET.touchMove = moveMode() === 'dpad' ? 'stick' : 'dpad'; }
    else if (k === 'Stick dead zone') SET.touchDead = DEADS[(deadIdx() + dir + DEADS.length) % DEADS.length];
    else if (k === 'Layout') { const P = ['simple', 'full', 'custom'], n = P[(P.indexOf(preset()) + dir + P.length) % P.length]; if (n === 'custom') SET.touchBase = baseOf(); SET.touchPreset = n; releaseAll(); }
    else if (k === 'Block toggle') { SET.blockToggle = !SET.blockToggle; env.keys.block = false; held.block = false; }
    else if (k === 'Auto-face foes') SET.touchFace = !faceOn(); else if (k === 'Aim assist') SET.touchAim = !aimOn(); else if (k === 'Auto-interact') SET.touchAutoUse = !useOn();
    else if (k === 'Long input buffer') SET.touchBuf = !bufOn(); else if (k === 'Swipe gestures') SET.touchSwipe = !swipeOn();
    else if (k === 'Haptics') { SET.touchHaptics = SET.touchHaptics === false; if (SET.touchHaptics) buzz([40]); } else if (k === 'Lighter effects') applyLite(!lite());
    else if (k === 'Phone mode') { const M = ['auto', 'on', 'off'], i = M.indexOf(SET.phoneRes || 'auto'); SET.phoneRes = M[(i + dir + 3) % 3]; if (env.phoneMode) env.phoneMode(SET.phoneRes); }
    else if (k === 'Frame rate') SET.fpsCap = SET.fpsCap === 30 ? 60 : 30;
    else return false;
    relayout(); return true;
  }
  /* a confirm on a Touch row (Z or a tap): the two action rows start the editor / reset it; every other row turns like a right */
  function confirmRow(k) {
    if (k === 'Edit layout') { editing = true; relayout(); return true; }
    if (k === 'Reset layout') { SET.touchPos = {}; SET.touchSize = 1; SET.touchOpacity = 0.6; SET.touchLeft = false; SET.touchPreset = 'simple'; SET.touchMove = 'dpad'; env.save(); relayout(); return true; }
    return adjustRow(k, 1);
  }

  // ---------- haptics and assists ----------
  const PATTERNS = { tap: [7], tick: [5], hit: [45], block: [14], parry: [12, 36, 22], levelup: [30, 60, 30, 60, 70] };
  function buzz(kind) {
    if (!on || SET.touchHaptics === false) return;
    try { if (navigator.vibrate) navigator.vibrate(Array.isArray(kind) ? kind : PATTERNS[kind] || [20]); } catch {}
  }
  const bufScale = () => (on && bufOn() && recent() ? 1.4 : 1);
  /* AUTO-FACE: a swing starts toward the nearest foe within 1.5 tiles BEHIND you, when there is none that close in front. foes: [{x, y, h}] */
  function faceFor(P, foes, reach = 24, dyTol = 20) {
    if (!P || P.dead) return 0; const f = P.face || 1; let ahead = false, best = null, bd = 1e9;
    for (const e of foes) { const dx = e.x - P.x, dy = (e.y - (e.h || 12) / 2) - (P.y - 8); if (Math.abs(dy) > dyTol || Math.abs(dx) > reach) continue; if (Math.sign(dx) === f || Math.abs(dx) < 6) ahead = true; else if (Math.abs(dx) < bd) { bd = Math.abs(dx); best = e; } }
    return !ahead && best ? Math.sign(best.x - P.x) : 0;
  }

  return {
    on, tick, draw, relayout, hit: (x, y, w, h, fn) => { if (on) hitsNow.push({ x, y, w, h, fn }); }, beginFrame: () => { if (on && hitsNow.length) hitsNow = []; },
    rowValue, adjustRow, confirmRow, applyLite, verbLabel: () => (verb ? verb.verb : null), padHidden, bar: () => layout().bar, preset, baseOf, moveMode, tips: TOUCH_TIPS, buzz, bufScale, faceFor, releaseAll, keyUsed: () => { lastTouchAt = -1e9; },
    editing: () => editing, endEdit: () => { editing = false; editEnd(); },
    // the numbers the test reads
    debug: () => { const L = layout(); return { on, layout: L, buttons: visibleBtns().map(b => ({ ...b })), pills: pillsNow(), stick: stick ? { ...stick } : null, verb, ctx, radial: [...touches.values()].filter(t => t.radial).map(t => ({ sel: t.sel, slots: radialSlots() }))[0] || null, banner: banner ? banner.text : null, padHidden: padHidden(), preset: preset(), move: moveMode(), hits: hitsNow.length, held: { ...held }, editing, recent: recent(), bar: editing ? editBar() : null }; },
    glyphs: () => JSON.parse(JSON.stringify(glyphs)), overlayCanvas: () => ov,
    allButtons: () => { const L = layout(); return Object.values(L.btn).map(b => ({ ...b })); },
    hitBoxes: () => hitsNow.map(h => ({ x: h.x, y: h.y, w: h.w, h: h.h })),
    setVerbNow: v => { verb = v; },
    gameToClient: (gx, gy) => { const { S, offX, offY } = env.geom(), r = disp.getBoundingClientRect(); return [(offX + gx * S) * r.width / disp.width + r.left, (offY + gy * S) * r.height / disp.height + r.top]; },
    displayToClient: (px, py) => { const r = disp.getBoundingClientRect(); return [px * r.width / disp.width + r.left, py * r.height / disp.height + r.top]; },
  };
}
