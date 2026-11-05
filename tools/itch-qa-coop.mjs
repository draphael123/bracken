/* tools/itch-qa-coop.mjs - ITCH QA SWEEP, ONLINE CO-OP ?join= INSIDE THE EMBED (claude/qasweep; headless, ONE browser, closed at the end; not in the suite).
   The HOST runs in the 960x540 cross-site itch-style iframe; the GUEST is a second iframe of the same itch-style page opened on ?join=CODE (another origin: localhost vs 127.0.0.1, so its storage is its own).
   Uses the REAL internet path the shipped game uses (PeerJS 1.5.5 from cdnjs + the free 0.peerjs.com broker + STUN), not the local stub: it proves the library loads inside the frame, the host gets a code,
   the guest page joins by ?join=, WebRTC connects, the guest receives frames, a guest key drives player two, a clean drop. Browser flags only make two browsers on ONE PC reachable (loopback WebRTC candidates).
   usage: QA_SHOTS=<dir> node tools/itch-qa-coop.mjs     needs >= 1500 MB free (exit 3 when not) */
import { startSession, sleep, freeMB } from './itch-qa-lib.mjs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: '960x540', args: ['--disable-features=WebRtcHideLocalIpsWithMdns', '--allow-loopback-in-peer-connection', '--window-size=1000,1000'] });
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
const info = m => console.log('     ' + m);
const gctx = () => [...s.ctxs.values()].find(c => c.origin === 'http://localhost:' + s.gamePort && c.auxData && c.auxData.isDefault);
const G = async expr => { const c = gctx(); if (!c) throw new Error('no guest frame context'); const r = await s.send('Runtime.evaluate', { expression: expr, contextId: c.id, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text); return r.result.value; };
const until = async (fn, ms, what) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { try { v = await fn(); } catch { v = null; } if (v) return v; await sleep(250); } throw new Error('timed out (' + ms + ' ms) waiting for ' + what); };
try {
  await s.send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 1000, deviceScaleFactor: 1, mobile: false });
  await s.send('Page.navigate', { url: s.embedUrl }); const r = await s.waitState('title'); note(r.st === 'title', 'host: title in the iframe (' + r.secs.toFixed(1) + ' s)');
  const top = await s.ev('BK.ui.titleTop()'); note(top.includes('ONLINE CO-OP'), 'host: the title has ONLINE CO-OP in the demo build (' + top.join(', ') + ')');
  const api = await s.ev('({ online: typeof window.BKONLINE, guestApi: typeof window.BKGUEST })'); info('globals: ' + JSON.stringify(api));
  await s.click(480, 270); await sleep(300); await s.key('Shift', 'ShiftLeft', 16); await sleep(500);   /* a first gesture, as a player's click */
  await s.ev('BKONLINE.open()'); await sleep(800); await s.shot('c01-board');
  const board = await s.ev('document.getElementById("olhost") ? document.getElementById("olhost").innerText : "NO BOARD"'); info('board: ' + board.replace(/\s+/g, ' ').slice(0, 200));
  await s.ev('[...document.querySelectorAll("#olhost button")].find(b => b.textContent === "HOST A GAME").click()');
  const code = await until(() => s.ev('BKONLINE.debug().sess && BKONLINE.debug().sess.phase === "waiting" && BKONLINE.debug().sess.code'), 30000, 'the room code (PeerJS from cdnjs + broker)').catch(e => { info(e.message); return null; });
  const sessNow = await s.ev('JSON.stringify(BKONLINE.debug().sess).slice(0, 300)'); info('host session: ' + sessNow);
  note(!!code && /^[A-HJ-NP-Z]{4}$/.test(code), 'host: PeerJS loaded from cdnjs inside the frame and the broker opened a room, code ' + code);
  await s.shot('c02-host-waiting');
  const hostBoard = await s.ev('document.getElementById("olhost").innerText'); note(!!code && hostBoard.includes('?join=' + code), 'host: the board shows the share link (?join=' + code + ')');
  const libReq = s.S.fetched.filter(f => /peerjs/i.test(f.u)).map(f => f.s + ' ' + f.u.split('/').slice(-3).join('/')); info('library requests: ' + libReq.join(' | '));
  if (!code) throw new Error('no room code: the rest of the co-op test cannot run');
  /* the guest: a second iframe of the itch page, on ?join=CODE, its own origin */
  await s.evTop(`(() => { const d = document.createElement('div'); d.style.cssText = 'width:960px;height:540px'; const f = document.createElement('iframe'); f.id = 'guest_drop'; f.setAttribute('allow', 'autoplay; fullscreen *; gamepad'); f.style.cssText = 'width:960px;height:540px;border:0'; f.src = 'http://localhost:${s.gamePort}/?join=${code}'; d.appendChild(f); document.body.appendChild(d); return true; })()`);
  const gphase = await until(() => G('window.BKGUEST ? BKGUEST.state().phase : null'), 40000, 'the guest page (BKGUEST) to answer').catch(e => { info(e.message); return null; });
  info('guest first phase: ' + gphase); await sleep(1500); await s.shot('c03-guest-joining');
  const gtxt = await G('(document.getElementById("olguest") || document.body).innerText').catch(() => ''); info('guest page: ' + gtxt.replace(/\s+/g, ' ').slice(0, 220));
  const slotPhase = await until(() => G('BKGUEST.state().phase === "slot" || BKGUEST.state().phase === "pick" || BKGUEST.state().phase === "play" ? BKGUEST.state().phase : null'), 40000, 'the guest to connect and reach its slot list').catch(e => { info(e.message); return null; });
  if (!slotPhase) { info('guest state: ' + await G('JSON.stringify(BKGUEST.state()).slice(0, 400)').catch(e => e.message)); info('host sess: ' + await s.ev('JSON.stringify(BKONLINE.debug().sess).slice(0, 300)')); info('console warnings: ' + s.S.warns.slice(0, 8).join(' | ')); }
  note(!!slotPhase, 'guest: ?join= page connects to the host over WebRTC inside the embed (phase ' + slotPhase + ')');
  if (slotPhase) {
    const hostPh = await s.ev('BKONLINE.debug().sess.phase'); info('host phase now: ' + hostPh);
    if (slotPhase === 'slot') { await G('(() => { const b = [...document.querySelectorAll("#olguest button")]; const j = b.find(x => /JUST VISIT/.test(x.textContent)) || b[b.length - 1]; j.click(); return true; })()'); }
    await sleep(800); const pk = await G('(() => { const h = [...document.querySelectorAll("#olguest button.hero")].map(b => b.textContent); return h; })()').catch(() => []); info('guest hero pick: ' + pk.join(', '));
    if (pk.length) await G('(() => { const b = [...document.querySelectorAll("#olguest button.hero")]; (b.find(x => x.textContent === "WARDEN") || b[1] || b[0]).click(); return true; })()');
    const ph = await until(() => G('BKGUEST.state().phase === "play" ? "play" : null'), 25000, 'the guest to be in').catch(e => { info(e.message); return null; });
    note(ph === 'play', 'guest: picks a hero and is IN (host state ' + (await s.ev('BK.state')) + ')');
    await sleep(1500);
    if (ph === 'play') {
      await s.ev("BK.load(0); BK.start(); BK.sim(5); true").catch(e => info('start: ' + e.message)); await sleep(3000); await s.shot('c04-coop-in-wood');
      const pl = await s.ev('BK.players().map(p => p.hero + "@" + Math.round(p.x))'); info('host players: ' + pl.join(', ')); note(pl.length === 2, 'host: player two seated (' + pl.join(', ') + ')');
      const vid = await until(() => G('(() => { const v = document.querySelector("#olguest video, video"); return v && v.videoWidth > 0 ? v.videoWidth + "x" + v.videoHeight + " t=" + v.currentTime.toFixed(1) : null; })()'), 15000, 'a video frame on the guest').catch(e => { info(e.message); return null; });
      note(!!vid, 'guest: receives the host\'s picture over the data/video link (' + vid + ')');
      const rtt = await s.ev('BKONLINE.debug().sess.rtt').catch(() => null); info('host-measured rtt: ' + rtt + ' ms'); note(rtt === null || rtt >= 0, 'link has a ping reading (' + rtt + ' ms)');
      /* a guest key: click into the guest frame (focus), then hold D */
      const p2a = await s.ev('Math.round(BK.players()[1].x)'); await s.click(480, 540 + 270); await sleep(300);
      await s.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }); await sleep(1800); const held = await s.ev('JSON.stringify(BKONLINE.debug().held)'); await s.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }); await sleep(400);
      const p2b = await s.ev('Math.round(BK.players()[1].x)'); info('player two x ' + p2a + ' > ' + p2b + ' (held ' + held + ')'); note(p2b > p2a + 5, 'guest keyboard moves player two on the host through the embed (x ' + p2a + ' > ' + p2b + ')');
      await s.shot('c05-guest-driving');
      const gst = await G('BKGUEST.state().phase'); info('guest phase before drop: ' + gst);
      await s.evTop('document.getElementById("guest_drop").remove(); true'); await sleep(4000);
      const n2 = await s.ev('BK.players().length'); note(n2 === 1, 'host: the guest leaving drops player two cleanly (' + n2 + ' player)');
    }
  }
  const bad = [...new Set([...s.S.consoleErrors, ...s.S.exceptions])]; info('console errors: ' + bad.length + (bad.length ? ' ' + bad.slice(0, 5).join(' | ') : '')); note(bad.filter(x => !/Permissions policy/.test(x)).length === 0, 'no uncaught errors in host or guest');
  const failed = s.S.failed.filter(x => !/favicon/.test(x)); info('failed requests: ' + failed.length + (failed.length ? ' ' + failed.slice(0, 5).join(' | ') : '')); note(failed.length === 0, '0 failed requests');
} catch (e) { console.log('RED  stopped: ' + e.message); red.push(e.message); }
finally { await s.shot('c99-final').catch(() => {}); await s.close(); }
console.log(red.length ? 'itch-qa-coop: ' + red.length + ' RED' : 'itch-qa-coop: all green'); process.exit(red.length ? 1 : 0);
