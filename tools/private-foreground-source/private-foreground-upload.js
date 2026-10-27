import {canvas} from './px.js';
const fresh = new WeakSet();
let source = null, uploaded = null;
const native = fn => typeof fn === 'function' && /\[native code\]/.test(Function.prototype.toString.call(fn));
let pipelineClosed = true, requests = 0, uses = 0, builds = 0;
export function checkForegroundPipeline(g) {
  const p = HTMLCanvasElement.prototype, width = Object.getOwnPropertyDescriptor(p, 'width'), height = Object.getOwnPropertyDescriptor(p, 'height');
  if (![document.createElement, p.getContext, width.get, width.set, height.get, height.set, CanvasRenderingContext2D.prototype.drawImage, ...(g ? [g.drawImage] : [])].every(native)) { pipelineClosed = false; clearForegroundUpload(); }
  return pipelineClosed;
}
export function freshForeground(build) { const eligible = checkForegroundPipeline(), c = build(); if (eligible) fresh.add(c); return c; }
export function clearForegroundUpload() { if (uploaded) uploaded.width = uploaded.height = 0; source = uploaded = null; }
export function foregroundUploadInfo() { return {pipelineClosed,requests,uses,builds,pixels:uploaded ? uploaded.width * uploaded.height : 0}; }
export function privateForegroundFor(g, c, frame) {
  requests++;
  const frameAttributes = frame?.getContextAttributes();
  if (!frameAttributes || frameAttributes.willReadFrequently || !frameAttributes.alpha || frameAttributes.colorSpace !== 'srgb' || (frameAttributes.colorType && frameAttributes.colorType !== 'unorm8') || frame.isContextLost()) return c;
  const a = g.getContextAttributes();
  if (!pipelineClosed || !fresh.has(c) || !c.width || !c.height || c.width * c.height > 1048576 ||
      !native(document.createElement) || !native(g.drawImage) || !native(HTMLCanvasElement.prototype.getContext) ||
      a.willReadFrequently || !a.alpha || a.colorSpace !== 'srgb' || (a.colorType && a.colorType !== 'unorm8') || g.isContextLost()) return c;
  if (source === c && uploaded && uploaded.width === c.width && uploaded.height === c.height && !uploaded.getContext('2d').isContextLost()) { uses++; return uploaded; }
  clearForegroundUpload();
  const sg = c.getContext('2d'), sa = sg?.getContextAttributes();
  if (!sa || !sa.willReadFrequently || !sa.alpha || sa.colorSpace !== 'srgb' || (sa.colorType && sa.colorType !== 'unorm8') || sg.isContextLost()) return c;
  const [copy, cg] = canvas(c.width, c.height, true), ca = cg.getContextAttributes();
  if (ca.willReadFrequently || !ca.alpha || ca.colorSpace !== 'srgb' || (ca.colorType && ca.colorType !== 'unorm8')) { copy.width = copy.height = 0; return c; }
  cg.drawImage(c, 0, 0); source = c; uploaded = copy; uses++; builds++; return copy;
}
