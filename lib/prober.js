import axios from 'axios';
import { parse as parseDomain } from 'tldts';

export async function probeResult(result, baseUrl) {
  let finalUrl = result.value;

  if (result.type === 'relative') {
    try {
      const base = new URL(baseUrl);
      finalUrl = `${base.protocol}//${base.host}${result.value}`;
    } catch {
      result.reachable = false;
      result.status = 0;
      return result;
    }
  }

  try {
    const testUrl = new URL(finalUrl);
    const parsed = parseDomain(testUrl.hostname);
    if (!parsed || !parsed.domain) {
      result.reachable = false;
      result.status = 0;
      return result;
    }
  } catch {
    result.reachable = false;
    result.status = 0;
    return result;
  }

  try {
    const res = await axios.get(finalUrl, { 
      timeout: 5000,
      validateStatus: () => true,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    result.reachable = true;
    result.status = res.status;
  } catch (err) {
    try {
      // Intentar con HEAD como fallback
      const res = await axios.head(finalUrl, { 
        timeout: 3000, 
        validateStatus: () => true,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      result.reachable = true;
      result.status = res.status;
    } catch (e) {
      result.reachable = false;
      result.status = 0;
    }
  }

  return result;
}
