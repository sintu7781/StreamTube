import React, { useState, useRef } from 'react';
import { FaCamera, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';

const ProfilePictureUpload = ({ 
  currentImage, 
  onImageUpload, 
  onImageRemove, 
  isLoading = false, 
  size = 'large',
  type = 'user' // 'user' or 'channel'
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload file
    if (onImageUpload) {
      onImageUpload(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const displayImage = previewImage || currentImage;

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Picture Display */}
      <div className="relative">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg relative group cursor-pointer`}
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {displayImage ? (
            <img
              src={displayImage}
              alt={`${type} profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaCamera className="text-4xl text-gray-400 dark:text-gray-500" />
            </div>
          )}

          {/* Overlay */}
          <div className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${isLoading ? 'opacity-100' : ''} ${isDragOver ? 'opacity-100 bg-blue-500 bg-opacity-50' : ''}`}>
            {isLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            ) : isDragOver ? (
              <div className="text-white text-center">
                <FaUpload className="mx-auto mb-1" />
                <span className="text-sm">Drop image</span>
              </div>
            ) : (
              <div className="text-white text-center">
                <FaCamera className="mx-auto mb-1" />
                <span className="text-sm">Change</span>
              </div>
            )}
          </div>
        </div>

        {/* Remove button */}
        {(displayImage && !isLoading) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveImage();
            }}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            title="Remove image"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex space-x-2">
        <button
          onClick={triggerFileInput}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <FaUpload className="mr-2" />
              Upload {type === 'user' ? 'Profile Picture' : 'Channel Avatar'}
            </>
          )}
        </button>

        {(currentImage && !previewImage && !isLoading) && (
          <button
            onClick={handleRemoveImage}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <FaTrash className="mr-2" />
            Remove
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* Upload guidelines */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>JPG, PNG or GIF (max 5MB)</p>
        <p>Drag and drop or click to upload</p>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
