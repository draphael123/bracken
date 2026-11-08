/* src/dev-pen.js - THE FOE TEST ROOM's pens (claude/foes, wolves-plan.md section 3). DEV ONLY: reachable only through ?dev=1&pen=<name> (src/dev-flag.js gates it) or the test hook BK.pen(name);
   a player has neither. main.js devPen loads THE STOCKADE (the flat floor tools/foe-tempo.mjs uses), clears it, stands the hero on a flat run and sets the pen down on his right.
   Each row is a foe and its distance in TILES from the hero's spot (negative = behind him). The three beast pens and the bones pen are the groups the plan names:
     wolves  2 snowrunners, then GREYMANE leading 2 runners        bear  BRUIN alone        bones  a soldier fronting an archer and a mage        all  the lot in one row */
export const PENS = {
  wolves: [{ t: 'snowrunner', dx: 9 }, { t: 'snowrunner', dx: 12 }, { t: 'greymane', dx: 21 }, { t: 'snowrunner', dx: 17 }, { t: 'snowrunner', dx: 24 }],
  bear: [{ t: 'bruin', dx: 13 }],
  bones: [{ t: 'skelsoldier', dx: 9 }, { t: 'skelarcher', dx: 17 }, { t: 'skelmage', dx: 21 }],
  all: [{ t: 'snowrunner', dx: 7 }, { t: 'snowrunner', dx: 9 }, { t: 'greymane', dx: 14 }, { t: 'bruin', dx: 19 }, { t: 'skelsoldier', dx: 23 }, { t: 'skelarcher', dx: 26 }, { t: 'skelmage', dx: 28 }],
};
export const PEN_NAMES = Object.keys(PENS);
/* the ents of a pen, given the hero's spot [tx, ty] (tile column and the row of his feet's air cell) */
export const penEnts = (name, spot) => (PENS[name] || []).map(r => ({ t: r.t, x: spot[0] + r.dx, y: spot[1], face: -1 }));
