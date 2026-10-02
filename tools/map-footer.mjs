// tools/map-footer.mjs - THE WORLD MAP'S FOOTER LABELS MUST NOT TOUCH. The controls (left) and the co-op switch (right) share one 320 px
// strip; "X BEASTS" once ran into "F CO-OP OFF". Measures every variant (panel open / shut, co-op on / off) with the game's own textW
// (BK.mapFooter) and fails unless the labels sit inside the screen with at least GAP clear px between them.
import { openPage } from './cdp.mjs';
const GAP = 8, VW = 320;
const pg = await openPage({ audio: false });
try {
  const all = await pg.evalp('BK.mapFooter()', 30000);
  const bad = [];
  for (const row of all) {
    const left = row.find(f => !f.right), right = row.find(f => f.right);
    const lEnd = left.x + left.w, rStart = right.x - right.w;
    if (left.x < 0 || lEnd > VW) bad.push('"' + left.t + '" runs off the screen (ends at ' + lEnd.toFixed(1) + ')');
    if (rStart < 0 || right.x > VW) bad.push('"' + right.t + '" runs off the screen');
    if (rStart - lEnd < GAP) bad.push('"' + left.t + '" (ends ' + lEnd.toFixed(1) + ') and "' + right.t + '" (starts ' + rStart.toFixed(1) + ') are ' + (rStart - lEnd).toFixed(1) + ' px apart, wanted ' + GAP);
  }
  if (bad.length) { console.error('map-footer FAIL:\n  ' + [...new Set(bad)].join('\n  ')); process.exitCode = 1; }
  else console.log('map-footer ok: ' + all.length + ' footer variants, every label clear of the others (gap >= ' + GAP + ' px)');
} finally { pg.close(); }
