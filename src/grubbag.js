// src/grubbag.js - LORD GRUBBAG THE GLUTTON, THE KITCHEN GATE's boss. REWORKED by claude/kitchengate2 (Daniel 10-27 live playtest + his six approved recs, scratch/brief-kitchengate2-1027.md).
// The goblin queen's glutton of a brother, at the head of the high table. HE IS SEATED AND NEVER MOVES (no belly flop, no slam, no fork, no pot in his hands): he throws things
// at you on the platforms while THE SERVING LINE - a conveyor counter, the level's own conveyors - brings food along the hall to his platter. This file is the fight, PURE (his
// moves, his phases, the line and its items, what a blow does to him, and the bot's plan); src/grubbag-hands.js binds it to the world (main.js) and draws him. tools/kitchengate.mjs checks it.
// HEADER (design-standard B1 / B10 / B11 / B14 / B15 / B17): A PUZZLE BOSS WHOSE OPENING IS THE LEVEL'S RULE (the serving line). He is NEVER invulnerable:
//   WELL FED, a blade lands at GB.fed (0.45, over the B15 floor; told: a dull slap and WELL FED). HUNGRY (a dish knocked off the line) x GB.hungry.mul. WARDED x GB.wardMul (0.4).
//   THE SERVING LINE (B1/B17 - the level's conveyors, taught there): every few seconds an item comes out of the kitchen hatch onto the conveyor and rides it to his platter.
//     a DISH that reaches him he eats: HEALED GB.dish.heal of him (shown: a green number and a glow), capped - never over the top of the phase he is in, and no more than
//       GB.dish.cap of him a phase (so a good player is never out-healed). Strike a dish on the line and it is KNOCKED OFF: it smashes, and he goes HUNGRY.
//     a BOMB (a lit pudding, its fuse burning, the burn drawn) comes every GB.line.bombEvery items. LET IT REACH HIM: he gulps it, it goes off in him (GB.stun.boom of him) and he is
//       STUNNED - THE OPENING (the shared OPEN read, B10: a gold ring and a timer): GB.stun.t s, blades x GB.stun.mul, up to GB.stun.cap of him. Its fuse is short: on the slow line
//       it goes off before it gets there (on the line: it singes whoever stands by it). BAT IT (any blow) and it skids along the line to him at GB.line.batV.
//     a RED-HOT CHILLI: strike the bellows of the pepper stove by the hatch (the level's bellows) and the next item out is a chilli. Let it reach him: he gulps it - TOO HOT - a
//       shorter opening (GB.hot). Strike a chilli and it is knocked off (lost). Then the stove cools.
//   After every opening a told WARD (B3: GB.ward s, a pale ring, WARDED x0.4) while he coughs and fans his mouth.
//   EVERY MOVE TOLD with its own windup and release pose (B16, src/grubbag-hands.js POSE) and its own sound; SEVEN told attacks (B17):
//     P1 (100-62%) 1 THE HIGH LOB (a ham hoisted over his head, yellow !): it arcs high and lands ON the platform you stand on (a red ring there) - move off the ring
//                  2 THE FLAT FLING (a plate drawn back by his ear, yellow !): flung flat and fast at the height you stand at - jump it
//                  3 THE BELCH (head back, belly swelling, red !!): a ring runs out along the floor - jump it, or be up on the line
//                  4 THE SWEEP (his arm along the platter, yellow !): the platter's plates skid back along the line's top - jump them, or be off the line
//     P2 (62-30%)  5 THE GREASE SPILL (he yanks the chain of the grease cauldron hung over the line's end, red !!): it tips, and a BURNING WAVE runs along the floor, the floor
//                    burning behind it - get up on the line or a shelf
//                  6 THE SERVICE BELL (a hand bell lifted, yellow !): ORDER UP - the line runs fast a while, and ATTENDANTS come down it out of the hatch
//     P3 (30-0%)   7 THE GRAB (he leans out over the line, his arm drawn back, red !!): his arm sweeps out over the floor and the line to take you as food - jump it or roll; caught,
//                    he bites and throws you down the hall
//   NO OTHER ADDS: the bell's attendants are the only ones (Daniel's rec 5, approved 10-27).
// (claude/kitchengate4, Daniel 10-30 17:30 - all three recs approved, scratch/brief-kitchengate4-1030.md) THE COAL TRENCH, THE MEAT-HOOK RAILS, THE SECOND HELPING:
//   THE COAL TRENCH (G.trench): the floor under the serving line is cut down to a coal bed. A fall in is a COAL BITE (GB.coal: spared - never a death on its own, no knock) and a
//     climb back up the chain-link steps at either end; while you stand on the coals they bite again every GB.coal.beat s. HIS GREASE SPILL LIGHTS IT: a glow (the tell), then the
//     coals flare GB.coal.fire s - the bite x GB.coal.lit, and the steps bite too (the climb out is hot). Ride the hooks over it instead.
//   THE MEAT-HOOK RAILS (L.zipLines, `arena: true`; src/zipline.js unchanged): two chain-driven rails run from the hatch east over the line - the lower one taken from the line, the
//     upper one by the hop off it (or a jump from the line) - and THE UPPER RAIL ENDS OVER HIS PLATTER. DROP ONTO THE PLATTER (riding off its end, or DOWN over it): the food on
//     the line is KNOCKED FLYING, the stove goes cold, and he is KNOCKED OFF HIS FEET - THE THIRD OPENING (GB.drop: short, the shared OPEN read B10, its own purse cap; one every
//     GB.drop.cd s; then the told WARD, B3). He is never invulnerable (B15): well fed is still x0.45.
//   THE SECOND HELPING: a dish he eats swells his belly, shows a BIG green heal and a 'MORE!' - and his next LOB / FLING / GREASE is EMPOWERED (a double lob, a faster fling, a
//     longer-burning wave; the windup and its tell unchanged, B16; a gold rim on his hands and SECOND HELPING said on the windup). The heal itself is unchanged (GB.dish).
//   ORDER UP: the bell speeds the hook rails too (GB.bell.hook) and the attendants RIDE DOWN THE HOOKS from the hatch (src/grubbag-hands.js ride) - knocked off one, the coals take him.
export const GB = {
  hp: 3600, w: 150, h: 120, markH: 196,
  fed: 0.45, wardMul: 0.4,
  p2: 0.62, p3: 0.3,
  rest: [1.25, 1.05, 0.9],
  lob: { tell: [0.85, 0.8, 0.75], flight: 1.15, apex: 120, r: 16, dmg: 12, n: [1, 2, 2], spread: 70, rec: 0.6, hand: [96, -166] },
  fling: { tell: [0.7, 0.62, 0.56], v: 330, hw: 7, hh: 4, lift: 12, dmg: 10, rec: 0.55, hand: [116, -62], settle: 70 },   /* hand: where the release pose's hand is (local px, facing right): the plate leaves it there */
  belch: { tell: [0.95, 0.85, 0.8], sp: 160, life: 3.2, w: 9, dmg: 12, rec: 0.7 },
  sweep: { tell: [0.8, 0.74, 0.7], sp: 210, w: 10, dmg: 11, rec: 0.6 },
  grease: { tell: 1.1, sp: 170, burn: 1.8, beat: 0.45, dmg: 9, front: 12, rec: 0.9, cd: 13 },
  bell: { tell: 0.9, rush: 7, mul: 2.2, adds: 2, maxAdds: 2, rec: 0.8, cd: 20, hook: 1.6, ride: 0.9 },   /* (claude/kitchengate4) hook: the hook rails' pace x while ORDER UP; ride: s between attendants down the hook */
  grab: { tell: 0.85, t: 0.55, reach: 240, h: 42, hand: 20, dmg: 18, rec: 0.9, throwV: 260 },
  stun: { t: 7, mul: 2, cap: 0.08, boom: 0.05 },
  hot: { t: 5, mul: 2, cap: 0.06 },
  drop: { t: 3, mul: 2, cap: 0.06, cd: 12, h: 40, shove: 0.8, shoveV: 110 },   /* (claude/kitchengate4) THE PLATTER DROP: the third opening (short, a cooldown); h: how far over the platter's top a landing counts; shove: s on the platter before it tips you off */
  coal: { dmg: 8, lit: 2, beat: 1.4, glow: 0.6, fire: 6 },   /* (claude/kitchengate4) THE COAL TRENCH: a bite, x lit while the grease burns it (fire s, after a glow s), again every beat s on the coals */
  second: { lobGap: 0.25, flingV: 1.25, greaseLife: 1.4 },   /* (claude/kitchengate4) THE SECOND HELPING: the extra lob lands lobGap s after the last; the fling flies x flingV; the wave burns x greaseLife */
  swell: 0.4,
  ward: 2.6, coughRest: 2.0,
  eat: 0.7, gulp: 0.5,
  dish: { heal: 0.05, cap: 0.1, box: 9 },
  line: { v: 34, every: [5.6, 5.0, 4.5], bombEvery: 4, first: 2.2, fuse: 5.6, batV: 250, blast: 34, blastDmg: 12, knockV: 120 },
  hungry: { t: 6, mul: 0.7, cd: 0.8 },
  stove: { cool: 12, box: 16 },
  bz: { hurt: 1.5 }, dmgMul: 2.9,
};
export const GB_SAY = { wake: 'LORD GRUBBAG THE GLUTTON', rule: 'THE SERVING LINE FEEDS HIM: KNOCK THE DISHES OFF. LET THE BOMBS AND THE CHILLIES REACH HIM.', p2: 'MORE! FASTER!', p3: 'HE REACHES FOR YOU',
  eats: 'HE EATS: HEALED', full: 'HE EATS: TOO FULL TO HEAL', smash: 'KNOCKED OFF: HE GOES HUNGRY', hungry: 'HUNGRY', bomb: 'A BOMB ON THE LINE: LET IT REACH HIM, OR BAT IT ALONG',
  bat: 'BATTED ALONG THE LINE', fizz: 'THE BOMB GOES OFF ON THE LINE', gulp: 'HE GULPS THE BOMB', stun: 'STUNNED', chilli: 'A RED-HOT CHILLI: LET IT REACH HIM', hot: 'TOO HOT!', lost: 'THE CHILLI IS KNOCKED OFF',
  stove: 'THE PEPPER STOVE ROASTS A RED-HOT CHILLI', cool: 'THE STOVE COOLS', ready: 'THE STOVE IS HOT AGAIN', ward: 'HE COUGHS IT UP', lob: 'THE HIGH LOB: OFF THE RING', fling: 'THE FLING: JUMP IT',
  belch: 'THE BELCH: JUMP THE RING', sweep: 'THE SWEEP: JUMP THE PLATES, OR OFF THE LINE', grease: 'THE GREASE SPILL: UP OFF THE FLOOR', bell: 'ORDER UP! THE LINE RUNS FAST', attend: 'ATTENDANTS DOWN THE LINE',
  grab: 'THE GRAB: JUMP IT', caught: 'CAUGHT: HE BITES',
  /* (claude/kitchengate4) */
  coal: 'THE COALS: CLIMB OUT', flare: 'THE GREASE LIGHTS THE COALS', hook: 'RIDE THE HOOK, DROP ON HIS PLATTER', drop: 'KNOCKED OFF HIS FEET', flying: 'THE FOOD GOES FLYING',
  more: 'MORE!', second: 'SECOND HELPING', addFall: 'ATTENDANT FALLS', ride: 'ATTENDANTS RIDE THE HOOKS', rush: 'ORDER UP! THE HOOKS RUN FAST' };
