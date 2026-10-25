# PALISADE2 - Palisade Wood + Battering Beast rework (opus lane, 10-25)
PARTIAL (greybox design + tune DONE and in band; the art/polish pass for the new poses, the breach and the dressing is still to do). Branch claude/palisade2, code head dfe479ed (this report is committed on top of it). Base claude/batch121 1dacbb8d. Not merged, not deployed.

## What changed
### 1+2. THE BATTERING BEAST (src/battering-beast.js, -hands.js, src/redraw/battering_beast_art.js)
The echo was OLD TUSKER (the Lumber Trail, the game's first boss): charge / tusk sweep / thrown clods / stomp waves / a felled thing pins him. The rework recasts it into two different fights:
- **P1 = THE SIEGE ENGINE.** Every attack is a HANDLER'S ORDER: a coloured flag goes up on the gantry, the order is shouted, and a horn plays before his own windup pose.
  - RAM IT (kept: the charge). SWING THE RAM (recast sweep: the ram swings OUT and BACK on its chains, two low passes, so you jump twice). STAKES (kept: the volley).
  - **NEW: PITCH.** A handler lights a pot and lobs two. They land in red-ringed spots and leave BURNING PITCH on the floor for 2.6 s (5 a tick).
  - **NEW: BATTER THE SCAFFOLD.** If you stand on a deck, he comes to its posts and rams it. The deck SHAKES for 1.25 s (told, with a draining bar), then COLLAPSES under you (14 damage, the scaffold is spent). Counter: he stands in that scaffold's own fall line, so you can knock its prop and drop it ON him (STUCK).
- **P2 = THE BEAST UNCHAINED** (at 50%; the buckle is gone). THE CHAINS SNAP: he rears, bucks the two handlers off (they fight on foot as real sprig goblins at 2.4x sprig hp), and bolts into the palisade end, which is a short LOOSE opening (2.6 s, capped at 8%). From then on there are no flags and no orders, and his broken chain drags.
  - Charge (wilder) and TRAMPLE (kept).
  - **NEW: THE CHAIN FLAIL.** A wide arc in front of him, its band drawn through the windup. LOW = jump it (yellow !); HIGH = stay down (red !!, a jump gets hit).
  - **NEW: THE BUCK.** Hug his flank and he turns his rump on you and kicks. Back off, block, or jump.
- Count: P1 has 3 -> 5 attacks; P2 had charge/sweep/trample/volley and now has charge/trample/flail/buck plus the handlers on foot. Every new move has its own windup and release pose in both POSE tables (B16).
- Unchanged: armour 0.4x (B15 floor), WARDED 0.4x, plunge whole, the scaffold rule openings (STUCK / DAZED), the ward after STUCK.
- Tune: hp 1500 -> 1350, charge 13 -> 12, trample 17 -> 14, flail 13, sweep 15, P1 order mix (charge 0.5 / stakes 0.28 / pitch 0.22 at range).

### 3. THE BREACH (src/palisade-wood.js 307-366; the gatehouse and the clearing moved east 60, W 503)
- This is the first half of the gatehouse area: A14's second real platforming section, over destroyed palisade. There is a spike crater (it bites and sets you back), with burnt stumps, stake butts, a leaning panel and crumbling scorched boards over it.
- THREE ARCHERS hold the towers still standing. An archer sees within four rows, so they fire during the jumps. Their draw is told by the existing '!' and draw pose.
- You STORM towers one and two: the route goes over them. Tower three covers the exam, two crumbling boards plus a pike at the landing.
- There is no shrine inside it. Shrine 299 is behind you and shrine 446 comes after the gatehouse (route gaps 101/97/104/149).
- All 9 heroes route with base movement (reach-heroes 0 crossings, after narrowing two gaps for paladin/reaper).
- Stuck-spot pw-gate-bridge, the probe, the shots tool and ARCS were all shifted by +60.

### 4. DRESSING (src/redraw/palisade_world.js; art only, the hash is unaffected)
- FALLEN LEAVES on every floor surface in view (russet/gold, hashed so they don't crawl). The breach gets ash instead.
- New on-theme siege props (palisade stock only): rope coils, tool racks, sawdust, stake piles, log stacks (cut palisade stock), broken charred stakes and scorch. 21 are placed through the wood and 5 in the breach.

## Rates (boss-rates practiced, BOT_PROFILE human, flasks kit, campaign L7, n=12 a hero)
| run | knight | warden | pyro | total |
|---|---|---|---|---|
| r1 rework, hp 1500 | 10/12 | 5/12 | 5/12 | 56% LOW |
| r2 hp 1350, order mix | 11/12 | 7/12 | 2/12 | 56% LOW |
| r3 P2 softer | 10/12 | 10/12 | 3/12 | 64% |
| **r4 final (charge 12)** | **11/12** | **10/12** | **3/12** | **67% IN BAND** |
| dry (human+dry, n=6) | 4/5 (1 err) | 1/6 | 0/6 | 29% |
| mash boss | 0/2 | 0/2 | 0/2 | **0/6** (boss left 87-94%) |

- Fight length (final): knight 116-184 s, warden 64-167 s, pyro 77-155 s. The knight is often over 150 because his bot keeps walking to props and off pitch.
- Pyro dies mostly to the CHARGE (99-124 hp of ~205 taken), same pattern as the original greybox (pyro 5-6/12 there).
- The bot never stands on a deck or hugs his flank, so BATTER and BUCK are proven only by the node check, not by rates.
- Level: mash bot dies on the level with all three heroes (knight 4 deaths, warden 3, pyro 2). Pilot is fresh L1 knight: 2 deaths / 149% hp a run. Curve: 0 deaths / 106%, act I band.

## Checks run
- Green: tools/palisadewood.mjs (now seeded/deterministic; new asserts for orders, batter + counter, pitch, unchain + adds, flail, buck, B16 pose pairs in both tables), level-quality palisadewood CLEARS, reach-heroes (9 heroes, 0 crossings), solid-islands, signs, deadends, threat-holes, one-new-foe, sprinkle-cap, checkpoint-gaps (DENSE report only, as before), stuck --static, map-forks/scale/spacing, elites, curve-shape, goblin-lint, tells.
- Page: palisadewood-probe green (0 page errors).
- Stamps: docs/level1-pilot.json, level1-curve.json, mash-bot.json (level + boss rows) restamped.
- NOT run: tools/check.mjs (as instructed), corpses/textfit/boss-jump page tools, the walker (level-walk) over the breach.

## Stills (work/claude/lane-done/, 640x360, god-mode knight)
- Breach: palisade2-breach-{enter,tower1,boards,tower2,exam,landing}.png, palisade2-leaves-edge.png
- Beast: palisade2-beast-{chargeTell,sweepBack,potTell,pot,batterTell,batter,unchain,walkP2,loose,flailTell-low,flailTell-high,flail,kickTell,kick}.png
- Note: the breach stills frame the route; the spike floor sits below the camera in some of them.

## QUESTIONS FOR DANIEL (rec + what I built)
1. **P2 trigger: automatic at 50% (built) or earned by cutting the buckle (old)?** Rec + built: automatic, with the CHAINS SNAP as a set piece and a short LOOSE window. The buckle was the thing that kept P2 "the same beast with riders". Its time went to the flail and buck.
2. **Handlers on foot: plain sprig goblins (built) or their own skin?** Rec: the art lane gives them the handler look (rust tunic and leather cap, as on his back) with a cnSkin. Built: plain sprigs at 2.4x sprig hp, two max, never respawned.
3. **Pyro 3/12 with flasks** (total 67% in band). Rec: accept for now. If you want it closer, the next step is a slightly longer P1 charge tell for everyone (pyro dies to the charge).
4. **Knight fights 116-184 s** (target 90-150). Rec: accept (bot walking); recheck after art.
5. **Optional "smashes a palisade section, opens a lane"** was not built. He smashes the palisade's end as the P2 set piece but no new lane opens. Rec: skip.
6. **The breach sits between shrines 299 and 446** (149 route tiles to the boss shrine). Rec: keep (your fewer-checkpoints direction).

## Next step = ART/POLISH lane (sonnet)
1. Proper poses for the new moves. Today they are parametric poses on the existing body, plus the chain and the pot handler.
2. The handler-on-foot skin.
3. The order flags drawn into the gantry art.
4. The breach's own tiles: charred stumps, broken palisade panels, a stake-pit spike tile.
5. Arrow glint on the breach archers' draw.
6. Then a polish pass and the scorecard.

Merge note: this touches src/main.js in one line only (the BBH ctx gained `spawn`).
