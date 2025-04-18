#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { runSubprobe } from '../lib/extractor.js';

const program = new Command();

program
  .name('subprobe')
  .description('Extract hidden endpoints and internal subdomains from JavaScript files and external sources')
  .version('0.2.1')
  .argument('<url>', 'Target URL to analyze')
  .option('--depth <number>', 'Recursive scan depth for internal links (default 0)', parseInt, 0)
  .option('--filter-status <codes>', 'Filter by status codes. Supports exact (200), ranges (400-410), and groups (4xx)')
  .option('-o, --out <file>', 'Export results to JSON or CSV (determined by file extension)')
  .option('--probe', 'Check if endpoints respond (via HTTP status codes)')
  .option('--wayback', 'Include Wayback Machine results')
  .option('--silent', 'Only show discovered endpoints without progress information')
  .option('--no-color', 'Disable colored output')
  .action(async (url, options) => {
    // Disable colors if --no-color is specified
    if (options.color === false) {
      chalk.level = 0;
    }
    
    if (!options.silent) {
      console.log(chalk.greenBright(`🚀 Starting SubProbe on ${url}`));
    }
    
    await runSubprobe(url, options);
  });

program.parse(process.argv);
