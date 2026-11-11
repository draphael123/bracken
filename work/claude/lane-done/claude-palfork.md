# PALFORK lane report (claude/palfork from origin/claude/knightfork 028f1af9f) - 11-10

Code-only: no browser, no tools/check.mjs, nothing killed, nothing merged or deployed. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-palfork, commits d962dde6a + one follow-up, pushed to claude/palfork. FORKS_SHIP stays false. Flag off: every new read is `plb(id)` = `hero()==='paladin' && tech(id)` = the old card read, false for new ids; every changed expression was source-audited to equal the old one at flag off (shockLife, judgement queue, dawnStrike, litany, verdict, martyr...). Flag on (lab ?forks=on, with ?traits for the trait pairs): the Paladin is COMPLETE: 11 rungs, 10 trait pairs, one trait row, no migration needed.

## Base: palrework is NOT merged
claude/palrework (mace + sun shield, HOLY HAMMER corkscrew on UP+C 3-4 pips, SUNFALL on UP+C at 5, no bulwark advance) is still a branch (not an ancestor of master or knightfork; PAL_MACE does not exist on master). The forks are built on MASTER'S Paladin (maul, Light-ward, tap C by tier, UP+C hammer 3 pips, Sanctuary Step, held-X verdict). Card words say BLOW / HAMMER / WARD / PIP, never MAUL or MACE (tools/paladin-forks.mjs asserts it), and capstone/hammer inputs read "AT FIVE PIPS" / "UP + C", so palrework needs NO text change. What moves when palrework lands (one merge pass, all in src/main.js):
1. castHammer / hammers update (my SPIRAL / HOMECOMING fields: `spiral`, `home`, the catch-pip line) vs palrework's castHolyHammer / holyHammerStep + src/holy-hammer.js hammerPath: re-point SPIRAL to a path around him (hammerPath variant) and HOMECOMING to the straight out-and-back variant; both stay distinct from the corkscrew base. Palrework's own note says "fork re-points later" (its Q5/Q6).
2. lightWardTakes (palrework changes the pip fill: absorb +1, perfect 40 -> 20): my KINDLED / HALLOWED STEEL / RADIANT GUARD / RETRIBUTION edits touch the same three lines: textual conflict, trivial.
3. convictionTap / castJudgement: SUNFALL moves to UP+C at 5; my LONG NOON / HEAVEN LANCES live in castJudgement and need no change, only the caller.
4. Third blow: palrework's THE OVERHEAD (palsmite3 donor) keeps P.heavySwing as the third-blow marker my BRAND / SHIELD BASH read; check the pose (bash pose owed art anyway).
5. Bulwark advance leaves the base: my AEGIS STEP does not use it.
Recommended merge order: palrework first (it is an independent branch off batch151), then forkframe -> knightfork -> palfork, resolving the sites above in the first lane that merges.

