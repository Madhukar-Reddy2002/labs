import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../context/ProjectContext'
import { LogOut, User, ChevronDown } from 'lucide-react'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const { currentProject, projects, setCurrentProject } = useProject()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showProjectMenu, setShowProjectMenu] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-white/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">iQ</span>
              </div>
              <span className="font-black text-xl text-slate-800">CRO Platform</span>
            </div>
          </div>
          {/* Navigation Links */}
<div className="flex items-center gap-6">
  <button
    onClick={() => navigate('/dashboard')}
    className="text-slate-700 hover:text-slate-900 font-semibold"
  >
    Dashboard
  </button>
  <button
    onClick={() => navigate('/projects')}
    className="text-slate-700 hover:text-slate-900 font-semibold"
  >
    Projects
  </button>
</div>

          {/* Project Selector */}
          {currentProject && (
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <span className="font-semibold text-slate-800">{currentProject.project_name}</span>
                <ChevronDown size={16} className="text-slate-600" />
              </button>

              {showProjectMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowProjectMenu(false)} />
                  <div className="absolute right-0 top-12 z-20 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2">
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          setCurrentProject(project)
                          setShowProjectMenu(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors ${
                          currentProject.id === project.id ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        {project.project_name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                {profile?.full_name || user?.email}
              </span>
              <ChevronDown size={16} className="text-slate-600" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-12 z-20 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{profile?.full_name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}