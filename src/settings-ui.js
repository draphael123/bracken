// src/settings-ui.js - THE SETTINGS, IN TABS (claude/storeui, HANDOFF item 18).
//
// The Settings list used to be one 70-row scroll under four headers. It is now five tabs, and this file is the one place that says
// which row lives on which tab. It holds NAMES ONLY: what a row shows and what it does when it is turned is still main.js's
// menuAdjust / menuConfirm / drawMenu, keyed by the row's name, and every row keeps the SET key it always had (nothing here reads or
// writes a saved value, so no save can break). tools/settings-tabs.mjs proves every row of the old list is on exactly one tab.
//
//   AUDIO          music, effects, voices, ambience, volumes, the sound test
//   DISPLAY        GRAPHICS (LOW / MEDIUM / HIGH presets), picture size, theme, font, text colour, camera, numbers, the look of the wood
//   GAMEPLAY       difficulty, hit stop, helpers, and (headed off below) saves + testing
//   CONTROLS       what each button does for your hero, REBINDING (keyboard + each pad), block hold/toggle, rumble, the co-op guide
//   ACCESSIBILITY  READING (big text, the clock, colour tells, a rim on foes) and MOTION AND FLASHES (reduce motion, flashes, screen shake + strength)
//
// The list a tab hands the menu starts with '@TABS' (the strip, a selectable row: left/right change tab) and ends with 'Back'.

export const TABS = [
  { id: 'audio',    name: 'AUDIO',         short: 'AUDIO' },
  { id: 'display',  name: 'DISPLAY',       short: 'DISPLAY' },
  { id: 'gameplay', name: 'GAMEPLAY',      short: 'GAMEPLAY' },
  { id: 'controls', name: 'CONTROLS',      short: 'CONTROLS' },
  { id: 'access',   name: 'ACCESSIBILITY', short: 'ACCESS' },
];

import { isDev } from './dev-flag.js'; import { DEMO } from './demo-flag.js';
/* (claude/demohide, Daniel 11-07 DEMO LOCKDOWN) the demo has no GOD MODE (SET.invincible) and no UNLOCK ALL LEVELS (SET.allLevels): the rows are not listed, a saved ON is ignored
   (SET reads false), and the saved value is kept aside so the settings file is written back unchanged. The full game (flag off) is untouched. */
export const DEMO_HIDDEN_ROWS = ['God mode', 'Unlock all levels'];
const DEMO_FIELDS = ['invincible', 'allLevels'];
export const rowHidden = (k, demo = DEMO) => !!demo && DEMO_HIDDEN_ROWS.includes(k);
export function demoLock(SET, saved, keep, demo = DEMO) { if (!demo) return; for (const f of DEMO_FIELDS) { keep[f] = saved[f]; SET[f] = false; } }
export function demoSaveOut(SET, keep, demo = DEMO) { if (!demo) return SET; const out = { ...SET }; for (const f of DEMO_FIELDS) { if (keep[f] === undefined) delete out[f]; else out[f] = keep[f]; } return out; }
/* (claude/demoend2 DEVOFF, Daniel 11-07) the demo lists no developer rows: the FPS / UPDATE / DRAW readout, the hitbox overlay and the TESTING header over them. The rows are not shown and a saved value is IGNORED at the draw (main.js), never rewritten. */
export const DEMO_DEV_ROWS = ['FPS counter', 'Hitboxes', '- TESTING -'];
export const devRowHidden = (k, demo = DEMO) => !!demo && DEMO_DEV_ROWS.includes(k);
export const TAB_ITEMS = {
  audio: ['Sound test', 'Music', 'Music volume', 'Effects vol', 'Ambience vol', 'UI volume', 'Sound FX', 'Character voices'],
  display: ['- PICTURE -', 'Graphics', 'Full screen', 'Pixel scale', 'Camera', 'Brightness', 'Screen filter', 'Scanlines', 'Film grain', 'Vignette',
    '- LOOK -', 'UI colour', 'Text colour', 'HUD', 'Gear tiers', 'Foe health', 'Boss health', 'Hit numbers', 'Tenths', 'FPS counter',
    '- WORLD -', 'Ground light', 'The air', 'Parallax', 'Arena tint', 'Weather', 'Ambient life', 'Look down', 'Look ahead',
    '- EFFECTS -', 'Particles', 'Impact FX', 'Boss intro'],
  gameplay: ['- RULES -', 'Difficulty', 'Game speed', 'Hit stop', 'Iron Knight',
    '- HELPERS -', 'Hints', 'Jump assist', 'Way-on arrow', 'Text speed', 'Transitions', 'Unlock all levels',
    '- SAVE -', 'Export save', 'Import save', 'Erase this save',
    '- TESTING -', 'Unlock everything', 'God mode', 'Hitboxes'],
  controls: ['Controls', 'Rebind keys', 'Block', 'Swap Z / X', 'Rumble', 'Co-op guide', 'Reset controls'],
  access: ['- READING -', 'Larger text', 'Level timer', 'Colour tells', 'Foe outline',
    '- MOTION AND FLASHES -', 'Reduce motion', 'Flashes', 'Screen shake', 'Shake when'],
};

