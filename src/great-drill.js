// src/great-drill.js - THE GREAT DRILL, THE DEEP RAILS' boss (claude/minecart, the OPUS GREYBOX; GREAT DRILL 2, claude/deeprails2; GREAT DRILL 3, claude/deeprails3 -
// Daniel 10-10 live: "too hard to ram it with the ore; another way to hit it + a couple more attacks that fit" - he picked all four new moves).
// Pure: no DOM, no main.js. The world (the endless tunnel, the ore carts, the chute's points lever, the chain's pull) and the drawing are src/great-drill-hands.js; the bot
// that fights it is drillPlan below (src/lab.js drives the keys).
//
// A GOBLIN DRIVING A DRILL RIG: a big conical bit, an engine block and its smokestack, tracks and rail wheels, a goblin in the cab looking back at you. A CONSTRUCT
// (design standard B14), THE RULE PERSONIFIED: it never stops - it bores on AHEAD of you down an ENDLESS TUNNEL and you chase it in your cart.
// THE ARENA: three lines (LOW, MID, HIGH: three rows apart, one-way rail - jump up, down + jump to drop). Its REAR faces you: low on the LOW line its GEAR HOUSING (the
// bare red GEARS and a ram plate), on the housing a deck at the MID line, and on the deck its CAB - the goblin's box (you strike it from the MID line). The HIGH line
// runs on over the rig's flat roof to its SMOKESTACK.
// THE READ (B10, B15): outside its opening the cab is ARMOURED - a blow takes x0.4 (it CLANKS and says ARMOURED: THROW ITS POINTS); never totally invulnerable.
// ITS OPENING (B1 - THE LEVEL'S VERB, deeprails3: THROW THE POINTS): it is a mining rig - every cycle its CHUTE rattles ('ORE!') and its ore conveyor's POINTS LEVER
// comes down the tunnel at you, trackside (a tall post: a blow or E from ANY line throws it - every hero, from the cart). THROW IT and the chute dumps its own ore into
// its GEARS: JAMMED - the bit stops, the gears smoke, the rig drifts back to you; a gold outline on the cab and the gears and a timer bar (B10); the cab takes x2 (capped
// a share a jam). Miss the lever and it kicks a LOADED ORE CART off its back onto the LOW line instead: PUMP AND RAM IT into its gears - the same jam (the bonus way, kept).
// B3: after every jam a TOLD 3 s WARD ('IT CLEARS ITS GEARS': its plates up - x0.4 still, B15; no lever comes, an ore cart is shrugged off). B4: jammed, it stands.
// THE MOVES (every one told - sound + word + colour - one windup at a time; one new a phase, B5):
//   P1 (100-60%): NEW: DYNAMITE - the goblin in the cab lobs lit sticks onto your line ahead (!! DYNAMITE: a fizzing fuse on the rail, sliding at you): change line, brake
//                 or pump off it, or be in the air when it goes.  REVERSE RAM (!! lamps + klaxon: brake out, or jump up to the HIGH line).  BOULDER DROP (shadows on two lines).
//   P2 (60-30%): NEW: THE SPIN-UP LUNGE - its cutter head whines and throws sparks (!! DUCK: a red line across your line at head height), then lunges back down the tunnel at
//                 head height - DUCK IN THE TUB (or change line).  NEW: THE GRAPPLE CHAIN - !! THE HOOK swings, then flies at your cart: snagged, you are dragged at its
//                 rear - JUMP (off the line) or STRIKE the chain to cut it; be in the air or on another line when it lands and it misses.
//   P3 (30-0%):  THE ARENA CHANGES (B5): the roof takes the HIGH line (two lines left). NEW: ROOF COLLAPSE - it gouges the roof: rubble falls on told spots (dust and
//                 shadows across every line) - pump through or brake.
// (The GREAT DRILL 2 spark spray is retired: the lunge reads better as its rear's line attack.)
// GREAT DRILL 4 (claude/deeprails4, Daniel 10-12 live: "GEARS: each powers one attack, break one and that attack is gone for the phase - the fight ~half gears, half body"):
//   ITS GEAR TOWER. Up its rear face, one GEAR BANK per height, EACH DRIVING ONE OF ITS ATTACKS (GEARS below): THE CHAIN WINCH (the grapple chain) on the gear housing -
//   struck from the LOW line; THE SPIN-UP GEAR (the lunge) under the deck's lip - a JUMP from the LOW line; THE DYNAMITE FEED (the driver's sticks) on the deck - the MID
//   line, standing back from the cab; THE ROOF WINCH (the boulders, the roof collapse) at the mast head - the HIGH line (P3, the high line down: a JUMP from the MID line).
//   A phase shows only the banks whose attack it uses (P1 two, P2 three, P3 four). Every gear is ALWAYS hittable and takes a blow whole (no armour); a few blows and it
//   SMOKES, SPARKS AND STOPS: that attack is GONE FOR THE PHASE (its windup cancelled if it was coming), and the rig STALLS (gearStallT: the shared OPEN read on the cab,
//   a smaller purse - gearStallCap - then the B3 ward). A new phase bolts on NEW GEARS.
//   HALF GEARS, HALF BODY - THE GEARS HOLD IT: at each phase line (60%, 30%) and at its end the drive will not give until HALF that phase's banks are broken (gearsNeed:
//   1 of 2, 2 of 3, 2 of 4). A blow that would take it past a shut line is HELD (B15: never nothing - the clank says ITS GEARS HOLD IT: HIT THE GEARS; up to heldCap of
//   it), and lands the moment the gate opens (THE DRIVE GIVES). So the body alone never passes a line, and the gears alone never empty the bar.
//   B16: each gear-driven attack has its own rig pose and its gear SPINS UP (glows, whirs) through its windup - the tell names the gear that drives it.
export const DRILL_STAGE = { W: 30, lanes: [0, 3, 6], ceil: 10, chute: 12 };
export const DRILL = {
  /* GREAT DRILL 3 NUMBERS (claude/deeprails3): a greybox pass - the Sonnet tune lane measures it WITH FLASKS (tools/boss-rates.mjs minecart --profile=human) */
  hp: 2400, cruise: 150,
  homeR: 290, minR: 150, maxR: 360,     /* the rig's rear face, px from the arena's left edge: at home, and the nearest a reverse brings it */
  plateW: 62, cabIn: 30, cabW: 30, plateH: 40, cabH: 40, stackX: 150,
  contactDmg: 64, contactCd: 1.0, shove: 60,
  armour: 0.4,                          /* B15: outside the jam a blow on the cab takes this */
  rockTell: 1.1, rockDmg: 64, rockW: 26,
  revTell: 1.25, revV: 230, revT: 0.42, revHold: 0.4, revBack: 120, revDmg: 62,
  oreFirst: 3.5, oreEvery: [8.5, 8.0, 7.5], chuteTell: 1.1, oreDmg: 28, oreFly: 300, orePull: 70,
  leverLead: 230, leverReach: 30, leverDump: 0.45,   /* THE CHUTE'S POINTS LEVER: it rises this far ahead of you and comes down the tunnel at cruise; thrown, the chute dumps (this long) into its gears */
  jamT: 4.2, jamMul: 2.3, jamCap: 0.15, wardT: 3.0, drift: 45,
  dynTell: 0.5, dynFuse: 1.3, dynR: 24, dynDmg: 56,                    /* DYNAMITE: the arm back (told), then the stick's fuse on your line - it bursts where you are if you hold */
  lungeTell: 1.0, lungeT: 0.45, lungeDmg: 60, lungeHead: 16,          /* THE SPIN-UP LUNGE: the whine, then its head down your line at head height (px over the line) */
  chainTell: 0.9, chainFly: 0.3, chainT: 2.2, chainPull: 95, chainDmg: 20,   /* THE GRAPPLE CHAIN: the hook swings, flies; snagged, your cart is dragged at it this fast */
  collapseTell: 1.25, collapseW: 30, collapseDmg: 62, collapseApart: 150,     /* ROOF COLLAPSE: two spots - where you will be if you hold, and this far ahead of it */
  phase2: 0.6, phase3: 0.3, phaseT: 2.0,
  /* (deeprails4) THE GEARS: a bank's health (a few blows at campaign level), the stall a broken one costs it (an OPEN of its own: >= 3 s, its own purse), the held
     purse at a shut gate. The Sonnet tune lane owns these (and the fight's hp) - greybox numbers */
  gearHp: 120, gearStallT: 3.0, gearStallCap: 0.05, heldCap: 0.12, gearW: 16,
  gap: [0.3, 0.22, 0.15],
  /* (deeprails5, Daniel 10-14: +2 told attacks tied to the gears / rails) THE SPARE CUTTER (P2, the SPIN-UP GEAR's): told (its boom lifts a spare cutter disc, the gear spins up,
     '!! A CUTTER: STRIKE IT BACK'), then bowled down your line at shin height - STRIKE IT as it reaches you and it flies back into its own gears (cutterBite off a bank), or JUMP it.
     THE RAIL CLAW (P3, the CHAIN WINCH's): told (the claw drops on its chain behind the rig, the stretch of your line it will rip marked red, '!! THE CLAW: PUMP AND JUMP'), then
     that stretch of rail is TORN and comes down the tunnel at you with the world - too long for a cruising jump (clawW): PUMP AND JUMP it (the level's pump gap) or change line */
  cutterTell: 0.9, cutterFly: 0.45, cutterLead: 50, cutterV: 160, cutterDmg: 36, cutterR: 9, cutterH: 16, cutterBite: 55, cutterBackV: 420,   /* (bowled: it flies cutterFly s off the boom - its landing marked on your line, cutterLead px ahead of you - then rolls at you) */
  clawTell: 1.1, clawW: 92, clawDmg: 44,   /* (clawW: + a cart's width it is 0.45 s under a pumped jump (0.62 s aloft), 0.69 s under a cruising one - it falls short) */
  chain: { 1: ['dynamite', 'reverse', 'rocks', 'dynamite', 'reverse', 'rocks'], 2: ['lunge', 'dynamite', 'chain', 'reverse', 'cutter', 'chain', 'dynamite'],
    3: ['collapse', 'chain', 'lunge', 'reverse', 'claw', 'dynamite', 'cutter'] },
};
export const LANE_NAME = ['LOW', 'MID', 'HIGH'];
/* THE STAGE: carve the arena into the level; returns { arena, carve } */
export function stageDrill(Wr, T, TS, sx, F) {
  const S = DRILL_STAGE;
  const carve = () => {
    Wr.block(sx, sx + S.W - 1, F, F + 21);
    Wr.block(sx - 1, sx + S.W + 5, 0, F - S.ceil - 1);
    Wr.air(sx, sx + S.W - 1, F - S.ceil, F - 1);
    for (const ln of S.lanes) if (ln) for (let x = sx; x < sx + S.W; x++) Wr.set(x, F - ln, T.RAIL);
    Wr.ent('greatdrill', sx + 20, F - 1, { face: -1 });
    Wr.ent('oretip', sx + S.chute, F - 8, {});
  };
  const arena = { x0: sx * TS, x1: (sx + S.W) * TS, floor: F * TS, trigger: (sx + 4) * TS, wallL: sx - 1, wallR: sx + S.W, boss: 'greatdrill', music: 'greatdrill',
    tint: '#d89a5a', tintA: 0.05, start: [sx + 6, F - 1], drill: { sx, F } };
  return { arena, carve };
}
/* the arena in world px */
export function geom(A, TS = 16) {
  const q = A.drill, S = DRILL_STAGE, sx = q.sx, F = q.F;
  return { x0: sx * TS, x1: (sx + S.W) * TS, F, TS, floor: F * TS, laneY: S.lanes.map(l => (F - l) * TS), chuteX: (sx + S.chute) * TS + 8, ceilY: (F - S.ceil) * TS };
}
export const lanesOf = S => (S && S.highDown ? [0, 1] : [0, 1, 2]);
export function laneOf(G, y, tol = 6) { for (let i = 0; i < 3; i++) if (Math.abs(y - G.laneY[i]) <= tol) return i; return -1; }
export function laneUnder(G, y) { for (let i = 2; i >= 0; i--) if (y <= G.laneY[i] + 4) return i; return 0; }
export const drillOpen = e => !!e && (e.open || 0) > 0 && e.mode === 'jammed';
/* ITS CAB CAN BE STRUCK whenever it is up (B13/B15: armoured x0.4, jammed x2) - what src/boss-greed.js reads as its opening: only the jam is the opening */
export const drillHittable = e => !!e && drillOpen(e);
export const rearX = S => S.G.x0 + S.R;
export const plateBox = (G, S) => ({ l: rearX(S), r: rearX(S) + DRILL.plateW, t: G.laneY[0] - DRILL.plateH, b: G.laneY[0] });
export const gearBox = (G, S) => ({ l: rearX(S), r: rearX(S) + 16, t: G.laneY[0] - 34, b: G.laneY[0] - 4 });
export const cabBox = (G, S) => ({ l: rearX(S) + DRILL.cabIn, r: rearX(S) + DRILL.cabIn + DRILL.cabW, t: G.laneY[1] - DRILL.cabH, b: G.laneY[1] });
export const frontFor = (G, S, lane) => (lane <= 0 ? rearX(S) : lane === 1 ? cabBox(G, S).l : rearX(S) + DRILL.stackX);
/* THE CHUTE'S POINTS LEVER's box (a tall trackside post: every line reaches it) */
export const leverBox = (G, lv) => ({ l: lv.x - 9, r: lv.x + 9, t: G.laneY[2] - 44, b: G.laneY[0] });
/* (deeprails4) THE GEAR TOWER: one bank per height up its rear face (px over its line: t..b); 'jump' = struck from a jump off the line under it */
export const GEARS = [
  { id: 'chain', name: 'THE CHAIN WINCH', moves: ['chain', 'claw'], lane: 0, t: -30, b: -8, word: 'NO MORE CHAIN' },   /* (deeprails5) the chain winch drives the RAIL CLAW too */
  { id: 'lunge', name: 'THE SPIN-UP GEAR', moves: ['lunge', 'cutter'], lane: 0, t: -44, b: -32, jump: true, word: 'NO MORE LUNGE' },   /* (deeprails5) and the SPARE CUTTER */
  { id: 'dyn', name: 'THE DYNAMITE FEED', moves: ['dynamite'], lane: 1, t: -30, b: -8, word: 'NO MORE DYNAMITE' },
  { id: 'roof', name: 'THE ROOF WINCH', moves: ['rocks', 'collapse'], lane: 2, t: -30, b: -8, word: 'NO MORE ROCKFALL' },
];
export const gearBoxOf = (G, S, g) => ({ l: rearX(S) - DRILL.gearW / 2, r: rearX(S) + DRILL.gearW / 2, t: G.laneY[g.lane] + g.t, b: G.laneY[g.lane] + g.b });
export const phaseGears = ph => GEARS.filter(g => g.moves.some(m => (DRILL.chain[ph] || []).includes(m)));
export const gearsNeed = ph => Math.ceil(phaseGears(ph).length / 2);
export const moveGear = m => GEARS.find(g => g.moves.includes(m)) || null;
export function armGears(S) { S.armed = 1; S.gears = {}; for (const g of phaseGears(S.ph)) S.gears[g.id] = { hp: DRILL.gearHp, max: DRILL.gearHp, broken: false, hot: 0, flash: 0, smoke: 0 }; }
export const gearUp = (S, id) => !!(S.gears && S.gears[id] && !S.gears[id].broken);
export const brokenN = S => Object.values(S.gears || {}).filter(q => q.broken).length;
export const gateShut = S => brokenN(S) < gearsNeed(S.ph);
const lineOf = (e, ph) => (ph >= 4 ? -Infinity : Math.round(e.maxHp * (ph === 1 ? DRILL.phase2 : ph === 2 ? DRILL.phase3 : 0)) + 1);
/* the floor a blow stops at: this phase's line while its gears hold it; once they give, the NEXT line (no blow runs on past it into a phase whose gears are not up yet) */
export const gateFloor = (S, e) => lineOf(e, gateShut(S) ? S.ph : S.ph + 1);
/* where a hero stands to strike a gear: its line (a jump bank: the line under it, and he jumps) */
export const gearStand = (S, g) => (g.jump ? { lane: 0, jump: true } : g.lane === 2 && S.highDown ? { lane: 1, jump: true } : { lane: g.lane, jump: false });

