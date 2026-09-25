// tools/caravan-jumps.mjs — RULES S2 WITH THE REAL JUMP, for every hero (docs/briefs/caravan-ruins-bandits.md). The reach model's jump is
// six tiles and a player's is not; S2 says a real full jump is about 3.2 tiles and nothing on the main road may ask for more than 3.0.
// This drives each hero in the page (god mode, on THE WORM'S HOLLOW's forty flat tiles - the level's longest flat; the rim above it is held shut by THE FIRST KNIFE's gate):
// a full run, the jump pressed and held, and the distance from the last foot on the ground to the first one down, in tiles. Then it
// reads the caravan's widest pit on the main road off the level and says, per hero, whether it clears it with room to spare.
// Not in the suite (it needs the page and a minute). usage: node tools/caravan-jumps.mjs [heroes]
import { openPage } from './cdp.mjs';
const heroes = (process.argv[2] || 'knight,warden,pyro,paladin,pirate,reaper,geomancer').split(',');
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async () => {
    const { LEVELS } = await import('/src/level.js'); const i = LEVELS.findIndex(l => l.id === 'caravan'), out = {};
    for (const hero of ${JSON.stringify(heroes)}) {
      const keep = BK.PROG.hero; BK.PROG.hero = hero; BK.load(i); BK.start(); BK.god = true; BK.sim(120);
      const L = BK.L, x0 = L.arena.x0 / 16 + 8, row = L.arena.floor / 16 - 1; BK.tp(x0, row); BK.sim(30);
      const K = BK.keys; let takeoff = null, land = null, f = 0;
      for (; f < 600 && land === null; f++) { K.right = true;
        if (f === 50) { BK.press('jump'); K.jump = true; K.up = true; }   /* a full run of 50 frames, then the jump, held */
        const was = BK.P.ground; BK.sim(1);
        if (f >= 50 && takeoff === null && was && !BK.P.ground) takeoff = BK.P.x;
        if (takeoff !== null && !was && BK.P.ground) land = BK.P.x; }
      K.right = false; K.jump = false; K.up = false; BK.PROG.hero = keep;
      out[hero] = takeoff !== null && land !== null ? +((land - takeoff) / 16).toFixed(2) : null; }
    return out; })()`, 600000);
  const worst = 3.0;   /* the caravan's widest pit on the main road (tools/caravan-level.mjs S2 holds it to 3.0) */
  for (const [h, t] of Object.entries(r)) console.log((t !== null && t >= worst ? '  ok   ' : '  ??   ') + h.padEnd(10) + ' a full running jump carries ' + (t === null ? '(not measured)' : t + ' tiles') + ' against the widest pit, ' + worst);
  console.log('errors', JSON.stringify(pg.errors.slice(0, 5)));
} finally { pg.close(); }
