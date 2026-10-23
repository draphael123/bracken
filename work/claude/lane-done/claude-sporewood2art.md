# SPOREWOOD 2 + THE MOTHER CAP 2 - ART PASS (`claude/sporewood2art`, sonnet art lane, 2026-10-23)

Branch `claude/sporewood2art` on `claude/sporewood2` (0d8a6b0a). Art only: **the level hash is the greybox's (`c0b80ba1d0de`)** - no grid, ent, mover or ambush changed. Everything lives in new
`src/redraw/sporewood2_*.js` modules plus small hooks in `src/main.js`, `src/sporewood-hands.js`, `src/mother-cap2.js`, `src/forest-supports*.js` and non-hashed level data
(`tints`, `palette.haze`, `pools` colours, `ambient`, a `reskin` table) in `src/sporewood.js`.

## WHAT CHANGED (before pictures = the greybox's `work/claude/lane-done/sporewood2-*.png`, after = `sporewood2art-*.png`, same shots, same coordinates)

THE PALETTE (`sporewood2_pal.js`): earth and fungus, ONE glow. Soil, peat, bone and root go olive-umber (glade) -> indigo loam (hollows) -> wet peat (bog) -> bone-grey clay (larder) -> root-red (her knot) -> plum
(her hollow). The wood's one glow is FOXFIRE (a cold teal-green): lantern caps, mycelium veins, the bounce cap's spots, spring-spore rims, her foes' eyes, the knot's seam. Gold stays the game's
target colour (the plunge mark, a seed's fleck), red its danger colour. The level's violet wash is gone (tints softened per area).

SIX AREAS, EACH ITS OWN AIR (`sporewood2_backdrop.js`; layers crossfade over 14 tiles at each seam, no popping):
- MYCELIUM GLADE: grey-green morning, hazy toadstools on the far bank, slow light shafts, white mycelium on the ground lip.
- LANTERN HOLLOWS: indigo dark under a roof of cap undersides hung with gills, foxfire clusters twinkling on the stems and floor, hanging foxfire strings (the level's dark zone still rules the light).
- PUFFBALL BOG: olive peat air, great pale puffballs on the far bank, horsetail reeds, low mist; the bog water is olive scum now, not violet.
- WEB LARDER: bone-grey, big radial webs strung on the stems, cocoons hanging, bones and silk bundles on the floor.
- THE MOTHER'S KNOT: root-red; her roots arch over the way, root tangles on the floor, hanging roots.
- THE MOTHER'S HOLLOW: dark plum so she pops, the vault of her gills overhead, foxfire in the dark.
THE MOTHER'S KNOT is a landmark: repainted (`sporewood_knot.js`: spotted plum cap, cream gills, twisted-root trunk, the knot glowing foxfire, spores raining from the gills), drawn BEHIND the area's
mid row so it peeks between the stems from the first screen, growing and warming as you climb, and giving way to the real her over the hollow.

TILE KIT (`sporewood2_tiles.js`): soil with a living lip (moss, white mycelium threads, toadstools; foxfire on the hollows', wet sheen on the bog's, bone and web on the larder's), earth faces with
root cords and buried stones, undersides hung with threads, mass with continuous mycelium veins; the one-way shelves are BRACKET FUNGUS on cap STALK supports (no posts or logs: theme fit); the bounce cap
is a plump cream cap with foxfire spots (squashes under a foot). Floor dressing per area (`planDress`: toadstools, horsetails, foxfire clusters, puffballs, bones, silk, root tangles, hanging cocoons / roots / strings).

THE RULE'S MACHINES (`sporewood2_world.js`): the buds (plain, DARK = grey-indigo with a shut eye until a lantern lights them and they grow foxfire-spotted, SEED = amber with a gold fleck and a
glow while it waits for the blow, HER seed caps plum, leaning stalks, the withered grey cap), lantern caps (foxfire buds; lit they burn with a breathing halo), mend puffs (pale green, a cross, motes;
a cloud of motes while they mend), puffballs and spring spores (squash under a foot), root knots (gnarl with a glowing seam and the dotted target line first; open = a split root), spore pods that
hang over a drop and SWELL before it lets go, the falling pod with a trail, SPORE CLOUDS DRAWN (soft lobes, a ring of spores at the reach so you can read it, motes; sickly olive with red motes for
harmful, pale teal for her brood's mild ones, lilac for sleep).

THE GOBLIN HEAVIES RESKINNED (theme fit; same stats and AI, art + names only; `sporewood2_foes.js`, `L.reskin` applied at spawn so the level hash is unchanged):
- shield -> **MYCONID GUARD** (olive cap, cream stalk-flesh, bark tunic, a bracket-fungus shield, foxfire eyes under the brim), brute -> **CAP BRUTE** (a hulk of ochre stalk under a great rust cap spotted cream, moss tunic, bone-pale club, foxfire eyes), archer -> **SPORE ARCHER**. All 8/5/10 frames of the goblin's sheet (walk, turn, shove, swing, hurt, death), mirrored + white-flash; each has a bestiary card; a corpse lies in its own skin.
- HER BROOD (`puffbrood`): the sporeling's AI with pale puffballs on little feet and foxfire eyes (a card of its own).

THE MOTHER CAP 2 (`sporewood2_mother.js`): the old sallow rotate/scale cap is gone. EVERY windup and release is its own baked picture, 34 frames x 2 phases (P2 wears the NET: foxfire veins down
the stalk and across the cap), baked at the level load (~240 ms for both sets): idle (breath), lashTell x3 (she hunkers, roots rise like cobras, ember tips) / lash x2 (roots flat along the floor, cap tilting after),
crushTell x3 (the cap LIFTS off its stalk, gills spreading) / crush x2 (slammed down squat, dust), bloomTell x3 (gills flare and light, plumes gather) / bloom x2 (a spray from the whole rim), broodTell x3 (the cap tips
back, puffballs swell under the gills) / brood x2 (the pockets empty), witherTell x3 (a root-limb rises, its tip blighted, the stalk leaning to the cap) / wither x2 (the limb slashed down), open x2 (HER KNOT TORN: the crown
split, the hot heart, the cap thrown back), ward (pearl-sealed), phaseRise x2, wake x2 (the sleeping pose is the low wake frame). The floor effects are drawn too: a thorned root lash with an ember tip and dust, the cap she drops
(a plum dome with gills showing, a red ring on the mark), the bloom as a drawn spore cloud, and the P2 net as a forking foxfire web across her floor. The bestiary / map portrait is repainted (`SPR.mother`, 56x52).

Also: area banners in foxfire, one ambient bed an area (forest / drip / water / cave / wind / deep), `tools/sporewood2art.mjs` (new check), `tools/sporewood2art-shots.mjs` (stills + contact sheets).

## CHECKS
Run in this worktree on port 8781 (the PC was starved for memory all morning: memguard killed several of my headless Chromes - see the notes).
| check | result |
|---|---|
| `tools/sporewood2.mjs` (the greybox's structural check; its one assertion on the knot's draw now follows the new call site) | all green |
| `tools/sporewood2-probe.mjs` (page: buds, dark buds, lantern, dazzle, mend, spring spore, seed pair, root knot, banners, her waking) | all green |
| `tools/sporewood2art.mjs` (NEW, registered in check.mjs: hash = greybox's `c0b80ba1d0de`, reskin table + sheets + cards, her 15 pose sets all distinct and none the idle, P2 set distinct, no page error) | all green |
| level-quality `spore` | PASS: pilot 12 blows / 0 deaths, curve 58% / 0 deaths (act-I band), mash level + boss 0/6, density 2.12, 3 roles, rule fights 18 |
| solid-islands | ok (spore 0) |
| architecture, checkpoints, skins, npc-removal, dangling-paths | ok (dangling-paths was RED at the greybox base: 9 retired spore/mother tool citations - five `MISSING` rows added, with reasons) |
| boss-fight-end, spore alone (copy of the tool filtered to the level) | ok: her death ends the fight. The full 65-fight run is a 2-3 GB page and memguard killed it twice here (over cap / free-memory floor); the greybox base passes it 65/65 when the PC is quiet - please let the batch gate run it |
| `CORPSES_ONLY=spore node tools/corpses.mjs` (`spore` added to its level list) | ok: capbrute, myconidguard, sporearcher and the Spore Mage each die in their own skin |
| goblin-lint | ok (Sporewood is before the Goblin Queen on the road, so the lint does not cover it; the reskin is the brief's) |
| textfit | bestiary 307 screens ok, card 75 ok, hints / store / tree / pick / mapcard / death / results ok, boss 1/12 ok; the run was killed by memguard (3.4 GB over cap) in a later scope - the new bestiary rows are inside the passed scopes |
| mobile-perf, 4x CPU, 915x412 phone, `MP_SCENES=spore@26:40,spore@120:38,spore@214:26,spore@424:14` | glade **60.6 fps**, hollows **51.8**, bog **46.1**, her hollow (arena, P1 idle) **46.9**; worst frame 100 ms (the bog), budget >= 40: inside it |
| **RED at the base, not this lane**: `slopes-trace` (4 of 6 levels differ: wood, kings, burial, canal - identical on `claude/sporewood2` 0d8a6b0a) and `foe-pass` ("act I-II family drone has no told attack: no SIG and no TOLD_TODO line", the greybox's 0.55 s told drone burst) | both fail identically on the untouched greybox |

Pictures (all 640x360 real-page stills, the knight in god mode, same shot list as the greybox): before = `work/claude/lane-done/sporewood2-<tag>.png`, after = `sporewood2art-<tag>.png`.
Side-by-side sheets (greybox left, art right): `sporewood2art-pairs-places.png` (glade, hollows, bog, larder, seed stair, her door), `sporewood2art-pairs-rule.png` (terrace, lit dark bud, dark shaft, spring spore, cap ladder, root knot),
`sporewood2art-pairs-mother.png` (idle, lash / crush / bloom / brood / wither tells, open). Her extra stills: `sporewood2art-mother-lash.png`, `-brood.png` (the puffball brood walking), `-net.png` (P2 net live).
Tools: `tools/sporewood2art-shots.mjs [tags]` (`SHEET=name` for a contact sheet), `tools/sporewood2art-pairs.mjs`.

SELF-GRADE: **B** (the target was >= B, ideally B+). Why not B+: the Lantern Hollows are drawn in full but the level's dark zone (0.86) keeps most of it black outside a lantern's light; no new sound
beyond the per-area ambient beds; the sporeling / spitcap / lurker / shaman keep their old (mushroom-themed, violet / teal) sheets; the far layers are static parallax (no wind). Why not lower: six areas that read as six places,
one palette with one glow, the knot as a landmark, every rule machine and spore cloud drawn, the heavies reskinned with cards and bodies, and all of her windups and releases baked.

## QUESTIONS FOR DANIEL
1. The Lantern Hollows are drawn in full but the level's `dark` zone (0.86) hides nearly all of it outside a lantern's light (that is the rule's point). Recommend: leave it (a TUNE lane owns difficulty); the foxfire dressing glows where a lantern reaches.
2. Her sporelings, spitcaps, lurkers and the shaman keep their old violet / teal sheets (they are mushroom-themed already). Recommend: leave; a later reskin of them in the earthy palette is one table + `bakeX(base)` each, same machinery as the guard and brute.
