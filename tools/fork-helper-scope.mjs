// tools/fork-helper-scope.mjs - (claude/forkmerge) pure node, run: node --expose-internals tools/fork-helper-scope.mjs
// main.js holds ~10 one-letter-ish fork helpers (kb plb pyb gb rb wb fb bb ...). A call like fb('fx') inside a scope that declares its own `fb` would hit the wrong binding, and a second top-level function with the same name silently overrides the first.
// This scans src/main.js: (1) every call of a fork helper must resolve to the top-level declaration (no shadowing local/param); (2) no two top-level declarations share a name. Exit 1 on any hit.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const acorn = createRequire(import.meta.url)('internal/deps/acorn/acorn/dist/acorn');
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const ast = acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module' });
const HELPERS = new Set(['kb', 'plb', 'pyb', 'gb', 'rb', 'wb', 'fb', 'bb', 'bzFk']);
const patNames = (p, out) => { if (!p) return; if (p.type === 'Identifier') out.add(p.name); else if (p.type === 'ObjectPattern') p.properties.forEach(q => patNames(q.value || q.argument, out)); else if (p.type === 'ArrayPattern') p.elements.forEach(q => patNames(q, out)); else if (p.type === 'RestElement') patNames(p.argument, out); else if (p.type === 'AssignmentPattern') patNames(p.left, out); };
const declsIn = (stmts, out) => { for (const s of stmts) { if (s.type === 'VariableDeclaration' && s.kind !== 'var') s.declarations.forEach(d => patNames(d.id, out)); else if ((s.type === 'FunctionDeclaration' || s.type === 'ClassDeclaration') && s.id) out.add(s.id.name); } };
const varsDeep = (n, out) => { if (!n || typeof n.type !== 'string') return; if (n.type === 'VariableDeclaration' && n.kind === 'var') n.declarations.forEach(d => patNames(d.id, out)); if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') return; for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(c => varsDeep(c, out)); else if (v && typeof v.type === 'string') varsDeep(v, out); } };
const hits = [], top = new Map();
const lineOf = pos => src.slice(0, pos).split('\n').length;
for (const s of ast.body) { const names = []; if (s.type === 'FunctionDeclaration') names.push(s.id.name); else if (s.type === 'VariableDeclaration') { const o = new Set(); s.declarations.forEach(d => patNames(d.id, o)); names.push(...o); } for (const n of names) { if (top.has(n)) hits.push('duplicate top-level name ' + n + ' (lines ' + top.get(n) + ' and ' + lineOf(s.start) + ')'); else top.set(n, lineOf(s.start)); } }
const walk = (n, scopes) => {
  if (!n || typeof n.type !== 'string') return;
  let own = null;
  if (n.type === 'Program') { own = new Set(); declsIn(n.body, own); }
  else if (n.type === 'BlockStatement' || n.type === 'StaticBlock') { own = new Set(); declsIn(n.body, own); }
  else if (n.type === 'SwitchStatement') { own = new Set(); n.cases.forEach(c => declsIn(c.consequent, own)); }
  else if (n.type === 'ForStatement' || n.type === 'ForInStatement' || n.type === 'ForOfStatement') { own = new Set(); const d = n.init || n.left; if (d && d.type === 'VariableDeclaration') d.declarations.forEach(x => patNames(x.id, own)); }
  else if (n.type === 'CatchClause') { own = new Set(); patNames(n.param, own); }
  else if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') { own = new Set(); n.params.forEach(p => patNames(p, own)); if (n.type === 'FunctionExpression' && n.id) own.add(n.id.name); varsDeep(n.body, own); }
  const sc = own ? [...scopes, own] : scopes;
  if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && HELPERS.has(n.callee.name) && n.arguments[0] && n.arguments[0].type === 'Literal') { const nm = n.callee.name; for (let i = sc.length - 1; i >= 1; i--) if (sc[i].has(nm)) { hits.push('line ' + lineOf(n.start) + ': ' + nm + '() is shadowed by a local declaration'); break; } }
  for (const k in n) { if (k === 'type') continue; const v = n[k]; if (Array.isArray(v)) v.forEach(c => walk(c, sc)); else if (v && typeof v.type === 'string') walk(v, sc); }
};
walk(ast, []);
const missing = [...HELPERS].filter(h => h !== 'bzFk' && !top.has(h));
if (missing.length) hits.push('helper not declared at top level: ' + missing.join(','));
console.log(hits.length ? hits.join('\n') : 'fork-helper-scope: OK (' + [...HELPERS].filter(h => top.has(h)).length + ' helpers resolve to their top-level declaration; no duplicate top-level names)');
process.exit(hits.length ? 1 : 0);
