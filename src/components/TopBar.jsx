import { useState } from 'react'
import { Home, LayoutDashboard, Sparkles, FolderKanban, Menu, X, Beaker, FlaskConical, TestTube2, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import ProjectSwitcher from './ProjectSwitcher'
import UserMenu from './UserMenu'
import { useAuth } from '../context/AuthContext'

export default function TopBar() {
  const location = useLocation()
  const { currentProject } = useProject()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const isLobby = location.pathname === '/'
  const isDashboard = location.pathname === '/dashboard'

  const navItems = [
    {
      to: '/',
      label: 'Projects',
      icon: FolderKanban,
      emoji: '📂',
      active: isLobby,
      disabled: false,
      description: 'View all projects'
    },
    {
      to: '/dashboard',
      label: 'Experiments',
      icon: LayoutDashboard,
      emoji: '🧪',
      active: isDashboard,
      disabled: !currentProject,
      description: 'Manage experiments'
    }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 w-full h-16 md:h-20">
        {/* Glassmorphic Background with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.02] to-transparent" />
        </div>
        
        <div className="relative h-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between gap-3 md:gap-6">
          
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
            
            {/* Logo & Branding */}
            <Link
              to="/"
              className="flex items-center gap-2 md:gap-3 group select-none shrink-0 active:scale-95 transition-all"
            >
              {/* Animated Logo Icon */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-blue-900/30 group-hover:rotate-[8deg] group-hover:scale-105 transition-all duration-500 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <FlaskConical size={20} className="text-white relative z-10 group-hover:rotate-12 transition-transform duration-500" strokeWidth={2.5} />
                </div>
              </div>

              {/* Brand Text */}
              <div className="hidden sm:block">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg md:text-xl font-black tracking-tighter text-slate-900 group-hover:text-blue-600 transition-colors">
                    CRO
                  </span>
                  <span className="text-lg md:text-xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    LABS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em] leading-none">
                    Experiment Engine
                  </span>
                </div>
              </div>
            </Link>

            {/* Divider - Hidden on mobile */}
            <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />

            {/* Desktop Navigation Pills */}
            <nav className="hidden lg:flex bg-gradient-to-r from-slate-100/80 to-slate-50/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner backdrop-blur-sm">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300
                    ${item.disabled ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}
                    ${item.active 
                      ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10 scale-105' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 hover:scale-[1.02]'
                    }
                  `}
                >
                  {item.active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl" />
                  )}
                  <item.icon size={14} strokeWidth={2.5} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  <span className="relative z-10 text-base">{item.emoji}</span>
                </Link>
              ))}
            </nav>

            {/* Project Switcher - Always visible */}
            <div className="min-w-0 max-w-[180px] sm:max-w-[200px] md:max-w-xs flex-1">
              <div className="bg-slate-100/60 border border-slate-200/50 rounded-xl px-3 py-2 md:px-4 md:py-2.5 backdrop-blur-sm hover:bg-slate-100 transition-colors">
                <ProjectSwitcher />
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            
            {/* Divider */}
            <div className="hidden md:block h-8 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            
            {/* User Menu - Desktop */}
            <div className="hidden md:block hover:scale-105 transition-transform active:scale-95">
              <UserMenu />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200/50 text-slate-700 transition-all active:scale-95 shadow-sm"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          {/* Mobile Menu Panel */}
          <div 
            className="absolute top-16 md:top-20 right-0 left-0 mx-4 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/60 shadow-2xl shadow-slate-900/20 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-3">
              
              {/* Mobile User Section */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-200/50">
                <div className="shrink-0 hover:scale-105 transition-transform">
                  <UserMenu />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-blue-400 truncate">{user?.email?.split('@')[0]|| 'Member'}</div>
                  <div className="text-sm font-bold text-slate-900 truncate">{user?.email|| 'Member'}</div>
                  <div className="text-xs text-slate-500"></div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      relative flex items-center gap-3 p-4 rounded-xl transition-all duration-300
                      ${item.disabled ? 'opacity-30 pointer-events-none cursor-not-allowed' : ''}
                      ${item.active 
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-700 shadow-sm' 
                        : 'bg-slate-50/50 border border-slate-200/50 text-slate-600 hover:bg-slate-100 active:scale-[0.98]'
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      item.active 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-white border border-slate-200'
                    }`}>
                      <item.icon size={18} strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold">
                        {item.label}
                      </div>
                      <div className="text-xs opacity-60 truncate">
                        {item.description}
                      </div>
                    </div>
                    <span className="text-xl shrink-0">{item.emoji}</span>
                    {item.active && (
                      <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Mobile Quick Actions */}
              <div className="pt-3 border-t border-slate-200/60">
                <button 
                  className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-[0.98]"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    // Add your logout logic here
                    console.log('Logout clicked')
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}