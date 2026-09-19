import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// SCENERY STAYS BEHIND THE ROAD. A coverage threshold must never switch a rectangular patch of light.
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const front=s.slice(s.indexOf('function drawFront('),s.indexOf('function bar('));
assert(!front.includes('drawOccluders(')&&!front.includes('drawFg('),'pass-through trunks cannot cover the actors');
assert(front.includes("createRadialGradient(")&&front.includes("'destination-out'"),'foreground clearing has a continuous edge');
assert(!front.includes('const part =')&&!front.includes('frontCovered ?'),'no threshold-switched rectangles');
const world=s.slice(s.indexOf('function drawWorld('));
assert(world.indexOf('drawOccluders(cx, cy)')<world.indexOf('const s = tileSpr['),'scenery precedes solid tiles');
console.log('render layers: scenery behind tiles and a continuous foreground mask.');
