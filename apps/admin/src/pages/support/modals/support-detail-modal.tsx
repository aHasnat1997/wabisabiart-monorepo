import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
} from '@mui/material';
import z from 'zod';
import { SupportsApi, SupportContactDetails } from '../../../api/support';

interface SupportDetailModalProps {
  supportContact: SupportContactDetails | null;
  setSupportContact: React.Dispatch<
    React.SetStateAction<SupportContactDetails | null>
  >;
  open: boolean;
  onClose: () => void;
}

const AdminContactDetailsSchema = z.object({
  email: z.email('Invalid email format'),
  phoneNumber: z.string().optional(),
  availableTimeRange: z.string().optional(),
  availableWeekRange: z.string().optional(),
  responseTime: z.string().optional(),
});

export const SupportDetailModal: React.FC<SupportDetailModalProps> = ({
  open,
  onClose,
  supportContact,
  setSupportContact,
}) => {
  const [form, setForm] = useState({
    email: supportContact?.email || '',
    phoneNumber: supportContact?.phoneNumber || '',
    availableTimeRange: supportContact?.availableTimeRange || '',
    availableWeekRange: supportContact?.availableWeekRange || '',
    responseTime: supportContact?.responseTime || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        email: supportContact?.email || '',
        phoneNumber: supportContact?.phoneNumber || '',
        availableTimeRange: supportContact?.availableTimeRange || '',
        availableWeekRange: supportContact?.availableWeekRange || '',
        responseTime: supportContact?.responseTime || '',
      });
      setErrors({});
    }
  }, [open, supportContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleSubmit = async () => {
    const result = AdminContactDetailsSchema.safeParse({
      ...form,
      phoneNumber: form?.phoneNumber || undefined,
      availableTimeRange: form?.availableTimeRange || undefined,
      availableWeekRange: form?.availableWeekRange || undefined,
      responseTime: form?.responseTime || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await SupportsApi.updateContact(result.data);
      setSupportContact(result.data);
      onClose();
    } catch (err) {
      console.error('Failed to update support contact:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>Support Email Details</DialogTitle>
      <DialogContent
        dividers
        sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
              />

              <TextField
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber}
                fullWidth
              />

              <TextField
                label="Available Time Range"
                name="availableTimeRange"
                placeholder="e.g. 9:00 AM - 5:00 PM"
                value={form.availableTimeRange}
                onChange={handleChange}
                error={!!errors.availableTimeRange}
                helperText={errors.availableTimeRange}
                fullWidth
              />

              <TextField
                label="Available Week Range"
                name="availableWeekRange"
                placeholder="e.g. Monday - Friday"
                value={form.availableWeekRange}
                onChange={handleChange}
                error={!!errors.availableWeekRange}
                helperText={errors.availableWeekRange}
                fullWidth
              />

              <TextField
                label="Response Time"
                name="responseTime"
                placeholder="e.g. Within 24 hours"
                value={form.responseTime}
                onChange={handleChange}
                error={!!errors.responseTime}
                helperText={errors.responseTime}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>

        <Button variant="contained" onClick={() => void handleSubmit()} disabled={loading} loading={loading}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
