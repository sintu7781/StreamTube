import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'medium', className = '', text = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const iconSizes = {
    small: 14,
    medium: 20,
    large: 32,
    xl: 48
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <FaSpinner 
          className="animate-spin text-blue-500" 
          size={iconSizes[size]} 
        />
      </div>
      {text && (
        <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
