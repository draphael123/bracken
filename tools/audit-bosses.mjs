/* tools/audit-bosses.mjs — THE RANKING'S STATIC BOSS READ (docs/audit/ranking-2026-09-24.md). Node only. NOT in the suite.
   For every arena boss and mini on the campaign (STORMWRECK HARBOR skipped: shelved on purpose) this prints:
     - the code read (the boss's update function and every update/step it hands off to, aliases followed - the same
       walk tools/arena-supplies.mjs uses)
     - every mode the code enters, and which of them are WINDUPS (ends in Tell, or is a name the game's own windingUp()
       lists), and for each windup whether windingUp() really returns true for it (A2) - by EVALUATING main.js's own
       windingUp on {t, mode}, not by re-reading its list
     - A1: the count of distinct told attacks
     - the lines in hurtEnemy0 that name the boss: the damage gate. This is the raw material for A11 (is the window
       caused or waited for), which is a judgement made by reading, and the ranking says so.
     - phase lines (A10 reading aid, same caveat as tools/phase-two.mjs)
     - arena width in tiles (A7)
   node tools/audit-bosses.mjs            table
   node tools/audit-bosses.mjs --json     everything, for work/audit/bosses-static.json
   WHAT IT CANNOT SEE: a told attack whose windup is not a mode (a timer on the boss with no mode change) is not
   counted; a windup named like an ordinary mode ('aim', 'raise') is counted only if windingUp() lists it. */
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEVELS } from '../src/level.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const files = [];
const walk = d => { for (const f of readdirSync(join(ROOT, d))) { const p = join(d, f); if (statSync(join(ROOT, p)).isDirectory()) { if (!/draft/.test(f)) walk(p); } else if (/\.js$/.test(f)) files.push(p); } };
walk('src');
const braced = (s, i) => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}' && !--d) return s.slice(i, j + 1); } return s.slice(i); };
const DEFS = new Map(), ALIAS = new Map();
for (const f of files) {
  const s = readFileSync(join(ROOT, f), 'utf8');
  for (const m of s.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)) {
    const o = s.indexOf('{', m.index + m[0].length - 1); if (o < 0) continue;
    (DEFS.get(m[1]) || DEFS.set(m[1], []).get(m[1])).push({ file: f.split(String.fromCharCode(92)).join('/'), name: m[1], body: braced(s, o) });
  }
  for (const m of s.matchAll(/([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)/g)) ALIAS.set(m[2], m[1]);
}
const main = readFileSync(join(ROOT, 'src/main.js'), 'utf8');
const DISPATCH = new Map();
for (const m of main.matchAll(/e\.t\s*===\s*'([a-z]+)'[^\n]*?(update[A-Za-z]+)\s*\(\s*e\s*,\s*dt/g)) if (!DISPATCH.has(m[1])) DISPATCH.set(m[1], m[2]);
const bossSource = fn => { const out = [], seen = new Set(), q = [fn];
  while (q.length) { const n = q.pop(); if (seen.has(n)) continue; seen.add(n);
    const d = DEFS.get(n); if (!d) { const a = ALIAS.get(n); if (a && !seen.has(a)) q.push(a); continue; }
    for (const one of d) { out.push(one); for (const m of one.body.matchAll(/\b((?:update|step)[A-Za-z]+)\s*\(/g)) if (!seen.has(m[1])) q.push(m[1]); } }
  return out; };

/* main.js's own windingUp, evaluated */
const wl = main.split('\n').find(l => /^const windingUp = e =>/.test(l));
const windingUp = new Function('return ' + wl.replace(/^const windingUp = /, '').replace(/;\s*\/\/.*$/, '').replace(/;\s*$/, ''))();
/* the hurtEnemy0 lines that name a creature */
const hurt = braced(main, main.indexOf('{', main.indexOf('function hurtEnemy0(')));
const hurtLines = t => hurt.split('\n').filter(l => new RegExp("e[.]t *=== *'" + t + "'").test(l)).map(l => l.trim().slice(0, 240));

const TELLISH = /(Tell|Wind|wind|raise|aim|crouch|lower|couch|slamHang|draw|tell)$/;
const rows = [];
for (const lv of LEVELS) {
  if (lv.id === 'harbor') continue;
  let L; try { L = lv.build(); } catch { continue; }
  for (const k of ['arena', 'mini']) {
    const A = L[k]; if (!A || !A.boss) continue;
    const t = A.boss, fn = DISPATCH.get(t);
    const src = fn ? bossSource(fn) : [];
    const body = src.map(s => s.body).join('\n');
    const modes = new Set();
    for (const m of body.matchAll(/\bmode\s*=\s*'([A-Za-z]\w*)'|mode\s*:\s*'([A-Za-z]\w*)'|case\s*'([A-Za-z]\w*)'\s*:|mode\s*===?\s*'([A-Za-z]\w*)'/g)) modes.add(m[1] || m[2] || m[3] || m[4]);
    /* a turn table: ['slamTell','chargeTell',...] picked from */
    for (const m of body.matchAll(/'([A-Za-z]\w*Tell)'/g)) modes.add(m[1]);
    const tells = [...modes].filter(m => TELLISH.test(m) || windingUp({ t, mode: m, draw: 0 }));
    const inWU = tells.filter(m => windingUp({ t, mode: m, draw: 0 }));
    const notWU = tells.filter(m => !windingUp({ t, mode: m, draw: 0 }));
    const phase = body.split('\n').filter(l => /\bphase[2-5]?\b/.test(l) && !/^\s*(\/\/|\*)/.test(l)).length;
    const width = A.wallR !== undefined && A.wallL !== undefined ? A.wallR - A.wallL - 1 : Math.round((A.x1 - A.x0) / 16);
    rows.push({ lvl: lv.id, which: k, boss: t, fn: fn || null, files: [...new Set(src.map(s => s.file))], modes: [...modes].sort(), tells: tells.sort(), inWindingUp: inWU.sort(), notInWindingUp: notWU.sort(), phaseLines: phase, width, tall: A.y0 !== undefined ? Math.round((A.floor - A.y0) / 16) : null, hurtGate: hurtLines(t) });
  }
}
if (process.argv.includes('--json')) { mkdirSync(join(ROOT, 'work/audit'), { recursive: true }); writeFileSync(join(ROOT, 'work/audit/bosses-static.json'), JSON.stringify(rows, null, 1)); }
for (const r of rows) console.log((r.lvl + (r.which === 'mini' ? ':mini' : '')).padEnd(20) + r.boss.padEnd(15) + ('w' + r.width).padEnd(6) + ('tells ' + r.tells.length).padEnd(9) + ('A2miss ' + r.notInWindingUp.length).padEnd(10) + (r.notInWindingUp.join(',') || '-').slice(0, 50).padEnd(52) + (r.files.join(',') || 'NO CODE FOUND'));
console.log(rows.length + ' bosses read.');
