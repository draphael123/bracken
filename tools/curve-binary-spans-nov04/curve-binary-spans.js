// Private numeric painter. No canvas cache, sharing, delayed outputs or scratch canvas.
const own=Reflect.getOwnPropertyDescriptor,apply=Reflect.apply,proto=Reflect.getPrototypeOf,keys=Reflect.ownKeys;
const slot=(d,key)=>d&&own(d,key)?.value;
const fnText=slot(own(Function.prototype,'toString'),'value');
const native=f=>{
  if(typeof f!=='function'||typeof fnText!=='function')return false;
  const text=apply(fnText,f,[]);
  const part=(at,word)=>{if(at+word.length>text.length)return false;for(let n=0;n<word.length;n++)if(text[at+n]!==word[n])return false;return true;};
  const word=c=>c!==undefined&&(c>='a'&&c<='z'||c>='A'&&c<='Z'||c>='0'&&c<='9'||c==='_'||c==='$');
  if(!part(0,'function '))return false;let at=9;
  if(part(at,'get ')||part(at,'set '))at+=4;
  if(part(at,'[Symbol.')){at+=8;const start=at;while(at<text.length&&word(text[at]))at++;if(at===start||text[at]!==']')return false;at++;}
  else{const start=at;while(at<text.length&&word(text[at]))at++;if(at===start)return false;}
  const end='() { [native code] }';return at+end.length===text.length&&part(at,end);
};
const realm=globalThis;
const contextType=slot(own(realm,'CanvasRenderingContext2D'),'value'),matrixType=slot(own(realm,'DOMMatrixReadOnly'),'value');
const CP=native(contextType)?slot(own(contextType,'prototype'),'value'):null;
const MP=native(matrixType)?slot(own(matrixType,'prototype'),'value'):null;
const matrixArray=MP&&slot(own(MP,'toFloat64Array'),'value');
const floor=slot(own(Math,'floor'),'value'),ceil=slot(own(Math,'ceil'),'value'),mathBinding=own(realm,'Math');
const names=['canvas','getContextAttributes','getTransform','fillRect','fillStyle','globalAlpha','globalCompositeOperation','filter','shadowColor'];
const ds={__proto__:null};if(CP)for(let i=0;i<names.length;i++)ds[i]=own(CP,names[i]);
const same=(a,b)=>!!a===!!b&&(!a||slot(a,'value')===slot(b,'value')&&slot(a,'get')===slot(b,'get')&&slot(a,'set')===slot(b,'set')&&slot(a,'writable')===slot(b,'writable')&&slot(a,'enumerable')===slot(b,'enumerable')&&slot(a,'configurable')===slot(b,'configurable'));
let pristine=!!CP&&native(own)&&native(apply)&&native(proto)&&native(keys)&&native(fnText)&&native(floor)&&native(ceil)&&native(matrixArray)&&names.length===9;
for(let i=0;i<names.length;i++){const d=ds[i],get=slot(d,'get'),set=slot(d,'set'),value=slot(d,'value');if(!d||get&&!native(get)||set&&!native(set)||typeof value==='function'&&!native(value))pristine=false;}
const required=[[0,'get'],[1,'value'],[2,'value'],[3,'value'],[4,'get'],[4,'set'],[5,'get'],[6,'get'],[7,'get'],[8,'get']];
for(let i=0;i<required.length;i++)if(!native(slot(ds[required[i][0]],required[i][1])))pristine=false;
const stats={attempts:0,optimized:0,fallback:0,boundingCoordinates:0,predicateChecks:0,paintedPixels:0,spans:0};
export function readCurveSpanStats(){return {...stats};}
function allowed(g,colour,dither){
  if(!pristine||dither||typeof colour!=='string'||colour.length!==7||colour[0]!=='#')return false;
  for(let i=1;i<7;i++){const c=colour[i];if(!(c>='0'&&c<='9'||c>='a'&&c<='f'||c>='A'&&c<='F'))return false;}
  if(!same(own(realm,'Math'),mathBinding)||slot(own(Math,'floor'),'value')!==floor||slot(own(Math,'ceil'),'value')!==ceil)return false;
  // Native brand validation rejects a Proxy without querying its properties.
  try{apply(slot(ds[0],'get'),g,[]);}catch{return false;}
  if(proto(g)!==CP||keys(g).length)return false;
  for(let i=0;i<names.length;i++)if(!same(own(CP,names[i]),ds[i]))return false;
  const attributes=apply(slot(ds[1],'value'),g,[]);
  if(slot(own(attributes,'willReadFrequently'),'value')!==true||apply(slot(ds[5],'get'),g,[])!==1||apply(slot(ds[6],'get'),g,[])!=='source-over'||apply(slot(ds[7],'get'),g,[])!=='none')return false;
  const shadow=apply(slot(ds[8],'get'),g,[]);if(shadow!=='rgba(0, 0, 0, 0)'&&shadow!=='#00000000')return false;
  const m=apply(matrixArray,apply(slot(ds[2],'value'),g,[]),[]);
  return m[0]===1&&m[1]===0&&m[4]===0&&m[5]===1&&(m[12]|0)===m[12]&&(m[13]|0)===m[13];
}
export function paintCurveSpans(g,cx,cy,rx,ry,colour,dither,isCircle){
  stats.attempts++;
  // Object/coercing, nonfinite, negative/zero and enormous inputs use exact old loops.
  if(typeof cx!=='number'||typeof cy!=='number'||typeof rx!=='number'||typeof ry!=='number'||!(cx>-1048576&&cx<1048576&&cy>-1048576&&cy<1048576&&rx>0&&rx<=4096&&ry>0&&ry<=4096)||!allowed(g,colour,dither)){
    stats.fallback++;return false;
  }
  const xmin=floor(cx-rx),xmax=ceil(cx+rx),ymin=floor(cy-ry),ymax=ceil(cy+ry);
  if(xmax-xmin<7){stats.fallback++;return false;}
  stats.optimized++;stats.boundingCoordinates+=(xmax-xmin+1)*(ymax-ymin+1);
  const square=rx*rx;
  for(let y=ymin;y<=ymax;y++){
    const dy=isCircle?y+0.5-cy:(y+0.5-cy)/ry;
    const inside=x=>{stats.predicateChecks++;const dx=isCircle?x+0.5-cx:(x+0.5-cx)/rx;return isCircle?dx*dx+dy*dy<=square:dx*dx+dy*dy<=1;};
    let seed=floor(cx-0.5);if(seed<xmin)seed=xmin;if(seed>xmax)seed=xmax;
    if(!inside(seed)){if(seed===xmax||!inside(seed+1))continue;seed++;}
    // With primitive finite inputs, the identical original inequality is monotone
    // on either side of the nearest pixel centre. Binary searches find its exact
    // first/last accepted integer; no square-root or approximate coverage is used.
    let lo=xmin,hi=seed;
    while(lo<hi){const mid=floor((lo+hi)/2);if(inside(mid))hi=mid;else lo=mid+1;}
    const start=lo;lo=seed;hi=xmax;
    while(lo<hi){const mid=ceil((lo+hi)/2);if(inside(mid))lo=mid;else hi=mid-1;}
    const width=lo-start+1;
    apply(slot(ds[4],'set'),g,[colour]);apply(slot(ds[3],'value'),g,[start,y,width,1]);stats.spans++;stats.paintedPixels+=width;
  }
  return true;
}
