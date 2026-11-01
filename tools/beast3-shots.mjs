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
  ['wall-slam', fight('wallHit', 0.25, P2 + 'S.restT=99;b.x=BBG.wallX(S)-30;b.face=1;S.crack=1;', 484)],
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
    BK.manualSimulation=false;return out;})()`, 900000);
  for (const s of r) { writeFileSync(join(OUT, 'beast3-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log(join(OUT, 'beast3-' + s.tag + '.png')); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
