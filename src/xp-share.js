// src/xp-share.js - CO-OP XP SHARE (claude/coopai, Daniel 11-04 '!! 17:07': kill and boss XP in FULL to every hero that DAMAGED the foe).
// The pure half: who is paid when a placed foe falls. main.js hurtEnemy records each blow's pass on the foe (e.hitBy), xpKill pays every payee in HIS pass
// (asPlayer), so each hero earns for HIS OWN hero in HIS OWN save (a seat on his save: his XP; online guest: his own page gets it through the credit).
//   payee   a body on his own save (b.prof) is paid into it; every other body (the default AI, a lent/guest hero with no save) is paid to PLAYER ONE instead,
//           so an AI partner that takes the kill never costs him the XP. One payee once, however many bodies fold into him.
//   killer  the pass of the killing blow counts as a hitter even if it never recorded one (a DoT or a bomb lands a kill inside its owner's pass).
export function hitRecord(e, p) { if (!e || !p) return; const a = e.hitBy || (e.hitBy = []); if (!a.includes(p)) a.push(p); }
export function payeesOf(e, killer, players) {
  if (!players || !players.length) return [];
  const out = [], add = b => { if (!b) return; const t = b.prof ? b : players[0]; if (!out.includes(t)) out.push(t); };
  const hs = (e && e.hitBy) || [];
  for (const b of hs) if (players.includes(b)) add(b);
  if (killer && players.includes(killer)) add(killer);
  if (!out.length) out.push(players[0]);
  return out;
}
