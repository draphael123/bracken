# claude/ksarart - KSAR / HAWK-MISTRESS ART (sonnet, art + draw code only)
Branch claude/ksarart off claude/ksarhawk f485b7e8. Collision, hp, damage, timing, level hash: untouched (draw code only).

## Drawn (all in src/redraw/ksar_art.js unless noted)
- Hawk DOWN set (bakeHerHawk 8-12): 8 down+out (singed, embers, thin smoke), 9/10 burning loop (flames on wing/body/tail, smoke), 11 FALLING (tumbling, burning, smoke trail), 12 CRASH (impact frame: flat, dust, feathers, sparks). hands: fall -> 11, landing -> 12 for 0.14 s, then 9/10 at 8 Hz, 8 when nearly up; the old live flame rects removed (baked).
- Her own windup + release (B16): rakeWind/rakeSend (hawk cocked on glove + aiming hand -> glove flung out along the line), snatchWind/snatchDrop (gauntlet overhead, finger to sky -> slammed down), callWind/callCry (free arm up-and-back at the wall walk -> flung up, open palm). Wired in src/hawk-mistress-hands.js drawBoss; whistle A/B stay the whistle (and diveTell). New arm/glove keys + head 'up' tilt.
- Caravan wax seal icon (bakeCaravanSealIcon, 10x10): scalloped red wax, pressed crescent+star, gold cord, manifest corner.
- Brazier-with-torch-rack (ksar_props2.js drawBrazierRack): plinth, tripod fire-bowl, flame+smoke, side rack with n torches; used for arena torch racks (ksar-hands.js s.arena).
- Exit alcove arch (ksar_set.js drawExitArch): horseshoe voussoir arch over the 3x5 recess, keystone + crescent, jambs, shaded back wall + niche lamp, threshold; shows shut or open.
- Other shared frames checked: diveTell still shares whistleA/B (it is the whistle-send, fine); every other told move already has its own pose.

## Sheets (work/claude/shots/ksarart/)
before-mistress.png / after-mistress.png (all poses), new-pieces.png (new poses, hawk 8-12, seal), arena-east-arch.png, arena-brazier-west.png, ingame/hawk-down.png + roof-east.png.

## Self-grade (polish scorecard, C polish >= B): B. Poses read at game scale, hawk set and arch are solid; the seal is 10 px so reads as a red wax blob, the brazier rack is sparse next to the dark wall (B, not A).

## Checks
ksar tools 235 ok; boss-read ok; tells ok; mark-integrity (MI_ONLY=hawkmistress) ok (callTell/hawkGrabTell not sampled in its 40 s); boss-fight-end 62/62 ok. textfit: no new words, not run. Level hash unchanged (no level edits). Reds: none.

## Questions
1. Seal at 10 px is small; rec: keep size (HUD/pickup layout), or go 12x12 later if main.js layout allows.
