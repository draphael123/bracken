// THE MAKER'S PALETTE (claude/maker, Daniel 2026-11-09: the level maker comes back as its own mode, with the real
// combat, slopes, the full cast and mechanisms). What you can place, what it is called, and the paged palette screen.
// main.js keeps only thin hooks (ED_TILES / ED_FOES / ED_THINGS come from here; drawEdPalette / edPalClick call here),
// so this lane rarely touches main.js and merges cleanly past the other lanes.
//
// WHAT IS IN THE PALETTE IS MEASURED, NOT HOPED: tools/maker-sweep.mjs places every candidate alone in a plain
// made-by-hand wood, plays it, and lists what breaks. A kind goes in FOES only when it passes there. Kinds that need a
// level's own machinery (water to swim in, an arena, a ship) stay out until the maker can build that machinery.

import { T } from './level.js';
import { SLOPE } from './slopes.js';
import { newRing, horseAt, RING } from './wicker-carousel.js';   /* (claude/maker) the Wicker Queen's horses */

export const TILES = [
  ['ERASE', T.AIR], ['GROUND', T.SOLID],
  // GROUND MATERIALS (Daniel 2026-11-09: "why do we only have one tile texture"): solid ground drawn in another place's
  // own skin, so one level can mix them. doc.mat marks the cell; resolveTiles reads L.mat (made-by-hand woods only).
  ['GRASS GROUND', 'mat:grass'], ['COBBLE', 'mat:cobble'], ['SHORE ROCK', 'mat:shore'], ['REEF ROCK', 'mat:reef'],
  ['CITY STONE', 'mat:city'], ['CASTLE STONE', 'mat:masonry'], ['SHIP DECK', 'mat:deck'],
  ['JUMP-THROUGH LEDGE', T.ONEWAY], ['SPIKES', T.SPIKE], ['CRATE', T.CRATE],
  ['SLOPE UP', SLOPE.R1], ['SLOPE DOWN', SLOPE.L1],
  ['GENTLE UP 1', SLOPE.R2A], ['GENTLE UP 2', SLOPE.R2B], ['GENTLE DOWN 1', SLOPE.L2B], ['GENTLE DOWN 2', SLOPE.L2A],
  ['PLANK', T.PLANK], ['ROPE LADDER', T.NET], ['SPRING', T.BOUNCER], ['SHELF', T.SHELF], ['DOOR', T.PORT],
  ['ROCK FACE', T.CLIMB], ['RAIL', T.RAIL], ['BREAKABLE ROCK', T.SOFT], ['ICE', T.ICE], ['WEB', T.WEB], ['CRYSTAL LEDGE', T.CRYST],
  ['REEDS', T.REED], ['WOODEN WALL', T.PALISADE],
  // TERRAIN BRUSHES (string ids: not tiles, see tilePaint / the rectangle brushes below)
  ['RED BLOCK (solid until switched)', 'sw:red'], ['BLUE BLOCK (solid once switched)', 'sw:blue'],
  ['HILL (ramps itself)', 'hill'], ['CRUMBLE LEDGE', 'crumble'], ['WATER (drag)', 'water'], ['SHALLOWS (drag)', 'shallows'], ['POISON (drag)', 'poison'],
  ['SLOPE (drag to shape)', 'ramp'],   /* (claude/maker) one piece for all six slope tiles: the drag sets the way and the steepness */
];

// Every foe kind the game's spawner knows (src/main.js spawnEnt, the cases that push an enemy and are not a boss) that
// spawns, survives and FIGHTS alone in a plain made-by-hand wood. tools/maker-sweep.mjs re-tests every one of them.
// LEFT OUT, and why (2026-11-09 sweep, re-run with tools/maker-sweep.mjs):
//  - WATER kinds live in WATER_FOES (they spawn only inside a pool); still out: gar (does not spawn), grindylow (never wakes), gill (barely stirs
//    and never attacks, in water or out; it has no bestiary entry either)
//  - need their level's machinery: imp turret (a workshop's shot list), gravewarden (his grave arena), marionette (the theatre)
//  - are another kind's skin (spawn as that kind): squirrel (thief), bonearcher (archer)
//  - MINIS asleep until their arena wakes them (the BOSSES group's job): homunculus ploughman lampreeve gangleader deacon
//    barrowrider magechase sexton hedgewarden greathound familiar courtier attendant scalder seawitch stormshaman
//  - wait on a trigger a plain wood does not have: lookout siren grindylow tippler horn holdfast crossbow corpse clinger
//    sweep spitcap dummy, weaver (hangs from a ceiling: on open ground it never comes down)
//  - spider (even with the old editor's drop: 100 it hangs and never comes for you), siren (sings, never strikes, in water or out)
//  - bonegob (seeded sweep: never comes, never throws its skull in a plain wood - likely waits to be raised)
export const FOES = [
  'sprig', 'shield', 'spit', 'wasp', 'thorn', 'archer', 'hopper', 'sapper', 'brute', 'cutlass', 'boarder',
  'marine', 'bosun', 'topiary', 'armour', 'piece', 'broom', 'mimic', 'tome', 'scarecrow', 'rook', 'farmhand',
  'pumpkin', 'marshlight', 'haunt', 'boo', 'feeler', 'grapnel', 'powdermonkey', 'watch', 'sailor', 'netter',
  'merrowspear', 'merrowcaller', 'merrowbrute', 'whelp', 'oathblade', 'drownedknight', 'manta', 'petrel',
  'turtle', 'heronfoe', 'crab', 'scout', 'tideguard', 'soldier', 'javelin', 'heavy', 'hound', 'wickling',
  'scorpion', 'sandgob', 'cutthroat', 'slinger', 'stagehand', 'mummer', 'honeyhornet', 'swarm',
  'stiltwalker', 'construct', 'hawkscout', 'orderpaladin', 'deadpriest', 'fogwraith', 'skitter', 'waterthief',
  'raptor', 'kiterider', 'trophyhunter', 'willowisp', 'hobbyhorse', 'wickerman', 'stringjack', 'hornsman',
  'barker', 'ambusher', 'vulture', 'folk', 'thief', 'pike', 'miner', 'sheargob', 'gaffer', 'grub', 'rockgoblin',
  'kite', 'crow', 'bale', 'badger', 'hare', 'wight', 'prise', 'swornsword', 'hedgeknight', 'runner', 'acolyte',
  'lancer', 'drunk', 'bannerbearer', 'zombie', 'husk', 'apprentice', 'lanternshade', 'bellguard', 'propman',
  'shardling', 'fledgling', 'gobpriest', 'gobmage', 'sentry', 'bellman', 'assassin', 'berserker',
  'drummer', 'butcher', 'hearthgob', 'temperer', 'burngob', 'emberwisp', 'cutter', 'snuffer',
  'sailer', 'harpy', 'galeharpy', 'shrieker', 'goat', 'royalboar', 'sporeling', 'lurker', 'drone',
  'shaman'
];
// THE WATER CAST: placed in a pool (WATER brush), they swim; outside one they do not spawn. Swept inside a pool.
export const WATER_FOES = ['urchin', 'angler', 'puffer', 'jelly', 'lamprey', 'eel', 'leech'];
FOES.push(...WATER_FOES);

export const THINGS = ['coin', 'silver', 'check', 'gate', 'mover', 'mover:up', 'arrow', 'warp',
  // MECHANISMS (claude/maker step 3): a lever or a plate opens a column of DOOR tiles (the nearest, or the one LINK points at);
  // a key opens the gate of its own metal; the rest are traps and weights
  'mend', 'switch', 'lever', 'plate', 'key:brass', 'lockgate:brass', 'key:iron', 'lockgate:iron', 'key:bone', 'lockgate:bone',
  'pushblock', 'crusher', 'firevent', 'roller', 'rockfall', 'vent', 'firepit',
  'sign', 'torch', 'brazier', 'barrel', 'glow', 'puffball', 'lantern', 'npc'];
// a THING's palette id -> the entity it places (most are themselves; the two moving platforms are one engine kind)
const ENT_FOR = {
  mover: { t: 'mover', len: 2, range: 4, speed: 34 },                       // side to side, four tiles each way
  'mover:up': { t: 'mover', len: 2, vert: true, rise: 4, period: 3.2 },     // a lift: up four tiles and back
  'key:brass': { t: 'key', kind: 'brass' }, 'key:iron': { t: 'key', kind: 'iron' }, 'key:bone': { t: 'key', kind: 'bone' },
  'lockgate:brass': { t: 'lockgate', needs: 'brass', h: 4 }, 'lockgate:iron': { t: 'lockgate', needs: 'iron', h: 4 }, 'lockgate:bone': { t: 'lockgate', needs: 'bone', h: 4 },
  switch: { t: 'lever', mkSwitch: true },   // a lever that flips RED and BLUE blocks every time it is hit
  crusher: { t: 'crusher', every: 3 }, firevent: { t: 'firevent', every: 2.8 }, roller: { t: 'roller', face: -1, speed: 55 },
};
export const entFor = (id, x, y) => ({ ...(ENT_FOR[id] || { t: id }), x, y });
const THING_NAMES = { warp: 'WARP DOOR', arrow: 'ARROW SIGN', mend: 'HEART', switch: 'SWITCH', mover: 'MOVING PLATFORM', 'mover:up': 'LIFT', check: 'CHECKPOINT', gate: 'GOAL GATE', plate: 'PRESSURE PLATE',
  'key:brass': 'BRASS KEY', 'key:iron': 'IRON KEY', 'key:bone': 'BONE KEY', 'lockgate:brass': 'BRASS GATE', 'lockgate:iron': 'IRON GATE',
  'lockgate:bone': 'BONE GATE', pushblock: 'PUSH BLOCK', firevent: 'FIRE JET', roller: 'ROLLING PUFFBALL' };
export const thingName = id => THING_NAMES[id] || String(id).toUpperCase();
/* (claude/maker) ONE PIECE PER IDEA: the palette shows one KEY, one LOCKED GATE and one MOVING PLATFORM; the metal and the way it
   moves are settings (SHIFT+CLICK). The other variants stay valid ids (old levels, the checks) but are on no tab. */
export const HIDDEN_THINGS = ['mover:up', 'key:iron', 'key:bone', 'lockgate:iron', 'lockgate:bone'];
const SHOWN_NAME = { 'key:brass': 'KEY', 'lockgate:brass': 'LOCKED GATE', mover: 'MOVING PLATFORM' };
export const paletteName = id => SHOWN_NAME[id] || thingName(id);
/* what a piece can be set to, by name, for the palette's line and the hover card */
export const settingLabels = id => pieceRows(entFor(id, 0, 0)).map(r => r.label);

// names: the bestiary's, where it has one (main.js BEASTS), else the id in capitals
let NAMES = {}, DESCS = {};
export function setNames(beasts) { NAMES = {}; DESCS = {};
  for (const b of beasts || []) if (b && b.t && b.name) { NAMES[b.t] = b.name.replace(/^THE /, ''); if (b.desc) DESCS[b.t] = b.desc; } }
export const nameOf = t => NAMES[t] || String(t).toUpperCase();

// ---------------- the palette screen, paged ----------------
const BW = 96, BH = 11, X0 = 8, Y0 = 26, ROWS = 12;
const page = {};   // category -> page shown
const perPage = VW => Math.max(1, Math.floor((VW - X0 * 2 + 4) / (BW + 4))) * ROWS;
export function pageOf(cat) { return page[cat] || 0; }
export function showSelected(cat, sel, VW) { page[cat] = Math.floor(sel / perPage(VW)); }

// ctx: { g, text, drawSet, SPR, UI, TYPE, VW, VH, cats, cat, items, ids, sel }
export function drawPalette(c) {
  const { g, text, VW, VH, UI } = c;
  g.fillStyle = 'rgba(10,8,16,0.94)'; g.fillRect(0, 0, VW, VH);
  text('THE PALETTE', VW / 2, 3, UI.title, 'center', c.TYPE.head);
  c.cats.forEach((name, i) => { const tx = X0 + i * 54, sel = i === c.cat;
    g.fillStyle = sel ? 'rgba(60,90,60,0.9)' : 'rgba(40,36,50,0.8)'; g.fillRect(tx, 12, 52, 11);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(tx + 0.5, 12.5, 51, 10); }
    text(name, tx + 26, 15, sel ? UI.sel : UI.dim, 'center', 6); });
  const per = perPage(VW), pages = Math.max(1, Math.ceil(c.items.length / per));
  const p = Math.min(pageOf(c.cat), pages - 1); page[c.cat] = p;
  for (let k = 0; k < per; k++) {
    const i = p * per + k; if (i >= c.items.length) break;
    const col = Math.floor(k / ROWS), row = k % ROWS, bx = X0 + col * (BW + 4), by = Y0 + row * BH, sel = i === c.sel;
    g.fillStyle = sel ? 'rgba(60,90,60,0.7)' : 'rgba(30,26,40,0.7)'; g.fillRect(bx, by, BW, BH - 1);
    if (sel) { g.strokeStyle = UI.sel; g.strokeRect(bx + 0.5, by + 0.5, BW - 1, BH - 2); }
    const sp = c.ids && c.ids[i] ? c.SPR[c.ids[i]] : null;
    if (sp && (sp.R || sp.width)) { g.globalAlpha = 0.9; try { c.drawSet(sp, null, 0, bx + 9, by + BH - 2, 1, false, 0.55, 0.55); } catch (e) {} g.globalAlpha = 1; }
    text(String(c.items[i]).slice(0, 15), bx + 18, by + 2, sel ? UI.title : UI.text, 'left', 6);
  }
  const by = Y0 + ROWS * BH + 4;
  if (pages > 1) {
    text('<  PAGE ' + (p + 1) + ' / ' + pages + '  >', VW / 2, by, UI.sel, 'center', 6);
    text('CLICK one   < > or PGUP/PGDN pages   ESC close', VW / 2, VH - 10, UI.dim, 'center', 6);
  } else text('CLICK one   ESC close', VW / 2, VH - 10, UI.dim, 'center', 6);
}
// returns { cat } to switch group, { pick: i } to choose, { close: true }, or null
export function paletteClick(c, mx, my) {
  for (let i = 0; i < c.cats.length; i++) { const tx = X0 + i * 54; if (mx >= tx && mx < tx + 52 && my >= 12 && my < 23) return { cat: i }; }
  const per = perPage(c.VW), pages = Math.max(1, Math.ceil(c.items.length / per)), p = pageOf(c.cat);
  const by = Y0 + ROWS * BH + 4;
  if (pages > 1 && my >= by - 2 && my < by + 9) { turnPage(c.cat, mx < c.VW / 2 ? -1 : 1, c.items.length, c.VW); return { page: true }; }
  for (let k = 0; k < per; k++) { const i = p * per + k; if (i >= c.items.length) break;
    const col = Math.floor(k / ROWS), row = k % ROWS, bx = X0 + col * (BW + 4), bY = Y0 + row * BH;
    if (mx >= bx && mx < bx + BW && my >= bY && my < bY + BH) return { pick: i }; }
  if (my > by + 10) return { close: true };
  return null;
}
export function turnPage(cat, d, n, VW) { const pages = Math.max(1, Math.ceil(n / perPage(VW))); page[cat] = ((pageOf(cat) + d) % pages + pages) % pages; }

