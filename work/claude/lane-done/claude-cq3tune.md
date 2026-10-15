# claude/cq3tune - THE CISTERN QUEEN 3, tune (sonnet; off claude/cisternqueen3 fe3677d7). Port 8939.

## Result (underwell, practiced, L36, profile human, flasks kit, 12 seeds a hero)
| | before (this branch's base) | after |
|---|---|---|
| knight | 9/12 | **10/12** |
| warden | **0/12** | **3/12** |
| pyro | 6/12 | **10/12** |
| all | 42% (LOW -18, warden zero) | **64% in band, no hero at 0** |
Dry (human+dry, bare flask, 6 seeds): knight 1/6, warden 0/6, pyro 1/6 = 11% (report only).
Fight lengths (after): knight 78-148 s, pyro 104-150 s, warden 148-215 s (a win is 183-201 s; her deaths are long). The warden's fights are still ABOVE the 90-150 s target.

## Why the warden was 0/N (the bot misplayed her own mechanic)
The warden's point pays by the distance to the QUEEN's box (main.js tipPay: near edge >= 28 = tip x1.3/1.5, 14-28 = shaft x0.75, <14 = haft x0.3). The bot cut her stinger from 0.6 of its reach on the side it happened to be, which put it BETWEEN her body and her stinger: all haft. Her blows on the stinger averaged 10-13 where a point that pays lands 60+. It also swung on the way to the spot (a swing roots the hero) and crossed her body on foot (about 50 px/s through her) so most of a 3.6 s sag was walking. Fixes (queenPlan, src/cistern-queen.js, warden only where `s.tip`; the others keep their old stand):
- cuts every stinger (opening, planted, stuck, bloom) from the FAR side, facing her, at the point's distance (`standAt`, `stSide`);
- in her THRASH it goes to the side her tail will drop (behind her) instead of just "off the heat";
- jumps over her body to reach the stinger, and swings only once it is at the spot.
Alone these took the warden's left-over health from 28-76% to 10-50% but not to a win; the rest is numbers (below).

## Numbers (src/cistern-queen.js CQ)
- dmgK 2.9 -> **2.0** (the opus rec said 2.2-2.4; 2.4 left the warden 0/8)
- openCap 0.14 -> **0.09**, plantCap 0.10 -> **0.08**, stingCap 0.07 -> **0.055**: the knight and pyro hit these caps (they are what made them 8/8), the warden's lower damage mostly does not, so tightening them pulls the strong heroes down without costing the warden
- openings LONGER: ablazeT 3.6 -> **4.8**, slipT 3.4 -> **4.4**, openT 3.2 -> **4.0** (the warden is time-bound, not cap-bound; every opening is still >= 3 s)
- tipCap left at 0.025: 0.035 changed nothing for the warden (tried, reverted).

## Checks (PORT 8939, one page at a time)
- cistern-queen 162 checks; boss-read ok; damage-caps ok (11); boss-greed ok (47 bosses/16 minis); underwell ok; boss-fight-end 63/63; boss-openings ok (cisternqueen: slip 4.4, ablaze 4.8, fallen 4, rear 4).
- Mash 0/6 (knight/warden/pyro x2: all dead, she keeps 89-90 / 60%): `docs/mash-bot.json` underwell BOSS row re-stamped because the tune deliberately moved it (it was 75-94%; now 60-90%). No other row touched.
- No test weakened, none edited.
- Not run: the full suite, textfit, hint-shown (no text or hint changed).

## Reds
None in what I ran. The warden is still the weak hero (25%) and its fights are long.

## B14 adjacency (the opus report's Q6)
Road order (`needs:` chain in src/level.js): caravan -> **welltown** (Djinn of the Great Well) -> **underwell** (Cistern Queen) -> redgorge. So they ARE consecutive main-road bosses. Both are water bosses: the Djinn's key is the level verb water (pour / thrown pail = mud open, LV in scratch/audit-keys.md); the Queen's new openings are water (a thrown jar as she surfaces), FIRE (her sag) and the STINGER (always, her weak spot). Shared key: water-THROW. Rec: keep it as built: she has three keys (stinger, fire, water) and only one of the three repeats the Djinn's, and the Underwell level teaches the jar and the fire; if Daniel wants B14 strictly met, make the jar a pour-only key for the Djinn or drop the jar from phase one and leave her fire + stinger (the fire sag is then her one opening in P1). Not redesigned here.

## QUESTIONS FOR DANIEL
1. **Warden at 25% (3/12) with 150-215 s fights.** Built: the bot fixes + numbers above, which gets the row in band (64%) with no hero at 0. Rec: keep, and let the live warden playtest judge; the alternative is a warden-specific stinger bonus (e.g. her point always counts as a tip on the stinger), which touches main.js tipPay and was not done.
2. **Tighter caps + longer openings** (above): she is a bigger "wait for the window" fight now. Rec: keep. Alternative: openCap back to 0.11 (knight/pyro 8/8, warden 2/8, row HIGH +5).
3. B14 (above): keep or make the Djinn/Queen water keys distinct?
