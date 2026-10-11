// src/foreman.js - THE FOREMAN, THE DEEP RAILS' MINI (claude/deeprails3, Daniel 10-10 live: "the elite doesn't work - you can't get over the gap fighting it, and
// combat doesn't work well with the cart. A MINI BOSS in another cart: you jump on it, it goes back and forth, an infinite repeating section until you complete it").
// Pure: no DOM, no main.js. The world (the treadmill, the pin while you ride HIS cart, the drawing) is src/minecart-hands.js; the bot that fights him is foremanPlan below
// (src/lab.js drives the keys; tools/cart-pilot.mjs rides him in the level).
//
// A GOBLIN FOREMAN IN AN ARMOURED ORE CART on an ENDLESS LOOPING STRETCH of THE FLOODED RUN (the Great Drill's treadmill: the world runs past at cruise, his cart and
// yours hold their places on it): TWO LINES - YOUR LINE (LOW) and a HIGH LINE three rows up (one-way rail: jump up, down + jump to drop). He rides the LOW line, AHEAD
// of you, and SHUTTLES: he drops back at you (told: his brake shoes glow, HE SLOWS) and pulls ahead again; between his runs he throws.
// THE KEY (design standard B14 'FROM ABOVE'): his cart is ARMOURED - a blade from your own cart clanks (x0.4, B15: never nothing, 'ARMOURED: JUMP ON HIM').
// JUMP ONTO HIS CART (or drop onto it from the HIGH line) and you STOMP him: a third of him. You stand on his cart, he is OPEN (gold ring + timer, B10: blows whole)
// until he answers with a told LURCH ('!! HE LURCHES', the cart rocks) that throws you back up and behind him - into your own cart, which rolled on under you
// (never an untold death: the loop has no gap). Then a told ~3 s BRACE (B3: his lid's spikes up - landing on him is turned, 'BRACED'). Three good boardings win.
// HIS MOVES (one at a time, every one told - sound + word + colour; the second boarding adds the ram, B5):
//   DRIFT   HE SLOWS (0.5 s: brake sparks, the word) and drops back at you down the line - jump on him as he comes; met in the cart it is a BUMP (he is armoured)
//   PICK    '!' and his arm back (0.75 s), then a pick lobbed at where YOUR cart will be - its mark on your rail: brake off it, pump past it, or jump
//   RAM     (from the first stomp) '!! HE BRAKES HARD' (0.95 s, red shoes, a screech), then he slams back down the line ~125 px: brake out of its reach, jump up to the
//           HIGH line (he passes under you), or jump ON him as he comes (a boarding)
// Numbers (a MINI, B6 amended 10-08): 75-85% WITH FLASKS knight/warden/pyro, 40-75 s, mash 0/6 (tools/boss-rates.mjs minecart:mini --profile=human).
export const FOREMAN = {
  cols: [822, 852], low: 30, high: 27,   /* the loop: columns, and the two lines' rows */
  homeR: 290, minR: 34, maxR: 420,      /* his cart's place on the loop, px from its left edge: at home, the nearest a ram brings him, the farthest */
  driftTell: 0.55, driftV: 72, driftVs: [72, 96, 120], awayV: 120,   /* (his drift quickens with each stomp: told by its sparks and its pace) */
  pickTell: 0.75,
  ramTell: 0.95, ramV: 250, ramT: 0.5, ramHold: 0.45,
  boardT: 0.85, lurchTell: 0.75, wardT: 3.0, lurchVy: -300,
  stompK: 0.3, bracedK: 0.04,           /* a stomp takes this share of his health; a landing on him BRACED is turned (a clank, this much - B15) */
  armour: 0.4,                          /* B15: a blade from your cart */
  bumpDmg: 12, ramDmg: 22, contactCd: 0.9, bumpBack: 56, ramBack: 84,
  topDy: 15, halfW: 15,                 /* his cart's top (px over the rail) and half its width: the landing that is a STOMP */
  gap: [2.0, 1.7, 1.4],
  chain: { 0: ['pick', 'drift', 'pick', 'pick', 'drift'], 1: ['ram', 'pick', 'drift', 'ram', 'drift'], 2: ['ram', 'pick', 'drift', 'pick', 'ram', 'drift'] },
};
export const FOREMAN_LINES = { slows: 'HE SLOWS: JUMP ON HIM', slowsAgain: 'HE SLOWS', ram: '!! HE BRAKES HARD: RAM', stomp: 'STOMPED! STRIKE HIM', lurch: '!! HE LURCHES', braced: 'BRACED: HIS SPIKES ARE UP',
  armour: 'ARMOURED: JUMP ON HIM', thrown: 'THROWN OFF: BACK IN YOUR CART', start: 'THE FOREMAN: JUMP ON HIS CART' };

