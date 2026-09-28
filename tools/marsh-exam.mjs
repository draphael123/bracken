/* tools/marsh-exam.mjs — MARSH WOOD's mud flats are the exam before the King (design audit "MARSH WOOD", plan #4;
   GAME-WIDE PATTERNS #1: the last stretch before a boss must examine the level, not rest). Node only. It fails when:
     - the exam (the stretch between the last checkpoint short of the arena and the arena's own trigger) is too
       short, or holds fewer than: one sinking pad, one gar, one spitter, one wisp (with a fog zone reaching it),
       and one foe near the pad landing (S2);
     - a checkpoint stands inside that stretch (S3: the door only, none inside);
     - the grove crossing (marsh-grove) does not also offer the sluice's drain-and-wade twist, with a gar and an
       eel waiting in the drained mud (design audit "MARSH WOOD" #2, TWIST THE RULE) - the ferry's own pay-or-drain
       choice, reused a second time, the drained road the harder one;
     - the REVIEW pass has put pads back over the wading shallows (111-130): review noise the wading lesson does
       not need, on top of the hoppers it is there to teach (design audit "MARSH WOOD" #3). */
import assert from 'node:assert/strict';
import { LEVELS, TS } from '../src/level.js';

const out = [];
const lv = LEVELS.find(l => l.id === 'marsh');
assert(lv, 'no marsh level in the registry');
const L = lv.build();
const checks = L.ents.filter(e => e.t === 'check').map(e => e.x).sort((a, b) => a - b);
const A = L.arena;
assert(A, 'no boss arena on marsh');

// 1. THE EXAM: between the last checkpoint short of the arena and the arena's trigger
const before = checks.filter(x => x < A.trigger / TS);
assert(before.length, 'no checkpoint short of the arena to stand at the exam\'s door');
const examX0 = Math.max(...before), examX1 = Math.floor(A.trigger / TS) - 1;
const inEx = e => e.x >= examX0 && e.x <= examX1;
assert(examX1 - examX0 >= 12, 'the exam (' + examX0 + '-' + examX1 + ') is too short to hold its own beats');
assert(!checks.some(x => x > examX0 && x <= examX1), 'a checkpoint stands inside the exam');
const pads = L.ents.filter(e => e.t === 'pad' && inEx(e));
const gars = L.ents.filter(e => e.t === 'gar' && inEx(e));
const spits = L.ents.filter(e => e.t === 'spit' && inEx(e));
const wisps = L.ents.filter(e => e.t === 'wisp' && inEx(e));
const landingFoes = L.ents.filter(e => ['hopper', 'thorn', 'gar', 'spit'].includes(e.t) && inEx(e) && pads.some(p => Math.abs(p.x - e.x) <= 6));
assert(pads.length >= 1, 'no sinking pad in the exam');
assert(gars.length >= 1, 'no gar in the exam');
assert(spits.length >= 1, 'no spitter in the exam');
assert(wisps.length >= 1, 'no wisp in the exam');
assert((L.fog || []).some(z => wisps.some(w => w.x * TS >= z.x0 && w.x * TS <= z.x1)), 'the exam\'s wisp has no fog to thin');
assert(landingFoes.length >= 1, 'no foe near the exam\'s pad landing (S2)');
out.push('S3: the exam ' + examX0 + '-' + examX1 + ', ' + pads.length + ' pad(s), ' + gars.length + ' gar, ' + spits.length + ' spitter, ' + wisps.length + ' wisp');

// 2. TWIST THE RULE: the grove crossing offers pay-or-drain too, like the ferry
const groveCrank = L.ents.find(e => e.t === 'crank' && e.raftCall === 'marsh-grove');
assert(groveCrank, 'no grove raft crank');
const groveSluice = L.ents.find(e => e.t === 'sluice' && e.pool !== undefined && Math.abs(e.x - groveCrank.x) <= 4);
assert(groveSluice, 'the grove has no sluice beside its crank: the rule is still a one-off choice, made only at the ferry');
const drained = L.ents.filter(e => e.ifDrained === groveSluice.pool);
assert(drained.some(e => e.t === 'gar'), 'nothing waits in the drained grove for a gar');
assert(drained.some(e => e.t === 'eel'), 'nothing waits in the drained grove for an eel');
out.push('TWIST: the grove sluice at ' + groveSluice.x + ' drains ' + groveSluice.pool + ' to row ' + groveSluice.to + ' (' + drained.length + ' foe(s) wait for it)');

// 3. THE REVIEW PASS STAYS QUIET IN THE WADING SHALLOWS (111-130): no pad review noise there
const shallowPads = L.ents.filter(e => e.t === 'pad' && e.x >= 111 && e.x <= 130);
assert.equal(shallowPads.length, 0, 'the REVIEW pass put pads back over the wading shallows: ' + shallowPads.map(e => e.x).join(','));
out.push('no review pads in the wading shallows (111-130)');

console.log('marsh-exam  ' + out.join('; ') + '.');