// ================= TERRAIN: crumbling ledges and water =================
// They are not tiles in the engine, so the document carries them beside the grid and edLevelObj turns them into what the
// game reads: doc.crumble = ['x,y', ...] (the cells of crumbling ledge), doc.water = [{ kind, x0, x1, y0, y1 }] in tiles.
const TS = 16;
const isStr = v => typeof v === 'string';
export const isRectBrush = entry => !!entry && (entry[1] === 'water' || entry[1] === 'shallows' || entry[1] === 'poison');
// (the level's SETTINGS - music, time of day, weather - ride along with the terrain: saved, loaded and undone with it)
export const terrainOf = doc => ({ crumble: [...(doc.crumble || [])], water: (doc.water || []).map(w => ({ ...w })), mat: { ...(doc.mat || {}) }, sw: { ...(doc.sw || {}) }, loot: { ...(doc.loot || {}) }, music: doc.music || null, time: doc.time || null, weather: doc.weather || null, hero: doc.hero || null, style: doc.style || null, goal: doc.goal || null, players: doc.players || null, cleared: doc.cleared || null });
export function setTerrain(doc, t) { doc.crumble = t && t.crumble ? [...t.crumble] : []; doc.water = t && t.water ? t.water.map(w => ({ ...w })) : [];
  doc.mat = t && t.mat ? { ...t.mat } : {}; doc.sw = t && t.sw ? { ...t.sw } : {}; doc.loot = t && t.loot ? { ...t.loot } : {}; doc.hero = (t && t.hero) || null; doc.music = (t && t.music) || null; doc.time = (t && t.time) || null; doc.weather = (t && t.weather) || null;
  doc.style = (t && t.style) || null; doc.goal = (t && t.goal) || null; doc.players = (t && t.players) || null; doc.cleared = (t && t.cleared) || null; }

// paint one cell with a TILES entry: returns the tile id to put in the grid
export function tilePaint(doc, tx, ty, entry) {
  const key = tx + ',' + ty, cr = doc.crumble || (doc.crumble = []), mat = doc.mat || (doc.mat = {});
  const i = cr.indexOf(key); if (i >= 0) cr.splice(i, 1);
  delete mat[key];
  const sw = doc.sw || (doc.sw = {}); delete sw[key]; if (doc.loot) delete doc.loot[key];
  if (isStr(entry[1]) && entry[1].startsWith('sw:')) { sw[key] = entry[1].slice(3); return entry[1] === 'sw:red' ? T.CRYST : T.AIR; }
  if (isStr(entry[1]) && entry[1].startsWith('mat:')) { mat[key] = entry[1].slice(4); return T.SOLID; }
  if (entry[1] === 'crumble') { cr.push(key); return T.ONEWAY; }
  return isStr(entry[1]) ? T.AIR : entry[1];
}
// right-click: a crumble mark goes with its tile; a click inside water takes the whole pool away. True if water went.
export function terrainErase(doc, tx, ty) {
  const cr = doc.crumble || [], i = cr.indexOf(tx + ',' + ty); if (i >= 0) cr.splice(i, 1);
  if (doc.mat) delete doc.mat[tx + ',' + ty]; if (doc.sw) delete doc.sw[tx + ',' + ty]; if (doc.loot) delete doc.loot[tx + ',' + ty];
  const w = doc.water || [], j = w.findIndex(r => tx >= r.x0 && tx <= r.x1 && ty >= r.y0 && ty <= r.y1);
  if (j >= 0) { w.splice(j, 1); return true; }
  return false;
}
export function clipTerrain(doc) {
  doc.crumble = (doc.crumble || []).filter(k => +k.split(',')[0] < doc.W - 1);
  doc.water = (doc.water || []).filter(r => r.x0 < doc.W - 1).map(r => ({ ...r, x1: Math.min(r.x1, doc.W - 2) }));
  for (const k of Object.keys(doc.mat || {})) if (+k.split(',')[0] >= doc.W - 1) delete doc.mat[k];
}

// ---- the rectangle brush (water): press at one corner, release at the other ----
let rect = null;
export function rectStart(cur) { rect = { ax: cur.x, ay: cur.y }; }
export const rectActive = () => !!rect;
export function rectEnd(doc, cur, entry) {
  if (!rect) return null; const r = rect; rect = null;
  const x0 = Math.max(1, Math.min(r.ax, cur.x)), x1 = Math.min(doc.W - 2, Math.max(r.ax, cur.x));
  let y0 = Math.max(0, Math.min(r.ay, cur.y)), y1 = Math.min(doc.H - 1, Math.max(r.ay, cur.y));
  if (entry[1] === 'shallows') y1 = y0;   // shallows are one row deep: you wade, you never swim
  if (x1 < x0) return null;
  const w = { kind: entry[1], x0, x1, y0, y1 };
  doc.water = (doc.water || []).filter(o => o.x1 < x0 || o.x0 > x1 || o.y1 < y0 || o.y0 > y1);   // a new pool replaces what it covers
  doc.water.push(w);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) doc.grid[y * doc.W + x] = 0;   // water is air you can be in
  doc.crumble = (doc.crumble || []).filter(k => { const [x, y] = k.split(',').map(Number); return x < x0 || x > x1 || y < y0 || y > y1; });
  for (const k of Object.keys(doc.mat || {})) { const [x, y] = k.split(',').map(Number); if (x >= x0 && x <= x1 && y >= y0 && y <= y1) delete doc.mat[k]; }
  return w;
}

