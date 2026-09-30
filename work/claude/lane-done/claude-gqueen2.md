# claude/gqueen2 — lane report (2026-09-29): THE GOBLIN QUEEN HOLDS COURT

Daniel played her and said *"she's basically the Ram Lord - just ramming into walls."* This lane builds the design he approved.
She no longer charges. She holds court, and you bring her hall down on her. Her other attacks and her numbers (health,
damage) are unchanged. The brief as built is `docs/briefs/goblin-queen-court.md`.

## What changed

**Her charge is gone.** `chargeTell`, `charge` and `dazed` are removed from `updateGQueen`: the bait, the charge chain
entry, the wall daze, the pillar shake in her tell and the `r.hitX` stumble. Nothing in her fight asks about a wall any more.

**Round one (100% to 66%).** I kept her existing round breaks at 66% and 33%; 66% is close to the ~60% the design asked for.
- **She leaps about her hall** (`hallLeapTell` → `hallLeap` → `quake`). Each leap is told with a red `!!` (with the JUMP
  mark beside it) and her shadow on the floor where she will land, drawn through the whole tell and flight with a red ring
  showing the quake's reach.
- **The landing is her one new attack, THE QUAKE.** Waves run both ways along the floor, and a shock hurts a hero
  standing within 70 px (`DMG.gqSlam`). A hero in the air takes nothing from it. New rows in `src/marks.js`: MARK `!!`
  (written by `tells.mjs --write`), ANSWER `jump`, HEIGHT `low`.
- **She holds court.** At the top of her chain she leaps to the standing pillar nearest you and lands on its far side,
  46 px off it. She lands with the quake, turns her back to you and points for **3.5 s** (I took the middle of the
  3-4 s you recommended). While she points, her gallery looses where she points: a red cross appears on the floor under
  you, and five arrows land on it 0.9 s later. This repeats every 1.15 s of the hold.
  - This is the old throne `point` case, which had been unreachable since 4a8ec47, reworked for the hall.
- **The hero breaks the pillar.**
  - It takes three blows on the pillar's own box. That check runs in `updateCastleProps`, separate from her body, so her
    plate never eats a blow on the pillar (tested with her body over the pillar).
  - The crack widens with each blow and is drawn in three states: none, a split, then a wedge out with the drums sitting
    off true. Each blow knocks chips off and drops dust from the capital.
  - After the third blow, **"IT GOES"** is called and the pillar **totters for 1.7 s**. It rocks harder as the time runs out.
  - Then it falls toward her if she is on the floor within 150 px of it, and **pins her** through the same `gqPin` as
    before (4.6 s, 7% of her health, open).
  - If she is anywhere else when it falls, it falls away from the hero and is wasted: only its rubble platform is left.
- **The pillars stand again** at round three and on a retry. They do not stand again in round two.
- **The door sign** (passes textfit): `HER PLATE TURNS BLADES. BREAK THE PILLAR SHE HOLDS COURT BESIDE: IT COMES DOWN ON HER.`
- **The hint** after her first warded blow names the new rule. In round two it names the plate.

**Round two (66% to 33%).**
- **The pillars stay down.** Her court leaps land about 84 px from you, anywhere on the floor, and she points with her back to you.
- **Her plate has its own bar** under her health bar: 6 pieces, notched, with a flare when struck (`drawGqPlate`). Only
  two things take a piece:
  - a **chandelier** on her: 2 pieces, and it still pins her;
  - a blow **while she points** that lands on her **back** or is **heavy**: 1 piece, at most one per 0.5 s.
  - That makes three chandeliers, six back blows, or any mix. A blow while she stands does nothing to the plate, from
    her front or her back.
- **When the bar empties the plate shatters.**
  - 22 pieces of violet plate spin off and bounce on the floor.
  - The sound is the synth set's `dkWardBreak` + `golemShatter` + `crack`, with a camera kick and a flash.
  - The callout is `HER PLATE IS OFF`.
  - From then until round three, `gqOpen` is true: every blow lands at its base damage, like any foe. Her boss bar
    reads OPEN.
- **Plate off, she fights like a duelist.** Every move is told, and nothing untold was added:
  - her leaps come every 2.2 s instead of 4.5, spend 0.6 s in the air instead of 0.75, and land on you;
  - the sceptre comes back to her hand straight into a told sweep if you are within 80 px, or a told leap at you if not;
  - she holds court every 3.6 s instead of 6, for 2.6 s each time;
  - her decree comes every 6 s instead of 9.
  - Her health is not raised.

**Round three (33% to the end).**
- This is the round your brief calls "the roof". The code's roof round (`onRoof`) was already retired, so the round that
  plays is this one, in her hall.
- It plays as it did: her plate is whole (only a pin opens her), her shadow step comes first, and her crown burns at 15%.
- The pillars stand again, and her court leap takes the slot her charge had. Without that the pillars would do nothing
  in this round (question 1).

**The bot (`src/lab.js`).**
- **Round one:** it waits by a pillar and cracks it twice while she is more than 110 px away. When she lands beside the
  pillar and points, it gives the third blow. It stands clear of the fall.
- **Round two:** it strikes her back while she points, and uses the chandelier play as before.
- **Plate off or pinned:** it cuts her as an open boss (`OPEN0` and `BK.bossOpen` now answer `gqOpen`).
- **The quake:** it jumps as she comes down within 100 px of it, and jumps her floor waves. This happens even while she
  is open, because plate off she leaps at you.
