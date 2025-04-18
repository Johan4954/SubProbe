import fs from 'fs/promises';
import path from 'path';

export async function exportToJSON(filepath, results) {
  const dir = path.dirname(filepath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n💾 JSON saved to ${filepath}`);
}

export async function exportToCSV(filepath, results) {
  const dir = path.dirname(filepath);
  await fs.mkdir(dir, { recursive: true });

  const headers = ['value', 'resolved_url', 'type', 'source', 'reachable', 'status'];
  const lines = [headers.join(',')];

  for (const r of results) {
    let resolvedUrl = r.value;
    try {
      if (r.type === 'relative' && r.origin) {
        const base = new URL(r.origin);
        resolvedUrl = `${base.protocol}//${base.host}${r.value}`;
      } else if (r.type !== 'relative') {
        resolvedUrl = r.value;
      }
    } catch {
      resolvedUrl = r.value;
    }


    const row = [
      `"${r.value}"`,
      `"${resolvedUrl}"`,
      r.type,
      r.source,
      r.reachable ?? '',
      r.status ?? ''
    ];

    lines.push(row.join(','));
  }

  await fs.writeFile(filepath, lines.join('\n'), 'utf-8');
  console.log(`\n💾 CSV saved to ${filepath}`);
}

export async function exportToTXT(filepath, results) {
  const dir = path.dirname(filepath);
  await fs.mkdir(dir, { recursive: true });

  const lines = [];

  for (const r of results) {
    let resolvedUrl = r.value;
    
    try {
      if (r.type === 'relative' && r.origin) {
        const base = new URL(r.origin);
        resolvedUrl = `${base.protocol}//${base.host}${r.value}`;
      } else if (r.type !== 'relative') {
        resolvedUrl = r.value;
      }
    } catch {
      resolvedUrl = r.value;
    }

    const statusInfo = r.status ? ` [${r.status}]` : '';
    lines.push(`${resolvedUrl}${statusInfo}`);
  }

  await fs.writeFile(filepath, lines.join('\n'), 'utf-8');
  console.log(`\n💾 TXT saved to ${filepath}`);
}

export async function exportResults(filepath, results) {
  if (!filepath) return;

  try {
    if (filepath.endsWith('.json')) {
      await exportToJSON(filepath, results);
    } else if (filepath.endsWith('.csv')) {
      await exportToCSV(filepath, results);
    } else if (filepath.endsWith('.txt')) {
      await exportToTXT(filepath, results);
    } else {
      // Default to JSON if extension isn't recognized
      await exportToJSON(filepath, results);
    }
  } catch (err) {
    console.error(`Error exporting results: ${err.message}`);
  }
}