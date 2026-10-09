import React from 'react';
import { Chip, ChipProps } from '@mui/material';

type SupportTicketStatusValue = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface SupportTicketStatusProps {
  value: SupportTicketStatusValue;
}

export const SupportTicketStatus: React.FC<SupportTicketStatusProps> = ({
  value,
}) => {
  const getChipProps = (): ChipProps => {
    const baseProps = {
      variant: 'outlined' as const,
      size: 'small' as const,
    };

    switch (value) {
      case 'OPEN':
        return {
          ...baseProps,
          label: 'Open',
          color: 'info',
        };
      case 'IN_PROGRESS':
        return {
          ...baseProps,
          label: 'In Progress',
          color: 'warning',
        };
      case 'RESOLVED':
        return {
          ...baseProps,
          label: 'Resolved',
          color: 'success',
        };
      case 'CLOSED':
        return {
          ...baseProps,
          label: 'Closed',
          color: 'default',
        };
      default:
        return {
          ...baseProps,
          label: value,
        };
    }
  };

  return <Chip {...getChipProps()} />;
};

export const SupportEmailStatus: React.FC<{ value?: string }> = () => {
  return <Chip variant="outlined" size="small" label="Received" color="info" />;
};
