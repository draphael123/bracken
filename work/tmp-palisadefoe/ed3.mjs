import { readFileSync, writeFileSync } from 'node:fs';
const f = new URL('../../src/marks.js', import.meta.url); let s = readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(a + ' ' + n); s = s.replace(a, () => b); };
rep("  'stringjack|jerk': 'block', 'barker|caneTell': 'block',", "  'hornsman|maulTell': 'block',   // (claude/palisadefoe) THE HORNSMAN's maul: the shield\r\n  'stringjack|jerk': 'block', 'barker|caneTell': 'block',");
rep("  'stringjack|jerk': 'high', 'barker|caneTell': 'low',", "  'hornsman|maulTell': 'low',   // the maul at his own height, at arm's length\r\n  'stringjack|jerk': 'high', 'barker|caneTell': 'low',");
writeFileSync(f, s);
