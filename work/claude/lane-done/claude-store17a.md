# claude/store17a - the skills store redesign and live ability previews (item 17a)

Branch claude/store17a (off master 5d25df0). Sonnet lane. No written 17a brief exists in the repo (only the note "store redesign + LIVE ability previews" in the handoff and storeui's report), so this is the conservative reading of it.

## What changed
1. NEW src/ability-preview.js: a small looping vignette (3.6 s) of one ability: the hero stands, casts (attack frame), and a training post takes it (flinches, is knocked back, marked, hooked, entombed as the ability says). 52 abilities map to about 30 drawn shapes (thrust, dash, boomerang, ring, quake, spin, wall, zone, spikes, hook, summon, rain, sky, pillar, arch, aura, mark...); an id it does not know draws a plain icon pop, so a new ability never breaks the screen. PURE DRAW: a function of (ability id, time, the hero frames and icon handed in). It reads no game state, writes none, uses no randomness, no timers, no saves.
2. SKILLS screen (the tree, where abilities are bought and put on F/G) was re-laid out: list on the left (162 px), the live preview on the right (135 x 76), then the stat line (damage, cooldown) and the description below as before. The row badges are measured, so long names still fit the narrower column. PASSIVES tab: the box shows the glyph, its category and "always on when it arrives" (nothing to perform).
3. STORE, SKILLS tab: the right-hand panel used to be a plain icon; it now runs the previews of your hero's abilities one after another (3.6 s each), with the name on top. The other store tabs are unchanged.
4. main.js edits are small: one import, a treePreview() helper, the list column edit in drawTree, one branch in drawStore, one line for the store's art squeeze. Icons and descriptions are read through the existing tables (skillIcon/treeIcon, n.desc), nothing copied, so the `icons` lane's changes flow straight through.
5. Prices, unlocks, the buy/equip flow and saves: untouched.

## Checks
- NEW tools/store-ui.mjs (in check.mjs): every active ability of all seven heroes has a shape; every ability draws and animates in the tree box and the pictures differ from each other; up/down moves the highlight; every store tab and item draws with no page error; a full cycle of tree + store leaves localStorage, PROG and the enemy list byte-identical; the preview draw uses zero Math.random calls across all 52 abilities x 36 times plus an unknown id; buying an ability from the tree and a skin from the store still work. PROVEN TO FAIL on the old code (master 5d25df0 in a throwaway worktree: "Failed to fetch dynamically imported module ability-preview.js").
- Green (see the last commit): store-ui, settings-tabs, progression-runtime, starter-kits, skins, dangling-paths, skill-menu, store-preview, shop-gates, shop-theme, hint-shown, talents, skill-passives (results listed in the final message).
- Captures: work/store17a/before-tree.png, after-tree.png (the tree), before2-store-skills.png / after-store-skills.png (the store tab); sheet.png is a contact sheet of 24 shapes mid-cast.

## UNVERIFIED
- Only headless Chrome; no real gamepad (the pad path is the same up/down/A the menus already read, not new code).
- The previews are drawn shapes, not the real simulation: they show the SHAPE and timing of an ability, not its exact numbers or reach. Some (spear dance, harrier, hook pulls) are approximations of the real motion.
- Hero frames come from the existing card bake (idle + attack); the hero is small (about 24 px) because it is drawn 1x so it stays crisp.

## QUESTIONS FOR DANIEL (recommendations built)
1. Drawn vignette or a real sandboxed sim? Built: the pure-draw vignette (cannot touch the game or a save). A real sim would show exact reach and damage but needs a second world running inside the menu. Rec: keep the vignette.
2. Co-op: the store and tree already belong to player one's hero, so the preview shows that hero. Rec: keep, unless you want player two's hero shown when player two holds the menu.
3. The other store tabs (heroes, skins, weapons, charms) were left as they are (they already show their own hero/skin/weapon animated). Rec: no further redesign until you say what is unclear.
4. Passives could also get a "what changes" picture. Rec: no, they are automatic and their text says it.
