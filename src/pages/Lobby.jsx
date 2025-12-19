import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../context/ProjectContext'
import {
  Plus, Search, Calendar, FolderOpen, Users,
  Loader2, Globe, DollarSign, Activity,
  Settings, Trash2, UserPlus, X, Sparkles, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

import AddMemberModal from '../components/AddMemberModal'

export default function Lobby() {
  const { user } = useAuth()
  const { setCurrentProject } = useProject()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteProject, setInviteProject] = useState(null)

  useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members(count),
          experiments(status)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCardClick = (project) => {
    setCurrentProject(project)
    navigate('/dashboard')
  }

  const handleGearClick = (e, projectId) => {
    e.stopPropagation()
    navigate(`/project/${projectId}/settings`)
  }

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation()
    if (!confirm('Are you sure? This will delete the project permanently.')) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      toast.success('Project deleted')
      fetchProjects()
    } catch {
      toast.error('Delete failed')
    }
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className=" min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Header - Glassmorphic */}
        <div className=" flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-0 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Sparkles size={20} className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                Your Workspace
              </h2>
            </div>
            <p className="text-slate-500 text-sm sm:text-base font-medium ml-0 sm:ml-13">
              Manage your Clients
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="
              w-full sm:w-auto
              group relative px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl 
              font-bold text-sm sm:text-base flex items-center justify-center gap-2 
              bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
              text-white
              shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
              hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
              hover:scale-[1.02]
              active:scale-[0.98]
              transition-all duration-200
              overflow-hidden
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 via-indigo-600/20 to-indigo-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Plus size={20} className="relative" />
            <span className="relative">New Project</span>
          </button>
        </div>

        {/* Search - Neumorphic */}
        <div className="relative mb-8 sm:mb-10">
          <div className="
            relative flex items-center
            bg-gradient-to-br from-slate-50 to-white
            rounded-xl sm:rounded-2xl
            border border-slate-200/60
            shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
            focus-within:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
            focus-within:border-indigo-200
            transition-all duration-200
          ">
            <Search className="absolute left-4 sm:left-5 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-11 sm:pl-14 pr-4 py-3 sm:py-4 bg-transparent rounded-xl sm:rounded-2xl outline-none text-sm sm:text-base text-slate-700 placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 text-slate-400 hover:text-slate-600 text-xs sm:text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
              <Loader2 className="relative animate-spin text-indigo-600" size={40} />
            </div>
            <p className="mt-4 text-sm font-medium text-slate-400">Loading projects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

            {filteredProjects.map(project => {
              const totalExp = project.experiments?.length || 0
              const liveExp = project.experiments?.filter(e => e.status === 'Running').length || 0
              const members = project.project_members?.[0]?.count || 1

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectCardClick(project)}
                  className="
                    group relative
                    bg-gradient-to-br from-white/80 via-white/90 to-white/80
                    backdrop-blur-sm
                    rounded-2xl sm:rounded-3xl 
                    border border-slate-200/60
                    shadow-[2px_2px_8px_rgba(0,0,0,0.06),-2px_-2px_8px_rgba(255,255,255,0.9)]
                    hover:shadow-[4px_4px_16px_rgba(99,102,241,0.15),-2px_-2px_12px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.8)]
                    hover:border-indigo-200
                    hover:scale-[1.02]
                    transition-all duration-300
                    cursor-pointer 
                    flex flex-col
                    overflow-hidden
                  "
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-blue-500/0 to-violet-500/0 group-hover:from-indigo-500/5 group-hover:via-blue-500/5 group-hover:to-violet-500/5 transition-all duration-300 rounded-3xl" />

                  {/* Header */}
                  <div className="relative p-5 sm:p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="
                        p-3 sm:p-3.5 
                        bg-gradient-to-br from-indigo-50 to-blue-50 
                        text-indigo-600 
                        rounded-xl sm:rounded-2xl
                        shadow-[inset_0_2px_8px_rgba(99,102,241,0.1)]
                        group-hover:shadow-[inset_0_2px_12px_rgba(99,102,241,0.15),0_4px_12px_rgba(99,102,241,0.2)]
                        group-hover:scale-110
                        transition-all duration-300
                      ">
                        <FolderOpen size={22} className="sm:w-6 sm:h-6" />
                      </div>

                      <button
                        onClick={(e) => handleGearClick(e, project.id)}
                        className="
                          p-2 
                          text-slate-400 
                          hover:text-slate-700
                          rounded-lg sm:rounded-xl
                          hover:bg-slate-100/80
                          hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]
                          transition-all duration-200
                        "
                      >
                        <Settings size={18} className="sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 mb-1.5 sm:mb-2 truncate group-hover:text-indigo-700 transition-colors">
                      {project.name}
                    </h3>

                    <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 truncate">
                      <Globe size={12} className="shrink-0" />
                      <span className="truncate">{project.domain || 'No domain'}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="
                    relative px-5 sm:px-6 py-3 sm:py-4 
                    grid grid-cols-2 gap-3 sm:gap-4 
                    border-t border-slate-200/60 
                    bg-gradient-to-br from-slate-50/50 to-white/50
                    mt-auto
                  ">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Experiments
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Activity
                          size={14}
                          className={liveExp ? 'text-emerald-500' : 'text-slate-400'}
                        />
                        <span className="text-sm sm:text-base font-bold text-slate-800">
                          {liveExp}/{totalExp}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Budget
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <DollarSign size={14} className="text-slate-600" />
                        <span className="text-sm sm:text-base font-bold text-slate-800">
                          {project.budget_total || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="
                    relative px-5 sm:px-6 py-3 
                    border-t border-slate-200/60 
                    flex flex-col xs:flex-row justify-between gap-2 xs:gap-0
                    text-xs text-slate-500
                    bg-gradient-to-br from-white/50 to-slate-50/30
                  ">
                    <div className="flex items-center gap-1.5">
                      <Users size={13} className="shrink-0" /> 
                      <span className="font-medium">{members} Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="shrink-0" />
                      <span className="font-medium">{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Create Card - Neumorphic Dashed */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="
                group
                min-h-[280px] sm:min-h-[320px]
                rounded-2xl sm:rounded-3xl 
                border-2 border-dashed border-slate-300
                bg-gradient-to-br from-slate-50/50 to-white/50
                hover:border-indigo-400
                hover:bg-gradient-to-br hover:from-indigo-50/30 hover:to-blue-50/30
                shadow-[inset_2px_2px_6px_rgba(0,0,0,0.03),inset_-2px_-2px_6px_rgba(255,255,255,0.5)]
                hover:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.08),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                transition-all duration-300
                flex flex-col items-center justify-center gap-3
              "
            >
              <div className="
                w-14 h-14 sm:w-16 sm:h-16 
                rounded-2xl
                bg-gradient-to-br from-slate-100 to-slate-50
                border border-slate-200
                flex items-center justify-center
                text-slate-400 group-hover:text-indigo-500
                shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]
                group-hover:shadow-[inset_2px_2px_6px_rgba(99,102,241,0.1),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                group-hover:scale-110
                transition-all duration-300
              ">
                <Plus size={28} className="sm:w-8 sm:h-8" />
              </div>
              <span className="text-sm font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors">
                Create New Project
              </span>
            </button>

          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchProjects()
          }}
        />
      )}

      {inviteProject && (
        <AddMemberModal
          projectId={inviteProject}
          onClose={() => setInviteProject(null)}
          onMemberAdded={fetchProjects}
        />
      )}
    </div>
  )
}

function CreateProjectModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name) return toast.error('Project name required')

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, created_by: user.id })
        .select()
        .single()

      if (error) throw error

      await supabase.from('project_members').insert({
        project_id: data.id,
        user_id: user.id,
        email: user.email,
        role: 'owner',
        status: 'active'
      })

      toast.success('Project created')
      onSuccess()
    } catch {
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="
          bg-gradient-to-br from-white via-slate-50/50 to-white
          rounded-2xl sm:rounded-3xl 
          p-6 sm:p-8 
          w-full max-w-md 
          relative
          border border-slate-200/60
          shadow-[0_20px_60px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.8)]
          animate-in fade-in zoom-in-95 duration-200
        ">
          <button 
            onClick={onClose} 
            className="
              absolute top-4 right-4 sm:top-5 sm:right-5
              p-2 rounded-xl
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100/80
              hover:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]
              transition-all duration-200
            "
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles size={22} className="text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">New Project</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Project Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter project name..."
                className="
                  w-full px-4 py-3 sm:py-3.5
                  bg-gradient-to-br from-slate-50 to-white
                  border border-slate-200/60
                  rounded-xl sm:rounded-2xl
                  text-sm sm:text-base
                  shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                  focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                  focus:border-indigo-200
                  outline-none
                  transition-all duration-200
                "
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3 sm:py-3.5 
                bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
                text-white 
                rounded-xl sm:rounded-2xl 
                font-bold text-sm sm:text-base
                shadow-[0_4px_16px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
                hover:shadow-[0_6px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}