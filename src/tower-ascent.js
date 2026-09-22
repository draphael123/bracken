// tower-ascent.js — THE FALLING TOWER, rebuilt (batch 4, 2026-09-21). It replaces tower-return.js (the Folly walked
// backwards) and tower-finish.js (its indoor arena). Daniel: "mostly an UPWARD ascent" through the collapsing tower,
// ending on a magic carpet in the sky. So the level is a tower standing on its end: you come in at the Folly's broken
// foot and climb five floors that each look and play differently, and each floor falls away under you once you have
// left it - the pressure comes from BELOW, and there is no going back down. At the crown the roof is gone and the
// carpet waits on the parapet (src/carpet.js); the Undead Archmage is fought in the open sky (src/undead-mage.js).
//
//   rows 0-49     THE SKY: the carpet's arena (L.arena.carpet, rows 34-50), nothing to stand on by design
//   rows 50-83    5 THE OPEN CROWN      broken ledges, the sky showing through, the carpet at the top
//   rows 86-119   4 THE BELL LOFT       lifts and bell ropes
//   rows 122-155  3 THE BURST CISTERN   a floor of poison water, stepping stones, ledges that give way
//   rows 158-191  2 THE ORRERY CAGE     brass ledges and crystal ones that craze underfoot, a rope up the middle
//   rows 194-229  1 THE LIBRARY STACKS  shelves to the ceiling, a plank stair between them
// Each floor is capped by a two-row stone divider with ONE rope through it. When you stand on the first tier over a divider the
// floor under it collapses from its bottom row up, and the rope's hole in the divider is filled with rubble.
//
// Verbs used are the game's own (rule: obstacles fit the verbs you have): ledges, ropes (NET), crystal (T.CRYST, which
// L.hasCryst lets craze), authored crumbling ledges (deckBreaks), vertical movers, poison water, falling stones.
export const TOWER = { W: 72, H: 240, X0: 12, X1: 59, SKY: 50 };
// [name, top, bottom(the floor row), interior kind]
const FLOORS = [
  ['THE LIBRARY STACKS', 194, 230, 'library'],
  ['THE ORRERY CAGE', 158, 192, 'orrery'],
  ['THE BURST CISTERN', 122, 156, 'lab'],
  ['THE BELL LOFT', 86, 120, 'flip'],
  ['THE OPEN CROWN', 50, 84, 'dome'],
];
// the spine: a stair of ledges three rows apart that crosses the floor and back. [x0, len], cycled. Three rows is the
// knight's whole jump (reachcore JUMP_UP), and at the top of it he carries about two tiles across, so each ledge
// overlaps or touches the one under it: the climb reads at a glance and never asks for a jump nobody can make.
const SPINE = [[14, 10], [22, 9], [30, 10], [39, 9], [47, 10], [40, 9], [32, 10], [24, 9]];

