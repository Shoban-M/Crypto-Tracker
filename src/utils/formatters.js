// src/utils/formatters.js
// ─────────────────────────────────────────────────────────────────────────────
// Shared number-formatting helpers used by every component.
// `window._activeCurrency` is kept in sync by App so fmt functions always
// have the right currency without needing the prop threaded everywhere.
// ─────────────────────────────────────────────────────────────────────────────

const CURRENCIES = {
  usd: { symbol: '$', code: 'USD', flag: '🇺🇸', locale: 'en-US' },
  inr: { symbol: '₹', code: 'INR', flag: '🇮🇳', locale: 'en-IN' },
};

window._activeCurrency = 'usd';

const fmt = {
  /** Full price with currency symbol. Shows 6 decimals for sub-$1 coins. */
  price(n, cur) {
    const c = CURRENCIES[cur || window._activeCurrency] || CURRENCIES.usd;
    if (!n && n !== 0) return '—';
    if (n >= 1) return c.symbol + n.toLocaleString(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return c.symbol + n.toFixed(6);
  },

  /** Percentage with sign prefix (+/-). */
  pct(n) {
    if (!n && n !== 0) return '—';
    return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
  },

  /** Large numbers shortened to T / B / M suffixes. */
  large(n, cur) {
    const c = CURRENCIES[cur || window._activeCurrency] || CURRENCIES.usd;
    if (!n) return '—';
    if (n >= 1e12) return c.symbol + (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9)  return c.symbol + (n / 1e9).toFixed(2)  + 'B';
    if (n >= 1e6)  return c.symbol + (n / 1e6).toFixed(2)  + 'M';
    return c.symbol + n.toLocaleString(c.locale);
  },
};
