/* tools/coop-boss-rates.mjs - CO-OP BOSS RATES (claude/coopbalance; a measuring tool, not a check).
   The boss lab's human bot plays seat one (tools/boss-run.mjs fightJs: campaign level, flask kit, profile human) and the party's other seats are the co-op
   AI hands (main.js allyTick - the lab's duel hands) standing in for PEOPLE: COOP.aiAsHuman counts them as people for the scale (the party is x2/x2.6/x3.2
   health and the per-hero blow table), and every seat carries its own flasks. --ai leaves them counted as AIs (the lighter scale) = an AI party.
   WIN = the boss down with no wipe (nobody sent back to the shrine); a hero DOWN and lifted is not a loss.
     PORT=8789 node tools/coop-boss-rates.mjs <level>[,<level>..] [--heroes=knight,warden,pyro] [--partners=a,b,c  (default: knight+warden, warden+knight, pyro+paladin; a third seat knight+warden+pyro, warden+knight+pyro, pyro+paladin+knight)] [--seats=2|3|4 | --seats=1,2,3]
        [--seeds=6] [--secs=240] [--ai] [--dmg=1.35] [--hp=2] [--out=file.json]
   seats 1 is the solo control (the plain tools/boss-run.mjs fight). The partner for lead hero h at seat k is the k-th of --partners that is not h. */
import { writeFileSync } from 'node:fs';
import { fightJs, openRetry, diffJs, won } from './boss-run.mjs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const levels = args.filter(a => !a.startsWith('-')).flatMap(a => a.split(',')), heroes = opt('heroes', 'knight,warden,pyro').split(','), PAIRS = { knight: ['warden', 'pyro', 'paladin'], warden: ['knight', 'pyro', 'paladin'], pyro: ['paladin', 'knight', 'warden'] }, partners = opt('partners', '').split(',').filter(Boolean);
const seatsL = opt('seats', '2').split(',').map(Number), seeds = +opt('seeds', 6), secs = +opt('secs', 240), AI = args.includes('--ai'), OUT = opt('out', ''), DMG = opt('dmg', ''), HP = opt('hp', ''), PROFILE = opt('profile', 'human');
const partnerOf = (h, k) => (partners.length ? partners.filter(p => p !== h) : PAIRS[h] || ['warden', 'knight', 'pyro'])[k];
function coopJs(F, seats) {
  const { lvl, js } = fightJs({ r: F.r, way: 'practiced', h: F.h, s: F.s, profile: PROFILE, flasks: 'kit' }, secs);
  if (seats <= 1) return { lvl, js };
  const ph = [];
  for (let k = 0; k < seats - 1; k++) ph.push(partnerOf(F.h, k));
  const pre = `BK.coopEnd();{const C=BK.aiComp.AIC.COOP;C.aiAsHuman=${AI ? 'false' : 'true'};${HP ? `C.hp[${seats}]=${HP};` : ''}${DMG ? `C.dmg[${seats}]=${DMG};` : ''}}BK.aiComp.arm(${JSON.stringify(ph)},'balanced',${seats - 1});
    const tp0=BK.tp;BK.tp=function(x,y){const r=tp0.call(BK,x,y);if(!window.__cbFl0)window.__cbFl0=BK.players().map(q=>q.flasks|0);BK.players().forEach((q,i)=>{if(q.ai){q.x=BK.P.x-14*i;q.y=BK.P.y;q.vx=q.vy=0;q.down=0;q.hp=q.maxHp;}});return r;};
    window.__cbFl0=null;const wipes0=BK.stats().deaths;let r,seatsN,wipes,party,mul,take;try{`;
  const anchor = 'const r=(await BK.bossLab(', endA = '})).rows[0]||{};';
  if (!js.includes(anchor) || !js.includes(endA)) throw new Error('fightJs shape changed');
  const post = `seatsN=BK.players().length;wipes=BK.stats().deaths-wipes0;party=BK.players().map(q=>({h:q.hero,ai:!!q.ai,dmg:Math.round(q.score.dmg),kills:q.score.kills,rev:q.score.revives,dn:q.score.deaths,fl:q.flasks|0,hp:q.maxHp}));mul=BK.aiComp.mul();take=BK.aiComp.take();}finally{BK.tp=tp0;BK.aiComp.AIC.COOP.aiAsHuman=false;}`;
  let j = js.replace(anchor, () => pre + 'r=(await BK.bossLab(').replace(endA, () => '})).rows[0]||{};' + post);
  j = j.replace('return {stk:', () => 'return {fl0:window.__cbFl0,seatsN,wipes,party,mul,take,stk:').replace('outcome:r.outcome||r.skipped', () => "outcome:(wipes>0&&(r.outcome==='win'||r.outcome==='trade'))?'wipe':(r.outcome||r.skipped)");
  return { lvl, js: j };
}
const rows = [], t0 = Date.now();
for (const id of levels) for (const seats of seatsL) for (const h of heroes) for (let s = 1; s <= seeds; s++) {
  let pg, row; const F = { r: id, h, s };
  try { const { lvl, js } = coopJs(F, seats); pg = await openRetry(); await pg.evalp(diffJs()); row = { lvl, ...(await pg.evalp(js, 1200000)) }; }
  catch (e) { row = { err: String(e.message).slice(0, 160) }; }
  finally { if (pg) await pg.close(); }
  const rec = { row: id, hero: h, seats, seed: s, ai: AI, ...row }; rows.push(rec);
  console.log(id + ' ' + h + '+' + seats + (AI ? 'ai' : '') + ' s' + s + ' L' + rec.lvl + ': ' + (rec.err ? 'ERR ' + rec.err : rec.outcome + ' ' + rec.secs + 's left ' + rec.bossLeft + '% taken ' + rec.taken + ' wipes ' + rec.wipes + ' mul ' + rec.mul + '/' + rec.take + ' fl0 ' + JSON.stringify(rec.fl0) + ' party ' + JSON.stringify((rec.party || []).map(q => q.h.slice(0, 2) + ':' + q.dmg + '/' + q.fl))));
  if (OUT) writeFileSync(OUT, JSON.stringify(rows));
}
const key = r => r.row + ' ' + r.hero + ' ' + r.seats + (r.ai ? 'ai' : ''), by = new Map();
for (const r of rows) { if (r.err) continue; const k = key(r), B = by.get(k) || { w: 0, n: 0 }; B.n++; if (r.outcome === 'win' || r.outcome === 'trade') B.w++; by.set(k, B); }
console.log('\nCOOP RATES  profile ' + PROFILE + (AI ? '  AI-counted' : '  bots as people') + '  (' + rows.length + ' fights, ' + Math.round((Date.now() - t0) / 60000) + ' min)');
for (const [k, B] of by) console.log(k.padEnd(28) + B.w + '/' + B.n + ' = ' + Math.round(100 * B.w / B.n) + '%');
process.exit(0);
