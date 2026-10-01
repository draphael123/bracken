# EMBERFLARE lane (Sonnet): the Ember Ward becomes a timed flare

## What changed
The Pyromancer's EMBER WARD (src/ember-ward.js) was a half-dome you held up with DOWN: it blocked every yellow blow for as long as she stood there, ran on its own ward heat and overheated. Daniel called it "strictly better than a regular guard" and rejected every tuning lever. It is now the EMBER FLARE.

Input split (cleanest fit for current controls):
- DOWN HELD stays the plain universal duck (src/duck.js): a high blow goes over her. That is her sustained guard, unchanged. (She has no shield; C is her ember and jet.)
- A PRESS of down (the key going down) opens the FLARE, a 0.25 s burst round her. Held down flares once, at the press; to flare again, let go and press. A tap and a hold both work (the window is committed once pressed).

Numbers (all in `EMBER` in src/ember-ward.js):
- window 0.25 s. A yellow blow of ANY height, or a yellow projectile within 20 px, caught in it is cancelled; the attacker burns 1.6 s (the game's own f.burn); she gains 22 heat on P.heat (the real HEAT bar, via gainHeat, so variety scaling applies: measured +18.7 to +24). The flare is spent on the one blow, 0.3 s before the next press can flare.
- MISTIME: window shuts with nothing caught AND a live foe (same level, 160 px) or hostile projectile within 160 px: rooted and EXPOSED 0.5 s (blows cost x1.5), cannot re-flare; grey smoke ring, a grey recovery bar over her head, dull fizzle SFX. With nothing near, a flare costs nothing, so a crouch in a quiet place is not a trap (my call, see questions).
- RED blows break through, water stops it lighting (as before). Planted while it is open (vx=0); a hit or leaving the ground ends it with no penalty.
- Removed: the dome, ward heat meter, sputter, overheat burst/lock, the perfect-ward "flare" and returned ember projectiles.

Readable: a three-beat expanding burst (white core and thin ring, orange shell with flame licks, red dying ring), a white blaze plus second ring on a catch, grey ring + bar on a mistime. The existing "ward" pose (palm out) is used while the window is open and ducked; a tap-and-let-go uses the cast pose.
SFX (audio table, audio-assets green): new `emberBurst` (the press), new `emberFizzle` (the mistime, the only falling sound), kept `emberFlare` (the catch, the one that rings) and `emberMelt`. Removed emberWard/Block/Sputter/Overheat.
Text: hero card (main.js 'pyro' desc), controls card now lists `crouch HOLD DOWN` and `ember flare TAP DOWN AS A BLOW LANDS` for her only, teach hint (emberTeach) rewritten, docs/ability-audit.md, ability-preview.js gets a `flare` vignette keyed `emberFlare` (blow comes in, meets the burst, cancelled, post left burning). Lab bot (src/lab.js emberReady) now respects recovery/spent instead of lock/heat.

## Checks
- NEW tools/ember-flare.mjs (in check.mjs, replaces the old dome check). Asserts: press opens a ~25-frame window, a held key does not reflare; blow inside window (down held AND tapped) cancelled + attacker burnt + heat gained; arrow melted + heat; red breaks through; blow after the window lands (40 frames, 80 frames with down held, no press) with no scorch/heat; mistime = recovery, rooted, no re-flare, a blow in it costs more than at rest (14 vs 9); no recovery when nothing near; real topiary fight timed from a dry run (press 6 frames early: cancelled, burnt, +24 heat; 40 early: lands for 18); duck still lets a high swing over; knight C still blocks; no flare in water; other heroes unchanged.
- PROVED RED ON THE OLD CODE (before any src change): 17 assertions failed, e.g. "a press of down opened no flare window", "a blow 40 frames after the press did not land" (old ward blocked it), "a flare pressed 6 frames before the swipe did not cancel it", "a blow in the recovery cost 0 vs 9 at rest".
- NOTE: BK.sim steps 0.01 s, so the 0.25 s window is 25 frames in the check.
- GREEN: ember-flare, settings-tabs (updated: ember flare row TAP DOWN beside crouch HOLD DOWN), duck, skill-icons, skill-menu, skill-passives, store-preview, store-ui, textfit, hint-shown (silent list shrank by one: "OVERHEATED" gone, --write run), audio-assets, attack-animation, ability-poses, hero-trials, dangling-paths, architecture, syntax.

## UNVERIFIED
- Never looked at the flare in a rendered frame (no capture, slim-cost rule): the draw code is geometry only; the timing and sizes are unplayed by a human. The `flare` ability-preview shape is not reachable on screen: the ward is innate, not a catalog skill, and the preview is keyed by skill id (it falls back harmlessly; store-preview green).
- Pilots not run (pyromancer-pilot, ember-pilot, pyro-duel) - they were not requested; the lab bot's new plan (tap in the last 0.1 s of a yellow windup) is untested against bosses and may need tuning.
- The old per-run `PROG.emberTold` teach hint is not shown unless something calls emberTeach (it is, from the windup line at main.js ~21988); text updated, not seen.

## QUESTIONS FOR DANIEL (each built with the recommendation)
1. She now has NO sustained block at all (the plain duck only dodges high blows; she has no shield). Daniel said "the regular guard stays": for her that is the duck. Recommendation (built): leave it; she is the glass-cannon who must time the flare. Alternative: give C-less sustained half-block on a held duck.
2. Mistime penalty only counts if a threat is within 160 px (otherwise free). Recommendation (built): keep, so idle crouching is not punished. Alternative: always punish (harsher, more "real").
3. Is 22 heat per catch right? Five catches fill the bar and bank THE PYRE. Recommendation (built): 22; lower to ~15 if the pyre comes too easily in boss fights.
4. Window 0.25 s, recovery 0.5 s at x1.5 damage. Recommendation (built): keep for a first playtest; widen the window to 0.3 s if it feels too strict at the 100-ms-human level.
5. Should the flare also work while running (it plants her: vx=0)? Built: yes, any grounded press. Alternative: only stood still (as the old ward required).
6. Should the flare have a skill-store/catalog entry (so the ability preview vignette can show it)? Recommendation: no, keep innate.

## UPDATE (Daniel's answers): the weak plain guard
- Q1 answered: HOLD DOWN after the flare = a WEAK PLAIN GUARD. Built in src/ember-ward.js `guardTakes` (called from damagePlayer0 AFTER the duck check, so a high blow still goes over her first): down held, ducked, no flare open, no mistime recovering. A yellow blow from the front costs half (rounded up, EMBER.guardTake) - the game has no literal "chip" for a plain guard, its convention for a guard that is not whole is "half the blow" (the knight's low guard and the geomancer ward on a guard break), so I used it; she is not flinched differently from any half-blow. NO heat, NO scorch, no flare. Red and piercing blows come through whole; a blow from behind too.
- The mistime's 0.5 s recovery (rooted, x1.5) comes BEFORE the guard can come up. Press = flare as built; Q2-6 unchanged.
- Cards: the controls card row for her is now `weak guard HOLD DOWN` beside `ember flare TAP DOWN`; hero card says "hold down after it: a weak guard, half of a yellow blow".
- ember-flare.mjs asserts: held guard chips a yellow blow (4 lost vs 9 unguarded), no heat, no scorch; red costs 9 (whole) and counts as through; a blow 40 frames after a mistime with down held costs 14 (guard delayed); a blow 95 frames after (recovery over) is guarded (4).
- QUESTION: is half the right "weak" share? Recommendation (built): half; use a third if she should be softer than the knight's guard on a break.
