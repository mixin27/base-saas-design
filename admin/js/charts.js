function renderLineChart(containerId, data, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const w = opts.width || el.clientWidth || 400;
  const h = opts.height || 160;
  const pad = 8;
  const max = Math.max(...data);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((d, i) => `${pad + i * stepX},${h - pad - ((d - min) / range) * (h - pad * 2)}`).join(" ");
  const area = `${pad},${h - pad} ${points} ${w - pad},${h - pad}`;
  const color = opts.color || "hsl(var(--primary))";
  el.innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" class="w-full h-full" preserveAspectRatio="none">
      <defs><linearGradient id="grad-${containerId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <polygon points="${area}" fill="url(#grad-${containerId})"></polygon>
      <polyline points="${points}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${data.map((d, i) => `<circle cx="${pad + i * stepX}" cy="${h - pad - ((d - min) / range) * (h - pad * 2)}" r="2.5" fill="${color}"/>`).join("")}
    </svg>`;
}

function renderBarChart(containerId, data, labels, opts = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = Math.max(...data) || 1;
  const color = opts.color || "hsl(var(--primary))";
  el.innerHTML = `
    <div class="flex items-end gap-2 h-full w-full">
      ${data.map((d, i) => `
        <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <div class="w-full rounded-t-sm" style="height:${(d / max) * 100}%;background:${color};min-height:3px" data-tooltip="${labels ? labels[i] + ': ' : ''}${d}"></div>
          ${labels ? `<span class="text-[10px] text-muted-foreground">${labels[i]}</span>` : ""}
        </div>`).join("")}
    </div>`;
}

function renderDonut(containerId, segments, opts = {}) {
  // segments: [{label, value, color}]
  const el = document.getElementById(containerId);
  if (!el) return;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const size = opts.size || 140;
  const stroke = opts.stroke || 16;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const circles = segments.map((seg) => {
    const len = (seg.value / total) * circ;
    const el = `<circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${stroke}" stroke-dasharray="${len} ${circ - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${size/2} ${size/2})"/>`;
    offset += len;
    return el;
  }).join("");
  el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg>`;
}