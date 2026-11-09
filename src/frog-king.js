/* src/frog-king.js - THE BULLFROG KING: THE PAD CHASE (claude/frogking2; scratch/brief-playtest-1021b.md item 2, Daniel 10-21: "FROG KING doesn't use the
   level's mechanics -> rework: he is (almost) always vulnerable but you must CROSS PADS to reach him - a longer pad section, sinking/holding pads, he sits
   on a big pad/platform you can hit, then LEAPS away to another and it repeats").
   B1, THE RULE IS THE OPENING: the marsh's rule is PADS SINK. His court is open biting water with three ROYAL PADS standing out of it (src/frog-court.js)
   and lanes of lily pads between them - the yellow ones sink under you, the cool green ones hold. He sits on a royal pad and there he is HITTABLE: no
   hide, no shell (B13: no waiting room). Reaching him IS the fight. Take a share of him (FK.quota) - or stand on his pad long enough (FK.stay) - and he
   LEAPS to another royal pad (on along the court, then back): the lanes RESHUFFLE as he lands, and you cross again.
     PHASE 1  THE COURT      (100% -> 50%)  his tongue, his spit, his belly-flop, his flies, his leap
     PHASE 2  HIS POND STIRS  (50% -> 0)    one great croak on the throne bank: the yellow pads sink 1.6x faster and fewer pads hold; his tongue reaches
                                            further, his spit comes twice, and he is restless (a shorter stay)
                                            (claude/frogking3: the court CHANGES - sky dims, water darkens and rises, his skin flushes red, his throat glows, a banner, the track lifts a tone;
                                            and his told blows CHAIN in pairs, FK.pair, with the same whole tells)
   HIS MOVES, each told, each its own windup + release pose (src/redraw/frogking.js, B16), each with its answer (B10, B14, B15, B17 four+):
     THE TONGUE LASH   tongueTell (yellow !) - out it comes at the height you stood at: SHIELD it (he bites his tongue: DAZED) or JUMP it. Taken, it GRABS:
                       on his pad it reels you to his feet; anywhere else it drops you IN THE WATER (the marsh's hurting water: a quarter of you, back to
                       the last footing you stood on)
     THE SPIT          spitTell (yellow !) - his cheeks fill; three globs lobbed onto the spot you stand on (twice in phase 2): a shield turns venom, or move
     THE BELLY-FLOP    flopTell (red !!) - he rears up and comes down flat: a SHOCKWAVE runs out both ways, over the water too. Jump it: on a bank or a
                       royal pad it hurts; on a lily pad it SINKS THE PAD under you. Then he lies WINDED a moment (x1.5): the reward for being there
     THE FLY SWARM     swarmTell (quiet: the flies throw nothing) - a cloud trails you; his tongue snaps at it (snapTell, yellow !). Lead them onto his
                       head (stand at his mouth on his pad as the tongue comes) and he BITES HIMSELF: DAZED (x2)
     THE LEAP          crouch (yellow !) - he squats, and bounds to another royal pad (a long told arc: leave the spot he comes down on, or shield the
                       landing: TURNED, DAZED). He lands with a shockwave and the lanes RESHUFFLE: every leaf nobody stands on goes under and comes up
                       somewhere else (firm or sinking anew)
     THE BELLOW        (claude/frogking2 11-07, Daniel's FROG KING 2) bellowTell (yellow !, his croak) - his throat sac swells and GLOWS (frame 20). THREE blows on it
                       while it is up BURST it: he flops BELLY-UP (frame 22) for 3 s at x2 - THE BREAK ('THE SAC BURSTS'), worth at most FK.bellow.take of him.
                       Let go, it is a croak RING running out both ways along the ground (jump it or shield it; taken, it throws you back) and he CALLS 2 marsh
                       hoppers out of the water (3 in phase 2; max 4 up). He bellows at least every 12 s (10 in phase 2).
   His openings: DAZED x1.5 (a bitten tongue, the flies, a turned landing), WINDED x1.2 (after the flop), BELLY-UP x2 (the sac burst); one opening pays at most FK.take
   of him (the break FK.bellow.take), the rest at 1x. Outside them a hero's blade lands at 0.6x (src/boss-greed.js chipBy.frog), in the air (mid-leap) 0.4x (B15).
   THE FLIES now SAP STAMINA while the cloud is on you. Numbers here; the machine is updateFrog in src/main.js.
   (claude/froglift, BOSSLIFT 11-08, behind BOSSLIFT_FROG_SHIPS / ?bosslift) BITE HIS OWN FLY - his signature moment: the flies come round at least every FK.fly.every s
   ("SWAT THE FLIES AT HIM"); a blade, shield or deflect on the cloud within FK.fly.reach of him BATS it at his mouth; his eyes bulge (flyEye), the tongue snaps it
   (flySnap), he GULPs, BLOATs and rolls BELLY-UP (x2, FK.fly.belly s, at most FK.bellow.take of him) while the leaves beside his pad rise FIRM (THE POND LIFTS THE
   LEAVES). Phase 2: a bigger cloud, spat as he lands, and belly-up tips him to his pad's edge over the lane. The BELLOW's burst is a DAZE now (the fly owns
   belly-up). A swat too far off, or while he gathers / flies, scatters the cloud and it re-forms on you. Hooks: single tagged lines in src/main.js; tools/frog-fly.mjs. */
