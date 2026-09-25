/* tools/architecture.mjs — RULE B9 FOR WHAT WAS BUILT: NO MASONRY, NO WALL, NO TOWER AND NO HOUSE STANDS ON NOTHING.
   Node only: no page, no port, no Chrome.

   WHY. `tools/floaters.mjs` sets every PROP down and fails the ones it cannot; nothing asked the same of the STRUCTURE
   a prop stands on. Daniel, 2026-09-25, on THE MONASTERY: "a lot of the Monastery's architecture floats (walls, arches,
   buildings, towers, platforms of masonry with nothing under them)". A cloister of laid stone ninety tiles long, keyed
   into the cliff at its two ends and open sky under the rest of it, passed every check in the suite, because every
   check asked whether you could STAND on it and none asked what it stood on.

   WHAT IS STRUCTURE. Only what a level says was BUILT - natural rock is the mountain and is not judged here:
     masonry     L.masonry rectangles: the rock inside them is drawn as laid stone (coursed, jointed)
     facades     L.facades: a wall face drawn behind the play (a curtain wall, a tower, a cloister, an arcade, a pier)
     structures  L.structures / L.watchtowers: posts, pillars, timber frames drawn from `top` down to `floor`
     houses      L.houses: a house front standing on the row under its y1
     stones      L.stone: a standing stone drawn whole over its column

   WHAT HOLDS A CELL UP (the load path, bottom up, one row at a time):
     BASE   the tile under it is the mountain (natural rock), or a BASE-held cell of structure (laid stone or a wall
            face), or a room (a grounded interior carries its own ceiling); or it is keyed into the mountain beside it
            or hung from the mountain over it.
     SPAN   a lintel, an arch or a short cantilever: a cell in the same unbroken run as a BASE cell, no more than SPAN
            tiles from it. A cell with a BASE cell within SPAN on BOTH sides is a lintel between two piers, and the wall over
            it stands on it (it counts as BASE for the cell above). A cell reached from ONE side only is a cantilever: it
            holds itself and nothing else, or a slab would corbel SPAN further out with every course, and a nine-row wall
            keyed into one cliff would carry itself thirty-six tiles across open sky.
     ARCH   a facade that says `spans: true` is ONE ARCH: it stands, whole, when both its springings stand (the cell under each of
            its two bottom corners is held or is the mountain), however wide it is - the bell towers' great arches.
   A laid-stone cell or a wall-face cell held by neither is IN THE AIR. So is a post, a house or a standing stone that
   has no column within SPAN of it with ground under it.

   THE GRANDFATHER LIST. Levels that fail on the day the rule landed are named below with what fails and why it was not
   rebuilt here; the list must SHRINK: a level on it that now passes fails the check until its entry is taken out, so an
   entry cannot outlive the thing it excuses. Every other level must hold now.
   Run: node tools/architecture.mjs [id ...]   (--all prints every level's pieces, listed or not) */
import { LEVELS, T } from '../src/level.js';

export const SPAN = 4;   /* a lintel or an arch carries this far from the pier that holds it: two piers eight tiles apart carry a seven-tile arch between them */
const ROCK = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE]);
const LEDGE = new Set([T.ONEWAY, T.REED, T.PLANK, T.BOUNCER, T.SHELF, T.RAIL, T.CRYST]);   /* a timber post or a house may stand on boards; laid stone may not */

// THE GRANDFATHER LIST: id -> [how many cells/pieces were in the air when the rule landed, why it was not fixed here]
export const GRANDFATHERED = {
  keep: [300, 'THE SUNKEN TOWER (facade 602-613, rows 10-47) stops at row 47 over the open water passage under it (48-56) and never reaches the bed: it hangs in clear water. The fix is to find its bed and carry it down, or cut the passage through an arch in it - a look for whoever owns the Keep, not a number to type'],
  harbor: [33, 'the jetty timber frame (478-510) ends at the water line (row 29) and the bed is at 40: its posts stop at the surface. STORMWRECK HARBOR is shelved on purpose (docs/DESIGN.md part three, 8) - left alone'],
  waymeet: [83, 'the arcade under the town wall (477-535, rows 36-37) is a FLAT two-row lintel over openings twelve tiles wide, carried by two-tile piers: a seven-tile span is the most a lintel carries here. And four town houses (358-443) stand on the canal (row 36 is water to the bed at 40). Both are the look of the town, not its route'],
  unburied: [52, 'the broken tower (348-350, rows 24-33) hovers two rows over the road with sky behind it, and the timber column at 363-364 stands over the pit. The road runs under the first, so grounding it is a route change (the levelfix lane left it as an art rework)'],
};

