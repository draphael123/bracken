// src/drowned-king2.js - THE DROWNED KING 2 (claude/keepfloods, OPUS greybox, 11-06; plan-water-1105 item 8, brief-keep2 items 2-3 + Daniel's '!! 10-16').
// Behind KF_SHIPS (src/keep-floods.js): flag off, updateDrownedKing in main.js is the live fight untouched. Flag on, this brain runs him instead.
//
// P1 THE LIVING KING - his TRIDENT, in his own water (FLOODED = he is home: he swims fast, every blow on him x0.4, the floor of B15).
//   THE THRUST   ! (block)        a long told stab down a line that locks before it goes; turned by a guard, he recoils
//   THE SWEEP    !! (jump)        the trident low round his feet - a jump clears it, no shield turns it
//   THE HURL     !! (move off)    thrown down a marked line; it sticks in the stone and while it is out he is BARE-HANDED: OPEN (gold, timer) until he
//                                 calls it back (told: the line from the wall to his hand) - it comes back down that line and it hurts
//   ROYAL DECREE !! (pick a side) THE PORTCULLIS drops in the column between his pillars and his dais and cuts the room in two for a few seconds; on his side
//                                 he follows with a thrust at once, on the far side he hurls through the bars. A decree also BRINGS THE SEA BACK.
//   THE FLOODGATE (the level's verb, his room's own lever, one each side of the gate): strike it and the room DRAINS - on his floor he is BEACHED: heavy,
//                                 slow, only the thrust and the sweep, every blow x1 (Daniel 10-16: "DRAINED = he is beached, OPEN x1") - until he decrees.
//   THE GATE ON HIM (the opening, plan item 8): while he swims under the raised portcullis its column lights gold; work a lever THEN and the gate comes
//                                 down on him: PINNED, x1.5, gold ring + timer. A ward after (x0.4, grey) so it is not a stun-lock.
// AT HALF: THE CURSE TAKES HIM - a told transformation (the water darkens, the crown slips, the eyes go green): a gold window while it takes him, the sea back.
// P2 THE CURSED KING - the tide is HIS now (the kit's cycle: 3 tolls and it comes in, 1 toll and it goes out). HIGH = he is home (x0.4); LOW = he is beached
//   and OPEN (x1). Every move changes (B: P2 a different fight):
//   DROWNED GRASP   !! (jump/move) dead hands rise along a marked stretch of the floor (a hazard, not adds) - at low water, where you stand to hit him
//   BREATH LEECH    ! (range/hit)  a green tether that drains your BREATH (the A13 quiet drain, no stagger) - break it by distance or by hitting him
//   CURSED TRIDENT  !! (dodge)     the trident splits into three ghostly prongs that fan at you
//   BONE SHELL      (once, ~25%)   coral and bone close over him: x0.4 until a PLUNGE breaks it (B14 key FROM ABOVE) - then x1.25, gold
//   and THE THRUST, still. THE GATE ON HIM still works (the gate is the keep's, not his).
// B15: no state below x0.4 (tools/keep-floods.mjs walks every mode). Numbers are PLACEHOLDERS for the tune lane (60-70% WITH flasks for the pair).
// PURE: no DOM, no main.js. The world is `c` (src/keep-floods-hands.js binds it).
export const K2 = {
  hpMul: 1.6,                   /* x his live hp (EHP.drownedking x1.45, tiered): "a little too easy: MORE HP" (10-08) */
  floor: 0.4, home: 0.4, beached: 1, pinMul: 1.5, bareWet: 1, bareDry: 1.25, curseMul: 1, shellOpen: 1.25,
  swim: [86, 112], close: [106, 126], walk: [30, 36],
  thrustTell: [0.7, 0.6], thrustT: 0.22, thrustReach: 112, thrustW: 16, thrustRec: 0.55, recoil: 0.8, thrustCd: [3.2, 2.6],
  sweepTell: 0.65, sweepT: 0.26, sweepR: 72, sweepRec: 0.45, sweepCd: [4.5, 4],
  hurlTell: 0.8, hurlLock: 0.3, hurlV: 420, bareT: 3.2, recallTell: 0.55, recallV: 480, hurlCd: [7, 6],
  decreeTell: 1.0, gateT: 4.0, decreeCd: [12, 14], decreeFirst: 6, beachFor: 5.0,
  pinT: 2.6, heave: 0.6, ward: 1.2, leverCd: 1.5, gateHalf: 18,
  curseT: 3.2, curseWin: 2.0,
  graspTell: 0.9, graspT: 1.2, graspHalf: 44, graspCd: 5.5,
  leechTell: 0.8, leechMax: 3.0, leechReach: 170, leechBreak: 200, leechRate: 1.4, leechCd: 8,
  prongTell: 0.85, prongV: 190, prongSpread: 0.32, prongLife: 2.2, prongCd: 6,
  shellAt: 0.25, shellTell: 1.0, shellOpenT: 2.0,
  dmg: { thrust: 22, sweep: 18, hurl: 24, recall: 14, grasp: 16, prong: 14 },
};
/* every told move: its tell (s), its mark, its answer - the mark audit and tools/keep-floods.mjs read this */
export const K2_TELLS = {
  thrustTell: { t: K2.thrustTell[1], mark: '!', answer: 'block' }, sweepTell: { t: K2.sweepTell, mark: '!!', answer: 'jump' },
  hurlTell: { t: K2.hurlTell, mark: '!!', answer: 'dodge' }, recallTell: { t: K2.recallTell, mark: '!', answer: 'block' },
  decreeTell: { t: K2.decreeTell, mark: '!!', answer: 'dodge' }, graspTell: { t: K2.graspTell, mark: '!!', answer: 'jump' },
  leechTell: { t: K2.leechTell, mark: '!', answer: 'dodge' }, prongTell: { t: K2.prongTell, mark: '!!', answer: 'dodge' },
  shellTell: { t: K2.shellTell, mark: '', answer: 'plunge' },
};
/* the windup / release pose each move asks the art lane for (greybox: the live king's frames, mapped in k2Frame) */
export const K2_POSES = { thrustTell: 'trident drawn back to the hip', thrust: 'trident driven out, arm locked', sweepTell: 'trident low, wound back',
  sweep: 'the low arc', hurlTell: 'trident raised over the shoulder', hurl: 'the throw', recallTell: 'open hand out', decreeTell: 'trident raised high, crowned',
  decree: 'trident butt struck down', pinned: 'under the gate', curse: 'the curse (crown slips, flesh greys, eyes green)', graspTell: 'cursed hands down',
  leechTell: 'mouth open, green', prongTell: 'trident splitting', shellTell: 'coral closing' };

