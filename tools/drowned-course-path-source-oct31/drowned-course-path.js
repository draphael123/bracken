// Frame-local, disjoint native geometry only. No bitmap cache, canvas, or retained source.
const CP=typeof CanvasRenderingContext2D==='function'?CanvasRenderingContext2D.prototype:null,PD=typeof Path2D==='function'?Path2D:null;
const descriptor=Object.getOwnPropertyDescriptor,prototype=Object.getPrototypeOf,apply=Reflect.apply,native=f=>typeof f==='function'&&/\[native code\]/.test(Function.prototype.toString.call(f));
const names=['fillRect','fill','getTransform','isContextLost'],props=['fillStyle','globalAlpha','globalCompositeOperation','filter','shadowBlur','shadowOffsetX','shadowOffsetY','shadowColor'];
const methods=CP?Object.fromEntries(names.map(k=>[k,descriptor(CP,k)?.value])):{},properties=CP?Object.fromEntries(props.map(k=>[k,descriptor(CP,k)])):{},canvasGet=CP&&descriptor(CP,'canvas')?.get,rect=PD&&descriptor(PD.prototype,'rect')?.value;
const ready=!!CP&&!!PD&&[PD,rect,canvasGet,descriptor,prototype,apply,...Object.values(methods),...Object.values(properties).flatMap(d=>[d?.get,d?.set])].every(native)&&descriptor(PD.prototype,'constructor')?.value===PD;
export function tryDrownedCourses(g,sx,sy,w,h){
 if(!ready||![sx,sy,w,h].every(x=>typeof x==='number'&&Number.isSafeInteger(x))||w<=0||h<=0||w>4096||h>1024||Math.abs(sx)>65536||Math.abs(sy)>65536||Math.ceil(w/24)*Math.ceil(h/8)>4096)return false;
 try{apply(canvasGet,g,[]);}catch{return false;}
 if(prototype(g)!==CP||globalThis.Path2D!==PD||descriptor(PD.prototype,'rect')?.value!==rect||descriptor(PD.prototype,'constructor')?.value!==PD)return false;
 for(const k of names){const d=descriptor(g,k),p=descriptor(CP,k);if(d&&(!('value'in d)||d.value!==methods[k])||!p||p.value!==methods[k])return false;}
 for(const k of props){const p=descriptor(CP,k),o=properties[k];if(descriptor(g,k)||!p||p.get!==o.get||p.set!==o.set)return false;}
 const get=k=>apply(properties[k].get,g,[]),m=apply(methods.getTransform,g,[]);
 if(m.a!==1||m.b!==0||m.c!==0||m.d!==1||!Number.isSafeInteger(m.e)||!Number.isSafeInteger(m.f)||get('globalAlpha')!==1||get('globalCompositeOperation')!=='source-over'||get('filter')!=='none'||get('shadowBlur')!==0||get('shadowOffsetX')!==0||get('shadowOffsetY')!==0||get('shadowColor')!=='rgba(0, 0, 0, 0)'||apply(methods.isContextLost,g,[]))return false;
 const bricks=new PD(),shade=new PD(),mortar=new PD();
 for(let yy=sy;yy<sy+h;yy+=8){for(let xx=sx+(((yy/8)&1)?12:0);xx<sx+w;xx+=24){apply(rect,bricks,[xx,yy,22,7]);apply(rect,shade,[xx,yy+6,22,1]);}apply(rect,mortar,[sx,yy+7,w,1]);}
 apply(properties.fillStyle.set,g,['#1e343a']);apply(methods.fill,g,[bricks]);
 apply(properties.fillStyle.set,g,['#152a2e']);apply(methods.fill,g,[shade]);
 apply(properties.fillStyle.set,g,['#0e1c1e']);apply(methods.fill,g,[mortar]);return true;
}
