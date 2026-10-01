# claude/fairfix3 - the Harvest Fair after Daniel's play: harder, the games required, two new rides, the Queen at full strength, its own music

Base: master d87b209a (batch52). Opus lane. Branch claude/fairfix3. Daniel's verdict on the live fair: "a lot better", but still EASY; the
bull's-eye rooms unclear; more rides wanted; the Queen 6-7/10. This lane builds all six of his picks, the reviewer's P1-P4 where cheap
(review-fair2), and the coordinator's music addition.

## What changed

### 1. Difficulty (reviewer P1 + the facing rule's teeth)
- **The games are REQUIRED now.**
  - **THE SPIKE YARD (569-594).** The road under the last round is a spiked pit 26 wide. The far end is a stall's back wall (595), from the pit
    floor up to the lane. The tall striker at 566 is the only way onto THE NIGHT LANE over it.
  - **A fall into the yard is never a softlock.** Spikes cover both ends; the middle (576-587) is bare floor, with a stair of crates back up to
    the lane. A fall near the start is climbed out of to the pad.
  - **The night lane's gallery (gallery 3) opens the way down.** Its three targets hang along the planks: (570,13), (578,13), (587,14). Struck
    inside 9 s, they drop **THE SHUTTER**: iron bars over the lane's end (595, rows 9-13), out of a jump's reach.
  - **The barker** has moved onto the canopy's roof (553). As you land on the lane, his call turns you round, putting your back to the lane's
    mummer (584, under a guttering lantern).
  - **The bull's-eye is taught earlier, in the corn maze.** Its bars now stand across tier one before chimney one (col 429, rows 24-27), and the
    target at 420 drops them: the way up. The tall striker's corn-top walk is the other way over the maze, so a game is needed either way.
  - **src/reachcore.js** counts a gallery's bars as dropped, as it already counted its planks. The new check proves the door cannot be reached
    without the striker at 566, or without gallery 3. The checks fill with every game played.
- **A real opener on screen one (3-20).** A spiked pit at 13-15. Past it, the coconut shy's stallholder is on his stall roof at 18-21 (three up),
  covering the gate's mummer at 33. The sign at 28 is read after the first ask.
