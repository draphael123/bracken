import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';import{LEVELS}from'../src/level.js';
const L=LEVELS.find(l=>l.id==='crown').build(),s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{};
const props=L.ents.filter(e=>e.t==='support').map(e=>({...e,x:e.x*16+8,y:(e.y+1)*16,saved:new Map()}));assert.equal(props.length,5);
assert(L.interiors.some(r=>r[0]===470&&r[1]===509&&r[4]==='forge'));assert(L.interiors.some(r=>r[0]===762&&r[1]===809&&r[4]==='royal'));assert.equal(L.ents.filter(e=>e.unstable).length,3);
const boss={t:'gqueen',alive:true,x:props[2].x,y:props[2].y,hp:100,maxHp:100,phase:2,mode:'stand'},P={dead:false,x:boss.x,y:boss.y,hp:100};
const c=vm.createContext({L,LW:L.W,TS:16,props,boss,P,parts:[],tileSpr:[],destroyed:new Set(),T:{AIR:0},SFX:new Proxy({},{get:()=>noop}),resolveTiles:noop,shakeCam:noop,zoomKick:noop,burst:noop,gqSay:noop,hurtEnemy:noop,damagePlayer(){throw Error('pillar hurt player');}});
vm.runInContext(s.slice(s.indexOf('function gqSections()'),s.indexOf('function gqRegrow(')),c);c.gqSections();c.gqDropSection(props[2]);assert.equal(P.hp,100);assert.equal(boss.mode,'pinned');assert.equal(boss.hp,93);
console.log('Highcrown: two additional encounters, five pillars, three unstable chandeliers; collapse harms Queen and never player.');
