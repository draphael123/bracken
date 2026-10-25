import { readFileSync, writeFileSync } from 'node:fs';
const f = new URL('../../src/palisade-wood.js', import.meta.url); let s = readFileSync(f, 'utf8'); const crlf = s.includes('\r\n');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(a + ' ' + n); s = s.replace(a, () => b); };
rep("plank(295, 298, 9); foe('archer', 297, 8, 'wallEnd', { face: -1, perch: true });",
  "plank(295, 298, 9); foe('archer', 297, 8, 'wallEnd', { face: -1, perch: true });\n  foe('hornsman', 295, 8, 'wallEnd', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN, TAUGHT: the crew's handler on the end scaffold beside the archer - his horn hurries the archer over the brute's fight (src/hornsman.js) */");
rep("block(349, 351, 18, 32); foe('archer', 350, 17, 'breachB', { face: -1, perch: true });   /* TOWER TWO */",
  "block(349, 351, 18, 32); foe('archer', 350, 17, 'breachB', { face: -1, perch: true });   /* TOWER TWO */\n  foe('hornsman', 349, 17, 'breachB', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN on tower two: storm the tower and he is the one to reach (his horn hurries both towers' archers over the crossing) */");
rep("foe('pike', 363, 24, 'breachC', { face: -1 });",
  "foe('pike', 363, 24, 'breachC', { face: -1 });\n  foe('hornsman', 365, 21, 'breachC', { face: -1 });   /* (claude/palisadefoe) THE EXAM's horn: tower three's hornsman hurries the archers over the crumbling boards - cut his horn short, or storm him */");
rep("foe('archer', 371, 21, 'yard2', { face: -1, perch: true });", "foe('archer', 371, 21, 'yard2', { face: -1, perch: true }); foe('hornsman', 374, 24, 'yard2', { face: -1 });   /* (claude/palisadefoe) THE HORNSMAN, REMIXED: on the yard's floor under the archer's board, behind the pike and the shield */");
writeFileSync(f, crlf ? s.replace(/(?<!\r)\n/g, '\r\n') : s);
