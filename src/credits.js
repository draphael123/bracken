// THE MUSIC CREDITS (Daniel, 2026-10-01: CC-BY tracks are allowed WITH their credit, in the game and in audio/CREDITS.txt).
// A page of the title menu's CREDITS (and the victory card's X): every outside composer whose music the game plays, read back
// from MUSIC_CREDITS so a new track's credit line is one edit, and the licence of each CC-BY track named in full (Kevin MacLeod's in his own wording).
// Everything else is CC0 or public domain from OpenGameArt.org (the exact files and links are in audio/CREDITS.txt).
// Pure data and layout: no drawing here (src/main.js drawCredits), so tools/textfit.mjs can drive it in the page.
export const CC_BY = [   /* [MUSIC_CREDITS key, track, composer, licence, the licence's url, the credit's own lines (when the licensor names its wording)] */
  ['harvestfair', 'Dark Carnival', 'Machine', 'CC-BY 3.0', 'creativecommons.org/licenses/by/3.0'],
  ['mineworks', 'At Work', 'HorrorPen', 'CC-BY 3.0', 'creativecommons.org/licenses/by/3.0'],
  ['blacklord', 'For the Black Lord', 'Ronhul Maggot', 'CC-BY 4.0', 'creativecommons.org/licenses/by/4.0'],   /* THE DEATH KNIGHT's theme (claude/dk3) */
  /* THE RED GORGE (claude/redgorge-fix, Daniel 10-02): Kevin MacLeod asks for this credit word for word - the page shows it whole, a line at a time */
  ['redgorge', 'Old Road', 'Kevin MacLeod', 'CC-BY 4.0', 'http://creativecommons.org/licenses/by/4.0/', ['"Old Road" Kevin MacLeod (incompetech.com)', 'Licensed under Creative Commons:', 'By Attribution 4.0 License', 'http://creativecommons.org/licenses/by/4.0/']],
];
/* the one composer a few credit lines spell two ways (MUSIC_CREDITS is kept short to fit the Sound Test row) */
const ALIAS = { Spring: 'Spring Spring', Centurion: 'Centurion_of_war', 'trad., Spring': 'Spring Spring', cynicm: 'cynicmusic', 'C. Kauffman': 'CleytonKauffman' };
export const composers = credits => {
  const seen = new Map();
  for (const line of Object.values(credits)) {
    const m = /—\s*(.+?)(?:\s*\(CC-BY\)|,\s*CC-BY)?$/.exec(line); if (!m) continue;
    let who = ALIAS[m[1].trim()] || m[1].trim(); if (who === 'BRACKEN') continue;   /* made for the game: no outside credit */
    seen.set(who.toLowerCase(), who);
  }
  return [...seen.values()].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
};
/* PAGES: 0 is the CC-BY credit in full; the rest are the composers, ROWS to a column, two columns to a page */
export const CREDIT_ROWS = 8;
export function creditPages(credits) {
  const names = composers(credits), per = CREDIT_ROWS * 2, pages = [{ kind: 'ccby' }];
  for (let i = 0; i < names.length; i += per) pages.push({ kind: 'names', names: names.slice(i, i + per) });
  return pages;
}
