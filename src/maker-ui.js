// THE MAKER'S SCREEN (claude/maker, Daniel 2026-11-09: "it's not clear how to access items" + "multiple background /
// music options"). Everything is on screen and clickable: group tabs and an icon strip along the top, the buttons along
// the bottom, a SETTINGS panel (background, music, time of day, weather, name, width) and a HELP card.
// main.js hands it a context each frame (drawChrome) and each mouse event (uiMouse); the editor's keys still work.
import { TILES, FOES, WATER_FOES, THINGS, nameOf, thingName, pieceRows, pieceName, rowValue, describe, describeEnt, GUIDE, EXAMPLES } from './maker-palette.js';
import { T } from './level.js';
import { MUSIC_NAMES } from './audio.js';

// ---------------- the groups ----------------
const isSlopeId = v => typeof v === 'number' && v >= 20 && v <= 25;
const tileIdx = pred => TILES.map((t, i) => [t, i]).filter(([t]) => pred(t[1])).map(([, i]) => i);
const thingIdx = ids => ids.map(id => THINGS.indexOf(id)).filter(i => i >= 0);
const MECH = ['lever', 'plate', 'key:brass', 'lockgate:brass', 'key:iron', 'lockgate:iron', 'key:bone', 'lockgate:bone', 'pushblock', 'mover', 'mover:up'];
const HAZ = ['crusher', 'firevent', 'roller', 'rockfall', 'vent', 'firepit'];
/* THE STARTER CAST: fifteen you can read at a glance (Mario Maker shows a few, not all); the rest are one tab over */
const STARTER = ['sprig', 'shield', 'archer', 'brute', 'hound', 'wasp', 'spit', 'hopper', 'sapper', 'harpy', 'zombie', 'wight', 'goat', 'rockgoblin', 'shaman'];
export const GROUPS = [
  { name: 'GROUND', cat: 0, idx: tileIdx(v => (typeof v === 'number' && !isSlopeId(v)) || (typeof v === 'string' && v.startsWith('mat:'))) },
  { name: 'SLOPES & WATER', cat: 0, idx: tileIdx(v => isSlopeId(v) || (typeof v === 'string' && !v.startsWith('mat:'))) },
  { name: 'ENEMIES', cat: 1, idx: STARTER.map(t => FOES.indexOf(t)).filter(i => i >= 0) },
  { name: 'MORE ENEMIES', cat: 1, idx: FOES.map((t, i) => [t, i]).filter(([t]) => !WATER_FOES.includes(t) && !STARTER.includes(t)).map(([, i]) => i) },
  { name: 'WATER ENEMIES', cat: 1, idx: FOES.map((t, i) => [t, i]).filter(([t]) => WATER_FOES.includes(t)).map(([, i]) => i) },
  { name: 'ITEMS', cat: 2, idx: THINGS.map((t, i) => [t, i]).filter(([t]) => !MECH.includes(t) && !HAZ.includes(t)).map(([, i]) => i) },
  { name: 'MECHANISMS', cat: 2, idx: thingIdx(MECH) },
  { name: 'HAZARDS', cat: 2, idx: thingIdx(HAZ) },
  { name: 'TOOLS', cat: 3, idx: null },   // filled from the editor's own tool list
];
const TOOL_NAMES = { START: 'START (where the knight begins)', LINK: 'LINK (a lever or plate, then its door)', EDIT: 'EDIT A PIECE (or SHIFT+CLICK it)' };
const TOOL_SHOWN = ['START', 'LINK', 'EDIT'];
const TAG_COL = { FLIES: '#8fd1ff', SHOOTS: '#ffb36b', THROWS: '#ffb36b', BOMBS: '#ff8a5a', HEAVY: '#d88a8a', CHARGES: '#d88a8a', SHIELD: '#b3aca0', WATER: '#6fc3ff', FIGHTS: '#c8bcd8', WALKS: '#a8d890', FAST: '#f0e070', LEAPS: '#a8e0c0', RISES: '#b8a0e0', SUMMONS: '#d8a0e8' };   // THEME / WIDER / NARROWER live in SETTINGS now

// ---------------- state ----------------
const UI = { guide: -1, guideT: 0, group: 0, page: [0, 0, 0, 0, 0, 0, 0, 0, 0], hover: null, panel: null, btns: [], tabs: [], cells: [], arrows: [], rows: [], map: null, mapDrag: false, mapOn: true };
export function mouseUp() { UI.mapDrag = false; }
// THE RECENT ROW: the last eight pieces you used, always one click away (Mario Maker's own habit)
const RECENT = []; export const recent = () => RECENT;
export function used(cat, i) { const k = RECENT.findIndex(r => r.cat === cat && r.i === i); if (k >= 0) RECENT.splice(k, 1); RECENT.unshift({ cat, i }); if (RECENT.length > 8) RECENT.length = 8; }
export const mapRect = () => UI.map;   /* where the MAP was last drawn (tools/maker-editing.mjs clicks it) */
export const panelOpen = () => !!UI.panel;
const HELP_KEY = 'bracken.maker.helpSeen';
export function firstVisit() { try { if (!localStorage.getItem(HELP_KEY)) { UI.panel = 'help'; localStorage.setItem(HELP_KEY, '1'); } } catch (e) {} }   /* (its START THE GUIDE button leads a first level) */

