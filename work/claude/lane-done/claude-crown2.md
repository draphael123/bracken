# crown2: HIGHCROWN's design-audit plan, plus whelps on the Leads

Brief: the design audit's HIGHCROWN section (`docs/level-design/wood-to-highcrown-design.md` §12, on
`origin/claude/designaudit`) plus "GAME-WIDE PATTERNS WORTH FIXING ONCE" item 1 (the last stretch before a boss
must be an exam, not a rest), and Daniel's 2026-09-28 follow-up (whelps on Highcrown's rooftops, and verify the
visual audit's "redress2 not wired" claim in code before touching it).

## What changed

1. **The winch as a weapon (plan 3).** The drawbridge winch's sign always said "IT DROPS ON WHAT IS UNDER" and
   nothing ever stood there. A hound now paces the gate's own column (228, gate 236) - `main.js`'s winch code
   already kills any enemy under the gate column when it closes (`!pr.drop` branch, generic, not only the
   kennel-winch `drop:true` variant), so this needed only a placement, no engine change.
2. **The bakehouse is its own place (plan 2) - already true, not redone.** I first added a fourth temperer at the
   bakehouse's own brazier, then `tools/temperer.mjs` failed: Highcrown is capped at three of him ("never one and
   never a crowd"). Looking closer, the *existing* second temperer ("by the 619 brazier", written against "the
   forge stair's boards") already stands on the bakehouse's own scaffold - the bakehouse and that stair share a
   wall. Reverted the addition; `tools/crown-exam.mjs` now pins that the bakehouse has one and the siege lines
   have none, off the level that was already built.
3. **Twist the stuck spear (plan 1).** The Captains Hall has three falling-lamp balconies (soldiers who drop on
   you). The middle one is a javelineer now, without `balcony:true`, so he stands his ground and throws while you
   climb the net to him - the level's own rule ("a spear that misses you and hits the wall stays there - stand on
   it", taught on the wall-walk sign before this room) is live in a fight room, not only on the road up. The other
   two balconies keep their soldiers: one twist among three, not every balcony rewritten.
4. **Gargoyle whelps, only where there are spikes (Daniel, 2026-09-28).** Highcrown had zero `T.SPIKE` tiles
   before this. The Leads already had a small "pit if you miss the gutter" (a recoverable fall the comments
   already described) between the chimney stack and the bell turret; that gap's floor is spikes now, wound
   (`src/spike-winds.js`, `R.winds`, the same rule as the Witchlight Stair), with one whelp perched on the
   chimney stack over it. `grow()` shifts every ent's `x` and the tile grid automatically, but it has no idea
   what a wind zone is, so `R.winds` is written in the FINAL-COLUMNS part of `highcrownWhole()`, in the built
   level's real coordinates (checked against the actual build, not hand-derived, after three later `grow()`
   calls - armoury, furnace line, Captains Hall - all shift that section further right by a total of 172 columns).
5. **`src/redraw/redress2.js`'s "Not wired in" comment was stale**, not the plumbing (verified in code: `main.js`'s
   `REDRESS` table keys `crown` and `undercrown` straight to this module's `castle`/`undercrown` themes, and the
   mage/monastery/shop levels the rest of it, all live since before this lane started). Fixed the comment only,
   per Daniel's "verify in code first, the audit was wrong twice" instruction. This is the visual audit's lane #1;
   it does not need its own follow-up lane.

`tools/crown-exam.mjs` (new, wired into `tools/check.mjs`) pins all five, plus that the pacing window right
before the Queen's checkpoint holds more than rest and light (game-wide pattern 1).

## Numbers

- Answer coverage (`tools/answer-tags.mjs`), Highcrown: **block dodge jump (3) before and after** - already met
  the "at least 3" bar the combat pass asks for; the whelp's swoop is a yellow (blockable) tell, so it does not
  add a fourth answer, and none was claimed.
