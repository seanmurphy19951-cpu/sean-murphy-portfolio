export function createInsightCard({ type, channel, message, detail }) {
  const card = document.createElement('div');
  card.className = 'insight-card';
  if (type) {
    card.classList.add(type);
  }

  // Icon
  const iconEl = document.createElement('div');
  iconEl.className = 'insight-icon';
  switch (type) {
    case 'positive':
      iconEl.textContent = '\u2713';
      break;
    case 'warning':
      iconEl.textContent = '!';
      break;
    case 'critical':
      iconEl.textContent = '\u2717';
      break;
    default:
      iconEl.textContent = '\u2022';
  }
  card.appendChild(iconEl);

  // Content
  const content = document.createElement('div');
  content.className = 'insight-content';

  if (channel) {
    const channelEl = document.createElement('div');
    channelEl.className = 'insight-channel';
    channelEl.textContent = channel;
    content.appendChild(channelEl);
  }

  if (message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'insight-message';
    messageEl.textContent = message;
    content.appendChild(messageEl);
  }

  if (detail) {
    const detailEl = document.createElement('div');
    detailEl.className = 'insight-detail';
    detailEl.textContent = detail;
    content.appendChild(detailEl);
  }

  card.appendChild(content);

  return card;
}
