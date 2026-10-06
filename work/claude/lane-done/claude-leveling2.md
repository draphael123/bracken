# LEVELING2 (sections 1-4) - claude/leveling2 (Sonnet), base master 85e13368

Built sections 1-4 of the brief only. Not built: TECHNIQUES (s5, hook only), gear tiers (s6, lives on claude/geartiers), the L16 ceremony (s7).

## 1. Early minor milestones (L5 / L10 / L15 / L20)
- `src/progression.js`: `MILESTONES_MINOR = [5,10,15,20]` ahead of the six big ones, `MILESTONES` is all ten. `milestonesOwed` / `pickMilestone` / respec / migration needed no change: an old save at L26 now owes 5, 10, 15, 20 and 25.
- Eight SMALL perks (`MINOR_PERKS`), each once, each hooked in `src/main.js` (or `src/commit.js` for stamina): LONG STRIDE (roll 12% further), MENDING (a turned blow heals 3), MAGNET (gold pulled from 1.7x further), CLIMBER (ropes 25% faster), BUFFER (jump/attack/dodge press kept 40% longer), BREATHER (stamina waits 20% less to return), RICH TONIC (tonic heals 60, not 45), GRIT (0.15 s more safe time after a hit).
- Hand = two untaken perks from the pool of that tier (early pool for L5-20, the old eight for L25-50) turned by hero and level, plus the hero's own as the third.

## 2. Hero-specific options at EVERY milestone (early and late) - built here, not handed to HERO KIT
HERO KIT is finished (claude-herokit.md), so this lane built the hook and two options per hero, all seven heroes (knight, pyro, paladin, freebooter, death knight, warden, geomancer). Not the Berserker (he is not in HERO_IDS yet; add two rows to `HERO_PERKS` and two hooks).
- Each hero has two options (`HERO_PERKS`); milestone i offers option (i mod 2); each pick adds a RANK (max 5, ten milestones = five each), so the hero's own is on every hand, never runs out, and is never the only way to grow. The card marks it green with `YOURS  RANK n/5`.
- Knight: HARD BASH (bash staggers +15%/rank), KEEN GUARD (perfect-guard window +0.012 s/rank). Pyro: WILDFIRE (a burning foe lights neighbours when it falls, radius 30+10/rank; stacks with CONFLAGRATION), HEAT HOLD (heat fades 12% slower a rank). Paladin: RADIANT (light +8%/rank), HARD SMITE (judgement +10%/rank). Freebooter: RICOCHET (ball glances to a second foe within 60+12/rank px for 25%+7%/rank), QUICK LOAD (reload 8%/rank). Death knight: BLOOD WARD (ward fills +12%/rank), DEEP DRAW (nova heals +10%/rank). Warden: LONG TURN (deflect window +0.04 s/rank), QUICK POLE (shaft recovers 8%/rank sooner). Geomancer: HARD STONE (stone life +4%/rank via `GEO.life`, set in applyUpgrades), WIDE RUNE (rune-ward perfect window +0.012 s/rank via `GEO.ward.perfect`).
- Numbers are small per rank and untuned against a human; see UNVERIFIED.

## 3. Stat thresholds at 10 / 20 picks (fit WEIGHT stamina + Boss Wave 2 poise)
| stat | 10 picks | 20 picks |
|---|---|---|
| VIGOR | BLOOD DRAWN: every kill heals 2 | STEADY HANDS: the one who lifts a downed partner revives 1.5x faster and the partner is up at half health, not a third |
| ENDURANCE | LEAN ROLL: rolls cost 20% less below half a bar (commit.js `leanMul`; "sprints" do not cost stamina in this game, so rolls only) | SECOND WIND: the first time the bar would empty it surges back to 40% instead of winding the hero, once per 45 s (reset on respawn/new level) |
| MIGHT | HEAVY HAND: held heavy / heavy-class blows push poise 1.25x (never a tap: the Boss Wave 2 heavies-only rule for bosses and minis is untouched) | FINISHER: the first blow into a broken foe lands 1.25x, once per break |
Seam: all three stamina rules go through `CM.bindStamina` (`lean`, `wind`, `rest`), nothing hard-coded in commit.js to a level.
Note: a bot hero is levelled with `setHeroLevel` (an even spread), so at campaign depth >= 30 (welltown, underwell, redgorge) the first thresholds are on for the boss bots. Intended; measured below.

