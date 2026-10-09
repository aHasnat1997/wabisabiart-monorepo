import { useState, useEffect } from 'react';
import { Button, IconButton } from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { RefineListView } from '../../components/refine-list-view';
import { categoryApi, type Category } from '../../api/category';

export const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    const res = await categoryApi.getAll();
    setCategories(res.data.data);
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const columns: GridColDef<Category>[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'totalSubCategories',
      headerName: 'Total Sub-Categories',
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    // {
    //   field: 'isGoodForGift',
    //   headerName: 'Good for Gift',
    //   width: 160,
    //   align: 'center',
    //   headerAlign: 'center',
    //   sortable: false,
    //   filterable: false,
    //   renderCell: ({ row }) => (
    //     <Switch
    //       checked={row.isGoodForGift}
    //       onChange={() => {
    //         void categoryApi.toggleGoodForGift(row.id).then(loadCategories);
    //       }}
    //     />
    //   ),
    // },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <>
          <IconButton onClick={() => void navigate(`/categories/${row.id}`)}>
            <Visibility />
          </IconButton>
          <IconButton
            onClick={() =>
              void navigate(
                `?dialog=delete-confirm-category&categoryId=${row.id}`,
              )
            }
          >
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <RefineListView
      headerButtons={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => void navigate('?dialog=create-category')}
        >
          Create Category
        </Button>
      }
    >
      <DataGrid
        rows={categories}
        columns={columns}
        pageSizeOptions={[10, 20, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
      />
    </RefineListView>
  );
};
