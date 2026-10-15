# claude/towpath2tune - THE FOG KNIGHT 2 tuned into the band (sonnet tune lane)

Base: claude/fogknightart3 2cd60436 + merge of origin/master c33c3204 (BATCH93; conflicts: src/main.js BEAST_SHORT and src/marks.js tell table, both unions).
Files: src/fog-knight.js (hp, gap, dmg), src/boss-pressure.js (DIAL_EXEMPT += fogknight), src/marks.js (tells --write), docs/mash-bot.json (boss row re-stamped).

## RATES (tools/boss-rates.mjs towpath --profile=human --flasks=kit, campaign level L25)
FINAL numbers, 12 seeds per hero k/w/p:
- practiced  5/12 10/12 8/12 = 64%  in band (60-70), no hero at 0
- first      1/6 3/6 3/6 = 39%   | built 5/6 4/6 6/6 = 83%
- DRY (human+dry, no flask)  1/12 6/12 3/12 = 28%  (alongside; flasks are doing the work, as intended by B6-amended)
Same numbers within noise on earlier 36-fight runs: 69%, 72%, 73% (partial) - the 45-set was nudged up one notch to sit mid-band. Honest noise at 36 fights is +-8 pts.
Baseline at start: 47% (LOW -13). Fights 70-150 s.
Path: 47% -> (dmg -15%) 47% -> (hp 1850->1650) 58% -> (gaps +0.1) 58% -> (dmg -12%) 56% [dmg barely moved it under the dial] -> EXEMPT from the dial and authored numbers set to the effective ones -> 81% (too easy) -> 69% -> 72% -> 64%.

## NUMBERS (now authored, x1 - no dial)
hp 1650 (was 1850); gap 0.52/0.46/0.40 (was 0.75/0.65/0.55 under a x1.45 dial); dmg cut 45 lunge 49 double 31 step 49 lash 23 surge 41 spear 38 plunge 54
(was 30/32/20/32/14/26/24/34, under x1.7).

## DIAL-EXEMPT: YES (built)
Reason: the dial (act 4: gap x1.45, dmg x1.7) scales only idle clocks and never the told/open modes, so on a stance fight with 8 told moves it behaved unpredictably (my -15% and -12% damage cuts did not move the rate at all while it ran). Exempt, the authored numbers say what lands and the 4-attack-per-phase cycle reads true; same pattern as the other self-tuned bosses (DIAL_EXEMPT set). Trade-off: any later global dial change no longer reaches him - re-measure him with boss-rates if the dial is re-cut.

## LEVEL / SHRINES
Curve + level-1 pilot rows untouched and still pass (level-quality towpath: 35 blows, 8 deaths, curve 388% in band, mash level holds). Shrines: three at 154 / +148 / +135 route tiles (one after each exam + one before the boss) - A10c-conformant, no change.

## GATES (all green)
boss-openings, boss-read, tells (after --write), boss-fight-end (63/63), mash-gate (47 levels; boss row re-stamped 0/6: knight/warden/pyro all lose), level-quality towpath (clears), stuck (static + runtime), tools/towpath.mjs (311 checks).

## REDS
None. Practiced knight (5/12) is the weakest hero, a touch under the others; first-attempt 39% is below the band's spirit - that is the "you learn the fight" cost, left as is.

## QUESTIONS FOR DANIEL
1. Keep Fog Knight DIAL-EXEMPT? Rec: yes (built). If no, remove 'fogknight' from DIAL_EXEMPT and divide his authored dmg by 1.7 / multiply gaps by 1.45.
2. First-attempt 39%: acceptable? Rec: yes - it is a told-move stance boss; practiced is the standard.
