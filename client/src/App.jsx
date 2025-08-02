import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import UserSetup from './components/UserSetup'
import CommitsDisplay from './components/CommitsDisplay'
import { getUserPreference } from './utils/api'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user has a saved preference
    const checkUserPreference = async () => {
      try {
        const storedUser = localStorage.getItem('currentUser')
        if (storedUser) {
          const user = JSON.parse(storedUser)
          const preference = await getUserPreference(user.username)
          if (preference) {
            setCurrentUser(user)
          } else {
            localStorage.removeItem('currentUser')
          }
        }
      } catch (error) {
        console.error('Error checking user preference:', error)
        localStorage.removeItem('currentUser')
      } finally {
        setLoading(false)
      }
    }

    checkUserPreference()
  }, [])

  const handleUserSetup = (user) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header currentUser={currentUser} onLogout={() => {
          setCurrentUser(null)
          localStorage.removeItem('currentUser')
        }} />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                currentUser ? (
                  <CommitsDisplay currentUser={currentUser} />
                ) : (
                  <UserSetup onUserSetup={handleUserSetup} />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 