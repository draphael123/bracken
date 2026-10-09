// THE MUSIC CREDITS (Daniel, 2026-10-01: CC-BY tracks are allowed WITH their credit, in the game and in audio/CREDITS.txt).
// A page of the title menu's CREDITS (and the victory card's X): every outside composer whose music the game plays, read back
// from MUSIC_CREDITS so a new track's credit line is one edit, and the licence of each CC-BY track named in full (Kevin MacLeod's in his own wording).
// (THE GLASS SEA's CC0 track is credited here too, Daniel's wish.) Everything else is CC0 or public domain from OpenGameArt.org (the exact files and links are in audio/CREDITS.txt).
// Pure data and layout: no drawing here (src/main.js drawCredits), so tools/textfit.mjs can drive it in the page.
export const CC_BY = [   /* [MUSIC_CREDITS key, track, composer, licence, the licence's url, the credit's own lines (when the licensor names its wording)] */
  ['harvestfair', 'Dark Carnival', 'Machine', 'CC-BY 3.0', 'creativecommons.org/licenses/by/3.0'],
  ['mineworks', 'At Work', 'HorrorPen', 'CC-BY 3.0', 'creativecommons.org/licenses/by/3.0'],
  ['blacklord', 'For the Black Lord', 'Ronhul Maggot', 'CC-BY 4.0', 'creativecommons.org/licenses/by/4.0'],   /* THE DEATH KNIGHT's theme (claude/dk3) */
  ['undeadmage', 'Colossal Boss Battle Theme', 'Matthew Pablo', 'CC-BY 3.0', 'creativecommons.org/licenses/by/3.0'],   /* THE UNDEAD ARCHMAGE (claude/archmage2b): matthewpablo.com */
  ['puppeteer', 'Dissonant Waltz', 'Yubatake', 'CC-BY 4.0', 'creativecommons.org/licenses/by/4.0'],   /* THE PUPPETEER's fight (claude/puppeteer2, Daniel's pick 10-02) */
  /* THE RED GORGE (claude/redgorge-fix, Daniel 10-02): Kevin MacLeod asks for this credit word for word - the page shows it whole, a line at a time */
  ['rootway', 'Lanterns in the Hollowed Forest', 'Tsorthan Grove', 'CC0', 'https://opengameart.org/content/lanterns-in-the-hollowed-forest', ['"Lanterns in the Hollowed Forest"', 'by Tsorthan Grove (OpenGameArt.org)', 'CC0: public domain, credited all the same', 'opengameart.org/content/lanterns-in-the-hollowed-forest']],   /* THE ROOTWAY's level track (claude/rootway, Daniel's pick 10-07) */
  ['skyroad', 'Bring Me The Sky', 'Scott Buckley', 'CC-BY 4.0', 'https://www.scottbuckley.com.au/library/bring-me-the-sky/', ['"Bring Me The Sky" by Scott Buckley', 'released under CC-BY 4.0.', 'www.scottbuckley.com.au']],
  ['rocphoenix', 'Phoenix', 'Scott Buckley', 'CC-BY 4.0', 'https://www.scottbuckley.com.au/library/phoenix-2026/', ['"Phoenix" by Scott Buckley', 'released under CC-BY 4.0.', 'www.scottbuckley.com.au']],
  ['underwell', 'Ossuary 6 - Air', 'Kevin MacLeod', 'CC-BY 4.0', 'http://creativecommons.org/licenses/by/4.0/', ['"Ossuary 6 - Air" Kevin MacLeod (incompetech.com)', 'Licensed under Creative Commons:', 'By Attribution 4.0 License', 'http://creativecommons.org/licenses/by/4.0/']],   /* THE UNDERWELL's level track (claude/underwellart, Daniel's pick 10-05) */
  ['matriarch', 'Volatile Reaction', 'Kevin MacLeod', 'CC-BY 4.0', 'http://creativecommons.org/licenses/by/4.0/', ['"Volatile Reaction" Kevin MacLeod (incompetech.com)', 'Licensed under Creative Commons:', 'By Attribution 4.0 License', 'http://creativecommons.org/licenses/by/4.0/']],   /* THE RAPTOR MATRIARCH's fight (claude/redgorge2, Daniel's pick) */
  ['ksar', 'Desert Loop', 'iamoneabe', 'CC0', 'https://opengameart.org/content/desert-loop', ['"Desert Loop" by iamoneabe', '(OpenGameArt.org)', 'CC0: public domain, credited all the same', 'opengameart.org/content/desert-loop']],   /* THE BANDIT KSAR's level track (claude/ksar art pass, Daniel's pick 10-07) */
  ['glasssea', 'Eastern Arctic Dubstep', 'Vishwa Jay', 'CC0', 'https://opengameart.org/node/97673', ['"Eastern Arctic Dubstep" Vishwa Jay', '(VishwaJai on OpenGameArt.org)', 'CC0: public domain, credited all the same', 'opengameart.org/node/97673']],
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
/* PAGES: first the CC-BY credits in full, CCBY_PER to a page (claude/puppeteer2: a fourth would not fit on one), then the composers, ROWS to a column, two columns to a page */
/* THE TYPE (claude/fontpair): the two faces the whole game is written in, both under the SIL Open Font License 1.1 (fonts/OFL-*.txt) */
export const FONT_CREDITS = [['Press Start 2P', 'Cody "CodeMan38" Boisclair', 'display: titles and names'], ['Silkscreen', 'Jason Kottke', 'body: menus, signs, numbers']];
export const FONT_LICENCE = 'SIL OFL 1.1 (OFL): scripts.sil.org/OFL';
export const CCBY_PER = 2;
export const CREDIT_ROWS = 8;
export function creditPages(credits) {
  const names = composers(credits), per = CREDIT_ROWS * 2, pages = [];
  for (let i = 0; i < CC_BY.length; i += CCBY_PER) pages.push({ kind: 'ccby', items: CC_BY.slice(i, i + CCBY_PER), last: i + CCBY_PER >= CC_BY.length });
  for (let i = 0; i < names.length; i += per) pages.push({ kind: 'names', names: names.slice(i, i + per) });
  pages.push({ kind: 'fonts' });
  return pages;
}