export function architecture(R) {
  const { W, H, grid } = R, tile = (x, y) => (x < 0 || x >= W || y >= H) ? T.SOLID : y < 0 ? T.AIR : grid[y * W + x];
  const rock = (x, y) => ROCK.has(tile(x, y));
  const inR = (z, x, y) => x >= z[0] && x <= z[1] && y >= z[2] && y <= z[3];
  const masonry = R.masonry || [], facades = (R.facades || []).filter(f => Array.isArray(f));
  const laid = new Uint8Array(W * H), face = new Uint8Array(W * H), room = new Uint8Array(W * H), kindAt = new Array(W * H);
  for (const z of masonry) for (let y = Math.max(0, z[2]); y <= Math.min(H - 1, z[3]); y++) for (let x = Math.max(0, z[0]); x <= Math.min(W - 1, z[1]); x++) if (rock(x, y)) { laid[y * W + x] = 1; kindAt[y * W + x] = kindAt[y * W + x] || 'masonry'; }
  for (const f of facades) for (let y = Math.max(0, f[2]); y <= Math.min(H - 1, f[3]); y++) for (let x = Math.max(0, f[0]); x <= Math.min(W - 1, f[1]); x++) { face[y * W + x] = 1; kindAt[y * W + x] = kindAt[y * W + x] || String(f[4]); }
  // A ROOM carries its ceiling, if the room itself has a floor: half its width stands on rock or boards, on the row under it
  // or on one of its own bottom three (a castle's interiors are drawn down over their own floor course)
  for (const z of (R.interiors || [])) { if (!Array.isArray(z)) continue;
    const floored = [z[3] + 1, z[3], z[3] - 1, z[3] - 2].some(y => { let n = 0; for (let x = z[0]; x <= z[1]; x++) if (rock(x, y) || LEDGE.has(tile(x, y))) n++; return n * 2 >= z[1] - z[0] + 1; });
    if (floored) for (let y = Math.max(0, z[2]); y <= Math.min(H - 1, z[3]); y++) for (let x = Math.max(0, z[0]); x <= Math.min(W - 1, z[1]); x++) room[y * W + x] = 1; }
  // UNDER THE SURFACE OF WHAT YOU CANNOT SEE THROUGH, a foot is hidden: a house drawn standing in the lava stands in it. Clear
  // water is not that - you can see the gap under a tower in it - so only an opaque pool (fire, a harmful one, one not drawn clear) hides
  const hidden = (x, y) => (R.pools || []).some(p => !p.clear && x * 16 + 8 >= p.x0 && x * 16 + 8 <= p.x1 && y * 16 + 8 > p.y && (p.bottom === undefined || y * 16 < p.bottom));
  const piece = i => laid[i] || face[i];
  const natural = (x, y) => rock(x, y) && !(x >= 0 && x < W && y >= 0 && y < H && laid[y * W + x]);
  const base = new Uint8Array(W * H), held = new Uint8Array(W * H), bridged = new Uint8Array(W * H);   /* bridged: a lintel between two piers */
  /* A DOORWAY. A wall up to three tiles thick with a way through its foot is drawn edge on: the door is IN the wall, and the
     stone over it is carried by the wall either side of the door, out of the picture. So the head of a thin wall with one to
     six rows of air under it and a held floor under those is held - but only a WALL (its run in the row is three tiles or
     less: a slab one row over a floor is a tunnel's ceiling, and a tunnel ninety tiles long wants its piers), and only a
     door INTO something: a room behind the opening on one side of it. A pillar with nothing behind it and a gap under it is
     not a doorway, it is a pillar in the air (THE UNBURIED FIELD's broken tower, 348-350, hovering two rows over the road). */
  const doorHead = (x, y) => { if (!laid[y * W + x] || y + 1 >= H) return false;
    const into = [-3, -2, -1, 1, 2, 3].some(dx => x + dx >= 0 && x + dx < W && room[(y + 1) * W + x + dx]); if (!into) return false;
    let a = x, b = x; while (a - 1 >= 0 && piece(y * W + a - 1)) a--; while (b + 1 < W && piece(y * W + b + 1)) b++; if (b - a + 1 > 3) return false;
    for (let k = 1; k <= 6; k++) { const yy = y + k; if (yy >= H) return false; const t = tile(x, yy);
      if (t !== T.AIR) return k > 1 && (natural(x, yy) || base[yy * W + x] || room[yy * W + x]); }
    const yy = y + 7; return yy < H && k5(x, yy); };
  const k5 = (x, yy) => natural(x, yy) || base[yy * W + x] || room[yy * W + x];
  const arches = facades.filter(f => f[5] && f[5].spans);
  const standsAt = (x, y) => y >= H || natural(x, y) || (x >= 0 && x < W && y >= 0 && (held[y * W + x] || room[y * W + x]));
  for (let y = H - 1; y >= 0; y--) {
    for (const f of arches) if (f[3] === y && standsAt(f[0], y + 1) && standsAt(f[1], y + 1))
      for (let yy = Math.max(0, f[2]); yy <= y; yy++) for (let x = Math.max(0, f[0]); x <= Math.min(W - 1, f[1]); x++) base[yy * W + x] = 1;
    for (let x = 0; x < W; x++) { const i = y * W + x; if (!piece(i)) continue;
      const b = (y + 1) * W + x;
      if (y === H - 1 || natural(x, y + 1) || hidden(x, y + 1) || (y + 1 < H && (base[b] || bridged[b] || room[b])) || (laid[i] && (natural(x - 1, y) || natural(x + 1, y) || natural(x, y - 1))) || doorHead(x, y)) base[i] = 1; }
    // SPAN: along each unbroken run of structure in this row, within SPAN of a BASE cell
    let x = 0; while (x < W) { if (!piece(y * W + x)) { x++; continue; } const a = x; while (x < W && piece(y * W + x)) x++; const b = x - 1;
      const fromL = new Int32Array(b - a + 1); let last = -1e9; for (let k = a; k <= b; k++) { if (base[y * W + k]) last = k; fromL[k - a] = k - last; if (k - last <= SPAN) held[y * W + k] = 1; }
      last = 1e9; for (let k = b; k >= a; k--) { if (base[y * W + k]) last = k; if (last - k <= SPAN) { held[y * W + k] = 1; if (fromL[k - a] <= SPAN) bridged[y * W + k] = 1; } } }
  }
  // what is left, grouped into pieces (8-connected), each named by what it was drawn as
  const out = [], seen = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) { if (!piece(i) || held[i] || seen[i]) continue;
    const st = [i]; seen[i] = 1; let n = 0, x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1; const kinds = new Set();
    while (st.length) { const j = st.pop(), x = j % W, y = (j / W) | 0; n++; kinds.add(kindAt[j]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue; const k = yy * W + xx; if (!seen[k] && piece(k) && !held[k]) { seen[k] = 1; st.push(k); } } }
    out.push({ what: [...kinds].join('+'), n, x0, x1, y0, y1 }); }
  // POSTS, HOUSES, STANDING STONES: a column within SPAN of every one of their columns has ground under it
  const stands = (x, y, timber) => rock(x, y) || hidden(x, y) || (timber && LEDGE.has(tile(x, y))) || (x >= 0 && x < W && y >= 0 && y < H && (held[y * W + x] || room[y * W + x]));
  const foot = (what, x0, x1, row, timber) => { const ok = []; for (let x = x0; x <= x1; x++) if (stands(x, row, timber)) ok.push(x);
    const bad = []; for (let x = x0; x <= x1; x++) if (!ok.some(k => Math.abs(k - x) <= SPAN)) bad.push(x);
    if (!ok.length || bad.length) out.push({ what, n: bad.length || (x1 - x0 + 1), x0, x1, y0: row - 1, y1: row - 1 }); };
  for (const z of [...(R.structures || []), ...(R.watchtowers || []).filter(w => !(R.structures || []).includes(w))]) if (z && z.floor != null) foot('structure:' + (z.kind || '?'), z.x0, z.x1, z.floor, z.kind !== 'stone' && z.kind !== 'arch');
  for (const h of (R.houses || [])) foot('house', h.x0, h.x1, h.y1 + 1, true);
  for (const z of (R.stone || [])) if (Array.isArray(z)) foot('standing stone', z[0], z[1], z[3] + 1, false);
  return out;
}

