# WEIGHT - commitment + stamina (claude/weight)

Daniel's 10-02 pick from Salt & Sanctuary: COMMITMENT + STAMINA only. No flasks, no parry, no foe stagger.
Base: claude/batch64. Merged since: batch64 fixer 44c8e47d, claude/harnesscard 95905884.

## What it is

**src/commit.js (new).** One module holds the rules. main.js only calls it.

- **The commit.** After a swing's art ends, a recovery runs (`P.atkRec`, the old Weighty timer brought back).
  - The swing art and hit boxes are unchanged. The draw holds the swing's last pose through the recovery.
  - Nothing comes out until the last 0.06 s of the recovery (the cancel window): roll, jump, next cut, the F/G skills, or any C action (ember tap, parry, ward, aegis, mend, deflect, rune-ward, shield, the meter specials).
  - `committed(P)` is the one predicate every gate asks.
- **The held buffer** (`holdPresses`). A press made during a commit is kept, not aged. The latest press wins, and it fires on the window's first frame.
  - A roll pressed at swing frame 2 now comes out on the window. Before, it was dropped.
  - Skill presses are held the same way (`P.sbuf`, main.js press pass).
- **Air.** An air swing adds no recovery. The plunge may follow it only after its active frames (atk > 0.17).
  - A plunge that meets nothing lands +0.10 heavier, and that landing is a commit.
  - A caught plunge (the pogo) is unchanged. pogo-chain is green.
- **The bar** (`staminaTick`, `trySpend`).
  - No regen through the swing itself, a roll, or a raised guard / aegis / ward / rune-ward.
  - LAST WIND: an action with any stamina above 0 goes ahead and empties the bar.
  - EXHAUSTED at 0: no regen for a beat, then x0.6 regen to a threshold. Until the threshold there is no roll and no guard. The bar draws grey with a red rim, and `WINDED: NO ROLL, NO GUARD` shows once.
  - Guard break: half the blow lands, a 0.9 s stagger, the shield stays down 1.2 s, and the bar is exhausted.
  - The knight's block cost scales with the blow. The low guard (crouch-a.js) pays and breaks the same way. A perfect guard is still free.
  - Rolls have a per-hero cost and length. Only the start of a roll is untouchable; the tail can be hit.
- **The seam with LEVELING.** `staminaOf(P)` reads max / regen / roll-cost growth through `bindStamina` (LV_GROW, DEEP LUNGS, FLEET). Endurance feeds P.maxSt. This lane does not hard-code any level number.
- **Kit exploits (10-03).**
  - DIVINE SHIELD: costs 30 and is locked while winded.
  - WAR CRY: +30 becomes +15, and it is locked while winded.
  - The invulnerable dashes (Lunge 28, Cinder Step 28, Holy Charge 32, Boarding Party 26, Harrier 28) now cost at least the hero's roll + 4, and their grace is the roll's share (`dashInv`).
  - FLURRY: the third cut is free (it used to halve every swing).
  - Refunds are capped at 12 and pay nothing during the exhausted beat (`refund`): EVASION, FREE HAND, MERCY, PERFECT GUARD, PARRY, STOKE, RANSOM, BOUNDING, GREASED, the ward return.
  - EVASION only counts a blow that the roll's grace actually took.
  - VAULTER: the vault costs half, not nothing.
  - The +3 for a landed blow is paid only for the third cut and heavies.
- **Greed exemption (Q7).** A blow from a swing whose commit outlasts GREED.tell (0.6 s) is not counted as greed.
- **Skill texts** updated: Lunge, Cinder Step, Holy Charge, War Cry, Divine Shield, Flurry, Vaulter, and the Cinder Step shop row.

## The numbers: briefed, then WEIGHT-T (what ships)

**As briefed, the human-speed bot collapsed.** With the corrected harness (an even level card), it went from 71% to 33% of 24 boss fights.

- The coordinator asked for the band back. Every knob in commit.js is runtime-tunable, so I searched it with the human bot.
- The structure stayed: commitment, the window, the held buffer, the jump lock, no regen through the swing, exhaustion, partial rolls.

