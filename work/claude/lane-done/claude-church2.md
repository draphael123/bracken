# claude/church2 - LIT CHURCH 2 + THE DEACON (mini) + THE PALADIN AS A HERO BOSS (Opus, 2026-10-14)

Brief: scratch/brief-church2.md (Daniel 10-10). Base: origin/master db7ce62f (BATCH92 live, Paladin 2 in). Branch claude/church2, port 8921.
Built on the CURRENT game: the Paladin 2 kit (src/holy-ground.js makeHolyGround, HG, HG_PAL), the hero's FX (src/holy-fx.js), the flask lever + boss dial
(both new fights are self-tuned: `paladinboss` and `deacon` are in DIAL_EXEMPT, src/boss-pressure.js), the human bot. STOPPED after level + both fights;
the sonnet art and tune lanes follow.

## WHAT IS BUILT

### THE PALADIN - the hero as the boss (src/paladin-boss.js rewritten, src/paladin-boss-hands.js rewritten)
- BODY: the hero's own sheet (bakePaladin) baked into SPR.paladinboss (main.js palHeroSet, PAL_POSES), drawn x1.5 by the generic enemy path like the Death
  Knight boss - no new body art; every told move has its own windup + release frame off the hero rig (B16, tools/paladin-boss.mjs proves it).
- KIT (B5): only the hero's: MAUL CHAIN, CONSECRATE (his own makeHolyGround instance, side 'foe': it burns a hero standing in it and mends him; he hits x1.3 in
  it), the Light SPENDERS (HAMMER THROW 25, SMITE 20 and EMPOWER 35 in his circle, JUDGEMENT the full bar in his circle - five columns round him, the hero's
  judgementFall shape), the AEGIS (guards the front; a turned blow FEEDS his Light; planted when pressed), the VIGIL (the crouch rule: he kneels at a lit lamp
  to fill his Light). Phases = his three trees: LIGHTBRINGER (P1) -> BASTION (P2 at 65%: HOLY CHARGE, his own L9 active; the rose window rekindles his dark
  lamps) -> EARTHBREAKER (P3 at 30%: HAMMER LEAP - quakes both ways and his circle comes down with him).
- DUELIST (B11/B15): always hittable; guards by angle (front at his height on guard = x0.4 + feeds him; behind / above / committed = whole and drains);
  under 8 Light the aegis FAILS (told) and the front lands too.