export function newFight(G) {
  return { G, ph: 1, i: 0, cd: 1.8, t: 0, ward: 0, R: DRILL.homeR, rocks: [], dyn: [], spots: [], lunge: null, hook: null, snag: null, lever: null, ores: [], oreT: DRILL.oreFirst, oreN: 0, chute: null, openTaken: 0, contactCd: 0, revV: 0,
    cutters: [], tears: [], cutPend: null, clawPend: null,   /* (deeprails5) THE SPARE CUTTER's discs on the lines, THE RAIL CLAW's torn stretches */
    n: { rocks: 0, reverse: 0, dynamite: 0, lunge: 0, chain: 0, collapse: 0, ores: 0, levers: 0, thrown: 0, jams: 0, rammed: 0, crashed: 0, shrugged: 0, warded: 0, cab: 0, armoured: 0, contact: 0,
      revHits: 0, rockHits: 0, dynHits: 0, lungeHits: 0, snags: 0, cuts: 0, collapseHits: 0, gears: 0, gearBlows: 0, gearDmg: 0, stalls: 0, held: 0, gave: 0,
      cutter: 0, cutterHits: 0, cutBacks: 0, cutBites: 0, claw: 0, clawHits: 0 }, told: {}, held: 0, pass: 0, gears: null, armed: 0 };
}
const beginJam = (e, S, c, how) => { const gear = how === 'gear'; e.mode = 'jammed'; e.open = gear ? DRILL.gearStallT : DRILL.jamT; e.openT0 = e.open; S.openKind = gear ? 'gear' : 'jam'; S.openTaken = 0; if (gear) S.n.stalls++; else S.n.jams++; S.lunge = null; S.hook = null; S.snag = null; S.revV = 0;
  c.sound && c.sound('jam'); c.shake && c.shake(6); c.number(rearX(S), S.G.laneY[1] - 40, how === 'lever' ? 'ITS OWN ORE IN ITS GEARS: STRIKE THE CAB' : gear ? 'A GEAR GONE: IT STALLS - STRIKE THE CAB' : 'THE ORE JAMS ITS GEARS: STRIKE THE CAB', '#ffd36b'); };
