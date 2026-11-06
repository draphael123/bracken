// src/skyhook.js - SKYHOOK, MASTER OF THE HEAD STATION (claude/skyhook, 11-05; zipclimb-plan.md 5 as amended by Daniel: a HUMAN rigger, 2 phases, the line kit).
// The line crews' captain. THE HIGH LINES end at THE CAVE MOUTH, the ropeway's head station where the Ore Road runs into the mountain: the castle's supply
// line. Skyhook guards it. He works his own HIGH LINE across the station on a crank trolley, stands on the two galleries it runs between, and fights with a
// long iron boat-hook on a chain (phase two: a rigger's cutter too). NOT a goblin (Daniel's standing note; the Hookjacks are his crew).
// This file is the fight, PURE (his moves, his two phases, what a blow does to him, the bot's plan); src/skyhook-hands.js binds it to the world (main.js,
// the line kit's lines through src/highlines-hands.js) and draws him (greybox). tools/skyhook.mjs is its check.
// HEADER (design-standard B1 / B3 / B5 / B10 / B15 / B16):
//   NEVER INVULNERABLE (B15): every blow or shot lands - x0.5 on him anywhere outside an opening (his rigger's coat; told: a clank and the word), x0.4 in his
//     ward. Ranged heroes chip him on the line; melee heroes chip him on a gallery (climb a winch line), on the floor after a drop, and as he swings by.
//   THE LEVEL'S VERB IS HIS OPENING (B1): the station's HIGH LINE is held taut by two TENSION LEVERS on the floor, one under each gallery. While he RIDES it
//     out over the MIDDLE third of the station (told: he hooks his trolley on, the levers glow amber; over the middle they blink gold), strike a lever - any
//     blow, any shot - and THE LINE SLIPS: he falls onto the rock DOWN (the shared
//     OPEN read, B10: a gold ring and a timer bar) - the slack end swings him down beside the lever that slipped it - blows x2 up to a purse (SH.downed.cap of him), then he gets up (a told white ring) into a ward (B3).
//     The line is strung again in SH.slip.restring s. Struck while he is not on the line, a lever only clanks.
//   A SECOND, SMALLER OPENING: THE DROP. From his line he drops on a hero below (a red ring that follows, then SETS). Step out of the ring and he lands on
//     nothing: JARRED (x1.5, a short purse) - the melee heroes' answer as much as the lever is.
//   2 PHASES, one new thing in the second (B5), every move TOLD with its own windup and release pose (B16) and its own sound:
//     P1 (100-50%)  THE RIDE (the opening's carrier), THE HOOK (thrown on its chain at a hero: yellow, a shield turns it; it pulls you in and off a line),
//                   THE DROP (red ring under his line; jump/step out) -> on the floor THE SWEEP (the hook swung low round him, red: JUMP it), THE SHOVE (a hero
//                   on his gallery: the hook's butt, yellow - off you go). Riding, he hooks at whoever waits by a lever (yellow: the lever is read, not camped).
//     P2 (50-0%)    HE DRAWS HIS CUTTER (told, warded): HE CUTS YOUR LINE (a hero hauling up a winch to his gallery: a red !! and a fray bar, 1.4 s - top out,
//                   kick off or drop), THE LOW SWING (he swings across the station on the hanging rope, the arc drawn red: jump him at its low point, roll
//                   through, or stand near a wall where the arc is high); his rides, drops and hooks come quicker.
//   FAIR: no move without a tell; never two blows of his inside one tell of another (one move at a time); a cut line drops you onto the station floor (no hp).
//   CO-OP: every seat is a target (the nearest, standing); a lever is anyone's; a downing's purse is shared; his blows are keyed once a hero a move.
export const SH = {
  hp: 1500, w: 18, h: 32, markH: 44, hang: 40,                      // hang: from his line to his feet while he rides it (px)
  chip: 0.5, wardMul: 0.4, p2: 0.5,                                 // B15: x0.5 outside openings (>= 0.4), x0.4 warded
  rest: [0.9, 0.7],                                                 // on a gallery between moves
  ride: { tell: [0.6, 0.5], v: [140, 175], trolley: 16, dmg: 7 },  // trolley: a rider on his line this close is knocked off (told by the ride's tell)
  hook: { tell: [0.75, 0.65], lock: 0.25, v: 420, r: 10, dmg: 8, pull: 200, life: 1.2, range: 300 },
  drop: { tell: [0.95, 0.85], track: 0.4,  trackV: 200, fall: 0.3, r: 24, dmg: 14, kick: -260, chance: [0.55, 0.7], land: [1.0, 0.8] },
  jarred: { t: [1.2, 1.0], mul: 1.5, cap: 0.08 },
  sweep: { tell: [0.75, 0.65], t: 0.25, reach: 80, h: 14, dmg: 10, chance: [0.4, 0.5] },
  climb: { tell: 0.3, t: 0.6 },
  slip: { fall: 0.45, restring: 5, span: 1 / 3, land: 44 },        // land: he comes down this far from the lever that slipped the line (on the middle side): the striker is beside him                  // span: the share of the line, round its middle, over which a lever slips him
  downed: { t: [3.6, 3.0], mul: 2.0, cap: 0.2 },
  rise: { tell: 0.6, r: 40, dmg: 6, push: 180, ward: 2.5 },
  shove: { tell: 0.6, t: 0.2, reach: 34, dmg: 8, push: 200, range: 44 },
  cut: { tell: 1.4, restring: 6 },
  swing: { tell: 0.9, t: 1.1, low: 6, dmg: 12, push: 220, every: 3 },
  phase: { tell: 1.4 },
  leverHook: { tell: [0.7, 0.6], range: 64 },                      // riding, a hook at whoever waits by a lever (both phases: the lever is read, not camped)
};
export const SKY_SAY = { wake: 'SKYHOOK', rule: 'STRIKE A LEVER AS HE RIDES OVER THE MIDDLE', notYet: 'WAIT TILL HE IS OVER THE MIDDLE', slip: 'THE LINE SLIPS', downed: 'DOWN ON THE ROCK', jarred: 'JARRED',
  p2: 'HE DRAWS HIS CUTTER', cut: 'HE CUTS YOUR LINE', swing: 'HE SWINGS LOW', ward: 'HE SHRUGS IT OFF', offLine: 'HE IS NOT ON THE LINE', hooked: 'HOOKED', rise: 'HE GETS UP',
  guard: 'RIGGER\'S COAT' };
