// src/online-guest.js - ONLINE CO-OP, THE GUEST'S PAGE (claude/onlinecoop, phase 1). index.html loads this INSTEAD of the game when the
// page is opened with ?join=CODE: the guest never runs the game at all - he watches the host's picture and sends his hands back. It reads his
// settings (his own key rebinding and his touch layout) and - CO-OP PROGRESSION step 1 (claude/coopprogress, src/coop-save.js) - HIS OWN SAVE SLOTS:
//   THE SLOT      he picks one of his slots (an empty one starts a new save; JUST VISIT saves nothing and plays the host's heroes as before), then a
//                 hero of that save; the pick carries that hero's snapshot (src/coop-save.js snapshotOf) and the host seats him from it - his level,
//                 his kit, his talents. A slot his own game has open in another tab (or another guest page plays) is refused, told (the locks).
//   THE CREDITS   the host sends what he earned at every checkpoint, and at the end ({ t: 'earn', c }); THIS page writes it into THAT slot
//                 (applyCredit: XP, silver, level clears on his road; never twice; a lost one covered by the next; the save-safety rules). Nothing
//                 else in his storage is written, except his stream volume under its own key.
//
//   THE PICTURE   a <video> of the host's 2x frame, image-rendering: pixelated, sized to a WHOLE number of screen pixels per game pixel
//                 (the same rule as the game's own canvas), so the art stays crisp; letterboxed in the game's dark green.
//   THE HANDS     the keyboard through HIS OWN bindings (src/controls.js keysTable / padTable 'pad1', Z/X swap, block toggle, skill 3 / 4
//                 keys), a pad, and on a phone the game's own touch buttons (src/touch.js createTouch, his own layout). All of them fold
//                 into one held set + the presses since the last send; it goes on every change. Focus lost = everything let go.
//   THE STRIP     ping (round trip of a ping on the data channel, every second), a HOST PAUSED / ON THE MAP banner from the host's state,
//                 and ESC (or the touch pause button) for the menu: volume of the host's sound, leave.
import { LS } from './loading-screen.js';
import * as CTL from './controls.js';
import { createTouch } from './touch.js';
import * as NET from './online-net.js';
import * as UI from './online-ui.js';
import * as CS from './coop-save.js';
import { migrateProgress } from './progression.js';

LS.bootDone();   /* the boot bar index.html put up is the game's: the guest page has nothing to load */
{ const b = document.getElementById('boot'); if (b) b.remove(); }   /* (and its 'still loading' line waits for a window.BK this page never makes) */
const q = new URLSearchParams(location.search), code = NET.cleanCode(q.get('join'));
let SET = {}; try { SET = JSON.parse(localStorage.getItem('bracken.settings') || '{}') || {}; } catch {}   /* READ ONLY */
const binds = CTL.cleanBinds(SET.binds), KT = CTL.keysTable(binds), PT = CTL.padTable(binds, 'pad1');
/* THE GUEST'S VOLUME is remembered under its OWN key, never in a save (the guest page writes nothing else) */
const VOL_KEY = 'bracken.onlineVol';
function loadVol() { try { const v = parseFloat(localStorage.getItem(VOL_KEY)); if (v >= 0 && v <= 1) return v; } catch {} return 0.8; }
function saveVol(v) { try { localStorage.setItem(VOL_KEY, String(v)); } catch {} }
const isKey = (e, list) => list.includes(e.key) || list.includes(e.code);
const HELD = ['jump', 'atk', 'dodge', 'block', 'throw', 'left', 'right', 'down', 'up', 'dance', 'talk'];

const G = { seat: 2, grab: null, phase: 'start', code, err: '', roster: [], hero: null, hostHero: '', rtt: 0, hostState: '', paused: false, menu: false, sent: 0, frames: 0, vol: loadVol(), art: {}, why: '',
  slot: null, own: [], camp: [], levels: [], names: {}, slotMsg: '', lastEarn: '', earnBad: false, earned: { xp: 0, coins: 0, clears: [] }, credits: 0, dups: 0 };   /* (claude/coopprogress) slot: his chosen save slot (-1: JUST VISIT, null: not yet) */
