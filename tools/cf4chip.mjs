// tools/cf4chip.mjs - CF4CHIP (claude/cf4chip, 11-14): the chip drain on foe, elite and mini-boss bars. Node only, no browser.   node tools/cf4chip.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as C from '../src/cf-hud.js';
const near = (a, b, m, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, m + ': ' + a + ' vs ' + b);

/* flag ships OFF, setter flips it, the existing CF4_SHIPS is untouched */
/* (batch187) ships ON; BRACKEN_CF4CHIP=0 in the env (node) = the opt-out, flag false at load */
const OPT_OUT = process.env.BRACKEN_CF4CHIP === '0';
assert.equal(C.CF4CHIP_SHIPS, !OPT_OUT, OPT_OUT ? 'CF4CHIP_SHIPS false with the BRACKEN_CF4CHIP=0 opt-out' : 'CF4CHIP_SHIPS ships true'); C.setCF4Chip(OPT_OUT); assert.equal(C.CF4CHIP_SHIPS, OPT_OUT); C.setCF4Chip(!OPT_OUT); assert.equal(C.CF4CHIP_SHIPS, !OPT_OUT);

/* ON maths, a foe: born full, one hit 30 -> 18 of 30: red drops at once, white holds 0.4 s, then drains at 0.6 bar/s (the SAME barStep as hero + boss) */
{
  const e = { hp0: 30 }; let t = 100;
  let st = C.foeChip(e, 30, 30, t); assert.equal(st.foe, true); near(st.chip, 1, 'full'); assert.equal(e.cfc, st, 'state lives on the entity');
  t += 1 / 60; st = C.foeChip(e, 18, 30, t); near(st.fill, 0.6, 'red drops at once'); near(st.chip, 1, 'white keeps the chunk');
  for (let i = 0; i < 20; i++) { t += 0.02; st = C.foeChip(e, 18, 30, t); } near(st.chip, 1, 'held ~0.4 s', 0.02);
  t += 0.1; st = C.foeChip(e, 18, 30, t); near(st.chip, 1 - 0.6 * 0.1 + 0 , 'drain starts after the hold', 0.05);
  for (let i = 0; i < 60; i++) { t += 0.05; st = C.foeChip(e, 18, 30, t); } near(st.chip, 0.6, 'settles on the red'); assert.equal(C.ghostOf(st, 0.6), 0.6);
  /* a hit mid-drain adds to the chunk, never shrinks it */
  t += 0.02; st = C.foeChip(e, 6, 30, t); near(st.fill, 0.2, 'second hit'); assert.ok(st.chip >= 0.6 - 1e-9, 'chunk keeps the old white'); assert.ok(C.ghostOf(st, 0.2) >= 0.6 - 1e-9);
}
/* a first draw AFTER damage still shows the hit (state is born full, then stepped to the real hp) */
{ const e = {}; const st = C.foeChip(e, 10, 40, 5); near(st.chip, 1, 'late first draw: chip from full'); near(st.fill, 0.25, 'red at the real hp'); }
/* dt clamp: a foe back from off screen drains at most 0.1 s of chip, not all at once */
{ const e = {}; let t = 0; C.foeChip(e, 40, 40, t); t += 0.01; C.foeChip(e, 20, 40, t); t += 30; const st = C.foeChip(e, 20, 40, t); assert.ok(st.hold <= 0.31 + 1e-9 && st.chip > 0.9, 'a 30 s gap is one 0.1 s step'); }
/* mini-boss bar: same holder, hp clamps at 0, the draw passes ghostOf */
{ const m = { hp: 100, hp0: 100 }; let t = 1; C.foeChip(m, 100, 100, t); t += 0.016; const st = C.foeChip(m, 40, 100, t); near(C.ghostOf(st, 0.4), 1, 'mini ghost = the lost chunk'); t += 5; const s2 = C.foeChip(m, 0, 100, t); assert.equal(s2.fill, 0); }
/* cleanup: drop only removes the foe's own state, never the boss's (boss.cfc has no .foe) */
{ const e = { hp0: 5 }; C.foeChip(e, 3, 5, 1); C.foeChipDrop(e); assert.equal(e.cfc, null, 'dropped'); const b = { cfc: { init: true } }; C.foeChipDrop(b); assert.ok(b.cfc && b.cfc.init, 'a boss state is never dropped'); C.foeChipDrop({}); }
/* zero / bad max never throws or goes NaN */
{ const e = {}; const st = C.foeChip(e, 0, 0, 1); assert.ok(Number.isFinite(st.chip) && Number.isFinite(st.fill)); }
/* no per-frame allocation after the first call: the same state object every call */
{ const e = {}; const a = C.foeChip(e, 5, 5, 1); assert.equal(C.foeChip(e, 4, 5, 1.02), a); assert.equal(C.foeChip(e, 4, 5, 1.04), a); }

/* WIRING GREPS: OFF = the old draw path exactly, every call behind the flag, the preview switch */
{
  const main = fs.readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  assert.ok(main.includes("CF4.setCF4Chip(c4c !== '0' && c4c !== 'off')") && main.includes("q.get('cf4chip')"), '?cf4chip= preview switch');
  const oldFoe = "else if (SET.foeBars && e.hp0 && e.hp < e.hp0 && e.hp > 0 && !e.maxHp && !e.harmless && !e.elite) { const bx = Math.round(e.x - cx) - 6, by = Math.round(e.y - e.h - cy) - 5; g.fillStyle = ART.OUT; g.fillRect(bx - 1, by - 1, 14, 4); g.fillStyle = '#2a2230'; g.fillRect(bx, by, 12, 2); g.fillStyle = e.hp / e.hp0 > 0.5 ? '#8fd160' : '#ff6b6b'; g.fillRect(bx, by, Math.round(12 * e.hp / e.hp0), 2); }";
  assert.ok(main.includes(oldFoe), 'OFF: the foe bar is the old draw, byte for byte');
  assert.ok(main.includes("g.fillStyle = k > 0.34 ? '#e0b040' : '#ff6b6b'; g.fillRect(bx, by, Math.round(w * k), 2);"), 'OFF: the elite bar fill is the old line');
  assert.ok(main.includes("m.mounted ? '#e0b040' : '#8fd160', CF4.CF4CHIP_SHIPS ? CF4.ghostOf(") && main.includes(' : null);   /* (claude/cf4chip) the mini-boss bar'), 'OFF: the mini bar passes ghost null (the old call)');
  for (const m of main.matchAll(/CF4\.(foeChip|foeChipDrop)\b/g)) {
    const at = m.index, line = main.slice(main.lastIndexOf('\n', at) + 1, main.indexOf('\n', at)), prev = main.slice(main.lastIndexOf('\n', main.lastIndexOf('\n', at) - 1) + 1, main.lastIndexOf('\n', at));
    assert.ok(/CF4CHIP_SHIPS/.test(line) || /CF4CHIP_SHIPS/.test(prev) || /^\s*else if \(!\(e\.hp < e\.hp0\)/.test(line) && /^\s*if \(SET\.foeBars/.test(prev), 'unguarded foeChip call on: ' + line.slice(0, 140));
  }
  assert.ok(main.includes('if (CF4.CF4CHIP_SHIPS) {   /* (claude/cf4chip) the foe') , 'foe branch is flag-gated');
  assert.ok(!/cf4chip\.mjs/.test(fs.readFileSync(new URL('./check.mjs', import.meta.url), 'utf8')), 'not registered in check.mjs (integ does that)');
}
console.log('cf4chip: ok');
