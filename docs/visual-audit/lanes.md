# Ranked art lanes (2026-09-28)

Each lane: one level-group or one foe-group, sized S/M/L, Sonnet (per `bracken-lane-models.md` — art/level/polish
lanes are Sonnet; Opus stays for boss/new-foe lanes only, and none of these add a new boss or new foe). Ranked by
**gain per lane** — how much of the level/foe's score in `levels.md`/`foes.md` moves, against how much art has to be
made new versus just wired up.

Two lanes are **already-painted, unwired art** — no new art at all, the single best gain-per-effort in the whole
list. Everything below crosses against the booked Day-6 visual lanes (**B+E = light/colour**, **D+F = backdrops**)
and HANDOFF backlog 21b (weak props: Unburied catapult+carts, the lanternPost, one crag set under seven levels, one
tree wall under three, washed-out Ore Road/Monastery/Stormhold, fatter Goblin Queen + King Gorm) so nothing gets
booked twice — see the OVERLAP column.

| # | lane | group | size | gain | overlap |
|---|---|---|---|---|---|
| 1 | **Wire Highcrown + the Undercrown's existing redress** | crown, undercrown (2 levels) | S | levels.md scores 3.4 and 3.6 → the art (`src/redraw/redress2.js`'s `castle`/`undercrown` themes) is already painted, per `docs/visual-audit.md`'s "Fixes 2-4 done (as art, not wired)". This is a wiring task in `main.js`'s backdrop setup and `resolveTiles`, not a paint task. | **21b** names Highcrown/Undercrown's crag-set reuse directly — same fix. Check with whoever owns 21b before booking. |
| 2 | **Wire the crag redress (Scree/Hanging/Stormhold skies+ground)** | scree, hanging, storm (3 levels) | S | Also already painted (`src/redraw/crag_redress.js`), per the same doc. Scree currently 5.6, Hanging 4.4 (rework in flight), Stormhold 4.0 (rework in flight — check `claude/stormhold` first). | **Overlaps D+F (backdrops)** directly, and the crag-set-reuse half of **21b**. Also overlaps the Hanging Village/Stormhold reworks in flight — confirm those branches don't already carry this before booking. |
| 3 | **The three shop interiors, a backdrop each** | shop, shopCrag, shopSea | S | Worst score in the game (3.2, unchanged since 2026-09-21). No backdrop at all currently — a wall, a shelf, a counter. Any backdrop moves this level group the most per hour of any level in the game. | None named in Day-6 or 21b — clear to book. |
| 4 | **De-wallpaper Burial Caverns + the Mage's tower/Falling Tower** | burial, mage, fallingtower (3 levels) | M | 3.8/3.8/4.0. Break the grid (vary spacing, mix motifs, add depth) per `docs/visual-audit.md`'s fix #4 — not yet done, unlike the crag/castle fixes. | None named — clear, but touches the same "wallpaper" pattern class as 21b's crag-set/tree-wall reuse; worth a shared prop pass if D+F is also touching these. |
| 5 | **Ore Road colour pass (post-rework)** | oreroad | S | Structural rework is already in flight elsewhere; this lane is ONLY the colour/light half — warm the lamps, lift chroma from 4.9 toward 7+, tint or cap foe edge-light so they stop reading pale. Don't touch layout. | **Directly booked as B+E (light/colour)** and named in **21b** ("washed-out Ore Road"). Coordinate with B+E owner — don't duplicate. |
| 6 | **Monastery colour pass (post-rework)** | spire | S | Same shape as #5: chroma 4-7 on half its route, colourless per both the lookfeel review and this pass's own capture. Wait for the in-flight rework to land first. | **B+E** and **21b** ("washed-out Monastery") — same coordination note as #5. |
| 7 | **Stormhold colour pass, if `claude/stormhold` doesn't already carry it** | storm | S | Grey-on-grey (spread 17-24, chroma 8-10), no warm pool anywhere on the route. | **B+E** and **21b** ("washed-out Stormhold") — check the held branch first; this may already be done there. |
| 8 | **Gale Moor's own backdrop (stop borrowing the Scree Path's sky)** | moor | S | Currently wears `far/mid/near: crag` verbatim — a low grey-blue sky, heather ridges, standing stones instead. 5.4 → the review already scoped this exactly (`docs/look-and-feel/wood-to-highcrown.md` #3). | **D+F (backdrops)** — coordinate, don't duplicate. |
| 9 | **A crag prop set that isn't the same crag set** (21b's "one crag set under seven levels") | scree, hanging, storm, crown, undercrown, spire, moor (props only, not ground/sky) | M | Cross-cuts several of the above; a genuinely new prop kit (not reused slab/cairns/lanternPost) moves every crag-arc level's "props/dress" column at once. | **This lane IS 21b**, named directly — coordinate with whoever's driving 21b so this isn't booked as a second, separate lane. |
| 10 | **Foe camo + missing-hurt-pose cluster**: bat, snuffer, lamprey, petrel | 1 foe-group (4 types) | S | All four are both hard to see (`sprite-quality-audit.md`) AND have no hurt-flash to help confirm a hit (`foes.md`). A contrast-rim pass (`src/contrast-rim.js` already exists as the mechanism) plus adding each a hurt frame is small, targeted, and fixes the worst readability gap in the bestiary. | None named in Day-6 or 21b — clear to book. |

## Not ranked (named in 21b, but needs a decision first, not art)

- **The tree wall under three levels** (21b) and **the fatter Goblin Queen + King Gorm** (21b, confirmed real in
  `foes.md` — King Gorm's own bestiary text claims "three times the goblin" and the sprite doesn't deliver it):
  both are real, both are named in 21b already, so they should be booked from there, not duplicated here. Flagging
  so whoever picks up 21b sees this pass's confirmation.

## Questions for Daniel (with recommendation)

1. **Book #1 and #2 (wiring the already-painted crag/castle redress) before anything else?** They're the highest
   gain-per-hour in the entire audit — zero new art, existing unwired code. *Recommend: yes, book these first,
   ahead of anything that needs new art at all.*
2. **Do #5-#7 (Ore Road/Monastery/Stormhold colour) wait for their structural reworks to land, or run in parallel
   on a copy of the palette only?** Running in parallel risks a merge conflict with whoever owns the layout rework.
   *Recommend: wait — book these as follow-ups once Hanging/Monastery/Ore Road/Witchlight's reworks merge, not
   before.*
3. **Is 21b's crag-prop-set lane (#9) already staffed?** The brief names it as existing backlog; this pass can't
   tell whether it's booked or just written down. *Recommend: check before booking #9 — if unstaffed, it's the
   single biggest remaining "props/dress" gain across the crag arc.*
4. **Should the shop interiors (#3) get one shared interior kit or three distinct ones (wood/crag/sea, as
   `docs/visual-audit.md`'s original fix proposed)?** *Recommend: three distinct, small kits — they're different
   places (a forest store, a mountain store, a chandler's) and a shared kit would just be a smaller wallpaper
   problem in the same three rooms.*
