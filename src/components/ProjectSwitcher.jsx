import { useState, useRef, useEffect, useMemo } from 'react'
import { useProject } from '../context/ProjectContext'
import { ChevronDown, Check, Briefcase, Search } from 'lucide-react'
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
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          group flex items-center gap-3 px-4 py-2.5 rounded-2xl
          bg-white/30 backdrop-blur-xl
          border border-white/50
          shadow-[0_10px_30px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)]
          hover:bg-white/50 transition-all
        "
      >
        <div className="
          w-10 h-10 rounded-xl
          bg-gradient-to-br from-indigo-500 to-blue-600
          flex items-center justify-center
          text-white shadow-lg
          group-hover:scale-105 transition-transform
        ">
          <Briefcase size={16} />
        </div>

        <div className="hidden sm:block text-left">
          <div className="text-[10px] font-semibold text-slate-400 uppercase">
            Client
          </div>
          <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
            {currentProject?.name}
            <ChevronDown
              size={14}
              className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="
          absolute top-full left-0 mt-4 w-80 z-50
          rounded-3xl p-4
          bg-gradient-to-br from-white/80 to-white/40
          backdrop-blur-2xl
          border border-white/60
          shadow-[0_40px_80px_rgba(0,0,0,0.15)]
          animate-in fade-in slide-in-from-top-3 duration-200
        ">
          {/* Title */}
          <div className="mb-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Switch Client
            </div>
          </div>

          {/* Search */}
          <div className="
            flex items-center gap-2 px-4 py-2.5 mb-4
            rounded-2xl
            bg-white/70 backdrop-blur
            border border-slate-200
            shadow-inner
          ">
            <Search size={14} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          {/* List */}
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {filteredProjects.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                No clients found
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
                    navigate('/dashboard')
                  }}
                  className={`
                    group w-full flex items-center justify-between
                    px-4 py-3 rounded-2xl text-sm font-medium
                    transition-all
                    ${active
                      ? `
                        bg-gradient-to-r from-blue-50 to-indigo-50
                        text-blue-700
                        border border-blue-200
                        shadow-[0_8px_20px_rgba(59,130,246,0.25)]
                      `
                      : `
                        text-slate-600
                        hover:bg-white/70
                        hover:shadow-md
                      `
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <span className={`
                      w-3 h-3 rounded-full
                      ${active ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-300'}
                    `} />
                    {p.name}
                  </span>

                  {active && (
                    <Check size={14} className="text-blue-600" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
