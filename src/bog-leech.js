// src/bog-leech.js - THE BOG LEECH (claude/fenroad2; scratch/brief-fenroad2-1022.md LANE B, Daniel 10-22 approved the rec live: "maybe another fitting SWAMP FOE";
// the leech of brief-marsh3-1020: it latches on and drains until shaken off with a roll). THE FEN ROAD's one new foe, a general water foe:
//   ent('leech', x, y) - x its column, y the WATER's surface row (it lurks a hand under it, by the boards). PURE: main.js gives it X (below) and runs it.
//   IT LURKS: under the biting water by the boards - two pale eyes and a slow ripple are all of it, and nothing you swing finds it (take = 0).
//   IT WAKES ON THE BOARDS: a section within its reach BOWING under a hero or GOING UNDER (src/fen-road-hands.js astir), or a hero in its water - then a
//     TOLD SURFACING (it rears out of the water, mouth ringed, a red !!: the ripple ring opens where it is) and THE LUNGE: an arc at where you stand.
//   IT LATCHES: the lunge that meets you (no roll on) fastens on - a small bite, then a QUIET DRAIN (A13: the shared drain, src/drain.js - health off the
//     bar, no stagger, no knock) while it hangs on you. ROLL (DODGE) TO SHAKE IT OFF: it is thrown off onto the boards. It lets go sated after LEECH.sated s.
//   OUT OF THE WATER IT IS WEAK: a lunge that misses lands it on the boards, writhing (x2 damage, LEECH.flop s), and a shaken-off one the same; then it
//     flips back into its water. Struck as it surfaces it is knocked back under (a blow there is its answer as much as a roll is).
// X = { hero(), heroes(), surfaceAt(x) -> y px | null, solidAt(x, y) (px, standable), astir(x, r) -> true when a section within r px is bowing under a hero or
//   has just gone under, inWater(pp) (a hero swimming), rolling(pp) (a roll/dodge on), latch(e, pp) / unlatch(e, pp, why), bite(e, pp, dmg), mark(e, txt, col),
//   ring(x, y, r, col), sfx, hint(id, msg) }
export const LEECH = {
  hp: 12, w: 12, h: 8, reach: 72, swimReach: 90, tell: 0.45, lungeT: 0.32, lungeVy: -250, g: 900, maxVx: 210,
  bite: 4, drain: 0.035, sated: 7, flop: 1.5, home: 0.55, cd: 2.2, weak: 2, latchR: 12, lead: 0.8,
};
export const LEECH_SAY = { latched: 'A LEECH: ROLL TO SHAKE IT OFF', shaken: 'SHAKEN OFF', sated: 'IT DROPS OFF, FAT', knocked: 'KNOCKED BACK UNDER', out: 'OUT OF THE WATER: CUT IT' };
export const LEECH_HINT = 'A BOG LEECH HAS YOU. IT DRAINS UNTIL YOU ROLL: DODGE TO SHAKE IT OFF, THEN CUT IT ON THE BOARDS.';
/* THE POSE IDS (the art lane's contract): 0 LURK (eyes and the back of it at the waterline) 1 REAR (the told surfacing: up out of the water, the ringed mouth open)
   2 LUNGE (stretched long through the air) 3 LATCHED (curled, its mouth fast on you) 4 FLOP (on the boards, writhing) 5 hurt */
