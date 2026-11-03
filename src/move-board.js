// src/move-board.js - THE MOVE BOARD (claude/arenayard, scratch/plan-arenayard-1103.md section 4). One board in the ARENA YARD that reads the hero standing at it:
// his loop (HERO_LOOP) and one line for every move his old trial taught (level.js trialSteps(hero), the table the trials are built from), then the two skills
// he has equipped. No per-class build: a new step in trialSteps is a new line here. The first part is PURE (boardLines / boardPages, tested by tools/arena-yard.mjs);
// drawBoard takes the game's own panel / text / wrap helpers so it never imports main.js.
export const BOARD = { rows: 11, w: 288 };

/* "THE SWING. X STRIKES. HIT THE STRAW MAN THREE TIMES." -> "THE SWING: X STRIKES"; "THE THIRD CUT: X THREE TIMES IN A RUN. THE THIRD..." -> "THE THIRD CUT: X THREE TIMES IN A RUN".
   The text is cut at the first ':' or '.' for the name, and the first clause after it is the move (the counting and the coaching are left in the trial). */
export function stepLine(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  const m = /^([^:.]+?)\s*[:.]\s*([^.:]*)/.exec(t);
  if (!m) return t;
  const name = m[1].trim(), rest = m[2].trim();
  return rest ? name + ': ' + rest : name;
}
/* the board's content for a hero: { title, loop, lines: [{ text, pad }], skills } */
export function boardLines(hero, { steps = [], loop = '', skills = [], name = '', pad = false } = {}) {
  const lines = [], seen = new Set();
  for (const s of steps) {
    const text = stepLine(s[2]); if (!text || seen.has(text)) continue; seen.add(text);
    lines.push({ text, pad: pad && s[4] ? String(s[4]) : '', kind: s[0] });
  }
  const sk = (skills || []).filter(Boolean);
  return { hero, title: (name || String(hero).toUpperCase()) + ' - YOUR MOVES', loop: String(loop || ''), lines, skills: sk,
    skillLine: sk.length ? 'F: ' + sk[0] + (sk[1] ? '   G: ' + sk[1] : '') : '' };
}
/* pages of wrapped rows. wrapFn(text, width) -> string[] (the game's wrap at size 6); rows = how many rows a page holds. A line never splits across pages. */
export function boardPages(b, wrapFn, width, rows = BOARD.rows) {
  const items = b.lines.map(l => { const r = wrapFn('- ' + l.text, width); if (l.pad) r.push(...wrapFn('  PAD: ' + l.pad, width).map(x => '\u0001' + x)); return r; });
  if (b.skillLine) items.push(wrapFn(b.skillLine, width).map(x => '\u0002' + x));
  const pages = []; let cur = [];
  for (const it of items) { if (cur.length && cur.length + it.length > rows) { pages.push(cur); cur = []; } cur.push(...it); }
  if (cur.length || !pages.length) pages.push(cur);
  return pages;
}
/* draw one page. o = { b, page, pages, VW, VH, panel, text, fitText, wrap, UI, who } where who is the hero's short name */
export function drawBoard(o) {
  const { b, pages, VW, VH, panel, text, wrap, UI } = o, page = Math.max(0, Math.min(pages.length - 1, o.page | 0));
  const x = 14, y = 16, w = VW - 28, h = VH - 22;   /* under the clock and the bars */ panel(x, y, w, h, UI.border, 'wood');
  text(o.fitText(b.title, w - 16, 8), VW / 2, y + 5, UI.title, 'center', 8);
  const lp = wrap(b.loop, w - 20, 6); lp.forEach((ln, i) => text(ln, VW / 2, y + 17 + i * 8, UI.dim, 'center', 6));
  let yy = y + 19 + lp.length * 8 + 3;
  for (const r of pages[page]) {
    const pad = r[0] === '\u0001', sk = r[0] === '\u0002', s = pad || sk ? r.slice(1) : r;
    text(s, x + 10, yy, sk ? UI.gold : pad ? UI.dim : UI.text, 'left', 6); yy += 8;
  }
  text(pages.length > 1 ? 'LEFT / RIGHT: PAGE ' + (page + 1) + ' OF ' + pages.length + '    UP: CLOSE' : 'UP: CLOSE', VW / 2, y + h - 10, UI.dim, 'center', 6);
}