export function geom(TS = 16) { const F = FOREMAN; return { x0: F.cols[0] * TS, x1: F.cols[1] * TS, lowY: F.low * TS, highY: F.high * TS, topY: F.low * TS - F.topDy, TS }; }
export function newFight(G) { return { G, R: FOREMAN.homeR, mode: 'wait', mT: 0, cd: 1.2, i: 0, stomps: 0, ward: 0, contactCd: 0, board: null, t: 0, told: {},
  n: { drift: 0, pick: 0, ram: 0, stomps: 0, braced: 0, bumps: 0, rams: 0, armoured: 0, open: 0, lurch: 0, thrown: 0, jumpedOff: 0 } }; }
export const foremanX = S => S.G.x0 + S.R;
export const foremanOpen = S => !!S && (S.mode === 'boarded' || S.mode === 'lurchTell') && !!S.board;
/* a hero's line on the loop: 0 LOW, 1 HIGH, -1 in the air */
export const laneOf = (G, y, tol = 6) => (Math.abs(y - G.lowY) <= tol ? 0 : Math.abs(y - G.highY) <= tol ? 1 : -1);

/* ---------- ONE FRAME ----------  heroes: [{ x, y, prevY, vy, ground, alive, riding, v (the cart's pace), pp }]
   c: { hit(h, dmg, name), bounce(h, px), stomp(h, dmg, braced), board(h, off), release(h, how), lob(h), number(x, y, t, col), sound(k), chip(dmg, word) } */