// ---- what the game reads ----
export function enginePools(doc) {
  return (doc.water || []).map(r => {
    const x0 = r.x0 * TS, x1 = (r.x1 + 1) * TS, top = r.y0 * TS, bottom = (r.y1 + 1) * TS;
    if (r.kind === 'shallows') return { x0, x1, y: top + 4, shallow: true, depth: 12 };
    if (r.kind === 'poison') return { x0, x1, y: top + 4, depth: bottom - top - 4, bottom, harm: true, poison: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212' };
    return { x0, x1, y: top, swim: true, bottom, depth: bottom - top, clear: true, wash: 0.34, grad: false };
  });
}
export function engineCrumbles(doc) {
  const set = new Set(doc.crumble || []), rows = {}, out = [];
  for (const k of set) { const [x, y] = k.split(',').map(Number); (rows[y] || (rows[y] = [])).push(x); }
  for (const y in rows) { const xs = rows[y].sort((a, b) => a - b); let a = xs[0], b = xs[0];
    for (let i = 1; i <= xs.length; i++) { if (i < xs.length && xs[i] === b + 1) { b = xs[i]; continue; } out.push({ x0: a, x1: b, row: +y, rows: 1, count: 1.6 }); a = b = xs[i]; } }
  return out;
}

// ---- the editor's overlay: water outlines, cracks on crumbling ledges, the rectangle being dragged ----
export function drawTerrainOverlay(g, doc, cx, cy, cur, entry, t) {
  for (const r of doc.water || []) {
    g.strokeStyle = r.kind === 'poison' ? '#a6e04a' : r.kind === 'shallows' ? '#bfe8ff' : '#6fc3ff'; g.lineWidth = 1;
    g.strokeRect(r.x0 * TS - cx + 0.5, r.y0 * TS - cy + 0.5, (r.x1 - r.x0 + 1) * TS - 1, (r.y1 - r.y0 + 1) * TS - 1);
  }
  g.fillStyle = '#ffb36b';
  for (const k of doc.crumble || []) { const [x, y] = k.split(',').map(Number), px = x * TS - cx, py = y * TS - cy;
    g.fillRect(px + 3, py + 1, 1, 3); g.fillRect(px + 4, py + 3, 1, 2); g.fillRect(px + 10, py + 1, 1, 2); g.fillRect(px + 11, py + 2, 1, 3); }
  if (rect && entry) { const x0 = Math.min(rect.ax, cur.x), x1 = Math.max(rect.ax, cur.x), y0 = Math.min(rect.ay, cur.y), y1 = entry[1] === 'shallows' ? y0 : Math.max(rect.ay, cur.y);
    g.globalAlpha = 0.35 + 0.1 * Math.sin(t * 6); g.fillStyle = entry[1] === 'poison' ? '#5c8a24' : '#3f8fd0';
    g.fillRect(x0 * TS - cx, y0 * TS - cy, (x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS); g.globalAlpha = 1; }
}

// ================= MECHANISMS: what a lever or a plate opens =================
// A lever (hit it) opens its DOOR column through the engine's openColumn; a plate (stand on it, or push a block onto it)
// through openGateCol(gate). Which column: e.link if the LINK tool set one, else the nearest column holding DOOR tiles.
const PORT = T.PORT, LINKERS = new Set(['lever', 'plate']);
const doorCols = doc => { const out = []; for (let x = 0; x < doc.W; x++) for (let y = 0; y < doc.H; y++) if (doc.grid[y * doc.W + x] === PORT) { out.push(x); break; } return out; };
export function linkedCol(doc, e) {
  if (e.link !== undefined && doorCols(doc).includes(e.link)) return e.link;
  let best = null; for (const x of doorCols(doc)) if (best === null || Math.abs(x - e.x) < Math.abs(best - e.x) || (Math.abs(x - e.x) === Math.abs(best - e.x) && x > e.x)) best = x;
  return best;
}
// the entities the GAME gets: copies, with each lever's / plate's door filled in
export function engineEnts(doc) {
  return doc.ents.map(e => {
    const o = { ...e }; if (o.t === 'ram') o.t = 'ramlord';   /* (claude/maker) the palette's RAM LORD: the game's 'ram' is the battering-ram prop, the boss spawns as 'ramlord' */
    if (!LINKERS.has(e.t)) return o;
    const col = linkedCol(doc, e); if (col === null) return o;
    if (e.t === 'lever') o.openColumn = [col, 0, doc.H - 1], o.say = o.say || 'A DOOR OPENS'; else o.gate = col;
    return o;
  });
}
// after placing a thing: a locked gate builds its own bars (h DOOR tiles up from where you put it). True if the grid changed.
export function afterPlace(doc, e) {
  if (e.t !== 'lockgate') return false;
  for (let k = 0; k < (e.h || 4); k++) { const y = e.y - k; if (y >= 0) doc.grid[y * doc.W + e.x] = PORT; }
  return true;
}
// THE LINK TOOL: click a lever or plate, then a DOOR tile
let linkSrc = null;
export function linkClick(doc, cur, say) {
  /* (claude/maker) A BOSS LOCKS THE GOAL only when it is linked to it: click the boss, then the goal gate (again to unlink) */
  const wE = doc.ents.find(q => q.x === cur.x && q.y === cur.y && q.t === 'warp');   /* (claude/maker) a WARP DOOR to another */
  if (wE && linkSrc && linkSrc.t === 'warp' && linkSrc !== wE) { pairWarps(doc, linkSrc, wE); say('WARP DOORS PAIRED'); linkSrc = null; return; }
  if (wE) { linkSrc = wE; say('WARP DOOR: NOW CLICK THE WARP DOOR IT LEADS TO'); return; }
  const bossE = doc.ents.find(q => q.x === cur.x && q.y === cur.y && isBoss(q.t));
  if (bossE) { linkSrc = bossE; say(nameOf(bossE.t) + ': NOW CLICK THE GOAL GATE IT LOCKS'); return; }
  if (linkSrc && isBoss(linkSrc.t)) { const gt = doc.ents.find(q => q.x === cur.x && q.y === cur.y && q.t === 'gate');
    if (gt) { linkSrc.lockGoal = !bossLocks(linkSrc); say(bossLocks(linkSrc) ? 'LINKED: THE GOAL STAYS SHUT UNTIL ' + nameOf(linkSrc.t) + ' FALLS' : 'UNLINKED: THE GOAL IS OPEN FROM THE START'); linkSrc = null; return; }
    say('CLICK THE GOAL GATE (or another boss)'); return; }
  const e = doc.ents.find(q => q.x === cur.x && q.y === cur.y && LINKERS.has(q.t));
  if (e) { linkSrc = e; say((e.t === 'lever' ? 'LEVER' : 'PLATE') + ': NOW CLICK THE DOOR IT OPENS'); return; }
  if (linkSrc && doc.grid[cur.y * doc.W + cur.x] === PORT) { linkSrc.link = cur.x; say('LINKED'); linkSrc = null; return; }
  say(linkSrc ? 'THAT IS NOT A DOOR TILE: CLICK A DOOR' : 'CLICK A LEVER, A PRESSURE PLATE OR A BOSS FIRST');
}
// the editor shows every link: a line from the lever / plate to the door column it opens
/* a boss placed before links existed locked the goal: lockGoal undefined keeps that; a boss placed now starts unlinked (false) */
export const bossLocks = e => !!e && e.lockGoal !== false;
export function drawLinks(g, doc, cx, cy, t) {
  const line = (x0, y0, x1, y1, col) => { g.save(); g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([4, 3]); g.lineDashOffset = -t * 12; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.restore(); };
  /* (claude/maker) WHAT OPENS WHAT: a key to every gate of its metal; a linked boss to the goal, with a padlock on the gate */
  const METAL = { brass: '#e8b84a', iron: '#a8b4c0', bone: '#e8e0c8' };
  for (const k of doc.ents) { if (k.t !== 'key') continue; for (const lg of doc.ents) if (lg.t === 'lockgate' && (lg.needs || 'brass') === (k.kind || 'brass')) line(k.x * TS + 8 - cx, k.y * TS + 8 - cy, lg.x * TS + 8 - cx, lg.y * TS - cy, METAL[k.kind || 'brass'] || '#e8b84a'); }
  for (const w of doc.ents) { if (w.t !== 'warp' || !w.pair || w.wid > w.pair) continue; const o = warpPartner(doc.ents, w); if (o) line(w.x * TS + 8 - cx, w.y * TS - 2 - cy, o.x * TS + 8 - cx, o.y * TS - 2 - cy, WARP_COL[w.col || 0]); }
  const goal = doc.ents.find(q => q.t === 'gate');
  for (const b of doc.ents) { if (!isBoss(b.t)) continue; const on = bossLocks(b);
    if (b === linkSrc || on) { if (goal) line(b.x * TS + 8 - cx, b.y * TS - 8 - cy, goal.x * TS + 8 - cx, goal.y * TS - 8 - cy, b === linkSrc ? '#ffffff' : '#ff6b6b');
      if (goal && on) { const x = goal.x * TS + 4 - cx, y = goal.y * TS - 30 - cy; g.fillStyle = '#1b1626'; g.fillRect(x - 1, y - 1, 10, 10); g.strokeStyle = '#ff6b6b'; g.lineWidth = 1; g.strokeRect(x + 1.5, y - 2.5, 5, 5); g.fillStyle = '#ff6b6b'; g.fillRect(x, y + 2, 8, 6); } } }
  for (const e of doc.ents) { if (!LINKERS.has(e.t)) continue;
    const col = linkedCol(doc, e), x0 = e.x * TS + 8 - cx, y0 = e.y * TS + 8 - cy;
    if (col === null) { g.fillStyle = '#ff6b6b'; g.fillRect(x0 - 1, y0 - 14, 3, 7); g.fillRect(x0 - 1, y0 - 5, 3, 2); continue; }   /* "!": no door to open */
    let ys = []; for (let y = 0; y < doc.H; y++) if (doc.grid[y * doc.W + col] === PORT) ys.push(y);
    const x1 = col * TS + 8 - cx, y1 = (ys[0] + ys[ys.length - 1] + 1) / 2 * TS - cy;
    const col0 = e === linkSrc ? '#ffffff' : e.link !== undefined ? '#ffd36b' : '#e8b84a';   /* white: being linked; bright: set by LINK; amber: the nearest door */
    g.save(); g.strokeStyle = col0; g.lineWidth = 2; g.setLineDash([4, 3]); g.lineDashOffset = -t * 12;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    g.strokeRect(col * TS - cx + 0.5, ys[0] * TS - cy + 0.5, TS - 1, ys.length * TS - 1);
    g.fillStyle = col0; g.fillRect(Math.round(x0) - 2, Math.round(y0) - 2, 4, 4); g.fillRect(Math.round(x1) - 2, Math.round(y1) - 2, 4, 4); g.restore();
  }
}

// ================= GROUND MATERIALS: what the game reads =================
// L.mat[index] = 'cobble' | 'shore' | ... for the cells painted in a material; resolveTiles draws that cell as if the level's
// place were that one (src/main.js MAT_SET), so every skin's own top, edge and fill pieces are used as they are.
export function engineMat(doc) {
  const out = {}; let any = false;
  if (doc.style) for (let i = 0; i < doc.grid.length; i++) { const v = doc.grid[i]; if (v === T.SOLID || v === T.ONEWAY || (v >= 20 && v <= 25)) { out[i] = doc.style; any = true; } }   /* ledges too: a castle's ledges are stone */   /* slopes too: they are cut from the style's own ground */   /* (claude/maker) the level's STYLE */
  for (const [k, m] of Object.entries(doc.mat || {})) { const [x, y] = k.split(',').map(Number); if (doc.grid[y * doc.W + x] === T.SOLID) { out[y * doc.W + x] = m; any = true; } }
  return any ? out : null;
}

// ================= PIECES THAT WOULD NOT WORK (claude/maker batch 1) =================
// A piece painted INSIDE the ground stays buried for the whole level; a WATER kind outside a pool never appears. The
// editor refuses the first, warns about the second, and marks both in red (drawProblems); PLAY says how many there are.
const SOLID_IDS = new Set([T.SOLID, T.CRATE, T.PALISADE, T.SOFT, T.ICE, T.CLIMB, T.CRYST]);
export const isSolidId = v => SOLID_IDS.has(v) || (v >= 20 && v <= 25);
const inWater = (doc, x, y) => (doc.water || []).some(r => r.kind !== 'shallows' && x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);
const kindOf = id => (id.includes(':') ? id.split(':')[0] : id);
const TILE_SITTERS = new Set(['lockgate']);   // a locked gate stands on its own bars
export function placeProblem(doc, id, x, y) {
  const t = kindOf(id), cell = doc.grid[y * doc.W + x];
  if (cell === T.CRATE && canLoot(t)) return { loot: true, say: 'IN THE CRATE: ' + (FOES.includes(t) ? nameOf(t) : thingName(t)) };   /* items and foes go INTO a crate */
  if (isSolidId(cell) && !TILE_SITTERS.has(t)) return { refuse: true, say: "THAT'S INSIDE THE GROUND: PUT IT ON TOP" };
  if (WATER_FOES.includes(t) && !inWater(doc, x, y)) return { say: nameOf(t) + ' ONLY APPEARS IN WATER: DRAG WATER AROUND IT' };
  return null;
}
export function problems(doc) {
  const out = [];
  for (const e of doc.ents) {
    const cell = doc.grid[e.y * doc.W + e.x];
    if (isSolidId(cell) && !TILE_SITTERS.has(e.t)) out.push({ e, why: 'buried' });
    else if (WATER_FOES.includes(e.t) && !inWater(doc, e.x, e.y)) out.push({ e, why: 'needs water' });
    else if (e.t === 'warp' && !warpPartner(doc.ents, e)) out.push({ e, why: 'no pair' });
  }
  return out;
}
export function drawProblems(g, doc, cx, cy, t, text) {
  const ps = problems(doc), a = 0.6 + 0.4 * Math.sin(t * 8);
  for (const { e, why } of ps) { const x = e.x * TS - cx, y = e.y * TS - cy;
    g.globalAlpha = a; g.strokeStyle = '#ff4a4a'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, TS - 2, TS - 2); g.globalAlpha = 1;
    text(why === 'buried' ? 'BURIED' : why === 'no pair' ? 'NO PAIR' : 'NO WATER', x + 8, y - 8, '#ff6b6b', 'center', 6); }
  return ps.length;
}

// ================= PIECE SETTINGS (claude/maker batch 2) =================
// What you can change on a placed piece. Each row: { key, label, values: [...], show: v => text } or { key, label, text: true }.
// The values are the engine's own fields (spawnEnt reads them), so nothing here needs a hook in the game.
const tiles = n => (n === 1 ? '1 TILE' : n + ' TILES'), secs = v => v + ' S';
const ELITE_ROW = { key: 'elite', label: 'ELITE', values: [false, true], show: v => (v ? 'YES: BIG AND TOUGH' : 'NO'), def: false };
const FACE = { key: 'face', label: 'FACES', values: [-1, 1], show: v => (v === -1 ? 'LEFT' : 'RIGHT'), def: 1 };   /* spawnEnt: e.face || 1, so unset means RIGHT */
export function pieceRows(e) {
  if (FOES.includes(e.t)) return ELITE_KINDS.has(e.t) && !BOSSES.includes(e.t) ? [FACE, ELITE_ROW] : [FACE];
  if (e.t === 'mover' && e.track && e.track.length > 1) return [
    { key: 'loop', label: 'AT THE END', values: [false, true], show: v => (v ? 'GOES ROUND AGAIN (LOOP)' : 'COMES BACK THE SAME WAY'), def: false },
    { key: 'speed', label: 'SPEED', values: [20, 34, 50, 70], show: v => ({ 20: 'SLOW', 34: 'STEADY', 50: 'QUICK', 70: 'FAST' })[v], def: 34 },
    { key: 'len', label: 'WIDTH', values: [1, 2, 3, 4], show: tiles, def: 2 }];
  if (e.t === 'mover' && e.vert) return [{ key: 'vert', label: 'MOVES', values: [false, true], show: v => (v ? 'UP AND DOWN' : 'SIDE TO SIDE'), def: false },
    { key: 'rise', label: 'HOW HIGH', values: [1, 2, 3, 4, 5, 6, 8, 10], show: tiles, def: 4 },
    { key: 'period', label: 'ONE TRIP TAKES', values: [2, 2.5, 3.2, 4, 5, 6], show: secs, def: 3.2 },
    { key: 'len', label: 'WIDTH', values: [1, 2, 3, 4], show: tiles, def: 2 }];
  if (e.t === 'mover') return [{ key: 'vert', label: 'MOVES', values: [false, true], show: v => (v ? 'UP AND DOWN' : 'SIDE TO SIDE'), def: false },
    { key: 'range', label: 'HOW FAR', values: [1, 2, 3, 4, 6, 8, 10, 12], show: tiles, def: 4 },
    { key: 'speed', label: 'SPEED', values: [20, 34, 50, 70], show: v => ({ 20: 'SLOW', 34: 'STEADY', 50: 'QUICK', 70: 'FAST' })[v], def: 34 },
    { key: 'len', label: 'WIDTH', values: [1, 2, 3, 4], show: tiles, def: 2 }];
  if (e.t === 'sign') return [{ key: 'text', label: 'IT SAYS', text: true }];
  if (e.t === 'warp') return [{ key: 'col', label: 'COLOUR', values: [0, 1, 2, 3, 4, 5], show: v => WARP_NAMES[v], def: 0 }];
  if (e.t === 'arrow') return [{ key: 'dir', label: 'POINTS', values: [0, 1, 2, 3, 4, 5, 6, 7], show: v => ARROW_DIRS[v], def: 0 }];
  if (e.t === 'crusher') return [{ key: 'every', label: 'DROPS EVERY', values: [1.5, 2, 3, 4, 6], show: secs, def: 3 }];
  if (e.t === 'firevent') return [{ key: 'every', label: 'FLAMES EVERY', values: [1.5, 2, 2.8, 4, 6], show: secs, def: 2.8 }];
  if (e.t === 'rockfall') return [{ key: 'every', label: 'A ROCK EVERY', values: [1.2, 1.8, 2.5, 3.5, 5], show: secs, def: 2.5 }];
  if (e.t === 'firepit' || e.t === 'vent') return [{ key: 'period', label: 'ONCE EVERY', values: [2, 3, 4, 6], show: secs, def: e.t === 'vent' ? 4 : 3 },
    { key: 'on', label: 'LASTS', values: [0.8, 1.4, 2, 3], show: secs, def: e.t === 'vent' ? 1.6 : 1.4 }];
  if (e.t === 'roller') return [FACE, { key: 'speed', label: 'SPEED', values: [35, 55, 80], show: v => ({ 35: 'SLOW', 55: 'STEADY', 80: 'FAST' })[v], def: 55 }];
  if (e.t === 'key') return [{ key: 'kind', label: 'METAL', values: ['brass', 'iron', 'bone'], show: v => v.toUpperCase(), def: 'brass' }];
  if (e.t === 'lockgate') return [{ key: 'needs', label: 'OPENS WITH', values: ['brass', 'iron', 'bone'], show: v => v.toUpperCase() + ' KEY', def: 'brass' },
    { key: 'h', label: 'HEIGHT', values: [2, 3, 4, 5, 6, 8], show: tiles, def: 4 }];
  return [];
}
export const pieceName = e => FOES.includes(e.t) ? nameOf(e.t) : e.t === 'mover' ? (e.vert ? 'LIFT' : 'MOVING PLATFORM') : e.t === 'key' ? 'KEY' : e.t === 'lockgate' ? 'LOCKED GATE' : thingName(e.t);
export const rowValue = (e, r) => (e[r.key] !== undefined ? e[r.key] : r.def);
// step a row: returns true if the grid changed (a gate's bars grew or shrank)
export function stepRow(doc, e, r, d) {
  const i = r.values.indexOf(rowValue(e, r)), v = r.values[((i < 0 ? 0 : i) + d + r.values.length) % r.values.length];
  if (e.t === 'mover' && r.key === 'vert') { e.vert = v; if (v) { if (e.rise === undefined) e.rise = 4; if (e.period === undefined) e.period = 3.2; } else { if (e.range === undefined) e.range = 4; if (e.speed === undefined) e.speed = 34; } return false; }   /* (claude/maker) one MOVING PLATFORM, two ways to move */
  if (e.t === 'lockgate' && r.key === 'h') {
    const old = e.h || 4; for (let k = 0; k < old; k++) { const y = e.y - k; if (y >= 0 && doc.grid[y * doc.W + e.x] === T.PORT) doc.grid[y * doc.W + e.x] = T.AIR; }
    e.h = v; afterPlace(doc, e); return true;
  }
  e[r.key] = v; return false;
}
// the editor shows where a moving platform will go: its whole track, faint
export function drawPieceHints(g, doc, cx, cy) {
  g.save(); g.setLineDash([2, 2]); g.strokeStyle = 'rgba(255,211,107,0.7)'; g.lineWidth = 1;
  for (const e of doc.ents) { if (e.t !== 'mover') continue; const w = (e.len || 2) * TS, x = e.x * TS - cx, y = e.y * TS - cy;
    if (e.vert) { const rise = (e.rise || 0) * TS; g.strokeRect(x + 0.5, y - rise + 0.5, w - 1, rise + 7); }
    else { const rg = (e.range || 0) * TS; g.strokeRect(x + 0.5, y + 0.5, w + rg - 1, 7); } }
  g.restore();
}

// ================= SHARE LINKS (claude/maker batch 2) =================
// A whole level in a link: the save JSON (grid run-length coded like edSave), deflated, base64url, after #L= .
function rle(gr) { let out = '', run = 1; for (let i = 1; i <= gr.length; i++) { if (i < gr.length && gr[i] === gr[i - 1]) { run++; continue; } out += gr[i - 1].toString(36) + (run > 1 ? run.toString(36) : '') + '.'; run = 1; } return out; }
function unrle(str, n) { const gr = new Uint8Array(n); let at = 0; for (const part of str.split('.')) { if (!part) continue; const v = parseInt(part[0], 36), c = part.length > 1 ? parseInt(part.slice(1), 36) : 1; for (let k = 0; k < c && at < n; k++) gr[at++] = v; } return gr; }
export const docToJSON = d => ({ v: 1, name: d.name, W: d.W, H: d.H, theme: d.theme, start: d.start, ents: d.ents, grid: rle(d.grid), ...terrainOf(d) });
export function docFromJSON(o) {
  if (!o || !o.W || !o.H || typeof o.grid !== 'string') throw new Error('not a level');
  const d = { W: o.W, H: o.H, grid: unrle(o.grid, o.W * o.H), ents: o.ents || [], theme: o.theme || 0, name: o.name || 'A SHARED WOOD', start: o.start === undefined ? { x: 3, y: 19 } : o.start };
  setTerrain(d, o); return d;
}
const b64u = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const unb64u = str => { const b = str.replace(/-/g, '+').replace(/_/g, '/'); const bin = atob(b + '==='.slice((b.length + 3) % 4)); return Uint8Array.from(bin, c => c.charCodeAt(0)); };
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
export async function shareCode(d) { return b64u(await pipe(new TextEncoder().encode(JSON.stringify(docToJSON(d))), new CompressionStream('deflate-raw'))); }
export async function fromShareCode(code) {
  const c = String(code).trim().replace(/^.*#L=/, '');
  return docFromJSON(JSON.parse(new TextDecoder().decode(await pipe(unb64u(c), new DecompressionStream('deflate-raw')))));
}
export async function shareLink(d) { return location.origin + location.pathname + '?maker=1#L=' + await shareCode(d); }

// the first place a knight can stand in a column (air with something solid or a ledge under it), from row `from` down
export function standIn(doc, x, from = 0) {
  for (let y = Math.max(1, from); y < doc.H - 1; y++) { const here = doc.grid[y * doc.W + x], under = doc.grid[(y + 1) * doc.W + x];
    if (!isSolidId(here) && here !== T.ONEWAY && (isSolidId(under) || under === T.ONEWAY)) return { x, y }; }
  return null;
}

export const inPool = (doc, x, y) => (doc.water || []).some(r => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1);

// ================= GRAB AND MOVE (claude/maker feel batch) =================
// A moving platform's track has a HANDLE at its far end (a lift's at its top): drag it to set how far / how high.
export function handleOf(e) {
  if (e.t !== 'mover' || (e.track && e.track.length > 1)) return null;   /* a platform on a TRACK has no reach handle: its track is its reach */
  return e.vert ? { x: e.x, y: e.y - (e.rise || 0), e, kind: 'rise' } : { x: e.x + (e.len || 2) + (e.range || 0) - 1, y: e.y, e, kind: 'range' };
}
export function handleAt(doc, c) { for (const e of doc.ents) { const h = handleOf(e); if (h && h.x === c.x && h.y === c.y && (h.e.range || h.e.rise)) return h; } return null; }
export function dragHandle(h, c) {
  if (h.kind === 'range') h.e.range = Math.max(1, Math.min(30, c.x - h.e.x - (h.e.len || 2) + 1));
  else h.e.rise = Math.max(1, Math.min(20, h.e.y - c.y));
}
// moving a placed piece: where it may go (not into the ground, not onto another piece; a locked gate stays with its bars)
export const movable = e => e.t !== 'lockgate' && !e.arenaRec;   /* a boss in its own room stays with the room (erase it and place it again) */
export function canMoveTo(doc, e, x, y) {
  if (x < 1 || y < 0 || x >= doc.W - 1 || y >= doc.H) return false;
  if (doc.ents.some(q => q !== e && q.x === x && q.y === y)) return false;
  const why = placeProblem(doc, e.t, x, y); return !(why && why.refuse);
}
export function drawHandles(g, doc, cx, cy, t) {
  for (const e of doc.ents) { const h = handleOf(e); if (!h) continue; const x = h.x * TS - cx, y = h.y * TS - cy, a = 0.75 + 0.25 * Math.sin(t * 5);
    g.globalAlpha = a; g.fillStyle = '#ffd36b'; g.fillRect(x + 4, y + 4, 8, 8); g.fillStyle = '#1b1626'; g.globalAlpha = 1;
    if (h.kind === 'range') { g.fillRect(x + 6, y + 7, 4, 2); g.fillRect(x + 9, y + 6, 1, 4); } else { g.fillRect(x + 7, y + 6, 2, 4); g.fillRect(x + 6, y + 6, 4, 1); } }
}

// ================= WHAT A PIECE DOES (claude/maker feel batch: hover cards) =================
// One plain line and a few tags, so you know a piece before you place it. Foes: the bestiary's first sentence, tags read
// from its words; everything else: written here.
const LINE = {
  0: 'Empty air: paints a gap.', 1: "Solid ground in the level's STYLE (the swatches at the left). SHIFT+paint keeps a cell in this style when the style changes.",
  ramp: 'Press where the slope starts, release where it ends: steep or gentle, up or down, from your drag. A click alone makes one ramp.', 2: 'A ledge: jump up through it, stand on top.', 3: 'Spikes: they hurt.',
  4: 'A crate: solid, and breakable.', 8: 'A plank: stand on it, jump up through it.', 9: 'A rope ladder: climb it.', 10: 'A spring: it throws you high.', 11: 'A shelf: stand on it, jump up through it.',
  12: 'A door: a lever or pressure plate opens it.', 13: 'A rock face: a wall you can cling to and kick up.', 14: 'A thin rail: stand on it, jump up through it.', 15: 'Breakable rock: a heavy blow breaks it.', 16: 'Ice: slippery.',
  17: 'A web: it slows you.', 18: 'A crystal ledge: stand on it, jump up through it.', 5: 'Reeds: stand on them, jump up through them.', 7: 'A wooden wall.',
  20: 'A steep slope up.', 21: 'A steep slope down.', 22: 'A gentle slope up (first half).', 23: 'A gentle slope up (second half).', 24: 'A gentle slope down (second half).', 25: 'A gentle slope down (first half).',
  hill: 'Paint the top of the ground: it fills down, and every one-tile step becomes a ramp.', crumble: 'Holds a moment after you land, then falls. Comes back on a retry.', water: 'Water to swim in. Drag a box.', shallows: 'Wading water, one row deep. Drag a box.', poison: 'Poisoned water: it hurts. Drag a box.',
  coin: 'A coin.', silver: 'A silver coin: the rare one.', check: 'A checkpoint: you come back here when you fall.', gate: 'The goal. Every level needs one.',
  mover: 'A platform that slides side to side. Drag its gold handle to set how far.', 'mover:up': 'A lift that rises and sinks. Drag its gold handle to set how high.',
  lever: 'Hit it with your sword: it opens its door.', plate: 'Stand on it (or push a block onto it): it opens its door.',
  key: 'Pick it up to open the gate of the same metal.', 'key:brass:one': 'Pick it up: it opens the LOCKED GATE of its metal (brass, iron or bone).', 'lockgate:brass:one': 'Bars only the KEY of its metal opens.', 'mover:one': 'A platform that slides side to side or rises and sinks. Drag its gold handle to set how far.', lockgate: 'A locked gate: the key of its metal opens it.', pushblock: 'A block you can push, onto a plate or into a gap.',
  crusher: 'Drops from above on a beat. Do not be under it.', firevent: 'Spits fire on a beat. Jump it.', roller: 'Rolls along the floor. Jump it.',
  rockfall: 'Rocks fall here on a beat.', vent: 'A blast of air on a beat: it lifts you.', firepit: 'A fire pit that flares on a beat.',
  mend: 'A heart: it heals you.', switch: 'Hit it: every RED block and every BLUE block swap.', 'sw:red': 'Solid until a SWITCH is hit, then gone (and back again).', 'sw:blue': 'Empty until a SWITCH is hit, then solid (and gone again).',
  warp: 'Stand in it and press UP: you come out of its partner. Two placed in a row pair themselves; TOOLS > LINK pairs any two.', sign: 'A sign with your words on it.', arrow: 'An arrow sign: shows the way. SHIFT+CLICK it to point it.', torch: 'A torch: light.', brazier: 'A brazier: light.', barrel: 'A barrel.', glow: 'A glow: light in the dark.', puffball: 'A puffball: it bursts.',
  lantern: 'A lantern: light.', npc: 'A villager.',
};
const MAT_LINE = { grass: 'Grass on earth, whatever the background.', cobble: "A village's cobbles.", shore: 'Shore rock.', reef: 'Reef rock.', city: 'City stone.', masonry: 'Castle stone.', deck: "A ship's deck." };
/* THE STARTER CAST's tags are written by hand: the bestiary's words talk about YOUR shield and blocking so much that reading
   tags out of them called the archer a shield-bearer (2026-11-09). The rest are read from the first sentence only. */
const HAND_TAGS = { sprig: ['WALKS'], shield: ['WALKS', 'SHIELD'], archer: ['SHOOTS'], brute: ['HEAVY'], hound: ['FAST'], wasp: ['FLIES'], spit: ['SHOOTS'],
  hopper: ['LEAPS'], sapper: ['BOMBS'], harpy: ['FLIES'], zombie: ['RISES'], wight: ['RISES'], goat: ['CHARGES'], rockgoblin: ['THROWS'], shaman: ['SUMMONS'] };
function tagsFrom(t, d) {
  if (HAND_TAGS[t]) return HAND_TAGS[t];
  const w = firstSentence(d).toLowerCase().replace(/your shield/g, ''), out = [];
  if (WATER_FOES.includes(t)) out.push('WATER');
  if (/\b(fl(y|ies|ying)|wings?|swoops?|hovers?|dives?|drifts?)\b/.test(w)) out.push('FLIES');
  if (/\b(shoots?|arrows?|bolts?|throws?|spits?|casts?|hurls?|lobs?|looses?|fires?)\b/.test(w)) out.push('SHOOTS');
  if (/\b(shield|blocks)\b/.test(w)) out.push('SHIELD');
  if (/\b(heavy|plate|maul|armou?r)\b/.test(w)) out.push('HEAVY');
  if (/\b(rises?|rising) (from|out of|up out of|up from)\b/.test(w)) out.push('RISES');
  if (!out.length) out.push('FIGHTS');
  return out.slice(0, 3);
}
const firstSentence = d => { const m = String(d || '').match(/^.*?[.!?](\s|$)/); return (m ? m[0] : String(d || '')).trim(); };
export function describe(cat, id) {
  if (cat === 1) { const d = DESCS[id]; return { name: nameOf(id), line: d ? firstSentence(d) : (BOSSES.includes(id) ? 'A boss: it gets its own arena, and the goal opens when it falls.' : 'Fights you.'), tags: BOSSES.includes(id) ? ['BOSS'] : tagsFrom(id, d) }; }
  if (cat === 0) { const k = typeof id === 'string' && id.startsWith('mat:') ? null : id;
    if (typeof id === 'string' && id.startsWith('sw:')) return { name: (TILES.find(t => t[1] === id) || [id])[0], line: LINE[id], tags: [] }; return { name: (TILES.find(t => t[1] === id) || [String(id)])[0], line: k === null ? MAT_LINE[id.slice(4)] : LINE[k] || '', tags: [] }; }
  if (cat === 2) { const k = String(id).split(':')[0], metal = String(id).split(':')[1]; let line = LINE[id] || LINE[k] || '';
    if (SHOWN_NAME[id]) return { name: SHOWN_NAME[id], line: LINE[id + ':one'] || line, tags: [] };
    if (metal) line = line.replace('the same metal', metal).replace('its metal', 'the ' + metal + ' one'); return { name: thingName(id), line, tags: [] }; }
  return { name: String(id), line: '', tags: [] };
}
// a placed piece's description (its kind decides)
export function describeEnt(e) {
  if (FOES.includes(e.t)) return describe(1, e.t);
  const id = e.t === 'mover' ? (e.vert ? 'mover:up' : 'mover') : e.t === 'key' ? 'key:' + (e.kind || 'brass') : e.t === 'lockgate' ? 'lockgate:' + (e.needs || 'brass') : e.t;
  return describe(2, id);
}
// ---- REACH: where a hazard bites, which way a foe faces (faint, always on; the hovered piece's is strong) ----
export function drawReach(g, doc, cx, cy, hover) {
  const solidAt = (x, y) => y >= doc.H || isSolidId(doc.grid[y * doc.W + x]);
  for (const e of doc.ents) {
    const strong = e === hover, x = e.x * TS - cx, y = e.y * TS - cy; g.globalAlpha = strong ? 0.45 : 0.16;
    if (e.t === 'crusher') { g.fillStyle = '#ff4a4a'; g.fillRect(x - 8, y - 6 * TS, TS * 2, 7 * TS); }
    else if (e.t === 'firevent' || e.t === 'firepit') { g.fillStyle = '#ff8a3a'; g.fillRect(x + 3, y - 3 * TS, 10, 4 * TS); }
    else if (e.t === 'vent') { g.fillStyle = '#bfe8ff'; g.fillRect(x + 2, y + TS - (e.h || 112), 12, e.h || 112); }
    else if (e.t === 'rockfall') { let yy = e.y + 1; while (yy < doc.H && !solidAt(e.x, yy)) yy++; g.fillStyle = '#8b8378'; g.fillRect(x + 4, y, 8, (yy - e.y) * TS); }
    else if (FOES.includes(e.t)) { g.globalAlpha = strong ? 0.9 : 0.45; g.fillStyle = '#ffd36b'; const f = e.face === -1 ? -1 : 1, ax = x + 8 + f * 9, ay = y + 13;
      g.beginPath(); g.moveTo(ax + f * 4, ay); g.lineTo(ax - f * 1, ay - 3); g.lineTo(ax - f * 1, ay + 3); g.fill(); }
    g.globalAlpha = 1;
  }
}

// ================= SMART HILLS (claude/maker) =================
// Paint where the ground's TOP should be: the column fills down to the ground, and in the columns around it every step of
// exactly one tile gets a ramp (on the lower side, rising toward the higher one). Bigger steps stay cliffs.
const isRamp = v => v === SLOPE.R1 || v === SLOPE.L1;
function topOf(doc, x) { for (let y = 0; y < doc.H; y++) { const v = doc.grid[y * doc.W + x]; if (isSolidId(v) && !(v >= 20 && v <= 25)) return y; } return doc.H; }
export function hillPaint(doc, tx, ty) {
  const W = doc.W, changed = [], set = (x, y, v) => { const i = y * W + x; if (doc.grid[i] !== v) { doc.grid[i] = v; changed.push([x, y]); } };
  for (let y = 0; y < ty; y++) if (isRamp(doc.grid[y * W + tx])) set(tx, y, T.AIR);   // a ramp above the new top would float
  for (let y = ty; y < doc.H && !(isSolidId(doc.grid[y * W + tx]) && !(doc.grid[y * W + tx] >= 20 && doc.grid[y * W + tx] <= 25)); y++) { set(tx, y, T.SOLID); if (doc.mat) delete doc.mat[tx + ',' + y]; }
  const occupied = (x, y) => doc.ents.some(e => e.x === x && e.y === y) || inPool(doc, x, y);
  for (let x = Math.max(1, tx - 2); x <= Math.min(W - 2, tx + 2); x++) {
    const top = topOf(doc, x); if (top <= 0 || top >= doc.H) continue;
    const above = (top - 1) * W + x;
    if (isRamp(doc.grid[above])) set(x, top - 1, T.AIR);   // re-decide this column's ramp
    if (doc.grid[above] !== T.AIR || occupied(x, top - 1)) continue;
    const r = topOf(doc, x + 1), l = topOf(doc, x - 1);
    if (r === top - 1 && l !== top - 1) set(x, top - 1, SLOPE.R1);
    else if (l === top - 1 && r !== top - 1) set(x, top - 1, SLOPE.L1);
  }
  return changed;
}

// ================= THE GUIDE AND THE EXAMPLES (claude/maker) =================
function base(W, H = 28, floor = 20) { const d = { W, H, grid: new Uint8Array(W * H), ents: [], theme: 0, name: 'A WOOD', start: { x: 3, y: floor - 1 } };
  for (let x = 0; x < W; x++) for (let y = floor; y < H; y++) d.grid[y * W + x] = T.SOLID; setTerrain(d, {}); return d; }
const put = (d, x, y, v) => { if (x >= 0 && y >= 0 && x < d.W && y < d.H) d.grid[y * d.W + x] = v; };
const box = (d, x0, x1, y0, y1, v) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) put(d, x, y, v); };
// THE GUIDE'S LEVEL: a floor with a gap in it, no enemies, no goal
export function guideDoc() { const d = base(70); box(d, 22, 27, 20, 27, T.AIR); d.name = 'MY FIRST LEVEL'; return d; }
export const GUIDE = [
  { say: 'FILL THE GAP: pick GROUND (top left), then click-drag across the hole', done: d => [22, 23, 24, 25, 26, 27].every(x => isSolidId(d.grid[20 * d.W + x])) },
  { say: 'ADD AN ENEMY: open ENEMIES, click the GOBLIN, then click on the ground', done: d => d.ents.some(e => FOES.includes(e.t)) },
  { say: 'MAKE A SLOPE: GROUND > SLOPE, then drag from the floor up and across', done: d => d.grid.some(v => v >= 20 && v <= 25) },
  { say: 'PUT THE GOAL GATE near the far end: START/GOAL > GOAL GATE', done: d => d.ents.some(e => e.t === 'gate') },
  { say: 'PRESS PLAY and reach the gate. ESC comes back here', done: (d, c) => c.played },
  { say: 'THAT IS A LEVEL! SHARE sends it to a friend. Try the examples in HELP next', done: () => false, last: true },
];
// THE EXAMPLES: open one and take it apart
export const EXAMPLES = [
  { name: 'THE TOUR', make() { const d = base(150); d.name = 'THE TOUR';
    hillPaint(d, 12, 19); hillPaint(d, 13, 18); hillPaint(d, 14, 17); hillPaint(d, 15, 17); hillPaint(d, 16, 18); hillPaint(d, 17, 19);
    box(d, 26, 35, 20, 23, T.AIR); d.water = [{ kind: 'water', x0: 26, x1: 35, y0: 20, y1: 23 }];
    box(d, 40, 46, 20, 27, T.AIR); for (let x = 41; x <= 45; x++) { put(d, x, 19, T.ONEWAY); d.crumble.push(x + ',19'); }
    box(d, 56, 56, 15, 19, T.PORT); box(d, 66, 66, 15, 19, T.PORT);
    d.ents = [{ t: 'gate', x: 140, y: 19 }, { t: 'check', x: 50, y: 19 }, { t: 'sprig', x: 20, y: 19 }, { t: 'eel', x: 31, y: 22 }, entFor('lever', 53, 19), entFor('plate', 63, 19),
      entFor('key:brass', 72, 19), entFor('lockgate:brass', 80, 19), entFor('mover', 88, 16), entFor('mover:up', 98, 18), { t: 'shield', x: 106, y: 19 }, { t: 'archer', x: 112, y: 19, face: -1 },
      entFor('crusher', 127, 19), entFor('firevent', 132, 19), ...[22, 24, 37, 39, 75, 90, 100].map(x => ({ t: 'coin', x, y: 17 }))];
    for (const e of d.ents) afterPlace(d, e); return d; } },
  { name: 'THE MILL', make() { const d = base(110); d.name = 'THE MILL'; d.theme = 21;
    box(d, 14, 40, 20, 25, T.AIR); d.water = [{ kind: 'water', x0: 14, x1: 40, y0: 21, y1: 25 }];
    for (const x of [17, 22, 27, 32, 37]) for (let y = 20; y <= 25; y++) { put(d, x, y, T.SOLID); put(d, x + 1, y, T.SOLID); }   /* stepping posts level with the bank, three-tile gaps; one step up out of the water, so a fall is never a trap (maker-walk found the old ones were) */
    for (let x = 14; x <= 40; x++) { d.mat[x + ',26'] = 'deck'; }
    box(d, 50, 50, 14, 19, T.PORT); box(d, 62, 62, 14, 19, T.PORT); box(d, 74, 74, 14, 19, T.PORT);
    for (let x = 44; x <= 90; x++) d.mat[x + ',20'] = 'cobble';
    d.ents = [{ t: 'gate', x: 104, y: 19 }, { t: 'puffer', x: 20, y: 23 }, { t: 'eel', x: 30, y: 24 }, entFor('lever', 46, 19), entFor('plate', 58, 19), entFor('pushblock', 55, 19),
      entFor('lever', 70, 19), { t: 'sprig', x: 66, y: 19 }, { t: 'hound', x: 84, y: 19, face: -1 }, { t: 'check', x: 44, y: 19 }, ...[20, 25, 30, 35].map(x => ({ t: 'coin', x, y: 17 }))];
    d.ents[3].link = 50; d.ents[4].link = 62; d.ents[6].link = 74;
    for (const e of d.ents) afterPlace(d, e); return d; } },
  { name: 'THE CLIMB', make() { const d = base(90); d.name = 'THE CLIMB'; d.time = 'dusk'; d.weather = 'leaves';
    for (let x = 10; x <= 16; x++) hillPaint(d, x, 19 - (x - 10)); for (let x = 17; x <= 22; x++) hillPaint(d, x, 13);
    box(d, 23, 33, 13, 27, T.AIR); box(d, 23, 33, 26, 27, T.SOLID); box(d, 23, 33, 25, 25, T.SPIKE);
    for (const x of [25, 29]) { put(d, x, 13, T.ONEWAY); put(d, x + 1, 13, T.ONEWAY); d.crumble.push(x + ',13', (x + 1) + ',13'); }
    box(d, 34, 44, 13, 19, T.SOLID); for (let x = 34; x <= 44; x++) d.mat[x + ',13'] = 'masonry';
    for (let y = 8; y <= 12; y++) put(d, 46, y, T.NET); box(d, 45, 52, 8, 8, T.ONEWAY);
    d.ents = [{ t: 'gate', x: 84, y: 19 }, { t: 'wasp', x: 20, y: 10 }, { t: 'archer', x: 40, y: 12, face: -1 }, entFor('mover:up', 54, 18), { t: 'goat', x: 70, y: 19, face: -1 },
      { t: 'check', x: 36, y: 12 }, entFor('rockfall', 62, 12), ...[[12, 14], [14, 12], [26, 11], [30, 11], [48, 7], [50, 7]].map(([x, y]) => ({ t: 'coin', x, y }))];   /* above the hill's ramps, not in them */
    d.ents[3].rise = 6; for (const e of d.ents) afterPlace(d, e);   /* the lift: up to the masonry */ d.start = { x: 3, y: 19 }; return d; } },
];

