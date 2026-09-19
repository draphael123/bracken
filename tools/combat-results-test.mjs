import assert from 'node:assert/strict';
import { summarize } from './combat-results.mjs';
assert.deepEqual(summarize('boss', [
  {killed:false,opened:4,secs:120},
  {killed:true,opened:0,secs:110},
  {killed:true,opened:1,secs:30},
], [90,150]), {samples:3,completed:2,inTarget:1});
assert.deepEqual(summarize('ambush', [
  {opened:true,secs:20},{opened:false,secs:20},{opened:true,secs:40},
], [15,35]), {samples:3,completed:2,inTarget:1});
console.log('An opened boss guard is never reported as a kill; timing requires completion.');
