import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useNotification } from '@refinedev/core';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ReplyIcon from '@mui/icons-material/Reply';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import { adminJournalApi, type AdminJournalDetail } from '../../api/journal.js';
import { resolveMediaUrl } from '../../utils/index.js';

const STATUS_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'error' | 'info' | 'secondary'
> = {
  publishing_request: 'warning',
  published: 'success',
  rejected: 'error',
  blocked: 'secondary',
  draft: 'default',
  archived: 'info',
};

const STATUS_LABELS: Record<string, string> = {
  publishing_request: 'Publishing Request',
  published: 'Published',
  rejected: 'Rejected',
  blocked: 'Blocked',
  draft: 'Draft',
  archived: 'Archived',
};

export const JournalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { open } = useNotification();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [journal, setJournal] = useState<AdminJournalDetail | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<
    'publish' | 'reject' | 'block' | null
  >(null);

  const loadJournal = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await adminJournalApi.getOne(id);
      setJournal(res.data.data);
    } catch {
      open?.({ type: 'error', message: 'Failed to load journal details' });
    } finally {
      setLoading(false);
    }
  }, [id, open]);

  useEffect(() => {
    void loadJournal();
  }, [loadJournal]);

  const status = journal?.postStatus || 'draft';

  const canPublish = useMemo(
    () =>
      status === 'publishing_request' ||
      status === 'rejected' ||
      status === 'blocked' ||
      status === 'draft',
    [status],
  );

  const handleStatusAction = async (action: 'publish' | 'reject' | 'block') => {
    if (!id) return;
    try {
      setSubmitting(true);
      await adminJournalApi.updateStatus(id, action);
      open?.({ type: 'success', message: `Journal ${action}ed successfully` });
      await loadJournal();
    } catch {
      open?.({ type: 'error', message: `Failed to ${action} journal` });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeUnlike = async () => {
    if (!id || !journal) return;
    try {
      setSubmitting(true);
      await adminJournalApi.react(
        id,
        journal.isLikedByCurrentUser ? 'unlike' : 'like',
      );
      await loadJournal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!id || !commentInput.trim()) return;
    try {
      setSubmitting(true);
      await adminJournalApi.comment(id, commentInput.trim());
      setCommentInput('');
      await loadJournal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId: string) => {
    const value = replyInputs[commentId]?.trim();
    if (!value) return;
    try {
      setSubmitting(true);
      await adminJournalApi.reply(commentId, value);
      setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
      await loadJournal();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (!journal) {
    return <Alert severity="error">Journal not found.</Alert>;
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          color="inherit"
          onClick={() => void navigate('/journals')}
        >
          Back to journals
        </Button>
        <Stack direction="row" spacing={1}>
          {canPublish && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              disabled={submitting}
              onClick={() => setConfirmAction('publish')}
            >
              Publish
            </Button>
          )}
          {status === 'publishing_request' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CloseIcon />}
              disabled={submitting}
              onClick={() => setConfirmAction('reject')}
            >
              Reject
            </Button>
          )}
          {status !== 'blocked' && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<BlockIcon />}
              disabled={submitting}
              onClick={() => setConfirmAction('block')}
            >
              Block
            </Button>
          )}
        </Stack>
      </Stack>

      <Card>
        {journal.bannerImage && (
          <Box
            component="img"
            src={resolveMediaUrl(journal.bannerImage)}
            alt={journal.title}
            sx={{ width: '100%', maxHeight: 360, objectFit: 'cover' }}
          />
        )}
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="h4" fontWeight={700}>
                {journal.title}
              </Typography>
              <Chip
                size="small"
                label={STATUS_LABELS[status] || status}
                color={STATUS_COLORS[status] || 'default'}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              By {journal.shop?.shopName || 'Unknown shop'} •{' '}
              {journal.shop?.user?.fullName || 'Unknown seller'} •{' '}
              {new Date(journal.createdAt).toLocaleString()}
            </Typography>
            {journal.shortExcerpt && (
              <Typography variant="subtitle1" color="text.secondary">
                {journal.shortExcerpt}
              </Typography>
            )}
            <Divider />
            <Box
              sx={{
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                },
              }}
              dangerouslySetInnerHTML={{ __html: journal.content || '' }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6">Engagement</Typography>
                <Typography variant="body2" color="text.secondary">
                  {journal.shopJournalLikes.length} likes •{' '}
                  {journal.shopJournalComments.length} comments
                </Typography>
                <Button
                  variant={
                    journal.isLikedByCurrentUser ? 'contained' : 'outlined'
                  }
                  color="error"
                  startIcon={
                    journal.isLikedByCurrentUser ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )
                  }
                  disabled={submitting}
                  onClick={() => void handleLikeUnlike()}
                >
                  {journal.isLikedByCurrentUser ? 'Unlike' : 'Like'}
                </Button>
                <Divider />
                <Typography variant="subtitle2">Liked by</Typography>
                <Stack spacing={1}>
                  {journal.shopJournalLikes.slice(0, 8).map((like) => (
                    <Stack
                      key={like.userId}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Avatar
                        src={resolveMediaUrl(like.user.avatarUrl)}
                        sx={{ width: 28, height: 28 }}
                      >
                        {like.user.fullName?.[0]}
                      </Avatar>
                      <Typography variant="body2">
                        {like.user.fullName}
                      </Typography>
                    </Stack>
                  ))}
                  {journal.shopJournalLikes.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      No likes yet.
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Comments & Replies</Typography>

                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    disabled={submitting || !commentInput.trim()}
                    onClick={() => void handleAddComment()}
                  >
                    Comment
                  </Button>
                </Stack>

                <Divider />

                {journal.shopJournalComments.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No comments yet.
                  </Typography>
                )}

                {journal.shopJournalComments.map((comment) => (
                  <Card
                    key={comment.id}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            src={resolveMediaUrl(comment.user.avatarUrl)}
                            sx={{ width: 30, height: 30 }}
                          >
                            {comment.user.fullName?.[0]}
                          </Avatar>
                          <Typography variant="subtitle2">
                            {comment.user.fullName}
                          </Typography>
                        </Stack>

                        <Typography variant="body2">
                          {comment.comment}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Write a reply..."
                            value={replyInputs[comment.id] || ''}
                            onChange={(e) =>
                              setReplyInputs((prev) => ({
                                ...prev,
                                [comment.id]: e.target.value,
                              }))
                            }
                          />
                          <IconButton
                            color="primary"
                            disabled={
                              submitting || !replyInputs[comment.id]?.trim()
                            }
                            onClick={() => void handleReply(comment.id)}
                          >
                            <ReplyIcon />
                          </IconButton>
                        </Stack>

                        <Stack spacing={1}>
                          {comment.shopJournalCommentReplies.map((reply) => (
                            <Box
                              key={reply.id}
                              sx={{
                                pl: 1.5,
                                py: 1,
                                borderLeft: 2,
                                borderColor: 'divider',
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Avatar
                                  src={resolveMediaUrl(reply.user.avatarUrl)}
                                  sx={{ width: 24, height: 24 }}
                                >
                                  {reply.user.fullName?.[0]}
                                </Avatar>
                                <Typography variant="caption" fontWeight={700}>
                                  {reply.user.fullName}
                                </Typography>
                              </Stack>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {reply.reply}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
      >
        <DialogTitle>Confirm action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction
              ? `Are you sure you want to ${confirmAction} this journal?`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (confirmAction) {
                void handleStatusAction(confirmAction);
              }
              setConfirmAction(null);
            }}
            disabled={submitting}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
