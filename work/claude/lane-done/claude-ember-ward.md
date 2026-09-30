# claude/ember-ward - THE PYROMANCER'S EMBER WARD (her crouch)

Base: master d78b15e (batch46, with the universal duck, src/duck.js). Opus lane. Design as Daniel approved it ("I like it").

## What changed
- **Her duck is a shield of fire.** Down held on the ground, stood still: the pyromancer ducks exactly as every hero does (hurt box
  DUCK_H, a HIGH blow still goes over her for nothing) AND a low half-dome of flame rises round her (src/ember-ward.js, new module;
  main.js only calls it). It covers both sides (a dome has no back).
  - **Blocks YELLOW blows**: the blow is turned ('blocked', counted as a block), the attacker is SINGED (a 0.9 s burn) if within 40 px.
  - **Melts projectiles** that enter it (radius 16 px from her feet - over her crouched head, the height a level arrow flies at):
    arrows, bolts, stones, nets, webs. A drowned knight's chain is left to reach her body, where the ward blocks it as a blow.
  - **WARD HEAT**: +24 per blocked blow, +14 per melted projectile. Cools 40/s only while the ward is down (after 0.35 s).
    Its own meter, separate from her HEAT bar (the ember/jet/pyre fuel is untouched).
  - **Sputters** from 70: the rim gutters with gaps, sparks spit off it, it pops (SFX), the meter blinks, "SPUTTERING" once.
  - **OVERHEAT** at 100: it bursts (a 46 px ring: foes knocked back 260 and scorched, 4 damage, a short burn; projectiles near her
    burn up), she STAGGERS 0.45 s (P.hurt), the ward is LOCKED 1.2 s ("TOO HOT" if down is held), heat back to 0.
  - **PERFECT WARD**: raised 0.16 s or less before the blow lands - and only if it had been down 0.3 s first, so mashing down is not
    a parry - it FLARES: the attacker takes ~0.9 of her swing, a 2.2 s burn, and is thrown back 220 and staggered 1 s (a boss or a
    mini is only checked, 0.35 s, as a knight's parry checks it); a projectile goes back at whoever loosed it as an EMBER (it burns
    what it hits); the ward VENTS 50 heat. Counted as a parry (parries, P.parryT, trialEvent('parry')).
  - **RED breaks through** (unblockable blows and noBlock/unblockable seeds), "THROUGH THE WARD".
  - **Water puts it out**: stood in any pool (wading too) it will not light ("NO FIRE IN THE WATER"), one that was up goes out in
    steam ("THE WARD GOES OUT"), and the heat is quenched.
  - **She can turn, not walk**: left/right while warded face her about; she does not move.
- **Art** (src/chars.js bakePyro, new pose `ward`, 3 frames in the house pyroFrame style): crouched, staff slung back, the free palm
  pushed out with fire in it (two beats that flicker faster when sputtering), and the FLARE (arms flung wide, cowl back, sparks).
  The dome, the sputter, the overheat shell and the meter are drawn by the module (EMBER.draw), after the hero sprite.
- **Sound** (src/audio.js, synth only): emberWard (raise), emberBlock, emberMelt, emberSputter, emberOverheat, emberFlare; the
  water uses the existing hiss.
- **The heat meter's spot**: a 16x2 bar just over the top of the dome, over her crouched head, with a notch at 70 (past it, it
  sputters); grey and emptying while locked. Over her head is the one place nothing else of hers is drawn while she crouches; in front
  is where the blows come from, and the HUD's HEAT bar is her other fire.
- **Tells**: no new mark. A yellow ! already means "block it", and for her the block is now the ward, so it reads right. What was
  added is the TEACH: the first yellow tell near her in a level says "A YELLOW MARK: HOLD DOWN AND YOUR EMBER WARD TURNS IT. RAISE IT AS
  IT LANDS AND IT FLARES." (twice a save, once a level, like the duck's hint). The duck lane (down arrow) still shows on high blows.
- **The bot** (src/lab.js emberPlan/emberNow): against a common foe, on a yellow windup near her she stands still ('wait') and raises
  the ward in its last 0.1 s ('raise') to flare, holds it at least 0.45 s (the swing lands a beat after the windup), and raises it for
  a yellow projectile 0.1 s out. At 70 heat, locked, wet or off her feet she does what she did before (the roll). Boss frames use only
  'raise' (a boss plan is left alone). The duck is unchanged: a HIGH yellow blow is still ducked early, which is warded anyway.
- **Other heroes unchanged.** tools/duck.mjs's "blows" section moved from the pyromancer to the warden (it needs a hero with only the
  duck between her and the blow; the pyromancer's duck now blocks and melts); its "no duck while walking" allows the pyromancer's
  turn-in-place ward (she must not move, checked).

