# LANE REPORT: SCREE 3 + RAM LORD 3 BUILD (claude/scree3, task 1 of plan-scree3-1102.md section 10)
Branch claude/scree3 from master ca825000; worktree C:\Users\Daniel Raphael\.claude\bracken-lanes\bracken-scree3. NOT merged, NOT deployed, no full suite/gate.
SHA: see `git log -1 claude/scree3` (WIP commits b71e627a, d2252e51 + this report's commit). Pushed to origin/claude/scree3.
Placeholder / code-drawn art only: art lane (task 2) owes the final art; nothing here ships before it.

## What was built, per plan step
2. DAMAGE PARITY (RAM.open = { impact 300, t 3.2, mul 6, cap 0.25 }, src/ram-lord.js). openIn()/openCap() are used by BOTH the wall crash (main.js updateRam) and the cliff stun (ramStep).
   Both: CRACK 300 straight through the shared hurt path (hurtEnemy, no BLOW, so no horns / frontMul; skipped while WARDED), hitstop 0.06, 3.2 s of blows x6, end early at 25% maxHp taken
   ("HE SHAKES IT OFF"), then the 2 s ward. The bank wall's +0.8 s is gone (same numbers; bigger SHOW kept: +1 rock, shake 13, zoom). Bestiary line updated ("the cliff and the wall hit him the same").
   Measured on the page: wall slam = 300, rock on him = 300 (hp 6413 -> 6113 both), both 3.2 s, both capped at 25%, warded crash = 0.
3. BOULDER BUTT (his 6th move, all phases): pick() weight 15%, cooldown 6 s, never twice running, needs ad > 60 AND a wall within 175 px (see Q6). boulderTell 0.85 s (he trots at the nearest wall, 3 hoof scrapes
   = dust + new SFX.hoofScrape, red '!!', 'BOULDER: JUMP IT' first 2 times, a boulder shakes loose in the cliff lip with grit) -> boulderButt 0.25 s (lunge, horns in the cliff, SFX.stone/thud, shake 7) -> boulder falls,
   rolls r10 / 20 px tall at 150 / 175 / 190 px/s (P1/P2/P3), hits the far wall, back once at 60%, shatters at the wall it came from -> headIn 0.7 s (back to you, NOT an opening, blows land whole by the angle rule).
   DMG.ramBoulder 24 (33 on the page after scaling), knockback 200, blockable (SHOVED 120 px/s + chip). A jump (feet above 20 px) or a roll clears it. It knocks an ARMED prop out like a blow (stepLip takes c.bb);
   the page test rolls one through a prop with him in the line and he is STUNNED (frame 53). Marks: src/marks.js 'ram|boulderTell': '!!'. Stile sign added (level.js, x305): "HE HORNS THE CLIFF AND A BOULDER ROLLS: JUMP IT. HIS BOULDERS KNOCK THE PROPS TOO."
4. STOMP LOOK (code-drawn): red pulsing ground ellipse at the true 30 px hit radius + dust lifting during stampTell; at release a flash frame, expanding dust ring (0 -> 46 px, 0.35 s), 3-4 jagged ground cracks fading over 1.2 s (stompFx / drawStompFx),
   the two waves drawn as an ochre rock-shard ridge (drawRamWave) exactly the wave's real hit height (5 px; stones that pop above are grit only), SFX.stompBoom. Same ridge for the leap's landing waves and the P2 butt's waves (waves pushed with { ram: true }).
1. GROUNDING: floating-geometry scree = 89 groups. 82+ are ONEWAY / SHELF route ledges (the hill's stepping stones) which the art already draws on rock piers / crag underbellies; tools/visible-supports.mjs scree = 0 overhangs without a verified visible support (56 checked).
   The ONE solid hit (the mill's 5x5 arch hung 2 tiles above the gorge floor, cols 463-467 final) is now a rock stack down to the floor (level.js GA.block(279,283,19,25)). Gorge bottom = two pockets, each keeps its rope ladder out (reach-heroes scree green).
   tools/floating-geometry.mjs: FIXED = ['theatre','scree'] with LEDGE_OK = { scree: ['ONEWAY','SHELF'] } (any SOLID/other group floating on scree now fails). See Q4. floaters.mjs: no scree rows.
6. MUSIC: scree plays musMountain (MintoDog "8bit Action Stage Select", CC0, already in the repo, 32.0 s loop = 2.6x the old 12.3 s 'mountain' loop; benched since the windcaller got its own). I CANNOT LISTEN, so this is a reasoned pick, not an audition;
   one word in level.js (music: 'musMountain' -> 'mountain') puts the old one back. mountain.ogg stays for the Sound Test. credits.js row swapped, audio/CREDITS.txt note added. quarry.ogg = a cavern track, highcrown = the Goblin Queen's throne room: rejected.
   No download made.
8. TESTS / TOOLS: tools/ram-lord.mjs (NODE + PAGE: parity, window, cap, ward, boulder start/roll/hit/miss/prop-stun, move runs, sign, sounds exist); tools/ram-bank.mjs rewritten for parity (same window, more rock at the bank);
   tools/floating-geometry.mjs (gate + ledge allowance); tools/ram-shots.mjs (new, picture tool, not in the suite).

## Checks (one at a time, logs in scratch\lane-reports\scree3-logs\, summary.txt; runner scratch\scree3-checks.sh)
GREEN: ram-lord (node + page), ram-bank, floating-geometry (all), visible-supports scree (0), tells (marks row present), goblin-lint, signs (1170 signs, 2 lines), scree-rework, boss-read, audio-assets, music-levelstart, music-priority,
reach-heroes scree (0 new crossings), scree-chase, boss-openings, rule-openings, boss-fight-end (scree/ram ended ok; the 900 s timeout was RAM starvation from other lanes at 44/53 bosses, not a failure).
RED (expected, owed): level-quality scree = pilot + mash rows stale (level hash 1e7b6c7c6795 -> e58f5bbb8028 from the mill stack + signs + music key): re-stamp with `node tools/level1-pilot.mjs scree --write` and
`node tools/mash-bot.mjs scree --level scree --write` (tune lane does these anyway; I did not spend the 40-minute budget on them).
STILL RUNNING / UNCONFIRMED when I wrote this (background runner, results append to scree3-logs\summary.txt): ward-vs-guard, untold-told, told-sweep12, boss-greed, ram-pilot, textfit --strict (the longer bestiary line + the new sign are the risk),
soundtest, music-start, mash-bot scree. Read summary.txt before merging; any red there is mine to fix in the art/tune lane.
NOT RUN: tune numbers (task 3: win-rate with flasks n=6 per hero, hp / boulder weight / RAM.open.impact knobs); no win-rate runs at all (brief did not ask for them).

## Screenshots (scratch\lane-reports\scree3-shots\)
stomp-1-tell, stomp-2-release, stomp-3-waves, stomp-4-fading, boulder-1-tell, boulder-2-butt, boulder-3-rolling, prop-1-armed, prop-2-inline, prop-3-spent (tools/ram-shots.mjs).

## Owed to the ART lane (placeholder now)
Boulder sprite + roll frames (code-drawn disc today); the boulder tell's rock in the cliff lip hangs in open sky at the wall pillar (draw it in the arm / lip, or anchor to the pillar); Ram poses boulderTell (rear + scrape; frame 3 reused),
boulderButt (horns in cliff; frame 5 reused), headIn (frame 4 reused), stompTell (hoof high; frame 5 reused); crack / shard / dust-ring bakes (scree-art.js) instead of the code-drawn ones; the CHOCK CAIRN prop redraw and its 5 states
(plan section 5 NOT done: prop is still the old pier; only its screenshots exist). Check the ridge reads at phone size.
## Owed to the TUNE lane
section 9 numbers with the CRACK parity + boulder in: hp 6000 +-600 -> boulder weight/speed -> RAM.open.impact; mash 0/6; fights 90-150 s; re-stamp pilot/mash/curve rows. Note boss fights run at ~0.56x time in this harness's first seconds (intro slow-mo); frames != seconds there.
Not done on purpose: P2 scree 'carry' added to the boulder speed (150/175/190 only).

## Questions for Daniel (recs built)
1. Same damage: built as rec (CRACK 300 + same 3.2 s / x6 / 25% cap for both). Alt: no impact, windows only.
2. Bank wall: built as rec (same numbers, bigger show). Alt: keep +0.8 s.
3. Music: built musMountain (in-repo, unheard by me). Please give it a listen; alt = revert to 'mountain', or I list 3 CC0 downloads for your OK.
4. Grounding: ONEWAY/SHELF route ledges are allowed by the gate (they sit on drawn crag piers, visible-supports 0 findings). OK, or do you want specific ledges removed? (point at them in a screenshot).
5. Boulder from P1: built as rec (yes).
6. NEW: boulder pick needs a wall within 175 px of him (he trots to it, so the horns-in-cliff beat is true). Rec: keep; it makes the move rarer (~a third of his picks qualify x 15%). Alt: let him cross the fold, or spawn the boulder at the wall wherever he stands.
7. NEW: synergy (boulder knocks a prop that stuns him) is rare by geometry (he stands at the wall, props are 5 tiles in). Rec: leave; the tune lane can move the zone if it matters.
