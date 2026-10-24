// A retained scenery canvas can own another canvas: both must survive later level loads.
import {openPage} from './cdp.mjs';
import {pauseGameAtBoot} from './manual-lab-boot.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const out=process.env.CANVAS_ATTACHMENT_OUT||'gate-data/canvas-attachments';
fs.mkdirSync(out,{recursive:true});process.env.BRACKEN_PROCESS_LOG=out+'/processes.jsonl';
const pg=await openPage({audio:false,fonts:false,seed:1919});
try {
 await pg.send('Page.addScriptToEvaluateOnNewDocument',{source:'('+pauseGameAtBoot.toString()+')();window.__made=[];const create=Document.prototype.createElement;Document.prototype.createElement=function(t,...a){const c=create.call(this,t,...a);if(t==="canvas")window.__made?.push(c);return c;};'});
 await pg.reload();
 const rows=await pg.evalp(`(async()=>{
  const {LEVELS}=await import('/src/level.js');
  const raft=__made.find(c=>c.rig instanceof HTMLCanvasElement);if(!raft)throw Error('No attached raft rig captured');
  const rig=raft.rig;window.__made=null;
  const snapshot=async()=>({w:rig.width,h:rig.height,hash:rig.width&&rig.height?[...new Uint8Array(await crypto.subtle.digest('SHA-256',rig.getContext('2d').getImageData(0,0,rig.width,rig.height).data))].map(x=>x.toString(16).padStart(2,'0')).join(''):null});
  const rows=[{level:'boot',...await snapshot()}];
  for(const id of ['wood','flotilla','longwater','wood','flotilla','longwater']){
   const index=LEVELS.findIndex(l=>l.id===id);if(index<0)throw Error('Missing level '+id);
   BK.load(index);BK.state='play';BK.step(0);rows.push({level:id,...await snapshot()});
  }return rows;
 })()`,180000);
 const receipt={time:new Date().toISOString(),source:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),mainSha256:createHash('sha256').update(fs.readFileSync('src/main.js')).digest('hex'),rows,errors:pg.errors,complete:true,pass:rows.every(r=>r.w>0&&r.h>0&&r.hash===rows[0].hash)&&pg.errors.length===0};
 fs.writeFileSync(out+'/receipt.json',JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify(receipt));assert(receipt.pass,'attached rig must retain its exact dimensions and pixels after every load');
} finally {await pg.close();}
