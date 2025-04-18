import axios from 'axios';
import * as cheerio from 'cheerio';
import chalk from 'chalk';

export async function fetchHTML(url) {
  try {
    const res = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return res.data;
  } catch (error) {
    return '';
  }
}

export async function extractJSLinks(html, baseUrl) {
  try {
    const $ = cheerio.load(html);
    const scripts = [];

    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src) return;
      
      if (src.startsWith('http')) {
        scripts.push(src);
      } else {
        try {
          const full = new URL(src, baseUrl).href;
          scripts.push(full);
        } catch (e) {
        }
      }
    });

    return scripts;
  } catch (error) {
    return [];
  }
}

export async function fetchJS(url) {
  try {
    const displayUrl = url.split('?')[0];
    
    const res = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*'
      },
      validateStatus: function(status) {
        return status >= 200 && status < 400;
      }
    });
    
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('javascript') && 
        !contentType.includes('application/x-javascript') && 
        !contentType.includes('text/plain') &&
        !contentType.includes('text/') && 
        res.data.toString().indexOf('function') === -1 && 
        res.data.toString().indexOf('var ') === -1) {
    }
    
    let jsContent = res.data;
    if (typeof jsContent !== 'string') {
      jsContent = String(jsContent);
    }
    
    return jsContent;
  } catch (error) {
    return '';
  }
}
