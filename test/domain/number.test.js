import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertSafeObjectKey,
  formatCurrencyEur,
  formatNumberDe,
  isSafeObjectKey,
  parseLocaleNumber
} from '../../src/domain/number.js';

test('parseLocaleNumber: parst deutsches Format mit Tausenderpunkt', () => {
  assert.equal(parseLocaleNumber('1.234,56'), 1234.56);
});

test('parseLocaleNumber: parst englisches Format mit Tausenderkomma', () => {
  assert.equal(parseLocaleNumber('1,234.56'), 1234.56);
});

test('parseLocaleNumber: ignoriert Währungstext', () => {
  assert.equal(parseLocaleNumber(' 2.500,00 EUR '), 2500);
});

test('parseLocaleNumber: liefert null bei Leerwerten', () => {
  assert.equal(parseLocaleNumber(''), null);
  assert.equal(parseLocaleNumber(null), null);
});

test('formatNumberDe / formatCurrencyEur: formatiert korrekt', () => {
  assert.equal(formatNumberDe(1234.5), '1.234,50');
  assert.equal(formatCurrencyEur(12.3), '12,30 €');
  assert.equal(formatNumberDe(Number.NaN), '—');
  assert.equal(formatCurrencyEur(undefined), '—');
});

test('safe object keys: blockiert gefährliche Schlüssel', () => {
  assert.equal(isSafeObjectKey('ISO_123'), true);
  assert.equal(isSafeObjectKey('__proto__'), false);
  assert.equal(isSafeObjectKey('prototype'), false);
  assert.equal(isSafeObjectKey('constructor'), false);
  assert.throws(() => assertSafeObjectKey('__proto__'), /Unsicherer Objekt-Key/);
});
