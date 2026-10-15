# claude/ksarfoes (OPUS) - THE BANDIT KSAR's TWO NEW FOES (brief-ksarfix-1014.md PART B) - off claude/ksarfix 96fee5d6

## The two foes (both VARIANTS of the proven CUTTHROAT machine, cnSkin; A9)
A9 statement: the HAWK SCOUT stays the Ksar's one brand-new AI. Both new bandits are variants of a proven machine with a twist tied to the level's verbs:
- THE FALCONER (cnSkin `falconer`) = the VARIANT that reuses two proven machines (cutthroat + the Ksar's own hawk scout on a leash). It counts as no new AI.
- THE PLATED BANDIT (cnSkin `ksarplate`) = the one that is NEW IN KIND (its plate rule is new code), but still the cutthroat machine. If Daniel counts A9 by idea, not
  by machine, this is the Ksar's "new" foe and the falconer the variant (question 1).

THE FALCONER: knife fighter (cutthroat feint/slash) with a hawk scout leashed over him (hawk ent `falcon: <squad>`). SEND = told windup (0.65 s, pose 7, red '!!', sound)
-> release (pose 8) -> the hawk wheels over you and does the hawk scout's own told stoop (0.8 s shadow, '!!'), lands a beat, climbs. CALL = told whistle (0.6 s, pose 9)
-> hawk flies to his glove, sits 1.2 s, rises. WHILE THE HAWK RIDES OVER HIM IT GUARDS HIM: blows x0.4 + shared turned read HIS HAWK GUARDS + dashed jess/shell drawn
(the Hawk-Mistress grammar in small - B8). KNOCK IT DOWN (two blade cuts, a torch or keg blast burns it down outright, a flask blinds it) -> he is OPEN (x1.5, 3.5 s,
gold ring + timer bar, B10), standing still (B4); dead hawk = he fights on unguarded. A hawk out on its stoop = he takes blows whole.
THE PLATED BANDIT: cutthroat machine, weightier (walk x0.65, real windup +0.2 s), cleaver hits x4.0 (heaviest in the fort). Steel: every non-blast blow x0.25 with
the shared clank/flash/word THROW A BOMB (src/boss-read.js turned) + the B14 THROW-IT glyph over him (hot when you carry a keg). A KEG'S BLAST (thrown, kicked,
chain) strips the plate: 1.2 s stagger, full damage, he wears `ksarplatebare` (e.skinNow, honoured by the living draw + reskinSet so the corpse matches).

## Placements (src/ksar.js)
| foe | col | role | rule |
|---|---|---|---|
| plated | 66 road | TEACH SAFE (A4): asleep, out of every gong's earshot, sign "A PLATED MAN: A BLADE ONLY CLANKS. A KEG BLOWS HIS PLATE OFF.", road keg stack 10 back | throw |
| falconer | 289 souq yard | TEACH SAFE: past checkpoint two, sign "A FALCONER: HIS HAWK GUARDS HIM. KNOCK IT DOWN AND HE IS OPEN.", flask rack 280, stall awnings to hide under; souq hawk moved to 306+, souq slinger moved to the far roof walk (332) | ring (souq gong calls him) |
| plated | 340 souq stair squad front (was a shield sentry) + keg stack 333 | TEST, fight during the rule (A5): ring the souq gong, the squad musters under the roof kegs | ring + throw |
| falconer | 411 powder-store roof squad (was a blade) | REMIX: the chain's blast brings his hawk down | throw (chain) |
| falconer | 512 roof two (was a blade) | EXAM climax: his stoops while the lookout races for the bridge gong | cut/ring |
| plated | 746 keg alley (was a shield sentry) | EXAM: the alley chain strips him | chain |
Cast now 77: ksarblade 18, wallslinger 18, hawkscout 9 (3 leashed), shieldsentry 8, whip 7, lookout 6, smoke 5, falconer 3, plated 3. Cutthroat machine 48% (<= 50%).

## Files
src/ksar-foes.js (FALCON / PLATE numbers, falconGuards), src/ksar-hands.js (bind, leash, send/call/open, take, strip, blast/torch roomBlow, reads drawn, walkHint fetches a
keg for an awake plated man), src/ksar.js (placements, foeHit/foeHp), src/redraw/ksar_foes_art.js (NEW: both drawn whole), src/redraw/ksar_art.js (registered),
src/main.js (hurtEnemy0 hook KSH.take, e.skinNow in reskinSet + live draw, ctx.turned, 2 bestiary cards + BEAST_SHORT), src/hint-lines.js (6 lines),
tools/ksar.mjs (+24 asserts), tools/corpses.mjs (the Ksar added - it was never covered - + CORPSES_ONLY scope), tools/ksarfoes-shots.mjs (live probe, not suite).

