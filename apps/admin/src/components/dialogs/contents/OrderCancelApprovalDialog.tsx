import { useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { orderAdminApi } from '../../../api/order.js';

interface Props {
  onClose: () => void;
}

export default function OrderCancelApprovalDialog({ onClose }: Props) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const orderNumber = searchParams.get('orderNumber') ?? '';
  const cancelReason = searchParams.get('cancelReason') ?? '';
  const buyerName = searchParams.get('buyerName') ?? '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    setError(null);
    try {
      await orderAdminApi.approveCancelRequest(orderId);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(
        e?.response?.data?.message ?? 'Failed to approve cancel request',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Approve Cancel Request
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            py={3}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: 52 }} />
            <Typography color="success.main" fontWeight={600} variant="h6">
              Order #{orderNumber} cancelled
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The customer will be notified.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" mb={2}>
              You are about to approve the cancel request for order{' '}
              <strong>#{orderNumber}</strong> from <strong>{buyerName}</strong>.
            </Typography>

            {cancelReason && (
              <Box
                p={1.5}
                bgcolor="error.light"
                borderRadius={1}
                mb={2}
                sx={{ opacity: 0.9 }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="error.dark"
                  display="block"
                  mb={0.25}
                >
                  Customer's reason:
                </Typography>
                <Typography variant="body2">"{cancelReason}"</Typography>
              </Box>
            )}

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              p={1.5}
              bgcolor="warning.light"
              borderRadius={1}
            >
              <WarningAmberIcon color="warning" fontSize="small" />
              <Typography variant="body2" fontWeight={500}>
                This action is irreversible. The order will be permanently
                cancelled.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      {!success && (
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Keep Order
          </Button>
          <Button
            onClick={() => void handleApprove()}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Approve & Cancel Order
          </Button>
        </DialogActions>
      )}
    </>
  );
}
