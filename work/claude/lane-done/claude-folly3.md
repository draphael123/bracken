# claude/folly3 — THE FOLLY ARCHMAGE, round 3

Brief: Daniel played the fight (2026-09-29) and says he is too easy. Humans beat him easily, so the bots are not the
measure here. The boss is the Mage's Folly's boss, id `archmage`. The Falling Tower's undead archmage was not touched.
All four decisions are built. Where a decision needed a design call, I built the recommended option; each one is listed
under QUESTIONS.

## What changed (src/main.js, the Archmage's section)

1. **Openings are x3 again.** `ARCH.openMul` goes from 4 back to 3, reverting the change from claude/followups.
   - The "stage 3 keeps its 3.2" note: the 3.2 multiplier belonged to the old familiar stage. No fight ever reached that
     stage, because the rooms ran him down to 0.
   - Stage 3 is now the Archmage himself, so it uses x3 like every other opening. It also keeps the same
     two-blow / 18% cap. The test measures it: a blow landed 10 on him when he was not open and 30 when he was.
   - The familiar's code and art are kept behind a flag that nothing sets (`e.fam`). Every `stage === 3` branch that
     meant the familiar now reads that flag.
2. **New stage 3 at 30%: THE MIRRORS.**
   - Where the stages end (`ARCH.gates`): the duel at 66%, the flood at 54%, the orrery at 42%, and the room turned over
     at 30%. Before, these were 66 / 48 / 24 / 0. Each room is now 12% of his health, and the last 30% is the new
     stage.
   - When the last room ends, the room is put right (plain floor, the right way up) and he stands on his dais with two
     images of him.
   - The images are drawn with his own sprite, and they take the spots he blinks between.
   - When he starts a bolt, a rend or a pair, each image casts with him:
     - it gets a grey `!`/`!!` over its head;
     - it draws a grey circle of its own, 40-64 px from his circle and never on top of it;
     - the circle fizzles harmlessly when his spell lands.
   - Only his tell is coloured: his mark, his circle and the amber rim.
   - The images blink when he does.
   - A blow on an image breaks it with a puff and the words "AN IMAGE". It comes back at his next ward.
   - Apart from the images, the stage plays like the duel, only harder: the ward (with the book stack), the blink, the
     bolt and the rend, and he also pairs his circles as he does in the rooms.
3. **Reseal in 4 s from stage 2 on; the duel stays at 6 s** (the recommended option).
   - Only stages 1 and 3 have a ward, so in practice the 4 s applies to THE MIRRORS.
   - The ghost-rune countdown art scales to whichever length is running.
4. **One APPRENTICE each cycle.**
   - A cycle is one ward. At each ward in the duel and in the mirrors, a portal opens on the floor about 150 px from
     you, on the side with more room and clear of the stack.
   - The portal is told for 1.0 s: a violet slit and the words "A PORTAL OPENS". Then one of the tower's own dead
     apprentices steps out.
   - This is the existing apprentice foe: the ember he throws at whoever stands still, and a grab at close range. He
     throws his first ember 1.2 s after arriving.
   - His health comes off the same line as every other apprentice in the level (67 here, equal to the level's own), so
     no one gets more health.
   - While one of his apprentices is standing, no second one comes. The rooms have no apprentice (a rewritten room has
     no floor for one).
   - Apprentices and open portals are cleared when a room is rewritten and when he dies.
   - The bestiary card, the header comment and the new hints say all of this.

## Numbers, BEFORE / AFTER (tools/folly-pilot.mjs, seed 1, normal health, 240 s cap)

| hero   | before (b7ffda6, x4)                 | after                                  |
|--------|--------------------------------------|----------------------------------------|
| knight | death 46.8 s, he had 66% left, 3 openings | death 59.4 s, he had 47% left, 6 openings, reached the orrery |
| warden | **win 94 s**, 14 openings            | death 49.8 s, he had 61% left, 4 openings |
| pyro   | death 33.9 s, he had 61% left, 2 openings | death 40.4 s, he had 66% left, 3 openings |

- Wins went from 1/3 to 0/3, as expected. I did not tune anything down.
- No bot reached THE MIRRORS, so the pilot says nothing about stage 3.

## Checks

- **archmage-folly**, extended. It was red on the base (13 new fails, run before any src change) and is green now. It
  asserts:
  - x3 openings, in the duel and in the mirrors;
  - a 6 s reseal in the duel and 4 s in the mirrors;
  - stage 3 at 30%: still stage 2 at 33%;
  - the room put right and two images;
  - the images' marks and circles are grey while his are coloured;
  - the images' spells are harmless and his lands;
  - a blow breaks an image, and it is back at the next ward;
  - a told portal (1.0 s) and one apprentice per ward, never a second while one stands, the next one after a kill, and
    never more than 1 at once over the whole run;
  - the apprentice has the same health as the level's own apprentices.
- The 7 required checks are green: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace
  (unchanged, no rebase), npc-removal.
- Also green: tells, answer-tags, boss-openings, zoom-coverage, folly-runtime, archmage-room, courtyard, spawns,
  small-adds, attack-tokens, foe-tactics, one-new-foe.
- **folly-runtime** needed a fixture change. `tools/fixtures/folly-browser.js` threw "familiar replaced wizard" on
  `e.stage===3`. It now checks `e.fam`. The intent is the same (the wizard, not the familiar, must be the one who dies);
  only the flag that means "familiar" changed. The fixture still kills the wizard through every stage, and the check
  passes.
- **untold-told** is flaky on the crow (a known flake that happens on master too). Over 5 runs it failed 3 times and
  passed 2; every failure was `crow: ... untold hit` and nothing else.
- origin/master was merged (only tools/gallery-runtime.mjs had moved). There were no conflicts.

## UNVERIFIED

- No human has played THE MIRRORS, and no bot reached it. What I know about stage 3 comes from the scripted test and
  one screenshot. The screenshot shows two images with grey `!` marks, the grey circles, his yellow circle and the
  portal.
- The images are identical to him. The only ways to tell them apart are the coloured tell, the runes round him and the
  green open ring. That may be harder, or easier, than intended.
- Only `attackBox` blows break an image. A thrown weapon or a skill projectile does not.
- Called apprentices drop whatever a normal apprentice drops, so a player who stalls could farm about one per ward.
- The portal and the image puffs are drawn in code. There is no baked art for them.

## QUESTIONS FOR DANIEL (the recommended option is the one built)

1. **The rooms are 12% each (66/54/42/30) so the mirrors can be the last 30%.** Before, the rooms were 18/24/24%.
   Recommend keeping it. The alternative is to keep the old room sizes and bring the mirrors in partway through the
   orrery, which would be messy.
2. **The images' spells are harmless (built), not weak.** A weak hit would need its own mark and answer row, and would
   blur the "grey is not him" rule. Recommend harmless.
3. **The reseal is 4 s in stages 2-3 (built; since only stages 1 and 3 ward, this means the mirrors), 6 s in the duel.**
   The other option is 4 s for the whole fight.
4. **One apprentice per ward in the duel AND the mirrors (built), none in the rooms.** Recommend keeping it. Other
   options: mirrors only (easier), or also one per room (awkward in the flood and on the ceiling).
5. **The add is the tower's existing dead apprentice.** It is not a new foe type: it already throws at whoever stands
   still, and it reuses its art and its marks. Recommend keeping it. A new, living apprentice would need art.
6. **The images look exactly like him.** Recommend playing it as built. If reading him proves too hard, dim the images
   slightly (alpha 0.85).
