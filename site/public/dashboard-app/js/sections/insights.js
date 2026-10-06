import { createInsightCard } from '../components/insight-card.js';

export function renderInsights(insights, container) {
  container.innerHTML = '';

  const critical = insights.filter(i => i.type === 'critical');
  const warnings  = insights.filter(i => i.type === 'warning');
  const positives = insights.filter(i => i.type === 'positive');

  // If nothing at all, show empty state
  if (!critical.length && !warnings.length && !positives.length) {
    const empty = document.createElement('p');
    empty.className = 'no-data';
    empty.textContent = 'No significant insights generated';
    container.appendChild(empty);
    return;
  }

  // Group config — only render groups that have items
  const groups = [
    {
      items:      critical,
      label:      'Action Required',
      prefix:     '!',
      badgeBg:    'var(--negative-bg)',
      badgeColor: 'var(--negative)',
    },
    {
      items:      warnings,
      label:      'Watch',
      prefix:     '~',
      badgeBg:    'var(--warning-bg)',
      badgeColor: 'var(--warning)',
    },
    {
      items:      positives,
      label:      'Wins',
      prefix:     '\u2713', // checkmark
      badgeBg:    'var(--positive-bg)',
      badgeColor: 'var(--positive)',
    },
  ];

  groups.forEach(({ items, label, prefix, badgeBg, badgeColor }) => {
    if (!items.length) return;

    // Outer group wrapper
    const group = document.createElement('div');
    group.className = 'insights-group';

    // Group title row
    const titleRow = document.createElement('div');
    titleRow.className = 'insights-group-title';

    const prefixSpan = document.createElement('span');
    prefixSpan.className = 'insights-group-prefix';
    prefixSpan.textContent = prefix + ' ';

    const labelSpan = document.createElement('span');
    labelSpan.textContent = label + ' ';

    const badge = document.createElement('span');
    badge.className = 'count';
    badge.textContent = items.length;
    badge.style.background = badgeBg;
    badge.style.color       = badgeColor;

    titleRow.appendChild(prefixSpan);
    titleRow.appendChild(labelSpan);
    titleRow.appendChild(badge);

    // Cards grid
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.style.gap = 'var(--space-md)';

    items.forEach(insight => {
      const card = createInsightCard(insight);
      grid.appendChild(card);
    });

    group.appendChild(titleRow);
    group.appendChild(grid);
    container.appendChild(group);
  });
}
