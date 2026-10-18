import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const by = {};
for (const x of r) { const b = by[x.hero] = by[x.hero] || { w: 0, n: 0, s: 0, ws: 0, t: 0 }; b.n++; b.s += x.secs || 0; b.t += x.taken || 0; if (x.outcome === 'win') { b.w++; b.ws += x.secs; } }
let W = 0, N = 0; for (const [h, b] of Object.entries(by)) { W += b.w; N += b.n; console.log(h.padEnd(8), b.w + '/' + b.n, Math.round(100 * b.w / b.n) + '%', 'avgSecs', Math.round(b.s / b.n), 'avgTaken', Math.round(b.t / b.n)); }
console.log('TOTAL', W + '/' + N, Math.round(100 * W / N) + '%');
