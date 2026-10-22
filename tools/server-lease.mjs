// Pages in one tool share a server. Closing one page must not disconnect another page or an in-flight boot.
export function serverLeases(){
 const entries=new Map();
 const closeAll=()=>{for(const e of entries.values())e.child?.kill();entries.clear();};
 async function acquire(key,options){
  const{up,start,sleep=ms=>new Promise(r=>setTimeout(r,ms)),polls=40}=options;
  let e=entries.get(key);if(e?.stopping){await e.stopping;return acquire(key,options);}
  if(!e){e={refs:0,child:null,ready:null,stopping:null};entries.set(key,e);}e.refs++;
  const forget=()=>{if(entries.get(key)===e)entries.delete(key);};
  let released=false,result;const release=()=>{if(released)return result;released=true;if(--e.refs!==0)return;
   if(!e.child){forget();return;}
   e.stopping=new Promise((resolve,reject)=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);forget();resolve();};const timer=setTimeout(()=>{if(done)return;done=true;reject(new Error('owned dev server did not stop on '+key));},2000);
    e.child.once?.('exit',finish);e.child.kill();if(typeof e.child.once!=='function'||e.child.exitCode!=null||e.child.signalCode!=null)finish();});
   return result=e.stopping;
  };
  if(!e.ready)e.ready=(async()=>{if(!(await up())){e.child=start();for(let i=0;i<polls&&!(await up());i++)await sleep(250);}if(!(await up()))throw new Error('dev server did not come up on '+key);})();
  try{await e.ready;return release;}catch(err){await release();throw err;}
 }
 return{closeAll,acquire};
}
const shared=serverLeases();process.once('exit',shared.closeAll);export const acquireServer=(key,options)=>shared.acquire(key,options);
