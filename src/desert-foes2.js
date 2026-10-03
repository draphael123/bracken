// src/desert-foes2.js - THE DESERT'S SECOND CAST (claude/desertfoes, Daniel 10-03: "the desert roster is mostly cutthroats; Well Town feels samey").
// Pure: no DOM, no main.js - the same shape as src/desert-foes.js. src/desert-foes2-hands.js binds it to the game; tools/desert-foes2.mjs proves it
// (every attack told, a quarter-second reactor takes nothing, an ignorer is hurt, the touch rule, the patch put out, the venom in, the worm flushed).
//
//   FIRE SCORPION   the scorpion's machine (src/desert-foes.js scorpionStep: the claw !, the sting X) in red and ember. Its STING leaves a BURNING
//                   PATCH where it struck, and so does its death. A patch burns PATCH.life s and ticks a hero who stands in it; THE POUR (the Well
//                   Town's verb) puts it out, and so does a flood. Drawn: src/redraw/desert_foes2.js bakeFireScorpion / drawPatch.
//   VENOM SCORPION  the scorpion's machine in green. A sting that lands puts VENOM in you: THE CISTERN QUEEN's rule (src/cistern-queen.js CQ.venom: a
//                   stack each, three at most, each slowing stamina's return by a quarter for six seconds) on the venom HUD (src/venom-hud.js). Placed
//                   in the Well Town's cisterns and the gorge, and meant for THE UNDERWELL, the Queen's own level, as her brood.
//   SANDWORM        THE ONE NEW FOE: the sand goblin's buried machine (rise, strike, burrow, come up ahead) under a worm's skin, told by THE DUNE
//                   WORM's ripple (src/dune-worm.js: the sand bulges and runs at you). It keeps a BED (a stretch of sand: the gorge's dry riverbed, a
//                   sand room) and never leaves it:
//                     lurk (nothing shows) -> RIPPLE (a hump in the sand tracking you: untouchable, harmless) -> LUNGE TELL (X: it stops and the sand
//                     domes up on its spot) -> LUNGE (up out of the sand: the blow) -> EXPOSED (up and swaying, open: cut it) -> BURROW -> under ->
//                     up again AHEAD of you as a ripple.
//                   THE FLOOD FLUSHES IT: when the gorge's HORN sounds (w.flood), it burrows at once and keeps down until the water has gone by.
//                   Frames: 0 mound (the ripple's head) | 1 lunge tell (the dome cracking) | 2 lunge (up, jaws wide) | 3,4 exposed (swaying) |
//                   5 burrowing | 6 hurt
// (THE DYNAMITE BANDIT and THE SHIELD GUARD are the sapper's and the shieldgob's AI under men's skins - cnSkin 'dynamiter' / 'shieldguard', the
// canal's reskin rule - so their machines are main.js's; the gorge's one twist, the flood dousing a fuse, is DOUSE below.)

export const PATCH = { life: 8, w: 22, tick: 0.6, dmg: 4, max: 2, deathLife: 6 };   /* a burning patch: px wide, s between ticks, damage a tick; at most `max` live from one scorpion */
export const VENOM = { max: 3, slow: 0.25, t: 6 };                                    /* THE CISTERN QUEEN's (src/cistern-queen.js CQ.venom), restated so the pure check needs no boss module */
export const SANDWORM = { hp: 30, wake: 120, wakeY: 40, rippleV: 64, rippleMin: 0.7, rippleMax: 3.0, strikeR: 14, lungeTell: 0.6, lunge: 0.28, exposed: 1.3, burrow: 0.45,
  under: 0.55, ahead: 64, dmg: 14, lungeR: 13, lungeH: 30, bed: 96, flushAfter: 1.0, w: 12, h: 14 };
export const DOUSE = { fizzle: 0.25 };   /* a lit charge in running water is out in this long (its steam is the tell) */

