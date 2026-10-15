// tools/ksarfoes-shots.mjs - THE FALCONER and THE PLATED BANDIT in the real page (claude/ksarfoes; not in the suite): a live probe + pictures.
//   Walks a god-mode knight up to the souq falconer and lets the fight run (does he SEND, does the hawk STOOP, does he CALL it home, is a blow GUARDED); then the road's
//   sleeping plated man: a blade (THROW A BOMB, x0.25), then a keg's blast (the plate off, the bare skin). Pictures of each pose.
//   usage: PORT=8916 node tools/ksarfoes-shots.mjs [tag]   -> work/claude/ksarfoes/<tag>/*.png + a JSON line of what happened
import { openPage, ROOT } from './cdp.mjs';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
const tag = process.argv[2] || 'probe', out = join(ROOT, 'work/claude/ksarfoes', tag); mkdirSync(out, { recursive: true });
const pg = await openPage({ audio: true });
try {
  const r = await pg.evalp(`(async()=>{ const { LEVELS } = await import('/src/level.js'); const res = [], rep = {};
    BK.manualSimulation = true; BK.SET.hud = 'minimal'; BK.setHero('knight'); BK.reset({ fresh: true });
    const fi = LEVELS.findIndex(l => l.id === 'ksar'); BK.load(fi); BK.state = 'play'; BK.god = true; BK.sim(4);
    const foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies;
    const snap = name => { const c = document.createElement('canvas'); c.width = BK.view.VW * 2; c.height = BK.view.VH * 2; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(BK.buf, 0, 0, c.width, c.height); res.push([name, c.toDataURL('image/png')]); };
    /* THE FALCONER at the souq */
    const fal = foes().find(e => e.cnSkin === 'falconer' && e.x < 300 * 16); rep.falconer = !!fal; if (!fal) return [res, rep];
    BK.tp(Math.round(fal.x / 16) + 8, 33); const seen = { send: 0, sendGo: 0, call: 0, dive: 0, glove: 0, guard: 0, frames: {} }; const K = BK.ksar();
    for (let i = 0; i < 60 * 14; i++) { BK.P.hp = BK.P.maxHp; BK.sim(1); const F = fal.ksF, k = fal.ksHawk; if (!F) continue; if (F.st === 'send') seen.send++; if (F.st === 'sendGo') seen.sendGo++; if (F.st === 'call') seen.call++;
      if (k && k.st && k.st.mode === 'dive') seen.dive++; if (k && k.st && k.st.mode === 'glove') seen.glove++; seen.frames[fal.st.frame] = 1;
      if (F.st === 'send' && !seen.shotSend) { seen.shotSend = 1; BK.step(1); snap('falconer-send-windup'); } if (F.st === 'sendGo' && !seen.shotGo) { seen.shotGo = 1; BK.step(1); snap('falconer-send-release'); }
      if (F.st === 'call' && !seen.shotCall) { seen.shotCall = 1; BK.step(1); snap('falconer-call'); } if (k && k.st && k.st.mode === 'glove' && !seen.shotGlove) { seen.shotGlove = 1; BK.step(1); snap('falconer-glove'); }
      if (k && k.st && k.st.mode === 'diveTell' && !seen.shotDive) { seen.shotDive = 1; BK.step(1); snap('falconer-hawk-stoop-tell'); } }
    rep.falconerSeen = seen; rep.n = { ...K.n };
    /* a blow on him while guarded, then his hawk down */
    const k = fal.ksHawk; if (k && k.st) { k.st.mode = 'patrol'; k.x = fal.x; k.y = fal.y - 60; } const hp0 = fal.hp; BK.combat2().strike(fal, 'light', 1); rep.guardedBlow = hp0 - fal.hp; BK.step(1); snap('falconer-guarded');
    if (k) { k.hp = 1; BK.combat2().strike(k, 'light', 1); } for (let i = 0; i < 10; i++) BK.sim(1); rep.openAfterHawk = fal.ksF && +fal.ksF.open.toFixed(2); BK.step(1); snap('falconer-open');
    const hp1 = fal.hp; BK.combat2().strike(fal, 'light', 1); rep.openBlow = hp1 - fal.hp;
    /* THE PLATED MAN on the road */
    const pm = foes().find(e => e.cnSkin === 'ksarplate' && e.x < 100 * 16); rep.plated = !!pm; if (!pm) return [res, rep];
    BK.tp(Math.round(pm.x / 16) - 3, 33); BK.sim(30); BK.step(1); snap('plated-asleep');
    const p0 = pm.hp; BK.combat2().strike(pm, 'light', 1); rep.plateBlow = p0 - pm.hp; for (let i = 0; i < 20; i++) BK.sim(1); BK.step(1); snap('plated-clank');
    const H = BK.ksarHands(); K.setKegs.push({ id: 'probeKeg', x: Math.round(pm.x / 16), y: Math.round(pm.y / 16) - 1, st: 'lit', t: 0.05 }); BK.tp(Math.round(pm.x / 16) - 8, 33); const p1 = pm.hp; for (let i = 0; i < 8; i++) BK.sim(1);
    rep.blast = p1 - pm.hp; rep.stripped = !pm.ksPlate; rep.skinNow = pm.skinNow; BK.tp(Math.round(pm.x / 16) - 3, 33); for (let i = 0; i < 6; i++) BK.sim(1); BK.step(1); snap('plated-stripped');
    const p2 = pm.hp; BK.combat2().strike(pm, 'light', 1); rep.bareBlow = p2 - pm.hp;
    return [res, rep]; })()`, 400000);
  const [shots, rep] = r; for (const [name, d] of shots) writeFileSync(join(out, name + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  console.log(JSON.stringify(rep)); writeFileSync(join(out, 'probe.json'), JSON.stringify(rep, null, 1));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 3).join(' | '));
} finally { pg.close(); }
