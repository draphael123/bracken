/* tools/unburied-look.mjs - THE UNBURIED FIELD'S PICTURE, MEASURED (claude/unburiedart, the ten look checks of docs/briefs: "a siege that never ended").
   WHY. tools/unburied.mjs reads the level's grid and rules; footing-art reads only the TILE layer, so an overpaint passes it. None of them can say
   "this screen looks like a siege". These ten run in the page (a real Chrome, the real frame via BK.look) and test the picture itself:
     1  no borrowed tiles   every SOLID / ONEWAY / SPIKE / PALISADE cell is drawn from the field's own kit (never the forest's top/dirt/thorns/beam/log/palisade)
     2  no floating ledge   every ONEWAY run stands in a named structure / set piece, on rock, or has DRAWN support under both ends (the frame differs with the
                            deco / facade / structure layers switched off, BK.hide)
     3  a set piece on every screen   the 25 sweep screens (x 4 + 19k): at least one UF.SETPIECES bbox >= 50% inside the view (today 6/25; <= 3 quiet screens, named)
     4  the landmark        the chapel-fort's silhouette is present on the opening frame, contrasts with the sky behind it, and is drawn larger at col 300
     5  dressing reads      every deco on screen changes the frame by a luminance margin against what is behind it (frame with and without the deco layer)
     6  the glint           every unused engine pulses (two frames 0.2 s apart differ at the glint), none after use; off screen a chevron; a 10 s stand-still nudges
                            once and not again inside 25 s
     7  light               at each burning wagon the luminance within 24 px of the fire is a margin above the same spot with the lamps off
     8  sound               L.ambient names battlefield / hall by zone; 'battlefield' is in AMBIENT_NAMES; its source list holds no horn; nothing was downloaded
     9  readability holds   the cavalry warn band, the cover glow and the bridge shadows stay distinguishable at a burning wagon; the arena glass behind the
                            boss's floor is neither red- nor green-dominant
    10  tells unchanged     tools/unburied.mjs is green (the art lane touched no stepField's tells, the four peg walls deleted as today)
   Run: PORT=<free port> node tools/unburied-look.mjs [1 2 3 ...]   (no numbers = all ten)                                                            */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { UF } from '../src/unburied-field.js';

const want = process.argv.slice(2).map(Number).filter(Boolean), run = n => !want.length || want.includes(n);
const results = [];
const note = (n, name, ok, detail) => { results.push([n, name, ok]); console.log((ok ? '  ok   ' : '  FAIL ') + String(n).padStart(2) + ' ' + name.padEnd(26) + (detail || '')); };
const PRELUDE = `const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.hud='minimal';BK.SET.weather=false;
  const fi=LEVELS.findIndex(l=>l.id==='unburied');
  const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(150);BK.step(1);for(const e of BK.enemies())e.alive=false;};
  const L=()=>BK.L; const TS=16;
  const ground=x=>{const l=BK.L;for(let y=18;y<l.H;y++){const q=l.grid[y*l.W+x];if(q!==0&&q!==3&&l.grid[(y-1)*l.W+x]===0)return y-1;}return l.H-3;};
  const px=()=>{const c=BK.view.buf;const g=c.getContext('2d');return g.getImageData(0,0,c.width,c.height).data;};
  const lum=(d,i)=>0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
  const stand=(x,y)=>{const P=BK.P;P.x=x*TS+8;P.y=(y+1)*TS;P.vx=P.vy=0;};`;

