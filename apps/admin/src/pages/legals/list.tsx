import { useEffect, useState, type ReactElement } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import CookieIcon from '@mui/icons-material/Cookie';
import GavelIcon from '@mui/icons-material/Gavel';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { useNotification } from '@refinedev/core';
import { RefineListView } from '../../components/index.js';
import {
  LegalsApi,
  type TLegalPage,
  type TLegalPageType,
} from '../../api/legals.js';

type TLegalTab = {
  type: TLegalPageType;
  label: string;
  icon: ReactElement;
};

const LEGAL_TABS: TLegalTab[] = [
  { type: 'TERMS_OF_USE', label: 'Terms of Use', icon: <GavelIcon /> },
  { type: 'PRIVACY_POLICY', label: 'Privacy Policy', icon: <PrivacyTipIcon /> },
  { type: 'COOKIE_POLICY', label: 'Cookie Policy', icon: <CookieIcon /> },
];

export const LegalsList = () => {
  const { open } = useNotification();
  const [currentTab, setCurrentTab] = useState(0);
  const [pages, setPages] = useState<Record<TLegalPageType, TLegalPage | null>>(
    {
      TERMS_OF_USE: null,
      PRIVACY_POLICY: null,
      COOKIE_POLICY: null,
    },
  );
  const [drafts, setDrafts] = useState<Record<TLegalPageType, string>>({
    TERMS_OF_USE: '',
    PRIVACY_POLICY: '',
    COOKIE_POLICY: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successType, setSuccessType] = useState<TLegalPageType | null>(null);

  const activeLegalTab = LEGAL_TABS[currentTab];
  const activeType = activeLegalTab?.type;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await LegalsApi.getAll();
        const fetched = res.data.data;

        setPages((prev) => {
          const updated = { ...prev };
          fetched.forEach((page) => {
            updated[page.type] = page;
          });
          return updated;
        });

        setDrafts((prev) => {
          const updated = { ...prev };
          fetched.forEach((page) => {
            updated[page.type] = page.content;
          });
          return updated;
        });
      } catch {
        open?.({
          type: 'error',
          message: 'Failed to load legal pages',
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open]);

  const handleSaveLegalPage = async () => {
    if (!activeType) return;

    setSaving(true);
    try {
      const res = await LegalsApi.upsert({
        type: activeType,
        content: drafts[activeType],
      });
      setPages((prev) => ({ ...prev, [activeType]: res.data.data }));
      setSuccessType(activeType);
      setTimeout(() => setSuccessType(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RefineListView
      title="Legal Pages"
      wrapperProps={{ sx: { flexDirection: 'column' } }}
      headerButtons={
        <Button
          variant="contained"
          onClick={() => void handleSaveLegalPage()}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      }
    >
      <Paper sx={{ p: 2, borderRadius: 1 }}>
        {successType === activeType && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {activeLegalTab?.label} saved successfully.
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={currentTab}
            onChange={(_event, value: number) => setCurrentTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {LEGAL_TABS.map((tab) => (
              <Tab
                key={tab.type}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box data-color-mode="light">
            <MDEditor
              value={drafts[activeType]}
              onChange={(value) =>
                setDrafts((prev) => ({ ...prev, [activeType]: value ?? '' }))
              }
              height={500}
              preview="live"
            />
          </Box>
        )}
      </Paper>
    </RefineListView>
  );
};
