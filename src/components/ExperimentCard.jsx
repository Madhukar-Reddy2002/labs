import { Clock, BarChart3, MoreVertical, Edit, Trash2, Copy, AlertCircle } from 'lucide-react'

// Helper for category colors
const CATEGORY_STYLES = {
  'Pricing': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Copy': 'bg-blue-100 text-blue-700 border-blue-200',
  'Design': 'bg-purple-100 text-purple-700 border-purple-200',
  'Other': 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function ExperimentCard({ test, isDragging, onEdit, onDelete, onDuplicate }) {
  
  // Calculate duration if running
  const getDuration = () => {
    if (!test.actual_start_date) return null
    const start = new Date(test.actual_start_date)
    const end = test.actual_end_date ? new Date(test.actual_end_date) : new Date()
    const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24))
    return `${diff} days`
  }

  return (
    <div className={`
      group relative bg-white/70 backdrop-blur-md border border-white/60 rounded-xl p-4 shadow-sm 
      hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing
      ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-2xl z-50' : ''}
    `}>
      
      {/* Header: ID & Actions */}
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
          {test.test_number || 'ID-###'}
        </span>
        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
          <MoreVertical size={14} />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-bold text-slate-800 text-sm leading-snug mb-3 line-clamp-2">
        {test.test_name}
      </h4>

      {/* Tags Row */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${CATEGORY_STYLES[test.test_category] || CATEGORY_STYLES.Other}`}>
          {test.test_category}
        </span>
        {test.pie_score > 0 && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-100 flex items-center gap-1">
            <AlertCircle size={8} /> PIE {test.pie_score}
          </span>
        )}
      </div>

      {/* Footer: Stats or Status */}
      <div className="pt-3 border-t border-slate-100/60 flex items-center justify-between text-xs font-medium text-slate-500">
        
        {/* KPI */}
        <div className="flex items-center gap-1.5" title="Primary KPI">
          <BarChart3 size={12} className="text-slate-400" />
          <span className="truncate max-w-[80px]">{test.primary_kpi}</span>
        </div>

        {/* Dynamic Status Indicator */}
        {test.status === 'Running' && (
          <div className="flex items-center gap-1.5 text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {getDuration()}
          </div>
        )}

        {test.status === 'Completed' && (
          <span className={`font-bold ${
            test.outcome === 'Winner' ? 'text-emerald-600' : 
            test.outcome === 'Loser' ? 'text-red-500' : 'text-slate-400'
          }`}>
            {test.outcome || 'Done'}
          </span>
        )}
      </div>

    </div>
  )
}