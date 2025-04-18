import chalk from 'chalk';
import ora from 'ora';
import cliProgress from 'cli-progress';
import { parse as parseDomain } from 'tldts';
import { fetchHTML, extractJSLinks, fetchJS } from './downloader.js';
import { parseJS } from './parser.js';
import { addResult, getAllResults } from './resultStore.js';
import { probeResult } from './prober.js';
import { exportResults } from './exporter.js';
import {
  extractRobotsTxt,
  extractSitemap,
  extractWayback
} from './externalSources.js';
import { isValidUrlLike, normalizeUrlPath, logWhilePaused } from './utils.js';
export { extractJSInfo };

const stats = {
  totalJS: 0,
  parsedJS: 0,
  endpoints: 0,
  urls: 0
};

let globalOpts = { silent: false };

function updateLine(message) {
  if (!globalOpts.silent) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(message);
  }
}

function printProgress(message) {
  if (!globalOpts.silent) {
    console.log(chalk.blue(`\n[${new Date().toLocaleTimeString()}] ${message}`));
  }
}

function parseStatusFilter(filterString) {
  const set = new Set();
  const parts = filterString.split(',').map(s => s.trim());

  for (const part of parts) {
    if (/^\d{3}$/.test(part)) {
      set.add(Number(part));
    } else if (/^\dxx$/i.test(part)) {
      const prefix = parseInt(part[0], 10);
      for (let i = prefix * 100; i < (prefix + 1) * 100; i++) {
        set.add(i);
      }
    } else if (/^\d{3}-\d{3}$/.test(part)) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        set.add(i);
      }
    }
  }

  return set;
}

function walkASTForCalls(ast, callback) {
  const queue = [ast];
  while (queue.length) {
    const node = queue.shift();
    if (!node || typeof node !== 'object') continue;

    if (node.type === 'CallExpression') callback(node);
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        queue.push(node[key]);
      }
    }
  }
}

function extractJSInfo(ast, targetBaseDomain) {
  if (!ast) {
    return 0;
  }

  const raw = JSON.stringify(ast);
  let count = 0;
  let foundUrls = {
    static: 0,
    fetch: 0,
    axios: 0,
    xmlhttp: 0
  };

  // static strings
  try {
    raw.match(/"([^"]+)"/g)?.forEach(str => {
      const clean = str.replaceAll('"', '').trim().replace(/\\+$/, '');
      if (isValidUrlLike(clean, targetBaseDomain)) {
        foundUrls.static++;
        count++;
        stats.endpoints++;
        addResult({
          value: normalizeUrlPath(clean),
          type: clean.startsWith('/') ? 'relative' : 'external',
          source: 'static'
        });
      }
    });
  } catch (e) {
    // Silent error
  }

  try {
    walkASTForCalls(ast, (node) => {
      if (node.callee?.name === 'fetch' && node.arguments[0]?.type === 'Literal') {
        const rawVal = node.arguments[0].value;
        if (typeof rawVal === 'string' && isValidUrlLike(rawVal, targetBaseDomain)) {
          foundUrls.fetch++;
          count++;
          stats.endpoints++;
          addResult({
            value: normalizeUrlPath(rawVal),
            type: rawVal.startsWith('/') ? 'relative' : 'external',
            source: 'fetch'
          });
        }
      }

      if (node.callee?.type === 'MemberExpression' &&
          node.callee.object?.name === 'axios' &&
          node.arguments[0]?.type === 'Literal') {
        const rawVal = node.arguments[0].value;
        if (typeof rawVal === 'string' && isValidUrlLike(rawVal, targetBaseDomain)) {
          foundUrls.axios++;
          count++;
          stats.endpoints++;
          addResult({
            value: normalizeUrlPath(rawVal),
            type: rawVal.startsWith('/') ? 'relative' : 'external',
            source: 'axios'
          });
        }
      }

      if (node.callee?.type === 'MemberExpression' &&
          node.callee.property?.name === 'open' &&
          node.arguments[1]?.type === 'Literal') {
        const rawVal = node.arguments[1].value;
        if (typeof rawVal === 'string' && isValidUrlLike(rawVal, targetBaseDomain)) {
          foundUrls.xmlhttp++;
          count++;
          stats.endpoints++;
          addResult({
            value: normalizeUrlPath(rawVal),
            type: rawVal.startsWith('/') ? 'relative' : 'external',
            source: 'xmlhttp'
          });
        }
      }
    });
  } catch (e) {
    // Silent error
  }
  
  return count;
}

