import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid2 as Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNotification } from '@refinedev/core';
import { RefineListView } from '../../components/index.js';
import {
  billingFeesAdminApi,
  type PlatformFeeSetting,
} from '../../api/billing-fees.js';

export const BillingFeesList = () => {
  const { open } = useNotification();
  const [config, setConfig] = useState<PlatformFeeSetting | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [platformFeePercent, setPlatformFeePercent] = useState('5');
  const [paymentProcessingPercent, setPaymentProcessingPercent] =
    useState('2.9');
  const [paymentProcessingFlat, setPaymentProcessingFlat] = useState('0.3');
  const [notes, setNotes] = useState('');

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await billingFeesAdminApi.getConfig();
      const data = res.data.data;
      setConfig(data);
      setPlatformFeePercent(String(data.platformFeePercent));
      setPaymentProcessingPercent(String(data.paymentProcessingPercent));
      setPaymentProcessingFlat(String(data.paymentProcessingFlat));
      setNotes(data.notes || '');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadConfig();
  }, []);

  const estimatedSellerKeep = useMemo(() => {
    const fee = Number(platformFeePercent || 0);
    const keep = 100 - fee;
    return keep > 0 ? keep : 0;
  }, [platformFeePercent]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        platformFeePercent: Number(platformFeePercent),
        paymentProcessingPercent: Number(paymentProcessingPercent),
        paymentProcessingFlat: Number(paymentProcessingFlat),
        notes: notes || undefined,
      };

      const res = await billingFeesAdminApi.updateConfig(payload);
      const data = res.data.data;
      setConfig(data);
      setPlatformFeePercent(String(data.platformFeePercent));
      setPaymentProcessingPercent(String(data.paymentProcessingPercent));
      setPaymentProcessingFlat(String(data.paymentProcessingFlat));
      setNotes(data.notes || '');

      open?.({
        type: 'success',
        message: 'Billing & fees updated successfully',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to update billing & fees',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <RefineListView title="Billing & Fees">
      <Stack spacing={2.5}>
        <Alert severity="info">
          These values are used across seller billing and fee calculations.
        </Alert>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Platform Fee
                </Typography>
                <Typography variant="h4">{platformFeePercent}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Charged per sale
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Processing Fee
                </Typography>
                <Typography variant="h4">
                  {paymentProcessingPercent}% + ${paymentProcessingFlat}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payment gateway baseline
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Seller Keeps
                </Typography>
                <Typography variant="h4">~{estimatedSellerKeep}%</Typography>
                <Typography variant="body2" color="text.secondary">
                  Before gateway deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Update Fee Structure</Typography>

              <TextField
                label="Platform Fee (%)"
                type="number"
                value={platformFeePercent}
                onChange={(e) => setPlatformFeePercent(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                fullWidth
              />

              <TextField
                label="Payment Processing (%)"
                type="number"
                value={paymentProcessingPercent}
                onChange={(e) => setPaymentProcessingPercent(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                fullWidth
              />

              <TextField
                label="Payment Processing Flat ($)"
                type="number"
                value={paymentProcessingFlat}
                onChange={(e) => setPaymentProcessingFlat(e.target.value)}
                inputProps={{ min: 0, step: 0.01 }}
                fullWidth
              />

              <TextField
                label="Internal Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={saving || loading}
                >
                  {saving ? 'Saving...' : 'Save Fee Structure'}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {config && (
          <Typography variant="caption" color="text.secondary">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </Typography>
        )}
      </Stack>
    </RefineListView>
  );
};
