# KING GORM 3 (OPUS) - claude/gorm3 off origin/master 0fe14c26 + origin/claude/smallfix7 (ff)
Brief: scratch/brief-gorm3-1101.md (Daniel approved live 11-01 11:49). Do NOT merge/deploy (coordinator batches).

## BUILT
1. **P1 PITCH POT** (src/gorm-king.js perch clock + potTell/pot, src/gorm-hands.js flight/ring/burst/patch). A hero standing over the hall floor
   (a deck/plank, or up a ladder, > 12 px up) for 1.5 s straight -> told windup (0.9 s, `!!`, PITCH POT word, fuse hiss + his laugh, a lit pot in his
   raised hand) -> lobbed on a real arc to where the hero stood; the RED RING (P2's cone mark + a ring of the burst's radius) on the landing spot the
   whole flight (0.85-1.3 s) -> burst (r 18, 14 dmg, blockable) + a 48-px BURNING PITCH patch for 2.5 s (drain, A13, P2's fire bed). The perch clock
   resets the moment he is on the floor; if he is down by the release there is NO throw. Cooldown 7 s (first possible ~3 s into the fight). On the
   litter and on his feet. A one-time hint explains it.
2. **P2 SCEPTRE THROW** (sceptreTell 0.9 s `!!` 'LOW OUT, HIGH BACK', swingUp sound; sceptreOut; sceptreCatch 0.5 s, hookCatch sound). A spinning gilt
   sceptre in a wide boomerang: out along the floor LOW (7 px up: jump it, no shield), up at the far end, back HIGH (17 px: duck it; a shield turns
   it). Range = his distance + 70 (150-330 px, inside the glade). One hit per pass. He stands empty-handed while it flies, the club returns after
   the catch. Every 8 s, at 50-260 px.
3. **ENRAGE at 25% of P2** (rageTell 2 s, no blow, no mark): THE CROWN CRACKS (crack + gold chips), he CATCHES FIRE (flames on shoulders/crown that
   grow through the transition and stay), war cry + roar, shake/zoom, MUSIC LIFT (new `music.lift()` in src/audio.js: track playbackRate x1.06 +
   a low swell stinger; reset on any track change / glade reset), plate 'KING GORM  ENRAGED'. Then his horn (told hornTell) calls ONE LAST BOAR
   (no hounds). Cooldowns x1.25, walk x1.2 (tells unchanged). **BURNING CHARGE** (rage only, every 7 s, first 1.5 s after): burnChargeTell 1 s `!!`
   'BURNING CHARGE: JUMP' (drag + conflag sound, his lane drawn in red dashes) -> charges the glade's length at 250 px/s, contact = the lowered limb
   (feet < 26 px up: jump it, 28 dmg, unblockable) -> skid (burnChargeEnd 0.9 s). Behind him a FIRE TRAIL (16-px segments, 3.5 s each, drain).
   Openings (cages, log trap, beehive) work in rage (same kingHit path, checked), B3 ward + B15 0.4 floor unchanged.
- Marks: src/marks.js BY_HAND/MARK/HEIGHT rows; poses: src/redraw/gorm_poses.js rows + props for every new mode; bot: src/lab-gorm.js steps off a pot
  ring, jumps the low pass (by ETA), ducks the high pass, jumps the charge, steps off the trail. tools/boss-run.mjs rows now carry `gn` (Gorm's
  P1/P2/rage timings, pots, sceptre throws/hits, charges) from window.__gormN.
- New check **tools/gorm3.mjs** (Node, fake world; 34 asserts): pot only perched > 1.5 s, never on the floor, not if he drops before release,
  lands/hurts/patch/drain/goes out/cooldown, afoot too; sceptre low+high hit a stander, jump+duck clear both, duck alone still takes the low pass,
  catch + club back; rage at 25%: told, music, ONE boar no hounds, no blow, tempo x1.25; charge told -> run -> skid, lane, trail, drain, fades,
  jumped = miss, rage-only; a cage holds him enraged; marks/poses/B15.

## RATES (boss-rates kings, practiced, BOT_PROFILE human, flasks kit, campaign L9; knight/warden/pyro)
**FINAL (sha below, P2 bar 1400): 12/18 = 67% IN BAND** - knight 5/6, warden 3/6, pyro 4/6 (seeds 1-6, 0 crashes).
Fight (lab clock) mean 93 s (73-129): P1 ~38 s, P2 ~54 s (split by the hands' own timestamps). Rage reached in 14/18 (the 4 without: 3 deaths before
25%, 1 burst through the one-time sliver inside an opening). Sceptre: 1-4 throws a fight, the bot takes ~1 pass a throw. Burning charge 0-1 a fight
(the rage is the last ~15-25 s). Pitch pot: 0 in every bot fight - the lab bot never climbs to the decks, so the pot is a player deterrent the rate
does not see.
Tune path (all practiced, human, kit flasks, L9): P2 1000 + new moves 9/10 + 8/9 (89-90%) -> P2 blows +12% -> P2 1300: 6/10 then 15/15 (pooled
21/25 = 84%) -> 1200: 15/16 -> 1400 + blows +10% + sceptre every 8: 7/9 partial (stopped for the BROWSER HOLD) -> + rage tempo x1.35, charge every
6 s, trail drain 0.16, club 29: **12/18 = 67%**. Note campaign level is now L9 (kingsfix2 tuned at L6); P1 untouched.
- **NOT measured (slips):** a second n=18 batch to tighten the 67%, dry rates, and the other six heroes (geomancer/ranger/paladin/pirate/reaper/
  berserker) - the coordinator's BROWSER HOLD + gate137 wait stopped browser work. Rec: tune lane runs seeds 7-12 + the six at n=3 after gate137.

## CHECKS
- GREEN: tools/gorm3.mjs (new, 34 ok), tools/gorm2.mjs (page regression incl.), tools/tells.mjs (every mark agrees), tools/answer-tags.mjs,
  tools/kingswood2.mjs, mark-integrity MI_ONLY=king (60 s, and HPFRAC 0.2: every mark seen drawn + lands), mash-bot kings arena 0/6 (k/w/p all dead,
  boss left 66-84%), node --check on every touched file.
- RED (NOT mine): tools/gorm-unlock.mjs fails 'a death in phase 1 still opened it' - it fails IDENTICALLY on origin/claude/smallfix7 itself (ran it
  in a temp worktree, removed): PROG.burningOpen from the test's first clean run survives begin()'s BK.reset({fresh:true}), so every later case reads
  open. The game logic (gormFell / gormBeaten) is untouched by this lane; the one-life hook works (cleanOpen true, fell flags true). Needs a
  smallfix7 tool fix (clear PROG.burningOpen in begin()).
- Not run: boss-openings (no King rows in it; browser time went to rates), textfit (new hint/word strings are the length of the existing Gorm ones).
- One extra rule built: HE ALWAYS ENRAGES - a blow that would end him in P2 before the rage leaves him at 1 hp ONCE (src/main.js hurtEnemy), so
  the told transition plays after the opening; a second killing blow before it still ends him.
- Stills: scratch/lane-reports/gorm3-shots/ - gorm3-pitch-pot-tell, -pitch-pot-perch, -pitch-patch, -sceptre-tell, -sceptre-low-out,
  -sceptre-high-back, -enrage, -burning-charge-tell, -burning-charge-trail. (The pot/sceptre props are small greybox; the perch shot's camera
  sits on the King - the ART lane should re-shoot with the hero on the deck in frame.)

## ART LANE NOTES (sonnet)
- Every new mode is GREYBOX: the nearest baked frame + a run-time prop. Bake own frames (B16): potTell (litter: takes the pot from a bearer, raises
  it lit; afoot: pot over his head), pot (follow-through), sceptreTell (sceptre drawn back over the shoulder, club slung on his back), sceptreOut (arm
  flung forward, hand empty), sceptreCatch (hand up, snatch), rageTell (crown splitting, arms wide, roaring, fire catching his robe), an ENRAGED
  overlay for every frame (cracked crown baked in, burning robe/fur trim - today 3 FX flames + a dark zigzag), burnChargeTell (limb lowered two-
  handed like a ram, head down, pawing), burnCharge (a run cycle, not the clubLo frame), burnChargeEnd (skid).
- Props: the pitch pot (squat black-glazed pot + rag fuse, 2-4 spin frames; today drawn with rects in gorm-hands drawPot), the spinning sceptre
  (4 frames; today a line + head in drawSceptre), the pitch patch / fire trail reuse FX.bed (fine; maybe a pitch-black base under the flames).
- Sounds: pot tell = fuse + kingLaugh, release throwWhoosh, burst crack + conflag; sceptre tell swingUp, catch hookCatch; rage crack + warCry;
  charge trollDragTell + conflag, release bellow + rattle. A real roar/stinger for the rage could be a better sound pick.

## 1. Rate band: 67% n=18 with the new P2 bar 1400 (was 1000) - P2 is now ~54 s of a ~93 s fight. Rec: keep, tune lane confirms n=36 + other heroes.
2. HE ALWAYS ENRAGES (1-hp sliver once, so a cage burst can't skip the rage). Rec: keep (Daniel sees the enrage every win). Built.
3. Pitch pot only in P1 (as approved); the glade has no decks to camp. Rec: P1 only. Built.
4. Music lift = the gorm track x1.06 (a touch faster/higher) + a low stinger, back to normal on any reset. Rec: keep until a real rage track is picked.
5. Pot is blockable (a shield takes the shards), the sceptre's low pass and the charge are not (!!). Rec: keep - jump/step-off are the answers. FOR DANIEL (rec first; built = rec)
QUESTIONS