export async function runSubprobe(targetUrl, opts = {}) {
  globalOpts = opts;

  const domainInfo = parseDomain(targetUrl);
  const targetBaseDomain = domainInfo.domain && domainInfo.publicSuffix
  ? `${domainInfo.domain}.${domainInfo.publicSuffix}`
  : '';
  const origin = `${domainInfo.domain ? domainInfo.domain : ''}`;

  const filterCodes = opts['filterStatus']
  ? parseStatusFilter(opts['filterStatus'])
  : null;

  if (filterCodes && !opts.probe) {
    console.log(
      chalk.yellow('\n\n⚠️  --filter-status only works with --probe')
    );
    process.exit(1);
  }

  try {
    const visited = new Set();
    let queue = [targetUrl];
    let depth = opts.depth || 0;

    printProgress(`🕷️  Starting crawl (depth: ${depth})`);

    for (let level = 0; level <= depth; level++) {
      const nextQueue = [];
      
      printProgress(`🎯 Crawling depth ${level} (${queue.length} URLs)`);

      let processedUrls = 0;
      for (const url of queue) {
        processedUrls++;
        stats.urls++;
        
        if (visited.has(url)) continue;
        visited.add(url);

        updateLine(`Scanning URL ${processedUrls}/${queue.length} | Total endpoints: ${stats.endpoints}`);

        const html = await fetchHTML(url);
        const jsLinks = await extractJSLinks(html, url);

        const ownJSLinks = jsLinks.filter(link => {
          const parsed = parseDomain(link);
          
          if (link.includes('?scope=') || link.includes('&delta=') || link.includes('min.js')) {
            return false;
          }
          
          return parsed.domain === domainInfo.domain;
        });

        stats.totalJS += ownJSLinks.length;
        
        for (let j = 0; j < ownJSLinks.length; j++) {
          const link = ownJSLinks[j];
          
          updateLine(`Processing JS ${j+1}/${ownJSLinks.length} | URL ${processedUrls}/${queue.length} | Endpoints: ${stats.endpoints}`);
          
          const js = await fetchJS(link);
          const ast = await parseJS(js);

          if (ast) {
            stats.parsedJS++;
            extractJSInfo(ast, targetBaseDomain);
          }
        }

        if (level < depth) {
          const newLinks = await getInternalLinksFromHTML(html, url, targetBaseDomain);
          nextQueue.push(...newLinks);
        }
      }

      queue = nextQueue;
    }

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    // External Sources
    printProgress(`📂 Collecting from robots.txt & sitemap.xml`);
    const domainRoot = `${domainInfo.domain ? domainInfo.domain : targetUrl.split('/')[2]}`;
    const base = `https://${domainRoot}`;
    await extractRobotsTxt(base, targetBaseDomain);
    await extractSitemap(base, targetBaseDomain);
    if (opts.wayback) {
      printProgress(`🕚 Collecting from Wayback...`);
      await extractWayback(domainRoot, targetBaseDomain);
    }

    let results = getAllResults();

    // Probe endpoints
    if (opts.probe) {
      printProgress(`🔌 Probing ${results.length} endpoints...`);
      const probed = [];
      
      for (let i = 0; i < results.length; i++) {
        if (!opts.silent) {
          process.stdout.write(`\rProbing: ${i+1}/${results.length} endpoints                    `);
        }
        const res = await probeResult({ ...results[i], origin: targetUrl }, targetUrl);
        probed.push(res);
      }
      
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      
      results = probed;

      if (filterCodes) {
        results = results.filter(r => filterCodes.has(r.status));
      }
    }

    // Show summary
    if (!opts.silent) {
      console.log(chalk.green(`\n✅ Analysis complete - Summary:`));
      console.log(`    - URLs analyzed: ${stats.urls}`);
      console.log(`    - JS files analyzed: ${stats.parsedJS}/${stats.totalJS}`);
      console.log(`    - Endpoints found: ${results.length}`);
    }

    // Output results
    if (!opts.silent) {
      printProgress(`🔍 Found ${results.length} endpoints:`);
    }

    for (const result of results) {
      if (opts.probe && filterCodes && !filterCodes.has(result.status)) {
        continue;
      }

      const tag = {
        relative: chalk.green('🟩'),
        internal: chalk.blue('🟦'),
        external: chalk.red('🟥'),
        wayback: chalk.gray('🕓'),
        sitemap: chalk.gray('🗺️'),
        robots: chalk.gray('🤖')
      }[result.type] || '➡️';

      let displayUrl = normalizeUrlPath(result.value);

      if (result.type === 'relative') {
        try {
          const base = new URL(targetUrl);
          displayUrl = `${base.protocol}//${base.host}${result.value}`;
        } catch { /* fallback: leave as-is */ }
      }

      let statusText = '';
      if (opts.probe) {
        const status = result.status ?? '?';
        const code = parseInt(status, 10);

        if (code >= 200 && code < 300) {
          statusText = chalk.green(` ✅ [${status}]`);
        } else if (code >= 300 && code < 400) {
          statusText = chalk.blue(` 🔁 [${status}]`);
        } else if (code === 401 || code === 403) {
          statusText = chalk.yellow(` 🔒 [${status}]`);
        } else if (code >= 400 && code < 500) {
          statusText = chalk.red(` ❌ [${status}]`);
        } else if (code >= 500 && code < 600) {
          statusText = chalk.magenta(` 💥 [${status}]`);
        } else {
          statusText = chalk.gray(` ❓ [${status}]`);
        }
      }

      let line = `${tag} ${displayUrl}${statusText}`;
      console.log(line);
    }

    // Export if needed
    const out = opts.outFile || opts.out;
    if (out) {
      await exportResults(out, results);
    }

  } catch (err) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.error(chalk.red('Error during analysis: ' + err.message));
  }
}

async function getInternalLinksFromHTML(html, baseUrl, targetBaseDomain) {
  const links = [];
  const hrefs = [...html.matchAll(/href=["']([^"']+)["']/gi)];

  for (const [, href] of hrefs) {
    try {
      const url = new URL(href, baseUrl);
      if (!['http:', 'https:'].includes(url.protocol)) {
        continue;
      }

      const parsed = parseDomain(url.hostname);
      const fullDomain = `${parsed.domain}.${parsed.publicSuffix}`;

      if (fullDomain === targetBaseDomain) {
        links.push(url.href.split('#')[0]);
      }
    } catch {
      continue;
    }
  }

  return [...new Set(links)];
}
