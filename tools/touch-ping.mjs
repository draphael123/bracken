// PAGE TOOL: launches headless Chrome
/* tools/touch-ping.mjs - THE PING PILL ON A PHONE (claude/coopproof): emulated landscape phone, a 2-seat wood. The PING button appears only in a party,
   fits the safe area, overlaps no other button or the stick zone, in both presets, either hand, at the three sizes, beside the ranger's stance
   button and under a notch; a real touch on it marks (BK.pings) and a solo wood has no pill. PORT=8789 node tools/touch-ping.mjs */
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false }), fails = [], sleep = ms => new Promise(r => setTimeout(r, ms)), E = (x, t = 60000) => pg.evalp(x, t);
const ok = (c, m) => { if (!c) { fails.push(m); console.log('  FAIL ' + m); } else console.log('  ok   ' + m); };
const DSF = 2;
await pg.send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: DSF, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
const goto = async q => { await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?touch=1&nosw' + q }); await sleep(1500); for (let i = 0; i < 160; i++) { if (await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)) break; await sleep(300); } await E('BK.ui.pressCard = false'); };
const play = async (party, hero) => E(`(async()=>{const {LEVELS}=await import('/src/level.js');BK.manualSimulation=true;BK.coopEnd();BK.reset({fresh:true});await BK.allyReady();${hero ? `BK.PROG.hero=${JSON.stringify(hero)};BK.PROG.heroes[${JSON.stringify(hero)}]=true;` : ''}${party ? "BK.coopArm('warden',false);" : ''}BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.state='play';BK.start();BK.sim(120);BK.touch.relayout();BK.touch.tick(0.1);return BK.players().length;})()`);
const fit = async label => {
  const d = await E('({ all: BK.touch.allButtons(), L: BK.touch.debug().layout })'), A = d.all, L = d.L;
  ok(A.some(a => a.k === 'ping'), label + ': a PING button is drawn (' + A.map(a => a.k).join(',') + ')');
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    if (!(a.cx - a.r >= L.ins.l - 0.5 && a.cx + a.r <= L.W - L.ins.r + 0.5 && a.cy - a.r >= L.ins.t - 0.5 && a.cy + a.r <= L.H - L.ins.b + 0.5)) ok(false, label + ': ' + a.k + ' is outside the safe area');
    for (let j = i + 1; j < A.length; j++) { const b = A[j]; if (Math.hypot(a.cx - b.cx, a.cy - b.cy) < a.r + b.r - 0.5) ok(false, label + ': ' + a.k + ' overlaps ' + b.k); }
  }
  ok(A.every(a => a.cx > L.zone.x1 + 1 || a.cx < L.zone.x0 - 1), label + ': no button in the stick zone');
  const DPR = await E('document.getElementById("c").width / innerWidth'), p = A.find(a => a.k === 'ping'); ok(p && p.r >= 20 * DPR * 0.75, label + ': the pill is hittable (r ' + (p && Math.round(p.r)) + ')');
};
try {
  await goto(''); await play(false);
  ok(!(await E('BK.touch.allButtons().some(b=>b.k==="ping")')), 'solo: no PING pill');
  await play(true);
  for (const preset of ['simple', 'full']) for (const left of [false, true]) for (const sz of [0.7, 1, 1.4]) {
    await E(`BK.SET.touchPreset=${JSON.stringify(preset)};BK.SET.touchPos={};BK.SET.touchSize=${sz};BK.SET.touchLeft=${left};BK.touch.relayout();BK.touch.tick(0.1)`);
    await fit(preset + (left ? ' left' : ' right') + ' x' + sz);
  }
  await E('BK.SET.touchSize=1;BK.SET.touchLeft=false;BK.SET.touchPreset="full";BK.touch.relayout()');
  /* a real touch marks */
  const b = await E('BK.touch.allButtons().find(b=>b.k==="ping")'), DPR = await E('document.getElementById("c").width / innerWidth');
  const x = b.cx / DPR, y = b.cy / DPR;
  await pg.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 5 }] }); await sleep(60);
  await pg.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x, y, id: 5 }] }); await sleep(60);
  await E('BK.sim(4)');
  ok((await E('BK.pings()')).some(p => p.n === 1), 'a real touch on the PING pill marks for player one');
  /* a notch */
  await goto('&safe=8,44,21,44'); await play(true); await fit('with a notch');
  /* the ranger has a stance button too */
  await goto(''); await play(true, 'ranger'); await E('BK.SET.touchPreset="simple";BK.touch.relayout();BK.touch.tick(0.1)'); await fit('ranger simple');
  await E('BK.SET.touchPreset="full";BK.touch.relayout();BK.touch.tick(0.1)'); await fit('ranger full');
  ok(!pg.errors.length, 'no page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
console.log(fails.length ? '\ntouch-ping: ' + fails.length + ' FAILED' : '\ntouch-ping: GREEN');
process.exit(fails.length ? 1 : 0);
