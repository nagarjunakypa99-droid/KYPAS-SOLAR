/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { Sidebar, NavItemKey } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { LoginPage } from './components/auth/LoginPage';

// Modules
import { DashboardView } from './components/modules/Dashboard/DashboardView';
import { LeadManagementView } from './components/modules/Leads/LeadManagementView';
import { CustomerManagementView } from './components/modules/Customers/CustomerManagementView';
import { QuotationManagementView } from './components/modules/Quotations/QuotationManagementView';
import { BankLoanTrackingView } from './components/modules/Loans/BankLoanTrackingView';
import { InstallationManagementView } from './components/modules/Installations/InstallationManagementView';
import { ServiceManagementView } from './components/modules/Services/ServiceManagementView';
import { AMCManagementView } from './components/modules/AMC/AMCManagementView';
import { MaintenanceCalendarView } from './components/modules/Calendar/MaintenanceCalendarView';
import { ReportsAnalyticsView } from './components/modules/Reports/ReportsAnalyticsView';
import { UsersPermissionsView } from './components/modules/Users/UsersPermissionsView';
import { SettingsView } from './components/modules/Settings/SettingsView';
import { ActivityHistoryView } from './components/modules/Activity/ActivityHistoryView';

const MainAppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveModule = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentTab} />;
      case 'leads':
        return (
          <LeadManagementView
            onNavigateToQuotation={() => setCurrentTab('quotations')}
          />
        );
      case 'customers':
        return <CustomerManagementView />;
      case 'quotations':
        return <QuotationManagementView />;
      case 'loans':
        return <BankLoanTrackingView />;
      case 'installations':
        return <InstallationManagementView />;
      case 'services':
        return <ServiceManagementView />;
      case 'amc':
        return <AMCManagementView />;
      case 'calendar':
        return <MaintenanceCalendarView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'users':
        return <UsersPermissionsView />;
      case 'settings':
        return <SettingsView />;
      case 'activity':
        return <ActivityHistoryView />;
      default:
        return <DashboardView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Top Application Header */}
      <Header
        onNavigate={setCurrentTab}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main
        className={`pt-20 px-4 sm:px-6 lg:px-8 transition-all duration-300 min-h-screen ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto py-4">
          {renderActiveModule()}
        </div>
      </main>

      {/* Global Interactive Overlays */}
      <ToastContainer />
      <ConfirmDialog />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CRMProvider>
        <MainAppLayout />
      </CRMProvider>
    </AuthProvider>
  );
}
