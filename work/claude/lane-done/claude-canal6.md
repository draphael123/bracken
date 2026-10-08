# claude/canal6 - THE FOG CANAL: two live bugs (Opus, 2026-10-07)

Base: master 56c2cf92 (live). Port 8721. Jenny's fight untouched (she is being replaced in another lane). The level's data is unchanged: canal level hash 7ddafa893c53 = the cached mash row's, so no mash re-stamp.

## BUG 1 - "little enemies get stuck on the bottom that you can't see" (THE LEGGING TUNNEL)

**Reproduced with real keys.** tools/canal-tunnel-route.mjs gained a per-frame audit of every live foe in the tunnel's own columns (248-344):
- Is it where the tunnel is drawn (L.canal.dark, the moon shaft)?
- Is it out of the rock?
- Is it above the water? A lurking grindylow is allowed down to its ripple depth (16 px).

On master, 2 of 6 runs (warden, both seeds) failed. The stop-planks' **bargee** (a gaffer skinned as a bargeman) stood on the **tunnel's bed**, about 160 s each time:
- He was at col 278-280, row 23, 76 px under the surface.
- That put him under the water and under the barge, drawn behind the murk, where no blade reaches.

**Cause.** The game's deep-water rule for foes (`hazardFoe`: DROWNED) only runs while a body is still in its throw (`e.knock > 0`). A man who WALKED off the leggers' ledge, or whose throw ran out over it, was never asked. He landed on the bed (row 24) and walked there for the rest of the attempt. The same was true anywhere on the canal.

**Fix: JENNY'S WATER TAKES WHAT FALLS IN.** This is `jennysWater` in src/canal-hands.js, run every frame from canalUpdate. A small main.js edit adds `drown` / `smoke` / `mark` to the CNX context.
- **Who it applies to:** a foe of the land whose feet are under canal water. Excluded are the grindylow (it lives there), the wisp (floats), boarders (pinned to her deck), bosses and minis.
- **A man** is DROWNED at once by the game's own `hazardFoe`. That means the green DROWNED mark and a kill.
- **An elite** is never drowned by a misstep. He is put back at his post at once, with smoke and "BACK AT HIS POST". The leash did this after 1.5 s, and only if he was more than 5 rows below his post.

**Assertions:**
- **tools/canal-tunnel-route.mjs, every run:** a tunnel foe out of the drawn / hittable space for more than 0.5 s fails the run.
- **tools/canal.mjs page check h:** the stop-planks' bargee put in the water off his ledge is drowned, and the foreman put in the basin water is back at his post.
- **Proof the checks bite:** with the hook switched off, check h fails (`[true,21,true,5,46]`: the bargee alive on the bed, the foreman 5 tiles off in the water). With it on, the check passes.

## BUG 2 - "you can get softlocked if you don't defeat the elite"

**The Canal route has one elite gate:** THE DECK FOREMAN (gaffer @367,40, the island), gate col 392.
- It shuts the corridor (rows 34-36) and the cistern hatch (its sill, row 37) to checkpoint three and Jenny's west door.
- tools/elites.mjs: `ok canal gaffer@367,40 gate 392`. There is no other elite or elite gate on the level.

