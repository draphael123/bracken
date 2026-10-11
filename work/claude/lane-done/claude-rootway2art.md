# claude/rootway2art - ROOTWAY 2 ART PASS (Sonnet) + THE LOOKOUT CROSSING

## TOP: THE LOOKOUT (Daniel stuck twice: "this jump is not crossable") - mechanics change, stated
- FORGIVING: ANY arrow of the lookout's scout that is struck back cuts the rope at once (src/rootway-hands.js H.update); any struck-back arrow within a screen of the cleat is
  steered onto it (owner-less arrows too). The old 10 px thread through the cleat is only the fallback.
- SECOND WAY: a thrown spore pod that flies through the span's rope (pulley->cleat, pulley->load) snags it and cuts it (H.podRope, asked every frame by src/hunt-pods.js). A POD CAP on the
  near ledge: podCaps [300,19]. A pod LOBBED UP (the high aim) from the lip reaches; the plain mid throw does not (told arc is green when it will hit).
- READABLE: the tie-off carries a pulsing gold target frame; while the scout has his bow drawn, his arrow's path (amber, dotted) and the way back to the rope (gold, dotted) show.
- STALL NUDGE: stuck-spots 'rw-lookout' line is now "STRIKE HIS ARROW BACK, OR LOB A POD UP AT THE ROPE" (it already covered the near lip, zone 299-303).
- The sign at 302,18 is UNCHANGED on purpose: its text is an ent in the level hash, and it is still true. Level hash unchanged (bcecbe519d8c) -> NO re-stamp needed.
- PROOF: tools/rootway-lookout.mjs (new), all 7 heroes from the near lip (303,18): struck-back scout arrow drops the span; owner-less one drops it; a pod lobbed up drops it; and the
  real thing (he shoots, the bot swings) drops it for every hero. reach-heroes rootway green (0 required crossings), stuck green.

## ART (all art-only, no timing/hitbox/tile change)
- THE HUNTMASTER (src/redraw/rootway_art.js paintHuntmaster + drawBoss mapping): his own poses for NET SWING (net whirled over the head, widening) and THROW (arm out, cords streaming,
  follow-through), HEAVY ARROW (wide stance, bow bent hard, black broadhead, trembling), HORN (raised from chest to mouth, amber bell), SNARE crouch + hop (jaw trap in both hands),
  KNIFE FLURRY (coiled reverse grip, then down-cut, back-up-cut, lunging stab), DODGE ROLL (dive, a turned ball in four redrawn quarters, dust, rise), the FALL off the perch (arms flung up).
  The overlay rectangles (net, horn, trap, glint) are gone; the horn's breath rings stay. tools/rootway2art-poses.mjs = the sheet.
- THE AREAS (src/redraw/rootway_areas.js, drawn from the backdrop): CELLAR = a cave (root-weave wall, root pillars, hair, glowing bracket fungus, spores; its spore lights punch the dark
  pass: RWH.holes); TRUNK = bark-lined inside (grain, ridges, rings, knots, chinks of gold light + shafts + dust, violet foot with glow caps, knothole spill); GANTRY = scaffold towers with rope nets,
  hung cages and a trophy line; SNARES = boughs hung with nooses, net bundles, bone chimes, red rags + SNARE WARNING POSTS before every trap; LODGE = the hall (lashed-log wall, rafters,
  skull shelf, skin racks, THE HORN MOUNT over the stand, lamps).
- PROPS: jaw trap set/arming/sprung (snares.js), the net coil + dithered creak shadow + falling lattice + fallen net, pod cap/pod/burst/green told arc (hunt-pods.js), root-palette SPRING CAP
  (+squash), glowing caps and spore vines, new deco kinds hornMount/skinRack/lodgeBeam on the allow-list.
- Shots: work/claude/rootway2art/{before,a1..a3}/.

## CHECKS (PORT 8810, this tree): rootway, rootway-probe, rootway-aloft (extended to know glowcap/snarepost/skinrack/lodgebeam as floor kinds and sporevine as hanging - same rules), rootway-lookout,
solid-islands, dressing, tells, signs, corpses, stuck, reach-heroes rootway, level-quality, boss-read, mark-integrity (huntmaster), mobile-perf, textfit: all exit 0. pixels (headless floats): green.

## QUESTIONS FOR DANIEL
1. Mid-throw pods cannot reach the rope from the lip (pod range ~110 px, rope 144 px away): only UP-lobbed ones do. Built (rec): keep, the told arc shows it. Alt: widen pod range.
2. The sign at 302 still says arrow only (kept so the level hash holds). Rec: word it for both next time the level is re-stamped.