| knob | briefed | WEIGHT-T |
|---|---|---|
| recovery after the art | knight light +0.14, third +0.20, heavy +0.25; paladin/DK light +0.17 | x0.6: knight +0.084 / +0.12 / +0.15; paladin/DK +0.102 |
| light commit, press to free | pirate 0.33, knight/warden/pyro 0.46, geomancer 0.48, paladin 0.72, DK 1.05 | 0.29 / 0.40 / 0.42 / 0.65 / 0.98 (measured, tools/commitment.mjs) |
| regen | 55/s, 0.5 s delay, none through swing + recovery | 75/s, 0.3 s delay, none through the swing (it runs in the recovery) |
| exhausted | 1.0 s, then x0.6 to 30% | 0.6 s, then x0.6 to 20% |
| roll cost | 24 (pirate 22, paladin/DK 28); warden back-step 15 | 22 (pirate 20, paladin/DK 25); back-step 15 |
| roll grace | first 0.20 s of a 0.30 s roll | first 0.26 s. The DK keeps 0.26 total (0.20 + his 0.06 wake) |
| knight block | 8 + 0.6 x dmg, cap 35 | 6 + 0.4 x dmg, cap 25 |
| paladin | swing 28 | swing 22, plus half his regen through a swing / roll / aegis (`busyRegenBy`) |
| warden back-step | (none) | keeps the regen running, with a 0.2 s delay (`stepFree`). It is spacing, not a roll |
| cancel window | 0.06 s | 0.06 s |
| plunge whiff | +0.10 | +0.10 |
| pistol | 0.45 s | 0.45 s |
| freebooter swing | 10 | 10 |

The bot was also taught three human habits (src/lab.js, `BK.labHuman=false` switches them off for measuring):
- (a) It does not start a swing whose commit outlasts the nearest foe's remaining windup or greed ring.
- (b) It keeps half a roll's wind in reserve.
- (c) It rolls once per tell, in the tell's last 0.22 s (`rollWhenDue`). The warden's back-step is exempt: it is her spacing.
- labRest was retuned too (rest below a roll + 2, back in at 60).

This is not a weaker bot. Under the old combat a swing could be rolled out of and a roll was nearly free, so the bot never had to read a tell. Now it must, as a player must.

## Human-speed bot: before / after on the corrected harness

`node tools/combat-pilots.mjs <12 bosses> --heroes=knight,warden,pyro,paladin,reaper`, 1 seed. Before is origin/claude/harnesscard (master + the harness). After is claude/weight 397bd57a (WEIGHT-T, before the paladin retune).

| hero | before | after |
|---|---|---|
| knight | 9/12 | 8/12 |
| warden | 8/12 | 9/12 |
| pyro | 11/12 | 7/12 |
| paladin | 10/12 | 4/12, then about 50% with the paladin retune (0/8 -> 4/8 on eight of these fights) |
| death knight | 7/12 | 5/12 |
| **all** | **45/60 = 75%** | **33/60 = 55%** |
| knight + warden + pyro | 28/36 = 78% | 24/36 = 67% |

Per boss (w/d/t, seconds, boss % left when lost; columns are kni, war, pyr, pal, rea):
- wood: w68>w75 | d115(39)>d74(89) | w68>d62(66) | w48>d118(1) | w33>w55
- marsh: d32(4)>d18(66) | w7>d57(3) | w39>d29(77) | d34(18)>d36(49) | w36>d30(87)
- stockade: w46>d31(11) | w43>w66 | w33>d36(27) | w47>d59(43) | d34(6)>d36(57)
- hurricane: w46>w45 | d54(84)>w56 | w41>d41(27) | d75(3)>d48(80) | d61(27)>d45(66)
- unburied: w79>w100 | w76>w63 | w91>w110 | w158>w116 | t180(25)>t180(44)
- lamplit: w13>w7 | w47>w45 | w35>w48 | w42>w51 | w45>w43
- harbor: w54>w49 | w58>w63 | w58>w79 | w68>w109 | w77>w95
- moor: d106(15)>d96(16) | w62>d107(15) | w58>w109 | w56>w53 | w41>w56
- spire: w41>w114 | w36>w55 | w32>w44 | w91>d56(100) | w60>w67
- fair: d120(24)>d119(9) | w101>w115 | w116>w170 | w158>d148(7) | t180(30)>d135(43)
- burning: w41>w71 | d58(6)>w61 | w84>w97 | w50>d69(25) | d56(27)>d60(30)
- longwater: w101>w50 | d125(40)>w86 | d120(16)>d90(37) | w166>d152(19) | w71>d93(51)

