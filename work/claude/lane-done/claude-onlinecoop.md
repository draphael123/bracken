# claude/onlinecoop - ONLINE CO-OP PHASE 1 (2 players)

Branch `claude/onlinecoop`, off origin/master 73a8e1ad (not batch85). Design: codex-handoff reference brief-onlinecoop.md, phase 1 only.

## WHAT WAS BUILT
HOST STREAMS, GUEST SENDS INPUTS. The host's game runs unchanged. Its 320x180 frame is copied at exactly 2x (640x360) onto a canvas.
That canvas is streamed with `canvas.captureStream(60)`, together with the game's whole mix (the master gain tapped into a
MediaStreamDestination), peer to peer to the guest. The guest's inputs come back on a data channel and drive PLAYER TWO through the
EXISTING local co-op slot: the same `p.keys` / `p.press` a second pad writes. There are no game-logic or netcode changes.

- **Entry**: the title has ONLINE CO-OP right after LOCAL CO-OP. It opens a DOM board with two choices:
  - HOST A GAME. It is locked with the local co-op words until the save owns a second hero, using the same gate (`coopOk()`).
  - JOIN WITH A CODE, which is always open because the guest needs no hero of his own.
- **Host**: shows a 4-letter code (no I or O), the share link `?join=CODE` and a COPY LINK button. When the guest picks, the host is
  armed through `coopWant`:
  - in a wood, P2 stands up beside P1 (as the pause-menu pick does);
  - on the title, the host goes on to the map.

  A small chip (bottom-left) shows the code, P2's hero and ping, plus a ROOM button that reopens the board (link again / END).
- **Guest** (`src/online-guest.js`): index.html loads this INSTEAD of main.js when the URL has `?join=`. The guest page never runs the
  game, so **the guest's save is never read or written**. It only reads `bracken.settings`, for his own key binds and touch layout, and
  it writes nothing.
  - **Hero pick**: he picks from the HOST's roster (`coopPickList`).
  - **Picture**: the video is pixelated and sized to a whole number of screen pixels per game pixel.
  - **Input**: his keyboard uses his own rebinding (keysTable, Z/X swap, block toggle, skill 3/4 keys). His pad uses his own pad1
    table. On a phone he gets the game's own touch layer (`createTouch`, his layout).
  - **Losing focus or hiding the tab** releases everything.
  - **Readouts**: a PING readout, and a banner for HOST PAUSED / ON THE MAP / IN THE MENUS.
  - **ESC (or touch pause)** opens a menu with the host sound's volume and LEAVE.
- **Drop-out** works like local co-op's (`coopWant = null; coopEnd()`). It happens when:
  - the guest leaves or closes his tab;
  - his link is quiet for 8 s;
  - his keys are already released after 3 s of quiet.

  The room stays open, so he can rejoin on the same code. The watchdog's clock restarts after the host's own thread was blocked (a wood
  loading), because the first test run showed a level load dropping the guest.
- **Signalling**: the PeerJS 1.5.5 library comes from cdnjs, pinned with an SRI hash, and is loaded only when ONLINE CO-OP is used. It
  talks to the free public broker (0.peerjs.com). There is no server, account or key. The host's peer id is `bracken-<CODE>`. ICE uses
  free public STUN only (Google and Cloudflare); PeerJS's default free TURN is deliberately replaced.
  - Every failure has a title and a "why" on screen: no game with that code, matchmaker unreachable, library blocked, found the game but
    no direct link (NAT/firewall, no relay yet), game full, host ended it, connection lost.
- **Picture quality**: the stream is 2x, so each game pixel is a 2x2 block and 4:2:0 chroma lines up with the art. The video track uses
  `contentHint 'detail'`, `degradationPreference 'maintain-resolution'`, maxBitrate 2.5 Mbit/s and 60 fps.
  - Measured on the guest: the change inside a game pixel is ~17-19% of the change across game pixels (a blurred stream would be ~100%).

### Files
New:
- `src/online.js`: the host half.
- `src/online-guest.js`: the guest page.
- `src/online-net.js`: the ONE module that knows PeerJS (host / join / send / onData / close / call). Swap it for our own signalling
  later.
- `src/online-ui.js`: the DOM boards.
- `src/online-peer-local.js`: a PeerJS-surface stand-in, used by tests only.
- `tools/online-stub.mjs`: the local relay for tests.
- `tools/online-coop.mjs`: the check.

Changed:
- `src/audio.js`: +1 line, `audioTap()`.
- `index.html`: the main.js script tag became a `?join=` switch. It still loads loading-screen.js first, so the loading-screen check's
  order holds.
- `tools/cdp.mjs`: `opts.args`, extra browser flags (backwards compatible).
- `tools/check.mjs`: `online-coop` wired in, with its header line.

### main.js hooks (all commented "ONLINE CO-OP")
| Line | Hook |
|---|---|
| src/main.js:206 | `import * as ONL from './online.js'` |
| src/main.js:6006-6008 | pollGamepad: when P2 is an online guest, `ONL.intoPlayer(players[1])` replaces the first pad, and P1 keeps gps[0] |
| src/main.js:6089-6092 | `ONL.init({...})`: the read/do API (buf, state, paused, coopOk, roster, arm = the co-op pick's confirm, drop = the pause menu's co-op off) |
| src/main.js:9754 | the title list gains `'ONLINE CO-OP'` after `'LOCAL CO-OP'` |
| src/main.js:27427 | the title row's action (`loadSlot` + `ONL.open()`, as LOCAL CO-OP loads the slot) |

