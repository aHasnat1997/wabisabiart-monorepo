import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArticleIcon from '@mui/icons-material/Article';
import PeopleIcon from '@mui/icons-material/People';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import GavelIcon from '@mui/icons-material/Gavel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import FlagIcon from '@mui/icons-material/Flag';
import SettingsIcon from '@mui/icons-material/Settings';
import WebIcon from '@mui/icons-material/Web';
// import AnalyticsIcon from '@mui/icons-material/Analytics';
// import ChatIcon from '@mui/icons-material/Chat';

export const rootResources = [
  {
    name: 'dashboard',
    list: '/',
    meta: {
      icon: <DashboardIcon />,
    },
  },
  {
    name: 'categories',
    list: '/categories',
    show: '/categories/:id',
    edit: '/categories/:id/edit',
    create: '/categories/create',
    meta: {
      icon: <FormatListBulletedIcon />,
    },
  },
  {
    name: 'products',
    list: '/products',
    show: '/products/:id',
    edit: '/products/:id/edit',
    create: '/products/create',
    meta: {
      icon: <ShoppingCartIcon />,
    },
  },
  {
    name: 'orders',
    list: '/orders',
    show: '/orders/:id',
    meta: {
      label: 'Orders',
      icon: <AssignmentIcon />,
    },
  },
  {
    name: 'shops',
    list: '/shops',
    show: '/shops/:id',
    meta: {
      label: 'Shops',
      icon: <StorefrontIcon />,
    },
  },
  {
    name: 'authenticity',
    list: '/authenticity',
    show: '/authenticity/:id',
    meta: {
      label: 'Authenticity',
      icon: <VerifiedUserIcon />,
    },
  },
  {
    name: 'journals',
    list: '/journals',
    show: '/journals/:id',
    meta: {
      label: 'Journals',
      icon: <ArticleIcon />,
    },
  },
  {
    name: 'customers',
    list: '/customers',
    show: '/customers/:id',
    meta: {
      label: 'Customers',
      icon: <PeopleIcon />,
    },
  },
  {
    name: 'billing-fees',
    list: '/billing-fees',
    meta: {
      label: 'Billing & Fees',
      icon: <ReceiptLongIcon />,
    },
  },
  {
    name: 'support',
    list: '/support',
    meta: {
      label: 'Support',
      icon: <SupportAgentIcon />,
    },
  },
  {
    name: 'legals',
    list: '/legals',
    meta: {
      label: 'Legal Pages',
      icon: <GavelIcon />,
    },
  },
  {
    name: 'faqs',
    list: '/legals/faq',
    meta: {
      label: 'FAQs',
      icon: <HelpOutlineIcon />,
    },
  },
  {
    name: 'reports',
    list: '/reports',
    meta: {
      label: 'Product Reports',
      icon: <FlagIcon />,
    },
  },
  {
    name: 'cms',
    list: '/cms',
    meta: {
      label: 'CMS',
      icon: <WebIcon />,
    },
  },
  {
    name: 'settings',
    list: '/settings/backup-restore',
    meta: {
      label: 'Settings',
      icon: <SettingsIcon />,
    },
  },
  // {
  //   name: 'platform-insights',
  //   list: '/insights/admin',
  //   meta: {
  //     label: 'Platform Insights',
  //     icon: <AnalyticsIcon />,
  //   },
  // },
  // {
  //   name: 'chat',
  //   list: '/chat',
  //   meta: {
  //     label: 'Chat',
  //     icon: <ChatIcon />,
  //   },
  // },
];
