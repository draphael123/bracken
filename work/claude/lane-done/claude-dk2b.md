# claude/dk2b - THE DEATH KNIGHT 2: BLOOD PRICE + DRAIN, and his boss (OPUS kit + boss, 2026-10-15)

Brief: scratch/brief-dk2.md (all sections incl. !! 10-13 chapel standards, !! 10-14 WoW renames, !! 10-14 LATE grave kneel / lingering dead /
REAPER'S RHYTHM / BLOOD PRICE CLEAVE) + design-standard B5/B10/B11/B15/B16/B17/B18. Base: master c33c3204. Branch claude/dk2b. PORT 8933 only.
**ART IS GREYBOX** (a Sonnet art lane follows - list below). **NO TUNING** (a Sonnet tune lane follows); every new number is a first pick,
in one table each: hero `src/dk2.js DK2`, boss `src/unburied-foes.js UNB.bk` (the block marked claude/dk2b). ART BEFORE LIVE: ships only after its art lane merges.

## THE HERO KIT (src/dk2.js + hooks in src/main.js)
| Move | Input | What it does |
|---|---|---|
| REAPER'S RHYTHM | X (chain) | the swing clock 0.34 -> 0.46 (x1.35): a light swing 0.88 s -> 0.65 s art (0.98 -> 0.76 with recovery). Cut 1 a RISING LOW DIAGONAL (box from the ankle), cut 2 THE HOOK - a reverse sweep along the shins that pulls a small foe a step (12 px) toward him (never a boss/mini/heavy, never through a wall), cut 3 THE DRAG from overhead that DRAINS a sliver (20% of the blow, 1-5 hp) if it lands. Red BLOOD TRAIL along the cut. Every landed cut FEEDS THE BLOOD WARD (+7 P.wardG, never past 75% - a fed ward never breaks itself). |
| BLOOD PRICE CLEAVE | hold X | replaces THE PLANTED BLADE as his heavy. A price the moment the wind starts, then one every 0.5 s: 3% of max hp (95 hp -> 3), FLOORED AT 1 (HE NEVER KILLS HIMSELF; at 1 hp "NO BLOOD LEFT TO PAY" and it grows no more). Max 6 prices; held a beat at the 6th it goes by itself. The blade over his shoulder glows redder and grows (drawPriceBlade). RELEASE = a CRESCENT (box 38 px +3 a price, 42 tall, a little behind him) at x(1 + 0.22 a price) damage; P.heavy (B14 heavy key). Lands -> DRAINS BACK DOUBLE what was paid, once a cleave; finds nothing -> "THE BLOOD IS LOST". |
| THE RED VOLLEY | talent (was THE SECOND VOLLEY, fullCircle) | the planted blade's blood bolts LEFT the heavy (REC, stated): a crescent paid 3+ times that lands looses one plantBlade volley. sunder/longHaft descs updated to the crescent. |
| GRAVE KNEEL | crouch | the universal duck stays (high still goes over) PLUS the greatsword planted point-down in front BLOCKS LOW blows from the front (marks.js HEIGHT 'low' via new duck.js `blowLow`, or a blow handed o.low) for a guard's wind (CM.blockCost); red low = half ("UNDER THE BLADE"); out of wind "THE KNEEL BREAKS" (guard break). Behind, middle, standing: not turned. Drawing a body (crouch-b harvest) he is EXPOSED (blade lies behind him) - keeps crouch-b's rule. Kneel over a body = HARVEST (unchanged, src/crouch-b.js). Own pose `graveKneel`. Distinct from the Ranger's kneeling draw: hers ducks HIGH, his blocks LOW. |
| THE DEAD LINGER | - | only while he is the hero: a body lies 45 s (was 24) with a faint pulsing RED GLOW while it can be harvested/raised; the fallen picture (corpse) is held as long as its body lies, and goes when drawn, raised or gone. Knight's dead unchanged (tools/dk2.mjs + corpses.mjs green). |
| THE PASSING | dodge | unchanged - it already IS the audit's shadow-step + decoy (he goes thin, steps ~85 px, leaves the cold decoy foes swing at; grace 0.26, cost 25). |
| WoW names out | - | DEATH GRIP -> GRAVE CHAIN, BLOOD BOIL -> BLOOD WELL, DEATH COIL -> BLOOD LEECH (names, says, comments, tests; ids kept for saves). |

Hero contract text: HEROES desc, HERO_LOOP, pick lines, tree names updated; his new words are MOVE_WORDS (hint-shown green; BLOOD BOIL's silent line renamed in hint-shown-silent.txt).
L1/L4/L8 vs the Paladin: his L1 (summon skeleton) / L4 (blood well, unholy ground, blood leech) / L8 (grave tide, gravecall, grave chain) are untouched; the audit's overlap ("slow big weapon, hold-C, wave/bolt heavy") is broken by the kit itself - a quick chain, a heavy paid in health with no bolts or wave, the drain loop. (Paladin 2 rebalances his own slots.)

## THE BOSS - THE DEATH KNIGHT ('bloodknight', the Unburied Field arena) - B11 DUELIST (always hittable, guards by the ward's face)
Confirmed: the live fight is **'bloodknight' only** (THE DEATH KNIGHT, updateBloodKnight). 'deathknight' THE REAPER is benched (placed in no level, tools/unburied.mjs asserts it) - untouched except the WoW renames in its says.
- REAPER'S RHYTHM string: the 2nd cut of a full chain HOOKS you 14 px toward him (not if guarded); the last cut is THE DRAG (the old cleave's commit + stuck-blade opening, A11) and drinks 14 hp if it lands.
- BLOOD PRICE CLEAVE (replaces the planted blade in both orders): told 1.15 s ("BLOOD PRICE", red !!, a reach line on the floor, a growing glow at his blade); he PAYS HIS OWN HP (1.2% max a 0.38 s, floored at 1); red crescent 86 px ahead / 18 behind / 70 tall. Lands -> HE DRINKS IT BACK (x2 paid). Out of reach or dodged through -> THE BLOOD IS LOST: HE IS OPEN 1.5 s (x1.6), then his B3 guard. Phase two, paid 3+: THE RED VOLLEY (the old bolt fan) goes with it.
- HIS SIGNATURE, THE DRAIN: BLOOD SURGE (phase entry + P2 rotation) is followed by a 2.2 s DRAIN - a red thread to you within 120 px, 5 a 0.4 s into him; STRIKE HIM TWICE and THE DRAIN BREAKS: HE IS OPEN (reel). Pips over him show what is left to break it.
- BLOCK READS (B10): ward told on the way up (sound + 'BLOOD WARD: GET BEHIND HIM'), the crimson shell (pips + now CRACKS that grow with each kept blow), every kept blow clanks + 'THE WARD KEEPS IT', a full ward struck breaks to an opening (reel), release = NOVA. Face blows stay 0 (a guard you go round or BREAK - B11/B15 duelist, FULL_DAMAGE elsewhere).
- CHAPEL STANDARDS (!! 10-13, B17 - the level's own banner rule): two stand 64 px in from the arena walls when he wakes. While one stands his ward is FED (+1 fill a 0.9 s a standard, a red thread from each) and a FULL ward struck HOLDS ('THE STANDARDS HOLD IT: CUT ONE'). CUT A STANDARD (any blade) and it falls; if his ward is up then, it BREAKS -> open. His surge stands them up again (HIS STANDARDS RISE AGAIN). With none standing, the hero's own rule (full + struck = breaks).
- SPRITE 1.5 -> 1.4 (BK_SCALE), like the Crusader/Pyromancer. Arena 624 px.
- B16: new poses into BK_POSES (from the hero's own frames): price held x2, crescent x3, THE HOOK x2 (atkB), THE DRAIN (harvest 1); hurt index moved to 34.
- B5 REMOVED (no longer the hero's): the held CLEAVE as a move of its own (the chain's last cut is THE DRAG - same committed blow, now drinking) and THE PLANTED BLADE as a move (only THE RED VOLLEY off a deep P2 price). Nothing invented is left (BK_KIT lists every move -> a hero skill; tools/unburied-fights asserts it).
- Bot (src/lab.js): reads priceTell/crescent (out of reach, or dodge through with no room), spent/drain (strike), a fed full ward (cut the nearest standard); the reaper bot's lead uses the new clock.

## CHECKS (PORT 8933, one page at a time)
- **tools/dk2.mjs (NEW, in check.mjs)**: rhythm clock x1.35 (swing 0.65 s), HOOK pulls 12 px, DRAG heals, landed cuts feed the ward (<=75%), held price ~3 hp/0.5 s up to 6 and fires itself, floored at 1 hp, crescent box >= 38 px and HEAVY, a landed crescent drains back x2, an air crescent gives 0, GRAVE KNEEL turns low-front / flagged-low, not behind / middle / standing, high still ducks; the dead linger 45 s (body + picture) then go; the knight's do not linger.
- **tools/unburied-fights.mjs (UPDATED to the design change, nothing loosened)**: A3 move lists now expect priceTell (in place of the planted blade, B5) and, phase two, the drain; NEW blocks: the rhythm's hook (guarded = no pull) and the drag's drink; BLOOD PRICE CLEAVE (pays, never his last point, red, drinks back x2, out of reach / dodged = spent OPEN + B3 guard, P2 RED VOLLEY); THE DRAIN (heals him, 2 blows break it open, far = nothing); THE CHAPEL STANDARDS (feed, a full ward holds, cut one = it breaks, the surge raises them, none = the hero's rule). The forced planted-blade block still passes (the bolt fan is THE RED VOLLEY).
- **tools/commitment.mjs**: reaper LIGHT_TOTAL 0.98 -> 0.76 (Daniel 10-14 LATE, REAPER'S RHYTHM ~35% quicker - the brief's own number); MASH_MAX unchanged and green.
- **tools/verb-matrix.mjs**: fresh() now ends any swing carried in from the row before (the held crescent was let go on the heavy row's last frames and still swinging into the dash row) - state hygiene, every assertion unchanged.
- **GREEN, no edits**: hint-shown, crouch-b, duck, crouch-a, crouch-hint, talents, skill-passives, progression, skill-menu, skill-icons, attack-animation, ability-poses, blow-tags, boss-read, lab-reach, reaper-input, boss-greed, weak-bosses, unburied, corpses, attack-buffer, untold-told, no-hidden-hits, rule-openings, deathknight-unlock, boss-openings; textfit hints,tree,menu,hud,boss,pick,practice,store,bestiary --strict: 3163 screens, 0 issues.
- NOT run: the full suite (check.mjs), cast-poses (tools/cast-poses.mjs does not exist yet), 12-seed tuning, level-quality.

## 3-SEED SANITY + MASH
tools/boss-rates.mjs, profile human, kit flasks, campaign level (NOT tuning):
| Row | practiced kn/wa/py | first kn/wa/py | built kn/wa/py |
|---|---|---|---|
| unburied (THE DEATH KNIGHT) L32 | **0/3** 3/3 2/3 = 56% (band LOW -4) | 0/2 2/2 1/2 | 2/2 2/2 2/2 |

- **RED (pre-existing, for the tune lane): practiced KNIGHT 0/3.** It was already 0/3 before this lane (docs/flask-lever-1013-final.json: practiced kn/wa/py 0/3, 3/3, 3/3). Knight deaths leave him at 28-46%; the warden wins in ~60 s. Tune target 60-70% with flasks, no hero at 0/N.
- **MASH (tools/mash-bot.mjs unburied --arena-only): 0/6** (knight/warden/pyro x2 all DEAD in 24-36 s, boss left 73-96%).
- THE DEATH KNIGHT AS THE HERO (practiced, 3 seeds, vs the knight): stockade L3 2/3 (knight 1/3), marsh 3/3 (3/3), burning 3/3 (3/3).

## QUESTIONS FOR DANIEL - ANSWERED (Daniel, interview 10-15)
1. GRAVE KNEEL keeps the high duck as well as the low block: **KEEP BOTH** (as built).
2. Ward face blows stay 0 (a guard you go round or break - full ward, or a standard): **KEEP 0** (as built).
3. Soul Reap / Bone Armor (WoW-close): **RENAMED NOW** (commit dk2b 6) - SOUL REAP -> **THE REAPING** (LAST RITES was taken by an existing passive), BONE ARMOR -> **OSSUARY MAIL**; ids soulReap/boneArmor kept for saves. talents (names unique), hint-shown, skill-icons green.
4. Skeletons: one at a time is the base; THE PRESS (two) and GRAVECALL (three, 5 s) stay: **KEEP AS IS**.
5. The boss hook only on a full three-cut string: **THE TUNE LANE DECIDES** (weight strings toward 3 if it reads too rarely).
6. Trial-yard drills for BLOOD PRICE + GRAVE KNEEL: **THE ART/TUNE LANE ADDS THEM** on the final poses.

## ART LIST FOR THE SONNET ART LANE (greybox today)
- HERO (chars.js bakeReaper, all marked claude/dk2b GREYBOX): `graveKneel` x2 (one knee, greatsword planted point-down in front, hands on the pommel, a red gleam at the point), `priceHold` x2 (blade back over the shoulder drinking - a growing red glow, the second redder), `crescent` x3 (haul from behind, the wide level crescent with a blood arc, the low follow-through), REAPER'S RHYTHM's three cuts each their own (rising diagonal / reverse-sweep hook / overhead drag - today the shared atk/atkB/atkC arcs), a proper blood-trail smear (today particles), the crescent's arc FX (today an ellipse + particles), the growing blade glow (today a cross + disc, drawPriceBlade), the lingering-body red glow (today rects), the price "-N" / drain "+N" juice.
- BOSS (unburied-foes.js drawBloodKnightWorld + BK_POSES at 1.4x): the crescent arc and its told reach, the price glow on his blade, THE DRAIN's thread + drops (and a drinking pose of his own if harvest[1] reads wrong at 1.4x), the TWO CHAPEL STANDARDS (standing banner with the Order's colours, the feed threads to the ward, a falling animation, the risen-again flare), the ward shell's cracks, THE HOOK's pull dust, the spent/open read (today the shared green ring - B10 says gold ring + timer bar).
- SOUND: price tick (bloodDraw reused), crescent (heavy+dkWard reused), kneel block (lowGuard+clank reused), drain loop, standard falls (crack reused).
