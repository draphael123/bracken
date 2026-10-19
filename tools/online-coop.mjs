// tools/online-coop.mjs - ONLINE CO-OP, PHASE 1 (claude/onlinecoop): TWO HEADLESS BROWSERS ON LOCALHOST, a host and a guest, joined through
// a LOCAL signalling stub (tools/online-stub.mjs - the tests have no internet, so the free PeerJS broker is swapped for it with ?net=local;
// src/online-peer-local.js has PeerJS's surface) and then REAL WebRTC between them: a data channel and the host's streamed canvas. It proves:
//   1. the gate: the title has ONLINE CO-OP beside LOCAL CO-OP, and hosting is LOCKED (the local co-op gate) until the save owns a second hero
//   2. the guest joins BY CODE (the host's board shows the code and the ?join= link), picks one of HIS OWN SAVE SLOTS (claude/coopprogress: or JUST
//      VISIT, which saves nothing) and a hero of THAT save - his own PYRO, which the host does not own - and the host seats him FROM HIS SNAPSHOT
//      (his slot, his level 6, his purse), not from the host's save
//   3. the guest RECEIVES FRAMES: a 640x360 video (the host's 320x180 at 2x) with a sound track, shown pixelated at a whole-number scale,
//      and it is CRISP - inside each 2x2 game pixel the video barely varies, across game pixels it does (a blurred stream fails this)
//   4. a guest KEY PRESS MOVES PLAYER TWO on the host - and not player one - through the guest's OWN rebinding (a key bound on the guest's
//      settings moves him, the default it replaced does not); a jump; the focus leaving the guest's page lets go of everything
//   5. the guest's TOUCH buttons drive player two (the game's own touch layer, on the guest page)
//   6. host pause shows HOST PAUSED on the guest; the guest has a latency readout and a volume that works
//   7. a guest DISCONNECT drops player two cleanly (local co-op's drop-out: one player, coopWant off, the wood goes on) and the room waits
//   8. the guest's own storage (all of its localStorage EXCEPT the one key bracken.onlineVol, his remembered stream volume, which has its own
//      key and is never part of a save) is byte-for-byte untouched EXCEPT THE EARNED REWARDS IN THE SLOT HE CHOSE - the stated design change of
//      co-op progression step 1 (scratch brief-coopprogress.md): in that slot only xp (his hero's), coins and the credit book (coopCredit) differ,
//      every other slot and key is identical - and the guest page never ran the game
//  11. CO-OP PROGRESSION (claude/coopprogress): he EARNS on his own save - at a CHECKPOINT (his bank) the host sends what he earned and HIS page
//      writes it into HIS slot (the host's save takes none of it); a credit replayed is not paid twice; earnings since the last checkpoint are LOST
//      when the link drops with no goodbye (partial); a REJOIN snapshots the credited save as a new session (no double credit), its checkpoint
//      pays only its own, a wood WON together is cleared on HIS road (its needs-chain successor opens), and LEAVE sends the final credit
//  10. GRAB (claude/partnerthrow, 10-12): the guest GRABS the host's hero and is GRABBED (lifted, screams, wriggles free), his touch layer is told GRAB/THROW by the host, the scream is in the stream audio, nothing stalls
//   9. POLISH (Daniel 10-11): the board opens from the MAP with G (same gate); the guest's volume is remembered under bracken.onlineVol and
//      comes back on a rejoin; the guest's hero pick shows the host's baked idle frames, pixelated at a whole-number scale (no window.BK)
//   node tools/online-coop.mjs          (PORT for the page server; the relay goes on ONLINE_RELAY or PORT+1)
import { openPage } from './cdp.mjs';
import { startStub } from './online-stub.mjs';
import { PORT_BASE } from './ports.mjs';
import { cleanCode } from '../src/online-net.js';
import { migrateProgress } from '../src/progression.js';
import { xpFloor } from '../src/xp.js';
import { LEVELS } from '../src/level.js';

