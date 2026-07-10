# CodeFusion 🚀

An AI-Powered Real-Time Collaborative Coding Platform built with the MERN stack.

## Features
- **Real-Time Collaboration**: Code together with multiplayer editing and cursor tracking via Socket.IO and Monaco Editor.
- **AI Assistant**: Built-in Google Gemini API integration to explain code, fix bugs, and generate snippets.
- **Code Execution**: Run code in 10+ languages instantly using the Piston API.
- **Project Management**: Create projects, invite team members, manage permissions.
- **Modern UI/UX**: Dark-first glassmorphism design using Tailwind CSS v4 and Framer Motion.
- **Authentication**: Secure JWT-based auth with role management (Developer, Mentor, Student).

## Tech Stack
**Frontend:**
- React (Vite)
- Tailwind CSS v4
- Framer Motion
- Monaco Editor
- Socket.IO Client
- Redux Toolkit + React Query

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT Authentication
- Multer + Cloudinary

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB

### Local Setup
1. **Clone the repository**
2. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Configure Environment Variables:**
   Create `.env` in `server/` using `.env.example` as a template.
4. **Run the application:**
   - Server: `cd server && npm run dev`
   - Client: `cd client && npm run dev`

### Docker Setup
You can also run the entire stack using Docker Compose:
```bash
docker-compose up --build
```

## Deployment
- **Frontend**: Designed for Vercel
- **Backend**: Designed for Render/Heroku
- **Database**: Designed for MongoDB Atlas
# codefusion  
