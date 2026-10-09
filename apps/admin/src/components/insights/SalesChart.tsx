/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, CircularProgress } from '@mui/material';
import { ChartTooltip } from '../dashboard/chartTooltip/index.js';
import dayjs from 'dayjs';
import type { DailyChartData } from '../../api/insights.js';

interface SalesChartProps {
  data: DailyChartData[];
  loading?: boolean;
  chartType?: 'area' | 'bar';
  height?: number;
}

export const SalesChart = ({
  data,
  loading,
  chartType = 'area',
  height = 300,
}: SalesChartProps) => {
  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height,
        }}
      >
        <CircularProgress />
      </Box>
    );

  if (!data || data.length === 0)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height,
        }}
      >
        <p>No data available</p>
      </Box>
    );

  const formattedData = data.map((item) => {
    const parsedRevenue = parseFloat(item.revenue);
    const revenue = Number.isFinite(parsedRevenue) ? parsedRevenue : 0;
    return {
      ...item,
      revenue,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartType === 'area' ? (
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#999"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => dayjs(value).format('MMM DD')}
          />
          <YAxis
            stroke="#999"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={(value) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(Number(value))
                }
                labelFormatter={(label) => dayjs(label).format('MMM D, YYYY')}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#2196F3"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      ) : (
        <BarChart
          data={formattedData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            stroke="#999"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => dayjs(value).format('MMM DD')}
          />
          <YAxis stroke="#999" style={{ fontSize: '12px' }} />
          <Tooltip
            cursor={{ fill: 'rgba(33, 150, 243, 0.1)' }}
            content={
              <ChartTooltip
                labelFormatter={(label) => dayjs(label).format('MMM D, YYYY')}
              />
            }
          />
          <Legend />
          <Bar dataKey="revenue" fill="#2196F3" name="Revenue ($)" />
          <Bar dataKey="orders" fill="#FF9800" name="Orders" />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};
