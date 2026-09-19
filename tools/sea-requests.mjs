import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import vm from'node:vm';import{LEVELS}from'../src/level.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8'),noop=()=>{};
const source=(a,b)=>s.slice(s.indexOf('function '+a+'('),s.indexOf('function '+b+'('));
for(const stage of [1,2,3]){
 const arm={i:0,bx:200,tx:230,ty:314,hp:20,max:20,st:'down',two:true,regrown:true,low:true,ae:{alive:true,hp:20}};
 const boss={stage,arms:[arm],mode:'stride2',back:'stride2'};
 const c=vm.createContext({L:{arena:{floor:320}},parts:[],SFX:new Proxy({},{get:()=>noop}),krkArmPts:()=>[],hitstop:noop,shakeCam:noop,zoomKick:noop,ringAt:noop,krakenSplash:noop,time:0});
 vm.runInContext(source('krakenSever','krakenBreakRoad')+source('krakenArmsTick','krakenHurt')+source('krakenArmsUp','krakenFreeCol'),c);
 c.krakenSever(boss,arm);arm.st='hid';for(let i=0;i<1200;i++){c.krakenArmsUp(boss);c.krakenArmsTick(boss,.05);}
 assert.equal(arm.hp,0);assert.equal(arm.st,'gone');assert.equal(arm.ae.alive,false);
}
for(const dodge of [0,.3])for(const result of ['blocked','hit']){
 let count=0;const P={x:300,y:310,h:18,dead:false,ground:true,vx:0,vy:0,dodge,washed:0};
 const c=vm.createContext({P,L:{wash:{every:9,tell:3,x0:0,x1:1000,speed:210,dmg:12}},wash:{state:'run',x:298,dir:1,end:900,t:0},roll:null,parts:[],enemies:[],TS:16,T:{NET:9,CLIMB:13},washBand:()=>[272,320],tileAt:()=>0,stormK:()=>1,seaCalm:()=>0,number:noop,SFX:new Proxy({},{get:()=>noop}),shakeCam:noop,rumble:noop,hitstop:noop,damagePlayer(x,d,o){count++;assert(!o.unblockable);assert(x<P.x);return result;}});
 vm.runInContext(source('updateWash','strikeReset').split('let stormLit')[0],c);c.updateWash(.01);if(dodge){assert.equal(count,0);}else{assert.equal(count,1);if(result==='blocked')assert.equal(P.vy,0);else assert(P.vy<0);}
}
const expr=s.match(/P\.breath = \(P\.breath \?\? breathMax\) - dt \* ([^;]+);/)[1];
for(const capped of [true,false]){const rate=id=>vm.runInNewContext(expr,{swimP:{capped},curId:()=>id});assert.equal(rate('deep'),rate('reef')/2);}
const toll=source('updateTollmaster','tollWeight');assert(!toll.includes('sq.rising'));assert(toll.includes("case 'blackoutTell'"));
console.log('Sea: permanent tentacles across all phases, block/dodge wave responses, half Deep breath drain, no Tollmaster flooding.');
