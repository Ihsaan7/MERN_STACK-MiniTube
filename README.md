
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

- **Ihsaan7** (Backend, Frontend)
- [IHSAAN ULLAH]

---

---

> Made with ❤️ using MERN, for modern video platforms.
=======

