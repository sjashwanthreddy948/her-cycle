import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';
import { Header } from './components/common/Header';
import { DesktopNav } from './components/common/DesktopNav';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { BackendNotConfigured } from './components/common/BackendNotConfigured';

// Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

// Woman Pages
import { WomanHomePage } from './pages/woman/WomanHomePage';
import { WomanCalendarPage } from './pages/woman/WomanCalendarPage';
import { WomanLogPage } from './pages/woman/WomanLogPage';
import { WomanInsightsPage } from './pages/woman/WomanInsightsPage';
import { WomanPhasesPage } from './pages/woman/WomanPhasesPage';
import { WomanPartnerPage } from './pages/woman/WomanPartnerPage';
import { WomanPrivacyPage } from './pages/woman/WomanPrivacyPage';
import { WomanProfilePage } from './pages/woman/WomanProfilePage';

// Partner Pages
import { PartnerHomePage } from './pages/partner/PartnerHomePage';
import { PartnerCalendarPage } from './pages/partner/PartnerCalendarPage';
import { PartnerSupportPage } from './pages/partner/PartnerSupportPage';
import { PartnerProfilePage } from './pages/partner/PartnerProfilePage';
import { PartnerConnectPage } from './pages/partner/PartnerConnectPage';

// Protected Route Guard with strict role isolation
const ProtectedRoute: React.FC<{
  allowedRole: 'woman' | 'partner';
  children: React.ReactNode;
}> = ({ allowedRole, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7]">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict role enforcement: partner cannot open /woman/* and woman cannot open /partner/*
  if (user.role !== allowedRole) {
    return <Navigate to={user.role === 'partner' ? '/partner/home' : '/woman/home'} replace />;
  }

  return <>{children}</>;
};

// Shell Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isConfigured, sessionError, logout } = useAuth();
  const location = useLocation();

  if (!isConfigured) {
    return <BackendNotConfigured />;
  }

  const isPublicRoute = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isPublicRoute) {
    return (
      <main className="min-h-screen relative">
        {sessionError && (
          <div className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 p-3 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-800 shadow-float flex items-center justify-between">
            <span>{sessionError}</span>
            <button
              onClick={() => logout()}
              className="text-xs font-bold text-amber-900 underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}
        {children}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-between">
      {sessionError && (
        <div className="bg-amber-100 border-b border-amber-300 p-2 text-center text-xs text-amber-900 font-semibold">
          {sessionError}
        </div>
      )}
      
      {/* Desktop Top Navigation (hidden on mobile) */}
      <div className="hidden md:block">
        <DesktopNav />
      </div>

      {/* Mobile Top Header (hidden on desktop) */}
      <div className="md:hidden">
        <Header />
      </div>

      {/* Responsive Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 sm:px-4 pb-28 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (hidden on desktop) */}
      <div className="md:hidden">
        <Navbar />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CycleProvider>
          <ToastContainer />
          <AppLayout>
            <Routes>
              {/* Public & Auth */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Woman App (Strictly woman role) */}
              <Route path="/woman/home" element={<ProtectedRoute allowedRole="woman"><WomanHomePage /></ProtectedRoute>} />
              <Route path="/woman/calendar" element={<ProtectedRoute allowedRole="woman"><WomanCalendarPage /></ProtectedRoute>} />
              <Route path="/woman/log" element={<ProtectedRoute allowedRole="woman"><WomanLogPage /></ProtectedRoute>} />
              <Route path="/woman/insights" element={<ProtectedRoute allowedRole="woman"><WomanInsightsPage /></ProtectedRoute>} />
              <Route path="/woman/phases" element={<ProtectedRoute allowedRole="woman"><WomanPhasesPage /></ProtectedRoute>} />
              <Route path="/woman/partner" element={<ProtectedRoute allowedRole="woman"><WomanPartnerPage /></ProtectedRoute>} />
              <Route path="/woman/privacy" element={<ProtectedRoute allowedRole="woman"><WomanPrivacyPage /></ProtectedRoute>} />
              <Route path="/woman/profile" element={<ProtectedRoute allowedRole="woman"><WomanProfilePage /></ProtectedRoute>} />

              {/* Partner App (Strictly partner role) */}
              <Route path="/partner/home" element={<ProtectedRoute allowedRole="partner"><PartnerHomePage /></ProtectedRoute>} />
              <Route path="/partner/calendar" element={<ProtectedRoute allowedRole="partner"><PartnerCalendarPage /></ProtectedRoute>} />
              <Route path="/partner/support" element={<ProtectedRoute allowedRole="partner"><PartnerSupportPage /></ProtectedRoute>} />
              <Route path="/partner/profile" element={<ProtectedRoute allowedRole="partner"><PartnerProfilePage /></ProtectedRoute>} />
              <Route path="/partner/connect" element={<ProtectedRoute allowedRole="partner"><PartnerConnectPage /></ProtectedRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </CycleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