## CHECKS (each run alone, PORT 8825)
- **online-coop: GREEN.** It uses two headless browsers, the local signalling stub, and real WebRTC. It proves:
  - the gate / lock;
  - a join by code, with the host's roster;
  - frames arrive: 640x360 with sound, pixelated, integer scale, crisp ratio 0.18;
  - guest keys move P2 and not P1;
  - the guest's OWN binding (Y=LEFT) works and the default it replaced does not;
  - jump, plus focus-loss release;
  - touch JUMP and touch d-pad drive P2;
  - HOST PAUSED banner, ping readout, volume;
  - disconnect drops P2 cleanly (the wood goes on, the room waits);
  - the guest's whole localStorage is byte-identical and there are no page errors.

  Its checks wait for outcomes rather than sleeping a fixed time, because the machine was at full load: one run saw a 981 ms ping, and an
  earlier fixed-sleep version flaked on the d-pad.
- **Other checks, all GREEN** (subset via tools/check.mjs, plus node --check of every changed file):
  - syntax: clean. The subset parses only uncommitted files, so every touched file was also run through node --check by hand.
  - modulepreload: 401 listed, 3 new modules not yet listed (budget 15).
  - dangling-paths, homepaths, uiscreens (no page errors), touch, save-slots: all green.
- **textfit title,menu --strict: GREEN.** 19 screens, 337 strings, every fault count 0. The title board now has 8 rows (with ONLINE CO-OP) and fits.

## KNOWN LIMITS
- **NAT / no TURN**: STUN only. Two networks that both block direct links (symmetric NAT, a lot of mobile data, office/school Wi-Fi)
  cannot connect, and the guest is told so after up to 20 s. A TURN relay (see Q2) is the fix.
- **Broker reliability**: 0.peerjs.com is a free shared service with no SLA. If it is down, nobody can START a session, and the screen
  says "CANNOT REACH THE MATCHMAKER". A session already joined survives the broker going away.
- **cdnjs**: PeerJS loads from cdnjs. If cdnjs is blocked or offline, the "CANNOT LOAD THE NETWORK LIBRARY" message is shown.
- **The PeerJS path itself is not covered by the automated check**: the check has no internet, so it uses the PeerJS-shaped local
  stand-in. The human test below covers the real broker.
- **Host tab must stay in front**: a hidden tab throttles requestAnimationFrame, which slows both the game and the stream.
- **Latency**: input lag = network RTT/2 + one video frame of encode/decode. That is fine on the same city/LAN; it is felt in combat
  across continents.
- **Guest touch layer details**:
  - skill buttons assume two slots and show no icons;
  - the interact button is always shown (as USE = talk);
  - touch auto-face / aim assists are not applied for the remote player.
- **Not built (phase 2)**: 4 players, colours/rings, hub, versus, AI companions. Map entry is title only (see Q3).
- **modulepreload**: the 3 new statically imported modules are within the 15 budget. `node tools/modulepreload.mjs --write` at release
  will list them; I left the block alone to avoid merge conflicts.

## ASSERTION CHANGES
None. No existing test was changed. `tools/cdp.mjs` gained an optional `opts.args`.

## HUMAN TEST (Daniel, two machines or two browsers; same Wi-Fi first, then one on phone data)
1. Machine A (the host): open the deploy or local dev URL. Use a save that owns 2+ heroes. On the title choose ONLINE CO-OP, then HOST
   A GAME, then COPY LINK, and send the link (or the 4-letter code).
2. Machine B (the guest): open the link. Or open the game, choose ONLINE CO-OP, type the code and press JOIN.
3. B picks a hero. A should land on the map. On A, enter any wood: P2 (B's hero) stands beside P1.
4. Look for:
   - **Lag**: B's moves should feel near-local on the same Wi-Fi. Note the PING on B's strip and A's chip.
   - **Blur**: B's picture should be as sharp as A's. Try B fullscreen, and on a phone.
   - **Audio**: B hears A's music and SFX after B's first key press or tap. B's ESC menu volume works.
   - **Pause**: A presses ESC, and B sees A's pause menu plus HOST PAUSED.
   - **Drop-out**: close B's tab. Within ~10 s, A's P2 vanishes and A's chip says P2 LEFT / WAITING. Reopen the link: B rejoins on the
     same code.
   - **Phone**: B on a phone in landscape. The touch buttons drive P2.
   - **Saves**: B's own save and map progress are unchanged afterwards (open B's game normally and check).
5. NAT test: B on phone mobile data and A on home Wi-Fi. If it fails, B should read "FOUND THE GAME, BUT NO DIRECT LINK" (this tells us
   whether TURN is needed).

## QUESTIONS FOR DANIEL (rec first; what I built)
1. **Hero art on the guest's pick screen?** Rec: yes in phase 2, by having the host send the baked hero preview frames. Built: name
   buttons only.
2. **Turn on a TURN relay?** Rec: yes, once the human NAT test shows failures. The cheapest option is PeerJS's own free TURN (already in
   PeerJS's defaults: one line in src/online-net.js `STUN`). Otherwise a paid Cloudflare/Twilio TURN, which needs a key and so a tiny
   serverless token endpoint. Built: STUN only, as the brief says.
3. **ONLINE CO-OP from the map too?** Rec: a map key/pill that opens the same board. The phase-2 tavern hub will be the real home. Built:
   title only. The ROOM chip reopens the board from anywhere once hosting.
4. **Remember the guest's stream volume?** Rec: yes, in its own key (`bracken.onlineVol`), not the save. Built: volume is not saved,
   so the guest page writes nothing at all.
5. **Own signalling later?** Rec: only if the free broker proves flaky in practice. online-net.js is the one file to swap (a Vercel
   function + short-lived codes, as the original brief had). Built: PeerJS broker (Daniel 10-10).
