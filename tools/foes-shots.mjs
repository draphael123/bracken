// tools/foes-shots.mjs - real-page stills of the SIX NEW FOES from the dev pen (claude/foes; not in the suite): each foe idle, and each attack's TELL (early + late) and RELEASE,
//   plus two captioned contact sheets (beasts-sheet.png, bones-sheet.png). One headless Chrome via tools/cdp.mjs; god-mode knight; foe isolated from the rest of the pen.
//   usage: PORT=<free port> node tools/foes-shots.mjs [outdir]   (default: ../scratch/foes-stills beside the worktrees)
import { openPage } from './cdp.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
const ROOT = fileURLToPath(new URL('..', import.meta.url)), OUT = process.argv[2] || join(ROOT, '..', 'scratch', 'foes-stills');
mkdirSync(OUT, { recursive: true });
const FOES = [['snowrunner', 'wolves', 'SNOWRUNNER', 4], ['greymane', 'wolves', 'GREYMANE', 5], ['bruin', 'bear', 'BRUIN', 6], ['skelsoldier', 'bones', 'SKELETON SOLDIER', 4], ['skelarcher', 'bones', 'SKELETON ARCHER', 7], ['skelmage', 'bones', 'SKELETON MAGE', 7]];
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null, PIN = process.env.PIN ? +process.env.PIN : 0;   /* ONLY=bruin,skelsoldier PIN=<tiles>: just those foes, the foe held that far off while he is idle (so a charge / rush is chosen, not a close attack) */
const pg = await openPage({ audio: false, fonts: false });
try {
  const r = await pg.evalp(`(async()=>{
    BK.manualSimulation = true; BK.setDev(true); BK.setHero('knight'); BK.reset({ fresh: true }); BK.state = 'play'; BK.god = true; BK.sim(4);
    const foes = () => typeof BK.enemies === 'function' ? BK.enemies() : BK.enemies;
    const BLOW = new Set(['snap','leap','bite','pounce','maul','charge','thrust','rush','shoot','volley','cast','grave']);
    const out = {}, rep = {};
    const snap = () => { BK.step(1); const k = BK.buf.width / BK.view.VW, [cx, cy] = BK.cam, e = window.__f, P = BK.P;
      const midx = Math.abs(P.x - e.x) < 150 ? (P.x + e.x) / 2 : e.x, w = 160, h = 90, sx = (midx - cx - w / 2) * k, sy = (e.y - e.h / 2 - cy - h / 2) * k;
      const c = document.createElement('canvas'); c.width = 960; c.height = 540; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#222'; g.fillRect(0, 0, 960, 540);
      g.drawImage(BK.buf, sx, sy, w * k, h * k, 0, 0, 960, 540); return c.toDataURL('image/png'); };
    for (const [t, pen, name, dist0] of ${JSON.stringify(FOES.filter(f => !ONLY || ONLY.includes(f[0])))}) { const dist = ${PIN} || dist0;
      const made = BK.pen(pen); if (!made) { rep[t] = 'pen failed'; continue; }
      for (const e of foes()) if (e.t !== t) e.alive = false;
      const e = foes().find(q => q.alive !== false && q.t === t); if (!e) { rep[t] = 'not spawned'; continue; } window.__f = e;
      for (const q of foes()) if (q !== e) q.alive = false;
      for (const x of foes()) if (x.t === t && x !== e) x.alive = false;
      e.x = BK.P.x + 26 * 16; if (e.st) e.st.x = e.x; BK.P.face = 1; for (let k = 0; k < 420; k++) { BK.P.hp = BK.P.maxHp; BK.sim(1); if (e.st) { e.st.cd = 99; } } e.x = BK.P.x + dist * 16; if (e.st) { e.st.x = e.x; e.st.cd = 0.5; } e.face = -1; if (e.st) e.st.face = -1;
      const R = { frames: [], modes: {}, seenTell: {}, seenRel: {}, hp: e.hp, sprite: !!(window.__SPR ? 1 : 1) }; const mine = [];
      BK.sim(1); mine.push(['idle', snap()]);
      let prev = '', t0 = 0, late = {}, early = {}, tellName = '';
      for (let i = 0; i < 60 * 70; i++) {
        BK.P.hp = BK.P.maxHp; if (${PIN} && (e.mode === "stand" || e.mode === "walk")) { e.x = BK.P.x + dist * 16; if (e.st) e.st.x = e.x; } BK.sim(1);
        if (e.alive === false || e.hp <= 0) { R.died = i; break; }
        const m = e.mode || ''; R.modes[m] = (R.modes[m] || 0) + 1;
        const isTell = /Tell$/.test(m);
        if (isTell && m !== prev) { tellName = m; t0 = e.st ? e.st.t : 0; early[m] = 0; late[m] = 0; if (!R.seenTell[m]) { R.seenTell[m] = 1; mine.push([m + '-early', snap()]); } }
        if (isTell && m === prev && !late[m] && e.st && t0 > 0 && e.st.t <= t0 * 0.35 && R.seenTell[m] === 1) { late[m] = 1; R.seenTell[m] = 2; mine.push([m + '-late', snap()]); }
        if (BLOW.has(m) && /Tell$/.test(prev)) { const rel = prev.replace(/Tell$/, ''); if (!R.seenRel[rel]) { R.seenRel[rel] = 1; mine.push([rel + '-release', snap()]); } }
        prev = m;
        if (Object.keys(R.seenRel).length >= 2 && i > 60) break;
      }
      R.shots = mine.map(s => s[0]); out[t] = mine; rep[t] = R; for (const q of foes()) q.alive = false;
    }
    return [out, rep]; })()`, 900000);
  const [shots, rep] = r; for (const [t, arr] of Object.entries(shots)) for (const [n, d] of arr) writeFileSync(join(OUT, t + '-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64'));
  writeFileSync(join(OUT, 'probe.json'), JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep));
  if (pg.errors.length) console.log('page errors: ' + pg.errors.slice(0, 5).join(' | '));
} finally { pg.close(); }