// ---------------- the level's settings ----------------
export const TIMES = [null, 'day', 'dusk', 'night', 'cave'];
export const WEATHERS = [null, 'clear', 'rain', 'snow', 'mist', 'leaves', 'pollen', 'wind', 'embers', 'dust', 'spore', 'smoke'];
const TIME_NAMES = { day: 'DAY', dusk: 'DUSK', night: 'NIGHT', cave: 'CAVE (dark)' };
export function applySettings(o, doc, TS) {
  if (doc.music) o.music = doc.music;
  const t = doc.time;
  if (t === 'day') Object.assign(o, { night: false, nightA: 0, dark: 0, glowNight: false, duskStart: 99999, duskLen: 1 });
  if (t === 'dusk') Object.assign(o, { night: false, nightA: 0, dark: 0, duskStart: -1, duskLen: 1 });
  if (t === 'night') Object.assign(o, { night: true, nightA: 0.26, dark: 0, glowNight: true, duskStart: 99999 });
  if (t === 'cave') Object.assign(o, { night: true, nightA: 0.1, dark: 0.08, glowNight: true, duskStart: 99999 });
  if (doc.weather === 'clear') o.weather = [];
  else if (doc.weather) o.weather = [{ x0: 0, x1: doc.W * TS, kind: doc.weather }];
  return o;
}
const prettyTrack = k => k ? String(k).replace(/^mus/, '').replace(/([a-z])([A-Z0-9])/g, '$1 $2').toUpperCase() : "THE BACKGROUND'S OWN";

