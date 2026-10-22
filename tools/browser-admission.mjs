// Wait before allocating a browser, rather than repeatedly killing it after the reserve is exhausted.
import{freemem}from'node:os';
export async function admitBrowser({free=()=>Math.floor(freemem()/1048576),now=Date.now,sleep=ms=>new Promise(r=>setTimeout(r,ms)),timeout=120000,onWait=()=>{},reserve=+(process.env.BRACKEN_MIN_FREE_MB??512),renderer=+(process.env.BRACKEN_RENDERER_MB??2048)}={}){
 const required=Math.max(0,reserve)+Math.max(0,renderer)+384,start=now();let waited=false;
 for(;;){const available=free();if(available>=required)return{available,required,waited};if(!waited){waited=true;onWait({available,required,startedAt:start});}if(now()-start>=timeout){const e=new Error('BRACKEN_BROWSER_RESOURCE: '+available+' MB free; '+required+' MB required before starting the next browser; suite stopped with saved verdicts');e.resourceStop=true;throw e;}await sleep(Math.min(1000,timeout-(now()-start)));}
}
