// src/components/CoinCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Single card in the market grid.
// Click anywhere on the card → opens CoinModal.
// Click the star → toggles watchlist (prompts login if not signed in).
// ─────────────────────────────────────────────────────────────────────────────

function CoinCard({ coin, onSelect, watchlist, onToggleWatch, user, onAuthRequired, currency }) {
  const up = (coin.price_change_percentage_24h || 0) >= 0;

  return (
    <div className="coin-card" onClick={() => onSelect(coin)}>

      {/* ── Identity + star ── */}
      <div className="coin-card-top">
        <div className="coin-card-identity">
          <img className="coin-card-img" src={coin.image} alt={coin.name} />
          <div>
            <div className="coin-card-symbol">{coin.symbol.toUpperCase()}</div>
            <div className="coin-card-name">{coin.name}</div>
          </div>
        </div>
        <button
          className={`star-btn ${watchlist.includes(coin.id) ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); user ? onToggleWatch(coin.id) : onAuthRequired(); }}
          title={watchlist.includes(coin.id) ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {watchlist.includes(coin.id) ? '★' : '☆'}
        </button>
      </div>

      {/* ── Price + 24h change ── */}
      <div className="coin-card-price">{fmt.price(coin.current_price, currency)}</div>
      <div className={`change-tag ${up ? 'up' : 'down'}`}>
        {up ? '↑' : '↓'} {fmt.pct(coin.price_change_percentage_24h)}
      </div>

      {/* ── Market cap + volume ── */}
      <div className="coin-card-meta">
        <div className="meta-item">Cap<span>{fmt.large(coin.market_cap, currency)}</span></div>
        <div className="meta-item">Vol<span>{fmt.large(coin.total_volume, currency)}</span></div>
      </div>
    </div>
  );
}
