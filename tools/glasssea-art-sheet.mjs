// tools/glasssea-art-sheet.mjs - THE GLASS SEA's baked art on one contact sheet, in Node (claude/glasssea art pass; not in the suite): the props, the landmarks, the skins, the Colossus's parts.
//   usage: node tools/glasssea-art-sheet.mjs <out.png> [props|foes|colossus|all]
import { install, sheet, savePNG } from './node-canvas.mjs';
install();
const which = process.argv[3] || 'all', out = process.argv[2] || 'glasssea-art-sheet.png';
const P = await import('../src/redraw/glasssea_props.js'); const items = [];
if (which === 'props' || which === 'all') {
  items.push(...[0, 1, 2].map(P.bakeShards), ...[0, 1, 2].map(P.bakeStump), ...[0, 1, 2].map(P.bakeDrift), ...[0, 1, 2].map(P.bakeBones), P.bakeRibs(0), P.bakeCairn(0), ...[0, 1, 2].map(P.bakeFrost), ...[0, 1, 2].map(P.bakeRime), P.bakeHidePole(), P.bakeChimePost());
  items.push(P.bakeSpire(112, true, 1, false), P.bakeSpire(80, true, 2, false), P.bakeSpire(176, false, 3, true), P.bakeSkiff(0), P.bakeSkiff(1), P.bakeObeliskCap(), P.bakeObeliskEye(), P.bakePlinth(), P.bakeTemple(), P.bakeHeadFace(), P.bakeFarBones(0), P.bakeFarBones(2), P.bakeFarBones(4));
}
if (which === 'foes' || which === 'all') { const F = await import('../src/redraw/glasssea_foes.js'); items.push(...await F.sheetItems()); }
if (which === 'colossus' || which === 'all') { const C = await import('../src/redraw/glass_colossus_art.js'); items.push(...C.sheetItems()); }
const s = sheet(items, { maxW: 900, bg: '#7a6aa0', pad: 6, scale: 2 }); savePNG(s, out); console.log('wrote ' + out + ' (' + items.length + ' items)');
