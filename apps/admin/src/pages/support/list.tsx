import { useEffect, useMemo, useState } from 'react';
import { type HttpError, useInvalidate } from '@refinedev/core';
import { useDataGrid, DateField, EditButton } from '@refinedev/mui';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  Box,
  Skeleton,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Grid2 as Grid,
  Card,
  CardContent,
} from '@mui/material';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { CustomTooltip, RefineListView } from '../../components/index.js';
import { SupportTicketStatus } from './components/index.js';
import { EmailDetailModal } from './modals/email-detail-modal.js';
import { TicketDetailModal } from './modals/ticket-detail-modal.js';
import { SupportDetailModal } from './modals/support-detail-modal.js';
import {
  TSupportContactDetails,
  SupportsApi,
  TSupportEmail,
} from '../../api/support.js';

interface ISupportUser {
  id: string;
  fullName: string;
  email: string;
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

export const SupportList = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const invalidate = useInvalidate();

  const [currentTab, setCurrentTab] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<ISupportTicket | null>(
    null,
  );
  const [selectedEmail, setSelectedEmail] = useState<TSupportEmail | null>(
    null,
  );

  const [editInfoModal, setEditInfoModal] = useState<boolean>(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isUpdatingTicket, setIsUpdatingTicket] = useState(false);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(true);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(true);

