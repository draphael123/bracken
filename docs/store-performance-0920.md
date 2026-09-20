# Store tabs keep only the pictures they show

Cold skins and weapons tabs baked full gameplay animation sets for every visible row, including mirrored frames, hurt flashes, directional attacks and the Knight's shieldless set. In the reported environment, each tab allocated over8,600 canvases and blocked for3.6–3.8seconds.

The sprite bakers now share idle/attack frame factories between gameplay and lightweight store cards. List rows build one thumbnail. Only the selected item builds its visible idle animation or two weapon frames. The cache distinguishes hero, skin, weapon and thumbnail/animated use. Warden skins now correctly use her own rig; hero previews also invalidate when skin or weapon changes.

The same isolated-browser measurement fell to82.5ms for skins and61.6ms for weapons, with96/80 total canvas allocations (including text). Revisited tabs took2.7–3.4ms and allocated no new canvases. These are local measurements, not hardware-independent guarantees.

All3,284 gameplay sprite canvases matched the pre-change source byte-for-byte. All156 complete idle/attack preview frames and the thumbnail variants match their full gameplay equivalents across six heroes and two palettes. The screenshot was inspected. tools/store-preview.mjs checks pixels, cached revisits, real right-arrow tab inputs and bounded allocations across every tab for all six heroes; it is part of npm run check. Purchases, prices, saves and combat behavior are unchanged.
