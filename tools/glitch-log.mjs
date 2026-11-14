// PAGE TOOL: launches headless Chrome
/* tools/glitch-log.mjs - THE GLITCH LOG (testkit-d 11-13, Daniel's list: "a boss's staff disappears while she casts" - nothing in the gate would ever have said so).
   A recorder that rides on a level walk (tools/level-walk.mjs) or a boss fight (tools/boss-run.mjs, so tools/boss-rates.mjs) and writes down, with frame, time and position, what a player would
   call a glitch. DEFAULT OFF: with no switch the two tools run exactly the code they ran before (one `if` each). It reads GAME STATE out of the page (BK / BKT); pixels only for the blank-frame probe.
   SWITCH ON:   BRACKEN_GLITCH_LOG=<file.jsonl>   (or =1 for <tmp>/bracken-glitch.jsonl)   e.g.
        BRACKEN_GLITCH_LOG=C:/tmp/g.jsonl node tools/level-walk.mjs sporewood --heroes=knight --seeds=1 --lite
        BRACKEN_GLITCH_LOG=C:/tmp/g.jsonl node tools/boss-rates.mjs huntmaster --heroes=knight -n 1
   BRACKEN_GLITCH_PIXELS=1 adds the blank/black-frame probe (it RENDERS a frame every 90 sim frames, which a state-only run never does: it can move a particle's random draw, so it is its own switch).
   WHAT IT RECORDS (kind):
     console-error / page-error   console.error calls and uncaught exceptions (the Keep 2 class: a page that throws every frame while a node proof passes)
     hero-bounds / foe-bounds     the hero or any live fighter with a NaN/non-finite position or outside the level (a margin of 16 px across, 64 up, 200 down, a pit's fall)
     boss-out-of-arena            the boss outside L.arena x0..x1 by more than 64 px while it is awake
     held-item-vanish             a fighter's held-item field (staff, wand, weapon, held, torch, lantern, orb ...) that was set and goes false/null/undefined while it is alive and not dying
     prop-vanish                  a prop that was in the level, had life left (life/ttl/hp > 0), carried no done/got/open/gone/broken/used flag and was dropped from the list
     hint-replaced                a hint box line replaced by another before it had been on screen long enough to read (1.2 s .. 0.04 s a letter, capped 2.5 s) while it still had time on its clock
     blank-frame / black-frame    (pixels only) two probes in a row whose canvas is one colour / near black while state is 'play' (a fade, the iris and the level-up card are not 'play')
   Findings repeat a lot (the same line every frame): the first 3 of a kind+subject are kept whole, the rest are counted. OUTPUT: JSON lines (one finding per line: kind, row, hero, seed, f, t, x, y, msg ...) and
   a short summary (printed on a run, and by   node tools/glitch-log.mjs --summary <file.jsonl>).
   PROOF THAT IT SEES: node tools/glitch-log.mjs --selftest   (one page; it injects fakes FROM THE TOOL - a NaN fighter, a vanishing staff, a prop dropped mid-life, a console.error, two hints on top of each
   other, a black canvas - and fails unless every one is caught; src/ is not touched). */
