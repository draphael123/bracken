# claude/ksar FIX PASS (2026-10-07): the reviewer's MUST-FIX list (scratch/review-ksar.md)

This pass merged origin/claude/walker (tools/level-walk.mjs). Healing code is untouched: the SURVIVAL lane owns it, so the level is tuned against today's healing.

## Must-fix status
1. **Pits and platforming: DONE.**
   - **The wall walk** has 4 breaches of spiked rubble. A fall in hurts and you climb out.
     - The first breach is taught bare: a sign, no foe.
     - The others each have a foe at the jump: a lookout plus a low hawk; a whip apprentice whose lash pulls you in; a shield sentry plus a slinger.
   - **The exam roofs** are cut by 4 bottomless gaps. A fall there is a real death (A10 amended).
     - A sign tells it before the first gap.
     - A foe stands at each gap: a hawk, the lookout's race to his gong, a planted shield on the narrow roof's lip, and the climax drop.
2. **Hard at campaign level: PARTLY.**
   - **What changed (weight, not hazards):**
     - Fort blows hit harder: a blade's or whip's cut x3.6 (L.foeHit).
     - Fort men are tougher: blades and whips have x2.6 health (L.foeHp).
     - "The fort's drill": blades and whips close faster and come again sooner. Their windups are unchanged.
     - Squads are designed front and back, with a shield in front.
     - Post kegs are cut from 21 to 6.
   - **What the walker shows:** 0 to 1.5 deaths a run. They are mostly falls at the shield on the narrow roof.
   - **What is still missed:** arrival stays near 100%. Today's kill heals (+11 a kill) refill the bar within every section.
3. **Cut and throw required: DONE.**
   - **Cut:** the roof bridge hangs from its gong's rope over a 7-tile drop. You cut the rope to lower it.
   - **Throw:** the hawk tower's door is bricked. No set keg reaches it, so you throw one from the stack before it.
   - Both are asserted in tools/ksar.mjs and in the reach fill: a cut 'ksbridge' counts as a plank.
4. **Three-verb exam climax, checkpoint after: DONE.** It runs between checkpoint 489 and checkpoint 581:
   - cut the bridge gong before its lookout rings it;
   - ring the roof-three gong to draw the hawk tower's squad;
   - throw a keg at the tower door, under three slingers.
5. **Hawk-Mistress phases 2 and 3: DONE.**
   - A cut courtyard gong can be hung back with E.
   - All courtyard gongs hang again for a new attempt.
   - The rule opening is x2.0 with a 12% cap (it was x1.6 with 6%). It is now 60 to 90% of every hero's damage.
   - Phase 3 has one new move, the dive. The flash-powder desperation is cut.
6. **Blades under 35%: DONE.** Blades are 26%, and the cutthroat machine as a whole is 46%. Sentries went from 2 to 7. Both limits are asserted.
7. **Pyro spread: DONE.**
   - **The cause:** the kit. Her red low lash left the knight no answer.
   - **The fix:** the knight's LOW GUARD (crouch) turns a low red blow. A standing shield still cannot.

## Numbers (level 35, human profile)
- **Boss, practiced:** knight 4/8, warden 4/8, pyro 5/8 = 54%. No hero is at 0. Health is 1700. Wins take 73 to 108 s.
- **Mash bot:**
  - Boss: 0/6.
  - Level: lowest health knight 0%, warden 23%, pyro 0%. Stamped LEVEL, then BOSS.
- **Level-1 pilot:** 35 blows and 10 deaths over 3 runs.
- **Curve:** in band.
- **Route pilot:** all 7 heroes walk the route with 0 lifts.
- **Walker (2 seeds a hero):**

  | Hero | Deaths before | Deaths after | Arrive before (mean/min) | Arrive after (mean/min) | Lost %/section before | Lost %/section after | Measured before | Measured after |
  |---|---|---|---|---|---|---|---|---|
  | knight | 0 | 0 to 1.5 | 97/89 | 94 to 100 / 82 | 25 | 17 to 46 | 49% | 87 to 97% |
  | warden | 0 | 0 to 1 | 96/92 | 84 to 92 / 43 to 56 | 27 | 34 to 48 | 49% | 81 to 97% |
  | pyro | 0 | 0.5 to 1.5 | 100/100 | 97 to 100 / 82 | 62 | 26 to 58 | 30% | 97% |

  Before this pass, every hero got stuck at the gate.