// ---------------- icons ----------------
function tileIcon(g, id, x, y) {   // 16x16 at (x, y)
  const R = (c, a, b, w, h) => { g.fillStyle = c; g.fillRect(x + a, y + b, w, h); };
  if (id === T.AIR) { g.strokeStyle = '#ff7a6a'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 3, y + 3); g.lineTo(x + 13, y + 13); g.moveTo(x + 13, y + 3); g.lineTo(x + 3, y + 13); g.stroke(); return; }
  if (id === T.SOLID) { R('#7a5230', 0, 3, 16, 13); R('#5aa33e', 0, 0, 16, 4); R('#8fd160', 0, 0, 16, 1); R('#ffffff', 12, 9, 2, 2); return; }
  if (typeof id === 'string' && id.startsWith('mat:')) { const m = id.slice(4);
    const P = { grass: ['#7a5230', '#5aa33e'], cobble: ['#7d7a74', '#9a968c'], shore: ['#b49a72', '#d8c49a'], reef: ['#3f7a78', '#6fb0a0'], city: ['#4a4a58', '#6a6a7a'], masonry: ['#8b8378', '#b3aca0'], deck: ['#8a5a32', '#a8743f'] }[m] || ['#888', '#aaa'];
    R(P[0], 0, 0, 16, 16); R(P[1], 0, 0, 16, 3);
    if (m === 'cobble' || m === 'masonry' || m === 'city') { for (let k = 5; k < 16; k += 5) R('rgba(0,0,0,0.35)', 0, k, 16, 1); for (let k = 0; k < 3; k++) R('rgba(0,0,0,0.35)', 3 + k * 5 + (k % 2) * 2, 4 + k * 5, 1, 5); }
    if (m === 'deck') for (let k = 3; k < 16; k += 4) R('#5c3a1d', 0, k, 16, 1);
    if (m === 'reef') { R('#e8a0b0', 4, 6, 2, 2); R('#f0d080', 10, 10, 2, 2); }
    return; }
  if (id === T.ONEWAY || id === 'crumble') { R('#8a5a32', 0, 3, 16, 4); R('#a8743f', 0, 3, 16, 1); if (id === 'crumble') { R('#ffb36b', 4, 4, 1, 3); R('#ffb36b', 10, 3, 1, 3); R('#5c3a1d', 6, 9, 2, 2); R('#5c3a1d', 11, 11, 2, 2); } return; }
  if (id === T.SPIKE) { for (let k = 0; k < 4; k++) { g.fillStyle = '#e8e0c8'; g.beginPath(); g.moveTo(x + k * 4, y + 15); g.lineTo(x + k * 4 + 2, y + 6); g.lineTo(x + k * 4 + 4, y + 15); g.fill(); } return; }
  if (id === T.CRATE) { R('#8a5a32', 1, 1, 14, 14); R('#5c3a1d', 1, 7, 14, 1); R('#5c3a1d', 7, 1, 1, 14); return; }
  if (isSlopeId(id)) { const up = id === 20 || id === 22 || id === 23, half = id >= 22; g.fillStyle = '#7a5230'; g.beginPath();
    const lo = 15, hi = half ? 8 : 1; if (up) { g.moveTo(x, y + lo); g.lineTo(x + 15, y + hi); g.lineTo(x + 15, y + 15); } else { g.moveTo(x, y + hi); g.lineTo(x + 15, y + lo); g.lineTo(x, y + 15); }
    g.fill(); g.strokeStyle = '#8fd160'; g.lineWidth = 1.5; g.beginPath(); if (up) { g.moveTo(x, y + lo); g.lineTo(x + 15, y + hi); } else { g.moveTo(x, y + hi); g.lineTo(x + 15, y + lo); } g.stroke(); return; }
  if (id === 'water' || id === 'shallows' || id === 'poison') { const c = id === 'poison' ? '#5c8a24' : '#3f8fd0', top = id === 'shallows' ? 10 : 3;
    R(c, 0, top, 16, 16 - top); R(id === 'poison' ? '#a6e04a' : '#bfe8ff', 0, top, 16, 1); R('rgba(255,255,255,0.35)', 3, top + 3, 4, 1); return; }
  if (id === T.NET) { R('#b8a888', 3, 0, 1, 16); R('#b8a888', 12, 0, 1, 16); for (let k = 1; k < 16; k += 4) R('#b8a888', 3, k, 10, 1); return; }
  if (id === T.BOUNCER) { R('#c9463d', 1, 6, 14, 3); for (let k = 9; k < 15; k += 2) R('#b3aca0', 4, k, 8, 1); return; }
  if (id === T.PORT) { R('#c08a3a', 2, 0, 12, 16); for (let k = 2; k < 16; k += 4) R('#6a4a20', 2, k, 12, 1); R('#6a4a20', 7, 0, 1, 16); return; }
  if (id === T.PLANK || id === T.SHELF || id === T.RAIL) { R(id === T.RAIL ? '#8b8378' : '#a8743f', 0, 5, 16, 3); R('#5c3a1d', 0, 8, 16, 1); return; }
  const col = { [T.CLIMB]: '#6f6a62', [T.SOFT]: '#9a7a58', [T.ICE]: '#bfe8ff', [T.WEB]: '#e8e8f0', [T.CRYST]: '#a87ae0', [T.REED]: '#6faa4a', [T.PALISADE]: '#8a5a32' }[id] || '#888';
  if (id === T.WEB) { g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 16, y + 16); g.moveTo(x + 16, y); g.lineTo(x, y + 16); g.moveTo(x + 8, y); g.lineTo(x + 8, y + 16); g.stroke(); return; }
  if (id === T.REED) { for (let k = 2; k < 16; k += 4) R(col, k, 3, 1, 13); return; }
  if (id === T.PALISADE) { for (let k = 1; k < 16; k += 5) { R(col, k, 3, 4, 13); R('#5c3a1d', k + 1, 1, 2, 2); } return; }
  R(col, 1, 1, 14, 14); R('rgba(255,255,255,0.25)', 1, 1, 14, 2);
}
function thingIcon(g, id, x, y, t, c) {   // 16x16; prefers the game's own sprite
  const sp = c.SPR[id];
  if (sp && (sp.R || sp.width)) { fitSprite(g, c, sp, x, y); return; }
  const R = (col, a, b, w, h) => { g.fillStyle = col; g.fillRect(x + a, y + b, w, h); };
  const metal = id.split(':')[1], mc = { brass: '#e0b040', iron: '#a8b0bc', bone: '#e8dcc0' }[metal];
  if (id === 'coin' || id === 'silver') { g.fillStyle = id === 'coin' ? '#ffd34a' : '#d8e0e8'; g.beginPath(); g.arc(x + 8, y + 8, 5, 0, 7); g.fill(); return; }
  if (id === 'check') { R('#8b8378', 6, 4, 4, 12); R('#ffd36b', 5, 1, 6, 4); return; }
  if (id === 'gate') { R('#8b8378', 1, 2, 3, 14); R('#8b8378', 12, 2, 3, 14); R('#b3aca0', 1, 1, 14, 3); return; }
  if (id === 'lever') { R('#5f5a52', 3, 12, 10, 4); g.strokeStyle = '#a8743f'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + 8, y + 13); g.lineTo(x + 12, y + 3); g.stroke(); R('#c9463d', 11, 1, 3, 3); return; }
  if (id === 'plate') { R('#8b8378', 1, 12, 14, 3); R('#b3aca0', 1, 12, 14, 1); return; }
  if (id.startsWith('key:')) { g.fillStyle = mc; g.beginPath(); g.arc(x + 5, y + 6, 3.5, 0, 7); g.fill(); R(mc, 7, 5, 8, 2); R(mc, 12, 7, 2, 3); return; }
  if (id.startsWith('lockgate:')) { for (let k = 1; k < 16; k += 4) R('#8b8378', k, 0, 2, 16); R(mc, 5, 6, 6, 5); return; }
  if (id === 'pushblock') { R('#8b8378', 1, 1, 14, 14); R('#b3aca0', 1, 1, 14, 2); R('#5f5a52', 1, 13, 14, 2); return; }
  if (id === 'mover' || id === 'mover:up') { R('#a8743f', 1, 7, 14, 4); g.fillStyle = '#ffd36b';
    if (id === 'mover') { g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x + 4, y + 1); g.lineTo(x + 4, y + 5); g.fill(); g.beginPath(); g.moveTo(x + 16, y + 3); g.lineTo(x + 12, y + 1); g.lineTo(x + 12, y + 5); g.fill(); }
    else { g.beginPath(); g.moveTo(x + 8, y); g.lineTo(x + 5, y + 4); g.lineTo(x + 11, y + 4); g.fill(); g.beginPath(); g.moveTo(x + 8, y + 16); g.lineTo(x + 5, y + 12); g.lineTo(x + 11, y + 12); g.fill(); } return; }
  if (id === 'crusher') { R('#3a3a44', 2, 0, 12, 9); R('#5f5a52', 2, 7, 12, 2); R('#ffd36b', 7, 11, 2, 4); return; }
  if (id === 'firevent' || id === 'firepit') { R('#4a3020', 3, 12, 10, 4); g.fillStyle = '#ff8a3a'; g.beginPath(); g.moveTo(x + 4, y + 12); g.lineTo(x + 8, y + 1); g.lineTo(x + 12, y + 12); g.fill(); R('#ffd36b', 7, 6, 2, 5); return; }
  if (id === 'roller' || id === 'puffball') { g.fillStyle = '#c9b27c'; g.beginPath(); g.arc(x + 8, y + 9, 6, 0, 7); g.fill(); return; }
  if (id === 'rockfall') { g.fillStyle = '#8b8378'; for (const [a, b] of [[4, 4], [10, 7], [6, 11]]) { g.beginPath(); g.arc(x + a, y + b, 3, 0, 7); g.fill(); } return; }
  if (id === 'vent') { R('#5f5a52', 3, 12, 10, 4); R('rgba(220,220,230,0.7)', 6, 2, 4, 9); return; }
  if (id === 'torch' || id === 'brazier' || id === 'lantern' || id === 'glow') { R('#5c3a1d', 7, 7, 2, 9); g.fillStyle = '#ffb34a'; g.beginPath(); g.arc(x + 8, y + 5, 3.5, 0, 7); g.fill(); return; }
  if (id === 'sign') { R('#8a5a32', 2, 3, 12, 7); R('#5c3a1d', 7, 10, 2, 6); return; }
  if (id === 'barrel') { R('#8a5a32', 3, 2, 10, 13); R('#5f5a52', 3, 5, 10, 1); R('#5f5a52', 3, 11, 10, 1); return; }
  R('#8a7fa0', 3, 3, 10, 10);
}
function fitSprite(g, c, sp, x, y) {
  let f = sp.R ? sp.R : sp; if (f && !f.width) { f = Array.isArray(f) ? f[0] : Object.values(f)[0]; if (Array.isArray(f)) f = f[0]; }
  if (!f || !f.width) return;
  const k = Math.min(1, 16 / Math.max(f.width, f.height)), w = f.width * k, h = f.height * k;
  g.drawImage(f, Math.round(x + 8 - w / 2), Math.round(y + 16 - h), Math.round(w), Math.round(h));
}
function itemIcon(g, c, cat, i, x, y) {
  if (cat === 0) tileIcon(g, TILES[i][1], x, y);
  else if (cat === 1) { const sp = c.SPR[FOES[i]]; if (sp) fitSprite(g, c, sp, x, y); }
  else if (cat === 2) thingIcon(g, THINGS[i], x, y, c.time, c);
  else { const n = c.tools[i]; g.fillStyle = n === 'LINK' ? '#ffd36b' : '#8fd160'; g.font = '6px monospace'; c.text(n === 'LINK' ? 'LNK' : n === 'EDIT' ? 'SET' : 'GO', x + 8, y + 5, g.fillStyle, 'center', 6); }
}
const itemName = (c, cat, i) => cat === 0 ? TILES[i][0] : cat === 1 ? nameOf(FOES[i]) + (WATER_FOES.includes(FOES[i]) ? ' (put it in water)' : '') : cat === 2 ? thingName(THINGS[i]) : (TOOL_NAMES[c.tools[i]] || c.tools[i]);
function groupIdx(c, gi) { const gr = GROUPS[gi]; return gr.cat === 3 ? c.tools.map((n, i) => [n, i]).filter(([n]) => TOOL_SHOWN.includes(n)).map(([, i]) => i) : gr.idx; }

