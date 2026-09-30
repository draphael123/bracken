/* hint-shown: a line written for the player must be one the player can see (claude/hintsweep).
   main.js's number() lets a capital-letter string through only when it is one of the MOVE_WORDS; every other one is dropped, so a
   number(x, y, 'HE IS OPEN') was never on screen (the Undead Archmage's realm lines, claude/archfix, were the first found).
   SOURCE: every number() text literal in src/ is one of
     - a MOVE_WORD (it floats),
     - a teaching line in src/hint-lines.js (number() draws it in the hint box), or
     - old silent flavour counted in tools/hint-shown-silent.txt (file, count, text). That list may only SHRINK: a new dead line fails,
       and so does a line the list still holds that is gone (rewrite it with --write once you have deleted or routed lines).
   RUNTIME: three recovered lines are pushed through number() in the real page and must be DRAWN; a flavour line must not be.
     node tools/hint-shown.mjs            check
     node tools/hint-shown.mjs --write    rewrite tools/hint-shown-silent.txt from the source (only after deleting or routing dead lines)
     node tools/hint-shown.mjs --list     print every dropped literal with file:line */
import fs from 'fs'; import path from 'path'; import assert from 'assert'; import { fileURLToPath, pathToFileURL } from 'url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), src = path.join(root, 'src');
const args = process.argv.slice(2);
const HL = path.join(src, 'hint-lines.js');
const { CALL_LINES, isCallout, calloutText } = fs.existsSync(HL) ? await import(pathToFileURL(HL).href) : { CALL_LINES: new Set(), isCallout: () => false, calloutText: s => s };
const main = fs.readFileSync(path.join(src, 'main.js'), 'utf8');
const m = /const MOVE_WORDS = new Set\((\[[^\]]*\])\)/.exec(main); if (!m) { console.error('hint-shown: MOVE_WORDS not found'); process.exit(1); }
const WORDS = new Set(eval(m[1]));
const drops = txt => /[A-Z]/.test(txt) && !WORDS.has(txt);
const BS = String.fromCharCode(92);
const found = [];   /* [file, line, text] */
for (const f of fs.readdirSync(src).filter(f => f.endsWith('.js'))) {
  const s = fs.readFileSync(path.join(src, f), 'utf8'); const re = /(?<![A-Za-z0-9_$])(?:[A-Za-z_$][\w$]*\.)?number\(/g; let mm;
  while ((mm = re.exec(s))) {
    if (/function\s+$/.test(s.slice(Math.max(0, mm.index - 12), mm.index))) continue;
    let i = re.lastIndex, depth = 1, parts = [], cur = '', q = null;
    for (; i < s.length && depth > 0; i++) { const c = s[i];
      if (q) { cur += c; if (c === BS) { cur += s[++i]; } else if (c === q) q = null; continue; }
      if (c === "'" || c === '"' || c === '`') { q = c; cur += c; continue; }
      if ('([{'.includes(c)) depth++; if (')]}'.includes(c)) { depth--; if (!depth) break; }
      if (c === ',' && depth === 1) { parts.push(cur); cur = ''; continue; } cur += c; }
    parts.push(cur); const t = parts[2]; if (t === undefined) continue;
    const line = s.slice(0, mm.index).split('\n').length;
    for (const lit of t.matchAll(/'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) { const txt = lit[1] ?? lit[2] ?? lit[3]; if (!txt.includes('${') && drops(txt)) found.push(['src/' + f, line, txt]); }
  }
}
if (args.includes('--list')) { found.forEach(([f, l, t]) => console.log(f + ':' + l + '  ' + JSON.stringify(t) + (CALL_LINES.has(t) ? '   [routed]' : ''))); process.exit(0); }
const silent = found.filter(([, , t]) => !CALL_LINES.has(t));
const tally = a => { const c = new Map(); for (const [f, , t] of a) { const k = f + '\t' + t; c.set(k, (c.get(k) || 0) + 1); } return c; };
const BASE = path.join(root, 'tools', 'hint-shown-silent.txt');
if (args.includes('--write')) { const c = tally(silent); fs.writeFileSync(BASE, '# number() text the filter drops, on purpose: old silent flavour (file, count, text). It may only shrink (tools/hint-shown.mjs).\n' + [...c].sort().map(([k, n]) => k.split('\t')[0] + '\t' + n + '\t' + JSON.stringify(k.split('\t')[1])).join('\n') + '\n'); console.log('wrote ' + c.size + ' rows (' + silent.length + ' calls)'); process.exit(0); }
const base = new Map(); if (fs.existsSync(BASE)) for (const ln of fs.readFileSync(BASE, 'utf8').split('\n')) { if (!ln || ln[0] === '#') continue; const [f, n, t] = ln.split('\t'); base.set(f + '\t' + JSON.parse(t), +n); }
const now = tally(silent), bad = [], stale = [];
for (const [k, n] of now) if (n > (base.get(k) || 0)) bad.push(k.replace('\t', '  ') + (n > 1 ? '  (x' + n + ')' : ''));
for (const [k, n] of base) if ((now.get(k) || 0) < n) stale.push(k.replace('\t', '  '));
for (const t of CALL_LINES) { if (t.length > 62) bad.push('a teaching line too long for one hint line: ' + t); if (WORDS.has(t)) bad.push('a teaching line that is also a MOVE_WORD: ' + t); }
const called = new Set(found.map(x => x[2])); const unused = [...CALL_LINES].filter(t => !called.has(t));
if (unused.length) bad.push('routed lines no number() call says any more (delete them from src/hint-lines.js): ' + unused.join(' | '));
if (!/isCallout\(txt\)[^\n]*callout\(txt\)/.test(main)) bad.push('main.js number() does not route the teaching lines to callout()');
if (bad.length) { console.log('hint-shown FAIL: ' + bad.length + ' number() literal(s) the filter drops that nothing routes or counts as flavour:'); bad.forEach(x => console.log('  ' + x)); console.log('  Route a teaching line in src/hint-lines.js, or delete the call. (Flavour is never re-baselined by hand.)'); process.exit(1); }
if (stale.length) { console.log('hint-shown FAIL: tools/hint-shown-silent.txt holds ' + stale.length + ' line(s) that are gone: run node tools/hint-shown.mjs --write'); stale.slice(0, 8).forEach(x => console.log('  ' + x)); process.exit(1); }
console.log('hint-shown source: ' + found.length + ' number() literals the filter drops: ' + (found.length - silent.length) + ' routed to the hint box, ' + silent.length + ' old silent flavour (none new)');

/* RUNTIME: the routed lines are DRAWN, in the real page; a flavour line is not */
const { openPage } = await import('./cdp.mjs');
const pg = await openPage({ audio: false, fonts: false });
let r;
try {
  r = await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=true;BK.sim(30);
    const fresh=()=>{BK.load(0);BK.state="play";BK.god=true;BK.sim(30);};const seen=s=>{let ok=false;for(let i=0;i<40&&!ok;i++){window.__textRec=[];BK.step(1);const t=window.__textRec||[];window.__textRec=null;ok=t.some(x=>x.s===s);}return ok;};
    const out={};const say=(k,s)=>{fresh();BKT.number(BK.P.x,BK.P.y-40,k,'#8fd160');out[k]={hint:BKT.hintNow.msg,t:BKT.hintNow.t,drawn:seen(s||k)};};
    say('HE IS OPEN');say('STRIKE ITS LEVER');say('THE FIRE IS OUT - GO');say('THE GOBLIN QUEEN  OPEN','THE GOBLIN QUEEN: OPEN');
    fresh();BKT.number(BK.P.x,BK.P.y-40,'TIRED','#8fd160');out.TIRED={hint:BKT.hintNow.msg,t:BKT.hintNow.t,drawn:seen('TIRED')};
    fresh();BKT.number(BK.P.x,BK.P.y-40,'THE ROAD COMES UP: 2 LAMPS','#ffd36b');out.count={hint:BKT.hintNow.msg,drawn:seen('THE ROAD COMES UP: 2 LAMPS')};
    fresh();BKT.number(BK.P.x,BK.P.y-40,'HE IS OPEN','#8fd160');const a=BKT.hintNow.t;BK.sim(2);BKT.number(BK.P.x,BK.P.y-40,'HE IS OPEN','#8fd160');out.gap=[a,BKT.hintNow.t];
    return out;})()`, 240000);
} finally { pg.close(); }
for (const k of ['HE IS OPEN', 'STRIKE ITS LEVER', 'THE FIRE IS OUT - GO', 'THE GOBLIN QUEEN  OPEN']) {
  assert.equal(r[k].hint, calloutText(k), k + ': number() did not put the line in the hint box: ' + JSON.stringify(r[k]));
  assert.ok(r[k].drawn, k + ': the line is in the hint box but is not DRAWN: ' + JSON.stringify(r[k])); }
assert.ok(r.count.drawn, 'a counted line (THE ROAD COMES UP: 2 LAMPS) is not drawn: ' + JSON.stringify(r.count));
assert.ok(!r.TIRED.drawn && r.TIRED.hint !== 'TIRED', 'a flavour line is on the screen: ' + JSON.stringify(r.TIRED));
assert.ok(r.gap[1] < r.gap[0] + 0.001, 'the same line, said again within 4 s, restarts the hint: ' + JSON.stringify(r.gap));
console.log('hint-shown OK: HE IS OPEN, STRIKE ITS LEVER, THE FIRE IS OUT - GO, THE GOBLIN QUEEN: OPEN and a counted line are drawn in the page; a flavour line is not');
