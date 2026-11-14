// PAGE TOOL: launches headless Chrome
import { openPage } from './cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try { const d = await pg.evalp(`(async () => { const { LEVELS } = await import('/src/level.js'); const out = [];
  BK.PROG.xp = Object.assign(BK.PROG.xp || {}, { knight: 1e6 }); BK.setHero('knight'); BK.load(LEVELS.findIndex(l => l.id === 'crown')); BK.start(); BK.god = true; BK.sim(30);
  const hold = () => { if (BK.state === 'card') BK.cardClose(); BK.P.hp = BK.P.maxHp; BK.P.inv = 0.5; };
  const run = n => { for (let i = 0; i < n; i++) { hold(); BK.step(1); } };
  run(60); const A = BK.L.arena; BK.tp(Math.round(A.trigger / 16) + 1, Math.round(A.floor / 16) - 1); run(300);
  const e = BK.boss; e.hp = 1; BKT.hurtEnemy(e, 50, e.x - 10, false); run(120); const H = BK.gqHands(), E = BK.L.gqEscape; BK.tp(E.portal.x, E.portal.y); run(60); out.push(["skip", H.skipRoof()]); run(150); BK.tp(812, 19); run(30);
  const b = BK.boss; out.push(['start', b.stage, b.mode, b.hp, b.maxHp, Math.round(b.x), Math.round(b.y), Math.round(BK.P.x), Math.round(BK.P.y), b.hidden, b.alpha]);
  for (let k = 0; k < 20; k++) { run(30); const q = BK.boss; out.push([k, q.mode, Math.round(q.hp), Math.round(q.x), Math.round(q.y), Math.round(BK.P.x), Math.round(BK.P.y), q.hidden, q.alpha]); }
  const h0 = BK.boss.hp; BK.P.x = BK.boss.x - 20; BK.P.y = BK.boss.y; BKT.hurtEnemy(BK.boss, 40, BK.P.x, false); out.push(['direct hit', h0, BK.boss.hp, BK.boss.mode]);
  return out; })()`, 120000); console.log(d.map(r => JSON.stringify(r)).join('\n')); console.log(pg.errors.slice(0, 3)); } finally { await pg.close(); }