  const [supportContact, setSupportContact] =
    useState<TSupportContactDetails | null>(null);
  const [supportEmails, setSupportEmails] = useState<TSupportEmail[]>([]);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const res = await SupportsApi.getContact();
        const data = res.data.data;
        setSupportContact(data);
      } catch (error) {
        console.error('Failed to fetch support contact:', error);
      } finally {
        setIsLoadingContact(false);
      }
    };

    void loadContact();
  }, []);

  // DataGrid for emails
  useEffect(() => {
    const loadEmails = async () => {
      try {
        setIsLoadingEmails(true);
        const res = await SupportsApi.emailSupport();
        const data = res.data.data;
        setSupportEmails(data);
      } catch (error) {
        console.error('Failed to fetch support emails:', error);
      } finally {
        setIsLoadingEmails(false);
      }
    };

    void loadEmails();
  }, []);

  // DataGrid for tickets
  const ticketDataGridProps = useDataGrid<ISupportTicket, HttpError>({
    resource: 'support/admin/tickets',
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: false,
  });

  const emailColumns = useMemo<GridColDef<TSupportEmail>[]>(
    () => [
      {
        field: 'firstName',
        headerName: 'From',
        minWidth: 240,
        valueGetter: (_, row) =>
          `${row.firstName} ${row.lastName}`.trim() || 'Unknown',
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 350,
        renderCell: function render({ row }) {
          return (
            <Typography
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {row.email || 'N/A'}
            </Typography>
          );
        },
      },
      {
        field: 'subject',
        headerName: 'Subject',
        minWidth: 420,
        renderCell: function render({ row }) {
          return (
            <CustomTooltip title={row.subject}>
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {row.subject}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        field: 'createdAt',
        width: 180,
        headerName: 'Sent',
        display: 'flex',
        renderCell: function render({ row }) {
          return <DateField value={row.createdAt} format="LL" />;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        display: 'flex',
        sortable: false,
        filterable: false,
        renderCell: function render({ row }) {
          return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {!row.isRead && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: 'error.main',
                    zIndex: 1,
                  }}
                />
              )}
              <IconButton
                sx={{ color: 'text.secondary' }}
                onClick={() => {
                  setSelectedEmail(row);
                  setEmailModalOpen(true);
                  setSupportEmails((prev) =>
                    prev.map((e) =>
                      e.id === row.id ? { ...e, isRead: true } : e,
                    ),
                  );
                }}
              >
                <VisibilityOutlined />
              </IconButton>
            </Box>
          );
        },
      },
    ],
    [setSelectedEmail],
  );

  const ticketColumns = useMemo<GridColDef<ISupportTicket>[]>(
    () => [
      {
        field: 'subject',
        headerName: 'Subject',
        minWidth: 300,
        renderCell: function render({ row }) {
          return (
            <CustomTooltip title={row.subject}>
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                {row.subject}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        field: 'user.fullName',
        headerName: 'From User',
        minWidth: 240,
        valueGetter: (_, row) => {
          return row.user?.fullName || 'Unknown';
        },
      },
      {
        field: 'category',
        headerName: 'Category',
        width: 180,
        renderCell: function render({ row }) {
          return (
            <Typography
              variant="body2"
              sx={{ display: 'flex', alignItems: 'center', height: '100%' }}
            >
              {row.category.replace(/_/g, ' ')}
            </Typography>
          );
        },
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 100,
        renderCell: function render({ row }) {
          const colors: Record<string, string> = {
            LOW: '#4CAF50',
            MEDIUM: '#FF9800',
            HIGH: '#f44336',
          };
          return (
            <Typography
              sx={{
                color: colors[row.priority] || '#999',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {row.priority}
            </Typography>
          );
        },
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 110,
        display: 'flex',
        renderCell: function render({ row }) {
          return (
            <SupportTicketStatus
              value={
                row.status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
              }
            />
          );
        },
      },
      {
        field: 'createdAt',
        width: 170,
        headerName: 'Created',
        display: 'flex',
        renderCell: function render({ row }) {
          return <DateField value={row.createdAt} format="LL" />;
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 80,
        align: 'center',
        headerAlign: 'center',
        display: 'flex',
        sortable: false,
        filterable: false,
        renderCell: function render({ row }) {
          return (
            <IconButton
              sx={{
                color: 'text.secondary',
              }}
              onClick={() => {
                setSelectedTicket(row);
                setTicketModalOpen(true);
              }}
            >
              <VisibilityOutlined />
            </IconButton>
          );
        },
      },
    ],
    [setSelectedTicket],
  );

  const handleUpdateTicket = (
    ticketId: string,
    status: string,
    priority: string,
  ) => {
    setIsUpdatingTicket(true);

    fetch(`/api/v1/support/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        priority,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setIsUpdatingTicket(false);
        setTicketModalOpen(false);
        setSelectedTicket(null);
        // Invalidate and refetch the ticket list
        void invalidate({
          resource: 'support/admin/tickets',
          invalidates: ['list'],
        });
      })
      .catch((error) => {
        console.error('Update failed:', error);
        setIsUpdatingTicket(false);
      });
  };

  const renderContactSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={`support-contact-skeleton-${index}`} size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width={120} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={36} />
              <Skeleton variant="text" width="92%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmailSkeleton = () => (
    <Box sx={{ mt: 2, px: 1 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={`support-email-skeleton-${index}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: '240px 1fr 420px 180px 80px',
            gap: 2,
            alignItems: 'center',
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" height={24} />
          <Skeleton variant="text" height={24} width="85%" />
          <Skeleton variant="text" height={24} width="92%" />
          <Skeleton variant="text" height={24} width={120} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ))}
    </Box>
  );

  return (
    <>
      <RefineListView
        title="Support Information"
        wrapperProps={{
          sx: {
            flexDirection: 'column',
          },
        }}
        headerButtons={
          <EditButton
            variant="outlined"
            onClick={() => setEditInfoModal(true)}
            size="medium"
            sx={{ height: '40px' }}
          />
        }
      >
        {isLoadingContact ? (
          renderContactSkeleton()
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Support Email
                  </Typography>
                  <Typography variant="h6">
                    {supportContact?.email || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    We'll respond as soon as possible.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available in Week Range
                  </Typography>
                  <Typography variant="h6">
                    {supportContact?.availableWeekRange || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Call us for immediate assistance.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Available Time Range
                  </Typography>
                  <Typography variant="h6">
                    {supportContact?.availableTimeRange || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Business hours for support.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Response Time
                  </Typography>
                  <Typography variant="h6">
                    {supportContact?.responseTime || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    During business hours.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </RefineListView>

      <RefineListView
        title="Support System"
        wrapperProps={{
          sx: {
            flexDirection: 'column',
          },
        }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 1,
          }}
        >
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Tabs
              value={currentTab}
              onChange={(_e, value) => {
                if (typeof value === 'number') {
                  setCurrentTab(value);
                }
              }}
              aria-label="support tabs"
            >
              <Tab
                icon={<MailOutlineIcon />}
                iconPosition="start"
                label={`Support Emails (${supportEmails?.length || 0})`}
                sx={{
                  fontSize: isSmallScreen ? '0.8rem' : '1rem',
                }}
              />
              <Tab
                icon={<ConfirmationNumberOutlinedIcon />}
                iconPosition="start"
                label={`Support Tickets (${
                  ticketDataGridProps?.dataGridProps?.rows?.length || 0
                })`}
                sx={{
                  fontSize: isSmallScreen ? '0.8rem' : '1rem',
                }}
              />
            </Tabs>
          </Box>

          {/* Support Emails Tab */}
          {currentTab === 0 &&
            (isLoadingEmails ? (
              renderEmailSkeleton()
            ) : (
              <Box sx={{ mt: 2 }}>
                <DataGrid
                  rows={supportEmails}
                  columns={emailColumns}
                  sx={{
                    '& .MuiDataGrid-root': {
                      border: 'none',
                    },
                  }}
                />
              </Box>
            ))}

          {/* Support Tickets Tab */}
          {currentTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <DataGrid
                {...ticketDataGridProps.dataGridProps}
                columns={ticketColumns}
                sx={{
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      </RefineListView>

      {/* Modals */}
      <SupportDetailModal
        supportContact={supportContact}
        setSupportContact={setSupportContact}
        open={editInfoModal}
        onClose={() => {
          setEditInfoModal(false);
        }}
      />

      <EmailDetailModal
        open={emailModalOpen}
        email={selectedEmail}
        onClose={() => {
          setEmailModalOpen(false);
          setSelectedEmail(null);
        }}
      />

      <TicketDetailModal
        open={ticketModalOpen}
        ticket={selectedTicket}
        onClose={() => {
          setTicketModalOpen(false);
          setSelectedTicket(null);
        }}
        onUpdate={handleUpdateTicket}
        isUpdating={isUpdatingTicket}
      />
    </>
  );
};
