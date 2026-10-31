# claude/rookery4 - ROOKERY 4: THE SHRIEK SISTERS, ONE HUNTER AT A TIME (opus boss rework, GREYBOX)
Branch `claude/rookery4` off master 416af6c2 (as the coordinator said; the brief named 204a22d4). Brief: scratch/brief-rookery4-1030.md (Daniel approved 10-30 17:33). The
priority file has no later Rookery / Shriek Sisters line that overrides the brief. NOT merged, NOT deployed.
**Art before live:** the sonnet ART lane comes next (see ART NEEDS), then the sonnet TUNE lane.
**The level is unchanged.** The level hash is untouched. The nests and steps are footing the FIGHT lays at runtime, into cells that are open air in the level, and it puts them back on clear.

## WHAT WAS BUILT (src/shriek-sisters.js, the pure part; src/shriek-sisters-hands.js; one ctx line in src/main.js; src/marks.js rows)

### A. THE TURN ENGINE
- **The Hunter.** `S.hunter` hunts for SS.turn.t 12 s, +/- 2 s, x0.75 per death. Her turn also ends once she has been OPENED and the opening is over. Order is diver > shrieker > snatcher, skipping the dead.
- **The hand-over.** It takes 0.8 s and is told: "THE <X> HUNTS", a screech, and her portrait pulses. The old Hunter flies to her roost; the new one drops off hers.
- **When a turn runs out.** The Hunter finishes what she is doing (`mayStart`): she starts nothing new, then hands over. Measured turns run 12-16 s, and 5-6 s when she was opened.
- **Who may start a move.** Only the Hunter (`isHunter` / `mayStart`), via `ready`, `tryGrab`, `trySnatch`, the boulder's shelf leg, the rake, the pair and the wave.
- **Roosting sisters.** Everyone else is `perched` on her roost. A roosting sister still in an opening or recovery finishes it.
- **The old overlap is gone.** The rookery3 rule ("two windups may overlap if their blows land 0.5 s apart") is removed. `teamClear` now means no other sister is winding up or striking, and no pebble is in the air. The gap and sep stay.
- **Proof counters.** `S.n.multi` counts frames where a non-Hunter attacks; `S.n.overlap` counts frames where a support move is busy while the Hunter attacks. Both are asserted 0 over a 150 s fight.

### B. THE SUPPORT MOVES
- **Rules:**
  - One roosting sister at a time, rotating, every SS.support.cd 6 s (x0.85 per death).
  - Only while the Hunter is between moves (hover / fly / perched / rise).
  - The Hunter never starts into one.
  - All are MEDIUM tells, 0.7 s, each with its own B16 windup and release pose.

| sister | support move | what it does | answer |
|---|---|---|---|
| Diver | PEBBLE KICK (`pebbleTell` !!) | A slow arcing stone at your spot (or at the mark). Its ring shows on the floor from the windup on. | Get off the ring. 8 dmg. |
| Shrieker | HER MARK (`markTell` !!) | A ring on your spot for 3.2 s. The Hunter's next blow goes to it: the Diver's dive is locked on it, the Snatcher's boulder targets it. | Move off it, or brace on it (G). |
| Snatcher | WING GUST (`gustTell` !) | Reuses src/gale-harpy.js: GALE push/brace and inCone, with drawGust drawing it. She swoops low, up to 170 px off her nest toward you, and beats along the floor. | A brace halves the shove. A blow in the tell BREAKS it: she is knocked down, open. |

### C. BONE NESTS ON CRACKED ARMS (the main new opening)
- **The nests.** There are three:
  - The Diver's low nest: arena cols 14-16, 4 rows up, foot at col 15.
  - The Snatcher's west nest: cols 0-2, 7 rows up, foot at col 2.
  - The Snatcher's east nest: cols 39-41, 7 rows up, foot at col 39.
  - The Snatcher takes the nearer nest that no hero stands on.