export const OPEN_NAME = { stun: 'STUNNED', hot: 'TOO HOT', drop: 'KNOCKED OFF HIS FEET' };
export const gbOpen = e => !!e && (e.mode === 'stun' || e.mode === 'hot' || e.mode === 'drop');
/* (claude/kitchengate4) THE SECOND HELPING empowers only these (the brief's rec: belch / sweep / bell / grab unchanged) - it waits for the next of them */
export const SECOND_MOVES = new Set(['lob', 'fling', 'grease']);
const TELLS = new Set(['lobTell', 'flingTell', 'belchTell', 'sweepTell', 'greaseTell', 'bellTell', 'grabTell']);
export const gbTelling = e => TELLS.has(e.mode);
export const MOVES = ['lob', 'fling', 'belch', 'sweep', 'grease', 'bell', 'grab'];
/* THE HIGH TABLE'S HALL (px): x0/x1 inside the walls, floorY; his chair; the serving line (the conveyor's two ends and its top); the shelves (every surface a lob can land on);
   the pepper stove and its bellows; the grease cauldron hung over the line's end */
export function geom(A, TS = 16) {
  const [b0, b1, br] = A.belt || [0, 0, 0];
  const belt = { x0: b0 * TS, x1: (b1 + 1) * TS, y: br * TS };
  const plats = [{ x0: belt.x0, x1: belt.x1, y: belt.y, belt: true }].concat((A.plats || []).map(([c0, c1, r]) => ({ x0: c0 * TS, x1: (c1 + 1) * TS, y: r * TS })));
  return { x0: A.x0, x1: A.x1, floorY: A.floor, mid: (A.x0 + A.x1) / 2, chairX: A.chair * TS + 8, table: [A.table[0] * TS, (A.table[1] + 1) * TS], ovenX: A.oven * TS + 8, bellowsX: A.bellows * TS + 8,
    belt, plats, cauldron: A.cauldron ? { x: A.cauldron[0] * TS + 8, y: A.cauldron[1] * TS } : { x: belt.x1 - 24, y: A.floor - 140 }, TS,
    /* (claude/kitchengate4) THE COAL TRENCH: the coal bed's span (px) and its top; the chain-link steps at either end (each [x0, x1], one row up off the bed) */
    trench: A.trench ? { x0: A.trench[0] * TS, x1: (A.trench[1] + 1) * TS, y: A.trench[2] * TS, steps: (A.steps || []).map(c => [c * TS, (c + 1) * TS]), stepY: (A.trench[2] - 1) * TS } : null,
    /* THE PLATTER: the stretch of the line's top that is his platter (a drop lands on it) */
    platter: { x0: A.table[0] * TS, x1: Math.min((A.table[1] + 1) * TS, belt.x1 + 6), y: belt.y },
    rails: A.rails || [] };   /* (claude/kitchengate4) the arena's two meat-hook rails (L.zipLines entries: the lower has .hand, the upper ends over the platter) */
}
/* the ground under x with nothing between: the coal bed or its steps over the trench, else the floor */
export function groundY(G, x) { const T = G.trench; if (!T) return G.floorY; if (x >= T.x0 && x < T.x1) return T.y; if (T.steps.some(([a, b]) => x >= a && x < b)) return T.stepY; return G.floorY; }
/* the surface under a point: the highest platform top at or below y over x, else the ground (the floor, or the trench's bed) */
export function surfaceY(G, x, y) { let best = groundY(G, x); for (const p of G.plats) if (x >= p.x0 - 2 && x <= p.x1 + 2 && p.y >= y - 3 && p.y < best) best = p.y; return best; }
export const onBelt = (G, h) => !!h && h.ground && Math.abs(h.y - G.belt.y) < 3 && h.x >= G.belt.x0 - 2 && h.x <= G.belt.x1 + 2;
export const onFloor = (G, h) => !!h && Math.abs(h.y - G.floorY) < 4;
/* (claude/kitchengate4) on the coal bed / on a chain-link step / anywhere down in the trench */
export const onCoals = (G, h) => !!(G.trench && h && h.ground && Math.abs(h.y - G.trench.y) < 4 && h.x >= G.trench.x0 && h.x < G.trench.x1);
export const onStep = (G, h) => !!(G.trench && h && h.ground && Math.abs(h.y - G.trench.stepY) < 4 && G.trench.steps.some(([a, b]) => h.x >= a - 3 && h.x < b + 3));
export const inTrench = (G, h) => !!(G.trench && h && h.y > G.floorY + 2 && h.x >= G.trench.steps.concat([[G.trench.x0, G.trench.x1]]).reduce((m, s) => Math.min(m, s[0]), 1e9) - 2 && h.x <= G.trench.steps.concat([[G.trench.x0, G.trench.x1]]).reduce((m, s) => Math.max(m, s[1]), -1e9) + 2);
/* (claude/kitchengate4) a landing on his platter: on the line's top, over the platter */
export const onPlatter = (G, h) => !!h && Math.abs(h.y - G.platter.y) < 4 && h.x >= G.platter.x0 - 2 && h.x <= G.platter.x1 + 2;
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, last: [], restT: 1.4, hungry: 0, purse: 0, items: [], lineT: GB.line.first, made: 0, stove: { st: 'cold', t: 0, next: false }, rush: 0, healLeft: 0, ceil: 1,
    waves: [], throws: [], flings: [], sweeps: [], burns: [], adds: [], cd: { grease: 0, bell: 0, drop: 0 }, told: {},
    coal: { glow: 0, lit: 0, bite: new Map() }, second: 0, secondOn: null, swellT: 0, heal: null,   /* (claude/kitchengate4) the trench's state; the second helping (owed / on the move now); the belly's swell and the big heal shown */
    n: { lob: 0, fling: 0, belch: 0, sweep: 0, grease: 0, bell: 0, grab: 0, caught: 0, dishes: 0, eaten: 0, healed: 0, smashed: 0, bombs: 0, bats: 0, fizz: 0, gulps: 0, chillies: 0, lost: 0, hots: 0, stokes: 0,
      opens: 0, adds: 0, fedHits: 0, openHits: 0, wardHits: 0, hungryHits: 0, coal: 0, coalLit: 0, flares: 0, drops: 0, flying: 0, seconds: 0, addFalls: 0 } };
}
const cdK = S => (S.hungry > 0 ? GB.hungry.cd : 1);
export const lineV = S => GB.line.v * (S.rush > 0 ? GB.bell.mul : 1);
export const itemY = (G, it) => it.state === 'fall' ? it.y : G.belt.y;
export const itemBox = (G, it) => { const y = itemY(G, it), b = GB.dish.box; return { l: it.x - b, r: it.x + b, t: y - b * 2, b: y }; };
/* A HERO'S BLOW ON THE PEPPER STOVE'S BELLOWS: the next item out of the hatch is a red-hot chilli */
export function stokeStove(S, w) {
  if (S.stove.st !== 'cold') { if (!S.told.notYet) { S.told.notYet = 1; w.number(S.G.bellowsX, S.G.floorY - 50, GB_SAY.cool, '#c9b27c'); } return false; }
  S.stove.st = 'roast'; S.stove.next = true; S.n.stokes++; w.sound('roar'); w.stove(true);
  if (!S.told.stove) { S.told.stove = 1; w.number(S.G.ovenX + 30, S.G.floorY - 70, GB_SAY.stove, '#ffd36b'); }
  if (S.lineT > 1.2) S.lineT = 1.2;   /* (it comes out next, promptly) */
  return true;
}
/* A HERO'S BLOW ON AN ITEM ON THE LINE: a dish or a chilli is knocked off; a bomb is batted along to him */
export function strikeItem(S, it, w, fromX) {
  if (!it || (it.state !== 'ride' && it.state !== 'bat' && it.state !== 'wait')) return false;
  if (it.kind === 'bomb') { if (it.state === 'wait') return false; if (it.state !== 'bat') { it.state = 'bat'; S.n.bats++; w.sound('bat'); w.number(it.x, S.G.belt.y - 34, GB_SAY.bat, '#ffd36b'); } return true; }
  it.state = 'fall'; it.y = S.G.belt.y; it.vx = Math.sign(it.x - (fromX ?? it.x - 1)) * GB.line.knockV * 0.6 || 40; it.vy = -110;
  if (it.kind === 'chilli') { S.n.lost++; w.number(it.x, S.G.belt.y - 34, GB_SAY.lost, '#ff9a5c'); w.sound('smash'); S.stove.st = 'cool'; S.stove.t = GB.stove.cool * 0.5; return true; }
  S.n.smashed++; S.hungry = GB.hungry.t; w.number(it.x, S.G.belt.y - 34, GB_SAY.smash, '#8fd160'); w.sound('smash');
  return true;
}
/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, pp }]; w: the world (src/grubbag-hands.js world()) ---------- */
export function stepGrubbag(e, S, dt, heroes, w) {
  const G = S.G, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; S.hungry = Math.max(0, S.hungry - dt); S.rush = Math.max(0, S.rush - dt);
  for (const k in S.cd) S.cd[k] = Math.max(0, S.cd[k] - dt);
  e.face = -1; e.x = G.chairX; e.y = G.floorY;   /* SEATED: he never leaves his chair, never turns (the wall is at his back) */
  S.swellT = Math.max(0, S.swellT - dt); if (S.heal) { S.heal.t -= dt; if (S.heal.t <= 0) S.heal = null; }
  stepStove(S, dt, w); stepLine(e, S, dt, heroes, w); stepThrows(S, dt, w); stepFlings(S, dt, heroes, w); stepWaves(S, dt, heroes, w); stepSweeps(S, dt, heroes, w); stepBurns(S, dt, heroes, w); stepCoals(S, dt, heroes, w);
  S.adds = S.adds.filter(a => a && a.alive);
  if (e.mode === 'sleep') return;
  e.modeT -= dt;
  const i = S.ph - 1;
  if (e.mode === 'sit' || e.mode === 'recover') {
    if (S.ph < 2 && e.hp <= e.maxHp * GB.p2) { phase(e, S, 2, w); return; }
    if (S.ph < 3 && e.hp <= e.maxHp * GB.p3) { phase(e, S, 3, w); return; } }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'sit'; S.restT = 1.2; S.ceil = e.hp; S.healLeft = e.maxHp * GB.dish.cap; } return;
    case 'sit': {
      const it = S.items.find(q => q.state === 'wait' && (q.kind === 'dish' || S.ward <= 0)); if (it) { eat(e, S, it, w); return; }   /* whatever waits on his platter: he cannot help himself (a bomb or a chilli only once his ward is down: B3) */
      S.restT -= dt; if (S.restT > 0 || !P || !P.alive) return; pick(e, S, P, w); return; }
    case 'eat': if (e.modeT <= 0) { e.eating = null; e.mode = 'sit'; S.restT = 0.45; } return;
    case 'gulp': if (e.modeT <= 0) { const it = e.eating; e.eating = null; open(e, S, it && it.kind === 'chilli' ? 'hot' : 'stun', w); } return;
    case 'lobTell': if (e.modeT <= 0) { e.mode = 'lob'; e.modeT = 0.35; w.sound('throw');
        const two = S.secondOn === 'lob', n = GB.lob.n[i] + (two ? 1 : 0), aimX = P ? P.x : G.mid, sy = P ? (P.ground ? P.y : surfaceY(G, P.x, P.y)) : G.floorY, sd = aimX > G.mid ? -1 : 1;
        const xs = [aimX, aimX + GB.lob.spread * sd, aimX - GB.lob.spread * sd].slice(0, n);   /* (claude/kitchengate4) THE SECOND HELPING: one more ham, the far side of you, GB.second.lobGap s after the last */
        xs.forEach((tx0, k) => { const tx = Math.max(G.x0 + 14, Math.min(G.chairX - GB.w / 2 - 10, tx0)), ty = k ? surfaceY(G, tx, sy) : sy, extra = two && k === n - 1;
          S.throws.push({ x0: G.chairX - GB.lob.hand[0], y0: G.floorY + GB.lob.hand[1], tx, ty, t: extra ? -((k - 1) * 0.16 + GB.second.lobGap) : -k * 0.16, T: GB.lob.flight, key: 'lb' + S.act + '.' + k, dmg: GB.lob.dmg, second: extra }); });
        S.secondOn = null; }
      return;
    case 'lob': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.lob.rec; } return;
    case 'flingTell': if (e.modeT <= 0) { e.mode = 'fling'; e.modeT = 0.3; w.sound('fling');
        const sy = P ? (P.ground ? P.y : surfaceY(G, P.x, P.y)) : G.floorY;
        S.flings.push({ x: G.chairX - GB.fling.hand[0], x0: G.chairX - GB.fling.hand[0], y0: G.floorY + GB.fling.hand[1], ty: sy - GB.fling.lift, y: G.floorY + GB.fling.hand[1], key: 'fg' + S.act, dmg: GB.fling.dmg,
          v: GB.fling.v * (S.secondOn === 'fling' ? GB.second.flingV : 1), second: S.secondOn === 'fling' });   /* (claude/kitchengate4) THE SECOND HELPING: faster (the windup is not shortened) */
        S.secondOn = null; }
      return;
    case 'fling': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.fling.rec; } return;
    case 'belchTell': if (e.modeT <= 0) { e.mode = 'belch'; e.modeT = 0.4; w.sound('belch'); w.shake(5); const n = S.ph > 2 ? 2 : 1;
        for (let k = 0; k < n; k++) S.waves.push({ x: e.x - (GB.w / 2 - 4), dir: -1, life: GB.belch.life, delay: k * 0.5, key: 'bw' + S.act + '.' + k, dmg: GB.belch.dmg }); }
      return;
    case 'belch': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.belch.rec; } return;
    case 'sweepTell': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.35; w.sound('sweep'); S.sweeps.push({ x: G.belt.x1 - 4, key: 'sw' + S.act, dmg: GB.sweep.dmg }); } return;
    case 'sweep': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.sweep.rec; } return;
    case 'greaseTell': if (e.modeT <= 0) { e.mode = 'grease'; e.modeT = 0.55; w.sound('grease'); w.shake(6); S.cd.grease = GB.grease.cd;
        const cx = G.cauldron.x; S.burns.push({ a: cx, b: cx, lo: cx, key: 'gs' + S.act, t: 0, beatKey: new Map(), burn: GB.grease.burn * (S.secondOn === 'grease' ? GB.second.greaseLife : 1), second: S.secondOn === 'grease' }); S.tipT = 2.2;
        /* (claude/kitchengate4) THE GREASE LIGHTS THE TRENCH: the coals glow (the tell), then flare */
        if (G.trench) { S.coal.glow = GB.coal.glow; S.n.flares++; if (!S.told.flare) { S.told.flare = 1; w.number((G.trench.x0 + G.trench.x1) / 2, G.trench.y - 40, GB_SAY.flare, '#ff9a5c'); } }
        S.secondOn = null; }
      return;
    case 'grease': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.grease.rec; } return;
    case 'bellTell': if (e.modeT <= 0) { e.mode = 'bell'; e.modeT = 0.5; w.sound('bell'); S.cd.bell = GB.bell.cd; S.rush = GB.bell.rush; S.lineT = Math.min(S.lineT, 0.6);
        w.number(G.mid, G.floorY - 120, GB_SAY.bell, '#ffd36b');
        const room = Math.max(0, GB.bell.maxAdds - S.adds.length);
        for (let k = 0; k < Math.min(GB.bell.adds, room); k++) { const a = w.spawnAdd(G.belt.x0 + 10 + k * 22, G.belt.y, k * 0.6, k); if (a) { S.adds.push(a); S.n.adds++; } }
        if (room && !S.told.attend) { S.told.attend = 1; w.number(G.belt.x0 + 40, G.belt.y - 50, G.rails.length ? GB_SAY.ride : GB_SAY.attend, '#ffd36b'); }
        if (G.rails.length && !S.told.rush) { S.told.rush = 1; w.number(G.belt.x0 + 60, G.belt.y - 70, GB_SAY.rush, '#ffd36b'); } }   /* (claude/kitchengate4) the hooks run fast too (src/grubbag-hands.js) */
      return;
    case 'bell': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.bell.rec; } return;
    case 'grabTell': if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = GB.grab.t; e.hitKey = 'gr' + S.act; w.sound('grab'); } return;
    case 'grab': { const k = 1 - e.modeT / GB.grab.t, out = GB.grab.reach * Math.sin(Math.min(1, k) * Math.PI), hand = e.x - (GB.w / 2 + out); e.handX = hand;
      const res = w.hit([hand - GB.grab.hand, hand + GB.grab.hand, G.floorY - GB.grab.h, G.floorY], GB.grab.dmg, 'grab', { key: e.hitKey, throwV: -GB.grab.throwV });
      if (res === 'hit' || res === 'blocked') { S.n.caught++; w.number(hand, G.floorY - 60, GB_SAY.caught, '#ff6b6b'); }
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = GB.grab.rec; e.handX = null; } return; }
    case 'stun': case 'hot': case 'drop': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = 0.5; e.coughed = true; S.ward = GB.ward; e.ward = S.ward; w.fx('ward', e.x, e.y); w.number(e.x, e.y - GB.h - 26, GB_SAY.ward, '#c8d8e8'); w.sound('cough'); } return;
    case 'recover': if (e.modeT <= 0) { e.mode = 'sit'; S.restT = e.coughed ? GB.coughRest : GB.rest[i] * cdK(S); e.coughed = false; } return;   /* (after an opening he coughs a while before his next blow) */
    default: e.mode = 'sit';
  }
}
function phase(e, S, ph, w) {
  S.ph = ph; e.phase = ph; w.music(ph); w.sound('roar'); w.shake(6); S.ceil = e.hp; S.healLeft = e.maxHp * GB.dish.cap;   /* (a new phase: his heal ceiling is where he is now - he never heals back up into the last one) */
  w.number(e.x, e.y - GB.h - 30, ph === 2 ? GB_SAY.p2 : GB_SAY.p3, '#ff6b6b');
  S.act++;
  if (ph === 2) { start(e, S, 'grease', w); } else { start(e, S, 'grab', w); }
}
const TELL_OF = { lob: ['lobTell', i => GB.lob.tell[i], '!'], fling: ['flingTell', i => GB.fling.tell[i], '!'], belch: ['belchTell', i => GB.belch.tell[i], '!!'], sweep: ['sweepTell', i => GB.sweep.tell[i], '!'],
  grease: ['greaseTell', () => GB.grease.tell, '!!'], bell: ['bellTell', () => GB.bell.tell, '!'], grab: ['grabTell', () => GB.grab.tell, '!!'] };
