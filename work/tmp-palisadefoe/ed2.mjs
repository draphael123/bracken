import { readFileSync, writeFileSync } from 'node:fs';
const edit = (rel, pairs) => { const f = new URL('../../' + rel, import.meta.url); let s = readFileSync(f, 'utf8'); const crlf = s.includes('\r\n');
  for (const [a, b] of pairs) { const n = s.split(a).length - 1; if (n !== 1) throw new Error(rel + ': ' + JSON.stringify(a.slice(0, 50)) + ' occurs ' + n); s = s.replace(a, () => b); }
  writeFileSync(f, crlf ? s.replace(/(?<!\r)\n/g, '\r\n') : s); };
edit('src/threat.js', [["  stagehand: 5,", "  hornsman: 4,   /* THE HORNSMAN (claude/palisadefoe, src/hornsman.js): 26 health, a maul (! 11) at arm's length - and a horn that hurries every archer in earshot: a support the towers lean on */\n  stagehand: 5,"]]);
edit('src/audio.js', [["barker: { kit: 'm1', rate: 1.05, mat: 'cloth', human: true },", "barker: { kit: 'm1', rate: 1.05, mat: 'cloth', human: true }, hornsman: { kit: 'm5', rate: 0.92, mat: 'mail', human: true },   /* (claude/palisadefoe) THE HORNSMAN: a gruff crewman in a kettle hat */"]]);
edit('src/marks.js', [["  'stringjack|jerk': '!', 'barker|caneTell': '!',", "  'hornsman|orderTell': '', 'hornsman|maulTell': '!',   // THE HORNSMAN (claude/palisadefoe, src/hornsman.js, by hand: a module-file foe): the horn is no blow (it hurries the archers; cut it short by striking him), the maul a shield turns\n  'stringjack|jerk': '!', 'barker|caneTell': '!',"]]);
edit('src/foe-react.js', [["support: ['sapper', 'horn'], note: 'goblin woods", "support: ['sapper', 'horn', 'hornsman'], note: 'goblin woods"]]);
edit('tools/level-quality.mjs', [["support: ['bellman', 'barker',", "support: ['bellman', 'hornsman', 'barker',"]]);
console.log('ok');