// ================= BOSSES (claude/maker) =================
// A boss stands in its own ARENA: placing one builds an arena round it (walls that close behind you when you cross the
// trigger line, the boss's own music and tint, sized like its home arena), and the level's GOAL GATE opens when it falls.
// One boss a level. BOSSES is filled by the boss sweep (tools/maker-bosses.mjs) - only the ones that work in a plain arena.
let ARENA = {};
export function setArenaInfo(map) { ARENA = map || {}; }
export const BOSS_CANDIDATES = () => Object.keys(ARENA);
// THE SWEEP'S VERDICT (2026-11-09, all 53 bosses with a home arena, in a plain made-by-hand arena): these wake, fight, can be
// finished, and their fall opens the goal. Left out, and why: their own level's machinery is read on spawn (djinn, fogknight,
// matriarch, colossus, hawkmistress, greatdrill, paladinboss, hourglassking, cisternqueen, lanterneater, admiral, bzchief,
// archmage, undeadmage, reefmaw, kraken, winchmaster, duneworm, puppeteer, strawking, tombking, grubbag, frog), never spawn
// alone (ram, huntmaster), cannot be finished by blows alone (abbot, gargoyle, shrieksisters), or never fight (captain,
// wickerqueen). The full table: docs/MAKER-BOSSES.md, and `node tools/maker-bosses.mjs --report` re-runs it.
// Re-sweep with mkBossDown (a maker boss's fall always opens the placed goal): chief and owl joined.
// (claude/maker, five more 2026-11-09) duneworm: the level borrows the caravan's rules for him (his storm, the sun in his hollow; the rest of
// the level is shade) - no quicksand, overhang or great-shade winch. shrieksisters, kraken, admiral, gargoyle bring their own room
// (src/maker-stages.js: the Sisters' crag, the Kraken's reach over a shallower sea, the Lashings and their two deck guns, the Gargoyle's spikes,
// slabs and rune); what each room lacks against its home is written over its builder there.
/* (2026-11-09, after merging master) THE GOBLIN QUEEN is out: master's GQ3 rework made her a set-piece (her hall's bell, grate and barracks
   gate; the flight up the burning hall; phase two on the tower top - src/gqueen-hands.js). She takes harm only stunned. Back when her rooms are built. */
