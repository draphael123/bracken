// src/gorm-king.js - KING GORM UNDERLEAF 2's AI (claude/gorm2). Numbers src/gorm.js; the world halves of his moves src/gorm-hands.js.
// main.js calls updateGorm(e, dt, c) for the King while his fight runs (and asleep); his flee is the hands' (gorm-hands kingStep).
// Every move is TOLD (B5/B16): a word or '!' over him, a sound, its own windup pose, then its own release pose (src/gorm-hands.js drawKing).
//   P1 THE COURT - on his litter: THE CHARGE (the bearers rock it back, then run it the length of the hall), THE HAND (he reaches: unblockable -
//      dodge it or be above it - and HURLS you: his ONE throw, on a slow clock), THE HUNTING HORN (a royal boar down the hall).
//      On his feet (the litter breaks at GORM.litterTo): THE SCEPTRE SWEEP (blockable), THE HAND, THE HORN.
//      Opened by a cage on a rope (src/gorm-hands.js; main.js's dropcage lands it and holds him): HELD (x2), then OPEN (x1.25), then a WARD.
//   P2 THE GLADE - THE BURNING BRANCH (high: duck it; low: jump it), THE ROYAL HUNT (the horn at GORM.huntAt: a boar and two hounds), THE CANOPY SHAKE
//      (he punches the oak: burning cones on marked spots), THE LOG ROLL (jump it), THE BELLY QUAKE (jump the shockwave).
//      Opened by what hangs in the oak (the hands): HELD / KNOCKED DOWN / STUNG, then a WARD.
import { GORM, GORM_SAY } from './gorm.js';
export function updateGorm(e, dt, c) {
  const A = c.arena(), floor = A.floor, P = c.P(), d = P.x - e.x, ad = Math.abs(d), G = c.hands;
  e.modeT -= dt; e.anim = (e.anim || 0) + dt; e.open = Math.max(0, (e.open || 0) - dt); e.ward = Math.max(0, (e.ward || 0) - dt);
  if (e.mode === 'sleep') { e.y = e.stage === 'glade' ? floor : floor - 9; return; }
  const opening = e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung' || e.open > 0;
  if (opening) e.wasOpen = true;
  else if (e.wasOpen) { e.wasOpen = false; e.ward = GORM.ward; c.number(e.x, e.y - e.h - 14, GORM_SAY.warded, '#c9d1dc'); c.sfx.clank && c.sfx.clank(); }   /* B3: the told ward after every opening */
  if (e.stage === 'glade') return glade(e, dt, c, A, floor, P, d, ad, G);
  /* ===== P1: THE COURT ===== */
  for (const k of ['hornT', 'grabT', 'chargeT', 'sweepT']) if (e[k] === undefined) e[k] = k === 'hornT' ? GORM.hornFirst : k === 'grabT' ? 4 : k === 'chargeT' ? 5 : 0;
  if (e.mode === 'wake') { e.y = floor - 9; if (e.modeT <= 0) { e.mode = 'carried'; e.modeT = 0.5; } return; }
  if (e.mode === 'held') { e.vx = 0; if (e.modeT <= 0) { e.mode = e.phase >= 2 ? 'walk' : 'carried'; e.modeT = 0.6; e.stagger = 0; e.open = GORM.openT; c.number(e.x, e.y - e.h - 16, GORM_SAY.open, '#8fd160'); c.sfx.sting && c.sfx.sting(); } return; }
  e.hornT -= dt; e.grabT -= dt; e.chargeT -= dt; e.sweepT -= dt;
  const boarUp = c.enemies().some(q => q.alive && q.t === 'royalboar' && q.called);
  const grab = () => { const reach = GORM.grabReach; if (!P.dead && Math.sign(P.x - e.x) === e.face && ad > 8 && ad < reach && P.y > e.y - 30 && P.y <= e.y + 4) { const res = c.damage(e.x, c.dmg.grab, { unblockable: true, name: 'THE KING\'S HAND' }); if (res === 'hit') { P.vx = e.face * GORM.hurlVx; P.vy = GORM.hurlVy; P.hurt = 0.7; P.ground = false; P.block = false; c.sfx.throwWhoosh && c.sfx.throwWhoosh(); c.sfx.bellow && c.sfx.bellow(); c.shake(6); c.zoom(1.12, 0.3); c.number(P.x, P.y - 30, GORM_SAY.hurled, '#ff6b6b'); } } };
  const horn = () => { e.mode = 'hornTell'; e.modeT = GORM.hornTell; e.face = Math.sign(d) || e.face; c.number(e.x, e.y - e.h - 18, GORM_SAY.horn, '#ffd36b'); c.sfx.hornDraw && c.sfx.hornDraw(); };
  if (e.mode === 'hornTell') { if (e.modeT <= 0) { e.mode = 'horn'; e.modeT = 0.7; e.hornT = GORM.hornEvery; c.sfx.hornBlast && c.sfx.hornBlast(); c.ring(e.x, e.y - e.h, 60, '#ffd36b', 0.5); G.callBoar(A, true); c.number(e.x, e.y - e.h - 30, GORM_SAY.boar, '#ff9a5c'); } if (e.phase >= 2) settle(e, dt, c, 0); else e.y = floor - 9; return; }
  if (e.mode === 'horn') { if (e.modeT <= 0) { e.mode = e.phase >= 2 ? 'walk' : 'carried'; e.modeT = 0.6; } if (e.phase >= 2) settle(e, dt, c, 0); else e.y = floor - 9; return; }
  if (e.phase === 1) {   /* ON THE LITTER */
    e.y = floor - 9;
    if (e.hp <= e.maxHp * GORM.litterTo) { e.phase = 2; e.y = floor; e.mode = 'rise'; e.modeT = 1.3; e.h = 60; c.number(e.x, e.y - 36, GORM_SAY.litter, '#ff6b6b'); c.sfx.heavy && c.sfx.heavy(); c.sfx.crack && c.sfx.crack(); c.shake(8); c.zoom(1.12, 0.4); c.burst(e.x, e.y, 16, ['#8b6a2a', '#c9b27c', '#c9463d'], 80, 0.7); return; }
    if (e.mode === 'chargeTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'charge'; e.modeT = GORM.chargeT; e.cdir = Math.sign(d) || e.dir || -1; e.chargeHit = false; c.sfx.bellow && c.sfx.bellow(); c.sfx.rattle && c.sfx.rattle(1); } return; }
    if (e.mode === 'charge') { e.x += e.cdir * GORM.chargeV * dt; e.face = e.cdir; if (Math.random() < dt * 30) c.part({ x: e.x - e.cdir * 30, y: e.y + 8, vx: -e.cdir * 60, vy: -30, life: 0.3, max: 0.3, col: '#c9b27c', size: 2, grav: 200 });
      if (!e.chargeHit && !P.dead && ad < 36 && P.y > e.y - 30 && P.y <= e.y + 12) { e.chargeHit = true; c.damage(e.x, c.dmg.litter, { unblockable: true, up: true, name: 'THE LITTER' }); P.vx = e.cdir * 300; P.vy = -180; P.ground = false; c.number(P.x, P.y - 24, GORM_SAY.runDown, '#ff6b6b'); c.shake(5); }
      if (e.x <= A.x0 + 50 || e.x >= A.x1 - 50 || e.modeT <= 0) { e.x = Math.max(A.x0 + 50, Math.min(A.x1 - 50, e.x)); e.mode = 'carried'; e.modeT = 0.9; e.dir = -e.cdir; c.shake(6); c.sfx.heavy && c.sfx.heavy(); c.sfx.crack && c.sfx.crack(); c.dust(e.x + e.cdir * 30, floor, 10); } return; }
    if (e.mode === 'grabTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = 0.35; e.grabT = GORM.grabEvery; grab(); } return; }
    if (e.mode === 'grab') { if (e.modeT <= 0) { e.mode = 'carried'; e.modeT = 0.6; } return; }
    if (e.mode === 'carried' && e.modeT <= 0 && !P.dead) {
      if (e.hornT <= 0 && !boarUp) { horn(); return; }
      if (e.chargeT <= 0 && ad > 40 && Math.abs(P.y - floor) < 40) { e.mode = 'chargeTell'; e.modeT = GORM.chargeTell; e.chargeT = GORM.chargeEvery; c.number(e.x, e.y - 40, '!!', '#ff6b6b'); c.sfx.kingLaugh && c.sfx.kingLaugh(); return; }
      if (e.grabT <= 0 && ad > 8 && ad < GORM.grabReach && P.y > e.y - 30 && P.y <= e.y + 4) { e.mode = 'grabTell'; e.modeT = GORM.grabTell; c.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); c.sfx.charge && c.sfx.charge(); return; } }
    if (e.mode !== 'carried') e.mode = 'carried';
    e.face = Math.sign(d) || e.face; e.dir = e.dir || -1; e.x += e.dir * GORM.walkV * 0.82 * dt; if (e.x < A.x0 + 60) e.dir = 1; if (e.x > A.x1 - 60) e.dir = -1;
    return;
  }
  /* ON HIS FEET */
  let want = 0;
  if (e.mode === 'rise') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.4; e.h = 60; } }
  else if (e.mode === 'walk') { e.face = Math.sign(d) || e.face; want = ad > 30 ? e.face * GORM.walkV : 0;
    if (e.modeT <= 0 && !P.dead) {
      if (e.hornT <= 0 && !boarUp) { horn(); want = 0; }
      else if (e.sweepT <= 0 && ad < GORM.sweepReach && Math.abs(P.y - e.y) < 50) { e.mode = 'sweepTell'; e.modeT = GORM.sweepTell; c.number(e.x, e.y - e.h - 12, '!', '#ffd36b'); c.sfx.charge && c.sfx.charge(); want = 0; }
      else if (e.grabT <= 0 && ad > 24 && ad < 100 && Math.abs(P.y - e.y) < 30) { e.mode = 'grabTell'; e.modeT = GORM.grabTell; c.number(e.x, e.y - e.h - 12, '!!', '#ff6b6b'); c.sfx.charge && c.sfx.charge(); want = 0; } } }
  else if (e.mode === 'grabTell') { if (e.modeT <= 0) { e.mode = 'grab'; e.modeT = 0.35; e.grabT = GORM.grabEvery; grab(); } }
  else if (e.mode === 'grab') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } }
  else if (e.mode === 'sweepTell') { e.face = Math.sign(d) || e.face; if (e.modeT <= 0) { e.mode = 'sweep'; e.modeT = 0.4; e.sweepT = GORM.sweepEvery; c.sfx.slash && c.sfx.slash(); c.shake(3);
      if (!P.dead && Math.sign(P.x - e.x) === e.face && ad < GORM.sweepReach && P.y > e.y - 46 && P.y < e.y + 6) c.damage(e.x, c.dmg.sweep, { name: 'THE SCEPTRE' }); } }
  else if (e.mode === 'sweep') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = GORM.sweepCool; } }
  else e.mode = 'walk';
  settle(e, dt, c, want);
}
/* gravity and the walk (his feet on the floor; the arena's walls hold him) */
function settle(e, dt, c, want) { const A = c.arena(); e.vy = Math.min(300, (e.vy || 0) + 1000 * dt); if (e.stagger > 0 && e.mode !== 'sweep') want = 0;
  e.vx += (want - (e.vx || 0)) * Math.min(1, dt * 6); const r = c.moveBody(e, e.vx * dt, e.vy * dt); if (r && r.ground) e.vy = 0; e.x = Math.max(A.x0 + 30, Math.min(A.x1 - 30, e.x)); }

