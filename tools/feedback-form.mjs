/* tools/feedback-form.mjs - GIVE FEEDBACK, THE IN-GAME FORM (claude/feedback, Daniel 11-03).
 *   A. STATIC   the GIVE FEEDBACK rows (title top level, pause menu) are wired; FEEDBACK_FORM_URL ships EMPTY; new filenames / ids / classes carry no ad-block word.
 *   B. FORM     from the title row: 1-5 rating, 10 'liked' + 10 'frustrating' chips, one text box, SEND, BACK; hero / level / build shown and NOT editable (the only
 *               field is the textarea); the line 'Sends only what you type, plus build, level and hero.'; from the pause menu in a level the level name is the real one.
 *   C. KEYS     real key events: arrows walk rating > liked > frustrating > text > SEND/BACK (and wrap), Z toggles a chip, ESC closes; the game under it sees none.
 *   D. PAD      a fake pad: d-pad / stick walk, A takes, B closes; the game's own pad poll sees none of it.
 *   E. NO NET   FEEDBACK_FORM_URL empty: Send shows 'Thanks!', ZERO requests (fetch / XHR / beacon / image / socket), the note is kept in localStorage; 1 send a minute; 1000-char cap.
 *   F. POST     a DUMMY url + entry ids, fetch intercepted in the page (never sent): POST, mode no-cors, entry.N=value, checkbox keys repeat, no save field; an offline reject is quiet.
 *   G. FIT      at 1280x720, 960x540, 640x360 and a 375x667 phone the card keeps every control inside it, nothing sideways; SEND is reachable.
 * usage: node tools/feedback-form.mjs [shotDir]      (shotDir: save screenshots of the form there)
 */
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage } from './cdp.mjs';
import { PAUSE_ROWS } from '../src/ui-hud.js';
import { FEEDBACK_FORM_URL, FEEDBACK_FIELDS, FEEDBACK_TOPICS, FEEDBACK_MAX_CHARS } from '../src/feedback-config.js';

const rd = f => readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const main = rd('src/main.js'), form = rd('src/feedback-form.js');
const shotDir = process.argv[2]; if (shotDir) mkdirSync(shotDir, { recursive: true });
const ok = m => console.log('ok  ' + m);

