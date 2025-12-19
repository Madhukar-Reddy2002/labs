import { useState, useRef, useEffect, useMemo } from 'react'
import { useProject } from '../context/ProjectContext'
import { ChevronDown, Check, Briefcase, Search, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProjectSwitcher() {
  const { projects, currentProject, switchProject } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, search])

  if (!currentProject && projects.length > 0) return null

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      {/* Trigger - Neumorphic */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group w-full sm:w-auto flex items-center gap-2 sm:gap-3 
          px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl
          bg-gradient-to-br from-slate-50 to-slate-100/80
          border border-slate-200/60
          shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.5)]
          hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
          active:shadow-[inset_3px_3px_8px_rgba(0,0,0,0.1),inset_-3px_-3px_8px_rgba(255,255,255,0.9)]
          transition-all duration-200
          relative overflow-hidden
        "
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-blue-500/0 to-purple-500/0 group-hover:from-indigo-500/5 group-hover:via-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
        
        <div className="
          relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl
          bg-gradient-to-br from-indigo-500 via-blue-500 to-violet-600
          flex items-center justify-center
          text-white 
          shadow-[0_4px_12px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]
          group-hover:shadow-[0_6px_16px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
          group-hover:scale-105 
          transition-all duration-200
        ">
          <Briefcase size={14} className="sm:w-4 sm:h-4" />
          {isOpen && (
            <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 animate-pulse" />
          )}
        </div>

        <div className="relative flex-1 sm:flex-initial text-left min-w-0">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Client
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1 truncate">
            <span className="truncate">{currentProject?.name}</span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown - Glass Neumorphic */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="
            absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-3 sm:mt-4 
            w-full sm:w-[360px] z-50
            rounded-2xl sm:rounded-3xl p-3 sm:p-4
            bg-gradient-to-br from-white/90 via-slate-50/85 to-white/90
            backdrop-blur-2xl
            border border-white/60
            shadow-[0_20px_60px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(0,0,0,0.03)]
            animate-in fade-in slide-in-from-top-2 duration-200
          ">
            {/* Header with gradient */}
            <div className="mb-3 sm:mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-indigo-500 to-blue-600" />
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Switch Client
                </div>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50/50 border border-indigo-100/50">
                <Sparkles size={10} className="text-indigo-500" />
                <span className="text-[10px] font-semibold text-indigo-600">{projects.length}</span>
              </div>
            </div>

            {/* Search - Neumorphic Input */}
            <div className="
              flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 mb-3 sm:mb-4
              rounded-xl sm:rounded-2xl
              bg-white/60 backdrop-blur-sm
              border border-slate-200/60
              shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]
              focus-within:shadow-[inset_2px_2px_6px_rgba(99,102,241,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
              focus-within:border-indigo-200
              transition-all duration-200
            ">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400 text-slate-700"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600 text-xs font-medium"
                >
                  Clear
                </button>
              )}
            </div>

            {/* List - Custom Scrollbar */}
            <div className="space-y-1.5 sm:space-y-2 max-h-[280px] sm:max-h-72 overflow-y-auto pr-1 custom-scrollbar">
              {filteredProjects.length === 0 && (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Search size={20} className="text-slate-300" />
                  </div>
                  <div className="text-xs font-medium text-slate-400">No clients found</div>
                  {search && (
                    <div className="text-[10px] text-slate-300 mt-1">Try a different search term</div>
                  )}
                </div>
              )}

              {filteredProjects.map((p) => {
                const active = currentProject?.id === p.id

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProject(p.id)
                      setIsOpen(false)
                      setSearch('')
                      navigate('/dashboard')
                    }}
                    className={`
                      group w-full flex items-center justify-between
                      px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl 
                      text-xs sm:text-sm font-semibold
                      transition-all duration-200
                      relative overflow-hidden
                      ${active
                        ? `
                          bg-gradient-to-br from-indigo-50 via-blue-50 to-violet-50
                          text-indigo-700
                          border border-indigo-200/60
                          shadow-[0_4px_16px_rgba(99,102,241,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]
                        `
                        : `
                          text-slate-600
                          bg-white/40
                          border border-transparent
                          hover:bg-white/70
                          hover:shadow-[2px_2px_8px_rgba(0,0,0,0.06),-1px_-1px_4px_rgba(255,255,255,0.9)]
                          hover:border-slate-200/40
                        `
                      }
                    `}
                  >
                    {/* Glow effect for active */}
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-blue-500/5 to-violet-500/5 animate-pulse" />
                    )}
                    
                    <span className="relative flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className={`
                        shrink-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full
                        transition-all duration-200
                        ${active 
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600 shadow-[0_0_8px_rgba(99,102,241,0.6)]' 
                          : 'bg-slate-300 group-hover:bg-slate-400'
                        }
                      `} />
                      <span className="truncate">{p.name}</span>
                    </span>

                    {active && (
                      <div className="relative shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
        }
      `}</style>
    </div>
  )
}