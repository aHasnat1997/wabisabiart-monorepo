import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Popover,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import WebIcon from '@mui/icons-material/Web';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { useNotification } from '@refinedev/core';
import { RefineListView } from '../../components/index.js';
import { CmsApi, type TBanner, type TBrandSettings } from '../../api/cms.js';
import { resolveMediaUrl } from '../../utils/media-url.js';
import { useBrand } from '../../contexts/index.js';

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

// ── Image Upload Helper ───────────────────────────────────────────────────────

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/media/upload`, {
    method: 'POST',
    body: formData,
  });
  const json = (await res.json()) as { data: { key: string; url: string } };
  return json.data.url;
}

// ── Image Upload Field ────────────────────────────────────────────────────────

function ImageUploadField({
  label,
  value,
  onUploaded,
}: {
  label: string;
  value: string;
  onUploaded: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    setPreview(null);
  }, [value]);

  const handleFile = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = preview || resolveMediaUrl(value) || null;

  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {displaySrc ? (
            <Box
              component="img"
              src={displaySrc}
              alt={label}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageIcon sx={{ color: 'text.disabled' }} />
          )}
        </Box>
        <Button
          variant="outlined"
          size="small"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          startIcon={
            uploading ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Stack>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </Stack>
  );
}

// ── Color Swatch Button (opens picker popover) ────────────────────────────────

function ColorSwatch({
  color,
  onChange,
}: {
  color: string;
  onChange: (c: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          cursor: 'pointer',
          border: '2px solid',
          borderColor: 'divider',
          background: color || '#ffffff',
          flexShrink: 0,
        }}
      />
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2 }}>
          <HexColorPicker color={color} onChange={onChange} />
          <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              #
            </Typography>
            <HexColorInput
              color={color}
              onChange={onChange}
              prefixed={false}
              style={{
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '4px 8px',
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            />
          </Box>
        </Box>
      </Popover>
    </>
  );
}

// ── Background Picker ─────────────────────────────────────────────────────────

type GradientDir =
  | 'to right'
  | 'to left'
  | 'to bottom'
  | 'to top'
  | 'to bottom right'
  | 'to bottom left';

const GRADIENT_DIRS: { label: string; value: GradientDir }[] = [
  { label: '→', value: 'to right' },
  { label: '←', value: 'to left' },
  { label: '↓', value: 'to bottom' },
  { label: '↑', value: 'to top' },
  { label: '↘', value: 'to bottom right' },
  { label: '↙', value: 'to bottom left' },
];

function BackgroundPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (css: string) => void;
}) {
  const isGradient = value.startsWith('linear-gradient');
  const [mode, setMode] = useState<'solid' | 'gradient'>(
    isGradient ? 'gradient' : 'solid',
  );

  // solid state
  const [solidColor, setSolidColor] = useState(() => {
    if (!isGradient && value.startsWith('#')) return value;
    return '#6366f1';
  });

  // gradient state
  const [color1, setColor1] = useState('#6366f1');
  const [color2, setColor2] = useState('#ec4899');
  const [dir, setDir] = useState<GradientDir>('to right');

  // parse existing gradient value on mount
  useEffect(() => {
    if (isGradient) {
      const match = value.match(
        /linear-gradient\(([^,]+),\s*(#[0-9a-fA-F]+)[^,]*,\s*(#[0-9a-fA-F]+)/,
      );
      if (match) {
        const parsedDir = match[1].trim() as GradientDir;
        if (GRADIENT_DIRS.some((d) => d.value === parsedDir)) setDir(parsedDir);
        setColor1(match[2]);
        setColor2(match[3]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildSolid = (c: string) => c;
  const buildGradient = (c1: string, c2: string, d: GradientDir) =>
    `linear-gradient(${d}, ${c1}, ${c2})`;

  const handleSolidChange = (c: string) => {
    setSolidColor(c);
    onChange(buildSolid(c));
  };

  const handleGradientChange = (c1: string, c2: string, d: GradientDir) => {
    setColor1(c1);
    setColor2(c2);
    setDir(d);
    onChange(buildGradient(c1, c2, d));
  };

  const handleModeChange = (_: unknown, val: 'solid' | 'gradient' | null) => {
    if (!val) return;
    setMode(val);
    if (val === 'solid') onChange(buildSolid(solidColor));
    else onChange(buildGradient(color1, color2, dir));
  };

  const cssValue =
    mode === 'solid'
      ? buildSolid(solidColor)
      : buildGradient(color1, color2, dir);

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Background
      </Typography>

      <ToggleButtonGroup
        value={mode}
        exclusive
        onChange={handleModeChange}
        size="small"
      >
        <ToggleButton value="solid">Solid</ToggleButton>
        <ToggleButton value="gradient">Gradient</ToggleButton>
      </ToggleButtonGroup>

      {mode === 'solid' && (
        <Stack direction="row" spacing={2} alignItems="center">
          <ColorSwatch color={solidColor} onChange={handleSolidChange} />
          <Typography
            variant="body2"
            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
          >
            {solidColor}
          </Typography>
        </Stack>
      )}

      {mode === 'gradient' && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ColorSwatch
              color={color1}
              onChange={(c) => handleGradientChange(c, color2, dir)}
            />
            <Typography variant="body2" color="text.secondary">
              →
            </Typography>
            <ColorSwatch
              color={color2}
              onChange={(c) => handleGradientChange(color1, c, dir)}
            />
            <Tooltip title="Swap colors">
              <IconButton
                size="small"
                onClick={() => handleGradientChange(color2, color1, dir)}
              >
                <SwapHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {GRADIENT_DIRS.map((d) => (
              <Button
                key={d.value}
                size="small"
                variant={dir === d.value ? 'contained' : 'outlined'}
                onClick={() => handleGradientChange(color1, color2, d.value)}
                sx={{ minWidth: 36, px: 1 }}
              >
                {d.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      )}

      {/* Preview + CSS output */}
      <Box
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ height: 56, background: cssValue }} />
        <Divider />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 1.5, py: 0.75, bgcolor: 'action.hover' }}
        >
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              wordBreak: 'break-all',
            }}
          >
            {cssValue}
          </Typography>
          <Tooltip title="Copy CSS">
            <IconButton
              size="small"
              onClick={() => void navigator.clipboard.writeText(cssValue)}
            >
              <ContentCopyIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Manual override */}
      <TextField
        label="Or paste any CSS value"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
        fullWidth
        placeholder="e.g. radial-gradient(...) or #ff6b6b"
        helperText="Overrides the picker above"
      />
    </Stack>
  );
}

// ── Tab: Logo & Favicon ───────────────────────────────────────────────────────

function BrandTab() {
  const { open } = useNotification();
  const { reload } = useBrand();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Omit<TBrandSettings, 'id'>>({
    name: '',
    logoUrl: null,
    faviconUrl: null,
  });

  useEffect(() => {
    void CmsApi.getBrandSettings()
      .then((res) => {
        if (res.data.data) {
          const { name, logoUrl, faviconUrl } = res.data.data;
          setForm({ name, logoUrl, faviconUrl });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await CmsApi.upsertBrandSettings(form);
      reload();
      open?.({ type: 'success', message: 'Brand settings saved' });
    } catch {
      open?.({ type: 'error', message: 'Failed to save brand settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 480 }}>
      <TextField
        label="Platform Name"
        value={form.name}
        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        fullWidth
      />
      <ImageUploadField
        label="Logo"
        value={form.logoUrl ?? ''}
        onUploaded={(url) => setForm((p) => ({ ...p, logoUrl: url }))}
      />
      <ImageUploadField
        label="Favicon"
        value={form.faviconUrl ?? ''}
        onUploaded={(url) => setForm((p) => ({ ...p, faviconUrl: url }))}
      />
      <Box>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Stack>
  );
}

// ── Tab: Hero Banner ──────────────────────────────────────────────────────────

function BannerTab() {
  const { open } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<
    Omit<TBanner, 'id' | 'isActive' | 'sortOrder'>
  >({
    title: '',
    subtitle: null,
    imageUrl: '',
    background: '#6366f1',
  });

  useEffect(() => {
    void CmsApi.getBanner()
      .then((res) => {
        if (res.data.data) {
          const { title, subtitle, imageUrl, background } = res.data.data;
          setForm({ title, subtitle, imageUrl, background });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await CmsApi.upsertBanner(form);
      open?.({ type: 'success', message: 'Banner saved' });
    } catch {
      open?.({ type: 'error', message: 'Failed to save banner' });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <ImageUploadField
        label="Banner Image"
        value={form.imageUrl}
        onUploaded={(url) => setForm((p) => ({ ...p, imageUrl: url }))}
      />
      <TextField
        label="Title"
        value={form.title}
        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        fullWidth
      />
      <TextField
        label="Subtitle"
        value={form.subtitle ?? ''}
        onChange={(e) =>
          setForm((p) => ({ ...p, subtitle: e.target.value || null }))
        }
        fullWidth
      />
      <BackgroundPicker
        value={form.background}
        onChange={(css) => setForm((p) => ({ ...p, background: css }))}
      />
      <Box>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Stack>
  );
}

// ── Tab: Footer ───────────────────────────────────────────────────────────────

function FooterTab() {
  const { open } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    void CmsApi.getFooterSettings()
      .then((res) => {
        if (res.data.data) setText(res.data.data.text);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await CmsApi.upsertFooterSettings({ text });
      open?.({ type: 'success', message: 'Footer saved' });
    } catch {
      open?.({ type: 'error', message: 'Failed to save footer' });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Stack spacing={3} sx={{ maxWidth: 560 }}>
      <TextField
        label="Footer Text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        fullWidth
        multiline
        minRows={3}
        placeholder="© 2025 YourPlatform. All rights reserved."
      />
      <Box>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
    </Stack>
  );
}

// ── Main CMS Page ─────────────────────────────────────────────────────────────

const CMS_TABS = [
  { label: 'Logo & Favicon', icon: <ImageIcon /> },
  { label: 'Hero Banner', icon: <ViewCarouselIcon /> },
  { label: 'Footer', icon: <WebIcon /> },
];

export const CmsPage = () => {
  const [tab, setTab] = useState(0);

  return (
    <RefineListView
      title="Content Management"
      wrapperProps={{ sx: { flexDirection: 'column' } }}
    >
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_e, v: number) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {CMS_TABS.map((t) => (
              <Tab
                key={t.label}
                icon={t.icon}
                iconPosition="start"
                label={t.label}
              />
            ))}
          </Tabs>
        </Box>
        {tab === 0 && <BrandTab />}
        {tab === 1 && <BannerTab />}
        {tab === 2 && <FooterTab />}
      </Paper>
    </RefineListView>
  );
};
