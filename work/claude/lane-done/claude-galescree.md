# claude/galescree — lane report (2026-09-27)

Daniel's week-1 plan, day 2: **Lane CRAGS: GALE MOOR + THE SCREE PATH**, from the design audit
(`docs/level-design/wood-to-highcrown-design.md`, read off `origin/claude/designaudit` — that branch is not merged
here, only the two sections and the game-wide notes that name these levels). Everything is on `claude/galescree`
and pushed. I did not touch master, did not touch any other lane's branch, and did not deploy.

Commit: `2143290`.

## GALE MOOR (`src/level.js`, `galeMoor()`)

The audit's plan, four S beats:

1. **DEVELOP the mills** (402-454 raw / section `mills`). The mill gust was scenery (`k: 0.35`, no shove) — it turned
   the sails and barely touched you. It now has two zones: the low band (rows 9-24) keeps turning the sails without
   shoving you at ground level, and a new **told shove** over the tops of the sails (rows 2-8, `period 5, on 1.8`,
   the moor's one shove rhythm) throws you off a sail you rode up and on toward the next one.
2. **TWIST at the bracing stones** (254-297, section `bracing-stones`). A sail goblin (`sailer`) now stands on the
   last stone. `sailer`'s own AI already fills and is carried by whatever gust zone she is in (`updateSailer`,
   `windAt`) — she needed no new code, only a place in the existing headwind. Block her and she spills into the
   thorns below, per the bestiary text.
