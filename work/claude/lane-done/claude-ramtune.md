# claude/ramtune - THE RAM LORD TUNE (lane 10-15)

## What changed (src/ram-lord.js, src/main.js)
- crashMul 1.5 -> 4, stunMul 2 -> 4 (openings pay x4; he drags no more).
- Front horns no longer swallow a blow: melee from the front lands at RAM.frontMul 0.4 (clank + GO ROUND kept, hurtAs path so greed still counts).
  The ward (wardT 3 -> 2 s) lets x0.4 through too (melee and plunge); fire/ball in his hide lands x0.4 (was "HIS HIDE TURNS IT" = 0); burnMul 0.35 -> 0.4.
- Behind / flank / above he is now cut WHOLE (was ANGLE.mul 0.5), so going round is worth more than the horns (front 0.4 vs flank 1.0).
- hp 1950 -> 3600.
- boss-read.mjs states the design change (front lands at frontMul; fire lands). tools/ram-lord.mjs updated: front/ward land at x0.4, never 0; it resets the poise bar before the ward step (a landed front blow now fills the poise bar like any boss's).

## Rates (campaign L7, profile human, kit flasks, practiced, 12 seeds, --jobs=1)
- hp 3600: knight 7/12, warden 5/12, pyro 12/12 = 24/36 = 67% in band; fights 36-120 s (knight/warden 46-120 s, pyro 36-79 s - the burn is fast).
- DRY (human+dry, 6 seeds): 2/6, 2/6, 5/6 = 50%.
- Tried: hp 1950 (old, new multipliers) knight ~9/10 in 35-65 s (too short); 4500 = 56% (3/6 1/6 6/6); 4000 = 58% (4/12 6/12 11/12); 3600 = 67%.

## Checks (single checks, no full suite)
mash-bot scree 0/6 (heroes all lose; row not re-stamped, level data unchanged, mash-gate green), boss-read ok, boss-openings ok (one transient red `diff: 'simple'` on the first run under load, green on rerun with exit 0),
boss-fight-end ok (63 fights), ram-lord ok, ram-bank ok, scree-rework ok, boss-greed ok, level-quality scree ok, reach-heroes scree ok, textfit --strict (scoped list) 0 findings.
Reds: none.

## QUESTIONS FOR DANIEL
1. Fights run 46-120 s for knight/warden and 36-79 s for the pyro (fire bypasses the horns now at x0.4 and burns on). Rec: keep as is (in band). Built: hp 3600. Option: raise hp to ~4000 (58%, fights ~80-150 s) and lift knight/warden odds another way (stun window).
2. Flank/behind/above now cut him whole (was half). Rec: keep (makes the angle worth it vs the 0.4 front). Built: whole.
3. A front blow now fills his poise bar like any boss's (before, front blows never landed). Rec: fine, it is the shared boss rule (heavies only outside openings). Built: unchanged shared rule.
