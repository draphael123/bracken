// Serialized into the cloud native browser only.
export async function runSkyroadPrivateTableContracts(manifest){
 const rows=[],urls=[],check=(v,m)=>{if(!v)throw Error(m);};
 async function unit(files){const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();async function resolve(file){if(cache.has(file))return cache.get(file);let s=sources.get(file);check(typeof s==='string','Dependency '+file);if(file==='src/redraw/skyroad_tiles.js')s+='\nexport const __massTile=massTile;\n';for(const m of [...s.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const u=await resolve(new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1));s=s.replace(m[0],()=> 'from '+JSON.stringify(u));}const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;}return async file=>import(await resolve(file));}
 function exact(a,b,label){check(a.width===b.width&&a.height===b.height,label+' dimensions');const ga=a.getContext('2d'),gb=b.getContext('2d'),x=ga.getImageData(0,0,a.width,a.height).data,y=gb.getImageData(0,0,b.width,b.height).data;check(x.length===y.length&&x.every((v,i)=>v===y[i]),label+' pixels');for(const k of ['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','lineWidth','font'])check(Object.is(ga[k],gb[k]),label+' '+k);check(JSON.stringify(Reflect.ownKeys(a))===JSON.stringify(Reflect.ownKeys(b)),label+' metadata');}
 const random=Math.random;let rng=0;Math.random=()=>{rng++;throw Error('Unexpected global RNG');};
 try{
  {
   const U=await unit(manifest.candidate),m=await U('src/redraw/skyroad_tiles.js'),P=m.__skyroadPrivateProbe;
   const values=[undefined,null,false,true,0,-0,NaN,Infinity,1,'x',Symbol('v'),{},()=>1],descriptors=[undefined];
   for(const value of values)for(const writable of [false,true])for(const enumerable of [false,true])for(const configurable of [false,true]){const t={};Object.defineProperty(t,'p',{__proto__:null,value,writable,enumerable,configurable});descriptors.push(Object.getOwnPropertyDescriptor(t,'p'));}
   for(const get of [undefined,()=>1])for(const set of [undefined,()=>{}])for(const enumerable of [false,true])for(const configurable of [false,true]){const t={};Object.defineProperty(t,'p',{__proto__:null,get,set,enumerable,configurable});descriptors.push(Object.getOwnPropertyDescriptor(t,'p'));}
   let comparisons=0;for(const a of descriptors)for(const b of descriptors){check(P.sameNativeDescriptor(a,b)===P.same(a,b),'Native descriptor equivalence');comparisons++;}rows.push({label:'complete-native-record-equivalence',exact:true,comparisons});
   const data=Object.getOwnPropertyDescriptor({p:NaN},'p'),access=Object.getOwnPropertyDescriptor({get p(){return 1;}},'p'),saved=new Map();let foreignReads=0;
   for(const key of ['value','writable','get','set'])saved.set(key,Object.getOwnPropertyDescriptor(Object.prototype,key));
   try{for(const key of saved.keys())Object.defineProperty(Object.prototype,key,{__proto__:null,configurable:true,get(){foreignReads++;throw Error('Inherited descriptor field');}});check(P.sameNativeDescriptor(data,data)&&P.sameNativeDescriptor(access,access)&&!P.sameNativeDescriptor(data,access),'Native own record comparison');}finally{for(const[key,d]of saved)if(d)Object.defineProperty(Object.prototype,key,d);else Reflect.deleteProperty(Object.prototype,key);}
   check(foreignReads===0,'Native records never read inherited descriptor fields');rows.push({label:'inherited-descriptor-field-poison',exact:true,foreignReads});
  }
  for(const phase of ['initial','late'])for(const kind of ['foreign','bound','proxy']){
   const A=await unit(manifest.baseline),a=await A('src/redraw/skyroad_tiles.js'),saved=Object.getOwnPropertyDescriptor(Object,'hasOwn'),d=saved.value;let hits=0,B,b;
   const replacement=kind==='foreign'?function(...args){hits++;return Reflect.apply(d,this,args);}:kind==='bound'?d.bind(Object):new Proxy(d,{apply(t,r,args){hits++;return Reflect.apply(t,r,args);}});
   if(phase==='late'){B=await unit(manifest.candidate);b=await B('src/redraw/skyroad_tiles.js');}
   let x,y,stats;try{Object.defineProperty(Object,'hasOwn',{...saved,value:replacement});if(!B){B=await unit(manifest.candidate);b=await B('src/redraw/skyroad_tiles.js');}x=a.__massTile(0,5,15,6);y=b.__massTile(0,5,15,6);stats=(await B('src/skyroad-opaque-rows.js')).readOpaqueRowStats();}finally{Object.defineProperty(Object,'hasOwn',saved);}
   exact(x,y,'hasOwn '+phase+'/'+kind);check(stats.optimized===0&&stats.fallback===1,'Changed hasOwn original fallback');check(hits===0,'No foreign hasOwn invocation');rows.push({label:'hasOwn:'+phase+':'+kind,exact:true,foreignReads:hits});
  }
  {
   const U=await unit(manifest.production),h=await U('src/skyroad-opaque-rows.js'),m=await U('src/redraw/skyroad_tiles.js');check(JSON.stringify(Object.keys(h))===JSON.stringify(['readOpaqueRowStats']),'Production helper only exports copied statistics');for(const key of ['SKYROAD_PRIVATE','makeOpaqueRows','makeOpaqueMemoOwner','watchOpaquePalette','__skyroadPrivateProbe'])check(!(key in m)&&!(key in h),'Private capability does not escape '+key);const initial=h.readOpaqueRowStats(),snapshot=h.readOpaqueRowStats();snapshot.optimized=9876;check(h.readOpaqueRowStats().optimized===initial.optimized,'Readback cannot mutate painter');rows.push({label:'production-private-painter-and-permit',exact:true});
   const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d',{willReadFrequently:true});g.beginPath();g.rect(0,0,8,16);g.clip();check(!('makeOpaqueRows' in h),'Caller supplied clipped native context has no productive admission API');rows.push({label:'clipped-native-context-cannot-enter-private-painter',exact:true});
  }
  {
   const A=await unit(manifest.baseline),B=await unit(manifest.candidate),a=await A('src/redraw/skyroad_tiles.js'),b=await B('src/redraw/skyroad_tiles.js'),ca=await A('src/level-tile-cache.js'),cb=await B('src/level-tile-cache.js');
   const x=a.__massTile(0,5,15,6),y=b.__massTile(0,5,15,6);exact(x,y,'first successful recipe');x.getContext('2d').fillRect(0,0,1,1);y.getContext('2d').fillRect(0,0,1,1);check(a.__massTile(0,13,15,6)===x&&b.__massTile(0,13,15,6)===y,'Public cache aliases retained');exact(x,y,'public mutation retained');ca.resetLevelTileCaches();cb.resetLevelTileCaches();const xx=a.__massTile(0,13,15,6),yy=b.__massTile(0,13,15,6);check(xx!==x&&yy!==y,'Original reset creates new canvas');exact(xx,yy,'reset keeps first-successful recipe');rows.push({label:'first-success-alias-mutation-and-reset',exact:true});
  }
  for(const mode of ['primitive','restoring-map','throw']){
   const outputs=[],errors=[],traces=[[],[]];let candidateStats;
   for(const[side,files]of [manifest.baseline,manifest.candidate].entries()){
    const U=await unit(files),m=await U('src/redraw/skyroad_tiles.js'),original=Object.getOwnPropertyDescriptor(Map.prototype,'get');
    const d={valueOf(){traces[side].push('coerce');if(mode==='throw')throw TypeError('d');if(mode==='restoring-map')Object.defineProperty(Map.prototype,'get',{...original,value:function(...args){Object.defineProperty(Map.prototype,'get',original);traces[side].push('map-observer');return Reflect.apply(original.value,this,args);}});return 6;}};
    try{outputs[side]=m.__massTile(0,5,15,d);}catch(e){errors[side]=e.name+':'+e.message;}finally{Object.defineProperty(Map.prototype,'get',original);}
    if(side)candidateStats=(await U('src/skyroad-opaque-rows.js')).readOpaqueRowStats();
   }
   check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Coercing d trace '+mode);check(errors[0]===errors[1],'Coercing d error '+mode);if(outputs[0])exact(outputs[0],outputs[1],'Coercing d '+mode);check(candidateStats.optimized===0,'Coercing d never admitted');rows.push({label:'coercing-depth:'+mode,exact:true,traceEvents:traces[0].length});
  }
  return {complete:true,rows,rng};
 }finally{Math.random=random;for(const u of urls)URL.revokeObjectURL(u);}
}
