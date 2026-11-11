# silk: THE SILK UNDERCROFT + THE CRYPT MOTHER (opus greybox, behind SILK_SHIPS)
Branch `claude/silk` (off master 067c6de7e), pushed. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-silk`. Not merged, not deployed.
Tip: see `git log -1 origin/claude/silk` (the report commit; code tip 129596079). Plan: scratch/lane-reports/silk-plan.md.
Verdict: READY AS A GREYBOX. Code only, node-checked. Not browser-walked (no headless browsers tonight), no art, boss not tuned.

## Built
- **Flag:** `src/sk-flag.js` SILK_SHIPS = false; `skOn()` = the flag, `?sk=1`, or `globalThis.__SK` (`tools/sk-on.mjs`). Flag off = master exactly (proved: LEVELS / burial / witchlight hash = master 067c6de7e's, taken from a `git archive` export before any edit).
- **Road:** THE BURIAL CAVERNS -> THE SILK UNDERCROFT -> THE WITCHLIGHT STAIR. The LEVELS row is APPENDED only while skOn(); it takes the stair's CURRENT needs (burial on master; wispwood if claude/wispwood lands first), then `witchlight.needs = 'silk'`.
  - Old saves: `skRoadMig` (flag on, once): caverns or stair cleared -> the stair stays open; stair cleared -> the undercroft open as an extra. Both go through `PROG.roadOpen` + levelLocked's existing `roadKept` clause (src/route-insert.js) - NO levelLocked edit.
  - Map node inland (168,70), plate right (see Q11).
- **Level** `src/silk-undercroft.js` (340 x 44), rule 'SILK HOLDS WHAT TOUCHES IT.' Dark (0.38), torch amber the one accent; the manor's foundations drawn overhead the whole level (landmark, greybox).
  - 0-59 THE CRYPT DOOR (teach): down out of the crypts; first taut web (REQUIRED BOUNCE to a 6-row shelf), first anchor (a cocoon dropped on a spiderling pair), first sconce + sticky wall (seals the way), goo pinning a spiderling.
  - 60-139 THE HANGING HALL (test): the lurker taught over firm ground, a sac, a burial niche under the floor (a pocket with its own web out, pays coins), THE HIGH BRIDGE (REQUIRED CUT: its floor stake cut, it swings down into a ramp to the gallery), the gallery; SILVER 1 in a roof nook off a taut web.
  - 140-209 THE EGG GALLERY (remix): goo, sacs, spitters on ledges, the sealed tunnel (REQUIRED BURN); SHRINE 1 (col 199).
  - 210-273 THE MOTHER'S STRANDS (exam, A14): strands and a taut sheet over the net, a lurker over the high strand, a spitter + sconce on a crypt column, a sticky sheet burned mid-route; SILVER 2 on a net shelf with its own web back up.
  - 274-287 THE CELLAR STAIR: SHRINE 2 (col 282), exit sign (the manor cellar stair, drawn later). 288-339 THE CATHEDRAL WEB: the boss.
  - Checkpoints START + 2 (checkRun 200). Placed by hand (calm). Foes: 15 spiderlings, 5 spitters, 3 lurkers, 4 sacs. No goblins.
- **The verbs** `src/silk-hands.js` (every changed cell kept and put back on a reset):
  - BOUNCE: taut webs are T.BOUNCER (the game's own spring; reach knows it), drawn tight + shimmer.
  - CUT: strike a knot. COCOON drops (60 to each foe under it); BRIDGE swings down into a ramp (hold cells -> AIR, ramp cells -> ONEWAY).
  - BURN: strike a SCONCE -> TORCH 30 s (a dark-mask hole; told when it goes out). A torch-bearer's blow or touch burns a STICKY WALL (0.5 s) or a SAC. Without a torch: "STUCK" + the hint names the torch.
  - EGG SACS: linger 1.0 s (pulsing) -> 3 spiderlings; struck without a torch -> burst now. GOO: hero capped to 40 px/s, foes PINNED.
  - THE SILK NET: a fall is caught, back to the last firm footing, 16 (spare, never a death).
- **Foes:** SPIDERLING (`spider` + cnSkin 'skling', 8 hp, runner: chase, told bite 0.35 s '!', 6), WEB-SPITTER (`spider` + cnSkin 'skspitter', 30 hp, ranged: told spit 0.7 s '!', slow glob 6 + SNARE 1.2 s via main's P.snare mash; blocked = nothing). main.js hands both to the hands BEFORE updateSpider; every other spider is master's.
  - **THE SILK LURKER** `silklurker` (the one new foe, 40 hp): hides on the roof; its THREAD drops first (0.8 s, red !! - step off), then it drops (14); bites on the floor (0.5 s '!', 10); climbs home. CUT ITS THREAD while it climbs: it falls, STUNNED 1.6 s, x2. MARK/ANSWER/HEIGHT rows in src/marks.js.
- **Boss THE CRYPT MOTHER** `cryptmother`: pure fight `src/crypt-mother.js`; world, POSE table, sounds, greybox `src/crypt-mother-hands.js`. 3000 hp.
  - B15: x0.45 outside openings (never untouchable); x2 ON HER BACK capped 12%/opening; x1 from ABOVE while she hangs (the bounce read); P1 floor 50%.
  - OPENING (B14, the level's verb): she hangs from ONE anchor line to one of 3 knots (wall ledges reached by the banks' taut webs, and the top tier). The live knot glints. CUT IT -> she falls on her back, OPEN 3 s, then climbs and re-anchors to the knot farthest from you.
  - Moves (own windup pose, release pose, sound): WEB SPIT (0.7 s, !, glob 8 + snare, blockable) | POUNCE (1.0 s, !!, her shadow + a thread under you first, 22, move off) | SPIDERLING CLUTCH (0.9 s, !!, a sac hatching 3 in 4 s - burn it from the arena sconces, or strike it) | LEG SWEEP (0.6 s, !!, low along the strand, 18, jump).
  - P2 at 50% SHE CUTS HER OWN STRANDS (2.0 s lament, still x0.45): every 14 s one floor strand flashes 2 s (told, red !!) and falls; the net catches (16 spare). Always >= 2 strands; banks, tiers, webs and knots never fall.
- **main.js:** 19 single tagged lines `(claude/silk)`, every one behind skOn()/SKH/CMH/its ents (EHP rows sit on their own line INSIDE the EHP literal, so one-new-foe reads them). Dev: `?sk=1&dev=1`, `&sksec=1..4`, `&skboss=1`, `?sk=1&boss=cryptmother`.
- **Shared one-liners:** src/level.js (import + guarded push), src/threat.js (one Object.assign), src/marks.js (BY_HAND row + foot Object.assign; MARK matches with no --write), tools/level-quality.mjs (GATE 'silk', REPORT_ONLY music/pilot/mash/curve, ROLES skins skling=runner / skspitter=ranged), tools/additional-areas.mjs (the road pairs).

## Node checks (no browser, no check.mjs, no map-scale; free RAM 3.0-5.6 GB before each batch; logs in scratch/silk-logs/)
- **tools/silk.mjs: all ok (76 ok), flag off and on.** Flag off: master signature, old-save rule over 4 fake saves untouched, 19 hooks guarded, skins routed before updateSpider. Flag on: road + grandfathering (4 cases), build, fill reaches everything, **ONE REQUIRED USE OF EACH VERB proved** (bounce / cut / burn: far side out of reach without, in reach with), the hands (torch, burn, cocoon, bridge, sacs, goo, net, reset), the foes (bite, glob + snare, blocked glob, lurker thread/drop/climb/cut/step-off).
  - **Crypt Mother bot** (40 sword, 640 hp pool, reads 70%): WINS in 220 s with 340/640 left; 8 cuts, 43 blows x2 on her back (2444 open vs 576 through the hide); P2 dropped 2 strands, 2 always stood; every move out of its own windup. Without cutting: LOST / out of time at 400 s. Damage maths: 40 -> 18 hide / 40 from above / 80 on her back; cap holds; P1 holds at 50%.
- **level-quality silk (flag on): CLEARS THE BAR** - bands 6 / 45% multi-height, 6 gadget kinds / 5 developed (skweb x7, sksconce x6, skanchor x5, sksac x4, skwall x3), secrets 2, checks 2 (1 per 161), density 1.50 / 0 empty screens, 3 roles, route 19 rows / 2 pockets. WARN (report-only): pilot, mash, blocking 28%. Full gate passes flag on AND off.
- **ok flag on AND off:** checkpoint-gaps, checkpoint-stand (real 5-column jump), boss-read, one-new-foe (the lurker is the new foe), blow-tags, map-grammar, map-spacing, map-roads, additional-areas.
- **ok flag on (and off = master):** solid-islands (strands/webs/bridge are hullZones), spawns, killzones, deadends (2 pockets, both pay), signs, tells, answer-tags, goblin-lint, threat-holes, foe-pass, death-fx, comments, architecture.
- **Listed only:** floating-geometry 29 groups (the strands themselves), anchor-lint 6 (cantilever 5, prop 1).
- Fixed on the way: a filler shrine at col 102 (shrine 1 moved inside 200), the strands' bounce (rise 7 failed with a real 5-column jump - checkpoint-stand), one-new-foe (it parses the EHP LITERAL: the rows are a line inside it), blow-tags (the Mother's take receives the tag).

## Owed
- **Browser walk** (dev URLs above), never run in a page. Watch: the taut-web throws (6-7 rows) feel; the bridge cut -> ramp; torch carry + burn (touch and blow) + the dark holes; goo slow (vx cap after physics); sac pulse/burst; the net catch; spitter snare + mash; lurker thread/drop/climb + the thread cut hitbox; every Mother move, a knot cut from each ledge, the fall + 3 s opening, the abdomen-from-above read off the bank webs, P2 strands falling, the win; spider skins drawn by the old spider sprite (thread line suppressed via restY); co-op still.
- **Art lane (sonnet, >= B before live):** own tile kit + palette (grey-white silk over black stone), taut web, knots + strands, cocoons, the high bridge/ramp, sticky walls (burning), sconces + torch in hand, sacs, goo, the net, the manor foundations landmark, crypt columns half-wrapped, spiderling/spitter skins (+ corpses in their own skin), THE SILK LURKER, THE CRYPT MOTHER's POSE art (`src/redraw/crypt_mother_art.js` to come); map node art + blurb; transition rows; the cellar stair exit; own ambient bed (dripping, skittering - 'drip' borrowed).
- **Tune (n=6 WITH flasks, 60-70%, mash 0/6, 90-150 s):** boss-run/boss-rates need `--sk` (sets globalThis.__SK in the page) and a cut pilot (`CMH.cut()` hook exists). The node bot's 220 s includes waiting on knots; hp likely fine-to-low for players.
- **Page tools not run:** level1-pilot (pilot + curve), mash-bot, map-scale, map-forks, reach-heroes, stuck, textfit (sk-lines), hint-shown, mobile-perf, boss-openings, boss-greed.
- **Map placement:** (168,70) east of the burial->stair diagonal; never seen drawn (map-scale is headless). With Wispwood's (142,74) both on the road the order is burial -> wispwood -> silk -> stair (splices are order-safe); spacing of the pair untested together.
- **Not built:** bestiary cards (silklurker, cryptmother, skins), boss-rush row, MARK rows for the Mother's tells (she wears her own !/!! via ctx.number), SAY_LINES routing of sk-lines, tools/silk.mjs not wired into check.mjs, the HOLLOW MANOR link (exit is a sign).
- **Merge notes:** with claude/wispwood: tools/additional-areas.mjs (same line - combine the pairs: burial>wispwood>silk>witchlight). main.js hunks sit at different lines than wispwood's (EHP row is its own line two below the literal's head). level.js pushes are order-safe (silk takes the stair's needs after Wispwood's push).

## Questions (rec = what I built; none block)
1. **Road:** Burial -> Silk -> Stair now; with Wispwood: Burial -> Wispwood -> Silk -> Stair (Silk takes the stair's needs); HOLLOW MANOR slots between Silk and the Stair later. **Rec: keep.**
2. **Lurker id `silklurker`, name THE SILK LURKER** - 'lurker' is taken (THE ROOT LURKER). **Rec: keep.**
3. **The net never kills** (16 spare, back to firm footing), as Wispwood's mere. **Rec: keep** (the death cost is the Salt & Sanctuary one, not the pit). Alt: pits kill.
4. **Torch 30 s, relight at any sconce; you still swing your sword with it.** **Rec: keep.** Alt: the torch replaces the sword while held.
5. **Sticky walls burn only with a torch** (the old cuttable T.WEB curtains are not used here). **Rec: keep.**
6. **Mother 3000 hp**; node bot 220 s. **Rec: tune lane at n=6 with flasks** once boss-rates has `--sk` + a cut pilot.
7. **One live knot at a time; she re-anchors to the knot farthest from you.** **Rec: keep** (it makes you cross the web on the strands). Alt: nearest knot (shorter fight).
8. **From above = x1 (not an opening, no cap).** The brief's bounce-to-the-abdomen. **Rec: keep.** Alt: a second capped x2 opening.
9. **P2 strands:** one every 14 s, flash 2 s, >= 2 always stand; banks/tiers/knots never fall. **Rec: keep.**
10. **Music:** borrows 'cave' + pool 'boss3' (report-only). **Rec: Daniel picks** CC0/CC-BY (a dripping, creeping undercroft bed; a heavy boss theme).
11. **Map node (168,70)** - every spot on the burial->stair diagonal overlaps the caverns / Unburied / stair boxes (map-spacing); (168,70) clears spacing, grammar and roads flag on and off. **Rec: keep;** the art lane may relay the inland sheet.
12. **Checkpoints START + 2** (199, 282). **Rec: keep.**
13. **Spiderling and spitter are the spider in skins** (cnSkin), only the lurker is a new type. **Rec: keep** (brief).
