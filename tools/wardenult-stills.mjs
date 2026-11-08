// tools/wardenult-stills.mjs - STILLS OF THE WARDEN'S REACH (claude/wardenult2). LAUNCHES ONE HEADLESS CHROME (openPage). node tools/wardenult-stills.mjs [outdir]
import { openPage } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const out = process.argv[2] || 'work/wardenult2'; mkdirSync(out, { recursive: true });
const pg = await openPage();
const save = (name, png) => writeFileSync(join(out, name + '.png'), Buffer.from(png.split(',')[1], 'base64'));
try {
  await pg.evalp(`(()=>{
    window.__w=(foe)=>{BK.manualSimulation=true;BK.SET.speed=1;BK.setHero('warden');BK.reset({fresh:true});BKT.setHeroLevel('warden',24);
      BKT.PROG.skillOwned.warden={javelin:true};BKT.PROG.loadouts.warden=['javelin'];BK.applyUpgrades();BK.load(0);BK.state='play';
      BK.enemies().forEach(e=>e.alive=false);BK.ambushes().forEach(a=>a.st='done');const L=BK.L;for(let x=2;x<60;x++)for(let y=1;y<L.H;y++)L.grid[y*L.W+x]=y>=22?1:0;
      BK.tp(20,21);BK.sim(120);BK.P.hp=BK.P.maxHp;BK.god=true;BK.P.inv=0;BK.P.st=BK.P.maxSt;BK.P.face=1;
      if(foe){BK.spawnEnt({t:foe,x:(BK.P.x+70)/16,y:21});const e=BK.enemies().at(-1);e.hp=e.hp0=9999;e.cd=99;}return 1};
    window.__snap=(sc=7,w=110,l=28,up=52)=>{const b=BK.view.buf,P=BK.P,cm=BK.cam,hx=P.x-cm[0],hy=P.y-cm[1],h=up+12,c=document.createElement('canvas');c.width=w*sc;c.height=h*sc;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.drawImage(b,Math.round(hx-l),Math.round(hy-up),w,h,0,0,w*sc,h*sc);return c.toDataURL('image/png')};return 1})()`);
  const info = await pg.evalp(`(()=>{__w(); const v=BK.view; return {VW:v.VW,VH:v.VH, keys:Object.keys(BK.keys||{})}})()`);
  console.log(JSON.stringify(info));
  // a full-view reference to find where the hero stands
  save('00-full', await pg.evalp(`(()=>{BK.step(2);return BK.view.buf.toDataURL('image/png')})()`));
  const S = async (name, js) => { const r = await pg.evalp(`(()=>{${js};return __snap()})()`); save(name, r); };
  // out of the ult: baseline, tether
  await S('01-base-idle', `__w();BK.step(3)`);
  // ULT
  const ult = `__w('sprig');BK.P.vigil=100;BK.keys.up=true;BK.keys.block=true;BK.step(2);BK.keys.up=false;BK.keys.block=false;`;
  await S('02-ult-cast', ult + `BK.step(2)`);
  await S('03-ult-hold', ult + `BK.step(40)`);
  await S('04-ult-run', ult + `BK.step(40);BK.keys.right=true;BK.step(14)`);
  await S('05-ult-jump', ult + `BK.step(40);BK.press('jump');BK.step(10)`);
  for (let b = 0; b < 3; b++) for (let k = 0; k < 7; k++) { const r = await pg.evalp(`(()=>{${ult}BK.step(40);for(let i=0;i<${b};i++){BK.press('atk');BK.step(26);}BK.press('atk');BK.step(${2 + k * 3});return {key:BK.P.lastKey,snap:__snap()}})()`); save('06-ult-thrust' + 'ABC'[b] + '-f' + String(2 + k * 3).padStart(2, '0') + '-' + r.key, r.snap); }
  // throw in the ult
  for (const f of [3, 6, 10, 14]) { const r = await pg.evalp(`(()=>{${ult}BK.step(40);BK.keys.block=true;BK.step(${f});return {key:BK.P.lastKey,snap:__snap()}})()`); save('07-ult-throwhold-f' + String(f).padStart(2, '0') + '-' + r.key, r.snap); }
  for (const f of [2, 5, 9, 14]) { const r = await pg.evalp(`(()=>{${ult}BK.step(40);BK.keys.block=true;BK.step(14);BK.keys.block=false;BK.step(${f});return {key:BK.P.lastKey,snap:__snap(4,200,40,60)}})()`); save('08-ult-throwflight-f' + String(f).padStart(2, '0') + '-' + r.key, r.snap); }
  // pips out of the ult: three tiers
  for (const f of [8, 30, 60, 100]) { const r = await pg.evalp(`(()=>{__w();BK.keys.block=true;BK.step(${f});return {key:BK.P.lastKey,snap:__snap()}})()`); save('09-throwpips-f' + String(f).padStart(3, '0') + '-' + r.key, r.snap); }
  // tether spear (JAVELIN skill: key 'throw')
  for (const f of [2, 6, 12, 22]) { const r = await pg.evalp(`(()=>{__w('sprig');BK.step(2);BK.press('throw');BK.step(${f});return {key:BK.P.lastKey,snap:__snap(4,200,40,60)}})()`); save('10-tether-f' + String(f).padStart(2, '0') + '-' + r.key, r.snap); }
} finally { await pg.close(); }
console.log('done');
