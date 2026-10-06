// scratch: run named checks one after another, print exit code + last line. node work/claude/fairfix6/runchecks.mjs a,b,c
import { spawnSync } from 'child_process';
for (const t of process.argv[2].split(',')) { const t0 = Date.now(); const r = spawnSync(process.execPath, ['tools/' + t + '.mjs', ...(process.argv[3] ? process.argv[3].split(' ') : [])], { encoding: 'utf8', env: { ...process.env, PORT: process.env.PORT || '8619' }, maxBuffer: 1 << 26 });
  const out = (r.stdout || '') + (r.stderr || ''), lines = out.trim().split('\n'); console.log((r.status === 0 ? 'GREEN ' : 'RED   ') + t.padEnd(18) + ((Date.now() - t0) / 1000).toFixed(0).padStart(5) + 's  ' + lines.slice(-1)[0].slice(0, 220));
  if (r.status !== 0) console.log(lines.slice(-12).map(l => '        ' + l.slice(0, 260)).join('\n')); }
