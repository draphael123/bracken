// static check: no bell-sourced hero lock above BELL_LOCK_MAX (claude/bellshort). Run: node tools/bell-lock.mjs
import { readFileSync } from 'fs'; import { BELL_LOCK_MAX, bellLock } from '../src/bell-lock.js';
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
ok(BELL_LOCK_MAX <= 1.0, 'cap is ~1 s'); ok(bellLock(3.5) === BELL_LOCK_MAX && bellLock(0.4) === 0.4, 'bellLock caps and keeps short ones');
const main = readFileSync('src/main.js', 'utf8');
ok(/P\.pitCarry = \{ vx: t\.vx, t: bellLock\(/.test(main), 'Sexton bell-pit carry capped');
ok(/pr\.swing = Math\.max\(0, \(pr\.swing \|\| 0\) - dt \/ BELL_LOCK_MAX\)/.test(main), 'tide bell / knell swing decays inside the cap');
ok((main.match(/pr\.swing = bellLock\(1\.2\)/g) || []).length === 2, 'monastery + hush bell swings capped');
process.exit(bad ? 1 : 0);
