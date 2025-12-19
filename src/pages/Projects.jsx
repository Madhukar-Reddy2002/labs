import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { Plus, Settings, Users, FolderOpen, Trash2 } from 'lucide-react'
import CreateProjectModal from '../components/CreateProjectModal'

export default function Projects() {
  const { projects, loading, fetchProjects, setCurrentProject } = useProject()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  const handleSelectProject = (project) => {
    setCurrentProject(project)
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-800 mb-2">Projects</h1>
              <p className="text-slate-600">Manage your CRO workspaces</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center py-20">
              <FolderOpen size={64} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6">Create your first project to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={() => handleSelectProject(project)}
                  onEdit={() => navigate(`/projects/${project.id}/settings`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  )
}

function ProjectCard({ project, onSelect, onEdit }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all group cursor-pointer">
      <div onClick={onSelect}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-lg">
              {project.project_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Settings size={16} className="text-slate-500" />
          </button>
        </div>

        <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-1">
          {project.project_name}
        </h3>
        <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
          {project.description || 'No description'}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Users size={14} />
            {/* We'll add member count later */}
            Members
          </span>
          <span>{project.total_experiments || 0} tests</span>
        </div>
      </div>

      <button
        onClick={onSelect}
        className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
      >
        Open Project
      </button>
    </div>
  )
}