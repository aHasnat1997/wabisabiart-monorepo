import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Avatar,
  Typography,
  Rating,
  CircularProgress,
} from '@mui/material';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlined from '@mui/icons-material/TrendingDownOutlined';
import type { TopProductData } from '../../api/insights.js';
import { resolveMediaUrl } from '../../utils/index.js';

interface TopProductsTableProps {
  data: TopProductData[];
  loading?: boolean;
}

export const TopProductsTable = ({ data, loading }: TopProductsTableProps) => {
  if (loading)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
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
          minHeight: 400,
        }}
      >
        <p>No products found</p>
      </Box>
    );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Units Sold
            </TableCell>
            <TableCell align="right" sx={{ fontWeight: 600 }}>
              Revenue
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Rating
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Reviews
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Trend
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    src={resolveMediaUrl(product.imageUrl)}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {product.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {product.id}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">{product.totalSold}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                ${product.totalRevenue}
              </TableCell>
              <TableCell align="center">
                <Rating
                  value={Number(product.averageRating)}
                  readOnly
                  size="small"
                />
              </TableCell>
              <TableCell align="center">{product.reviewCount}</TableCell>
              <TableCell align="center">
                {product.trend
                  ? (() => {
                      // Parse numeric value from trend string
                      const trendValue = parseFloat(
                        product.trend.replace('%', ''),
                      );
                      const isPositive = trendValue > 0;
                      const isNeutral = trendValue === 0;

                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 0.5,
                            color: isNeutral
                              ? '#9e9e9e'
                              : isPositive
                              ? '#4caf50'
                              : '#f44336',
                          }}
                        >
                          {isNeutral ? (
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 500 }}
                            >
                              -
                            </Typography>
                          ) : isPositive ? (
                            <>
                              <TrendingUpOutlined fontSize="small" />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 500 }}
                              >
                                {product.trend}
                              </Typography>
                            </>
                          ) : (
                            <>
                              <TrendingDownOutlined fontSize="small" />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 500 }}
                              >
                                {product.trend}
                              </Typography>
                            </>
                          )}
                        </Box>
                      );
                    })()
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
