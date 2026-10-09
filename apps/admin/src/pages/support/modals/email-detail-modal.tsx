import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Button,
  Stack,
  Typography,
  Paper,
  Grid2,
  Box,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateField } from '@refinedev/mui';
import MDEditor from '@uiw/react-md-editor';
import { SupportEmailStatus } from '../components/status.js';
import { SupportsApi, TSupportEmail } from '../../../api/support.js';
import { ReplyEmailModal } from './reply-email-modal.js';

interface EmailDetailModalProps {
  open: boolean;
  email: TSupportEmail | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  open,
  email,
  onClose,
}) => {
  const [detail, setDetail] = useState<TSupportEmail | null>(null);
  const [loading, setLoading] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);

  useEffect(() => {
    if (open && email?.id) {
      setLoading(true);
      SupportsApi.adminSupportEmailDetail(email.id)
        .then((res) => setDetail(res.data.data))
        .catch(() => setDetail(email))
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
      setReplyOpen(false);
    }
  }, [open, email]);

  const data = detail ?? email;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 480 },
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Email Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <Stack spacing={3}>
            {/* Header Info */}
            <Paper
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: 1,
              }}
            >
              <Stack spacing={1}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Email ID
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                    {String(data.id).slice(0, 12).toUpperCase()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Subject
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                    {data.subject}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Status */}
            <Box>
              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                Status
              </Typography>
              <SupportEmailStatus />
            </Box>

            {/* Sender Info */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                From
              </Typography>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Name
                    </Typography>
                    <Typography variant="body2">
                      {(data.firstName + ' ' + data.lastName).trim() || 'N/A'}
                    </Typography>
                  </Stack>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 6 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body2">
                      {data.email || 'N/A'}
                    </Typography>
                  </Stack>
                </Grid2>
              </Grid2>
            </Box>

            {/* Message */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Message
              </Typography>
              <Box data-color-mode="light">
                <MDEditor.Markdown
                  source={data.message}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 4,
                    backgroundColor: '#f9f9f9',
                    fontSize: 14,
                    lineHeight: 1.6,
                  }}
                />
              </Box>
            </Box>

            {/* Timeline */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Timeline
              </Typography>
              <Stack
                spacing={1.5}
                direction="row"
                justifyContent="space-between"
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: '1.2rem', color: 'action.active' }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Received
                    </Typography>
                    <DateField value={data.createdAt} />
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <AccessTimeIcon
                    sx={{ fontSize: '1.2rem', color: 'action.active' }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Updated
                    </Typography>
                    <DateField value={data.updatedAt} />
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Box>

      <Divider />
      <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" fullWidth>
          Close
        </Button>
        <Button
          variant="contained"
          fullWidth
          disabled={!data}
          onClick={() => setReplyOpen(true)}
        >
          Reply
        </Button>
      </Box>

      <ReplyEmailModal
        open={replyOpen}
        email={data}
        onClose={() => setReplyOpen(false)}
      />
    </Drawer>
  );
};
