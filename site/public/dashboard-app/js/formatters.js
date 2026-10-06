/**
 * Formatting utilities for the marketing performance dashboard.
 */

/**
 * Format a number in compact notation: 2840000 => "2.8M", 86400 => "86.4K"
 */
export function formatCompact(value) {
  if (value == null) return '0';
  const num = Number(value);
  if (!isFinite(num)) return '0';

  const abs = Math.abs(num);
  if (abs >= 1e6) {
    return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (abs >= 1e3) {
    return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Format as USD currency.
 * formatCurrency(45200)        => "$45,200"
 * formatCurrency(4700000)      => "$4.7M"   (auto-compact >= 1M)
 * formatCurrency(45200, true)  => "$45.2K"  (compact mode)
 */
export function formatCurrency(value, compact = false) {
  if (value == null) return '$0';
  const num = Number(value);
  if (!isFinite(num)) return '$0';

  const abs = Math.abs(num);

  // Always compact for >= 1M
  if (abs >= 1e6) {
    const sign = num < 0 ? '-' : '';
    return sign + '$' + (Math.abs(num) / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  }

  // Compact mode for >= 1K
  if (compact && abs >= 1e3) {
    const sign = num < 0 ? '-' : '';
    return sign + '$' + (Math.abs(num) / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  }

  // Standard formatting — show cents only for values under $100
  const showCents = abs < 100;
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  });
  return formatter.format(num);
}

/**
 * Format number with commas: 86400 => "86,400"
 * Compact mode: "86.4K", "2.8M"
 */
export function formatNumber(value, compact = false) {
  if (value == null) return '0';
  const num = Number(value);
  if (!isFinite(num)) return '0';

  if (compact) {
    return formatCompact(num);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format percent: formatPercent(3.04) => "3.04%"
 */
export function formatPercent(value, decimals = 1) {
  if (value == null) return '0%';
  const num = Number(value);
  if (!isFinite(num)) return '0%';

  return num.toFixed(decimals) + '%';
}

/**
 * Calculate delta between current and previous values.
 * Returns { text, class, value } where class is "positive", "negative", or "neutral".
 * invertColor: when true, an increase is "negative" (e.g. CPA, bounce rate).
 */
export function formatDelta(current, previous, invertColor = false) {
  if (current == null || previous == null || previous === 0) {
    return { text: 'N/A', class: 'neutral', value: 0 };
  }

  const cur = Number(current);
  const prev = Number(previous);

  if (!isFinite(cur) || !isFinite(prev) || prev === 0) {
    return { text: 'N/A', class: 'neutral', value: 0 };
  }

  const delta = ((cur - prev) / Math.abs(prev)) * 100;
  const rounded = Math.round(delta * 10) / 10;

  let cls;
  if (rounded > 0) {
    cls = invertColor ? 'negative' : 'positive';
  } else if (rounded < 0) {
    cls = invertColor ? 'positive' : 'negative';
  } else {
    cls = 'neutral';
  }

  const sign = rounded > 0 ? '+' : '';
  const text = `${sign}${rounded.toFixed(1)}%`;

  return { text, class: cls, value: rounded };
}

/**
 * Format a date string: "2026-03-01" => "Mar 1"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a duration in seconds: 185 => "3:05"
 */
export function formatDuration(seconds) {
  if (seconds == null || !isFinite(seconds)) return '0:00';
  const s = Math.round(Math.abs(Number(seconds)));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
