// PAGE TOOL: launches headless Chrome
/* tools/maker-share.mjs (claude/maker) - LEVELS SURVIVE THE TRIP: REDO, MY LEVELS, LINK PLAY, SETS, WARP DOORS.
   1. REDO puts back what UNDO took; a new edit clears it.
   2. MY LEVELS: a changed level saves itself; OPEN / COPY / DELETE work; opening a link never overwrites the level you were making.
   3. A shared level's link plays it (no editor); its end card can replay it, and EDIT A COPY hands over the editor.
   4. A SET plays its levels in order with its one hero; a set link carries every level.
   5. WARP DOORS: two placed pair themselves; UP in one comes out of the other.   node tools/maker-share.mjs */
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';

const pg = await openPage({ port: portFor(16), audio: false, seed: 8 });
try {
  const r = await pg.evalp(`(async () => {
    const P = await import('/src/maker-palette.js'), U = await import('/src/maker-ui.js'), LIB = await import('/src/maker-library.js'); MKR.enter(); U.closePanel(); const r = {};
    const lvl = (name, gx) => { const d = MKR.blank(60, 28); d.name = name; d.ents = [{ t: 'gate', x: gx || 30, y: 19 }]; d.start = { x: 3, y: 19 }; d.hero = 'knight'; return d; };
    // 1. redo
    let d = lvl('REDO TEST'); MKR.doc = d; MKR.mount(); MKR.select(0, 1); MKR.place(10, 15); const had = MKR.doc.grid[15 * 60 + 10]; MKR.undo(); const gone = MKR.doc.grid[15 * 60 + 10]; MKR.redo(); r.redo = had === 1 && gone === 0 && MKR.doc.grid[15 * 60 + 10] === 1;
    MKR.undo(); MKR.place(11, 15); MKR.redo(); r.editClearsRedo = MKR.doc.grid[15 * 60 + 10] === 0;
    // 2. my levels
    MKR.autosave(true); const id = MKR.doc.libId; r.saved = !!id && LIB.list().some(e => e.id === id);
    MKR.place(12, 15); MKR.autosave(); r.autoChanged = LIB.get(id).grid[15 * 60 + 12] === 1;
    const code = await P.shareCode(lvl('A FRIEND', 20)); await MKR.openLink('#L=' + code); r.linkPlays = MKR.linkPlay && BK.state === 'play' && MKR.doc.name === 'A FRIEND';
    r.mineKept = LIB.get(id) && LIB.get(id).grid[15 * 60 + 12] === 1 && !LIB.list().some(e => e.name === 'A FRIEND');
    BK.god = true; BK.tp(20, 19); BK.step(90); r.linkWon = BK.state === 'win'; dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); BK.step(2); dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    r.linkCard = U.linkEndOpen() && BK.state === 'editor'; MKR.act({ act: 'linkAgain' }); r.replay = BK.state === 'play'; MKR.resume(); MKR.act({ act: 'linkEdit' }); U.closePanel(); r.editCopy = !MKR.linkPlay;
    MKR.select(0, 1); MKR.place(5, 10); MKR.autosave(); r.copyIsMine = LIB.list().some(e => e.name === 'A FRIEND');
    MKR.act({ act: 'libCopy', id }); r.copied = LIB.list().some(e => e.name.endsWith(' COPY'));
    const cp = LIB.list().find(e => e.name.endsWith(' COPY')); window.confirm = () => true; MKR.act({ act: 'libDelete', id: cp.id }); r.deleted = !LIB.list().some(e => e.id === cp.id);
    MKR.act({ act: 'libOpen', id }); r.reopened = MKR.doc.libId === id && MKR.doc.grid[15 * 60 + 12] === 1;
    // 4. sets
    const a = lvl('SET ONE', 20), b = lvl('SET TWO', 25); LIB.put(a); LIB.put(b); const st = LIB.newSet('MY TEST SET', a.libId); LIB.editSet(st.id, q => { q.ids.push(b.libId); q.hero = 'knight'; });
    MKR.act({ act: 'setPlay', id: st.id }); r.setFirst = MKR.setRun && MKR.setRun.i === 0 && MKR.doc.name === 'SET ONE' && BK.state === 'play';
    BK.tp(20, 19); BK.step(90); dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); BK.step(2); dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
    MKR.act({ act: 'linkNext' }); r.setSecond = MKR.setRun && MKR.setRun.i === 1 && MKR.doc.name === 'SET TWO' && BK.state === 'play';
    MKR.resume(); MKR.act({ act: 'linkQuit' }); r.setBack = !MKR.setRun && MKR.doc.libId === id;
    const scode = await P.setCode('LINKED SET', 'knight', [a, b]); const S = await P.fromSetCode('#S=' + scode); r.setLink = S.docs.length === 2 && S.docs[1].name === 'SET TWO' && S.hero === 'knight';
    // 5. warp doors
    d = lvl('WARPS', 50); MKR.doc = d; MKR.mount(); const wi = P.THINGS.indexOf('warp'); MKR.select(2, wi); MKR.place(8, 19); MKR.place(40, 19);
    const ws = d.ents.filter(e => e.t === 'warp'); r.paired = ws.length === 2 && ws[0].pair === ws[1].wid && ws[1].pair === ws[0].wid;
    MKR.play(); BK.god = true; BK.tp(8, 19); BK.step(5); dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })); BK.step(2); dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowUp' })); BK.step(5);
    r.warped = Math.abs(BK.P.x - (40 * 16 + 8)) < 20; MKR.resume(); BK.god = false;
    // 6. a platform on a TRACK goes along it, and carries the knight
    d = lvl('TRACKS', 55); d.ents.push({ ...P.entFor('mover', 10, 18), track: [[10, 18], [20, 18], [24, 12]], speed: 50 }); MKR.doc = d; MKR.mount();
    MKR.select(3, MKR.tools.indexOf('TRACK')); r.toolShown = MKR.tools.includes('TRACK');
    MKR.play(); BK.god = true; BK.step(10); const mv = BK.movers().find(m => m.track); BK.P.x = mv.x + 12; BK.P.y = mv.y; BK.step(2);
    let far = 0, minY = 1e9; for (let i = 0; i < 160; i++) { BK.step(10); far = Math.max(far, mv.x); minY = Math.min(minY, mv.y); } r.trackFar = Math.round(far / 16); r.trackTop = Math.round(minY / 16);
    r.trackRuns = !!mv && far > 18 * 16 && minY < 15 * 16; r.trackCarried = BK.P.y < 17 * 16; MKR.resume(); BK.god = false;
    return r;
  })()`, 300000);
  console.log(JSON.stringify(r));
  for (const k of ['redo', 'editClearsRedo', 'saved', 'autoChanged', 'linkPlays', 'mineKept', 'linkWon', 'linkCard', 'replay', 'editCopy', 'copyIsMine', 'copied', 'deleted', 'reopened', 'setFirst', 'setSecond', 'setBack', 'setLink', 'paired', 'warped', 'toolShown', 'trackRuns', 'trackCarried'])
    assert(r[k], 'maker share: ' + k + ' failed ' + JSON.stringify(r));
  assert.deepEqual(pg.errors, [], 'page errors: ' + pg.errors.join(' | '));
  console.log('maker-share: redo, MY LEVELS (autosave, open, copy, delete), a link that plays without touching your level, sets in order with one hero, paired warp doors and platforms on curved tracks all work.');
} finally { pg.close(); }