/* ---------------- THE BURNING PATCH ---------------- */
export function newPatch(x, y, from, life = PATCH.life) { return { x, y, t: life, life, tick: 0, from: from || null, out: false }; }
/* one patch, one frame: heroes [{ x, y, w }] -> the heroes it burns this frame (a tick at most every PATCH.tick s, per patch) */
export function patchStep(p, heroes, dt) {
  const burnt = []; if (p.out) return burnt;
  p.t -= dt; p.tick = Math.max(0, p.tick - dt); if (p.t <= 0) { p.out = true; return burnt; }
  if (p.tick > 0) return burnt;
  for (const h of heroes) if (Math.abs(h.x - p.x) < PATCH.w / 2 + (h.w || 10) / 2 - 2 && h.y > p.y - 14 && h.y <= p.y + 4) { burnt.push(h); }
  if (burnt.length) p.tick = PATCH.tick;
  return burnt;
}
/* THE POUR: which live patch a hero facing `face` at (x, y) would pour on (the near one in front, inside reach R px), or null */
export function pourPatch(patches, x, y, face, R) {
  let best = null, bd = 1e9;
  for (const p of patches) { if (p.out) continue; const d = (p.x - x) * (face || 1); if (d < -PATCH.w / 2 || d > R + PATCH.w / 2 || Math.abs(p.y - y) > 20) continue; if (d < bd) { bd = d; best = p; } }
  return best;
}
/* put a patch out, and any other within a patch's width of it (one sip runs across touching flames) -> how many went out */
export function dousePatches(patches, p) { let n = 0; for (const q of patches) if (!q.out && Math.abs(q.x - p.x) <= PATCH.w && Math.abs(q.y - p.y) < 8) { q.out = true; q.doused = true; n++; } return n; }

/* ---------------- THE VENOM (THE CISTERN QUEEN's rule) ---------------- */
export function venomOn(P, n, V = VENOM) { P.cqVenom = P.cqVenom || []; for (let i = 0; i < n; i++) { if (P.cqVenom.length >= V.max) P.cqVenom.shift(); P.cqVenom.push(V.t); } P.venomSlow = Math.max(0.1, 1 - V.slow * P.cqVenom.length); }
export function venomTick(P, dt, V = VENOM) { const v = P.cqVenom || []; for (let i = 0; i < v.length; i++) v[i] -= dt; P.cqVenom = v.filter(t => t > 0); P.venomSlow = Math.max(0.1, 1 - V.slow * P.cqVenom.length); }

