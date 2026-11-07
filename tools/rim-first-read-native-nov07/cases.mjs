// CLOUD ONLY. Never evaluate/import this fixture locally.
export async function runRimFirstRead(manifest,config){
 const A=Reflect.apply,D=Reflect.getOwnPropertyDescriptor,F=Reflect.defineProperty,K=Reflect.ownKeys,CP=CanvasRenderingContext2D.prototype,HP=HTMLCanvasElement.prototype;
 const check=(v,m)=>{if(!v)throw Error(m);},eq=(a,b,m)=>check(JSON.stringify(a)===JSON.stringify(b),m),assert=check,urls=[];
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function snap(root){const seen=new Map();let canvasCount=0;async function walk(x){if(!x||typeof x!=='object')return x;if(seen.has(x))return{ref:seen.get(x)};const id=seen.size;seen.set(x,id);const ds=Object.getOwnPropertyDescriptors(x),shape=Reflect.ownKeys(ds).map(k=>({key:String(k),enum:ds[k].enumerable,config:ds[k].configurable,writable:ds[k].writable,get:ds[k].get?.name,set:ds[k].set?.name,scalar:!ds[k].enumerable&&typeof ds[k].value!=='object'?ds[k].value:undefined}));if(x instanceof HTMLCanvasElement){canvasCount++;const g=x.getContext('2d'),t=g.getTransform(),state={matrix:[t.a,t.b,t.c,t.d,t.e,t.f],alpha:g.globalAlpha,composite:g.globalCompositeOperation,fill:g.fillStyle,stroke:g.strokeStyle,width:g.lineWidth,lineCap:g.lineCap,lineJoin:g.lineJoin,miter:g.miterLimit,dash:g.getLineDash(),dashOffset:g.lineDashOffset,font:g.font,align:g.textAlign,baseline:g.textBaseline,smooth:g.imageSmoothingEnabled,filter:g.filter,shadow:[g.shadowColor,g.shadowBlur,g.shadowOffsetX,g.shadowOffsetY],attrs:g.getContextAttributes()},pixels=x.width&&x.height?await hash(g.getImageData(0,0,x.width,x.height).data):'zero-size';const meta={};for(const k of Object.keys(x).sort())meta[k]=await walk(x[k]);let path='zero-size';if(x.width&&x.height){g.save();g.fillStyle='#ff00ff';g.fill();g.restore();path=await hash(g.getImageData(0,0,x.width,x.height).data);}return{id,canvas:[x.width,x.height],pixels,path,state,meta,shape,brand:Object.prototype.toString.call(x),nativePrototype:Object.getPrototypeOf(x)===HP,nativeGetContext:x.getContext===HP.getContext};}const fields={};for(const k of Object.keys(x)){assert(!ds[k].get&&!ds[k].set,'no private accessor may be published: '+k);fields[k]=await walk(x[k]);}return{id,array:Array.isArray(x),nativePrototype:Object.getPrototypeOf(x)===(Array.isArray(x)?Array.prototype:Object.prototype),shape,fields};}return{digest:await hash(new TextEncoder().encode(JSON.stringify(await walk(root)))),canvasCount};}
 async function unit(list){const namespace='__rim_first_'+crypto.randomUUID().replaceAll('-','')+'/',imports={};for(const f of list){let text=new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64),c=>c.charCodeAt(0)));if(config.gpu&&f.file==='src/px.js'){const old="const CPU_BAKE = typeof location === 'undefined' || !/[?&]gpucv=1/.test(location.search);";check(text.includes(old),'Original GPU binding');text=text.replace(old,'const CPU_BAKE = false;');}for(const x of f.imports){check(list.some(y=>y.file===x.file),'Original dependency bundled '+x.file);text=text.slice(0,x.start)+JSON.stringify(namespace+x.file)+text.slice(x.end);}const u=URL.createObjectURL(new Blob([text],{type:'text/javascript'}));urls.push(u);imports[namespace+f.file]=u;}const script=document.createElement('script');script.type='importmap';script.textContent=JSON.stringify({imports});document.head.appendChild(script);return file=>import(namespace+file);}
 let recording=false,side=0,rng=0,restore=null;const traces=[[],[]],push=Array.prototype.push,oldRandom=Math.random,note=x=>{if(recording)A(push,traces[side],[x]);};
 function hook(name){
  let object,key,getter=false;
  if(name==='createElement'){object=Document.prototype;key='createElement';}
  else if(name==='getContext'){object=HP;key='getContext';}
  else if(['getImageData','putImageData','drawImage','getContextAttributes'].includes(name)){object=CP;key=name;}
  else if(name==='imageDataData'){object=ImageData.prototype;key='data';getter=true;}
  else if(name==='arrayIterator'){object=Array.prototype;key=Symbol.iterator;}
  else if(name==='arrayMap'){object=Array.prototype;key='map';}
  else if(name==='arrayPush'){object=Array.prototype;key='push';}
  else if(name==='objectDescriptor'){object=Object;key='getOwnPropertyDescriptor';}
  else if(name==='reflectDescriptor'){object=Reflect;key='getOwnPropertyDescriptor';}
  else if(name==='reflectKeys'){object=Reflect;key='ownKeys';}
  else if(name==='descriptor-get'||name==='descriptor-set'||name==='native-setter'||name==='dictionary-alpha'){
   object=Object.prototype;key=name==='native-setter'?'native':name==='dictionary-alpha'?'alpha':name.slice(11);const d=D(object,key);check(!d,'No initial poison');
   F(object,key,name==='native-setter'?{__proto__:null,configurable:true,set(v){note(['native-setter',typeof v]);}}:{__proto__:null,configurable:true,get(){note([name]);return undefined;}});return()=>Reflect.deleteProperty(object,key);
  }else throw Error('Unknown hook '+name);
  const d=D(object,key),fn=getter?d.get:d.value;F(object,key,getter?{...d,get:function(...args){note([name]);return A(fn,this,args);}}:{...d,value:function(...args){note([name]);return A(fn,this,args);}});return()=>F(object,key,d);
 }
 try{
  // Build import maps before an initial source hook, so fixture-loader work is
  // excluded from the original/candidate source observer trace on both sides.
  const before=await unit(manifest.baseline),after=await unit(manifest.candidate);
  Math.random=(...args)=>{rng++;return A(oldRandom,Math,args);};
  let goldenInput,candidateInput,golden,candidate,service,view,record,sourceStats,baselinePx,candidatePx;
  if(config.stage==='before-module'){recording=true;restore=hook(config.hook);}
  side=0;baselinePx=await before('src/px.js');const rimA=await before('src/contrast-rim.js'),factoryA=config.factory?await before(config.factory.module):null;
  goldenInput=config.factory?factoryA[config.factory.factory]():null;
  side=1;candidatePx=await after('src/px.js');const rimB=await after('src/contrast-rim.js'),H=await after('src/rim-first-read.js'),factoryB=config.factory?await after(config.factory.module):null;
  service=H.createRimFirstReadBoundary(true);
  const readyModules=[];if(config.factory)for(let i=0;i<config.factory.ready.length;i++){const x=config.factory.ready[i];A(push,readyModules,[[await after(x.file),x.export]]);}
  const ready=()=>{for(let i=0;i<readyModules.length;i++)if(!readyModules[i][0][readyModules[i][1]]())return false;return H.rimSourceRootsReady([]);};
  function fixture(px){
   const W=config.protocol==='alpha-lattice'?256:17,H0=config.protocol==='alpha-lattice'?256:19,[c,g]=px.canvas(W,H0),im=g.createImageData(W,H0);
   for(let y=0;y<H0;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4;im.data[i]=x;im.data[i+1]=(x*61+y*7)&255;im.data[i+2]=(x*37+y*61)&255;im.data[i+3]=config.protocol==='alpha-lattice'?y:([0,1,2,17,63,127,128,192,254,255][(x+y)%10]);}
   g.putImageData(im,0,0);g.beginPath();g.rect(1,2,3,4);g.save();g.fillStyle='#aabbcc';g.translate(1,2);
   return {R:[c,c],L:[c,c],white:{R:[c],L:[c]},ax:2,ay:4,w:W,h:H0,extra:{source:c}};
  }
  candidateInput=config.factory?service.markFactory(()=>factoryB[config.factory.factory](),ready):null;
  recording=false;if(restore){restore();restore=null;}
  if(config.stage==='before-module')eq(traces[0],traces[1],'Initial original source observer trace');
  if(!config.factory){goldenInput=fixture(baselinePx);candidateInput=service.markFactory(()=>fixture(candidatePx),()=>H.rimSourceRootsReady([]));}
  if(config.protocol==='retention'){
   function removeFrame(px,boundary){let pack=boundary?boundary.markFactory(()=>{const[c]=px.canvas(4,4);return {R:[c],L:[],white:{R:[],L:[]},ax:1,ay:1};},()=>H.rimSourceRootsReady([])):(()=>{const[c]=px.canvas(4,4);return {R:[c],L:[],white:{R:[],L:[]},ax:1,ay:1};})();const ref=new WeakRef(pack.R[0]);pack.R.length=0;return {pack,ref};}
   const x=removeFrame(baselinePx,null),y=removeFrame(candidatePx,service);
   for(let i=0;i<6;i++){await window.__brackenLabCollect();await new Promise(ok=>setTimeout(ok,0));}
   check(x.ref.deref()===undefined,'Original removed frame actually collected');check(y.ref.deref()===undefined,'Proof registry does not retain removed original frame');
   check(rng===0,'Zero original global RNG');return {name:config.name,exact:true,rng,retention:{baselineCollected:true,candidateCollected:true},stats:service.stats()};
  }
  if(config.protocol==='function-prototype-retention'){
   function replacePrototype(fn){const ref=new WeakRef(fn.prototype);fn.prototype={};return ref;}
   const x=replacePrototype(baselinePx.px),y=replacePrototype(candidatePx.px);
   for(let i=0;i<6;i++){await window.__brackenLabCollect();await new Promise(ok=>setTimeout(ok,0));}
   check(x.deref()===undefined,'Original replaced function prototype actually collected');check(y.deref()===undefined,'Proof registry does not retain replaced function prototype');
   check(rng===0,'Zero original global RNG');return{name:config.name,exact:true,rng,functionPrototypeRetention:{baselineCollected:true,candidateCollected:true},stats:service.stats()};
  }
  const schema=goldenInput&&Array.isArray(goldenInput.R)&&goldenInput.R[0]&&goldenInput.ax;
  if(!schema){const snapshot=await snap(goldenInput);eq(snapshot,await snap(candidateInput),'Original non-rim factory graph');check(rng===0,'Zero original RNG');return{name:config.name,exact:true,rng,snapshot,originalBodyLWouldSkip:true,stats:service.stats()};}
  if(config.protocol==='unknown-no-probe'){
   const unknown=new Proxy({}, {get(){throw Error('No unknown get');},getPrototypeOf(){throw Error('No unknown prototype');},ownKeys(){throw Error('No unknown keys');},getOwnPropertyDescriptor(){throw Error('No unknown descriptor');}});
   check(service.prepare(unknown,20,'#aebcd4',()=>{})===null,'Unknown identity declines without any structural trap');check(rng===0,'Zero original global RNG');return{name:config.name,exact:true,rng,unknownIdentityDeclinedWithoutProbe:true,stats:service.stats()};
  }
  const mutate=pack=>{const c=pack.R[0],g=c.getContext('2d');g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=.37;g.fillStyle='#e31a69';g.fillRect(0,0,c.width,c.height);g.restore();};
  if(config.protocol==='before-source-mutation'){mutate(goldenInput);mutate(candidateInput);}
  let rimInputA=goldenInput,rimInputB=candidateInput;const inputRestores=[];
  function inputPatch(pack,px){
   if(config.protocol==='unknown-proxy')return new Proxy(pack,{get(o,k,r){note(['pack.get',String(k)]);return Reflect.get(o,k,r);},ownKeys(o){note(['pack.keys']);return Reflect.ownKeys(o);},getOwnPropertyDescriptor(o,k){note(['pack.descriptor',String(k)]);return Reflect.getOwnPropertyDescriptor(o,k);}});
   if(config.protocol==='array-getter'){const d=D(pack.R,'0');F(pack.R,'0',{__proto__:null,enumerable:true,configurable:true,get(){note(['frame.get']);return d.value;}});inputRestores.push(()=>F(pack.R,'0',d));}
   if(config.protocol==='array-proxy'){const original=pack.R;pack.R=new Proxy(original,{get(o,k,r){note(['frames.get',String(k)]);return Reflect.get(o,k,r);},has(o,k){note(['frames.has',String(k)]);return Reflect.has(o,k);},getOwnPropertyDescriptor(){throw Error('No new frames descriptor probe');},getPrototypeOf(){throw Error('No new frames prototype probe');}});inputRestores.push(()=>{pack.R=original;});}
   if(config.protocol==='array-own-map'){const array=pack.R,fn=array.map;array.map=function(callback){note(['own-map',callback.name,callback.length]);return A(fn,this,[callback]);};inputRestores.push(()=>Reflect.deleteProperty(array,'map'));}
   if(config.protocol==='array-own-constructor'){const array=pack.R;F(array,'constructor',{__proto__:null,configurable:true,value:{get [Symbol.species](){note(['own-species']);return Array;}}});inputRestores.push(()=>Reflect.deleteProperty(array,'constructor'));}
   if(config.protocol==='canvas-own-width'){const c=pack.R[0],w=c.width;F(c,'width',{__proto__:null,configurable:true,get(){note(['source.width']);return w;}});inputRestores.push(()=>Reflect.deleteProperty(c,'width'));}
   if(config.protocol==='canvas-own-context'){const c=pack.R[0],fn=HP.getContext;F(c,'getContext',{__proto__:null,configurable:true,get(){note(['source.getContext']);return fn;}});inputRestores.push(()=>Reflect.deleteProperty(c,'getContext'));}
   if(config.protocol==='context-own-read'){const g=pack.R[0].getContext('2d'),fn=CP.getImageData;F(g,'getImageData',{__proto__:null,configurable:true,get(){note(['source.context.read']);return fn;}});inputRestores.push(()=>Reflect.deleteProperty(g,'getImageData'));}
   if(config.protocol==='canvas-prototype'){const c=pack.R[0],p=Object.getPrototypeOf(c);Object.setPrototypeOf(c,Object.create(p));inputRestores.push(()=>Object.setPrototypeOf(c,p));}
   return pack;
  }
  rimInputA=inputPatch(goldenInput,baselinePx);rimInputB=inputPatch(candidateInput,candidatePx);
  view=service.attach({sprite:candidateInput});
  if(config.stage==='after-module'){recording=true;restore=hook(config.hook);}
  if(config.protocol==='active-capture'){baselinePx.bakeScope();candidatePx.bakeScope();}
  side=0;recording=true;golden=rimA.rimSet(rimInputA,20,'#aebcd4');
  side=1;record=service.prepare(rimInputB,20,'#aebcd4',()=>{});candidate=record||rimB.rimSet(rimInputB,20,'#aebcd4');
  recording=false;if(restore){restore();restore=null;}
  if(config.stage==='after-module'||config.stage==='before-module')eq(traces[0],traces[1],'Original unsupported observer trace');
  eq(traces[0],traces[1],'Original source property/coercion/observer sequence');
  const fallback=config.gpu||config.stage==='before-module'||config.stage==='after-module'||['active-capture','unknown-proxy','array-getter','array-proxy','array-own-map','array-own-constructor','canvas-own-width','canvas-prototype'].includes(config.protocol);
  sourceStats=service.stats();check(fallback?!record:!!record,'Declared native/fallback activation');
  if(config.protocol==='active-capture'){const sa=baselinePx.bakeScopeEnd(),sb=candidatePx.bakeScopeEnd();eq(await snap(sa),await snap(sb),'Original active capture scope');}
  const base={sprite:golden};
  if(record){
   check(sourceStats.published===0&&sourceStats.pending===1,'No native rim pack published before first read');view.sprite=record;
   if(config.protocol?.startsWith('error-')){
    const cache={sprite:record},logs=[[],[]],marker=new Error('Original logger marker'),plainBase={sprite:goldenInput};
    const respond=(which,error)=>{logs[which].push({name:error.name,message:error.message});if(which)delete cache.sprite;const object=which?view:plainBase;if(config.protocol==='error-override')object.sprite=7;if(config.protocol==='error-delete')Reflect.deleteProperty(object,'sprite');if(config.protocol==='error-reentrant')check(object.sprite===(which?candidateInput:goldenInput),'Failure reentry sees original plain set');if(config.protocol==='error-logger-throw')throw marker;};
    let expectedThrow=null,actualThrow=null;
    try{const [,g]=baselinePx.canvas(1,1);try{A(D(CP,'putImageData').value,g,[{},0,0]);throw Error('Expected native ImageData conversion error');}catch(error){respond(0,error);}}catch(error){expectedThrow=error;}
    // Explicit fixture-only private fault injection, never a Game mutation and
    // never counted as a successful original factory/native replay graph.
    record.R.entries[0][1].img={};record.onError=error=>respond(1,error);
    let result;try{result=view.sprite;}catch(error){actualThrow=error;}
    check((expectedThrow===marker)===(actualThrow===marker),'Original logger marker identity propagates once');eq(logs[0],logs[1],'Original native error type/message/log callback');check(!Object.hasOwn(cache,'sprite'),'Failed per-level type is not cached');
    if(actualThrow){result=view.sprite;check(result===candidateInput,'Next observation receives original plain set without repeating logger failure');}
    check(record.R===null&&record.metadata===null&&record.images===null,'Only private snapshot references released before error callback');
    const snapshot=await snap({output:plainBase.sprite,input:goldenInput});eq(snapshot,await snap({output:result,input:candidateInput}),'Failure fallback/override/delete native and alias graph');
    const st=service.stats();check(st.publicationFailures===1&&st.pending===0&&st.capturedRgbaBytes===0,'One explicit failure and no logically retained pending snapshots');check(rng===0,'Zero original RNG');return{name:config.name,exact:true,rng,snapshot,simulatedPrivateFaultPolicy:true,logs:logs[0],loggerMarker:actualThrow===marker,stats:st};
   }
   if(config.protocol==='after-source-mutation'){mutate(goldenInput);mutate(candidateInput);}
   if(config.protocol==='restore-before-read'){view.sprite=candidateInput;check(service.stats().published===0,'Plain restore never builds unused old rim');view.sprite=record;}
   if(config.protocol==='delete-before-read'){check(Reflect.deleteProperty(view,'sprite'),'Delete pending field');check(service.stats().published===0,'Delete never builds pending');view.sprite=record;}
   if(config.protocol==='inherited-write'){const child=Object.create(view),plainChild=Object.create(base);child.sprite=7;plainChild.sprite=7;check(child.sprite===plainChild.sprite,'Inherited receiver value');check(!Object.hasOwn(view,'missing')&&service.stats().published===0,'Child write does not publish parent');}
   if(config.protocol==='self-prototype'){check(Reflect.setPrototypeOf(base,base)===false&&Reflect.setPrototypeOf(view,view)===false,'Original direct self-prototype refusal');check(service.stats().published===0,'Rejected self-prototype does not force private work');}
   if(config.protocol==='prevent'){Object.preventExtensions(base);Object.preventExtensions(view);check(!Reflect.isExtensible(base)&&!Reflect.isExtensible(view),'Original preventExtensions outcome');check(Reflect.set(base,'absent',7)===Reflect.set(view,'absent',7),'Original nonextensible new-key refusal');}
   if(config.protocol==='legacy-prototype'){const p={marker:17};base.__proto__=p;view.__proto__=p;check(Object.getPrototypeOf(base)===p&&Object.getPrototypeOf(view)===p,'Original legacy prototype setter');}
   if(config.protocol==='inherited-setter'){
    let left,right;Reflect.deleteProperty(base,'sprite');Reflect.deleteProperty(view,'sprite');Object.setPrototypeOf(base,{set sprite(value){left=value;}});Object.setPrototypeOf(view,{set sprite(value){right=value;}});base.sprite=golden;view.sprite=record;
    check(right!==record&&right&&Array.isArray(right.R),'Inherited setter receives complete original native pack, never private record');const snapshot=await snap({output:left,input:goldenInput});eq(snapshot,await snap({output:right,input:candidateInput}),'Inherited setter native graph');check(rng===0,'Zero original RNG');return{name:config.name,exact:true,rng,snapshot,completeNativeValueObservedByInheritedSetter:true,stats:service.stats()};
   }
   if(config.protocol==='seal'){Object.seal(base);Object.seal(view);check(Reflect.set(base,'sprite',golden)===Reflect.set(view,'sprite',candidateInput),'Original sealed data replacement outcome');view.sprite=record;}
   if(config.protocol==='freeze'){Object.freeze(base);Object.freeze(view);check(Reflect.set(base,'sprite',0)===Reflect.set(view,'sprite',0),'Original frozen write refusal');}
   if(config.protocol==='descriptor'){const da=Reflect.getOwnPropertyDescriptor(base,'sprite'),db=Reflect.getOwnPropertyDescriptor(view,'sprite');eq({e:da.enumerable,c:da.configurable,w:da.writable},{e:db.enumerable,c:db.configurable,w:db.writable},'Original data descriptor flags');}
   if(config.protocol==='active-publish'){baselinePx.bakeScope();candidatePx.bakeScope();}
   if(config.stage==='late-publish'){recording=true;restore=hook(config.hook);}
   side=0;const originalValue=base.sprite;side=1;candidate=view.sprite;
   recording=false;if(restore){restore();restore=null;}
   if(config.stage==='late-publish')eq(traces[0],traces[1],'Captured original native publication bypasses late foreign hooks');
   check(originalValue===golden,'Original cache identity');
   if(config.protocol==='active-publish'){eq(baselinePx.bakeScopeEnd().length,candidatePx.bakeScopeEnd().length,'Original load-time ownership during delayed read');}
   if(config.protocol==='seal')base.sprite=golden;
   if(!Object.isFrozen(view)){view.sprite=candidateInput;view.sprite=record;check(view.sprite===candidate,'Per-level native cache identity reused');}
  }
  for(let i=inputRestores.length-1;i>=0;i--)inputRestores[i]();
  const snapshot=await snap({output:golden,input:goldenInput});eq(snapshot,await snap({output:candidate,input:candidateInput}),'Complete original native pixels/context/path/metadata/alias graph');
  check(service.stats().publicationFailures===0,'No matching-error-only native graph qualification');check(rng===0,'Zero original global RNG');return{name:config.name,exact:true,rng,snapshot,stats:service.stats(),beforePublication:sourceStats,originalBodyLWouldSkip:false,actualDeferred:!!record,observerTrace:traces[0]};
 }finally{recording=false;if(restore)restore();Math.random=oldRandom;for(const u of urls)URL.revokeObjectURL(u);check(typeof window.__brackenLabCollect==='function','Original native GC bridge');await window.__brackenLabCollect();}
}
