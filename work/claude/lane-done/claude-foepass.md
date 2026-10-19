# claude/foepass - THE FOE PASS / COMBAT-FEEL CORE (opus)

Base: live master 45d7d8a1 (BATCH103, curve-fix C1 dials live). Briefs: scratch/brief-foepass-1016.md (all), brief-polishpro-1016.md item 1,
brief-bloodknight-1017.md section 1 only, brief-curvefix-1018.md 0-3 (context). No stun-pose brief changes (brief-stunposes-1016.md: the common-foe
procedural stagger already exists - src/poise-break.js staggerPose - and is reused by every break here).

## WHAT LANDED

Built as a CORE: each lever is a small module with a table the act sweeps edit, one or two hooks in main.js, a Node check and a page check.

| lever | module | where it is live | what it does |
|---|---|---|---|
| 2 BREAK BAR | src/foe-break.js | every level (common foes) | Blows on one foe within 2.5 s are one EXCHANGE. A verb different from the last pays x1.35 of its bar fill; the SAME LIGHT verb again pays x1 / 0.6 / 0.35 / 0.2 (stale, heard duller - the boss rule's e.amStaleAt read). Heavy / plunge / riposte / ability are never stale (weight breaks a guard). A goblin's LIGHT bar (24, taps never moved it) takes +9 from a VARIED light verb: cut-sweep-cut breaks a goblin, a cut mash never does. Health damage is untouched (bar only). |
| 2 FINISHER REFUND | src/foe-break.js FB.refund, src/finishers.js | every level | A finisher refunds 12 wind (src/commit.js refundCap holds any refund to 12; the brief's "freebooter 14") + 3% of max hp (min 2), shown as a green +N. Replaces the flat 3 hp. |
| 2 PLUNGE FINISHER | main.js hit loop | every level | A plunge onto a broken common foe FINISHES it and bounces (the brief: heavy / plunge / riposte). Any melee blow already finished one. |
| 4b TOLD ATTACKS | src/told-attacks.js | every level | SIG: ONE signature told attack per family, 58 rows = every act I-II family (65 families; 7 on TOLD_TODO, see below). Each names an existing MARK blow + its answer PARRY / JUMP / DUCK. The windup gets its OWN SHAPE by its answer (parry: drawn back and up; jump: down on its haunches; duck: up tall) in place of the shared windKeys lean; a parry signature shows a GOLD SHIELD lane glyph beside its ! (jump/duck keep their arrows). A JUMP/DUCK signature answered in reach and unhurt OVERREACHES: 60% of its bar at once ("OVER IT"/"UNDER IT"), usually a break -> finisher. |
| 3 AFFIXES | src/foe-affix.js, src/foe-pass.js | moor, oreroad (act II) | SHIELDED (white shell = 50% of hp: a blow into it lands x0.4 - B15, never immune - and wears it; heavy/plunge/riposte/dash/ability/the family's right tool SHATTERS it and lands whole), HASTED (clock x1.3 except during a windup - tells keep their length), HEAVY (blows x1.3, bar x1.6, hp x1.25), VOLATILE (dead: a told red !! + closing red ring 0.9 s, then a 36 px blast, 14 dmg pre-tier, unblockable). One affix a foe, deterministic pick by level+spawn key, role-fit (front: shielded/heavy, flank: hasted/volatile/heavy, back: shielded/hasted). Tint over the body (drawTinted) + 5x5 icon left of its bar + its own particles. Density by act 0 / .15 / .2 / .25 / .3; difficulty key 'affix' x0.5 Very Easy / x1 / x1.5 Master. |
| 1 PURSUIT | src/foe-pursuit.js | marsh, stockade, moor, oreroad | A PURSUE kind (25 walkers + the hound) that sees a hero (230 px, same floor) beyond the ring's reach (TOKENS.near 150) comes after him: walkers at 2.2x their pace, 45-72 px/s (under the hero's 92 run: you can get away, you cannot stroll past), the hound at 112 (faster than a run). Leash 300 px from where it stood; 2 s out of sight it walks home; never off a ledge/into spikes; windups, staggers, breaks, throws and held tokens untouched. |
| 1 LEAD | src/foe-pursuit.js leadShot | same 4 levels | An archer looses at a RUNNING hero's position x the arrow's flight x 0.7 (capped 80 px, held to the flat shot's reach; the flight is never lengthened - a lob came down on a ducking hero). A standing, ducking or thrown hero is shot where he is. |
| 4a SQUAD ROLES | src/foe-pursuit.js assignRoles, foe-react.js roleOf | every level | Every squad member gets e.sqRole (front / back / flank via roleOf); a squad of 2+ with no front gets its sturdiest melee as FRONT. foe-react's waiting moves read e.sqRole first. |
| 1 ROUTE-BLOCKING RULE | tools/route-block.mjs, level-quality 'blocking' row | report-only, every level | An encounter BLOCKS when a body stands ON the walked route (route node within 1 col / 1 row); ambush rooms and the mini door always block. Rec >= 40%. Row is REPORT_ALL (WARN, never fails). `node tools/level-quality.mjs --blocking [ids]` prints the table. |
| 1 BOTS FIGHT THROUGH | src/playtest.js makeBot opts.fightThrough, tools/level-walk.mjs | the walker (default on, --fight=0 for the old rule) | A foe on the way ahead in reach (96 px) is fought from the moment it is there, not once the bot stalls; 8 s before writing off a squad member (4 s otherwise). The L1 pilot and the mash bot are unchanged (their rows are gates). |
| polishpro 1: ONE TELL-COLOUR LANGUAGE | src/told-attacks.js TELL_COLOURS | - | gold = answer it on the beat, red = get clear, white = breakable; the new reads use exactly these (checked). The marks keep tools/tells.mjs. |
| polishpro 1 / bloodknight 1: WEAPON WEIGHT | src/juice.js WEAPON / WEAPON_OF | the Death Knight (greatsword) | Not a hero row - a weapon-class row: hit-stop x1.3, a small camera kick toward the blow (FULL shake mode only - the default 'on hit' mode lets only hurt shakes through), foe shoved 4 px (2), and every blow plays the heavy layered impact (material sample + body thud). |
| bloodknight 1: THE WARD-RELEASE PARRY READS | main.js wardReturn, DK_RETURN, audio.js dkClang | Death Knight | hit-stop 0.15 (was 0.1), its own low CLANG (recorded clang pitched down + a low tone) under the old ring, a crimson SHOCKWAVE (2 rings, 64 px) + crimson breath over him, attacker knocked 240 px + staggered 0.7 s, 14 wind refund (capped 12), the word THROWN BACK - it said RETURNED, which MOVE_WORDS never let on screen: the parry was literally silent. A hint (twice a save) the first times a blow is HELD on the ward: "LET THE WARD GO AS A BLOW LANDS: IT IS THROWN BACK AT HIM." |
| bloodknight 1: HIS YARD TEACHES IT | src/level.js trial_reaper 'flash', main.js swornsword | trial | The flash station: "THE RETURN: HOLD C, LET GO AS HIS SWORD FLASHES WHITE: THE BLOW IS THROWN BACK. TWICE." Counted only by a returned blow (P.retSince); the roll no longer counts for him; his sword flashes at WARD_BEAT x0.8 so a release AT the flash is on the beat. |

## CHECKS (QUICK-style subsets on PORT 8751/8752, one Chrome at a time)

NEW, registered in tools/check.mjs: **foe-pass** (Node: the rules, the act I-II told-attack gate, TOLD_TODO may only shrink, affix/pursuit/lead tables,
tell colours, the DK parry, every main.js hook) and **foe-pass-page** (headless: stale mash never breaks / varied run does on hound, brute, shield, sprig;
the refund 3 hp + 12 wind; the plunge finisher; shielded 40% + shatter; heavy bar 40->64; volatile near hurt / far not; hasted 36 vs 30 px; pursuit on the
Stockade, none in the Wood; lead +72 px on the Stockade, 0 in the Wood; a jumped hound pounce overreaches; the reaper yard passed by the ward let go,
not by an early release). Both GREEN.

GREEN: tells, answer-tags, attack-tokens, foe-tactics, foe-tempo, juice, combat-part2, finishers, riposte, riposte-shots, knock-into, untold-told,
verb-matrix, boss-greed, one-dodge, dk2, hero-trials, duck, elites, spawns, stuck, walk-controls, level-walk-selftest, textfit, textfit-levelcard,
mash-gate, level-quality, curve-gate, curve-shape, sprinkle-cap, combat-feel, content-audit, comments, hint-shown, modulepreload, difficulty (direct),
ore-road, ore-ride, ore-work, ore-exam, marsh-exam, spore-exam, stockade-horns, corpses (alone), skyroad-stuck (alone), mark-integrity (direct; see below).

REDS FOUND AND FIXED IN-LANE (each was mine): finishers (a sworn sword hit by six 1-point heavies went stale -> heavies are never stale now), riposte
(two plunges: same), duck (my told-attack fields used e.toldAt, which src/duck.js owns: a high arrow found a ducked hero -> renamed e.taAt), elites
(its source grep for the light-tier line -> the line keeps its form), hint-shown (RETURNED/THROWN BACK/OVER IT silent-list rows shrank: rewritten).

NOT MINE / FLAKY: mark-integrity's one PHANTOM (undeadmage|poisonTell 0 px) passes alone on this branch AND on base (MI_ONLY=undeadmage); in a combined
subset the run crawled for 30 min while another lane's walkers loaded the PC and I killed my own PIDs. corpses / skyroad-stuck failed by time inside a
loaded subset (619 s / 808 s) and pass alone (2-3 min). The FULL suite was not run (coordinator's nightly).

## ROWS RE-STAMPED (with reasons)
- docs/mash-bot.json LEVEL rows, marsh / stockade / moor / oreroad (the four live levels: pursuit + lead, affixes on moor/oreroad; the finisher refund and
  stale bar are global): the masher still DIES on every one (lowest hp 0%); deaths knight/warden/pyro - marsh 8/9/10 (was 29/28/29 on an old row),
  stockade 16/16/16 (16/8/16), moor 5/6/5 (6/8/6), oreroad 3/1/2 (3/2/2). Boss rows untouched (0/6 each, carried).
- docs/level1-curve.json (L1 pilot, bare knight): marsh 27 hits / 1 death / 129% (was 40/2/227), stockade 28/1/111% (24/1/116 on a stale row), oreroad
  16/3/144% (24/4/225) - all in band. MOOR NOT WRITTEN: 7-8 deaths now vs act II's <= 6, but BASE 45d7d8a1 reads 10 deaths / 446% too (its master row was
  stale = not measured): left as on master, QUESTION 6.
- No boss row moves: no lever touches a boss, a mini, an elite or a boss's adds (TIER_BOSS untouched; the told/affix/pursuit/break code all skip them).

## RATES / DEATHS MOVED - the walker (campaign level, human+first, 1 seed, knight / warden / pyro; base = 45d7d8a1 with the old walker)
| level | base deaths | lane deaths | base arrive% | lane arrive% |
|---|---|---|---|---|
| stockade (act I, pursuit+lead) | 1 / 1 / 0 | 1 / 0 / 1 | 60 / 55 / 49 | 38 / 39 / 59 |
| moor (act II, +affixes) | 1 / 1 / 3 | 2 / 0 / 8 | 86 / 86 / 93 | 87 / 96 / 98 |
One seed is noise-level; the clear signal is stockade's lower arrival hp (knight 60->38, warden 55->39 = the pursuit + lead bite) and moor's pyro dying
at THE SPIKES ~col 262-274 (base 3, lane --fight=0 4/run, lane 5.5/run over 2 seeds): the walker fights the moor's foes beside those spikes and is knocked
in - a hazard spot that already killed the base pyro. The act-II sweep should look at that stretch (QUESTION 6).

## SWEEP LANE NOTES (for the sonnet act sweeps - everything you need is in the repo)

Your levers are TABLES. Edit your own rows only; each lever below names its table, its check and what to re-stamp.

1. MAKE YOUR LEVELS LIVE: src/foe-pass.js FOEPASS - add `<id>: { pursue: true, lead: true, affix: true }` per level of your act (act I: no affix).
   `affix: 0.2` (a number) overrides the act's density (AFFIX_ACT 0/.15/.2/.25/.3). tools/foe-pass.mjs refuses an affix in act I and a non-campaign id.
   THEN RE-STAMP the level's rows (the runtime levers do NOT change levelHash, so nothing goes stale by itself - you must):
   `node tools/mash-bot.mjs --level <ids> --write` (level rows; bosses are untouched by every lever here, carryRows keeps them),
   `node tools/level1-pilot.mjs <ids> --curve --write` (curve rows; check `node tools/curve-gate.mjs`), and the walker
   (`node tools/level-walk.mjs <ids> --heroes=knight,warden,pyro --seeds=2`) for the act's numbers. Write each moved row + why into your report.
   NOTE: many act I-II curve rows are ALREADY STALE on master (wood, spore, scree, hanging, spire, moor, storm, underleaf...): a re-pilot can surface an
   out-of-band level that is not yours to blame - moor is out of the act-II band on BASE (10 deaths / 446%): see QUESTIONS 6.
2. ROUTE-HOLDING SQUADS: `node tools/level-quality.mjs --blocking <id>` lists every encounter ON and OFF the walked route (rec >= 40% on it). 15 of 47 levels
   are under today: oreroad 37, skyroad 22, minecart 14 (act II); reef 33, hurricane 32, keep 23 (III); waymeet 32, fields 33, mage 34, fair 31, theatre 33,
   canal 27 (IV); redgorge 31, ksar 31, buriedcity 33 (V). Move squads onto chokepoints / ledges / bridges / doors (a body within 1 col and 1 row of a route
   node). The row is REPORT_ALL in tools/level-quality.mjs: when your whole act clears 40%, propose lifting it for your act (a per-act gate) - never lower BLOCK.share.
3. EACH FAMILY'S TOLD ATTACK: src/told-attacks.js SIG (one row a family: an existing MARK blow + parry/jump/duck). Acts I-II are GATED (every family
   there has a row or a TOLD_TODO line); acts III-V are REPORTED (81 families without one today - `node tools/foe-pass.mjs` prints the count).
   - Parry rows need a yellow ! answered 'block'; jump rows a low blow (ANSWER jump / HEIGHT low); duck rows HEIGHT high (tools/foe-pass.mjs checks it).
   - TOLD_TODO (may only shrink): thief, spitcap, sapper, emberwisp, stormshaman, clinger, shardling - their every blow is a red !! dodge. Build each a NEW
     answerable told attack (the TODO line names the rec) with its OWN windup + release pose (B16: tools/cast-poses / ability-poses), a MARK + ANSWER + HEIGHT
     row (tools/tells.mjs, tools/answer-tags.mjs), then a SIG row, then delete the TODO line.
   - The procedural pose (toldPose: draw / low / high by answer) is the hook, not the art: the art lanes draw each family's own windup frame (B16) and the
     pose can be dropped for a family that has it (add a `frames: true` field and skip toldPose for it - not built yet).
4. AFFIX FIT: src/foe-affix.js FIT (by role) - a kind that reads wrong with an affix goes into main.js FA_SKIP (next to ONE_HIT/POISE_SKIP) with a reason.
   A level whose rule clashes with one (VOLATILE in a powder store, HASTED on a 1-tile ledge) sets `affix` to a number or leaves it off.
5. PURSUIT: src/foe-pursuit.js PURSUE ('walk' | 'hunt'). Add your act's walkers (zombie? slow 'walk' is fine - the pace is 2.2x its own, capped). FLYERS ARE NOT
   IN IT: bats / wasps / harpies / crows have their own AI (src/main.js updateBat etc.) - "flyers chase faster than a walk" needs a per-flyer chase in its own
   update (rec: a dive-pursuit at 110 px/s with the same leash). The LEAD is the archer only today: crossbow, javelin, slinger, bonearcher, scout, rockgoblin
   each loose their own way - give each `FP.leadShot(P, sx, cap)` at its loose (keep its own flat flight; never lob - a duck must still clear a high shot).
6. BOTS: the walker fights through what stands ahead (src/playtest.js opts.fightThrough, default on in tools/level-walk.mjs; --fight=0 = the old rule).
   The L1 pilot and the mash bot are unchanged on purpose (their rows are gates); a lane that wants the pilot to fight through re-pilots every level of its act.
7. CHECKS TO RUN after a sweep: foe-pass, foe-pass-page, finishers, attack-tokens, foe-tactics, combat-part2, answer-tags, tells, duck, mash-gate, level-quality,
   curve-gate, curve-shape, sprinkle-cap, + your levels' own checks. Beware duck.js's e.toldAt / e.toldK - foe fields are a shared namespace (this lane hit it).
8. THE NUMBERS THE CORE CHOSE (tune in one place): FB (varied 1.35, stale 1/.6/.35/.2, lightVaried 9, refund 12 wind + 3% hp), TOLD.overreach 0.6,
   AFFIX (shell 50% hp at x0.4, haste 1.3, heavy 1.3 blow / 1.6 bar / 1.25 hp, volatile 0.9 s / 36 px / 14), PURSUIT (see 230, leash 300, walk <= 72, hunt 112),
   LEAD (k 0.7, max 80).

## QUESTIONS FOR DANIEL (rec first; what I built)

1. FINISHER = ANY BLOW, OR ONLY HEAVY / PLUNGE / RIPOSTE? The brief names heavy/plunge/riposte; today ANY melee blow into a broken common foe is the
   finisher (taught since 09-28, the white stars are its prompt). REC + BUILT: keep any blow, and ADD the plunge (the one blow that did not finish).
   ALT: heavy/plunge/riposte only - a harder call each time a foe breaks.
2. STALE ON COMMONS = THE BAR ONLY? REC + BUILT: the same light verb spammed goes stale on the BREAK BAR only (health damage untouched), and heavies /
   plunges / ripostes / abilities never go stale. ALT: stale damage too (the boss rule) - the masher would kill commons slower.
3. FINISHER REFUND 12 wind + 3% hp (min 2). The brief says ~14 wind; src/commit.js holds every refund to 12 (STAM.refundCap). REC + BUILT: keep the cap.
   C5 (curve-fix step 2) can now measure with the refund in.
4. JUMP / DUCK SIGNATURE ANSWERED = "OVERREACHED" (60% of its bar at once, usually a break -> a finisher). Not in the brief in so many words ("one told
   attack you must ANSWER"). REC + BUILT: yes - answering well should pay like a parry does. ALT: no reward beyond not being hit.
5. FIRST APPLICATION LEVELS: pursuit + lead on marsh, stockade, moor, oreroad; affixes on moor + oreroad. Every other level is untouched until its act
   sweep re-stamps it. REC + BUILT. ALT: switch the levers on for all of acts I-II now (then ~18 levels' mash/curve rows need re-stamping at once).
6. MOOR'S L1-PILOT CURVE ROW was stale on master; re-piloted it reads 7-8 deaths (act II wants <= 6) - and BASE reads 10 deaths / 446% too, so it is
   not this lane. REC + BUILT: left moor's row as on master (stale = not measured) and report it; the act-II sweep re-pilots moor when it makes it live
   properly (or the moor-gust spikes at col ~262-274 get a look - every walker pyro death there, base and lane).
7. ROUTE-BLOCKING SHARE: 40% (the brief's rec), counted as "a body within 1 column and 1 row of a walked-route node"; ambush rooms + the mini always count.
   REC + BUILT report-only. 15/47 levels are under (mostly acts III-V - matching "particularly in later levels").
8. SLIDE/DODGE-JUMP MOMENTUM (polishpro's 10-16 movement line): NOT BUILT here - the crouch slide exists (src/run-slide.js, 10-11), but +20-25% jump
   distance out of a slide/dodge changes what every gap allows (reach-heroes, level-reach, stuck, the walker would all need the move, and gaps meant to be
   uncrossable could become skips). REC: a separate small opus lane with the reach tools, after the act sweeps have placed squads.
9. HIT-FEEDBACK TIERS / MATERIAL RESPONSE / CAMERA KICKS ON FINISHERS already exist (src/juice.js, main.js MAT + SFX.impact + bodyThud, FIN.zoom/shake).
   This lane added the weapon-weight class (greatsword) and the tell-colour language. NOT BUILT: the RESPONSIVENESS AUDIT (input buffer, coyote, cancel
   windows, recovery per hero) and follow-through frames - REC: a sonnet read-only audit (scratch/audit-responsive.md) then a small fix lane.
10. THE GREATSWORD'S CAMERA KICK shows only in the FULL shake mode (the default 'on hit' mode lets only the hero's own hurt shake through). REC + BUILT:
   respect the setting. ALT: tag it 'hurt' so it shows by default.
