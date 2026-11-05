import { install, sheet, savePNG } from './node-canvas.mjs'; install();
const C = await import('../src/chars.js'); const FV = await import('../src/foe-variety.js');
const SPR = { sprig: C.bakeSprig(), archer: C.bakeArcher() }; FV.bake(SPR);
const items = []; for (const k of ['sprig', 'clubsprig', 'archer', 'firearcher', 'rockarcher', 'venomarcher']) items.push(...SPR[k].R);
savePNG(sheet(items, { maxW: 700, scale: 4 }), process.argv[2]); console.log('frames', items.length);
