// src/canal-foes.js - THE FOG CANAL's two new foes (claude/canal, the greybox; Daniel, 2026-09-30: the canal brings TWO, and the fog wraith is
// dropped). Their numbers, their steps (run from src/main.js's updateEnemies through src/canal-hands.js's context) and their greybox art.
// Brief: docs/briefs/fog-canal.md. Proved in tools/canal.mjs.
//
//   THE GRINDYLOW   Jenny Greenteeth's weed-imp brood: the boss's grab in miniature, so it teaches her. It lurks under the surface at the water's
//                   edge (a low bank, a lock's steps, the ends of the barge) where you see only its ripples and bubbles - and its body only in a
//                   lantern's light. When a hero stands at the edge over its water it swims in under him and RIPPLES (a bubbling ring, a red !!:
//                   no shield turns a hand round your ankle; JUMP it) and then GRABS his ankle: it holds him and pulls him toward the water, and
//                   the canal is what costs him (it bites and hands him back to the bank). Mash (jump, strike, a way: three presses) to break
//                   it; STRIKE THE RIPPLE before it closes and it is knocked up out of the water, dazed. Under the water nothing touches it;
//                   out of it (dazed, or STRANDED when a lock drains away from it) it is weak and takes double.
//   THE WILL-O'-THE-WISP  a false lantern in the fog. It bobs with no post under it and burns a cold green no lantern on the canal ever burns, and
//                   when you come it drifts on ahead of you along a line of its own, as if it marked the way - off the bank and over the water,
//                   or onto the weed. Close to, it gutters (a yellow !) and FLARES in your face (a shield turns it; duck it). One blow pops it
//                   in a harmless flash. A foghorn's clear air shows it for what it is: it shies back to where it started and lures nobody.
import { canvas, px, rect, fillPoly, line, ellipse, circle, outline, flipX, whiten } from './px.js';
import * as CFA from './redraw/canal_foes_art.js';   /* (claude/canalart) the grindylow's and the wisp's pictures */

export const GRIND = { hp: 20, w: 14, h: 14, leash: 56, swim: 60, tell: 0.75, reach: 18, hold: 2.4, pull: 26, mash: 3, grabDmg: 6, stun: 1.6, cd: 2.4, weak: 2, strandT: 7, edgeNear: 16 };
export const WISP = { hp: 1, w: 10, h: 10, notice: 170, ahead: 56, drift: 34, turn: 1.5, harass: 48, home: 160, tell: 0.55, dash: 150, dashT: 0.45, hit: 11, dmg: 14, recoil: 0.8, cd: 1.6, reform: 2.2 };   /* (claude/canalfix3: the ember wisp's numbers - its turn, its tell, its dart; deadly by its 14-damage dart, never by hp) */
export const CANAL_FOES = new Set(['grindylow', 'willowisp']);

/* ================= THE GRINDYLOW ================= */
/* where a hero is standing at an edge over water this grindylow can reach: { x (the edge, px), y (his feet), dir (toward the water), barge } or null.
   X.surfaceAt(x) -> { y, id } of the water under column x (null: none); X.barge() -> the barge state; P the hero */
export function edgeOf(P, X) {
  if (!P || P.dead || P.climb) return null;
  const b = X.barge();
  if (b && P.onMover && P.onMover.canal) {   /* on the barge: its two ends are over the water */
    if (P.x - b.x < GRIND.edgeNear) return { x: b.x + 4, y: P.y, dir: -1, barge: true };
    if (b.x + b.w - P.x < GRIND.edgeNear) return { x: b.x + b.w - 4, y: P.y, dir: 1, barge: true };
    return null;
  }
  if (!P.ground || P.onMover) return null;
  for (const dir of [P.face || 1, -(P.face || 1)]) { const s = X.surfaceAt(P.x + dir * 14);
    if (s && s.y - P.y >= 2 && s.y - P.y <= 30 && !X.solidAt(P.x + dir * 14, P.y + 2)) return { x: P.x + dir * 10, y: P.y, dir, barge: false }; }   /* a low bank: the water within two rows under his feet, beside him */
  return null;
}
export function newGrindylow(e) { Object.assign(e, { hx: e.x, mode: 'lurk', modeT: 0, cd: 0.8 + (e.x % 5) * 0.2, noGrav: true, lastSurf: null, wet: null, presses: 0, grabbed: null, bubT: 0, aboard: false, bx: 0, offT: 0 }); return e; }
/* (claude/canalfix, review fix 2) IT COMES ABOARD. A rider amidships was out of every grindylow's reach for the whole level. Now, while she is HELD (at a
   gate, a bridge, the fog) - or, in the legging tunnel, while her light shows her (claude/canal4) - a grindylow at her hull with a hero on
   her deck rings the water at her near end (!!) and hauls itself aboard. On the deck it is out of the water: it creeps at the rider, rings its !! (jump
   it), and grabs his ankle and drags him for the nearest end and the water. It is weak there (double), and slips back in when nobody is aboard. */
