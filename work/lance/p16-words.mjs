import { patch } from './patch.mjs';
patch('src/main.js', [
  ["  announce: c => { number(c.x, c.y - 30, \"THE QUEEN'S BOWS\", '#ffd36b'); SFX.hornDraw(); },",
   "  announce: c => { const half = textW(\"THE QUEEN'S BOWS\") / 2 + 6;   /* on the screen, over the lookout or at the edge nearest it: a word\n      put at a lookout off the screen is a word nobody reads (and at the screen's edge it was clipped) */\n    number(Math.max(camX + half, Math.min(camX + VW - half, c.x)), c.y - 30, \"THE QUEEN'S BOWS\", '#ffd36b'); SFX.hornDraw(); },"],
]);
