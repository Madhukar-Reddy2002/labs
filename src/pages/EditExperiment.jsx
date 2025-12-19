import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  ArrowLeft, Save, Trash2, Plus, X, Target, Calendar, Monitor, 
  Sparkles, Layout, Type, DollarSign, Image as ImageIcon, PieChart,
  ChevronRight, ShieldCheck, FileText, Navigation, Zap, ListPlus,
  AlertCircle, CheckCircle2, Info, TrendingUp, Copy, Eye
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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // State for Arrays
  const [secondaryKPIs, setSecondaryKPIs] = useState(['Click-through Rate', 'Time on Page'])
  const [tempKPI, setTempKPI] = useState('')
  const [selectedChannels, setSelectedChannels] = useState(['Direct', 'Organic Search'])
  const [targetDevices, setTargetDevices] = useState(['Desktop', 'Mobile'])

  // Variants State
  const [variants, setVariants] = useState([
    {
      id: '1',
      variant_name: 'Control',
      is_control: true,
      split_percentage: 50,
      target_url: 'https://example.com',
      changesList: [],
      desktop_image_url: '',
      mobile_image_url: ''
    },
    {
      id: '2',
      variant_name: 'Variant A',
      is_control: false,
      split_percentage: 50,
      target_url: 'https://example.com/variant-a',
      changesList: ['Updated hero CTA copy', 'Added trust badges', 'New color scheme'],
      desktop_image_url: '',
      mobile_image_url: ''
    }
  ])

  // RHF for main fields
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      test_name: 'Homepage Hero Optimization',
      test_category: 'Design Changes',
      problem_statement: 'Current homepage has low conversion rate and high bounce rate',
      hypothesis: 'By improving the hero section clarity and adding trust signals, we will increase conversions by 15%',
      primary_kpi: 'Conversion Rate',
      page_url: 'https://example.com',
      planned_start_date: '2025-01-15',
      planned_end_date: '2025-02-15',
      pie_potential: 8,
      pie_importance: 7,
      pie_ease: 6
    }
  })

  // Watch PIE for live calc
  const pScore = watch('pie_potential')
  const iScore = watch('pie_importance')
  const eScore = watch('pie_ease')
  const pieScore = ((parseInt(pScore) + parseInt(iScore) + parseInt(eScore)) / 3).toFixed(1)

  // Get priority level
  const getPriorityLevel = (score) => {
    if (score >= 8) return { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' }
    if (score >= 6) return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' }
    if (score >= 4) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    return { label: 'Low', color: 'text-slate-600 bg-slate-50 border-slate-200' }
  }

  const priority = getPriorityLevel(pieScore)

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

  const addChangeToVariant = (variantIndex) => {
    const newVars = [...variants]
    if (!newVars[variantIndex].changesList) newVars[variantIndex].changesList = []
    newVars[variantIndex].changesList.push("")
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
      variant_name: `Variant ${String.fromCharCode(65 + variants.filter(v => !v.is_control).length)}`,
      is_control: false,
      split_percentage: 0,
      target_url: '',
      changesList: []
    }])
  }

  const removeVariant = (index) => {
    const v = variants[index]
    if (v.is_control) return alert("Cannot delete Control")
    if (confirm("Delete variant permanently?")) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleImageUpload = (e, index, type) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(`${index}-${type}`)
    
    // Simulate upload
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file)
      updateVariant(index, type === 'desktop' ? 'desktop_image_url' : 'mobile_image_url', fakeUrl)
      setUploading(null)
    }, 1500)
  }

  const duplicateVariant = (index) => {
    const original = variants[index]
    const newVariant = {
      ...original,
      id: `temp-${Date.now()}`,
      variant_name: `${original.variant_name} (Copy)`,
      is_control: false
    }
    setVariants([...variants, newVariant])
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- SAVE ---
  const onSave = async (formData) => {
    setSaving(true)
    setTimeout(() => {
      console.log('Saved:', { ...formData, secondaryKPIs, selectedChannels, targetDevices, variants })
      setSaving(false)
      alert('Changes saved successfully!')
    }, 1500)
  }

  const handleDelete = () => {
    if (confirm("Delete experiment? This cannot be undone.")) {
      alert('Experiment deleted')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 pb-32">
      
      {/* HEADER */}
      <div className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 border-b border-white/80 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button className="neuro-button p-2.5 rounded-xl group">
                <ArrowLeft className="text-slate-700 group-hover:text-blue-600 transition-colors" size={20} />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Edit Experiment
                </h1>
                <p className="text-xs text-slate-500 font-medium">Optimize and refine your test</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button onClick={() => setShowPreview(!showPreview)} className="neuro-button px-4 py-2.5 rounded-xl text-slate-700 font-bold text-sm flex items-center gap-2 hover:text-blue-600 transition-all">
                <Eye size={16} /> Preview
              </button>
              <button onClick={handleDelete} className="neuro-button-danger px-4 py-2.5 rounded-xl text-red-600 font-bold text-sm flex items-center gap-2">
                <Trash2 size={16} /> Delete
              </button>
              <button onClick={handleSubmit(onSave)} disabled={saving} className="neuro-button-primary px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl transition-all">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-8 grid lg:grid-cols-[2fr_1fr] gap-6 sm:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* Strategy Card */}
          <div className="glass-card neuro-card p-6 sm:p-8 rounded-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200/60">
              <div className="neuro-icon p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600">
                <Target size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Core Strategy</h3>
            </div>

            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="input-group">
                  <label className="input-label">Test Name</label>
                  <input {...register('test_name', { required: true })} className="neuro-input" placeholder="e.g. Homepage Hero V2" />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <div className="relative">
                    <select {...register('test_category')} className="neuro-input pr-10 cursor-pointer">
                      {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                    </select>
                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={16}/>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label flex items-center gap-2">
                  Problem Statement
                  <Info size={14} className="text-slate-400" />
                </label>
                <textarea {...register('problem_statement')} rows={2} className="neuro-input resize-none" placeholder="What problem are we trying to solve?" />
              </div>

              <div className="input-group">
                <label className="input-label flex items-center gap-2">
                  Hypothesis
                  <TrendingUp size={14} className="text-slate-400" />
                </label>
                <textarea {...register('hypothesis')} rows={3} className="neuro-input resize-none" placeholder="If we change X, then Y will happen because Z..." />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="input-group">
                  <label className="input-label">Primary KPI</label>
                  <input {...register('primary_kpi')} className="neuro-input" placeholder="e.g. Conversion Rate" />
                </div>
                <div className="input-group">
                  <label className="input-label">Main Page URL</label>
                  <div className="relative">
                    <input {...register('page_url')} className="neuro-input pr-10" placeholder="https://example.com" />
                    <button 
                      type="button"
                      onClick={() => copyToClipboard(watch('page_url'))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Secondary KPIs */}
              <div className="input-group">
                <label className="input-label">Secondary KPIs</label>
                <div className="neuro-input-tag-container">
                  {secondaryKPIs.map(k => (
                    <span key={k} className="tag-chip">
                      {k} 
                      <button onClick={() => removeKPI(k)} className="tag-remove">
                        <X size={12}/>
                      </button>
                    </span>
                  ))}
                  <input 
                    value={tempKPI} 
                    onChange={e => setTempKPI(e.target.value)} 
                    onKeyDown={handleAddKPI}
                    className="tag-input" 
                    placeholder="Type & press Enter..." 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Variants Card */}
          <div className="glass-card neuro-card p-6 sm:p-8 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="neuro-icon p-2.5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Variants & Changes</h3>
              </div>
              <button onClick={addVariant} className="neuro-button-sm text-blue-600 hover:text-blue-700">
                <Plus size={16} /> Add Variant
              </button>
            </div>

            <div className="space-y-6">
              {variants.map((variant, idx) => (
                <div key={variant.id} className="variant-card">
                  <div className="variant-header">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`variant-badge ${variant.is_control ? 'variant-badge-control' : 'variant-badge-variant'}`}>
                        {variant.is_control ? 'CONTROL' : 'VARIANT'}
                      </span>
                      <input 
                        value={variant.variant_name}
                        onChange={(e) => updateVariant(idx, 'variant_name', e.target.value)}
                        className="variant-name-input"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="split-input-container">
                        <input 
                          type="number" 
                          value={variant.split_percentage}
                          onChange={(e) => updateVariant(idx, 'split_percentage', parseInt(e.target.value) || 0)}
                          className="split-input"
                        />
                        <span className="split-label">%</span>
                      </div>
                      {!variant.is_control && (
                        <>
                          <button 
                            onClick={() => duplicateVariant(idx)} 
                            className="icon-button text-blue-500 hover:text-blue-600"
                            title="Duplicate variant"
                          >
                            <Copy size={16}/>
                          </button>
                          <button 
                            onClick={() => removeVariant(idx)} 
                            className="icon-button text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="variant-content">
                    <div className="space-y-5">
                      {!variant.is_control && (
                        <div className="input-group">
                          <div className="flex justify-between items-center mb-3">
                            <label className="input-label-sm">Changes Made</label>
                            <button 
                              type="button" 
                              onClick={() => addChangeToVariant(idx)} 
                              className="add-change-button"
                            >
                              <ListPlus size={14} /> Add Change
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {(variant.changesList || []).map((change, cIdx) => (
                              <div key={cIdx} className="change-item">
                                <div className="change-bullet" />
                                <input 
                                  value={change}
                                  onChange={(e) => updateChangeItem(idx, cIdx, e.target.value)}
                                  className="change-input"
                                  placeholder="Describe a change..."
                                />
                                <button 
                                  onClick={() => removeChangeItem(idx, cIdx)} 
                                  className="change-remove"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                            {(variant.changesList || []).length === 0 && (
                              <div className="empty-state">
                                <AlertCircle size={16} className="text-slate-300" />
                                <p className="text-xs text-slate-400 italic">No specific changes listed yet</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="input-group">
                        <label className="input-label-sm">Variant URL (Optional)</label>
                        <input 
                          value={variant.target_url || ''}
                          onChange={(e) => updateVariant(idx, 'target_url', e.target.value)}
                          className="neuro-input-sm"
                          placeholder="https://..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {['desktop', 'mobile'].map(type => (
                          <label key={type} className="image-upload-label">
                            <span className="input-label-sm capitalize">{type} Mockup</span>
                            <div className="image-upload-container">
                              {variant[`${type}_image_url`] ? (
                                <div className="relative w-full h-full group">
                                  <img src={variant[`${type}_image_url`]} className="w-full h-full object-cover rounded-lg" alt={`${type} mockup`} />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">Change Image</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="upload-placeholder">
                                  {uploading === `${idx}-${type}` ? (
                                    <div className="loading-spinner" />
                                  ) : (
                                    <>
                                      <ImageIcon className="text-slate-300 mb-2" size={24}/>
                                      <span className="text-xs text-slate-400 font-medium">Upload</span>
                                    </>
                                  )}
                                </div>
                              )}
                              <input 
                                type="file" 
                                hidden 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, idx, type)} 
                                disabled={!!uploading} 
                              />
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6 sm:space-y-8">
          
          {/* PIE Score */}
          <div className="glass-card neuro-card p-6 rounded-2xl sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <PieChart size={20} className="text-emerald-500"/>
                <h3 className="font-bold text-slate-800">Priority Score</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="pie-score-badge">{pieScore}</span>
                <span className={`priority-badge ${priority.color}`}>
                  {priority.label}
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {[
                { name: 'potential', label: 'Potential Impact', icon: TrendingUp },
                { name: 'importance', label: 'Business Importance', icon: Target },
                { name: 'ease', label: 'Implementation Ease', icon: Zap }
              ].map(item => (
                <div key={item.name}>
                  <div className="flex justify-between items-center text-xs font-bold mb-3">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} className="text-slate-400" />
                      <span className="text-slate-600 uppercase">{item.label}</span>
                    </div>
                    <span className="pie-score-value">{watch(`pie_${item.name}`)}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    {...register(`pie_${item.name}`)}
                    className="range-slider"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="glass-card neuro-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold">
              <Calendar size={20} className="text-amber-500"/> 
              <span>Timeline Planning</span>
            </div>
            <div className="space-y-4">
              <div className="input-group">
                <label className="input-label-sm">Planned Start Date</label>
                <input type="date" {...register('planned_start_date')} className="neuro-input-sm" />
              </div>
              <div className="input-group">
                <label className="input-label-sm">Planned End Date</label>
                <input type="date" {...register('planned_end_date')} className="neuro-input-sm" />
              </div>
            </div>
          </div>

          {/* Config */}
          <div className="glass-card neuro-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold">
              <Monitor size={20} className="text-indigo-500"/> 
              <span>Targeting</span>
            </div>
            
            <div className="space-y-5">
              <div className="input-group">
                <label className="input-label-sm">Target Devices</label>
                <div className="flex gap-2">
                  {['Desktop', 'Mobile'].map(d => (
                    <button 
                      key={d} 
                      type="button" 
                      onClick={() => toggleDevice(d)} 
                      className={`device-toggle ${targetDevices.includes(d) ? 'device-toggle-active' : ''}`}
                    >
                      {d === 'Desktop' ? <Monitor size={14} /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/></svg>}
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label-sm">Traffic Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button 
                      key={c} 
                      type="button" 
                      onClick={() => toggleChannel(c)} 
                      className={`channel-toggle ${selectedChannels.includes(c) ? 'channel-toggle-active' : ''}`}
                    >
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
        /* Neumorphic & Glassmorphic Base */
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07),
                      inset 0 1px 0 0 rgba(255, 255, 255, 0.9);
        }

        .neuro-card {
          box-shadow: 12px 12px 24px rgba(174, 174, 192, 0.15),
                      -12px -12px 24px rgba(255, 255, 255, 0.9),
                      inset 2px 2px 4px rgba(255, 255, 255, 0.5);
        }

        .neuro-button {
          background: linear-gradient(145deg, #ffffff, #f0f0f0);
          box-shadow: 6px 6px 12px rgba(174, 174, 192, 0.2),
                      -6px -6px 12px rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .neuro-button:hover {
          box-shadow: 4px 4px 8px rgba(174, 174, 192, 0.2),
                      -4px -4px 8px rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        .neuro-button:active {
          box-shadow: inset 3px 3px 6px rgba(174, 174, 192, 0.2),
                      inset -3px -3px 6px rgba(255, 255, 255, 0.7);
          transform: translateY(0);
        }

        .neuro-button-primary {
          box-shadow: 0 10px 30px rgba(79, 70, 229, 0.3),
                      0 4px 12px rgba(59, 130, 246, 0.2);
          transition: all 0.3s ease;
        }

        .neuro-button-primary:hover:not(:disabled) {
          box-shadow: 0 15px 40px rgba(79, 70, 229, 0.4),
                      0 6px 16px rgba(59, 130, 246, 0.3);
          transform: translateY(-2px);
        }

        .neuro-button-danger {
          background: linear-gradient(145deg, #ffffff, #fef2f2);
          box-shadow: 6px 6px 12px rgba(252, 165, 165, 0.15),
                      -6px -6px 12px rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(254, 202, 202, 0.3);
        }

        .neuro-button-sm {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 0.75rem;
          background: linear-gradient(145deg, #ffffff, #f8f9fa);
          box-shadow: 4px 4px 8px rgba(174, 174, 192, 0.15),
                      -4px -4px 8px rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }

        .neuro-button-sm:hover {
          transform: translateY(-1px);
          box-shadow: 3px 3px 6px rgba(174, 174, 192, 0.15),
                      -3px -3px 6px rgba(255, 255, 255, 0.9);
        }

        .neuro-icon {
          box-shadow: 4px 4px 8px rgba(174, 174, 192, 0.1),
                      -2px -2px 6px rgba(255, 255, 255, 0.9),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.5);
        }

        /* Enhanced Input Styles */
        .neuro-input {
          width: 95%;
          padding: 0.875rem 1rem;
          font-size: 0.9375rem;
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(226, 232, 240, 0.5);
          box-shadow: inset 2px 2px 4px rgba(148, 163, 184, 0.05),
                      inset -1px -1px 2px rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
          outline: none;
        }

        .neuro-input:focus {
          background: rgba(255, 255, 255, 0.95);
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1),
                      inset 2px 2px 4px rgba(59, 130, 246, 0.05);
        }

        .neuro-input-sm {
          width: 92%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(226, 232, 240, 0.5);
          box-shadow: inset 2px 2px 4px rgba(148, 163, 184, 0.05);
          transition: all 0.3s ease;
          outline: none;
        }

        .neuro-input-sm:focus {
          background: rgba(255, 255, 255, 0.95);
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .neuro-input-tag-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
          min-height: 3.5rem;
          padding: 0.75rem;
          border-radius: 0.875rem;
          background: rgba(255, 255, 255, 0.6);
          border: 2px solid rgba(226, 232, 240, 0.5);
          box-shadow: inset 2px 2px 4px rgba(148, 163, 184, 0.05);
          transition: all 0.3s ease;
        }

        .neuro-input-tag-container:focus-within {
          background: rgba(255, 255, 255, 0.95);
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          font-weight: 700;
          color: #1e40af;
          background: linear-gradient(145deg, #eff6ff, #dbeafe);
          border: 1px solid #bfdbfe;
          border-radius: 0.5rem;
          box-shadow: 2px 2px 4px rgba(59, 130, 246, 0.1),
                      -1px -1px 2px rgba(255, 255, 255, 0.9);
        }

        .tag-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.125rem;
          border-radius: 0.25rem;
          transition: all 0.2s ease;
        }

        .tag-remove:hover {
          background: rgba(59, 130, 246, 0.1);
        }

        .tag-input {
          flex: 1;
          min-width: 8rem;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.875rem;
          color: #334155;
        }

        .tag-input::placeholder {
          color: #94a3b8;
        }

        /* Input Group Styles */
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-label {
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .input-label-sm {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          color: #64748b;
          display: block;
          margin-bottom: 0.5rem;
        }

        /* Variant Card Styles */
        .variant-card {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.6);
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 4px 4px 12px rgba(148, 163, 184, 0.08),
                      -2px -2px 8px rgba(255, 255, 255, 0.8);
          transition: all 0.3s ease;
        }

        .variant-card:hover {
          border-color: rgba(59, 130, 246, 0.3);
          box-shadow: 6px 6px 16px rgba(59, 130, 246, 0.12),
                      -3px -3px 10px rgba(255, 255, 255, 0.9);
        }

        .variant-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          background: linear-gradient(145deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6));
          border-bottom: 1px solid rgba(226, 232, 240, 0.5);
          gap: 1rem;
        }

        .variant-badge {
          font-size: 0.625rem;
          font-weight: 700;
          padding: 0.25rem 0.625rem;
          border-radius: 0.375rem;
          letter-spacing: 0.025em;
        }

        .variant-badge-control {
          background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
          color: #475569;
          box-shadow: 2px 2px 4px rgba(100, 116, 139, 0.1),
                      -1px -1px 2px rgba(255, 255, 255, 0.9);
        }

        .variant-badge-variant {
          background: linear-gradient(145deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          box-shadow: 2px 2px 4px rgba(59, 130, 246, 0.15),
                      -1px -1px 2px rgba(255, 255, 255, 0.9);
        }

        .variant-name-input {
          background: transparent;
          font-weight: 700;
          font-size: 0.9375rem;
          color: #1e293b;
          border: none;
          outline: none;
          padding: 0.25rem 0.5rem;
          border-radius: 0.375rem;
          transition: all 0.2s ease;
        }

        .variant-name-input:focus {
          background: rgba(255, 255, 255, 0.6);
          color: #2563eb;
        }

        .split-input-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.6);
          border-radius: 0.5rem;
          padding: 0.375rem 0.625rem;
          box-shadow: inset 1px 1px 2px rgba(148, 163, 184, 0.1);
        }

        .split-input {
          width: 2.5rem;
          text-align: right;
          font-weight: 700;
          font-size: 0.875rem;
          background: transparent;
          border: none;
          outline: none;
          color: #1e293b;
        }

        .split-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          margin-left: 0.25rem;
        }

        .icon-button {
          padding: 0.375rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.5);
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: scale(1.05);
        }

        .variant-content {
          padding: 1.25rem;
        }

        /* Change Item Styles */
        .add-change-button {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.625rem;
          font-weight: 700;
          color: #2563eb;
          padding: 0.375rem 0.625rem;
          border-radius: 0.5rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.1);
          transition: all 0.2s ease;
        }

        .add-change-button:hover {
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.2);
        }

        .change-item {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .change-bullet {
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          flex-shrink: 0;
          margin-top: 0.25rem;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .change-input {
          flex: 1;
          font-size: 0.875rem;
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          outline: none;
          padding: 0.5rem 0;
          color: #334155;
          transition: all 0.2s ease;
        }

        .change-input:focus {
          border-bottom-color: #3b82f6;
        }

        .change-input::placeholder {
          color: #cbd5e1;
        }

        .change-remove {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.25rem;
          border-radius: 0.375rem;
          color: #cbd5e1;
          transition: all 0.2s ease;
        }

        .change-remove:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .empty-state {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: rgba(248, 250, 252, 0.5);
          border: 1px dashed rgba(203, 213, 225, 0.5);
          border-radius: 0.5rem;
        }

        /* Image Upload Styles */
        .image-upload-label {
          display: block;
          cursor: pointer;
        }

        .image-upload-container {
          aspect-ratio: 1;
          background: linear-gradient(145deg, #f8fafc, #f1f5f9);
          border-radius: 0.75rem;
          border: 2px dashed rgba(203, 213, 225, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: inset 2px 2px 4px rgba(148, 163, 184, 0.1);
        }

        .image-upload-container:hover {
          border-color: #3b82f6;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          box-shadow: inset 2px 2px 4px rgba(59, 130, 246, 0.1);
        }

        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-spinner {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(59, 130, 246, 0.2);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* PIE Score Styles */
        .pie-score-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 3rem;
          padding: 0.5rem 0.875rem;
          font-size: 1.125rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1e293b, #334155);
          color: white;
          border-radius: 0.75rem;
          box-shadow: 4px 4px 12px rgba(30, 41, 59, 0.3),
                      -2px -2px 8px rgba(71, 85, 105, 0.2),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.1);
        }

        .priority-badge {
          padding: 0.25rem 0.625rem;
          font-size: 0.625rem;
          font-weight: 700;
          border-radius: 0.5rem;
          border: 1px solid;
          letter-spacing: 0.025em;
        }

        .pie-score-value {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.5rem;
          padding: 0.25rem 0.625rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          box-shadow: 2px 2px 6px rgba(59, 130, 246, 0.3),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.2);
        }

        /* Range Slider */
        .range-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 0.5rem;
          border-radius: 0.375rem;
          background: linear-gradient(to right, 
            #dbeafe 0%, 
            #93c5fd 50%, 
            #3b82f6 100%);
          outline: none;
          box-shadow: inset 2px 2px 4px rgba(59, 130, 246, 0.1),
                      inset -1px -1px 2px rgba(255, 255, 255, 0.5);
          cursor: pointer;
        }

        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4),
                      inset 1px 1px 2px rgba(255, 255, 255, 0.8);
          transition: all 0.2s ease;
        }

        .range-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
        }

        .range-slider::-moz-range-thumb {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #f1f5f9);
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        /* Device & Channel Toggles */
        .device-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 0.75rem;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 2px solid rgba(226, 232, 240, 0.6);
          color: #64748b;
          transition: all 0.3s ease;
          box-shadow: 3px 3px 6px rgba(148, 163, 184, 0.1),
                      -2px -2px 4px rgba(255, 255, 255, 0.9);
          justify-content: center;
        }

        .device-toggle:hover {
          border-color: rgba(59, 130, 246, 0.3);
        }

        .device-toggle-active {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-color: #60a5fa;
          color: #1e40af;
          box-shadow: 3px 3px 8px rgba(59, 130, 246, 0.2),
                      -2px -2px 6px rgba(255, 255, 255, 0.9),
                      inset 1px 1px 2px rgba(59, 130, 246, 0.1);
        }

        .channel-toggle {
          padding: 0.5rem 0.875rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 0.625rem;
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 1px solid rgba(226, 232, 240, 0.6);
          color: #64748b;
          transition: all 0.2s ease;
          box-shadow: 2px 2px 4px rgba(148, 163, 184, 0.08),
                      -1px -1px 2px rgba(255, 255, 255, 0.9);
        }

        .channel-toggle:hover {
          border-color: rgba(99, 102, 241, 0.3);
        }

        .channel-toggle-active {
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          border-color: #818cf8;
          color: #4338ca;
          box-shadow: 2px 2px 6px rgba(99, 102, 241, 0.15),
                      -1px -1px 3px rgba(255, 255, 255, 0.9),
                      inset 1px 1px 2px rgba(99, 102, 241, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .variant-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .pie-score-badge {
            font-size: 1rem;
            padding: 0.375rem 0.75rem;
          }

          .neuro-input, .neuro-input-sm {
            font-size: 0.875rem;
          }
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .glass-card {
          animation: fadeIn 0.5s ease-out;
        }

        /* Smooth Transitions */
        * {
          transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        input, textarea, select, button {
          transition-duration: 200ms;
        }
      `}</style>
    </div>
  )
}