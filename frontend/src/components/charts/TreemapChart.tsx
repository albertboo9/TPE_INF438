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

interface TreemapPayload {
  name: string;
  size: number;
  percentage: number;
  color: string;
}

interface TreemapContentProps {
  root?: { depth: number; x: number; y: number; width: number; height: number };
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: TreemapPayload;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const CustomizedContent: React.FC<TreemapContentProps> = (props) => {
  const { depth, x, y, width, height, payload } = props;
  if (!payload || !depth || depth < 1) return null;
  const percentage = payload.percentage;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={payload.color}
        stroke="#fff"
        strokeWidth={2}
      />
      {width && height && width > 60 && height > 40 && (
        <>
          <text
            x={x! + width / 2}
            y={y! + height / 2 - 6}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight={600}
          >
            {payload.name}
          </text>
          <text
            x={x! + width / 2}
            y={y! + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={10}
          >
            {percentage}%
          </text>
        </>
      )}
    </g>
  );
};

export const TreemapChart: React.FC<TreemapChartProps> = ({ data, title }) => {
  const chartData: TreemapPayload[] = data.map((item, index) => ({
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
          content={<CustomizedContent />}
        >
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString()}`,
              'Sales',
            ]}
          />
        </RechartsTreemap>
      </ResponsiveContainer>
    </div>
  );
};