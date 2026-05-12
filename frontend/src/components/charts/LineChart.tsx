import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TemporalData } from '../../types';

interface LineChartProps {
  data: TemporalData[];
  title?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const chartData = data.map((item) => ({
    date: `${item.year}-${item.month}-${item.dayOfWeek}`,
    sales: item.sales,
  }));

  return (
    <div className="w-full h-80">
      {title && <h3 className="font-h2 text-on-background mb-base">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-outline/20" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-on-surface-variant"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-on-surface-variant"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};