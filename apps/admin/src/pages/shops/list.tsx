import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Chip,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { RefineListView } from '../../components/index.js';
import { shopAdminApi, type AdminShopRecord } from '../../api/shop.js';
import { resolveMediaUrl } from '../../utils/index.js';

const getShopName = (record: AdminShopRecord) =>
  record.sellerProfile?.shopName ||
  record.shopSetupRequest?.shopName ||
  'Unnamed shop';

const getStatus = (record: AdminShopRecord) => {
  if (record.sellerProfile) return 'approved';
  return record.shopSetupRequest?.status || 'pending';
};

const statusColor = (
  status: string,
): 'success' | 'warning' | 'error' | 'default' => {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'rejected') return 'error';
  return 'default';
};

export const ShopList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminShopRecord[]>([]);
  const [view, setView] = useState<'request' | 'active'>('active');

  useEffect(() => {
    const load = async () => {
      const res = await shopAdminApi.getAll();
      setRows(res.data.data);
    };

    void load();
  }, []);

  const filteredRows = rows.filter((row) => {
    if (view === 'request') {
      return !!row.shopSetupRequest && !row.sellerProfile;
    }

    return !!row.sellerProfile;
  });

  const columns: GridColDef<AdminShopRecord>[] = [
    {
      field: 'shopName',
      headerName: 'Shop',
      minWidth: 220,
      flex: 1,
      valueGetter: (_value, row) => getShopName(row),
    },
    {
      field: 'seller',
      headerName: 'Seller',
      minWidth: 260,
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          <Avatar src={resolveMediaUrl(row.avatarUrl)} alt={row.fullName}>
            {row.fullName?.[0]}
          </Avatar>
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {row.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {row.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      valueGetter: (_value, row) => getStatus(row),
      renderCell: ({ row }) => {
        const status = getStatus(row);
        return <Chip size="small" label={status} color={statusColor(status)} />;
      },
    },
    {
      field: 'featured',
      headerName: 'Featured',
      width: 120,
      sortable: false,
      renderCell: ({ row }) =>
        row.sellerProfile?.isFeatured ? (
          <Chip size="small" label="Featured" color="primary" />
        ) : (
          '-'
        ),
    },
    {
      field: 'submittedAt',
      headerName: 'Submitted',
      width: 190,
      valueGetter: (_value, row) =>
        row.shopSetupRequest?.createdAt ||
        row.sellerProfile?.createdAt ||
        row.createdAt,
      renderCell: ({ row }) =>
        new Date(
          row.shopSetupRequest?.createdAt ||
            row.sellerProfile?.createdAt ||
            row.createdAt,
        ).toLocaleString(),
    },
    {
      field: 'verifiedAt',
      headerName: 'Verified',
      width: 190,
      sortable: false,
      renderCell: ({ row }) =>
        row.sellerProfile?.verificationDate
          ? new Date(row.sellerProfile.verificationDate).toLocaleString()
          : '-',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }) => (
        <IconButton onClick={() => void navigate(`/shops/${row.id}`)}>
          <Visibility />
        </IconButton>
      ),
    },
  ];

  return (
    <RefineListView
      title={view === 'request' ? 'Shop Requests' : 'Active Shops'}
      headerButtons={() => [
        <ToggleButtonGroup
          key="shop-list-view-toggle"
          value={view}
          exclusive
          onChange={(_e, value: 'request' | 'active' | null) => {
            if (value) setView(value);
          }}
          size="small"
        >
          <ToggleButton value="active">Active Shop</ToggleButton>
          <ToggleButton value="request">Request Shop</ToggleButton>
        </ToggleButtonGroup>,
      ]}
    >
      <DataGrid
        rows={filteredRows}
        columns={columns}
        pageSizeOptions={[10, 20, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </RefineListView>
  );
};
