# claude/unburied3 - THE UNBURIED FIELD: the Death Knight (lane report, DONE)

Design: docs/briefs/unburied-deathknight.md. origin/master had not moved (46426a2), so there was nothing to merge.

## Commits
- 0124a51 the brief
- 798ac72 1. Music: the level plays 'deathknight' (Night on Bald Mountain), and the arena names the same track, so it neither switches nor restarts.
- 2bccaf4 2. THE BROKEN BRIDGES, the told volley, and the broken tower grounded.
- 5607481 WIP checkpoint (the coordinator asked for one).
- e79191a 3 and 5. THE DEATH KNIGHT as the boss, the bot, and THE REAPER benched.
- d6c2fcf 4. The unlock.
- This report.

## What I built

### 1. Music
- `L.music` and `arena.music` are both `'deathknight'`. `playFile` returns early when that track is already playing, so walking into the chapel changes nothing.
- `unburied.ogg` stays in the library and the sound test; CREDITS.txt notes that.
- `tools/unburied.mjs` asserts all of this. It was red on the old level.

### 2. THE BROKEN BRIDGES
Sixty columns cut in at column 265 with `grow()`, between the toppled tower and the Barrow Rider.

The ravine:
- It is nine rows deep. Plank decks sit level with the field on timber trestles.
- The gaps are 3, 2, 3, 3, 2 and 3 tiles: four of three, and nothing over three (S2).
- The stream bed has stakes where a short jump lands.
- The only way out is the ladder at the west wall, so a missed jump means the whole crossing again.

The told volley:
- A whistle warns first. It is a new synth sound effect (`arrowWhistle`), so nothing was downloaded.
- Then three shadows with red rims appear on the planks: one on you and one either side, never the same pattern twice running.
- 1.2 s later the arrows land, and they stay stuck in the planks for a moment.
- Three ways to answer it:
  - Step out of your shadow.
  - Get behind cover: a broken mantlet or an overturned cart (new art, lit green during the whistle).
  - Hold a guard up. Every guard turns it, because a blow from straight overhead counts as a front blow.

Foes follow S1 (a worse place, not more bodies): two bone archers on the far bank cover the last gap, and a bone goblin stands on the middle deck. There is a checkpoint on the far bank.

`src/unburied-field.js` now exports `UF`, the level's final geometry, and the tools read it.

The broken tower is grounded:
- The chapel's arch crown no longer hangs over the road. It lies on the nave floor as a two-row block.
- The timber peg wall over the crypt stair's pit is gone, along with its gallery and the gallery's two coins. Two coins now sit at the bottom of the stair. Three peg walls remain on the field.
- `unburied` is off the grandfather list in `tools/architecture.mjs`.

### 3. THE DEATH KNIGHT (`t: 'bloodknight'`, 850 health)
He is the hero's own `bakeReaper` kit, one pose per frame, drawn at 1.5x and a touch darker. The lights in his helm stay lit.

His moves:
- **THE CLEAVE `!`**: a guard turns it. He commits to where you stand 0.35 s before it lands.
- **The opening (A11)**: if you were in reach when he committed, and you are out of reach or dodging when it lands, the blade sticks in the floor. He is open for 2 s and takes 1.6x damage.
- **THE PLANTED BLADE `!!`**: three bolts land 46 px apart around where you stood, and the spots are marked during the tell.
- **THE BLOOD WARD** (no mark): its face stops blows, his back does not.
- **THE GREATSWORD RUSH `!!`**: jump it.
- **RISE** (no mark): two of the field's dead get up at the wake. Never more than three stand at once, and they fall when he does.
- **Phase two (A10), BLOOD SURGE `!!`**: at half health the surge rings out of him. After it every tell is 0.75x as long, he walks 1.3x faster, and the planted blade throws five bolts in a wider fan.
- **A12**: the tomb ledges are where the rush and the low bolts miss you.

He is wired into all the usual places: spawn, EHP, COLS, bestiary, short name, death list, boss bar ("THE DEATH KNIGHT  OPEN"), BOSS_FELL, bigF, windingUp, marks (BY_HAND plus `tells --write`), voices and threat.

The bot (`src/lab.js`):
- baits the Cleave, dodges out once he commits, and cuts the stuck blade;
- stands in the bolts' gaps;
- jumps the rush;
- goes round the ward;
- leaves the surge.