import * as M2A from './redraw/marsh2_art.js';

export const FK = {
  hp: 800,                          /* (claude/frogking3, Daniel 11-01: "way too much health") 1500 -> 650; (bosstune 11-04) 900; (claude/frogking2 11-07) 1100 BY ARITHMETIC, n=6 OWED: off-opening blows went
                                       x0.05 -> x0.6 and the BELLOW break pays up to 12% a burst, so the bar moves ~1.5x faster than at 900 - 1100 holds the fight near 70-80 s with the new
                                       pressure (hoppers, the ring, the flies' drain, more leaps) */
  p2At: 0.5,                       /* HIS POND STIRS */
  drainAt: -1,                     /* (claude/firsthour's plug drain is retired: the court is open water from the start) */
  quota: [0.08, 0.07],             /* the share of him one royal pad is worth before he leaps on, per phase */
  stay: [12, 9],                  /* or this long with you on his pad */
  take: 0.045,                      /* one opening is worth at most this share of him, then he shakes it off */
  dazed: 1.5, winded: 1.2, air: 0.4, throat: 1.5,
  tongue: { tell: [0.5, 0.45], live: 0.55, max: [175, 210], reel: 330, reelMax: 0.6, dmg: 22 },
  spit: { tell: [0.5, 0.42], shots: [1, 2], flight: 0.8, spread: 18 },
  flop: { tell: 0.8, air: 0.5, rest: 1.6, sp: 170, life: 2.4, dmg: 24, dunk: 0.6 },
  swarm: { tell: 0.6, spit: 0.35, life: 3.2, lag: 0.5, orbit: 13, snapTell: 0.85, snapLive: 0.45, reach: 240, bite: 34, open: 2.4, drain: 20, onR: 16 },   /* (claude/frogking2 11-07, Daniel "flies do nothing") drain: stamina a second while the cloud is ON you (within onR px of your chest) - regen held, the bar flickers; walk out of it (it trails FK.swarm.lag s behind) */
  leap: { tell: [0.65, 0.5], air: 1.2, under: 0.9, roam: [13, 10] },   /* (claude/frogking2 11-07, Daniel "jumps between platforms more") roam: s on one pad before he leaps on even untouched (was never); quota .10/.10 -> .08/.07, stay 20/16 -> 12/9 */
  /* (claude/frogking2 11-07) THE BELLOW - his BREAK (Daniel: "no obvious way to make him vulnerable"). bellowTell: the throat sac swells and GLOWS for tell[ph] s; three blows on it
     (hits) in that time BURST it: he flops BELLY-UP for belly s at x mul, one break worth at most take of him. Let go unburst, a croak RING runs out both ways along the
     ground (jump it, or shield it; taken it knocks you back) and he CALLS adds[ph] marsh hoppers out of the water (max alive maxAlive, +1 each a full extra seat).
     every[ph]: he bellows at least this often. Outside his openings a hero's blade lands at 0.6x (src/boss-greed.js chipBy.frog; was the x0.05 chip) */
  bellow: { tell: [2.0, 1.7], hits: 3, every: [12, 10], rest: 0.6, belly: 3.0, mul: 2, take: 0.12, ring: { sp: 150, life: 1.8, dmg: 12, kb: 190 }, adds: [1, 2], maxAlive: 3, addCap: 6 },
  guard: 0.6,
  sink: [1.3, 2.0],                  /* the sinking pads' pace, per phase */
  firm: [1, 1],                    /* leaves in a lane that HOLD after a reshuffle, per phase (of four) */
  gap: [0.55, 0.35],                /* his rest between blows, per phase */
  pair: [0, 0.6],                  /* (claude/frogking3) PHASE 2 CHAINS: after a told tongue or spit, the chance his NEXT told blow follows at once (a short rest, the same full tell) - the existing moves in pairs, no new attack */
  pairGap: 0.3,
  ripple: { open: 2.4 },           /* (kept for frogFlat) */
  pound: { sink: 1.5 },
  /* (claude/froglift, BOSSLIFT 11-08: "BITE HIS OWN FLY") the signature moment, live only behind BOSSLIFT_FROG_SHIPS / ?bosslift (frogLiftOn below).
     every[ph]: he spits the flies at least this often. reach: a swat counts only within this many px of him. home: px/s the batted cloud flies at his mouth.
     snapTell: his eyes bulge this long before the tongue snaps at the batted cloud (snapLive: the snap itself), then GULP (gulp s), BLOAT (bloat s), BELLY-UP
     (belly[ph] s at FK.bellow.mul, worth at most FK.bellow.take of him). lift: the leaves beside his pad stay FIRM belly + lift s. reform: a scattered cloud
     re-forms on you after this. homeMax: a batted cloud he never snaps at scatters after this. p2drain / p2stick: phase 2's bigger cloud. sacDaze: the BELLOW's
     burst is a DAZE now (x FK.dazed, FK.take), this long. tip: phase 2's belly-up tips his royal pad - he slides to its edge over the lane */
  fly: { every: [11, 9], reach: 260, home: 220, snapTell: 0.35, snapLive: 0.2, gulp: 0.5, bloat: 0.4, belly: [3.0, 2.6], lift: 1.0, reform: 1.0, homeMax: 2.5, p2drain: 30, p2stick: 0.3, sacDaze: 2.4, tip: true },
};