export const OPEN_NAME = { downed: 'DOWN', jarred: 'JARRED' };
export const skyOpen = e => !!e && (e.mode === 'downed' || e.mode === 'jarred');
const TELLS = new Set(['rideTell', 'hookTell', 'dropTell', 'sweepTell', 'cutTell', 'swingTell', 'shoveTell', 'rise', 'climbTell', 'phaseTell']);
export const skyTelling = e => TELLS.has(e.mode);
/* ON THE LINE: the modes in which his trolley hangs from the high line (a lever slips it) */
export const ON_LINE = new Set(['ride', 'dropTell']);
export const skyOnLine = e => !!e && ON_LINE.has(e.mode);
/* SLIPPABLE: on the line AND out over the middle span (the levers blink gold) - a lever slips him only then */
export const skySlippable = (e, S) => skyOnLine(e) && Math.abs(e.x - S.G.mid) <= (S.G.end.E - S.G.end.W) * SH.slip.span / 2;
/* THE MOVES' POSES: every told move a windup and a release that differ (B16) - src/skyhook-hands.js draws them */
export const MOVES = [['rideTell', 'ride'], ['hookTell', 'hook'], ['dropTell', 'drop'], ['sweepTell', 'sweep'], ['cutTell', 'cut'], ['swingTell', 'swing'], ['shoveTell', 'shove'], ['rise', 'climb'], ['phaseTell', 'perch']];

/* THE STATION (px): A = the arena (src/highlines.js builds it): x0/x1 the floor inside the walls, floor, perchW/E { x, y } where he stands on a gallery,
   line { id, xa, ya, xb, yb } the high line's rope ends (xa < xb), levers [{ id, x }], winch { W, E } the winch line that tops out at each gallery, swingY */