export function stepForeman(S, e, dt, heroes, c) {
  const F = FOREMAN, G = S.G; S.t += dt; S.contactCd = Math.max(0, S.contactCd - dt); if (S.ward > 0) S.ward = Math.max(0, S.ward - dt);
  if (S.mode === 'wait' || !e.alive) return;
  const live = heroes.filter(h => h.alive), fx = foremanX(S);
  const near = live.slice().sort((a, b) => Math.abs(a.x - fx) - Math.abs(b.x - fx))[0];
  /* A LANDING ON HIS CART: from above (feet coming down through its top, over its width) - a STOMP, or BRACED while his spikes are up (the game's own head-stomp
     calls landOn first - src/main.js -> src/minecart-hands.js stomp; this catches a landing on the tub's rim beside him) */
  if (S.mode !== 'boarded' && S.mode !== 'lurchTell') for (const h of live) {
    if (h.ground || !(h.vy > 0) || Math.abs(h.x - fx) > F.halfW + 4 || !(h.y >= G.topY - 30 && h.y <= G.topY + 4 && h.prevY <= G.topY + 4)) continue;   /* (coming down into his cart's space from above: his head to the tub's rim) */
    if (landOn(S, e, h, c)) break; }
  /* HIS CART AND YOURS ON THE LOW LINE: armoured - you bump off it (a RAM at full pump only chips it, x0.4); his own RAM hits harder */
  if (S.mode !== 'boarded' && S.mode !== 'lurchTell' && S.contactCd <= 0) for (const h of live) {
    if (!h.riding || !h.ground || laneOf(G, h.y) !== 0 || Math.abs(h.x - fx) > F.halfW + 7) continue;
    const ram = S.mode === 'ram'; S.contactCd = F.contactCd;
    if (!ram && h.x < fx && h.v >= c.ramV) { S.n.armoured++; c.chip(Math.max(1, Math.round(c.ramDmg * F.armour)), FOREMAN_LINES.armour); }
    if (ram) S.n.rams++; else S.n.bumps++;
    c.hit(h, ram ? F.ramDmg : F.bumpDmg, ram ? "THE FOREMAN'S RAM" : "THE FOREMAN'S CART"); c.bounce(h, ram ? F.ramBack : F.bumpBack); break; }
  S.mT -= dt;
  const hr = near ? near.x - G.x0 : F.homeR - 160;
  switch (S.mode) {
    case 'idle': { const d = F.homeR - S.R; S.R += Math.sign(d) * Math.min(Math.abs(d), F.awayV * dt); S.cd -= dt; if (S.cd > 0 || !near) break;
      const ch = F.chain[Math.min(2, S.stomps)], name = ch[S.i % ch.length]; S.i++;
      if (name === 'drift') { S.mode = 'driftTell'; S.mT = F.driftTell; S.n.drift++; S.dv = F.driftVs[Math.min(2, S.stomps)]; c.sound('brake'); c.number(fx, G.topY - 30, S.told.drift ? FOREMAN_LINES.slowsAgain : FOREMAN_LINES.slows, '#ffd36b'); S.told.drift = 1; }
      else if (name === 'pick') { S.mode = 'pickTell'; S.mT = F.pickTell; S.n.pick++; c.sound('tell'); }
      else { S.mode = 'ramTell'; S.mT = F.ramTell; S.n.ram++; c.sound('tellHard'); c.number(fx, G.topY - 30, FOREMAN_LINES.ram, '#ff6b6b'); }
      break; }
    case 'driftTell': if (S.mT <= 0) S.mode = 'drift'; break;
    case 'drift': S.R -= (S.dv || F.driftV) * dt; if (S.R <= Math.max(F.minR, hr - 40)) { S.mode = 'away'; } break;
    case 'away': S.R += F.awayV * dt; if (S.R >= F.homeR) { S.R = F.homeR; S.mode = 'idle'; S.cd = F.gap[Math.min(2, S.stomps)]; } break;
    case 'pickTell': if (S.mT <= 0) { if (near) c.lob(near); S.mode = 'idle'; S.cd = F.gap[Math.min(2, S.stomps)] + 0.4; } break;
    case 'ramTell': if (S.mT <= 0) { S.mode = 'ram'; S.mT = F.ramT; c.sound('ram'); } break;
    case 'ram': S.R = Math.max(F.minR, S.R - F.ramV * dt); if (S.mT <= 0 || S.R <= F.minR) { S.mode = 'ramHold'; S.mT = F.ramHold; } break;
    case 'ramHold': if (S.mT <= 0) S.mode = 'away'; break;
    case 'boarded': if (!S.board) { S.mode = 'away'; S.ward = F.wardT; break; } if (S.mT <= 0) { S.mode = 'lurchTell'; S.mT = F.lurchTell; c.sound('tellHard'); c.number(fx, G.topY - 40, FOREMAN_LINES.lurch, '#ff6b6b'); } break;
    case 'lurchTell': if (!S.board) { S.mode = 'away'; S.ward = F.wardT; break; } if (S.mT <= 0) { S.n.lurch++; c.release(S.board, 'lurch'); S.board = null; S.mode = 'away'; S.ward = F.wardT; c.sound('lurch'); } break;
    default: S.mode = 'idle';
  }
  S.R = Math.max(F.minR, Math.min(F.maxR, S.R));
}
/* A HERO LANDS ON HIM FROM ABOVE (a stomp on his head, a plunge, a landing on his rim): BOARDED - the stomp takes a third of him and he is OPEN while you stand there -
   or, while his spikes are up, BRACED (turned: a clank, a sliver - B15). Returns 'board' | 'braced' | null */
export function landOn(S, e, h, c) { const F = FOREMAN, G = S.G, fx = foremanX(S);
  if (!S || S.mode === 'wait' || S.mode === 'boarded' || S.mode === 'lurchTell' || !e.alive) return null;
  if (S.ward > 0) { S.n.braced++; c.stomp(h, Math.max(1, Math.round(e.maxHp0 * F.bracedK)), true); c.number(fx, G.topY - 30, FOREMAN_LINES.braced, '#c8d8e8'); c.sound('clank'); return 'braced'; }
  S.n.stomps++; S.stomps++; S.mode = 'boarded'; S.mT = F.boardT; S.board = { pp: h.pp, off: Math.max(-F.halfW + 2, Math.min(-5, h.x - fx)), spotX: fx - 40 }; S.n.open++;
  c.board(h, S.board.off); c.stomp(h, Math.ceil(e.maxHp0 * F.stompK), false); c.number(fx, G.topY - 34, FOREMAN_LINES.stomp, '#ffd36b'); c.sound('stomp'); return 'board'; }
