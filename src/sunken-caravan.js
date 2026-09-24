// src/sunken-caravan.js — THE SUNKEN CARAVAN, the first level of the desert (docs/desert-arc-brief.md, row 1).
// Brief: .claude/briefs/sunken-caravan.md as amended by docs/briefs/sunken-caravan-amendments.md (no storm act).
//
// THE RULE (C2, F8): THE SUN. SHADE IS LIFE. Open sand builds SUNSTROKE (src/sunstroke.js): the view swims, then health
// goes; shade resets it in 1.2 s. Said three ways (C4): the swimming view and the sun meter on the HUD, the violet of every
// shade on the screen, and the signs and the lone awning in the first section.
//
// THE GEOMETRY IS THE GREYBOX'S, UNCHANGED: src/draft/sunken-caravan.js builds the ground, the landmarks and the furniture,
// and tools/caravan-level.mjs + tools/draft-level.mjs keep measuring it (seven sections, five landmarks, the sun stretches,
// slopeLint). This file only turns the draft into a level the game can run:
//   - the draft's own creature roster comes out; the level's GARRISON row in src/level.js puts the crowd down instead,
//     so there is one source for who lives here (scorpion, sand goblin, vulture - all three new - and the camp's looters)
//   - the static shade (wagons, awnings, the ribcage, the caravanserai, the rim's overhang) is said as L.shade rects once,
//     here, and the props that cast it become dressing (deco) the game already knows how to stand on the ground
//   - the camp's machine is an 'awningwinch' (the name 'winch' is the Highcrown gate winch's)
//   - THE WORM'S HOLLOW is built but holds NO BOSS YET: THE DUNE WORM (src/dune-worm.js) is its own session (the brief's
//     build order: "level, then boss"), so the level ends at a gate at the far side of the hollow. L.hollow keeps the
//     arena's numbers for that session.
//   - one ambush room (RULES Q): THE TRADERS' YARD, under the great awning, led by THE OLD STINGER
import { buildSunkenCaravan as buildDraft, CARAVAN_BASE } from './draft/sunken-caravan.js';
import { shadeZones } from './sunstroke.js';

export const CARAVAN_FOES = new Set(['scorpion', 'sandgob', 'vulture']);
const DRAFT_FOES = new Set(['scorpion', 'sandgob', 'vulture', 'bandit', 'archer']);

