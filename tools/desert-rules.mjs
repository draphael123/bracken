// tools/desert-rules.mjs — the sandstorm, sandfalls, the waterskin and mirages (src/desert-rules.js), proved in Node before any
// level uses them. usage: node tools/desert-rules.mjs     exit 1 on any failure
import { FLOOD, newFlood, floodStep, floodHits, STORM, newStorm, stormStep, gustDrift, SANDFALL, sandfallMods, inSandfall, SKIN, newSkin, fillAt, drink, pour, MIRAGE, mirageAlpha, mirageShimmer } from '../src/desert-rules.js';
let fails = 0; const log = s => console.log(s), ok = (c, m) => { log((c ? '  ok   ' : '  FAIL ') + m); if (!c) fails++; };
const DT = 1 / 60;

log('THE SANDSTORM');
{ const S = newStorm(); let t = 0, warnStart = null, warnLens = [], gusts = 0, minSight = 999, last = 'calm', dirsSeen = [];
  while (t < 60) { const st = stormStep(S, DT); t += DT; minSight = Math.min(minSight, st.sight);
    if (st.phase === 'warn' && last !== 'warn') { warnStart = t; dirsSeen.push(st.dir); }
    if (st.phase === 'gust' && last === 'warn') { warnLens.push(t - warnStart); gusts++; }
    last = st.phase; }
  ok(gusts >= 6 && Math.min(...warnLens) >= 1.3, `every gust is warned: ${gusts} gusts in a minute, each after ${Math.min(...warnLens).toFixed(2)}+ s of warning (the horizon browns, an arrow shows the way: C3)`);
  ok(minSight >= STORM.sightMin, `the view closes to ${Math.round(minSight)} px at worst, never under ${STORM.sightMin}: a foe's tell is always on screen before it lands`);
  ok(new Set(dirsSeen).size === 2, `the wind changes its mind (directions ${dirsSeen.slice(0, 6).join(' ')}), so there is no one safe side to stand`);
  // drift over one whole gust: braced on the ground, unbraced, and in a jump
  const drift = opts => { const s = newStorm([1]); let x = 0; for (let i = 0; i < (STORM.calm + STORM.warn + STORM.gust) / DT; i++) x += gustDrift(stormStep(s, DT), opts) * DT; return x; };
  const braced = drift({ braced: true }), open = drift({}), air = drift({ grounded: false });
  ok(braced < 16 && open > 2 * 16 && air > open, `over one gust: braced (holding block) it moves you ${braced.toFixed(0)} px, unbraced ${open.toFixed(0)} px, in the air ${air.toFixed(0)} px - bracing is the answer, a jump in it carries`); }

log('SANDFALLS');
{ const zones = [{ x0: 100, x1: 132, y0: 0, y1: 320 }];
  const apex = inside => { const m = sandfallMods(inside); let vy = -320 * m.jumpK, y = 0, top = 0; for (let i = 0; i < 200; i++) { vy += (1000 * (vy < 0 ? 1 : 1.2) + m.gravAdd) * DT; y += vy * DT; top = Math.min(top, y); if (y > 0) break; } return -top; };
  const under = apex(true), clear = apex(false);
  ok(inSandfall(zones, 110, 300) && !inSandfall(zones, 140, 300), 'a sandfall is its column and nothing else');
  ok(under < 16 * 1.5 && clear > 16 * 3, `under a sandfall a jump rises ${under.toFixed(0)} px (you cannot climb through it), clear of it ${clear.toFixed(0)} px; walking in it runs at ${Math.round(SANDFALL.walk * 100)}%`); }

log('THE WATERSKIN (level 2: water is carried)');
{ const W = 20, H = 20, L = { W, H, grid: new Uint8Array(W * H).fill(0), wells: [{ x: 3, y: 15 }], mudWalls: [{ x0: 10, x1: 10, y0: 13, y1: 15 }] };
  for (let y = 13; y <= 15; y++) L.grid[y * W + 10] = 1;
  const skin = newSkin(), sun = { v: 1, tick: 0 };
  ok(!drink(skin, sun) && sun.v === 1, 'an empty skin does nothing');
  ok(!fillAt(skin, L, 200, 256) && fillAt(skin, L, 3 * 16 + 8, 256) && skin.sips === SKIN.sips, `it fills only at a well, to ${SKIN.sips} sips`);
  ok(drink(skin, sun) && sun.v === 0 && skin.sips === 2, 'a sip cures sunstroke outright');
  ok(pour(skin, L, 5 * 16, 256, -1) === null && pour(skin, L, 9 * 16, 256, 1) === 'mud' && L.grid[14 * W + 10] === 0 && skin.sips === 1, 'poured at a mud wall it softens it to nothing (and at open air it spills nothing)');
  const fires = [{ x: 9 * 16 + 20, y: 256 }]; ok(pour(skin, L, 9 * 16, 256, 1, fires) === 'fire' && fires[0].out && skin.sips === 0, 'poured at a fire it puts it out'); }

log('MIRAGES');
{ const m = { x: 500, mirage: true }, real = { x: 500, mirage: false };
  ok(mirageAlpha(m, 200) === 1 && mirageAlpha(m, 500 - MIRAGE.near + 1) === 0 && mirageAlpha(m, 400) > 0 && mirageAlpha(m, 400) < 1, `a mirage is whole from afar, fades from ${MIRAGE.far} px and is gone by ${MIRAGE.near} px`);
  let sh = 0, rs = 0; for (let t = 0; t < 2; t += 0.05) { sh = Math.max(sh, Math.abs(mirageShimmer(m, t))); rs = Math.max(rs, Math.abs(mirageShimmer(real, t))); }
  ok(sh > 0.5 && rs === 0, 'a mirage always shimmers and a real oasis never does: the tell, for a player who is looking'); }

log('THE FLASH FLOOD (level 3)');
{ const F = newFlood(); let t = 0, horns = [], hornAt = null, floods = 0, last = 'dry'; const ch = { x0: 352, x1: 432 };
  let hitIn = 0, hitOut = 0;
  while (t < 60) { const st = floodStep(F, DT); t += DT; if (st.phase === 'horn' && last !== 'horn') hornAt = t; if (st.phase === 'flood' && last === 'horn') { horns.push(t - hornAt); floods++; }
    if (floodHits(st, ch, 400)) hitIn++; if (floodHits(st, ch, 300)) hitOut++; last = st.phase; }
  ok(floods >= 4 && Math.min(...horns) >= 2.3, `every flood is heralded: ${floods} floods a minute, each after ${Math.min(...horns).toFixed(2)} s of horn - time to walk ${(Math.min(...horns) * 92 / 16).toFixed(0)} tiles off a bridge`);
  ok(hitIn > 0 && hitOut === 0, 'the torrent takes only the channel: in it you are swept; a ledge beside it is dry'); }

console.log(fails ? `\ndesert-rules: ${fails} FAILED` : '\ndesert-rules: all passed');
process.exit(fails ? 1 : 0);
