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

export const TILES = [
  ['ERASE', T.AIR], ["GROUND (THE BACKGROUND'S OWN)", T.SOLID],
  // GROUND MATERIALS (Daniel 2026-11-09: "why do we only have one tile texture"): solid ground drawn in another place's
  // own skin, so one level can mix them. doc.mat marks the cell; resolveTiles reads L.mat (made-by-hand woods only).
  ['GRASS GROUND', 'mat:grass'], ['COBBLE', 'mat:cobble'], ['SHORE ROCK', 'mat:shore'], ['REEF ROCK', 'mat:reef'],
  ['CITY STONE', 'mat:city'], ['CASTLE STONE', 'mat:masonry'], ['SHIP DECK', 'mat:deck'],
  ['LEDGE', T.ONEWAY], ['SPIKES', T.SPIKE], ['CRATE', T.CRATE],
  ['SLOPE UP', SLOPE.R1], ['SLOPE DOWN', SLOPE.L1],
  ['GENTLE UP 1', SLOPE.R2A], ['GENTLE UP 2', SLOPE.R2B], ['GENTLE DOWN 1', SLOPE.L2B], ['GENTLE DOWN 2', SLOPE.L2A],
  ['PLANK', T.PLANK], ['ROPE LADDER', T.NET], ['SPRING', T.BOUNCER], ['SHELF', T.SHELF], ['DOOR', T.PORT],
  ['ROCK FACE', T.CLIMB], ['RAIL', T.RAIL], ['SOFT ROCK', T.SOFT], ['ICE', T.ICE], ['WEB', T.WEB], ['CRYSTAL', T.CRYST],
  ['REEDS', T.REED], ['PALISADE', T.PALISADE],
  // TERRAIN BRUSHES (string ids: not tiles, see tilePaint / the rectangle brushes below)
  ['RED BLOCK (solid until switched)', 'sw:red'], ['BLUE BLOCK (solid once switched)', 'sw:blue'],
  ['HILL (ramps itself)', 'hill'], ['CRUMBLE LEDGE', 'crumble'], ['WATER (drag)', 'water'], ['SHALLOWS (drag)', 'shallows'], ['POISON (drag)', 'poison'],
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

export const THINGS = ['coin', 'silver', 'check', 'gate', 'mover', 'mover:up',
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
const THING_NAMES = { mend: 'HEART', switch: 'SWITCH', mover: 'MOVING PLATFORM', 'mover:up': 'LIFT', check: 'CHECKPOINT', gate: 'GOAL GATE', plate: 'PRESSURE PLATE',
  'key:brass': 'BRASS KEY', 'key:iron': 'IRON KEY', 'key:bone': 'BONE KEY', 'lockgate:brass': 'BRASS GATE', 'lockgate:iron': 'IRON GATE',
  'lockgate:bone': 'BONE GATE', pushblock: 'PUSH BLOCK', firevent: 'FIRE JET', roller: 'ROLLING PUFFBALL' };
export const thingName = id => THING_NAMES[id] || String(id).toUpperCase();

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
export const terrainOf = doc => ({ crumble: [...(doc.crumble || [])], water: (doc.water || []).map(w => ({ ...w })), mat: { ...(doc.mat || {}) }, sw: { ...(doc.sw || {}) }, loot: { ...(doc.loot || {}) }, music: doc.music || null, time: doc.time || null, weather: doc.weather || null, hero: doc.hero || null, goal: doc.goal || null, players: doc.players || null, cleared: doc.cleared || null });
export function setTerrain(doc, t) { doc.crumble = t && t.crumble ? [...t.crumble] : []; doc.water = t && t.water ? t.water.map(w => ({ ...w })) : [];
  doc.mat = t && t.mat ? { ...t.mat } : {}; doc.sw = t && t.sw ? { ...t.sw } : {}; doc.loot = t && t.loot ? { ...t.loot } : {}; doc.hero = (t && t.hero) || null; doc.music = (t && t.music) || null; doc.time = (t && t.time) || null; doc.weather = (t && t.weather) || null;
  doc.goal = (t && t.goal) || null; doc.players = (t && t.players) || null; doc.cleared = (t && t.cleared) || null; }

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
    const o = { ...e }; if (!LINKERS.has(e.t)) return o;
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
  const e = doc.ents.find(q => q.x === cur.x && q.y === cur.y && LINKERS.has(q.t));
  if (e) { linkSrc = e; say((e.t === 'lever' ? 'LEVER' : 'PLATE') + ': NOW CLICK THE DOOR IT OPENS'); return; }
  if (linkSrc && doc.grid[cur.y * doc.W + cur.x] === PORT) { linkSrc.link = cur.x; say('LINKED'); linkSrc = null; return; }
  say(linkSrc ? 'THAT IS NOT A DOOR TILE: CLICK A DOOR' : 'CLICK A LEVER OR A PRESSURE PLATE FIRST');
}
// the editor shows every link: a line from the lever / plate to the door column it opens
export function drawLinks(g, doc, cx, cy, t) {
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
  }
  return out;
}
export function drawProblems(g, doc, cx, cy, t, text) {
  const ps = problems(doc), a = 0.6 + 0.4 * Math.sin(t * 8);
  for (const { e, why } of ps) { const x = e.x * TS - cx, y = e.y * TS - cy;
    g.globalAlpha = a; g.strokeStyle = '#ff4a4a'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, TS - 2, TS - 2); g.globalAlpha = 1;
    text(why === 'buried' ? 'BURIED' : 'NO WATER', x + 8, y - 8, '#ff6b6b', 'center', 6); }
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
  if (e.t === 'mover' && e.vert) return [
    { key: 'rise', label: 'HOW HIGH', values: [1, 2, 3, 4, 5, 6, 8, 10], show: tiles, def: 4 },
    { key: 'period', label: 'ONE TRIP TAKES', values: [2, 2.5, 3.2, 4, 5, 6], show: secs, def: 3.2 },
    { key: 'len', label: 'WIDTH', values: [1, 2, 3, 4], show: tiles, def: 2 }];
  if (e.t === 'mover') return [
    { key: 'range', label: 'HOW FAR', values: [1, 2, 3, 4, 6, 8, 10, 12], show: tiles, def: 4 },
    { key: 'speed', label: 'SPEED', values: [20, 34, 50, 70], show: v => ({ 20: 'SLOW', 34: 'STEADY', 50: 'QUICK', 70: 'FAST' })[v], def: 34 },
    { key: 'len', label: 'WIDTH', values: [1, 2, 3, 4], show: tiles, def: 2 }];
  if (e.t === 'sign') return [{ key: 'text', label: 'IT SAYS', text: true }];
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
  const d = { W: o.W, H: o.H, grid: unrle(o.grid, o.W * o.H), ents: o.ents || [], theme: o.theme || 0, name: o.name || 'A SHARED WOOD', start: o.start || { x: 3, y: 19 } };
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
  if (e.t !== 'mover') return null;
  return e.vert ? { x: e.x, y: e.y - (e.rise || 0), e, kind: 'rise' } : { x: e.x + (e.len || 2) + (e.range || 0) - 1, y: e.y, e, kind: 'range' };
}
export function handleAt(doc, c) { for (const e of doc.ents) { const h = handleOf(e); if (h && h.x === c.x && h.y === c.y && (h.e.range || h.e.rise)) return h; } return null; }
export function dragHandle(h, c) {
  if (h.kind === 'range') h.e.range = Math.max(1, Math.min(30, c.x - h.e.x - (h.e.len || 2) + 1));
  else h.e.rise = Math.max(1, Math.min(20, h.e.y - c.y));
}
// moving a placed piece: where it may go (not into the ground, not onto another piece; a locked gate stays with its bars)
export const movable = e => e.t !== 'lockgate';
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
  0: 'Empty air: paints a gap.', 1: "Solid ground in this background's own look.", 2: 'A ledge: jump up through it, stand on top.', 3: 'Spikes: they hurt.',
  4: 'A crate: solid, and breakable.', 8: 'A plank to stand on.', 9: 'A rope ladder: climb it.', 10: 'A spring: it throws you high.', 11: 'A shelf to stand on.',
  12: 'A door: a lever or pressure plate opens it.', 13: 'A rock face: a wall.', 14: 'A rail.', 15: 'Soft rock: a heavy blow breaks it.', 16: 'Ice: slippery.',
  17: 'A web: it slows you.', 18: 'Crystal: solid.', 5: 'Reeds: you walk through them.', 7: 'A palisade: a wooden wall.',
  20: 'A steep slope up.', 21: 'A steep slope down.', 22: 'A gentle slope up (first half).', 23: 'A gentle slope up (second half).', 24: 'A gentle slope down (second half).', 25: 'A gentle slope down (first half).',
  hill: 'Paint the top of the ground: it fills down, and every one-tile step becomes a ramp.', crumble: 'Holds a moment after you land, then falls. Comes back on a retry.', water: 'Water to swim in. Drag a box.', shallows: 'Wading water, one row deep. Drag a box.', poison: 'Poisoned water: it hurts. Drag a box.',
  coin: 'A coin.', silver: 'A silver coin: the rare one.', check: 'A checkpoint: you come back here when you fall.', gate: 'The goal. Every level needs one.',
  mover: 'A platform that slides side to side. Drag its gold handle to set how far.', 'mover:up': 'A lift that rises and sinks. Drag its gold handle to set how high.',
  lever: 'Hit it with your sword: it opens its door.', plate: 'Stand on it (or push a block onto it): it opens its door.',
  key: 'Pick it up to open the gate of the same metal.', lockgate: 'A locked gate: the key of its metal opens it.', pushblock: 'A block you can push, onto a plate or into a gap.',
  crusher: 'Drops from above on a beat. Do not be under it.', firevent: 'Spits fire on a beat. Jump it.', roller: 'Rolls along the floor. Jump it.',
  rockfall: 'Rocks fall here on a beat.', vent: 'A blast of air on a beat: it lifts you.', firepit: 'A fire pit that flares on a beat.',
  mend: 'A heart: it heals you.', switch: 'Hit it: every RED block and every BLUE block swap.', 'sw:red': 'Solid until a SWITCH is hit, then gone (and back again).', 'sw:blue': 'Empty until a SWITCH is hit, then solid (and gone again).',
  sign: 'A sign with your words on it.', torch: 'A torch: light.', brazier: 'A brazier: light.', barrel: 'A barrel.', glow: 'A glow: light in the dark.', puffball: 'A puffball: it bursts.',
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
  { say: 'MAKE A HILL: SLOPES & WATER > HILL, then paint a few tops above the floor', done: d => d.grid.some(v => v >= 20 && v <= 25) },
  { say: 'PUT THE GOAL GATE near the far end: ITEMS > GOAL GATE', done: d => d.ents.some(e => e.t === 'gate') },
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
    for (const x of [18, 24, 30, 36]) { put(d, x, 19, T.SOLID); put(d, x + 1, 19, T.SOLID); for (let y = 20; y <= 25; y++) { put(d, x, y, T.SOLID); put(d, x + 1, y, T.SOLID); } }
    for (let x = 14; x <= 40; x++) { d.mat[x + ',26'] = 'deck'; }
    box(d, 50, 50, 14, 19, T.PORT); box(d, 62, 62, 14, 19, T.PORT); box(d, 74, 74, 14, 19, T.PORT);
    for (let x = 44; x <= 90; x++) d.mat[x + ',20'] = 'cobble';
    d.ents = [{ t: 'gate', x: 104, y: 19 }, { t: 'puffer', x: 22, y: 23 }, { t: 'eel', x: 33, y: 24 }, entFor('lever', 46, 19), entFor('plate', 58, 19), entFor('pushblock', 55, 19),
      entFor('lever', 70, 19), { t: 'sprig', x: 66, y: 19 }, { t: 'hound', x: 84, y: 19, face: -1 }, { t: 'check', x: 44, y: 19 }, ...[20, 26, 32, 38].map(x => ({ t: 'coin', x, y: 17 }))];
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
export const BOSSES = ['oldtusker', 'chief', 'owl', 'mother', 'king', 'windcaller', 'lance', 'gqueen', 'herald', 'tollmaster', 'grandmother', 'bellcrab', 'drownedking',
  'harbormaster', 'closedhelm', 'prince', 'burieddead', 'pyromancer', 'bloodknight', 'roc', 'bogtroll', 'hornetqueen', 'batteringbeast'];