- CENTRAL MECHANIC (B17, the level's verb): THE SANCTUARY'S THREE LAMPS feed his Light (regen per lamp + the vigil); snuff them (dims him, cuts a vigil);
  his spenders are gated by Light; driven to nothing he FALTERS (2.8 s open x1.7, cap 12%, still - B4), then a told 3 s ward (B3).
- UNLOCK: beating him is the Paladin's hero fight: HEROES row `coinBoss: true, feat: 'boss:church'`; his death sets PROG.bossDown.church ("THE PALADIN CAN BE
  HAD IN THE SHOP"); silver (10) after, coins (800) after - the Death Knight's rule. Bestiary card = his hero sheet (no more Crusader plate).
- Bot: pbPlan rewritten (jumps the hammer both ways and the spires, off the crosses/ring, leaves his circle before the flare, cuts the vigil, snuffs lamps,
  goes round / over the aegis, hits on the falter). Lab passes his circle.

### THE DEACON - the mini (src/deacon.js + src/deacon-hands.js, new)
- The church's lamplighter at THE CROSSING, the top of the crypt well. THE PARCLOSE (new iron grille door at col 160) shuts the crossing's east half off the
  piers until LAMP THREE (it opens with the crypt grate) - you only come into his room up the well; you see him behind it on the way to the transept (B8).
- Duelist: his pole guards HIGH (front at his height or from a jump: x0.4 "GUARDS HIGH: HIT LOW"); a LOW sweep (down+X), his back, or a committed beat lands.
- Opening (the old Paladin's light bar + falter, moved here as the brief says): his LIGHT fills from his 4 lamps (2 floor sconces, 2 CHANDELIERS ON CHAINS - a
  struck chandelier's chain parts and it COMES DOWN, 7% + a reel if he is under it); snuffed / drained he GROPES IN THE DARK 3 s (x1.8, cap 18%), then a told ward.
- Moves: POLE SWEEP (! low - jump), SNUFFER HOOK (! catches and hauls you in, then the JAB !), KINDLE (quiet: walks to a dark lamp and relights it, a blow
  cuts it); P2 (<50%) FLAME ARC (!! holy fire dragged along the floor for 3.2 s).
- The crypt grate now swings up as a ONE-WAY iron grate (his floor is whole; you still come up through it).

### LIT CHURCH 2 - the level (src/lit-church.js, src/lit-church-hands.js, src/church-supports.js new)
- NOTHING FLOATS: every raised board stands on its drawn support (pew legs, ashlar piers - the triforium on its pillars, the gallery on the nave arcade -,
  choir-stall fronts, chains for the crypt well's landings, bone columns for the ossuary/vault shelves, organ pipes under the case). tools/solid-islands
  church 42 -> 0 (allowance removed). No tile changed.
- HOLY FIRE (the rule as a verb): troughs BLAZE while their LAMP burns (drawn: tall white-gold tongues + a dotted feed of light from the lamp along the floor);
  snuff the lamp -> EMBERS you walk; a touch costs 27% (A10's hazard number) and puts you back on your last safe footing or the trough's near lip. The dead
  still rise only when the whole room is dark. TEACH: the nave trough by lamp A (5 wide; its priest relights it). TEST + REMIX: THE CHANTRY (below). EXAM:
  the south transept's trough by the low lamp (the acolyte runs to relight it under you).
- THE CHANTRY (NEW WING, cols 180-213 between the rood screen and the south transept; everything east moved +34 columns, W 290 -> 324): two troughs
  under choir stalls (gaps of 3, one stall a row higher), each fed by its own lamp (one on the west lip, one on the middle stall); THE BRAZIER RELAY made
  longer - a DRAUGHT burns a taper in 6.5 s here: the votive stand -> RELAY BRAZIER 1 -> RELAY BRAZIER 2 (lighting one hands you a fresh flame) -> the
  CHANTRY DOOR's lamp (the only way on). A thurifer lobs his censer on the stalls; a bell-ringer by the door rings you back toward the fire.
- CLERGY RESKINS: THURIFER and BELL-RINGER = the goblin PRIEST's machine (rite / censer / bell) under human church skins (src/redraw/church_art.js, GREYBOX
  recolour, bestiary cards, corpses in their own skin). They are clergy: lit x1.3 / dark x0.7 (role 'clerk').
- Walker hints (walkHint) for the relay; STUCK_HANDS.church: the chantry's votive + door lamp; the reliquary spot moved with the wing.

## CHECKS (port 8921, one page at a time)
RESULTS_CHECKS

## 3-SEED SANITY (tools/boss-rates.mjs church,church:mini --seeds=3 --profile=human --flasks=kit --jobs=1; campaign L26)
RESULTS_RATES

## REDS / NOT DONE
RESULTS_REDS

## QUESTIONS FOR DANIEL (rec first; what is built)
1. THE ROAD (brief section 1: needs 'waymeet', Waymeet's three votive lamps open the hill gate, map node move + map-plates-solve) is NOT built here: it touches
   Waymeet, the map tools and the road-order rows, none of the church. REC: a small separate lane after the art pass. BUILT: the church still forks off the
   Towpath (needs 'towpath', opensOn towpath bronze).
2. Holy fire is keyed to a LAMP, not to the whole room (the nave and the chantry have two lamps; a room-keyed trough could never be cooled from one side).
   The dead still rise only when the room is dark. REC keep. BUILT so.
3. THE CHANTRY is a new 34-column wing and the south transept + sanctuary moved east by 34. REC keep (the only clean room for 2-3 new holy-fire sections and a
   longer relay). BUILT so.
4. The Deacon waits behind THE PARCLOSE (a grille door opened by lamp three) rather than an 'armed' trigger: every tool and the lab enter his room like any
   mini's. REC keep. BUILT so.
5. THE DEACON joins FULL_DAMAGE / tools/boss-greed.mjs DUELISTS (a B11 duelist by the brief: a stated list change). REC keep.
6. The Paladin's JUDGEMENT spends the whole bar but is not a falter; the next blow that LANDS on the empty bar is. REC keep (Judgement is his gamble).
7. The Paladin's lamp tie is regen + his VIGIL (kneel at a lit lamp, the hero's crouch rule) rather than his old kindle (moved to the Deacon). REC keep.
8. Mini sits HIGH in the 3-seed sanity (bot 100% practiced, 67% first) even after three damage passes; REC hand it to the sonnet tune lane at 12 seeds
   (knobs: DC hp / sweep / jab / gropeCap). The Paladin's WARDEN fights run long (~200 s; the bot pokes his aegis from range): REC the tune lane looks at
   the warden bot's angle play, not the boss.

## ART LIST (the sonnet art lane draws all of this; everything new here is GREYBOX)
THE PALADIN: (body is the hero sheet - no new body) a dedicated BESTIARY CARD pose (today the card cycles all 31 poses); a FALTER pose (today the hero's
`slump`) and a REBOUND / REEL pose (today charge[2] / hurt); the foe circle tint (HG_PAL.foe: palart's REC - a thin crimson under-line); the JUDGEMENT crosses +
columns (PAL.drawColumn greybox); the HAMMER LEAP ring and the QUAKE waves (today the holy spires - want an earth-brown/gold quake); the AEGIS arc (greybox
stroke) -> a proper ward of light, planted (white) and FAILING (broken); the VIGIL light rising off the lamp into him; the light bar's spend ticks (greybox).
THE DEACON (procedural greybox in src/deacon-hands.js): a full sheet - idle (pole crosswise HIGH), walk x2, POLE SWEEP windup + release, SNUFFER HOOK windup +
release (the hook out), JAB windup + release, KINDLE (pole raised to a lamp), FLAME ARC windup (flame end up behind) + release (dragged low), GROPE (stooped,
feeling), reel, hurt, wake, death/corpse; the brass pole (hook end + flame end); the FLAME ARC's holy-fire patches; his light bar; a bestiary card.
THE CROSSING: two floor SCONCES (lit/dark; today the sanctuary 'arena' lamp look), two CHANDELIERS on chains (hanging lit/dark, the chain parting, falling,
lying on the floor lit/dark), THE PARCLOSE grille (shut/open), the crypt grate swung up as a one-way iron grate.
HOLY FIRE: the trough itself (a stone channel tile), BLAZING tongues, the EMBER bed, the lamp->trough feed of light, the iron grate in a trough.
THE CHANTRY: its own room set (walls, windows, a bell-tower draught read - dust/flicker), the choir stalls over the fire, the votive stand, the two RELAY
BRAZIERS (dark/lit; today standing lamps), the chantry door + its lamp, the draught's flicker on a held taper.
SUPPORTS (src/church-supports.js, greybox-plus): pew legs, ashlar piers, choir-stall fronts, chains, bone columns, organ pipes - repaint in the church kit.
CLERGY: THURIFER and BELL-RINGER - recolours of the goblin priest's 10 frames; the heads keep the goblin hood's peak: redraw HUMAN heads, the censer and the
hand bell, their corpses.
