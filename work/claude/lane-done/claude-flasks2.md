# claude/flasks2 - FLASKS 2 (Opus lane, Daniel 2026-10-08 top ask)

Branch `claude/flasks2` = origin/master (batch80 36c83412) + **origin/claude/hudslim merged (d196011a, which carries fontpair)** + the flask work.
Why the hudslim merge: HUD-SLIM moved every HUD row (HP y6, stamina y14, hero meter y31) and left the flask row slot at y 20-28; building the
row on master's old layout would have meant the same row shift twice and a guaranteed conflict. Merge order for integration:
fontpair -> hudslim -> flasks2 (flasks2 is a fast-forward over hudslim step 1; later hudslim commits merge on top).

## What shipped
1. **THE FLASK ROW** (src/main.js HUD, layout in src/flasks2.js `rowLayout`): its own row directly under health+stamina (y 19-30), x 2..~53;
   the skill slots sit at x >= 69, y 3-21 - never over it. A bottle a flask: full red / drunk = an empty glass / OVER the max (broken shrine) GOLD,
   then the count as a number (TYPE.label, outline in MINIMAL). A strip behind it in the MINIMAL HUD (hudStrip), on the plate in the FULL HUD.
   Always drawn (also when the MINIMAL HUD idles). FLASHES when flasks come back (shrine, death, buy, break), SHAKES RED when one is spilled.
   The venom strip moved to sit after the row's real end. BK.flaskRow()/BK.skillSlots() expose the rects.
2. **THE DRINK** (main.js tryDrink/drinkTick/spillFlask/drawFlaskDrink): he stops dead (vx 0 every tick), UNCORKS (cork pops and flies,
   SFX.cork), the flask goes to HIS mouth (per-hero mouth table F2.MOUTH, all 7) and TIPS BACK, TWO GULPS (SFX.glug x2), the heal at the
   swallow with a GREEN glow rising off him + green motes/ring. A blow before the swallow KNOCKS THE FLASK AWAY (it flies spinning the way the
   blow threw him and breaks in a red splash, SFX.splash), 'SPILLED', the HUD row shakes red. Timing unchanged: 0.75 s, swallow 0.5 s
   (QUICK DRAUGHT: 0.5 s, swallow 0.33 s).
3. **THE STORE'S FLASKS TAB** (new tab after SMITH; store.js TABS + STORE_TABS; tabs now two rows of five). Locked lines say why; hidden
   lines are '???' (name and text) until found; a find puts the line on sale (gold), it does not give it.
