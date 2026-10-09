import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Grid2,
  Paper,
  TextField,
  Divider,
} from '@mui/material';
import { DateField } from '@refinedev/mui';
import { ReportStatusChip } from './status-chip.js';
import { ReportsApi, type TReport } from '../../api/report.js';

interface Props {
  open: boolean;
  report: TReport | null;
  onClose: () => void;
  onAction: () => void;
}

export const ReportDetailModal: React.FC<Props> = ({ open, report, onClose, onAction }) => {
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(false);

  if (!report) return null;

  const isPending = report.status === 'pending';

  const handleApprove = async () => {
    setLoading(true);
    try {
      await ReportsApi.approve(report.id, resolution || undefined);
      onAction();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await ReportsApi.reject(report.id);
      onAction();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ fontWeight: 600 }}>Report Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Paper
            sx={{
              p: 2,
              background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
              color: 'white',
              borderRadius: 1,
            }}
          >
            <Stack spacing={1}>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Report ID</Typography>
                <Typography variant="subtitle2">{report.id.slice(0, 12).toUpperCase()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>Product ID</Typography>
                <Typography variant="subtitle2">{report.productId}</Typography>
              </Box>
            </Stack>
          </Paper>

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 6 }}>
              <Typography variant="caption" color="textSecondary">Status</Typography>
              <Box mt={0.5}><ReportStatusChip value={report.status} /></Box>
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <Typography variant="caption" color="textSecondary">Reason</Typography>
              <Typography variant="body2" fontWeight={500} mt={0.5} sx={{ textTransform: 'capitalize' }}>
                {report.reason}
              </Typography>
            </Grid2>
          </Grid2>

          {report.description && (
            <Box>
              <Typography variant="caption" color="textSecondary">Description</Typography>
              <Box sx={{ mt: 0.5, p: 1.5, backgroundColor: '#f5f5f516', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">{report.description}</Typography>
              </Box>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Reporter</Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Name</Typography>
                <Typography variant="body2">{report.reporter.fullName}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <Typography variant="caption" color="textSecondary">Email</Typography>
                <Typography variant="body2">{report.reporter.email}</Typography>
              </Grid2>
            </Grid2>
          </Box>

          {report.reportedUser && (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>Shop Owner</Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Name</Typography>
                  <Typography variant="body2">{report.reportedUser.fullName}</Typography>
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  <Typography variant="caption" color="textSecondary">Shop</Typography>
                  <Typography variant="body2">
                    {report.reportedUser.sellerProfile?.shopName ?? 'N/A'}
                  </Typography>
                </Grid2>
              </Grid2>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="textSecondary">Submitted</Typography>
            <Box mt={0.5}><DateField value={report.createdAt} format="LLL" /></Box>
          </Box>

          {report.resolution && (
            <Box>
              <Typography variant="caption" color="textSecondary">Resolution Note</Typography>
              <Typography variant="body2" mt={0.5}>{report.resolution}</Typography>
            </Box>
          )}

          {isPending && (
            <TextField
              label="Resolution Note (optional)"
              multiline
              rows={3}
              fullWidth
              size="small"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Add a note for the seller..."
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {isPending && (
          <>
            <Button
              onClick={handleReject}
              variant="outlined"
              color="error"
              size="small"
              disabled={loading}
            >
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              color="success"
              size="small"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Approve & Notify Seller'}
            </Button>
          </>
        )}
        <Button onClick={onClose} variant="contained" size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
};
