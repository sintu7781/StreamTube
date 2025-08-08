import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import React from "react";
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
import ChannelAnalyticsPage from "./pages/ChannelAnalyticsPage";
import PrivateRoute from "./components/auth/PrivateRoute";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Routes where sidebar should be hidden completely
  const hideSidebarRoutes = ["/login", "/signup", "/watch"];
  const shouldHideSidebar = hideSidebarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  // Routes where sidebar should be shown by default (home page)
  const showSidebarByDefault = ["/"];
  const shouldShowSidebarByDefault = showSidebarByDefault.includes(location.pathname);

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

  // Initialize sidebar state based on current route
  useEffect(() => {
    if (shouldShowSidebarByDefault) {
      setSidebarOpen(true);
    } else {
      setSidebarOpen(false);
    }
  }, [location.pathname, shouldShowSidebarByDefault]);

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideHeader && (
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      )}
      <div className="flex flex-1">
        {!shouldHideSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}
        <main className={`flex-1 ${!shouldHideSidebar && sidebarOpen ? "lg:ml-64" : ""}`}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/c/:handle" element={<ChannelPage />} />
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
                <PrivateRoute>
                  <StudioPage />
                </PrivateRoute>
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
                <PrivateRoute>
                  <UploadPage />
                </PrivateRoute>
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
              path="/analytics"
              element={
                <PrivateRoute>
                  <ChannelAnalyticsPage />
                </PrivateRoute>
              }
            />
            {/* Add more routes as needed */}
          </Routes>
        </main>
      </div>
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;
