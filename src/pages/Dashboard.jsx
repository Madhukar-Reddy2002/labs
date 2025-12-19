import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useProject } from '../context/ProjectContext'
import { 
  DndContext, DragOverlay, closestCorners, useSensor, useSensors, 
  PointerSensor, TouchSensor, KeyboardSensor, useDraggable, useDroppable 
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import toast from 'react-hot-toast'
import { 
  Layers, Plus, Clock, CheckCircle, Search, X, Filter, Calendar as CalendarIcon, 
  Play, Target, TrendingUp, ChevronLeft, ChevronRight, Grid3x3, Sparkles, 
  AlertCircle, Image as ImageIcon, Link as LinkIcon, Trophy, ArrowRight, 
  SlidersHorizontal
} from 'lucide-react'

const COLUMNS = [
  { id: 'Backlog', label: 'Backlog', icon: Layers, gradient: 'from-slate-400 to-slate-600' }, 
  { id: 'Planned', label: 'Planned', icon: CalendarIcon, gradient: 'from-blue-500 to-cyan-500' },
  { id: 'Running', label: 'Live', icon: Play, gradient: 'from-indigo-500 to-purple-600' },
  { id: 'Completed', label: 'Done', icon: CheckCircle, gradient: 'from-emerald-500 to-teal-600' }
]

const CATEGORIES = ['Form Test', 'Content Changes', 'Trust Value', 'Design Changes', 'Copy Changes', 'Pricing Test', 'Navigation', 'Other']

function StageTransitionModal({ test, newStatus, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    planned_start_date: test.planned_start_date || '',
    planned_end_date: test.planned_end_date || '',
    actual_start_date: test.actual_start_date || new Date().toISOString().split('T')[0],
    actual_end_date: new Date().toISOString().split('T')[0],
    outcome: 'Inconclusive',
    winner_variant_id: null,
    variantUrls: {}
  })
  const [variants, setVariants] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchVariants = async () => {
      const { data } = await supabase
        .from('variants')
        .select('*')
        .eq('experiment_id', test.id)
        .order('is_control', { ascending: false })
      
      if (data) {
        setVariants(data)
        const urls = {}
        data.forEach(v => { urls[v.id] = v.target_url || '' })
        setFormData(prev => ({ ...prev, variantUrls: urls }))
      }
    }
    fetchVariants()
  }, [test.id])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      let updates = { status: newStatus }

      if (newStatus === 'Planned') {
        if (!formData.planned_start_date || !formData.planned_end_date) {
          throw new Error('Please provide expected start and end dates')
        }
        updates.planned_start_date = formData.planned_start_date
        updates.planned_end_date = formData.planned_end_date
      }

      if (newStatus === 'Running') {
        if (!formData.actual_start_date) {
          throw new Error('Please provide actual start date')
        }
        updates.actual_start_date = formData.actual_start_date
        
        for (const [variantId, url] of Object.entries(formData.variantUrls)) {
          if (url.trim()) {
            await supabase
              .from('variants')
              .update({ target_url: url })
              .eq('id', variantId)
          }
        }
      }

      if (newStatus === 'Completed') {
        if (!formData.actual_end_date) {
          throw new Error('Please provide actual end date')
        }
        if (formData.outcome === 'Winner' && !formData.winner_variant_id) {
          throw new Error('Please select the winning variant')
        }
        updates.actual_end_date = formData.actual_end_date
        updates.outcome = formData.outcome
        updates.winner_variant_id = formData.outcome === 'Winner' ? formData.winner_variant_id : null
      }

      if (newStatus === 'Paused') {
        updates.actual_end_date = new Date().toISOString()
      }

      const { error } = await supabase
        .from('experiments')
        .update(updates)
        .eq('id', test.id)

      if (error) throw error

      toast.success(`Moved to ${newStatus}!`)
      onConfirm()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const renderContent = () => {
    if (newStatus === 'Planned') {
      return (
        <div className="space-y-4">
          <div className="neumorphic-inset p-5 border-l-4 border-blue-500 rounded-2xl">
            <p className="text-sm text-slate-700 font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon size={16} className="text-blue-500" />
              Set your expected timeline
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Expected Start</label>
                <input
                  type="date"
                  value={formData.planned_start_date}
                  onChange={e => setFormData(prev => ({ ...prev, planned_start_date: e.target.value }))}
                  className="w-[92%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Expected End</label>
                <input
                  type="date"
                  value={formData.planned_end_date}
                  onChange={e => setFormData(prev => ({ ...prev, planned_end_date: e.target.value }))}
                  className="w-[92%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (newStatus === 'Running') {
      return (
        <div className="space-y-4">
          <div className="neumorphic-inset p-5 border-l-4 border-indigo-500 rounded-2xl">
            <p className="text-sm text-slate-700 font-semibold mb-4 flex items-center gap-2">
              <Play size={16} className="text-indigo-500" />
              Launch configuration
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Actual Start Date</label>
              <input
                type="date"
                value={formData.actual_start_date}
                onChange={e => setFormData(prev => ({ ...prev, actual_start_date: e.target.value }))}
                className="w-[95%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">Variant URLs (Optional)</label>
              {variants.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 min-w-[80px]">{v.variant_name}</span>
                  <div className="relative flex-1 w-full">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.variantUrls[v.id] || ''}
                      onChange={e => setFormData(prev => ({ 
                        ...prev, 
                        variantUrls: { ...prev.variantUrls, [v.id]: e.target.value }
                      }))}
                      className="w-[90%] pl-9 pr-3 py-2 text-sm neumorphic-input rounded-xl"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card-subtle p-3 bg-amber-50/80 border border-amber-200/50 rounded-xl">
            <div className="flex gap-2">
              <ImageIcon size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Reminder:</strong> Upload variant screenshots in Experiment Details.
              </p>
            </div>
          </div>
        </div>
      )
    }

    if (newStatus === 'Completed') {
      const winnerVariants = variants.filter(v => !v.is_control)
      
      return (
        <div className="space-y-4">
          <div className="neumorphic-inset p-5 border-l-4 border-emerald-500 rounded-2xl">
            <p className="text-sm text-slate-700 font-semibold mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              Conclude experiment
            </p>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Actual End Date</label>
              <input
                type="date"
                value={formData.actual_end_date}
                onChange={e => setFormData(prev => ({ ...prev, actual_end_date: e.target.value }))}
                className="w-[92%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-600 mb-2">Outcome</label>
              <select
                value={formData.outcome}
                onChange={e => setFormData(prev => ({ ...prev, outcome: e.target.value }))}
                className="w-[95%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
              >
                <option value="Inconclusive">🤔 Inconclusive</option>
                <option value="Winner">🏆 Winner</option>
                <option value="Loser">📉 Loser</option>
              </select>
            </div>

            {formData.outcome === 'Winner' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-xs font-bold text-slate-600 mb-2">Select Winner</label>
                <div className="space-y-2">
                  {winnerVariants.map(v => (
                    <label key={v.id} className="flex items-center gap-3 p-3 neumorphic-card cursor-pointer hover:shadow-lg transition-all rounded-xl">
                      <input
                        type="radio"
                        name="winner"
                        value={v.id}
                        checked={formData.winner_variant_id === v.id}
                        onChange={() => setFormData(prev => ({ ...prev, winner_variant_id: v.id }))}
                        className="accent-emerald-500"
                      />
                      <span className="font-bold text-sm">{v.variant_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="glass-card-subtle p-3 bg-blue-50/80 border border-blue-200/50 rounded-xl">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Next Step:</strong> Update sessions and conversion data in Experiment Details.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-modal max-w-lg w-full p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Moving to {newStatus}</h3>
            <p className="text-sm text-slate-600 mt-1">{test.test_name}</p>
          </div>
          <button onClick={onClose} className="p-2 neumorphic-button rounded-xl">
            <X size={20} />
          </button>
        </div>

        {renderContent()}

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="px-5 py-2.5 neumorphic-button rounded-xl font-bold">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterModal({ filters, onApply, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-modal max-w-2xl w-full p-6 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 neumorphic-card rounded-xl">
              <SlidersHorizontal size={20} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Advanced Filters</h3>
          </div>
          <button onClick={onClose} className="p-2 neumorphic-button rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">📅 Date Range</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-600 mb-1">From</label>
                <input
                  type="date"
                  value={localFilters.dateFrom}
                  onChange={e => setLocalFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-[92%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">To</label>
                <input
                  type="date"
                  value={localFilters.dateTo}
                  onChange={e => setLocalFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-[92%] px-3 py-2.5 neumorphic-input rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">🏷️ Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    const newCats = localFilters.categories.includes(cat)
                      ? localFilters.categories.filter(c => c !== cat)
                      : [...localFilters.categories, cat]
                    setLocalFilters(prev => ({ ...prev, categories: newCats }))
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    localFilters.categories.includes(cat)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'neumorphic-button'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">📊 Status</label>
            <div className="flex flex-wrap gap-2">
              {COLUMNS.map(col => {
                const Icon = col.icon
                return (
                  <button
                    key={col.id}
                    onClick={() => {
                      const newStatuses = localFilters.statuses.includes(col.id)
                        ? localFilters.statuses.filter(s => s !== col.id)
                        : [...localFilters.statuses, col.id]
                      setLocalFilters(prev => ({ ...prev, statuses: newStatuses }))
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      localFilters.statuses.includes(col.id)
                        ? `bg-gradient-to-r ${col.gradient} text-white shadow-lg`
                        : 'neumorphic-button'
                    }`}
                  >
                    <Icon size={16} />
                    {col.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 pt-4 border-t border-slate-200">
          <button 
            onClick={() => setLocalFilters({ dateFrom: '', dateTo: '', categories: [], statuses: [] })}
            className="px-4 py-2 text-slate-600 neumorphic-button rounded-xl font-bold"
          >
            Clear All
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-5 py-2.5 neumorphic-button rounded-xl font-bold">
              Cancel
            </button>
            <button 
              onClick={() => {
                onApply(localFilters)
                onClose()
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExperimentCard({ test, onClick }) {
  const pieScore = test.pie_potential && test.pie_importance && test.pie_ease
    ? ((test.pie_potential + test.pie_importance + test.pie_ease) / 3).toFixed(1)
    : null

  const getDaysRunning = () => {
    if (!test.actual_start_date) return null
    const start = new Date(test.actual_start_date)
    const end = test.actual_end_date ? new Date(test.actual_end_date) : new Date()
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    return days
  }

  const renderContent = () => {
    switch (test.status) {
      case 'Backlog':
        return (
          <>
            <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">{test.test_name}</h4>
            {test.hypothesis && (
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{test.hypothesis}</p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-100">
                {test.test_category || 'Uncategorized'}
              </span>
            </div>
          </>
        )

      case 'Planned':
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 flex-1">{test.test_name}</h4>
              {pieScore && (
                <div className="flex items-center gap-1 bg-purple-50/80 px-2 py-1 rounded-lg border border-purple-200/50 ml-2">
                  <Target size={10} className="text-purple-600" />
                  <span className="text-xs font-black text-purple-600">{pieScore}</span>
                </div>
              )}
            </div>
            {test.hypothesis && (
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{test.hypothesis}</p>
            )}
            {test.planned_start_date && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <CalendarIcon size={12} />
                <span className="font-bold">
                  {new Date(test.planned_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {test.planned_end_date && ` - ${new Date(test.planned_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
              </div>
            )}
          </>
        )

      case 'Running':
        const daysRunning = getDaysRunning()
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 flex-1">{test.test_name}</h4>
              {daysRunning !== null && (
                <div className="flex items-center gap-1 bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-200/50 animate-pulse ml-2">
                  <Clock size={10} className="text-indigo-600" />
                  <span className="text-xs font-black text-indigo-600">{daysRunning}d</span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {test.primary_kpi && <span className="font-bold text-indigo-600">KPI: {test.primary_kpi}</span>}
            </p>
            {test.planned_end_date && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CalendarIcon size={12} />
                <span>Target: {new Date(test.planned_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
          </>
        )

      case 'Completed':
        return (
          <>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 flex-1">{test.test_name}</h4>
              {test.outcome && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ml-2 whitespace-nowrap ${
                  test.outcome === 'Winner' ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200' :
                  test.outcome === 'Loser' ? 'bg-red-100/80 text-red-700 border border-red-200' :
                  'bg-slate-100/80 text-slate-700 border border-slate-200'
                }`}>
                  {test.outcome === 'Winner' ? '🏆 Winner' : test.outcome === 'Loser' ? '📉 Loser' : '🤔 Inconclusive'}
                </span>
              )}
            </div>
            {test.outcome === 'Winner' && test.uplift && (
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-emerald-600" />
                <span className="text-sm font-black text-emerald-600">+{test.uplift}%</span>
              </div>
            )}
            {test.actual_end_date && (
              <p className="text-xs text-slate-600">
                Ended: {new Date(test.actual_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </>
        )

      default:
        return <h4 className="font-bold text-slate-900 text-sm">{test.test_name}</h4>
    }
  }

  return (
    <div 
      onClick={onClick}
      className="neumorphic-card p-4 cursor-pointer hover:shadow-xl transition-all duration-300 group mb-3 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-200/50">
          {test.test_number || 'N/A'}
        </span>
      </div>
      
      {renderContent()}
      
      <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-medium">
          {test.test_category || 'Uncategorized'}
        </span>
        <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  )
}

function DraggableItem({ test, onClick }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: test.id,
    data: { test }
  })
  
  if (isDragging) {
    return <div ref={setNodeRef} className="opacity-30"><ExperimentCard test={test} onClick={onClick} /></div>
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="outline-none touch-manipulation">
      <ExperimentCard test={test} onClick={onClick} />
    </div>
  )
}

function DroppableColumn({ col, tests, navigate, loading }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })
  const Icon = col.icon

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-full sm:w-80 md:w-[320px] rounded-2xl flex flex-col transition-all duration-300 h-full ${
        isOver ? 'ring-4 ring-blue-400/50 scale-[1.02]' : ''
      }`}
    >
      <div className="neumorphic-card p-4 mb-3 sticky top-0 z-10 bg-white/80 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${col.gradient} shadow-lg`}>
              <Icon size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">{col.label}</span>
          </div>
          <span className="text-sm font-black text-slate-600 neumorphic-badge px-3 py-1 rounded-full">
            {loading ? '...' : tests.length}
          </span>
        </div>
      </div>
      
      <div className={`flex-1 space-y-0 pb-4 min-h-[400px] sm:min-h-[600px] overflow-y-auto custom-scrollbar ${
        isOver ? 'bg-blue-50/30 rounded-xl p-2' : ''
      }`}>
        {loading ? (
          <>
            {[1, 2, 3].map(i => (
              <div key={i} className="neumorphic-card p-4 mb-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </>
        ) : tests.length === 0 ? (
          <div className="neumorphic-card p-8 text-center">
            <Icon size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-400">No experiments</p>
          </div>
        ) : (
          tests.map(test => (
            <DraggableItem 
              key={test.id} 
              test={test} 
              onClick={() => navigate(`/experiment/${test.id}`)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function TimelineView({ tests, navigate }) {
  const [timeRange, setTimeRange] = useState('6months')
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDateRange = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    switch (timeRange) {
      case 'year':
        return {
          start: new Date(year, 0, 1),
          end: new Date(year, 11, 31),
          label: year.toString()
        }
      case '6months':
        const startMonth = month < 6 ? 0 : 6
        return {
          start: new Date(year, startMonth, 1),
          end: new Date(year, startMonth + 5, 31),
          label: `${new Date(year, startMonth).toLocaleString('default', { month: 'short' })} - ${new Date(year, startMonth + 5).toLocaleString('default', { month: 'short' })} ${year}`
        }
      case 'month':
      default:
        return {
          start: new Date(year, month, 1),
          end: new Date(year, month + 1, 0),
          label: new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
        }
    }
  }

  const changeRange = (offset) => {
    const newDate = new Date(currentDate)
    if (timeRange === 'year') newDate.setFullYear(newDate.getFullYear() + offset)
    else if (timeRange === '6months') newDate.setMonth(newDate.getMonth() + (6 * offset))
    else newDate.setMonth(newDate.getMonth() + offset)
    setCurrentDate(newDate)
  }

  const getBarStyle = (test) => {
    const range = getDateRange()
    const hasActual = test.actual_start_date
    const isCompleted = test.status === 'Completed'
    
    const start = hasActual ? new Date(test.actual_start_date) : (test.planned_start_date ? new Date(test.planned_start_date) : null)
    const end = hasActual 
      ? (test.actual_end_date ? new Date(test.actual_end_date) : new Date())
      : (test.planned_end_date ? new Date(test.planned_end_date) : null)

    if (!start || !end) return null

    const totalDuration = range.end - range.start
    const startOffset = Math.max(0, start - range.start)
    const endOffset = Math.min(totalDuration, end - range.start)
    
    if (endOffset <= 0 || startOffset >= totalDuration) return null

    const left = (startOffset / totalDuration) * 100
    const width = ((endOffset - startOffset) / totalDuration) * 100

    let bgClass = hasActual
      ? (isCompleted ? 'bg-emerald-500 border-emerald-600' : 'bg-indigo-500 border-indigo-600 animate-pulse')
      : 'bg-slate-300 border-slate-400 border-dashed'

    return {
      style: { left: `${left}%`, width: `${Math.max(width, 2)}%` },
      className: `${bgClass} text-white shadow-lg`,
      tooltip: `${test.test_name}\n${hasActual ? (isCompleted ? 'Completed' : 'Running') : 'Planned'}\n${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    }
  }

  const filteredTests = tests.filter(t => {
    const start = t.actual_start_date || t.planned_start_date
    const end = t.actual_end_date || t.planned_end_date
    if (!start && !end) return false
    
    const range = getDateRange()
    const testStart = new Date(start)
    const testEnd = new Date(end || new Date())
    
    return !(testEnd < range.start || testStart > range.end)
  })

  return (
    <div className="neumorphic-card p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-500" />
            {getDateRange().label}
          </h3>
          <p className="text-xs text-slate-600 mt-1">{filteredTests.length} experiments in view</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 neumorphic-card px-2 py-1 rounded-xl">
            {['month', '6months', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {range === 'month' ? '1M' : range === '6months' ? '6M' : '1Y'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => changeRange(-1)} className="neumorphic-button p-2 rounded-xl">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => changeRange(1)} className="neumorphic-button p-2 rounded-xl">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] sm:min-w-[800px]">
          {filteredTests.map(test => {
            const barData = getBarStyle(test)
            if (!barData) return null

            return (
              <div 
                key={test.id}
                onClick={() => navigate(`/experiment/${test.id}`)}
                className="group relative grid grid-cols-[150px_1fr] sm:grid-cols-[200px_1fr] gap-4 py-3 border-b border-slate-100/50 hover:bg-slate-50/50 cursor-pointer transition-all rounded-lg px-2"
              >
                <div className="pr-4">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">{test.test_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ${
                      test.status === 'Running' ? 'bg-indigo-100/80 text-indigo-700' :
                      test.status === 'Completed' ? 'bg-emerald-100/80 text-emerald-700' :
                      'bg-slate-100/80 text-slate-700'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                </div>

                <div className="relative h-12 flex items-center">
                  <div 
                    className={`absolute h-6 rounded-lg flex items-center px-3 text-[10px] font-bold transition-all group-hover:h-8 border-2 ${barData.className}`}
                    style={barData.style}
                    title={barData.tooltip}
                  >
                    <span className="truncate hidden sm:inline">{test.test_name}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredTests.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No experiments in this time range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentProject } = useProject()
  
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDragItem, setActiveDragItem] = useState(null)
  const [view, setView] = useState('kanban')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    categories: [],
    statuses: []
  })
  
  const [transitionModal, setTransitionModal] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (currentProject?.id) fetchTests()
  }, [currentProject])

  const fetchTests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('experiments')
      .select('*')
      .eq('project_id', currentProject.id)
      .neq('status', 'Archived')
      .order('created_at', { ascending: false })
    
    if (error) toast.error('Error loading experiments')
    else setTests(data || [])
    
    setLoading(false)
  }

  const onDragStart = (e) => {
    setActiveDragItem(e.active.data.current?.test)
  }

  const onDragEnd = async (e) => {
    const { active, over } = e
    setActiveDragItem(null)
    if (!over) return

    const testId = active.id
    const activeTest = tests.find(t => t.id === testId)
    const newStatus = over.id
    const oldStatus = activeTest.status

    if (newStatus === oldStatus) return

    if (['Planned', 'Running', 'Completed', 'Paused'].includes(newStatus)) {
      setTransitionModal({ test: activeTest, newStatus })
      return
    }

    const { error } = await supabase
      .from('experiments')
      .update({ status: newStatus })
      .eq('id', testId)

    if (!error) {
      toast.success(`Moved to ${newStatus}`)
      fetchTests()
    } else {
      toast.error('Failed to move experiment')
    }
  }

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      const matchesSearch = test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (test.test_number && test.test_number.toLowerCase().includes(searchQuery.toLowerCase()))
      
      let matchesDate = true
      if (filters.dateFrom || filters.dateTo) {
        const testDate = new Date(test.actual_start_date || test.planned_start_date || test.created_at)
        if (filters.dateFrom && testDate < new Date(filters.dateFrom)) matchesDate = false
        if (filters.dateTo && testDate > new Date(filters.dateTo)) matchesDate = false
      }
      
      const matchesCategory = filters.categories.length === 0 || 
        filters.categories.includes(test.test_category)
      
      const matchesStatus = filters.statuses.length === 0 || 
        filters.statuses.includes(test.status || 'Backlog')
      
      return matchesSearch && matchesDate && matchesCategory && matchesStatus
    })
  }, [tests, searchQuery, filters])

  const stats = {
    total: tests.length,
    running: tests.filter(t => t.status === 'Running').length,
    completed: tests.filter(t => t.status === 'Completed').length,
    wins: tests.filter(t => t.outcome === 'Winner').length
  }

  const activeFilterCount = 
    (filters.dateFrom ? 1 : 0) + 
    (filters.dateTo ? 1 : 0) + 
    filters.categories.length + 
    filters.statuses.length

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4">
        <div className="neumorphic-card p-8 text-center max-w-md">
          <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 font-bold">Please select a project to continue</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .glass-card-subtle {
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(16px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.7);
        }
        .glass-modal {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(40px) saturate(200%);
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 25px 70px 0 rgba(31, 38, 135, 0.25);
          border-radius: 24px;
        }
        .neumorphic-card {
          background: linear-gradient(145deg, #ffffff, #f0f4f8);
          box-shadow: 8px 8px 20px rgba(163, 177, 198, 0.3),
                      -8px -8px 20px rgba(255, 255, 255, 0.9);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.8);
        }
        .neumorphic-button {
          background: linear-gradient(145deg, #f8fafc, #e2e8f0);
          box-shadow: 5px 5px 12px rgba(163, 177, 198, 0.4),
                      -5px -5px 12px rgba(255, 255, 255, 0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .neumorphic-button:hover {
          box-shadow: 2px 2px 8px rgba(163, 177, 198, 0.3),
                      -2px -2px 8px rgba(255, 255, 255, 0.8);
          transform: translateY(-1px);
        }
        .neumorphic-button:active {
          box-shadow: inset 3px 3px 8px rgba(163, 177, 198, 0.4),
                      inset -3px -3px 8px rgba(255, 255, 255, 0.7);
          transform: translateY(0);
        }
        .neumorphic-input {
          background: linear-gradient(145deg, #f1f5f9, #ffffff);
          box-shadow: inset 4px 4px 10px rgba(163, 177, 198, 0.3),
                      inset -4px -4px 10px rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.6);
          transition: all 0.3s ease;
        }
        .neumorphic-input:focus {
          box-shadow: inset 2px 2px 6px rgba(59, 130, 246, 0.2),
                      inset -2px -2px 6px rgba(255, 255, 255, 0.9);
          border-color: rgba(59, 130, 246, 0.4);
        }
        .neumorphic-inset {
          background: linear-gradient(145deg, #e8eef5, #f8fafc);
          box-shadow: inset 6px 6px 14px rgba(163, 177, 198, 0.25),
                      inset -6px -6px 14px rgba(255, 255, 255, 0.7);
        }
        .neumorphic-badge {
          background: linear-gradient(145deg, #ffffff, #f1f5f9);
          box-shadow: 3px 3px 8px rgba(163, 177, 198, 0.3),
                      -3px -3px 8px rgba(255, 255, 255, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(241, 245, 249, 0.6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(145deg, #cbd5e1, #94a3b8);
          border-radius: 10px;
          box-shadow: inset 2px 2px 4px rgba(148, 163, 184, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(145deg, #94a3b8, #64748b);
        }
        @media (max-width: 640px) {
          .neumorphic-card {
            box-shadow: 5px 5px 15px rgba(163, 177, 198, 0.25),
                        -5px -5px 15px rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 p-3 sm:p-4 md:p-8">
        <div className="max-w-[1900px] mx-auto space-y-4 sm:space-y-6">
          
          <div className="neumorphic-card p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 flex items-center gap-2 sm:gap-3">
                  <Sparkles size={24} className="text-blue-500 sm:w-7 sm:h-7" />
                  Experimentation Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">{currentProject.name}</p>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                <button 
                  onClick={() => setView(view === 'kanban' ? 'timeline' : 'kanban')}
                  className="neumorphic-button flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-sm flex-1 sm:flex-initial justify-center"
                >
                  {view === 'kanban' ? <CalendarIcon size={16} /> : <Grid3x3 size={16} />}
                  <span className="hidden sm:inline">{view === 'kanban' ? 'Timeline' : 'Kanban'}</span>
                </button>
                
                <button 
                  onClick={() => navigate('/newtest')} 
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 text-sm flex-1 sm:flex-initial justify-center"
                >
                  <Plus size={18} strokeWidth={3} />
                  <span className="hidden sm:inline">New Test</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Layers, label: 'Total', value: stats.total, gradient: 'from-slate-500 to-slate-600' },
              { icon: Play, label: 'Live', value: stats.running, gradient: 'from-indigo-500 to-purple-600' },
              { icon: CheckCircle, label: 'Done', value: stats.completed, gradient: 'from-emerald-500 to-teal-600' },
              { icon: Trophy, label: 'Winners', value: stats.wins, gradient: 'from-amber-500 to-orange-600' }
            ].map(({ icon: Icon, label, value, gradient }) => (
              <div key={label} className="neumorphic-card p-3 sm:p-4 hover:shadow-2xl transition-all group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase mb-1">{label}</p>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={16} className="text-white sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="neumorphic-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Search experiments..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-[80%] md:w-[92%] pl-9 sm:pl-12 pr-10 py-2.5 sm:py-3 neumorphic-input rounded-xl outline-none font-medium text-sm"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                  <X size={16} className="text-slate-400" />
                </button>
              )}
            </div>
            
            <button 
              onClick={() => setShowFilters(true)}
              className="neumorphic-button flex items-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-sm relative justify-center"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {view === 'kanban' ? (
            <DndContext 
              sensors={sensors} 
              collisionDetection={closestCorners} 
              onDragStart={onDragStart} 
              onDragEnd={onDragEnd}
            >
              <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto pb-4 sm:pb-8 min-h-[500px] sm:min-h-[700px]">
                {COLUMNS.map(col => (
                  <DroppableColumn 
                    key={col.id} 
                    col={col} 
                    tests={filteredTests.filter(t => (t.status || 'Backlog') === col.id)}
                    navigate={navigate}
                    loading={loading}
                  />
                ))}
              </div>
              
              <DragOverlay>
                {activeDragItem && (
                  <div className="w-full sm:w-80 md:w-[320px] transform rotate-2 scale-105 opacity-90">
                    <ExperimentCard test={activeDragItem} onClick={() => {}} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          ) : (
            <TimelineView tests={filteredTests} navigate={navigate} />
          )}
        </div>
      </div>

      {showFilters && (
        <FilterModal 
          filters={filters} 
          onApply={setFilters} 
          onClose={() => setShowFilters(false)} 
        />
      )}
      
      {transitionModal && (
        <StageTransitionModal 
          test={transitionModal.test}
          newStatus={transitionModal.newStatus}
          onClose={() => setTransitionModal(null)}
          onConfirm={() => {
            setTransitionModal(null)
            fetchTests()
          }}
        />
      )}
    </>
  )
}