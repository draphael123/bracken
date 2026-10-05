import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';
import { judgeLevel } from './checkpoint-rule.mjs';
const lv = LEVELS.find(l => l.id === 'welltown'); const r = pacing(lv); const j = judgeLevel(lv, r);
console.log(JSON.stringify(j).slice(0, 1500)); console.log(Object.keys(r), JSON.stringify(r.stats).slice(0,800));