## Rung table (src/forks-paladin.js data; effect code in src/main.js, line numbers approximate on this branch)
| L | key | A | B | effect site |
|---|---|---|---|---|
| 21 | dash | SUNSTEP: step x1.25 faster, patch stands 3.5 s, a quake rolls ahead (WARDED + HEAVY TREAD baked in) | AEGIS STEP: no patch; for 0.5 s after the step a FRONT blow is turned (6 wind), not piercing/red | sanctuaryStep; damagePlayer0 (new block after THE SHOULDER) |
| 22 | hammer (UP+C; not a slotted skill) | SPIRAL: hammer orbits him two turns (r36), each pass x0.8, rehit 0.35 s | HOMECOMING: straight out and back, return pass x1.3, burns (BLESSED HAMMER's burn baked in, its reach is not), the catch pays +1 pip | castHammer, hammers update, catch loop |
| 24 | chain | BRAND: third blow brands 4 s, the next blow on it x1.25 | SHIELD BASH: third blow x0.8, small foes shoved + reel 0.9 s, +1 pip (CONCUSSION baked in minus the boss stagger) | `palForkBlow` hooked in swingDmg |
| 27 | block | RADIANT GUARD: every 3rd blow the ward turns rings r56: small foes reel 0.8 s, all in it take 0.5 blow (light) | HALLOWED STEEL: perfect guard lights the next blow within 3 s: x1.3 and +1 pip | `radiantTurn`, lightWardTakes, palForkBlow |
| 29 | skill:divineShield | BASTION: 8 s, blows taken x0.7, move x0.7. Replaces the 2 s untouchable | MIRROR: 3 s, front shots turned home at who fired (half on boss/mini), blows x0.85 | cast, damage chain (inside SV.mitigationMul x0.6 floor), damagePlayer0, reflectSeed |
| 32 | heavy (VERDICT, hold X) | JUDGE EYE: reach 160, up to 6 sigils | SWIFT VERDICT: max 2 sigils, marked 2x faster, strike x1.6 | verdictMark / verdictStrike |
| 36 | spender (conviction) | ZEAL: Light from landed blows x1.25; foe SUNFALL strikes mend 8 (zeal baked in) | KINDLED: each pip held +4% to blows; every block earns a pip (not every second), perfect guard +1 more | gainLight, judgeHit, lightWardTakes, palForkBlow |
| 38 | skill:dawnburst | WIDE DAWN: reach 150, told 0.3 s wind-up (castT 0.6) | DAWN COLUMN: forward column 150 x 34, x1.6 | new `dawnStrike`, P.dawnPend |
| 43 | sig (plunge/air) | PILLAR UNBOUND: dawnfall pillar r x1.5, aura x2 | HIGH ARC: air whirl floats +0.4 s, its 2nd hit x1.3 and drives small foes down | dawnfall, arcT, palForkBlow |
| 48 | skill:holyWrath | ONE STRIKE: no buff; the next held blow within 6 s at x5 weight, wave x2 | QUICK WRATH: 6 s, blows 25% faster, x1.15 (base buff is x1.4), still mends | cast, heavy start, swing speed |
| 50 | ult (SUNFALL, capstone) | LONG NOON: three falls (1, 0.5, 0.5), 0.6 s apart, aura 8 s | HEAVEN LANCES: six lances in a line ahead out to 190, each a full Sunfall blow | castJudgement queue, `lanceFall`, `judgeHit` |
Boss law: no invulnerability on a foe, no pins; shoves/reels/drive-down skip bosses and minis (BASH, HIGH ARC asserted in the tool); damage-only on a boss through the old boss-aware hurt paths. BASTION's x0.7 and MIRROR's x0.85 sit INSIDE the permanent chain's x0.6 soft floor (forkplan rule 4). The ult's flat blow (20 boss / 30 foe) is master's, untouched (palrework/retune owns it).

## Rider / bakes
- ENDURANCE rider (20 picks = skills cool 10% quicker) is the Knight lane's generic flag-gated one: already live for the Paladin.
- The Paladin has NO technique or upgrade cards (TECHNIQUES = knight only, hasKit false), so there is nothing to bake and NO save migration is needed (a held-id save does not exist). Milestone perks / HERO_PERKS (llight, ljudge) are untouched.
- FOLDED passives absorbed by sides: warded + heavyTread -> SUNSTEP; blessedHammer -> HOMECOMING; concuss -> SHIELD BASH; zeal -> ZEAL; fortress (walking aegis) CUT (Knight owns SHIELD ADVANCE). Fold rule made flag-aware (src/traits-paladin.js getters): with FORKS off (TRAITS on alone, the playtest window) the five stay ordinary slottable traits; with FORKS on they retire.
- Trait row (NEW, src/traits-paladin.js merged in src/traits.js; dark behind TRAITS_SHIP): core consecrate/unwavering/reflect/mercy/wrath; traits litany, shockwave (merges sunder + aftershock), smite, beacon, retribution, crusade, earthshaker, martyr, sanctuary, doubleJudge; defaults litany / sanctuary; learnAt L2..18; WRATH re-levelled L21 -> L19 through a new `coreAt` / `coreLevel` in traits.js (the framework tool requires core on by L20; flag-gated like the rest). tools/traits.mjs updated: core uses coreLevel, the Paladin is now split (9 heroes), the "unsplit hero" probe uses a fake id.

## Trait pairs (key trait:<id>, open L20 while WORN; need TRAITS_SHIP on)
| trait | A | B |
|---|---|---|
| LITANY | STILL WATER: mend x3 while standing still (x1 moving) | WALKING LITANY: mend x1.5 anywhere, partner in the light x1.5 |
| SHOCKWAVE | FAR WAVE: hammerfall waves x1.5 further than SHOCKWAVE gave | HEAVY WAVE: no extra reach, every wave x1.4 |
| SMITE | LONG BURN: Sunfall burn 6 s | SPREADING FIRE: burn 3 s, neighbours (34 px) catch it 2 s |
| BEACON | WIDE BEACON: reach 70 px (44) | HOT BEACON: same reach, burn 3.2 s (1.6) |
| RETRIBUTION | LONG REEL: 1.4 s (0.9) | SHARP REPLY: 0.9 s and half a blow of light |
| CRUSADE | WIDE CRUSADE: ring 69 (46) | HARD CRUSADE: x2 damage, throw 380 (260) |
| EARTHSHAKER | EARLY QUAKE: drop of 0.65x (about 3 tiles) | DEEP QUAKE: full drop, waves life 1.4, x1.3 |
| MARTYR | EARLY MARTYR: below 34% | RADIANT MARTYR: at 25%, aura 6 s + a holy flash |
| SANCTUARY | DEEP SANCTUARY: ward mend x2 | WIDE SANCTUARY: same, and a lit aura mends 0.3 hp/s without the ward |
| DOUBLE JUDGEMENT | THREE FALLS: falls 2 and 3 at 60% | WIDE SECOND: second fall reach 165, full strength |
NOT built: rank sites (trk) for the ten traits. Under TRAITS_SHIP a worn Paladin trait plays at full value at every level (the framework's I/II/III scale has no site in main.js for him); tools/traits.mjs checks rank sites for the other 8 heroes only. Owed to the traittune/rework lane (REC: skip, his traits are small and rank-less is acceptable).

## Node checks (all PASS)
Flag off (shipped): tools/paladin-forks.mjs (NEW: 11 rungs on the ladder, 10 pairs one per trait, 42 unique side ids with the p-prefix, no Knight collision, name <= 14 / what <= 96 / teach <= 160, no MAUL/MACE/ADVANCE word, every side id read by main.js, flag off = base reads, flag on reads respect pick + level + slot / worn, free swap + level lock, owed queue 11, capstone card, strip 11 pips, bots, PvP EVEN, trait row (23 passives listed once; folded five slottable with forks off / retired with forks on), TRAITS off = every Paladin passive as today, TRAITS on core/worn/retired, effect-site source scan, boss-law scan), tools/forks.mjs, tools/knight-forks.mjs, tools/tech-cards.mjs, tools/progression.mjs, tools/coop-progress.mjs, tools/traits.mjs (updated), tools/old-save-traits.mjs, node --check on main.js and every touched file. Flag ON (globalThis.location ?forks=on): progression, coop-progress, old-save-traits, traits, paladin-forks pass (tech-cards asserts the flag-off Knight kit, not run on).
NOT run: tools/check.mjs, textfit, anything with a browser. The main.js effect code is syntax-checked and source-audited, NOT played.

## Browser proof owed (sequential; lab ?forks=on&traits..., one browser at a time, >= 1500 MB free, no GATE/BROWSER-HOLD)
1. Flag OFF smoke: Paladin L30 plays as base (hammer, ward, sanctuary step, sunfall), inn has no signpost; tools/paladin-kit, paladin3/4, holy-ground, hero-trials, mash-gate, hero-keys-sheet (the existing paladin browser tools: not run, unknown against this base).
2. Flag ON fresh Paladin (gainXp): one card per rung at 21,22,24,27,29,32,36,38,43,48,50, stat card first; no level deals two choice cards; the strip at 11 pips on 320x180; THE CROSSROADS board 11 rows + TRAITS tab 10 rows.
3. Per side, one use each on a dummy: SUNSTEP speed + quake + patch; AEGIS STEP turns a front blow (and not a red/piercing one); SPIRAL orbit + hits; HOMECOMING return hit/burn/catch pip (the pip number); BRAND on the third blow then x1.25; SHIELD BASH shove/reel/pip, bosses not moved; RADIANT GUARD ring on the third turned blow; HALLOWED STEEL window; BASTION (slow, ring); MIRROR (a real archer/mage shot comes back, a seed reflects); JUDGE EYE 6 sigils; SWIFT VERDICT 2 sigils; ZEAL / KINDLED (pips -> blow numbers); WIDE DAWN wind-up and reach; DAWN COLUMN; PILLAR UNBOUND; HIGH ARC float + second hit; ONE STRIKE store + x5 blow; QUICK WRATH speed; LONG NOON three falls; HEAVEN LANCES line and reach.
4. Trait pairs one use each (TRAITS_SHIP on, trait worn, first-wear card at L20+ for each of his ten).
5. Old-save: a real L35/L50 Paladin save loads flag on then off (no technique ids; confirm no owed perks appear).
6. textfit: 21 fork cards (names <= 14, what <= 96, teach <= 160 chars), the strip, THE CROSSROADS rows for the Paladin.
7. Duel: EVEN L1 vs YOUR LEVEL with a forked Paladin (EVEN must play base).
8. ART OWED (not built, data + effects only per brief): SPIRAL orbit trail, HOMECOMING catch art exists (HFX.catchAt), bash pose, radiant ring, mirror/bastion ring tints (code rings only), dawn column sprite, lance sprite, wide-dawn wind-up pose, per-side SFX. Flip FORKS_SHIP only after these + the TRAITS_SHIP playtest + palrework merged.

## n=6 power check plan (not run: no browser, gate158 owns the machine)
n=6 WITH flasks, 60-70% band, levels 30 and 50, in order: (1) all A + default traits; (2) all B; (3) re-run the worse side to n=12 only if a side sits more than 8 points off the other. Bosses: Lit Church Paladin, Waymeet duel, Tollmaster (palrework's list minus Admiral until TUNE paladin 1.45/0.42 -> 1/1). After palrework merges re-run once (its numbers move the base).
Hand math, sides most likely off: AEGIS STEP (a free front turn on every dodge into a blow) is the strongest defensive side vs SUNSTEP (utility): expect AEGIS STEP to need a price (raise to 10 wind or 0.35 s). DAWN COLUMN (x1.6 on a single front boss) beats WIDE DAWN (x1.0) on a boss, loses on a crowd: tune WIDE up (x1.2) if the boss band leans on it. SWIFT VERDICT (1 sigil x1.6) beats JUDGE EYE on a lone boss. KINDLED (+4%/pip, about +10% dps at 2.5 pips) beats ZEAL (+25% Light, about 1 extra smite a fight). QUICK WRATH (1.25 x 1.15 = x1.44 vs the base x1.4) is parity with the base buff; ONE STRIKE (x5 one blow + wave) was lifted from x3 to match about 3.7-4 blow-equivalents. BASTION / MIRROR are skill-dependent (MIRROR needs shots). BRAND (about +8% dps) vs SHIELD BASH (-20% third blow, +1 pip, shove): BRAND first to watch. The flag-on Paladin loses the 2 s untouchable halo (both sides replace it): compare before/after at L30.

## Questions (recs built; none blocking)
Q1 DIVINE SHIELD: both sides drop the two seconds of untouchable (BASTION 8 s x0.7, MIRROR 3 s x0.85, inside the x0.6 floor). REC keep (boss-law + forkplan table). Alt: keep a 0.5 s untouchable on cast.
Q2 SUNSTEP bundles WARDED + HEAVY TREAD (a damaging quake): REC keep; AEGIS STEP is the other half.
Q3 HOMECOMING takes BLESSED HAMMER's burn but not its reach (palrework Q8 removed the reach). REC yes.
Q4 SHIELD BASH keeps CONCUSSION's stagger for small foes only; the old third-blow boss stagger (concuss) is gone with the trait. REC yes (boss law).
Q5 ZEAL's Sunfall mend and KINDLED's per-block pip change numbers palrework also touches. REC keep, re-check after the merge.
Q6 ONE STRIKE is x5 on one held blow (parity math above); QUICK WRATH x1.15 + 25% speed. REC wait for the n=6.
Q7 MIRROR turns "a shot from the front" by the shooter being more than 36 px away and `who`/`updFoe` set (no projectile flag exists); a melee foe reaching in from range is treated as a shot. REC accept, refine if the proof shows false turns.
Q8 No rank sites for his ten traits under TRAITS_SHIP (they play at full value at any level). REC accept.
Q9 WRATH core re-levelled L21 -> L19 by `coreAt` (TRAITS on only), per passiveplan. REC yes.
Q10 Rung at L22 is HOLY HAMMER (UP+C, not a slotted skill): the fork applies whenever he has the Light, with no slot rule. REC yes.
Q11 Merge order: palrework before forkframe/knightfork/palfork (see the merge section). REC yes.
