/* tools/unburied-aloft.mjs - NOTHING IN THE UNBURIED FIELD HANGS IN THE AIR (claude/unburied4, Daniel's playtest 10-05: "this is floating" - a
   cart wheel in the sky beside the toppled tower, the gatehouse gallery over an empty arch, the Death Knight's tomb slabs on corbels over nothing).
   WHY A NEW CHECK. tools/unburied-look.mjs 2 let a ledge pass when a set piece CLAIMED to hold it (UF.SETPIECES holds: true): the claim was the art's
   word for itself, and all three of Daniel's floating things sat inside a claimed box. This check takes nobody's word. It looks at the real frame with
   the backdrop painted one flat colour and then another (BK.hide.back): wherever the two frames differ, the SKY shows through - nothing stands there.
     A  EVERY LEDGE STANDS ON SOMETHING   each end of every ONEWAY / PLANK run of the built level is keyed into rock (a solid tile under it, or a short
                                         step against a wall), or stands on a STRUCTURE (L.structures: a trestle, a pier) that reaches rock, or on a thing
                                         in the PLAY layer (deco, structures - not the wall painted far behind) drawn all the way down from it to rock;
                                         or, failing all that, sits on a wall (UF.WALLS: the curtain wall, the gatehouse). And a walk of six tiles or more that is
                                         not on structures must have something under ALL of it: the sky never shows through a third of the two rows
                                         under it for more than 20 px (a deck over an open arch is a deck in the air).
     B  EVERY PROP IS HELD UP             the scenery alone (what covers the sky with deco, facades and structures on, and not with them off) is cut into
                                         connected pieces; every piece wholly on screen must come down to a standing surface (within 4 px above a
                                         non-air tile). A wheel painted into the sky beside a tower is a piece of its own that touches nothing.
   Run: PORT=<free port> node tools/unburied-aloft.mjs [A] [B]                                                                                     */
import { openPage } from './cdp.mjs';
import { LEVELS } from '../src/level.js';
import { UF } from '../src/unburied-field.js';

const want = process.argv.slice(2).map(s => s.toUpperCase()), run = k => !want.length || want.includes(k);
const BUILT = LEVELS.find(l => l.id === 'unburied').build();
const fails = [];
const note = (k, name, ok, detail) => { if (!ok) fails.push(k); console.log((ok ? '  ok   ' : '  FAIL ') + k + ' ' + name.padEnd(32) + (detail || '')); };
const PRELUDE = `const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.SET.hud='minimal';BK.SET.weather=false;
  const fi=LEVELS.findIndex(l=>l.id==='unburied');
  const fresh=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(fi);BK.state='play';BK.god=true;BK.sim(260);BK.step(1);for(const e of BK.enemies())e.alive=false;BK.hideHero=true;};
  const TS=16;const px=()=>{const c=BK.view.buf;return c.getContext('2d').getImageData(0,0,c.width,c.height).data.slice();};
  /* SKY: 1 where the backdrop shows through the frame at (x, y) with the given scenery layers off */
  const sky=(x,y,off)=>{const H=BK.hide;H.deco=!!off.deco;H.facades=off.facades||false;H.structures=!!off.structures;H.back='#ff00ff';const v=BK.look(x,y);const a=px();H.back='#00ff00';BK.look(x,y);const b=px();
    H.back=false;H.deco=H.facades=H.structures=false;const n=a.length/4,m=new Uint8Array(n);for(let i=0;i<n;i++){const k=i*4;if(Math.abs(a[k]-b[k])+Math.abs(a[k+1]-b[k+1])+Math.abs(a[k+2]-b[k+2])>300)m[i]=1;}return {v,m};};`;
