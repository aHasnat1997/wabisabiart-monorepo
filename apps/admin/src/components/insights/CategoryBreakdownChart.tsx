import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { CategoryBreakdownData } from '../../api/insights.js';
import { Box, CircularProgress } from '@mui/material';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownData[];
  loading?: boolean;
  height?: number;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82ca9d',
  '#ffc658',
  '#ff7c7c',
];

export const CategoryBreakdownChart = ({
  data,
  loading,
  height = 300,
}: CategoryBreakdownChartProps) => {
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
        <p>No category data available</p>
      </Box>
    );

  const chartData = data.map((item) => ({
    name: item.categoryName,
    value: parseFloat(item.percentage),
    revenue: item.totalRevenue,
    sales: item.totalSales,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
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
          <p>{payload[0].name}</p>
          <p>Revenue: ${payload[0].payload.revenue}</p>
          <p>Sales: {payload[0].payload.sales}</p>
          <p>{payload[0].value.toFixed(1)}%</p>
        </Box>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
