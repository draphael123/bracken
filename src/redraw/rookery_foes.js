// rookery_foes.js - THE ROOKERY's HARPIES (claude/rookeryart). The greybox used the moor's grey-brown crag harpy for every bird and a red wash over it for the shrieker.
//   THE CRAG HARPY (skin 'cragharpy', L.reskin harpy)  the same bird-woman on the same six frames (hover wings up / down, dive, downed, the stoop, hurt) - but in the cliff's own colours: pale
//                          guano-white feathers with slate primaries, a bone face, dark slate-violet hair, red eyes. She is one of the thousand who live on this stone.
//   THE HARPY SHRIEKER (SPR.shrieker)  her own sheet: dusky rose-brown plumage, a fan of seven red crest feathers, a full pink throat sac, and (frame 4, 'aim') the SCREAM: head up, mouth wide, the sac swollen.
// Both are bakeHarpy (src/redraw/foes1.js) with a palette / a head - one set of frames, so every rule that reads a harpy's frame (the dive, the stun, the stoop, the hurt flash) is unchanged.
import { bakeHarpy } from './foes1.js';
import { bakeGaleHarpy as bakeGaleOwn } from './gale_harpy_art.js';
export const CRAG = { h: '#c9c7d6', H: '#6c6a86', z: '#2a2838', F: '#eeecf4', c: '#2e2c46', C: '#55527a', k: '#e8dccf', K: '#b49a8a' };
export const SHRIEK = { h: '#8a4a58', H: '#52262e', z: '#2a1420', F: '#c8808c', c: '#4a1c26', C: '#7a2c3a', k: '#e4bcae', K: '#b08878', R: '#9a2a28', q: '#ee9aa0' };
export const bakeCragHarpy = () => bakeHarpy(CRAG, false);
export const bakeShrieker = () => bakeHarpy(SHRIEK, true);
/* the frames, for the contact sheet (tools/rookeryart-sheet.mjs) */
export const SHEET = () => { const out = {}, A = bakeHarpy({}, false), B = bakeCragHarpy(), C = bakeShrieker(), D = bakeGaleOwn(); D.R.forEach((c, i) => out['gale-harpy-' + i] = c); A.R.forEach((c, i) => out['moor-harpy-' + i] = c); B.R.forEach((c, i) => out['crag-harpy-' + i] = c); C.R.forEach((c, i) => out['shrieker-' + i] = c); return out; };
/* (claude/rookery2) THE GALE HARPY (SPR.galeharpy, src/gale-harpy.js) - GREYBOX: the crag harpy's six frames in storm teal-grey (frame 4, wings back, is her tell; 2 her beat). The sonnet art lane gives her own sheet. */
export const GALEP = { h: '#7f9aa6', H: '#3e5662', z: '#1c2a32', F: '#c4d6dc', c: '#20323c', C: '#46606c', k: '#e0d8cc', K: '#a8968a' };
export const bakeGaleHarpy = () => bakeGaleOwn();   /* (claude/rookery2art) her OWN sheet now: src/redraw/gale_harpy_art.js (profile, wings swept back = her tell) */
