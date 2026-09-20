# The weapon shows the move

Rising cuts and low sweeps previously borrowed the ordinary combo or airborne slash. Warden's upward-pose branch followed the general attack branch and could never run. The same five-frame clock also put the Death Knight into a contact pose before his slower weapon became live, and returned Warden from her heavy lunge before its full reach expired.

All six heroes now have dedicated rising and sweeping sequences: preparation, travel, extension, recovery and return to guard. The existing body, palette and weapon rigs are retained, including Pyromancer's robe, Freebooter's holstered pistol and Knight's carried or thrown shield. Transparent headroom and an equal anchor shift allow weapons above the head without clipping or moving the feet. Every existing frame remains pixel-identical in world coordinates.

The presentation clock follows each weapon's current contact timings. Directional attacks take precedence over generic airborne and combo art. Warden's heavy extension remains visible through its .30 attack-clock cutoff. Spear thrusts leave a straight point trail; staff thrusts no longer also draw a sword arc. Rising and sweeping trails follow the corresponding direction, and combo-thrust glints stay within normal reach.

Damage, hitboxes, attack duration, stamina costs, movement, resources, invulnerability, enemy behaviour and save data are unchanged. This does not establish that every rendered weapon pixel matches every collision boundary; that remains a separate hitbox audit.

Validation:

- `tools/attack-animation.mjs` uses real inputs for all six heroes, both facing directions, rising attacks and sweeps. It checks contact and recovery poses plus greatsword preparation and heavy spear extension. It is included in `npm run check`.
- A baseline pixel comparison against the preceding commit verified 1,288 existing left/right frames and their unchanged ground alignment.
- Before/after pose sheets, a 72-frame sprite preview and six real-input in-game captures were inspected. The preview shows existing move timing; it is not a combat or campaign playthrough.

No extra attack was added in this pass. Warden already has Harrier and a dash-to-vault action for repositioning; their usefulness in constrained encounters needs playtesting before adding another control. Remaining class, boss pacing and campaign review items are tracked separately.
