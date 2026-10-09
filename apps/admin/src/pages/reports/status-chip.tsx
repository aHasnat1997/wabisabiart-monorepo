import React from 'react';
import { Chip, type ChipProps } from '@mui/material';
import type { TReportStatus } from '../../api/report.js';

export const ReportStatusChip: React.FC<{ value: TReportStatus }> = ({ value }) => {
  const props: ChipProps = { variant: 'outlined', size: 'small' };
  switch (value) {
    case 'pending':
      return <Chip {...props} label="Pending" color="warning" />;
    case 'approved':
      return <Chip {...props} label="Approved" color="success" />;
    case 'rejected':
      return <Chip {...props} label="Rejected" color="error" />;
    default:
      return <Chip {...props} label={value} />;
  }
};
