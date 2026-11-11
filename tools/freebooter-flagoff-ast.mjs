// tools/freebooter-flagoff-ast.mjs - PROOF THAT FORKS_SHIP OFF = THE BASE, for src/main.js (claude/freefork). Pure node, no page. Run: node tools/freebooter-flagoff-ast.mjs [baseRef]
// main.js is far too big to run in node, so this proves it on the SOURCE: parse the base main.js (git show <baseRef>:src/main.js, default origin/claude/knightfork) and the working one with node's own acorn,
// then put the NEW tree through the exact flag-off semantics and compare the two trees node for node:
//   1. every call fb(...) is the literal false (fb = hero()==='pirate' && tech(id): false with the flag off, for any hero, in any duel)
//   2. the new import, the two declarations (const fb, const FBX) and the two unguarded hooks FBX.update(dt) / FBX.draw(g, cx, cy) are removed (the hooks are no-ops on an empty list: proven in
//      tools/freebooter-forks.mjs); every OTHER FBX call must sit under an fb() test and so disappears with it
//   3. constant folding that is exact for the way the edits are written: false ? a : b -> b; false && x -> false; x && false -> false and x || false -> x when x is a pure comparison; if (false) s [else t] -> t / nothing;
//      !false -> true; a * 1 -> a; 1 * a -> a; a + 0 -> a; a one-statement block in an if / else -> the statement. The same folds run on BOTH trees, so they cannot hide a difference.
//   4. what is left must be the base: identical, statement by statement, comments and whitespace aside.
// It prints how many fb() reads were folded and how many guarded statements dropped, and exits 1 with the first differing top-level statement if the trees differ.
import { execFileSync, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
if (!process.execArgv.includes('--expose-internals')) {
  const r = spawnSync(process.execPath, ['--expose-internals', ...process.argv.slice(1)], { stdio: 'inherit' }); process.exit(r.status === null ? 1 : r.status);
}
const acorn = createRequire(import.meta.url)('internal/deps/acorn/acorn/dist/acorn');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseRef = process.argv[2] || 'origin/claude/knightfork';
const baseSrc = execFileSync('git', ['show', baseRef + ':src/main.js'], { cwd: root, maxBuffer: 1 << 28 }).toString('utf8');
const newSrc = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const parse = s => acorn.parse(s, { ecmaVersion: 'latest', sourceType: 'module' });
const stats = { fb: 0, dropped: 0, hooks: 0, folds: 0 };
const isLit = (n, v) => n && n.type === 'Literal' && n.value === v;
const CMP = new Set(['===', '!==', '==', '!=', '<', '<=', '>', '>=']);
/* a pure boolean: a comparison of simple things (no call, no assignment): safe to drop in x && false / x || false */
const simple = n => n && (n.type === 'Identifier' || n.type === 'Literal' || (n.type === 'MemberExpression' && simple(n.object) && (!n.computed || simple(n.property))) || (n.type === 'BinaryExpression' && simple(n.left) && simple(n.right)) || (n.type === 'UnaryExpression' && n.operator !== 'delete' && simple(n.argument)) || (n.type === 'LogicalExpression' && simple(n.left) && simple(n.right)));
const pureBool = n => n && ((n.type === 'BinaryExpression' && CMP.has(n.operator) && simple(n.left) && simple(n.right)) || (n.type === 'UnaryExpression' && n.operator === '!' && simple(n.argument)) || (n.type === 'LogicalExpression' && pureBool(n.left) && pureBool(n.right)));
const isHookStmt = (n, names) => n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.type === 'MemberExpression' && n.expression.callee.object.type === 'Identifier' && n.expression.callee.object.name === 'FBX' && names.includes(n.expression.callee.property.name);
const EMPTY = { type: 'EmptyStatement' };
const unblock = s => (s && s.type === 'BlockStatement' && s.body.length === 1 && !/Declaration$/.test(s.body[0].type)) ? s.body[0] : s;
function fold(n, opts) {
  if (Array.isArray(n)) { const out = []; for (const c of n) { const r = fold(c, opts); if (r === null) continue; out.push(r); } return out; }
  if (!n || typeof n !== 'object' || !n.type) return n;
  if (opts.removeNew) {
    if (n.type === 'ImportDeclaration' && /freebooter-forks\.js$/.test(n.source.value)) { stats.dropped++; return null; }
    if (n.type === 'VariableDeclaration' && n.declarations.length === 1 && n.declarations[0].id.type === 'Identifier' && (n.declarations[0].id.name === 'fb' || n.declarations[0].id.name === 'FBX')) { stats.dropped++; return null; }
    if (isHookStmt(n, ['update', 'draw'])) { stats.hooks++; return null; }
    if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && n.callee.name === 'fb' && n.arguments.length === 1 && n.arguments[0].type === 'Literal' && typeof n.arguments[0].value === 'string' && /^f[a-z]+$/.test(n.arguments[0].value)) {   /* (a local parameter named fb() takes no argument: not ours) */ stats.fb++; return { type: 'Literal', value: false }; }
  }
  const o = {}; for (const k of Object.keys(n)) { if (k === 'start' || k === 'end' || k === 'raw' || k === 'loc') continue; o[k] = fold(n[k], opts); }
  switch (o.type) {
    case 'ConditionalExpression': if (isLit(o.test, false)) { stats.folds++; return o.alternate; } if (isLit(o.test, true)) { stats.folds++; return o.consequent; } break;
    case 'LogicalExpression':
      if (o.operator === '&&') { if (isLit(o.left, false)) { stats.folds++; return o.left; } if (isLit(o.left, true)) { stats.folds++; return o.right; } if (isLit(o.right, false) && pureBool(o.left)) { stats.folds++; return o.right; } }
      if (o.operator === '||') { if (isLit(o.left, false)) { stats.folds++; return o.right; } if (isLit(o.right, false) && pureBool(o.left)) { stats.folds++; return o.left; } }
      break;
    case 'UnaryExpression': if (o.operator === '!' && o.argument && o.argument.type === 'Literal' && typeof o.argument.value === 'boolean') { stats.folds++; return { type: 'Literal', value: !o.argument.value }; } break;
    case 'BinaryExpression':
      if (o.operator === '*' && isLit(o.right, 1)) { stats.folds++; return o.left; } if (o.operator === '*' && isLit(o.left, 1)) { stats.folds++; return o.right; }
      if (o.operator === '+' && isLit(o.right, 0)) { stats.folds++; return o.left; }
      break;
    case 'IfStatement': {
      if (isLit(o.test, false)) { stats.dropped++; return o.alternate ? unblock(o.alternate) : (opts.inList ? null : EMPTY); }
      if (isLit(o.test, true)) { stats.folds++; return unblock(o.consequent); }
      o.consequent = unblock(o.consequent); if (o.alternate) o.alternate = unblock(o.alternate);
      break; }
    default: break;
  }
  return o;
}
/* lists (Program.body, a block, a switch case) drop a statement that folded to nothing; a lone child gets an EmptyStatement */
function foldTree(ast, opts) {
  const walk = n => {
    if (Array.isArray(n)) return n.map(walk);
    if (!n || typeof n !== 'object' || !n.type) return n;
    return n;
  };
  const f = fold(ast, Object.assign({ inList: true }, opts));
  return walk(f);
}
/* the fold above returns null/EMPTY at statement level inside arrays; drop EmptyStatement from statement lists after folding (the base has none where we compare) */
function cleanLists(n) {
  if (Array.isArray(n)) return n.map(cleanLists);
  if (!n || typeof n !== 'object' || !n.type) return n;
  for (const k of Object.keys(n)) {
    const v = n[k];
    if (Array.isArray(v) && (k === 'body' || k === 'consequent') && n.type !== 'ClassBody' && v.every(x => x && typeof x === 'object')) n[k] = cleanLists(v.filter(x => x.type !== 'EmptyStatement'));
    else n[k] = cleanLists(v);
  }
  return n;
}
const topOf = (src, opts) => { const ast = parse(src); const spans = ast.body.map(s => src.slice(s.start, Math.min(s.end, s.start + 140)).replace(/\s+/g, ' '));
  const body = ast.body.map((s, i) => ({ s, i })).map(({ s, i }) => ({ f: cleanLists(foldTree(s, opts)), span: spans[i] })).filter(x => x.f !== null && x.f.type !== 'EmptyStatement');
  return body.map(x => ({ j: JSON.stringify(x.f), span: x.span })); };
