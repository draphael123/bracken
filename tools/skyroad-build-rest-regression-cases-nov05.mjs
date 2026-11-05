// Native cloud regression for the bounded empty-rest source correction.
export async function runSkyroadBuildRestContracts(manifest){
 const urls=[],rows=[],check=(v,m)=>{if(!v)throw Error(m);};
 async function unit(files){const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();async function resolve(file){if(cache.has(file))return cache.get(file);let s=sources.get(file);check(s!==undefined,'Dependency '+file);if(file==='src/redraw/skyroad_tiles.js')s+='\nexport const __massTile=massTile;\n';for(const m of [...s.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const u=await resolve(new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1));s=s.replace(m[0],()=> 'from '+JSON.stringify(u));}const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;}return async file=>import(await resolve(file));}
 const random=Math.random;let rng=0;Math.random=()=>{rng++;throw Error('Unexpected global RNG');};
 try{
  for(const throwing of [false,true]){
   const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js'),saved=Object.getOwnPropertyDescriptor(Array.prototype,'0');let beforeReads=0,afterReads=0,errorBefore,errorAfter;
   try{Object.defineProperty(Array.prototype,'0',{__proto__:null,configurable:true,get(){beforeReads++;if(throwing)throw Error('Unexpected inherited argument read');return undefined;}});try{a.__massTile(0,5,15,6);}catch(e){errorBefore=e.name+':'+e.message;}}finally{if(saved)Object.defineProperty(Array.prototype,'0',saved);else Reflect.deleteProperty(Array.prototype,'0');}
   try{Object.defineProperty(Array.prototype,'0',{__proto__:null,configurable:true,get(){afterReads++;if(throwing)throw Error('Unexpected inherited argument read');return undefined;}});try{b.__massTile(0,5,15,6);}catch(e){errorAfter=e.name+':'+e.message;}}finally{if(saved)Object.defineProperty(Array.prototype,'0',saved);else Reflect.deleteProperty(Array.prototype,'0');}
   check(errorBefore!==undefined&&errorBefore===errorAfter,'Original unsupported prototype error parity');check(beforeReads===afterReads,'No additional inherited argument lookup');check((await B('src/skyroad-opaque-rows.js')).readOpaqueRowStats().optimized===0,'Unsupported prototype remains original fallback');rows.push({label:'empty-rest-inherited-zero:'+(throwing?'throw':'return'),exact:true,beforeReads,afterReads,errorBefore,errorAfter});
  }
  return{complete:true,rows,rng};
 }finally{Math.random=random;for(const u of urls)URL.revokeObjectURL(u);}
}