export function buildCaravan({ T, TS }) {
  const L = buildDraft(T);
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : L.grid[y * W + x];
  const top = x => { for (let y = 0; y < H; y++) if (at(x, y) !== T.AIR && at(x, y) !== T.PLANK && at(x, y) !== T.ONEWAY && at(x, y) !== T.NET) return y; return H; };
  /* 1. THE SHADE, said once as rects: shadeZones reads the wagons and awnings off the ents, and adds the draft's own L.shade */
  L.shadeArt = (L.shade || []).slice();   /* the shade no prop's art paints (the ribcage, the caravanserai, the overhang): main.js tints these */
  L.shade = shadeZones(L);
  /* 2. the draft's roster out (the GARRISON row puts the level's crowd down) */
  L.ents = L.ents.filter(e => !DRAFT_FOES.has(e.t));
  /* 3. the props become dressing the game draws and grounds (deco kinds; src/main.js's caravan block bakes them) */
  let wv = 0;
  for (const e of L.ents) {
    if (e.t === 'wagon') { e.t = 'deco'; e.kind = e.sunk ? 'wagonSunk' : 'wagon'; e.v = (wv++) % 2; }
    else if (e.t === 'awning') { e.t = 'deco'; e.kind = e.torn ? 'awningTorn' : 'awning'; e.v = e.torn ? 1 : 0; }
    else if (e.t === 'standard') { e.t = 'deco'; e.kind = 'caravanStandard'; }
    else if (e.t === 'winch') { e.t = 'awningwinch'; }
    else if (e.t === 'deco' && e.kind === 'ribs') e.kind = 'oxRibs';
    else if (e.t === 'deco' && e.kind === 'skull') e.kind = 'oxSkull';
  }
  /* THE SUNK WAGONS stay where the draft puts them, IN the pit cell on the rock under the quicksand: the quicksand is drawn over
     the dressing (drawCaravan runs after the deco), so the wagon's lowest tile goes under the sand and it reads as sunk. It was
     lifted a row once, which stood it on nothing (tools/audit.mjs, the play bot) and the loader set it back down anyway */
  /* A SIGN STANDS ON THE FLAT. A signpost's post is square, so one planted on a slope tile has its foot in the sand on the
     high side (tools/headless.mjs floats found the first sign doing it): walk it back to the nearest flat column */
  const slope = t => t >= 20 && t <= 25;
  for (const e of L.ents) if (e.t === 'sign') { let x = e.x; while (x > 1 && slope(at(x, top(x)))) x--; if (x !== e.x) { e.x = x; e.y = top(x) - 1; } }
  /* A SILVER HANGS WITHIN A PLAIN JUMP OF THE FLOOR UNDER IT: two rows over the cell you stand in, the height the reach model
     calls "near" (src/reachcore.js). The draft's wagon silver hung three over the wagon's boards, which the play bot's reach
     called out of the fill; lowered to two it is still "up on the wagon, then a jump" */
  const stands = t => t !== T.AIR && t !== T.SPIKE;
  for (const e of L.ents) if (e.t === 'silver') { let y = e.y + 1; while (y < H && !stands(at(e.x, y))) y++; if (y - 1 - e.y > 2) e.y = y - 3; }
  /* 4. the quest: three of the caravan's own coffers lost along the road */
  for (const e of L.ents) if (e.t === 'stray') e.kind = 'coffer';
  L.quest = { n: 3, item: 'coffer', name: "TRADER'S COFFER", done: "THE CARAVAN'S TAKINGS ARE FOUND", thanks: "THE TRADER'S THANKS" };
  /* 5. the relic, in the trader's tent: a veil against the sun (RELICS.veil in src/main.js) */
  for (const e of L.ents) if (e.t === 'relic') e.kind = 'veil';
  /* 6. THE HOLLOW: no boss yet. The arena's numbers are kept for the worm's session, and the gate stands at the far wall */
  L.hollow = L.arena; delete L.arena;
  { const ax1 = L.hollow.wallR - 2, gy = top(ax1) - 1; L.ents.push({ t: 'gate', x: ax1, y: gy });
    L.ents.push({ t: 'sign', x: L.hollow.wallL + 12, y: top(L.hollow.wallL + 12) - 1, text: 'SOMETHING LIVES UNDER THIS HOLLOW. NOT TODAY.' }); }
  /* 7. THE TRADERS' YARD: the ambush room (RULES Q), the camp's flat under the great awning. The winch stands inside it on
     purpose: wind the awning in and the looters are in the sun with you. */
  { const x0 = L.marks.winch, row = top(x0) - 1, wallL = x0, wallR = x0 + 32;
    const foot = x => top(x) - 1;
    L.ambushes = [{ name: "THE TRADERS' YARD", row, wallL, wallR, check: [x0 - 4, foot(x0 - 4)],
      waves: [[['scorpion', x0 + 16, foot(x0 + 16)], ['thief', x0 + 5, foot(x0 + 5)], ['thief', x0 + 29, foot(x0 + 29)], ['sandgob', x0 + 23, foot(x0 + 23)]]] }]; }
  /* 8. dressing a desert has: scrub and a dead tree or two, bleached against the sky, placed on flats */
  L.palette = { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(236,206,160,0.12)' };   /* no grass strip in front of a desert (noFg), no bough or blades framing the lens (noNear), and a warm haze, not the wood's green default */   /* main.js's cvBackdrop lays the sky, the mesas and the dunes */
  /* THE ROCK: what the draft builds of sandstone rather than sand (the arch's lintel, the caravanserai, the rim's overhang), so it is
     skinned as rock. The same arithmetic as the draft's own, off its marks */
  { const m = L.marks;
    const archRow = (() => { for (let y = 0; y < H; y++) if (at(m.arch, y) === T.SOLID) return y; return 0; })();
    const cs = m.caravanserai, csRoof = (() => { for (let y = 0; y < H; y++) if (at(cs, y) === T.SOLID) return y; return 0; })();
    const ov = L.hollow.wallL + 3, ovRow = (() => { for (let y = 0; y < H; y++) if (at(ov, y) === T.SOLID) return y; return 0; })();
    L.rockZones = [[m.arch - 3, m.arch + 7, archRow, archRow], [cs, cs + 6, csRoof, top(cs - 1) - 1], [ov - 1, ov + 5, ovRow, ovRow]];
    /* AND IT IS A ROOM: the tower's inside gets a back wall (drawRoomPaint 'caravanserai' in main.js), so it reads as a place you
       climb through - door, shelf, shelf, hatch - and not as posts against the sky. The same rect is the reverb and the no-grass rule */
    L.interiors = (L.interiors || []).concat([[cs + 1, cs + 5, csRoof + 1, top(cs - 1) - 1, 'caravanserai']]); }
  L.music = 'musBeach';   /* PARKED (see the lane report): no desert track in audio/, and this lane downloads nothing. MintoDog's CC0 "beach"
                             stage theme is the warmest one there is; tools/newlevel.mjs flags it as shared, deliberately */
  L.ambient = [{ x0: 0, x1: 99999, kind: 'wind' }];
  L.sun = true; L.caravan = true;
  L.base = CARAVAN_BASE;
  return L;
}
