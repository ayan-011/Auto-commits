import React, { useState } from 'react'
import { Github, Search, Star, GitBranch, Calendar } from 'lucide-react'
import { fetchUserRepositories, saveUserPreference } from '../utils/api'

const UserSetup = ({ onUserSetup }) => {
  const [username, setUsername] = useState('')
  const [repositories, setRepositories] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: enter username, 2: select repository

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
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRepository = async (repo) => {
    setSelectedRepo(repo)
    setLoading(true)
    setError('')

    try {
      await saveUserPreference(username, repo.name)
      onUserSetup({ username, repository: repo.name })
    } catch (error) {
      setError(error.message)
      setLoading(false)
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
          Get 10 random commits daily from your favorite GitHub repository
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

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleSelectRepository(repo)}
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