/* ---- A. static ---- */
assert.equal(FEEDBACK_FORM_URL, '', 'the shipped FEEDBACK_FORM_URL is empty until Daniel creates the form');
assert.deepEqual(Object.keys(FEEDBACK_FIELDS), ['rating', 'hero', 'level', 'build', 'liked', 'frustrating', 'text'], 'the seven fields');
assert.deepEqual(FEEDBACK_TOPICS, ['Combat', 'Bosses', 'Platforming', 'Co-op', 'Heroes', 'Difficulty', 'Controls', 'Art', 'Music', 'Performance']);
assert.ok(PAUSE_ROWS.includes('Give feedback'), 'the pause menu has a Give feedback row');
assert.ok(/k === 'GIVE FEEDBACK'\) openFeedback\(\)/.test(main) && /k === 'Give feedback'\) openFeedback\(\)/.test(main), 'both rows open the form');
assert.ok(/FBF\.isOpen\(\)/.test(main), 'the game pad poll stands down while the form is up');
const BAD = /track|analytic|admiral|banner|beacon|telemetry|stats|(^|[^a-z])ad([^a-z]|s\b|$)/i;
const names = ['src/feedback-form.js', 'src/feedback-config.js', 'tools/feedback-form.mjs'];
for (const n of names) assert.ok(!BAD.test(n.split('/').pop()), 'ad-block-safe filename: ' + n);
const ids = new Set([...form.matchAll(/#(fb\w+)|\.id = '([\w-]+)'|\bID = '([\w-]+)'|'(?:button|div|p|h1|h2|span|textarea)?\.([\w.-]+)'|dataset\.(\w+)/g)].flatMap(m => m.slice(1).filter(Boolean)));
const cssWords = [...form.matchAll(/[#.]([A-Za-z][\w-]*)/g)].map(m => m[1]).filter(w => /^(fb|ob|on|go|sel|bad|dim|ok|row)/.test(w));
for (const w of [...ids, ...cssWords]) assert.ok(!BAD.test(w), 'ad-block-safe id/class: ' + w);
ok('A static       rows wired, URL empty, 7 fields, ' + names.length + ' filenames and ' + (ids.size + cssWords.length) + ' ids/classes carry no ad-block word');

const pg = await openPage({ audio: false });
const shot = async name => { if (!shotDir) return; const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(shotDir, name + '.png'), Buffer.from(r.result.data, 'base64')); };
const key = async (k, extra = {}) => { const code = { ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Escape: 27, Enter: 13, z: 90, ' ': 32 }[k] || 0; for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: k, code: k.length === 1 ? 'Key' + k.toUpperCase() : k, windowsVirtualKeyCode: code, ...(type === 'keyDown' && k.length === 1 && k !== ' ' ? { text: k } : {}), ...extra }); await pg.evalp('new Promise(r=>setTimeout(r,30))'); };
const FOC = `(()=>{const e=document.activeElement; if(!e||e===document.body) return ''; if(e.id) return e.id; if(e.dataset.n) return 'rate'+e.dataset.n; if(e.dataset.topic) return (e.closest('.fbbad')?'bad:':'like:')+e.dataset.topic; return e.tagName;})()`;
const foc = () => pg.evalp(FOC);
try {
  /* ---- B. the form from the title ---- */
  const b = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero('knight'); BK.reset({ fresh: true }); BK.ui.pressCard = false; BK.state = 'title'; BK.step(150);
    const items = BK.ui.titleItems(); const i = items.indexOf('GIVE FEEDBACK'); BK.ui.titleI = i; const before = { st: BK.state, i: BK.ui.titleI };
    BK.press('confirm'); BK.step(3); await new Promise(r => setTimeout(r, 80));
    const root = document.getElementById('fbform'); if (!root) return { items, i, open: false };
    const q = s => [...root.querySelectorAll(s)];
    return { items, i, open: true, text: root.innerText, rate: q('button.fbrate').length, chips: q('button.fbchip').length, like: q('button.fbchip').slice(0, 10).map(x => x.dataset.topic), bad: q('.fbbad button.fbchip').map(x => x.dataset.topic),
      tas: q('textarea').length, inputs: q('input').length, send: !!q('#fbsend')[0], back: !!q('#fbback')[0], who: q('.fbwho')[0].innerText, note: q('.fbnote')[0].innerText, focus: ${FOC}, st: BK.state, ti: BK.ui.titleI, before }; })()`);
  assert.ok(b.i >= 0 && b.open, 'the title has a GIVE FEEDBACK row that opens the form: ' + b.items.join('|'));
  assert.equal(b.rate, 5, 'five rating buttons'); assert.equal(b.chips, 20, 'ten liked + ten frustrating chips');
  assert.deepEqual(b.like, FEEDBACK_TOPICS, 'liked chips in the form order'); assert.deepEqual(b.bad, FEEDBACK_TOPICS, 'frustrating chips in the form order');
  assert.equal(b.tas, 1); assert.equal(b.inputs, 0, 'hero, level and build are shown, not editable: no input fields'); assert.ok(b.send && b.back);
  assert.equal(b.note, 'Sends only what you type, plus build, level and hero.');
  assert.match(b.who, /HERO\s+KNIGHT/); assert.match(b.who, /LEVEL\s+MENU/); assert.match(b.who, /BUILD\s+BATCH\d+/i);
  assert.equal(b.focus, 'rate1', 'the first rating button has the focus'); assert.deepEqual([b.st, b.ti], [b.before.st, b.before.i]);
  assert.ok(/GIVE FEEDBACK/.test(b.text) && /LIKE/.test(b.text) && /FRUSTRATING/.test(b.text));
  ok('B form (title) 5 ratings, 20 chips (' + FEEDBACK_TOPICS.length + ' x2), 1 text box, SEND + BACK, hero/level/build shown read-only, the disclosure line exact');
  await shot('form-title-open');

  /* ---- C. keys (real key events) ---- */
  const seq = [await foc()]; await key('ArrowRight'); seq.push(await foc()); await key('ArrowLeft'); seq.push(await foc());
  assert.deepEqual(seq, ['rate1', 'rate2', 'rate1'], 'LEFT/RIGHT walk the rating: ' + seq);
  const visit = []; for (let n = 0; n < 14; n++) { await key('ArrowDown'); const f = await foc(); visit.push(f); if (f === 'fbtext') break; }
  assert.ok(visit.includes('fbtext'), 'DOWN reaches the text box: ' + visit); const kinds = visit.map(f => f.startsWith('like:') ? 'like' : f.startsWith('bad:') ? 'bad' : f);
  const first = k => kinds.indexOf(k); assert.ok(first('like') >= 0 && first('like') < first('bad') && first('bad') < first('fbtext'), 'rating > liked > frustrating > text: ' + kinds);
  await key('ArrowDown'); const afterText = await foc(); assert.ok(['fbsend', 'fbback'].includes(afterText), 'DOWN from the (empty) text box reaches SEND/BACK: ' + afterText);
  await key('ArrowDown'); const wrapped = await foc(); assert.ok(/^rate\d$/.test(wrapped), 'DOWN from the bottom row wraps to the rating: ' + wrapped);
  await key('ArrowUp'); assert.ok(['fbsend', 'fbback'].includes(await foc()), 'UP from the top wraps to the bottom row');
  await key('ArrowUp'); assert.equal(await foc(), 'fbtext', 'UP from SEND returns to the text box');
  /* typing goes into the box (not the game); arrow keys inside it move the caret */
  await pg.send('Input.insertText', { text: 'the bridge was great' }); await key('ArrowLeft'); assert.equal(await foc(), 'fbtext', 'LEFT inside the text box stays in it');
  const typed = await pg.evalp(`document.getElementById('fbtext').value`); assert.equal(typed, 'the bridge was great');
  await key('ArrowUp'); const upFromText = await foc(); assert.ok(/^bad:/.test(upFromText), 'UP from the text box returns to the frustrating chips: ' + upFromText);
  await key('z'); const on = await pg.evalp(`document.getElementById('fbform').querySelectorAll('button.fbchip.on').length`); assert.equal(on, 1, 'Z ticks the focused chip'); await key('z');
  assert.equal(await pg.evalp(`document.querySelectorAll('#fbform button.fbchip.on').length`), 0, 'Z again unticks it');
  await key('Enter'); assert.equal(await pg.evalp(`document.querySelectorAll('#fbform button.fbchip.on').length`), 1, 'ENTER ticks too'); await key(' ');
  assert.equal(await pg.evalp(`document.querySelectorAll('#fbform button.fbchip.on').length`), 0, 'SPACE unticks (once, not twice)');
  /* tick a few for the screenshots, focus a chip */
  await pg.evalp(`(()=>{const q=s=>document.querySelector(s); q('#fbform button.fbrate[data-n="4"]').click(); q('#fbform button[data-topic="Combat"]').click(); q('#fbform button[data-topic="Bosses"]').click(); q('#fbform .fbbad button[data-topic="Controls"]').click(); q('#fbform button[data-topic="Platforming"]').focus(); })()`);
  await shot('form-keyboard-focus');
  const leak = await pg.evalp(`({ st: BK.state, ti: BK.ui.titleI })`); assert.deepEqual([leak.st, leak.ti], [b.before.st, b.before.i], 'no key reached the game under the form: ' + JSON.stringify(leak));
  await key('Escape'); assert.equal(await pg.evalp(`!!document.getElementById('fbform')`), false, 'ESC closes the form');
  assert.equal(await pg.evalp(`BK.state`), 'title', 'and the game is where it was');
  ok('C keys        arrows walk rating>liked>frustrating>text>send (wrap both ways), Z / ENTER / SPACE tick once, typing + caret stay in the box, ESC closes, the game saw nothing');

  /* ---- D. gamepad (a fake pad in the page) ---- */
  await pg.evalp(`(()=>{ window.__pad = { id: 'fake', index: 0, connected: true, axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) }; navigator.getGamepads = () => [window.__pad]; })()`);
  /* (batch150) hold the pad for whole animation frames, not 90 ms of wall clock: a slow frame under load swallowed the press (flaky 2 of 3 runs) */
  const padTap = async (btn, ax) => { await pg.evalp(`(async()=>{ const frames = n => new Promise(r => { const f = () => --n <= 0 ? r() : requestAnimationFrame(f); requestAnimationFrame(f); }); const p = window.__pad; ${ax ? `p.axes[${ax[0]}] = ${ax[1]};` : `p.buttons[${btn}].pressed = true;`} await frames(4); p.axes[0] = 0; p.axes[1] = 0; p.buttons.forEach(x => x.pressed = false); await frames(3); })()`); };
  await pg.evalp(`(()=>{ BK.state='title'; BK.ui.titleI = BK.ui.titleItems().indexOf('GIVE FEEDBACK'); BK.press('confirm'); BK.step(3); })()`);
  assert.equal(await pg.evalp(`!!document.getElementById('fbform')`), true, 'the form re-opens'); const d0 = await pg.evalp(`JSON.stringify(BK.ui.titleI)`);
  assert.equal(await foc(), 'rate1'); await padTap(15); assert.equal(await foc(), 'rate2', 'd-pad RIGHT walks'); await padTap(14); assert.equal(await foc(), 'rate1', 'd-pad LEFT walks');
  await padTap(13); assert.ok(/^like:/.test(await foc()), 'd-pad DOWN reaches the liked chips: ' + await foc());
  await padTap(null, [1, 1]); assert.ok(/^(like|bad):/.test(await foc()), 'the left stick walks too: ' + await foc());
  await padTap(0); const ticked = await pg.evalp(`document.querySelectorAll('#fbform button.fbchip.on').length`); assert.ok(ticked >= 1, 'A ticks a chip');
  let steps = 0; while (!['fbsend', 'fbback'].includes(await foc()) && steps++ < 20) await padTap(13);
  assert.ok(['fbsend', 'fbback'].includes(await foc()), 'd-pad DOWN gets to SEND/BACK within ' + steps + ' presses');
  await pg.evalp(`document.getElementById('fbsend').focus()`); await shot('form-gamepad-focus');
  await pg.evalp(`BK.step(5)`); const pl = await pg.evalp(`({ st: BK.state, ti: BK.ui.titleI, open: !!document.getElementById('fbform') })`); assert.deepEqual([pl.st, String(pl.ti), pl.open], ['title', d0, true], 'the game saw no pad press: ' + JSON.stringify(pl));
  await padTap(1); assert.equal(await pg.evalp(`!!document.getElementById('fbform')`), false, 'B closes the form');
  await pg.evalp(`BK.step(5)`); assert.equal(await pg.evalp(`BK.state`), 'title', 'and the held B did not leak to the game');
  ok('D pad         d-pad + stick walk, A ticks / takes, B closes, the game under the form saw no pad press');

  /* ---- the pause menu in a level: the real level name ---- */
  const pz = await pg.evalp(`(async()=>{ const press=(k,n=1)=>{for(let j=0;j<n;j++){BK.press(k);BK.sim(1);}};
    BK.setHero('pyro'); BK.reset({fresh:true}); BK.load(0); BK.state='play'; BK.step(30); BK.press('pause'); BK.sim(2); if(BK.state!=='menu') return { err: 'pause: '+BK.state };
    const PR=${JSON.stringify(PAUSE_ROWS.filter(k => k !== 'Swap hero'))}; press('down', PR.indexOf('Give feedback')); press('confirm'); await new Promise(r=>setTimeout(r,80));
    const root=document.getElementById('fbform'); return { open: !!root, who: root ? root.querySelector('.fbwho').innerText : '', st: BK.state }; })()`);
  assert.ok(pz.open, 'the pause row opens the form: ' + JSON.stringify(pz)); assert.match(pz.who, /HERO\s+PYRO/); assert.match(pz.who, /LEVEL\s+(?!MENU)\S+/);
  await shot('form-pause-level'); await key('Escape'); assert.equal(await pg.evalp(`BK.state`), 'menu', 'ESC returns to the pause menu, still paused');
  ok('B form (pause) opens from the pause menu in a level: ' + pz.who.replace(/\s+/g, ' '));

  /* ---- E. no network with the URL empty ---- */
  const e = await pg.evalp(`(async()=>{ const reqs = [], tap = (n, o, f) => { const old = o[f]; o[f] = function (...a) { reqs.push(n + ':' + String(a[0]).slice(0, 80)); return old.apply(this, a); }; };
    tap('fetch', window, 'fetch'); tap('xhr', XMLHttpRequest.prototype, 'open'); tap('beacon', navigator, 'sendBeacon'); const W = window.WebSocket; window.WebSocket = function (...a) { reqs.push('ws:' + a[0]); return new W(...a); };
    const I = window.Image; window.Image = function (...a) { const i = new I(...a); Object.defineProperty(i, 'src', { set(v) { reqs.push('img:' + v); } }); return i; };
    const FB = await import('/src/feedback-form.js'); localStorage.removeItem('bracken-fb-last'); localStorage.removeItem('bracken-fb-local'); FB.test.resetDraft();
    BKT.PROG.coins = 424242; BKT.PROG.secretField = 'SAVEMARKER';
    const out = { reqs }; BK.state = 'title'; BK.ui.pressCard = false; BK.step(3); BK.ui.titleI = BK.ui.titleItems().indexOf('GIVE FEEDBACK'); BK.press('confirm'); BK.step(3); const q = s => document.querySelector('#fbform ' + s);
    out.noRating = await (async () => { q('#fbsend').click(); await new Promise(r => setTimeout(r, 60)); return q('.fbmsg').textContent; })();
    q('button.fbrate[data-n="5"]').click(); q('button[data-topic="Music"]').click(); const ta = q('#fbtext'); ta.value = 'x'.repeat(1500); out.maxLen = ta.maxLength; ta.value = 'loved the music ' + 'y'.repeat(1200).slice(0, 600); ta.dispatchEvent(new Event('input'));
    q('#fbsend').click(); await new Promise(r => setTimeout(r, 120)); out.thanks = document.getElementById('fbform').innerText;
    out.local = JSON.parse(localStorage.getItem('bracken-fb-local') || '[]'); out.reqsAfter = reqs.slice();
    /* a second send inside a minute */
    FB.test.close(); FB.test.open(() => ({ v: { b: 141 }, h: 'knight', ln: 'X' })); const q2 = s => document.querySelector('#fbform ' + s); q2('button.fbrate[data-n="3"]').click(); q2('#fbsend').click(); await new Promise(r => setTimeout(r, 80)); out.second = q2('.fbmsg') ? q2('.fbmsg').textContent : document.getElementById('fbform').innerText; FB.test.close();
    out.long = await FB.test.send({ rating: 4, hero: 'knight', level: 'l', build: 'b', liked: [], bad: [], text: 'z'.repeat(5000) }, Date.now() + 120000); out.local2 = JSON.parse(localStorage.getItem('bracken-fb-local') || '[]');
    out.lsDump = JSON.stringify(localStorage.getItem('bracken-fb-local'));
    return out; })()`);
  assert.match(e.noRating, /PICK A RATING/, 'no rating, no send: ' + e.noRating);
  assert.match(e.thanks, /THANKS!/, 'Send shows Thanks!: ' + e.thanks); assert.equal(e.maxLen, FEEDBACK_MAX_CHARS, 'the text box caps at ' + FEEDBACK_MAX_CHARS);
  assert.deepEqual(e.reqsAfter.filter(r => !/^fetch:(\.\/)?(audio|src)\//.test(r) && !/audio\//.test(r)), [], 'ZERO network requests with the URL empty: ' + e.reqsAfter.join(' '));
  assert.equal(e.local.length, 1); assert.equal(e.local[0].rating, 5); assert.deepEqual(e.local[0].liked, ['Music']); assert.ok(/^loved the music/.test(e.local[0].text) && e.local[0].sent === false, 'kept locally, marked unsent: ' + JSON.stringify(e.local[0]));
  assert.ok(!/424242|SAVEMARKER/.test(e.lsDump), 'the save is not in the kept note');
  assert.match(e.second, /ONE NOTE A MINUTE/, 'a second send inside a minute is refused: ' + e.second);
  assert.equal(e.long, 'kept'); assert.equal(e.local2[e.local2.length - 1].text.length, FEEDBACK_MAX_CHARS, 'text over the cap is cut to ' + FEEDBACK_MAX_CHARS);
  ok('E no network  Send says Thanks!, ' + e.reqsAfter.length + ' requests, note kept in localStorage, no save in it, 1/minute, ' + FEEDBACK_MAX_CHARS + '-char cap, rating required');

  /* ---- F. the POST shape against a DUMMY url, intercepted (never leaves the page) ---- */
  const f = await pg.evalp(`(async()=>{ const FB = await import('/src/feedback-form.js'); localStorage.removeItem('bracken-fb-last'); localStorage.removeItem('bracken-fb-local'); FB.test.resetDraft();
    FB.test.setConfig({ url: 'https://docs.google.com/forms/d/e/DUMMYFORMID123/formResponse', fields: { rating: 'entry.11', hero: 'entry.22', level: 'entry.33', build: 'entry.44', liked: 'entry.55', frustrating: 'entry.66', text: 'entry.77' } });
    const calls = []; const oldFetch = window.fetch; window.fetch = (u, init) => { calls.push({ u: String(u), method: init && init.method, mode: init && init.mode, cred: init && init.credentials, ct: init && init.body && init.body.constructor.name, body: init && init.body ? init.body.toString() : '' }); return Promise.resolve(new Response(null)); };
    BKT.PROG.coins = 424242; BKT.PROG.secretField = 'SAVEMARKER'; BK.setHero('geomancer'); BK.reset({ fresh: true }); BK.load(0); BK.state = 'play'; BK.step(20); BK.press('pause'); BK.sim(2);
    FB.test.open(BKT.bugSnapshot); const q = s => document.querySelector('#fbform ' + s);
    q('button.fbrate[data-n="4"]').click(); for (const t of ['Combat', 'Bosses']) q('button[data-topic="' + t + '"]').click(); for (const t of ['Controls']) q('.fbbad button[data-topic="' + t + '"]').click(); q('#fbtext').value = 'a note & more = ok'; q('#fbtext').dispatchEvent(new Event('input'));
    q('#fbsend').click(); await new Promise(r => setTimeout(r, 150)); const first = { calls: calls.slice(), thanks: document.getElementById('fbform').innerText };
    FB.test.close(); localStorage.removeItem('bracken-fb-last'); window.fetch = () => Promise.reject(new TypeError('Failed to fetch')); FB.test.open(BKT.bugSnapshot); q('button.fbrate[data-n="2"]').click(); let thrown = null; window.addEventListener('unhandledrejection', e => { thrown = String(e.reason); }); q('#fbsend').click(); await new Promise(r => setTimeout(r, 150));
    const off = { text: document.getElementById('fbform') ? document.getElementById('fbform').innerText : '', local: JSON.parse(localStorage.getItem('bracken-fb-local') || '[]'), thrown }; window.fetch = oldFetch; FB.test.close(); FB.test.setConfig({ url: '', fields: {} });
    return { first, off }; })()`);
  assert.equal(f.first.calls.length, 1, 'exactly one request'); const c = f.first.calls[0];
  assert.equal(c.u, 'https://docs.google.com/forms/d/e/DUMMYFORMID123/formResponse'); assert.equal(c.method, 'POST'); assert.equal(c.mode, 'no-cors'); assert.equal(c.cred, 'omit'); assert.equal(c.ct, 'URLSearchParams');
  const P = new URLSearchParams(c.body); assert.equal(P.get('entry.11'), '4'); assert.equal(P.get('entry.22'), 'geomancer'); assert.ok(P.get('entry.33') && P.get('entry.33').length > 2, 'level name: ' + P.get('entry.33')); assert.match(P.get('entry.44'), /^batch\d+/);
  assert.deepEqual(P.getAll('entry.55'), ['Combat', 'Bosses']); assert.deepEqual(P.getAll('entry.66'), ['Controls']); assert.equal(P.get('entry.77'), 'a note & more = ok');
  assert.deepEqual([...new Set([...P.keys()])].sort(), ['entry.11', 'entry.22', 'entry.33', 'entry.44', 'entry.55', 'entry.66', 'entry.77'], 'only the seven entries');
  assert.ok(!/424242|SAVEMARKER|bracken\./.test(c.body), 'no save in the body'); assert.match(f.first.thanks, /THANKS!/);
  assert.match(f.off.text, /THANKS!/, 'offline: still Thanks!, no error shown: ' + f.off.text); assert.equal(f.off.thrown, null, 'offline: no unhandled rejection'); assert.equal(f.off.local.length, 1, 'offline: the note is kept here'); assert.equal(f.off.local[0].sent, false);
  ok('F POST shape  1 request: POST, mode no-cors, credentials omit, ' + [...P.keys()].length + ' x-www-form-urlencoded entries (checkboxes repeat), no save; offline reject = quiet Thanks + kept');
  console.log('    body: ' + c.body);

  /* ---- G. fit at several viewport sizes ---- */
  const fits = [];
  for (const [w, h, mobile, tag] of [[1280, 720, false, 'desktop'], [960, 540, false, 'itch-embed'], [640, 360, false, 'small'], [375, 667, true, 'phone']]) {
    await pg.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile }); await pg.evalp('new Promise(r=>setTimeout(r,200))');
    const m = await pg.evalp(`(async()=>{ const FB = await import('/src/feedback-form.js'); FB.test.resetDraft(); FB.test.open(BKT.bugSnapshot); await new Promise(r=>setTimeout(r,80));
      const root = document.getElementById('fbform'), card = root.firstChild, cr = card.getBoundingClientRect(), bad = [];
      for (const e of card.querySelectorAll('button,textarea,h1,h2,p,div.fbwho')) { const r = e.getBoundingClientRect(); if (r.left < cr.left - 0.5 || r.right > cr.right + 0.5) bad.push(e.tagName + ':' + (e.textContent || '').slice(0, 20) + ' ' + Math.round(r.left - cr.left) + '/' + Math.round(cr.right - r.right)); }
      const sendBtn = document.getElementById('fbsend'); sendBtn.scrollIntoView({ block: 'nearest' }); const sr = sendBtn.getBoundingClientRect();
      const out = { w: innerWidth, h: innerHeight, card: [Math.round(cr.width), Math.round(cr.height)], scrollW: card.scrollWidth, clientW: card.clientWidth, scrollH: card.scrollHeight, clientH: card.clientHeight, bad, sendIn: sr.top >= cr.top - 1 && sr.bottom <= cr.bottom + 1 && sr.bottom <= innerHeight + 1, cardInView: cr.left >= 0 && cr.right <= innerWidth + 1, docScrollX: document.documentElement.scrollWidth > innerWidth + 1 };
      card.scrollTop = 0; FB.test.close(); return out; })()`);
    fits.push({ tag, ...m });
    assert.deepEqual(m.bad, [], tag + ': a control sticks out of the card sideways'); assert.ok(m.scrollW <= m.clientW + 1, tag + ': the card scrolls sideways ' + m.scrollW + '>' + m.clientW);
    assert.ok(m.sendIn, tag + ': SEND is reachable (scrolled into the card)'); assert.ok(m.cardInView && !m.docScrollX, tag + ': the card sits in the window');
    if (shotDir && (tag === 'itch-embed' || tag === 'phone')) { await pg.evalp(`(async()=>{ const FB = await import('/src/feedback-form.js'); FB.test.open(BKT.bugSnapshot); await new Promise(r=>setTimeout(r,80)); document.querySelector('#fbform button.fbrate[data-n="4"]').click(); document.querySelector('#fbform button[data-topic="Heroes"]').click(); document.querySelector('#fbform .fbbad button[data-topic="Difficulty"]').click(); const t=document.getElementById('fbtext'); t.value='The Pyromancer felt great. The second boss hit too hard.'; t.dispatchEvent(new Event('input')); document.querySelector('#fbform button[data-topic="Bosses"]').focus(); })()`); await shot('form-' + tag); await pg.evalp(`import('/src/feedback-form.js').then(m=>m.test.close())`); }
  }
  await pg.send('Emulation.clearDeviceMetricsOverride');
  ok('G fit         ' + fits.map(x => x.tag + ' ' + x.w + 'x' + x.h + ' card ' + x.card.join('x') + (x.scrollH > x.clientH ? ' (scrolls ' + x.scrollH + '/' + x.clientH + ')' : ' (whole)')).join('; '));
  assert.deepEqual(pg.errors, [], 'no page errors: ' + pg.errors.join(' | '));
  console.log('\nall ok');
} finally { await pg.close(); }
