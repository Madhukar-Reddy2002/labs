import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

// Layouts
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Lobby from './pages/Lobby'
import Dashboard from './pages/Dashboard'
import NewTest from './pages/NewTest'
import ExperimentDetails from './pages/ExperimentDetails'
import EditExperiment from './pages/EditExperiment'
import ProjectSettings from './pages/ProjectSettings'

export default function App() {
  const { user, sessionLoading } = useAuth()

  // 1. Loading State
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 gap-2">
        <Loader2 className="animate-spin" size={24} />
        <span className="font-bold text-sm">Loading CRO Lab...</span>
      </div>
    )
  }

  // 2. Unauthenticated State
  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Login />
      </>
    )
  }

  // 3. Authenticated App
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'glass-panel !bg-slate-900 !text-white !border-slate-700',
          duration: 4000,
        }}
      />
      
      <Layout>
        <Routes>
          {/* Main Views */}
          <Route path="/" element={<Lobby />} />
          
          {/* Project Specific Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId/settings" element={<ProjectSettings />} />
          
          {/* Creation & Editing */}
          <Route path="/newtest" element={<NewTest />} />
          
          {/* The Experiment Detail Views */}
          <Route path="/experiment/:id/edit" element={<EditExperiment />} />
          <Route path="/experiment/:id" element={<ExperimentDetails />} />
          
          {/* Fallback - Redirect unknown routes to Lobby */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}