const sgn = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
export function k2Init(e) {
  e.hp = e.maxHp = Math.round((e.maxHp || e.hp) * K2.hpMul);
  e.k2 = { ph: 1, k: 1, thrustT: 1.5, sweepT: 2.5, hurlT: 3.5, decreeT: K2.decreeFirst, graspT: 2, leechT: 4, prongT: 3,
    tr: { out: false, x: 0, y: 0, vx: 0, vy: 0, stuck: false, t: 0, hit: false }, ward: 0, beachT: 0, leverCd: 0, gateT: 0, shell: false, shellDone: false,
    shellOpenT: 0, leech: null, grasp: null, aim: [1, 0], orbit: 0 };
  e.open = 0; e.cursed = false;
  return e.k2;
}
const wetOf = s => s.k > 0.35;

/* ONE STEP. Returns nothing; everything it does to the world goes through c. */
export function k2Step(e, dt, c) {
  const s = e.k2 || k2Init(e), A = c.A, P = c.P, p2 = s.ph === 2;
  s.k = c.water(); const wet = wetOf(s);
  e.modeT -= dt; e.anim = (e.anim || 0) + dt;
  for (const k of ['thrustT', 'sweepT', 'hurlT', 'decreeT', 'graspT', 'leechT', 'prongT']) s[k] -= dt;
  s.ward = Math.max(0, s.ward - dt); s.leverCd = Math.max(0, s.leverCd - dt); s.shellOpenT = Math.max(0, s.shellOpenT - dt);
  if (s.gateT > 0) { s.gateT -= dt; if (s.gateT <= 0 && e.mode !== 'pinned') { c.liftGate(); c.say(A.gateX, A.floor - 120, 'THE GATE GOES UP', '#9aa39a'); } }
  if (e.mode === 'sleep') return;
  if (e.mode === 'wake') { e.vx = 0; e.vy = -30; c.move(e, 0, -30 * dt); if (e.modeT <= 0) { e.mode = 'swim'; e.modeT = 0.6; } return; }
  const cy = e.y - 16, d = P.x - e.x, ad = Math.abs(d), dy = (P.y - 10) - cy, dist = Math.hypot(d, dy);
  /* AT HALF: THE CURSE TAKES HIM (whatever he was doing; the gate lifts off him, the trident comes home, the sea comes back) */
  if (!p2 && e.mode !== 'curse' && e.hp <= e.maxHp * 0.5) {
    e.mode = 'curse'; e.modeT = K2.curseT; s.tr.out = false; s.leech = null; if (s.gateT > 0 || e.pinned) { s.gateT = 0; c.liftGate(); } e.pinned = false;
    c.flood('high'); c.say(e.x, e.y - 60, 'THE CURSE TAKES HIM', '#7ff0e0'); c.sfx('curse'); c.shake(8);
  }
  if (p2 && !s.shellDone && e.hp <= e.maxHp * K2.shellAt && e.mode !== 'shellTell' && e.mode !== 'pinned') { e.mode = 'shellTell'; e.modeT = K2.shellTell; c.say(e.x, e.y - 60, 'CORAL AND BONE CLOSE OVER HIM', '#e8dcc0'); c.sfx('shell'); }
  let tx = e.x, ty = e.y, sp = 0, walkTo = null;
  const pick = () => pickMove(e, s, c, { d, ad, dy, dist, wet, p2 });
  switch (e.mode) {
    case 'swim': case 'walk': {
      e.mode = wet ? 'swim' : 'walk';
      if (s.tr.out) {   /* BARE-HANDED: he goes for it; it comes back at the end of its time, told */
        tx = s.tr.x; ty = s.tr.y + 16; sp = K2.swim[1]; walkTo = s.tr.x;
        s.tr.t += dt; if (s.tr.stuck && s.tr.t >= K2.bareT) { e.mode = 'recallTell'; e.modeT = K2.recallTell; c.mark(e, '!'); c.say(e.x, e.y - e.h - 12, 'HE CALLS IT BACK', '#ffd36b'); c.sfx('recall'); }
        break; }
      if (wet) { s.orbit += dt * (p2 ? 1.1 : 0.85); const close = (s.thrustT < 0.6);
        const R = close ? 40 : (p2 ? 74 : 92); tx = P.x + Math.cos(s.orbit) * R; ty = P.y + (close ? 2 : -24 + Math.sin(s.orbit) * 22); sp = close ? K2.close[p2 ? 1 : 0] : K2.swim[p2 ? 1 : 0]; }
      else { walkTo = P.x - sgn(d || 1) * 34; s.beachT += dt; }
      if (wet) s.beachT = 0;
      if (e.modeT <= 0 && !P.dead) pick();
      break; }
    case 'thrustTell': e.face = sgn(d) || e.face; sp = 18; tx = e.x - e.face * 8; ty = e.y;
      if (e.modeT > K2.hurlLock || !s.aimSet) { const n = Math.max(1, dist); s.aim = [d / n, wet ? dy / n : 0]; s.aimSet = true; }
      if (e.modeT <= 0) { e.mode = 'thrust'; e.modeT = K2.thrustT; s.hit = false; c.sfx('thrust'); e.vx += s.aim[0] * 140; e.vy += s.aim[1] * 140; }
      break;
    case 'thrust': {
      if (!s.hit && !P.dead) { const rx = P.x - e.x, ry = (P.y - 10) - cy, al = rx * s.aim[0] + ry * s.aim[1], pp = Math.abs(-rx * s.aim[1] + ry * s.aim[0]);
        if (al > 0 && al < K2.thrustReach && pp < K2.thrustW) { s.hit = true; const r = c.hurt(e.x, K2.dmg.thrust, { blow: 'the trident' });
          if (r === 'blocked') { e.mode = 'recoil'; e.modeT = K2.recoil; e.vx = -s.aim[0] * 110; c.say(e.x, e.y - e.h - 10, 'TURNED', '#8fd160'); c.sfx('clank'); s.aimSet = false; break; } } }
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = K2.thrustRec; s.aimSet = false; }
      break; }
    case 'sweepTell': e.face = sgn(d) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = K2.sweepT; s.hit = false; c.sfx('sweep'); } break;
    case 'sweep':
      if (!s.hit && !P.dead && ad < K2.sweepR && Math.abs(P.y - e.y) < 18) { s.hit = true; c.hurt(e.x, K2.dmg.sweep, { unblockable: true, blow: 'the sweep' }); }
      if (e.modeT <= 0) { e.mode = 'recover'; e.modeT = K2.sweepRec; }
      break;
    case 'hurlTell': e.face = sgn(d) || e.face; sp = 14; tx = e.x; ty = e.y;
      if (e.modeT > K2.hurlLock || !s.aimSet) { const n = Math.max(1, dist); s.aim = [d / n, dy / n]; s.aimSet = true; }
      if (e.modeT <= 0) { const T = s.tr; Object.assign(T, { out: true, stuck: false, t: 0, hit: false, x: e.x + e.face * 10, y: cy, vx: s.aim[0] * K2.hurlV, vy: s.aim[1] * K2.hurlV });
        e.mode = 'hurl'; e.modeT = 0.3; s.aimSet = false; c.sfx('hurl'); }
      break;
    case 'hurl': if (e.modeT <= 0) { e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.4; } break;
    case 'recallTell': sp = 0; if (e.modeT <= 0) { e.mode = 'recall'; e.modeT = 1.6; s.tr.stuck = false; s.tr.hit = false; c.sfx('hurl'); } break;
    case 'recall': if (!s.tr.out || e.modeT <= 0) { s.tr.out = false; e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.5; s.ward = K2.ward; } break;
    case 'decreeTell': e.face = sgn(d) || e.face; sp = 10; tx = e.x; ty = e.y;
      if (e.modeT <= 0) { e.mode = 'decree'; e.modeT = 0.4; s.gateT = K2.gateT; s.decreeT = K2.decreeCd[p2 ? 1 : 0]; s.beachT = 0;
        c.dropGate(); c.shake(7); c.sfx('decree'); c.say(A.gateX, A.floor - 140, 'BY ROYAL DECREE', '#ffd36b');
        if (!p2 && s.k < 0.99) { c.flood('high'); c.say(A.gateX, A.floor - 120, 'AND THE SEA WITH IT', '#7ff0e0'); } }
      break;
    case 'decree': if (e.modeT <= 0) { const mine = sgn(P.x - A.gateX) === sgn(e.x - A.gateX);   /* WHICH SIDE YOU ARE ON MATTERS */
        if (mine || s.tr.out) { e.mode = 'thrustTell'; e.modeT = 0.5; c.mark(e, '!'); }
        else { e.mode = 'hurlTell'; e.modeT = 0.6; c.mark(e, '!!'); c.say(e.x, e.y - e.h - 12, 'THROUGH THE BARS', '#ff6b6b'); } }
      break;
    case 'pinned': e.vx = 0; e.vy = 0; e.open = e.modeT;
      if (e.modeT <= 0) { e.mode = 'heave'; e.modeT = K2.heave; c.say(e.x, e.y - e.h - 12, 'HE HEAVES IT OFF', '#9aa39a'); } break;
    case 'heave': if (e.modeT <= 0) { e.pinned = false; s.gateT = 0; c.liftGate(); s.ward = K2.ward; e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.5; } break;
    case 'recoil': case 'recover': sp = 0; if (e.modeT <= 0) { e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.35; } break;
    case 'curse': sp = 0; e.vx *= 0.9; e.vy *= 0.9;
      if (e.modeT <= 0) { s.ph = 2; e.phase = 2; e.cursed = true; e.mode = 'swim'; e.modeT = 0.8; s.ward = K2.ward; c.curse(); c.say(e.x, e.y - 60, 'THE CURSED KING', '#7ff0e0'); c.sfx('roar'); } break;
    /* P2 */
    case 'graspTell': if (e.modeT <= 0) { e.mode = 'grasp'; e.modeT = 0.5; s.grasp.live = K2.graspT; s.grasp.hit = false; c.sfx('grasp'); } break;
    case 'grasp': if (e.modeT <= 0) { e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.5; } break;
    case 'leechTell': e.face = sgn(d) || e.face; if (e.modeT <= 0) { if (dist < K2.leechReach) { s.leech = { t: K2.leechMax }; c.sfx('leech'); } e.mode = 'leech'; e.modeT = K2.leechMax; } break;
    case 'leech': sp = 30; tx = e.x; ty = e.y; if (!s.leech || e.modeT <= 0) { s.leech = null; e.mode = 'swim'; e.modeT = 0.5; } break;
    case 'prongTell': e.face = sgn(d) || e.face; sp = 12; tx = e.x; ty = e.y;
      if (e.modeT <= 0) { const a0 = Math.atan2(dy, d); for (const da of [-K2.prongSpread, 0, K2.prongSpread]) c.shot({ x: e.x + e.face * 12, y: cy, vx: Math.cos(a0 + da) * K2.prongV, vy: Math.sin(a0 + da) * K2.prongV, life: K2.prongLife, dmg: K2.dmg.prong });
        e.mode = 'recover'; e.modeT = 0.6; c.sfx('prong'); }
      break;
    case 'shellTell': sp = 0; if (e.modeT <= 0) { s.shell = true; s.shellDone = true; e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.4; c.say(e.x, e.y - e.h - 12, 'BREAK IT FROM ABOVE', '#ffd36b'); } break;
    default: e.mode = wet ? 'swim' : 'walk'; e.modeT = 0.3;
  }
  /* THE TRIDENT IN FLIGHT (out, back) */
  const T = s.tr;
  if (T.out && !T.stuck) {
    if (e.mode === 'recall') { const bx = e.x - T.x, by = cy - T.y, bd = Math.hypot(bx, by) || 1; T.vx = bx / bd * K2.recallV; T.vy = by / bd * K2.recallV; if (bd < 18) T.out = false; }
    T.x += T.vx * dt; T.y += T.vy * dt;
    if (T.out && !T.hit && !P.dead && Math.hypot(P.x - T.x, (P.y - 10) - T.y) < 14) { T.hit = true; c.hurt(T.x, e.mode === 'recall' ? K2.dmg.recall : K2.dmg.hurl, e.mode === 'recall' ? { blow: 'the trident' } : { unblockable: true, blow: 'the trident' }); }
    if (e.mode !== 'recall' && (c.solid(T.x, T.y) || T.x < A.x0 + 4 || T.x > A.x1 - 4 || T.y < A.y0 + 4 || T.y > A.floor - 2)) {
      T.stuck = true; T.t = 0; T.x = Math.max(A.x0 + 4, Math.min(A.x1 - 4, T.x)); T.y = Math.max(A.y0 + 4, Math.min(A.floor - 2, T.y));
      c.say(T.x, T.y - 16, 'BARE-HANDED', '#8fd160'); c.sfx('stick'); }
  }
  /* THE GRASP's hands, THE LEECH's drain */
  if (s.grasp && s.grasp.live > 0) { s.grasp.live -= dt; const G = s.grasp;
    if (!G.hit && !P.dead && P.x > G.x0 && P.x < G.x1 && P.y > A.floor - 22) { G.hit = true; c.hurt(P.x, K2.dmg.grasp, { unblockable: true, up: true, blow: 'the drowned hands' }); }
    if (G.live <= 0) s.grasp = null; }
  if (s.leech) { if (P.dead || dist > K2.leechBreak) { s.leech = null; c.say(P.x, P.y - 30, 'THE TETHER SNAPS', '#8fd160'); } else if (P.swim) c.breath(K2.leechRate * dt); }
  /* MOVING: in his water he steers and the sea takes the speed off him; on his dry floor he is a heavy man walking */
  const still = e.mode === 'pinned' || e.mode === 'heave' || e.mode === 'curse' || e.mode === 'recallTell';
  if (wet) {
    if (!still && sp > 0) { const ddx = tx - e.x, ddy = ty - e.y, dd = Math.hypot(ddx, ddy) || 1, want = Math.min(sp, dd * 2.5);
      e.vx += (ddx / dd * want - e.vx) * Math.min(1, dt * 2.4); e.vy += (ddy / dd * want - e.vy) * Math.min(1, dt * 2.4); }
    else { e.vx -= e.vx * Math.min(1, dt * 3); e.vy -= e.vy * Math.min(1, dt * 3); }
  } else {
    e.vy = Math.min(420, (e.vy || 0) + 900 * dt);
    const w = K2.walk[p2 ? 1 : 0], go = !still && walkTo !== null && (e.mode === 'walk') ? sgn(walkTo - e.x) * (Math.abs(walkTo - e.x) > 6 ? w : 0) : 0;
    e.vx += (go - e.vx) * Math.min(1, dt * 6);
  }
  if (still) { e.vx = 0; if (wet) e.vy = 0; }
  const r = c.move(e, e.vx * dt, e.vy * dt, wet); if (r && r.hitX) e.vx = 0; if (r && r.hitY) e.vy = 0;
  if (e.x < A.xmin) e.x = A.xmin; if (e.x > A.xmax) e.x = A.xmax; if (e.y < A.ymin) { e.y = A.ymin; e.vy = Math.max(0, e.vy); } if (e.y > A.floor) { e.y = A.floor; e.vy = 0; }
  e.swimming = wet; e.beached = !wet;
  if (!/Tell$/.test(e.mode) && !still && e.mode !== 'thrust') { const nf = Math.abs(e.vx) > 24 ? sgn(e.vx) : (sgn(d) || e.face); if (nf) e.face = nf; }
  /* THE GOLD: what is open now, and for how long (main.js reads e.open for the greed rule; the hands draw it) */
  e.open = e.mode === 'pinned' ? e.modeT : T.out ? Math.max(0.05, K2.bareT - T.t) : (e.mode === 'curse' && e.modeT > K2.curseT - K2.curseWin) ? e.modeT - (K2.curseT - K2.curseWin) : s.shellOpenT > 0 ? s.shellOpenT : 0;
  e.underGate = Math.abs(e.x - A.gateX) < K2.gateHalf && s.gateT <= 0 && e.mode !== 'pinned';
}

