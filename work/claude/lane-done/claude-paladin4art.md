# claude/paladin4art - PALADIN 4 ART (Sonnet art lane, 10-15)
Base: origin/claude/paladin4 10b67551. Port 8957. Art only - no numbers changed. Self-grade: **B**.

## DRAWN
1. SANCTUARY STEP: own 3-frame pose 'sStep' (plant, push with hammer held across + light smear, land). The PATCH is now a floor glyph (a cross of light, pool, ticks, flickers out) instead of the aura draw (holy-ground.js drawPatch).
2. PRAYER: own pose 'pray' (clasped hands on planted haft, halo over bowed helm, cross glint on 2nd beat) via crouch-b pose(); a rising ring + cross glint FX on each pip earned (HFX.pray).
3. DAWNFALL: its own wide pillar of dawn (HFX.dawn): broad foot, tall shaft, floor rays, two rings, motes falling (no longer Verdict's column).
4. LIGHT-WARD: all-round dome (rim, dim back half, turning ribs, equator, crown glint, brighter a beat after a block: P.wardHitAt) + SHATTER on WARD BROKEN (flare, cracks, 18 shards).
5. TWIN SMITE: both blows the empowered column (taller, white edges, crown, extra ring); second blow its own backhand pose 'smiteB'. RADIANCE+: pose 'radiancePlus' + disc, 2nd ring, halo, green mend ring.
6. JUDGED: pose 'vRelJ' (gavel, crown, scales) + HFX.judged (broad golden column, falling SCALES that snap level, ring of 8 ticks).
7. SPEAR OF LIGHT: poses 'lanceDraw' (0.5 s wind-up, 2 beats) and 'lanceThrow'; baked spear sprite with fletching, leaf head, ghost trail.
8. HUD: group bars over 1-2 / 3-4 / 5 with end drops; light as each tier becomes spendable.
Tools: tools/paladin4-art-sheet.mjs, tools/paladin4-art-shots.mjs (not in suite).

## CHECKS (port 8957, one at a time) - all GREEN
paladin-kit, ability-poses (76/76), skill-icons, hero-trials, attack-animation, plunges, crouch-b, textfit hints,hud,practice,pick,tree,store --strict (0 everywhere), mobile-perf. crouch-b.mjs edit: the pose it expects while praying is renamed 'kneel' -> 'pray' (rename, nothing loosened).

## HONEST GRADE (B)
Good: every Paladin 4 move now has its own body/FX, HUD groups read, spear/pillar/dome read at game scale. Not A: poses are pixel work on the knight rig; the lanceThrow/lanceDraw hammer hangs at his foot; the ward shatter shards are small/brief; JUDGED scales float loose above the head in pose; shots only eyeballed in a few scenarios (twin, radplus, judged strips not reviewed closely).

## QUESTIONS FOR DANIEL (rec = built)
1. Prayer pose replaces the kneel for the paladin (old 'kneel' kept as fallback). Rec: keep.
2. Twin Smite shows the empowered column on BOTH blows. Rec: keep. Alt: only the second.
3. The ward dome is drawn for the paladin only; the knight shield draw is untouched. Rec: keep.
