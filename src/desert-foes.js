// src/desert-foes.js — how THE SUNKEN CARAVAN's creatures behave, as pure state machines (no DOM, no main.js), the same shape
// as src/dune-worm.js: the level batch gives each a spawn case that feeds step() the world every frame and turns its
// events into hitboxes, tells (the house marks: '!' yellow = the shield turns it, 'X' red = move), sounds and the frames of
// src/redraw/desert_foes.js. THE TOUCH RULE holds: nothing here hurts by being touched, only by a `hit` event.
// tools/caravan.mjs checks each one: every attack is told, and a fighter who reacts to the tell in a human quarter-second
// takes nothing, while one who ignores them is hurt.
//
//   SCORPION  walks its patch; CLAW (!) up close, blockable; STING (X) from a little further, over its own back - the one
//             that makes you move. Frames: 0,1 walk | 2 clawTell | 3 claw | 4 stingTell | 5 sting | 6 hurt
//   VULTURE   circles high over its patch; picks you, WATCHES (a red eye, and its shadow snaps onto your spot), then DIVES (X)
//             at that spot 0.8 s later; lands, and on the ground it is open for a beat before it labours back up. Its shadow is
//             moving SHADE (sunstroke.vultureShade): the thing hunting you is also the thing that cools you.
//             Frames: 0 glide | 1,2 flap | 3 diveTell | 4 dive | 5 perched
//   SAND GOBLIN buried in a mound (untouchable, harmless, two eyes showing); when you pass, it RISES (sand pouring off:
//             the tell that it is there) and cuts with its knife (!); after two cuts, or if you back off, it BURROWS and
//             comes up again ahead of you. Frames: 0 buried | 1 rising | 2,3 walk | 4 knifeTell | 5 knife | 6 burrowing
//             (NOT IN THE CARAVAN since 2026-09-25: "I don't want goblins in the level" - the Buried City's draft still plans it)
//
// THE BANDITS (Daniel, 2026-09-25: "there should be new bandit enemies replacing them"; docs/briefs/caravan-ruins-bandits.md).
// Men of the desert in sun-bleached cloth, looting the caravan; src/redraw/caravan_bandits.js draws them, tools/bandits.mjs proves them.
//   CUTTHROAT a scimitar, and HE FEINTS: every other time he comes in, a half-raised blade and a stamp (feintTell - told by
//             its pose and a scrape, and it throws NOTHING, so it wears no mark: rule H), a beat, then the REAL windup, which
//             is distinct - the blade high and back with a glint, the yellow ! (a shield turns it). Read the mark, not the arm.
//             Frames: 0,1 walk | 2 feintTell (half raised) | 3 feintHold (the stamp, blade down) | 4 slashTell (high, glint) | 5 slash | 6 hurt
//   SLINGER   the rooftop man: he stands on a ruin's top and stones the road. He whirls the sling and MARKS THE SPOT you
//             stand on (slingTell: ! - a shield turns a stone - and the game draws the arc to the mark), then looses, and
//             the stone flies that arc to that spot: step off the mark, or block. Up close he kicks (!). Climb to him and he
//             is yours. Frames: 0 stand | 1,2 whirl | 3 loose | 4 kickTell | 5 kick | 6 hurt
//   AMBUSHER  the sand goblin's trick under a sand cloak: buried, a mound with two eyes (untouchable, harmless); when you
//             pass he RISES with the sand pouring off the cloak (the tell), cuts twice (!), then throws the cloak over
//             himself and comes up again ahead of you. Frames: 0 buried | 1 rising | 2,3 walk | 4 cutTell | 5 cut | 6 burrowing | 7 hurt

export const SCORPION = { hp: 34, speed: 26, clawR: 22, clawTell: 0.5, claw: 0.2, stingR: 40, stingTell: 0.75, sting: 0.25, cd: 1.1, patch: 64, w: 16, h: 9 };
export const VULTURE = { hp: 22, alt: 90, circleR: 60, circleT: 4, watch: 0.8, diveV: 260, perch: 1.1, climb: 1.2, cd: 2.5, w: 22, h: 10 };
export const SANDGOB = { hp: 26, speed: 44, wake: 56, rise: 0.5, knifeTell: 0.45, knife: 0.18, cd: 0.8, cuts: 2, burrow: 0.45, under: 0.7, ahead: 70, w: 10, h: 16,
  tellMode: 'knifeTell', blowMode: 'knife', what: 'knife', reach: 26, hitW: 24, dmg: 7 };