function start(e, S, k, w) {
  const T = TELL_OF[k], i = S.ph - 1; S.last.unshift(k); S.last.length = Math.min(S.last.length, 3); S.act++; S.n[k]++;
  e.mode = T[0]; e.modeT = T[1](i); w.mark(T[2]); w.sound(T[0]);
  /* (claude/kitchengate4) THE SECOND HELPING: owed from a dish, it goes on the next lob / fling / grease - said on the windup, his hands rimmed gold (the windup itself is not shortened) */
  S.secondOn = null; if (S.second && SECOND_MOVES.has(k)) { S.second = 0; S.secondOn = k; S.n.seconds++; w.number(S.G.chairX - 40, S.G.floorY - GB.h - 64, GB_SAY.second, '#ff9a3c'); }
  if (!S.told[k]) { S.told[k] = 1; w.number(S.G.mid, S.G.floorY - 120, GB_SAY[k], T[2] === '!!' ? '#ff6b6b' : '#ffd36b'); }
}
/* eat what waits on the platter: a dish heals him (capped), a bomb or a chilli he gulps */
function eat(e, S, it, w) {
  it.state = 'eaten'; e.eating = it; w.sound('chew');
  if (it.kind !== 'dish') { e.mode = 'gulp'; e.modeT = GB.gulp; w.number(e.x, e.y - GB.h - 20, it.kind === 'bomb' ? GB_SAY.gulp : GB_SAY.hot, '#ffd36b'); return; }
  e.mode = 'eat'; e.modeT = GB.eat; S.n.eaten++;
  const want = Math.round(e.maxHp * GB.dish.heal), room = Math.max(0, Math.min(S.healLeft, S.ceil - e.hp)), h = Math.max(0, Math.min(want, Math.floor(room)));
  if (h > 0) { e.hp = Math.min(e.maxHp, e.hp + h); S.healLeft -= h; S.n.healed += h; w.number(e.x, e.y - GB.h - 20, '+' + h + '  ' + GB_SAY.eats, '#8fd160'); w.fx('heal', e.x, e.y); }
  else w.number(e.x, e.y - GB.h - 20, GB_SAY.full, '#c9b27c');
  /* (claude/kitchengate4) THE FOOD BONUS, LEGIBLE: the belly swells, a BIG green heal (drawn by the hands, src/grubbag-hands.js), 'MORE!' - and a SECOND HELPING owed (one, never stacked) */
  S.swellT = GB.swell; S.heal = { n: h, t: 1.3 }; S.second = 1; w.number(e.x - 60, e.y - GB.h - 44, GB_SAY.more, '#8fd160');
}
/* A BOMB OR A CHILLI GOES DOWN: he is open (the bomb's own blast first) */
function open(e, S, kind, w) {
  const O = GB[kind]; e.mode = kind; e.modeT = O.t; e.openT0 = O.t; S.purse = e.maxHp * O.cap; S.n.opens++; if (kind === 'stun') S.n.gulps++; else if (kind === 'hot') S.n.hots++; else S.n.drops++;
  if (kind === 'stun') { const boom = Math.round(e.maxHp * GB.stun.boom); e.hp = Math.max(1, e.hp - boom); S.n.boom = (S.n.boom || 0) + boom; w.number(e.x, e.y - GB.h - 40, '-' + boom, '#ff9a3c'); w.sound('boom'); w.shake(9); }
  else if (kind === 'hot') { w.sound('hot'); w.shake(4); } else { w.sound('boom'); w.shake(7); }
  w.fx('open', e.x, e.y); w.number(e.x, e.y - GB.h - 26, OPEN_NAME[kind], '#ffd36b');
}
/* WHICH MOVE. Never the same move three times running; the sweep only at a hero on the line; the grab only at a hero within its reach; P2's grease and bell on cooldowns */
function pick(e, S, P, w) {
  const ph = S.ph, G = S.G, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k, ad = Math.abs(P.x - e.x);
  const pool = [['lob', 0.3], ['fling', 0.26], ['belch', 0.24]];
  if (onBelt(G, P)) pool.push(['sweep', 0.26]);
  if (ph >= 2 && S.cd.grease <= 0) pool.push(['grease', 0.2]);
  if (ph >= 2 && S.cd.bell <= 0 && S.adds.length < GB.bell.maxAdds) pool.push(['bell', 0.14]);
  if (ph >= 3 && ad < GB.w / 2 + GB.grab.reach + 10 && P.y > G.floorY - GB.grab.h - 4) pool.push(['grab', 0.28]);
  const ok = pool.filter(([k]) => !twice(k)), tot = ok.reduce((s, q) => s + q[1], 0); let r = Math.random() * tot, k = ok[0][0];
  for (const [kk, wt] of ok) { r -= wt; if (r <= 0) { k = kk; break; } }
  start(e, S, k, w);
}
/* THE PEPPER STOVE: roasting (its chilli waits to go out next) -> cool -> cold (ready) */
function stepStove(S, dt, w) {
  const o = S.stove;
  if (o.st === 'roast' && !o.next && !S.items.some(q => q.kind === 'chilli' && (q.state === 'ride' || q.state === 'wait'))) { o.st = 'cool'; o.t = GB.stove.cool; }
  if (o.st === 'cool') { o.t -= dt; if (o.t <= 0) { o.st = 'cold'; if (!S.told.ready) { S.told.ready = 1; w.number(S.G.bellowsX, S.G.floorY - 50, GB_SAY.ready, '#ffd36b'); } } }
}
/* THE SERVING LINE: an item out of the hatch every GB.line.every s (faster while the bell rushes it); each rides the conveyor to his platter */
function stepLine(e, S, dt, heroes, w) {
  const G = S.G, v = lineV(S);
  if (e.mode !== 'sleep') { S.lineT -= dt * (S.rush > 0 ? GB.bell.mul : 1) * (S.hungry > 0 ? 1.25 : 1);
    if (S.lineT <= 0) { S.lineT = GB.line.every[S.ph - 1]; S.made++;
      let kind = 'dish'; if (S.stove.next) { kind = 'chilli'; S.stove.next = false; S.n.chillies++; } else if (S.made % GB.line.bombEvery === 0) { kind = 'bomb'; S.n.bombs++; } else S.n.dishes++;
      S.items.push({ id: ++S.act, kind, x: G.belt.x0 + 6, state: 'ride', fuse: kind === 'bomb' ? GB.line.fuse : 0 });
      if (kind === 'bomb' && !S.told.bomb) { S.told.bomb = 1; w.number(G.belt.x0 + 60, G.belt.y - 46, GB_SAY.bomb, '#ffd36b'); }
      if (kind === 'chilli' && !S.told.chilli) { S.told.chilli = 1; w.number(G.belt.x0 + 60, G.belt.y - 46, GB_SAY.chilli, '#ff9a5c'); }
      w.sound('hatch'); } }
  for (const it of S.items) {
    if (it.state === 'ride' || it.state === 'bat') {
      it.x += (it.state === 'bat' ? GB.line.batV : v) * dt;
      if (it.kind === 'bomb') { it.fuse -= dt; if (it.fuse <= 0) { it.state = 'gone'; S.n.fizz++; w.burst(it.x, G.belt.y - 8); w.sound('boom'); w.shake(4);
          w.hitArea([it.x - GB.line.blast, it.x + GB.line.blast, G.belt.y - GB.line.blast, G.belt.y + 20], GB.line.blastDmg, 'bomb', 'bz' + it.id); w.number(it.x, G.belt.y - 40, GB_SAY.fizz, '#ff9a5c'); continue; } }
      if (it.x >= G.belt.x1 - 6) { it.x = G.belt.x1 - 6; it.state = 'wait';
        /* a bomb or a chilli goes straight down him, whatever he is doing - unless he is open or warded (then it waits on the platter for him) */
        if (it.kind !== 'dish' && !gbOpen(e) && S.ward <= 0 && e.mode !== 'gulp' && e.mode !== 'eat' && e.mode !== 'wake') { e.handX = null; eat(e, S, it, w); } } }
    else if (it.state === 'fall') { it.vy += 600 * dt; it.x += it.vx * dt; it.y += it.vy * dt; if (it.y >= G.floorY) { it.state = 'gone'; w.smash(it.x, G.floorY); } }
  }
  S.items = S.items.filter(q => q.state !== 'gone' && q.state !== 'eaten');
}
/* THE HIGH LOB: a ballistic arc from over his head, landing on the surface it was aimed at */
export function throwAt(c) { const k = Math.max(0, Math.min(1, c.t / c.T)), H = GB.lob.apex + Math.abs(c.ty - c.y0) / 2;
  return { x: c.x0 + (c.tx - c.x0) * k, y: c.y0 + (c.ty - c.y0) * k - H * 4 * k * (1 - k), k }; }
