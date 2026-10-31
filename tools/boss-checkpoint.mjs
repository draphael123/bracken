/* tools/boss-checkpoint.mjs - A SHRINE JUST BEFORE EVERY BOSS AND EVERY MINI-BOSS (Daniel 10-30: "there should always be a checkpoint before one of these, so you
   don't have to go back far"; the arena heal, src/main.js arenaHeal, makes the fight start at full health, so what a death costs is the walk back).
   Node only: no page. For every campaign level with a boss arena (L.arena) or a mini arena (L.mini) it asks, of the room's door:
     NEAR   a shrine stands within NEAR (14) columns of the room's near wall on the room's floor row (+-3 rows): the walk back is a few steps; OR
     CHASE  the fallingtower's chase sets its own fight checkpoint beside the ring (L.chase3.check); OR
     SHORT  the walked route (tools/pacing.mjs) from the last shrine before the door to the door is at most MAX_WALK (40) route tiles.
   MAX_WALK = 40 route tiles: the existing data has 79 of 87 doors inside 25 and the picker's door shrine is normally 3-24 tiles out; 40 is a few seconds' walk,
   and a platforming hazard section (a pit run, a ladder) is longer than that. It fails a room with neither, or with no shrine before it at all.
   Ambush rooms are not asked (not a boss or mini-boss: RULES S4 still holds them to the 200-tile door rule in tools/checkpoint-gaps.mjs). */
import assert from 'node:assert/strict';
import { LEVELS } from '../src/level.js';
import { pacing } from './pacing.mjs';
export const NEAR = 14, MAX_WALK = 40;
const TS = 16;
const near = (L, R) => { if (!R) return null; const fy = R.floor / TS - 1;
  return L.ents.filter(e => e.t === 'check' && Math.abs(e.y - fy) <= 3 && (R.reverse ? e.x > R.wallR && e.x <= R.wallR + NEAR : e.x < R.wallL && e.x >= R.wallL - NEAR))[0] || null; };
export function judgeRooms(lv, r, L = lv.build()) {
  const s = r.stats, bad = [], out = [], cl = s.checkList.filter(c => c.at !== null).sort((a, b) => a.at - b.at);
  for (const [kind, R, c] of [['boss', L.arena, 'B'], ['mini', L.mini, 'M']]) { if (!R) continue;
    if (kind === 'boss' && R.chase && L.chase3 && L.chase3.check) { out.push([lv.id, kind, 'chase', 0]); continue; }   /* THE CHASE (fallingtower): the fight starts at the stair's top and bossStart sets the fight's checkpoint there (main.js, L.chase3.check) - a death anywhere in it wakes beside his ring; the 84,146 shrine is the stair's foot, which IS the fight */
    const n = near(L, R); if (n) { out.push([lv.id, kind, 'near', n.x + ',' + n.y]); continue; }
    const d = s.doors.find(q => q.c === c), at = d ? (d.at === null ? s.endAt : d.at) : s.endAt, before = cl.filter(q => q.at <= at), last = before[before.length - 1];
    if (!last) { bad.push(lv.id + ' ' + kind + ': no shrine before the room (door at route ' + at + ')'); continue; }
    const walk = at - last.at; out.push([lv.id, kind, 'walk', walk]);
    if (walk > MAX_WALK) bad.push(lv.id + ' ' + kind + ': the last shrine (' + last.x + ',' + last.y + ') is ' + walk + ' route tiles from the door (max ' + MAX_WALK + ', or one within ' + NEAR + ' columns of the wall)'); }
  return { bad, out };
}
{
  const bad = [], all = [];
  for (const lv of LEVELS) { if (lv.hidden && !lv.secret) continue; if (/^(trial|shop|custom)/.test(lv.id)) continue; let r; try { r = pacing(lv); } catch (e) { bad.push(lv.id + ': route unmeasurable (' + e.message + ')'); continue; }
    const j = judgeRooms(lv, r); bad.push(...j.bad); all.push(...j.out); }
  assert.equal(bad.length, 0, bad.length + ' room(s) with no shrine close before them:\n  ' + bad.join('\n  '));
  console.log('boss-checkpoint  ' + all.length + ' boss/mini rooms in ' + new Set(all.map(a => a[0])).size + ' levels: each has a shrine within ' + NEAR + ' columns of its wall or at most ' + MAX_WALK + ' walked route tiles back (' + all.filter(a => a[2] === 'near').length + ' near, ' + all.filter(a => a[2] === 'chase').length + ' chase-set, ' + all.filter(a => a[2] === 'walk').length + ' by walk).');
}
