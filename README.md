
# 🚀 DevTube - MERN Video Platform

![MERN Stack](https://img.shields.io/badge/MERN-Stack-green) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-blue) ![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen) ![Express](https://img.shields.io/badge/Backend-Express.js-lightgrey) ![React](https://img.shields.io/badge/Frontend-React.js-blue) ![Node](https://img.shields.io/badge/Server-Node.js-green)

> **DevTube** is a full-featured video sharing platform built with the MERN stack. It supports user channels, playlists, subscriptions, comments, likes, video uploads, and more—all with industry-standard backend practices and a modern, responsive frontend.

---

## 🖥️ Frontend

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **State:** Context API (Auth, Theme)
- **Routing:** React Router
- **Features:**
  - Responsive UI, skeleton loaders, toast notifications
  - Channel pages, video player, playlists, dashboard, search
  - Protected routes, user authentication

## ⚙️ Backend

- **Framework:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Token)
- **Features:**
  - Modular controllers/services for User, Video, Playlist, Subs, Like, Comment
  - Secure endpoints with authentication middleware
  - Aggregation pipelines for efficient data fetching
  - Privacy controls (unpublished videos, private playlists)
  - Error handling with custom `ApiError` and `ApiResponse`
  - Cloudinary integration for media uploads
  - Pagination, validation, and scalable structure

## 📦 Folder Structure

```
Practice2/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── rotues/
│   │   ├── db/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── api/
│   ├── context/
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## 🔑 Key Features

- 👤 User registration, login, profile, settings
- 📹 Video upload, edit, publish/unpublish, delete
- 💬 Comments, likes, subscriptions
- 📺 Playlists: create, edit, remove videos, privacy
- 📊 Dashboard: analytics for channel owners
- 🔍 Search, related videos, watch history, liked videos
- 🛡️ Privacy: unpublished videos and emails hidden from others
- ⚡ Responsive UI with skeleton loaders and toasts

## 🛠️ API Endpoints (Sample)

- `POST /api/users/signup` - Register user
- `POST /api/users/login` - Login
- `GET /api/users/channel/:username` - Get channel info
- `POST /api/videos/upload` - Upload video
- `GET /api/videos` - List videos
- `POST /api/playlists/:playlistId/remove-video/:videoId` - Remove video from playlist
- ...and many more for comments, likes, subs, dashboard

## 🏗️ Industry-Standard Backend Practices

- **Authentication & Authorization:** JWT, protected routes
- **Validation & Error Handling:** All endpoints validate input, return consistent errors
- **Data Modeling:** Mongoose schemas for all entities
- **Aggregation & Population:** Efficient queries for large datasets
- **Privacy & Access Control:** Only owners can see unpublished/private content
- **Scalability:** Pagination, modular codebase
- **Testing & Documentation:** (Recommended) Jest, Swagger

## 🚀 Deployment (Vercel)

### Backend

1. Export Express app as a handler (`module.exports = app`)
2. Set environment variables (MongoDB URI, JWT secret) in Vercel dashboard
3. Add `vercel.json` for API rewrites if needed
4. Push to GitHub, import in Vercel, select backend folder
5. Test API endpoints on Vercel preview URL

### Frontend

- Vercel supports React/Vite out of the box
- Set API base URL in environment variables
- Push to GitHub, import in Vercel

## 📝 Best Practices

- Use `.env` for secrets/config
- Modularize controllers, services, models
- Validate all inputs, handle errors gracefully
- Protect sensitive routes
- Document API endpoints and data models
- Use skeleton loaders and toasts for UX

---

## 📚 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/Ihsaan7/MERN_STACK-DevTube.git
   ```
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. Set up environment variables in both `/backend/.env` and Vercel dashboard
4. Run locally:
   ```bash
   npm start # in backend
   npm run dev # in frontend
   ```
5. Deploy to Vercel for production

---

## 👨‍💻 Author & Contributors

- **Ihsaan7** (Backend, Frontend, DevOps)
- [Your Name Here]

---

## 📄 License

MIT

---

> Made with ❤️ using MERN, for modern video platforms.
=======
# PlaylistDetailPage.jsx - Project Integration & Backend Overview

## Frontend Usage

This file is a React component for displaying the details of a playlist, including its videos, owner, and metadata. It is part of a MERN stack video platform project.

### Key Features

- Fetches playlist details from backend using `getSinglePlaylist` API service.
- Allows playlist owner to remove videos from the playlist.
- Displays playlist metadata (name, description, privacy, owner, video count, creation date).
- Shows skeleton loaders while fetching data.
- Handles errors and empty states gracefully.
- Responsive and styled with Tailwind CSS.

### Main Dependencies

- React (hooks, router)
- Context API (`AuthContext`, `ThemeContext`)
- Custom API services (`playlist.services.js`)
- Layout and UI components

## Backend Integration

### API Endpoints Used

- `GET /playlists/:playlistId` - Fetches playlist details, including videos and owner info.
- `POST /playlists/:playlistId/remove-video/:videoId` - Removes a video from the playlist (owner only).

### Backend Features (Industry Standard)

- **Authentication & Authorization:**
  - JWT-based authentication for all protected routes.
  - Only playlist owner can modify playlist (remove videos, edit, delete).
- **Data Modeling:**
  - MongoDB with Mongoose models for Playlist, Video, User.
  - Playlists reference videos and owner by ObjectId.
- **Validation & Error Handling:**
  - All endpoints validate input (IDs, permissions).
  - Consistent error responses using custom `ApiError` and `ApiResponse` classes.
- **Aggregation & Population:**
  - Aggregation pipelines to fetch playlist with populated video and owner details.
  - Efficient queries for large playlists.
- **Privacy & Access Control:**
  - Private playlists only accessible by owner.
  - Public playlists accessible to all users.
- **Scalability:**
  - Pagination for large playlists.
  - Modular controller/service structure.
- **Testing & Documentation:**
  - (Recommended) Unit and integration tests for playlist endpoints.
  - API documentation (Swagger or similar).

## Deployment on Vercel

### Steps to Deploy Backend (Express/MongoDB) on Vercel

1. **Prepare Backend for Serverless:**
   - Export Express app as a handler (e.g., `module.exports = app`).
   - Use Vercel's `api/` directory for serverless functions, or deploy as a monorepo.
2. **Environment Variables:**
   - Set MongoDB URI, JWT secret, and other secrets in Vercel dashboard.
3. **Configure `vercel.json`:**
   - Set up rewrites for API routes if needed.
   - Example:
     ```json
     {
       "rewrites": [{ "source": "/api/(.*)", "destination": "/api/$1" }]
     }
     ```
4. **Install Dependencies:**
   - Ensure all dependencies are listed in `package.json`.
5. **Push to GitHub & Connect to Vercel:**
   - Push your repo to GitHub.
   - Import project in Vercel and select backend folder for deployment.
6. **Test Deployment:**
   - Use Vercel's preview URL to test API endpoints and frontend integration.

### Frontend Deployment

- Vercel natively supports React/Vite projects.
- Set environment variables for API base URL.
- Push frontend code to GitHub and import in Vercel.

## Best Practices

- Use environment variables for secrets and config.
- Modularize controllers, services, and models.
- Validate all inputs and handle errors gracefully.
- Protect sensitive routes with authentication middleware.
- Document API endpoints and data models.
- Use skeleton loaders and toasts for better UX.

---

**This file is a key part of the playlist feature, integrating robust backend logic and modern frontend practices for a scalable, secure video platform.**
>>>>>>> 740d4757749d1fcd6b39e59bcc3fe01500f8a461