## 4. The card
`N LEVELS TO YOUR NEXT PERK (LEVEL M)` (or `EVERY PERK IS YOURS` past 50); per stat a threshold bar with `7/10` and the threshold's name and words (`BOTH UNLOCKED` when done); title `LEVEL 5: A SMALL PERK` for the early ones; hero's own marked. LEVEL-UP MOMENT, only on a fresh card (a level-up out of a fight or the map's first open; a pause-menu review is never fresh): a cream flash (0.3 s), the sting (and the medal chime on a milestone), the cards slide in from below (0.35 s), and keys are ignored for the first 0.5 s so a mashed key cannot take a perk unseen. Off in REDUCE MOTION / flashes off. Never inside a fight (unchanged: `levelHealTick` waits for the fight).
Technique hook for the later Opus lane (s5): `progression.js` `TECH_LEVELS = [10,20,30]`, empty `TECHNIQUES`, `techniqueFor`, `techniquesArriving`; `main.js` `teachTechnique(n, from)` is called from `levelUp`, records `PROG.tech`, and calls a `techniquePractice(move)` if that lane defines one. It touches neither L20 nor L30 for SUBCLASSES. Gear: not touched; no gear line on the card (geartiers is unmerged; its `gearAtLevel` can be shown with one guarded line in `drawCard` once it lands).

## Checks (all on port 8654)
Green: `tools/leveling.mjs` (extended: ten milestones, hero's own present at every milestone of every hero and alternating to rank 5/5, hands never repeat a perk and never mix tiers, thresholds fire at exactly 10 and 20 for all three stats, the stamina seam in commit.js incl. second-wind wait, card words, every perk id has a hook in main.js) ; `tools/leveling2-runtime.mjs` (new, page: fresh L5 card with small milestone, own third, "5 LEVELS TO YOUR NEXT PERK (LEVEL 10)", pause-menu card not fresh, 7/10 + BOTH UNLOCKED drawn, VIGOR 10 heals on a kill (and 9 does not), MIGHT 20 finisher 20 vs 15 then 15, ENDURANCE 20 surge 160/400 and 19 none, ENDURANCE 10 roll 14 vs 18, 7 heroes x 480 frames with every perk on: no exception); `textfit card` scope (59 screens incl. new frames for L5 / L12 / L20 / the ten-perk line for every hero: 0 overflow / clipped / truncated; names shortened to <= 10 letters to fit); `levelling-runtime` (level-up line, heal, catch-up); `levelling`, `progression` (node); `mash-gate` (cache untouched; perks are not in the mash bot's card). Mash bot with `--perks` (new flag in `tools/mash-bot.mjs`: every early milestone taken as the hero's own, ranks stacked) on harbor L20, fallingtower L28, welltown L30 (thresholds on) x knight/warden/pyro, boss and mini: 18/18 dead.
`commitment` green (217 rows). Human bot: see the end of this file.

## Tests changed (design change, counting not weakening)
`tools/leveling.mjs`: milestones owed at 24 / 50 / the migrated L26 save are now `[5,10,15,20]` / ten / `[5,10,15,20,25]`, and "taken.size 6" is 10 (the old assertions were literally about the six milestones). `tools/textfit.mjs`: added frames only.

## UNVERIFIED
Nothing seen at human speed: the feel of the flash/slide, whether any rank value is too small to notice (HEAT HOLD, BUFFER) or too big (RICOCHET, WILDFIRE at rank 5), whether FINISHER makes an opening too short to need (it only adds 25% to ONE blow), and the second wind's 45 s clock against a real boss. The perk numbers were set small on purpose.

## QUESTIONS FOR DANIEL (built the recommendation)
1. Hero's own on every hand alternates two options and stacks ranks to 5, rather than two distinct one-time picks (which would run out at milestone 3). Built the ranked version. Alternative: three options per hero, each once, up to ten distinct (needs ~21 more hooks).
2. ENDURANCE 10 "rolls/sprints cheaper": the game has no sprint cost, so rolls only. Rec: leave it; if a sprint cost is ever added, give it the same `leanMul`.
3. The bots reach the first thresholds at campaign depth 30+ with no pick of their own (an even spread). Rec: leave; if a late boss drifts out of the 50-60% band, retune it at the boss, not the threshold.
4. Second wind clock is 45 s of play, not literally "once per fight" (a fight has no single marker for every foe kind). Rec: keep; or reset it when a boss/mini/ambush ends if players read it as unfair.
5. Berserker: two HERO_PERKS rows and two hooks when he lands.

## Human bot sample and commitment (end of run)
- Human bot, normal health, `tools/harnesscard-rates.mjs welltown --mode=new --seeds=3` (campaign L30, so VIGOR/ENDURANCE/MIGHT 10 are on for the bot): knight 3/3, warden 1/2 (one run was a page-init error under load), pyro 2/3 = 6/8 real fights (75%). HERO KIT's master numbers on the same harness for the Djinn (welltown): knight 7/12, warden 7/20, pyro 11/12 = 25/44 (57%). Consistent within the noise of n=8; NOT a base A/B (I made a base worktree but did not run it: 8 fights per tree is ~35 min each on this loaded PC and too small to separate a 5% effect). If the coordinator wants it: base is 85e13368, run the same command on both, 12+ seeds per hero. Other late bosses at depth 31/32 (underwell, redgorge) were not sampled.
- `tools/commitment.mjs`: ok (217 rows) on this branch.
- Not run: the full suite, `progression-economy` (timed out at 120 s once; node-only, the code it reads is unchanged), hint-shown / combat suites.
