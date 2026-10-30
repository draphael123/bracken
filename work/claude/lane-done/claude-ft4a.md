# claude/ft4a - FALLING TOWER 4, LANE A: THE ASCENT + THE ROOMS COME DOWN + THROW IT BACK ON THE CLIMB (Opus, PORT 6593)

Base: master 16126ba1 (BATCH128). Brief: scratch/brief-fallingtower4-1029.md, approved 10-29 16:00 with all 4 recs. Branch claude/ft4a (worktree bracken-lanes/bracken-ft4a), pushed. NOT merged, NOT deployed.
Head: see the RELAY line (report commit follows 7681994d)

## What was built

### 1. THE ASCENT - the cut is gone (brief #1 A) - src/archmage-chase.js (ASC, ascentStep, ascentLeg, drawAscent), main.js chaseToAscent/chaseToHall
- **The core is not dead air any more.** The last floor pours you in and he is IN the core, hanging over the rug (coreHang) - not teleported to his hall.
  **The rug flies up to catch you** as you fall (it was a walk to it, then an instant snap). The crouch lessons' hint box is off in the chase, the core
  and the ascent (main.js hintSay: 'mechanic' tier).
- **You board where the rug is** (carpet.js: no sanctum door for the chase) and **the carpet rides back UP the holes you fell through**, one camera:
  - **well** (~12 s): an upward auto-scroller up the core and the four broken rooms (their cleared floors, fallen columns, pillar stumps). The box you fly in
    is the well, 13 rows tall, its bottom rising 110 px/s - it carries you, never kills. He flies at its top casting only **fire, ice, fire, hand** with a 0.5 s breath between spells
    (his fight's tells and numbers). Strike one back and he is knocked down the well toward you, open. **Stone off the failing walls on told columns**
    (a red mark at the box top + grit 1.1 s, then the block, every 1.8 s; 12, knocks the carpet). The ascent takes him no lower than **60%** of the bar (the rooms stop at **65%**: see the rates).
  - **plug** (1 s): the stair's floor over the well cracks round, told ("THE STAIR'S FLOOR CRACKS OVER YOU"), then his bolt blasts it (runtime clear).
  - **spiral** (~5 s): up his spiral stair's well past the flights you climbed; he flees ahead, casting nothing.
  - **sky** (~2.5 s): the spiral tower's roof breaks open (runtime clear, rows 50-69) and you come out into the night; **the camera widens** over 0.8 s
    from the well's 26 tiles to the hall's 64 (camLock tween, no snap), and **his sky and moon fade up round you** (0.7 s). He settles to his hover spot
    and **his first hall spell comes 1 s after** - no 'wake' freeze.
- **His hall moved over the spiral tower**: hallArena x 4-68 -> **44-108** (tower-ascent.js HALL.x0/x1; walls 43/109; sanctum.spawn shifted). Realms are
  relative to the hall's box (realmBox), so they moved with it.
- Death anywhere = the stair top, as before. A retry puts the plug, the crown, the rug, the rooms and the arena back (main.js reset).
- The spiral stair's rising dark does not run under a carpet (main.js updateChase), the hall's fire and paint are off in the well.

### 2. THE CHASE ROOMS COLLAPSE AROUND YOU (brief #3) - src/archmage-chase.js FALL4 / chaseRoomStep, main.js chase3RoomCtx / chase3Vault
- **His misses shake the tower**: a firebolt or ice lance that hits stone **stops on it** (his shots break on stone, as on his stair; orbs burst) and knocks
  masonry loose over where it struck - FT2's debris module (told shadow 1.1 s, 12), max 2 at a time, 1.2 s apart; a miss within 90 px of you shakes the stone over YOU (told - step off it). **Stone that falls on HIM drops him**
  ('crushed', an opening like his struck-back spell).
- **3 stages**: cracks run up the walls from the first moment (stage 1); from 5 s the **ledges go one at a time**, each told 1.5 s (red crack, grit,
  creak, "A LEDGE GIVES"), never the one you stand on when it is picked, 4 s apart; then his floor or its pillar (stage 3, FT3).
- **THE VAULT PILLAR** (every room, floor to vault): strike it while he hovers over its crush box (the ghost shows it on the floor) and **the vault
  comes down on him: he FALLS** ('crushed' joins OPENINGS). One use a room. Signed at the point of use in all four rooms.
- **Cover**: its column lies across the floor (3 x 2 stone) in a zone beside its foot, **never round the hero** (first place in the zone clear of you);
  his shots break on it; his mark and storm ignore it. It goes with the floor and comes back on a retry.
- **Wasted openings fixed**: (a) the rooms' floor is read off the bar (maxHp, not hp0) and **at it HE HOLDS ON** - said ("HE HOLDS ON - AFTER HIM") and
  his 'down' cut to 0.35 s, so no gold window does nothing; (b) room 1's 0 damage was the bot standing walled in / not moving - fixed with the cover rule
  and the bot's held hop; (c) the core's hint box is off.
- **FT3's chase lines were never on screen** (said through number() with no route, the filter dropped them): now routed (hint-lines.js FT4_SAY).
- **Sink clip** (FT3 art Q2/Q3): his body is clipped at the room's floor while he sinks (main.js sprite draw).

### 3. THROW IT BACK ON THE CLIMB (brief #5) - src/spiral-chase.js, shared helper in src/undead-mage.js
- **One rule, shared**: undead-mage.js blowMeets / sendHome / homeStep - the fight's strike-back (its reflect block now calls them, no behaviour change)
  and the stair's. Any blow box meeting a returnable shot (gold orbit: fire, ice) strikes it home; works for every hero (their own attackBox).
- **Home, HE REELS: 5 s** (a **perfect parry** - a guard raised on the beat, main.js parried() - sends it home too and pays **7 s**). **No damage.** Knocked
  off his perch 2 rows, gold ring + countdown arc + smoke, casting nothing; callout HE REELS: CLIMB; the rising dark's **next surge is held** (chase.js
  st.noSurge). **One stun a flight**; after it his **told ward 3.5 s** (a return rings off) and he **answers** with his mark, or a PAIR (fire + two lances)
  where the flight has no mark (new tell pairTell, marks '!', guard).
