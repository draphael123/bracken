// tools/secrets.mjs - THE SECRETS SYSTEM (claude/secrets, Daniel 10-21: "secrets must be CLEAR"). One registry (src/secrets.js) for the Unburied Field (three lost banners) and the Lit Church (three votive lamps).
//  A. NODE: the registry's integrity (levels, hosts, heroes, piece ids = the levels' own ids), the pure rules (found / open / progress / toast / journal / hero line / migration), no spoiler before discovery.
//  B. THE PAGE: a fresh save shows NOTHING of the field (no '?' , no progress line, the journal says '? ? ?', the hero card names no place); a banner -> the toast 'LOST BANNER 1/3', a dim '?' with '1/3 LOST BANNERS' on the map,
//     the journal names it with its progress; the third -> 'A HIDDEN WAY OPENS' toast, the map reveal (camera, rings, words) once and only once; the church's lamps the same; OLD SAVES show their secrets as found
//     and are not shown the reveal again; the hero card says FOUND ON A HIDDEN PATH; the pause menu's Secrets row opens the journal.
//  PORT=8791 node tools/secrets.mjs
import assert from 'node:assert/strict';
import * as SC from '../src/secrets.js';
import { LEVELS, LOST_BANNERS } from '../src/level.js';
import { VOTIVE_IDS } from '../src/votive-hands.js';
import { HERO_IDS } from '../src/hero-roster.js';
import { ACTS } from '../src/foe-react.js';
import * as S from '../src/store.js';
import { PAUSE_ROWS } from '../src/ui-hud.js';
import { openPage } from './cdp.mjs';
import { portFor } from './ports.mjs';
const ok = (c, m) => { assert.ok(c, m); console.log('ok  ' + m.slice(0, 150)); };

/* ---- A. NODE ---- */
ok(new Set(SC.SECRETS.map(s => s.id)).size === SC.SECRETS.length, 'A: secret ids are unique');
for (const s of SC.SECRETS) {
  const lv = LEVELS.find(l => l.id === s.level), host = LEVELS.find(l => l.id === s.host);
  ok(lv && host, 'A: ' + s.id + ': its level (' + s.level + ') and its host (' + s.host + ') exist');
  ok(HERO_IDS.includes(s.hero) && lv.classFor === s.hero, 'A: ' + s.id + ': carries ' + s.hero + ', the level\'s own classFor');
  ok(ACTS.some(a => a.levels.includes(s.level)), 'A: ' + s.id + ': sits in an act (the journal groups by it)');
  ok(s.pieces.ids.length >= 1 && s.pieces.one && s.pieces.many && s.pieces.stir, 'A: ' + s.id + ': has pieces with names');
}
ok(SC.byId('unburied').pieces.ids.slice().sort().join() === Object.keys(LOST_BANNERS).sort().join(), 'A: the field\'s pieces ARE the levels\' lost banners');
ok(SC.byId('church').pieces.ids.join() === VOTIVE_IDS.join(), 'A: the church\'s pieces ARE WAYMEET\'s votive lamps');
ok(LEVELS.find(l => l.id === 'unburied').secretBanners && LEVELS.find(l => l.id === 'church').votiveLamps, 'A: the two gated levels still carry their own gates (the registry reads them, never replaces them)');
const U = SC.byId('unburied'), C = SC.byId('church');
ok(SC.stateOf(U, {}) === 'unknown' && SC.stateOf(C, {}) === 'unknown', 'A: a fresh save: both unknown');
ok(SC.stateOf(U, { lostBanners: { fields: 1 } }) === 'found' && SC.progressLine(U, { lostBanners: { fields: 1 } }) === '1/3 LOST BANNERS', 'A: one banner: found, "1/3 LOST BANNERS"');
ok(SC.stateOf(U, { lostBanners: { fields: 1, burial: 1, witchlight: 1 } }) === 'open', 'A: three banners: open');
ok(SC.stateOf(U, { fieldOpen: 1 }) === 'open' && SC.stateOf(U, { unburied: { cleared: true } }) === 'open', 'A: an old save (fieldOpen, or the field cleared): open');
ok(SC.stateOf(C, { votive: { v1: 1, v2: 1 } }) === 'found' && SC.progressLine(C, { votive: { v1: 1, v2: 1 } }) === '2/3 VOTIVE LAMPS' && SC.stateOf(C, { churchOpen: 1 }) === 'open', 'A: the church: two lamps found "2/3 VOTIVE LAMPS", churchOpen open');
ok(SC.pieceToast(U, 1).title === 'LOST BANNER 1/3' && SC.pieceToast(U, 2).sub === '1 MORE TO FIND' && SC.pieceToast(U, 3).title === 'A HIDDEN WAY OPENS' && SC.pieceToast(U, 3).sub === 'THE UNBURIED FIELD' && SC.pieceToast(U, 3).last, 'A: toasts: LOST BANNER 1/3, 1 MORE TO FIND, A HIDDEN WAY OPENS / THE UNBURIED FIELD');
{ const J0 = SC.journal({}), t0 = SC.journalTotals({});
  ok(J0.length === 1 && J0[0].act === 4 && t0.found === 0 && t0.of === 2, 'A: the journal: ACT IV holds 2 secrets, 0 found');
  ok(J0[0].rows.every(r => r.text === '? ? ?' && r.note === 'NOT FOUND YET'), 'A: no spoiler: unfound secrets are "? ? ?"');
  ok(!JSON.stringify(J0).match(/UNBURIED|CHURCH|BANNER|LAMP|HOUSE|FIELD/), 'A: no unfound secret\'s name, piece or place is anywhere in the journal');
  const J1 = SC.journal({ lostBanners: { fields: 1 }, churchOpen: 1 }); ok(J1[0].found === 1 && J1[0].rows[0].note === '1/3 LOST BANNERS' && J1[0].rows[0].text === 'THE UNBURIED FIELD' && J1[0].rows[1].note === 'FOUND', 'A: found rows are named with progress'); }