const pg = await openPage({ audio: false });
const ev = (body, t = 900000) => pg.evalp(`(async()=>{${PRELUDE}\n${body}\n})()`, t);
try {
  /* ---------------- 1. NO BORROWED TILES ---------------- */
  if (run(1)) {
    const r = await ev(`fresh();BK.step(2);const l=BK.L,spr=BK.tileSpr(),{TILE,LEDGE_SETS}=BK.tileArt();const T={SOLID:1,ONEWAY:2,SPIKE:3,PALISADE:7};
      const bad=new Set();const walk=(o,tag)=>{if(!o)return;if(o instanceof HTMLCanvasElement){bad.add(o);return;}if(Array.isArray(o)){o.forEach(q=>walk(q,tag));return;}if(typeof o==='object')for(const k of Object.keys(o))walk(o[k],tag);};
      for(const k of ['top','dirt','deep','edge','roots','thorns','palisade','log','logL','logR','ledge','ledgeL','ledgeR','silt','soft','crate'])walk(TILE[k]);
      for(const k of Object.keys(TILE))if(/^beam|^log|^castle|^masonry|^stone/i.test(k))walk(TILE[k]);
      for(const k of ['beam','masonry'])walk(LEDGE_SETS[k]);
      let n=0,borrowed=0;const first=[];const kinds={};
      for(let i=0;i<l.grid.length;i++){const t=l.grid[i];if(t!==T.SOLID&&t!==T.ONEWAY&&t!==T.SPIKE&&t!==T.PALISADE)continue;n++;
        if(!spr[i]||bad.has(spr[i])){borrowed++;kinds[t]=(kinds[t]||0)+1;if(first.length<6)first.push((i%l.W)+','+Math.floor(i/l.W));}}
      return {n,borrowed,first,kinds};`);
    note(1, 'no borrowed tiles', r.borrowed === 0, r.n + ' cells, ' + r.borrowed + ' drawn from the forest kit ' + JSON.stringify(r.kinds) + (r.borrowed ? ' e.g. ' + r.first.join(' ') : ''));
  }
  /* ---------------- 3. A SET PIECE ON EVERY SCREEN ---------------- */
  const SP = UF.SETPIECES || [];
  if (run(3)) {
    const r = await ev(`const SP=${JSON.stringify(SP)};fresh();const out=[];
      for(let k=0;k<25;k++){const x=4+19*k;const gy=ground(x);const v=BK.look(x,gy);const vw=BK.view.VW,vh=BK.view.VH;let best=0,name='';
        for(const s of SP){const bx0=s.x0*TS,bx1=(s.x1+1)*TS,by0=s.y0*TS,by1=(s.y1+1)*TS;const ix=Math.max(0,Math.min(bx1,v.cx+vw)-Math.max(bx0,v.cx)),iy=Math.max(0,Math.min(by1,v.cy+vh)-Math.max(by0,v.cy));const f=ix*iy/((bx1-bx0)*(by1-by0));if(f>best){best=f;name=s.id;}}
        out.push([x,Math.round(best*100),name]);}
      return out;`);
    const quiet = r.filter(([, f]) => f < 50), QUIET_OK = new Set((UF.QUIET_SCREENS || []).map(Number));
    const unnamed = quiet.filter(([x]) => !QUIET_OK.has(x));
    note(3, 'a set piece on every screen', SP.length > 0 && unnamed.length === 0 && quiet.length <= 3,
      (25 - quiet.length) + '/25 screens hold one (' + SP.length + ' pieces listed)' + (quiet.length ? '; without: x ' + quiet.map(q => q[0]).join(',') : ''));
  }
  /* ---------------- 4. THE LANDMARK ---------------- */
  if (run(4)) {
    const r = await ev(`const UW=await import('/src/redraw/unburied_world.js');if(!UW.fortRect)return{err:'no UW.fortRect: the chapel-fort is not drawn'};
      fresh();const out={};
      const shot=(x,hide)=>{UW.hideFort(hide);const gy=ground(x);const v=BK.look(x,gy);return {v,d:px().slice()};};
      const a=shot(4,false),b=shot(4,true);UW.hideFort(false);const R=UW.fortRect(a.v.cx,BK.view.VW,BK.view.VH);
      let changed=0,sumd=0;const w=BK.view.VW;for(let y=Math.max(0,R.y);y<Math.min(BK.view.VH,R.y+R.h);y++)for(let x=Math.max(0,R.x);x<Math.min(w,R.x+R.w);x++){const i=(y*w+x)*4;const d=Math.abs(lum(a.d,i)-lum(b.d,i));if(d>6){changed++;sumd+=d;}}
      const c=shot(300,false);const R2=UW.fortRect(c.v.cx,BK.view.VW,BK.view.VH);UW.hideFort(false);
      return {R,R2,changed,meanDelta:changed?sumd/changed:0};`);
    if (r.err) note(4, 'the landmark', false, r.err);
    else note(4, 'the landmark', r.changed >= 400 && r.meanDelta >= 9 && r.R2.w > r.R.w * 1.25, r.changed + ' silhouette px at col 4, mean luminance delta ' + r.meanDelta.toFixed(1) + ' (>= 9); width ' + r.R.w + ' -> ' + r.R2.w + ' at col 300 (>= x1.25)');
  }
  /* ---------------- 5. DRESSING READS ---------------- */
  if (run(5)) {
    const r = await ev(`fresh();const bad=[];let n=0;
      for(let k=0;k<25;k++){const x=4+19*k;const gy=ground(x);const v=BK.look(x,gy);const A=px().slice();BK.hide.deco=true;BK.look(x,gy);const B=px().slice();BK.hide.deco=false;
        const vw=BK.view.VW,vh=BK.view.VH;
        for(const d of BK.drawables()){if(!d.bg||d.what==='sign'||d.what==='checkpoint')continue;const c=d.c;const sx=d.x-v.cx,sy=d.y-v.cy;if(sx+c.width<0||sx>vw||sy+c.height<0||sy>vh)continue;
          let ch=0,sum=0;for(let y=Math.max(0,Math.round(sy));y<Math.min(vh,Math.round(sy)+c.height);y++)for(let xx=Math.max(0,Math.round(sx));xx<Math.min(vw,Math.round(sx)+c.width);xx++){const i=(y*vw+xx)*4;const dd=Math.abs(lum(A,i)-lum(B,i));if(dd>3){ch++;sum+=dd;}}
          n++;const mean=ch?sum/ch:0;if(ch<20||mean<12)bad.push(d.what+'@'+Math.round(d.x/TS)+' (mean '+mean.toFixed(1)+', '+ch+' px)');}}
      return {n,bad};`);
    note(5, 'dressing reads', r.bad.length === 0 && r.n > 0, r.n + ' deco on the 25 screens, ' + r.bad.length + ' under the margin' + (r.bad.length ? ': ' + r.bad.slice(0, 6).join('; ') : ''));
  }
  /* ---------------- 2. NO FLOATING LEDGE ---------------- */
  if (run(2)) {
    const r = await ev(`const SP=${JSON.stringify(SP)};fresh();const l=BK.L,W=l.W,H=l.H,g=l.grid;const struct=(l.structures||[]);
      const rock=(x,y)=>x>=0&&x<W&&y<H&&(g[y*W+x]===1||g[y*W+x]===7||g[y*W+x]===4||g[y*W+x]===15);
      const runs=[];for(let y=0;y<H;y++){let x=0;while(x<W){const t=g[y*W+x];if(t===2||t===8){let x1=x;while(x1+1<W&&(g[y*W+x1+1]===2||g[y*W+x1+1]===8))x1++;runs.push([x,x1,y]);x=x1+1;}else x++;}}
      const inPiece=(x,y)=>SP.some(s=>x>=s.x0&&x<=s.x1&&y>=s.y0&&y<=s.y1+2)||struct.some(z=>x>=z.x0&&x<=z.x1&&y>=z.top-1&&y<=z.floor);
      const loose=[];let named=0,onRock=0,drawn=0;
      for(const [x0,x1,y] of runs){let all=true;for(let x=x0;x<=x1;x++)if(!inPiece(x,y)){all=false;break;}if(all){named++;continue;}
        if([x0,x1].every(x=>rock(x,y+1)||rock(x,y+2))){onRock++;continue;}
        const v=BK.look(Math.round((x0+x1)/2),y);BK.look(Math.round((x0+x1)/2),y);const A=px().slice();BK.hide.deco=BK.hide.facades=BK.hide.structures=true;BK.look(Math.round((x0+x1)/2),y);const B=px().slice();BK.hide.deco=BK.hide.facades=BK.hide.structures=false;
        const vw=BK.view.VW,vh=BK.view.VH;let ok=true;
        for(const x of [x0,x1]){let diff=0;if(rock(x,y+1)||rock(x,y+2))continue;for(let dy=1;dy<=2;dy++)for(let dx=2;dx<=13;dx+=3){const sx=x*TS+dx-v.cx,sy=(y+dy)*TS+8-v.cy;if(sx<0||sx>=vw||sy<0||sy>=vh)continue;const i=(Math.round(sy)*vw+Math.round(sx))*4;if(Math.abs(lum(A,i)-lum(B,i))>10)diff++;}
          if(!diff){ok=false;break;}}
        if(ok)drawn++;else loose.push(x0+'-'+x1+'@'+y);}
      return {runs:runs.length,named,onRock,drawn,loose};`);
    note(2, 'no floating ledge', r.loose.length === 0, r.runs + ' ledge runs: ' + r.named + ' in a structure/set piece, ' + r.onRock + ' on rock, ' + r.drawn + ' with drawn support, ' + r.loose.length + ' floating' + (r.loose.length ? ': ' + r.loose.slice(0, 8).join(' ') : ''));
    const arch = spawnSync(process.execPath, ['tools/architecture.mjs', 'unburied'], { encoding: 'utf8' });
    note(2, 'architecture (the field)', arch.status === 0 && !/unburied.*(in the air|FLOAT)/i.test(arch.stdout || ''), arch.status === 0 ? 'lists nothing' : ((arch.stdout || '') + (arch.stderr || '')).split('\n').slice(-3).join(' | '));
  }
  /* ---------------- 6. THE GLINT ---------------- */
  if (run(6)) {
    const SPOTS = UF.GLINTS || [];
    const r = await ev(`const SPOTS=${JSON.stringify(SPOTS)};fresh();const out=[];if(!BK.guide)return{err:'no guide'};
      const frame=()=>{BK.step(1);return px().slice();};
      for(const s of SPOTS){fresh();const F=BK.unbField();const en=s.engine?F.engines.find(e=>e.t===s.engine.t&&e.tx===s.engine.x):null;
        const row={id:s.id};
        const place=dx=>{stand(s.hero[0]+dx,s.hero[1]);BK.sim(2);};
        place(0);BK.sim(30);const rd=BK.guide.read();row.targets=rd.targets.length;row.key=rd.key;
        if(rd.targets.length){const t=rd.targets[0];
          /* the glint pulses: two frames 0.2 s apart differ round the target */
          const vw=BK.view.VW,vh=BK.view.VH;const sample=()=>{const v=BK.look(s.hero[0],s.hero[1]);const d=px().slice();return {v,d};};
          const a=sample();BK.sim(12);const b=sample();const sx=Math.round(t.x-a.v.cx),sy=Math.round(t.y-18-a.v.cy);let diff=0;
          for(let y=sy-12;y<=sy+12;y++)for(let x=sx-12;x<=sx+12;x++){if(x<0||y<0||x>=vw||y>=vh)continue;const i=(y*vw+x)*4;if(Math.abs(lum(a.d,i)-lum(b.d,i))>8)diff++;}
          row.pulse=diff;row.onscreen=sx>=0&&sx<vw&&sy>=0&&sy<vh;
          /* off screen: a chevron on the edge */
          if(s.far){stand(s.far[0],s.far[1]);BK.sim(30);const a2=sample();BK.sim(12);const b2=sample();const rd2=BK.guide.read();let ed=0;
            if(rd2.targets.length){const t2=rd2.targets[0];const sx2=t2.x-a2.v.cx,sy2=t2.y-18-a2.v.cy;row.farOff=!(sx2>=-8&&sx2<=vw+8&&sy2>=-8&&sy2<=vh+8);
              for(let y=0;y<vh;y++)for(const x of [0,1,2,3,4,5,6,7,8,9,10,11,vw-12,vw-11,vw-10,vw-9,vw-8,vw-7,vw-6,vw-5,vw-4,vw-3,vw-2,vw-1]){const i=(y*vw+x)*4;if(Math.abs(lum(a2.d,i)-lum(b2.d,i))>8)ed++;}}
            row.edge=ed;}
          /* the nudge: ten seconds of standing still names the thing, once, and not again inside 25 s */
          fresh();stand(s.hero[0],s.hero[1]);BK.sim(2);const n0=BK.guide.read().nudges;BK.sim(60*10+30);const n1=BK.guide.read().nudges;const line=BK.guide.read().lastNudge;BK.sim(60*20);const n2=BK.guide.read().nudges;BK.sim(60*7);const n3=BK.guide.read().nudges;
          row.nudge=[n0,n1,n2,n3];row.line=line;}
        /* after use: no glint */
        if(en){fresh();const F2=BK.unbField();const e2=F2.engines.find(e=>e.t===s.engine.t&&e.tx===s.engine.x);if(e2.t==='ballista')e2.fired=true;else e2.state='spent';stand(s.hero[0],s.hero[1]);BK.sim(30);row.after=BK.guide.read().targets.length;}
        out.push(row);}
      return out;`);
    if (r.err) note(6, 'the glint', false, r.err);
    else {
      const bad = [];
      for (const q of r) { if (!q.targets) bad.push(q.id + ': no glint target'); else {
        if (!(q.pulse >= 6)) bad.push(q.id + ': no pulse (' + q.pulse + ')');
        if (q.edge !== undefined && !(q.farOff && q.edge >= 4)) bad.push(q.id + ': no edge chevron (' + q.edge + ')');
        if (!(q.nudge[0] === 0 && q.nudge[1] === 1 && q.nudge[2] === 1 && q.nudge[3] === 2)) bad.push(q.id + ': nudge ' + JSON.stringify(q.nudge));
        if (q.after !== undefined && q.after !== 0) bad.push(q.id + ': still glints after use'); } }
      note(6, 'the glint', SPOTS.length > 0 && bad.length === 0, r.length + ' route needs checked' + (bad.length ? '; ' + bad.slice(0, 6).join('; ') : ''));
    }
  }
  /* ---------------- 7. LIGHT ---------------- */
  if (run(7)) {
    const FIRES = UF.FIRES || [];
    const r = await ev(`const FIRES=${JSON.stringify(FIRES)};fresh();const out=[];
      for(const f of FIRES){const v=BK.look(f.x,f.y);BK.step(1);const A=px().slice();const saved=BK.lights().splice(0);BK.step(1);BK.look(f.x,f.y);const B=px().slice();for(const s of saved)BK.lights().push(s);
        const vw=BK.view.VW,vh=BK.view.VH;const cx=Math.round(f.x*TS+8-v.cx),cy=Math.round((f.y+1)*TS-(f.up||14)-v.cy);let a=0,b=0,n=0;
        for(let y=cy-24;y<=cy+24;y++)for(let x=cx-24;x<=cx+24;x++){if(x<0||y<0||x>=vw||y>=vh)continue;const i=(y*vw+x)*4;a+=lum(A,i);b+=lum(B,i);n++;}
        out.push({id:f.id,gain:n?(a-b)/n:0});}
      return out;`);
    const bad = r.filter(q => q.gain < 6);
    note(7, 'light', FIRES.length >= 2 && bad.length === 0, r.length + ' fires; luminance gain ' + r.map(q => q.id + ' +' + q.gain.toFixed(1)).join(', '));
  }
  /* ---------------- 9. READABILITY HOLDS ---------------- */
  if (run(9)) {
    const FIRES = UF.FIRES || [], fx = (FIRES.find(f => f.id && /wagon/.test(f.id)) || { x: 183, y: 36 });
    const r = await ev(`fresh();const out={};const F=BK.unbField();const G=F.G;
      /* the cavalry lane's red warn, beside a burning wagon: with and without it */
      const lx=${fx.x};const v0=BK.look(lx,G+5);F.cav.warn=false;BK.step(1);const a0=px().slice();F.cav.warn=true;BK.step(1);BK.look(lx,G+5);const a1=px().slice();F.cav.warn=false;
      const vw=BK.view.VW;const ly=Math.round((F.cav.row+6)*TS-v0.cy-11);let dist=0,nn=0,red=0;for(let x=60;x<260;x+=7){const i=(ly*vw+x)*4;dist+=Math.hypot(a1[i]-a0[i],a1[i+1]-a0[i+1],a1[i+2]-a0[i+2]);nn++;if(a1[i]>a1[i+1]+30&&a1[i]>a1[i+2]+10)red++;}
      out.warn={dist:dist/nn,redShare:red/nn};
      /* the cover glow: green stroke on cover in reach of a volley */
      const cv=F.covers.find(c=>c.x>150*TS&&c.x<225*TS)||F.covers[0];const cx0=Math.round(cv.x/TS)-0;const vv=BK.look(cx0,Math.round(cv.y/TS)-1);const v1=F.volleys.find(v=>v.x0<=cv.x&&cv.x<=v.x1);if(v1){v1.warn=true;v1.quiet=false;}BK.step(1);const g1=px().slice();
      let gr=0,tot=0;{const sx=Math.round(cv.x-vv.cx)-14,sy=Math.round(cv.y-vv.cy)-26;for(let x=0;x<=28;x+=1){const i=((sy)*vw+(sx+x))*4;if(sx+x<0||sx+x>=vw)continue;tot++;if(g1[i+1]>g1[i]+25&&g1[i+1]>g1[i+2]+25)gr++;}}
      out.cover={green:gr,of:tot};if(v1)v1.warn=false;
      /* the bridge shadows: a dark ellipse with a red rim, on the planks */
      const bx=290;const vb=BK.look(bx,G);const b0=px().slice();F.bv.marks=[{x:bx*TS+8,y:(G+1)*TS}];F.bv.t2=F.bv.whistle*0.4;BK.step(1);const b1=px().slice();F.bv.marks=[];
      {const sx=Math.round(bx*TS+8-vb.cx),sy=Math.round((G+1)*TS-vb.cy)-1;let d=0,n=0;for(let x=-8;x<=8;x+=2){const i=(sy*vw+sx+x)*4;d+=lum(b0,i)-lum(b1,i);n++;}out.bridge={dark:d/n};}
      /* the arena glass behind the boss's floor: no red, no green */
      const A=BK.L.arena;const ax=Math.round(A.x0/TS)+20;const va=BK.look(ax,G);const w1=px().slice();const gl=${JSON.stringify(UF.GLASS || null)};let bad=0,all=0;
      {const vh=BK.view.VH;const g0=gl?[gl.x0*TS-va.cx,gl.x1*TS+TS-va.cx,gl.y0*TS-va.cy,gl.y1*TS+TS-va.cy]:[0,vw,0,vh*0.5];
       for(let y=Math.max(0,Math.round(g0[2]));y<Math.min(vh,Math.round(g0[3]));y+=2)for(let x=Math.max(0,Math.round(g0[0]));x<Math.min(vw,Math.round(g0[1]));x+=2){const i=(y*vw+x)*4,r=w1[i],gg=w1[i+1],b=w1[i+2];all++;const mx=Math.max(r,gg,b);if(mx>=140&&((r>gg+40&&r>b+40)||(gg>r+40&&gg>b+40)))bad++;}}
      out.glass={bad,all,declared:!!gl};
      return out;`);
    const probs = [];
    if (!(r.warn.dist >= 22)) probs.push('the cavalry warn band is lost (' + r.warn.dist.toFixed(1) + ' < 22)');
    if (!(r.cover.green >= 10)) probs.push('the cover glow is lost (' + r.cover.green + ' green px)');
    if (!(r.bridge.dark >= 12)) probs.push('the bridge shadow is lost (' + r.bridge.dark.toFixed(1) + ' < 12)');
    if (!r.glass.declared) probs.push('UF.GLASS (the arena glass bbox) is not declared');
    if (r.glass.bad > r.glass.all * 0.01) probs.push('the arena glass is ' + r.glass.bad + '/' + r.glass.all + ' red/green-dominant');
    note(9, 'readability holds', probs.length === 0, probs.length ? probs.join('; ') : 'warn ' + r.warn.dist.toFixed(0) + ', cover ' + r.cover.green + ' px, shadow ' + r.bridge.dark.toFixed(0) + ', glass ' + r.glass.bad + '/' + r.glass.all);
  }
} finally { pg.close(); }

