// Sample live native allocation call stacks in the disposable audit renderer.
import { mkdirSync, writeFileSync } from 'node:fs';
export async function nativeAllocationProfile(pg) {
  mkdirSync('gate-data',{recursive:true});
  const rows=[];let latest=null,boundaries=0;
  const save=()=>writeFileSync('gate-data/native-allocation-profile.json',JSON.stringify({time:new Date().toISOString(),samplingInterval:16777216,rows,latest},null,2)+'\n');
  await pg.send('Memory.startSampling',{samplingInterval:16777216,suppressRandomness:false});
  process.on('exit',save);
  return {
    async sample(label) {
      // Symbolizing every small allocation overwhelms the diagnostic protocol. Sample fewer live stacks between unchanged complete fights.
      if (++boundaries % 8) return;
      const response=await pg.send('Memory.getSamplingProfile',{},60000), profile=(response.result||response).profile;
      const samples=profile.samples.slice().sort((a,b)=>(b.total||b.size)-(a.total||a.size));
      latest={label,modules:profile.modules,samples:samples.slice(0,200)};
      rows.push({label,time:new Date().toISOString(),samples:samples.length,total:samples.reduce((n,x)=>n+(x.total||x.size),0),largest:samples.slice(0,8)});
      save();console.log('NATIVE_ALLOCATION_ROW '+label+' '+samples.length+' live sampled sites');
    },
    async close(){try{await pg.send('Memory.stopSampling');}catch{}save();},
  };
}
