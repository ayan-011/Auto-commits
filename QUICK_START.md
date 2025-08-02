# Quick Start Guide

## 🚀 Your Auto Commits Application is Ready!

The full-stack web application has been successfully created and is ready to use.

### What's Built

✅ **Backend (Node.js + Express)**
- GitHub API integration
- SQLite database for data persistence
- Daily cron job (9:00 AM UTC) to fetch commits
- RESTful API endpoints

✅ **Frontend (React + Vite + Tailwind)**
- Modern, responsive UI
- User setup flow
- Real-time commit display
- Manual refresh capability

✅ **Features**
- Enter GitHub username
- Select from available repositories
- View 10 random commits daily
- Automatic daily updates
- Manual refresh option

### How to Use

1. **Start the application:**
   ```bash
   npm run dev
   ```
   Or double-click `start.bat` on Windows

2. **Open your browser:**
   Navigate to `http://localhost:3000`

3. **Enter a GitHub username:**
   Type any public GitHub username (e.g., "facebook", "microsoft", "vercel")

4. **Select a repository:**
   Choose from the list of available repositories

5. **View commits:**
   The app will display 10 random commits from your selected repository

6. **Manual refresh:**
   Click "Refresh Now" to fetch commits immediately

### API Endpoints

- `GET /api/health` - Server status
- `GET /api/repositories/:username` - Get user repositories
- `POST /api/preferences` - Save user preference
- `GET /api/commits/:username` - Get daily commits
- `POST /api/trigger-fetch` - Manual commit fetch

### Daily Automation

The application automatically:
- Runs daily at 9:00 AM UTC
- Fetches commits from all registered users
- Selects 10 random commits per user
- Stores them in the database

### Testing the Application

1. **Test with a popular repository:**
   - Enter username: "facebook"
   - Select repository: "react"
   - Click "Refresh Now" to fetch commits immediately

2. **Test with your own repository:**
   - Enter your GitHub username
   - Select one of your repositories
   - View your commits

### Troubleshooting

- **Server not starting:** Check if port 5000 is available
- **Frontend not loading:** Check if port 3000 is available
- **GitHub API errors:** The app works without authentication, but rate limits apply
- **Database issues:** SQLite database is created automatically

### Next Steps

1. **Customize the cron schedule** in `server/index.js` if needed
2. **Add GitHub token** in `.env` for higher API rate limits
3. **Deploy to production** using your preferred hosting service
4. **Add authentication** if needed for production use

### Project Structure

```
auto-commits/
├── server/                 # Backend
│   ├── index.js           # Main server + API routes
│   ├── database.js        # SQLite operations
│   └── github.js          # GitHub API integration
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # API utilities
│   │   └── App.jsx        # Main app
│   └── package.json
└── package.json           # Root dependencies
```

🎉 **Your application is ready to use!** Start it with `npm run dev` and enjoy your daily GitHub commits! 