# claude/coopprogress - CO-OP PROGRESSION STEP 1: portable per-player saves (online AND local) + the tavern PARTY BOARD

Branch `claude/coopprogress` off live master f84fd0c4. Brief: scratch/brief-coopprogress.md (step 1 + the 10-19 line), brief-tavern.md, brief-aicompanions.md (10-14).

## WHAT LANDED

**src/coop-save.js (new, pure - storage and channel injected)**: the save API both co-op kinds (and the AI companions lane) use.
- `snapshotOf(progress, hero, slot)` - one hero's part of a save (XP, xpGot, done, card, cardFree, skillOwned, loadouts, skillRank, talents, charmOf, tech, charm, items, purse). ~1 KB.
- `cleanSnapshot(snap)` - the HOST's side: nothing trusted, validated with the save's own `validateProgress` on the one hero; returns a SEAT PROFILE `{ hero, slot, sword, heroes, view, base }`. Tampered (unknown skill, negative XP, unsafe key, card over cap, unknown hero) = refused.
- `newLedger / earnedOf / noteClear / nextCredit` - the host's running account of one seat for one SESSION (sid). Credits are CUMULATIVE + numbered (seq), never lower than the last one sent; at a checkpoint the death cost's unbanked carry is held back; a session that earned nothing writes nothing.
- `applyCredit(storage, key, credit, opts)` - the PARTNER's side. Pays the difference between this credit and the last one the slot took for that session (`coopCredit[sid]` in the save): a repeat / late / out-of-order credit is never paid twice, a lost one is covered by the next. XP (capped at L50), silver, LEVEL CLEARS (`PROG[id].cleared`, `done[hero][id]` - so needs-chain successors open exactly as main.js `levelLocked` reads them). No save = a fresh one. Old saves migrated via `loadProgress` (raw backup kept); DAMAGED / NEWER slot refused and told, not written; full disk told (`safeSet`). `opts.xpOnly` = XP + levels only (linked AI companion). Newest 24 sessions remembered.
- `makeLocks({ id, channel })` - ONE CHARACTER, ONE PLACE over a BroadcastChannel ('bracken-slots'): every page says which slots it holds (game = P1's slot; seat = local co-op seats; guest = an online guest page), answers 'who', heartbeats every 5 s, a claim not repeated for 15 s expires. NOTHING is written to localStorage for locks (several checks snapshot the whole storage).
- `slotSummary / summaryLine / seatFromSlot / freshSeat / heroesOf / creditLine / lockLine`.

**main.js**
- THE OVERLAY: a seat with `p.prof` plays out of `prof.view` - `asPlayer` swaps those PROG keys in for his pass (`profIn/profOut`, nesting-safe, sync-then-switch), so his level, card, skills, loadout, talents, charm, items and purse are HIS and every write in his pass (kill XP, gold drops, the death cost) lands in his view, never in the host's save. `saveProgress` serialises the host's own values whenever an overlay is up; `winLevel` runs as the host even when a seat's pass ends the wood (`asHost`); `coopLent` never lends a profiled seat.
- `gainXp`: a profiled seat earns into his own XP (his own catch-up / soft cap) with a light level-up (heal, ring, LEVEL n); his card waits for his own game (picks are owed by level).
- CREDITS: `creditAll` at every checkpoint (a shrine lit, a seat's own bank), the wood won (`seatsWin`: the clear on HIS road, its first-finish share on his hero, the coins he bent down for into his purse - the host's purse keeps the wood's as before), the seat leaving (`seatDrop` -> `profReconcile`), the party ending / slot switch (reconcile every 5 s), `pagehide`. Local seats are written here (`applyCredit` to their slot, toast `SLOT n: +X XP...`); online seats via `ONL.sendCredit`.
- LOCAL: `partyJoin(slot, hero)` / `partyAttach(seat, slot)` - one of this browser's OTHER slots (P1's refused, another seat's refused, a slot a guest page plays refused, told), locked for the seat, released on leave. Slot -1 = GUEST, today's behaviour.
- P1 claims his slot in `loadSlot`; the save picker refuses a slot playing co-op elsewhere; `saveProgress` pauses (told: SAVE PAUSED - SLOT IN CO-OP ELSEWHERE) if P1's slot is being played as a co-op seat/guest elsewhere.
- Pad JUMP/START-to-join unchanged (suppressed only while the party board is open, so navigating it with a pad does not seat a guest).
- `BK.coopSave` test hooks (seats, gain, bank, win, join, attach, locks, board, reconcile...).

**src/online.js** - roster v3 carries the campaign ids, real-level ids and every hero's name; art for every hero; `pick` may carry `seat` (cleaned with `cleanSnapshot`, else 'YOUR SAVE COULD NOT BE READ HERE: PICK AGAIN'); `sendCredit`; the FINAL credit goes before the link closes on bye / tavern door / END ONLINE CO-OP; a drop with no goodbye keeps the last checkpoint's (partial).

**src/online-guest.js** - after the roster: PICK ONE OF YOUR SAVES (5 slots summarised; empty = a new save; damaged / newer / held-elsewhere refused with the reason; JUST VISIT - NOTHING SAVED = the old flow on the host's heroes), then a hero of that save (owned + free starters); the pick carries the snapshot. `{t:'earn'}` credits are written into THAT slot (`applyCredit`), told on the strip and the menu ('SAVED SLOT 1: +40 XP, +9 SILVER'); LEAVE keeps the link up (<= 2 s) until the host's final credit is in. The slot is claimed on the lock channel while he plays.

**src/party-board.js (new) + src/tavern.js** - THE PARTY BOARD replaces the invite board station (same spot, verb PARTY): four seats; each EMPTY seat offers JOIN (slot pick -> hero pick, or GUEST), INVITE (the online room card) and AI PARTNER (shown, disabled, 'COMING SOON'); a pad guest's row offers USE A SAVE. Arrows/Z/Enter/Esc/X and a pad's d-pad/A/B.

## CHECKS
- NEW `tools/coop-progress.mjs` (node, registered in tools/check.mjs): snapshot + host refusal of 7 tampered snapshots; ledger (carry held back, cumulative, never lower, nothing-earned writes nothing); credit (lands in the chosen slot only, never double, lost covered, older-late ignored, rejoin pays only its own, clear opens the needs successor, non-level ids dropped, fresh save, v0 save migrated with its backup, legacy single save, damaged/newer/full told and unwritten, junk credits ignored, xpOnly, L50 cap, session cap); locks (cross-page refuse, own-seat refuse, one slot per role, 'who', release, TTL expiry + heartbeat, no channel); local slot pick. GREEN.
- `tools/online-coop.mjs` EXTENDED (design change stated in its header): guest picks his own slot (PYRO LV 6, which the host does not own) -> host seats him from the snapshot (slot, level 6, purse 777) -> checkpoint credit written by HIS browser, host save untouched -> replayed credit not paid twice -> unbanked lost on a drop with no goodbye (partial) -> storage identical EXCEPT xp/coins/coopCredit of the chosen slot -> rejoin = new session based on the credited save, its checkpoint pays only its own -> a wood won together cleared on HIS road (+ its successor open, + the first-finish share) -> LEAVE sends the final credit.
- `tools/tavern.mjs`: the board station test now asserts the PARTY BOARD (P1 + three EMPTY seats; JOIN + INVITE on each, AI PARTNER disabled COMING SOON; INVITE opens the online room card); NEW 'party' section (local JOIN on slot 3 at its level/purse, P1's slot refused, lock refusals + save picker refusal, checkpoint credit into slot 3 with P1's save untouched, USE A SAVE on an empty slot, leaving writes the fresh save and frees the slot); the online section picks a (fresh) slot first.
- RESULTS: see the end of this file.

## AI COMPANION API NOTES
For the linked-companion lane (brief-aicompanions.md 10-14: XP + levels only, own slot, never open twice):
1. LOCK the slot first: `LOCKS.claim(slotI, 'companion', 'AI COMPANION', 'compN')` (main.js `LOCKS`; any role string unique per companion). `!ok` -> show `CS.lockLine(slotI, res.holder)`. Release with `LOCKS.release(slotI, role)`.
2. LOAD the hero: `CS.seatFromSlot(localStorage, slotI, hero, CAMP_IDS)` -> a seat (null = damaged/newer slot: tell). Empty slot gives a fresh hero; for a DEFAULT companion use no profile at all (today's lent level).
3. SEAT it with `prof = profMake(seat, { kind: 'local', slot: slotI, role, xpOnly: true })` and `seatAdd({ hero, ally: true, prof })` - NOTE seatAdd currently drops `prof` for `ally` seats (`prof: !s.ally && s.prof ...`); the companion lane should lift that line for linked companions. Its pass then plays out of its own save automatically (asPlayer overlay), so its level/talents/skills are its own and `gainXp` in its pass credits its XP.
4. CREDIT: `profCredit` already runs for every profiled seat at checkpoints / win / leave. For xpOnly, pass `{ xpOnly: true }` to `CS.applyCredit` - `profCredit` already passes `xpOnly: !!prof.dest.xpOnly`. Its coins/clears are then never written (they stay with the player's save, as the brief says). Do NOT call `seatsWin`'s coin/clear part for it (harmless: applyCredit ignores them with xpOnly).
5. IDEMPOTENT: each companion run is one session (`CS.newSid`), cumulative credits; nothing earned writes nothing.

## QUESTIONS FOR DANIEL (rec built in each case)
1. KILL XP IN CO-OP - a seat on his own save earns XP from HIS OWN kills (plus each wood's first-finish share). Shared kill XP (everyone earns every kill) would let a weak friend keep up. REC/BUILT: own kills only (it is how solo pays; the catch-up x3 already helps a low-level friend). Say if you want shared.
2. SILVER DOUBLE-COUNTS - the host's purse keeps the whole wood's coins as before (unchanged), AND the guest gets the coins HE picked up + his gold drops. REC/BUILT: both (nobody loses; mild inflation). Alternative: split.
3. GUEST CARD PICKS - a guest who levels in your game gets the level (health ring, LEVEL n) but his VIGOR/ENDURANCE/MIGHT card waits until he opens his own game. REC/BUILT: wait (the card is a menu; it should not pop on a guest's stream).
4. MEDALS / QUESTS for guests - a clear credits `cleared` (+ road), not his medal, time, or quest. REC/BUILT: clear only.
5. A PROFILED SEAT KEEPS HIS HERO in the wardrobe (another hero = leave and JOIN with it) - his snapshot is that one hero. REC/BUILT as said.
6. THE TWO-TAB EDGE - if the guest's own game is open on the same slot in another tab, his page refuses the slot (told). If he opens it in his game AFTER, the game shows SAVE PAUSED - SLOT IN CO-OP ELSEWHERE until the guest page leaves. Two plain game tabs on one slot are unchanged (not locked). OK?

## RESULTS (run on this branch after the batch105 QUICK gate said 'gate done' 20:07; ports 8773/8774, two pages max)
- coop-progress (node, new): GREEN
- online-coop (two pages, extended): GREEN (needed two real fixes found by it: the win's first-finish share was held back as 'unbanked'; asserts the purse the snapshot really holds)
- tavern (incl. new 'party' + the online-in-the-inn section): GREEN
- save-safety, save-slots, hero-roster: GREEN
- progression, comments, dangling-paths, syntax of every touched file: GREEN
- partner-throw: 1 RED - "a boss takes a CHIPPED hero blow (captain: 0 of a raw 30)". PRE-EXISTING: identical numbers on master f84fd0c4 in a temporary detached worktree (removed after). Not caused by this lane (no profiled seat in that test); needs the boss-greed/chip owner.
- NOT RUN: the full suite / textfit (the PARTY BOARD's first-visit hint line is 90 chars, the same length class as the other station lines - worth a textfit 'hints' pass in the integ).
