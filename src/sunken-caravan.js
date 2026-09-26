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
//     so there is one source for who lives here (scorpion and vulture, and the looters: THE BANDITS - the cutthroat, the rooftop
//     slinger and the sand-cloaked ambusher, in the goblins' place since 2026-09-25: docs/briefs/caravan-ruins-bandits.md)
//   - the static shade (wagons, awnings, the ribcage, the caravanserai, the rim's overhang) is said as L.shade rects once,
//     here, and the props that cast it become dressing (deco) the game already knows how to stand on the ground
//   - the camp's machine is an 'awningwinch' (the name 'winch' is the Highcrown gate winch's)
//   - THE WORM'S HOLLOW is the arena, and THE DUNE WORM IS IN IT (2026-09-25, claude/duneworm; docs/briefs/dune-worm.md): the
//     level's machine comes back as his opening - THE HOLLOW WINCH rolls a second great awning out over the middle of the
//     hollow, and his breach that comes up under it comes up into the canvas. The level still ends at the gate at the far side
//     of the hollow: it opens when he dies (L.gateAfterBoss), and you walk to it. L.hollow is the arena, by its old name.
//   - one ambush room (RULES Q): THE TRADERS' YARD, under the great awning, led by THE OLD STINGER
import { buildSunkenCaravan as buildDraft, CARAVAN_BASE } from './draft/sunken-caravan.js';
import { shadeZones } from './sunstroke.js';

export const CARAVAN_FOES = new Set(['scorpion', 'vulture', 'cutthroat', 'slinger', 'ambusher']);
const DRAFT_FOES = new Set(['scorpion', 'sandgob', 'vulture', 'bandit', 'archer', 'cutthroat', 'slinger', 'ambusher']);

