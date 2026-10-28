import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TabBar } from './components/TabBar';
import { LanguageModal } from './components/LanguageModal';
import { CustomerServiceModal } from './components/CustomerServiceModal';
import { RechargeModal } from './components/RechargeModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WealthFundModal } from './components/WealthFundModal';
import { AppDownloadModal } from './components/AppDownloadModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { BindIbanModal } from './components/BindIbanModal';
import { PaymentPasswordModal } from './components/PaymentPasswordModal';
import { ChannelSelectModal } from './components/ChannelSelectModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Pages
import { RegisterPage } from './pages/RegisterPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { VipPage } from './pages/VipPage';
import { TeamPage } from './pages/TeamPage';
import { MinePage } from './pages/MinePage';
import { NewsPage } from './pages/NewsPage';
import { RecordsPage } from './pages/RecordsPage';
import { AdminPage } from './pages/AdminPage';

const AppContent: React.FC = () => {
  const { currentRoute, activeModal } = useApp();

  const isAuthPage = currentRoute === '/pages/register/index' || currentRoute === '/pages/login/index';
  const isAdminPage = currentRoute === '/pages/admin/index';
  const isMainTab = [
    '/pages/index/index',
    '/pages/tasks/index',
    '/pages/vip/index',
    '/pages/team/index',
    '/pages/mine/index',
  ].includes(currentRoute);

  const renderPage = () => {
    switch (currentRoute) {
      case '/pages/register/index':
        return <RegisterPage />;
      case '/pages/login/index':
        return <LoginPage />;
      case '/pages/admin/index':
        return <AdminPage />;
      case '/pages/index/index':
        return <HomePage />;
      case '/pages/tasks/index':
        return <TasksPage />;
      case '/pages/vip/index':
        return <VipPage />;
      case '/pages/team/index':
        return <TeamPage />;
      case '/pages/mine/index':
        return <MinePage />;
      case '/pages/news/index':
        return <NewsPage />;
      case '/pages/records/index':
        return <RecordsPage />;
      default:
        return <RegisterPage />;
    }
  };

  const getPageTitle = () => {
    switch (currentRoute) {
      case '/pages/tasks/index':
        return 'Extração 24h';
      case '/pages/vip/index':
        return 'Concessões de Lavra';
      case '/pages/team/index':
        return 'Equipe de Operadores';
      case '/pages/mine/index':
        return 'Cofre Mineral Catoca';
      case '/pages/news/index':
        return 'Processo Kimberley';
      case '/pages/records/index':
        return 'Extrato Mineral';
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 text-slate-900 flex flex-col items-center">
      {/* Mobile Shell Wrapper with White Diamond Palette */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-50 shadow-2xl relative border-x border-slate-200">
        {/* Top Navbar */}
        {!isAuthPage && !isAdminPage && (
          <Navbar title={getPageTitle()} showBack={!isMainTab} />
        )}

        {/* Page Content */}
        <main className="flex-1 w-full">
          {renderPage()}
        </main>

        {/* Bottom TabBar for main tabs and subpages when authenticated */}
        {!isAuthPage && !isAdminPage && <TabBar />}

        {/* Modals */}
        {activeModal?.name === 'language' && <LanguageModal />}
        {activeModal?.name === 'customer_service' && <CustomerServiceModal />}
        {activeModal?.name === 'recharge' && <RechargeModal />}
        {activeModal?.name === 'withdraw' && <WithdrawModal />}
        {activeModal?.name === 'daily_reward' && <DailyRewardModal />}
        {activeModal?.name === 'wealth_fund' && <WealthFundModal />}
        {activeModal?.name === 'app_download' && <AppDownloadModal />}
        {activeModal?.name === 'bind_iban' && <BindIbanModal />}
        {activeModal?.name === 'payment_password' && <PaymentPasswordModal />}
        {activeModal?.name === 'channel_select' && <ChannelSelectModal />}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