// ---------------- layout ----------------
const TAB_H = 12, CELL = 30, ROWS = 1, NAME_H = 12, ICON_K = 1.5, TOP = TAB_H + ROWS * CELL + NAME_H + 2, BOT = 16;
export const BARS = { top: TOP, bottom: BOT };
const BUTTONS = ['PLAY', 'PLAY HERE', 'UNDO', 'SAVE', 'LOAD', 'NEW', 'SHARE', 'OPEN', 'SETTINGS', 'MAP', 'HELP'];
const inR = (r, x, y) => r && x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;

// c: { g, text, SPR, drawSet, VW, VH, time, cat, sel (the selected index in that cat), tools, slot, msg, msgT, doc, themes, tracks }
export function drawChrome(c) {
  const { g, text, VW, VH } = c;
  // ---- top: tabs ----
  g.fillStyle = 'rgba(12,10,18,0.9)'; g.fillRect(0, 0, VW, TOP);
  UI.tabs = []; let tx = 4;
  GROUPS.forEach((gr, gi) => { const w = Math.ceil(c.textW(gr.name, 6)) + 10, sel = gi === UI.group, has = gi === groupOf(c);
    g.fillStyle = sel ? '#3f6a3a' : 'rgba(46,38,64,0.9)'; g.fillRect(tx, 1, w, TAB_H - 2);
    if (has && !sel) { g.fillStyle = '#ffd36b'; g.fillRect(tx, TAB_H - 2, w, 1); }
    text(gr.name, tx + w / 2, 3, sel ? '#d8f09a' : '#c8bcd8', 'center', 6); UI.tabs.push({ x: tx, y: 0, w, h: TAB_H, gi }); tx += w + 3; });
  { const bad = c.noGate || c.problems, s0 = c.noGate ? 'NO GOAL GATE YET (ITEMS)' : c.problems ? c.problems + (c.problems > 1 ? ' PIECES' : ' PIECE') + " WON'T WORK (RED)" : c.doc.name, room = VW - 6 - tx;
    if (room > 30) text(c.fitText(s0, room, 6), VW - 4, 3, bad ? '#ff6b6b' : '#ffd36b', 'right', 6); }
  // ---- top: the icon strip ----
  const idx = groupIdx(c, UI.group), cols = Math.floor((VW - 40) / CELL), per = cols * ROWS, pages = Math.max(1, Math.ceil(idx.length / per));
  UI.page[UI.group] = Math.min(UI.page[UI.group], pages - 1); const p = UI.page[UI.group];
  UI.cells = []; UI.arrows = [];
  for (let k = 0; k < per; k++) { const n = p * per + k; if (n >= idx.length) break;
    const i = idx[n], col = k % cols, row = Math.floor(k / cols), x = 20 + col * CELL, y = TAB_H + row * CELL, cat = GROUPS[UI.group].cat;
    const sel = cat === c.cat && i === c.sel, hov = UI.hover && UI.hover.kind === 'cell' && UI.hover.cat === cat && UI.hover.i === i;
    g.fillStyle = sel ? '#3f6a3a' : hov ? 'rgba(90,80,120,0.9)' : 'rgba(30,26,40,0.9)'; g.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
    if (sel) { g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 1.5, y + 1.5, CELL - 3, CELL - 3); }
    g.save(); g.beginPath(); g.rect(x + 2, y + 2, CELL - 4, CELL - 4); g.clip(); g.imageSmoothingEnabled = false; g.translate(x + 3, y + 3); g.scale(ICON_K, ICON_K); try { itemIcon(g, c, cat, i, 0, 0); } catch (e) {} g.restore();
    UI.cells.push({ x, y, w: CELL, h: CELL, cat, i }); }
  if (pages > 1) { for (const [d, ax] of [[-1, 2], [1, VW - 18]]) { const r = { x: ax, y: TAB_H + 4, w: 16, h: ROWS * CELL - 8, d };
      g.fillStyle = 'rgba(60,52,80,0.9)'; g.fillRect(r.x, r.y, r.w, r.h); text(d < 0 ? '<' : '>', r.x + 8, r.y + r.h / 2 - 3, '#ffd36b', 'center', 6); UI.arrows.push(r); }
    text((p + 1) + '/' + pages, VW - 10, TAB_H + ROWS * CELL + 1, '#8a7fa0', 'center', 6); }
  // ---- the line under the strip: what you point at (else what you hold), what it does, its tags; the RECENT row at the right ----
  const h = UI.hover && UI.hover.kind === 'cell' ? UI.hover : null, show = h || { cat: c.cat, i: c.sel };
  const dsc = describe(show.cat, show.cat === 0 ? TILES[show.i][1] : show.cat === 1 ? FOES[show.i] : show.cat === 2 ? THINGS[show.i] : c.tools[show.i]);
  const ly = TAB_H + ROWS * CELL + 2, recentW = 8 * 14 + 50;
  let lx = 6; const head = (h ? '' : 'HOLDING ') + (show.cat === 3 ? itemName(c, 3, show.i) : dsc.name);
  text(head, lx, ly, h ? '#ffffff' : '#d8f09a', 'left', 6); lx += Math.ceil(c.textW(head, 6)) + 8;
  for (const t of dsc.tags) { const w = Math.ceil(c.textW(t, 6)) + 6; g.fillStyle = TAG_COL[t] || '#4a3e64'; g.fillRect(lx, ly - 1, w, 9); text(t, lx + w / 2, ly, '#1b1626', 'center', 6); lx += w + 3; }
  if (dsc.line) text(c.fitText(dsc.line, VW - recentW - lx - 6, 6), lx + 4, ly, '#c8bcd8', 'left', 6);
  UI.recentCells = []; { const R = RECENT; let rx = VW - 4 - R.length * 14; if (R.length) text('RECENT', rx - 4, ly, '#8a7fa0', 'right', 6);
    for (const r of R) { const cell = { x: rx, y: ly - 3, w: 13, h: 13, cat: r.cat, i: r.i }; g.fillStyle = r.cat === c.cat && r.i === c.sel ? '#3f6a3a' : 'rgba(30,26,40,0.9)'; g.fillRect(cell.x, cell.y, 13, 13);
      g.save(); g.beginPath(); g.rect(cell.x, cell.y, 13, 13); g.clip(); g.translate(cell.x + 1, cell.y + 1); g.scale(0.7, 0.7); try { itemIcon(g, c, r.cat, r.i, 0, 0); } catch (e) {} g.restore(); UI.recentCells.push(cell); rx += 14; } }
  if (c.hoverEnt) drawEntCard(c, c.hoverEnt);
  // ---- bottom: the buttons ----
  g.fillStyle = 'rgba(12,10,18,0.9)'; g.fillRect(0, VH - BOT, VW, BOT);
  UI.btns = []; let bx = 4;
  for (const b of BUTTONS) { const w = Math.ceil(c.textW(b, 6)) + 12, r = { x: bx, y: VH - BOT + 2, w, h: BOT - 4, b }, hov = UI.hover && UI.hover.kind === 'btn' && UI.hover.b === b;
    g.fillStyle = b.startsWith('PLAY') ? (hov ? '#5a9a3a' : '#3f7a2c') : hov ? '#4a3e64' : '#2e2640'; g.fillRect(r.x, r.y, r.w, r.h);
    text(b, r.x + w / 2, r.y + 3, b.startsWith('PLAY') ? '#d8f09a' : '#e8dcc0', 'center', 6); UI.btns.push(r); bx += w + 4; }
  { const b = 'SLOT ' + (c.slot + 1), w = Math.ceil(c.textW(b, 6)) + 12, r = { x: bx + 6, y: VH - BOT + 2, w, h: BOT - 4, b: 'SLOT' };
    g.fillStyle = UI.hover && UI.hover.b === 'SLOT' ? '#4a3e64' : '#2e2640'; g.fillRect(r.x, r.y, r.w, r.h); text(b, r.x + w / 2, r.y + 3, '#c8bcd8', 'center', 6); UI.btns.push(r); bx += w + 10; }
  { const room = VW - 4 - bx, s0 = c.msgT > 0 ? c.msg : 'ARROWS SCROLL   CTRL+Z UNDO   ESC IN PLAY COMES BACK'; text(c.fitText(s0, room, 6), VW - 4, VH - BOT + 5, c.msgT > 0 ? '#ffd36b' : '#8a7fa0', 'right', 6); }
  if (UI.guide >= 0) drawGuide(c);
  if (UI.mapOn) drawMinimap(c); else UI.map = null;
  if (UI.panel === 'settings') drawSettings(c); else if (UI.panel === 'help') drawHelp(c); else if (UI.panel === 'piece') drawPiece(c);
}
const groupOf = c => GROUPS.findIndex((gr, gi) => gr.cat === c.cat && groupIdx(c, gi).includes(c.sel));

