// PAGE TOOL: launches headless Chrome
// tools/first-cards-shots.mjs - stills of the first-time cards (claude/onboard2): node tools/first-cards-shots.mjs -> $SHOTS/fc-<id>.png (real fonts)
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
const OUT = process.env.SHOTS || join(ROOT, '..', 'scratch', 'lane-reports', 'first-cards-shots'); mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false, fonts: true, seed: 11 }); const E = e => pg.evalp(e);
const shot = async n => { await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, 'fc-' + n + '.png'), Buffer.from(r.result.data, 'base64')); console.log(n); };
try {
  await E(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.saltForce=true;for(const k in BK.keys)BK.keys[k]=false;BK.setHero('knight');BK.reset({fresh:true});BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.god=true;BK.sim(420);})()`);
  for (const id of ['skills', 'flask', 'slot2', 'levelup', 'hint:oldtusker', 'hint:hornetqueen', 'hint:frog', 'hint:grandmother', 'hint:batteringbeast']) {
    const ok = await E(`(()=>{BKT.PROG.firstCards={};const a=BK.teachAdd('${id}');BK.sim(70);const c=BK.teach().card;return a&&c&&c.id==='${id}'})()`);
    console.log(id, ok); await shot(id.replace(':', '-'));
    await E(`(()=>{BK.teachConfirm();BK.sim(2);BK.state==='card'&&(BK.state='play');})()`);
  }
  console.log('errors', pg.errors.length ? pg.errors.slice(0, 5) : 'none');
} finally { pg.close(); }
