import React, { useState } from 'react';
import { motion } from 'framer-motion';


const ApplicationTrendsChart = ({ data }) => {
  const safeData =
    data && data.length
      ? data
      : Array.from({ length: 30 }, () => ({ value: 0 }));

  const maxValue = 4; // fixed scale like reference chart
 const [hoverIndex, setHoverIndex] = useState(null);


  const width = 100;
  const height = 100;

  const padding = {
    top: 10,
    right: 4,
    bottom: 22,
    left: 8
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const getX = i =>
    padding.left + (i / (safeData.length - 1)) * chartWidth;

  // ✅ FIXED
  const getY = v =>
  padding.top + chartHeight - (v / maxValue) * chartHeight;


  const path = safeData
    .map((d, i) =>
      `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`
    )
    .join(' ');

  // Dates for X axis
  const formatDate = (index) => {
    const date = new Date();
    date.setDate(date.getDate() - (safeData.length - 1 - index));
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ DEFINE Y TICKS
  const yTicks = 3; // will show 2, 4, 6 style labels

  const getIndexFromX = (svgX) => {
  const ratio = (svgX - padding.left) / chartWidth;
  const index = Math.round(ratio * (safeData.length - 1));
  return Math.max(0, Math.min(safeData.length - 1, index));
};


  return (
  <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block' }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * width;
        const index = getIndexFromX(x);
        setHoverIndex(index);
      }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      {/* X axis */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.35"
      />

      {/* Y axis */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.35"
      />

      {/* Y-axis labels */}
      {[0, 2, 4].map((value) => (
        <text
          key={`y-${value}`}
          x={padding.left - 2}
          y={getY(value) + 1}
          textAnchor="end"
          fontSize="2.6"
          fill="rgba(255,255,255,0.6)"
        >
          {value}
        </text>
      ))}

      {/* Hover vertical line */}
{hoverIndex !== null && (
  <line
    x1={getX(hoverIndex)}
    x2={getX(hoverIndex)}
    y1={padding.top}
    y2={padding.top + chartHeight}
    stroke="rgba(255,255,255,0.5)"
    strokeWidth="0.4"
    strokeDasharray="2,2"
  />
)}


      {/* Trend line */}
      <motion.path
        d={path}
        fill="none"
        stroke="#d42d43"
        strokeWidth="0.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.1, ease: 'easeInOut' }}
      />

      {/* Dots */}
      {safeData.map((d, i) => (
        <circle
          key={i}
          cx={getX(i)}
          cy={getY(d.value)}
          r="0.85"
          fill="transparent"
          stroke="#ce6925"
          strokeWidth="0.45"
        />
      ))}


      {/* Tooltip */}
{hoverIndex !== null && (
  <g
    transform={`translate(
      ${Math.min(getX(hoverIndex) + 2, width - 30)},
      ${padding.top + 6}
    )`}
  >
    <rect
      width="28"
      height="14"
      rx="1.5"
      fill="#ffffff"
      stroke="rgba(0,0,0,0.15)"
    />

    <text
      x="2"
      y="5"
      fontSize="2.4"
      fill="#0f172a"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {formatDate(hoverIndex)}
    </text>

    <text
      x="2"
      y="10"
      fontSize="2.4"
      fill="#0f172a"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      applications: {safeData[hoverIndex].value}
    </text>
  </g>
)}


      {/* X-axis date labels */}
      {safeData.map((_, i) => {
        const isLast = i === safeData.length - 1;
        const isSecondLast = i === safeData.length - 2;

        if (i % 4 !== 0 && !isLast) return null;
        if (isSecondLast) return null;

        return (
          <text
            key={`x-label-${i}`}
            x={Math.round(getX(i))}
            y={Math.round(padding.top + chartHeight + 8)}
            textAnchor="middle"
            fontSize="2.6"
            fill="rgba(255,255,255,0.65)"
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              textRendering: 'geometricPrecision'
            }}
          >
            {formatDate(i)}
          </text>
        );
      })}
    </svg>
  </div>
);

};

export default ApplicationTrendsChart;
