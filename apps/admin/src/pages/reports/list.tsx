import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Paper,
  Button,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import BlockIcon from '@mui/icons-material/Block';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { DateField } from '@refinedev/mui';
import { RefineListView, CustomTooltip } from '../../components/index.js';
import { ReportsApi, type TReport } from '../../api/report.js';
import { ReportStatusChip } from './status-chip.js';
import { ReportDetailModal } from './report-detail-modal.js';

export const ReportList = () => {
  const [reports, setReports] = useState<TReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TReport | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      const res = await ReportsApi.list();
      setReports(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { void loadReports(); }, []);

  const tabStatuses = ['pending', 'approved', 'rejected'] as const;
  const filtered = useMemo(
    () => reports.filter((r) => r.status === tabStatuses[currentTab]),
    [reports, currentTab],
  );

  const handleForceInactive = async (productId: string) => {
    setActionLoading(productId);
    try {
      await ReportsApi.forceProductInactive(productId);
      void loadReports();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFreezeShop = async (shopId: string) => {
    setActionLoading(shopId);
    try {
      await ReportsApi.freezeShop(shopId);
      void loadReports();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const columns = useMemo<GridColDef<TReport>[]>(
    () => [
      {
        field: 'reporter',
        headerName: 'Reporter',
        minWidth: 200,
        valueGetter: (_, row) => row.reporter?.fullName ?? 'N/A',
      },
      {
        field: 'shopName',
        headerName: 'Shop',
        minWidth: 200,
        valueGetter: (_, row) =>
          row.reportedUser?.sellerProfile?.shopName ?? 'N/A',
      },
      {
        field: 'reason',
        headerName: 'Reason',
        width: 140,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', height: '100%' }}
          >
            {row.reason}
          </Typography>
        ),
      },
      {
        field: 'description',
        headerName: 'Description',
        minWidth: 280,
        renderCell: ({ row }) => (
          <CustomTooltip title={row.description ?? ''}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                height: '100%',
              }}
            >
              {row.description ?? '—'}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 110,
        display: 'flex',
        renderCell: ({ row }) => <ReportStatusChip value={row.status} />,
      },
      {
        field: 'createdAt',
        headerName: 'Reported',
        width: 160,
        display: 'flex',
        renderCell: ({ row }) => <DateField value={row.createdAt} format="LL" />,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 140,
        align: 'center',
        headerAlign: 'center',
        display: 'flex',
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              sx={{ color: 'text.secondary' }}
              onClick={() => { setSelectedReport(row); setModalOpen(true); }}
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="warning"
              disabled={actionLoading === row.productId}
              onClick={() => handleForceInactive(row.productId)}
              title="Force product inactive"
            >
              <BlockIcon fontSize="small" />
            </IconButton>
            {row.reportedUser?.sellerProfile?.id && (
              <IconButton
                size="small"
                color="error"
                disabled={actionLoading === row.reportedUser.sellerProfile.id}
                onClick={() => handleFreezeShop(row.reportedUser!.sellerProfile!.id)}
                title="Freeze shop"
              >
                <AcUnitIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ),
      },
    ],
    [actionLoading],
  );

  const counts = useMemo(
    () => ({
      pending: reports.filter((r) => r.status === 'pending').length,
      approved: reports.filter((r) => r.status === 'approved').length,
      rejected: reports.filter((r) => r.status === 'rejected').length,
    }),
    [reports],
  );

  return (
    <>
      <RefineListView title="Product Reports">
        <Paper sx={{ p: 2, borderRadius: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={currentTab} onChange={(_e, v) => setCurrentTab(v as number)}>
              <Tab label={`Pending (${counts.pending})`} />
              <Tab label={`Approved (${counts.approved})`} />
              <Tab label={`Rejected (${counts.rejected})`} />
            </Tabs>
          </Box>
          <DataGrid
            rows={filtered}
            columns={columns}
            pageSizeOptions={[10, 25, 50]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ '& .MuiDataGrid-root': { border: 'none' } }}
          />
        </Paper>
      </RefineListView>

      <ReportDetailModal
        open={modalOpen}
        report={selectedReport}
        onClose={() => { setModalOpen(false); setSelectedReport(null); }}
        onAction={loadReports}
      />
    </>
  );
};