export const BOSSES = ['oldtusker', 'chief', 'owl', 'ram', 'huntmaster', 'bzchief', 'grubbag', 'tombking', 'reefmaw', 'strawking', 'wickerqueen',
  'captain', 'archmage', 'duneworm', 'shrieksisters', 'kraken', 'admiral', 'gargoyle', 'djinn', 'cisternqueen', 'matriarch', 'colossus', 'hawkmistress', 'paladinboss', 'fogknight', 'hourglassking', 'greatdrill', 'lanterneater', 'puppeteer', 'mother', 'king', 'windcaller', 'lance', 'herald', 'tollmaster', 'grandmother', 'bellcrab', 'drownedking',
  'harbormaster', 'closedhelm', 'prince', 'burieddead', 'pyromancer', 'bloodknight', 'roc', 'bogtroll', 'hornetqueen', 'batteringbeast'];
FOES.push(...BOSSES);   // placed like foes (cat 1); the BOSSES tab and tools/maker-sweep.mjs keep them apart
export const isBoss = t => BOSSES.includes(t) || !!ARENA[t] && BOSS_TRIAL.has(t);
const BOSS_TRIAL = new Set();   /* the sweep may try a candidate that is not in BOSSES yet */
export function trialBoss(t, on) { if (on) BOSS_TRIAL.add(t); else BOSS_TRIAL.delete(t); }
export function arenaFor(doc) {
  const e = doc.ents.find(q => isBoss(q.t)); if (!e) return null;
  if (e.arenaRec) return { ...e.arenaRec, boss: e.t, maker: true };   /* (claude/maker) a boss that brought its own room (src/maker-stages.js) */
  const info = ARENA[e.t] || {}, w = Math.max(24, Math.min(48, Math.round(info.w || 36)));
  const x0 = Math.max(3, Math.min(doc.W - w - 4, e.x - Math.round(w * 0.65))), x1 = x0 + w;
  const base = { x0: x0 * TS, x1: x1 * TS, floor: (e.y + 1) * TS, trigger: (x0 + 3) * TS, wallL: x0 - 1, wallR: x1 + 1, boss: e.t,
    music: info.music, tint: info.tint || '#c9463d', tintA: info.tintA || 0.1, fx: info.fx, maker: true };
  const ex = ARENA_EXTRA[e.t]; return ex ? { ...base, ...ex(x0, x1 - 1, e.y + 1) } : base;
}
export function drawArena(g, doc, cx, cy, t, SPR, text) {
  const a = arenaFor(doc); if (!a) return;
  /* the boss itself, as a ghost and a name: many sleep out of sight (under the water, in the ground) until their fight */
  { const e = doc.ents.find(q => isBoss(q.t)), sp = SPR && SPR[e.t]; let f = sp && (sp.R || sp); if (f && !f.width) { f = Array.isArray(f) ? f[0] : Object.values(f)[0]; if (Array.isArray(f)) f = f[0]; }
    const bx = e.x * TS + 8 - cx, by = (e.y + 1) * TS - cy; if (f && f.width) { g.globalAlpha = 0.45; g.drawImage(f, Math.round(bx - f.width / 2), Math.round(by - f.height)); g.globalAlpha = 1; }
    if (text) text('BOSS: ' + nameOf(e.t), bx, by - (f && f.height ? f.height : 24) - 10, '#ff6b6b', 'center', 6); }
  const x0 = a.x0 - cx, x1 = a.x1 - cx, fy = a.floor - cy, top = fy - 12 * TS;
  g.save(); g.globalAlpha = 0.12; g.fillStyle = a.tint; g.fillRect(x0, top, x1 - x0, fy - top); g.globalAlpha = 0.8;
  g.strokeStyle = '#ff6b6b'; g.lineWidth = 2; g.setLineDash([]); g.beginPath(); g.moveTo(a.wallL * TS + 8 - cx, top); g.lineTo(a.wallL * TS + 8 - cx, fy); g.moveTo(a.wallR * TS + 8 - cx, top); g.lineTo(a.wallR * TS + 8 - cx, fy); g.stroke();
  g.strokeStyle = '#ffd36b'; g.lineWidth = 1; g.setLineDash([3, 3]); g.lineDashOffset = -t * 10; g.beginPath(); g.moveTo(a.trigger - cx, top); g.lineTo(a.trigger - cx, fy); g.stroke();
  g.restore();
}