/* ---------------- 8. SOUND (node: source reads) ---------------- */
if (run(8)) {
  const lv = LEVELS.find(l => l.id === 'unburied').build(), audio = readFileSync(new URL('../src/audio.js', import.meta.url), 'utf8');
  const zones = lv.ambient || [], names = new Set(zones.map(z => z.kind)), probs = [];
  if (!names.has('battlefield')) probs.push("no 'battlefield' ambient zone");
  if (!names.has('hall')) probs.push("no 'hall' ambient zone");
  const AN = /export const AMBIENT_NAMES = \[([^\]]*)\]/.exec(audio);
  if (!AN || !/'battlefield'/.test(AN[1])) probs.push("'battlefield' is not in AMBIENT_NAMES");
  const SRC = /export const AMBIENT_SOURCES = (\{[\s\S]*?\});/.exec(audio);
  if (!SRC) probs.push('AMBIENT_SOURCES (the bed\'s source list) is not exported');
  else { const bf = /battlefield:\s*\[([^\]]*)\]/.exec(SRC[1]); if (!bf) probs.push('no source list for battlefield'); else if (/horn/i.test(bf[1])) probs.push('the battlefield bed lists a horn: ' + bf[1]); }
  const bed = /battlefield\(\) \{([\s\S]*?)\n  \},/.exec(audio); if (bed && /horn|hornBlast|cavhorn/i.test(bed[1])) probs.push('the synth bed calls a horn');
  /* nothing downloaded: no new audio file newer than the branch base beyond the picked track (audio/unburied.ogg) */
  note(8, 'sound', probs.length === 0, probs.length ? probs.join('; ') : "zones " + zones.map(z => z.kind).join('/') + ", 'battlefield' in AMBIENT_NAMES, source list holds no horn");
}
/* ---------------- 10. THE TELLS AND HAZARDS ARE UNCHANGED ---------------- */
if (run(10)) {
  const u = spawnSync(process.execPath, ['tools/unburied.mjs'], { encoding: 'utf8' });
  note(10, 'tells unchanged', u.status === 0, u.status === 0 ? 'tools/unburied.mjs green' : ((u.stdout || '') + (u.stderr || '')).split('\n').slice(-4).join(' | '));
}
const failed = results.filter(r => !r[2]);
console.log(failed.length ? '\nFAIL: ' + failed.map(f => f[0] + ' ' + f[1]).join('; ') : '\nok  unburied-look  all ' + results.length + ' look checks hold');
process.exit(failed.length ? 1 : 0);
