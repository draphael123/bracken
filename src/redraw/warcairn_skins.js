// src/redraw/warcairn_skins.js - THE WAR CAIRN's clan (claude/warcairn, GREYBOX: recoloured proven sheets - the art lane redraws them; ART TODO in scratch/lane-reports/warcairn.md).
// THE CLAN IS HUMAN: every goblin green on a base sheet goes to weathered skin, every cloth to grey hide and wool, and the one accent is WAR-PAINT RED. No new machines here:
//   clanaxe      the SOLDIER's frames (the clan axeman: a short L-R chop chain)          clanthrower  the JAVELIN's (the hatchet-thrower: his misses stand in rock)
//   clanguard    the SHIELD's (the crossed-axe guard: TAKE IT, broken by a heavy or a beat) clanchamp  the HEAVY's (the clan champion, the ring's elite)
//   clanrunner   the 'berserker' charger's (the clan runner - NOT the hero Berserker)       drummer   the ACOLYTE's runner sheet (THE DRUMMER, the one new foe)
import { canvas, flipX, whiten, rgb } from '../px.js';

const pack = (frames, ax, ay, w, h) => { const R = frames, L = frames.map(c => flipX(c)), white = frames.map(c => whiten(c)); return { R, L, white: { R: white, L: white.map(c => flipX(c)) }, ax, ay, w, h }; };
const lerpC = (a, b, t) => { const A = rgb(a), B = rgb(b); return [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]; };
const rampAt = (st, l) => l < 0.5 ? lerpC(st[0], st[1], l * 2) : lerpC(st[1], st[2], (l - 0.5) * 2);
function recolor(c, pick) { if (!c || !c.width) return c; const [d, g] = canvas(c.width, c.height); g.drawImage(c, 0, 0); const img = g.getImageData(0, 0, d.width, d.height), p = img.data;
  for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const r = p[i], gg = p[i + 1], b = p[i + 2], l = (r + gg + b) / 765; if (l < 0.1) continue;
    const st = pick(r, gg, b, l); if (!st) continue; const o = rampAt(st, Math.min(1, l * 1.15)); p[i] = o[0]; p[i + 1] = o[1]; p[i + 2] = o[2]; }
  g.putImageData(img, 0, 0); return d; }
const SKIN = ['#3a2418', '#a8724e', '#e8b890'], HIDE = ['#2a2622', '#6e6a62', '#b8b0a2'], PAINT = ['#3a0c0a', '#a8241e', '#e8604a'], WOOL = ['#26201c', '#5a5048', '#9a8e80'];
/* green (goblin hide) -> skin; red/orange cloth -> war paint; blue / violet cloth -> grey hide; brown leather -> wool */
const CLAN_PICK = (r, g, b) => (g > r + 6 && g > b + 6) ? SKIN : (r > g + 40 && r > b + 30) ? PAINT : (b > r + 10 && b >= g) ? HIDE : (r > b + 20 && g > b + 8 && r - g < 60) ? WOOL : null;
const DRUM_PICK = (r, g, b) => (b > r + 10 && b >= g) ? HIDE : (r > g + 40 && r > b + 30) ? PAINT : (g > r + 6 && g > b + 6) ? WOOL : null;
const reskin = (set, pick) => { if (!set || !set.R) return null; const R = set.R.map(f => recolor(f, pick)); return pack(R, set.ax, set.ay, set.w, set.h); };
export function bakeWarCairnSkins(SPR) {
  const out = {};
  for (const [k, base] of [['clanaxe', 'soldier'], ['clanthrower', 'javelin'], ['clanguard', 'shield'], ['clanchamp', 'heavy'], ['clanrunner', 'berserker']]) { const s = reskin(SPR[base], CLAN_PICK); if (s) out[k] = s; }
  const d = reskin(SPR.acolyte || SPR.runner, DRUM_PICK); if (d) out.drummer = d;
  return out;
}
export const WC_SKINS = ['clanaxe', 'clanthrower', 'clanguard', 'clanchamp', 'clanrunner', 'drummer'];
