# claude-onecore-d (branch claude/onecore-d, from origin/master 7699a5ffb + origin/claude/knbisect-d 7c5c31f31; ONECORE_SHIP = false; no merge to master, no deploy)
Daniel 11-11: all passives on is overpowered; ONE passive per hero by default, the rest unlockable. Built behind ONE switch (default OFF), measured OFF vs ON.

## The switch
- `src/traits-onecore.js`: `ONECORE_SHIP = false`, the nine picks, and the PALADIN's row (master has `paladin: null`).
- `src/traits.js`: `setOnecoreShip(v)` / `onecoreShip()`. While ON, `splitOf` reads a DERIVED row per hero:
  - core = [the one pick];
  - every other former core joins `traits`: learned at its catalog level (capped at L18), worn in a slot, ranked I/II/III like the rest.
  - Slots are unchanged: 1 slot, a 2nd at L20.
  - `movedCores(h)` / `splitRow(h)` are for tools.
  - OFF: `splitOf` reads TRAIT_SPLIT exactly as before.
- Lab `?onecore=on|off` (main.js, beside `?traits=`). Boss tools: `BOSS_ONECORE=on|off` (tools/boss-run.mjs, beside BOSS_TRAITS).
- Merge note: knbisect-d conflicted in tools/boss-run.mjs (traitsJs + juiceJs). I kept both: knbisect's traitsJs with the slot knob, and master's juiceJs.
- RANKS: a moved core SHOWS I/II/III but acts at FULL value at every rank. Its main.js effect site never multiplies by trk(), because core never scaled. Wiring rank into those ~40 sites is a tuning job for after the picks are approved. Until then a moved core is a bit stronger at L1-19 than a native trait.

## Picks
The test: the passive makes the basic kit feel like that hero, and without it a basic button reads broken, not just weaker.

| hero | old core (master) | ONE core | moved to traits (learn level) | defaults |
|---|---|---|---|---|
| knight | thirdCut parry sunder holdLine bulwark riposte | THIRD CUT (L1): the tutorial's first lesson is "three blows in a run: a heavy third" | riposte 5, sunder 7, parry 8, bulwark 15, holdLine 18 (was 20) | vengeance + bleed (knbisect, kept) |
| paladin | none (unsplit, all 24 on) | UNWAVERING (L8): without it the aegis drops after 1.5 s with the button still held | consecrate 7, reflect 4, mercy 5, wrath 18 (was 21). Row = claude/palfork's shape (merged SHOCKWAVE+sunder+aftershock; the 5 fork-folded ids slottable), but FORTRESS kept as a trait at L18 (palfork cuts it) | litany + sanctuary (as palfork) |
| pyro | pilot conflagration smoulder kindle backdraft | KINDLE (L10): "stand in fire"; without it his own fire burns him | pilot 4, conflagration 14, smoulder 17, backdraft 18 (was 20) | emberSkin + phoenix (kept) |
| warden | keenPoint wideGuard standFast ringing sendBack | KEEN POINT (L1): the tip band is the warden's poke | wideGuard 2, standFast 6, sendBack 7, ringing 10 | vaulter + everReady (kept) |
| ranger | rgDeep rgFletch rgSteady rgFar rgBashLong | FLETCHER (L8): the quiver refills in 5 s, not 11; without it the bow runs dry | rgDeep 2, rgSteady 4, rgBashLong 5, rgFar 11 | rgKill + rgCover (kept) |
| geomancer | geoLasting geoReturn geoHardLand geoTall | HIGHER GROUND (L1): her step is the map | geoReturn 5, geoLasting 8, geoHardLand 18 | geoAftershock + geoShrapnel (kept) |
| pirate | cutthroat haulCut quickHands deepPockets greased | CUTTHROAT (L5): the run of five | deepPockets 2, greased 3, quickHands 7, haulCut 10 | longBarrel + secondBarrel (kept) |
| reaper | longHaft drainWalk wardPull bloodMark rend | LONG REACH (L1): the scythe's reach | drainWalk 3, bloodMark 6, wardPull 10, rend 13 | deepRed + longPassing (kept) |
| berserker | bzBite bzCool bzReturn bzChain bzUnflinch | THE RETURN (L3): a second UP+C calls the axe home | bzBite 1, bzCool 2, bzUnflinch 12, bzChain 15 | bzHot + bzIronBrace (kept) |

