// Diagnostic only: allocation attribution at the existing boundaries between complete fights.
import { writeFileSync, mkdirSync } from 'node:fs';
export async function nativeMemoryTrace(pg) {
  mkdirSync('gate-data', { recursive: true });
  const info = await (await fetch('http://127.0.0.1:' + pg.dbg + '/json/version')).json();
  const ws = new WebSocket(info.webSocketDebuggerUrl), pending = new Map(), dumps = [], samples = [];
  let id = 0, completed = () => {}, active = false;
  const save = () => writeFileSync('gate-data/native-memory-trace.json', JSON.stringify({ time: new Date().toISOString(), samples, dumps }, null, 2) + '\n');
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => {
    const m = JSON.parse(event.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === 'Tracing.tracingComplete') completed();
    if (m.method !== 'Tracing.dataCollected') return;
    for (const e of m.params.value || []) {
      const d = e.args?.dumps; if (!d) continue;
      const allocators = Object.entries(d.allocators || {}).map(([name, value]) => ({
        name, size: value.attrs?.size?.value ? parseInt(value.attrs.size.value, 16) : null,
        objects: value.attrs?.object_count?.value ? parseInt(value.attrs.object_count.value, 16) : null,
      })).filter(x => x.size).sort((a, b) => b.size - a.size).slice(0, 60);
      dumps.push({ pid: e.pid, guid: e.id, timestamp: e.ts, name: e.name, totals: d.process_totals, allocators });
    }
    save();
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const key = ++id; const timer = setTimeout(() => { pending.delete(key); reject(new Error(method + ' timed out')); }, 15000);
    pending.set(key, { resolve: v => { clearTimeout(timer); resolve(v); }, reject: e => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id: key, method, params }));
  });
  process.on('exit', save);
  return {
    async sample(label) {
      const heapResponse = await pg.send('Runtime.getHeapUsage'), heap = heapResponse.result || heapResponse;
      const finished = new Promise(resolve => { completed = resolve; });
      const before = dumps.length;
      await send('Tracing.start', { categories: '-*,disabled-by-default-memory-infra', transferMode: 'ReportEvents', options: 'record-until-full' }); active = true;
      const dump = await send('Tracing.requestMemoryDump', { levelOfDetail: 'detailed', deterministic: true });
      await send('Tracing.end');
      await Promise.race([finished, new Promise((_,reject) => setTimeout(() => reject(new Error('memory trace did not flush')), 10000))]); active = false;
      samples.push({ label, time: new Date().toISOString(), heap, dump, flushedDumps: dumps.length - before }); save();
      if (dumps.length === before) throw new Error('memory dump acknowledged without readable allocation data');
      console.log('MEMORY_ROW ' + label + ' heap=' + Math.round(heap.usedSize / 1048576) + 'MB backing=' + Math.round((heap.backingStorageSize || 0) / 1048576) + 'MB');
    },
    async close() {
      if (active) try { await send('Tracing.end'); } catch {}
      save(); ws.close();
    },
  };
}
