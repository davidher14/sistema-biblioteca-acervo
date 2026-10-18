type CsvValue = string | number | null | undefined;

export function downloadCsv(filename: string, rows: Array<Record<string, CsvValue>>) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: CsvValue) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const content = [
    headers.map(escapeCell).join(';'),
    ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(';')),
  ].join('\r\n');
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
