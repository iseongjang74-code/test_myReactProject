import React from 'react';
import { PricePoint } from '../types';

interface StockChartProps {
  data: PricePoint[];
  color: string;
}

const StockChart: React.FC<StockChartProps> = ({ data, color }) => {
  if (!data || data.length === 0) {
    return <div className="w-full h-48" />;
  }

  const prices = data.map(point => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const width = 100;
  const height = 48;
  const padding = 3;
  const innerHeight = height - padding * 2;
  const step = data.length > 1 ? width / (data.length - 1) : 0;

  const points = data.map((point, index) => {
    const x = index * step;
    const normalized = (point.price - min) / range;
    const y = padding + (1 - normalized) * innerHeight;
    return { x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="w-full h-48">
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="stockChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="0" y1={padding} x2={width} y2={padding} stroke="#e2e8f0" strokeOpacity="0.4" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#e2e8f0" strokeOpacity="0.2" />
        <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#e2e8f0" strokeOpacity="0.4" />

        <path d={`${path} L ${width} ${height - padding} L 0 ${height - padding} Z`} fill="url(#stockChartFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default StockChart;
