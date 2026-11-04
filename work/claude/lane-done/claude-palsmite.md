# claude-palsmite - Paladin 3rd hit = COMBO FINISHER SMITE (Daniel 11-04)
Status: built, node --check clean on src/main.js + src/holy-ground.js. NOT browser-tested (gate running).

## Changed
- src/holy-ground.js: HG.smite3 = { windRate 0.8, stagger 0.8, bossStagger 0.3, bossChip 0.35, poise 10, conv 0.5 }.
- src/main.js:
  - startSwing: P.palSmite3 on the Paladin's 3rd ground cut (not heavy/riposte/dash/rise); a gold ring + motes at the hammer head as the tell, pose smiteQ.
  - swing clock: wind-up pace x0.8 on that swing (Paladin base 0.56).
  - palSmiteRider (heroCut): holy flash (HFX.flash) + rings + sparks + judgement sound, all FX under fxRand (game dice untouched); +0.5 pip Conviction once per swing; boss/mini: hurtAs('light') chip x0.35 (boss resists still apply, floor holds), stagger 0.3 s, +10 poise lean; a GUARDED boss gets none of it (no guard break, no extra chip).
  - normal foes: third-cut stagger 1.2 -> 0.8 s for the Paladin (shared line). Hitbox unchanged.
  - first-time hint line for the Paladin's third swing.
- Co-op: all state on P (per seat); no shared globals added.

## Numbers (flag for tune lane)
windRate 0.8, stagger 0.8 s, boss stagger 0.3 s, boss chip x0.35 swordDmg, poise 10, Conviction +0.5 pip/swing. AFTERSHOCK talent untouched.

## Owed
Browser look (tell readability, flash), boss win-rate re-check with paladin (chip is small), Conviction pacing.

## Questions (rec first)
1. Conviction +0.5 pip or +1? Rec 0.5.
2. Keep AFTERSHOCK on the same swing? Rec yes.
3. Updated hero desc text in HEROES paladin line not changed. Rec: add a clause at next copy pass.
