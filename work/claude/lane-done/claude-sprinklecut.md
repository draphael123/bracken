# claude/sprinklecut - THE SPRINKLE CUT (game-wide)

Based on claude/batch44 (ed4b0e7), not master cd35d24.

## What changed
- src/level.js garrison(): every garrison row is halved (what the old 0.75 row put down, times SPRINKLE.sprinkle = 0.5; a kind that rounds to nothing is dropped). A budget
  (1 sprinkled foe per screen over the whole level) and a screen cap (2 in any one 30-column screen, and 22 rows on a tall level) stop the sprinkler where it used to crowd.
  The topiary row is gone from the Folly (mage): no sprinkled topiary.
- DESIGNED ENCOUNTERS (the SQUAD hook, src/foe-tactics.js SPRINKLE + PLAN): garrison() now places one squad in every level section (200 columns, or 60 rows on a tall level),
  BEFORE the sprinkle so the sprinkle steps round it. The spot is chosen by score: beside spikes, water or a barrel (+3 each), a ledge over a drop (+2), a low roof (+2), a
  short floor (+1). Squads: shield over a bow (storm, crown, burning), hornblower behind a brute (storm, harbor), a priest behind melee (spire, storm), a lone hedge knight or
  troll, tideguard + scout pairs at sea, armour + apprentice in the Folly, and so on (PLAN per level). Members stand two tiles apart on one floor, hero side first, tagged
  squad:'<level>-<n>', and are NOT garrison:true. Boss arenas, minis, ambush rooms and calm boxes are never touched (the sprinkler's spot list already excludes them).
- tools/sprinkle-cap.mjs (new, node only, in tools/check.mjs): screen cap, average cap, a designed encounter in every section (a section with no ground at all - an arena, a
  calm - is written down by the builder in L.squadBands and exempt), squads on one floor and never garrison-flagged, no sprinkled topiary.
- docs/LEVEL-DESIGN-GUIDE.md section 2: the FEWER, BETTER FOES rule for every future level lane.

## Sprinkled foes before -> after (garrison-flagged), and designed encounters added (foes / squads)
marsh 15->7 (+5/3), spore 10->4 (+6/3), scree 9->3 (+5/3), hanging 5->2 (+3/2), spire 24->7 (+4/2), moor 12->5 (+5/4), storm 27->13 (+6/3), crown 13->5 (+10/5),
longwater 19->11 (+4/3), reef 39->16 (+6/3), hurricane 18->8 (+8/4), lamplit 52->22 (+7/4), keep 60->25 (+9/4), causeway 37->15 (+7/4), harbor 80->35 (+10/6),
fields 10->5 (+3/3), burial 19->9 (+6/3), mage 20->12 (+2/2; topiary 4->0), fallingtower 8->2 (+8/5), burning 30->12 (+6/3), caravan 45->19 (+4/3).
Total sprinkled 552 -> 233 (a 58% cut; the "roughly half" is a little more because the budget bites the crowded sea and tower levels), designed foes added ~140.
Levels with no sprinkle row (wood, stockade, kings, flotilla, underleaf, deep, waymeet, undercrown, witchlight, oreroad, unburied) are hand-placed and untouched.
Sections with no ground (exempt): hanging 3, spire 3-4, storm 4, fields 4, mage 3-4, fallingtower 6 (arenas / calm boxes).
Witchlight's 4 topiary are the hand-placed garden (not the Folly, not sprinkled) and were left.

## Checks (all green)
sprinkle-cap (NEW; proved RED on a throwaway worktree of ed4b0e7: screen cap, average cap, no encounter in any section and the sprinkled topiary all fail on every crowded level),
architecture, checkpoints, skins, dangling-paths, boss-fight-end, npc-removal, slopes-trace (unchanged for every level, no rebase), checkpoint-gaps, death-cost, ambush-listed,
ambush-reach, ambush-single, foe-tactics, spawns, floaters, mother-pilot, small-adds (worst row 29%, limit 33%).

small-adds NEEDED A FIX: with the halved garrison the pinned dice shifted and the geomancer missed 3 of 5 sporelings on the Mother (60%); the base sat at exactly 33%, the limit. Cause: the pilot stood at reach-2, but the geomancer's stone lands 21-26 out. src/lab.js now stands her 4 px closer (reach-6) in the Mother's add branch; every row is now at most 29%.

## UNVERIFIED
- Nobody has PLAYED the halved levels. The squads are placed by score, not by hand: a squad may sit on a spot a designer would not choose. Play Harbor, Lamplit and Keep first.
- Squads that could not fit their whole template fall back to a single foe (a second pass) then to any kind of the level's row; a few encounters are therefore a lone foe.
- "Deadlier one-on-one via damage/AI": NOT changed here (see question 1). The only added behaviour is the existing shield-covers-shooter and horn/priest AI now meeting the hero in designed spots.

## QUESTIONS FOR DANIEL
1. Deadlier one-on-one: with about 58% fewer sprinkled foes, do you want COMBAT.commonDamage raised (1.25 -> 1.4; one line in src/combat.js)? Recommend: yes, but after you have felt the halved levels; built at 1.25 (unchanged).
2. Sections are 200 columns / 60 rows and one encounter each. Want denser (150) for the long levels (Harbor 1080, Highcrown 940)? Recommend: no, judge by play first.
3. Sea levels' squads are pairs like tideguard + scout, not shield/priest/horn kits (there are none in the sea). Want a sea-only cover/healer foe designed later? Recommend: yes, a Foe lane (Opus).
4. Spire lost most (24 -> 7): its 96-column shaft has too little room for a screen cap of 2. Fine, or keep 12? Recommend: fine.
