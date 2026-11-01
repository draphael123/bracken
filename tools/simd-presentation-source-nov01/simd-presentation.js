// Fresh per-frame native readback and bounded SIMD expansion; no frame/source cache.
const CP=typeof CanvasRenderingContext2D==='function'?CanvasRenderingContext2D.prototype:null,HP=typeof HTMLCanvasElement==='function'?HTMLCanvasElement.prototype:null;
const descriptor=Object.getOwnPropertyDescriptor,prototype=Object.getPrototypeOf,apply=Reflect.apply,native=f=>typeof f==='function'&&/\[native code\]/.test(Function.prototype.toString.call(f));
const methodNames=['drawImage','getTransform','getContextAttributes','isContextLost','getImageData','putImageData'],propertyNames=['globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','shadowBlur','shadowOffsetX','shadowOffsetY','shadowColor'];
const methods=CP?Object.fromEntries(methodNames.map(k=>[k,descriptor(CP,k)?.value])):{},properties=CP?Object.fromEntries(propertyNames.map(k=>[k,descriptor(CP,k)])):{},canvasGet=CP&&descriptor(CP,'canvas')?.get,widthGet=HP&&descriptor(HP,'width')?.get,heightGet=HP&&descriptor(HP,'height')?.get,getContext=HP&&descriptor(HP,'getContext')?.value;
const ready=!!CP&&!!HP&&[descriptor,prototype,apply,canvasGet,widthGet,heightGet,getContext,...Object.values(methods),...Object.values(properties).flatMap(d=>[d?.get,d?.set])].every(native);
export function makeSimdPresentation(binaryOrUrl){
 let wasm=null,canvas=null,context=null,image=null,width=0,height=0,uses=0,failures=0,retired=0,releaseEpoch=0;
 const pending=(async()=>{try{const bytes=binaryOrUrl instanceof Uint8Array?binaryOrUrl:await(await fetch(binaryOrUrl)).arrayBuffer(),module=await WebAssembly.instantiate(bytes);wasm=module.instance.exports;return true;}catch{failures++;return false;}})();
 const dispose=()=>{if(canvas){canvas.width=canvas.height=0;retired++;}canvas=context=image=null;width=height=0;releaseEpoch++;};
 function draw(g,source,sourceContext,x,y,w,h){
  if(!ready||!wasm||typeof x!=='number'||typeof y!=='number'||typeof w!=='number'||typeof h!=='number'||!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||!Number.isSafeInteger(w)||!Number.isSafeInteger(h))return false;
  let sw,sh,destination,src;try{destination=apply(canvasGet,g,[]);sw=apply(widthGet,source,[]);sh=apply(heightGet,source,[]);}catch{return false;}
  if(prototype(g)!==CP||prototype(source)!==HP||source===destination||!sw||!sh||sw>1024||sh>1024||w!==sw*3||h!==sh*3||w*h>2600000)return false;
  for(const key of methodNames){const own=descriptor(g,key),current=descriptor(CP,key);if(own&&(!('value'in own)||own.value!==methods[key])||!current||current.value!==methods[key])return false;}
  for(const key of propertyNames){const d=descriptor(CP,key),o=properties[key];if(descriptor(g,key)||!d||d.get!==o.get||d.set!==o.set)return false;}
  const hp=descriptor(HP,'getContext');if(descriptor(source,'getContext')||descriptor(source,'width')||descriptor(source,'height')||!hp||hp.value!==getContext)return false;
  const get=k=>apply(properties[k].get,g,[]),m=apply(methods.getTransform,g,[]);if(m.a!==1||m.b!==0||m.c!==0||m.d!==1||!Number.isSafeInteger(m.e)||!Number.isSafeInteger(m.f)||get('globalAlpha')!==1||get('globalCompositeOperation')!=='source-over'||get('imageSmoothingEnabled')!==false||get('filter')!=='none'||get('shadowBlur')!==0||get('shadowOffsetX')!==0||get('shadowOffsetY')!==0||get('shadowColor')!=='rgba(0, 0, 0, 0)'||apply(methods.isContextLost,g,[]))return false;
  src=sourceContext;try{if(apply(canvasGet,src,[])!==source)return false;}catch{return false;}if(prototype(src)!==CP||methodNames.some(k=>descriptor(src,k)))return false;
  const sa=apply(methods.getContextAttributes,src,[]),da=apply(methods.getContextAttributes,g,[]);if(sa?.colorSpace!=='srgb'||da?.colorSpace!=='srgb'||sa?.colorType!=='unorm8'||da?.colorType!=='unorm8'||apply(methods.isContextLost,src,[]))return false;
  let sampled;try{sampled=apply(methods.getImageData,src,[0,0,sw,sh]);}catch{return false;}
  new Uint8Array(wasm.memory.buffer,0,sampled.data.length).set(sampled.data);if(wasm.scale3(sw,sh)!==1)return false;
  if(!canvas||width!==w||height!==h||canvas.width!==w||canvas.height!==h||apply(methods.isContextLost,context,[])){
   dispose();try{canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});if(!context||apply(methods.isContextLost,context,[])){dispose();return false;}image=new ImageData(new Uint8ClampedArray(wasm.memory.buffer,4194304,w*h*4),w,h);width=w;height=h;const owned=canvas;canvas.addEventListener('contextlost',()=>{if(canvas===owned)dispose();},{once:true});}catch{dispose();return false;}
  }
  apply(methods.putImageData,context,[image,0,0]);apply(methods.drawImage,g,[canvas,x,y]);uses++;return true;
 }
 return{draw,dispose,ready:()=>pending,root:()=>canvas,info:()=>({canvases:canvas?1:0,pixels:width*height,imagePixels:image?image.width*image.height:0,maxPixels:2600000,wasmBytes:wasm?.memory.buffer.byteLength||0,maxWasmBytes:16777216,sourceReferencesRetained:0,uses,failures,retired,releaseEpoch})};
}
