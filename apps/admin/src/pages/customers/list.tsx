import { type PropsWithChildren, useMemo } from 'react';
import {
  type HttpError,
  useExport,
  useGo,
  useNavigation,
  useTranslate,
} from '@refinedev/core';
import { useLocation } from 'react-router';
import { DateField, ExportButton, useDataGrid } from '@refinedev/mui';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import IconButton from '@mui/material/IconButton';
import type { IUser, IUserFilterVariables } from '../../interfaces/index.js';
import { CustomTooltip, RefineListView } from '../../components/index.js';
import { CustomerStatus } from '../../components/customer/index.js';

interface ICustomer extends IUser {
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  totalOrders: number;
  totalSpent: string;
  location: string;
  isActive: boolean;
  lastOrderDate?: string | null;
  createdAt: string;
}

export const CustomerList = ({ children }: PropsWithChildren) => {
  const go = useGo();
  const { pathname } = useLocation();
  const { showUrl } = useNavigation();
  const t = useTranslate();

  const { dataGridProps, filters, sorters } = useDataGrid<
    ICustomer,
    HttpError,
    IUserFilterVariables
  >({
    pagination: {
      pageSize: 10,
    },
  });

  const columns = useMemo<GridColDef<ICustomer>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID #',
        description: 'ID #',
        width: 52,
        display: 'flex',
        type: 'string',
        renderCell: function render({ row }) {
          return (
            <Typography variant="body2">
              {String(row.id).slice(0, 8).toUpperCase()}
            </Typography>
          );
        },
      },
      {
        field: 'avatarUrl',
        headerName: 'Avatar',
        display: 'flex',
        renderCell: function render({ row }) {
          return (
            <Avatar
              sx={{
                width: 32,
                height: 32,
              }}
              src={row.avatarUrl || '/placeholders/profile-placeholder.png'}
              alt={row.fullName}
            />
          );
        },
        width: 64,
        align: 'center',
        headerAlign: 'center',
        sortable: false,
      },
      {
        field: 'phoneNumber',
        headerName: 'Phone',
        width: 120,
        sortable: false,
        renderCell: function render({ row }) {
          return <Typography>{row.phoneNumber || 'N/A'}</Typography>;
        },
      },
      {
        field: 'fullName',
        headerName: 'Name',
        minWidth: 140,
      },
      {
        field: 'email',
        headerName: 'Email',
        minWidth: 200,
        flex: 1,
        renderCell: function render({ row }) {
          return (
            <CustomTooltip title={row.email}>
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.email}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        field: 'location',
        headerName: 'Location',
        minWidth: 150,
        renderCell: function render({ row }) {
          return (
            <CustomTooltip title={row.location}>
              <Typography
                sx={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {row.location}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        field: 'totalOrders',
        headerName: 'Orders',
        width: 80,
        type: 'number',
        align: 'center',
        headerAlign: 'center',
      },
      {
        field: 'totalSpent',
        headerName: 'Total Spent',
        width: 120,
        renderCell: function render({ row }) {
          return <Typography>${row.totalSpent}</Typography>;
        },
      },
      {
        field: 'createdAt',
        width: 180,
        headerName: 'Joined',
        display: 'flex',
        renderCell: function render({ row }) {
          return <DateField value={row.createdAt} format="LL" />;
        },
      },
      {
        field: 'isActive',
        headerName: 'Status',
        width: 100,
        display: 'flex',
        type: 'boolean',
        renderCell: function render({ row }) {
          return <CustomerStatus value={row.isActive} />;
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
                return go({
                  to: `${showUrl('customers', row.id)}`,
                  query: {
                    to: pathname,
                  },
                  options: {
                    keepQuery: true,
                  },
                  type: 'replace',
                });
              }}
            >
              <VisibilityOutlined />
            </IconButton>
          );
        },
      },
    ],
    [t, go, pathname, showUrl],
  );

  const { isLoading, triggerExport } = useExport<ICustomer>({
    sorters,
    filters,
    pageSize: 50,
    maxItemCount: 50,
    mapData: (item) => {
      return {
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        phoneNumber: item.phoneNumber || '',
        location: item.location,
        totalOrders: item.totalOrders,
        totalSpent: item.totalSpent,
        isActive: item.isActive,
        createdAt: item.createdAt,
      };
    },
  });

  return (
    <>
      <RefineListView
        breadcrumb={false}
        headerButtons={
          <ExportButton
            variant="outlined"
            onClick={() => void triggerExport()}
            loading={isLoading}
            size="medium"
            sx={{ height: '40px' }}
          />
        }
      >
        <DataGrid
          {...dataGridProps}
          columns={columns}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </RefineListView>
      {children}
    </>
  );
};
