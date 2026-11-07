import fs from 'node:fs'; import { install } from './node-canvas.mjs'; install();
const { THREAT } = await import('../src/threat.js'); const a = fs.readFileSync('src/audio.js', 'utf8');
const blk = (name) => { const i = a.indexOf('const ' + name + ' = {'); const j = a.indexOf('\n};', i); return a.slice(i, j); };
const keys = s => new Set([...s.matchAll(/^\s{0,4}([A-Za-z_0-9]+)\s*[:(]/gm)].map(m => m[1]));
const D = keys(blk('DIE')), H = keys(blk('HURT')), CASTK = new Set([...a.matchAll(/^\s*([A-Za-z0-9_]+): \{ kit:/gm)].map(m => m[1])), al = [...a.matchAll(/(\w+): '(\w+)'/g)].map(m => m[1]);
const miss = Object.keys(THREAT).filter(k => THREAT[k] > 0 && !((D.has(k) || CASTK.has(k) || al.includes(k)) && (H.has(k) || CASTK.has(k) || al.includes(k))));
console.log('no own die/hurt voice (falls back to SFX.hit):', miss.join(' '));