const held = b => !!b && b.mode === 'float' && (!!b.holdWhy || Math.abs(b.v || 0) < 1);
/* (claude/canal4) IN THE LEGGING TUNNEL HER LIGHT DECIDES: lit (her lantern, or the moon down its shaft) she draws the brood aboard - held or legged;
   dimmed, nothing comes. X.lampDraws(e): true / false in a tunnel, null anywhere else */
function boardable(e, X, P) {
  const b = X.barge(); if (!b || !P || P.dead || !(P.onMover && P.onMover.canal) || e.boards === false) return null;
  const lit = X.lampDraws ? X.lampDraws(e) : null;
  if (lit === false) return null;
  if (!(held(b) || lit === true)) return null;
  if (e.hx < b.x - 28 || e.hx > b.x + b.w + 28) return null;
  return e.hx < b.x + b.w / 2 ? 6 : b.w - 6;   /* the near end */
}
/* one frame. X: { hero(), barge(), surfaceAt(x), solidAt(x, y), press(), hurtHero(x, dmg, o), mark(e, txt, col), sfx, hint(k, msg), ring(x, y, r, col) } */
export function stepGrindylow(e, dt, X) {
  const G = GRIND, P = X.hero(), S = X.sfx;
  e.modeT -= dt; e.cd -= dt; e.bubT -= dt;
  if (e.aboard) return stepAboard(e, dt, X, P);
  /* (claude/canalfix3) THE BUMP: it comes for a hero in a SAFE SWIM, hits the iron grate, and cannot get through (the clank and the ring are the lesson) */
  if (e.bump) { const B = e.bump; B.t += dt; e.mode = 'bump'; const dx = B.x - e.x, dy = B.y - e.y, d = Math.hypot(dx, dy) || 1;
    if (!B.hit) { const k = Math.min(d, 110 * dt); e.x += dx / d * k; e.y += dy / d * k; if (d < 3) { B.hit = B.t; S.clank && S.clank(); S.splash && S.splash(); X.ring(e.x, e.y, 12, '#9ad8c0'); } }
    else if (B.t - B.hit > 0.25 && B.t - B.hit < 0.4) { S.clank && S.clank(); X.ring(e.x, e.y, 8, '#9ad8c0'); }
    if ((B.hit && B.t - B.hit > 1.2) || B.t > 6) { e.bump = null; e.mode = 'dunk'; e.modeT = 1.2; e.cd = GRIND.cd; } e.vx = 0; e.vy = 0; return; }
  const s = X.surfaceAt(e.mode === 'stranded' ? e.x : e.hx) || X.surfaceAt(e.x);
  /* STRANDED: the lock drained away under it, and it is left on the wet steps at the water's new edge - out of the water, weak, and it grabs nobody.
     (claude/canalfix: it is left where a blade finds it, at the waterline, not up the wall where the water was; and it is measured against the
     water it settled in (e.wet), so a lock that drains at its own slow pace strands it - the old frame-to-frame test never could) */
  if (e.mode === 'stranded') { if (s) e.y = s.y - 1; if (!s || s.y <= e.wet + 8 || e.modeT <= 0) { e.mode = 'lurk'; e.cd = 1; e.wet = s ? s.y : null; } e.vx = 0; e.vy = 0; return; }
  if (!s) { e.mode = 'stranded'; e.modeT = G.strandT; return; }
  if (e.mode === 'lurk' || e.mode === 'dunk') { if (e.wet === null || s.y < e.wet) e.wet = s.y;
    if (s.y - e.wet > 20) { e.mode = 'stranded'; e.modeT = G.strandT; e.y = s.y - 1; X.mark(e, 'STRANDED', '#8fd160'); S.splash && S.splash(); X.hint('strand', 'THE WATER FELL AWAY FROM IT: A GRINDYLOW OUT OF THE WATER IS WEAK. CUT IT.'); return; } }
  e.lastSurf = s.y;
  /* COMING ABOARD: from the lurk, at a held barge (or the loose one at the junction) with a rider */
  if (e.mode === 'lurk' && e.cd <= 0) { const end = boardable(e, X, P);
    if (end !== null) { const b = X.barge(); e.mode = 'boardTell'; e.modeT = 0.55; e.bx = end; e.x = b.x + end; e.y = s.y + 4; X.mark(e, '!!', '#ff6b6b'); S.tell && S.tell(true); S.splash && S.splash(); X.ring(e.x, s.y, 10, '#9ad8c0'); } }
  if (e.mode === 'boardTell') { const b = X.barge(); if (!b) { e.mode = 'lurk'; return; } e.x = b.x + e.bx; e.y = s.y + 4;
    if (e.modeT <= 0) { e.aboard = true; e.mode = 'deck'; e.modeT = 0.4; e.cd = 0.5; e.y = b.y; S.splash && S.splash(); X.mark(e, 'ABOARD', '#ff6b6b'); X.hint('board', 'A GRINDYLOW HAULS ITSELF ABOARD. OUT OF THE WATER IT IS WEAK: CUT IT, AND JUMP ITS GRAB.'); }
    e.vx = 0; e.vy = 0; return; }
  const edge = edgeOf(P, X), inReach = edge && Math.abs(edge.x - e.hx) <= G.leash + 8;
  switch (e.mode) {
    case 'rippleTell': {
      if (edge && inReach) { e.x += Math.sign(edge.x - e.x) * Math.min(Math.abs(edge.x - e.x), 50 * dt); e.edge = edge; }
      e.y = (e.edge ? e.edge.y : s.y - 6) + 6;   /* reaching up to the lip: the ripple is where your blade can find it */
      if (e.bubT <= 0) { e.bubT = 0.12; X.ring(e.x, s.y, 6 + Math.random() * 6, '#9ad8c0'); }
      if (e.modeT <= 0) {
        const hold = edge && Math.abs(P.x - e.x) < G.reach && (P.ground || (P.onMover && P.onMover.canal)) && !P.dead;
        if (hold) { e.mode = 'grab'; e.modeT = G.hold; e.presses = 0; e.grabbed = P; e.edge = edge; S.splash && S.splash(); X.hurtHero(e.x, G.grabDmg, { unblockable: true, who: e, name: 'THE GRINDYLOW' }); X.hint('grab', 'IT HAS YOUR ANKLE: JUMP, STRIKE, PULL AWAY - QUICKLY, OR INTO THE WATER.'); }
        else { e.mode = 'dunk'; e.modeT = 0.8; e.cd = G.cd * 0.6; }
      }
      break; }
    case 'grab': {
      const H = e.grabbed; if (!H || H.dead) { e.mode = 'dunk'; e.modeT = 1; e.cd = G.cd; break; }
      H.caged = Math.max(H.caged || 0, 0.12); H.vx = 0;
      const ed = e.edge, toward = ed ? ed.dir : Math.sign(e.x - H.x) || 1;
      H.x += toward * G.pull * dt;
      const pr = X.press(); if (pr.jump || pr.atk || pr.left || pr.right) e.presses++;
      if (e.presses >= G.mash) { e.mode = 'stun'; e.modeT = G.stun; e.cd = G.cd; H.caged = 0; H.vy = -140; H.ground = false; e.grabbed = null; S.clank && S.clank(); X.mark(e, 'SHAKEN OFF', '#8fd160'); break; }
      /* OVER THE EDGE: he goes in, and the canal takes it from there (L.waterHurts) */
      const over = ed && ed.barge ? !X.barge() || (toward < 0 ? H.x < X.barge().x - 2 : H.x > X.barge().x + X.barge().w + 2) : !!X.surfaceAt(H.x) && !X.solidAt(H.x, H.y + 2);
      if (over || e.modeT <= 0) { H.caged = 0; H.onMover = null; H.ground = false; H.x += toward * 12; H.y = Math.max(H.y, s.y + 14); H.vy = 60; e.mode = 'dunk'; e.modeT = 1.4; e.cd = G.cd; e.grabbed = null; S.splash && S.splash(); }
      e.y = (ed ? ed.y : s.y) + 6;
      break; }
    case 'stun': e.y = (e.edge ? e.edge.y : s.y - 6) + 6; if (e.modeT <= 0) { e.mode = 'dunk'; e.modeT = 0.9; } break;
    case 'dunk': e.y = s.y + 12; if (e.modeT <= 0) e.mode = 'lurk'; break;
    default: {   /* 'lurk': under the surface, it swims in under a hero at the edge (inside its leash of water) */
      e.mode = 'lurk'; e.y = s.y + 12;
      const tx = inReach ? Math.max(e.hx - G.leash, Math.min(e.hx + G.leash, edge.x)) : e.hx;
      e.x += Math.sign(tx - e.x) * Math.min(Math.abs(tx - e.x), G.swim * dt);
      if (e.bubT <= 0) { e.bubT = 0.9 + Math.random(); X.ring(e.x, s.y, 4, '#6aa890'); }
      if (inReach && Math.abs(e.x - edge.x) < 10 && e.cd <= 0 && !P.dead && !(X.lampDraws && X.lampDraws(e) === false)) {   /* (claude/canal4: in the dark it does not find you) */ e.mode = 'rippleTell'; e.modeT = G.tell; e.edge = edge; X.mark(e, '!!', '#ff6b6b'); S.tell && S.tell(true); S.bubble ? S.bubble() : S.splash && S.splash(); }
    }
  }
  e.vx = 0; e.vy = 0;
}
/* ON HER DECK (claude/canalfix): it rides her where it came aboard, creeps at the rider, rings (!!: jump it) and grabs; a grab drags him for her
   nearest end. Three presses or a blow break it. Nobody aboard for a while: it slips back into the water where it stands */
