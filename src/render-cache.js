// Reuse immutable gradients on the same drawing context.
const gradients=new WeakMap();
export function staticGradient(g,key,make){
 let cache=gradients.get(g);if(!cache){cache=new Map();gradients.set(g,cache);}if(cache.has(key))return cache.get(key);
 const value=make();if(cache.size>=8)cache.delete(cache.keys().next().value);cache.set(key,value);return value;
}
