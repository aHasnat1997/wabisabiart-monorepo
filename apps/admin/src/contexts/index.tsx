import React, {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ThemeProvider } from '@mui/material/styles';
import {
  DarkThemeWithResponsiveFontSizes as DarkTheme,
  LightThemeWithResponsiveFontSizes as LightTheme,
} from '../theme.js';
import { resolveMediaUrl } from '../utils/media-url.js';

type ColorModeContextType = {
  mode: string;
  setMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextType>(
  {} as ColorModeContextType,
);

export const ColorModeContextProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const colorModeFromLocalStorage = localStorage.getItem('colorMode');
  const isSystemPreferenceDark = window?.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;

  const systemPreference = isSystemPreferenceDark ? 'dark' : 'light';
  const [mode, setMode] = useState(
    colorModeFromLocalStorage || systemPreference,
  );

  useEffect(() => {
    window.localStorage.setItem('colorMode', mode);
  }, [mode]);

  const setColorMode = () => {
    if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  return (
    <ColorModeContext.Provider
      value={{
        setMode: setColorMode,
        mode,
      }}
    >
      <ThemeProvider theme={mode === 'light' ? LightTheme : DarkTheme}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorModeContext = () => {
  const context = useContext(ColorModeContext);

  if (context === undefined) {
    throw new Error('useColorModeContext must be used within a ConfigProvider');
  }

  return context;
};

// ── Brand Context ─────────────────────────────────────────────────────────────

type TBrandSettings = {
  name: string;
  logoUrl: string | null;
  faviconUrl: string | null;
};

type BrandContextType = {
  brand: TBrandSettings | null;
  reload: () => void;
};

export const BrandContext = createContext<BrandContextType>({} as BrandContextType);

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export const BrandContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [brand, setBrand] = useState<TBrandSettings | null>(null);

  const fetchBrand = () => {
    fetch(`${API_URL}/cms/brand`, { credentials: 'include' })
      .then((r) => r.json() as Promise<{ data: TBrandSettings | null }>)
      .then(({ data }) => {
        if (!data) return;
        setBrand(data);

        if (data.name) document.title = data.name;

        if (data.faviconUrl) {
          const faviconHref = resolveMediaUrl(data.faviconUrl) ?? data.faviconUrl;
          let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = faviconHref;
        }
      })
      .catch(() => {});
  };

  useEffect(() => { fetchBrand(); }, []);

  return (
    <BrandContext.Provider value={{ brand, reload: fetchBrand }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);
