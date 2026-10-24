# claude-sporeplat - SPOREWOOD PLATFORMING (branch claude/sporeplat, base 408eb9bc)
Three spore-cap gauntlets built only from the level's own taught pieces (bounce caps, leaning caps, lantern caps, existing cap art; no new art pieces). Few or no foes inside.
Every route lock is intact (sporewood2.mjs: all 17 LOCKs still locks). All edits in src/sporewood.js (+4 stuck spots in src/stuck-spots.js).
1. THE LANTERN LEDGES (Hollows, cols 142-157, replaces the flat wall top; test beat): cap stalks over a hollow bog pool, lit by two lantern caps: hop, hop, bounce pair throws you up the wall to
   a high ledge, hop to the lip. Planks on every east face = a fall is the climb back (sting from the pool). Shrine 100 is ~45 cols back. The shaman + lurker moved to the far lip (the old wall-top brute/shield cut).
   PNG: work/claude/sporeplat/g1-lantern-ledges.png
2. THE ROOT SPAN (Larder, tier two, cols 316-333; remix): a LEANING cap carries you off the stair's top over a bog pit, a two-wide hop down onto a bounce pair, and the pair throws you up
   against the wall to the pad and its bud (the 332 lock). One spider keeps the pad. Planks up each east face = climb back. The larder's front hall (webs, weaver, shield) is unchanged.
   PNG: work/claude/sporeplat/g2-root-span.png
3. THE ROOT BREAK (Mother's Knot, cols 368-378; hardest): a leaning cap on the seed stair's three-wide lip carries you over a real six-wide gap to the knot's island; then the
   existing three-cap break. A fall is a real death (told: post, sign, the leaning cap taught twice before), shrine 356 is ~12 cols back. The island's shield/sporeling/brute were cut (the walker stalled on them).
   PNG: work/claude/sporeplat/g3-root-break.png
Side edits: shelves added to keep the second-height share >= 40% (bog lip, larder end, glade wall top, one over each Ledges stalk); the old plank over the Larder's tier two went (it was a bypass round the bud).
## Gates
- level-quality spore: CLEARS THE BAR (pilot, curve, mash restamped: pilot 14 hits 0 deaths; curve 110%/2 deaths; mash 0/6 boss + 2 deaths level; bands 41%)
- solid-islands ok; killzones ok; reach-heroes: all 9 heroes, 0 known crossings, nothing new; checkpoint-gaps ok (4 shrines, none added); dangling-paths ok
- tools/sporewood2.mjs all green; sporewood2-probe all green; sporewood2art all green (level hash stamp -> 0a43f20e255c); stuck static + runtime ok (291 spots, 4 new); signs.mjs ok (2 lines each)
- walker (level-walk spore, knight/warden/pyro x2 seeds, three runs after the gauntlets went in): measured 54/66/84 (first, gauntlets not yet fixed), then 84/84/73, then 61/77/84 per hero; baseline 52/84/95
  (mean 77%, was 0.8). No STUCK ever inside a gauntlet in the last three runs (the remaining stucks 87,28 / 202,28 / 222,22 / 276,23 / 306,19 are the baseline's flaky spots). Arrival mean 65-99% (baseline 79-96), noisy at n=2.
- fps: 54.4 / 56.5 / 56.3 at the three gauntlets (headless rAF, worst frame 136 ms once at the Ledges' first load) - all >= 48.
- Boss untouched.
## QUESTIONS FOR DANIEL
1. The Root Break is a real death gap (a shrine ~12 columns back). Rec built: keep (it is the hardest gauntlet, and told). Alt: a catch floor + planks like the other two.
2. The Lantern Ledges sit in the dark Hollows: lantern caps light each ledge but it is dim. Rec built: keep (the lanterns are the point). Alt: lift the canopy dark over 142-157.
3. Gaps are 2 wide for plain jumps (paladin's widest safe plain jump is 2 at a run); the rest is bounce/lean. Want longer or more gauntlets? Rec: play these first.