export function buildTowerAscent({ painter, T, TS }) {
  const { W, H, X0, X1, SKY } = TOWER;
  const L = painter(W, H), { set, ent, coins } = L;
  const rect = (x0, x1, y0, y1, t) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, t); };
  rect(0, W - 1, 0, H - 1, T.SOLID);
  rect(0, W - 1, 0, SKY - 1, T.AIR);                                   // the sky over the crown
  const interiors = [], pools = [], moversExtra = [], nets = [], floors = [], breaks = [], hung = [];
  let cistern = null;
  const net = (x, y0, y1) => nets.push([x, y0, y1]);
  const deco = (kind, x, y, o) => ent('deco', x, y, Object.assign({ kind }, o || {}));
  const foe = (t, x, y, o) => ent(t, x, y, Object.assign({ face: x < 36 ? 1 : -1 }, o || {}));
  const ledge = (x0, len, row, t = T.ONEWAY) => rect(x0, x0 + len - 1, row, row, t);
  /* a pocket off a tier, four tiles past the end of its ledge (or before its start, against the far wall), with the silver on it */
  const pocket = ([x0, len, row]) => { const px = x0 + len + 4 <= X1 - 3 ? x0 + len + 4 : x0 - 7; ledge(px, 3, row); ent('silver', px + 1, row - 1); };
  // THE CRENELLATIONS: the tower's walls stand a few rows proud of the crown, merlons two wide with gaps between
  for (const [a, b] of [[X0 - 2, X0 - 1], [X1 + 1, X1 + 2]]) for (let y = SKY - 4; y < SKY; y++) if (((y - SKY) & 1) === 0 || y >= SKY - 2) rect(a, b, y, y, T.SOLID);

  FLOORS.forEach(([name, top, bot, kind], k) => {
    rect(X0, X1, top, bot - 1, T.AIR);
    interiors.push([X0, X1, top, bot - 1, kind]);
    // the tiers: from three over the floor up to three under the divider over it
    const tiers = []; let i = k * 2;                                      // each floor starts the stair somewhere else
    for (let row = bot - 3; row >= top + 3; row -= 3, i++) { const [x0, len] = SPINE[i % SPINE.length]; tiers.push([x0, len, row]); }
    floors.push({ name, top, bot, kind, tiers, divider: top - 2 });
  });

  // ---- 1. THE LIBRARY STACKS. Shelves stand to the ceiling on both walls; the stair between them is plank. ----
  { const F = floors[0];
    for (const [x0, x1, h] of [[X0, X0 + 1, 22], [X1 - 1, X1, 18], [X0, X0 + 3, 6], [X1 - 3, X1, 8]]) rect(x0, x1, F.bot - h, F.bot - 1, T.SOLID);   /* the stacks: solid bookcase, painted as library wall */
    for (const [x0, len, row] of F.tiers) ledge(x0, len, row, T.PLANK);
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE TOWER IS FALLING. CLIMB. EVERY FLOOR YOU LEAVE GOES DOWN BEHIND YOU.' });
    deco('lectern', 22, F.bot - 1); deco('bookpile', 38, F.bot - 1); deco('desk', 44, F.bot - 1); deco('candelabra', 50, F.bot - 1);
    const who = ['zombie', 'apprentice', 'broom', 'armour', 'zombie', 'husk', 'apprentice', 'imp', 'zombie', 'broom', 'apprentice'];
    F.tiers.forEach(([x0, len, row], j) => { const t = who[j % who.length], fly = t === 'broom' || t === 'imp'; foe(t, x0 + (len >> 1), fly ? row - 3 : row - 1); if (j % 3 === 1) deco('bookpile', x0 + 1, row - 1); });
    foe('apprentice', 16, F.bot - 1 - 6);
    ent('silver', X0 + 1, F.bot - 23);                                    /* on top of the tall stack: a jump off the third tier */
  }
  // ---- 2. THE ORRERY CAGE. Brass ledges and crystal ones, and a rope up the middle past the model's arms. ----
  { const F = floors[1];
    F.tiers.forEach(([x0, len, row], j) => ledge(x0, len, row, j % 3 === 2 ? T.CRYST : T.ONEWAY));
    ent('check', 20, F.bot - 1); ent('sign', 16, F.bot - 1, { text: 'THE ORRERY. CRYSTAL CRAZES UNDER YOU: DO NOT STAND ON IT LONG.' });
    deco('orreryBase', 36, F.bot - 1); deco('globe', 50, F.bot - 1); deco('telescope', 28, F.bot - 1);
    const who = ['imp', 'apprentice', 'boo', 'armour', 'bat', 'apprentice', 'haunt', 'imp', 'zombie', 'boo', 'apprentice'];
    F.tiers.forEach(([x0, len, row], j) => { const t = who[j % who.length], fly = ['imp', 'boo', 'bat', 'haunt'].includes(t); foe(t, x0 + (len >> 1), fly ? row - 3 : row - 1); });
    hung.push([24, F.top], [46, F.top]);                                  /* turrets under the divider, hung by mageReset */
    pocket(F.tiers[5]);                                                   /* a pocket off the sixth tier */
  }
  // ---- 3. THE BURST CISTERN. The cistern has let go: the floor is poison water, crossed on stones, and the first
  //      ledges over it give way when stood on. ----
  { const F = floors[2], surf = F.bot - 4;
    cistern = { surf, bot: F.bot };   /* its water is laid at the end, once the stones and the rope are in: see WATER ONLY WHERE THERE IS WATER */
    /* the stepping stones, their tops two rows over the water, laid from the one the orrery's rope comes up through */
    const [hx0, hlen] = floors[1].tiers[floors[1].tiers.length - 1], hx = hx0 + (hlen >> 1);
    for (let x = hx - 1 - 6 * 8; x < X1 - 2; x += 6) if (x > X0 + 10) rect(x, x + 1, surf - 2, F.bot - 1, T.SOLID);
    rect(X0, X0 + 8, surf - 2, F.bot - 1, T.SOLID); rect(X1 - 2, X1, surf - 2, F.bot - 1, T.SOLID);   /* the banks: the rope from the orrery comes up through the left one */
    F.tiers.forEach(([x0, len, row], j) => { if (row >= surf - 2) return; ledge(x0, len, row); });   /* (two of these ledges gave way 1.5 s after you stood on them. That was built for poison you could climb out of; since the cistern was made DEADLY (e0ab1dc) a ledge that gives way under you is a death with no answer - Daniel: 'impossible to beat'. They hold now) */
    ent('check', X0 + 2, surf - 3); ent('sign', X0 + 5, surf - 3, { text: 'THE CISTERN BURST. THE WATER IS POISON, AND THE LOW LEDGES WILL NOT HOLD YOU LONG.' });
    for (const [j, kind] of [[4, 'still'], [6, 'retorts'], [8, 'jars']]) { const [x0, , row] = F.tiers[j]; deco(kind, x0 + 2, row - 1); }   /* on the tier's own ledge */
    const who = ['husk', 'apprentice', 'imp', 'husk', 'zombie', 'apprentice', 'broom', 'husk', 'apprentice', 'imp'];
    F.tiers.filter(([, , row]) => row < surf - 2).forEach(([x0, len, row], j) => { const t = who[j % who.length], fly = t === 'broom' || t === 'imp'; foe(t, x0 + (len >> 1), fly ? row - 3 : row - 1); });
  }
  // ---- 4. THE BELL LOFT. The bells are gone through the floor; their frames carry lifts, and the ropes still hang. ----
  { const F = floors[3];
    /* the loft is laid by hand: the bell frames carry two lifts, one over the other, and the stair takes up above them */
    F.tiers = [[21, 10, 108], [34, 10, 99], [42, 10, 96], [34, 9, 93], [26, 9, 90]];
    for (const [x0, len, row] of F.tiers) ledge(x0, len, row);
    ent('mover', 18, 119, { len: 3, vert: true, rise: 11, period: 4.6 });  /* off the floor to the first frame (108) */
    ent('mover', 31, 108, { len: 3, vert: true, rise: 9, period: 4.2 });   /* and from its end to the second (99) */
    ledge(46, 8, 111); ledge(12, 6, 102);                                   /* the bell-ringers' walks: somewhere to stand and fight */
    const gone = () => false;
    ent('check', 50, F.bot - 1); ent('sign', 54, F.bot - 1, { text: 'THE BELL LOFT. ITS WARDEN HOLDS THE GATE TO THE FRAMES. RIDE THEM UP.' });   /* by the rope up from the cistern, clear of the warden's gate (ELITES, col 30) */
    const who = ['armour', 'bat', 'apprentice', 'haunt', 'zombie'];
    foe('armour', 50, 110); foe('apprentice', 14, 101); foe('bat', 24, 112); foe('boo', 40, 104); foe('haunt', 52, 100);;
    F.tiers.forEach(([x0, len, row], j) => { const t = who[j % who.length], fly = ['bat', 'haunt', 'boo', 'imp'].includes(t); if (!fly && gone(j)) return; foe(t, x0 + (len >> 1), fly ? row - 3 : row - 1); });
    pocket(F.tiers[2]);
  }
  // ---- 5. THE OPEN CROWN. The roof is gone. Broken ledges up the last floor to the parapet, and the carpet. ----
  { const F = floors[4];
    F.tiers.forEach(([x0, len, row], j) => ledge(x0, len, row, j % 4 === 3 ? T.CRYST : T.ONEWAY));
    rect(28, 43, SKY + 1, SKY + 1, T.SOLID);                              /* THE PARAPET WALK, three over the last tier: the carpet waits over it */
    ent('check', 30, F.bot - 1); ent('sign', 26, F.bot - 1, { text: 'THE CROWN. THE ROOF IS GONE. A CARPET WAITS AT THE TOP: STEP ON IT TO FLY.' });
    ent('check', 31, SKY); ent('sign', 40, SKY, { text: 'THE CARPET FLIES WHERE YOU STEER IT. HE CASTS FROM THE AIR: EVERY SPELL CAN BE OUT-FLOWN.' });
    deco('telescope', 36, F.bot - 1); deco('starChart', 24, F.top + 1, { hang: true });
    const who = ['imp', 'apprentice', 'bat', 'armour', 'boo', 'apprentice', 'haunt', 'imp', 'apprentice', 'bat', 'armour'];
    F.tiers.forEach(([x0, len, row], j) => { const t = who[j % who.length], fly = ['imp', 'bat', 'boo', 'haunt'].includes(t); foe(t, x0 + (len >> 1), fly ? row - 3 : row - 1); });
  }
  ent('gate', 34, SKY); ent('undeadmage', 36, 42, { face: -1 });                                               /* the way out, for the tools: the level ends on the kill (bossWon) */
  // ---- THE DIVIDERS AND THEIR ROPES. Each floor's rope hangs from its last tier, through the divider over it, to its top. ----
  for (let k = 0; k < floors.length - 1; k++) {
    const F = floors[k], [x0, len, row] = F.tiers[F.tiers.length - 1], rx = x0 + (len >> 1);
    let top = F.divider; while (L.grid[(top - 1) * W + rx] === T.SOLID) top--;   /* up through a bank that stands on the divider (the cistern's) */
    net(rx, top, row - 1); F.hole = [rx, F.divider, F.divider + 1];
  }
  // the falling stones: hung under each divider over the stair, where the hero passes under them
  for (const F of floors.slice(0, 4)) for (const j of [2, 7]) { const [x0, len] = F.tiers[j] || []; if (x0 === undefined) continue; const sx = x0 + 2; if (L.grid[(F.top) * W + sx] === T.AIR) ent('stal', sx, F.top, { stone: true }); }
  coins([30, 227], [34, 227], [26, 191], [40, 191], [30, 155 - 5], [36, 119], [40, 83]);
  coins([14, 170], [15, 170], [16, 170], [17, 170], [59, 191], [58, 191], [57, 191], [56, 191], [55, 229], [54, 229], [53, 229], [52, 229]);                               /* every dead end pays (tools/deadends.mjs): the pockets the stair leaves */

  // EVERY ROPE IS HUNG LAST (rule I): nothing is dug after this line
  for (const [x, y0, y1] of nets) for (let y = y0; y <= y1; y++) set(x, y, T.NET);
  /* WATER ONLY WHERE THERE IS WATER. The cistern was one pool from wall to wall, so the stones and the rope the orrery comes up
     by were 'in' it too - and since the water was made DEADLY (e0ab1dc) the climb up that rope killed you before you were out
     of it (Daniel: 'takes you right into poison water... impossible to beat'). One pool per open gap between the stones now:
     each four rows deep with a stone either side, so each is still a trap and still DEADLY (deadly-water.js). */
  if (cistern) { const { surf, bot } = cistern, open = x => L.grid[surf * W + x] === T.AIR && L.grid[(surf + 1) * W + x] === T.AIR;
    for (let x = X0; x <= X1; x++) { if (!open(x)) continue; let x1 = x; while (x1 + 1 <= X1 && open(x1 + 1)) x1++;
      pools.push({ x0: x * TS, x1: (x1 + 1) * TS, y: surf * TS + 4, depth: 3 * TS, bottom: bot * TS, harm: true, poison: true, deadly: true, foulCol: '#5c8a24', foulColL: '#a6e04a', foulColD: '#1c3212' }); x = x1; } }

  const skins = [[0, X0 - 1, SKY, H - 1, 'tower'], [X1 + 1, W - 1, SKY, H - 1, 'tower']].concat(floors.slice(0, 4).map(F => [X0, X1, F.divider, F.divider + 1, 'tower']), [[X0, X1, H - 10, H - 1, 'tower']]);
  const START = { x: 20, y: 229 };
  return {
    W, H, grid: L.grid, ents: L.ents, START, pools, falls: [], moversExtra, interiors, gusts: [],
    music: 'fallingtower', night: true, nightA: 0.12, edgeLit: true, duskStart: 99999, duskLen: 1, hasCryst: true,
    towerAscent: true, carpetAt: { x: 36 * TS, y: SKY * TS }, fallingTower: true, stackedFloors: true, skyRow: SKY,
    tall: { top: SKY * TS, bottom: 230 * TS, col: '26,20,40', deepest: 0.16 },
    towerFloors: floors.slice(0, 5).map((F, k) => ({ name: F.name, top: F.top, bot: F.bot, hole: F.hole || null, last: k === 4 })),
    deckBreaks: breaks.map(([x0, x1, row]) => ({ x0, x1, row, t: -1, down: false, regrow: true })),   /* spine ledges: they come back (updateTowerAscent), or a fall into the water would be a soft-lock */
    mage: { shelves: [], skins, hedges: [], chains: [], hung, outside: 0, dais: [30, 40] },
    palette: { sky: 'mage', far: 'mage', mid: 'mage', near: 'mage', dress: 'village', haze: 'rgba(120,90,180,0.10)',
      grass: '#4e6a52', grassL: '#6c8c70', grassD: '#34483a', dirt: '#4a4652', dirtL: '#645e6c', dirtD: '#2e2a36', canopy: ['#181428', '#221c36', '#2c2446', '#3a3058'] },
    weather: [], ambient: [{ x0: 0, x1: 99999, kind: 'hall' }],
    noCoin: [[0, W - 1, 0, SKY + 1]],
    /* THE SKY IS THE ARENA. trigger is never walked past: the carpet starts the fight when it is boarded (carpet.js) */
    arena: { x0: 4 * TS, x1: 68 * TS, y0: 34 * TS, floor: SKY * TS,   /* three screens wide and a little over one tall: he is never off the top of it */ trigger: 1e9, wallL: 0, wallR: W - 1, boss: 'undeadmage', carpet: true, music: 'boss4', tint: '#30334e', tintA: 0.06 },
  };
}

