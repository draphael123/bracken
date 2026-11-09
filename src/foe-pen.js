// src/foe-pen.js - THE DEV PEN (claude/beastsbones; plan scratch/lane-reports/wolves-plan.md section 3). DEV ONLY (src/dev-flag.js): ?dev=1&pen=wolves|bear|bones|all loads THE STOCKADE's flat
// floor (the foe-tempo room), clears it, and sets the pen down; BK.pen(name) is the same thing as a test hook for tools (after BK.setDev(true)). Never reachable without ?dev=1.
// Rows are { t, dx } - a foe set down dx tiles from the hero, on his floor, facing him. The spawn cases work whatever the family flags say (BEASTS_SHIPS / BONES_SHIPS only gate the
// live placements and the bestiary cards), which is what makes a pen possible while everything is off.
export const PENS = {
  wolves: [{ t: 'snowrunner', dx: 6 }, { t: 'snowrunner', dx: 9 }, { t: 'greymane', dx: 24 }, { t: 'snowrunner', dx: 21 }, { t: 'snowrunner', dx: 27 }],   /* two runners; then Greymane leading two more */
  bear: [{ t: 'bruin', dx: 10 }],
  bones: [{ t: 'skelsoldier', dx: 7 }, { t: 'skelarcher', dx: 16 }, { t: 'skelmage', dx: 20 }],
};
PENS.all = [...PENS.wolves, ...PENS.bear.map(r => ({ ...r, dx: r.dx + 34 })), ...PENS.bones.map(r => ({ ...r, dx: r.dx + 46 }))];
export const PEN_NAMES = Object.keys(PENS);
export const PEN_LEVEL = 'stockade';