/* THE POINTS THROWN (src/great-drill-hands.js: a blow on the lever, or E beside it) - true when it took */
export function throwLever(S, c) { const lv = S.lever; if (!lv || lv.thrown || lv.gone) return false; lv.thrown = true; lv.dump = DRILL.leverDump; S.n.thrown++; c && c.sound && c.sound('points');
  c && c.number(lv.x, S.G.laneY[2] - 50, 'POINTS THROWN: ITS ORE GOES IN ITS GEARS', '#ffd36b'); return true; }

/* ---------- ONE FRAME ---------- heroes: [{ x, y, ground, alive, pp, lane, v (the cart's world pace), duckAt(y) -> true when his tub is ducked under a blow at y }]
   c: { hit(box, dmg, name, o) -> bool, number(x, y, t, col), sound(k), shake(n), music(ph), crash(h, o), shove(h, px), arena(k), snag(h) } */
export function stepDrill(e, S, dt, heroes, c) {
  const G = S.G; S.t += dt;
  if (!S.armed) { armGears(S); S.armed = 1; }
  for (const q of Object.values(S.gears || {})) { q.hot = Math.max(0, q.hot - dt); q.flash = Math.max(0, q.flash - dt); if (q.broken) q.smoke += dt; }
  { const cb = cabBox(G, S); e.x = (cb.l + cb.r) / 2; e.y = cb.b; e.gdWard = S.ward; }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.modeT = (e.modeT ?? 1.6) - dt; if (e.modeT <= 0) { e.mode = 'idle'; S.cd = 1.4; } return; }
  const live = heroes.filter(h => h.alive), heroX = live.length ? Math.min(...live.map(h => h.x)) : G.x0 + 100;
  S.contactCd = Math.max(0, S.contactCd - dt);
  /* THE ORE CYCLE: the chute rattles and its POINTS LEVER comes down the tunnel - thrown, the chute dumps into its gears (JAMMED); missed, it kicks an ORE CART off its back */
  if (!drillOpen(e) && e.mode !== 'phase' && S.ward <= 0) S.oreT -= dt;
  if (S.oreT <= 0 && !S.chute && !S.lever && S.ores.length === 0 && (e.mode === 'idle' || e.mode === 'rockTell')) {
    S.chute = { t: DRILL.chuteTell, R: Math.min(DRILL.maxR, S.R + DRILL.orePull) }; S.oreN++; S.n.levers++; c.sound && c.sound('chute');
    S.lever = { x: Math.min(G.x1 - 12, heroX + DRILL.leverLead), id: S.oreN, thrown: false, dump: 0 };
    c.number(rearX(S) - 20, G.laneY[2] - 30, S.told.ore ? 'ORE! THROW ITS POINTS' : 'ORE! ITS POINTS LEVER COMES: STRIKE IT, OR E', '#ffd36b'); S.told.ore = 1; }
  if (S.lever) { const lv = S.lever;
    if (lv.thrown) { lv.dump -= dt; if (lv.dump <= 0 && !lv.gone) { lv.gone = true; S.chute = null; S.oreT = DRILL.oreEvery[S.ph - 1]; if (!drillOpen(e) && S.ward <= 0 && e.mode !== 'phase') beginJam(e, S, c, 'lever'); } }
    lv.x -= DRILL.cruise * dt;
    if (lv.x < G.x0 - 20 || (lv.gone && lv.x < heroX - 60)) { if (!lv.thrown && S.chute) S.chute.t = Math.min(S.chute.t, 0.2); S.lever = null; } }
  if (S.chute && !(S.lever && S.lever.thrown)) { S.R += Math.max(0, Math.min(DRILL.revBack * 1.4 * dt, S.chute.R - S.R)); S.chute.x = rearX(S);
    if (!S.lever) { S.chute.t -= dt;   /* (the lever went by unthrown: it kicks the ore cart off its back instead - the bonus ram) */
      if (S.chute.t <= 0) { S.ores.push({ x: rearX(S) - 16, lane: 0, id: S.oreN, y: G.laneY[0], fly: false, vy: 0, dy: -40 }); S.chute = null; S.n.ores++; S.oreT = DRILL.oreEvery[S.ph - 1]; c.sound && c.sound('oreLand');
        if (!S.told.cart) { S.told.cart = 1; c.number(rearX(S) - 20, G.laneY[2] - 30, 'AN ORE CART: PUMP AND RAM IT INTO ITS GEARS', '#ffd36b'); } } } }
  for (const o of S.ores) {
    if (o.dy < 0) { o.vy += 900 * dt; o.dy = Math.min(0, o.dy + o.vy * dt); }
    if (o.fly) { o.x += DRILL.oreFly * dt; if (o.x >= rearX(S) - 4) { o.dead = true;
        if (!drillOpen(e) && S.ward <= 0 && e.mode !== 'phase') beginJam(e, S, c, 'ore'); else { S.n.shrugged++; c.sound && c.sound('eat'); c.number(rearX(S), G.laneY[0] - 50, S.ward > 0 ? 'ITS PLATES ARE UP: IT SHRUGS IT OFF' : 'IT SHRUGS IT OFF', '#9aa39a'); } }
      continue; }
    o.x -= DRILL.cruise * dt;
    if (o.x < G.x0 - 20) { o.dead = true; continue; }
    if (o.dy < -2) continue;
    for (const h of live) if ((h.lane === 0 || (h.lane < 0 && Math.abs(h.y - G.laneY[0]) < 20)) && Math.abs(h.x - o.x) < 16 && !o.dead) {
      if (h.v >= c.ramV) { o.fly = true; S.n.rammed++; c.sound && c.sound('ram'); c.shake && c.shake(4); c.number(o.x, G.laneY[0] - 34, 'RAMMED: INTO ITS GEARS!', '#ffd36b'); c.rammed && c.rammed(h, o); }
      else { o.dead = true; S.n.crashed++; c.crash && c.crash(h, o); }
      break; }
  }
  S.ores = S.ores.filter(o => !o.dead);
  /* THE BOULDERS: their shadows slide at you down the tunnel; the rock falls on them */
  for (const r of S.rocks) { r.x -= DRILL.cruise * dt; r.t -= dt; if (r.t <= 0 && !r.hit) { r.hit = true; S.n.rockHits += c.hit([r.x - DRILL.rockW / 2, r.x + DRILL.rockW / 2, G.laneY[r.lane] - 30, G.laneY[r.lane]], DRILL.rockDmg, 'A BOULDER', { key: 'rock' + r.id }) ? 1 : 0; c.sound && c.sound('rock'); } }
  S.rocks = S.rocks.filter(r => r.t > -0.5);
  /* DYNAMITE: a lit stick on a line, sliding at you on the running rail - it bursts at the end of its fuse (in the air over it, you are clear) */
  for (const d of S.dyn) { if (d.fly > 0) { d.fly -= dt; continue; } d.x -= DRILL.cruise * dt; d.t -= dt;
    if (d.t <= 0 && !d.hit) { d.hit = true; c.sound && c.sound('boom'); c.shake && c.shake(3); S.n.dynHits += c.hit([d.x - DRILL.dynR, d.x + DRILL.dynR, G.laneY[d.lane] - 26, G.laneY[d.lane] + 2], DRILL.dynDmg, 'DYNAMITE', { key: 'dyn' + d.id, ground: true }) ? 1 : 0; } }
  S.dyn = S.dyn.filter(d => d.t > -0.4);
  /* ROOF COLLAPSE: rubble on its told spots, every line under them */
  for (const sp of S.spots) { sp.x -= DRILL.cruise * dt; sp.t -= dt; if (sp.t <= 0 && !sp.hit) { sp.hit = true; c.sound && c.sound('rock'); c.shake && c.shake(4);
      S.n.collapseHits += c.hit([sp.x - DRILL.collapseW / 2, sp.x + DRILL.collapseW / 2, G.ceilY, G.laneY[0]], DRILL.collapseDmg, 'THE ROOF', { key: 'roof' + sp.id }) ? 1 : 0; } }
  S.spots = S.spots.filter(sp => sp.t > -0.5);
  /* (deeprails5) THE SPARE CUTTER: a disc rolling at you down its line (faster than the world) at shin height - in the air over it you are clear; STRUCK BACK (src/great-drill-hands.js:
     a blow on it) it flies up the line into its own gears: a bite off a bank (its own spin-up gear first) */
  for (const cu of S.cutters) {
    if (cu.back) { cu.x += DRILL.cutterBackV * dt; if (cu.x >= rearX(S) - 4) { cu.dead = true; S.n.cutBites++; const id = gearUp(S, 'lunge') ? 'lunge' : (GEARS.find(g => gearUp(S, g.id)) || {}).id;
        c.sound && c.sound('clank'); c.shake && c.shake(3); if (id) { c.number(rearX(S) - 20, G.laneY[0] - 56, 'STRUCK BACK: INTO ITS GEARS', '#8fd160'); hitGear(e, S, id, DRILL.cutterBite, c, {}); } } continue; }
    if (cu.fly > 0) { cu.fly -= dt; const k = 1 - Math.max(0, cu.fly) / DRILL.cutterFly; cu.x = cu.x0 + (cu.tx - cu.x0) * k; continue; }   /* (in the air off the boom: harmless, its landing marked) */
    cu.x -= DRILL.cutterV * dt;
    if (cu.x < G.x0 - 20) { cu.dead = true; continue; }
    if (!cu.hit) { const y = G.laneY[cu.lane]; if (c.hit([cu.x - DRILL.cutterR, cu.x + DRILL.cutterR, y - DRILL.cutterH, y + 2], DRILL.cutterDmg, 'THE SPARE CUTTER', { key: 'cutter' + cu.id })) { cu.hit = true; S.n.cutterHits++; } } }
  S.cutters = S.cutters.filter(cu => !cu.dead);
  /* (deeprails5) THE RAIL CLAW's TORN STRETCH: a length of its line ripped up, coming down the tunnel with the world - a cart on that line meets the torn rail (a crash);
     a pumped jump clears it, a cruising one falls short (clawW > a cruising jump's reach over it) */
  for (const tr of S.tears) { tr.x -= DRILL.cruise * dt; const y = G.laneY[tr.lane];
    if (c.hit([tr.x, tr.x + DRILL.clawW, y - 5, y + 2], DRILL.clawDmg, 'THE TORN RAIL', { key: 'tear' + tr.id })) S.n.clawHits++;
    if (tr.x + DRILL.clawW < G.x0 - 20) tr.dead = true; }
  S.tears = S.tears.filter(tr => !tr.dead);
  /* THE SPIN-UP LUNGE: its head down your line at head height - a ducked tub is under it */
  if (S.lunge) { const L0 = S.lunge; L0.t -= dt;
    if (L0.on) { const x1 = rearX(S), y = G.laneY[L0.lane] - DRILL.lungeHead; S.n.lungeHits += c.hit([G.x0 - 20, x1, y - 8, y + 4], DRILL.lungeDmg, 'THE SPIN-UP LUNGE', { key: 'lunge' + S.n.lunge, duck: y }) ? 1 : 0; }
    if (L0.t <= 0) { if (!L0.on) { L0.on = true; L0.t = DRILL.lungeT; c.sound && c.sound('lunge'); c.shake && c.shake(3); } else { S.lunge = null; if (e.mode === 'lunge') e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } } }
  /* THE GRAPPLE CHAIN: the hook flies at the line it swung at; a hero on it, wheels on the rail, is SNAGGED and dragged at its rear until he jumps or cuts it */
  if (S.hook) { const hk = S.hook; hk.t -= dt;
    if (hk.t <= 0) { if (!hk.flying) { hk.flying = true; hk.t = DRILL.chainFly; c.sound && c.sound('chain'); }
      else { S.hook = null; e.mode = e.mode === 'chain' ? 'idle' : e.mode; S.cd = DRILL.gap[S.ph - 1];
        const h = live.find(q => q.lane === hk.lane && q.ground);
        if (h) { S.snag = { pp: h.pp, t: DRILL.chainT, lane: hk.lane }; S.n.snags++; c.hit([h.x - 6, h.x + 6, G.laneY[hk.lane] - 30, G.laneY[hk.lane] + 2], DRILL.chainDmg, 'THE GRAPPLE CHAIN', { key: 'hook' + S.n.chain }); c.snag && c.snag(h); c.number(h.x, G.laneY[hk.lane] - 40, '!! SNAGGED: JUMP, OR STRIKE THE CHAIN', '#ff6b6b'); }
        else c.sound && c.sound('clank'); } } }
  if (S.snag) { S.snag.t -= dt; if (S.snag.t <= 0) S.snag = null; }
  /* THE REAR: a hero who rolls into it is struck and thrown back (IT gives no ground; the cart is shoved, never teleported - B7) */
  for (const h of live) { const lane = h.lane >= 0 ? h.lane : laneUnder(G, h.y), fx = frontFor(G, S, lane);
    if (h.x + 6 > fx && S.contactCd <= 0 && !drillOpen(e)) { const rev = e.mode === 'reverse' && S.revV > 0, d = rev ? DRILL.revDmg : DRILL.contactDmg;
      if (c.hit([fx - 4, fx + 60, lane <= 0 ? G.laneY[0] - DRILL.plateH : lane === 1 ? G.laneY[1] - DRILL.cabH : G.laneY[2] - 40, lane <= 0 ? G.laneY[0] : lane === 1 ? G.laneY[1] : G.laneY[2]], d, rev ? 'THE REVERSE RAM' : 'THE GREAT DRILL', { key: 'rear' + S.n.contact + ':' + S.n.reverse })) { S.contactCd = DRILL.contactCd; S.n.contact++; if (rev) S.n.revHits++; c.shove && c.shove(h, DRILL.shove); if (S.snag && S.snag.pp === h.pp) S.snag = null; } } }
  if (S.ward > 0) { S.ward -= dt; if (S.ward <= 0) S.ward = 0; }
  /* JAMMED: it stands its ground and drifts back to you (B4: no move) */
  if (drillOpen(e)) { e.open -= dt; S.R = Math.max(DRILL.minR + 20, S.R - DRILL.drift * dt);
    if (e.open <= 0) { e.open = 0; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.4; S.ward = DRILL.wardT; S.n.warded++; c.sound && c.sound('ward');
      c.number(rearX(S), G.laneY[2] - 34, S.told.ward ? 'ITS PLATES ARE UP' : 'IT CLEARS ITS GEARS: ITS PLATES ARE UP', '#c8d8e8'); S.told.ward = 1; } return; }
  /* THE PHASES */
  const k = e.hp / e.maxHp;
  if (e.mode !== 'phase' && e.mode !== 'reverse' && ((S.ph === 1 && k <= DRILL.phase2) || (S.ph === 2 && k <= DRILL.phase3))) {
    S.ph++; e.phase = S.ph; e.mode = 'phase'; S.mT = DRILL.phaseT; S.i = 0; S.lunge = null; S.hook = null; S.cutPend = null; S.clawPend = null; armGears(S); c.music && c.music(S.ph); c.shake && c.shake(5); c.sound && c.sound('phase');
    if (S.ph === 3) { S.highDown = true; c.arena && c.arena('highDown'); c.sound && c.sound('rock'); }
    c.number(rearX(S), G.laneY[2] - 34, S.ph === 2 ? 'IT SPINS UP: DUCK ITS HEAD, CUT ITS CHAIN' : 'THE ROOF TAKES THE HIGH LINE: TWO LINES LEFT', S.ph === 2 ? '#ffb070' : '#ff6b6b'); return; }
  if (e.mode === 'phase') { S.mT -= dt; if (S.mT <= 0) { e.mode = 'idle'; S.cd = 0.9; } return; }
  if (e.mode !== 'reverse' && !S.chute) { const d = DRILL.homeR - S.R; S.R += Math.sign(d) * Math.min(Math.abs(d), DRILL.revBack * dt); }
  const near = live.slice().sort((a, b) => b.x - a.x)[0];
  S.mT = (S.mT || 0) - dt;
  switch (e.mode) {
    case 'idle': { S.cd -= dt; if (S.cd > 0 || !near || S.lever || S.snag) break;   /* (one thing at a time: no move while its points lever is out, or while it has you on its chain) */
      const ch = DRILL.chain[S.ph]; let name = 'reverse';   /* (deeprails4) a move whose gear is broken is GONE for the phase: the next one comes instead (the reverse ram is the drive itself - never gone) */
      for (let k = 0; k < ch.length; k++) { const m = ch[S.i % ch.length]; S.i++; const gg = moveGear(m); if (!gg || gearUp(S, gg.id)) { name = m; break; } }
      { const gg = moveGear(name); if (gg && S.gears[gg.id]) S.gears[gg.id].hot = 1.3; }   /* B16: its gear SPINS UP through the windup (drawn) */
      const ls = lanesOf(S), hl = Math.min(ls[ls.length - 1], near.lane >= 0 ? near.lane : laneUnder(G, near.y));
      if (name === 'rocks') { const clear = ls.length === 2 ? ls.find(l => l !== hl) : ls.filter(l => l !== hl)[S.n.rocks % 2]; S.n.rocks++;
        S.rocks = ls.filter(l => l !== clear).map((lane, j) => ({ lane, x: Math.min(rearX(S) - 20, near.x + DRILL.cruise * DRILL.rockTell + (j ? 18 : 0)), t: DRILL.rockTell, id: S.n.rocks * 3 + j }));
        e.mode = 'rockTell'; S.mT = DRILL.rockTell; c.sound && c.sound('tell'); if (!S.told.rocks) { S.told.rocks = 1; c.number(rearX(S) - 40, G.laneY[2] - 40, 'IT CRACKS THE ROOF: OFF THE SHADOWS', '#ffb070'); } }
      else if (name === 'reverse') { e.mode = 'revTell'; S.mT = S.ph === 3 ? DRILL.revTell * 0.85 : DRILL.revTell; S.n.reverse++; c.sound && c.sound('klaxon');
        c.number(rearX(S) - 30, G.laneY[2] - 40, S.told.rev ? '!! REVERSE' : S.highDown ? '!! IT BACKS AT YOU: BRAKE' : '!! IT BACKS AT YOU: BRAKE, OR JUMP UP', '#ff6b6b'); S.told.rev = 1; }
      else if (name === 'dynamite') { e.mode = 'dynTell'; S.mT = DRILL.dynTell; S.n.dynamite++; c.sound && c.sound('tellHard');
        const two = S.ph >= 2 && ls.length > 1, lanes = two ? [hl, ls.filter(l => l !== hl)[S.n.dynamite % (ls.length - 1)]] : [hl];
        S.dynPend = lanes.map((lane, j) => ({ lane, x: near.x + DRILL.cruise * DRILL.dynFuse + (j ? 40 : 0), t: DRILL.dynFuse, fly: DRILL.dynTell, id: S.n.dynamite * 3 + j, x0: rearX(S) + DRILL.cabIn + 10 }));
        c.number(rearX(S) - 40, G.laneY[2] - 44, S.told.dyn ? '!! DYNAMITE' : '!! DYNAMITE: OFF ITS LINE, OR BRAKE', '#ff6b6b'); S.told.dyn = 1; }
      else if (name === 'lunge') { e.mode = 'lunge'; S.n.lunge++; S.lunge = { lane: hl, t: DRILL.lungeTell, on: false }; c.sound && c.sound('whine');
        c.number(rearX(S) - 40, G.laneY[hl] - 44, S.told.lunge ? '!! DUCK' : '!! IT SPINS UP: DUCK IN YOUR TUB', '#ff6b6b'); S.told.lunge = 1; }
      else if (name === 'chain') { e.mode = 'chain'; S.n.chain++; S.hook = { lane: hl, t: DRILL.chainTell, flying: false }; c.sound && c.sound('tellHard');
        c.number(rearX(S) - 40, G.laneY[hl] - 44, S.told.chain ? '!! THE HOOK' : '!! THE HOOK: JUMP, OR CHANGE LINE', '#ff6b6b'); S.told.chain = 1; }
      else if (name === 'collapse') { e.mode = 'collapseTell'; S.mT = DRILL.collapseTell; S.n.collapse++; c.sound && c.sound('rumble');
        S.spots = [0, DRILL.collapseApart].map((dx, j) => ({ x: near.x + DRILL.cruise * DRILL.collapseTell + dx, t: DRILL.collapseTell, id: S.n.collapse * 3 + j }));
        c.number(rearX(S) - 40, G.laneY[1] - 50, S.told.collapse ? '!! THE ROOF' : '!! THE ROOF COMES DOWN: PUMP THROUGH, OR BRAKE', '#ff6b6b'); S.told.collapse = 1; }
      else if (name === 'cutter') { e.mode = 'cutterTell'; S.mT = DRILL.cutterTell; S.n.cutter++; S.cutPend = { lane: hl }; c.sound && c.sound('whine');   /* (deeprails5) its boom lifts a spare cutter disc: told on your line */
        c.number(rearX(S) - 40, G.laneY[hl] - 44, S.told.cutter ? '!! CUTTER' : '!! A CUTTER: STRIKE IT BACK, OR JUMP', '#ff6b6b'); S.told.cutter = 1; }
      else if (name === 'claw') { e.mode = 'clawTell'; S.mT = DRILL.clawTell; S.n.claw++; S.clawPend = { lane: hl, x: rearX(S) - 8 - DRILL.clawW }; c.sound && c.sound('chain');   /* (deeprails5) the claw drops behind it on your line: the stretch it will rip is marked */
        c.number(rearX(S) - 40, G.laneY[hl] - 44, S.told.claw ? '!! THE CLAW' : '!! THE CLAW: PUMP AND JUMP, OR CHANGE LINE', '#ff6b6b'); S.told.claw = 1; }
      break; }
    case 'cutterTell': if (S.mT <= 0) { if (S.cutPend) { const x0 = rearX(S) - 12, hx = live.length ? Math.max(...live.filter(h => h.lane === S.cutPend.lane || h.lane < 0).map(h => h.x).concat([heroX])) : heroX;
        S.cutters.push({ x: x0, x0, tx: Math.max(G.x0 + 24, Math.min(x0 - 20, hx + DRILL.cutterLead)), fly: DRILL.cutterFly, lane: S.cutPend.lane, id: S.n.cutter, back: false }); } S.cutPend = null; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.3; c.sound && c.sound('lunge'); } break;
    case 'clawTell': if (S.clawPend) S.clawPend.x = rearX(S) - 8 - DRILL.clawW;   /* (the marked stretch is the rail just behind it, where the claw bites: off it - or off the line - before it rips) */
      if (S.mT <= 0) { if (S.clawPend) S.tears.push({ x: S.clawPend.x, lane: S.clawPend.lane, id: S.n.claw }); S.clawPend = null; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1] + 0.3; c.sound && c.sound('rock'); c.shake && c.shake(3); } break;
    case 'rockTell': case 'collapseTell': if (S.mT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } break;
    case 'dynTell': if (S.mT <= 0) { for (const d of S.dynPend || []) { d.fly = 0; S.dyn.push(d); } S.dynPend = null; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; c.sound && c.sound('throw'); } break;
    case 'revTell': if (S.mT <= 0) { e.mode = 'reverse'; S.mT = DRILL.revT; S.revV = DRILL.revV; c.sound && c.sound('reverse'); c.shake && c.shake(4); } break;
    case 'reverse': if (S.revV > 0) { S.R = Math.max(DRILL.minR, S.R - S.revV * dt); if (S.mT <= 0) { S.revV = 0; S.mT = DRILL.revHold; } }
      else if (S.mT <= 0) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } break;
    case 'lunge': if (!S.lunge) e.mode = 'idle'; break;
    case 'chain': if (!S.hook) e.mode = 'idle'; break;
    default: e.mode = 'idle';
  }
}
/* A HERO'S BLOW ON IT (the cab): what comes off the bar (and the word in out.word). Armoured x0.4 (B15: never totally invulnerable), jammed x2 capped a share a jam */
export function takeBlow(e, S, dmg, out = {}) {
  if (S.pass > 0) { const p = S.pass; S.pass = 0; S.n.gave += p; out.word = 'THE DRIVE GIVES'; return p; }   /* (deeprails4) the HELD blows, landing as the gate opens */
  if (e.mode === 'sleep' || e.mode === 'wake') { out.word = 'ARMOURED'; return Math.round(dmg * DRILL.armour); }
  S.n.cab++; let d;
  if (drillOpen(e)) { const cap = Math.max(0, e.maxHp * (S.openKind === 'gear' ? DRILL.gearStallCap : DRILL.jamCap) - S.openTaken); d = Math.min(dmg * DRILL.jamMul, cap); S.openTaken += d; out.cap = 'jam';
    if (cap - d <= 0.01 && e.open > 0.3) { e.open = 0.3; out.word = 'IT FREES ITS GEARS'; } }
  else { S.n.armoured++; if (S.ward > 0) S.n.warded++; S.wordI = (S.wordI || 0) + 1;
    out.word = S.ward > 0 ? 'PLATES UP' : Object.values(S.gears || {}).some(q => !q.broken) && S.wordI % 2 ? 'ARMOURED: HIT THE GEARS' : 'ARMOURED: THROW ITS POINTS'; d = dmg * DRILL.armour; }
  return d;
}
/* (deeprails4) THE GEARS HOLD IT: what LANDS (src/main.js, last before the bar - after every multiplier and finisher), past a shut phase line, is HELD (B15: not nothing -
   it lands when the gate opens, up to heldCap of it); out.word names the gears */
