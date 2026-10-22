# claude/chief3 (opus): THE CHIEFTAIN USES THE CAMP'S TWO VERBS (the horn, the powder), and the barrel becomes a level verb

Brief: scratch/brief-playtest-1021b.md item 3. Daniel, 10-21: "The horn kind of looks cool... but we don't utilize it at all for the boss. In order to utilize the barrels that explode, I suspect there's more we can do there."
Base: master 5586a595 (BATCH110). Branch claude/chief3. Not merged, not deployed. Level id `stockade`. I didn't depend on any Fen Road code.

## 1. The fight (THE GOBLIN CHIEFTAIN, act I, Stockade)
He keeps his kit: the club, sword-and-shield and bow stances, rack swaps, the leap and stomp, and the war tower at his second wind. Two new told moves come from the level's verbs, and each one opens him when you answer it.
- **HIS WAR HORN** (new; src/stockade-hands.js `HORN`). The first one comes 8 s in, then one every 17 s, or every 14 s after his second wind. He stops and winds the camp's great horn. A draw bar fills over him (gold, then red, for 3.0 s, or 2.5 s at his second wind), with **two pips** under it. Each blow that lands on him fills a pip. While he winds he has no shield, because the horn takes both hands. **Two blows SILENCE it.** He chokes on it and is OPEN for 2.6 s: his `planted` read, the gold outline, x2 damage, the quarter cap. That's the level's horn rule ("silence him before it sounds") becoming his opening. If it sounds, **his crew** (two sprigs, at most two alive) come in at the hall's doors, just past the fire strips. If you blow **your own captured horn** while he winds his, nobody comes: "HORN ANSWERS HORN". That only cancels the call. Only blows open him.
  Up his war tower he winds it **once from the deck** (3.2 s). **Cut a lashing while he does** and the lurch knocks it from his lips: "HE DROPS THE HORN".
- **HIS POWDER** (new; `KEG`). In his club stance, at range (> 80 px), he heaves a **powder keg**. The tell lasts 0.8 s: a red `!!`, the keg over his head with its fuse lit, and the "POWDER: STRIKE IT BACK" line. The keg lands lit. **Its fuse is drawn** as a bar that runs down white, then gold, then red, and flickers at the end, with sparks. The fuse is 2.7 s from the throw, about 1.8 s once it lands. You can step off it, or **STRIKE IT**: it rolls away from you at 200 px/s and keeps at least 0.9 s of fuse.
  - A blast that catches him on the ground **knocks him down: BLASTED**, open for 2.4 s (planted, x2).
  - Up the tower every third deck shot is a keg. A blast **within 56 px of the tower's legs takes BOTH lashings**: the tower falls and he is in the wreck, open. A blast at one peg takes that lashing.
  - Kegs chain with each other and with the level's barrels. A blast hurts you (DMG.bomb), unblockable, as every barrel's does.