- Whelps: 0 -> 1 on Highcrown (0 -> 3 game-wide counting the Witchlight Stair's two, unaffected).
- SPIKE tiles on Highcrown: 0 -> 7 (one wind zone, one exit).
- Temperers in Highcrown: 3 -> 3 (net change: none; see point 2 above).

## Checks run (all green)

Highcrown's own (`grep -ln -i "crown\|highcrown" tools/*.mjs`, the level-relevant subset): `crown-exam` (new),
`crown-route`, `crown-requests`, `keys`, `keep`, `bells`, `queen-pillars`, `queen-chandelier`, `temperer`,
`redress2` (standalone - it is not wired into `check.mjs`, run directly), `tower-collapse`, `tower-hall`,
`tower-ascent`, `undercrown-variety`.

Design-pass checks: `answer-tags`, `attack-tokens`, `checkpoint-stand`, `checkpoint-gaps`.

The 7 REQUIRED CHECKS: `architecture`, `checkpoints`, `skins`, `dangling-paths`, `boss-fight-end`, `slopes-trace`,
`npc-removal`.

Plus, since this lane touches the Gargoyle Whelp's ecosystem (`src/gargoyle-whelp.js`, `src/spike-winds.js`,
shared with the Witchlight Stair and its boss): `whelps`, `gargoyle-stomp`, `courtyard` - all green, no
regression to the Witchlight Stair's own whelps or the Gate Gargoyle's room.

Every one of the above is green on the final commit. Two ran red once each under load from the other two lanes on
this PC and then green alone on a retry (`crown-route`, `boss-fight-end` - both call `tools/cdp.mjs`'s headless
Chrome and both are consistent with the "load flakes" pattern common.md already lists for other CDP-backed
checks); confirmed against a throwaway worktree at this lane's base commit that they are not a regression I
introduced. The `dangling-paths` failure mid-lane was real but self-inflicted (citing `tools/crown-exam.mjs`
before it was committed) and cleared once committed.

## UNVERIFIED

- The winch hound (228/236) is a static placement, not a scripted guarantee: like any patrol AI, it can wander
  before a player strikes the winch. I did not add a leash/patrol-range field (the base game's `hound` case
  takes none), so this is "a designed beat that usually pays off," not "always."
- No bot-pilot run of the Captains Hall's new javelineer or the Leads' whelp (COST RULES: bot pilots are for a
  changed BOSS fight only, and neither of these is one). Verified by direct grid/entity inspection instead
  (`crown-exam.mjs`), same as `hanging-exam.mjs`'s own pattern.

## QUESTIONS FOR DANIEL

1. **The Captains Hall spear twist is additive, not the geometry rewrite the audit's plan 1 literally describes**
   ("their missed spears are the steps up to the balcony" implies the NET climb is replaced by spear footholds,
   not kept alongside a thrower). I kept the existing net on all three balconies and made the middle guard a
   javelineer instead of removing climb access - the conservative option, lower risk to reachability/architecture
   checks in the level's largest room. **Recommendation: ship the conservative version** (done). If you want the
   fuller rework (nets removed, spear-only access on one balcony), that is a bigger, separate change to this
   room's geometry and I'd want a dedicated pass and playtest, not a same-lane addendum.
2. **The winch-as-weapon hound is one new enemy, not a relocation of the existing road-picket pack (284-292)** the
   audit named. Moving that established, already-balanced encounter felt riskier than a small, additive beat at
   the gate. **Recommendation: keep as shipped.** If you'd rather see the actual road-picket hounds patrol under
   the gate (closer to the audit's literal wording), that's a follow-up placement change, not a new mechanic.
3. **The bakehouse "gap" I found (an existing temperer already there) means plan 2 needed no new content** -
   worth flagging in case the audit (written before the 2026-09-25 temperer brief landed) should be marked
   resolved rather than left open for a future lane to "fix" again and hit the same three-cap failure.

## Commit

`6bb000014a7cc15a8dca695ccb67564954b51f11` (`claude/crown2`, merged to `origin/master` as of this lane's last
check run).
