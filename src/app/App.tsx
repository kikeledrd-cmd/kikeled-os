import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLayout } from '../components/layout/AdminLayout';
import { ClientLayout } from '../components/layout/ClientLayout';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AppErrorBoundary } from '../components/shared/AppErrorBoundary';
import { useAppStore } from '../store/useAppStore';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { BillingPage } from '../pages/admin/BillingPage';
import { ClientBankPage } from '../pages/admin/ClientBankPage';
import { CustomerDetailPage } from '../pages/admin/CustomerDetailPage';
import { CustomersPage } from '../pages/admin/CustomersPage';
import { InventoryPage } from '../pages/admin/InventoryPage';
import { InvoiceDetailPage } from '../pages/admin/InvoiceDetailPage';
import { InvoicePrintPage } from '../pages/admin/InvoicePrintPage';
import { LeadsPage } from '../pages/admin/LeadsPage';
import { LeadDetailPage } from '../pages/admin/LeadDetailPage';
import { OrderDetailPage } from '../pages/admin/OrderDetailPage';
import { OrderPrintPage } from '../pages/admin/OrderPrintPage';
import { OrdersPage } from '../pages/admin/OrdersPage';
import { OsDashboardPage } from '../pages/admin/OsDashboardPage';
import { PremiumPassPage } from '../pages/admin/PremiumPassPage';
import { PricingEnginePage } from '../pages/admin/PricingEnginePage';
import { PricingRulesSettingsPage } from '../pages/admin/PricingRulesSettingsPage';
import { QuoteDetailPage } from '../pages/admin/QuoteDetailPage';
import { QuotePrintPage } from '../pages/admin/QuotePrintPage';
import { QuotesPage } from '../pages/admin/QuotesPage';
import { ReportsPage } from '../pages/admin/ReportsPage';
import { ServicesPage } from '../pages/admin/ServicesPage';
import { SettingsPage } from '../pages/admin/SettingsPage';
import { UsersManagementPage } from '../pages/admin/UsersManagementPage';
import { ClientHomePage } from '../pages/client/ClientHomePage';
import { ClientInvoicesPage } from '../pages/client/ClientInvoicesPage';
import { ClientOrdersPage } from '../pages/client/ClientOrdersPage';
import { ClientPremiumPage } from '../pages/client/ClientPremiumPage';
import { ClientProfilePage } from '../pages/client/ClientProfilePage';
import { ClientQuotesPage } from '../pages/client/ClientQuotesPage';
import { ClientRequestPage } from '../pages/client/ClientRequestPage';
import { AboutPage } from '../pages/public/AboutPage';
import { AccessPage } from '../pages/public/AccessPage';
import { ContactPage } from '../pages/public/ContactPage';
import { HomePage } from '../pages/public/HomePage';
import { ProjectsPage } from '../pages/public/ProjectsPage';
import { QuotePage } from '../pages/public/QuotePage';
import { ServicesPage as PublicServicesPage } from '../pages/public/ServicesPage';
import { CatalogPage } from '../pages/public/CatalogPage';

export default function App() {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/servicios" element={<PublicServicesPage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/cotizar" element={<QuotePage />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/acceso" element={<AccessPage />} />
          <Route path="/os/login" element={<AccessPage />} />
        </Route>

      <Route path="/admin/cotizaciones/:quoteId/imprimir" element={<ProtectedRoute allow={['admin', 'sales']}><QuotePrintPage /></ProtectedRoute>} />
      <Route path="/admin/facturacion/:invoiceId/imprimir" element={<ProtectedRoute allow={['admin', 'sales']}><InvoicePrintPage /></ProtectedRoute>} />
      <Route path="/admin/ordenes/:orderId/imprimir" element={<ProtectedRoute allow={['admin']}><OrderPrintPage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/leads" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><LeadsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/leads/:leadId" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><LeadDetailPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/clientes" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><CustomersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/clientes/:customerId" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><CustomerDetailPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/banco-clientes" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><ClientBankPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/servicios" element={<ProtectedRoute allow={['admin']}><AdminLayout><ServicesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/motor-precios" element={<ProtectedRoute allow={['admin']}><AdminLayout><PricingEnginePage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/configuracion/precios" element={<ProtectedRoute allow={['admin']}><AdminLayout><PricingRulesSettingsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/cotizaciones" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><QuotesPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/cotizaciones/:quoteId" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><QuoteDetailPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/ordenes" element={<ProtectedRoute allow={['admin']}><AdminLayout><OrdersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/ordenes/:orderId" element={<ProtectedRoute allow={['admin']}><AdminLayout><OrderDetailPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/inventario" element={<ProtectedRoute allow={['admin']}><AdminLayout><InventoryPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/facturacion" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><BillingPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/facturacion/:invoiceId" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><InvoiceDetailPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/premium-pass" element={<ProtectedRoute allow={['admin']}><AdminLayout><PremiumPassPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reportes" element={<ProtectedRoute allow={['admin']}><AdminLayout><ReportsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/usuarios" element={<ProtectedRoute allow={['admin']}><AdminLayout><UsersManagementPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/configuracion" element={<ProtectedRoute allow={['admin']}><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/os/dashboard" element={<ProtectedRoute allow={['admin', 'sales']}><AdminLayout><OsDashboardPage /></AdminLayout></ProtectedRoute>} />

      <Route path="/portal" element={<ProtectedRoute allow={['client']}><ClientLayout /></ProtectedRoute>}>
        <Route index element={<ClientHomePage />} />
        <Route path="cotizaciones" element={<ClientQuotesPage />} />
        <Route path="ordenes" element={<ClientOrdersPage />} />
        <Route path="facturas" element={<ClientInvoicesPage />} />
        <Route path="premium-pass" element={<ClientPremiumPage />} />
        <Route path="solicitar" element={<ClientRequestPage />} />
        <Route path="perfil" element={<ClientProfilePage />} />
      </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppErrorBoundary>
  );
}