function stepThrows(S, dt, w) {
  for (const c of S.throws) { c.t += dt; if (c.t < c.T || c.done) continue; c.done = true; w.dust(c.tx, c.ty, 6); w.sound('thud');
    w.hitArea([c.tx - GB.lob.r, c.tx + GB.lob.r, c.ty - 24, c.ty + 2], c.dmg, 'lob', c.key); }
  S.throws = S.throws.filter(c => !c.done);
}
function stepFlings(S, dt, heroes, w) {
  for (const f of S.flings) { f.x -= (f.v || GB.fling.v) * dt; if (f.x < S.G.x0) { f.done = true; continue; }
    const k = Math.min(1, (f.x0 - f.x) / GB.fling.settle); f.y = f.y0 + (f.ty - f.y0) * k;   /* out of his hand, down (or up) to your height in its first stretch, then flat */
    for (const h of heroes) if (h.alive && Math.abs(h.x - f.x) < GB.fling.hw + 5 && f.y > h.y - 22 - GB.fling.hh && f.y < h.y + GB.fling.hh) { w.hitHero(h, f.dmg, 'fling', f.key, { blockable: true }); f.done = true;   /* (a shield turns a plate) */ } }
  S.flings = S.flings.filter(f => !f.done);
}
function stepWaves(S, dt, heroes, w) {
  for (const q of S.waves) { if (q.delay > 0) { q.delay -= dt; continue; } q.life -= dt; q.x += q.dir * GB.belch.sp * dt; if (q.x < S.G.x0 || q.x > S.G.x1) q.life = 0;
    for (const h of heroes) if (h.alive && h.ground && onFloor(S.G, h) && Math.abs(h.x - q.x) < GB.belch.w) w.hitHero(h, q.dmg, 'belch', q.key); }
  S.waves = S.waves.filter(q => q.life > 0);
}
function stepSweeps(S, dt, heroes, w) {
  for (const q of S.sweeps) { q.x -= GB.sweep.sp * dt; if (q.x < S.G.belt.x0) { q.done = true; continue; }
    for (const h of heroes) if (h.alive && h.ground && onBelt(S.G, h) && Math.abs(h.x - q.x) < GB.sweep.w) w.hitHero(h, q.dmg, 'sweep', q.key); }
  S.sweeps = S.sweeps.filter(q => !q.done);
}
/* THE GREASE SPILL: the burning floor spreads both ways from under the cauldron (west the length of the hall, east to his chair), and burns GB.grease.burn s behind its front */
function stepBurns(S, dt, heroes, w) {
  const G = S.G, east = G.chairX - GB.w / 2 + 6;
  S.tipT = Math.max(0, (S.tipT || 0) - dt);
  for (const b of S.burns) { b.t += dt; b.a = Math.max(G.x0, b.a - GB.grease.sp * dt); b.b = Math.min(east, b.b + GB.grease.sp * dt);
    const lit = x => b.t - Math.abs(x - G.cauldron.x) / GB.grease.sp < (b.burn || GB.grease.burn);   /* a spot burns for burn s after the front passes it */
    for (const h of heroes) { if (!h.alive || !onFloor(S.G, h) || h.x < b.a || h.x > b.b || !lit(h.x)) continue;
      const k = (b.beatKey.get(h.pp) || 0) - dt; if (k > 0) { b.beatKey.set(h.pp, k); continue; } b.beatKey.set(h.pp, GB.grease.beat); w.hitHero(h, GB.grease.dmg, 'grease', null); }
    if (b.a <= G.x0 && b.b >= east && !lit(G.x0) && !lit(east)) b.done = true; }
  S.burns = S.burns.filter(b => !b.done);
}
/* the burning span now (for the drawing and the bot): [[x0, x1], ...] */
export function burning(S) { const G = S.G, out = []; for (const b of S.burns) { const r = GB.grease.sp * Math.max(0, b.t - (b.burn || GB.grease.burn)), cx = G.cauldron.x;
    if (cx - r > b.a) out.push([b.a, cx - r]); if (b.b > cx + r) out.push([cx + r, b.b]); } return out; }
