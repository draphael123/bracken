/* src/frog-king.js - THE BULLFROG KING, REWORKED (claude/marsh2; scratch/brief-first2.md 2, scratch/brief-thinbosses.md FROG KING + !! 10-14 LATE).
   He was 180 hp and a pushover (100% with flasks, 12-37 s). The court is his pond now, and every move he has is the marsh's rule turned on you:
     PHASE 1  THE COURT      (100% -> 75%)  the shallow pond, his old kit + THE TONGUE GRAB, THE BELLY-FLOP and THE FLY SWARM
     PHASE 2  HIS POND        (75% -> 50%)  he croaks the pond DEEP: the court's lily pads are the only way over it, and they SINK under you (the
                                            level's rule); + THE CROAK RIPPLE (it tips the pads: ride one and it throws you onto him) and THE SLAP
                                            (every pad goes under at once)
     PHASE 3  THE PIT         (50% -> 0)    he pulls his own plug (kept: claude/firsthour): the bed is a pit, his leap for water sticks in the mud
   HIS MOVES, each its own windup + release pose (src/redraw/frogking.js frames 7-16, B16), each told, each with its answer (B10, B14, B15):
     THE TONGUE GRAB   tongueTell (yellow !) - a shield bites his tongue (DAZED); taken, the tongue REELS you to him over the water: in the shallows
                       you are dropped at his feet in the wet, over his deep pond you go IN (a splash: the hazard's cost, back on the bank)
     THE BELLY-FLOP    flopTell (red !!) - he rears up and comes down on his belly: a SHOCKWAVE runs the court both ways (jump it; no shield
                       turns it); in his deep pond it also sends every lily pad under
     THE FLY SWARM     swarmTell (quiet: the flies throw nothing) - he spits a cloud of marsh flies that trails you; a breath later his tongue
                       snaps at it (snapTell, yellow !). LEAD THEM ONTO HIM - stand by his head as the tongue comes - and he BITES HIMSELF: DAZED
     THE CROAK RIPPLE  rippleTell (red !! - the ring along the bank is jumped) - his throat swells and a ring runs out over the pond; every pad it
                       crosses TIPS (gold rim) and throws whoever is on it, or lands on it, up and over to him: come down on him and he is
                       KNOCKED FLAT (FROM ABOVE), open
     THE SLAP          poundTell (red !!) - he slaps the water and the court's pads all go under for a moment: off the pads, onto a bank
   His openings stay the old ones too: the leap left late (BELLY-FLOP, DAZED), the breath choked on a shield, his croaking throat, the mud.
   Outside them THE HIDE turns half a blow (B15: 0.5x, never immune). Numbers here; the machine is updateFrog in src/main.js. */

export const FK = {
  hp: 740,
  p2At: 0.75,                      /* his pond goes deep (phase 2) */
  drainAt: 0.5,                    /* he pulls the plug (phase 3) - tools/firsthour.mjs asks for half */
  throat: 1.5,                     /* his croaking throat pays x1.5 (flat on his belly x2) */
  take: 0.075,                     /* one opening is worth at most this share of him, then he shakes it off (was FROG_TAKE 0.3 at 180 hp) */
  tongue: { tell: [0.55, 0.45, 0.45], live: 0.55, max: [125, 170, 150], reel: 330, reelMax: 0.6, dmg: 16 },
  flop: { tell: 0.75, air: 0.5, rest: 0.85, sp: 175, life: 2.4, dmg: 18, sink: 1.2 },
  swarm: { tell: 0.6, spit: 0.35, life: 3.0, lag: 0.5, orbit: 13, snapTell: 0.85, snapLive: 0.45, reach: 240, bite: 34, open: 2.6 },
  ripple: { tell: 1.0, sp: 150, tip: 1.4, vy: -470, flingT: 1.4, dmg: 12, open: 2.6 },
  pound: { tell: 0.8, sink: 1.5 },
  leapLift: 300,                   /* his leap at you hangs: 700 px/s/s in the air, not 1000 (a 1.1 s arc, was 0.76) */
  gap: [1.0, 0.85, 0.75],          /* his rest between blows, per phase */
};

/* the court's pads: the movers of kind 'pad' inside the arena */
export const courtPads = (movers, A) => movers.filter(m => m.kind === 'pad' && m.x + m.w / 2 > A.x0 && m.x + m.w / 2 < A.x1);

