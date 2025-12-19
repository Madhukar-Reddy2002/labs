// ============================================
// FILE: pages/EditExperiment.jsx
// ============================================

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, X, Loader
} from 'lucide-react'

// Import components
import BasicInfoSection from '../components/edit-experiment/BasicInfoSection'
import PIESection from '../components/edit-experiment/PIESection'
import TargetingSection from '../components/edit-experiment/TargetingSection'
import VariantsSection from '../components/edit-experiment/VariantsSection'

export default function EditExperiment() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    test_name: '',
    test_category: '',
    test_type: 'A/B Test',
    problem_statement: '',
    hypothesis: '',
    primary_kpi: '',
    secondary_kpis: [],
    pie_potential: 5,
    pie_importance: 5,
    pie_ease: 5,
    devices: [],
    traffic_channels: [],
    tags: [],
    page_url: '',
    planned_start_date: '',
    planned_end_date: ''
  })

  const [variants, setVariants] = useState([])

  useEffect(() => {
    fetchExperiment()
  }, [id])

  const fetchExperiment = async () => {
    try {
      setLoading(true)
      
      // Fetch experiment
      const { data: exp, error: expError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (expError) throw expError
      
      setFormData({
        test_name: exp.test_name || '',
        test_category: exp.test_category || '',
        test_type: exp.test_type || 'A/B Test',
        problem_statement: exp.problem_statement || '',
        hypothesis: exp.hypothesis || '',
        primary_kpi: exp.primary_kpi || '',
        secondary_kpis: exp.secondary_kpis || [],
        pie_potential: exp.pie_potential || 5,
        pie_importance: exp.pie_importance || 5,
        pie_ease: exp.pie_ease || 5,
        devices: exp.devices || [],
        traffic_channels: exp.traffic_channels || [],
        tags: exp.tags || [],
        page_url: exp.page_url || '',
        planned_start_date: exp.planned_start_date || '',
        planned_end_date: exp.planned_end_date || ''
      })

      // Fetch variants
      const { data: vars, error: varError } = await supabase
        .from('variants')
        .select('*')
        .eq('experiment_id', id)
        .order('is_control', { ascending: false })
      
      if (varError) throw varError
      setVariants(vars || [])

    } catch (error) {
      toast.error('Failed to load experiment')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    // Validation
    if (!formData.test_name.trim()) {
      toast.error('Test name is required')
      return
    }
    if (!formData.primary_kpi.trim()) {
      toast.error('Primary KPI is required')
      return
    }

    setSaving(true)
    const toastId = toast.loading('Saving changes...')

    try {
      // Calculate PIE score
      const pieScore = ((formData.pie_potential + formData.pie_importance + formData.pie_ease) / 3).toFixed(2)

      // Update experiment
      const { error: expError } = await supabase
        .from('experiments')
        .update({
          ...formData,
          pie_score: parseFloat(pieScore)
        })
        .eq('id', id)

      if (expError) throw expError

      // Update variants
      for (const variant of variants) {
        const { error: varError } = await supabase
          .from('variants')
          .update({
            variant_name: variant.variant_name,
            changes_description: variant.changes_description,
            split_percentage: variant.split_percentage
          })
          .eq('id', variant.id)

        if (varError) throw varError
      }

      toast.success('Changes saved successfully!', { id: toastId })
      navigate(`/experiment/${id}`)

    } catch (error) {
      toast.error('Failed to save changes', { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (confirm('Discard changes?')) {
      navigate(`/experiment/${id}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-32">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/40 border-b border-white/60 shadow-lg shadow-black/5">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="p-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 transition-all shadow-sm hover:shadow backdrop-blur-xl"
              >
                <ArrowLeft className="text-slate-700" size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Experiment</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Make changes to your test configuration</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 text-slate-700 font-bold transition-all text-sm flex items-center gap-2 backdrop-blur-xl shadow-sm disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all text-sm flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        
        <BasicInfoSection 
          formData={formData}
          setFormData={setFormData}
        />

        <PIESection 
          formData={formData}
          setFormData={setFormData}
        />

        <TargetingSection 
          formData={formData}
          setFormData={setFormData}
        />

        <VariantsSection 
          variants={variants}
          setVariants={setVariants}
        />

      </div>
    </div>
  )
}