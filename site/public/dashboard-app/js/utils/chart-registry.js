/**
 * Chart.js instance registry. Tracks all active Chart instances
 * so they can be destroyed before re-rendering (prevents canvas reuse errors).
 */

const charts = new Map();

export function registerChart(id, chartInstance) {
  if (charts.has(id)) {
    charts.get(id).destroy();
  }
  charts.set(id, chartInstance);
}

export function destroyAllCharts() {
  for (const [id, chart] of charts) {
    chart.destroy();
  }
  charts.clear();
}
