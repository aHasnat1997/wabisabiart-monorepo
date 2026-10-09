import { useSearchParams } from 'react-router';
import { Dialog } from '@mui/material';
import { useCallback } from 'react';

interface DialogConfig {
  [key: string]: React.ComponentType<{ onClose: () => void }>;
}

interface DialogManagerProps {
  dialogs: DialogConfig;
}

export const DialogManager = ({ dialogs }: DialogManagerProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dialogName = searchParams.get('dialog');

  const handleClose = useCallback(() => {
    searchParams.delete('dialog');
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams]);

  const DialogContent = dialogName ? dialogs[dialogName] : null;

  return (
    <Dialog
      open={!!DialogContent}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      {DialogContent && <DialogContent onClose={handleClose} />}
    </Dialog>
  );
};