// ================= COMBINING PIECES (claude/maker building batch) =================
// ELITE: a foe the game has an elite form for can be made one (bigger, tougher: main.js ELITE / eliteMake).
let ELITE_KINDS = new Set();
export function setEliteKinds(list) { ELITE_KINDS = new Set(list || []); }
export const hasElite = t => ELITE_KINDS.has(t);
// CRATE CONTENTS: drop a coin, a heart or a foe onto a CRATE and that is what comes out when it breaks (doc.loot['x,y']).
export const canLoot = t => t === 'coin' || t === 'mend' || (FOES.includes(t) && !BOSSES.includes(t) && !WATER_FOES.includes(t));
export function engineLoot(doc) {
  const out = {}; let any = false;
  for (const [k, v] of Object.entries(doc.loot || {})) { const [x, y] = k.split(',').map(Number); if (doc.grid[y * doc.W + x] === T.CRATE) { out[k] = v; any = true; } }
  return any ? out : null;
}
export function drawLoot(g, doc, cx, cy, SPR) {
  for (const [k, v] of Object.entries(doc.loot || {})) {
    const [x, y] = k.split(',').map(Number), px = x * TS - cx, py = y * TS - cy;
    g.fillStyle = 'rgba(12,10,18,0.75)'; g.fillRect(px + 3, py + 3, 10, 10);
    if (v === 'coin') { g.fillStyle = '#ffd34a'; g.beginPath(); g.arc(px + 8, py + 8, 3, 0, 7); g.fill(); }
    else if (v === 'mend') { g.fillStyle = '#ff5a6a'; g.fillRect(px + 5, py + 6, 6, 4); g.fillRect(px + 6, py + 10, 4, 1); g.fillRect(px + 7, py + 11, 2, 1); }
    else {
      let f = SPR && SPR[v] && (SPR[v].R || SPR[v]); if (f && !f.width) { f = Array.isArray(f) ? f[0] : Object.values(f)[0]; if (Array.isArray(f)) f = f[0]; }
      if (f && f.width) { const kk = Math.min(1, 9 / Math.max(f.width, f.height)); g.drawImage(f, px + 8 - f.width * kk / 2, py + 12 - f.height * kk, f.width * kk, f.height * kk); }
      else { g.fillStyle = '#ff6b6b'; g.fillRect(px + 6, py + 6, 4, 4); }
    }
  }
}
// SWITCH BLOCKS: RED solid at the start, BLUE empty; a SWITCH (mkSwitch lever) swaps them all, every hit.
export function engineSwitch(doc) { const out = []; for (const [k, v] of Object.entries(doc.sw || {})) { const [x, y] = k.split(',').map(Number); out.push([x, y, v]); } return out.length ? out : null; }
export function drawSwitchBlocks(g, cells, cx, cy, flipped) {
  for (const [x, y, kind] of cells) {
    const solid = (kind === 'red') !== !!flipped, px = x * TS - cx, py = y * TS - cy;
    g.save();
    if (solid) { g.globalAlpha = 0.45; g.fillStyle = kind === 'red' ? '#ff3a3a' : '#3a7aff'; g.fillRect(px, py, TS, TS); }
    else { g.strokeStyle = kind === 'red' ? '#ff6b6b' : '#6fb0ff'; g.globalAlpha = 0.8; g.lineWidth = 1; g.setLineDash([2, 2]); g.strokeRect(px + 1.5, py + 1.5, TS - 3, TS - 3); }
    g.restore();
  }
}

// ================= TALLER LEVELS =================
// Rows are added (or taken) at the TOP, so the ground and everything on it keep their place under the knight.
export function resizeHeight(doc, dh) {
  const H2 = Math.max(20, Math.min(80, doc.H + dh)); dh = H2 - doc.H; if (!dh) return false;
  const W = doc.W, g2 = new Uint8Array(W * H2);
  for (let y = 0; y < doc.H; y++) { const y2 = y + dh; if (y2 < 0 || y2 >= H2) continue; for (let x = 0; x < W; x++) g2[y2 * W + x] = doc.grid[y * W + x]; }
  const mv = o => { const n = {}; for (const [k, v] of Object.entries(o || {})) { const [x, y] = k.split(',').map(Number); if (y + dh >= 0) n[x + ',' + (y + dh)] = v; } return n; };
  doc.grid = g2; doc.H = H2; doc.ents = doc.ents.filter(e => e.y + dh >= 0).map(e => ({ ...e, y: e.y + dh })); doc.start = doc.start ? { x: doc.start.x, y: Math.max(0, doc.start.y + dh) } : null;
  doc.crumble = (doc.crumble || []).map(k => { const [x, y] = k.split(',').map(Number); return x + ',' + (y + dh); }).filter(k => +k.split(',')[1] >= 0);
  doc.water = (doc.water || []).map(r => ({ ...r, y0: r.y0 + dh, y1: r.y1 + dh })).filter(r => r.y0 >= 0);
  doc.mat = mv(doc.mat); doc.sw = mv(doc.sw); doc.loot = mv(doc.loot); doc._lm = [];
  return true;
}

// ================= SELECT, COPY, CUT, PASTE =================
// TOOLS > SELECT: drag a box. Then CTRL+C copies, CTRL+X cuts, DELETE clears; CTRL+V picks the copy up to stamp with a click.
let sel = null, selDrag = null, clip = null, pasting = false;
export const selection = () => sel, selDragging = () => !!selDrag, isPasting = () => pasting, clipboard = () => clip;
export function selStart(c) { selDrag = { ax: c.x, ay: c.y }; sel = { x0: c.x, y0: c.y, x1: c.x, y1: c.y }; }
export function selMove(c) { if (!selDrag) return; sel = { x0: Math.min(selDrag.ax, c.x), y0: Math.min(selDrag.ay, c.y), x1: Math.max(selDrag.ax, c.x), y1: Math.max(selDrag.ay, c.y) }; }
export function selEnd() { selDrag = null; }
export function selClear() { sel = null; selDrag = null; pasting = false; }
const inSel = (x, y, s) => x >= s.x0 && x <= s.x1 && y >= s.y0 && y <= s.y1;
export function copySel(doc) {
  if (!sel) return false;
  const s = sel, w = s.x1 - s.x0 + 1, h = s.y1 - s.y0 + 1, tiles = new Uint8Array(w * h);
  const rel = o => { const n = {}; for (const [k, v] of Object.entries(o || {})) { const [x, y] = k.split(',').map(Number); if (inSel(x, y, s)) n[(x - s.x0) + ',' + (y - s.y0)] = v; } return n; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) tiles[y * w + x] = doc.grid[(s.y0 + y) * doc.W + s.x0 + x];
  clip = { w, h, tiles, mat: rel(doc.mat), sw: rel(doc.sw), loot: rel(doc.loot),
    crumble: (doc.crumble || []).filter(k => { const [x, y] = k.split(',').map(Number); return inSel(x, y, s); }).map(k => { const [x, y] = k.split(',').map(Number); return (x - s.x0) + ',' + (y - s.y0); }),
    water: (doc.water || []).filter(r => r.x0 >= s.x0 && r.x1 <= s.x1 && r.y0 >= s.y0 && r.y1 <= s.y1).map(r => ({ ...r, x0: r.x0 - s.x0, x1: r.x1 - s.x0, y0: r.y0 - s.y0, y1: r.y1 - s.y0 })),
    ents: doc.ents.filter(e => inSel(e.x, e.y, s) && e.t !== 'gate' && !isBoss(e.t)).map(e => ({ ...e, x: e.x - s.x0, y: e.y - s.y0 })) };
  return true;
}
export function clearSel(doc) {
  if (!sel) return false; const s = sel;
  for (let y = s.y0; y <= s.y1; y++) for (let x = s.x0; x <= s.x1; x++) { doc.grid[y * doc.W + x] = T.AIR; const k = x + ',' + y; if (doc.mat) delete doc.mat[k]; if (doc.sw) delete doc.sw[k]; if (doc.loot) delete doc.loot[k]; }
  doc.crumble = (doc.crumble || []).filter(k => { const [x, y] = k.split(',').map(Number); return !inSel(x, y, s); });
  doc.water = (doc.water || []).filter(r => !(r.x0 >= s.x0 && r.x1 <= s.x1 && r.y0 >= s.y0 && r.y1 <= s.y1));
  doc.ents = doc.ents.filter(e => !inSel(e.x, e.y, s));
  return true;
}
export function startPaste() { if (!clip) return false; pasting = true; return true; }
export function pasteAt(doc, c) {
  if (!clip) return false;
  const ox = c.x, oy = c.y, ok = (x, y) => x >= 1 && y >= 0 && x < doc.W - 1 && y < doc.H;
  for (let y = 0; y < clip.h; y++) for (let x = 0; x < clip.w; x++) {
    const X = ox + x, Y = oy + y; if (!ok(X, Y)) continue; doc.grid[Y * doc.W + X] = clip.tiles[y * clip.w + x];
    const k = X + ',' + Y; for (const f of ['mat', 'sw', 'loot']) { if (doc[f]) delete doc[f][k]; const v = clip[f][x + ',' + y]; if (v !== undefined) (doc[f] || (doc[f] = {}))[k] = v; }
  }
  doc.ents = doc.ents.filter(e => !(e.x >= ox && e.x < ox + clip.w && e.y >= oy && e.y < oy + clip.h));
  for (const e of clip.ents) if (ok(ox + e.x, oy + e.y)) doc.ents.push({ ...e, x: ox + e.x, y: oy + e.y });
  doc.crumble = doc.crumble || [];
  for (const k of clip.crumble) { const [x, y] = k.split(',').map(Number); if (ok(ox + x, oy + y)) doc.crumble.push((ox + x) + ',' + (oy + y)); }
  doc.water = doc.water || [];
  for (const r of clip.water) if (ok(ox + r.x1, oy + r.y1)) doc.water.push({ ...r, x0: ox + r.x0, x1: ox + r.x1, y0: oy + r.y0, y1: oy + r.y1 });
  pasting = false; sel = { x0: ox, y0: oy, x1: Math.min(doc.W - 2, ox + clip.w - 1), y1: Math.min(doc.H - 1, oy + clip.h - 1) };
  return true;
}
export function drawSelInfo(g, doc, cx, cy, text) {
  if (!sel || selDrag) { if (!sel) return; }
  let n = 0; for (let y = sel.y0; y <= sel.y1; y++) for (let x = sel.x0; x <= sel.x1; x++) if (doc.grid[y * doc.W + x]) n++;
  const ins = doc.ents.filter(e => e.x >= sel.x0 && e.x <= sel.x1 && e.y >= sel.y0 && e.y <= sel.y1);
  g.save(); g.strokeStyle = '#8fd1ff'; g.lineWidth = 1; for (const e of ins) g.strokeRect(e.x * TS - cx + 1.5, e.y * TS - cy + 1.5, TS - 3, TS - 3); g.restore();
  const s0 = n + (n === 1 ? ' TILE, ' : ' TILES, ') + ins.length + (ins.length === 1 ? ' PIECE' : ' PIECES') + (selDrag ? '' : '   CTRL+C COPY  CTRL+X CUT  DEL CLEAR');
  const x = sel.x0 * TS - cx, y = sel.y0 * TS - cy - 10; g.fillStyle = 'rgba(12,10,18,0.85)'; g.fillRect(x, y - 1, Math.min(320, s0.length * 4 + 8), 9); text(s0, x + 3, y, '#8fd1ff', 'left', 6);
}
export function drawSel(g, cx, cy, cur, t) {
  if (sel) { g.save(); g.strokeStyle = '#ffffff'; g.lineWidth = 1; g.setLineDash([4, 3]); g.lineDashOffset = -t * 12; g.strokeRect(sel.x0 * TS - cx + 0.5, sel.y0 * TS - cy + 0.5, (sel.x1 - sel.x0 + 1) * TS - 1, (sel.y1 - sel.y0 + 1) * TS - 1); g.restore(); }
  if (pasting && clip) {
    g.save(); g.globalAlpha = 0.35; g.fillStyle = '#8fd1ff';
    for (let y = 0; y < clip.h; y++) for (let x = 0; x < clip.w; x++) if (clip.tiles[y * clip.w + x]) g.fillRect((cur.x + x) * TS - cx, (cur.y + y) * TS - cy, TS, TS);
    g.globalAlpha = 1; g.strokeStyle = '#8fd1ff'; g.setLineDash([4, 3]); g.strokeRect(cur.x * TS - cx + 0.5, cur.y * TS - cy + 0.5, clip.w * TS - 1, clip.h * TS - 1); g.restore();
  }
}

