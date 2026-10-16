import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs'; import { join } from 'path';
const pg = await openPage({ audio: false, fonts: false });
try { const r = await pg.evalp(process.argv[2], 300000); if (typeof r === 'string' && r.startsWith('data:image')) { const f = join(ROOT, process.argv[3] || 'work/claude/shots/undercrown2art/dbg.png'); mkdirSync(join(f, '..'), { recursive: true }); writeFileSync(f, Buffer.from(r.split(',')[1], 'base64')); console.log('wrote', f); } else console.log(r); } finally { pg.close(); }
