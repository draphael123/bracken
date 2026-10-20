# claude/aicompanions - AI COMPANIONS, THE OPUS CORE (brief-aicompanions.md '!! 10-14 LATE' + brief-coopprogress.md 10-19: the PARTY BOARD's AI PARTNER seat)

Branch `claude/aicompanions` off claude/batch109 8ce6ebc7. Port 8799. One headless Chrome at a time (online-coop's own two pages excepted).

## WHAT'S BUILT

**src/ai-companion.js (new, pure)** - what a companion is and the numbers it plays by:
- TWO KINDS: LINKED (a hero from another of this browser's saves: its level, talents, skills, gear; earns XP + levels into THAT save only) and DEFAULT (any unlocked hero at your level, nothing saved).
- FOUR BEHAVIOURS (BALANCED default, AGGRESSIVE, DEFENSIVE, SUPPORT): engage reach, stray from you, where it walks behind your shoulder, when it drinks, when it stops swinging and only defends, SUPPORT only fights what is on you and lifts P1 first.
- LIGHTER SCALING: `coopMulOf` - a human partner keeps the old x2 (enemy hp and blows on heroes, any seat count); a party of you + AIs is 1 + 0.5 per AI, capped at x2 (one AI = x1.5).
- WHO IT FOLLOWS / LIFTS: P1 while he stands, else the nearest standing person, never another AI; revive priority (a downed human first; SUPPORT = P1 first; a downed AI partner unless AGGRESSIVE).
- THE TOLD CATCH-UP: on top of the party leash (off picture / stretched), an AI is pulled when FAR (260 px / 150 px down), STUCK (no progress 2.5 s while 72+ px away), WAITING (it fell into a hazard: it stands and waits instead of jumping again), or ALONE ON A RAFT. The pull is the leash's own told rope + CATCH UP + puff ('ALLY CATCHES UP').
- The words: seat line `AI PARTNER - PYRO LV 6, SUPPORT: EARNS XP INTO SAVE 3` / `AI PARTNER - KNIGHT, BALANCED: YOUR LEVEL - NOTHING SAVED`; picker lines; win card cell (SAVE n / AI).

**src/main.js**
- `allyTick` rewritten as the companion's hands (inside its own pass): revive first; wait after a fall; flask by behaviour; foe pick within engage/stray; fights with `lab.js labDuelFrame` (the elite lab's human-gated hands: duck under high blows, low guard, shield/deflect on the beat, roll out of red tells) + `walk-duel.js makeEliteRead`; never steals P1's last hit on an open boss; never onto spikes / fire / harm pools / a raft nobody is on; follows with its OWN playtest walker per AI.
- `seatAdd`: AI partners up to the co-op cap (old 'one computer partner' rule removed); linked AI keeps its profile (xpOnly); AIs carry their own flasks (its save's max; respawn restores).
- AI down-clock running out while a person stands = it gets back up beside you at 1/3 hp (a death on its tally), never a party wipe. All humans down + AI up = it lifts them.
- `PARTY.leaderOf` (src/party.js): an AI never leads while a person stands (the leash never pulls a person to a bot).
- `coopMul()` replaces the seven `(coop() ? 2 : 1)` reads (enemy hp at spawn, apprentice spawns, damagePlayer, breath drain, ward price, takeScale, the other damage line).
- `partyAi(slot, hero, beh)`: LINKED = lock claim kind 'companion' (save picker + other seats refuse it, told; P1's own save refused), `CS.seatFromSlot` + `profMake(..., { xpOnly: true })`; DEFAULT = no profile. Walks in through the tavern door.
- `allyPurse`: a linked companion's coin pickups move to P1's purse each frame (its own purse untouched); `profCredit` already passes xpOnly, so its silver/clears are never written to its save.
- Win card: linked AI row shows SAVE n + its XP, '-' silver/clear; default shows AI.
- `hazardSay` stamps `P.hazT` (the AI's fall flag). BK hooks: `BK.aiComp` (join, seats, mul, arm, board).

**src/party-board.js** - AI PARTNER is live: LINKED: <save lines> / DEFAULT -> hero -> HOW IT PLAYS (four behaviours, BALANCED first); AI seat rows show the seat line + DISMISS.

**tools**: NEW `tools/ai-companion.mjs` (registered in tools/check.mjs; sections pure, board, save, follow, raft, fight; opt-in `--rates[=N]`). `tools/tavern.mjs` board assertion now expects AI PARTNER live (stated design change). `tools/textfit.mjs` party scope adds win card + seat plates with AI seats (x2, x4). `tools/mobile-perf.mjs` gains `MP_AI=<hero>` (an AI seat in every level scene).

## CHECKS (all on this branch, PORT 8799)
- ai-companion (pure, board, save, follow, raft, fight): GREEN.
  - follow, LUMBER TRAIL start -> boss door (P1 = playtest walker + lifts, foes alive): balanced warden near (<=10 tiles) 95% of the walk, longest apart 2 s, 8 catch-ups, ended 1.7 tiles away; support knight 91%, 1 s, 11 catch-ups, 1.5 tiles. 0 AI downs.
  - raft (MARSH, marsh-grove): AI rode along with P1 (0.4 tiles at the far dock), raft never moved without a person; an AI put alone on the docked raft is flagged 'raft' and taken off, raft stays docked, P1 boards and rides.
  - fight (OLD TUSKER): AI (aggressive warden) starting outside the clearing comes in, 653 damage in 40 s while P1 only guards, 100% inside, never left down; P1 downed -> AI lifts him in 1.5 s.
  - board/save: linked PYRO LV 6 from save 3 seated via the real board DOM; save 3 locked ('companion'), second seat on it refused; default AI KNIGHT as P3 (two AIs = x2); XP credited to save 3 only (+120), its coins/clears untouched, the 25 silver it picked up went to P1's purse, P1's save took none of its XP, repeat credit pays nothing, DISMISS frees save 3.
- tavern (all sections): GREEN. tavern-menu: GREEN. coop-progress: GREEN. online-coop: GREEN. hint-shown: GREEN. save-safety: GREEN. comments, dangling-paths: GREEN.
- textfit party --strict: 0 on every counter (10 screens incl. the new AI ones).
- mobile-perf spot with an AI seat (MP_AI=warden, 4x CPU, 915x412): wood 59.4 / 54.8 / 60.4 fps, marsh 58.3 / 36.9 / 56.0 fps over three runs (the 36.9 run coincided with other lanes' load; baseline no-AI run in between: wood 40.6, marsh 57.8). Unthrottled sim cost of an AI: +0.05..0.18 ms/frame. >= ~45 fps in 5 of 6 samples.

## RATES - OLD TUSKER, knight, boss lab profile 'human', campaign level 3, healthMode normal, 6 seeds (rough read)
- SOLO: 6/6 (84, 74, 91, 91, 92, 84 s).
- KNIGHT + AI WARDEN (balanced, x1.5 scaling): 5/6, faster (88, 67, 50, 65, 76 s; one loss = a party wipe). AI dealt 490-999 dmg per fight.
- Read: the AI speeds the fight up but does not carry it (x1.5 boss hp + x1.5 blows; one wipe). Solo 6/6 at L3 says Old Tusker itself sits above the 60-70% band under this setup - not this lane's to tune.

## REDS
- partner-throw: 1 RED "a boss takes a CHIPPED hero blow (captain: 0 of a raw 30)" - PRE-EXISTING (claude/coopprogress found identical numbers on master f84fd0c4); no AI seat in that test.
- The `?trans=1` ferry transition is NOT in this tree (no match in src/ or tools/), so it is untested; the raft rule (never alone on a raft/lifeboat/ferry mover) covers ferries by `m.ferry`.
- NOT RUN: the full suite (coordinator's), mash-gate (no level/boss changed; human co-op scaling unchanged at x2).

## QUESTIONS FOR DANIEL (rec built in each case)
1. LIGHTER SCALING NUMBER - one AI partner scales the wood x1.5 (enemy hp AND blows on heroes), two AIs x2, a human partner the old x2. REC/BUILT 0.5 per AI. Say if you want x1.3 or the hp/damage halves split.
2. AN AI'S DOWN CLOCK - when it runs out while you stand, the AI gets up beside you at 1/3 hp (a death on its tally) instead of sending the party to the shrine. REC/BUILT (a bot should never cost you a run). Alternative: party wipe like a human partner.
3. AI FLASKS - an AI carries its own flasks (its save's max; respawn restores; it drinks by behaviour). Human local seats still carry none (unchanged). REC: give every seat flasks in a co-op balance pass. Built: AI only.
4. SKILL LEVEL (EASY / NORMAL / HARD from the 10-03 brief) is NOT built - the 10-14 interview replaced it with the four behaviours. REC: leave it out unless you want both (a HARD toggle would map to the boss lab's 'human' vs 'human+first' profile).
5. A LINKED COMPANION'S SILVER goes to YOUR purse (the brief: silver stays with your save) - including coins it picks up. REC/BUILT. Its death-cost bundle is never written to its save either (xpOnly).
6. TAG - every AI still wears 'ALLY' on its plate and tag (seat colour tells two AIs apart; the board says 'AI PARTNER - <HERO>'). REC/BUILT. Alternative 'AI2'/'AI3'.
7. AI PARTNERS ARE SEATED IN THE TAVERN ONLY (the party board), plus the old pause-menu/title 'X ally' pick (a DEFAULT BALANCED partner). REC/BUILT. A map-side AI picker is the sonnet companion-menu lane's.

## SONNET FOLLOW-UP
1. Companion menu polish: a pre-pick preview (hero art, level, behaviour icon), behaviour changeable from the pause menu mid-wood, more than one linked companion flow tested with 3 AIs.
2. Per-act walk test lane (stuck time, deaths, catch-ups) through a sample of levels per act - extend tools/ai-companion.mjs `follow` to take a level list (it already uses tools/level-walk.mjs routeOf).
3. Hard platforming: a 'wait at the ledge' read before the fall (today it falls once, then waits for the puff) - use src/walk-graph.js reach to know a jump it cannot make.
4. Level verbs: levers, pours, bells, ropes, ferries with a fare - the AI ignores them (P1 does them; it is pulled along). A sonnet pass could let SUPPORT pull a lever P1 points at.
5. Boss-specific hands: the boss lab's per-boss plans (lab.js bossLab) for the AI instead of the generic duel frame (it walks into some arena hazards), and skill use (the lab's skill hands).
6. Online: an AI seat in an online party (the host runs it; guests see it) - untested.
7. Shrine refill for AI flasks (a lit shrine refills P1 only today), and the AI's own revive scoring on the win card.
8. A visual 'thinking' cue (behaviour icon on its plate) and a told line when it waits at a gap ('ALLY WAITS').
