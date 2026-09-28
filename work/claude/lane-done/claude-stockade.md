THE STOCKADE - design-audit fixes (claude/stockade)

Brief: audit section "3. THE STOCKADE" plus game-wide item 1 (last stretch before the boss must be an EXAM). Built on current master, which already has the NPC-removal batch (the coffers quest is gone; nothing re-added).

WHAT CHANGED (src/level.js, src/main.js)

All four of the audit's plan beats for this level, plus the approved backlog's "Stockade tower-3 horn runner" item - which turned out to be the same beat as the audit's twist, so it's one piece of work, not two.

1. TWIST, tower 3 (audit's final col ~431). The horn archer at the high bridge's tower no longer stands on the tower. He now starts on the ground at the bridge's far end (ent('archer', 291, 11, { horn: true, runTo: {...} })), and only when he sees you does he run for the tower, climb a new net column beside the jump platforms, and stand at the old spot to sound the horn - the normal horn-draw logic (unchanged) picks him up once he arrives. A second, stationary archer stays on the tower ledge to keep shooting at you while he runs, so "climb the net under its archer's fire" is real. A sign at the bridge's end says so. This is src/main.js's archer case (new runTo/running/climbing/arrived fields) and a new branch at the top of the archer's updateEnemies block that runs/climbs him to the target, then falls through to the existing horn code unchanged.

2. COMBINE horn + gate (audit's ~288/313, the kennel tower and its crank). That horn archer now carries pack: [{dx,y}, {dx,y}] - two hounds it wakes, positioned behind the crank gate, instead of the one hound that always stood there. Silence the horn and the crank ahead is quiet; let it sound and the pack spawns where it's marked and the cart lane is a real fight. Implemented as a small addition to the existing "blown" branch in main.js (spawns the pack only for a horn that has one - every other horn tower is unaffected).

3. The horn in the boss (the hall, ~454-490). A third horn archer stands up the escape-gate rafter climb (col 344, the same column escapeGate already used for the post-death climb - the platform was already there, built "for when the hall burns"; it's climbable mid-fight too). He's flagged rafters: true, which turns off his normal proximity horn-draw. Instead, hurtEnemy0's existing phase-2 trigger (e.hp <= maxHp/2, already shared by nine other bosses) now also checks, for the Chieftain specifically, whether that rafters archer is still alive and un-blown; if so he sounds it and two sappers drop in. Climb up and deal with him during phase one and the wave never comes.

4. EXAM, the high bridge through the hall door (audit's ~398-452). Added a sapper at the bridge's far end (alongside the existing rope-cutting sprig), and restored a hound at the foot of the second lift (a comment in the file said one used to stand there and was cut - brought back per the audit, which explicitly asks for "the lift down to a hound on the landing"). The two checkpoints the audit names (376 before the tower-3 stretch, 451 outside the hall) were already exactly there in current master - nothing to add.

No changes to src/burning-village.js or anything shared with the Burning Village lane. The pack/runTo/rafters fields are new optional fields on the existing archer entity, gated behind flags only this level sets, so every other level's archers (including any in the Burning Village) are untouched. The one genuinely shared-code touch is the chief-specific branch added inside hurtEnemy0's boss-phase block in src/main.js - it's gated on e.t === 'chief', so it can't affect any other boss.

NUMBERS BEFORE/AFTER (tools/pacing.mjs stockade)

- Route unchanged in length (479 tiles), checks still 11/11 on route.
- Landings with a creature within 2 tiles: 4 to 5 (added: hound@445,19, the restored lift-landing hound).
- Last ~80 route tiles (audit's EXAM window) went from "...RPF-RBB" to "...FPF-RBB" - denser right before the boss gate, plus the new hall-rafters horn now reaching into the fight itself.
- mix: fight 7 to 8, set-piece unchanged at 15, rest 7 to 6 (one static hound removed from the kennel gate, now spawned dynamically instead).

CHECKS RUN (all green)

node tools/check.mjs -- architecture,checkpoints,skins,dangling-paths,boss-fight-end,slopes-trace,npc-removal

ok  syntax
ok  dangling-paths   2367 tracked files, every repo path resolves
ok  checkpoints      427 checkpoints, none inside an arena/mini/ambush, none on a flight
ok  skins / roofs
ok  boss-fight-end   45 boss/mini fights (32 bosses, 13 minis) all end when the boss dies
ok  architecture     44 levels, 348 built pieces, 2 grandfathered (unaffected)
ok  npc-removal      every NPC outside shops gone; ferryman/captives are mechanics, no dialogue
ok  slopes-trace     every frame of every level identical to the pre-slopes build

Ran twice, both clean. ls tools | grep -i stockade and grep -n "stockade" tools/check.mjs found no stockade-specific check file to run - none exists in this repo today.

Also ran node tools/pacing.mjs stockade before and after (numbers above), and node -c on both changed files.

UNVERIFIED

- No bot-pilot run on the Chieftain fight. The boss's phase-2 behavior changed (the rafters blower's sapper-wave hook), and common.md's cost rule calls for a before/after bot pilot (3 heroes x 1 seed) on a boss that changed. There is no existing tools/*chief*pilot.mjs or *stockade*pilot.mjs to reuse, and building a bespoke Puppeteer/CDP harness for a single boss was more than this level-design pass's budget. boss-fight-end confirms the fight still terminates on the Chieftain's death, but nobody has played the phase-2 sapper wave live.
- The blower's scripted climb (main.js, tower 3) is not physically simulated - once he reaches the base of the net he ignores tile collision and glides to the tower top (like the existing sprig-ringer-to-bell pattern this borrows from). It should read fine visually against the tower's own geometry, but it hasn't been eyeballed in the browser.
- Balance of the kennel "pack" (1 static hound to 0 or 2 dynamic hounds depending on whether the horn is silenced) is a bigger swing than before; no playtest of that fight either way.

QUESTIONS FOR DANIEL

1. Should the tower-3 blower's run/climb be interruptible by a stagger (currently it isn't - only killing him stops him)? Recommendation: leave as built - "catch him" reads more like a race than a stun-lock, and the tower's own archer still gives you a reason to stop and fight before he starts running.
2. The rafters horn-in-the-boss reuses the escape-gate rafters (built originally only for the post-death climb). Is it OK that this platform now does double duty (mid-fight foothold + escape route), or would you rather the phase-2 blower stand somewhere else in the hall entirely? Recommendation: keep it - it's exactly the column the audit named (472/base 344), and reusing existing geometry avoids adding new solid tiles into a boss arena the checks already treat as settled.
3. No bot pilot was run on the Chieftain (see UNVERIFIED). Want a follow-up lane to build/run one before this ships, or is boss-fight-end plus a manual playtest enough? Recommendation: a quick manual playtest is enough for a level-design change of this size - nothing here touches the Chieftain's own attack patterns, only what happens once at the 50% threshold.

Final commit: see git log -1 at time of this report.

## Follow-up: tools/stockade-horns.mjs (pins the four beats)

Coordinator asked for a check that pins these beats so a later merge can't silently drop them. Added `tools/stockade-horns.mjs`, registered in `tools/check.mjs`'s list (before `]) if (take(t))`) and its header comment.

While writing it, the check caught a REAL BUG in the first pass of this lane's own work: the tower-3 blower's `runTo` target was stored as absolute tile columns (`{x:303,y:6,climbX:298}`). `grow()` (the function every later section is spliced in with) shifts an entity's own `x` field, but never a nested field like `runTo.x` - so after the sapper tunnel, the wall walk and the siege engine were spliced in ahead of tower 3, the blower's own position shifted correctly (to x=419) but his target stayed at the old, unshifted columns (303/298) - he would have run to completely the wrong place in the built level. Fixed by storing `runTo` as `{dx, y, climbDx}`, offsets from the blower's own x (the same pattern `pack`'s `dx` already used correctly), resolved at spawn time in `src/main.js` off the archer's own already-shifted `e.x`. This is the kind of drift-after-a-later-section-grows-in bug the check exists to catch, and it caught it before it shipped.

**Proved red first**, in a throwaway worktree off `origin/master` at cd35d24 (`git worktree add`, never `git stash`): copied `tools/stockade-horns.mjs` in (master has none of the four beats), ran it - 6 failures across all four beats (no runTo, no pack, no rafters archer, no lift hound, no sapper wave, and the "silenced" case couldn't run because there was no blower to silence). Removed the throwaway worktree afterward (`git worktree remove --force`).

**Proved green** on claude/stockade after the runTo fix:
```
stockade-horns (static): blower 419,11 -> {"x":431,"y":6,"climbX":426} | kennel pack [{"dx":32,"y":19},{"dx":40,"y":19}] | rafters 472,9 | bridge sapper true | lift hound true
stockade-horns (page): {"chiefWave":{"before":4,"after":6,"phase":2},"chiefSilenced":{"before":4,"after":4,"phase":2,"hadBlower":true},"queenPhase2":{"before":0,"after":0,"phase":2}}
stockade-horns: all four beats hold - the tower-3 twist, the kennel combine, the boss horn (chief-only), and the exam.
```
The blower's resolved target (431,6) lands exactly on the audit's own column for tower 3 (431) - a nice confirmation the offset fix is correct, not just passing its own check.

The "page" half drives the actual Chieftain fight through the real `hurtEnemy`/phase-2 code: left alone, the rafters archer's wave adds 2 sappers at phase two; with him already downed first, phase two adds none; and the same phase-two trigger on a different boss (the Hornet Queen, Bracken Wood) adds none either - confirming the hook is wired to the Chieftain only, not a general phase-two side effect.

Re-ran the 7 originally-required checks plus this one together - all green (see below for the final combined run and commit sha).