function stepAboard(e, dt, X, P) {
  const G = GRIND, S = X.sfx, b = X.barge();
  if (!b) { e.aboard = false; e.mode = 'dunk'; e.modeT = 1; return; }
  const rider = P && !P.dead && P.onMover && P.onMover.canal;
  e.offT = rider || (e.grabbed) ? 0 : e.offT + dt;
  if (e.offT > 2.5 && e.mode !== 'grab') { e.aboard = false; e.hx = e.x; e.wet = null; e.mode = 'dunk'; e.modeT = 1.2; e.cd = G.cd; S.splash && S.splash(); return; }
  const endOf = x => x < b.x + b.w / 2 ? { x: b.x + 2, dir: -1 } : { x: b.x + b.w - 2, dir: 1 };
  switch (e.mode) {
    case 'deckTell':
      if (e.modeT <= 0) { const end = endOf(P.x);
        if (rider && P.ground && Math.abs(P.x - e.x) < G.reach + 4) { e.mode = 'grab'; e.modeT = G.hold; e.presses = 0; e.grabbed = P; e.edge = { x: end.x, y: P.y, dir: end.dir, barge: true };
          S.splash && S.splash(); X.hurtHero(e.x, G.grabDmg, { unblockable: true, who: e, name: 'THE GRINDYLOW' }); X.hint('grab', 'IT HAS YOUR ANKLE: JUMP, STRIKE, PULL AWAY - QUICKLY, OR INTO THE WATER.'); }
        else { e.mode = 'deck'; e.cd = G.cd * 0.6; } }
      break;
    case 'grab': {
      const H = e.grabbed; if (!H || H.dead) { e.mode = 'deck'; e.cd = G.cd; e.grabbed = null; break; }
      H.caged = Math.max(H.caged || 0, 0.12); H.vx = 0; const ed = e.edge; H.x += ed.dir * G.pull * dt; e.bx = Math.max(4, Math.min(b.w - 4, H.x - b.x - ed.dir * 6));
      const pr = X.press(); if (pr.jump || pr.atk || pr.left || pr.right) e.presses++;
      if (e.presses >= G.mash) { e.mode = 'stun'; e.modeT = G.stun; e.cd = G.cd; H.caged = 0; H.vy = -140; H.ground = false; e.grabbed = null; S.clank && S.clank(); X.mark(e, 'SHAKEN OFF', '#8fd160'); break; }
      const over = ed.dir < 0 ? H.x < b.x - 2 : H.x > b.x + b.w + 2;
      if (over || e.modeT <= 0) { H.caged = 0; H.onMover = null; H.ground = false; H.x = ed.dir < 0 ? Math.min(H.x, b.x - 8) : Math.max(H.x, b.x + b.w + 8); H.vy = 60; e.mode = 'deck'; e.cd = G.cd; e.grabbed = null; S.splash && S.splash(); }
      break; }
    case 'stun': if (e.modeT <= 0) { e.mode = 'deck'; e.cd = Math.max(e.cd, 0.6); } break;
    default: {   /* 'deck': creep at the rider */
      e.mode = 'deck';
      if (rider) { const want = P.x - b.x; e.bx += Math.sign(want - e.bx) * Math.min(Math.abs(want - e.bx), 34 * dt); e.face = Math.sign(P.x - e.x) || e.face;
        if (Math.abs(P.x - e.x) < G.reach && e.cd <= 0 && e.modeT <= 0) { e.mode = 'deckTell'; e.modeT = G.tell; X.mark(e, '!!', '#ff6b6b'); S.tell && S.tell(true); } }
    }
  }
  e.bx = Math.max(4, Math.min(b.w - 4, e.bx)); e.x = b.x + e.bx; e.y = b.y; e.vx = 0; e.vy = 0;
}
/* A BLOW ON A GRINDYLOW: nothing under the water; the ripple knocked up out of it; double out of it. Returns the damage multiplier (0: it finds nothing) */
export function grindylowTake(e) {
  if (e.mode === 'boardTell') { e.mode = 'lurk'; e.cd = GRIND.cd; return 1; }   /* struck as it hauls itself up: knocked back in */
  if (e.aboard && (e.mode === 'deck' || e.mode === 'deckTell')) return GRIND.weak;   /* on her deck: out of the water */
  if (e.mode === 'lurk' || e.mode === 'dunk') return 0;
  if (e.mode === 'rippleTell') { e.mode = 'stun'; e.modeT = GRIND.stun; e.cd = GRIND.cd; return 1; }
  if (e.mode === 'grab') { if (e.grabbed) { e.grabbed.caged = 0; e.grabbed = null; } e.mode = 'stun'; e.modeT = GRIND.stun; e.cd = GRIND.cd; return 1; }
  return GRIND.weak;   /* stun, stranded: out of the water */
}
export const grindylowUp = e => e.aboard || (e.mode !== 'lurk' && e.mode !== 'dunk');   /* is there a body above the water to see (and to hit) */

