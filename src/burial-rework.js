// burial-rework.js — THE BURIAL CAVERNS, REWORKED (batch 4b, 2026-09-22). Brief: .claude/briefs/burial-rework.md.
// Daniel: "it's mostly just walk right". Everything you could stand on sat in one band seventeen rows deep. Now the road
// under the hill goes DOWN: where the Falling Gallery was, the floor is rotten and the way on is three depths down and back -
//
//   THE BARROW              the hill's own road, rows 16-48 (what was there: the candle path, the ossuary shelves, the sunk
//                           bridge, the old vault - and its first ambush)
//   THE CHARNEL GALLERIES   rows 37-58 under columns 598-716: three galleries stacked, walked east, west and east again, each
//                           dropping to the next; bone archers on the shelves, skull-throwers across, spiders on the ceilings;
//                           the second ambush in the middle gallery
//   THE DROWNED OSSUARY     rows 64-100 under 600-780: black water crossed on coffin lifts and swinging chains, and at its
//                           east end THE GRAVE WARDEN's round bone vault, open graves in its floor
//   and UP                  a shaft of chain and coffin lifts from the ossuary floor to the road, coming out between the
//                           Plague Vault's two green pools (the level's own rule: THE LOWER ROAD ALWAYS LEADS BACK UP)
//
// THE GRAVE CANDLES: three unlit candles, one in a side vault at each depth, the three silvers beside them (the level's quest).
export const DESCENT = { x0: 598, x1: 716, wall: [604, 714], g: [41, 49, 58], oss: [600, 780, 64, 100], vault: [716, 772, 84, 100], gate: 773, shaft: [775, 781] };

