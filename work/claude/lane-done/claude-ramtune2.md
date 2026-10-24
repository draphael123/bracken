# claude-ramtune2 - RAM LORD EASIER (branch claude/ramtune2, base 408eb9bc)
Changes: src/ram-lord.js RAM.stunMul 4 -> 8, crashMul 4 -> 6 (hp unchanged 3600). Tell: while he stands in an armed overhang's fall line the slab shakes,
grit/pebbles fall through the line, the prop gets a pulsing gold ring + a bouncing gold arrow above it, and the fall line on the floor is a bright pulsing band;
all stops when he leaves the line (L.glow decays 0.25 s). Applies to the fold's two overhangs and the road's 'overhang' props (shared drawLip).
Bestiary text (src/main.js) fixed: stun = blows land EIGHT times over, wall crash = six times, plus the cue.
PNGs: work/claude/ramtune2/tell-before.png (he is away, no tell) and tell-after-inline.png (ring, arrow, floor band, shaking slab).
## Rates (scree, campaign L8, n=12 per hero)
- human WITH flasks: knight 11/12, warden 10/12, pyro 12/12 = 92% (was target band 60-70: HIGH +22, as Daniel asked for easier)
- human+dry: knight 7/12, warden 9/12, pyro 12/12 = 78%
- mean fight time with flasks: knight 41 s, warden 44 s, pyro 28 s (dry 36/40/28 s)
- mash bot 0/6 (all dead; boss left 55-99%)
## Checks
tools/ram-lord.mjs green (all ok); textfit bestiary --strict 0 issues; boss-fight-end: scree ends on death; only pre-existing hornetsnest 'UNKILLABLE BY SCRIPT'.
Not run: LQ (no level edits).
## QUESTIONS FOR DANIEL
1. 92% flasks / 78% dry is well above band (60-70). Kept as asked. Rec: if still too easy later, restore stunMul 6 (not 4); or raise hp, not multipliers.
