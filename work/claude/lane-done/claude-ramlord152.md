# claude/ramlord152 - Ram Lord under the A13 ceiling (6000 -> 5000), sonnet lane
Branch off master 923e8ad42. NOT merged, NOT deployed.

## Change (src/ram-lord.js, one bestiary line in src/main.js)
hp 6000 -> 5000 (A13: no boss above 5,000 base HP); stunMul 6 -> 4 and crashMul 6 -> 4 (opening pay trimmed; 4 is the floor tools/ram-lord.mjs pins). paceExtra, wards, frontMul 0.4 unchanged. Bestiary: 'six times over' -> 'four' (wall crash), 'SIX' -> 'FOUR' (stun).

## Rates (flasks kit, profile human, normal, L10, n=6 per hero: knight/warden/pyro; wins k/w/p)
| candidate | practiced | built | fight s (mean / median) |
|---|---|---|---|
| baseline 6000, x6/x6 | 3/6 6/6 6/6 = 83% | 6/6 5/6 6/6 = 94% | 56-63 / 51-54 |
| C1 5000, x4/x4 (CHOSEN) | 4/6 4/6 6/6 = 78% | 5/6 1/6 6/6 = 67% | 65-72 / 62-65 |
| C2 5000, x4/x4, paceExtra [.3,.2,.1] | 3/6 5/6 6/6 = 78% | 4/6 4/6 6/6 = 78% | 68-71 / 67-74 |
4200 not tried (not needed: the 5000 + pay trim already lands the built way on 67%). Raw rows: scratch\lane-reports\ramlord152-data\.
The stale premise: the baseline is HIGH (built 94%), not in band; the smallfix3 '69% at L9' number no longer holds at L10 (the boss bot got better / the kit is richer). So the cut is a harder boss, not an easier one.

## Checklist on C1
boss-read ok; boss-openings ok (first run: transient 'page CRASHED', passes on rerun); ram-lord ok; ram-bank ok (crash daze 3.0 s, bank 3.8 s); scree-rework ok; boss-fight-end scree ok (run on scree only via a throwaway wrapper; the tool has no filter); mash-bot scree 0/6 (boss left 83-99%). hud-default ok; popclutter ok (max 4 floaters, 0% frames > 3); textfit card,store,pick,hud,plates: 2563 screens, every class 0. Not run: coop-boss-rates (see Q3), the full suite.

## Open items (honest)
- Fight length is still BELOW 90 s: mean ~70 s (baseline ~60). Adding rest (C2) barely moved it. Length is set by the flask-fed bot's damage rate; to reach 90-150 s the boss needs more to DO (an extra phase-2 move or a third overhang cycle), not more HP. Not done; recommend leaving.
- Warden built is 1/6 on C1 (4/6 on C2, 5/6 at baseline): sample noise or a real warden problem on the stun window; n=6 cannot say. Pooled 67% is inside the band, but its interval is wide [44-84].
- Practiced (the standing way) is 78%: still HIGH by ~8 pts, but down from 83%.

## Owed browser stills: done (scratch\stills-ramlord152\*.png, 3x)
Looked at: hud-plate-knight-full (10), hud-plate-knight-50 (5), hud-plate-bloodknight-50 (4.8 with debt), floaters (1.1, 0.2, -1.4, gold 10, +2.8 all right), bossbar-num-scree (331/534 in the 8px row, fits), levelup-card-L12 and -L4 (VIGOR +0.8 HEALTH, MIGHT HARDER BLOWS, 2-line perks fit), store-tab0-3 (Freebooter blurb '9 HEALTH' reads fine).
Notes: (1) the HP number sits tight against the bar's right end ('10|' touches the last segment): readable, a little cramped. (2) the 108 floater and the countdown '3' were dropped by the six-at-once cap in my synthetic still, not a bug; the helper table covers them (tools/num-display.mjs). (3) hud-minimal still shows the plate (my readSettings call did not switch it); hud-default covers MINIMAL and passes. (4) hero picker stills came out as the NEW SAVE prompt (wrong stage) and the level-up hint line and rum skill info were not shot; textfit pick/card reports 0 overflow for them. Hornet Queen / Tomb King bars not shot; Rookery boss bar shot (bossbar-num-rookery).

## Questions for Daniel (rec first)
1. Ship hp 5000 + x4/x4 (REC: yes; meets A13, built 67%) or keep 6000 and waive A13 for the Ram Lord (baseline is 94% anyway).
2. Fight length 60-70 s vs the 90-150 s target: accept (REC) or add a phase move (a later lane).
3. coop-boss-rates scree at 2 seats: run after you pick (REC: only if you ship).
