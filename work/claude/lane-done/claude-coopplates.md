# claude/coopplates - show each co-op player's hero + level (Daniel 10-21)

Base 5e44cddd. Files: src/main.js, src/party-board.js, tools/textfit.mjs (new human-seat plate frames at 2/3/4 seats), tools/mobile-perf.mjs (MP_AI accepts a comma list = N AI seats).

## What is shown where
1. HUD seat plates (right side, under the purse): seat-colour frame + hero bust icon (a crop of his own idle frame), line 1 `P2` / `AI` / `P3 GUEST` + `LV 12` (gold, right), line 2 hero name + HP (BLOOD KNIGHT fits), HP bar on line 3; downed seat shows DOWN where the level was.
2. Over-head: the existing `P2` name tag plus a small slate above it: head icon + `LV 12` (seat colour). Shows ~5 s after join / respawn / level-up and whenever a seat is far (>150x110 px) from every other seat; fades out over 0.8 s.
3. Toasts: `P2 JOINED: PYRO LV 12 (SAVE 3)` (also `(ONLINE, SAVE n)`, `(GUEST)`, `(AI)`) from the inn door, a wood join, an AI add and an online guest join; `P2 PYRO REACHES LEVEL 13` per seat level-up (P1 too, in co-op).
4. Party board (pause menu PARTY row and inn board): each seat row now leads with his hero icon in his seat colour; hero + LV + save text was already there; guests/unsaved seats now show LV too (player one's level). Map party strip already showed hero + LV (partyRoster now uses the same level reader).
5. Online guests watch the host's streamed canvas, so host and guest pages show the same plates (no separate guest renderer exists). Verified online-coop green.

## Checks (PORT 8791, one browser at a time)
- textfit --strict party: 0 issues, 16 screens (new `seat plates x2/x3/x4`, human seats, BLOOD KNIGHT, one downed; plus the AI ones). party,hud: 0 / 46 screens. plates: 0 / 1560 screens.
- coop-progress OK, tavern OK, online-coop OK, ai-companion GREEN (first run red: AI seat line now says LV for an unsaved AI; fixed - kept `YOUR LEVEL - NOTHING SAVED`).
- mobile-perf, 4 seats (MP_AI=warden,pyro,paladin MP_SCENES=wood): 57.1 fps, p95 18.2 ms, inside budget (>= 40).
- Not run: unscoped textfit (known hanging levelcard).
- Observed: `textfit party,hud,plates` in ONE command hung the party page twice (party alone, party,hud, and plates alone are all clean). Two Chromes at once on a busy PC; not root-caused, did not reproduce alone at the final width.

## PNGs
- work/claude/lane-done/coopplates-4seat-hud.png (4 seats: pyro P1, blood knight/paladin/pirate guests, LV tags up)
- work/claude/lane-done/coopplates-4seat-hud-tagsfaded.png (same moment; tags forced shown again - kept for reference)

## QUESTIONS FOR DANIEL
- AI seats: plate says `AI` (as the map strip), the old plate said `ALLY`; the win card still says ALLY. Rec: keep `AI` on plates; built that.
- A fresh test save reads `LV 0` (levelOfXp(0)); real saves show their real level. Should level 0 show as 1? Rec: leave, same as player one's HUD; built that.
- Over-head LV tag only on screen a few seconds (per brief). Rec: also keep it on while the seat is downed/dead? Built: hidden while downed (the clock ring is there).
