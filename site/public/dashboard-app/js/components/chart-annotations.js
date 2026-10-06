/**
 * Chart.js plugin that draws vertical annotation markers on time-series charts.
 * Shows dated events like product launches, campaign starts, and external events.
 *
 * Usage: set `options.plugins.chartAnnotations = { annotations, dateLabels }` on any chart.
 */

const TYPE_COLORS = {
  promo:    '#ffb938',
  campaign: '#4285f4',
  product:  '#00d084',
  external: '#ff6b35',
};

export const chartAnnotationsPlugin = {
  id: 'chartAnnotations',

  afterDatasetsDraw(chart) {
    const opts = chart.options.plugins?.chartAnnotations;
    if (!opts || !opts.annotations || !opts.dateLabels) return;

    const { annotations, dateLabels } = opts;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const xScale = chart.scales.x;
    if (!xScale) return;

    for (const ann of annotations) {
      const idx = dateLabels.indexOf(ann.date);
      if (idx === -1) continue;

      const x = xScale.getPixelForValue(idx);
      if (x < left || x > right) continue;

      const color = TYPE_COLORS[ann.type] || '#888';

      ctx.save();

      // Draw vertical dashed line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();

      // Draw small diamond marker at top
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = color;
      const size = 4;
      ctx.beginPath();
      ctx.moveTo(x, top - size);
      ctx.lineTo(x + size, top);
      ctx.lineTo(x, top + size);
      ctx.lineTo(x - size, top);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  },
};

/**
 * Filter annotations to only those within a date range.
 */
export function getAnnotationsInRange(annotations, startDate, endDate) {
  if (!annotations || !Array.isArray(annotations)) return [];
  return annotations.filter(a => a.date >= startDate && a.date <= endDate);
}