const args = process.argv.slice(2), all = args.includes('--all'), only = args.filter(a => !a.startsWith('--'));
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('tools/architecture.mjs')) {
  let bad = 0, levels = 0, pieces = 0; const listed = [];
  for (const lv of LEVELS) {
    if (only.length && !only.includes(lv.id)) continue;
    let R; try { R = lv.build(); } catch (e) { console.log('  ' + lv.id + ' will not build: ' + e.message); bad++; continue; }
    levels++;
    const hits = architecture(R), cells = hits.reduce((s, h) => s + h.n, 0), gf = GRANDFATHERED[lv.id];
    pieces += (R.masonry || []).length + (R.facades || []).length + (R.structures || []).length + (R.houses || []).length + (R.stone || []).length;
    const say = () => { for (const h of hits.slice(0, all ? 999 : 10)) console.log('      ' + h.what.padEnd(22) + String(h.n).padStart(5) + (h.what.includes(':') || h.what === 'house' || h.what === 'standing stone' ? ' cols' : ' cells') + '  x ' + h.x0 + '-' + h.x1 + '  y ' + h.y0 + '-' + h.y1);
      if (hits.length > 10 && !all) console.log('      ... and ' + (hits.length - 10) + ' more'); };
    if (gf) {
      if (!hits.length) { bad++; console.log('  ' + lv.id.padEnd(12) + 'is on the grandfather list and now PASSES: take its entry out of tools/architecture.mjs'); }
      else if (cells > gf[0]) { bad++; console.log('  ' + lv.id.padEnd(12) + cells + ' cells in the air, more than the ' + gf[0] + ' it was listed with: something new floats'); say(); }
      else { listed.push(lv.id); if (all) { console.log('  ' + lv.id.padEnd(12) + cells + ' in the air (listed: ' + gf[1] + ')'); say(); } }
    } else if (hits.length) { bad++; console.log('  ' + lv.id.padEnd(12) + hits.length + ' piece(s) of structure in the air, ' + cells + ' cells'); say(); }
  }
  console.log('\n' + levels + ' levels, ' + pieces + ' built pieces declared' + (listed.length ? '; ' + listed.length + ' grandfathered (' + listed.join(', ') + ')' : '') + '. '
    + (bad ? bad + ' level(s) with structure standing on nothing.' : 'everything that was built stands on something.'));
  process.exit(bad ? 1 : 0);
}