// ---------------- the panels ----------------
function panelBox(c, w, h, title) {
  const { g, text, VW, VH } = c, x = Math.round((VW - w) / 2), y = Math.round((VH - h) / 2);
  g.fillStyle = 'rgba(6,4,12,0.6)'; g.fillRect(0, 0, VW, VH);
  g.fillStyle = '#1b1626'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  text(title, x + w / 2, y + 6, '#ffd36b', 'center', 8); return { x, y };
}
function settingRows(c) {
  const d = c.doc, th = c.themes[d.theme] ? c.themes[d.theme].name : '?';
  return [
    { key: 'theme', label: 'BACKGROUND', value: th, hint: 'the look of one of the game\'s own places' },
    { key: 'music', label: 'MUSIC', value: prettyTrack(d.music), hint: 'it plays while you choose' },
    { key: 'time', label: 'TIME OF DAY', value: d.time ? TIME_NAMES[d.time] : "THE BACKGROUND'S OWN" },
    { key: 'weather', label: 'WEATHER', value: d.weather ? d.weather.toUpperCase() : "THE BACKGROUND'S OWN" },
    { key: 'hero', label: 'TEST AS', value: d.hero ? ((c.heroes.find(h => h.id === d.hero) || {}).name || d.hero.toUpperCase()) : 'YOUR OWN HERO' },
    { key: 'width', label: 'WIDTH', value: d.W + ' TILES' },
    { key: 'name', label: 'NAME', value: d.name, click: true },
  ];
}
function drawSettings(c) {
  const { g, text } = c, w = 380, h = 178, { x, y } = panelBox(c, w, h, 'LEVEL SETTINGS');
  text('< > TO CHANGE.  THE MUSIC PLAYS WHILE YOU CHOOSE.', x + w / 2, y + 17, '#8a7fa0', 'center', 6);
  UI.rows = [];
  settingRows(c).forEach((r, k) => { const ry = y + 30 + k * 18;
    text(r.label, x + 12, ry + 3, '#c8bcd8', 'left', 6);
    const L = { x: x + 100, y: ry, w: 14, h: 12, key: r.key, d: -1 }, Rr = { x: x + w - 26, y: ry, w: 14, h: 12, key: r.key, d: 1 }, V = { x: x + 116, y: ry, w: w - 144, h: 12, key: r.key, d: 0 };
    g.fillStyle = '#2e2640'; g.fillRect(V.x, V.y, V.w, V.h); text(c.fitText(String(r.value), V.w - 6, 6), V.x + V.w / 2, ry + 3, '#ffffff', 'center', 6);
    if (!r.click) for (const a of [L, Rr]) { g.fillStyle = '#4a3e64'; g.fillRect(a.x, a.y, a.w, a.h); text(a.d < 0 ? '<' : '>', a.x + 7, a.y + 3, '#ffd36b', 'center', 6); UI.rows.push(a); }
    else UI.rows.push(V);
  });
  const done = { x: x + w / 2 - 30, y: y + h - 18, w: 60, h: 13, key: 'done' }; g.fillStyle = '#3f7a2c'; g.fillRect(done.x, done.y, done.w, done.h); text('DONE', done.x + 30, done.y + 3, '#d8f09a', 'center', 6); UI.rows.push(done);
}
const HELP = [
  ['PICK A PIECE', 'click a group tab along the top, then a piece in the strip (< > for more)'],
  ['PAINT', 'left-click or drag in the level.  ERASE: right-click or drag'],
  ['MOVE A PIECE', 'drag it.  SHIFT+CLICK it to set it up (how far, which way, what it says)'],
  ['WATER / HILLS', 'WATER: drag a box.  HILL: paint the top of the ground, the ramps make themselves'],
  ['DOORS', 'paint DOOR tiles; a LEVER or PLATE opens the nearest (TOOLS > LINK picks one)'],
  ['START / GOAL', 'TOOLS > START sets where the knight begins; every level needs a GOAL GATE (ITEMS)'],
  ['PLAY', 'PLAY (or P) plays it; PLAY HERE starts where you are looking; ESC comes back'],
  ['SETTINGS', 'background, music, time of day, weather, the hero you test as, name and width'],
  ['SAVE / SHARE', 'three slots (SLOT picks one).  SHARE copies a link to the level; OPEN takes one'],
  ['MOVE AROUND', 'mouse wheel (SHIFT: up/down), drag with the middle button, arrow keys, or the MAP'],
];
function drawHelp(c) {
  const { g, text } = c, w = 560, h = 214, { x, y } = panelBox(c, w, h, 'HOW TO BUILD A LEVEL');
  HELP.forEach(([a, b], k) => { text(a, x + 12, y + 24 + k * 12, '#8fd160', 'left', 6); text(c.fitText(b, w - 116, 6), x + 104, y + 24 + k * 12, '#e8dcc0', 'left', 6); });
  UI.rows = []; const by = y + h - 34, btn = (bx, w2, label, key, col) => { const r = { x: bx, y: by, w: w2, h: 13, key }; g.fillStyle = col; g.fillRect(r.x, r.y, r.w, r.h); text(label, r.x + w2 / 2, r.y + 3, '#ffffff', 'center', 6); UI.rows.push(r); };
  btn(x + 12, 120, 'START THE GUIDE', 'guide', '#3f6a8a');
  text('OPEN AN EXAMPLE:', x + 146, by + 3, '#c8bcd8', 'left', 6);
  EXAMPLES.forEach((ex, k) => btn(x + 240 + k * 100, 92, ex.name, 'example:' + k, '#5a4a7a'));
  const d = { x: x + w / 2 - 30, y: y + h - 17, w: 60, h: 13, key: 'done' }; g.fillStyle = '#3f7a2c'; g.fillRect(d.x, d.y, d.w, d.h); text('GOT IT', d.x + 30, d.y + 3, '#d8f09a', 'center', 6); UI.rows.push(d);
}

