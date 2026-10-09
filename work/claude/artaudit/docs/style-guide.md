# BRACKEN STYLE GUIDE v1 (art direction, 2026-10-09) - future art/UI lanes follow this
Source audit: scratch/audit-artdirection.md.

## Type (strict pair, nothing else)
- Display = Press Start 2P: titles, banners, big numbers. ALL CAPS, >= 16px.
- Body = Silkscreen: labels, rows, hints, dialogue. Mixed case, never below 8px, integer scale only.
- No system monospace on screen (boot included), no third HUD bitmap face. The Settings font switch becomes a readability option, not a style.
- Ladder: 8 (hint/footer), 12 (label/row), 24 (title). Same meaning = same size on every screen. Footers = button glyphs + one lowercase verb ("Z buy").

## Pixel scale
- One integer world scale per screen. Map: every sprite 2x (hero, nodes, bee, props, labels). Menus 2x. Mixed scales on one screen = bug.
- No rotated or non-integer-scaled pixel sprites (no rotating blades, no smooth clouds).
- Dither: ordered 2x2 at region edges only, never under text.

## Palette / contrast
- Per biome 12-16 colours: ramps of 4 (shadow, base, light, rim) + one accent. UI palette 6 colours: ink #e8dcc0, dim #9aa39a, gold #ffd34a, green #8fd160, red #e8503a, plate #14101e.
- Text on plate >= 7:1. Text over art always on a plate or a 1px dark outline, never over dither.
- Red = danger/hp only. Gold = money. Green = selected/ok.

## Panels
- One plate per screen region, plain 1px double line; corner studs only on the main frame. Function shapes: wood board (signs, map labels), parchment (saves, lore), dark ledger (store).
- A panel never covers what it describes (map panel off the selected node) nor the art's focal point (title).
- 16px safe margin, 8px padding, 24px rows, <= 8 visible rows with a "n/N" cue.

## Text density
- Row <= 28 chars. Blurb = 1 line that fits. Dialogue <= 2 lines x 28. Toast <= 5 words, 2s. Icon over sentence. One form per value (bar OR number).

## Animation
- Keyframed drawn poses, not tweens: anticipation (2-4f) -> strike (1-2f, smear) -> follow-through (2-3f) -> recovery. Prefer 2-3 held frames over 8 interpolated. Idle = 3-4 breathing frames. Squash/stretch via redrawn frames.
- Tells are poses: the actor's own wind-up pose + 1-frame white flash + sound. Danger zones = dithered floor decals in the biome accent. No flat red boxes/rect lines/ellipse rings (accessibility mode may add them).
- Hit-stop/shake by weight class (light 0, medium 2f, heavy 4f). Particles: hard 1-2px squares, <= 12 live.

## Lint ideas
One font pair per screen; no non-integer drawImage scale on sprites; no fillRect with rgba red in tell paths unless a11y; map label-overlap test; panel-over-selected-node test.
