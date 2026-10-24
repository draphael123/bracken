import { edit } from './patch.mjs';
edit('src/main.js', "fg: pal.dress === 'battlefield' ? UW.bakeFGUnburied(640, VH, 4) : pal.fg === 'city'", "fg: pal.dress === 'battlefield' ? UW.bakeFGUnburied(640, VH, 4) : pal.fg === 'pwood' ? PWB.bakeFG(640, VH, 4) : pal.fg === 'city'");
edit('src/palisade-wood.js', "palette: { sky: 'autumn', near: 'autumn', dress: 'wood',", "palette: { sky: 'autumn', near: 'autumn', dress: 'wood', fg: 'pwood',");
