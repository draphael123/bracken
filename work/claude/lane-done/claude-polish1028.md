# claude/polish1028 - Scree hook + anchor-lint polish (Crown, Red Gorge)
Branch claude/polish1028 off claude/batch126 1038c8a4. Code-only: scratch\GATE-RUNNING.flag existed the whole lane, so NO headless browser was started (no pids.txt needed). Not merged, not deployed.

## 1. SCREE PATH hook
FINDING: the audit (hook-audit-1027 item 6) missed that the Scree already has the verb on the road: src/scree-relief.js OVERHANGS puts four loose-overhang props on the road (cairn pen 250 TEACH, terraces troll 134 TEST, gorge-bank troll 499 EXAM, quarry chute 543), driven by the Ram Lord's code (RLD.levelLip/stepLip, main.js updateOverhangs: foe under it is BURIED for 45 + stagger 2.2 s). What was weak: the FIRST one met (134, terraces) had no teach (the teach sign is at 259, after it), and the bank exam did not read as required. No Ram Lord code touched.
Built (ents only, src/scree-relief.js, reusing the same 'overhang' ent):
- OPTIONAL: [85,19] hamlet green, over the shield-man at 90 (a shield turns a front blow, the cliff does not).
- MANDATORY-FEELING: [491,18] the bank's first shelf over the troll at 492, so the gorge bank is a two-shelf exam (491 -> troll 492; 499 -> troll 501 and the Maul's door), with a sign at 489 "TWO TROLLS AND A MAUL. THE BANK IS ROTTEN OVER THEM: KNOCK THE PROPS OUT."
- TEACH-FIRST: sign at 131,15 on the terraces before the first shelf (134): "THE CLIFF IS LOOSE. STRIKE THE PROP UNDER AN OVERHANG WHILE A FOE STANDS BELOW IT." (ROAD_SIGNS array).
Ram Lord fight untouched. Not play-tested (no browser allowed).

## 2. ANCHOR-LINT (tools/anchor-lint.mjs), worst-first
Before -> after: crown 23 -> 0 (overhang 2, island 1, cantilever 15, prop 5); redgorge 55 -> 0 (overhang 32, island 1, cantilever 22). Rookery gate still ok; no other level's count changed.
Fix = new src/anchor-posts.js (called from addIslandPosts for ids redgorge, crown): extra routeSupports posts under every column a board's posts leave past reach, a post under each cantilever's free tip, posts under the bare islands; a post runs to the first tile under it (<= 40 rows) else a 3-row stub (corbel into the wall). NO tile or ent change. tools/solid-islands.mjs allowances for crown (1) and redgorge (1) lowered to 0 (ratchet).
Lint-side change: anchor-lint now treats deco hallWindow as wall-set (5 crown "props on air"); the alternative was adding hang:true to the ents, which would have changed Highcrown's level hash.
Posts are the default timber post (as the gorge's existing ones). Art lane could give redgorge/crown their own pier kinds (hcpier for crown exists).

## Level hashes
- scree 0a77aa665d50 -> 0106a33c8d21 (added ents). Re-pointed BY VALUE in docs/level1-curve.json, level1-pilot.json, mash-bot.json, walk-curve.json. Pilot/mash/walk rows were NOT re-measured (no browser); the change adds props + signs, no foes, no tiles. Re-run level1-pilot.mjs scree --write and mash-bot.mjs scree when the gate is down.
- crown 9c42eb2a437a, redgorge 83c76b84fe01: unchanged (verified).

## Checks run (node only)
anchor-lint, solid-islands (ok), level-quality scree (every gated level clears), scree-rework (pass), signs (1115 fit), map-grammar, ambient-landmarks, ambush-listed, ambush-reach, floaters: all ok.
Red vs base: tools/answer-tags.mjs fails (forgemaster anvilTell/bellowsTell/breathTell: no ANSWER row) - from the merged highcrown2 base, not this lane; not fixed. The 40-min suite was not run.

## QUESTIONS FOR DANIEL (rec first)
1. Want a TRUE mandatory use on the Scree (a cairn that blocks the lane until a shelf falls, built on the breakable-wall engine)? Rec: not blind - needs the walker/route bots taught and a playtest. Built the "mandatory-feeling" version instead (two-shelf bank exam + signs).
2. Redgorge/Crown posts are timber posts; give them their own pier art? Rec: yes, small art task.
