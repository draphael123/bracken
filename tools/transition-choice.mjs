/* tools/transition-choice.mjs - THE TRANSITION CHOICE CARD, pinned (claude/transchoice, Daniel 11-07). NODE ONLY, no browser.
   After a boss falls (clear credited first) and where the cutscene would auto-load the next wood, a card asks: ONWARD TO <NEXT> (default: the old flow) or RETURN TO THE MAP
   (ends on the world map with the next node under the cursor, like an endOnMap row). Rows that already end on the map show nothing. TRANSITIONS = NEVER / a seen FIRST TIME pair never
   auto-load, so there is nothing to ask. The demo's end card after King Gorm still comes first.
   usage: node tools/transition-choice.mjs   (exit 1 on a red row) */
import { readFileSync } from 'node:fs';
import * as TRM from '../src/transitions.js';
import * as DS from '../src/demo-flag.js';
const rows = []; const ok = (name, pass, why = '') => { rows.push({ name, pass: !!pass, why }); console.log((pass ? 'ok   ' : 'FAIL ') + name + (pass ? '' : '  ' + why)); };
const src = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const frames = (c, secs, keys = {}) => { let r = null; for (let i = 0; i < Math.round(secs * 60) && r === null; i++) r = TRM.choiceStep(c, 1 / 60, keys); return r; };

/* ---- WHICH ROWS ASK ---- */
const asking = TRM.TABLE.filter(e => TRM.needsChoice(e)), silent = TRM.TABLE.filter(e => !TRM.needsChoice(e));
ok('every plain row of the table asks (walk-outs, gate ends, ferry, road)', asking.length >= 10 && asking.every(e => !e.endOnMap), asking.length + ' rows');
ok('the endOnMap row (Kingswood > Burning Village) is silent: it already ends on the map', silent.length === 1 && silent[0].from === 'kings' && silent[0].to === 'burning' && silent[0].endOnMap === true);
ok('every row still ends in a fade (the old flow is untouched)', TRM.TABLE.every(e => e.beats.length >= 2 && e.beats[e.beats.length - 1].id === 'fade'));
ok('no row, no card', TRM.needsChoice(null) === false && TRM.entryFor('nowhere') === null);
ok('rows read ONWARD TO <NEXT NAME> first, then RETURN TO THE MAP', (() => { const r = TRM.choiceRows('Marsh Wood'); return r[0] === 'ONWARD TO MARSH WOOD' && r[1] === 'RETURN TO THE MAP' && TRM.CHOICE_LABELS[0] === 'onward' && TRM.CHOICE_LABELS[1] === 'map'; })());

/* ---- THE CARD'S STATE MACHINE ---- */
const E = TRM.entryFor('wood', 'hornetsnest');
{ const c = TRM.choiceStart(E, 'The Hornet\'s Nest');
  ok('ONWARD is first and the default focus', c.sel === 0 && c.picked === null);
  ok('nothing is taken before the card is armed (a hero mashing confirm as the boss falls)', frames(c, TRM.CHOICE_ARM_S - 0.05, { confirm: true }) === null && c.picked === null && !TRM.choiceArmed(c));
  const d = TRM.choiceStart(E, 'X'); frames(d, 0.5, { down: true });
  ok('nothing moves before it is armed either (down is ignored)', d.sel === 0);
  frames(c, 0.1); ok('armed after CHOICE_ARM_S', TRM.choiceArmed(c));
  ok('confirm on the default takes ONWARD (the old flow)', TRM.choiceStep(c, 1 / 60, { confirm: true }) === 'onward' && c.picked === 'onward');
  ok('once taken it takes nothing more (a double press cannot also pick the map)', TRM.choiceStep(c, 1 / 60, { confirm: true, down: true }) === null && c.picked === 'onward'); }
{ const c = TRM.choiceStart(E, 'X'); frames(c, TRM.CHOICE_ARM_S + 0.05);
  TRM.choiceStep(c, 1 / 60, { down: true }); ok('DOWN moves to RETURN TO THE MAP', c.sel === 1);
  ok('confirm there takes MAP', TRM.choiceStep(c, 1 / 60, { confirm: true }) === 'map' && c.picked === 'map'); }
{ const c = TRM.choiceStart(E, 'X'); frames(c, TRM.CHOICE_ARM_S + 0.05); TRM.choiceStep(c, 1 / 60, { right: true }); const a = c.sel; TRM.choiceStep(c, 1 / 60, { left: true }); const b = c.sel; TRM.choiceStep(c, 1 / 60, { down: true }); TRM.choiceStep(c, 1 / 60, { up: true });
  ok('left/up go to ONWARD, right/down to the map (keyboard, d-pad, touch rows alike)', a === 1 && b === 0 && c.sel === 0); }
ok('the arm delay lets the tally read (>= 1 s), does not nag (<= 2 s), and is longer than the skip guard MIN_SKIP', TRM.CHOICE_ARM_S >= 1 && TRM.CHOICE_ARM_S <= 2 && TRM.CHOICE_ARM_S > TRM.MIN_SKIP);
ok('no card is inert', TRM.choiceStep(null, 1) === null && !TRM.choiceArmed(null));

/* ---- ONWARD == THE OLD FLOW ---- */
{ const tl = TRM.start(E); for (let i = 0; i < 6000 && !tl.done; i++) TRM.step(tl, 1 / 60, { ready: true });
  ok('the timeline after ONWARD is the old one: open, walk, fade, done', tl.log.join() === 'open,walk,fade,done', tl.log.join()); }
