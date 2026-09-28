# Lane report: claude/visualaudit (READ-ONLY visual audit of the whole game)

Branch `claude/visualaudit`, off master, fast-forwarded to `origin/master` (04e4319) before starting — batch37 had
landed 17 commits ahead. No game code was changed: this lane only writes docs (`docs/visual-audit/`) and captures
(`work/visual-audit/`). No level, boss, or src/ file was touched, so the level-changing REQUIRED CHECKS don't apply
(per the brief); `tools/dangling-paths.mjs` was run against these docs and passes (one new KNOWN HOLE line added
to it, for `docs/look-and-feel/`, same convention as the existing `docs/level-design/` hole — that file lives on
`origin/claude/lookfeel`, which hasn't merged).

## What was done

1. **`docs/visual-audit/bar.md`** — what actually makes the Ore Road and the (pre-rework, master) Stormhold read
   better: own set/props/backdrop depth, not colour. Six-item checklist for the next redress to pass. Includes the
   honest correction that the Ore Road itself still fails the art-direction colour rules (chroma 4.9, the worst
   measured in the game) — the gain Daniel's seeing is structural, not colour.
2. **`docs/visual-audit/levels.md`** — every campaign level (34 rows: 30 visible + underleaf/undercrown/3 shops),
   scored 1-10 on tiles/backdrop/props/light/foe-read, against this pass's own captures plus the three existing
   measured audits (`docs/art-direction.md`, `docs/visual-audit.md`, and `docs/look-and-feel/wood-to-highcrown.md`
   at `origin/claude/lookfeel`). Four levels (Hanging Village, the Monastery, the Ore Road, the Witchlight Stair)
   are marked **REWORK IN FLIGHT** and scored as master shows them today, per your instruction.
3. **`docs/visual-audit/foes.md`** — full foe/boss roster from `src/threat.js`, with what could actually be
   measured this pass without touching game code (`SPR` is module-private, not exposed on `window.BK`): live
   `HAS_HURT` diff against the roster, the existing camouflage measurements, and 59 bestiary-card captures (all 25
   `BOSS_T` bosses, 9 off-list minis/bosses, 20 common foes) for silhouette/size-ladder/palette spot checks.
   Confirms your Goblin Queen / King Gorm note (King Gorm's own bestiary text claims "three times the goblin"; the
   sprite doesn't deliver it) and finds two bestiary data gaps (the Facet/`golem` has no bestiary entry at all; nine
   real bosses are filed under FOES because `BOSS_T` is stale).
4. **`docs/visual-audit/lanes.md`** — 10 ranked art lanes, sized S/M/L, all Sonnet (no new boss/foe), each crossed
   against the booked Day-6 lanes (B+E light/colour, D+F backdrops) and HANDOFF backlog 21b so nothing gets booked
   twice. Top two are zero-new-art wiring of already-painted, unwired redress code
   (`src/redraw/redress2.js`, `src/redraw/crag_redress.js`).

## Captures

`work/visual-audit/` — one screen per level (35 levels x 320x180 native + 2x = 70 files), one mid-route tile
position per level from `tools/pacing.mjs`'s own route data. `work/visual-audit/best/` — 59 bestiary-card
captures. Total 6.3M + 7.1M = ~13.4M, PNG only, no video. Chrome was not left open (each capture script closes its
page in a `finally`); `node tools/profile-sweep.mjs --kill-orphans` was run once mid-session, found nothing to
clean up. Capture scripts (`tools/_audit-capture.mjs`, `tools/_bestiary-capture.mjs`) were scratch and are not
part of this commit — deleted before committing, since the brief asks for docs + captures, not new tooling.

## Checks run

- `node tools/dangling-paths.mjs` — **green** (2513 tracked files, all citations resolve; 8 known holes, all
  pre-existing except the one line this lane added for `docs/look-and-feel/`).
- No other named check applies — no level, boss, or code file changed.

## UNVERIFIED

- **Full per-foe frame-by-frame pose counts** (hurt/tell/death/idle counted individually) were NOT independently
  re-measured for all ~150 foe/boss types — `SPR[t].R` is module-private in `src/main.js`, not reachable without a
  code change, which this read-only lane won't make. What foes.md gives instead: the live, authoritative
  `HAS_HURT` set (which foes have a body hurt-frame at all) crossed against the existing measured camouflage audit,
  plus direct bestiary-card looks at the highest-value sample (every boss, plus the camo-flagged and desert-arc
  foes). A future lane with either a small, explicit `SPR`/frame-count export or more time to script the in-game
  bestiary as a full contact sheet could close this gap precisely.
- **The reworked levels' final state** (Hanging Village, Monastery, Ore Road, Witchlight/Hedge Warden) — scored as
  master shows them today; whatever lands from the other branches will need a re-score, not a re-audit from zero.
- **A full per-icon "wrong sprite / off-theme reuse" sweep** (the class of bug the brief's "Geomancer-icons"
  example points at) was not done for all ~150 foe types — spot-checked on the 59 captured this pass, nothing
  stood out, but this isn't a clean bill of health for the rest.
- levels.md's 1-10 scores are this pass's own judgement calibrated against the three existing measured audits'
  numbers where they exist (15 of 34 levels have hard L*/chroma numbers from the lookfeel review); the other 19
  are scored from this pass's own capture plus the older visual-audit.md ranking, not from a fresh photometric
  measurement.

## QUESTIONS FOR DANIEL

1. **Book the two zero-new-art wiring lanes (Highcrown+Undercrown, the crag redress) ahead of everything else?**
   They're existing, unwired, already-painted art — the highest gain-per-hour in the whole audit.
   *Recommendation: yes, first.*
2. **Do the Ore Road / Monastery / Stormhold colour lanes wait for their structural reworks to land, or run now in
   parallel?** Running now risks a merge fight with whoever owns the layout changes.
   *Recommendation: wait for the reworks to merge, then book the colour pass as a follow-up.*
3. **Is HANDOFF 21b's crag-prop-set item already staffed?** This pass can't tell from the repo whether it's booked
   or just written down, and it's the single biggest remaining props/dressing gain across the seven-level crag arc.
   *Recommendation: check before booking `lanes.md` #9 — if it's unstaffed, book it as written; if 21b already
   covers it, drop #9 rather than duplicate.*
4. **Three distinct shop interiors (wood/crag/sea) or one shared kit?** The shops are the single worst-scoring
   level group in the game (3.2/10, unchanged since 2026-09-21) and currently have zero backdrop.
   *Recommendation: three small, distinct kits — they're different places, and a shared kit is just a smaller
   version of the same wallpaper problem the wood/mage de-wallpaper lane is fixing elsewhere.*

## Top 10 ranked art lanes (full detail and overlap notes in `docs/visual-audit/lanes.md`)

1. Wire Highcrown + the Undercrown's existing redress (S)
2. Wire the crag redress — Scree/Hanging/Stormhold skies+ground (S)
3. The three shop interiors, a backdrop each (S)
4. De-wallpaper Burial Caverns + the Mage's tower/Falling Tower (M)
5. Ore Road colour pass, post-rework (S)
6. Monastery colour pass, post-rework (S)
7. Stormhold colour pass, if the held rework branch doesn't already carry it (S)
8. Gale Moor's own backdrop, stop borrowing the Scree Path's sky (S)
9. A crag prop set that isn't the same crag set under seven levels — this IS HANDOFF 21b (M)
10. Foe camo + missing-hurt-pose cluster: bat, snuffer, lamprey, petrel (S)
