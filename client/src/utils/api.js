import axios from 'axios'

const API_BASE_URL = '/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fetch user repositories
export const fetchUserRepositories = async (username) => {
  try {
    const response = await api.get(`/repositories/${username}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch repositories')
  }
}

// Save user preference
export const saveUserPreference = async (username, repository) => {
  try {
    const response = await api.post('/preferences', { username, repository })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to save preference')
  }
}

// Get daily commits for a user
export const getDailyCommits = async (username) => {
  try {
    const response = await api.get(`/commits/${username}`)
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch commits')
  }
}

// Get user preference
export const getUserPreference = async (username) => {
  try {
    const response = await api.get(`/preferences/${username}`)
    return response.data
  } catch (error) {
    return null
  }
}

// Manual trigger for testing
export const triggerFetch = async (username, repository) => {
  try {
    const response = await api.post('/trigger-fetch', { username, repository })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to trigger fetch')
  }
}

// Create immediate commits for selected repository
export const createImmediateCommits = async (username, repository, githubToken) => {
  try {
    const response = await api.post('/create-commits', { 
      username, 
      repository,
      githubToken 
    })
    return response.data
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create commits')
  }
} 