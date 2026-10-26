# SISTERS2 lane (restart) - DONE - head on claude/sisters2 (pushed; see git log; tune commit c4420ff4). Not merged, not deployed (Rookery ships Wed in BATCH124).
Worktree: bracken-sisters2. The previous lane left 2 changed files and the stills tool uncommitted. I committed them as WIP (8fbaaed6): a wider sister canvas (92 -> 116) so the snatcher's wings don't clip, flatter downed/stuck/jar/rake pitch, the chain counter moved above the mark, and the shock arcs. No stash was used.

## THE SIX MOVES (Daniel 10-25). All work in tools/rookery.mjs (green) and have stills.
- DIVER: **CHAIN STOOP** (red !!). She climbs and screams, then makes 2/3/3 dives back to back, each with its own numbered aim ring that locks before she drops. A dive into cracked rock breaks it and she bursts out for the next. If every dive of the chain lands on rock she is EXHAUSTED: a 4.0 s stun with a 34% cap. **TALON RAKE** (yellow !). After a missed dive she skids, sparks show, and chevrons mark her path along the floor. Jump it, or block it and she is knocked down.
- SCREAMER: **SHOCK SHRIEK** (yellow !). She drops low on the middle side of you, swells, and a pale cone fills along the floor. The shriek shoves you toward the ledge edge. A shield braces against it, or you can roll through. If it shoves you onto the lip you TEETER (a told 0.7 s stagger). **CRACKING ECHO** (red !!). The tile ahead of you shivers red and then cracks. Shards hit anyone on it, and it stays cracked rock for 8 s: a new bait spot and a hazard.
- SNATCHER: **BOULDER DROP** (red !!). She carries the rock high and its shadow follows you, then fixes and darkens, and the rock falls. It stays as a cracked stone (another bait spot). **GRAB** (red !!). A red talon line shows at your height. Roll through it or jump it. If she catches you she lifts you, but only over the summit floor, never over the lip. 3 strikes break you free and leave her KNOCKED DOWN. If you fail, she drops you 14 onto the floor. It is never a death drop. In the diagnostic runs (36 fights) the bot was grabbed about 3 times a fight and broke free 2.7 of those 3 times; she let it fall 0-0.2 times a fight.
- The survivors use their own moves more once a sister falls: chain 2/3/3 dives (every 3rd/2nd/2nd attack), rake on 60%/100%/100% of missed dives, grab cooldown 10/7/5.5, shock and echo cooldowns x1 / x0.72 / x0.6.
- Unchanged: the core verb (bait a dive into cracked rock, she is stuck, OPEN), the shared bar, the per-break cap (24%), and the B15 floor (0.4x on the wing; tools/rookery.mjs checks it in every mode). tells: every move has its mark row. `tells --write` produced no diff because the rows were already there.
- Readability fix this run: the boulder used to be carried 150 px up, which put the snatcher, her drop-tell pose and her !! mark over the top edge of the arena screen. She now carries it at 118 (before: the earlier sisters2-boulder-*.png; after: the current sisters2-boulder-carry.png and sisters2-boulder-dropTell.png).

## RATES (BOT_PROFILE=human, campaign L14, practiced, flasks = kit)
- Before tuning, at the previous lane's values: k 6/12, w 3/12, p 8/12 = **47%**. Dives (including chain and mark dives) did about 125-160 damage a fight. Grabs came 11-15 times a fight.
- **Final, n=36 per hero: k 33/36 (92%), w 21/36 (58%), p 19/36 (53%) = 68%, in band.** Changes: hp 920/690/800 -> **770/580/670**; grab damage 12 -> 10; grab cooldown 8/5.5/4.5 -> 10/7/5.5 (first grab at 9 s, was 7); boulder carried at 118 (was 150).
- **Dry (human+dry, n=12): k 6, w 2, p 1 = 25%** (noted only).
- **Mash: 0/6** (boss left 85-91%).
- **Fight length (median win): knight 96 s, warden 161 s, pyro 130 s.** Knight and pyro are inside 90-150; the warden runs long. Share of wins inside 90-150 s: k 19/33, w 8/21, p 13/19.
- Noise warning: this fight sits on a knife edge. Most losses happen with the sisters at 1-20%. n=24 runs gave 54-81% on configs that differ only slightly (for example, the shrieker hovering at 124 instead of 150 gave 54%, so she stays at 150). Read 68% as roughly +/- 8.

## CHECKS
Green:
- tools/rookery.mjs and rookeryart.mjs (level hash unchanged).
- tells: every mark agrees.
- boss-read.
- boss-openings rc 0.
- boss-greed: 51 bosses and 17 minis hold.
- boss-fight-end, run alone: rc 0.
- boss-music.
- textfit bestiary: 328 screens, 0 issues.
- level-quality rookery: PASS. The blocking WARN is report-only, as before.
- level-reach: every level reachable.
- mobile-perf at 4x CPU with the hero parked in the arena (rookery@390:10, god mode): **59.5 fps**, p95 16.8 ms; budget 40.

Not run: tools/check.mjs and the gate, as instructed.

Stills (regenerated after the tune): scratch/lane-reports/sisters2-*.png, for each move at its tell and its release plus a 2x crop (-z), sisters2-poses.png (every new pose for each sister) and the new sisters2-screamTell.png. tools/sisters2-shots.mjs makes them. In the stills the area plate and the "press a key" banner still cover the top of the frame because they are taken seconds after load; in play these fade.

## QUESTIONS FOR DANIEL (rec first)
1. **The heroes are far apart: knight 92%, warden 58%, pyro 53%.** The knight blocks dives, which knocks the sister down and opens her; the warden's fights run long. Rec: ship at 68% overall; in a later pass shorten the downed window after a blocked dive (1.3 s -> 1.0) and re-measure. I built: nothing hero-specific.
2. **The shrieker hovers at 150 px, so her scream-tell pose sits right at the top edge of the arena screen** (sisters2-screamTell.png). The 124 px version read better, but her own dives after the diver falls then came too fast (54%). Rec: keep 150 for Wed and move the arena camera up about 16 px in the art pass. I built: kept 150.
3. **The warden's median win is 161 s**, above the 90-150 band. Rec: accept, since it is hero-driven (she has less damage per opening); the other two heroes are inside the band.
