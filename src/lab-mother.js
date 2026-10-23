// src/lab-mother.js - THE MOTHER CAP 2 PLAYED (claude/sporewood2): the boss lab's hands for her fight, as a player plays it. Nothing is opened or grown for the bot:
// it strikes her SEED CAPS (standing on the outer one so the blow takes both and the outer one lifts it), hops to the high cap, runs off its inner edge and PLUNGES
// her knot; open, it cuts her body. It answers her told moves the way their words say: the root lash is jumped (or met up on a cap), the crush's red ring is
// stepped off, a bloom's ring is struck when it is in reach (it becomes a spring spore) or left, her brood is cut down when it comes close, and under the net
// it keeps to the caps and the wall shelves. Reaction comes from the profile through the lab's perception layer (her mode and its clock are read a player's
// reaction late); the marks it reads (a ring's place, a lash's front) are on the screen.
// motherHands(c) -> { swing } with the keys set.   c = { BK, boss, P, k, A, h, f, reach }
const TS = 16;
export function motherHands(c) {
  const { BK, boss: e, P, k, A, f, reach } = c, R = BK.motherCap && BK.motherCap(); if (!R) return { swing: false };
  const floor = A.floor, onFloor = P.ground && P.y > floor - 6, m = e.mode || '', S = R.seeds;
  const go = x => { if (Math.abs(x - P.x) > 3) { k[x > P.x ? 'right' : 'left'] = true; } };
  const jump = (n = 18) => { if ((P.ground || P.onMover) && !(P.labJump > 0)) { BK.press('jump'); P.labJump = n; } };
  const hold = () => { if (P.labJump > 0) { P.labJump--; k.jump = true; } };
  const tired = P.labRest || (P.st || 0) < 14, lashOn = m === 'lashTell' || R.lashes.length > 0, fresh = (P.st || 0) >= Math.min(48, (P.maxSt || 100) * 0.45);   /* (no swing into a told lash: a swing's recovery eats the jump; and a climb wants wind left for the window) */
  let swing = false;
  const done = () => { hold(); if (lashOn && onFloor) swing = false; return { swing }; };
  /* ---- THREATS FIRST ---- */
  /* the root lash: jumped as its front comes (or never met: up on a cap) */
  for (const l of R.lashes) if (onFloor && (P.x - l.x) * l.d > -4 && Math.abs(P.x - l.x) < 58) { jump(16); return done(); }
  if (m === 'lashTell' && onFloor && e.modeT < 0.12 && Math.abs(P.x - e.x) < 60) { jump(14); return done(); }
  /* the crush's ring: off it, away from the wall */
  const cx = R.crushX !== null && R.crushX !== undefined ? R.crushX : (R.crushes.find(q => !q.done) || {}).x;
  if (cx !== undefined && Math.abs(P.x - cx) < 34) { const s = P.x >= cx ? 1 : -1, sd = (P.x + s * 50 > A.x1 - 16 || P.x + s * 50 < A.x0 + 16) ? -s : s; go(cx + sd * 52); if (P.onMover) jump(8); return done(); }
  /* a bloom: struck while it is in reach (a spring spore), else out of its ring */
  for (const b of R.blooms) { const d = Math.hypot(P.x - b.x, P.y - 8 - b.y); if (d > 40) continue;
    if (!tired && Math.abs(P.x - b.x) < reach + 6 && Math.abs(P.y - 10 - b.y) < 20 && P.atk < 0) { P.face = Math.sign(b.x - P.x) || P.face; swing = true; return done(); }
    if (b.live || d < 30) { go(b.x + (P.x >= b.x ? 46 : -46)); return done(); } }
  /* her brood: cut down when it closes */
  const brood = BK.enemies().filter(q => q.alive && q.brood && Math.abs(q.y - P.y) < 24).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
  if (brood && Math.abs(brood.x - P.x) < 50 && m !== 'open') { if (Math.abs(brood.x - P.x) > reach - 2) go(brood.x - (Math.sign(brood.x - P.x) || 1) * (reach - 4)); else if (P.atk < 0 && !tired) { P.face = Math.sign(brood.x - P.x) || 1; swing = true; } return done(); }
  /* ---- HER KNOT OPEN: cut her body ---- */
  if (m === 'open') { const side = P.x < e.x ? -1 : 1, spot = e.x + side * (14 + reach * 0.55);
    if (!P.ground && !P.onMover) { go(spot); if (Math.abs(P.x - e.x) < 14 + reach && P.y > A.floor - 100 && P.atk < 0 && !tired) { P.face = -side; swing = true; } return done(); }   /* (cut her on the way down too) */
    go(spot); if (Math.abs(P.x - spot) < 12 && P.atk < 0 && !tired) { P.face = -side; swing = true; } return done(); }
  /* ---- THE NET (P2): off the floor while it is told or stings ---- */
  const netBad = R.net && (R.net.ph === 'live' || (R.net.ph === 'tell' && R.net.t < 0.7));
  /* ---- THE CLIMB: her seed caps on my side, struck; up them; a plunge on her knot ---- */
  const side = P.x < e.x ? -1 : 1, mine = S.filter(q => Math.sign(q.x + q.w / 2 - e.x) === side).sort((a, b) => Math.abs(b.x - e.x) - Math.abs(a.x - e.x)), low = mine[0], high = mine[1];
  const onCap = q => q && P.onMover && Math.abs(P.onMover.x - q.x) < 1;
  const up = q => q && (q.state === 'up' || (q.state === 'grow' && q.y < q.y0 - q.rise * 0.8));
  const kx = R.knot.x, ky = R.knot.y;
  /* in the air: steer for what the jump was for (a cap, or her knot), and the plunge when her knot is under him */
  if (!P.ground && !P.onMover) { const aim = P.labAim !== undefined ? P.labAim : kx;
    if (R.ready && P.vy > 20 && Math.abs(P.x - kx) < 12 && P.y < ky + 6 && P.y > ky - 70) { k.down = true; if (P.atk < 0) BK.press('atk'); }
    go(aim); return done(); }
  P.labAim = undefined;
  if (R.ready && !tired && fresh) {
    if (high && onCap(high) && up(high)) { /* the high cap: run off its inner edge at her knot */ const edge = side < 0 ? high.x + high.w - 3 : high.x + 3; go(kx); if ((P.x - edge) * -side > -6) { P.labAim = kx; jump(26); } return done(); }
    if (low && onCap(low)) { if (up(low) && up(high)) { P.labAim = high.x + high.w / 2; jump(24); go(P.labAim); } return done(); }   /* (riding the low step up: wait; up, hop to the high one) */
    if (low && high && up(low) && up(high)) { /* the stair is up: onto the low step */ const c = low.x + low.w / 2; go(c); if (Math.abs(P.x - c) < 20) { P.labAim = c; jump(18); } return done(); }
    if (low && low.state === 'bud' && !(low.cd > 0) && !(high && high.cd > 0)) { /* strike: stood on the outer step, facing her - the pair grows and the outer one lifts him */ const spot = low.x + low.w / 2 + side * 4;
      go(spot); if (Math.abs(P.x - spot) < 7 && P.atk < 0) { P.face = -side; swing = true; } return done(); }
  }
  /* nothing to climb (warded, withered, tired): under the net, onto a shelf or a cap; else chip her from beside, out of the lash's start */
  if (netBad && (onFloor || P.ground && P.y > floor - 6)) { const shelfX = P.x < e.x ? A.x0 + 3 * TS : A.x1 - 3 * TS, capUp = S.filter(up).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    const tx = capUp ? capUp.x + capUp.w / 2 : shelfX; go(tx); if (Math.abs(P.x - tx) < 22) jump(18); return done(); }
  if (tired) { const away = e.x + (P.x < e.x ? -110 : 110); go(Math.max(A.x0 + 20, Math.min(A.x1 - 20, away))); return done(); }
  /* her greed (src/boss-greed.js): out of her reach while the reprisal is told, and one blow short of its count outside an opening, as the ground hands do (labGreedStop) */
  const G = BK.greed, out = G ? (G.reach || 60) + (e.w || 20) / 2 : 0;
  if (G && e.greedT > 0 && Math.abs(P.x - e.x) < out + 18) { go(e.x - (Math.sign(e.x - P.x) || 1) * (out + 30)); return done(); }
  const greedy = G && G.open(e) !== true && G.count(e) >= G.limit(e) - 1;
  const spot = e.x + side * (14 + reach * 0.6); go(spot); if (!greedy && Math.abs(P.x - spot) < 14 && P.atk < 0 && f % 3 === 0) { P.face = -side; swing = true; }
  return done();
}
