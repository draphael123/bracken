/* tools/itch-qa-probe.mjs - dev probe for the QA sweep: load the embed, run the body of an async function from argv[2] in the game frame. */
import { startSession, freeMB } from './itch-qa-lib.mjs';
import { readFileSync } from 'node:fs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: process.env.IFRAME || '960x540' });
try { await s.send('Page.navigate', { url: s.embedUrl }); const r = await s.waitState('title'); console.log('title', JSON.stringify(r));
  const code = readFileSync(process.argv[2], 'utf8'); const out = await s.ev('(async()=>{' + code + '})()', 120000).catch(e => 'ERR ' + e.message); console.log(typeof out === 'string' ? out : JSON.stringify(out, null, 1));
  console.log('errors', JSON.stringify([...s.S.consoleErrors, ...s.S.exceptions]));
} finally { await s.close(); }