/* THE COURT'S OWN STATE: the swarm, the ripples, the tipped pads and the hero's ride. One per level load. */
export function makeFrogCourt(ctx) {
  const S = { swarm: null, ripples: [], hist: [], fling: null, reel: null, n: { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0 } };
  const P = () => ctx.P(), R = Math.round;
  S.reset = () => { S.swarm = null; S.ripples = []; S.hist = []; S.fling = null; S.reel = null; S.n = { selfBites: 0, flings: 0, fromAbove: 0, grabs: 0, dunks: 0 }; };
  /* the flies: a cloud that trails the hero by FK.swarm.lag s (the history of where he stood) */
  S.spitSwarm = e => { const p = P(); S.swarm = { x: e.x + e.face * 20, y: e.y - 18, t: FK.swarm.life, eaten: false, ph: 0 }; S.hist = [{ x: p.x, y: p.y - 12, t: 0 }]; };
  S.step = (dt, e) => {
    const p = P(), now = ctx.time();
    S.hist.push({ x: p.x, y: p.y - 12, t: now }); while (S.hist.length > 2 && now - S.hist[1].t > FK.swarm.lag) S.hist.shift();
    if (S.swarm) { const sw = S.swarm, h = S.hist[0]; sw.ph += dt * 9; sw.t -= dt;
      const k = Math.min(1, dt * 5); sw.x += (h.x - sw.x) * k; sw.y += (h.y - sw.y) * k;
      if (Math.random() < dt * 6) ctx.buzz(); if (sw.t < -2.5 || !e || !e.alive) S.swarm = null; }
    /* THE RIPPLE runs out along the bank both ways; over the water it tips each pad it crosses */
    for (const r of S.ripples) { r.life -= dt; r.x += r.dir * FK.ripple.sp * dt;
      const A = ctx.arena(); if (!A || r.x < A.x0 + 4 || r.x > A.x1 - 4) r.life = 0;
      for (const m of courtPads(ctx.movers(), A)) { const c = m.x + m.w / 2; if (!r.tipped.has(m) && Math.abs(c - r.x) < m.w / 2 + 2) { r.tipped.add(m); m.tipT = FK.ripple.tip; m.tipDir = Math.sign(r.ex - c) || -r.dir; ctx.ring(c, m.y0 + 2, 16, '#ffd36b'); if (p.onMover === m) S.throwOff(m); } }
      const pool = ctx.pool(), overWater = pool && !pool.shallow && !pool.dry && r.x > pool.x0 && r.x < pool.x1;
      if (!overWater && !p.dead && p.ground && !p.onMover && Math.abs(p.x - r.x) < 9 && p.y > r.y - 4 && !r.hit) { r.hit = true; ctx.damage(r.x - r.dir * 20, FK.ripple.dmg, { unblockable: true }); } }
    S.ripples = S.ripples.filter(r => r.life > 0);
    for (const m of courtPads(ctx.movers(), ctx.arena() || { x0: -1e9, x1: 1e9 })) { if (m.tipT > 0) m.tipT -= dt; if (m.slapT > 0) { m.slapT -= dt; m.sink = 1; } }
    /* THE RIDE: thrown off a tipped pad, the throw carries you over to him (your keys steer it a little) */
    if (S.fling) { S.fling.t -= dt; if (!p.dead && !p.ground) p.vx = S.fling.vx; if (S.fling.t <= 0 || p.ground || p.dead) { S.fling = null; p.frogFlung = false; } }
  };
  S.ripple = e => { const A = ctx.arena(); for (const d of [-1, 1]) S.ripples.push({ x: e.x + d * 18, y: e.y, dir: d, life: 3, ex: e.x, tipped: new Set(), hit: false }); };
  /* a tipped pad throws: whoever stands on it as the ripple passes, or lands on it while it is tipped */
  S.throwOff = m => { const p = P(), e = ctx.boss(); if (!e || p.dead) return;
    const g = 1000, vy = FK.ripple.vy, T = 2 * -vy / g + 0.12, dx = (e.x - p.x), vx = Math.max(-330, Math.min(330, dx / T));
    p.onMover = null; p.ground = false; p.vy = vy; p.vx = vx; p.plunge = false; p.canCut = true; p.frogFlung = true; m.tipT = 0; m.cd = 0.6;
    S.fling = { vx, t: FK.ripple.flingT }; S.n.flings++; ctx.ring(m.x + m.w / 2, m.y0 + 3, 22, '#ffd36b'); ctx.number(p.x, p.y - 26, 'THE PAD THROWS YOU', '#ffd36b'); ctx.spring(); };
  S.slap = () => { for (const m of courtPads(ctx.movers(), ctx.arena())) { m.slapT = FK.pound.sink; m.tipT = 0; } };
  S.show = () => ({ swarm: S.swarm ? { x: S.swarm.x, y: S.swarm.y, t: S.swarm.t } : null, ripples: S.ripples.map(r => ({ x: r.x, dir: r.dir })), fling: !!S.fling, reel: !!S.reel, n: S.n });
  S.draw = (g, cx, cy, time) => {
    if (S.swarm) { const sw = S.swarm; for (let i = 0; i < 11; i++) { const a = sw.ph + i * 2.39, rr = FK.swarm.orbit * (0.5 + ((i * 37) % 10) / 20); const x = R(sw.x + Math.cos(a) * rr - cx), y = R(sw.y + Math.sin(a * 1.3) * rr * 0.6 - cy);
      g.fillStyle = '#1a1a14'; g.fillRect(x, y, 2, 1); g.fillStyle = (i & 1) ? '#cfe8ff' : '#8fd160'; g.fillRect(x + (i & 1 ? -1 : 2), y - 1, 1, 1); } }
    for (const r of S.ripples) { const x = R(r.x - cx), y = R(r.y - cy), a = Math.max(0, Math.min(1, r.life / 1.2));
      g.globalAlpha = 0.85 * a; g.fillStyle = '#dff4ff'; g.fillRect(x - 1, y - 9, 2, 8); g.fillStyle = '#7fc4e0'; g.fillRect(x - 3 * r.dir - 1, y - 6, 2, 5); g.fillRect(x - 6 * r.dir - 1, y - 3, 2, 3); g.globalAlpha = 1; }
    for (const m of courtPads(ctx.movers(), ctx.arena() || { x0: -1e9, x1: 1e9 })) if (m.tipT > 0) { const x = R(m.x - cx), y = R(m.y - cy), f = Math.sin(time * 18) > 0;
      g.fillStyle = f ? '#ffd36b' : '#fff1a0'; g.fillRect(x - 1, y - 1, m.w + 2, 1); g.fillRect(x - 1, y + m.h, m.w + 2, 1); g.fillRect(x + (m.tipDir > 0 ? m.w - 3 : 0), y - 4, 3, 3); }
  };
  return S;
}

