// src/grubbag.js - LORD GRUBBAG THE GLUTTON, THE KITCHEN GATE's boss (claude/kitchengate, the OPUS GREYBOX, 2026-10-25; concept scratch/concept-kitchengate.md, Daniel 10-01).
// The goblin queen's glutton of a brother, at the head of the high table. HE NEVER LEAVES HIS REINFORCED CHAIR - he only eats (KING GORM fights; Grubbag eats). This file is
// the fight, PURE (his moves, his phases, the serving line and its dishes, the pie oven, what a blow does to him, and the bot's plan); src/grubbag-hands.js binds it to the
// world (main.js) and draws him. tools/kitchengate.mjs checks it.
// HEADER (design-standard B1 / B11 / B14 / B15 / B17): A PUZZLE BOSS WITH THE LEVEL'S RULE AS HIS OPENING. He is NEVER invulnerable:
//   WELL FED, a blade lands at GB.fed (0.45, over the B15 floor; told: a dull slap and WELL FED). From above (a plunge on his belly) x GB.above.
//   THE LEVEL'S RULE IS HIS OPENING (B1, B17 - the level's verb is the fight's central mechanic): "STRIKE A BELLOWS AND ITS FIRE ROARS". THE PIE OVEN stands by the kitchen
//     hatch at the west end with its BELLOWS. Strike it: the oven ROARS and bakes a POWDER PIE (GB.oven.bake s, its gauge drawn), and the pie goes out on THE SERVING LINE -
//     the meat-hook rail under the roof that brings every dish from the hatch to his table (the level's hooks). He eats whatever reaches him - he cannot help it - and the
//     powder pie goes off in him (GB.choke.boom of him, the blast's own) and he is CHOKING (the shared OPEN read, B10: a gold ring and a timer) - GB.choke.t s, blades x GB.choke.mul, up to GB.choke.cap of him - then a
//     told WARD (B3: GB.ward s, a pale ring, WARDED x0.4) while he coughs it up. The oven must cool before it bakes again (GB.oven.cool s after the pie is gone).
//   STARVE HIM (the concept's other answer): every other dish on the line HEALS him (GB.dish.heal of him) and POWERS his next blow (x GB.dish.power). A dish hangs high on its hook -
//     a JUMPING blow knocks it off the line: it smashes, and he goes HUNGRY (GB.hungry.t s): weaker (blades x GB.hungry.mul) but angrier (his cooldowns x GB.hungry.cd). Strike
//     the POWDER PIE on the line and it bursts there (it singes you; the oven must cool again).
//   EVERY MOVE TOLD with its own windup and release pose (B16, src/grubbag-hands.js POSE) and its own sound; ONE NEW MOVE PER PHASE (B5); his phases change the line (greedier):
//     P1 (100-62%)  1 THE BELCH (head back, belly swelling, red !!): a ring runs out along the floor both ways - jump it
//                   2 THROWN FOOD (a drumstick up, yellow !): bones and drumsticks arc onto red rings at your spot - move off them
//                   3 THE GIANT FORK (drawn back low, yellow !): a long stab along the floor in front of his chair - block it or back off
//                   4 THE TABLE SLAM (both fists up, red !!): plates fly off the high table onto red rings, and the table end shakes - get off the table end
//     P2 (62-30%)   the dishes come faster, and 5 THE GRAVY FLOOD (a hand on the gravy cauldron, yellow !): the cauldron tips, a wave of gravy runs west along the floor - jump
//                   it or get up on a bench - and the floor it leaves is slow and slick for GB.flood.lie s
//     P3 (30-0%)    6 THE GRAB (he leans out of the chair, his arm drawn back, red !!): his arm sweeps out along the floor to take you as food - jump it or roll; caught, he
//                   bites (GB.grab.dmg) and throws you down the hall
//                 7 THE BELLY FLOP (claude/grubbagbig, Daniel 10-25 18:00 - his ONE added move, from P1; it does not replace the choke): he grips the chair's arms and heaves up
//                   out of it (red !!, his shadow and a red crush strip on the floor where he will land), rises over the table and comes down belly first; the crush under
//                   him and a shockwave each way along the floor - out from under the shadow (west: his body is east), then jump the shock; he lies WINDED a moment (blades
//                   land whole: a punish, not the choke's x2) and rolls back up into his chair
//   NO ADDS (Daniel: no adds unless the brief says so - the serving line is the "servers"; see the lane report's questions).
/* (claude/kitchengateart TUNE, BOT_PROFILE=human + flasks, campaign L19, n=12: knight 10, warden 11, pyro 3 = 67%; mash 0/6) THE CHOKE RUNS ITS WHOLE choke.t FOR EVERY HERO (the purse empties but the opening does not end early: the cycle was the knight 45 s / the pyro 95 s apart),
   boom 0.14 + cap 0.12 per choke, the giant fork 10 (a shield turns it, a pyro cannot: it was the pyro's worst hurt), dmgMul 1.5 on every blow he lands (src/grubbag-hands.js bzD) */
/* (claude/grubbagbig, Daniel 10-25: "enormous ... about double the size of the queen ... extremely fat") HE IS ~4x THE PIXELS HE WAS: his box is his belly and chest (w x h, was 52 x 46),
   and every reach is RE-DERIVED from where the art puts it (src/redraw/grubbag_art.js BIG / src/grubbag-hands.js POSE), not stretched: the fork's tip GB.w / 2 + reach = 205 px from his
   middle, its stab low along the floor; the grab's hand GB.grab.hand each side; the belch's rings out of his flanks (GB.w / 2); the gravy from the tureen on the table's end
   (flood.from); the plates up off a table 40 high; the bellows a box GB.oven.box each side of a bellows twice the size. */
