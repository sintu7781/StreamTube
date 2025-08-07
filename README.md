# StreamTube - Video Streaming Platform

A full-stack video streaming platform built with Node.js, Express, MongoDB, and React.

## 🚀 Features

- **User Authentication**: Email/password, Google OAuth, GitHub OAuth
- **Video Upload & Streaming**: Support for multiple video formats
- **Channel Management**: Create and customize channels
- **Real-time Analytics**: View counts, likes, comments
- **Responsive Design**: Modern UI with dark mode support
- **Search & Discovery**: Find videos and channels easily

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for file uploads
- **Multer** for file handling
- **Nodemailer** for email services

### Frontend
- **React 19** with Vite
- **React Router** for navigation
- **TanStack Query** for data fetching
- **Tailwind CSS** for styling
- **Axios** for API calls

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Cloudinary account
- Google OAuth credentials
- GitHub OAuth credentials
- SMTP email service (for password reset)

## 🔧 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd stream-app
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Create a `.env` file in the Backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017

# JWT Configuration
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=StreamTube
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
```

Create a `.env` file in the Frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GITHUB_CLIENT_ID=your_github_client_id
```

### 4. Start the Development Servers

**Backend:**
```bash
cd Backend
npm run dev
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

## 🔧 Issues Fixed

### Backend Fixes
1. **Error Handling**: Fixed `throw new error()` to `throw error` in index.js
2. **User Model**: Added missing fields (`fullName`, `avatar`, `verificationToken`, `verificationExpires`)
3. **Authentication**: Added `generateVerificationToken` method and `sendVerificationEmail` function
4. **Handle Generation**: Fixed to use Channel model instead of User model for uniqueness checks
5. **Video Controller**: Fixed view increment logic and file upload handling
6. **Channel Controller**: Fixed error handling and added `getChannelByHandle` function
7. **Route Protection**: Made video/channel viewing public, upload/edit routes protected
8. **GitHub Service**: Fixed async handle generation

### Frontend Fixes
1. **API Endpoints**: Fixed structure to match backend routes
2. **Auth API**: Added missing functions and fixed response handling
3. **Axios Interceptor**: Fixed token refresh and storage
4. **Login Hook**: Fixed response handling and added navigation
5. **HomePage**: Fixed user property reference and data handling
6. **VideoCard**: Uses existing format utilities correctly

## 📁 Project Structure

```
Stream app/
├── Backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Custom middlewares
│   │   ├── services/        # External service integrations
│   │   ├── utils/           # Utility functions
│   │   └── templates/       # Email templates
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   ├── api/             # API functions
│   │   ├── context/         # React context
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google/login` - Google OAuth login
- `GET /api/v1/auth/github/callback` - GitHub OAuth callback
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token

### Videos
- `GET /api/v1/videos` - Get all videos (public)
- `GET /api/v1/videos/:id` - Get single video (public)
- `POST /api/v1/videos/upload` - Upload video (protected)
- `POST /api/v1/videos/update-video/:id` - Update video (protected)

### Channels
- `GET /api/v1/channels/:handle` - Get channel by handle (public)
- `GET /api/v1/channels/:handle/videos` - Get channel videos (public)
- `POST /api/v1/channels/create` - Create channel (protected)
- `POST /api/v1/channels/customize` - Customize channel (protected)

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Rate limiting (can be added)
- File upload restrictions

## 🎨 UI Features

- Responsive design
- Dark mode support
- Loading states
- Error handling
- Toast notifications
- Infinite scroll (can be added)

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub. 