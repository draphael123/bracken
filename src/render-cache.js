// Cache only immutable, view-sized raster work. Animated layers still draw each frame.
const strips=new WeakMap(),gradients=new WeakMap();
export function skyStrip(source,width,height){
 let bySize=strips.get(source);if(!bySize){bySize=new Map();strips.set(source,bySize);}
 const key=width+'x'+height;if(bySize.has(key))return bySize.get(key);
 const c=document.createElement('canvas');c.width=width;c.height=height;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 g.drawImage(source,0,0,1,height,0,0,width,height);
 // A view change can retain only two sizes per source; old level sources remain weakly held.
 if(bySize.size>=2)bySize.delete(bySize.keys().next().value);bySize.set(key,c);return c;
}
export function staticGradient(g,key,make){
 let cache=gradients.get(g);if(!cache){cache=new Map();gradients.set(g,cache);}if(cache.has(key))return cache.get(key);
 const value=make();if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,value);return value;
}

// A transformed intermediate raster can round differently from the original one-column source.
// Boss zoom and ship roll keep the original draw operation, including its exact sampling.
export function paintSky(g,source,width,height){
 if(!g.getTransform().isIdentity){g.drawImage(source,0,0,1,height,0,0,width,height);return;}
 g.drawImage(skyStrip(source,width,height),0,0);
}
