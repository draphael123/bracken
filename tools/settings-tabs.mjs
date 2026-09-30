// tools/settings-tabs.mjs - SETTINGS IN TABS, REBINDING, THE CO-OP GUIDE (claude/storeui; HANDOFF items 18 and 22).
//   1. the five tabs exist (AUDIO, DISPLAY, GAMEPLAY, CONTROLS, ACCESSIBILITY) and EVERY row of the old Settings list is on exactly one of them,
//      under the name it always had (a saved value is keyed by the SET field behind the name, which the tabs never touch)
//   2. an OLD settings file (no binds, no coop flag, every old key) loads to exactly the values it held; a garbage binds field is cleaned
//   3. the tabs answer to the keyboard (left/right on the strip, TAB) and to a gamepad (LB / RB), and the COMBAT switch still flips
//   4. REBINDING: with the defaults, KEYS answers to the keys it always did; a rebound jump answers to its new key in play and no longer
//      to the old one; a conflict is flagged; a reserved key is refused; the pad rebinds through a real pad poll; it saves, loads and resets
//   5. THE CARD: every hero's rows show the chosen keys; the Pyromancer's has an EMBER WARD row (HOLD DOWN) and no 'block' row
//   6. THE CO-OP PAGE opens by itself the first time co-op is switched on, once, and again from the pause menu
//   SETTINGS_SHOTS=<dir> also writes a capture of each tab, the rebind page, the card and the co-op pages (work/storeui/).
import assert from 'node:assert/strict';
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
import { TABS, TAB_ITEMS, LEGACY_ROWS, tabOf, isHeaderRow } from '../src/settings-ui.js';
import { cardRows, keysTable, KB_DEFAULT, cleanBinds, emptyBinds, setSlot, conflicts, PROFILES } from '../src/controls.js';

/* ---- 1. the tabs, statically ---- */
assert.deepEqual(TABS.map(t => t.name), ['AUDIO', 'DISPLAY', 'GAMEPLAY', 'CONTROLS', 'ACCESSIBILITY']);
const seen = new Map();
for (const t of TABS) for (const k of TAB_ITEMS[t.id]) { if (isHeaderRow(k)) continue; assert(!seen.has(k), `row "${k}" is on two tabs (${seen.get(k)} and ${t.id})`); seen.set(k, t.id); }
for (const k of LEGACY_ROWS) assert(tabOf(k), `the old Settings row "${k}" is on no tab`);
assert.equal(tabOf('Combat'), 'gameplay'); assert.equal(tabOf('Sound test'), 'audio'); assert.equal(tabOf('Reduce motion'), 'access'); assert.equal(tabOf('Rebind keys'), 'controls');

/* ---- 4a. the defaults are the old key lists ---- */
{ const t = keysTable(emptyBinds());
  for (const a in KB_DEFAULT) assert.deepEqual([...new Set(t[a].map(x => x.toLowerCase()))].filter(x => x !== 'escape').sort(), [...new Set(KB_DEFAULT[a].flatMap(x => x === 'Space' ? [' ', 'space'] : [x.toLowerCase()]))].filter(x => x !== 'escape').sort(), 'default keys for ' + a);
  const b = emptyBinds(); setSlot(b, 'kb', 'jump', 0, 'i'); assert.deepEqual(b.kb.jump, ['i', 'Space']);
  assert(!conflicts(b, 'kb').jump, 'no flag when nothing is shared'); setSlot(b, 'kb', 'atk', 0, 'i'); assert(conflicts(b, 'kb').jump && conflicts(b, 'kb').atk, 'the shared key is flagged on both rows');
  assert.deepEqual(conflicts(emptyBinds(), 'kb'), {}, 'the defaults (UP is also jump) are not flags');
  assert.deepEqual(cleanBinds({ kb: { jump: ['<script>', 'x', 'y'], nonsense: ['z'] }, pad1: { jump: [99, 3] }, pad9: {} }), { kb: { jump: [null, 'x'] }, pad1: { jump: [null, 3] }, pad2: {} }, 'garbage is cleaned'); }

