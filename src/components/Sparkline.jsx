// src/components/Sparkline.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Tiny 7-day sparkline rendered onto a <canvas> via Chart.js.
// Shown at the bottom of each CoinCard to give a quick visual trend.
// ─────────────────────────────────────────────────────────────────────────────

function Sparkline({ data, positive }) {
  const ref      = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current || !data || data.length < 2) return;
    if (chartRef.current) chartRef.current.destroy();

    const color = positive ? '#00f5a0' : '#ff4d6a';

    chartRef.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels: data.map((_, i) => i),
        datasets: [{
          data,
          borderColor: color,
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 40);
            g.addColorStop(0, positive ? 'rgba(0,245,160,0.3)' : 'rgba(255,77,106,0.3)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            return g;
          },
        }],
      },
      options: {
        responsive: false,
        animation:  false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales:  { x: { display: false }, y: { display: false } },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data, positive]);

  return <canvas ref={ref} width={120} height={40} className="mini-chart" />;
}
