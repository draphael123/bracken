# claude/theatre4: THE THEATRE made harder, the puppets' read, the mummers' masks (Opus, overnight 2026-10-05/06)

Base: master 85e13368 (batch71). Brief: scratch/brief-theatre4.md (Daniel's 10-05 playtest of THE THEATRE + PUPPETEER2).
**Not shipped live:** the Puppeteer's read and numbers changed, so he needs Daniel's playtest (design standard B9).

## Headline numbers

| | before | after |
|---|---|---|
| Puppeteer, human bot at the CAMPAIGN level (L22, HARNESSCARD card spread, no skills, normal health; `tools/harnesscard-rates.mjs theatre --mode=new --seeds=7`) | 20/21 = 95% after the read changes, before retuning (knight 6/7, warden 7/7, pyro 7/7; wins 57-130 s) | **12/21 = 57%**: knight 4/7, warden 4/7, pyro 4/7 (wins 60-110 s) |
| mash bot vs the Puppeteer (3 heroes x 2 seeds, L22, plus the level-1 variant) | 0/6 | **0/6**, level-1 0/3 (all die, boss 97-100% left) |
| mash bot through the level (L22, machines) | knight 23% / warden 11% / pyro (stamped) | **knight dead, warden dead, pyro 2%** (all hold under 40%) |
| level-1 knight curve (3 runs: health lost a run / deaths) | 61% / 0: under the act IV band | **147% / 1** (band 120-600%, 1-12). `theatre` is off CURVE_REPORT_ONLY |
| level-1 pilot (gate row) | 17 blows, 0 deaths | 21 blows, 1 death |
| route | 520 tiles, 4 checkpoints | **622 tiles, 5 checkpoints** (one per 124 tiles) |

I ran the curve pilot three times on the final level data: 1, 2 and 1 deaths. The stamped row has 1 death, so the death floor is met but only just (see the questions).

## 1. THE PUPPETS: you can always tell when one can be hit (design standard B10)

The changes are in src/puppeteer.js, src/puppeteer-hands.js, and two small hooks in main.js's foe pass.

**When a puppet can be hit:**
- Its strings go **slack**: they droop in a curve. The cut test follows the droop as it is drawn.
- It **slumps** (main.js poseOf).
- It has a **gold outline**: its sprite is traced in gold before it is drawn.
- A gold **timer pip** over its head runs down with the window (`winK`).

**When it cannot be hit:**
- Its strings are **taut** with a steel-blue glow. In a windup they glow gold, which is still the bonus cut.
- The body has a **grey-steel tint**.
- Every turned blow **clanks**, sparks, and puts a rising **STRINGS TAUT** over the puppet. At night, a spent puppet in the dark says **IN THE DARK**.
- The longer hint-box line is said once: `STRINGS TAUT: STRIKE A PUPPET WHEN ITS STRINGS GO SLACK`. It replaces the "glows green" line.

**Bugs found while doing this:**
- **The Brute was drawn at x1.5, but his hit box was the 18 x 44 unscaled frame.** A blow at his chest or head met nothing: no clank, no damage. This is most likely Daniel's "invincible and you can't hit them". He is now struck where he is drawn (26 x 64, with bodyK keeping his plate in place), as the elites are.
- **The window had no grace.** A blow begun at the end of the window could land just after it closed, and clank. A blow now lands for PUP.grace = 0.25 s after the window closes.

**NIGHT:**
- The spotlights are 1.6x wider (half-width 42 to 67).
- A puppet in the dark is drawn again over the dark as a grey-steel silhouette, so it is never invisible.
- A lit puppet that can be hit keeps its gold outline.

**Tuning, to get back into the band at the campaign level:**
- PUP.visitCap goes from 1/3 to 1/4.
- PUP.dmgK = 1.35: every blow of his, his puppets' and his scenes' lands x1.35. The tells and the answers are the same.
- No health was changed.

**tools/puppeteer.mjs, new rows:**
- Taut strings when a puppet cannot be hit, slack and drooping when it can.
- The pip runs down with the window.
- The grace lands a blow, but not past PUP.grace.
- A swing through the droop cuts the string.
- The night spotlights are 1.6x wider.
- The Brute is struck where he is drawn.
- In the page: three turned blows say STRINGS TAUT each time, and a dark one says IN THE DARK.
- **Per hero** (knight, warden, pyro): three real swings at a Brute in his window and three at a Harlequin in his window. All 18 land.

## 2. THE GREEN ROOM (a new section before the main stage) and the harder level

The new section is backstage columns 300-371, built 372-443. The main stage moved right by `NS = 72`, and its arena, gate and squad band went with it.

The section is the masks' final exam, with every verb:
1. **THE GREEN ROOM.** A VILLAIN mummer is held in a floor lamp beside a hired sword. Walk in and it lunges out of the light while the sword presses. Or strike the lamp off it first: its next look masks it TRAGEDY.
2. **THE PAINT FRAME.** The frame's stile blocks the floor.
   - The only way on is the PAINT BATTEN (line J) up to the paint gallery. The frame's stile holds the gallery up.
   - The batten's sandbag comes down on the property armour at the frame's foot.
   - A cued follow spot sweeps the gallery, and every pass re-masks whoever it lights. A flyman holds the gallery's end.
   - It has a stuck spot and glint (`th-paint-batten`).
3. **THE BEGINNERS.** You drop into the corridor.
   - A sword stands with the prompter behind him, and a villain stands on a cued lamp.
   - A sandbag hangs over the sword's post on its own line (K). Its lock is on the gallery's end.
   - Checkpoint five is at the main stage's door.

**Harder encounters elsewhere (designed, no health added):**
- **THE STAGE FIGHT:** a hired sword in the performance with the cast. The light does not hold him, the audience throws, and the flymen are at your back.
- Two mummers became other proven foes, keeping the theatre check's cap of 17 mummers:
  - the property armour in the under-stage and on the gallery floor;
  - a sword on the loading gallery.
- The theatre's own mummer (`TH_MUMMER`) strikes for 18 instead of 14 and creeps a little faster (46 instead of 40), like the fair's FAIR_MUMMER.

**Checks:**
- level-quality: the theatre clears all 16 rows. Pilot, mash and curve are re-stamped and green.
- ruleFight: 32 of 39 encounters stand in the rule.
- Roles: heavy, melee, ranged, support.

## 3. THE THEATRE'S MUMMERS SWAP MASKS (src/theatre-masks.js, the theatre's mummers only)

Each time a theatre mummer is lit or looked at afresh (unseen for at least 0.6 s first), it snaps on the next mask of its round. The swap is told:
- a wooden click (new SFX `maskSwap`) and a white flash;
- the mask drawn big over its face in its colour (pale blue, gold or red, with a dark edge so it reads anywhere);
- its name over it for a moment.

The three masks:
- **TRAGEDY:** it guards its front. A light blow from the side it faces clanks and says GUARDS.
  - From behind, from above (a plunge) or with a held heavy, the blow lands. The heavy breaks the guard and says GUARD BROKEN.
  - A frozen mummer cannot turn, and a tragedy waits 0.5 s before it turns on you, so you can go round it.
- **COMEDY:** open, but it cartwheels away from its first blow (spinning, out of reach) once per mask. Follow it and cut.
- **VILLAIN:** a told red lunge (!! for 0.7 s, then 84 px at the nearest hero, 20 damage, unblockable) out of the light, once per mask. Then it stands spent.

**How it is laid out and wired:**
- The freeze-in-light rule is kept.
- Only a hero's blow is answered by a mask. A sandbag or the room hits as before.
- The fair's mummers never get masks; they still mime (`e.mk` is only made when `L.theatre`).
- Each placement names its first mask, so the round is taught in order:
  - TEACH: the stage door's tragedy, alone in its passage, with its sign (`EVERY TIME YOU LOOK, A PLAYER SNAPS ON A NEW MASK. READ IT.`; it names no answer).
  - TEST: the fitting.
  - REMIX: the cast, re-masked by their cued lamps.
  - EXAM: the green room.
  - These are recorded as `ARCS.mask`.
- Mark rows: `mummer|lungeTell` is `!!` (BY_HAND, then `tells.mjs --write`), its ANSWER is `dodge` and its HEIGHT is `low`.

**tools/theatre.mjs, new rows:**
- Pure: the swap, the blink, the round, the guard (front, back, plunge, heavy break), the slow turn, the cartwheel (once, carries it away), and the villain's tell, lunge, recovery and once-only. The mark rows, every mummer's first mask, the four arcs each with a player in them, the teach sign, and THE GREEN ROOM as a section of at least 60 columns with lamps, lines and a mixed company.
- Page:
  - The stage door's tragedy turns a front blow and takes one from behind.
  - A fresh look gives the comedy, which cartwheels from the first blow and takes the second.
  - The green room's lit villain tells and lands its lunge.
  - The fair's mummers have no masks.

## Checks (named, never the suite; port 8651 only)
Green:
- Theatre and boss: theatre (pure + page), puppeteer (pure + page, incl. the per-hero rows and the refill-health bot win), boss-openings, boss-greed, boss-fight-end.
- Level gates: level-quality, mash-gate, curve-gate, checkpoint-gaps, checkpoints, floating-geometry ("theatre: nothing hangs from nothing"), architecture, skins, npc-removal, spawns, elites, one-new-foe, sprinkle-cap, signs, stuck (static + runtime, 63 spots).
- Marks and text: tells, answer-tags, hint-shown, audio-assets, dangling-paths.

The re-stamps, all through the tools:
- `level1-pilot.mjs theatre --curve` and `--write`;
- `mash-bot.mjs --level theatre --write`, then `mash-bot.mjs theatre --l1 --probe --write` (level first, then boss).

Not run:
- slopes-trace: the theatre is not one of its traced levels, and no other level's geometry changed.
- boss-navigation: its theatre row reads the arena from L.arena; the other rows were already red per PUPPETEER2's report.
- textfit: the Puppeteer's bestiary text is about 25 characters longer.

## UNVERIFIED
- Nobody has played it.
- I looked at stills (`tools/theatre4-shots.mjs`): the green room, the paint gallery's tragedy mask, the gold-outlined Brute next to a steel Harlequin, and the night (a steel silhouette in the dark). I did not look at the cartwheel or the lunge in motion.
- The level-1 pilot is lifted through most of the green room (87-94 lifts), so its difficulty for a human is measured only by the mash bot, and by eye.
- Co-op is not tested. A mask swaps on any hero's fresh look.

## QUESTIONS FOR DANIEL (the recommendation is what is built)
1. **Five checkpoints instead of four.** The green room puts the boss door about 95 route tiles past the old fourth, so the 200-tile rule needs a checkpoint at the main stage's door. Spacing stays at least 90. *Rec: keep.* *Alternative:* a shorter green room (about 45 columns) and the old fourth removed.
2. **The Puppeteer's retune at the campaign level.** The HARNESSCARD L22 hero won 20/21. I set dmgK x1.35 and visits to 1/4 (57% now). His tells and moves are unchanged. *Rec: keep.* *Alternative:* shorter puppet down times instead of more damage.
3. **Masks on every theatre mummer, including the house's usher.** The usher's first mask is the COMEDY, the mildest. *Rec: keep.* *Alternative:* masks only from the stage door on.
4. **Harder theatre mummers.** The villain's lunge does 20 (unblockable, red), and the theatre mummer strikes for 18 (was 14). *Rec: keep:* deadly through damage, not health.
5. **The curve's death floor is met with 1 death in 3 runs** (three sets of runs gave 1, 2 and 1). *Rec: accept.* If a re-run gives 0 deaths, add one designed squad in the performance.
6. **The 0.25 s grace and the Brute's box grown to his drawing.** Both are fixes. *Rec: keep.*
7. **Music:** no change; the theatre and the Puppeteer keep their approved tracks.
