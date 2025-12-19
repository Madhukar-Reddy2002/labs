// ============================================
// FILE: components/experiment-details/TimelineCard.jsx
// ============================================

import { useState } from 'react'
import { Calendar, Clock, Play, CheckCircle, ChevronDown, ChevronUp, Timer } from 'lucide-react'

export default function TimelineCard({ test }) {
  const [isOpen, setIsOpen] = useState(false)

  const calculateDaysRunning = () => {
    if (!test.actual_start_date) return 0
    const start = new Date(test.actual_start_date)
    const end = test.actual_end_date ? new Date(test.actual_end_date) : new Date()
    return Math.floor((end - start) / (1000 * 60 * 60 * 24))
  }

  const daysRunning = calculateDaysRunning()

  // Get key timeline info for summary
  const getTimelineSummary = () => {
    if (test.status === 'Running' && daysRunning > 0) {
      return `${daysRunning} days running`
    }
    if (test.status === 'Completed' && test.actual_end_date) {
      return `Completed ${new Date(test.actual_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    if (test.planned_start_date) {
      return `Planned: ${new Date(test.planned_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
    return 'No timeline set'
  }

  const timelineEvents = [
    {
      label: 'Planned Start',
      date: test.planned_start_date,
      icon: Calendar,
      color: 'slate',
      show: test.planned_start_date
    },
    {
      label: 'Actual Start',
      date: test.actual_start_date,
      icon: Play,
      color: 'emerald',
      show: test.actual_start_date
    },
    {
      label: 'Time Running',
      date: `${daysRunning} days`,
      icon: Timer,
      color: 'blue',
      show: test.status === 'Running' && daysRunning > 0,
      isCustom: true
    },
    {
      label: 'Completed',
      date: test.actual_end_date,
      icon: CheckCircle,
      color: 'purple',
      show: test.status === 'Completed' && test.actual_end_date
    },
    {
      label: 'Planned End',
      date: test.planned_end_date,
      icon: Calendar,
      color: 'amber',
      show: test.planned_end_date && test.status !== 'Completed'
    }
  ]

  const colorMap = {
    slate: 'from-slate-500 to-slate-600',
    emerald: 'from-emerald-500 to-teal-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600',
    amber: 'from-amber-500 to-orange-600'
  }

  const visibleEvents = timelineEvents.filter(e => e.show)

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        
        {/* Header - Clickable */}
        <div 
          className="p-6 cursor-pointer hover:bg-white/40 transition-all flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Clock className="text-white" size={18} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Timeline</h3>
              {!isOpen && (
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {getTimelineSummary()} • {visibleEvents.length} events
                </div>
              )}
            </div>
          </div>
          {isOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
        </div>

        {/* Content - Expandable */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-4">
            {visibleEvents.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 group/item">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[event.color]} shadow-md flex-shrink-0`}>
                  <event.icon size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    {event.label}
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {event.isCustom 
                      ? event.date 
                      : new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })
                    }
                  </div>
                </div>
              </div>
            ))}

            {test.status === 'Running' && daysRunning > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-200/50">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-500 font-bold">Progress</span>
                  <span className="text-slate-700 font-bold">{daysRunning} days live</span>
                </div>
                <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
              </div>
            )}

            {visibleEvents.length === 0 && (
              <div className="text-center py-6">
                <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No timeline events yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}