/* ONE CHARACTER, ONE PLACE: the slot this page plays is claimed on the channel his game's tabs listen on (src/coop-save.js makeLocks) - no storage is written for it */
const LOCKS = CS.makeLocks({ channel: typeof BroadcastChannel === 'function' ? (() => { try { return new BroadcastChannel('bracken-slots'); } catch { return null; } })() : null });
LOCKS.ask(); setInterval(() => LOCKS.beat(), CS.LOCK_BEAT); addEventListener('pagehide', () => LOCKS.releaseAll());
let link = null, net = null, stream = null;

/* ===== the page ===== */
UI.styles();
document.title = 'BRACKEN - ONLINE CO-OP';
const disp = document.getElementById('c');   /* the game's canvas, unused by a game here: it is the touch surface the touch layer reads */
const video = document.createElement('video'); video.id = 'olvideo'; video.playsInline = true; video.autoplay = true; video.muted = true;
video.style.cssText = 'position:fixed;z-index:1;image-rendering:pixelated;background:#000;display:none';
document.body.appendChild(video);
disp.style.zIndex = '2'; disp.style.background = 'transparent';
const strip = UI.el('div.olchip'); strip.id = 'olstrip'; strip.style.display = 'none'; document.body.appendChild(strip);
const banner = UI.el('div'); banner.id = 'olbanner';
banner.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:19;font:14px/1.3 "Press Start 2P",sans-serif;color:#ffd36b;background:rgba(20,16,30,.85);border:2px solid #5c3a1d;padding:8px 12px;display:none;pointer-events:none';
document.body.appendChild(banner);
let board = UI.board('olguest');
video.addEventListener('resize', place); addEventListener('resize', place);
video.requestVideoFrameCallback && (function cb() { video.requestVideoFrameCallback(() => { G.frames++; cb(); }); })();

/* THE INTEGER SCALE: game pixels (the stream is 2x) to whole screen pixels, centred; the touch layer is told the same box */
let geo = { DPR: 1, DEV: 1, S: 1, offX: 0, offY: 0 };
function place() {
  const DPR = Math.max(1, Math.min(3, devicePixelRatio || 1)), W = innerWidth, H = innerHeight;
  disp.width = Math.round(W * DPR); disp.height = Math.round(H * DPR); disp.style.width = W + 'px'; disp.style.height = H + 'px';
  const gw = (video.videoWidth || 640) / 2, gh = (video.videoHeight || 360) / 2;
  let S = Math.floor(Math.min(disp.width / gw, disp.height / gh)); const frac = S < 1; if (frac) S = Math.min(disp.width / gw, disp.height / gh);
  const offX = Math.floor((disp.width - gw * S) / 2), offY = Math.floor((disp.height - gh * S) / 2);
  geo = { DPR, DEV: DPR, S, offX, offY };
  Object.assign(video.style, { left: offX / DPR + 'px', top: offY / DPR + 'px', width: gw * S / DPR + 'px', height: gh * S / DPR + 'px' });
  if (TCH) TCH.relayout();
}

/* ===== the hands ===== */
const kb = {}, pad = {}, tk = {}, presses = new Set(); let lastSent = '';
function hold(set, k, v) { if (v) set[k] = true; else delete set[k]; }
function heldNow() { const h = {}; for (const k of HELD) if (kb[k] || pad[k] || tk[k]) h[k] = 1; return h; }
function flush(force) {
  if (!link || !link.open || G.phase !== 'play') { presses.clear(); return; }
  const h = heldNow(), sig = JSON.stringify(h);
  if (!force && sig === lastSent && !presses.size) return;
  link.send({ t: 'in', h, p: [...presses] }); presses.clear(); lastSent = sig; G.sent++;
}
function releaseAll() { for (const s of [kb, pad, tk]) for (const k in s) delete s[k]; if (TCH) TCH.releaseAll(); flush(true); }
addEventListener('blur', releaseAll);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });

