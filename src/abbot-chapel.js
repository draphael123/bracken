/* src/abbot-chapel.js - THE FALSE ABBOT REWORK + THE ROOFTOP FINALE (claude/falseabbot, 11-05; Daniel 11-02 15:55 #4 and #6). Rows 0-31 of THE
   MONASTERY 3 laid again (only with its flag on: src/mon3-flag.js; master keeps the old belfry). Called from src/monastery3.js.

   THE BUILDING, left to right and bottom to top:
     THE WEST FRONT (x1-47, OUTSIDE)  the last wheel's trapdoor (35-45 @30) comes up on the aisle's leads, outside. THE ROOFTOP CLIMB: up the west
                                      front's stone string-courses, under the bell-cote's bells, to an arch high in the belfry's west wall. A bell at the
                                      top lets its rope down the front (the retry shortcut, unlocked from above). Birds outside only: a harpy on the wind.
     THE BELFRY (x49-93, floor 19)    the bells' storey over the chapel: two towers and the great bell's gallery, joined by bridges hung from bells.
                                      On the way in you walk through it and climb down THE GREAT BELL'S ROPE (x92) into...
     THE ABBOT'S CHAPEL (x49-93, 30)  his own chapel under the bells: the pews, the altar, two braziers, and THE ROOD hung from two bells.
   THE FIGHT (src/false-abbot.js, house.m3): P1 in the chapel; at half his blood THE FLOOR GOES (the belfry floor over the nave falls into the chapel as
   rubble steps) and he takes the rope up; P2 in the belfry. ONE main opening all fight (strike the bell with him on its bridge: it drops with him)
   and ONE second opening (he lights a brazier to pray: ride its smoke up and come down on him). The great bell is the last blow.
   Every number here is in tiles; main.js abbotHouse() makes the pixels. */
