import { Layers, Home } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import ProjectSwitcher from './ProjectSwitcher'
import UserMenu from './UserMenu'

export default function TopBar() {
  const location = useLocation()
  const isWorkspace = location.pathname === '/'

  return (
    <header className="w-full h-16 sm:h-18">
      {/* Neumorphic Background */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b from-slate-50 to-slate-100/50
          backdrop-blur-xl
          border-b border-slate-200/60
          shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(0,0,0,0.04)]
        "
      />
      <div className="relative h-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-6 min-w-0 flex-1">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group select-none shrink-0"
          >
            <div
              className="
                w-10 h-10 sm:w-11 sm:h-11 rounded-xl
                bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600
                flex items-center justify-center
                shadow-[0_4px_12px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                group-hover:shadow-[0_6px_16px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
                group-hover:scale-105 
                transition-all duration-200
              "
            >
              <Layers size={20} className="text-white drop-shadow-sm" />
            </div>
            <div className="hidden sm:block">
              <span
                className="
                  block text-lg font-bold tracking-tight 
                  bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent
                  group-hover:from-indigo-600 group-hover:to-violet-600 
                  transition-all duration-200
                "
              >
                CRO Labs
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wide">
                Experimentation Platform
              </span>
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent" />

          {/* Workspace Button - Neumorphic */}
          <Link
            to="/"
            className={`
              hidden lg:flex items-center gap-2
              px-4 py-2.5 rounded-xl
              text-sm font-semibold
              transition-all duration-200
              ${isWorkspace 
                ? 'bg-white text-indigo-600 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] border border-slate-200/50' 
                : 'bg-slate-100/50 text-slate-600 shadow-[2px_2px_5px_rgba(0,0,0,0.06),-2px_-2px_5px_rgba(255,255,255,0.9)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.9)] hover:text-indigo-600 border border-slate-200/30'
              }
            `}
          >
            <Home size={16} />
            <span>Workspace</span>
          </Link>

          {/* Project Switcher */}
          <div className="min-w-0 flex-1 lg:flex-initial max-w-xs">
            <ProjectSwitcher />
          </div>
        </div>

        {/* RIGHT */}
        <div className="shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}