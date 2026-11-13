# DUEL PROOFS (desktop, PHASE 1 - LOOKS ONLY) - claude/duelarenas-d @ bbcc59226 (11-12, ~21:14-21:30)

Not merged, not deployed. Worktree C:\Users\danie\Projects\bracken-wt-duelproofs, branch claude/duelarenas-d, started at 3cbaa6bbc (= origin/claude/duelarenas-b: duelfoes + duelarenas A + B). One commit added on top: bbcc59226.

## Setup
- Page served by tools/cdp.mjs's openPage() (auto-spawns tools/serve.mjs on this checkout's own port block if nothing answers there; refuses a server for another checkout). No manual serve.mjs needed.
- Flags forced per-page via openPage({ duelArenas: true, duelFoes: true }) -> `window.__DUELARENAS=1` / `window.__DUELFOES=1` injected before the first script of every document (same mechanism as `?duelarenas=1&duelfoes=1`). One Pit comparison pass ran with both false (flags OFF) for the identical-look check.
- Driver: new tool tools/duelproofs-shots.mjs (committed), modeled on tools/duel-roster-shots.mjs's __fresh/__atPit pattern. Seats: P1 knight (human), P2 warden (bot, normal). Game speed pinned 0.6x as usual; the match countdown was skipped by setting `D.st.m.t = 0.05` directly (a real wait took ~400+ BK.sim(1) frames per 3 game-seconds at this speed) rather than waiting it out.
- One browser at a time throughout (RAM stayed >= 8.2 GB free the whole session, never close to the 1500 MB floor). No stray chrome.exe left behind (checked by profile path after each run).

## Per-arena look verdicts (round-start, 2 seats, GOBLINS=MANY unless noted)

**Stockade** (arena-stockade-roundstart.png) - GREEN. Poles stand under both visible board tiers, boards read as resting on them, nothing floats. NOT SEEN: a dedicated torch close-up - the floor-framed round-start camera doesn't reach the lookout/torch height, so "two torches" is unconfirmed from tonight's stills, not contradicted. Camp-dress sprinkles (the square prop boxes) sit flush on the poles, no floating noticed.

**Rootway Hollow** (arena-rootway-roundstart.png) - GREEN. Root-shelf supports (multiple dark vertical roots) clearly hold up both shelves, nothing floats. Mushroom-cap ledges visible top-left/top-right (pink/red caps). The GIANT CAP landmark (deviation 5) reads as a large dark tree/fungus silhouette in the back-right background - unobtrusive, no gameplay interference, fits the theme well enough. **Rec: KEEP** (see Questions).

**Kitchen** (arena-kitchen-roundstart.png) - GREEN. Undercellar brick walls + dark niches/archways read correctly. Dresser-shelf board (top) and a trestle/brace table (X-braced legs, bottom-right) both sit on the floor, not floating. Hams/braids: two red hanging shapes on ropes near the ceiling match "hams". Ceiling rows (brick band across the top) look solid, no gaps. Table legs touch the floor.

**Pit** (arena-pit-roundstart.png vs arena-pit-FLAGOFF-roundstart.png) - GREEN, IDENTICAL. Side-by-side the two stills match pixel-for-pixel on posts, torches, crowd stands, flags, chopping block, bucket, sky/backdrop. The only difference is intentional: the ON version's FIGHT! banner carries "THE DUEL PIT" underneath (arenaLabel()); OFF has no label, as designed. NOT SEEN: oak posts under all three elevated planks specifically - the floor-framed round-start camera doesn't reach plank height either; would need a camera positioned at the planks (PHASE 2 or a quick top-up, see OWED).

## Count/FIGHT banner naming the arena - GREEN, all 4
arena-{stockade,rootway,kitchen,pit}-count-banner.png: the ROUND 1 / countdown screen shows the arena's name (arenaLabel()) under the number for all four, e.g. "THE STOCKADE", "THE ROOTWAY HOLLOW", "THE KITCHEN", "THE DUEL PIT". Confirmed in-engine too (debug().arena.id matched the requested arena every time).

## Picker/setup rows (RULES tab, both flags ON) - rules-tab-*.png
- ARENA row (rules-tab-arena-row.png): `< THE STOCKADE >` selected, plain-words line "THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT." underneath. GREEN.
- GOBLINS row, MANY selected (rules-tab-goblins-many-row.png): **RED (now fixed)** - the plain-words line was cut mid-word: "GOBLINS: MANY - THEY HURT ANYONE, BUT ONLY A HERO CAN " with "K.O. YOU." silently dropped. See textfit section.
- GOBLINS row, FEW (rules-tab-goblins-few-row.png, pre-fix): same bug, cut to "...BUT ONLY A HERO CAN K." missing "O. YOU."
- FRIENDLY FIRE row (rules-tab-friendlyfire-row.png): `< OFF >`, plain line "TEAMMATES CANNOT HURT EACH OTHER." fits (181px / 300px box). GREEN.

