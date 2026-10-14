# claude/ranger - THE RANGER, the fourth free starter (OPUS kit build, 2026-10-14)

Brief: scratch/brief-ranger.md (+ brief-riposte.md, brief-plunges.md, design-standard B10/B14/B15/B16). Base: origin/master 2cf3294b (BATCH91 live).
Branch: claude/ranger. Port 8903 throughout. **ART IS PLACEHOLDER** (a Sonnet art lane follows Thursday - the full list is below). **NO TUNING** was done
(a Sonnet tune lane follows); every number is a first pick, kept in one table (src/ranger.js `RG`).

## THE KIT (src/ranger.js; numbers in `RG`)
| Move | Input | What it does |
|---|---|---|
| QUICK SHOT | tap X | let go before the draw starts (0.14 s): an arrow from the quiver, weak (x0.6), SHORT - it arcs and is at her feet ~70 px out (measured). Tag `shot`. Works in the air and IN THE BACKFLIP. |
| THE DRAW | hold X | ROOTED while she draws (0.55 s to full). Let go: an arrow that goes harder (x0.9 -> x1.7) and further the longer it was drawn - a full one lands ~140-150 px out (under half a screen). Past half a draw it is tagged `heavy` (B14 heavy key). Held at full she keeps it (3 s, then it goes). |
| KNIFE | X point-blank (a foe inside 18 px) or with an EMPTY quiver | the ordinary swing, short (box 17 out) and a little lighter (x0.75). DOWN+X on her feet = the knife's low sweep (`sweep`). Hold X empty = a knife stab (heavy). X early in a FORWARD roll = the knife's dash attack. |
| RISING SHOT | UP+X | an arrow steeply up (`rise`: B14 FROM BELOW, the wing family's key). |
| DOWNWARD SHOT (her plunge) | DOWN+X in the air | an arrow straight down (`plunge`: B14 FROM ABOVE) and a small HOP UP off the release - she stays above the fight. Empty: a knife plunge. |
| THE QUIVER | - | 5 arrows. A loosed arrow STICKS (floor, wall, or the foe it hit - it falls when the foe does) and GLINTS; walk over it to take it back. One trickles back every 6 s (never stuck). Lost after 30 s lying, or off the level. |
| HUNTER'S FOCUS | - | fills ONLY from arrows that land from the SWEET SPOT (52-138 px from where they were loosed - not point-blank, not at the end of the flight). Full: |
| - MARK | UP+C | the nearest foe ahead (300 px, walls do not hide it) is MARKED 10 s: every blow on it lands x1.33 (from anyone); a red reticle drawn on the late pass (over walls/dark). |
| - PIERCING SHOT | a FULL draw with full focus | flat, fast, through every foe in a line (240 px), x1.9, `heavy`. |
| BOW-BASH (her PARRY) | tap C | a short shove (17 px, small damage, knocks small foes back). Tapped AS a yellow blow lands (the shared tap beat, RP_K.tap) = THE PARRY via src/riposte.js: nothing taken, the foe reels (shared reaction) and is KNOCKED BACK OUT TO RANGE, and her NEXT ARROW is the riposte (tag `riposte`, x2). Red !! = TOO STRONG. Off the beat the bash is no guard: the blow lands. |
| SNARE | DOWN+C on the ground | a cord loop at her feet (1 at a time; 14 s). A common foe that walks in is HELD 1.6 s (elite 0.8); a boss/mini is only CHECKED (poise lean + a 0.2 s flinch - never a lock, B3/B13). |
| BACKFLIP | dodge | away from what she faces (she does not turn), up off the ground; the roll's grace; X in it is a quick shot. Holding the way she faces = an ordinary forward roll. |

Every B14 key with base kit: plunge (downward shot), rise (rising shot), sweep (knife low sweep), behind (position), throw (carry-throw, shared), heavy (half+ draw / knife stab), riposte (bash on the beat -> next arrow), verb (level). tools/ranger.mjs proves the tags.

## HERO CONTRACT
- HEROES entry (desc), HERO_LOOP, TBR `THE BOW / THE HUNT / THE WILD` + TREE_WHO, 90 hp, perks FULL QUIVER / PATIENT EYE, HERO_SHORT, pick lines/role/preview/SIG (VOLLEY), trial name (HUNTER'S FOCUS), HUD (focus bar + an arrow-stroke per arrow in the quiver; plate: FOCUS: UP+C MARK / QUIVER EMPTY), controls card (shoot/knife, draw, snare, rising shot, downward shot, bow-bash, mark, BACKFLIP), crouch hint (snare), voice (women's kit pitched up), parry tone, dance jingle (hunting horn), commit row, roll cost/len, run x1.04, finisher BROUGHT DOWN, flask head box, DASH_STRIKE row (knife in).
- TALENTS: 9 actives on the STARTERS' ladder (L1 VOLLEY, L3 THE HAWK, L5 LEAP BACK, L7 BEAR TRAP, L9 ARROW RAIN, L12 SMOKE ARROW, L14 SECOND QUIVER, L17 HEARTSEEKER, L20 THE WILD HUNT) + 21 passives (one a level 1-19, capstones 22/23/24), each with a consumer (rgTal), icons (RG_ICONS) and glyphs.
- HER TRIAL YARD (trial_ranger, appended): quick shot, full draw, take arrows back, bow-bash on the flash, the marks, backflip, downward shot, dash, sweep, focus/mark, skills.
- ROSTER: Knight/Warden/Geomancer/RANGER are the free starters (DEFAULT_HEROES + hero-roster STARTERS). The Berserker is BUYABLE (10 silver; locked card = silhouette + "BUY IN THE STORE - 10 SILVER"). A slot that owns him keeps him; a device roster written while he was a starter keeps him (parseRoster keeps every listed hero).
- CO-OP / ONLINE: all her state lives on the hero object (P.rgQ, P.rgArrows, P.rgFocus...), main.js runs/draws her through asPlayer, so a P2 ranger carries her own quiver; the online guest picks from coopPickList (the roster), where she is open as a starter.
- BOT: lab.js LAB_REACH.ranger is live - 64 (stand-off at the sweet spot) with arrows, 16 (knife) without; she taps C on the beat like the warden/berserker (DEFLECTS).

## CHECKS (PORT 8903, one page at a time)
- **tools/ranger.mjs (NEW, in check.mjs)**: quick shot (lands 69 px), the draw (rooted 0 px, held at full without loosing, full lands 142 px, HEAVY tag), quiver (stick, walk over = taken back, empty = knife, trickle 1 in 6 s), knife point-blank + DOWN+X sweep, rising shot (rise tag), downward shot (plunge tag, hop up, lands on a foe below), focus (sweet spot fills, point-blank does not), mark (UP+C, 9 vs 7 dmg), pierce (through two), bow-bash parry (0 lost, riposte window, foe thrown back 263 px/s; next arrow tagged riposte; late/red land), snare holds, backflip (faces on, back + up, a shot in it) / forward roll, all nine actives fire, every art key present, weapon skin touches the bow only: **GREEN**.
- **GREEN, extended to hold the Ranger** (hero lists/counts in the check gained her - more coverage, nothing loosened): talents, progression, skill-passives (186; rgDeep probed), skill-icons (78 actives / 186 passives), skill-menu, store-ui, ability-poses (each of her 9 actives its own pose; jump arc), attack-animation (36 rows), dances, duck, settings-tabs, small-adds (9% miss, worst row 25%), weapon-skins, leveling, hero-trials (her yard completes), riposte-shots (parry + ripo 0/1/2), hero-roster.
- **GREEN with her design difference STATED in the check** (each says why in a comment):
  - hero-roster / leveling: STARTERS/DEFAULT_HEROES = knight, warden, geomancer, RANGER (Daniel 10-12); the berserker card is locked + BUY IN THE STORE - 10 SILVER; an old roster that lists the berserker keeps him.
  - riposte: her bash throws the parried foe OUT TO RANGE, so her riposte is the next ARROW - both her measured cuts are the same tap shot from 60 px (ratio ~2.0, bound 1.8-2.7 unchanged).
  - attack-animation: her UP+X is the rising SHOT; the rise row holds her knife's rising cut (quiver empty).
  - verb-matrix: her up shots are posed on the pose clock (rgRise), not the swing's.
  - lab-reach: with arrows her hand stands off and SHOOTS - contact is an arrow meeting the boss (stats.hits), not P.hitSet.
- **GREEN, no edits**: blow-tags, boss-read, commitment, crouch-a, crouch-b, crouch-feet, slide, touch, knock-into, attack-buffer, hero-keys-strip, online-coop, partner-throw, hint-shown (her words are MOVE_WORDS; her mark word is QUARRY - MARKED/BASHED/QUIVER EMPTY were other heroes' silent lines), finishers (BROUGHT DOWN; X is the knife finisher on a broken foe in reach).
- **textfit scoped** (hints,pick,trial,card,tree,menu,hud,store,practice --strict): 1217 screens, 0 issues.
- NOT run (efficiency rule): the full textfit sweep, 12-seed tuning.

## 3-SEED SANITY (NOT tuning: tools/boss-rates.mjs, profile human, kit flasks, campaign L3, practiced, 3 seeds)
| Boss | Ranger | Knight |
|---|---|---|
| marsh (L3) | 3/3 (wins 30 s / 25 s / 11 s) | 2/3 |
| stockade (L3) | 1/3 (one death at 41% left) | 1/3 |
The bot's verbs (Ranger): shot 5-13 and cut (knife) 7-34 a fight - once her quiver is empty the bot fights with the knife until the trickle refills (it never walks to pick arrows up); 0 parries (the bot's C tap rarely met a yellow blow on the beat). Read these as "in the knight's neighbourhood", nothing more. The tune lane has the 12 seeds.

## MASH (tools/mash-bot.mjs, Ranger only)
- Bosses: marsh 2 seeds DEAD (boss left 17% / 83%), stockade 2 seeds TIMEOUT (the bot never reaches the chief - as in the berserker/riposte lanes). **0/4.** (One marsh seed got him to 17%: watch it in the tune lane.)
- Level: marsh, hold right + mash: lowest hp 0%, 29 deaths - it does not hold the level.

## ART LIST FOR THE SONNET LANE (every key is in her set today as a placeholder; chars.js bakeRanger / rgKitPoses)
Her rig is BORROWED: bakeRanger = the Geomancer's rig with her body (RG_BODY/RG_PLUME/RG_PAL), the staff drawn as a LONGBOW (rgBowAt) and a quiver (rgQuiverAt). Give her her OWN rig.
- **Body**: hooded woodland ranger (green-brown hooded cloak, red feather off the hood, leather jerkin + bracers, quiver of white/red fletchings on the back, a longbow taller than her shoulder); the same pixel scale.
- **Locomotion/states (all currently the Geomancer's poses with a bow)**: idle (breath), run x6, jump x2, fall x2, takeoff, apex, land x3, skid, climb x2, hurt x2, crouch, slide x2, swim, tread, slump x2, fidget (her own), drink frames (FA.addDrink off her idle), dance (hunting horn - the jingle is in), dance2 (idle solo), dance3 (boss down).
- **Knife**: atk/atkB/atkC x5 each, follow x2, heavy x3 (knife stab), dashAtk x3 (KNIFE IN out of a forward roll), rise/sweep/airUp (directionalPoses: the knife's rising cut, low sweep, air up-slash - today the bow swings), roll x4 (forward roll).
- **Bow**: windup x3 (THE DRAW: nock, half, full at the cheek - rooted), rgLoose x2, rgShot x2, rgAirShot x2, rgRise x2 (rising shot), rgDown x2 (= plunge: the downward shot + the hop), **rgFlip x4 (NEW, the BACKFLIP - today the roll is played backwards)**.
- **Defence**: rgBash x2 (= block), parry x2 (the bash on the beat, star where it meets the blow), ripo x3 (the riposte ARROW: step-in, loose with the gold flash, follow-through - played on the pose clock).
- **Kit (B16: each its own windup + release)**: rgSnare x2, rgMark x2 (= blast/cast), rgHawkPose x2, rgLeapPose x2, rgVolleyPose x2, rgTrapPose x2, rgRainPose x2, rgSmokePose x2, rgRefillPose x2, rgHeartPose x2, rgHuntPose x2.
- **FX / props (src/ranger.js render)**: the arrow (flying, stuck in a wall/floor at its angle, riding a foe, lying) + its GLINT, the pierce trail, the snare (open / sprung), the bear trap (open / shut), the hawk (flap x2 + strike), the arrow rain, the smoke burst, the MARK reticle (late pass, through walls), the bash arc (bright on the beat); HUD: focus bar + quiver strokes; nine skill icons (RG_ICONS, placeholder pixel art); the pick-screen idle.

## QUESTIONS FOR DANIEL (lanes never block - what I built is the rec)
1. **Talents ladder**: the brief says L1/L4/L8; the other three starters (and the berserker she replaces) are on the STARTERS' ladder (actives at 1/3/5/7/9/12/14/17/20, passives one a level). REC + BUILT: the starters' ladder (VOLLEY is her L1). Say if you want a short L1/L4/L8 tree instead.
2. **The two focus spends**: REC + BUILT: UP+C = MARK; a FULL draw while focus is full = the PIERCING SHOT (spends it automatically). Alternative: pierce on its own input (e.g. hold C).
3. **Who the mark pays**: REC + BUILT: every blow on a marked foe (any hero, co-op too) lands x1.33. Alternative: only hers.
4. **Old devices keep the berserker**: every roster written while he was a starter lists him, so every EXISTING device keeps him open for new games (nobody loses access); only fresh devices see him locked at 10 silver. REC: keep (it is the brief's 'nobody loses access'). Alternative: strip him from rosters unless a slot actually owns him.
5. **Tap timing**: REC + BUILT: the quick shot goes on RELEASE (so a hold can become the draw without wasting an arrow): a tap is <0.14 s. Alternative: on press (snappier, a hold then costs two arrows).
6. **Bot**: the lab bot stands off at 64 px and shoots while she has arrows (knife inside 18 px); it does NOT walk over to pick its arrows up (it waits on the trickle). The tune lane may want a pickup hand.