export function buildCaravan({ T, TS }) {
  const L = buildDraft(T);
  const W = L.W, H = L.H, at = (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : L.grid[y * W + x];
  const top = x => { for (let y = 0; y < H; y++) if (at(x, y) !== T.AIR && at(x, y) !== T.PLANK && at(x, y) !== T.ONEWAY && at(x, y) !== T.NET) return y; return H; };
  /* 1. THE SHADE, said once as rects: shadeZones reads the wagons and awnings off the ents, and adds the draft's own L.shade */
  L.shadeArt = (L.shade || []).slice();   /* the shade no prop's art paints (the ribcage, the caravanserai, the overhang): main.js tints these */
  L.shade = shadeZones(L);
  /* 2. the draft's roster out (the GARRISON row puts the level's crowd down) */
  L.ents = L.ents.filter(e => !DRAFT_FOES.has(e.t) || e.placed);   /* ...but the ones the draft PLACES (e.placed: RULES S1, a foe where it makes the ground harder) stay where they are */
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
  /* 6. THE HOLLOW: THE DUNE WORM's arena (docs/briefs/dune-worm.md). Forty tiles, entered from the left (RULES I).
       +2..+8   the rim's overhang (the draft's): the one shade he can never take
       +8, +32  two wagon wrecks: dressing and sun-shade. The greybox's middle wreck at +20 goes - the awning stands there now
       +12      THE HOLLOW WINCH (the level's machine, F5, a second time) and +14..+26 THE GREAT SHADE it rolls out, 5 rows up on
                two posts: his breach that comes up under it comes up INTO it - TANGLED, double damage (THE OPENING, A11). It
                starts OUT: the sun sends you under it, and the first ripple teaches the rest. He tears it down each time, and
                the winch winds it out again
       +37      the level's GATE: it ends the level after his death (L.gateAfterBoss), not before
     The worm sleeps under the middle of it and wakes when you cross the trigger. His music is boss2 (the greybox's: no desert
     track in audio/, and nothing is downloaded - see the lane report). */
  L.hollow = L.arena; L.arena.music = 'boss2';
  { const ax0 = L.arena.x0 / TS, ax1 = L.arena.wallR - 2, gy = top(ax1) - 1, floorRow = L.arena.floor / TS;
    L.ents = L.ents.filter(e => !(e.t === 'deco' && (e.kind === 'wagon' || e.kind === 'wagonSunk') && e.x === ax0 + 20));
    L.ents.push({ t: 'gate', x: ax1, y: gy });
    L.ents.push({ t: 'awningwinch', x: ax0 + 12, y: top(ax0 + 12) - 1, hollow: true, canopy: { x0: ax0 + 14, x1: ax0 + 26, row: floorRow - 5 } });
    L.ents.push({ t: 'deco', x: ax0 + 14, y: top(ax0 + 14) - 1, kind: 'canopyPost', behind: true }, { t: 'deco', x: ax0 + 26, y: top(ax0 + 26) - 1, kind: 'canopyPost', behind: true });
    L.ents.push({ t: 'duneworm', x: ax0 + 20, y: top(ax0 + 20) - 1, face: -1 });
    L.ents.push({ t: 'sign', x: ax0 - 6, y: top(ax0 - 6) - 1, text: 'HE COMES UP UNDER YOU. WIND THE SHADE OUT AND LET HIM COME UP INTO IT.' });
    L.gateAfterBoss = true; }
  /* 7. THE TRADERS' YARD: the ambush room (RULES Q), the camp's flat under the great awning. The winch stands inside it on
     purpose: wind the awning in and the looters are in the sun with you. The looters are bandits since 2026-09-25 (no goblins): two
     cutthroats on the flat and a slinger up on the stacked cargo, under THE OLD STINGER */
  { const x0 = L.marks.winch, row = top(x0) - 1, wallL = x0, wallR = x0 + 32;
    const foot = x => top(x) - 1;
    L.ambushes = [{ name: "THE TRADERS' YARD", row, wallL, wallR, check: [x0 - 4, foot(x0 - 4)],
      waves: [[['scorpion', x0 + 16, foot(x0 + 16)], ['cutthroat', x0 + 5, foot(x0 + 5)], ['cutthroat', x0 + 29, foot(x0 + 29)], ['slinger', x0 + 26, foot(x0 + 26)]]] }]; }
  /* 8. dressing a desert has: scrub and a dead tree or two, bleached against the sky, placed on flats */
  L.palette = { set: 'desert', near: 'none', dress: 'desert', noFg: true, noNear: true, haze: 'rgba(236,206,160,0.12)' };   /* no grass strip in front of a desert (noFg), no bough or blades framing the lens (noNear), and a warm haze, not the wood's green default */   /* main.js's cvBackdrop lays the sky, the mesas and the dunes */
  /* THE ROCK: what the draft builds of sandstone rather than sand (the arch's lintel, the caravanserai, the rim's overhang), so it is
     skinned as rock. The same arithmetic as the draft's own, off its marks */
  { const m = L.marks;
    const archRow = (() => { for (let y = 0; y < H; y++) if (at(m.arch, y) === T.SOLID) return y; return 0; })();
    const cs = m.caravanserai, csRoof = (() => { for (let y = 0; y < H; y++) if (at(cs, y) === T.SOLID) return y; return 0; })();
    const ov = L.hollow.wallL + 3, ovRow = (() => { for (let y = 0; y < H; y++) if (at(ov, y) === T.SOLID) return y; return 0; })();
    L.rockZones = [[m.arch - 3, m.arch + 7, archRow, archRow], [ov - 1, ov + 5, ovRow, ovRow]];   /* the caravanserai is laid stone since 2026-09-25, like the town it stands in (L.masonry, the draft's) */
    /* AND IT IS A ROOM: the tower's inside gets a back wall (drawRoomPaint 'caravanserai' in main.js), so it reads as a place you
       climb through - door, shelf, shelf, hatch - and not as posts against the sky. The same rect is the reverb and the no-grass rule */
    L.interiors = (L.interiors || []).concat([[cs + 1, cs + 5, csRoof + 1, top(cs - 1) - 1, 'caravanserai']]); }
  L.music = 'musBeach';   /* PARKED (see the lane report): no desert track in audio/, and this lane downloads nothing. MintoDog's CC0 "beach"
                             stage theme is the warmest one there is; tools/newlevel.mjs flags it as shared, deliberately */
  L.ambient = [{ x0: 0, x1: 99999, kind: 'wind' }];
  L.sun = true; L.caravan = true;
  L.ledgeKit = 'desert';   /* main.js: ONEWAY/PLANK art picked per tile (ruin lintel / rock shelf / sandstone lip), real timber (L.timberPlanks, the draft's) kept as wood - any desert level can set this, not just this one */
  L.base = CARAVAN_BASE;
  return L;
}
