import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, Save, Trash2, Plus, X, Target, Lightbulb,
  Zap, Calendar, Monitor, Smartphone, Sparkles, Layout,
  Type, DollarSign, Image as ImageIcon, PieChart, HelpCircle,
  AlertCircle, CheckCircle2, ChevronRight, MousePointerClick,
  ShieldCheck, FileText, Navigation, ListPlus
} from 'lucide-react'

// --- CONSTANTS ---
const CATEGORIES = [
  { value: 'Form Test', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  { value: 'Content Changes', icon: Layout, color: 'text-indigo-600 bg-indigo-50' },
  { value: 'Trust Value', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'Design Changes', icon: Sparkles, color: 'text-purple-600 bg-purple-50' },
  { value: 'Copy Changes', icon: Type, color: 'text-pink-600 bg-pink-50' },
  { value: 'Pricing Test', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
  { value: 'Navigation', icon: Navigation, color: 'text-slate-600 bg-slate-50' },
  { value: 'Other', icon: Zap, color: 'text-gray-600 bg-gray-50' }
]

const CHANNELS = ['Direct', 'Organic Search', 'Paid Search', 'Social', 'Email', 'Display']

export default function EditExperiment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null)
  
  // State for Arrays
  const [secondaryKPIs, setSecondaryKPIs] = useState([])
  const [tempKPI, setTempKPI] = useState('')
  const [selectedChannels, setSelectedChannels] = useState([])
  const [targetDevices, setTargetDevices] = useState([])

  // Variants State
  const [variants, setVariants] = useState([])

  // RHF for main fields
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      pie_potential: 5,
      pie_importance: 5,
      pie_ease: 5
    }
  })

  // Watch PIE for live calc (Visual only - DB calculates actual score)
  const pScore = watch('pie_potential')
  const iScore = watch('pie_importance')
  const eScore = watch('pie_ease')
  const pieScore = ((parseInt(pScore) + parseInt(iScore) + parseInt(eScore)) / 3).toFixed(1)

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: exp, error: expError } = await supabase.from('experiments').select('*').eq('id', id).single()
        if (expError) throw expError

        const { data: vars, error: varError } = await supabase.from('variants').select('*').eq('experiment_id', id).order('is_control', { ascending: false })
        if (varError) throw varError

        // Set Form Data
        reset({
          test_name: exp.test_name,
          test_category: exp.test_category,
          problem_statement: exp.problem_statement,
          hypothesis: exp.hypothesis,
          primary_kpi: exp.primary_kpi,
          page_url: exp.page_url,
          planned_start_date: exp.planned_start_date,
          planned_end_date: exp.planned_end_date,
          pie_potential: exp.pie_potential || 5,
          pie_importance: exp.pie_importance || 5,
          pie_ease: exp.pie_ease || 5,
        })

        // Set Array/Complex State
        setSecondaryKPIs(exp.secondary_kpis || [])
        setSelectedChannels(exp.traffic_channels || [])
        setTargetDevices(exp.devices || [])
        
        // Transform Variants: Split text description back into array for UI
        setVariants(vars.map(v => ({
          ...v,
          // If changes_description exists, split by newline to make array. Else empty array.
          changesList: v.changes_description ? v.changes_description.split('\n') : [] 
        })))

      } catch (error) {
        toast.error('Could not load experiment')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, navigate, reset])

  // --- HANDLERS ---
  const handleAddKPI = (e) => {
    if (e.key === 'Enter' && tempKPI.trim()) {
      e.preventDefault()
      if (!secondaryKPIs.includes(tempKPI.trim())) {
        setSecondaryKPIs([...secondaryKPIs, tempKPI.trim()])
      }
      setTempKPI('')
    }
  }

  const removeKPI = (kpi) => setSecondaryKPIs(secondaryKPIs.filter(k => k !== kpi))
  
  const toggleChannel = (c) => {
    setSelectedChannels(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const toggleDevice = (d) => {
    setTargetDevices(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  // --- VARIANT LOGIC ---
  const updateVariant = (index, field, value) => {
    const newVars = [...variants]
    newVars[index] = { ...newVars[index], [field]: value }
    setVariants(newVars)
  }

  // CHANGE LIST LOGIC (New Feature)
  const addChangeToVariant = (variantIndex) => {
    const newVars = [...variants]
    if (!newVars[variantIndex].changesList) newVars[variantIndex].changesList = []
    newVars[variantIndex].changesList.push("") // Add empty string
    setVariants(newVars)
  }

  const updateChangeItem = (variantIndex, changeIndex, value) => {
    const newVars = [...variants]
    newVars[variantIndex].changesList[changeIndex] = value
    setVariants(newVars)
  }

  const removeChangeItem = (variantIndex, changeIndex) => {
    const newVars = [...variants]
    newVars[variantIndex].changesList = newVars[variantIndex].changesList.filter((_, i) => i !== changeIndex)
    setVariants(newVars)
  }

  const addVariant = () => {
    setVariants([...variants, {
      id: `temp-${Date.now()}`,
      variant_name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      is_control: false,
      split_percentage: 0,
      target_url: '',
      changesList: [] // Start empty
    }])
  }

  const removeVariant = async (index) => {
    const v = variants[index]
    if (v.is_control) return toast.error("Cannot delete Control")
    
    if (!v.id.toString().startsWith('temp')) {
      if(!confirm("Delete variant permanently?")) return
      await supabase.from('variants').delete().eq('id', v.id)
    }
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleImageUpload = async (e, index, type) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(`${index}-${type}`)
    const toastId = toast.loading("Uploading...")

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage.from('variant-images').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('variant-images').getPublicUrl(filePath)
      updateVariant(index, type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', data.publicUrl)
      toast.success("Uploaded", { id: toastId })
    } catch (error) {
      toast.error("Upload failed", { id: toastId })
    } finally {
      setUploading(null)
    }
  }

  // --- SAVE ---
  const onSave = async (formData) => {
    setSaving(true)
    const toastId = toast.loading("Saving...")

    try {
      // 1. Update Experiment Table (REMOVED pie_score)
      const { error: expError } = await supabase
        .from('experiments')
        .update({
          ...formData,
          pie_potential: parseInt(formData.pie_potential),
          pie_importance: parseInt(formData.pie_importance),
          pie_ease: parseInt(formData.pie_ease),
          // pie_score is removed; DB generates it automatically
          secondary_kpis: secondaryKPIs,
          traffic_channels: selectedChannels,
          devices: targetDevices
        })
        .eq('id', id)

      if (expError) throw expError

      // 2. Upsert Variants Table
      await Promise.all(variants.map(async (v) => {
        // Flatten changesList back to string for DB
        const changesDescription = v.changesList ? v.changesList.filter(c => c.trim() !== '').join('\n') : ''

        const payload = {
          experiment_id: id,
          variant_name: v.variant_name,
          is_control: v.is_control,
          split_percentage: v.split_percentage,
          target_url: v.target_url,
          changes_description: changesDescription, // Saving as text block
          desktop_image_url: v.desktop_image_url,
          mobile_image_url: v.mobile_image_url
        }
        if (v.id.toString().startsWith('temp')) {
          await supabase.from('variants').insert(payload)
        } else {
          await supabase.from('variants').update(payload).eq('id', v.id)
        }
      }))

      toast.success("Saved successfully!", { id: toastId })
      navigate('/dashboard') 
    } catch (error) {
      console.error(error)
      toast.error(error.message, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Delete experiment? This cannot be undone.")) {
      await supabase.from('experiments').delete().eq('id', id)
      navigate('/dashboard')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-32 animate-in fade-in">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/40 border-b border-white/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2.5 rounded-xl bg-white/60 hover:bg-white/80 border border-white/60 transition-all shadow-sm">
                <ArrowLeft className="text-slate-700" size={20} />
              </button>
              <h1 className="text-xl font-black text-slate-900">Edit Experiment</h1>
            </div>
            
            <div className="flex gap-3">
              <button onClick={handleDelete} className="px-5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold transition-all flex items-center gap-2">
                <Trash2 size={18} /> Delete
              </button>
              <button onClick={handleSubmit(onSave)} disabled={saving} className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70">
                <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 grid lg:grid-cols-[2fr_1fr] gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          
          {/* Strategy Card */}
          <div className="glass-card p-8 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Target size={20} /></div>
              <h3 className="text-lg font-bold text-slate-800">Core Strategy</h3>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Test Name</label>
                  <input {...register('test_name', { required: true })} className="w-full glass-input px-4 py-3" placeholder="e.g. Homepage Hero V2" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Category</label>
                  <div className="relative">
                    <select {...register('test_category')} className="w-full glass-input px-4 py-3 appearance-none cursor-pointer">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-3.5 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Problem Statement</label>
                <textarea {...register('problem_statement')} rows={2} className="w-full glass-input px-4 py-3 resize-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hypothesis</label>
                <textarea {...register('hypothesis')} rows={3} className="w-full glass-input px-4 py-3 resize-none" />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Primary KPI</label>
                  <input {...register('primary_kpi')} className="w-full glass-input px-4 py-3" placeholder="e.g. Conversion Rate" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Main Page URL</label>
                  <input {...register('page_url')} className="w-full glass-input px-4 py-3" placeholder="https://example.com" />
                </div>
              </div>

              {/* Secondary KPIs */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Secondary KPIs</label>
                <div className="glass-input px-3 py-2 flex flex-wrap gap-2 items-center min-h-[50px]">
                  {secondaryKPIs.map(k => (
                    <span key={k} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-blue-100">
                      {k} <button onClick={() => removeKPI(k)}><X size={12}/></button>
                    </span>
                  ))}
                  <input 
                    value={tempKPI} onChange={e => setTempKPI(e.target.value)} onKeyDown={handleAddKPI}
                    className="bg-transparent outline-none text-sm flex-1 min-w-[60px]" placeholder="Type & Enter..." 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="glass-card p-8 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Sparkles size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Variants</h3>
              </div>
              <button onClick={addVariant} className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">+ Add Variant</button>
            </div>

            <div className="space-y-6">
              {variants.map((variant, idx) => (
                <div key={variant.id} className="bg-white/50 border border-slate-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
                  <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${variant.is_control ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-600'}`}>
                        {variant.is_control ? 'CONTROL' : 'VARIANT'}
                      </span>
                      <input 
                        value={variant.variant_name}
                        onChange={(e) => updateVariant(idx, 'variant_name', e.target.value)}
                        className="bg-transparent font-bold text-slate-800 outline-none focus:text-blue-600"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1">
                        <input 
                          type="number" 
                          value={variant.split_percentage}
                          onChange={(e) => updateVariant(idx, 'split_percentage', parseInt(e.target.value) || 0)}
                          className="w-8 text-right font-bold text-sm outline-none bg-transparent"
                        />
                        <span className="text-xs text-slate-400 font-bold ml-1">%</span>
                      </div>
                      {!variant.is_control && (
                        <button onClick={() => removeVariant(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {!variant.is_control && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Changes Made</label>
                            <button type="button" onClick={() => addChangeToVariant(idx)} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">
                              <Plus size={10} /> Add Change
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {(variant.changesList || []).map((change, cIdx) => (
                              <div key={cIdx} className="flex gap-2 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />
                                <input 
                                  value={change}
                                  onChange={(e) => updateChangeItem(idx, cIdx, e.target.value)}
                                  className="flex-1 text-sm bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                                  placeholder="Describe a change..."
                                />
                                <button onClick={() => removeChangeItem(idx, cIdx)} className="text-slate-300 hover:text-red-400">
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            {(variant.changesList || []).length === 0 && (
                              <p className="text-xs text-slate-400 italic">No specific changes listed.</p>
                            )}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Variant URL (Optional)</label>
                        <input 
                          value={variant.target_url || ''}
                          onChange={(e) => updateVariant(idx, 'target_url', e.target.value)}
                          className="w-full glass-input px-3 py-2 text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {['desktop', 'mobile'].map(type => (
                        <label key={type} className="block cursor-pointer group">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{type} Mockup</span>
                          <div className="aspect-square bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center hover:border-blue-400 transition-all overflow-hidden relative">
                            {variant[`${type}_image_url`] ? (
                              <img src={variant[`${type}_image_url`]} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center">
                                {uploading === `${idx}-${type}` ? <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"/> : <ImageIcon className="text-slate-300 mx-auto" size={20}/>}
                              </div>
                            )}
                            <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, idx, type)} disabled={!!uploading} />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* PIE Score */}
          <div className="glass-card p-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <PieChart size={20} className="text-emerald-500"/>
                <h3 className="font-bold text-slate-800">Priority Score</h3>
              </div>
              <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold">{pieScore}</span>
            </div>
            <div className="space-y-5">
              {['potential', 'importance', 'ease'].map(name => (
                <div key={name}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-600 uppercase">{name}</span>
                    <span className="text-blue-600">{watch(`pie_${name}`)}/10</span>
                  </div>
                  <input 
                    type="range" min="1" max="10" 
                    {...register(`pie_${name}`)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="glass-card p-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold"><Calendar size={20} className="text-amber-500"/> Planning</div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Planned Start</label>
                <input type="date" {...register('planned_start_date')} className="w-full glass-input px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Planned End</label>
                <input type="date" {...register('planned_end_date')} className="w-full glass-input px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          {/* Config */}
          <div className="glass-card p-6 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold"><Monitor size={20} className="text-slate-500"/> Configuration</div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Devices</label>
                <div className="flex gap-2">
                  {['Desktop', 'Mobile'].map(d => (
                    <button key={d} type="button" onClick={() => toggleDevice(d)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${targetDevices.includes(d) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Traffic Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button key={c} type="button" onClick={() => toggleChannel(c)} className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${selectedChannels.includes(c) ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .glass-card { box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05); }
        .glass-input { background: rgba(255, 255, 255, 0.5); border: 2px solid #e2e8f0; border-radius: 0.75rem; transition: all 0.2s; outline: none; }
        .glass-input:focus { border-color: #3b82f6; background: white; }
      `}</style>
    </div>
  )
}