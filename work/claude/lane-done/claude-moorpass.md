# claude/moorpass - THE WINDCALLER: every walled hero gets an answer, and the summit gets fair footing (opus)

Base origin/claude/moorpyro 59ec58e9 (fire sends his bolt home, EHP 1150). Brief: moorpyro's Qs 2-3. Profile human WITH flasks (kit), campaign level L10,
practiced, Normal; PORT 8783; one test run at a time. Data: work/tmp-moorpass (uncommitted: probes, traces, rate logs/json).

## DIAGNOSIS PER WALLED HERO (HITLOG probes, seeds 1-3, EHP 1150, before any change)
| hero | before n=6 | what took his hp | verdict |
|---|---|---|---|
| ranger | 0/6 | HIS BOLT 128-160 of 260 (50-60%), blast 64, thorns 44; 0 openings | DESIGN GAP: no guard, her ARROW SNATCH killed his bolt, the knife strike sends it back TOO FAR |
| Blood Knight | 0/6 | THORNS 40-120 (the strip, tiles o+10..11), blast 32-64, bolt 12-44; 0 openings, 10-21 cuts | ROOM + DESIGN GAP: his ward return of a bolt is TOO FAR from the floor |
| paladin | 0/6 | HIS BOLT 192-224 (the aegis needs 0.16 s held to stand - the hands' tap never raised it), thorns 46-92; 3 openings, timeouts (boss 12-34% left) | HANDS + DESIGN GAP |
| berserker | 1/6 | THORNS 126 (the EAST field, tiles o+30..36: under the east ledge), blast 72-80 | ROOM (he climbs and duels like the knight) - no new verb |
| knight | 2/12 | THORNS 82-123, 9 of 11 bites in the strip | ROOM + KIT: (a) THE LAST CHARGE - a full RESOLVE and a C tapped to block his bolt launched the 360 px/s charge straight into the strip (it pulls up at a drop, never at thorns); (b) his fall put him 28 px from the strip, so a hero coming from the lip stood in the thorns to reach him |

## THE ROOM PASS (src/level.js galeMoor summit, src/main.js) - fair footing, the thorn rule kept
- THE FALL STONE RUNS ON UNDER THE EAST LEDGE: safe floor o+12..34 (was ..27); the east thorn field is o+35..44 (was o+28..44, i.e. it lay under the
  ledge). A hero his BLAST throws off a ledge, or one the gust sets down short, lands on stone. The strip (o+10..11) and the far field stay, in plain sight.
- HIS FALL IS CLEAR OF THE STRIP: callerFallX keeps him CALLER_FALL_IN = 48 px in from a floor's ends (was 28); the thorn hand-back uses the same point.
- THE LAST CHARGE PULLS UP AT THORNS as it does at a drop (updateLastCharge; all levels - a knight's charge never carries him into a hazard he did not jump).
- Summit sign: per hero (pyro, paladin, ranger, Blood Knight read their own send-home line).

## THE ANSWERS - EVERY HERO HIS OWN WAY HOME (src/main.js sendBoltHome / CALLER_HOME; src/ranger.js snatchSeeds)
The pyro's burn becomes one case of a general rule: a bolt sent home flies from ANY range (no TOO FAR), lands as the SMALL fall (3.4 s, 16% cap) plus that
hero's blow (x CALLER_OPEN_MUL 2). A bolt blocked/struck back beside him on his ledge stays the BIG fall - the climb is still the bigger prize. Warded, he turns it.
| hero | the told verb | word / colour | its blow |
|---|---|---|---|
| pyro (moorpyro) | FLARE / EMBER sets it alight | BURNED BACK, orange | 60 |
| ranger | ARROW SNATCH on the beat catches HIS bolt and looses it straight back (instead of pocketing it) | LOOSED BACK, bone | 30 |
| paladin | the AEGIS (held) turns it home in the light | HALLOWED BACK, pale gold | 16 |
| Blood Knight | the WARD LET GO as it lands (his ward-release parry, THROWN BACK) throws it home | THROWN HOME, crimson | 10 |
- Told: each is said as he wakes (YOUR FIRE... / SNATCH HIS BOLT: IT FLIES HOME / YOUR AEGIS SENDS HIS BOLT HOME / LET THE WARD GO AS HIS BOLT LANDS), the
  fall says HIS BOLT GOES HOME: HE FALLS - CUT HIM; per-hero summit sign; bestiary: "From anywhere, fire, a snatch, the aegis or a ward let go sends one home".
  All routed in src/hint-lines.js CALL_LINES; the three new words in MOVE_WORDS.
- Why the blows differ: the pyro and ranger are far off when it lands (the bolt is most of their prize); the paladin and Blood Knight walk in and cut him in
  the fall. At aegis 10 / snatch 40 the ranger won 6/6 in ~70 s on bolts alone and the paladin timed out (his slow charged heavy reaches the fall late) -> 30 / 16.
- BERSERKER: no verb (the room pass took him 1/6 -> 3/6 at 1150, 5/6 at 1300). Scope: only HIS bolts (owner windcaller); every other caster untouched.
- B15 intact: CALLER_GUARD 0.4 unchanged; nothing made him invulnerable; the verbs only add openings, his ward (B3) still turns them.

## BOT (src/lab.js) - hands for the new answers
- HOME_FLOOR (pyro, ranger, paladin, Blood Knight): while he is up these keep to the floor he falls to (moorpyro's pyroPost) and answer his bolt there.
- homeGuard: the paladin raises the aegis as his bolt comes (seen a reaction late, held through it); the Blood Knight raises the ward and lets it go just
  before it lands (inside WARD_BEAT); one bolt in misread is missed. The ranger no longer knifes his bolt (TOO FAR) - snatchNow takes it on the beat.

## RATES (moor, L10, human, flasks kit)
| config | kn | wa | py | pa | pi | BK | ge | be | ra | k/w/p |
|---|---|---|---|---|---|---|---|---|---|---|
| before (moorpyro, EHP 1150) | 14/24 | 23/24 | 10/24 | 0/6 | 4/6 | 0/6 | 4/6 | 1/6 | 0/6 | 65% |
| room pass only, 1150, n=6 | 3/5 | 6/6 | 1/6 | 0/6 | 3/6 | 0/6 | 6/6 | 3/6 | 0/6 | - |
| + verbs (aegis 10, snatch 40), 1150, n=6 | 4/6 | 6/6 | 1/6 | 1/6 | 3/6 | 4/6 | 6/6 | 3/6 | 6/6 | - |
| k/w/p 1150, n=24 | 16/24 | 24/24 | 9/24 | | | | | | | 68% |
| aegis 16 / snatch 30, 1150, n=12 | | | | 9/12 | | 10/12 | | | 9/12 | |
| **COMMITTED EHP 1300, k/w/p n=24** | **18/24** | **23/23** | **7/24** | | | | | | | **68% in band** |
| **COMMITTED EHP 1300, n=6** | (py s1-6: 2/6) | | | **4/6** | **3/6** | **5/6** | **6/6** | **5/6** | **5/6** | |
- Every hero >= 2/6 at n=6; the pyromancer is the floor (7/24 = 29% at n=24, 2/6 on seeds 1-6) - hp is what she feels (9/24 at 1150).
- warden 23/23: one fight ERRORED (Runtime.evaluate timeout under load, not a result).
- DRY (human+dry, n=6, 1300): knight 3/6, warden 4/6, pyro 1/6 = 44% (was 33%).
- MASH: node tools/mash-bot.mjs moor --write -> 0/6 (all DEAD ~13 s, 0 blows land); the level hash changed (summit floor) so the LEVEL row was re-stamped
  (node tools/mash-bot.mjs moor --level moor --write); docs/mash-bot.json committed; mash-gate green (47 levels).

## CHECKS (PORT 8783, one run at a time, a gate + another lane beside me)
ok: syntax, tells (--write: no table change), hint-shown, answer-tags, untold-told, mash-gate (47 levels), mash-carry, curve-gate, boss-read, boss-openings,
boss-greed, weak-bosses, moor-aloft, moor-rocks, moor-gusts, moor-wind, windcaller-gusts (every hero rides every ledge on the told gust; all route), signs,
hero-trials (ARROW SNATCH yard step), knight-rework, reaper-input, crouch-hint, riposte, riposte-shots, combat-part2.
textfit hints,bestiary,talk --strict (TEXTFIT_LEVELS=moor): 0 of every class (bestiary line, the four wake lines, the fall line, the per-hero signs).
boss-fight-end: the one-evaluate run HUNG twice (renderer idle at ~4 s CPU after 45 min, then again run alone; I killed my own PIDs) - run split one level
per evaluate (work/tmp-moorpass/bfe-step.mjs, the same body): all 64 fights end (moor windcaller ended). Rec: the nightly reruns the real one.
RED, NOT MINE: rule-openings fails THE GARGOYLE + POISE identically to the base (moorpyro saw the same on ca5c839e).
Not run: the full suite (the nightly).

## ART / SFX NOTES
- The sent-home bolt's trail takes the hero's colour (bone / pale gold / crimson; the pyro's orange). An art pass could give each a proper look: an arrow-
  fletched bolt for the ranger, a gold-haloed one for the aegis, a blood-wrapped one for the ward. SFX: the catch reuses the snatch pick / aegis / ward-
  release sounds; a short "whoomph" on the turn for each would read better.
- The extended fall stone under the east ledge uses the summit's existing tor tile kit (no new art); the thorn field simply starts further east.

## QUESTIONS FOR DANIEL (rec first; all built as rec'd)
1. THE ANSWERS (rec, built): the ranger's snatch, the paladin's aegis and the Blood Knight's ward-let-go send his bolt home from anywhere as the pyro's fire
   does (small fall + 30/16/10). They lift ranger 0 -> 5/6, paladin 0 -> 4/6, Blood Knight 0 -> 5/6. If any should be the BIG fall (moorpyro's "paladin's
   guard counts as up close") or need him up close, say so.
2. THE BERSERKER (rec: no verb, built none): his wall was the thorn field under the east ledge, not a missing answer - 1/6 -> 5/6 with the room pass. If you
   want him an answer anyway: his TAKE IT on the beat chopping the bolt home, or the AXE THROW (UP+C) striking him off his ledge.
3. THE ROOM (rec, built): stone under the whole east ledge (the field starts past it), his fall 48 px clear of the strip, the Last Charge pulls up at thorns
   (EVERY level - say if a level wants the charge to run into spikes). The strip and the far field stay.
4. EHP 1150 -> 1300 (rec, built; brief: back toward 1400). k/w/p holds 68% because the knight and warden are near their ceiling; the pyro carries the hp
   (9/24 at 1150, 7/24 at 1300). 1400 would likely put her under 2/6. Rec: 1300 now; a pyro pass (her flare misses ~a third of his bolts and she still
   crosses the strip early) would let it reach 1400.
5. THE WARDEN WINS 23/23 and the geomancer 6/6 (the climb heroes): the room pass made the climb safer for them too. Not targeted (band holds on k/w/p);
   rec leave unless you want a harder top end.