/* (claude/kitchengate4) THE COAL TRENCH: a hero on the coals is bitten (spared: never killed by them, no knock), and again every GB.coal.beat s while he stays; the grease's glow,
   then the flare (lit: the bite x GB.coal.lit, and the chain-link steps bite too) */
function stepCoals(S, dt, heroes, w) {
  const G = S.G, T = G.trench, C = S.coal; if (!T) return;
  if (C.glow > 0) { C.glow -= dt; if (C.glow <= 0) { C.glow = 0; C.lit = GB.coal.fire; w.sound('grease'); } } else C.lit = Math.max(0, C.lit - dt);
  for (const h of heroes) { if (!h.alive) continue; const k = Math.max(0, (C.bite.get(h.pp) || 0) - dt); C.bite.set(h.pp, k);
    const bed = onCoals(G, h), step = C.lit > 0 && onStep(G, h); if (!(bed || step) || k > 0) continue;
    C.bite.set(h.pp, GB.coal.beat); S.n.coal++; if (C.lit > 0) S.n.coalLit++;
    const d = Math.round(GB.coal.dmg * (C.lit > 0 && bed ? GB.coal.lit : 1)); w.hitHero(h, d, 'coal', null, { spare: true, noKnock: true, fire: C.lit > 0 });
    if (!S.told.coal) { S.told.coal = 1; w.number(h.x, h.y - 40, GB_SAY.coal, '#ff9a5c'); } }
}
export const coalState = S => (S.coal.lit > 0 ? 'lit' : S.coal.glow > 0 ? 'glow' : 'banked');
/* (claude/kitchengate4) THE PLATTER DROP: a hero let go of an arena hook rail lands on his platter. The food on the line is KNOCKED FLYING (every item off: no dish, no bomb, no
   chilli is left - the stove cold-restarts), and he is KNOCKED OFF HIS FEET: THE THIRD OPENING (GB.drop, short) - one every GB.drop.cd s; never on top of another opening (the
   longer one stands) and never through his ward (B3). Returns what happened: 'open' | 'food' (open or warded already: only the food flies) | null (on cooldown) */
