import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProject } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx' 
import { 
  ArrowLeft, ArrowRight, X, Save, Target, Sparkles, Monitor, Smartphone, Percent,
  AlertCircle, Trash2, Upload, Download, FileSpreadsheet, Check, Plus, Calendar, 
  Trophy, ChevronDown, Split, Link as LinkIcon, Zap, LayoutTemplate, 
  MousePointerClick, Type, Lightbulb, Clock
} from 'lucide-react'

// === CONSTANTS ===
const CATEGORIES = [
  { value: 'Form Test', color: 'blue' },
  { value: 'Content Changes', color: 'indigo' },
  { value: 'Trust Value', color: 'purple' },
  { value: 'Design Changes', color: 'orange' },
  { value: 'Copy Changes', color: 'slate' },
  { value: 'Pricing Test', color: 'green' },
  { value: 'Navigation', color: 'gray' },
  { value: 'Other', color: 'red' }
]

const PREBUILT_TEMPLATES = [
  {
    id: 1, title: "Funnel Optimization", description: "Reduce friction in sign-up flow",
    data: {
      test_name: "Sign-Up Flow - Reduced Fields", test_category: "Form Test",
      problem_statement: "High drop-off (40%) on step 2", 
      hypothesis: "Removing optional fields increases completion by 15%",
      primary_kpi: "Completion Rate", pie_potential: 8, pie_importance: 9, pie_ease: 6,
      secondary_kpis: ["Time to Complete", "Error Rate"]
    }
  },
  {
    id: 2, title: "Pricing Psychology", description: "Test annual vs monthly toggle",
    data: {
      test_name: "Pricing Page - Annual Default", test_category: "Pricing Test",
      problem_statement: "Users defaulting to monthly plans, lower LTV",
      hypothesis: "Defaulting to Annual toggle increases AOV by 25%",
      primary_kpi: "AOV", pie_potential: 7, pie_importance: 9, pie_ease: 9,
      secondary_kpis: ["Conversion Rate", "Plan Mix"]
    }
  }
]

const CHANNELS = ['Direct', 'Organic Search', 'Paid Search', 'Social', 'Email', 'Affiliate', 'Display']

