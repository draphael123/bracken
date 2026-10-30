# claude/ft4c - FALLING TOWER 4, LANE C: LIVING REALMS (Opus, PORT 6595)

Base: claude/ft4a 3dd808be. Brief: scratch/brief-fallingtower4-1029.md #4 A (approved 10-29 16:00). Branch claude/ft4c (worktree bracken-lanes/bracken-ft4c), pushed.
NOT merged, NOT deployed. **Level hash unchanged: fallingtower 736334cc036b before and after** (boss code only; nothing touches tiles or ents).

## What was built (src/mage-realms.js; small hooks in undead-mage.js, main.js, lab.js)
Each realm now **comes apart in 3 beats** (beat 2 at 7 s, beat 3 at 14 s after you arrive; the fire room counts after its 2 s grace). Each beat is
said on the realm's own banner, shaken in, and the realm's **border crumbles**: chunks fall off its walls and notches break out of them.
Each realm has a **second thing to hit back** (a second line on the arrival banner), and **he moves**.

| realm | beat 2 | beat 3 | return #2 (new) | he moves |
|---|---|---|---|---|
| FIRE | a burnt tile glows dark for 0.8 s, then falls (never the tile under you as it is picked; max 3). It leaves a burning pit, low (44 px, 10 dmg, throws you up) | the floor tilts toward his perch and the carpet slides that way (24 px/s) | **strike his firebolt into the brazier over him**: it spills on him (SCORCHED). A brazier relights after 6 s. Struck while he is away from it, it spills on no one | between two perches at the ends (crosses every 7 s, never while his wall is out), keeping your height so the wall lure still works |
| ICE | frost creeps down the band for 1.5 s, then the ceiling comes down 2 rows (icicles and all) | 2 more rows, plus 3 drifting floes. His lances break on them and so do your returns | **bat his ice lances back**: 2 in his shell shatter it (one leaves it cracked, "ONE MORE") | in beat 3 he hides low behind the nearest floe |
| POISON | 3 vents: the next one bubbles for 1.4 s, then he hops to it (his beam comes from there) | the mire surges (told 1.5 s by a wave line, THE MIRE WILL REACH HERE). Bone rafts float up: over one you ride it and the mire cannot reach you | **strike a spore ring back before it blooms**: it flies home and chokes him (VENTED) | from vent to vent |

