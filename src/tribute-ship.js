// src/tribute-ship.js — THE DEEP, REWORKED (docs/briefs/deep-rework-2.md). Everything here runs on THE DEEP ONLY, after
// crabTrench has cut it out of the source it shares with THE UNDERWATER KEEP (src/deep-split.js): the Keep crops that source
// first, so nothing done here can move a tile of it.
//   holdsOfTheDeep   the twelve holds under the middle decks become a cargo hold, a galley and a gun deck a depth (src/deep-holds.js
//                    paints them), and the two courses under every deck board are the ship's own strake (L.hullZones), not rock.
//   insertRows       opens a band of new rows in the Deep, carrying everything under it down (grid, creatures, water, air, zones, arena)
//   tributeShip      THE SUNK TRIBUTE SHIP, in that band: upright in the trench, wedged wall to wall, climbed down through her decks
import { drownedKnight } from './drowned-knights.js';

/* WHICH SHIP SANK AT WHICH DEPTH: the Wreck Stack's merchantmen, the Kelp Forest's cooks' decks, the Coral Garden's men-of-war */
export const HOLD_BANDS = [{ y0: 34, y1: 73, kind: 'cargohold' }, { y0: 74, y1: 113, kind: 'galley' }, { y0: 114, y1: 157, kind: 'gundeck' }];
export function holdsOfTheDeep(R) {
  R.hullZones = R.hullZones || [];
  for (const r of R.interiors) {
    const band = r[4] === 'ship' && HOLD_BANDS.find(b => r[2] >= b.y0 && r[2] <= b.y1);
    if (!band) continue;
    r[4] = band.kind;
    /* A SHIP HAS A HULL UNDER HER DECK (rule N, B9): the deck board is the row under the hold (r[3] + 1), and the two courses under
       it were T.SOLID drawn as the reef's mossy stone, ending square in open water. They are her strake now. */
    R.hullZones.push([r[0] - 1, r[1] + 1, r[3] + 2, r[3] + 3]);
  }
  R.deepHolds = true;
  return R;
}

/* INSERT n ROWS AT ROW at (tiles), every coordinate under it moved down with them. A span that starts above the cut and ends under it
   (the level-tall sea, the Cold Road's water, a zone) is STRETCHED, so the water still reaches from where it began to where it ended.
   The new rows are solid rock: whoever calls this cuts what goes in them. Tiles here; pools, dark zones and the arena are in pixels. */
export function insertRows(R, at, n, T, TS = 16) {
  const W = R.W, H = R.H, g = new Uint8Array(W * (H + n));
  for (let y = 0; y < H + n; y++) for (let x = 0; x < W; x++) g[y * W + x] = y < at ? R.grid[y * W + x] : y < at + n ? T.SOLID : R.grid[(y - n) * W + x];
  R.grid = g; R.H = H + n;
  const py = y => (y >= at ? y + n : y), pp = v => (v >= at * TS ? v + n * TS : v);
  const span = r => { if (r[2] >= at) { r[2] += n; r[3] += n; } else if (r[3] >= at) r[3] += n; return r; };
  const zspan = (z, k) => { const a = at * k, m = n * k; if (z.y0 >= a) { z.y0 += m; z.y1 += m; } else if (z.y1 >= a) z.y1 += m; return z; };
  for (const e of R.ents) e.y = py(e.y);
  for (const key of ['interiors', 'airRooms', 'hullZones', 'facades', 'cabins']) (R[key] || []).forEach(span);
  (R.darkZones || []).forEach(z => zspan(z, TS));
  for (const p of R.pools || []) { const bottom = p.bottom ?? p.y + p.depth; if (p.y >= at * TS) { p.y += n * TS; p.bottom = bottom + n * TS; } else if (bottom >= at * TS) p.bottom = bottom + n * TS; p.depth = p.bottom - p.y; }
  const D = R.deep;
  for (const key of ['vents', 'clams', 'bulbs', 'wrecks', 'jellies', 'kelp', 'fish', 'props', 'banners']) for (const q of D[key] || []) q.y = py(q.y);
  for (const key of ['pockets', 'masonry', 'noDress']) (D[key] || []).forEach(span);
  for (const key of ['zones', 'currents']) (D[key] || []).forEach(z => zspan(z, 1));
  for (const s of D.shafts || []) { if (s.y0 >= at) { s.y0 += n; s.y1 += n; } else if (s.y1 >= at) s.y1 += n; }
  for (const key of ['rime', 'icicles']) for (const r of D[key] || []) r[2] = py(r[2]);
  for (const q of D.gates || []) { q.wheel[1] = py(q.wheel[1]); if (q.y0 >= at) { q.y0 += n; q.y1 += n; } }
  if (R.arena) { const A = R.arena; A.floor = pp(A.floor); A.y0 = pp(A.y0); A.y1 = pp(A.y1); if (A.throne) A.throne[1] = pp(A.throne[1]); }
  R.START.y = py(R.START.y);
  if (R.tall) R.tall.bottom = pp(R.tall.bottom);
  return R;
}

