// tools/online-coop.mjs - ONLINE CO-OP, PHASE 1 (claude/onlinecoop): TWO HEADLESS BROWSERS ON LOCALHOST, a host and a guest, joined through
// a LOCAL signalling stub (tools/online-stub.mjs - the tests have no internet, so the free PeerJS broker is swapped for it with ?net=local;
// src/online-peer-local.js has PeerJS's surface) and then REAL WebRTC between them: a data channel and the host's streamed canvas. It proves:
//   1. the gate: the title has ONLINE CO-OP beside LOCAL CO-OP, and hosting is LOCKED (the local co-op gate) until the save owns a second hero
//   2. the guest joins BY CODE (the host's board shows the code and the ?join= link), gets the HOST'S roster and picks player two's hero
//   3. the guest RECEIVES FRAMES: a 640x360 video (the host's 320x180 at 2x) with a sound track, shown pixelated at a whole-number scale,
//      and it is CRISP - inside each 2x2 game pixel the video barely varies, across game pixels it does (a blurred stream fails this)
//   4. a guest KEY PRESS MOVES PLAYER TWO on the host - and not player one - through the guest's OWN rebinding (a key bound on the guest's
//      settings moves him, the default it replaced does not); a jump; the focus leaving the guest's page lets go of everything
//   5. the guest's TOUCH buttons drive player two (the game's own touch layer, on the guest page)
//   6. host pause shows HOST PAUSED on the guest; the guest has a latency readout and a volume that works
//   7. a guest DISCONNECT drops player two cleanly (local co-op's drop-out: one player, coopWant off, the wood goes on) and the room waits
//   8. the guest's own save (all of its localStorage EXCEPT the one key bracken.onlineVol, his remembered stream volume, which has its own
//      key and is never part of a save) is byte-for-byte untouched, and the guest page never ran the game
//   9. POLISH (Daniel 10-11): the board opens from the MAP with G (same gate); the guest's volume is remembered under bracken.onlineVol and
//      comes back on a rejoin; the guest's hero pick shows the host's baked idle frames, pixelated at a whole-number scale (no window.BK)
//   node tools/online-coop.mjs          (PORT for the page server; the relay goes on ONLINE_RELAY or PORT+1)
import { openPage } from './cdp.mjs';
import { startStub } from './online-stub.mjs';
import { PORT_BASE } from './ports.mjs';

const PORT = +(process.env.PORT || PORT_BASE), RELAY = +(process.env.ONLINE_RELAY || PORT + 1), URL0 = 'http://localhost:' + PORT + '/';
const ARGS = ['--disable-features=WebRtcHideLocalIpsWithMdns', '--allow-loopback-in-peer-connection'];   /* two browsers on one machine: plain host candidates, no mDNS names to resolve */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = [], notes = [], ok = (c, m) => { if (!c) { fails.push(m); if (process.env.OC_VERBOSE) console.log('  FAIL ' + m); } else if (process.env.OC_VERBOSE) console.log('  ok   ' + m); };
let stub = null, host = null, guest = null;
const until = async (pg, expr, ms = 15000, what = expr) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { try { v = await pg.evalp(expr, 5000); } catch { v = undefined; } if (v) return v; await sleep(150); } throw new Error('timed out (' + ms + ' ms) waiting for ' + what); };
async function nav(pg, url, ready) { const t0 = await pg.evalp('performance.timeOrigin', 5000).catch(() => 0); await pg.send('Page.navigate', { url }); await until(pg, 'performance.timeOrigin !== ' + t0 + ' && location.href === ' + JSON.stringify(url) + ' && (' + ready + ')', 90000, 'the page at ' + url); }
const VK = { ArrowRight: 39, ArrowLeft: 37, Escape: 27, z: 90, y: 89, a: 65 };
const key = async (pg, k, type) => pg.send('Input.dispatchKeyEvent', { type, key: k, code: k.length === 1 ? 'Key' + k.toUpperCase() : k, windowsVirtualKeyCode: VK[k], nativeVirtualKeyCode: VK[k], ...(type === 'keyDown' && k.length === 1 ? { text: k } : {}) });
const H = expr => host.evalp(expr, 60000), Gu = expr => guest.evalp(expr, 60000);   /* (a minute: a wood loading on a machine at 100% has taken over 20 s) */
const p2 = () => H('(()=>{const p=BK.players()[1];return p?{x:p.x,y:p.y,vy:p.vy,hero:p.hero,right:!!p.keys.right,left:!!p.keys.left}:null})()');
const p1x = () => H('BK.players()[0].x');