FOES.push(...BOSSES);   // placed like foes (cat 1); the BOSSES tab and tools/maker-sweep.mjs keep them apart
export const isBoss = t => BOSSES.includes(t) || !!ARENA[t] && BOSS_TRIAL.has(t);
const BOSS_TRIAL = new Set();   /* the sweep may try a candidate that is not in BOSSES yet */
export function trialBoss(t, on) { if (on) BOSS_TRIAL.add(t); else BOSS_TRIAL.delete(t); }
export function arenaFor(doc) {
  const e = doc.ents.find(q => isBoss(q.t)); if (!e) return null;
  const info = ARENA[e.t] || {}, w = Math.max(24, Math.min(48, Math.round(info.w || 36)));
  const x0 = Math.max(3, Math.min(doc.W - w - 4, e.x - Math.round(w * 0.65))), x1 = x0 + w;
  return { x0: x0 * TS, x1: x1 * TS, floor: (e.y + 1) * TS, trigger: (x0 + 3) * TS, wallL: x0 - 1, wallR: x1 + 1, boss: e.t,
    music: info.music, tint: info.tint || '#c9463d', tintA: info.tintA || 0.1, fx: info.fx, maker: true };
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
  doc.grid = g2; doc.H = H2; doc.ents = doc.ents.filter(e => e.y + dh >= 0).map(e => ({ ...e, y: e.y + dh })); doc.start = { x: doc.start.x, y: Math.max(0, doc.start.y + dh) };
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
  const str = d.W + 'x' + d.H + '|' + d.theme + '|' + d.start.x + ',' + d.start.y + '|' + JSON.stringify(d.ents) + '|' + JSON.stringify(t);
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
