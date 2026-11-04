// tools/nestbugs-sheet.mjs - THE NEST BUGS, before (rows A) and after (rows B) at 6x (claude/nestbugs). OUT=<png>  OLD=1 reads the pre-pass copies src/redraw/prior_*_set.js (untracked, scratch only).
//   env ONLY=combdrone,nestguard,stinger,honey  Z=6
import { openPage, ROOT } from './cdp.mjs';
import { writeFileSync } from 'fs';
const out = process.env.OUT || (ROOT + 'scratch-nestbugs-sheet.png');
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(async () => {
    const imp = async u => { for (let i = 0; i < 4; i++) { try { await fetch(u); return await import(u); } catch (e) { if (i === 3) throw e; } } }; const PX = await imp('/src/px.js'); const NEW = await imp('/src/redraw/hornets_nest_art.js'), OLD = await imp('/src/redraw/prior_nest_set.js');
    const HN = await imp('/src/redraw/honey_hornet_art.js'), HO = await imp('/src/redraw/prior_honey_set.js');
    const SPR = { wasp: { ax: 9, ay: 10, w: 10, h: 7 }, sprig: { ax: 8, ay: 11, w: 8, h: 10 }, spit: { ax: 8, ay: 13, w: 10, h: 14 }, shield: { ax: 8, ay: 15, w: 12, h: 14 } };
    const only = ${JSON.stringify(process.env.ONLY || 'combdrone,nestguard,stinger,honey')}.split(','), Z = ${Number(process.env.Z || 6)};
    const mk = (o, nest) => { const r = {}; for (const k of ['combdrone', 'nestguard', 'stinger']) r[k] = nest[k]; return r; };
    const nb = NEW.bakeNestSkins(SPR), no = OLD.bakeNestSkins(SPR), H = { w: 12, h: 12 };
    const sets = { combdrone: [no.combdrone, nb.combdrone], nestguard: [no.nestguard, nb.nestguard], stinger: [no.stinger, nb.stinger], honey: [HO.bakeHoneyHornetSheet(PX.canvas, PX.flipX, PX.whiten, H), HN.bakeHoneyHornetSheet(PX.canvas, PX.flipX, PX.whiten, H)] };
    const rows = []; for (const k of only) for (let j = 0; j < 2; j++) rows.push([k + (j ? ' AFTER' : ' BEFORE'), sets[k][j], k === 'honey' ? 4 : Z]);
    let W = 0, Ht = 10; const lay = rows.map(([n, s, z]) => { const fw = Math.max(...s.R.map(f => f.width)) * z + 8, fh = Math.max(...s.R.map(f => f.height)) * z + 22; W = Math.max(W, s.R.length * fw + 10); const y = Ht; Ht += fh + 4; return [n, s, z, fw, fh, y]; });
    const c = document.createElement('canvas'); c.width = W; c.height = Ht + 6; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, c.width, c.height); g.font = '13px monospace';
    for (const [n, s, z, fw, fh, y] of lay) { g.fillStyle = '#fff'; g.fillText(n + '  (' + s.R[0].width + 'x' + s.R[0].height + ' ax ' + s.ax + ' ay ' + s.ay + ' box ' + s.w + 'x' + s.h + ')', 6, y + 12);
      s.R.forEach((f, i) => { g.drawImage(f, 4 + i * fw, y + 18, f.width * z, f.height * z); g.fillStyle = '#ff0'; g.fillRect(4 + i * fw + s.ax * z, y + 18 + s.ay * z, 3, 3); }); }
    return c.toDataURL('image/png'); })()`, 90000);
  writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('written', out, JSON.stringify(pg.errors.slice(0, 3)));
} finally { pg.close(); }
