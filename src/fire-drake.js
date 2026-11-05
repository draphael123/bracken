// src/fire-drake.js - THE FIRE DRAKE, the HEART OF THE MOUNTAIN's first boss (a MINI), as a PURE fight (claude/heartplan, Daniel 11-04 17:28/17:29;
// design: work/claude/lane-done/claude-heartplan.md). GREYBOX: not wired into main.js yet - lane D1 (DRAKEWIRE) writes src/fire-drake-hands.js.
// tools/fire-drake.mjs is its check; tools/fire-drake-lab.mjs its node lab (a first win-rate read before bossLab can see it).
// HEADER (design-standard B1 / B3 / B5 / B10 / B15 / B16):
//   THE SEAL'S GUARDIAN, CHAINED TO IT. Three white-hot chains run from the seal in the middle of the caldera to its collar; their reach is a SCORCHED
//   RING drawn on the floor round the seal (FD.ring by phase). B1 - THE CHAIN RULE: its LUNGE goes straight at you; inside the ring it BITES, outside
//   it the chain SNAPS TAUT and yanks it down on its side: JERKED - the shared OPEN read (B10: gold ring + bar), blows x FD.jerk.mul, one jerk worth at
//   most FD.jerk.cap of its bar (a purse), then a told WARD (B3) at x0.4. Outside the ring it BREATHES fire (a low cone that starts ~30 px from its
//   jaw: UNDER ITS CHIN is safe) and PANTS after (a soft window, x1). Everywhere else its scales turn a blow at FD.hide (>= 0.4, B15) - never 0.
//   ONE NEW MOVE PER PHASE (B5), P2 a different fight (it flies):
//     P1 THREE CHAINS (100-60%)  CLAW RAKE (yellow !), TAIL LASH (red !!, low: jump), FLAME BREATH (red !!), CHAIN LUNGE (red !!),
//                                THE CHAIN SWEEP (red !!: it grips a chain in its jaws and sweeps it LOW along the band just OUTSIDE the ring - the bait spot is not
//                                a safe spot: jump it)
//     P2 TWO CHAINS   (60-30%)   it TEARS a chain (told, the seal cracks), the ring grows; + THE WING GUST + DIVE (hover, a red ring at your feet;
//                                a dive past its ring is jerked out of the air -> JERKED)
//     P3 ONE CHAIN    (30-0%)    it tears another (the caldera erupts); + THE MAGMA SLAM (a wave both ways: jump the crest) and the floor VENTS (told glow)
//   BEATEN, NOT KILLED (rec Q1): at an empty bar it lunges once more, the LAST chain parts, it falls on the seal and the seal SPLITS (scene A, the
//   Demon King). S.done = true; the hands keep it off the normal death path - it carries you in the sky fight.
//   Every told move has its OWN windup pose, release pose and sound (B16: POSE below, tools/fire-drake.mjs proves windup != release).
export const FD = {
  hp: 2600, w: 64, h: 44, head: 30,             // head: the jaw's distance ahead of its body centre (the chain's ring is measured to the JAW)
  hide: 0.5, wardMul: 0.4, tearMul: 0.5, pantMul: 1.0,
  p2: 0.6, p3: 0.3,
  ring: [100, 145, 185],                         // the chain's reach (px from the seal centre to the jaw) by phase. THE BAIT SPOT is past the ring AND past its claw
                                                 // from the chain's end (baitOf): ring + claw.reach - head + 18 = 154 / 199 / 239 px - inside a 32-tile caldera's 248 (the wall band)
  walkV: [44, 48, 54], rest: [0.55, 0.45, 0.4], near: 80,
  claw: { tell: [0.7, 0.6, 0.55], t: 0.18, reach: 66, back: 10, h: 30, dmg: 18, rec: 0.45 },
  tail: { tell: [0.8, 0.7, 0.65], t: 0.25, back: 90, ahead: 40, h: 14, dmg: 20, rec: 0.5 },
  breath: { tell: [1.0, 0.9, 0.85], t: 0.5, tick: 0.3, gap: 30, over: 140, h: 22, dmg: 12, pant: 1.0 },   // two ticks (0, 0.3 s): under its chin, behind it, on a ledge - or a jump timed on the release clears it
  sweep: { tell: [0.8, 0.7, 0.65], t: 0.3, inside: 12, over: 80, h: 12, dmg: 16, rec: 0.55, share: 0.45 },   // THE CHAIN SWEEP: the band from ring - inside to ring + over, low (jump it)
  lunge: { tell: [0.85, 0.8, 0.75], lock: 0.25, v: 420, biteR: 22, dmg: 26, rec: 0.5, share: 0.4, after: 0.2 },   // lock: the lunge's aim holds this long before launch; share / after: its pick share outside the ring (after a jerk)
  jerk: { t: [3.2, 2.8, 2.4], mul: 1.75, cap: 0.15, rise: 0.6, ward: 2.5 },
  tear: { tell: 1.6 },
  dive: { crouch: 0.8, hover: 1.2, ring: 0.9, air: 70, gust: 60, r: 34, h: 24, dmg: 24, rec: 0.6, share: 0.3 },
  slam: { tell: 1.0, t: 0.3, v: 175, crest: 13, clear: 9, dmg: 22, rec: 0.6, every: 3 },
  vent: { every: 3.2, glow: 1.0, t: 0.8, w: 12, h: 60, dmg: 20 },
  beaten: { lunge: 0.7, fall: 1.4 },
};
export const FD_SAY = { wake: 'THE FIRE DRAKE', rule: 'IT IS CHAINED TO THE SEAL. BAIT ITS LUNGE PAST THE SCORCHED RING.', jerked: 'THE CHAIN HOLDS IT', ward: 'ITS SCALES BLAZE',
  tear2: 'IT TEARS A CHAIN - THE SEAL CRACKS', tear3: 'ANOTHER CHAIN GOES - THE MOUNTAIN STIRS', breath: 'GET UNDER ITS CHIN', dive: 'IT TAKES WING', slam: 'JUMP THE MAGMA',
  vent: 'THE FLOOR ERUPTS', beaten: 'THE LAST CHAIN BREAKS', hide: 'SCALES', pant: 'IT PANTS' };
