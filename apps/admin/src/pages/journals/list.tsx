import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { useNotification } from '@refinedev/core';
import {
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { RefineListView } from '../../components/index.js';
import {
  adminJournalApi,
  type AdminJournalListItem,
} from '../../api/journal.js';
import { resolveMediaUrl } from '../../utils/index.js';

type JournalView = 'published' | 'publishing_request' | 'blocked' | 'rejected';

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

export const JournalList = () => {
  const navigate = useNavigate();
  const { open } = useNotification();

  const [view, setView] = useState<JournalView>('published');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<AdminJournalListItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [busyJournalId, setBusyJournalId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [menuJournal, setMenuJournal] = useState<AdminJournalListItem | null>(
    null,
  );
  const [confirmAction, setConfirmAction] = useState<{
    journalId: string;
    action: 'publish' | 'reject' | 'block';
  } | null>(null);

  const loadJournals = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(paginationModel.page + 1),
        limit: String(paginationModel.pageSize),
        view,
      };

      const res = await adminJournalApi.getAll(params);
      setRows(res.data.data);
      setMeta({
        page: res.data.meta.page,
        limit: res.data.meta.limit,
        total: res.data.meta.totalData,
      });
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, view]);

  useEffect(() => {
    void loadJournals();
  }, [loadJournals]);

  const handleStatusAction = async (
    journalId: string,
    action: 'publish' | 'reject' | 'block',
  ) => {
    try {
      setBusyJournalId(journalId);
      await adminJournalApi.updateStatus(journalId, action);
      open?.({
        type: 'success',
        message: `Journal ${action}ed successfully`,
      });
      await loadJournals();
    } catch {
      open?.({
        type: 'error',
        message: `Failed to ${action} journal`,
      });
    } finally {
      setBusyJournalId(null);
    }
  };

  const openActionMenu = (
    event: MouseEvent<HTMLButtonElement>,
    row: AdminJournalListItem,
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom, left: rect.right });
    setMenuJournal(row);
  };

  const closeActionMenu = () => {
    setMenuPosition(null);
    setMenuJournal(null);
  };

  const ActionButtons = ({ row }: { row: AdminJournalListItem }) => {
    return (
      <IconButton
        size="small"
        onClick={(event) => openActionMenu(event, row)}
        disabled={busyJournalId === row.id}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    );
  };

  const columns: GridColDef<AdminJournalListItem>[] = [
    {
      field: 'title',
      headerName: 'Journal',
      minWidth: 280,
      flex: 1,
      renderCell: ({ row }) => (
        <Stack
          sx={{ minWidth: 0, height: '100%' }}
          justifyContent="center"
          alignItems="flex-start"
        >
          <Typography variant="body2" fontWeight={600} noWrap>
            {row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {row.shortExcerpt || 'No excerpt'}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'shop',
      headerName: 'Seller',
      minWidth: 250,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ minWidth: 0, height: '100%' }}
        >
          <Avatar
            src={resolveMediaUrl(row.shop?.user?.avatarUrl)}
            alt={row.shop?.user?.fullName}
            sx={{ width: 30, height: 30 }}
          >
            {row.shop?.user?.fullName?.[0]}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {row.shop?.shopName || '-'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.shop?.user?.fullName || '-'}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'postStatus',
      headerName: 'Status',
      width: 170,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => {
        const status = row.postStatus || 'default';
        return (
          <Stack
            sx={{ height: '100%', width: '100%' }}
            alignItems="center"
            justifyContent="center"
          >
            <Chip
              size="small"
              label={STATUS_LABELS[status] || status}
              color={STATUS_COLORS[status] || 'default'}
            />
          </Stack>
        );
      },
    },
    {
      field: 'engagement',
      headerName: 'Engagement',
      width: 170,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack
          sx={{ height: '100%', width: '100%' }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="body2" color="text.secondary">
            {row._count?.shopJournalLikes || 0} likes •{' '}
            {row._count?.shopJournalComments || 0} comments
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack
          sx={{ height: '100%', width: '100%' }}
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="body2">
            {new Date(row.createdAt).toLocaleString()}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <Stack
          sx={{ height: '100%', width: '100%' }}
          alignItems="flex-end"
          justifyContent="center"
        >
          <ActionButtons row={row} />
        </Stack>
      ),
    },
  ];

  return (
    <RefineListView
      title="Journal Moderation"
      headerButtons={() => [
        <ToggleButtonGroup
          key="journal-view-toggle"
          value={view}
          exclusive
          size="small"
          onChange={(_e, value: JournalView | null) => {
            if (!value) return;
            setView(value);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          }}
        >
          <ToggleButton value="published">Published</ToggleButton>
          <ToggleButton value="publishing_request">Request</ToggleButton>
          <ToggleButton value="rejected">Rejected</ToggleButton>
          <ToggleButton value="blocked">Blocked</ToggleButton>
        </ToggleButtonGroup>,
      ]}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        pagination
        rowCount={meta.total}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowHeight={70}
        disableRowSelectionOnClick
      />

      <Menu
        anchorReference="anchorPosition"
        anchorPosition={
          menuPosition
            ? { top: menuPosition.top, left: menuPosition.left }
            : undefined
        }
        open={Boolean(menuPosition && menuJournal)}
        onClose={closeActionMenu}
      >
        {menuJournal && (
          <MenuItem
            onClick={() => {
              void navigate(`/journals/${menuJournal.id}`);
              closeActionMenu();
            }}
          >
            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
            View
          </MenuItem>
        )}

        {menuJournal &&
          (menuJournal.postStatus === 'publishing_request' ||
            menuJournal.postStatus === 'rejected' ||
            menuJournal.postStatus === 'blocked' ||
            menuJournal.postStatus === 'draft') && (
            <MenuItem
              onClick={() => {
                setConfirmAction({
                  journalId: menuJournal.id,
                  action: 'publish',
                });
                closeActionMenu();
              }}
            >
              <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
              Publish
            </MenuItem>
          )}

        {menuJournal?.postStatus === 'publishing_request' && (
          <MenuItem
            onClick={() => {
              setConfirmAction({
                journalId: menuJournal.id,
                action: 'reject',
              });
              closeActionMenu();
            }}
          >
            <CloseIcon fontSize="small" sx={{ mr: 1 }} />
            Reject
          </MenuItem>
        )}

        {menuJournal && menuJournal.postStatus !== 'blocked' && (
          <MenuItem
            onClick={() => {
              setConfirmAction({
                journalId: menuJournal.id,
                action: 'block',
              });
              closeActionMenu();
            }}
          >
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            Block
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
      >
        <DialogTitle>Confirm action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction
              ? `Are you sure you want to ${confirmAction.action} this journal?`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmAction) {
                void handleStatusAction(
                  confirmAction.journalId,
                  confirmAction.action,
                );
              }
              setConfirmAction(null);
            }}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </RefineListView>
  );
};
