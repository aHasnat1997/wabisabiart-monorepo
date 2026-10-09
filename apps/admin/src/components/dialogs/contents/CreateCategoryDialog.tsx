import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { categoryApi } from '../../../api/category';

interface Props {
  onClose: () => void;
}

export default function CreateCategoryDialog({ onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'crafts',
    description: '',
  });

  const loadCategories = async () => {
    await categoryApi.getAll();
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleCreate = async () => {
    await categoryApi.create(formData);
    setFormData({ name: '', type: 'crafts', description: '' });
    void loadCategories();
    onClose();
    window.location.reload();
  };

  return (
    <>
      <DialogTitle>Create Category</DialogTitle>
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
          select
          label="Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          margin="normal"
        >
          <MenuItem value="crafts">Crafts</MenuItem>
          <MenuItem value="customization">Customization</MenuItem>
          <MenuItem value="commissions">Commissions</MenuItem>
        </TextField>
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
        <Button onClick={() => void handleCreate()} variant="contained">
          Create
        </Button>
      </DialogActions>
    </>
  );
}