/* ---- 5a. the card, statically ---- */
{ const pyro = cardRows({ hero: 'pyro' }), names = pyro.map(r => r[0]);
  const ward = pyro.find(r => r[0] === 'ember ward'); assert(ward && /HOLD DOWN/.test(ward[1]), 'the Pyromancer\'s card has an EMBER WARD row: HOLD DOWN');
  assert(!names.includes('block'), 'her card no longer lists C as block'); assert(pyro.find(r => /EMBER/.test(r[1]) && r[0] === 'ember / jet'), 'C is her ember and jet');
  for (const h of ['knight', 'warden', 'paladin', 'pirate', 'reaper', 'geomancer']) { const r = cardRows({ hero: h }); assert(r.find(x => x[0] === 'crouch' && /HOLD DOWN/.test(x[1])), h + ' has the universal duck on the card'); assert(!r.find(x => x[0] === 'ember ward'), h + ' has no ember ward'); }
  const b = emptyBinds(); setSlot(b, 'kb', 'jump', 0, 'i'); setSlot(b, 'kb', 'block', 0, 'o'); setSlot(b, 'kb', 'down', 0, 'k');
  const rows = cardRows({ hero: 'knight', binds: b }); assert(/^I \//.test(rows.find(r => r[0] === 'jump')[1]), 'the card shows the chosen jump key'); assert(/HOLD O/.test(rows.find(r => r[0] === 'block')[1]), 'and the chosen C');
  assert(/HOLD K/.test(cardRows({ hero: 'pyro', binds: b }).find(r => r[0] === 'ember ward')[1]), 'and the ember ward follows the crouch key'); }

const shots = process.env.SETTINGS_SHOTS; if (shots) mkdirSync(shots, { recursive: true });
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    const out = {}, shots = [], ui = BK.ui;
    const key = (k, code) => { dispatchEvent(new KeyboardEvent('keydown', { key: k, code: code || k })); BK.step(1); dispatchEvent(new KeyboardEvent('keyup', { key: k, code: code || k })); };
    const shoot = n => { BK.step(30); shots.push({ name: n, png: BK.view.buf.toDataURL() }); };
    /* a pad we can push buttons on */
    const fake = { connected: true, id: 'fake', index: 0, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
    navigator.getGamepads = () => [fake]; const tap = b => { fake.buttons[b].pressed = true; ui.pollPad(); BK.step(1); fake.buttons[b].pressed = false; ui.pollPad(); BK.step(1); };

    /* ---- 2. an OLD settings file ---- */
    const old = { font: 'press', ink: 'parchment', uiTheme: 'oak', music: false, sfx: 0.3, musicVol: 0.4, shake: true, shakeAmt: 0.5, sfxFiles: false, voices: false, hitstop: false, numbers: false, timer: false, ambient: false, difficulty: 'hard', combat: 'classic', speed: 0.85, speedV2: 1, assist: true, wayOn: true, iron: true, blockToggle: true, textFast: true, swapZX: true, rumble: false, ambVol: 0.2, uiVol: 0.6, bigText: true, colorSafe: true, reduceMotion: true, flashes: false, scale: 3, scanlines: true, bright: 1.25, tenths: true };
    const set = ui.readSettings(JSON.stringify(old)); const S = ui.settings();
    out.oldKept = Object.keys(old).filter(k => JSON.stringify(S[k]) !== JSON.stringify(old[k]));
    out.bindsEmpty = JSON.stringify(S.binds); out.coopSeenOld = S.coopHelpSeen;
    ui.readSettings(JSON.stringify({ binds: { kb: { jump: ['<b>', 'x'], zzz: ['q'] }, pad1: 'no' } }));
    out.cleaned = JSON.stringify(ui.settings().binds);
    ui.readSettings('{}');

    /* ---- 1/3. the tabs in the game ---- */
    BK.reset({ fresh: true }); BK.state = 'title'; ui.openMenu('title');
    out.kind = ui.menuKind; out.tabs = []; const union = new Set();
    for (const t of ${JSON.stringify(TABS.map(t => t.id))}) { ui.settingsTab = t; const rows = ui.menuRows(); out.tabs.push([t, rows.length]); if (rows[0] !== '@TABS' || rows[rows.length - 1] !== 'Back') out.badFrame = t; for (const k of rows) union.add(k); BK.state = 'menu'; if (${JSON.stringify(shots || '')}) shoot('tab-' + t); }
    out.union = [...union];
    ui.settingsTab = 'audio'; ui.menuI = 0; key('ArrowRight'); out.afterRight = ui.settingsTab; key('ArrowLeft'); out.afterLeft = ui.settingsTab; key('Tab'); out.afterTab = ui.settingsTab;
    ui.settingsTab = 'audio'; tap(5); out.afterRB = ui.settingsTab; tap(4); out.afterLB = ui.settingsTab;
    ui.settingsTab = 'gameplay'; const rows = ui.menuRows(); ui.menuI = rows.indexOf('Combat'); const c0 = S.combat; key('ArrowRight'); out.combat = [c0, ui.settings().combat]; key('ArrowLeft');

    /* ---- 4. rebinding ---- */
    BK.state = 'menu'; ui.rebind.open(0); out.rebindState = BK.state; const rb = ui.rebind.state();
    rb.i = 4; rb.slot = 0; key('Enter'); out.listening = ui.rebind.state().listening;
    key('r'); out.reserved = [ui.rebind.state().listening, JSON.stringify(ui.settings().binds.kb.jump || null)];
    rb.i = 4; rb.slot = 0; key('Enter'); key('i'); out.jump = ui.settings().binds.kb.jump;
    if (${JSON.stringify(shots || '')}) shoot('rebind');
    rb.i = 5; rb.slot = 0; key('Enter'); key('i'); out.conflict = ui.rebind.conflicts();
    if (${JSON.stringify(shots || '')}) shoot('rebind-conflict');
    /* in play the new key jumps and the old one does not */
    BK.load(0); BK.state = 'play'; BK.god = true; BK.sim(120);
    const jumped = k => { BK.P.vy = 0; const y = BK.P.y; dispatchEvent(new KeyboardEvent('keydown', { key: k })); BK.step(3); dispatchEvent(new KeyboardEvent('keyup', { key: k })); const up = BK.P.vy < -50 || BK.P.y < y - 1; BK.sim(90); return up; };
    out.newKeyJumps = jumped('i'); out.oldKey = jumped('k') ? 'k still jumps' : 'no';
    /* the pad: a real pad poll */
    BK.state = 'menu'; ui.rebind.open(1); const rp = ui.rebind.state(); rp.i = 4; rp.slot = 0; key('Enter'); tap(6); out.padJump = ui.settings().binds.pad1.jump;
    /* saved and loaded */
    const saved = localStorage.getItem('bracken.settings'); out.savedHasBinds = /"binds"/.test(saved) && /"i"/.test(saved);
    ui.readSettings('{}'); out.afterBlank = JSON.stringify(ui.settings().binds); ui.readSettings(saved); out.reloaded = JSON.stringify(ui.settings().binds.kb.jump);
    /* the reset */
    ui.rebind.open(0); const rr = ui.rebind.state(); rr.i = 15; key('Enter'); out.armed = rr.arm > 0; key('Enter'); out.afterReset = JSON.stringify(ui.settings().binds.kb);
    ui.rebind.open(1); ui.readSettings('{}');

    /* ---- 5. the card in the game ---- */
    for (const h of ['pyro', 'knight']) { BK.setHero(h); const rows = ui.controlsRows(); out['card_' + h] = rows.map(x => x.join('|')); BK.state = 'controls'; if (${JSON.stringify(shots || '')}) shoot('card-' + h); }

    /* ---- 6. the co-op page ---- */
    ui.readSettings('{}'); BK.setHero('knight'); BK.load(0); ui.coopPickOpen('title'); const heroes = ui.coopPickList(); out.coopList = heroes.length;
    key('z'); out.coopFirst = BK.state; out.coopSeen1 = ui.settings().coopHelpSeen;
    if (${JSON.stringify(shots || '')}) for (let p = 0; p < ui.coopHelp.pages().length; p++) { ui.coopHelp.page = p; shoot('coop-page-' + (p + 1)); ui.coopHelp.page = 0; }
    key('Escape'); out.coopClosed = BK.state;
    ui.coopPickOpen('title'); key('z'); out.coopSecond = BK.state;
    ui.openMenu('play'); ui.menuKind = 'pause'; const PI = ui.menuRows(); ui.menuI = PI.indexOf('Co-op guide'); out.pauseHas = ui.menuI; key('Enter'); out.pauseGuide = BK.state;
    return { out, shots };
  })()`);
  const o = r.out;
  assert.deepEqual(o.oldKept, [], 'every old saved value loads unchanged: ' + o.oldKept);
  assert.equal(o.bindsEmpty, JSON.stringify({ kb: {}, pad1: {}, pad2: {} }), 'an old file has no rebinds'); assert(!o.coopSeenOld, 'an old file has not seen the co-op page');
  assert.equal(o.cleaned, JSON.stringify({ kb: { jump: [null, 'x'] }, pad1: {}, pad2: {} }), 'garbage binds are cleaned on load');
  assert.equal(o.badFrame, undefined, 'every tab starts with the strip and ends with Back: ' + o.badFrame);
  for (const k of LEGACY_ROWS) assert(o.union.includes(k), 'the game shows the old row ' + k);
  assert.equal(o.tabs.length, 5);
  assert.equal(o.afterRight, 'display'); assert.equal(o.afterLeft, 'audio'); assert.equal(o.afterTab, 'display', 'TAB steps the tab'); assert.equal(o.afterRB, 'display', 'RB steps the tab on a pad'); assert.equal(o.afterLB, 'audio', 'LB steps it back');
  assert.notEqual(o.combat[0], o.combat[1], 'the COMBAT switch still flips on the Gameplay tab');
  assert.equal(o.rebindState, 'rebind'); assert.equal(o.listening, true, 'Z/ENTER on a row listens'); assert.deepEqual(o.reserved, [false, 'null'], 'R is reserved and refused');
  assert.deepEqual(o.jump, ['i', 'Space'], 'jump rebound to I'); assert(o.conflict.jump && o.conflict.atk, 'binding I twice flags both rows: ' + JSON.stringify(o.conflict));
  assert.equal(o.newKeyJumps, true, 'the new key jumps in play'); assert.equal(o.oldKey, 'no', 'the old key no longer does');
  assert.deepEqual(o.padJump, [6, null], 'the pad rebinds through a real poll (LT)');
  assert(o.savedHasBinds, 'the bindings are in the saved settings'); assert.equal(o.afterBlank, JSON.stringify({ kb: {}, pad1: {}, pad2: {} })); assert.equal(o.reloaded, JSON.stringify(['i', 'Space']), 'and load back');
  assert(o.armed, 'reset asks twice'); assert.equal(o.afterReset, '{}', 'and puts the page back to its defaults');
  assert(o.card_pyro.some(x => /^ember ward\|HOLD DOWN/.test(x)) && !o.card_pyro.some(x => /^block\|/.test(x)), 'the game\'s Pyromancer card: ' + o.card_pyro.join(' ; ')); assert(o.card_knight.some(x => /^block\|HOLD C/.test(x)));
  assert.equal(o.coopFirst, 'coophelp', 'the co-op page opens the first time co-op is switched on'); assert(o.coopSeen1); assert.equal(o.coopClosed, 'map'); assert.equal(o.coopSecond, 'map', 'and only the first time');
  assert.equal(o.pauseGuide, 'coophelp', 'the pause menu opens it again');
  assert.deepEqual(pg.errors, []);
  if (shots) for (const s of r.shots) writeFileSync(shots + '/' + s.name + '.png', Buffer.from(s.png.split(',')[1], 'base64'));
  console.log('settings-tabs ok: 5 tabs,', o.union.length, 'rows, rebinding saves/loads/flags/resets, ember ward row, co-op page once');
} finally { pg.close(); }
