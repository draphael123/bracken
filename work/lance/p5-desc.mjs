import { patch } from './patch.mjs';
import { readFileSync } from 'node:fs';
const s = readFileSync('src/main.js', 'utf8'); const m = s.match(/one of the [Qq]ueen\?'s bowmen is coming down onto an end lookout/);
patch('src/main.js', [[m ? m[0] : 'one of HER bowmen is coming down onto an end lookout', 'one of HER bowmen is coming down onto an end lookout']]);