ok(SC.heroLine('reaper') === 'FOUND ON A HIDDEN PATH' && SC.heroLine('paladin') === 'FOUND ON A HIDDEN PATH' && SC.heroLine('knight') === null && SC.heroLine('pyro') === null, 'A: the reaper and the paladin say FOUND ON A HIDDEN PATH; nobody else does');
ok(SC.heroHow('reaper', {}, 'BEAT HIM IN THE UNBURIED, THEN BUY: 10 SILVER') === 'BEAT HIM, THEN BUY: 10 SILVER' && SC.heroHow('reaper', { lostBanners: { fields: 1 } }, 'X') === 'X' && SC.heroHow('pyro', {}, 'Y') === 'Y', 'A: the locked card names no place until the secret is found');
ok(SC.featWords('reaper', {}, 'beat the Blood Knight in the Unburied Field') === 'follow a hidden path' && SC.featWords('reaper', { fieldOpen: 1 }, 'N') === 'N' && SC.featWords('pyro', {}, 'M') === 'M', 'A: the store\'s lock sentence likewise');
ok(S.lockOf({ feat: 'x', featName: p => 'f' + (p.a || 0) }, { a: 1 }, () => false) === 'f1 to earn it', 'A: the store accepts a feat name that is a function of the save');
{ const p = { fieldOpen: 1, lostBanners: {}, votive: { v1: 1 } }; const m = SC.migrate(p); ok(m.join() === 'unburied' && p.secretTold.unburied === 1 && !p.secretTold.church, 'A: migrate marks what is already open as told, and only that');
  const q = { lostBanners: { fields: 1, burial: 1, witchlight: 1 } }; SC.opened(q, U); ok(q.secretNew.join() === 'unburied', 'A: opened queues the reveal'); SC.opened(q, U); ok(q.secretNew.length === 1, 'A: ...once'); SC.migrate(q); ok(!q.secretTold.unburied, 'A: a reload before the reveal keeps it owed');
  SC.revealed(q, 'unburied'); ok(!q.secretNew.length && q.secretTold.unburied === 1, 'A: revealed drains the queue');
  const t = { fieldOpen: 1 }; SC.migrate(t); SC.opened(t, U); ok(!(t.secretNew || []).length, 'A: a secret an old save had open is never queued for the reveal'); }
ok(PAUSE_ROWS.includes('Secrets') && PAUSE_ROWS.slice(0, 5).join() === 'Resume,Map,Skills,Settings,Return to map', 'A: the pause menu has a Secrets row after the first screen');

