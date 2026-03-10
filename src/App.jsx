// src/App.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Root component. Owns all global state and wires every child together.
//   • Fetches live coin data from CoinGecko every 60 s
//   • Manages currency (USD / INR), watchlist, auth, sort, page
//   • Renders: Navbar → Hero → Stats strip → Sort bar → Coin grid → Modals
// ─────────────────────────────────────────────────────────────────────────────

const { useState, useEffect, useRef, useCallback } = React;

function App() {
  const [coins,        setCoins]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [page,         setPage]         = useState('market');
  const [user,         setUser]         = useState(null);
  const [watchlist,    setWatchlist]    = useState([]);
  const [showAuth,     setShowAuth]     = useState(false);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [sortBy,       setSortBy]       = useState('market_cap_rank');
  const [currency,     setCurrency]     = useState('usd');

  // ── Fetch coins ────────────────────────────────────────────────────────────
  const fetchCoins = useCallback((cur) => {
    const activeCurrency = cur || currency;
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${activeCurrency}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h,7d`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => { setCoins(data); setLastUpdated(new Date()); setLoading(false); })
      .catch(() => { if (coins.length === 0) setLoading(false); });
  }, [currency]);

  useEffect(() => {
    fetchCoins();
    const id = setInterval(fetchCoins, 60000);
    return () => clearInterval(id);
  }, [currency]);

  // ── Watchlist (localStorage) ───────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('cv_watchlist');
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  const toggleWatch = (coinId) => {
    setWatchlist(prev => {
      const next = prev.includes(coinId) ? prev.filter(c => c !== coinId) : [...prev, coinId];
      localStorage.setItem('cv_watchlist', JSON.stringify(next));
      return next;
    });
  };

  const handleSignOut = () => { setUser(null); setWatchlist([]); localStorage.removeItem('cv_watchlist'); };

  const handleCurrencyChange = (cur) => {
    setCurrency(cur);
    window._activeCurrency = cur;
    setLoading(true);
    setCoins([]);
  };

  // ── Derived: sorted + filtered list ───────────────────────────────────────
  const sortedCoins = [...coins].sort((a, b) => {
    if (sortBy === 'market_cap_rank')             return (a.market_cap_rank || 999)              - (b.market_cap_rank || 999);
    if (sortBy === 'price_change_percentage_24h') return (b.price_change_percentage_24h || 0)    - (a.price_change_percentage_24h || 0);
    if (sortBy === 'current_price')               return (b.current_price || 0)                  - (a.current_price || 0);
    return 0;
  });

  const filtered = sortedCoins
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase()))
    .filter(c => page === 'watchlist' ? watchlist.includes(c.id) : true);

  const totalMcap = coins.slice(0, 20).reduce((s, c) => s + (c.market_cap    || 0), 0);
  const totalVol  = coins.slice(0, 20).reduce((s, c) => s + (c.total_volume  || 0), 0);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Navbar ── */}
      <nav className="nav">
        <div className="nav-logo">
          <div className="nav-logo-icon">📈</div>
          Coin<span>Pulse</span>
        </div>

        <SearchBar coins={coins} onSelect={setSelectedCoin} currency={currency} />

        <div className="nav-spacer" />

        {/* Currency selector */}
        <div className="currency-selector">
          {Object.entries(CURRENCIES).map(([key, val], i) => (
            <React.Fragment key={key}>
              {i > 0 && <div className="currency-divider"/>}
              <button className={`currency-btn ${currency === key ? 'active' : ''}`} onClick={() => handleCurrencyChange(key)}>
                {val.flag} {val.code}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Watchlist toggle */}
        <button
          className={`nav-btn nav-btn-ghost ${page === 'watchlist' ? 'active' : ''}`}
          onClick={() => { if (!user) { setShowAuth(true); return; } setPage(p => p === 'watchlist' ? 'market' : 'watchlist'); }}
        >
          ☆ Watchlist
          {watchlist.length > 0 && (
            <span style={{ background: 'var(--accent)', color: '#0a0e1a', borderRadius: '100px', padding: '1px 7px', fontSize: 11, fontWeight: 800, marginLeft: 4 }}>
              {watchlist.length}
            </span>
          )}
        </button>

        {lastUpdated && <div className="live-badge"><span className="live-dot"/>LIVE</div>}

        {user ? (
          <>
            <div className="user-chip">
              <div className="user-avatar">{(user.email || 'U')[0].toUpperCase()}</div>
              {user.email?.split('@')[0]}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <button className="nav-btn nav-btn-primary" onClick={() => setShowAuth(true)}>⇢ Login</button>
        )}
      </nav>

      {/* ── Page content ── */}
      <div className="page-wrap">

        {/* Hero */}
        {page === 'market' && (
          <div className="hero">
            <h1>Market <span>Overview</span></h1>
            <p>Stay updated with real-time prices, trends, and detailed insights for over 100+ top-tier digital assets.
              <br>Developed by Shoban Murli</br>
            </p>
            
          </div>
        )}
        {page === 'watchlist' && (
          <div className="hero">
            <h1>My <span>Watchlist</span></h1>
            <p>Tracking {watchlist.length} coin{watchlist.length !== 1 ? 's' : ''} you care about.</p>
          </div>
        )}

        {/* Global stats strip */}
        {page === 'market' && coins.length > 0 && (
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-icon blue">📊</div>
              <div className="stat-body">
                <div className="stat-label">Market Cap (Top 20)</div>
                <div className="stat-value">{fmt.large(totalMcap, currency)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">⚡</div>
              <div className="stat-body">
                <div className="stat-label">24h Vol (Top 20)</div>
                <div className="stat-value">{fmt.large(totalVol, currency)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon purple">✦</div>
              <div className="stat-body">
                <div className="stat-label">Assets Tracked</div>
                <div className="stat-value">{coins.length}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section header + sort buttons */}
        <div className="section-hdr">
          <div>
            <div className="section-title">{page === 'market' ? 'All Cryptocurrencies' : 'Watchlist'}</div>
            <div className="section-sub">{filtered.length} assets {search ? `matching "${search}"` : ''}</div>
          </div>
          <div className="sort-wrap">
            {[['market_cap_rank', 'Rank'], ['price_change_percentage_24h', 'Top Gainers'], ['current_price', 'Price']].map(([k, label]) => (
              <button key={k} className={`sort-btn ${sortBy === k ? 'active' : ''}`} onClick={() => setSortBy(k)}>{label}</button>
            ))}
          </div>
        </div>

        {/* Coin grid */}
        {loading ? (
          <div className="loading-wrap">
            <div className="spinner"/>
            <div style={{ color: 'var(--muted)', fontSize: 14 }}>Fetching live prices…</div>
          </div>
        ) : page === 'watchlist' && filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">☆</div>
            <h3>Your watchlist is empty</h3>
            <p>Browse the market and star coins you want to track</p>
            <button className="btn btn-primary" onClick={() => setPage('market')}>Explore Market</button>
          </div>
        ) : (
          <div className="coin-grid">
            {filtered.map(coin => (
              <CoinCard
                key={coin.id}
                coin={coin}
                onSelect={setSelectedCoin}
                watchlist={watchlist}
                onToggleWatch={toggleWatch}
                user={user}
                onAuthRequired={() => setShowAuth(true)}
                currency={currency}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {selectedCoin && (
        <CoinModal coin={selectedCoin} onClose={() => setSelectedCoin(null)} watchlist={watchlist} onToggleWatch={toggleWatch} user={user} currency={currency} />
      )}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onAuth={u => { setUser(u); setShowAuth(false); }} />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