export function gateBlow(e, S, d, out = {}) { const fl = gateFloor(S, e); if (!(d > 0) || e.hp < fl || e.hp - d >= fl) return d;
  const keep = Math.max(0, e.hp - fl), over = d - keep; S.held = Math.min(e.maxHp * DRILL.heldCap, S.held + over); S.n.held += over; out.word = 'ITS GEARS HOLD IT: HIT THE GEARS'; return keep; }
/* (deeprails4) A BLOW ON A GEAR BANK: whole (a gear has no armour). Broken: its attack is gone for the phase (a windup of it cancelled), the rig STALLS (an opening, unless it is
   already open, warded or changing phase) and, if that opens the gate, the held blows are passed (out.release: the hands land them through the game's own hurt) */
export function hitGear(e, S, id, dmg, c, out = {}) { const q = S.gears && S.gears[id], g = GEARS.find(k => k.id === id); if (!q || !g) return 0; if (q.broken) { out.word = 'BROKEN'; return 0; }
  const shut0 = gateShut(S), d = Math.min(q.hp, Math.max(0, dmg)); q.hp -= d; q.flash = 0.15; S.n.gearBlows++; S.n.gearDmg += d;
  if (q.hp <= 0.001) { q.hp = 0; q.broken = true; q.smoke = 0; q.hot = 0; S.n.gears++; out.broke = true;
    if (g.moves.includes('lunge') && S.lunge) { S.lunge = null; if (e.mode === 'lunge') { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } }
    if (g.moves.includes('chain')) { if (S.hook) { S.hook = null; if (e.mode === 'chain') { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; } } S.snag = null; }
    if (g.moves.includes('dynamite') && e.mode === 'dynTell') { S.dynPend = null; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; }
    if ((g.moves.includes('cutter') && e.mode === 'cutterTell') || (g.moves.includes('claw') && e.mode === 'clawTell')) { S.cutPend = null; S.clawPend = null; e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; }   /* (deeprails5; what is already rolling rolls) */
    if ((g.moves.includes('rocks') && e.mode === 'rockTell') || (g.moves.includes('collapse') && e.mode === 'collapseTell')) { e.mode = 'idle'; S.cd = DRILL.gap[S.ph - 1]; }   /* (what is already falling falls) */
    c.sound && c.sound('gearBreak'); c.shake && c.shake(5);
    const bw = g.name + ' BROKEN: ' + g.word; c.number(rearX(S) - 30, S.G.laneY[g.lane] + g.t - 14, bw, '#8fd160');
    if (!drillOpen(e) && S.ward <= 0 && e.mode !== 'phase' && e.mode !== 'sleep' && e.mode !== 'wake') beginJam(e, S, c, 'gear');
    if (shut0 && !gateShut(S)) { if (S.held > 0) { S.pass = Math.round(S.held); S.held = 0; out.release = S.pass; } c.number(rearX(S) - 30, S.G.laneY[2] - 54, S.ph === 3 ? 'ITS GEARS GIVE: FINISH IT' : 'ITS GEARS GIVE: THE DRIVE IS OPEN', '#ffd36b'); } }
  return d; }

