import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { categoryApi } from '../../../api/category';
import { useSearchParams } from 'react-router';

interface Props {
  onClose: () => void;
}

export const DeleteConfirmForSubCategory = ({ onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const subCategoryId = searchParams.get('subCategoryId');

  const handleDeleteSub = async () => {
    if (subCategoryId) {
      await categoryApi.deleteSubCategory(subCategoryId);
      onClose();
      window.location.reload();
    }
  };

  return (
    <>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete this item? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => void handleDeleteSub()} variant="contained">
          Delete
        </Button>
      </DialogActions>
    </>
  );
};
