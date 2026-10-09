/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ArrowBack from '@mui/icons-material/ArrowBack';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import CancelOutlined from '@mui/icons-material/CancelOutlined';
import Analytics from '@mui/icons-material/Analytics';
import Star from '@mui/icons-material/Star';
import StarBorder from '@mui/icons-material/StarBorder';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { shopAdminApi, type AdminShopRecord } from '../../api/shop.js';
import {
  orderAdminSellerApi,
  type SellerOrderSummary,
} from '../../api/order.js';
import { SellerInsights } from '../seller-insights/index.js';
import { resolveMediaUrl } from '../../utils/index.js';

const getStatus = (record: AdminShopRecord) => {
  if (record.sellerProfile) return 'approved';
  return record.shopSetupRequest?.status || 'pending';
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value || '-'}</Typography>
  </Stack>
);

const SummaryStat = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <Box
    sx={{
      p: 1.5,
      border: 1,
      borderColor: 'divider',
      borderRadius: 2,
      height: '100%',
    }}
  >
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
  </Box>
);

export const ShopDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState<AdminShopRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSummary, setOrderSummary] = useState<SellerOrderSummary | null>(
    null,
  );
  const [orderSummaryLoading, setOrderSummaryLoading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const res = await shopAdminApi.getOne(id);
      setRecord(res.data.data);
      setLoading(false);
    };

    void load();
  }, [id]);

  useEffect(() => {
    const loadOrderSummary = async () => {
      if (!record?.sellerProfile?.id) return;
      try {
        setOrderSummaryLoading(true);
        const res = await orderAdminSellerApi.getSellerOrderSummary(
          record.sellerProfile.id,
        );
        setOrderSummary(res.data.data);
      } catch {
        // Silently handle error - seller may not have orders yet
      } finally {
        setOrderSummaryLoading(false);
      }
    };

    void loadOrderSummary();
  }, [record?.sellerProfile?.id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!record) {
    return <Alert severity="error">Shop not found.</Alert>;
  }

  const status = getStatus(record);
  const shop = record.sellerProfile || record.shopSetupRequest;
  const totalOrders = orderSummary?.totalOrders ?? 0;
  const pendingShipment = orderSummary?.pendingShipment ?? 0;
  const cancelledOrders = orderSummary?.cancelledOrders ?? 0;
  const totalRevenue = parseFloat(orderSummary?.totalRevenue ?? '0');
  const activeOrders = Math.max(totalOrders - cancelledOrders, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const cancellationRate =
    totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

  const openMediaPreview = (url?: string, label = 'File') => {
    const resolvedUrl = resolveMediaUrl(url);
    if (!resolvedUrl) return;
    setPreviewMedia({ url: resolvedUrl, label });
  };

  const closeMediaPreview = () => setPreviewMedia(null);

  const handleApprove = async () => {
    if (!id) return;
    setSubmitting(true);
    const res = await shopAdminApi.approve(id);
    setRecord(res.data.data);
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!id) return;
    setSubmitting(true);
    const res = (await shopAdminApi.reject(id)) as {
      data: { data: AdminShopRecord };
    };
    setRecord(res.data.data);
    setSubmitting(false);
  };

  const handleFeaturedToggle = async () => {
    if (!id || !record?.sellerProfile) return;

    setSubmitting(true);
    const res = await shopAdminApi.setFeatured(
      id,
      !record.sellerProfile.isFeatured,
    );
    setRecord(res.data.data);
    setSubmitting(false);
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          startIcon={<ArrowBack />}
          color="inherit"
          onClick={() => void navigate('/shops')}
        >
          Back to shops
        </Button>
      </Box>

      {/* Tabs for Overview and Store Insights */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue: number) => setTabValue(newValue)}
        >
          <Tab
            label="Overview"
            icon={<CheckCircleOutline />}
            iconPosition="start"
          />
          <Tab
            label="Store Insights"
            icon={<Analytics />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Overview Tab Content */}
      {tabValue === 0 && (
        <>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={resolveMediaUrl(record?.avatarUrl)}
                alt={record?.fullName}
                sx={{ width: 56, height: 56 }}
              >
                {record?.fullName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {shop?.shopName || 'Unnamed shop'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {record?.fullName} • {record?.email}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label={status}
                color={
                  status === 'approved'
                    ? 'success'
                    : status === 'pending'
                    ? 'warning'
                    : 'error'
                }
              />
              {record?.sellerProfile?.isFeatured && (
                <Chip label="Featured" color="primary" icon={<Star />} />
              )}
              {record?.shopSetupRequest?.status === 'pending' &&
                !record?.sellerProfile && (
                  <>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircleOutline />}
                      onClick={() => void handleApprove()}
                      disabled={submitting}
                    >
                      Approve shop
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelOutlined />}
                      onClick={() => void handleReject()}
                      disabled={submitting}
                    >
                      Reject shop
                    </Button>
                  </>
                )}
              {record?.sellerProfile && (
                <Button
                  variant={
                    record.sellerProfile.isFeatured ? 'outlined' : 'contained'
                  }
                  color="primary"
                  startIcon={
                    record.sellerProfile.isFeatured ? <StarBorder /> : <Star />
                  }
                  onClick={() => void handleFeaturedToggle()}
                  disabled={submitting}
                >
                  {record.sellerProfile.isFeatured
                    ? 'Remove Featured'
                    : 'Mark Featured'}
                </Button>
              )}
            </Stack>
          </Stack>

          {record?.shopSetupRequest?.status === 'pending' &&
            !record?.sellerProfile && (
              <Alert severity="warning">
                This seller has submitted a shop request. Approving it will
                create the seller profile.
              </Alert>
            )}

          {record?.sellerProfile?.verificationDate && (
            <Alert severity="success">
              Approved on{' '}
              {new Date(record.sellerProfile.verificationDate).toLocaleString()}
              .
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6">Seller</Typography>
                      <InfoRow label="Full name" value={record.fullName} />
                      <InfoRow label="Email" value={record.email} />
                      <InfoRow
                        label="Seller joined"
                        value={new Date(record.createdAt).toLocaleString()}
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {record.sellerProfile && (
                  <Card sx={{ height: '100%', minHeight: { md: 360 } }}>
                    <CardContent>
                      {orderSummaryLoading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                          <CircularProgress size={40} />
                        </Box>
                      ) : orderSummary ? (
                        <Stack spacing={2}>
                          <Typography variant="h6">Order Summary</Typography>
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 6 }}>
                              <SummaryStat
                                label="Total Orders"
                                value={totalOrders}
                              />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <SummaryStat
                                label="Pending Shipment"
                                value={pendingShipment}
                              />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <SummaryStat
                                label="Cancelled Orders"
                                value={cancelledOrders}
                              />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                              <SummaryStat
                                label="Total Revenue"
                                value={`$${totalRevenue.toFixed(2)}`}
                              />
                            </Grid>
                          </Grid>
                          <Divider />
                          <Grid container spacing={1.5}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoRow
                                label="Active orders"
                                value={String(activeOrders)}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoRow
                                label="Cancellation rate"
                                value={`${cancellationRate.toFixed(1)}%`}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoRow
                                label="Average order value"
                                value={`$${averageOrderValue.toFixed(2)}`}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <InfoRow
                                label="Shipping readiness"
                                value={`${
                                  totalOrders > 0
                                    ? (
                                        ((totalOrders - pendingShipment) /
                                          totalOrders) *
                                        100
                                      ).toFixed(1)
                                    : '0.0'
                                }%`}
                              />
                            </Grid>
                          </Grid>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No order data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ height: '100%', minHeight: { md: 360 } }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Shop details</Typography>
                    <InfoRow label="Shop name" value={shop?.shopName} />
                    <InfoRow
                      label="Description"
                      value={shop?.shopDescription}
                    />
                    <InfoRow label="Address" value={shop?.address} />
                    <InfoRow
                      label="Admin note"
                      value={record.shopSetupRequest?.reviewNote}
                    />
                    <Divider />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Shop logo
                        </Typography>
                        <Box mt={1}>
                          {shop?.shopLogo ? (
                            <Box
                              component="img"
                              src={
                                resolveMediaUrl(shop.shopLogo) ||
                                '/placeholders/image-placeholder.png'
                              }
                              alt={shop.shopName}
                              sx={{
                                width: 96,
                                height: 96,
                                objectFit: 'cover',
                                borderRadius: 2,
                              }}
                            />
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Banner image
                        </Typography>
                        <Box mt={1}>
                          {shop?.shopBannerImage ? (
                            <Box
                              component="img"
                              src={
                                resolveMediaUrl(shop.shopBannerImage) ||
                                '/placeholders/image-placeholder.png'
                              }
                              alt={`${shop.shopName} banner`}
                              sx={{
                                width: '100%',
                                maxHeight: 220,
                                objectFit: 'cover',
                                borderRadius: 2,
                              }}
                            />
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Verification files</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Proof of identity
                    </Typography>
                    <Box>
                      {shop?.proofOfIdentity ? (
                        <Box
                          component="img"
                          src={
                            resolveMediaUrl(shop.proofOfIdentity) ||
                            '/placeholders/image-placeholder.png'
                          }
                          alt="Proof of identity"
                          onClick={() =>
                            openMediaPreview(
                              shop.proofOfIdentity,
                              'Proof of identity',
                            )
                          }
                          sx={{
                            width: 120,
                            height: 120,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider',
                            cursor: 'pointer',
                          }}
                        />
                      ) : (
                        <Typography variant="body2">-</Typography>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Sample products
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {(shop?.sampleProducts || []).length > 0 ? (
                        (shop?.sampleProducts || []).map((sample, index) => (
                          <Box
                            key={sample}
                            component="img"
                            src={
                              resolveMediaUrl(sample) ||
                              '/placeholders/image-placeholder.png'
                            }
                            alt="Sample product"
                            onClick={() =>
                              openMediaPreview(
                                sample,
                                `Sample product ${index + 1}`,
                              )
                            }
                            sx={{
                              width: 88,
                              height: 88,
                              objectFit: 'cover',
                              borderRadius: 2,
                              cursor: 'pointer',
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2">
                          No sample products attached.
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="h6">Compliance</Typography>
                    <InfoRow
                      label="Agreed to terms"
                      value={
                        record.shopSetupRequest?.isAgreedToTermsAndConditions
                          ? 'Yes'
                          : record.shopSetupRequest
                          ? 'No'
                          : 'Approved profile'
                      }
                    />
                    <InfoRow
                      label="Handcrafted or ethically sourced"
                      value={
                        record.shopSetupRequest?.isHandcraftedOrEthicallySourced
                          ? 'Yes'
                          : record.shopSetupRequest
                          ? 'No'
                          : 'Approved profile'
                      }
                    />
                    <InfoRow
                      label="Submitted at"
                      value={
                        record.shopSetupRequest?.createdAt
                          ? new Date(
                              record.shopSetupRequest.createdAt,
                            ).toLocaleString()
                          : undefined
                      }
                    />
                    <InfoRow
                      label="Reviewed at"
                      value={
                        record.shopSetupRequest?.reviewedAt
                          ? new Date(
                              record.shopSetupRequest.reviewedAt,
                            ).toLocaleString()
                          : record.sellerProfile?.verificationDate
                          ? new Date(
                              record.sellerProfile.verificationDate,
                            ).toLocaleString()
                          : undefined
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {/* Store Insights Tab Content */}
      {tabValue === 1 && record?.sellerProfile?.id && (
        <Box sx={{ py: 2 }}>
          <SellerInsights sellerId={record.sellerProfile.id} />
        </Box>
      )}

      {tabValue === 1 && !record?.sellerProfile?.id && (
        <Alert severity="info">
          Store Insights are available only for approved sellers.
        </Alert>
      )}

      <Dialog
        open={!!previewMedia}
        onClose={closeMediaPreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{previewMedia?.label}</DialogTitle>
        <DialogContent>
          {previewMedia && (
            <Box
              component="img"
              src={previewMedia.url}
              alt={previewMedia.label}
              sx={{
                width: '100%',
                maxHeight: '75vh',
                objectFit: 'contain',
                borderRadius: 1,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
};
