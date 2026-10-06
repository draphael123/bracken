// tools/uiscreens.mjs - UI POLISH B, the opening and the map (claude/uiscreens, 2026-10-06). What the screens must SAY and DO:
//   PRESS CARD   the first title is a card (PRESS ANY KEY), not the menu; the first key (or tap) takes the card down and does nothing else (the menu does not move or open),
//                the sign and the menu then come in; the in-level PRESS A KEY FOR SOUND banner is only the fallback for a run that never passed the title.
//   OPENING      four illustrated panels (title + two lines each) before the first hero pick; X or ESC skips them all; finishing or skipping writes the once-only flag; a tool run
//                (BK.manualSimulation) never gets them, so no other check is held up by them.
//   HERO PICK    the selected hero's signature move plays in a window beside the words, with its name under it, and the window MOVES (two frames half a second apart differ).
//   MAP CARD     a level's card shows its postcard, BEST, the three medal times, silver / gold / quest, and the RECOMMENDED LV (and a long blurb pages instead of being cut).
//   BOOT         the page's boot line is empty without ?debug, and the loading screen carries tips and the knight by the fire.
// usage: node tools/uiscreens.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { openPage, ROOT } from './cdp.mjs';
import { OPENING_LINES, PANELS } from '../src/opening-panels.js';
import { TIPS } from '../src/loading-screen.js';

const HTML = readFileSync(join(ROOT, 'index.html'), 'utf8');
assert.match(HTML, /<div id="boot"><\/div>/, 'the boot line starts EMPTY: "booting..." is for ?debug only');
assert.match(HTML, /debug[\s\S]{0,200}booting/, 'and ?debug turns it on');
assert.ok(TIPS.length >= 8 && TIPS.every(t => t.length <= 150), 'the loading screen has its tips and each fits two rows');
assert.equal(PANELS, 4, 'four opening panels');
for (const [t, a, b] of OPENING_LINES) assert.ok(t && a && b && a.length <= 40 && b.length <= 40, 'a panel has a title and two short lines: ' + t);
console.log('ok  static         boot line empty without ?debug, ' + TIPS.length + ' loading tips, ' + PANELS + ' opening panels');

