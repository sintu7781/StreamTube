# StreamTube Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- Google OAuth credentials
- Cloudinary account (for video/image uploads)

## Backend Setup

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/streamtube

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174

# Optional: Domain restrictions for Google Auth
ALLOWED_GOOGLE_DOMAINS=
```

### 3. Start Backend Server
```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies
```bash
cd Frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the Frontend directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# App Configuration
VITE_APP_NAME=StreamTube
VITE_APP_VERSION=1.0.0
```

### 3. Start Frontend Server
```bash
npm run dev
```

## Google OAuth Setup

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google OAuth2 API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Choose "Web application"
6. Add authorized origins:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://127.0.0.1:5173`
   - `http://127.0.0.1:5174`
7. Add authorized redirect URIs:
   - `http://localhost:5173/auth/google/callback`
   - `http://localhost:5174/auth/google/callback`

### 2. Update Environment Files
Copy the Client ID and Client Secret to your `.env` files.

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Channels
- `GET /api/v1/channels/me` - Get current user's channel
- `POST /api/v1/channels` - Create channel
- `PATCH /api/v1/channels/me` - Update channel
- `DELETE /api/v1/channels/me` - Delete channel
- `GET /api/v1/channels/search` - Search channels
- `GET /api/v1/channels/:handle` - Get channel by handle

### Analytics
- `GET /api/v1/analytics/:channelId` - Get channel analytics
- `GET /api/v1/analytics/:channelId/overview` - Get analytics overview
- `GET /api/v1/analytics/:channelId/demographics` - Get audience demographics
- `POST /api/v1/analytics/:channelId` - Create/update analytics
- `DELETE /api/v1/analytics/:channelId/:date` - Delete analytics
- `PUT /api/v1/analytics/:channelId/bulk` - Bulk update analytics

### Videos
- `GET /api/v1/videos` - Get videos
- `POST /api/v1/videos` - Upload video
- `GET /api/v1/videos/:id` - Get video by ID
- `PATCH /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Comments
- `GET /api/v1/comments/:videoId` - Get video comments
- `POST /api/v1/comments` - Create comment
- `PATCH /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Likes
- `POST /api/v1/likes/video/:videoId` - Like/unlike video
- `POST /api/v1/likes/comment/:commentId` - Like/unlike comment
- `GET /api/v1/likes/videos` - Get liked videos
- `GET /api/v1/likes/comments` - Get liked comments

## Troubleshooting

### 403 Error
- Check if user is authenticated
- Verify JWT token is valid
- Ensure proper authorization headers

### Google Auth Origin Error
- Verify Google Client ID is correct
- Check authorized origins in Google Cloud Console
- Ensure redirect URIs are properly configured

### CORS Issues
- Backend CORS is configured for localhost:5173 and localhost:5174
- Check if frontend is running on correct port
- Verify API base URL in axios configuration

### Database Connection
- Ensure MongoDB is running
- Check MONGODB_URI in environment file
- Verify database permissions

## Development Notes

- Backend runs on port 3000
- Frontend runs on port 5173 (or 5174 if 5173 is busy)
- All API routes are prefixed with `/api/v1`
- Authentication uses JWT tokens
- File uploads use Cloudinary
- Google OAuth is implemented for social login
