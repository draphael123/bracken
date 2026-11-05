# RANGERPACK lane report (11-05, code only, unattended) - claude/rangerpack = claude/kfork ebffef0df + the Ranger kit. Not merged, not deployed. NO browser opened.
Pattern: kfork / wardenpack. Files: src/tech-ranger.js (data + card text), src/ranger-tech.js (numbers + pure rules), src/ranger.js (effects, beside her own code; api now carries tech()/upg()), src/main.js (api wiring, steady-window extra at 4 call sites, ult name, VOLLEY DRILL cd), src/progression.js (1 import + 2 rows), tools/ranger-tech.mjs (new), tools/tech-cards.mjs (ranger kit check).
Identity used: THE ARROW AND THE EYE (quiver, steady window, distance bonus, bow-bash turn, HUNTER'S FOCUS). Both capstones are UP+C at a FULL Focus (the ultimate input) and reshape/replace THE GREAT ARROW; Focus empties either way. No heal, no pin, no boss immunity.

## Kit
| L | technique | input | k | what |
|---|---|---|---|---|
| 25 | TRUE FLIGHT | steady shot | none | a landed steady shot's arrow returns to the quiver at once, +10 Focus |
| 30 A | COUNTER-NOCK (defence) | tap C on the beat | none | a beat-turned blow pays +1 arrow, +20 Focus (a boss blow too; no stagger added) |
| 30 B | SPLIT SHOT (offence) | hold X, full draw | x0.6 | a free second arrow 0.15 s after a full long-shot draw, +6 wind |
| 35 | LONG EYE | arrow from 140+ px | x1.2 | hits x1.2 and pays +14 Focus (the sweet spot is 52-138, this is the far half) |
| 40 A | BARBED VOLLEY (control) | VOLLEY skill | skill's own | struck common/elite foes staggered 0.4 s and marked 4 s; boss/mini damage only |
| 40 B | PARTING SHOT (mobility) | X in the backflip | x0.9 | flip goes x1.33 further; the flip shot is x0.9 (was the x0.6 tap), small foe staggered 0.35 s |
| 45 | STEADY BREATH | hold X | none | steady window +0.2 s, steady shot range +25% |
| 50 A | THE LONG DRAW (capstone, far) | UP+C full Focus | far end 4.5 -> 6.0 | draw 0.5 -> 0.7 s, range x1.9 of the view (cap 520 px), boss x1.5 as before |
| 50 B | THE ARROW STORM (capstone, wide) | UP+C full Focus | x0.8 each | 0.5 s draw, 12 arrows fall over 90-290 px ahead across 1.5 s, small foes staggered 0.5 s; boss damage only |
Upgrades (8, ranked I/II, all wired): DEEP QUIVER (+1/+2 arrows), FAST FLETCH (regrowth -15/-30%), KEEN EYE (Focus +15/+30%), STILL HAND (window +0.05/+0.1 s), LONG SIGHT (far bonus +6/+12%), BASH DRILL (bash wind -15/-25%), VOLLEY DRILL (cd -15/-30%), SHARP HEADS (arrows +5/+10%).
Law kept (asserted by reading source): storm blows are swordDmg x 0.8, split = the draw's own damage x 0.6, parting = swordDmg x 0.9; counter-nock pays arrows+focus only; barbed returns null for bosses/minis.
Bot: no lab.js change needed. The lab bot already fires UP+C for the ranger at a full Focus with a foe 50-300 px ahead, and the pick reshapes what that press does. (The lab does not choose techniques; a bot with a kit save is a tune-lane setup.)

## Node results (one at a time; none opens a browser)
node --check main.js / ranger.js / progression.js / lab.js / tech-ranger.js / ranger-tech.js OK. tools/ranger-tech.mjs PASS (new), tools/tech-cards.mjs PASS (with the ranger kit check), progression PASS (180), coop-progress PASS, keys ok.
Not run: tools/ranger.mjs, hero-pass, hero-trials, textfit, hint-shown (all browser).

## Browser owed
tools/ranger.mjs (the existing asserts: arrowHit/loose edits touch every shot), textfit (new names/what/teach/trade lines, 'ARROW STORM'/'LONG DRAW' ult name), hint-shown, hero-trials 'meter', starter-kits; a real-key look at: TRUE FLIGHT return ring, COUNTER-NOCK text, the split arrow's wait, LONG EYE number, BARBED mark, PARTING SHOT flip distance and stagger, the widened steady window on the draw meter (the meter reads rgWinX so the segment widens), the storm's falling arrows (placeholder: plain arrow sprites dropped 96 px) and landing dust, the long draw's flight. A real bow-bash parry with COUNTER-NOCK. Co-op: tech ids are not in the partner hero snapshot (a partner sees none of it).
Art owed: no storm pose (reuses rgGreatLoose), no long-draw look beyond the great arrow's, no capstone preview clip, no yard TRY station, no new SFX (reuses rgLoose/rgPick/rgMark).

## Boss-rate impact (no win-rate run; for the tune lanes)
- 25-45 are small. TRUE FLIGHT/COUNTER-NOCK are economy (more arrows = more shots, more Focus = more ults; the most likely to move her rate indirectly). SPLIT SHOT is about +0.6 of a full draw per draw (~+40% on drawn shots, so the biggest direct damage pick at L30; costs 6 wind). LONG EYE +20% on far shots. PARTING SHOT +50% on flip shots (rare). BARBED VOLLEY: crowds only. STEADY BREATH: +50% window; the bot hits the window ~2/3 of draws, humans less, so this lifts the human rate most. The upgrades stack to about +10% arrows, +30% Focus, +2 arrows.
- Capstones: THE LONG DRAW about +33% on the great arrow's far end (boss max ~9.0 swords from 6.75) but the longer draw leaves her rooted 0.2 s more. THE ARROW STORM is the crowd capstone: 12 x 0.8 = 9.6 swords spread, but a lone ~40 px boss catches ~4 arrows = ~3.2 swords vs 6.75 for the great arrow (about half), and no stagger. Test asserts storm < 0.6 x great on a lone boss.
- Ranger rates are unmeasured (rangerid never ran bosses). Do not buff before re-measuring the base kit.

## Questions (rec first, none block)
1. SPLIT SHOT is the strongest L30 offence pick; rec keep (free arrow, wind cost, only full non-steady draws); alt x0.5.
2. THE ARROW STORM boss damage is about half the great arrow's; rec keep (crowd capstone, tune lane raises k 0.8 -> ~1.2 only if she needs it); alt a boss x1.5 like the great arrow.
3. COUNTER-NOCK pays on a boss blow too (arrow + Focus, no stagger). rec keep; alt common foes only.
4. STEADY BREATH widens the window for everyone, not just the bot's 2/3: rec keep; the tune lane should re-measure the human profile.
5. A 30-40 s clock on the capstones like geopack/bkpack: rec none (Focus is the gate, filled only by sweet-spot/far hits).
