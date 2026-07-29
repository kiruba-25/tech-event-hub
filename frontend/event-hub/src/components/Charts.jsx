// Lightweight dependency-free SVG charts (no chart library, no Tailwind)

export const LineChart = ({ series, labels, width = 600, height = 220 }) => {
  const pad = 30;
  const allValues = series.flatMap((s) => s.data);
  const max = Math.max(...allValues, 1);
  const stepX = (width - pad * 2) / (labels.length - 1 || 1);

  const buildPoints = (data) =>
    data
      .map((v, i) => {
        const x = pad + i * stepX;
        const y = height - pad - (v / max) * (height - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="line-chart">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={pad}
          x2={width - pad}
          y1={height - pad - f * (height - pad * 2)}
          y2={height - pad - f * (height - pad * 2)}
          stroke="#eef0f5"
        />
      ))}
      {series.map((s) => (
        <polyline
          key={s.name}
          fill="none"
          stroke={s.color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={buildPoints(s.data)}
        />
      ))}
      {series.map((s) =>
        s.data.map((v, i) => {
          const x = pad + i * stepX;
          const y = height - pad - (v / max) * (height - pad * 2);
          return <circle key={s.name + i} cx={x} cy={y} r="3" fill={s.color} />;
        })
      )}
      {labels.map((l, i) => (
        <text key={l} x={pad + i * stepX} y={height - 8} fontSize="9" textAnchor="middle" fill="#9ca3af">
          {l}
        </text>
      ))}
    </svg>
  );
};

export const DonutChart = ({ data, size = 160 }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let cumulative = 0;
  const r = size / 2;
  const stroke = size * 0.22;
  const radius = r - stroke / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <g transform={`rotate(-90 ${r} ${r})`}>
          {data.map((d) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <circle
                key={d.label}
                cx={r}
                cy={r}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </g>
      </svg>
      <ul className="legend-list">
        {data.map((d) => (
          <li key={d.label}>
            <span className="dot" style={{ background: d.color }} /> {d.label} — {Math.round((d.value / total) * 100)}%
          </li>
        ))}
      </ul>
    </div>
  );
};
