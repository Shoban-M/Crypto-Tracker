// src/components/CoinModal.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full-screen overlay showing all stats for a selected coin plus an interactive
// PriceChart. Click the backdrop or ✕ button to close.
// ─────────────────────────────────────────────────────────────────────────────

function CoinModal({ coin, onClose, watchlist, onToggleWatch, user, currency }) {
  const up = (coin.price_change_percentage_24h || 0) >= 0;

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>

        {/* ── Coin header ── */}
        <div className="modal-coin-header">
          <img className="modal-coin-img" src={coin.image} alt={coin.name} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="modal-coin-name">{coin.name}</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 6 }}>
                {coin.symbol.toUpperCase()}
              </span>
            </div>
            <div className="modal-rank">Rank #{coin.market_cap_rank}</div>
          </div>
          {user && (
            <button className={`star-btn ${watchlist.includes(coin.id) ? 'active' : ''}`} onClick={() => onToggleWatch(coin.id)}>
              {watchlist.includes(coin.id) ? '★' : '☆'}
            </button>
          )}
        </div>

        {/* ── Price + 24h pill ── */}
        <div className="modal-price">{fmt.price(coin.current_price, currency)}</div>
        <span className={`change-pill ${up ? 'up' : 'down'}`}>{fmt.pct(coin.price_change_percentage_24h)} (24h)</span>

        {/* ── Stats grid ── */}
        <div className="modal-stats">
          <div className="modal-stat"><div className="modal-stat-label">Market Cap</div><div className="modal-stat-value">{fmt.large(coin.market_cap, currency)}</div></div>
          <div className="modal-stat"><div className="modal-stat-label">24h Volume</div><div className="modal-stat-value">{fmt.large(coin.total_volume, currency)}</div></div>
          <div className="modal-stat"><div className="modal-stat-label">24h High</div><div className="modal-stat-value">{fmt.price(coin.high_24h, currency)}</div></div>
          <div className="modal-stat"><div className="modal-stat-label">24h Low</div><div className="modal-stat-value">{fmt.price(coin.low_24h, currency)}</div></div>
          <div className="modal-stat"><div className="modal-stat-label">Circulating Supply</div><div className="modal-stat-value">{coin.circulating_supply ? (coin.circulating_supply / 1e6).toFixed(2) + 'M' : '—'}</div></div>
          <div className="modal-stat"><div className="modal-stat-label">All-Time High</div><div className="modal-stat-value">{fmt.price(coin.ath, currency)}</div></div>
        </div>

        {/* ── Interactive chart ── */}
        <PriceChart coinId={coin.id} positive={up} currency={currency} />
      </div>
    </div>
  );
}
