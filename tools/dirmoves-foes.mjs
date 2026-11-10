/* tools/dirmoves-foes.mjs - DMFOES node proof (no browser): the foe rules in src/dirmoves.js, their wiring in main.js, the closed leap-swat list. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as D from '../src/dirmoves.js';
import * as MARKS from '../src/marks.js';
const { DM } = D; let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const mk = o => ({ alive: true, t: 'shield', x: 100, y: 100, w: 10, h: 14, broken: 0, stagger: 0, face: 1, ...o });
const hero = { x: 104, y: 60, dead: false };
/* OFF = inert */
DM.on = false;
{ const e = mk({}); ok(D.highGuardTick(e, [hero], 1, 1) === null, 'off: no lift'); ok(!D.noteTurn(e, 1), 'off: no turn'); ok(!D.highGuardTurns(e, 1), 'off: plunge not turned');
  ok(!D.helmCrack(e, 'plunge', true), 'off: no crack'); ok(!D.swatHit(mk({ t: 'hound', air: true }), 'rise', 1), 'off: no swat'); ok(D.familyKey('shell', ['heavy']).join() === 'heavy', 'off: shell key unchanged');
  ok(D.codex('shield', 'abc') === 'abc', 'off: codex unchanged'); ok(D.hintTake({}, 'helm') === null, 'off: no hint'); ok(D.famNameOf({}, 'vulture') === undefined, 'off: desert kinds stay out'); }
DM.on = true;
/* HIGH GUARD: a hero above 0.35 s -> up for 1.5 s; plunge turned; rise glances; sweep not; broken / busy never */
{ const e = mk({}); let t = 0, ev = null; for (; t < 0.3; t += 0.05) ev = D.highGuardTick(e, [hero], t, 0.05); ok(ev === null && !D.highGuardUp(e, t), 'not yet at 0.3 s');
  for (; t < 0.6; t += 0.05) { ev = D.highGuardTick(e, [hero], t, 0.05); if (ev) break; } ok(ev === 'lift', 'lifts after 0.35 s'); ok(D.highGuardTurns(e, t + 1.4) && !D.highGuardTurns(e, t + 1.6), 'up for 1.5 s');
  ok(D.highGuardGlances(e, 'rise', true, t + 0.1) && D.highGuardGlances(e, 'light', true, t + 0.1), 'rise + light glance from the front'); ok(!D.highGuardGlances(e, 'sweep', true, t + 0.1), 'sweep goes under'); ok(!D.highGuardGlances(e, 'rise', false, t + 0.1), 'from behind lands');
  ok(D.highGuardBreak(e, ['sweep', 'heavy'], t + 0.1) === 1.4 && D.highGuardBreak(e, 'sweep', t + 0.1) === 0, 'charged sweep breaks it'); e.broken = 1; ok(!D.highGuardTurns(e, t + 0.1), 'broken = not up'); }
{ const e = mk({}); ok(D.highGuardTick(e, [hero], 0, 1, true) === null && D.highGuardTick(e, [hero], 1, 1, true) === null, 'busy foe never lifts'); const far = { x: 300, y: 60 }; ok(D.highGuardTick(e, [far], 2, 1) === null && !e.dmAbove, 'far hero: nothing'); const low = { x: 100, y: 100 }; ok(D.highGuardTick(e, [low], 3, 1) === null, 'hero at his feet: nothing'); }
{ const e = mk({}); D.noteTurn(e, 1); ok(D.noteTurn(e, 2.5) === true, 'two front blows inside 2 s raise it'); ok(D.highGuardUp(e, 3), 'and it is up'); }
{ const e = mk({}); D.noteTurn(e, 1); ok(D.noteTurn(e, 3.5) === false, 'two blows 2.5 s apart do not'); }
{ ok(D.highGuardTick(mk({ t: 'crab' }), [hero], 1, 1) === null && !D.noteTurn(mk({ t: 'crab' }), 1), 'crab is not a high guard (8.5)'); ok(!D.noteTurn(mk({ t: 'shield', elite: true }), 1), 'elite is not'); const g = mk({ t: 'shield', cnSkin: 'shieldguard' }); ok(D.guardsHighKind(g), 'skin counts'); }
for (const t of ['shield', 'soldier', 'heavy', 'watch', 'pike', 'turtle', 'tideguard', 'merrowbrute', 'glasssentinel', 'kingsshield', 'myconidguard', 'herbwarden', 'shieldguard']) ok(D.HIGH_GUARD.has(t), 'high guard ' + t);
/* HELM */
{ const e = mk({ t: 'sentry' }); ok(!D.helmCrack(e, 'plunge', false), 'a stomp (not a real plunge) cracks nothing'); ok(!D.helmCrack(e, 'light', true), 'a light cut cracks nothing'); ok(D.helmCrack(e, 'plunge', true) && D.helmGone(e), 'a plunge cracks it'); ok(!D.helmCrack(e, 'plunge', true), 'once'); ok(!D.helmCrack(mk({ t: 'sprig' }), 'plunge', true), 'bare head: no'); }
for (const t of ['shield', 'bellguard', 'sentry', 'armour', 'swornsword', 'hedgeknight', 'boarder', 'bosun', 'kingsshield']) ok(D.HELM.has(t), 'helm ' + t);
/* FAMILY EDITS */
ok(D.familyKey('shell', ['heavy', 'shot']).includes('plunge') && D.familyKey('beast', ['heavy']).includes('plunge'), 'shell + beast gain plunge'); ok(D.familyKey('plate', ['heavy', 'plunge']).join() === 'heavy,plunge' && D.familyKey('wing', ['rise']).join() === 'rise', 'others unchanged');
ok(D.beastPlunge('beast', 'plunge').stagger === 0.6 && D.beastPlunge('beast', 'plunge').poiseMul === 1.5 && !D.beastPlunge('beast', 'light') && !D.beastPlunge('shell', 'plunge'), 'beast plunge: stagger 0.6, lean 1.5');
ok(D.wingGrounded('wing', ['rise', 'heavy']) && !D.wingGrounded('wing', 'rise') && !D.wingGrounded('beast', ['rise', 'heavy']), 'charged rise grounds a wing');
/* LEAP-SWAT */
{ const h = mk({ t: 'hound', air: false }); ok(!D.swatHit(h, 'rise', 1), 'grounded hound is not swatted'); h.air = true; ok(!D.swatHit(h, 'light', 1), 'only a rise'); ok(D.swatHit(h, 'rise', 1) && !D.swatHit(h, 'rise', 1.5) && D.swatHit(h, 'rise', 2.5), 'once a second'); ok(D.swatHit(mk({ t: 'spider', mode: 'drop' }), ['rise', 'riposte'], 1), 'spider drop, riposte rise'); ok(!D.swatHit(mk({ t: 'spider', mode: 'hang' }), 'rise', 1), 'hanging spider no'); ok(!D.swatHit(mk({ t: 'hound', air: true, elite: true }), 'rise', 1), 'elite no'); }
ok(DM.foe.leapSwatMul === 1.5, 'swat x1.5 is the broken multiplier main.js applies after dmFoeBlow');
/* the leap list is CLOSED: every marks.js row that matches the regex (not a Tell, not a boss/mini row) is a target or exempt */
{ const bossy = new Set(); const { LEVELS } = await import('../src/level.js');
  for (const lv of LEVELS) { try { const L = lv.build(); for (const b of [L.arena && L.arena.boss, L.mini && L.mini.boss]) if (b) bossy.add(b); } catch {} }
  const WING = new Set(['petrel', 'angler', 'eel', 'manta', 'rook', 'bat', 'crow', 'kite', 'harpy', 'hawkscout']), MODULE = new Set(['forgemaster', 'mummy', 'stagehand', 'marionette', 'heavy', 'watch', 'ram', 'trophyhunter', 'raptor']);
  const left = []; for (const k of Object.keys(MARKS.ANSWER)) { const [t, m] = k.split('|'); if (!m || /Tell$|^ek|^chop/.test(m) || !D.LEAP_RE.test(m.replace(/chop/gi, ''))) continue; if (bossy.has(t) || WING.has(t) || MODULE.has(t) || D.LEAP_SWAT[t]) continue; left.push(k); }
  ok(left.length === 0, 'unclassified leap rows: ' + left.join(' ')); }
