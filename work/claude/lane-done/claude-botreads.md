# BOTREADS report - claude/botreads (base origin/claude/harness 0b435b97)

Brief: Daniel approved two changes. (1) Every boss and mini bot plan that reads HIDDEN state now reads only what a player SEES. (2) A hazard is answered on its TELL, not only once it is already RUNNING. Both changes are in the v2/human profiles only, and the legacy bot is byte-identical. I re-measured the touched rows. No boss was retuned (the RETUNE lane follows).

## Headline
- **The Death Knight on the honest bot: practiced 18/18 = 100%** (knight 6/6, warden 6/6, pyro 6/6). It was 100% before too.
  - **First attempt: 14/18 = 78%** (knight 3/6, warden 6/6, pyro 5/6).
  - Mean damage taken per fight went from 141 to 157.
  - **The hidden reads were not why the bot finds him easy.** BOT2's suspicion was wrong: with his commit and ward seen a reaction late, the chain and the tide timed off their tells, and no count of string cuts, he still loses every practiced fight.
  - **His number is the honest bot's number now. Use it as-is in the retune** (see Q1).
- **Most plan rows went UP, not down.** The djinn, Jenny, the puppeteer, the roc and the Death Knight plans each put their own 0.25 s reaction (and misread) ON TOP of the perception layer's, so the bot reacted twice to every tell.
  - Removing that double reaction is more honest, and it makes the bot better.
  - BOT2's calibration (d=0.3) was fitted on three of those stacked bosses, so the standard profile should be refit (Q2).
- **The Kraken advice had a dangling `else`** (src/main.js krakenAdvice). The grab, hurl, jet, geyser, orb, lunge and roll tell answers ran only while he was HURLING. Under v2 they now run every frame. The legacy path still has the bug, byte for byte (Q3).

## Table: what each plan read before, what it reads now, and the rate before -> after
Measured with `PORT=8686 node tools/boss-rates.mjs <rows> --ways=practiced --seeds=6 --jobs=2`: profile human, campaign level, normal health, n=18 per row (6 per hero), 0 ERR rows.
- Before = base 0b435b97, in a separate worktree. After = this branch.
- Noise at n=18 is about ±20 points.

