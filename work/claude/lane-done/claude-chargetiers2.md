# claude/chargetiers2 - RANGER FAN + THE WHEEL + Berserker Tusker check (sonnet, 10-22)

Base claude/chargetiers f19e8347. PORT 8789. Fallback pointer: claude/rangerfan = ab00144a (Ranger only). Whole branch is the deliverable (BATCH115).

## RANGER T3 = THE TRIPLE SHOT (3-arrow fan; replaces the pinning shot)
- Three arrows from one full draw (RG.fan in src/ranger.js): vx 560 flat, g 40, spread tan 0.05 (+-3 degrees: vy -28/0/+28; at 150 px +-8 px, at 250 +-12 px), range 250 (x1.25 FOCUSED), **1.2x per arrow** (3.6x if all land) vs PIERCING 2.0x, LONG 1.7x. Middle arrow is heavy-tagged and a real quiver arrow (lies where it lands, gives focus); the two flankers are free (cost = ONE arrow). FOCUSED = x1.3 each, a quarter further. Wind 13, tier arrives 1.61 as before.
- Nothing is held or pinned. Pin code removed (pinHit, RG.pin, NAILED/CHECKED, api.pinFoe/poiseMax exports, pin stats, bodkin render). Fan arrows draw an amber trail + white core.
- Not VOLLEY: VOLLEY is a button skill, three light (1.0x) free arrows lobbed in a WIDE arc. The tier is tight, flat, fast, heavy, from the held draw. Tier name TRIPLE SHOT (not FAN, so it does not echo VOLLEY's text). VOLLEY desc tweaked: "three arrows lobbed at once in a WIDE, arcing spread...".
- Poses rgDraw3 / rgKneelDraw3 / rgLoose3 redrawn greybox with three nocked amber heads. Text: hero desc, pick card (HOLD X: LONG SHOT, PIERCE, TRIPLE), shot/focus teaching lines.
- Hands (lab.js): level - elite/plate/shell/beast -> T3, two in a line -> T2, else T1; boss - T3 only in a long break window (>2.2 s), else the quicker PIERCE.
- Caveat: a very small foe (a sprig, ~8 px) is only hit by the middle arrow plus one flanker at 90 px; the check uses a 28 px foe.

## RANGER BOSS RATES (boss-rates practiced, human, kit flasks, campaign level, n=12)
| row | master (before) | pin build (n=24/12) | FAN |
|---|---|---|---|
| wood | 6/12 | 9/12 | 6/12 (7/12 after the boss-hands tweak) |
| stockade | 8/12 | 9/12 | 9/12 |
| burning | 11/12 | 11/12 | 11/12 |
| marsh | 12/24 | 10/24 | 3/12 (2/12 after tweak) |
Marsh 3/12 is NOT the fan: the untouched pin base f19e8347 measured 3/12 on the same machine today (marsh draws are rare, and the row is noisy: 12/24 earlier). Wood back to master level (the pin's break-bar bite is gone). Hero-only rates, no boss number changed.

## THE WHEEL
Berserker T2 renamed THE WHEEL everywhere player-facing (hero desc, tier meter name, comments, test text). Ids unchanged. NOTE: the Warden already has a bought skill called THE WHEEL (different hero; see question 2).

## BERSERKER vs OLD TUSKER (wood, L3, human, kit flasks, n=12)
| hands | wood | marsh |
|---|---|---|
| master (old hands, self-firing chops) | 4/12 | 5/12 |
| tier hands, EXACT release (chargetiers) | 12/12 | 11/12 |
| tier hands + HUMAN SLOP (new) | **11/12** | 8/12 |
| + Ground-Splitter trimmed 1.35/1.5 -> 1.2/1.2 | 11/12 | 6/12 |
- The human-like hands (bzLetGo in lab.js): each wind rolls 35% one tier lower than the fight asks and 0-0.3 s late. Wood only 12 -> 11, so it is not release precision.
- Trimming the Splitter's mass/poise (1.35x/1.5x poise -> 1.2/1.2) changed nothing on the wood (92% either way), so the tier is NOT what makes Tusker trivial; **trim reverted, tier numbers unchanged**. The old 4/12 was the old hands chaining self-firing heavies (bot artefact), so Old Tusker is simply a soft boss for the Berserker's bare kit. Knob if Daniel wants it lower: the boss (Tusker's HP/ram window), not the tier.

## CHECKS (PORT 8789)
GREEN: ranger (TIERS block rewritten for the fan), geomancer, blood-kit, hero-trials, ability-poses, textfit store,pick,tree,hud,hints,trial --strict (1117 screens, 0). Syntax via the checks.
RED, pre-existing on master: berserker `double chop ... 57.6 < 60`.
Not run: full suite (nightly).

## QUESTIONS FOR DANIEL
1. Tier name TRIPLE SHOT (REC + BUILT) vs FAN SHOT. 
2. THE WHEEL is also the Warden's bought skill name. REC: fine (different heroes) - or call the Berserker's tier THE WHIRL. BUILT: THE WHEEL as decided.
3. Berserker's Old Tusker stays ~92%: REC retune Tusker (not the tier) in a boss lane. BUILT: nothing changed.
4. Fan arrows 1.2x each: raise to 1.3 if T3 does not feel worth the extra half second over the pierce.