/* (claude/maker) THE CLEAR CHECK (Mario Maker's upload rule): a level can be SHARED only once it was beaten from START to the goal,
   and only as it stood then. docSig is a fingerprint of everything that plays (tiles, pieces, terrain, settings - not the name and
   not the clear itself); any edit changes it, so a cleared level that is changed must be beaten again. */
export function docSig(d) {
  const t = terrainOf(d); delete t.cleared; delete t.music;
  const str = d.W + 'x' + d.H + '|' + d.theme + '|' + (d.start ? d.start.x + ',' + d.start.y : '-') + '|' + JSON.stringify(d.ents) + '|' + JSON.stringify(t);
  let h = 2166136261; for (let i = 0; i < d.grid.length; i++) h = Math.imul(h ^ d.grid[i], 16777619) >>> 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  return h.toString(36) + '.' + d.grid.length.toString(36);
}
export const isCleared = d => !!d.cleared && d.cleared === docSig(d);

/* (claude/maker) LEVEL GOALS: what has to be done before the goal gate lets you through (or what fails the run). */
export const GOALS = [null, 'foes', 'coins', 'nohit', 't30', 't60', 't90', 't120', 't180', 't300'];
export const goalSecs = g => g && g[0] === 't' ? +g.slice(1) : 0;
export const goalName = g => !g ? 'JUST REACH THE GOAL' : g === 'foes' ? 'DEFEAT EVERY ENEMY' : g === 'coins' ? 'COLLECT EVERY COIN' : g === 'nohit' ? 'DO NOT GET HIT' : 'BEAT THE CLOCK: ' + goalSecs(g) + ' SECONDS';
export const PLAYERS = [null, 'ally', 'p2'];
export const playersName = k => !k ? 'SOLO' : k === 'ally' ? 'WITH AN AI ALLY' : 'TWO PLAYERS (one keyboard / pads)';

/* (claude/maker) THE LEVEL'S STYLE (Daniel: "a generic tile for wood / castle / etc, selectable based on what asset type you select",
   Mario Maker's theme). null = the background's own ground. Plain GROUND wears the style, so changing it reskins the whole level;
   a cell stamped with SHIFT keeps the style it was painted in (doc.mat), so styles can still be mixed. */
export const STYLES = [null, 'grass', 'cobble', 'masonry', 'city', 'shore', 'reef', 'deck'];
export const STYLE_NAME = { grass: 'GRASS', cobble: 'VILLAGE COBBLE', masonry: 'CASTLE', city: 'CITY', shore: 'SHORE', reef: 'REEF', deck: 'SHIP' };
export const styleName = k => k ? STYLE_NAME[k] || k.toUpperCase() : "THE BACKGROUND'S OWN";
export const STYLE_COL = { grass: ['#7a5230', '#5aa33e'], cobble: ['#7d7a74', '#9a968c'], shore: ['#b49a72', '#d8c49a'], reef: ['#3f7a78', '#6fb0a0'], city: ['#4a4a58', '#6a6a7a'], masonry: ['#8b8378', '#b3aca0'], deck: ['#8a5a32', '#a8743f'] };

/* (claude/maker) THE SLOPE PIECE: press at one end, release at the other. The LOW end is the lower cell; the slope climbs toward the
   other one, a cell a row (steep) or two cells a row (gentle, when the drag is at least half again as wide as it is tall), and the
   ground fills in under it and under the top, so the ramp always stands on something. A click alone: one steep ramp, facing the
   ground beside it. */
let ramp = null;
export const isRampBrush = entry => !!entry && entry[1] === 'ramp';
export function rampStart(cur) { ramp = { ax: cur.x, ay: cur.y }; }
export const rampActive = () => !!ramp;
const groundBelow = (doc, x, y) => { let yy = y; while (yy < doc.H && !(isSolidId(doc.grid[yy * doc.W + x]) && !(doc.grid[yy * doc.W + x] >= 20 && doc.grid[yy * doc.W + x] <= 25))) yy++; return yy; };
export function rampCells(doc, a, b) {
  const out = [], W = doc.W, ok = x => x >= 1 && x <= W - 2;
  const put = (x, y, v) => { if (!ok(x) || y < 0 || y >= doc.H) return; out.push([x, y, v]); for (let yy = y + 1, end = groundBelow(doc, x, y + 1); yy < end && yy < doc.H; yy++) out.push([x, yy, T.SOLID]); };
  const h = Math.abs(a.y - b.y), dx = Math.abs(a.x - b.x);
  if (!h || !dx) { const solid = (x, y) => isSolidId(doc.grid[y * W + x]); put(a.x, a.y, !solid(a.x + 1, a.y) && solid(a.x - 1, a.y) ? SLOPE.L1 : SLOPE.R1); return out; }
  const low = a.y > b.y ? a : b, high = low === a ? b : a, dir = Math.sign(high.x - low.x), gentle = dx >= h * 1.5;
  for (let k = 0; k < h; k++) {
    const y = low.y - k;
    if (!gentle) put(low.x + dir * k, y, dir > 0 ? SLOPE.R1 : SLOPE.L1);
    else if (dir > 0) { put(low.x + 2 * k, y, SLOPE.R2A); put(low.x + 2 * k + 1, y, SLOPE.R2B); }
    else { put(low.x - 2 * k, y, SLOPE.L2A); put(low.x - 2 * k - 1, y, SLOPE.L2B); }
  }
  const topX = low.x + dir * (gentle ? 2 * h : h), topY = low.y - h + 1;   /* the ground the slope arrives on */
  if (ok(topX)) for (let yy = topY, end = groundBelow(doc, topX, topY); yy < end && yy < doc.H; yy++) out.push([topX, yy, T.SOLID]);
  return out;
}
export function rampEnd(doc, cur) {
  if (!ramp) return null; const a = { x: ramp.ax, y: ramp.ay }; ramp = null;
  const cells = rampCells(doc, a, cur), changed = [];
  for (const [x, y, v] of cells) { const i = y * doc.W + x, key = x + ',' + y; if (doc.grid[i] === v) continue; doc.grid[i] = v; changed.push([x, y]);
    if (doc.mat) delete doc.mat[key]; if (doc.sw) delete doc.sw[key]; if (doc.loot) delete doc.loot[key]; if (doc.crumble) { const j = doc.crumble.indexOf(key); if (j >= 0) doc.crumble.splice(j, 1); } }
  return changed;
}
export function drawRampPreview(g, doc, cx, cy, cur, time) {
  if (!ramp) return; const cells = rampCells(doc, { x: ramp.ax, y: ramp.ay }, cur);
  g.globalAlpha = 0.45 + 0.15 * Math.sin(time * 8);
  for (const [x, y, v] of cells) { const px = x * TS - cx, py = y * TS - cy; g.fillStyle = v === T.SOLID ? '#8fd160' : '#ffd36b';
    if (v === T.SOLID) g.fillRect(px, py, TS, TS);
    else { g.beginPath(); const rise = v === SLOPE.R1 || v === SLOPE.R2A || v === SLOPE.R2B, half = v === SLOPE.R2A || v === SLOPE.L2A ? 1 : v === SLOPE.R2B || v === SLOPE.L2B ? 2 : 0;
      const yl = half === 0 ? (rise ? TS : 0) : rise ? (half === 1 ? TS : TS / 2) : (half === 1 ? TS / 2 : 0), yr = half === 0 ? (rise ? 0 : TS) : rise ? (half === 1 ? TS / 2 : 0) : (half === 1 ? TS : TS / 2);
      g.moveTo(px, py + yl); g.lineTo(px + TS, py + yr); g.lineTo(px + TS, py + TS); g.lineTo(px, py + TS); g.closePath(); g.fill(); } }
  g.globalAlpha = 1;
}

/* (claude/maker) A GEAR on every placed piece that has settings (foes too, once one is set off its default), so SHIFT+CLICK is not
   a secret. Foes all FACE somewhere, so a gear on each would be noise: theirs shows when they are set (elite, facing left). */
export function drawGears(g, doc, cx, cy) {
  for (const e of doc.ents) { const rows = pieceRows(e); if (!rows.length) continue;
    if (FOES.includes(e.t) && !rows.some(r => !r.text && e[r.key] !== undefined && e[r.key] !== r.def)) continue;
    const x = e.x * TS - cx + 13, y = e.y * TS - cy + 1;
    g.fillStyle = '#1b1626'; g.fillRect(x - 3, y - 1, 7, 7); g.fillStyle = '#ffd36b';
    g.fillRect(x - 1, y - 1, 3, 1); g.fillRect(x - 1, y + 5, 3, 1); g.fillRect(x - 3, y + 1, 1, 3); g.fillRect(x + 3, y + 1, 1, 3); g.fillRect(x - 2, y, 5, 5); g.fillStyle = '#1b1626'; g.fillRect(x, y + 2, 1, 1); }
}

/* (claude/maker) PIECES A STYLE DOES NOT HOLD (Daniel: "the grass slopes don't make sense in a castle"). Slopes are cut from the
   style's own ground (engineMat), so they stay; what cannot be restyled and plainly belongs elsewhere is refused in that style
   and greyed in the palette. Pieces already placed stay (changing the style asks first). */
const STYLE_BAN = {
  masonry: [T.REED, T.PALISADE], city: [T.REED, T.PALISADE], deck: [T.REED, T.PALISADE, T.CLIMB, T.SOFT, 'poison'],
  reef: [T.PALISADE, T.ICE], shore: [T.ICE], cobble: [], grass: [],
};
export function styleBanned(style, cat, id) { if (!style || cat !== 0) return false; return (STYLE_BAN[style] || []).includes(id); }
export const bannedIn = (doc, style) => { const L0 = STYLE_BAN[style] || []; let n = 0; for (const v of doc.grid) if (L0.includes(v)) n++; return n; };

/* (claude/maker) THE ARROW SIGN: a post with a board pointing one of eight ways (dir 0 = right, counter-clockwise). Drawn by the
   maker in the editor and in play (the engine has no such piece); it is scenery, nothing touches it. */
export const ARROW_DIRS = ['RIGHT', 'UP-RIGHT', 'UP', 'UP-LEFT', 'LEFT', 'DOWN-LEFT', 'DOWN', 'DOWN-RIGHT'];
export function drawArrowSign(g, x, y, dir) {   // x, y: the foot of the post, on screen
  g.fillStyle = '#5a3a1e'; g.fillRect(x - 1, y - 14, 3, 14);
  g.fillStyle = '#3a2412'; g.fillRect(x - 9, y - 26, 19, 13); g.fillStyle = '#c8a26a'; g.fillRect(x - 8, y - 25, 17, 11);
  const a = -(dir || 0) * Math.PI / 4, c0 = Math.cos(a), s0 = Math.sin(a), cx = x + 0.5, cy = y - 19.5, pt = (u, v) => [cx + u * c0 - v * s0, cy + u * s0 + v * c0];
  g.fillStyle = '#7a1e12'; g.beginPath(); for (const [u, v] of [[-5, -1.2], [1, -1.2], [1, -3.5], [5.5, 0], [1, 3.5], [1, 1.2], [-5, 1.2]]) { const [px, py] = pt(u, v); g.lineTo(px, py); } g.closePath(); g.fill();
}
export function drawArrows(g, ents, cx, cy) { for (const e of ents || []) if (e.t === 'arrow') drawArrowSign(g, Math.round(e.x * TS + 8 - cx), Math.round((e.y + 1) * TS - cy), e.dir || 0); }
/* (claude/maker) WHO PLAYS IT: 'own' = each player's own saved hero (upgrades and all); a hero id = that hero on a STARTER KIT,
   the same for everyone. Only a starter-kit run can mark the level BEATEN (a strong save could clear what a fresh hero cannot).
   null = an older level: its own hero. */
export const ownHero = d => !d.hero || d.hero === 'own';
export const shareReady = d => ownHero(d) || isCleared(d);

/* (claude/maker) WARP DOORS: two doors, one way in and out of each other (a cave under the level, a tower's inside). A door has its
   own number (wid) and its partner's (pair), so it can be dragged anywhere and stay paired. */
export const WARP_COL = ['#ffd36b', '#6fb0ff', '#ff6b6b', '#8fd160', '#d8a0e8', '#e8e0c8'], WARP_NAMES = ['GOLD', 'BLUE', 'RED', 'GREEN', 'VIOLET', 'BONE'];
export const warpPartner = (ents, e) => e && e.pair ? ents.find(q => q.t === 'warp' && q.wid === e.pair && q !== e) || null : null;
export function pairWarps(doc, a, b) {
  for (const w of doc.ents) if (w.t === 'warp' && w !== a && w !== b && (w.pair === a.wid || w.pair === b.wid)) w.pair = 0;   /* their old partners are alone now */
  b.pair = a.wid; a.pair = b.wid; b.col = a.col || 0;
}
/* a new door: its number; the door before it still alone gets it as a partner (place two in a row: they pair themselves) */
export function placeWarp(doc, e) {
  e.wid = 1 + Math.max(0, ...doc.ents.filter(q => q.t === 'warp' && q !== e).map(q => q.wid || 0));
  const alone = doc.ents.filter(q => q.t === 'warp' && q !== e && !warpPartner(doc.ents, q)).pop();
  if (alone) { pairWarps(doc, alone, e); return true; }
  const used = new Set(doc.ents.filter(q => q.t === 'warp' && q !== e).map(q => q.col || 0)); e.col = [0, 1, 2, 3, 4, 5].find(k => !used.has(k)) ?? 0; return false;
}
export function drawWarps(g, ents, cx, cy, t, P) {
  for (const e of ents || []) { if (e.t !== 'warp') continue; const x = Math.round(e.x * TS - cx), y = Math.round((e.y + 1) * TS - cy), col = WARP_COL[e.col || 0], ok = !!warpPartner(ents, e);
    g.fillStyle = '#2a2236'; g.fillRect(x + 1, y - 26, 14, 26); g.fillRect(x + 3, y - 28, 10, 2);
    g.fillStyle = '#07060c'; g.fillRect(x + 3, y - 24, 10, 24);
    g.globalAlpha = ok ? 0.45 + 0.25 * Math.sin(t * 3 + e.x) : 0.2; g.fillStyle = col; g.fillRect(x + 4, y - 23, 8, 23); g.globalAlpha = 1;
    g.fillStyle = col; g.fillRect(x + 1, y - 26, 2, 26); g.fillRect(x + 13, y - 26, 2, 26); g.fillRect(x + 3, y - 28, 10, 2);
    if (P && ok && Math.abs(P.x - (e.x * TS + 8)) < 10 && Math.abs(P.y - (e.y + 1) * TS) < 14) { g.fillStyle = 'rgba(12,10,18,0.8)'; g.fillRect(x - 8, y - 42, 32, 10); g.fillStyle = col; g.font = '6px "Silkscreen"'; g.fillText('UP: GO', x - 5, y - 35); } }
}