- Taught: a sign on the stair's floor (flight 1, safe): STRIKE HIS FIRE BACK AND HE REELS.
- Bot: lab.js chaseClimb has the fight's strike-back hand (two in three, once a shot).
- The stair mage is gone once you are through his ring (a stun on the last flight left him reeling on the stair).
- Also: his rooms' shots born in the vault's stone (his staff high under the ceiling) are not stopped by it - found while measuring: otherwise every shot
  from his top station died at birth and the rooms hit no one. He never lies inside a fallen column (he lands beside it).

## Boss rates (L39 campaign level, practiced, tools/boss-rates.mjs, profile human, flasks kit, PORT 6593, jobs 1)
| run | knight | warden | pyro | all |
|---|---|---|---|---|
| FINAL, with flasks, seeds 1-12 | 5/12 | 9/12 | 10/12 | 67% |
| FINAL, with flasks, seeds 13-24 | 4/12 | 10/12 | 12/12 | 72% |
| **FINAL combined, n=24 per hero** | **9/24** | **19/24** | **22/24** | **69% IN BAND** |
| human+dry n=6 (report only) | 0/6 | 2/6 | 1/6 | 17% (FT3: 28%) |
| base master 16126ba1, measured today, same setup | 6/12 | 10/12 | 9/12 | 69% |
- **Fight length:** mean win **166 s** (FT3 156 s). Typical: rooms ~70 s, the ascent ~25 s, his hall the rest.
- **Tuning path (n=12 each, with flasks):** floors 0.55/0.50 78% (5/11/12) -> +breath 78% -> 0.62 72% -> 0.65 72% -> 0.60/0.55 75% -> downT 2.2 78% (reverted)
  -> near-miss stone + ascent stone every 1.8 s + floors **0.65 / 0.60** + breath 0.5 s = **67%, then 72% on fresh seeds = 69% at n=24**.
- **Why the floors went UP (0.55 -> 0.65):** the rooms got a second opening (the vault) and less waiting, so the strong heroes (warden, pyro) reach his hall
  nearly untouched; more of his health now lives in the hall. The knight is the weak hero, as in FT3 (base 6/12; here 9/24): he loses most in the
  ascent's carpet fighting. Rec for ft4tune: a knight-only carpet bot look (hall + ascent), not a boss number.
- Bot hands (src/lab.js): the chase bot uses the vault pillar, hops a fallen column (held jump), steps off told stone; the stair bot strikes shots back.
- **Mash:** level and boss re-stamped (docs/mash-bot.json; the hash changed with the hall box); mash-gate green, boss mash holds (mini report-only as before).

## Checks
- **Node, green:** tower-chase (node part, extended), tower-hall (updated), archmage-room, undead-moves, fallingtower2, tower-cutouts, solid-islands, signs,
  checkpoints, checkpoint-gaps, checkpoint-stand, deadends, killzones, spawns, comments, tells (+ magechase pairTell), answer-tags, floating-geometry,
  floaters, level-quality, boss-read, curve-gate, curve-shape, mash-gate, collectables, elites, one-new-foe, map-spacing, dangling-paths, architecture,
  stuck --static.