/* ================= THE FLOOR GOES UNDER YOU =================================================================
   A floor arms when the hero is on the first tier over the divider that caps it, falls after a fuse, and goes from its bottom
   row up. The rope's hole in the divider is filled the moment it goes, so there is no dropping back into it - but
   never while he is under the divider: then it waits and re-arms when he is above again. */
export function towerAscentReset(L, restore, cpRow = Infinity, clear = null, seal = null) {
  for (const f of L.towerFloors || []) { f.t = -1; f.front = null; f.done = false; f.sealed = false;
    for (let y = f.top - 2; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) restore(x, y);
    /* a floor wholly under the checkpoint you come back to is already gone: put it straight back the way you left it */
    if (clear && !f.last && f.top - 6 > cpRow) { for (let y = f.top; y < f.bot; y++) for (let x = TOWER.X0; x <= TOWER.X1; x++) clear(x, y);
      if (f.hole && seal) for (let y = f.hole[1]; y <= f.hole[2]; y++) seal(f.hole[0], y); f.done = true; f.sealed = true; } }
}
export function updateTowerAscent(L, P, dt, { change, crash, warn }) {
  if (!L.towerFloors || P.dead) return;
  const X0 = TOWER.X0, X1 = TOWER.X1;
  /* THE CISTERN'S LEDGES COME BACK UP. They are the stair, so one that gave way under you and dropped you in the water
     has to be there again when you have climbed out onto a stone - five seconds, and never while you are in its tiles */
  for (const z of L.deckBreaks || []) { if (!z.regrow || !z.down) { z.downT = 0; continue; }
    const f = L.towerFloors.find(f => z.row >= f.top && z.row < f.bot); if (f && (f.front !== null || f.done)) continue;
    z.downT = (z.downT || 0) + dt;
    if (z.downT > 5 && !(P.x > z.x0 * 16 - 8 && P.x < (z.x1 + 1) * 16 + 8 && Math.abs(P.y - z.row * 16) < 20)) { for (let x = z.x0; x <= z.x1; x++) change(x, z.row, 'restore'); z.down = false; z.t = -1; z.downT = 0; } }
  for (const f of L.towerFloors) {
    if (f.done || (f.last && !L.carpetUp)) continue;
    const above = P.y < (f.top - 4) * 16 || (f.last && L.carpetUp);   /* on the first tier over the divider, or higher */
    if (f.t < 0 && f.front === null) { if (above) { f.t = f.last ? 0.6 : 2.2; warn(f); } continue; }
    if (f.t >= 0) { f.t -= dt; if (f.t > 0) continue; f.t = -1;
      if (!above) continue;                                              /* he went back down through the hole: wait for him */
      f.front = f.bot - 1;
      if (f.hole && !f.last) { const [x, y0, y1] = f.hole; for (let y = y0; y <= y1; y++) change(x, y, 'seal'); f.sealed = true; } }
    if (f.front !== null) {
      const to = Math.max(f.top, f.front - dt * 20);
      for (let y = Math.floor(f.front); y >= Math.ceil(to); y--) { let n = 0; for (let x = X0; x <= X1; x++) if (change(x, y, 'fall')) n++; if (n && y % 3 === 0) crash(f, y); }
      f.front = to; if (to <= f.top) { f.front = null; f.done = true; }
    }
  }
}