export function geom(A) {
  const L = A.line, slope = (L.yb - L.ya) / (L.xb - L.xa);
  return { x0: A.x0, x1: A.x1, floorY: A.floor, mid: (A.x0 + A.x1) / 2, perch: { W: { ...A.perchW }, E: { ...A.perchE } }, line: { ...L },
    ropeY: x => L.ya + slope * (Math.max(L.xa, Math.min(L.xb, x)) - L.xa), end: { W: L.xa + 8, E: L.xb - 8 },
    levers: A.levers.map(l => ({ ...l })), winch: { ...A.winch }, swingY: A.swingY ?? A.floor - 240 };
}
export function newFight(G) {
  return { G, ph: 1, ward: 0, act: 0, restT: 1, side: 'E', last: [], moves: 0, sinceRide: 0, sinceSwing: 0, dropsThisRide: 0, purse: null, hooks: [], leverHook: null,
    lineDown: 0, told: {}, n: { ride: 0, slip: 0, downed: 0, jarred: 0, hook: 0, hooked: 0, drop: 0, sweep: 0, shove: 0, cut: 0, swing: 0, leverHook: 0, clank: 0 } };
}
const other = s => (s === 'W' ? 'E' : 'W');
const near = (heroes, x, y) => { let b = null, bd = 1e9; for (const h of heroes) { if (!h.alive) continue; const d = Math.abs(h.x - x) + Math.abs(h.y - y) * 0.5; if (d < bd) { bd = d; b = h; } } return b; };
const onFloor = (G, h) => h.alive && !h.lk && h.y >= G.floorY - 2;
export function atPerch(e, S) { const p = S.G.perch[S.side]; e.x = p.x; e.y = p.y; }
export function hangAt(e, S, x) { e.x = x; e.y = S.G.ropeY(x) + SH.hang; }

/* ---------- ONE FRAME OF HIM. heroes: [{ x, y, ground, alive, lk (the kit line id he hangs on, or null), pp }]; w: the world (src/skyhook-hands.js world()):
   w.hit(box [l, r, t, b], dmg, name, { key, pull, push, up, yellow }) -> per hero, w.lineUp(id), w.cutLine(id, s), w.riders(id) -> heroes on it,
   w.number / sound / shake / mark / fx / music ---------- */