## textfit (no dedicated surface in tools/textfit.mjs - checked its usage header: SCOPES list has no duel/roster/card entries - so these were measured stills + window.__textRec, the mechanism textfit.mjs itself reads)

| String | Surface | Result |
|---|---|---|
| 'THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT.' | roster 300px, size 6 | GREEN, 256px |
| 'RANDOM - ONE OF THEM, PICKED WHEN THE FIGHT STARTS.' | roster 300px, size 6 | GREEN, 269px |
| 'THE STOCKADE (RANDOM)' banner | count/FIGHT banner | GREEN (arenaLabel() renders fine, confirmed on stills) |
| 'GOBLINS: FEW/MANY - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.' | roster 300px, size 6 | **RED** (both variants silently truncated, see below) |
| GOBLINS line (same string) | tavern card 196px (184px box), size 8 | **RED**, worse: even after the first roster-only fix the string still cut to "...ONLY A" (only 35 of 54 chars) |
| FRIENDLY FIRE row | roster 300px | GREEN |
| GOBLINS IN THE PIT banner | size-16 banner text | GREEN - measured via __textRec: x0=17, w=286, right edge 303 < VW 320 (17px margin each side). The raw screenshot made it LOOK clipped at the canvas edge; that's the CDP screenshot's own letterboxing, not an engine overflow - confirmed with the in-page text recorder, not eyeballing. |
| results header 'POINTS GOBLINS DEALT ROUNDS' | 220px results board | Not re-tested tonight; src/pvp-duel.js:570 comment says this was already fixed in proof146b ("the two lines each had a row: side by side they overran the 220px board") - reads as resolved, no new evidence either way. |

**Fix applied and committed**: `src/duel-foes.js` GOB_LINE shortened twice -
1. `'GOBLINS: FEW - THEY HURT ANYONE, BUT ONLY A HERO CAN K.O. YOU.'` (62 chars) -> `'GOBLINS: FEW - HURT ANYONE; ONLY A HERO CAN K.O. YOU.'` (fit the 300px roster line, still failed the 196px card)
2. -> `'GOBLINS: FEW - HURT ALL. HEROES K.O.'` / `'GOBLINS: MANY - HURT ALL. HEROES K.O.'` (37/38 chars). Verified via window.__textRec on BOTH surfaces: roster 181px (< 300), card 181px (< 184 box) - no 'cut' record on either. Stills: FIX-rules-tab-goblins-few-row.png, FIX-card196-goblins.png.
Also updated tools/duel-foes.mjs's one hard-coded-literal assertion ("the plain-words lines are written") to check the string's shape (prefix + "HEROES K.O.") instead of the old exact wording; `node tools/duel-foes.mjs` is ALL OK again (135+ checks, flag-on + flag-off child).

