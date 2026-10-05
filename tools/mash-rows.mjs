/* tools/mash-rows.mjs - the row bookkeeping of docs/mash-bot.json (claude/mashmachines, 2026-10-02/03). Pure, no browser.
   carryRows: the row-dropping bug. `mash-bot.mjs <id> --level <id> --write` opened the id's entry as { hash } whenever the level hash had changed,
   and so DROPPED its boss and mini rows (three lanes hit it in one day). A level-only write now CARRIES the boss / mini rows through (marked
   `carried: { from, parts }`, and said out loud); a boss-only write after a level change drops the stale LEVEL row loudly (the gate then says
   "level mode not run", which is the honest answer: the level run measured other data).
   heroReport: the per-hero level verdicts, and the levels whose verdict CHANGES between the knight-only stamp and judging every hero.
     node tools/mash-bot.mjs --report            (no browser) */
export function carryRows(old, hash, modes, say = () => {}) {
  if (!old) return { hash };
  if (old.hash === hash) return old;
  const fresh = { hash }, kept = [], lost = [];
  for (const key of ['boss', 'mini', 'level']) {
    if (!old[key]) continue;
    const mine = key === 'level' ? modes.level : modes.boss;   /* this run re-measures it: nothing to carry */
    if (mine) continue;
    if (key === 'level') { lost.push(key); continue; }         /* a level run of the OLD data must not pass the new data */
    fresh[key] = old[key]; kept.push(key);
  }
  if (kept.length) { fresh.carried = { from: old.hash, parts: kept }; say('level hash changed: carried the ' + kept.join(' + ') + ' row(s) of the old hash (re-run the boss to refresh them: node tools/mash-bot.mjs <id> --write)'); }
  if (lost.length) say('level hash changed: the old LEVEL row is dropped (it measured other data); re-run: node tools/mash-bot.mjs <id> --level <id> --write');
  return fresh;
}

export const STARTERS = ['knight', 'warden', 'pyro'];
/* HELD IS NOT CLEARED (claude/combat2, 2026-10-05). A lift that does not land - the hero is shut in an AMBUSH ROOM or a locked hall the mash bot
   cannot finish (a guarding pike captain who never comes to him, a foe that cannot reach him), so the room's walls put him straight back - is the
   bot STUCK, not the bot through: the Stormhold pyro sat at the ambush wall for three quarters of the run, took no more blows, and 'cleared' the
   level at 41%. A run with MASH_HELD or more such lifts never got past that room: it did not clear the level. */
export const MASH_HELD = 3;
export const clearsAt = (r, hp) => !!r && r.deaths === 0 && r.minHpPct >= hp && !((r.held || 0) >= MASH_HELD);
/* one level row's verdict over the heroes named: cleared = some hero in the set got through without a death and above `hp` percent health */
export function levelClears(levelRow, heroes, hp) {
  const rows = heroes.filter(h => levelRow && levelRow[h]).map(h => [h, levelRow[h]]);
  if (!rows.length) return null;
  const best = rows.sort((a, b) => (a[1].deaths - b[1].deaths) || (b[1].minHpPct - a[1].minHpPct))[0];
  return { cleared: rows.some(([, r]) => clearsAt(r, hp)), by: rows.filter(([, r]) => clearsAt(r, hp)).map(([h]) => h), best: best[0], heroes: rows.map(([h]) => h) };
}
export function heroReport(cache, hp) {
  const lines = [], changes = [], partial = [];
  for (const [id, e] of Object.entries(cache)) {
    if (!e.level) continue;
    const per = STARTERS.filter(h => e.level[h]).map(h => { const r = e.level[h]; return h + ' ' + r.minHpPct + '%/' + r.deaths + 'd' + ((r.held || 0) >= MASH_HELD ? '/held' : ''); });
    const all = levelClears(e.level, STARTERS, hp), knight = levelClears(e.level, ['knight'], hp);
    if (all && all.heroes.length < STARTERS.length) partial.push(id);
    const flip = knight && all && knight.cleared !== all.cleared;
    lines.push(id.padEnd(14) + per.join('  ').padEnd(52) + (all ? (all.cleared ? 'MASHABLE by ' + all.by.join(',') : 'holds') : '') + (flip ? '   <- VERDICT CHANGES (knight-only stamp said ' + (knight.cleared ? 'mashable' : 'holds') + ')' : ''));
    if (flip) changes.push(id);
  }
  return { lines, changes, partial };
}