function pickMove(e, s, c, { d, ad, dy, dist, wet, p2 }) {
  const P = c.P, A = c.A, say = (txt, col) => c.say(e.x, e.y - e.h - 12, txt, col || '#7ff0e0');
  const go = (mode, t, mark, txt, col) => { e.mode = mode; e.modeT = t; if (mark) c.mark(e, mark); if (txt) say(txt, col); };
  if (!p2) {
    if (s.decreeT <= 0 && s.gateT <= 0 && (wet || s.beachT >= K2.beachFor)) return go('decreeTell', K2.decreeTell, '!!', wet ? 'ROYAL DECREE' : 'HE CALLS THE SEA', '#ffd36b'), c.sfx('decreeTell');
    if (!wet && s.beachT >= K2.beachFor && s.gateT <= 0) { s.decreeT = 0; return go('decreeTell', K2.decreeTell, '!!', 'HE CALLS THE SEA', '#ffd36b'); }
    if (wet && s.hurlT <= 0 && dist > 110 && dist < 330) { s.hurlT = K2.hurlCd[0]; return go('hurlTell', K2.hurlTell, '!!', 'THE TRIDENT HURL'); }
    if (s.thrustT <= 0 && dist < K2.thrustReach + 10 && (wet || Math.abs(dy) < 30)) { s.thrustT = K2.thrustCd[0]; return go('thrustTell', K2.thrustTell[0], '!', null); }
    if (s.sweepT <= 0 && ad < K2.sweepR + 6 && Math.abs(P.y - e.y) < 26) { s.sweepT = K2.sweepCd[0]; return go('sweepTell', K2.sweepTell, '!!', 'LOW - JUMP', '#ff6b6b'); }
    e.modeT = 0.3; return;
  }
  /* P2: high water = his reach (the leech, the prongs); low water = his floor (the hands), and the thrust either way */
  if (s.decreeT <= 0 && s.gateT <= 0) return go('decreeTell', K2.decreeTell, '!!', 'ROYAL DECREE', '#ffd36b');
  if (wet) {
    if (s.leechT <= 0 && dist < K2.leechReach && P.swim) { s.leechT = K2.leechCd; return go('leechTell', K2.leechTell, '!', 'BREATH LEECH', '#8fd160'); }
    if (s.prongT <= 0 && dist > 60 && dist < 300) { s.prongT = K2.prongCd; return go('prongTell', K2.prongTell, '!!', 'THE CURSED TRIDENT'); }
  } else if (s.graspT <= 0) { s.graspT = K2.graspCd; const x = Math.max(A.x0 + 8, Math.min(A.x1 - 8, P.x)); s.grasp = { x0: x - K2.graspHalf, x1: x + K2.graspHalf, live: 0, hit: false };
    return go('graspTell', K2.graspTell, '!!', 'THE DROWNED GRASP', '#ff6b6b'); }
  if (s.thrustT <= 0 && dist < K2.thrustReach + 10 && (wet || Math.abs(dy) < 30)) { s.thrustT = K2.thrustCd[1]; return go('thrustTell', K2.thrustTell[1], '!', null); }
  if (!wet && s.sweepT <= 0 && ad < K2.sweepR + 6 && Math.abs(P.y - e.y) < 26) { s.sweepT = K2.sweepCd[1]; return go('sweepTell', K2.sweepTell, '!!', 'LOW - JUMP', '#ff6b6b'); }
  e.modeT = 0.3;
}

