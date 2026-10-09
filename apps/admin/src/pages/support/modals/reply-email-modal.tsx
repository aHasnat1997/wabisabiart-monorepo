import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MDEditor from '@uiw/react-md-editor';
import { SupportsApi, TSupportEmail } from '../../../api/support.js';

interface ReplyEmailModalProps {
  open: boolean;
  email: TSupportEmail | null;
  onClose: () => void;
}

export const ReplyEmailModal: React.FC<ReplyEmailModalProps> = ({
  open,
  email,
  onClose,
}) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleClose = () => {
    setSubject('');
    setMessage('');
    setSent(false);
    onClose();
  };

  const handleSend = async () => {
    if (!email?.id || !message.trim()) return;
    setSending(true);
    try {
      await SupportsApi.replyEmail(email.id, {
        message,
        subject: subject.trim() || undefined,
      });
      setSent(true);
      setMessage('');
      setSubject('');
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
          pb: 1,
        }}
      >
        Reply to {email?.firstName} {email?.lastName}
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {sent ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6">📨 Reply Sent!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Your reply has been sent to {email?.email}.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* To field (read-only) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 50 }}>
                To:
              </Typography>
              <Typography variant="body2">
                {email?.firstName} {email?.lastName} &lt;{email?.email}&gt;
              </Typography>
            </Box>

            {/* Subject */}
            <TextField
              label="Subject"
              size="small"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={`Re: ${email?.subject ?? ''}`}
            />

            {/* Message editor */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                Message
              </Typography>
              <Box data-color-mode="light">
                <MDEditor
                  value={message}
                  onChange={(val) => setMessage(val ?? '')}
                  height={240}
                  preview="edit"
                />
              </Box>
            </Box>

            {/* Original message reference */}
            <Box
              sx={{
                borderLeft: '3px solid',
                borderColor: 'divider',
                pl: 1.5,
                color: 'text.secondary',
                fontSize: 12,
              }}
            >
              <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                Original message — {email?.subject}
              </Typography>
              <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap' }}>
                {email?.message?.slice(0, 200)}{(email?.message?.length ?? 0) > 200 ? '...' : ''}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} variant="outlined">
          {sent ? 'Close' : 'Cancel'}
        </Button>
        {!sent && (
          <Button
            variant="contained"
            onClick={() => void handleSend()}
            disabled={sending || !message.trim()}
            loading={sending}
          >
            Send Reply
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
