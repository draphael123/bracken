/* THE RELICS ARE GONE (Daniel 2026-10-02: "no relic rewards"; the level-up card replaces the power they gave).
   WHAT PAYS NOW. A relic's cache pays one of the level's three SILVERS instead (a level still holds exactly three: the vault's
   silver is one of them, never a fourth). VAULT_SILVER names each former relic spot that moved a silver in:
     idx   which of the level's silvers (its order in L.ents, the progress bit 1 << idx) now lies in the vault. The silver is MOVED, not
           added, so every save keeps what it had: the bit that was set stays set, the level still holds three.
     add   the level held fewer than three (Gale Moor: one), so the vault's silver is a new one; extra: more silvers appended after it
           to make the three (Daniel 10-04: Gale Moor holds three; the third lies in the dead-end valley at 416,22, off the road, base movement).
   A former relic spot that is NOT listed here is a 'vault' marker with no silver to move: it already had a silver in the same cache (the
   Stockade's ravine net, the Scree's fleece, the Rookery's nest, the fair's back lot), so the marker is simply dropped; the two boss drops
   (the Maypole Ribbon, the Cut String) were hidden relics, and are cut without a marker.
   WHY NO ROUTE RELIC STAYS (tools/relics.mjs): a relic was lost on death and found mid-level, so no road could ever lean on one;
   the reach fill (which holds no relic) reaches every gate and checkpoint of the six that looked like traversal
   (spurs x2, the beads, windcloak x2, the iron shoes), and no level source built a climb around any of them.
   SAVES. An old save carries PROG[levelId].relic (the "found" tick on the map card). retireRelics() drops it, and a save that
   HAD found a relic whose spot is now a vault silver is given that silver (its bit, so the cap of three holds by construction;
   a save that already holds all three has nothing to be paid). Idempotent: it runs on every load, and the second run finds nothing. */
export const VAULT_SILVER = {
  wood: { x: 344, y: 4, idx: 2 }, marsh: { x: 125, y: 10, idx: 2 }, spore: { x: 92, y: 6, idx: 0 }, kings: { x: 592, y: 6, idx: 2 },
  spire: { x: 38, y: 29, idx: 2 }, moor: { x: 200, y: 15, idx: 1, add: true, extra: [{ x: 416, y: 22 }] }, storm: { x: 130, y: 7, idx: 0 },
  crown: { x: 695, y: 13, idx: 2 }, longwater: { x: 512, y: 26, idx: 2 }, reef: { x: 472, y: 20, idx: 1 }, flotilla: { x: 82, y: 29, idx: 2 },
  hurricane: { x: 448, y: 26, idx: 1 }, lamplit: { x: 386, y: 21, idx: 1 }, underleaf: { x: 368, y: 27, idx: 0 }, deep: { x: 20, y: 145, idx: 2 },
  waymeet: { x: 626, y: 29, idx: 0 }, undercrown: { x: 80, y: 55, idx: 1 }, fields: { x: 418, y: 13, idx: 2 }, mage: { x: 562, y: 8, idx: 1 },
  caravan: { x: 359, y: 26, idx: 2 },
};

/* The level builder's LAST step (src/level.js): every former relic spot is a 'vault' marker all through the build - the garrison, the
   elites, the dead-end filler and the coin sprinkler keep clear of it exactly as they kept clear of the relic - and here it becomes what
   it pays: one of the level's silvers, MOVED there (the silver that gives way leaves its gold behind, as silverTrim does with a fourth
   silver: a short line of coins where it lay), or nothing (the cache already holds its own silver). No marker survives. */
export function vaultSilver(L, id) {
  const marks = L.ents.filter(e => e.t === 'vault'); if (!marks.length) return L;
  L.ents = L.ents.filter(e => e.t !== 'vault');
  const v = VAULT_SILVER[id], m = marks[0]; if (!v) return L;
  if (v.add) { L.ents.push({ t: 'silver', x: m.x, y: m.y }); for (const q of v.extra || []) L.ents.push({ t: 'silver', x: q.x, y: q.y }); return L; }   /* (extra: a silver the level still owed to reach three - Gale Moor's, in the valley under the rope at 412, after the vault's so every index stays stable) */
  const s = L.ents.filter(e => e.t === 'silver')[v.idx];
  if (s) { const ox = s.x, oy = s.y; s.x = m.x; s.y = m.y; for (const dx of [-2, -1, 0, 1, 2]) if (L.grid[oy * L.W + ox + dx] === 0) L.ents.push({ t: 'coin', x: ox + dx, y: oy }); }   /* (a cache of five: a dead end it paid still pays, deadends.js wants four) */
  return L;
}

/* The save's step (src/progression.js, beside normalizeDeathCost): returns how many silvers it paid. */
export function retireRelics(p) {
  let paid = 0;
  for (const id of Object.keys(p)) {
    const e = p[id]; if (!e || typeof e !== 'object' || Array.isArray(e) || !('relic' in e)) continue;
    const v = VAULT_SILVER[id];
    if (e.relic && v) { const bit = 1 << v.idx, had = (e.silver | 0) & bit; if (!had) { e.silver = (e.silver | 0) | bit; paid++; } }
    delete e.relic;
  }
  return paid;
}
