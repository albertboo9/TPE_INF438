import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { GlobalStats } from '../../types';

interface BarChartProps {
  stats: GlobalStats;
}

export const BarChart: React.FC<BarChartProps> = ({ stats }) => {
  const chartData = [
    {
      name: 'Total',
      value: stats.totalRevenue,
      color: '#10b981',
    },
    {
      name: 'Promotions',
      value: stats.promotionImpact,
      color: '#6366f1',
    },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-outline/20" />
          <XAxis 
            dataKey="name" 
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
          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};