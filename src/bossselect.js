import { actOf } from './foe-react.js';

export const bossKey = row => `${row.level}:${row.kind}`;
export const bossBeaten = (row, progress) => row.kind === 'mini' || row.kind === 'mini2'   /* (claude/forgemaster: a level's second mini - PROG.mini2) */
  ? !!progress[row.level]?.[row.kind]
  : !!(progress.bossDown?.[row.level] || progress[row.level]?.cleared);

// The playtest boss table is the source of every row. Keep undiscovered names out
// of the view model, including its accessible/test-facing data.
export function bossSelectRows(table, progress) {
  return table.map(row => {
    const beaten = bossBeaten(row, progress);
    const act = actOf(row.level);
    return { key: beaten ? bossKey(row) : null, act: act.act, actName: act.name, beaten,
      name: beaten ? row.name : '???', kind: beaten ? row.kind : 'locked',
      level: beaten ? row.level : null, source: row };
  }).sort((a, b) => a.act - b.act || a.source.li - b.source.li || (a.source.kind === 'mini' ? -1 : a.source.kind === 'mini2' ? (b.source.kind === 'mini' ? 1 : -1) : 1));
}

export function bossRecordNext(old, seconds, noHit) {
  if (!(Number.isFinite(seconds) && seconds > 0)) return old || null;
  return { best: old?.best > 0 ? Math.min(old.best, seconds) : seconds,
    noHit: !!(old?.noHit || noHit) };
}