/* B16: the pictures (the art lane draws them; the hands pick by mode). A windup and its release are never the same picture. */
export const POSE = {
  sleep: { body: 'coiled', head: 'down' }, wake: { body: 'rising', head: 'up' }, walk: { body: 'stalk', head: 'low' }, recover: { body: 'stalk', head: 'shake' },
  clawTell: { body: 'rear', leg: 'up', claws: 'glow' }, claw: { body: 'lean', leg: 'swipe' },
  tailTell: { body: 'coil', tail: 'raised', rattle: true }, tail: { body: 'spin', tail: 'sweep' },
  sweepTell: { body: 'crouch', jaw: 'chain', chains: 'gripped' }, sweep: { body: 'twist', chains: 'swept' },
  breathTell: { body: 'rear', neck: 'back', chest: 'glow' }, breath: { body: 'brace', neck: 'out', jaw: 'open' }, pant: { body: 'slump', jaw: 'smoke' },
  lungeTell: { body: 'crouch', wings: 'half', chains: 'glow' }, lunge: { body: 'dash', jaw: 'open' }, jerked: { body: 'onSide', chains: 'taut' }, rise: { body: 'rising', scales: 'blaze' },
  tearTell: { body: 'rear', chains: 'strain', roar: true }, takeoff: { body: 'crouch', wings: 'spread' }, hover: { body: 'air', wings: 'beat' },
  diveTell: { body: 'air', wings: 'fold', head: 'down' }, dive: { body: 'stoop', wings: 'tucked' },
  slamTell: { body: 'rear', legs: 'high', seal: 'glow' }, slam: { body: 'slam', legs: 'down' },
  beaten: { body: 'lunge', chains: 'snap' }, down: { body: 'collapsed', seal: 'split' },
};
const TELLS = new Set(['sweepTell', 'clawTell', 'tailTell', 'breathTell', 'lungeTell', 'tearTell', 'takeoff', 'hover', 'diveTell', 'slamTell']);
export const fdTelling = e => !!e && TELLS.has(e.mode);
export const fdOpen = e => !!e && e.mode === 'jerked';
export const fdSoft = e => !!e && e.mode === 'pant';
export const fdAir = e => !!e && (e.mode === 'hover' || e.mode === 'diveTell' || e.mode === 'dive');
/* THE CALDERA (px): x0/x1 the floor inside the walls, floorY its top, seal the seal's centre x; ledges [[x0, x1, top px above the floor]]; vents [x] (P3) */
export function geom(A, TS = 16) {
  const seal = A.seal !== undefined ? A.seal : (A.x0 + A.x1) / 2;
  return { x0: A.x0, x1: A.x1, floorY: A.floor, seal, TS, ledges: A.ledges || [], vents: A.vents || [seal - 150, seal - 75, seal + 75, seal + 150] };
}
export function newFight(G) {
  return { G, ph: 1, chains: 3, ward: 0, act: 0, restT: 1, last: [], purse: null, waves: [], vents: [], ventT: FD.vent.every, slams: 0, sinceSlam: 0, lastJerk: false, done: false,
    n: { sweep: 0, claw: 0, tail: 0, breath: 0, lunge: 0, bite: 0, jerk: 0, dive: 0, diveJerk: 0, slam: 0, vent: 0, tear: 0 } };
}
export const ringOf = S => FD.ring[S.ph - 1];
/* the body x its chain lets it reach on a side (its jaw at the ring) */
export const bodyMax = (S, side) => S.G.seal + side * (ringOf(S) - FD.head);
export const outside = (S, x, pad = 0) => Math.abs(x - S.G.seal) > ringOf(S) + pad;
export const jawX = e => e.x + e.face * FD.head;
/* where a player stands to bait the lunge on a side: past the ring, and past the claw of a drake standing at its chain's end */
export const baitOf = (S, side) => S.G.seal + side * (ringOf(S) + FD.claw.reach - FD.head + 18);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- ONE FRAME OF IT. heroes: [{ x, y (feet), ground, alive }]; w = the world:
   w.hit([x0, x1, y0, y1], dmg, name, { key, push }) | w.push(dx px a second, for this frame) | w.seal(stage 1..3) | w.music(phase) + number/sound/mark/fx/shake ---------- */
