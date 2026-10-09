import Box from '@mui/material/Box';
import { useBrand } from '../../contexts/index.js';
import { resolveMediaUrl } from '../../utils/media-url.js';

type TitleProps = {
  collapsed: boolean;
};

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  const { brand } = useBrand();

  const logoSrc = resolveMediaUrl(brand?.logoUrl) ?? '/logo.svg';
  const platformName = brand?.name ?? 'WabiSaviArt';

  return (
    <Box display="flex" alignItems="center" gap="12px" sx={{ color: 'text.primary' }}>
      {collapsed ? (
        <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 24, height: 24 }} />
      ) : (
        <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Box component="img" src={logoSrc} alt="Logo" sx={{ width: 24, height: 24 }} />
          <Box sx={{ fontWeight: 'bold', fontSize: '20px' }}>{platformName}</Box>
        </Box>
      )}
    </Box>
  );
};
