/* tools/demo-end-page.mjs - THE END CARD ON THE PAGE (claude/demoend; headless, ONE browser; not in the suite yet): ?demo=1, Kingswood won -> the win card -> Z -> state demoend + the card (5 buttons, follow line);
   Down + Enter opens the feedback form, Esc closes it; KEEP YOUR PROGRESS makes a tagged file; CREDITS and Esc come back; BACK TO THE MAP; flag off: no card. usage: node tools/demo-end-page.mjs <shotDir> */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const OUT = process.argv[2]; mkdirSync(OUT, { recursive: true });
const pg = await openPage({ audio: false });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shot = async n => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + n + '.png', Buffer.from(r.data || r.result.data, 'base64')); };
const run = async (demo) => {
  const origin = await pg.evalp('location.origin');
  await pg.send('Page.navigate', { url: origin + '/' + (demo ? '?demo=1' : '') });
  for (let i = 0; i < 120; i++) { const ok = await pg.evalp('typeof window.BK === "object" && !!window.BK.lookPass').catch(() => false); if (ok) break; await sleep(250); }
  return pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const ki = LEVELS.findIndex(l => l.id === 'kings');
    BK.setHero('knight'); BK.reset({ fresh: true }); BK.load(ki); BK.start(); BK.sim(10); BK.coopSave.win(); BK.sim(5);
    const st1 = BK.state; BK.press('confirm'); BK.sim(5); await new Promise(r => setTimeout(r, 150));
    const card = document.getElementById('demoend');
    return { demo: ${demo}, st1, st2: BK.state, card: !!card, text: card ? card.innerText : null, buttons: card ? [...card.querySelectorAll('button')].map(b => b.id + ':' + b.textContent) : null, focus: document.activeElement && document.activeElement.id,
    teaser: card ? card.querySelectorAll('.tz canvas').length : 0, tzPainted: card ? [...card.querySelectorAll('.tz canvas')].every(c => c.width === 64 && c.getContext('2d').getImageData(1, 1, 1, 1).data[3] === 255) : false,
    follow: card && card.querySelector('#defollowbtn') ? { text: card.querySelector('#defollowbtn').textContent, disabled: card.querySelector('#defollowbtn').disabled, links: card.querySelectorAll('a[href]').length } : null }; })()`);   /* (demoend2) 5 vignettes painted; the follow button is shut + no <a> while FOLLOW_URL is blank (OWED browser run) */
};
try {
  const a = await run(true); console.log(JSON.stringify(a, null, 1));
  await sleep(200); await shot('endcard');
  // keyboard: Down walks to feedback, Z opens the form
  const key = async k => { const code = { ArrowDown: 40, ArrowUp: 38, Escape: 27, z: 90, Enter: 13 }[k]; for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code }); await sleep(120); };
  await key('ArrowDown'); const f1 = await pg.evalp('document.activeElement.id'); await key('Enter'); const fb = await pg.evalp('!!document.getElementById("fbform")');
  await shot('endcard-feedback'); await key('Escape'); const fbGone = await pg.evalp('!document.getElementById("fbform")');
  const st = await pg.evalp('BK.state');
  console.log(JSON.stringify({ afterDown: f1, feedbackOpened: fb, feedbackClosedByEsc: fbGone, stateStill: st }));
  // KEEP YOUR PROGRESS: capture the download text via a patched createObjectURL
  const keep = await pg.evalp(`(async()=>{ let blob=null; const o=URL.createObjectURL; URL.createObjectURL=b=>{blob=b;return o.call(URL,b)}; document.getElementById('dekeep').click(); await new Promise(r=>setTimeout(r,100)); const t = blob? await blob.text():null; return { msg: document.querySelector('#demoend .demsg').textContent, tag: t? JSON.parse(t).demoSave : null, len: t&&t.length }; })()`);
  console.log(JSON.stringify(keep));
  // credits and back
  await pg.evalp('document.getElementById("decredits").click()'); const c1 = await pg.evalp('BK.state'); await shot('endcard-credits'); await key('Escape'); const c2 = await pg.evalp('BK.state + " card=" + (document.getElementById("demoend").style.display!=="none")');
  console.log('credits ->', c1, 'then ESC ->', c2);
  await pg.evalp('document.getElementById("demap").click()'); console.log('map button ->', await pg.evalp('BK.state + " card=" + !!document.getElementById("demoend")'));
  const b = await run(false); console.log(JSON.stringify(b));
  console.log('errors', JSON.stringify(pg.errors || []));
} finally { await pg.close(); }
