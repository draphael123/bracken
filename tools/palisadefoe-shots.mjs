/* tools/palisadefoe-shots.mjs - real-page stills of THE HORNSMAN (claude/palisadefoe). A pose sheet (every frame, x4, both faces) and the scenes: tower two idle / the horn up (the bar) /
   the blast with the archers ordered (red pennants, the arcs) / the maul tell / the wall-end scaffold / the exam's tower three. Headless Chrome through tools/cdp.mjs, the knight in
   god mode. Writes <OUT>/palisadefoe-<tag>.png (OUT = SHOT_OUT or the lane-reports folder). Not in the suite.   node tools/palisadefoe-shots.mjs [tag,tag]  */
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
const OUT = process.env.SHOT_OUT || join(ROOT, 'audits', 'lane-shots');
const only = process.argv[2] ? new Set(process.argv[2].split(',')) : null;
mkdirSync(OUT, { recursive: true });
const hm = (i, mode, t, more) => `const h=BK.enemies().filter(e=>e.t==='hornsman')[${i}];h.st.mode='${mode}';h.st.t=${t};h.st.hornK=${t === 0 ? 0 : 0.7};h.hp0=h.hp;${more || ''}`;
const ORD = 'for(const a of BK.enemies())if(a.t==="archer")a.ordered=2.2;h.orderFx=0.35;';
const SHOTS = [
  ['wallend', 293, 12, ''], ['tower2', 345, 20, ''], ['tower2-horn', 345, 20, hm(1, 'orderTell', 0.4)], ['tower2-blast', 345, 20, hm(1, 'order', 0.4, ORD)],
  ['tower2-maulTell', 349, 17, hm(1, 'maulTell', 0.3)], ['tower3-exam', 361, 24, hm(2, 'orderTell', 0.4)], ['tower3-blast', 361, 24, hm(2, 'order', 0.4, ORD)], ['yard', 368, 24, ''],
].filter(s => !only || only.has(s[0]) || (only.has('sheet') && false));
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{const {LEVELS}=await import('/src/level.js');const idx=LEVELS.findIndex(l=>l.id==='palisadewood');BK.manualSimulation=true;
    const snap=()=>{const c=document.createElement('canvas');c.width=640;c.height=360;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(BK.buf,0,0,640,360);return c.toDataURL('image/png');};
    const load=()=>{BK.setHero('knight');BK.reset({fresh:true});BK.load(idx);BK.start();BK.god=true;BK.sim(60);};
    const out=[];
    ${only && !only.has('sheet') ? '' : `{const A=(await import('/src/redraw/hornsman_art.js')).bakeHornsman();const n=A.R.length,S=4,w=A.R[0].width,h=A.R[0].height,c=document.createElement('canvas');c.width=n*w*S;c.height=h*S*2+8;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#46506a';g.fillRect(0,0,c.width,c.height);
      for(let i=0;i<n;i++){g.drawImage(A.R[i],i*w*S,0,w*S,h*S);g.drawImage(A.white.R[i],i*w*S,h*S+8,w*S,h*S);}out.push({tag:'poses-sheet',png:c.toDataURL('image/png')});}`}
    for(const [tag,x,y,extra] of ${JSON.stringify(SHOTS)}){load();BK.tp(x,y);BK.sim(300);eval(extra);for(let k=0;k<4;k++)BK.step(1);out.push({tag,png:snap()});}
    BK.manualSimulation=false;return out;})()`, 600000);
  for (const s of r) { writeFileSync(join(OUT, 'palisadefoe-' + s.tag + '.png'), Buffer.from(s.png.split(',')[1], 'base64')); console.log('palisadefoe-' + s.tag + '.png'); }
  if (pg.errors.length) console.log('page errors', pg.errors.slice(0, 3));
} finally { await pg.close(); }
process.exit(0);
