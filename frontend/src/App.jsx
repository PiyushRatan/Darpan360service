import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Docs from './pages/Docs';
import Landing from './pages/Landing';
import Login from './pages/Login';
import HostedChat from './pages/HostedChat';
import { MainPageLoader, SubPageLoader } from './components/Loaders';

const routeLoaderDuration = (pathname) => {
  if (pathname === '/') return 1100;
  if (pathname.startsWith('/chat/')) return 0;
  return 520;
};

const RouteLoaderLayer = () => {
  const location = useLocation();
  const [loadingPath, setLoadingPath] = React.useState(location.pathname);

  React.useEffect(() => {
    const duration = routeLoaderDuration(location.pathname);

    if (!duration) {
      setLoadingPath(null);
      return undefined;
    }

    setLoadingPath(location.pathname);
    const timer = window.setTimeout(() => setLoadingPath(null), duration);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {loadingPath === '/' && <MainPageLoader key="main-loader" />}
      {loadingPath && loadingPath !== '/' && <SubPageLoader key={loadingPath} label="Loading view" />}
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <>
    <RouteLoaderLayer />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat/:botId" element={<HostedChat />} />
    </Routes>
  </>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
