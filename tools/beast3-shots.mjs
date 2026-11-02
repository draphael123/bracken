/* tools/beast3-shots.mjs [only,tags] - real-page stills of THE BATTERING BEAST 3 (claude/beast3, Daniel 11-01): the war-ox look, THE VOLLEY ORDER (the horn up + the lanes,
   the arrows coming down), THE WALL BREAKER (the turn + its run line, the slam, the breach + rubble step + rolling timbers), a pose sheet of every frame (3x) and a side by
   side with OLD TUSKER (3x). Headless Chrome through tools/cdp.mjs, the knight in god mode. Writes OUT (default scratch/lane-reports/beast3-shots beside the worktrees) beast3-<tag>.png.
   Not in the suite.   PORT=<port> node tools/beast3-shots.mjs [tags] [outdir] */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.argv[3] || join(ROOT, '..', 'scratch', 'lane-reports', 'beast3-shots');
const only = process.argv[2] && process.argv[2] !== 'all' ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
/* in the clearing (cols 454-498, floor row 25): the hero west of middle, the fight woken; then a mode forced on him (and what the mode needs) */
const fight = (m, t, extra = '', hx = 462) => `BK.tp(${hx},24);BK.sim(240);const b=BK.boss;const H=BK.batteringBeastHands();const S=H&&H.show();if(b&&S){S.lanes=[];S.timbers=[];S.stakes=[];S.pots=[];S.fires=[];S.adds.forEach(a=>a.alive=false);b.hp=b.maxHp;b.x=482*16;b.face=-1;b.mode='${m}';b.modeT=${t};${extra}}`;
const P2 = `S.ph=2;b.phase=2;S.harness.cut=true;`;
const SHOTS = [
  ['look-walk', fight('walk', 0.5, 'S.restT=99;')],
  ['volley-horn', fight('orderTell', 0.55, 'S.restT=99;S.lanes=BBG.orderLanes(S,BK.P.x,901);for(const q of S.lanes)q.t-=0.55;')],
  ['volley-arrows', fight('order', 0.6, 'S.restT=99;S.lanes=BBG.orderLanes(S,BK.P.x,902);for(const q of S.lanes)q.t-=1.32;')],
  ['volley-lost', fight('lost', 0.9, 'S.restT=99;S.horn.hits=1;')],
  ['wall-tell', fight('wallTell', 0.6, P2 + 'S.restT=99;b.x=474*16;b.face=1;', 480)],
  ['wall-slam', fight('wallHit', 0.42, P2 + 'S.restT=99;b.x=BBG.wallX(S)-30;b.face=1;S.crack=1;', 497)],
  ['wall-breach', fight('recover', 9, P2 + 'S.restT=99;S.breach=1;BK.batteringBeastHands();b.x=BBG.wallX(S)-BBG.BB.wall.rubble*16-30;b.face=1;H.rubble(true);S.timbers.push({x:466*16,d:0,fall:0,key:"a",rot:1},{x:476*16,d:0,fall:0,key:"b",rot:2.5},{x:BBG.wallX(S)-10,d:0.3,fall:0.25,key:"c"});', 497)],
  ['p2-flail', fight('flailTell', 0.4, P2 + 'S.restT=99;S.breach=1;')],
].filter(s => !only || only.has(s[0]));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const LV=(await import('/src/level.js')).LEVELS;const idx=LV.findIndex(l=>l.id==='palisadewood');BK.manualSimulation=true; const BBG=await import('/src/battering-beast.js');
    const snap=(src,w,h)=>{const c=document.createElement('canvas');c.width=w||640;c.height=h||360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src||BK.buf,0,0,c.width,c.height);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(60);};
    const zoom=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const W=BK.buf.width,k=W/640,b=BK.boss,[cx,cy]=BK.cam,bx=b?b.x-cx:320,by=b?b.y-cy:240;g.drawImage(BK.buf,Math.max(0,Math.min(W-320*k,(bx-160)*k)),Math.max(0,(by-130)*k),320*k,180*k,0,0,640,360);return c.toDataURL('image/png');};load();BK.sim(120);const out=[];for(const [tag,extra] of ${JSON.stringify(SHOTS)}){load();eval(extra);{const b=BK.boss,S=BK.batteringBeastHands().show();if(b&&b.phase===2){const keep={m:b.mode,t:b.modeT,x:b.x,f:b.face},tb=JSON.stringify(S.timbers);for(let k=0;k<150;k++){BK.step(1);b.mode=keep.m;b.modeT=keep.t;b.x=keep.x;b.face=keep.f;S.timbers=JSON.parse(tb);BK.P.hp=BK.P.maxHp;}}}for(let k=0;k<3;k++)BK.step(1);out.push({tag,png:snap()});out.push({tag:tag+'-zoom',png:zoom()});}
    /* THE POSE SHEET: every frame of him, 3x, named */
    if(${!only || only.has('poses')}){ const B=await import('/src/redraw/battering_beast_art.js'); const modes=Object.keys(B.POSES); const cols=6, cw=B.CW*2, ch=B.CH*2+12, c=document.createElement('canvas'); c.width=cols*cw; c.height=Math.ceil(modes.length/cols)*ch; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#6a5a48'; g.fillRect(0,0,c.width,c.height);
      modes.forEach((m,i)=>{const x=(i%cols)*cw, y=Math.floor(i/cols)*ch; g.drawImage(B.frame(m,false,0,1),x,y+12,cw,B.CH*2); g.fillStyle='#fff6e0'; g.font='10px monospace'; g.fillText(m,x+4,y+10);});
      out.push({tag:'poses',png:c.toDataURL('image/png')}); }
    /* SIDE BY SIDE: the war-ox (walk + charge tell) and OLD TUSKER (walk + charge tell), 3x */
    if(${!only || only.has('vs-tusker')}){ const B=await import('/src/redraw/battering_beast_art.js'), OA=await import('/src/redraw/old_tusker_art.js'), OH=await import('/src/old-tusker-hands.js');
      const c=document.createElement('canvas'); c.width=960; c.height=640; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#7a6a50'; g.fillRect(0,0,960,640); g.fillStyle='#4a3a28'; g.fillRect(0,296,960,4); g.fillRect(0,616,960,4);
      g.fillStyle='#fff6e0'; g.font='14px monospace'; g.fillText('THE BATTERING BEAST 3 (war-ox)',10,18); g.fillText('OLD TUSKER (Lumber Trail)',10,338);
      [['walk',0],['chargeTell',480]].forEach(([m,x])=>{ const f=B.frame(m,false,0,1); g.drawImage(f,x+240-B.AX*3,296-B.AY*3,B.CW*3,B.CH*3); });
      const A=OA.BOAR_ANCHOR; [['walk',0],['chargeTell',480]].forEach(([m,x])=>{ const p=OH.POSE[m]||OH.POSE.walk||Object.values(OH.POSE)[0]; const f=OA.boarSprite(m,p,0,1,false); g.drawImage(f,x+240-A.ax*3,616-A.ay*3,A.w*3,A.h*3); });
      out.push({tag:'vs-tusker',png:c.toDataURL('image/png')}); }
    /* (claude/beast3art) THE ART SHEETS: close-ups of every baked piece, 3-6x, on the clearing's brown (tag 'art') */
    if(${!only || only.has('art')}){ const B=await import('/src/redraw/battering_beast_art.js');
      const sheet=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#6a5a48';g.fillRect(0,0,w,h);fn(g);return c;};
      const big=(src,k)=>{const c=document.createElement('canvas');c.width=src.width*k;c.height=src.height*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(src,0,0,c.width,c.height);return c;};
      const lab=(g,t,x,y)=>{g.fillStyle='#fff6e0';g.font='11px monospace';g.fillText(t,x,y);};
      const crop=(fr,x,y,w,h,k)=>{const c=document.createElement('canvas');c.width=w*k;c.height=h*k;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(fr,x,y,w,h,0,0,w*k,h*k);return c;};
      const sh1=sheet(1230,820,g=>{
        const put=(m,cut,st,x,y,t)=>{const fr=B.frame(m,cut,st,1,false);g.drawImage(crop(fr,10,0,130,90,3),x,y);lab(g,t,x+4,y+12);};
        put('walk',false,0,0,0,'walk f0'); put('walk',false,1,410,0,'walk f1'); put('walk',true,1,820,0,'walk P2 (torn banner)');
        put('orderTell',false,0,0,270,'orderTell f0'); put('orderTell',false,1,410,270,'orderTell f1'); put('order',false,0,820,270,'order (blast)');
        put('lost',false,0,0,540,'lost f0'); put('lost',false,1,410,540,'lost f1'); put('wallBack',false,0,820,540,'wallBack (winded)'); });
      out.push({tag:'art-beast',png:sh1.toDataURL('image/png')});
      const sh2=sheet(1200,800,g=>{
        lab(g,'archer idle / draw / loose (4x)',6,12);
        [['idle',0],['draw',1],['loose',2]].forEach(([p,i])=>{const c=sheet(70,60,gg=>{B.drawArcher(gg,35,56,1,p,0.3);});g.drawImage(big(c,4),i*290+10,20);});
        lab(g,'rubble stage 1 / 2 (3x)',6,280);
        [1,2].forEach((st,i)=>{const c=sheet(120,50,gg=>B.drawRubble(gg,20,84,44,st));g.drawImage(big(c,3),i*390+10,290);});
        lab(g,'timber rot 0 / 1.2 / 2.4, dust trail (6x / 4x)',6,460);
        [0,1.2,2.4].forEach((r,i)=>{const c=sheet(24,24,gg=>B.drawTimber(gg,12,12,r,0));g.drawImage(big(c,6),i*160+10,470);});
        const c2=sheet(110,40,gg=>{B.drawDustTrail(gg,10,34,0.4);B.drawTimber(gg,10,24,0,0);});g.drawImage(big(c2,4),500,470);
        lab(g,'lane wave 1 / wave 2 (3x), arrow in flight + stuck (3x)',6,650);
        [['#ff4a2a',0],['#ff9a5c',1]].forEach(([col,i])=>{const c=sheet(120,44,gg=>B.drawLane(gg,6,114,42,col,true,false));g.drawImage(big(c,3),i*370+10,660);});
        const c3=sheet(24,60,gg=>{B.drawArrow(gg,8,40);B.drawArrowStuck(gg,18,56,1);});g.drawImage(big(c3,3),760+10,600);
      });
      out.push({tag:'art-clearing',png:sh2.toDataURL('image/png')});
      const sh3=sheet(1300,520,g=>{
        lab(g,'THE HORNSMAN FALLS  t = 0, .12, .25, .4, .55, .7, 1.0, 1.4 (2x)',6,12);
        [0,0.12,0.25,0.4,0.55,0.7,1.0,1.4].forEach((t,i)=>{const c=sheet(80,110,gg=>{gg.fillStyle='#5a4a38';gg.fillRect(0,88,80,22);B.drawHornsmanFall(gg,52,56,1,t,98);});g.drawImage(big(c,2),i*160+4,20);});
        lab(g,'drawEnd: whole / cracked / leaning / breach 1 / breach 2 (2x)',6,260);
        [[0,0,0],[0,1,0],[0,1,1],[1,1,0],[2,1,0]].forEach(([br,cr,ln],i)=>{const c=sheet(110,100,gg=>B.drawEnd(gg,6,96,0.4,br,cr,ln));g.drawImage(big(c,2),i*250+4,270);});
      });
      out.push({tag:'art-fall-end',png:sh3.toDataURL('image/png')}); }
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'beast3-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(join(OUT, 'beast3-' + s.tag + '.png')); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
