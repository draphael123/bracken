// CLOUD ONLY. Artifact transport, never imported by Game or invoked locally.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
function writeAll(fd, value) { const b=Buffer.from(value,'utf8'); let p=0; while(p<b.length) {const n=fs.writeSync(fd,b,p,b.length-p); assert(n>0);p+=n;} }
function compareAllBytes(left,right) {
 const sizes=[fs.statSync(left).size,fs.statSync(right).size],fds=[fs.openSync(left,'r'),fs.openSync(right,'r')],buffers=[Buffer.alloc(65536),Buffer.alloc(65536)];let position=0,firstDifference=null,positionsCompared=0;
 try {while(position<Math.max(...sizes)){const lengths=fds.map((fd,i)=>fs.readSync(fd,buffers[i],0,Math.min(buffers[i].length,Math.max(0,sizes[i]-position)),position)),n=Math.max(...lengths);assert(n>0);for(let i=0;i<n;i++){const a=i<lengths[0]?buffers[0][i]:null,b=i<lengths[1]?buffers[1][i]:null;if(a!==b&&firstDifference===null)firstDifference={byte:position+i,left:a,right:b};positionsCompared++;}position+=n;}}
 finally {for(const fd of fds)fs.closeSync(fd);}
 return {equal:firstDifference===null,byteLengths:sizes,positionsCompared,firstDifference};
}
export async function startTraceStore(directory) {
 assert(process.env.CI,'Cloud artifact transport only');const root=path.resolve(directory);assert(!fs.existsSync(root));fs.mkdirSync(root,{recursive:true});const sessions=new Map();let server;
 const save=s=>fs.writeFileSync(s.receipt,JSON.stringify({id:s.id,counts:s.sides.map(x=>x.count),bytes:s.sides.map(x=>x.bytes),batches:s.sides.map(x=>x.seq),closed:s.sides.map(x=>x.fd===null),comparison:s.comparison,complete:!!s.comparison,originalPixelsAndEventsNotSampled:true,GameQualification:false},null,2)+'\n');
 const finish=x=>{if(x.fd!==null){writeAll(x.fd,']');x.bytes++;fs.closeSync(x.fd);x.fd=null;}};
 server=http.createServer(async(req,res)=>{try{
   assert(req.method==='POST');const origin=req.headers.origin;assert(typeof origin==='string'&&/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin));res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json');const parts=new URL(req.url,'http://127.0.0.1').pathname.split('/').filter(Boolean),s=sessions.get(parts[0]);assert(s&&!s.comparison);const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;assert(bytes<=16*1024*1024,'Artifact batch exceeded bound; fail without truncation');chunks.push(chunk);}const message=JSON.parse(Buffer.concat(chunks).toString('utf8'));
   if(parts.length===3&&parts[2]==='append'){assert(parts[1]==='0'||parts[1]==='1');const x=s.sides[+parts[1]];assert(x.fd!==null);assert.equal(message.sequence,x.seq);assert(Array.isArray(message.records)&&message.records.length>0);assert.equal(message.events,message.records.length);for(const record of message.records){assert(typeof record==='string');assert.equal(JSON.stringify(JSON.parse(record)),record,'Every complete canonical JSON event preserved');const text=(x.count?',':'')+record;writeAll(x.fd,text);x.bytes+=Buffer.byteLength(text,'utf8');x.count++;}x.seq++;save(s);res.end(JSON.stringify({ok:true,count:x.count,sequence:x.seq}));return;}
   assert(parts.length===2&&parts[1]==='compare');assert.deepEqual(message.counts,s.sides.map(x=>x.count));for(const x of s.sides)finish(x);s.comparison={...compareAllBytes(s.sides[0].file,s.sides[1].file),eventCounts:s.sides.map(x=>x.count),files:s.sides.map(x=>path.basename(x.file))};if(s.comparison.eventCounts[0]!==s.comparison.eventCounts[1])s.comparison.equal=false;save(s);res.end(JSON.stringify(s.comparison));
  }catch(error){res.statusCode=500;res.end(JSON.stringify({error:error.stack}));}});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 return {createSession(){const id=randomUUID(),s={id,receipt:path.join(root,id+'-receipt.json'),comparison:null,sides:[0,1].map(i=>{const file=path.join(root,id+'-'+i+'.json'),fd=fs.openSync(file,'wx');writeAll(fd,'[');return{file,fd,count:0,bytes:1,seq:0};})};sessions.set(id,s);save(s);return{url:'http://127.0.0.1:'+server.address().port+'/'+id+'/',id};},readbacks(){return [...sessions.values()].map(s=>JSON.parse(fs.readFileSync(s.receipt)));},async close(){await new Promise(resolve=>server.close(resolve));for(const s of sessions.values()){for(const x of s.sides)finish(x);save(s);}}};
}
