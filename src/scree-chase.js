// scree-chase.js - THE ROCKSLIDE CHASE (claude/scree2; Daniel's interview 2026-10-08, scratch/brief-scree2.md item 2: "a LONGER section fleeing the
// rockslide"). It was one boulder front at 118 px/s over 68 columns of scree steps (~9 s, once a save: marks 'slide'). Now it is THE big only-here set
// piece of the Scree Path (design-standard A8): a ~30-40 s run DOWN THE HILLSIDE in front of the whole slope coming loose, on src/chase.js's engine.
//   THE HILLSIDE   the old scree steps (final cols 265-338) are cut away and repainted, and SPAN columns are grown in after them (level.js grow, the same
//                  shift every section of this level uses), so the run is ~175 columns from the crest to the gorge bank: scree runs that carry you
//                  (the cairn field teaches them first: A4), lips and pits to jump, steps up to climb, rocks off the cliff AHEAD on a told beat, and
//   THE FORK       one risky shortcut against a safe line: the LOW CHUTE (three scree runs, fast, that end in a three-wide pit you must leap) or the HIGH
//                  LEDGES over it (stone shelves, hops, a rock to wait out - slower, and the front comes closer, but nothing under them kills you).
//   THE FRONT      drawn behind you the whole way (look 'scree': boulders and a dust wall that follow the ground), told before it starts (the signs at
//                  the shrine, the crest's trickling grit, 'THE HILL COMES DOWN: RUN!') and before every surge (the engine's warnings). It HURTS (a
//                  heavy unblockable blow, then it falls back and holds), it never kills outright - the pits do.
//   THE SHRINES    one right before the start line (the cairn field's, col 262 - the engine's lint wants one within 15 tiles) and one AFTER the safe
//                  line, on the gorge bank. A death puts the front back at the crest: RE-ARMED, every time (src/chase.js chaseReset), never a mark.
// Applied in screePath() after the rework (src/scree-rework.js), on FINAL columns. tools/scree-chase.mjs is its check (Node + every hero with real keys).
export const SPAN = 96;                 // columns grown in at CUT
export const CUT = 339;                 // the first column after the old scree steps (the gorge's pit started here)
export const X0 = 265, X1 = CUT + SPAN - 1;   // the repainted hillside, crest to final chute (inclusive)
export const BANK = CUT + SPAN + 5;     // the gorge bank past the pit and the boulder pillar: the safe line, and the shrine after it
export const TRIGGER = 268, CHECK_BEFORE = 262;
/* THE HILLSIDE, crest to gorge. [x0, x1, top row, kind]: 'rock' (solid to the floor of the world), 'scree' (and the top row runs downhill, dir 1).
   The columns between spans are open to the bottom: PITS (real deaths, told). */
export const SPANS = [
  [265, 276, 14, 'rock'],     // THE CREST: the start line, the front behind it
  [277, 292, 15, 'scree'],    // the first run: it carries you (batch81 integ: no pit at the chase's start - the first run ran to 290 and a two-tile pit at 291-292 killed the bot at 293 in most runs; the first pit is now 318-319)
  /* (no pit 291-292 now) */
  [293, 302, 16, 'rock'],     // a rock off the cliff ahead, on its count
  [303, 317, 17, 'scree'],
  /* pit 318-319 (was 317-319: the bot fell short of the three-wide ones too often - batch81 integ) */
  [320, 328, 17, 'rock'],
  [329, 333, 15, 'rock'],     // a step up: jump it
  /* THE FORK: the LOW CHUTE under, the HIGH LEDGES over it (SHELVES, below) */
  [334, 343, 18, 'scree'],
  [344, 353, 19, 'scree'],
  [354, 362, 20, 'scree'],
  /* pit 363-365: the chute's price */
  [366, 384, 20, 'rock'],     // THE BOULDER FIELD: two rocks off the cliff, ahead
  [385, 395, 20, 'scree'],
  /* pit 396-397 (was 395-397) */
  [398, 404, 20, 'rock'],
  [405, 412, 18, 'rock'],     // a ledge up
  [413, 422, 19, 'scree'],
  [423, 434, 21, 'scree'],    // the last run, into the leap over the gorge (pit 435-437, the boulder pillar 438-439, the bank 440)
];
/* THE HIGH LEDGES over the low chute: [x, row, len] stone shelves (one-way). No pit under any of them (the last bridges the chute's pit). */
export const SHELVES = [[335, 14, 7], [344, 14, 8], [355, 15, 6], [362, 16, 5]];
/* THE GROUND GOES (the level's twist, src/scree-rework.js): the middle two of them are LOOSE ROCK - run them and they hold, stop on one (to cut down the thrower
   who stands on it) and it drops you into the chute. */
