/* tools/curve-gate.mjs - THE MEASURED DIFFICULTY CURVE, AS A GATE WITH A LIST THAT SHRINKS (claude/combat2, 2026-10-05). No browser.
   Every campaign level's level-1 knight row (docs/level1-curve.json, tools/level1-pilot.mjs <id> --curve) against its act's band (tools/rule-state.mjs
   CURVE_BANDS, acts in src/foe-react.js ACTS). FAILS on: a level out of its band that is not on CURVE_REPORT_ONLY, and a listed level that is back in its
   band (take it out - the list may only shrink). A level whose row is missing or stale (the level changed) is printed, not failed: re-run its curve row.
     node tools/curve-gate.mjs
   (claude/curvec2, brief-curvefix-1018 Q8) ACTS III-V ALSO READ THE CAMPAIGN WALKER (docs/walk-curve.json, tools/walk-curve.mjs; targets by act in tools/level-walk.mjs TARGET_BY_ACT): REPORT-ONLY - the rows are printed against the act's
   death band and arrival target and NEVER fail the gate. The L1 pilot's act IV-V bands above stay as they are until Daniel says the walker gates them (the brief: report-only first, then gating). */
import { LEVELS } from '../src/level.js';
import { depthsOf } from '../src/campaign-order.js';
import { levelHash } from './level-quality.mjs';
import { curveVerdict, CURVE_REPORT_ONLY } from './rule-state.mjs';
import { loadCurve, verdict, actTable } from './walk-curve.mjs';
const depth = depthsOf(LEVELS), camp = LEVELS.filter(d => !(d.hidden && !d.secret) && !/^(shop|trial_|custom)/.test(d.id));
const bad = [], soft = [], listed = [];
for (const d of camp) { const v = curveVerdict(d.id, levelHash(d), depth[d.id]), on = !!CURVE_REPORT_ONLY[d.id];
  if (v.soft) soft.push(d.id + ' (' + v.state + ')');
  else if (!v.ok && !on) bad.push(d.id + ': ' + v.msg + ' - out of its act band and not on CURVE_REPORT_ONLY');
  else if (v.ok && on) bad.push(d.id + ': ' + v.msg + ' - BACK IN ITS BAND: take it out of CURVE_REPORT_ONLY (tools/rule-state.mjs)');
  else if (on) listed.push(d.id); }
for (const id of Object.keys(CURVE_REPORT_ONLY)) if (!camp.some(d => d.id === id)) bad.push(id + ': on CURVE_REPORT_ONLY but not a campaign level');
if (soft.length) console.log('curve-gate: not measured (missing or stale rows - re-run node tools/level1-pilot.mjs <id> --curve): ' + soft.join(', '));
if (bad.length) { console.log('curve-gate FAIL:\n  ' + bad.join('\n  ')); process.exit(1); }
/* the campaign walker, acts III-V (REPORT-ONLY) */
const NL = String.fromCharCode(10);
try { const wc = loadCurve(); if (wc && wc.after) { const hashOfId = Object.fromEntries(camp.map(d => [d.id, levelHash(d)])), rows = Object.entries(wc.after).filter(([, L]) => L.act >= 3), A = actTable(Object.fromEntries(rows)), off = [], stale = [];
    for (const [id, L] of rows) { const v = verdict(L); if (L.hash && hashOfId[id] && L.hash !== hashOfId[id]) stale.push(id); if (v.deaths !== 'ok' || v.arrive === 'soft') off.push(id + ' ' + L.deaths + 'd/' + (L.arrive ?? '-') + '% (' + (v.deaths !== 'ok' ? 'deaths ' + v.deaths : '') + (v.deaths !== 'ok' && v.arrive === 'soft' ? ', ' : '') + (v.arrive === 'soft' ? 'arrives soft' : '') + ')'); }
    console.log('curve-gate (walker, acts III-V, REPORT-ONLY): ' + Object.entries(A).map(([a, t]) => 'act ' + a + ' ' + t.deaths + ' deaths (median ' + t.deathsMed + ') / ' + t.arrive + '% arrival, ' + t.inBand + '/' + t.n + ' in the death band').join('; ') + (off.length ? NL + '  off target: ' + off.join(', ') : '') + (stale.length ? NL + '  stale rows (level changed since the walk): ' + stale.join(', ') : '')); } } catch (e) { console.log('curve-gate (walker rows): not read - ' + e.message); }
console.log('curve-gate: ' + camp.length + ' campaign levels; ' + listed.length + ' out of their act band and report-only (the level sweep shrinks the list): ' + listed.join(', '));
