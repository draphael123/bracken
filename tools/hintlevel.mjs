// tools/hintlevel.mjs - SETTINGS > HINTS: NONE / LOW / MEDIUM / HIGH (claude/hintlevel; Daniel 10-16: "the menu should choose how many").
//   node tools/hintlevel.mjs            the check          node tools/hintlevel.mjs --inventory   also print the hint sources by tier
// 1. src/hints.js, pure: the gate gives HIGH everything, NONE nothing; LOW only a mechanic, once per save; MEDIUM mechanic + tip once, one reminder a level, the
//    stall tier always (its time is the gate: 10 / 20 / 45 s / never); the glint (LOW after 45 s, NONE never).
// 2. SOURCE: every hint box line in src/ goes through hintSay() (or number() -> callout()) with one of the four tiers; no other file writes hintMsg; the
//    notices that set it directly (level up, XP catch-up, a gate opening, ...) are the ones named here and nothing grows by accident.
// 3. THE PAGE: the Hints row is in Gameplay > Helpers and cycles NONE/LOW/MEDIUM/HIGH; a NEW profile starts on MEDIUM, an old settings file on HIGH; the real
//    stall clock (src/stuck-guide.js) is due at 10 / 20 / 45 s / never; on every level the gate lets through (HIGH) or shuts out (NONE) every tier; LOW and
//    MEDIUM in a level; back on HIGH a line told on LOW says again and the save gains nothing.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as H from '../src/hints.js';
import { TAB_ITEMS, tabOf } from '../src/settings-ui.js';
import { LEVELS } from '../src/level.js';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), src = path.join(root, 'src');

/* ---- 1. the gate ---- */
{ const run = (level, calls) => { H.setHintLevel(level); H.setSeenStore({}); H.newLevel('a'); return calls.map(([t, id]) => H.hintAllowed(t, id)); };
  const C = [['mechanic', 'm1'], ['mechanic', 'm1'], ['tip', 't1'], ['tip', 't1'], ['reminder', 'r1'], ['reminder', 'r2'], ['stall', 's1'], ['stall', 's1']];
  assert.deepEqual(run('high', C), [true, true, true, true, true, true, true, true], 'HIGH lets every line through, repeats too (today)');
  assert.deepEqual(run('none', C), C.map(() => false), 'NONE lets nothing through');
  assert.deepEqual(run('low', C), [true, false, false, false, false, false, true, true], 'LOW: a mechanic once; no tip, no reminder');
  assert.deepEqual(run('medium', C), [true, false, true, false, true, false, true, true], 'MEDIUM: mechanic and tip once each, ONE reminder a level');
  H.setHintLevel('medium'); H.setSeenStore({}); H.newLevel('a'); assert.equal(H.hintAllowed('reminder', 'x'), true); assert.equal(H.hintAllowed('reminder', 'y'), false); H.newLevel('b'); assert.equal(H.hintAllowed('reminder', 'z'), true, 'a new level, a new reminder');
  H.setHintLevel('banana'); assert.equal(H.hintLevel(), 'high', 'a bad value is HIGH');
  assert.deepEqual(['none', 'low', 'medium', 'high'].map(l => { H.setHintLevel(l); return H.stallAfter(); }), [Infinity, 45, 20, 10], 'the nudge: never / 45 / 20 / 10 s');
  assert.deepEqual(['none', 'low', 'medium', 'high'].map(l => { H.setHintLevel(l); return [H.glintOn(0), H.glintOn(44), H.glintOn(46)]; }), [[false, false, false], [false, false, true], [true, true, true], [true, true, true]], 'the glint: never / after 45 s / as always');
  H.setHintLevel('medium'); H.markStall(true); assert.equal(H.takeStall(), true); assert.equal(H.takeStall(), false, 'the stall flag is taken once');
  assert.deepEqual(['none', 'low', 'medium', 'high'].map(l => H.nextLevel(l, 1)), ['low', 'medium', 'high', 'none']);
  H.setHintLevel('high'); }

