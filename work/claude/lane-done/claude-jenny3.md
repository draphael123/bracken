# claude/jenny3 - JENNY GREENTEETH, round 3 (Opus, 2026-10-05)

Base: master 2423ff42 (batch68). Master did not move during the lane (checked before this report). Brief: scratch/brief-jenny3.md (Daniel's 10-05 live playtest).

## Important first: the two harnesses disagree, and why
I measured master BEFORE changing anything, two ways, on port 8620:

| harness | hero | master (before) |
|---|---|---|
| `PORT=8620 node tools/combat-pilots.mjs canal --salts=1,2,3,4,5,6,7 --secs=300` | the canal's campaign level (BKT.setHeroLevel(h, 21), no skills) | **21/21 = 100%** (knight 7/7 in 25-34 s, warden 7/7 in ~76 s, pyro 7/7 in 30-47 s) |
| `PORT=8620 node tools/greenteeth-pilot.mjs 1,2,3,4,5,6,7` | the page's fresh LEVEL-1 hero (no setHeroLevel) | 11/21 = 52% (5/2/4), the same as INTEG67 and JENNY2 |

- tools/greenteeth-pilot.mjs never called setHeroLevel. That is where the "52%" came from.
- At the level the campaign expects at the canal, the knight killed her in two openings, in 26 s. Daniel's "easy" is the leveled number.
- This is probably the same cause as the Death Knight's 21/21 vs 57%.
- Following common-1005 (setHeroLevel for every boss bot), I tuned against the leveled harness.
- greenteeth-pilot now takes `--campaign` (setHeroLevel at the canal's depth, as combat-pilots does). Without the flag it measures the old way.

## What changed
1. **Phase 3: the lure made loud** (Daniel's pick).
   - `lureLive()` is true only in the fog's lure cycles, while the boat's back is a shallow and she isn't wary of the charge.
   - While it is live:
     - the sunken boat GLOWS gold: a lit rim along the deck, a warm wash, and a hole burnt in the fog;
     - a pulsing GLINT sits over the boat, or a chevron at the screen edge when the boat is off screen;
     - the callout STAND ON THE BOAT: DRAW HER ONTO IT comes up when the lure goes live;
     - a STALL NUDGE repeats the callout after 10 s off the lit boat, at most every 25 s.
   - A hero on the lit boat draws her CHARGE next, every time. Before, in the second lure cycle (lean "bite") her deck had no charge, so the lure could never fire. That was a real clarity bug.
   - Her charge tell draws a GOLD dashed line across the shallows to the boat's edge where she will run aground.
   - Aground, she gets a BIG gold double ring, the text STRANDED!, and a wide clock bar.
   - **Teach beat:** fogTell is 2.0 -> 2.8 s, and the boat's glow rises with the fog.
2. **Same clarity audit for phases 1-2.**
   - The paddle that is the beat now (the drain with her at the gate, or her culvert's paddle) gets the glint or chevron.
   - DRAIN THE LOCK WHILE SHE IS AT THE GATE now repeats every 25 s while the drain is still to strike. It used to be said once.
   - **Found and fixed:** the canal's barge stall nudge "THE GATE IS SHUT: FIND ITS PADDLE" was firing inside her arena, over her phase-3 stranding. This is likely part of why Daniel "thought it was sluices/water".
     - In `src/canal-hands.js` clarity(), a hero inside her lock now hears only her lines. This is the one canal edit, and it is arena-only.
3. **THE VINE** (new ranged move, Daniel's pick "pull you off"). Mark !!, answer jump, height low (marks rows plus `tells --write`).
   - She coils a weed-rope (0.8 s tell) and throws it along the ledge you stand on, at your feet. The tell shows a red band and the rope traced out to you.
   - It is only thrown at a hero 110-340 px away and standing (the far ledge or walkway is no longer safe). It is never thrown at a hero on the lit boat, and never paired: one windup at a time.
   - **Caught:** 30 damage, then you are YANKED toward her through the air (vx 250, vy -200, legs held 0.5 s) into her water. It is a throw, not a teleport. The lock has no deadly water.
   - Lines: HER VINE PULLS YOU OFF: JUMP IT and HER VINE HAS YOU (both in hint-lines.js).
   - The bot jumps it like the lash.
4. **A bit faster (~12%):**
   - swim 100/125/150 -> 112/140/168;
   - gaps x0.88;
   - charge 270 -> 300;
   - tells x0.9 (grab 0.8, lash/reach/net/tear 0.72, bite 0.67, slam 0.9, charge 0.8). Every tell is >= 0.5 s, and a test asserts it.
5. **Numbers, to reach the band at the campaign level:**
   - **Per-opening share cap (new):** a fighting opening (stuck, dazed) takes at most 8% of her, and a beat or lure stranding at most 15%. Past that, a blow lands at the ward.
     - This is the Puppeteer's visit-cap pattern, with a one-line hook in main.js.
     - A green line under her OPEN clock shows the share left. When it is spent, the line THAT OPENING IS SPENT: THE WATER TAKES IT appears.
     - Without the cap, a level-21 knight ended a whole phase in one stranding.
   - **Her damage x2.5:** lash/reach/charge 50, bite/surge 45, slam 60, grab 35, net 20, vine 30, beat-opening swipe/snap 40. A level-21 hero has about 198 health.
   - **Health unchanged (755).**
   - x2.7 damage gave the same 12/21, so I kept x2.5.
6. **Bestiary text:** mentions the vine and the glowing boat.

## Numbers (same command as the before row)
`PORT=8620 node tools/combat-pilots.mjs canal --salts=1,2,3,4,5,6,7 --secs=300`

| | knight | warden | pyro | total | fights |
|---|---|---|---|---|---|
| master (before) | 7/7 | 7/7 | 7/7 | 21/21 = 100% | knight ~26 s |
| **after** | **5/7** | **3/7** | **4/7** | **12/21 = 57%** | median ~93 s (wins 81-125 s); deaths at 1-40% boss left |

- `greenteeth-pilot.mjs 1..7 --campaign` gives the identical 12/21 (the same deterministic fights). It also shows every fight reaching phase 3 with 6-11 cycles.
- **Old level-1 harness after the change:** 2/21 = 10% (0/2/0). A level-1 hero is far under the canal's expected level 21, so I expect this.
- **Mash bot:** re-stamped through the bot, canal level THEN boss. Boss 0/6: knight dead at 92% boss left, warden 96%, pyro 85%. Level: every hero dies (lowest health 0%).

## Checks (named, on the final tree), all green
- greenteeth: pure and page. New rules: tells >= 0.5 s and ~12% quicker; the vine every phase, never paired, jumped = missed, caught = pulled, never at a swimmer beside her; the lure live and said, nudged at 10 s, a hero on the lit boat draws the charge first, no lure in the non-lure fog cycle, teach beat >= 2.5 s; an opening takes at most its share. The new rules fail on master's src (TypeError on `lureLive`).
- Also green: tells, hint-shown, answer-tags, boss-openings, boss-greed, boss-fight-end (51 fights), canal, canal-water, stuck, corpses, architecture, checkpoints, skins, dangling-paths, npc-removal, audio-assets (no new SFX: the vine and the lit boat reuse gt* sounds), mash-gate, mash-carry, level-quality canal (it clears the bar).
- **slopes-trace:** canal differed at lip probe 29, frame 2033, x 6038. That is inside her lock and is her water's faster timeline, the same probe JENNY2 rebased. I rebased canal only (`--rebase=canal`); the others are identical.
- **textfit:** red only on the known DJINN OF THE GREAT WELL / THE DJINN  SAND strings. These are pre-existing on master (INTEG67) and not mine.
- **tools/boss-openings.mjs (test robustness, the assertion unchanged):**
  - Before the drain probe, it now lets her in-flight windup at the west walkway land. Moving the hero across the lock mid-slam stuck her claws in the far timber.
  - It also waits 12 s instead of 6 for her to swim to the east gate, because her vine at the walkway hero holds her up.
  - It still asserts that left alone she opens nothing, and that the drain strands her open for >= 3 s (3.2).

Stills: work/claude/jenny3/*.png (`node tools/greenteeth-shots.mjs knight canal work/claude/jenny3`). The new ones are 16 (fog teach), 17 (lit boat), 18 (lure charge line), 19 (big STRANDED), 20-21 (vine).

## UNVERIFIED
- Nothing was played by hand. **Daniel's playtest gate is still open.**
- Co-op is untested. The lure nudge reads the nearest hero.
- The boat's glow is readable in stills but subtle under the fog. Daniel may want it brighter.
- I did not check whether the vine's yank can carry a hero from a walkway past a gate into the canal beyond. The arena walls are closed in the fight, so it should not.

## QUESTIONS FOR DANIEL (recommendation built)
1. **Which hero level is the measure?**
   - *Rec (built):* the canal's campaign level (setHeroLevel 21, house rule). She is 57% there.
   - The old level-1 measure now gives 10%. A player who reaches her badly under-leveled will find her very hard.
   - *Alt:* tune for level 1 (she would be ~100% at level 21 again).
   - Other bosses tuned on harnesses without setHeroLevel probably have the same gap (the DK 21/21).
2. **Per-opening share cap** (8% fighting, 15% beat). *Rec: keep.* It makes every phase take several openings at any hero level. *Alt:* raise her health instead, but then strong heroes still skip a phase in one stranding.
3. **The vine is in her kit every phase**, not a phase's "new move", because the slam, charge and net already are. *Rec: keep* (it answers "easy to avoid"). *Alt:* make it phase 2's or 3's only.
4. **57% is mid-band, not the low end.** A damage bump (x2.7) did not change a single outcome, and further steps cost a 20-minute run each. *Rec: keep* and let the playtest decide.
5. **The canal barge nudges are muted inside her lock.** *Rec: keep.*
