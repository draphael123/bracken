// src/draft/_kit.js — the plumbing every level draft shares, so each draft file is about its level and not about parsing:
//   pieces(`#section @mark Fx6 U D R1 L1 R2 L2 QS`) -> the token list
//   ground(T, tokens, { H, base, lvl, W? }) -> { W, H, grid, set, rock, top, on, cols, marks, sections, qs }
//     F flat · U/D a full step up/down · R1/L1 steep slope up/down · R2/L2 gentle pair · QS a quicksand column (a one-row pit, zone on top)
//   garrison(G, ents, roster, { from, to, per, firstPer, busyTypes, spot }) -> places ~per foes a 24-column screen from each section's roster
// (the three drafts written before this kit keep their own copies; new drafts use this.)
import { SLOPE } from '../slopes.js';
export const TS = 16;
export const pieces = s => s.trim().split(/\s+/).flatMap(t => { const m = t.match(/^([A-Z0-9]+)x(\d+)$/); return m ? Array(+m[2]).fill(m[1]) : [t]; });
export function ground(T, tokens, { H, base, lvl = 0, extraW = 2 }) {
  const cols = [], marks = {}, sections = {};
  for (const p of tokens) {
    if (p[0] === '#') { sections[p.slice(1)] = cols.length; continue; } if (p[0] === '@') { marks[p.slice(1)] = cols.length; continue; }
    if (p === 'F') cols.push({ lvl, t: 'F' }); else if (p === 'QS') cols.push({ lvl, t: 'QS' });
    else if (p === 'U') { lvl++; cols.push({ lvl, t: 'F' }); } else if (p === 'D') { lvl--; cols.push({ lvl, t: 'F' }); }
    else if (p === 'R1') { lvl++; cols.push({ lvl, t: SLOPE.R1 }); } else if (p === 'L1') { cols.push({ lvl, t: SLOPE.L1 }); lvl--; }
    else if (p === 'R2') { lvl++; cols.push({ lvl, t: SLOPE.R2A }, { lvl, t: SLOPE.R2B }); } else if (p === 'L2') { cols.push({ lvl, t: SLOPE.L2B }, { lvl, t: SLOPE.L2A }); lvl--; }
    else throw new Error('draft piece ' + p);
  }
  const W = cols.length + extraW, grid = new Uint8Array(W * H), qs = [];
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < W && y < H) grid[y * W + x] = v; };
  const rock = (x, y0, y1 = H - 1) => { for (let y = y0; y <= y1; y++) set(x, y, T.SOLID); };
  const top = x => base - cols[Math.max(0, Math.min(cols.length - 1, x))].lvl, on = x => top(x) - 1;
  cols.forEach((c, x) => { const r = base - c.lvl;
    if (c.t === 'F') rock(x, r);
    else if (c.t === 'QS') { rock(x, r + 1); const last = qs[qs.length - 1]; if (last && last.x1 === x * TS && last.y === r * TS) last.x1 = (x + 1) * TS; else qs.push({ x0: x * TS, x1: (x + 1) * TS, y: r * TS }); }
    else { set(x, r, c.t); rock(x, r + 1); } });
  for (let y = 0; y < H; y++) { set(W - 2, y, T.SOLID); set(W - 1, y, T.SOLID); }
  return { W, H, grid, set, rock, top, on, cols, marks, sections, qs, at: (x, y) => (x < 0 || x >= W) ? T.SOLID : (y < 0 || y >= H) ? T.AIR : grid[y * W + x] };
}
/* a draft's GARRISON row, placed so it can be measured: for each 24-column screen from `from` to `to`, `per` foes (firstPer in the first
   section) on firm footing with three rows of air over it, never on a busy column (checkpoints, signs, pickups...). spot(x) may return
   the row to stand on (for rooms under the ground line); flyers stand `fly` rows up. */
export function garrison(G, T, ents, roster, { from = 0, to, per = 4, firstPer = 3, busyTypes = ['check', 'sign', 'relic', 'silver', 'stray', 'shop', 'well'], spot, flyers = [], fly = 6 } = {}) {
  const secs = Object.entries(G.sections).filter(([k]) => k !== 'arena').sort((a, b) => a[1] - b[1]);
  const secOf = x => { let s = secs[0][0]; for (const [k, v] of secs) if (x >= v) s = k; return s; };
  const busy = new Set(ents.filter(e => busyTypes.includes(e.t)).map(e => e.x));
  const stand = x => { if (spot) return spot(x); const c = G.cols[x]; if (!c || c.t === 'QS') return null; const y = G.on(x); for (let yy = y - 2; yy <= y; yy++) if (G.at(x, yy) !== T.AIR) return null; return y; };
  let k = 0;
  for (let w0 = from; w0 + 24 <= to; w0 += 24) { const sec = secOf(w0), n = sec === secs[0][0] ? firstPer : per, list = roster[sec] || roster.default;
    for (let i = 0; i < n; i++) { let x = w0 + 3 + Math.floor(i * 20 / n), y = null;
      while (x < w0 + 23 && ((y = stand(x)) === null || [-1, 0, 1].some(d => busy.has(x + d)))) x++;
      if (x >= w0 + 23 || y === null) continue; const t = list[k++ % list.length]; ents.push({ t, x, y: flyers.includes(t) ? y - fly : y }); busy.add(x); } }
}
