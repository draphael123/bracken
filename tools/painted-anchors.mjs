/* tools/painted-anchors.mjs - NOTHING PAINTED FLOATS (claude/smallfix15, from claude/knightshield 11-05: a Kingswood road-banner POLE painted by src/redraw/kingswood_areas.js stopped 8 px above the
   ground, and anchor-lint / floaters / the sprite checks never see art painted straight to the canvas outside the ent/decor lists). NODE ONLY (no page): a RECORDING canvas stands in for the
   page's, each painted-art module's feature list is built from the real level and every feature is drawn into it, and then:
     pole     an upright rect (a thin one >= 24 px tall, or any width >= 40 px tall: a pole, a post, a trunk) whose foot stops 1..MAXGAP px ABOVE the solid ground in its column - a post that was meant to stand and does not reach.
              (a rect whose foot is ABOVE the ground by more than MAXGAP is a hung / far-off thing and passes; one that ends in the ground passes)
     stand    a whole feature (a sign, a rack, a stake, a stone) whose lowest painted pixel stops 1..MAXGAP px above the ground it is standing over, and whose centre column has ground under it
   Sources (add a painted-art module here and it is checked): SOURCES below. Run: node tools/painted-anchors.mjs [level ...]   - exit 1 on any fault in a GATED level (GATE, empty = report only until
   the lists are clean; every fault is printed with the level, x in tiles, y and the gap in px). */
import { pathToFileURL } from 'node:url';
const rec = []; let cur = null;
const ctx = () => { const st = {}; return new Proxy(st, { get(t, k) { if (k === 'fillRect') return (x, y, w, h) => { if (cur && w > 0 && h > 0) cur.push({ x, y, w, h, col: t.fillStyle }); };
  if (k === 'drawImage') return (im, x, y, w, h) => { if (cur && typeof x === 'number') cur.push({ x, y, w: w || im.width || 0, h: h || im.height || 0, col: 'img', img: true }); };
  if (k in t) return t[k]; if (k === 'canvas') return {}; return (..._a) => ({ addColorStop() {} }); }, set(t, k, v) { t[k] = v; return true; } }); };
globalThis.document = { createElement: () => { const c = { width: 0, height: 0 }; c.getContext = () => ctx(); return c; } };
const { LEVELS, T } = await import('../src/level.js');
const KW = await import('../src/redraw/kingswood_areas.js');
export const TS = 16, MAXGAP = 24, GATE = [];
/* [level id, module label, features(L) -> [{x, w, draw(g)}]] */
export const SOURCES = [
  ['kings', 'redraw/kingswood_areas.js', L => KW.AREAS_FOR_LINT.flatMap(A => A.feats(L).map(f => ({ ...f, area: A.id })))],
];
const solid = t => t === T.SOLID || t === T.PORT || t === T.CRATE || t === T.PALISADE;
export function groundBelow(L, px, py) { const c = Math.floor(px / TS); if (c < 0 || c >= L.W) return null;
  for (let r = Math.max(0, Math.floor(py / TS)); r < L.H; r++) if (solid(L.grid[r * L.W + c]) && !solid(L.grid[(r - 1 + L.H) % L.H * L.W + c] ?? 0)) return r * TS; return null; }
export function paintedFaults(L, feats) {
  const out = [], g = ctx();
  for (const f of feats) { cur = []; try { f.draw(g, f.x); } catch (e) { out.push({ kind: 'error', x: f.x / TS, y: 0, why: String(e.message || e) }); cur = null; continue; } const rs = cur; cur = null; if (!rs.length) continue;
    let bot = -1e9, top = 1e9, x0 = 1e9, x1 = -1e9; for (const r of rs) { bot = Math.max(bot, r.y + r.h); top = Math.min(top, r.y); x0 = Math.min(x0, r.x); x1 = Math.max(x1, r.x + r.w); }
    /* poles */
    const seen = new Set();
    for (const r of rs) { if (r.img || (r.w > 9 && r.h < 40) || r.h < 24) continue; const foot = r.y + r.h, cx = r.x + r.w / 2, gy = groundBelow(L, cx, r.y + 1); if (gy === null) continue; const gap = gy - foot;
      if (gap >= 1 && gap <= MAXGAP) { const k = Math.round(cx) + ',' + Math.round(foot); if (!seen.has(k)) { seen.add(k); out.push({ kind: 'pole', x: Math.round(cx) / TS, y: Math.round(foot), gap, why: (f.area ? f.area + ' ' : '') + 'upright ' + r.w + 'x' + r.h + ' ends ' + gap + ' px above the ground' }); } } }
    /* whole feature stands */
    const cxm = (x0 + x1) / 2, gy = groundBelow(L, cxm, bot - 1); if (gy !== null) { const gap = gy - bot; if (gap >= 1 && gap <= MAXGAP && top > gy - 140 && x1 - x0 < 90 && !seen.size) out.push({ kind: 'stand', x: Math.round(cxm) / TS, y: Math.round(bot), gap, why: (f.area ? f.area + ' ' : '') + 'feature (' + Math.round(x1 - x0) + 'x' + Math.round(bot - top) + ') ends ' + gap + ' px above the ground' }); }
  }
  return out;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const only = process.argv.slice(2).filter(a => !a.startsWith('-')); let fails = 0, total = 0;
  for (const [id, label, get] of SOURCES) { if (only.length && !only.includes(id)) continue; const d = LEVELS.find(l => l.id === id); if (!d) continue; const L = d.build(); const f = paintedFaults(L, get(L)); total += f.length;
    console.log((GATE.includes(id) ? '* ' : '  ') + id.padEnd(12) + label.padEnd(30) + f.length + ' fault(s)'); for (const q of f) console.log('      ' + q.kind.padEnd(6) + ' @' + q.x.toFixed(1) + ',' + q.y + '  gap ' + (q.gap ?? '-') + ' px  ' + q.why); if (GATE.includes(id)) fails += f.length; }
  if (fails) { console.log('painted-anchors: ' + fails + ' fault(s) on a gated level'); process.exit(1); }
  console.log('ok  painted-anchors  ' + total + ' fault(s) listed, none on a gated level (GATE: ' + (GATE.join(', ') || 'none yet') + ')');
}
