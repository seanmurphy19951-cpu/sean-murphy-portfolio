/**
 * Sidebar navigation — page-based (one section visible at a time).
 */

let currentSection = null;

export function initSidebar() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.dashboard-section');

  // Hide all sections except the first one
  sections.forEach((section, i) => {
    section.style.display = i === 0 ? '' : 'none';
    if (i === 0) {
      section.classList.add('visible');
      currentSection = section.id;
    }
  });

  // Handle nav link clicks — switch pages
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const sectionId = targetId.slice(1); // remove #
      navigateTo(sectionId);
    });
  });

  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    const id = e.state?.section || getHashSection() || 'executive-summary';
    navigateTo(id, false);
  });

  // Check initial hash
  const initialSection = getHashSection();
  if (initialSection && initialSection !== currentSection) {
    navigateTo(initialSection, false);
  }
}

export function navigateTo(sectionId, pushState = true) {
  const sections = document.querySelectorAll('.dashboard-section');
  const navLinks = document.querySelectorAll('.nav-link');

  // Hide all sections
  sections.forEach(s => {
    s.style.display = 'none';
  });

  // Show the target section
  const target = document.getElementById(sectionId);
  if (target) {
    target.style.display = '';
    target.classList.add('visible');
    currentSection = sectionId;

    // Scroll content to top
    const content = document.querySelector('.content');
    if (content) content.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Update active nav link and header title
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isActive = href === '#' + sectionId;
    link.classList.toggle('active', isActive);
    if (isActive) {
      const label = link.querySelector('span')?.textContent || 'Dashboard';
      const headerTitle = document.querySelector('.header-title');
      if (headerTitle) headerTitle.textContent = label;
    }
  });

  // Update URL hash
  if (pushState) {
    history.pushState({ section: sectionId }, '', '#' + sectionId);
  }
}

export function getCurrentSection() {
  return currentSection;
}

function getHashSection() {
  const hash = window.location.hash;
  return hash ? hash.slice(1) : null;
}