/* (claude/grubbagbig TUNE, BOT_PROFILE=human + flasks, campaign L19, n=12: knight 6, warden 7, pyro 12 = 69%) THE BOT FIX FIRST: src/lab.js's grubbag branch never let go of the attack key,
   so a hero wound heavies the whole walk to the oven (the pyro crossed his hall at a third of the knight's pace) - the 10-25 kitchengateart rates were measured through it.
   With it fixed every hero won (97%). His fight is ~5 chokes (each choke is boom + cap of his MAX hp, so hp does not set its length): boom 0.11 + cap 0.09 (20% a choke,
   was 29%) makes it ~6 cycles, 122-158 s; dmgMul 2.45 on every blow he lands; rest 1.2/1.0/0.85; thrown food 11; the grab 20 (it was the knight's one-blow death at x2.45) */
export const GB = {
  hp: 3600, w: 150, h: 120, markH: 196,
  fed: 0.45, above: 0.7, wardMul: 0.4,
  p2: 0.62, p3: 0.3,
  rest: [1.2, 1.0, 0.85],
  belch: { tell: [0.95, 0.85, 0.8], sp: 155, life: 2.8, h: 14, w: 9, dmg: 13, rec: 0.7 },
  food: { tell: [0.8, 0.72, 0.65], n: [2, 3, 3], flight: 1.05, r: 15, dmg: 11, spread: 64, rec: 0.6 },
  fork: { tell: [0.72, 0.64, 0.58], t: 0.34, reach: 130, h: 8, dmg: 10, chip: 0.7, rec: 0.75, range: 190 },
  slam: { tell: [1.0, 0.92, 0.85], n: 4, flight: 0.9, r: 16, dmg: 9, shock: 10, shockDmg: 12, rec: 0.8, top: 44 },
  flood: { tell: 1.0, sp: 120, h: 12, dmg: 13, lie: 4, slow: 0.55, rec: 0.9, from: 118 },
  grab: { tell: 0.85, t: 0.55, reach: 210, h: 26, hand: 20, dmg: 20, rec: 0.9, throwV: 260 },
  /* THE BELLY FLOP (claude/grubbagbig, Daniel 10-25 18:00): he heaves out of the chair (tell), rises over the table (air, rise px at the top of the arc) and comes down belly first on
     the floor at the spot told by his shadow (crush px each side of it); the floor's shockwave runs out both ways from the crush's edges (shockSp, shockLife; jump it); then he lies
     there winded (down s, blades x mul - a punish, not the choke) and rolls back up into his chair (roll s). p: his chance at a pick; never twice in three picks. */
  flop: { tell: [1.15, 1.05, 0.95], air: 0.62, rise: 44, crush: 84, h: 64, dmg: 16, shock: 9, shockSp: 190, shockLife: 1.3, shockW: 11, down: 1.5, roll: 0.75, mul: 1, lieW: 200, lieH: 72, p: 0.2, reach: 470, aim: 36 },   /* aim: his shadow's middle this far behind you (toward his chair): out from under it is always west, the way you can run (his body is east) */
  choke: { t: 9, mul: 2, cap: 0.09, boom: 0.11 },
  ward: 2.6, coughRest: 2.2,
  eat: 0.7,
  dish: { every: [9, 7.5, 6.5], v: 120, heal: 0.005, power: 1.3, hang: 64, box: 8 },
  hungry: { t: 6, mul: 0.7, cd: 0.8 },
  oven: { bake: 1.3, cool: 2.5, burst: 10, box: 16 },
  bz: { hurt: 1.5 }, dmgMul: 2.45,
};
export const GB_SAY = { wake: 'LORD GRUBBAG THE GLUTTON', rule: 'STOKE THE OVEN: IT BAKES A POWDER PIE, AND HE EATS WHATEVER THE LINE BRINGS HIM.', p2: 'MORE! FASTER!', p3: 'HE REACHES FOR YOU',
  bake: 'THE OVEN BAKES A POWDER PIE', pie: 'THE POWDER PIE GOES OUT ON THE LINE', choke: 'HE CHOKES ON IT', ward: 'HE COUGHS IT UP', eats: 'HE EATS: HEALED', powered: 'FED: HIS NEXT BLOW IS HEAVIER',
  smash: 'THE DISH SMASHES: HE GOES HUNGRY', hungry: 'HUNGRY', burst: 'THE PIE BURSTS ON THE LINE', cool: 'THE OVEN COOLS', ready: 'THE OVEN IS HOT AGAIN', flood: 'THE GRAVY: JUMP IT, OR A BENCH',
  grab: 'THE GRAB: JUMP IT', flop: 'THE BELLY FLOP: OUT FROM UNDER HIS SHADOW, THEN JUMP THE SHOCK', winded: 'WINDED', belch: 'THE BELCH: JUMP THE RING', fork: 'THE FORK: BLOCK IT, OR BACK OFF', slam: 'THE PLATES: OFF THE TABLE END', caught: 'CAUGHT: HE BITES' };
