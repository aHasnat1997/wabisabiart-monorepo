import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { CustomersByRegionData } from '../../api/insights.js';
import { Box, CircularProgress } from '@mui/material';

interface CustomersRegionChartProps {
  data: CustomersByRegionData[];
  loading?: boolean;
  height?: number;
}

export const CustomersRegionChart = ({
  data,
  loading,
  height = 300,
}: CustomersRegionChartProps) => {
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
        <p>No regional data available</p>
      </Box>
    );

  const chartData = data.slice(0, 10).map((item) => {
    const parsedRevenue = parseFloat(item.totalRevenue);
    const revenue = Number.isFinite(parsedRevenue) ? parsedRevenue : 0;
    return {
      region:
        item.region.length > 15
          ? item.region.substring(0, 12) + '...'
          : item.region,
      customers: item.customerCount,
      orders: item.orderCount,
      revenue,
      fullRegion: item.region,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 0, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="region"
          stroke="#999"
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="#999" style={{ fontSize: '12px' }} />
        <Tooltip
          cursor={{ fill: 'rgba(33, 150, 243, 0.1)' }}
          content={({ active, payload }: any) => {
            if (active && payload && payload.length) {
              return (
                <Box
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.8)',
                    color: '#fff',
                    padding: 1,
                    borderRadius: 1,
                    fontSize: '12px',
                  }}
                >
                  <p>
                    <strong>{payload[0].payload.fullRegion}</strong>
                  </p>
                  <p>Customers: {payload[0].payload.customers}</p>
                  <p>Orders: {payload[0].payload.orders}</p>
                  <p>Revenue: ${payload[0].payload.revenue.toFixed(2)}</p>
                </Box>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Bar dataKey="customers" fill="#2196F3" name="Customers" />
        <Bar dataKey="orders" fill="#FF9800" name="Orders" />
      </BarChart>
    </ResponsiveContainer>
  );
};
