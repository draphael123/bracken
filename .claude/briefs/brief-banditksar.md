# THE BANDIT KSAR + THE HAWK-MISTRESS (OPUS greybox) - desert act, main road GLASS SEA -> KSAR -> (BURIED CITY, not built yet)
Written 2026-10-07 by the KSAR lane from the APPROVED concept (scratch/concept-banditksar.md: Daniel's interview 10-07 ~08:40 kept every rec; the
FOE ROSTER section replaces the old FOES line). House rules: scratch/design-standard.md (A1-A12, B1-B14 - all apply), scratch/common-1006-night.md,
docs/NEW-LEVEL-CHECKLIST.md. Models: THE GLASS SEA (level wiring), RED GORGE 2 (the Matriarch: a duelist main boss), THE GANG LEADER (the closest
proven human duelist AI), src/carry-throw.js (the told THROW). Pipeline: Opus greybox (this) -> read-only reviewer vs Mage's Folly -> fixes ->
Sonnet art/music -> gate -> Daniel's playtest (B9: the Hawk-Mistress ships only after he plays her).

## THE RULE (one sentence, a verb, drawn)
"THE FORT ANSWERS ITS GONGS: A RUNG GONG CALLS EVERY BANDIT IN EARSHOT, AND A CUT ROPE SILENCES IT."
- The LEVELS rule line is that sentence, and tools/ksar.mjs asserts it equals src/ksar.js's header (A1: the line describes the code).
- A GONG is a bronze disc hung by a ROPE from a frame. While it hangs it can be RUNG - by a bandit who reaches it, or by you. A RUNG gong CALLS every
  fort bandit within its EARSHOT (a drawn radius, KS.earshot tiles across and KS.earshotY rows up/down): each one leaves his post (a guard post, a
  bed in a barracks, the gatehouse) and runs to the gong, musters there KS.muster s looking for trouble (he fights you if you are there), then walks
  back to his post. A CUT gong lies on the ground: silent forever (this run; a respawn keeps it cut - the rule's state persists, as the Glass Sea's
  mirrors do).
- DRAWN (A3): the rope (a line from the frame to the disc) and the disc; a rung gong throws NOISE RINGS (expanding arcs to its earshot) and every
  bandit it calls shows a small gong mark over his head while he answers; standing near a hung gong shows its earshot as a faint bracket on the
  ground; a lookout's sightline is a faint cone while he watches, red when he has seen you; a running lookout carries a red '!' and the gong he runs
  for pulses. Never audio-only.

## THE VERBS (each REQUIRED somewhere, each taught at the point of use with the right word)
1. CUT a gong's rope: ATTACK at a hanging gong (a blade on its rope). The disc falls with a clang and lies silent. Sign: "A BLADE CUTS ITS ROPE".
2. RING a gong yourself: E at a hanging gong. Its earshot's bandits come to it: draw a squad off its post (the GATE WINCH), or into a trap (a keg).
   Sign: "E RINGS IT".
3. THROW (src/carry-throw.js, new kinds 'keg' and 'flask'; E takes one from a stack, ATTACK throws it in the TOLD arc, UP lobs, DOWN tosses short):
   - POWDER KEG: heavy (carried at a walk), short arc; where it lands its fuse fizzes KS.kegFuse s (told: sparks + ring) then it BLASTS
     (KS.kegR px): a big blow to every foe in it, a blow to you if you stand in it (told, never a death trap), it breaks BARRICADES (lashed timber
     and rubble, drawn cracked) and sets off any keg in reach (a CHAIN). A set keg (in the powder store) is KICKED (any blow on it) - its fuse
     lights where it stands.
   - FLASH FLASK: light, long arc; where it breaks a white FLASH (KS.flashR) blinds a HAWK (scout or hers) and stuns bandits KS.flashStun s, and
     leaves a SMOKE puff (sightlines do not pass smoke).

## TEACH -> TEST -> REMIX -> EXAM (sections; columns approximate, ~620 + the arena)
1. THE CARAVAN ROAD (0-99) TEACH, SAFE. First screen asks (a climb up the wadi bank over a broken wall). THE FIRST GONG by a sleeping lookout's
   post on the outer wall: CUT its rope (sign at the point of use). If instead you RING it, the two sleepers in the guard hut beside it come out
   (the teach of "calls every bandit in earshot" - cheap: two plain bandits on flat ground). A HAWK SCOUT wheels high over the ksar (foreshadow, B8).
   A keg stack and a BARRICADE over a side pocket (a caravan seal): THROW taught where failure costs nothing.
