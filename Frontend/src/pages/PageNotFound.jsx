import React from "react";
import { Link } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative">
            <FaExclamationTriangle className="mx-auto text-6xl text-red-500 mb-4" />
            <div className="absolute inset-0 bg-red-500 opacity-20 blur-xl rounded-full"></div>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </h2>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            The page might have been deleted, renamed, or the URL might be
            incorrect.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FaHome className="mr-2" />
              Home
            </Link>
            <Link
              to="/search"
              className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <FaSearch className="mr-2" />
              Search
            </Link>
          </div>

          {/* Categories Section */}
          <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Explore Categories
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: "Music", path: "/category?category=music" },
                { name: "Gaming", path: "/category?category=gaming" },
                { name: "Movies", path: "/category?category=movies" },
                { name: "News", path: "/category?category=news" },
                { name: "Education", path: "/category?category=education" },
                { name: "Sports", path: "/category?category=sports" },
              ].map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200 text-center"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>
            If you believe this is an error, please{" "}
            <Link
              to="/help"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