## Checks
- tools/ksar.mjs: 259 ok (new: cast share, keg by every plated man, teach-safe placement of both, leashed hawk per falconer, plate x0.25 / blast strips / bare
  takes whole, falconer guarded x0.4 / whole during a stoop / SEND pose 7 -> hawk wheels / CALL pose 9 / hawk down -> OPEN x1.5 standing, blast burns the hawk).
- ksar-aloft ok. hint-shown ok (none new). corpses (CORPSES_ONLY=ksar): 8 Ksar skins incl. falconer + ksarplate die in their own skin.
- level-quality ksar: CLEARS (after re-stamping). Pilot re-stamped (knight L1: 100% waypoints, 581% hp/run, 13 deaths; was 556% / 15). Mash LEVEL row re-stamped
  (knight 7 deaths, warden 6, pyro 4 - the mash bot does not clear it); boss rows untouched (not invalidated: level-quality reads them valid).
- reach-heroes ksar: 0 crossings, all 8 heroes (no geometry change). one-new-foe ok. scoped textfit --strict hints,bestiary: 0 on every column (376 screens).
- curve (report-only): ksar row 78 (opens the desert act), 13 deaths vs act-5 want <= 12 - report-only.
- Live probe (work/claude/ksarfoes/probe/*.png + probe.json): falconer sends, hawk stoops, calls to glove (frames 0-5,7,8,9 seen), guarded read shows, open 3.47 s after
  the hawk dies; plated: blade clanks THROW A BOMB, blast 60 + stripped + bare skin.
- Not run: full suite, unscoped textfit, boss rates (boss untouched).
## Reds: none.

## ART NEEDED (sonnet art lane)
- FALCONER: redraw at polish (greybox-readable now): coat/turban/feather, gauntlet; own poses SEND windup (7), SEND release (8), CALL/whistle (9); a JESS cord drawn hawk-to-glove;
  a falconer-hawk variant (hooded/belled, jesses trailing) so it reads apart from the free hawk scouts; hawk-on-glove perch frame (now the hawk scout's ground frame 5).
- PLATED BANDIT: plated set (helm+nasal, cuirass, pauldrons, cleaver) and BARE set (quilted coat) - redraw both; a plate-shatter burst (falling plate pieces) instead of grey sparks;
  a heavier slam frame with floor dust.
- The OPEN ring/timer and the guard shell are greybox strokes (src/ksar-hands.js drawOver).

## OTHER LEVELS THAT COULD USE THEM (Daniel: "we'll find other places to use these guys")
FALCONER: 1 THE RED GORGE (cliff walks, raptors - a falconer on the rim sends his bird down the drop); 2 THE SUNKEN CARAVAN (raider scouts on the dunes, little shade to hide in);
3 WELL TOWN (the bandit hold over the wells); 4 GALE MOOR (a hawk in the gusts - the stoop drifts with the wind); 5 the ROC EYRIE approach (handlers of lesser birds).
PLATED BANDIT: 1 THE RED GORGE (the dynamite bandits' sticks are the bomb); 2 THE ORE ROAD / THE DEEP RAILS (powder at the mine face, a plated foreman's guard);
3 THE SUNKEN CARAVAN / the Gang Leader's kasbah (oil bottles + kegs); 4 THE BURNING VILLAGE / THE STOCKADE (human raiders, powder barrels); 5 the coming FROST/FIRE VOLCANO arc (blast vents strip him).

## QUESTIONS FOR DANIEL
1. A9 count: built both as cutthroat variants (hawk scout stays the Ksar's one new AI). Rec: keep that reading; if you count by idea, call the PLATED BANDIT the new one.
2. Falconer guard x0.4 (the Hawk-Mistress's floor) and OPEN x1.5 for 3.5 s. Rec: keep (same grammar as her fight). Alt: no guard, only an open on hawk down.
3. Plate: only a keg BLAST strips it (torches/fire stay x0.25). Rec: keep (the brief's "bomb"). Alt: a thrown torch strips it too.
4. Curve row 13 deaths (act 5 wants <= 12; report-only, was 15). Rec: leave; the new foes replaced existing ones rather than adding weight (+1 sleeping plated man on the road).