2. THE OUTER WALLS (100-199) TEST: CUT ONE UNDER A LOOKOUT'S EYE. A LOOKOUT patrols the wall walk between his gong and the stair; he sees you ->
   "!" -> runs for his gong (told, ~2.5 s) -> rung, the wall's slingers and the barracks' sleepers come. Answers: cut the rope first (before he
   sees, or before he gets there), kill him on the way, or slip past in the SMOKE THROWER's smoke (his pots hide you from sightlines). A SHIELD
   SENTRY stands planted in front of the second gong (go round / over him, or break his guard). A HAWK SCOUT patrols the walls: it spots you in the
   open -> SHRIEKS -> every lookout in its earshot runs for his gong. A flask on a rack: blind the hawk. CHECKPOINT.
3. THE GATE WINCH (200-299) SET PIECE ONE, REMIX: RING A GONG TO EMPTY A POST (REQUIRED). The inner gate (a portcullis) is the only way on. Its
   WINCH is outside the gatehouse; the gatehouse squad (behind its grille, out of your reach) holds the BRAKE while any of them is inside
   ("THE GATEHOUSE HOLDS THE BRAKE"). THE FAR GONG stands on a tower across the yard (a climb). RING it: the squad pours out of the gatehouse's back
   door and runs to it - the brake is off - HAUL THE WINCH (E, notch by notch, told: the gate rises a row a notch, drawn on a gauge beside it) while
   the squad musters and RACES BACK (they re-set the brake if they get in first: the gate drops a notch a second). Big, a verb, changes the route,
   shows its target first (the gauge, the squad's run).
4. THE SOUQ YARD (300-389) REMIX TWO: RING A GONG TO DRAW A SQUAD ONTO A KEG. A barracks squad (a WHIP APPRENTICE and two duelists) holds the
   souq's only stair. The souq gong is under an awning; a keg stack on the roof over it. Ring the gong (or let a lookout ring it), get up on the
   roof, and THROW a keg into the squad mustered under it (the told arc shows where it lands). Or fight them (they are a hard fight on purpose).
   A second CUT under pressure: a lookout on the minaret runs for the souq's second gong. CHECKPOINT.
5. THE POWDER STORE (390-479) SET PIECE TWO, REMIX THREE (THROW REQUIRED): the fort's powder store across the rooftops - a row of KEGS SET on the roofs
   and a BARRICADE of lashed timber over the only way up to the hawk tower. KICK the first keg (any blow) - its fuse lights, and the CHAIN shows its
   target first (a dotted fuse-line keg to keg and a ring on the barricade); keg by keg the blasts run across the roofs (a told beat each) and
   the last one blows the barricade: the route changes visibly (the roof you stood on is holed - a new way down into the store's vault cellar and
   up). Stand clear (the rings show the blasts). A smoke thrower and a hawk scout over it. CHECKPOINT.
6. THE HAWK TOWER ROOFS (480-579) EXAM: THE WHOLE FORT WAKES. Three gongs, three lookouts, two hawk scouts, slingers on the parapets, sentries:
   the exam combines CUT (silence the gongs ahead of the lookouts), RING (draw the roof squad off the tower stair), THROW (a keg into a mustered
   squad / a flask to blind a hawk). The strongroom door (the vault) is here. CHECKPOINT before the courtyard.
7. THE COURTYARD (580-619) THE HAWK-MISTRESS (src/hawk-mistress.js).

Fight during the rule (A5): every section's encounters are placed while gongs can ring (a lookout + a squad in earshot).

## THE TWO ONLY-HERE SET PIECES (verbs; the trebuchet test)
A. THE GATE WINCH: ring the far gong, watch the gatehouse empty across the yard, haul the portcullis notch by notch on its gauge while the squad
   musters and races back. The player's choice: when to ring, whether to cut the far gong's rope afterwards (then they cannot be called away again),
   whether to fight the returning squad or slip under the gate.
B. THE POWDER STORE: kick the first keg and watch the chain run across the roofs to the barricade (its fuse-line and rings drawn before it goes).
   The player's choice: which keg to kick first (two chains: the long one to the barricade and a short one into the roof squad), where to stand.

## FOES (human bandits only; max ONE brand-new AI: THE HAWK SCOUT; the rest reskins/variants with a twist tied to the rule; no type over ~35%)
- LOOKOUT (role: runner; the 'cutthroat' machine under cnSkin 'lookout' with a GONG post): the rule's runner - sees you, '!', runs for his gong
  and rings it unless its rope is cut. Kill-first target.
- SHIELD SENTRY (heavy; the shield guard's AI, foe 'shield' + cnSkin 'shieldsentry'): PLANTED in front of a gong (he will not leave it - a rung
  gong he guards does not move him); go round / over him or break his guard to reach the rope.
- SMOKE THROWER (ranged support; the dynamite bandit's 'sapper' machine + cnSkin 'smokethrower'): his pots burst in SMOKE (a small blow, a cloud
  KS.smokeT s): smoke blinds every sightline through it - lookouts' and hawks' - and the player can use it to slip past.
- HAWK SCOUT (air; THE ONE NEW AI, src/ksar-foes.js hawkStep): the Hawk-Mistress's birds patrol the walls in a told circuit; one that SPOTS you
  (in the open, in its sight cone, not in smoke or under a roof) circles, SHRIEKS (told '!' + a ring) and every lookout in its earshot runs for his
  gong; then it STOOPS on you ('!!', a marked dive: step off the mark). A flask's flash BLINDS it (it flaps blind, then flies home).
  Unkillable? No - a scout is a bird: two blows kill it (it is not her hawk).
- WHIP APPRENTICE (melee duelist; the 'cutthroat' feint-and-cut machine + cnSkin 'whipapprentice'): a junior falconer; his cut is a WHIP LASH with
  reach (KS.lashReach) and a lash that lands PULLS you a step toward him (out of cover) - foreshadows her whip (B8).
- reused: WALL SLINGER ('slinger', cnSkin 'wallslinger': THE RANGED ONE on the parapets) and THE GANG LEADER's DUELISTS (the 'cutthroat' machine,
  cnSkin 'ksarblade': the curved-sword bandits of the Well Town gang, in the Ksar's colours).
Every fort bandit (lookout, sentry, smoke thrower, apprentice, slinger, blade) answers the gongs (the rule's twist on every reskin) - except a
PLANTED sentry (he holds his gong). Reskins via cnSkin (corpses die in their own skin - tools/corpses.mjs). No living goblins (goblin-lint).

## CHECKPOINTS (few; spacing >= 90 route tiles; one before the boss)
Start, ~160 (the outer walls' end), ~300 (past the gate), ~395 (the powder store's foot), ~490 (the tower roofs), ~575 (the courtyard door).
Salt & Sanctuary death cost as the house has it. Falls are into the wadi / the yard (never an untold death).

## COLLECTIBLE -> VAULT
Five stolen CARAVAN SEALS (L.quest, HUD "SEALS n/5 - THE STRONGROOM WAITS"): one behind the first barricade (a THROW), one on the outer wall's
tower top, one in the gatehouse after the squad leaves it, one in the powder store's cellar (opened by the chain), one on the hawk tower. With
all five, THE STRONGROOM's door (by the courtyard) opens: SILVER (cap 3 a level - two route silvers + the strongroom's one). Never a relic.

## THE HAWK-MISTRESS (src/hawk-mistress.js pure + bot plan; src/hawk-mistress-hands.js world + greybox drawing)
WHAT SHE IS (B11, said in the code header): A HUMAN DUELIST, NOT A PUZZLE. ALWAYS HITTABLE; she GUARDS BY ANGLE: her falconer's gauntlet turns a
frontal blow from a hero at her height while she is on guard (walking, recovering) - CLANK, "HER GAUNTLET" (src/boss-read.js); from BEHIND her, or
from ABOVE (a jump), it lands whole; in her tells and strikes she is committed and every blow lands. The raiders' chief and falconer; kit: WHIP,
CURVED KNIFE, FLASH POWDER, and THE HAWK.
THE HAWK IS PART OF HER KIT (Daniel 10-07): one target (her bar). It is UNKILLABLE (a blade through it says NOT THERE / it rides the air). It
circles over her - her eyes. THE OPENINGS ARE THE RULE'S (B1):
- RING A GONG (the courtyard's gongs): the noise sends the hawk WHEELING off (it flies a wide told circle) - SHE WHISTLES IT BACK: OPEN (HM.openT
  ~3.5 s: gold outline + timer bar, B10), blows x HM.openMul, at most HM.openCap of her an opening.
- BLIND IT with a FLASH FLASK (the racks in the courtyard) or a smoke cloud on it: it flaps blind - she whistles it back: OPEN the same.
- After every opening ends: a TOLD ~3 s WARD (B3: "THE HAWK IS HOME: SHE GUARDS" - every blow clanks WARDED; a gong rung in it does nothing - the
  hawk is on her glove).
B4: open, she stands her ground (whistling, glove up) - no retreat walk.
P1 THE COURTYARD DUEL (100%-60%): WHIP LASH ('!' - a long low lash: jump it or block it), KNIFE FEINT ('!' a feint step, then the real cut - a
  shield turns the cut), THE HAWK SPOTS (her P1 told move: the hawk drops over you and SHRIEKS, marks your spot: her next lash cracks there).
P2 HER GUARD ANSWERS THE GONGS (60%-25%): NEW MOVE - THE CALL (she whistles '!' two notes: a guard on the courtyard wall runs for a gong - a rung
  gong opens a wall door and her guard (HM.guardCap alive) comes down). CUT THE ROPES to fight her alone (a cut gong cannot call her guard - but
  then it cannot send the hawk off either: the FLASKS are the opening now). The arena change: the guard doors and the wall walk.
P3 THE POWDER STORE BURNS (25%-0): NEW MOVE - THE HAWK DIVES ('!!' a shadow marks your spot, the hawk stoops: step off; unblockable). The arena
  change: the store's fire spreads along the yard's edge and the ROOFTOP LEDGES SHRINK one by one (told: smoke, a crack, "THE ROOF GOES").
  DESPERATION: her FLASH POWDER (a told white burst: turn your back / be out of it, or be blinded a moment).
NUMBERS (B6): human bot 50-60% at campaign level across knight / warden / pyro (tools/boss-rates.mjs, profile human, practiced), no hero at 0,
mash 0/6 (boss-greed: FULL_DAMAGE duelist + the greed reprisal), fight ~90-150 s, boss-health setting reads her bar. Daniel's playtest gate (B9).
Boss theme: composed-in-code synth (src/boss-music.js 'hawkmistress', three phase variants) until a track is picked.

## PLACEMENT
id 'ksar', name THE BANDIT KSAR, `needs: 'glasssea'` (APPENDED to LEVELS - the array is an append log; src/campaign-order.js reads the gate chain).
Map node on the desert sheet after THE GLASS SEA. The Buried City does not exist yet: the Ksar is the next main-road level after the Glass Sea and
the Buried City will need 'ksar'. Desert act in src/foe-react.js ACTS (curve row in band).

## THE LANE'S CHECKS
tools/ksar.mjs (Node + page asserts, in tools/check.mjs): the rule line equals the code header; every verb REQUIRED somewhere (the winch's brake,
the powder chain's barricade); gongs ring/cut/call as the rule says (a called bandit reaches the gong; a cut gong is never rung); the chain shows
its target; checkpoints >= 90 route tiles apart; signs at the point of use say RING / CUT / THROW; the boss's openings (gong -> wheeling -> open,
flask -> blind -> open), the ward after each, the guard by angle, B4 stillness. tools/ksar-route.mjs: the route pilot (every hero, base
movement, real keys). Plus the house's rows: stuck-spots (glint + 10 s nudge on every route need), level-quality GATE, mash rows (LEVEL then BOSS),
level-1 pilot, curve, boss-rates row, one-new-foe (ksar = [hawkscout]), threat, marks, answer tags, hint lines.

## MUSIC (three CC0/CC-BY picks - listed only, NOTHING downloaded; licence to be re-read on each page; Daniel picks)
Listed in the lane report (work/claude/lane-done/claude-ksar.md) with title, artist, licence, page URL.

## OPEN CHOICES (built as recommended; listed in the lane report for Daniel)
- CUT on ATTACK at the gong (rec) vs a held E.  - The hawk scout dies to two blows (rec) vs unkillable like hers.
- Flash flasks are the player's (rec) - the concept's "oil flasks" are not built (fire would be a second system).
