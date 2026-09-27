import {expandKeep} from './keep-expansion.js';
import {reworkDeep} from './tribute-ship.js';
// Crop the authored trench and castle together with all of their water/air metadata.
export function cropDeep(source, x0, y0, W, H, TS=16) {
 const x1=x0+W-1,y1=y0+H-1,R={...source,W,H,grid:new Uint8Array(W*H)};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)R.grid[y*W+x]=source.grid[(y+y0)*source.W+x+x0];
 const point=p=>p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1?{...p,x:p.x-x0,y:p.y-y0}:null;
 const rect=r=>{if(r[1]<x0||r[0]>x1||r[3]<y0||r[2]>y1)return null;return [Math.max(r[0],x0)-x0,Math.min(r[1],x1)-x0,Math.max(r[2],y0)-y0,Math.min(r[3],y1)-y0,...r.slice(4)];};
 const zone=(z,k=1)=>{const a=x0*k,b=y0*k,c=(x1+(k===1?0:1))*k,d=(y1+(k===1?0:1))*k;if(z.x1<a||z.x0>c||z.y1<b||z.y0>d)return null;return {...z,x0:Math.max(z.x0,a)-a,x1:Math.min(z.x1,c)-a,y0:Math.max(z.y0,b)-b,y1:Math.min(z.y1,d)-b};};
 R.ents=source.ents.map(point).filter(Boolean);
 R.interiors=(source.interiors||[]).map(rect).filter(Boolean);
 R.airRooms=(source.airRooms||[]).map(rect).filter(Boolean);
 R.facades=(source.facades||[]).map(rect).filter(Boolean).map(r=>{if(r[5]?.arch)r[5]={...r[5],arch:r[5].arch.map(y=>y-y0)};return r;});
 R.darkZones=(source.darkZones||[]).map(z=>zone(z,TS)).filter(Boolean);
 R.pools=(source.pools||[]).filter(p=>p.x1>x0*TS&&p.x0<(x1+1)*TS&&(p.bottom??p.y+p.depth)>y0*TS&&p.y<(y1+1)*TS).map(p=>{
  const y=Math.max(p.y,y0*TS)-y0*TS,bottom=Math.min(p.bottom??p.y+p.depth,(y1+1)*TS)-y0*TS;
  return {...p,x0:Math.max(p.x0,x0*TS)-x0*TS,x1:Math.min(p.x1,(x1+1)*TS)-x0*TS,y,bottom,depth:bottom-y};
 });
 R.moversExtra=[];R.falls=[];R.deep={};
 for(const key of ['vents','clams','bulbs','wrecks','jellies','kelp','fish','props','banners'])R.deep[key]=(source.deep[key]||[]).map(point).filter(Boolean);
 for(const key of ['pockets','masonry','noDress'])R.deep[key]=(source.deep[key]||[]).map(rect).filter(Boolean);
 for(const key of ['zones','currents'])R.deep[key]=(source.deep[key]||[]).map(z=>zone(z)).filter(Boolean);
 R.deep.shafts=(source.deep.shafts||[]).filter(s=>s.x>=x0&&s.x<=x1&&s.y1>=y0&&s.y0<=y1).map(s=>({...s,x:s.x-x0,y0:Math.max(s.y0,y0)-y0,y1:Math.min(s.y1,y1)-y0}));
 for(const key of ['rime','icicles'])R.deep[key]=(source.deep[key]||[]).filter(r=>r[1]>=x0&&r[0]<=x1&&r[2]>=y0&&r[2]<=y1).map(([a,b,y])=>[Math.max(a,x0)-x0,Math.min(b,x1)-x0,y-y0]);
 R.deep.gates=(source.deep.gates||[]).filter(g=>g.col>=x0&&g.col<=x1&&g.wheel[0]>=x0&&g.wheel[0]<=x1).map(g=>({...g,col:g.col-x0,wheel:[g.wheel[0]-x0,g.wheel[1]-y0],y0:g.y0-y0,y1:g.y1-y0}));
 if(source.arena){const A=source.arena;R.arena={...A,x0:A.x0-x0*TS,x1:A.x1-x0*TS,trigger:A.trigger-x0*TS,wallL:A.wallL-x0,wallR:A.wallR-x0,floor:A.floor-y0*TS,y0:A.y0-y0*TS,y1:A.y1-y0*TS,throne:A.throne?[A.throne[0]-x0*TS,A.throne[1]-y0*TS]:undefined};}
 R.START={x:source.START.x-x0,y:source.START.y-y0};
 R.tall={top:0,bottom:(H-5)*TS,col:'18,28,34',deepest:0.12};
 return R;
}
export function underwaterKeep(source,T,TS=16){
 const R=cropDeep(source,104,140,200,64,TS);R.START={x:3,y:58};delete R.quest;R.music='underkeep';R.deep.vents.push({x:3,y:58,h:6,hot:false,drain:false});
 R.ents=R.ents.filter(e=>e.t!=='stray');
 for(const [x,y] of [[51,31],[105,35],[130,58]])R.ents.push({t:'silver',x,y});
 R.ents.push({t:'bellguard',x:60,y:58,face:-1});   /* one diver left at his post. The mini who kept the hall past him is gone: his hall is THE KING'S DOOR now (docs/briefs/keep-rework-2.md) */
 R.ents.push({t:'sign',x:4,y:58,text:'THE UNDERWATER KEEP. THE KING WAITS BEYOND HIS FLOODED COURTS. AIR HIDES UNDER THE VAULTS.'});
 return expandKeep(R,T,TS,cropDeep);
}
export function crabTrench(source,T,TS=16){
 const R=cropDeep(source,0,0,162,204,TS),set=(x,y,t)=>R.grid[y*R.W+x]=t;
 R.facades=[];R.deep.masonry=[];R.deep.gates=[];
 for(const key of ['vents','clams','bulbs','wrecks','jellies','kelp','fish','props','banners','shafts'])R.deep[key]=R.deep[key].filter(p=>p.x<110);
 R.airRooms=R.airRooms.filter(r=>r[1]<110);R.deep.pockets=R.deep.pockets.filter(r=>r[1]<110);
 for(const key of ['rime','icicles'])R.deep[key]=R.deep[key].filter(r=>r[0]<110).map(r=>[r[0],Math.min(109,r[1]),r[2]]);
 for(const key of ['zones','currents'])R.deep[key]=R.deep[key].filter(z=>z.x0<110).map(z=>({...z,x1:Math.min(z.x1,109)}));
 R.darkZones=R.darkZones.filter(z=>z.x0<110*TS).map(z=>({...z,x1:Math.min(z.x1,110*TS)}));
 for(let y=140;y<204;y++)for(let x=110;x<162;x++)set(x,y,T.SOLID);
 for(let y=188;y<199;y++)for(let x=110;x<112;x++)set(x,y,T.AIR);
 R.ents=R.ents.filter(e=>e.x<110&&!(e.t==='sign'&&e.x===108)&&e.t!=='gate'&&e.t!=='drownedking');
 for(let y=180;y<199;y++)for(let x=112;x<=154;x++)set(x,y,T.AIR);
 for(let y=194;y<199;y++)for(let x=155;x<=160;x++)set(x,y,T.AIR);
 for(let y=0;y<R.H;y++)set(161,y,T.SOLID);
 for(const [x,y] of [[114,198],[151,198]])R.ents.push({t:'ballast',x,y,kind:'stone'});
 R.ents.push({t:'bellcrab',x:142,y:198,face:-1},{t:'gate',x:159,y:198},{t:'sign',x:108,y:198,text:'THE BELL GRAVE. LEAVE THE MARKED FLOOR, GUARD THE PINCER, AND STRIKE WHEN ITS SHELL VENTS.'});
 for(const x of [116,133,149]){R.airRooms.push([x,x+3,180,183]);R.deep.pockets.push([x,x+3,180,183]);R.deep.vents.push({x:x+1,y:198,h:9,hot:false,drain:false});}
 R.deep.zones.push({name:'THE BELL GRAVE',x0:112,x1:160,y0:180,y1:198,col:[120,195,190],a:0.12});
 R.arena={x0:112*TS,x1:155*TS,floor:199*TS,trigger:114*TS,wallL:111,wallR:155,boss:'bellcrab',music:'boss3',tint:'#14343a',tintA:0.12,fx:'motes',y0:180*TS,y1:199*TS};
 return reworkDeep(R,T,TS);   /* the holds, the tribute ship, the knights, the Bell's stone racks (src/tribute-ship.js) */
}

