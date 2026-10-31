// src/bell-lock.js - BELL SHORTEN (claude/bellshort, Daniel 10-29 16:13: "being hit/stuck by a bell lasts 3-4 s of swinging around ->
// shorten to ~1 s, game-wide"). ONE number for how long a bell may keep a hero (or its own swing) going after a strike or toll.
// The bell's impact, ring and first swing stay; the lock ends by BELL_LOCK_MAX. Boss/foe-side windows that a bell opens (the Temple
// Guardian's toll swing, the Lance's pin) are NOT hero locks and are left to their own tuning lanes (see the lane report).
export const BELL_LOCK_MAX = 1.0;
/* a bell's swing / carry / knock timer, capped */
export const bellLock = t => Math.min(BELL_LOCK_MAX, t);
