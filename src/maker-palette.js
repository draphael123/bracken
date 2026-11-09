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
  ['CRUMBLE LEDGE', 'crumble'], ['WATER (drag)', 'water'], ['SHALLOWS (drag)', 'shallows'], ['POISON (drag)', 'poison'],
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
  'lever', 'plate', 'key:brass', 'lockgate:brass', 'key:iron', 'lockgate:iron', 'key:bone', 'lockgate:bone',
  'pushblock', 'crusher', 'firevent', 'roller', 'rockfall', 'vent', 'firepit',
  'sign', 'torch', 'brazier', 'barrel', 'glow', 'puffball', 'lantern', 'npc'];
// a THING's palette id -> the entity it places (most are themselves; the two moving platforms are one engine kind)
const ENT_FOR = {
  mover: { t: 'mover', len: 2, range: 4, speed: 34 },                       // side to side, four tiles each way
  'mover:up': { t: 'mover', len: 2, vert: true, rise: 4, period: 3.2 },     // a lift: up four tiles and back
  'key:brass': { t: 'key', kind: 'brass' }, 'key:iron': { t: 'key', kind: 'iron' }, 'key:bone': { t: 'key', kind: 'bone' },
  'lockgate:brass': { t: 'lockgate', needs: 'brass', h: 4 }, 'lockgate:iron': { t: 'lockgate', needs: 'iron', h: 4 }, 'lockgate:bone': { t: 'lockgate', needs: 'bone', h: 4 },
  crusher: { t: 'crusher', every: 3 }, firevent: { t: 'firevent', every: 2.8 }, roller: { t: 'roller', face: -1, speed: 55 },
};
export const entFor = (id, x, y) => ({ ...(ENT_FOR[id] || { t: id }), x, y });
const THING_NAMES = { mover: 'MOVING PLATFORM', 'mover:up': 'LIFT', check: 'CHECKPOINT', gate: 'GOAL GATE', plate: 'PRESSURE PLATE',
  'key:brass': 'BRASS KEY', 'key:iron': 'IRON KEY', 'key:bone': 'BONE KEY', 'lockgate:brass': 'BRASS GATE', 'lockgate:iron': 'IRON GATE',
  'lockgate:bone': 'BONE GATE', pushblock: 'PUSH BLOCK', firevent: 'FIRE JET', roller: 'ROLLING PUFFBALL' };
export const thingName = id => THING_NAMES[id] || String(id).toUpperCase();

// names: the bestiary's, where it has one (main.js BEASTS), else the id in capitals
let NAMES = {};
export function setNames(beasts) { NAMES = {}; for (const b of beasts || []) if (b && b.t && b.name) NAMES[b.t] = b.name.replace(/^THE /, ''); }
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
export const terrainOf = doc => ({ crumble: [...(doc.crumble || [])], water: (doc.water || []).map(w => ({ ...w })), mat: { ...(doc.mat || {}) }, music: doc.music || null, time: doc.time || null, weather: doc.weather || null });
export function setTerrain(doc, t) { doc.crumble = t && t.crumble ? [...t.crumble] : []; doc.water = t && t.water ? t.water.map(w => ({ ...w })) : [];
  doc.mat = t && t.mat ? { ...t.mat } : {}; doc.music = (t && t.music) || null; doc.time = (t && t.time) || null; doc.weather = (t && t.weather) || null; }

// paint one cell with a TILES entry: returns the tile id to put in the grid
export function tilePaint(doc, tx, ty, entry) {
  const key = tx + ',' + ty, cr = doc.crumble || (doc.crumble = []), mat = doc.mat || (doc.mat = {});
  const i = cr.indexOf(key); if (i >= 0) cr.splice(i, 1);
  delete mat[key];
  if (isStr(entry[1]) && entry[1].startsWith('mat:')) { mat[key] = entry[1].slice(4); return T.SOLID; }
  if (entry[1] === 'crumble') { cr.push(key); return T.ONEWAY; }
  return isStr(entry[1]) ? T.AIR : entry[1];
}
// right-click: a crumble mark goes with its tile; a click inside water takes the whole pool away. True if water went.
export function terrainErase(doc, tx, ty) {
  const cr = doc.crumble || [], i = cr.indexOf(tx + ',' + ty); if (i >= 0) cr.splice(i, 1);
  if (doc.mat) delete doc.mat[tx + ',' + ty];
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
