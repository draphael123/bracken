// Metadata follows existing live art; this holds no additional sprite sets alive.
const inputsOf = new WeakMap();
export function reuseCurrentHeroBake(current, inputs, build) {
  const key = JSON.stringify(inputs);
  if (current && inputsOf.get(current) === key) return current;
  const next = build();
  inputsOf.set(next, key);
  return next;
}
