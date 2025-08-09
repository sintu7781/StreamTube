import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChannelProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const token = localStorage.getItem("authToken");

  // Show loading while auth is being initialized
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user but token exists, give auth context more time
  if (!user && token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have a channel, redirect to create channel
  if (!user.channel || !user.channel._id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Channel Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You need to create a channel before you can upload videos or access the studio.
          </p>
          <button
            onClick={() => window.location.href = '/create-channel'}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Create Channel
          </button>
        </div>
      </div>
    );
  }

  // User has a channel, render the protected content
  return children;
};

export default ChannelProtectedRoute;