**Every way the route could become impossible, probed:**
| way | before | now |
|---|---|---|
| **skip him** (the horn, the bridge, drop on her under the island, up the basin lock) | **SOFT-LOCK.** Probe: the hero was at the door (391,37), the gate was shut, and the foreman was alive on the island. The barge is the only way into the lock, and nothing leads back from the lock to the island (the gate G9 is 9 tiles of water off her deck, the theatre bridge is 5 rows up). | He LEAPS ABOARD her (below). |
| **lure him off** over the bridge, or he wanders (leash 18 tiles: 349-385) | Same soft-lock once you rode on. | He leaps from wherever he is. |
| **he falls in the water** (walked off) | The leash teleported him home only after 1.5 s, and only if he was 5+ rows down. | Back at his post at once (bug 1's hook). |
| **he is thrown in** (heavy blow) | DROWNED (hazardFoe), and his door opens: never a lock. | Unchanged. |
| **death / respawn** | Woken at the summit (checkpoint three is behind his gate). He is reset to his post and his door is shut. | Unchanged, and now asserted. |
| **the barge leaves** | She moves only with a hero aboard or ahead of her middle (canalMover `go`), so she never runs into the lock alone. | Unchanged. |

**Fix: THE DECK FOREMAN IS NEVER LEFT BEHIND HIS DOOR** (`foremanStep`, src/canal-hands.js; it keys off the level's one `elite && bargee`, with no level data change).
- **When it fires:** the barge is in the lock under his door (the reach at gate-3, the basin lock L5), a hero is up the lock with her (short of the door), and the foreman is alive and not already aboard.
- **What he does:**
  - A told leap: "!!", a 0.6 s crouch, a 0.9 s arc, and the hint "THE DECK FOREMAN WILL NOT LET HER GO: HE LEAPS ABOARD. HIS DOOR OPENS WHEN HE IS DOWN."
  - It goes from wherever he is to the end of her deck away from the hero.
  - On deck he is **pinned to her** as the boarding gang is: a throw cannot put him off.
  - He keeps 22 px in from her ends, so there is deck behind him to go round to. His guard is by angle.
  - His post (`e.home`) is her deck now, so the leash and Jenny's water put him back on it.
- **His door still opens only when he is down.**
- The island fight stays the exam's intended way: in the dark, before the horn.

**Real-key checks for every way above.** tools/canal-tunnel-route.mjs gains BASIN plans per seed (`--basin=`):
- **die** (seed 1): die beside him on the island. On waking at the summit he must be at his post with his door shut. Then the WHOLE TUNNEL again with real keys, then skip him.
- **skip** (seed 2): the exam without a blow at him. He must leap aboard her in the lock, under his shut door, in reach. The hand's own blows must land on him there, and his door must open when he is down.
- **lure** (seed 3): draw him off his island over the bridge (the stage records whether he followed), then skip him.
- **fight** (seed 4+): the old way.

**How the hand fights him on her deck:** low sweeps and wound heavies, which is his read: a sweep goes under the guard, and a heavy goes through it at half.
- A geomancer's heavy is a FAULT LINE through the ground, and her deck is a mover, not ground. So her heavies there do nothing, but her sweep kills him (deck probe: 360 hp to 0 in 24 s).
- **tools/canal.mjs page check i:** her in the lock with a hero aboard, he is aboard in under 2 s (on the deck, door shut), and down, his door opens. With the hook off, check i fails.

## Checks (PORT 8721, final tree)
- **canal** (pure + page, with the new checks h and i): ok.
- **canal-water:** ok.
- **canal-aloft:** ok.
- **stuck:**
  - static: 897 checks ok;
  - runtime: 73 spots ok.
- **elites:** 48 elites, every gate opens; canal ok.
- **checkpoints:** 214 ok.
- **mash-gate:** 40/40.
- **level-quality:** CANAL CLEARS THE BAR. One red that is not mine: UNDERWELL "the level changed since its pilot ran (hash 18db3913f459 now 8f3ade0c604c)". That is the batch77 underwell checkpoint change on master; re-run `node tools/level1-pilot.mjs underwell --write`.
- **canal-tunnel-route, every hero x 3 seeds (die / skip / lure), real keys:** see the table.

RESULT (final tree, 21 runs, every hero x 3 seeds): **21/21 reached Jenny's arena**, no lift, no tool take-out of the foreman, no tunnel foe out of sight or reach.

| hero | seed | tunnel plan | basin plan | arena, clean | game s | longest parted |
|---|---|---|---|---|---|---|
| geomancer | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 452 | 3.0 s |
| geomancer | 2 | ride dim | skip | yes | 204 | 3.3 s |
| geomancer | 3 | stray lit | lure | yes | 217 | 3.5 s |
| paladin | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 529 | 3.8 s |
| paladin | 2 | ride dim | skip | yes | 198 | 6.0 s |
| paladin | 3 | stray lit | lure | yes | 245 | 2.0 s |
| knight | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 498 | 3.8 s |
| knight | 2 | ride dim | skip | yes | 247 | 4.9 s |
| knight | 3 | stray lit | lure | yes | 275 | 3.7 s |
| warden | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 468 | 2.7 s |
| warden | 2 | ride dim | skip | yes | 238 | 2.1 s |
| warden | 3 | stray lit | lure | yes | 235 | 2.6 s |
| pyro | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 468 | 3.5 s |
| pyro | 2 | ride dim | skip | yes | 211 | 6.2 s |
| pyro | 3 | stray lit | lure | yes | 213 | 3.4 s |
| pirate | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 427 | 3.6 s |
| pirate | 2 | ride dim | skip | yes | 189 | 3.8 s |
| pirate | 3 | stray lit | lure | yes | 205 | 3.6 s |
| reaper | 1 | stray lit + tunnel death | die (died beside him, the tunnel again, then skip) | yes | 602 | 3.0 s |
| reaper | 2 | ride dim | skip | yes | 252 | 3.2 s |
| reaper | 3 | stray lit | lure | yes | 280 | 3.0 s |

**Mash:** level hash unchanged (7ddafa893c53 = the cached row), so no re-stamp, per the brief.

## Not done / notes
- Not run: the full suite, slopes-trace, textfit. The foreman's hint line is the canal's own hint box: one told line.
- **Co-op:** the leap fires for any hero up the lock. The water hook loops over every foe.
- The geomancer's FAULT LINE does nothing on a mover deck (the barge, and anywhere else a fight is on a mover). That is outside this lane; her low sweep answers the foreman.

## QUESTIONS FOR DANIEL (rec first; built)
1. **A man who falls into the canal DROWNS** (the green DROWNED, a kill). That includes one who walks off a ledge. Rec: keep. It is Jenny's water, the brood's rule ("GREEN = HERS"), and it makes a knock off a ledge a verb.
   - Alt A: hand him back to his ledge with a bite, as the hero is handed back.
   - Alt B: drown only the thrown (the old rule), and put a walker back where he stood.
2. **Ridden past, the deck foreman LEAPS ABOARD her in the lock** and fights on her deck, pinned. His door still needs him down. Rec: keep. He is the DECK foreman, the door is his, and the route can never again depend on where he wandered.
   - Alt A: his door also opens if you get past him alive (cheaper, but it makes him skippable).
   - Alt B: a way back from the lock to the island (a ladder up to the theatre bridge). This was rejected: any way from the door side back to the island is also a way to the door that skips the barge exam.
3. **An elite in the canal water is put back at his post at once** ("BACK AT HIS POST"), not drowned by a misstep. A heavy throw into the water still DROWNS him, as before. That is the old rule, and his door opens. Rec: keep both.