export function reworkBurial({ L, T, TS, interiors, structures, ex }) {
  const { set, block, ent, coins, plat } = L, W = L.W, at = (x, y) => L.grid[y * W + x];
  const cut = (a, b, t, bot) => { for (let y = t; y <= bot; y++) for (let x = a; x <= b; x++) set(x, y, T.AIR); };
  const net = (x, a, b) => { for (let y = a; y <= b; y++) set(x, y, T.NET); };
  const inZone = (x, y) => x >= 599 && x <= DESCENT.wall[1] && y <= 40;   /* (from 599: the Falling Gallery's own checkpoint stood over what is now the hole) */
  // ---- the Falling Gallery goes: its road is walled up and its things with it ----
  block(DESCENT.wall[0], DESCENT.wall[1], 16, 40);
  for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (inZone(e.x, e.y)) L.ents.splice(i, 1); }
  ex.pools = ex.pools.filter(p => !(p.x0 >= DESCENT.wall[0] * TS && p.x1 <= (DESCENT.wall[1] + 2) * TS));
  for (let i = structures.length - 1; i >= 0; i--) { const s = structures[i]; if (s.x0 >= DESCENT.wall[0] && s.x1 <= DESCENT.wall[1] && s.top < 40) structures.splice(i, 1); }
  for (let i = interiors.length - 1; i >= 0; i--) { const [a, b] = interiors[i]; if (a >= 600 && b <= 719) interiors.splice(i, 1); }
  interiors.push([598, 603, 16, 31, 'ossuary']);
  ent('sign', 596, 31, { text: 'THE FLOOR IS ROTTEN AND THE ROAD IS DOWN. THE LOWER ROAD ALWAYS LEADS BACK UP.' });

  // ---- 1. THE ROTTEN FLOOR: a hole in the road, down into the galleries ----
  cut(599, 602, 32, 36);

  // ---- 2. THE CHARNEL GALLERIES: one hall, three galleries stacked in it ----
  cut(598, 716, 37, 58); interiors.push([598, 716, 37, 58, 'ossuary']);
  block(598, 700, 42, 43);                       // gallery one: land from the hole, walk east; its east end is open to fall
  block(611, 716, 50, 51);                       // gallery two: walk west; its west end is open
  block(598, 716, 59, 59);                       // gallery three's floor
  for (const [x, y, n] of [[640, 39, 5], [672, 38, 6], [626, 46, 5], [660, 46, 6], [688, 47, 5], [636, 55, 5], [676, 55, 5]]) { plat(x, y, n); structures.push({ x0: x, x1: x + n - 1, top: y, floor: y + 3, kind: 'arch' }); }
  ent('check', 604, 41); ent('sign', 606, 41, { text: 'THE CHARNEL GALLERIES. EACH ONE ENDS IN A DROP TO THE NEXT.' });
  for (const [t, x, y] of [['bonearcher', 642, 38], ['bonearcher', 674, 37], ['bonegob', 620, 41], ['zombie', 655, 41], ['bonegob', 690, 41], ['spider', 630, 37], ['spider', 682, 37],
                           ['bonearcher', 662, 45], ['husk', 640, 49], ['bonegob', 675, 49], ['spider', 650, 45],
                           ['bonearcher', 638, 54], ['zombie', 620, 58], ['bonegob', 660, 58], ['husk', 690, 58], ['spider', 668, 53], ['boo', 700, 55], ['bat', 615, 53]])
    ent(t, x, y, { face: -1 });
  for (let x = 606; x < 700; x += 12) { ent('torch', x, 41); coins([x + 4, 40]); }
  for (let x = 620; x < 712; x += 14) { ent('torch', x, 49); coins([x + 3, 48]); }
  for (let x = 604; x < 700; x += 13) { ent('torch', x, 58); coins([x + 5, 57]); }
  ent('check', 706, 49);
  // the first grave candle, in a side vault off the east end of gallery three, a silver with it
  cut(717, 722, 55, 58); ent('stray', 720, 58, { kind: 'lamp' }); ent('silver', 721, 58); ent('deco', 718, 58, { kind: 'grave' });
  // THE SECOND AMBUSH: the middle gallery's doors seal and the dead come out of the shelves
  const ambushes = [{ name: 'THE CHARNEL HOUSE', row: 49, y0: 45, wallL: 613, wallR: 704, check: [706, 49],   /* y0: only the middle gallery's own floor sets it off - the galleries above and below share its columns */
    waves: [[['zombie', 630], ['bonegob', 650], ['zombie', 670], ['bonearcher', 690, 45]], [['husk', 640], ['bonegob', 665], ['zombie', 685], ['bonearcher', 626, 45], ['wight', 700]]] }];

  // ---- 3. THE DROWNED OSSUARY ----
  const [ox0, ox1, oy0, oy1] = DESCENT.oss;
  cut(706, 710, 59, 63);                          // the rotten floor at the end of gallery three: down into the water
  cut(ox0, ox1, oy0, oy1); block(ox0, ox1, oy1 + 1, oy1 + 1); interiors.push([ox0, ox1, oy0, oy1, 'ossuary']);
  const pools = [{ x0: (ox0 + 4) * TS, x1: 711 * TS, y: 95 * TS, depth: 5 * TS, bottom: (oy1 + 1) * TS, swim: true, clear: true, foulCol: '#1e2a2e', foulColL: '#3a5a5e', foulColD: '#0e1416' }];
  // a stone pier on each side of the black water, coffin lifts and swinging chains between
  block(ox0, ox0 + 3, 93, oy1); block(711, 715, 93, oy1);   /* two rows over the water: a swimmer climbs out onto either */
  const moversExtra = [];
  for (const [x, rise, ph] of [[622, 6, 0], [648, 7, 1.4], [674, 6, 2.6], [696, 7, 0.8]]) ent('mover', x, 92, { len: 3, vert: true, rise, period: 4.4, ph });
  for (const [px, ph] of [[636, 0], [660, 1.2], [686, 2.2]]) moversExtra.push({ kind: 'swing', px: px * TS, py: oy0 * TS, arm: 17 * TS, x: 0, y: 0, w: 40, h: 8, period: 3.4, phase: ph });
  for (const [x, y, n] of [[630, 84, 5], [656, 80, 5], [682, 84, 5]]) { plat(x, y, n); structures.push({ x0: x, x1: x + n - 1, top: y, floor: 95, kind: 'arch' }); }
  ent('check', ox0 + 2, 92); ent('sign', ox0 + 1, 92, { text: 'THE DROWNED OSSUARY. THE COFFINS RISE AND THE CHAINS SWING: CROSS ON THEM.' });
  for (const [t, x, y] of [['bonearcher', 632, 83], ['bonearcher', 684, 83], ['bonegob', 658, 79], ['bat', 640, 72], ['bat', 670, 70], ['boo', 700, 76], ['spider', 646, 65], ['spider', 690, 65]]) ent(t, x, y, { face: -1 });
  for (let x = 626; x < 708; x += 10) coins([x, 91]);
  // the second grave candle: a vault in the ossuary's west wall, over the water
  cut(593, 599, 86, 89); ent('stray', 595, 89, { kind: 'lamp' }); ent('silver', 597, 89); ent('torch', 594, 89);
  plat(600, 90, 4);                                // a step to it off the west pier, three rows up, level with the vault's floor

  // ---- 4. THE GRAVE WARDEN'S VAULT: round, bone-walled, open graves in the floor ----
  const [vx0, vx1, vy0, vy1] = DESCENT.vault;
  block(vx0 - 1, vx0 - 1, oy0, vy0 - 1);          // the vault's west wall over its door
  block(vx0, vx1, oy0, vy0 - 1);                  // and its roof
  interiors.push([vx0, vx1, vy0, vy1, 'ossuary']);
  const graves = [];
  for (const gx of [726, 742, 758]) { cut(gx, gx + 1, oy1 + 1, oy1 + 2); block(gx, gx + 1, oy1 + 3, oy1 + 3); graves.push(gx); ent('deco', gx + 3, oy1, { kind: 'grave' }); }
  ent('check', 712, 92);                          /* on the east pier, at his door */
  ent('sign', 714, 92, { text: 'THE GRAVEYARD KEEPER. DODGE HIS DIG BESIDE AN OPEN GRAVE AND THE GROUND GIVES.' });
  ent('gravewarden', 748, oy1, { face: -1, mini: true });
  for (let y = vy0; y <= oy1; y++) set(DESCENT.gate, y, T.PORT);   /* his door east, a portcullis: his death lifts it (miniEnd -> openGate) */
  for (const x of [720, 734, 752, 766]) ent('torch', x, oy1);

  // ---- 5. AND UP: the shaft to the road, between the Plague Vault's two pools ----
  const [sx0, sx1] = DESCENT.shaft;
  cut(sx0, sx1, 32, oy1); interiors.push([sx0, sx1, 32, oy1, 'ossuary']);
  net(sx1, 32, oy1);                              // the chain, all the way
  for (const [y, rise, ph] of [[92, 12, 0], [74, 12, 1.6], [56, 12, 3.2], [40, 7, 0.8]]) ent('mover', sx0 + 1, y, { len: 3, vert: true, rise, period: 5, ph });
  for (const y of [86, 68, 50]) plat(sx0, y, 2);  // rests on the way up
  for (const y of [90, 70, 50, 36]) coins([sx0 + 3, y]);
  for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (e.x >= sx0 && e.x <= sx1 && e.y <= 32) L.ents.splice(i, 1); }   /* nothing left standing on the road over the shaft's mouth */
  ent('sign', sx1 + 2, 31, { text: 'THE LOWER ROAD LEADS BACK UP. THE BURIED DEAD WAIT AT THE END OF THE HILL.' });

  // ---- THE THIRD CANDLE: in the Barrow, down the Restless Rows' crypt ----
  ent('stray', 584, 38, { kind: 'lamp' }); ent('silver', 582, 38);
  /* (the Old Vault was to be a second ambush; the house rule is one ambush room a level - tools/elites.mjs - so the Charnel House is it) */
  // the Barrow's three old silvers go: the silvers are the candles' now
  for (let i = L.ents.length - 1; i >= 0; i--) { const e = L.ents[i]; if (e.t === 'silver' && !((e.x === 721 && e.y === 58) || (e.x === 597 && e.y === 89) || (e.x === 582 && e.y === 38))) L.ents.splice(i, 1); }

  // ---- THE MIX: half the Barrow's walking dead become the other kinds (brief 4) ----
  let k = 0;
  for (const e of L.ents) { if (e.t !== 'zombie' || e.buried || e.y > 40) continue; const m = k++ % 4; if (m === 1) e.t = 'bonearcher'; else if (m === 3) e.t = 'bonegob'; }

  return {
    H: L.H, pools: ex.pools.concat(pools), moversExtra, ambushes, graves, graveRows: [oy1 + 1, oy1 + 2],
    quest: { n: 3, item: 'lamp', name: 'GRAVE CANDLES', done: 'THE DEAD ARE LIT' },
    mini: { name: 'THE GRAVEYARD KEEPER', x0: vx0 * TS, x1: (vx1 + 1) * TS, floor: (oy1 + 1) * TS, trigger: (vx0 + 4) * TS, wallL: vx0 - 1, gate: DESCENT.gate, boss: 'gravewarden', y0: vy0 * TS, y1: (oy1 + 2) * TS },
  };
}