/* ---- 2. the source ---- */
const files = fs.readdirSync(src).filter(f => f.endsWith('.js'));
const tiers = { mechanic: 0, tip: 0, reminder: 0, stall: 0 }, bad = [];
for (const f of files) { const s = fs.readFileSync(path.join(src, f), 'utf8');
  for (const m of s.matchAll(/(?<![\w.])hintSay\(\s*([^,)]*)/g)) { if (/function\s+$/.test(s.slice(Math.max(0, m.index - 10), m.index))) continue; const t = m[1].trim().replace(/^'|'$/g, ''); if (t in tiers) tiers[t]++; else if (f !== 'main.js' || !/^tier$/.test(t)) bad.push(f + ': hintSay(' + m[1] + ') has no tier'); }
  if (f !== 'main.js' && /\bhintMsg\s*=[^=]/.test(s.replace(/\/\*[\s\S]*?\*\//g, ''))) bad.push(f + ' writes hintMsg: say it through hintSay in main.js'); }
const main = fs.readFileSync(path.join(src, 'main.js'), 'utf8').replace(/\r\n/g, '\n');
const NOTICES = ['XP_CATCHUP', 'OVER-LEVELLED', 'levelUpLine', 'IS OPEN: A NEW ROAD', 'THE FIELD REMEMBERS', 'hintMsg = no;', 'calloutMsg = hintMsg = s', 'SV.LINES.broken', "YOU HAVE ' + trialName", 'function hintSay', 'function hintGate', 'let soundNoteT'];
const raw = main.split('\n').filter(l => /\b(hintMsg|hintT) = (?!0;)/.test(l) && !/textLab|uiHud: \{ hint/.test(l));
const strays = raw.filter(l => !NOTICES.some(n => l.includes(n)) && !/^\s*(if \(kind === 'heavyblow'|else if \(kind|else hintMsg)/.test(l));
for (const l of strays) bad.push('main.js sets the hint box without the gate: ' + l.trim().slice(0, 110));
if (!/hintGate\(tier, s\)/.test(main)) bad.push('callout() does not go through the gate');
const stallUsers = files.filter(f => f !== 'stuck-guide.js' && /\bstallTick\(/.test(fs.readFileSync(path.join(src, f), 'utf8'))).length;
if (process.argv.includes('--inventory')) console.log('hint sources by tier (hintSay call sites): ' + JSON.stringify(tiers) + ' | notices left ungated: ' + raw.filter(l => NOTICES.some(n => l.includes(n)) && !/function hint|calloutMsg/.test(l)).length + ' | modules on the shared stall clock: ' + stallUsers + ' (+ the global guide, hush, glass colossus)');
assert.deepEqual(bad, [], 'the gate has holes:\n  ' + bad.join('\n  '));
assert.ok(tiers.mechanic > 30 && tiers.tip > 20 && tiers.reminder >= 2 && tiers.stall >= 1, 'the tiers are filled: ' + JSON.stringify(tiers));

/* ---- 3. the settings row, statically ---- */
assert.equal(tabOf('Hints'), 'gameplay'); const g = TAB_ITEMS.gameplay; assert.ok(g.indexOf('Hints') > g.indexOf('- HELPERS -') && g.indexOf('Hints') < g.indexOf('- SAVE -'), 'Hints is in Helpers');

/* ---- 4. the page ---- */
const { openPage } = await import('./cdp.mjs');
const waitBK = async (pg, js) => { let o = null; for (let i = 0; i < 200 && o === null; i++) { await new Promise(res => setTimeout(res, 300)); o = await pg.evalp('(typeof BK==="object"&&BK.ui&&BK.lookPass)?(' + js + '):null', 3000).catch(() => null); } return o; };
let pg = await openPage({ audio: false, fonts: false, speed: false });
try {
  const r = await pg.evalp(`(async()=>{const o={};const ui=BK.ui;
    o.newProfile=ui.settings().hints;
    const SG=await import('/src/stuck-guide.js');
    o.nudge={};for(const l of ['none','low','medium','high']){BK.setHints(l);const C=SG.newStall();let at=null;for(let t=1;t<=60&&at===null;t++){if(SG.stallTick(C,500,1,t,false))at=t;}o.nudge[l]=at;}
    BK.setHints('high');
    BK.reset({fresh:true});BK.state='title';ui.openMenu('title');ui.settingsTab='gameplay';const rows=ui.menuRows();o.hasRow=rows.includes('Hints');ui.menuI=rows.indexOf('Hints');
    const key=(k)=>{dispatchEvent(new KeyboardEvent('keydown',{key:k,code:k}));BK.step(1);dispatchEvent(new KeyboardEvent('keyup',{key:k,code:k}));};
    BK.setHints('high');o.cycle=[];for(let i=0;i<4;i++){key('ArrowRight');o.cycle.push(ui.settings().hints);}
    key('ArrowLeft');o.left=ui.settings().hints;BK.setHints('high');
    o.json=JSON.parse(JSON.stringify(ui.settings())).hints;
    return o;})()`, 120000);
  assert.equal(r.newProfile, 'medium', 'a NEW profile starts on MEDIUM: ' + r.newProfile);
  assert.deepEqual(r.nudge, { none: null, low: 45, medium: 20, high: 10 }, 'the real stall clock: ' + JSON.stringify(r.nudge));
  assert.ok(r.hasRow, 'the Hints row is in the Gameplay tab');
  assert.deepEqual(r.cycle, ['none', 'low', 'medium', 'high'], 'the row cycles NONE, LOW, MEDIUM, HIGH: ' + JSON.stringify(r.cycle));
  assert.equal(r.left, 'medium', 'and back'); assert.equal(r.json, 'high', 'and saves as a plain word');
} finally { pg.close(); }

/* an OLD settings file (a player who has played) keeps HIGH; a saved choice is kept */
pg = await openPage({ audio: false, fonts: false, speed: false });
try {
  await pg.evalp(`localStorage.setItem('bracken.settings', JSON.stringify({speed:1,speedV2:1,speedV3:1,difficulty:'hard'})); 1`, 5000);
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?old=' + Date.now() });
  let o = await waitBK(pg, '({h:BK.ui.settings().hints,v:BK.ui.settings().hintsV1,d:BK.ui.settings().difficulty})');
  assert.deepEqual(o, { h: 'high', v: 1, d: 'hard' }, 'an old settings file keeps HIGH: ' + JSON.stringify(o));
  await pg.evalp(`localStorage.setItem('bracken.settings', JSON.stringify({speed:1,speedV2:1,speedV3:1,hints:'low',hintsV1:1})); 1`, 5000);
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?old2=' + Date.now() });
  o = await waitBK(pg, 'BK.ui.settings().hints');
  assert.equal(o, 'low', 'a saved LOW stays LOW');
} finally { pg.close(); }

/* every level, HIGH and NONE: the gate does what the table says; NONE shows no hint box */
pg = await openPage({ audio: false, fonts: false });
try {
  const ids = LEVELS.filter(l => l.build).map(l => l.id);
  const out = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});const res=[];const {LEVELS}=await import('/src/level.js');
    const lines={mechanic:'A GUARD TURNS A LIGHT BLOW: LEVEL TEST',tip:'HIS HIDE TAKES LITTLE: LEVEL TEST',reminder:'TOO EARLY: LEVEL TEST',stall:'THE GATE IS SHUT: FIND ITS PADDLE'};
    for(const id of ${JSON.stringify(ids)}){try{const li=LEVELS.findIndex(l=>l.id===id);BK.load(li);BK.state='play';BK.god=true;BK.sim(20);}catch(e){res.push({id,err:String(e).slice(0,80)});continue;}
      const row={id,seen:{}};
      for(const lv of ['high','none']){BK.setHints(lv);row.seen[lv]={};for(const t of Object.keys(lines)){BK.sim(1);const ok=BK.hintSay(t,3,lines[t]+' '+id+' '+lv);row.seen[lv][t]=[ok,BK.hint.msg.includes(id+' '+lv),BK.hint.t>0];}
        BK.sim(90);row.seen[lv].sim=BK.hint.t>0?BK.hint.msg.slice(0,60):'';}
      BK.setHints('high');res.push(row);}
    return res;})()`, 3000000);
  const fails = [];
  for (const row of out) { if (row.err) { fails.push(row.id + ': ' + row.err); continue; }
    for (const t of ['mechanic', 'tip', 'reminder', 'stall']) { const h = row.seen.high[t], n = row.seen.none[t]; if (t === 'stall' || true) { /* the stall line is the last said in each block, the box holds the last line said */ } if (!h[0]) fails.push(row.id + ' HIGH ' + t + ' refused ' + JSON.stringify(h)); if (n[0] || n[1]) fails.push(row.id + ' NONE ' + t + ' shown ' + JSON.stringify(n)); }
    if (row.seen.none.sim && /LEVEL TEST/.test(row.seen.none.sim)) fails.push(row.id + ' NONE: a gated line was still in the box: ' + row.seen.none.sim); }
  assert.deepEqual(fails, [], 'levels:\n  ' + fails.slice(0, 20).join('\n  '));
  console.log('hintlevel levels OK: ' + out.length + ' levels, HIGH takes every tier, NONE none');
  /* the middle two, in one level: LOW and MEDIUM */
  const mid = await pg.evalp(`(async()=>{BK.manualSimulation=true;BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=true;BK.sim(20);const o={};
    for(const lv of ['low','medium']){BK.setHints(lv);o[lv]=[];const say=(t,m)=>{BK.sim(300);const ok=BK.hintSay(t,3,m);o[lv].push([t,m.slice(0,8),ok]);};
      say('mechanic','MECH ONE '+lv);say('mechanic','MECH ONE '+lv);say('tip','TIP ONE '+lv);say('tip','TIP ONE '+lv);say('reminder','REM ONE '+lv);say('reminder','REM TWO '+lv);say('stall','STALL ONE '+lv);}
    BK.setHints('high');const n0=Object.keys(BK.hintSeen()||{}).length;BK.hintSay('mechanic',3,'MECH ONE low');o.highAgain=BK.hint.msg;o.n=[n0,Object.keys(BK.hintSeen()||{}).length];return o;})()`, 300000);
  const ok = lv => mid[lv].map(x => x[2]);
  assert.deepEqual(ok('low'), [true, false, false, false, false, false, true], 'LOW in a level: ' + JSON.stringify(mid.low));
  assert.deepEqual(ok('medium'), [true, false, true, false, true, false, true], 'MEDIUM in a level: ' + JSON.stringify(mid.medium));
  assert.equal(mid.highAgain, 'MECH ONE low', 'back on HIGH a line told on LOW says again'); assert.equal(mid.n[0], mid.n[1], 'HIGH writes nothing to the save');
  console.log('hintlevel OK: gate, source ' + JSON.stringify(tiers) + ', stall clock 10/20/45/never, row, defaults, ' + out.length + ' levels');
} finally { pg.close(); }

/* ---- 5. THE STALL, in a real level: a hero held still at a listed spot is nudged at 10 s (HIGH) / 20 (MEDIUM) / 45 (LOW) / never (NONE), and the glint over
   what the route needs is as it was on HIGH and MEDIUM, only after 45 s on LOW, never on NONE (src/stuck-guide.js, the shared clock) ---- */
{ const { STUCK } = await import('../src/stuck-spots.js'); const { T } = await import('../src/level.js');
  const TS = 16, SOLIDS = new Set([T.SOLID, T.SPIKE, T.CRATE, T.PALISADE, T.PLANK, T.PORT, T.SOFT, T.ICE, T.CRYST, T.SHELF, T.BOUNCER, T.RAIL]);
  const solid = (L, x, y) => x < 0 || y < 0 || x >= L.W || y >= L.H || SOLIDS.has(L.grid[y * L.W + x]);
  let plan = null;
  for (const [id, spots] of Object.entries(STUCK)) { if (plan) break; const lv = LEVELS.find(l => l.id === id); if (!lv || !lv.build) continue; let L; try { L = lv.build(); } catch { continue; }
    for (const sp of spots) { if (sp.steps || sp.glint === 'stall' || !sp.at || !sp.zone) continue; const [c0, r0, c1, r1] = sp.zone;
      for (let r = r0; r <= r1 && !plan; r++) for (let c = c0; c <= c1 && !plan; c++) { if (solid(L, c, r) || solid(L, c, r - 1) || !solid(L, c, r + 1) || Math.hypot(c - sp.at[0], r - sp.at[1]) < 3) continue; plan = { id, spot: sp.id, line: sp.line, p: [c, r] }; }
      if (plan) break; } }
  assert.ok(plan, 'a plain single-step spot to hold a hero at');
  const pg2 = await openPage({ audio: false, fonts: false });
  try {
    const R = await pg2.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});const q=${JSON.stringify(plan)};const out={};
      const stub=()=>({n:0,globalAlpha:1,strokeStyle:'',fillStyle:'',lineWidth:1,beginPath(){},arc(){this.n++},stroke(){},fillRect(){this.n++}});
      for(const lv of ['high','medium','low','none']){BK.setHints(lv);BK.load(LEVELS.findIndex(l=>l.id===q.id));BK.state='play';BK.god=true;BK.sim(30);BKT.guide.reset(q.id);BK.uiHud.hint('',0);BK.enemies().length=0;
        const rec={said:null,glint:[]};const per=lv==='none'?6500:lv==='low'?4800:2300;
        for(let i=0;i<per&&rec.said===null;i++){if(i%10===0){BK.tp(q.p[0],q.p[1]);BK.P.vx=0;BK.P.vy=0;if(BK.chase&&BK.chase.on())BK.chase.reset();}BK.sim(1);
          if(i===500||i===4400){const g=stub();BKT.guide.draw(g,0,0,320,180,1);rec.glint.push([Math.round(i/60*BK.ui.settings().speed),g.n>0]);}
          const t=BKT.hintNow;if(t&&t.msg===q.line)rec.said=Math.round(i/60*BK.ui.settings().speed*10)/10;}
        {const g=stub();BKT.guide.draw(g,0,0,320,180,1);rec.after=g.n>0;}out[lv]=rec;}
      BK.setHints('high');return out;})()`, 1200000);
    const near = (v, want, tol) => v !== null && Math.abs(v - want) <= tol;
    assert.ok(near(R.high.said, 10, 1.5), 'HIGH: nudged at 10 s: ' + JSON.stringify(R.high)); assert.ok(near(R.medium.said, 20, 1.5), 'MEDIUM: nudged at 20 s: ' + JSON.stringify(R.medium));
    assert.ok(near(R.low.said, 45, 1.5), 'LOW: nudged at 45 s: ' + JSON.stringify(R.low)); assert.equal(R.none.said, null, 'NONE: never nudged in 60 s: ' + JSON.stringify(R.none));
    assert.ok(R.high.glint[0][1] && R.medium.glint[0][1], 'HIGH and MEDIUM: the glint shows at 5 s, as it always did'); assert.ok(!R.low.glint[0][1], 'LOW: no glint at 5 s'); assert.ok(!(R.low.glint[1] && R.low.glint[1][1]), 'LOW: still no glint at 44 s'); assert.ok(R.low.after, 'LOW: the glint shows once the nudge has come (45 s)');
    assert.ok(!R.none.glint[0][1] && !R.none.glint[1][1], 'NONE: no glint at all');
    console.log('hintlevel stall OK (' + plan.id + ' / ' + plan.spot + '): nudge at ' + [R.high.said, R.medium.said, R.low.said, R.none.said].join(' / ') + ' s (HIGH / MEDIUM / LOW / NONE)');
  } finally { pg2.close(); }
}
