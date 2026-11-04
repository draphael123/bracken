// CLOUD ONLY. One bounded diagnostic, no original matrices or timing repetitions.
export async function diagnoseSkyroadGuard(manifest) {
  const urls = [], cache = new Map();
  const sources = new Map(manifest.candidate.map(f => [f.file, new TextDecoder().decode(Uint8Array.from(atob(f.contentBase64), x => x.charCodeAt(0)))]));
  async function load(file) {
    if (cache.has(file)) return cache.get(file);
    let source = sources.get(file);
    if (file === 'src/skyroad-opaque-rows.js') source += '\nexport function __guardDiagnostic(g) { return { browser, pristine, stable:stable(), hostDocument:!!hostDocument, bindings:[documentType,canvasType,contextType].map(native), rejected:watched.flatMap((w,i)=>w.names.flatMap((name,j)=>{const d=w.descriptors[j];if(!d || w.object===FP&&(name==="arguments"||name==="caller"))return [];return ["value","get","set"].filter(k=>typeof d[k]==="function"&&!native(d[k])).map(k=>({watch:i,name:String(name),kind:k,text:apply(fnText,d[k],[])}));})), changes:watched.flatMap((w,i)=>w.names.filter((n,j)=>!same(own(w.object,n),w.descriptors[j])).map(n=>({watch:i,name:String(n)}))), context:g?{protoExact:proto(g)===CP,keys:keys(g).map(String),attributes:g.getContextAttributes(),canvasProto:proto(g.canvas)===HP,width:g.canvas.width,height:g.canvas.height}:null }; }\n';
    if (file === 'src/redraw/skyroad_tiles.js') source += '\nexport const __massTile=massTile;\n';
    for (const m of [...source.matchAll(/from\s*(['"])(\.[^'"]+)\1/g)]) {
      const target = new URL(m[2], 'https://unit.invalid/' + file).pathname.slice(1);
      source = source.replace(m[0], 'from ' + JSON.stringify(await load(target)));
    }
    const url = URL.createObjectURL(new Blob([source], {type:'text/javascript'})); urls.push(url);cache.set(file,url);return url;
  }
  try {
    const h = await import(await load('src/skyroad-opaque-rows.js'));
    const beforePalette = h.__guardDiagnostic();
    const s = await import(await load('src/redraw/skyroad_tiles.js'));
    const before = h.__guardDiagnostic();
    const c = s.__massTile(0,5,15,6);
    const after = h.__guardDiagnostic(c.getContext('2d'));
    const stats = h.readOpaqueRowStats(); c.width=0;c.height=0;
    return {beforePalette,before,after,stats,complete:true,noOriginalAssertionsOrTimingRepeated:true};
  } finally {for(const u of urls)URL.revokeObjectURL(u);}
}