- **The throwers keep the fair's rule.** The knife jugglers and the stallholder throw only at a TURNED BACK. While any hero looks at them
  (the mummers' own look: the night shortens it, the glass turns it, walls stop it), they only juggle; a look takes back a draw already in hand.
  - In main.js: `fairWatched`. In src/fair-keys.js: `WATCH`, `JUGGLER.rethrow`.
  - Two jugglers were ahead of the route, where a look held them. They now stand behind it:
    - the wheel's moves from the far bank to a roof at 292, behind you as you wait for a car;
    - the tower top's moves to a perch over the ticket yard (343), behind you on the climb.
- **The crows are cut** (468, 474). They dove whether you looked or not. The mummer at the foot of the maze's stair stays.
- **A tighter pincer.** The roof mummer is at 134, the road mummer at 140, and the juggler at 128 is behind both.
- **The boardwalk is cut to 82-94.** Its end is a drop onto the tent poles, so the poles and the pincer are on every road. The plank mummer at
  110 is cut with it. The barker's crate is at 157-163, over the stair, and reaches out over the terrace's lip so he can be fought (elites check).

### 2. Tickets
- **The back lot opens at 30 of the 35** (`need: 30`; `FK.gateNeed` reads a gate's own need).
  - It stands past the door's shrine now (hatch 602-603, room 597-608), because the spike yard took its road.
  - Its sign reads THE BACK LOT. SHOW 30 TICKETS.
- **The plate shows what is left where you stand.**
  - It shows TICKETS n/35, and under it "HERE: n LEFT" (`FK.ticketsLeft` / `FK.areaAt`, by the level's five sections).
  - For 4 s after a pickup, a gate's ask or a gate opening, it opens out to every area's count and "30 OPEN THE BACK LOT". The old second line
    that lay across the play field on every screen (src/redraw/fair_rides.js) is gone.
- **The loft's ticket gate opens a silver now** (review #14, "keys open more keys"). The crow's nest pays two tickets, which open the 5-ticket loft,
  where the fair's first silver lies (moved from the nest).

### 3. Two new rides, as real platforming (src/fair-rides.js, src/redraw/fair_newrides.js)
- **THE SWINGBOATS (stall row, 216-235).**
  - A Victorian boat swings on an A-frame over a spiked pit 13 wide, with its partner boat swinging the other way behind it (drawn only).
  - **THE HIGH STALL** past it (229-235, roof at row 22) is out of any jump from the road.
  - You step off the boarding stall roof (211-214, row 22) into the boat as it comes up to you, ride the arc, and **LET GO AT THE TOP** to land
    on the stall. Let go low and it is the spikes.
  - The pit's lips are bare boards (216-218, 226-228); the spikes are 219-225, so a fall is climbed out of on the near side.
  - It is required: the stall row goes on only from the high stall (a horse at its edge, then the collapsing stalls).
- **THE CHAIR-O-PLANE (harvest, 449-463).**
  - Twelve chairs on chains from a turning, striped crown on a mast (455), over a spiked pit.
  - The near chairs come TOWARD you (right to left, 57 px/s at the middle) at a low stall's height. The far ones go round behind the mast, up
    under the crown, where nobody can stand.
  - You cross AGAINST the ride, hopping chair to chair.
  - Each bank runs under an end of the ride, so a chair swinging round behind sets you down on the bank: a reset, not a death. A missed hop
    lands in the spikes (452-460; the lips are bare).
  - **Two mummers ride the opposite chairs** (0 and 6). Round the back they are out of reach and drawn as shapes on their chairs.
  - A ticket hangs over the mast's foot, a hop up off a chair.
  - It is required: the pit is the only way to the fire's bank.
- **Engine and fill.**
  - A jump off a swingboat keeps its pace (main.js already did this for swings).
  - A fair ride is matched where it stood before its frame's move, because a swingboat drops 4 px a frame, past the old 3 px of slack.
  - The fill (src/reachcore.js) treats the chair-o-plane's near run as one ride, as it treats a wheel's paddles.

### 4. Bull's-eye rooms
- **THE PRIZE FLOORS** (src/redraw/fair_newrides.js `drawNests`).
  - Shut, the floors a bull's-eye will raise show as a faint dashed outline of boards, with the prize stall's awning in outline and a pennant.
    You can see there is somewhere to go.
  - Open, each plank run is drawn as boards with a light top edge, a dark lip under it, nails and posts, and the nest gets its striped awning.

### 5. The Wicker Queen
- **The rules.**
  - The burn lasts 3.2 s, and 3.0 s in phase 3 (it was 2.8 / 2.4).
  - Chip outside it is 0.05 (it was 0.25).
  - No thrust STARTS within 24 px of hot embers (review #11).
  - tools/boss-openings.mjs:258 now asserts `>= 3`. I proved it fails on the old code: open 2.8 in the base worktree.
- **More fires.**
  - Up to 4 pits: the firebox, plus RING PITS that ride the boards with the carousel and burn out after 8 s.
  - She starts with 2. Her own attacks light more: where her burning floor goes out ("THE BOARDS SMOULDER"), and where her wicker ball stops.
  - The ball rolled over the banked firebox relights it.
  - A ring pit she burns on is spent ("THAT FIRE IS SPENT"); the firebox is banked as before.
  - The bot lures her to the hot pit nearest her.
- **Faster:** she creeps at 68 / 90 (it was 58 / 88).
- **Leaps** (phases 2-3 go to the pole and to horses).
  - With every back turned and the nearest hero 150+ px away, she crouches (LEAP TELL, !!) with the landing marked: a ring on the boards, or
    on the horse.
  - A look in the crouch holds her, because the leap is her feet; in the air it is committed.
  - She lands at your back (HER LANDING stamps), on the CENTRE POLE's collar, or on a HORSE (it carries her, and drops her where it goes
    round the back).
  - On a perch she cannot be lured onto a fire. She throws and sweeps from it, and leaps down only when every back is turned.
- **New attack: THE WICKER BALL (!!, low).** Told for 0.9 s ("THE WICKER BALL: JUMP IT"), then bowled along the ring at the nearest hero.
  Jump it, or be on a horse.
- **New attack: THE RIBBON SWEEP (!!, low or high; phases 2-3).** Told for 1.2 s by the ribbons pulling taut from the crown to both walls at the
  height they will fly. Then the ribbon's end whips wall to wall and back: two passes. Low: jump each pass; high: duck.
- **Every cycle changes.** After each burn her next blows are reseeded in a new order (`WQ_CYCLES`), and her leaps take turns: floor, pole,
  horse.
- **The low thrust's red line** is 2 px, brighter, with sparks along the boards (review #15).
- **Marks.** src/marks.js has the four new tells; `node tools/tells.mjs --write` was run.
- **Bestiary.** Her card mentions the ball, the sweep and the leap.
- **Tuning.** With burnMul 1.35 the human bot won in 46-56 s, so a burn is worth 0.9 a blow now.

### 6. Reviewer P2-P4
- **The reskins wear their own names** in the threat read and the death line: KNIFE JUGGLER, STALLHOLDER (`beastName`). They have bestiary cards:
  THE KNIFE JUGGLER and THE STALLHOLDER, seen when you meet them.
- **The bunting rope** frays and SNAPS over the pit, 0.6 s after you take it ("THE ROPE FRAYS: JUMP OFF BEFORE IT GOES"). It also runs slower:
  130 px/s, from 210.
- **The loft holds a silver.** See 2.
- **The low-thrust line.** See 5.
- **Stale comments.**
  - The fair's header was rewritten for the current layout. "MARIONETTE" is now string-jack, the ghost train is the effigy's fire, and the
    prize booth is gone.
  - The ticket comment, and the takings cellar (it was called "the back lot").
  - fair-games.js's ticket line and its dead booth text.

### 7. The fair's own music (coordinator's addition)
- **audio/harvestfair.ogg** is "Dark Carnival" by Machine, CC-BY 3.0 (https://opengameart.org/content/dark-carnival).
  - A 66.80 s loop: samples 0-2945132 at 44.1 kHz. The end is where the tune comes round to its own opening (pitch-class match 0.90 over 6 s;
    waveform 0.58 at the seam).
  - +3 dB to about -13.4 LUFS.
- **audio/wickerqueen.ogg** is "Ring Master" (the slower version) by Bobjt, CC0, credited "bobjt" as the author asks
  (https://opengameart.org/content/ring-master).
  - An 81.06 s loop: samples 0-3574557, pitch-class 0.93, waveform 0.55.
  - Turned down about 10 dB (the source decodes past full scale) to about -13.8 LUFS.
- **Encoding and seams.** Both were encoded with the local ffmpeg (libvorbis q5) with no fades. The engine's 30 ms equal-power seam covers the
  splice. I downloaded nothing; the coordinator supplied the files.
- **Wiring.** `TRACKS`, `MUSIC_CREDITS` ('"Dark Carnival" — Machine, CC-BY' / '"Ring Master" — Bobjt') and full entries in audio/CREDITS.txt.
  - CREDITS.txt has the licence, the URL and the changes made.
  - Its header now says CC0 or CC-BY with credit.
- **Removed.** The synth band organ, its scheduler branch and its tempo hook are removed cleanly; nothing else used them. The music box that
  winds down over the level still plays over the fair's track.
- **The rule changes.**
  - docs/LEVEL-DESIGN-GUIDE.md section 6 now reads "CC0, or CC-BY WITH its credit", and keeps the "own track" rule: no other level plays it,
    and it is not a stock stand-in (level-quality's SHARED_MUSIC / STOCK_MUSIC are unchanged).
  - tools/audio-assets.mjs no longer lists them as synth-only.
- **The tempo hook is dropped.** The ring speed used to set the organ's tempo. On a file track that could only be playbackRate, which also pitches
  it up, a fourth at the ride's full speed.
- **The Sound Test credit is shortened.** textfit truncated the asked-for "(CC-BY 3.0)" on the Sound Test's one-row credit. The row reads
  "Machine, CC-BY"; the full licence is in CREDITS.txt.

## Numbers, before and after

### The level-1 no-ability pilot (`node tools/fair-pilot.mjs knight 12 <seed>`; I added the seed and the "dips" count to the tool)
| run | done | health lost | deaths | dips under 40% | time | by section |
|---|---|---|---|---|---|---|
| BEFORE seed 1 (d87b209a) | yes | 152 | 0 | 0 | 290 s | gate 11, stalls 14, midway 24, harvest 24, last round 79 |
| BEFORE seed 2 | yes | 267 | 1 | 1 | 339 s | gate 11, stalls 14, midway 139, harvest 24, last round 79 |
| AFTER seed 1 | yes | 325 | 1 | 2 | 378 s | stalls 28, midway 35, harvest 144, last round 118 |
| AFTER seed 2 | yes | 325 | 1 | 2 | 378 s | (the same run: on the new layout the seed changed nothing the pilot met) |

- The target is met on both seeds: 2 dips and a death. Before, seed 1 met neither.
- **Who did it, after:** mummers 110, horses 96, the jugglers 94 (30 before), the barker 14, the ground 11.
- **The one death** was in the chair-o-plane's spike bed (a missed hop). The pilot went again and crossed.
- It is all design: no foe has a point more health.
- **The pilot plays the new stretches with a player's hands**: the swingboat (step off as it comes, let go at the top), the chair-o-plane (hop
  when the next chair closes; a fall is climbed out of and tried again), the corn's bull's-eye, the striker, the lane's targets and the shutter.

### The generic level-1 pilot (`node tools/level1-pilot.mjs fair --write`; 3 runs summed; it is lifted where it cannot ride)
- Before: 42 hits, 1 death.
- After: 50 hits, 0 deaths, walked 100%, 77 lifts.
- docs/level1-pilot.json is re-stamped.

### The Wicker Queen, human bot (`node tools/wicker-queen-pilot.mjs 1`: knight, warden, pyro; one salt)
| run | wins | knight | warden | pyro | median win |
|---|---|---|---|---|---|
| BEFORE | 2/3 (67%) | win 94.8 s | win 112.1 s | death 88.4 s | 112 s |
| AFTER, burnMul 1.35 | 2/3 | win 46.2 s | win 56.5 s | death 40.2 s | 56 s (too short) |
| AFTER, burnMul 0.9 | 1/3 | death | win 70 s | death | (the bot did not duck the high sweep) |
| AFTER (final: 0.9, and the bot ducks the high sweep) | **2/3 (67%)** | win 83.5 s | win 77.4 s | death 134.3 s (her at 6%) | **83.5 s** |

- The final run is inside the 60-75% band.
- Her moves in the fights: burns 7/7/8. Each fight shows the ball, the sweep, the leaps, the crowning, the floor, the thrusts and the lashes.

### level-quality, the fair
- route 667 tiles; flat 0%
- 5 bands, 42% second height
- 12 gadget kinds, 5 developed (the swing and the chairs are counted)
- 5 checkpoints, one per 133 tiles
- 1.20 encounters a screen (32)
- 4 roles: melee 25, ranged 5, runner 6, support 2
- 4 secrets
- 3 unlocks declared (tickets, targets, strikers, with what they open now)
- pilot re-stamped

## Checks
Run with `npm run check -- harvest-fair,wicker-queen,level-quality,boss-openings,boss-fight-end,architecture,checkpoints,checkpoint-gaps,skins,dangling-paths,slopes-trace,npc-removal,hint-shown,audio-assets,tells,chase,elites,one-new-foe,textfit,signs,collectables,keys,traps,boss-music,soundtest,deadends,homepaths`:
**all green** (27 named, plus syntax; tower-chase and burial3-keys ran alongside and passed): harvest-fair, wicker-queen, level-quality (every gated level clears the bar, the fair's pilot row fresh), boss-openings, boss-fight-end, architecture, checkpoints, checkpoint-gaps, skins, dangling-paths, slopes-trace, npc-removal, hint-shown, audio-assets, tells, chase, elites, one-new-foe, textfit, signs, collectables, keys, traps, boss-music, soundtest, deadends, homepaths.
chase failed once under load in an earlier batch ("page never came up") and passed on its own and in this one.

- **New assertions** (each proved against the old code where it applies):
  - tools/harvest-fair.mjs:
    - the opener's pit and stallholder
    - the door unreachable without the striker at 566, or without gallery 3
    - the corn's bars open the way up
    - the swingboat's top is a hop from the high stall, and the stall is unreachable without it
    - the chair-o-plane's chairs come against you, with two riders
    - tickets left per area add up
    - the bunting rope snaps over the pit
    - the back lot opens at 30, not 29
    - the loft's silver
    - in the page: the juggler and the stallholder throw nothing while looked at and do throw at a turned back; they wear their own names; the
      rope snaps
  - tools/wicker-queen.mjs:
    - burn >= 3 s and chip <= 0.05
    - a ring pit is a fire and is spent
    - every cycle reseeds
    - no thrust at the fire's edge
    - the ball, the sweep (two passes, wall to wall, phases 2-3 only) and the leap are told
    - a look holds the crouch
    - the pole perch holds under a look and is left at a turned back
    - nothing catches up on a perch
  - tools/boss-openings.mjs: `>= 3`. It failed on the old code (open 2.8).
- **Tests updated to the new layout, not weakened:**
  - the foe count is 20 mummers and no crows
  - the boardwalk test asserts the walk ends over the poles
  - the blind stall is at 607-608
  - gallery 3 holds bars instead of planks
  - the silver is in the loft
  - the back lot's price is 30
  - 8 haystack tiles (ricks 402-405 and 556-559)
  - the maze's look test now passes because bars are see-through (src/fair-games.js `blocked`), not because the test moved
- slopes-trace is unchanged for every level, the fair included: no rebase was needed.

## UNVERIFIED
- **No hands-on play.** Everything was by bot and in the page.
  - The chair-o-plane is the one I most want Daniel's hands on: the bot died once in its spike bed.
  - The swingboat's "let go at the top" timing is about 0.3 s wide at the top of the swing.
- **The two pilot seeds gave the identical run after the change** (they differed before). The new route's randomness did not touch anything the
  pilot met, so in effect this is one run, not two.
- **The Queen's fights now run 77-84 s for the bot's wins**, under the 90-150 s house band. One salt only, per the cost rules.
- **No by-ear pass on the two music loops.**
  - The seams were found by pitch-class and waveform match and sit under the engine's crossfade.
  - The Dark Carnival loop starts on its quieter intro, about 4 dB under the bar that loops into it.
- **Not checked:** frame cost, and co-op on the new rides (a chair or a boat carries any hero; nothing was tested with two).
- **Pictures** of the new set pieces: `node tools/fair-shots.mjs fairfix3 19-,20-,21-,22-,22z,23-,24-,25-`. I looked at them; none are
  committed.
- **A process note:** the session scratchpad is shared between lanes. Another lane's patch file (t1.mjs) was run once against my worktree. It
  matched nothing and exited before writing. I moved my patch files into their own folder.

## QUESTIONS FOR DANIEL (each with my recommendation; the recommendation is what is built)
1. **The chair-o-plane can kill a level-1 hero** who misses a hop into its spike bed (the pilot died there once).
   - Rec: keep it as the fair's hardest ride. A chair swinging round sets you down on the bank, and the spike bed has bare lips.
   - If it is too much in your hands: narrow the spikes to 454-458 (one line in src/harvest-fair.js).
2. **The Queen's wins run 77-84 s** (house band 90-150 s); the bot wins 2/3.
   - Rec: keep a burn at 0.9 a blow. If you want the longer fight, set burnMul to 0.75.
3. **The tempo hook is dropped** for the file track.
   - Rec: keep it dropped. A playbackRate tempo also raises the pitch. A real band organ does speed up and sharpen, so a gentle +4% at
     phase 3 is possible if you want it.
4. **The Sound Test row is shortened** to '"Dark Carnival" — Machine, CC-BY' (the full "CC-BY 3.0" did not fit; it is in CREDITS.txt).
   - Rec: fine as is.
5. **The throwers are harmless while you watch them** (they juggle).
   - Rec: keep. It makes every foe in the fair speak the rule, as the reviewer's upgrade A asked. The cost is that the ranged threat lives only at
     your back.
6. **The back lot at 30 of 35.**
   - Rec: keep, as the reviewer's pick (a).
   - The per-area counts on the plate tell you where the missing five are. The count still resets when you leave the level.

## Commits (claude/fairfix3)
- 16c636a1 fairfix3: the fair harder and fuller - games required, two new rides, the Queen at full strength, its own music
- 94b1aecc fairfix3: ride pits that cost but do not execute, the Queen's burn worth 0.9, the bot ducks her high sweep, the pilots
- (this report)
