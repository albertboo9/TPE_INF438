import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BottomNavigation } from './components/layout/BottomNavigation';
import { FilterSheet } from './components/ui/FilterSheet';
import { AnalyticsFilters } from './services/api';

// Page Views
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Predictions from './pages/Predictions';
import Intelligence from './pages/Intelligence';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState<boolean>(false);

  // Loading Screen (Apple Style full screen glass spinner)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fdf7ff] dark:bg-[#0f0b15] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 dark:border-primary/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-primary tracking-widest font-label-caps animate-pulse">
          INITIALIZING SECURE SESSION...
        </p>
      </div>
    );
  }

  // Auth Guard: Force Login if unauthenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Slicing filters callback shared by Sidebar and mobile FilterSheet
  const handleFilterChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-display transition-all duration-300">
      {/* Dynamic Header */}
      <Header 
        currentPage={currentPage}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
      />

      {/* Desktop Left Sidebar (Only visible on screens >= LG) */}
      <Sidebar 
        className="hidden lg:flex"
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Dynamic Mobile Bottom Navigation (Only visible on screens < LG) */}
      <BottomNavigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenFilters={() => setIsMobileFiltersOpen(true)}
        userRole={user?.role}
      />

      {/* Dynamic Mobile Slide-Up Filters Sheets */}
      <FilterSheet 
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Responsive Content Shell */}
      <div className="lg:pl-72 transition-all duration-300">
        <main className="pt-20 pb-28 lg:pb-12 px-4 lg:px-10 max-w-7xl mx-auto">
          {currentPage === 'dashboard' && <Dashboard filters={filters} />}
          {currentPage === 'forecasting' && <Predictions filters={filters} />}
          {currentPage === 'intelligence' && <Intelligence filters={filters} />}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;