# claude/partypersist (sonnet) - the party persists across the whole road

Branch claude/partypersist (from master 5586a595). Not merged, not deployed.

## Root cause
The party is `coopWant` (seats for the next wood) + `players` (bodies). Two paths wiped it for good:
- **BOSS SELECT** (`bossSelectOpen`) set `coopWant = null` and ended co-op - one visit to the map's BOSS SELECT dropped every seat for all later levels (the AI's linked-save lock and XP credit were then released by `profReconcile`).
- **`loadSlot`** (CONTINUE from the title, leaving a boss-select fight, a save restore) also nulled `coopWant`, even for the same save.
Level -> level, retries and transitions were already fine (checked: `startGame` rebuilds the party from `coopWant`). Trials / shops / rush still run solo by design and the party comes back after them.

## Fix
- `loadSlot(i)` drops the party only when the SAVE changes; `bossSelectOpen` keeps it. The boss select brings the whole party into the fight (`profCredit` is a no-op while `bossJumpOn`, so a sandbox fight credits nothing to a linked AI's save; its lock stays).
- Win card, party only: **Z = NEXT: <WOOD>** goes straight to the next wood on the road (the map's order, skipping spurs/secrets/locked; a wood's `leadsTo` first) via the normal loading path - no tavern, no map. **ESC = map.** Falls back to the map when a level-up card is owed, nothing is open next, or at the end of the road. Solo play unchanged.
- Map: party chip strip (top-right, under the purse): colour, P1/P2/AI tag, hero, LV, per seat (`partyRoster`, `drawMapParty`).
- Pause menu: new **Party** row opens the party board anywhere: AI PARTNER is live on empty seats (steps in beside P1 with a puff mid-wood; on the map/shop it joins the next wood), **HOW IT PLAYS** retunes a seated AI live, **DISMISS** removes it. JOIN stays the inn's (greyed, a person needs a pad). Linked AIs keep the save lock/XP rules (`aiProfFor` shared).
- Reload: the party (AI incl. linked, guests, own-save local seats; not online guests - the link dies) is written to sessionStorage (`bracken.party.v1`) at every change / pagehide and restored at boot for the same save. Tab close ends it. Skipped for `?labReload`, `?level`, `?boss`, `?noparty`.

## Checks (all green, test Chrome one at a time, port 8797)
- tools/ai-companion.mjs: new `chain` (clear -> NEXT -> win -> map -> BOSS SELECT -> boss -> quit -> map -> wood, P1 + AI + guest seat survive every step), `linked` (linked AI keeps lock + credit across it, boss select credits nothing), `pausebd`, `reload`; pure/board/save still green (follow/raft/fight not rerun - untouched code).
- textfit --strict: party (new win-card NEXT label on 6 woods, map chips x2-4 seats with longest names) 0, menu 0 (full-suite textfit not run: the all-scope run exceeds this lane's window; my edit was scoped).
- tavern (one run flaked on the online-guest key timing, 2nd run green), tavern-menu, online-coop, coop-progress, save-safety, hint-shown, map-footer, ui-hud green.

## Reds / notes
- tavern.mjs "guest's own keys drive HIS seat (P3)" timing flake once, green on rerun.
- Map chips were moved after textfit hit collisions (top-left plate, bottom info card, purse strip); top-right under the purse is clean in the checked frames; I did not eyeball a screenshot on every map node.
- `partyAiSeat` mid-wood is not covered for ONLINE guests joining via pause (unchanged: guests join by the invite as before).

## QUESTIONS FOR DANIEL
1. Rec: keep ESC on the win card = map and Z = NEXT for parties. Want NEXT for solo players too? (rec: no, solo keeps the map for the store.)
2. Rec: stores/trials still run solo then the party re-forms. Should the party enter a store with you? (rec: no.)
3. Rec: an online guest is not restored on a reload (needs rejoin). OK?
4. The pause PARTY row shows for solo players too (so they can add an AI mid-run). Hide it when solo? (rec: keep.)