3. **COMBINE: the Tumble** (495-534, section `tumble`). Its gust was a plain `alt` gust over a continuous floor —
   turning it into a shove headwind outright would have failed `moor-gusts.mjs`'s "stones or posts, not a floor"
   rule, so the three mounds narrowed from 4-5 tiles to 2-3 (the rule's own limit), and the gust became a real
   **told shove headwind** on the moor's one rhythm, restricted to the rows above the floor so the mounds are the
   only footing it sees. Bales already roll on `windAt`, so they roll on the gust's own beat for free; hornblowers
   are unchanged (their trigger is proximity/timer, not the gust phase — see **unverified** below).
4. **EXAM** (535-646, sections `kite-post` + `sky-road`). A short kite-up practice (an updraft vent to a floating
   stone) sits before the kite itself, so the post examines a verb the moor already taught rather than introducing
   flight cold. On the Sky Road, a new told headwind burst sits over the organ pipes (rows 0-9, tighter and
   stronger than the road's own ambient wind, pushed earlier in `L.gusts` so it answers for that stretch) —
   flying low, under the pipes' tops, ducks it.

**Checks:** `moor-wind` and `moor-gusts` both green on the built level (14 gusts, 7 shove on one beat, rides/
headwinds/taught-safely-first all still hold). `W` is unchanged (703) and every section boundary is exactly where
it was — nothing downstream was renumbered.

## THE SCREE PATH (`src/level.js`, `screePath()` + `src/scree-rework.js`)

1. **Teach in order** (the cairn field, before the gully). A short forward scree run (`dir: 1`, no spikes under it)
   now sits just before the backward-dragging gully, so the first scree a player meets pushes WITH them. The
   climb-rock sign moved from the crag wall (where the rock is climbed a *second* time, previously the only place
   it was ever explained) to right by the gully's own climb face, where the rock is first met. The crag wall keeps
   a short reminder sign instead of repeating the same sentence (`tools/signs.mjs`'s same-sign check would have
   failed on the literal duplicate).
2. **TWIST loose rock** (the terraces). Two of the crest ledges over the second terrace are now `T.SHELF` (the
   snapping shelf, same mechanic as the reworked scree slope) instead of `T.ONEWAY`, and a rock-goblin thrower
   stands on the one ledge between them that holds. Standing still to trade blows with him now costs you a step.
3. **EXAM** (the glass quarry, 436-479 raw). The dead crystal floor — `S----R`, failing S3 in the audit — now
   carries a scree chute (`dir: 1`) down the low road, a loose ledge over it, two tiles of broken stone where the
   chute lets you off (matching the rest of the level's "never more than two" rule), a rockfall on a count over
   it, and a goat charging down it. The checkpoint before it (438) and the one outside it (the stile at the fold's
   gate) were already there and didn't need to move.
4. **The slope in the boss** (A11, the Ram Lord's fold). Widened from 16 tiles to 30, with a scree bank against
   the west wall. `updateRam`'s crash branch now checks which wall he hit against `L.arena.bank`: an ordinary wall
   crash is unchanged, but hitting the banked wall buries him deeper — more rock, `+0.8s` of extra daze, a bigger
   shake and a different call-out (`INTO THE BANK: HE BURIES HIMSELF`) — and `ramOpen()` already doubles damage
   through the whole crash either way. In the old 16-tile fold a charge crossed the room well inside his 3s timer
   no matter where the player stood, so the crash — his only real opening — happened on his own geometry, not
   because of anything the player did. At 30 tiles that is no longer guaranteed; standing on the far side when he
   lowers his head is what sends him into a particular wall, and only the banked one pays for it. That is the
   difference A11 asks for.

**Check:** `scree-rework.mjs` green (INDEX 114, within the act-opening step of Kingswood's 119; it was 86 before
that lane; 3.4 foes a screen; 12 tiles of loose rock; 16 of broken stone; every rework foe stands on footing).

## New check: `tools/ram-bank.mjs`

Added to `tools/check.mjs`'s list (verified with `grep -c "'ram-bank'" tools/check.mjs` → 1). It reads the built
Scree Path for the widened arena and the `bank` flag, then runs `updateRam` itself in a small VM (no page) with a
charge aimed at each wall in turn, and asserts the banked-wall crash produces a strictly longer daze than the
other wall's. This is the check for A11 as applied here — a boss's opening being *caused* is otherwise "advised,
not checked" per RULES-LEVELS-AND-BOSSES.md, so this checks the one concrete, measurable consequence of the bank
(the daze length) rather than trying to check "caused" in the abstract.

## Checks run (scoped: `node tools/check.mjs moor,scree,ram,crouch`)

```
 ok  syntax             5 files parse
 ok  scree-rework       all scree rework checks pass
 ok  ram-bank           fold 30 tiles, bank on x0; a wall crash daze 2.40s, the banked wall 3.20s
 ok  map-grammar        (name matches the filter on "gRAMmar"; unrelated to this lane, unchanged, still green)
 ok  moor-wind          Air rail carry/release, downdraft/lull/shelter, the cut (703 cols, 16 sections)
 ok  moor-gusts         14 gusts, every one told; 7 shove on one beat (5/1.8s)
```

I also ran (not part of the scoped set, for my own confidence, comparing every output against a `git stash`
baseline of the same command): `node tools/reach.mjs`, `tools/deadends.mjs`, `tools/traps.mjs`,
`tools/content-audit.mjs`, `tools/audit.mjs`, `tools/signs.mjs`, `tools/comments.mjs`, `tools/newlevel.mjs`. Every
line that mentions `scree` or `moor` matches the baseline except the intended changes (scree's INDEX rising from
86→114 in `scree-rework`'s own report, `moor`'s coins-outside-fill count moving by one — ASSISTED, expected from
new content near a gust). Nothing in these levels regressed.

## Proof of the new routes

- **Reach model:** `tools/reach.mjs` on both levels, matching baseline's ASSISTED annotations (movers/gusts the
  flood-fill can't follow) with no new non-ASSISTED gaps.
- **Real keys, not just the model:** `moor-gusts.mjs` §6 runs the actual `updateMoorWind` code in a VM with real
  key state (`keys.block`, `keys.down`, `jumpPress`) against the moor's own rides and headwinds — this covers the
  Tumble's new headwind and the mills' new shove by construction, since they're built with the same `ride`/`gust`
  helpers the runtime section already exercises.
- **In-page playtest bot**, before (`git stash`) and after, both levels, `knight`+`warden`:
  - Scree: baseline and after both `STUCK` at the same ~33-37% (the bot can't fight or read a tell — a known
    limitation, not a level bug). **Found and fixed along the way:** the first draft put the moved climb sign
    at a spot where its sprite pierced the ground by 7px (`RUNTIMEFLOATsign floating @247,13` — `checkDrawables`
    in `src/floatlab.js`, "pierce"), reproducible every run. Moved it to raw column 188 (clean, uniform floor);
    `checkDrawables` returns `[]` on the built level and the bot run comes back clean.
  - Moor: baseline and after both die 3 times, reach 40%, get stuck one tile later (271 vs 268) — same shape,
    unaffected by the new content.
- **Boss pilot, before/after** (`tools/ram-pilot.mjs`, 3 heroes × 1 salt, normal health, not added to the suite):

  | | knight | warden | pyro | wins | median damage taken |
  |---|---|---|---|---|---|
  | before (16-tile fold) | win, 23.6s, 29 dmg | win, 31.4s, 58 dmg | win, 14.3s, 22 dmg | 3/3 | 29 |
  | after (30-tile fold + bank) | win, 37.6s, 87 dmg | win, 48.7s, 86 dmg | win, 12.8s, 29 dmg | 3/3 | 86 |

  Still a clean 100% win rate; fights run a bit longer and cost more, which is the intended effect of widening the
  arena (the boss now spends more time charging before a wall ends it) — matching rule S8's "the number rises,
  as the bosses' do." The pilot bot doesn't strategically bait him toward the bank (it isn't scripted for that),
  so this measures the width change's general effect, not the bank bonus specifically; the bank bonus itself is
  proven directly by `tools/ram-bank.mjs`.

## Unverified / left as found

- **NPC-removal lane's cuts respected.** I did not restore Tam or any of the Scree's quest strays; the level still
  keeps only the last "ewe" stray, as the NPC-removal lane left it.
- **Hornblowers on the Tumble are not tied to the gust's beat.** The audit's plan says "hornblowers blow between
  beats" — I left `updateHorn`'s own proximity/timer trigger alone rather than wiring it to the gust phase, since
  that would touch shared boss/foe update code well outside this lane's scope for a flavor detail. The horns still
  threaten meaningfully alongside the new headwind; they just aren't phase-locked to it.
- **The garrison() / CLIMB float I found and left alone.** While iterating on the moved climb sign, `tools/audit.mjs`
  once reported a garrison-placed goat floating on a CLIMB tile at (428,9) — `garrison()`'s own `stand()` treats
  `T.CLIMB` as valid footing (correct for the player, wrong for a ground mob that can't cling), and my edits nudged
  which spot its seeded RNG landed on. It stopped reproducing once the sign moved again and I did not chase it
  further: it is a pre-existing mismatch in shared code (`src/level.js`'s `garrison()`), not something this lane's
  content caused on its own, and fixing it generally would need the full check suite re-run, which is outside this
  lane's budget. Flagging it for whoever next touches `garrison()`.

## QUESTIONS FOR DANIEL

1. **The Ram Lord's bank bonus is a flat modifier, not a bigger set-piece.** I gave the banked-wall crash a longer
   daze (+0.8s), more rock (+3), a bigger shake and its own call-out, all layered onto the existing crash — I did
   not add a new visual (a collapsing bank, buried scree sliding over him) because that would mean new art/anim
   work past an "S"-sized beat. *My recommendation:* ship the mechanical version now (it's real and it's checked);
   if the bank deserves its own moment, that's a follow-up polish pass, not a blocker.
2. **The kite-up practice is small** — one vent, one stone, inside the existing 16-column kite post rather than a
   true added 12 columns, because extending the section would have meant renumbering every section after it (moor
   is built as contiguous `o = N; section(...)` blocks all the way to the summit) for a small design gain. *My
   recommendation:* if you want the fuller version, it's worth its own beat rather than folding into this lane —
   happy to take it as a follow-up.
3. **The Tumble's narrowed mounds change its shape slightly** (4-5 tiles down to 2-3, to satisfy the shared
   headwind rule). This also makes the two hornblowers' footing narrower. I didn't reposition them since they
   still stand cleanly on the narrowed mounds, but it's worth a look-by-eye. *My recommendation:* leave it — the
   playtest bot's numbers (foes/100, gap, walked%) didn't move meaningfully.
