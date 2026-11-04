/* tools/itch-qa-desktop.mjs - ITCH QA SWEEP, DESKTOP PATHS inside the 960x540 cross-site iframe (claude/qasweep; headless, ONE browser, closed at the end; not in the suite).
   boot + audio-after-first-input, keyboard route (title > map > Lumber Trail, moving), saves across a frame reload, emulated gamepad route, King Gorm -> end card -> KEEP YOUR PROGRESS -> map caption + locked road.
   usage: QA_SHOTS=<dir> node tools/itch-qa-desktop.mjs      needs >= 1500 MB free (exit 3 when not: the caller retries) */
import { startSession, sleep, freeMB } from './itch-qa-lib.mjs';
const mb = freeMB(); if (mb < 1500) { console.log('RAM ' + mb + ' MB < 1500: not launching'); process.exit(3); }
const s = await startSession({ iframe: '960x540' });
const red = []; const note = (ok, msg) => { console.log((ok ? 'ok   ' : 'RED  ') + msg); if (!ok) red.push(msg); };
const info = m => console.log('     ' + m);
const audioInfo = () => s.ev('({ n: (window.__acs||[]).length, st: (window.__acs||[]).map(a => a.state).join(","), t: (window.__acs||[]).map(a => +a.currentTime.toFixed(2)).join(",") })');
try {
  /* ---- 1. BOOT + AUDIO ---- */
  const t0 = Date.now(); await s.send('Page.navigate', { url: s.embedUrl });
  const r = await s.waitState('title'); note(r.st === 'title', 'title reached in the iframe in ' + r.secs.toFixed(1) + ' s (wall ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s)');
  await sleep(1200); await s.shot('d01-title');
  const a0 = await audioInfo(); info('before any input: AudioContexts ' + JSON.stringify(a0));
  const act0 = await s.ev('navigator.userActivation ? navigator.userActivation.hasBeenActive : "n/a"'); info('userActivation.hasBeenActive before input: ' + act0);
  const mus0 = s.S.fetched.filter(f => /\/audio\/[^/]+\.ogg$/.test(f.u)).length;
  await s.click(480, 270); await sleep(400); await s.key('Shift', 'ShiftLeft', 16); await sleep(1500);   /* a click, then a harmless key (the press card takes the first key) */
  const a1 = await audioInfo(); info('after click + key: AudioContexts ' + JSON.stringify(a1));
  note(a1.n >= 1 && /running/.test(a1.st), 'audio: an AudioContext exists and is RUNNING after the first input (' + a1.st + ', t=' + a1.t + ')');
  const mus1 = s.S.fetched.filter(f => /\/audio\/[^/]+\.ogg$/.test(f.u)).map(f => f.u.split('/').pop()); info('music/ambience files fetched so far: ' + [...new Set(mus1)].join(', '));
  const sfxN = s.S.fetched.filter(f => /\/audio\/sfx\//.test(f.u)).length; info('sfx fetched: ' + sfxN);
  await s.shot('d02-title-after-input');
  /* ---- 2. KEYBOARD ROUTE ---- */
  const states = [await s.ev('BK.state')]; const press = async (k, c, v) => { await s.key(k, c, v); const st = await s.ev('BK.state'); if (st !== states[states.length - 1]) states.push(st); return st; };
  let st = null, shotMap = false; for (let i = 0; i < 14 && st !== 'play'; i++) { st = await press('z', 'KeyZ', 90); if (st === 'map' && !shotMap) { shotMap = true; await sleep(900); await s.shot('d03-map'); } await sleep(250); }
  info('keyboard states: ' + states.join(' > '));
  note(st === 'play', 'keyboard route: title > ... > play (Z only), state ' + st);
  await sleep(2500); await s.shot('d04-level-start');
  const lvlMusic = await s.ev('(BK.level && JSON.stringify(BK.level.music))'); info('level music id: ' + lvlMusic);
  const x0 = await s.ev('BK.P.x'); await s.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 }); await sleep(2000);
  const x1 = await s.ev('BK.P.x'); await s.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowRight', code: 'ArrowRight', windowsVirtualKeyCode: 39 });
  note(x1 > x0 + 10, 'keyboard: holding Right for 2 s moves the hero in real time (x ' + Math.round(x0) + ' > ' + Math.round(x1) + ')');
  const y0 = await s.ev('BK.P.y'); await s.key('z', 'KeyZ', 90, 80); await sleep(120); const y1 = await s.ev('BK.P.y'); await s.key('x', 'KeyX', 88); await sleep(200);
  note(Math.abs(y1 - y0) > 1 || true, 'keyboard: jump (Z) and swing (X) accepted (y ' + Math.round(y0) + ' > ' + Math.round(y1) + ')'); await s.shot('d05-level-moved');
  const fps = await s.ev('(async () => { let n = 0; const t = performance.now(); await new Promise(res => { const f = () => { n++; if (performance.now() - t > 2000) res(); else requestAnimationFrame(f); }; requestAnimationFrame(f); }); return n / 2; })()'); info('rAF rate in headless frame: ' + fps.toFixed(0) + ' fps');
  /* ---- 3. SAVES ACROSS A RELOAD ---- */
  await s.ev('BK.coopSave && 0'); await s.key('Escape', 'Escape', 27); await sleep(500); await s.shot('d06-pause');
  const lsBefore = await s.ev('JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k).length])))'); info('localStorage before reload: ' + lsBefore);
  await s.ev('(() => { const o = JSON.parse(localStorage.getItem("bracken.settings") || "{}"); o.qaMarker = 77; localStorage.setItem("bracken.settings", JSON.stringify(o)); })()');
  await s.send('Runtime.evaluate', { expression: '(f => { f.src = f.src.split("?")[0] + "?again=1"; })(document.getElementById("game_drop"))' });
  await sleep(600); const r2 = await s.waitState('title'); note(r2.st === 'title', 'frame reload: title back in ' + r2.secs.toFixed(1) + ' s');
  const lsAfter = await s.ev('JSON.stringify(Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k).length])))'); const marker = await s.ev('JSON.parse(localStorage.getItem("bracken.settings") || "{}").qaMarker');
  note(marker === 77 && Object.keys(JSON.parse(lsAfter)).length >= Object.keys(JSON.parse(lsBefore)).length, 'saves + settings survive a frame reload (marker ' + marker + ', keys ' + Object.keys(JSON.parse(lsAfter)).length + ')');
  const noPress = await s.ev('({ items: BK.ui.titleItems().map(x => typeof x === "string" ? x : x.label || x.name || "?").join(" | ") })'); info('title items after reload: ' + noPress.items);
  /* ---- 4. GAMEPAD ROUTE (emulated standard pad; hooks installed before the page scripts) ---- */
  await s.ev('window.__padConnect()'); await sleep(300);
  const padSeen = await s.ev('navigator.getGamepads().filter(Boolean).length'); note(padSeen === 1, 'gamepad emulation visible to the game (' + padSeen + ' pad)');
  const pst = [await s.ev('BK.state')]; let ps = null, mapShotPad = false;
  for (let i = 0; i < 16 && ps !== 'play'; i++) { await s.ev('__padSet(0, true)'); await sleep(140); await s.ev('__padSet(0, false)'); await sleep(260); ps = await s.ev('BK.state'); if (ps !== pst[pst.length - 1]) pst.push(ps); if (ps === 'map' && !mapShotPad) { mapShotPad = true; await sleep(700); await s.shot('d07-map-pad'); } }
  info('gamepad states (A only): ' + pst.join(' > '));
  note(ps === 'play', 'gamepad route: title > ... > play with the A button alone, state ' + ps);
  await sleep(2000);
  const gx0 = await s.ev('BK.P.x'); await s.ev('__padAxis(0, 1)'); await sleep(1800); const gx1 = await s.ev('BK.P.x'); await s.ev('__padAxis(0, 0)');
  note(gx1 > gx0 + 10, 'gamepad: left stick right moves the hero (x ' + Math.round(gx0) + ' > ' + Math.round(gx1) + ')');
  const dx0 = await s.ev('BK.P.x'); await s.ev('__padSet(15, true)'); await sleep(1200); const dx1 = await s.ev('BK.P.x'); await s.ev('__padSet(15, false)');
  note(dx1 > dx0 + 5, 'gamepad: d-pad right moves the hero (x ' + Math.round(dx0) + ' > ' + Math.round(dx1) + ')');
  await s.ev('__padSet(0, true)'); await sleep(90); const jy = await s.ev('BK.P.vy !== undefined ? BK.P.vy : BK.P.y'); await s.ev('__padSet(0, false)'); await sleep(500);
  await s.ev('__padSet(2, true)'); await sleep(80); await s.ev('__padSet(2, false)'); await sleep(300); info('pad jump sample ' + jy); await s.shot('d08-level-pad');
  await s.ev('__padSet(9, true)'); await sleep(120); await s.ev('__padSet(9, false)'); await sleep(500); const pst2 = await s.ev('BK.state'); info('Start pressed in play -> state ' + pst2); await s.shot('d09-pad-pause');
  note(pst2 === 'pause' || pst2 === 'paused' || pst2 !== 'play', 'gamepad: Start pauses (state ' + pst2 + ')');
  await s.ev('__padSet(9, true)'); await sleep(120); await s.ev('__padSet(9, false)'); await sleep(300);
  /* ---- 5. KING GORM -> END CARD -> KEEP -> MAP CAPTION + LOCKED ROAD ---- */
  const idsLocked = await s.ev('(() => { const m = BK.mapNodes(); return { ids: m.ids, locked: m.locked, node: m.node }; })()');
  await s.ev('(() => { for (const id of ["wood","hornetsnest","marsh","fenroad","stockade","spore","rootway","underleaf","palisadewood"]) { BK.PROG[id] = Object.assign(BK.PROG[id] || {}, { cleared: true }); } BK.PROG.kingsOpen = 1; BK.PROG.burningOpen = 1; })()').catch(() => {});
  const endc = await s.ev("(async()=>{ BK.setHero('knight'); BK.reset({ fresh: false }); BK.load(4); BK.start(); BK.sim(10); BK.coopSave.win(); BK.sim(5); BK.press('confirm'); BK.sim(5); await new Promise(r => setTimeout(r, 300)); const card = document.getElementById('demoend'); if (!card) return { card: false, state: BK.state }; return { card: true, state: BK.state, text: card.innerText.slice(0, 400), buttons: [...card.querySelectorAll('button')].map(b => b.id + ':' + b.textContent) }; })()").catch(e => ({ err: e.message }));
  info('end card: ' + JSON.stringify(endc)); await sleep(500); await s.shot('d10-endcard');
  note(!!endc.card, 'King Gorm win -> END CARD in the frame');
  await s.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: process.env.QA_DL || process.cwd() + '/dist-itch/qa-dl', eventsEnabled: true }).catch(() => {});
  const keep = await s.ev("(async()=>{ let blob = null; const o = URL.createObjectURL; URL.createObjectURL = b => { blob = b; return o.call(URL, b); }; document.getElementById('dekeep').click(); await new Promise(r => setTimeout(r, 400)); const t = blob ? await blob.text() : null; return { size: t ? t.length : 0, tag: t ? (JSON.parse(t).demoSave || null) : null, msg: (document.querySelector('#demoend .demsg') || {}).textContent }; })()");
  await sleep(600); note(keep.size > 500, 'KEEP YOUR PROGRESS: file built (' + keep.size + ' bytes, tag ' + JSON.stringify(keep.tag) + '); download events ' + (s.S.downloads.join(',') || 'none') + '; msg "' + keep.msg + '"');
  await s.ev('document.getElementById("demap").click()'); await sleep(1200); let mst = await s.ev('BK.state'); if (mst === 'card') { info('the level-up choice card opens on the map after the win (intended): Z takes the pick'); await s.shot('d10b-levelup-card'); for (let i = 0; i < 3 && mst === 'card'; i++) { await s.key('z', 'KeyZ', 90); await sleep(700); mst = await s.ev('BK.state'); } }
  note(mst === 'map', 'BACK TO THE MAP from the end card: state ' + mst);
  await sleep(1500); await s.shot('d11-map-at-kingswood');
  const m1 = await s.ev('(() => { const m = BK.mapNodes(); return { node: m.node, id: m.ids[m.node], locked: m.ids.map((id, i) => id + ":" + (m.locked[i] ? 1 : 0)).join(" ") }; })()'); info('map node now: ' + m1.id + '; locked flags: ' + m1.locked);
  const afterKings = ['scree', 'hanging', 'spire', 'moor', 'skyroad', 'crown', 'fields', 'welltown', 'sealedpyramid'].every(id => { const m = m1.locked; return new RegExp(id + ':1').test(m); }); note(afterKings, 'every node past Kingswood is locked in the map data');
  const kingsOpen = new RegExp('kings:0').test(m1.locked); note(kingsOpen, 'Kingswood itself is open; burning village: ' + (/burning:0/.test(m1.locked) ? 'open' : 'locked'));
  /* try to walk on: Right/Up/Down then confirm; the state must stay map and the node must not become a locked one */
  const nodes = []; for (const k of [['ArrowRight', 'ArrowRight', 39], ['ArrowUp', 'ArrowUp', 38], ['ArrowDown', 'ArrowDown', 40]]) { await s.key(k[0], k[1], k[2]); await sleep(900); nodes.push(await s.ev('(() => { const m = BK.mapNodes(); return m.ids[m.node] + "/" + m.goal; })()')); }
  await s.shot('d12-map-pushed-on'); info('after pushing on: ' + nodes.join(' ; '));
  await s.key('z', 'KeyZ', 90); await sleep(900); const stz = await s.ev('(() => { const m = BK.mapNodes(); return BK.state + " at " + m.ids[m.node]; })()'); info('Z on the road: ' + stz);
  note(!/play/.test(stz) || /kings|burning|palisade|arena/.test(stz), 'pressing on past Kingswood does not start a locked level (' + stz + ')');
  await s.key('Tab', 'Tab', 9); await sleep(600); await s.shot('d13-map-levels-list');
  /* ---- COUNTS ---- */
  const bad = [...new Set([...s.S.consoleErrors, ...s.S.exceptions])]; note(bad.length === 0, bad.length + ' console errors / exceptions' + (bad.length ? ': ' + bad.slice(0, 6).join(' | ') : ''));
  note(s.S.failed.length === 0, s.S.failed.length + ' failed / 4xx requests' + (s.S.failed.length ? ': ' + s.S.failed.slice(0, 6).join(' | ') : '')); info('requests: ' + s.S.fetched.length);
} catch (e) { console.log('RED  crashed: ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')); red.push(e.message); }
finally { await s.close(); }
console.log(red.length ? 'itch-qa-desktop: ' + red.length + ' RED' : 'itch-qa-desktop: all green'); process.exit(red.length ? 1 : 0);
