// Pages in one tool share a server. Closing one page must not disconnect another page or an in-flight boot.
export function serverLeases(){
 const entries=new Map();
 const closeAll=()=>{for(const e of entries.values())e.child?.kill();entries.clear();};
 return{closeAll,async acquire(key,{up,start,sleep=ms=>new Promise(r=>setTimeout(r,ms)),polls=40}){
  let e=entries.get(key);if(!e){e={refs:0,child:null,ready:null};entries.set(key,e);}e.refs++;
  let released=false;const release=()=>{if(released)return;released=true;if(--e.refs===0){if(entries.get(key)===e)entries.delete(key);e.child?.kill();}};
  if(!e.ready)e.ready=(async()=>{if(!(await up())){e.child=start();for(let i=0;i<polls&&!(await up());i++)await sleep(250);}if(!(await up()))throw new Error('dev server did not come up on '+key);})();
  try{await e.ready;return release;}catch(err){release();throw err;}
 }};
}
const shared=serverLeases();process.once('exit',shared.closeAll);export const acquireServer=(key,options)=>shared.acquire(key,options);