### 4. Unlock
- The hero is locked in the shop (feat `boss:unburied`) until the boss dies in his own arena. His death sets `PROG.bossDown.unburied`; clearing the level does not.
- After that the prices are as before: 10 silver or 800 gold (`coinBoss`).
- Saves that already own him keep him.
- New check `tools/deathknight-unlock.mjs`, added to check.mjs. It was red on the old entry, where a fresh save had him open in the shop.
- `tools/shop-gates.mjs` now fails any `boss:` feat that nothing sets.

### 5. The bench
- THE FIRST DEATH KNIGHT is now THE REAPER in the bestiary and on the boss bar, and no level places him.
- His code, sprite and marks are kept, and RULES section P has a row for him.
- `tools/unburied-fights.mjs` still drives his whole fight in Node.
- `tools/boss-openings.mjs` now tests the new boss's opening three ways: a Cleave taken, a Cleave nobody was under, and a Cleave dodged. Only the dodged one sticks.

## Pilots
`tools/unburied3-pilot.mjs`: the bot, all seven heroes, refill health, 150 s, 3 seeds.

| | kills in 150 s | median kill | by hero |
| --- | --- | --- | --- |
| before: THE FIRST DEATH KNIGHT | 18/21 (86%) | 74.5 s | paladin 0/3, all the others 3/3 |
| after, first try at 950 health | 12/21 (57%) | 101.7 s | knight, warden and reaper 0/3 |
| after, 850 health (shipped) | 21/21 (100%) | 109.2 s | all 3/3; the blade stuck 7.9 times a fight |

- Health lost per minute, after: knight 95, paladin 99, pirate 78, geomancer 70, reaper 47, warden 41, pyro 29.
- The rows are in `work/unburied3/pilot-before.txt` and `pilot-after.txt`.
- The "opened" count in those files is not the real measure; the stuck count in the mode ledger is.
- Refill mode never lets the hero die, so 100% means the fight can be finished, not that it is easy.

## Checks
43 named checks are green on the final tree (`work/unburied3/final-checks.txt`): unburied, unburied-fights, boss-openings, boss-fight-end, arena-supplies, tells, mini-names, one-new-foe, elites, spawns, floaters, architecture, footing-art, checkpoints, checkpoint-gaps, checkpoint-stand, audit, content-audit, traps, killzones, deadends, signs, textfit, readability, shop-gates, store-preview, progression, progression-runtime, class-spurs, hero-trials, reaper-input, ore-road, comments, homepaths, dangling-paths, ambush-reach, skins, small-adds, ability-poses, tower-ascent, mini-walls, deathknight-unlock and syntax.

This is not the full suite.

## UNVERIFIED
- Nobody has played it with a keyboard. I only looked at real-page shots: `work/unburied3/bridges-*.png` and `knight-*.png`.
- Nobody has tested whether a person can read the Cleave's commit in time: 0.35 s, and 0.26 s in phase two.
- There are no normal-health (one life) pilots; I only ran refill mode.
- The whistle is synthesized and I have not heard it.

## QUESTIONS FOR DANIEL
1. **The price.** You wrote "the price stays: a silver + 800 coins". I kept exactly the price he had before, 10 silver OR 800 gold, and put both behind the boss.
   - Recommendation: keep it. If you meant 1 silver and 800 gold together, that is a one-line change.
2. **Old saves.** A save that cleared the Unburied Field before this change but never bought him now has to beat the new boss once before he opens.
   - Recommendation: leave it that way. The alternative is to treat any old `PROG.unburied.cleared` as the flag.
3. **The internal id.** The new boss is `'bloodknight'` and the benched scythe keeps `'deathknight'`. That avoided renaming twelve wiring points.
   - Recommendation: leave the ids. The names on screen are right.
4. **Difficulty.** At 850 health the bot kills him every time in refill mode, with a median of 109 s. The old boss was 86% at 74.5 s. The 0.35 s commit window needs a person's feel check.
   - Recommendation: play it once. If it feels too easy, raise his health toward 950 before touching the tells.
5. **The ravine.** A missed jump sends you back to the west ladder and the whole crossing again.
   - Recommendation: keep it, since S2 asks for a miss to be punished. If it plays too harsh, add a mid-ravine ladder.
