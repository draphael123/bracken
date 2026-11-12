# HIGHLINES-KIT plan (claude/highlines-kit, 11-05) - THE LINE KIT for THE HIGH LINES
Brief: zipclimb-plan.md as amended by Daniel 11-05 15:27 (RELAY): Sky Road -> HIGH LINES -> Ore Road; up-lines are HAND-WINCH / COUNTERWEIGHT
(strike to haul), WIND only in its own sections, one rule (lines) varied every band. This lane builds the KIT only: src/line-kit.js (pure),
src/linekit-lab.js (data-only lab room, on no list), tools/line-kit.mjs (node proof + lint), docs/linekit.md. Not wired into main.js.

## Why a new module, not more src/zipline.js
zipline.js is shared by 6 live levels. The kit owns its own lines (L.lineKit.lines, NOT pushed into L.zipLines), so zipStep never sees them and
no live level can change. It copies zipline's feel numbers (hang 12, reach 24/4, end pad 8, release 0.6, kick vy -240) so a rope feels the same.

## Line kinds (one data entry each, tile coords, a = one end, b = the other)
- FREE: today's rope, rides downhill (210 px/s). GLIDE: the fast DOWN-line (300), hold BACK = brake x0.5 (time a jump).
- WINCH (the up-line): carries you toward its HIGH end. drive 'grip' (default): every blow you make while hanging is a crank stroke = 40 px up
  in 0.3 s, 2 strokes buffer; between strokes the RATCHET holds (never slides back). drive 'post': strike the post at the low station (blow or
  shot) and the line runs 2.4 s at 110 px/s for every seat on it. At the high end you hop off onto the landing.
- POINTS (junction): `points: [{ at, to }]` on a line; ride past `at` holding UP and your trolley switches to line `to`; hold nothing = carry on.
- SNAP: `snap: { at }` - a rider coming up on `at` hears the CREAK (1.0 s told), then it parts; restrung after 8 s.
- GONDOLA (set piece): `cab: { onto }` - a cab you STAND in; it sets off 0.6 s after a seat boards, the line snaps at `snap.at` (told creak),
  the cab falls and HOOKS ONTO the lower line `onto`, then runs it to its dock. Lint flies the fall: it must land on `onto`.
- COUNTERWEIGHT PAIR (L.lineKit.weights): weight A + cage B on one rope. Heavier side goes down (seat = 1, A tare 0.5, a STONE = 9 > 4 seats).
  A HOPPER post drops a stone into A (sends cage B and everyone in it up); riding A down sends B up (the co-op version). Empty 4 s -> home.
- SIDE LINE: `secret: true` - lint checks its run ends on a landing with a secret on it, and the sweep checks you get back to the route.
- CUTTABLE: `cut: true` - foes may part it (Hookjack); lint demands a catch (line / net / landing) under every point.

## Rider (rec answers to the open questions)
- Hang, sway, ride: P.lk = { id, x, dir, sway }; the kit sets P.x/P.y (main.js skips its own move while P.lk). JUMP = kick (vy -240, carry 0.8 of
  line speed + sway); DOWN = drop; touch another line in the air = caught at once (the line just left only by UP, as zipregrab).
- ATTACK WHILE HANGING: YES - a line swing (no lunge). On a grip winch that same blow is the crank stroke (strike to haul = one button).
  Moves that move the hero (lunge, dash, plunge, vault) let go first (main.js side). Tap C works; a held guard blocks but pushes you 24 px back.
- Points take only on UP (DOWN always means drop - one meaning per key).

## Wind (own sections only)
- L.lineKit.winds: told gust zones (period, on, told >= 1.0 s, dir, shove, sway). In a gust: FREE/GLIDE lines go x1.35 with it / x0.6 against;
  riders SWAY (a damped swing up to `sway` px - their hitbox swings, archers/harpies feel it); a kick or fall in the gust is carried.
- LEE ROCKS (lee boxes): no wind inside. Lint: every wind box touches a lee box (a rest) and no WINCH line enters a wind box (Daniel: wind
  only in its own sections, never stacked on the haul).

## Co-op (1-4 seats)
- Every seat has its own trolley and its own P.lk; two or four on one line is fine (no collision). Points/kicks/strokes are per seat.
- Post winches carry every seat on the line; counterweights count seats; gondola cabs carry everyone standing in them. Partner left behind ->
  the existing LEASH (party.js), untouched.

## Death / respawn safety
- lineRespawn(kit, bodies): every line restrung, cabs home, weights home (stones out), every wind CALM for >= 3 s (told before it blows),
  every seat's P.lk cleared. Call on a party wipe / checkpoint reload only.
- Every device returns to rest on its own when nobody uses it (cabs restring 8 s, weights 4 s + drift, cuts 8 s) - the sweep relies on it.
- Node sweep (all heroes x 1-4 seats): from every checkpoint the exit is reached; from every state reached, the exit is still reachable
  (no soft-lock); a drop from every point of every hand line lands on something (a pit = respawn, never a stuck state).

## Foe hooks
- lineCut(kit, id, s) (Hookjack): parts a line, riders fall a level; restrung after s. foeRide(kit, e, dt): a foe trolley rides a line either way.
- ridersOn(kit, bodies), leadPoint(kit, P, t) (archers aim where a rider WILL be, as the mangonel's ring), riderHit(kit, P, { guard }) knocks
  off or pushes back. windAt(kit, x, y) for gust harpies / anything that cares.

## Questions (rec first; built as rec)
1. Grip winch stroke = any blow while hanging (REC) vs UP-press crank. 2. Points on UP only (REC) vs UP/DOWN branches.
3. Stone 9 (any party) (REC) vs stone = party size + 0.5. 4. Gondola restring 8 s (REC) vs once per checkpoint.
5. Kit lines separate from L.zipLines (REC) vs folding into zipline.js (would touch 6 live levels).
