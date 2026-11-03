"use client";

interface RevenueMonth {
  label: string;
  value: number;
}

export default function RevenueChart({ data }: { data: RevenueMonth[] }) {
  const maximum = Math.max(...data.map((month) => month.value), 1);
  const coordinates = data
    .map((month, index) => {
      const x = data.length <= 1 ? 270 : 25 + index * (490 / (data.length - 1));
      const y = 138 - (month.value / maximum) * 105;
      return `${x},${y}`;
    });
  const yLabels = [maximum, maximum * 0.66, maximum * 0.33, 0];
  const shortMoney = (value: number) =>
    value >= 1_000_000
      ? `Rp ${(value / 1_000_000).toFixed(1)}jt`
      : `Rp ${Math.round(value / 1_000)}rb`;

  return (
    <div className="chart-wrap" aria-label="Grafik tren penjualan enam bulan terakhir">
      <div className="chart-y-labels">{yLabels.map((value, index) => <span key={index}>{shortMoney(value)}</span>)}</div>
      <svg className="chart-svg" viewBox="0 0 540 160" role="img" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#24a884" stopOpacity=".2" /><stop offset="100%" stopColor="#24a884" stopOpacity="0" /></linearGradient>
        </defs>
        {[26, 62, 98, 134].map((y) => <line key={y} x1="18" x2="530" y1={y} y2={y} stroke="#e9efec" strokeDasharray="3 5" />)}
        <polygon points={`25,150 ${coordinates.join(" ")} 515,150`} fill="url(#chart-fill)" />
        <polyline points={coordinates.join(" ")} fill="none" stroke="#138565" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {coordinates.map((coordinate, index) => {
          const [cx, cy] = coordinate.split(",");
          return <circle key={index} cx={cx} cy={cy} r="3.5" fill="#fff" stroke="#138565" strokeWidth="2" />;
        })}
      </svg>
      <div className="chart-x-labels">{data.map((month) => <span key={month.label}>{month.label}</span>)}</div>
    </div>
  );
}
