// A Unix orphan is adopted by init (PID 1); that living adopter is not the tool that owned the browser.
export function parentLives(child, byPid, platform = process.platform) {
  if (platform !== 'win32' && child.ppid === 1) return false;
  const parent = byPid.get(child.ppid);
  return !!parent && !(parent.born && child.born && parent.born > child.born);
}