/* ---- B. THE PAGE ---- */
const pg = await openPage({ port: +process.env.PORT || portFor(8), audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const { LEVELS } = await import('/src/level.js'); const PR = (await import('/src/ui-hud.js')).PAUSE_ROWS;
    BK.manualSimulation = true; const out = {}; const TS = 16, idx = id => LEVELS.findIndex(l => l.id === id);
    const wipe = () => { for (const l of LEVELS) delete BKT.PROG[l.id]; for (const k of ['lostBanners','fieldOpen','fieldPathDrawn','votive','churchOpen','secretTold','secretNew','bossDown']) delete BKT.PROG[k]; BKT.PROG.bannerMig = 1; BKT.PROG.churchMig = 1; BKT.PROG.heroes = { knight: true }; };
    const fresh = () => { BK.setHero('knight'); BK.reset({ fresh: true }); wipe(); for (const id of ['fair','fields','burial','witchlight','waymeet']) BKT.PROG[id] = { cleared: true, medal: 1, best: 400 }; };
    const texts = (n = 1) => { window.__textRec = []; BK.step(n); const t = (window.__textRec || []).filter(x => x.kind === 'text').map(x => x.s); window.__textRec = null; return t; };
    const toMap = (focus) => { BK.state = 'gameover'; BK.press('confirm'); BK.sim(2); BK.mapLook(focus); BK.state = 'map'; };
    const take = id => { BK.load(idx(id)); BK.state = 'play'; BK.sim(4); BK.banners().pickup(id); BK.sim(1); };
    /* 1. a fresh save: nothing of the field anywhere */
    fresh(); toMap('witchlight'); out.freshMap = texts(40); out.sec0 = BK.secrets();
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 8; BK.step(6); out.freshCard = texts(1);
    /* 2. one banner: the toast, the '?' and the line on the map, the journal row, the card names the place now */
    fresh(); take('fields'); out.t1 = BK.secrets().toast; out.one = BK.secrets();
    toMap('witchlight'); out.oneMap = texts(40);
    BK.state = 'heropick'; BK.ui.heroPickStage = 'pick'; BK.ui.heroPickI = 8; BK.step(6); out.oneCard = texts(1);
    /* 3. the third: the toast, the reveal once */
    take('burial'); out.t2 = BK.secrets().toast; take('witchlight'); out.t3 = BK.secrets().toast; out.three = BK.secrets();
    toMap('witchlight'); BK.step(30); out.fx0 = BK.secrets().fx; out.fxText = texts(1); BK.step(400); out.fx1 = BK.secrets().fx; out.after = BK.secrets();
    toMap('witchlight'); BK.step(30); out.fxAgain = BK.secrets().fx;
    /* 4. the pause menu's row opens the journal */
    BK.load(idx('wood')); BK.state = 'play'; BK.sim(4); BK.press('pause'); BK.sim(2); for (let i = 0; i < PR.indexOf('Secrets'); i++) { BK.press('down'); BK.sim(1); }
    BK.press('confirm'); BK.sim(2); out.journal = texts(2); BK.press('pause'); BK.sim(2); out.afterJournal = BK.state;
    /* 5. the church: three lamps, the toast on each, the reveal */
    { fresh(); const lampAt = id => BK.L.votive.lamps.find(l => l.id === id), srcAt = id => BK.L.votive.sources.find(s => s.id === 'fire-' + id);
      const at = (x, y) => { BK.tp(x, y); BK.sim(2); BK.P.vx = 0; }, E = () => { BK.press('talk'); BK.sim(2); };
      BK.setHero('knight'); BK.load(idx('waymeet')); BK.state = 'play'; BK.god = true; BK.sim(4); out.churchTitle = []; out.churchStates = [BK.secrets().found('church')];
      for (const id of ['v1', 'v2', 'v3']) { const a = lampAt(id), f = srcAt(id); at(f.x, f.y); E(); at(a.x, a.y); E(); const t = BK.secrets().toast; out.churchTitle.push(t && t.title); out.churchStates.push(BK.secrets().found('church')); BK.sim(200); }
      out.churchLine = BK.secrets().line('church'); out.churchPending = BK.secrets().pending; toMap('church'); BK.step(30); out.churchFx = BK.secrets().fx; BK.step(400); out.churchFx1 = BK.secrets().fx; }
    /* 6. old saves */
    { const loadSave = save => { localStorage.setItem('bracken.progress.0', JSON.stringify(save)); BK.loadSlot(0); const s = BK.secrets(); return { found: [s.found('unburied'), s.found('church')], line: s.line('unburied'), pending: s.pending, told: s.told }; };
      out.oldField = loadSave({ hero: 'knight', heroes: { knight: true }, witchlight: { cleared: true, medal: 2 } });
      out.oldCleared = loadSave({ hero: 'knight', heroes: { knight: true }, unburied: { cleared: true }, church: { cleared: true } });
      out.oldPart = loadSave({ hero: 'knight', heroes: { knight: true }, lostBanners: { fields: 1, burial: 1 }, votive: { v1: 1 } });
      out.oldFresh = loadSave({ hero: 'knight', heroes: { knight: true } }); localStorage.removeItem('bracken.progress.0'); }
    return out; })()`, 600000);
  const has = (arr, re) => arr.some(s => re.test(s));
  ok(!has(r.freshMap, /^\?$|LOST BANNER/), 'B1: a fresh save: the map shows no ?, no progress line');
  ok(r.sec0.journal[0].rows.every(x => x.text === '? ? ?'), 'B1: a fresh save: the journal says ? ? ?');
  ok(has(r.freshCard, /FOUND ON A HIDDEN PATH/) && !has(r.freshCard, /UNBURIED/) && has(r.freshCard, /BEAT HIM, THEN BUY/), 'B1: the locked Death Knight card says FOUND ON A HIDDEN PATH and names no place: ' + r.freshCard.join(' | '));
  ok(r.t1 && r.t1.title === 'LOST BANNER 1/3' && !r.t1.last, 'B2: the first banner: the toast LOST BANNER 1/3: ' + JSON.stringify(r.t1));
  ok(r.one.journal[0].rows[0].text === 'THE UNBURIED FIELD' && r.one.journal[0].rows[0].note === '1/3 LOST BANNERS', 'B2: the journal now names it with its progress');
  ok(has(r.oneMap, /^\?$/) && has(r.oneMap, /^1\/3 LOST BANNERS$/), 'B2: the map shows a dim ? and 1/3 LOST BANNERS: ' + r.oneMap.filter(s => /\?|BANNER/.test(s)).join('|'));
  ok(has(r.oneCard, /FOUND ON A HIDDEN PATH/) && has(r.oneCard, /UNBURIED/), 'B2: once discovered the card names the place: ' + r.oneCard.join(' | '));
  ok(r.t2.title === 'LOST BANNER 2/3', 'B3: the second banner: LOST BANNER 2/3');
  ok(r.t3.title === 'A HIDDEN WAY OPENS' && r.t3.last && r.t3.sub === 'THE UNBURIED FIELD', 'B3: the third: A HIDDEN WAY OPENS: ' + JSON.stringify(r.t3));
  ok(r.three.pending.join() === 'unburied', 'B3: the reveal is owed (PROG.secretNew)');
  ok(r.fx0 && r.fx0.id === 'unburied' && has(r.fxText, /A HIDDEN WAY OPENS/), 'B3: the map shows the reveal: ' + JSON.stringify(r.fx0) + ' ' + r.fxText.filter(s => /HIDDEN/.test(s)).join('|'));
  ok(r.fx1 === null && !r.after.pending.length && r.after.told.unburied === 1, 'B3: the reveal ends and is told');
  ok(r.fxAgain === null, 'B3: ...and never again');
  ok(r.journal.includes('SECRETS') && has(r.journal, /ACT IV/) && has(r.journal, /1 OF 2|0 OF 2/) && r.afterJournal === 'menu', 'B4: the pause menu opens the journal and ESC goes back to the pause: ' + r.journal.join(' | '));
  ok(r.churchTitle.join() === 'VOTIVE LAMP 1/3,VOTIVE LAMP 2/3,A HIDDEN WAY OPENS', 'B5: the lamps: ' + r.churchTitle.join(', '));
  ok(r.churchStates.join() === 'unknown,found,found,open' && r.churchPending.join() === 'church', 'B5: the church is unknown, found, found, open: ' + r.churchStates.join());
  ok(r.churchFx && r.churchFx.id === 'church' && r.churchFx1 === null, 'B5: the church\'s road is shown opening once');
  ok(r.oldField.found[0] === 'open' && !r.oldField.pending.length && r.oldField.told.unburied === 1, 'B6: an old save with the field open shows it as found and is not shown the reveal');
  ok(r.oldCleared.found.join() === 'open,open' && !r.oldCleared.pending.length, 'B6: an old save that cleared both shows both as found');
  ok(r.oldPart.found.join() === 'found,found' && r.oldPart.line === '2/3 LOST BANNERS', 'B6: an old save part-way keeps its progress: ' + JSON.stringify(r.oldPart));
  ok(r.oldFresh.found.join() === 'unknown,unknown' && r.oldFresh.line === '0/3 LOST BANNERS', 'B6: an old save with nothing found: nothing shown');
  assert.deepEqual(pg.errors, []);
  console.log('SECRETS: one registry, toasts per piece, A HIDDEN WAY OPENS + map reveal once, ? and progress on the map after discovery, the journal, the hero line, old saves show as found.');
} finally { await pg.close(); }