export const OPEN_NAME = { choke: 'CHOKING' };
export const gbOpen = e => !!e && e.mode === 'choke';
const TELLS = new Set(['belchTell', 'throwTell', 'forkTell', 'slamTell', 'floodTell', 'grabTell', 'flopTell']);
export const FLOP_MODES = new Set(['flopTell', 'flop', 'flopDown', 'flopRoll']);
export const gbTelling = e => TELLS.has(e.mode);
/* THE HIGH TABLE'S HALL (px): x0/x1 inside the walls, floorY; his chair; the table; the oven and its bellows; the serving line (its two ends) */
export function geom(A, TS = 16) {
  const [lx0, ly0, lx1, ly1] = A.line || [0, 0, 0, 0];
  return { x0: A.x0, x1: A.x1, floorY: A.floor, mid: (A.x0 + A.x1) / 2, chairX: A.chair * TS + 8, table: [A.table[0] * TS, (A.table[1] + 1) * TS], ovenX: A.oven * TS + 8, bellowsX: A.bellows * TS + 8,
    line: { x0: lx0 * TS + 8, y0: ly0 * TS, x1: lx1 * TS + 8, y1: ly1 * TS }, TS };
}
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, last: [], restT: 1.4, hungry: 0, powered: false, purse: 0, items: [], dishT: 3.0, oven: { st: 'cold', t: 0 }, waves: [], throws: [], floods: [], gravy: 0, told: {},
    n: { belch: 0, throw: 0, fork: 0, slam: 0, flood: 0, grab: 0, flop: 0, flopHits: 0, caught: 0, dishes: 0, eaten: 0, healed: 0, smashed: 0, pies: 0, chokes: 0, bursts: 0, stokes: 0, fedHits: 0, openHits: 0, wardHits: 0 } };
}
const cdK = S => (S.hungry > 0 ? GB.hungry.cd : 1);
/* the line: an item's place at x (px) - the hook's y on the rail and the dish's y under it */
export const lineY = (G, x) => G.line.y0 + (G.line.y1 - G.line.y0) * Math.max(0, Math.min(1, (x - G.line.x0) / Math.max(1, G.line.x1 - G.line.x0)));
export const dishY = (G, it) => it.state === 'down' ? G.floorY - GB.dish.hang - it.k * 6 : G.floorY - GB.dish.hang;
export const dishBox = (G, it) => { const y = dishY(G, it); return { l: it.x - GB.dish.box, r: it.x + GB.dish.box, t: y - GB.dish.box, b: y + GB.dish.box }; };
/* A HERO'S BLOW ON THE OVEN'S BELLOWS: it roars and bakes a powder pie (if it is cold) */
export function stokeOven(S, w) {
  if (S.oven.st !== 'cold') { if (!S.told.notYet) { S.told.notYet = 1; w.number(S.G.bellowsX, S.G.floorY - 50, S.oven.st === 'bake' ? GB_SAY.bake : GB_SAY.cool, '#c9b27c'); } return false; }
  S.oven.st = 'bake'; S.oven.t = GB.oven.bake; S.n.stokes++; w.sound('roar'); w.oven(true);
  if (!S.told.bake) { S.told.bake = 1; w.number(S.G.ovenX + 30, S.G.floorY - 70, GB_SAY.bake, '#ffd36b'); }
  return true;
}
/* A HERO'S BLOW ON A DISH ON THE LINE: it smashes (he goes hungry) - or a pie bursts */
export function smashItem(S, it, w) {
  if (!it || it.state !== 'ride') return false;
  it.state = 'gone';
  if (it.kind === 'pie') { S.n.bursts++; w.burst(it.x, S.G.floorY - GB.dish.hang); w.hitArea([it.x - 22, it.x + 22, S.G.floorY - GB.dish.hang - 30, S.G.floorY], GB.oven.burst, 'pie', 'pb' + it.id); w.number(it.x, S.G.floorY - 90, GB_SAY.burst, '#ff9a5c'); S.oven.st = 'cool'; S.oven.t = GB.oven.cool; return true; }
  S.n.smashed++; S.hungry = GB.hungry.t; S.powered = false; w.smash(it.x, S.G.floorY - GB.dish.hang); w.number(it.x, S.G.floorY - 90, GB_SAY.smash, '#8fd160'); w.sound('smash');
  return true;
}
/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/grubbag-hands.js world()) ---------- */
export function stepGrubbag(e, S, dt, heroes, w) {
  const G = S.G, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; S.hungry = Math.max(0, S.hungry - dt); S.gravy = Math.max(0, S.gravy - dt);
  stepOven(S, dt, w); stepLine(e, S, dt, w); stepThrows(S, dt, w); stepWaves(S, dt, heroes, w); stepFloods(S, dt, heroes, w);
  if (e.mode === 'sleep') return;
  e.modeT -= dt;
  const i = S.ph - 1, dx = P ? P.x - e.x : 0, ad = Math.abs(dx);
  if (P && !FLOP_MODES.has(e.mode)) e.face = Math.sign(dx) || e.face;
  if (e.mode === 'sit' || e.mode === 'recover') {
    if (S.ph < 2 && e.hp <= e.maxHp * GB.p2) { phase(e, S, 2, w); return; }
    if (S.ph < 3 && e.hp <= e.maxHp * GB.p3) { phase(e, S, 3, w); return; } }
  const pw = S.powered ? GB.dish.power : 1;
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'sit'; S.restT = 1.2; } return;
    case 'sit': {
      /* a dish (or the pie) waiting at his mouth: he eats it */
      const it = S.items.find(q => q.state === 'wait'); if (it) { eat(e, S, it, w); return; }
      S.restT -= dt; if (S.restT > 0 || !P || !P.alive) return; S.P0 = P; pick(e, S, ad, w); return; }
    case 'eat': if (e.modeT <= 0) { const it = e.eating; e.eating = null; if (it && it.kind === 'pie') { choke(e, S, w); return; } e.mode = 'sit'; S.restT = 0.5; } return;
    case 'belchTell': if (e.modeT <= 0) { e.mode = 'belch'; e.modeT = 0.4; w.sound('belch'); w.shake(5); const n = (S.ph > 2 ? 2 : 1) + (S.powered ? 1 : 0); S.powered = false;
        for (let k = 0; k < n; k++) for (const d of [-1, 1]) S.waves.push({ x: e.x + d * (GB.w / 2 - 4), dir: d, life: GB.belch.life, delay: k * 0.45, key: 'bw' + S.act + d + k, dmg: GB.belch.dmg * (n > 1 && k ? 1 : pw) }); }
      return;
    case 'belch': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.belch.rec; } return;
    case 'throwTell': if (e.modeT <= 0) { e.mode = 'throw'; e.modeT = 0.35; w.sound('throw'); const px = P ? P.x : G.mid, n = GB.food.n[i] + (S.powered ? 1 : 0); S.powered = false;
        const xs = [px, px - GB.food.spread, px + GB.food.spread, px - GB.food.spread * 2].slice(0, n).map(x => Math.max(G.x0 + 12, Math.min(G.x1 - 12, x)));
        xs.forEach((tx, k) => S.throws.push({ x0: e.x - e.face * 4, y0: G.floorY - GB.h - 6, tx, ty: G.floorY, t: -k * 0.12, T: GB.food.flight, key: 'th' + S.act + '.' + k, dmg: GB.food.dmg * pw, plate: false })); }
      return;
    case 'throw': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.food.rec; } return;
    case 'forkTell': if (e.modeT <= 0) { e.mode = 'fork'; e.modeT = GB.fork.t; e.hitKey = 'fk' + S.act; e.forkPw = pw; S.powered = false; w.sound('stab'); } return;
    case 'fork': { const f = e.face, k = 1 - e.modeT / GB.fork.t, tip = e.x + f * (GB.w / 2 + GB.fork.reach * Math.min(1, k * 2.2));
      w.hit([Math.min(e.x + f * GB.w / 2, tip), Math.max(e.x + f * GB.w / 2, tip), G.floorY - GB.fork.h - 10, G.floorY], GB.fork.dmg * (e.forkPw || 1), 'fork', { key: e.hitKey, blockable: true, blockChip: GB.fork.chip, knock: f * 170 });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.fork.rec; } return; }
    case 'slamTell': if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = 0.4; w.sound('slam'); w.shake(7); const pwk = pw; S.powered = false;
        const tx0 = G.table[0], near = Math.max(G.x0 + 14, tx0 - 230);
        for (let k = 0; k < GB.slam.n; k++) { const tx = near + (k + 0.5) * (tx0 - near) / GB.slam.n + (Math.random() - 0.5) * 30, aim = k === 1 && P ? Math.max(near, Math.min(tx0, P.x)) : tx;
          S.throws.push({ x0: (G.table[0] + G.table[1]) / 2, y0: G.floorY - GB.slam.top, tx: aim, ty: G.floorY, t: -k * 0.08, T: GB.slam.flight, key: 'pl' + S.act + '.' + k, dmg: GB.slam.dmg * pwk, plate: true }); }
        w.hitArea([G.table[0] - GB.slam.shock, G.x1, G.floorY - GB.slam.top, G.floorY], GB.slam.shockDmg * pwk, 'slam', 'sl' + S.act); }
      return;
    case 'slam': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.slam.rec; } return;
    case 'floodTell': if (e.modeT <= 0) { e.mode = 'flood'; e.modeT = 0.5; w.sound('flood'); S.floods.push({ x: e.x - GB.flood.from, dir: -1, key: 'fl' + S.act, dmg: GB.flood.dmg * pw }); S.powered = false; S.gravy = GB.flood.lie + 3; } return;
    case 'flood': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.flood.rec; } return;
    case 'grabTell': if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = GB.grab.t; e.hitKey = 'gr' + S.act; e.grabDir = e.face; e.grabPw = pw; S.powered = false; w.sound('grab'); } return;
    case 'grab': { const k = 1 - e.modeT / GB.grab.t, out = GB.grab.reach * Math.sin(Math.min(1, k) * Math.PI), f = e.grabDir || e.face, hand = e.x + f * (GB.w / 2 + out); e.handX = hand;
      const res = w.hit([hand - GB.grab.hand, hand + GB.grab.hand, G.floorY - GB.grab.h, G.floorY], GB.grab.dmg * (e.grabPw || 1), 'grab', { key: e.hitKey, throwV: f * GB.grab.throwV });
      if (res === 'hit' || res === 'blocked') { S.n.caught++; w.number(hand, G.floorY - 60, GB_SAY.caught, '#ff6b6b'); }
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.grab.rec; e.handX = null; } return; }
    /* THE BELLY FLOP: up out of the chair, over the table, down on the shadow; the shockwave; winded on the floor; rolled back up into the chair */
    case 'flopTell': if (e.modeT <= 0) { e.mode = 'flop'; e.modeT = GB.flop.air; e.flopFrom = e.x; e.flopPw = pw; S.powered = false; w.sound('flopUp'); } return;
    case 'flop': { const F = GB.flop, k = Math.max(0, Math.min(1, 1 - e.modeT / F.air)), ease = k * k * (3 - 2 * k);
      e.x = e.flopFrom + (e.landX - e.flopFrom) * ease; e.flopY = F.rise * Math.sin(k * Math.PI); e.y = G.floorY - e.flopY;
      if (e.modeT <= 0) { e.x = e.landX; e.flopY = 0; e.y = G.floorY; e.w = F.lieW; e.h = F.lieH; const pk = e.flopPw || 1;
        w.hitArea([e.landX - F.crush, e.landX + F.crush, G.floorY - F.h, G.floorY + 2], F.dmg * pk, 'flop', 'fp' + S.act);
        for (const d of [-1, 1]) S.waves.push({ x: e.landX + d * F.crush, dir: d, life: F.shockLife, delay: 0, key: 'fw' + S.act + d, dmg: F.shock * pk, sp: F.shockSp, hw: F.shockW, kind: 'flop', name: 'flopShock' });
        w.shake(12); w.sound('flop'); w.dust(e.landX - F.crush * 0.6, G.floorY, 12); w.dust(e.landX + F.crush * 0.6, G.floorY, 12); w.fx('flop', e.landX, G.floorY);
        e.mode = 'flopDown'; e.modeT = F.down; w.number(e.x, G.floorY - F.lieH - 30, GB_SAY.winded, '#ffd36b'); }
      return; }
    case 'flopDown': if (e.modeT <= 0) { e.mode = 'flopRoll'; e.modeT = GB.flop.roll; w.sound('flopUp'); } return;
    case 'flopRoll': { const k = Math.max(0, Math.min(1, 1 - e.modeT / GB.flop.roll)); e.x = e.landX + (G.chairX - e.landX) * k;
      if (e.modeT <= 0) { e.x = G.chairX; e.y = G.floorY; e.w = GB.w; e.h = GB.h; e.face = e.chairFace || e.face; e.mode = 'recover'; e.modeT = 0.35; }
      return; }
    case 'choke': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = 0.5; e.coughed = true; S.ward = GB.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - GB.h - 26, GB_SAY.ward, '#c8d8e8'); w.sound('cough'); } return;
    case 'recover': if (e.modeT <= 0) { e.mode = 'sit'; S.restT = e.coughed ? GB.coughRest : GB.rest[i] * cdK(S); e.coughed = false; } return;   /* (after the choke he coughs a while before his next blow: time to step back) */
    default: e.mode = 'sit';
  }
}
function phase(e, S, ph, w) {
  S.ph = ph; e.phase = ph; w.music(ph); w.sound('roar'); w.shake(6);
  w.number(e.x, e.y - GB.h - 30, ph === 2 ? GB_SAY.p2 : GB_SAY.p3, '#ff6b6b');
  S.act++; if (ph === 2) { e.mode = 'floodTell'; e.modeT = GB.flood.tell; S.n.flood++; w.mark('!'); if (!S.told.flood) { S.told.flood = 1; w.number(S.G.mid, S.G.floorY - 110, GB_SAY.flood, '#ffd36b'); } }
  else { e.mode = 'grabTell'; e.modeT = GB.grab.tell; S.n.grab++; w.mark('!!'); if (!S.told.grab) { S.told.grab = 1; w.number(S.G.mid, S.G.floorY - 110, GB_SAY.grab, '#ff6b6b'); } }
}
function eat(e, S, it, w) { it.state = 'eaten'; e.mode = 'eat'; e.modeT = GB.eat; e.eating = it; w.sound('chew');
  if (it.kind === 'dish') { S.n.eaten++; const h = Math.round(e.maxHp * GB.dish.heal); e.hp = Math.min(e.maxHp, e.hp + h); S.n.healed += h; S.powered = true; w.number(e.x, e.y - GB.h - 20, GB_SAY.eats, '#8fd160');
    if (!S.told.powered) { S.told.powered = 1; w.number(e.x, e.y - GB.h - 36, GB_SAY.powered, '#ffd36b'); } } }
