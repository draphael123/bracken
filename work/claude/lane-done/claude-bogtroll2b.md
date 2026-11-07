# BOGTROLL2 (second pass) - claude/bogtroll2b, tip a3743121b (off master 95bc267a4)
Note: branch name claude/bogtroll2 was already used by the earlier crossing lane (merged), so this one is claude/bogtroll2b. Worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-bogtroll2b. Not merged, not deployed. No browser run.

## Changes (Daniel 11-07 08:28 approved line)
1. EASY LAYING (fen-road-hands.js, fen-planks.js)
   - New SAG.reach 48 px (3 tiles) and SAG.dy 20 px. H.slotNearest(pp, maxD, dy, needGround) picks the nearest open stretch by gap to either edge; slotAhead = reach 48 / dy 20. Either facing, either side; hero turns toward the hole on lay. Was: 20 px, facing it, feet within 3 px of the row.
   - GLOW while carrying: nearest valid hole within 640 px / 80 px vertical pulses warm gold (bar along the hole + two lip ticks); brighter bar + the existing ghost plank + 'E: LAY IT' when E will work from where you stand. A blow / swim still drops the plank (untouched).
2. THROW STUN (bog-troll.js, bog-troll-hands.js, fen-planks.js, main.js)
   - BT.stun = { t 1.5, mul 1.5, cap 0.25, cd 4 }. A thrown plank on him in up / recover / dragTell / hurlTell / pileTell / waveTell = new mode 'stun': 1.5 s, stops the told move, blows x1.5 (on top of the raw blow, not the 0.4 hide), same per-stun purse as STUCK (25% of max HP), then back to 'up' (0.5 s rest). 4 s cooldown. Plank hit = 6 x 1.5 = 9 dmg.
   - Nothing when under water (plank never reaches him), sinking, stuck/pinned, heaving, warded, ripTell: the plank bounces off ('THE PLANK BOUNCES OFF') and lies where it falls (can be taken again). Only the troll is allowed past the '!e.boss' target filter.
   - Reads: gold ring + bar 'STUNNED' (the shared OPEN read), name bar 'STUNNED', stars over his head, dazed pose POSE.stun (greybox: arms hanging, head lolling; art lane may repaint).
3. CLEAR PATHS (src/redraw/fen_marks.js new, fen-road-hands.js, main.js)
   - Every arena rotten section standing (and every section a hero LAID: same machine) gets cracked boards + a red rag on a post at its near end. While a hero stands on it during his hunt (under / burstTell / waveGo) it PULSES: red wash over the boards, rag snaps faster, two red ticks over it. New hooks: BTH.hunting(), ctx.trollHunt, ctx.plankBoss.
4. TEXT: first-cards bogtroll card gets a 5th line ('RED RAGS MARK THE ROTTEN BOARDS. E LAYS A PLANK; ATTACK THROWS IT - A HIT WHILE HE IS UP STUNS HIM.'); BT_RELAY (told at first tear-free) and PLANK_HINT now say lay-from-a-few-steps + throw stuns him. Card width: widest line 264 of 266 px (unchanged widest).

## Band effect (60-70% with flasks) - expected, not measured
The bot never throws, so the bot band is unchanged. For humans: a plank costs a bank trip (stock 3, refill 6 s) and an aimed throw; one stun is ~9 + about 2-3 sword hits x1.5 (cap 183 HP) = roughly 40-90 HP, 5-12% of his 730, at most one per 5.5 s. Easier laying also raises lure uptime. Expect +2 to +5 points of win rate for a player who uses it. Rec: no HP change now; if n=6 lands above 70%, raise BT.hp 730 -> 770 (one number).

## Verified (node only, no browser; RAM 3.8 GB free)
- node --check: main.js, bog-troll.js, bog-troll-hands.js, fen-planks.js, fen-road-hands.js, first-cards.js, fen_marks.js - ok
- tools/fen-road.mjs 220 checks ok (old 'facing away / two tiles back = no slot' replaced by: facing away ok, 44 px ok, 70 px none, glow from afar, far side 30 px ok, 14 px vertical ok, a storey up none)
- tools/bog-troll.mjs 83 checks ok (new: no stun under/sink/sleep/wake/stuck/stuckIn/heave/ripTell/warded; stun 1.5 s, x1.5, cap holds, back to up, 4 s cooldown, runs out alone)
- tools/first-cards.mjs ok (11 boss hints); tools/demo-cut.mjs all green; fen_marks draws under a mock canvas (66 calls). No dedicated planks tool exists (fen-road.mjs covers fen-planks.js hands).

## OWED (browser, Daniel is playtesting - not run)
- Stills: carried plank glow far / near with 'E: LAY IT'; rotten section marked (cracks + rag) calm and pulsing under a hero in his hunt; laid lure marked; stunned troll (stars, ring, STUNNED); plank clunking off a warded / stuck troll.
- Throw feel: plank arc vs his box (x 40 w, up at y+26 under the boards) - check a lobbed throw actually reaches him from the boards; adjust the hit box if it feels stingy.
- n=6 Bog Troll win-rate with flasks (bot band), plus a human-ish run if possible. Bot is unchanged so expect the old band.
- tools/check.mjs full suite not run (not allowed here).

## Questions (recs built)
1. Should a stun also cancel a told move he is already releasing (drag/hurl)? Rec (built): only the tells are interruptible; a released move finishes.
2. Plank stun cooldown 4 s - keep? Rec: keep (stops bank-trip chains from stun-locking).
3. ripTell (phase change) not stunnable. Rec: keep (phase beat stays readable).
