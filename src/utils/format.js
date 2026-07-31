const CURRENCY_LOCALE = 'es-EC';

const currencyFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return `$0,00`;
  return `$${currencyFormatter.format(num)}`;
}

export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) return String(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatBytes(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return '-';
  if (num < 1024) return `${num} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = num;
  let unit = '';
  for (let i = 0; i < units.length; i += 1) {
    if (size < 1024) break;
    size /= 1024;
    unit = units[i];
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${unit}`;
}
