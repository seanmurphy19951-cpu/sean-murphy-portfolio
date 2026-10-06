/**
 * Chart.js global default configuration.
 * Reads CSS custom properties from the DOM to stay consistent with the design system.
 * Call configureChartDefaults(Chart) once at startup.
 */

export function configureChartDefaults(Chart) {
  const styles = getComputedStyle(document.documentElement);

  // Font defaults
  Chart.defaults.font.family = styles.getPropertyValue('--font').trim() || "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = '#7280a0';

  // Tooltip defaults
  Chart.defaults.plugins.tooltip.backgroundColor = '#181818';
  Chart.defaults.plugins.tooltip.titleColor      = '#ffb938';
  Chart.defaults.plugins.tooltip.bodyColor       = '#f3efe6';
  Chart.defaults.plugins.tooltip.borderColor     = 'rgba(255,185,56,0.2)';
  Chart.defaults.plugins.tooltip.borderWidth     = 1;
  Chart.defaults.plugins.tooltip.titleFont = { size: 10, weight: '600', family: "'JetBrains Mono', monospace" };
  Chart.defaults.plugins.tooltip.bodyFont  = { size: 13, weight: '700' };
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.tooltip.displayColors = true;
  Chart.defaults.plugins.tooltip.boxPadding = 4;

  // Legend
  Chart.defaults.plugins.legend.display = false;
  Chart.defaults.plugins.legend.labels.color = '#7280a0';

  // Line element defaults
  Chart.defaults.elements.line.tension = 0.3;
  Chart.defaults.elements.line.borderWidth = 2;

  // Point element defaults
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
  Chart.defaults.elements.point.hoverBorderWidth = 2;

  // Scale / grid defaults
  Chart.defaults.scale.grid.color = 'rgba(255,255,255,0.05)';
  Chart.defaults.scale.grid.drawBorder = false;
  Chart.defaults.scale.ticks.padding = 8;
  Chart.defaults.scale.ticks.color = '#32456e';

  // Animation defaults
  Chart.defaults.animation.duration = 900;
  Chart.defaults.animation.easing = 'easeOutExpo';
}
