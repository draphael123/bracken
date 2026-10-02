/* paladin maul capture: node work/claude/paladinmace/capture.mjs <poses.png> <skins.png>. All poses (steel) + key poses in ember/frost/moon. */
import { writeFileSync } from 'node:fs';
import { openPage } from '../../../tools/cdp.mjs';
const pg = await openPage({ audio: false, fonts: false });
try {
  const d = await pg.evalp(`(() => { const Z = ${process.env.Z || 3}, s = BKT.heroSet('bracken', 'steel', false, 'paladin'), keys = Object.keys(s.R).filter(k => { const v = s.R[k]; return v && (v.width || (Array.isArray(v) && v[0] && v[0].width)); });
    const rows = keys.map(k => [k, [].concat(s.R[k]).filter(f => f && f.width)]);
    const cw = 40 * Z, ch = 34 * Z, mx = Math.max(...rows.map(r => r[1].length)), cols = Math.min(mx, 8);
    let nr = 0; rows.forEach(r => nr += Math.ceil(r[1].length / cols));
    const c = document.createElement('canvas'); c.width = cw * cols + 70; c.height = ch * nr + 4; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.fillStyle = '#2a3a2a'; g.fillRect(0, 0, c.width, c.height);
    let y = 0; rows.forEach(([k, fs]) => { g.fillStyle = '#fff'; g.font = '11px monospace'; g.fillText(k, 2, y + 12); fs.forEach((f, i) => { const rr = Math.floor(i / cols), cc = i % cols; g.drawImage(f, 70 + cc * cw, y + rr * ch, f.width * Z, f.height * Z); }); y += Math.ceil(fs.length / cols) * ch; });
    const P = c.toDataURL('image/png');
    const W = ['steel','ember','frost','moon'], K = ['idle','run','jump','atk','atkB','atkC','plunge','block','slide','kneel'];
    const c2 = document.createElement('canvas'); c2.width = cw * K.length; c2.height = ch * W.length; const g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = false; g2.fillStyle = '#2a3a2a'; g2.fillRect(0, 0, c2.width, c2.height);
    W.forEach((w, r) => { const t = BKT.heroSet('bracken', w, false, 'paladin'); K.forEach((k, i) => { const v = [].concat(t.R[k] || []).filter(f => f && f.width); const f = v[Math.min(2, v.length - 1)]; if (f) g2.drawImage(f, i * cw, r * ch, f.width * Z, f.height * Z); }); });
    return [P, c2.toDataURL('image/png'), keys.join(',')]; })()`);
  writeFileSync(process.argv[2], Buffer.from(d[0].split(',')[1], 'base64')); writeFileSync(process.argv[3], Buffer.from(d[1].split(',')[1], 'base64')); console.log(d[2]);
} finally { pg.close(); }
