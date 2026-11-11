# CF1 IMPACT (the blow) - lane report 11-11
Branch claude/cf1 (base batch158 d674f4540). Code: src/cf-impact.js (new), main.js + audio.js hooks, tools/cf1.mjs. CF1_SHIPS = false; ?cf1=1 previews. Code-only, no browser proof yet.

## What changed (all `CF1_SHIPS`-guarded; OFF = batch158)
1. Skill class: SKILL_CLASS (real ids: lunge, whirlwind, shieldThrow, groundSlam, swordOfRealm, javelin, rainOfSpears, boulder, spikeRow, faultLine, avalanche, meteor, flashover). cdSet stamps P.cf1Skill/At; blowKind = cfClass(blowKind0(...)) raises light -> heavy inside 1.5 s of the skill (never a plain 'shot', never lowers, IMPACT still wins). blowKind0 = the old body.
2. Tick limiter in blowStop: one light stop per foe per 0.12 s (5 hits/0.3 s -> 3); a skill-raised heavy repeats at most per 0.30 s (whirlwind rings do not freeze 110 ms each). Flame ticks (P.jetHit never reaches blowStop): gated flash 0.06 + 2 ember sparks + SFX.cfSizzle, no stop.
3. Warden: TIP.stop 0.035 retired under the flag (the landed blow's light 65 ms follows); tip = star (heavy size) + 10 px ring; shaft = no star, thwack -3 dB / pitch x0.92 (tipPay stamps e.cf1ShaftT).
4. Lean: draw-only, 2 px / 3 px heavy toward face on the strike frame (frame 1), half on 2, 0 by 3; 0 under Reduce motion. No movement.
5. Charge read: glint particle at 50% charge; white tint flash on the hero at full (Flashes-scaled, Reduce motion none); heavy release = smear at full alpha for its first ~0.08 s (drawLightSmear spoofs the heavy as a light for the crescent).
6. Clink recover: ALREADY in batch158 (JUICE2 juiceproof-d: frame>=3 for 0.22 s, P.atk untouched). Nothing added; cf1.mjs pins it.
7. Sound: thwack opts = material pitch (flesh 1, wood .92, bone 1.1, steel/stone/shell/crystal 1.25) x third-cut +3 st x shaft; kill = SFX.cfBoom (70 Hz, 120 ms, music duck -4 dB 150 ms via duckBeat, called before hitFinish so its duck wins).
8. Shake axis: heavy kick 1.5 px, finish 2 px along the blow via shakeCam(0, k, 'land') (OFF / Reduce motion still 0).
Not done: src/attack-animation.js untouched (charge read lives in main.js draw + charge tick); no hitHeavy/hitFinish variation (thwack layer carries it). Ranger full-draw shots are not cdSet skills so no SKILL_CLASS entry (they ride tag 'heavy' already); knight's own cut-stage rings already give the 50/full read, so the generic glint covers pyro/warden/paladin etc.
Edited an existing check: tools/juice2.mjs two greps now accept `thwack(...,` (extra opts arg). Integration must keep that.

## Node results
- node tools/cf1.mjs: OK (OFF identity/no-ops, class table, limiter 5->3, jet gate, tip/shaft, lean incl. Reduce motion, charge, pitch/dB maths, kick, wiring greps, node --check of cf-impact/main/audio).
- node tools/juice2.mjs: OK. tools/juice.mjs is browser-based, not run.
- DISCLOSURE: I ran tools/demo-impact.mjs (exit 0) and tools/hero-pass.mjs (exit 1, output cut off; not compared with batch158) before noticing both use cdp = a headless browser, and skill-passives.mjs started one and was stopped. No chrome of mine is left running. hero-pass exit 1 needs a baseline compare, not necessarily mine.
- Offline audio peak render (finish thwack + boom + 4 hits + music): naive-sum assert only (0.76 < 0.9); real render owed.

## Browser proof owed (after release158, one browser, memguard, >= 1500 MB)
- juice.mjs + juice2.mjs + riposte.mjs + boss-openings.mjs + audit-feel.mjs, OFF == batch158 and ON (frame-sensitive: must be identical OFF).
- 5-hero strike strip (frames 0-4, lean visible on 1-2, none at 3) at default 60%; one 8 s clip per demo hero: light string, heavy, two skills, a glance - sound on.
- audit-feel ON table: the mapped skills read 110 ms; a whirlwind on a pack must not stutter; warden tip vs shaft clip (star + ring vs none, duller knock); a pyro jet on a foe (sizzle, no freeze); a kill (boom + duck, no clip); heavy release smear frame; charge glint/flash.
- n=6 knight wood + stockade OFF vs ON (expect identical).

## Questions (rec first; built as rec)
1. Whirlwind/rings: raise EVERY ring to heavy (built, limited to one per 0.30 s) vs last ring only? REC: as built; last-ring needs a skill-side flag.
2. Add a Ranger entry (rgVolley/rgRain)? REC: no, a volley is ticks.
3. Keep the old 14 px tip ring beside the new 10 px? REC: yes for now (reads as a ripple); drop if the clip looks busy.