- Nothing is broken or dropped for the bot: every pillar blow is a real swing.

## Pictures
- `work/gqueen2/before-charge-tell.png`: master (d78b15e), her charge tell into a pillar.
- `work/gqueen2/court-sheet.png`: after, six frames from the page's own buffer (`tools/queen-court-shots.mjs`):
  1. her leap told, with the `!!`, the jump mark and her shadow;
  2. her holding court beside a pillar after one blow;
  3. the pillar after two blows;
  4. the pillar tottering after the third;
  5. her pinned under the fallen shaft;
  6. round two, `HER PLATE IS OFF` with the shards.

## Pilots
Boss lab on crown, refill health, 300 s cap, 1 seed per hero (`tools/queen-pilot.mjs 300 1 knight,warden,pyro`; I added the
hero list argument). Logs: `work/gqueen2/pilot-before.txt` and `pilot-after.txt`.

| hero | before (master) | after |
|---|---|---|
| knight | win 130.9 s: 4 pillar pins, 1 chandelier, 6 charges | win 87.2 s: 3 pillar pins, 1 chandelier, plate off at 69 s, 4 courts, 5 quakes, 0 charges |
| warden | win 56.0 s: 2 pillar, 2 chandelier, 2 charges | win 120.3 s: 4 pillar, 1 chandelier, plate off at 79 s, 5 courts, 0 charges |
| pyro | win 89.4 s: 3 pillar, 2 chandelier, 3 charges | win 48.7 s: 2 pillar, 2 chandelier, plate never broke (round two went on chandelier pins), 0 charges |
| median win | 89.4 s | 87.2 s |

Damage the hero took per minute, before and after: knight 218 → 141, warden 88 → 98, pyro 278 → 113. After the change,
what hit the knight most was her court (the arrows at 110), not her slam.

## Checks
- `tools/queen-court.mjs` is new and in `tools/check.mjs` in place of `queen-pillars`. **It was red on d78b15e**, with
  the chain, quake, court, pillar, plate and shatter items all failing; the output is in
  `work/gqueen2/court-red-on-d78b15e.txt`. It is green on this branch (`work/gqueen2/court-1.txt`).
- **The old queen-pillars check (its tool file) is deleted and removed from check.mjs.** Its asserts (three pillars, rubble is drawn floor,
  the pin matches the chandelier's, every hero, the lab gets a pillar pin) are folded into `queen-court`. The old brief is
  marked superseded.
- Green (`work/gqueen2/checks.txt`, plus a separate signs/textfit run): queen-court, queen-chandelier, boss-openings (A11), arena-supplies, tells (after `--write`: the `gqueen|chargeTell` row went and `gqueen|hallLeapTell` !! came in), answer-tags, untold-told, attack-tokens, boss-fight-end, boss-jump, signs, textfit, comments, homepaths, syntax, and the 7 required: architecture, checkpoints, skins, dangling-paths, boss-fight-end, slopes-trace (unchanged for every level, no rebase), npc-removal. The full suite was NOT run. After merging origin/master (conflicts in main.js - windingUp, the boss bar, BK.bossOpen - and check.mjs, all names from both sides kept; tells --write) I re-ran syntax, tells, answer-tags, comments, dangling-paths and queen-court: green.

## UNVERIFIED
- **Not played by hand.** Nobody has judged by eye in motion whether the crack states, the totter and the shadow read.
- **The crack states are small at 1x.** On the contact sheet the hero stands in front of the crack, so a player may read
  the dust and "IT GOES" more than the crack itself.
- **Frame 5 of the sheet is mostly dust.** The toppling shaft is behind the burst at that moment.
- **Round three was only checked for what it keeps** (the shadow step first, the plate whole, the pillars standing). No
  pilot looked at round three separately.

## QUESTIONS FOR DANIEL
1. **Round three's charge.** Removing the charge also took it out of round three, which you asked to leave unchanged. I
   put her court leap in its place so the re-stood pillars still do something. *Recommendation: keep it.* The
   alternative is round three opened only by chandeliers, which is slower and teaches nothing new.
2. **The plate comes back in round three.** Your brief said "gqOpen true for the rest of phase 2", so I built it that
   way: round three starts plated, with the ward shell back. *Recommendation: keep it (built)*, but it may want a callout
   ("HER COURT ARMS HER AGAIN"). The other option is to leave the plate off for the rest of the fight.
3. **A back blow is almost every blow.** While she points she keeps her back to you, so every blow struck in reach while
   she points counts. The 0.5 s limit makes six blows take about one and a half holds. *Recommendation: keep it* (it
   matches "her back is to you when she commands"). If it is too quick, cap a hold at 3 pieces.
4. **Pillars wasted in round one do not come back** until round three. With all three wasted, the chandeliers are the
   only way to pin her until 66%. *Recommendation: keep it* (the pillars cost something).
5. **Pillars still standing at 66% stay up in round two.** They still pin her if she happens to hold court beside one.
   *Recommendation: keep it.* Or bring them all down at the round change ("the storm brings them down") for a pure
   plate round.
6. **The bot's win times barely moved** (median 89 s → 87 s, 3/3 wins). *Recommendation: play her before tuning.* If
   round one is too easy, shorten her hold to 3.0 s. Never raise her health.
