// src/ui-hud.js - UI POLISH A (claude/uihud): the HUD's ONE TOAST QUEUE and its safe zone, the status ICONS, the idle fade,
// the graphics PRESETS and the pause menu's order. Pure (no DOM, no main.js): main.js feeds it hintMsg/hintT every frame and draws
// what it says; tools/ui-hud.mjs asserts it (the zone never touches a HUD rect or the boss bar; a toast waits its turn).
//
// THE TOAST QUEUE. main.js still sets hintMsg / hintT in ~80 places (and the check hint-shown reads them); the queue sits between them
// and the screen. A message that arrives while another is showing WAITS (at most 3 wait, the oldest is dropped) instead of replacing it;
// each toast shows at least MIN_SHOW seconds, and once one is waiting the current one is cut to a short tail. The same text arriving
// again only refreshes the one on screen.
export const TOAST = { minShow: 1.6, tail: 0.35, maxWait: 3, stale: 7 };
export function toastQueue() { return { cur: null, wait: [], seenMsg: '', seenT: 0, clock: 0 }; }
export function toastClear(q) { q.cur = null; q.wait.length = 0; q.seenMsg = ''; q.seenT = 0; }
export function toastPush(q, msg, ttl = 2.6) {
  if (!msg) return;
  if (q.cur && q.cur.msg === msg) { q.cur.ttl = Math.max(q.cur.ttl, ttl); return; }
  const w = q.wait.find(t => t.msg === msg); if (w) { w.ttl = Math.max(w.ttl, ttl); return; }
  if (!q.cur) { q.cur = { msg, ttl, age: 0, at: q.clock }; return; }
  q.wait.push({ msg, ttl, age: 0, at: q.clock }); while (q.wait.length > TOAST.maxWait) q.wait.shift();
}
/* the hint variables, as main.js has them this frame: a NEW message (or the same one set again with more time) is an arrival */
export function toastFeed(q, hintMsg, hintT) {
  if (hintT > 0 && hintMsg && (hintMsg !== q.seenMsg || hintT > q.seenT + 0.02)) toastPush(q, hintMsg, hintT);
  q.seenMsg = hintMsg; q.seenT = hintT;
}
export function toastTick(q, dt) {
  q.clock += dt;
  if (q.cur) { q.cur.age += dt; q.cur.ttl -= dt;
    if (q.wait.length && q.cur.age >= TOAST.minShow) q.cur.ttl = Math.min(q.cur.ttl, TOAST.tail); }
  if (!q.cur || q.cur.ttl <= 0) { q.cur = null; while (q.wait.length && !q.cur) { const n = q.wait.shift(); if (q.clock - n.at < TOAST.stale) q.cur = n; } }
  return q.cur;
}
export const toastAlpha = t => t ? Math.max(0, Math.min(1, t.ttl * 2.5, t.age * 5)) : 0;

/* THE SAFE ZONE. The HUD owns the top-left (the plate, the skill slots, the status row) and the top-right (the coins, the quest line); the
   boss plate owns the foot. The toast lives between them: right of the left cluster, under the coin panel and its quest line, above the foot.
   Returns { x, y, w, foot } - foot is the y the box may not pass. */
export function toastZone(VW, VH, o = {}) {
  const left = o.wide ? 0 : Math.max(o.left || 0, 124), x = left + 4, y = o.top || 48, w = VW - 8 - x, foot = VH - (o.boss ? 36 : 8);
  return { x, y, w, foot };
}
/* the box a toast of n lines of `lh` px would take in the zone: centred in it, at the top, or (when the hero stands there) at the foot above the boss bar */
export function toastBox(zone, lines, lh, textW, heroBand) {
  const bw = Math.min(zone.w, Math.max(...lines.map(textW)) + 16), bh = lines.length * lh + 6;
  const x = Math.round(zone.x + (zone.w - bw) / 2), top = zone.y, down = zone.foot - bh;
  const y = heroBand && heroBand[0] < top + bh + 4 && heroBand[1] > top - 8 ? down : top;
  return { x, y, w: bw, h: bh };
}
export const rectsOverlap = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];

/* THE IDLE FADE: a counter (coins, clock, the XP line) is full while it changes and for `hold` seconds after, then settles to `floor`. */
export function idleAlpha(since, hold = 3.5, span = 1.2, floor = 0.38) { return since <= hold ? 1 : Math.max(floor, 1 - (1 - floor) * Math.min(1, (since - hold) / span)); }