addEventListener('keydown', e => {
  if (board && board.shown()) { boardKeys(e); return; }
  if (e.repeat) { e.preventDefault(); return; }
  unmute();
  if (isKey(e, KT.pause)) { e.preventDefault(); toggleMenu(); return; }
  const zx = SET.swapZX && /^[zxZX]$/.test(e.key);
  const jumpK = zx ? isKey(e, ['x', 'X']) : isKey(e, KT.jump), atkK = zx ? isKey(e, ['z', 'Z']) : isKey(e, KT.atk);
  if (jumpK) { presses.add('jump'); hold(kb, 'jump', true); }
  if (atkK) { presses.add('atk'); hold(kb, 'atk', true); }
  if (isKey(e, KT.block)) hold(kb, 'block', SET.blockToggle ? !kb.block : true);
  for (const [a, pr] of [['dodge', 1], ['throw', 1], ['grab', 1], ['talk', 1], ['left', 1], ['right', 1], ['down', 1], ['up', 1], ['dance', 0]]) if (isKey(e, KT[a])) { hold(kb, a, true); if (pr) presses.add(a); }
  if (isKey(e, KT.skill2)) presses.add('skill2');
  if (isKey(e, KT.flask)) presses.add('flask');
  if (isKey(e, KT.stance)) presses.add('stance');   /* (claude/rangerhud) a ranger guest's BOW / KNIFE */
  const lk = e.key.toLowerCase(); if (lk === String(SET.skill3Key || '3')) presses.add('skill3'); if (lk === String(SET.skill4Key || '4')) presses.add('skill4');
  e.preventDefault(); flush();
});
addEventListener('keyup', e => {
  if (board && board.shown()) return;
  const zx = SET.swapZX && /^[zxZX]$/.test(e.key);
  if (zx ? isKey(e, ['x', 'X']) : isKey(e, KT.jump)) hold(kb, 'jump', false);
  if (zx ? isKey(e, ['z', 'Z']) : isKey(e, KT.atk)) hold(kb, 'atk', false);
  if (isKey(e, KT.block) && !SET.blockToggle) hold(kb, 'block', false);
  for (const a of ['dodge', 'throw', 'talk', 'left', 'right', 'down', 'up', 'dance']) if (isKey(e, KT[a])) hold(kb, a, false);
  flush();
});
let padPrev = {};
function pollPad() {
  const gps = navigator.getGamepads ? [...navigator.getGamepads()].filter(p => p && p.connected) : []; const gp = gps[0];
  if (!gp) { if (Object.keys(pad).length) { for (const k in pad) delete pad[k]; flush(); } return; }
  const now = CTL.padStateOf(gp, PT), rose = k => now[k] && !padPrev[k];
  if (rose('pause')) toggleMenu();
  if (!G.menu) { for (const k of ['jump', 'atk', 'dodge', 'throw', 'grab', 'skill2', 'skill3', 'skill4', 'talk', 'flask', 'stance', 'left', 'right', 'up', 'down']) if (rose(k)) presses.add(k);
    for (const k of HELD) hold(pad, k, !!now[k]); }
  if (Object.values(now).some(Boolean)) unmute();
  padPrev = now; flush();
}

/* THE PHONE: the game's own touch buttons, on this page's own canvas, writing into `tk` - the same layer, his own layout and size */
const TCH = createTouch({ disp, dg: disp.getContext('2d'), q, SET, save: () => {}, geom: () => geo, state: () => (G.phase === 'play' && !G.menu ? 'play' : 'online'), keys: tk,
  initAudio: () => unmute(), press: k => { if (k === 'pause') { toggleMenu(); return; } if (k !== 'confirm') presses.add(k); queueMicrotask(() => flush()); },   /* (claude/batch86) AFTER the touch layer has set the key it holds for this button: a press sent before its hold reaches the host as a jump with the key not down - a 7 px hop, the variable-jump cut */
  stance: () => (G.hero === 'ranger' ? { s: 'bow', q: 0, mq: 0 } : null), skillOn: i => i < 2, skillInfo: () => null, phoneMode: () => {}, verb: () => ({ verb: 'USE', key: 'talk' }), ctx: () => (G.grab ? { label: G.grab, key: 'grab' } : null), autoFace: () => {}, speed: () => 0, padUsed: () => false, touched: () => {} });
place();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000); last = now;
  pollPad();
  if (TCH.on) { const ov = TCH.overlayCanvas && TCH.overlayCanvas(); const show = G.phase === 'play' && !G.menu; if (ov) ov.style.display = show ? '' : 'none'; disp.style.pointerEvents = show ? '' : 'none'; if (show) { TCH.tick(dt); TCH.beginFrame(); TCH.draw(); flushTouch(); } }
  requestAnimationFrame(frame);
}
let tkSig = ''; function flushTouch() { const s = JSON.stringify(tk); if (s !== tkSig) { tkSig = s; flush(); } }
requestAnimationFrame(frame);