/* a snag ends: a jump off the line, or the chain cut (src/great-drill-hands.js) */
export function freeSnag(S, how) { if (!S.snag) return false; S.snag = null; if (how === 'cut') S.n.cuts++; return true; }
/* (deeprails5) THE SPARE CUTTER's box on its line; a blow (box { l, r, t, b }) that lands on a rolling one STRIKES IT BACK up the line into its gears - true when it took */
export const cutterBox = (G, cu) => ({ l: cu.x - DRILL.cutterR - 3, r: cu.x + DRILL.cutterR + 3, t: G.laneY[cu.lane] - DRILL.cutterH - 4, b: G.laneY[cu.lane] + 2 });
export function strikeCutter(S, hb) { let any = false; for (const cu of S.cutters) { if (cu.back || cu.dead || cu.fly > 0) continue; const b = cutterBox(S.G, cu); if (hb.r > b.l && hb.l < b.r && hb.b > b.t && hb.t < b.b) { cu.back = true; S.n.cutBacks++; any = true; } } return any; }

/* ---------- THE BOT (src/lab.js): what a player sees, read a quarter-second late (react 0.25 s, a tell misread one time in eight) ----------
   P: { x, y, ground, face, atk, vy, lane, v, snagged }; returns { gx (where to hold, arena px), jump, drop (down + jump), duck, talk (E), atk, boost, face, why } */
