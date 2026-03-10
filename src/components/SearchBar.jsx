// src/components/SearchBar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Navbar search input with live dropdown (up to 8 results).
// Full keyboard navigation: ↑ ↓ arrows, Enter to open, Esc to close.
// ─────────────────────────────────────────────────────────────────────────────

function SearchBar({ coins, onSelect, currency }) {
  const [query,    setQuery]    = useState('');
  const [open,     setOpen]     = useState(false);
  const [focusIdx, setFocusIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropRef  = useRef(null);
  const wrapRef  = useRef(null);

  const results = query.trim().length === 0 ? [] :
    coins.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.symbol.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) return;
    if      (e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && focusIdx >= 0 && results[focusIdx]) { pick(results[focusIdx]); }
    else if (e.key === 'Escape')    { setOpen(false); setQuery(''); inputRef.current?.blur(); }
  };

  const pick = (coin) => { onSelect(coin); setQuery(''); setOpen(false); setFocusIdx(-1); };

  const handleChange = (e) => { setQuery(e.target.value); setOpen(true); setFocusIdx(-1); };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div className="nav-search-wrap" ref={wrapRef}>
      <span className="nav-search-icon">🔍</span>
      <input
        ref={inputRef}
        className={`nav-search ${query ? 'has-value' : ''}`}
        placeholder="Search any crypto..."
        value={query}
        onChange={handleChange}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {query && (
        <button className="nav-search-clear" onClick={() => { setQuery(''); setOpen(false); inputRef.current?.focus(); }}>✕</button>
      )}

      {showDropdown && (
        <div className="search-dropdown" ref={dropRef}>
          {results.length > 0 ? (
            <>
              <div className="search-dropdown-header">
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              {results.map((coin, i) => {
                const up = (coin.price_change_percentage_24h || 0) >= 0;
                return (
                  <div
                    key={coin.id}
                    className={`search-result-item ${focusIdx === i ? 'focused' : ''}`}
                    onClick={() => pick(coin)}
                    onMouseEnter={() => setFocusIdx(i)}
                  >
                    <img className="search-result-img" src={coin.image} alt={coin.name} />
                    <div className="search-result-info">
                      <div className="search-result-name">{coin.name}</div>
                      <div className="search-result-symbol">{coin.symbol}</div>
                    </div>
                    <div style={{ marginRight: 8 }}>
                      <span className="search-result-rank">#{coin.market_cap_rank}</span>
                    </div>
                    <div className="search-result-right">
                      <div className="search-result-price">{fmt.price(coin.current_price, currency)}</div>
                      <div className={`search-result-change ${up ? 'up' : 'down'}`}>{fmt.pct(coin.price_change_percentage_24h)}</div>
                    </div>
                  </div>
                );
              })}
              <div className="search-hint">
                <span className="search-hint-key"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
                <span className="search-hint-key"><span className="kbd">Enter</span> open</span>
                <span className="search-hint-key"><span className="kbd">Esc</span> close</span>
              </div>
            </>
          ) : (
            <div className="search-empty">
              <div className="search-empty-icon">🔍</div>
              <div>No results for <strong>"{query}"</strong></div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Try a different name or symbol</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
