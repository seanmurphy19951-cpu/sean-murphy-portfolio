/**
 * Chart.js plugin that draws vertical promo bands on time-series charts.
 * Register globally once, then pass promo data via chart options.
 *
 * Usage: set `options.plugins.promoAnnotations = { promos, dateLabels }` on any chart.
 * - promos: array of { name, startDate, endDate, color }
 * - dateLabels: the chart's x-axis labels as date strings (YYYY-MM-DD or comparable)
 */

export const promoAnnotationsPlugin = {
  id: 'promoAnnotations',

  afterDatasetsDraw(chart) {
    const opts = chart.options.plugins?.promoAnnotations;
    if (!opts || !opts.promos || !opts.dateLabels) return;

    const { promos, dateLabels } = opts;
    const { ctx, chartArea: { left, right, top, bottom } } = chart;
    const xScale = chart.scales.x;
    if (!xScale) return;

    const labelCount = dateLabels.length;
    if (labelCount === 0) return;

    for (const promo of promos) {
      // Find the index range for this promo within the chart's date labels
      let startIdx = -1;
      let endIdx = -1;

      for (let i = 0; i < labelCount; i++) {
        const label = dateLabels[i];
        if (label >= promo.startDate && startIdx === -1) startIdx = i;
        if (label <= promo.endDate) endIdx = i;
      }

      if (startIdx === -1 || endIdx === -1 || startIdx > endIdx) continue;

      // Calculate pixel positions
      const x1 = xScale.getPixelForValue(startIdx) - (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;
      const x2 = xScale.getPixelForValue(endIdx) + (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;

      const clampedX1 = Math.max(x1, left);
      const clampedX2 = Math.min(x2, right);
      if (clampedX1 >= clampedX2) continue;

      ctx.save();

      // Draw the band
      ctx.fillStyle = (promo.color || 'rgba(255,185,56,0.15)').replace(/[^,]+\)/, '0.08)');
      // If color is hex, convert to rgba
      const bandColor = hexToRgba(promo.color || '#ffb938', 0.08);
      ctx.fillStyle = bandColor;
      ctx.fillRect(clampedX1, top, clampedX2 - clampedX1, bottom - top);

      // Draw left border line
      ctx.strokeStyle = hexToRgba(promo.color || '#ffb938', 0.3);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(clampedX1, top);
      ctx.lineTo(clampedX1, bottom);
      ctx.stroke();

      // Draw promo label at top
      ctx.setLineDash([]);
      ctx.font = '600 8px monospace';
      ctx.fillStyle = hexToRgba(promo.color || '#ffb938', 0.7);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const labelX = clampedX1 + 4;
      const maxWidth = clampedX2 - clampedX1 - 8;
      if (maxWidth > 20) {
        ctx.fillText(promo.name.toUpperCase(), labelX, top + 4, maxWidth);
      }

      ctx.restore();
    }
  },
};

function hexToRgba(color, alpha) {
  if (color.startsWith('rgba') || color.startsWith('rgb')) return color;
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

/**
 * Filter promos to only those overlapping a given date range.
 */
export function getPromosInRange(promos, startDate, endDate) {
  if (!promos || !Array.isArray(promos)) return [];
  return promos.filter(p => p.startDate <= endDate && p.endDate >= startDate);
}
