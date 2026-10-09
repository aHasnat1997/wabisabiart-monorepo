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
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { orderAdminApi } from '../../../api/order.js';

type Outcome = 'resolved_buyer' | 'resolved_seller' | 'closed';

const OUTCOME_OPTIONS: {
  value: Outcome;
  label: string;
  description: string;
}[] = [
  {
    value: 'resolved_buyer',
    label: 'Favor Buyer',
    description: 'Issue a refund — order status will change to Refunded.',
  },
  {
    value: 'resolved_seller',
    label: 'Favor Seller',
    description:
      "Close in seller's favor — order status will change to Delivered.",
  },
  {
    value: 'closed',
    label: 'Close Dispute',
    description: 'No action taken — order status will change to Delivered.',
  },
];

interface Props {
  onClose: () => void;
}

export default function OrderDisputeResolutionDialog({ onClose }: Props) {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId') ?? '';
  const orderNumber = searchParams.get('orderNumber') ?? '';
  const disputeReason = searchParams.get('disputeReason') ?? '';
  const disputeDescription = searchParams.get('disputeDescription') ?? '';

  const [outcome, setOutcome] = useState<Outcome>('resolved_buyer');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResolve = async () => {
    if (!resolution.trim()) {
      setError('Please provide resolution notes explaining your decision');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await orderAdminApi.resolveDispute(orderId, resolution, outcome);
      setSuccess(true);
      setTimeout(onClose, 1800);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Failed to resolve dispute');
    } finally {
      setLoading(false);
    }
  };

  const selectedOption = OUTCOME_OPTIONS.find((o) => o.value === outcome);

  return (
    <>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Resolve Dispute — Order #{orderNumber}
      </DialogTitle>
      <DialogContent sx={{ minWidth: { sm: 480 } }}>
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
              Dispute resolved
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The order has been updated accordingly.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Dispute context */}
            {(disputeReason || disputeDescription) && (
              <Box
                p={1.5}
                bgcolor="warning.light"
                borderRadius={1}
                mb={2.5}
                sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}
              >
                {disputeReason && (
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="warning.dark"
                  >
                    Dispute Reason: {disputeReason}
                  </Typography>
                )}
                {disputeDescription && (
                  <Typography variant="body2" mt={0.5} color="text.secondary">
                    {disputeDescription}
                  </Typography>
                )}
              </Box>
            )}

            {/* Outcome selection */}
            <Typography variant="body2" fontWeight={600} mb={1}>
              How do you want to resolve this?
            </Typography>
            <FormControl fullWidth sx={{ mb: 0.5 }}>
              <RadioGroup
                value={outcome}
                onChange={(e) => setOutcome(e.target.value as Outcome)}
              >
                {OUTCOME_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {opt.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {opt.description}
                        </Typography>
                      </Box>
                    }
                    sx={{
                      alignItems: 'flex-start',
                      mb: 0.5,
                      '& .MuiRadio-root': { pt: 0.5 },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {/* Outcome summary chip */}
            {selectedOption && (
              <Box p={1} bgcolor="action.hover" borderRadius={1} mb={2}>
                <Typography variant="caption" color="text.secondary">
                  {selectedOption.description}
                </Typography>
              </Box>
            )}

            {/* Resolution notes */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Resolution Notes *"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Explain the basis of this decision and what evidence was reviewed..."
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
            Cancel
          </Button>
          <Button
            onClick={() => void handleResolve()}
            variant="contained"
            color="warning"
            disabled={loading || !resolution.trim()}
            startIcon={
              loading ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Resolve Dispute
          </Button>
        </DialogActions>
      )}
    </>
  );
}
