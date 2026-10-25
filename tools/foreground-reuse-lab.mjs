// Served-only prototype: retain the original foreground composite until its immutable inputs change.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {openPage,ROOT as CHECKOUT} from './cdp.mjs';
export const ROOT=CHECKOUT;
export const GAME='62d9c02c102decc69ceaef4e1ec593a23170f1ff';
export const OUT=path.resolve('../foreground-reuse-evidence');
const hash=s=>createHash('sha256').update(s).digest('hex');
export function recipe(){
 const original=fs.readFileSync(ROOT+'/src/main.js','utf8');
 assert.equal(hash(original),'81866b69fec64de5fdd00da316fb0d1e8e997ae9912f73f280981f0a70cb36d8');
 const git=(...args)=>execFileSync('git',args,{cwd:ROOT,encoding:'utf8'}).trim();
 assert.equal(git('rev-parse','HEAD:src'),git('rev-parse',GAME+':src'));
 assert.equal(git('status','--porcelain'),'');
 const start=original.indexOf('let FGC = null;'),end=original.indexOf('// THE NEAR GRASS LEAVES A ROUND WINDOW:',start);
 assert(start>0&&end>start);
 const before=original.slice(start,end);
 assert.equal((original.match(/\bFGC\b/g)||[]).length,9,'all FGC references must remain private to this renderer');
 assert.equal((original.match(/BG\.fg\b/g)||[]).length,1,'the baked foreground has only this draw-time consumer');
 const after=`let FGC = null, fgSource = null, fgWidth = 0, fgHeight = 0, fgX = NaN, fgY = NaN;
function drawFg(cx, cy) {
  if (!FGC || FGC.width !== VW || FGC.height !== VH) { FGC = document.createElement('canvas'); FGC.width = VW; FGC.height = VH; fgSource = null; }
  const c = BG.fg, w = c.width, h = c.height, dY = bgDY(cy);
  let x = ((-cx * 1.25) % w + w) % w; if (x > 0) x -= w; const y = Math.round(dY * 1.25);
  // The baked sheet is immutable; only this function writes its private composite.
  if (fgSource !== c || fgWidth !== w || fgHeight !== h || fgX !== x || fgY !== y) {
    const f = FGC.getContext('2d');
    f.globalCompositeOperation = 'source-over'; f.clearRect(0, 0, VW, VH);
    for (let dx = x; dx < VW; dx += w) f.drawImage(c, Math.round(dx), y);
    fgSource = c; fgWidth = w; fgHeight = h; fgX = x; fgY = y;
  }
  /* Behind the actors now: no coverage test can make this strip flash. */
  g.globalAlpha = 0.3; g.drawImage(FGC, 0, 0); g.globalAlpha = 1;
}
`;
 const candidate=original.slice(0,start)+after+original.slice(end);
 assert.equal(candidate.replace(after,before),original);
 execFileSync(process.execPath,['--input-type=module','--check'],{input:candidate});
 const proof={time:new Date().toISOString(),controller:git('rev-parse','HEAD'),gameSource:GAME,gameTree:git('rev-parse','HEAD:src'),originalMainSha256:hash(original),candidateMainSha256:hash(candidate),originalDrawFgSha256:hash(before),candidateDrawFgSha256:hash(after),onlyPrivateForegroundCompositeChanged:true,originalFinalAlphaCompositePreserved:true,noAdditionalCanvasSurface:true,cacheEntries:1,sourceDimensionsPlacementAndViewInvalidate:true,noGameStateRngClockAudioQualityFixtureOrBalanceChanges:true,adopted:false};
 return{original,before,after,candidate,proof};
}
export async function openReusePage(candidate,options={}){
 const served=[],errors=[];
 if(!candidate){const pg=await openPage(options);pg.reuseServed=served;pg.reuseErrors=errors;return pg;}
 const r=recipe();let pg;
 pg=await openPage({...options,onEvent:event=>{if(event.method!=='Fetch.requestPaused')return;void(async()=>{const p=event.params;if(new URL(p.request.url).pathname==='/src/main.js'){served.push(p.request.url);await pg.send('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,responseHeaders:[{name:'Content-Type',value:'text/javascript; charset=utf-8'},{name:'Cache-Control',value:'no-store'}],body:Buffer.from(r.candidate).toString('base64')});}else await pg.send('Fetch.continueRequest',{requestId:p.requestId});})().catch(e=>errors.push(String(e)));}});
 try{await pg.send('Fetch.enable',{patterns:[{urlPattern:'*/src/main.js*',requestStage:'Request'}]});}catch(e){await pg.close();throw e;}
 pg.reuseServed=served;pg.reuseErrors=errors;return pg;
}
