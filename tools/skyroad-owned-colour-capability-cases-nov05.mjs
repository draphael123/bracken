// Cloud-native-only capability contracts, in addition to all preserved prior cases.
export async function runSkyroadBuildPermitContracts(manifest){
 const urls=[],rows=[],check=(v,m)=>{if(!v)throw Error(m);};
 async function unit(files){const sources=new Map(files.map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))])),cache=new Map();async function resolve(file){if(cache.has(file))return cache.get(file);let s=sources.get(file);check(s!==undefined,'Dependency '+file);if(file==='src/redraw/skyroad_tiles.js')s+='\nexport const __massTile=massTile;\n';for(const m of [...s.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]){const u=await resolve(new URL(m[2],'https://unit.invalid/'+file).pathname.slice(1));s=s.replace(m[0],()=> 'from '+JSON.stringify(u));}const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);cache.set(file,u);return u;}return async file=>import(await resolve(file));}
 function equal(a,b,label){check(a.width===b.width&&a.height===b.height,label+' dimensions');const x=a.getContext('2d'),y=b.getContext('2d'),p=x.getImageData(0,0,a.width,a.height).data,q=y.getImageData(0,0,b.width,b.height).data;check(p.length===q.length&&p.every((v,i)=>v===q[i]),label+' pixels');for(const k of ['fillStyle','strokeStyle','globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','lineWidth','font'])check(Object.is(x[k],y[k]),label+' '+k);}
 const old=Math.random;let rng=0;Math.random=()=>{rng++;throw Error('Unexpected global RNG');};
 try{
  const U=await unit(manifest.candidate),m=await U('src/redraw/skyroad_tiles.js'),P=m.__skyroadPrivateProbe;
  const fresh=()=>P.makeOpaqueMemoOwner();
  {
   const a=fresh(),p=a.beforeBuild();check(p&&typeof p==='object','Opaque private build capability');check(a.paintPermit(p)===p,'First permit');check(a.paintPermit(p)===false,'Permit cannot be born twice');check(a.consumePaintPermit(p)===true,'One painter consumption');check(a.consumePaintPermit(p)===false&&a.paintPermit(p)===false,'Stale capability declines');rows.push({label:'one-build-one-birth-one-consumption',exact:true});
  }
  {
   const a=fresh(),p=a.beforeBuild();check(a.consumePaintPermit(p)===false,'Cannot paint before allocation permit');check(a.paintPermit(p)===p&&a.consumePaintPermit(p)===true,'Original phase sequence retained');rows.push({label:'no-consumption-before-birth',exact:true});
  }
  {
   const a=fresh(),b=fresh(),p=a.beforeBuild();check(b.paintPermit(p)===false&&b.consumePaintPermit(p)===false,'Cross-owner capability declines');check(a.paintPermit(p)===p&&a.consumePaintPermit(p)===true,'Own capability remains valid');rows.push({label:'cross-owner-rejection',exact:true});
  }
  {
   let reads=0;const a=fresh(),proxy=new Proxy({},{get(){reads++;throw Error('get');},getPrototypeOf(){reads++;throw Error('prototype');},ownKeys(){reads++;throw Error('keys');}});for(const p of [undefined,null,false,true,0,'x',{},proxy])check(a.paintPermit(p)===false&&a.consumePaintPermit(p)===false,'Foreign/primitive permit rejection');check(reads===0,'Foreign permit never probed');rows.push({label:'foreign-missing-primitive-proxy-permits',exact:true,foreignReads:reads});
  }
  {
   let reads=0;const a=fresh(),p=a.beforeBuild();check(a.paintPermit(p)===p,'Foreign owner birth');const g=new Proxy({},{get(){reads++;throw Error('context get');},getPrototypeOf(){reads++;throw Error('context prototype');},ownKeys(){reads++;throw Error('context keys');}});check(P.makeOpaqueRows(g,0,0,0,2,false,p)===null,'Module owner does not accept another owner capability');check(P.makeOpaqueRows(g,0,0,0,2,false,true)===null,'Affirmative bool not a capability');check(reads===0,'Unadmitted caller context not probed');rows.push({label:'foreign-context-and-owner-cannot-forge-module-admission',exact:true,foreignReads:reads});
  }
  {
   const traces=[[],[]];for(const[side,files]of [manifest.baseline,manifest.candidate].entries()){
    const V=await unit(files),v=await V('src/redraw/skyroad_tiles.js'),d=Object.getOwnPropertyDescriptor(Map.prototype,'set');
    Object.defineProperty(Map.prototype,'set',{...d,value:function(...args){if(typeof args[1]==='function'){const f=args[1];let error;try{Reflect.construct(f,[]);}catch(e){error=e.name;}traces[side].push([f.name,f.length,Object.hasOwn(f,'prototype'),error]);}return Reflect.apply(d.value,this,args);}});
    try{v.__massTile(0,5,15,6);}finally{Object.defineProperty(Map.prototype,'set',d);}
   }
   check(traces[0].length>0&&JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Original observed recipe name/length/nonconstructibility');rows.push({label:'original-recipe-function-shape-under-map-observer',exact:true,recipes:traces[0].length});
  }
  {
   const traces=[[],[]],outputs=[[],[]];for(const[side,files]of [manifest.baseline,manifest.candidate].entries()){
    const V=await unit(files),v=await V('src/redraw/skyroad_tiles.js'),d=Object.getOwnPropertyDescriptor(Map.prototype,'set');let once=false;
    Object.defineProperty(Map.prototype,'set',{...d,value:function(...args){if(!once){once=true;Object.defineProperty(Map.prototype,'set',d);traces[side].push('reenter');outputs[side].push(v.__massTile(0,6,15,6));}return Reflect.apply(d.value,this,args);}});
    try{outputs[side].push(v.__massTile(0,5,15,6));}finally{Object.defineProperty(Map.prototype,'set',d);}
   }
   check(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'Restoring Map observer reentry trace');check(outputs[0].length===2&&outputs[1].length===2,'Both original outputs captured');for(let i=0;i<2;i++)equal(outputs[0][i],outputs[1][i],'Reentry '+i);rows.push({label:'restoring-map-observer-reentry-keeps-original-fallback',exact:true});
  }
  {
   const a=fresh(),p=a.beforeBuild(),q=a.beforeBuild();check(p!==q,'Independent recipe capabilities');check(a.paintPermit(q)===q&&a.consumePaintPermit(q)===true,'Second capability complete');check(a.paintPermit(p)===p&&a.consumePaintPermit(p)===true,'First capability unaffected');rows.push({label:'independent-capabilities-no-ambient-state',exact:true});
  }
  return{complete:true,rows,rng};
 }finally{Math.random=old;for(const u of urls)URL.revokeObjectURL(u);}
}
