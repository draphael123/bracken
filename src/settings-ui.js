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

export const TAB_ITEMS = {
  audio: ['Sound test', 'Music', 'Music volume', 'Effects vol', 'Ambience vol', 'UI volume', 'Sound FX', 'Character voices'],
  display: ['- PICTURE -', 'Graphics', 'Full screen', 'Pixel scale', 'Camera', 'Brightness', 'Screen filter', 'Scanlines', 'Film grain', 'Vignette',
    '- LOOK -', 'UI colour', 'Font', 'Text colour', 'HUD', 'Gear tiers', 'Foe health', 'Boss health', 'Hit numbers', 'Tenths', 'FPS counter',
    '- WORLD -', 'Ground light', 'The air', 'Parallax', 'Arena tint', 'Weather', 'Ambient life', 'Look down',
    '- EFFECTS -', 'Particles', 'Impact FX', 'Boss intro'],
  gameplay: ['- RULES -', 'Difficulty', 'Game speed', 'Hit stop', 'Iron Knight',
    '- HELPERS -', 'Jump assist', 'Way-on arrow', 'Text speed',
    '- SAVE -', 'Export save', 'Import save', 'Erase this save',
    '- TESTING -', 'Unlock everything', 'God mode', 'Hitboxes'],
  controls: ['Controls', 'Rebind keys', 'Block', 'Swap Z / X', 'Rumble', 'Co-op guide', 'Reset controls'],
  access: ['- READING -', 'Big text', 'Timer', 'Colour tells', 'Foe outline',
    '- MOTION AND FLASHES -', 'Reduce motion', 'Flashes', 'Screen shake', 'Shake strength'],
};

/* THE OLD SETTINGS LIST, kept as a snapshot for the check: every one of these must still be a row somewhere, under the same name
   (a saved value is keyed by the SET field behind the name, which the tabs never touch). */
export const LEGACY_ROWS = ['Difficulty', 'Game speed', 'Jump assist', 'Way-on arrow', 'Iron Knight', 'Block', 'Text speed', 'Swap Z / X', 'Controls', 'Rumble',
  'Sound test', 'Music', 'Music volume', 'Effects vol', 'Ambience vol', 'UI volume', 'Sound FX', 'Character voices',
  'Full screen', 'Font', 'Text colour', 'UI colour', 'Ground light', 'The air', 'Camera', 'Look down', 'HUD', 'Big text', 'Colour tells', 'FPS counter', 'Brightness',
  'Screen filter', 'Film grain', 'Parallax', 'Arena tint', 'Particles', 'Foe outline', 'Boss intro', 'Foe health', 'Reduce motion', 'Screen shake', 'Hit stop', 'Flashes',
  'Vignette', 'Weather', 'Impact FX', 'Hit numbers', 'Timer', 'Tenths', 'Ambient life', 'Scanlines', 'Pixel scale', 'Export save', 'Import save', 'Erase this save',
  'Unlock everything', 'God mode', 'Hitboxes'];

export const isHeaderRow = k => k[0] === '-';
export const tabIndex = id => Math.max(0, TABS.findIndex(t => t.id === id));
export const tabOf = row => { for (const t of TABS) if (TAB_ITEMS[t.id].includes(row)) return t.id; return null; };
export const stepTab = (id, dir) => TABS[(tabIndex(id) + dir + TABS.length) % TABS.length].id;
/* the rows one tab shows: the strip first, 'Back' last; the Sound test is title-only (it needs the menu's own music) */
export function tabRows(id, from) {
  const rows = TAB_ITEMS[id] || TAB_ITEMS.audio;
  return ['@TABS', ...rows.filter(k => !(k === 'Sound test' && from === 'play')), 'Back'];
}
/* the first row the cursor may rest on: never the strip's own row 0 on a fresh open, and never a header */
export const firstRow = rows => { let i = 1; while (i < rows.length - 1 && isHeaderRow(rows[i])) i++; return i; };