/* ---- 1. THE PRESS CARD: a page with no key pressed yet ---- */
{ const pg = await openPage({ audio: false });
  try {
    const TX = "(()=>{BK.manualSimulation=true; const s=new Set(); for(let k=0;k<40;k++){ window.__textRec=[]; BK.step(4); for(const t of (window.__textRec||[])) if(t.kind===\"text\") s.add(t.s); window.__textRec=null; } return [...s]; })()";
    assert.equal(await pg.evalp('BK.state'), 'title');
    assert.equal(await pg.evalp('BK.ui.pressCard'), true, 'a fresh page opens on the press card');
    const card = await pg.evalp(TX);
    assert.ok(card.includes('PRESS ANY KEY'), 'the card says PRESS ANY KEY: ' + card.join(' / '));
    assert.ok(!card.includes('CONTINUE') && !card.includes('CHOOSE A SAVE'), 'and the menu is not drawn behind it: ' + card.join(' / '));
    const before = await pg.evalp('BK.ui.titleI');
    for (const type of ['keyDown', 'keyUp']) await pg.send('Input.dispatchKeyEvent', { type, key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
    assert.equal(await pg.evalp('BK.ui.pressCard'), false, 'a key takes the card down');
    await pg.evalp('BK.step(200)');
    assert.equal(await pg.evalp('BK.ui.titleI'), before, 'the key that took the card down did not also move the menu');
    assert.equal(await pg.evalp('BK.state'), 'title', 'nor open anything');
    const menu = await pg.evalp('(()=>{const s=new Set(); for(let k=0;k<5;k++){ window.__textRec=[]; BK.step(2); for(const t of (window.__textRec||[])) if(t.kind==="text") s.add(t.s); window.__textRec=null; } return [...s]; })()');
    assert.ok(menu.some(s => /CONTINUE|CHOOSE A SAVE|NEW GAME/.test(s)), 'then the menu is there: ' + menu.join(' / '));
    console.log('ok  press card     PRESS ANY KEY with no menu behind it; one key takes it down without choosing anything; then the menu');
  } finally { await pg.close(); } }

const pg = await openPage({});
try {
  /* ---- 2. THE OPENING ---- */
  const op = await pg.evalp(`(async()=>{ BK.manualSimulation=true; localStorage.removeItem('bracken.openingSeen'); const out={panels:[]};
    BK.ui.openingStart(); out.state0=BK.state;
    for(let i=0;i<4;i++){ BK.ui.opening.i=i; BK.ui.opening.t=1; window.__textRec=[]; BK.step(2); out.panels.push((window.__textRec||[]).filter(t=>t.kind==='text').map(t=>t.s)); window.__textRec=null; }
    BK.ui.opening.i=1; BK.press('atk'); BK.step(3); out.after=BK.state; out.flag=localStorage.getItem('bracken.openingSeen');
    BK.state='title'; BK.ui.titleI=1; BK.press('confirm'); BK.step(3); BK.ui.slotI=1; BK.press('confirm'); BK.step(3); out.tool=BK.state;
    return out; })()`);
  assert.equal(op.state0, 'opening');
  OPENING_LINES.forEach(([t, a, b], i) => { const got = op.panels[i]; assert.ok(got.includes(t) && got.includes(a.toUpperCase()) && got.includes(b.toUpperCase()), 'panel ' + (i + 1) + ' shows its title and both lines: ' + got.join(' / ')); });
  assert.equal(op.after, 'heropick', 'X skips the lot, to the hero pick'); assert.equal(op.flag, '1', 'and the once-only flag is written');
  assert.notEqual(op.tool, 'opening', 'a tool run (manualSimulation) is never held up by the opening');
  console.log('ok  opening        4 panels each with its title and two lines; X skips to the hero pick and writes the flag; tool runs skip it');

  /* ---- 3. THE HERO PICK'S MOVE PREVIEW ---- */
  const hp = await pg.evalp(`(async()=>{ BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true}); const out=[];
    for(let i=0;i<3;i++){ BK.state='heropick'; BK.ui.heroPickStage='pick'; BK.ui.heroPickI=i; BK.step(6);
      const v=BK.view, g2=v.buf.getContext('2d'), grab=()=>Array.from(g2.getImageData(228,94,86,50).data);
      window.__textRec=[]; BK.step(1); const names=(window.__textRec||[]).filter(t=>t.kind==='text').map(t=>t.s); window.__textRec=null;
      const a=grab(); BK.step(40); const b=grab(); out.push({ names, moved: a.some((x,k)=>x!==b[k]) }); }
    return out; })()`);
  const SIG = [/RISING CUT|SKEWER|FAULT LINE|EMBER FLARE|LIGHT LANCE|GRAPESHOT|HARVEST MOON/];
  hp.forEach((h, i) => { assert.ok(h.names.some(s => SIG[0].test(s)), 'pick ' + i + ' names its signature move: ' + h.names.join(' / ')); assert.ok(h.moved, 'pick ' + i + ': the move window animates'); });
  console.log('ok  hero pick      each of the ' + hp.length + ' heroes shows a named signature move, and the window moves');

  /* ---- 4. THE MAP CARD ---- */
  const mc = await pg.evalp(`(async()=>{ const {LEVELS}=await import('/src/level.js'); BK.manualSimulation=true; BK.setHero('knight'); BK.reset({fresh:true});
    const P=BKT.PROG; for(const l of LEVELS.slice(0,8)) P[l.id]={cleared:true,medal:2,silver:3,best:151,gold:12,total:20};
    BK.mapLook('welltown'); BK.state='map'; BK.step(150);
    const s=new Set(); for(let k=0;k<12;k++){ window.__textRec=[]; BK.step(30); for(const t of (window.__textRec||[])) if(t.kind==='text') s.add(t.s); window.__textRec=null; }
    return [...s]; })()`);
  assert.ok(mc.some(s => /^RECOMMENDED LV \d+$/.test(s)), 'the recommended level: ' + mc.join(' / '));
  assert.ok(mc.some(s => /^NOT WALKED$|^BEST /.test(s)), 'best (or not walked)');
  assert.ok(mc.filter(s => /^\d+:\d\d$/.test(s)).length >= 3, 'the three medal times: ' + mc.join(' / '));
  assert.ok(mc.some(s => /^QUEST (OPEN|DONE)$/.test(s)), 'the quest, said in words, not "OPEN"');
  assert.ok(mc.some(s => /the wells are the only/.test(s)) && mc.some(s => /blue in it/.test(s)), 'a long blurb is paged, both halves reach the screen over time: ' + mc.join(' / '));
  console.log('ok  map card       recommended level, best, three medal times, quest in words, a paged blurb');
  assert.deepEqual(pg.errors, [], 'no page errors'); console.log('ok  console        no page errors');
} finally { await pg.close(); }
