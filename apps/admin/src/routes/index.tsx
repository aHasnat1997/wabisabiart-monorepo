import { Box } from '@mui/material';
import { Authenticated } from '@refinedev/core';
import { ErrorComponent, ThemedLayout } from '@refinedev/mui';
import { CatchAllNavigate } from '@refinedev/react-router';
import { Navigate, Outlet, Route, Routes } from 'react-router';
// import { Dashboard } from '../pages/dashboard';
import { CategoryDetail, CategoryList } from '../pages/categories';
import { Header, Title } from '../components/index.js';
import { AuthPage } from '../pages/auth';
import { ProductList } from '../pages/products';
import { CustomSider } from '../components/layout/sider.js';
import ProductDetail from '../pages/products/detail';
import { OrderList, OrderDetail } from '../pages/orders';
import { ShopList, ShopDetail } from '../pages/shops';
import { JournalList } from '../pages/journals/list.js';
import { JournalDetail } from '../pages/journals/detail.js';
import { SellerInsights } from '../pages/seller-insights/index.js';
import { AdminInsights } from '../pages/admin-insights/index.js';
import { CustomerList, CustomerShow } from '../pages/customers';
import { AuthenticityList, AuthenticityDetail } from '../pages/authenticity';
import { BillingFeesList } from '../pages/billing-fees';
import { SupportList } from '../pages/support';
import { LegalsList } from '../pages/legals/index.js';
import { FaqList } from '../pages/faq/index.js';
import { ChatPage } from '../pages/chat/index.js';
import { ReportList } from '../pages/reports/index.js';
import { SettingsList } from '../pages/settings/index.js';
import { CmsPage } from '../pages/cms/index.js';
import { NotificationsPage } from '../pages/notifications/index.js';

export const RootRoute = () => (
  <Routes>
    <Route
      element={
        <Authenticated
          key="authenticated-routes"
          fallback={<CatchAllNavigate to="/login" />}
        >
          <ThemedLayout Header={Header} Title={Title} Sider={CustomSider}>
            <Box>
              <Outlet />
            </Box>
          </ThemedLayout>
        </Authenticated>
      }
    >
      <Route index element={<AdminInsights />} />
      <Route path="/categories">
        <Route index element={<CategoryList />} />
        <Route path=":id" element={<CategoryDetail />} />
      </Route>

      <Route path="/products">
        <Route index element={<ProductList />} />
        <Route path=":id" element={<ProductDetail />} />
      </Route>

      <Route path="/orders">
        <Route index element={<OrderList />} />
        <Route path=":id" element={<OrderDetail />} />
      </Route>

      <Route path="/shops">
        <Route index element={<ShopList />} />
        <Route path=":id" element={<ShopDetail />} />
      </Route>

      <Route path="/authenticity">
        <Route index element={<AuthenticityList />} />
        <Route path=":id" element={<AuthenticityDetail />} />
      </Route>

      <Route path="/journals">
        <Route index element={<JournalList />} />
        <Route path=":id" element={<JournalDetail />} />
      </Route>

      <Route path="/customers">
        <Route index element={<CustomerList />} />
        <Route path=":id" element={<CustomerShow />} />
      </Route>

      <Route path="/insights">
        <Route path="seller" element={<SellerInsights />} />
        {/* <Route path="admin" element={<AdminInsights />} /> */}
      </Route>

      <Route path="/billing-fees">
        <Route index element={<BillingFeesList />} />
      </Route>

      <Route path="/support" element={<SupportList />} />

      <Route path="/legals">
        <Route index element={<LegalsList />} />
        <Route path="faq" element={<FaqList />} />
      </Route>

      <Route path="/chat" element={<ChatPage />} />

      <Route path="/reports" element={<ReportList />} />

      <Route path="/cms" element={<CmsPage />} />

      <Route path="/settings">
        <Route index element={<Navigate to="backup-restore" replace />} />
        <Route path="backup-restore" element={<SettingsList />} />
      </Route>

      <Route path="/notifications" element={<NotificationsPage />} />
    </Route>

    <Route
      element={
        <Authenticated key="auth-pages" fallback={<Outlet />}>
          <CatchAllNavigate to="/" />
        </Authenticated>
      }
    >
      <Route path="/login" element={<AuthPage type="login" />} />
    </Route>

    <Route
      element={
        <Authenticated key="catch-all">
          <ThemedLayout Header={Header} Title={Title} Sider={CustomSider}>
            <Outlet />
          </ThemedLayout>
        </Authenticated>
      }
    >
      <Route path="*" element={<ErrorComponent />} />
    </Route>
  </Routes>
);
