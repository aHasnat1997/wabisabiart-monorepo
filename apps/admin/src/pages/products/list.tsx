/* eslint-disable prettier/prettier */
import { type PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { RefineListView } from '../../components/index.js';
import { Product, productApi } from '../../api/product.js';

export const ProductList = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'all' | 'pending'>('all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allDraftProducts, setAllDraftProducts] = useState<Product[]>([]);
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(true);
  const [isLoadingDraftProducts, setIsLoadingDraftProducts] = useState(true);

  const loadProducts = async () => {
    setIsLoadingAllProducts(true);

    try {
      const res = await productApi.getAll();
      setAllProducts(res.data.data);
    } finally {
      setIsLoadingAllProducts(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleLoadPending = async () => {
    setIsLoadingDraftProducts(true);

    try {
      const res = await productApi.getAllDraft();
      setAllDraftProducts(res.data.data);
    } finally {
      setIsLoadingDraftProducts(false);
    }
  };

  useEffect(() => {
    void handleLoadPending();
  }, []);

  const isCurrentViewLoading =
    view === 'all' ? isLoadingAllProducts : isLoadingDraftProducts;

  const renderSkeletonRows = () => (
    <Box sx={{ width: '100%', pt: 2 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Box
          key={`product-row-skeleton-${index}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 150px 120px 120px 120px 100px',
            gap: 2,
            alignItems: 'center',
            py: 1.5,
            px: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={24} width={90} />
          <Skeleton variant="text" height={24} width={60} />
          <Skeleton variant="text" height={24} width={70} />
          <Skeleton variant="text" height={24} width={70} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      ))}
    </Box>
  );

  const columns: GridColDef<Product>[] = [
    { field: 'title', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'categoryType', headerName: 'Type', width: 150 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => `$${row.price}`,
    },
    {
      field: 'discount',
      headerName: 'Discount',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) =>
        row.discountType === 'percentage'
          ? `${row.discountValue}%`
          : row.discountType === 'fixed_amount'
          ? `$${row.discountValue}`
          : 'none',
    },
    {
      field: 'finalPrice',
      headerName: 'Final Price',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => `$${row.finalPrice}`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <IconButton onClick={() => void navigate(`/products/${row.id}`)}>
          <Visibility />
        </IconButton>
      ),
    },
  ];

  return (
    <>
      <RefineListView
        title={view === 'all' ? 'All Products' : 'Pending For Approval'}
        headerButtons={() => [
          <ToggleButtonGroup
            key="product-list-view-toggle"
            value={view}
            exclusive
            onChange={(_e, value: 'all' | 'pending' | null) => {
              if (value) setView(value);
            }}
            size="small"
          >
            <ToggleButton value="all">
              <ShoppingCartCheckoutIcon /> All Products
            </ToggleButton>
            <ToggleButton value="pending">
              <HourglassEmptyIcon /> Pending For Approval
            </ToggleButton>
          </ToggleButtonGroup>,
        ]}
      >
        {isCurrentViewLoading ? (
          renderSkeletonRows()
        ) : (
          <DataGrid
            rows={view === 'pending' ? allDraftProducts : allProducts}
            columns={columns}
            pageSizeOptions={[10, 20, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          />
        )}
      </RefineListView>
      {children}
    </>
  );
};
