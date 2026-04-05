const BLOCKED_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function isSafeObjectKey(key) {
  const normalized = String(key ?? '').trim();
  return normalized.length > 0 && !BLOCKED_KEYS.has(normalized);
}

export function assertSafeObjectKey(key) {
  if (!isSafeObjectKey(key)) {
    throw new Error(`Unsicherer Objekt-Key: "${key}"`);
  }
  return key;
}

export function parseLocaleNumber(raw) {
  if (raw === null || raw === undefined) return null;
  let t = String(raw).trim();
  if (!t) return null;

  t = t
    .replace(/\s+/g, '')
    .replace(/€/g, '')
    .replace(/eur/gi, '')
    .replace(/[^0-9,.-]/g, '');

  if (!t || t === '-') return null;

  const lastComma = t.lastIndexOf(',');
  const lastDot = t.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    if (lastComma > lastDot) {
      t = t.replace(/\./g, '').replace(',', '.');
    } else {
      t = t.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    t = t.replace(/\./g, '').replace(',', '.');
  } else {
    t = t.replace(/,/g, '');
  }

  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export function formatNumberDe(value, { digits = 2, empty = '—' } = {}) {
  if (!Number.isFinite(value)) return empty;
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

export function formatCurrencyEur(value, { digits = 2, empty = '—' } = {}) {
  if (!Number.isFinite(value)) return empty;
  return `${formatNumberDe(value, { digits, empty })} €`;
}
