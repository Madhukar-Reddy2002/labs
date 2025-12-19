import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Copy, Trash2, ExternalLink, Target,
  Trophy, Users, Activity, Percent, Edit
} from 'lucide-react'

// --- IMPORTS (Using your existing components) ---
import ImageLightbox from '../components/experiment-details/ImageLightbox'
import StatCard from '../components/experiment-details/StatCard'
import TimelineCard from '../components/experiment-details/TimelineCard'
import PIEScoreCard from '../components/experiment-details/PIEScoreCard'
import ResultsAccordion from '../components/experiment-details/ResultsAccordion'
import VariantImagesAccordion from '../components/experiment-details/VariantImagesAccordion'
import StrategyCard from '../components/experiment-details/StrategyCard'
import NotesCard from '../components/experiment-details/NotesCard'

export default function ExperimentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [test, setTest] = useState(null)
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    fetchExperimentData()
  }, [id])

  const fetchExperimentData = async () => {
    try {
      setLoading(true)
      
      // 1. Fetch Experiment
      const { data: exp, error: expError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .single()
      
      if (expError) throw expError
      setTest(exp)

      // 2. Fetch Variants
      const { data: vars, error: varError } = await supabase
        .from('variants')
        .select('*')
        .eq('experiment_id', id)
        .order('is_control', { ascending: false })
      
      if (varError) throw varError
      setVariants(vars)

    } catch (error) {
      console.error(error)
      toast.error('Could not load experiment data')
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Delete this experiment? This action cannot be undone.")) return
    
    try {
      await supabase.from('experiments').delete().eq('id', id)
      toast.success("Experiment deleted")
      navigate('/dashboard')
    } catch (error) {
      toast.error("Failed to delete")
    }
  }

  // Derived stats
  const totalSessions = variants.reduce((a, b) => a + (b.sessions || 0), 0)
  const totalConversions = variants.reduce((a, b) => a + (b.conversions || 0), 0)
  const avgConversionRate = totalSessions ? (totalConversions / totalSessions) * 100 : 0
  const winner = variants.find(v => v.uplift_percentage > 0 && !v.is_control)
  
  // Calculate PIE score safely
  const pieScore = test 
    ? (( (test.pie_potential || 0) + (test.pie_importance || 0) + (test.pie_ease || 0) ) / 3).toFixed(1) 
    : 0

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

  if (!test) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-32 animate-in fade-in">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/40 border-b border-white/60 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Back button and Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 transition-all shadow-sm hover:shadow backdrop-blur-xl"
              >
                <ArrowLeft className="text-slate-700" size={20} />
              </button>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{test.test_name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-xl flex items-center gap-1.5 border ${
                    test.status === 'Running' 
                      ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200/50' 
                      : test.status === 'Completed' 
                      ? 'bg-blue-100/80 text-blue-700 border-blue-200/50' 
                      : 'bg-slate-100/80 text-slate-700 border-slate-200/50'
                  }`}>
                    {test.status === 'Running' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>}
                    {test.status}
                  </span>
                </div>
                
                <div className="flex gap-4 mt-1 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Target size={12} className="text-blue-500" />
                    {test.primary_kpi}
                  </div>
                  {test.page_url && (
                    <a href={test.page_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                      <ExternalLink size={12} /> View Page
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action buttons */}
            <div className="flex gap-2">
              
              {/* --- EDIT BUTTON ADDED HERE --- */}
              <button 
                onClick={() => navigate(`/experiment/${id}/edit`)}
                className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 text-slate-700 font-bold transition-all text-sm flex items-center gap-2 backdrop-blur-xl shadow-sm hover:shadow-md"
              >
                <Edit size={14} /> Edit
              </button>

              <button 
                onClick={() => navigate(`/newtest?clone=${id}`)}
                className="px-4 py-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 text-slate-700 font-bold transition-all text-sm flex items-center gap-2 backdrop-blur-xl shadow-sm hover:shadow-md"
              >
                <Copy size={14} /> Duplicate
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-white/60 hover:bg-red-50/80 border border-white/60 text-red-600 font-bold transition-all text-sm flex items-center gap-2 backdrop-blur-xl shadow-sm hover:shadow-md"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Stats Overview Cards */}
      {totalSessions > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
              icon={Users} 
              label="Total Sessions" 
              value={totalSessions.toLocaleString()} 
              color="blue"
            />
            <StatCard 
              icon={Activity} 
              label="Conversions" 
              value={totalConversions.toLocaleString()} 
              color="green"
            />
            <StatCard 
              icon={Percent} 
              label="Avg. Conversion Rate" 
              value={`${avgConversionRate.toFixed(2)}%`} 
              color="purple"
            />
            <StatCard 
              icon={Trophy} 
              label="Best Performer" 
              value={winner ? winner.variant_name : 'Control'} 
              change={winner?.uplift_percentage?.toFixed(1)}
              color="amber"
            />
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Results and Images */}
        <div className="lg:col-span-2 space-y-6">
          <ResultsAccordion 
            variants={variants} 
            setVariants={setVariants}
            experimentId={id}
          />
          
          <VariantImagesAccordion 
            variants={variants}
            setVariants={setVariants}
            projectId={test.project_id}
            setLightbox={setLightbox}
          />
        </div>

        {/* Right Column - Sidebar cards */}
        <div className="space-y-6">
          <TimelineCard test={test} />
          <PIEScoreCard test={test} pieScore={pieScore} />
          <StrategyCard test={test} />
          <NotesCard experimentId={id} />
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {lightbox && <ImageLightbox src={lightbox.src} onClose={() => setLightbox(null)} />}
    </div>
  )
}