Notes:
- **The warden** (ARCHMAGE2 / JENNY2 / DJINN2): no warden-only cause was found in WEIGHT's rules.
  - Her deflect taps are not lost to the commit (measured).
  - With the even card she is the best of the five here.
  - The collapse those lanes saw was the as-briefed numbers plus the card-less harness.
- **Hero health 200 -> 156 is not WEIGHT.** maxHp is identical on base and weight (100 + 2/level from the LEVELING card). It was the card-less bots, now fixed by HARNESSCARD.
- **Movers to retune in the boss waves:**
  - The Herald (longwater) fell further. pyre-pilot and boss-navigation's "reaper must finish longwater" go red: under WEIGHT the pyro and the DK lose it.
  - Marsh (Bullfrog) fell to 0/5.
  - Stockade fell to 1/5.

## Mash bot

`node tools/mash-bot.mjs --all --l1 --probe --write`, run alone.

| | before (batch64) | as briefed | WEIGHT-T on harness |
|---|---|---|---|
| bosses beaten at least once | 1/37 (spore) | 1/37 | see MASH below |
| minis beaten at least once | 8/14 | 0/14 | |
| mini fights won by mashing | 25/84 | 0/84 | |

MASH: (filled in below once the harness run ends)

## Pyromancer numbers (no nerf here)

From skill-balance-probe, which is unchanged by WEIGHT:
- METEOR: 237 damage for 31 stamina (7.6 per stamina), 8 s cooldown.
- FIRE WALL: 154 damage for 31 (5.0 per stamina), 4 s cooldown.

On the bot she is no longer the over-performer (11/12 -> 7/12). The LEVELING pass can decide whether the ~25% nerf is still needed.

## Checks

Green on the final numbers:
- New: commitment (in tools/check.mjs).
- Updated: combat-feel (the regen gate moved into staminaTick), skill-passives (Flurry), hint-shown (the list only shrank).
- Also green: attack-buffer, one-dodge, verb-matrix, knight-rework, crouch-a, ward-vs-guard, ember-flare, geomancer, starter-kits, hero-trials, audit-input, pogo-chain, death-cost, juice, boss-greed, foe-tempo, untold-told, lab-reach, tells, answer-tags, textfit, architecture, dangling-paths, checkpoints, skins, npc-removal, levelling-runtime, leveling, normal-health, boss-fight-end, boss-openings, slopes-trace, touch (green alone; red only under load), skill-balance-probe, attack-animation, ability-poses.
- Red, but not WEIGHT's: attack-tokens (the same waymeet hedgeknight failure on base).
- Red because of WEIGHT (the boss-wave movers): pyre-pilot and boss-navigation (longwater: the Herald).
- commitment was proven red on the base: 266 failures on 2addbe87. The batch55 sha in the brief predates batch64.
  - Not red on base, by design: the early-roll miss and the free perfect guard. Those two are non-regression guards.

## UNVERIFIED

Nothing was seen on screen: the grey/red winded bar, the dimmed highlight while the regen waits, the held recovery pose, and the WINDED line.

## Questions for Daniel (recommendation first)

1. **WEIGHT-T vs the briefed numbers.** Rec: ship WEIGHT-T. The briefed numbers put the human-speed bot at 33%. WEIGHT-T keeps every rule, at about 0.6x the recovery and a 75/s regen. Alternative: the briefed numbers, and retune every boss.
2. **The paladin.** Rec: swing 22 with half his regen through his long maul swing. He was 4/12. Alternative: leave him heavy.
3. **The death knight** (7/12 -> 5/12). Rec: leave him, or give him the paladin's busyRegenBy 0.5 if a playtest agrees. His mash already ends stamina-negative.
4. **The warden's back-step keeps the regen** (stepFree). Rec: yes; it is spacing.
5. The 8 brief questions were built as answered (last wind, the +3 refund, partial i-frames, heavy heroes roll heavier, the jump lock, paladin/DK rows, the greed exemption, the dash cut).
6. **The mash bot's level runs.** hurricane and underleaf now clear above 40% in level mode (the base did not). The bot is lifted 45-47 times either way. Rec: a level-mode look in COMBAT PART 2; it is not a WEIGHT rule.
7. **Optional art lane (Sonnet):** a recover pose per hero, in place of the held last frame.