/* ===== the sound: the host's mix on the video element; a browser lets it play only after a press, so the first press unmutes ===== */
function unmute() { if (!stream) return; if (video.muted) { video.muted = false; video.volume = G.vol; } video.play().catch(() => {}); }

/* ===== connecting ===== */
async function connect() {
  if (code.length < 4) { G.phase = 'code'; render(); return; }
  G.phase = 'finding'; render();
  net = await NET.join(code, {
    onLink: l => {
      link = l; G.phase = 'linking'; render();
      l.onOpen = () => { G.phase = 'opening'; l.send({ t: 'hi', v: 2 }); render(); };   /* (claude/tavern) v2: the join snapshot slot (src/online.js header) - sent empty until portable guest saves (brief-coopprogress step 1) fill it */
      l.onData = onMsg;
      l.onClose = why => { if (G.phase === 'ended') return; end(why === 'p2p' ? 'p2p' : G.why || 'lost'); };
    },
    onStream: s => { stream = s; video.srcObject = s; video.style.display = ''; video.play().catch(() => {}); place(); },
    onError: kind => end(kind),
  });
}
function onMsg(m) {
  if (m.t === 'roster') { G.roster = Array.isArray(m.heroes) ? m.heroes : []; G.hostHero = m.host || ''; G.camp = Array.isArray(m.camp) ? m.camp : G.camp; G.levels = Array.isArray(m.levels) ? m.levels : G.levels; if (m.names && typeof m.names === 'object') G.names = m.names;
    if (m.why && G.slot !== null) G.slotMsg = String(m.why).toUpperCase();   /* the host could not read the save he sent: back to the slots, told */
    G.phase = G.slot === null || (m.why && G.slot >= 0) ? 'slot' : 'pick'; if (G.phase === 'slot' && G.slot >= 0) { LOCKS.releaseRole('guest'); G.slot = null; } render(); }
  else if (m.t === 'earn') earn(m.c);
  else if (m.t === 'art') { G.art = m.art && typeof m.art === 'object' ? m.art : {}; if (G.phase === 'pick' || G.phase === 'waitgo') render(); }
  else if (m.t === 'go') { G.hero = m.hero; G.seat = +m.n || G.seat || 2; G.phase = 'play'; render(); flush(true); }
  else if (m.t === 'st') { G.grab = m.g === 'GRAB' || m.g === 'THROW' ? m.g : null; G.hostState = m.s; G.paused = !!m.paused; if (+m.n) G.seat = +m.n; showBanner(); stripView(); }
  else if (m.t === 'pong') { G.rtt = Math.round(performance.now() - m.t0); if (link) link.send({ t: 'rtt', ms: G.rtt }); stripView(); }
  else if (m.t === 'full') { G.why = 'full'; }
  else if (m.t === 'end') { const k = m.why === 'party' ? 'left' : 'ended'; G.why = k; if (G.leaving && G.phase === 'ended') { G.leaving = false; if (net) net.close(); return; } end(k); }   /* (claude/tavern) walked out of the tavern door: he left, the host did not end it */
}
setInterval(() => { if (link && link.open) link.send({ t: 'ping', t0: performance.now() }); }, 1000);   /* the ping is the heartbeat too: the host drops a guest who goes quiet */
/* the heroes he may pick: his slot's own (owned + the free starters), or the host's when he only visits */
const pickList = () => (G.slot >= 0 ? G.own.map(id => ({ id, name: G.names[id] || String(id).toUpperCase() })) : G.roster);
function pick(h) { if (!link || !link.open || !pickList().some(r => r.id === h)) return false;
  let seat = null;
  if (G.slot >= 0) { try { const raw = CS.slotRawOf(localStorage, G.slot); seat = CS.snapshotOf(raw ? migrateProgress(raw, G.camp).progress : migrateProgress(null).progress, h, G.slot); } catch (e) { G.slotMsg = 'SAVE ' + (G.slot + 1) + ' COULD NOT BE READ: ' + String(e && e.message || e).toUpperCase(); G.phase = 'slot'; G.slot = null; LOCKS.releaseRole('guest'); render(); return false; } }
  link.send(seat ? { t: 'pick', hero: h, seat } : { t: 'pick', hero: h }); G.phase = 'waitgo'; render(); unmute(); return true; }
