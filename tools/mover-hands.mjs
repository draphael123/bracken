/* tools/mover-hands.mjs - THE LEVEL PILOT RIDES MOVERS (claude/pilotmovers, 2026-10-18). The play bot (src/playtest.js makeBot) stops a walk-off on a mover but cannot WAIT FOR ONE:
   at a gap it jumps whether a bench / yard / swinging boom is there or not, and it jumps off a ride whenever the deck ends. On the Flotilla that was 21 deaths in 3 level-1 pilot runs,
   every one a fall into the bilge at the rowing benches (cols 93-159) and the rigging yards (cols 289-375). This is the hands tools/flotilla-route.mjs gave the seven heroes, made
   generic: a hands function the LEVEL PILOT (tools/level1-pilot.mjs) calls before the bot. TOOL CODE ONLY - no game or level change.
     step(goalX) -> false (not mine: the bot walks) | true (mine: I set every key this frame)
   - ON TILES with a gap ahead and a mover that can bring the far side: walk to the lip, WAIT, and jump when the mover's predicted top (position + its per-frame motion over the
     flight) is where the jump arrives. A mover well below is stepped off onto. Nothing in reach: false (the bot's plain gap jump).
   - ON A MOVER: stand still (the mover carries you: main.js matches its dx / dy), go to the deck's far edge, and jump to the next mover or ledge when it is level and in reach.
   - IN THE AIR after its jump: hold the jump 18 frames, steer over the target, brake over it.
   Movers it rides: benches, yards and the plain back-and-forth / up-and-down platforms (swings and wheels only with o.swings: the bot's own ride rules did better on them - kings 3 -> 5 deaths with the hands). Not: carts, pads, lifts, growcaps, buckets (their own pilots / the bot's rules). */
