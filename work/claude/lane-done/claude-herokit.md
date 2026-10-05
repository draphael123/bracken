# claude/herokit - HERO KIT (Sonnet), base master 2423ff42 (batch68)

## 1. The warden (priority 1) - cause and fix
Cause, measured with a per-hit ledger on the Archmage (human bot): in 66 landed blows the warden landed ZERO tip hits. Her point pays only from
34 px out (near edge of the foe) and her thrust reaches 44, so the tip was a 10 px band - and on the second thrust of a run (it reaches 39) a 5 px one.
The boss bot's carpet code also flew her in to 0.55-0.7 of her reach, i.e. inside the shaft (middle 0.75x, haft 0.3x). Knight hit 49 times for 45+, warden
27 times for 30-44 and 39 times for 12-19. Stamina/rolls were NOT the cause (winded 0 s, same damage taken a minute as the knight).
Fix (kit): TIP_AT 34 -> 28, SHAFT_AT 18 -> 14 (the point is the last third, not the last quarter; HEROES text and the tip hint say so). Her step grace 0.09 -> 0.15 s
(she had a third of everyone else's i-frames; barely used by the bot, no measurable effect, kept as a fairness fix).
Fix (harness, flagged): the Archmage carpet bot stood her at tip range (boss.w/2+32); the Djinn, Gang Leader and Cistern Queen "cut him" plans take a
`tip` argument (src/lab.js WARDEN_TIP) so the warden stands where her point pays. Only the warden passes it; other heroes unchanged.
Ablation: bot spacing alone gave about 3/4; both together 16/20.

Human bot, normal health, corrected harness (tools/harnesscard-rates.mjs, 20 seeds warden; knight/pyro 12 seeds, their code is untouched):
| boss | warden BEFORE | warden AFTER | knight | pyro |
|---|---|---|---|---|
| Undead Archmage (fallingtower) | 1/20 | 16/20 | 12/12 | 10/12 |
| Death Knight (unburied) | 20/20 | 20/20 | 12/12 | 12/12 |
| Djinn (welltown) | 3/20 | 7/20 | 7/12 | 11/12 |
| Gang Leader mini | 7/20 | 13/20 | 7/12 | 10/12 |
Could not reproduce the DK 1/7: on this tree the warden is 20/20 and 7/7 on the combat-pilots salts, before and after. DK is above band for all three heroes (100%).
ARCHMAGE3 (claude/archmage3 22e84670, 2400 hp, throwaway merge with this lane): warden 7/8, pyro 7/8, knight 3/8 on this harness (8 seeds).
The warden is no longer the gap there; the knight is on this harness. Not retuned.
Bosses that leave band because heroes got stronger: DK (100% for all), Archmage (warden/knight/pyro 80-100%).

## 2. Djinn phase-3 bails per hero (priority 2)
Per 100 s of phase three, 8 seeds each: warden 5.3 bails, pyro 4.6, knight 3.8. The wait from "bucket down" to "wound": warden 2.9 s, knight 5.2, pyro 5.1.
Warden melee reach is NOT a gap (she bails more than the pyro). The knight bails least: he spends more of the phase with the cocked bucket up waiting for
the Djinn to be under the shaft (39% of phase three vs 26% for the pyro). The time is the plan's wait (shield blocks eat frames of the wait), not reach. No
kit change; the Djinn's warden/knight rate gap is health lost before phase three (warden 105 hp on entry, knight 119, pyro 91), not the bail. Option for the Djinn
owner: let INTERACT (the pour key) wind/drop the windlass as well as a strike.

## 3. Weak skills (probe, level-16 hero, 3 sprigs; before -> after, damage / stamina)
Whirlwind 26/31 -> 31/27 (radius 34->46, 1.1x per half, breaks a guard, shoves the ring); Shield Throw 17/25 -> 70/25 (goes through, stuns 0.8 s, shooters 1.6 s,
drops a guard, cuts again on the way back; wait 4 s from the throw, it used to start at the catch); Blessed Hammer 10/19 -> 30/19 (the spiral never left his side: now out 112 px and back);
Blood Boil 10/25 -> 50/25 (foes take one blow a second, so 9 a tick landed once; 17 a tick, 4 s, 42 px); Unholy Ground 23 -> 29 and what dies on it rises (three at a time);
Death Coil 20/33 -> 28/24 and heals 7% (was 4%); Death Grip 18 -> 23 and on a BOSS it drags him to the boss (it used to say "it will not come");
Harrier 15 -> 53 (the landing is a stab: "come down point first" was only text); Keelhaul 22 -> 42 (the whole line goes over the rail, bosses are hooked and rocked).
The Rift (Geomancer): the active copied her hold-X Fault Line; now the floor splits BOTH ways at once (130 px each side). Same damage, different job.
Pyro outliers: Meteor 237 -> 223 (base 26+0.2 heat -> 20+0.15 heat), Fire Wall 154/31 -> 132/38 (2.5 s, 38 stamina). Meteor is still 7.2 damage a stamina:
the probe's frozen-sprig geometry does not show its cost of a 0.7 s fall; a harder cut is a QUESTION below.

## 4. Eight late actives (L14 / L20, prices 400 / 520 like the nine-active heroes)
Pyro FLASHOVER (burning foes are detonated, the rest ignited; feeds heat) / FIRESTORM (everything in 220 px alight, heat +60). Paladin DAWNBURST (flare: stagger, light bar) /
HOLY WRATH (6 s: +40% blows, mend 1.5% a blow). Freebooter POWDER KEG (lit keg, blast after 1 s) / HEAVY SEAS (wave knocks the line off its feet). Death Knight BONE ARMOR (next 3 blows x0.4, 12 s) /
SOUL REAP (cut, mark, bleed, drink from 3). Each has an icon (LATE_ICONS), a cooldown, catalog row, preview shape and cast. Poses are the nearest existing one
(tools/ability-poses.mjs SHARED_OK, each with a reason): own frames are an ART follow-up. Probe damage/stamina: 75/28, 117/36, 42/27, 0/34 (buff), 38/26, 42/30, 0/26 (buff), 63/34.
Prices were not coordinated with LEVELING (no LEVELING output seen); they copy the existing ladder.

## 5. Freebooter
Pistol text was stale: the code reloads on a KILL, a PARRY or after 8 s (never on coin pickup). HEROES text and the tagline now say so. Only three of the "eight coin
passives" read coins at pickup (Fair Shares, Greased Palm, Paid in Gold; the other five run on kills or the meter, so they were never dead in an arena). Those three now also pay when a
blow lands on a boss in a boss room (at most once every 1.2 s, src/main.js piratePurse). Descriptions say so.

## 6. Bot tables for the four unmeasured heroes (human bot, normal health, 6 seeds, no skills; wins/6)
| boss | paladin | freebooter | death knight | geomancer |
|---|---|---|---|---|
| wood | 4 | 1 | 4 | 3 |
| marsh | 3 | 3 | 0 | 1 |
| stockade | 2 | 3 | 0 | 0 |
| harbor | 6 | 6 | 6 | 6 |
| fair | 0 | 6 | 0 | 6 |
| burning | 6 | 4 | 2 | 2 |
| Archmage (fallingtower) | 0 | 6 | 6 | 6 |
| unburied | 5 | 1 | 0 | 4 |
| Djinn | 5 | 5 | 0 | 1 |
| Gang Leader mini | 0 | 4 | 2 | 4 |
Flags: PALADIN 0/6 on fair, Archmage, Gang Leader; DEATH KNIGHT 0/6 on marsh, stockade, fair, unburied, Djinn; both are the heavy commit heroes. Not touched (data only).

## Checks
Green: syntax, hint-shown (silent list only shrank: one row), skill-icons (60 actives), skill-passives, ability-poses (60/60), hero-trials, starter-kits, geomancer, commitment, leveling, levelling-runtime,
combat-feel, knight-rework, verb-matrix, ember-flare, tells, skill-balance-probe (before/after above); boss-greed passes alone (failed once under load). Mash bot, bosses fallingtower/welltown/unburied: every hero dies
(unburied mini pyro wins: already report-only). textfit red only on the Djinn plate strings (DJINN lane's, as on the base). Test edits, all counting not weakening: skill-icons 52 -> 60 actives; skill-passives keenPoint dummy moved 35 -> 30 px
(the new band) so keen point is still the difference; ability-poses SHARED_OK entries for the new casts. NOT run: the full suite, level checks (no level touched), mash-gate re-stamp (docs/mash-bot.json untouched).
Hint literals of new casts were removed (hint-shown drops capital number() text); casts say their names only through the HUD/store text.

## UNVERIFIED
Nothing seen on screen: the new casts' feel and keg art, the late actives' balance against real foes (probe is three frozen sprigs), and whether the wider tip band feels right to a human.

## QUESTIONS FOR DANIEL (recommendation first)
1. Wider tip band (last third) for the warden: keep (rec; the bot proved the old band was near unhittable), or revert and only fix the bot.
2. Paladin and Death Knight lose whole boss families (0/6 on 3 and 5 bosses): a bot lane for them (rec), or accept as heavy-hero identity.
3. Meteor is still the best damage a stamina by 2x: another -20% and 38 stamina (rec) or leave.
4. DK (unburied) and the Archmage are now 80-100% for the human bot: BOSS lanes to retune (not done here).
5. Let INTERACT wind and drop the Djinn's windlass (rec, fairer to melee) or keep strike-only.

## Commands and hero level (coordinator standard, 10-05)
Every rate above is at the level's CAMPAIGN level: tools/harnesscard-rates.mjs --mode=new calls BKT.setHeroLevel(hero, depthsOf(LEVELS)[level]) (xp plus the even card spread), no skills, normal health, bossLab with opts.seed.
Warden before = a worktree of 2423ff42, after = this branch, same command:
  PORT=8611 node tools/harnesscard-rates.mjs <fallingtower|unburied|welltown|welltown:mini> --mode=new --heroes=warden --seeds=20 --secs=240
Knight/pyro: same with --heroes=knight,pyro --seeds=12. Four unmeasured heroes: --heroes=paladin,pirate,reaper,geomancer --seeds=6 (levels: wood L1, marsh L1, stockade L2, burning L3, harbor L20, fair L23, unburied L27, fallingtower L28, welltown L30).
Archmage3 check: archmage3 merged with this branch in a throwaway worktree, --seeds=8 --secs=300. Cross-check: node tools/combat-pilots.mjs unburied --heroes=warden --salts=1,2,3,4,5,6,7 (also campaign level).
Ledger/diagnostic scripts (not committed) used setHeroLevel the same way.
