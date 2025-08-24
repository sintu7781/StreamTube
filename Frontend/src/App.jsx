import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import WatchPage from "./pages/WatchPage";
import ChannelPage from "./pages/ChannelPage";
import CreateChannelPage from "./pages/CreateChannelPage";
import StudioPage from "./pages/StudioPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";
import SearchPage from "./pages/SearchPage";
import SettingsPage from "./pages/SettingsPage";
import HistoryPage from "./pages/HistoryPage";
import LikedVideosPage from "./pages/LikedVideosPage";
import LikedCommentsPage from "./pages/LikedCommentsPage";
import WatchLaterPage from "./pages/WatchLaterPage";
import CategoryPage from "./pages/CategoryPage";
import PageNotFound from "./pages/PageNotFound";
import ChannelAnalyticsPage from "./pages/ChannelAnalyticsPage";
import NotificationsPage from "./pages/NotificationsPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import ChannelProtectedRoute from "./components/common/ChannelProtectedRoute";
import AuthErrorBoundary from "./components/common/AuthErrorBoundary";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";
import SubscriptionsPage from "./pages/SubscriptionPage";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored ? JSON.parse(stored) : false;
  });

  const location = useLocation();

  // Routes where sidebar should be hidden completely
  const hideSidebarRoutes = ["/login", "/signup"];
  const shouldHideSidebar =
    hideSidebarRoutes.some((route) => location.pathname.startsWith(route)) ||
    location.pathname.match(/^\/watch\/[^/]+$/); // Only hide for /watch/:id, not /watch-later

  // Routes where header should not be shown
  const hideHeaderRoutes = ["/login", "/signup"];
  const shouldHideHeader = hideHeaderRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Routes where footer should be shown (currently only login and signup)
  const showFooterRoutes = ["/login", "/signup"];
  const shouldShowFooter = showFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  useEffect(() => {
    if (shouldHideSidebar) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true); // Keep open but don't touch collapsed state
    }
  }, [location.pathname, shouldHideSidebar]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const handleMenuClick = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  return (
    <AuthErrorBoundary>
      <div className="flex flex-col h-screen overflow-hidden">
        {!shouldHideHeader && <Header onMenuClick={handleMenuClick} />}
        <div className="flex flex-1 overflow-hidden">
          {!shouldHideSidebar && (
            <Sidebar isOpen={sidebarOpen} isCollapsed={sidebarCollapsed} />
          )}
          <main className={`flex-1 overflow-hidden main-content-transition`}>
            <div
              className="h-full overflow-y-auto scrollbar-hide"
              onWheel={(e) => e.stopPropagation()}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/category" element={<CategoryPage />} />
                <Route path="/watch/:id" element={<WatchPage />} />
                <Route path="/c/:handle" element={<ChannelPage />} />
                <Route
                  path="/subscriptions"
                  element={
                    <PrivateRoute>
                      <SubscriptionsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/create-channel"
                  element={
                    <PrivateRoute>
                      <CreateChannelPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/studio"
                  element={
                    <ChannelProtectedRoute>
                      <StudioPage />
                    </ChannelProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/upload"
                  element={
                    <ChannelProtectedRoute>
                      <UploadPage />
                    </ChannelProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <HistoryPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/liked"
                  element={
                    <PrivateRoute>
                      <LikedVideosPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/liked-comments"
                  element={
                    <PrivateRoute>
                      <LikedCommentsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/watch-later"
                  element={
                    <PrivateRoute>
                      <WatchLaterPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <PrivateRoute>
                      <ChannelAnalyticsPage />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PrivateRoute>
                      <NotificationsPage />
                    </PrivateRoute>
                  }
                />
                {/* Catch-all route for 404 - must be last */}
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </div>
          </main>
        </div>
        {/* {shouldShowFooter && <Footer />} */}
      </div>
    </AuthErrorBoundary>
  );
}

export default App;
