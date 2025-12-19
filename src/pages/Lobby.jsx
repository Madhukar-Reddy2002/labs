import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProject } from '../context/ProjectContext'
import {
  Plus, Search, Calendar, FolderOpen, Users,
  Loader2, Globe, DollarSign, Activity,
  Settings, Trash2, UserPlus, X
} from 'lucide-react'
import toast from 'react-hot-toast'

import AddMemberModal from '../components/AddMemberModal'

/* ======================================================
   LOBBY
====================================================== */
export default function Lobby() {
  const { user } = useAuth()
  const { setCurrentProject } = useProject()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [inviteProject, setInviteProject] = useState(null)

  /* ---------------- Fetch Projects ---------------- */
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

  /* ---------------- CARD CLICK ---------------- */
  const handleProjectCardClick = (project) => {
    // 🔑 This MUST happen before navigation
    setCurrentProject(project)

    // 🔑 Explicit navigation (no conditions)
    navigate('/dashboard')
  }

  /* ---------------- GEAR CLICK ---------------- */
  const handleGearClick = (e, projectId) => {
    e.stopPropagation() // ⛔ stop card click
    navigate(`/project/${projectId}/settings`)
  }

  /* ---------------- DELETE ---------------- */
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

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Your Projects</h2>
            <p className="text-slate-500 mt-1 font-medium">
              Manage your optimization workspaces
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800"
          >
            <Plus size={20} /> New Project
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500"
          />
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-slate-300" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {filteredProjects.map(project => {
              const totalExp = project.experiments?.length || 0
              const liveExp = project.experiments?.filter(e => e.status === 'Running').length || 0
              const members = project.project_members?.[0]?.count || 1

              return (
                <div
                  key={project.id}
                  onClick={() => handleProjectCardClick(project)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer flex flex-col"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between mb-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <FolderOpen size={24} />
                      </div>

                      {/* Gear */}
                      <button
                        onClick={(e) => handleGearClick(e, project.id)}
                        className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg"
                      >
                        <Settings size={20} />
                      </button>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-1">
                      {project.name}
                    </h3>

                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Globe size={12} />
                      {project.domain || 'No domain'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-6 py-4 grid grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Experiments
                      </span>
                      <div className="flex items-center gap-2">
                        <Activity
                          size={16}
                          className={liveExp ? 'text-emerald-500' : 'text-slate-400'}
                        />
                        <span className="text-sm font-bold">
                          {liveExp}/{totalExp}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Budget
                      </span>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        <span className="text-sm font-bold">
                          {project.budget_total || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t flex justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Users size={14} /> {members} Members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Create Card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="min-h-[200px] rounded-2xl border-2 border-dashed flex items-center justify-center text-slate-400 hover:border-blue-400"
            >
              <Plus size={32} />
            </button>

          </div>
        )}
      </div>

      {/* Modals */}
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

/* ======================================================
   CREATE PROJECT MODAL (UNCHANGED)
====================================================== */
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4">
          <X size={20} />
        </button>

        <h2 className="text-xl font-black mb-4">New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full px-4 py-3 border rounded-xl"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  )
}