export function layAbbotChapel({ T, TS, W, set, at, block, air, boards, rope, ent, deco, coins, ents, movers, facades, masonry, interiors, hangers, flags }) {
  const TOP = 31;   /* rows 0..31 are this file's: the crawl's ceiling slab (30-31) is kept, its trapdoor too */
  /* ---- take up the old belfry: its tiles over the slab, its props, its house ---- */
  air(1, W - 2, 0, 29);
  const drop = (arr, keep) => { for (let i = arr.length - 1; i >= 0; i--) if (!keep(arr[i])) arr.splice(i, 1); };
  drop(ents, e => e.y > TOP - 1);                                  /* everything stood on the ringing floor (row 29) goes: the abbot, his bell, the signs, the dressing, the gate */
  drop(movers, m => m.y / TS > TOP);                               /* his chair's basket */
  drop(hangers, h => h[1] > TOP);
  drop(masonry, m => m[2] >= 30);                                  /* (the crawl's roof body 30-34 stays) */
  drop(facades, f => f[2] > TOP); drop(interiors, i => i[2] > TOP); drop(flags, f => Math.min(f[1], f[3]) > TOP);

  /* ================= THE WEST FRONT: THE ROOFTOP CLIMB (outside, x1-47) ================= */
  // the leads over the aisle are the crawl's slab (row 30); the trapdoor at 35-45 comes up here. The west front is a cliff of dressed stone with its
  // string-courses and buttress offsets standing out of it: the ledges, three rows apart, turning back and forth up to the belfry's arch.
  const ledge = (x0, x1, y) => { block(x0, x1, y, y); masonry.push([x0, x1, y, y]); };
  ledge(30, 32, 26); ledge(35, 37, 23); ledge(30, 32, 20); ledge(35, 37, 17);
  ledge(40, 47, 14);                                               /* the bell-cote's sill: the last ledge, under the bells, at the arch */
  ledge(24, 26, 23); ent('silver', 25, 22);                        /* off the first course: a mason's niche (a secret off the route) */
  ledge(44, 46, 11); ent('silver', 45, 10);                        /* up in the bell-cote over the sill, between its bells (the second) */
  facades.push([38, 47, 3, 13, 'monkArch', { spans: true, belfry: true }]);   /* THE BELL-COTE on the west gable: its open arches, its bells hung over the sill (art: bells) */
  deco(38, 13, 'bellFrame', 0); deco(46, 13, 'bellFrame', 1);
  // THE SHORTCUT (Salt & Sanctuary): the bell on the sill lets its rope down the west front to the leads - after a death, the trapdoor and the rope
  ent('tbell', 42, 13, { rope: [39, 14, 28] });
  ent('sign', 33, 29, { text: 'THE WEST FRONT. CLIMB ITS STONES TO THE BELFRY ARCH. THE BELL AT THE TOP LETS A ROPE DOWN.' });
  ent('harpy', 18, 17);                                            /* birds outside only: the wind on the west front */
  coins([31, 25], [36, 22], [31, 19], [36, 16], [43, 13]);
  deco(6, 29, 'prayerFlags', 0); deco(14, 29, 'bones', 1); deco(26, 29, 'lootHeap', 0);   /* the leads: what the goblins threw out of the windows */

  /* ================= THE BUILDING: walls, roof, the belfry floor (the chapel's ceiling) ================= */
  block(48, 48, 3, 29); air(48, 48, 11, 13);                       /* the west wall, and THE ARCH high in it (onto the west tower) */
  block(94, 94, 3, 29);                                            /* the east wall */
  block(48, 94, 3, 4);                                             /* the belfry roof (sky over it: the bells are heard, not seen, from outside) */
  block(48, 94, 19, 19);                                           /* THE BELFRY FLOOR: the chapel's vault */
  masonry.push([48, 48, 3, 29], [94, 94, 3, 29], [48, 94, 3, 4], [48, 94, 19, 19]);
  interiors.push([49, 93, 5, 18, 'monkTower'], [49, 93, 20, 29, 'monkChapel']);
  rope(92, 19, 29);                                                /* THE GREAT BELL'S ROPE, down through its hole in the floor into the chapel */

  /* ---- THE BELFRY (stage 2): two towers and the great bell's gallery at deck 13, bridges hung from bells; the great bell under the gallery ---- */
  boards(54, 13, 5); boards(67, 13, 8); boards(83, 13, 5);         /* the west tower, the gallery, the east tower */
  boards(59, 13, 8); boards(75, 13, 8);                            /* THE BRIDGES, hung from the towers' bells (main.js lays them again) */
  boards(59, 16, 3); boards(64, 16, 3); boards(76, 16, 3); boards(80, 16, 3);   /* the steps up */
  hangers.push([54, 14, 18], [58, 14, 18], [67, 14, 18], [74, 14, 18], [83, 14, 18], [87, 14, 18]);
  ent('tbell', 70, 18, { abbot: true });                           /* THE GREAT BELL: the last blow */
  ent('sign', 90, 18, { text: "THE GREAT BELL'S ROPE. DOWN IT IS HIS CHAPEL." });
  deco(51, 18, 'incenseStand', 0); deco(62, 18, 'bookshelf', 0); deco(85, 18, 'incenseStand', 1);

  /* ---- THE ABBOT'S CHAPEL (stage 1): the rood loft on its piers, hung from two bells; the pews; the altar and its braziers ---- */
  boards(55, 24, 5); boards(81, 24, 5);                            /* the rood's piers (stone-capped: art) */
  boards(60, 24, 21);                                              /* THE ROOD, hung from the piers' bells */
  boards(60, 27, 3); boards(78, 27, 3);                            /* the steps up */
  hangers.push([55, 25, 29], [59, 25, 29], [81, 25, 29], [85, 25, 29]);
  for (const x of [64, 68, 72]) { boards(x, 29, 3); deco(x + 1, 29, 'pew', 0); }   /* THE PEWS (a step up each): the congregation is called up out of them */
  deco(91, 29, 'shrine', 1); deco(90, 29, 'candelabra', 0); deco(50, 29, 'statue', 1, { defaced: true });   /* the altar; the founder in a goblin helmet */
  ent('sign', 52, 29, { text: 'HIS ROOD HANGS FROM TWO BELLS. STRIKE ONE WITH HIM ON IT: IT DROPS WITH HIM.' });
  ent('sign', 86, 29, { text: 'HE LIGHTS HIS BRAZIERS TO PRAY. RIDE THE SMOKE UP AND COME DOWN ON HIM.' });
  ent('abbot', 72, 29);
  ent('gate', 93, 29);
  coins([57, 23], [83, 23], [70, 23]);

  /* THE HOUSE, in tiles. stages[0] = the chapel, stages[1] = the belfry. bars: shut while he fights (the arch, the rope's hole), open again after.
     collapse: what THE FLOOR GOES takes out of the belfry floor and lays in the chapel as rubble steps (main.js abbotCollapse). */
  const house = { m3: true,
    stages: [
      { floor: 30, deck: 24, roof: 19, spans: [[55, 59], [81, 85]], bridges: [{ x0: 60, x1: 80, bells: [57.5, 83.5] }],
        braziers: [{ smoke: 51, spot: 53.5 }, { smoke: 89, spot: 86.5 }], ropes: [63, 70, 77], land: [50, 92], floorSpans: [[49, 93]], callAt: [65, 69, 73] },
      { floor: 19, deck: 13, roof: 4, spans: [[54, 58], [67, 74], [83, 87]], bridges: [{ x0: 59, x1: 66, bells: [55.5] }, { x0: 75, x1: 82, bells: [86.5] }],
        braziers: [{ smoke: 50.5, spot: 52.5 }, { smoke: 90, spot: 88 }], ropes: [57, 71, 85], land: [50, 92], floorSpans: [[49, 76], [81, 93]], callAt: [60, 65, 85] }],
    collapse: { hole: [77, 80, 19], rubble: [[77, 79, 21], [73, 75, 27]] },
    bars: [{ x0: 48, x1: 48, y0: 11, y1: 13, open: 'AIR' }, { x0: 92, x1: 92, y0: 19, y1: 19, open: 'NET' }],
    climb: [[74, 27], [70, 24], [78, 21], [82, 19]],   /* the way up after the floor goes (the lab's hands walk it): the rubble, the rood, the rubble, the belfry floor */
  };
  const arena = { x0: 49 * TS, x1: 94 * TS, floor: 30 * TS, y0: 22 * TS, trigger: 50 * TS, wallL: 48, wallR: 94, boss: 'abbot', music: 'roc', house,
    tint: '#e8c88a', tintA: 0.10, fx: 'motes' };
  /* calm: no sprinkled garrison up here - the climb has its harpy, the belfry and the chapel are his (the fight is the room) */
  return { arena, calm: [1, 94, 0, 29], island:[[48, 94, 3, 19, 'the belfry over the Abbot\'s chapel: its roof, walls and floor are one building on the crawl\'s slab']] };
}