I kept master's tuned default pairs, which were picked to keep kill speed. No hero became unplayable for the bot, so no extra slot is proposed.

## Should be BASE KIT, not a passive (for Daniel; * = built as that hero's core pick for now)
1. *RANGER FLETCHER: the refill rate is a number on the basic bow. Bake 5 s into the base kit; the core then becomes DEEP QUIVER or STEADY DRAW.
2. *PALADIN UNWAVERING: a held block that drops after 1.5 s reads as a bug (the knight's block is holdable). Bake it in; the core then becomes LITANY or HALLOWED GROUND.
3. *BERSERKER THE RETURN: without it the second press of UP+C does nothing. Bake the recall in; the core then becomes UNFLINCHING or THE CHAIN.
4. *REAPER LONG REACH: a reach number on the basic swing. Bake it in; the core then becomes MARKED IN BLOOD (the ledger; REND needs it).
5. KNIGHT RIPOSTE (moved to a trait): the parry's payoff, and the knight's biggest measured loss, both at the L5 demo Pyromancer (below) and at the Crusader (knbisect). REC: bake it into the parry, or make it the slot-1 default.
6. PYRO KINDLE (the core pick): on master his own fire already burns him before L10. If it is baked in, his core becomes PILOT LIGHT.

Knight THIRD CUT, warden KEEN POINT, geomancer HIGHER GROUND and pirate CUTTHROAT are real passives on top of a base move that already works. Keep them as the core.

## OFF vs ON
Setup: bot, NORMAL, kit flasks, human profile, the same seeds (1-6, or 1-12 where n=12), ON = defaults.
Cell = wins/n [average win length, average damage taken]. GORM = kings L9, CHIEFTAIN = stockade L4, PYROMANCER = burning L5 (the demo three); CRUSADER = waymeet L30; GOBLIN QUEEN = crown L21.

| boss | way | OFF | ON | delta pts |
|---|---|---|---|---|
| **knight** | | | | |
| GORM L9 | practiced | 4/6 [101s,275] | 3/6 [109s,290] | -17 |
| GORM L9 | built | 4/6 [104s,253] | 4/6 [110s,224] | 0 |
| CHIEFTAIN L4 | practiced | 5/6 [67s,81] | 5/6 [67s,81] | 0 |
| CHIEFTAIN L4 | built | 3/6 [129s,126] | 3/6 [129s,126] | 0 |
| PYROMANCER L5 | practiced | 8/12 [78s,180] | 2/12 [79s,188] | -50 |
| PYROMANCER L5 | built | 6/6 [65s,129] | 6/6 [68s,145] | 0 |
| CRUSADER L30 | practiced | 2/6 [93s,379] | 1/6 [121s,431] | -17 |
| CRUSADER L30 | built | 4/6 [83s,395] | 5/6 [86s,451] | 17 |
| GOBLIN QUEEN L21 | practiced | 1/6 [301s,390] | 1/6 [181s,323] | 0 |
| GOBLIN QUEEN L21 | built | 8/12 [208s,330] | 11/12 [202s,296] | 25 |
| **paladin** | | | | |
| GORM L9 | practiced | 1/6 [173s,395] | 2/6 [134s,390] | 17 |
| GORM L9 | built | 3/6 [103s,290] | 3/6 [99s,318] | 0 |
| CHIEFTAIN L4 | practiced | 2/6 [91s,171] | 2/6 [91s,171] | 0 |
| CHIEFTAIN L4 | built | 4/6 [94s,141] | 4/6 [76s,144] | 0 |
| PYROMANCER L5 | practiced | 1/6 [114s,258] | 1/6 [112s,259] | 0 |
| PYROMANCER L5 | built | 6/6 [96s,210] | 6/6 [98s,216] | 0 |
| CRUSADER L30 | practiced | 0/6 [-s,519] | 0/6 [-s,482] | 0 |
| CRUSADER L30 | built | 0/6 [-s,588] | 1/6 [146s,442] | 17 |
| GOBLIN QUEEN L21 | practiced | 0/6 [-s,406] | 0/6 [-s,386] | 0 |
| GOBLIN QUEEN L21 | built | 4/12 [210s,435] | 2/12 [322s,460] | -17 |
| **pyro** | | | | |
| GORM L9 | practiced | 5/6 [85s,172] | 3/6 [86s,213] | -33 |
| GORM L9 | built | 6/6 [87s,181] | 6/6 [86s,171] | 0 |
| CHIEFTAIN L4 | practiced | 4/6 [61s,109] | 4/6 [68s,110] | 0 |
| CHIEFTAIN L4 | built | 1/6 [87s,130] | 3/6 [81s,118] | 33 |
| PYROMANCER L5 | practiced | 5/6 [74s,154] | 5/6 [74s,154] | 0 |
| PYROMANCER L5 | built | 1/6 [91s,143] | 1/6 [91s,143] | 0 |
| CRUSADER L30 | practiced | 4/6 [54s,323] | 5/6 [68s,307] | 17 |
| CRUSADER L30 | built | 6/6 [52s,153] | 6/6 [51s,154] | 0 |
| GOBLIN QUEEN L21 | practiced | 4/6 [145s,277] | 5/6 [183s,359] | 17 |
| GOBLIN QUEEN L21 | built | 6/6 [133s,276] | 4/6 [139s,327] | -33 |
| **warden** | | | | |
| GORM L9 | practiced | 6/6 [78s,102] | 6/6 [80s,110] | 0 |
| GORM L9 | built | 6/6 [89s,128] | 6/6 [90s,123] | 0 |
| CHIEFTAIN L4 | practiced | 1/6 [50s,131] | 1/6 [50s,131] | 0 |
| CHIEFTAIN L4 | built | 2/6 [32s,107] | 2/6 [32s,107] | 0 |
| PYROMANCER L5 | practiced | 6/6 [38s,63] | 6/6 [38s,63] | 0 |
| PYROMANCER L5 | built | 6/6 [33s,54] | 6/6 [33s,54] | 0 |
| CRUSADER L30 | practiced | 10/12 [80s,242] | 6/12 [97s,369] | -33 |
| CRUSADER L30 | built | 6/6 [47s,173] | 6/6 [74s,285] | 0 |
| GOBLIN QUEEN L21 | practiced | 1/6 [179s,334] | 0/6 [-s,261] | -17 |
| GOBLIN QUEEN L21 | built | 0/6 [-s,322] | 0/6 [-s,316] | 0 |
| **ranger** | | | | |
| GORM L9 | practiced | 5/6 [133s,310] | 3/6 [137s,359] | -33 |
| GORM L9 | built | 4/6 [110s,264] | 5/6 [107s,234] | 17 |
| CHIEFTAIN L4 | practiced | 4/6 [58s,112] | 5/6 [64s,115] | 17 |
| CHIEFTAIN L4 | built | 6/6 [64s,87] | 4/6 [72s,96] | -33 |
| PYROMANCER L5 | practiced | 3/6 [79s,209] | 1/6 [86s,206] | -33 |
| PYROMANCER L5 | built | 4/12 [77s,205] | 5/12 [76s,194] | 8 |
| CRUSADER L30 | practiced | 0/6 [-s,499] | 0/6 [-s,457] | 0 |
| CRUSADER L30 | built | 3/6 [127s,463] | 5/6 [116s,477] | 33 |
| GOBLIN QUEEN L21 | practiced | 2/6 [295s,396] | 1/6 [313s,353] | -17 |
| GOBLIN QUEEN L21 | built | 1/6 [192s,397] | 3/6 [225s,382] | 33 |
| **geomancer** | | | | |
| GORM L9 | practiced | 3/6 [94s,263] | 2/6 [87s,270] | -17 |
| GORM L9 | built | 5/6 [70s,166] | 4/6 [69s,175] | -17 |
| CHIEFTAIN L4 | practiced | 6/6 [58s,66] | 6/6 [58s,66] | 0 |
| CHIEFTAIN L4 | built | 6/6 [42s,60] | 6/6 [42s,60] | 0 |
| PYROMANCER L5 | practiced | 6/6 [60s,144] | 6/6 [60s,144] | 0 |
| PYROMANCER L5 | built | 6/6 [37s,77] | 6/6 [37s,77] | 0 |
| CRUSADER L30 | practiced | 0/6 [-s,429] | 0/6 [-s,429] | 0 |
| CRUSADER L30 | built | 3/6 [85s,552] | 3/6 [85s,552] | 0 |
| GOBLIN QUEEN L21 | practiced | 0/6 [-s,304] | 0/6 [-s,304] | 0 |
| GOBLIN QUEEN L21 | built | 4/6 [171s,319] | 3/6 [179s,319] | -17 |
| **pirate** | | | | |
| GORM L9 | practiced | 3/6 [126s,271] | 2/6 [115s,251] | -17 |
| GORM L9 | built | 4/6 [106s,223] | 2/6 [102s,265] | -33 |
| CHIEFTAIN L4 | practiced | 2/6 [89s,105] | 2/6 [73s,108] | 0 |
| CHIEFTAIN L4 | built | 4/6 [86s,106] | 5/6 [69s,105] | 17 |
| PYROMANCER L5 | practiced | 0/6 [-s,186] | 0/6 [-s,186] | 0 |
| PYROMANCER L5 | built | 0/6 [-s,174] | 0/6 [-s,174] | 0 |
| CRUSADER L30 | practiced | 0/6 [-s,458] | 0/6 [-s,458] | 0 |
| CRUSADER L30 | built | 2/6 [164s,575] | 2/6 [164s,575] | 0 |
| GOBLIN QUEEN L21 | practiced | 1/6 [281s,395] | 1/6 [281s,395] | 0 |
| GOBLIN QUEEN L21 | built | 4/6 [259s,373] | 2/6 [241s,296] | -33 |
| **reaper** | | | | |
| GORM L9 | practiced | 4/6 [136s,427] | 5/6 [128s,448] | 17 |
| GORM L9 | built | 6/6 [93s,377] | 6/6 [97s,438] | 0 |
| CHIEFTAIN L4 | practiced | 4/6 [66s,127] | 4/6 [66s,127] | 0 |
| CHIEFTAIN L4 | built | 4/6 [75s,169] | 5/6 [71s,154] | 17 |
| PYROMANCER L5 | practiced | 6/6 [100s,222] | 6/6 [96s,196] | 0 |
| PYROMANCER L5 | built | 6/6 [90s,218] | 6/6 [94s,204] | 0 |
| CRUSADER L30 | practiced | 6/6 [124s,591] | 5/6 [136s,604] | -17 |
| CRUSADER L30 | built | 6/6 [105s,525] | 6/6 [130s,596] | 0 |
| GOBLIN QUEEN L21 | practiced | 1/6 [212s,559] | 0/6 [-s,507] | -17 |
| GOBLIN QUEEN L21 | built | 0/6 [-s,578] | 0/6 [-s,782] | 0 |
| **berserker** | | | | |
| GORM L9 | practiced | 4/6 [87s,240] | 2/6 [96s,290] | -33 |
| GORM L9 | built | 6/6 [84s,189] | 5/6 [84s,214] | -17 |
| CHIEFTAIN L4 | practiced | 4/6 [47s,97] | 5/6 [69s,75] | 17 |
| CHIEFTAIN L4 | built | 6/6 [55s,90] | 6/6 [44s,48] | 0 |
| PYROMANCER L5 | practiced | 4/6 [82s,180] | 2/6 [92s,195] | -33 |
| PYROMANCER L5 | built | 6/6 [70s,163] | 6/6 [63s,136] | 0 |
| CRUSADER L30 | practiced | 2/6 [132s,483] | 1/6 [178s,513] | -17 |
| CRUSADER L30 | built | 4/6 [92s,447] | 5/6 [93s,367] | 17 |
| GOBLIN QUEEN L21 | practiced | 4/6 [246s,327] | 4/6 [280s,356] | 0 |
| GOBLIN QUEEN L21 | built | 5/6 [175s,334] | 6/6 [178s,298] | 17 |

Pooled over the nine heroes and five bosses: practiced OFF 144/282 (51%) -> ON 121/282 (43%); built OFF 187/288 (65%) -> ON 191/288 (66%).

Probes (ON, knight, a trait list forced via BOSS_TRAITS):

| probe | result | ON default | OFF |
|---|---|---|---|
| riposte worn, Pyromancer practiced | 5/12 | 2/12 | 8/12 |
| riposte+bleed, Crusader built | 5/6 | 5/6 | |
| riposte+bleed, Goblin Queen built | 8/12 | 11/12 | |

### Reading
- KNIGHT: the one real drop is the L5 demo PYROMANCER, practiced 8/12 -> 2/12 at n=12.
  - The fight length is the same; losses leave the boss at 36% instead of 18%. That is kill speed.
  - At L5 the only change is riposte leaving core. Wearing riposte gets back half (5/12).
  - Goblin Queen built went UP, 8/12 -> 11/12 (n=12). The Crusader is within noise.
- PALADIN: nearly flat. He is low with the switch OFF too (0/6 at the Crusader and Goblin Queen practiced). Goblin Queen built fell 4/12 -> 2/12 (n=12), with wins at 210 -> 322 s: kill speed.
- PYRO: flat on Chieftain and Pyromancer.
  - Gorm practiced went 5/6 -> 3/6.
  - Goblin Queen built went 6/6 -> 4/6, damage taken 276 -> 327. That is defence (no PILOT / SMOULDER heat).
- WARDEN: CRUSADER practiced fell 10/12 -> 6/12 (n=12). Built stays 6/6, but wins take 47 -> 74 s and damage taken goes 173 -> 285. She lost STAND FAST / RINGING (reach-band pay and stagger). The demo bosses are bit-identical.
- RANGER: noisy both ways, with no consistent direction. Pyromancer built, widened, went 4/12 -> 5/12.
- GEOMANCER, PIRATE: many cells are bit-identical OFF/ON. In these fights the bot never triggers BEDROCK / STONEFACE / THROWN DOWN, nor the purse, hook or pistol passives. A human will feel these; the bot cannot.
- REAPER: wins hold, but fights run longer (Crusader built 105 -> 130 s, damage taken 525 -> 596). That is kill speed, from losing MARKED IN BLOOD and REND.
- BERSERKER: no cell moved by 3 or more.

## Old saves with the switch ON (tools/onecore.mjs, node): PASS
- A v1 fixture (knight L9, pyro L5) and a long v1 save (5 heroes, including a paladin):
  - no throw;
  - progress is identical to OFF beyond `traits`;
  - load -> export -> load is byte-stable;
  - every hero with xp gets his defaults (the paladin gets litany + sanctuary).
- A v2 save with traits already chosen (knight plated+bleed, pyro emberSkin+phoenix): kept exactly; the paladin gets his defaults.
- An OWNED former core (skillOwned riposte) counts as learned but stays off until worn. Expected: the same rule as TRAITS.
- FLIP-BACK hazard, not fixed. A save that wore a moved core (riposte) under ONECORE and is then loaded with the switch OFF:
  - that slot is validated to empty ([null,'bleed']) and does not fall back to the default (vengeance off);
  - nothing crashes, and riposte is core again with the switch OFF.
  - If ONECORE ships and is ever rolled back, validateTraits should refill a dropped slot from defaults.
- Not done: a real-browser load of a localStorage save with ?onecore=on (node round-trip only).

## Menu / level-up / picker (tools/onecore-menu.mjs, one headless browser, ONECORE on): PASS, 0 page errors
All nine heroes were checked at L22 and L6:
- The TRAITS tab shows ONE core row.
- Moved cores show as trait rows: LV n while unlearned, rank I/II/III once learned.
- The TRAITS strip under ACTIVES reads CORE <pick> + S1 + S2. Before the core's level it reads "LV n": pyro LV 10, ranger LV 8, paladin LV 8.
- Confirm on a moved-core row WEARS it into the slot, and it is then on.
- Level-up line (node): "CORE: <pick>." appears once; a moved core arrives as "TRAIT LEARNED: <name>."

Screens: bracken-scratch/desktop-out/onecore/menu-*.png.

No basic-button hijack:
- A worn moved core runs the same effect site through the same gate it had as a master core.
- Unworn, the kit is the one every hero already had below that passive's level.
- No new combination of verbs is reachable.

## Checks
- Switch OFF: tools/traits.mjs, old-save-traits.mjs, progression.mjs, talents.mjs all exit 0. passiveOn is identical after a toggle.
- Switch ON: tools/onecore.mjs and tools/onecore-menu.mjs exit 0.
- tools/check.mjs was NOT run (per brief); no gates.

## Conflicts
- claude/palfork adds src/traits-paladin.js and edits traits.js (import + Object.assign + coreLevel/coreAt). My paladin row is PALADIN_BASE in src/traits-onecore.js.
  - Once palfork lands, the derivation already prefers TRAIT_SPLIT.paladin (`TRAIT_SPLIT[h] || PALADIN_BASE`).
  - Someone must decide FORTRESS: palfork cuts it, I keep it as a trait.
  - The text conflict is in the traits.js import block and the splitOf region: small, merge by hand.
- claude/forkmerge edits traits.js (foldGone in kindOf/slottable/traitIds/traitUpText, plus coreLevel) and traits-b.js. It conflicts with my splitOf hunk by line only. The logic composes: foldGone reads the row's folded/foldRetire, and my derived row copies them.
- claude/palrework-d changes only catalog descs and names (maul -> mace): no conflict.

## Questions for Daniel (rec first)
1. Approve the nine picks? REC: yes, AND bake the four * cases into the base kit (fletch refill, held aegis, axe recall, scythe reach), then re-pick those four cores from the alternates above.
2. Knight RIPOSTE? REC: bake it into the parry. It is the biggest measured loss: the L5 demo Pyromancer went 8/12 -> 2/12, and the Crusader fell in knbisect. Alternative: defaults riposte + bleed, which got 8/12 at the Goblin Queen built against 11/12 for vengeance + bleed.
3. Flip? REC: flip with changes. Do Q2 and the base-kit four first, re-run the knight and warden on the Crusader and the demo three, then flip.
   - The pooled practiced drop (51 -> 43%) is mostly the knight at L5 and the warden at the Crusader.
   - Built is unchanged (65 -> 66%).
4. Rank scaling for moved cores (full value at every rank today)? REC: wire trk() into them only after Q1-3, in its own tune lane.

## Not finished / not verified
- n=6 cells are noisy: a 1-2 win gap is not read.
- Only cells that differed by 3 or more were widened to n=12: knight Pyromancer practiced, knight Goblin Queen built, paladin Goblin Queen built, warden Crusader practiced, ranger Pyromancer built.
- No warden probe and no human playtest.
- Bot blind spots: the geomancer and pirate passives.

Raw: bracken-scratch/desktop-out/onecore/ (m-*/w-*/p-* .json/.log, table.txt, table-short.txt, sum.cjs, run.sh, chain1/chain2/probe.sh, menu-*.png).
