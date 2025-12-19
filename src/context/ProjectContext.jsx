import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const ProjectContext = createContext()

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(true)

  // 1. Fetch Projects when User logs in
  useEffect(() => {
    if (user) {
      fetchProjects()
    } else {
      setProjects([])
      setCurrentProject(null)
      setLoading(false)
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // RLS Policy automatically filters this to only show YOUR projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProjects(data || [])
      
      // Auto-select the most recent project if none is active
      if (data?.length > 0 && !currentProject) {
        setCurrentProject(data[0])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      // Don't toast here to avoid spamming on login
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (name, domain) => {
    if (!user) return
    const toastId = toast.loading('Creating workspace...')

    try {
      // 1. Insert Project
      // We don't manually add members here. 
      // The Database TRIGGER 'on_project_created' does that for us automatically.
      const { data, error } = await supabase
        .from('projects')
        .insert([{ 
            name, 
            domain, 
            budget_total: 0, 
            created_by: user.id 
        }])
        .select()
        .single()

      if (error) throw error

      // 2. Update Local State immediately (Optimistic UI)
      setProjects([data, ...projects])
      setCurrentProject(data)
      
      toast.success(`Workspace "${name}" created!`, { id: toastId })
      return data

    } catch (error) {
      console.error('Create project error:', error)
      toast.error(error.message || 'Could not create project', { id: toastId })
      throw error
    }
  }

  const switchProject = (projectId) => {
    const project = projects.find((p) => p.id === projectId)
    if (project) {
      setCurrentProject(project)
      toast.success(`Switched to ${project.name}`, { 
        icon: '⚡',
        style: { background: '#334155', color: '#fff' }
      })
    }
  }

  const updateProjectDetails = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local list
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      if (currentProject?.id === id) setCurrentProject(data)
      
      toast.success('Project updated')
    } catch (error) {
      toast.error('Update failed')
    }
  }

  const value = {
    projects,
    currentProject,
    loading,
    createProject,
    switchProject,
    updateProjectDetails,
    refreshProjects: fetchProjects
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export const useProject = () => {
  return useContext(ProjectContext)
}