// ---------------- the mouse ----------------
// returns null when the click is for the level, else { consumed } plus at most one of:
//   pick: { cat, i } | act: 'play'|'undo'|'save'|'load'|'new'|'slot'|'name'|'width+'|'width-'|'theme+'|'theme-'|'music'|'closeSettings'
export function uiMouse(c, mx, my, down) {
  UI.hover = null;
  if (UI.panel) {
    if (!down) return { consumed: true };
    const r = UI.rows.find(q => inR(q, mx, my)); if (!r) return { consumed: true };
    if (r.key === 'done') { const was = UI.panel; UI.panel = null; UI.piece = null; return { consumed: true, act: was === 'settings' ? 'closeSettings' : was === 'piece' ? 'pieceDone' : null }; }
    if (r.key === 'remove') { const e = UI.piece; UI.panel = null; UI.piece = null; return { consumed: true, act: 'pieceRemove', piece: e }; }
    if (r.key === 'p') return { consumed: true, act: r.text ? 'pieceText' : 'pieceStep', piece: UI.piece, row: pieceRows(UI.piece)[r.i], d: r.d };
    if (r.key === 'name') return { consumed: true, act: 'name' };
    if (r.key === 'guide') { UI.panel = null; UI.guide = 0; return { consumed: true, act: 'guide' }; }
    if (String(r.key).startsWith('example:')) { UI.panel = null; UI.guide = -1; return { consumed: true, act: 'example', n: +r.key.split(':')[1] }; }
    if (r.key === 'width') return { consumed: true, act: r.d > 0 ? 'width+' : 'width-' };
    if (r.key === 'theme') return { consumed: true, act: r.d > 0 ? 'theme+' : 'theme-' };
    const d = c.doc;
    if (r.key === 'time') { d.time = TIMES[(TIMES.indexOf(d.time ?? null) + r.d + TIMES.length) % TIMES.length]; return { consumed: true, act: 'remount' }; }
    if (r.key === 'weather') { d.weather = WEATHERS[(WEATHERS.indexOf(d.weather ?? null) + r.d + WEATHERS.length) % WEATHERS.length]; return { consumed: true, act: 'remount' }; }
    if (r.key === 'hero') { const L = [null, ...c.heroes.map(h => h.id)]; d.hero = L[(L.indexOf(d.hero ?? null) + r.d + L.length) % L.length]; return { consumed: true }; }
    if (r.key === 'music') { const L = [null, ...MUSIC_NAMES]; d.music = L[(L.indexOf(d.music ?? null) + r.d + L.length) % L.length]; return { consumed: true, act: 'music' }; }
    return { consumed: true };
  }
  const { VW, VH } = c;
  if (UI.guide >= 0 && UI.guideSkip && inR(UI.guideSkip, mx, my)) { if (down) UI.guide = -1; return { consumed: true }; }
  if (UI.map && (UI.mapDrag || inR(UI.map, mx, my))) {   /* THE MINIMAP: click or drag to look there */
    if (down) UI.mapDrag = true; if (!UI.mapDrag) return { consumed: true };
    const m = UI.map, fx = Math.max(0, Math.min(1, (mx - m.x) / m.w)), fy = Math.max(0, Math.min(1, (my - m.y) / m.h));
    return { consumed: true, cam: { x: fx * c.LWp - VW / 2, y: fy * c.LHp - (VH - TOP - BOT) / 2 - TOP } };
  }
  if (my >= TOP && my < VH - BOT) return null;   // the level
  const tab = UI.tabs.find(q => inR(q, mx, my)), cell = UI.cells.find(q => inR(q, mx, my)) || (UI.recentCells || []).find(q => inR(q, mx, my)), arr = UI.arrows.find(q => inR(q, mx, my)), btn = UI.btns.find(q => inR(q, mx, my));
  if (cell) UI.hover = { kind: 'cell', cat: cell.cat, i: cell.i }; else if (btn) UI.hover = { kind: 'btn', b: btn.b };
  if (!down) return { consumed: true };
  if (tab) { UI.group = tab.gi; return { consumed: true, act: 'ui' }; }
  if (arr) { const idx = groupIdx(c, UI.group), per = Math.floor((VW - 40) / CELL) * ROWS, pages = Math.max(1, Math.ceil(idx.length / per)); UI.page[UI.group] = (UI.page[UI.group] + arr.d + pages) % pages; return { consumed: true, act: 'ui' }; }
  if (cell) return { consumed: true, pick: { cat: cell.cat, i: cell.i } };
  if (btn && btn.b === 'MAP') { UI.mapOn = !UI.mapOn; return { consumed: true, act: 'ui' }; }
  if (btn) { if (btn.b === 'SETTINGS') { UI.panel = 'settings'; return { consumed: true, act: 'openSettings' }; } if (btn.b === 'HELP') { UI.panel = 'help'; return { consumed: true }; }
    return { consumed: true, act: btn.b.toLowerCase() }; }
  return { consumed: true };
}
export function closePanel() { const was = UI.panel; UI.panel = null; UI.piece = null; return was; }
export function openPiece(e) { UI.panel = 'piece'; UI.piece = e; }
export const pieceOpen = () => UI.panel === 'piece' ? UI.piece : null;
function drawPiece(c) {
  const e = UI.piece, rows = pieceRows(e), { g, text } = c, w = 340, h = 52 + Math.max(1, rows.length) * 18, { x, y } = panelBox(c, w, h, pieceName(e));
  UI.rows = [];
  if (!rows.length) text('NOTHING TO SET ON THIS ONE', x + w / 2, y + 26, '#8a7fa0', 'center', 6);
  rows.forEach((r, k) => { const ry = y + 22 + k * 18;
    text(r.label, x + 12, ry + 3, '#c8bcd8', 'left', 6);
    const V = { x: x + 116, y: ry, w: w - 144, h: 12, key: 'p', i: k, d: 0, text: !!r.text };
    const val = r.text ? (e.text || '(click to write)') : r.show(rowValue(e, r));
    g.fillStyle = '#2e2640'; g.fillRect(V.x, V.y, V.w, V.h); text(c.fitText(String(val), V.w - 6, 6), V.x + V.w / 2, ry + 3, '#ffffff', 'center', 6);
    if (r.text) UI.rows.push(V);
    else for (const [d, ax] of [[-1, x + 100], [1, x + w - 26]]) { const a = { x: ax, y: ry, w: 14, h: 12, key: 'p', i: k, d }; g.fillStyle = '#4a3e64'; g.fillRect(a.x, a.y, a.w, a.h); text(d < 0 ? '<' : '>', a.x + 7, a.y + 3, '#ffd36b', 'center', 6); UI.rows.push(a); } });
  const by = y + h - 18, del = { x: x + 12, y: by, w: 60, h: 13, key: 'remove' }, done = { x: x + w - 72, y: by, w: 60, h: 13, key: 'done' };
  g.fillStyle = '#6a2a2a'; g.fillRect(del.x, del.y, del.w, del.h); text('REMOVE', del.x + 30, del.y + 3, '#ffd0d0', 'center', 6);
  g.fillStyle = '#3f7a2c'; g.fillRect(done.x, done.y, done.w, done.h); text('DONE', done.x + 30, done.y + 3, '#d8f09a', 'center', 6);
  UI.rows.push(del, done);
}

