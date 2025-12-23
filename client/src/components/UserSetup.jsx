import React, { useState, useEffect } from 'react'
import { Github, Search, Star, GitBranch, Calendar, X, GitCommit, Key } from 'lucide-react'
import { fetchUserRepositories, saveUserPreference, createImmediateCommits } from '../utils/api'

const UserSetup = ({ onUserSetup }) => {
  const [username, setUsername] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [repositories, setRepositories] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: enter username, 2: select repository
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [creatingCommits, setCreatingCommits] = useState(false)
  const [commitProgress, setCommitProgress] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  // Load suggested users from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('suggestedUsers')
    if (storedUsers) {
      setSuggestedUsers(JSON.parse(storedUsers))
    }
    
    // Load saved token if exists
    const savedToken = localStorage.getItem('githubToken')
    if (savedToken) {
      setGithubToken(savedToken)
    }
  }, [])

  // Save suggested users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('suggestedUsers', JSON.stringify(suggestedUsers))
  }, [suggestedUsers])

  // Save token to localStorage when it changes
  useEffect(() => {
    if (githubToken) {
      localStorage.setItem('githubToken', githubToken)
    }
  }, [githubToken])

  const addToSuggestions = (newUsername) => {
    if (!suggestedUsers.includes(newUsername)) {
      setSuggestedUsers(prev => [...prev, newUsername])
    }
  }

  const removeFromSuggestions = (usernameToRemove) => {
    setSuggestedUsers(prev => prev.filter(user => user !== usernameToRemove))
  }

  const handleSuggestionClick = (suggestedUsername) => {
    setUsername(suggestedUsername)
  }

  const handleSearchRepositories = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username')
      return
    }

    setLoading(true)
    setError('')

    try {
      const repos = await fetchUserRepositories(username)
      setRepositories(repos)
      setStep(2)
      // Add username to suggestions after successful search
      addToSuggestions(username)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRepository = async (repo) => {
    if (!githubToken.trim()) {
      setError('Please enter your GitHub Personal Access Token to create commits')
      return
    }

    setSelectedRepo(repo)
    setLoading(true)
    setCreatingCommits(true)
    setCommitProgress('Saving user preference...')
    setError('')

    try {
      // First save user preference
      await saveUserPreference(username, repo.name)
<<<<<<< HEAD
      setCommitProgress('Creating 5 commits in your repository...')
=======
      setCommitProgress('Creating 10 commits in your repository...')
>>>>>>> 8b7a4c3c53a9ed6d3681504ed29d5b4a6dda79a1
      
      // Then create immediate commits with user's token
      const result = await createImmediateCommits(username, repo.name, githubToken)
      
      if (result.note) {
        setCommitProgress(`Successfully created ${result.count} commits! ${result.note}`)
      } else {
        setCommitProgress(`Successfully created ${result.count} commits!`)
      }
      
      // Small delay to show success message
      setTimeout(() => {
        onUserSetup({ username, repository: repo.name })
      }, 2000)
      
    } catch (error) {
      setError(error.message)
      setLoading(false)
      setCreatingCommits(false)
      setCommitProgress('')
    }
  }

  const handleBack = () => {
    setStep(1)
    setRepositories([])
    setSelectedRepo(null)
    setError('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Auto Commits
        </h2>
        <p className="text-lg text-gray-600">
          Get 5 random commits daily from your favorite GitHub repository
        </p>
      </div>

      <div className="card max-w-2xl mx-auto">
        {step === 1 && (
          <div>
            <h3 className="text-xl font-semibold mb-6">Enter GitHub Username</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter GitHub username"
                    className="input-field pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchRepositories()}
                  />
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* GitHub Token Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="githubToken" className="block text-sm font-medium text-gray-700">
                    GitHub Personal Access Token
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowTokenInput(!showTokenInput)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {showTokenInput ? 'Hide' : 'Show'} Token Input
                  </button>
                </div>
                
                {showTokenInput && (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="password"
                        id="githubToken"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        placeholder="ghp_your_token_here"
                        className="input-field pl-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>• Required to create actual commits in your repository</p>
                      <p>• Token is stored locally in your browser</p>
                      <p>• Get token from: GitHub Settings → Developer settings → Personal access tokens</p>
                    </div>
                  </div>
                )}
                
                {!showTokenInput && githubToken && (
                  <div className="text-sm text-green-600">
                    ✓ Token configured (hidden for security)
                  </div>
                )}
                
                {!showTokenInput && !githubToken && (
                  <div className="text-sm text-orange-600">
                    ⚠ Token required to create commits
                  </div>
                )}
              </div>
              
              {/* Suggested Users Section */}
              {suggestedUsers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Recent usernames:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedUsers.map((suggestedUser) => (
                      <div
                        key={suggestedUser}
                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200 cursor-pointer group"
                      >
                        <span 
                          onClick={() => handleSuggestionClick(suggestedUser)}
                          className="mr-2"
                        >
                          {suggestedUser}
                        </span>
                        <button
                          onClick={() => removeFromSuggestions(suggestedUser)}
                          className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}
              
              <button
                onClick={handleSearchRepositories}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
                <span>{loading ? 'Searching...' : 'Search Repositories'}</span>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Select Repository</h3>
              <button
                onClick={handleBack}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                ← Back
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Found {repositories.length} repositories for <span className="font-medium">{username}</span>
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm mb-4">{error}</div>
            )}

            {creatingCommits && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">{commitProgress}</p>
                    <p className="text-xs text-blue-600 mt-1">Please wait while we create your commits...</p>
                  </div>
                  <GitCommit className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className={`border border-gray-200 rounded-lg p-4 transition-colors duration-200 cursor-pointer ${
                    creatingCommits ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => !creatingCommits && handleSelectRepository(repo)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{repo.name}</h4>
                      {repo.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {repo.language && (
                          <span className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                            {repo.language}
                          </span>
                        )}
                        <span className="flex items-center">
                          <Star className="h-4 w-4 mr-1" />
                          {repo.stargazers_count}
                        </span>
                        <span className="flex items-center">
                          <GitBranch className="h-4 w-4 mr-1" />
                          {repo.forks_count}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {loading && selectedRepo?.id === repo.id && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserSetup 