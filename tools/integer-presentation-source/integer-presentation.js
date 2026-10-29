// Exact per-frame opaque integer expansion. No retained source canvas/content cache.
export function makeIntegerPresentation(maxPixels=2600000){
 if(!Number.isSafeInteger(maxPixels)||maxPixels<1||maxPixels>2600000)throw new RangeError('Bounded integer presentation budget');
 let canvas=null,context=null,image=null,words=null,width=0,height=0;
 const native=fn=>typeof fn==='function'&&/\[native code\]/.test(Function.prototype.toString.call(fn));
 const dispose=()=>{if(canvas){canvas.width=0;canvas.height=0;}canvas=null;context=null;image=null;words=null;width=height=0;};
 function draw(destination,source,x,y,scale){
  if(!(source instanceof HTMLCanvasElement)||!(destination?.canvas instanceof HTMLCanvasElement)||source===destination.canvas||!Number.isInteger(scale)||scale<2||scale>6||!Number.isSafeInteger(x)||!Number.isSafeInteger(y)||destination.globalAlpha!==1||destination.globalCompositeOperation!=='source-over'||destination.imageSmoothingEnabled||destination.filter!=='none'||destination.shadowBlur||destination.shadowOffsetX||destination.shadowOffsetY||destination.shadowColor!=='rgba(0, 0, 0, 0)'||destination.isContextLost())return false;
  if(Object.getOwnPropertyDescriptor(source,'width')||Object.getOwnPropertyDescriptor(source,'height')||![source.getContext,destination.drawImage,destination.getTransform,destination.getContextAttributes,destination.isContextLost].every(native))return false;
  const matrix=destination.getTransform();if(matrix.a!==1||matrix.b||matrix.c||matrix.d!==1||!Number.isInteger(matrix.e)||!Number.isInteger(matrix.f))return false;
  const sw=source.width,sh=source.height,w=sw*scale,h=sh*scale;if(!sw||!sh||w>4096||h>4096||w*h>maxPixels)return false;
  const src=source.getContext('2d');if(!src||![src.getImageData,src.getContextAttributes,src.isContextLost].every(native))return false;const sa=src.getContextAttributes(),da=destination.getContextAttributes();if(src.isContextLost()||sa?.colorSpace!=='srgb'||da?.colorSpace!=='srgb'||sa?.colorType!=='unorm8'||da?.colorType!=='unorm8')return false;
  let sampled;try{sampled=src.getImageData(0,0,sw,sh);}catch{return false;}const rgba=sampled.data;for(let i=3;i<rgba.length;i+=4)if(rgba[i]!==255)return false;
  if(!canvas||w!==width||h!==height||canvas.width!==width||canvas.height!==height||context.isContextLost()){
   dispose();try{canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;context=canvas.getContext('2d',{alpha:false,willReadFrequently:true});if(!context||context.isContextLost()){dispose();return false;}image=context.createImageData(w,h);words=new Uint32Array(image.data.buffer,image.data.byteOffset,image.data.byteLength/4);width=w;height=h;const owned=canvas;canvas.addEventListener('contextlost',()=>{if(canvas===owned)dispose();},{once:true});}catch{dispose();return false;}
  }
  const input=new Uint32Array(rgba.buffer,rgba.byteOffset,rgba.byteLength/4);let si=0;for(let row=0;row<sh;row++){
   const base=row*scale*w;let at=base;for(let col=0;col<sw;col++){const value=input[si++];for(let k=0;k<scale;k++)words[at++]=value;}for(let k=1;k<scale;k++)words.copyWithin(base+k*w,base,base+w);
  }
  context.putImageData(image,0,0);destination.drawImage(canvas,x,y);return true;
 }
 return{draw,dispose,root:()=>canvas,info:()=>({canvases:canvas?1:0,pixels:width*height,imagePixels:image?image.width*image.height:0,maxPixels,sourceReferencesRetained:0})};
}