/* ---------------- THE SANDWORM ---------------- */
/* bed: [x0, x1] px of sand it keeps (default its spawn +- SANDWORM.bed) */
export function newSandworm(x, y, bed) { return { kind: 'sandworm', x, y, home: x, bed: bed || [x - SANDWORM.bed, x + SANDWORM.bed], hp: SANDWORM.hp, mode: 'lurk', t: 0, rt: 0, face: -1, frame: 0, flushed: 0, lunges: 0 }; }
const TOUCH = new Set(['lunge', 'exposed', 'burrow']);
/* can a blow land on it: only while it is up out of the sand (a ripple and a dome are sand) */
export const sandwormTouchable = s => TOUCH.has(s.mode) && !(s.mode === 'burrow' && s.t < SANDWORM.burrow * 0.4);
/* is anything of it on the screen to read (the hands draw the ripple, the dome or the worm) */
export const sandwormShown = s => s.mode !== 'lurk' && s.mode !== 'under' && s.mode !== 'deep';
const clampBed = (s, x) => Math.max(s.bed[0], Math.min(s.bed[1], x));
/* one step. w = { px, py, pface, time, flood (the gorge's horn or torrent is on: true) } -> events [{ t: 'tell'|'hit'|'flushed'|'rise'|'burrow', ... }] */
export function sandwormStep(s, w, dt) {
  const out = [], K = SANDWORM, d = w.px - s.x, ad = Math.abs(d), inBed = w.px > s.bed[0] - 24 && w.px < s.bed[1] + 24, nearY = Math.abs(w.py - s.y) < K.wakeY;
  s.t -= dt;
  /* THE FLOOD FLUSHES IT: at the horn it goes down at once (from whatever it was doing) and stays down until the water has gone by */
  if (w.flood && s.mode !== 'deep') {
    if (s.mode === 'lunge' || s.mode === 'exposed' || s.mode === 'lungeTell') { s.mode = 'burrow'; s.t = K.burrow; s.frame = 5; s.flushNext = true; out.push({ t: 'burrow', flush: true }); }
    else if (s.mode !== 'burrow') { s.mode = 'deep'; s.t = K.flushAfter; s.flushed++; out.push({ t: 'flushed', x: s.x }); }
  }
  switch (s.mode) {
    case 'deep': if (w.flood) s.t = K.flushAfter; else if (s.t <= 0) { s.mode = 'lurk'; s.x = s.home; } break;   /* down under the bed until the water is past, then back to its own sand */
    case 'lurk': s.frame = 0; if (ad < K.wake && nearY && inBed) { s.mode = 'ripple'; s.rt = 0; s.face = Math.sign(d) || 1; out.push({ t: 'tell', what: 'ripple', mark: '' }); } break;   /* the hump in the sand IS the tell that it is there: no blow yet, no mark */
    case 'ripple': { s.rt += dt; s.frame = 0;
      if (!inBed || !nearY) { if (s.rt > K.rippleMin) { s.mode = 'under'; s.t = K.under; s.goHome = true; } break; }   /* you left its sand: it sinks and waits */
      const v = Math.sign(d) * Math.min(ad / dt, K.rippleV); s.x = clampBed(s, s.x + v * dt); s.face = Math.sign(d) || s.face;
      if (s.rt >= K.rippleMin && (Math.abs(w.px - s.x) <= K.strikeR || s.rt >= K.rippleMax)) { s.mode = 'lungeTell'; s.t = K.lungeTell; s.frame = 1; out.push({ t: 'tell', what: 'lunge', mark: '!!', x: s.x }); }   /* IT STOPS AND THE SAND DOMES: the spot is locked - be off it */
      break; }
    case 'lungeTell': s.frame = 1; if (s.t <= 0) { s.mode = 'lunge'; s.t = K.lunge; s.frame = 2; s.lunges++; s.hit = false; out.push({ t: 'rise', x: s.x }); } break;
    case 'lunge': s.frame = 2; if (!s.hit) { s.hit = true; out.push({ t: 'hit', what: 'lunge', mark: '!!', box: [s.x - K.lungeR, s.x + K.lungeR, s.y - K.lungeH, s.y], dmg: K.dmg }); }
      if (s.t <= 0) { s.mode = 'exposed'; s.t = K.exposed; } break;
    case 'exposed': s.frame = 3 + (Math.floor(w.time * 4) % 2); if (s.t <= 0) { s.mode = 'burrow'; s.t = K.burrow; s.frame = 5; out.push({ t: 'burrow' }); } break;   /* up and swaying: OPEN */
    case 'burrow': s.frame = 5; if (s.t <= 0) { if (s.flushNext) { s.flushNext = false; s.mode = 'deep'; s.t = K.flushAfter; s.flushed++; out.push({ t: 'flushed', x: s.x }); } else { s.mode = 'under'; s.t = K.under; } } break;
    case 'under': if (s.t <= 0) { if (s.goHome) { s.goHome = false; s.x = s.home; s.mode = 'lurk'; break; }
        s.x = clampBed(s, w.px + (w.pface || 1) * K.ahead); s.mode = 'ripple'; s.rt = 0; out.push({ t: 'tell', what: 'ripple', mark: '' }); } break;   /* it comes up AHEAD of you, as a ripple: you can see where it is */
  }
  return out;
}
export function sandwormHurt(s, dmg) { if (!sandwormTouchable(s)) return 0; s.hp = Math.max(0, s.hp - dmg); return dmg; }
