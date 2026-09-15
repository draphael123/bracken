// src/floatlab.js — WHAT IS IN THE AIR, BY ITS PIXELS.  await BK.floatLab()  /  node tools/headless.mjs floats
//
// tools/floaters.mjs reads the level lists, and a level list is not the picture. A street lamp whose ent stands on the
// paving can still be drawn with its foot a row up; a diving bell whose ent is on the grass can be a drawing of a bell on
// a chain with nothing under it; a post on a ledge can be drawn straight down through the ledge. None of that is in the
// numbers. This loads every level, takes every sprite the draw code puts down with a base or a top (BK.drawables), finds
// the lowest and highest OPAQUE rows of each sprite, and asks the tiles:
//   STANDS  the row under its lowest pixel is the top of a floor it can stand on, within three pixels
//   HANGS   the row over its highest pixel is rock (or it runs up into the rock)
//   PIERCED no post runs through the inside of a solid tile, or through the boards of a ledge, above its own foot
// and then, in every level with water creatures, runs the level and asks whether each eel, angler and urchin is still
// in its water - over a tide going out as well as coming in - and each turtle, crab, heron, netter and sailor still by it.
import { LEVELS, T, TS } from './level.js';

const SOLID = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);
const LEDGE = new Set([T.ONEWAY, T.REED, T.PLANK, T.BOUNCER, T.SHELF, T.RAIL, T.CRYST]);
const INWATER = new Set(['eel', 'angler', 'urchin']), BYWATER = new Set(['turtle', 'crab', 'heronfoe', 'netter', 'sailor']);
// WHAT HOLDS UP THE LEDGE IT GOES THROUGH: a stilt under a hut's boards, a post under a bridge, a mast through a deck
const HOLDS_UP = new Set(['stilt', 'bridgepost', 'bridgetower', 'pierPost', 'column', 'mastTall', 'mastStump']);

const shapes = new WeakMap();
function shape(c) {   /* the opaque pixels of a baked sprite, once */
  if (shapes.has(c)) return shapes.get(c);
  const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data, px = [];
  let top = h, bot = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 40) { px.push(x, y); if (y < top) top = y; if (y > bot) bot = y; }
  const s = { w, h, px, top, bot, foot: [], head: [] };
  for (let i = 0; i < px.length; i += 2) { if (px[i + 1] >= bot - 1) s.foot.push(px[i]); if (px[i + 1] <= top + 1) s.head.push(px[i]); }
  shapes.set(c, s); return s;
}

