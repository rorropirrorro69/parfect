/* ============ UI helpers: escaping, icons, SVG charts ============ */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function fmtDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function fmtHcp(h) {
  if (h == null || isNaN(h)) return '—';
  return h < 0 ? `+${Math.abs(h)}` : `${h}`;
}

function fmtToPar(n) {
  if (n === 0) return 'E';
  return n > 0 ? `+${n}` : `${n}`;
}

function initials(name) {
  return String(name || '?').trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

/* ---- logo mark (golf flag swoosh) ---- */
function logoMark(size = 16) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M8 21V4" stroke="#c9f73e" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M8 4l9 3.5L8 11" fill="#c9f73e"/>
    <path d="M5 21c2-1.4 4.6-1.4 6.6 0" stroke="#c9f73e" stroke-width="2" stroke-linecap="round"/>
  </svg>`;
}

const ICONS = {
  inicio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
  ronda: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V4"/><path d="M7 4l10 3.8L7 11.5"/><circle cx="16" cy="19" r="2"/></svg>`,
  trainer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></svg>`,
  social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.8-3.2 3.2-5 6.2-5s5.4 1.8 6.2 5"/><circle cx="17.5" cy="9.5" r="2.6"/><path d="M16.2 14.6c2.7.2 4.4 1.9 5 4.4"/></svg>`,
  feat_round: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><path d="M7 21V4"/><path d="M7 4l10 3.8L7 11.5"/></svg>`,
  feat_stats: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></svg>`,
  feat_ai: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>`,
  feat_track: `<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>`,
};

/* ============ Radar chart (6 axes, 0–100) ============ */
function radarSVG(labels, values) {
  const W = 370, H = 300;
  const cx = W / 2, cy = H / 2, R = H / 2 - 46;
  const n = labels.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = f => labels.map((_, i) => pt(i, R * f).join(',')).join(' ');
  const poly = values.map((v, i) => pt(i, (R * Math.max(v, 5)) / 100).join(',')).join(' ');
  const axes = labels.map((_, i) => {
    const [x, y] = pt(i, R);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="radar-grid"/>`;
  }).join('');
  const labs = labels.map((l, i) => {
    const [x, y] = pt(i, R + 24);
    let anchor = 'middle';
    if (x < cx - 8) anchor = 'end';
    if (x > cx + 8) anchor = 'start';
    return `<text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${anchor}" class="radar-label">${esc(l)}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Perfil de habilidades">
    ${[0.33, 0.66, 1].map(f => `<polygon points="${ring(f)}" class="radar-grid"/>`).join('')}
    ${axes}
    ${labs}
    <polygon points="${poly}" class="radar-val"/>
    <circle cx="${cx}" cy="${cy}" r="15" class="radar-core"/>
    <text x="${cx}" y="${cy + 5}" text-anchor="middle" class="radar-p">P</text>
  </svg>`;
}

/* ============ Line chart (score evolution) ============ */
function lineSVG(points, { w = 560, h = 130 } = {}) {
  if (!points || points.length < 2) {
    return `<div class="chart-empty">Registra al menos 2 rondas para ver tu evolución.</div>`;
  }
  const pad = 14, padR = 46;
  const min = Math.min(...points), max = Math.max(...points);
  const span = (max - min) || 1;
  const x = i => pad + (i * (w - pad - padR)) / (points.length - 1);
  const y = v => pad + ((v - min) * (h - 2 * pad)) / span;
  const d = points.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const lastX = x(points.length - 1), lastY = y(points[points.length - 1]);
  const area = `${d} L${lastX.toFixed(1)},${h - 4} L${pad},${h - 4} Z`;
  return `<svg class="linechart" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#c9f73e" stop-opacity="0.30"/>
        <stop offset="100%" stop-color="#c9f73e" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#lg)"/>
    <path d="${d}" fill="none" stroke="#c9f73e" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${lastX}" cy="${lastY}" r="4.5" fill="#c9f73e"/>
    <text x="${lastX + 9}" y="${lastY + 4}" fill="#c9f73e" font-size="14" font-weight="800" font-family="Inter,system-ui">${fmtToPar(points[points.length - 1])}</text>
  </svg>`;
}

/* ============ Mini horizontal bar row ============ */
function mbar(label, pct, valText) {
  const w = Math.max(0, Math.min(100, pct));
  return `<div class="mbar">
    <span class="mb-lab">${esc(label)}</span>
    <div class="bar"><i style="width:${w}%"></i></div>
    <span class="mb-val">${esc(valText)}</span>
  </div>`;
}

/* stat card with progress bar */
function statCard(value, caption, barPct) {
  const w = Math.max(0, Math.min(100, barPct));
  return `<div class="card">
    <div class="stat-num">${value}</div>
    <div class="stat-cap">${esc(caption)}</div>
    <div class="bar"><i style="width:${w}%"></i></div>
  </div>`;
}