export const LEECH_POSE = { lurk: 0, rear: 1, lunge: 2, latched: 3, flop: 4, hurt: 5 };
export const newLeech = e => Object.assign(e, { hx: e.x, hy: e.y, mode: 'lurk', modeT: 0, cd: 0.2 + (Math.floor(e.x) % 5) * 0.08, noGrav: true, vx: 0, vy: 0, host: null, latchT: 0, bubT: 0, tgt: null });
const surf = (e, X) => { const s = X.surfaceAt(e.hx); return s === null || s === undefined ? e.hy : s; };
/* ONE FRAME. Everything it does to a hero goes through X */
export function stepLeech(e, dt, X) {
  const L = LEECH, S = X.sfx || {}; e.modeT -= dt; e.cd -= dt; e.bubT -= dt;
  const sy = surf(e, X);
  switch (e.mode) {
    case 'rear': {   /* THE TOLD SURFACING: up out of the water facing its mark, the ring opening round it */
      e.y = sy - 2; if (e.tgt && !e.tgt.dead) e.face = Math.sign(e.tgt.x - e.x) || e.face;
      if (e.bubT <= 0) { e.bubT = 0.12; X.ring(e.x, sy, 5 + Math.random() * 7, '#ff9a8a'); }
      if (e.modeT <= 0) { const T = e.tgt && !e.tgt.dead ? e.tgt : null; if (!T) { e.mode = 'lurk'; e.cd = L.cd; break; }
        /* aimed where you will be (your pace led, as an archer leads) at chest height when it arrives: a swimmer is met low, a hero on the boards high */
        const tx = T.x + Math.max(-90, Math.min(90, (T.vx || 0))) * L.lungeT * L.lead, ty = T.y - 12;
        e.mode = 'lunge'; e.modeT = 2; e.vx = Math.max(-L.maxVx, Math.min(L.maxVx, (tx - e.x) / L.lungeT)); e.vy = Math.max(-320, (ty - e.y - L.g * L.lungeT * L.lungeT / 2) / L.lungeT); S.splash && S.splash(); }
      break; }
    case 'lunge': {   /* THE LUNGE: an arc at where you stood; it fastens on what it meets, lands on the boards, or falls back in */
      const px = e.x, py = e.y; e.vy += L.g * dt; e.x += e.vx * dt; e.y += e.vy * dt; e.face = Math.sign(e.vx) || e.face;
      for (const H of X.heroes()) { if (H.dead || X.rolling(H)) continue; if (Math.abs(H.x - e.x) < L.latchR && e.y > H.y - 30 && e.y < H.y + 4 && !H.leech) {
        e.mode = 'latched'; e.host = H; e.latchT = 0; H.leech = e; X.bite(e, H, L.bite); X.latch(e, H); X.mark(e, LEECH_SAY.latched, '#ff6b6b'); X.hint('leech', LEECH_HINT); S.squelch ? S.squelch() : S.splash && S.splash(); break; } }
      if (e.mode !== 'lunge') break;
      if (e.vy > 0 && X.solidAt(e.x, e.y + 1)) { e.mode = 'flop'; e.modeT = L.flop; e.y = Math.floor((e.y + 1) / 16) * 16; e.vx = 0; e.vy = 0; X.mark(e, LEECH_SAY.out, '#8fd160'); break; }
      if (e.vy > 0 && e.y > sy + 6) { e.mode = 'lurk'; e.cd = L.cd; e.x = px; e.y = sy + 6; e.vx = 0; e.vy = 0; X.ring(e.x, sy, 10, '#9fb3a6'); S.splash && S.splash(); break; }
      if (e.modeT <= 0) { e.mode = 'home'; e.modeT = L.home; }
      void py; break; }
    case 'latched': {   /* ON YOU: it rides your back and drains; a roll throws it off onto the boards */
      const H = e.host; e.latchT += dt;
      if (!H || H.dead || H.leech !== e) { if (H && H.leech === e) H.leech = null; X.unlatch(e, H, 'gone'); e.host = null; e.mode = 'home'; e.modeT = L.home; break; }
      e.x = H.x - (H.face || 1) * 3; e.y = H.y - 10; e.face = H.face || 1;
      if (X.rolling(H)) { H.leech = null; X.unlatch(e, H, 'shaken'); e.host = null; e.mode = 'flop'; e.modeT = L.flop; e.vx = 0; e.vy = 0; e.y = H.y; e.x = H.x - (H.face || 1) * 14; if (!X.solidAt(e.x, e.y + 1)) e.x = H.x; X.mark(e, LEECH_SAY.shaken, '#8fd160'); S.splash && S.splash(); break; }
      if (e.latchT >= L.sated) { H.leech = null; X.unlatch(e, H, 'sated'); e.host = null; e.mode = 'home'; e.modeT = L.home; X.mark(e, LEECH_SAY.sated, '#ffd36b'); break; }
      break; }
    case 'flop': {   /* ON THE BOARDS: writhing, weak; then it flips back into its water */
      if (!X.solidAt(e.x, e.y + 1)) { e.vy = Math.min(300, e.vy + L.g * dt); e.y += e.vy * dt; if (e.y > sy + 6) { e.mode = 'lurk'; e.cd = L.cd; e.y = sy + 6; e.vy = 0; break; } }
      if (e.modeT <= 0) { e.mode = 'home'; e.modeT = L.home; }
      break; }
    case 'home': {   /* back to its place under the boards in a flip */
      const k = Math.max(0, Math.min(1, 1 - e.modeT / L.home)); e.x += (e.hx - e.x) * Math.min(1, dt * 7); e.y = e.y + (sy + 6 - e.y) * Math.min(1, dt * 6) - Math.sin(k * Math.PI) * 1.5;
      if (e.modeT <= 0) { e.mode = 'lurk'; e.cd = L.cd; e.x = e.hx; e.y = sy + 6; X.ring(e.x, sy, 9, '#9fb3a6'); S.splash && S.splash(); }
      break; }
    default: {   /* LURK: a hand under the surface by the boards; a slow ripple; it wakes on the boards bowing or sinking near it, or a hero in its water */
      e.mode = 'lurk'; e.x += (e.hx + Math.sin((e.modeT || 0) * 0.7 + e.hx) * 3 - e.x) * Math.min(1, dt * 2); e.y = sy + 6;
      if (e.bubT <= 0) { e.bubT = 1.1 + Math.random() * 0.8; X.ring(e.x, sy, 4, '#6a8a70'); }
      if (e.cd > 0) break;
      let T = null, bd = 1e9;
      for (const H of X.heroes()) { if (H.dead || H.leech) continue; const d = Math.abs(H.x - e.hx);
        const wake = (X.inWater(H) && d < L.swimReach && Math.abs(H.y - sy) < 60) || (d < L.reach && H.y <= sy + 2 && sy - H.y < 40 && X.astir(e.hx, L.reach));
        if (wake && d < bd) { bd = d; T = H; } }
      if (T) { e.mode = 'rear'; e.modeT = L.tell; e.tgt = T; e.x = Math.max(e.hx - L.reach * 0.6, Math.min(e.hx + L.reach * 0.6, T.x - Math.sign(T.x - e.hx || 1) * 26)); e.face = Math.sign(T.x - e.x) || 1;
        X.mark(e, '!!', '#ff6b6b'); X.ring(e.x, sy, 12, '#ff9a8a'); S.tell ? S.tell(true) : null; S.bubble ? S.bubble() : S.splash && S.splash(); }
    }
  }
}
/* A BLOW ON A LEECH: the damage multiplier (0 = it finds nothing: under the water, or on you). Struck as it surfaces it is knocked back under */
export function leechTake(e) {
  if (e.mode === 'lurk' || e.mode === 'latched') return 0;
  if (e.mode === 'rear') { e.mode = 'home'; e.modeT = LEECH.home; e.tgt = null; return 1; }
  if (e.mode === 'flop' || e.mode === 'home') return LEECH.weak;
  return 1;
}
export const leechShown = e => e.mode !== 'lurk';
export const leechFrame = e => e.hurtT > 0 && e.mode !== 'latched' ? LEECH_POSE.hurt : e.mode === 'rear' ? LEECH_POSE.rear : e.mode === 'lunge' || e.mode === 'home' ? LEECH_POSE.lunge : e.mode === 'latched' ? LEECH_POSE.latched : e.mode === 'flop' ? LEECH_POSE.flop : LEECH_POSE.lurk;
/* ---------- GREYBOX SHEET (the art lane draws it: LEECH_POSE is the contract) - a fat dark-olive leech, ringed segments, a pale belly, a round sucker mouth ringed with teeth ---------- */
export function bakeLeech(canvas, flipX, whiten) {
  const CW = 24, CH = 16, ax = 12, ay = 15, frames = [];
  const C = { body: '#3e4a2a', bodyL: '#5a6a3a', bodyD: '#262e1a', belly: '#8a8a5a', ring: '#c06060', mouth: '#2a0e0e', eye: '#e8e0a0', out: '#141a0c' };
  const r = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  const draw = fn => { const [c, g] = canvas(CW, CH); g.imageSmoothingEnabled = false; fn(g); frames.push(c); };
  /* a body of n segments from (x, y) along (dx, dy) per segment, thickness th */
  const body = (g, x, y, n, dx, dy, th, mouth) => { for (let i = 0; i < n; i++) { const sx = x + dx * i, sy = y + dy * i; r(g, sx - 1, sy - th, 3, th, i % 2 ? C.body : C.bodyL); r(g, sx - 1, sy - 1, 3, 1, C.belly); r(g, sx - 1, sy - th, 3, 1, C.bodyD); }
    const hx = x + dx * n, hy = y + dy * n; r(g, hx - 1, hy - th - 1, 3, th + 1, C.bodyL); if (mouth) { r(g, hx + Math.sign(dx || 1), hy - th, 2, th, C.ring); r(g, hx + Math.sign(dx || 1), hy - th + 1, 2, Math.max(1, th - 2), C.mouth); }
    r(g, hx - 1, hy - th, 1, 1, C.eye); };
  draw(g => { body(g, ax - 6, ay - 1, 5, 2.4, 0, 3, false); });                                                   // 0 LURK (the back of it at the waterline)
  draw(g => { body(g, ax - 4, ay, 6, 1.0, -1.8, 4, true); });                                                     // 1 REAR: up out of the water, mouth open
  draw(g => { body(g, ax - 10, ay - 4, 8, 2.6, -0.3, 3, true); });                                                // 2 LUNGE: stretched long
  draw(g => { body(g, ax - 4, ay - 2, 4, 1.4, -1.6, 5, true); r(g, ax - 6, ay - 4, 3, 3, C.bodyD); });            // 3 LATCHED: curled, fast on you
  draw(g => { body(g, ax - 7, ay - 1, 6, 2.2, Math.sin(1) * 0.6, 3, true); r(g, ax - 2, ay - 6, 1, 1, '#ffd36b'); r(g, ax + 3, ay - 7, 1, 1, '#ffd36b'); });   // 4 FLOP: writhing on the boards
  draw(g => { body(g, ax - 6, ay - 1, 5, 2.4, -0.6, 4, true); r(g, ax - 6, ay - 6, 12, 1, '#ffffff'); });           // 5 hurt
  const L = frames.map(flipX), white = frames.map(c => whiten(c));
  return { R: frames, L, white: { R: white, L: white.map(flipX) }, ax, ay, w: LEECH.w, h: LEECH.h };
}
