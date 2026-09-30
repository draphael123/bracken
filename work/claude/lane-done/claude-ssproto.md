# claude/ssproto — COMBAT: CLASSIC / WEIGHTY (a Salt & Sanctuary-style prototype, off by default)

Branch claude/ssproto, based on claude/chase (a4a1efc), origin/master merged in before this report.

## How to try it

- `http://localhost:<port>/?combat=weighty` for a playtest visit (not saved; `?combat=classic` forces it off), or
- Settings > GAME > **Combat: CLASSIC / WEIGHTY** (saved).
- Play the Hornet Queen (Bracken Wood) and Kingswood once each way. The line is also in docs/PLAYTEST.md.

## What changed (everything asked through one switch, src/weighty.js; tuning numbers are in `WEIGHTY` there)

**The boss: the HORNET QUEEN (recommended and built).** Why her and not a knight-type boss: she is the fight every player
meets first and the clearest case of the gate Daniel described. Her swarm turned 55% of every blow for most of the fight, and
her openings (stuck in the wood, winded on the shield) were the only full damage. The nearest "knight" early is the Goblin
Chieftain (the Stockade), and he is already mostly hittable (only his sword stance's shield turns blows), so rule 1 would change
little there. She also has a pilot already (tools/firsthour-pilot.mjs).

1. **Always hittable.** With the switch on the swarm no longer closes over her, so every blow lands in full. Winded (x2) and stuck
   (x1.5) are now a bonus on top. Her health is x1.2 (198 -> 238 on Normal).
2. **The blade commits, for every hero in every level.** A swing ends in a recovery of 0.16 s (light), 0.22 s (Paladin or Death
   Knight) or 0.28 s (heavy). You cannot jump or guard during the swing or its recovery, and you cannot dodge during the recovery
   (a dodge during the swing was already blocked). A new swing is still allowed, so mashing becomes a chain of commitments you
   cannot get out of.
3. **Delayed swings and a feint.** Her dive and slam windups are sometimes held (half of them, up to +0.45 s). About one dive in three
   is a FEINT: she rears exactly as she does for a dive, drops a hand's breadth and goes back up. It throws no blow and wears no mark,
   and a real, told dive always follows it.
4. **Body first, then the icon.** Her windups are 1.3x longer, and the ! arrives halfway in (measured at 0.47-0.49). First she rears
   back (14 px up before a dive), then the icon appears. Every attack is still told.
5. **Poise (Kingswood).** A brute (or a plate "heavy") swings through the first two blows without flinching, even mid-windup. The
   next blow BREAKS him for a 0.9 s stagger window, and a heavy blow counts double. A shield, pike or soldier hit light from the
   front does not flinch; it takes a heavy blow or a hit from behind.
6. **The shield parries mashing (Kingswood).** Three blows on its guard inside 1.4 s and it PARRIES: you are thrown off and reel for
   0.3 s. Then it counters on a yellow ! (0.6 s), a rim bash that a shield turns. It then has a 2.5 s cooldown before it can parry
   again. Kingswood shields no longer flinch (0.4 s) on a guarded hit, because a guard is not a flinch.
7. **Feint, lunge, backing archer (Kingswood).** About one brute swing in three starts as a feint: the overhead pose, held, then
   lowered, with no blow and no mark, and a real told swing follows. A pike tells from 84 px instead of 46 and lunges 260 px/s into
   the thrust, landing when the point reaches you. An archer backs off to keep 110 px instead of 50.
8. **commonDamage 1.25 -> 1.4** while the switch is on, recomputed when the switch is toggled.

No common foe got more health. New tell rows: `shield|counterTell` = `!` (block, low) in src/marks.js. The MARK table was
regenerated with `node tools/tells.mjs --write`.

## Switch OFF = byte-for-byte classic (the proof)

- The Hornet Queen pilot (tools/firsthour-pilot.mjs, pinned seed) with the switch off, run before and after this work, gives
  **identical rows**: knight win 49 s / 144 swings, warden 79.3 s / 273, pyro 65.2 s / 199, the same modes and the same hits.
- tools/weighty.mjs checks the classic side as well: the swarm still turns a blow (9 of 20), her mark is up from the first
  frame, a jump still comes out of a swing, no recovery, a Kingswood brute flinches to the first cut, no parry, no feint, no
  lunge from 70 px, and no archer backing off at 90 px. It also checks that the common blows are x1.25 off, x1.4 on, and x1.25
  again after toggling back.
- Each classic behaviour change sits behind `weighty()` or `weightyHere('kings')`. The random rolls are short-circuited behind
  the switch, so classic draws the same random numbers.

## Pilots, the Hornet Queen, 3 heroes x 1 seed (bot, 300 s cap, refill health)

| | knight | warden | pyro |
|---|---|---|---|
| classic (before and after, identical) | win 49 s | win 79.3 s | win 65.2 s |
| weighty, her health x1.35 | win 162.9 s | timeout (10% left) | win 104.9 s |
| weighty, her health x1.0 | win 84.7 s | win 268.1 s | win 120.6 s |

Even at x1.0 the bot takes longer than in classic. Its fighting style is to jump-cut out of swings, and the recovery stops that.
So the bot is no guide to her health (as the brief said: don't tune to the bot). I shipped **x1.2**, a reasoned figure: roughly
what the swarm armour was worth to a player, minus what the recovery costs him. The x1.2 value itself was **not piloted**
(the lane's pilot budget was already spent).

## Checks

Green: **weighty** (new; red on the base, where `BK.combat` does not exist), tells, combat-feel, juice, duck, answer-tags,
boss-fight-end, boss-openings, firsthour, foe-tactics, syntax, and the 7 REQUIRED: architecture, checkpoints, skins,
dangling-paths, boss-fight-end, slopes-trace (unchanged for every level), npc-removal. **untold-told** is green with the switch
off and with it on (`node tools/untold-told.mjs --combat=weighty`, a new flag), but not on every run. See the next section.

Not green, and not from this lane (both fail the same way on the base a4a1efc, run in a scratch worktree):
- **attack-tokens**: "only 3 red !! blows over both crowds - nothing to measure". It fails the same way on the base.
- **untold-told, the crow row**: it flakes on both base and branch, sometimes with 1-10 "untold" crow hits at 3.9-4.2 s and
  sometimes clean. The switch has nothing to do with the crow.

## UNVERIFIED

- Her health at x1.2 was not piloted (see above), and nobody has played the prototype by hand. The feel numbers are all first
  guesses in `WEIGHTY`: recovery 0.16/0.22/0.28 s, markAt 0.5, windK 1.3, feint 30%, parry 3 hits in 1.4 s.
- The recovery is in the main player controller only. The upside-down "flip" controller has its own jump and dodge and does not
  apply it.
- The bot (src/lab.js) was not taught the recovery.

## QUESTIONS FOR DANIEL (each with the option I built)

1. **Which boss?** Built: the Hornet Queen. Alternative: the Goblin Chieftain, if you want the Sodden-Knight sword duel. His sword
   stance's shield would be the gate to lift.
2. **Recovery length:** 0.16 s light / 0.28 s heavy, built. Try 0.22/0.35 if mashing still feels free. Should a new swing also wait
   out the recovery? Built: no, so a chain can continue, but every link commits.
3. **Her health on weighty:** x1.2, built (reasoned, not piloted). Play it and say "longer" or "shorter".
4. **Should a feint wear a mark?** Built: no, because a mark promises a blow (rule H). The icon, arriving halfway in, is what tells
   a real dive from a feint.
5. **Kingswood shield parry:** 3 hits in 1.4 s, built. Try 2 for a harsher guard.
6. **Game-wide later?** If you like it, the Kingswood rules generalise by widening `WEIGHTY.levels`. The Queen's hold, feint and
   body-first tells are hers alone, and each boss would need its own pass.
