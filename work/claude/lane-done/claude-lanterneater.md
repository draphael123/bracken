# claude/lanterneater - THE LANTERN-EATER replaces Jenny Greenteeth on THE FOG CANAL's raft (Opus, 2026-10-07)

Base: master 56c2cf92. Brief: Daniel 10-07, "Jenny just isn't working, clunky". He kept the RAFT arena and approved a new beast.
Port 8722 only. Nothing was played by hand: **Daniel's playtest gate (B9) is open.**

## What was built

### THE LANTERN-EATER (src/lantern-eater.js the fight, pure; src/lantern-eater-hands.js its hands; src/redraw/lanterneater_art.js greybox art)
It is an enormous anglerfish-like thing under the basin. Its lure is a FALSE LANTERN that looks like the basin's own lamps. It is a **BEAST with vulnerability keys (B14)**, not a duelist:
- Each phase is keyed to one angle every hero has with base kit:
  - **HIGH**: a jump attack, the rising cut, the air up-swing or a plunge.
  - **LOW**: the low sweep, the knight's trip or the warden's low poke.
- The key is shown on screen as gold chevrons (up under a dangling light, down over its gums).
- A blow at the wrong height clanks and names it, through the shared turned-blow read (src/boss-read.js TURN_WORD): **TOO LOW** or **TOO HIGH**. A blow that lands while it is drawn back says **WARDED**.

**Phase 1: two lights in the fog (the read).**
- Each cycle, two lights come down over the raft's two ends. They are the same caged lantern:
  - the basin's **real lamp** hangs dead still and **FLICKERS**;
  - **the lure SWAYS**, slow and steady, and never flickers. Its stalk is only a faint thread in the fog.
- The lure is **bait over its mouth**. THE GULP (the new move, told: a red !!, water boiling, a red zone on the deck) comes up under the lure while it dangles, and the water draws you toward it.
- Two keyed (HIGH) blows inside the tell **SNAG** the lure. It is then OPEN: a gold ring and a timer (B10), and every angle lands at x1.4 up to 9% of its health. The stalk is revealed.
- Too slow, and you are in the gulp (110).
- A swing at the real lamp clanks: "THAT IS A LAMP: IT FLICKERS. THE LURE SWAYS".

**Phase 2: it surfaces beside the raft.**
- The jaws come up at the rail at the end nearer you. The **GUMS** (a pale pink band) are keyed **LOW**.
- Then **THE SNAP** (the new move, red !!): the jaws lunge onto the deck where you stand. The mark follows you, then fixes.
- Step out of it and its teeth stick in the timber: OPEN for 3.2 s.
- One end at a time, from either end, with one windup at a time.

**Phase 3: it snuffs every lamp.**
- The arena goes dark. The raft's lantern is the only light.
- Its lure comes down beside your lantern (keyed HIGH), with **THE HUNT** (the new move, red !!) boiling up under the lantern.
- **Strike the lantern** (a swing from the deck: a jump at the lure never dims it by chance) to **DIM** it:
  - the hunt veers off after a copy of the light ("YOUR LANTERN IS DIM: IT HUNTS THE COPIES");
  - out in the fog it bites at lure-copies instead;
  - no lure comes. That is the rule's trade.
- Strike it again to raise the light. After 6 s dimmed the hint box nudges: "RAISE YOUR LIGHT: THE LURE COMES ONLY TO A LIT LANTERN".

**In every phase:**
- **THE SWELL** (red !!, jump it): after every two of its attacks, its body passes under the raft and a swell runs along the deck.

**After every opening:**
- A told **3 s ward** (B3): the lure is drawn up, or the jaws sink, inside a grey ring.

**Never invisible-invulnerable (B12/B13):**
- The keyed part is in reach every cycle.
- Each opening is a thing you DO (strike the bait twice, step out of the snap).
- Left alone a minute, it never opens in any phase.

**Fiercer each phase:** tells x1, then x0.92, then x0.86 (every tell at least 0.5 s); the gaps are 0.9, 0.7 and 0.6 s.

**Numbers:** health 1900. Damage: gulp 110, snap 95, hunt 110, swell 70.

**The arena:**
- It is claude/canal4's raft chamber, unchanged: the same footprint and geometry (stageLanternEater = stageGreenteeth's chamber).
- The raft is handed back to you after a fall into its water.
- Its death sends the raft to the east landing and puts out its lure: "THE BASIN LAMPS BURN AGAIN".

**Foreshadowing (B8):**
- **THE LAMPS THAT ARE NOT LAMPS**: a warm light now and then hangs swaying over the water where no post stands, on a faint stalk, then sinks. These are glimpsed in the fog bank, at the flight's summit and in the basin. They replace Jenny's eyes in the fog (src/canal-hands.js; the fog-canal.js data is `lures`).
- **The bargemen's line**, on the sign at its door: "THE BARGEMEN SAY: STEER BY A LAMP THAT FLICKERS. A LIGHT THAT SWAYS IS NOT A LAMP."
- The child's shoe and the bubbles stay.