/* HIS SLOT: one of his five (an empty one is a new save), or -1 to JUST VISIT. A slot open elsewhere (his game in another tab, another guest page) is refused */
function slots() { return Array.from({ length: CS.SLOTS }, (_, i) => { const sm = CS.slotSummary(CS.slotRawOf(localStorage, i), G.camp), h = LOCKS.holder(i, 'guest');
  const why = h ? CS.lockLine(i, h) : sm.state === 'corrupt' ? 'DAMAGED: FIX IT IN YOUR OWN GAME' : sm.state === 'newer' ? 'FROM A NEWER BRACKEN' : '';
  return { i, line: CS.summaryLine(i, sm, x => G.names[x] || String(x).toUpperCase(), h ? CS.HELD_LINE : false), ok: !why, why, heroes: sm.state === 'empty' ? CS.heroesOf({}) : sm.heroes || [] }; }); }
function chooseSlot(i) {
  if (i < 0) { G.slot = -1; G.slotMsg = ''; G.phase = 'pick'; render(); return true; }
  const sl = slots()[i]; if (!sl || !sl.ok) { G.slotMsg = sl ? sl.why : 'NO SUCH SAVE'; render(); return false; }
  const c = LOCKS.claim(i, 'guest', 'ONLINE CO-OP', 'guest'); if (!c.ok) { G.slotMsg = CS.lockLine(i, c.holder); render(); return false; }
  G.slot = i; G.own = sl.heroes; G.slotMsg = ''; G.phase = 'pick'; render(); return true;
}
/* A CREDIT FROM THE HOST: written into HIS slot here (src/coop-save.js applyCredit), and said on the strip */
function earn(c) {
  if (!(G.slot >= 0)) return;
  const r = CS.applyCredit(localStorage, CS.slotKey(G.slot), c, { campaignIds: G.camp, isLevel: id => G.levels.includes(id) });
  G.credits++; G.lastC = c;
  if (!r.ok) { G.lastEarn = r.why; G.earnBad = true; }
  else if (r.dup) G.dups++;
  else { const a = r.applied; G.earned.xp += a.xp; G.earned.coins += a.coins; for (const id of a.clears) if (!G.earned.clears.includes(id)) G.earned.clears.push(id); const l = CS.creditToast(G.seat || 2, G.slot, a); if (l) { G.lastEarn = l; G.earnBad = false; } }
  stripView(); if (G.phase !== 'play' || G.menu) render();
}
function leave() { const linked = !!(link && link.open); if (linked) link.send({ t: 'bye' }); G.why = 'left'; G.leaving = linked && G.slot >= 0; setTimeout(() => { if (net) net.close(); }, G.leaving ? 2000 : 150); end('left'); }   /* (claude/coopprogress) on his own save the link stays up until the host's goodbye (his final credit comes first), two seconds at most */
function end(kind) {
  if (G.phase === 'ended') return;
  G.phase = 'ended'; G.err = kind; releaseAll(); if (net) setTimeout(() => net.close(), G.leaving ? 2000 : 200); setTimeout(() => LOCKS.releaseAll(), G.leaving ? 2200 : 400);   /* (his slot is free again once the last credit is in)*/
  video.style.display = 'none'; try { video.srcObject = null; } catch {} stream = null; render();
}
function toggleMenu() { if (G.phase !== 'play') return; G.menu = !G.menu; releaseAll(); render(); }