// ---------------- the minimap: the whole level, small, bottom right ----------------
let MM = null, MMt = -1, MMdoc = null;
const MMCOL = { 1: '#7a5230', 2: '#a8743f', 3: '#e8e0c8', 4: '#8a5a32', 8: '#a8743f', 9: '#b8a888', 10: '#c9463d', 11: '#a8743f', 12: '#e0b040', 13: '#6f6a62', 14: '#8b8378', 15: '#9a7a58', 16: '#bfe8ff', 17: '#e8e8f0', 18: '#a87ae0', 5: '#6faa4a', 7: '#8a5a32' };
const MATCOL = { grass: '#5aa33e', cobble: '#9a968c', shore: '#d8c49a', reef: '#6fb0a0', city: '#6a6a7a', masonry: '#b3aca0', deck: '#a8743f' };
function bakeMinimap(d) {
  const c = document.createElement('canvas'); c.width = d.W; c.height = d.H; const g = c.getContext('2d');
  g.fillStyle = '#1e2a3a'; g.fillRect(0, 0, d.W, d.H);
  for (const r of d.water || []) { g.fillStyle = r.kind === 'poison' ? '#5c8a24' : '#3f8fd0'; g.fillRect(r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1); }
  for (let y = 0; y < d.H; y++) for (let x = 0; x < d.W; x++) { const v = d.grid[y * d.W + x]; if (!v) continue;
    const m = d.mat && d.mat[x + ',' + y]; g.fillStyle = m ? MATCOL[m] : v >= 20 && v <= 25 ? '#7a5230' : MMCOL[v] || '#888'; g.fillRect(x, y, 1, 1); }
  for (const e of d.ents) { g.fillStyle = e.t === 'gate' ? '#ffd36b' : e.t === 'coin' || e.t === 'silver' ? '#ffe680' : FOES.includes(e.t) ? '#ff5a5a' : '#e8dcc0'; g.fillRect(e.x, e.y, 1, 1); }
  g.fillStyle = '#8fd160'; g.fillRect(d.start.x, d.start.y, 1, 1);
  return c;
}
function drawMinimap(c) {
  const { g, VW, VH, doc } = c;
  if (!MM || MMdoc !== doc || c.time - MMt > 0.25 || c.time < MMt) { MM = bakeMinimap(doc); MMt = c.time; MMdoc = doc; }
  const k = Math.min(2, 220 / doc.W, 60 / doc.H), w = Math.round(doc.W * k), h = Math.round(doc.H * k), x = VW - w - 6, y = VH - BOT - h - 6;
  g.fillStyle = 'rgba(12,10,18,0.85)'; g.fillRect(x - 3, y - 11, w + 6, h + 14);
  c.text('MAP - CLICK TO GO THERE', x, y - 9, '#8a7fa0', 'left', 6);
  g.imageSmoothingEnabled = false; g.drawImage(MM, x, y, w, h);
  const vx = x + (c.cam.x / 16) * k, vy = y + ((c.cam.y + TOP) / 16) * k, vw = (VW / 16) * k, vh = ((VH - TOP - BOT) / 16) * k;
  g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.strokeRect(Math.round(vx) + 0.5, Math.round(vy) + 0.5, Math.round(vw), Math.round(vh));
  UI.map = { x, y, w, h };
}