export const MOVER_HANDS = `
const makeMoverHands = (BK, T, o) => {
  o = o || {}; const TS = 16, JR = o.jump || 64, AV = JR / 0.7;
  const JF = [0,3,6,9,12,15,18,21,24,27,30,33,36,39,42], JO = [0,-14,-25,-33,-39,-43,-44,-44,-43,-40,-34,-26,-14,-1,14];
  const offAt = t => { for (let i = 1; i < JF.length; i++) if (t <= JF[i]) return JO[i - 1] + (JO[i] - JO[i - 1]) * (t - JF[i - 1]) / (JF[i] - JF[i - 1]); return JO[JO.length - 1]; };
  const SOL = new Set([T.SOLID, T.CRATE, T.PALISADE, T.PORT, T.CLIMB, T.SOFT, T.ICE, T.WEB]);
  const tile = (tx, ty) => (tx < 0 || tx >= BK.L.W) ? T.SOLID : (ty < 0 || ty >= BK.L.H) ? T.AIR : BK.L.grid[ty * BK.L.W + tx];
  const solid = (tx, ty) => SOL.has(tile(tx, ty)), stand = (tx, ty) => solid(tx, ty) || [T.ONEWAY, T.PLANK, T.SHELF].includes(tile(tx, ty));
  const rideable = m => !!m && m.w > 0 && !m.ghost && !m.gone && m.done !== 'gone' && !(m.sink > 0.55) && !m.spring && (m.flot || !m.kind || (o.swings && (m.kind === 'swing' || m.kind === 'wheel')));
  const S = { air: 0, tgt: null, wait: 0, walk: false };
  const none = () => { const K = BK.keys; K.left = K.right = K.up = K.down = K.jump = false; };
  const resolve = (t, k) => t.m ? { l: t.m.x + (t.m.dx || 0) * k, r: t.m.x + (t.m.dx || 0) * k + t.m.w, y: t.m.y + (t.m.dy || 0) * k } : t;
  const gapOf = (t, P, dir) => dir > 0 ? t.l - P.x : P.x - t.r;
  /* the footings ahead of the lip: every rideable mover near, and the first ledge */
  const targetsAhead = (P, dir, lipX, fy) => {
    const out = [];
    for (const m of BK.movers()) { if (!rideable(m) || m === P.onMover) continue;
      const cx = m.x + m.w / 2; if ((cx - P.x) * dir < -m.w || Math.abs(cx - P.x) > 14 * TS + 40 || m.y - P.y < -120 || m.y - P.y > 260) continue;
      out.push({ m }); }
    const c0 = Math.floor(lipX / TS);
    for (let k = 1; k <= 7; k++) { const c = c0 + dir * k; let best = null;
      for (let r = fy - 4; r <= fy + 3; r++) if (stand(c, r) && !solid(c, r - 1) && !solid(c, r - 2) && (best === null || Math.abs(r - fy) < Math.abs(best - fy))) best = r;
      if (best !== null) { let w = 1; while (w < 4 && stand(c + dir * w, best) && !solid(c + dir * w, best - 1)) w++; const a = c * TS, b = (c + dir * (w - 1)) * TS;
        out.push({ l: Math.min(a, b), r: Math.max(a, b) + TS, y: best * TS, ledge: true }); break; } }
    return out;
  };
  /* ready when a jump started now ARRIVES on it: near enough across, level (or below) at the arrival frame */
  const ready = (t, P, dir) => {
    const g0 = gapOf(resolve(t, 0), P, dir), tA = Math.max(8, Math.min(44, Math.round(60 * (Math.max(0, g0) + 8) / AV))), T2 = resolve(t, tA), g = gapOf(T2, P, dir), dy = T2.y - P.y;
    if (g > JR - 8 || g < -(T2.r - T2.l) - 4) return { ok: false };
    if (dy > 36) return { ok: g <= 3 && S.wait > 300, step: true, g, dy };      /* well below: walk off over it */
    if (dy < -40 && !t.m) return { ok: false };
    const lead = T2.y - (P.y + offAt(tA));
    return { ok: t.ledge ? dy > -40 : (lead > -8 && lead < 10), g, dy };
  };
  const step = (goalX) => {
    const P = BK.P, K = BK.keys; if (P.dead > 0 || P.swim || P.climb || P.fly || BK.state !== 'play') { S.air = 0; return false; }
    if (S.air > 0) {      /* in flight after a jump of mine */
      none(); S.air++; const T2 = S.tgt ? resolve(S.tgt, 0) : null;
      if ((P.ground && S.air > 5) || S.air > 90 || !T2) { S.air = 0; S.tgt = null; return false; }
      K.jump = !S.walk && S.air < 20; const mid = (T2.l + T2.r) / 2;
      if (P.x < T2.l + 6) K.right = true; else if (P.x > T2.r - 6) K.left = true; else if (Math.abs(P.x - mid) > 4 && P.vy < 0) K[mid > P.x ? 'right' : 'left'] = true;
      return true; }
    const dir = Math.sign(goalX - P.x); if (!dir || Math.abs(goalX - P.x) < 10 || !P.ground) return false;
    const on = P.onMover ? (rideable(P.onMover) ? P.onMover : null) : null; if (P.onMover && !on) return false;
    const fx = Math.floor(P.x / TS), fy = Math.floor((P.y + 1) / TS);
    let lipX;
    if (on) lipX = dir > 0 ? on.x + on.w - 6 : on.x + 6;
    else {
      if (stand(fx + dir, fy) || stand(fx + dir, fy + 1) || stand(fx + dir * 2, fy) || stand(fx + dir * 2, fy + 1)) {   /* floor goes on: look for the lip only a few tiles on */
        let c = fx, n = 0; while (n < 6 && (stand(c + dir, fy) || stand(c + dir, fy + 1))) { c += dir; n++; }
        if (n >= 6) return false;
        if (!(!stand(c + dir * 2, fy) && !stand(c + dir * 2, fy + 1))) return false;
        lipX = c * TS + 8 + dir * 3;
      } else lipX = P.x;
    }
    const cands = targetsAhead(P, dir, lipX, fy); if (!cands.length || (!on && !cands.some(c => c.m))) return false;     /* a plain gap with no mover in it: the bot's own jump */
    cands.sort((a, b) => Math.max(0, gapOf(resolve(a, 0), P, dir)) - Math.max(0, gapOf(resolve(b, 0), P, dir)));
    none();
    let pick = null, info = null; for (const c of cands) { const r = ready(c, P, dir); if (r.ok) { pick = c; info = r; break; } }
    const atLip = Math.abs(P.x - lipX) <= 3 || (lipX - P.x) * dir < 0;
    if (pick) {
      if (info.step || (info.g <= 2 && info.dy >= -4)) { K[dir > 0 ? 'right' : 'left'] = true; if (info.step) { S.tgt = pick; S.air = 1; S.walk = true; S.wait = 0; } return true; }   /* over it already, or its edge touches the lip: step on / off */
      if (atLip) { K[dir > 0 ? 'right' : 'left'] = true; BK.press('jump'); K.jump = true; S.tgt = pick; S.air = 1; S.walk = false; S.wait = 0; return true; } }
    if (!atLip) K[lipX > P.x ? 'right' : 'left'] = true; else S.wait++;      /* not yet: to the lip, then wait (a mover carries the hero; standing still is riding it) */
    return true;
  };
  return { step, active: () => S.air > 0 };
};
`;
