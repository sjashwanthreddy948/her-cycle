import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CycleProvider } from './context/CycleContext';
import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';

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

// Shell Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isPublicRoute = ['/', '/login', '/register', '/forgot-password'].includes(location.pathname);

  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-[#FFF5F7] flex flex-col justify-between">
      <Header />
      <main className="flex-1 max-w-md w-full mx-auto pb-6">
        {children}
      </main>
      <Navbar />
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

              {/* Woman App */}
              <Route path="/woman/home" element={<WomanHomePage />} />
              <Route path="/woman/calendar" element={<WomanCalendarPage />} />
              <Route path="/woman/log" element={<WomanLogPage />} />
              <Route path="/woman/insights" element={<WomanInsightsPage />} />
              <Route path="/woman/phases" element={<WomanPhasesPage />} />
              <Route path="/woman/partner" element={<WomanPartnerPage />} />
              <Route path="/woman/privacy" element={<WomanPrivacyPage />} />
              <Route path="/woman/profile" element={<WomanProfilePage />} />

              {/* Partner App */}
              <Route path="/partner/home" element={<PartnerHomePage />} />
              <Route path="/partner/calendar" element={<PartnerCalendarPage />} />
              <Route path="/partner/support" element={<PartnerSupportPage />} />
              <Route path="/partner/profile" element={<PartnerProfilePage />} />
              <Route path="/partner/connect" element={<PartnerConnectPage />} />

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
