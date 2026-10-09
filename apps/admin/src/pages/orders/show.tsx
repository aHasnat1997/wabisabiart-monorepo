/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { orderAdminApi, type AdminOrderDetail } from '../../api/order.js';
import { resolveMediaUrl } from '../../utils/index.js';
import { STATUS_COLORS, STATUS_LABELS } from './list.js';
import dayjs from 'dayjs';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const maybeResponse = (
      error as { response?: { data?: { message?: unknown } } }
    ).response;
    const message = maybeResponse?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutFeedback, setPayoutFeedback] = useState<{
    severity: 'success' | 'error';
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await orderAdminApi.getOne(id);
      setOrder(res.data.data);
    } catch {
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDialog = (
    dialogName: string,
    extra: Record<string, string> = {},
  ) => {
    setSearchParams(new URLSearchParams({ dialog: dialogName, ...extra }));
  };

  const hasCancelRequest = order?.internalNote?.startsWith('CANCEL_REQUESTED:');
  const cancelReason = hasCancelRequest
    ? order!.internalNote!.replace('CANCEL_REQUESTED: ', '')
    : '';
  const payoutReleased = order?.internalNote === 'PAYOUT_RELEASED';
  const canApprovePayout = order?.status === 'paid' && !payoutReleased;

  const openDispute = order?.disputes?.find(
    (d) => d.status === 'open' || d.status === 'under_review',
  );

  const handleApprovePayout = async () => {
    if (!order || payoutSubmitting) return;

    setPayoutSubmitting(true);
    setPayoutFeedback(null);

    try {
      await orderAdminApi.releasePayout(order.id);
      setPayoutFeedback({
        severity: 'success',
        message: 'Seller payout approved and transfer sent to Stripe.',
      });
      await load();
    } catch (err) {
      setPayoutFeedback({
        severity: 'error',
        message: getApiErrorMessage(err, 'Failed to approve seller payout.'),
      });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={500}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void load()}>
              Retry
            </Button>
          }
        >
          {error ?? 'Order not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={{ xs: 1, sm: 2, md: 3 }}>
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => void navigate('/orders')}
          variant="outlined"
          size="small"
          color="inherit"
        >
          Orders
        </Button>
        <Stack
          flex={1}
          direction="row"
          alignItems="center"
          gap={1.5}
          flexWrap="wrap"
        >
          <Typography variant="h5" fontWeight={700}>
            Order #{order.orderNumber}
          </Typography>
          <Chip
            label={STATUS_LABELS[order.status] ?? order.status}
            color={STATUS_COLORS[order.status] ?? 'default'}
            size="medium"
          />
          {hasCancelRequest && (
            <Chip label="⚠ Cancel Requested" color="error" size="small" />
          )}
          {openDispute && (
            <Chip label="⚠ Dispute Open" color="warning" size="small" />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {dayjs(order.createdAt).format('MMM D, YYYY · HH:mm')}
        </Typography>
      </Stack>

      {/* ─── Action Alerts ───────────────────────────────────────────────── */}
      {payoutFeedback && (
        <Alert severity={payoutFeedback.severity} sx={{ mb: 2 }}>
          {payoutFeedback.message}
        </Alert>
      )}

      {canApprovePayout && (
        <Alert
          severity="info"
          sx={{ mb: 2, alignItems: 'flex-start' }}
          action={
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleApprovePayout()}
              disabled={payoutSubmitting}
            >
              {payoutSubmitting ? 'Approving...' : 'Approve Seller Payout'}
            </Button>
          }
        >
          This paid order is waiting for payout approval. After approval, Stripe
          transfers the amount to the seller account after platform fee.
        </Alert>
      )}

      {payoutReleased && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Seller payout has been released for this order.
        </Alert>
      )}

      {hasCancelRequest && (
        <Alert
          severity="error"
          sx={{ mb: 2, alignItems: 'flex-start' }}
          action={
            <Stack direction="row" spacing={1} mt={0.5}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() =>
                  openDialog('order-cancel-approval', {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                    cancelReason,
                    buyerName: order.buyer.fullName,
                  })
                }
              >
                Approve Cancel
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() =>
                  openDialog('order-cancel-rejection', {
                    orderId: order.id,
                    orderNumber: order.orderNumber,
                  })
                }
              >
                Reject Request
              </Button>
            </Stack>
          }
        >
          <strong>{order.buyer.fullName}</strong> requested to cancel this
          order.
          {cancelReason && (
            <Typography variant="body2" mt={0.5}>
              Reason: <em>"{cancelReason}"</em>
            </Typography>
          )}
        </Alert>
      )}

      {openDispute && (
        <Alert
          severity="warning"
          sx={{ mb: 2, alignItems: 'flex-start' }}
          action={
            <Button
              size="small"
              variant="contained"
              color="warning"
              sx={{ mt: 0.5 }}
              onClick={() =>
                openDialog('order-dispute-resolution', {
                  orderId: order.id,
                  orderNumber: order.orderNumber,
                  disputeId: openDispute.id,
                  disputeReason: openDispute.reason,
                  disputeDescription: openDispute.description,
                })
              }
            >
              Resolve Dispute
            </Button>
          }
        >
          <strong>Open dispute</strong> — {openDispute.reason}
          <Typography variant="body2" mt={0.5} color="text.secondary">
            {openDispute.description}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* ─────────────── Left Column ─────────────── */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Order Items */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={
                <Typography fontWeight={700} variant="body1">
                  Order Items ({order.items.length})
                </Typography>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {order.items.map((item, i) => (
                <Box key={i}>
                  {i > 0 && <Divider sx={{ my: 1.5 }} />}
                  <Stack direction="row" alignItems="center" gap={2}>
                    <Avatar
                      src={resolveMediaUrl(item.imageUrl)}
                      variant="rounded"
                      sx={{ width: 60, height: 60, bgcolor: 'action.hover' }}
                    >
                      {item.productTitle[0]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.productTitle}
                      </Typography>
                      {item.variantName && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          Variant: {item.variantName}
                        </Typography>
                      )}
                      {item.sku && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          SKU: {item.sku}
                        </Typography>
                      )}
                    </Box>
                    <Stack alignItems="flex-end" gap={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        {item.quantity} × ${Number(item.unitPrice).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        ${Number(item.totalPrice).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Price Summary */}
              <Stack spacing={0.5}>
                {(
                  [
                    ['Subtotal', order.subtotal],
                    ['Shipping', order.shippingCost],
                    ['Tax', order.taxAmount],
                    ['Discount', order.discountAmount],
                    ['Tip', order.tipAmount],
                  ] as [string, string][]
                ).map(([label, value]) =>
                  Number(value || 0) === 0 ? null : (
                    <Stack
                      key={label}
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="text.secondary">
                        {label}
                        {label === 'Discount' && ' (-)'}
                      </Typography>
                      <Typography variant="body2">
                        ${Number(value).toFixed(2)}
                      </Typography>
                    </Stack>
                  ),
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body1" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={700}
                    color="primary.main"
                  >
                    ${Number(order.totalAmount).toFixed(2)} {order.currency}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader
              title={
                <Typography fontWeight={700} variant="body1">
                  Order Timeline
                </Typography>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              {order.statusHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No history yet
                </Typography>
              ) : (
                <Stepper orientation="vertical" nonLinear>
                  {[...order.statusHistory].reverse().map((entry, i) => (
                    <Step key={entry.id} active completed={i > 0}>
                      <StepLabel
                        icon={
                          i === 0 ? (
                            <CheckCircleIcon
                              color="primary"
                              sx={{ fontSize: 20 }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              color="disabled"
                              sx={{ fontSize: 20 }}
                            />
                          )
                        }
                      >
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Chip
                            label={STATUS_LABELS[entry.status] ?? entry.status}
                            color={STATUS_COLORS[entry.status] ?? 'default'}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(entry.createdAt).format(
                              'MMM D, YYYY · HH:mm',
                            )}
                          </Typography>
                        </Stack>
                      </StepLabel>
                      {entry.note && (
                        <StepContent>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: -0.5, display: 'block' }}
                          >
                            {entry.note}
                          </Typography>
                        </StepContent>
                      )}
                    </Step>
                  ))}
                </Stepper>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* ─────────────── Right Column ─────────────── */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Customer */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title={
                <Typography fontWeight={700} variant="body2">
                  Customer
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack direction="row" gap={1.5} alignItems="center">
                <Avatar
                  src={resolveMediaUrl(order.buyer.avatarUrl)}
                  sx={{ width: 48, height: 48 }}
                >
                  {order.buyer.fullName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {order.buyer.fullName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {order.buyer.email}
                  </Typography>
                  {order.buyer.phoneNumber && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {order.buyer.phoneNumber}
                    </Typography>
                  )}
                </Box>
              </Stack>
              {order.buyerNote && (
                <Box mt={1.5} p={1.5} bgcolor="action.hover" borderRadius={1}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    display="block"
                  >
                    Buyer Note:
                  </Typography>
                  <Typography variant="caption">{order.buyerNote}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Seller */}
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title={
                <Typography fontWeight={700} variant="body2">
                  Seller / Shop
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Stack direction="row" gap={1.5} alignItems="center">
                <Avatar
                  src={resolveMediaUrl(order.seller.shopLogo)}
                  sx={{ width: 44, height: 44 }}
                >
                  {order.seller.shopName[0]}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {order.seller.shopName}
                  </Typography>
                  {order.seller.address && (
                    <Typography variant="caption" color="text.secondary">
                      {order.seller.address}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography fontWeight={700} variant="body2">
                    Shipping Address
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Typography variant="body2" fontWeight={500}>
                  {order.shippingAddress.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 &&
                    `, ${order.shippingAddress.addressLine2}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.city}
                  {order.shippingAddress.stateProvince &&
                    `, ${order.shippingAddress.stateProvince}`}{' '}
                  {order.shippingAddress.postalCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.shippingAddress.country}
                </Typography>
                {order.shippingAddress.phoneNumber && (
                  <Typography variant="caption" color="text.secondary">
                    {order.shippingAddress.phoneNumber}
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {order.payments && order.payments.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography fontWeight={700} variant="body2">
                    Payment
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent>
                {order.payments.map((p, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={i < order.payments!.length - 1 ? 1 : 0}
                  >
                    <Stack>
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        textTransform="capitalize"
                      >
                        {p.provider ?? 'Payment'}
                      </Typography>
                      {p.processedAt && (
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(p.processedAt).format('MMM D, YYYY')}
                        </Typography>
                      )}
                    </Stack>
                    <Stack alignItems="flex-end" gap={0.5}>
                      <Chip
                        label={p.status}
                        color={
                          p.status === 'succeeded'
                            ? 'success'
                            : p.status === 'failed'
                            ? 'error'
                            : 'default'
                        }
                        size="small"
                      />
                      <Typography variant="caption" fontWeight={600}>
                        ${Number(p.amount).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Shipments */}
          {order.shipments && order.shipments.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography fontWeight={700} variant="body2">
                    Shipments
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent>
                {order.shipments.map((s, i) => (
                  <Box key={i} mb={i < order.shipments.length - 1 ? 1 : 0}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="body2" fontWeight={500}>
                        {s.carrier}
                      </Typography>
                      <Chip label={s.status?.replace(/_/g, ' ')} size="small" />
                    </Stack>
                    {s.trackingNumber && (
                      <Typography variant="caption" color="text.secondary">
                        Tracking: {s.trackingNumber}
                      </Typography>
                    )}
                    {s.estimatedDeliveryDate && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Est. delivery:{' '}
                        {dayjs(s.estimatedDeliveryDate).format('MMM D, YYYY')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Refunds */}
          {order.refunds && order.refunds.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardHeader
                title={
                  <Typography fontWeight={700} variant="body2">
                    Refunds
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent>
                {order.refunds.map((r, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={i < order.refunds.length - 1 ? 1 : 0}
                  >
                    <Box>
                      <Typography variant="body2">{r.reason}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dayjs(r.requestedAt).format('MMM D, YYYY')}
                      </Typography>
                    </Box>
                    <Stack alignItems="flex-end" gap={0.5}>
                      <Chip
                        label={r.status}
                        size="small"
                        color={r.status === 'completed' ? 'success' : 'default'}
                      />
                      <Typography variant="caption" fontWeight={600}>
                        ${Number(r.amount).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Disputes */}
          {order.disputes && order.disputes.length > 0 && (
            <Card>
              <CardHeader
                title={
                  <Typography fontWeight={700} variant="body2">
                    Disputes
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent>
                {order.disputes.map((d, i) => (
                  <Box key={i} mb={i < order.disputes.length - 1 ? 1.5 : 0}>
                    {i > 0 && <Divider sx={{ mb: 1.5 }} />}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                    >
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {d.reason}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          mb={0.5}
                        >
                          {d.description}
                        </Typography>
                        {d.resolution && (
                          <Box
                            p={1}
                            bgcolor="success.light"
                            borderRadius={1}
                            mt={0.5}
                          >
                            <Typography
                              variant="caption"
                              fontWeight={600}
                              display="block"
                            >
                              Resolution:
                            </Typography>
                            <Typography variant="caption">
                              {d.resolution}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Chip
                        label={d.status?.replace(/_/g, ' ')}
                        size="small"
                        color={
                          d.status === 'open'
                            ? 'warning'
                            : d.status === 'resolved_buyer' ||
                              d.status === 'resolved_seller'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </Stack>
                    {d.messages && d.messages.length > 0 && (
                      <Box mt={1} pl={1} borderLeft={2} borderColor="divider">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          {d.messages.length} message
                          {d.messages.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
