// burial-variety.js — THE BURIAL CAVERNS GET PLACES (Daniel, 2026-09-24): "more variety - some dark areas, lamp-lit pockets with
// darkness between, like the Ore Road's cavern; and bridges over poison water that disintegrate a moment after you step on them".
// The level's problem is SHAPE, not density (docs/briefs/burial-caverns-rework.md): 1,140 columns and ~230 of them a place. These
// three break the two longest undivided stretches into places you would name to somebody:
//
//   THE BLIND VAULT      cols 322-405, the old vault and the road to the Grave Causeway. Lamps every ~17 columns, dark between
//                        them, the dead buried in the dark stretches. You walk it lamp to lamp.
//   THE UNLIT CRYPT      the Restless Rows' lower crypt (504-588, rows 34-38): the way under the fallen wall. Half its torches out,
//                        and its three gas vents GLOW when they hiss and when they puff - the poison is its own warning light.
//   THE ROTTEN BRIDGES   the Bone Stairs' east end (933-978): two spans of rotten board over green water, a stone pier between.
//                        A board holds a moment and no more: it cracks (you see it and hear it) and drops half a second later,
//                        so you cross at a walk and never stop on one. Chains at every end of the poison climb you out (C5), and
//                        a span puts itself back five seconds after its last board fell, and whole on every respawn (B4).
//
// THE DARK IS FAIR (C1/C3), on four counts: the dark is a darkZone (the engine's own - main.js eases into it as you walk), so
// a foe inside it gets a rim whatever the setting says; every mark over a head is drawn after the dark (drawTells); a lamp
// is never more than ~17 columns from the next, so from the dark there is always one on the screen ahead; and anything that
// flies at you in the dark carries a little light (burialHoles), as does a vent about to puff.

export const BURIAL_DARK = 0.6;                     /* the Ore Road is 0.34 over everything; a zone can go darker because it ends */
export const CRUMBLE = { hold: 0.55, back: 5 };     /* seconds a cracked board holds; seconds a span waits, after its last board fell, to come back */
export const BLIND = [322, 405], CRYPT = [503, 590], BRIDGES = [[933, 953], [966, 978]];

