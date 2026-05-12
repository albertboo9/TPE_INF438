import React from 'react';
import {
  Treemap as RechartsTreemap,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { CategoryStat } from '../../types';

interface TreemapChartProps {
  data: CategoryStat[];
  title?: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const TreemapChart: React.FC<TreemapChartProps> = ({ data, title }) => {
  const chartData = data.map((item, index) => ({
    name: item.categorie_groupe,
    size: item.totalSales,
    percentage: item.percentage,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="w-full h-80">
      {title && <h3 className="font-h2 text-on-background mb-base">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsTreemap
          data={chartData}
          dataKey="size"
          ratio={4 / 3}
          stroke="#fff"
          strokeWidth={2}
          fill={(entry) => entry.color}
          content={({ root, depth, x, y, width, height, index, payload }) => {
            if (!payload || depth < 1) return null;
            const percentage = payload.percentage as number;
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={payload.color as string}
                  stroke="#fff"
                  strokeWidth={2}
                />
                {width > 60 && height > 40 && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2 - 6}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={12}
                    fontWeight={600}
                  >
                    {payload.name}
                  </text>
                )}
                {width > 60 && height > 40 && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 10}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={10}
                  >
                    {percentage}%
                  </text>
                )}
              </g>
            );
          }}
        >
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`,
              'Sales',
            ]}
          />
        </RechartsTreemap>
      </ResponsiveContainer>
    </div>
  );
};