4. **OBJECTIVES**: a level cleared with no flask drunk in it (deaths don't reset the count) -> QUICK DRAUGHT; 5 shrines broken (PROG.shrinesBroken)
   -> SHRINE BLESSING. God Mode / Unlock All (assist) earn neither (and don't count shrines). Told by toast.
5. **HIDDEN FINDS** placed at load from src/flasks2.js FINDS (no level ents added -> NO level hash changed, no re-stamp): FLASK SHARD in the
   Undercrown (128,115, on the planks by its deepest silver), BOTTLED SUNLIGHT in the Glass Sea's silver vault (593,18, beside the silver),
   STEADY HAND (a drinker's glove) in the Harvest Fair's second secret cellar (334,34). Gold glint, bobbing; picked up once a save.
6. **SAVES**: PROG.flaskItems / flaskFinds / flaskObj / shrinesBroken. Old saves: flaskUp 1/2 (the old EXTRA FLASK line) -> EXTRA FLASK I/II
   owned regardless of what is beaten - no flask lost, no refund needed; flaskUp stays the count (survival.js flaskMax reads it; extraMax 3).
   The old RICH FLASK is the level-up card's minor perk (progression.js 'tonic') - kept as is, +10 on top of the store tier.
7. **THE CAMPAIGN KIT** (src/campaign-kit.js flaskKitAt / flaskUpAt / flasksAt, rule in src/flasks2.js typicalFlaskKit) + **tools/boss-run.mjs /
   boss-rates.mjs `--flasks=kit|bare`** (default kit; or BOSS_FLASKS=bare). Before this lane the boss runner carried NO kit flasks at all: every
   boss row was measured with a fresh page's 1 flask at 35% (the practiced card has no RICH FLASK pick).

## THE STORE TABLE
| group | line | price | unlock | effect |
|---|---|---|---|---|
| COUNT | EXTRA FLASK I (id 'tonic') | 150 | from the start | +1 flask (2) |
| COUNT | EXTRA FLASK II | 300 | beat THE GOBLIN QUEEN (Highcrown cleared) | +1 flask (3) |
| COUNT | EXTRA FLASK III | 450 | HIDDEN: the FLASK SHARD (Undercrown) | +1 flask (4) |
| POTENCY | RICH DRAUGHT | 200 | beat THE STOCKADE (Chieftain) | heal 40% (base 35) |
| POTENCY | DISTILLED DRAUGHT | 400 | beat THE UNDERWATER KEEP (Drowned King) | heal 45% |
| POTENCY | BOTTLED SUNLIGHT | 500 | HIDDEN: the Glass Sea silver vault | heal 50% |
| PERKS | QUICK DRAUGHT | 250 | OBJECTIVE: clear any level without drinking | drink 0.5 s (was 0.75) |
| PERKS | STEADY HAND | 300 | HIDDEN: Harvest Fair cellar | a blow stops the drink, the flask is kept |
| PERKS | SHRINE BLESSING | 250 | OBJECTIVE: break 5 shrines | a shrine gives back 2 |
Best potency owned counts; the card's RICH FLASK adds +10 (max 60%). Max flasks 4 (+ a broken shrine's over-max).

## THE CAMPAIGN KIT (typical flask build; B6 tunes bosses WITH this)
- EXTRA FLASK I from depth 3; EXTRA FLASK II once crown is beaten -> 1 flask to depth 2 (Chieftain), 2 to Highcrown, 3 after.
- RICH DRAUGHT once stockade is beaten (40%), DISTILLED once keep is beaten (45%); + the card's +10 where the card has it (typical L5 pick).
- QUICK DRAUGHT from act II; SHRINE BLESSING from act III. Hidden lines never typical.
- Examples: kings {I, rich} 2x40%; crown {I, rich, quick} 2x40% quick; keep {I, II, rich, quick, blessing} 3x40%; mage/redgorge/glasssea 3x45% quick.

## BOSS BEFORE / AFTER (practiced, profile human, campaign level, knight/warden/pyro x3 seeds)
3 seeds a hero (n=9 a row: small; read as direction, not a stamp). 'bare' = what every boss row was measured with until now (1 flask, 35%).
| act | boss (row) | L | bare kit | before (bare) kn/wa/py | after (kit) kit flasks | after kn/wa/py |
|---|---|---|---|---|---|---|
| I | Kingswood (kings) | 5 | 1x35% | 3/3 2/3 3/3 = 89% | 2x40% | 3/3 3/3 3/3 = 100% |
| II | The Goblin Queen (crown) | 14 | 1x35% | 3/3 3/3 3/3 = 100% | 2x40% quick | 3/3 3/3 3/3 = 100% |
| III | The Drowned King (keep) | 21 | 1x35% | 2/3 3/3 3/3 = 89% | 3x40% quick | 2/3 3/3 3/3 = 89% |
| IV | The Mage's Folly (mage) | 30 | 1x35% | 0/3 3/3 2/3 = 56% (knight 0) | 3x45% quick | 0/3 3/3 3/3 = 67% (knight 0) |
| V | The Red Gorge (redgorge) | 35 | 1x35% | 3/3 1/3 3/3 = 78% | 3x45% quick | 3/3 3/3 3/3 = 100% |
Read: the kit moves rates UP (warden on kings/redgorge, pyro on mage); four of five representative bosses already sit above the 60-70% band
even BARE at n=3, so the per-act FLASK RETUNE lanes should re-measure with --flasks=kit (the default now) at 6+ seeds. Not retuned here (per brief).
Raw: work/claude/flasks2/boss-{bare,kit}.{log,json} (rows carry flasks0/heal0 - the kit was applied: 2/2/3/3/3 flasks, 40/40/40/45/45%).

## Checks
- tools/flasks2.mjs (new) GREEN: rules, migration, kit along the road, finds reachable (BFS to a silver/START), the row clear of the slots on
  5 screens (16:9, 4:3, ultrawide, phone landscape + portrait with the touch buttons on) x both HUD modes, counts/buy/over-max, drink timing
  (swallow 30 f, quick 20 f), spill + flying flask + red shake, steady hand, unlocks/??? in the store, dry clear, God Mode guard, 5 shrines,
  blessing, Glass Sea find, old save.
- survival, store (golden stock rewritten with STORE_WRITE: +FLASKS tab, deliberate), leveling, hint-shown, level-jump, textfit (1 page:
  0 new; remaining OVERFLOW/COVERS/COLLIDE are pre-existing welltown/underwell/marsh/fallingtower/fair lines) - all exit 0.
- Test edits (design changes, not weakened): survival flaskMax max 3 -> 4; leveling 'sinks' reads the FLASKS tab's three count lines;
  store buys EXTRA FLASK I on 'flasks' and its tab regex reads camelCase owned keys; level-jump wants flasksAt(id, d, beaten).

## REDS
- None in the checks run. Boss rows above band (see table) are a tuning signal for the retune lanes, not a red of this lane.
- Not run here (40-min suite, low-memory PC): the full suite, level pilots/mash (no level hash changed: the finds are placed at load).
- The mage knight 0/3 is the same bare and kit (a hero-specific gap, not flasks).
- Depends on claude/hudslim (merged in): if hudslim is dropped, the flask row must be re-slotted into master's old HUD layout.

## QUESTIONS FOR DANIEL (built the rec in each case)
1. Potency tiers 40/45/50 + the card's RICH FLASK +10 (so up to 60%). Rec: keep the card perk (built). Alt: fold the card perk into the store.
2. Typical kit timing (EXTRA I from depth 3, QUICK from act II). Rec: as built; the per-act retune lanes tune with it.
3. Hidden find spots: Undercrown planks by the deep silver / Glass Sea vault / Fair cellar 2. Rec: as built (no level hash moved).
4. A find unlocks the line for gold rather than giving it. Rec: as built.

## ART FOLLOW-UPS (Sonnet lane)
- Real drinking frames per hero (7): uncork at the chest, head tipped back with two gulp frames, lower. Today: the existing pose + an overlay
  flask placed at F2.MOUTH[hero] and rotated; tune MOUTH offsets per hero against the frames.
- Bottle icons: PROP.hudFlask / hudFlaskEmpty / hudFlaskGold (5x6 grids in main.js), and the store's PROP.flaskIcons (rich, distilled,
  sunlight, quick, steady, blessing, hidden '?').
- The finds' world sprites (shard, sunlight bottle, glove) - today the gold flask / sunlight / glove icons with a glow.
- A spill splash sprite (today: red/white particles) and a cork sprite.