export const LOOSE = [[344, 14, 8], [355, 15, 6]];
/* BROKEN STONE where a chute's run drops a step: two tiles on the lower step's lip - jump the drop or land on them [x, row] */
export const BROKEN = [[344, 18], [354, 19], [423, 20]];
/* FOES AT THE PLATFORMING MOMENTS (brief-levelsweep v2: harpies through the jump arcs, a thrower over the high line, a ram charging up the boulder field
   - knockback toward the front) [type, x, y] */
/* AND THE REST OF THE ROAD KEEPS ITS DENSITY (tools/scree-rework.mjs: >= 3.2 foes a screen): four screens grew in, so six more where the road was thin - a
   thrower on the ropeway's high ledge and an archer on its last step (foes at platforming moments: you are on the sails or the swing), a harpy over the lift,
   a sprig in the pasture, a ram on the windmill rise, a thrower on the quarry floor [type, x, y] */
export const ROAD_FOES = [['sprig', 14, 19], ['sprig', 41, 19], ['sprig', 56, 19], ['sprig', 66, 19], ['harpy', 462, 5], ['rockgoblin', 470, 11], ['archer', 481, 13], ['rockgoblin', 540, 8]];
export const FOES = [['harpy', 289, 10], ['harpy', 324, 11], ['harpy', 340, 9], ['rockgoblin', 348, 13], ['goat', 376, 19], ['harpy', 402, 13], ['rockgoblin', 410, 17]];
/* ROCKS OFF THE CLIFF, AHEAD (told: the red mark on the fall line pulses as the next one works loose; only while on screen) [x, every s] */
export const ROCKS = [[298, 2.4], [339, 2.2], [349, 2.6], [372, 2.3], [380, 2.7], [408, 2.5]];
export const CHASE = {
  id: 'rockslide', name: 'THE ROCKSLIDE', axis: 'x', dir: 1, look: 'scree', say: 'THE HILL COMES DOWN: RUN!', music: 'boss2',
  trigger: TRIGGER * 16, end: BANK * 16 + 2, gap0: 150,
  curve: [[0, 98], [950, 114, 'THE HILL QUICKENS'], [1950, 128, 'THE WHOLE SLOPE IS COMING']],   /* a hero walks the hill at ~92 px/s (faster down a scree run): the front is faster, so it is ON HIM - the rubber band slows it under him (min/slow), so a hero who keeps going is never caught and one who stops for a second is */
  lead: 1.6, accel: 120, rubber: { min: 64, max: 200, slow: 0.5, catch: 1.4 },   /* slowed under him it is 55-66 px/s: the slowest walker (the reaper) still pulls away */
  contact: 'hurt', dmg: 30, hold: 0.9, autoscroll: true, show: 44, showKeep: 0.4, glow: 260, band: true,   /* show: the camera keeps the front on the screen behind you (never at the cost of 40% of the view ahead) */
  zone: [X0 * 16, (BANK + 1) * 16, 12 * 16, 27 * 16],   /* a hero on the miller's ridge over the crest (rows 1-11) is not on the hill: the start line waits for one on it */
  checkpoint: [CHECK_BEFORE, 13],
};
export function chaseScree(R0, T, grow) {
  const G = grow(R0, R0, CUT, SPAN), R = G.R, H = R0.H;
  /* CUT THE OLD SLOPE AWAY: everything at or under row 12 over the hillside (the ridge's high ledges over the crest, rows 1-11, are the miller's road and stay) */
  for (let x = X0; x <= X1; x++) for (let y = 12; y < H; y++) G.set(x, y, T.AIR);
  const inHill = e => e.x >= X0 && e.x <= X1 && e.y >= 9 && !(e.t === 'check' && e.x === CHECK_BEFORE);
  R0.ents = R0.ents.filter(e => !inHill(e) && !(e.t === 'harpy' && e.x >= 300 && e.x <= X1) && !(e.t === 'rockfall' && e.x >= X0 && e.x <= X1));   /* (the old slope's rocks off the cliff too: the run has its own, told, ahead) */   /* (the ridge's last harpy too: the ridge ends at its loose ledge over 302 now) */
  R.scree = (R.scree || []).filter(z => z.x1 < X0 || z.x0 > X1);
  /* THE HILLSIDE */
  for (const [x0, x1, top, kind] of SPANS) { G.block(x0, x1, top, H - 1); if (kind === 'scree') R.scree.push({ x0, x1, y: top, dir: 1 }); }
  for (const [x, row, len] of SHELVES) G.plat(x, row, len);
  for (const [x, row, len] of LOOSE) for (let i = 0; i < len; i++) G.set(x + i, row, T.SHELF);
  for (const [x, row] of BROKEN) { G.set(x, row, T.SPIKE); G.set(x + 1, row, T.SPIKE); }
  for (const [t, x, y] of FOES) G.ent(t, x, y, { face: -1 });
  for (const [t, x, y] of ROAD_FOES) G.ent(t, x, y, { face: -1 });
  for (const [x, every] of ROCKS) G.ent('rockfall', x, 3, { every, tell: 1.1, seen: true });
  /* TOLD AHEAD (A6): at the shrine, and again on the crest */
  G.ent('sign', 264, 13, { text: 'THE WHOLE HILL IS LOOSE. WHEN IT COMES DOWN, RUN WITH IT AND DO NOT STOP.' });
  G.ent('sign', 332, 14, { text: 'LOW: THE CHUTE IS QUICK AND ENDS IN A DROP. HIGH: THE LEDGES ARE SLOW AND SAFE.' });
  G.ent('check', BANK + 1, 18);   /* THE SHRINE AFTER IT, on the bank */
  /* the miller's silver lay at 333,15 - inside the hill the chase cut away, so it was dropped (the relics check: a former relic cache pays a silver within 15 tiles of 335,15). It lies on the HIGH LEDGES now, the safe line's prize; still silver #0, so a save's bit 1<<0 points at the same pickup */
  G.ent('silver', 339, 13); { const s0 = R.ents.pop(), k = R.ents.findIndex(e => e.t === 'silver'); R.ents.splice(k < 0 ? R.ents.length : k, 0, s0); }
  /* COINS ON BOTH LINES: the chute pays for its risk */
  const coins = [[270, 13], [283, 14], [287, 14], [297, 15], [308, 16], [312, 16], [324, 16], [331, 14], [338, 17], [347, 18], [351, 18], [358, 19], [360, 19], [364, 16], [337, 13], [347, 13], [357, 14], [375, 19], [389, 19], [401, 19], [409, 17], [417, 18], [428, 20], [431, 20]];
  for (const [x, y] of coins) G.ent('coin', x, y);
  /* DRESSING: boulders already down the hill, dead thorn on the crest, a cairn at the fork */
  for (const [x, y, kind, v] of [[271, 13, 'stone', 0], [296, 15, 'stone', 1], [326, 16, 'deadTree', 0], [333, 14, 'cairn', 0], [367, 19, 'stone', 2], [378, 19, 'stone', 0], [383, 19, 'deadTree', 1], [400, 19, 'stone', 1], [410, 17, 'stone', 2]]) G.ent('deco', x, y, { kind, v });
  R.slide = null;   /* the old once-a-save boulder front (main.js updateSlide) is gone from this level: the engine runs the chase */
  R.chases = [{ ...CHASE }];
  R.screeChase = { x0: X0, x1: X1, bank: BANK, span: SPAN };
  R.calm = (R.calm || []).concat([[X0, BANK - 1, 0, 27]]);   /* nothing sprinkled on the run: a garrison goat on a lip is not a chase, it is a wall */
  R.checkRun = 260;   /* difficulty v2 (brief-levelsweep, A10b): a shrine ~1 a section, 140-260 route tiles apart - the filler must not put one back on the run */
  const D = G.done(); let loose = 0, spikes = 0; for (const t of D.grid) { if (t === T.SHELF) loose++; if (t === T.SPIKE) spikes++; }
  D.screeRework = { loose, spikes };   /* counted on the finished level (the rework's own count was the old slope's, which is gone) */
  return D;
}
