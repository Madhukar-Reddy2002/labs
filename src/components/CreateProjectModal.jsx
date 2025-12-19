import { useState } from 'react'
import { X, Loader } from 'lucide-react'
import { useProject } from '../context/ProjectContext'

export default function CreateProjectModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    project_name: '',
    client_name: '',
    description: '',
    base_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { createProject } = useProject()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: createError } = await createProject(formData)

    if (createError) {
      setError(createError.message)
      setLoading(false)
    } else {
      // Success!
      setFormData({ project_name: '', client_name: '', description: '', base_url: '' })
      setLoading(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-2xl font-black text-slate-800">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="e.g., Nike.com CRO 2024"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g., Nike"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Base URL */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.base_url}
                onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this project about?"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-700 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.project_name}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Creating...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}