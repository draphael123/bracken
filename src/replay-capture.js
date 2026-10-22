// Explicit, local-only input sessions. No storage writes, network, timer, or RNG change while off.
import {replayAudioRandom} from './replay-random.js';
export const REPLAY_VERSION = 1;
const copy = a => JSON.parse(JSON.stringify(a));
export function dice(seed) { let s=seed>>>0; return {next:()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296),state:()=>s}; }
export function fingerprint(value) {
 const seen=new WeakSet();
 const clean=v=>{
  if(v===null||typeof v!=='object')return typeof v==='function'?undefined:v;
  if(seen.has(v))return '[reference]';seen.add(v);
  if(typeof v.getContext==='function')return '[canvas]';
  if(v instanceof Set)return [...v].map(clean);
  if(v instanceof Map)return [...v].map(clean);
  if(Array.isArray(v)||ArrayBuffer.isView(v))return Array.from(v,clean);
  return Object.fromEntries(Object.keys(v).sort().filter(k=>!['set','spr','art','img','sprite','keys','press','source'].includes(k)).map(k=>[k,clean(v[k])]));
 };
 const text=JSON.stringify(clean(value));let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return(h>>>0).toString(16).padStart(8,'0');
}
export function createReplayCapture(BK, io) {
 let data=null,replaying=false,index=0,rng=null,drawing=false,running=false,paused=false,lastError=null;
 const controller={options:{hud:true,debug:false,namecards:true},
  get active(){return !!data;},get frame(){return index;},get error(){return lastError;},
  async record({level=BK.L.id,hero=BK.P.hero,seed=1919,...options}={}){
   return begin({kind:'bracken-input-replay',version:REPLAY_VERSION,rate:60,level,hero,seed:seed>>>0,
    progress:copy(BK.PROG),settings:copy(BK.SET),view:[BK.view.VW,BK.view.VH],frames:[]},false,options);
  },
  async replay(file,options={}){
   if(file.kind!=='bracken-input-replay'||file.version!==REPLAY_VERSION||file.rate!==60||!Array.isArray(file.frames))throw Error('Unsupported replay');
   return begin(copy(file),true,options);
  },
  pause(){paused=true;},resume(){if(lastError)throw Error(lastError);paused=false;},
  export(){if(!data)throw Error('No input session');return copy(data);},
  download(){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([JSON.stringify(this.export())],{type:'application/json'}));a.href=u;a.download='bracken-'+data.level+'-'+data.seed+'.replay.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);},
  draw(fn){if(drawing)return fn();},
  run(fn){
   if(!data||paused)return;
   if(replaying&&index>=data.frames.length){paused=true;return;}
   const input=replaying?data.frames[index].input:io.input();if(replaying)io.apply(input);
   const real=Math.random;running=true;Math.random=rng.next;
   try{fn();}finally{Math.random=real;running=false;}
   drawing=true;const visual=dice((data.seed^Math.imul(index+1,2654435761))>>>0);Math.random=visual.next;
   try{io.render();}finally{Math.random=real;drawing=false;}
   const hash=fingerprint({rng:rng.state(),state:io.snapshot()});
   if(replaying){if(data.frames[index].hash!==hash){lastError='Replay diverged at frame '+index+': '+hash+' != '+data.frames[index].hash;paused=true;throw Error(lastError);}}
   else data.frames.push({input:copy(input),hash});
   index++;
  },
  async png(scale=2){
   if(![2,3].includes(scale))throw Error('Capture scale must be integer 2 or 3');
   const src=BK.view.buf,c=document.createElement('canvas');c.width=src.width*scale;c.height=src.height*scale;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,0,0,c.width,c.height);return c.toDataURL('image/png');
  }
 };
 async function begin(file,play,options){
  if(data)throw Error('Start a new session in a fresh page so cached art and transient state cannot cross sessions');
  if(!Number.isInteger(file.seed)||!file.level||!file.hero)throw Error('Replay needs level, hero and seed');
  const {LEVELS}=await import('./level.js');const i=LEVELS.findIndex(l=>l.id===file.level);if(i<0)throw Error('Unknown replay level '+file.level);
  data=file;replaying=play;index=0;paused=false;lastError=null;Object.assign(controller.options,options);rng=dice(file.seed);
  io.activate(controller);replayAudioRandom(dice(file.seed^0xa0d10).next);
  // Preserve the live save on disk; this isolated session may change only its in-memory copy.
  for(const k of Object.keys(BK.PROG))delete BK.PROG[k];Object.assign(BK.PROG,copy(file.progress));Object.assign(BK.SET,copy(file.settings));
  if(controller.options.debug===false){BK.SET.fps=false;BK.SET.boxes='off';BK.sheet=false;}
  const real=Math.random;Math.random=rng.next;
  try{BK.setHero(file.hero);BK.reset({fresh:true});BK.load(i);BK.start();BK.state='play';rng=dice(file.seed);Math.random=rng.next;BK.respawnEnemies();rng=dice(file.seed);}
  finally{Math.random=real;}
  for(const k of Object.keys(BK.keys))BK.keys[k]=false;
  if(BK.view.VW!==file.view[0]||BK.view.VH!==file.view[1])throw Error('Replay viewport differs: use '+file.view.join('x')+' logical pixels');
  return {level:file.level,hero:file.hero,seed:file.seed,frames:file.frames.length,rate:60};
 }
 return controller;
}
