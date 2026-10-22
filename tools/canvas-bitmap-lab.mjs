// Diagnostic only: never installed by game source. Measure immutable sprite copies before considering integration.
export function installBitmapLab(){
 const records=new WeakMap(),active=new Map(),proto=CanvasRenderingContext2D.prototype,draw=proto.drawImage;
 const stats={hits:0,created:0,invalidated:0,stale:0,bytes:0,pending:0,failed:0};
 const budget=4*1024*1024,maxEntries=128;
 function drop(r){if(r.bitmap){r.bitmap.close();r.bitmap=null;stats.bytes-=r.bytes;}active.delete(r);}
 function dirty(r){r.generation++;r.writes++;stats.invalidated++;drop(r);if(r.writes>3)r.disabled=true;}
 function observe(c){
  let r=records.get(c);if(r)return r;
  r={canvas:c,width:c.width,height:c.height,generation:0,writes:0,reads:0,bitmap:null,pending:false,disabled:false,bytes:c.width*c.height*4};records.set(c,r);
  const g=c.getContext('2d');if(!g){r.disabled=true;return r;}
  for(const name of ['clearRect','fillRect','strokeRect','fill','stroke','fillText','strokeText','putImageData','drawImage','reset']){
   const original=g[name];if(typeof original!=='function')continue;
   g[name]=function(...args){dirty(r);return original.apply(this,args);};
  }
  return r;
 }
 for(const name of ['width','height']){const d=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,name);Object.defineProperty(HTMLCanvasElement.prototype,name,{...d,set(value){const r=records.get(this);if(r)dirty(r);return d.set.call(this,value);}});}
 proto.drawImage=function(source,...args){
  if(!(source instanceof HTMLCanvasElement)||source===this.canvas||source===window.BK?.view?.buf||source.id||!source.width||!source.height||source.width*source.height>65536)return draw.call(this,source,...args);
  const r=observe(source);r.reads++;
  if(r.bitmap){stats.hits++;active.delete(r);active.set(r,true);return draw.call(this,r.bitmap,...args);}
  if(!r.disabled&&!r.pending&&r.reads>=2&&stats.pending<2){
   r.pending=true;stats.pending++;const generation=r.generation,w=source.width,h=source.height;
   createImageBitmap(source).then(bitmap=>{
    if(r.disabled||generation!==r.generation||w!==source.width||h!==source.height){bitmap.close();stats.stale++;return;}
    const bytes=w*h*4;
    while(active.size>=maxEntries||stats.bytes+bytes>budget){const oldest=active.keys().next().value;if(!oldest)break;drop(oldest);oldest.disabled=true;}
    r.bytes=bytes;r.bitmap=bitmap;active.set(r,true);stats.bytes+=r.bytes;stats.created++;
   },()=>{r.disabled=true;stats.failed++;}).finally(()=>{r.pending=false;stats.pending--;});
  }
  return draw.call(this,source,...args);
 };
 window.__bitmapLab={stats,async settled(){while(stats.pending)await new Promise(r=>setTimeout(r,0));},close(){for(const r of [...active.keys()])drop(r);}};
}
