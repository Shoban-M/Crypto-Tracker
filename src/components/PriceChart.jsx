// src/components/PriceChart.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Full interactive price-history chart rendered inside CoinModal.
//   • Time range selector: 24H / 1W / 1M / 3M / 1Y
//   • Scroll-to-zoom + drag-to-pan  (chartjs-plugin-zoom)
//   • Dashed crosshair line on hover
//   • Tooltip showing exact price + date at cursor
//   • Period Low / High / Change stats bar below the chart
//   • "↺ Reset" button appears while zoomed
// ─────────────────────────────────────────────────────────────────────────────

function PriceChart({ coinId, positive, currency }) {
  const ref      = useRef(null);
  const chartRef = useRef(null);
  const [days,      setDays]      = useState(7);
  const [loading,   setLoading]   = useState(true);
  const [hoverData, setHoverData] = useState(null);
  const [rawPrices, setRawPrices] = useState([]);
  const [rawLabels, setRawLabels] = useState([]);
  const [isZoomed,  setIsZoomed]  = useState(false);
  const color = positive ? '#00f5a0' : '#ff4d6a';

  // ── Build / rebuild Chart.js instance ─────────────────────────────────────
  const buildChart = (labels, values) => {
    if (chartRef.current) chartRef.current.destroy();

    const crosshairPlugin = {
      id: 'crosshair',
      afterDraw(chart) {
        if (chart._crosshairX == null) return;
        const { ctx, chartArea: { top, bottom } } = chart;
        ctx.save();
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.moveTo(chart._crosshairX, top);
        ctx.lineTo(chart._crosshairX, bottom);
        ctx.stroke();
        ctx.restore();
      },
    };

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      plugins: [crosshairPlugin],
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: '#080b12',
          pointHoverBorderWidth: 2,
          fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
            g.addColorStop(0, positive ? 'rgba(0,245,160,0.2)' : 'rgba(255,77,106,0.2)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            return g;
          },
          tension: 0.3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        onHover: (event, elements, chart) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const x   = elements[0].element.x;
            chart._crosshairX = x;
            setHoverData({ price: chart.data.datasets[0].data[idx], label: chart.data.labels[idx], idx });
          } else {
            chart._crosshairX = null;
            setHoverData(null);
          }
          chart.draw();
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(14,20,33,0.95)',
            titleColor: '#6b7a99',
            bodyColor: '#e8edf5',
            borderColor: color,
            borderWidth: 1,
            padding: 14,
            cornerRadius: 10,
            displayColors: false,
            callbacks: {
              title: items => items[0].label,
              label: ctx => {
                const v   = ctx.parsed.y;
                const cur = CURRENCIES[currency || window._activeCurrency] || CURRENCIES.usd;
                return '  ' + (v >= 1
                  ? cur.symbol + v.toLocaleString(cur.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : cur.symbol + v.toFixed(6));
              },
            },
          },
          zoom: {
            zoom: { wheel: { enabled: true, speed: 0.08 }, pinch: { enabled: true }, mode: 'x', onZoom: () => setIsZoomed(true) },
            pan:  { enabled: true, mode: 'x', onPan: () => setIsZoomed(true) },
          },
        },
        scales: {
          x: {
            ticks: { color: '#6b7a99', maxTicksLimit: 8, font: { family: 'Space Mono', size: 10 }, maxRotation: 0 },
            grid:  { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          },
          y: {
            position: 'right',
            ticks: {
              color: '#6b7a99',
              font: { family: 'Space Mono', size: 10 },
              callback: v => {
                const cur = CURRENCIES[currency || window._activeCurrency] || CURRENCIES.usd;
                return v >= 1 ? cur.symbol + v.toLocaleString(cur.locale) : cur.symbol + v.toFixed(4);
              },
            },
            grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          },
        },
        animation: { duration: 400, easing: 'easeInOutQuart' },
      },
    });
  };

  // ── Fetch price history whenever coinId / days / currency changes ──────────
  useEffect(() => {
    if (!ref.current) return;
    setLoading(true);
    setHoverData(null);
    setIsZoomed(false);

    fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency || 'usd'}&days=${days}`)
      .then(r => r.json())
      .then(data => {
        if (!data.prices) return;
        const labels = data.prices.map(p => {
          const d = new Date(p[0]);
          return days === 1
            ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : days <= 7
              ? d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
              : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });
        const values = data.prices.map(p => p[1]);
        setRawPrices(values);
        setRawLabels(labels);
        buildChart(labels, values);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => chartRef.current?.destroy();
  }, [coinId, days, positive, currency]);

  const resetZoom = () => { chartRef.current?.resetZoom(); setIsZoomed(false); };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const minPrice    = rawPrices.length ? Math.min(...rawPrices) : 0;
  const maxPrice    = rawPrices.length ? Math.max(...rawPrices) : 0;
  const startPrice  = rawPrices[0] || 0;
  const endPrice    = rawPrices[rawPrices.length - 1] || 0;
  const periodChange = startPrice ? ((endPrice - startPrice) / startPrice) * 100 : 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="chart-container">

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div className="chart-title">Price History</div>
          {hoverData ? (
            <div style={{ fontFamily: 'Space Mono', fontSize: 13, color, marginTop: 2 }}>
              {hoverData.label} — {fmt.price(hoverData.price, currency)}
            </div>
          ) : (
            <div style={{ fontFamily: 'Space Mono', fontSize: 12, color: periodChange >= 0 ? '#00f5a0' : '#ff4d6a', marginTop: 2 }}>
              {periodChange >= 0 ? '▲' : '▼'} {Math.abs(periodChange).toFixed(2)}% this period
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {isZoomed && (
            <button className="reset-zoom-btn" onClick={resetZoom}>↺ Reset</button>
          )}
          <div className="time-btns">
            {[1, 7, 30, 90, 365].map(d => (
              <button key={d} className={`time-btn ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>
                {d === 1 ? '24H' : d === 7 ? '1W' : d === 30 ? '1M' : d === 90 ? '3M' : '1Y'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      {loading && (
        <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" />
        </div>
      )}
      <div style={{ height: 280, display: loading ? 'none' : 'block', cursor: 'crosshair' }}>
        <canvas ref={ref} />
      </div>

      {/* Period stats bar */}
      {!loading && rawPrices.length > 0 && (
        <div className="chart-stats-bar">
          {[
            { label: 'Period Low',    value: fmt.price(minPrice,  currency), color: '#ff4d6a' },
            { label: 'Period High',   value: fmt.price(maxPrice,  currency), color: '#00f5a0' },
            { label: 'Period Change', value: (periodChange >= 0 ? '+' : '') + periodChange.toFixed(2) + '%', color: periodChange >= 0 ? '#00f5a0' : '#ff4d6a' },
          ].map((s, i) => (
            <div key={i} className="chart-stat-item">
              <div className="chart-stat-label">{s.label}</div>
              <div className="chart-stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Usage hint */}
      {!loading && !isZoomed && (
        <div className="chart-hint">🖱 scroll to zoom · drag to pan · hover for price</div>
      )}
    </div>
  );
}
