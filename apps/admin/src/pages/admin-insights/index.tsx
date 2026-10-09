import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid2 as Grid,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  TextField,
} from '@mui/material';
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
import CategoryOutlined from '@mui/icons-material/CategoryOutlined';
import {
  DateRangeSelector,
  KPICard,
  SalesChart,
  TopProductsTable,
  CategoryBreakdownChart,
  CustomersRegionChart,
  WishlistAnalyticsTable,
} from '../../components/insights/index.js';
import {
  insightsApi,
  type DateRange,
  type SalesIncomeData,
  type TopProductData,
  type WishlistAnalyticsData,
  type CategoryBreakdownData,
  type CustomersByRegionData,
} from '../../api/insights.js';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    const message = (err.response as Record<string, unknown>)?.data as
      | Record<string, unknown>
      | undefined;
    if (message?.message && typeof message.message === 'string') {
      return message.message;
    }
  }
  return defaultMessage;
};

export const AdminInsights: React.FC = () => {
  const [range, setRange] = useState<DateRange>('30');
  const [sellerId, setSellerId] = useState<string>('');

  const [salesIncomeData, setSalesIncomeData] =
    useState<SalesIncomeData | null>(null);
  const [salesIncomeLoading, setSalesIncomeLoading] = useState(false);
  const [salesIncomeError, setSalesIncomeError] = useState<string | null>(null);

  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(false);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);

  const [wishlistData, setWishlistData] =
    useState<WishlistAnalyticsData | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  const [categoryData, setCategoryData] = useState<CategoryBreakdownData[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [regionData, setRegionData] = useState<CustomersByRegionData[]>([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);

  useEffect(() => {
    const sellerIdParam = sellerId || undefined;

    setSalesIncomeLoading(true);
    setSalesIncomeError(null);
    setSalesIncomeData(null);
    setTopProductsLoading(true);
    setTopProductsError(null);
    setTopProductsData([]);
    setWishlistLoading(true);
    setWishlistError(null);
    setWishlistData(null);
    setCategoryLoading(true);
    setCategoryError(null);
    setCategoryData([]);
    setRegionLoading(true);
    setRegionError(null);
    setRegionData([]);

    void Promise.allSettled([
      insightsApi.admin
        .getSalesIncome(range, sellerIdParam)
        .then((r) => setSalesIncomeData(r.data.data))
        .catch((e) =>
          setSalesIncomeError(getErrorMessage(e, 'Failed to load sales data')),
        )
        .finally(() => setSalesIncomeLoading(false)),

      insightsApi.admin
        .getTopProducts(range, 10, sellerIdParam)
        .then((r) => setTopProductsData(r.data.data))
        .catch((e) =>
          setTopProductsError(
            getErrorMessage(e, 'Failed to load product data'),
          ),
        )
        .finally(() => setTopProductsLoading(false)),

      insightsApi.admin
        .getWishlistAnalytics(range, sellerIdParam)
        .then((r) => setWishlistData(r.data.data))
        .catch((e) =>
          setWishlistError(getErrorMessage(e, 'Failed to load wishlist data')),
        )
        .finally(() => setWishlistLoading(false)),

      insightsApi.admin
        .getSalesByCategory(range, sellerIdParam)
        .then((r) => setCategoryData(r.data.data))
        .catch((e) =>
          setCategoryError(getErrorMessage(e, 'Failed to load category data')),
        )
        .finally(() => setCategoryLoading(false)),

      insightsApi.admin
        .getCustomersByRegion(range, sellerIdParam)
        .then((r) => setRegionData(r.data.data))
        .catch((e) =>
          setRegionError(getErrorMessage(e, 'Failed to load region data')),
        )
        .finally(() => setRegionLoading(false)),
    ]);
  }, [range, sellerId]); // ✅ only primitives — no infinite loop

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Platform Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics and performance metrics for the entire platform
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <TextField
            size="small"
            placeholder="Filter by Seller ID (optional)"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            sx={{ minWidth: 200, display: 'none' }}
          />
          <DateRangeSelector range={range} onRangeChange={setRange} />
        </Stack>
      </Stack>

      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Overall Sales & Income
        </Typography>
        {salesIncomeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {salesIncomeError}
          </Alert>
        )}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Total Platform Revenue"
              value={`$${salesIncomeData?.totalRevenue || '0.00'}`}
              icon={<AttachMoneyOutlined fontSize="small" />}
              trend={salesIncomeData?.revenueGrowth}
              loading={salesIncomeLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Total Orders"
              value={salesIncomeData?.totalOrders || 0}
              icon={<ShoppingBagOutlined fontSize="small" />}
              trend={salesIncomeData?.ordersGrowth}
              loading={salesIncomeLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Average Order Value"
              value={`$${salesIncomeData?.averageOrderValue || '0.00'}`}
              icon={<TrendingUpOutlined fontSize="small" />}
              loading={salesIncomeLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Revenue Breakdown
                </Typography>
                {salesIncomeLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Stack spacing={0.5}>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="caption">Product Sales</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        ${salesIncomeData?.revenueBreakdown?.productSales ?? 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="caption">Shipping</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        ${salesIncomeData?.revenueBreakdown?.shippingFees ?? 0}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="caption">Tips</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        ${salesIncomeData?.revenueBreakdown?.tips ?? 0}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Card>
          <CardHeader
            title="Revenue Trend"
            subheader="Daily platform revenue over time"
          />
          <CardContent>
            <SalesChart
              data={salesIncomeData?.dailyData || []}
              loading={salesIncomeLoading}
              chartType="area"
              height={300}
            />
          </CardContent>
        </Card>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Top Products
        </Typography>
        {topProductsError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {topProductsError}
          </Alert>
        )}
        <Card>
          <CardHeader
            title="Best Performing Products"
            subheader="Platform-wide top products ranked by revenue"
            avatar={<CategoryOutlined />}
          />
          <CardContent>
            <TopProductsTable
              data={topProductsData}
              loading={topProductsLoading}
            />
          </CardContent>
        </Card>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Wishlist Analytics
        </Typography>
        {wishlistError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {wishlistError}
          </Alert>
        )}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Total Wishlists"
              value={wishlistData?.totalWishlists || 0}
              icon={<FavoriteBorderOutlined fontSize="small" />}
              trend={wishlistData?.wishlistGrowth}
              loading={wishlistLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Wishlist Conversions"
              value={wishlistData?.wishlistConversions || 0}
              icon={<ShoppingBagOutlined fontSize="small" />}
              loading={wishlistLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Overall Conversion Rate
                </Typography>
                {wishlistLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <Typography variant="h4">
                    {wishlistData?.conversionRate}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Card>
          <CardHeader
            title="Top Wishlisted Products"
            subheader="Platform-wide most wishlisted products"
          />
          <CardContent>
            <WishlistAnalyticsTable
              data={wishlistData?.topWishlistedProducts || []}
              loading={wishlistLoading}
            />
          </CardContent>
        </Card>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Sales by Category
        </Typography>
        {categoryError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {categoryError}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardHeader
                title="Category Distribution"
                subheader="Platform revenue breakdown by category"
              />
              <CardContent>
                <CategoryBreakdownChart
                  data={categoryData}
                  loading={categoryLoading}
                  height={350}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardHeader title="Category Details" />
              <CardContent sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {categoryLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : categoryData.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {categoryData.map((category) => (
                      <Box
                        key={category.categoryId}
                        sx={{
                          p: 1.5,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {category.categoryName}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: '#2196F3' }}
                          >
                            {category.percentage}%
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2}>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Revenue
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              ${category.totalRevenue}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Sales
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {category.totalSales}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Customers by Region
        </Typography>
        {regionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {regionError}
          </Alert>
        )}
        <Card>
          <CardHeader
            title="Regional Distribution"
            subheader="Customer and order distribution globally"
          />
          <CardContent>
            <CustomersRegionChart
              data={regionData}
              loading={regionLoading}
              height={350}
            />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
