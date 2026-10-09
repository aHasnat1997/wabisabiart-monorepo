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

export const DeleteConfirmForCategory = ({ onClose }: Props) => {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('categoryId');

  const handleDelete = async () => {
    if (categoryId) {
      await categoryApi.delete(categoryId);
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
        <Button onClick={() => void handleDelete()} variant="contained">
          Delete
        </Button>
      </DialogActions>
    </>
  );
};
