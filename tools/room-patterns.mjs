import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const source=s.slice(s.indexOf('function drawRoom('),s.indexOf('const [reflC, reflG]'));
let calls=[];
const g=new Proxy({}, {set(o,k,v){o[k]=v;calls.push([k,v]);return true;},get(o,k){return o[k]??((...args)=>{calls.push([k,...args]);return {addColorStop(){}};});}});
const ctx=vm.createContext({g,L:{},MW:{},MON:{},TS:16,time:4});vm.runInContext(source,ctx);
for(const st of ['royal','chapel','forge','ship','guard','kitchen','earth','drowned']){
 const paint=(x,y)=>{calls=[];ctx.drawRoom(st,x,y,640,192,124,8);return calls;};
 const a=paint(0,0), b=paint(-117,-53);
 assert.deepEqual(a.filter(c=>c[0]!=='translate'),b.filter(c=>c[0]!=='translate'),st+' pattern moves with camera');
 assert(a.some(c=>c[0]==='clip'),st+' is clipped to its authored rectangle');
}
console.log('room patterns: eight interiors invariant under camera movement and clipped to room bounds.');

