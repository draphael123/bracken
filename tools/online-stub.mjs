// tools/online-stub.mjs - ONLINE CO-OP'S LOCAL SIGNALLING STUB (claude/onlinecoop). The tests have no internet, so the free PeerJS broker
// (0.peerjs.com) is out of reach; this is a few dozen lines of relay that does the broker's one job - carry an offer, an answer and the ICE
// candidates from one peer id to another - over plain HTTP on localhost. The page side is src/online-peer-local.js, a stand-in for the
// PeerJS `Peer` class with the same surface, chosen by ?net=local&relay=<port>. After the hand-shake everything is real WebRTC, peer to peer.
//   node tools/online-stub.mjs [port]      (default 8826)   - or import { startStub } and call it from a tool
//   POST /open  {id?}            -> {id}  (409 {type:'unavailable-id'} when the id is taken)
//   POST /send  {src,dst,type,payload} -> {ok} (404 {type:'peer-unavailable'} when nobody holds dst)
//   GET  /poll?id=X              -> [messages] (waits up to 1 s for one)
//   POST /close {id}
import http from 'node:http';

export function startStub(port = 8826) {
  const peers = new Map();   // id -> { q: [], wait: null, seen }
  const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
  const flush = p => { if (p.wait && p.q.length) { const w = p.wait; p.wait = null; clearTimeout(w.t); json(w.res, 200, p.q.splice(0)); } };
  const server = http.createServer((req, res) => {
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'GET, POST' }); return res.end(); }
    const url = new URL(req.url, 'http://x'); let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let m = {}; try { m = body ? JSON.parse(body) : {}; } catch { return json(res, 400, { type: 'bad-json' }); }
      if (url.pathname === '/open') {
        const id = m.id || 'p' + Math.random().toString(36).slice(2, 10);
        if (peers.has(id)) return json(res, 409, { type: 'unavailable-id' });
        peers.set(id, { q: [], wait: null, seen: Date.now() }); return json(res, 200, { id });
      }
      if (url.pathname === '/send') {
        const p = peers.get(m.dst); if (!p) return json(res, 404, { type: 'peer-unavailable' });
        p.q.push({ src: m.src, type: m.type, payload: m.payload }); flush(p); return json(res, 200, { ok: true });
      }
      if (url.pathname === '/poll') {
        const p = peers.get(url.searchParams.get('id')); if (!p) return json(res, 404, { type: 'gone' });
        p.seen = Date.now(); if (p.wait) { clearTimeout(p.wait.t); json(p.wait.res, 200, []); }
        if (p.q.length) return json(res, 200, p.q.splice(0));
        p.wait = { res, t: setTimeout(() => { if (p.wait && p.wait.res === res) { p.wait = null; json(res, 200, []); } }, 1000) }; return;
      }
      if (url.pathname === '/close') { const p = peers.get(m.id); if (p && p.wait) { clearTimeout(p.wait.t); json(p.wait.res, 200, []); } peers.delete(m.id); return json(res, 200, { ok: true }); }
      json(res, 404, { type: 'no-route' });
    });
  });
  /* a page that went away without saying so (a closed tab) stops polling: its id is freed after 10 s, as the broker does */
  const sweep = setInterval(() => { const now = Date.now(); for (const [id, p] of peers) if (!p.wait && now - p.seen > 10000) peers.delete(id); }, 2000); sweep.unref();
  return new Promise((res, rej) => { server.once('error', rej); server.listen(port, '127.0.0.1', () => res({ port, peers, close: () => new Promise(r => { clearInterval(sweep); for (const p of peers.values()) if (p.wait) { clearTimeout(p.wait.t); try { p.wait.res.end('[]'); } catch {} } server.close(() => r()); server.closeAllConnections && server.closeAllConnections(); }) })); });
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const port = +(process.argv[2] || process.env.ONLINE_RELAY || 8826);
  startStub(port).then(() => console.log('online-stub: relay on http://127.0.0.1:' + port));
}
