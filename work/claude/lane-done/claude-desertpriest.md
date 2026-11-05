# claude/desertpriest - THE DESERT PRIEST, the 12th hero (code-only lane, 11-05)

Branch `claude/desertpriest` off master 42a1d4cd, worktree `bracken-desertpriest`. NOT merged, NOT deployed. Code only: no browser opened (release gate running), tools/check.mjs not run.
Daniel 11-04 22:19: the 12th hero = DESERT PRIEST, unlocked from the desert arc. Kit = THE SUN PRIEST (docs/sun-priest-design.md, src/sun-priest.js). Hero id `sunpriest` (the reflect-kit row's id; `priest` is a foe type).

## Kit (src/desert-priest.js, numbers in `DP`; first picks, untuned)
| verb | input | what |
|---|---|---|
| staff run | X x3 | jab, sweep, the third a FLASH (x1.4, light a moment, singes the dead). The Pyromancer's staff boxes. |
| THE SUNBEAM | HOLD X | planted at 0.22 s (20 st), ROOTED, 8 st/s to hold; along the row to the first wall (UP: the column at x0.7). Stops at the first foe. k/s x swordDmg: living 0.8, dead 2.0, x radiance, x2 in SUNRISE. Burning something fills RADIANCE. |
| RADIANCE | - | 0..1: fills in ~6 s lit, drains in ~20 s dark. Blows and beam x0.75 empty .. x1.15 full. Lit = a level that is not dark (L.dark < 0.4 and not night), or main.js lightAt (candle/torch/lamp/fire), or his patch, his beam burning, the flash, SUNRISE, a SUN-LAMP. |
| THE DISC | tap C | his parry (shared beat RP_K.tap): yellow blow from the front turned; a missile met on the beat thrown back (reflectSeed / sendBoltHome). Off the beat: nothing. Red = TOO STRONG. |
| THE FLARE | hold C (0.22 s) | half the bar. Commons' wind-ups stopped (flinch) and dazzled 0.8 s; a boss/mini is only poise-leaned (never cancelled: boss law). For 0.2 s after, ANY blow (red, bolt) is turned. 8 s lock per foe. |
| CONSECRATE | DOWN+C | a third of the bar: 3-tile patch 6 s, mends 4/s, burns the dead 0.9 k/s. |
| SUNRISE (ult) | UP+C, full bar | ultRegister: 6 s, bar cannot drain, beam x2, mends 4/s. |
| SUNFALL | plunge | ring 26 px k 0.8 (dead x1.5) + a 2 s patch. |
| GLARE STEP | dash+X | DASH_STRIKE.sunpriest (the pyro's numbers, gold). |

L1-L25: 10 actives on the Ranger's ladder (L1 SUN SHARD, 3 HALLOWED STEP, 4 SUN-LAMP, 5 DAWN WARD, 7 PILLAR OF NOON, 9 MERCY, 12 GLARE, 14 SOLAR WIND, 17 HALO OF NOON, 20 THE BURNING EYE) + 21 passives in three trees DAWN / NOON / DUSK (design doc), capstones L22/23/24. Every one has a consumer (spTal / priestKit), a CD_MAX wait, a glyph row. Hero perks: SUNWARD, BRIGHT FLARE.
L25-50 (src/tech-priest.js, kfork's pattern): 25 THE SUN SPEAR; 30 FORK PRISM BEAM (offence) / HALLOWED GROUND (defence) "THE BEAM OR THE GROUND"; 35 ZENITH; 40 FORK BLINDING FLARE (control) / SOLAR RETURN (offence) "BLIND IT OR BURN IT"; 45 HIGH NOON; 50 FORK capstones ENDLESS DAY (close) / THE FALLING SUN (far) "HOLD THE DAY OR DROP THE SUN". 8 upgrades I/II. Every technique (both fork sides) and upgrade has its rule in the kit.
Master has no fork framework (it is on claude/kfork): progression.js registers `PRIEST_TECH_FLAT` (each fork's A, = kfork's techniqueFor). AT THE KFORK MERGE: change `sunpriest: PRIEST_TECH_FLAT` to `PRIEST_TECH` (one line, progression.js) and the B options become pickable.

## Wiring checklist
- [x] roster: hero-roster.js HERO_IDS + `PRIEST_SHIPS = false` + HOW line; progression.js HERO_IDS, hp 85, HERO_PERKS, TECHNIQUES/UPGRADES
- [x] unlock: flag false; lab unlock `SP_OPEN` = PRIEST_SHIPS || `?priest=1` || `?hero=sunpriest` (page only, never saved). Store/PICK/co-op list skip him otherwise. HEROES coinNeeds 'suntemple' (level not built -> coin road shut).
- [x] HEROES desc, HERO_LOOP, TBR/TREE_WHO, HERO_SHORT, pick LINES/ROLE (+HARDER), HERO_ARMS, HERO_COLOR (already reserved)
- [x] kit + resource + C verbs + ult + HUD bar/meter prompt + draw + clear on load + swing mul + third blow + staff boxes + dash strike
- [x] save: validateProgress accepts him (node checked); co-op: all state on P (P.sp*), runs through asPlayer like the Ranger's
- [x] skill slots: unchanged shared rule (1 slot, 2nd at L30) - his actives go through skillPress like everyone's
- [x] bots: lab.js LAB_REACH 30, DEFLECTS (taps the disc), ULT_BOT (SUNRISE), BK.spk()/BK.sp() for tools; bossLab `?boss=<id>&hero=sunpriest`
- [x] satellites: commit.js timings/roll, hero-move, riposte PARRY_LOOK/ART, finishers ABSOLVED, controls row, voice (paladin's), skill-glyphs
- [x] reflect-kit row: REFLECT_ROW + P.spFlareAt; flareTakes turns the blow (beat 0.2 s, r 48 = flareAnswer's). Owed at the demonking/reflectkit integ: in demon-king-hands, call `flareAnswer(SPK.flareAge(), dx, dy)` and RP.parried on 'power'.
- [ ] trial yard (trial_sunpriest), SIG preview clip, own SFX, own rig/poses/icons - owed

## Checks (node only)
- NEW tools/desert-priest.mjs: **82 ok** (radiance, beam stop/pierce/wall/cost, disc, flare incl. red + lock + boss lean, consecrate, sunfall, sunrise + falling sun, actives, ladder, fork pack shape, flag/roster/save, every hook once). Not registered in check.mjs (one-line add at integ).
- tech-cards PASS, progression PASS, coop-progress OK, talents OK, sun-priest PASS (it rewrites docs/sun-priest-rooms.md: reverted), keys OK, architecture OK, leveling OK after ALL_HERO_PERKS 18 -> 20 (ten heroes). node --check every src file OK.
- NOT run (browser): hero-roster, skill-icons, skill-passives, textfit, the suite.

## Browser owed
1. ?priest=1 pick + store card (textfit heropick: desc/loop/LINES), the HUD bar row. 2. `?level=<lit>&hero=sunpriest` and a dark level: the beam on screen, holding X does not re-fire swings, disc/flare/consecrate feel, SUNRISE tint. 3. skill-icons / skill-passives with his rows (actives fall back to FLAME_ICON). 4. bossLab n=6 on two bosses with the bot. 5. co-op P2 priest.

## Art owed
His own rig (now: bakePyro in SP_PAL ivory/gold, pyro poses flash/wall/ring/storm), beam/patch/flare/lamp/eye sprites (now rect placeholders), 10 active icons, voice + SFX, ABSOLVED finisher sig, trial yard art.

## Expected balance
85 hp (lowest; pyro 88), staff 13 x0.75..1.15 (= 9.8..15/blow; pyro ~10, ranger 16, geo 23). Lit: mid-pack melee + the best ranged answer to undead; dark: bottom third (x0.75 until he makes light). The FLARE (any blow turned for 0.2 s, half bar) is the strong card on bosses - watch it in the band runs. Target per design: within the spread lit, bottom third dark but not last.

## Questions (rec first, built)
1. Inputs: design had tap C = consecrate. BUILT: tap C = THE DISC (house rule: tap C is the ward), hold C = FLARE, DOWN+C = CONSECRATE, UP+C full = SUNRISE. Alt: tap C consecrate, disc passive on the beat of a swing.
2. Flare on bosses: BUILT: boss wind-ups only leaned on, never cancelled; the blow is still turned in the 0.2 s beat. Alt: a boss flinch with the 8 s lock (design's "stops a wind-up").
3. Unlock: BUILT clear THE SUN TEMPLE then 10 silver / 800 gold (design doc). Alt: beat the Fallen Sun Priest (boss feat, the Blood Knight's rule).
4. Beam stops at the first foe (design: piercing is DAWN's SECOND LIGHT). Rec keep.
5. Dark = L.dark >= 0.4 or L.night. Rec keep; desert levels set their own when built.
