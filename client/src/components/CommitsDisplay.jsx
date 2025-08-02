import React, { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink, Calendar, User, GitCommit } from 'lucide-react'
import { getDailyCommits, triggerFetch } from '../utils/api'

const CommitsDisplay = ({ currentUser }) => {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastFetched, setLastFetched] = useState(null)

  const fetchCommits = async () => {
    try {
      const data = await getDailyCommits(currentUser.username)
      setCommits(data)
      if (data.length > 0) {
        setLastFetched(data[0].fetched_at)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setError('')
    
    try {
      await triggerFetch(currentUser.username, currentUser.repository)
      await fetchCommits()
    } catch (error) {
      setError(error.message)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCommits()
  }, [currentUser])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateMessage = (message, maxLength = 100) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading commits...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Commits
          </h2>
          <p className="text-gray-600">
            {currentUser.username}/{currentUser.repository}
          </p>
          {lastFetched && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatDate(lastFetched)}
            </p>
          )}
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-primary flex items-center space-x-2"
        >
          {refreshing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{refreshing ? 'Refreshing...' : 'Refresh Now'}</span>
        </button>
      </div>

      {error && (
        <div className="card mb-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading commits</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {commits.length === 0 && !error ? (
        <div className="card text-center">
          <GitCommit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No commits found</h3>
          <p className="text-gray-600 mb-4">
            No commits have been fetched yet. Click "Refresh Now" to fetch the latest commits.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-primary"
          >
            {refreshing ? 'Fetching...' : 'Fetch Commits'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {commits.map((commit, index) => (
            <div key={commit.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {commit.commit_sha.substring(0, 7)}
                    </span>
                    <span className="text-sm text-gray-500">
                      #{commits.length - index}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {truncateMessage(commit.commit_message)}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {commit.author_name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(commit.commit_date)}
                    </span>
                  </div>
                </div>
                
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {commits.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            These commits are automatically refreshed daily at 9:00 AM UTC
          </p>
        </div>
      )}
    </div>
  )
}

export default CommitsDisplay 