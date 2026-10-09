import {
  Box,
  Card,
  CardContent,
  Chip,
  DialogContent,
  DialogTitle,
  Divider,
  Grid2 as Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useSearchParams } from 'react-router';
import { Variant } from '../../../api/product';
import { resolveMediaUrl } from '../../../utils/index.js';

export default function ProductVariantDetailDialog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const variantData = searchParams.get('variant');

  if (!variantData) return null;

  const variant = JSON.parse(atob(variantData)) as Variant;

  const handleClose = () => {
    searchParams.delete('variant');
    searchParams.delete('dialog');
    setSearchParams(searchParams);
  };

  return (
    <>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Variant Details</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          <Box
            component="img"
            src={resolveMediaUrl(variant.mediaUrl)}
            alt={variant.name}
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 2,
            }}
          />
          <Box>
            <Typography variant="h5" gutterBottom>
              {variant.name}
            </Typography>
            <Stack direction="row" spacing={1} mb={2}>
              {variant.isActive && (
                <Chip label="Active" color="success" size="small" />
              )}
              {variant.isLowStock && (
                <Chip label="Low Stock" color="warning" size="small" />
              )}
            </Stack>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Inventory
            </Typography>
            <Typography variant="h6">Quantity: {variant.quantity}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Options & Specifications
            </Typography>
            <Grid container spacing={2} mt={0.5}>
              {variant.options?.map((opt, idx) => (
                <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                  <Card variant="outlined">
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {opt.name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        mt={0.5}
                      >
                        {opt.type === 'color_picker' ? (
                          <>
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: opt.value,
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            />
                            <Typography variant="body2">{opt.value}</Typography>
                          </>
                        ) : (
                          <Typography variant="body2" fontWeight="medium">
                            {opt.value}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>
    </>
  );
}
