// Same native 2D buffer and destination. No pixel copies, new canvases, or content cache.
const CP=typeof CanvasRenderingContext2D==='function'?CanvasRenderingContext2D.prototype:null,HP=typeof HTMLCanvasElement==='function'?HTMLCanvasElement.prototype:null;
const descriptor=Object.getOwnPropertyDescriptor,prototype=Object.getPrototypeOf,apply=Reflect.apply,native=f=>typeof f==='function'&&/\[native code\]/.test(Function.prototype.toString.call(f));
const methodNames=['drawImage','save','restore','translate','scale','getTransform','isContextLost'],propertyNames=['globalAlpha','globalCompositeOperation','imageSmoothingEnabled','filter','shadowBlur','shadowOffsetX','shadowOffsetY','shadowColor'];
const methods=CP?Object.fromEntries(methodNames.map(k=>[k,descriptor(CP,k)?.value])):{},properties=CP?Object.fromEntries(propertyNames.map(k=>[k,descriptor(CP,k)])):{},canvasGetter=CP&&descriptor(CP,'canvas')?.get,widthGetter=HP&&descriptor(HP,'width')?.get,heightGetter=HP&&descriptor(HP,'height')?.get;
const ready=!!CP&&!!HP&&[descriptor,prototype,apply,canvasGetter,widthGetter,heightGetter,...Object.values(methods),...Object.values(properties).flatMap(d=>[d?.get,d?.set])].every(native);
export function tryNativeTransformPresent(g,source,x,y,w,h){
 if(!ready||typeof x!=='number'||typeof y!=='number'||typeof w!=='number'||typeof h!=='number'||!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||!Number.isFinite(w)||!Number.isFinite(h))return false;
 let sw,sh;try{apply(canvasGetter,g,[]);sw=apply(widthGetter,source,[]);sh=apply(heightGetter,source,[]);}catch{return false;}
 if(prototype(g)!==CP||!sw||!sh||source===apply(canvasGetter,g,[]))return false;
 for(const key of methodNames){const own=descriptor(g,key),current=descriptor(CP,key);if(own&&(!('value'in own)||own.value!==methods[key])||!current||current.value!==methods[key])return false;}
 for(const key of propertyNames){const current=descriptor(CP,key),original=properties[key];if(descriptor(g,key)||!current||current.get!==original.get||current.set!==original.set)return false;}
 const k=w/sw;if(!Number.isInteger(k)||k<1||k>8||h/sh!==k||apply(methods.isContextLost,g,[]))return false;
 const get=key=>apply(properties[key].get,g,[]),m=apply(methods.getTransform,g,[]);
 if(m.a!==1||m.b!==0||m.c!==0||m.d!==1||m.e!==0||m.f!==0||get('globalAlpha')!==1||get('globalCompositeOperation')!=='source-over'||get('imageSmoothingEnabled')!==false||get('filter')!=='none'||get('shadowBlur')!==0||get('shadowOffsetX')!==0||get('shadowOffsetY')!==0||get('shadowColor')!=='rgba(0, 0, 0, 0)')return false;
 apply(methods.save,g,[]);try{apply(methods.translate,g,[x,y]);apply(methods.scale,g,[k,k]);apply(methods.drawImage,g,[source,0,0]);}finally{apply(methods.restore,g,[]);}return true;
}
