// tools/church2-clergy-sheet.mjs - the thurifer and the bell-ringer (and the goblin priest they are made from) in Node. node tools/church2-clergy-sheet.mjs <out.png> [scale]
import { install, sheet, savePNG } from './node-canvas.mjs'; install();
const MON = await import('../src/redraw/monastery.js'); const F = await import('../src/redraw/church_art.js');
const base = MON.bakeGoblinPriest(); const S = F.bakeChurchSkins({ gobpriest: base });
const only = (process.env.ONLY || '0,1,3,5').split(',').map(Number); const items = [...only.map(i => base.R[i]), ...only.map(i => S.thurifer.R[i]), ...only.map(i => S.bellringer.R[i])];
savePNG(sheet(items, { maxW: +(process.env.MAXW || 400), bg: '#5a5870', pad: 3, scale: +(process.argv[3] || 5) }), process.argv[2] || 'clergy.png'); console.log(base.R.length + ' frames, ' + base.R[0].width + 'x' + base.R[0].height);
