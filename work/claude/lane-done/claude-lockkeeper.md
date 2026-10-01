# claude/lockkeeper - JENNY GREENTEETH (new boss lane, base claude/batch50 5049a98)

## PIVOT NOTE
The lane was briefed as THE LOCK-KEEPER (a human lock-keeper with a boathook). Before any Lock-Keeper code was written, the coordinator
passed on Daniel's pivot: the boss is **JENNY GREENTEETH**, the river hag of the English tales. Nothing Lock-Keeper-named was ever
committed. The branch is still called `claude/lockkeeper`, and the lane's name is the only place that word appears. Everything that
still fitted was kept: the lock chamber whose water level changes, the sluices, the water rules, three phases, the stage-function
contract, the human bot, and the anti-Puppeteer rules.

## What she is (src/jenny-greenteeth.js; its header is the design)
She is fought INSIDE A LOCK CHAMBER, 40 tiles wide. Its parts:
- a timber mitre gate at each end, each with timber walers two rows apart up its face (every hero's jump reaches the next one);
- a walkway on each gate, with the paddle gear;
- a culvert at the foot of each gate;
- a sunken narrowboat on the bed (her lair);
- a stone back wall with a tide-mark.

The **upper (west) paddle floods** the lock and the **lower (east) paddle drains** it. You work a paddle by striking its gear.
**Blanket weed** lies on the water:
- BRIGHT weed is a pale mat with flowers and a lit rim. It holds you for 2.5 s, sags, bubbles and then gives.
- DARK weed is glossy bottle-green and bubbling. It is only water.

The standalone level teaches both first, in a ditch a hand deep where nothing can hurt you.

Her blows. Each one is told and each one fires. Each has a MARK, ANSWER and HEIGHT row in src/marks.js.
- **THE GRAB** (!!, step out): a bubbling ring on the water where you are. The arm bursts up and drags you under. Break free by mashing (the game's own P.snare) or by striking the arm. You lose breath while under.
- **THE LASH** (!!, jump): an arm sweeps along the water's skin, or along a gate's walkway. Only its end hits, so you can land once it has passed.
- **THE REACH** (!!, duck): an arm comes up beside your ledge, or up the gate's face, and swipes at head height.
- **THE BITE** (!, block): her green teeth at the water's edge. Without a shield, dive under it or jump it.
- **THE TEAR** (!!, step off): the bright mat under you shivers dark and is pulled under.
- **THE SURGE** (!!, jump): a culvert boils and a wave runs the length of the lock along the water.
- **HER HAND** (no mark): you opened the drain. Her arm goes up the gate to the paddle to shut it, and you strike the hand.
- **PAIRS**: high then low 0.55 s apart, or a ring then a reach. In the fog, two rings with the way out on the side away from her.

**Every cycle changes. A cycle ends with an opening.**
- **PHASE 1, THE GREEN LAWN** (100% down to 2/3 health). Low water under the weed. She hunts you, comes to the gate you stand on and reaches up it. After a visit she rests in the wreck.
  - DRAIN THE LOCK WHILE SHE IS AT THE GATE. She goes aground and is **STRANDED** in the mud (open 1.8 s at x2.4), crawling for the upper culvert. Drain while she rests in the wreck and she is stranded out of your reach.
  - Cycle 2, THE UPPER PADDLE RUNS: half water, weed B. She has knotted the upper paddle open. Cross the lock and cut the knot, or the drain cannot win. Her hand now matters, because half water drains slower than she reaches.
  - Cycle 3, THE CHOKED PADDLE: low water, weed C. The drain is knotted, her lair has moved, and she tears the weed and pairs her arms.
- **PHASE 2, THE FLOOD** (to 1/3). A told flood brings the water to one row under the walkways. She hides in a gate's CULVERT (her eyes in the grate), sending arms out of it along the water and up the gate, and shifts culverts (told).
  - OPEN THE PADDLE OF HER CULVERT: the rush throws her out, dazed on the water (open 1.8 s). The other gate's paddle tells you she is not in that culvert.
- **PHASE 3, THE FOG**. A told fog, and the water goes to half. Only her eyes show in the lantern light. A lamp hangs on a hook over each gate's water.
  - Strike the hook and the lamp falls in. She goes for the light and **will not leave it**. Work THAT gate's paddle: the drain strands her, and the flood throws her. **THE BIG ONE** is open 3.0 s at x2.8.

Openings are always shown by a ring, OPEN, a clock under her, the boss bar (`JENNY GREENTEETH: STRANDED` / `OPEN`) and a line in the hint box. A blow anywhere else lands at **x0.05** ("THE WATER TAKES IT: STRAND HER FIRST"). Health is 720 (648 at normal), the same as the Puppeteer's. Health was never the lever.

**The water matters to you too.** Grabs drag you under, where breath runs out. At the flood the whole lock is swimming depth. Walers sink under and come up as the level changes. Drained, the bed is dry mud. The weed is footing that appears, sags and goes.

## Files
- `src/jenny-greenteeth.js`: the fight, pure. It holds the stage function, the standalone level and the bot's plan (`greenteethPlan`, the HUMAN bot: `PLAN = { react 0.25 s, missDodge 0.12, missHand 0.22, late 0.2, mash 0.35 }`).
- `src/jenny-greenteeth-hands.js`: the world wiring and all the drawing. That covers the lock's back wall, gear, culverts, lamps, weed, arms, fog, eyes and tells.
- `src/redraw/greenteeth_art.js`: her 13 frames and the lock's skins. The skins are tarred oak gates with iron straps, walers, oak walkways on iron bearers, stone setts under silt, and a tarred narrowboat with a rust-red strake. There are no generic planks.
- `src/audio.js`: her synth track `greenteeth` (see below), the gt* sounds, and her hurt and death voices.
- `src/main.js`: small, local wiring, all marked `JENNY GREENTEETH` or `GTH`. No name was put at the front of a list.
- Other src files: the `greenlock` hidden level (LAST row of LEVELS), marks, hint lines, threat 6, and the lab branch.
- `tools/greenteeth.mjs`: the new check (pure plus in the page). It is in the check list.
- `tools/greenteeth-pilot.mjs` and `tools/greenteeth-shots.mjs`: not in the suite.
- Rows added to `tools/boss-openings.mjs` and `tools/boss-navigation.mjs`.
- `tools/audio-assets.mjs`: `greenteeth` added to NO_FILE_BY_DESIGN. It is a synth track like mineworks, so the canal's arena passes audio-assets.

**The music** (`arena.music 'greenteeth'`) is a folk lament at 66 bpm: a thin whistle line in D over a drone of an open fifth, water dripping off the gates at odd beats, and a bell in the fog.

## FOOTPRINT AND THE STAGE CALL (for the canal lane)
```js
import { stageGreenteeth } from './jenny-greenteeth.js';
const { arena, movers, pools } = stageGreenteeth({ set, block, plat, ent }, T, TS, sx, R);
// return { ..., arena, moversExtra: [...yourMovers, ...movers], pools: [...yourPools, ...pools], gateAfterBoss: true }
```
- **40 columns, sx .. sx+39.** The gates are columns sx and sx+39, and the water spans sx+1 .. sx+38. **Rows R-16 .. R+1**, where R is the chamber bed.
- The function lays the bed solid on rows R and R+1. **Row R+2 should be solid** under the chamber.
- The gate columns are solid from R-16 to R-1, with a door on rows R-6 .. R-1 in each. The arena walls close it when she wakes.
- **The approach reaches the WEST door at bed level** (standing row R-1). The way on is the **EAST door**, opened at her death.
- Keep nothing standable over the chamber within five rows of the walkways (R-8).
- Put a checkpoint just outside the west door (the standalone has one at sx-6).
- The arena carries `lock: { sx, R }`, which the hands read. The standalone also sets `lock.quoins` and `lock.teach` for its own banks and ditch. **The canal should teach the two weeds before the lock**, safely.
- When the canal lands: delete the `greenlock` row (the LAST row, so no index moves), and pass the canal's id to `tools/greenteeth-pilot.mjs` and `tools/greenteeth-shots.mjs`. Re-point the `boot('greenlock')` in boss-openings, the `greenlock` row in boss-navigation, and `LEVELS.find(l => l.id === 'greenlock')` in tools/greenteeth.mjs.

## Checks
- `node tools/greenteeth.mjs` is green (pure plus in the page).
  - It is red on the base: the module does not exist there.
  - It is red on 5 sabotages, run on a copy of the tree:
    1. the stranded window at 4 s (three rules fail);
    2. the ward at 0.3;
    3. her hand that never shuts the drain;
    4. cycle 2 laid the same as cycle 1 (three rules fail);
    5. a bot that reacts instantly.
  - A sixth sabotage was **not** caught: stranding her while the water rises. That was a real bug the pilots found, where she re-stranded during her own refill. I have since added a rule: after a stranding, the refill strands nobody.
- Green together in one run on 2c9115b, by name:
  - tells, architecture, skins, dangling-paths, hint-shown, audio-assets, npc-removal, checkpoints, homepaths, answer-tags, greenteeth, attack-tokens;
  - boss-openings, including her row: a minute of her alone opens nothing, and the drain at the gate strands her;
  - boss-fight-end: all 47 fights end on the boss's death, hers included;
  - boss-navigation: 4 rows. In the greenlock row the knight kills her in 92.6 s through ordinary inputs, both swimming and standing on a walkway.
- After the later commit (the refill rule and the fog's colour) I re-ran greenteeth and dangling-paths: both green.
- Not run: slopes-trace (the lock has no slopes and no other level was touched), and the full suite (the lane rules forbid it).

## Pilots (AFTER only: she is new)
`node tools/greenteeth-pilot.mjs 1 knight,warden,pyro`: normal health, one life, the standalone lock, salt 1, the human bot.

| hero | out | secs | health lost | her health left | cycles | stranded / flushed / big | what hurt |
|---|---|---|---|---|---|---|---|
| knight | win | 77.8 | 52 | 0 | 5 | 3 / 3 / 1 | surge 20, teeth 13, lash 11, arm 8 |
| warden | win | 116.7 | 97 | 0 | 8 | 3 / 6 / 4 | lash 44, reach 22, teeth 13, surge 10, arm 8 |
| pyro | death | 91.0 | 88 (died) | 44% | 5 | 4 / 1 / 0 | lash 33, reach 22, surge 20, teeth 13 |

- **2 of 3 wins (67%), median win 116.7 s**, inside the house band (60-75%, 90-150 s). Every pilot took real damage, and the warden won with 3 health left.
- An earlier tuning (x3.0 openings, lash 16, the whole lash length hitting) gave the knight a win in 68 s and killed the warden and the pyro. Retuned to x2.4 / x2.8, lash and reach 14, bite 16, and a lash that only hits with its end.
- The bot swims, climbs the walers, works both paddles, cuts the knots, strikes her hand, drops the lamps and swims to her when she is thrown out.

## Captures
`node tools/greenteeth-shots.mjs` (knight, refill health) wrote ten stills to `work/claude/greenteeth/`. They cover:
1. the empty lock;
2. phase 1: the green lawn and a grab's ring;
3. her stranded;
4. the upper paddle running;
5. the surge;
6. phase 2: the flood and her culvert;
7. her flushed out;
8. phase 3: the fog and a lamp;
9. the big one;
10. her death.

The first fog was a light wash, and it made the lamps' clear patches read as dark blobs. It is now a dark night fog with warm light round the lamps and the hero.

## UNVERIFIED
- **Nobody has played her with hands.** I have not tested whether the bubbling ring reads in time, whether the bright and dark weed read on a second look, whether the fog is too dark, or whether swimming the length of the lock in cycle 2 feels like a slog.
- Only the knight, warden and pyro were piloted. The paladin, pirate, reaper and geomancer have not fought her.
- The art is drawn at pixel level from primitives and checked only in stills. Her frames may want an art pass (a Sonnet lane).
- Co-op: her blows and the snare go through asPlayer for every hero, but a two-player fight was not run.
- The canal integration is untested. The contract is above.

## QUESTIONS FOR DANIEL (each with my recommendation; the recommended option is what is built)
1. **The pyromancer died with her at 44%.** Her fire reach is short in the water, and she swam cycle 2 slowly. *Recommend* leaving the numbers until you have played her. If she is hard for short-reach heroes, lengthen the stranded window to 2.0 s rather than lowering her health.
2. **Cycle 2 (THE UPPER PADDLE RUNS) makes you cross the whole lock twice under attack.** It is the longest stretch of phase 1 (about 20-35 s). *Recommend* keeping it: it is the one time the weed lawn is a route. The softer option is to put the knot on the drain paddle only.
3. **The walkways are safe from her grab but not from her reach and lash.** She keeps attacking a hero who waits at the paddle. *Recommend* keeping this, so camping at the gear is never free.
4. **Should the lamps light before the fog?** They hang lit all fight but can only be dropped in phase 3 ("THE LAMP IS HOOKED FAST", said once). *Recommend* keeping them lit for the look.
5. **The music is a synth lament, with no file.** *Recommend* keeping it. If you want a CC0 file instead, that is a download for your yes.
6. **Her look:** a hunched green hag with weed hair, long thin arms, green teeth and yellow-green eyes, drawn by hand in code. *Recommend* a Sonnet art pass once you have played her.
