import { useMemo } from 'react';

export default function ChartLine({ data = [], xKey = 'name', yKey = 'value', height = 200 }) {
  const points = useMemo(() => {
    if (data.length === 0) return [];
    
    // Find min and max
    const yValues = data.map(d => d[yKey] || 0);
    const maxY = Math.max(...yValues, 100); // at least 100 max for scale
    const minY = 0;

    const width = 500;
    const svgHeight = height;
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = svgHeight - padding * 2;

    return data.map((d, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
      const val = d[yKey] || 0;
      const y = padding + chartHeight - ((val - minY) / (maxY - minY)) * chartHeight;
      return { x, y, label: d[xKey], val };
    });
  }, [data, yKey, xKey, height]);

  // Construct SVG Path description
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // Construct Fill Path description (closed path to ground for gradient fill)
  const fillD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const bottomY = height - 30;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [points, pathD, height]);

  if (data.length === 0) {
    return <div className="text-center py-8 text-xs text-[#777587] font-body">No data available</div>;
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 500 ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          {/* Sparkle Violet gradient */}
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1="30" y1={height - 30} x2="470" y2={height - 30} stroke="#e7e8e9" strokeWidth="1" />
        <line x1="30" y1={30} x2="470" y2={30} stroke="#e7e8e9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="30" y1={height / 2} x2="470" y2={height / 2} stroke="#e7e8e9" strokeWidth="1" strokeDasharray="4 4" />

        {/* Gradient fill */}
        <path d={fillD} fill="url(#chartGradient)" />

        {/* Stroke line */}
        <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points & labels */}
        {points.map((p, index) => (
          <g key={index} className="group">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#ffffff"
              stroke="#8B5CF6"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150 hover:r-6"
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
              <rect
                x={p.x - 25}
                y={p.y - 35}
                width="50"
                height="22"
                rx="4"
                fill="#191c1d"
              />
              <text
                x={p.x}
                y={p.y - 20}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                ${p.val}
              </text>
            </g>
            {/* X Axis Labels */}
            <text
              x={p.x}
              y={height - 10}
              fill="#777587"
              fontSize="10"
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
