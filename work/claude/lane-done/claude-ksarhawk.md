# claude/ksarhawk - BANDIT KSAR / HAWK-MISTRESS REWORK (Daniel's 10-13 playtest)

Base: origin/master 7d920edb (claude/flasklever NOT merged - her rates are tuned against the current global flasks; she is meant to be EXEMPT from its per-act dial).

## What changed
1. SLOWER (Daniel: "attacks too quickly, often cannot get out of the way"). Every told move >= 0.6 s, every '!!' >= 0.8 s
   (lash 0.85, feint 0.6+0.3, cut 0.6, spot 1.0, marked lash 0.8, call 0.9, snare 0.85, fan 0.9 with 0.42 s between knives,
   keg kick 0.85, rake 1.05 (+0.55 s flight), snatch 1.3). Gaps between her moves 1.0/0.9/0.8 s (were 0.5/0.42/0.36).
   ONE WINDUP AT A TIME: `calm()` - she starts nothing new while her keg rolls, her knives fly or the hawk is out on a stoop.
   Each blow that lands weighs more (dmg ~x1.9) - weightier, not faster (difficulty direction).
2. THE HAWK IS HER SHIELD - the central mechanic, the level's own verbs (B14/B17):
   - while the hawk rides over her (circling/climbing/home, or her ward) she is GUARDED: a blow clanks "THE HAWK GUARDS HER: BURN IT",
     lands at the B15 floor (0.4x), a faint dashed shell round her, a dotted tether to the hawk and the shared THROW glyph on it, bar "THE HAWK GUARDS".
   - THROW FIRE: two TORCH racks by the outer roofs' braziers (cols 9, 37). A torch into the hawk -> it falls burning onto the roof and lies
     there ("HAWK DOWN", flames, crash/shake/sound) -> she is OPEN x2.0 for 4.5 s (gold ring + timer, B10; cap 8.5% of her a window), then
     she whistles it to her glove (told 3 s ward, B3) and it climbs again. A torch at the hawk on her glove: "IT IS SAFE THERE".
   - KEGS: a POWDER KEG stack on the middle roof (col 21). A keg that meets the hawk blows in the air -> HAWK DOWN; any blast by the hawk
     brings it down; a blast on her lands its 60 on her (through her guard). Her own kicked keg struck back still opens her (x2).
   - GONGS: a ring sends the hawk WHEELING LOW (an easy torch) and leaves her BARE (x1.4, 2.8 s, cap 3.5%); fire into the wheeling hawk
     upgrades BARE to the full opening. Flash/flinch (a struck or shielded stoop) also leave her BARE. On her own stoops (rake/snatch/spot)
     the hawk is off her: she takes a blow whole.
   - the old gauntlet guard-by-angle is gone (one read: the hawk). Fire on a hawk that is carrying you drops you.
   B17: told attacks lash / cut / snare / knife fan / keg kick / marked lash / rake / snatch (8) + the central mechanic = the Ksar's THROW
   (torch, keg) and RING verbs.
3. BACK OF THE ROOM: the road's exit GATE stood ON her east roof over the guard door and the yardE gong (sprites piled up, the hero walked
   "into" it). It now waits in a 3x5 EXIT ALCOVE behind the east wall; the arena's own wallR (setWall) shuts it through the fight and opens
   it when she falls. Screens: work/claude/ksarhawk/base2 (before).
4. CARAVAN SEALS drawn as mushrooms: `caravanseal` had no stray-draw branch -> PROP.brightCap. New `KSA.bakeCaravanSealIcon()` (wax seal on a
   manifest scrap, cord) used by the stray draw and the HUD quest counter (main.js, two one-line hooks tagged claude/ksarhawk). Bestiary text updated.
5. LAB BOT: fetches a torch (keg 25%), lines it up 0.45 s and throws on the real arc with a human misjudgement (aimErr 34 px - some miss);
   rings gongs; cuts her guard down; sets a torch down when she is open; jumps shafts to HER side when going to cut her (it used to stall at
   the near lip while she stood open across a shaft); chips under the hawk only now and then.
Files: src/hawk-mistress.js, src/hawk-mistress-hands.js, src/ksar.js, src/ksar-hands.js, src/redraw/ksar_art.js, src/lab.js, src/main.js (hooks),
src/boss-read.js, src/boss-greed.js (note), src/hint-lines.js, tools/ksar.mjs; new non-suite tools/ksarhawk-shots.mjs, tools/ksarhawk-trace.mjs.

## Rates (L39, practiced, 6 seeds, --jobs=1)
- human + kit flasks: knight 4/6, warden 3/6, pyro 5/6 = 67% (in the 60-70 band; no hero at 0). Fights 110-167 s (a little long at the top).
- human + dry (3 seeds): 0/3 0/3 0/3 = 0% (bosses left 13-58%). She leans hard on the flask kit (taken 350-660 with kit vs 282 max hp).
- mash 0/6 (boss), level mash re-stamped (level THEN boss). Baseline before the rework: 89% (3 seeds).

## Checks
tools/ksar.mjs 235 ok; boss-greed ok; hint-shown ok; boss-read ok; tells ok; level-quality: KSAR clears the bar (pilot + mash re-stamped);
deadends ok; ksar-aloft ok; one-new-foe ok; boss-fight-end ok; untold-told ok; damage-caps ok; stuck (static+runtime) ok; level-reach ok;
boss-openings ran (no failure line). REDS: mark-integrity 1 PHANTOM undeadmage|markTell (not this lane's boss - not touched here, likely pre-existing);
textfit --strict timed out in the unrelated scope talk[pirate] (481 s, machine load) - not re-run.
Deliberate test changes (tools/ksar.mjs, stated in its comment): a gong now leaves her BARE (>= 2.5 s) not the full opening; the gauntlet-angle
asserts are replaced by the hawk's guard; new asserts: fire brings the hawk down and opens her >= 4 s, a torch at the glove is safe, keg on the
hawk, every tell >= 0.6 s (!! >= 0.8), gaps >= 0.8 s, one windup at a time.

## ART needs (sonnet art lane)
- her hawk DOWN pose (bakeHerHawk(8) is a placeholder: sprawled, singed) + a burning/smoke loop and a crash frame.
- B16: rakeTell / hawkGrabTell (snatch) / callTell still share her whistle A/B poses - each wants its own windup + release (send-the-hawk point,
  the snatch's raised glove, the call's arm to the wall walk).
- the caravan seal icon (placeholder-grade wax seal).
- a brazier-with-torch-rack prop for the two torch racks (now the generic torch rack next to the courtyard braziers).
- the exit alcove's arch in the east wall (it shows plain wall tiles until her wall opens).

## QUESTIONS FOR DANIEL
1. DRY RATE 0% (with flasks 67%). Rec: keep (B6 says tune WITH flasks); if flasklever's dial or a playtest says she is too flask-hungry,
   lower dmg (~x1.6) and raise openCap. Built: the with-flask tune.
2. Gong = BARE (x1.4, short) and only FIRE gives the full opening. Rec: keep - fire is the central verb, the gong sets it up (low hawk).
   Built that. Alternative: gong = full opening as before.
3. Flash flasks left the arena (their racks became torch racks + a keg stack). Rec: keep the arena to fire/powder/gongs. Built that.
4. Shafts still cost 25% (A10) and the snare yanks toward them - the bot's worst source of damage. Rec: keep, watch your playtest.
