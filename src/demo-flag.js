/* src/demo-flag.js - THE DEMO FLAG (claude/demoend, Daniel 11-03 18:45: "DEMO flag ends after King Gorm/Kingswood, locks everything past it").
   OFF is the full game, byte for byte: every use in src/main.js is `DEMO && ...` / `DEMO ? demo : full`, and tools/demo-cut.mjs pins the list of uses.
   ON  (?demo=1, or DEMO_BUILD flipped to true by the later demo-build lane): the slice is the 12 DEMO levels (src/demo-slots.js DEMO_IDS - the same list the float gates read):
       Lumber Trail -> Hornet's Nest -> Marsh Wood -> Fen Road -> The Stockade -> Sporewood -> Rootway -> Underleaf -> Palisade Wood -> KINGSWOOD (King Gorm = the last boss),
       the Burning Village spur (opens on Gorm, one life) and the Arena Yard. Everything past Kingswood (the Scree Path on) is LOCKED, and Gorm's win card is followed by the END CARD. */
import { DEMO_IDS } from './demo-slots.js';
export const DEMO_BUILD = false;   /* the trimmed itch build flips this one line */
export const flagFrom = (search, build = false) => !!build || /[?&]demo=1(?:&|#|$)/.test(search || '');
export const DEMO = flagFrom(typeof location !== 'undefined' ? location.search : '', DEMO_BUILD);
export const DEMO_HEROES = new Set(['knight', 'warden', 'geomancer', 'ranger', 'pyro']);   /* the four free starters + the Pyromancer (the Burning Village's duel): the pick, the store and co-op show these five; the rest wait in the full game */
export const DEMO_LAST = 'kings';   /* the last boss of the slice: King Gorm's wood */
/* a campaign level is OUT of the slice when it is not one of the 12 and is a real stop on the road (a hidden shop / trial / tavern with no road of its own stays reachable from the slice) */
export const outOfSlice = lv => !!lv && !DEMO_IDS.has(lv.id) && (!lv.hidden || !!lv.secret);
export const inSlice = lv => !outOfSlice(lv);
export const demoLocked = lv => DEMO && outOfSlice(lv);
export const demoEndsHere = id => DEMO && id === DEMO_LAST;
