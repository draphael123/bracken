// Component prototype. No game module imports this boundary.
export function makeSpriteView(target, pending, build) {
  const building = new Set();
  function materialize(key) {
    if (!pending.has(key)) return;
    if (building.has(key)) throw new TypeError('Reentrant sprite build');
    building.add(key);
    try {
      const value = build(pending.get(key));
      if (!Reflect.defineProperty(target, key, { value })) {
        throw new TypeError('Cannot publish sprite');
      }
      pending.delete(key);
    } finally {
      building.delete(key);
    }
  }

  function materializeAll() {
    for (const key of Reflect.ownKeys(target)) materialize(key);
  }

  // Keep each deferred key as a writable data property on the private target.
  // Publish before any operation can lock in a placeholder.
  return new Proxy(target, {
    get(object, key, receiver) {
      materialize(key);
      return Reflect.get(object, key, receiver);
    },
    getOwnPropertyDescriptor(object, key) {
      materialize(key);
      return Reflect.getOwnPropertyDescriptor(object, key);
    },
    defineProperty(object, key, descriptor) {
      materialize(key);
      return Reflect.defineProperty(object, key, descriptor);
    },
    deleteProperty(object, key) {
      const removed = Reflect.deleteProperty(object, key);
      if (removed) pending.delete(key);
      return removed;
    },
    preventExtensions(object) {
      materializeAll();
      return Reflect.preventExtensions(object);
    },
    setPrototypeOf(object, prototype) {
      materializeAll();
      return Reflect.setPrototypeOf(object, prototype);
    },
  });
}
