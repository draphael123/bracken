// src/online-net.js - ONLINE CO-OP'S WIRE (claude/onlinecoop, phase 1). THE ONE MODULE THAT KNOWS ABOUT PEERJS: host, join, send, onData,
// close, and the one media call. Swap this file (and nothing else) for our own signalling later.
//
// HOW IT CONNECTS. PeerJS's free public broker (0.peerjs.com: no server of ours, no account, no keys) only introduces the two browsers: the
// HOST takes the peer id 'bracken-<CODE>', the GUEST asks the broker for that id, and from then on it is WebRTC, PEER TO PEER - a data
// channel for the guest's keys and the pings, and one media call that carries the host's picture and sound. ICE uses FREE PUBLIC STUN
// ONLY - no TURN relay (PeerJS 1.5 ships its own free TURN in its defaults; we replace the whole list, see the report's questions) - so two
// networks that both refuse a direct path (strict NAT, some mobile data, office firewalls) cannot meet, and explain() says exactly that.
//
// THE LIBRARY. PeerJS 1.5.5, pinned, from cdnjs, with its sub-resource-integrity hash: fetched only when somebody opens ONLINE CO-OP, never
// at boot. ?net=local&relay=<port> swaps it for src/online-peer-local.js (the same surface over tools/online-stub.mjs) for the tests.
export const PEERJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.5/peerjs.min.js';
const PEERJS_SRI = 'sha512-XEKeWX+mI3Ov+tg2evDlVQFzVOIp4T8J3cNcCEPaEUGpxJV3eZaN8rHuvnFPvQpGJBHPmrozJDMpm2xcDvtmyQ==';
export const ID_PREFIX = 'bracken-';
export const STUN = [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }];
const LINK_TIMEOUT = 20000;   // ms the guest waits for the direct link before it calls it a NAT failure

/* THE ROOM CODE: four letters, no I and no O (they read as 1 and 0 when somebody says them out loud) */
const ABC = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export const newCode = (n = 4) => { const a = new Uint32Array(n); (crypto.getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 1e9; })); return [...a].map(x => ABC[x % ABC.length]).join(''); };
export const cleanCode = s => { s = String(s || ''); const m = s.match(/[?&#]join=([A-Za-z]+)/i); if (m) s = m[1]; else if (/:\/\/|\.(app|com|net|io)\b|\//i.test(s)) s = (s.match(/[A-Za-z]{4,6}(?=[^A-Za-z]*$)/) || [''])[0];   /* (Daniel 10-15) a pasted LINK is read as its join= code, not its first letters (HTTPS) */
  return s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6); };

const local = () => { const q = new URLSearchParams(location.search); return q.get('net') === 'local' ? +(q.get('relay') || 8826) : 0; };
let PeerCls = null, loading = null;
async function peerClass() {
  if (PeerCls) return PeerCls;
  const port = local();
  if (port) { const m = await import('./online-peer-local.js'); return (PeerCls = m.localPeer('http://127.0.0.1:' + port)); }
  if (!window.Peer) await (loading = loading || new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = PEERJS_URL; s.integrity = PEERJS_SRI; s.crossOrigin = 'anonymous'; s.referrerPolicy = 'no-referrer';
    s.onload = res; s.onerror = () => { loading = null; s.remove(); rej(Object.assign(new Error('library'), { type: 'library' })); }; document.head.appendChild(s);
  }));
  return (PeerCls = window.Peer);
}
const options = () => ({ debug: 0, config: { iceServers: STUN } });

/* WHAT WENT WRONG, in the player's words: a short title and the why */
export function kindOf(e) {
  const t = e && e.type;
  if (t === 'peer-unavailable') return 'nogame';
  if (t === 'unavailable-id') return 'taken';
  if (t === 'browser-incompatible') return 'browser';
  if (t === 'library') return 'library';
  if (t === 'webrtc' || t === 'negotiation-failed' || t === 'p2p') return 'p2p';
  if (['network', 'server-error', 'socket-error', 'socket-closed', 'ssl-unavailable', 'invalid-key', 'disconnected'].includes(t)) return 'broker';
  return 'other';
}
export function explain(kind, code) {
  return ({
    nogame: ['NO GAME WITH CODE ' + (code || '?'), 'Nobody is hosting that code right now: the host may have closed it, or a letter is wrong. Codes are four letters, no I or O.'],
    broker: ['CANNOT REACH THE MATCHMAKER', 'The free public PeerJS broker (0.peerjs.com) introduces the two players. It did not answer: check this device\'s internet, or try again in a minute (the free service is sometimes down).'],
    library: ['CANNOT LOAD THE NETWORK LIBRARY', 'PeerJS comes from cdnjs.cloudflare.com and it did not load: this device may be offline, or something (a blocker, a school or office filter) is stopping it.'],
    browser: ['THIS BROWSER CANNOT DO IT', 'Online co-op needs WebRTC, which this browser does not offer. Chrome, Edge, Firefox or Safari will.'],
    p2p: ['FOUND THE GAME, BUT NO DIRECT LINK', 'The two networks would not let a peer-to-peer connection through (a strict NAT or firewall - common on mobile data, office and school Wi-Fi). There is no relay server yet. Try both players on home Wi-Fi, or one of you on a different network.'],
    full: ['THAT GAME IS FULL', 'The host already has a player two. Phase one of online co-op is two players.'],
    ended: ['THE HOST ENDED THE GAME', 'The host closed the room. Ask them for a new code.'],
    lost: ['CONNECTION LOST', 'The link to the host dropped (their game closed, or one of the networks went away).'],
    taken: ['CODE IN USE', 'That room code is taken.'],
    locked: ['CO-OP IS LOCKED', 'CO-OP OPENS WITH YOUR SECOND HERO. BUY ONE IN THE STORE: HEROES, 10 SILVER.'],
  })[kind] || ['SOMETHING WENT WRONG', 'The connection failed for a reason the game did not recognise. Try again.'];
}

