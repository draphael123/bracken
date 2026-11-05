// ONE ULTIMATE INPUT FOR EVERY HERO (claude/ults, Daniel 11-01): UP + C, with the hero's own meter / condition FULL, fires that hero's ultimate.
// TAP C stays each hero's block / deflect / ward; HOLD C its guard. This module is the small shared registry the input, the HUD cue and the text read:
//   ultRegister(hero, { name, ready(), fire() })   ready(): is the meter / condition full (and nothing about the frame: main.js asks the frame)
//                                                  fire():  does it; returns true when it went off (the meter is spent in there)
// A hero whose lane lands later (Warden's Reach, Meteor Fall) registers itself with ONE line in main.js and gets the press, the cue, the card line and the bots with no other change.
const REG = Object.create(null);
export const ULT_LINE = 'UP + C AT A FULL METER: YOUR ULTIMATE';
export const ULT_CUE = 'ULT READY: UP+C';
export const ULT_SHORT = 'ULTIMATE';
export function ultRegister(hero, def) { REG[hero] = def; }
export const ultHas = h => !!REG[h];
export const ultName = h => (REG[h] && REG[h].name) || '';
export const ultReady = h => { const d = REG[h]; try { return !!(d && d.ready()); } catch (e) { return false; } };
export function ultFire(h) { const d = REG[h]; if (!d || !ultReady(h)) return false; return !!d.fire(); }
/* the shared HUD cue: null unless the ultimate is ready; the blink is main.js's (time) */
export const ultCue = (h, blink) => ultReady(h) ? { s: ULT_CUE, col: blink ? '#ffd36b' : '#fff6c8' } : null;
export const ultHeroes = () => Object.keys(REG);
/* WHO HAS ONE, AND WHAT IT IS CALLED: the static table the controls card, the keys sheet and the tutorial read (they must not need main.js). A hero's lane adds ONE entry here and one ultRegister line in main.js. */
export const ULT_NAMES = { knight: 'SHIELD CHARGE', geomancer: 'MOUNTAIN COLLAPSE', ranger: 'GREAT ARROW' };
/* what each hero fills (the words after "FULL:" on the card) */
export const ULT_NEEDS = { knight: '3 LINKS', geomancer: '3 STONES UP', ranger: 'FULL FOCUS' };
export const ultRow = (hero, upKey, cKey, padUp, padC) => ULT_NAMES[hero] ? ['ultimate', upKey + '+' + cKey + ': ' + ULT_NAMES[hero], padUp + '+' + padC] : null;   /* the SAME row for every hero that has one */