/* ================= THE WILL-O'-THE-WISP ================= */
export function newWisp(e, TS) { const [lx, ly] = e.lure || [Math.floor(e.x / TS), Math.floor(e.y / TS)]; Object.assign(e, { hx: e.x, hy: e.y - 10, lx: lx * TS + 8, ly: ly * TS, mode: 'bob', modeT: 0, cd: 0, noGrav: true, y: e.y - 10 }); return e; }
/* X: { hero(), cleared(x, y) (a horn has the fog clear here), solid(x, y), hurtHero, mark, sfx, ring, hint } */
/* (claude/canalfix3, Daniel 10-02: "rebuild the wisp on the Burning Village's ember wisp") THE WISP IS THE EMBER WISP'S BODY AND AI, COLD: it drifts on a
   wide turning circle (it cannot double back on you, and it will not pin you to a wall), and close to you it stops, GUTTERS (a yellow !: the shield
   turns what comes) and DARTS through where you stood - only the dart burns, and it falls away after. It keeps its own trick: while there is line left,
   it drifts on ahead of you along it as if it marked the way (off the bank, onto the weed). And it keeps the horn's rule: in air a horn has cleared it
   shies back to where it started and harms nobody. Popped, it is an EMBER a moment and RE-FORMS once (strike the ember and it is out for good). */
