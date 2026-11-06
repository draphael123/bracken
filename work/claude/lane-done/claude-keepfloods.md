KEEPFLOODS DONE 11-06 12:20 READY (code-only greybox behind KF_SHIPS; browser walk / tune / art / music owed - listed below)

# claude/keepfloods - UNDERWATER KEEP 2: THE FLOODGATES + THE DROWNED KING 2 (OPUS greybox, code-only, 11-06)

Branch `claude/keepfloods` off `origin/claude/waterkit` e08836df8. Worktree `C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-keepfloods`. Pushed. NOT merged, NOT deployed.
Sources: plan-water-1105 item 8 + section 3a (tide kit: lever = flood/drain one chamber) + section 2 (boss rules); brief-keep2 (items 1-3 + Daniel '!! 10-16'). Where they differ the plan won.
Nothing has been played in a browser (gate running). Tip: see the last line.

## FLAG / URL
`src/keep-floods.js` `KF_SHIPS = false`. OFF: `expandKeep` never calls `floodKeep` - the keep builds cell for cell as the base (tools/keep-floods.mjs hashes the flag-off build in a child process: grid 94b12ec69f9b, ents 2a373743b05f, all 9c01ccca53be = the base). main.js makes no hands (KFH = null), so every new hunk is inert.
ON: `?kf=1&level=keep`, `globalThis.BRACKEN_KF = true`, or `KF=1` for Node tools. Same level slot ('keep'), same boss id ('drownedking'), no new LEVELS row, no save change.

