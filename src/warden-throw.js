// src/warden-throw.js - THE WARDEN'S JAVELIN THROW (claude/herofeel, Daniel 11-02 20:34 / 20:42). HOLD C winds a three-tier throw, like the pyro's held fireball: she walks slowly while
// it winds, and lets go to throw. TAP C is still the DEFLECT (the press fires it); the passive point and Vigil -> PHALANX are untouched. It REPLACES the hold-C spear-haft brace
// (src/warden-brace.js, gone: the brace turned any yellow blow with no timing - the Warden was 85% pooled on the demo bosses).
//   tier 1  a quick SHORT throw            one foe, one hit
//   tier 2  a HEAVY throw                  the first foe is hit hard, KNOCKED BACK and staggered (NOT a pierce: the Ranger's piercing shot and her own Run-Through skewer lines)
//   tier 3  the PIN                        the first foe is driven back against a wall (or the floor) and held a beat; a boss / mini is hit and staggered, never held (resist floor)
// The spear comes back AT ONCE (a visual: she is never unarmed - this is not the bought JAVELIN skill, which leaves her bare-handed), and a short breath (rec) follows each throw.
// main.js owns the world: wthTick (the clock), wthThrow (the spear), wthDraw. This file is the numbers, so a check can read them without the page.
export const WTH = {
  steps: [0.30, 0.80, 1.45],   /* s C is held before each tier is wound (a tap, under steps[0], is only the deflect) */
  cost: [9, 15, 24],           /* stamina at the throw (paid at release, like the pyro's held tiers; short of it the throw is dropped) */
  slow: 0.38,                  /* x her run while winding */
  rec: 0.5,                    /* s after a throw before the next wind */
  speed: [460, 400, 520],      /* px/s of the spear in flight */
  range: [88, 128, 176],       /* px it flies before it gives up (a short throw, a heavy throw, the long pin) */
  dmg: [0.9, 1.5, 2.0],        /* x sword damage */
  knock: 260,                  /* tier 2: the shove (px/s) on a small foe */
  stagger: 0.7,                /* tier 2 / 3: s a small foe is staggered */
  bossStagger: 0.3,            /* a boss / mini that takes a tier 2 / 3 flinches this long ... */
  bossCd: 3,                   /* ... and not again inside this many s (never a stun-lock) */
  pinSlide: 40,                /* tier 3: px the foe is driven back toward a wall before it is pinned */
  back: 700,                   /* px/s of the spear's return (a visual) */
};
export const wthTier = held => held >= WTH.steps[2] ? 3 : held >= WTH.steps[1] ? 2 : held >= WTH.steps[0] ? 1 : 0;
export const WTH_TEXT = 'TAP C DEFLECTS. HOLD C WINDS THE JAVELIN: A QUICK THROW, A HEAVY THROW THAT KNOCKS BACK, THEN THE PIN.';