/* (claude/froglift) THE FLAG: off, the live fight is untouched. ?bosslift in the URL (or a tool setting globalThis.__BOSSLIFT) switches it on to see the work (the PVP_SHIPS pattern) */
export const BOSSLIFT_FROG_SHIPS = false;
const LIFT_URL = typeof globalThis !== 'undefined' && !!globalThis.location && /[?&]bosslift(=|&|$)/.test(String(globalThis.location.search));
export const frogLiftOn = () => BOSSLIFT_FROG_SHIPS || LIFT_URL || !!(typeof globalThis !== 'undefined' && globalThis.__BOSSLIFT);
/* the new modes' greybox poses (src/redraw/frogking.js frames; the art lane draws GULP, BLOAT x2 and the swollen belly-up): eyes on the flies (17), the tongue out (8),
   cheeks stuffed (11), the swollen throat (20) */
export const FROG_LIFT_FRAMES = { flyEye: 17, flySnap: 8, gulp: 11, bloat: 20 };
export const FROG_LIFT_MODES = new Set(Object.keys(FROG_LIFT_FRAMES));
/* where a batted cloud draws his tongue at once (anything else: it hovers at his lips until he is free; a crouch or a leap makes it miss) */
const SNAP_FROM = new Set(['idle', 'swarm', 'land', 'tongueTell', 'spitTell', 'snapTell']);

/* the court's pads: the movers of kind 'pad' inside the arena */
export const courtPads = (movers, A) => movers.filter(m => m.kind === 'pad' && m.x + m.w / 2 > A.x0 && m.x + m.w / 2 < A.x1);
/* which royal pad (station) a point is on, or -1 */
export const stationAt = (A, x) => (A && A.royal ? A.royal.findIndex(r => x >= r.x0 - 2 && x <= r.x1 + 2) : -1);
/* the next royal pad he leaps for: on along the court, and back */
export function nextStation(e, n) { let d = e.stDir || 1; if (e.st + d < 0 || e.st + d >= n) d = -d; e.stDir = d; return e.st + d; }

