import { formatNumber, formatPercent } from '../formatters.js';

export function createFunnel(container, {
  title,
  steps,
}) {
  const card = document.createElement('div');
  card.className = 'card';

  // Card header
  const header = document.createElement('div');
  header.className = 'card-header';
  const titleEl = document.createElement('h3');
  titleEl.className = 'card-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);
  card.appendChild(header);

  // Funnel container
  const funnel = document.createElement('div');
  funnel.className = 'funnel';

  const maxValue = steps.length > 0 ? steps[0].value : 1;

  steps.forEach((step, i) => {
    // Funnel step
    const stepEl = document.createElement('div');
    stepEl.className = 'funnel-step';

    // Label
    const label = document.createElement('div');
    label.className = 'funnel-label';
    label.textContent = step.label;
    stepEl.appendChild(label);

    // Bar container
    const barContainer = document.createElement('div');
    barContainer.className = 'funnel-bar-container';

    const bar = document.createElement('div');
    bar.className = 'funnel-bar';
    const widthPct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
    bar.style.width = widthPct + '%';
    bar.style.backgroundColor = step.color || '#4285f4';
    bar.textContent = formatNumber(step.value);

    barContainer.appendChild(bar);
    stepEl.appendChild(barContainer);

    // Value
    const valueEl = document.createElement('div');
    valueEl.className = 'funnel-value';
    valueEl.textContent = formatNumber(step.value);
    stepEl.appendChild(valueEl);

    funnel.appendChild(stepEl);
  });

  card.appendChild(funnel);
  container.appendChild(card);

  return card;
}
