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
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { orderAdminApi } from '../../../api/order.js';

interface Props {
  onClose: () => void;
}

export default function OrderCancelRejectionDialog({ onClose }: Props) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const orderNumber = searchParams.get('orderNumber') ?? '';

  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for rejecting this request');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await orderAdminApi.rejectCancelRequest(orderId, reason);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Failed to reject cancel request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Reject Cancel Request
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
              Request rejected
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order #{orderNumber} will continue as normal.
            </Typography>
          </Box>
        ) : (
          <>
            <Typography variant="body2" mb={2.5}>
              Provide a reason for rejecting the cancel request for order{' '}
              <strong>#{orderNumber}</strong>. This note will be recorded in the
              order history.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. The order has already been shipped and cannot be cancelled at this stage..."
              error={!!error && !reason.trim()}
            />
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
            Close
          </Button>
          <Button
            onClick={() => void handleReject()}
            variant="contained"
            disabled={loading || !reason.trim()}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Reject Request
          </Button>
        </DialogActions>
      )}
    </>
  );
}
