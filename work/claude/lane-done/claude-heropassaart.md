# claude/heropassaart - HERO PASS A ART (Sonnet art lane, 10-16)
Base: origin/claude/heropassa 1f9ac366. Port 8966. Art only - no numbers, boxes, costs or timers changed. Self-grade: **B**.

## DRAWN (every new move now has its own key; POSE_ALIAS stays only as a fallback)
| Hero | Move | Body (src/chars.js) | World FX (src/hero-pass.js unless noted) |
|---|---|---|---|
| Knight | SHIELD-STEP | kStep x3: plant, slide (shield square, bright rim bar, steel streaks), set (rim glint, heel dust) | shield face glows + rim bar + trailing steel ticks while the guard is up |
| Knight | SHIELD BASH | kBash x3: cock (kite hauled in), punch (flat, white rim, spark star), recover (ticks) | white/gold star at the rim on every hit |
| Knight | VALIANT STRIKE | valiant x4 (own heavy cut, gold aura along the blade, white core, drag, falling gold); main.js picks it when P.valiant && P.heavy | gold motes rise off the blade at a FULL bar (before the swing), gold bar through the air in the cut |
| Warden | LOW HOP | wHop x3: coil, tucked hop with the spear laid LEVEL (the read: a low blow goes under it), land | - |
| Warden | WALL PLANT | wPlant x2 (reach / driven, chips + flash) + wPerch x2 (bare-handed on the shaft, arms out; main.js line before wardPose) | proper spear-in-wall sprite (grip wraps, butt cap, leaf head in the stone with cracks), green shimmer while she stands on it, flash star on the drive |
| Warden | COUNTER-THRUST | (existing riposte thrust) | two green chevrons driven out down the line the foe is pushed |
| Warden | TIP 2x | - | star sized by the multiplier (x1.6 small, x2.0 big + second ring + pale line back down the shaft); main.js tipPay calls HPK.tipFx with the pay it computed |
| Pyro | EMBER BLINK | eBlink x2: out (flat streak, staff trailed, flare ahead) / in (belled, cowl back, flare burst) | rope of embers down the line she came, cooling white to red; the old fire-flag trail particles dropped (they bloomed into a huge blob) and the start burst cut 10 -> 6 |
| Freebooter | POWDER FLASH | powder x3: flask dashed down, hunched in a white-hot burst, out through the smoke with grit behind | 8-ray flash, then black powder smoke rolling forward and thinning |
| Death Knight | SHADOW-STEP | shadowStep x3: unmoor (shade at the feet), step (blade trails, dark ribbon down his back), reform | three fading shade figures down the step + a floor ribbon |
| Geomancer | STONE SHRUG | gShrug x2: hunched, stave across her shoulders, plates lifting then shut like a shell | six stone chips orbiting like shell plates with an amber seam (replaces the grey ring) |
| Berserker | SHOULDER BARGE | bzBarge x3: wind (axes hauled up/back), drive (head tucked, shoulder first, white bar, wind torn off), shove (impact stars, heel dust) | - |
| Ranger | ARROW SNATCH | rgSnatch x2: free hand shot out with the shaft closed in it, then drawn back across the string | (src/ranger.js) gold four-point star on the fist, ghost shaft drawn into the hand, ring (gold when it is flung back) |
| Ranger | KNEELING DRAW | rgKneelDraw x3 (on one knee, bow level and low, draw hand coming back, dust at the knee) | - |
Tools: tools/heropassaart-shots.mjs (in-game strips per move; not in the suite). Strips kept OUT of git (3 MB): bracken-lanes/scratch/heropassaart-shots/*.png. In git (600 KB): work/claude/heropassaart/before-greybox-aliases (the old borrowed frames) and after (the new key sheets, 4x).
Skill/trial icons: none added - the new moves are not skills (no skill ids, so skill-icons has nothing to wear) and the yard stations draw no pictograms, only text; nothing to hang an icon on.

## CHECKS (port 8966, one at a time, all exit 0 / GREEN)
hero-pass | one-dodge | ability-poses (76/76) | skill-icons | attack-animation | commitment | flip-actions | hero-trials | textfit hints,hud,practice,pick,tree,store --strict | mobile-perf. No test edited.
REDS: none.

## HONEST GRADE (B)
Good: every dodge reads as its hero at a glance (pyro streak + ember rope, the powder flash and smoke, the DK shade, stone shell, shield-first barge, level spear hop, shield with the bright rim); the knight, warden and ranger moves have bodies and an FX each; the pyro blink no longer blooms into a blob; the tip's size now matches its pay.
Not A: bodies are pixel work on the shared rig at ~16 px so the new poses differ by silhouette more than detail; the geomancer shrug and berserker barge are the weakest reads; the shade/powder smoke are blocky rects; the wall-plant FX only eyeballed once at 3x (the shot harness barely frames it); valiant glow strips not looked at closely at 1x; no sound added.

## QUESTIONS FOR DANIEL (rec = built)
1. The old pyro blink threw a large lingering fire bloom (fire-flag particles). Rec: keep the trimmed version (short ember rope + small burst). Alt: restore the big bloom.
2. Valiant: gold motes on the blade whenever the bar is full (a "you can" read), not just in the cut. Rec: keep. Alt: only during the cut.
3. Shadow-step shade figures are drawn dark and translucent over the world; on very dark levels they will read weak. Rec: keep, re-check on the night levels in the art audit.
