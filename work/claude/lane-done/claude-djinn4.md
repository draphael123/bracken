# claude/djinn4 - THE DJINN's flood, after Daniel played him (2026-10-05 evening: "much better shape")

Base: master 85e13368 (batch71: ARCHMAGE4's windlass-by-E, the Djinn's own theme). Owned files only: src/djinn.js, src/djinn-hands.js,
src/redraw/djinn_art.js, src/hint-lines.js (the Djinn's block), src/lab.js (one line: the pail into djinnPlan), src/main.js (one line: the
hands' `hurt`), tools/djinn.mjs, tools/djinn-pail.mjs (new), tools/djinn4-shots.mjs (new, pictures), tools/check.mjs (two names).

## What changed, per item

1. **EVERY P3 HIT AVOIDABLE** (src/djinn.js `P3_HARMS`; tools/djinn.mjs).
   - The list: SPOUT (ring under you, 1.02 s, dodge - or the pail), HELD (the same ring, then "THE SPOUT HOLDS YOU", strike out), WAVE (his !!
     under the shaft, 0.96 s, then the bore running out - jump; a ledge's crest the same), SLAM (ring where the hand lands, 0.96 s - dodge, or the
     pail), UPSURGE (bubbles + a ring where the fist comes, 1.08 s - dodge), WHIRL (the water turning, 1.08 s - wade out: it bites only under the
     shaft), DEEP (the surge: !!, a roar, a foam line - 4.0 s before the water is high, climb a ledge).
   - Fixed to make that true: **the shallow flood no longer costs anything** (was 1 a second, untold); **the ledges are safe at high water** (only
     the deep floor bites); **the deep water bites only once the well is HIGH** (surge told 2.0 s, rises 2.0 s, first bite 0.8 s after: 4.8 s -
     from the middle of the hall a hero walks to a ladder at RUN 92 and climbs it at 74 in 4.4 s); **the whirlpool and the surge never overlap**
     (surging, he skips the whirlpool; the surge waits for a whirlpool to end - the pull held heroes off the ladders while the deep water came).
   - The check: every harm told >= 0.6 s with a !! and an answer; two minutes of the flood against a hero who never answers - every blow that lands
     is on the list; and AN ANSWERING HERO (reads a third of a second late, the game's RUN/climb/jump numbers, six homes across the hall, two
     minutes each) is never hit once.
2. **SLOWER P3** - every windup x1.2 (upsurge 0.9->1.08, spout 0.85->1.02, wave 0.8->0.96, slam 0.8->0.96, whirl 0.9->1.08, surge 1.6->2.0), the
   gap between his moves 0.65->0.8 s, his glide between blows 100->80 px/s. Asserted against djinn3's numbers.
3. **LESS P3 DAMAGE** - x0.845 on average, each at least 10% off: spout 16->14, held 24->20, wave 26->22, slam 26->22, whirl 10->9, deep 4->3,
   upsurge 22->19; the flood 1->0.
4. **THE PAIL = SCOOP + THROW** (src/djinn.js scoopPail/throwPail/stepPails/REAR/coreOf; src/djinn-hands.js; djinn_art.js drawPail + the core).
   - When the flood comes each hero gets a pail ("A PAIL FLOATS UP: E SCOOPS THE FLOOD"). **E in the water scoops it full**, at once (told the first
     time). A step off the windlass - within 20 px E still winds the great bucket (ARCHMAGE4's rule unchanged).
   - **He REARS UP** to strike (the hand slam and the spout - arms up, already !!): his CORE lights in the column (a pulsing white-gold heart with a
     gold ring), told the first time: "HE REARS UP: THROW THE PAIL INTO HIS CORE". **E throws the pail at his core** (any time, within 230 px), and
     **a strike throws it** while he rears (as the windlass takes E or a strike). It flies there (520 px/s); if he still rears when it lands he
     **CHOKES**: 2.0 s still where he is (B4), open, his strike cancelled (the ring and the slam/spout gone), the throw takes 1.5% of him and cuts
     bite x2.5 up to 2.5% more; then his 3 s shroud (B3). Not rearing it splashes off (told); warded his shroud turns it (told).
   - The bail stays the BIG one (7%, 5.5 s); the choke is the small earned one (4% at most, 2 s) - asserted.
   - Every hero (knight, warden, pyro, paladin, pirate, reaper, geomancer) scoops, throws by E and by a strike, and chokes him in the page:
     tools/djinn-pail.mjs (36 checks).
   - **Shared OPEN read (B10)**: every Djinn opening - mud, douse, bail, choke - now wears the same read: a GOLD RING round him, OPEN over it, a gold
     clock running down (was a green bar). The bar name says MUD / DOUSED / BAILED OUT / CHOKED.
   - Marks/answers: the rears keep '!!' / dodge; MOVES carries `alt: 'throw'` for both. No new told mode (no marks.js rows needed).
   - Bot (src/djinn.js djinnPlan, src/lab.js passes `pail`): in the flood it scoops a step off the windlass, waits there full, and throws when it
     reads a rear (0.25 s late, misses 25%) only if the pail lands while he still rears.

## Numbers (campaign level, tools/harnesscard-rates.mjs welltown --mode=new, L30, 8 seeds a hero)
- After items 1-4, before tuning: knight 8/8, pyro 7/8, warden 2/3 (stopped) - about 90%: out of band, as the brief foresaw.
- Tuned through P1/P2 only (a mud or a douse takes `openCap` of him): 0.045 -> knight 2/6, pyro 3/6, warden 3/5 (+1 err) = 44-47%;
  0.047 -> knight 2/5 (+1 err), pyro 6/8, warden 6/8 = 67%; **0.046 (shipped) -> knight 3/8, warden 6/8, pyro 5/8 = 14/24 = 58%**. No hero at 0.
  The bail (7%), the hand (6%), the windows and his health are unchanged. Rows in work/claude/djinn4/rates/.
- Mash (tools/mash-bot.mjs, re-stamped LEVEL then BOSS): boss 0/6, mini (Gang Leader) 0/6, level: every hero dies (knight/warden/pyro lowest 0%). mash-gate holds (38 levels).

## Checks run (green)
djinn (106, node; now in check.mjs), djinn-pail (36, page; new, in check.mjs), welltown, steam-works, hint-shown, tells, answer-tags, boss-greed,
untold-told, verb-matrix, boss-openings, boss-fight-end, rule-openings, weak-bosses. mash-gate, textfit (0 issues - the old Djinn name/plate reds are gone too).

## Pictures
work/claude/djinn4/a1/: the empty pail, the full pail, HE REARS UP (core lit), the pail in flight, HE CHOKES (gold ring, OPEN, clock).
tools/djinn4-shots.mjs makes them (not in the suite).

## QUESTIONS FOR DANIEL (recommendation first; the recommended option is built)
1. **The flood itself no longer hurts, and the ledges are safe at high water** (djinn3 made the ledges go under and pay; your brief says no harm
   from the flood without a tell and always a safe spot). Rec: keep - the surge is the tell, the deep floor is the harm, the ledges are the answer.
   Alt: the ledges pay a small tick at high water again (then nothing in the hall is safe for 5 s).
2. **The pail is given** to every hero when the flood comes (no fetching). Rec: keep - the verb is the scoop and the throw. Alt: a pail hangs on the
   windlass post and E takes it.
3. **What counts as rearing**: the hand slam and the spout (both arms-up windups). Rec: keep. Alt: the blow from below too (fists down - it reads
   as a different pose).
4. **E throws any time** (a wasted throw splashes off, told); a strike throws only while he rears (so a cut is never eaten by the pail). Rec: keep.
5. **Back in band through the P1/P2 cap** (a mud or a douse 5.25% -> 4.6% of him). The knight is lowest (3/8); warden 6/8, pyro 5/8. Rec: keep, and
   let your playtest decide the flood's feel (the playtest gate: the reworked flood ships after you play it).
