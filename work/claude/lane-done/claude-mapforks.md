# claude/mapforks - side roads walkable on the world map

## Cause
A side road (spur) is drawn off the road on purpose, and mapGo steps LEFT/RIGHT *past* spurs. The only key onto one was UP/DOWN (branchStep), and only for a spur whose level named its junction through `opensOn` or `spurOf`. The Burning Village hangs to the RIGHT of the Stockade (and the road on to Sporewood leaves LEFT), so the natural key (RIGHT) walked straight past it, and nothing on the map said UP was the key. The Undercrown (gated by `needsKills`, no opensOn) was never found by the walk at all: open on the map, reachable from the TAB panel only. Nodes/paths/lock reads were otherwise correct (the lock is the Stockade clock: best under 5:00).

## Fix (src/main.js)
- Junction derived from the gate tree: `junctionId = opensOn.level || spurOf || gateOf(level)` (campaign-order.js); `spursAt/spurAt` use it. A new fork appears by being gated.
- LEFT/RIGHT now take a spur that lies on that side of the junction when the road's own step that way is not forward/sideways (Burning Village: RIGHT). UP/DOWN keep the old rule. Back out: the key pointing back at the junction (or the old UP/DOWN).
- A shut spur never swallows LEFT/RIGHT (road keeps walking, tip says what it wants); UP/DOWN still buzz + tip. Tip/req text now works for kill-count and clock gates (secretWants), not only opensOn.
- The token glides along the stub (hopTo / map.glide) instead of blinking; any key cancels the glide so nothing waits on it.
- Bright dots run out along an open spur's stub while you stand on its junction (so the way on is shown).
- Saves untouched (no index moves, no PROG change).

## Every fork, before -> after (keys on the map)
| fork | junction | before | after |
|---|---|---|---|
| burning | stockade | UP only, locked until Stockade < 5:00; RIGHT walked past it | UP or RIGHT, back LEFT or DOWN |
| church | towpath | UP/DOWN only (RIGHT is the road to the Canal) | DOWN (kept; RIGHT stays the road), back LEFT/UP; dots show it |
| unburied (secret, 3 banners) | witchlight | DOWN only, not a node until earned | DOWN (LEFT stays the road to the Caverns), back RIGHT/UP; still hidden until banners |
| undercrown (secret, 80% of Highcrown) | crown | NOT walkable at all (panel only) | hidden until Highcrown cleared; shown+shut until 80%: UP buzzes, RIGHT walks on to Longwater; open: UP or RIGHT, back LEFT/DOWN |
| harbor | causeway | shelved: no map node, no road, not in the campaign; a save standing on it is put on the Causeway | unchanged (named SHELVED in the tool) |
Gate-tree forks (chainOf): stockade, crown, causeway, witchlight, towpath. Underleaf is main road now.

## Check
tools/map-forks.mjs (registered in tools/check.mjs): real keys on every node; all 50 nodes reachable from the first wood with everything earned; all 45 gated levels reachable from their gate; each spur in and out by a key; empty save shows no secret; burning shut/open by the Stockade clock; undercrown hidden / shut at 10% / open at 90%; every level has a node except harbor.

## QUESTIONS FOR DANIEL
1. Church and Unburied are still entered by DOWN (LEFT/RIGHT at those junctions is the road). Want a different rule (e.g. a visible arrow label)? Built: pulsing dots on the stub, no text.
2. Harbor: leave shelved (built) or give it a node?

## Follow-up (Daniel's answers, 10-15)
- THE BURNING VILLAGE now opens as soon as the Stockade is CLEARED: `opensOn: { level: 'stockade' }` (the `time: 300` clock is dropped; Pyromancer unlock untouched). Old saves that cleared the Stockade see it open. Tests updated, stated as Daniel's design change, none weakened: class-spurs (slow 5:01 clear and bronze/no-time clear now open it; an uncleared Stockade still shuts it) and map-forks (uncleared = shut, cleared slowly = open).
- KEY PROMPT: standing on a junction with an OPEN spur, a small cap beside the spur node shows the key that enters (pixel arrow on a square cap for keyboard, round-cornered cap when the last input was the pad, "TAP" on touch). The pulsing dots stay. Harbor stays shelved.
- Re-run green: map-forks, class-spurs, burning-village, map-grammar, map-spacing, map-scale, map-footer, unburied-secret, lit-church, touch, uiscreens, mobile-perf, textfit (map scope, 0 on every counter; one earlier run hit an audio.js page error, re-run clean).
