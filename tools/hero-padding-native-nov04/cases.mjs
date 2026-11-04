// CLOUD ONLY serialized full native graph comparisons.
export async function runHeroPaddingCase(manifest,config){
 const urls=[],check=(v,m)=>{if(!v)throw Error(m);},assert=check,HP=HTMLCanvasElement.prototype,CP=CanvasRenderingContext2D.prototype;
 const apply=Reflect.apply,own=Object.getOwnPropertyDescriptor,define=Object.defineProperty;
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 const eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m);
 const width=own(HP,'width').get,contextCanvas=own(CP,'canvas').get,originalDraw=own(CP,'drawImage');
 const sources=side=>Object.fromEntries(manifest[side].map(f=>[f.file,new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)))]));
 const blob=s=>{const u=URL.createObjectURL(new Blob([s],{type:'text/javascript'}));urls.push(u);return u;};
 const rewrite=(s,px,helper,root)=>s.replace(/(from\s*['"])(\.\.?\/[^'"]+)(['"])/g,(_,a,p,z)=>a+(p==='./px.js'&&px?px:p==='./hero-padding-scratch.js'&&helper?helper:p==='./hero-padding-root.js'&&root?root:new URL(p,location.origin+'/src/').href)+z);
 function canvases(root){const set=new Set(),seen=new WeakSet();function walk(x){if(!x||typeof x!=='object'||seen.has(x))return;seen.add(x);if(x instanceof HTMLCanvasElement){set.add(x);for(const k of Object.keys(x))walk(x[k]);return;}for(const k of Object.keys(x))walk(x[k]);}walk(root);return set;}
 function release(root){for(const c of canvases(root)){c.width=0;c.height=0;}}
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 const sides=sources('baseline'),next=sources('candidate');
 const cpuExpression="const CPU_BAKE = typeof location === 'undefined' || !/[?&]gpucv=1/.test(location.search);";
 if(config.gpu){check(sides['src/px.js'].includes(cpuExpression)&&next['src/px.js'].includes(cpuExpression),'Original CPU expression');sides['src/px.js']=sides['src/px.js'].replace(cpuExpression,'const CPU_BAKE = false;');next['src/px.js']=next['src/px.js'].replace(cpuExpression,'const CPU_BAKE = false;');}
 let phase=false,side=0,trace=[[],[]],captured=[[],[]],inner=[[],[]],cleanup=null,rootUrl,helperUrl,a,b,ownedA,ownedB;
 const capture=x=>{if(!phase||!x||typeof x!=='object')return;try{apply(width,x,[]);captured[side].push(x);}catch{}};
 const note=label=>{if(phase)trace[side].push(label);};
 function hook(name){
  if(!name)return()=>{};let p,k,getter=false,restore,extra;
  if(name==='createElement'){p=Document.prototype;k=name;}
  else if(name==='arrayMap'){p=Array.prototype;k='map';}
  else if(name==='mapGet'){p=Map.prototype;k='get';}
  else if(name==='typedFill'){p=Object.getPrototypeOf(Uint8Array.prototype);k='fill';}
  else if(name==='arrayNext'){p=Object.getPrototypeOf([][Symbol.iterator]());k='next';}
  else if(name==='stringNext'){p=Object.getPrototypeOf(''[Symbol.iterator]());k='next';}
  else if(name==='imageData'){p=ImageData.prototype;k='data';getter=true;}
  else if(name==='reflectOwn'){p=Reflect;k='getOwnPropertyDescriptor';}
  else if(name==='functionText'){p=Function.prototype;k='toString';}
  else if(name==='metadata'){p=HP;k='wp';const before=own(p,k);check(!before,'No original wp prototype descriptor');define(p,k,{configurable:true,set(value){note(name);capture(this);define(this,k,{value,writable:true,enumerable:true,configurable:true});}});return()=>delete p[k];}
  else if(name==='bareSetter'){p=Object.prototype;k='bare';const before=own(p,k);check(!before,'No original bare prototype descriptor');define(p,k,{configurable:true,set(value){note(name);capture(this);define(this,k,{value,writable:true,enumerable:true,configurable:true});}});return()=>delete p[k];}
  else if(name==='wrongMapEach'){p=Map.prototype;k='forEach';const d=own(p,k);define(p,k,{...d,value:Set.prototype.forEach});return()=>define(p,k,d);}
  else if(name==='wrongWeakGet'){p=WeakMap.prototype;k='get';const d=own(p,k);define(p,k,{...d,value:Map.prototype.get});return()=>define(p,k,d);}
  else if(name==='boundPut'){p=CP;k='putImageData';const d=own(p,k),c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d');define(p,k,{...d,value:d.value.bind(g)});return()=>{define(p,k,d);c.width=c.height=0;};}
  else{p=CP;k=name==='proxyContext'?'getContext':name;if(name==='proxyContext'){p=HP;k='getContext';}}
  const d=own(p,k);check(d,'Native hook descriptor '+name);
  if(getter){define(p,k,{...d,get:function(){note(name);return apply(d.get,this,[]);}});}
  else{const wrapped=function(...args){note(name);capture(this);try{capture(apply(contextCanvas,this,[]));}catch{}if(args.length)capture(args[0]);const result=apply(d.value,this,args);capture(result);return result;};define(p,k,{...d,value:name==='proxyContext'?new Proxy(d.value,{apply(target,receiver,args){return apply(wrapped,receiver,args);}}):wrapped});}
  return()=>define(p,k,d);
 }
 function input(mod){
  const skin=config.changed?{s:'#c0e0ff',S:'#405080',b:'#204080',B:'#102040',r:'#ff3050'}:{};
  let weapon=null,installed=false;
  if(config.contract==='coerce'||config.contract==='transient')skin.s={toString(){note('color-coercion');if(config.contract==='transient'&&!installed){installed=true;
   const d=own(CP,'drawImage');define(CP,'drawImage',{...d,value:function(...args){capture(this);try{capture(apply(contextCanvas,this,[]));}catch{}capture(args[0]);define(CP,'drawImage',d);return apply(d.value,this,args);}});
  }return '#c9d1dc';}};
  if(config.contract==='weapon')weapon={get s(){note('weapon-s');return '#fff080';},get S(){note('weapon-S');return '#705020';}};
  if(config.contract==='reentrant')define(skin,'s',{enumerable:true,get(){note('skin-getter');inner[side].push(mod.bakeKnight({},true,'icon'));return '#c9d1dc';}});
  return{skin,weapon};
 }
 function build(mod,px){const c=input(mod);if(config.scope)px.bakeScope();let value,error;try{phase=true;value=mod.withGear(config.tier||0,()=>mod.withWeapon(c.weapon,()=>mod.bakeKnight(c.skin,!!config.bare,config.preview||false)));}catch(e){error={name:e.name,message:e.message};}finally{phase=false;}const owned=config.scope?px.bakeScopeEnd():null;return{value,error,owned};}
 const random=Math.random;let rng=0;
 try{
  // Use the same reference Px module for scope ownership and reference chars.
  const refPxUrl=blob(rewrite(sides['src/px.js'])),refPx=await import(refPxUrl),refChars=await import(blob(rewrite(sides['src/chars.js'],refPxUrl)));
  if(config.stage==='before-root')cleanup=hook(config.hook);
  rootUrl=blob(next['src/hero-padding-root.js']);const root=await import(rootUrl);
  if(config.stage==='before-helper'){cleanup=hook(config.hook);}
  helperUrl=blob(rewrite(next['src/hero-padding-scratch.js'],null,null,rootUrl));const H=await import(helperUrl);
  const nextPxUrl=blob(rewrite(next['src/px.js'],null,helperUrl)),nextPx=await import(nextPxUrl),candidate=await import(blob(rewrite(next['src/chars.js'],nextPxUrl,helperUrl)));
  if(config.stage==='after-helper')cleanup=hook(config.hook);
  Math.random=(...args)=>{rng++;return apply(random,Math,args);};
  trace=[[],[]];captured=[[],[]];side=0;const aa=build(refChars,refPx);a=aa.value;ownedA=aa.owned;
  side=1;const bb=build(candidate,nextPx);b=bb.value;ownedB=bb.owned;
  if(cleanup){cleanup();cleanup=null;}
  // A transient one-call hook must also be restored when no draw followed it.
  if(config.contract==='transient')check(CP.drawImage===originalDraw.value,'Native draw method descriptor restored');
  eq(aa.error,bb.error,'Original exceptions '+config.name);check(!aa.error,'Expected successful native construction '+config.name);
  eq(trace[0],trace[1],'Original callback count/order '+config.name);
  const before=await snap({kit:a,owned:ownedA,captured:captured[0],inner:inner[0]}),after=await snap({kit:b,owned:ownedB,captured:captured[1],inner:inner[1]});eq(before,after,'Full pixels/path/context/metadata/alias graph '+config.name);
  if(a?.R?.idle?.[0]&&b?.R?.idle?.[0]){for(const kit of [a,b]){const g=kit.R.idle[0].getContext('2d');g.fillStyle='#123456';g.fillRect(2,3,1,1);}eq(await snap(a),await snap(b),'Later output mutation '+config.name);}
  const stats=H.readHeroScratchStats();
  if(config.expectRetirement){check(stats.rootSupported&&stats.usable,'Native root available');check(stats.retired>0&&stats.retired===stats.zeroSizeReadbacks,'Actually retired only qualified inputs '+config.name);}
  else check(stats.retired===0,'Original ownership/foreign/GPU fallback '+config.name);
  check(rng===0,'No global RNG');check(Object.isFrozen(root.heroPaddingRoot)&&(!root.heroPaddingRoot.width||Object.isFrozen(root.heroPaddingRoot.width)),'Immutable native epoch descriptors');
  return{label:config.name,exact:true,snapshot:before,stats,callbackCalls:trace[0].length,capturedCanvases:captured[0].length,ownedCanvases:ownedA?.length||0,rng};
 }finally{
  phase=false;if(cleanup)cleanup();if(config.contract==='transient')define(CP,'drawImage',originalDraw);Math.random=random;release([a,b,ownedA,ownedB,captured,inner]);for(const u of urls)URL.revokeObjectURL(u);
  check(typeof window.__brackenLabCollect==='function','Original native collection bridge');await window.__brackenLabCollect();
 }
}
