// src/dev-flag.js - THE DEV FLAG (claude/heroroster, Daniel 10-12): ?dev=1 in the URL. Testing helpers that must never reach a player
// (UNLOCK EVERYTHING, SET.godmode) are reachable only while it is on. setDev is the TEST HOOK (BK.setDev) for a harness that is already on
// a page without the flag; a player has neither the flag nor the hook.
let on = typeof location !== 'undefined' && /[?&]dev=1(?:&|#|$)/.test(location.search || '');
export const isDev = () => on;
export const setDev = v => { on = !!v; return on; };