const PORT = +(process.env.PORT || PORT_BASE), RELAY = +(process.env.ONLINE_RELAY || PORT + 1), URL0 = 'http://localhost:' + PORT + '/';
const ARGS = ['--disable-features=WebRtcHideLocalIpsWithMdns', '--allow-loopback-in-peer-connection'];   /* two browsers on one machine: plain host candidates, no mDNS names to resolve */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fails = [], notes = [], ok = (c, m) => { if (!c) { fails.push(m); if (process.env.OC_VERBOSE) console.log('  FAIL ' + m); } else if (process.env.OC_VERBOSE) console.log('  ok   ' + m); };
let stub = null, host = null, guest = null;
const until = async (pg, expr, ms = 15000, what = expr) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { try { v = await pg.evalp(expr, 5000); } catch { v = undefined; } if (v) return v; await sleep(150); } throw new Error('timed out (' + ms + ' ms) waiting for ' + what); };
async function nav(pg, url, ready) { const t0 = await pg.evalp('performance.timeOrigin', 5000).catch(() => 0); await pg.send('Page.navigate', { url }); await until(pg, 'performance.timeOrigin !== ' + t0 + ' && location.href === ' + JSON.stringify(url) + ' && (' + ready + ')', 90000, 'the page at ' + url); }
const VK = { ArrowRight: 39, ArrowLeft: 37, Escape: 27, z: 90, y: 89, a: 65, i: 73 };
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
  /* (claude/coopprogress) a CURRENT save (so a credit migrates nothing): his PYRO at level 6, which the host does not own */
  const SAVE = JSON.stringify(migrateProgress(JSON.stringify({ hero: 'pyro', heroes: { knight: true, pyro: true }, coins: 777, xp: { pyro: xpFloor(6) }, perHero: 1, xpVersion: 1, guestSentinel: 1 }), []).progress);
  const SETS = JSON.stringify({ binds: { kb: { left: ['y', null] }, pad1: {}, pad2: {} }, music: false });   /* the guest's own rebinding: LEFT is Y on his machine */
  const before = await guest.evalp(`(()=>{localStorage.clear();localStorage.setItem('bracken.progress.0',${JSON.stringify(SAVE)});localStorage.setItem('bracken.slot','0');localStorage.setItem('bracken.settings',${JSON.stringify(SETS)});const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()`);

  // ---- 1. the gate ----
  const top = await H('BK.ui.titleTop()');
  ok(top.indexOf('ONLINE CO-OP') === top.indexOf('LOCAL CO-OP') + 1, '1: the title has ONLINE CO-OP right after LOCAL CO-OP: ' + top.join(', '));
  await H('(()=>{const h=BK.PROG.heroes;for(const k in h)if(k!=="knight")delete h[k];BK.PROG.coopLegacy=false;})()');
  await H('BKONLINE.open()');   /* (Daniel 10-15) co-op is open with ONE hero: no lock, no second hero needed */
  const lockedBoard = await H('document.getElementById("olhost").innerText');
  ok(!/SECOND HERO/.test(lockedBoard) && /HOST A GAME/.test(lockedBoard), '1: with one hero the board offers HOST A GAME (no lock): ' + lockedBoard.slice(0, 120));
  ok(/JOIN/.test(lockedBoard), '1: JOIN a friend is offered');
  await H('document.querySelector("#olhost button:last-child").click()');
  // 9a. the MAP key (G) opens the same board, with the same gate
  const mapKeyBoard = async () => { await H('(()=>{BK.state="map";return true})()'); await sleep(300); await key(host, 'g', 'keyDown'); await key(host, 'g', 'keyUp'); await until(host, 'document.getElementById("olhost") && document.getElementById("olhost").style.display !== "none" && document.getElementById("olhost").innerText.length > 0', 8000, 'the online board from the map key'); return H('document.getElementById("olhost").innerText'); };
  const mapLocked = await mapKeyBoard();
  ok(/ONLINE CO-OP/.test(mapLocked) && !/SECOND HERO/.test(mapLocked) && /HOST A GAME/.test(mapLocked), '9: G on the map opens the online board, open with one hero (same gate)');
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
  ok(cleanCode('https://bracken-nine.vercel.app/?join=' + code.toLowerCase()) === code && cleanCode(code.toLowerCase() + ' ') === code, '2: the SHARE LINK pasted into the code box is read as its code (Daniel 10-15: it read HTTPS)');
  await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY + '&touch=1', '!!window.BKGUEST');
  await until(guest, 'BKGUEST.state().phase === "slot"', 25000, 'the guest to reach his own save slots');
  const slotsTxt = await Gu('document.getElementById("olguest").innerText');
  ok(/SLOT 1: PYRO LV 6/.test(slotsTxt) && /SLOT 2: EMPTY/.test(slotsTxt) && /JUST VISIT/.test(slotsTxt), '2: the guest first picks one of HIS OWN save slots (slot 1 his PYRO LV 6; an empty one starts a new save; or JUST VISIT): ' + slotsTxt.replace(/\s+/g, ' ').slice(0, 170));
  ok((await H('BKONLINE.debug().sess.phase')) === 'picking', '2: the host sees player two picking');
  await Gu('[...document.querySelectorAll("#olguest button")].find(b=>b.dataset.slot==="0").click()');
  await until(guest, 'BKGUEST.state().phase === "pick"', 5000, 'the hero pick of his slot');
  const roster = await Gu('[...document.querySelectorAll("#olguest button.hero")].map(b=>b.textContent)');
  ok(roster.includes('PYRO') && roster.includes('KNIGHT') && roster.includes('WARDEN'), '2: ...then a hero of THAT save: his own PYRO (the host does not own one) and the free starters: ' + roster);
  ok((await Gu('BKGUEST.locks().mine.map(c=>c.slot).join()')) === '0', '2: his page holds his slot 1 (one character, one place)');
  // 9c. the host's baked hero art on the pick screen: one pixelated image per hero, a whole number of screen pixels per art pixel, names still text
  const art = await until(guest, '(()=>{const im=[...document.querySelectorAll("#olguest button.hero img")];return im.length===document.querySelectorAll("#olguest button.hero").length&&im.every(i=>i.complete&&i.naturalWidth>0)?im.map(i=>({nw:i.naturalWidth,nh:i.naturalHeight,w:parseFloat(i.style.width),h:parseFloat(i.style.height),r:getComputedStyle(i).imageRendering,dpr:devicePixelRatio})):null})()', 15000, 'the hero art on the guest pick');
  ok(art.length === roster.length && art.every(a => a.r === 'pixelated'), '9: the guest pick shows one pixelated image per roster hero: ' + art.length);
  ok(art.every(a => { const s = a.w * a.dpr / a.nw; return Math.abs(s - Math.round(s)) < 0.01 && Math.abs(a.h * a.dpr / a.nh - s) < 0.01 && s >= 1; }), '9: ...each at a whole number of screen pixels per art pixel: ' + JSON.stringify(art.map(a => a.w * a.dpr / a.nw)));
  ok(await Gu('[...document.querySelectorAll("#olguest button.hero")].every(b=>/^[A-Z ]+$/.test(b.textContent))'), '9: ...and the names stay as text');
  ok(await Gu('(()=>{const c=document.querySelector("#olguest .ob");return c.scrollWidth<=c.clientWidth+1})()'), '9: the pick card fits its box');
  const hostBefore = await H('JSON.stringify({pyro:(BK.PROG.xp||{}).pyro||0,coins:BK.PROG.coins||0,heroes:BK.PROG.heroes})');
  await Gu('[...document.querySelectorAll("#olguest button")].find(b=>b.textContent==="PYRO").click()');
  await until(guest, 'BKGUEST.state().phase === "play"', 10000, 'the guest to be in');
  ok((await H('BK.state')) === 'map', '2: the host, on the title, goes on to the map with player two armed');
  await H(`import('/src/level.js').then(({LEVELS})=>{BK.load(LEVELS.findIndex(l=>l.id==='wood'));BK.start();BK.god=true;return true;})`);
  await sleep(1500);
  const pl = await H('BK.players().map(p=>p.hero)');
  ok(pl.length === 2 && pl[1] === 'pyro', '2: in the wood, player two is the guest\'s OWN PYRO: ' + pl + ' ' + JSON.stringify(await H('BKONLINE.debug().sess')));
  const seat2 = await H('BK.coopSave.seats()[1]');
  ok(seat2.prof && seat2.prof.dest === 'online' && seat2.prof.slot === 0 && seat2.prof.lv === 6 && seat2.prof.base.coins === 777, '2: the host seats him FROM HIS SNAPSHOT - his slot 1, his level 6, his purse 777: ' + JSON.stringify(seat2.prof));

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

  // ---- 10. GRAB (claude/partnerthrow): the guest can GRAB the host's hero and BE GRABBED; the scream is in the stream; nothing desyncs ----
  /* the host plays in real time here, so every check polls. Both heroes stand together on the ground; the host's god mode keeps a stray goblin out of it. */
  const standTogether = async () => { await H('(()=>{const [a,b]=BK.players();a.vx=a.vy=b.vx=b.vy=0;b.x=a.x+10;b.y=a.y;BK.partnerThrow().reset();return true})()'); await until(host, '(()=>{const [a,b]=BK.players();return a.ground&&b.ground&&Math.abs(a.x-b.x)<14&&!a.ptC&&!b.ptC&&!a.ptH&&!b.ptH&&!a.ptF&&!b.ptF&&!(a.hurt>0)&&!(b.hurt>0)&&!(a.ptCd>0)&&!(b.ptCd>0)})()', 8000, 'both heroes standing together'); };
  await H('(()=>{BK.SET.music=false;BK.SET.ambient=false;return true})()');
  await standTogether();
  const label10 = await until(guest, 'BKGUEST.state().grab', 6000, "the host's GRAB state reaching the guest's touch button").catch(() => null);
  ok(label10 === 'GRAB', '10: the guest\'s touch layer is told GRAB while his partner stands in reach: ' + label10);
  const gbtn = await Gu('(async()=>{await new Promise(r=>setTimeout(r,200));return BKGUEST.touch.debug().buttons.map(b=>b.k)})()');
  ok(gbtn.includes('ctx'), '10: ...and shows the second contextual button: ' + gbtn.join(','));
  /* the sound: tap the guest's stream before the grab, music and ambience off on the host, and watch the level */
  await Gu(`(()=>{const s=BKGUEST.video.srcObject,ac=new AudioContext(),src=ac.createMediaStreamSource(s),an=ac.createAnalyser();an.fftSize=1024;src.connect(an);window.__lvl={ac,an,max:0,buf:new Float32Array(1024)};ac.resume();window.__lvl.t=setInterval(()=>{an.getFloatTimeDomainData(__lvl.buf);let m=0;for(const v of __lvl.buf)m=Math.max(m,Math.abs(v));__lvl.max=Math.max(__lvl.max,m);},25);return ac.state})()`);
  await sleep(1200); const quiet = await Gu('(()=>{const m=__lvl.max;__lvl.max=0;return m})()');
  const scr0 = await H('BK.partnerThrow().stats.screams');
  await key(guest, 'i', 'keyDown'); await key(guest, 'i', 'keyUp');
  const grabbed = await until(host, '(()=>{const [a,b]=BK.players();return a.ptH&&b.ptC&&b.ptC.v===a&&{ay:a.y,by:b.y}})()', 6000, 'the guest to lift player one').catch(() => null);
  ok(!!grabbed, "10: the GUEST's GRAB key (I) lifts the host's hero (player one dangles over player two): " + JSON.stringify(grabbed));
  await sleep(2200);
  const loud = await Gu('__lvl.max'), scr1 = await H('BK.partnerThrow().stats.screams');
  ok(scr1 - scr0 >= 2, '10: he SCREAMS on the host while held (' + (scr1 - scr0) + ' in ~2 s)');
  ok(await Gu('BKGUEST.state().audio') && loud > 0, '10: the scream goes out on the host master, which is the stream the guest hears: the guest stream has a live audio track (peak ' + loud.toFixed(3) + ', baseline ' + quiet.toFixed(3) + ' - the level itself is not asserted: the wood is never silent)');
  ok((await Gu('BKGUEST.state().grab')) === 'THROW', "10: the guest's button now reads THROW");
  const f0 = (await Gu('BKGUEST.state().frames'));
  await key(guest, 'i', 'keyDown'); await key(guest, 'i', 'keyUp');
  const flew = await until(host, '(()=>{const [a,b]=BK.players();return !!a.ptF||a.ptF===null&&BK.partnerThrow().stats.throws>0})()', 6000, 'the throw').catch(() => false);
  await until(host, '(()=>{const [a,b]=BK.players();return !a.ptF&&!a.ptH&&!b.ptC&&BK.partnerThrow().stats.landings>0})()', 8000, 'player one to land').catch(() => {});
  const st10 = await H('(()=>{const s=BK.partnerThrow().stats;const [a,b]=BK.players();return {throws:s.throws,landings:s.landings,held:!!a.ptH,fly:!!a.ptF,ground:a.ground}})()');
  ok(flew && st10.throws === 1 && st10.landings === 1 && !st10.held && !st10.fly, "10: the guest's second press THROWS player one, and he lands: " + JSON.stringify(st10));
  ok((await Gu('BKGUEST.state().frames')) > f0 + 20, '10: the stream kept running through the throw (no stall, no desync)');
  /* and the GUEST is grabbed: the host lifts player two, who mashes his own jump key to wriggle free */
  await standTogether();
  await H('BK.press("grab")');
  const held2 = await until(host, '(()=>{const [a,b]=BK.players();return b.ptH&&a.ptC&&a.ptC.v===b})()', 6000, 'the host to lift the guest').catch(() => false);
  ok(!!held2, '10: the host\'s GRAB lifts the GUEST\'s hero (player two dangles)');
  const sc2 = await H('BK.partnerThrow().stats.screams'); await sleep(2400);
  ok((await H('BK.partnerThrow().stats.screams')) - sc2 >= 1, "10: ...and the guest's hero screams in his own voice (the host plays it, the guest hears it)");
  for (let i = 0; i < 7; i++) { await key(guest, 'z', 'keyDown'); await sleep(60); await key(guest, 'z', 'keyUp'); await sleep(80); }
  const wiggled = await until(host, '(()=>{const [a,b]=BK.players();return !b.ptH&&!a.ptC&&BK.partnerThrow().stats.frees>0})()', 6000, 'the guest to wriggle free').catch(() => false);
  ok(!!wiggled, "10: the guest MASHES his jump key and wriggles free (his presses reach player two's wiggle bar)");
  await standTogether();
  ok(guest.errors.length === 0 && host.errors.length === 0, '10: no page error through the grabs: ' + guest.errors.concat(host.errors).slice(0, 2).join(' | '));
  await Gu('(()=>{clearInterval(__lvl.t);return true})()');

  // ---- 11. CO-OP PROGRESSION (claude/coopprogress): he earns on HIS OWN save ----
  const slot0 = async () => JSON.parse(await guest.evalp('localStorage.getItem("bracken.progress.0")', 8000));
  const hostNow = () => H('JSON.stringify({pyro:(BK.PROG.xp||{}).pyro||0,coins:BK.PROG.coins||0,heroes:BK.PROG.heroes})');
  const g0 = await slot0();
  ok(await H('BK.coopSave.gain(2, 150, 9)'), '11: player two earns in his own pass (a kill\'s XP, a gold drop)');
  const e1 = await H('BK.coopSave.seats()[1].prof.earned');
  ok(e1.xp > 0 && e1.coins === 9, '11: the host\'s ledger has it: ' + JSON.stringify(e1));
  ok((await Gu('BKGUEST.state().credits')) === 0, '11: nothing is written before a checkpoint');
  await H('BK.coopSave.bank(2)');   /* A CHECKPOINT: his bank at a shrine */
  await until(guest, 'BKGUEST.state().credits >= 1', 8000, 'the checkpoint credit to reach the guest');
  const g1 = await slot0();
  ok(g1.xp.pyro - g0.xp.pyro === e1.xp && g1.coins - g0.coins === 9, '11: at the CHECKPOINT his own browser writes what he earned into HIS slot: +' + (g1.xp.pyro - g0.xp.pyro) + ' XP (host says ' + e1.xp + '), +' + (g1.coins - g0.coins) + ' silver');
  ok((await hostNow()) === hostBefore, '11: the HOST\'s save took none of it (no pyro XP, no silver, no hero): ' + (await hostNow()));
  ok(/SAVED SLOT 1: \+\d+ XP, \+9 SILVER/.test(await Gu('document.getElementById("olstrip").innerText')), '11: the guest\'s strip says what was saved: ' + (await Gu('document.getElementById("olstrip").innerText')));
  const dup = await Gu('(()=>{const n=BKGUEST.state().dups;BKGUEST.earn(BKGUEST.state().lastC);return BKGUEST.state().dups-n})()');
  ok(dup === 1 && JSON.stringify(await slot0()) === JSON.stringify(g1), '11: the same credit again is NOT paid twice');
  ok(await H('BK.coopSave.gain(2, 80, 0)'), '11: he earns more, unbanked');
  // ---- 7. the guest goes: player two drops out cleanly ----
  const errs0 = host.errors.length;
  await nav(guest, URL0 + 'manifest.webmanifest', 'true');
  await until(host, 'BK.players().length === 1', 15000, 'player two to drop out on the host');
  const d7 = await H('({st:BK.state,n:BK.players().length,ph:BKONLINE.debug().sess.phase,hero:BKONLINE.debug().sess.hero,remote:BKONLINE.debug().remote,p1:!BK.players()[0].dead})');
  ok(d7.n === 1 && d7.st === 'play' && d7.p1, '7: the guest leaving drops player two and the wood goes on: ' + JSON.stringify(d7));
  ok(d7.ph === 'waiting' && !d7.hero && !d7.remote, '7: the room waits for him again (same code)');
  await sleep(1200); ok((await H('BK.players().length')) === 1, '7: player two stays out at the next level-free frame (coopWant is off)');
  ok(host.errors.length === errs0, '7: no page error on the host when he went: ' + host.errors.slice(errs0).join(' | '));
  ok(JSON.stringify(await slot0()) === JSON.stringify(g1), '11: the link dropped with no goodbye: he keeps what the last checkpoint paid (PARTIAL), the unbanked since is not written');

  // ---- 8. the guest's save ----
  /* DESIGN CHANGE (10-11): the guest's remembered volume lives under its own key, so the identical-storage assertion excludes exactly that one key and nothing else */
  /* DESIGN CHANGE (claude/coopprogress, scratch brief-coopprogress.md): identical EXCEPT the earned rewards in the slot he chose - xp of his hero, coins, the credit book */
  const after = await guest.evalp(`(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k==='bracken.onlineVol')continue;o[k]=localStorage.getItem(k);}return JSON.stringify(o);})()`);
  const B8 = JSON.parse(before), A8 = JSON.parse(after), K0 = 'bracken.progress.0';
  ok(JSON.stringify(Object.keys(A8).sort()) === JSON.stringify(Object.keys(B8).sort()) && Object.keys(B8).every(k => k === K0 || A8[k] === B8[k]), "8: the guest's whole localStorage except bracken.onlineVol - every other slot, his slot choice, his settings - is untouched: " + Object.keys(A8).filter(k => A8[k] !== B8[k]).join(','));
  { const b = JSON.parse(B8[K0]), a = JSON.parse(A8[K0]), diff = Object.keys({ ...a, ...b }).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).sort();
    const xpDiff = Object.keys({ ...a.xp, ...b.xp }).filter(h => a.xp[h] !== b.xp[h]);
    ok(diff.join() === 'coins,coopCredit,xp' && xpDiff.join() === 'pyro' && a.guestSentinel === 1, '8: ...and in the slot he chose ONLY the earned rewards differ (his pyro\'s xp, coins, the credit book): ' + diff.join(',') + ' / xp ' + xpDiff.join(',')); }
  // 9b. the remembered volume comes back on a rejoin
  await nav(guest, URL0 + '?join=' + code + '&net=local&relay=' + RELAY, '!!window.BKGUEST');
  await until(guest, 'BKGUEST.state().phase === "slot"', 25000, 'the guest to rejoin');
  ok(Math.abs((await Gu('BKGUEST.state().volSaved')) - 0.3) < 0.001, "9: a rejoin remembers the guest's volume (0.3)");
  // ---- 11 (cont.). the REJOIN: a new session from the credited save ----
  const sid1 = g1.coopCredit && Object.keys(g1.coopCredit)[0];
  await Gu('BKGUEST.chooseSlot(0)'); await until(guest, 'BKGUEST.state().phase === "pick"', 5000, 'the rejoin pick');
  await Gu('[...document.querySelectorAll("#olguest button")].find(b=>b.textContent==="PYRO").click()');
  await until(guest, 'BKGUEST.state().phase === "play"', 10000, 'the guest to be back in');
  await until(host, 'BK.players().length === 2 && BK.coopSave.seats()[1].prof', 10000, 'player two back on the host');
  const r2 = await H('BK.coopSave.seats()[1].prof');
  ok(r2.base.xp === g1.xp.pyro && r2.base.coins === g1.coins && r2.sid !== sid1, '11: a REJOIN is a new session whose base is the credited save (nothing is paid twice): base ' + r2.base.xp + ' = saved ' + g1.xp.pyro);
  await H('BK.coopSave.gain(2, 40, 2)'); await H('BK.coopSave.bank(2)');
  await until(guest, 'BKGUEST.state().credits >= 1', 8000, 'the rejoin\'s checkpoint credit');
  const e2 = await H('BK.coopSave.seats()[1].prof.earned'), g2 = await slot0();
  ok(g2.xp.pyro - g1.xp.pyro === e2.xp && g2.coins - g1.coins === 2 && Object.keys(g2.coopCredit).length === 2, '11: ...its checkpoint pays only its own (+' + (g2.xp.pyro - g1.xp.pyro) + ' XP, +' + (g2.coins - g1.coins) + ' silver), beside the first session in the credit book');
  /* a wood WON together: on HIS road */
  const succ = LEVELS.find(l => l.needs === 'wood' && !l.hidden);
  ok(!(g2.wood && g2.wood.cleared) && !(g2[succ.id] && g2[succ.id].cleared), '11: before: his road has not cleared THE WOOD, and ' + succ.id + ' (it needs the wood) is shut');
  await H('BK.coopSave.win()');
  await until(guest, '(()=>{const p=JSON.parse(localStorage.getItem("bracken.progress.0"));return p.wood&&p.wood.cleared})()', 8000, 'the clear to reach his save');
  const g3 = await slot0();
  ok(g3.wood.cleared && g3.done.pyro.wood === 1 && !(succ.needs && !(g3[succ.needs] && g3[succ.needs].cleared)), '11: the wood WON TOGETHER is cleared on HIS road (done for his pyro) and ' + succ.id + ' opens as for his own clear');
  ok(g3.xp.pyro > g2.xp.pyro, '11: ...with the wood\'s first-finish share on his pyro: +' + (g3.xp.pyro - g2.xp.pyro) + ' XP');
  ok((await hostNow()) !== null && JSON.parse(await hostNow()).pyro === JSON.parse(hostBefore).pyro && JSON.stringify(JSON.parse(await hostNow()).heroes) === JSON.stringify(JSON.parse(hostBefore).heroes), '11: the host\'s save still has no pyro XP and no pyro');
  await H('BK.coopSave.gain(2, 30, 0)');   /* (in the win: no foe, so a direct grant) */
  const nC = await Gu('BKGUEST.state().credits');
  await Gu('BKGUEST.leave()');
  await until(guest, 'BKGUEST.state().credits > ' + nC, 8000, 'the final credit on LEAVE');
  const g4 = await slot0();
  ok(g4.xp.pyro > g3.xp.pyro, '11: LEAVE (a goodbye) sends the final credit: +' + (g4.xp.pyro - g3.xp.pyro) + ' XP since the win');
  await until(host, 'BK.players().length === 1', 10000, 'player two to leave');
  ok(JSON.stringify(await slot0()) === JSON.stringify(g4), '11: nothing more is written once he has gone');
  ok(guest.errors.length === 0, '8: no page error on the guest: ' + guest.errors.slice(0, 2).join(' | '));
  await H('BKONLINE.end()');
} catch (e) { fails.push('aborted: ' + String(e && e.message || e).split('\n')[0]); }
finally {
  for (const pg of [guest, host]) if (pg) try { await pg.close(); } catch {}
  if (stub) await stub.close();
}
for (const n of notes) console.log('  note ' + n);
if (fails.length) { for (const f of fails) console.log('FAIL ' + f); console.log('online-coop: ' + fails.length + ' failed'); process.exit(1); }
console.log('online-coop: OK - joined by code, frames crisp at 2x, guest keys + touch drive player two (own bindings, focus-loss release), pause banner, ping, volume, clean drop-out, guest storage untouched except the earned rewards in his chosen slot; he plays his own save and earns into it (checkpoint, no double credit, partial on a drop, rejoin, a clear on his road, final on leave)');
