import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { addResult } from './resultStore.js';
import { parse as parseDomain } from 'tldts';
import { isValidUrlLike } from './utils.js';

export async function extractRobotsTxt(baseUrl, targetBaseDomain) {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`);
    const text = await res.text();

    const matches = [...text.matchAll(/Disallow: (\/[^\s]*)/g)];
    for (const match of matches) {
      const path = match[1].trim();
      addResult({
        value: path,
        type: 'relative',
        source: 'robots'
      });
    }
  } catch (e) { }
}

export async function extractSitemap(baseUrl, targetBaseDomain) {
  try {
    const res = await fetch(`${baseUrl}/sitemap.xml`);
    const xml = await res.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].trim());

    for (const url of urls) {
      const parsed = new URL(url);
      if (parsed.hostname.endsWith(targetBaseDomain)) {
        addResult({
          value: url,
          type: 'external',
          source: 'sitemap'
        });
      }
    }
  } catch (e) {}
}

export async function extractWayback(domain, targetBaseDomain) {
  try {
    const res = await axios.get(`https://web.archive.org/cdx/search/cdx?url=${domain}/*&output=json&fl=original&collapse=urlkey`);
    const data = res.data;
    if (Array.isArray(data)) {
      data.slice(1).forEach(entry => {
        const cleaned = entry[0].trim().replace(/\\+$/, '');
        if (isValidUrlLike(cleaned, targetBaseDomain)) {
          addResult({
            value: cleaned,
            type: cleaned.startsWith('/') ? 'relative' : 'external',
            source: 'wayback'
          });
        }
      });
    }
  } catch (e) { /* ignore */ }
}
