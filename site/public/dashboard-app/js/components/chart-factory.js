// Thin wrappers around Chart.js for consistent styling
// Chart is available as a global from CDN

import { registerChart } from '../utils/chart-registry.js';

const _lineIcon = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,10 4,6 7,8 10,3 13,5"/></svg>`;
const _barIcon  = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="3" height="6" rx="0.5"/><rect x="5.5" y="4" width="3" height="9" rx="0.5"/><rect x="10" y="1" width="3" height="12" rx="0.5"/></svg>`;

export function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getChannelColor(channel) {
  const map = {
    'google': getCSSVar('--color-google') || '#4285f4',
    'meta': getCSSVar('--color-meta') || '#1877f2',
    'shopify': getCSSVar('--color-shopify') || '#96bf48',
    'b2b': getCSSVar('--color-b2b') || '#ff6b35',
    'organic': getCSSVar('--color-organic') || '#2ec4b6',
    'direct': getCSSVar('--color-direct') || '#9b59b6',
    'referral': getCSSVar('--color-referral') || '#e67e22',
    'email': getCSSVar('--color-email') || '#1abc9c',
  };
  return map[channel] || getCSSVar('--chart-1') || '#4285f4';
}

export function getChartColor(index) {
  const colors = [
    getCSSVar('--chart-1') || '#4285f4',
    getCSSVar('--chart-2') || '#34a853',
    getCSSVar('--chart-3') || '#ff6b35',
    getCSSVar('--chart-4') || '#9b59b6',
    getCSSVar('--chart-5') || '#e67e22',
    getCSSVar('--chart-6') || '#1abc9c',
    getCSSVar('--chart-7') || '#e74c3c',
    getCSSVar('--chart-8') || '#95a5a6',
  ];
  return colors[index % colors.length];
}

function hexToRgba(color, alpha) {
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const match = color.match(/[\d.]+/g);
    if (match) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${alpha})`;
    }
  }
  return color;
}

export function createLineChart(canvas, { labels, datasets, dualAxis = false, aspectRatio = 2, promoAnnotations = null, chartAnnotations = null }) {
  const chartDatasets = datasets.map((ds, i) => {
    const color = ds.borderColor || getChartColor(i);
    const out = {
      label: ds.label,
      data: ds.data,
      borderColor: color,
      backgroundColor: ds.backgroundColor !== undefined ? ds.backgroundColor : hexToRgba(color, 0.1),
      fill: ds.fill !== undefined ? ds.fill : true,
      borderWidth: ds.borderWidth || 2,
      tension: ds.tension !== undefined ? ds.tension : 0.4,
      pointRadius: ds.pointRadius !== undefined ? ds.pointRadius : 3,
      pointHoverRadius: ds.pointHoverRadius !== undefined ? ds.pointHoverRadius : 5,
      yAxisID: dualAxis && i > 0 ? 'y1' : 'y',
    };
    if (ds.borderDash) out.borderDash = ds.borderDash;
    return out;
  });

  const scales = {
    x: {
      type: 'category',
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
    y: {
      position: 'left',
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  };

  if (dualAxis) {
    scales.y1 = {
      position: 'right',
      grid: { display: false },
    };
  }

  const chart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 16 },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        },
        ...(promoAnnotations ? { promoAnnotations } : {}),
        ...(chartAnnotations ? { chartAnnotations } : {}),
      },
      scales,
    },
  });
  if (canvas.id) registerChart(canvas.id, chart);
  return chart;
}

export function createBarChart(canvas, { labels, datasets, horizontal = false, stacked = false, aspectRatio = 2 }) {
  const chartDatasets = datasets.map((ds, i) => ({
    label: ds.label,
    data: ds.data,
    backgroundColor: ds.backgroundColor || getChartColor(i),
    borderRadius: ds.borderRadius !== undefined ? ds.borderRadius : 4,
    borderSkipped: false,
  }));

  const scales = {
    x: {
      stacked,
      grid: { display: false },
    },
    y: {
      stacked,
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  };

  const chart = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      indexAxis: horizontal ? 'y' : 'x',
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 16 },
        },
      },
      scales,
    },
  });
  if (canvas.id) registerChart(canvas.id, chart);
  return chart;
}

export function createDoughnutChart(canvas, { labels, data, colors, centerText = null, aspectRatio = 1 }) {
  const plugins = [
    {
      id: 'legend',
      position: 'bottom',
    },
  ];

  const chartPlugins = [];

  if (centerText) {
    chartPlugins.push({
      id: 'centerText',
      afterDraw(chart) {
        const { ctx, chartArea } = chart;
        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 18px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#1a1a2e';
        ctx.fillText(centerText, centerX, centerY);
        ctx.restore();
      },
    });
  }

  const chart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors || labels.map((_, i) => getChartColor(i)),
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { usePointStyle: true, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
              return `${context.label}: ${context.formattedValue} (${pct}%)`;
            },
          },
        },
      },
    },
    plugins: chartPlugins,
  });
  if (canvas.id) registerChart(canvas.id, chart);
  return chart;
}

/**
 * Attach a small icon button to the top-right of wrapperEl that toggles
 * the chart between line and bar types.
 *
 * @param {HTMLElement} wrapperEl   - The .chart-wrapper container
 * @param {Chart}       chartInst   - The Chart.js instance to toggle
 * @param {'bar'|'line'} altType    - The type to switch TO (opposite of current)
 * @param {object}      chartData   - The original data object passed to createLineChart/createBarChart
 */
export function addChartToggle(wrapperEl, chartInst, altType, chartData) {
  const btn = document.createElement('button');
  btn.className = 'chart-type-toggle';
  btn.title = `Switch to ${altType} chart`;
  btn.innerHTML = altType === 'bar' ? _barIcon : _lineIcon;
  wrapperEl.appendChild(btn);

  let currentType = altType === 'bar' ? 'line' : 'bar';
  let current = chartInst;

  btn.addEventListener('click', () => {
    const cnv = wrapperEl.querySelector('canvas');
    if (!cnv) return;
    current.destroy();

    if (currentType === 'line') {
      current = createBarChart(cnv, chartData);
      currentType = 'bar';
      btn.innerHTML = _lineIcon;
      btn.title = 'Switch to line chart';
    } else {
      current = createLineChart(cnv, chartData);
      currentType = 'line';
      btn.innerHTML = _barIcon;
      btn.title = 'Switch to bar chart';
    }
  });
}

export function createScatterChart(canvas, { datasets, aspectRatio = 1.5 }) {
  const chartDatasets = datasets.map((ds, i) => {
    const color = ds.backgroundColor || getChartColor(i);
    return {
      label: ds.label,
      data: ds.data,
      backgroundColor: hexToRgba(color, 0.7),
      borderColor: color,
      borderWidth: 1,
    };
  });

  const chart = new Chart(canvas, {
    type: 'bubble',
    data: { datasets: chartDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio,
      plugins: {
        legend: {
          position: 'top',
          labels: { usePointStyle: true, padding: 16 },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const p = context.raw;
              return `${context.dataset.label}: CPA $${p.x.toFixed(2)}, ROAS ${p.y.toFixed(2)}x`;
            },
          },
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'CPA ($)' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        y: {
          title: { display: true, text: 'ROAS' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
      },
    },
  });
  if (canvas.id) registerChart(canvas.id, chart);
  return chart;
}
