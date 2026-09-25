import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';import{LEVELS,T}from'../src/level.js';
const L=LEVELS.find(l=>l.id==='spore').build(),s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');assert(L.arena.x1-L.arena.x0===47*16);assert(!L.sleeps.length&&!L.storm);assert(!L.ents.some(e=>['puffball','roller','nest','shaman','drone','gill'].includes(e.t)));assert(L.ents.some(e=>e.mycelium));assert(L.ents.some(e=>e.motherNode));assert(!L.ents.some(e=>e.calls));assert(L.ents.filter(e=>e.elite).every(e=>e.t==='shield'));assert(!s.includes('sleep: true'));
const noop=()=>{},mother={alive:true,mode:'idle',nodeRest:0,x:0,y:0},movers=[{kind:'growcap',x:10,state:'bud',k:0,cd:2}],c=vm.createContext({mother,movers,bossActive:true,number:noop,shakeCam:noop,burst:noop,L:{arena:{floor:0}},SFX:new Proxy({},{get:()=>noop})});   /* (the heart's opening shakes the camera and bursts light, 2026-09-21) */vm.runInContext(s.slice(s.indexOf('function wakeMycelium'),s.indexOf('function updateMother')),c);c.wakeMycelium({x:0,motherNode:true});assert.equal(mother.mode,'open');assert.equal(mother.modeT,8);assert.equal(movers[0].state,'grow');mother.mode='idle';mother.nodeRest=3;c.wakeMycelium({x:0,motherNode:true});assert.equal(mother.mode,'idle');mother.nodeRest=0;c.wakeMycelium({x:0,motherNode:true});assert.equal(mother.mode,'open');console.log('Sporewood has no puffballs, sleep or respawners; expanded arena, reusable knot and growing cap steps verified.');
/* THE RULE IS THE LEVEL (the rebuild, docs/briefs/sporewood-rebuild.md). The strip above left "the caps grow into steps" as two sprouts 450
   columns in, 160 after the only sign that named it, and none in her room - and nothing noticed, because nothing asked. This asks: the rule is
   TAUGHT before column 60 (a plain bud whose grown top is a root too high to jump), USED three ways before her room (a plain step, a cap that
   LEANS over a gap of six or more, and a bud under a SPORE FALL), and PAID OFF in her room (two buds inside her walls, within her fold's reach,
   clear of the springs and of every knot anchor) - and her fold really does jam on one and open her, only when the knot could. */
{const G=L.moversExtra.filter(m=>m.kind==='growcap'),solid=(x,y)=>L.grid[y*L.W+x]===T.SOLID,topRow=m=>(m.y0-m.rise)/16,ground=m=>(m.y0+8)/16,plain=G.filter(m=>!m.lean&&!m.mother);
 const teach=plain.find(m=>m.x<60*16&&m.rise>=56&&[0,1,2].some(d=>{const x=Math.floor((m.x+m.w)/16)+d;return solid(x,topRow(m))&&!solid(x,topRow(m)-1)&&solid(x,ground(m)-1);}));
 assert(teach,'the rule is taught before column 60: a bud at the foot of a root it grows you onto');
 const lean=G.filter(m=>m.lean>0&&(()=>{let gap=0;for(let x=Math.floor((m.x+m.w)/16);x<Math.floor((m.x+m.lean+m.w)/16);x++)if(!solid(x,ground(m)))gap++;return gap>=6;})());
 assert(lean.length>=1,'a cap that leans over a gap of six or more');
 const falls=L.ents.filter(e=>e.t==='rockfall'&&e.spore),dripped=plain.filter(m=>falls.some(f=>f.x*16+8>m.x&&f.x*16+8<m.x+m.w));
 assert(dripped.length>=1,'a bud under a spore fall');
 assert(new Set([teach,...lean,...dripped]).size>=3,'three distinct uses before her room');
 const jm=s.match(/jamReach: (\d+)/);assert(jm,'her fold has a reach it can jam in (MOTHER_T.jamReach)');
 const A=L.arena,mo=L.ents.find(e=>e.t==='mother'),mx=mo.x*16+8,reach=+jm[1],room=G.filter(m=>m.mother);
 assert(room.length>=2&&room.every(m=>m.x>A.wallL*16&&m.x+m.w<A.wallR*16&&Math.abs(m.x+m.w/2-mx)<reach),'two buds in her room, inside her fold\'s reach');
 for(const m of room){for(const d of [-3,3])assert(Math.abs(m.x+m.w/2-(mx+d*16))>=24,'a room bud clear of the spring at '+d);for(const a of s.match(/MOTHER_ROOTS = \[([^\]]+)\]/)[1].split(',').map(Number))assert(Math.abs(m.x+m.w/2-(mx+a*16))>=24,'a room bud clear of the knot anchor at '+a);}
 const src=s.slice(s.indexOf('function wakeMycelium'),s.indexOf('// ---------- critters:')),cap={kind:'growcap',mother:true,state:'up',x:-104,w:32,k:1,y:250},bud={kind:'growcap',mother:true,state:'bud',x:-120,w:32,k:0,y:312},
  m={x:0,y:320,alive:true,anim:0,mode:'capClapTell',modeT:0,heart:{hp:8},phase:1,nodeRest:0},P={x:60,y:320,w:12,h:24};let hurt=0;
 const c=vm.createContext({P,mother:m,movers:[cap,bud],props:[],enemies:[],seeds:[],vines:[],bossActive:true,L:{arena:{x0:-368,x1:384,floor:320}},TS:16,DMG:{root:16},EHP:{heart:8},number:noop,burst:noop,shakeCam:noop,SFX:new Proxy({},{get:()=>noop}),box:p=>({l:p.x-6,r:p.x+6,t:p.y-24,b:p.y}),overlap:(a,b)=>a.l<b.r&&a.r>b.l&&a.t<b.b&&a.b>b.t,damagePlayer:()=>{hurt++;}});
 vm.runInContext(src,c);c.updateMother(m,1/60);assert.equal(m.mode,'open','her fold lands on a grown room cap: her heart opens');assert.equal(cap.state,'wither','and the cap is crushed');assert.equal(hurt,0,'a hero off the cap is not hurt');
 cap.state='up';m.mode='capClapTell';m.modeT=0;m.nodeRest=4;c.updateMother(m,1/60);assert.notEqual(m.mode,'open','with the knot resting, the jam opens nothing');
 cap.state='up';cap.x=300;m.mode='capClapTell';m.modeT=0;m.nodeRest=0;c.updateMother(m,1/60);assert.notEqual(m.mode,'open','a cap out of her fold\'s reach is not jammed');
 m.mode='idle';m.nodeRest=0;c.wakeMycelium({x:-128,motherNode:true});assert.equal(m.mode,'open','the knot still opens her');assert.equal(bud.state,'bud','and never grows a room bud');
 console.log('The caps grow into steps: taught at '+Math.round(teach.x/16)+', a leaning cap at '+lean.map(q=>Math.round(q.x/16))+', a bud under a spore fall at '+dripped.map(q=>Math.round(q.x/16))+', '+room.length+' buds in her room; her fold jams on a grown one.');}
/* WHAT THE STRIP LEFT EMPTY STAYS FILLED (the rebuild's second chunk): no vent lifts you over a floor with nothing to cross (the old vent marsh
   175-209 and the bog 329-372), and the bog is crossed under fire - something that shoots stands over or beside its sinks. */
{const vents=L.ents.filter(e=>e.t==='vent'&&((e.x>=175&&e.x<=209)||(e.x>=329&&e.x<=372)));assert.deepEqual(vents.map(e=>e.x),[],'vents with nothing to cross');
 const fire=L.ents.filter(e=>['spitcap','weaver'].includes(e.t)&&e.x>=329&&e.x<=372);assert(fire.length>=2,'the bog is crossed under fire: '+fire.length+' shooters');
 console.log('The empty sections are filled: no idle vents, '+fire.length+' shooters over the bog.');}
