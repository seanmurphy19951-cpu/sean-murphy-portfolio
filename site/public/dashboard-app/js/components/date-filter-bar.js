/**
 * Date filter bar component.
 * Sticky bar with preset buttons (MTD, QTD, YTD, Prev Year),
 * a custom calendar range picker with compare support, and YoY/QoQ toggles.
 */

import {
  DATE_PRESETS,
  COMPARE_MODES,
  setDateRange,
  setCustomRange,
  setCompareMode,
  setCustomCompareRange,
  getDateRange,
  getDataBounds,
  getRangeDisplayLabel,
  getComparisonLabel,
  subscribe,
} from '../state/date-range-state.js';

let barEl = null;
let rangeLabelEl = null;
let compareBadgeEl = null;
let presetBtns = {};
let compareBtn = null;
let qoqBtn = null;
let customBtn = null;
let datePickerEl = null;
let pickerOpen = false;

// Calendar state
let calLeftDate = null;
let calRightDate = null;
let selStart = null;       // Primary range start
let selEnd = null;         // Primary range end
let compStart = null;      // Compare range start
let compEnd = null;        // Compare range end
let hoverDate = null;
let dayCells = new Map();
let compareEnabled = false; // Whether compare tab is active
let activeRange = 'primary'; // 'primary' or 'compare' — which range is being edited

