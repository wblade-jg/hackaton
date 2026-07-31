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