/* ---------- THE BOT'S HANDS (src/lab.js): what a player sees of him, a reaction late ---------- */
export const PLAN = { react: 0.25, miss: 0.12, missLead: 0.3, missRide: 0.5 };
export function frogPlan(s) {
  const { P, e, F, reach } = s, out = { gx: null, face: P.face, atk: false, jump: false, block: false, dodge: false, down: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0; mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 400) { mem.seen.clear(); mem.roll.clear(); }
  const react = s.eyes ? 0 : PLAN.react, miss = s.eyes ? 0 : PLAN.miss;
  const key = e.mode + ':' + (e.actN || 0), seen = () => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= react; };
  const roll = (k, p) => { if (!mem.roll.has(k)) mem.roll.set(k, rng() < p); return mem.roll.get(k); };
  const A = F.A, lo = A.x0 + 12, hi = A.x1 - 12, clamp = x => Math.max(lo, Math.min(hi, x)), side = Math.sign(P.x - e.x) || 1, ad = Math.abs(P.x - e.x), toHim = Math.sign(e.x - P.x) || 1;
  const pond = F.pond, deep = pond && pond.deep, inPond = x => !!pond && x > pond.x0 && x < pond.x1;
  const bankOf = x => !pond ? x : x - pond.x0 < pond.x1 - x ? pond.x0 - 12 : pond.x1 + 12;
  const dry = x => { x = clamp(x); return deep && inPond(x) ? bankOf(x) : x; };
  const open = e.mode === 'dazed' || e.mode === 'croak' || e.mode === 'mired', m = e.mode;
  const leading = !!F.swarm && !roll('lead' + (mem.swarmN = F.swarm ? (mem.swarmN || 0) + (mem.hadSwarm ? 0 : 1) : mem.swarmN || 0), PLAN.missLead); mem.hadSwarm = !!F.swarm;
  out.face = toHim;
  if (F.reel) { out.why = 'reeled in'; return out; }
  /* IN HIS DEEP POND (it drains you while you swim): to the nearer bank, up, and out */
  if (P.swim) { const ex = pond ? (P.x - pond.x0 < pond.x1 - P.x ? pond.x0 - 6 : pond.x1 + 6) : P.x; out.gx = ex; out.up = true; out.jump = Math.abs(ex - P.x) < 34; out.why = 'swim out of his pond'; return out; }
  /* IN THE AIR OFF A TIPPED PAD: steer over him and come down on him with the plunge */
  if (F.fling || P.flung) { out.gx = e.x; if (P.vy > 0 && Math.abs(P.x - e.x) < 24 && P.y < e.y - 18) { out.down = true; out.atk = P.atk < 0; out.why = 'plunge on him from the pad'; } else out.why = 'ride the pad over'; return out; }
  /* a shockwave or a ripple coming along the ground at me: jump it */
  const lowNear = (F.waves || []).concat(F.ripples || []).some(w => (P.x - w.x) * w.dir > -4 && (P.x - w.x) * w.dir < 30);
  if (lowNear && P.ground) { out.jump = true; out.why = 'jump the wave'; out.gx = P.x; return out; }
  /* ON A PAD: the ripple coming over the water tips it - stay on it and ride; the slap or a long stand: off to the bank */
  if (P.onPad) {
    if (m === 'poundTell' || m === 'pound' || m === 'flopTell' || (P.padSink || 0) > 0.35) { out.gx = bankOf(P.x); out.jump = P.ground; out.why = 'off the pads'; return out; }
    if ((F.ripples || []).some(w => (P.x - w.x) * w.dir > 0 && Math.abs(P.x - w.x) < 150)) { out.gx = P.x; out.why = 'wait for the ripple on the pad'; return out; }
    if (deep && inPond(P.x)) { out.gx = e.x; out.jump = P.ground; out.why = 'hop the pads'; return out; } }
  /* HIS TELLS, read a reaction late (some misread) */
  if (/Tell$|^crouch$/.test(m) && seen() && !roll(key, miss)) {
    if (m === 'snapTell' && leading && Math.abs(P.x - (e.x + (e.face || 1) * 18)) < 30) { out.gx = clamp(e.x + (e.face || 1) * 18); out.why = 'hold the flies on his head'; return out; }
    if ((m === 'tongueTell' || m === 'snapTell') && ad < (m === 'snapTell' ? 260 : (F.tongueMax || 170) + 30)) { if (s.shield) { out.block = true; out.why = 'shield the tongue'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the tongue (the ember dome)'; return out; } if (s.deflect && e.modeT < 0.3) { out.block = true; out.face = toHim; out.why = 'deflect the tongue on the beat'; return out; } out.jump = P.ground && e.modeT < 0.22; out.gx = P.x; out.why = 'jump the tongue'; return out; }
    if (m === 'spitTell' && ad < 230) { if (s.shield) { out.block = true; out.why = 'shield the spit'; return out; } if (s.ward) { out.ward = true; out.gx = P.x; out.why = 'ward the spit'; return out; } out.gx = dry(e.x + side * 36); out.why = 'under the spit'; return out; }
    if (m === 'inhaleTell' && ad < 200) { if (s.shield) { out.block = true; out.why = 'choke him on the shield'; return out; } if (s.ward && ad < 70) { out.ward = true; out.gx = P.x; out.why = 'let him pull me onto the ward'; return out; } out.gx = dry(e.x + side * 220); out.why = 'away from the breath'; return out; }
    if (m === 'flopTell') { out.gx = dry(e.x + side * 100); out.why = 'clear of the flop'; return out; }
    if (m === 'rippleTell') { if (deep && F.pads && F.pads.length && ad > 110 && !roll('rideR' + (e.actN || 0), PLAN.missRide)) {
        const pad = F.pads.filter(q => q.sink < 0.25 && !q.slap).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; if (pad && Math.abs(pad.x - P.x) < 80) { out.gx = pad.x; out.jump = P.ground && !P.onPad && Math.abs(pad.x - P.x) < 46; out.why = 'onto a pad for the ripple'; return out; } }
      out.why = 'ready to jump the ripple'; out.gx = P.ground ? P.x : null; return out; }
    if (m === 'poundTell') { if (P.onPad || inPond(P.x)) { out.gx = bankOf(P.x); out.jump = P.ground; } out.why = 'off the pads before the slap'; return out; }
    if (m === 'crouch' && !e.vault) { out.gx = P.x; out.why = 'stand where he leaps for'; return out; } }
  /* the leap: be where he leapt for at take-off, gone the moment he is up (or shield the landing) */
  if (m === 'leap' && !e.vault) { if (s.shield && Math.abs(e.x - P.x) < 60 && e.vy > 120) { out.block = true; out.why = 'shield the landing'; return out; } if (s.ward && Math.abs(e.x - P.x) < 60 && e.vy > 120) { out.ward = true; out.wardHold = true; out.gx = P.x; out.why = 'ward the landing'; return out; } out.gx = dry(P.x + (ad > 90 && Math.abs(e.vx || 0) > 60 ? -Math.sign(e.vx) : side) * 80); out.jump = P.ground && inPond(P.x); out.why = 'leave the spot (away while he is low, under him while he is high)'; return out; }   /* (out of the shallows by a jump: wading is slow) */   /* he overshoots the spot he leapt for: go under him, toward where he took off */
  if (m === 'inhale' && ad < 200) { if (s.shield || (s.deflect && ad < 44)) { out.block = true; out.face = toHim; out.why = 'choke him'; return out; } if (s.ward && ad < 70) { out.ward = true; out.wardHold = ad < 40; out.gx = P.x; out.why = 'choke him on the ward'; return out; } out.gx = dry(e.x + side * 230); out.why = 'pulling away'; return out; }
  if ((m === 'tongue' || m === 'snap') && s.shield && ad < 260 && !(leading && m === 'snap')) { out.block = true; out.why = 'tongue: shield'; return out; }
  if ((m === 'tongue' || m === 'snap' || m === 'spit') && s.ward && ad < 260 && !(leading && m === 'snap')) { out.ward = true; out.gx = P.x; out.why = 'hold the ward'; return out; }
  if (m === 'flop' || m === 'flopRest') { if (ad < 60) { out.gx = dry(e.x + side * 100); out.why = 'clear of the flop'; return out; } }
  /* THE FLIES: lead them onto him - stand at his head while the tongue is coming */
  if (leading && !open && m !== 'flopTell' && m !== 'flop' && m !== 'crouch' && m !== 'leap' && m !== 'inhale' && m !== 'inhaleTell') {
    let gx = clamp(e.x + (e.face || 1) * 18); if (deep && inPond(gx)) gx = clamp(e.x - (e.face || 1) * 18);
    out.gx = gx; out.why = 'lead the flies onto him'; return out; }
  /* his openings: cut him */
  if (open) { const stand = s.tip ? 20 + s.tip : Math.max(10, reach * 0.6); out.gx = dry(e.x - toHim * stand); out.atk = ad < reach + 18 && P.atk < 0 && e.modeT > 0.15; out.why = 'cut him: ' + m; return out; }
  /* a hopper of his in reach: sweep it */
  if (F.add && P.atk < 0) { out.face = Math.sign(F.add.x - P.x) || P.face; out.down = !F.add.air && P.ground; out.atk = true; out.gx = null; out.why = 'sweep his hopper'; return out; }
  if (s.rest) { out.gx = dry(e.x + side * 110); out.why = 'catch my breath'; return out; }
  /* close in and cut, a blow short of his greed */
  const stand = s.tip ? 20 + s.tip : Math.max(14, reach - 4); out.gx = clamp(e.x - toHim * stand);
  if (deep && inPond(out.gx)) { out.gx = bankOf(P.x); out.why = 'his pond: wait on the bank'; return out; }
  if (inPond(out.gx) && !inPond(e.x)) { const b = bankOf(out.gx); if (Math.abs(b - e.x) < reach + 22) out.gx = b; }   /* a player fights him from the bank, not from the shallows that slow him */
  out.atk = ad < reach + 12 && P.atk < 0 && !F.greedNear && (m === 'idle' || m === 'land' || m === 'hop' || m === 'croak3' || m === 'swarm' || m === 'ripple' || m === 'pound' || m === 'croak2');
  out.why = 'close in';
  return out;
}
