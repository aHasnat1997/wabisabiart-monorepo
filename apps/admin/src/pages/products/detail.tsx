import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router';
import { Product, productApi, Variant } from '../../api/product';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid2 as Grid,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNotification } from '@refinedev/core';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import { resolveMediaUrl } from '../../utils/index.js';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [productDetail, setProductDetail] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const { open } = useNotification();

  useEffect(() => {
    if (id) {
      productApi
        .getOne(id)
        .then((data) => {
          setProductDetail(data.data.data);
        })
        .catch((error) => console.error(error));
    }
  }, [id]);

  const handleApproveReject = (action: 'approved' | 'rejected') => {
    if (!id) return;
    productApi
      .approveOrReject(id, action)
      .then(() => {
        open?.({
          type: 'success',
          message: `Product ${action} successfully`,
        });
        void navigate('/products');
      })
      .catch((error) => {
        open?.({
          type: 'error',
          message: `Failed to ${action} product`,
        });
        console.error(error);
      });
  };

  if (!productDetail) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const discountedPrice =
    productDetail.discountType === 'percentage'
      ? Number(productDetail.price) *
        (1 - Number(productDetail.discountValue) / 100)
      : Number(productDetail.price) - Number(productDetail.discountValue);

  const handleVariantClick = (variant: Variant) => {
    const variantData = btoa(JSON.stringify(variant));
    searchParams.set('dialog', 'view-product-variant-detail');
    searchParams.set('variant', variantData);
    setSearchParams(searchParams);
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => void navigate('/products')}
          size={isMobile ? 'small' : 'medium'}
        >
          Back
        </Button>

        {productDetail.status === 'pending_review' && (
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleApproveReject('rejected')}
            >
              <ClearIcon sx={{ mr: 1 }} />
              Reject
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleApproveReject('approved')}
            >
              <CheckIcon sx={{ mr: 1 }} />
              Approve
            </Button>
          </Box>
        )}
      </Stack>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardMedia
              component="img"
              image={resolveMediaUrl(
                productDetail.variants[selectedVariant]?.mediaUrl,
              )}
              alt={productDetail.title}
              sx={{
                height: { xs: 250, sm: 350, md: 400 },
                objectFit: 'cover',
              }}
            />
          </Card>
          <Stack
            direction="row"
            spacing={1}
            mt={2}
            flexWrap="wrap"
            gap={1}
            sx={{
              display: { xs: 'flex' },
              justifyContent: { xs: 'center', sm: 'flex-start' },
            }}
          >
            {productDetail.variants.map((variant, idx) => (
              <Box
                key={variant.id}
                onClick={() => setSelectedVariant(idx)}
                sx={{
                  width: { xs: 60, sm: 70, md: 80 },
                  height: { xs: 60, sm: 70, md: 80 },
                  border: selectedVariant === idx ? '2px solid' : '1px solid',
                  borderColor:
                    selectedVariant === idx ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  cursor: 'pointer',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={resolveMediaUrl(variant.mediaUrl)}
                  alt={variant.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            <Box>
              {productDetail.badge && (
                <Chip
                  label={productDetail.badge.toUpperCase()}
                  color="success"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                fontWeight="bold"
                sx={{ wordBreak: 'break-word' }}
              >
                {productDetail.title}
              </Typography>
              <Typography
                variant={isMobile ? 'body2' : 'subtitle1'}
                color="text.secondary"
                mt={1}
                sx={{ wordBreak: 'break-word' }}
              >
                {productDetail.subtitle}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 1, sm: 2 }}
            >
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                fontWeight="bold"
                color="primary"
              >
                ${discountedPrice.toFixed(2)} {productDetail.currency}
              </Typography>
              {Number(productDetail.discountValue) > 0 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography
                    variant={isMobile ? 'body2' : 'h6'}
                    sx={{ textDecoration: 'line-through' }}
                    color="text.secondary"
                  >
                    ${productDetail.price}
                  </Typography>
                  <Chip
                    label={`-${productDetail.discountValue}${
                      productDetail.discountType === 'percentage' ? '%' : ' USD'
                    }`}
                    color="error"
                    size="small"
                  />
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <StarIcon sx={{ color: 'gold', fontSize: { xs: 18, sm: 24 } }} />
              <Typography variant={isMobile ? 'body2' : 'body1'}>
                {productDetail.averageRating} ({productDetail.salesCount} sales)
              </Typography>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                icon={<InventoryIcon />}
                label={`Stock: ${productDetail.totalQuantity}`}
                size={isMobile ? 'small' : 'medium'}
              />
              <Chip
                icon={<LocalShippingIcon />}
                label={`${productDetail.processingTime} days`}
                size={isMobile ? 'small' : 'medium'}
              />
              <Chip
                label={productDetail.status.toUpperCase()}
                color={
                  productDetail.status === 'active' ? 'success' : 'default'
                }
                size={isMobile ? 'small' : 'medium'}
              />
              {productDetail.isFeatured && (
                <Chip
                  label="FEATURED"
                  color="primary"
                  size={isMobile ? 'small' : 'medium'}
                />
              )}
              {productDetail.customizable && (
                <Chip
                  label="CUSTOMIZABLE"
                  size={isMobile ? 'small' : 'medium'}
                />
              )}
              {productDetail.handmade && (
                <Chip label="HANDMADE" size={isMobile ? 'small' : 'medium'} />
              )}
              {productDetail.madeToOrder && (
                <Chip
                  label="MADE TO ORDER"
                  size={isMobile ? 'small' : 'medium'}
                />
              )}
            </Stack>

            <Divider />

            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Category
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip
                  label={productDetail.categoryType}
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
                <Chip
                  label={productDetail.category?.name ?? '-'}
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
                <Chip
                  label={productDetail.subCategory?.name ?? '-'}
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
              </Stack>
            </Box>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Seller Information
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={resolveMediaUrl(productDetail.seller.avatarUrl)}
                    alt={productDetail.seller.fullName}
                    sx={{
                      width: { xs: 40, sm: 50 },
                      height: { xs: 40, sm: 50 },
                      borderRadius: '50%',
                    }}
                  />
                  <Box sx={{ overflow: 'hidden' }}>
                    <Typography
                      variant={isMobile ? 'body2' : 'body1'}
                      fontWeight="bold"
                      sx={{ wordBreak: 'break-word' }}
                    >
                      {productDetail.seller.fullName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        wordBreak: 'break-all',
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      }}
                    >
                      {productDetail.seller.email}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Box mt={{ xs: 3, md: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v: number) => setActiveTab(v)}
          variant={isMobile ? 'fullWidth' : 'standard'}
          sx={{
            '& .MuiTab-root': {
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 40, sm: 48 },
            },
          }}
        >
          <Tab label="Description" />
          <Tab label={`Variants (${productDetail.variants.length})`} />
        </Tabs>

        {activeTab === 0 && (
          <Card sx={{ mt: 2 }}>
            <CardContent
              sx={{
                p: { xs: 2, sm: 3 },
                '& p': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& strong': { fontSize: { xs: '1rem', sm: '1.125rem' } },
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: productDetail.description }}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 1 && (
          <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} mt={1}>
            {productDetail.variants.map((variant) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={variant.id}>
                <Card
                  sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
                  onClick={() => handleVariantClick(variant)}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'center', sm: 'flex-start' }}
                    >
                      <Box
                        component="img"
                        src={resolveMediaUrl(variant.mediaUrl)}
                        alt={variant.name}
                        sx={{
                          width: { xs: '100%', sm: 100 },
                          height: { xs: 200, sm: 100 },
                          borderRadius: 1,
                          objectFit: 'cover',
                        }}
                      />
                      <Box flex={1} width={{ xs: '100%', sm: 'auto' }}>
                        <Typography
                          variant={isMobile ? 'subtitle1' : 'h6'}
                          gutterBottom
                          sx={{ wordBreak: 'break-word' }}
                        >
                          {variant.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          Quantity: {variant.quantity}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          gap={0.5}
                          mb={1}
                        >
                          {variant.isActive && (
                            <Chip label="Active" color="success" size="small" />
                          )}
                          {variant.isLowStock && (
                            <Chip
                              label="Low Stock"
                              color="warning"
                              size="small"
                            />
                          )}
                        </Stack>
                        <Box>
                          {variant.options
                            .slice(0, isMobile ? 2 : 3)
                            .map((opt, idx) => (
                              <Typography
                                key={idx}
                                variant="caption"
                                display="block"
                                sx={{
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                }}
                              >
                                {opt.name}:{' '}
                                {opt.type === 'color_picker' ? (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-block',
                                      width: { xs: 14, sm: 16 },
                                      height: { xs: 14, sm: 16 },
                                      bgcolor: opt.value,
                                      border: '1px solid',
                                      borderRadius: '50%',
                                      ml: 0.5,
                                      verticalAlign: 'middle',
                                    }}
                                  />
                                ) : (
                                  opt.value
                                )}
                              </Typography>
                            ))}
                          {variant.options.length > (isMobile ? 2 : 3) && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              }}
                            >
                              +{variant.options.length - (isMobile ? 2 : 3)}{' '}
                              more
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}