// ---------------- the card for a placed piece under the mouse ----------------
function drawEntCard(c, e) {
  const { g, text, VW, VH } = c, d = describeEnt(e), w = 250, lines = [d.line], h = 30;
  const x = Math.max(4, Math.min(VW - w - 4, c.mouse.x + 12)), y = Math.max(TOP + 4, Math.min(VH - BOT - h - 4, c.mouse.y - h - 8));
  g.fillStyle = 'rgba(12,10,18,0.92)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  let lx = x + 6; text(d.name, lx, y + 4, '#ffd36b', 'left', 6); lx += Math.ceil(c.textW(d.name, 6)) + 6;
  for (const t of d.tags) { const tw = Math.ceil(c.textW(t, 6)) + 6; g.fillStyle = TAG_COL[t] || '#4a3e64'; g.fillRect(lx, y + 3, tw, 9); text(t, lx + tw / 2, y + 4, '#1b1626', 'center', 6); lx += tw + 3; }
  text(c.fitText(lines[0] || '', w - 12, 6), x + 6, y + 17, '#e8dcc0', 'left', 6);
}

// ---------------- the guide: five steps, each ticked off by what you have actually done ----------------
export const guideStep = () => UI.guide;
function drawGuide(c) {
  const st = GUIDE[UI.guide]; if (!st) { UI.guide = -1; return; }
  if (!st.last && st.done(c.doc, c)) { UI.guide++; UI.guideT = 1; return; }
  const { g, text, VW } = c, w = Math.min(VW - 40, Math.ceil(c.textW(st.say, 6)) + 140), x = Math.round((VW - w) / 2), y = TOP + 6, flash = UI.guideT > 0 ? (UI.guideT -= 1 / 60) : 0;
  g.fillStyle = flash > 0 ? 'rgba(80,140,60,0.95)' : 'rgba(20,40,60,0.94)'; g.fillRect(x, y, w, 16); g.strokeStyle = '#8fd1ff'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, w - 1, 15);
  const lab = st.last ? 'DONE' : 'STEP ' + (UI.guide + 1) + ' OF ' + (GUIDE.length - 1), lw = Math.ceil(c.textW(lab, 6)) + 12;
  text(lab, x + 6, y + 5, '#ffd36b', 'left', 6);
  text(c.fitText(st.say, w - lw - 46, 6), x + 6 + lw, y + 5, '#ffffff', 'left', 6);
  const sk = { x: x + w - 34, y: y + 2, w: 30, h: 12 }; g.fillStyle = '#4a3e64'; g.fillRect(sk.x, sk.y, sk.w, sk.h); text(st.last ? 'OK' : 'SKIP', sk.x + 15, sk.y + 3, '#e8dcc0', 'center', 6); UI.guideSkip = sk;
}
