// tools/ports.mjs — A PORT BLOCK PER CHECKOUT, so two worktrees can run the suite at the same time.
//
// WHAT WAS ACTUALLY WRONG. "The suite needs headless Chrome to itself" was the rule we worked around all day, and it
// was never true of Chrome: cdp.mjs already randomises the DevTools port (9300 + rand 400) and profile-sweep already
// skips a profile while a live browser holds it. What collided was the HTTP PORT. Every page tool defaulted to the
// same 5892, and cdp.mjs - rightly - REFUSES a server that is serving a different checkout, so the second worktree
// died on `the server on http://localhost:5892/ is serving another checkout`. One number, shared by everyone.
//
// So each checkout now gets its own block of ten ports, derived from its own path: same path, same ports, every run,
// with no probing and no race. Set BRACKEN_PORT_BASE to override, and PORT still wins for a single tool.
//
// 6100-6890 in blocks of 10 deliberately avoids 5690-5900, where Daniel's dev servers live (bracken 5860, the
// worktrees 5862/5864, and two dozen other projects).
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
/* the path decides it: lower-cased because Windows hands the same checkout back with different capitalisation */
const digest = s => parseInt(createHash('sha1').update(s.toLowerCase()).digest('hex').slice(0, 8), 16);
/* FETCH REFUSES SOME PORTS. Node's fetch (and every browser) blocks the WHATWG "bad ports" - in this range 6566, 6665-6669 and 6697 -
   with "bad port", so a checkout whose path hashed to the 6660 block could never reach its own server on slots 5-9: additional-areas-runtime
   and slopes-trace died with "dev server did not come up" in bracken-batch23 and passed in every other folder (2026-09-25). A block that holds
   one is skipped for the next. */
const BAD_PORTS = new Set([6566, 6665, 6666, 6667, 6668, 6669, 6697]);
const blockOk = b => ![...Array(10).keys()].some(i => BAD_PORTS.has(b + i));
const hashed = () => { let k = digest(ROOT) % 80; for (let n = 0; n < 80 && !blockOk(6100 + k * 10); n++) k = (k + 1) % 80; return 6100 + k * 10; };
export const PORT_BASE = +(process.env.BRACKEN_PORT_BASE || hashed());
/* one port out of this checkout's ten. n is a slot, not a port: portFor(3) is this checkout's third. */
export const portFor = (n = 0) => PORT_BASE + (((n % 10) + 10) % 10);

/* A TAG FOR ONE SUITE RUN, so a leak check can tell its own browsers from another session's. The hazard was never two
   healthy runs - it was a run KILLED mid-flight, whose orphaned profile stops being "in use" and lands in the other
   run's leak list. That is the false red that cost a full run on 2026-09-22. */
export const runTag = () => (process.env.BRACKEN_RUN || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 6);
export const newRunTag = () => Math.random().toString(36).slice(2, 8).padEnd(6, '0');
