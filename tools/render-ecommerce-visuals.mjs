// Rebuild static, accessible SVG evidence from the aggregate CSV snapshots.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const base = new URL('../', import.meta.url);
const rows = (name) => {
  const [head, ...lines] = readFileSync(new URL(`public/data/ecommerce/${name}`, base), 'utf8').trim().split(/\r?\n/);
  const keys = head.split(',');
  return lines.map(line => Object.fromEntries(line.split(',').map((v, i) => [keys[i], v])));
};
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const out = new URL('public/img/ecommerce/', base);
mkdirSync(out, { recursive: true });
function chart(data, fields, max, step, name, title, axis) {
  const width = 900, left = 215, right = 80, top = 65, row = 66;
  const height = top + data.length * row + 75, plot = width - left - right;
  const palette = ['#1d5b7a', '#8f7f6e'];
  let marks = '';
  for (let tick = 0; tick <= max; tick += step) {
    const x = left + tick / max * plot;
    marks += `<path d="M${x} ${top - 12}V${height - 65}" stroke="#e9e2d8"/><text x="${x}" y="${height - 40}" text-anchor="middle">${max === 1 ? tick.toFixed(1) : tick}</text>`;
  }
  data.forEach((r, i) => {
    const y = top + i * row;
    marks += `<text x="${left - 18}" y="${y + 19}" text-anchor="end" fill="#1c1917">${escape(r.segment ?? r.Model)}</text>`;
    fields.forEach((field, j) => {
      const v = Number(r[field.key]);
      if (!Number.isFinite(v) || v < 0 || v > max) throw new Error('Invalid chart value');
      const bar = v / max * plot, by = y + j * 24;
      marks += `<rect x="${left}" y="${by}" width="${bar}" height="17" fill="${palette[j]}"/><text x="${left + bar + 8}" y="${by + 14}" fill="#1c1917">${max === 1 ? v.toFixed(3) : v.toFixed(1) + '%'}</text>`;
    });
  });
  const legend = fields.map((f, j) => `<rect x="${left + j * 230}" y="14" width="16" height="16" fill="${palette[j]}"/><text x="${left + 24 + j * 230}" y="28">${f.label}</text>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title"><title id="title">${title}</title><rect width="100%" height="100%" fill="#fcfaf7"/><g font-family="Arial, sans-serif" font-size="17" fill="#6e655c">${legend}${marks}<path d="M${left} ${top - 12}V${height - 65}H${width - right}" fill="none" stroke="#b9afa2"/><text x="${left + plot / 2}" y="${height - 7}" text-anchor="middle">${axis}</text></g></svg>`;
  writeFileSync(new URL(`${name}.svg`, out), svg);
}
const segments = rows('segment-summary.csv').sort((a, b) => Number(b.revenue_pct) - Number(a.revenue_pct));
if (segments.reduce((n, r) => n + Number(r.num_customers), 0) !== 5720) throw new Error('Unexpected cohort');
if (Math.abs(segments.reduce((n, r) => n + Number(r.revenue_pct), 0) - 100) > .001) throw new Error('Revenue shares do not sum to 100');
chart(segments, [{key:'revenue_pct',label:'Revenue share'}, {key:'customer_pct',label:'Customer share'}], 70, 10, 'segment-revenue', 'Customer and historical revenue share by RFM segment', 'Share of customers / historical revenue (%)');
chart(rows('model-comparison.csv'), [{key:'ROC-AUC',label:'ROC-AUC'}, {key:'Recall',label:'Recall'}], 1, .2, 'churn-models', 'Corrected churn model scores on the held-out test set', 'Held-out test score (0–1)');
console.log('Rendered two SVGs; verified 5,720 customers, 100% revenue share, and score bounds.');
