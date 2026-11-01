# claude/heroblocksb - HERO BLOCKS B (Warden spear-haft brace, Ranger bow guard)
Branch claude/heroblocksb off master 416af6c2 (BATCH133). Not merged, not deployed. Daniel approved both 10-30 22:15.

## Built
**WARDEN - HOLD C = SPEAR-HAFT BRACE** (new src/warden-brace.js, wired in src/main.js). Tap C is still the deflect, untouched.
- Held past 0.2 s the haft is planted (the pose chars.js already had as F.block: heel in, point levelled, both hands on the haft). Slow walk (32 px/s like a shield), no jump block, a swing/roll drops it and a still-held C re-raises it.
- Turns any YELLOW blow from the FRONT (no beat to hit). Chip = 1.6x the knight's block cost (12-dmg blow: warden 18 wind vs knight 11). Drain 0.8x the shared hold drain; no stamina regen while braced. Out of wind the haft BREAKS (half the blow, stagger, exhaust, tired 1.2 s) like the knight's guard.
- RED blows, crossbow bolts (THROUGH THE HAFT), blows from behind are not turned (the two NOs every guard has).
- CHARGERS IMPALED: while braced the point is watched every frame with the existing set-spear rule (crouch-a.js setWatch: BRACE_STOPS default-deny list + yellow told charges); a yellow charge that lands ON the haft in the same frame is turned AND impaled (BRACE_STOPS or a charge-named mode, coming fast, on her level). Boss/mini = a plain hit off the haft, never impaled (B3/B13). Red charge runs through.
- Feel: shared JUICE block row (50 ms stop, shake 1.5, steel impact + ring), heavy variant for 20+ dmg (80 ms, shake 3, 9 sparks, slides her 0.3x a shield's push), SFX.block + SFX.shaftTurn, word BRACED; impale = the existing IMPALED/BROKEN/ring/hit-stop; planting plays braceSet + dust + ring. HUD hint: 'TAP C  DEFLECT   HOLD  BRACE' / 'BRACED'. Said twice in words per save (braceLesson).
- Not while drinking a flask (no protected drinking).

**RANGER - HOLD C = BOW GUARD** (src/ranger.js guardStep/guardTakes). Tap C = bow-bash + arrow snatch, untouched.
- Held past 0.24 s the bow comes up across her front (new F.rgGuard, 2 frames, chars.js). Slow walk; not while drawing/nocked/flipping/up+C mark/down+C snare/drinking; a swing/roll/flip drops it; held C re-raises.
- PROJECTILES from the front (any seed in flight, main.js hands them in as geo) are stopped DEAD for ~4 wind (0.4x block cost, min 2), 'STOPPED', rgPick + block sound, 45 ms stop. BLADES from the front cost HALF the blow and the shield's wind (she still staggers/knocks back like the pyro/geomancer 'half' guards), 'HALF'. Red, bolt (THROUGH THE BOW), behind: not turned. Out of wind it gives: whole blow, stagger, exhaust, tired 1.2 s.

Shared: walking cap, stamina-regen pause (commit.js regenPaused), controls card rows ('deflect / brace', 'bash / guard'), HERO_LOOP lines, WARDEN_KEYS.brace, BK.wardenBrace() read, reset on P reset.

## Controls / help changes
- src/controls.js card: warden 'deflect / brace  TAP C DEFLECT, HOLD BRACE'; ranger 'bash / guard  TAP C BASH, HOLD GUARD' (the phalanx tap stays in the HUD hint / WARDEN_KEYS).
- main.js HERO_LOOP warden + ranger lines, WARDEN_KEYS.brace, HUD hint, braceLesson hint. No existing tool asserted the old text (grepped tools/): settings-tabs.mjs (card rows) green.

## Tests (all green)
- NEW tools/heroblocks-b.mjs (warden,ranger,shots): tap=no brace; hold timing; front turn + wind price (18 vs knight 11); behind/red/bolt through; haft/bow break; release; swing drop + re-raise; goat AI charging onto the braced point = impaled + broken 2.18 with 0 damage; charge landing on haft = blocked + impaled; red charge through; ranger arrow in flight bare 14 dmg vs guard 0 dmg/9 wind; projectile 0 dmg for 4 wind; blade half.
- tools/hero-pass.mjs warden,ranger (counter-thrust, wall plant, arrow snatch): every promise holds. tools/settings-tabs.mjs ok. tools/tells.mjs: every mark agrees. node --check on all touched files. Not run: tools/check.mjs (per brief).
- Screens: work/heroblocksb-shots/ (on the branch, 2x) warden-brace.png, warden-impaled-goat.png (IMPALED + BROKEN words), ranger-bow-guard.png, ranger-arrow-stopped.png. Copies in scratch/lane-reports/heroblocksb-shots/.

## Boss rates (human profile, flasks kit, campaign level, practiced, 4 seeds, normal) - branch vs master
| boss | warden | ranger |
| rookery L14 | 1/4 (25%) | 1/4 (25%) |
| warcairn (Chieftain) L21 | 3/4 (75%) | 2/4 (50%) |
Master 416af6c2 gave the SAME fight results seed for seed (spot check: the bots only TAP C - DEFLECT_TAP f%8<2 / ON_THE_BEAT - so they never reach the 0.2/0.24 s hold; the fights are deterministic). So no regression, but NO new data on the brace/guard either; n=4 is noise (the polish targets Rookery 50% / Chieftain 29% are master numbers from other runs, not re-measured at n>4 here). Rookery 25% is the low-side of that noise.

## Runs still needed
- A bot that HOLDS the brace/guard (lab.js SHIELDED is knight/paladin/reaper/geomancer; warden/ranger are in DEFLECTS taps) - not built; to measure what the new blocks do to boss rates, add a lab policy ('brace on a yellow charge / guard on an arrow volley') and re-run rookery/warcairn n>=12. Left alone so as not to move any tuned boss band.
- Daniel's hands: the feel of the 0.2/0.24 s hold threshold against a mashed C (a tap-then-hold deflect also plays the sweep first: cost 9 wind).
- Impact-matrix rows 3.1 for these two heroes (hit-stop/sound listening pass) once the shared 'block recipe' (outlier #11) lands.
- Full QUICK gate before merge.

## QUESTIONS FOR DANIEL (rec + what I built)
1. Crossbow bolts: they go THROUGH both new guards (the global pierce rule). 'Projectiles FULLY blocked' for the ranger - should the bow guard stop bolts too? Rec: no, keep the one rule everyone is taught. BUILT: through.
2. Ranger melee 'half': the half blow still staggers and knocks her back like the pyro/geomancer half guards. Rec: keep (a guard that took the hit cleanly would be a second knight). Alternative: no stagger on a half.
3. Warden brace cost 1.6x a shield, walk 32 px/s, hold 0.2 s: confirm in play; the tap deflect's cost (9) is paid on the press that starts a hold.
4. Blows hitting her from directly overhead (fromX == her x) count as front for both guards (the existing convention); real overhead blows are only turned by the deflect's sweep.
5. Non-seed projectiles (boss cannonballs, thrown axes that call damagePlayer without geo) are treated as blades by the bow guard (half). Rec: audit which of those should carry geo in a follow-up.
