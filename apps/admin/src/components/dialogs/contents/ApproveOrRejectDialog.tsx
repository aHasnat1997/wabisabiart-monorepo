import { Button, DialogActions, DialogContent } from '@mui/material';

interface Props {
  onClose: () => void;
}

export default function ApproveOrRejectDialog({ onClose }: Props) {
  return (
    <>
      {/* <DialogTitle>Approve or Reject Product</DialogTitle> */}
      <DialogContent>
        <p>Are you sure you want to approve or reject this product?</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Reject
        </Button>
        <Button onClick={onClose} variant="contained">
          Approve
        </Button>
      </DialogActions>
    </>
  );
}