- **Page, green (one at a time):** tower-chase FULL (every hero returns >= 1 stair shot - 1-4 each, 0-3 stuns; the lab's fight goes chase -> ascent -> hall
  with a max camera move of 4.5 px a frame (FT3's cut: 2,923 px), no 'wake' in the hall, the hall over the spiral), tower-ascent (updated), undead-realms
  (updated), boss-openings, rule-openings, stuck (runtime, 350 spots), whatsnew, hint-shown, tower-collapse, reach-heroes, mash-bot level + boss.
- **pixels (tools/headless.mjs floats): HUNG twice** (no output; killed my own PID 20288 after 17 min, then a 1000 s timeout) - the known harness hang
  (batch128 release: "pixels hung ~27 min in the gate ... alone 2 min"); gate129 was running beside it. Not a finding: re-run in the integ gate.
- **Not run:** the full suite, textfit, mobile-perf (art lane), level-walk.
- Process note: while my runner sat on the hung pixels I ran 3 short page checks beside it - two headless browsers from this lane for ~15 min (RAM > 3.9 GB free).
- tower-chase's "every hero returns >= 1" is thin for pyro/paladin/reaper (1 each in the last run): if it flakes, rec raise the stair bot's try rate, not drop the assert.

## Tests changed (deliberate design changes)
- tower-chase: extended (node: THROW-BACK, ROOMS COLLAPSE, THE ASCENT; page: returns per hero, ascent continuity); the hpFloor source check reads chase3FloorHp
  (the bar) and allows 0.3-0.7 (rooms tuned to 0.65); `TOWER_CHASE_NODE=1` runs the node part only (for use beside a gate).
- tower-hall: "he is put 36 tiles in, in a wake" -> "the ascent carries him up and he settles (no wake); the hall stands over the spiral tower".
- tower-ascent, undead-realms: after BK.board() (the core now) they wait out THE ASCENT before the hall checks.

## HOOKS LEFT FOR LANES B AND C
- **B (level / collapse front):** src/chase.js `st.noSurge` holds a chaser's next surge (generic; the stair stun sets it through main.js chaseMage `reel`).
  FT2 told debris can be dropped anywhere by pushing into `L.ft2.rt.debris` (main.js chase3RoomCtx.debris shows how). tower-supports.js `fall()` calls
  `c.vault(s)` after a pillar falls (a generic post-fall hook for the pillar choices). The hall moved: tower-ascent.js `HALL = { y0 22, floor 38, x0 44,
  x1 108 }`; the spiral roof (rows 50-69) and the stair floor (rows 147-151) are cleared at runtime in the fight (archmage-chase.js `ascentClear()`, put back
  by main.js reset). **Level hash changed** (hall box): B re-stamps mash/pilot after its own changes. Lines said through variables go in hint-lines.js `FT4_SAY`.
- **C (realms):** realms are relative to the hall box (realmBox centre 76 tiles now). main.js `chaseToHall()` (end of the ascent) sets `e.realmAt` as before
  and starts him in 'hover' after `ASC.firstCast` s (no wake). Keep realm boxes relative to `A`.
- **Not built** (rec: lane B or a follow-up): the pour rooms' glowing slab ride (brief #3.5); per-room ledge shapes (#3.7, a hash change).

## ART TODO (sonnet art lane - all greybox)
- THE VAULT PILLAR (12-row column; now paintPillar 'crush' stretched); the vault's masonry onto him; the fallen COLUMN as cover (now plain stone tiles: a
  toppled fluted column with its capital); rubble across the crush box.
- The room failing: wall cracks (1-px lines), a ledge's tell (red dashes) and its fall (tiles vanish + grit -> a crumble).
- THE ASCENT: the told stone column (red overlay) and its block; the stair floor's crack ring; the spiral roof breaking open (rows 50-69 become plain air:
  needs a broken-top silhouette and rubble rim); speed streaks on the rug; the rug flying up to catch you; the sky cross-fade (0.7 s) - judge in page.
- The stair REEL: gold ring + countdown arc + smoke; his ward shell after; a 'reel' pose (recoil frame now).
- **Frames** (scratch/lane-reports/): BEFORE ft4a-before-core.png, ft4a-before-hall.png (the FT3 cut), ft4a-before-room0.png; AFTER (pyro bot run, L1 hero):
  ft4a-room0-debris, ft4a-crushed, ft4a-vault-down, ft4a-room-ledge (a collapsing room), ft4a-core-away, ft4a-asc-well, ft4a-asc-well2, ft4a-asc-plug,
  ft4a-asc-spiral, ft4a-asc-sky, ft4a-hall-in, ft4a-hall (the transition, one camera).

## QUESTIONS FOR DANIEL (rec first; each built as the rec)
1. **His health split:** rooms now stop at **65%**, the ascent at **60%** (rooms were 55%) - the vault made the rooms quicker and safer for strong heroes.
   Rec: keep (69% at n=24). Alt: back to 55% and make the hall harder (other numbers, another lane).
2. **The ascent's length:** ~25 s (well ~12 s, plug 1 s, spiral ~5 s, sky ~2.5 s), 0.5 s breath between his well spells. Rec: keep.
3. **A near miss drops stone over YOU** (within 90 px; told 1.1 s), far misses where they struck. Rec: keep - it makes "his misses near you" a real threat.
4. **The stair stun's answer:** his mark, or fire + two lances together where the flight has no mark. Rec: keep.
5. **What's new:** entry added to docs/updates.json as batch **130** (placeholder - integ renumbers).
6. **Knight weak (9/24):** rec a knight-only carpet bot look in ft4tune, not a boss number.