/* ===== the boards ===== */
function boardKeys(e) {
  if (e.key === 'Escape' && G.phase === 'play') { e.preventDefault(); toggleMenu(); return; }
  if (e.target && e.target.tagName === 'INPUT') { if (e.key === 'Enter') { e.preventDefault(); const b = board.card.querySelector('button.go'); if (b) b.click(); } return; }
  if (UI.arrowsWalk(board.root, e)) e.preventDefault();
}
function backHome() { location.href = location.pathname; }
function render() {
  stripView(); showBanner();
  const P = G.phase, parts = [UI.el('h1', 'ONLINE CO-OP')];
  if (P === 'play' && !G.menu) { if (board) { board.remove(); board = null; } return; }
  board = UI.board('olguest');
  if (P === 'code') {
    const inp = UI.el('input'); inp.maxLength = 200;   /* (a pasted link must reach cleanCode whole: at 6 it was cut to HTTPS: first) */  inp.placeholder = 'CODE'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.addEventListener('input', () => { inp.value = NET.cleanCode(inp.value); });
    parts.push(UI.el('p', 'TYPE THE CODE YOUR FRIEND SENT'), UI.row(inp, UI.el('button.go', 'JOIN', () => { const c = NET.cleanCode(inp.value); if (c.length >= 4) location.href = location.pathname + '?join=' + c; })), UI.row(UI.el('button', 'BACK TO MY GAME', backHome)));
  } else if (P === 'finding' || P === 'linking' || P === 'opening' || P === 'start') {
    parts.push(UI.el('div.code', code), UI.el('p', P === 'finding' ? 'ASKING THE MATCHMAKER FOR THE GAME...' : P === 'linking' ? 'OPENING A DIRECT LINK TO THE HOST...' : 'SAYING HELLO...'), UI.el('p.dim', 'you play in the host\'s game with a hero from one of your own saves: what you earn is saved to it'), UI.row(UI.el('button', 'CANCEL', backHome)));
  } else if (P === 'slot') {
    parts.push(UI.el('p', 'PICK ONE OF YOUR SAVES'), UI.el('p.ok', CS.EXPLAIN_LINES[0] + ':'), UI.el('p.dim', CS.EXPLAIN_LINES[1] + ' ' + CS.EXPLAIN_LINES[2]));   /* (claude/coopclarity) the explainer card */
    for (const sl of slots()) { const b = UI.el('button' + (sl.ok ? '' : '.no'), sl.line, () => chooseSlot(sl.i)); b.dataset.slot = sl.i; if (!sl.ok) { b.disabled = true; b.title = sl.why; } parts.push(UI.row(b)); if (!sl.ok) parts.push(UI.el('p.dim', sl.why)); }
    { const v = UI.el('button', CS.VISIT_LINE, () => chooseSlot(-1)); v.dataset.slot = -1; parts.push(UI.row(v)); }
    if (G.slotMsg) parts.push(UI.el('p.bad', G.slotMsg));
    parts.push(UI.row(UI.el('button', 'LEAVE', leave)));
  } else if (P === 'pick' || P === 'waitgo') {
    const list = pickList();
    parts.push(UI.el('p', 'PICK YOUR HERO'), UI.el('p.dim', G.slot >= 0 ? 'from your save ' + (G.slot + 1) + (G.hostHero ? ' (the host plays ' + G.hostHero + ')' : '') : 'from the host\'s heroes' + (G.hostHero ? ' (the host plays ' + G.hostHero + ')' : '') + ': nothing is saved'));
    const r = UI.row(); for (const h of list) r.appendChild(heroButton(h, list[0] && h.id === list[0].id));
    parts.push(r); if (P === 'waitgo') parts.push(UI.el('p.ok', 'JOINING...'));
    parts.push(UI.el('p.dim', keysLine()), UI.row(UI.el('button', 'OTHER SAVE', () => { if (G.phase !== 'pick') return; LOCKS.releaseRole('guest'); G.slot = null; G.phase = 'slot'; render(); }), UI.el('button', 'LEAVE', leave)));
  } else if (P === 'play') {   /* the menu */
    const vol = UI.el('input'); vol.type = 'range'; vol.min = 0; vol.max = 100; vol.value = Math.round(G.vol * 100); vol.id = 'olvol'; vol.style.cssText = 'width:200px;letter-spacing:0;font-size:12px';
    vol.addEventListener('input', () => { G.vol = vol.value / 100; saveVol(G.vol); video.volume = G.vol; video.muted = G.vol === 0 ? true : false; });
    parts.push(UI.el('p', 'PLAYER ' + (G.seat || 2) + ': ' + (nameOf(G.hero))), UI.el('p.dim', 'PING ' + (G.rtt || '?') + ' MS'), UI.el(G.earnBad ? 'p.bad' : 'p.ok', savedLine()), UI.el('h2', 'HOST SOUND'), UI.row(vol),
      UI.el('p.dim', keysLine()), UI.row(UI.el('button.sel', 'BACK TO THE GAME', toggleMenu), UI.el('button', 'LEAVE THE GAME', leave)));
  } else if (P === 'ended') {
    const [t, w] = G.err === 'left' ? ['YOU LEFT THE GAME', 'The host\'s game goes on without player two. The same code takes you back in while they keep the room open.'] : NET.explain(G.err, code);
    parts.push(UI.el('p.bad', t), UI.el('p', w), G.slot >= 0 ? UI.el(G.earnBad ? 'p.bad' : 'p.ok', savedLine()) : null, G.slot >= 0 && G.err !== 'left' ? UI.el('p.dim', 'YOU KEEP EVERYTHING UP TO THE LAST SHRINE') : null, UI.row(UI.el('button.sel', 'TRY AGAIN', () => location.reload()), UI.el('button', 'BACK TO MY GAME', backHome)));
  }
  board.set(...parts);
}
/* A HERO CARD on the pick: the host's baked idle frame, pixelated at a whole number of SCREEN pixels per art pixel (about 96 css px tall), with the name as text under it */
function heroButton(h, sel) {
  const b = UI.el('button' + (sel ? '.sel.hero' : '.hero'), h.name, () => pick(h.id)), a = G.art && G.art[h.id];
  if (a && typeof a.png === 'string' && a.png.startsWith('data:image/png') && a.w > 0 && a.h > 0) {
    const dpr = Math.max(1, Math.min(3, devicePixelRatio || 1)), S = Math.max(1, Math.floor(96 * dpr / a.h)), img = new Image();
    img.src = a.png; img.alt = ''; img.draggable = false; img.className = 'heroart';
    img.style.width = a.w * S / dpr + 'px'; img.style.height = a.h * S / dpr + 'px';
    b.insertBefore(img, b.firstChild);
  }
  return b;
}
const nameOf = h => { const r = G.roster.find(x => x.id === h); return r ? r.name : G.names[h] || String(h || '').toUpperCase(); };
/* what this session has put in his slot so far */
function savedLine() { if (!(G.slot >= 0)) return 'JUST VISITING: NOTHING IS SAVED'; if (G.earnBad) return G.lastEarn; const e = G.earned, b = []; if (e.xp) b.push('+' + e.xp + ' XP'); if (e.coins) b.push('+' + e.coins + ' SILVER'); if (e.clears.length) b.push(e.clears.length + (e.clears.length > 1 ? ' WOODS' : ' WOOD'));
  return b.length ? 'SAVED TO SAVE ' + (G.slot + 1) + ': ' + b.join(', ') : 'SAVE ' + (G.slot + 1) + ': EARNINGS ARE SAVED AT EACH SHRINE'; }
