// src/num-display.js - THE ONE DISPLAY RULE FOR HEALTH AND DAMAGE (claude/hpdisplay, Daniel 11-07, scratch/lane-reports/hpscale.md option A).
//
// Every number a player READS for health or damage is the internal number / SHOW_DIV. Nothing PLAYS differently: HP, damage, saves, tuning and
// the tools all keep the internal values; only the string drawn changes. One decimal under 10 (a knight at start reads 11, a light hit 1.1),
// a whole number at 10 and above (11.4 -> 11, so 11-14 do not all collapse to 1). A real amount never reads 0: it floors at 0.1.
//
// shownHp(n)   a health readout (bars, max health, heals, flask / heart / card text)
// shownDmg(n)  a damage readout (floaters, boss bar counts); the same rule, its own name so a grep finds the two kinds
// shownSigned  '+' / '-' prefix kept: shownSigned('-14') -> '-1.4'
// shownLabel   a floater's text: a NUMBER or a signed digit string is health/damage and is divided; words, counts ('3') and gold are left alone
export const SHOW_DIV = 10;
export function shownHp(n) {
  const v = +n; if (!isFinite(v)) return '0';
  const a = Math.abs(v) / SHOW_DIV, s = v < 0 ? '-' : '';
  if (a <= 0) return '0';
  if (a < 9.95) return s + String(Math.max(0.1, Math.round(a * 10) / 10));   /* (one decimal; a whole tenth-less amount drops the .0: 9, not 9.0) */
  return s + String(Math.round(a));
}
export const shownDmg = shownHp;
export const shownSigned = (sign, n) => sign + shownHp(Math.abs(+n));
const SIGNED = /^([+-])(\d+(?:\.\d+)?)$/;
export function shownLabel(txt, col) {
  if (typeof txt === 'number') return col === '#ffd34a' ? String(txt) : shownHp(txt);   /* (gold coins are numbers drawn in coin gold: not health) */
  if (typeof txt === 'string') { const m = SIGNED.exec(txt); if (m) return shownSigned(m[1], m[2]); }
  return String(txt);
}
