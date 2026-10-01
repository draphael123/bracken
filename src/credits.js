// THE MUSIC CREDITS (Daniel, 2026-10-01: CC-BY tracks are allowed WITH their credit, in the game and in audio/CREDITS.txt).
// A page of the title menu's CREDITS (and the victory card's X): every outside composer whose music the game plays, read back
// from MUSIC_CREDITS so a new track's credit line is one edit, and the licence of the two CC-BY tracks named in full.
// Everything else is CC0 or public domain from OpenGameArt.org (the exact files and links are in audio/CREDITS.txt).
// Pure data and layout: no drawing here (src/main.js drawCredits), so tools/credits.mjs can read it in Node.
export const CC_BY = [   /* [MUSIC_CREDITS key, track, composer, licence] - the licence names the version; creativecommons.org/licenses/by/3.0/ */
  ['harvestfair', 'Dark Carnival', 'Machine', 'CC-BY 3.0'],
  ['mineworks', 'At Work', 'HorrorPen', 'CC-BY 3.0'],
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
