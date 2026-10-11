// src/online-peer-local.js - A STAND-IN FOR THE PEERJS `Peer` CLASS, FOR THE TESTS ONLY (claude/onlinecoop). Loaded by src/online-net.js
// when the page is opened with ?net=local&relay=<port>: the free PeerJS broker is on the internet and the tests are not, so the hand-shake
// goes through tools/online-stub.mjs on localhost instead. It has the SAME SURFACE online-net.js uses of PeerJS 1.5 - new Peer(id?, opts),
// on('open'|'connection'|'call'|'error'|'close'|'disconnected'), connect(id, opts) -> a data link with on('open'|'data'|'close'|'error'),
// send, close, .open, .peer, .peerConnection; call(id, stream) -> a media link with on('stream'|'close'|'error'), answer(), close(),
// .peerConnection; destroy() - and everything after the hand-shake is a real RTCPeerConnection, so the test drives real WebRTC: a real
// data channel, a real video track off the host's canvas, real audio. Nothing in the game imports this file.
class Emitter {
  constructor() { this._h = {}; }
  on(ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); return this; }
  off(ev, fn) { this._h[ev] = (this._h[ev] || []).filter(f => f !== fn); return this; }
  emit(ev, ...a) { for (const fn of (this._h[ev] || []).slice()) { try { fn(...a); } catch (e) { console.error(e); } } }
}
const err = (type, message) => Object.assign(new Error(message || type), { type });

