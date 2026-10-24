# claude/secrets - ONE SHARED SECRETS SYSTEM (Daniel 10-21 "SECRETS CLARITY")
Base master 7cc06bae (BATCH116). Branch claude/secrets. Not merged/deployed (BATCH118).

## What was built
- src/secrets.js: one registry + pure rules (found / open / progress line / toasts / journal / hero line / migration). Pieces are read from the save fields that already existed (PROG.lostBanners, PROG.votive, fieldOpen, churchOpen), so OLD SAVES need no conversion: secrets they already found show as found (tools/secrets.mjs B6). New save fields: secretNew (reveal owed), secretTold (reveal shown / already open on load).
- Secrets covered: THE UNBURIED FIELD (3 lost banners, kind hidden) and THE LIT CHURCH (3 votive lamps, kind told: Daniel 10-16 made it an openly-priced spur). A later secret (Pirate Fleet) is one row in SECRETS.
- Pickup TOASTS: a card over the level per piece ("LOST BANNER 1/3 / THE FIELD STIRS", "VOTIVE LAMP 2/3"), and on the last "A HIDDEN WAY OPENS / <name> / LOOK AT THE MAP". Own overlay, independent of the hint tier setting. The existing hint line 'THE FIELD REMEMBERS' is kept.
- MAP REVEAL: first time the map is up after the last piece: camera pans to the new road, rings spread from its node, "A HIDDEN WAY OPENS" banner, the Unburied ghost-path draws itself (existing). Once only (queued in PROG.secretNew).
- MAP before discovery: NOTHING (the old dim unlabelled spot is gone). After the first piece: a dim "?" on the spot with its progress line "1/3 LOST BANNERS".
- HERO line: locked card says FOUND ON A HIDDEN PATH + "BEAT HIM, THEN BUY: 10 SILVER" with NO place named until the secret is found (then "...IN THE UNBURIED"); open card, in-game Hero card and the store row (hero tab: "found on a hidden path." prefix; locked store line says "follow a hidden path to earn it" until found) carry it for the Blood Knight and the Paladin.
- JOURNAL: pause menu row "Secrets" (after Hero): found X of Y per act; discovered secrets named with progress, undiscovered as "? ? ?" / NOT FOUND YET.
- In-level hint: the lost banner twinkles now and then (glint) on top of its red glow; the votive lamps already glint near.
- Incidental fix: the Hero card's stat rows collided with the level line for 3-line-loop heroes (Paladin); row pitch 8 for those.
- Existing check updated: tools/hero-roster.mjs (fresh Death Knight card no longer names the Unburied - by design of this lane).

## Not secrets (found while surveying src/level.js road data)
UNDERLEAF and THE UNDERCROWN are main-road levels now (no hidden/secret flags; ROAD_OPEN.undercrown). THE BURNING VILLAGE and THE HORNET'S NEST are visible spurs opened by clearing Stockade / Lumber Trail - not hidden, so not in the journal. Secret walls inside levels (cellars, Netmender's loft, crow's nest) are not counted.

## Checks (all green, port 8791, one browser at a time)
secrets (new, ~60 asserts), unburied-secret, hero-roster, store, ui-hud, church-road, class-spurs, map-grammar, map-forks, map-spacing, map-scale, map-footer, hint-shown, save-slots, save-safety, tavern-menu, bug-report; textfit --strict: hints, store, pick, mapcard, card, menu, hud + new scope `secrets` (32 screens: journal x4 states, pick, hero cards, maps, toasts, reveal) all 0 issues.
Reds / caveats: textfit scope `levelcard` hung twice at 481 s (memguard killed my headless Chrome at 18:12 and 18:32 under the other lanes' memory pressure; unburied-secret hung the same way once and passed on rerun in 45 s). levelcard untouched by this lane - rerun in the gate.
Registered in tools/check.mjs: 'secrets' tool and the 'secrets' textfit scope.

## Pictures (work/claude/secrets/)
before-0-map-fresh, before-2-map-after-one, before-1-toast-banner1, before-3-toast-opens, before-7-heropick-reaper;
after-1-toast-banner1, after-2-map-question-mark, after-3-toast-opens, after-4-map-reveal-a/b, after-5-pause, after-6-journal.

## QUESTIONS FOR DANIEL (rec built)
1. Church: keep the locked Lit Church spur visible on the map with its price (built, as you set 10-16) or hide it until the first lamp like the field? Rec: keep (lamps are openly signed in Waymeet).
2. Journal only lists Act IV (2 secrets) today. Should the visible side roads (Burning Village, Hornet's Nest) also count as "side paths" there? Rec: no, they are not hidden.
3. The Death Knight / Paladin cards no longer name the place before discovery. OK? Rec: yes (your "nothing spoils it").
4. No journal access from the world map screen (only the pause menu inside a wood); map header is full. Rec: fine; add a map key later if wanted.
