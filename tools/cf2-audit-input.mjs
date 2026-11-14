// tools/cf2-audit-input.mjs - the audit-input table with the CF2 platform feel forced OFF or ON, at a chosen game speed (claude/cf2proof; a measuring tool, not a check).
//   CF2=off|on SPEED=0.6|1 PORT=.. node tools/cf2-audit-input.mjs [heroes]     (copies audit-input.mjs + audit-lib.mjs to temp siblings, patched; output file input.json is left alone)
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
const T = fileURLToPath(new URL('.', import.meta.url)), cf = process.env.CF2 || 'on', sp = process.env.SPEED || '1', id = process.pid;
let lib = readFileSync(T + 'audit-lib.mjs', 'utf8');
lib = lib.replace('S.speed = 1;', 'S.speed = ' + +sp + ';').replace("await pg.evalp('(' + pageLib.toString() + ')()');", "await pg.evalp('(' + pageLib.toString() + ')()'); await pg.evalp(\"(async()=>{const CF=await import('/src/cf-platform.js');CF.setCF2(" + (cf === 'on') + ");})()\");");
if (!lib.includes('setCF2(')) throw new Error('lib patch failed');
const a = readFileSync(T + 'audit-input.mjs', 'utf8').replace("'./audit-lib.mjs'", "'./_cf2lib" + id + ".mjs'").replace("join(SCRATCH, 'input.json')", "join(SCRATCH, 'input-cf2-" + cf + "-" + sp + ".json')").replace("join(SCRATCH, 'input.json')", "join(SCRATCH, 'input-cf2-" + cf + "-" + sp + ".json')");
writeFileSync(T + '_cf2lib' + id + '.mjs', lib); writeFileSync(T + '_cf2aud' + id + '.mjs', a);
try { const r = spawnSync(process.execPath, [T + '_cf2aud' + id + '.mjs', ...process.argv.slice(2)], { stdio: 'inherit', env: process.env }); process.exitCode = r.status; }
finally { unlinkSync(T + '_cf2lib' + id + '.mjs'); unlinkSync(T + '_cf2aud' + id + '.mjs'); }
