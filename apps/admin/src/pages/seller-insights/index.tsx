import { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';

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
import AttachMoneyOutlined from '@mui/icons-material/AttachMoneyOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';
import ShoppingBagOutlined from '@mui/icons-material/ShoppingBagOutlined';
import FavoriteBorderOutlined from '@mui/icons-material/FavoriteBorderOutlined';
// import PublicOutlined from '@mui/icons-material/PublicOutlined';
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

//export const SellerInsights = () => {
export const SellerInsights: React.FC<{ sellerId?: string }> = ({
  sellerId,
}) => {
  const [range, setRange] = useState<DateRange>('30');

  // Sales & Income State
  const [salesIncomeData, setSalesIncomeData] =
    useState<SalesIncomeData | null>(null);
  const [salesIncomeLoading, setSalesIncomeLoading] = useState(false);
  const [salesIncomeError, setSalesIncomeError] = useState<string | null>(null);

  // Top Products State
  const [topProductsData, setTopProductsData] = useState<TopProductData[]>([]);
  const [topProductsLoading, setTopProductsLoading] = useState(false);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);

  // Wishlist Analytics State
  const [wishlistData, setWishlistData] =
    useState<WishlistAnalyticsData | null>(null);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  // Sales by Category State
  const [categoryData, setCategoryData] = useState<CategoryBreakdownData[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Customers by Region State
  const [regionData, setRegionData] = useState<CustomersByRegionData[]>([]);
  const [regionLoading, setRegionLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);

  const fetchSalesIncome = useCallback(async () => {
    try {
      setSalesIncomeLoading(true);
      setSalesIncomeError(null);
      const response = sellerId
        ? await insightsApi.admin.getSalesIncome(range, sellerId)
        : await insightsApi.seller.getSalesIncome(range);
      setSalesIncomeData(response.data.data);
    } catch (error) {
      setSalesIncomeError(getErrorMessage(error, 'Failed to load sales data'));
    } finally {
      setSalesIncomeLoading(false);
    }
  }, [range, sellerId]);

  const fetchTopProducts = useCallback(async () => {
    try {
      setTopProductsLoading(true);
      setTopProductsError(null);
      const response = sellerId
        ? await insightsApi.admin.getTopProducts(range, 10, sellerId)
        : await insightsApi.seller.getTopProducts(range, 10);
      setTopProductsData(response.data.data);
    } catch (error) {
      setTopProductsError(
        getErrorMessage(error, 'Failed to load product data'),
      );
    } finally {
      setTopProductsLoading(false);
    }
  }, [range, sellerId]);

  const fetchWishlistAnalytics = useCallback(async () => {
    try {
      setWishlistLoading(true);
      setWishlistError(null);
      const response = sellerId
        ? await insightsApi.admin.getWishlistAnalytics(range, sellerId)
        : await insightsApi.seller.getWishlistAnalytics(range);
      setWishlistData(response.data.data);
    } catch (error) {
      setWishlistError(getErrorMessage(error, 'Failed to load wishlist data'));
    } finally {
      setWishlistLoading(false);
    }
  }, [range, sellerId]);

  const fetchSalesByCategory = useCallback(async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);
      const response = sellerId
        ? await insightsApi.admin.getSalesByCategory(range, sellerId)
        : await insightsApi.seller.getSalesByCategory(range);
      setCategoryData(response.data.data);
    } catch (error) {
      setCategoryError(getErrorMessage(error, 'Failed to load category data'));
    } finally {
      setCategoryLoading(false);
    }
  }, [range, sellerId]);

  const fetchCustomersByRegion = useCallback(async () => {
    try {
      setRegionLoading(true);
      setRegionError(null);
      const response = sellerId
        ? await insightsApi.admin.getCustomersByRegion(range, sellerId)
        : await insightsApi.seller.getCustomersByRegion(range);
      setRegionData(response.data.data);
    } catch (error) {
      setRegionError(getErrorMessage(error, 'Failed to load region data'));
    } finally {
      setRegionLoading(false);
    }
  }, [range, sellerId]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchSalesIncome(),
      fetchTopProducts(),
      fetchWishlistAnalytics(),
      fetchSalesByCategory(),
      fetchCustomersByRegion(),
    ]);
  }, [
    fetchSalesIncome,
    fetchTopProducts,
    fetchWishlistAnalytics,
    fetchSalesByCategory,
    fetchCustomersByRegion,
  ]);

  // Fetch all data when range or sellerId changes
  useEffect(() => {
    void fetchAllData();
  }, [range, sellerId, fetchAllData]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        mb={3}
        spacing={2}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Store Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Analytics and performance metrics for your store
          </Typography>
        </Box>
        <DateRangeSelector range={range} onRangeChange={setRange} />
      </Stack>

      {/* SALES & INCOME SECTION */}
      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Sales & Income
        </Typography>

        {salesIncomeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {salesIncomeError}
          </Alert>
        )}

        {/* KPI Cards */}
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KPICard
              title="Total Revenue"
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

        {/* Revenue Chart */}
        <Card>
          <CardHeader title="Revenue Trend" subheader="Daily sales over time" />
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

      {/* TOP PRODUCTS SECTION */}
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
            subheader="Ranked by revenue"
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

      {/* WISHLIST ANALYTICS SECTION */}
      <Box mb={4}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Wishlist Analytics
        </Typography>

        {wishlistError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {wishlistError}
          </Alert>
        )}

        {/* Wishlist KPI Cards */}
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
              title="Conversions"
              value={wishlistData?.wishlistConversions || 0}
              icon={<ShoppingBagOutlined fontSize="small" />}
              loading={wishlistLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Conversion Rate
                </Typography>
                {wishlistLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  <Typography variant="h4">
                    {wishlistData?.conversionRate}%
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Wishlisted Products */}
        <Card>
          <CardHeader
            title="Top Wishlisted Products"
            subheader="Products with most wishlist adds"
          />
          <CardContent>
            <WishlistAnalyticsTable
              data={wishlistData?.topWishlistedProducts || []}
              loading={wishlistLoading}
            />
          </CardContent>
        </Card>
      </Box>

      {/* SALES BY CATEGORY SECTION */}
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
                subheader="Revenue breakdown by category"
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

      {/* CUSTOMERS BY REGION SECTION */}
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
            subheader="Customer and order distribution by region"
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
