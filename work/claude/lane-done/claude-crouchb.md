# claude/crouchb - PER-HERO CROUCH TWISTS, PART B: PALADIN, GEOMANCER, DEATH KNIGHT

Base: claude/batch48 5b0ec84 (master + ember-ward + archfix + gqueen2 + towerscroll + sextonpit). Opus lane. Design: Daniel's CROUCH
PLAN (all 7 approved); this lane builds three of them. The Knight, the Warden and the Freebooter are claude/croucha's.

## What changed
One module for the three, **src/crouch-b.js** (they share their shape: each is the universal duck from src/duck.js plus something
more while the hero stays down, and each leaves him exposed). main.js only binds it and calls it (7 small hooks: the import, the call
right after `P.ducking` is set in updatePlayer, the pose pick, the draw after the hero, the respawn clear, the binding beside the ember
ward's, and `BK.crouchB()` for the tools). Every one of them keeps the plain duck: the hurt box is DUCK_H, a HIGH blow goes over him,
he has NO GUARD while down (the duck already needs the guard down), a LOW blow finds him, and the hit stands him up and breaks it off.

- **PALADIN - KNEEL IN PRAYER.** Down and still for 0.3 s (KNEEL.settle, so a duck under an arrow is not a prayer), then his LIGHT
  fills **25 a second: empty to full in 4 s** (of the world's clock - see QUESTIONS 1). A soft gold half-glow round him and a pool of
  light on the ground, gold motes rising, and a chant (a low sung fifth on a 0.9 s beat, rising a little as the bar fills, a small bell
  over it past half). Full, it says READY as a full bar always has. The fill is his own (not gainLight's variety/radiance: a prayer is
  not a blow).
- **GEOMANCER - EARTH SENSE.** Down for 0.12 s, and a ripple goes out through the ground; every hidden common foe and every unbroken
  breakable wall **within 96 px (six tiles)** is outlined in amber with its corners picked out, pulsing, **for as long as she stays down
  and 1.5 s after** (fading in its last half second). "Hidden" is: the buried dead and husks under the dirt, the sand goblin and the
  sand-cloak under their mounds, the mimic shut, the pumpkin/feeler/lurker tucked away, the chimney sweep gone up his flue, the assassin
  in his shadow, the gar under the water. A creature that comes up drops off the list (it is plain to see). Bosses keep their own
  tells. A new find sounds a sounding (a deep knock and a ring coming back) and a one-pixel shake. **No damage, no waking** (checked).
- **DEATH KNIGHT - BLOOD HARVEST.** Down over a body **while it lies** (the bodies his kills already leave, main.js leaveBody: they lie
  24 s, fading in the last 3; nothing else used them since RAISE DEAD went). Within 14 px of it, at his feet. **0.6 s** of drawing
  (red motes running from the body into him, a red ring filling round it, a wet pull), then **+7 health and +12 BLOOD** (his harvest
  bar; a kill gives 7, a marked kill 16), a gulp with a heartbeat under it, and the body is spent (it fades). **Once a body.** A draw
  broken off part way (stood up, or hit) pays nothing and starts again. A flyer's body left in the air cannot be reached.
- **Art** (src/chars.js, the house knightFrame rig, two frames each): `kneel` - down on one knee (the Warden's kneel legs), maul planted
  upright before him in both hands, helm bowed, the light gathering at its head (brighter with a mote on the second beat, and held
  there once full); `sense` - on one knee, head bowed, lead palm flat on the ground, staff upright behind her in the off hand, amber at
  her fingers and a ripple out either side on the second beat; `harvest` - on one knee over the body, the greatsword let down to lie on the
  ground behind him, the sword hand reaching down into the body, blood rising into the palm.
- **Sound** (src/audio.js, synth only): kneelChant, earthListen, earthSense, bloodDraw, bloodHarvest.
- **Teach** (twice a save, once a level, PROG.kneelTold / senseTold / harvestTold): the paladin, the first time his light is under 50
  and nothing is within 200 px for 1.5 s - "KNEEL: HOLD DOWN AND STAY STILL, AND YOUR LIGHT FILLS. NO GUARD WHILE YOU PRAY."; the
  geomancer, the first time something hidden or a breakable wall is within ten tiles - "EARTH SENSE: HOLD DOWN, AND WHAT HIDES IN THE
  GROUND NEAR YOU SHOWS ITSELF."; the death knight, the first time a body lies near him - "BLOOD HARVEST: CROUCH OVER A BODY. IT GIVES
  UP HEALTH AND BLOOD, ONCE."
- **Tells: no new mark.** None of the three answers a blow, so no mark means anything new.
- **The bot** (src/lab.js crouchBPlan / crouchCalm / crouchBKeys): only when CALM - no foe that can hurt him within 130 px on his level,
  none telling within 220 px, nothing thrown within 140 px, feet on dry ground. The paladin kneels while his light is under 50 (once
  down, until it is full); the geomancer takes a 0.5 s look when she has not looked for 8 s (in the labs, a calm moment on coming into a
  room or after a fight is where a section starts); the death knight walks to a body within 64 px (health or blood not full) and draws
  it. Wired into the common-foe frame (fightLab/ambushLab), the ambush room's between-waves walk and the generic boss frame. The duck and
  the ember ward plans are untouched and come first.
- **Other heroes unchanged**, the ember ward unchanged (checked: the knight, the warden and the pyromancer run none of it, still duck;
  ember-ward green).

## Checks
**crouch-b** (new; red on the base: it cannot import src/crouch-b.js there) proves: the paladin does not pray before 0.3 s, fills 25.0
a second, is full by 4.3 s, not while standing or walking with down, is drawn `kneel`, is the duck (box 8, the armour's high swing goes
over), is exposed (a topiary's low swipe lands while he prays, the hit breaks the prayer, no guard came up); the geomancer shows a buried
dead man 5.5 tiles off and a breakable wall 4 off, not a buried dead man 9 off, nothing while she stands, does not wake or hurt what it
found, keeps it 1.5 s after and not 2.5 s after, is drawn `sense`, is the duck; the death knight gets nothing at 0.5 s and exactly +7 / +12
by 0.75 s, once (a minute more over the spent body gives nothing), not from a body two tiles off, nothing from a draw broken off at 0.4 s,
the draw again when kept down, is drawn `harvest`, no ward up, is the duck and exposed; the bot: calm with light 10 the paladin kneels to
full, with a topiary three tiles off he does not; calm, the geomancer looks; the death knight walks 46 px to a body and draws it; the
knight, warden and pyromancer run none of it and still duck.

All run by name, all green: **crouch-b**, duck, ember-ward, tells, answer-tags, untold-told, combat-feel, juice, ability-poses,
comments, homepaths, and the 7 REQUIRED: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (every level
identical: no level changed), npc-removal. juice and crouch-b failed once with "the fresh lab page did not initialize" while an art
capture ran beside them (load); both green alone. crouch-b, juice, ability-poses, skins, architecture, tells, answer-tags, comments and
homepaths were run again after merging origin/master (= 5b0ec84) and origin/claude/batch48 (9e97b8a; check.mjs conflict: kept batch48's
list, which drops queen-pillars, plus crouch-b).

## Pilots (1 pinned seed per hero, tools/crouchb-pilot.mjs; BEFORE = the base 5b0ec84 in a separate worktree, AFTER = this branch)
Queen's Lance: bossLab, Stormhold, refill health, 150 s cap, salt duck-1 (the duck pilot's settings). Burial Caverns: THE CHARNEL
HOUSE ambush room (ambushLab, health put back each frame, Math.random pinned to 2024).

| hero | fight | BEFORE | AFTER | the crouch in it |
|---|---|---|---|---|
| paladin | Queen's Lance | win 109.7 s, taken 257 (141/min) | win 80.6 s, taken 137 (102/min) | knelt 2.1 s, +52 light |
| paladin | Charnel House | 46.2 s, taken 189 | 38.6 s, taken 150 | never calm enough |
| geomancer | Queen's Lance | win 52.2 s, taken 201 (231/min) | win 50.9 s, taken 126 (148/min) | one look |
| geomancer | Charnel House | 31.9 s, taken 152 | 32.3 s, taken 143 | none counted |
| death knight | Queen's Lance | win 75.9 s, taken 76 (60/min) | win 75.9 s, taken 76 (60/min) | never calm with a body near |
| death knight | Charnel House | 46.9 s, taken 293 | 46.9 s, taken 293 | never calm with a body near |

None is worse on damage taken; the geomancer's Charnel House ran 0.4 s longer (1%) while taking 6% less - single-seed drift (the bot
pauses on calm frames, which moves every roll after). Where the numbers moved without a counted crouch (the paladin's room, the
geomancer's room), it is that drift, not the twist: one seed swings a lot. The death knight's runs are identical: the ambush room and
the Lance are never calm with a body at his feet, so the bot never harvests there (the check proves the bot does harvest when calm).

## UNVERIFIED
- Not played by hand. The art was looked at in one still capture per pose (not in motion); the death knight's harvest frame was
  re-posed once from it (the greatsword's guard covered his helm; it lies on the ground behind him now).
- The pilots cannot show the harvest or the sense paying off (nothing buried near the Charnel House fight, no calm with a body); the
  check is the proof of those, not the pilots.
- Co-op: the state lives on the hero (P.kneelT, P.senseT, P.harvT), a second hero carries his own; the sense's reveal list is the
  level's and drawn once per hero pass. Not exercised with two heroes.
- The level-walking playtest bot (src/playtest.js) was not taught the crouches; only the fight/ambush/boss labs.

## QUESTIONS FOR DANIEL (built: the recommendation)
1. **Which clock is "4 s"?** Built: 25 light a second of the WORLD's clock (as every tuning number in the game is - the ember ward's
   too). At the default game speed (0.6) that is 6.7 s of your time on his knees, and the harvest's 0.6 s is 1 s. Rec: keep (it is
   "slower than any fight allows", and it scales with the speed setting like everything else). Alt: 40 a second, 4 s real at 0.6.
2. **Sense radius vs the buried dead.** Built: six tiles (96 px), as recommended. But a buried dead man rises when you come within 85 px,
   so against him the sense only shows him in an 11 px band before he would have risen anyway (the sand goblin wakes at 56, the lurker
   at 56: those get a real warning). Rec: widen to 8 tiles (128 px) so it reads the dead too. Alt: keep six.
3. **Death knight: which bodies.** Built: any body his kills leave, while it lies (24 s). Alt: only within ~1 s of the death. Rec: while
   it lies - the bodies were already there and drawn (a dark shape with a green light), and nothing else used them since RAISE DEAD went.
4. **Harvest amounts.** Built: +7 health, +12 blood, 0.6 s, once a body. Rec: keep. (+12 blood is a little more than a kill's 7 - the
   price is 0.6 s crouched and bare.)
5. **Does a hit break the prayer / the draw?** Built: yes (the duck already stands him up when he is struck, and both start again).
   Rec: keep - it is what "exposed" means.
6. **Breakable walls in the game today** are only THE ORE ROAD's ore walls (already cracked and told); the sense is ready for the
   'secret' kind (src/breakable-walls.js) when a level uses one. Rec: a secret wall in a later level lane is where this shines.
7. **Paladin's kneel and JUDGEMENT.** Four calm seconds buys a full bar, so he can open every room with JUDGEMENT. Rec: keep (you
   approved the rate); if it is too generous, cap the prayer at 50 (MEND) and leave the top half to fighting.
