// ============================================
// FILE: components/experiment-details/PIEScoreCard.jsx
// ============================================

import { useState } from 'react'
import { Target, TrendingUp, Zap, Star, ChevronDown, ChevronUp } from 'lucide-react'

export default function PIEScoreCard({ test, pieScore }) {
  const [isOpen, setIsOpen] = useState(false)

  const metrics = [
    { label: 'Potential', val: test.pie_potential, icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
    { label: 'Importance', val: test.pie_importance, icon: Star, color: 'from-purple-500 to-pink-500' },
    { label: 'Ease', val: test.pie_ease, icon: Zap, color: 'from-emerald-500 to-teal-500' }
  ]

  const getScoreColor = (score) => {
    if (score >= 8) return 'from-emerald-500 to-teal-500'
    if (score >= 6) return 'from-blue-500 to-indigo-500'
    if (score >= 4) return 'from-amber-500 to-orange-500'
    return 'from-slate-400 to-slate-500'
  }

  const getScoreLabel = (score) => {
    if (score >= 8) return '🔥 High Priority'
    if (score >= 6) return '✨ Good Candidate'
    if (score >= 4) return '⚡ Medium Priority'
    return '📋 Low Priority'
  }

  return (
    <div className="relative group overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl text-white shadow-2xl border border-white/10 backdrop-blur-xl overflow-hidden">
        
        {/* Accordion Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-white/5 transition-all flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br ${getScoreColor(pieScore)} rounded-xl backdrop-blur-xl shadow-lg`}>
              <Target className="text-white" size={20}/>
            </div>
            <div>
              <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">PIE Priority Score</div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-black tracking-tight">{pieScore}</div>
                <div className="text-xs text-indigo-200">out of 10</div>
              </div>
              {!isOpen && (
                <div className="text-xs text-indigo-300 mt-1 font-medium">
                  {getScoreLabel(pieScore)}
                </div>
              )}
            </div>
          </div>
          <div className="text-white/60">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Accordion Content */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {metrics.map((m, idx) => {
              const IconComponent = m.icon
              return (
                <div key={idx} className="group/metric">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-100 mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent size={12} className="opacity-70"/>
                      <span>{m.label}</span>
                    </div>
                    <span className="text-white">{m.val}/10</span>
                  </div>
                  <div className="relative w-full h-2 bg-black/20 backdrop-blur-sm rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${m.color} rounded-full transition-all duration-700 shadow-lg`}
                      style={{ width: `${m.val * 10}%` }}
                    />
                    {/* Shimmer effect */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{ 
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s infinite'
                      }}
                    />
                  </div>
                </div>
              )
            })}

            {/* Score interpretation */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-xs text-indigo-200 font-medium">
                {pieScore >= 8 ? '🔥 High Priority - Run ASAP' :
                 pieScore >= 6 ? '✨ Good Candidate - Plan Soon' :
                 pieScore >= 4 ? '⚡ Medium Priority - Backlog' :
                 '📋 Low Priority - Future Consideration'}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes slide-in-from-top-2 {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}