/* THE COURT'S OWN STATE: the swarm, the lanes' reshuffle. One per level load. */
export function makeFrogCourt(ctx) {
  const S = { swarm: null, ripples: [], hist: [], fling: null, reel: null, sinkK: 1, n: { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0, reshuffles: 0, leaps: 0, padSunk: 0 } };
  const P = () => ctx.P(), R = Math.round;
  S.reset = () => { S.swarm = null; S.ripples = []; S.hist = []; S.fling = null; S.reel = null; S.sinkK = 1; S.n = { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0, reshuffles: 0, leaps: 0, padSunk: 0 }; };
  const pads = () => { const A = ctx.arena(); return A ? courtPads(ctx.movers(), A).filter(m => m.frogLane !== undefined || A.frogChase) : []; };
  /* the flies: a cloud that trails the hero by FK.swarm.lag s (the history of where he stood) */
  S.spitSwarm = e => { const p = P(); S.swarm = { x: e.x + e.face * 20, y: e.y - 18, t: FK.swarm.life, eaten: false, ph: 0 }; S.hist = [{ x: p.x, y: p.y - 12, t: 0 }];
    if (frogLiftOn()) { e.flyT = 0; if ((e.phase || 1) >= 2) S.swarm.t += FK.fly.p2stick; } };   /* (claude/froglift) the flies' clock restarts; phase 2's cloud sticks longer */
  S.step = (dt, e) => {
    const p = P(), now = ctx.time();
    S.hist.push({ x: p.x, y: p.y - 12, t: now }); while (S.hist.length > 2 && now - S.hist[1].t > FK.swarm.lag) S.hist.shift();
    if (S.swarm) { const sw = S.swarm, h = S.hist[0]; sw.ph += dt * 9; sw.t -= dt;
      if (sw.home && e) liftHome(sw, e, dt); else if (sw.scatter > 0) { sw.scatter -= dt; sw.x += sw.svx * dt; sw.y += sw.svy * dt; }   /* (claude/froglift) a batted cloud flies at his mouth; a scattered one drifts, then re-forms on you */
      else { const k = Math.min(1, dt * 5); sw.x += (h.x - sw.x) * k; sw.y += (h.y - sw.y) * k; }
      if (Math.random() < dt * 6) ctx.buzz(); if (sw.t < -2.5 || !e || !e.alive) S.swarm = null; }
    /* THE RESHUFFLE: a leaf that went under comes up again in its new place, with its new kind */
    for (const m of pads()) { m.sinkK = S.sinkK; if (m.rockT > 0) m.rockT -= dt; if (m.slapT > 0) { m.slapT -= dt; m.sink = 1; }
      if (m.shufTo && m.sink >= 0.99) { m.x = m.x0 = m.shufTo.x; m.firm = m.shufTo.firm; m.shufTo = null; }
      if (m.liftT > 0) { m.liftT -= dt; m.firm = true; if (m.liftT <= 0) { m.liftT = 0; m.firm = !!m.liftFirm; } } }   /* (claude/froglift) THE POND LIFTS THE LEAVES: firm while it lasts */
    if (e && frogLiftOn()) liftStep(dt, e);
  };
  /* ---------- (claude/froglift) BITE HIS OWN FLY: swat the cloud at him -> his tongue snaps at it -> GULP -> BLOAT -> BELLY-UP, and the pond lifts the leaves ---------- */
  const say = (x, y, t, c) => ctx.number && ctx.number(x, y, t, c);
  const mouth = e => ({ x: e.x + (e.face || 1) * 14, y: e.y - 18 });
  S.scatterSwarm = (msg, why) => { const sw = S.swarm; if (!sw) return; const p = P(), d = Math.sign(sw.x - p.x) || 1;
    sw.home = false; sw.snapped = false; sw.trail = null; sw.scatter = FK.fly.reform; sw.svx = d * 50; sw.svy = -25; sw.t = Math.max(sw.t, FK.fly.reform + 1.2);
    S.n.scatters = (S.n.scatters || 0) + 1; S.n.lastScatter = why || 'miss'; if (msg) say(p.x, p.y - 34, msg, '#c9e3a0'); };
  function liftHome(sw, e, dt) { sw.t = Math.max(sw.t, 1); sw.homeT = (sw.homeT || 0) + dt; const m = mouth(e), dx = m.x - sw.x, dy = m.y - sw.y, d = Math.hypot(dx, dy);
    if (e.mode === 'crouch' || e.mode === 'leap') { S.scatterSwarm('HE IS AWAY: THE FLIES COME BACK', 'away'); return; }
    if (sw.homeT > FK.fly.homeMax) { S.scatterSwarm('THE FLIES SCATTER', 'late'); return; }
    if (d > 2) { const s = Math.min(d, FK.fly.home * dt); sw.x += dx / d * s; sw.y += dy / d * s; }
    (sw.trail = sw.trail || []).push({ x: sw.x, y: sw.y }); if (sw.trail.length > 6) sw.trail.shift(); }
  /* a blade blow (its attackBox), a raised shield or a deflect touching the cloud BATS it at him - within FK.fly.reach of him, and not while he gathers or flies */
  S.bat = (hb, p) => { if (!frogLiftOn()) return false; const sw = S.swarm, e = ctx.boss ? ctx.boss() : null; if (!sw || !e || sw.home || sw.scatter > 0 || sw.eaten || !p || p.dead) return false;
    let box = hb; if (!box) { if (!(p.block || p.warding)) return false; const f = p.face || 1; box = f > 0 ? { l: p.x - 4, r: p.x + 24, t: p.y - 34, b: p.y + 2 } : { l: p.x - 24, r: p.x + 4, t: p.y - 34, b: p.y + 2 }; }
    const o = FK.swarm.orbit; if (sw.x + o < box.l || sw.x - o > box.r || sw.y + o < box.t || sw.y - o > box.b) return false;
    S.n.swats = (S.n.swats || 0) + 1;
    if (e.mode === 'crouch' || e.mode === 'leap') { S.scatterSwarm('HE IS AWAY: THE FLIES COME BACK', 'away'); return 'away'; }
    if (Math.abs(sw.x - e.x) > FK.fly.reach) { S.scatterSwarm('TOO FAR: THE FLIES SCATTER', 'far'); return 'far'; }
    sw.home = true; sw.homeT = 0; sw.snapped = false; sw.trail = []; S.n.batted = (S.n.batted || 0) + 1; say(sw.x, sw.y - 16, 'SWAT!', '#c9e3a0'); return 'bat'; };
  function liftStep(dt, e) {
    const sw = S.swarm, ph = (e.phase || 1) >= 2 ? 1 : 0, p = P();
    /* the flies come round: his clock runs while no cloud is out (FK.fly.every; updateFrog's idle spits them when it is due) */
    if (!sw && !['sleep', 'wake', 'leap', 'crouch', 'swarmTell', 'swarm'].includes(e.mode)) e.flyT = (e.flyT || 0) + dt;
    /* phase 2: he spits the cloud as he lands from a leap, and it saps harder */
    if (ph && e.mode === 'land' && e.landAt !== undefined && e.landAt !== S.lastLand) { S.lastLand = e.landAt; if (!S.swarm) { S.spitSwarm(e); say(p.x, p.y - 30, 'HE SPITS THE FLIES AS HE LANDS', '#c9e3a0'); } }
    if (ph && sw && !sw.home && !(sw.scatter > 0) && !p.dead && Math.hypot(sw.x - p.x, sw.y - (p.y - 12)) < FK.swarm.onR) p.st = Math.max(0, (p.st || 0) - (FK.fly.p2drain - FK.swarm.drain) * dt);
    /* a batted cloud draws his tongue at once (eyes bulging: flyEye) */
    if (sw && sw.home && !sw.snapped && SNAP_FROM.has(e.mode)) { sw.snapped = true; e.mode = 'flyEye'; e.modeT = FK.fly.snapTell; e.actN = (e.actN || 0) + 1; e.snapAim = undefined; e.face = Math.sign(sw.x - e.x) || e.face; say(e.x, e.y - (e.h || 30) - 12, '!', '#ffd36b'); }
    if (e.mode !== 'bellyUp' && e.tipX !== undefined) e.tipX = undefined;
  }
  /* the cloud is in his mouth: GULP (from the swat's snap, or the old route - led onto his head as his tongue came) */
  S.bite = (e, how, fx) => { S.swarm = null; S.n.selfBites++; S.n.flyBites = (S.n.flyBites || 0) + 1; S.n.lastBite = how; e.mode = 'gulp'; e.modeT = FK.fly.gulp; e.openHp0 = undefined; e.actN = (e.actN || 0) + 1;
    say(e.x, e.y - (e.h || 30) - 14, 'HE BITES HIS OWN FLY', '#8fd160'); if (fx) { fx.sfx('tongue'); fx.sfx('croak'); fx.shake(3); fx.burst(e.x + (e.face || 1) * 12, e.y - 18, 10, ['#ff7a9a', '#1a1a14', '#8fd160'], 70, 0.4); } };
  /* BELLY-UP from the fly: x FK.bellow.mul for FK.fly.belly[ph] s; the leaves beside his pad rise firm; in phase 2 his pad tips him to its edge over a lane */
  S.bellyUp = (e, ph, fx) => { e.mode = 'bellyUp'; e.modeT = FK.fly.belly[ph]; e.openHp0 = e.hp; e.hideSaid = 0; e.actN = (e.actN || 0) + 1; S.n.flyBellies = (S.n.flyBellies || 0) + 1;
    say(e.x, e.y - (e.h || 30) - 26, 'BELLY-UP: CUT HIM', '#ffd36b'); if (fx) { fx.sfx('heavy'); fx.sfx('splash'); fx.shake(6); fx.hitstop(0.12); }
    const n = S.liftLeaves(e.st, FK.fly.belly[ph] + FK.fly.lift); if (n) say(e.x, e.y - (e.h || 30) - 38, 'THE POND LIFTS THE LEAVES', '#bfe6f5');
    const A = ctx.arena(); if (ph && FK.fly.tip && A && A.royal && A.royal[e.st] && A.lanes) { const r = A.royal[e.st], p = P(); let side = Math.sign(p.x - e.x) || 1;
      if (side > 0 && !A.lanes[e.st + 1]) side = -1; if (side < 0 && !A.lanes[e.st]) side = 1; e.tipX = side > 0 ? r.x1 : r.x0; e.x = e.tipX; S.n.tips = (S.n.tips || 0) + 1; say(e.x, e.y - (e.h || 30) - 50, 'HIS PAD TIPS', '#bfe6f5'); } };
  /* the leaves in the lanes either side of royal pad st surface FIRM for dur s (a leaf under in a reshuffle comes up at once, in its new place) */
  S.liftLeaves = (st, dur) => { const A = ctx.arena(); if (!A || !A.lanes) return 0; const ls = [A.lanes[st], A.lanes[st + 1]].filter(Boolean); let n = 0;
    for (const m of pads()) { const c = m.x + m.w / 2; if (!ls.some(l => c > l.x0 && c < l.x1)) continue;
      if (m.shufTo) { m.x = m.x0 = m.shufTo.x; m.liftFirm = m.shufTo.firm; m.shufTo = null; } else if (!(m.liftT > 0)) m.liftFirm = m.firm;
      m.firm = true; m.slapT = 0; m.liftT = dur; n++; }
    if (n) S.n.lifts = (S.n.lifts || 0) + 1; return n; };
  /* his new modes, run from updateFrog's switch (src/main.js, one case line): the eyes, the snap, the gulp, the bloat */
  S.mode = (e, dt, ph, fx) => { const A = ctx.arena(); if (A) e.y = A.floor; e.vy = 0; const sw = S.swarm;
    switch (e.mode) {
      case 'flyEye': if (sw) e.face = Math.sign(sw.x - e.x) || e.face; if (e.modeT <= 0) { e.mode = 'flySnap'; e.modeT = FK.fly.snapLive; if (fx) fx.sfx('tongue'); } break;
      case 'flySnap': if (e.modeT <= 0) { if (S.swarm) S.bite(e, 'swat', fx); else { e.mode = 'idle'; e.modeT = FK.gap[ph]; } } break;
      case 'gulp': if (e.modeT <= 0) { e.mode = 'bloat'; e.modeT = FK.fly.bloat; say(e.x, e.y - (e.h || 30) - 14, 'HE BLOATS', '#e4e6ac'); if (fx) fx.sfx('squelch'); } break;
      case 'bloat': if (e.modeT <= 0) S.bellyUp(e, ph, fx); break;
      default: return false; }
    return true; };
  /* THE BELLOW's burst is a DAZE now (BOSSLIFT Q1: the fly owns belly-up) */
  S.sacDaze = e => { e.mode = 'dazed'; e.modeT = FK.fly.sacDaze; e.openHp0 = e.hp; S.n.sacDazes = (S.n.sacDazes || 0) + 1; say(e.x, e.y - (e.h || 30) - 38, 'DAZED', '#8fd160'); };
  /* every lane leaf nobody stands on goes under (FK.leap.under s) and comes up somewhere else in its lane, firm or sinking anew */
  S.reshuffle = (ph, rng = Math.random) => { const A = ctx.arena(); if (!A || !A.lanes) return 0; let n = 0; const riders = ctx.riders ? ctx.riders() : [P().onMover], heroes = ctx.heroes ? ctx.heroes() : [P()];
    for (const lane of A.lanes) { if (heroes.some(h => !h.dead && h.x > lane.x0 - 8 && h.x < lane.x1 + 8)) continue;   /* a lane a hero is crossing keeps its leaves: a reshuffle never pulls them from under a jump */ const ls = pads().filter(m => m.x + m.w / 2 > lane.x0 && m.x + m.w / 2 < lane.x1).sort((a, b) => a.x - b.x); if (!ls.length) continue;
      const hold = new Set(); while (hold.size < Math.min(FK.firm[ph] || 1, ls.length)) hold.add((rng() * ls.length) | 0);
      ls.forEach((m, k) => { if (riders.includes(m)) return; if (m.liftT > 0) { m.liftT = 0; m.firm = !!m.liftFirm; }   /* (claude/froglift) a reshuffle ends the lift */
        const slot = lane.x0 + (lane.x1 - lane.x0) * (k + 0.5) / ls.length - m.w / 2, jig = Math.round((rng() - 0.5) * 12);
        m.slapT = FK.leap.under; m.shufTo = { x: Math.max(lane.x0 + 10, Math.min(lane.x1 - 10 - m.w, Math.round(slot + jig))), firm: hold.has(k) }; n++; }); }
    S.n.reshuffles++; return n; };
  S.stir = ph => { S.sinkK = FK.sink[ph] || 1; return S.reshuffle(ph); };
  /* the flop's wave over the water: a leaf it passes rocks; under a hero standing on it, it goes under */
  S.waveOver = (w, dt) => { for (const m of pads()) { const c = m.x + m.w / 2; if (Math.abs(c - w.x) < m.w / 2 + 2) { if (!(m.rockT > 0)) m.rockT = 0.35;
      const p = P(); if (w.flop && p.onMover === m && p.ground && !p.dead && !(m.slapT > 0) && !(m.liftT > 0)) { m.slapT = FK.flop.dunk; S.n.padSunk++; ctx.number(p.x, p.y - 26, 'THE WAVE SINKS YOUR PAD', '#bfe6f5'); ctx.splash && ctx.splash(); } } } };
  S.ripple = () => {}; S.slap = () => { for (const m of pads()) { m.slapT = FK.pound.sink; } };
  S.throwOff = () => {};   /* (the croak ripple's throw is retired with his shallow pond) */
  S.show = () => ({ swarm: S.swarm ? { x: S.swarm.x, y: S.swarm.y, t: S.swarm.t, batted: !!S.swarm.home, scatter: S.swarm.scatter > 0 } : null, ripples: [], fling: false, reel: !!S.reel, n: S.n, sinkK: S.sinkK });
  S.draw = (g, cx, cy, time) => { if (S.swarm) M2A.swarm(g, S.swarm, cx, cy, time, FK.swarm.orbit); if (frogLiftOn()) liftDraw(g, cx, cy, time); };
  /* (claude/froglift) GREYBOX until the art lane: the batted cloud's green streak, a green rim on the risen leaves */
  function liftDraw(g, cx, cy, time) { const sw = S.swarm; if (sw && sw.home && sw.trail) { g.fillStyle = '#8fd160'; sw.trail.forEach((q, i) => { g.globalAlpha = 0.25 + i * 0.1; g.fillRect(Math.round(q.x - cx) - 1, Math.round(q.y - cy) - 1, 2, 2); }); g.globalAlpha = 1; }
    for (const m of pads()) if (m.liftT > 0) { g.fillStyle = (Math.floor(time * 6) % 2) ? '#8fd160' : '#c9e3a0'; g.fillRect(Math.round(m.x - cx), Math.round(m.y - cy) - 1, m.w, 1); } }
  return S;
}