/* A BLADE ON HIM (src/minecart-hands.js knock): whole while you stand on his cart (OPEN), x0.4 from anywhere else (B15) - the word in out.word */
export function takeBlade(S, dmg, out = {}) { if (foremanOpen(S)) return dmg; out.word = S && S.ward > 0 ? FOREMAN_LINES.braced : FOREMAN_LINES.armour; if (S) S.n.armoured++; return Math.max(1, Math.round(dmg * FOREMAN.armour)); }

/* ---------- THE BOT (src/lab.js, tools/cart-pilot.mjs): what a player sees, a quarter-second late (a tell misread one time in eight) ----------
   P: { x, y, ground, vy, atk, v (the cart's pace), lane (0 LOW, 1 HIGH, -1 air), boarded }; returns { gx (where to hold on the loop), jump, drop, atk, why } */
export const FOREMAN_PLAN = { react: 0.25, miss: 0.12, early: 0.15 };
export function foremanPlan({ P, S, rng = Math.random, mem = {}, t, eyes = false }) {
  const F = FOREMAN, G = S.G, fx = foremanX(S), out = { gx: G.x0 + 120, why: '' }, dx = fx - P.x;
  const late = k => { if (eyes) return true; if (!(k in mem)) { mem[k] = t + FOREMAN_PLAN.react - 0.04 + rng() * 0.1; mem['m' + k] = rng() < FOREMAN_PLAN.miss; } return t >= mem[k] && !mem['m' + k]; };
  if (P.boarded) { out.gx = null; if (P.atk < 0) out.atk = true; out.why = 'aboard: strike'; return out; }
  if (P.lane === 1 && P.ground) { out.drop = S.ward <= 0 && Math.abs(dx) < 10 && (S.mode === 'drift' || S.mode === 'idle' || S.mode === 'ramHold' || S.mode === 'away'); out.gx = fx; out.why = 'high: over him'; return out; }
  /* HIS RAM: out of its reach (a brake) - or, close, up to the HIGH line */
  if ((S.mode === 'ramTell' || S.mode === 'ram') && late('ram' + S.n.ram)) { const reach = F.ramV * F.ramT + F.halfW + 34; if (dx < reach) { if (dx < 70 && P.ground) { out.jump = true; out.why = 'ram: up high'; } out.gx = fx - reach - 20; out.why = out.why || 'ram: brake'; } return out; }
  /* HIS DRIFT: hold the line under where he comes, and jump as he is a jump away (a stomp) */
  if ((S.mode === 'drift' || S.mode === 'driftTell') && S.ward <= 0 && late('drift' + S.n.drift)) { out.gx = Math.min(P.x, fx - 30); const lead = (S.dv || F.driftV) * 0.55 + (mem.lead ?? (mem.lead = rng() * 10 - 5));
    if (S.mode === 'drift' && P.ground && P.lane === 0 && dx > lead - 10 && dx < lead + 6 && !(mem['mj' + S.n.drift] ??= rng() < FOREMAN_PLAN.miss)) { out.jump = true; out.why = 'drift: jump on him'; } else out.why = 'drift: wait'; return out; }
  /* HIS PICK: off its mark (the hands' lob list is read by the lab) */
  if (mem.mark && Math.abs(mem.mark.x - P.x) < 34 && mem.mark.t > 0) { out.gx = mem.mark.x - 60; out.why = 'pick: brake off the mark'; return out; }
  /* otherwise: hold well back while he is braced, else a little behind his reach */
  out.gx = S.ward > 0 ? G.x0 + 90 : Math.min(G.x0 + 150, fx - 90); out.why = S.ward > 0 ? 'braced: wait' : 'hold';
  return out;
}
