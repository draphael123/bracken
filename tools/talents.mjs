// THE TALENT AUDIT.
// A node that is never read is a node that does nothing: the player spends a point, the pip lights up, and
// the game carries on exactly as it did. There is no way to notice that from inside the game - it is not a
// crash, it is not a visual bug, and the description is right there promising otherwise - so it has to be
// checked from outside. Every node's id must be read by tal('id') somewhere that is not the tree itself,
// or be a SKILL, which is read by skillPress('id') instead.
//
// And THE SHAPE OF A TREE, which is the whole point of the trees: a hero has the points for ONE of them, so
//   - every tree costs about what a hero can spend (22 to 26 of the thirty),
//   - every tree has exactly one CAPSTONE, in the bottom row's middle, one rank, and it is not a skill,
//   - a tree carries at most one plain number (a node with ranks): the rest change a move, a meter or a skill,
//   - every tree owns a skill or two.
// Run: node tools/talents.mjs
import { readFileSync } from 'fs';
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

const A = src.indexOf('const TREE = [];'), B = src.indexOf('const TALENTS = [');
const TREE = new Function(src.slice(A, B) + '; return TREE;')();
const TBR = new Function(src.slice(src.indexOf('const TBR = '), src.indexOf(';', src.indexOf('const TBR = ')) + 1) + ' return TBR;')();

const reads = id => {
  const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (src.match(new RegExp("tal\\('" + esc + "'\\)", 'g')) || []).length + (src.match(new RegExp("skillPress\\('" + esc + "'\\)", 'g')) || []).length;
};

const dead = [], bad = [];
console.log('== the talent audit ==\n');
console.log('hero      tree            nodes  cost  skills  numbers  capstone');
for (const h of Object.keys(TBR)) for (let b = 0; b < 3; b++) {
  const ns = TREE.filter(n => n.hero === h && n.branch === b);
  const cost = ns.reduce((s, n) => s + n.max * n.cost, 0), caps = ns.filter(n => n.cap), skills = ns.filter(n => n.active), nums = ns.filter(n => n.max > 1);
  console.log('  ' + h.padEnd(8) + TBR[h][b].padEnd(16) + String(ns.length).padStart(5) + String(cost).padStart(6) + String(skills.length).padStart(8) + String(nums.length).padStart(9) + '  ' + (caps.map(c => c.name).join(', ') || '-'));
  if (cost < 22 || cost > 26) bad.push(h + ' ' + TBR[h][b] + ': the tree costs ' + cost + ', not about 24');
  if (caps.length !== 1) bad.push(h + ' ' + TBR[h][b] + ': ' + caps.length + ' capstones, not one');
  for (const c of caps) if (c.row !== 3 || c.col !== 1 || c.max !== 1 || c.active) bad.push(h + ' ' + c.id + ': a capstone sits bottom-middle, one rank, and is not a skill');
  if (nums.length > 1) bad.push(h + ' ' + TBR[h][b] + ': ' + nums.length + ' plain-number nodes (' + nums.map(n => n.id).join(', ') + ')');
  if (!skills.length || skills.length > 2) bad.push(h + ' ' + TBR[h][b] + ': ' + skills.length + ' skills');
  for (const n of ns) if (n.parent && !TREE.some(q => q.hero === h && q.id === n.parent)) bad.push(h + ' ' + n.id + ': grows from ' + n.parent + ', which is not in the tree');
}
const seen = new Set();
for (const n of TREE) { const k = n.hero + '|' + n.id; if (seen.has(k)) bad.push('the id ' + k + ' is in the tree twice'); seen.add(k); if (!reads(n.id)) dead.push(n); }

if (!dead.length) console.log('\nevery node is read somewhere: no node is decoration.');
else {
  console.log('\n' + dead.length + ' node(s) DO NOTHING - the point is spent, the pip lights, and nothing changes:\n');
  for (const n of dead) console.log('  ' + n.hero.padEnd(9) + n.id.padEnd(16) + n.name.padEnd(20) + (n.active ? '(a skill with no key handler)' : '(never read by tal())'));
}
if (bad.length) { console.log('\n' + bad.length + ' tree(s) out of shape:'); for (const x of bad) console.log('  ' + x); }
else console.log('every tree is one tree\'s worth, with one capstone and at most one plain number.');
process.exitCode = dead.length || bad.length ? 1 : 0;
