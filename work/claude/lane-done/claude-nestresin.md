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
