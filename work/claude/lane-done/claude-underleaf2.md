# claude/underleaf2 - UNDERLEAF 2: sound is a verb, and THE GRANDMOTHER keyed FROM BEHIND (Daniel's interview 10-08, scratch/brief-underleaf2.md)

Base: claude/underleafroad c53ece88 (Underleaf on the main road Kingswood -> Underleaf -> Scree Path, act I, campaign L6; it carries rootway + burningmap + batch79).

**DANIEL PLAYTEST GATE:** THE GRANDMOTHER is a reworked boss (B9). She ships only after Daniel plays her.

## What was built
### The level - SOUND IS A VERB (A2). New module src/hush-hands.js; the hush itself stays in main.js (MAT_VOL, noiseAt, footMark, updateHush)
1. **THROW A NOISE.** Pots (and the churchyard's stones) on CARRY & THROW: `THROW_KIND.pot` (src/throwables.js) + `KINDS.pot` (src/carry-throw.js), so the arc you are shown is the arc it flies. INTERACT takes one (it wins over a sign or a door in reach), ATTACK throws it, UP lobs, DOWN tosses short. Every pot at rest is highlighted (outline, sweeping glint, take-me ring); a held one draws its told arc. 19 shelves along the road; a first-use sign at the first pot (25).
   - Where it breaks is a noise ring (`noiseAt(..., 'pot')`). A sleeper inside it ROLLS OVER TO FACE IT and sleeps on (its back to you); one right under it wakes. THE BELLMAN turns to it, walks to it and looks. A window lights only if the pot breaks under it.
2. **QUIET PAYS.** A sleeper (or an unwary Bellman) struck FROM BEHIND dies in one silent blow: the swing that does it makes no sound, the kill none either, and a dagger mark over the sleeper says you are there (A3). A step on moss/rope (a ring under 20 px) no longer wakes a sleeper - the quiet road is quiet right up to its back. Taught at 10-20 on the moss (the archer asleep facing away).
   - **Silver caches, one a street** (3 = the level's 3 silvers, A11): a strongbox with a lantern on its lid; one lit window in its street (or its alarm) and the lantern goes amber - BARRED for this life. The silvers keep their save bits: #0 on the school roof where the relic was (src/relics.js VAULT_SILVER unchanged), #1 the church gallery as always, #2 the mill roof.
3. **LOUD COSTS.** Three streets (L.hushSecs). Two windows lit in a street, or its Bellman ringing, rings its ALARM post (drawn: its lamp pips light as its windows do) and drops its STREET GATE (PORT tiles, under the mill / the third terrace house / the green's far house). The roofs go round each one (ladder at the gable, tools/underleaf.mjs proves the boss room is reached on legs alone with every gate shut). A dropped gate is glinted (its roof) and, stood at for NUDGE.after s, told (A6). A death puts the street back to sleep.
4. **THE TOLL (the remix).** The church tower's bell swings back (told: the rope jerks) and tolls every 9 s; for 1.9 s nothing made in the churchyard (251-336) is heard - the mill's din made a clock. Signed at 254.
5. **THE BELLMAN** (the level's one new foe, A9): blind night-watchman, ear trumpet + handbell (sprite src/chars.js bakeBellman). Walks his beat, turns to any sound and goes to look; a sound of YOURS inside his ear (70 px, a dotted ring drawn round him) or you in front of him and he raises the bell ("HE HEARS YOU") and RINGS: his street's alarm. From behind: one blow, no ring. Five of them (one teaching at the lane's end with a pot beside him). THREAT 1.5, role support.
6. **THE ONE REQUIRED THROW (A4).** The bone key hangs on the school bell-cote's nail, out of reach (a hung key cannot be taken); a pot from the roof's chimney stack, lobbed UP, knocks it down onto the roof. Glint + nudge (src/stuck-spots.js ul-bone). The key's data lies on the roof (every reach tool finds it), hung at runtime.
7. **THE STREET CLIMBS** (level-quality's bands/route): the lane drops into its DITCH (boards, a loose one, and a root cellar dead end with a pot and savings); the CHURCH, its TOWER (the toll's) and the SCHOOL stand across the street - over their roofs or through their doors.
8. **Fights / XP.** Section exams (elites, CP after): the mill race (shield captain + assassin + the chained berserker), the terrace's end (goblin captain + sprig on a loose board), the tower's foot (pike serjeant), the bell-cote roof (archer captain + cutter), the green (goblin captain in the open); interior elites in the loft (the miller), the nave and the schoolroom. Squads under the yew (in the toll). Underleaf now gives 1,014 foe XP a run (xp.mjs), ~1,674 with its other XP.
9. **Checkpoints (A10b):** 15, 154, 334, 466 (L.checkRun 200: no filler between); route gaps 140 / 197 / 129.

### THE GRANDMOTHER (src/main.js updateGrandmother + src/hush-hands.js granTake/granLure)
- **Off the x0.05 chip** (src/boss-greed.js FULL_DAMAGE with the reason). **Callers cut, vanish cut.**
- **Front:** she hears a blade coming and turns it - clank + "SHE HEARD YOU" (B10), and her stick comes back at your knuckles (THE JAB, a yellow !). **Back:** whole - and she turns on the blow.
- **The key, her BACK (B14 FROM BEHIND):** a pot breaking behind her, or a BELL-PULL struck (two cords, each rings the chime at the far end of her cottage) - she whirls (yellow !), LASHES at the sound, and stands with her back to you: OPEN (gold ring + bar; BK.bossOpen), x2 on her back, her front still turned. One opening pays at most 18% of her (a purse, the minis' rule). Then a told 3 s WARD (pale shell + bar, "WARDED"): no lure turns her, no blade bites, and it beats out a burn.
- **The floor talks:** she hears a sound only as far as it carries (its ring x2.4, x3.6 while listening): a rug step hardly at all, a board across the room. Her SWEEP goes to where she last heard you; a dotted line from her ear shows the bearing. THE HURL: a far, fresh sound and her stick goes after it (red !!).
- **Listen -> rap kept as the bonus opening:** stand still ON A RUG through her listen and she raps the floor (open all round, x1.5, a 6.5% purse); on the bare boards "THE BOARDS CREAK UNDER YOU" and her stick comes at you.
- **Phases change the room:** two (66%) - she kicks the candles over, the rugs burn to boards, THE LANTERN; three (33%) - she rings for the village: THE KNELL runs the boards both ways (jump it), the chimes jangle (the pulls are lost), she is deaf a beat after each knell, and the rap works anywhere under the din. Only her rap and a thrown pot open her there.
- **Her cottage** is drawn (posts, the beam her cords run along, a moonlit window, shelves, herbs, a hearth); rugs woven, then charred.
- Health 505 (EHP; was 300 on the chip). Blows (DMG): sweep 40, fire 33, feel 24, jab 20, stick 35; the knell 22.

## Measures (campaign L6, harnesscard-rates --mode=new, 10 seeds a hero)
| profile | knight | warden | pyro | all | mean fight |
|---|---|---|---|---|---|
| **human (flasks), the new B6 target 60-70%** | 7/10 | 5/10 | 9/10 | **70%** | 152 s |
| human+dry (reported alongside) | 4/10 | 2/10 | 8/10 | 47% | ~140 s |

- Tuning path with flasks: 83% (505 hp, the old blows) -> 33% (blows +15%, rap 7%) -> 73% (+7%) -> 70% (+10%, sweep 40/fire 33/jab 20). 10 seeds is noisy: the same setting has swung by about 15 points. No hero is at 0/N; the warden is the weak hero (5/10 with flasks, 2/10 dry).
- Boss mash (tools/mash-bot.mjs, re-stamped after the final tune): 0/6 (the mash bot dies in 30-38 s with 84-99% of her left). Level mash: every hero dies (level row stamped first, level unchanged since).
- level1-pilot: 22 hits, 2 deaths; curve: 88% lost, 0 deaths (hash e5cf1d597a9b).
- Fights run ~150 s on average, at the top of the 90-150 s brief, with the longest at 240 s.

## Checks
Green: tools/underleaf.mjs (new), level-quality (underleaf GATED, clears), tells, hint-shown, keys, signs, collectables, deadends, one-new-foe, stuck static, curve-gate, map-grammar/spacing, spawns, floaters, architecture, killzones, comments, throwables, relics, camera-fill, level-reach, answer-tags, zoom-coverage, boss-openings, weak-bosses, rule-openings, boss-read-audit, textfit, checkpoint-gaps, elites (underleaf), mash-gate (underleaf).

## Reds (not mine, all on the base c53ece88)
- boss-greed: FULL_DAMAGE carries `huntmaster`, which is not in DUELISTS (grandmother is in both now).
- mash-gate: the rootway level (the mash bot clears it).
- elites: ksar. Runtime stuck: rw-cellar-span (rootway). traps: 20 rows, none underleaf. checkpoint DENSE is report-only.
- level-walk: the walker stalls in the mill loft. It can't fetch the brass key off the hoist beam, and this is the same on the base (checked in a temporary worktree, since removed). It reaches everything up to there with base moves; reachcore/level-quality route the whole level.

## DANIEL PLAYTEST GATE
THE GRANDMOTHER is reworked. Please play her before she ships.

## QUESTIONS FOR DANIEL
1. **Her numbers.** She is at 505 hp, an 18% purse per back opening and 7.5% per rap, with blows about 10% harder than before. That gives 70% with flasks and 47% dry. Rec: keep it (built). The warden is lowest; if your playtest finds her too hard for the warden, take the 10% off her blows first.
2. **Rap only on a rug** (bare boards creak and she strikes) until P3's din. Rec: keep (built). It makes the floor talk, which was your ask.
3. **FROM BEHIND** is also the key of the next main-road boss, the Ram Lord (front-guarded). Rec: keep hers as sound-made (she turns to a sound) and his as position-made, so they read differently. Or move one of them.
4. **XP:** Underleaf gives 1,014 foe XP (was ~700), but the road still ends at ksar -2 on xp.mjs. Rec: this lane can't make up the rest alone; the rest needs a later lane.
5. **Key rooms and the walker:** the walker stalls on the mill loft's key, and it already did on the base. Rec: a walker lane for the hoist beam.
6. **Eight elites** (affixes in elite-kit AFFIX_AT). Rec: keep (built). It gives real fights for XP.
7. **Alarm at 2 lit windows a street.** Rec: keep (built). One window is a warning, and a pot under a window is your choice.
8. **huntmaster in FULL_DAMAGE without DUELISTS** (red on the base). Rec: the huntmaster lane adds him to DUELISTS.
9. Music is unchanged (the old Underleaf track).
