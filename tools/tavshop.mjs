// PAGE TOOL: launches headless Chrome
// tools/tavshop.mjs - THE BAR STORE (claude/tavshop, Daniel 11-04: the store is reachable inside the tavern). One headless browser, four runs:
// desktop and 812x375 touch, demo flag off and on. Each: stand at the bar, the prompt, USE opens THE ONE STORE, buying is allowed, ESC returns to the same spot.
//   node tools/tavshop.mjs [outdir]       (writes shots when an outdir is given)
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { STATIONS } from '../src/tavern.js';
const OUT = process.argv[2]; if (OUT) mkdirSync(OUT, { recursive: true });
let bad = 0; const ok = (c, m) => { console.log((c ? '  ok   ' : '  FAIL ') + m); if (!c) bad++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pg = await openPage({ audio: false, fonts: false });
const E = (e, t = 120000) => pg.evalp(e, t);
const sx = STATIONS.find(s => s.id === 'store').x;
const shot = async n => { if (!OUT) return; await E('BK.draw1()'); const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(OUT + '/' + n + '.png', Buffer.from((r.result || r).data, 'base64')); };
const goto = async q => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?nosw' + q }); await sleep(1500); for (let i = 0; i < 160 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300); await sleep(1000); };
try {
  for (const touch of [false, true]) for (const demo of [false, true]) {
    const tag = (touch ? 'touch' : 'desk') + '-demo' + (demo ? 'on' : 'off'); console.log(tag);
    if (touch) { await pg.send('Emulation.setDeviceMetricsOverride', { width: 812, height: 375, deviceScaleFactor: 2, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } }); await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 }); }
    else { await pg.send('Emulation.clearDeviceMetricsOverride', {}); await pg.send('Emulation.setTouchEmulationEnabled', { enabled: false }); }
    await goto((touch ? '&touch=1' : '') + (demo ? '&demo=1' : ''));
    await E(`(async()=>{BK.manualSimulation=true;BK.SET.speed=1;BK.coopEnd();BK.reset({fresh:true});BK.tavern.record(null);BK.tavern.p1Pad(null);await BK.tavern.enter();BK.sim(10);
      const p=BK.players()[0];for(let i=0;i<60;i++){p.x=${sx}*16+8;p.y=20*16;p.vx=p.vy=0;BK.sim(1);}BKT.PROG.coins=5000;BK.step(12);for(let i=0;i<30;i++){p.x=${sx}*16+8;p.y=20*16;p.vx=p.vy=0;BK.sim(1);}BK.sim(660);for(let i=0;i<30;i++){p.x=${sx}*16+8;p.y=20*16;p.vx=p.vy=0;BK.sim(1);}BK.step(2);return 1;})()`);
    const near = await E('BK.tavern.debug().near'); ok(near.some(n => n.s === "store"), "standing at the bar: the nearest station is the store " + JSON.stringify(near) + await E('JSON.stringify([BK.players()[0].x,BK.players()[0].ground,BK.players()[0].dead,BK.players()[0].down,BK.players()[0].walkIn,BK.players()[0].ptH,BK.players()[0].ptF])'));
    await shot(tag + '-1-bar');
    const x0 = await E('BK.players()[0].x');
    if (touch) {
      await E('BK.padLast=false;BK.touch.relayout();BK.touch.keyUsed();BK.touch.tick(0.2);BK.touch.draw();BK.touch.tick(0.2);BK.touch.draw();BK.draw1()');
      const d = await E('(()=>{const d=BK.touch.debug();return {verb:d.verb,btn:d.buttons.map(b=>Object.assign({},b))};})()');
      ok(d.verb && /STORE/.test(d.verb.verb || ''), 'the touch USE button reads STORE: ' + JSON.stringify(d.verb));
      const bt = d.btn.find(b => b.k === 'interact');
      const bx0 = bt.x != null ? bt.x : bt.cx, by0 = bt.y != null ? bt.y : bt.cy, rr = bt.r || 0;
      const [ax, ay] = await E(`BK.touch.displayToClient(${bx0 - rr},${by0 - rr})`), [bx, by] = await E(`BK.touch.displayToClient(${bx0 + rr},${by0 + rr})`);
      ok(Math.min(bx - ax, by - ay) * 1.12 >= 44, 'the USE button hit zone (drawn x1.12 slop, src/touch.js) is >= 44 CSS px: drawn ' + Math.round(bx - ax) + 'x' + Math.round(by - ay) + ' (' + JSON.stringify(bt) + ')');
      const cx = (ax + bx) / 2, cy = (ay + by) / 2;
      await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 7 }] }); await sleep(80); await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x: cx, y: cy, id: 7 }] }); await sleep(100); await E('BK.sim(3);BK.step(2)');
    } else { await E('BK.press("talk");BK.step(2)'); }
    const s1 = await E('({st:BK.state,back:BK.ui.storeBack,tabs:BK.ui.tabs()})');
    ok(s1.st === 'store' && s1.back === 'play', 'USE opens the store, back = play: ' + JSON.stringify(s1));
    await E('BK.step(3)'); await shot(tag + '-2-store');
    /* the same stock as the map's store; buying is allowed here (the bar is a shop) */
    const rows = await E('JSON.stringify(BK.ui.storeRows())');
    await E('BK.ui.storeOpen("map","heroes");BK.step(1)'); const rowsMap = await E('JSON.stringify(BK.ui.storeRows())');
    ok(rows === rowsMap, 'the stock is the map store\'s stock (' + rows.length + ' chars)');
    await E('BK.ui.storeOpen("play","heroes");BK.step(1)');
    const bought = await E(`(()=>{const R=JSON.parse(BK.ui.storeRows?JSON.stringify(BK.ui.storeRows()):'[]');const ti=R.findIndex(r=>r.id==='skins');const ri=R[ti].rows.findIndex(r=>r.state==='buy');BK.ui.storeTab=ti;BK.ui.storeI=ri;BK.step(2);const c0=BKT.PROG.coins;BK.press('confirm');BK.sim(1);return {c0,c1:BKT.PROG.coins,ri};})()`);
    ok(bought.c1 < bought.c0, 'buying works at the bar (coins spent): ' + JSON.stringify(bought));
    await E('BK.ui.storeOpen("play","heroes");BK.step(1)');
    await E('BK.press("pause");BK.step(2)');
    const s2 = await E('({st:BK.state,tav:!!(BK.L&&BK.L.tavern),x:BK.players()[0].x})');
    ok(s2.st === 'play' && s2.tav && Math.abs(s2.x - x0) < 3, 'ESC returns to the tavern at the same spot: ' + JSON.stringify(s2) + ' was ' + Math.round(x0));
    await shot(tag + '-3-back');
    const errs = pg.errors && pg.errors.length; if (errs) console.log('   page errors:', JSON.stringify(pg.errors).slice(0, 400));
  }
} finally { await pg.close(); }
console.log(bad ? 'tavshop: ' + bad + ' FAIL' : 'tavshop: OK'); process.exit(bad ? 1 : 0);
