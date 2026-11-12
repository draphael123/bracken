/* tools/bc5-walk.mjs - BC5 WALK (claude/bc5-l, 11-12): THE GLASSBLOWER mini end to end in the real page (flag forced on by BRACKEN_BC5=1 -> tools/cdp.mjs).
   Drops the hero off the kiln, lets a plan-ish driver (go to the glinting glass and strike it, cut him while buried, else wait) fight him, and reports the beats:
   intro / glint / opens / portcullis (gate cells) / PROG after a reload. NOT a rate (one run, god optional): node tools/bc5-walk.mjs [--god] [--hero=knight] [--shots=dir] */
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'node:fs';
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const hero = opt('hero', 'knight'), god = args.includes('--god'), shots = opt('shots', '');
if (shots) mkdirSync(shots, { recursive: true });
const pg = await openPage();
try {
  const r = await pg.evalp(`(async()=>{ BK.manualSimulation = true; BK.setHero(${JSON.stringify(hero)}); BK.reset({ fresh: true });
    const { LEVELS, T } = await import('/src/level.js'), { makeBot } = await import('/src/playtest.js');
    BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.god = ${god}; BK.reset(); BK.sim(60);
    const M = BK.L.mini, GL = { gb: 396 * 16 + 8, gb2: 401 * 16 + 8 }, gateCol = M.gate, log = [], shot = [];
    const gateCells = () => { let n = 0; for (let y = 24; y < 34; y++) { const t = BK.L.grid[y * BK.L.W + gateCol]; if (t !== T.AIR) n++; } return n; };
    BK.tp(386, 8); BK.sim(240); log.push('after kiln drop: ' + Math.round(BK.P.x / 16) + ',' + Math.round(BK.P.y / 16) + ' mini=' + !!BK.miniActive + ' gateCells=' + gateCells());
    const bot = makeBot(BK); let seenIntro = false, maxOpens = 0, f = 0, last = '', won = false, dmgFrames = 0;
    const snap = tag => { BK.step(1); const c = document.createElement('canvas'); c.width = 640; c.height = 360; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, 640, 360); shot.push([tag, c.toDataURL('image/png')]); };
    for (; f < (${args.includes('--shotsonly')} ? 1300 : 9000); f++) {
      const rd = BK.bc5(), en = BK.enemies().find(e => e.t === 'glassblower');
      if (BK.state === 'talk' || BK.state === 'card') BK.press('confirm');
      if (!en || !en.alive) { won = true; break; }
      if (${args.includes('--quick')} && en.hp > 30) en.hp = 30;
      const mode = en.mode, g = rd && rd.gb; const tag = mode + (g ? ' g' + g.glint + ' ph' + g.ph : '');
      if (mode !== last) { log.push('f' + f + ' ' + mode + ' hp' + Math.round(en.hp) + '/' + Math.round(en.maxHp) + ' me' + Math.round(BK.P.hp) + (g ? ' glint=' + g.glint : '')); last = mode; if (['wake', 'buried', 'blastTell', 'gobTell'].includes(mode) && shot.length < 6) snap(mode); }
      if (${args.includes('--trace')} && f % 40 === 0 && f > 900 && f < 2500) log.push('  t' + f + ' P ' + Math.round(BK.P.x) + ',' + Math.round(BK.P.y) + ' g' + (BK.P.ground ? 1 : 0) + ' atk' + BK.P.atk + ' en ' + Math.round(en.x) + ',' + Math.round(en.y) + ' ' + mode + ' hp' + Math.round(en.hp));
      if (g && g.glint && GL[g.glint] && mode !== 'buried') { bot(GL[g.glint]); if (Math.abs(BK.P.x - GL[g.glint]) < 14 && f % 20 === 0) BK.press('atk'); }
      else if (mode === 'buried') { bot(en.x + 26); if (Math.abs(BK.P.x - en.x) < 40 && Math.abs(BK.P.y - en.y) < 30) { BK.P.face = Math.sign(en.x - BK.P.x) || 1; if (f % 6 === 0) BK.press('atk'); } }
      else { bot(en.x - 60); if (Math.abs(BK.P.x - en.x) < 34 && f % 12 === 0) BK.press('atk'); }
      BK.sim(1); if (BK.P.dead || BK.state === 'dead') { log.push('f' + f + ' DEAD'); break; }
    }
    if (won) { log.push('PROG at win ' + JSON.stringify(BK.PROG.buriedcity)); log.push('won at f' + f + ' hpMe=' + Math.round(BK.P.hp) + ' reads ' + JSON.stringify(BK.bc5())); BK.sim(240); log.push('gateCells after win=' + gateCells() + ' mini=' + !!BK.miniActive); BK.tp(409, 32); BK.sim(60); log.push('through the gate at ' + Math.round(BK.P.x / 16) + ',' + Math.round(BK.P.y / 16)); }
    if (won) { BK.load(LEVELS.findIndex(l => l.id === 'buriedcity')); BK.state = 'play'; BK.start(); BK.sim(120); log.push('gb after reload ' + JSON.stringify(BK.enemies().filter(e => e.t === 'glassblower').map(e => [Math.round(e.x), Math.round(e.y), e.alive, e.mode, Math.round(e.hp), e.dead, e.hide]))); log.push('PROG.buriedcity=' + JSON.stringify(BK.PROG.buriedcity) + ' after reload: glassblowers alive=' + BK.enemies().filter(e => e.t === 'glassblower' && e.alive).length + ' gateCells=' + gateCells() + ' mini=' + !!BK.miniActive); }
    return { log, shot, f, won }; })()`);
  console.log(r.log.join('\n')); console.log('frames', r.f, 'won', r.won);
  if (shots) for (const [t, d] of r.shot) writeFileSync(shots + '/walk-gb-' + t + '.png', Buffer.from(d.split(',')[1], 'base64'));
} finally { pg.close(); }
