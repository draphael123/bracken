// THE TALENT AUDIT.
// A node that is never read is a node that does nothing: the player spends a point, the pip lights up, and
// the game carries on exactly as it did. There is no way to notice that from inside the game - it is not a
// crash, it is not a visual bug, and the description is right there promising otherwise - so it has to be
// checked from outside. Every node's id must be read by tal('id') somewhere that is not the tree itself,
// or be an ACTIVE, which is read by skillPress('id') instead.
//
// It also prints what a tree costs against what a campaign pays, because a tree you can buy all of is not
// a tree, it is a checklist.  Run: node tools/talents.mjs
import { readFileSync } from 'fs';
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const nodes = [...src.matchAll(/N\('([a-z]+)', (\d), (\d), (\d), '([A-Za-z0-9]+)', '([^']+)', (\d),/g)]
  .map(m => ({ hero: m[1], branch: +m[2], row: +m[3], col: +m[4], id: m[5], name: m[6], max: +m[7] }));
// the `active` flag is the last argument and is easiest to read off the whole call
for (const n of nodes) {
  const call = src.slice(src.indexOf("N('" + n.hero + "', " + n.branch + ", " + n.row + ", " + n.col + ", '" + n.id + "'"));
  n.active = /^[^\n]*, true\);/.test(call);
  n.cost = n.active || n.max > 1 ? 1 : n.row >= 3 ? 3 : 2;
}

const reads = id => {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tal = new RegExp("tal\\('" + esc + "'\\)", 'g');
  const key = new RegExp("skillPress\\('" + esc + "'\\)", 'g');
  return (src.match(tal) || []).length + (src.match(key) || []).length;
};

const dead = [], byHero = {};
const done = new Set();
for (const n of nodes) {
  const k = n.hero + '|' + n.id; if (done.has(k)) continue; done.add(k);
  const h = byHero[n.hero] = byHero[n.hero] || { pts: 0, rule: 0, act: 0, stat: 0, nodes: 0 };
  h.pts += n.max * n.cost; h.nodes++;
  if (n.active) h.act += n.max * n.cost; else if (n.max > 1) h.stat += n.max * n.cost; else h.rule += n.cost;
  if (!reads(n.id)) dead.push(n);
}

const BUDGET = 32;  // two points a wood, sixteen woods
console.log('== the talent audit ==\n');
console.log('hero      nodes   tree costs   actives   bumps   rules   all the rules would cost');
for (const h in byHero) { const x = byHero[h];
  console.log('  ' + h.padEnd(9), String(x.nodes).padStart(3), String(x.pts).padStart(10) + ' pts',
    String(x.act).padStart(8), String(x.stat).padStart(7), String(x.rule).padStart(7),
    ('  ' + Math.round(x.rule / BUDGET * 100) + '% of a ' + BUDGET + '-point campaign').padStart(30)); }

if (!dead.length) console.log('\nevery node is read somewhere: no node is decoration.');
else {
  console.log('\n' + dead.length + ' node(s) DO NOTHING - the point is spent, the pip lights, and nothing changes:\n');
  for (const n of dead) console.log('  ' + n.hero.padEnd(9) + n.id.padEnd(16) + n.name.padEnd(20) + (n.active ? '(an active with no key handler)' : '(never read by tal())'));
}
process.exitCode = dead.length ? 1 : 0;