**Boss theme** (src/boss-music.js 'lanterneater', composed in code): A Phrygian, 84 bpm, 46 s.
- A heartbeat under the water, a drone, the lure's glassy swaying pendulum (E5-F5) and drips.
- Phase 2 adds teeth clacks. Phase 3 (dark) thins out the lure and drops the drone.
- It is in the Sound Test, credited "The Lantern-Eater" - BRACKEN.

**SFX** (src/audio.js le*): lure, boil, gulp, teeth, snap, snag, growl, swell, snuff, decoy, lantern, sink, plus its death and hit sounds.

**The bot** (src/lantern-eater.js PLAN / lanternPlan; lab.js branch). It reads only drawn state:
- the lights' sway and flicker, read 0.45 s after they show, and wrong 15% of the time until the lamp clanks;
- its tell marks a reaction late, through the eyes;
- the snap's mark, the swell's crest, the lantern's light, the open ring.

It also strikes the bait until 0.5 s are left, then bails. It misses 12% of tells and swings at the wrong height 12% of the time.

### Jenny retired (Daniel's design change)
- **Kept, unwired:** src/benched/jenny-greenteeth.js and src/benched/jenny-greenteeth-hands.js, each with the header note "saved for a future mini (kelp armour: HIT HIGH body / HIT LOW hood)". Her sprites stay in src/redraw/greenteeth_art.js and greenteeth_kelp.js.
- **greenteeth_art.js is still imported** by src/redraw/canal_tiles.js for the lock skins, so its modulepreload line stays.
- **Removed from the canal:**
  - main.js: every GTH/GM hook, now LEH/LEM;
  - the bestiary card, BOSS_T, BEAST_SHORT, COLS, BOSS_FELL;
  - marks.js BY_HAND, MARK (regenerated with tells --write), ANSWER, HEIGHT;
  - hint-lines.js: her lines, replaced by its own;
  - boss-greed OPEN_RULE/OWN_WARD, threat, lab.js;
  - the index.html preloads;
  - the grindylow's card no longer calls it "Jenny Greenteeth's brood".
- **Not in the boss rush:** the canal was never in the rush (RUSH had no canal row), so there was nothing to remove there.
- **Her music:** her lament code stays in audio.js with a note that it is benched. It was never in MUSIC_NAMES.
- **Her gt\* SFX stay** in audio.js, unused.
- **Tests that pinned her were replaced with the same strictness, not weakened:**
  - tools/greenteeth.mjs became **tools/lantern-eater.mjs**, rule for rule:
    - its four blows' marks, answers and heights, with no Jenny rows left;
    - every blow fires;
    - one new blow a phase, one windup at a time;
    - the keys and the named wrong height;
    - the read (one lure and one lamp at opposite ends, the lure sways and never flickers, the lamp is still and flickers, the gulp is under the lure);
    - its keyed part is reachable every cycle;
    - openings of at least 3 s within its share;
    - left alone a minute in every phase it never opens;
    - the told ward;
    - phase 3's dim and raise;
    - fiercer each phase, every tell at least 0.5 s;
    - an imperfect bot;
    - the stage and the foreshadowing.
    - In the page, for all 7 heroes: a real jump attack lands whole on the lure and a plain swing clanks, and a real low sweep lands whole on the gums and a plain swing clanks. Also: the real lamp takes nothing, the lantern dims and rises to a real swing, open a real swing bites, a fall is handed back to the raft, and its death ends the fight with the raft drifting east.
  - tools/check.mjs runs it in place of greenteeth.
  - **tools/canal.mjs:** her wiring and footprint asserts now name the Lantern-Eater. Her eyes became the lures, and the bargemen's sign is required.
  - **tools/boss-openings.mjs, canal row:**
    - left alone a minute, nothing opens;
    - real rising cuts at the bait snag it open for 3 s or more;
    - a fixed snap stepped out of sticks its teeth open for 3 s or more.
  - **tools/boss-navigation.mjs:** the pilot must fight on the raft (the leRaft mover).
  - **tools/canal-water.mjs:** the raft's water is still one level.
  - **tools/boss-music.mjs:** the canal arena plays 'lanterneater', with the loop and density checks, and no greenteeth in the Sound Test.
  - **tools/audio-assets.mjs:** NO_FILE_BY_DESIGN has lanterneater.
- **Deleted, as tools rather than checks** (they scripted her fight): greenteeth-pilot, greenteeth-sheet, greenteeth-shots and canal4art-jenny-shots.
- **tools/bot-calibrate.mjs:** FEEL lost its `canal: easy/80` row. That was Daniel's feel of Jenny, and it is a calibration input, not a check.

### One small main.js plumbing change
`wardedDamage(e, dmg, blow)` now carries the hero's blow, for the two hurtEnemy0 calls. A burn tick passes none, so it can never count as a keyed HIGH blow (or snag the lure) just because the pyromancer happened to be mid-jump. Every other boss ignores the extra argument.