## Checks
All green, run by name: **ember-ward** (new; red on the base: "no BK.ember: there is no ember ward"), duck (updated as above),
tells, untold-told, answer-tags, combat-feel, juice, ability-poses, comments, homepaths, and the 7 REQUIRED: architecture, checkpoints,
skins, dangling-paths, boss-fight-end, slopes-trace (unchanged for every level), npc-removal. ember-ward, duck, boss-fight-end and
untold-told were run again on the final bot. ember-ward proves: yellow swipe blocked + heat 24 + singed; high armour swing still goes
over by the duck (no heat); arrow melted (+14); red hound pounce through; a ward raised 5 frames before the swipe (the landing frame
measured in a pinned dry run) flares, burns it, throws it back and vents 60 -> 10; an arrow met at the dome's edge comes back as an
ember; a ward at 90 overheats on the next blow (stagger, 1.2 s lock, down cannot raise it, the foe beside her thrown 50 px); a wading
pool puts it out and it will not relight there; she turns and does not walk; knight, warden and paladin still duck and still walk.

## Pilots (pyromancer, one pinned seed, tools/ember-pilot.mjs + a 3-rep ambush run)
BEFORE = the base (master d78b15e, a separate worktree), AFTER = this branch.
| | BEFORE | AFTER |
|---|---|---|
| Queen's Lance (bossLab, refill, 150 s cap, salt duck-1) | win 85.1 s, taken 147 (104/min) | win 48.8 s, taken 105 (129/min) |
| Burning Village barn ambush, 1 run | 28.0 s, taken 103 | 25.4 s, taken 118 |
| Burning barn + Stockade kennel yard ambushes, 3 runs each (6 rooms) | 262.7 s, taken 681 | 234.2 s, taken 441 |
| Stockade elites x6 (fightLab, kill seconds summed) | 50.0 s | 49.3 s |

The ward in the 6 ambush rooms: raised 18, blocked 7 - all 7 FLARES - through 2 (red), overheated 0. Against the Lance it blocked 1
(the bot jumps his guard, so it rarely wards him). Single seeds swing a lot (one barn room went 81-206 taken on the base alone); the
3-rep ambush sum is the steadier number: she is not worse. (The Stockade elite fights record 0 taken on both sides: the lab measures
only the kill time there.)

## UNVERIFIED
- Not played by hand; the art was checked in one capture (the ward frames, sputter, flare, overheat) - not in motion.
- Co-op: the state lives on the hero (P.ember*), so a second pyromancer carries her own; not exercised.
- The perfect window measured by the check is a melee swipe raised 5 frames early and an arrow met at the dome's edge; in
  the ambush rooms every ward the bot raised on a melee windup flared (7 of 7).
- Bosses: the bot only raises on a boss's yellow windup if it is on its feet at the last beat (the Lance bot jumps his guard), so the
  boss numbers mostly measure the duck, not the ward.

## QUESTIONS FOR DANIEL (built: the recommendation)
1. **Heat meter spot.** Built: a thin bar over the dome, over her head, notch at 70. Alt: fold it into the HUD next to her HEAT bar.
   Rec: keep it on her - you watch her, not the HUD, when blocking.
2. **Perfect window.** Built: 0.16 s (the knight's shield is 0.11), and only after the ward was down 0.3 s. Rec: keep; 0.2 if it
   feels stingy in play.
3. **Overheat lock.** Built: 1.2 s locked + 0.45 s stagger, heat to 0. Rec: keep; 1.5 s if blocking forever feels too safe.
4. **Does the perfect flare need a cooldown?** Built: no cooldown; the 0.3 s re-arm (down must have been let go 0.3 s) is the only
   brake, and a flare vents 50 heat. Rec: no cooldown - a flare needs the timing every time.
5. **Arrows at head height.** Built: the dome reaches 16 px, so a level arrow that would have gone over a plain duck is MELTED (heat
   +14) instead - or, on the beat, thrown back. Rec: keep (it is what "arrows melt" asks, and the flare pays for it). Alt: let high
   arrows go over as for other heroes (no heat, but no return).
6. **A dome covers her back.** Built: both sides. Alt: front only (then turning matters for the block). Rec: both - it is a dome, and
   she is the fragile hero.
7. **Ward heat vs her HEAT bar.** Built: separate. Alt: blocks feed HEAT (a charge for the pyre) with the overheat at full. Rec:
   separate - her HEAT full is a reward (the pyre), the ward full is a penalty.
8. **The controls card** still lists C as "block" for her (it was already wrong - her C is the ember/jet). Rec: the store/UI lane
   adds an "ember ward: HOLD DOWN" row for her.
