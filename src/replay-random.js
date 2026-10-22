// Default forwards to the game's original random stream. Only explicit capture owns these dice.
let next = null;
export const audioRandom = () => next ? next() : Math.random();
export function replayAudioRandom(fn) { next = fn || null; }
