import { Box, Button, ButtonGroup } from '@mui/material';
import type { DateRange } from '../../api/insights.js';

interface DateRangeSelectorProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  loading?: boolean;
}

export const DateRangeSelector = ({
  range,
  onRangeChange,
  loading,
}: DateRangeSelectorProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <ButtonGroup variant="outlined" size="small" disabled={loading}>
        <Button
          onClick={() => onRangeChange('7')}
          variant={range === '7' ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: range === '7' ? '#2196F3' : 'transparent',
            color: range === '7' ? 'white' : 'inherit',
          }}
        >
          7 Days
        </Button>
        <Button
          onClick={() => onRangeChange('30')}
          variant={range === '30' ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: range === '30' ? '#2196F3' : 'transparent',
            color: range === '30' ? 'white' : 'inherit',
          }}
        >
          30 Days
        </Button>
        <Button
          onClick={() => onRangeChange('90')}
          variant={range === '90' ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: range === '90' ? '#2196F3' : 'transparent',
            color: range === '90' ? 'white' : 'inherit',
          }}
        >
          90 Days
        </Button>
        <Button
          onClick={() => onRangeChange('365')}
          variant={range === '365' ? 'contained' : 'outlined'}
          sx={{
            backgroundColor: range === '365' ? '#2196F3' : 'transparent',
            color: range === '365' ? 'white' : 'inherit',
          }}
        >
          1 Year
        </Button>
      </ButtonGroup>
    </Box>
  );
};
