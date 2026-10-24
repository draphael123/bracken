import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('src/main.js','utf8');
const fn=src.slice(src.indexOf('function retireBakes()'),src.indexOf('function* bakeAllG0('));
assert(fn.startsWith('function retireBakes()'));
class Canvas {constructor(){this.width=96;this.height=30;}}
Object.defineProperty(Canvas.prototype,'nativeDOM',{enumerable:true,get(){throw Error('native DOM must not be traversed');}});
const hull=new Canvas(),rig=new Canvas(),lantern=new Canvas(),retired=new Canvas();
hull.rig=rig;rig.attachments=[{lantern}];lantern.owner=hull;
const context={HTMLCanvasElement:Canvas,BAKE_OLD:[hull,rig,lantern,retired],TILE:null,PROP:{hull},BG:null,
 LEDGE_SETS:{},REDRESS_GROUND:{},REDRESS_PROPS:{},CROWN:null,VILL:null,SHORE:null,REEF:null,FLOT:null,CITY:null,MONK:null,RAINART:null,TITLE_LAYERS:{},window:{},BAKE_PATH:new WeakMap()};
vm.runInNewContext(fn+';retireBakes();',context);
for(const c of [hull,rig,lantern]){assert.equal(c.width,96);assert.equal(c.height,30);}
assert.equal(retired.width,0);assert.equal(retired.height,0);assert.equal(context.BAKE_OLD.length,0);
console.log('PASS attached canvases, nested attachments and cycles survive; unused canvases retire; native DOM is not traversed');
