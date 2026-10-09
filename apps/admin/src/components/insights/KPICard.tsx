import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
  subtext?: string;
}

export const KPICard = ({
  title,
  value,
  icon,
  trend,
  loading,
  subtext,
}: KPICardProps) => {
  const isNeutralTrend = /^[+-]?0+(\.0+)?%$/.test(trend || '');
  const isPositiveTrend = !isNeutralTrend && trend?.startsWith('+');

  const getTrendColor = () => {
    if (isNeutralTrend) return 'default';
    if (isPositiveTrend) return 'success';
    return 'error';
  };

  const getTrendIcon = () => {
    if (isNeutralTrend) return undefined;
    if (isPositiveTrend) return <TrendingUpOutlined fontSize="small" />;
    return <TrendingDownOutlined fontSize="small" />;
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" mb={1.5}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Avatar
            sx={{ width: 28, height: 28, bgcolor: 'rgba(33, 150, 243, 0.1)' }}
          >
            {icon}
          </Avatar>
        </Stack>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Typography variant="h5" mb={0.5}>
              {value}
            </Typography>
            {subtext && (
              <Typography variant="caption" color="text.secondary">
                {subtext}
              </Typography>
            )}
            {trend && (
              <Chip
                size="small"
                color={getTrendColor()}
                icon={getTrendIcon()}
                label={trend}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