export function stepDrake(e, S, dt, heroes, w) {
  const G = S.G, i = S.ph - 1, P = heroes.find(h => h.alive) || heroes[0];
  S.ward = Math.max(0, S.ward - dt); e.ward = S.ward;
  stepWaves(S, dt, w); if (S.ph === 3 && !S.done) stepVents(S, dt, P, w);
  if (e.mode === 'sleep' || e.mode === 'down') return;
  e.modeT -= dt;
  const face = () => { if (P) e.face = Math.sign(P.x - e.x) || e.face; };
  const lo = bodyMax(S, -1), hi = bodyMax(S, 1), fy = G.floorY;
  /* BEATEN: whatever it was doing (never mid-air: it lands first) */
  if (e.hp <= 0 && !e.beaten && !fdAir(e)) { e.beaten = true; e.mode = 'beaten'; e.modeT = FD.beaten.lunge; face(); S.waves = []; S.vents = []; w.sound('roar'); w.mark('!!'); return; }
  switch (e.mode) {
    case 'wake': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = 0.8; w.number(e.x, fy - 70, FD_SAY.rule, '#ffd36b'); } return;
    case 'walk': {
      face();
      /* THE TEARS: only from its feet and free (never through a jerk, never in the air) */
      if (S.ph === 1 && e.hp <= e.maxHp * FD.p2) { tearStart(e, S, w, 2); return; }
      if (S.ph === 2 && e.hp <= e.maxHp * FD.p3) { tearStart(e, S, w, 3); return; }
      if (P && Math.abs(P.x - e.x) > FD.near * 0.6) e.x = clamp(e.x + Math.sign(P.x - e.x) * FD.walkV[i] * dt, lo, hi);
      S.restT -= dt; if (S.restT > 0 || !P || !P.alive) return;
      pick(e, S, P, w); return; }
    case 'tearTell': if (e.modeT <= 0) { S.ph = e.tearTo; e.phase = S.ph; S.chains = 4 - S.ph; S.n.tear++; w.seal(S.ph - 1); w.music(S.ph); w.sound('snap'); w.shake(10);
        w.number(e.x, fy - 72, S.ph === 2 ? FD_SAY.tear2 : FD_SAY.tear3, '#ff6b6b'); e.mode = 'recover'; e.modeT = 0.6; } return;
    case 'clawTell': if (e.modeT <= 0) { e.mode = 'claw'; e.modeT = FD.claw.t; e.hitKey = 'cl' + S.act; w.sound('claw'); } return;
    case 'claw': { const a = e.x + e.face * -FD.claw.back, b = e.x + e.face * FD.claw.reach;
      w.hit([Math.min(a, b), Math.max(a, b), fy - FD.claw.h, fy + 2], FD.claw.dmg, 'claw', { key: e.hitKey, push: e.face * 140, yellow: true });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = FD.claw.rec; } return; }
    case 'tailTell': if (e.modeT <= 0) { e.mode = 'tail'; e.modeT = FD.tail.t; e.hitKey = 'tl' + S.act; w.sound('tail'); } return;
    case 'tail': { const a = e.x - e.face * FD.tail.back, b = e.x + e.face * FD.tail.ahead;
      w.hit([Math.min(a, b), Math.max(a, b), fy - FD.tail.h, fy + 2], FD.tail.dmg, 'tail', { key: e.hitKey, push: -e.face * 160 });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = FD.tail.rec; } return; }
    case 'sweepTell': if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = FD.sweep.t; e.hitKey = 'sw' + S.act; w.sound('chainSweep'); } return;
    case 'sweep': { const sd = e.sweepSide, a = G.seal + sd * (ringOf(S) - FD.sweep.inside), b = G.seal + sd * (ringOf(S) + FD.sweep.over);
      w.hit([Math.min(a, b), Math.max(a, b), fy - FD.sweep.h, fy + 2], FD.sweep.dmg, 'sweep', { key: e.hitKey, push: sd * 150 });
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = FD.sweep.rec; } return; }
    case 'breathTell': if (e.modeT <= 0) { e.mode = 'breath'; e.modeT = FD.breath.t; e.tick = 0; w.sound('breath'); } return;
    case 'breath': {
      e.tick -= dt; if (e.tick <= 0) { e.tick += FD.breath.tick; e.ticks = (e.ticks || 0) + 1; const a = jawX(e) + e.face * FD.breath.gap, b = jawX(e) + e.face * (ringOf(S) + FD.breath.over);
        w.hit([Math.min(a, b), Math.max(a, b), fy - FD.breath.h, fy + 2], FD.breath.dmg, 'breath', { key: 'br' + S.act + '.' + e.ticks }); }
      if (e.modeT <= 0) { e.mode = 'pant'; e.modeT = FD.breath.pant; e.openT0 = e.modeT; w.number(e.x, fy - 60, FD_SAY.pant, '#ffd36b'); } return; }
    case 'pant': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = FD.rest[i] * 0.5; } return;
    case 'lungeTell': if (e.modeT > FD.lunge.lock && P) e.lockX = P.x;   /* the aim follows you while the chains glow, then holds: a told launch */
      if (e.modeT <= 0) {
        /* the lunge goes to where you stood as it launched: its body to put the jaw on you, its chain clamps the body */
        const tx = e.lockX, side = Math.sign(tx - G.seal) || e.face, want = tx - e.face * FD.head;
        e.jerk = outside(S, tx); e.lungeTo = e.jerk ? bodyMax(S, side) : clamp(want, lo, hi); e.mode = 'lunge'; e.hitKey = 'lu' + S.act; S.n.lunge++; w.sound('lunge'); }
      return;
    case 'lunge': {
      const d = e.lungeTo - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), FD.lunge.v * dt);
      if (!e.jerk) { const j = jawX(e); w.hit([j - FD.lunge.biteR, j + FD.lunge.biteR, fy - 28, fy + 2], FD.lunge.dmg, 'bite', { key: e.hitKey, push: e.face * 180 }); }
      if (Math.abs(e.lungeTo - e.x) < 0.5) { e.x = e.lungeTo;
        if (e.jerk) jerkStart(e, S, w, false); else { S.n.bite++; e.mode = 'recover'; e.modeT = FD.lunge.rec; } }
      return; }
    case 'jerked': if (e.modeT <= 0) { S.lastJerk = true; e.mode = 'rise'; e.modeT = FD.jerk.rise; S.purse = null; w.sound('roar'); } return;
    case 'rise': if (e.modeT <= 0) { S.ward = FD.jerk.ward; e.ward = S.ward; w.fx('ward', e.x, fy); w.number(e.x, fy - 70, FD_SAY.ward, '#c8d8e8'); e.mode = 'walk'; S.restT = FD.rest[i]; } return;
    /* THE WING GUST + DIVE (P2+): up, hovering over its spot beating the wings (a gust pushes you off the seal), then a red ring at your feet - the dive.
       Past its chain's ring the chain catches it in the air: it crashes at the ring's end, JERKED */
    case 'takeoff': e.air = Math.min(FD.dive.air, (e.air || 0) + 140 * dt); if (e.modeT <= 0) { e.mode = 'hover'; e.modeT = FD.dive.hover; w.sound('wings'); } return;
    case 'hover': e.air = FD.dive.air; if (P) w.push(Math.sign(P.x - G.seal || 1) * FD.dive.gust);
      if (e.modeT <= 0) { e.mode = 'diveTell'; e.modeT = FD.dive.ring; e.lockX = P ? clamp(P.x, G.x0 + 12, G.x1 - 12) : e.x; w.mark('!!'); w.number(e.lockX, fy - 40, FD_SAY.dive, '#ff6b6b'); } return;
    case 'diveTell': if (e.modeT <= 0) { e.mode = 'dive'; e.hitKey = 'dv' + S.act; S.n.dive++; e.jerk = outside(S, e.lockX); e.lungeTo = e.jerk ? bodyMax(S, Math.sign(e.lockX - G.seal) || 1) : e.lockX; w.sound('dive'); } return;
    case 'dive': {
      const d = e.lungeTo - e.x; e.x += Math.sign(d) * Math.min(Math.abs(d), 380 * dt); e.air = Math.max(0, e.air - 260 * dt);
      if (Math.abs(e.lungeTo - e.x) < 0.5 && e.air <= 0) { e.x = e.lungeTo; e.air = 0;
        if (e.jerk) { S.n.diveJerk++; jerkStart(e, S, w, true); }
        else { w.hit([e.x - FD.dive.r, e.x + FD.dive.r, fy - FD.dive.h, fy + 2], FD.dive.dmg, 'dive', { key: e.hitKey }); w.shake(8); e.mode = 'recover'; e.modeT = FD.dive.rec; } }
      return; }
    case 'slamTell': if (e.modeT <= 0) { e.mode = 'slam'; e.modeT = FD.slam.t; S.n.slam++; S.slams++; w.sound('slam'); w.shake(9);
        for (const dir of [-1, 1]) S.waves.push({ x: e.x + dir * 20, dir, key: 'sl' + S.act + dir });
        /* the slam wakes the vents: the nearest glows at once */
        S.ventT = Math.min(S.ventT, 0.4); } return;
    case 'slam': if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = FD.slam.rec; } return;
    case 'recover': if (e.modeT <= 0) { e.mode = 'walk'; S.restT = FD.rest[i]; } return;
    case 'beaten': if (e.modeT <= 0 && !e.fallen) { e.fallen = true; e.modeT = FD.beaten.fall; S.chains = 0; w.sound('snap'); w.seal(3); w.number(e.x, fy - 72, FD_SAY.beaten, '#ffffff'); w.shake(14); }
      else if (e.fallen && e.modeT <= 0) { e.mode = 'down'; e.x = G.seal; S.done = true; } return;
  }
}
function tearStart(e, S, w, to) { e.mode = 'tearTell'; e.modeT = FD.tear.tell; e.tearTo = to; S.act++; w.mark('!!'); w.sound('strain'); }
function jerkStart(e, S, w, fromAir) {
  const i = S.ph - 1; e.mode = 'jerked'; e.modeT = FD.jerk.t[i]; e.openT0 = e.modeT; S.purse = e.maxHp * FD.jerk.cap; S.n.jerk++; S.lastJerkN = S.n.jerk;
  w.sound('twang'); w.shake(fromAir ? 12 : 8); w.fx('open', e.x, S.G.floorY); w.number(e.x, S.G.floorY - 64, FD_SAY.jerked, '#ffd36b');
}
/* THE CHOICE: close - claw or tail (tail if you are behind it); you outside its ring - lunge or breath (P2+ a share of dives); never three of a kind */
function pick(e, S, P, w) {
  const i = S.ph - 1, d = P.x - e.x, ad = Math.abs(d), behind = Math.sign(d) !== e.face, out = outside(S, P.x, -8), r = Math.random();
  let m;
  /* in its claw's reach it ALWAYS claws or lashes (a hero standing at its jaw is not baiting, ring or no ring); past the claw and the ring it lunges, breathes, dives */
  if (ad < FD.claw.reach + 10 || (ad < FD.near && !out)) m = behind ? (r < 0.8 ? 'tail' : 'claw') : (r < 0.55 ? 'claw' : 'tail');
  else if (S.ph >= 2 && r < FD.dive.share) m = 'dive';
  else if (S.ph === 3 && S.sinceSlam >= FD.slam.every) m = 'slam';
  else { const r2 = Math.random(); m = r < (S.lastJerk ? FD.lunge.after : FD.lunge.share) ? 'lunge' : r2 < FD.sweep.share ? 'sweep' : 'breath'; }   /* (a drake that was just jerked is warier of its chain: it breathes more) */
  if (S.last.length >= 2 && S.last[0] === m && S.last[1] === m) m = m === 'lunge' ? 'breath' : 'lunge';
  S.last.unshift(m); S.last.length = Math.min(S.last.length, 3); S.act++; S.sinceSlam = m === 'slam' ? 0 : (S.sinceSlam || 0) + 1; S.lastJerk = false; if (m === 'claw' || m === 'tail' || m === 'breath' || m === 'sweep') S.n[m]++;
  e.face = Math.sign(d) || e.face;
  switch (m) {
    case 'claw': e.mode = 'clawTell'; e.modeT = FD.claw.tell[i]; w.mark('!'); w.sound('clawTell'); break;
    case 'tail': e.mode = 'tailTell'; e.modeT = FD.tail.tell[i]; w.mark('!!'); w.sound('rattle'); break;
    case 'sweep': e.mode = 'sweepTell'; e.modeT = FD.sweep.tell[i]; e.sweepSide = Math.sign(P.x - S.G.seal) || 1; w.mark('!!'); w.sound('chainGrip'); break;
    case 'breath': e.mode = 'breathTell'; e.modeT = FD.breath.tell[i]; w.mark('!!'); w.sound('inhale'); w.number(e.x, S.G.floorY - 60, FD_SAY.breath, '#ff9a5c'); break;
    case 'lunge': e.mode = 'lungeTell'; e.modeT = FD.lunge.tell[i]; e.lockX = P.x; w.mark('!!'); w.sound('chains'); break;
    case 'dive': e.mode = 'takeoff'; e.modeT = FD.dive.crouch; e.air = 0; w.mark('!!'); w.sound('takeoff'); break;
    case 'slam': e.mode = 'slamTell'; e.modeT = FD.slam.tell; w.mark('!!'); w.sound('slamTell'); w.number(e.x, S.G.floorY - 60, FD_SAY.slam, '#ff6b6b'); break;
  }
}
/* THE MAGMA WAVES (P3): two crests running out along the floor from the slam; a hero whose feet are low as one passes is struck */
function stepWaves(S, dt, w) {
  const G = S.G;
  for (const v of S.waves) { v.x += v.dir * FD.slam.v * dt; if (v.x < G.x0 || v.x > G.x1) v.done = true;
    else w.hit([v.x - FD.slam.crest, v.x + FD.slam.crest, G.floorY - FD.slam.clear, G.floorY + 2], FD.slam.dmg, 'wave', { key: v.key }); }
  S.waves = S.waves.filter(v => !v.done);
}
/* THE VENTS (P3): every FD.vent.every s the vent nearest you GLOWS (told), then erupts */
function stepVents(S, dt, P, w) {
  const G = S.G; S.ventT -= dt;
  if (S.ventT <= 0 && P && G.vents.length) { S.ventT = FD.vent.every; const vx = G.vents.slice().sort((a, b) => Math.abs(a - P.x) - Math.abs(b - P.x))[0];
    S.vents.push({ x: vx, t: FD.vent.glow, key: 'vn' + (S.n.vent++) }); w.sound('hiss'); }
  for (const v of S.vents) { v.t -= dt; if (v.t <= 0 && v.t > -FD.vent.t) w.hit([v.x - FD.vent.w, v.x + FD.vent.w, G.floorY - FD.vent.h, G.floorY + 2], FD.vent.dmg, 'vent', { key: v.key }); if (v.t <= -FD.vent.t) v.done = true; }
  S.vents = S.vents.filter(v => !v.done);
}
/* ---------- A BLOW ON IT (B15) -> [what lands, the word or null]. It is never 0 while the fight is on. ---------- */
export function takeBlow(e, S, dmg) {
  if (e.mode === 'down' || e.mode === 'sleep' || e.beaten) return [0, null];
  if (S.ward > 0 || e.mode === 'rise') return [Math.max(1, Math.round(dmg * FD.wardMul)), 'WARDED'];
  if (e.mode === 'jerked') { const d = Math.round(dmg * FD.jerk.mul), left = S.purse ?? Infinity; if (d >= left) { S.purse = 0; e.modeT = 0; return [Math.max(1, Math.round(left)), null]; } S.purse = left - d; return [d, null]; }
  if (e.mode === 'pant') return [Math.max(1, Math.round(dmg * FD.pantMul)), null];
  if (e.mode === 'tearTell') return [Math.max(1, Math.round(dmg * FD.tearMul)), FD_SAY.hide];
  return [Math.max(1, Math.round(dmg * FD.hide)), FD_SAY.hide];
}
/* B10's shared read: 'open' (jerked: gold, bar on its time), 'soft' (pant), 'ward', or null */
export function readOf(e) {
  if (!e || !e.alive || e.beaten) return null;
  if (e.ward > 0) return { st: 'ward', k: Math.max(0, Math.min(1, e.ward / FD.jerk.ward)) };
  if (e.mode === 'jerked') return { st: 'open', k: Math.max(0, Math.min(1, e.modeT / (e.openT0 || 1))) };
  if (e.mode === 'pant') return { st: 'soft', k: Math.max(0, Math.min(1, e.modeT / FD.breath.pant)) };
  return null;
}

