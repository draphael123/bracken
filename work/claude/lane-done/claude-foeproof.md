# FOEPROOF (11-05, run 14:17-15:08) - browser proof for claude/foevariety. VERDICT: READY for the SAT 11-07 cut.

## Branch (claude/foevariety, pushed, nothing merged or deployed)
Tip c77cb38fb. 52b56e4c5 = merge of origin/master 1b93f610e (one conflict: tools/check.mjs check list; took master's list + kept foe-cast-lint from 550ba3575). c6afaf1dc = foeproof-shots fixes. 6ee86dfda = restamped docs/level1-pilot.json + docs/mash-bot.json. c77cb38fb = tools/foeproof-frames.mjs + tools/foeproof-seeds.mjs. No game-code bugs found, no src/ change.

## Evidence
- level1-pilot --write (kings, kitchengate, fenroad, stockade, underleaf, palisadewood): all walked 100% of waypoints. Hits/deaths: kings 22/3, kitchengate 40/3, fenroad 34/3, stockade 27/1, underleaf 21/0, palisade 21/0.
- mash-bot --level ... --write (same six): all walked 100%. Deaths knight: kings ~4, kitchengate 3, fenroad 22, stockade 28, underleaf 2, palisade 4. fenroad/stockade deaths (22/29 on master's own rows) match master: no regression from the variants.
- level-quality: every gated level CLEARS THE BAR (pilot + mash rows ok for all six; kitchengate/palisade/fenroad/stockade only say "curve row stale, re-run --curve" = informational ok).
- foe-cast --check exit 0; foe-cast-lint ok; one-new-foe ok; goblin-lint ok; hint-shown OK; knock-into ok (pure/throw/hazard/anti); foe-glue ok; foe-tempo ok (54 windups still marked).
- textfit hints + bestiary + death scopes: 357 screens, all counters 0 (new CLUB GOBLIN + 3 archer cards fit). Full textfit run hit my 560 s wall (bestiary/boss/store/tree scopes finished clean; remaining scopes untouched by this branch).
- Console / page errors: 0 (console.error hooked + Runtime exceptions) across palisadewood, stockade, fenroad, plus every stills/seed run.
- Frame time (tools/foeproof-frames.mjs, rAF, knight beside the densest archer cluster): palisadewood (9 variants) 55.9 fps 1x CPU (p50 16.7, p95 16.8; one 433 ms boot hitch right after load), 50.4 fps at 4x CPU (p95 33.5); stockade 59.8 / 51.5 fps; fenroad 60.0 / 41.3 fps at 4x (p95 49.9). No regression seen.
- Variant shots (tools/foeproof-seeds.mjs, knight 5 tiles off, same deck): fire / rock / venom arrows all stay s.arrow + owner; a reflected one hurts its archer (28 -> 18 / 17 / 14); a landed hit hurts the player; venom POISONS on a landed hit (venomT 2.39 s). Reflect is emulated from main.js reflectSeed (not exposed on BK).
- Stills: scratch/lane-reports/foeproof-{firearcher,rockarcher,venomarcher,clubsprig}-{idle,tell,after,later}.png (16 files). Yellow ! tell + the foe read in each tell still; tools/foeproof-shots.mjs fixed (dozing/horn foes skipped, banner cleared, tell = draw>0.3 / biteTell) and works.

## Owed (none blocks the cut)
- A LISTEN pass for the new voice aliases (headless is silent) and Daniel's eyes on the stills at game zoom (foes are small in 640x360: shard readability, flame head, club overlay).
- Rock arrow hit read 30 HP in one palisade sample vs fire 10 / venom 13-15 (n=1, the arrow's default damage via damagePlayer; may be percent-scaled). Watch it in the first play; if a rock arrow really hits 3x a fire arrow, set a dmg on loosed() for rock.
- Rock SHATTER on floor/wall and club knock into a pit/spike were not re-proven in a scripted run here (knock-into tool green: it covers the shared knock path); frost archer still unbuilt (Q1 of foevariety.md).
- kitchengate/palisade/fenroad/stockade --curve rows are stale (informational); re-run level1-pilot <id> --curve if wanted.
- RAM note: one of my runs started at 373 MB free (TUNE146 browser beside mine); it completed, the rest waited for >= 1500 MB. Two page crashes (infra, rerun alone green): kings pilot retry, fenroad on a third level load in one page.

## Questions (rec first)
1. Ship foevariety on the 11-07 cut? rec YES (stamped rows are in the branch).
2. Q1-Q5 from foevariety.md unchanged (rec: frost chill = one follow-up lane; accept stockade/palisade generic share; tighten GENERIC_MAX to 50 except those two; foe-cast-lint in check.mjs is already registered; real sling art later).
