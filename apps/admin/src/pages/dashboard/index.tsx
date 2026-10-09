import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import ErrorOutlineOutlined from '@mui/icons-material/ErrorOutlineOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';

const kpiCards = [
  {
    title: 'Total Orders',
    value: '12,480',
    delta: '+12.4% vs last month',
    icon: <ShoppingBagOutlined fontSize="small" />,
  },
  {
    title: 'Total Products',
    value: '3,274',
    delta: '+4.1% vs last month',
    icon: <Inventory2Outlined fontSize="small" />,
  },
  {
    title: 'Active Users',
    value: '8,952',
    delta: '+9.7% vs last month',
    icon: <GroupOutlined fontSize="small" />,
  },
  {
    title: 'Revenue',
    value: '$248,900',
    delta: '+18.2% vs last month',
    icon: <AttachMoneyOutlined fontSize="small" />,
  },
];

const orderHealth = [
  { label: 'Delivered', value: 78 },
  { label: 'In Transit', value: 14 },
  { label: 'Processing', value: 6 },
  { label: 'Cancelled', value: 2 },
];

const recentActivities = [
  {
    title: 'Bulk order delivered',
    description: 'Order #RK-10982 was marked delivered by seller.',
    time: '2 min ago',
    icon: <CheckCircleOutlineOutlined fontSize="small" />,
  },
  {
    title: 'Shipment delay alert',
    description: '14 orders are approaching SLA threshold.',
    time: '18 min ago',
    icon: <LocalShippingOutlined fontSize="small" />,
  },
  {
    title: 'Refund dispute opened',
    description: 'A new dispute was opened for Order #RK-10921.',
    time: '47 min ago',
    icon: <ErrorOutlineOutlined fontSize="small" />,
  },
];

const revenueTrend = [
  { label: 'W1', value: 32000 },
  { label: 'W2', value: 41000 },
  { label: 'W3', value: 36500 },
  { label: 'W4', value: 48000 },
  { label: 'W5', value: 52500 },
  { label: 'W6', value: 46700 },
  { label: 'W7', value: 59000 },
  { label: 'W8', value: 63800 },
];

export const Dashboard = () => {
  const maxRevenue = Math.max(...revenueTrend.map((item) => item.value), 1);
  const minRevenue = Math.min(...revenueTrend.map((item) => item.value), 0);
  const chartWidth = 700;
  const chartHeight = 220;
  const yPadding = 20;
  const chartRange = Math.max(maxRevenue - minRevenue, 1);
  const linePoints = revenueTrend
    .map((item, index) => {
      const x = (index / (revenueTrend.length - 1)) * chartWidth;
      const y =
        chartHeight -
        ((item.value - minRevenue) / chartRange) *
          (chartHeight - yPadding * 2) -
        yPadding;
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = `0,${chartHeight} ${linePoints} ${chartWidth},${chartHeight}`;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        mb={3}
      >
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of operational performance and recent platform activity.
          </Typography>
        </Box>
        <Chip label="Updated 2 minutes ago" size="small" />
      </Stack>

      <Grid container spacing={2.5}>
        {kpiCards.map((card) => (
          <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" mb={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    {card.title}
                  </Typography>
                  <Avatar sx={{ width: 28, height: 28 }}>{card.icon}</Avatar>
                </Stack>
                <Typography variant="h4" mb={0.5}>
                  {card.value}
                </Typography>
                <Chip
                  size="small"
                  color="success"
                  icon={<TrendingUpOutlined fontSize="small" />}
                  label={card.delta}
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Revenue Trend</Typography>
                  <Chip size="small" label="Last 30 days" />
                </Stack>
                <Box
                  sx={{
                    height: 280,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    p: 2,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Stack
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      px: 2,
                      py: 1.5,
                      justifyContent: 'space-between',
                      pointerEvents: 'none',
                    }}
                  >
                    {[0, 1, 2, 3].map((line) => (
                      <Divider key={line} />
                    ))}
                  </Stack>

                  <Stack spacing={1} sx={{ height: '100%' }}>
                    <Box sx={{ position: 'relative', flex: 1 }}>
                      <Box
                        component="svg"
                        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                        preserveAspectRatio="none"
                        sx={{ width: '100%', height: '100%', display: 'block' }}
                      >
                        <polygon
                          points={areaPoints}
                          fill="currentColor"
                          opacity="0.12"
                          style={{
                            color: 'var(--mui-palette-primary-main)',
                          }}
                        />
                        <polyline
                          points={linePoints}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: 'var(--mui-palette-primary-main)' }}
                        />
                        {revenueTrend.map((item, index) => {
                          const x =
                            (index / (revenueTrend.length - 1)) * chartWidth;
                          const y =
                            chartHeight -
                            ((item.value - minRevenue) / chartRange) *
                              (chartHeight - yPadding * 2) -
                            yPadding;

                          return (
                            <circle
                              key={item.label}
                              cx={x}
                              cy={y}
                              r={index === revenueTrend.length - 1 ? 5 : 4}
                              fill="currentColor"
                              style={{
                                color: 'var(--mui-palette-primary-main)',
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>

                    <Stack direction="row" justifyContent="space-between">
                      {revenueTrend.map((item) => (
                        <Typography
                          key={item.label}
                          variant="caption"
                          color="text.secondary"
                        >
                          {item.label}
                        </Typography>
                      ))}
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Order Health</Typography>
                {orderHealth.map((item) => (
                  <Box key={item.label}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.75}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="body2">{item.value}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={item.value} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Recent Activity</Typography>
                {recentActivities.map((activity, index) => (
                  <Box key={activity.title}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Avatar sx={{ width: 30, height: 30 }}>
                        {activity.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {activity.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </Stack>
                    {index < recentActivities.length - 1 && (
                      <Divider sx={{ mt: 1.5 }} />
                    )}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Quick Summary</Typography>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={0.75}>
                    Pending approvals
                  </Typography>
                  <Typography variant="h5">24</Typography>
                </Box>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={0.75}>
                    Open disputes
                  </Typography>
                  <Typography variant="h5">7</Typography>
                </Box>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" mb={0.75}>
                    Average delivery time
                  </Typography>
                  <Typography variant="h5">2.8 days</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
