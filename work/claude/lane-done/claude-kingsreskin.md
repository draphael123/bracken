# claude/kingsreskin - KINGSWOOD COURT RESKIN (11-03) - art only, no foe moved or added

NAMES (bestiary rows + threat/death names via cnSkin):
- KING'S SHIELD (shield) - crimson tabard, steel helm with gold circlet + crimson plume, crimson shield with gold boss/cross. Also Gorm's own 'shield' guards in his hall fight (spawnEnt goes through L.reskin).
- COURT HALBERDIER (pike) - crimson tabard, gold-banded cap + white plume, pike head grown an axe-blade, gold collar, crimson pennon.
- ROYAL BRUTE (brute) - crimson surcoat, gold belt, steel pauldrons with gold studs, half-helm with gold crown-band, iron-shod club.

WHAT CHANGED
- src/redraw/kings_court_foes.js (new): three bakes = the goblin's own sheet recoloured + dressed (same frame count, canvas size, anchor, hit box; AI/stats untouched).
- src/kingswood.js: `reskin: { shield: 'kingsshield', pike: 'courthalberd', brute: 'royalbrute' }` (same L.reskin mechanism as Sporewood/Underleaf/Palisade; other levels' goblins untouched).
- src/main.js: import + SPR bakes, 3 bestiary rows; src/audio.js: hurt/die voices inherit from shield/pike/brute.
- tools/corpses.mjs: 'kings' added to ALL_IDS; tools/kingsreskin-shots.mjs: before/after shot tool.
- In Kingswood: 7 shields, 3 pikes, 5 brutes reskinned (placement lane's data untouched).

CHECKS (port 8261, one browser at a time, >=1.4 GB free)
- levelHash kings = 892e32310112 on master and on this branch: NO restamp needed.
- textfit bestiary: 346 screens, all zeros. voices-check ok (346 types). corpses (CORPSES_ONLY=kings): all 3 skins die/hurt in their own skin, ok.
- node --check main.js ok. Filenames (kings_court_foes, kingsreskin-shots) not ad-block-like.
- NOT run: full suite / art lane gates; content-audit + audit-audio started but not awaited.

SCREENSHOTS: scratch/lane-reports/kingsreskin/{shield,pike,brute}-{before,after}.png (6x crops in Kingswood), sprite-sheet.png (new vs base frames), base-sheet.png.

QUESTIONS (recommended answer first)
1. Is "ROYAL BRUTE" confusable with the Royal Boar mini? Rec: keep (Daniel's suggested name); alt "COURT BRUTE".
2. The crimson King's Shield reads close to the red canopy in the Procession; rec: ship as is (dark outline + gold boss separate it); a steel-blue shield face is the fallback if it blurs in play.
3. Escape sprig->wasp swaps belong to the placement lane; no art needed.