export function stepWisp(e, dt, X) {
  const W = WISP, P = X.hero(), S = X.sfx; e.modeT -= dt; e.cd -= dt; e.anim = e.anim || 0;
  e.recoil = Math.max(0, (e.recoil || 0) - dt); e.dartCd = Math.max(0, (e.dartCd || 0) - dt);
  const dx = P.x - e.x, dy = (P.y - 10) - e.y, d = Math.hypot(dx, dy), seen = !P.dead && Math.abs(dx) < W.notice && Math.abs(dy) < 110 && !(X.blind && X.blind(e, P));   /* (claude/canal4: in the tunnel's dark it sees only her light) */
  const solid = (x, y) => !!(X.solid && X.solid(x, y));
  const go = (tx, ty, sp) => { const ex = tx - e.x, ey = ty - e.y, dd = Math.hypot(ex, ey) || 1, k = Math.min(dd, sp * dt); e.x += ex / dd * k; e.y += ey / dd * k; };
  if (e.mode === 'spark') { e.vx = 0; e.vy = 0; if (e.modeT <= 0) { e.mode = 'bob'; e.reformed = true; e.recoil = W.recoil; e.dartCd = W.cd; X.mark && X.mark(e, '!', '#ffd36b'); X.ring && X.ring(e.x, e.y, 12, '#a0ffd2'); S.zap && S.zap(); } e.bob = Math.sin(e.anim * 9) * 1; return; }   /* the ember, re-forming */
  if (X.cleared(e.x, e.y) && e.mode !== 'dash') { if (e.mode !== 'shy') { e.mode = 'shy'; X.hint('shy', 'IN THE CLEAR AIR THE WISP HAS NO POST, AND NOTHING UNDER IT BUT WATER.'); } go(e.hx, e.hy, W.drift * 0.8); e.bob = Math.sin(e.anim * 2) * 2; return; }
  if (e.mode === 'shy') e.mode = 'bob';
  if (e.mode === 'flareTell') { e.x += Math.sin(e.anim * 40) * 0.4; if (e.modeT <= 0) { e.mode = 'dash'; e.modeT = W.dashT; e.hitOnce = false; const dd = d || 1; e.vx = dx / dd * W.dash; e.vy = dy / dd * W.dash; X.ring(e.x, e.y, 10, '#c8ffe0'); S.zap && S.zap(); } return; }
  if (e.mode === 'dash') { e.x += e.vx * dt; e.y += e.vy * dt; if (solid(e.x, e.y)) e.modeT = 0;
    if (!e.hitOnce && !P.dead && Math.hypot(P.x - e.x, (P.y - 10) - e.y) < W.hit) { e.hitOnce = true; X.hurtHero(e.x, W.dmg, { who: e, name: 'THE WISP', noKnock: true }); }   /* a burn, not a shove: it never throws you into the water it lured you to */
    if (e.modeT <= 0) { e.mode = 'hunt'; e.dartCd = W.cd; e.recoil = W.recoil; e.ang = Math.atan2(-e.vy, -e.vx); } e.face = e.vx < 0 ? -1 : 1; return; }
  if (!seen) { e.mode = 'bob'; go(e.hx, e.hy, W.drift * 0.6); e.bob = Math.sin(e.anim * 3.1) * 3; return; }
  /* ITS TRICK: ahead of you along its line while there is line left - a lamp that keeps a stride in front, the way a lamp on a path would */
  const ax = e.lx - e.hx, ay = e.ly - e.hy, len = Math.hypot(ax, ay) || 1, ux = ax / len, uy = ay / len;
  const along = Math.max(0, Math.min(len, (P.x - e.hx) * ux + (P.y - 10 - e.hy) * uy + W.ahead));
  if (!e.lured && along < len - 2 && d > W.harass) { e.mode = 'lure'; go(e.hx + ux * along, e.hy + uy * along, W.drift * 1.2); e.bob = Math.sin(e.anim * 3.1) * 3; return; }
  if (!e.lured && along >= len - 2) { e.lured = true; if (d < 90 && X.hint) X.hint('wisp', 'A LIGHT WITH NO POST UNDER IT IS A WISP: STRIKE IT.'); }   /* (claude/canalfix, review fix 10) the tell comes after the lure */
  /* THE HUNT (the ember wisp's): close to you it stops and gutters, then darts */
  e.mode = 'hunt';
  if (!P.dead && e.recoil <= 0 && e.dartCd <= 0 && d < W.harass && e.cd <= 0) { e.mode = 'flareTell'; e.modeT = W.tell; X.mark(e, '!', '#ffd36b'); S.tell && S.tell(false); return; }
  const home = Math.hypot(e.x - e.hx, e.y - e.hy) > W.home;
  let tgt;
  if (P.dead || home) tgt = Math.atan2(e.hy - e.y, e.hx - e.x);
  else if (e.recoil > 0) tgt = Math.atan2(-dy, -dx);
  else { tgt = Math.atan2(dy, dx); if (d < 64 && solid(P.x - (Math.sign(dx) || 1) * 22, P.y - 8)) tgt += Math.PI / 2; }   /* NEVER A CORNER */
  let da = tgt - (e.ang ?? tgt); while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  e.ang = (e.ang ?? tgt) + Math.max(-W.turn * dt, Math.min(W.turn * dt, da));
  const sp = e.recoil > 0 ? 55 : home ? 42 : W.drift;
  e.vx = Math.cos(e.ang) * sp; e.vy = Math.sin(e.ang) * sp + Math.sin(e.anim * 3) * 6;
  e.x += e.vx * dt; e.y += e.vy * dt;
  if (solid(e.x, e.y)) { e.x -= e.vx * dt; e.y -= e.vy * dt; e.ang += Math.PI * 0.6; }
  e.face = e.vx < 0 ? -1 : 1; e.bob = Math.sin(e.anim * 3.1) * 2;
}
/* A BLOW ON THE WISP: the first pop leaves an ember that re-forms (nothing lands); a blow on the ember puts it out for good. Returns the damage to land */
export function wispTake(e, dmg) {
  if (e.mode === 'spark') return Math.max(dmg, e.hp);
  if (!e.reformed && dmg >= e.hp) { e.mode = 'spark'; e.modeT = WISP.reform; e.vx = 0; e.vy = 0; e.popped = (e.popped || 0) + 1; return 0; }
  return dmg;
}