const base = topOf(baseSrc, { removeNew: false }), nu = topOf(newSrc, { removeNew: true });
let bad = 0;
if (base.length !== nu.length) { console.log('top-level statement count differs: base ' + base.length + ' new ' + nu.length); bad++; }
for (let i = 0; i < Math.min(base.length, nu.length); i++) if (base[i].j !== nu[i].j) {
  bad++; if (bad <= 6) { console.log('DIFFERS at top-level statement ' + i + '\n  base: ' + base[i].span + '\n  new : ' + nu[i].span);
    const a = base[i].j, b = nu[i].j; let k = 0; while (k < a.length && a[k] === b[k]) k++; console.log('  first difference near: base ...' + a.slice(Math.max(0, k - 80), k + 120) + '\n                         new  ...' + b.slice(Math.max(0, k - 80), k + 120)); } }
if (bad) { console.log('FLAG-OFF AST PROOF FAILED: ' + bad + ' top-level statement(s) differ from ' + baseRef); process.exit(1); }
console.log('FLAG-OFF AST PROOF PASSED: src/main.js with every fb() read = false is node-for-node the base ' + baseRef + ' (' + base.length + ' top-level statements; ' + stats.fb + ' fb() reads folded, ' + stats.dropped + ' guarded statements / declarations dropped, ' + stats.hooks + ' unguarded hooks, ' + stats.folds + ' constant folds)');
