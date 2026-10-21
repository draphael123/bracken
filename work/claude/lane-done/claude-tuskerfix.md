# claude/tuskerfix - OLD TUSKER rams FELLED trunks only + Lumber Trail grounding (OPUS), off master b4dfa014 (BATCH109)

Daniel's playtest 10-21: "The boss gets stunned by random trees, even if they're not actually fallen. They shouldn't be. [You] knock down the trees. If he hits a
tree that's fallen, he'll be stunned. And if it falls on him, he'll be stunned for longer - pinned. There's a floating sign or two, and not all the geometry is
entirely grounded." PORT 8783, one headless Chrome at a time (RAM 3.8-4.6 GB free throughout; no memguard kill).

## 1. OLD TUSKER - THE RULE: FELL A PINE - ON HIM = PINNED, IN HIS PATH = HE RAMS IT
src/old-tusker.js (pure fight), src/old-tusker-hands.js (draw/read), src/lumber-trail.js (sign), src/main.js (bestiary).
- **A STANDING pine is no obstacle.** His charge runs past/through every standing pine to the clearing's wall (the wall still stops + dazes him, as before); his
  walk passes them; they are **no cover** from the tusk sweep any more.
- **A pine that MISSES him lies across the floor as a TRUNK** (`OT.pine.lie` 20 s, was a 0.9 s beat): a WALL to him. He will not walk over it (stops at its end);
  a CHARGE that meets it **RAMS it = DAZED** (1.45 s P1 / 1.2 s P2, x1.25 - unchanged), told 'HE RAMS THE TRUNK', and **the trunk SPLINTERS** (spent after one ram,
  rec as briefed: fell another). P2's double charge never turns off a trunk - a trunk ram always dazes.
- A felled trunk is **cover from his sweep** (his tusks bite its bark) - the standing-pine cover moved to the fallen trunk (see Q2).
- **PINNED unchanged**: a pine falling ON him = 3.4 s, x2, gold ring + timer bar, 14% cap, B3 ward after (a pine felled in his ward bounces off and lies as a trunk).
- Spent pines re-arm from the treeline (now 14 s, was 24 s).
- **The wall read** (greybox, art notes below): a lying trunk wears gold end-caps (its ends = where he stops); in his charge's paw the red run line ends ON the trunk
  with a blinking red/gold impact mark at the end he will hit.
- **Text**: sign 510 'FELL A MARKED PINE. ON OLD TUSKER, IT PINS HIM. IN HIS PATH, HE RAMS THE TRUNK AND REELS.' (2 lines, signs.mjs ok); rule callout
  'FELL A PINE: ON HIM, PINNED. IN HIS PATH, HE RAMS IT.'; first-THICK-HIDE hint 'HIS HIDE TURNS A CUT. FELL A MARKED PINE: ON HIM, HE IS PINNED. IN HIS PATH, HE
  RAMS IT. OR COME DOWN ON HIS BACK.'; bestiary desc rewritten (charge runs past standing pines; a missed pine lies across the floor, he rams the trunk, it splinters).
- **Bot (otPlan)**: reads the charge off its paw (reaction clock from chargeTell, not from the run); waits behind a trunk to let him ram it; works THE CLEARING'S
  COMBO - fell the OUTER pine of one side as a wall (its trunk's inner end sits under the INNER pine's fall line, so he reels there), lay three strokes in the
  inner pine, strike the fourth when he reels under it -> PINNED; keeps one side (no flip-flopping across him); a daze across the clearing is spent on pines.
- **Numbers** (re-tune with flasks): hp 1400 -> **775**; charge 18 -> **10** dmg; sweep 14 -> **12**; clods 11 -> **10**; re-arm 24 -> **14** s; trunk lie 20 s.
  Daze / pin / cap / ward / B15 hide 0.4 untouched.

## 2. LUMBER TRAIL grounding
- **Fixed**: col 94 row 14 - a lone 1x1 block of GRASS-AND-EARTH standing on a timber crib in mid-air over the skid road (the pushblock lesson's silver ledge,
  `block(94,94,14,14)`) -> now `deck(94,14,1)`: a plank on its crib like every other ledge (same collision from above; the log-round lesson unchanged).
- **Swept**: every sign (15, 3x frames), every deck/one-way run (37 frames), 8-sheet route sweep (work/claude/shots/lumberfix/tuskerfix-before), solid-islands
  (wood 0 bare), floaters (ok), signs, my island/post table (every island's crib reaches ground; no FREE post). Every SIGN stands on solid ground (static check:
  0 air under any sign/check/deco).