/* A FLOODGATE LEVER, struck (any seat). Returns what it did: 'pin' | 'drain' | 'spent' | 'his' (P2: the sea is his) */
export function k2Lever(e, c) {
  const s = e.k2; if (!s || !e.alive) return null;
  if (s.leverCd > 0) return 'spent';
  s.leverCd = K2.leverCd;
  if (e.underGate && e.mode !== 'curse') {   /* THE GATE COMES DOWN ON HIM */
    e.mode = 'pinned'; e.modeT = K2.pinT; e.pinned = true; s.gateT = K2.pinT + K2.heave; s.tr.out && (s.tr.stuck = true); c.dropGate(e); c.shake(9); c.sfx('pin');
    c.say(e.x, e.y - e.h - 16, 'THE GATE COMES DOWN ON HIM', '#8fd160'); return 'pin'; }
  if (s.ph === 2) { c.say(c.A.gateX, c.A.floor - 120, 'THE SEA IS HIS NOW', '#7ff0e0'); return 'his'; }
  if (s.k > 0.5) { c.flood('low'); c.say(c.A.gateX, c.A.floor - 120, 'THE THRONE ROOM DRAINS', '#8fd160'); c.sfx('drain'); return 'drain'; }
  return 'spent';
}

/* WHAT A BLOW ON HIM TAKES (B15: never under K2.floor). plunge = the blow came from above. */
export function k2Take(e, dmg, plunge) {
  const s = e.k2; if (!s) return dmg;
  const wet = wetOf(s), p2 = s.ph === 2;
  let m = wet ? K2.home : K2.beached;
  if (e.mode === 'pinned') m = K2.pinMul;
  else if (e.mode === 'curse') m = e.modeT > K2.curseT - K2.curseWin ? K2.curseMul : K2.floor;
  else if (s.tr.out) m = Math.max(m, wet ? K2.bareWet : K2.bareDry);
  if (s.shellOpenT > 0) m = Math.max(m, K2.shellOpen);
  if (s.shell) { if (plunge) { s.shell = false; s.shellOpenT = K2.shellOpenT; m = K2.shellOpen; e.shellBroke = true; } else m = K2.floor; }
  else if (s.ward > 0 && e.mode !== 'pinned') m = K2.floor;
  if (s.leech) { s.leech = null; e.leechBroke = true; }
  void p2;
  return Math.max(1, Math.round(dmg * Math.max(K2.floor, m)));
}
/* the multiplier alone, for the tool (dmg 1000 so rounding never hides a floor) */
export const k2Mul = (e, plunge) => k2Take(e, 1000, plunge) / 1000;

/* HIS FRAMES (the live king's sheet, src/redraw/king_swim.js; the art lane draws the trident + the cursed model) - see kingFrame in main.js */
export function k2Frame(e) {
  const m = e.mode, sw = e.swimming;
  if (m === 'sleep') return 0;
  if (m === 'pinned' || m === 'heave' || m === 'curse' || m === 'recoil') return 17;
  if (m === 'thrustTell' || m === 'hurlTell') return 12; if (m === 'thrust' || m === 'hurl') return 13;
  if (m === 'sweepTell' || m === 'sweep') return sw ? 15 : 2;
  if (m === 'decreeTell' || m === 'shellTell' || m === 'prongTell') return 11; if (m === 'decree' || m === 'grasp' || m === 'graspTell') return 3;
  if (m === 'leechTell' || m === 'leech' || m === 'recallTell' || m === 'recall') return sw ? 14 : 2;
  if (!sw) return Math.abs(e.vx) > 6 ? 1 : (e.cursed ? 4 : 0);
  const spd = Math.hypot(e.vx || 0, e.vy || 0); if (spd < 30) return 8;
  return 5 + Math.floor((e.anim || 0) * (spd > 90 ? 7 : 4.5)) % 3;
}