/* ===== P2: THE KING'S GLADE ===== */
function glade(e, dt, c, A, floor, P, d, ad, G) {
  let want = 0; e.lift = 0;
  if (e.mode === 'wake') { e.vx = 0; if (e.modeT <= 0) { e.mode = 'limbTell'; e.modeT = 1.3; e.face = -1; c.number(e.x, e.y - e.h - 22, GORM_SAY.limb, '#ff9a5c'); c.sfx.crack && c.sfx.crack(); c.shake(4); } settle(e, dt, c, 0); return; }
  if (e.mode === 'limbTell') { if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.8; e.club = true; c.sfx.roar && c.sfx.roar(); c.burst(e.x, e.y - 50, 14, ['#ff9a5c', '#ffd36b', '#5a3a1a'], 80, 0.6); } settle(e, dt, c, 0); return; }
  if (e.mode === 'held' || e.mode === 'downed' || e.mode === 'stung') { e.vx = 0;
    if (e.mode === 'stung' && Math.random() < dt * 6) e.face = -e.face;
    if (e.modeT <= 0) { const was = e.mode; e.mode = 'walk'; e.modeT = 0.8; e.stagger = 0; e.club = true; if (was === 'held') { e.open = GORM.openT; c.number(e.x, e.y - e.h - 16, GORM_SAY.open, '#8fd160'); } }
    settle(e, dt, c, 0); return; }
  for (const k of ['clubT', 'logT', 'quakeT', 'shakeT']) e[k] = (e[k] === undefined ? 2 : e[k]) - dt;
  const T = GORM, pend = e.huntN < T.huntAt.length && e.hp <= e.maxHp * T.huntAt[e.huntN];
  const tell = (m, t, word, col) => { e.mode = m; e.modeT = t; if (word) c.number(e.x, e.y - e.h - 14, word, col || '#ffd36b'); c.sfx.charge && c.sfx.charge(); };
  switch (e.mode) {
    case 'walk': e.face = Math.sign(d) || e.face; want = ad > 34 ? e.face * T.walkV2 : 0;
      if (e.modeT <= 0 && !P.dead) {
        if (pend) { e.face = Math.sign(d) || e.face; tell('hornTell', T.hornTell, GORM_SAY.hunt, '#ff9a5c'); c.sfx.hornDraw && c.sfx.hornDraw(); want = 0; }
        else if (e.clubT <= 0 && ad < T.clubReach + 8 && Math.abs(P.y - e.y) < 60) { e.hi = (e.hiN || 0) % 3 !== 2 ? Math.random() < 0.5 : !e.hi; e.hiN = (e.hiN || 0) + 1;
          tell(e.hi ? 'clubHiTell' : 'clubLoTell', T.clubTell, e.hi ? GORM_SAY.high : GORM_SAY.low, e.hi ? '#ffd36b' : '#ff9a5c'); want = 0; }
        else if (e.logT <= 0 && ad > 80) { e.face = Math.sign(d) || e.face; tell('logTell', T.logTell, GORM_SAY.logroll, '#ff9a5c'); want = 0; }
        else if (e.quakeT <= 0 && ad < 150) { tell('quakeTell', T.quakeTell, GORM_SAY.quake, '#ff9a5c'); want = 0; }
        else if (e.shakeT <= 0) { e.mode = 'toOak'; e.modeT = 4; } }
      break;
    case 'toOak': { const gd = c.gormData().glade, side = e.x < gd.trunkX ? -1 : 1, at = gd.trunkX + side * 40; e.face = Math.sign(at - e.x) || e.face; want = Math.abs(at - e.x) > 6 ? e.face * T.walkV2 * 1.2 : 0;
      if (Math.abs(at - e.x) <= 6 || e.modeT <= 0) { e.face = Math.sign(gd.trunkX - e.x) || 1; tell('shakeTell', T.shakeTell, GORM_SAY.shake, '#ff9a5c'); want = 0; } break; }
    case 'hornTell': if (e.modeT <= 0) { e.mode = 'horn'; e.modeT = 0.8; e.huntN++; c.sfx.hornBlast && c.sfx.hornBlast(); c.ring(e.x, e.y - e.h, 70, '#ffd36b', 0.5); G.callBoar(A, false); G.hounds(A, 2); } break;
    case 'horn': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 1.2; } break;
    case 'clubHiTell': case 'clubLoTell': e.face = Math.sign(d) || e.face;
      if (e.modeT <= 0) { const hi = e.mode === 'clubHiTell'; e.mode = hi ? 'clubHi' : 'clubLo'; e.modeT = 0.35; e.clubT = T.clubEvery; c.sfx.slash && c.sfx.slash(); c.sfx.fireWhoosh && c.sfx.fireWhoosh(); c.shake(3);
        const front = Math.sign(P.x - e.x) === e.face && ad < T.clubReach;
        if (!P.dead && front) { if (hi && P.y > e.y - 58 && P.y < e.y + 4 && !P.ducking) c.damage(e.x, c.dmg.club, { name: 'THE BURNING BRANCH' });
          else if (!hi && P.y > e.y - 12 && P.y < e.y + 4) c.damage(e.x, c.dmg.club, { unblockable: true, up: true, name: 'THE BURNING BRANCH' }); } }
      break;
    case 'clubHi': case 'clubLo': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.75; } break;
    case 'logTell': if (e.modeT <= 0) { e.mode = 'log'; e.modeT = 0.4; e.logT = 9; G.rollLog(e.x + e.face * 34, e.face); c.sfx.heavy && c.sfx.heavy(); c.sfx.rumble && c.sfx.rumble(); } break;
    case 'log': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.7; } break;
    case 'quakeTell': if (e.modeT <= 0) { e.mode = 'quakeAir'; e.modeT = T.quakeAir; c.sfx.effort && c.sfx.effort(); } break;
    case 'quakeAir': e.lift = Math.sin(Math.PI * Math.max(0, 1 - e.modeT / T.quakeAir)) * 34;
      if (e.modeT <= 0) { e.mode = 'quake'; e.modeT = 0.5; e.quakeT = 10; G.quake(e.x); c.shake(9); c.zoom(1.1, 0.3); c.sfx.heavy && c.sfx.heavy(); c.sfx.frogBoom && c.sfx.frogBoom(); c.dust(e.x - 24, floor, 10); c.dust(e.x + 24, floor, 10);
        if (!P.dead && P.ground && ad < 44 && Math.abs(P.y - floor) < 8) c.damage(e.x, T.quakeDmg, { unblockable: true, up: true, name: 'THE BELLY QUAKE' }); }
      break;
    case 'quake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.9; } break;
    case 'shakeTell': if (e.modeT <= 0) { e.mode = 'shake'; e.modeT = 0.5; e.shakeT = 13; c.sfx.heavy && c.sfx.heavy(); c.shake(7); c.ring(e.x + e.face * 30, e.y - 40, 40, '#ff9a5c', 0.4);
        const xs = [Math.max(A.x0 + 16, Math.min(A.x1 - 16, P.x))]; let tries = 0; while (xs.length < T.cones && tries++ < 60) { const x = A.x0 + 20 + Math.random() * (A.x1 - A.x0 - 40); if (xs.every(q => Math.abs(q - x) > 44)) xs.push(x); }
        G.cones(xs); } break;
    case 'shake': if (e.modeT <= 0) { e.mode = 'walk'; e.modeT = 0.9; } break;
    default: e.mode = 'walk';
  }
  settle(e, dt, c, want);
}
