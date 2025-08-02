const axios = require('axios');

// GitHub API base URL
const GITHUB_API_BASE = 'https://api.github.com';

// Headers for GitHub API requests
const getHeaders = () => ({
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Auto-Commits-App'
});

// Fetch all public repositories for a user
const fetchUserRepositories = async (username) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/users/${username}/repos`,
      { headers: getHeaders() }
    );

    return response.data
      .filter(repo => !repo.fork) // Only include non-forked repositories
      .map(repo => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        updated_at: repo.updated_at,
        html_url: repo.html_url
      }))
      .sort((a, b) => b.stargazers_count - a.stargazers_count); // Sort by stars
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`User '${username}' not found`);
    }
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
};

// Fetch commits from a specific repository
const fetchRepositoryCommits = async (username, repository) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}/commits`,
      { 
        headers: getHeaders(),
        params: {
          per_page: 100, // Get up to 100 commits
          page: 1
        }
      }
    );

    return response.data.map(commit => ({
      sha: commit.sha,
      commit: {
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date
        }
      },
      html_url: commit.html_url,
      author: commit.author ? {
        login: commit.author.login,
        avatar_url: commit.author.avatar_url
      } : null
    }));
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Repository '${username}/${repository}' not found`);
    }
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
};

// Get repository details
const getRepositoryDetails = async (username, repository) => {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${username}/${repository}`,
      { headers: getHeaders() }
    );

    return {
      id: response.data.id,
      name: response.data.name,
      full_name: response.data.full_name,
      description: response.data.description,
      language: response.data.language,
      stargazers_count: response.data.stargazers_count,
      forks_count: response.data.forks_count,
      updated_at: response.data.updated_at,
      html_url: response.data.html_url
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`Repository '${username}/${repository}' not found`);
    }
    throw new Error(`Failed to fetch repository details: ${error.message}`);
  }
};

module.exports = {
  fetchUserRepositories,
  fetchRepositoryCommits,
  getRepositoryDetails
}; 