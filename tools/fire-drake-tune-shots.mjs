// tools/fire-drake-tune-shots.mjs - THE FIRE DRAKE's P2 / P3 stages and the spare -> beaten -> shrine sequence (claude/draketune): one browser, simulated frames,
// god-mode hero. node tools/fire-drake-tune-shots.mjs -> scratch/lane-reports/draketune-*.png, and prints the state at each step (mode, hp, seal stage, ledges, checkpoint).
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: false, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'draketune-' + n + '.png'), Buffer.from(r.result.data, 'base64')); };
const st = async tag => console.log(tag.padEnd(14), JSON.stringify(await E(`(()=>{const b=BK.enemies().find(e=>e.t==='firedrake');return b?{mode:b.mode,hp:Math.round(b.hp),max:Math.round(b.maxHp),alive:b.alive,spent:!!b.spent,fight:BK.bossActive,hero:Math.round(BK.P.hp)}:'noboss';})()`)));
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');window.__IDX=LEVELS.findIndex(l=>l.id==='drakelab');BK.manualSimulation=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.applyUpgrades();BK.load(__IDX);BK.start();BK.god=true;BK.sim(10);})()`);
  await E(`(()=>{const p=BK.players()[0];p.x=19*16;p.y=17*16+15.99;p.vx=0;p.vy=0;p.ground=true;p.face=1;BK.sim(40);p.x=25*16;BK.sim(200);})()`); await st('woke'); await shot('p1');
  const setHp = f => E(`(()=>{const b=BK.enemies().find(e=>e.t==='firedrake');b.hp=b.maxHp*${f};BK.P.inv=99;BK.sim(2);})()`);
  const run = async n => { for (let i = 0; i < n; i += 30) await E('(()=>{BK.P.inv=99;BK.sim(30);})()'); };
  await setHp(0.55); await run(60); await st('P2 tear'); await shot('p2-tear'); await run(180); await st('P2'); await shot('p2');
  await setHp(0.25); await run(60); await st('P3 tear'); await shot('p3-tear'); await run(200); await st('P3'); await shot('p3');
  console.log('ledges after P3', JSON.stringify(await E(`(()=>{const L=BK.L;return (L.arena.ledgeTiles||[]).map(([a,b,r])=>{let n=0;for(let x=a;x<=b;x++)if(L.grid[r*L.W+x]!==0)n++;return [a,b,r,n];});})()`)));
  // spare -> beaten -> shrine: cut it down through the game's hurtEnemy
  await E(`(()=>{const b=BK.enemies().find(e=>e.t==='firedrake');b.hp=40;BK.P.inv=99;for(let i=0;i<4;i++)BKT.hurtEnemy(b,99999,b.x-10,false);})()`); await st('spared'); await shot('spare');
  for (let i = 0; i < 12; i++) { await run(30); await st('t+' + (i + 1) * 0.5 + 's'); if (i === 1) await shot('beaten-lunge'); if (i === 4) await shot('beaten-fall'); }
  await shot('down'); await E(`(()=>{BK.sim(240);})()`); await shot('shrine');
  console.log('checkpoint', JSON.stringify(await E(`(()=>{const c=BK.checkpoint&&BK.checkpoint();return c||BK.L.arena&&BK.L.arena.seal;})()`)));
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