- **Not a sign but reads like one (rec: Daniel to confirm)**: a **red square with a white X** hangs in the air in many frames (near the crow at 186 in its
  diveTell; at the view's edge near the Briar Maul elite at 254; near 321/419). It is a HUD/tell marker drawn over foes, not level geometry - my best guess for
  "a floating sign or two". Not changed (not this lane's code); see Q4.

## CHECKS
- node: old-tusker **34/34** (new: standing pines never stop/daze the charge, a missed pine lies as a trunk, his walk stops at it, a charge rams it -> DAZED + told +
  splinters, x1.25 on it, wall-only with no trunk, no sweep cover from a standing pine), lumber-trail 91/91, wood2-beats, solid-islands ok, signs ok, floaters ok,
  tells ok, comments ok, dangling-paths ok, spawns ok, boss-read ok.
- page: **firsthour** green ('a charge into a felled trunk -> rammed (trunk spent), past the standing pines -> rammed at the wall'), **boss-greed** green,
  **level-quality wood CLEARS** (all gates incl. pilot, mash, curve).
- RE-STAMPED (levelHash moved: sign text + the col-94 plank): `mash-bot --level wood --write` (k/w/p each die: 4/4/3 deaths, lowest 0%, walked 100%),
  `mash-bot wood --write` (boss **0/6**, all timeouts, boss left 40-75%; stamped at hp 750 - hp 775 only makes him tougher), `level1-pilot wood --write`
  (27 hits, 0 deaths, 129% hp a run), `level1-pilot wood --curve --write` (1 death in 3, 116% a run; Act I band ok).
- NOT run: full suite / QUICK gate (left to the integ), mark-integrity / boss-openings / damage-caps / boss-jump (no tell, pose or hp-wiring change), mobile-perf.

## RATES (campaign L3, practiced, kit flasks)
| hp | profile | knight | warden | pyro | total |
|---|---|---|---|---|---|
| 1400 (old) charge 18 | human | 0/4 (240 s timeouts) | - | - | stopped |
| 1000 | human | 3/4 | 0/4 | 1/4 | 33% |
| 900 | human | 3/6 | 1/6 | 4/6 | 44% |
| 800 | human | 4/6 | 5/6 | 1/6 | 56% |
| 750 | human, n=8 | 6/8 | 6/8 | 6/8 | 75% |
| **775 (FINAL)** | **human, n=8** | **6/8** | **4/8** | **5/8** | **63% in band** |
| 750 | human+dry, n=4 | 2/4 | 2/4 | 2/4 | 50% (dry, reported only) |
| 775 | human, the other six (n=2 at 750 + n=3 at 775) | geomancer **0/5** (dies at ~57% boss left) | ranger 2/5 (losses at 1-13% left) | berserker 2/4 | paladin 2/5, pirate 5/5, reaper 2/5 |
- Fight lengths at 750-775: knight wins 100-180 s (slow: the knight bot spends long stretches jumping charges), warden 25-100 s, pyro 60-85 s.
- Noise is large at n=6-8 (800 gave 56%, 750 gave 75%); 775 is the midpoint and measured 63%.

## REDS
- **GEOMANCER 0/5** on Old Tusker (dies 52-70 s, boss at ~57%): all 9 do NOT yet route with the bot. The otPlan has no geomancer-specific play (his reach/ward); not tuned in time. REC: a follow-up (~30 min) probing his hurt ledger before integ, or accept for BATCH110 with the note. Ranger/berserker/paladin/reaper win some, pirate 5/5.
- Knight fights run long (some 240 s timeouts at hp 800+; at 775 his wins are 100-180 s) - over B6's ~90-150 s; see Q3.

## ART NOTES (art lane)
- The FELLED TRUNK is now the boss's wall: today it is the kit's trunk sprite + my greybox gold end-caps. Wants: a heavier lying trunk (bark, a crushed-fern
  bed, a root-plate/stump end), a clear 'struck' end (chips flying, a dent) when he rams it, and a proper SPLINTER (the trunk breaks into chunks + sawdust)
  instead of today's burst + vanish. The red run line's end mark should become a told impact flash on the bark.
- He has no 'ram a trunk' pose distinct from 'ram the wall' (both use POSE.rammed - fine, B16 holds: the ram is one move).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **The trunk breaks after one ram?** REC yes (BUILT): one fell = one ram; pines re-arm from the treeline after 14 s. Alt: the trunk survives rams and only
   rots after 20 s (stronger for the player).
2. **Cover**: standing pines are NO cover (as briefed). A FELLED trunk is cover from his tusk sweep - REC keep (BUILT): without it the bot fell to 25-33% (the
   sweep reached over the trunk you hid behind). Alt: no cover at all - then hp must drop further (~650).
3. **The wall still dazes his charge** (unchanged, 'as usual'). REC keep (BUILT) - a missed charge into the wall is still an opening; trunks give the BETTER one
   (it stops him beside you, under the inner pine). Alt: the wall only skids him (no daze) so trunks are the only ram - would need hp ~600 and makes the
   charge-heavy knight fights longer.
4. **The red X box** floating over foes (crow dive / elite marker) - is that the 'floating sign'? REC: tell me where you saw it; I left it (HUD, not geometry).
5. **HP 1400 -> 775**: the old 1400 was carried by 'he rams a STANDING pine and reels under it, fell it -> pin' every cycle; without that loop his openings
   are rarer, so his health came down to keep 60-70%. REC accept (BUILT).