- **Walker hands added:**
  - a level hook (BK.walkHint) that tells the walker how a player works the level's locks;
  - no hunting a foe from the middle of a jump;
  - sleeping foes are not treated as in the way.

## Checks
- **Green:** ksar, level-quality, mash-gate, curve-gate, killzones, architecture, signs, sprinkle-cap, checkpoints, checkpoint-gaps, hint-shown, goblin-lint, one-new-foe, corpses, answer-tags, tells, boss-read, crouch-a, duck, threat-holes, skins, dangling-paths, homepaths, map-spacing, comments, npc-removal, audio-assets, boss-music, boss-greed.
- **Was red, now fixed:** duck was already failing before this pass. Her feint had a HEIGHT row; it is fixed in src/marks.js.
- **Not run:** the full suite.

## QUESTIONS FOR DANIEL (each rec is what is built)
1. **The arrival target under today's healing.** Rec: judge the level on deaths and loss per section, then re-walk it once the SURVIVAL lane lands. Alt: make foes heavier now (health sponges).
2. **The knight's low guard turns her lash.** Rec: keep. Alt: the lash stays red for all, and the knight wins 0 to 3 of 8.
3. **A cut courtyard gong is hung back with E.** Rec: keep.
4. **The fort's weight sits on a level hook (L.foeHit and L.foeHp).** Rec: keep, and let other desert lanes reuse it. Alt: an act-wide table.
5. **Falls in the exam are deaths, one gap guarded by a shield.** Rec: keep. Your playtest judges whether it is fair.
6. **Flash-powder desperation is cut.** Rec: keep it cut.
7. **The earlier questions 1 to 11 stand.** That includes the sun as backdrop, 6 post kegs, and the music "Desert Loop" (CC0).

## ART PASS LIST
- **Own kit and palette:** its own mud-brick and ashlar kit and palette.
- **Breaches and gaps:** the breaches drawn as broken brick with stakes; the roof gaps with crumbling lips.
- **The bridge:** shown raised and lowered, with its rope.
- **The hawk tower:** drawn as a real tower with battlements, a perch and the bricked door. It should be the landmark in view from the roofs.
- **Lights:** torches and braziers in the souq, the store, the tower room and the courtyard; lamps at the gatehouse.
- **Dressing:** awnings, barrels, banners, perches and the huts.
- **The battlements:** read as an inside and an outside.
- **Bodies:** the reskins, the hawk scout, and her body and hawk.
- **Music:** "Desert Loop" (CC0), on Daniel's pick.

---

# claude/ksar - THE BANDIT KSAR + THE HAWK-MISTRESS, the Opus greybox (2026-10-07)

