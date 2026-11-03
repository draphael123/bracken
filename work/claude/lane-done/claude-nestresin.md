# claude/nestresin - THE HORNET'S NEST: honey -> amber tree resin / sap (Daniel 11-03)
Reskin + rename only. Mechanics, timings, layouts, sprite sizes, hitboxes, frame counts untouched. Internal ids/filenames/save keys kept (honeyhornet, honey-hornet.js, HONEY_SAY, addHoney, PROP.honeyPot, hornets_nest_honey.js ...).

## Names (player-facing)
- foe 'FAT HONEY HORNET' -> 'AMBER HORNET' (bestiary name/sub/desc, short name, signs, hints, hit-name 'AN AMBER HORNET')
- 'THE HONEY HALL' -> 'THE RESIN HALL' (boss bar, P2 banner), 'THE HONEY WELL' -> 'THE SAP WELL' (section name)
- 'A HONEY DRIP' -> 'A RESIN DRIP'; 'HONEY: IT HOLDS YOUR FEET' -> 'RESIN: ...'; signs, stuck-spot line, queen's lines ('THE HALL TEARS: RESIN!', 'RESIN FLOODS THE FLOOR...'), honey-hunters -> resin-tappers; comments/tool messages too.
- docs/updates.json (3 lines) and README line 190 updated.
- Left alone: wax comb / 'honeycomb' wording, rootweaver 'bark and honey', Palisade/Rootway/Lumber Trail/Stormhold 'honey' colour words (other levels).

## Art
- Palette: honey gold -> deeper amber-brown resin (hue ~28-35, lighter values pulled down; dark rim kept for the translucent-with-dark-edge read): sticky patch, glob, drip nub/bead/string, sump+well beds, hall flood/floodFront/drips/splash/pin beads/stalk runs, resin-filled wall cells + stain, resin pot (art.js), drip prop.
- Trapped bits: bark flecks in patches/globs/beds, a stuck gnat on some patches.
- Seeps: the pine now weeps - split-bark cracks with amber runs and pooled beads on the trunk tile (hornets_nest_tiles.js barkTile) and on the ancient-pine backdrop sprite.
- Amber Hornet: amber belly/sac/glob palette deepened, plate rim amber lacquer, two resin runs over plate edges, a bark fleck and a gnat wing stuck in the coat.
- Wax comb tiles/curtains untouched.

## Checks
hornets-nest.mjs 267 ok; hornetsnest-fog 15 green; textfit (hints,bestiary,levelcard,boss,mapcard,plates; hornetsnest) 0 findings; restamp --level hornetsnest (pilot/curve/mash, verify level-quality + curve-gate green). Curve bot noise: hits 13->9, lostPct 67->44 WARN with NO gameplay change (sign text changed the level hash; pilot variance) - a human glance, not a regression signal. mash-gate RED on `moor` is pre-existing at base 5f856e7e (not touched).
Shots: scratch/lane-reports/nestresin/{before,after}-*.png

## Paper-nest pass (NOT done; would touch)
Wax comb -> grey-tan papery cells: hornets_nest_tiles.js (COMB/WAX palettes, hex lattice, 'honeycomb' wording), hornets_nest_sag.js (sagging combs, capped-cell wall, wallPat), hornets_nest_hall.js (royal comb, torn stalks), hornets_nest_backdrop.js (curtains, wall tiles, amber lights), hornets_nest_props.js/art.js (comb drops, smoke stands), + 'COMB'/'WAX' sign text ('FRESH COMB', 'CUT A HANGING COMB' stays valid as 'comb'). Mostly palette work; names ('comb') already fit paper nests.

## Questions (recommended answers)
1. Keep 'comb' wording for the paper cells? Yes - hornet nests have combs of paper cells.
2. Do the paper-nest recolour now? Yes, as its own small Sonnet art lane after this merges (the amber resin then reads against grey paper).
3. Rename FAT HONEY HORNET to plain AMBER HORNET (dropped 'FAT')? Done; the sprite is still fat - say if you want 'FAT AMBER HORNET'.

## PAPER NEST (11-03, Sonnet lane, commit on claude/nestresin)
Art + wording only. COMB / WAX palettes (hornets_nest_tiles.js) wax gold -> grey-tan paper; new BAND (grey/tan/cream) = wavy growth-band stripes on comb shelves, floor lips, hanging combs (props slab), pillars, brood-hall curtains; hex cells still visible; torn paper edge on cracked shelves + the underside of hanging combs. THE COMB STAIR wall PAPER ochre -> low-chroma tan and backdrop wall/lights desaturated so amber resin reads against it. Sag (brood-wall caps/walls), hall (royal comb, queen cells, lip), props (comb, brood cell, pillar), backdrop (curtains, motes, lights), crumble burst colours = paper. Resin drips under shelves/stalks/curtains kept amber. Nest-guard plate sprite already cream (unchanged). Wording: 'WAX PLATE'->'PAPER PLATE' (sign), bestiary NEST-GUARD 'paper plate / old paper'. Left: 'comb', rule text 'FRESH COMB IS STICKY', code ids (L.wax, waxed()), other levels' wax (bakeCombPlat = hive clearing, toll wax).
Checks: hornets-nest.mjs 267 ok; hornetsnest-fog 15 green; textfit hints,bestiary 0 findings (449 screens); restamp hornetsnest: level-quality + curve-gate green. Curve bot noise again (same gameplay): first run hits 9->19 lostPct 44->83, rerun 19 / 87 (before-resin 13 / 67): pilot variance, stamped with the rerun. mash-gate RED on `moor` is pre-existing.
Shots: scratch/lane-reports/nestresin/paper-{before,after}-{sagging-gallery,sump,sapwell-top,sapwell-rungs,comb-stair,tile-closeup,hall-p1,hall-p2-flood,hall-p2-flood-b}.png (sagging combs themselves only on the 4s count/regrow; sump = the gallery's pillar+comb).
