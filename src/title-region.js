// src/title-region.js - THE TITLE SCREEN BY REGION (claude/titleregion, 2026-10-11). Pure: no page, no canvas, no save writes.
//
// The title screen shows how far the LAST-PLAYED save slot has got: its backdrop, its wash of colour and its menu music follow the
// FURTHEST REGION that slot has reached on the road. A new player (or an empty slot) gets the first region, which is the title as it
// always was. main.js asks regionAt() for the id and keeps the baked layers; this file only answers WHICH region and holds the table.
//
// WHICH LEVEL IS "FURTHEST": the deepest level on the gate chain (src/campaign-order.js depthsOf) that the slot has CLEARED or has
// UNLOCKED (its gate is cleared). A spur level (the Burning Village, Stormwreck Harbor, the Lit Church, the Unburied Field, the
// Undercrown) is not named in SPINE: it takes the region of the level it hangs off, found by walking its gate chain up, so a new level
// needs no edit here unless it opens a new region.
import { depthsOf, gateOf } from './campaign-order.js';

/* THE REGIONS IN ROAD ORDER. `music` is the region's own existing track (a track the slot has not heard falls back, see main.js, so the
   title never unlocks a Sound Test row); `wash` is the multiply wash laid over the picture; `sky/far/near` name the existing baker the
   backdrop reuses (main.js titleLayers maps the names). The last three are HOOKS: they have no levels yet, so nothing reaches them -
   when the frost, volcano and demon levels land, give each level `titleRegion: 'frost'` (or add it to SPINE) and fill that row's art. */
export const REGIONS = [
  { id: 'forest',  name: 'THE WOOD',        music: 'theme',     wash: 'rgba(120,80,140,0.45)', sky: 'dusk',   far: 'wood',   near: 'wood' },
  { id: 'marsh',   name: 'THE MARSH',       music: 'marsh',     wash: 'rgba(96,120,120,0.50)', sky: 'dusk',   far: 'wood',   near: 'marsh' },
  { id: 'fungus',  name: 'THE DEEP WOOD',   music: 'sporewood', wash: 'rgba(110,70,150,0.50)', sky: 'dusk',   far: 'wood',   near: 'mushroom' },
  { id: 'crag',    name: 'THE CRAGS',       music: 'mountain',  wash: 'rgba(130,90,150,0.40)', sky: 'crag',   far: 'crag',   near: 'crag' },
  { id: 'mine',    name: 'THE MINES',       music: 'oreroad',   wash: 'rgba(150,100,70,0.50)', sky: 'night',  far: 'crag',   near: 'crag' },
  { id: 'storm',   name: 'STORMHOLD',       music: 'stormhold', wash: 'rgba(80,90,130,0.50)',  sky: 'storm',  far: 'crag',   near: 'crag' },
  { id: 'coast',   name: 'THE COAST',       music: 'longwater', wash: 'rgba(80,120,150,0.45)', sky: 'sea',    far: 'sea',    near: 'shore' },
  { id: 'canal',   name: 'THE RIVER ROAD',  music: 'canal',     wash: 'rgba(150,140,130,0.45)', sky: 'teal',  far: 'town',   near: 'town' },
  { id: 'inland',  name: 'THE DEAD FIELDS', music: 'fields',    wash: 'rgba(90,100,130,0.50)', sky: 'fields', far: 'fields', near: 'fields' },
  { id: 'desert',  name: 'THE DESERT',      music: 'welltown',  wash: 'rgba(200,130,80,0.35)', sky: 'desert', far: 'mesas',  near: 'dunes' },
  /* HOOKS - no levels reach these yet (the frost country, the volcano, the demon act). Until their art lands they borrow the desert's
     backdrop so a stray id still draws something. */
  { id: 'frost',   name: 'THE FROST',       music: 'snow',      wash: 'rgba(120,160,200,0.45)', sky: 'desert', far: 'mesas',  near: 'dunes', hook: true },
  { id: 'volcano', name: 'THE VOLCANO',     music: 'theme',     wash: 'rgba(200,80,40,0.50)',  sky: 'desert', far: 'mesas',  near: 'dunes', hook: true },
  { id: 'demon',   name: 'THE DEMON COURT', music: 'theme',     wash: 'rgba(160,30,40,0.50)',  sky: 'desert', far: 'mesas',  near: 'dunes', hook: true },
];
export const REGION_ORDER = REGIONS.map(r => r.id);

/* THE SPINE: the levels that open a stretch of the road. A level not named here takes the region of its gate (walked up the chain). */
export const SPINE = {
  wood: 'forest', marsh: 'marsh', spore: 'fungus', scree: 'crag', oreroad: 'mine', storm: 'storm', longwater: 'coast',
  waymeet: 'canal', fields: 'inland', caravan: 'desert',
};

/* the region of one level: its own `titleRegion`, else the spine entry at or above it on its gate chain, else the first region */
export function regionOfLevel(levels, id) {
  const byId = new Map(levels.map(l => [l.id, l]));
  for (let cur = id, n = 0; cur && n < 80; n++) {
    const lv = byId.get(cur); if (!lv) break;
    if (lv.titleRegion && REGION_ORDER.includes(lv.titleRegion)) return lv.titleRegion;
    if (SPINE[cur]) return SPINE[cur];
    cur = gateOf(lv);
  }
  return 'forest';
}

/* THE REGION A SLOT HAS REACHED. `cleared(id)` reads the slot (PROG[id].cleared); nothing is written. Returns a REGIONS id. */
export function regionAt(levels, cleared) {
  const real = levels.filter(l => !l.hidden && !/^(trial_|shop)/.test(l.id) && l.id !== 'custom');
  const depth = depthsOf(real), byId = new Map(real.map(l => [l.id, l]));
  let best = null, bd = -1;
  for (const l of real) {
    const d = depth[l.id]; if (d == null || d <= bd) continue;
    const g = gateOf(l), open = cleared(l.id) || (g && byId.has(g) && cleared(g));
    if (open) { best = l.id; bd = d; }
  }
  if (best == null) return 'forest';
  /* two regions can interleave on a spur (a spur is deeper than its spine); take the furthest region by ORDER among everything open */
  let rid = regionOfLevel(real, best);
  for (const l of real) { const g = gateOf(l); if (cleared(l.id) || (g && byId.has(g) && cleared(g))) { const r = regionOfLevel(real, l.id); if (REGION_ORDER.indexOf(r) > REGION_ORDER.indexOf(rid)) rid = r; } }
  return rid;
}
export const regionById = id => REGIONS.find(r => r.id === id) || REGIONS[0];