## What was built
| file | what |
|---|---|
| `src/keep-floods.js` (new) | flag, the three FLOODGATE CHAMBERS (data + build), the throne room's water + decree gate + two levers, the curse tide, `lintFloods` |
| `src/drowned-king2.js` (new, pure) | THE DROWNED KING 2 brain: P1 trident kit + ROYAL DECREE + the floodgate (beached) + THE GATE ON HIM (the opening); THE CURSE at half; P2 the cursed king on his own tide (GRASP / LEECH / CURSED TRIDENT / BONE SHELL); `k2Take` (B15), `k2Lever`, `k2Frame`, K2 numbers, K2_TELLS, K2_POSES |
| `src/keep-floods-hands.js` (new) | the world binding: the WATER KIT runs every chamber + the throne (tideInit/Step/Apply/Strike/Respawn/gauge - no second engine), lever strikes + marks, pool caps, floor-bound knights, the decree gate's PORT tiles, the prongs, and the whole greybox draw |
| `src/keep-expansion.js` | import + ONE line before `return K`: `if(kfOn())floodKeep(K,T,TS)` |
| `src/main.js` | 8 one-line hunks, all `KFH`-guarded: import; hands creation; update (beside updateSea); drawOver; kingFrame; updateDrownedKing first line; hurtEnemy0 take (`else` onto the live king's line); updateDrownedKnight `wet = !e.floorBound && ...` |
| `src/marks.js` | one loop line: MARK / ANSWER / HEIGHT rows for the king's 9 new tells |
| `tools/level-quality.mjs` | SYSTEM_ARRAYS learns `kfLevers` (the floodgate is the level's gadget) |
| `tools/keep-floods.mjs` (new) | **105 ok**, Node only (below) |
| `tools/check.mjs` | own line (not run) |

### The level (flag on) - "FOLLOW THE AIR THROUGH THE FLOODED VAULTS."
- **Whirlpools OUT** (all four: 110, 160, 364 and the exam's 659). The exam keeps the hall's one pocket (no pull), its sign rewritten. src/whirlpools.js stays on disk (its tool tests the flag-off keep) - bench it when KF ships.
- **THE FLOODGATE**: each chamber is an air-hall-shaped room (KEEP_HALLS' grammar) whose DOORS ARE SUMPS under its walls + a 4-wide shaft up through the floor. DRAINED: the sump water stands at the floor - swim in, climb out of the shaft, walk and breathe, the knights walk to you. FLOODED: the line is in the ceiling (capped, the 0.55 breath drain like its neighbours) - swim over the knights on borrowed air. A drained chamber meets its flooded neighbours UNDER water, so there is no water wall anywhere, and both states pass both ways (BFS-proved). Lever on the floor (swim: true); state is a kit lever MARK (kept through a death and a reload).

| chamber (cols) | role | start | what |
|---|---|---|---|
| THE FIRST FLOODGATE 101-121 (end of the Countercurrent) | teach | flooded | lever by the west shaft, one knight, an air in the roof (safe either way); the coral that walled the low road off is gone, the current stops short of it |
| THE STACK VAULT 146-181 (the Flooded Library's middle) | test | flooded | flooded, the ONE air is under the hanging stack at the knights' feet (2 knights); the silver is up in the stacks (only the flood reaches it) |
| THE BELL APPROACH 352-371 | remix | DRAINED | dry, two knights hold the floor and the lever stands BETWEEN them; flood it and swim over them into the narrows on what air you have |

- **THE DROWNED KNIGHT** (plan: "new foe, floor walker, drained rooms"): it already exists (src/drowned-knights.js, swims). Built as a FLOOR-BOUND variant: a knight placed in a chamber gets `e.floorBound` (the hands decide it per body) - too heavy in his plate to rise, so flooded he walks the bed and only sees you near the floor; drained he walks and lunges as he always did. Same id, art, bestiary card: one-new-foe unchanged (Q3). Knights outside the chambers still swim.
- level-quality (KF=1) keep CLEARS THE BAR: mechanics 5 kinds / 3 in 3+ places (kfLevers x5 replaces whirlpools x4).

### THE DROWNED KING 2 (flag on) - numbers are PLACEHOLDERS (hp x1.6 of the live king)
- **P1 THE LIVING KING, trident:** THRUST ! (0.7 s, line locks, block -> recoil), SWEEP !! (low, jump), HURL !! (marked line; it sticks -> BARE-HANDED: open x1 wet / x1.25 dry, gold + timer, recalled with a 0.55 s told line that hurts), ROYAL DECREE !! (1.0 s: the portcullis drops in col 729 for 4 s - your side = a quick thrust, far side = hurled through the bars; a decree also brings the sea back). He is HOME in his water: **x0.4** (Daniel 10-16).
- **THE FLOODGATE (two levers, one each side of the gate):** strike it and the throne room DRAINS (kit manual chamber, 2.2 s) -> he is **BEACHED: x1**, heavy, slow, thrust/sweep only; after 5 s beached he decrees the sea back (told).
- **THE GATE ON HIM (the opening, plan item 8):** while he swims under the raised gate its column glows gold and the levers ring; a lever THEN drops the gate on him: **PINNED x1.5**, 2.6 s, gold ring + timer; bars stand above his head, not through him; he heaves it off -> 1.2 s WARD at x0.4 (grey). No pillar/wall-slam openings (the old ram-into-stone stun is not in this brain).
- **AT HALF: THE CURSE TAKES HIM** (3.2 s, told; first 2 s a gold window x1; the room floods, the gate lifts, the trident comes home).
- **P2 THE CURSED KING:** the throne pool switches to the kit's CYCLE tide ('curse': 3 tolls in, 1 out; high 7 / turn 1.6 / fall 2 / low 4.5 / warn 1.8 / rise 2). HIGH = x0.4, LOW = beached x1 (gold ring). DROWNED GRASP !! (hands rise on a marked floor stretch, low water), BREATH LEECH ! (green tether, drains BREATH only - the A13 quiet drain; snaps at range or on any hit), CURSED TRIDENT !! (3 fanned prongs), BONE SHELL once at 25% (x0.4 until a PLUNGE breaks it -> x1.25 for 2 s), THRUST still. The gate-pin still works; otherwise the levers say THE SEA IS HIS NOW.
- B15: tools/keep-floods.mjs walks 1920 states - lowest x0.4.

## Checks run (Node only, one at a time, >= 5.7 GB free)
- `node tools/keep-floods.mjs` **105 ok**: flag both ways (off = base hash), lintFloods + lintTide on L.kfTides clean; per chamber: flooded swim W->E, drained sumps->shafts + floor walk, roles (teach safe / test one air at the feet / remix dry + lever between knights / silver only by flood); hands on a fake world: start states, levers drain/flood in <= 3 s + marks, a death and a reload keep them, struck back clean, floor-bound knights in/out; the king on the real throne room: 9 tells >= 0.45 s held, thrust/hurl/decree used, gate drops + lifts, the floodgate beaches him (x1) and his decree refloods, pin x1.5 + bars above him + ward after, hurl bare + recall, curse at half -> his tide cycles with tolls, P2 grasp/prong/leech, shell at 25%, respawn resets the room, damage goes through damagePlayer.
- KF=1: level-quality keep CLEARS; one-new-foe, goblin-lint, checkpoint-gaps, checkpoint-stand, floaters, solid-islands, floating-geometry, tide-kit (2019), pull-field (76), comments, dangling-paths, threat-holes, answer-tags, foe-glue, foe-footing all ok. Flag off: level-quality keep CLEARS. `node --check` every touched file. New filenames (keep-floods, keep-floods-hands, drowned-king2) clean vs ad- / admiral / banner / track / analytics / pixel / promo.
- **SLIP, owned:** `tools/whirlpools.mjs` turned out to drive a page (tools/cdp.mjs) - I ran it as a Node check; it opened ONE headless Chrome for a few seconds and closed it itself (exit 0; nothing of mine left running; the only Chrome alive afterwards was the release gate's rel147). No other browser tool was run. NOT run: tools/check.mjs, mark-integrity, any page tool.

## Owed
1. **Browser walk** (one at a time, >= 1500 MB, memguard first, `?kf=1&level=keep`): every hero (real keys) through each chamber in BOTH states (the shaft climb-out at the drained surface, the sumps, the stack vault's air at the knights' feet, the remix's lever between the knights); floor-bound knights read right (sink, walk the bed, don't see a swimmer overhead); the king: trident tells read, the gate's PORT collision + the push-out, the pin, beached walking on the dais, the curse, his tide + gauge; co-op (only seat 1's attack box strikes a lever today - the hands take any hb, main.js passes P's); level1-pilot keep --write, mash-bot keep, reach-heroes, stuck, mark-integrity / untold-told.
2. **Tune** (boss-rates, n=6 first): the PAIR 60-70% WITH flasks (P1 ~80% alone), 90-150 s, mash 0/6; hp x1.6 and every K2 number are placeholders. Re-stamp the keep rows (level then boss).
3. **Art (art before live):** the verdigris chamber lever + the A3 water-line dial (greybox bar), the floodgate frames at each sump, the decree portcullis, the TRIDENT on the king's sheet + the named poses (K2_POSES), THE CURSED MODEL + the transformation VFX, the bed-walking knight look (weed, dragging plate), the drowned hands, the leech tether, the prongs, the bone shell; the signs' plates.
4. **Music:** the P2 shift (a cursed variant of the 'drownedking' track) - greybox keeps the live track.
5. If master changes the keep before the merge, re-stamp BASE in tools/keep-floods.mjs from `node tools/keep-floods.mjs --off`.

## Questions for Daniel (recommended answer first; each built as the rec)
1. **The Champion as the Keep mini** (brief-flotilla3 B, plan item 8 "Champion check"): NOT built - his hands (src/fleetlord-champion-hands.js) are boss-only and deck-bound (hull leap, deck-gun knockdown). REC: a follow-on OPUS lane makes him mini-capable and seats him in the Guardroom (321-350) with a floodgate as his knockdown verb (drain the pit = he is mired, open); Flotilla keeps him until it lands. Alt: drop the move - the Drowned Captain stays the Keep's elite.
2. **The 10-16 descent** ("he sinks through the throne floor, a 20-40 s section to a flooded crypt, checkpoint before P2"): built IN THE ROOM (the curse takes him in place) - the game runs one boss arena per level and has no mid-fight checkpoint. REC: tune the in-room pair first; if it still wants the descent, a follow-on extends the keep's grid down for the crypt + a P2-only arena (main.js work, once DEEP3 is off main.js). Alt: keep it in-room.
3. **The Drowned Knight "new foe"** already exists (it swims). REC: keep the FLOOR-BOUND variant (same id) for the chambers and let the art lane give it the heavier bed-walker read. Alt: its own id + card ('bedknight'; counts as the level's one new foe).
4. **The exam (King's Door)** lost its whirlpool and keeps the pocket + Captain + knight. REC keep it floodgate-free (the three chambers teach/test/remix; the exam is the Captain on the last air). Alt: a 4th chamber there (needs the elite gate rebuilt as a sump).
5. **Chamber state through a death:** REC keep (a kit lever mark - the world stays as you left it, Salt & Sanctuary). Alt: every death resets to the start state.
6. **One lever, two answers in his room** (under the gate = pin, else = drain). REC keep. Alt: two props (a chain lever for the gate, a wheel for the floodgate).
7. **L.kfTides, not L.tides:** claude/water1's generic wiring runs every L.tides level; the throne's water must answer the boss. REC keep the keep's own name (no merge clash either way). Alt: fold into water1's wiring with a per-level opt-out.

## Final tip
claude/keepfloods FINAL TIP = the commit that adds this file (code identical to the commit before it). Play: ?kf=1&level=keep. Proof: node tools/keep-floods.mjs (105 ok, ~5 s).
