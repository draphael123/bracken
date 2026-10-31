# claude/bellshort - BELL SHORTEN (sonnet polish lane, 10-31). Branch claude/bellshort, base 416af6c2, HEAD c0934fb7. Not merged, not deployed.

## Headline: I could NOT find the 3-4 s hero lock in the code
I searched every bell in src/ (shared and per-level/boss). At this base NO bell grabs, stuns or carries the hero for more than ~1 s:
- A bell blow goes through damagePlayer0: P.hurt = 0.35 s, inv 0.8 s, knock 150 px/s (an airborne arc of about 0.5 s). Nothing bell-specific extends it.
- Goblin priest HAND BELL (main.js PRIEST.bellKnock 150), Hush BELLMAN handbell (vx 140), Abbot KNELL (damage only), Bellguard knell/hook (damage only), Sexton TOLL (damage only), Temple Guardian toll (damage only): all ordinary 0.35 s hurts.
- The only bell-driven hero carry: Sexton BELL PIT throw, P.pitCarry t = 0.7 s.
So the 3-4 s Daniel saw is probably (a) a bell's SWING/ring state that keeps going on screen (tide bell/knell swing decayed over 1.43 s; monastery/granny bell swing 1.2 s; Temple Guardian toll swing 1.8 s), or (b) a bell effect that lives in code not on this base (claude/kitchengate4's ORDER UP hook-rail ride is not in batch133 - base grubbag.js bell is only line speed x2.2 for 7 s + 2 attendants, nothing on the hero), or (c) the Lance's bell-gate pin of the BOSS (LANCE_GATE.pin 3.4 s - a boss opening, not a hero lock). Please tell me which level/boss it was if it is not one of these.

## Done (shared constant, code-only)
- NEW src/bell-lock.js: BELL_LOCK_MAX = 1.0, bellLock(t) = min(cap, t). One number for any bell swing / carry / lock.
- main.js: Sexton bell-pit carry capped via bellLock (0.7 -> 0.7, guarded); tide bell + knell (Cause tide, Kraken) swing decay now dt / BELL_LOCK_MAX (1.43 s -> 1.0 s); monastery bell strike swing and the second bell-prop swing 1.2 -> bellLock(1.2) = 1.0 s. Import added at line 77.
- hush-hands.js: Grandmother bell-pull swing 1.2 -> 1.0 s. (pullCd, chime noise, damage unchanged.)
- tools/bell-lock.mjs: static check (node tools/bell-lock.mjs, 5/5 ok) that the caps stay in place.
Damage numbers: NOT touched anywhere. Impact, sfx, ring, shake, hitstop untouched.

## Not changed on purpose (boss rate may move - decide)
- Temple Guardian (src/temple-guardian.js TG.swingT 1.8): the guardian's toll sets its bells swinging 1.8 s during which they cannot be struck (a stagger window gate). Cutting to 1.0 s lets the player re-stagger the golem sooner = easier boss. Left; RECOMMEND 1.0 only with a boss-rate re-tune.
- Lance bell-gate pin LANCE_GATE.pin 3.4 s and GQ grate hold 3.5 s: boss/foe openings, not hero locks.
- Kitchen Gate (claude/kitchengate4): its ORDER UP bell (hook rails x1.6, hero-carrying hooks) is in kitchen files - NOT edited. FOLLOW-UP for kitchengate4: clamp any hero hook-ride/stick from the bell to bellLock()/BELL_LOCK_MAX (import from src/bell-lock.js) and keep the ride's red stretch readable.

## Tests / runs
- node --check on bell-lock.js, hush-hands.js, main.js: ok. tools/bell-lock.mjs: ok. tools/check.mjs NOT run.
- RAM was 1305 MB free (< 1500): no headless browser, no before/after clip.
- RUNS STILL NEEDED: one headless pair on the Cause tide level (strike a tide bell, read pr.swing to 0 after 1.0 s) and a Sexton pit throw frame count; a tide/knell visual check.

## Questions
1. Which bell/level gave Daniel the 3-4 s? (If it is Kitchen Gate hooks, kitchengate4 owns it.)
2. Temple Guardian swingT 1.8 -> 1.0 together with a stagger re-tune: yes/no?