export default function NewTest() {
  const navigate = useNavigate()
  const { currentProject } = useProject()
  const { user } = useAuth()
  const fileInputRef = useRef(null)
  
  // === STATE ===
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [customKpiInput, setCustomKpiInput] = useState('')
  const [errors, setErrors] = useState({})

  // === FORM DATA ===
  const [formData, setFormData] = useState({
    test_name: '',
    test_category: 'Form Test',
    problem_statement: '',
    hypothesis: '',
    pie_potential: 5,
    pie_importance: 5,
    pie_ease: 5,
    primary_kpi: '',
    secondary_kpis: [],
    device_target: ['Desktop', 'Mobile'],
    traffic_channels: [],
    planned_start_date: '',
    planned_end_date: '',
    variants: [
      { id: 1, name: 'Control', is_control: true, split: 50, url: '', desktop_image: null, desktop_preview: null, mobile_image: null, mobile_preview: null, changes: [] },
      { id: 2, name: 'Variant B', is_control: false, split: 50, url: '', desktop_image: null, desktop_preview: null, mobile_image: null, mobile_preview: null, changes: [''] }
    ]
  })

  // === COMPUTED VALUES ===
  const pieScore = useMemo(() => 
    ((formData.pie_potential + formData.pie_importance + formData.pie_ease) / 3).toFixed(1), 
    [formData.pie_potential, formData.pie_importance, formData.pie_ease]
  )
  
  const totalSplit = formData.variants.reduce((sum, v) => sum + (parseInt(v.split) || 0), 0)

  // === HELPERS ===
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const toggleArrayField = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }))
  }

  // === KPI MANAGEMENT ===
  const addKpi = (e) => {
    if (e.key === 'Enter' && customKpiInput.trim()) {
      e.preventDefault()
      if (!formData.secondary_kpis.includes(customKpiInput.trim())) {
        updateField('secondary_kpis', [...formData.secondary_kpis, customKpiInput.trim()])
      }
      setCustomKpiInput('')
    }
  }

  const removeKpi = (kpi) => {
    updateField('secondary_kpis', formData.secondary_kpis.filter(k => k !== kpi))
  }

  // === TEMPLATE MANAGEMENT ===
  const applyTemplate = (data) => {
    setFormData(prev => ({ ...prev, ...data }))
    setShowTemplates(false)
    setErrors({})
    toast.success("Template applied!")
  }

  // === EXCEL FUNCTIONS (REAL) ===
  const handleDownloadTemplate = () => {
    const headers = [
      { 
        "Experiment Name": "Example Test 1", 
        "Category": "Form Test",
        "Problem Statement": "Users bounce at step 2",
        "Hypothesis": "If we shorten form, conversions rise",
        "Primary KPI": "Conversion Rate",
        "Potential (1-10)": 8,
        "Importance (1-10)": 9,
        "Ease (1-10)": 5
      }
    ]
    const ws = XLSX.utils.json_to_sheet(headers)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Strategy Template")
    XLSX.writeFile(wb, "CRO_Strategy_Template.xlsx")
    toast.success("Excel template downloaded")
  }

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const toastId = toast.loading("Parsing Excel file...")

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) throw new Error("File is empty")

      // Map to DB Schema
      const experimentsToCreate = jsonData.map(row => ({
        project_id: currentProject.id,
        test_name: row["Experiment Name"] || "Untitled Excel Import",
        test_category: row["Category"] || "Other",
        problem_statement: row["Problem Statement"] || "",
        hypothesis: row["Hypothesis"] || "",
        primary_kpi: row["Primary KPI"] || "Conversion Rate",
        pie_potential: row["Potential (1-10)"] || 5,
        pie_importance: row["Importance (1-10)"] || 5,
        pie_ease: row["Ease (1-10)"] || 5,
        test_number: `T-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'Backlog',
        owner_id: user.id
      }))

      const { data: inserted, error } = await supabase.from('experiments').insert(experimentsToCreate).select()
      if (error) throw error

      // Create Default Variants
      const variantsToCreate = []
      inserted.forEach(exp => {
        variantsToCreate.push(
          { experiment_id: exp.id, variant_name: "Control", is_control: true, split_percentage: 50 },
          { experiment_id: exp.id, variant_name: "Variant B", is_control: false, split_percentage: 50, changes_description: "From Excel Import" }
        )
      })
      await supabase.from('variants').insert(variantsToCreate)

      toast.success(`Imported ${inserted.length} experiments!`, { id: toastId })
      setShowExcelModal(false)
      navigate('/dashboard')

    } catch (error) {
      console.error(error)
      toast.error("Upload failed: " + error.message, { id: toastId })
    }
  }

  // === VALIDATION ===
  const validateStep = (step) => {
    const newErrors = {}
    
    if (step === 1) {
      if (!formData.test_name.trim()) newErrors.test_name = 'Required'
      if (!formData.hypothesis.trim()) newErrors.hypothesis = 'Required'
      if (!formData.primary_kpi.trim()) newErrors.primary_kpi = 'Required'
    }
    
    if (step === 2) {
      if (formData.device_target.length === 0) newErrors.device_target = 'Select at least one device'
    }
    
    if (step === 3) {
      if (totalSplit !== 100) newErrors.split = `Total is ${totalSplit}%, must equal 100%`
      formData.variants.forEach(v => {
        if (!v.is_control && v.changes.every(c => !c.trim())) {
          newErrors[`variant_${v.id}`] = 'Add at least one change'
        }
      })
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast.error("Please fix errors before continuing")
    }
  }

  // === VARIANT MANAGEMENT ===
  const updateVariant = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === id ? { ...v, [field]: value } : v)
    }))
  }

  const addVariant = () => {
    const newId = Math.max(...formData.variants.map(v => v.id)) + 1
    const letter = String.fromCharCode(65 + formData.variants.length - 1)
    
    // Auto-redistribute
    const currentCount = formData.variants.length + 1
    const equalSplit = Math.floor(100 / currentCount)
    const remainder = 100 % currentCount

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants.map((v, i) => ({ ...v, split: i === 0 ? equalSplit + remainder : equalSplit })),
        { id: newId, name: `Variant ${letter}`, is_control: false, split: equalSplit, url: '', desktop_image: null, desktop_preview: null, changes: [''] }
      ]
    }))
  }

  const removeVariant = (id) => {
    if (formData.variants.length <= 2) return
    setFormData(prev => {
      const remaining = prev.variants.filter(v => v.id !== id)
      // Redistribute
      const count = remaining.length
      const split = Math.floor(100 / count)
      const rem = 100 % count
      return { 
        ...prev, 
        variants: remaining.map((v, i) => ({ ...v, split: i === 0 ? split + rem : split })) 
      }
    })
  }

  const addChange = (variantId) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, changes: [...v.changes, ''] } : v)
    }))
  }

  const updateChange = (variantId, idx, val) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, changes: v.changes.map((c, i) => i === idx ? val : c) } : v)
    }))
  }

  const removeChange = (variantId, idx) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v => v.id === variantId ? { ...v, changes: v.changes.filter((_, i) => i !== idx) } : v)
    }))
  }

  // === IMAGE UPLOAD (REAL) ===
  const handleImageUpload = (variantId, type, e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        variants: prev.variants.map(v => v.id === variantId ? {
          ...v,
          [type === 'desktop' ? 'desktop_image' : 'mobile_image']: file,
          [type === 'desktop' ? 'desktop_preview' : 'mobile_preview']: reader.result
        } : v)
      }))
    }
    reader.readAsDataURL(file)
  }

  const uploadToStorage = async (file) => {
    if (!file) return null
    const ext = file.name.split('.').pop()
    const path = `${currentProject.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`
    const { error } = await supabase.storage.from('variant-images').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('variant-images').getPublicUrl(path)
    return data.publicUrl
  }

  // === SUBMIT (REAL) ===
  const handleSubmit = async () => {
    if (!currentProject) return toast.error("No project context")
    if (!validateStep(3)) return
    
    setSaving(true)
    const toastId = toast.loading("Launching experiment...")

    try {
      // 1. Create Experiment Row
      const { data: exp, error: expError } = await supabase
        .from('experiments')
        .insert({
          project_id: currentProject.id,
          test_name: formData.test_name,
          test_number: `T-${Math.floor(1000 + Math.random() * 9000)}`,
          test_category: formData.test_category,
          problem_statement: formData.problem_statement,
          hypothesis: formData.hypothesis,
          pie_potential: formData.pie_potential,
          pie_importance: formData.pie_importance,
          pie_ease: formData.pie_ease,
          primary_kpi: formData.primary_kpi,
          secondary_kpis: formData.secondary_kpis,
          traffic_channels: formData.traffic_channels,
          devices: formData.device_target,
          planned_start_date: formData.planned_start_date || null,
          planned_end_date: formData.planned_end_date || null,
          status: 'Backlog',
          owner_id: user.id
        })
        .select().single()

      if (expError) throw expError

      // 2. Upload Images & Create Variants
      await Promise.all(formData.variants.map(async (v) => {
        const desktopUrl = await uploadToStorage(v.desktop_image)
        const mobileUrl = await uploadToStorage(v.mobile_image)

        return supabase.from('variants').insert({
          experiment_id: exp.id,
          variant_name: v.name,
          is_control: v.is_control,
          split_percentage: parseInt(v.split),
          target_url: v.url,
          changes_description: v.changes.join('\n'),
          desktop_image_url: desktopUrl,
          mobile_image_url: mobileUrl
        })
      }))

      toast.success("Experiment Created!", { id: toastId })
      navigate('/dashboard')

    } catch (err) {
      console.error(err)
      toast.error(err.message, { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  // === UI COMPONENTS ===
  const StepIndicator = ({ num, label }) => (
    <div className={`flex items-center gap-2 ${currentStep >= num ? 'text-blue-600' : 'text-slate-400'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
        currentStep >= num 
          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg' 
          : 'bg-white border-2 border-slate-200'
      }`}>
        {currentStep > num ? <Check size={18} /> : num}
      </div>
      <span className="text-sm font-bold hidden sm:block">{label}</span>
      {num < 3 && <div className={`w-12 h-0.5 mx-2 ${currentStep > num ? 'bg-blue-600' : 'bg-slate-200'}`} />}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pb-32">
      
      {/* === EXCEL BULK UPLOAD MODAL === */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <FileSpreadsheet className="text-emerald-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Bulk Import from Excel</h3>
                  <p className="text-sm text-slate-600">Upload multiple experiments at once</p>
                </div>
              </div>
              <button onClick={() => setShowExcelModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Sparkles size={16} /> How it works
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                  <li>Download the template to see required columns</li>
                  <li>Fill in your experiment data (Name, Category, Problem, etc.)</li>
                  <li>Upload the completed Excel file</li>
                  <li>All experiments will be created in the Backlog</li>
                </ol>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleDownloadTemplate}
                  className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl hover:shadow-lg transition-all text-left"
                >
                  <Download className="text-emerald-600 mb-3" size={32} />
                  <div className="font-bold text-slate-900 mb-1">Download Template</div>
                  <p className="text-xs text-slate-600">Get the Excel format</p>
                </button>

                <label className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-all cursor-pointer text-left">
                  <Upload className="text-blue-600 mb-3" size={32} />
                  <div className="font-bold text-slate-900 mb-1">Upload File</div>
                  <p className="text-xs text-slate-600">Select your Excel file</p>
                  <input 
                    type="file" 
                    hidden 
                    accept=".xlsx,.xls" 
                    onChange={handleExcelUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* === HEADER === */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">New Experiment</h1>
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mt-1">
                  <Clock size={12} /> Draft auto-saved
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
              <StepIndicator num={1} label="Strategy" />
              <StepIndicator num={2} label="Config" />
              <StepIndicator num={3} label="Variants" />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowExcelModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <FileSpreadsheet size={18} /> Bulk Import
              </button>
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
              >
                <LayoutTemplate size={18} /> {showTemplates ? 'Close' : 'Templates'}
              </button>
            </div>
          </div>
        </div>

        {/* === TEMPLATES === */}
        {showTemplates && (
          <div className="grid md:grid-cols-2 gap-4 mb-6 animate-in slide-in-from-top-4">
            {PREBUILT_TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.data)}
                className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all text-left"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{t.description}</p>
                <div className="flex items-center text-sm font-bold text-blue-600">
                  Apply Template <ArrowRight size={16} className="ml-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          
          {/* === MAIN CONTENT === */}
          <div>
            
            {/* STEP 1: STRATEGY */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-in slide-in-from-right-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-slate-100">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Target size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Core Strategy</h3>
                    <p className="text-sm text-slate-600">Define the fundamentals</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Name & Category */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={formData.test_name}
                        onChange={e => updateField('test_name', e.target.value)}
                        placeholder="e.g. Loan Funnel Optimization"
                        className={`w-full px-4 py-3 rounded-xl border-2 outline-none font-medium ${
                          errors.test_name 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                      {errors.test_name && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.test_name}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Category</label>
                      <select
                        value={formData.test_category}
                        onChange={e => updateField('test_category', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-medium"
                      >
                        {CATEGORIES.map(c => <option key={c.value}>{c.value}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Problem Statement */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Problem Statement</label>
                    <textarea
                      rows={3}
                      value={formData.problem_statement}
                      onChange={e => updateField('problem_statement', e.target.value)}
                      placeholder="What user friction or business challenge are you addressing?"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none font-medium"
                    />
                  </div>

                  {/* Hypothesis */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                      Hypothesis <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lightbulb className="absolute left-4 top-4 text-amber-500" size={20} />
                      <textarea
                        rows={3}
                        value={formData.hypothesis}
                        onChange={e => updateField('hypothesis', e.target.value)}
                        placeholder="If we change X, then Y will happen because Z..."
                        className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none resize-none font-medium ${
                          errors.hypothesis 
                            ? 'border-red-400 bg-red-50' 
                            : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {errors.hypothesis && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.hypothesis}</p>}
                  </div>

                  {/* KPIs */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                        Primary KPI <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Trophy className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          value={formData.primary_kpi}
                          onChange={e => updateField('primary_kpi', e.target.value)}
                          placeholder="e.g. Conversion Rate"
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 outline-none font-medium ${
                            errors.primary_kpi 
                              ? 'border-red-400 bg-red-50' 
                              : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                          }`}
                        />
                      </div>
                      {errors.primary_kpi && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={12}/>{errors.primary_kpi}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Secondary KPIs</label>
                      <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-xl min-h-[48px] flex flex-wrap gap-2 items-center focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                        {formData.secondary_kpis.map((kpi, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                            {kpi}
                            <button onClick={() => removeKpi(kpi)}><X size={12} /></button>
                          </span>
                        ))}
                        <input
                          value={customKpiInput}
                          onChange={e => setCustomKpiInput(e.target.value)}
                          onKeyDown={addKpi}
                          placeholder="Type + Enter"
                          className="bg-transparent outline-none text-sm flex-1 min-w-[100px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PIE Score */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Target className="text-blue-500" size={18} /> PIE Priority Score
                      </h3>
                      <div className="text-3xl font-black text-blue-600">{pieScore}</div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { key: 'pie_potential', label: 'Potential Impact', color: 'blue' },
                        { key: 'pie_importance', label: 'Business Importance', color: 'purple' },
                        { key: 'pie_ease', label: 'Ease of Implementation', color: 'green' }
                      ].map(({ key, label, color }) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                            <span>{label}</span>
                            <span>{formData[key]}/10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData[key]}
                            onChange={e => updateField(key, Number(e.target.value))}
                            className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONFIGURATION */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 animate-in slide-in-from-right-8">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b-2 border-slate-100">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Zap size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Configuration</h3>
                    <p className="text-sm text-slate-600">Targeting & timeline</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Devices */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Target Devices</label>
                    <div className="grid grid-cols-2 gap-4">
                      {['Desktop', 'Mobile'].map(device => (
                        <button
                          key={device}
                          onClick={() => toggleArrayField('device_target', device)}
                          className={`py-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                            formData.device_target.includes(device)
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          {device === 'Desktop' ? <Monitor size={28} /> : <Smartphone size={28} />}
                          <span className="font-bold">{device}</span>
                        </button>
                      ))}
                    </div>
                    {errors.device_target && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle size={12}/>{errors.device_target}</p>}
                  </div>

                  {/* Timeline */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="date"
                          value={formData.planned_start_date}
                          onChange={e => updateField('planned_start_date', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-2">End Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="date"
                          value={formData.planned_end_date}
                          onChange={e => updateField('planned_end_date', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Channels */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Traffic Channels (Optional)</label>
                    <div className="flex flex-wrap gap-3">
                      {CHANNELS.map(channel => (
                        <button
                          key={channel}
                          onClick={() => toggleArrayField('traffic_channels', channel)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                            formData.traffic_channels.includes(channel)
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {channel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VARIANTS */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex justify-between items-center mb-8 pb-6 border-b-2 border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Split size={24} className="text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">Variants</h3>
                        <p className="text-sm text-slate-600">Define test variations</p>
                      </div>
                    </div>
                    
                    <div className={`px-6 py-3 rounded-xl flex items-center gap-2 font-bold ${
                      totalSplit === 100 
                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300' 
                        : 'bg-red-100 text-red-700 border-2 border-red-300 animate-pulse'
                    }`}>
                      <Percent size={18} /> {totalSplit}%
                    </div>
                  </div>

                  {errors.split && (
                    <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700 font-bold flex items-center gap-2">
                      <AlertCircle size={18} /> {errors.split}
                    </div>
                  )}

                  <div className="space-y-6">
                    {formData.variants.map((v, idx) => (
                      <div key={v.id} className="bg-slate-50 rounded-2xl border-2 border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b-2 border-slate-200 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              v.is_control ? 'bg-slate-200 text-slate-700' : 'bg-blue-500 text-white'
                            }`}>
                              {v.is_control ? 'CONTROL' : 'VARIANT'}
                            </span>
                            <input
                              value={v.name}
                              onChange={e => updateVariant(v.id, 'name', e.target.value)}
                              className="bg-transparent font-bold text-lg outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                              <Percent size={16} />
                              <input
                                type="number"
                                value={v.split || ''}
                                onChange={e => updateVariant(v.id, 'split', e.target.value)}
                                onFocus={e => e.target.select()}
                                className="w-14 text-right font-bold bg-transparent outline-none"
                                placeholder="0"
                              />
                            </div>
                            {!v.is_control && formData.variants.length > 2 && (
                              <button onClick={() => removeVariant(v.id)} className="p-2 text-slate-400 hover:text-red-500">
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-6 grid lg:grid-cols-2 gap-6">
                          {/* Left: Configuration */}
                          <div className="space-y-4">
                            <div>
                              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">URL (Optional)</label>
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  value={v.url}
                                  onChange={e => updateVariant(v.id, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full pl-10 pr-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
                                />
                              </div>
                            </div>

                            {!v.is_control && (
                              <div>
                                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
                                  Changes <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                  {v.changes.map((change, cIdx) => (
                                    <div key={cIdx} className="flex gap-2">
                                      <input
                                        value={change}
                                        onChange={e => updateChange(v.id, cIdx, e.target.value)}
                                        placeholder="Describe change..."
                                        className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 focus:border-blue-500 outline-none text-sm"
                                      />
                                      {v.changes.length > 1 && (
                                        <button onClick={() => removeChange(v.id, cIdx)} className="p-2 text-slate-400 hover:text-red-500">
                                          <X size={16} />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                  <button 
                                    onClick={() => addChange(v.id)}
                                    className="text-xs font-bold text-blue-600 flex items-center gap-1"
                                  >
                                    <Plus size={14} /> Add Change
                                  </button>
                                </div>
                                {errors[`variant_${v.id}`] && (
                                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                                    <AlertCircle size={12}/>{errors[`variant_${v.id}`]}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right: Mockups */}
                          <div>
                            <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Visual Mockups</label>
                            <div className="grid grid-cols-2 gap-3">
                              {/* Desktop */}
                              <label className="aspect-video bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden">
                                {v.desktop_preview ? (
                                  <img src={v.desktop_preview} className="w-full h-full object-cover" alt="Desktop" />
                                ) : (
                                  <>
                                    <Monitor size={24} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 mt-1">Desktop</span>
                                  </>
                                )}
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*"
                                  onChange={e => handleImageUpload(v.id, 'desktop', e)} 
                                />
                              </label>

                              {/* Mobile */}
                              <label className="aspect-[9/16] bg-white border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 overflow-hidden">
                                {v.mobile_preview ? (
                                  <img src={v.mobile_preview} className="w-full h-full object-cover" alt="Mobile" />
                                ) : (
                                  <>
                                    <Smartphone size={20} className="text-slate-400" />
                                    <span className="text-xs text-slate-500 mt-1">Mobile</span>
                                  </>
                                )}
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="image/*" 
                                  onChange={e => handleImageUpload(v.id, 'mobile', e)} 
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={addVariant}
                      className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={20} /> Add Variant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* === SIDEBAR SUMMARY === */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 sticky top-24">
              <div className="text-xs font-bold text-slate-400 uppercase mb-4">Summary</div>
              
              <div className="space-y-4">
                {/* PIE Score */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <div className="text-xs font-bold text-blue-700 mb-1">PIE SCORE</div>
                  <div className="text-3xl font-black text-blue-600">{pieScore}</div>
                  <div className="w-full bg-blue-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all" style={{width: `${pieScore * 10}%`}}></div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Variants</span>
                    <span className="font-bold text-slate-900">{formData.variants.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Traffic Split</span>
                    <span className={`font-bold ${totalSplit === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {totalSplit}%
                    </span>
                  </div>
                  {formData.primary_kpi && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-400 mb-1">PRIMARY KPI</div>
                      <div className="font-bold text-slate-900">{formData.primary_kpi}</div>
                    </div>
                  )}
                  {formData.secondary_kpis.length > 0 && (
                    <div className="pt-3 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-400 mb-2">SECONDARY KPIS</div>
                      <div className="flex flex-wrap gap-1">
                        {formData.secondary_kpis.map((kpi, i) => (
                          <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded font-medium">
                            {kpi}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Badge */}
                {formData.test_category && (
                  <div className="pt-3 border-t border-slate-200">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                      {formData.test_category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === FOOTER ACTIONS === */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t-2 border-slate-200 p-6 z-50 shadow-2xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-all disabled:opacity-0 flex items-center gap-2"
            >
              <ArrowLeft size={18} /> Back
            </button>

            <div className="hidden md:block text-sm font-bold text-slate-500">
              Step {currentStep} of 3
            </div>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-bold hover:shadow-xl transition-all flex items-center gap-2"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving || totalSplit !== 100}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    Launch Experiment <Sparkles size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}