export const DRILL_PLAN = { react: 0.25, miss: 0.13, missRam: 0.15, missLever: 0.12, missCut: 0.3, gearOrder: ['dyn', 'chain', 'roof', 'lunge'] };   /* (deeprails5) missCut: the share of its spare cutters a player swings at too late (then he jumps it) */   /* (deeprails4) the gear a player goes for first: the nearest line's, then this order */
/* (deeprails4) the bank a bot goes for: up and in this phase - on its own line first */
function pickGear(S, lane, P) { const up = GEARS.filter(g => gearUp(S, g.id)); if (!up.length) return null; const mine = up.find(g => !g.jump && gearStand(S, g).lane === lane && !gearStand(S, g).jump);
  return mine || DRILL_PLAN.gearOrder.map(id => up.find(g => g.id === id)).find(Boolean); }
export function drillPlan({ P, e, S, reach, rng = Math.random, mem = {}, t, tip = 0, eyes = false }) {
  const G = S.G, out = { gx: null, face: 1, why: '' }, lane = P.lane >= 0 ? P.lane : Math.min(lanesOf(S).length - 1, laneUnder(G, P.y)), LS = lanesOf(S);
  /* (claude/flasklever) eyes: the lab's perception layer already shows HIS MODE late - but a rock, a stick of dynamite, a hook, a roof spot, a lever and an ore are not his mode: they were seen on the frame they came (the Foreman's perfect-eyes bypass). Only his reverse is a mode. */
  const late = k => { if (eyes && k.startsWith('rev')) return true; if (!(k in mem)) { mem[k] = t + DRILL_PLAN.react - 0.04 + rng() * 0.1; mem['m' + k] = rng() < DRILL_PLAN.miss; } return t >= mem[k] && !mem['m' + k]; };
  let gb = null;
  const cab = cabBox(G, S), R0 = rearX(S), standX = cab.l - (tip ? tip + 4 : Math.max(10, reach - 8));
  const go = l => { if (l > lane && P.ground) out.jump = true; else if (l < lane && P.ground) { if (P.x + 14 > frontFor(G, S, l)) out.backTo = frontFor(G, S, l) - 30; else out.drop = true; } };
  /* snagged: jump off the line (a player's first answer) */
  if (P.snagged) { out.jump = P.ground; out.gx = P.x - 40; out.why = 'snagged: jump'; return out; }
  const danger = new Set();
  for (const r of S.rocks) if (r.t > 0 && Math.abs(r.x - DRILL.cruise * r.t - P.x) < DRILL.rockW + 6 && late('rock' + r.id)) danger.add(r.lane);
  for (const d of S.dyn) if (d.t > 0 && Math.abs(d.x - DRILL.cruise * d.t - P.x) < DRILL.dynR + 10 && late('dyn' + d.id)) danger.add(d.lane);
  for (const d of S.dynPend || []) if (late('dyn' + d.id)) danger.add(d.lane);
  if (S.hook && !S.hook.flying && late('hook' + S.n.chain)) danger.add(S.hook.lane);
  const lungeOn = S.lunge && S.lunge.lane === lane && late('lunge' + S.n.lunge);
  /* (deeprails5) THE RAIL CLAW: its marked stretch and a torn one coming at me are a danger on their line; THE SPARE CUTTER on my line is struck back (or jumped) */
  if (S.clawPend && late('claw' + S.n.claw)) danger.add(S.clawPend.lane);
  const tear = S.tears.find(tr => tr.lane === lane && tr.x + DRILL.clawW > P.x - 14 && tr.x < P.x + 190 && late('tear' + tr.id));
  for (const tr of S.tears) if (tr.x + DRILL.clawW > P.x - 14 && tr.x < P.x + 190 && late('tear' + tr.id)) danger.add(tr.lane);
  const cut = S.cutters.find(cu => !cu.back && !(cu.fly > 0) && cu.lane === lane && cu.x > P.x - 6 && cu.x - P.x < 120 && late('cut' + cu.id));
  const spot = S.spots.find(sp => sp.t > 0 && Math.abs(sp.x - DRILL.cruise * sp.t - P.x) < DRILL.collapseW / 2 + 12 && late('roof' + sp.id));
  const revOn = (e.mode === 'revTell' || (e.mode === 'reverse' && S.revV > 0)) && late('rev' + S.n.reverse);
  const safe = [lane, 1, 2, 0].filter(l => LS.includes(l)).find(l => !danger.has(l));
  /* 1. THE REVERSE: out of its sweep */
  if (revOn) { const sweep = DRILL.revV * DRILL.revT + 26, need = P.x - (frontFor(G, S, lane) - sweep - 24), have = (e.mode === 'revTell' ? Math.max(0, S.mT || 0) + DRILL.revT : Math.max(0, S.mT || 0)) * 100;
    if (lane === 2 || (need > have && LS.includes(2) && !danger.has(2))) { if (lane !== 2) go(2); out.gx = Math.min(P.x, frontFor(G, S, 2) - sweep - 10); out.why = 'reverse: up high'; }
    else { out.gx = Math.max(G.x0 + 14, frontFor(G, S, lane) - sweep - 30); out.why = 'reverse: brake'; } }
  /* 2. THE OPENING: to the cab (MID line), and strike */
  else if (drillOpen(e) && !(gateShut(S) && e.hp <= gateFloor(S, e) + 1 && pickGear(S, lane, P))) { const want = 1;   /* (deeprails5, the bot fix: its gears hold it at the line - a blow on the cab is only held, so a jam is the time to break a bank) */ if (lane !== want) { if (lane === 2 && P.x > cab.l - 16) out.gx = cab.l - 26; else go(want); } out.gx = standX; if (Math.abs(P.x - standX) < 12 && lane >= 1 && P.atk < 0) out.atk = true; out.why = 'jammed: cab'; }
  /* 3. ITS POINTS LEVER coming down the tunnel: meet it, and E as it passes (any line) */
  else if (S.lever && !S.lever.thrown && late('lever' + S.lever.id) && !(gateShut(S) && e.hp <= gateFloor(S, e) + 1)) {   /* (deeprails5: at a shut line its points buy nothing - the gears first) */ const lv = S.lever; out.gx = Math.min(P.x + 10, lv.x - 4); out.why = 'lever';
    if (Math.abs(lv.x - P.x) < DRILL.leverReach - 4 && !(mem['ml' + lv.id] ??= rng() < DRILL_PLAN.missLever)) { out.talk = true; out.why = 'lever: throw'; } }
  /* 4. AN ORE CART (the lever missed): down to the LOW line behind it, and PUMP into it */
  else if ((S.chute || S.ores.some(o => !o.fly && o.x > P.x - 8)) && S.ward <= 0 && late('ore' + S.oreN) && !(gateShut(S) && e.hp <= gateFloor(S, e) + 1)) { const o = S.ores.find(q => !q.fly);
    if (lane !== 0) go(0); out.why = 'ore: ram';
    if (o) { if (!(mem['mr' + S.oreN] ??= rng() < DRILL_PLAN.missRam)) { out.gx = o.x + 40; out.boost = true; } else out.gx = o.x - 30; }
    else out.gx = Math.min(P.x, R0 - 40); }
  /* 4b. (deeprails4) THE GEARS: while the gate is shut (its gears hold it), break a bank - the one on my line first, else the order; stand back from the rear face on the
     bank's line (a jump bank: under it, and strike rising) */
  else if (gateShut(S) && e.mode !== 'phase' && (gb = pickGear(S, lane, P))) { const g = gb, st = gearStand(S, g), bx = gearBoxOf(G, S, g), gx = bx.l - Math.max(8, Math.min(reach, 30)) + 10;
    out.why = 'gear ' + g.id; out.gx = gx;
    if (lane !== st.lane && P.ground) { if (st.lane < lane && P.x + 14 > frontFor(G, S, st.lane)) out.gx = Math.min(gx, frontFor(G, S, st.lane) - 30); else go(st.lane); }
    else if (Math.abs(P.x - gx) < 10) { if (st.jump) { if (P.ground && lane === st.lane) out.jump = true; else if (!P.ground && P.y < G.laneY[st.lane] - (g.lane === 2 ? 30 : 8) && P.atk < 0) out.atk = true; }
      else if (P.atk < 0 && (mem.atkT ?? -9) < t - 0.3) { mem.atkT = t; out.atk = true; } } }
  /* 5. OTHERWISE: work the cab from the MID line between its moves (x0.4 is still damage), or wait off its sweep while its plates are up */
  else { const busy = e.mode === 'revTell' || e.mode === 'reverse' || lungeOn;
    out.gx = standX; if (lane !== 1 && LS.includes(1)) { if (lane === 2 && P.x > cab.l - 16) out.gx = cab.l - 26; else go(1); } if (Math.abs(P.x - standX) < 12 && lane >= 1 && !busy && P.atk < 0 && (mem.atkT ?? -9) < t - 0.35) { mem.atkT = t; out.atk = true; } out.why = 'cab'; }
  if (danger.has(lane) && safe !== undefined && safe !== lane) { out.jump = false; out.drop = false; go(safe); out.why += ' +dodge'; }
  else if (danger.has(lane)) { out.gx = Math.min(out.gx ?? P.x, P.x - 60); out.why += ' +brake'; }
  if (tear && (safe === undefined || safe === lane) && P.ground) { out.boost = true; out.gx = null; if (tear.x - P.x < 22) out.jump = true; out.why += ' +torn rail: pump, jump'; }   /* (deeprails5) no other line: pump and jump it */
  if (cut) { const gap = cut.x - P.x, sw = mem['mc' + cut.id] ??= rng() < DRILL_PLAN.missCut; if (!sw && gap < Math.min(reach, 34) + 26 && gap > 2 && P.atk < 0) {   /* (the swing started a beat before it arrives: it rolls in at cutterV) */ out.atk = true; out.face = 1; out.why += ' +cutter: strike it back'; } else if (sw && gap < 30 && P.ground) { out.jump = true; out.drop = false; out.why += ' +cutter: jump'; } }
  if (spot) { out.gx = Math.min(out.gx ?? P.x, P.x - 70); out.why += ' +roof: brake'; }
  if (lungeOn) { out.duck = true; out.jump = false; out.drop = false; out.atk = false; out.why += ' +duck'; }
  if (out.backTo !== undefined && !out.drop) out.gx = Math.min(out.gx ?? P.x, out.backTo);
  if (out.gx !== null) out.gx = Math.min(out.gx, frontFor(G, S, lane) - 10);
  return out;
}