export function platterDrop(e, S, w, x) {
  if (S.cd.drop > 0 || e.mode === 'sleep' || e.mode === 'wake') return null;
  S.cd.drop = GB.drop.cd; let flew = 0;
  for (const it of S.items) if (it.state === 'ride' || it.state === 'bat' || it.state === 'wait') { it.state = 'fall'; it.y = S.G.belt.y; it.vx = (it.x < x ? -1 : 1) * (60 + Math.random() * 80); it.vy = -160 - Math.random() * 80; flew++; }
  S.n.flying += flew; if (S.stove.st !== 'cold') { S.stove.st = 'cold'; S.stove.next = false; S.stove.t = 0; }
  w.number(x, S.G.belt.y - 46, GB_SAY.flying, '#ffd36b'); w.smash(x, S.G.belt.y); w.shake(6);
  if (gbOpen(e) || S.ward > 0 || e.mode === 'gulp') return 'food';
  e.eating = null; e.handX = null; open(e, S, 'drop', w);
  return 'open';
}
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg) {
  if (S.ward > 0) return [Math.max(1, Math.round(dmg * GB.wardMul)), 'WARDED'];
  if (gbOpen(e)) { const d = Math.round(dmg * GB[e.mode].mul), left = S.purse ?? Infinity;
    if (d >= left) { S.purse = 0; return [Math.max(1, Math.round(Math.max(left, dmg * GB.fed))), null]; } S.purse = left - d; return [d, null]; }   /* (the purse spent, a blade still lands well fed: never less than the floor) */
  if (S.hungry > 0) return [Math.max(1, Math.round(dmg * GB.hungry.mul)), null];
  return [Math.max(1, Math.round(dmg * GB.fed)), 'WELL FED'];
}