import fs from 'fs'; import os from 'os'; import path from 'path'; import { fileURLToPath } from 'url';
export const glitchFile = () => { const v = process.env.BRACKEN_GLITCH_LOG; if (!v || v === '0') return null; return v === '1' ? path.join(os.tmpdir(), 'bracken-glitch.jsonl') : v; };
export const glitchEnabled = () => !!glitchFile();
export const glitchPixels = () => process.env.BRACKEN_GLITCH_PIXELS === '1';
/* THE PAGE SIDE. window.__GL wraps BK.sim and BK.step (every tool frame, bossLab's and the walker's, goes through one of them) and looks after each frame; it only READS the game. */
export const glitchPageJs = (o = {}) => `(()=>{if(window.__GL&&window.__GL.on)return true;
const PIX=${o.pixels ? 'true' : 'false'},HELD=/^(staff|wand|stave|crook|weapon|held|heldItem|holding|carry|carrying|torch|lantern|orb|sceptre|scepter)$/;
const G=window.__GL={on:true,f:0,ev:[],n:{},keys:new Map(),pix:null,pixAt:0,blankRun:0,blackRun:0};
const rd=(fn,d)=>{try{const v=fn();return v===undefined?d:v;}catch{return d;}};
const BKo=()=>window.BK,hero=()=>rd(()=>BKo().P,null),L=()=>rd(()=>BKo().L,null);
const add=(kind,subject,d)=>{const key=kind+'|'+subject;const c=(G.keys.get(key)||0)+1;G.keys.set(key,c);G.n[kind]=(G.n[kind]||0)+1;if(c>3||G.ev.length>=300)return;
  const p=hero();G.ev.push(Object.assign({kind,f:G.f,t:+(G.f/60).toFixed(2),level:rd(()=>{const l=L();return l.id||l.name||l.key||null;},null),hx:p&&Number.isFinite(p.x)?Math.round(p.x):null,hy:p&&Number.isFinite(p.y)?Math.round(p.y):null,subject},d||{}));};
const origErr=console.error.bind(console);console.error=(...a)=>{try{add('console-error',String(a[0]).slice(0,60),{msg:a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,300)});}catch{}return origErr(...a);};
window.addEventListener('error',e=>add('page-error',String(e.message).slice(0,60),{msg:String(e.message).slice(0,300),at:e.filename+':'+e.lineno}));
window.addEventListener('unhandledrejection',e=>add('page-error','rejection '+String(e.reason&&e.reason.message||e.reason).slice(0,50),{msg:String(e.reason&&e.reason.stack||e.reason).slice(0,300)}));
const bad=v=>typeof v!=='number'||!Number.isFinite(v);
const seenHeld=new WeakMap(),propPrev={set:new Set(),n:0};let hintCur={msg:'',shown:0,lastT:0};
const DONE=['done','got','open','gone','broken','used','spent','dead','dying','dropped','landed','lit','fired','burst','taken','collected','open','smashed','popped','cut'];
const need=m=>Math.min(2.5,Math.max(1.2,0.04*String(m).length));
const look=()=>{const B=BKo();if(!B)return;const P=hero(),Lv=L();if(!Lv)return;const W=(Lv.W||0)*16,H=(Lv.H||0)*16,play=rd(()=>B.state,'')==='play';
  if(P&&!(P.dead>0)){if(bad(P.x)||bad(P.y)||bad(P.vx)||bad(P.vy))add('hero-bounds','nan',{msg:'non-finite hero position/velocity',x:String(P.x),y:String(P.y)});else if(W&&(P.x<-16||P.x>W+16||P.y<-64||P.y>H+200))add('hero-bounds','out',{msg:'hero outside the level',x:Math.round(P.x),y:Math.round(P.y),W,H});}
  const bo=rd(()=>typeof B.boss==='function'?B.boss():B.boss,null),A=Lv.arena,es=rd(()=>B.enemies(),[])||[];
  for(const e of es){if(!e||!e.alive||e.dying>0)continue;const nm=String(e.t);
    if(bad(e.x)||bad(e.y))add('foe-bounds',nm+' nan',{msg:'non-finite fighter position',foe:nm,x:String(e.x),y:String(e.y)});else if(W&&(e.x<-16||e.x>W+16||e.y<-96||e.y>H+240))add('foe-bounds',nm+' out',{msg:'fighter outside the level',foe:nm,x:Math.round(e.x),y:Math.round(e.y),W,H});
    if(e===bo&&A&&Number.isFinite(A.x0)&&Number.isFinite(A.x1)&&Number.isFinite(e.x)&&(e.x<A.x0-64||e.x>A.x1+64)&&rd(()=>B.bossActive!==false,true))add('boss-out-of-arena',nm,{msg:'boss outside the arena',foe:nm,x:Math.round(e.x),x0:A.x0,x1:A.x1});
    let held=seenHeld.get(e);if(!held){held={};seenHeld.set(e,held);}
    for(const k in e){if(!HELD.test(k))continue;const v=e[k];if(v){held[k]=1;}else if(held[k]){held[k]=0;add('held-item-vanish',nm+' '+k,{msg:nm+' lost its '+k+' while alive',foe:nm,key:k,x:Math.round(e.x),y:Math.round(e.y),pose:rd(()=>e.mode||e.state||e.pose,null)});}}}
  if(P){let held=seenHeld.get(P);if(!held){held={};seenHeld.set(P,held);}for(const k in P){if(!HELD.test(k))continue;if(P[k])held[k]=1;else if(held[k]){held[k]=0;add('held-item-vanish','hero '+k,{msg:'the hero lost its '+k,key:k});}}}
  const pr=rd(()=>B.props(),null);if(pr){const cur=new Set(pr);if(propPrev.n&&cur.size<propPrev.set.size+8){for(const o of propPrev.set){if(cur.has(o))continue;if(!o||typeof o!=='object')continue;const life=(+o.life>0)||(+o.ttl>0)||(+o.hp>0);if(!life)continue;if(DONE.some(k=>o[k]))continue;add('prop-vanish',String(o.t),{msg:'prop '+o.t+' dropped with life left',prop:String(o.t),x:Math.round(o.x),y:Math.round(o.y),life:o.life,ttl:o.ttl,hp:o.hp});}}propPrev.set=cur;propPrev.n=1;}
  const hn=rd(()=>window.BKT.hintNow,null);if(hn){if(hn.t>0&&hn.msg&&hn.msg!==hintCur.msg){const o=hintCur;if(o.msg&&o.lastT>0.05&&o.shown/60<need(o.msg))add('hint-replaced',o.msg.slice(0,40),{msg:'"'+o.msg+'" shown '+(o.shown/60).toFixed(2)+' s, replaced by "'+hn.msg+'"',was:o.msg,now:hn.msg,shownS:+(o.shown/60).toFixed(2),neededS:+need(o.msg).toFixed(2)});hintCur={msg:hn.msg,shown:0,lastT:hn.t};}
    else if(hn.t>0&&hn.msg===hintCur.msg){if(play)hintCur.shown++;hintCur.lastT=hn.t;}else if(!(hn.t>0)){hintCur.lastT=0;}}
  if(PIX&&play&&G.f-G.pixAt>=90&&!(P&&P.dead>0)){G.pixAt=G.f;if(!G.pix){try{step0(0);}catch{}}const v=G.pix?G.pix():probe();if(v){G.blankRun=v.flat?G.blankRun+1:0;G.blackRun=v.black?G.blackRun+1:0;if(G.blankRun>=2&&!v.black)add('blank-frame','blank',{msg:'two probes in a row, one colour',rgb:v.rgb});if(G.blackRun>=2)add('black-frame','black',{msg:'two probes in a row, near black',rgb:v.rgb});}}};
const probe=()=>{try{const c=document.getElementById('c');if(!c)return null;const g=c.getContext('2d');if(!g)return null;const w=c.width,h=c.height;let mx=0,first=null,flat=true;for(let i=1;i<=8;i++)for(let j=1;j<=6;j++){const d=g.getImageData(Math.floor(w*i/9),Math.floor(h*j/7),1,1).data;mx=Math.max(mx,d[0],d[1],d[2]);const k=d[0]+','+d[1]+','+d[2];if(first===null)first=k;else if(k!==first)flat=false;}return{flat,black:mx<8,rgb:first};}catch(e){return null;}};
const B0=BKo(),sim0=B0.sim.bind(B0),step0=B0.step.bind(B0);
B0.sim=function(n=1){for(let i=0;i<n;i++){sim0(1);G.f++;try{look();}catch(e){add('recorder-fault',String(e.message).slice(0,40),{msg:String(e.stack).slice(0,300)});}}};
B0.step=function(n=1){for(let i=0;i<n;i++){sim0(1);G.f++;try{look();}catch(e){add('recorder-fault',String(e.message).slice(0,40),{msg:String(e.stack).slice(0,300)});}}step0(0);};
G.dump=()=>({f:G.f,ev:G.ev.splice(0),n:Object.assign({},G.n),keys:[...G.keys].filter(([,c])=>c>3).map(([k,c])=>[k,c])});
return true;})()`;
/* THE NODE SIDE. attach after the page is up (and after any pg.reload()), collect when the row is done (also on a failed row). */
export async function glitchAttach(pg, meta = {}) {
  if (!glitchEnabled()) return null;
  await pg.evalp(glitchPageJs({ pixels: glitchPixels() }), 30000);
  return { collect: async (extra = {}) => collectGlitch(pg, { ...meta, ...extra }) };
}
export async function collectGlitch(pg, meta = {}) {
  const d = await pg.evalp('window.__GL?window.__GL.dump():null', 30000).catch(() => null);
  if (!d) return null;
  const ev = d.ev.map(e => ({ ...meta, ...e }));
  const seen = new Set(ev.filter(e => e.kind === 'page-error').map(e => String(e.msg).slice(0, 80)));
  for (const m of (pg.errors || []).slice()) { const s = String(m).slice(0, 300); if (!seen.has(s.slice(0, 80))) { ev.push({ ...meta, kind: 'page-error', f: d.f, t: +(d.f / 60).toFixed(2), subject: s.slice(0, 60), msg: s, via: 'cdp' }); d.n['page-error'] = (d.n['page-error'] || 0) + 1; } }
  const f = glitchFile(); if (f && ev.length) fs.appendFileSync(f, ev.map(e => JSON.stringify(e)).join('\n') + '\n');
  const sum = { frames: d.f, findings: Object.values(d.n).reduce((a, b) => a + b, 0), byKind: d.n, repeated: d.keys };
  console.log('  [glitch] ' + (meta.row || meta.id || '?') + (meta.hero ? ' ' + meta.hero : '') + (meta.seed !== undefined ? ' s' + meta.seed : '') + ': ' + d.f + ' frames, ' + (sum.findings ? sum.findings + ' finding(s) ' + JSON.stringify(sum.byKind) + (f ? ' -> ' + f : '') : 'no findings'));
  return sum;
}
export function summarizeFile(file) {
  const rows = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
  const by = new Map(); for (const e of rows) { const k = e.kind + ' | ' + e.subject; by.set(k, (by.get(k) || 0) + 1); }
  return { n: rows.length, lines: [...by].sort((a, b) => b[1] - a[1]).map(([k, c]) => c + 'x ' + k) };
}
/* ---- CLI ---- */
if (process.argv[1] && /glitch-log\.mjs$/.test(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2);
  if (args.includes('--summary')) { const f = args[args.indexOf('--summary') + 1] || glitchFile(); const s = summarizeFile(f); console.log('glitch-log summary of ' + f + ': ' + s.n + ' finding line(s)'); s.lines.forEach(l => console.log('  ' + l)); process.exit(0); }
  if (args.includes('--selftest')) {
    const { openPage } = await import('./cdp.mjs');
    const tmp = path.join(os.tmpdir(), 'bracken-glitch-selftest-' + process.pid + '.jsonl'); process.env.BRACKEN_GLITCH_LOG = tmp; process.env.BRACKEN_GLITCH_PIXELS = '1';
    const pg = await openPage({ audio: false, fonts: false }); let out;
    try {
      await pg.evalp(`(async()=>{const{LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.setHero('knight');BK.reset({fresh:true});BK.load(0);BK.state='play';BK.god=true;BK.sim(30);return 1;})()`, 120000);
      const gl = await glitchAttach(pg, { row: 'selftest', hero: 'knight', seed: 0 });
      out = await pg.evalp(`(async()=>{
        BK.sim(20);                                                                   /* a clean stretch first */
        const es=BK.enemies(),fake={t:'fakefoe',alive:true,dying:0,x:BK.P.x+40,y:BK.P.y,hp:10,staff:true};es.push(fake);BK.sim(5);
        fake.staff=false;BK.sim(2);                                                    /* held-item-vanish */
        fake.x=NaN;BK.sim(1);fake.x=BK.P.x+40;                                         /* foe-bounds (NaN) */
        const fake2={t:'farfoe',alive:true,dying:0,x:BK.L.W*16+5000,y:BK.P.y};es.push(fake2);BK.sim(1);fake2.alive=false;
        const pr=BK.props(),fp={t:'fakeprop',x:BK.P.x+20,y:BK.P.y,life:3};pr.push(fp);BK.sim(3);pr.splice(pr.indexOf(fp),1);BK.sim(2);   /* prop-vanish */
        console.error('selftest injected console error');BK.sim(1);                    /* console-error */
        let seq=0;const real=Object.getOwnPropertyDescriptor(BKT,'hintNow');const fakes=[{t:3,msg:'THE FIRST ONE-TIME HINT'},{t:3,msg:'THE SECOND ONE-TIME HINT'}];
        Object.defineProperty(BKT,'hintNow',{configurable:true,get(){return fakes[Math.min(seq,1)];}});BK.sim(10);seq=1;BK.sim(2);Object.defineProperty(BKT,'hintNow',real);   /* hint-replaced */
        window.__GL.pix=()=>({flat:true,black:true,rgb:'0,0,0'});BK.sim(200);window.__GL.pix=null;   /* black-frame (two probes) */
        return 1;})()`, 120000);
      const sum = await gl.collect();
      const need = ['held-item-vanish', 'foe-bounds', 'prop-vanish', 'console-error', 'hint-replaced', 'black-frame'], miss = need.filter(k => !(sum.byKind[k] > 0));
      const evs = fs.readFileSync(tmp, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)), early = evs.filter(e => e.f <= 20).length;   /* the clean stretch (frames 1-20 of the injection run) must have logged nothing */
      const clean = (sum.byKind['hero-bounds'] || 0) + (sum.byKind['recorder-fault'] || 0) + early;
      if (miss.length || clean) { console.log('glitch-log SELFTEST FAIL: not caught: ' + (miss.join(', ') || '-') + '; unexpected: ' + clean); console.log(JSON.stringify(sum)); process.exitCode = 1; }
      else console.log('glitch-log SELFTEST OK: ' + need.join(', ') + ' were all caught from tool-side fakes (' + JSON.stringify(sum.byKind) + '); the clean 20 frames before them logged nothing');
    } finally { pg.close(); try { fs.unlinkSync(tmp); } catch {} }
  }
}
