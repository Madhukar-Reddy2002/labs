import { useState, useRef, useEffect, useMemo } from 'react'
import { useProject } from '../context/ProjectContext'
import { ChevronDown, Check, Briefcase, Search, Sparkles, Plus, TrendingUp, Clock, FlaskConical } from 'lucide-react'
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
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.domain?.toLowerCase().includes(search.toLowerCase())
    )
  }, [projects, search])

  if (!currentProject && projects.length > 0) return null

  return (
    <div ref={menuRef} className="relative w-full">
      {/* Trigger Button - Enhanced Glassmorphic */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group w-full flex items-center gap-2 sm:gap-3 
          px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl
          bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90
          border border-slate-200/60
          shadow-[2px_2px_8px_rgba(0,0,0,0.08),-2px_-2px_8px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.6)]
          hover:shadow-[inset_2px_2px_8px_rgba(0,0,0,0.08),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
          active:shadow-[inset_3px_3px_10px_rgba(0,0,0,0.12),inset_-3px_-3px_10px_rgba(255,255,255,0.9)]
          transition-all duration-300
          relative overflow-hidden
          hover:border-blue-200/60
        "
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
        
        {/* Icon with glow */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="
            relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl
            bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600
            flex items-center justify-center
            text-white 
            shadow-[0_4px_12px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
            group-hover:shadow-[0_6px_20px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]
            group-hover:scale-110
            transition-all duration-300
          ">
            <Briefcase size={14} className="sm:w-[18px] sm:h-[18px] group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
            {isOpen && (
              <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-white/20 animate-pulse" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="relative flex-1 text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              Active Client
            </div>
            {currentProject && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </div>
          <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
            <span className="truncate flex-1">
              {currentProject?.name || 'Select Project'}
            </span>
            <ChevronDown
              size={14}
              className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`}
              strokeWidth={2.5}
            />
          </div>
        </div>
      </button>

      {/* Dropdown Panel - Wider & Enhanced */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px] animate-in fade-in duration-200" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="
            absolute top-full left-0 right-0 sm:left-0 sm:right-auto mt-3 sm:mt-4 
            w-full  z-50
            rounded-2xl sm:rounded-3xl p-4 sm:p-5
            bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
            backdrop-blur-2xl
            border border-white/80
            shadow-[0_24px_72px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9),0_0_0_1px_rgba(0,0,0,0.05)]
            animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-300
          ">
            
            {/* Header with Stats */}
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 shadow-lg shadow-blue-500/30" />
                  <div className="text-sm font-black text-slate-700 uppercase tracking-wide">
                    Client Dashboard
                  </div>
                </div>
                
                {/* Project Count Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm">
                  <Sparkles size={12} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-700">{projects.length}</span>
                  <span className="text-[10px] font-semibold text-blue-600/70">Clients</span>
                </div>
              </div>

              {/* Quick Stats */}
              {currentProject && (
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock size={10} />
                    <span>Active now</span>
                  </div>
                  {currentProject.domain && (
                    <>
                      <span>•</span>
                      <span className="truncate">{currentProject.domain}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Search Bar - Enhanced */}
            <div className="relative mb-4">
              <div className="
                flex items-center gap-3 px-4 py-3 sm:py-3.5
                rounded-xl sm:rounded-2xl
                bg-white/70 backdrop-blur-sm
                border border-slate-200/80
                shadow-[inset_2px_2px_6px_rgba(0,0,0,0.08),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                focus-within:shadow-[inset_2px_2px_8px_rgba(59,130,246,0.15),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                focus-within:border-blue-300
                focus-within:bg-white/90
                transition-all duration-300
                group
              ">
                <Search size={16} className="text-slate-400 group-focus-within:text-blue-500 transition-colors shrink-0" strokeWidth={2.5} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or domain..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 text-slate-700 font-medium"
                  autoFocus
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-all shrink-0"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Projects List - Enhanced Scrollbar */}
            <div className="space-y-2 max-h-[320px] sm:max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Empty State */}
              {filteredProjects.length === 0 && (
                <div className="py-16 text-center">
                  <div className="w-20 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner">
                    <Search size={24} className="text-slate-300" />
                  </div>
                  <div className="text-sm font-bold text-slate-500 mb-1">No clients found</div>
                  {search && (
                    <div className="text-xs text-slate-400">Try adjusting your search</div>
                  )}
                </div>
              )}

              {/* Project Items */}
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
                      group/item w-full flex items-center justify-between gap-3
                      px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl 
                      text-sm font-semibold
                      transition-all duration-300
                      relative overflow-hidden
                      ${active
                        ? `
                          bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50
                          text-blue-700
                          border border-blue-200/80
                          shadow-[0_4px_20px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.9)]
                          scale-[1.02]
                        `
                        : `
                          text-slate-600
                          bg-white/50
                          border border-slate-200/40
                          hover:bg-white/80
                          hover:shadow-[2px_2px_12px_rgba(0,0,0,0.08),-1px_-1px_6px_rgba(255,255,255,0.9)]
                          hover:border-slate-300/60
                          hover:scale-[1.01]
                          active:scale-[0.99]
                        `
                      }
                    `}
                  >
                    {/* Active glow effect */}
                    {active && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-violet-500/10 animate-pulse" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent" />
                      </>
                    )}
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-3 min-w-0 flex-1">
                      {/* Status indicator */}
                      <div className="relative shrink-0">
                        <div className={`
                          w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full
                          transition-all duration-300
                          ${active 
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_12px_rgba(59,130,246,0.7)]' 
                            : 'bg-slate-300 group-hover/item:bg-slate-400 group-hover/item:shadow-[0_0_8px_rgba(148,163,184,0.5)]'
                          }
                        `} />
                        {active && (
                          <div className="absolute inset-0 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500 animate-ping opacity-50" />
                        )}
                      </div>

                      {/* Project info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-bold truncate text-sm sm:text-base">
                          {p.name}
                        </div>
                        {p.domain && (
                          <div className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5 font-medium">
                            {p.domain}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Active check badge */}
                    {active && (
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg blur-sm opacity-40" />
                        <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* Hover arrow indicator */}
                    {!active && (
                      <ChevronDown 
                        size={16} 
                        className="shrink-0 -rotate-90 text-slate-300 group-hover/item:text-slate-500 group-hover/item:translate-x-1 transition-all" 
                      />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Footer CTA */}
            <div className="mt-4 pt-4 border-t border-slate-200/60">
              <button
                onClick={() => {
                  setIsOpen(false)
                  navigate('/')
                }}
                className="
                  w-full flex items-center justify-center gap-2
                  px-4 py-3 rounded-xl
                  bg-gradient-to-r from-blue-50 to-indigo-50
                  hover:from-blue-100 hover:to-indigo-100
                  border border-blue-200/60
                  text-blue-700 font-bold text-sm
                  shadow-sm hover:shadow-md
                  transition-all duration-300
                  group/cta
                  active:scale-[0.98]
                "
              >
                <Plus size={16} className="group-hover/cta:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
                <span>Create New Client</span>
                <TrendingUp size={14} className="opacity-60 group-hover/cta:opacity-100 group-hover/cta:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(to bottom, transparent, rgba(226, 232, 240, 0.3), transparent);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #cbd5e1, #94a3b8);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #94a3b8, #64748b);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  )
}