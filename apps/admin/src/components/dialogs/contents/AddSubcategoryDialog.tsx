import { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { categoryApi } from '../../../api/category';
import { useLocation } from 'react-router';

interface Props {
  onClose: () => void;
}

export const AddSubcategoryDialog = ({ onClose }: Props) => {
  const pathname = useLocation().pathname;

  if (!pathname.split('/').pop()) {
    return null;
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: pathname.split('/').pop() || '',
  });

  const handleSubmit = async () => {
    await categoryApi.createSubCategory(formData);
    onClose();
    window.location.reload(); // Or use a better state management
  };

  return (
    <>
      <DialogTitle>Add Subcategory</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          margin="normal"
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => void handleSubmit()} variant="contained">
          Add
        </Button>
      </DialogActions>
    </>
  );
};
