# BRACKEN audio coverage audit

Findings only: nothing in the game was changed. Every SFX method, `music.play/stop/duck/muffle/lowHealth` and `ambient.set` was wrapped in the page to log its name and game frame. The game was then driven headless (port 5908, master 48b33b9) through:
- 85 foes, each fought, stood in front of with the shield up, and taken hits from;
- 23 bosses and 10 minis, through the boss lab;
- every hero action for all five heroes;
- pickups, 52 prop kinds, the menus, and every level's start and ambushes.

On top of that, every voice was rendered once offline, and all 67 music files were decoded. The ranked list comes first, then the full tables.

**Kinds:** "bug" = the code does something other than it plainly intends. "design" = it works as written, and the result is hard to hear.

## Top findings

1. **[bug] The Hurricane's track ends in 1.77 s of silence, heard every time it loops.** The music scheduler plays whole copies back to back (`src/audio.js:325`, `at += b.duration`), so a file's silent tail is a gap in the music. musMountain (the moor) has 115 ms of silence at its end too.
2. **[bug] Six level and boss tracks click at their loop point.** Copies are butted with no crossfade (audio.js:323-325), and the last and first samples jump by:
   - theme3 (Kingswood): 0.38;
   - boss4 (Mage's Folly): 0.29;
   - theme (Bracken Wood): 0.26;
   - boss2 (the Stockade): 0.25;
   - theme4 (the scree): 0.20;
   - theme2 (the marsh): 0.10.
3. **[design] Some windups play no tell sound because their mode is outside `windingUp()`** (main.js:13594, rule A2). Four are confirmed in play, with no mark and no sound for the whole windup:
   - the Chief's `reach` before his lunge;
   - the Homunculus's `flyUp` before its dive;
   - the Golem's `drink` before its counter;
   - the Assassin's `lurk` before his lunge.

   By the static rule (a mode that lands nothing and hands on to a blow) there are 25 such modes; they are tabled below. Some are only movement, a walk into a claw for instance.
4. **[design] The music is never ducked under a boss's windup.** The boss pass saw 279 boss windups; `music.duck(true)` was called 4 times in all, and `music.muffle` never changed.
5. **[design] Fights with no track of their own:**
   - all 10 minis: the great hound, spider, golem, forgemaster, lampreeve, berserker, lancer, propman, ploughman and homunculus;
   - Bracken Wood's boss, the Queen, who keeps the level theme.
6. **[bug] Two windups were silent in real play:** the Roc's `shedTell` on 1 of its 6 uses, the Archmage's `swipeTell` on 1 of 38.
7. **[bug] The plunge starts silent** for the knight, the paladin, the freebooter and the Death Knight; the pyromancer's has a puff. It is only heard when it lands.
8. **[design] Voice levels.** The median render is -34.1 dB RMS over 509 renders, and nothing is more than 9 dB louder. These sit 15-17 dB under it:
   - footsteps;
   - the snow landing;
   - the skid;
   - the flesh release;
   - the swing whoosh (`swingUp`).

   The kite's death voice renders silence.
9. **[bug, low] The tell voice was called twice within 30 ms 89 times**, when two windups start together and double the sound. `gateDrop` and `gateLand` did the same 21 times each, both walls of an ambush dropping on the same frame. The `skid` (679) and `puff` (332) counts come mostly from the harness bots turning every frame and are not a finding.
10. **[ok] Things that hold:**
    - No two creatures in the same level share an identical hurt or death voice.
    - Every scripted pickup, prop and menu event was heard.
    - Every hero's swing, dodge, hurt and death has a voice.
    - Every hurt and death of the 118 creatures and bosses played a sound.

**Counts:**
- 2,565 creature events audited (windups, blows, hurts, deaths) across 85 foes, 23 bosses and 10 minis;
- 37 of them silent: the 2 windups above, and 35 blow modes whose sound comes from their tell or their impact rather than from entering the mode;
- 0 shared-voice groups;
- 516 voice renders (5 have no voice: the training post, hay bale and lantern bearer; 2 render silence: `foeStep` and the kite's death);
- 67 music files decoded.

## What could not be measured

- **Masking in the real mix.** Voices were rendered dry and alone. How loud one is under a playing track was not measured, only whether the music ducks (finding 4).
- **Sounds cut off by gain in context.** The labs log SFX calls without playing them (a fast simulation would pile up thousands of oscillators), so a call that fires but is inaudible in play is only caught through the renders and the 30 ms re-trigger check.
- **Three ambushes never triggered in the scripted level pass:** the Hurricane's at column 392, the Lamplit's at 484 and Waymeet's at 184. Their gate and horn sounds are unaudited; the other ambushes all played `gateDrop`, `hornBlast` and `gateLand`.
- **Menus not scripted:** the boss rush screens and the editor.
- **The first full run hung in the voice-render pass.** It was stopped and re-run with one render per voice and a time limit on each; no render timed out in the re-run.

## Tool and how to re-run

- `tools/audit-audio.mjs` instruments the page and drives every pass. It writes `audio-audit.json` to `SCRATCH`, saving before each pass.
- `tools/audit-audio-report.mjs` builds the tables and ranked list from that JSON.

```
SCRATCH=<dir> PORT=5908 node tools/audit-audio.mjs          (or: foes,bosses,heroes ... to run chosen passes)
node tools/audit-audio-report.mjs <dir> <outdir>
```

The raw log is in the session scratchpad, not in git: `C:/Users/danie/AppData/Local/Temp/claude/C--Users-danie-OneDrive-Desktop-Claude-Cowork/a33bc100-61df-41bc-b6c4-648830f76229/scratchpad/audio2/audio-audit.json`.

Counts: 2565 creature events audited (windups, blows, hurts, deaths), 37 of them with no sound; 0 shared-voice groups.

# Audio tables

## Creatures: event x sound

Each cell: events heard / events seen, then the voices that fired on those frames. "windup" = entering a ...Tell mode; "blow" = the mode a tell hands to; "unmarked" = a Tell mode entered while windingUp() was false.

| creature | level | windup | blow | hurt | death | phase | spawn | unmarked Tell modes |
|---|---|---|---|---|---|---|---|---|
| topiary | mage | 13/13 charge, tell, pHurt, heart | 12/12 throwWhoosh, block, pHurt | 6/6 impact, hurtOf, hurtOf:topiary | 1/1 impact, dieOf, dieOf:topiary | - | - |  |
| armour | mage | 11/11 clank, tell, judgement | 11/11 throwWhoosh, heavy, block, pHurt | 8/8 impact, hurtOf, hurtOf:armour, clank | 1/1 impact, dieOf, heavy, judgement | - | - |  |
| piece | wood | 10/10 tell | 10/10 block, pHurt, lightFull | 3/3 impact, hurtOf, hurtOf:piece | 2/2 impact, dieOf, dieOf:piece, pPogo | - | - |  |
| broom | mage | 15/15 rattle, tell, judgement | 15/15 throwWhoosh, pHurt | 3/3 impact, hurtOf, hurtOf:broom | 1/1 impact, dieOf, dieOf:broom | - | - |  |
| mimic | mage | 9/9 charge, tell, impact, hurtOf | 9/9 mawSnap, pHurt, pSlash, swingUp | 7/7 impact, hurtOf, hurtOf:mimic, yelp | 1/1 impact, dieOf, dieOf:mimic | - | - |  |
| imp | mage | 11/11 hiss, tell | 11/11 throwWhoosh, puff | 1/1 impact, hurtOf, hurtOf:imp | - | - | - |  |
| turret | mage | 9/9 lampOn, tell | 9/9 zap, pSlash, swingUp | 5/5 impact, hurtOf, hurtOf:turret | 1/1 impact, dieOf, dieOf:turret | - | - |  |
| scarecrow | fields | 9/9 charge, tell, judgement | 9/9 throwWhoosh, pHurt, parry, heart | 6/6 impact, hurtOf, hurtOf:scarecrow | 1/1 impact, dieOf, dieOf:scarecrow | - | - |  |
| rook | fields | 6/6 caw, tell | 0/6 | - | 1/1 impact, dieOf, dieOf:rook | - | - |  |
| farmhand | fields | 14/14 wightMoan, tell | 14/14 throwWhoosh, block, pHurt, lightFull | 6/6 impact, hurtOf, hurtOf:farmhand | 1/1 impact, dieOf, dieOf:farmhand | - | - |  |
| pumpkin | fields | 18/18 tell, charge, puff, foeNotice | 17/17 mawSnap, block, pHurt, squelch | 4/4 impact, hurtOf, hurtOf:pumpkin | 1/1 impact, dieOf, dieOf:pumpkin | - | - |  |
| marshlight | fields | 6/6 tell | 6/6 zap, pHurt, block | 3/3 impact, hurtOf, hurtOf:marshlight | 1/1 impact, dieOf, dieOf:marshlight, lampOn | - | - |  |
| haunt | fields | 7/7 rattle, tell | 7/7 throwWhoosh, pSlash, swingUp, block | 3/3 impact, hurtOf, hurtOf:haunt | 1/1 impact, dieOf, dieOf:haunt | - | - |  |
| masthead | wood | - | - | - | - | - | - |  |
| swornsword | waymeet | 15/15 charge, tell | 15/15 slash, block, clank, pHurt | 6/6 impact, hurtOf, hurtOf:swornsword | 1/1 poiseBreak, impact, dieOf, dieOf:swornsword | - | - |  |
| hedgeknight | waymeet | 14/14 charge, tell | 14/14 slash, heavy, clank, block | 12/12 impact, hurtOf, hurtOf:hedgeknight, poiseBreak | 1/1 impact, dieOf, dieOf:hedgeknight | - | - |  |
| runner | waymeet | 10/10 tell | 9/9 slash, pHurt, block, lightFull | 4/4 impact, hurtOf, hurtOf:runner | 1/1 impact, dieOf, dieOf:runner | - | - |  |
| crossbow | waymeet | - | - | 5/5 impact, hurtOf, hurtOf:crossbow | 1/1 impact, dieOf, dieOf:crossbow | - | - |  |
| prise | deep | 4/4 rattle, tell, block, pHurt | 4/4 clank, block, pHurt | 10/10 impact, hurtOf, hurtOf:prise, pPogo | 2/2 impact, dieOf, dieOf:prise, pPogo | - | - |  |
| holdfast | deep | - | - | 5/5 impact, hurtOf, hurtOf:holdfast | 1/1 impact, dieOf, dieOf:holdfast | - | - |  |
| clinger | undercrown | - | - | 3/3 impact, hurtOf, hurtOf:clinger | 1/1 impact, dieOf, dieOf:clinger | - | - |  |
| courtier | wood | - | - | - | 3/3 foeNotice | - | - |  |
| assassin | underleaf | 17/17 tell, heard, charge | 17/17 pDodge, slash, pHurt, foeJeer | 3/3 impact, hurtOf, hurtOf:assassin | 1/1 impact, dieOf, dieOf:assassin, puff | - | - |  |
| watch | lamplit | 15/15 charge, tell | 14/14 haft, block, pHurt, heart | 5/5 impact, hurtOf, hurtOf:watch, poiseBreak | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| cutlass | flotilla | 24/24 tell | 23/23 foeSlash, block, pHurt, parry | 3/3 impact, hurtOf, hurtOf:cutlass | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| boarder | flotilla | - | - | 4/4 impact, hurtOf, hurtOf:boarder, poiseBreak | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| marine | flotilla | 10/10 tell | 10/10 bowShot | 3/3 impact, hurtOf, hurtOf:marine | 1/1 impact, dieOf, dieOf:marine | - | - |  |
| bosun | flotilla | 14/14 charge, tell, fish | 13/13 heavy, block, pHurt, parry | 5/5 impact, hurtOf, hurtOf:bosun, poiseBreak | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| lookout | reef | - | - | 3/3 impact, hurtOf, hurtOf:lookout | 1/1 impact, dieOf, dieOf:lookout | - | - |  |
| sailor | reef | 17/17 charge, tell | 17/17 slash, block, pHurt, lightFull | 4/4 impact, hurtOf, hurtOf:sailor | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| netter | longwater | 1/1 tell | 1/1 throwWhoosh, ropeHaul | 2/2 impact, hurtOf, hurtOf:netter | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| urchin | longwater | - | - | 6/6 impact, hurtOf, hurtOf:urchin, pPogo | 2/2 impact, dieOf, dieOf:urchin, pPogo | - | - |  |
| angler | longwater | 3/3 snort, tell, splash | 3/3 slash, pHurt | 10/10 impact, hurtOf, hurtOf:angler, pPogo | 2/2 impact, dieOf, dieOf:angler, pPogo | - | - |  |
| petrel | reef | - | - | 3/3 impact, hurtOf, hurtOf:petrel | 1/1 impact, dieOf, dieOf:petrel | - | - |  |
| turtle | marsh | 14/14 snort, tell | 14/14 slash, block, pHurt, heart | - | - | - | - |  |
| eel | marsh | - | - | - | - | - | - |  |
| heronfoe | marsh | 13/13 tell | 13/13 slash, block, pHurt, lightFull | 3/3 impact, hurtOf, hurtOf:heronfoe | 1/1 impact, dieOf, dieOf:heronfoe | - | - |  |
| crab | longwater | 10/10 tell, pSlash, swingUp, heavy | 10/10 clank, pSlash, swingUp | 1/1 impact, hurtOf, hurtOf:crab, fish | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| scout | longwater | - | - | 3/3 impact, hurtOf, hurtOf:scout | - | - | - |  |
| siren | longwater | - | - | 4/4 splash, impact, hurtOf, hurtOf:siren | - | - | - |  |
| tideguard | longwater | 17/17 charge, tell | 17/17 slash, block, clank, pHurt | 5/5 impact, hurtOf, hurtOf:tideguard, clank | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| soldier | kings | 18/18 charge, tell, puff, judgement | 17/17 slash, clank, pHurt, block | 2/2 impact, hurtOf, hurtOf:soldier, poiseBreak | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| javelin | kings | - | - | 3/3 impact, hurtOf, hurtOf:javelin | 1/1 impact, dieOf, dieOf:javelin, gobDie | - | - |  |
| heavy | kings | - | - | 17/17 impact, hurtOf, hurtOf:heavy, clank | 1/1 clank, heavy, judgement, impact | - | - |  |
| sweep | storm | - | - | 3/3 impact, hurtOf, hurtOf:sweep | 1/1 impact, dieOf, dieOf:sweep | - | - |  |
| stormshaman | kings | - | - | 5/5 impact, hurtOf, hurtOf:stormshaman | 2/2 impact, dieOf, dieOf:stormshaman | - | - |  |
| crow | wood | - | - | - | 1/2 impact, dieOf, dieOf:crow | - | - |  |
| horn | moor | - | - | 3/3 impact, hurtOf, hurtOf:horn | 1/1 impact, dieOf, dieOf:horn | - | - |  |
| shardling | spire | - | - | 5/5 impact, hurtOf, hurtOf:shardling, pPogo | 2/2 impact, dieOf, dieOf:shardling, crack | - | - |  |
| suncatcher | wood | 4/4 tell, charge, hiss, golemChime | 4/4 throwWhoosh, golemShatter, hiss, crack | - | - | - | - |  |
| sentry | spire | - | - | 4/4 impact, hurtOf, hurtOf:sentry, pPogo | 2/2 impact, dieOf, dieOf:sentry, pPogo | - | - |  |
| hearthgob | storm | - | - | 3/3 impact, hurtOf, hurtOf:hearthgob | 1/1 impact, dieOf, dieOf:hearthgob, gobDie | - | - |  |
| cutter | hanging | - | - | 3/3 impact, hurtOf, hurtOf:cutter | 1/1 impact, dieOf, dieOf:cutter, gobDie | - | - |  |
| snuffer | hanging | 7/7 tell, judgement | 7/7 slash, pHurt, foeJeer, parry | 3/3 impact, hurtOf, hurtOf:snuffer | 1/1 impact, dieOf, dieOf:snuffer | - | - |  |
| sailer | moor | - | - | 3/3 impact, hurtOf, hurtOf:sailer | 1/1 impact, dieOf, dieOf:sailer | - | - |  |
| miner | spire | 19/19 gobHurt, tell, pSlash, swingUp | 18/18 slash, pHurt, block, foeJeer | 3/3 impact, hurtOf, hurtOf:miner, yelp | 1/1 impact, dieOf, dieOf:miner | - | - |  |
| bat | spire | - | - | - | 2/2 impact, dieOf, dieOf:bat, parry | - | - |  |
| kite | spire | - | - | - | 1/1 crack, impact, dieOf, dieOf:kite | - | - |  |
| hare | moor | - | - | 4/4 impact, hurtOf, hurtOf:hare | 1/1 impact, dieOf, dieOf:hare, yelp | - | - |  |
| wight | lamplit | - | - | 3/3 impact, hurtOf, hurtOf:wight | 1/1 impact, dieOf, dieOf:wight, hiss | - | - |  |
| grub | spire | - | - | 6/6 impact, hurtOf, hurtOf:grub, pPogo | 2/2 impact, dieOf, dieOf:grub, grubDie | - | - |  |
| rockgoblin | scree | - | - | 3/3 impact, hurtOf, hurtOf:rockgoblin | 1/1 impact, dieOf, dieOf:rockgoblin, gobDie | - | - |  |
| troll | scree | 12/12 snort, tell | 11/11 slash, pHurt, heavy, snort | 4/4 impact, hurtOf, hurtOf:troll, poiseBreak | 1/1 heavy, judgement, impact, dieOf | - | - |  |
| sprig | wood | 17/17 tell, pSlash, swingUp, pEffort | 9/17 pHurt, foeJeer, pSlash, swingUp | 3/3 impact, hurtOf, hurtOf:sprig, yelp | 1/1 impact, dieOf, dieOf:sprig, gobDie | - | - |  |
| shield | wood | 13/13 tell | 3/12 pHurt, block, foeJeer | 3/3 impact, hurtOf, hurtOf:shield, poiseBreak | 1/1 impact, dieOf, dieOf:shield, heavy | - | - |  |
| spit | wood | - | - | 3/3 impact, hurtOf, hurtOf:spit | 1/1 impact, dieOf, dieOf:spit, squelch | - | - |  |
| wasp | wood | - | - | - | 1/1 impact, dieOf, dieOf:wasp, chitter | - | - |  |
| thorn | wood | - | - | 4/4 impact, hurtOf, hurtOf:thorn | 1/1 impact, dieOf, dieOf:thorn, gobDie | - | - |  |
| archer | marsh | - | - | 3/3 impact, hurtOf, hurtOf:archer | 1/1 impact, dieOf, dieOf:archer, gobDie | - | - |  |
| hopper | wood | - | - | 3/3 impact, hurtOf, hurtOf:hopper | 1/1 impact, dieOf, dieOf:hopper, ribbit | - | - |  |
| sapper | stockade | - | - | 3/3 impact, hurtOf, hurtOf:sapper | 2/2 impact, dieOf, dieOf:sapper, gobDie | - | - |  |
| brute | stockade | - | - | 4/4 impact, hurtOf, hurtOf:brute | 1/1 poiseBreak, impact, dieOf, dieOf:brute | - | - |  |
| hound | stockade | - | - | 3/3 impact, hurtOf, hurtOf:hound, poiseBreak | 1/1 impact, dieOf, dieOf:hound, yelp | - | - |  |
| sporeling | spore | - | - | 3/3 impact, hurtOf, hurtOf:sporeling | 1/1 impact, dieOf, dieOf:sporeling, squelch | - | - |  |
| lurker | wood | - | - | 3/3 impact, hurtOf, hurtOf:lurker | 1/1 impact, dieOf, dieOf:lurker, squelch | - | - |  |
| drone | spore | - | - | - | 3/3 crack, pHurt | - | - |  |
| shaman | spore | - | - | 4/4 impact, hurtOf, hurtOf:shaman, foeGasp | 1/1 impact, dieOf, dieOf:shaman, squelch | - | - |  |
| spitcap | spore | - | - | 3/3 impact, hurtOf, hurtOf:spitcap | 1/1 impact, dieOf, dieOf:spitcap, puff | - | - |  |
| weaver | spore | - | - | 3/3 impact, hurtOf, hurtOf:weaver | 1/1 impact, dieOf, dieOf:weaver, hiss | - | - |  |
| gill | spore | - | - | - | - | - | - |  |
| thief | kings | - | - | 3/3 impact, hurtOf, hurtOf:thief | 1/1 impact, dieOf, dieOf:thief, gobDie | - | - |  |
| pike | stockade | - | - | 3/3 impact, hurtOf, hurtOf:pike, poiseBreak | 1/1 impact, dieOf, dieOf:pike, gobDie | - | - |  |
| master | wood | - | - | 20/20 impact, hurtOf, hurtOf:master, poiseBreak | 1/1 impact, dieOf, dieOf:master, gobDieLow | - | - |  |
| harpy | scree | - | - | - | 1/1 impact, dieOf, dieOf:harpy, screech | - | - |  |
| goat | scree | - | - | 5/5 impact, hurtOf, hurtOf:goat, pPogo | 2/2 impact, dieOf, dieOf:goat, goatCry | - | - |  |
| **queen** | wood | - | - | 12/12 impact, hurtOf, hurtOf:queen, roar | 1/1 impact, dieOf, dieOf:queen, heavy | 1/1 impact, hurtOf, hurtOf:queen, roar | - |  |
| **frog** | marsh | 1/1 buzz, tell | 1/1 tongue | 8/8 impact, hurtOf, hurtOf:frog, poiseBreak | 1/1 impact, dieOf, dieOf:frog, heavy | 1/1 impact, hurtOf, hurtOf:frog, roar | - |  |
| **chief** | stockade | - | - | - | - | - | - |  |
| **mother** | spore | - | - | - | - | - | - |  |
| **king** | kings | 3/3 charge, tell, puff | 1/2 heavy | 14/14 impact, hurtOf, hurtOf:king, heavy | 1/1 impact, dieOf, dieOf:king, gobDieLow | 2/2 impact, hurtOf, hurtOf:king, heavy | - |  |
| **ram** | scree | - | - | 12/12 impact, hurtOf, hurtOf:ram, poiseBreak | 1/1 impact, dieOf, dieOf:ram, gobDieLow | 1/1 impact, hurtOf, hurtOf:ram, roar | - |  |
| **owl** | hanging | 11/11 tell, buzz, screech, pJump | 11/11 throwWhoosh, screech, leap, pSlash | 19/19 impact, hurtOf, hurtOf:owl, roar | 1/1 impact, dieOf, dieOf:owl, gobDieLow | 1/1 impact, hurtOf, hurtOf:owl, roar | - |  |
| **roc** | spire | 5/6 queenShriek, tell, puff, clank | 5/6 charge, golemThrow, clank | 20/20 impact, hurtOf, hurtOf:roc, crack | 1/1 queenShriek, sting, golemChime, impact | 1/1 impact, hurtOf, hurtOf:roc, queenShriek | - |  |
| **windcaller** | moor | 1/1 callerChant, gasp, tell | 1/1 buzz | 14/14 impact, hurtOf, hurtOf:windcaller, pPogo | 1/1 impact, dieOf, dieOf:windcaller, gobDieLow | 1/1 impact, hurtOf, hurtOf:windcaller, callerChant | - |  |
| **lance** | storm | 34/34 tell, snort, skid, pSlash | 34/34 clank, slash, pHurt, heavy | 28/28 impact, hurtOf, hurtOf:lance, roar | 1/1 impact, dieOf, dieOf:lance, gobDieLow | 1/1 impact, hurtOf, hurtOf:lance, roar | - |  |
| **gqueen** | crown | 10/10 tell, snort, charge, bellow | 10/10 slash, forgeHammer, heavy, crack | 40/40 impact, hurtOf, hurtOf:gqueen, heavy | 1/1 impact, dieOf, dieOf:gqueen, gobDieLow | 2/2 impact, hurtOf, hurtOf:gqueen, bellow | - |  |
| **herald** | longwater | 24/24 tell, snort, charge | 24/24 slash, splash | - | - | - | - |  |
| **reefmaw** | reef | 13/13 tell, snort, charge, pSlash | 13/13 mawRoar, pHurt, mawSnap, pSlash | 35/35 impact, hurtOf, hurtOf:reefmaw, poiseBreak | 1/1 impact, dieOf, dieOf:reefmaw, gobDieLow | 2/2 impact, hurtOf, hurtOf:reefmaw, boreRoar | - |  |
| **quarter** | flotilla | 25/25 tell, charge, pSlash, swingUp | 23/25 crack, foeSlash, pSlash, swingUp | 20/20 impact, hurtOf, hurtOf:quarter, poiseBreak | - | 2/2 pJump, impact, hurtOf, hurtOf:quarter | - |  |
| **captain** | hurricane | 10/10 tell, charge, grapple, fuse | 10/10 foeSlash, pHurt, crack, ropeHaul | 45/45 impact, hurtOf, hurtOf:captain, whistleCall | 1/1 impact, dieOf, dieOf:captain, gobDieLow | 2/2 impact, hurtOf, hurtOf:captain, whistleCall | - |  |
| **tollmaster** | lamplit | 10/10 tell, callerChant, charge, impact | 6/10 pSlash, swingUp, gutter, heavy | 20/20 impact, hurtOf, hurtOf:tollmaster, clank | - | 2/2 impact, hurtOf, hurtOf:tollmaster, gateDrop | - |  |
| **grandmother** | underleaf | 7/7 tell, snort, charge, heard | 7/7 slash, throwWhoosh, puff, heard | 23/23 impact, hurtOf, hurtOf:grandmother, poiseBreak | 1/1 impact, dieOf, dieOf:grandmother, gobDieLow | 1/1 impact, hurtOf, hurtOf:grandmother, roar | - |  |
| **drownedking** | deep | 2/2 rattle, tell | 1/1 anchorSwing, pHurt | 57/57 impact, hurtOf, hurtOf:drownedking, pPogo | 1/1 impact, dieOf, dieOf:drownedking, gobDieLow | 1/1 impact, hurtOf, hurtOf:drownedking, roar | - |  |
| **kraken** | causeway | 28/28 tell, charge, anchorSwing, ropeHaul | 28/28 throwWhoosh, waveCrash, spit, hiss | 18/18 hurtOf, hurtOf:krakenarm, bellow, crack | - | 2/2 hurtOf, hurtOf:krakenarm, crack, bellow | - |  |
| **closedhelm** | waymeet | 6/6 charge, tell | 6/6 parry, heavy, slash, golemShatter | 21/21 impact, hurtOf, hurtOf:closedhelm, roar | 1/1 impact, dieOf, dieOf:closedhelm, gobDieLow | 1/1 impact, hurtOf, hurtOf:closedhelm, roar | - |  |
| **prince** | undercrown | 4/4 tell, charge, snort, gasp | 4/4 foeSlash, crack, stone, hiss | 27/27 impact, hurtOf, hurtOf:prince, crack | 1/1 impact, dieOf, dieOf:prince, gobDieLow | 1/1 impact, hurtOf, hurtOf:prince, roar | - |  |
| **strawking** | fields | 19/19 tell, charge, caw, boom | 19/19 throwWhoosh, slash, caw, golemStomp | 58/58 impact, hurtOf, hurtOf:strawking, puff | 1/1 impact, dieOf, dieOf:strawking, gobDieLow | 4/4 bellow, boom, charge, pyreBoom | - |  |
| **archmage** | mage | 37/38 tell, charge, snort, bellow | 37/37 zap, thunder, heavy, throwWhoosh | 44/45 impact, hurtOf, hurtOf:archmage, pPogo | - | 4/4 splash, waveCrash, zap, boom | - |  |
| **greathound** | kings | 1/1 charge, tell | 1/1 bark | 8/8 impact, hurtOf, hurtOf:greathound, poiseBreak | 1/1 impact, dieOf, dieOf:greathound, yelp | 1/1 poiseBreak, impact, hurtOf, hurtOf:greathound | - |  |
| **spider** | hanging | 1/1 hiss, tell | 1/1 hiss, pSlash, swingUp, heavy | 7/7 impact, hurtOf, hurtOf:spider, poiseBreak | 10/10 hiss, roar, impact, dieOf | - | - |  |
| **golem** | spire | 16/16 tell, golemChime, buzz, hiss | 16/16 golemStomp, golemThrow, crack, clank | - | - | - | - |  |
| **forgemaster** | crown | 11/11 tell, charge, hiss, rattle | 10/11 forgeSteam, bellow, heavy, rattle | 35/35 impact, hurtOf, hurtOf:forgemaster, clank | 1/1 heavy, impact, dieOf, dieOf:forgemaster | 1/1 clank, poiseBreak, impact, hurtOf | - |  |
| **lampreeve** | lamplit | 1/1 charge, tell | 1/1 pole, parry | 8/8 impact, hurtOf, hurtOf:lampreeve, poiseBreak | 1/1 impact, dieOf, dieOf:lampreeve, gobDieLow | - | - |  |
| **berserker** | underleaf | 1/1 charge, tell | - | 6/6 impact, hurtOf, hurtOf:berserker, clank | 3/3 roar, crack, heavy, impact | - | - |  |
| **lancer** | waymeet | 3/3 charge, tell, snort | 3/3 thump, slash, roar, pHurt | 25/25 impact, hurtOf, hurtOf:lancer, thump | 3/3 roar, impact, dieOf, dieOf:lancer | 1/1 impact, hurtOf, hurtOf:lancer, roar | - |  |
| **propman** | undercrown | - | - | 2/2 impact, hurtOf, hurtOf:propman | 8/8 roar, poiseBreak, impact, dieOf | - | - |  |
| **ploughman** | fields | 2/2 tell, snort, charge | 2/2 boreRoar, throwWhoosh, parry | 20/20 impact, hurtOf, hurtOf:ploughman, poiseBreak | 1/1 impact, dieOf, dieOf:ploughman, gobDieLow | 1/1 boreRoar | - |  |
| **homunculus** | mage | 4/4 tell, charge, golemChime | 4/4 throwWhoosh, pHurt, leap, block | 37/38 impact, hurtOf, hurtOf:homunculus, poiseBreak | 1/1 impact, dieOf, dieOf:homunculus, gobDieLow | 1/1 impact, hurtOf, hurtOf:homunculus, wightMoan | - |  |

## Windups outside windingUp() (static: a mode that lands nothing, whose forced chain lands a blow within three hops)

| function | mode | leads to | main.js line | named in windingUp |
|---|---|---|---|---|
| updateMasthead | climb | drop | 6967 | no |
| updateHomunculus | flyUp | dive | 8017 | no |
| updateHerald | glide | sweepTell | 9255 | no |
| updateChief | crouch | leap | 9334 | no |
| updateChief | whirlWind | whirl | 9339 | no |
| updateChief | reach | lunge | 9340 | no |
| updateChief | bashWind | bash | 9344 | no |
| updateOwl | riseUp | plunge | 9780 | no |
| updateOwl | stalk | plunge | 9789 | no |
| updateCourtier | walk | clawTell | 10110 | no |
| updateCourtier | claw | clawTell | 10115 | no |
| updatePrise | snap | reachTell | 10162 | no |
| updatePrise | walk | reachTell | 10168 | no |
| updateHoldfast | spent | wait | 10195 | no |
| updateDrownedKing | diveUp | dive | 10672 | no |
| updateGolem | drink | counter | 10977 | no |
| updateGQueen | gPerch | gDrop | 11192 | no |
| updateGQueen | shadow | sweepTell | 11198 | no |
| updateRoc | shriekGo | shriek | 11253 | no |
| updateRoc | rakeGo | rake | 11254 | no |
| updateAssassin | behind | stabTell | 11714 | no |
| updateAssassin | lurk | lunge | 11724 | no |
| updateBerserker | wake | run | 11744 | no |
| updateBerserker | stumble | run | 11760 | no |
| updateRam | rear | charge | 12155 | no |

## Heroes: each scripted action and the voices in its window

| hero | action | voices |
|---|---|---|
| knight | walk | crack, boom |
| knight | jump | pJump |
| knight | blow 1 | pSlash, swingUp, pEffort |
| knight | blow 2 | NONE |
| knight | blow 3 | pSlash, swingUp |
| knight | heavy (atk held) | pSlash, swingUp, heavy, pEffort, charge, tell, shieldScrape |
| knight | dodge | NONE |
| knight | dash attack | pDodge |
| knight | plunge | pJump, thud |
| knight | rising cut (up + blow) | pSlash, swingUp, pJump |
| knight | low sweep (down + blow) | pSlash, swingUp, skid |
| knight | block raised | NONE |
| knight | skill F: risingCut | slash, pPogo |
| knight | skill G: lunge | slash, throwWhoosh |
| knight | resolve to full (a blow at 96) | pSlash, swingUp, pEffort |
| knight:hold | sprig hold | foeNotice, tell, lightFull, block |
| knight:tap | sprig tap | foeNotice, tell, pHurt |
| knight:take | sprig take | foeNotice, tell, pHurt, foeJeer |
| knight:die | sprig die | foeNotice, heart, tell |
| knight:die | dead | pHurt, pDie, foeJeer, thud |
| pyro | walk | NONE |
| pyro | jump | pJump |
| pyro | blow 1 | pSlash, swingUp, pEffort |
| pyro | blow 2 | NONE |
| pyro | blow 3 | pSlash, swingUp |
| pyro | heavy (atk held) | pSlash, swingUp, heavy, charge, tell, crack |
| pyro | dodge | pDodge |
| pyro | dash attack | pSlash, swingUp, pEffort |
| pyro | plunge | pJump, puff, crack, thud |
| pyro | rising cut (up + blow) | pSlash, swingUp, pJump |
| pyro | low sweep (down + blow) | pSlash, swingUp, skid |
| pyro | block raised | NONE |
| pyro | skill F: vent | heavy, puff |
| pyro | skill G: meteor | stormChant, heavy, puff |
| pyro | heat to full (a blow at 96) | pSlash, lightFull, heatFull, swingUp, pEffort |
| pyro | jet (block held) | pyre |
| pyro:hold | sprig hold | foeNotice, tell, impact, hurtOf, hurtOf:sprig, dieOf, dieOf:sprig, gobDie, pyreBoom |
| pyro:tap | sprig tap | foeNotice, tell, pHurt, foeJeer |
| pyro:take | sprig take | foeNotice, tell, pHurt, foeJeer, skid |
| pyro:die | sprig die | foeNotice, heart, tell |
| pyro:die | dead | pHurt, pDie, foeJeer, thud |
| paladin | walk | NONE |
| paladin | jump | pJump |
| paladin | blow 1 | pSlash, swingUp, pEffort |
| paladin | blow 2 | NONE |
| paladin | blow 3 | NONE |
| paladin | heavy (atk held) | pSlash, swingUp, charge, tell, heavy, thud, stone |
| paladin | dodge | pDodge, clank |
| paladin | dash attack | pSlash, swingUp |
| paladin | plunge | pJump, thud, hammerfall, medal |
| paladin | rising cut (up + blow) | pSlash, swingUp, clank, pJump |
| paladin | low sweep (down + blow) | pSlash, swingUp, thud, skid |
| paladin | block raised | block |
| paladin | skill F: consecrate | mend, heavy |
| paladin | skill G: lightLance | lightFull, aegis |
| paladin | light to full (a blow at 96) | pSlash, swingUp |
| paladin | aegis (block held) | block |
| paladin:hold | sprig hold | foeNotice, tell, impact, hurtOf, hurtOf:sprig, yelp, block |
| paladin:tap | sprig tap | foeNotice, tell, buzz, pHurt, foeJeer |
| paladin:take | sprig take | foeNotice, tell, pHurt, skid |
| paladin:die | sprig die | foeNotice, heart, tell |
| paladin:die | dead | pHurt, pDie, foeJeer, thud |
| pirate | walk | NONE |
| pirate | jump | pJump |
| pirate | blow 1 | pSlash, swingUp |
| pirate | blow 2 | NONE |
| pirate | blow 3 | pSlash, swingUp |
| pirate | heavy (atk held) | pSlash, swingUp, heavy, charge, tell, crack, clank |
| pirate | dodge | pDodge |
| pirate | dash attack | pSlash, swingUp, pEffort |
| pirate | plunge | pJump, thud |
| pirate | rising cut (up + blow) | pSlash, swingUp, pJump |
| pirate | low sweep (down + blow) | pSlash, swingUp, skid |
| pirate | block raised | pSlash |
| pirate | skill F: grapeshot | crack, heavy |
| pirate | skill G: broadside | crack, heavy, skid |
| pirate | pistol (atk held, loaded) | pSlash, swingUp, charge, tell, crack, heavy, clank |
| pirate:hold | sprig hold | foeNotice, tell, pSlash, impact, hurtOf, hurtOf:sprig, yelp, clank |
| pirate:tap | sprig tap | foeNotice, tell, pHurt, foeJeer |
| pirate:take | sprig take | foeNotice, tell, pHurt, foeJeer, skid |
| pirate:die | sprig die | foeNotice, heart, tell |
| pirate:die | dead | pHurt, pDie, foeJeer, thud |
| reaper | walk | NONE |
| reaper | jump | pJump |
| reaper | blow 1 | pSlash, swingUp, pEffort |
| reaper | blow 2 | NONE |
| reaper | blow 3 | NONE |
| reaper | heavy (atk held) | pSlash, swingUp, charge, tell, heavy, crack, stone, dkPlant |
| reaper | dodge | NONE |
| reaper | dash attack | hiss, pDodge |
| reaper | plunge | pJump, thud, squelch |
| reaper | rising cut (up + blow) | pSlash, swingUp, pJump, crack |
| reaper | low sweep (down + blow) | pSlash, swingUp, pEffort, skid |
| reaper | block raised | dkWard, dkNova |
| reaper | skill F: raiseDead | buzz |
| reaper | skill G: harvestMoon | squelch, puff |
| reaper | harvest to full, F held | judgement, squelch, dkSurge |
| reaper | ward (block held) | dkWard, dkNova |
| reaper:hold | sprig hold | foeNotice, tell, dkWard, dkWardHit, impact, dieOf, dieOf:sprig, gobDie, dkNova |
| reaper:tap | sprig tap | foeNotice, tell, pHurt, foeJeer |
| reaper:take | sprig take | foeNotice, tell, pHurt, foeJeer, skid |
| reaper:die | sprig die | foeNotice, heart, tell |
| reaper:die | dead | pHurt, pDie, foeJeer, thud |

### Hero events (every one seen in the hero pass)

| hero event | heard / seen | voices |
|---|---|---|
| knight jump | 10/10 | pJump, pSlash, swingUp, slash, pPogo, pHurt, foeJeer, pDie |
| knight land | 1/10 | thud |
| knight swing | 6/6 | pSlash, swingUp, pEffort, heavy, pJump, skid |
| knight dodge | 1/1 | pDodge |
| knight plunge | 0/1 |  |
| knight block | 6/9 | tell, judgement, parry |
| knight hurt | 6/6 | pHurt, foeJeer, pDie |
| knight die | 1/1 | pHurt, pDie, foeJeer |
| pyro jump | 10/10 | pJump, pSlash, swingUp, pHurt, foeJeer, pDie |
| pyro land | 4/10 | thud, skid |
| pyro swing | 7/7 | pSlash, swingUp, pEffort, heavy, pJump, skid, lightFull, heatFull |
| pyro dodge | 1/1 | pDodge |
| pyro plunge | 1/1 | puff |
| pyro hurt | 7/7 | pHurt, foeJeer, pDie |
| pyro die | 1/1 | pHurt, pDie, foeJeer |
| paladin jump | 9/9 | pJump, pSlash, swingUp, clank, buzz, pHurt, foeJeer, pDie |
| paladin land | 4/9 | thud, hammerfall, medal, skid |
| paladin swing | 6/6 | pSlash, swingUp, pEffort, clank, pJump, thud, skid |
| paladin dodge | 1/1 | pDodge, clank |
| paladin plunge | 0/1 |  |
| paladin hurt | 6/6 | buzz, pHurt, foeJeer, pDie |
| paladin die | 1/1 | pHurt, pDie, foeJeer |
| pirate jump | 13/13 | pJump, pSlash, swingUp, pHurt, foeJeer, pDie |
| pirate land | 4/13 | thud, skid |
| pirate swing | 7/7 | pSlash, swingUp, heavy, pEffort, pJump, skid |
| pirate dodge | 1/1 | pDodge |
| pirate plunge | 0/1 |  |
| pirate hurt | 10/10 | pHurt, foeJeer, pDie |
| pirate die | 1/1 | pHurt, pDie, foeJeer |
| reaper jump | 10/10 | pJump, pSlash, swingUp, pHurt, foeJeer, pDie |
| reaper land | 4/10 | thud, squelch, skid |
| reaper swing | 4/4 | pSlash, swingUp, pEffort, pJump, skid |
| reaper dodge | 1/1 | hiss, pDodge |
| reaper plunge | 0/1 |  |
| reaper hurt | 7/7 | pHurt, foeJeer, pDie |
| reaper die | 1/1 | pHurt, pDie, foeJeer |

Swing voices per hero: knight = heavy/pEffort/pJump/pSlash/skid/swingUp; pyro = heatFull/heavy/lightFull/pEffort/pJump/pSlash/skid/swingUp; paladin = clank/pEffort/pJump/pSlash/skid/swingUp/thud; pirate = heavy/pEffort/pJump/pSlash/skid/swingUp; reaper = pEffort/pJump/pSlash/skid/swingUp

## Pickups

| name | level / state | voices |
|---|---|---|
| coin | wood | coinUp |
| coin run | wood | coinUp |
| heart | wood | heart |
| silver | wood | medal, sting |
| relic | wood | coinUp, sting, medal |
| key | storm | coin, medal |
| stray (quest) | wood | coin, sting |
| checkpoint | wood | sting |

## Props

| t | level / state | voices |
|---|---|---|
| CRATE | wood | coinUp, pSlash, swingUp, pEffort, crack, heavy |
| barrel | stockade | sting, pSlash, swingUp, stone, pJump |
| keg | flotilla | pSlash, swingUp, fuse, boom, pEffort, fish, clank, pJump |
| puffball | spore | pSlash, swingUp, crack, pEffort, coinUp, pJump |
| door | kings | puff, pSlash, swingUp, pJump |
| doorway | hanging | pSlash, swingUp, pJump, coinUp |
| gate | wood | text, menuClose, pSlash, swingUp, pJump |
| lockgate | storm | clank, forgeHammer, pSlash, swingUp, pJump |
| lever | kings | puff, pSlash, swingUp, pEffort, stone, pJump |
| crank | stockade | pSlash, swingUp, stone, pEffort, pJump |
| winch | crown | puff, text, menuClose, pSlash, swingUp, clank, gateLift, ui, pJump |
| bell | kings | puff, pSlash, swingUp, pEffort, clank, pJump |
| seabell | reef | text, menuClose, pSlash, swingUp, sting, seaBell, pEffort, coinUp, pJump |
| tidebell | causeway | thunder, pSlash, swingUp, seaBell, clank, pJump |
| knell | causeway | pSlash, swingUp, seaBell, clank, pJump |
| cage | stockade | pSlash, swingUp, clank, crack, coinUp, pJump |
| cargo | hurricane | gateDrop, hornBlast, gateLand, fish, pSlash, swingUp, thud, pEffort, pJump, wave, thunder |
| rack | stockade | pSlash, swingUp, clank, pEffort, pJump |
| torch | stockade | pSlash, swingUp, pJump |
| brazier | stockade | gateDrop, hornBlast, gateLand, pSlash, swingUp, pEffort, crack, pJump, thud, foeNotice, bark, pHurt |
| well | underleaf | pSlash, swingUp, pEffort, splash, stone, ui, pJump |
| sluice | marsh | pSlash, swingUp, pEffort, stone, fish, pJump |
| throne | marsh | pSlash, swingUp, pJump |
| window | underleaf | coinUp, ui, lampOn, pSlash, swingUp, pEffort, pJump |
| bridge | stockade | pSlash, swingUp, pJump, coinUp |
| cart | stockade | text, menuClose, pSlash, swingUp, clank, stone, rattle, pJump |
| plank | flotilla | fish, pSlash, swingUp, thud, pJump |
| cannon | flotilla | pSlash, swingUp, pEffort, boom, fish, pJump, coinUp |
| catapult | stockade | pSlash, swingUp, clank, pEffort, pJump |
| capstan | reef | pSlash, swingUp, fish |
| pump | hurricane | thunder, crumble, strikeTell, rumble, pSlash, swingUp, clank, coinUp, pJump, wave, heavy |
| davit | hurricane | thunder, crumble, pSlash, swingUp, clank, ropeHaul, pEffort, pJump, wave |
| minerlamp | undercrown | fish, pSlash, swingUp, pJump, coin, sting, coinUp |
| timber | undercrown | pSlash, swingUp, pEffort, crack, stone, heavy, fish, pJump, coinUp |
| firepit | kings | puff, pSlash, swingUp, pEffort, pHurt, skid |
| chainpost | kings | puff, pSlash, swingUp, clank, pEffort, pJump |
| dropcage | kings | puff, pHurt, coinUp, pSlash, swingUp, pJump |
| plate | kings | puff, pSlash, swingUp, stone, crack, heavy, pJump |
| weight | storm | pSlash, swingUp, clank, crack, pEffort, puff, heavy, stone, pJump |
| mirror | spire | pSlash, swingUp, clank, spark, pJump, coinUp |
| anvil | crown | pSlash, swingUp, pEffort, puff, pJump, rattle |
| hammer | crown | pSlash, swingUp, puff, pEffort, pJump |
| boiler | crown | rattle, puff, pSlash, swingUp, clank, pEffort, pJump |
| rockfall | scree | pSlash, swingUp, coinUp, stone, pJump, crumble |
| deadfall | hanging | pSlash, swingUp, pEffort, pJump |
| nest | spore | pSlash, swingUp, puff, pHurt, pJump |
| vent | spore | pSlash, swingUp, pEffort, pJump |
| glowbud | spore | pSlash, swingUp, sting, pJump, coinUp |
| croppole | fields | pSlash, swingUp, stone, pEffort, pJump |
| thresher | fields | pSlash, swingUp, pEffort, coinUp, pJump |
| treehouse | marsh | fish, pSlash, swingUp, pJump |
| towertop | stockade | pSlash, swingUp, pJump, coinUp |

## Menus

| name | level / state | voices |
|---|---|---|
| title: down, up, confirm | map | ui, uiSel |
| play: pause opens the menu | menu | menuOpen |
| menu: down, up | menu | ui |
| menu: pause closes it | play | menuClose |
| talents (q): open, down, close | play | menuOpen, ui, menuClose |
| map: right, left, confirm | map | ui |
| bestiary: open, down, close | play | ui |
| herocard: confirm | play | levelStart, uiSel |
| sign: talk opens, talk closes | talk | text, menuClose |
| store (shop level): confirm | play | uiSel, menuOpen, equip, ui |

## Levels: what plays on the way in and at each ambush

| level | music | on load | ambushes: voices |
|---|---|---|---|
| wood | theme | music.play(theme), levelStart, ambient.set(forest) | gateDrop, hornBlast, gateLand, foeNotice, thud, tell (4 spawned) |
| marsh | theme2 | music.play(theme2), levelStart, ambient.set(rain) | gateDrop, hornBlast, gateLand, thud, foeNotice, thunder (3 spawned) |
| stockade | stockade | music.play(stockade), levelStart, ambient.set(forest), foeStep(false), foeStep(false) | gateDrop, hornBlast, gateLand, thud, foeNotice, bark, tell (4 spawned) |
| spore | cave | music.play(cave), levelStart, ambient.set(hive), cricket, cricket | gateDrop, hornBlast, gateLand, thud, foeNotice (3 spawned) |
| kings | theme3 | music.play(theme3), levelStart, puff, puff, puff, puff, ambient.set(forest), puff, cricket, puff, thud | gateDrop, hornBlast, puff, gateLand, thud, foeNotice, bark (4 spawned) |
| scree | theme4 | music.play(theme4), levelStart, ambient.set(wind), cricket, cricket | gateDrop, hornBlast, gateLand, thud, foeNotice, goatCry, screech, skid (4 spawned) |
| hanging | town | music.play(town), levelStart, bird, cricket | gateDrop, hornBlast, hiss, tell, gateLand, thud, foeNotice, puff (3 spawned) |
| spire | sunspire | music.play(sunspire), levelStart, impact(crystal,false), hurtOf(shardling), hurtOf:shardling, impact(crystal,false), hurtOf(shardling), hurtOf:shardling, shardBristle, impact(crystal,false), dieOf(shardling), dieOf:shardling, crack, impact(crystal,false), dieOf(shardling), dieOf:shardling, crack | caw, gateDrop, hornBlast, gateLand, shardBristle, thud, foeNotice, chitter (4 spawned) |
| moor | adventure | music.play(adventure), levelStart, cricket | foeNotice, hareSqueak, gateDrop, hornBlast, gateLand, thud, caw, goatCry (4 spawned) |
| storm | stormhold | music.play(stormhold), levelStart, cricket | gateDrop, hornBlast, gateLand, thud, foeNotice, tell, forgeHammer (4 spawned) |
| crown | highcrown | music.play(highcrown), levelStart, sting, puff, puff, cricket | - |
| longwater | longwater | music.play(longwater), levelStart, foeNotice(heronfoe), ambient.set(shore) | foeNotice, gateDrop, hornBlast, gateLand, thud, throwWhoosh (4 spawned) |
| reef | reef | music.play(reef), levelStart, seaBell | - |
| flotilla | flotilla | music.play(flotilla), levelStart, ambient.set(ship) | foeNotice, gateDrop, hornBlast, gateLand, fuse, fish, thud, tell (4 spawned) |
| hurricane | hurricane | music.play(hurricane), levelStart | gateDrop, hornBlast, gateLand, wave, fish, caw, tell, thud, foeNotice (3 spawned) / foeNotice, thunder, crumble, tell, bowShot, charge, fish, slash, clank, waveBreak, strikeTell (0 spawned) |
| lamplit | drowned | music.play(drowned), levelStart, sting, ambient.set(drip) | gateDrop, hornBlast, gateLand, thud, foeNotice (4 spawned) / tell, gutter (0 spawned) |
| underleaf | sleepers | music.play(sleepers), levelStart, ambient.set(forest), cricket | - |
| deep | trench | music.play(trench), levelStart, foeNotice(netter), ambient.set(deep), cricket | - |
| causeway | causeway | music.play(causeway), levelStart, ambient.set(shore) | foeNotice, gateDrop, hornBlast, gateLand, fish, thud (4 spawned) |
| waymeet | waymeet | music.play(waymeet), levelStart, ambient.set(town) | gateDrop, hornBlast, gateLand, thud, charge, tell (4 spawned) / tell, slash, charge, hic (0 spawned) |
| undercrown | barrows | music.play(barrows), levelStart, chitter, ambient.set(cave), cricket, impact(flesh,false), hurtOf(propman), hurtOf:propman | - |
| fields | fields | music.play(fields), levelStart, ambient.set(wind) | caw, gateDrop, hornBlast, gateLand, thud, foeNotice (4 spawned) |
| mage | musUnder | music.play(musUnder), levelStart | gateDrop, hornBlast, gateLand, thud, foeNotice, clank (3 spawned) |

## Music: every level and fight, and every file

| level | level track | boss | boss track | mini | mini track |
|---|---|---|---|---|---|
| wood | theme | queen | NONE (keeps the level track) | - | - |
| marsh | theme2 | frog | frogking | - | - |
| stockade | stockade | chief | boss2 | - | - |
| spore | cave | mother | sporemother | - | - |
| kings | theme3 | king | king | greathound | NONE |
| scree | theme4 | ram | ramlord | - | - |
| hanging | town | owl | owlreeve | spider | NONE |
| spire | sunspire | roc | roc | golem | NONE |
| moor | adventure | windcaller | musMountain | - | - |
| storm | stormhold | lance | musCastle | - | - |
| crown | highcrown | gqueen | queen | forgemaster | NONE |
| longwater | longwater | herald | herald | - | - |
| reef | reef | reefmaw | reefmaw | - | - |
| flotilla | flotilla | quarter | quartermaster | - | - |
| hurricane | hurricane | captain | captain | - | - |
| lamplit | drowned | tollmaster | tollmaster | lampreeve | NONE |
| underleaf | sleepers | grandmother | grandmother | berserker | NONE |
| deep | trench | drownedking | boss3 | - | - |
| causeway | causeway | kraken | kraken | - | - |
| waymeet | waymeet | closedhelm | closedhelm | lancer | NONE |
| undercrown | barrows | prince | musDungeon | propman | NONE |
| fields | fields | strawking | scarecrowking | ploughman | NONE |
| mage | musUnder | archmage | boss4 | homunculus | NONE |

### Music files, decoded

| track | secs | head silence ms | tail silence ms | seam jump | start RMS | end RMS | peak | loop |
|---|---|---|---|---|---|---|---|---|
| hurricane | 149.65 | 0 | 1769 | 0.001 | 0.0186 | 0 | 0.348 | NOT CLEAN |
| drowned | 41.66 | 2 | 0 | 0.001 | 0.0213 | 0.0026 | 0.268 | ok |
| theme | 41.14 | 0 | 0 | 0.259 | 0.5685 | 0.1862 | 1.021 | NOT CLEAN |
| theme2 | 56.1 | 0 | 0 | 0.102 | 0.4955 | 0.1008 | 1 | NOT CLEAN |
| theme3 | 81.9 | 0 | 0 | 0.376 | 0.2295 | 0.2145 | 0.999 | NOT CLEAN |
| theme4 | 74.25 | 0 | 0 | 0.202 | 0.4135 | 0.2448 | 1.004 | NOT CLEAN |
| boss | 71.72 | 0 | 0 | 0.216 | 0.4232 | 0.178 | 1.012 | NOT CLEAN |
| boss2 | 72.8 | 0 | 0 | 0.251 | 0.3595 | 0.2625 | 1.245 | NOT CLEAN |
| boss3 | 152 | 1 | 0 | 0.047 | 0.1062 | 0.0614 | 1.021 | ok |
| boss4 | 110.97 | 1 | 0 | 0.285 | 0.2359 | 0.2804 | 0.989 | NOT CLEAN |
| snow | 62.22 | 0 | 0 | 0.019 | 0.2068 | 0.0924 | 0.915 | ok |
| king | 110.97 | 0 | 0 | 0.273 | 0.2339 | 0.2789 | 0.97 | NOT CLEAN |
| cave | 64.03 | 0 | 0 | 0.002 | 0.1206 | 0.1107 | 0.456 | ok |
| town | 132 | 0 | 33 | 0.013 | 0.4178 | 0.0003 | 1.014 | NOT CLEAN |
| adventure | 69.15 | 0 | 0 | 0.102 | 0.1131 | 0.1168 | 0.569 | NOT CLEAN |
| stockade | 70.59 | 1 | 0 | 0.22 | 0.4168 | 0.1791 | 0.997 | NOT CLEAN |
| sunspire | 94.58 | 0 | 0 | 0.22 | 0.2908 | 0.1653 | 0.827 | NOT CLEAN |
| stormhold | 66.21 | 0 | 0 | 0.061 | 0.2276 | 0.2234 | 0.899 | NOT CLEAN |
| roc | 97.96 | 3 | 0 | 0.005 | 0.2849 | 0.0546 | 1.009 | ok |
| highcrown | 159.05 | 1 | 0 | 0.052 | 0.3895 | 0.1964 | 0.988 | NOT CLEAN |
| queen | 70.46 | 2 | 0 | 0.034 | 0.3231 | 0.2346 | 0.819 | ok |
| ending | 44.65 | 0 | 0 | 0.071 | 0.2213 | 0.1446 | 1.041 | NOT CLEAN |
| select | 21.33 | 0 | 0 | 0.077 | 0.4181 | 0.1251 | 0.996 | NOT CLEAN |
| ambForest | 44.74 | 0 | 0 | 0.001 | 0.0011 | 0.0019 | 0.023 | ok |
| longwater | 45.98 | 4 | 0 | 0.003 | 0.0323 | 0.0488 | 0.317 | ok |
| reef | 150 | 30 | 51 | 0 | 0.0001 | 0.0001 | 0.377 | ok |
| flotilla | 77.76 | 0 | 0 | 0.103 | 0.0402 | 0.0018 | 0.247 | NOT CLEAN |
| waymeet | 33.29 | 0 | 0 | 0.046 | 0.2348 | 0.0976 | 0.848 | ok |
| marketday | 64.91 | 24 | 18 | 0 | 0.0132 | 0.0497 | 0.575 | ok |
| ambWind | 5.96 | 0 | 0 | 0 | 0.0272 | 0.0271 | 0.137 | ok |
| ambTown | 24 | 0 | 0 | 0.029 | 0.0793 | 0.0847 | 0.335 | ok |
| ambShore | 26 | 0 | 0 | 0.056 | 0.0858 | 0.0854 | 0.776 | NOT CLEAN |
| ambShip | 28 | 0 | 0 | 0.01 | 0.0656 | 0.0513 | 0.922 | ok |
| ambCave | 60 | 0 | 0 | 0.011 | 0.0286 | 0.0225 | 0.96 | ok |
| ambDeep | 50 | 0 | 0 | 0.003 | 0.0248 | 0.0634 | 0.921 | ok |
| ambDrip | 18 | 0 | 0 | 0.001 | 0.0038 | 0.0047 | 0.975 | ok |
| musForest | 45.18 | 0 | 0 | 0.018 | 0.2269 | 0.144 | 0.649 | ok |
| musCastle | 40.42 | 0 | 0 | 0.02 | 0.1867 | 0.1882 | 0.565 | ok |
| musMountain | 32 | 0 | 115 | 0.021 | 0.2736 | 0 | 0.681 | NOT CLEAN |
| musUnder | 48 | 0 | 0 | 0.022 | 0.2505 | 0.1864 | 0.664 | ok |
| musBeach | 38.4 | 0 | 0 | 0.135 | 0.2343 | 0.1426 | 0.782 | NOT CLEAN |
| musSailor | 45.98 | 4 | 0 | 0.016 | 0.1643 | 0.1939 | 0.902 | ok |
| musDungeon | 31.03 | 4 | 5 | 0 | 0.1357 | 0.0028 | 0.94 | ok |
| sleepers | 86.49 | 1 | 0 | 0.004 | 0.1554 | 0.0423 | 0.995 | ok |
| trench | 82.29 | 7 | 0 | 0.113 | 0.0921 | 0.0718 | 0.968 | NOT CLEAN |
| barrows | 112.52 | 18 | 0 | 0.004 | 0.0697 | 0.1311 | 0.923 | ok |
| quarry | 68.57 | 5 | 0 | 0.214 | 0.0742 | 0.1905 | 0.983 | NOT CLEAN |
| skysail | 110.77 | 11 | 0 | 0.003 | 0.1059 | 0.0051 | 0.954 | ok |
| frogking | 179.13 | 24 | 0 | 0.002 | 0.1022 | 0.0021 | 0.991 | ok |
| sporemother | 86.67 | 4 | 0 | 0.297 | 0.2045 | 0.1869 | 0.996 | NOT CLEAN |
| ramlord | 133.71 | 19 | 14 | 0 | 0.0817 | 0.0125 | 0.96 | ok |
| owlreeve | 101.84 | 19 | 0 | 0.002 | 0.0854 | 0.0675 | 0.833 | ok |
| herald | 66 | 2 | 0 | 0.065 | 0.2955 | 0.0819 | 0.895 | NOT CLEAN |
| reefmaw | 198.54 | 1 | 0 | 0.252 | 0.2906 | 0.2133 | 1.018 | NOT CLEAN |
| closedhelm | 78 | 5 | 0 | 0.359 | 0.1247 | 0.2759 | 0.891 | NOT CLEAN |
| quartermaster | 57.98 | 21 | 1 | 0.001 | 0.0642 | 0.0014 | 0.99 | NOT CLEAN |
| houndmaster | 88.62 | 1 | 0 | 0.3 | 0.2293 | 0.237 | 0.798 | NOT CLEAN |
| masthead | 82.29 | 2 | 0 | 0.036 | 0.3261 | 0.1275 | 0.946 | ok |
| causeway | 147.5 | 4 | 25 | 0 | 0.077 | 0.0005 | 0.938 | NOT CLEAN |
| kraken | 123.52 | 7 | 41 | 0 | 0.1008 | 0 | 1.005 | NOT CLEAN |
| hilltroll | 99.62 | 2 | 0 | 0.082 | 0.3201 | 0.1475 | 1.029 | NOT CLEAN |
| rimewright | 121.66 | 21 | 28 | 0 | 0.044 | 0.0004 | 0.948 | NOT CLEAN |
| captain | 89.2 | 1 | 2 | 0 | 0.2345 | 0.0015 | 0.932 | NOT CLEAN |
| tollmaster | 164.61 | 17 | 16 | 0 | 0.0618 | 0.0192 | 0.951 | ok |
| grandmother | 57.64 | 22 | 9 | 0 | 0.0097 | 0.0946 | 0.96 | ok |
| fields | 69.68 | 14 | 0 | 0.002 | 0.0042 | 0.0034 | 1.002 | ok |
| scarecrowking | 80 | 1 | 0 | 0.027 | 0.3103 | 0.1692 | 0.912 | ok |

Ducking in the boss pass: 279 boss windups; music.duck(true) called 4 times (8 duck changes in all), music.muffle changed 0 times.

## Voices called again within 30 ms of themselves (the second call cuts or doubles the first)

| voice | times |
|---|---|
| skid | 679 |
| puff | 332 |
| tell | 89 |
| crack | 77 |
| clank | 46 |
| gateDrop | 21 |
| gateLand | 21 |
| thud | 17 |
| impact | 16 |
| foeNotice | 15 |
| heavy | 14 |
| parry | 8 |
| roar | 8 |
| crumble | 6 |
| hurtOf | 5 |
| dieOf | 3 |
| hurtOf:shardling | 3 |
| gutter | 3 |
| spit | 3 |
| stone | 2 |
| hiss | 2 |
| block | 1 |
| foeGasp | 1 |
| dieOf:sporeling | 1 |
| squelch | 1 |
| bellow | 1 |
| screech | 1 |
| queenShriek | 1 |
| thunder | 1 |
| waveBreak | 1 |

## Voice levels (each voice rendered once through an OfflineAudioContext; dB full scale)

Median RMS -34.1 dB over 509 renders (5 errors, 2 silent).

| voice | hero | args | peak dB | RMS dB | vs median | ms |
|---|---|---|---|---|---|---|
| pStep | pirate | ["stone"] | -45.9 | -51.3 | -17.2 | 6 |
| land |  | ["snow"] | -39.7 | -51.3 | -17.2 | 46 |
| pStep | pirate | ["grass"] | -44.9 | -51 | -16.9 | 6 |
| skid |  | [] | -38.1 | -50.9 | -16.8 | 109 |
| foeRelease |  | ["sprig","flesh",false] | -38.6 | -50.9 | -16.8 | 83 |
| swingUp |  | [1] | -38.4 | -50.1 | -16.0 | 33 |
| step |  | ["iron"] | -42.7 | -49.8 | -15.7 | 11 |
| swingUp |  | [3] | -37.6 | -49.5 | -15.4 | 34 |
| hurtOf:piece |  | [] | -38.1 | -49.5 | -15.4 | 58 |
| pDie | reaper | [] | -7.5 | -18.9 | +15.2 | 2230 |
| pStep | knight | ["grass"] | -33 | -49.2 | -15.1 | 81 |
| tell |  | [false] | -40.1 | -49.2 | -15.1 | 72 |
| pStep | pyro | ["grass"] | -40.7 | -49.1 | -15.0 | 4 |
| gobDieLow |  | [] | -6.7 | -19.1 | +15.0 | 226 |
| hurtOf:snuffer |  | [] | -8.5 | -19.3 | +14.8 | 565 |
| hurtOf:miner |  | [] | -8.4 | -19.3 | +14.8 | 556 |
| baleBump |  | [] | -40.1 | -48.7 | -14.6 | 40 |
| hurtOf:javelin |  | [] | -8.4 | -19.5 | +14.6 | 448 |
| pStep | pyro | ["stone"] | -40.3 | -48.3 | -14.2 | 5 |
| hurtOf:broom |  | [] | -36.1 | -48 | -13.9 | 94 |
| dieOf:piece |  | [] | -32.1 | -47.9 | -13.8 | 76 |
| dieOf:captain |  | [] | -9.6 | -20.4 | +13.7 | 1295 |
| dieOf:gqueen |  | [] | -4.3 | -20.4 | +13.7 | 1416 |
| hurtOf:assassin |  | [] | -34.1 | -47.8 | -13.7 | 56 |
| foeMutter |  | ["sprig"] | -35.5 | -47.7 | -13.6 | 177 |
| drip |  | [] | -36.1 | -47.6 | -13.5 | 90 |
| dieOf:heavy |  | [] | -8.1 | -20.6 | +13.5 | 773 |
| hurtOf:crow |  | [] | -34.4 | -47.6 | -13.5 | 45 |
| cricket |  | [] | -32.7 | -47.5 | -13.4 | 168 |
| hurtOf:rook |  | [] | -35.9 | -47.4 | -13.3 | 43 |
| dieOf:drunk |  | [] | -9.3 | -20.9 | +13.2 | 2509 |
| hurtOf:imp |  | [] | -34.1 | -47.3 | -13.2 | 60 |
| dieOf:crossbow |  | [] | -9.5 | -21 | +13.1 | 1841 |
| dieOf:hearthgob |  | [] | -9.5 | -21.2 | +12.9 | 603 |
| grapple |  | [] | -35.8 | -46.9 | -12.8 | 70 |
| rattle |  | [1] | -39.3 | -46.9 | -12.8 | 33 |
| dieOf:closedhelm |  | [] | -8.4 | -21.4 | +12.7 | 1670 |
| dieOf:lance |  | [] | -8.4 | -21.4 | +12.7 | 1065 |
| pStep | knight | ["stone"] | -33.9 | -46.8 | -12.7 | 19 |
| pStep | paladin | ["grass"] | -29.5 | -46.8 | -12.7 | 80 |

Voices that rendered nothing or failed: foeStep, hurtOf:dummy (no voice: hurtOf:dummy), dieOf:dummy (no voice: dieOf:dummy), dieOf:bale (no voice: dieOf:bale), dieOf:kite, hurtOf:bearer (no voice: hurtOf:bearer), dieOf:bearer (no voice: dieOf:bearer)

## Shared hurt and death voices within a level (identical renders)

| level | voice | creatures that sound the same |
|---|---|---|
