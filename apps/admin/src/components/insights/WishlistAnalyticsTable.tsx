import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import type { TopWishlistedProduct } from '../../api/insights.js';

interface WishlistAnalyticsTableProps {
  data: TopWishlistedProduct[];
  loading?: boolean;
}

export const WishlistAnalyticsTable = ({
  data,
  loading,
}: WishlistAnalyticsTableProps) => {
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
        <p>No wishlisted products found</p>
      </Box>
    );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <FavoriteBorderOutlined fontSize="small" />
                Wishlists
              </Box>
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                }}
              >
                <ShoppingCartOutlined fontSize="small" />
                Conversions
              </Box>
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600 }}>
              Conversion Rate
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((product) => {
            let conversionRate = parseFloat(product.conversionRate);
            // Handle NaN and clamp value to valid range [0-100]
            if (Number.isNaN(conversionRate)) {
              conversionRate = 0;
            } else {
              conversionRate = Math.max(0, Math.min(100, conversionRate));
            }
            return (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {product.title.length > 50
                      ? product.title.substring(0, 47) + '...'
                      : product.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {product.id}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <FavoriteBorderOutlined
                      sx={{ color: '#e91e63', fontSize: 18 }}
                    />
                    <Typography sx={{ fontWeight: 500 }}>
                      {product.wishlistCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                    }}
                  >
                    <ShoppingCartOutlined
                      sx={{ color: '#2196F3', fontSize: 18 }}
                    />
                    <Typography sx={{ fontWeight: 500 }}>
                      {product.conversionCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ minWidth: 60 }}>
                      <LinearProgress
                        variant="determinate"
                        value={conversionRate}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundColor:
                              conversionRate > 50 ? '#4caf50' : '#FF9800',
                          },
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ minWidth: 35, fontWeight: 500 }}
                    >
                      {conversionRate.toFixed(1)}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