/* A DATA LINK, wrapped: the game sees send / onData / onClose / close and a ping, never PeerJS */
function wrapLink(conn) {
  const L = { id: conn.peer, open: !!conn.open, why: '', onOpen: null, onData: null, onClose: null,
    send(m) { if (conn.open) { try { conn.send(m); return true; } catch {} } return false; },
    close(why) { if (L.closed) return; L.why = L.why || why || 'closed'; try { conn.close(); } catch {} done(); },
    pc: () => conn.peerConnection || null, closed: false };
  const done = () => { if (L.closed) return; L.closed = true; L.open = false; if (L.onClose) L.onClose(L.why || 'closed'); };
  conn.on('open', () => { L.open = true; if (L.onOpen) L.onOpen(); });
  conn.on('data', d => { if (L.onData && d && typeof d === 'object') L.onData(d); });
  conn.on('close', () => done());
  conn.on('error', e => { L.why = kindOf(e) === 'p2p' ? 'p2p' : 'lost'; done(); });
  /* ICE GAVE UP: say so as the NAT failure it is, not as a plain close */
  const watch = setInterval(() => { const pc = conn.peerConnection; if (L.closed) { clearInterval(watch); return; } if (pc && pc.iceConnectionState === 'failed') { L.why = 'p2p'; clearInterval(watch); L.close('p2p'); } }, 500);
  return L;
}

/* THE PICTURE STAYS SHARP: the stream is the game's own pixels at 2x, so it is told to keep its resolution and given room to (2.5 Mbit/s) */
export function tuneVideo(pc, maxBitrate = 2500000) {
  let n = 0; const go = () => { if (!pc || pc.signalingState === 'closed' || n++ > 40) return;
    const s = pc.getSenders().find(x => x.track && x.track.kind === 'video'); const p = s && s.getParameters();
    if (!p || !p.encodings || !p.encodings.length) { setTimeout(go, 250); return; }
    p.encodings[0].maxBitrate = maxBitrate; p.encodings[0].maxFramerate = 60; p.degradationPreference = 'maintain-resolution';
    s.setParameters(p).catch(() => {}); };
  go();
}

/* THE HOST: claims bracken-<code> on the broker and waits. h: { onReady(code), onGuest(link), onError(kind, code) } */
export async function host(code, h) {
  let Peer; try { Peer = await peerClass(); } catch (e) { h.onError(kindOf(e), code); return null; }
  if (typeof RTCPeerConnection === 'undefined') { h.onError('browser', code); return null; }
  const peer = new Peer(ID_PREFIX + code, options());
  let ready = false;
  peer.on('open', () => { ready = true; h.onReady(code); });
  peer.on('connection', conn => h.onGuest(wrapLink(conn)));
  peer.on('error', e => { const k = kindOf(e); if (k === 'nogame') return; /* (a call to a guest who has gone: the link's own close says it) */ if (ready && k === 'broker') return; /* the broker dropped after the room opened: links already made stay up */ h.onError(k, code); });
  peer.on('disconnected', () => { setTimeout(() => { try { if (!peer.destroyed) peer.reconnect(); } catch {} }, 2000); });   /* back on the broker, so a guest who drops can come back on the same code */
  return {
    code,
    /* the picture and the sound, to that guest: a media call he answers without sending anything back */
    call(link, stream) { const mc = peer.call(link.id, stream); const pc = () => mc.peerConnection; const t = setInterval(() => { if (pc()) { clearInterval(t); tuneVideo(pc()); } }, 100); setTimeout(() => clearInterval(t), 10000); return { close() { try { mc.close(); } catch {} clearInterval(t); }, pc }; },
    close() { try { peer.destroy(); } catch {} },
  };
}

/* THE GUEST: an anonymous id, then a data link to bracken-<code>; the host calls back with the picture. h: { onLink(link), onStream(stream), onError(kind, code) } */
export async function join(code, h) {
  let Peer; try { Peer = await peerClass(); } catch (e) { h.onError(kindOf(e), code); return null; }
  if (typeof RTCPeerConnection === 'undefined') { h.onError('browser', code); return null; }
  const peer = new Peer(options());
  let link = null, failed = false;
  const fail = k => { if (failed) return; failed = true; h.onError(k, code); };
  peer.on('open', () => {
    link = wrapLink(peer.connect(ID_PREFIX + code, { reliable: true, serialization: 'json' }));
    h.onLink(link);
    setTimeout(() => { if (link && !link.open && !link.closed && !failed) { link.why = 'p2p'; link.close('p2p'); } }, LINK_TIMEOUT);
  });
  peer.on('call', mc => { mc.answer(); mc.on('stream', s => h.onStream(s)); });
  peer.on('error', e => { const k = kindOf(e); if (link && link.open && k === 'broker') return; /* the broker can go; the direct link stays */ fail(k); });
  return { close() { try { peer.destroy(); } catch {} } };
}
