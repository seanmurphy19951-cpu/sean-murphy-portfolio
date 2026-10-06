/**
 * Export utilities for CSV table download and PDF dashboard download.
 */

/**
 * Export a data table to CSV and trigger a download.
 * @param {string} filename - Name for the downloaded file (without extension)
 * @param {string[]} headers - Column header labels
 * @param {Array<Array<string|number>>} rows - Row data
 */
export function exportTableToCSV(filename, headers, rows) {
  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

function escapeCSV(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export the full dashboard viewport as a PDF using the browser's print dialog.
 * Falls back to window.print() which is universally supported.
 */
export function exportDashboardPDF() {
  window.print();
}

/**
 * Create a small CSV download button to attach to table wrappers.
 * @param {Function} getDataFn - Returns { headers: string[], rows: any[][] }
 * @param {string} filename - Base filename for the CSV
 * @returns {HTMLButtonElement}
 */
export function createCSVButton(getDataFn, filename) {
  const btn = document.createElement('button');
  btn.className = 'csv-export-btn';
  btn.title = `Download ${filename}.csv`;
  btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const { headers, rows } = getDataFn();
    exportTableToCSV(filename, headers, rows);
  });
  return btn;
}