- **The arm foot.** Each arm's foot is a cracked tile on the summit floor with the shared gold ring (B10).
- **Baiting.** A Hunter's dive, or the Snatcher's boulder, landing on the foot SNAPS THE ARM:
  - The nest DROPS to 2 rows up and stays as a platform for the rest of the fight.
  - The sister roosting on it CRASHES DOWN STUNNED onto the summit floor beside it, so every hero can reach her. SS.nest = stun 4 s, x2, cap 0.08 (the brief's numbers), then the usual told ward.
  - The Hunter herself skids off the arm (land: low, whole).
  - Each arm breaks once. Afterwards the crashed sister roosts on the fallen nest, in reach.

### D. THE CRACKED OVERHANG -> STEPS
- The overhang is a cracked slab under the Shrieker's perch, with its gold-ringed foot at col 25.
- A dive or a boulder on the foot slides it down as THREE STEPS: cols 22-23 at 2 rows up, 24-25 at 4 rows, 26 at 6 rows, then the perch at 7 rows. Each step is 2 rows or less: base jump.

### E. UPDRAFT VENTS
- Two vents, at cols 12 (by the Diver's nest) and 30 (by the perch).
- They are PLUGGED until the Snatcher falls, then "THE UPDRAFT OPENS".
- A hero in the column is lifted at vy -170, like the level's thermals, to 8 rows up.

### F. RIDE THE GRAB
- **The carry.** The grab now carries you toward the nearest roost a sister sits on (`held.to`), all over the summit floor. SS.grab.hold went from 1.8 to 2.6 s for the carry.
- **Struck loose over that roost.** You land on it (`S.lastFree`; the hands place the hero). The sister there is CORNERED for 2.6 s, open, WHOLE: SS.roost.mul 1, cap 0.2.
- **Struck loose anywhere else.** It works as before: knocked down.
- **The general roost rule:**
  - Standing on any roost beside its perched sister corners her, once per 12 s each (`cornerCd`).
  - The rookery2 ferry still corners at x1.5 / cap 0.24.
  - Between corners, a roosting sister struck from her own roost takes it WHOLE ("ON HER PERCH", `takeBlow(..., close)`).
  - Anywhere else she is ON THE WING at 0.4x.
  - High roosts tip you off after 3.4 s as before.

### G. FRIENDLY FIRE (Q3: built, rec)
- **The trigger.** The Hunter's line has LOCKED on a mark (hers, or a sister's), and a hero is BRACED on it: block, or crouch on the ground.
- **The turn.** The mark is turned onto the nearest roosting sister, drawn as a green line: her dive goes to that sister.
- **The result.** On impact that sister crashes STUNNED to the floor (3 s, x2, cap 0.05) and the Hunter is KNOCKED DOWN.
- **Taught.** The first support mark says the line "BRACE ON THE MARK AS HER LINE LOCKS: SHE MEETS HER SISTER".

### HEIGHTS
- **Diver:** the ground; her moves are unchanged.
- **Shrieker:**
  - She hunts from the high perch tier.
  - Her SHOCK SHRIEK now goes off from up there; the cone comes down along the floor, and she is ON THE WING (was LOW).
  - Her MARK scream is followed by HER OWN DIVE at it. No sister strikes it for her any more; this stoop is the only time she comes low.
- **Snatcher:** the sides (boulders from the shelves, the side grab).

### H. DEATHS
- Turns shorten x0.75 per death.
- The old deaths table still applies, inside the turns:
  - Diver gone: the others dive.
  - Shrieker gone: pairs and two boulders.
  - Snatcher gone: the slabs regrow faster and the SHRIEK WAVE comes off her mark-dive landing. The vents also open.
- The LAST sister is the P2 survivor: the only Hunter, frantic, no roost and no supports. P2 is unchanged.

### I. TURN-ORDER PORTRAITS
- The bar's three bird icons:
  - The Hunter's is lit, with a gold countdown ring; it pulses through the hand-over.
  - A roosting sister's is dimmed.
  - A fallen sister's is crossed out, as before.
- The bestiary line was updated.

### THE BOT (ssPlan)
- Prefers an ARM FOOT whose nest has a sister on it whenever a diving Hunter hunts; falls back to the slabs and stones as before.
- Steps off pebble rings.
- Gust: cuts her in the tell, else braces, else gets out of reach.
- Rides the grab to the roost and strikes over it (25% strike early).
- Braces for friendly fire (shield heroes, 50%).
- Does NOT climb the steps or use the vents (see Q6).

## TELLS / POSES / RESIST (B10 / B15 / B16)
- New told moves pebbleTell / markTell / gustTell are in every src/marks.js table (BY_HAND, MARK, ANSWER, HEIGHT, TEMPO_CLASS = medium). tools/tells.mjs is green.
- New POSE entries: toRoost, pebbleTell/pebble, markTell, gustTell/gust. Each windup differs from its release.
- B15: tools/rookery.mjs takes a blow in every pose of every sister, and nothing lands under 0.4x.
- Openings, in order of size:
  - Nest crash x2 (cap 0.08).
  - Friendly fire x2 (cap 0.05).
  - Corner from the grab x1 (cap 0.2).
  - Ferry corner x1.5 (cap 0.24).
  - Slab stun, chain exhaustion, knock-down and spent: unchanged.
  - Every opening is followed by the told 2.5 s ward.

## CHECKS RUN
All checks ran as node, with no browser while the gate flag stood, except the one slip below.

| check | result |
|---|---|
| tools/rookery.mjs | GREEN. Old move tests adapted to one Hunter; about 50 new rookery4 asserts. |
| tools/tells.mjs | GREEN |
| boss-read.mjs | GREEN |
| anchor-lint.mjs | GREEN |
| answer-tags.mjs | GREEN |
| checkpoint-gaps.mjs | GREEN |
| level-quality rookery | Clears the bar. |
| mash-gate.mjs | 53 levels hold. |

- **What the new rookery.mjs asserts cover:**
  - single Hunter (0 frames) and support overlap (0 frames) over 150 s;
  - the order cycling, turn lengths, the turn ending on an opening, the old Hunter roosting;
  - pebble, mark (the next dive locks on it), gust (brace; a blow breaks it);
  - the nest crash (cap, onto the floor, the nest as a platform, arms once);
  - the overhang by dive and by boulder, the vents plugged then open;
  - ride the grab (land on the roost, corner whole), friendly fire, the deaths' turns, the last sister;
  - the hands' cells laid, moved and restored on clear, the vent lift, the portraits' countdown ring;
  - every nest/step cell being level air, steps of 2 rows or less;
  - B16 poses, every line in hint-lines.
- **A node draw smoke** (90 s fight; drawBack, drawBoss, drawOver and drawBars with a mock canvas, plus forced dropped-nest / steps / gust / pebble states): no throws.
- **!! SLIP:**
  - I ran `node tools/corpses.mjs` while GATE-RUNNING.flag stood. I took it for a node check; it is a CDP page test.
  - It ran for about 2 min, then I killed exactly that process tree: node 2876, its chrome children and its bash parents.
  - Free RAM afterwards was about 2.9 GB. No other process was touched. corpses.mjs has no result (this lane does not change reskins).

## SMOKE BOSS RUNS (after the gate)
(see the section at the end: filled in if the gate cleared in time)

## WHAT THE ART LANE NEEDS (sonnet; art before live)
- **The sisters.** NEW, BIGGER, DISTINCT MODELS for all three: the Diver heavy-winged and dark, the Shrieker tall and pale with a swelling throat, the Snatcher broad with long talons. Per-move poses use the existing POSE table plus the new placeholders (toRoost, pebbleTell/pebble, markTell, gustTell/gust).
- **The roosts:**
  - the bone nests, intact on their cracked arms and dropped on the arm's stump;
  - the arm feet (keep the shared gold ring);
  - the cracked overhang under the perch, and the three fallen steps;
  - the vents, plugged and open (updraft streaks).
- **Moves and marks:**
  - the pebble and its ring;
  - the support MARK (now a red ring + "MARK" text: keep it distinct from the scream's mark);
  - the gust (drawGust from gale-harpy already draws the cone);
  - the friendly-fire line, and the sister knocked off her roost. In greybox she simply appears on the floor: a fall arc is wanted.
- **Turn reads:** the portraits' faces and their countdown ring and pulse; the "HUNTS" hand-over read.
- **Checks:** ONEWAY cells are laid where the nests are, so check the level's own ONEWAY tile art does not show through badly under the nest drawing (it may draw as a ledge strip). Re-stamp tools/mark-integrity.mjs after the art.

## WHAT THE TUNE LANE NEEDS (sonnet)
- **Rates:**
  - `PORT=<free> node tools/boss-rates.mjs rookery --ways=practiced --profile=human --heroes=knight,warden,pyro --seeds=12`, campaign level, flasks kit. Target 60-70% with flasks; dry reported alongside (`--profile=human+dry`).
  - mash `tools/mash-bot.mjs rookery --arena-only`, 0/6.
  - Master's fight length was NOT measured (no browser during the gate): measure master first.
- **Levers, in order:**
  1. SS.hp (860/650/750)
  2. SS.turn.t
  3. SS.support.cd
  4. SS.nest.cap (0.08 is small for "the main opening": try 0.12-0.16 if the fight runs long)
  5. SS.roost.cap
  6. grab.hold
- **The bot.** It breaks nests only when a sister roosts on one and a diving Hunter hunts. It will not use the steps or the vents, so its rate under-reads those openings (report it separately, as the brief says).

## QUESTIONS FOR DANIEL (rec first; the rec is what is built)
1. **Turn length:** REC 12 s +/- 2, plus the wait for her to finish her move (reads 12-16 s). Alt: the brief's 13 +/- 2 (reads 14-18).
2. **Who the nest crash opens:** REC (built) only the ROOSTING sister on the nest crashes; the Hunter skids off the arm (one gold ring at a time). Alt: both open (a double payoff, 4x a fight).
3. **Friendly fire:** REC in (built): brace (block or crouch) on a mark as the line locks. Alt: out.
4. **Vents before the Snatcher dies:** REC no (built: plugged; the steps are the early way up).
5. **The Shrieker's shock shriek from high** (so "the stoop is the only time she comes low"): REC (built); she is now ON THE WING while she swells. Alt: keep her low for it (old: cut her as she swells).
6. **Bot climbing:** REC leave the bot off the steps and vents for now; the tune lane reports the bot rate separately. Alt: teach it (a lane of its own).
7. **Where the grab takes you:** REC (built) toward the nearest roost a sister SITS on (you land beside her). Alt: toward her own (empty) nest.
