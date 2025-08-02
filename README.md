# Auto Commits - Daily GitHub Commits

A full-stack web application that automatically pulls 10 random commits daily from a selected GitHub repository.

## Features

- **User Setup**: Enter GitHub username and select from available repositories
- **Automatic Daily Fetching**: Cron job runs daily at 9:00 AM UTC to fetch commits
- **Random Selection**: Picks 10 random commits from the selected repository
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Real-time Refresh**: Manual refresh capability for immediate updates
- **Persistent Storage**: SQLite database stores user preferences and commits

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** for data persistence
- **node-cron** for scheduled tasks
- **Axios** for GitHub API integration

### Frontend
- **React 18** with hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-commits
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables** (optional)
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` to add your GitHub personal access token for higher API rate limits:
   ```
   GITHUB_TOKEN=your_github_personal_access_token
   ```

4. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run client
   ```

## Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Enter a GitHub username** in the input field

3. **Select a repository** from the list of available repositories

4. **View daily commits** - the app will display 10 random commits from your selected repository

5. **Manual refresh** - click "Refresh Now" to fetch commits immediately

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/repositories/:username` - Get user repositories
- `POST /api/preferences` - Save user preference
- `GET /api/commits/:username` - Get daily commits for user
- `POST /api/trigger-fetch` - Manual trigger for commit fetching

## Database Schema

### Users Table
- `id` - Primary key
- `username` - GitHub username
- `repository` - Selected repository name
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Commits Table
- `id` - Primary key
- `username` - GitHub username
- `repository` - Repository name
- `commit_sha` - Commit SHA
- `commit_message` - Commit message
- `author_name` - Author name
- `author_email` - Author email
- `commit_date` - Commit date
- `html_url` - GitHub commit URL
- `fetched_at` - When commit was fetched

## Cron Job

The application runs a daily cron job at 9:00 AM UTC that:
1. Fetches all registered users
2. For each user, pulls commits from their selected repository
3. Randomly selects 10 commits
4. Stores them in the database

## Development

### Project Structure
```
auto-commits/
├── server/                 # Backend
│   ├── index.js           # Main server file
│   ├── database.js        # Database operations
│   └── github.js          # GitHub API integration
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   └── App.jsx        # Main app component
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

### Available Scripts

- `npm run dev` - Start both backend and frontend
- `npm run server` - Start backend only
- `npm run client` - Start frontend only
- `npm run build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## Deployment

### Backend Deployment
1. Set environment variables
2. Run `npm run build` to build the frontend
3. Start the server with `npm run server`

### Frontend Deployment
The built frontend files are served by the Express server from the `client/dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub. 