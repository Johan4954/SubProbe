import {parse as parseDomain} from "tldts";

export function normalizeUrlPath(url) {
  try {
    const u = new URL(url, 'https://placeholder.com');
    let path = u.pathname.replace(/\/+$/, '');
    if (path === '') path = '/';
    return `${path}`;
  } catch {
    return url.replace(/\?\*$/, '').replace(/\/+$/, '');
  }
}

export function logWhilePaused(bar, msg) {
  bar.stop();
  console.log(msg);
  bar.start(bar.getTotal(), bar.value, bar.payload);
}

export function isValidUrlLike(str, targetBaseDomain = null) {
  if (!str || str.length < 5) return false;

  const invalidPatterns = ['http', 'https', '://', '\\', '//', '.js', '.css', '.png', '.svg'];
  const cleaned = str
  .trim()
  .replace(/[\s\\;]+$/, '')
  .replace(/\?*$/, '')
  .toLowerCase();

  if (invalidPatterns.some(p => cleaned === p || cleaned.endsWith(p))) return false;

  try {
    if (cleaned.startsWith('/')) return true;

    const url = new URL(cleaned);
    const parsed = parseDomain(url.hostname);
    if (!parsed || !parsed.domain || !parsed.publicSuffix) return false;

    const full = `${parsed.domain}.${parsed.publicSuffix}`;
    return !(targetBaseDomain && full !== targetBaseDomain);


  } catch {
    return false;
  }
}