export const CUTTHROAT = { hp: 38, speed: 46, sight: 150, reach: 28, feintTell: 0.4, feintHold: 0.3, slashTell: 0.5, slash: 0.18, cd: 0.9, dmg: 10, w: 10, h: 18 };
export const SLINGER = { hp: 24, sight: 230, minR: 30, rise: 240,   /* rise: how far below him he will throw - a tower's roof is twelve to fourteen rows over the road */ whirl: 0.8, loose: 0.18, flight: 0.75, cd: 2.2, dmg: 8, kickR: 24, kickTell: 0.4, kick: 0.15, kickDmg: 6, w: 10, h: 16 };
export const AMBUSHER = { hp: 32, speed: 50, wake: 52, rise: 0.55, cutTell: 0.45, cut: 0.18, cd: 0.8, cuts: 2, burrow: 0.5, under: 0.8, ahead: 72, w: 12, h: 18,
  tellMode: 'cutTell', blowMode: 'cut', what: 'cut', reach: 28, hitW: 26, dmg: 9 };

const ev = (a, t, extra) => a.push({ t, ...extra });
/* ---------------- SCORPION ---------------- */
export function newScorpion(x, y) { return { kind: 'scorpion', x, y, home: x, hp: SCORPION.hp, mode: 'walk', t: 0, face: 1, cd: 0.6, frame: 0 }; }
export function scorpionStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < 24;
  e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'walk': e.frame = Math.floor(w.time * 6) % 2;
      if (near && ad < 120) e.face = Math.sign(d) || e.face; else if (Math.abs(e.x - e.home) > SCORPION.patch) e.face = Math.sign(e.home - e.x);
      if (near && e.cd <= 0 && ad < SCORPION.stingR && e.next === 'sting') { e.mode = 'stingTell'; e.t = SCORPION.stingTell; e.frame = 4; e.next = 'claw'; ev(out, 'tell', { what: 'sting', mark: 'X' }); }   /* it alternates: after a claw, the sting, even up close - the one you have to move for */
      else if (near && e.cd <= 0 && ad < SCORPION.clawR) { e.next = 'sting'; e.mode = 'clawTell'; e.t = SCORPION.clawTell; e.frame = 2; ev(out, 'tell', { what: 'claw', mark: '!' }); }
      else if (near && e.cd <= 0 && ad < SCORPION.stingR) { e.mode = 'stingTell'; e.t = SCORPION.stingTell; e.frame = 4; ev(out, 'tell', { what: 'sting', mark: 'X' }); }
      else if (!(near && ad < SCORPION.clawR * 0.8)) e.x += e.face * SCORPION.speed * dt;
      break;
    case 'clawTell': if (e.t <= 0) { e.mode = 'claw'; e.t = SCORPION.claw; e.frame = 3; ev(out, 'hit', { what: 'claw', mark: '!', box: [e.x + (e.face > 0 ? 4 : -SCORPION.clawR - 4), e.x + (e.face > 0 ? SCORPION.clawR + 4 : -4), e.y - 10, e.y], blockable: true, dmg: 8 }); } break;
    case 'stingTell': if (e.t <= 0) { e.mode = 'sting'; e.t = SCORPION.sting; e.frame = 5; ev(out, 'hit', { what: 'sting', mark: 'X', box: [e.x + (e.face > 0 ? 8 : -SCORPION.stingR - 4), e.x + (e.face > 0 ? SCORPION.stingR + 4 : -8), e.y - 18, e.y - 2], dmg: 12, poison: true }); } break;
    case 'claw': case 'sting': if (e.t <= 0) { e.mode = 'walk'; e.cd = SCORPION.cd; } break;
  }
  return out;
}
/* ---------------- VULTURE ---------------- */
export function newVulture(x, groundY) { return { kind: 'vulture', x, y: groundY - VULTURE.alt, home: x, groundY, hp: VULTURE.hp, mode: 'circle', t: 0, a: 0, cd: 1.5, frame: 0, tx: x, ty: groundY }; }
export function vultureStep(e, w, dt) {
  const out = []; e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'circle': e.a += dt * Math.PI * 2 / VULTURE.circleT; e.x = e.home + Math.cos(e.a) * VULTURE.circleR; e.y = e.groundY - VULTURE.alt + Math.sin(e.a * 2) * 6; e.frame = Math.floor(w.time * 3) % 3;
      if (e.cd <= 0 && Math.abs(w.px - e.x) < 140) { e.mode = 'watch'; e.t = VULTURE.watch; e.frame = 3; e.tx = w.px; e.ty = w.py; ev(out, 'tell', { what: 'dive', mark: 'X', x: e.tx }); }   /* the MARK: its shadow snaps onto your spot as the eye goes red (locking it at the end of the watch left 0.1 s to react) */
      break;
    case 'watch': if (e.t <= 0) { e.mode = 'dive'; e.frame = 4; e.fx = e.x; e.fy = e.y; e.t = Math.hypot(e.tx - e.x, e.ty - e.y) / VULTURE.diveV; e.t0 = e.t; } break;   /* it dives at the spot it marked when the eye went red: leave the shadow */
    case 'dive': { const k = 1 - Math.max(0, e.t) / e.t0; e.x = e.fx + (e.tx - e.fx) * k; e.y = e.fy + (e.ty - e.fy) * k;
      ev(out, 'hit', { what: 'dive', mark: 'X', box: [e.x - 9, e.x + 9, e.y - 10, e.y + 2], dmg: 10 });
      if (e.t <= 0) { e.mode = 'perched'; e.t = VULTURE.perch; e.y = e.groundY; e.frame = 5; } break; }
    case 'perched': if (e.t <= 0) { e.mode = 'climb'; e.t = VULTURE.climb; e.frame = 1; } break;                             /* on the ground: open */
    case 'climb': { const k = Math.min(1, 1 - e.t / VULTURE.climb); e.y = e.groundY - VULTURE.alt * k; e.x += (e.home - e.x) * Math.min(1, dt * 1.5); e.frame = 1 + (Math.floor(w.time * 8) % 2);
      if (e.t <= 0) { e.mode = 'circle'; e.cd = VULTURE.cd; e.a = Math.acos(Math.max(-1, Math.min(1, (e.x - e.home) / VULTURE.circleR))); } break; }
  }
  return out;
}
export const vultureOpen = e => e.mode === 'perched' || e.mode === 'climb';
/* ---------------- SAND GOBLIN ---------------- */
export function newSandGob(x, y) { return { kind: 'sandgob', x, y, hp: SANDGOB.hp, mode: 'buried', t: 0, face: -1, cd: 0, cuts: 0, frame: 0 }; }
export const sandGobTouchable = e => !['buried', 'under'].includes(e.mode);
/* THE BURIED ONES: the sand goblin's machine, and the ambusher's (the same trick under a sand cloak), each with its own numbers */
function buriedStep(e, w, dt, K) {
  const out = [], d = w.px - e.x, ad = Math.abs(d); e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'buried': e.frame = 0; if (ad < K.wake && Math.abs(w.py - e.y) < 30) { e.mode = 'rise'; e.t = K.rise; e.frame = 1; e.face = Math.sign(d) || 1; ev(out, 'tell', { what: 'rise', mark: '!' }); } break;   /* the sand pouring off it IS the tell */
    case 'rise': if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.25; } break;
    case 'walk': e.face = Math.sign(d) || e.face; e.frame = 2 + (Math.floor(w.time * 8) % 2);
      if (e.cuts >= K.cuts || ad > 150) { e.mode = 'burrow'; e.t = K.burrow; e.frame = 6; break; }
      if (e.cd <= 0 && ad < K.reach) { e.mode = K.tellMode; e.t = K[K.tellMode]; e.frame = 4; ev(out, 'tell', { what: K.what, mark: '!' }); }
      else if (ad > 18) e.x += e.face * K.speed * dt;
      break;
    case K.tellMode: if (e.t <= 0) { e.mode = K.blowMode; e.t = K[K.blowMode]; e.frame = 5; e.cuts++; ev(out, 'hit', { what: K.what, mark: '!', box: [e.x + (e.face > 0 ? 2 : -K.hitW), e.x + (e.face > 0 ? K.hitW : -2), e.y - 14, e.y - 2], blockable: true, dmg: K.dmg }); } break;
    case K.blowMode: if (e.t <= 0) { e.mode = 'walk'; e.cd = K.cd; } break;
    case 'burrow': if (e.t <= 0) { e.mode = 'under'; e.t = K.under; } break;
    case 'under': if (e.t <= 0) { e.x = w.px + (w.pface || 1) * K.ahead; e.cuts = 0; e.mode = 'buried'; } break;       /* it comes up again AHEAD of you, as a mound: you can see where it is */
  }
  return out;
}
export const sandGobStep = (e, w, dt) => buriedStep(e, w, dt, SANDGOB);
/* ---------------- THE SAND-CLOAKED AMBUSHER ---------------- */
export function newAmbusher(x, y) { return { kind: 'ambusher', x, y, hp: AMBUSHER.hp, mode: 'buried', t: 0, face: -1, cd: 0, cuts: 0, frame: 0 }; }
export const ambusherTouchable = sandGobTouchable;   /* buried or under, the blade goes through the cloak and the sand: nothing there to cut, and nothing there that cuts */
export const ambusherStep = (e, w, dt) => buriedStep(e, w, dt, AMBUSHER);
/* ---------------- THE CUTTHROAT ---------------- */
export function newCutthroat(x, y) { return { kind: 'cutthroat', x, y, home: x, hp: CUTTHROAT.hp, mode: 'walk', t: 0, face: -1, cd: 0.5, frame: 0, n: 0 }; }
export function cutthroatStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), near = Math.abs(w.py - e.y) < 28, C = CUTTHROAT; e.t -= dt; e.cd -= dt;
  const real = () => { e.face = Math.sign(d) || e.face; e.mode = 'slashTell'; e.t = C.slashTell; e.frame = 4; ev(out, 'tell', { what: 'slash', mark: '!' }); };
  switch (e.mode) {
    case 'walk': e.frame = Math.floor(w.time * 7) % 2;
      if (near && ad < C.sight) e.face = Math.sign(d) || e.face;
      if (near && e.cd <= 0 && ad < C.reach + 6) {
        if (e.n++ % 2 === 0) { e.mode = 'feintTell'; e.t = C.feintTell; e.frame = 2; ev(out, 'tell', { what: 'feint', mark: '' }); }   /* THE FEINT: told, and nothing behind it */
        else real(); }
      else if (near && ad < C.sight && ad > C.reach * 0.7) e.x += e.face * C.speed * dt;
      break;
    case 'feintTell': if (e.t <= 0) { e.mode = 'feintHold'; e.t = C.feintHold; e.frame = 3; ev(out, 'feinted', {}); } break;   /* he stops short with a stamp: it was nothing - and now it is something */
    case 'feintHold': if (e.t <= 0) real(); break;
    case 'slashTell': if (e.t <= 0) { e.mode = 'slash'; e.t = C.slash; e.frame = 5; ev(out, 'hit', { what: 'slash', mark: '!', box: [e.x + (e.face > 0 ? 2 : -C.reach - 2), e.x + (e.face > 0 ? C.reach + 2 : -2), e.y - 18, e.y - 2], blockable: true, dmg: C.dmg }); } break;
    case 'slash': if (e.t <= 0) { e.mode = 'walk'; e.cd = C.cd; } break;
  }
  return out;
}
/* ---------------- THE ROOFTOP SLINGER ---------------- */
export function newSlinger(x, y) { return { kind: 'slinger', x, y, hp: SLINGER.hp, mode: 'stand', t: 0, face: -1, cd: 1.2, frame: 0, stone: null, tx: x, ty: y }; }
/* where the stone is at k (0..1) of its flight: a straight line from the sling to the mark, lifted by a parabola */
export function stoneAt(s, k) { const arc = 30 + Math.abs(s.tx - s.x0) * 0.3; return [s.x0 + (s.tx - s.x0) * k, s.y0 + (s.ty - s.y0) * k - arc * 4 * k * (1 - k)]; }
export function slingerStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d), dy = w.py - e.y, S = SLINGER; e.t -= dt; e.cd -= dt;
  if (e.stone) { const s = e.stone; s.t += dt; const k = Math.min(1, s.t / s.T), [x, y] = stoneAt(s, k); s.x = x; s.y = y;   /* the stone flies on whatever he does next */
    ev(out, 'hit', { what: 'stone', mark: '!', box: [x - 4, x + 4, y - 4, y + 4], blockable: true, dmg: S.dmg, stone: true });
    if (k >= 1) { ev(out, 'land', { x, y }); e.stone = null; } }
  switch (e.mode) {
    case 'stand': e.frame = 0; if (ad < S.sight) e.face = Math.sign(d) || e.face;
      if (e.cd <= 0 && ad < S.kickR && Math.abs(dy) < 24) { e.mode = 'kickTell'; e.t = S.kickTell; e.frame = 4; ev(out, 'tell', { what: 'kick', mark: '!' }); }
      else if (e.cd <= 0 && !e.stone && ad < S.sight && ad > S.minR && dy > -48 && dy < S.rise) { e.mode = 'slingTell'; e.t = S.whirl; e.tx = w.px; e.ty = w.py; e.frame = 1;
        ev(out, 'tell', { what: 'sling', mark: '!', x: e.tx, y: e.ty }); }   /* THE MARK: the spot you stand on as he starts to whirl, and the arc to it is drawn */
      break;
    case 'slingTell': e.frame = 1 + (Math.floor(e.t * 10) % 2); if (e.t <= 0) { e.mode = 'loose'; e.t = S.loose; e.frame = 3;
      const x0 = e.x + e.face * 6, y0 = e.y - 14; e.stone = { x0, y0, x: x0, y: y0, tx: e.tx, ty: e.ty, t: 0, T: S.flight }; ev(out, 'loose', {}); } break;
    case 'loose': if (e.t <= 0) { e.mode = 'stand'; e.cd = S.cd; } break;
    case 'kickTell': if (e.t <= 0) { e.mode = 'kick'; e.t = S.kick; e.frame = 5; ev(out, 'hit', { what: 'kick', mark: '!', box: [e.x + (e.face > 0 ? 2 : -S.kickR), e.x + (e.face > 0 ? S.kickR : -2), e.y - 10, e.y - 1], blockable: true, dmg: S.kickDmg }); } break;
    case 'kick': if (e.t <= 0) { e.mode = 'stand'; e.cd = 1.0; } break;
  }
  return out;
}