/* ---------- THE BOT (src/lab.js after D1; tools/fire-drake-lab.mjs now): what a player reads, a reaction late - the ring on the floor, its tells,
   the dive's red ring, the crests, the vents' glow - and THE RULE: stand just outside the ring to bait the lunge, get under its chin for the breath ---------- */
export const PLAN = { react: 0.25, miss: 0.1, cut: 0.35 };
/* s = { P: { x, y (feet, floorY = ground), ground, face, atk }, e, S, reach, t, mem, rng, v2, dodge (has a roll), parry (has an on-beat guard) }
   -> { gx, face, atk, jump, dodge, block, why } */
export function fdPlan(s) {
  const { P, e, S, reach } = s, G = S.G, out = { gx: null, face: P.face, atk: false, jump: false, dodge: false, block: false, why: '' };
  const mem = s.mem || {}, rng = s.rng || Math.random, t = s.t || 0;
  mem.seen = mem.seen || new Map(); mem.roll = mem.roll || new Map(); if (mem.seen.size > 600) { mem.seen.clear(); mem.roll.clear(); }
  const seenFor = (key, d = s.v2 ? 0.08 : PLAN.react) => { if (!mem.seen.has(key)) mem.seen.set(key, t); return t - mem.seen.get(key) >= d; };
  const roll = (key, pr) => { if (!mem.roll.has(key)) mem.roll.set(key, rng() < pr); return mem.roll.get(key); };
  const lo = G.x0 + 8, hi = G.x1 - 8, cl = x => clamp(x, lo, hi), half = FD.w / 2, ring = ringOf(S);
  const side = Math.sign(P.x - G.seal) || 1, kx = e.x, dx = Math.abs(kx - P.x), hitR = reach + half - 4;
  const baitX = cl(baitOf(S, side)), canBait = Math.abs(baitX - G.seal) > ring + FD.claw.reach - FD.head + 6;
  const swing = () => { out.face = Math.sign(kx - P.x) || out.face; out.atk = P.atk < 0; };
  const jump = (why) => { out.jump = P.ground; out.gx = P.x; mem.jumpT = t; mem.jumpX = P.x; out.why = why; return out; };
  if (e.mode === 'down' || e.beaten) { out.gx = P.x; out.why = 'beaten'; return out; }
  /* 0. a jump is carried through */
  if (!P.ground && mem.jumpT !== undefined && t - mem.jumpT < 0.6) { out.gx = mem.jumpX; out.why = 'in the air'; return out; }
  /* 1. THE CRESTS (P3): jump one as it reaches you */
  for (const v of S.waves) { const d = (P.x - v.x) * v.dir; if (d > -4 && d < FD.slam.v * 0.16 + FD.slam.crest + 4 && seenFor(v.key, s.v2 ? 0.05 : 0.15) && !(!s.v2 && roll(v.key + 'm', PLAN.miss))) return jump('jump the crest'); }
  /* 1b. THE MAGMA SLAM: close to it as the forelegs come down - jump the crest as it leaves its feet */
  if (e.mode === 'slamTell' && dx < 70 && e.modeT < 0.14 && seenFor('sl' + S.act, s.v2 ? 0.05 : PLAN.react) && !(!s.v2 && roll('sl' + S.act + 'm', PLAN.miss))) return jump('jump the slam');
  /* 2. A VENT's glow under you: off it */
  for (const v of S.vents) if (v.t > 0 && Math.abs(P.x - v.x) < FD.vent.w + 10 && seenFor(v.key, 0.2)) { out.gx = cl(P.x + (P.x >= v.x ? 1 : -1) * (FD.vent.w + 22)); out.why = 'off the vent'; return out; }
  /* 3. THE DIVE: its red ring at your feet - off it (outward past its chain if that is near: it is jerked) */
  if (e.mode === 'diveTell' || e.mode === 'hover' || e.mode === 'takeoff') {
    if (e.mode === 'diveTell' && seenFor('dv' + S.act, s.v2 ? 0.08 : 0.2) && Math.abs(P.x - e.lockX) < FD.dive.r + 10 && !outside(S, e.lockX)) {
      const away = cl(e.lockX + (P.x >= e.lockX ? 1 : -1) * (FD.dive.r + 18)); out.gx = canBait && Math.abs(baitX - P.x) < Math.abs(away - P.x) + 30 ? baitX : away; out.why = 'off the dive ring'; return out; }
    out.gx = canBait ? baitX : P.x; out.why = 'it flies: outside the ring'; return out; }
  /* 4. ITS TELLS (a reaction late, some misread) */
  if (fdTelling(e) || e.mode === 'claw' || e.mode === 'tail' || e.mode === 'breath' || e.mode === 'lunge' || e.mode === 'sweep') {
    const key = 'a' + S.act + e.mode.replace(/Tell$/, ''), miss = !s.v2 && roll(key + 'm', PLAN.miss);
    if (seenFor(key) && !miss) {
      const f = e.face || 1, rel = (P.x - kx) * f;
      if (e.mode === 'tailTell' || e.mode === 'tail') { const inBox = rel > -FD.tail.back - 8 && rel < FD.tail.ahead + 8;
        if (inBox && (e.mode === 'tail' || e.modeT < 0.2)) return jump('jump the tail');
        if (inBox) { out.gx = P.x; out.why = 'the tail: ready'; return out; } }
      if (e.mode === 'clawTell' || e.mode === 'claw') { const inBox = rel > -FD.claw.back - 6 && rel < FD.claw.reach + 8;
        if (inBox && s.parry && !roll(key + 'p', 0.35) && (e.mode === 'claw' || e.modeT < 0.14)) { out.block = true; out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'guard the claw'; return out; }
        if (inBox) { out.gx = cl(kx + f * (FD.claw.reach + 20)); if (Math.abs(out.gx - kx) < FD.claw.reach) out.gx = cl(kx - f * (FD.claw.reach + 20)); out.why = 'out of the claw'; return out; } }
      if (e.mode === 'sweepTell' || e.mode === 'sweep') { const sd = e.sweepSide || 1, rr = (P.x - G.seal) * sd, inBand = rr > ring - FD.sweep.inside - 8 && rr < ring + FD.sweep.over + 8;
        if (inBand && (e.mode === 'sweep' || e.modeT < 0.12)) return jump('jump the chain');
        if (inBand) { out.gx = P.x; out.why = 'the chain sweep: ready'; return out; } }
      if (e.mode === 'breathTell' || e.mode === 'breath') {
        const behind = rel < -4, under = rel > -4 && rel < FD.head + FD.breath.gap - 12;
        if (behind || under) { out.gx = P.x; out.why = behind ? 'behind it: the breath misses' : 'under its chin'; return out; }
        const chin = cl(kx + f * (FD.head + 8)); if (e.mode === 'breathTell' && Math.abs(chin - P.x) < Math.max(0, e.modeT - 0.05) * 85) { out.gx = chin; out.why = 'under its chin'; return out; }
        if (e.mode === 'breathTell' && e.modeT < 0.1) return jump('jump the breath');
        out.gx = P.x; out.why = 'too far for its chin: ready to jump'; return out; }
      if (e.mode === 'lungeTell') {
        if (outside(S, P.x, 10)) { out.gx = P.x; out.face = Math.sign(kx - P.x) || 1; out.why = 'outside the ring: let it come'; return out; }
        if (canBait && Math.abs(baitX - P.x) < e.modeT * 85 + 6) { out.gx = baitX; out.why = 'out past the ring'; return out; }
        if (e.modeT < 0.2 && s.dodge && P.ground) { out.dodge = true; out.gx = cl(P.x - f * 30); out.why = 'roll the bite'; return out; }
        out.gx = cl(P.x + (P.x >= kx ? 1 : -1) * 40); out.why = 'out of the bite\'s line'; return out; }
    } }
  /* 5. OPEN (jerked) or SOFT (panting): strike it */
  if (fdOpen(e) || fdSoft(e)) { const sd = half + Math.max(6, reach - 8); let sx = cl(kx + side * sd); out.gx = sx; if (dx < hitR + 4) swing(); out.why = fdOpen(e) ? 'strike it: jerked' : 'strike it: panting'; return out; }
  if (S.ward > 0 || e.mode === 'rise' || e.mode === 'tearTell') { out.gx = canBait ? baitX : cl(kx + side * 90); out.why = 'its ward: off it'; return out; }
  /* 6. IT WALKS: a cut now and then (its scales turn most of it), else stand just outside the ring - the bait */
  if (e.mode === 'walk' || e.mode === 'recover') {
    if (e.mode === 'recover' && dx < hitR + 30 && roll('cut' + S.act, PLAN.cut)) { out.gx = cl(kx + side * (half + Math.max(6, reach - 8))); if (dx < hitR) swing(); out.why = 'a cut while it recovers'; return out; }
    out.gx = canBait ? baitX : cl(kx + side * Math.max(hitR + 20, 90)); out.face = Math.sign(kx - P.x) || 1; out.why = canBait ? 'the bait: just outside the ring' : 'stand off it'; return out; }
  out.gx = canBait ? baitX : P.x; out.why = 'wait'; return out;
}
