import React from 'react'
import { Github, LogOut, RefreshCw } from 'lucide-react'

const Header = ({ currentUser, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Github className="h-8 w-8 text-gray-800" />
            <h1 className="text-2xl font-bold text-gray-900">Auto Commits</h1>
          </div>
          
          {currentUser && (
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentUser.username}</span>
                <span className="mx-2">•</span>
                <span>{currentUser.repository}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 