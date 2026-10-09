import { useMemo } from 'react';
import { useGo, useNavigation, useTranslate } from '@refinedev/core';
import { NumberField } from '@refinedev/mui';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useLocation } from 'react-router';
import IconButton from '@mui/material/IconButton';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Product } from '../../../api/product.js';

type Props = {
  product: Product[];
};

export const ProductListTable = ({ product }: Props) => {
  console.log('🚀 ~ index.tsx:16 ~ ProductListTable ~ props:', product);

  const go = useGo();
  const { pathname } = useLocation();
  const { editUrl } = useNavigation();
  const t = useTranslate();

  const columns = useMemo<GridColDef<Product>[]>(
    () => [
      {
        field: 'name',
        headerName: t('products.fields.name'),
        width: 200,
        sortable: false,
      },
      {
        field: 'category',
        headerName: t('products.fields.category'),
        minWidth: 200,
        sortable: false,
        renderCell: function render({ row }) {
          return <span>{row.category?.name ?? '-'}</span>;
        },
      },
      {
        field: 'subCategory',
        headerName: t('products.fields.subCategory'),
        minWidth: 200,
        sortable: false,
        filterable: false,
        renderCell: function render({ row }) {
          return <span>{row.subCategory?.name ?? '-'}</span>;
        },
      },
      {
        field: 'price',
        type: 'number',
        headerName: t('products.fields.price'),
        width: 200,
        sortable: false,
        align: 'right',
        headerAlign: 'right',
        display: 'flex',
        renderCell: function render({ row }) {
          return (
            <NumberField
              value={row.price}
              options={{
                currency: row.currency,
                style: 'currency',
              }}
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: t('table.actions'),
        width: 200,
        align: 'center',
        headerAlign: 'center',
        display: 'flex',
        renderCell: function render({ row }) {
          return (
            <IconButton
              sx={{
                color: 'text.secondary',
              }}
              onClick={() => {
                return go({
                  to: `${editUrl('products', row.id)}`,
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
              <EditOutlinedIcon />
            </IconButton>
          );
        },
      },
    ],
    [t, editUrl, go, pathname],
  );

  return (
    <DataGrid
      {...product}
      columns={columns}
      pageSizeOptions={[12, 24, 48, 96]}
    />
  );
};
