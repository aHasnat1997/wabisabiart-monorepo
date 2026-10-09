import { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useNotification } from '@refinedev/core';
import { RefineListView } from '../../components/index.js';
import { backupApi, type RestoreBackupResponse } from '../../api/backup.js';

export const SettingsList = () => {
  const { open } = useNotification();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] =
    useState<RestoreBackupResponse | null>(null);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { blob, filename } = await backupApi.download();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      open?.({
        type: 'success',
        message: 'Backup download started',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to download backup',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      open?.({
        type: 'error',
        message: 'Choose a backup ZIP file first',
      });
      return;
    }

    setRestoring(true);
    setRestoreResult(null);
    try {
      const result = await backupApi.restore(selectedFile);
      setRestoreResult(result);
      open?.({
        type: 'success',
        message: result.message || 'Backup restored successfully',
      });
    } catch {
      open?.({
        type: 'error',
        message: 'Failed to restore backup',
      });
    } finally {
      setRestoring(false);
    }
  };

  const restoredEntries = Object.entries(restoreResult?.restored || {});

  return (
    <RefineListView title="Settings">
      <Stack spacing={2.5}>
        <Alert severity="warning">
          Restoring a backup replaces existing backup-managed data. Use a ZIP
          created by the backup export.
        </Alert>

        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BackupOutlinedIcon color="primary" />
                <Typography variant="h6">Backup & Restore</Typography>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle1">Create Backup</Typography>
                <Typography variant="body2" color="text.secondary">
                  Download a ZIP archive with CSV exports for the configured
                  database tables.
                </Typography>
                <Stack direction="row">
                  <Button
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={() => void handleDownload()}
                    disabled={downloading || restoring}
                  >
                    {downloading ? 'Downloading...' : 'Download Backup'}
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <Typography variant="subtitle1">Restore Backup</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload a backup ZIP file and restore its contents.
                </Typography>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip,application/zip,application/x-zip-compressed"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                    setRestoreResult(null);
                  }}
                />

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileOutlinedIcon />}
                    onClick={() => inputRef.current?.click()}
                    disabled={restoring}
                  >
                    Choose ZIP
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFile?.name || 'No file selected'}
                  </Typography>
                </Stack>

                <Stack direction="row">
                  <Button
                    color="warning"
                    variant="contained"
                    startIcon={<RestoreOutlinedIcon />}
                    onClick={() => void handleRestore()}
                    disabled={!selectedFile || restoring || downloading}
                  >
                    {restoring ? 'Restoring...' : 'Restore Backup'}
                  </Button>
                </Stack>
              </Stack>

              {restoreResult && (
                <Alert severity="success">
                  <Stack spacing={0.75}>
                    <Typography variant="body2">
                      {restoreResult.message}
                    </Typography>
                    {restoredEntries.length > 0 && (
                      <Typography variant="caption">
                        {restoredEntries
                          .map(([model, count]) => `${model}: ${count}`)
                          .join(', ')}
                      </Typography>
                    )}
                  </Stack>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </RefineListView>
  );
};
