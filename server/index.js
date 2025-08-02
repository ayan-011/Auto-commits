const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database');
const { fetchUserRepositories, fetchRepositoryCommits } = require('./github');
const { saveUserPreference, getDailyCommits, saveDailyCommits } = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// Initialize database
initializeDatabase();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get user repositories
app.get('/api/repositories/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const repositories = await fetchUserRepositories(username);
    res.json(repositories);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Save user preference
app.post('/api/preferences', async (req, res) => {
  try {
    const { username, repository } = req.body;
    await saveUserPreference(username, repository);
    res.json({ message: 'Preference saved successfully' });
  } catch (error) {
    console.error('Error saving preference:', error);
    res.status(500).json({ error: 'Failed to save preference' });
  }
});

// Get daily commits for a user
app.get('/api/commits/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const commits = await getDailyCommits(username);
    res.json(commits);
  } catch (error) {
    console.error('Error fetching commits:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Get user preference
app.get('/api/preferences/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const preference = await getUserPreference(username);
    res.json(preference);
  } catch (error) {
    console.error('Error fetching user preference:', error);
    res.status(500).json({ error: 'Failed to fetch user preference' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Daily cron job to fetch commits
cron.schedule('0 9 * * *', async () => {
  console.log('Running daily commit fetch...');
  try {
    const db = require('./database');
    const users = await db.getAllUsers();
    
    for (const user of users) {
      try {
        console.log(`Fetching commits for ${user.username}/${user.repository}`);
        const commits = await fetchRepositoryCommits(user.username, user.repository);
        
        // Select 10 random commits
        const randomCommits = commits
          .sort(() => 0.5 - Math.random())
          .slice(0, 10)
          .map(commit => ({
            ...commit,
            username: user.username,
            repository: user.repository,
            fetched_at: new Date().toISOString()
          }));
        
        await saveDailyCommits(user.username, randomCommits);
        console.log(`Saved ${randomCommits.length} commits for ${user.username}`);
      } catch (error) {
        console.error(`Error processing user ${user.username}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in daily cron job:', error);
  }
}, {
  timezone: "UTC"
});

// Manual trigger for testing
app.post('/api/trigger-fetch', async (req, res) => {
  try {
    const { username, repository } = req.body;
    const commits = await fetchRepositoryCommits(username, repository);
    
    const randomCommits = commits
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .map(commit => ({
        ...commit,
        username,
        repository,
        fetched_at: new Date().toISOString()
      }));
    
    await saveDailyCommits(username, randomCommits);
    res.json({ message: 'Commits fetched and saved successfully', count: randomCommits.length });
  } catch (error) {
    console.error('Error in manual fetch:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Daily cron job scheduled for 9:00 AM UTC`);
}); 