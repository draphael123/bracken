// Deterministic offline PNG capture. One input tick and one render per output frame, exactly 60fps.
import{openPage}from'./cdp.mjs';import{readFileSync,writeFileSync,mkdirSync,existsSync}from'node:fs';import{resolve,join}from'node:path';import{createHash}from'node:crypto';import assert from'node:assert/strict';
const args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--')),opt=(n,d)=>args.find(a=>a.startsWith('--'+n+'='))?.slice(n.length+3)||d;
assert(file,'usage: node tools/capture.mjs replay.json --level=wood --out=frames [--scale=2] [--nohud] [--nonamecards] [--debug]');
const replay=JSON.parse(readFileSync(file)),level=opt('level',replay.level),out=resolve(opt('out','capture-frames')),scale=+opt('scale','2');
assert.equal(level,replay.level,'A replay cannot be moved to a different level');assert([2,3].includes(scale));
mkdirSync(out,{recursive:true});assert(!existsSync(join(out,'frame-000000.png')),'Output already contains frames; choose a fresh directory');
process.env.BRACKEN_PROCESS_LOG=join(out,'processes.jsonl');const pg=await openPage({audio:false,fonts:false,seed:1919});
const receipt={complete:false,level,rate:60,scale,expected:replay.frames.length,written:0,hashes:[],startedAt:new Date().toISOString()};
try{
 await pg.evalp('BK.manualSimulation=true');await pg.evalp('BK.replay.replay('+JSON.stringify(replay)+','+JSON.stringify({hud:!args.includes('--nohud'),namecards:!args.includes('--nonamecards'),debug:args.includes('--debug')})+')');
 for(let i=0;i<replay.frames.length;i++){
  const png=await pg.evalp('(async()=>{BK.sim(1);return BK.replay.png('+scale+');})()');const bytes=Buffer.from(png.split(',')[1],'base64');
  writeFileSync(join(out,'frame-'+String(i).padStart(6,'0')+'.png'),bytes);receipt.hashes.push(createHash('sha256').update(bytes).digest('hex'));receipt.written++;
  if(i%60===0)writeFileSync(join(out,'capture.json'),JSON.stringify(receipt,null,2)+'\n');
 }
 assert.deepEqual(pg.errors,[]);receipt.complete=true;receipt.finishedAt=new Date().toISOString();console.log(JSON.stringify({complete:true,frames:receipt.written,rate:60,scale,out}));
}finally{writeFileSync(join(out,'capture.json'),JSON.stringify(receipt,null,2)+'\n');await pg.close();}
