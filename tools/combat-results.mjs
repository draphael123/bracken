// Boss openings are counts, not wins. Ambush opened is a completion flag.
export const completed = (kind, row) => kind === 'ambush' ? row.opened === true : row.killed === true;
export function summarize(kind, rows, limits) {
  return {
    samples: rows.length,
    completed: rows.filter(r => completed(kind, r)).length,
    inTarget: kind === 'strategy'
      ? rows.filter(r => r.style === 'mixed' && r.killed && (r.damage?.plunge || 0) < (r.damage?.other || 0)).length
      : rows.filter(r => completed(kind, r) && r.secs >= limits[0] && r.secs <= limits[1]).length,
  };
}
