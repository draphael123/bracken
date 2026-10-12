/* tools/bug-report.mjs - REPORT A BUG = A PASTEABLE CODE (claude/shipfix, Daniel 10-11: no email, no address, no network).
 *   A. THE ROW: 'Report a bug' is on the pause menu and 'REPORT A BUG' under the title's OPTIONS; the build (BATCH n - DATE) is small on the title.
 *   B. THE BOARD: from the pause menu it opens a one-line 'what happened?' box, MAKE REPORT CODE builds a 'BRK1-' code (< 1500 characters), shows it selectable
 *      ('PASTE THIS TO THE DEVELOPER') and copies it (clipboard, else the selection fallback); ESC closes; nothing is fetched.
 *   C. THE ROUND TRIP: the code the PAGE made is read back by tools/bug-decode.mjs (a separate node process) into the facts the page held: the player's line,
 *      the level and hero, hp, flasks, the settings, the console errors/warnings and the level events - and NOT the save (no coins, no progress keys).
 *      A flood of long console errors still fits the limit and still decodes; a garbled code is refused with a message, not a crash.
 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { openPage } from './cdp.mjs';
import { PAUSE_ROWS } from '../src/ui-hud.js';
import { MAX_LEN } from '../src/bug-report.js';

const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
assert.ok(PAUSE_ROWS.includes('Report a bug'), 'the pause menu has a Report a bug row');
assert.ok(/const titleItems = \(\) => titleOpts \? \[[^\]]*'REPORT A BUG'/.test(main), 'the title OPTIONS list has REPORT A BUG');
assert.ok(/k === 'Report a bug'\) openBugReport\(\)/.test(main) && /k === 'REPORT A BUG'\) openBugReport\(\)/.test(main), 'both rows open the board');
assert.ok(!/mailto:/.test(main + readFileSync(new URL('../src/bug-report-ui.js', import.meta.url), 'utf8')), 'no mailto: Daniel decided on a code, not an email');
console.log('ok  A static       the pause row, the title OPTIONS row, both wired; no mailto');

const decode = code => execFileSync(process.execPath, ['tools/bug-decode.mjs', code], { cwd: new URL('..', import.meta.url), encoding: 'utf8' });
const pg = await openPage({ audio: false, fonts: false });
try {
  /* title: the build line */
  const tt = await pg.evalp(`(async()=>{BK.manualSimulation=true; await new Promise(r=>setTimeout(r,500)); BK.ui.pressCard=false; BK.state='title'; const s=new Set(); for(let k=0;k<4;k++){window.__textRec=[]; BK.step(2); for(const t of (window.__textRec||[])) if(t.kind==='text') s.add(t.s); window.__textRec=null;} return [...s];})()`);
  assert.ok(tt.some(s => /^BATCH \d+ - \d+ [A-Z]{3}$/.test(s)), 'the build is small on the title: ' + tt.join(' / '));
  console.log('ok  A title        ' + tt.find(s => /^BATCH/.test(s)));

  const r = await pg.evalp(`(async()=>{const out={fails:[]}; const F=m=>out.fails.push(m);
    const press=(k,n=1)=>{for(let j=0;j<n;j++){BK.press(k);BK.sim(1);}};
    const BUG=await import('/src/bug-report.js'); const reqs=[];
    console.error('test problem one: the floor gave way'); console.warn('test warning two'); console.error(new Error('thrown thing three'));
    BK.setHero('pyro'); BK.reset({fresh:true}); BK.load(0); BK.state='play'; BK.step(30); BKT.PROG.coins=98765; BKT.PROG.secretField='DONOTLEAK';
    /* the pause menu's row opens the board */
    const of=window.fetch; window.fetch=function(...a){reqs.push(String(a[0])); return of.apply(this,a);}; const ox=XMLHttpRequest.prototype.open; XMLHttpRequest.prototype.open=function(m,u){reqs.push(String(u)); return ox.apply(this,arguments);}; if(navigator.sendBeacon){const ob=navigator.sendBeacon.bind(navigator); navigator.sendBeacon=(u,d)=>{reqs.push(String(u)); return ob(u,d);};}
    BK.press('pause'); BK.sim(2); if(BK.state!=='menu')F('pause did not open the menu: '+BK.state);
    const PR=${JSON.stringify(PAUSE_ROWS)}; press('down',PR.indexOf('Report a bug')); press('confirm');
    const board=()=>document.getElementById('bugboard'); if(!board()){F('the Report a bug row did not open the board');return out;}
    const inp=document.getElementById('bugnote'); if(!inp)F('no note box'); inp.value='it fell through the floor at the first bridge';
    board().querySelector('button.go').click(); for(let i=0;i<40&&!document.getElementById('bugcode');i++) await new Promise(r=>setTimeout(r,50));
    const ta=document.getElementById('bugcode'); if(!ta){F('no report code shown');return out;}
    out.code=ta.value; out.text=board().innerText; await new Promise(r=>setTimeout(r,100));
    out.status=[...board().querySelectorAll('p')].map(p=>p.textContent).join(' | ');
    /* ESC closes the board and the game under it did not see the key */
    const st=BK.state; window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})); if(board())F('ESC did not close the board'); if(BK.state!==st)F('ESC leaked to the game: '+st+' > '+BK.state);
    out.snap=BKT.bugSnapshot(); out.reqs=reqs;
    /* a flood: forty long errors, an enormous note */
    for(let i=0;i<40;i++) console.error('flood '+i+' '+'x'.repeat(190)+' '+Math.random());
    for(let i=0;i<30;i++) BUG.evlog('event '+i+' '+Math.random());
    const big=await BUG.buildReport(BKT.bugSnapshot(),'n'.repeat(500)); out.bigLen=big.code.length; out.big=big.code; out.bigEr=big.report.er.length;
    return out; })()`);
  assert.deepEqual(r.fails, [], 'FAILS:\n  ' + r.fails.join('\n  '));
  assert.ok(/PASTE THIS TO THE DEVELOPER/i.test(r.text), 'the board says PASTE THIS TO THE DEVELOPER: ' + r.text);
  assert.ok(/COPIED|Could not copy by itself/.test(r.status), 'it tells whether the clipboard took it: ' + r.status);
  assert.ok(r.code.startsWith('BRK1-') && r.code.length <= MAX_LEN && /^BRK1-[A-Za-z0-9_-]+$/.test(r.code), 'a BRK1- code under ' + MAX_LEN + ' characters: ' + r.code.length);
  const sent = r.reqs.filter(u => !/^(\.\/)?audio\//.test(u)); assert.deepEqual(sent, [], 'nothing is sent anywhere (the game\'s own audio loads are not the report): ' + sent.join(' '));
  console.log('ok  B board        opens from the pause row, shows a ' + r.code.length + '-character code (' + (/COPIED/.test(r.status) ? 'copied' : 'fallback: selectable') + '), ESC closes, no network');

  const text = decode(r.code);
  for (const need of [/it fell through the floor at the first bridge/, /wood/i, /hero\s+pyro/, /test problem one: the floor gave way/, /test warning two/, /thrown thing three/, /load wood/, /BATCH|batch \d+/i, /settings\s+difficulty=/, /level difficulty/])
    assert.match(text, need, 'the decoded report lacks ' + need + ':\n' + text);
  assert.ok(!/98765|DONOTLEAK|secretField/.test(text + r.code), 'the save is NOT in the report');
  assert.ok(r.snap.hp[1] > 0 && Number.isFinite(r.snap.fl), 'hp and flasks are real numbers: ' + JSON.stringify(r.snap.hp) + ' ' + r.snap.fl);
  assert.ok(r.snap.lv === 'wood' && r.snap.h === 'pyro' && r.snap.st === 'menu', 'the snapshot: level, hero, screen: ' + JSON.stringify(r.snap));
  console.log('ok  C round trip   the page\'s code, decoded by tools/bug-decode.mjs, carries the note, level, hero, hp, settings, errors and events - not the save');
  assert.ok(r.bigLen <= MAX_LEN, 'a flood of errors and a huge note still fit: ' + r.bigLen);
  const big = decode(r.big); assert.match(big, /BRACKEN BUG REPORT/); assert.ok(r.bigEr <= 20);
  const j = JSON.parse(execFileSync(process.execPath, ['tools/bug-decode.mjs', '--json', r.big], { cwd: new URL('..', import.meta.url), encoding: 'utf8' })); assert.equal(j.c, 1);
  const bad = spawnSync(process.execPath, ['tools/bug-decode.mjs', 'BRK1-' + r.big.slice(5, 40)], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }); assert.notEqual(bad.status, 0, 'a cut-off code is refused'); assert.match(bad.stderr, /bug-decode:/, 'with a message, not a stack trace');
  const none = spawnSync(process.execPath, ['tools/bug-decode.mjs', 'hello there'], { cwd: new URL('..', import.meta.url), encoding: 'utf8' }); assert.notEqual(none.status, 0);
  const embedded = decode('hi, it crashed! ' + r.code + ' thanks'); assert.match(embedded, /fell through the floor/, 'a code pasted inside a message is found');
  const wrapped = decode('BRK1-' + r.code.slice(5).replace(/(.{47})/g, '$1\n  ') + '\nthanks!'); assert.match(wrapped, /fell through the floor/, 'a code a chat app wrapped over lines is still read');
  console.log('ok  C limits      ' + r.bigLen + ' chars after a flood of 40 long errors and a 500-character note; a cut code or no code is refused with a message; a code inside a chat message is found');
} finally { await pg.close(); }
