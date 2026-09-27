import { patch } from './patch.mjs';
patch('src/lance-support.js', [["  if (e.bowCall) { const c = e.bowCall; c.t -= dt;", "  if (e.bowCall) { const c = e.bowCall; c.t -= dt; e.supportT -= dt;   /* the next call's clock runs through the tell: one every 15 s, not every 16.2 */"]]);