// ---- carried over from tower-finish.js: the Folly's polish, the backdrop, the gate test ----
export function polishTower(L, id, T) {
  if (!['mage', 'fallingtower'].includes(id)) return L;
  L.palette.ledges = 'arcane'; L.towerBackdrop = true;
  if (id === 'mage') {
    L.mage.skins.unshift([118, L.W - 1, 0, L.H - 1, 'tower']);
    L.ents = L.ents.filter(e => !(e.t === 'deco' && ['gardenWall', 'campfire', 'cairn', 'fallenLog', 'tuft', 'flower', 'stone'].includes(e.kind) && e.x >= 118));
    for (const p of L.pools.filter(p => p.acid && !p.magePool)) for (let y = Math.floor(p.y / 16); y < Math.ceil(p.bottom / 16) + 1; y++) for (let x = p.x0 / 16; x < p.x1 / 16; x++) L.grid[y * L.W + x] = T.SOLID;
    L.pools = L.pools.filter(p => !p.acid || p.magePool);
    for (const e of L.ents) if (e.t === 'sign' && e.x === 268) e.text = 'THE ALCHEMY LAB. THE SEALED VATS STILL SPIT. GUARD THE SLOW GOB OR STEP ASIDE.';
  }
  return L;
}
export function drawTowerBackdrop(g, L, cx, cy) {
  if (!L.towerBackdrop) return; const lo = L.mage?.outside ?? 0;
  const start = Math.max(lo, Math.floor(cx / 16) - 2), end = Math.min(L.W, Math.ceil((cx + g.canvas.width) / 16) + 2);
  const sky = L.skyRow !== undefined ? Math.max(0, L.skyRow * 16 - cy) : 0;   /* the tower's ribs stop where the tower does: over the crown is sky */
  g.save(); g.beginPath(); g.rect(lo * 16 - cx, sky, L.W * 16, g.canvas.height); g.clip();
  for (let x = Math.floor(start / 12) * 12; x < end; x += 12) { const px = x * 16 - cx; g.fillStyle = '#242135'; g.fillRect(px, 0, 12, g.canvas.height); g.fillStyle = '#3b344e'; g.fillRect(px + 2, 0, 2, g.canvas.height);
    for (let y = Math.floor(cy / 192) * 192 - 192; y < cy + g.canvas.height; y += 192) { const py = y - cy + 38; g.fillStyle = '#161c36'; g.fillRect(px + 40, py, 35, 70); g.fillStyle = '#586087'; g.fillRect(px + 42, py + 2, 31, 1); g.fillStyle = '#3b395d'; g.fillRect(px + 56, py, 2, 70); g.fillRect(px + 40, py + 35, 35, 2); g.fillStyle = '#bec2d8'; g.fillRect(px + 47, py + 12, 2, 2); g.fillRect(px + 66, py + 25, 1, 1); } }
  g.restore();
}
export function gateOccupied(col, rows, actors) { return actors.some(p => p && !p.dead && rows.some(y => p.x + (p.w || 10) / 2 > col * 16 - 4 && p.x - (p.w || 10) / 2 < (col + 1) * 16 + 4 && p.y > y * 16 && p.y - (p.h || 14) < (y + 1) * 16)); }