export async function floatLab(BK, o = {}) {
  const want = o.levels || null, hits = [], water = [], spots = [];   /* spots: the world box of each sprite hit, to look at */
  const idx = LEVELS.map((l, i) => i).filter(i => { const l = LEVELS[i]; return (!l.hidden || l.secret) && l.id !== 'custom' && (!want || want.includes(l.id)); });
  let sprites = 0;
  for (const i of idx) {
    const id = LEVELS[i].id;
    try { BK.load(i); } catch (e) { hits.push(id + ': will not load: ' + e.message); continue; }
    const L = BK.L, W = L.W, H = L.H;
    const tile = (tx, ty) => (tx < 0 || tx >= W) ? T.SOLID : (ty < 0 || ty >= H) ? T.AIR : L.grid[ty * W + tx];
    const solid = (tx, ty) => SOLID.has(tile(tx, ty)), ledge = (tx, ty) => LEDGE.has(tile(tx, ty));
    const bad = [];
    for (const d of BK.drawables()) {
      if (!d.c || !d.c.width || (!d.stand && !d.hang)) continue;
      const s = shape(d.c); if (s.bot < 0) continue; sprites++;
      const at = Math.round(d.x / TS) + ',' + Math.round((d.y + s.bot) / TS);
      if (d.stand) {
        const fy = d.y + s.bot + 1, ty = Math.round(fy / TS), gap = ty * TS - fy;
        const cols = [...new Set(s.foot.map(x => Math.floor((d.x + x) / TS)))];
        const onFloor = Math.abs(gap) <= 3 && cols.some(tx => (solid(tx, ty) || ledge(tx, ty)) && !solid(tx, ty - 1));
        if (!onFloor) { bad.push(d.what + '@' + at + (gap > 3 ? ' floats ' + gap + 'px' : gap < -3 ? ' sunk ' + -gap + 'px' : ' has no floor')); spots.push({ id, i, x: d.x, y: d.y, w: s.w, h: s.h }); continue; }
        if (HOLDS_UP.has(d.what)) continue;
        // A POST THROUGH A LEDGE: an opaque pixel above its own foot inside a solid tile, or in a ledge's boards
        let n = 0; const narrow = s.w <= 24;
        for (let k = 0; k < s.px.length; k += 2) { const wx = d.x + s.px[k], wy = d.y + s.px[k + 1]; if (wy >= fy - 3) continue;
          const tx = Math.floor(wx / TS), ty2 = Math.floor(wy / TS);
          if ((!d.bg && solid(tx, ty2)) || ((!d.bg || narrow) && ledge(tx, ty2) && wy - ty2 * TS < 5)) n++; }
        if (n > 4) { bad.push(d.what + '@' + at + ' runs through the ground (' + n + 'px)'); spots.push({ id, i, x: d.x, y: d.y, w: s.w, h: s.h }); }
      } else {
        const hy = d.y + s.top, ty = Math.round(hy / TS);
        const cols = [...new Set(s.head.map(x => Math.floor((d.x + x) / TS)))];
        const held = cols.some(tx => solid(tx, Math.floor(hy / TS)) || (Math.abs(hy - ty * TS) <= 3 && (solid(tx, ty - 1) || ledge(tx, ty - 1))));
        if (!held) { bad.push(d.what + '@' + Math.round(d.x / TS) + ',' + Math.round(hy / TS) + ' hangs from nothing'); spots.push({ id, i, x: d.x, y: d.y, w: s.w, h: s.h }); }
      }
    }
    for (const b of bad) hits.push(id + ': ' + b);
    // THE WATER: run it, and look every second whether the swimmers are in it and the waders are by it
    const foes = () => BK.enemies().filter(e => e.alive && (INWATER.has(e.t) || BYWATER.has(e.t)));
    if (o.water !== false && foes().length && (L.pools || []).length) {
      BK.state = 'play'; BK.god = true; const P = BK.P, seen = new Set();
      const frames = o.frames || 60 * 24;
      for (let f = 0; f < frames; f += 60) {
        const k = Math.floor(f / 60) % 8; P.hp = P.maxHp; if (k === 0) { const e0 = foes()[(f / 60 / 8) % Math.max(1, foes().length) | 0]; if (e0) { P.x = e0.x + 40; P.y = e0.y; P.vx = P.vy = 0; } }   /* stand by one of them, so it has someone to chase */
        BK.sim(60);
        for (const e of foes()) {
          const pl = (L.pools || []).find(p => { const bot = p.bottom !== undefined ? p.bottom : p.y + 60; return (p.swim || (e.leap && !p.shallow)) && e.x >= p.x0 - 1 && e.x <= p.x1 + 1 && e.y >= Math.min(p.y, bot - 6) - 2 && e.y <= bot + 2; });   /* on the bed of water that has gone out is in it; a river eel (leap) lives under deep water nobody swims */
          let why = null;
          if (INWATER.has(e.t) && !(e.leap && e.mode === 'leap')) { if (!pl) why = 'out of the water (y ' + Math.round(e.y) + ', its water ' + (e.pool ? Math.round(e.pool.y) + '..' + Math.round(e.pool.bottom !== undefined ? e.pool.bottom : e.pool.y + 60) + ' x ' + Math.round(e.pool.x0) + '..' + Math.round(e.pool.x1) : 'none') + ', ' + e.mode + ')'; else if (solid(Math.floor(e.x / TS), Math.floor((e.y - (e.h || 8) / 2) / TS))) why = 'inside the rock'; }
          else if (e.shore && (e.x < e.shore.x0 - TS * 2 || e.x > e.shore.x1 + TS * 2) && !e.homing) why = 'off on dry land and not going back';
          const key = e.t + why + Math.round(e.hx || 0);
          if (why && !seen.has(key)) { seen.add(key); water.push(id + ': ' + e.t + '@' + Math.round(e.x / TS) + ',' + Math.round(e.y / TS) + ' ' + why + ' at ' + (f / 60 + 1) + 's'); }
        }
      }
      BK.god = false;
    }
  }
  const out = { levels: idx.length, sprites, hits, water, spots, bad: hits.length + water.length };
  window.__floatLab = out; return out;
}
