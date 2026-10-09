import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { useNotifications } from '../../hooks/useNotifications/index.js';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

const TYPE_META: Record<string, { label: string; color: ChipColor }> = {
  ADMIN_SHOP_PENDING:    { label: 'Shop Approval',   color: 'warning' },
  ADMIN_PRODUCT_PENDING: { label: 'Product Review',  color: 'info' },
  ADMIN_JOURNAL_PENDING: { label: 'Journal Review',  color: 'info' },
  ADMIN_SUPPORT_TICKET:  { label: 'Support Ticket',  color: 'secondary' },
  ADMIN_SUPPORT_EMAIL:   { label: 'Support Email',   color: 'secondary' },
  ADMIN_REPORT:          { label: 'Report',          color: 'error' },
};

const FILTERS = [
  { label: 'All',      value: 'all' },
  { label: 'Unread',   value: 'unread' },
  { label: 'Shop',     value: 'ADMIN_SHOP_PENDING' },
  { label: 'Products', value: 'ADMIN_PRODUCT_PENDING' },
  { label: 'Journals', value: 'ADMIN_JOURNAL_PENDING' },
  { label: 'Support',  value: 'support' },
  { label: 'Reports',  value: 'ADMIN_REPORT' },
];

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'support')
      return n.type === 'ADMIN_SUPPORT_TICKET' || n.type === 'ADMIN_SUPPORT_EMAIL';
    return n.type === filter;
  });

  const handleClick = async (id: string, actionUrl?: string) => {
    await markRead(id);
    if (actionUrl) navigate(actionUrl);
  };

  return (
    <Box maxWidth={800} mx="auto" py={3} px={{ xs: 2, sm: 0 }}>
      {/* Page header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        {unreadCount > 0 && (
          <Button startIcon={<DoneAllIcon />} variant="outlined" size="small" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </Stack>

      {/* Filter chips */}
      <Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
        {FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            onClick={() => setFilter(f.value)}
            color={filter === f.value ? 'primary' : 'default'}
            variant={filter === f.value ? 'filled' : 'outlined'}
            size="small"
          />
        ))}
      </Stack>

      {/* List */}
      <Paper variant="outlined">
        {filtered.length === 0 ? (
          <Box py={8} textAlign="center">
            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">No notifications</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((n, i) => {
              const meta = TYPE_META[n.type];
              return (
                <Box key={n.id}>
                  <ListItemButton
                    onClick={() => handleClick(n.id, n.actionUrl)}
                    sx={{
                      backgroundColor: n.isRead
                        ? 'transparent'
                        : (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.04)'
                              : 'rgba(25,118,210,0.05)',
                      py: 2,
                      px: 3,
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Unread dot */}
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: n.isRead ? 'transparent' : 'primary.main',
                        mt: '7px',
                        mr: 2,
                        flexShrink: 0,
                      }}
                    />

                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography fontSize={14} fontWeight={n.isRead ? 400 : 600}>
                            {n.title}
                          </Typography>
                          {meta && (
                            <Chip
                              label={meta.label}
                              color={meta.color}
                              size="small"
                              sx={{ height: 20, fontSize: 11 }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Box mt={0.5}>
                          <Typography fontSize={13} color="text.secondary">
                            {n.message}
                          </Typography>
                          <Typography fontSize={11} color="text.disabled" mt={0.5}>
                            {new Date(n.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />

                    {!n.isRead && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                          sx={{ ml: 1, flexShrink: 0 }}
                        >
                          <DoneAllIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemButton>
                  {i < filtered.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Paper>
    </Box>
  );
};
