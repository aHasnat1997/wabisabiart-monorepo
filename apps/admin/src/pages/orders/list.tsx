import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { RefineListView } from '../../components/index.js';
import { orderAdminApi, type AdminOrderSummaryRow } from '../../api/order.js';
import { resolveMediaUrl } from '../../utils/index.js';
import dayjs from 'dayjs';

type ViewKey = 'all' | 'cancel_requests' | 'disputes' | 'pending_payouts';

export const STATUS_COLORS: Record<
  string,
  'default' | 'warning' | 'success' | 'error' | 'info' | 'primary' | 'secondary'
> = {
  pending_payment: 'warning',
  payment_failed: 'error',
  paid: 'success',
  processing: 'info',
  shipped: 'primary',
  in_transit: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'secondary',
  disputed: 'warning',
};

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Pending Payment',
  payment_failed: 'Payment Failed',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

const VIEW_TABS: { key: ViewKey; label: string; activeColor: string }[] = [
  { key: 'all', label: 'All Orders', activeColor: '#6D8040' },
  {
    key: 'pending_payouts',
    label: 'Seller Payout Approvals',
    activeColor: '#0f766e',
  },
  { key: 'cancel_requests', label: 'Cancel Requests', activeColor: '#ef4444' },
  { key: 'disputes', label: 'Disputes', activeColor: '#d97706' },
];

export const OrderList = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewKey>('all');
  const [orders, setOrders] = useState<AdminOrderSummaryRow[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(paginationModel.page + 1),
        limit: String(paginationModel.pageSize),
      };
      if (view !== 'all') params['view'] = view;
      if (searchQuery) params['q'] = searchQuery;
      const res = await orderAdminApi.getAll(params);
      const body = res.data.data;
      setOrders(body.data);
      setMeta(body.meta);
    } finally {
      setLoading(false);
    }
  }, [view, paginationModel, searchQuery]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleSearch = () => setSearchQuery(searchText);

  const isCancelRequest = (row: AdminOrderSummaryRow) =>
    !!row.internalNote?.startsWith('CANCEL_REQUESTED:');

  const hasOpenDispute = (row: AdminOrderSummaryRow) =>
    !!row.disputes?.some(
      (d) => d.status === 'open' || d.status === 'under_review',
    );

  const isPayoutReleased = (row: AdminOrderSummaryRow) =>
    row.internalNote === 'PAYOUT_RELEASED';

  const isPayoutPending = (row: AdminOrderSummaryRow) =>
    row.status === 'paid' && !isPayoutReleased(row);

  const columns: GridColDef<AdminOrderSummaryRow>[] = [
    {
      field: 'orderNumber',
      headerName: 'Order',
      width: 200,
      renderCell: ({ row }) => (
        <Stack direction="column" justifyContent="center" height="100%">
          <Typography variant="body2" fontWeight={700}>
            #{row.orderNumber}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {dayjs(row.createdAt).format('MMM D, YYYY')}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'buyer',
      headerName: 'Customer',
      width: 340,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" gap={1.5} height="100%">
          <Avatar
            src={resolveMediaUrl(row.buyer?.avatarUrl)}
            sx={{ width: 36, height: 36, fontSize: 14 }}
          >
            {row.buyer?.fullName?.[0]}
          </Avatar>
          <Stack>
            <Typography variant="body2" fontWeight={600} lineHeight={1.3}>
              {row.buyer?.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.buyer?.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'seller',
      headerName: 'Shop',
      width: 350,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" gap={1} height="100%">
          <Avatar
            src={resolveMediaUrl(row.seller?.shopLogo)}
            sx={{ width: 28, height: 28, fontSize: 12 }}
          >
            {row.seller?.shopName?.[0]}
          </Avatar>
          <Typography variant="body2">{row.seller?.shopName}</Typography>
        </Stack>
      ),
    },
    {
      field: 'items',
      headerName: 'Items',
      width: 100,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
          height="100%"
        >
          <Typography variant="body2">{row.items?.length ?? 0}</Typography>
        </Stack>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Total',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={1}
          height="100%"
        >
          <Typography variant="body2" fontWeight={700}>
            ${Number(row.totalAmount).toFixed(2)}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Stack
          spacing={0.5}
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
        >
          <Chip
            label={STATUS_LABELS[row.status] ?? row.status}
            color={STATUS_COLORS[row.status] ?? 'default'}
            size="small"
            sx={{ fontSize: '0.7rem', fontWeight: 600, width: 'fit-content' }}
          />
          {isCancelRequest(row) && (
            <Chip
              label="⚠ Cancel Requested"
              color="error"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', width: 'fit-content' }}
            />
          )}
          {hasOpenDispute(row) && (
            <Chip
              label="⚠ Dispute Open"
              color="warning"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', width: 'fit-content' }}
            />
          )}
          {isPayoutPending(row) && (
            <Chip
              label="Payout Pending"
              color="warning"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', width: 'fit-content' }}
            />
          )}
          {isPayoutReleased(row) && (
            <Chip
              label="Payout Released"
              color="success"
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.65rem', width: 'fit-content' }}
            />
          )}
        </Stack>
      ),
    },
    {
      field: 'actions',
      headerName: '',
      width: 60,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => void navigate(`/orders/${row.id}`)}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <RefineListView title="Order Management">
      {/* View Tabs */}
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
        {VIEW_TABS.map((tab) => {
          const isActive = view === tab.key;
          const count = tab.key !== 'all' && isActive ? meta.total : undefined;
          return (
            <Chip
              key={tab.key}
              label={
                count !== undefined ? `${tab.label} (${count})` : tab.label
              }
              onClick={() => {
                setView(tab.key);
                setPaginationModel({ page: 0, pageSize: 10 });
              }}
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                borderColor: tab.activeColor,
                color: isActive ? '#fff' : tab.activeColor,
                bgcolor: isActive ? tab.activeColor : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? tab.activeColor : `${tab.activeColor}22`,
                },
              }}
            />
          );
        })}
      </Stack>

      {/* Search */}
      <Box mb={2}>
        <TextField
          size="small"
          placeholder="Search by order number..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleSearch}>
                  <SearchIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        rowCount={meta.total}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        rowHeight={72}
        disableRowSelectionOnClick
        sx={{ minHeight: 420 }}
      />
    </RefineListView>
  );
};