function choke(e, S, w) {
  e.mode = 'choke'; e.modeT = GB.choke.t; e.openT0 = e.modeT; S.purse = e.maxHp * GB.choke.cap; S.n.chokes++; S.oven.st = 'cool'; S.oven.t = GB.oven.cool;
  const boom = Math.round(e.maxHp * GB.choke.boom); e.hp = Math.max(1, e.hp - boom); S.n.boom = (S.n.boom || 0) + boom; w.number(e.x, e.y - GB.h - 40, '-' + boom, '#ff9a3c');   /* THE PIE GOES OFF IN HIM: the powder's own share, whoever stoked it */
  w.shake(9); w.sound('boom'); w.fx('open', e.x, e.y); w.number(e.x, e.y - GB.h - 26, GB_SAY.choke, '#ffd36b');
}
/* WHICH MOVE: close in, the fork or the slam; at range, the belch, the food, the flood (P2) or the grab (P3). Never the same move three times running. */
function pick(e, S, ad, w) {
  const ph = S.ph, i = ph - 1, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k, r = Math.random();
  const nearTable = S.G && ad < GB.fork.range;
  let k;
  if (nearTable) k = r < 0.42 ? 'fork' : r < 0.72 ? 'slam' : r < 0.86 ? 'belch' : ph > 2 ? 'grab' : 'throw';
  else k = r < 0.34 ? 'throw' : r < 0.62 ? 'belch' : ph > 1 && r < 0.8 ? 'flood' : ph > 2 && ad < GB.grab.reach + 30 ? 'grab' : r < 0.9 ? 'throw' : 'belch';
  if (twice(k)) k = k === 'throw' ? 'belch' : k === 'belch' ? 'throw' : k === 'fork' ? 'slam' : 'belch';
  /* THE BELLY FLOP: only at a hero on his table's side of him (west: the wall is at his back), in reach, and never twice in three picks */
  { const G = S.G, P = S.P0; if (P && G && P.x < G.chairX - GB.w / 2 && ad < GB.flop.reach && !last.slice(0, 2).includes('flop') && Math.random() < GB.flop.p) k = 'flop'; }
  last.unshift(k); last.length = Math.min(last.length, 3); S.act++; S.n[k]++;
  const T = { belch: ['belchTell', GB.belch.tell[i], '!!', 'belchTell'], throw: ['throwTell', GB.food.tell[i], '!', 'throwTell'], fork: ['forkTell', GB.fork.tell[i], '!', 'forkTell'],
    slam: ['slamTell', GB.slam.tell[i], '!!', 'slamTell'], flood: ['floodTell', GB.flood.tell, '!', 'floodTell'], grab: ['grabTell', GB.grab.tell, '!!', 'grabTell'], flop: ['flopTell', GB.flop.tell[i], '!!', 'flopTell'] }[k];
  if (k === 'flop') { const G = S.G, F = GB.flop, lo = G.x0 + F.crush + 40, hi = G.chairX - GB.w / 2 + 30; e.landX = Math.max(lo, Math.min(hi, S.P0 ? S.P0.x + F.aim : hi)); e.chairFace = e.face; e.face = -1; }
  e.mode = T[0]; e.modeT = T[1]; w.mark(T[2]); w.sound(T[3]);
  const sayK = { belch: 'belch', fork: 'fork', slam: 'slam', flop: 'flop' }[k]; if (sayK && !S.told[sayK]) { S.told[sayK] = 1; w.number(S.G.mid, S.G.floorY - 120, GB_SAY[sayK], T[2] === '!!' ? '#ff6b6b' : '#ffd36b'); }
}
/* THE PIE OVEN: bake -> the pie goes out on the line; cool -> cold (ready) */
function stepOven(S, dt, w) {
  const o = S.oven; if (o.st === 'bake') { o.t -= dt; if (o.t <= 0) { o.st = 'out'; S.n.pies++; S.items.push({ id: ++S.act, kind: 'pie', x: S.G.line.x0, state: 'ride', k: 0 }); w.sound('pie'); w.oven(false);
      if (!S.told.pie) { S.told.pie = 1; w.number(S.G.ovenX + 40, S.G.floorY - 90, GB_SAY.pie, '#ffd36b'); } } return; }
  if (o.st === 'out' && !S.items.some(q => q.kind === 'pie' && q.state !== 'gone' && q.state !== 'eaten')) { o.st = 'cool'; o.t = GB.oven.cool; }
  if (o.st === 'cool') { o.t -= dt; if (o.t <= 0) { o.st = 'cold'; if (!S.told.ready) { S.told.ready = 1; w.number(S.G.bellowsX, S.G.floorY - 50, GB_SAY.ready, '#ffd36b'); } } }
}
/* THE SERVING LINE: a dish out of the hatch every GB.dish.every s; each rides to his table, and is lowered to him (he eats it when he is free) */
function stepLine(e, S, dt, w) {
  const G = S.G; if (e.mode !== 'sleep') { S.dishT -= dt * (S.hungry > 0 ? 1.3 : 1); if (S.dishT <= 0) { S.dishT = GB.dish.every[S.ph - 1]; S.n.dishes++; S.items.push({ id: ++S.act, kind: 'dish', x: G.line.x0, state: 'ride', k: 0 }); } }
  for (const it of S.items) {
    if (it.state === 'ride') { it.x += GB.dish.v * dt; if (it.x >= G.line.x1) { it.x = G.line.x1; it.state = 'down'; it.k = 0; } }
    else if (it.state === 'down') { it.k = Math.min(1, it.k + dt / 0.35); if (it.k >= 1) it.state = 'wait'; } }
  S.items = S.items.filter(q => q.state !== 'gone' && q.state !== 'eaten');
}
function stepThrows(S, dt, w) {
  for (const c of S.throws) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; w.dust(c.tx, c.ty, 6); w.sound(c.plate ? 'plate' : 'thud');
    w.hitArea([c.tx - GB.food.r, c.tx + GB.food.r, c.ty - 22, c.ty + 2], c.dmg, c.plate ? 'plates' : 'food', c.key); }
  S.throws = S.throws.filter(c => !c.done);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { if (q.delay > 0) { q.delay -= dt; continue; } q.life -= dt; q.x += q.dir * (q.sp || GB.belch.sp) * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && h.ground && Math.abs(h.y - S.G.floorY) < 6 && Math.abs(h.x - q.x) < (q.hw || GB.belch.w)) w.hitHero(h, q.dmg, q.name || 'belch', q.key); }
  S.waves = S.waves.filter(q => q.life > 0);
}
function stepFloods(S, dt, heroes, w) {
  for (const q of S.floods) { q.x += q.dir * GB.flood.sp * dt; if (q.x < S.G.x0) q.done = true;
    for (const h of heroes) if (h.alive && Math.abs(h.y - S.G.floorY) < 8 && Math.abs(h.x - q.x) < 12) w.hitHero(h, q.dmg, 'flood', q.key); }
  S.floods = S.floods.filter(q => !q.done);
}
/* the gravy on the floor (behind the wave): x < this is gravied (slow, slick) while S.gravy > 0 */
export const gravyFrom = S => S.floods.length ? S.floods[0].x : S.G.x0;
export function throwAt(c, floorY) { const k = Math.max(0, Math.min(1, c.t / c.T)); return { x: c.x0 + (c.tx - c.x0) * k, y: c.y0 + (c.ty - c.y0) * k - Math.sin(k * Math.PI) * 70, k }; }
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg, plunge) {
  if (S.ward > 0 || (e.mode === 'recover' && S.ward > 0)) return [Math.max(1, Math.round(dmg * GB.wardMul)), 'WARDED'];
  if (e.mode === 'choke') { const d = Math.round(dmg * GB.choke.mul), left = S.purse ?? Infinity;
    if (d >= left) { S.purse = 0; return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (e.mode === 'flopDown') { S.n.flopHits++; return [Math.max(1, Math.round(dmg * GB.flop.mul)), null]; }   /* WINDED on the floor after the belly flop: a blade lands whole (a punish, not the choke's x2) */
  if (S.hungry > 0) return [Math.max(1, Math.round(dmg * GB.hungry.mul)), null];
  if (plunge) return [Math.max(1, Math.round(dmg * GB.above)), null];
  return [Math.max(1, Math.round(dmg * GB.fed)), 'WELL FED'];
}

/* ---------- THE BOT (src/lab.js): what a player reads - his tells a reaction late, the rings where food and plates land, the belch's rings and the gravy's wave, the grab's
   arm - and THE RULE: strike the oven's bellows when it is hot, be at his chair when the pie reaches him, and cut him while he chokes ---------- */
export const PLAN = { react: 0.24, miss: 0.12 };
export const gbHazards = S => S.throws.map(c => [c.tx, GB.food.r + 12]);
export function gbPlan(s) {
  const out = gbPlan0(s);
  if (globalThis.__gbWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__gbWhy[k] = (globalThis.__gbWhy[k] || 0) + 1; }
  return out;
}
function gbPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = GB.w / 2, lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, side = Math.sign(P.x - kx) || -1, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const strikeSpot = clamp(kx - (half + (s.tip ? 4 : 2)));   /* his west side, against his belly (claude/grubbagbig: the warden's point at his belly's edge, as at his old size - not 30 px in, now under it) */
  const hz = gbHazards(S), inHaz = x => hz.some(([hx, r]) => Math.abs(x - hx) < r);
  const safeX = x => { let q = clamp(x); for (let k = 0; k < 3; k++) for (const [hx, r] of hz) if (Math.abs(q - hx) < r) q = clamp(q < hx ? hx - r - 4 : hx + r + 4); return q; };
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  const pie = S.items.find(q => q.kind === 'pie' && q.state !== 'gone' && q.state !== 'eaten') || (e.mode === 'eat' && e.eating && e.eating.kind === 'pie' ? { kind: 'pie', x: G.line.x1, state: 'eaten' } : S.oven.st === 'bake' ? { kind: 'pie', x: G.line.x0 - S.oven.t * GB.dish.v, state: 'bake' } : null);   /* (he is eating it: it is all but in him) */
  /* 1. IN THE AIR: keep going */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.55) { out.gx = mem.jumpX; out.why = 'in the air';
    if (mem.dish) { const d = S.items.find(q => q.id === mem.dish && q.state === 'ride'); if (d && Math.abs(d.x - P.x) < 20) { out.face = Math.sign(d.x - P.x) || 1; out.atk = P.atk < 0; out.why = 'knock the dish off'; } } return out; }
  /* 2. A RING ON ME: off it */
  if (inHaz(P.x) && P.ground) { const [hx, r] = hz.find(([x0, r0]) => Math.abs(P.x - x0) < r0); out.gx = safeX(P.x + (P.x < hx ? -r - 8 : r + 8)); out.why = 'off the ring'; return out; }
  /* 3. THE BELCH'S RING / THE GRAVY coming at me: jump it */
  const wave = S.waves.find(q => !(q.delay > 0) && (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 34);
  if (wave && P.ground && seenFor('bw' + wave.key, 0.06) && !roll('bwm' + wave.key, s.v2 ? 0 : PLAN.miss)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the belch'; return out; }
  const fl = S.floods.find(q => (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 40);
  if (fl && P.ground && seenFor('fl' + fl.key, 0.08)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the gravy'; return out; }
  /* 4. HIS TELLS */
  if (gbTelling(e) || e.mode === 'fork' || e.mode === 'grab' || e.mode === 'flop') {
    const key = 'a' + S.act, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor(key);
    if (seen && !miss) {
      if (e.mode === 'grabTell' || e.mode === 'grab') { if (dx < GB.grab.reach + half + 20) {
          const hand = e.handX; if (e.mode === 'grab' && hand != null && Math.abs(hand - P.x) < 46 && P.ground) { if (s.dodge && roll(key + 'd', 0.4)) { out.dodge = true; out.gx = clamp(P.x - side * 30); out.why = 'roll the grab'; return out; }
            out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the grab'; return out; }
          out.gx = P.x; out.why = 'the grab: ready to jump'; return out; } }
      if ((e.mode === 'forkTell' || e.mode === 'fork') && dx < half + GB.fork.reach + 20) {
        if (s.shield && !roll(key + 'b', 0.45)) { out.block = true; out.face = Math.sign(kx - P.x) || 1; out.why = 'block the fork'; return out; }
        if (!s.shield && dx < half + GB.fork.reach + 14 && P.ground && ((e.mode === 'forkTell' && e.modeT < 0.24) || (e.mode === 'fork' && e.modeT > GB.fork.t * 0.5))) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the fork'; return out; }
        if (!s.shield && dx < half + GB.fork.reach + 14) { out.gx = P.x; out.why = 'the fork: ready to jump it'; return out; }
        out.gx = safeX(kx - (half + GB.fork.reach + 34)); out.why = 'back off the fork'; return out; }
      if (e.mode === 'slamTell' && P.x > G.table[0] - GB.slam.shock - 30) { out.gx = safeX(G.table[0] - GB.slam.shock - 46); out.why = 'off the table end'; return out; }
      if ((e.mode === 'flopTell' || e.mode === 'flop') && e.landX != null) { const F = GB.flop, edge = F.crush + 16;
        if (Math.abs(P.x - e.landX) < edge) { const w0 = clamp(e.landX - edge - 6), e1 = Math.min(hi, e.landX + edge + 6), goW = P.x < kx || e1 - e.landX < edge;   /* (west, away from his body: east of the shadow is under him) */
          if (s.dodge && e.mode === 'flop' && e.modeT < 0.22 && roll(key + 'fd', 0.5)) { out.dodge = true; out.gx = goW ? w0 : e1; out.why = 'roll out from under the flop'; return out; }
          out.gx = goW ? w0 : e1; out.why = 'out from under his shadow'; return out; }
        out.gx = P.x; out.why = 'the flop: ready to jump the shock'; return out; }
      if (e.mode === 'throwTell') { out.gx = safeX(P.x + (P.x < G.mid ? 34 : -34)); out.why = 'the food: keep moving'; return out; }
      if (e.mode === 'belchTell') { out.gx = P.x; out.why = 'the belch: ready to jump'; return out; }
      if (e.mode === 'floodTell') { out.gx = P.x; out.why = 'the gravy: ready to jump'; return out; }
    } }
  /* 4b. WINDED ON THE FLOOR after the belly flop: strike him (off him before he rolls) */
  if (e.mode === 'flopDown') { const lh = GB.flop.lieW / 2; if (e.modeT < 0.25) { out.gx = safeX(kx + side * (lh + 40)); out.why = 'he rolls: off him'; return out; }
    out.gx = clamp(kx + side * (lh - 2)); if (Math.abs(P.x - kx) < reach + lh - 4) swing(kx); out.why = 'strike him: winded'; return out; }
  if (e.mode === 'flopRoll') { out.gx = safeX(Math.min(P.x, G.chairX - half - 110)); out.why = 'he rolls back: wait'; return out; }
  /* 5. HE CHOKES: strike him */
  if (gbOpen(e)) { out.gx = strikeSpot; if (dx < hitR + 4) swing(kx); out.why = 'strike him: choking'; return out; }
  /* 6. THE OVEN IS HOT and no pie on the line: go and stoke it */
  if (S.oven.st === 'cold' && !pie) { const bx = G.bellowsX, spot = clamp(bx + 12);
    if (Math.abs(P.x - spot) > 5) { out.gx = spot; out.why = 'to the oven'; return out; }
    out.face = -1; out.atk = P.atk < 0 && !roll('ov' + S.n.stokes + Math.floor(t * 3), s.v2 ? 0 : 0.15); out.why = 'stoke the oven'; return out; }
  /* 7. THE PIE ON THE LINE: be at his chair when it reaches him (never under it with a blade out) */
  if (pie) { const eta = (G.line.x1 - pie.x) / GB.dish.v + (pie.state === 'ride' ? 0.35 : 0), walk = Math.abs(strikeSpot - P.x) / 92;
    if (S.ward > 0 || e.mode === 'recover') { out.gx = safeX(kx - (half + 94)); out.why = 'the pie coming: wait off him'; return out; }
    if (walk + 0.6 >= eta || dx < half + 114) { out.gx = strikeSpot; out.why = 'the pie coming: to his chair'; if (dx < hitR && e.mode === 'eat' && !roll('ch' + S.act, 0.4)) swing(kx); return out; }
    out.gx = safeX(kx - (half + 84)); out.why = 'the pie coming: wait'; return out; }
  /* 8. HE IS WARDED, OR EATING: off him / a cut while he chews */
  if (S.ward > 0) { out.gx = safeX(kx - (half + 124)); out.why = 'his ward: off him'; return out; }
  if (s.rest) { out.gx = safeX(G.x0 + 80); out.why = 'winded: off him'; return out; }
  if (e.mode === 'eat' && dx < hitR + 30) { out.gx = strikeSpot; if (dx < hitR) swing(kx); out.why = 'a cut while he eats'; return out; }
  /* 9a. A DISH COMING DOWN THE LINE OVER ME while I wait: a jumping blow knocks it off (he goes hungry) */
  { const d = S.items.find(q => q.kind === 'dish' && q.state === 'ride' && q.x < P.x - 4 && P.x - q.x < 34 && Math.abs(P.x - kx) > half + 64);
    if (d && P.ground && !roll('dj' + d.id, s.v2 ? 0 : 0.3)) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; mem.dish = d.id; out.why = 'jump for the dish'; return out; } }
  /* 9. THE OVEN COOLING: wait by it, out of his fork */
  out.gx = safeX(Math.min(G.bellowsX + 60, kx - (half + 134))); out.face = 1; out.why = 'wait for the oven'; return out;
}