function keysLine() { const L = a => CTL.labelFor(binds, 'kb', a, 1); return 'YOUR OWN KEYS: ' + L('left') + '/' + L('right') + ' MOVE, ' + L('jump') + ' JUMP, ' + L('atk') + ' ATTACK, ' + L('dodge') + ' DODGE, ESC MENU'; }
function stripView() {
  if (G.phase !== 'play') { strip.style.display = 'none'; return; }
  strip.style.display = ''; const html = 'P' + (G.seat || 2) + ' <b>' + nameOf(G.hero) + '</b> ' + (G.slot >= 0 ? 'SAVE ' + (G.slot + 1) + ' ' : '') + '<span class="' + (G.rtt > 150 ? 'bad' : 'ok') + '">PING ' + (G.rtt || '?') + ' MS</span>' + (G.lastEarn ? ' <span class="' + (G.earnBad ? 'bad' : 'ok') + '">' + G.lastEarn.replace(/[<>&]/g, '') + '</span>' : '') + ' ESC MENU';
  if (strip.dataset.h !== html) { strip.dataset.h = html; strip.innerHTML = html; }
}
function showBanner() {
  const s = G.phase === 'play' && !G.menu ? (G.paused ? 'HOST PAUSED' : G.hostState === 'map' ? 'HOST IS ON THE MAP' : G.hostState && G.hostState !== 'play' ? 'HOST IS IN THE MENUS' : '') : '';
  banner.textContent = s; banner.style.display = s ? '' : 'none';
}
window.BKGUEST = { slots, chooseSlot, earn, locks: () => ({ mine: LOCKS.mine(), others: LOCKS.others() }), state: () => ({ ...G, banner: banner.style.display === 'none' ? '' : banner.textContent, videoW: video.videoWidth, videoH: video.videoHeight, vol: video.volume, muted: video.muted, audio: !!(stream && stream.getAudioTracks().length), held: heldNow(), volSaved: G.vol, geo: { ...geo }, css: { w: parseFloat(video.style.width), h: parseFloat(video.style.height), r: getComputedStyle(video).imageRendering } }), pick, leave, toggleMenu, touch: TCH, video };
connect();
render();
