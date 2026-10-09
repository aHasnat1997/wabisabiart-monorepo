import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Divider,
  Badge,
  Chip,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useGetIdentity } from '@refinedev/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useChat, type Conversation } from '../../hooks/useChat.js';

dayjs.extend(relativeTime);

function getConversationLabel(conv: Conversation): string {
  if (conv.type === 'support') return conv.customer?.fullName ?? 'Customer';
  return conv.seller?.shopName ?? conv.customer?.fullName ?? 'Unknown';
}

function getConversationAvatar(conv: Conversation): string {
  return (
    conv.customer?.avatarUrl ??
    conv.seller?.shopLogo ??
    ''
  );
}

function getConversationSubtitle(conv: Conversation): string {
  const typeLabel: Record<string, string> = {
    support: 'Support',
    general: 'General',
    order_inquiry: 'Order Inquiry',
    refund_request: 'Refund',
    product_inquiry: 'Product',
  };
  return typeLabel[conv.type] ?? conv.type;
}

export const ChatPage = () => {
  const {
    connected,
    conversations,
    messages,
    activeConversation,
    typingUsers,
    openConversation,
    sendMessage,
    sendTyping,
  } = useChat();

  const { data: identity } = useGetIdentity<{ id: string; fullName: string }>();
  const [input, setInput] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
    sendTyping(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    sendTyping(true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => sendTyping(false), 1500));
  };

  const typingUserIds = Object.entries(typingUsers)
    .filter(([uid, isTyping]) => isTyping && uid !== identity?.id)
    .map(([uid]) => uid);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
      {/* Sidebar */}
      <Box sx={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            Conversations
          </Typography>
          <Badge
            color={connected ? 'success' : 'error'}
            variant="dot"
            sx={{ ml: 'auto' }}
          >
            <FiberManualRecordIcon
              sx={{ fontSize: 12, color: connected ? 'success.main' : 'error.main' }}
            />
          </Badge>
        </Box>
        <Divider />
        {conversations.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <ChatBubbleOutlineIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
            <Typography variant="body2">No conversations yet</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ overflowY: 'auto', flex: 1 }}>
            {conversations.map((conv) => (
              <ListItemButton
                key={conv.id}
                selected={activeConversation?.id === conv.id}
                onClick={() => openConversation(conv)}
                sx={{ px: 2, py: 1.5, alignItems: 'flex-start' }}
              >
                <ListItemAvatar sx={{ minWidth: 44 }}>
                  <Avatar
                    src={getConversationAvatar(conv)}
                    sx={{ width: 36, height: 36, fontSize: 14 }}
                  >
                    {getConversationLabel(conv).charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 140 }}>
                        {getConversationLabel(conv)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {conv.lastMessageAt ? dayjs(conv.lastMessageAt).fromNow() : ''}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      <Chip
                        label={getConversationSubtitle(conv)}
                        size="small"
                        sx={{ height: 16, fontSize: 10, '& .MuiChip-label': { px: 0.75 } }}
                      />
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                        {conv.lastMessage ?? ''}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      {/* Chat Area */}
      {activeConversation ? (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          {/* Header */}
          <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={getConversationAvatar(activeConversation)} sx={{ width: 34, height: 34 }}>
              {getConversationLabel(activeConversation).charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body1" fontWeight={600}>
                {getConversationLabel(activeConversation)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {getConversationSubtitle(activeConversation)}
              </Typography>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((msg) => {
              const isMe = msg.senderId === identity?.id;
              return (
                <Box
                  key={msg.id}
                  sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 1 }}
                >
                  {!isMe && (
                    <Avatar sx={{ width: 28, height: 28, fontSize: 12, alignSelf: 'flex-end' }}>
                      {msg.sender?.fullName?.charAt(0) ?? '?'}
                    </Avatar>
                  )}
                  <Box sx={{ maxWidth: '65%' }}>
                    {!isMe && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        {msg.sender?.fullName}
                      </Typography>
                    )}
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.5,
                        py: 1,
                        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        bgcolor: isMe ? 'primary.main' : 'background.paper',
                        color: isMe ? 'primary.contrastText' : 'text.primary',
                        border: isMe ? 'none' : '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                    </Paper>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                      {dayjs(msg.createdAt).format('HH:mm')}
                    </Typography>
                  </Box>
                </Box>
              );
            })}

            {typingUserIds.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={12} />
                <Typography variant="caption" color="text.secondary">
                  Typing...
                </Typography>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message..."
              value={input}
              multiline
              maxRows={4}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!input.trim() || !connected}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' }, '&:disabled': { bgcolor: 'action.disabledBackground' } }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', gap: 2 }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 64, opacity: 0.2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a conversation
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Choose a conversation from the left to start chatting
          </Typography>
        </Box>
      )}
    </Box>
  );
};