- Everything is placed from the realm's box (realmBox), never from tiles, so lane B's geometry changes cannot break it. A test moves the hall 160/48 px and checks every piece moves with it.
- His firebolt in the poison realm is no longer drawn with the gold "returnable" ring (it never could be returned there; `noReturn`).
- Bot (src/lab.js): it uses the new returns (two in three, like the fight's strike-back hand), climbs out of pits and over a surge, and swings at a spore ring.
- **Found:** every realm line said through c.say (old and new) is dropped by main.js number(), because nothing routes it. So the beats are shown on the realm banner
  instead. The older dropped lines (IT ROLLS BACK FOR YOU..., IT FALLS, THE MIRE FEEDS HIM...) are left as they were. See Q4.

## Checks (one browser at a time, RAM checked before each)
- **undead-realms** (extended: LIVING section, all 3 realms; the page part runs the real fight): **green**.
- **Node: green.** tower-chase (TOWER_CHASE_NODE=1), undead-moves, tells, boss-read, answer-tags, comments, architecture, stuck --static, level-quality fallingtower.
- **Page: green.** boss-openings, rule-openings, reach-heroes (0 new crossings).
- **textfit** (the suite's scope list, --strict): 1 TRUNCATED, "LORD GRUBBAG THE GLUTTON" on bossjump row #63. Pre-existing; it is not the realm code.
  The mapcard scope timed out once under load, then passed alone. Everything else: 0.
- **mobile-perf: 2 worst-frame spikes** (map 861 ms, redgorge 1827 ms; fps 42-57, structural guards OK). Realms are not in its scenes, so these are load timing
  (the gate was running). **Realm frame cost** (realm-shots, sim+draw): fire 5.8 -> 6.5 ms, ice 4.9 -> 5.3, poison 4.7 -> 4.5 (beat 1 -> beat 3). No regression.
- **fire-room: RED, pre-existing.** Its setup had broken since ft4a's ascent; I fixed that. Then **the base 3dd808be fails the same way**: every hero is caught
  once by the burning floor at 4.97 s, before any beat. That is the test's own flying bot. Rec: a follow-up fix to the test bot (ft4tune).
- **Boss rates (report only, practiced, human, flask kit, L39, n=6, seeds 1-6): knight 5/6, warden 6/6, pyro 6/6 = 94%** (lane A: 69% at n=24).
  This is **over the band**, as the brief predicted (two openings per realm). Tuning is ft4tune's job. Rec: REALM.openT 3.0 -> ~2.0 and/or the realm marks,
  or slower second returns (brazier relight, ice2.cracks 2 -> 3). Not the 0.4x floor.
- Not run: the full suite (forbidden), pixels, mash-bot (no hash change; a boss re-stamp goes with ft4tune).

## Tests changed
- tools/undead-realms.mjs: the rig takes o.A (the hall moved) and a held blow box (setStrike). A new LIVING section covers beats (on time, said on the banner,
  told), the crumbling border, pits (told 0.8 s, never under you), tilt, perches, brazier hit and miss, relight, ceiling after frost, floes hiding and blocking,
  two lances, vent bubble then hop, surge told, rafts hold, spore return, noReturn, and the hall moving. Existing asserts are unchanged.
- tools/fire-room.mjs and tools/realm-shots.mjs: setup waits out ft4a's ascent and reads marks from e.realmAt. realm-shots now also takes pictures of every beat
  and return, and the frame cost.

## Screenshots (scratch/lane-reports/)
BEFORE: ft4c-before-03-fire-burn, ft4c-before-08-ice-crack, ft4c-before-14-poison-spores.
AFTER: ft4c-after-06-fire-b2-drop, 07-fire-b2-pit, 08-fire-b3-tilt, 10-fire-ret-cue, 11-fire-ret-fly, 12-fire-ret-spill; 19-ice-b2-creep, 20-ice-b2-ceiling,
21-ice-b3-floes, 23-ice-cracked; 30-poison-b2-bubble, 31-poison-b2-hop, 32-poison-b3-tell, 33-poison-b3-surge, 35-poison-ret-spore.
Re-take: `PORT=<port> node tools/realm-shots.mjs <dir>`.

## ART TODO (ft4art, all greybox now)
Braziers on chains (lit, empty with smoke) and the pour. The dropping tile's dark glow and the pit's fire. The tilt (stepped tiles today). Frost creep and the
lowered ceiling's edge. Floes. Shell cracks. Bone rafts. The bubbling vent. The surge wave line and crest. Wall chunks and notches. The spore flying home.

## QUESTIONS FOR DANIEL (rec first; each built as the rec)
1. **Rates 94% (n=6) after the realms got second returns.** Rec: ft4tune pulls it back to 60-70% with REALM.openT (3.0 -> ~2.0) first, then return costs.
   Alt: drop one return (e.g. spores, the easiest).
2. **The spore return is the easiest** (the ring blooms where you are, so any swing in it returns it). Rec: keep it, and let ft4tune judge it.
   Alt: only the ring furthest from you can be struck back.
3. **Beat timing 7 s / 14 s.** Rec: keep. Alt: tie the beats to his health inside the realm.
4. **Old realm lines never show** (number() drops unrouted c.say lines: IT ROLLS BACK FOR YOU..., IT FALLS, THE MIRE FEEDS HIM..., the OPEN lines). The banner
   and world words carry the read today. Rec: a small follow-up that routes the useful ones (hint-lines REALM_SAY) after a hint-shown review. Alt: leave as is.
5. **What's new:** no updates.json entry from this lane (lane A's FT4 placeholder covers it). Rec: integ adds "the realms come apart" to that entry.