// ============================================================================================
// THE SUNK TRIBUTE SHIP. Thirty years of the goblin Queen's tribute went into this trench (level.js, the head of the Deep), and this
// is the ship that carried the last of it: she went down upright and wedged, wall to wall, between the Coral Garden and the Glowing
// Drop, and the only way on is through her. Four decks, each crossed the other way, down three HATCHES that do not line up - and
// every hatch BLOWS HOT, because she sank onto the vents and their heat comes up through her gratings. Unweighted, a hatch throws you
// back up it; with a stone in your hands you walk down through it (the vent current lets ballast through at a quarter: main.js
// updateDeep). The stones are her cargo and her ballast; the prise wait by them; a drowned knight stands at the foot of the first
// hatch, where you arrive heavy and slow, and another in the orlop. She is FLOODED: her holds are not air, as the wrecks' are. What
// air she has is a bell in her crow's nest, what her deck beams kept, a clam in her bilge, a kelp bladder off her rail, and the
// hatches themselves - their bubbles are still air, and they are the one place in her you cannot stay.
//   rows (Y = 158):  Y..Y+7     HER RIGGING       three masts jammed into the garden's floor, two yards, the crow's nest
//                    Y+8        THE WEATHER DECK  (strake Y+9, Y+10)  the main hatch at 54-55
//                    Y+11..Y+18 THE TRIBUTE HOLD  the 'tween deck, her tribute lashed in rows; the hatch west at 16-17
//                    Y+19       its floor         (strake Y+20, Y+21)
//                    Y+22..Y+28 THE ORLOP         her brig aft, her magazine forward; the hatch east at 90-91
//                    Y+29       its floor         (strake Y+30, Y+31)
//                    Y+32..Y+38 THE BILGE         her ballast; stove in at 44-49, and out into the Glowing Drop
//                    Y+39..Y+43 HER KEEL
export const SHIP = { at: 158, rows: 44, x0: 8, x1: 103, hatches: [[54, 55, 8], [16, 17, 19], [90, 91, 29]], breach: [44, 49] };
export function tributeShip(R, T, TS = 16) {
  const { at: Y, x0: X0, x1: X1 } = SHIP, W = R.W, D = R.deep;
  const set = (x, y, t) => { R.grid[y * W + x] = t; }, fill = (a, b, c, d, t) => { for (let y = c; y <= d; y++) for (let x = a; x <= b; x++) set(x, y, t); };
  const ent = (t, x, y, o) => R.ents.push({ t, x, y, ...(o || {}) });
  const coin = (...xy) => { for (const [x, y] of xy) R.ents.push({ t: 'coin', x, y }); };
  const hull = (a, b, c, d) => R.hullZones.push([a, b, c, d]);
  const deck = (y, hatches) => { fill(X0, X1, y, y, T.PLANK); fill(X0, X1, y + 1, y + 2, T.SOLID); hull(X0, X1, y + 1, y + 2);
    for (const [a, b] of hatches) fill(a, b, y, y + 2, T.AIR); };
  /* A HATCH THAT BLOWS HOT: the vent on the deck under it (its bubbles, its air, its own heat) and a current as wide as the hatch
     itself, so there is no edge of it to slip down unweighted */
  const hotHatch = (a, b, top, floorRow) => { D.vents.push({ x: a, y: floorRow - 1, h: floorRow - top, hot: true, drain: false });
    D.currents.push({ x0: a, x1: b, y0: top, y1: floorRow - 1, fx: 0, fy: -150, kind: 'hot' }); };
  const stone = (x, y, kind) => ent('ballast', x, y, { kind: kind || 'stone' });
  const deco = (kind, x, y, o) => ent('deco', x, y, { kind, ...(o || {}) });
  const pocket = (a, b, c, d) => { R.airRooms.push([a, b, c, d]); D.pockets.push([a, b, c, d]); };
  fill(X0, X1, Y, Y + 43, T.AIR);
  // ---- HER RIGGING (Y .. Y+7): masts stepped in her deck and jammed into the rock she sank under ----
  /* (their tops stop two rows short of the rock: a mast to the ceiling is a wall across the trench, and the first cut of this sealed the
     throat's landing off from the rest of her - tools/deep-rework.mjs now floods the start to the door) */
  for (const mx of [30, 48, 84]) { fill(mx, mx, Y + 2, Y + 7, T.SOLID); hull(mx, mx, Y + 2, Y + 7); }
  fill(45, 47, Y + 2, Y + 2, T.ONEWAY); fill(49, 51, Y + 2, Y + 2, T.ONEWAY); deco('airBell', 46, Y + 1);   /* the crow's nest, and the bell they kept in it */
  fill(41, 47, Y + 5, Y + 5, T.ONEWAY); fill(49, 55, Y + 5, Y + 5, T.ONEWAY);   /* the main yard, either side of her mast */
  fill(78, 83, Y + 4, Y + 4, T.ONEWAY); fill(85, 90, Y + 4, Y + 4, T.ONEWAY);   /* the fore yard */
  ent('check', 20, Y + 7);   /* where you land on her, under the garden's throat */
  ent('sign', 17, Y + 7, { text: 'THE TRIBUTE SHIP. HER HATCHES BLOW HOT: ONLY A STONE WILL CARRY YOU DOWN ONE.' });
  ent('silver', 89, Y + 3);   /* S7: out on the fore yard's end, off the way down */
  coin([43, Y + 4], [53, Y + 4], [80, Y + 3]);
  ent('angler', 36, Y + 3); ent('angler', 70, Y + 5);
  // ---- THE WEATHER DECK (Y+8), and the main hatch in it ----
  deck(Y + 8, [[54, 55]]);
  hotHatch(54, 55, Y + 5, Y + 19);
  stone(30, Y + 7); stone(44, Y + 7); stone(72, Y + 7, 'chest');
  ent('prise', 40, Y + 7, { face: 1 });
  ent('merrowspear', 66, Y + 7, { face: -1 });   /* S1: her harpoon covers the hatch, and you cross to it heavy */
  D.wrecks.push({ x: 36, y: Y + 7 });   /* a diving bell on her side on the deck, with the air still in her */
  deco('capstan', 62, Y + 7); deco('shipBell', 12, Y + 7); deco('coiledCable', 34, Y + 7); deco('figurehead', 100, Y + 7);
  D.kelp.push({ x: 97, y: Y + 7, h: 6 }); D.bulbs.push({ x: 97, y: Y + 1 });   /* a bladder off her rail */
  coin([26, Y + 6], [48, Y + 6], [76, Y + 6], [92, Y + 6]);
  // ---- THE TRIBUTE HOLD, the 'tween deck (Y+11 .. Y+18): crossed east to west ----
  R.interiors.push([X0, X1, Y + 11, Y + 18, 'tribute']);
  pocket(30, 38, Y + 11, Y + 12);   /* air the weather deck's beams kept, over the way west */
  deck(Y + 19, [[16, 17]]);
  hotHatch(16, 17, Y + 15, Y + 29);
  R.ents.push(drownedKnight(58, Y + 18, { face: -1 }));   /* S1: at the foot of the main hatch, where you arrive heavy and slow */
  stone(88, Y + 18); stone(30, Y + 18); stone(24, Y + 18, 'chest');
  ent('prise', 34, Y + 18, { face: 1 }); ent('prise', 84, Y + 18, { face: -1 });   /* at the stones: kill them before you pick one up */
  ent('check', 40, Y + 18);
  ent('sign', 44, Y + 18, { text: 'THE QUEEN\'S TRIBUTE, LASHED WHERE THEY STOWED IT. NONE OF IT EVER GOT THERE.' });
  deco('seaChest', 50, Y + 18); deco('seaChest', 66, Y + 18); deco('lanternDeck', 96, Y + 18, { v: 1 });
  ent('eel', 50, Y + 14);
  coin([30, Y + 17], [44, Y + 17], [62, Y + 17], [74, Y + 17]);
  // ---- THE ORLOP (Y+22 .. Y+28): her brig aft, her magazine forward; crossed west to east ----
  R.interiors.push([X0, X1, Y + 22, Y + 28, 'ship']);
  R.cabins = R.cabins || []; R.cabins.push([X0, 30, Y + 22, Y + 29, 'brig'], [60, X1, Y + 22, Y + 29, 'magazine']);
  pocket(30, 36, Y + 22, Y + 23); D.clams.push({ x: 62, y: Y + 28 });   /* the orlop is her longest crossing: a clam half way along it (tools/breath.mjs) */
  deck(Y + 29, [[90, 91]]);
  hotHatch(90, 91, Y + 25, Y + 39);
  R.ents.push(drownedKnight(86, Y + 28, { face: -1 }));   /* S1: between the last stones and the last hatch */
  stone(46, Y + 28); stone(74, Y + 28);
  ent('prise', 66, Y + 28, { face: -1 });
  ent('check', 70, Y + 28);
  ent('lamprey', 60, Y + 25);
  deco('anchor', 52, Y + 28);
  coin([48, Y + 27], [58, Y + 27], [76, Y + 27]);
  // ---- THE BILGE (Y+32 .. Y+38): her own ballast, and the hole she went down by ----
  R.interiors.push([X0, X1, Y + 32, Y + 38, 'ship']);
  fill(X0, X1, Y + 39, Y + 39, T.PLANK); fill(X0, X1, Y + 40, Y + 43, T.SOLID); hull(X0, X1, Y + 40, Y + 43);
  fill(SHIP.breach[0], SHIP.breach[1], Y + 39, Y + 43, T.AIR);   /* stove in: out and down into the Glowing Drop */
  pocket(60, 66, Y + 32, Y + 33);
  D.clams.push({ x: 72, y: Y + 38 });
  stone(22, Y + 38); stone(62, Y + 38); stone(80, Y + 38);
  ent('eel', 30, Y + 35); ent('urchin', 56, Y + 38);
  ent('sign', 52, Y + 38, { text: 'SHE WENT DOWN BY THIS HOLE. SO DO YOU.' });
  coin([40, Y + 37], [64, Y + 37], [86, Y + 37]);
  D.zones.push({ name: 'THE TRIBUTE SHIP', x0: X0, x1: X1, y0: Y, y1: Y + 43, col: [210, 170, 90], a: 0.08 });
  R.darkZones.push({ x0: X0 * TS, x1: (X1 + 1) * TS, y0: Y * TS, y1: (Y + 44) * TS, dark: 0.2 });
  return R;
}

