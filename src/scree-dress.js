/* src/scree-dress.js - THE SCREE PATH's LIGHTS (claude/screefix, design standard A8: LIGHTS; the audit-polish fix list "(2) light: lamps/torches on the quarry and the
   ropeway, scree glints"). The foothills are DUSK and had one torch in 648 columns.
   These are NOT level data: they go in L.dressExtra, which src/main.js spawns like ents at load but tools/level-quality's levelHash (grid + ents + movers + ambushes)
   never reads - so the mash / pilot / curve rows stay valid. Each is a standing deco that already lights itself (main.js: farmLantern, lanternPost) set on the
   surface of the column it names. Not placed on a column with no ground. */
const LAMPS = [   /* [column, kind]: the bothy door, the hamlet's three doors, the mill, the cairn field's shrines, the gorge ropeway's two stations, the quarry, the fold */
  [11, 'farmLantern'], [73, 'farmLantern'], [89, 'farmLantern'], [105, 'farmLantern'],
  [193, 'farmLantern'], [231, 'lanternPost'], [268, 'lanternPost'],
  [372, 'farmLantern'], [403, 'lanternPost'],
  [438, 'lanternPost'], [462, 'lanternPost'], [490, 'lanternPost'],
  [514, 'lanternPost'], [535, 'lanternPost'], [552, 'lanternPost'], [570, 'lanternPost'], [583, 'lanternPost'],
  [603, 'lanternPost'], [609, 'farmLantern'], [630, 'lanternPost'],
];
export function dressScree(R, T) {
  const W = R.W, H = R.H, g = R.grid, out = [];
  const surf = x => { for (let y = 2; y < H; y++) if (g[y * W + x] === T.SOLID && g[(y - 1) * W + x] === T.AIR) return y; return -1; };
  const taken = new Set(R.ents.filter(e => e.t === 'deco' || e.t === 'sign' || e.t === 'check' || e.t === 'door').map(e => e.x));
  for (const [x0, kind] of LAMPS) {
    let x = x0; for (let k = 0; k < 4 && taken.has(x); k++) x++;   /* never on top of a sign, a door or a shrine */
    const y = surf(x); if (y < 3 || y > 22 || x >= W - 1) continue;   /* not in the gorge's floor */
    out.push({ t: 'deco', kind, x, y: y - 1 }); }
  R.dressExtra = out.concat(R.dressExtra || []);
  return R;
}
