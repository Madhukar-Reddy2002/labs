import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  X, Calendar, Link as LinkIcon, Trophy, Rocket, AlertTriangle, 
  Target, PauseCircle, CheckCircle2, AlertCircle, XCircle, MinusCircle 
} from 'lucide-react'

// --- SHARED: Glass Modal Wrapper ---
function ModalWrapper({ children, title, icon: Icon, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 shadow-sm">
              <Icon size={22} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// --- SHARED: Context Summary Card ---
function TestSummaryCard({ test }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 flex items-start gap-3">
      <div className="mt-1"><Target size={16} className="text-slate-400"/></div>
      <div>
        <h4 className="text-sm font-bold text-slate-900">{test.test_name}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            KPI: {test.primary_kpi}
          </span>
          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
            {test.test_category}
          </span>
        </div>
      </div>
    </div>
  )
}

// --- 1. LAUNCH MODAL (Running) ---
export function LaunchModal({ test, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit } = useForm({
    defaultValues: {
      actual_start_date: new Date().toISOString().split('T')[0],
      live_url: test.page_url || ''
    }
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const updates = {
        status: 'Running',
        actual_start_date: data.actual_start_date
      }
      if (data.live_url && data.live_url.trim() !== '') {
        updates.page_url = data.live_url
      }

      const { error } = await supabase.from('experiments').update(updates).eq('id', test.id)
      if (error) throw error
      
      toast.success('Experiment Launched! 🚀')
      onSuccess('Running')
    } catch (err) {
      toast.error('Launch failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title="Launch Experiment" icon={Rocket} onClose={onClose}>
      <TestSummaryCard test={test} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="date" required {...register('actual_start_date')}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium text-slate-700" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Live URL (Optional)</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="url" {...register('live_url')} placeholder="https://..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400" 
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2">
            {saving ? 'Launching...' : 'Confirm Launch'} <Rocket size={16} />
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}

// --- 2. PAUSE MODAL (Paused) ---
export function PauseModal({ test, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)

  const handlePause = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.from('experiments').update({ 
        status: 'Paused',
        actual_end_date: new Date().toISOString() 
      }).eq('id', test.id)
      
      if (error) throw error
      toast.success('Experiment Paused ⏸️')
      onSuccess('Paused')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalWrapper title="Pause Experiment" icon={PauseCircle} onClose={onClose}>
      <TestSummaryCard test={test} />
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          This will move the experiment to the <strong>Paused</strong> column. Use this for tests that are on hold or stopped without a final result.
        </p>
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-2">
          <AlertTriangle className="text-amber-600 shrink-0" size={18} />
          <p className="text-xs text-amber-800">You can restart this test later by moving it back to "Running".</p>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
          <button onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handlePause} disabled={saving} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all">
            {saving ? 'Pausing...' : 'Confirm Pause'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  )
}

// --- 3. COMPLETE MODAL (Completed) - CRO Logic ---
export function CompleteModal({ test, onClose, onSuccess }) {
  const [saving, setSaving] = useState(false)
  const [variants, setVariants] = useState([])
  const [loadingVars, setLoadingVars] = useState(true)
  
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      actual_end_date: new Date().toISOString().split('T')[0],
      outcome: 'Inconclusive',
      winner_variant_id: null
    }
  })

  const outcome = watch('outcome')

  // Load variants
  useEffect(() => {
    const fetchVariants = async () => {
      const { data, error } = await supabase
        .from('variants')
        .select('id, variant_name, is_control')
        .eq('experiment_id', test.id)
        .order('is_control', { ascending: false })
      
      if (!error) setVariants(data || [])
      setLoadingVars(false)
    }
    fetchVariants()
  }, [test.id])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // Logic: Only set winner if outcome is 'Winner'
      const winnerId = data.outcome === 'Winner' ? data.winner_variant_id : null
      
      // Validation
      if (data.outcome === 'Winner' && !winnerId) throw new Error("Please select the winning variant")

      const { error } = await supabase
        .from('experiments')
        .update({
          status: 'Completed',
          outcome: data.outcome,
          winner_variant_id: winnerId,
          actual_end_date: data.actual_end_date
        })
        .eq('id', test.id)

      if (error) throw error
      
      toast.success(data.outcome === 'Winner' ? 'Winner Declared! 🏆' : 'Experiment Concluded')
      onSuccess('Completed')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Filter variants: If "Winner", remove Control from the list.
  const displayVariants = outcome === 'Winner' 
    ? variants.filter(v => !v.is_control) // Only show Variants
    : variants

  return (
    <ModalWrapper title="Conclude Experiment" icon={Trophy} onClose={onClose}>
      <TestSummaryCard test={test} />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-3 text-slate-400" size={18} />
             <input 
               type="date" required {...register('actual_end_date')}
               className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium text-slate-700" 
             />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Outcome</label>
          <div className="relative">
            <select {...register('outcome')} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all font-medium text-slate-700 appearance-none cursor-pointer">
              <option value="Inconclusive">🤔 Inconclusive (No clear winner)</option>
              <option value="Winner">🏆 Winner (Variant Won)</option>
              <option value="Loser">📉 Loser (Control Won)</option>
            </select>
            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">▼</div>
          </div>
        </div>

        {/* WINNER SELECTOR (Only if 'Winner' selected) */}
        {outcome === 'Winner' && (
          <div className="animate-in fade-in slide-in-from-top-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy size={14} /> Select The Winner
            </label>
            
            {loadingVars ? (
              <div className="text-sm text-emerald-600 animate-pulse">Loading variants...</div>
            ) : displayVariants.length > 0 ? (
              <div className="grid gap-2 max-h-40 overflow-y-auto pr-1">
                {displayVariants.map(v => (
                  <label key={v.id} className="flex items-center gap-3 p-3 bg-white border border-emerald-100 rounded-xl cursor-pointer hover:border-emerald-400 hover:shadow-sm transition-all has-[:checked]:border-emerald-500 has-[:checked]:ring-1 has-[:checked]:ring-emerald-500 has-[:checked]:bg-emerald-50/50">
                    <input 
                      type="radio" 
                      value={v.id} 
                      {...register('winner_variant_id')}
                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                    />
                    <span className="font-bold text-slate-700 text-sm">{v.variant_name}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="text-sm text-red-500">No variants found to declare as winner.</div>
            )}
          </div>
        )}

        {/* LOSER MESSAGE */}
        {outcome === 'Loser' && (
           <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm text-red-700 flex items-start gap-2">
             <XCircle size={18} className="mt-0.5 shrink-0"/>
             <p>Marking as <strong>Loser</strong> implies the Control performed better, or the changes had a negative impact.</p>
           </div>
        )}

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
          <AlertTriangle className="text-amber-600 shrink-0" size={20} />
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            <strong>Tip:</strong> Ensure you update the final numbers in the Experiment Details page after saving.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2">
            {saving ? 'Saving...' : 'Complete Test'} <CheckCircle2 size={16} />
          </button>
        </div>
      </form>
    </ModalWrapper>
  )
}