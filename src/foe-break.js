// src/foe-break.js - THE FOE PASS, LEVER 2: A COMMON FOE'S BREAK BAR FILLS FROM VARIED BLOWS, AND A FINISHER CARRIES YOU ON
// (claude/foepass, the ONE OPUS CORE lane of scratch/brief-foepass-1016.md; Daniel 10-16: "you can just largely ignore them").
//
// What was already there (and stays): every common foe carries a stagger bar (main.js poiseMax/addPoise, src/poise-break.js); full,
// it BREAKS - reels open under gold stars for ~2.4 s - and a melee blow that reaches it then is a FINISHER (src/finishers.js): the
// hero's own name for it over the foe, a stop, a flash, the camera in close. What the brief adds, here, on the same bar:
//
//   VARIED BLOWS FILL IT, THE SAME BLOW SPAMMED GOES STALE (the boss anti-mash's rule 1, src/anti-mash.js, brought down to the commons -
//     on the BAR only: a common foe's health still takes every blow whole). Blows on one foe inside FB.window of each other are one
//     EXCHANGE. In an exchange, a verb different from the last one pays FB.varied of its fill; the same verb again pays FB.stale[n]
//     (x1, 0.6, 0.35, 0.2...). THE LIGHT-BAR FOES (a goblin's 24: taps never moved it, only weight did) take FB.lightVaried from a
//     VARIED light verb - a cut after a sweep, a rising cut after a cut - so a hero who mixes his blows breaks a goblin without a heavy,
//     and a masher still never does. THE READ: a stale blow is heard duller and sparks dimmer (the boss rule's e.amStaleAt).
//   THE FINISHER PAYS (Daniel: "fighting well carries you into the next room", pairs with the Salt & Sanctuary death cost): a finished foe
//     refunds FB.refund.st of wind and FB.refund.hpPct of the hero's max health (never under hpMin). Kills keep their XP and coins.
//   A PLUNGE FINISHES TOO: the brief names heavy / plunge / riposte. Any melee blow already finished a broken foe; a plunge was the one
//     blow that did not (it cut it and bounced). Now it finishes it and bounces (the pogo off the body is kept).
//
// Elites, bosses and minis are outside all of it (their bars are src/anti-mash.js and src/elite-kit.js). main.js hooks: addPoise
// (FB.fillMul / FB.lightAdd for a common foe), finishFoe's api (refund), the plunge branch of the melee hit loop (FB.plungeFinish).
// tools/foe-pass.mjs proves the rules here; tools/foe-pass-page.mjs proves them in the page.

export const FB = {
  on: true,
  window: 2.5,                       // s: blows on one foe closer together than this are one exchange
  varied: 1.35,                      // x on a verb that differs from the last one in the exchange
  stale: [1, 0.6, 0.35, 0.2],        // x on the 1st, 2nd, 3rd, 4th+ landing of the SAME verb in a row (the floor repeats)
  lightVaried: 9,                    // added to a LIGHT-bar foe's fill by a varied LIGHT verb (cut / sweep / rise / shot / dash): 3 varied taps break a 24
  refund: { st: 12, hpPct: 0.03, hpMin: 2 },   // a finisher: wind back (the freebooter's parry asks 14; src/commit.js STAM.refundCap holds any one refund to 12) + ~3% max hp (Daniel 10-16: "a sliver")
  plungeFinish: true,
};
/* THE VERBS THAT ARE A HERO'S HAND (src/anti-mash.js HAND_VERBS: a room's throw or a seed sent back is never counted) */
export const VERBS = new Set(['cut', 'heavy', 'plunge', 'sweep', 'rise', 'dash', 'shot', 'riposte', 'skill']);
export const LIGHT_VERBS = new Set(['cut', 'sweep', 'rise', 'shot', 'dash']);

/* THE COUNT. e.fbx = { verb, n, at }. Returns { k, varied, stale } for this landing; a verb outside VERBS (or none) is x1 and counts nothing. */
export function vary(e, verb, now) {
  if (!FB.on || !e || !VERBS.has(verb)) return { k: 1, varied: false, stale: false };
  const s = e.fbx;
  if (!s || !(now - s.at < FB.window)) { e.fbx = { verb, n: 1, at: now }; return { k: 1, varied: false, stale: false }; }
  s.at = now;
  if (s.verb !== verb) { s.verb = verb; s.n = 1; return { k: FB.varied, varied: true, stale: false }; }
  s.n++; const k = FB.stale[Math.min(s.n, FB.stale.length) - 1];
  return { k, varied: false, stale: k < 1 };
}
/* WHAT A VARIED LIGHT VERB ADDS to a light-bar foe's fill (0 for anything else) */
export const lightAdd = (v, verb, lightBar) => (lightBar && v.varied && LIGHT_VERBS.has(verb) ? FB.lightVaried : 0);
/* THE REFUND of one finisher, for a hero of max health maxHp: { st, hp } */
export const refundOf = maxHp => ({ st: FB.refund.st, hp: Math.max(FB.refund.hpMin, Math.round((maxHp || 100) * FB.refund.hpPct)) });
