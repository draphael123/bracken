// A hard-stopped tool cannot run its exit hook. Finish only its recorded, same-attempt, same-run cleanup.
import { existsSync } from 'node:fs';
import { basename } from 'node:path';
import { isOurProfile, killHoldersSync, removeProfileSync } from './browser-profile.mjs';

export function cleanupStoppedProfiles(events, { attempt, check, run, forced }) {
  const tag = String(run || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
  if (!forced || tag.length !== 6) return [];
  const seen = new Set(), results = [];
  for (const e of events) {
    if (e.type !== 'launch' || e.attempt !== attempt || e.check !== check || typeof e.profile !== 'string' || seen.has(e.profile)) continue;
    seen.add(e.profile);
    if (!new RegExp('^bracken-(?:look|headless|prof|video|prod)-' + tag + '-[A-Za-z0-9]{6}$').test(basename(e.profile))) continue;
    if (!existsSync(e.profile)) { results.push({ profile: e.profile, removed: true, alreadyAbsent: true }); continue; }
    if (!isOurProfile(e.profile)) { results.push({ profile: e.profile, removed: false, skipped: 'not a direct owned temp directory' }); continue; }
    try {
      // Match the unique validated profile on command lines; never kill an old recorded PID that might have been reused.
      killHoldersSync(e.profile);
      const removed = removeProfileSync(e.profile);
      results.push({ profile: e.profile, removed: removed && !existsSync(e.profile) });
    } catch (error) { results.push({ profile: e.profile, removed: false, error: error.message }); }
  }
  return results;
}