ok('main.js: ONWARD calls the very same trnBegin with the choice skipped', /if \(r === TRM\.CHOICE_ONWARD\) \{ trnChoice = null; SFX\.uiSel\(\); if \(!trnBegin\(true\)\)/.test(src));
ok('main.js: the clear is still credited first: both call sites are still winLevel(); trnBegin();', (src.match(/\{ winLevel\(\); trnBegin\(\); \}/g) || []).length === 2);
ok('main.js: the tools\' BK.trans.begin() is the direct path (no card), beginAsk the asking one', src.includes('begin: () => trnBegin(true)') && src.includes('beginAsk: () => trnBegin(false)'));

/* ---- ORDER INSIDE trnBegin: gates, the demo lock, the policy, THEN the card ---- */
const iBegin = src.indexOf('function trnBegin('), body = src.slice(iBegin, src.indexOf('/* (claude/transland, Daniel 11-06)', iBegin)), at = s => body.indexOf(s);
ok('trnBegin: rush / boss select / trials / shops / editor still bail first', at('rushOn() || bossSelectFight || edTesting || L.trial || L.shop') > 0 && at('rushOn() || bossSelectFight') < at('needsChoice'));
ok('the demo end card comes FIRST: the demo lock returns false before any card (Gorm\'s win card, then the END CARD, unchanged)', at('if (demoTeaser && !entry.demoEnd) return false') > 0 && at('DS.demoLocked') < at('needsChoice'));
ok('NEVER / a seen FIRST TIME pair: the policy returns false before the card (nothing would auto-load; the level-complete card\'s Z goes to the map as before)', at('TRM.policy(') > 0 && at('TRM.policy(') < at('needsChoice') && /if \(!TRM\.policy\([^\n]*\) return false;/.test(body));
ok('FIRST TIME: the seen-flag is set only after the card (on ONWARD), so a trip to the map does not use the cutscene up', at('needsChoice') < at('PROG.transSeen[key] = 1'));
ok('only the direct path and endOnMap rows skip the card', at('!direct && !demoTeaser && TRM.needsChoice(entry)') > 0);
{ const lv = { id: 'scree' }, burning = { id: 'burning' };
  ok('demo: the wood after King Gorm (scree) is out of the slice (DS.outOfSlice) so the demo lock blocks it; the Burning Village spur is in the slice', DS.outOfSlice(lv) === true && DS.inSlice(burning) === true);
  ok('demo: the kings > scree row is a plain row: only the demo lock keeps the card away there', TRM.needsChoice(TRM.entryFor('kings', 'scree', { burningOpen: false }))); }
ok('main.js: the win card still routes the demo end (demoEndsHere > demoEndOpen) untouched', /DS\.demoEndsHere\(LEVELS\[levelIndex\]\.id\) && !bossSelectFight && !rushOn\(\)\) \{ demoEndOpen\(\); \}/.test(src));

/* ---- RETURN TO THE MAP ---- */
ok('MAP ends on the world map: state map, the cursor on the next wood\'s node, progress saved, the map\'s music', /function trnToMap\(toId, lit\) \{\n\s*setView\('normal'\); state = 'map'; gotoLevelNode\(levelIndex\); const k = NODES\.findIndex\(n => n\.id === toId\);\n\s*if \(k >= 0\) \{ map\.node = k;/.test(src) && /saveProgress\(\); music\.play\(menuTrack\(\)\)/.test(src));
ok('MAP hands the row\'s target (c.entry.to) to trnToMap, no spur pulse for a plain next wood', /trnToMap\(e\.to, false\)/.test(src));
ok('endOnMap rows unchanged: trnFinish still ends on the map with the spur pulse', /if \(entry\.endOnMap\) \{ TRN = null; trnArrive = null; trnToMap\(entry\.to, true\); return; \}/.test(src));

/* ---- WIRING ---- */
ok('the update runs the card in the win state before the old win-card handler (a held confirm cannot also take the old Z NEXT / map)', src.indexOf("if (state === 'win' && trnChoice) { trnChoiceUpdate(dt); return; }") > 0 && src.indexOf("if (state === 'win' && trnChoice)") < Math.max(src.indexOf("if (state === 'win') { if (bossSelectFight && (confirmPress || pausePress))"), src.indexOf("if (state === 'win') { if (edTesting && (confirmPress || pausePress))")));
ok('the card draws over the level-complete card, under the letterbox overlay', src.indexOf('trnChoiceDraw();   /* (claude/transchoice)') > 0 && src.indexOf('trnChoiceDraw();   /* (claude/transchoice)') < src.indexOf('trnDrawOverlay();   /* (claude/transwm)'));
ok('touch: the full-screen tap and the Z NEXT / ESC MAP footer are off while the card is up; each row is its own tap target', src.includes('if (wt > 1.75 && !trnChoice) TCH.hit(0, 0, VW, VH') && src.includes('if (wt > 1.75 && !trnChoice && Math.floor(time * 2)') && src.includes('TCH.hit(px + 4, y - 3, pw - 8, 13'));
ok('a level load or a fresh start clears a pending card', src.includes('trnChoice = null; if (TRN && !TRN.loading) TRN = null;') && src.includes('function startGame() { mapSpurLit = null; trnChoice = null;'));
ok('online: a guest\'s keys only drive his own seat (intoPlayer writes p.keys / p.press, never the global confirm/arrow presses), so the host chooses and the guests watch the host\'s stream', (() => { const on = readFileSync(new URL('../src/online.js', import.meta.url), 'utf8'), i = on.indexOf('export function intoPlayer'), f = on.slice(i, i + 700); return i > 0 && !/confirmPress|upPress|downPress/.test(f); })());
ok('the long next-wood names are fitted to the card', /text\(fitText\(\(on \? '> ' : '  '\) \+ r, pw - 16, 8\)/.test(src));

const red = rows.filter(r => !r.pass).length; console.log(red ? red + ' red of ' + rows.length : 'transition-choice ok: ' + rows.length + ' rows'); process.exit(red ? 1 : 0);
