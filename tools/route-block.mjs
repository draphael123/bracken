/* tools/route-block.mjs - THE FOE PASS, LEVER 1: DO A LEVEL'S ENCOUNTERS HOLD THE ROUTE? (claude/foepass; scratch/brief-foepass-1016.md)
   Daniel 10-16: "you can just largely ignore them" - the encounters stood BESIDE the route (a ledge over it, a pocket off it), so the cheapest play
   was to walk past. An encounter BLOCKS when one of its bodies stands ON the walked main route (tools/pacing.mjs): a route node within one column
   and one row of where it stands - the hero walks through its tile, so he must fight it, jump it or be hit going past. An ambush room and the
   mini's door lock the route by themselves and always block. The share that block is LIM.blockShare (rec 40%) or more.
   REPORT-ONLY (Daniel's brief: "report-only first; ratchet per level, gate after the act sweeps"): tools/level-quality.mjs prints the row (WARN) on
   every level it measures and never fails on it; the act sweeps move their levels up, then the row is lifted per act.
     node tools/level-quality.mjs --blocking            every campaign level, by act: blocking / encounters
     node tools/level-quality.mjs --blocking <id> ...   those levels, with every encounter on and off the route */

export const BLOCK = { share: 0.4, dx: 1, dy: 1, clump: 8 };
/* encounters: [{ k, x, members: [{t, x, y}], always }] - the same grouping as level-quality's density (a squad, an elite, an ambush room, the mini, a clump) */
export function encounters(L, foes) {
  const enc = [], bySquad = new Map(), loose = [];
  for (const e of foes) { if (e.squad) { if (!bySquad.has(e.squad)) bySquad.set(e.squad, []); bySquad.get(e.squad).push(e); } else if (e.elite) enc.push({ k: 'elite ' + e.t, x: e.x, members: [e] }); else loose.push(e); }
  for (const [k, l] of bySquad) enc.push({ k: 'squad ' + k, x: (Math.min(...l.map(e => e.x)) + Math.max(...l.map(e => e.x))) / 2, members: l });
  for (const q of L.ambushes || []) enc.push({ k: 'ambush', x: (q.wallL + q.wallR) / 2, members: [], always: true });
  if (L.mini) enc.push({ k: 'mini', x: (L.mini.x0 + L.mini.x1) / 2 / 16, members: [], always: true });
  loose.sort((a, b) => a.x - b.x); for (let i = 0; i < loose.length;) { let j = i; while (j + 1 < loose.length && loose[j + 1].x - loose[j].x <= BLOCK.clump) j++;
    const l = loose.slice(i, j + 1); enc.push({ k: 'clump ' + [...new Set(l.map(e => e.t))].join('+'), x: (l[0].x + l[l.length - 1].x) / 2, members: l }); i = j + 1; }
  return enc.sort((a, b) => a.x - b.x);
}
/* does an encounter hold the route? route: [[x, y]] (column, body row), the same rows ents stand on */
export function blocks(enc, routeCols) {
  if (enc.always) return true;
  return enc.members.some(e => { for (let dx = -BLOCK.dx; dx <= BLOCK.dx; dx++) for (const y of routeCols.get(e.x + dx) || []) if (Math.abs(y - e.y) <= BLOCK.dy) return true; return false; });
}
/* the measure for one built level: { n, blocking, share, off: [encounter names standing off the route] }. foes: the level's foe ents (level-quality's isFoe) */
export function routeBlock(L, route, foes) {
  const cols = new Map(); for (const [x, y] of route) { if (!cols.has(x)) cols.set(x, []); cols.get(x).push(y); }
  const enc = encounters(L, foes), on = enc.filter(e => blocks(e, cols));
  return { n: enc.length, blocking: on.length, share: enc.length ? on.length / enc.length : 1, off: enc.filter(e => !on.includes(e)).map(e => e.k + '@' + Math.round(e.x)), enc, on };
}