export function stepSky(e, S, dt, heroes, w) {
  const G = S.G, i = S.ph - 1;
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward; S.lineDown = Math.max(0, S.lineDown - dt);
  stepHooks(S, dt, heroes, w);
  /* P2: the hook at whoever waits by a lever, told at the ride's start - thrown from the line (if he leaves the line first, it never comes) */
  if (S.leverHook) { if (!skyOnLine(e)) S.leverHook = null; else { S.leverHook.t -= dt; if (S.leverHook.t <= 0) { const lh = S.leverHook; S.leverHook = null; throwHook(e, S, lh.tx, G.floorY - 8, lh.key, w); } } }
  if (e.mode === 'sleep') { atPerch(e, S); return; }
  e.modeT -= dt;
  const P = near(heroes, e.x, e.y), face = x => { e.face = Math.sign(x - e.x) || e.face; };
  switch (e.mode) {
    case 'wake': atPerch(e, S); if (P) face(P.x); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = 0.6; } return;
    case 'perch': {
      atPerch(e, S); if (P) face(P.x); S.restT -= dt;
      /* THE PHASE: at half, only from a gallery (never through an opening) */
      if (S.ph < 2 && e.hp <= e.maxHp * SH.p2) { S.ph = 2; e.phase = 2; S.ward = SH.phase.tell; e.mode = 'phaseTell'; e.modeT = SH.phase.tell; w.sound('cutter'); w.number(e.x, e.y - 60, SKY_SAY.p2, '#ff6b6b'); w.music(2); S.act++; return; }
      if (S.restT > 0 || !P) return;
      pick(e, S, heroes, w); return; }
    case 'phaseTell': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = 0.4; } return;
    /* THE RIDE: hooked on at his gallery (told: the levers glow), across the high line to the other gallery */
    case 'rideTell': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'ride'; e.rideTo = other(S.side); hangAt(e, S, G.end[S.side]); S.dropsThisRide = 0; S.n.ride++; e.hitKey = 'tr' + S.act; w.sound('ride');
        { const lv = G.levers.map(l => ({ l, h: near(heroes.filter(q => onFloor(G, q)), l.x, G.floorY) })).filter(o => o.h && Math.abs(o.h.x - o.l.x) < SH.leverHook.range)[0];
          if (lv) { S.leverHook = { t: SH.leverHook.tell[i], tx: lv.h.x, lever: lv.l.id, key: 'lh' + S.act }; S.n.leverHook++; w.sound('hookTell'); w.number(lv.l.x, G.floorY - 40, '!', '#ffd36b'); } } }
      return;
    case 'ride': {
      const to = G.end[e.rideTo], dir = Math.sign(to - e.x) || 1; e.face = dir;
      hangAt(e, S, e.x + dir * Math.min(Math.abs(to - e.x), SH.ride.v[i] * dt));
      w.hit([e.x - SH.ride.trolley, e.x + SH.ride.trolley, e.y - SH.h - SH.hang, e.y - SH.h + 4], SH.ride.dmg, 'trolley', { key: e.hitKey, ridersOnly: G.line.id });
      /* THE DROP: over a standing hero, once a ride at most */
      const below = heroes.find(h => onFloor(G, h) && Math.abs(h.x - e.x) < 10);
      if (below && S.dropsThisRide === 0 && Math.abs(e.x - to) > 24) { S.dropsThisRide = 1; if (Math.random() < SH.drop.chance[i]) { e.mode = 'dropTell'; e.modeT = SH.drop.tell[i]; e.locked = false; e.lockX = e.x; S.act++; S.leverHook = null;   /* one threat at a time: a drop calls off the lever hook */ S.n.drop++; w.mark('!!'); w.sound('dropTell'); return; } }
      if (Math.abs(e.x - to) < 1) { S.side = e.rideTo; e.mode = 'perch'; S.restT = SH.rest[i]; atPerch(e, S); w.sound('perch'); }
      return; }
    case 'dropTell': {   /* on the line over you: the ring follows, then SETS (red) */
      if (!e.locked) { if (P && onFloor(G, P)) { const d = P.x - e.x; hangAt(e, S, Math.max(G.end.W, Math.min(G.end.E, e.x + Math.sign(d) * Math.min(Math.abs(d), SH.drop.trackV * dt)))); } e.lockX = e.x;
        if (e.modeT <= SH.drop.tell[i] - SH.drop.track) { e.locked = true; w.sound('lock'); } }
      else hangAt(e, S, e.lockX);
      if (e.modeT <= 0) { e.mode = 'drop'; e.modeT = SH.drop.fall; e.vy0 = e.y; e.hitKey = 'dr' + S.act; w.sound('drop'); } return; }
    case 'drop': {
      const k = 1 - Math.max(0, e.modeT) / SH.drop.fall; e.x = e.lockX; e.y = e.vy0 + (G.floorY - e.vy0) * k * k;
      if (e.modeT <= 0) { e.y = G.floorY; w.shake(7); w.sound('slam'); w.fx('dust', e.x, G.floorY);
        const res = w.hit([e.x - SH.drop.r, e.x + SH.drop.r, G.floorY - 20, G.floorY + 2], SH.drop.dmg, 'drop', { key: e.hitKey, up: SH.drop.kick });
        if (!res || !res.some(r => r === 'hit' || r === 'blocked')) { e.mode = 'jarred'; e.modeT = SH.jarred.t[i]; e.openT0 = e.modeT; S.purse = e.maxHp * SH.jarred.cap; S.n.jarred++; w.number(e.x, G.floorY - 50, SKY_SAY.jarred, '#ffd36b'); w.fx('open', e.x, G.floorY); w.sound('jarred'); }
        else { e.mode = 'landed'; e.modeT = SH.drop.land[i]; } }
      return; }
    case 'landed': e.y = G.floorY; if (P) face(P.x);
      if (e.modeT <= 0) { if (P && onFloor(G, P) && Math.abs(P.x - e.x) < SH.sweep.reach + 20 && Math.random() < SH.sweep.chance[i]) { e.mode = 'sweepTell'; e.modeT = SH.sweep.tell[i]; S.act++; S.n.sweep++; w.mark('!!'); w.sound('sweepTell'); }
        else startClimb(e, S, w); }
      return;
    case 'jarred': e.y = G.floorY; if (e.modeT <= 0) startClimb(e, S, w); return;
    case 'sweepTell': e.y = G.floorY; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = SH.sweep.t; e.hitKey = 'sw' + S.act; w.sound('sweep'); } return;
    case 'sweep': e.y = G.floorY; w.hit([e.x - SH.sweep.reach, e.x + SH.sweep.reach, G.floorY - SH.sweep.h, G.floorY + 2], SH.sweep.dmg, 'sweep', { key: e.hitKey });
      if (e.modeT <= 0) startClimb(e, S, w); return;
    /* THE GRAPPLE: from the floor to the nearest gallery (a told throw of the grapple, then hauled up) */
    case 'climbTell': e.y = G.floorY; if (e.modeT <= 0) { e.mode = 'climb'; e.modeT = SH.climb.t; e.cx0 = e.x; e.cy0 = e.y; w.sound('grapple'); } return;
    case 'climb': { const p = G.perch[e.climbTo], k = 1 - Math.max(0, e.modeT) / SH.climb.t; e.x = e.cx0 + (p.x - e.cx0) * k; e.y = e.cy0 + (p.y - e.cy0) * k - Math.sin(k * Math.PI) * 18;
      if (e.modeT <= 0) { S.side = e.climbTo; e.mode = 'perch'; S.restT = SH.rest[i]; atPerch(e, S); } return; }
    /* THE LINE SLIPS: off the line onto the rock (src/skyhook.js leverStruck starts it) */
    case 'slip': { const k = 1 - Math.max(0, e.modeT) / SH.slip.fall; e.y = e.vy0 + (G.floorY - e.vy0) * k * k; e.x = e.sx0 + (e.sx1 - e.sx0) * k;   /* the slack end swings him down toward the lever that slipped it */
      if (e.modeT <= 0) { e.y = G.floorY; e.mode = 'downed'; e.modeT = SH.downed.t[i]; e.openT0 = e.modeT; S.purse = e.maxHp * SH.downed.cap; S.n.downed++; w.shake(9); w.sound('downed'); w.fx('open', e.x, G.floorY); w.number(e.x, G.floorY - 50, SKY_SAY.downed, '#ffd36b'); }
      return; }
    case 'downed': e.y = G.floorY; if (e.modeT <= 0) { e.mode = 'rise'; e.modeT = SH.rise.tell; e.hitKey = 'ri' + S.act; S.act++; w.sound('rise'); w.mark('!'); w.number(e.x, G.floorY - 50, SKY_SAY.rise, '#ff9a5c'); } return;
    case 'rise': e.y = G.floorY; if (e.modeT <= 0) { w.hit([e.x - SH.rise.r, e.x + SH.rise.r, G.floorY - 30, G.floorY + 2], SH.rise.dmg, 'rise', { key: e.hitKey, pushFrom: e.x, push: SH.rise.push, yellow: true });
        S.ward = SH.rise.ward; e.ward = S.ward; w.fx('ward', e.x, G.floorY); w.number(e.x, G.floorY - 62, SKY_SAY.ward, '#c8d8e8'); startClimb(e, S, w); }
      return;
    case 'hookTell': if (S.side) atPerch(e, S); if (e.modeT > SH.hook.lock && e.target) { e.aimX = e.target.x; e.aimY = e.target.y - 8; }
      if (e.modeT <= 0) { e.mode = 'hook'; e.modeT = 0.35; throwHook(e, S, e.aimX, e.aimY, 'hk' + S.act, w); } return;
    case 'hook': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SH.rest[i] * 0.6; } return;
    case 'shoveTell': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'shove'; e.modeT = SH.shove.t; e.hitKey = 'sv' + S.act; w.sound('shove'); } return;
    case 'shove': { atPerch(e, S); const f = e.face || 1, a = e.x + f * 4, b = e.x + f * SH.shove.reach;
      w.hit([Math.min(a, b), Math.max(a, b), e.y - 26, e.y + 2], SH.shove.dmg, 'shove', { key: e.hitKey, push: f * SH.shove.push, yellow: true });
      if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SH.rest[i] * 0.6; } return; }
    /* P2: HE CUTS YOUR LINE - the winch line that tops out at his gallery, while a hero hauls up it */
    case 'cutTell': { atPerch(e, S); const id = G.winch[S.side];
      if (!w.lineUp(id)) { e.mode = 'perch'; S.restT = 0.3; return; }
      if (e.modeT <= 0) { e.mode = 'cut'; e.modeT = 0.4; if (w.riders(id).length) { w.cutLine(id, SH.cut.restring); S.n.cut++; w.sound('cut'); w.number(e.x, e.y - 50, SKY_SAY.cut, '#ff6b6b'); } else w.sound('perch'); }
      return; }
    case 'cut': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'perch'; S.restT = SH.rest[i] * 0.6; } return;
    /* P2: THE LOW SWING - on the hanging rope from his gallery to the other one; the arc's low point skims the floor at the middle */
    case 'swingTell': atPerch(e, S); if (e.modeT <= 0) { e.mode = 'swing'; e.modeT = SH.swing.t; e.swFrom = S.side; e.swTo = other(S.side); e.hitKey = 'sg' + S.act; S.n.swing++; w.sound('swing'); } return;
    case 'swing': { const q = swingAt(S, e.swFrom, 1 - Math.max(0, e.modeT) / SH.swing.t); e.x = q.x; e.y = q.y; e.face = e.swTo === 'E' ? 1 : -1;
      w.hit([e.x - SH.w / 2, e.x + SH.w / 2, e.y - SH.h, e.y], SH.swing.dmg, 'swing', { key: e.hitKey, push: e.face * SH.swing.push });
      if (e.modeT <= 0) { S.side = e.swTo; e.mode = 'perch'; S.restT = SH.rest[i]; atPerch(e, S); } return; }
    default: e.mode = 'perch';
  }
}
/* THE SWING'S ARC: k 0..1 from one gallery to the other; a pendulum under the rope's anchor over the middle, feet SH.swing.low over the floor at the bottom */
export function swingAt(S, from, k) {
  const G = S.G, a = G.perch[from], b = G.perch[other(from)], x = a.x + (b.x - a.x) * k;
  const lowY = G.floorY - SH.swing.low, edgeY = Math.min(a.y, b.y), y = lowY - (lowY - edgeY) * Math.pow(Math.abs(2 * k - 1), 2);
  return { x, y };
}
function startClimb(e, S, w) {
  const G = S.G; e.climbTo = Math.abs(e.x - G.perch.W.x) <= Math.abs(e.x - G.perch.E.x) ? 'W' : 'E'; e.mode = 'climbTell'; e.modeT = SH.climb.tell; w.sound('grappleTell');
}
function throwHook(e, S, tx, ty, key, w) {
  const dx = tx - e.x, dy = ty - (e.y - 20), d = Math.hypot(dx, dy) || 1;
  S.hooks.push({ x: e.x, y: e.y - 20, vx: dx / d * SH.hook.v, vy: dy / d * SH.hook.v, t: 0, T: Math.min(SH.hook.life, d / SH.hook.v + 0.05), key, ox: e.x }); S.n.hook++; w.sound('hook');
}
function stepHooks(S, dt, heroes, w) {
  for (const h of S.hooks) { h.t += dt; h.x += h.vx * dt; h.y += h.vy * dt; if (h.t >= h.T) h.done = true;
    const res = w.hit([h.x - SH.hook.r, h.x + SH.hook.r, h.y - SH.hook.r, h.y + SH.hook.r], SH.hook.dmg, 'hook', { key: h.key, pullTo: h.ox, pull: SH.hook.pull, yellow: true });
    if (res && res.some(r => r === 'hit' || r === 'blocked' || r === 'parried')) { h.done = true; if (res.includes('hit')) S.n.hooked++; } }
  S.hooks = S.hooks.filter(h => !h.done);
}
/* WHICH MOVE, from a gallery. Never the same move three times running; a ride at least every third move (the opening comes round). */
function pick(e, S, heroes, w) {
  const G = S.G, i = S.ph - 1, last = S.last, twice = k => last.length >= 2 && last[0] === k && last[1] === k;
  const P = near(heroes, e.x, e.y), mine = G.winch[S.side];
  const onMine = S.ph > 1 && w.lineUp(mine) && w.riders(mine).length > 0;
  const besideMe = heroes.find(h => h.alive && !h.lk && Math.abs(h.y - e.y) < 6 && Math.abs(h.x - e.x) < SH.shove.range);
  const lineOk = w.lineUp(G.line.id) && S.lineDown <= 0;
  let k;
  if (onMine) k = 'cut';
  else if (besideMe) k = 'shove';
  else if (lineOk && (S.sinceRide >= 2 || Math.random() < 0.5)) k = 'ride';
  else k = P && Math.abs(P.x - e.x) < SH.hook.range ? 'hook' : lineOk ? 'ride' : 'hook';
  if ((k === 'ride' || k === 'hook') && S.ph > 1 && S.sinceSwing >= SH.swing.every - 1 && (S.sinceSwing >= SH.swing.every || Math.random() < 0.5)) k = 'swing';
  if (k === 'hook' && twice('hook') && lineOk) k = 'ride';
  if (k === 'ride' && twice('ride') && !(S.sinceRide >= 2)) k = 'hook';
  last.unshift(k); last.length = Math.min(last.length, 3); S.moves++; S.act++;
  if (k === 'ride') S.sinceRide = 0; else S.sinceRide++;
  if (k === 'swing') S.sinceSwing = 0; else S.sinceSwing++;
  switch (k) {
    case 'ride': e.mode = 'rideTell'; e.modeT = SH.ride.tell[i]; w.sound('rideTell'); break;   /* no mark: hooking on throws no blow (the levers glow: src/skyhook-hands.js) */
    case 'hook': e.mode = 'hookTell'; e.modeT = SH.hook.tell[i]; e.target = P; e.aimX = P ? P.x : e.x; e.aimY = P ? P.y - 8 : G.floorY - 8; w.mark('!'); w.sound('hookTell'); break;
    case 'shove': e.face = Math.sign(besideMe.x - e.x) || e.face; e.mode = 'shoveTell'; e.modeT = SH.shove.tell; S.n.shove++; w.mark('!'); w.sound('shoveTell'); break;
    case 'cut': e.mode = 'cutTell'; e.modeT = SH.cut.tell; w.mark('!!'); w.sound('cutTell'); break;
    case 'swing': e.mode = 'swingTell'; e.modeT = SH.swing.tell; w.mark('!!'); w.sound('swingTell'); w.number(G.mid, G.floorY - 70, SKY_SAY.swing, '#ff6b6b'); break;
  }
}
/* ---------- A LEVER STRUCK (any blow, any shot): over the middle on his line he slips; anywhere else, a clank (told once why) ---------- */
export function leverStruck(e, S, id, w) {
  if (!skySlippable(e, S)) { S.n.clank++; const on = skyOnLine(e), k = on ? 'notYet' : 'offLine'; if (w) { w.sound('clank'); if (!S.told[k]) { S.told[k] = 1; w.number(e.x, S.G.floorY - 60, SKY_SAY[k], '#c8d8e8'); } } return false; }
  S.n.slip++; S.leverHook = null; e.mode = 'slip'; e.modeT = SH.slip.fall; e.vy0 = e.y; e.sx0 = e.x; { const l = S.G.levers.find(q => q.id === id) || { x: e.x }, sd = Math.sign(e.x - l.x) || 1; e.sx1 = Math.max(S.G.x0 + 20, Math.min(S.G.x1 - 20, l.x + sd * SH.slip.land)); } S.lineDown = SH.slip.restring; S.act++;
  if (w) { w.cutLine(S.G.line.id, SH.slip.restring); w.sound('slip'); w.shake(5); w.number(e.x, e.y - 60, SKY_SAY.slip, '#ffd36b'); }
  return true;
}
/* ---------- A BLOW ON HIM (B15) -> [what lands, the word or null] ---------- */
export function takeBlow(e, S, dmg) {
  if (dmg <= 0) return [0, null];
  if (skyOpen(e)) { const mul = e.mode === 'downed' ? SH.downed.mul : SH.jarred.mul, d = Math.round(dmg * mul), left = S.purse ?? Infinity;
    if (d >= left) { S.purse = 0; e.modeT = Math.min(e.modeT, 0.05); return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (S.ward > 0 || e.mode === 'phaseTell' || e.mode === 'rise') return [Math.max(1, Math.round(dmg * SH.wardMul)), 'WARDED'];
  return [Math.max(1, Math.round(dmg * SH.chip)), SKY_SAY.guard];
}

/* ---------- THE BOT (src/lab.js): what a player reads - his tells a reaction late, the hook's aim line, the drop's ring (amber, then red), the swing's red arc,
   the levers glowing while he rides - and THE RULE: wait by a lever; strike it while he rides ---------- */
export const PLAN = { react: 0.2, miss: 0.1, missLever: 0.12 };
/* s = { P, e, S, reach, ranged, t, mem, rng, v2, shield, dodge, tip } (P: { x, y, vy, face, ground, atk, lk }) */
export function skyPlan(s) {
  const { P, e, S } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0, reach = s.reach || 22;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0.05 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 10, hi = G.x1 - 10, clamp = x => Math.max(lo, Math.min(hi, x));
  const dx = Math.abs(e.x - P.x), side = Math.sign(P.x - e.x) || 1, onFl = P.y >= G.floorY - 2 && !P.lk;
  const swingAtHim = () => { out.face = Math.sign(e.x - P.x) || out.face; out.atk = P.atk < 0; };
  if (P.lk) { out.down = true; out.why = 'off the line'; return out; }   /* the lab bot fights from the floor */
  /* 0. a jump is carried through */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.5) { out.gx = mem.jumpX; out.why = 'in the air'; return out; }
  /* 1. THE HOOK in the air at me, or his aim locked on me */
  for (const h of S.hooks) { const d = Math.hypot(h.x - P.x, h.y - (P.y - 8)), key = 'h' + h.key;
    if (d < 70 && seenFor(key, 0.05) && !roll(key + 'm', s.v2 ? 0 : PLAN.miss)) {
      if (s.shield) { out.block = true; out.gx = P.x; out.face = Math.sign(h.x - P.x) || P.face; out.why = 'block the hook'; return out; }
      if (s.dodge && P.ground) { out.dodge = true; out.gx = P.x + Math.sign(P.x - h.x || 1) * 30; out.why = 'roll the hook'; return out; }
      if (P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the hook'; return out; } } }
  /* 2. THE DROP's ring: out of it once it is set */
  if (e.mode === 'dropTell' && onFl) { const key = 'd' + S.act, need = SH.drop.r + 10;
    if (Math.abs(P.x - e.lockX) < need && (e.locked ? seenFor(key + 'l', 0.12) : seenFor(key, 0.3)) && !roll(key + 'm', s.v2 ? 0 : PLAN.miss)) { const l = e.lockX - need - 6, r = e.lockX + need + 6;
      out.gx = clamp(Math.abs(P.x - l) < Math.abs(P.x - r) && l > lo ? l : r); out.why = 'out of the drop\'s ring'; return out; } }
  /* 3. THE SWEEP: jump it */
  if ((e.mode === 'sweepTell' || e.mode === 'sweep') && dx < SH.sweep.reach + 8) { const key = 's' + S.act;
    if (seenFor(key) && !roll(key + 'm', s.v2 ? 0 : PLAN.miss) && (e.mode === 'sweep' || e.modeT < 0.2) && P.ground) { out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the sweep'; return out; }
    out.gx = P.x; out.why = 'the sweep: ready to jump it'; return out; }
  /* 4. THE LOW SWING: to a wall (the arc is high there); in the middle, jump him at the bottom */
  if (e.mode === 'swingTell' || e.mode === 'swing') { const key = 'g' + S.act, edge = P.x < G.mid ? lo + 4 : hi - 4;
    if (e.mode === 'swing' && Math.abs(e.x - P.x) < 40 && P.ground && seenFor(key + 's', 0.05)) { if (s.dodge && !roll(key + 'd', 0.5)) { out.dodge = true; out.gx = P.x - (e.face || 1) * 30; out.why = 'roll through the swing'; return out; }
      out.jump = true; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = 'jump the swing'; return out; }
    if (seenFor(key)) { out.gx = edge; out.why = 'to the wall: the arc is high there'; return out; } }
  /* 5. HE GETS UP: off him */
  if (e.mode === 'rise') { out.gx = clamp(e.x + side * (SH.rise.r + 24)); out.why = 'he gets up: off him'; return out; }
  /* 6. OPEN: strike him */
  if (skyOpen(e)) { const sd = s.ranged ? Math.min(90, Math.max(40, dx)) : s.tip ? SH.w / 2 + s.tip : SH.w / 2 + Math.max(6, reach - 8); out.gx = clamp(e.x + side * sd);
    if (dx < sd + 10) swingAtHim(); out.why = 'strike him: ' + e.mode; return out; }
  /* 7. THE LEVER: while he rides (or hooks on), at the nearest lever and strike it */
  const lev = G.levers.slice().sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  const leverSpot = l => clamp(l.x + (P.x < l.x ? -1 : 1) * (s.ranged ? 40 : Math.max(10, reach - 6)));
  if (lev && (e.mode === 'rideTell' || skyOnLine(e))) { const key = 'l' + S.n.ride + e.mode + (skySlippable(e, S) ? 'm' : '');
    if (skySlippable(e, S) && seenFor(key, s.v2 ? 0.05 : 0.15) && !roll(key + 'm', s.v2 ? 0 : PLAN.missLever)) { const sx = leverSpot(lev); out.gx = sx;
      if (Math.abs(P.x - sx) < 8 && P.ground) { out.face = Math.sign(lev.x - P.x) || 1; out.atk = P.atk < 0; } out.why = 'strike the lever: he is over the middle'; return out; }
    out.gx = leverSpot(lev); out.face = Math.sign(lev.x - P.x) || 1; out.why = 'to the lever: he hooks on'; return out; }
  /* 8. HE IS ON THE FLOOR (landed, jarred over, climbing): a cut while he is in reach */
  if (['landed', 'climbTell', 'climb'].includes(e.mode) && e.y > G.floorY - 30) { const sd = s.ranged ? 60 : SH.w / 2 + Math.max(6, reach - 8); out.gx = clamp(e.x + side * sd); if (dx < sd + 10) swingAtHim(); out.why = 'a cut while he is down here'; return out; }
  /* 9. RANGED: chip him wherever he is level with the shot (he rides above it), else wait by a lever */
  if (s.ranged && Math.abs(e.y - P.y) < 20 && dx < 200) { swingAtHim(); out.gx = P.x; out.why = 'a shot at him'; return out; }
  if (s.rest) { out.gx = lev ? leverSpot(lev) : P.x; out.why = 'winded: wait by a lever'; return out; }
  /* 10. WAIT BY A LEVER (not under his gallery's drop line) */
  if (lev) { out.gx = leverSpot(lev); out.face = Math.sign(lev.x - P.x) || 1; out.why = 'wait by a lever'; return out; }
  out.gx = P.x; out.why = 'wait'; return out;
}