/* ---------- THE BOT (src/lab.js): what a player reads - his tells a reaction late, the lob's ring on the platform it lands on, the fling's height, the belch's ring, the sweep along the
   line, the burning floor, the grab's arm - and THE RULE: knock the dishes off the line, spare the chillies, bat the bombs, stoke the pepper stove when it is hot, and cut him while
   he is open. It fights the bell's attendants when they come at it. ---------- */
export const PLAN = { react: 0.24, miss: 0.12 };
export const gbHazards = S => S.throws.filter(c => c.t > -0.05).map(c => [c.tx, GB.lob.r + 12, c.ty]);
export function gbPlan(s) {
  const out = avoidTrench(s, gbPlan0(s));
  if (globalThis.__gbWhy) { const k = out.why.replace(/ \(.*/, ''); globalThis.__gbWhy[k] = (globalThis.__gbWhy[k] || 0) + 1; }
  return out;
}
/* (claude/kitchengate4) THE TRENCH SPLITS THE FLOOR: a hero on the floor whose way lies over the trench goes by the line (up onto its near end, along it, off its far end); one
   whose way stops in the trench stops at its lip instead */
function avoidTrench(s, out) {
  const { P, S } = s, G = S.G, TR = G.trench; if (!TR || !P.ground || !onFloor(G, P) || out.jump || out.gx == null) return out;
  const W0 = TR.steps[0][0], E1 = TR.steps[1][1], B = G.belt, mem = s.mem || {}, t = s.t || 0;
  const via = (x, why) => { if (Math.abs(P.x - x) < 9) { out.jump = true; out.gx = x + (x < G.mid ? 12 : -12); mem.jumpT = t; mem.jumpX = out.gx; out.why = why + ' (up)'; } else { out.gx = x; out.why = why; } out.atk = false; return out; };
  if (P.x <= W0 + 2 && out.gx > W0 - 6) return out.gx > E1 ? via((B.x0 + W0) / 2, 'over the trench by the line') : (out.gx = W0 - 6, out);
  if (P.x >= E1 - 2 && out.gx < E1 + 6) return out.gx < W0 ? via((B.x1 + E1) / 2, 'over the trench by the line') : (out.gx = E1 + 6, out);
  return out;
}
function gbPlan0(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, drop: false, up: false, kick: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const half = GB.w / 2, lo = G.x0 + 10, hi = G.chairX - half - 2, clamp = x => Math.max(lo, Math.min(hi, x));
  const kx = e.x, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const B = G.belt, onB = onBelt(G, P), onF = P.ground && onFloor(G, P), bx = x => Math.max(B.x0 + 8, Math.min(B.x1 - 8, x));
  const strikeSpot = clamp(kx - (half + (s.tip ? 4 : 2)));
  const jump = (why, gx = P.x) => { out.jump = true; out.gx = gx; mem.jumpT = t; mem.jumpX = gx; out.why = why; return out; };
  const swing = fx => { out.face = Math.sign(fx - P.x) || out.face; out.atk = P.atk < 0; };
  /* get up onto the line at x (from the floor: under it and jump) */
  const toBelt = (x, why) => { const gx = bx(x); if (onB) { out.gx = gx; out.why = why; return out; }
    if (P.ground && Math.abs(P.x - gx) < 26) return jump(why + ' (up)', gx); out.gx = gx; out.why = why; return out; };
  const burn = burning(S), burnAt = x => burn.some(([a, b]) => x > a - 10 && x < b + 10);
  const hz = gbHazards(S), mySurf = P.ground ? P.y : surfaceY(G, P.x, P.y);
  const inHaz = (x, y) => hz.some(([hx, r, hy]) => Math.abs(x - hx) < r && Math.abs(y - hy) < 6);
  /* (claude/kitchengate4) 0a. ON A HOOK RAIL: the lower one - kick off in its red stretch onto the upper (the hand-off); the upper - ride it to its end over his platter (the drop) */
  const RA = (G.rails || []).find(z => z.hand), RB = RA && RA.hand;
  if (s.zip) { out.gx = null; out.why = 'on the hook'; mem.hookT = t;
    if (RA && s.zip === RA.id) { const hop = (S.rush > 0 && RA.hopRush) || RA.hop, want = mem.hook && S.cd.drop <= 0, mid = hop[0] + (hop[1] - hop[0]) * (mem.hopK ?? (mem.hopK = 0.25 + rng() * 0.5));
      if (want && P.x >= mid) { out.kick = true; out.why = 'the hand-off: kick to the upper hook'; } else if (!want && P.x >= hop[1]) { out.down = true; out.why = 'off the hook (no drop now)'; } return out; }
    if (RB && s.zip === RB.id) { if (S.cd.drop > 0 && P.x > G.platter.x0 - 60) { out.down = true; out.why = 'off the hook (the drop is not ready)'; } else out.why = 'ride the hook to his platter'; return out; }
    return out; }
  if (!P.ground && mem.hookT !== undefined && t - mem.hookT < 1.2) { out.gx = null; out.why = 'off the hook, falling'; return out; }
  /* 0b. DOWN IN THE COAL TRENCH: climb out at the nearer end (to the step, then up onto the floor) */
  const TR = G.trench;
  if (TR && P.ground && inTrench(G, P)) { mem.hook = false; const [w0, e0] = TR.steps, wx = (w0[0] + w0[1]) / 2, ex = (e0[0] + e0[1]) / 2, east = gbOpen(e) ? true : Math.abs(P.x - ex) < Math.abs(P.x - wx), st = east ? e0 : w0, sx = east ? ex : wx;
    if (Math.abs(P.y - TR.stepY) < 4) { const ue = Math.abs(P.x - ex) < Math.abs(P.x - wx); return jump('climb out of the coals', ue ? e0[1] + 18 : w0[0] - 18); }   /* (on a step, wherever on it he stands) */
    if (Math.abs(P.x - sx) < 22) return jump('up onto the step', sx);
    out.gx = sx; out.why = 'the coals: to the step'; return out; }
  /* 1. IN THE AIR: keep going */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.55) { out.gx = mem.jumpX; out.why = 'in the air';
    const it = S.items.find(q => (q.state === 'ride' || q.state === 'bat') && q.kind !== 'chilli' && Math.abs(q.x - P.x) < reach + 6 && P.y < B.y + 4 && P.y > B.y - 40);
    if (it && (it.kind === 'dish' || it.state === 'ride')) { out.face = Math.sign(it.x - P.x) || 1; out.atk = P.atk < 0; out.why = 'strike it off the line (air)'; }
    return out; }
  /* 2. A LOB'S RING ON MY PLATFORM: off it */
  if (P.ground && inHaz(P.x, P.y)) { const [hx, r] = hz.find(([x0, r0, y0]) => Math.abs(P.x - x0) < r0 && Math.abs(P.y - y0) < 6); let gx = P.x + (P.x < hx ? -r - 8 : r + 8);
    if (onB && (gx < B.x0 || gx > B.x1)) gx = P.x < hx ? hx + r + 8 : hx - r - 8; out.gx = Math.max(lo, Math.min(hi, gx)); out.why = 'off the ring'; return out; }
  /* 3. WHAT RUNS AT ME: the belch on the floor, the sweep on the line, the fling at my height - jump it */
  const wave = S.waves.find(q => !(q.delay > 0) && (P.x - q.x) * q.dir > 0 && Math.abs(P.x - q.x) < 36);
  if (wave && onF && seenFor('bw' + wave.key, 0.06) && !roll('bwm' + wave.key, s.v2 ? 0 : PLAN.miss)) return jump('jump the belch');
  const sw = S.sweeps.find(q => q.x > P.x && q.x - P.x < 40);
  if (sw && onB && seenFor('sw' + sw.key, 0.06) && !roll('swm' + sw.key, s.v2 ? 0 : PLAN.miss)) return jump('jump the sweep');
  const fg = S.flings.find(f => f.x > P.x && f.x - P.x < 70 && Math.abs(f.y - (P.y - 10)) < 16);
  if (fg && P.ground && seenFor('fg' + fg.key, 0.05) && !roll('fgm' + fg.key, s.v2 ? 0 : PLAN.miss)) { if (s.shield && !roll('fgb' + fg.key, 0.5)) { out.block = true; out.face = 1; out.gx = P.x; out.why = 'block the fling'; return out; } return jump('jump the fling'); }
  /* 4. THE BURNING FLOOR: up on the line (west end) */
  if (burn.length && (onF || !P.ground) && burnAt(P.x)) return toBelt(Math.min(P.x, B.x1 - 30), 'off the burning floor');
  /* 5. HIS TELLS */
  if (gbTelling(e) || e.mode === 'grab') {
    const key = 'a' + S.act, miss = s.v2 ? false : roll(key + 'm', PLAN.miss), seen = seenFor(key);
    if (seen && !miss) {
      if (e.mode === 'greaseTell' && (onF || !onB)) return toBelt(Math.min(P.x, B.x1 - 40), 'the grease: up on the line');
      if (e.mode === 'grabTell' || e.mode === 'grab') { if (dx < GB.grab.reach + half + 24 && P.y > G.floorY - GB.grab.h - 4) {
          const hand = e.handX; if (e.mode === 'grab' && hand != null && Math.abs(hand - P.x) < 50 && P.ground) { if (s.dodge && roll(key + 'd', 0.4)) { out.dodge = true; out.gx = clamp(P.x - 30); out.why = 'roll the grab'; return out; }
            return jump('jump the grab'); }
          if (e.mode === 'grabTell' && e.modeT < 0.14 && P.ground) return jump('jump the grab (on the beat)');
          out.gx = P.x; out.why = 'the grab: ready to jump'; return out; } }
      if (e.mode === 'sweepTell' && onB) { out.gx = P.x; out.why = 'the sweep: ready to jump'; return out; }
      if (e.mode === 'flingTell') { out.gx = P.x; out.why = 'the fling: ready to jump'; return out; }
      if (e.mode === 'belchTell' && onF) { out.gx = P.x; out.why = 'the belch: ready to jump'; return out; }
      if (e.mode === 'lobTell') { out.gx = P.x + (P.x < G.mid ? 30 : -30); if (onB) out.gx = bx(out.gx); out.why = 'the lob: keep moving'; return out; }
    } }
  /* 6. HE IS OPEN: strike him */
  if (gbOpen(e)) { if (onB && P.x < B.x1 - 10) { out.gx = strikeSpot; out.why = 'open: off the line to him'; return out; }
    out.gx = strikeSpot; if (dx < hitR + 4) swing(kx); out.why = 'strike him: open'; return out; }
  /* 7. AN ATTENDANT AT ME: cut him down */
  const add = (S.adds || []).filter(a => a && a.alive).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (add && Math.abs(add.x - P.x) < 90 && Math.abs(add.y - P.y) < 30) { const sd = Math.sign(add.x - P.x) || 1; out.gx = add.x - sd * Math.max(8, reach - 6); if (Math.abs(add.x - P.x) < reach + 8) swing(add.x); out.why = 'the attendant'; return out; }
  /* 8. A BOMB ON THE LINE: bat it along to him (from its west side) */
  const bomb = S.items.find(q => q.kind === 'bomb' && q.state === 'ride');
  if (bomb && bomb.x < B.x1 - 40) { const spot = bomb.x - Math.max(10, reach - 6);
    if (!onB) return toBelt(spot, 'to the bomb');
    out.gx = bx(spot); if (Math.abs(bomb.x - P.x) < reach + 4 && bomb.x > P.x) swing(bomb.x); out.why = 'bat the bomb'; return out; }
  /* 9. A DISH ON THE LINE: knock it off (never with a chilli in reach) - the one nearest his platter first */
  const dishes = S.items.filter(q => q.kind === 'dish' && q.state === 'ride').sort((a, b) => b.x - a.x);
  const chilliNear = x => S.items.some(q => q.kind === 'chilli' && (q.state === 'ride') && Math.abs(q.x - x) < reach + 14);
  const d = dishes.find(q => !chilliNear(q.x) && !roll('dsk' + q.id, s.v2 ? 0 : 0.12));
  if (d && S.ward <= 0.4) { const sd = P.x < d.x ? -1 : 1, spot = d.x + sd * Math.max(10, reach - 6);
    if (!onB) return toBelt(spot, 'to the dish');
    out.gx = bx(spot); if (Math.abs(d.x - P.x) < reach + 4) swing(d.x); out.why = 'knock the dish off'; return out; }
  /* 10. THE PEPPER STOVE IS HOT and no chilli out: stoke it */
  if (S.stove.st === 'cold' && !S.items.some(q => q.kind === 'chilli')) { const spot = Math.max(lo, G.bellowsX + 12);
    if (onB) { out.gx = B.x0 - 14; out.drop = false; out.why = 'to the stove (off the line)'; return out; }
    if (Math.abs(P.x - spot) > 5) { out.gx = spot; out.why = 'to the stove'; return out; }
    out.face = -1; out.atk = P.atk < 0 && !roll('st' + S.n.stokes + Math.floor(t * 3), s.v2 ? 0 : 0.15); out.why = 'stoke the stove'; return out; }
  /* 11. A CHILLI OR A BOMB GOING DOWN HIM SOON: be at his belly for the opening */
  const coming = S.items.find(q => q.kind !== 'dish' && (q.state === 'ride' || q.state === 'bat' || q.state === 'wait'));
  if (coming && (B.x1 - coming.x) / (coming.state === 'bat' ? GB.line.batV : lineV(S)) < 3.2 && S.ward <= 0) { out.gx = strikeSpot - 30; out.why = 'the opening coming: to him'; return out; }
  /* (claude/kitchengate4) 11b. THE HOOK ROUTE: the drop is ready and he is himself - up on the line under the lower hook, UP to take it (then 0a flies it). Weighed per move of his
     (mem.hook, a roll) so it never starves the bombs, the chillies or the dishes */
  if (RA && S.cd.drop <= 0 && S.ward <= 0 && !gbOpen(e) && e.mode !== 'gulp') { if (mem.hookAct !== S.act) { mem.hookAct = S.act; mem.hook = rng() < (s.v2 ? 0.7 : 0.5); mem.hopK = undefined; }
    if (mem.hook) { const spot = Math.max(B.x0 + 10, RA.x0 + 18);
      if (!onB) return toBelt(spot, 'to the hook');
      if (Math.abs(P.x - spot) < 14) { out.up = true; out.gx = P.x; out.why = 'take the hook (UP)'; return out; }
      out.gx = bx(spot); out.why = 'under the hook'; return out; } }
  /* 12. NOTHING ON: chip him while he sits (well fed), or wait on the line */
  if (s.rest) { out.gx = bx(B.x0 + 40); out.why = 'winded: wait on the line'; if (!onB && P.ground && Math.abs(P.x - out.gx) < 26) return jump(out.why, out.gx); return out; }
  if (e.mode === 'sit' && S.ward <= 0 && S.restT > 0.5 && !roll('chip' + S.act, s.v2 ? 0 : 0.35)) { out.gx = strikeSpot; if (dx < hitR) swing(kx); out.why = 'chip him (well fed)'; return out; }
  return toBelt(B.x0 + (B.x1 - B.x0) * 0.4, 'wait on the line');
}
