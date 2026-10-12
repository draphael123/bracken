# claude/kifollow: KNOCK-INTO FOLLOW-UP (Sonnet, 2026-10-12)

Brief: scratch/brief-combat2.md section 1/4 and its 10-11 16:35 FOLLOW-UP line. Base: origin/claude/damagepct 6b346bb3. Port 8863.
New files: src/ki-art.js, src/knock-data.js, tools/ki-follow.mjs (in `npm run check`). main.js hooks tagged `(claude/kifollow)`.

## BUILT
1. **ART (src/ki-art.js)**
   - **Spines.** Drawn spikes (triangles with an outline), keyed 0 / 1 nubs / 2 half / 3 full, plus a FIRE frame (flat out and white hot). One layout per elite body: husk, thorn, shield (studded through the front), hearthgob (ember tips), troll, brute, scarecrow, armour. The THORNED elite and the Spike Goblin both use them. The Goblin's bristle is now three drawn frames.
   - **Spitter.** A hop (crouch, stretch, land, dashes left at takeoff) and an OFF BALANCE wobble that dies away, with sweat drops.
   - **Tumble.** A launch past 100% gets speed streaks and a spin of chips in the air. It lands with the spin cut off, dust and dizzy stars for 0.6 s.
   - **Guarded slide.** A braced lean into the blow, sparks off the feet, the guard flashing on the side the blow came from (`e.kiSlide`).
   - **Entry FX** for every hazard kind: spikes (sparks and red), drop (wind streaks), water (splash and ring), lava (spatter and steam), fire (licks), mire (blobs), poison (bubbles), press (flat dust and chips), sand (puff).
2. **DATA PASS (src/knock-data.js).** One row table per level id plus an auto row for quicksand. The audit is one line per act in the file header.
   - Deep Rails (minecart): the lava decor row becomes a lava row, x 615-624, from the surface to the world floor. A worn foe thrown in dies and says INTO THE LAVA. A killing row is now judged by hazardFoe (`killRowAt` in knock-into.js). deathBelow no longer says OFF THE EDGE over a row, because the row speaks for itself.
   - Quicksand (`L.quicksand`): auto-listed as new hazard 'sand', INTO THE SAND. It holds a thrown foe 2.2 s and never kills (it never kills a hero). Sunken Caravan: 17 patches. Buried City: its drifts.
   - Every other act was audited and is already covered by tiles / pools / props / fires. The late acts (frost / fire volcano / demon) get their rows here when they land.
3. **Spitter off TOUCH_ALWAYS.** It hurts only by its seed. `wisp` was in the list too but is not a creature (the canal's wisps are props), so it is removed as dead.
4. **ARMED-ONLY TOUCH** (`e.arK` 0..1, a gate before the touch rule: `KA.armed`). A part-risen state never bites. Only the fully drawn state does.
   - **Urchin:** needles rise over 0.28 s when a swimmer closes in (the old `bristle` flag), fold in 0.5 s. Drawn as a calm dotted ring, then rising needles, then full needles with red glints.
   - **Jelly:** its glow IS its clock. Tentacles stir from alpha 0.46 and fan fully at 0.60, so it stings about a third of its cycle. Drawn as limp, stirring, fanned with sparks.
   - **Grub:** a hero at its side makes it bead acid and flare over 0.32 s (or in its spit pose). Beads, a bright line and drips. Its own burn-on-touch in updateGrub is gated the same way.
   - **Marshlight:** the corona grows through the existing flare tell, full only in the flare itself.
   Bestiary text updated for urchin, jelly, grub.

## CHECKS (PORT 8863, sequential, all on this branch)
- OK: knock-into, ki-follow (new), damage-pct, riposte, tells, untold-told, corpses, mobile-perf, pixels (46 levels, 2963 sprites).
- anti-plunge = knock-into's 'anti' section: OK.
- **mark-integrity: 1 red, the known flake.** undeadmage poisonTell and markTell PHANTOM POSE.
- **no-hidden-hits: 1 red, NOT this lane's.** towpath gaffer/bargeman haft, only in the full run. It fails identically on the damagepct base 6b346bb3: same blow, 2 px moved. Alone on both trees it passes. Left for the towpath owner.
- **Mash (level mode, knight/warden/pyro):** run on every level whose foes changed. Every hero died on every one (0/36), so the mash bot still loses.
  - Levels: wood, marsh, hanging, longwater, reef, hurricane, lamplit, deep, keep, causeway, undercrown, fields.
  - Nothing is stale. Level hashes are over grid and ents, which this lane does not change, so docs/mash-bot.json was NOT re-stamped (no level then boss restamp needed). Verdicts are equal or better than the cache. Longwater went from knight 13% / warden 3% / pyro 42% min hp with no deaths to 7 / 6 / 4 deaths. Keep pyro went from 0 deaths at 17% to 2 deaths.
- **Art check:** drew the spine frames and armed states on a canvas and looked at them. Spine stages and the urchin read clearly. The grub and marshlight read, but are small at 320x180.

## STATED DESIGN CHANGES (no test weakened)
- tools/ki-follow.mjs is new. tools/knock-into.mjs is unchanged and still passes.
- Touch no longer hurts from an unarmed urchin / jelly / grub / marshlight. This is the brief's rule.

## QUESTIONS FOR DANIEL (recs as built)
1. **The jelly now stings only at the bright end of its clock (about a third of its cycle).** Rec (built): yes, the glow is the tell. Alternative: widen the window (alpha 0.5 to 0.4 start).
2. **A thrown foe on quicksand is held 2.2 s, never killed.** Rec (built). Alternative: sink it (a small hp share).
3. **An unarmed urchin / grub can now be touched freely.** The urchin is armed within about 40 px, so swimming straight through one still costs. Rec (built).
4. **The towpath no-hidden-hits red is in the base.** Rec: the next towpath polish pass fixes the gaffer's haft blow, which hits for nothing drawn.