| row (boss) | read before (hidden or late) | reads now (v2) | before kn/wa/py = % | after kn/wa/py = % |
|---|---|---|---|---|
| unburied (Death Knight) | `boss.committed` instant (plus a 12-frame stack); `boss.strLeft`/`punish` (cuts left in a string, hidden); `boss.chainX` exact head; `boss.hands[].delay` (hidden countdown); `wardFill`/`wardLock` instant; its own 15-frame reaction stacked on perception | committed / wardFill / wardLock seen a reaction late (lab-perceive DRAWN, own dice); a follow-up cut = "the pose before was a cut"; chain and tide timed off their TELLS (time left as read + chain speed / the hand gap); no stacked reaction | 6/6 6/6 6/6 = 100 | 6/6 6/6 6/6 = 100 (first attempt 78) |
| canal (Jenny) | arm clocks `a.t` exact; bow-wave got a fresh 0.25 s reaction when it STARTED; heave/stuck delayed twice | arm clocks read with an error of about 0.06 s (its own die per arm); a wave whose charge tell was read is met as it comes; no double delay | 4/6 1/6 5/6 = 56 | 4/6 4/6 6/6 = 78 |
| theatre (Puppeteer) | puppet poses delayed twice; snare and sea wave reacted to only once SWEEPING / ROLLING; drop `d.t` and gust `G.t` exact | poses once; the snare/wave reaction runs from their drawn tell; drop and gust clocks read with an error | 3/6 5/6 6/6 = 78 | 4/6 5/6 4/6 = 72 |
| welltown (Djinn) | no `eyes`: 0.25 s + 13% misread stacked; sand blast aimed by the hidden `S.cur.x`; devils/wave answered only once the band ran; whirl only once turning | eyes; blast = where it stood when it SAW the tell; a band whose tell was read is met at once, an untold band after a reaction; whirlTell answered | 2/6 3/6 5/6 = 56 | 4/6 5/6 5/6 = 78 |
| underwell (Cistern Queen) | roll direction `S.cur.dir` (hidden); roll/ambush answered only once running; under eyes, bands and rubble got ZERO reaction | `e.face` (drawn); roll/ambush jump timed off the tell (time left + her speed; the ambush from the tunnel's dust); a told band or stone at once, an untold one after a reaction | 5/6 1/6 5/6 = 61 | 5/6 4/6 6/6 = 83 |
| welltown:mini (Gang Leader) | walk `e.modeT` (his hidden gap timer); dash answered only once running; bottles zero reaction | gap counted from when he was SEEN to walk, against his rhythm; dash rolled/jumped off the dashTell's time left; a bottle from an unread throw is seen after a reaction | 5/6 3/6 5/6 = 72 | 3/6 4/6 3/6 = 56 |
| redgorge (Raptor Matriarch) | in v2, debris, quills and brood stoops got zero reaction; dive landing read off her flight's `fly.tx` (no mark drawn then) | told debris/quills at once, untold after a reaction; brood stoop seen a reaction after its watch starts; the dive lands where the drawn mark WAS (remembered) | 2/6 0/6 6/6 = 44 | 5/6 0/6 6/6 = 61 |
| skyroad (Roc) | its own 0.2-0.35 s lag stacked, and re-armed when a tell became its blow (the dive branch could be skipped); gale side `e.side` hidden in gustTell | eyes: no second lag; in gustTell the side is read from where she flew | 6/6 3/6 6/6 = 83 | 6/6 5/6 6/6 = 94 |
| causeway (Kraken) | the dangling else: tell answers only during `hurl` | the tell chain every frame (v2) | 3/6 1/6 2/6 = 33 | 5/6 2/6 2/6 = 50 |
| scree (Ram) | charge answered only once `charge` was perceived | a TOLD run (lower/rear seen in the last 1.5 s) is answered off his moving body | 3/6 4/6 2/6 = 50 | 3/6 4/6 2/6 = 50 (identical) |
| witchlight:mini (Hedge Warden) | rush jumped only once `rush` was perceived (unshielded) | told rush, off his body | 6/6 2/6 5/6 = 72 | 6/6 1/6 4/6 = 61 |
| oreroad (Winchmaster) | ride jumped only once `ride` was perceived | told ride, off the skip | 6/6 1/6 3/6 = 56 | 6/6 1/6 3/6 = 56 (identical) |
| waymeet (Closed Helm) | bash rolled only once `bash` was perceived | told bash, off his body | 2/6 1/6 6/6 = 50 | 4/6 0/6 6/6 = 56 |

**Not touched** (from the audit; listed for a next pass):
- Reads taken off a drawn object, but as an exact projection:
  - the Undead Mage's bone-storm gaps and orbit look-ahead;
  - the Dune Worm's locked ripple target `r.tx`;
  - the Goblin Queen's court flag and air countdown;
  - the Lamp Reeve's `target`;
  - the matriarch's legacy-shared `S.fly.tx` line.
- Unshared answers that only read the drawn thing:
  - Gargoyle, Pyromancer, Buried Dead, Kraken roar: the projectiles in flight;
  - Windcaller: the twister.
- The Owl, Ploughman and Homunculus jump tells are rolled by the generic tell branch first.
- Never answered at all:
  - the puppeteer's broken-board pits;
  - the queen's spit and stones in flight;
  - the roc's feathers.
- Dead or stale code in lab.js:
  - `KA.block` is never set;
  - Jenny's `show.weed` and `pl.meet`.

## How the changes are built
- **src/lab-perceive.js `DRAWN`:** per boss, the extra fields that ARE drawn are seen a reaction late, on their own dice stream ('drawn|' + key). Only `bloodknight` has fields: committed, wardFill and wardLock. Any other boss's eye stream is untouched.
- **Each plan module takes `s.eyes` (lab.js passes `!!LABP.v2`):** djinn, Jenny, puppeteer and roc are new; queen and gang leader already had it. The matriarch uses `s.v2`. Every change is behind that flag; legacy passes none.
- **The same rule in every plan:** a band, bottle, debris or quill whose TELL was read in the last 2.5 s is met as it comes. One whose tell was missed is seen `react` after it first appears. Objects are tracked in a WeakMap.
- **src/lab.js `toldRun`:** a charge, rush, bash or ride whose tell was perceived in the last 1.5 s is answered off the boss's drawn, moving body.
- **src/main.js:** `krakenAdvice(v2)` and `BK.krak(v2)`. The tell chain is a function: legacy calls it from the dangling else as before, and v2 also calls it every frame.

## Checks (all exit 0; output byte-identical to base 0b435b97, diffed line by line)
I ran each on this branch and on base, then diffed the outputs: lab-order, normal-health, small-adds, lab-reach, boss-navigation, combat-replay, unburied-fights, puppeteer, kraken-rework.

Node-only checks:
- comments: green.
- raptor-matriarch: green.
- boss-read: green.
- `node --check` on every touched file: green.

Red:
- **dangling-paths (pre-existing).** It fails the same way on base 0b435b97: the visualaudit docs line. Not mine.

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The Death Knight is 100% on the honest bot.** Rec: the RETUNE lane treats his row as a real HARDER +40, starting from your playtest. The bot now reads him as a player does and still never loses practiced; first attempt is 78%. Built: nothing on him (no retune here).
2. **Refit the human profile.** BOT2's d=0.3 was fitted on the Puppeteer, Jenny and the Djinn while their plans reacted twice. With the double reaction gone, Jenny reads 78 (you said easy, ~80), the Djinn 78 (you said a little too hard, ~42) and the Puppeteer 72 (you said good, ~55).
   - Rec: run `node tools/bot-calibrate.mjs --feel` on this branch before the retune sweep. I expect it to land on a sloppier dial.
   - Built: nothing. It moves every lane's numbers, so it is your call.
3. **The Kraken's dangling else in the legacy bot.** Rec: fix it for legacy too, then re-baseline the kraken checks. The legacy bot never answers most of his tells. Built: v2 only, because the legacy path had to stay byte-identical.
4. **The welltown:mini Gang Leader fell 72 -> 56 and the Hedge Warden mini 72 -> 61.** The bot is now honest about bottles thrown while it was not looking, and about his gap. Rec: leave them for the RETUNE lane (they are within noise of their bands). Built: nothing.

No music this lane.