const MIN_DATE = '2025-01-01';
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function initDateFilterBar(mountEl) {
  barEl = document.createElement('div');
  barEl.className = 'date-filter-bar';

  // ── Left: preset buttons ──
  const presetsSection = document.createElement('div');
  presetsSection.className = 'filter-bar-section';

  const presets = [
    { key: DATE_PRESETS.MTD, label: 'MTD' },
    { key: DATE_PRESETS.QTD, label: 'QTD' },
    { key: DATE_PRESETS.YTD, label: 'YTD' },
    { key: DATE_PRESETS.PREV_YEAR, label: 'PREV YR' },
  ];

  presets.forEach(({ key, label }) => {
    const btn = document.createElement('button');
    btn.className = 'filter-preset-btn';
    btn.textContent = label;
    btn.dataset.preset = key;
    btn.addEventListener('click', () => {
      closePicker();
      setCompareMode(COMPARE_MODES.NONE);
      setDateRange(key);
    });
    presetsSection.appendChild(btn);
    presetBtns[key] = btn;
  });

  // ── Divider ──
  const divider1 = document.createElement('div');
  divider1.className = 'filter-divider';

  // ── Custom date range button + picker ──
  const customSection = document.createElement('div');
  customSection.className = 'filter-bar-section filter-custom-section';

  customBtn = document.createElement('button');
  customBtn.className = 'filter-preset-btn filter-custom-btn';
  customBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span>Custom</span>`;
  customBtn.addEventListener('click', togglePicker);
  presetBtns[DATE_PRESETS.CUSTOM] = customBtn;

  // Calendar picker dropdown
  datePickerEl = document.createElement('div');
  datePickerEl.className = 'cal-picker';
  datePickerEl.style.display = 'none';

  customSection.appendChild(customBtn);
  customSection.appendChild(datePickerEl);

  // ── Divider ──
  const divider2 = document.createElement('div');
  divider2.className = 'filter-divider';

  // ── Range display label ──
  rangeLabelEl = document.createElement('span');
  rangeLabelEl.className = 'filter-range-label';

  // ── Right: compare toggle ──
  const compareSection = document.createElement('div');
  compareSection.className = 'filter-bar-section filter-bar-right';

  compareBtn = document.createElement('button');
  compareBtn.className = 'filter-compare-toggle';
  compareBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>YoY</span>`;
  compareBtn.addEventListener('click', () => {
    const current = getDateRange();
    const newMode = current.compareMode === COMPARE_MODES.YOY
      ? COMPARE_MODES.NONE
      : COMPARE_MODES.YOY;
    setCompareMode(newMode);
  });

  qoqBtn = document.createElement('button');
  qoqBtn.className = 'filter-compare-toggle';
  qoqBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg><span>QoQ</span>`;
  qoqBtn.addEventListener('click', () => {
    const current = getDateRange();
    const newMode = current.compareMode === COMPARE_MODES.QOQ
      ? COMPARE_MODES.NONE
      : COMPARE_MODES.QOQ;
    setCompareMode(newMode);
  });

  compareBadgeEl = document.createElement('span');
  compareBadgeEl.className = 'filter-compare-badge';

  compareSection.appendChild(compareBtn);
  compareSection.appendChild(qoqBtn);
  compareSection.appendChild(compareBadgeEl);

  // ── Assemble bar ──
  barEl.appendChild(presetsSection);
  barEl.appendChild(divider1);
  barEl.appendChild(customSection);
  barEl.appendChild(divider2);
  barEl.appendChild(rangeLabelEl);
  barEl.appendChild(compareSection);

  mountEl.appendChild(barEl);

  // Close picker on outside click
  document.addEventListener('mousedown', (e) => {
    if (pickerOpen && !customSection.contains(e.target)) {
      closePicker();
    }
  });

  // Subscribe to state changes
  subscribe(updateUI);
  updateUI(getDateRange());
}

/* ── Calendar Picker ── */

function togglePicker() {
  if (pickerOpen) { closePicker(); } else { openPicker(); }
}

function openPicker() {
  const current = getDateRange();
  const bounds = getDataBounds();

  selStart = current.start || bounds.min;
  selEnd = current.end || bounds.max;
  hoverDate = null;
  activeRange = 'primary';

  // Restore compare state if it was active
  if (current.compareMode === COMPARE_MODES.CUSTOM && current.compareStart) {
    compareEnabled = true;
    compStart = current.compareStart;
    compEnd = current.compareEnd;
  } else {
    compareEnabled = false;
    compStart = null;
    compEnd = null;
  }

  // Initialize calendar views
  const startD = new Date(selStart + 'T00:00:00');
  calLeftDate = new Date(startD.getFullYear(), startD.getMonth(), 1);

  const endD = new Date(selEnd + 'T00:00:00');
  if (endD.getFullYear() === calLeftDate.getFullYear() && endD.getMonth() === calLeftDate.getMonth()) {
    calRightDate = new Date(calLeftDate.getFullYear(), calLeftDate.getMonth() + 1, 1);
  } else {
    calRightDate = new Date(endD.getFullYear(), endD.getMonth(), 1);
  }

  renderCalendar();
  datePickerEl.style.display = '';
  pickerOpen = true;
}

function closePicker() {
  datePickerEl.style.display = 'none';
  pickerOpen = false;
}

function renderCalendar() {
  dayCells.clear();
  const bounds = getDataBounds();
  const minD = new Date(MIN_DATE + 'T00:00:00');
  const maxD = new Date(bounds.max + 'T00:00:00');

  datePickerEl.innerHTML = '';

  // ── Header with range tabs ──
  const header = document.createElement('div');
  header.className = 'cal-header';

  // Tab bar: Primary | Compare
  const tabBar = document.createElement('div');
  tabBar.className = 'cal-tab-bar';

  const primaryTab = document.createElement('button');
  primaryTab.className = 'cal-tab' + (activeRange === 'primary' ? ' cal-tab--active' : '');
  primaryTab.innerHTML = `<span class="cal-tab__dot cal-tab__dot--primary"></span>Primary Range`;
  primaryTab.addEventListener('click', () => {
    activeRange = 'primary';
    renderCalendar();
  });

  const compareTab = document.createElement('button');
  compareTab.className = 'cal-tab' + (compareEnabled && activeRange === 'compare' ? ' cal-tab--active' : '') + (!compareEnabled ? ' cal-tab--disabled' : '');
  compareTab.innerHTML = `<span class="cal-tab__dot cal-tab__dot--compare"></span>Compare Range`;
  if (compareEnabled) {
    compareTab.addEventListener('click', () => {
      activeRange = 'compare';
      renderCalendar();
    });
  }

  const compareToggle = document.createElement('label');
  compareToggle.className = 'cal-compare-toggle';
  const toggleInput = document.createElement('input');
  toggleInput.type = 'checkbox';
  toggleInput.checked = compareEnabled;
  toggleInput.addEventListener('change', () => {
    compareEnabled = toggleInput.checked;
    if (compareEnabled) {
      activeRange = 'compare';
      if (!compStart) {
        // Auto-suggest: same-length period before primary
        if (selStart && selEnd) {
          const s = new Date(selStart + 'T00:00:00');
          const e = new Date(selEnd + 'T00:00:00');
          const dur = e.getTime() - s.getTime();
          const cs = new Date(s.getTime() - dur - 86400000);
          const ce = new Date(s.getTime() - 86400000);
          if (cs >= minD) {
            compStart = fmtDate(cs);
            compEnd = fmtDate(ce);
          }
        }
      }
    } else {
      activeRange = 'primary';
      compStart = null;
      compEnd = null;
    }
    renderCalendar();
  });
  const toggleTrack = document.createElement('span');
  toggleTrack.className = 'cal-toggle-track';
  compareToggle.appendChild(toggleInput);
  compareToggle.appendChild(toggleTrack);
  compareToggle.appendChild(document.createTextNode(' Compare'));

  tabBar.appendChild(primaryTab);
  tabBar.appendChild(compareTab);
  tabBar.appendChild(compareToggle);
  header.appendChild(tabBar);

  // Range display boxes
  const rangeDisplay = document.createElement('div');
  rangeDisplay.className = 'cal-range-display';

  if (activeRange === 'primary' || !compareEnabled) {
    const startBox = makeRangeBox('Start', selStart, !selEnd);
    const sep = makeRangeSep();
    const endBox = makeRangeBox('End', selEnd, selStart && !selEnd ? false : true);
    rangeDisplay.appendChild(startBox);
    rangeDisplay.appendChild(sep);
    rangeDisplay.appendChild(endBox);
  } else {
    const startBox = makeRangeBox('Compare Start', compStart, !compEnd, true);
    const sep = makeRangeSep();
    const endBox = makeRangeBox('Compare End', compEnd, compStart && !compEnd ? false : true, true);
    rangeDisplay.appendChild(startBox);
    rangeDisplay.appendChild(sep);
    rangeDisplay.appendChild(endBox);
  }

  header.appendChild(rangeDisplay);

  // Quick presets sidebar
  const quickPresets = document.createElement('div');
  quickPresets.className = 'cal-quick-presets';
  const quickItems = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 14 days', days: 14 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];
  quickItems.forEach(({ label, days }) => {
    const btn = document.createElement('button');
    btn.className = 'cal-quick-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      const end = new Date(maxD);
      const start = new Date(end);
      start.setDate(start.getDate() - days + 1);
      if (start < minD) start.setTime(minD.getTime());

      if (activeRange === 'primary' || !compareEnabled) {
        selStart = fmtDate(start);
        selEnd = fmtDate(end);
        calLeftDate = new Date(start.getFullYear(), start.getMonth(), 1);
        calRightDate = new Date(end.getFullYear(), end.getMonth(), 1);
      } else {
        compStart = fmtDate(start);
        compEnd = fmtDate(end);
      }
      if (calLeftDate.getTime() === calRightDate.getTime()) {
        calRightDate = new Date(calRightDate.getFullYear(), calRightDate.getMonth() + 1, 1);
      }
      renderCalendar();
    });
    quickPresets.appendChild(btn);
  });

  // ── Months container ──
  const monthsRow = document.createElement('div');
  monthsRow.className = 'cal-months';

  const canPrev = calLeftDate > minD;
  const maxViewMonth = new Date(maxD.getFullYear(), maxD.getMonth(), 1);
  const canNext = calRightDate < maxViewMonth;

  monthsRow.appendChild(buildMonthView(calLeftDate, minD, maxD, 'left', canPrev));
  monthsRow.appendChild(buildMonthView(calRightDate, minD, maxD, 'right', canNext));

  // ── Footer with actions ──
  const footer = document.createElement('div');
  footer.className = 'cal-footer';

  const clearBtn = document.createElement('button');
  clearBtn.className = 'cal-clear-btn';
  clearBtn.textContent = 'Clear';
  clearBtn.addEventListener('click', () => {
    if (activeRange === 'compare') {
      compStart = null;
      compEnd = null;
    } else {
      selStart = null;
      selEnd = null;
    }
    renderCalendar();
  });

  const actions = document.createElement('div');
  actions.className = 'cal-actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'cal-cancel-btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', closePicker);

  const canApply = selStart && selEnd && selStart <= selEnd
    && (!compareEnabled || (compStart && compEnd && compStart <= compEnd));

  const applyBtn = document.createElement('button');
  applyBtn.className = 'cal-apply-btn';
  applyBtn.disabled = !canApply;
  applyBtn.textContent = compareEnabled ? 'Compare Ranges' : 'Apply Range';
  applyBtn.addEventListener('click', () => {
    if (!canApply) return;
    if (compareEnabled && compStart && compEnd) {
      setCustomCompareRange(compStart, compEnd, selStart, selEnd);
    } else {
      setCompareMode(COMPARE_MODES.NONE);
      setCustomRange(selStart, selEnd);
    }
    closePicker();
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(applyBtn);

  footer.appendChild(clearBtn);
  footer.appendChild(actions);

  // ── Assemble ──
  const body = document.createElement('div');
  body.className = 'cal-body';
  body.appendChild(quickPresets);
  body.appendChild(monthsRow);

  datePickerEl.appendChild(header);
  datePickerEl.appendChild(body);
  datePickerEl.appendChild(footer);
}

function makeRangeBox(label, dateStr, isActive, isCompare = false) {
  const box = document.createElement('div');
  box.className = 'cal-range-box'
    + (isActive ? ' cal-range-box--active' : '')
    + (isCompare ? ' cal-range-box--compare' : '');
  box.innerHTML = `<span class="cal-range-box__label">${label}</span><span class="cal-range-box__value">${dateStr ? formatDisplayDate(dateStr) : 'Select date'}</span>`;
  return box;
}

function makeRangeSep() {
  const sep = document.createElement('div');
  sep.className = 'cal-range-sep';
  sep.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
  return sep;
}

function buildMonthView(monthDate, minD, maxD, side, canNavigate) {
  const month = document.createElement('div');
  month.className = 'cal-month';

  // Month header with navigation
  const monthHeader = document.createElement('div');
  monthHeader.className = 'cal-month-header';

  const navBtn = document.createElement('button');
  navBtn.className = 'cal-nav-btn';

  if (side === 'left') {
    navBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
    navBtn.disabled = !canNavigate;
    navBtn.addEventListener('click', () => {
      calLeftDate = new Date(calLeftDate.getFullYear(), calLeftDate.getMonth() - 1, 1);
      calRightDate = new Date(calRightDate.getFullYear(), calRightDate.getMonth() - 1, 1);
      renderCalendar();
    });
    monthHeader.appendChild(navBtn);
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '28px';
    monthHeader.appendChild(spacer);
  }

  const monthLabel = document.createElement('span');
  monthLabel.className = 'cal-month-label';
  monthLabel.textContent = `${MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  monthHeader.appendChild(monthLabel);

  if (side === 'right') {
    navBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>`;
    navBtn.disabled = !canNavigate;
    navBtn.addEventListener('click', () => {
      calLeftDate = new Date(calLeftDate.getFullYear(), calLeftDate.getMonth() + 1, 1);
      calRightDate = new Date(calRightDate.getFullYear(), calRightDate.getMonth() + 1, 1);
      renderCalendar();
    });
    monthHeader.appendChild(navBtn);
  } else {
    const spacer = document.createElement('div');
    spacer.style.width = '28px';
    monthHeader.appendChild(spacer);
  }

  month.appendChild(monthHeader);

  // Day-of-week headers
  const dowRow = document.createElement('div');
  dowRow.className = 'cal-dow-row';
  DAYS.forEach(d => {
    const cell = document.createElement('span');
    cell.className = 'cal-dow';
    cell.textContent = d;
    dowRow.appendChild(cell);
  });
  month.appendChild(dowRow);

  // Day grid
  const grid = document.createElement('div');
  grid.className = 'cal-grid';

  const year = monthDate.getFullYear();
  const mo = monthDate.getMonth();
  const firstDay = new Date(year, mo, 1).getDay();
  const daysInMonth = new Date(year, mo + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('span');
    empty.className = 'cal-day cal-day--empty';
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = fmtDate(new Date(year, mo, d));
    const cell = document.createElement('button');
    cell.className = 'cal-day';
    cell.textContent = d;

    const dateObj = new Date(year, mo, d);
    const isDisabled = dateObj < minD || dateObj > maxD;
    if (isDisabled) {
      cell.classList.add('cal-day--disabled');
      cell.disabled = true;
    }

    // Primary range classes
    const isPrimStart = selStart === dateStr;
    const isPrimEnd = selEnd === dateStr;
    const activeStart = activeRange === 'primary' ? selStart : compStart;
    const activeEnd = activeRange === 'primary' ? selEnd : compEnd;
    const effectiveEnd = hoverDate && activeStart && !activeEnd ? hoverDate : activeEnd;

    // Primary range highlighting (always visible)
    const primEffEnd = selEnd;
    const inPrimRange = selStart && primEffEnd && dateStr > selStart && dateStr < primEffEnd;
    if (isPrimStart) cell.classList.add('cal-day--start');
    if (isPrimEnd) cell.classList.add('cal-day--end');
    if (isPrimStart && isPrimEnd) cell.classList.add('cal-day--single');
    if (inPrimRange) cell.classList.add('cal-day--in-range');

    // Compare range highlighting
    if (compareEnabled && compStart) {
      const isCompStart = compStart === dateStr;
      const isCompEnd = compEnd === dateStr;
      const inCompRange = compStart && compEnd && dateStr > compStart && dateStr < compEnd;
      if (isCompStart) cell.classList.add('cal-day--comp-start');
      if (isCompEnd) cell.classList.add('cal-day--comp-end');
      if (isCompStart && isCompEnd) cell.classList.add('cal-day--comp-single');
      if (inCompRange) cell.classList.add('cal-day--comp-in-range');
    }

    // Hover preview for active range
    if (activeStart && !activeEnd) {
      const hEffEnd = hoverDate;
      if (hEffEnd) {
        const inHoverRange = dateStr > activeStart && dateStr < hEffEnd;
        if (inHoverRange) cell.classList.add(activeRange === 'compare' ? 'cal-day--comp-in-range' : 'cal-day--in-range');
      }
    }

    if (hoverDate === dateStr && !isPrimStart && !isPrimEnd) {
      cell.classList.add('cal-day--hover');
    }

    // Today marker
    const today = new Date();
    if (year === today.getFullYear() && mo === today.getMonth() && d === today.getDate()) {
      cell.classList.add('cal-day--today');
    }

    if (!isDisabled) {
      cell.addEventListener('click', () => handleDayClick(dateStr));
      cell.addEventListener('mouseenter', () => {
        const curStart = activeRange === 'primary' ? selStart : compStart;
        const curEnd = activeRange === 'primary' ? selEnd : compEnd;
        if (curStart && !curEnd && hoverDate !== dateStr) {
          hoverDate = dateStr;
          updateHoverClasses();
        }
      });
      dayCells.set(dateStr, cell);
    }

    grid.appendChild(cell);
  }

  month.appendChild(grid);
  return month;
}

function updateHoverClasses() {
  const curStart = activeRange === 'primary' ? selStart : compStart;
  const curEnd = activeRange === 'primary' ? selEnd : compEnd;
  const effectiveEnd = hoverDate && curStart && !curEnd ? hoverDate : curEnd;
  const rangeClass = activeRange === 'compare' ? 'cal-day--comp-in-range' : 'cal-day--in-range';

  for (const [dateStr, cell] of dayCells) {
    const isStart = curStart === dateStr;
    const isEnd = curEnd === dateStr;
    const inRange = curStart && effectiveEnd && dateStr > curStart && dateStr < effectiveEnd;
    const isHover = hoverDate === dateStr && !isStart && !isEnd;

    // Only toggle hover-related classes, don't touch fixed ones
    if (activeRange === 'primary') {
      cell.classList.toggle('cal-day--in-range',
        inRange || (cell.classList.contains('cal-day--in-range') && selEnd));
      // Recalculate primary in-range properly
      const primInRange = selStart && selEnd && dateStr > selStart && dateStr < selEnd;
      const hoverInRange = selStart && !selEnd && hoverDate && dateStr > selStart && dateStr < hoverDate;
      cell.classList.toggle('cal-day--in-range', primInRange || hoverInRange);
    } else {
      const compInRange = compStart && compEnd && dateStr > compStart && dateStr < compEnd;
      const hoverInRange = compStart && !compEnd && hoverDate && dateStr > compStart && dateStr < hoverDate;
      cell.classList.toggle('cal-day--comp-in-range', compInRange || hoverInRange);
    }
    cell.classList.toggle('cal-day--hover', isHover);
  }
}

function handleDayClick(dateStr) {
  if (activeRange === 'compare' && compareEnabled) {
    if (!compStart || compEnd) {
      compStart = dateStr;
      compEnd = null;
      hoverDate = null;
    } else {
      if (dateStr < compStart) {
        compEnd = compStart;
        compStart = dateStr;
      } else {
        compEnd = dateStr;
      }
      hoverDate = null;
    }
  } else {
    if (!selStart || selEnd) {
      selStart = dateStr;
      selEnd = null;
      hoverDate = null;
    } else {
      if (dateStr < selStart) {
        selEnd = selStart;
        selStart = dateStr;
      } else {
        selEnd = dateStr;
      }
      hoverDate = null;
    }
  }
  renderCalendar();
}

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateUI(state) {
  const compareActive = state.compareMode !== COMPARE_MODES.NONE;
  Object.entries(presetBtns).forEach(([key, btn]) => {
    btn.classList.toggle('active', !compareActive && key === state.preset);
  });

  if (rangeLabelEl) {
    rangeLabelEl.textContent = getRangeDisplayLabel();
  }

  if (compareBtn) {
    compareBtn.classList.toggle('active', state.compareMode === COMPARE_MODES.YOY);
  }
  if (qoqBtn) {
    qoqBtn.classList.toggle('active', state.compareMode === COMPARE_MODES.QOQ);
  }

  if (compareBadgeEl) {
    compareBadgeEl.textContent = getComparisonLabel();
  }

  if (customBtn) {
    const span = customBtn.querySelector('span');
    if (state.preset === DATE_PRESETS.CUSTOM && span) {
      const s = new Date(state.start + 'T00:00:00');
      const e = new Date(state.end + 'T00:00:00');
      const fmt = { month: 'short', day: 'numeric' };
      span.textContent = `${s.toLocaleDateString('en-US', fmt)} \u2013 ${e.toLocaleDateString('en-US', fmt)}`;
    } else if (span) {
      span.textContent = 'Custom';
    }
  }
}
