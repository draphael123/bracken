// audit-ui harness: wraps the repo's tools/cdp.mjs. Usage: import { open } from './lib.mjs'
import { writeFileSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
export const WT = 'C:/Users/Daniel Raphael/.claude/bracken-lanes/bracken-artaudit';
const { openPage } = await import(pathToFileURL(WT + '/tools/cdp.mjs').href);
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function open(profile, opts = {}) {
  const pg = await openPage({ audio: false, fonts: opts.fonts !== false ? true : false, noWait: !!opts.noWait });
  const out = 'C:/Users/Daniel Raphael/.claude/bracken-lanes/bracken-artaudit/work/claude/artaudit/' + profile + '/'; mkdirSync(out, { recursive: true });
  const phone = profile.startsWith('phone');
  if (phone) {
    const portrait = profile === 'phone-portrait';
    await pg.send('Emulation.setDeviceMetricsOverride', portrait ? { width: 412, height: 915, deviceScaleFactor: 2.625, mobile: true } : { width: 915, height: 412, deviceScaleFactor: 2.625, mobile: true, screenOrientation: { type: 'landscapePrimary', angle: 90 } });
    await pg.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  } else await pg.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  const E = (e, t = 300000) => pg.evalp(e, t);
  const shot = async name => { const r = await pg.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(out + name + '.png', Buffer.from(r.result.data, 'base64')); console.log(profile, 'wrote', name); };
  return { pg, E, shot, out, phone, send: pg.send };
}
export async function reboot(h, q = '') { // fresh page with touch/no-sw params, wait for BK
  const { pg, E } = h;
  await pg.send('Page.navigate', { url: 'http://localhost:' + pg.PORT + '/?' + (h.phone ? 'touch=1&' : '') + 'nosw=1' + q }, 120000);
  await sleep(1500);
  for (let i = 0; i < 400 && !(await E('typeof window.BK === "object" && !!window.BK.lookPass', 3000).catch(() => false)); i++) await sleep(300);
  await sleep(800);
  if (!/noaudio/.test(q) && !h.noAudio) for (const type of ['keyDown','keyUp']) await pg.send('Input.dispatchKeyEvent',{type,key:'F8',code:'F8',windowsVirtualKeyCode:119});
}
