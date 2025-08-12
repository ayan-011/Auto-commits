# Auto Commits - Daily GitHub Commits

A full-stack web application that automatically creates 10 commits daily in your selected GitHub repository to maintain your contribution streak.

## Features

- **User Setup**: Enter GitHub username and select from available repositories
- **Immediate Commit Creation**: Creates 10 actual commits in your repository when selected
- **GitHub Contribution Updates**: Real commits that appear in your GitHub contribution graph
- **Automatic Daily Fetching**: Cron job runs daily at 9:00 AM UTC to fetch commits
- **Random Selection**: Picks 10 random commits from the selected repository
- **Modern UI**: Built with React, Vite, and Tailwind CSS
- **Real-time Refresh**: Manual refresh capability for immediate updates
- **Persistent Storage**: SQLite database stores user preferences and commits
- **Username Suggestions**: Remembers and suggests previously used usernames

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
- GitHub Personal Access Token (for creating actual commits)

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

3. **Set up GitHub Personal Access Token**
   
   To create actual commits that update your GitHub contribution graph, you need a Personal Access Token:
   
   a. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   b. Generate a new token with the following permissions:
      - `repo` (Full control of private repositories)
      - `public_repo` (Access public repositories)
   c. Copy the token
   
   d. Create a `.env` file:
   ```bash
   cp env.example .env
   ```
   
   e. Add your token to the `.env` file:
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

2. **Enter a GitHub username** in the input field (your own username)

3. **Select a repository** from the list of available repositories (choose a repository you own or have write access to)

4. **Watch commits being created** - the app will create 10 actual commits in your repository

5. **Check your GitHub profile** - the commits will appear in your contribution graph

## Important Notes

- **Repository Ownership**: You must own the repository or have write access to create commits
- **GitHub Token**: Required for creating actual commits. Without a token, the app can only fetch existing commits
- **Rate Limiting**: GitHub API has rate limits. The app includes delays between commits to avoid hitting limits
- **Commit Messages**: Commits use realistic messages like "Update documentation", "Fix minor bugs", etc.

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/repositories/:username` - Get user repositories
- `POST /api/preferences` - Save user preference
- `GET /api/commits/:username` - Get daily commits for user
- `POST /api/create-commits` - Create actual commits in repository
- `POST /api/trigger-fetch` - Manual trigger for commit fetching

## Database Schema

### Users Table
- `