## Numbers
**Boss rates:** `PORT=8722 node tools/boss-rates.mjs canal --ways=practiced --seeds=6 --profile=human`, L22, dry, no skills.

| hero | wins | winning fights (s) |
|---|---|---|
| knight | 3/6 | 93-102 |
| warden | 2/6 | 140-152 |
| pyro | 5/6 | 91-127 |
| **total** | **10/18 = 56%** | in band, no hero at 0 |

- The warden's wins run to 152 s, just over the 150 s mark.
- Tuning took four rounds, about 16 seeds a hero; I stopped once it was in band:
  - round 1: 100% (the lure was snagged every cycle, so the gulp never came);
  - the gulp became a bait tell, needing 2 keyed hits;
  - round 3: 75%;
  - then the opening was changed to pay x1.4 capped at 9% (it was x1.25 / 12%), which slowed the quick heroes and sped up the warden: 56%.

**Mash bot** (re-stamped via tools/mash-bot.mjs, LEVEL then BOSS):
- **Boss 0/6.** It was left on 99% (knight, both runs), 99% and 100% (warden), 98% and 96% (pyro).
- **Level:** every hero dies (6 deaths, lowest health 0%).

## Checks run (PORT 8722)
lantern-eater (pure + page, all 7 heroes), canal, tells (--write), answer-tags, boss-read, boss-music, audio-assets, hint-shown, boss-greed, boss-fight-end, modulepreload
(1 unlisted module, matriarch_young.js, pre-existing on master), plus the second round in "Checks, final tree" below.

## ART PASS needs (greybox now; the read is done, but the art should keep it)
- **Its body:** the dark bulk under the water and its eyes. Only a shadow ellipse and two pale pixels now; it wants a real silhouette that slides under the raft.
- **The lure vs the real lamp:**
  - They must stay the SAME caged lantern, so that motion alone is the read.
  - The lure needs a fleshy bulb inside the cage (it reads close up), a stalk that is only a faint thread until snagged and then pale and veined, and a pulse.
  - The lamp needs a proper iron chain and a guttering flame with smoke.
- **The jaws:** an upper jaw of needle teeth, the lower jaw, the GUMS (the keyed LOW target, pink), the eye, and the water sheeting off them.
- **Pose cycles:**
  - surfacing (the boil, then the jaws rising);
  - jaws open and breathing;
  - the snap lunge;
  - teeth clamped in the timber (it struggles; the open state);
  - sinking;
  - the gulp and the hunt bursting up;
  - the snagged lure jerking on its stalk;
  - its death (sinking, the lure guttering out).
- **The swell:** a hump of water under the deck, the raft lifting.
- **The snuffed-lamp darkness:**
  - the basin lamps going out one by one, with smoke;
  - the dark's falloff round the raft's lantern (wide lit, an ember dimmed);
  - the lure-copies out in the fog and the splash as it bites one.
- **The raft's lantern on its short post:** it now hangs at hip height so a standing swing reaches it, with lit and shuttered states.
- **The foreshadowing lures in the level:** the same swaying lantern, glimpsed.
- **Its bestiary card** (bakeCard: jaws and lure, a placeholder).

Stills: work/claude/lane-done/lanterneater/greybox/ (tools/lantern-eater-shots.mjs).

## QUESTIONS FOR DANIEL (recommendation first; built)
1. **The snag takes TWO keyed blows inside the gulp's tell** (1.5 s). One blow only jerks it ("IT JERKS ON ITS STALK: AGAIN, BEFORE IT BITES").
   - With one blow the bot never met the gulp, and won 100%.
   - Rec: keep. Alt: one blow, with a shorter tell.
2. **Phase 1's gold ring appears only once the lure is snagged.** While the two lights dangle, both wear the same HIGH chevrons (the key, B14). A ring on the lure before the strike would give the read away.
   - Rec: keep. It is the "two lights" read the design asked for. Alt: ring the lure from the start (the read becomes cosmetic).
3. **The lantern dims and rises only to a blow from the deck** (a plain or low swing). A jump attack or the rising cut at the lure beside it never dims it by chance; the bot kept dimming it by accident.
   - Rec: keep.
4. **Phase 3 has no lamp to read**, only the lure, beside your lantern. The read there is the light trade: lit means the lure comes and so does the hunt; dimmed means safe and no damage.
   - Rec: keep.
5. **The warden's wins run 140-152 s** (about 150, the band's top), and the spread is wide: the pyro 5/6 against the warden 2/6.
   - Rec: let your playtest set it. The next lever is the opening cap (9%), not health.
6. **Jenny's music** stays in audio.js (benched code). It was never in the Sound Test.
   - Rec: keep the code for her future mini.
7. **No CC0/CC-BY pick is needed**: the theme is composed in code. If you want a file later, a slow, eerie underwater track would fit, and I can list candidates (none downloaded).
8. **Key spread (B14):**
   - THE FOG CANAL keys HIGH (phases 1 and 3) and LOW (phase 2).
   - Waymeet before it is a duelist (exempt). The fair after it is keyed PR in scratch/audit-keys.md.
   - Rec: no clash.