/* THE OLD SETTINGS LIST, kept as a snapshot for the check: every one of these must still be a row somewhere, under the same name
   (a saved value is keyed by the SET field behind the name, which the tabs never touch). */
export const LEGACY_ROWS = ['Difficulty', 'Game speed', 'Jump assist', 'Way-on arrow', 'Iron Knight', 'Block', 'Text speed', 'Swap Z / X', 'Controls', 'Rumble',
  'Sound test', 'Music', 'Music volume', 'Effects vol', 'Ambience vol', 'UI volume', 'Sound FX', 'Character voices',
  'Full screen', 'Text colour', 'UI colour', 'Ground light', 'The air', 'Camera', 'Look down', 'HUD', 'Larger text', 'Colour tells', 'FPS counter', 'Brightness',
  'Screen filter', 'Film grain', 'Parallax', 'Arena tint', 'Particles', 'Foe outline', 'Boss intro', 'Foe health', 'Reduce motion', 'Shake when', 'Hit stop', 'Flashes',
  'Vignette', 'Weather', 'Impact FX', 'Hit numbers', 'Level timer', 'Tenths', 'Ambient life', 'Scanlines', 'Pixel scale', 'Export save', 'Import save', 'Erase this save',
  'Unlock everything', 'God mode', 'Hitboxes'];

export const isHeaderRow = k => k[0] === '-';
export const tabIndex = id => Math.max(0, TABS.findIndex(t => t.id === id));
export const tabOf = row => { for (const t of TABS) if (TAB_ITEMS[t.id].includes(row)) return t.id; return null; };
export const stepTab = (id, dir) => TABS[(tabIndex(id) + dir + TABS.length) % TABS.length].id;
/* the rows one tab shows: the strip first, 'Back' last; the Sound test is title-only (it needs the menu's own music) */
export function tabRows(id, from, demo = DEMO) {
  const rows = TAB_ITEMS[id] || TAB_ITEMS.audio;
  return ['@TABS', ...rows.filter(k => !(k === 'Sound test' && from === 'play') && !(k === 'Unlock everything' && !isDev()) && !rowHidden(k, demo) && !devRowHidden(k, demo)), 'Back'];   /* (claude/heroroster) UNLOCK EVERYTHING is a dev row: ?dev=1 only; (demohide + demoend2) the demo drops God mode / Unlock all levels and the dev rows */
}
/* the first row the cursor may rest on: never the strip's own row 0 on a fresh open, and never a header */
export const firstRow = rows => { let i = 1; while (i < rows.length - 1 && isHeaderRow(rows[i])) i++; return i; };