/* THE STATUS ICONS: 7 x 7, rows of 0 (air) / 1 (the body). One shape, one colour from the caller; a dark plate under each so they read on any sky. */
export const ICONS = {
  shade: ['0001000', '0111110', '1111111', '0001000', '0001000', '0001000', '0011000'],   /* a parasol */
  storm: ['0001100', '0011000', '0110000', '1111110', '0001100', '0011000', '0010000'],   /* the worm's storm: a bolt */
  heat:  ['0001000', '0011000', '0111100', '0111110', '1111111', '0111110', '0011100'],   /* the sun's bite: a flame */
  drop:  ['0001000', '0001000', '0011100', '0111110', '0111110', '0111110', '0011100'],   /* water */
  dry:   ['1001001', '0101010', '0011100', '1111111', '0011100', '0101010', '1001001'],   /* a parched sun */
  flood: ['0000000', '0110011', '1111111', '0000000', '0110011', '1111111', '0000000'],   /* the wave */
  horn:  ['0000011', '0001110', '1111110', '1111110', '0001110', '0000011', '0000000'],
};
export function drawIcon(g, id, x, y, col, alpha = 1) {
  const s = ICONS[id]; if (!s) return;
  g.globalAlpha = 0.62 * alpha; g.fillStyle = 'rgb(10,8,20)'; g.fillRect(x - 1, y - 1, 9, 9);
  g.globalAlpha = alpha; g.fillStyle = col;
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) if (s[r][c] === '1') g.fillRect(x + c, y + r, 1, 1);
  g.globalAlpha = 1;
}
export const ICON_W = 10;

/* the sun's status words, said once as icons: what to draw by the meter. stg 0..3 is the build, shaded/storm are the level's shade */
export function sunStatus({ shaded, storm, stg }) {
  if (shaded) return { icon: storm ? 'storm' : 'shade', col: '#c9b0e0', tip: storm ? 'THE STORM' : 'IN THE SHADE' };
  if (stg) return { icon: 'heat', col: ['#ff9a4c', '#ff5a3c', '#ff2a2a'][stg - 1], tip: ['THE SUN BITES', 'HOTTER: FIND SHADE', 'SCORCHING: SHADE, NOW'][stg - 1], stage: stg };
  return null;
}
/* a status CHANGED: the one line that says so (null when nothing changed). prev/next are sunStatus() results */
export function statusChange(prev, next) {
  const p = prev ? prev.icon + (prev.stage || '') : '', n = next ? next.icon + (next.stage || '') : '';
  if (p === n) return null;
  if (next && next.stage && (!prev || prev.icon !== 'heat' || next.stage > prev.stage)) return next.tip;
  if (next && (next.icon === 'shade' || next.icon === 'storm') && prev && prev.icon === 'heat') return next.tip + ': THE SUN LETS GO';
  return null;
}

/* GRAPHICS PRESETS: the fields that cost frames or add noise, set together. HIGH is what a new save already has. */
export const GFX_ORDER = ['low', 'medium', 'high'];
export const GFX_PRESETS = {
  low:    { parts: 'few',    parallax: 'off',  air: false, tint: 'off',  weather: false, ambient: false, grain: false, vignette: false, scanlines: false },
  medium: { parts: 'normal', parallax: 'near', air: true,  tint: 'half', weather: true,  ambient: true,  grain: false, vignette: true,  scanlines: false },
  high:   { parts: 'normal', parallax: 'full', air: true,  tint: 'full', weather: true,  ambient: true,  grain: false, vignette: true,  scanlines: false },
};
const gv = (S, k) => k === 'air' ? S.air !== false : k === 'ambient' || k === 'weather' || k === 'vignette' ? S[k] !== false : S[k];
export function gfxOf(S) { for (const id of GFX_ORDER) if (Object.keys(GFX_PRESETS[id]).every(k => gv(S, k) === GFX_PRESETS[id][k])) return id; return 'custom'; }
export function gfxStep(S, dir) { const cur = gfxOf(S), i = cur === 'custom' ? (dir > 0 ? -1 : GFX_ORDER.length) : GFX_ORDER.indexOf(cur), id = GFX_ORDER[(i + dir + GFX_ORDER.length) % GFX_ORDER.length]; Object.assign(S, GFX_PRESETS[id]); return id; }

/* THE PAUSE MENU: what a player pauses for first (resume, the map, the skills, the settings, back to the map), then the level's own rows,
   then the sound, then co-op (kept, and the check settings-tabs opens the guide from here; it just no longer sits in the first screen), then quit.
   Every row keeps its name: the action is main.js's, keyed by it. */
export const PAUSE_ROWS = ['Resume', 'Map', 'Skills', 'Settings', 'Return to map', 'Level card', 'Store', 'Hero', 'Hero trial', 'Back to shrine', 'Restart level',
  'Music volume', 'Effects vol', 'Co-op', 'Co-op guide', 'Quit to title'];