Base: origin/master b4300130 (batch75). Brief: `.claude/briefs/brief-banditksar.md` (from the approved concept; Daniel's 10-07 interview kept every rec).
House rules: the design standard (A1-A12, B1-B14), common-1006-night. Greybox art only: no art pass before the review.

## What it is
`ksar`, THE BANDIT KSAR, desert act, `needs: 'glasssea'` (APPENDED to LEVELS; map node (40,92) on the desert sheet). The Buried City is not built:
when it is, it needs `'ksar'`.

THE RULE (the LEVELS line, asserted equal to src/ksar.js's header): "THE FORT ANSWERS ITS GONGS: A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT
ROPE SILENCES IT."
- RING: E at a hanging gong. Every fort man in its earshot (drawn: a bracket on the floor near you, noise rings when rung) is CALLED to it. He leaves
  his post (a guard post, a bed in a guard hut, the gatehouse), musters there 3 s, and walks back. If you are there, he fights. A gong hums for 4 s.
- CUT: a blade on a gong cuts its rope. The disc falls and stays silent for good, through deaths too. THE GREAT GONG hangs on a chain and cannot be
  cut, because its call is the only way to empty the gatehouse (no soft lock).
- LOOKOUTS: a lookout who sees you (a sight cone, smoke hides you) runs for his gong with a red '!' and rings it, unless its rope is cut. PLANTED
  SENTRIES strike their own gong on the alarm.
- HAWK SCOUTS: one that spots you shrieks, and every lookout in earshot runs. A roof, an awning or smoke hides you from it.
- THROW (src/carry-throw.js kinds 'keg' and 'flask'): E takes one, ATTACK throws it along the told arc (UP lobs, DOWN tosses short).
  - A KEG fizzes, then blasts: foes, you, any bricked arch in reach, and the next keg (a chain). A set keg is KICKED by any blow or flame.
  - A FLASH FLASK blinds a hawk, stuns bandits close by, and leaves a puff of smoke.

## The level (src/ksar.js, 628 columns; hands src/ksar-hands.js; the hawk scout src/ksar-foes.js)
1. THE CARAVAN ROAD (0-71), TEACH.
   - The first screen climbs the wadi bank.
   - THE FIRST GONG stands by a sleeping lookout: cut its rope, or ring it and the guard hut's two sleepers come.
   - A keg stack and a bricked arch in the wall's foot (seal one): the throw, taught where failure is cheap.
2. THE OUTER WALLS (72-231), TEST.
   - A lookout walks the stretch before gong two. The smoke thrower's smoke hides you.
   - A hawk scout patrols, and a flask rack sits under it.
   - Two towers stand on the walk: the way is over them. Tower two holds seal two and a silver.
   - A planted SHIELD SENTRY guards gong three. Drop in behind him from the ledge.
   - A whip apprentice.
3. THE GATE WINCH (232-272), SET PIECE ONE, the REQUIRED RING.
   - The gatehouse squad holds the winch's BRAKE from a guard room behind a grille that you cannot enter. A gauge and a brake lamp sit by the winch.
   - Ring THE GREAT GONG on its tower. The squad drops out of the grille and runs to the tower's foot. Haul the portcullis notch by notch (E) while
     they muster and race back.
   - A raised gate drops a notch at a time while anyone holds the brake. Once fully raised, it is pinned.
   - MURDER HOLES drop told stones on anyone at the gate or in its passage while the room is manned.
   - Seal three is in the passage.
4. THE SOUQ YARD (273-357), REMIX: ring the souq gong to draw the stair's squad (two blades and a whip) under the roof, then throw a keg from the roof
   onto them. Also: a terrace lookout and his gong, a guard hut, a slinger on the minaret's balcony, and a silver on the roof walk.
5. THE POWDER STORE (358-445), SET PIECE TWO, the REQUIRED THROW.
   - Six kegs are set along the roof. Kick the first: the chain shows its fuse-line and rings first, then runs keg by keg to THE BRICKED ARCH. The
     arch is eight rows of brick across the only way on.
   - The chain also blows the roof squad and holes the roof into the store's cellar (seal four and a silver). Ledges lead back up.
6. THE HAWK TOWER ROOFS (446-583), EXAM.
   - Three gongs, two lookouts, a planted sentry, three hawk scouts, slingers on a parapet and a perch, and the roof squad.
   - Seal five is on the high ledge.
   - THE STRONGROOM (five seals: a silver) is in the shaft to the courtyard door.
7. THE COURTYARD (584-623): THE HAWK-MISTRESS.

Checkpoints are at 168, 276, 392, 486 and 581: one every 124 route tiles, never under 90 or over 175 apart.

THE CAST (human bandits only; the one new AI is the HAWK SCOUT):
- reskins by cnSkin: KSAR BLADE and GONG LOOKOUT (the cutthroat's machine), WHIP APPRENTICE (the same machine reads you a lash nearer; the lash
  reaches 62 px and pulls you in), SHIELD SENTRY (the shield guard), SMOKE THROWER (the dynamite bandit; his pot bursts in smoke), WALL SLINGER.
- Every fort man answers the gongs.

## THE HAWK-MISTRESS (src/hawk-mistress.js pure fight + bot plan; src/hawk-mistress-hands.js)
A HUMAN DUELIST (B11): ALWAYS HITTABLE.
- HER GAUNTLET turns a frontal blow at her height while she is on guard, with a clank and "HER GAUNTLET: GO ROUND / HIT HIGH". From behind or from a
  jump, the blow lands. In her tells and strikes, every blow lands. She is on FULL_DAMAGE (greed still counted).

THE HAWK is part of her kit: one target, never in the enemy list. A blade through it says IT RIDES THE AIR.
- OPENINGS (B1): a hero's ring on a courtyard gong sends it WHEELING; a flash flask within 80 px BLINDS it. Either way she WHISTLES it back: OPEN
  3.6 s (gold ring and timer bar), x1.6, at most 6% of her per opening. B4: she stands still while open.
- B3: a told 3 s WARD follows each opening: the hawk is on her glove, and a gong rung then "finds the glove".
- Her guards' own gongs do not spook the hawk.

The phases:
- P1, the courtyard duel:
  - WHIP LASH: !!, a long low lash that wraps a shield. Jump it.
  - KNIFE FEINT: a stamp, then the real cut (!, it lunges; a shield turns it).
  - THE HAWK SPOTS: !, it drops over you and marks your spot; her next lash cracks there (!!).
- P2 (60%), her guard answers the gongs:
  - The phase opens with her whistle: every hanging gong rings and her guard comes down (2 at most).
  - NEW: THE CALL (!). A runner on the wall walk goes for a gong, and a guard comes down unless the rope is cut. Cut gongs cannot send the hawk off,
    so the flasks become the opening.
- P3 (25%), the store burns:
  - NEW: THE HAWK DIVES (!!, a shadow marks your spot).
  - Fire burns at the yard's ends, and the roof ledges crumble end by end.
  - DESPERATION (12%): FLASH POWDER (!!, get clear).

Her theme is composed in code: `hawkmistress`, with :p2 and :p3 variants. The level bed is `ksar`, plus its own ambient (`ksar`).

## Numbers (all at campaign level L35)
- **Boss** (`tools/boss-rates.mjs ksar --ways=practiced --profile=human`, 8 seeds a hero): knight 3/8, warden 3/8, pyro 8/8 = **58%, in band, no
  hero at 0**. Fights run 72-147 s.
- **Mash boss**: 0/6 (dead in 28-44 s; she keeps 67-98%).
- **Mash level**, stamped LEVEL then BOSS: lowest health knight 14%, warden 0% (one death), pyro 33%.
- **Level-1 pilot**: 37 blows and 4 deaths over 3 runs. **Curve**: act 5, 291% health lost a run, 4 deaths (band 150-700%, 2-12): in band.
- **Route pilot** (`tools/ksar-route.mjs`, real keys, god, no foes = base movement): **all seven heroes walk the whole route, 0 lifts**. The pilot
  cuts the gongs, rings the great gong, hauls the winch and kicks the chain.
- **Glint + 10 s nudge** (STUCK_HANDS.ksar): checked at runtime at the gate and at the store. The nudge says its line after the stall.
- **level-quality**: ksar CLEARS THE BAR and is now in GATE (flat 0%, bands 6 / 42%, 7 gadget kinds, density 1.54, roles 4, ranged 12, ruleFight
  37/37, pilot, mash, curve).

## Checks run (green)
`ksar` (new, 111 Node asserts, in check.mjs), level-quality (gated), mash-gate, curve-gate, boss-greed, boss-fight-end (all 55 fights end),
hint-shown (source and page), audio-assets, boss-music, one-new-foe (ksar = [hawkscout]), goblin-lint, threat-holes, answer-tags, corpses,
architecture, skins, signs, sprinkle-cap, floaters, slopes-trace (unchanged), npc-removal, stuck --static, tells, checkpoints, map-grammar,
map-spacing, dangling-paths, homepaths, comments. Also the route pilot (7 heroes) and the nudge probe.

**Not run**: the 40-minute suite, `stuck` runtime (my own probe covers the two locks), `boss-openings`. The Ksar's opening proof lives in tools/ksar.mjs:
a ring opens her, and a minute of her left alone never does.

**Red, not mine**: none seen in what I ran.

## Changes beyond the brief (all built; each one is a question below)
- THE DESERT SUN as the level's backdrop, as in the Glass Sea's day. Awnings are spaced so that no walk on the route is over 5 s in the sun (asserted);
  shade also hides you from the hawks.
- THE FORT'S POWDER: single kegs set by the posts. A blow or a flame lights one.
- THE MURDER HOLES at the gatehouse.
- The fort's men hit x1.2, and a parapet stone hits for 13.

Without these, a masher at L35 kept 72-91% of his health: the fort's men feint slowly and the bots stream past them. The brief asked that the mash
bot must not clear the level.

## Music (listed only: NOTHING downloaded; licences read on each page today)
1. (REC) "Desert Loop" by iamoneabe, CC0. https://opengameart.org/content/desert-loop. A loopable desert VGM loop.
2. "Desert Biome" by joeBaxterWebb, CC-BY 4.0 (credit needed). https://opengameart.org/content/desert-biome. "Anxious, spacious music for a
   mysterious desert", Arabic and fantasy elements.
3. "mirage" by syncopika, CC-BY 3.0 (credit needed). https://opengameart.org/content/mirage. Guitar and saxophone with desert influences.

Alt: "Shalibah" by Tozan, CC0 (https://opengameart.org/content/shalibah). The page shows a MIDI only, so it would need rendering.

## UNVERIFIED
- No Daniel playtest yet. This is THE HAWK-MISTRESS's gate (B9).
- No human eye on the greybox in play: I have stills of nothing, and every number above comes from a bot.
- The careless level-1 route run (fights everything, never blocks) died 8 times in one run. That was before the fort's hit multiplier came down from
  1.4 to 1.2, and I have not run it since.
- The souq trap (a keg from the roof onto the mustered squad) is not piloted. Its pieces are tested apart: a ring calls the squad to the gong, and a
  thrown keg blasts where its arc lands.
- The hawk scout's art, all the reskins and her body are greybox shapes and palette shifts.

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **THE DESERT SUN in the Ksar** (not in the concept). Rec: keep. It is the act's backdrop, as in the Glass Sea. The awnings are the shade, and shade
   is also cover from the hawks. It is half of what makes the mash bot lose. Alt: no sun (then the level needs another source of attrition).
2. **THE FORT'S POWDER + THE MURDER HOLES** (added to meet the mash bar). Rec: keep. A swing at everything blasts you, and a look turns the same keg into
   a weapon; the holes teach "ring first". Alt: fewer post kegs (the mash pyro sits at 33%, close to the 40% line).
3. **THE PYRO WINS 8/8** (knight 3/8, warden 3/8; overall 58%). Rec: keep, and let your playtest decide. This is the same spread as the Glass Sea: she
   jumps the lash and walks out of the marks. Alt: a P3 move that reaches range.
4. **THE WHIP LASH is !! (unblockable, jump it)**; the brief said a shield takes it. Rec: keep. It was the knight's free pass: with a blockable lash he
   won 4/4.
5. **P2 opens with her guard down** off every gong still hanging. Rec: keep. Without it, a bot that cuts the ropes first never meets her guard.
6. **HAWK SCOUTS die to two blows** (hers is unkillable). Rec: keep.
7. **CUT = ATTACK at a gong, RING = E.** Rec: keep.
8. **FLASH FLASKS only**: the concept's oil flasks are not built (fire would be a second system). Rec: keep.
9. **THE GREAT GONG cannot be cut** (it hangs on a chain), so the gate can never soft-lock. Rec: keep.
10. **Music**: pick one of the three above (rec "Desert Loop", CC0). Her theme stays composed in code until you pick one.
11. **THE BURIED CITY**: the Ksar is the main road's next level after the Glass Sea. The Buried City needs `'ksar'` when it is built. Rec: yes.
