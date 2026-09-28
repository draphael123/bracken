# claude/combatpass: the combat pass, part 1 (attack tokens and answer tags)

Backlog item 13, approved by Daniel on 2026-09-26 and confirmed on 2026-09-28. Opus lane.

## What changed

### 1. Attack tokens: at most two common foes swing at a hero at once
- **New module: `src/attack-tokens.js`.** Each hero gets a purse of **2 tokens**. In co-op, each player has his own purse, and a foe asks the purse of the hero nearest to it. A common foe has to hold a token to start a windup. It keeps the token through the tell, the blow and a 0.45 s tail, then gives it back. After that it has to wait 0.7 s before it can ask again, so the others get a turn.
- **Foes without a token are never frozen.** They do two things:
  - **Reload.** Their cooldown is held up, so their next blow is kept back instead of thrown.
  - **Hold a ring round the hero.** The nearest waiting foe stands 58 px away and each further one on the same side stands 22 px further out. They pace in and out on the ring and face the hero. They never step off a ledge, into spikes or into water.
  - A foe that has just attacked and sits at arm's length on cooldown also steps back to the ring, in its plain walking mode only. Recoveries (rest, reel) stay where they are, because a recovery is the player's opening.
- **Turned away cleanly.** If two foes start a windup on the same frame and only one fits, the second is put back exactly as it was before that frame: its mode, its timer and the `!` it called. The screen never shows a tell that is not thrown. Until a token is free, that foe skips its own AI entirely and waits on the ring. A foe whose blow waits on nothing but range (the hedge knight's leap) would otherwise reach for it every frame and replay its SFX.
- **Who is exempt:** bosses and minis (`xpRole`, the boss, `mini`), everything inside a boss or mini fight (their scripted adds), the Boss Rush, trainers, dummies, harmless folk and working miners.
- **Who is not exempt:** ambushes follow the rule.
- **Elite captains keep one token back for themselves** when they are near the hero. Their minions share the rest, so a captain is never left waiting on a minion, and his remembered combos are never taken back.
- **The hook in `src/main.js` is five lines:**
  - the import
  - the board with its exemption rule and a small API object
  - `tokenPre` at the top of the `updateEnemies` loop
  - `tokenHold` just before each creature's own update, after its knocks and staggers
  - `tokenPost` right after `updateEnemies`, before anything is drawn
- `BK.tokens()` exposes the board for harnesses. No creature's code was edited: the module only reads `windingUp(e)`, the same predicate the marks use.

### 2. Answer tags: every common-foe blow names its answer
- **Next to the tells in `src/marks.js`:**
  - `ANSWER` has one row for each of the 244 told blows of the 126 common foes: block, dodge, jump or duck. Duck is the planned universal crouch, tagged now.
  - `UNTOLD` covers the 28 common foes whose harm is not a told windup (touch, a lunge from hiding, a latch, a gust, a burst). A foe that never harms you gets `''`.
  - `answerOf(t, mode)` looks up a blow's answer.
- **The rule that keeps the two tables honest:** every yellow `!` is a block, and a red `!!` is never a block.
- **Current totals:** block 207, dodge 32, jump 4, duck 1 (the gaffer's hook). Among the untold foes, the crow and the horn's gust are duck, the hound and the rolling bale are jump.

### 3. New checks (both added to `tools/check.mjs`'s list)
- **`tools/attack-tokens.mjs`** (headless page). It sets down a crowd of six common foes round a hero standing still in god mode for 20 s, once on the Stockade and once on the Waymeet. It fails when:
  - more than 2 foes are attacking at once, or
  - a waiting foe near the hero (plain walking mode, within 150 px) covers less than 4 px in any second, or
  - the run gives nothing to measure.
- **`tools/answer-tags.mjs`** (Node). It fails on any of these:
  - a told common-foe blow with no answer
  - a `!` that is not a block, or a `!!` answered block
  - a stale row
  - a common foe with no told blow and no `UNTOLD` row

  It also prints each level's coverage and lists the levels under three answers. Those offenders are listed, not failed.
- **Both were red on master cd35d24** (run in a throwaway `git worktree`, never a stash):
  - answer-tags: `marks.js` had no `ANSWER` export.
  - attack-tokens: 5 foes attacked at once on both levels. 15 of 46 waiting foe-seconds stood still on the Stockade, and 29 of 41 on the Waymeet.
- **Also new: `tools/combat-damage.mjs`.** It is a measuring tool, not a check. It runs the F9 bot with no god mode, the dice pinned, and reports hp lost per level.

## Numbers, before and after

**Crowd of six** (`tools/attack-tokens.mjs`, 20 s, hero standing still):

| | master cd35d24 | this branch |
|---|---|---|
| most attacking at once, Stockade / Waymeet | 5 / 5 | 2 / 2 |
| attacks in 20 s | ~30 | 14-17 |
| waiting foe-seconds standing still | 15 of 46 / 29 of 41 | 0 |

**Damage taken by the F9 bot** (`node tools/combat-damage.mjs waymeet,kings knight 1,2 5400`: knight, 90 s, no god mode):

| level, seed | before | after |
|---|---|---|
| Waymeet 1 | 150 hp, 1 death | 100 hp, 1 death |
| Waymeet 2 | 100 hp, 1 death | 98 hp, 0 deaths |
| King's Road 1 | 124 hp, 1 death | 98 hp, 0 deaths |
| King's Road 2 | 121 hp, 1 death | 121 hp, 1 death |

- In every run, about 85-98 hp is booked to no named attacker (`P.killer` is empty), both before and after. The bot's numbers are a rough guide, not a proof.
- The Stockade was tried first and dropped: the bot stalls at column 94 and never meets a foe (0 hp lost both seeds).
- The Wood was also tried on master and dropped: the bot dies to falls, not to foes.

**Boss lab:** bosses and their adds are exempt, so their fights are unchanged. Both runs are green on this branch:
- **small-adds:** 5 of 86 swings missed (6%); worst judged row 25%, against a limit of 33%.
- **boss-openings:** green.

## Checks run (named, never the suite)
All green on this branch after merging origin/master (batch37):
- tells, answer-tags, attack-tokens
- spawns, elites, ambush-single, one-new-foe
- boss-fight-end, small-adds, boss-openings
- **The 7 required checks:** architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (every level identical, nothing rebased), npc-removal

Two notes:
- The merge conflicted in `tools/check.mjs`'s list. I kept every name from both sides and ran `node tools/tells.mjs --write`, which left `src/marks.js` unchanged.
- tells still lists two old windups with no mark on them: the scalder's pour and ladle. This lane edited no creature code, so it did not cause them.

## Levels whose foe mix asks for fewer than three answers (for the design lanes; not fixed here)
- **Block and dodge only (2 answers):** marsh, spore, hanging, longwater, lamplit, underleaf, harbor, waymeet, undercrown, burial, fallingtower, unburied, caravan.
- **Block and duck only (2 answers):** mage. Its duck comes from its crows.
- **Block only (1 answer):** witchlight.

Jump is the rare answer: only 4 told blows ask for it (the tide marauder's rake, the troll's rolled stone, the merrow caller's surge, the bosun's broadside), plus the hound and the bale.

## How the token system hooks part 2 (squads, reactive foes, varied told swings, poise break, pogo chains)
- **Squads:**
  - `TOKENS.cost(e)`: a heavy blow can cost 2, so it is always thrown alone.
  - `TOKENS.cap(hero)`: a banner or a difficulty level can widen or narrow the purse.
  - `claim(board, hero, e, force)`: a squad planning a pincer claims for two members at once.
  - `room()`: already reserves a slot for a leader (see the elite rule), so a squad leader works the same way.
- **Reactive foes:**
  - `TOKENS.waitMove(e, hero, api, dt)`: one replaceable function is the whole waiting behaviour. Swap it per foe for block, flank or reload.
  - `board.on.cancel(e)`: fires when a foe is turned away, so a reactive foe can pick its waiting move there.
  - `TOKENS.priority(e)`: lets a foe the hero just hit, or a leader, be served first.
- **Delayed and varied told swings:** `board.on.grant(e)` fires the moment a windup is allowed. Adding to `e.modeT` there makes a tell longer or varied without touching the creature. The tell is still shown in full, never shortened.
- **Visible poise break:** `release(board, e, 'broken')` frees the token the moment a foe is broken. `tokenPost` already does this for knocks, broken, pinned and dead foes, and `board.on.release(e, why)` is where the break's show would go.
- **Pogo chains off foes:** waiting foes stand on known rings (`e.tokRing`, `e.tokWait`), so a chain of heads at predictable distances is already laid out for a pogo route.

## Unverified
- **Co-op:** the per-hero purse was only reasoned about, not played with two heroes.
- **Flyers and swimmers:** they are gated (their tells wait for a token) but are not walked round the ring, because their own movement already keeps them moving. No test asserts that for them.
- **Held-out foes' animation:** a foe sitting its AI out shows its walking pose while it paces. I have not looked at it on screen.
- **Knock timing:** a foe knocked out of its turn gives the token back at once. I have not checked whether that feels too generous.
- **Ranged foes (archers, crossbowmen) take tokens too**, so a distant archer's draw can hold one of the two. See Q2.
- **Only the knight** was run in the bot numbers, 2 seeds each.

## QUESTIONS FOR DANIEL (the recommended option is what is built)
1. **Purse size.** Two tokens per hero, every blow costing one (built).
   - *Recommendation:* keep 2 for now. In part 2, make heavies (the brute's overhead, the hedge knight's leap) cost 2, so a red `!!` is always the only thing coming at you. That is the Salt & Sanctuary one-on-one feel.
2. **Should ranged foes use the same purse?** Built: yes, a drawn bow holds a token.
   - *Recommendation:* keep it. Otherwise two swords plus two archers is four blows at once again.
   - *Alternative:* give ranged foes a separate purse of 1.
3. **Elite captains.** Built: a captain near you always has a token saved for him.
   - *Recommendation:* keep it. His combos are the fight the room is built around.
4. **Fewer attacks per crowd.** With the purse, a crowd of six throws about half as many blows in 20 s (≈16 against ≈30). That is the intent ("fewer, better"), but crowds will feel less hectic until part 2 makes each foe deadlier one-on-one.
   - *Recommendation:* ship this now and let part 2 raise per-foe damage and AI. Do not widen the purse.
5. **Only one duck-tagged told blow (the gaffer's hook).** Arrows and bolts at head height are yellow `!`, so they are tagged block.
   - *Recommendation:* once the crouch is built, give chest-high shots a second answer, duck.
6. **The untold attacks in `UNTOLD`:** the lurker's lunge from hiding, the hound's leap, the sapper's bomb and similar are harm with no tell.
   - *Recommendation:* in part 2, give the lurker, hound and sapper a tell each. Daniel's list says "no untold attacks".
7. **15 of 32 levels ask for fewer than three answers.** They are listed above; fixing them is the level lanes' job.
   - *Recommendation:* fix Witchlight first (block only), then add one jump foe to each two-answer level as it comes up for rework.
