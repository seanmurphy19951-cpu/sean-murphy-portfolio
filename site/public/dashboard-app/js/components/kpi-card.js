import { formatCurrency, formatNumber, formatPercent } from '../formatters.js';

/**
 * Creates a KPI card and appends it to the container.
 *
 * @param {Element} container - DOM element to append the card to
 * @param {Object} opts
 * @param {string} opts.label - Card label
 * @param {number} opts.value - Current value (raw number, will be formatted by format param)
 * @param {number} [opts.previous] - Previous period value (for delta)
 * @param {string} [opts.format] - "currency" | "number" | "percent" | "multiplier"
 * @param {boolean} [opts.invertDelta] - If true, increase = bad (CPA, bounce rate)
 * @param {string} [opts.subtitle] - Optional subtitle text
 * @param {string} [opts.accentColor] - CSS color for top accent bar
 * @param {number[]} [opts.sparklineData] - Array of numbers for sparkline
 * @param {string} [opts.sparklineColor] - Override color for sparkline
 */
export function createKPICard(container, {
  label,
  value,
  previous,
  format,
  delta,
  invertDelta = false,
  subtitle,
  estimated = false,
  goal,
  accentColor,
  sparklineData,
  sparkline,
  sparklineColor,
  daysElapsed,
  daysInPeriod,
} = {}) {
  sparklineData = sparklineData || sparkline;
  const card = document.createElement('div');
  card.className = 'kpi-card';

  // Stagger animation based on sibling index
  const siblingIndex = container.children.length;
  card.style.animationDelay = `${siblingIndex * 80}ms`;

  // Accent bar
  if (accentColor) {
    const accent = document.createElement('div');
    accent.className = 'kpi-accent';
    accent.style.backgroundColor = accentColor;
    card.appendChild(accent);
  }

  // Label
  const labelEl = document.createElement('div');
  labelEl.className = 'kpi-label';
  labelEl.textContent = label;
  if (estimated) {
    const est = document.createElement('span');
    est.className = 'kpi-estimated';
    est.textContent = 'EST';
    est.title = 'Estimated — not derived from daily data';
    labelEl.appendChild(est);
  }
  card.appendChild(labelEl);

  // Value — format the raw number
  const valueEl = document.createElement('div');
  valueEl.className = 'kpi-value';
  if (value !== undefined && value !== null) {
    const formattedFinal = formatValue(value, format);
    if (typeof value === 'number' && format) {
      // Count-up animation for numeric values
      valueEl.textContent = formatValue(0, format);
      requestAnimationFrame(() => animateCount(valueEl, value, format, 700));
    } else {
      valueEl.textContent = formattedFinal;
    }
  }
  card.appendChild(valueEl);

  // Delta — accept pre-computed {text, class} object or compute from value/previous
  if (delta && delta.text) {
    let cls = delta.class || 'neutral';
    // Flip sentiment if invertDelta is set and delta wasn't already inverted
    if (invertDelta && cls !== 'neutral') {
      cls = cls === 'positive' ? 'negative' : 'positive';
    }
    const deltaEl = document.createElement('div');
    deltaEl.className = `kpi-delta ${cls}`;
    deltaEl.textContent = delta.text;
    card.appendChild(deltaEl);
  } else if (typeof value === 'number' && previous !== undefined && previous !== null && previous !== 0) {
    const pct = ((value - previous) / Math.abs(previous)) * 100;
    const isNeutral = Math.abs(pct) < 0.5;
    let sentiment;
    if (isNeutral) {
      sentiment = 'neutral';
    } else if (invertDelta) {
      sentiment = pct > 0 ? 'negative' : 'positive';
    } else {
      sentiment = pct > 0 ? 'positive' : 'negative';
    }
    const sign = pct > 0 ? '+' : '';
    const deltaEl = document.createElement('div');
    deltaEl.className = `kpi-delta ${sentiment}`;
    deltaEl.textContent = `${sign}${pct.toFixed(1)}%`;
    card.appendChild(deltaEl);
  }

  // Goal progress bar
  if (typeof goal === 'number' && typeof value === 'number' && goal > 0) {
    const pct = Math.min((value / goal) * 100, 120);
    const goalWrap = document.createElement('div');
    goalWrap.className = 'kpi-goal';

    const goalBar = document.createElement('div');
    goalBar.className = 'kpi-goal-bar';
    const goalFill = document.createElement('div');
    goalFill.className = 'kpi-goal-fill' + (pct >= 100 ? ' hit' : pct >= 80 ? ' on-track' : ' behind');
    goalFill.style.width = `${Math.min(pct, 100)}%`;
    goalBar.appendChild(goalFill);

    const goalLabel = document.createElement('div');
    goalLabel.className = 'kpi-goal-label';
    goalLabel.textContent = `${Math.round(pct)}% of goal`;

    // Pace-to-goal projection
    if (daysElapsed && daysInPeriod && daysElapsed > 0 && daysElapsed < daysInPeriod) {
      const dailyRate = value / daysElapsed;
      const projected = dailyRate * daysInPeriod;
      const projectedPct = Math.round((projected / goal) * 100);
      const paceLabel = document.createElement('div');
      paceLabel.className = 'kpi-pace';
      if (projectedPct >= 100) {
        paceLabel.classList.add('kpi-pace--on');
        paceLabel.textContent = `On pace for ${projectedPct}% of goal`;
      } else {
        paceLabel.classList.add('kpi-pace--behind');
        const remaining = goal - value;
        const daysLeft = daysInPeriod - daysElapsed;
        const neededDaily = daysLeft > 0 ? remaining / daysLeft : remaining;
        const neededStr = formatValue(neededDaily, format);
        paceLabel.textContent = `Behind pace — need ${neededStr}/day`;
      }
      goalWrap.appendChild(paceLabel);
    }

    goalWrap.appendChild(goalBar);
    goalWrap.appendChild(goalLabel);
    card.appendChild(goalWrap);
  }

  // Subtitle
  if (subtitle) {
    const subEl = document.createElement('div');
    subEl.className = 'kpi-sub';
    subEl.textContent = subtitle;
    card.appendChild(subEl);
  }

  // Sparkline
  if (sparklineData && sparklineData.length > 0) {
    const sparkWrap = document.createElement('div');
    sparkWrap.className = 'kpi-sparkline';
    const sparkCanvas = document.createElement('canvas');
    sparkWrap.appendChild(sparkCanvas);
    card.appendChild(sparkWrap);

    const lineColor = sparklineColor || accentColor || '#4285f4';
    const fillColor = hexToRgba(lineColor, 0.1);

    // Render sparkline after element is in DOM
    requestAnimationFrame(() => {
      new Chart(sparkCanvas, {
        type: 'line',
        data: {
          labels: sparklineData.map((_, i) => i),
          datasets: [{
            data: sparklineData,
            borderColor: lineColor,
            backgroundColor: fillColor,
            fill: true,
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          scales: {
            x: { display: false },
            y: { display: false },
          },
        },
      });
    });
  }

  container.appendChild(card);
  return card;
}

function animateCount(el, endValue, format, duration) {
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = formatValue(endValue * eased, format);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = formatValue(endValue, format);
  }
  requestAnimationFrame(step);
}

function formatValue(value, format) {
  if (value === null || value === undefined) return '—';
  switch (format) {
    case 'currency': return formatCurrency(value);
    case 'number': return formatNumber(value);
    case 'percent': return formatPercent(value);
    case 'multiplier': return Number(value).toFixed(2) + 'x';
    default: return String(value);
  }
}

function hexToRgba(color, alpha) {
  if (!color) return `rgba(66,133,244,${alpha})`;
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const m = color.match(/[\d.]+/g);
    if (m) return `rgba(${m[0]},${m[1]},${m[2]},${alpha})`;
  }
  return color;
}
