import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProjectSwitcher from './ProjectSwitcher'
import UserMenu from './UserMenu'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full h-16">
      {/* Glass Background */}
      <div
        className="
          absolute inset-0
          bg-white/60 backdrop-blur-2xl
          border-b border-white/40
          shadow-[0_1px_0_rgba(255,255,255,0.7)]
        "
      />

      <div className="relative h-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-4 md:gap-6">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-3 group select-none"
          >
            <div
              className="
                w-10 h-10 rounded-xl
                bg-gradient-to-br from-indigo-600 to-violet-600
                flex items-center justify-center
                shadow-lg shadow-indigo-500/30
                group-hover:scale-105 transition-transform
              "
            >
              <Layers size={18} className="text-white" />
            </div>

            <span
              className="
                text-lg font-bold tracking-tight text-slate-900
                group-hover:text-indigo-600 transition-colors
              "
            >
              Labs
            </span>
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-7 w-px bg-slate-200/70" />

          {/* Workspace Button */}
          <Link
            to="/"
            className="
              hidden md:flex items-center
              px-4 py-2 rounded-xl
              text-sm font-medium
              bg-slate-100/70 text-slate-700
              border border-slate-200
              hover:bg-slate-200/70
              transition-colors
            "
          >
            Workspace
          </Link>

          {/* Project Switcher */}
          <ProjectSwitcher />
        </div>

        {/* RIGHT */}
        <UserMenu />
      </div>
    </header>
  )
}
