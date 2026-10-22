// Fetch/decode only requested pools. URL identity owns the work even when manifest names alias it.
export function makeSfxLoader({manifest,load,hold=()=>false,lanes=8,onBuffer=()=>{}}){
 const urls=new Map(),pools=new Map(),ready=new Set(),queue=[];let active=0,timer=null;
 const stats={fetched:0,ready:0,failed:0,maxActive:0};
 function pump(){
  if(hold()){if(!timer)timer=setTimeout(()=>{timer=null;pump();},150);return;}
  while(active<lanes&&queue.length){const j=queue.shift();active++;stats.maxActive=Math.max(stats.maxActive,active);stats.fetched++;
   Promise.resolve().then(()=>load(j.url)).then(b=>{stats.ready++;j.resolve(b);},e=>{stats.failed++;urls.delete(j.url);j.reject(e);}).finally(()=>{active--;pump();});}
 }
 function url(u,priority){if(urls.has(u))return urls.get(u);let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});urls.set(u,promise);const j={url:u,resolve,reject};priority?queue.unshift(j):queue.push(j);pump();return promise;}
 async function request(names,{first=false,priority=false}={}){
  const man=await manifest;const jobs=[];
  for(const name of new Set(names)){const list=man[name];if(!list)throw Error('Unknown SFX pool '+name);const take=first?list.slice(0,1):list;
   jobs.push(...take.map((u,i)=>{const key=name+':'+i;if(!pools.has(key))pools.set(key,url(u,priority).then(b=>{onBuffer(name,i,b);ready.add(key);return true;}).catch(e=>{pools.delete(key);throw e;}));return pools.get(key);}));}
  await Promise.all(jobs);return names;
 }
 async function missing(names,{first=false}={}){const man=await manifest;return names.filter(n=>!(man[n]||[]).slice(0,first?1:undefined).every((_,i)=>ready.has(n+':'+i)));}
 return{request,stats,missing};
}