export function varyBurial({ L, T, TS, rw }) {
  const { set, ent, coins } = L, W = L.W;
  const net = (x, a, b) => { for (let y = a; y <= b; y++) set(x, y, T.NET); };
  const drop = pred => { for (let i = L.ents.length - 1; i >= 0; i--) if (pred(L.ents[i])) L.ents.splice(i, 1); };
  const darkZones = [], pools = [], crumble = [], calm = [];

  // ---- 1. THE BLIND VAULT ----
  darkZones.push({ x0: BLIND[0] * TS, x1: (BLIND[1] + 1) * TS, y0: 12 * TS, y1: 34 * TS, dark: BURIAL_DARK, name: 'THE BLIND VAULT' });
  for (const x of [346, 380]) ent('torch', x, 31);                                   /* with 311, 328, 364 and the Causeway's 392: a pocket every ~17 */
  for (const x of [337, 355, 372]) ent('zombie', x, 31, { buried: true, face: -1 });  /* in the dark between the pockets: MOVING EARTH is a mark, and marks are drawn over the dark */
  { const s = L.ents.find(e => e.t === 'sign' && e.x === 321); if (s) s.text = 'THE BLIND VAULT. WALK LAMP TO LAMP: THE DEAD LIE IN THE DARK BETWEEN.'; }

  // ---- 2. THE UNLIT CRYPT ----
  darkZones.push({ x0: CRYPT[0] * TS, x1: (CRYPT[1] + 1) * TS, y0: 32 * TS, y1: 40 * TS, dark: BURIAL_DARK, name: 'THE UNLIT CRYPT' });
  drop(e => e.t === 'torch' && e.y === 38 && [523, 545, 567].includes(e.x));          /* every other torch out: pockets at 512, 534, 556, 578 */
  ent('sign', 500, 31, { text: 'THE UNLIT CRYPT. THE GAS GLOWS BEFORE IT BURNS: WAIT FOR THE GREEN TO GO OUT.' });

  // ---- 3. THE ROTTEN BRIDGES ----
  for (const [a, b] of BRIDGES) {
    for (let y = 32; y <= 39; y++) for (let x = a; x <= b; x++) set(x, y, T.AIR);
    pools.push({ x0: a * TS, x1: (b + 1) * TS, y: 33 * TS, depth: 7 * TS, bottom: 40 * TS, swim: true, clear: true, harm: true, poison: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212' });
    for (const x of [a, b]) net(x, L.grid[23 * W + x] === T.NET ? 23 : 30, 39);    /* a chain at each end, into the water: the arch ropes at 933 and 966 already hang there, and go down now */
    for (let x = a + 1; x < b; x++) set(x, 32, T.PLANK);
    crumble.push({ x0: a + 1, x1: b - 1, row: 32, tile: T.PLANK, quiet: 0 });
    calm.push([a - 1, b + 1, 20, 40]);                                                 /* nobody is garrisoned on a board that drops */
    drop(e => e.t !== 'coin' && e.x >= a && e.x <= b && e.y <= 32 && e.y >= 28);      /* the road's torch, bones and walker over the new water */
    for (let x = a + 3; x < b - 1; x += 4) coins([x, 30]);
  }
  ent('torch', 931, 31); ent('torch', 956, 31);
  ent('sign', 928, 31, { text: 'THE ROTTEN BRIDGES. A BOARD HOLDS A MOMENT: KEEP WALKING. THE CHAINS CLIMB OUT.' });
  /* the pier between the spans is held: the level's third elite husk stands on it (level.js ELITES) with the bone archer the
     road already had, who shoots down the first span - and you cannot stop to block on a board */
  ent('boo', 972, 27, { face: -1 });                                                    /* and a pale face over the second */

  return { pools: rw.pools.concat(pools), darkZones, crumble, calm, burialPlaces: [['THE BLIND VAULT', ...BLIND], ['THE UNLIT CRYPT', ...CRYPT], ['THE ROTTEN BRIDGES', BRIDGES[0][0], BRIDGES[1][1]]] };
}

/* ---- THE BOARDS, at run time. io: { air, spr(i) -> sprite, setSpr(i, s), crack(tx, ty), fall(tx, ty), back(z), emit(p) } ---- */
const onSpan = (L, tx, ty) => (L.crumble || []).find(z => z.row === ty && tx >= z.x0 && tx <= z.x1);
export function crumbleState(L) { return L.crumbleState || (L.crumbleState = {}); }
export function updateCrumble(L, P, dt, io) {
  if (!L.crumble || !L.crumble.length) return;
  const st = crumbleState(L), W = L.W;
  if (!P.dead && P.ground && !P.swim) { const ty = Math.floor((P.y + 1) / 16);
    for (const fx of [P.x - 4, P.x + 4]) { const tx = Math.floor(fx / 16), z = onSpan(L, tx, ty); if (!z) continue;
      const i = ty * W + tx; if (st[i] || L.grid[i] !== z.tile) continue;
      st[i] = { st: 'crack', t: CRUMBLE.hold, z }; io.crack(tx, ty); } }
  for (const k in st) { const s = st[k], i = +k; if (s.st !== 'crack') continue;
    s.t -= dt; const tx = i % W, ty = Math.floor(i / W);
    if (io.emit && Math.random() < dt * 16) io.emit({ x: tx * 16 + 2 + Math.random() * 12, y: ty * 16 + 4, vx: 0, vy: 20, life: 0.4, max: 0.4, col: Math.random() < 0.5 ? '#6a5436' : '#a6e04a', size: 1, grav: 260 });
    if (s.t <= 0) { s.st = 'gone'; s.saved = io.spr(i); L.grid[i] = io.air; io.setSpr(i, null); s.z.quiet = 0; io.fall(tx, ty); } }
  for (const z of L.crumble) {
    const gone = []; let cracking = false;
    for (let x = z.x0; x <= z.x1; x++) { const s = st[z.row * W + x]; if (!s) continue; if (s.st === 'gone') gone.push(z.row * W + x); else cracking = true; }
    if (!gone.length || cracking) { z.quiet = 0; continue; }
    z.quiet += dt;
    const onIt = P.x > z.x0 * 16 - 8 && P.x < (z.x1 + 1) * 16 + 8 && P.y > (z.row - 1) * 16 && P.y < (z.row + 1) * 16 + 4;
    if (z.quiet >= CRUMBLE.back && !onIt) { for (const i of gone) { L.grid[i] = z.tile; io.setSpr(i, st[i].saved || null); delete st[i]; } z.quiet = 0; io.back(z); }
  }
}
/* EVERY ATTEMPT FINDS THE BRIDGES WHOLE (spawnEntities): a death in the poison must not leave the way on in pieces */
export function crumbleReset(L, io) {
  const st = L.crumbleState; if (!st) return;
  for (const k in st) { const s = st[k], i = +k; if (s.st === 'gone') { L.grid[i] = s.z.tile; io.setSpr(i, s.saved || null); } }
  L.crumbleState = {}; for (const z of L.crumble || []) z.quiet = 0;
}
/* THE ROT, drawn over the boards: every board wears it (dark knots and a green drip under it - a bridge that says it will not
   hold before it is asked to), and a board you have stepped on splits along a crack that grows until it goes */
export function drawCrumble(g, L, cx, cy, time) {
  if (!L.crumble) return; const st = L.crumbleState || {}, W = L.W;
  for (const z of L.crumble) { if (z.x1 * 16 - cx < -20 || z.x0 * 16 - cx > g.canvas.width + 20) continue;
    for (let x = z.x0; x <= z.x1; x++) { const i = z.row * W + x, s = st[i], px = Math.round(x * 16 - cx), py = Math.round(z.row * 16 - cy);
      if (L.grid[i] !== z.tile) continue;
      const h = (x * 73856093) >>> 0;
      g.fillStyle = '#2a1e14'; g.fillRect(px + 2 + (h % 9), py + 1, 2, 1); g.fillRect(px + 5 + ((h >> 4) % 7), py + 3, 3, 1);
      g.fillStyle = '#5c8a24'; g.fillRect(px + 3 + ((h >> 8) % 10), py + 4, 1, 2 + Math.round(1 + Math.sin(time * 2 + x)));
      if (!s || s.st !== 'crack') continue;
      const k = 1 - Math.max(0, s.t) / CRUMBLE.hold, j = Math.floor(time * 30) % 2;
      g.fillStyle = '#140c06'; for (let n = 0; n < 1 + Math.round(k * 6); n++) g.fillRect(px + 7 + ((n % 2) ? 1 : -1) * Math.min(7, n) + j, py + Math.min(5, n), 1, 2);
      g.fillStyle = '#e8d8b0'; g.fillRect(px + 1, py - 1 - j, 3, 1); g.fillRect(px + 12, py - 1 - (1 - j), 3, 1); }
  }
}
/* LIGHT IN THE DARK THAT IS ABOUT TO HURT YOU: a vent that hisses or puffs, and anything thrown or loosed, inside a burial dark zone */
export function burialHoles(L, hole, cx, cy, time, seeds, P) {
  if (!L.darkZones || !L.gasVents) return;
  const inDark = (x, y) => L.darkZones.some(z => x > z.x0 - 32 && x < z.x1 + 32 && y > z.y0 - 32 && y < z.y1 + 32);
  if (!inDark(P.x, P.y)) return;
  for (const v of L.gasVents) { if (v.state !== 'warn' && v.state !== 'puff') continue; const x = v.x * 16 + 8, y = v.y * 16;
    if (x - cx < -60 || x - cx > 380 || !inDark(x, y)) continue;
    if (v.state === 'warn') hole(x - cx, y - 10 - cy, 30, 0.7); else hole(x - cx, y - 28 - cy, 46, 0.9); }
  for (const s of seeds || []) if (!s.dead && inDark(s.x, s.y)) hole(s.x - cx, s.y - cy, 18, 0.8);
}