const pg = await openPage({ audio: false });
const ev = (body, t = 1200000) => pg.evalp(`(async()=>{${PRELUDE}\n${body}\n})()`, t);
try {
  /* the backdrop switch is honoured: on the first screen the sky shows somewhere (a page without BK.hide.back would make every frame 'covered' and pass everything) */
  { const n = await ev(`fresh();const S=sky(4,36,{});let n=0;for(const q of S.m)n+=q;BK.hideHero=false;return n;`);
    note('0', 'the sky can be seen', n > 2000, n + ' px of sky on the first screen'); if (!(n > 2000)) throw new Error('BK.hide.back is not honoured: nothing here can be measured'); }
  /* ---------------- A. EVERY LEDGE STANDS ON SOMETHING ---------------- */
  if (run('A')) {
    const W = BUILT.W, H = BUILT.H, g = BUILT.grid, runs = [];
    for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const t = g[y * W + x]; if (t === 2 || t === 8) { let x1 = x; while (x1 + 1 < W && (g[y * W + x1 + 1] === 2 || g[y * W + x1 + 1] === 8)) x1++; runs.push([x, x1, y]); x = x1 + 1; } else x++; } }
    const rock = (x, y) => x >= 0 && x < W && y < H && [1, 4, 7, 15].includes(g[y * W + x]);   /* SOLID, SOFT, PALISADE, the field's masonry */
    const keyed = (x, y) => rock(x, y + 1) || rock(x, y + 2) || rock(x - 1, y) || rock(x + 1, y);
    const floorUnder = (x, y) => { for (let r = y + 1; r < H; r++) if (rock(x, r)) return r; return H; };
    const structs = BUILT.structures || [];
    const onStruct = (x, y) => structs.some(z => x >= z.x0 && x <= z.x1 && z.top >= y && z.top <= y + 2 && z.floor >= floorUnder(x, y) - 1);
    const WALLS = UF.WALLS || [];
    const onWall = (x, y) => WALLS.some(([x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 - 1 && y <= y1);
    /* an end is held when it, or the column one in from it (a plank may overhang its post by a tile), is held */
    const jobs = runs.filter(([x0, x1, y]) => !(x1 - x0 <= 3 ? (keyed(x0, y) || keyed(x1, y)) : (keyed(x0, y) && keyed(x1, y)))).map(([x0, x1, y]) => ({ x0, x1, y,
      ends: [x0, x1].filter(x => !keyed(x, y)).map(x => { const cols = [x, x === x0 ? Math.min(x1, x + 1) : Math.max(x0, x - 1)]; return { x, cols: cols.map(c => ({ c, struct: onStruct(c, y), wall: onWall(c, y), floor: floorUnder(c, y) })) }; }) }));
    const r = await ev(`const jobs=${JSON.stringify(jobs)},BACKWALLS=${JSON.stringify(UF.BACKWALLS || ['ubwall', 'ubnave', 'ubapse', 'ubstandard'])};fresh();const out=[];let held=0;
      for(const j of jobs){let byStruct=true,bad=false;
        for(const e of j.ends){let ok=false,best=0;
          if(!e.cols.some(q=>q.struct))byStruct=false;
          for(const q of e.cols){if(q.struct){ok=true;break;}
            /* a thing in the PLAY layer drawn from under it down to rock: sky with the facades off, minus sky with everything off */
            const A=sky(q.c,j.y,{facades:BACKWALLS}),B=sky(q.c,j.y,{facades:true,deco:true,structures:true});const vw=BK.view.VW,vh=BK.view.VH;
            for(let wx=q.c*TS+1;wx<(q.c+1)*TS-1;wx++){const sx=wx-A.v.cx;if(sx<0||sx>=vw)continue;let cov=0,n=0;for(let wy=(j.y+1)*TS;wy<q.floor*TS;wy++){const sy=wy-A.v.cy;if(sy<0||sy>=vh)continue;n++;const i=sy*vw+sx;if(!A.m[i]||!B.m[i])cov++;}if(n)best=Math.max(best,cov/n);}
            if(best>=0.85){ok=true;break;}
            if(q.wall){ok=true;break;}}
          if(ok)held++;else{bad=true;out.push(j.x0+'-'+j.x1+'@'+j.y+' (nothing under its end at '+e.x+': '+Math.round(best*100)+'% drawn down to rock)');}}
        if(bad||byStruct||j.x1-j.x0<5)continue;
        /* A WALK (six tiles or more) THAT IS NOT ON STRUCTURES: what holds it must stand under all of it - nowhere does the sky show through a third of the two rows under it for more than 20 px (the gatehouse gallery crossed the open gap over the gate arch on the strength of the two towers either side) */
        let worst=0,at=0;for(const cx0 of [...new Set([j.x0,Math.round((j.x0+j.x1)/2),j.x1])]){const S=sky(cx0,j.y,{});const vw=BK.view.VW,vh=BK.view.VH;let runPx=0;
          for(let wx=j.x0*TS;wx<(j.x1+1)*TS;wx++){const sx=wx-S.v.cx;if(sx<0||sx>=vw){runPx=0;continue;}let open=0,n=0;for(let wy=(j.y+1)*TS+1;wy<(j.y+3)*TS;wy+=2){const sy=wy-S.v.cy;if(sy<0||sy>=vh)continue;n++;if(S.m[sy*vw+sx])open++;}
            if(n&&open*3>=n){runPx++;if(runPx>worst){worst=runPx;at=Math.floor(wx/TS);}}else runPx=0;}}
        if(worst>20)out.push(j.x0+'-'+j.x1+'@'+j.y+' (a walk with the sky under it for '+worst+' px at col '+at+')');}
      BK.hideHero=false;return {out,held};`);
    note('A', 'every ledge stands on something', r.out.length === 0, runs.length + ' ledge runs (' + (runs.length - jobs.length) + ' keyed into rock, ' + r.held + ' ends held up), ' + r.out.length + ' on nothing' + (r.out.length ? ': ' + r.out.join('; ') : ''));
  }
  /* ---------------- B. EVERY PROP IS HELD UP ---------------- */
  if (run('B')) {
    const spots = []; for (let x = 4; x < BUILT.W - 4; x += 15) spots.push([x, null]);
    spots.push([240, 30], [250, 24], [252, 20], [262, 21], [266, 24], [344, 24], [358, 23], [362, 30]);
    const r = await ev(`const spots=${JSON.stringify(spots)};fresh();const l=BK.L,W=l.W,H=l.H,gr=l.grid;
      const ground=x=>{for(let y=18;y<H;y++){const q=gr[y*W+x];if(q!==0&&q!==3&&gr[(y-1)*W+x]===0)return y-1;}return H-3;};
      const surf=(wx,wy)=>{for(let d=0;d<=4;d+=2){const tx=Math.floor(wx/TS),ty=Math.floor((wy+d)/TS);if(tx<0||ty<0||tx>=W||ty>=H)continue;const q=gr[ty*W+tx];if(q!==0&&q!==6)return true;}return false;};   /* 6: NET - a rope is not a floor */
      const out=[];const seen=new Set();
      for(const [x,y0] of spots){const y=y0===null?ground(x):y0;const A=sky(x,y,{}),B=sky(x,y,{deco:true,facades:true,structures:true});const vw=BK.view.VW,vh=BK.view.VH,N=vw*vh,m=new Uint8Array(N);for(let i=0;i<N;i++)if(B.m[i]&&!A.m[i])m[i]=1;
        const lab=new Int32Array(N).fill(-1);let id=0;
        for(let s=0;s<N;s++){if(!m[s]||lab[s]>=0)continue;const st=[s];lab[s]=id;let n=0,edge=false,touch=false,x0=1e9,x1=-1,y1=-1,yy0=1e9;
          while(st.length){const p=st.pop();n++;const qx0=p%vw,qy0=(p/vw)|0;if(qx0<=1||qy0<=52||qx0>=vw-2||qy0>=vh-2)edge=true;   /* (the top band is the HUD's: the timer and the plates cut a piece that reaches into them) */x0=Math.min(x0,qx0);x1=Math.max(x1,qx0);yy0=Math.min(yy0,qy0);y1=Math.max(y1,qy0);
            if(!touch&&surf(qx0+A.v.cx,qy0+A.v.cy+1))touch=true;
            for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const qx=qx0+dx,qy=qy0+dy;if(qx<0||qy<0||qx>=vw||qy>=vh)continue;const q=qy*vw+qx;if(m[q]&&lab[q]<0){lab[q]=id;st.push(q);}}}   /* a few pixels of gap (a dark spoke, an outline, a one-pixel pole) do not cut a piece in two */
          id++;if(n<60||y1-yy0<8||edge||touch)continue;   /* (a sliver - a row of shrouds under the mud's skin, a lit edge - is not a prop) */
          const wx=Math.round((x0+x1)/2+A.v.cx),wy=Math.round(y1+A.v.cy),key=Math.round(wx/24)+','+Math.round(wy/24);if(seen.has(key))continue;seen.add(key);
          out.push('a '+(x1-x0+1)+'x'+(y1-yy0+1)+' px piece at col '+(wx/TS).toFixed(1)+', its foot at row '+(wy/TS).toFixed(1));}}
      BK.hideHero=false;return out;`);
    note('B', 'every prop is held up', r.length === 0, spots.length + ' screens; ' + r.length + ' pieces in the air' + (r.length ? ': ' + r.join('; ') : ''));
  }
} finally { pg.close(); }
console.log(fails.length ? '\nFAIL unburied-aloft: ' + fails.join(', ') : '\nok  unburied-aloft  nothing in the field hangs in the air');
process.exit(fails.length ? 1 : 0);