/* ================= THE GREYBOX ART (the art lane replaces it: brief, "art notes") =================
   Each set faces RIGHT (L is the flip), one canvas a frame; ax = the body's centre column, ay = the row under its lowest pixel. */
function pack(frames, ax, ay, w, h) { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)), whiteL = white.map(c => flipX(c)); return { R, L, white: { R: white, L: whiteL }, ax, ay, w, h }; }
const OUT = '#1b1626';
/* THE GRINDYLOW: a hunched green imp, slick with weed, long thin arms and long fingers, big pale eyes. 0 surfaced | 1 the reach (the grab) | 2 hurt | 3 stranded (flat on the wall) */
export function bakeGrindylow() { return CFA.bakeGrindylow(GRIND.w, GRIND.h); }   /* (claude/canalart: src/redraw/canal_foes_art.js - the rim-lit imp; same frames and box) */
/* THE WISP: a cold green flame with no post under it. 0, 1 the flicker | 2 guttering (the tell, brighter) */
export function bakeWisp() { return CFA.bakeWisp(WISP.w, WISP.h); }
export const grindylowFrame = e => e.hurtT > 0 ? 2 : e.mode === 'grab' || e.mode === 'rippleTell' || e.mode === 'deckTell' || e.mode === 'boardTell' ? 1 : e.mode === 'stranded' ? 3 : e.mode === 'stun' ? 2 : 0;
export const wispFrame = e => e.mode === 'flareTell' ? 2 : Math.floor(e.anim * 8) % 2;
