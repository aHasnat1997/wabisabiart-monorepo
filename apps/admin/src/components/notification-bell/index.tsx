import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNotifications } from '../../hooks/useNotifications/index.js';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const recent = notifications.slice(0, 8);

  const handleItemClick = async (id: string, actionUrl?: string) => {
    await markRead(id);
    setOpen(false);
    if (actionUrl) navigate(actionUrl);
  };

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={() => setOpen(true)}
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'transparent' : '#00000014',
        }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 520 } } }}
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.5}
          borderBottom={(theme) => `1px solid ${theme.palette.divider}`}
        >
          <Typography fontWeight={600} fontSize={15}>
            Notifications
            {unreadCount > 0 && (
              <Typography component="span" fontSize={12} color="text.secondary" ml={1}>
                ({unreadCount} unread)
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton size="small" onClick={markAllRead}>
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* List */}
        {recent.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography color="text.secondary" fontSize={14}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', maxHeight: 390 }}>
            {recent.map((n, i) => (
              <Box key={n.id}>
                <ListItemButton
                  onClick={() => handleItemClick(n.id, n.actionUrl)}
                  sx={{
                    backgroundColor: n.isRead
                      ? 'transparent'
                      : (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(25,118,210,0.06)',
                    alignItems: 'flex-start',
                    py: 1.5,
                    px: 2,
                  }}
                >
                  {/* Unread dot */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: n.isRead ? 'transparent' : 'primary.main',
                      mt: '6px',
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={
                      <Typography fontSize={13} fontWeight={n.isRead ? 400 : 600} lineHeight={1.4}>
                        {n.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" display="block" fontSize={12} color="text.secondary" mt={0.3}>
                          {n.message}
                        </Typography>
                        <Typography component="span" display="block" fontSize={11} color="text.disabled" mt={0.5}>
                          {new Date(n.createdAt).toLocaleString()}
                        </Typography>
                      </>
                    }
                    sx={{ m: 0 }}
                  />
                </ListItemButton>
                {i < recent.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}

        {/* Footer */}
        <Divider />
        <Box py={1} textAlign="center">
          <Button
            size="small"
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};