export function localPeer(base) {
  const post = (path, body) => fetch(base + path, { method: 'POST', body: JSON.stringify(body) });   /* a text/plain body: a "simple" request, no CORS preflight */

  class Link extends Emitter {
    constructor(peer, dst, cid, mine, kind) {
      super(); this.provider = peer; this.peer = dst; this.connectionId = cid; this.open = false; this._mine = mine; this.type = kind; this._done = false; this._cands = [];
      const pc = this.peerConnection = new RTCPeerConnection(peer.options.config || {});
      pc.onicecandidate = e => { if (e.candidate) peer._send(dst, 'CANDIDATE', { cid, candidate: e.candidate.toJSON() }); };
      pc.onconnectionstatechange = () => { const s = pc.connectionState; if (s === 'failed') { this.emit('error', err('negotiation-failed', 'the direct link could not be opened')); this.close(); } else if (s === 'closed') this.close(); };
    }
    async _remote(sdp) { await this.peerConnection.setRemoteDescription(sdp); for (const c of this._cands.splice(0)) await this.peerConnection.addIceCandidate(c).catch(() => {}); }
    _cand(c) { if (this.peerConnection.remoteDescription) this.peerConnection.addIceCandidate(c).catch(() => {}); else this._cands.push(c); }
    async _offer() { const pc = this.peerConnection, o = await pc.createOffer(); await pc.setLocalDescription(o); this.provider._send(this.peer, 'OFFER', { cid: this.connectionId, kind: this.type, sdp: pc.localDescription.toJSON() }); }
    async _answerTo(sdp) { const pc = this.peerConnection; await this._remote(sdp); const a = await pc.createAnswer(); await pc.setLocalDescription(a); this.provider._send(this.peer, 'ANSWER', { cid: this.connectionId, sdp: pc.localDescription.toJSON() }); }
    close() { if (this._done) return; this._done = true; this.open = false; try { if (this.dataChannel) this.dataChannel.close(); } catch {} try { this.peerConnection.close(); } catch {} this.provider._conns.delete(this.connectionId); this.emit('close'); }
  }
  class DataLink extends Link {
    constructor(peer, dst, cid, mine, opts) {
      super(peer, dst, cid, mine, 'data'); this.serialization = (opts && opts.serialization) || 'json'; this.reliable = true;
      if (mine) { this._dc(this.peerConnection.createDataChannel('bk', { ordered: true })); this._offer(); }
      else this.peerConnection.ondatachannel = e => this._dc(e.channel);
    }
    _dc(dc) { this.dataChannel = dc; dc.onopen = () => { this.open = true; this.emit('open'); }; dc.onmessage = e => { let d = e.data; try { d = JSON.parse(d); } catch {} this.emit('data', d); }; dc.onclose = () => this.close(); }
    send(d) { if (!this.open) throw err('not-open'); this.dataChannel.send(JSON.stringify(d)); }
  }
  class MediaLink extends Link {
    constructor(peer, dst, cid, mine, stream) {
      super(peer, dst, cid, mine, 'media'); this._got = null;
      this.peerConnection.ontrack = e => { const s = e.streams && e.streams[0]; if (s) { this.remoteStream = s; this.emit('stream', s); } };
      if (mine) { for (const t of stream.getTracks()) this.peerConnection.addTrack(t, stream); this.localStream = stream; this._offer(); }
    }
    answer(stream) { if (stream) for (const t of stream.getTracks()) this.peerConnection.addTrack(t, stream); this._answerTo(this._offerSdp).then(() => { this.open = true; }); }
  }

  return class LocalPeer extends Emitter {
    constructor(id, options) {
      super(); if (id && typeof id === 'object') { options = id; id = undefined; }
      this.options = options || {}; this.id = null; this.open = false; this.destroyed = false; this.disconnected = false; this._conns = new Map(); this._n = 0;
      post('/open', id ? { id } : {}).then(async r => {
        const b = await r.json().catch(() => ({}));
        if (!r.ok) { this.emit('error', err(b.type || 'server-error', 'id ' + id + ' is taken')); return; }
        this.id = b.id; this.open = true; this.emit('open', this.id); this._poll();
      }).catch(() => this.emit('error', err('network', 'the relay did not answer')));
    }
    async _poll() {
      while (!this.destroyed) {
        let list = [];
        try { const r = await fetch(base + '/poll?id=' + encodeURIComponent(this.id)); if (!r.ok) { this.disconnected = true; this.emit('disconnected', this.id); return; } list = await r.json(); }
        catch { await new Promise(r => setTimeout(r, 300)); continue; }
        for (const m of list) this._on(m);
      }
    }
    _on({ src, type, payload }) {
      const p = payload || {}; let c = this._conns.get(p.cid);
      if (type === 'OFFER') {
        if (p.kind === 'media') { c = new MediaLink(this, src, p.cid, false); c._offerSdp = p.sdp; this._conns.set(p.cid, c); this.emit('call', c); }
        else { c = new DataLink(this, src, p.cid, false, {}); this._conns.set(p.cid, c); c._answerTo(p.sdp); this.emit('connection', c); }
      } else if (type === 'ANSWER' && c) c._remote(p.sdp);
      else if (type === 'CANDIDATE' && c) c._cand(p.candidate);
    }
    _send(dst, type, payload) {
      if (this.destroyed) return;
      post('/send', { src: this.id, dst, type, payload }).then(r => {
        if (r.status === 404) { const c = this._conns.get(payload.cid); this.emit('error', err('peer-unavailable', 'Could not connect to peer ' + dst)); if (c) c.close(); }
      }).catch(() => this.emit('error', err('network', 'the relay did not answer')));
    }
    connect(dst, opts) { const cid = 'dc_' + this.id + '_' + (++this._n), c = new DataLink(this, dst, cid, true, opts); this._conns.set(cid, c); return c; }
    call(dst, stream) { const cid = 'mc_' + this.id + '_' + (++this._n), c = new MediaLink(this, dst, cid, true, stream); this._conns.set(cid, c); return c; }
    reconnect() {}
    destroy() { if (this.destroyed) return; for (const c of [...this._conns.values()]) c.close(); this.destroyed = true; this.open = false; if (this.id) post('/close', { id: this.id }).catch(() => {}); this.emit('close'); }
  };
}
