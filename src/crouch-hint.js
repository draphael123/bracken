// src/crouch-hint.js - THE FIRST-CROUCH HINT (claude/crouchfix, Daniel 2026-10-11): the first time each hero crouches (per save slot: PROG.crouchFirst[hero])
// one short line names THEIR twist. The twists are in src/crouch-a.js (knight, warden, freebooter), src/crouch-b.js (paladin, geomancer; the blood knight's low guard + BLOOD SPIKE is main.js dkKneelTakes),
// src/crouch-c.js (berserker) and src/ember-ward.js (pyromancer); the lines are one table here (FIRST) so tools/textfit.mjs reads them all.
// It goes through the game's hint box and its toast queue like every other hint, and WAITS for the box to be quiet: the marsh already stacks two toasts
// in its first seconds, and a third must come after them, not cut in (main.js hands in quiet() - no hint showing, none waiting). A hero who has
// already been taught his twist by its own contextual line (PROG.crouchTold_*, kneelTold, senseTold, harvestTold, workTold) is not told twice.
export const FIRST = {
  knight: 'HOLD DOWN: YOUR SHIELD GOES LOW. X FROM THERE TRIPS.',
  warden: 'HOLD DOWN: THE SPEAR IS SET AGAINST A CHARGE.',
  pirate: 'HOLD DOWN WHEN EMPTY TO RELOAD TWICE AS FAST.',
  paladin: 'KNEEL BY A HOLY LIGHT TO FILL YOUR LIGHT.',
  pyro: 'HOLD DOWN TO FLARE.',
  geomancer: 'HOLD DOWN: WHAT HIDES IN THE GROUND SHOWS.',
  reaper: 'DOWN: A LOW GUARD. KNEEL AS ANY BLOW LANDS: BLOOD SPIKE.',   /* (claude/bkkit2: any blow on the beat) */   /* (claude/bloodknight: the harvest is gone; DOWN+C is BLOOD PRICE) */
  berserker: 'DOWN TO COIL, A WAY, LET GO: POUNCE. FULL: DOWN+C.',
  ranger: 'HOLD DOWN AND TAP C: A SNARE AT YOUR FEET.',   /* (claude/ranger) */
};
/* the flags the twists' own teaching lines leave: a hero who has one has been told */
const TOLD = { knight: 'crouchTold_knight', warden: 'crouchTold_warden', pirate: 'crouchTold_pirate', paladin: 'kneelTold', geomancer: 'senseTold', reaper: 'spikeTold', berserker: 'pounceTold' };   /* (claude/berserker2: his crouch is THE COIL now; WORKING UP moved to his idle whetstone, workTold) */
export const SETTLE = 0.2;   // down and stood this long before it counts as a crouch (a drop-through or a stumble is not)
export const GIVE_UP = 12;   // a hint waiting longer than this goes into the queue anyway

export function makeCrouchHint(api) {
  const stats = { told: 0, waited: 0 };
  let downT = 0, waiting = null, waitT = 0;
  const seen = () => (api.PROG.crouchFirst || (api.PROG.crouchFirst = {}));
  function say(h) { seen()[h] = 1; stats.told++; waiting = null; api.hint(FIRST[h]); }
  function update(dt) {
    const p = api.P, h = api.hero(); if (!FIRST[h]) return;
    if (seen()[h]) return;
    if (TOLD[h] && (api.PROG[TOLD[h]] || 0) >= 1) { seen()[h] = 1; return; }
    if (api.L && api.L.trial) return;
    downT = p.ducking && !p.dead ? downT + dt : 0;
    if (!waiting && downT >= SETTLE) { waiting = h; waitT = 0; }
    if (waiting) { waitT += dt; if (waiting !== h) { waiting = null; return; }
      if (api.quiet() || waitT >= GIVE_UP) say(h); else stats.waited += dt; }
  }
  return { update, read: () => ({ hero: api.hero(), waiting, seen: { ...seen() }, stats: { ...stats } }), reset: () => { downT = 0; waiting = null; waitT = 0; stats.told = 0; stats.waited = 0; } };
}
