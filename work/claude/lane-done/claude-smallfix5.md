# SMALL FIX 5 (claude/smallfix5, off 204a22d4 = BATCH132 live)

## What changed (src/main.js only, 3 edits, no level/boss/tuning change, no hash restamp)
1. L1 transition: the Lumber Trail (id `wood`) -> ferry -> MARSH WOOD row in src/transitions.js carried the party to MARSH WOOD past THE HORNET'S NEST
   (road: wood -> hornetsnest -> marsh; level.js `marsh needs: hornetsnest`, `hornetsnest needs: wood`). trnBegin() now plays a transition only when the
   table's target really `needs` the level just won (`LEVELS[to].needs === LEVELS[levelIndex].id`). wood>marsh therefore no longer fires: the normal
   win card / map / "NEXT: THE HORNET'S NEST" (co-op) shows and the road continues to the Nest. The TABLE row and ferry art are untouched, ready to be
   re-pointed when a ferry belongs on the road again (e.g. a row whose `to` is a direct successor).
2. Undead Mage realm speech: every realm line (mage-realms.js c.say: tells, beats, 'IT FALLS', 'STRUCK BACK', 'THE MIRE SURGES...', 'HE IS OPEN' lines) went through
   number(), which silently drops any sentence that is not a MOVE_WORD or on the callout list. Both realm say callbacks in main.js (the boss step's say at the
   stepUndeadMage call, and the strikeRealm say) now route a non-move-word string to callout() (the hint box, same place as other boss speech) while a realm is up.
   Short move words still use number(). Callout keeps its own 4 s same-line de-dupe and yields to a hint already showing.
3. Other small items: scanned RELAY QUEUE 'Small:' and priority 10-29/10-30 lines - everything else is art (hatchet arm pose), bot/tuning (FT4 knight pass, Warden polish),
   or its own lane (bell shorten, zipregrab, bossheal, abbotclear, pyro kit...). Nothing else both small and safe, so none done.

## Verification (real outputs)
- `node --check src/main.js` : no output (clean).
- `node tools/transition-woodmarsh.mjs` (node-only part): 27 ok, 1 FAIL "main.js: the ?trans=1 gate is gone" - PRE-EXISTING and unrelated: its `!src.includes('live: false')`
  trips on `live: false` in the Lance ballista bolt (main.js line ~25102), not on my edits. 
- NOT run: any headless browser check, tools/check.mjs (per the lane rules). The transition tool's `--browser` section kills the boss and expects the wood>marsh ferry;
  it will now see the win card instead (intended). It needs rewriting/retiring when the transition is re-homed.
- Realm speech not visually verified in a browser (code path is the same callout() used by LICH_CALLED lines).

## Hash restamps
None expected (no level data, no grid, no entity change).

## QUESTIONS FOR DANIEL
1. Transition: I turned the Lumber Trail ferry OFF (rec) rather than retarget it to the Nest, because a ferry arrival into the Nest start (a pine foot) makes no sense. Rec: later
   add a Nest -> Marsh transition (down the pine's roots, no ferry) or keep the ferry for a Fen Road -> Stockade style water hop. Built: off.
2. Retire/rewrite tools/transition-woodmarsh.mjs --browser? Rec: yes, with the next transition lane.