/* CODEX */
{ const c = D.codex('shield', 'Blocks anything from the front with a clank. Turns slowly, so cross behind him and strike, or plunge from above. Stomps clank off the helm.'); ok(/lifts his shield/.test(c) && !/or plunge from above/.test(c) && /cracks the helm/.test(c), 'shield codex rewritten');
  const missing = Object.keys(D.CODEX_ADD).filter(t => !main.includes("{ t: '" + t + "', name:")); console.log('  codex lines with no bestiary entry (dead until one exists): ' + (missing.join(' ') || 'none')); }
/* HINTS: twice per save */
{ const P = {}; ok(D.hintTake(P, 'highguard') && D.hintTake(P, 'highguard') && D.hintTake(P, 'highguard') === null, 'a hint says twice'); for (const k of ['highguard', 'helm', 'swat', 'grounded', 'airdash']) ok(D.HINTS[k], 'hint ' + k); }
/* DESERT KINDS */
{ const fam = main.slice(main.indexOf('const FAMILY = {'), main.indexOf('const FAMILY_OF')); for (const t of Object.keys(D.FAMILY_ADD)) ok(!new RegExp("'" + t + "'").test(fam), t + ' is in no family today'); ok(D.famNameOf({}, 'vulture') === 'wing' && D.famNameOf({ shield: 'guard' }, 'shield') === 'guard', 'DM.on adds the desert kinds'); }
/* WIRING in main.js */
for (const s of ['DMX.highGuardTurns(e, time)', 'DMX.noteTurn(e, time', 'DMX.helmGone(e)', 'DMX.highGuardGlances(', 'DMX.beastPlunge(', 'DMX.familyKey(', 'DMX.codex(b.t, b.desc)', 'DMX.drawHigh(', 'dmFoeFrame(dt)', 'DMX.swatHit(', 'DMX.helmCrack(', 'DMX.wingGrounded(', "dmHint('airdash')", 'DMX.famNameOf(FAMILY_OF']) ok(main.includes(s), 'main.js wires ' + s);
ok((main.match(/DMX\.highGuardTurns\(e, time\)/g) || []).length === 2, 'plunge AND stomp are turned');
console.log('dirmoves-foes: ' + n + ' checks OK');