/* (claude/maker) A SET OF LEVELS in one link (#S=): its name, its one hero, and every level, in order */
export async function setCode(name, hero, docs) { return b64u(await pipe(new TextEncoder().encode(JSON.stringify({ v: 1, set: true, name, hero, levels: docs.map(docToJSON) })), new CompressionStream('deflate-raw'))); }
export async function fromSetCode(code) {
  const c = String(code).trim().replace(/^.*#S=/, ''), o = JSON.parse(new TextDecoder().decode(await pipe(unb64u(c), new DecompressionStream('deflate-raw'))));
  if (!o || !o.set || !Array.isArray(o.levels) || !o.levels.length) throw new Error('not a set'); return { name: o.name || 'A SET', hero: o.hero || 'own', docs: o.levels.map(docFromJSON) };
}
export async function setLink(name, hero, docs) { return location.origin + location.pathname + '?maker=1#S=' + await setCode(name, hero, docs); }

/* (claude/maker) TRACKS (Daniel: platforms on curved tracks, as Mario Maker has). A moving platform's TRACK is a list of tile points
   starting where it stands; TOOLS > TRACK: click the platform, then click each point; click the platform again (or ENTER) to finish.
   The game runs it along a smooth curve through the points (Catmull-Rom), by distance, back and forth or round in a loop. */
export function trackCurve(pts, loop) {   // pts: [[x, y], ...] in any unit -> dense points along a smooth curve
  const n = pts.length; if (n < 2) return pts.slice(); const out = [], P = i => pts[loop ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = loop ? n : n - 1;
  for (let i = 0; i < segs; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < 12; k++) { const t = k / 12, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } }
  out.push(loop ? out[0].slice() : pts[n - 1].slice()); return out;
}
let trackSrc = null;
export const trackEditing = () => trackSrc;
export function trackClick(doc, cur, say) {
  const m = doc.ents.find(q => q.t === 'mover' && q.y === cur.y && cur.x >= q.x && cur.x < q.x + (q.len || 2));
  if (trackSrc && m === trackSrc) { const done = trackSrc; trackSrc = null; if (done.track.length < 2) delete done.track; say(done.track ? 'TRACK DONE: ' + (done.track.length - 1) + ' POINTS (SHIFT+CLICK THE PLATFORM: LOOP, SPEED)' : 'NO TRACK: IT MOVES AS BEFORE'); return true; }
  if (m) { trackSrc = m; m.track = [[m.x, m.y]]; say('TRACK: CLICK EACH POINT IT GOES THROUGH; CLICK THE PLATFORM AGAIN TO FINISH'); return true; }
  if (trackSrc) { trackSrc.track.push([cur.x, cur.y]); say('POINT ' + (trackSrc.track.length - 1) + ' (CLICK THE PLATFORM TO FINISH)'); return true; }
  say('CLICK A MOVING PLATFORM FIRST'); return false;
}
export function trackEnd() { if (trackSrc && trackSrc.track.length < 2) delete trackSrc.track; trackSrc = null; }
export function drawTracks(g, doc, cx, cy, t) {
  for (const e of doc.ents) { if (e.t !== 'mover' || !e.track || e.track.length < 2 && e !== trackSrc) continue;
    const pts = e.track.map(([x, y]) => [x * TS + (e.len || 2) * TS / 2 - cx, y * TS + 4 - cy]), d = trackCurve(pts, !!e.loop && e.track.length > 2);
    g.save(); g.strokeStyle = e === trackSrc ? '#ffffff' : '#6fd0c0'; g.lineWidth = 2; g.setLineDash([3, 3]); g.lineDashOffset = -t * 10; g.beginPath(); d.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); g.setLineDash([]);
    g.fillStyle = e === trackSrc ? '#ffffff' : '#6fd0c0'; for (const [x, y] of pts) g.fillRect(Math.round(x) - 2, Math.round(y) - 2, 4, 4); g.restore(); }
}

/* (claude/maker, the boss research 2026-11-09) WHAT A BOSS READS FROM ITS ARENA: each of these crashed or never woke in a plain made-by-hand
   arena because it reads a record its own level builds. Laid out here from the arena's columns (A0, A1) and floor row (F), from the
   home level's own numbers. What is NOT built (and so missing from the fight): the Chieftain's drums, Grubbag's coal trench, hook rails
   and conveyor, the Tomb King's plate traps, the Reefmaw's tide, the Wicker Queen's carousel - each fight runs and ends without them. */
const ARENA_EXTRA = {
  huntmaster: (A0, A1, F) => ({ huntmaster: true, perches: [[A0 + 4, A0 + 10, F - 4], [A1 - 10, A1 - 4, F - 4]] }),
  bzchief: (A0, A1, F) => ({ bzc: { sx: A0, R: F } }),
  reefmaw: (A0, A1, F) => ({ holes: [4, 14, 26, 36].map(d => Math.min(A1 - 1, A0 + d) * TS) }),
  strawking: (A0, A1, F) => ({ poles: [A0 + 5, A0 + 16, Math.min(A1 - 2, A0 + 37)] }),
  grubbag: (A0, A1, F) => ({ chair: A1 - 7, table: [A1 - 18, A1 - 15], oven: A0 + 2, bellows: A0 + 5, belt: [A0 + 7, A1 - 16, F - 2], plats: [[A0 + 8, A0 + 10, F - 4], [A0 + 11, A0 + 13, F - 6]], cauldron: [A1 - 17, Math.max(2, F - 11)] }),
  tombking: (A0, A1, F) => { const dx = A0 - 1007, dy = F - 24, X = c => c + dx, Y = r => r + dy;   /* the Sealed Pyramid's BOSS_SLOT, moved to this arena */
    return { tk: { x0: A0, x1: X(1046), floor: F, roof: Y(4), westDoor: { col: A0 - 1, y0: Y(18), y1: Y(23) }, eastDoor: { col: X(1047), y0: Y(18), y1: Y(23) }, gate: X(1049), check: X(1003),
      ledges: [{ x0: X(1009), x1: X(1014), y: Y(21) }, { x0: X(1039), x1: X(1044), y: Y(21) }],
      switches: [{ x: X(1008), y: Y(18), sweep: [X(1007), X(1022)], anchor: X(1016) }, { x: X(1045), y: Y(18), sweep: [X(1031), X(1046)], anchor: X(1037) }],
      plates: [[X(1017), X(1018)], [X(1026), X(1027)], [X(1035), X(1036)]], plateTraps: [['tkBlockW'], ['tkDartsW', 'tkDartsE'], ['tkBlockE']], plateReach: [[[X(1019), X(1023)]], [[X(1007), X(1025)], [X(1028), X(1046)]], [[X(1030), X(1034)]]],
      slots: [[X(1019), X(1023)], [X(1030), X(1034)]], alcoves: [X(1012), X(1021), X(1032), X(1041)], king: X(1032) } }; },
};
/* and what a few read from the LEVEL (src/main.js edLevelObj merges it): the Scarecrow King's moon, the Wicker Queen's green */
export function bossLevelExtra(doc) { return bossExtras(doc).rest; }
/* (claude/maker) THE REST OF A BOSS'S SETUP, as its own level lays it: the tide the Reefmaw and the Tide Herald fight in, the Chieftain's two
   war drums, the Coffin King's plate traps (block, darts), the Wicker Queen's carousel. { rest: level fields, pools, moversExtra, ents }.
   (Grubbag's hook rails and conveyor are tied to the kitchen's own column map and are not rebuilt: his fight runs without them.) */
export function bossExtras(doc) {
  const out = { rest: {}, pools: [], moversExtra: [], ents: [] }, a = arenaFor(doc); if (!a || a.boss === undefined) return out;
  const A0 = Math.round(a.x0 / TS), A1 = Math.round(a.x1 / TS) - 1, F = Math.round(a.floor / TS), k = a.boss;
  if (k === 'archmage') {   /* THE ARCHMAGE'S LIBRARY, as far as his fight reads it: the dais he stands on, the floor he floods, the stacks, the weight, the cage - and the acid that rises (L.mage, one magePool) */
    out.rest.mage = { shelves: [], locks: [], hung: [], dais: [A0 + 29, A0 + 37], flood: [A0 + 8, A0 + 29], stacks: [A0 + 11, A0 + 16, A0 + 21, A0 + 26], weight: A0 + 13, cage: [[A0 + 30, 2], [A0 + 38, 2]], outside: 64, skins: [], hedges: [], chains: [] };
    out.pools.push({ x0: (A0 + 8) * TS, x1: (A0 + 29) * TS, y: F * TS, base: F * TS, bottom: F * TS, dry: true, depth: 0, arenaTide: true, swim: true, clear: true, harm: true, foulCol: '#4a1e6a', wash: 0.5, acid: true, magePool: true }); }
  if (k === 'strawking') out.rest.fields = { moon: { lit: 7, warn: 2.8, dark: 3.4, first: 9 }, dusk: [30, 150] };
  if (k === 'reefmaw' || k === 'herald') out.pools.push({ x0: A0 * TS, x1: (A1 + 1) * TS, y: F * TS + 6, base: F * TS, swim: true, shallow: true, depth: 0, bottom: F * TS, arenaTide: true });
  if (k === 'bzchief') { out.rest.warcairn = true; out.rest.wcDrums = [6, 37].map((c, i) => ({ id: 'arena' + i, x: Math.min(A1 - 1, A0 + c), f: F - 1, gates: [], slabs: [], cornices: [], arena: true }));
    for (const d of out.rest.wcDrums) out.ents.push({ t: 'wcdrum', x: d.x, y: F - 1, id: d.id }); }
  if (k === 'tombking' && a.tk) { const S = a.tk, [pw, pm, pe] = S.plates, [sw, se] = S.slots; out.rest.sealedpyramid = true;
    out.rest.traps = [
      { id: 'tkBlockW', kind: 'block', plates: [[pw[0], pw[1], F]], zone: [sw[0], sw[1], S.roof, F - 1], slot: [sw[0], sw[1], S.roof - 2, S.roof - 1], land: F - 1, reset: 6.0, arena: true, tk: true, section: 'boss' },
      { id: 'tkBlockE', kind: 'block', plates: [[pe[0], pe[1], F]], zone: [se[0], se[1], S.roof, F - 1], slot: [se[0], se[1], S.roof - 2, S.roof - 1], land: F - 1, reset: 6.0, arena: true, tk: true, section: 'boss' },
      { id: 'tkDartsW', kind: 'darts', plates: [[pm[0], pm[1], F]], zone: [S.x0, pm[0] - 1, F - 2, F - 1], wall: S.westDoor.col, dir: 1, rows: [F - 2, F - 1], reset: 6.0, arena: true, tk: true, section: 'boss' },
      { id: 'tkDartsE', kind: 'darts', plates: [[pm[0], pm[1], F]], zone: [pm[1] + 1, S.x1, F - 2, F - 1], wall: S.eastDoor.col, dir: -1, rows: [F - 2, F - 1], reset: 6.0, arena: true, tk: true, section: 'boss' }];
    out.ents.push({ t: 'tplate', x: pw[0], y: F - 1, trap: 'tkBlockW' }, { t: 'tblock', x: sw[0], y: S.roof - 1, trap: 'tkBlockW' }, { t: 'tplate', x: pe[0], y: F - 1, trap: 'tkBlockE' }, { t: 'tblock', x: se[0], y: S.roof - 1, trap: 'tkBlockE' },
      { t: 'tplate', x: pm[0], y: F - 1, trap: 'tkDartsW' }, { t: 'dartwall', x: S.westDoor.col, y: F - 1, trap: 'tkDartsW' }, { t: 'dartwall', x: S.eastDoor.col, y: F - 1, trap: 'tkDartsE' }); }
  if (k === 'duneworm') {   /* THE DUNE WORM reads the caravan's state (his storm, the sun his ledges shade you from): the level borrows THE SUNKEN CARAVAN's rules
       (src/main.js keeps a made level's own ground: L.custom). The sun burns in his hollow only, as at home; the rest of the level is shade */
    out.rest.caravan = true; out.rest.shade = [[0, a.x0, 0, doc.H * TS], [a.x1, doc.W * TS, 0, doc.H * TS]]; }
  if (k === 'wickerqueen') { out.rest.green = { x0: A0 - 1, x1: A1 + 1, maypole: A0 + 21, bonfire: A0 + 24, floor: F, carousel: true }; out.rest.carousels = [];
    const ring = newRing(a); for (let i = 0; i < RING.horses; i++) { const h = horseAt(ring, i); out.moversExtra.push({ kind: 'carhorse', i, x: h.x - RING.w / 2, y: h.y, w: RING.w, h: RING.h, broken: !h.front }); } }
  return out;
}
