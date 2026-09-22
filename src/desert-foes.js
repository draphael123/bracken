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

export const SCORPION = { hp: 34, speed: 26, clawR: 22, clawTell: 0.5, claw: 0.2, stingR: 40, stingTell: 0.75, sting: 0.25, cd: 1.1, patch: 64, w: 16, h: 9 };
export const VULTURE = { hp: 22, alt: 90, circleR: 60, circleT: 4, watch: 0.8, diveV: 260, perch: 1.1, climb: 1.2, cd: 2.5, w: 22, h: 10 };
export const SANDGOB = { hp: 26, speed: 44, wake: 56, rise: 0.5, knifeTell: 0.45, knife: 0.18, cd: 0.8, cuts: 2, burrow: 0.45, under: 0.7, ahead: 70, w: 10, h: 16 };

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
export function sandGobStep(e, w, dt) {
  const out = [], d = w.px - e.x, ad = Math.abs(d); e.t -= dt; e.cd -= dt;
  switch (e.mode) {
    case 'buried': e.frame = 0; if (ad < SANDGOB.wake && Math.abs(w.py - e.y) < 30) { e.mode = 'rise'; e.t = SANDGOB.rise; e.frame = 1; e.face = Math.sign(d) || 1; ev(out, 'tell', { what: 'rise', mark: '!' }); } break;   /* the sand pouring off it IS the tell */
    case 'rise': if (e.t <= 0) { e.mode = 'walk'; e.cd = 0.25; } break;
    case 'walk': e.face = Math.sign(d) || e.face; e.frame = 2 + (Math.floor(w.time * 8) % 2);
      if (e.cuts >= SANDGOB.cuts || ad > 150) { e.mode = 'burrow'; e.t = SANDGOB.burrow; e.frame = 6; break; }
      if (e.cd <= 0 && ad < 26) { e.mode = 'knifeTell'; e.t = SANDGOB.knifeTell; e.frame = 4; ev(out, 'tell', { what: 'knife', mark: '!' }); }
      else if (ad > 18) e.x += e.face * SANDGOB.speed * dt;
      break;
    case 'knifeTell': if (e.t <= 0) { e.mode = 'knife'; e.t = SANDGOB.knife; e.frame = 5; e.cuts++; ev(out, 'hit', { what: 'knife', mark: '!', box: [e.x + (e.face > 0 ? 2 : -24), e.x + (e.face > 0 ? 24 : -2), e.y - 14, e.y - 2], blockable: true, dmg: 7 }); } break;
    case 'knife': if (e.t <= 0) { e.mode = 'walk'; e.cd = SANDGOB.cd; } break;
    case 'burrow': if (e.t <= 0) { e.mode = 'under'; e.t = SANDGOB.under; } break;
    case 'under': if (e.t <= 0) { e.x = w.px + (w.pface || 1) * SANDGOB.ahead; e.cuts = 0; e.mode = 'buried'; } break;       /* it comes up again AHEAD of you, as a mound: you can see where it is */
  }
  return out;
}