- **Kept:** CUT ITS LASHINGS (the log piles' verb) still brings the tower down. The rafters blower's sapper wave at his second wind is also kept, and stockade-horns still pins it.
- **Told attacks** (B17 counts them; act I is exempt but the brief asked for 4+): club overhead slam, sweep, grab/lunge, whirl; sword slash combo, shield bash; bow aim, volley; leap and stomp; **war horn**; **powder keg**; deck arrows, volley, deck keg, deck horn. Every new one has a word, a sound and a colour, and the horn has a drawn bar.
- **B15:** 0.4 outside openings is unchanged, and 0.5 up the tower. Openings are planted (slam, parry, dizzy, wreck, **silenced**, **blasted**) at x2, with the quarter cap.
- **NEW CAP** (`CAP`, applied after every multiplier): one blow can take at most 12% of him, and one opening at most 25%. On master a broken pyro's finisher fireball into a planted window landed **188 dmg** (59% of him) in one hit. Pyro fights took **5 s** (the outlier the stockade2 lane reported). The cap only applies to the Chieftain.
- **HP 320 -> 390.**
- **Bestiary** and the hall door sign ("SILENCE HIS HORN. STRIKE HIS POWDER BACK. CUT HIS TOWER DOWN.") are updated.

## 2. The barrel as a level verb (teach -> test -> remix -> exam)
The barrel prop already existed: strike it and it rolls with a 1.6 s fuse, blows, shatters stakes, chains, and comes back 6 s later.
- **TOLD FUSE, game-wide on `barrel` props** (only the Stockade has them): a lit barrel draws its fuse as a running bar (src/main.js prop draw).
- **TEACH** (the palisade gate, final col 134): a new sign by the first barrel, "POWDER: STRIKE A BARREL AND IT ROLLS, LIT. STAKES SHATTER." The crank is still the other way through.
- **TEST:** the yard's barrel into the inner gate and the kennels' pair beside the crank gate (a chain). Unchanged.
- **REMIX - THE LOOKOUT ON STAKES** (the kennels, final 283-292). The horn tower there (the "combine" blower with the hound pack) now stands on **PALISADE stilts**, with a barrel at its foot (284) and a sign: "THE LOOKOUT STANDS ON STAKES. STAKES SHATTER." Strike the barrel and step back. The blast takes the stilts and **the whole lookout comes down**: the deck, the ledges up it, the towertop, and the blower, who is silenced. Fire on the stilts does the same. Box and stilts are in `L.stockade.lookouts`, computed from the blower's own final column so they don't drift when sections grow in (src/stockade-hands.js stepLooks).
- **EXAM - THE POWDER STORE** (the plateau before the hall's lift, final 556-564). Three barrels: one at the walk's end (556) and the store (561-562). The two guards (a sprig and a shield) sit by it like the cook-fire crew. Strike the first barrel and it rolls in among them, and the store goes up with it. Otherwise it's a fight. The hall shrine (575) comes after it.
- The horn's teach and exam are unchanged (stockade2 and stockade-horns are green).

## 3. Numbers
**Chieftain**, tools/boss-rates.mjs, campaign L3, practiced, profile human (with the kit's flasks), final hp 390:
- **WITH FLASKS, n=24 per hero: knight 17/24, warden 19/24, pyro 9/24 = 63%, in band.** An n=12 run earlier at 390 hp is not separate. Hp steps: 320 = 83% (n=4, pyro 5 s kills before the cap); 400 = 61%; 370 = 72%; 380 = 78%; 390 = 63% (n=24). Across 370-400 the bot's noise is wider than the hp step.
- **DRY (human+dry), n=12:** 8/12, 10/12, 3/12 = 58%.
- **Other heroes, n=6** (practiced, human): paladin 6/6, pirate 1/6, reaper 1/6, geomancer 4/6, berserker 6/6, ranger 3/6. Re-measured at **n=12**: reaper 6/12, **pirate 2/12** (below 2/6).
  - The pirate is weak on master too. A throwaway master 5586a595 worktree (320 hp) gave **pirate 1/6, knight 2/6** (n=6). The pirate's deaths come from his melee (leap, slam, slash) and the phase-two fire strips, not the new moves. See Q4.
- **Fight length:** wins average **62.6 s** (39-93 s). Master's average was 45-75 s. B6 asks ~90 s; Daniel accepted ~60 s for act I (10-19).
- **Per fight** (n=72): 2.4 horns, 1.1 silenced, 1.2 sounded, 3.0 kegs, 0.4-0.6 struck back by the bot, 0.1 blasts on him, 0.1 powder-dropped towers.
  - The bot is a cautious keg user (it kicks only with fuse to spare, and up the tower aims at the legs). A player will use the powder more.
  - The tower: 17-27 of 72 fights end in the wreck (down:2). In most others he climbs down at the 40 s safety. The probe shows the bot stuck on the dais between the two pegs; the stockade2 lane's hands are unchanged here.
- **Mash bot** (re-stamped level THEN boss): LEVEL k/w/p all die (29 deaths each) = it does not clear. **BOSS 0/6**, boss left 90-98%. Master's mash row never woke him (0 of 5810 blows); the horn now brings him to it.
- **Walker** (tools/level-walk.mjs, campaign L3, 1 seed): **all 9 heroes reach the Chieftain.**

| hero | end | deaths | notes |
|---|---|---|---|
| knight | boss | 1 | THE FIRE@211 (the yard brazier) |
| warden | boss | 0 | STUCK 311,19 (the kennel crank gate; resumes). Master had warden STUCK 293 at the kennel |
| pyro | boss | 2 | sapper 340 (tunnel) |
| paladin | boss | 2 | pikemen 278/281; the first walk hit a 30-min page timeout under load, and the re-run is clean |
| pirate | boss | 0 | STUCK 290 (the lookout climb) and 492 (gate crew); resumes |
| reaper | boss | 0 | - |
| geomancer | boss | 1 | trap 351 |
| berserker | boss | 1 | sapper 340 |
| ranger | boss | 1 | trap 353 |

## 4. Checks
GREEN:
- **tools/chief3.mjs** (new, registered in tools/check.mjs). Static: the barrel teach sign, the lookout on PALISADE with its barrel and blower, the store of three plus two guards, the hall sign, HORN/KEG sanity. Page: the horn wound -> two blows -> planted at x1.7; sounded -> 2 crew; answered -> 0 crew; crew gone when he falls; keg told -> thrown -> lands lit -> struck rolls away; blast -> BLASTED; deck horn dropped by a cut lashing; a blast at the tower's legs -> both lashings and the wreck; a blast at the lookout's stakes -> lookout and blower down.
- **stockade2:** its phase-two drive now sets his hp to 51% and lands a blow, because one blow is capped at 12% (same assertions).
- **stockade-horns:** its chief half() sets his hp the same way; the Hornet Queen path is unchanged.
- level-quality: STOCKADE **CLEARS THE BAR** after re-stamping the pilot (122-127% hp a run, 1-2 deaths in 3), curve and mash.
- solid-islands, signs (998 signs fit on 2 lines, grounded), hint-shown (none new), **tells** (438 tells, every mark agrees), boss-read, curve-gate, **textfit --strict hints, bestiary, boss: 0 issues** (2220 screens).

RED (not mine):
- mash-gate: 1 FAIL on **oreroad** (its level hash changed since its mash row). Stockade's rows are fresh.

textfit's talk scope (where the signs are drawn) timed out at 480 s on a loaded PC (talk[pyro] 1/4, another lane's suite was running). tools/signs.mjs is green for the two new signs and the edited one.
Not run: the full suite (that's the coordinator's nightly), mobile-perf, and boss-greed's page half.

## 5. ART NOTES (all new pieces are GREYBOX)
1. **THE WAR HORN:** his own wind pose (B16). Today it is his deck-wait frame 21 with a pale horn drawn at his lips. Wanted: a great horn on a strap, cheeks puffed, and a choke/drop pose for SILENCED. Draw it bigger than the blowers' ivory horn so it reads as the chief's. The draw bar and the two pips are drawn in stockade-hands drawChief.
2. **THE KEG HEAVE:** today his club raise (frame 2) with the camp barrel drawn over his head, then his reach (frame 5) for the throw. Wanted: a two-handed heave pose, the keg's fuse lit at the top, and a throw frame. The deck keg uses frame 18.
3. **THE POWDER KEG:** today PROP.barrel plus a fuse bar. Wanted: a powder keg skin (iron hoops, a powder mark, a fuse cord that burns down), its roll, and the blast (today the shared explode burst).
4. **BLASTED:** he borrows his planted frame 3. Wanted: knocked flat and smoking.
5. **THE CREW'S ENTRANCE:** sprigs spawn with a dust puff at the doors. Wanted: they run in.
6. **THE LOOKOUT ON STAKES** (kennels 283-292): the stilts are plain PALISADE tiles (stake-wall art). Wanted: lashed stake stilts under the deck, and a collapse (the deck tipping, its stakes splintering) instead of dust puffs.
7. **THE POWDER STORE** (plateau 556-564): three loose barrels. Wanted: a stacked store (kegs on a rack, a tarp, powder sacks) and a bigger chain blast.

## QUESTIONS FOR DANIEL (my recommendation first; what I built)
1. **A silenced horn opens him (two blows in a 3 s wind); a sounded horn brings two sprigs.** Rec: keep. Built. Alt: three blows (I tried it; the reaper's slow scythe almost never landed three, 0-1/6), or a sounded horn buffs him instead of calling crew.
2. **Your captured horn blown while he winds his cancels his crew but doesn't open him.** Rec: keep, because only blows open him and the boss bot doesn't carry a horn, so the rates would read soft. Built. Alt: answering also opens him (an easier fight for every player who took the horn, which is every player).
3. **A keg blast at his tower's legs drops the whole tower; at one peg, that lashing.** Rec: keep. It's the "kick his powder back" payoff and needs the timing. Built. Alt: a blast only ever cuts one lashing.
4. **The pirate is at 2/12 (and 1/6 on master).** His deaths are the Chieftain's melee and the phase-two fire strips, not the horn or the powder. Rec: a pirate pass is a hero-wide question, not this boss. Alt for here: let a pistol shot set off a lit keg where it lies, giving him a powder answer at range (not built).
5. **The Chieftain's damage cap (12% a blow, 25% an opening, after every multiplier)** ends the 5 s pyro kills (one broken-finisher fireball took 59% of him on master). Rec: keep, and look at the finisher x planted x break stack game-wide. Built, for the Chieftain only.
6. **Fights average about 63 s, short of B6's ~90 s.** Rec: accept for act I, as you did on 10-19. More hp drops the knight. Built at 390.
7. **The kennel horn tower is now a lookout on stakes that a barrel brings down** (it was a solid block). Rec: keep. It's the barrel's remix with the horn rule, and you can blow it before he sounds. Built.
