// src/desert-rules.js — the rest of the desert arc's rules as pure modules (no DOM, no main.js), proved in tools/desert-rules.mjs.
// Who owns what (docs/desert-arc-brief.md): THE SANDSTORM is level 6's approach and THE SKELETON KING's phase 3; SANDFALLS are a
// hazard anywhere in the arc; THE WATERSKIN is level 2's rule (and cures sunstroke everywhere after it); MIRAGES are the open
// dunes' trick (levels 1 and 4).

// ================= THE SANDSTORM =================
/* A storm on a cycle: CALM -> WARN (the horizon browns, the sand starts to hiss, an arrow shows which way) -> GUST (a push
   along the ground, the view closes in) -> calm. A braced hero (holding block) is barely moved; a jump in a gust carries.
   The view never closes below STORM.sightMin: enough to see a foe's tell before it lands (C3: a hazard tells where and when). */
export const STORM = { calm: 3.2, warn: 1.4, gust: 1.6, push: 150, airPush: 1.3, brace: 0.07,   /* braced: under a tile over a whole gust (at 0.2 it was 2.4 tiles: bracing did not save you on a ledge) */
  sightCalm: 260, sightGust: 120, sightMin: 96 };
export function newStorm(dirs = [1, 1, -1]) { return { phase: 'calm', t: STORM.calm, dirs, i: 0, dir: dirs[0] }; }
export function stormStep(S, dt) {
  S.t -= dt;
  if (S.t <= 0) { if (S.phase === 'calm') { S.phase = 'warn'; S.t += STORM.warn; S.dir = S.dirs[S.i++ % S.dirs.length]; }
    else if (S.phase === 'warn') { S.phase = 'gust'; S.t += STORM.gust; } else { S.phase = 'calm'; S.t += STORM.calm; } }
  const into = S.phase === 'gust' ? Math.min(1, (STORM.gust - S.t) / 0.3, S.t / 0.3) : 0;   // it builds and dies over 0.3 s
  const sight = S.phase === 'gust' ? STORM.sightCalm - (STORM.sightCalm - STORM.sightGust) * into : S.phase === 'warn' ? STORM.sightCalm - 30 * (1 - S.t / STORM.warn) : STORM.sightCalm;
  return { phase: S.phase, dir: S.dir, warnLeft: S.phase === 'warn' ? S.t : 0, push: S.phase === 'gust' ? STORM.push * into : 0, sight: Math.max(STORM.sightMin, sight) };
}
/* the push on a body this frame: px/s to ADD to its x (not its vx: a gust is not your legs, and it should not fight the walk cap) */
export const gustDrift = (st, { braced = false, grounded = true } = {}) => st.dir * st.push * (braced && grounded ? STORM.brace : grounded ? 1 : STORM.airPush);

// ================= SANDFALLS =================
/* loose sand pouring off a ledge: a column {x0, x1, y0, y1} px. Inside it the sand drives you down: gravity doubled, a jump
   held under it and the walk slowed. You cannot climb THROUGH a sandfall; you go round it or wait at its edge. */
export const SANDFALL = { grav: 1.0, jumpCut: 0.55, walk: 0.55 };
export const inSandfall = (zones, x, y) => (zones || []).some(z => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1);
/* the knight's numbers under a sandfall, for his update to use this frame */
export const sandfallMods = inside => inside ? { gravAdd: 1000 * SANDFALL.grav, jumpK: SANDFALL.jumpCut, walkK: SANDFALL.walk } : { gravAdd: 0, jumpK: 1, walkK: 1 };

// ================= THE WATERSKIN (level 2: WATER IS CARRIED) =================
/* A skin you fill at wells (L.wells: [{ x, y }] tiles). Three sips. DRINK cures sunstroke outright. POUR softens a mud wall
   (L.mudWalls: [{ x0, x1, y0, y1 }] tiles -> air) or puts out a fire in front of you. The skin is the level's carried thing (F3). */
export const SKIN = { sips: 3, wellR: 24, pourR: 28 };
export const newSkin = () => ({ sips: 0 });
export function nearWell(L, x, y) { return (L.wells || []).some(w => Math.abs(w.x * 16 + 8 - x) <= SKIN.wellR && Math.abs((w.y + 1) * 16 - y) <= 20); }
export function fillAt(skin, L, x, y) { if (!nearWell(L, x, y)) return false; skin.sips = SKIN.sips; return true; }
export function drink(skin, sun) { if (skin.sips <= 0) return false; skin.sips--; sun.v = 0; sun.tick = 0.7; return true; }
/* pour in front of you (face +1/-1): returns what it did: 'mud' (and opens the wall in grid), 'fire' (index of the fire), or null */
export function pour(skin, L, x, y, face, fires = []) {
  if (skin.sips <= 0) return null;
  const hx = x + face * SKIN.pourR;
  const wall = (L.mudWalls || []).find(m => hx >= m.x0 * 16 - 4 && hx <= (m.x1 + 1) * 16 + 4 && y > m.y0 * 16 && y - 14 <= (m.y1 + 1) * 16);
  if (wall && !wall.open) { skin.sips--; wall.open = true; for (let ty = wall.y0; ty <= wall.y1; ty++) for (let tx = wall.x0; tx <= wall.x1; tx++) L.grid[ty * L.W + tx] = 0; return 'mud'; }
  const f = fires.findIndex(fr => !fr.out && Math.abs(fr.x - hx) <= 16 && Math.abs(fr.y - y) <= 24);
  if (f >= 0) { skin.sips--; fires[f].out = true; return 'fire'; }
  return null;
}

// ================= MIRAGES =================
/* Something shimmering on the dunes that is not there: an oasis, a ledge, a wagon. It fades as you come to it and is never
   footing (it is an ent, not a tile: reachcore and moveBody never see it). A REAL oasis never shimmers; a mirage always does -
   the tell that lets a player who is looking read it before they walk to it. */
export const MIRAGE = { far: 150, near: 60, shimmer: 1 };
export function mirageAlpha(m, px) { const d = Math.abs(m.x - px); return d >= MIRAGE.far ? 1 : d <= MIRAGE.near ? 0 : (d - MIRAGE.near) / (MIRAGE.far - MIRAGE.near); }
export const mirageShimmer = (m, time) => m.mirage ? Math.sin(time * 9 + m.x * 0.05) * MIRAGE.shimmer : 0;
