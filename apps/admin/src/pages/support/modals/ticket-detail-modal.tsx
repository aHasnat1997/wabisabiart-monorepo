import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Paper,
  Grid2,
  Box,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateField } from '@refinedev/mui';
import { SupportTicketStatus } from '../components/status.js';

interface ISupportUser {
  id: string;
  fullName: string;
  email?: string;
}

interface ISupportTicket {
  id: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  attachments?: string[];
  user: ISupportUser;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface TicketDetailModalProps {
  open: boolean;
  ticket: ISupportTicket | null;
  onClose: () => void;
  onUpdate?: (ticketId: string, status: string, priority: string) => void;
  isUpdating?: boolean;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  open,
  ticket,
  onClose,
  onUpdate,
  isUpdating = false,
}) => {
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [updatePriority, setUpdatePriority] = useState<string>('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  if (!ticket) return null;

  const handleOpenUpdate = () => {
    setUpdateStatus(ticket.status);
    setUpdatePriority(ticket.priority);
    setShowUpdateForm(true);
  };

  const handleUpdate = () => {
    if (onUpdate) {
      if (!updateStatus || !updatePriority) {
        return;
      }
      onUpdate(ticket.id, updateStatus, updatePriority);
      setShowUpdateForm(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: '#4CAF50',
      MEDIUM: '#FF9800',
      HIGH: '#f44336',
    };
    return colors[priority] || '#999';
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
      <DialogTitle sx={{ fontWeight: 600 }}>Support Ticket Details</DialogTitle>
      <DialogContent dividers sx={{ pt: 2 }}>
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
                  Ticket ID
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                  {String(ticket.id).slice(0, 12).toUpperCase()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Subject
                </Typography>
                <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                  {ticket.subject}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Status & Priority */}
          <Box>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Status
                  </Typography>
                  <SupportTicketStatus
                    value={
                      ticket.status as
                        | 'OPEN'
                        | 'IN_PROGRESS'
                        | 'RESOLVED'
                        | 'CLOSED'
                    }
                  />
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Priority
                  </Typography>
                  <Typography
                    sx={{
                      color: getPriorityColor(ticket.priority),
                      fontWeight: 600,
                    }}
                  >
                    {ticket.priority}
                  </Typography>
                </Stack>
              </Grid2>
            </Grid2>
          </Box>

          {/* Category */}
          <Box>
            <Stack spacing={0.5}>
              <Typography variant="caption" color="textSecondary">
                Category
              </Typography>
              <Typography variant="body2">
                {ticket.category.replace(/_/g, ' ')}
              </Typography>
            </Stack>
          </Box>

          {/* User Info */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              From
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2">
                    {ticket.user?.fullName || 'N/A'}
                  </Typography>
                </Stack>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body2">
                    {(ticket.user as ISupportUser & { email?: string })
                      ?.email || 'N/A'}
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
            <Box
              sx={{
                wordBreak: 'break-word',
                color: 'text.secondary',
                backgroundColor: '#f5f5f516',
                p: 1.5,
                borderRadius: 1,
                lineHeight: 1.6,
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                },
                '& a': {
                  color: '#667eea',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
              }}
              dangerouslySetInnerHTML={{ __html: ticket.message }}
            />
          </Box>

          {/* Timeline */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Timeline
            </Typography>
            <Stack spacing={1.5} direction="row" justifyContent="space-between">
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AccessTimeIcon
                  sx={{ fontSize: '1.2rem', color: 'action.active' }}
                />
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Created
                  </Typography>
                  <DateField value={ticket.createdAt} />
                </Stack>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CheckCircleIcon
                  sx={{ fontSize: '1.2rem', color: 'action.active' }}
                />
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="textSecondary">
                    Last Updated
                  </Typography>
                  <DateField value={ticket.updatedAt} />
                </Stack>
              </Box>
              {ticket.resolvedAt && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: '1.2rem', color: 'success.main' }}
                  />
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="textSecondary">
                      Resolved
                    </Typography>
                    <DateField value={ticket.resolvedAt} />
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Update Form */}
          {showUpdateForm && (
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f516', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Update Status & Priority
              </Typography>
              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <Typography variant="caption" sx={{ mb: 0.5 }}>
                    Status
                  </Typography>
                  <Select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                  >
                    <MenuItem value="OPEN">Open</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="RESOLVED">Resolved</MenuItem>
                    <MenuItem value="CLOSED">Closed</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <Typography variant="caption" sx={{ mb: 0.5 }}>
                    Priority
                  </Typography>
                  <Select
                    value={updatePriority}
                    onChange={(e) => setUpdatePriority(e.target.value)}
                  >
                    <MenuItem value="LOW">Low</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="HIGH">High</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setShowUpdateForm(false)}
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    onClick={handleUpdate}
                    variant="contained"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Updating...' : 'Update'}
                  </Button>
                </Box>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        {!showUpdateForm && (
          <Button onClick={handleOpenUpdate} variant="outlined" size="small">
            Update
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
