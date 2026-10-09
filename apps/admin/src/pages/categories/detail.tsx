import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  Switch,
} from '@mui/material';
import { ArrowBack, Add, Delete } from '@mui/icons-material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import {
  categoryApi,
  type Category,
  type SubCategory,
} from '../../api/category';
import { resolveMediaUrl } from '../../utils/index.js';

export const CategoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);

  const loadCategory = async () => {
    if (id) {
      const res = await categoryApi.getOne(id);
      setCategory(res.data.data);
    }
  };

  useEffect(() => {
    void loadCategory();
  }, [id]);

  const columns: GridColDef<SubCategory>[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <img
          alt={row.name}
          src={resolveMediaUrl(row.imageUrl)}
          style={{ width: 80, height: 60, objectFit: 'cover', marginTop: 8 }}
        />
      ),
    },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 300,
      renderCell: ({ row }) => (
        <Tooltip title={row.description || ''}>
          <span>
            {row.description
              ? row.description.length > 50
                ? row.description.slice(0, 50) + '...'
                : row.description
              : '-'}
          </span>
        </Tooltip>
      ),
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
        <IconButton
          onClick={() =>
            void navigate(
              `?dialog=delete-confirm-subcategory&subCategoryId=${row.id}`,
            )
          }
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => void navigate('/categories')}
      >
        Back
      </Button>

      <Box mt={3} mb={3}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Typography variant="h4">{category?.name}</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>Make this Category as Featured</Typography>
              <Switch
                checked={category?.isFeatured}
                onChange={() => {
                  void categoryApi
                    .toggleFeatured(category!.id)
                    .then(loadCategory);
                }}
              />
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>Good for Gift</Typography>
              <Switch
                checked={category?.isGoodForGift}
                onChange={() => {
                  void categoryApi
                    .toggleGoodForGift(category!.id)
                    .then(loadCategory);
                }}
              />
            </Box>
          </Box>
        </Box>
        <Chip label={category?.type} sx={{ mt: 1 }} />
        {category?.description && (
          <Typography mt={2}>{category.description}</Typography>
        )}
      </Box>

      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Subcategories</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => void navigate('?dialog=add-subcategory')}
        >
          Add Subcategory
        </Button>
      </Box>

      <DataGrid
        rows={category?.subCategories || []}
        columns={columns}
        pageSizeOptions={[10, 20, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        rowHeight={80}
      />
    </Box>
  );
};
