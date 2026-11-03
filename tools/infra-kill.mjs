// tools/infra-kill.mjs - WAS THIS CHECK KILLED BY THE MACHINE, NOT BY THE CODE? (claude/botmem, 11-03)
// scratch/memguard2.ps1 appends one JSON line per kill to scratch/memguard-kills.jsonl:
//   {"t":<epoch ms>,"pid":123,"profile":"bracken-look-ab12cd-ef34gh","lane":"ab12cd","mb":3100,"free":700,"why":"cap"|"floor"}
// A tool whose page died to a guard kill reads that file (killedByGuard) and says INFRA-KILLED instead of a red; check.mjs / check-pool.mjs
// rerun such a check ONCE, labelled [infra-retry]. Without memguard2 running the file does not exist and only the STRONG message regex applies.
import { readFileSync, statSync, openSync, readSync, closeSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const KILL_LOG = process.env.BRACKEN_KILLLOG || join(ROOT, '..', 'scratch', 'memguard-kills.jsonl');
/* the messages cdp.mjs gives a page that was killed under the tool (Inspector.targetCrashed / socket closed) or a browser that vanished */
export const INFRA_RE = /page CRASHED|page connection (closed|failed)|could not reach the browser|borrowed browser (did not|kept)/i;

export function recentKills(sinceMs) {
  try { const size = statSync(KILL_LOG).size, len = Math.min(size, 65536), buf = Buffer.alloc(len), fd = openSync(KILL_LOG, 'r');
    try { readSync(fd, buf, 0, len, size - len); } finally { closeSync(fd); }
    return buf.toString('utf8').split(/\r?\n/).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(k => k && k.t >= sinceMs); } catch { return []; }
}
/* a kill of THIS page's profile (a tool in-process: cdp.mjs knows its profile), or any kill of this suite run's tag / lane since t0 (the parent that spawned the check) */
export function killedByGuard({ profile = '', tag = '', sinceMs = 0 } = {}) {
  const k = recentKills(sinceMs).filter(k => (profile && k.profile === profile) || (!profile && tag && k.lane === tag));
  return k.length ? k[k.length - 1] : null;
}
/* parent side: the check's output, and when it started. Returns a short reason or null. Timeouts are never infra. */
export function infraWhy(lines, t0, { timedOut = false } = {}) {
  const text = Array.isArray(lines) ? lines.join('\n') : String(lines || '');
  if (timedOut || /TIMEOUT after|maxBuffer length exceeded/.test(text)) return null;
  if (/INFRA-KILLED/.test(text)) return 'tool reported INFRA-KILLED';
  const tag = (process.env.BRACKEN_RUN || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
  const k = killedByGuard({ tag, sinceMs: t0 });
  if (k && INFRA_RE.test(text)) return 'memguard killed pid ' + k.pid + ' at ' + k.mb + ' MB (' + k.why + ') and the check saw the page die';
  if (INFRA_RE.test(text)) return 'page died under the check (' + (text.match(INFRA_RE)[0]) + '); no memguard kill logged';
  return null;
}