**Found but NOT fixed (flagged, not mine to rewrite under tonight's time box)**: the ARENA row's plain-words line (THE STOCKADE's own line, and worse, RANDOM_LINE) ALSO truncates on the 196px tavern card at size 8 - e.g. "THE STOCKADE - FOUR LASHED TIERS UP TO A LOOKOUT." cuts to "...UP TO " (missing "A LOOKOUT."), and the RANDOM line cuts to just "RANDOM - ONE" (loses almost everything). These are duelarenas-lane-owned strings (src/duel-arenas.js ARENAS[].line, RANDOM_LINE) used in several places (RULES tab, lore text); shortening them to fit a 184px/size-8 box would gut their meaning, so I left them alone and flag it as a question below rather than hack a "small" fix under the clock.

## Goblin stills (point 3, time allowed)
- goblin-tell-and-banner.png: captured at fight-clock 9.01s, the exact spec window (9-10s) - "!" tell + "GOBLINS IN THE PIT" banner both up together (they fire on the same frame in code).
- goblin-walking-in.png: captured at fight-clock 10.02s, a goblin alive and on the floor near the door.

## SEEN vs NOT SEEN
SEEN: all 4 arenas at round start with 2 seats; ARENA/GOBLINS(MANY)/FRIENDLY FIRE rows + RULES tab; count/FIGHT banner naming all 4 arenas; Pit ON vs OFF identical-look comparison; GOBLINS: FEW/MANY plain line on both the 300px roster and 196px card (found + fixed the overflow); RANDOM line + ARENA line textfit on roster (fine) and card (red, not fixed); FRIENDLY FIRE row; GOBLINS IN THE PIT banner fit (fine); one goblin still set (tell + walk-in).
NOT SEEN (tonight, looks-only): Stockade torches close-up; Pit's oak posts under the elevated planks specifically (round-start camera is floor-framed, doesn't reach either); results card GOBLINS column at 4 seats; tavern card's own GOBLINS row textfit at 196px was re-checked and is fine for the fixed string, but its ARENA row is a known-red not fixed (above). All AI-vs-AI runs, camera-fit math, vent rides, bot pathing, goblin tables, and the Archer-free-Pit assertion - out of scope tonight (LOOKS ONLY), listed below.

## PHASE 2 OWED (exact commands, from the three briefs)
AI-vs-AI / node-driven runs:
- `ARENA=stockade PAIRS=knight:pyro,warden:ranger N=2 node tools/pvp-duel.mjs duel` ; then `ARENA=stockade N=2 node tools/pvp-duel.mjs duel` (9-hero sweep) ; with goblins `ARENA=stockade GOBLINS=1`
- `ARENA=rootway N=2 node tools/pvp-duel.mjs duel` and `ARENA=kitchen N=2 node tools/pvp-duel.mjs duel` (+ `PAIRS=knight:pyro,warden:ranger`); with goblins `GOBLINS=1`
- `PAIRS=knight:pyro,warden:ranger N=2 node tools/pvp-duel.mjs duel` on the Pit with goblins 'many' (2 seats); a 4-seat run and a teams run (friendlyFire off and on); then the 9-hero sweep N=2
- Assert each: every match ends inside the cap, no soft-lock, no seat downed by a goblin (debug().stats.foeBlows > 0, kos only by heroes), no flask, no XP/coins gained, debug().foe.alive <= 4, BK.duel().debug().arena.id matches

Camera / bots / vents (browser, node-sim where possible):
- Camera fit at 4 seats: Stockade (3 tiers at once, 352px vs VH 180), Rootway (30 wide, seats at 4/29 = 400px vs narrowest 4K frame 349px - per deviation 1, check the soft stop), Kitchen, a small 320px window
- Bots reach the lookout (Stockade): log a bot's y over time, BK.players() y <= 7*16, expect inside ~10-20s
- VENTS (Rootway): a seat (not only P1) lifted by a puff; bots wait/ride/land on the crown; nothing hurts; the puff is told (spores, 5s period)
- Archer-free Pit: every spawned enemy t is sprig or shield (BK.duel().D.st.foe.list)
- Goblins on the Stockade: archer arrow = a goblin blow, hound contact too; no arrow/bite kills a seat, no archer chain-lock (grace 0.4s)
- RANDOM/rematch/leave: pick RANDOM several times (all four arenas appear), REMATCH stays in arena, BACK TO THE INN returns
- Results card GOBLINS column at 4 seats (still)
- Tavern card (?duelcard) GOBLINS row + ARENA row stills at natural resolution (not the direct-state-poke I used tonight)
- Stockade torches + Pit elevated-plank-posts stills specifically (round-start camera didn't reach either tonight)

## Questions (recommendation BUILT)
1. **Rootway GIANT CAP landmark (deviation 5): keep or drop?** Rec: **KEEP**. Seen tonight (arena-rootway-roundstart.png) - it's a large but unobtrusive background silhouette, doesn't block seats/platforms, reads as oversized forest/fungus decor consistent with the theme even though it's technically Sporewood's prop.
2. **ARENA plain-words line (THE STOCKADE's line, and worse RANDOM_LINE) overflows the 196px tavern card at size 8 - what to do?** Rec: don't shorten the shared arena-description strings (they're used in the RULES tab at 300px where they're fine, and rewriting them to fit 184px would gut their meaning). Instead suppress the plain-words line on the narrow tavern card specifically for the ARENA row (the card is the older pre-roster UI per its own code comment "until the roster pick screen is in, this is how a player sets the match" - lower priority than the RULES tab, which already shows it correctly). A one-line change in src/pvp-duel.js's drawHud card block (skip the ctx.ruleLine call when `sr === 'arena'` there, or wrap to 2 lines) - left undone tonight since it touches duelarenas-owned code and wasn't "small."
3. **Pit oak-post / Stockade-torch stills**: not reached by the floor-framed round-start camera tonight. Rec: a quick top-up still at plank/lookout height is worth 5 minutes in PHASE 2 rather than reopening tonight past the time box.

## Branch
claude/duelarenas-d @ bbcc59226 (one commit on top of 3cbaa6bbc = origin/claude/duelarenas-b). Pushed. laptop: nothing to merge yet.
