// Cloud diagnostic only. Weak references allow the original collector to retire canvases.
export function installReturnedSheetOwnerObserver() {
  const prototype = HTMLCanvasElement.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'getContext');
  const width = Object.getOwnPropertyDescriptor(prototype, 'width').get;
  const height = Object.getOwnPropertyDescriptor(prototype, 'height').get;
  const apply = Reflect.apply;
  const seen = new WeakSet();
  const records = [];
  const callers = [];
  const callerIds = new Map();
  let failures = 0;

  function observedGetContext(...args) {
    const context = apply(descriptor.value, this, args);
    if (context && args[0] === '2d' && !seen.has(this)) {
      try {
        seen.add(this);
        const stack = (new Error().stack || '').split('\n').slice(2)
          .filter(line => line.includes('/src/')).slice(0, 6).join('\n');
        let caller = callerIds.get(stack);
        if (caller === undefined) {
          caller = callers.length;
          callerIds.set(stack, caller);
          callers.push(stack);
        }
        records.push({ canvas: new WeakRef(this), caller });
      } catch {
        failures++;
      }
    }
    return context;
  }

  Object.defineProperty(prototype, 'getContext', { ...descriptor, value: observedGetContext });
  window.__returnedSheetOwners = {
    snapshot() {
      const groups = new Map();
      let collected = 0;
      for (const record of records) {
        const canvas = record.canvas.deref();
        if (!canvas) {
          collected++;
          continue;
        }
        const w = apply(width, canvas, []);
        const h = apply(height, canvas, []);
        let row = groups.get(record.caller);
        if (!row) {
          row = { caller: callers[record.caller], live: 0, empty: 0, logicalPixels: 0, dimensions: {} };
          groups.set(record.caller, row);
        }
        row.live++;
        if (!w || !h) row.empty++;
        row.logicalPixels += w * h;
        const size = w + 'x' + h;
        row.dimensions[size] = (row.dimensions[size] || 0) + 1;
      }
      return { totalCreated: records.length, collected, failures,
        strongCanvasReferencesRetained: 0, groups: [...groups.values()] };
    },
    restore() {
      Object.defineProperty(prototype, 'getContext', descriptor);
      return Object.getOwnPropertyDescriptor(prototype, 'getContext').value === descriptor.value;
    }
  };
}