try {
  stub = await startStub(RELAY);
  host = await openPage({ audio: true, fonts: false, args: ARGS });
  guest = await openPage({ audio: false, fonts: false, args: ARGS, noWait: true });
  await nav(host, URL0 + '?net=local&relay=' + RELAY, 'typeof window.BK === "object" && !!window.BK.lookPass && !!window.BKONLINE');
  await host.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 }); await host.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'F8', code: 'F8', windowsVirtualKeyCode: 119 });

  // ---- the guest's own save, seeded, and its whole storage read before anything happens ----
  await nav(guest, URL0 + 'manifest.webmanifest', 'true');
  const SAVE = JSON.stringify({ hero: 'pyro', heroes: { knight: true, pyro: true }, coins: 777, guestSentinel: 1 });
  const SETS = JSON.stringify({ binds: { kb: { left: ['y', null] }, pad1: {}, pad2: {} }, music: false });   /* the guest's own rebinding: LEFT is Y on his machine */
  const before = await guest.evalp(`(()=>{localStorage.clear();localStorage.setItem('bracken.progress.0',${JSON.stringify(SAVE)});localStorage.setItem('bracken.slot','0');localStorage.setItem('bracken.settings',${JSON.stringify(SETS)});const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()`);

  // ---- 1. the gate ----
  const top = await H('BK.ui.titleTop()');
  ok(top.indexOf('ONLINE CO-OP') === top.indexOf('LOCAL CO-OP') + 1, '1: the title has ONLINE CO-OP right after LOCAL CO-OP: ' + top.join(', '));
  await H('(()=>{const h=BK.PROG.heroes;for(const k in h)if(k!=="knight")delete h[k];BK.PROG.coopLegacy=false;})()');
  const locked = await H('BKONLINE.host()');
  ok(locked && locked.error === 'locked', '1: with one hero, hosting is locked: ' + JSON.stringify(locked));
  await H('BKONLINE.open()');
  const lockedBoard = await H('document.getElementById("olhost").innerText');
  ok(/SECOND HERO/.test(lockedBoard) && !/HOST A GAME/.test(lockedBoard), '1: the locked board says why and offers no HOST button');
  ok(/JOIN/.test(lockedBoard), '1: JOIN a friend is offered even when locked (the guest needs no hero of his own)');
  await H('document.querySelector("#olhost button:last-child").click()');
  // 9a. the MAP key (G) opens the same board, with the same gate
  const mapKeyBoard = async () => { await H('(()=>{BK.state="map";return true})()'); await sleep(300); await key(host, 'g', 'keyDown'); await key(host, 'g', 'keyUp'); await until(host, 'document.getElementById("olhost") && document.getElementById("olhost").style.display !== "none" && document.getElementById("olhost").innerText.length > 0', 8000, 'the online board from the map key'); return H('document.getElementById("olhost").innerText'); };
  const mapLocked = await mapKeyBoard();
  ok(/ONLINE CO-OP/.test(mapLocked) && /SECOND HERO/.test(mapLocked) && !/HOST A GAME/.test(mapLocked), '9: G on the map opens the online board, locked with one hero (same gate)');
  await H('[...document.querySelectorAll("#olhost button")].find(b=>b.textContent==="BACK").click()');

  // ---- 2. hosting, the code, the link, joining ----
  await H('BK.PROG.heroes.warden = true');
  const mapOpen = await mapKeyBoard();
  ok(/HOST A GAME/.test(mapOpen) && /JOIN/.test(mapOpen), '9: with 2+ heroes the map key offers HOST A GAME and JOIN');
  await H('[...document.querySelectorAll("#olhost button")].find(b=>b.textContent==="BACK").click()');
  await H('BKONLINE.open()');
  await H('[...document.querySelectorAll("#olhost button")].find(b=>b.textContent==="HOST A GAME").click()');
  const code = await until(host, 'BKONLINE.debug().sess && BKONLINE.debug().sess.phase === "waiting" && BKONLINE.debug().sess.code', 15000, 'the room to open');
  ok(/^[A-HJ-NP-Z]{4}$/.test(code), '2: a four-letter room code (no I, no O): ' + code);
  const boardTxt = await H('document.getElementById("olhost").innerText');
  ok(boardTxt.includes(code) && boardTxt.includes('?join=' + code), '2: the host board shows the code and the share link');
  await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY + '&touch=1', '!!window.BKGUEST');
  await until(guest, 'BKGUEST.state().phase === "pick"', 25000, 'the guest to reach the hero pick');
  const roster = await Gu('BKGUEST.state().roster.map(r=>r.id)');
  ok(roster.includes('knight') && roster.includes('warden') && !roster.includes('pyro'), '2: the guest picks from the HOST\'s roster (knight + warden), not his own (pyro): ' + roster);
  ok((await H('BKONLINE.debug().sess.phase')) === 'picking', '2: the host sees player two picking');
  // 9c. the host's baked hero art on the pick screen: one pixelated image per hero, a whole number of screen pixels per art pixel, names still text
  const art = await until(guest, '(()=>{const im=[...document.querySelectorAll("#olguest button.hero img")];return im.length===BKGUEST.state().roster.length&&im.every(i=>i.complete&&i.naturalWidth>0)?im.map(i=>({nw:i.naturalWidth,nh:i.naturalHeight,w:parseFloat(i.style.width),h:parseFloat(i.style.height),r:getComputedStyle(i).imageRendering,dpr:devicePixelRatio})):null})()', 15000, 'the hero art on the guest pick');
  ok(art.length === roster.length && art.every(a => a.r === 'pixelated'), '9: the guest pick shows one pixelated image per roster hero: ' + art.length);
  ok(art.every(a => { const s = a.w * a.dpr / a.nw; return Math.abs(s - Math.round(s)) < 0.01 && Math.abs(a.h * a.dpr / a.nh - s) < 0.01 && s >= 1; }), '9: ...each at a whole number of screen pixels per art pixel: ' + JSON.stringify(art.map(a => a.w * a.dpr / a.nw)));
  ok(await Gu('[...document.querySelectorAll("#olguest button.hero")].every(b=>/^[A-Z ]+$/.test(b.textContent))'), '9: ...and the names stay as text');
  ok(await Gu('(()=>{const c=document.querySelector("#olguest .ob");return c.scrollWidth<=c.clientWidth+1})()'), '9: the pick card fits its box');
  await Gu('[...document.querySelectorAll("#olguest button")].find(b=>b.textContent==="WARDEN").click()');
  await until(guest, 'BKGUEST.state().phase === "play"', 10000, 'the guest to be in');
  ok((await H('BK.state')) === 'map', '2: the host, on the title, goes on to the map with player two armed');
  await H(`import('/src/level.js').then(({LEVELS})=>{BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.god=true;return true;})`);
  await sleep(1500);
  const pl = await H('BK.players().map(p=>p.hero)');
  ok(pl.length === 2 && pl[1] === 'warden', '2: in the wood, player two is the guest\'s WARDEN: ' + pl + ' ' + JSON.stringify(await H('BKONLINE.debug().sess')));

  // ---- 3. frames, crisp ----
  await until(guest, 'BKGUEST.state().frames > 30', 15000, 'thirty video frames on the guest');
  const gs = await Gu('BKGUEST.state()');
  ok(gs.videoW === 640 && gs.videoH === 360, '3: the stream is the 320x180 frame at 2x: ' + gs.videoW + 'x' + gs.videoH);
  ok(gs.audio, '3: the stream carries the host\'s sound');
  ok(gs.css.r === 'pixelated', '3: the video is drawn pixelated: ' + gs.css.r);
  ok(Number.isInteger(gs.geo.S) && gs.geo.S >= 1 && Math.abs(gs.css.w * gs.geo.DPR - 320 * gs.geo.S) < 0.5, '3: a whole number of screen pixels per game pixel: S=' + gs.geo.S + ', ' + gs.css.w + ' css px');
  const crisp = await Gu(`(()=>{const v=BKGUEST.video,c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;const g=c.getContext('2d');g.drawImage(v,0,0);const d=g.getImageData(0,0,c.width,c.height).data;let a=0,b=0;
    for(let y=1;y<c.height;y+=2)for(let x=0;x+2<c.width;x+=2){const i=(y*c.width+x)*4;let w=0,o=0;for(let k=0;k<3;k++){w+=Math.abs(d[i+k]-d[i+4+k]);o+=Math.abs(d[i+4+k]-d[i+8+k]);}a+=w;b+=o;}return {within:a,across:b,ratio:b?a/b:1};})()`);
  ok(crisp.across > 0 && crisp.ratio < 0.35, '3: crisp pixels - the change inside a game pixel is ' + Math.round(crisp.ratio * 100) + '% of the change across them (blur would be ~100%)');
  notes.push('crisp ratio ' + crisp.ratio.toFixed(3));

  // ---- 4. the guest's keys move player two, through his own bindings ----
  /* POLLED, NOT SLEPT: a busy machine (a release suite beside this) puts a second of lag on the link, so each check waits for its outcome
     (up to 5 s) instead of trusting a fixed sleep, and waits for the last key to have let go on the host before the next one starts */
  const settle = () => until(host, '(()=>{const p=BK.players()[1];return p&&!p.keys.left&&!p.keys.right&&!p.keys.jump&&Math.abs(p.vy)<1&&Math.abs(p.vx||0)<1})()', 8000, 'player two to stand still with nothing held');
  const walk = async (down, up, sign) => { const a = await p2(); await down(); let b = a; const t0 = Date.now(); while (Date.now() - t0 < 5000) { b = await p2(); if ((b.x - a.x) * sign > 12) break; await sleep(100); } await up(); return [a, b]; };
  const rise = async (down, up) => { const a = await p2(); await down(); let m = a.y; const t0 = Date.now(); while (Date.now() - t0 < 5000) { m = Math.min(m, (await p2()).y); if (a.y - m > 8) break; await sleep(40); } await up(); return a.y - m; };
  const K = k => [() => key(guest, k, 'keyDown'), () => key(guest, k, 'keyUp')];
  await settle();
  const q0 = await p1x();
  let [a0, a1] = await walk(...K('ArrowRight'), 1);
  ok(a1.right, '4: a held guest key is held on the host\'s player two');
  ok(a1.x - a0.x > 12, '4: a guest key press moves player two right: ' + Math.round(a0.x) + ' -> ' + Math.round(a1.x));
  ok(Math.abs((await p1x()) - q0) < 2, '4: ...and not player one: ' + Math.round(q0) + ' -> ' + Math.round(await p1x()));
  await settle(); ok(!(await p2()).right, '4: the key let go on the guest is let go on the host');
  notes.push('guest ping during the run ~' + (await Gu('BKGUEST.state().rtt')) + ' ms');
  // his own rebinding: Y is LEFT on the guest's settings, A (the default it replaced) is not
  [a0, a1] = await walk(...K('y'), -1); await settle();
  ok(a1.x - a0.x < -12, '4: the guest\'s own binding (Y = LEFT) moves player two left: ' + Math.round(a0.x) + ' -> ' + Math.round(a1.x));
  a0 = await p2(); await key(guest, 'a', 'keyDown'); await sleep(1500); a1 = await p2(); const aHeld = await H('BKONLINE.debug().held'); await key(guest, 'a', 'keyUp'); await settle();
  ok(Math.abs(a1.x - a0.x) < 4 && !aHeld.left, '4: the default A, which his binding replaced, does not: ' + Math.round(a0.x) + ' -> ' + Math.round(a1.x));
  // a jump
  const j = await rise(...K('z')); await settle();
  ok(j > 8, '4: Z on the guest jumps player two: rose ' + Math.round(j) + ' px');
  // focus lost: everything lets go
  await key(guest, 'ArrowRight', 'keyDown'); await until(host, 'BK.players()[1].keys.right', 5000, 'right held on the host');
  await Gu('window.dispatchEvent(new Event("blur"))');
  const gHeld = await Gu('BKGUEST.state().held');
  ok(!gHeld.right, '4: the guest page losing focus lets go of its keys: ' + JSON.stringify(gHeld));
  const let1 = await until(host, '!BK.players()[1].keys.right && !BKONLINE.debug().held.right', 5000, 'the host to let go').catch(() => false);
  ok(!!let1, '4: ...and of every key on the host');
  await key(guest, 'ArrowRight', 'keyUp'); await settle();

  // ---- 5. touch ----
  const btns = await Gu('BKGUEST.touch.debug().buttons.map(b=>({k:b.k,cx:b.cx,cy:b.cy,r:b.r}))');
  const jb = btns.find(b => b.k === 'jump'), dpr = (await Gu('BKGUEST.state().geo.DPR')) || 1;
  ok(!!jb, '5: the guest page shows the game\'s touch buttons (with ?touch=1): ' + btns.map(b => b.k).join(','));
  const T = (x, y, id) => [() => guest.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id }] }), () => guest.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [{ x, y, id }] })];
  if (jb) { const r = await rise(...T(jb.cx / dpr, jb.cy / dpr, 3)); await settle(); ok(r > 8, '5: the guest\'s touch JUMP jumps player two: rose ' + Math.round(r) + ' px'); }
  const dp = await Gu('(()=>{const L=BKGUEST.touch.debug().layout;return L.dpad?{cx:L.dpad.cx,cy:L.dpad.cy,R:L.dpad.R}:null})()');
  if (dp) { [a0, a1] = await walk(...T((dp.cx + dp.R * 0.7) / dpr, dp.cy / dpr, 4), 1); await settle();
    ok(a1.x - a0.x > 12, '5: the guest\'s touch d-pad walks player two right: ' + Math.round(a0.x) + ' -> ' + Math.round(a1.x)); }
  else ok(false, '5: no d-pad in the guest touch layout');

  // ---- 6. pause, latency, volume ----
  await key(host, 'Escape', 'keyDown'); await key(host, 'Escape', 'keyUp');
  await until(guest, 'BKGUEST.state().banner === "HOST PAUSED"', 5000, 'HOST PAUSED on the guest');
  ok(true, '6: the host pausing shows HOST PAUSED on the guest');
  await key(host, 'Escape', 'keyDown'); await key(host, 'Escape', 'keyUp');
  await until(guest, 'BKGUEST.state().banner === ""', 5000, 'the banner to go when the host plays on');
  const g6 = await Gu('({rtt:BKGUEST.state().rtt,strip:document.getElementById("olstrip").innerText})');
  ok(g6.rtt > 0 && /PING \d+ MS/.test(g6.strip), '6: the guest shows a latency readout: ' + g6.strip);
  ok((await H('BKONLINE.debug().sess.rtt')) > 0, '6: the host\'s chip knows the guest\'s ping');
  await Gu('BKGUEST.toggleMenu()');
  const vol = await Gu('(()=>{const v=document.getElementById("olvol");v.value=30;v.dispatchEvent(new Event("input"));return BKGUEST.video.volume})()');
  ok(Math.abs(vol - 0.3) < 0.01, '6: the guest\'s volume sets the host sound\'s level: ' + vol);
  ok((await Gu('localStorage.getItem("bracken.onlineVol")')) === '0.3', '9: the volume is written under its own key, bracken.onlineVol');
  await Gu('BKGUEST.toggleMenu()');

  // ---- 7. the guest goes: player two drops out cleanly ----
  const errs0 = host.errors.length;
  await nav(guest, URL0 + 'manifest.webmanifest', 'true');
  await until(host, 'BK.players().length === 1', 15000, 'player two to drop out on the host');
  const d7 = await H('({st:BK.state,n:BK.players().length,ph:BKONLINE.debug().sess.phase,hero:BKONLINE.debug().sess.hero,remote:BKONLINE.debug().remote,p1:!BK.players()[0].dead})');
  ok(d7.n === 1 && d7.st === 'play' && d7.p1, '7: the guest leaving drops player two and the wood goes on: ' + JSON.stringify(d7));
  ok(d7.ph === 'waiting' && !d7.hero && !d7.remote, '7: the room waits for him again (same code)');
  await sleep(1200); ok((await H('BK.players().length')) === 1, '7: player two stays out at the next level-free frame (coopWant is off)');
  ok(host.errors.length === errs0, '7: no page error on the host when he went: ' + host.errors.slice(errs0).join(' | '));

  // ---- 8. the guest's save ----
  /* DESIGN CHANGE (10-11): the guest's remembered volume lives under its own key, so the identical-storage assertion excludes exactly that one key and nothing else */
  const after = await guest.evalp(`(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k==='bracken.onlineVol')continue;o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()`);
  ok(after === before, "8: the guest's whole localStorage except bracken.onlineVol (his save, slot and settings) is untouched");
  // 9b. the remembered volume comes back on a rejoin
  await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY, '!!window.BKGUEST');
  await until(guest, 'BKGUEST.state().phase === "pick"', 25000, 'the guest to rejoin');
  ok(Math.abs((await Gu('BKGUEST.state().volSaved')) - 0.3) < 0.001, "9: a rejoin remembers the guest's volume (0.3)");
  ok(guest.errors.length === 0, '8: no page error on the guest: ' + guest.errors.slice(0, 2).join(' | '));
  await H('BKONLINE.end()');
} catch (e) { fails.push('aborted: ' + String(e && e.message || e).split('\n')[0]); }
finally {
  for (const pg of [guest, host]) if (pg) try { await pg.close(); } catch {}
  if (stub) await stub.close();
}
for (const n of notes) console.log('  note ' + n);
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log('online-coop: ' + fails.length + ' failed'); process.exit(1); }
console.log('online-coop: OK - joined by code, frames crisp at 2x, guest keys + touch drive player two (own bindings, focus-loss release), pause banner, ping, volume, clean drop-out, guest save untouched');
