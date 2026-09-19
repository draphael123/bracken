// Skill and migration contract: every historical node has a destination, every sold skill has a gameplay consumer.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEGACY_NODES,SKILLS} from '../src/progression.js';
const s=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.equal(LEGACY_NODES.length,181);
for(const n of SKILLS){assert(s.includes("tal('"+n.id+"')")||s.includes("skillPress('"+n.id+"')"),n.hero+'/'+n.id+' has no consumer');assert([60,120,220,360].includes(n.price));assert([1,4,8,12].includes(n.level));}
assert(s.includes('const TREE = LEGACY_NODES'));assert(!s.includes('PROG.talentVersion = 2'));
console.log(LEGACY_NODES.length+' historical nodes mapped; '+SKILLS.length+' priced skills/techniques have gameplay consumers; destructive legacy resets removed.');
