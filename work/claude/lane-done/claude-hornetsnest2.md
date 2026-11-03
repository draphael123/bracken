# HORNET'S NEST 2 (level + Hornet Queen boss) - lane report, branch claude/hornetsnest2 (11-02)

Built from scratch/plan-hornetsnest2-1102.md (all its recommended answers taken). Branch `claude/hornetsnest2`, worktree `bracken-hornetsnest2`, master 5b184cd5 + claude/restamp (35d66a4b) merged in. SHA: see the last commit of the branch (printed in the lane's final message). Not merged, not deployed.

## BUILT, per plan item
A. SMOKE POTS - THE FOG DROPS HER (src/hornet-queen.js, hornet-queen-hands.js, hornets-nest-hands.js)
- A1 grounding triggers, any flying mode: (a) a THROWN pot that breaks on her (potHits -> HQM.dazed at once), (b) her body 0.25 s inside a fog cloud (W.fogAt), (c) the old low rule kept. Never during ward / thrash / tear / wake / enter / away / sleep / pinned / already open. In ward a pot still breaks and she fans it.
- A2 the drop: mode id `dazed` kept, sub-state `e.fall`: wings fold (new POSE `fogfall`), vy += 900 px/s^2 to the floor (or a perch / a comb cut down into the honey under her); open x1.5 all the way down; no damage to heroes; thud, shake 4, dust, honey splash in P2.
- A3 stun 3.0 s (P1) / 2.6 s (P2) starts ON LANDING, then the thrash and the 2.6 s ward. Resist floor intact (shell 0.5, cloak 0.4, ward 0.4; checked over every mode x phase x ward x cloak: min 0.4).
- A4 wary cd 8 s after a grounding (a cloud she flies into is fanned: cloud.t <= 1.0, told once per cloud; her own grounding's fog is left to thin). A 2nd pot inside the 8 s does NOT ground her; after it, it does.
- A5 P2 cloak: first fog strips the cloak (cloakOff) and sets smokeCd 2 s; the next pot grounds her.
- A6 hall fog 56 px / 4.0 s, thinning over the last second (level clouds unchanged 46 px / 6 s).
- A7 self-burst: the hall's two stands hold ONE visible pot each (`st: full|empty`); her body box over a full stand's pot (12x14) in any mode - or a buzz chunk / stinger landing on it - bursts it (W.burstNear), the fog is where she is, rule 1b grounds her. A set-down pot she touches bursts the same way.
- A8 regrow 9 s after taken or burst (last 1 s: smoke thickens + puff + 'A POT SMOULDERS AGAIN'); respawn = both full. Level stands stay infinite.
- A9 teach once: pre-hall sign (now col 390) 'THROW A SMOKE POT AT HER. THE FOG DROPS HER OUT OF THE AIR.'; first wake (S.told.pot, 4.5 s after the rule line); her first self-burst (S.told.burst). HQ_SAY.rule/dazed, OPEN_NAME.dazed 'GROUNDED', the shell hint, the cloak hint reworded.
- A10 poses/sounds: `fogfall` pose (GREYBOX: nose-down, wings folded, smoke trail), smoke round her head grounded, new `fall` sound = thud + puff.
B. TWO PLATFORMING SECTIONS (+100 columns, W 420 -> 520; src/hornets-nest.js)
- Shift method as planned (`let OX`, sections 3 / 4-7 laid with OX 50 / 100, exported constants +100). Final columns: 0-79 foot | 80-168 gate | 169-218 SAGGING GALLERY | 219-297 comb stair | 298-347 HONEY WELL | 348-394 brood cells | 395-432 hall | 433-453 falling nest | 454-519 marsh edge. Every art / tool / tile pin that held a nest column was shifted (tiles, backdrop, hall tear, lights, edge dressing, stuck-spots, walk-hints, shots, tools).
- SAGGING GALLERY: sump (171-204, rows 32-43, middle bed sticky), west knuckle stair, THREE SAGGING COMBS (L.crumbles kind comb count 2: back in 4 s), wax pillar 190-196, a knuckle stair up the pillar's east face (a fall into the east pocket climbs back out), THE BRIDGE COMB (REQUIRED, 12 wide over an 8-wide gap, foot 3 rows over the pillar), exit ledge 205-212, 4 drips. Squad 'gallery': 3 hornets, 1 stinger on the pillar, 1 drone on the ledge.
- HONEY WELL: in at the stair's wall top (row 8), down the west side on 7 alternating shelves, across the bed (east half sticky), UP the east side on 11 pendant rungs (4 wide, 3 rows apart, one-column gap), THE OVERHANG (REQUIRED: rung r27 -> next footing r22 is 5 rows; hang('well',335,338,22,2) lands as the step), exit shelf 339-347 at the nursery floor. Smoke stand on the bed (326), a gold dead-end pendant at 311-314 r33. Squad 'well': 2 hornets, 1 fat honey hornet, 1 swarm, 2 stingers.
- HONEY DRIPS (new machine, L.drips [{x, y0, every, phase}]): a bead swells 0.7 s on a honey string under the comb / roof (glint + soft drip tick), then falls (g 620): 10 dmg (unblockable, no knock) + P.syrupT 1.2 s; on a footing a sticky splash 2.5 s. 4 in the gallery, 5 in the well; max 3 falling at once; only drips within 360 px of a hero run (mobile perf); reset on respawn.
- Checkpoints: 168 (gate), 290,7 (comb stair wall top, RESTORED: ent at 240,7 + OX 50), 392 (pre-boss), 451 (descent) - spans 122 / 102.
- Density: the 8 planned foes + (curve tune) +1 hornet gallery, +2 stingers well. No new foe types.
C. LEVEL-1 END TRANSITION: TABLE row wood -> hornetsnest { scene: null, open / walk / fade, arrive { ferry: false, walk: 1.2 } }; the dead wood -> marsh row DELETED (its timeline / geometry still pinned with a local copy in tools/transition-woodmarsh.mjs). main.js: trnSceneS returns 0 when there is no shore / ride beat (the beats[-1] crash), arrival ambience is 'forest' without a ferry. Walked in the page (--browser): Old Tusker falls -> the walk-out plays, no scene, the party arrives in the nest; ?trans off -> the win card as before. grep MARSH in Old Tusker's win/exit lines: nothing there.

## KNIGHT n=6 (with flasks, practiced, L3, normal, human profile, tools/boss-rates.mjs hornetsnest --heroes=knight --seeds=6)
4/6 = 67%  - IN BAND (60-70). (Master, 1 seed: win.) The knight bot is shielded: it does not carry pots, so this number is the perch / stuck / shield game plus the new floor-fall of the pot-less P1; the pot heroes (warden / pyro ...) are the joint tune's.

## CHECKS
GREEN: tools/hornets-nest.mjs (267: 9 named areas, 4 shrines, locks for ALL NINE heroes - first, bridge, gallery, chainA/B, lastA/B, well; every comb lands; sump / well-bed soft-lock climb-back for 9 heroes x 7 pit spots; drips; sticky beds) | tools/hornetsnest-fog.mjs (NEW, page: 15 - A1a/A1b/A2/A4/A5/A6/A7/A8 + resist floor + drips told >= 0.6 s (0.7) and a hero under one is struck and held; no page errors; added to tools/check.mjs) | tools/level-quality.mjs hornetsnest CLEARS | tools/reach-heroes.mjs hornetsnest (all 9 heroes 0 missed) | tools/level-reach.mjs | solid-islands 0 | platforming-lint (hornetsnest ok) | mash-gate / curve-gate / level-quality after the restamp | tools/transition-woodmarsh.mjs (+ --browser, 34) | tools/hornetsnest-perf.mjs (NEW, phone 915x412 DPR 2.6, 4x CPU: gallery 56.6 fps, well rungs 53.4, well overhang 45.6, all >= 40) | textfit talk (hornetsnest, 6 heroes, 108 screens: 0 issues) | page console clean in every page tool.
NOT RUN / NOT APPLICABLE: tools/boss-openings.mjs and tools/rule-openings.mjs do not cover the Hornet Queen (neither mentions her; boss-openings crashed once on a page death, not hers) - her openings are asserted in tools/hornets-nest.mjs + hornetsnest-fog.mjs. Walker row (docs/walk-curve.json): OWED, report-only, not regenerated. Full textfit / full suite: not run (nightly).
REDS: none left.

## RESTAMP (tools/restamp.mjs --level hornetsnest [--boss]; boss rows 'numbers unchanged' 0/6, carried)
WARN lines, in order of the three passes (the level was tuned between them):
1. pass 1 - pilot hornetsnest lifts 50->91 WARN | curve hornetsnest hits 19->16 WARN | curve lifts 56->88 WARN | curve lostPct 88->77. The lifts are the pilot being put back on its waypoint: where I listed them (--lifts) they are in the NEW parts - it falls into the sump (3 lifts) and stalls on the long sticky well bed (5 lifts) - and all over the old sections as before (50 -> 91 because the level is 24% longer); walked 100%, 0 deaths. Not walls (the reach tools prove the route for all nine heroes); I shortened the sticky beds (sump middle only, well bed east half) afterwards.
2. pass 2 (after the shorter beds) - curve hornetsnest hits 7, kills up, lostPct 77->35 WARN -> curve-gate RED: 'a level-1 knight lost 35% health a run, EASY for act 1 (band 40-250)'. Tuned INSIDE the new squads only: +1 hornet 'gallery', +2 stingers 'well'.
3. pass 3 (final) - pilot hits 12->14, kills 42->45, lifts 84->86 | curve hits 7->15 WARN, lifts 87->88, lostPct 35->69 WARN | mash knight deaths 1->2. level-quality / curve-gate / mash-gate verify GREEN. NOTE the curve row is a 3-run bot sample and swings 35%..88% on small edits: re-read it after any foe change.

## ART LANE NOTES (what is still greybox) - art before live
1 sagging comb shelf: uses the existing comb crumble art (as the falling nest's ledges): needs a whole / counting-sag / gone read with honey strings. 2 honey drip: bead swell is a flat amber disc + the old glob teardrop falling + the old sticky splash; no real swell / pinch-off frames; the honey string and the nub are 1-px lines. 3 comb pendant rungs: they are drawn as the nest's comb shelves on island posts (reads fine); no capped-cell well walls / backdrop (zone-1 ochre wall is reused). 4 honey sump / well bed: the wax tile kit only. 5 hall smoke stand: empty / regrowing = HNP.standEmpty (the stand sprite with the pot cleared, the pot fading back + a thicker curl over the last second) - needs real art. 6 hall fog: the old cloud sprite (scaled to 56 px), no pot-burst-on-her fx beyond particles + the crack/puff sounds. 7 Queen 'fogfall': POSE.fogfall (tilt 1.25, wings folded, smoke curl) - no tumble animation; the grounded pose is the old `dazed` (stars) + a smoke curl round her head. 8 L1 walk-out: no art lane work needed - the clearing's gate art (TRA.drawWayGate) and the far pine already show; nothing new drawn.
Also: the new signs / says are plain; a sign in the gallery (169) and well (300) teach the sump / drips.

## NOTES FOR THE TUNE LANE
- Knobs: HQ.dazed { t [3.0, 2.6], cd 8, cdCloak 2, g 900, inFog 0.25 } in src/hornet-queen.js; hall fog SMOKE.hallR 56 / hallT 4.0 / regrow 9 in src/hornets-nest-hands.js (rec range regrow 8-12, never cd < 6). Chain-lock check: two stands + regrow 9 s + cd 8 s ~ one grounding per ~10 s.
- THE BOT DOES NOT THROW POTS AT HER. src/hornet-queen-plan.js still plays 'carry a pot, let her dive onto it' (the old rule 1c, still works). The lab now offers only FULL stands (src/lab.js). A 'lob a pot at her in her aim' behaviour for the no-shield heroes is the obvious bot work (UP+ATTACK lob reaches ~110 px out, ~85 px up; she hangs still above you in 'aim').
- Drips: DRIP { tell 0.7, dmg 10, syrup 1.2, splash 2.5, max 3 } in src/hornets-nest-hands.js.
- Level-1 curve row is noisy (see above); foes were tuned only in squads 'gallery' / 'well'.
- MEDALS hornetsnest scaled x1.2 (440 / 630 / 920: an estimate, no timed run).

## DECISIONS / DEVIATIONS (each from the plan)
- Gallery: sagging combs 4 wide with gaps 1 / 2 / 2 (not 3) and the pillar 190-196: with the heroes' real jumps (reaper 3 across / 2 rows up) a gap of 3 up two rows is not made. Bridge gap 8 wide (not 6) so the bridge is a real lock for all nine; comb 195-206. Added the pillar's east knuckle stair (the plan's 'second half costs half' pocket had no way out).
- Well: rungs 335-338 / 330-333 (a ONE-column gap, not two): 3 rows up + 2 across is not every hero's jump. The overhang is hang('well',335,338,22,2) (foot 3 rows over the r27 rung; the plan's row 19 was 6 rows over). Exit shelf starts at 339.
- A level holds exactly THREE silvers (saves count them): the new sections pay in gold, not silver.
- level-quality mechanics: a tall level clusters gadget 'places' by ROW, which merged the new combs into one place; the drips are registered as a system array ('drips' in tools/level-quality.mjs SYSTEM_ARRAYS) and carry `y0`, not `row`, so they count by column (3 places).
- Sticky beds shortened (sump middle, well east half): 30 columns of syrup was a slog (the pilot lifts said so).
- A set-down pot she touches bursts; a buzz chunk / stinger landing on a full stand bursts it (world.strike hook); her fan rule does not apply while she is open.
- Test hooks added to the nest hands: W.lob(x, y, vx, vy) (a pot out of nowhere), W.puff(x, y) (a fog), W.stands() now carries st / hall / t.
- 'A POT SMOULDERS AGAIN' uses the nest's told counter (it can show twice in a lifetime, not once).

## QUESTIONS FOR DANIEL (recommended answer first; built as recommended)
1. Drips deal 10 and ignore a raised shield (a bead cannot be blocked). Keep? REC: keep (10 is the comb crush's scale; the tell is 0.7 s).
2. Should the lane after this give the bot a 'lob a pot at her' behaviour so the pot heroes get their rate from the new rule? REC: yes, in the joint tune lane.
3. The curve row swings 35-88% on tiny edits - is the level-1 curve gate's 3-run sample enough for a 520-column level? REC: raise the sample to 5 runs for hornetsnest only when the tune lane re-stamps.
4. MEDALS for the nest are an x1.2 estimate. REC: leave until the first timed demo run.

## SHOTS
scratch\lane-reports\hornetsnest2-shots\before (the old hall / foot / P1 / honey / falling nest / edge gate, the previous lane's) and \after (foot, gallery-in / -pillar / -ledge, well-in / -bed / -rungs / -overhang / -exit, hall, fog-hit / -fall / -grounded / -stun-end / -burst / -stand-empty / -stand-regrown, fog-drip-swell / -fall, q2-p1, q2-honey, q2-falling, edge-gate). `OUT=<dir> ONLY=a,b node tools/hornetsnest2-shots.mjs`. The previous lane's report is kept as claude-hornetsnest2-1023.md.