/* ---------- THE BOT'S HANDS (src/lab.js): what a player sees of him, a reaction late ---------- */
export const PLAN = { react: 0.25, miss: 0.12, missLead: 0.35 };
/* footing: the royal pads and banks (solid), the leaves that are up */
function footings(F) {
  const out = (F.royal || []).map((r, i) => ({ x0: r.x0, x1: r.x1, solid: true, st: i }));
  if (F.bank) out.push({ x0: F.bank[0], x1: F.bank[1], solid: true, st: -1 });
  for (const q of F.pads || []) if (q.sink < 0.3 && !q.slap && !q.shuf) out.push({ x0: q.x - q.w / 2, x1: q.x + q.w / 2, pad: true, firm: q.firm, sink: q.sink, m: q.id });
  return out.sort((a, b) => a.x0 - b.x0);
}
export function frogPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0; mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 400) { mem.seen.clear(); mem.roll.clear(); }
  const react = s.eyes ? 0 : PLAN.react, miss = s.eyes ? 0 : PLAN.miss;
  const key = e.mode + ':' + (e.actN || 0), seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const A = F.A, m = e.mode, side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  const royal = F.royal || [], his = royal[e.tst !== undefined && (m === 'leap' || m === 'crouch') ? e.tst : e.st] || royal[0];
  const onSt = i => i >= 0 && royal[i] && P.x >= royal[i].x0 - 4 && P.x <= royal[i].x1 + 4 && P.y <= royal[i].top + 3;
  const myFoot = () => { if (!P.ground) return null; const fs = footings(F); return fs.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3 && (f.solid ? P.y <= (royal[0] ? royal[0].top + 3 : 1e9) : true)) || null; };
  const lift = frogLiftOn(), open = e.mode === 'dazed' || e.mode === 'flopRest' || e.mode === 'croak' || e.mode === 'bellyUp' || e.mode === 'bellowTell' || (lift && FROG_LIFT_MODES.has(e.mode));   /* (claude/froglift: the bite's eyes, snap, gulp and bloat are his to be cut in) */   /* (claude/frogking2 11-07: the sac while it glows, and belly-up, are the blows to make) */
  out.face = toHim;
  if (F.reel) { out.why = 'reeled in'; return out; }
  /* IN THE WATER (the marsh's drain): to the nearest footing that holds - a leaf that is up or a royal pad - and out onto it */
  if (P.swim) { mem.land = null; const fs = footings(F).filter(f => !f.pad || f.sink < 0.2); const c = fs.sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - P.x) - Math.abs((b.x0 + b.x1) / 2 - P.x))[0];
    const tx = c ? Math.max(c.x0 + 6, Math.min(c.x1 - 6, P.x)) : P.x; out.gx = tx; out.up = true; out.jump = Math.abs(tx - P.x) < 20; out.why = 'out of the water'; return out; }
  /* a shockwave coming along at me: jump it (on a leaf it sinks the leaf) */
  const lowNear = (F.waves || []).some(w => (P.x - w.x) * w.dir > -4 && (P.x - w.x) * w.dir < (P.onPad ? 34 : 30));
  if (lowNear && P.ground) { out.jump = true; out.why = 'jump the wave'; out.gx = P.x; return out; }
  const stHis = royal.indexOf(his), there = onSt(stHis) && m !== 'leap' && m !== 'crouch';
  /* (claude/froglift) SWAT THE FLIES AT HIM: the cloud on me, him on a pad within FK.fly.reach, not gathering or in the air -> face the cloud and swing (or shield) into it.
     PLAN.missLead: some swarms it never thinks to (it walks out of them instead) */
  if (lift && F.swarm && !F.swarm.batted && !F.swarm.scatter && m !== 'crouch' && m !== 'leap' && Math.abs(F.swarm.x - e.x) < FK.fly.reach - 20 && Math.hypot(F.swarm.x - P.x, F.swarm.y - (P.y - 12)) < 30 && !roll('swat' + (e.actN || 0), PLAN.missLead)) {
    const fc = Math.abs(F.swarm.x - P.x) < 4 ? toHim : (Math.sign(F.swarm.x - P.x) || toHim); out.face = fc; out.gx = P.x;
    if (s.shield && !(P.atk >= 0)) { out.block = true; out.why = 'shield the flies at him'; return out; }
    out.atk = P.atk < 0; out.why = 'swat the flies at him'; return out; }
  /* HIS TELLS, read a reaction late (some misread) */
  if (/Tell$|^crouch$/.test(m) && seen() && !roll(key, miss)) {
    const leading = !!F.swarm && !roll('lead' + (e.actN || 0), PLAN.missLead);
    if (m === 'snapTell' && there && leading && Math.abs(P.x - (e.x + (e.face || 1) * 18)) < 30) { out.gx = e.x + (e.face || 1) * 18; out.why = 'hold the flies on his head'; return out; }
    if ((m === 'tongueTell' || m === 'snapTell') && ad < (m === 'snapTell' ? 260 : (F.tongueMax || 175) + 30)) { if (s.shield) { out.block = true; out.why = 'shield the tongue'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the tongue'; return out; } if (s.deflect && e.modeT < 0.3) { out.block = true; out.face = toHim; out.why = 'deflect the tongue on the beat'; return out; } out.jump = P.ground && e.modeT < 0.2; out.gx = P.x; out.why = 'jump the tongue'; return out; }
    if (m === 'spitTell' && ad < 330) { if (s.shield) { out.block = true; out.why = 'shield the spit'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the spit'; return out; } }
    if (m === 'flopTell' && there && ad < 60) { out.gx = Math.max(his.x0 + 6, Math.min(his.x1 - 6, e.x + side * 70)); out.why = 'clear of the flop'; return out; }   /* (on his pad: the leaf-free footing - the wave is jumped where you stand) */
    if (m === 'crouch' && e.tst !== undefined && onSt(e.tst)) { const r = royal[e.tst]; out.gx = Math.abs(P.x - r.x0) > Math.abs(P.x - r.x1) ? r.x0 + 10 : r.x1 - 10; out.why = 'off the spot he leaps for'; return out; } }
  if (m === 'leap' && e.vy > 0 && Math.abs(e.x - P.x) < 50 && P.ground && onSt(stationAt(A, e.x))) { if (s.shield) { out.block = true; out.why = 'shield the landing'; return out; } out.gx = P.x + side * 60; out.why = 'out from under him'; return out; }
  if ((m === 'tongue' || m === 'snap' || m === 'spit') && s.shield && ad < 330) { out.block = true; out.why = 'hold the shield'; return out; }
  if ((m === 'tongue' || m === 'snap' || m === 'spit') && s.ward && ad < 330) { out.ward = true; out.gx = P.x; out.why = 'hold the ward'; return out; }
  /* ON HIS PAD: the fight */
  if (there) {
    if (F.swarm && m !== 'flopTell' && m !== 'flop' && !open && !roll('lead' + (e.actN || 0), PLAN.missLead)) { out.gx = e.x + (e.face || 1) * 18; out.why = 'lead the flies onto him'; return out; }
    if (m === 'flop' && ad < 60) { out.gx = Math.max(his.x0 + 6, Math.min(his.x1 - 6, e.x + side * 70)); out.why = 'clear of the flop'; return out; }
    if (s.rest && !open) { out.gx = e.x + side * 60; out.why = 'catch my breath'; return out; }
    const stand = s.tip ? 20 + s.tip : Math.max(12, (open ? reach * 0.6 : reach - 4)); let gx = e.x - toHim * stand;
    gx = Math.max(his.x0 + 6, Math.min(his.x1 - 6, gx)); if (Math.abs(gx - e.x) < 10) gx = e.x + side * stand;
    out.gx = gx; out.atk = ad < reach + 14 && P.atk < 0 && !F.greedNear && m !== 'flopTell' && m !== 'leap' && m !== 'crouch';
    out.why = open ? 'cut him: ' + m : 'cut him on his pad'; return out; }
  /* CROSSING: leaf to leaf to his pad */
  const goal = his ? (his.x0 + his.x1) / 2 : e.x, dir = Math.sign(goal - P.x) || 1;
  if (!P.ground) { if (mem.land) out.gx = (mem.land.x0 + mem.land.x1) / 2; else out.gx = goal; out.why = 'in the air'; return out; }
  /* he is gathering to leap or in the air: wait where you stand (the lanes reshuffle as he lands) */
  if ((m === 'crouch' || m === 'leap') && !onSt(e.tst)) { const fs0 = footings(F), c0 = fs0.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3); if (c0 && (!c0.pad || c0.firm)) { out.gx = Math.max(c0.x0 + 8, Math.min(c0.x1 - 8, P.x)); out.why = 'wait for him to land'; return out; } }
  mem.land = null;   /* (grounded: a hop that was not ours - a push-hop - never steers by an old landing) */
  const fs = footings(F), cur = fs.find(f => P.x >= f.x0 - 3 && P.x <= f.x1 + 3) || null;
  if (!cur) { out.gx = goal; out.why = 'cross'; return out; }
  const far = dir > 0 ? cur.x1 : cur.x0, ahead = fs.filter(f => f !== cur && (dir > 0 ? f.x0 > cur.x1 - 2 : f.x1 < cur.x0 + 2)).sort((a, b) => dir > 0 ? a.x0 - b.x0 : b.x1 - a.x1);
  const next = ahead[0], gap = next ? (dir > 0 ? next.x0 - cur.x1 : cur.x0 - next.x1) : 1e9;
  /* a leaf is under (the reshuffle): wait on footing that holds; on a sinking leaf, go on or back */
  if (!next || gap > 62) { const back = fs.filter(f => f !== cur && (dir > 0 ? f.x1 < cur.x0 + 2 : f.x0 > cur.x1 - 2)).sort((a, b) => dir > 0 ? b.x1 - a.x1 : a.x0 - b.x0)[0];
    if (cur.pad && !cur.firm && back) { mem.land = back; out.gx = (back.x0 + back.x1) / 2; out.jump = true; out.why = 'back off a sinking leaf'; return out; }
    out.gx = (cur.x0 + cur.x1) / 2; out.why = 'wait for the leaves'; return out; }
  /* on footing that holds, a wave or his tongue coming: wait */
  if (!cur.pad || cur.firm) { if (m === 'flopTell' || (m === 'tongueTell' && ad < 240)) { out.gx = Math.max(cur.x0 + 6, Math.min(cur.x1 - 6, P.x)); out.why = 'wait on firm footing for his blow'; return out; } }
  const take = far - dir * (cur.pad ? 4 : 7);
  if (cur.pad || Math.abs(P.x - take) < 7 || (dir > 0 ? P.x > take : P.x < take)) { mem.land = next; out.gx = (next.x0 + next.x1) / 2; out.jump = true; out.why = next.pad ? (next.firm ? 'hop to a leaf that holds' : 'hop a sinking leaf') : 'hop onto the royal pad'; return out; }
  out.gx = take; out.why = 'to the edge'; return out;
}