/* THE BELL GRAVE'S STONE RACKS (A12). The Diving Bell opens only to a stone let go over the valve on his crown (main.js updateBellcrab),
   so the room has to hold stones ABOVE him: two platforms of her timber, hung by rope from the rock over the grave (B9), six rows up, each
   with a rack whose stone is set back whenever it is spent or lies on the floor (`rack`: main.js updateBallast). He walks under them. The
   ropes are DRAWN, not tiles (`rope`: [left end, right end, top row], drawBallast): a rope tile is a ladder, and a swimmer caught on one
   over his crown is a swimmer who never comes down to cut him. The floor's two loose stones go: down here a stone on the floor is one
   nobody can carry back up, and walking into one by accident made you heavy under his ring. */
export const RACKS = [[124, 127], [140, 143]];
export function bellGraveRacks(R, T, TS = 16) {
  const A = R.arena, W = R.W, top = Math.round(A.y0 / TS), row = Math.round(A.floor / TS) - 6;
  for (const [a, b] of RACKS) { for (let x = a; x <= b; x++) R.grid[row * W + x] = T.PLANK;
    R.ents.push({ t: 'ballast', x: Math.round((a + b) / 2), y: row - 1, kind: 'stone', rack: true, rope: [a, b, top] }); }
  R.ents = R.ents.filter(e => !(e.t === 'ballast' && !e.rack && e.y === Math.round(A.floor / TS) - 1 && e.x * TS >= A.x0 && e.x * TS <= A.x1));
  const sign = R.ents.find(e => e.t === 'sign' && /^THE BELL GRAVE/.test(e.text || ''));
  if (sign) sign.text = 'THE BELL GRAVE. HIS SHELL IS SHUT. LET A STONE GO OVER THE VALVE ON HIS CROWN AND HE VENTS.';
  return R;
}

export function reworkDeep(R, T, TS = 16) {
  holdsOfTheDeep(R);
  R.ents.push(drownedKnight(18, 155, { face: 1 }));   /* S1: in the Coral Garden's last throat, the only way down - the first you meet */
  insertRows(R, SHIP.at, SHIP.rows, T, TS);
  tributeShip(R, T, TS);
  bellGraveRacks(R, T, TS);
  return R;
}
