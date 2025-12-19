// ============================================
// FILE: components/experiment-details/StrategyCard.jsx
// ============================================

import { useState } from 'react'
import { Lightbulb, AlertCircle, Target, Monitor, Smartphone, Tag, ChevronDown, ChevronUp } from 'lucide-react'

export default function StrategyCard({ test }) {
  const [isOpen, setIsOpen] = useState(false)

  // Count items for summary
  const deviceCount = test.devices?.length || 0
  const tagCount = test.tags?.length || 0
  const channelCount = test.traffic_channels?.length || 0
  const totalItems = deviceCount + tagCount + channelCount

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        
        {/* Accordion Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-white/40 transition-all flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Target className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Strategy & Context</h3>
              {!isOpen && (
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {test.hypothesis ? 'Hypothesis defined' : 'No hypothesis'} • {totalItems} targeting rules
                </div>
              )}
            </div>
          </div>
          <div className="text-slate-400">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>

        {/* Accordion Content */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Hypothesis */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Lightbulb size={12} className="text-amber-500"/> Hypothesis
              </h4>
              <p className="text-sm font-medium text-slate-700 leading-relaxed bg-gradient-to-br from-amber-50/50 to-orange-50/50 backdrop-blur-sm rounded-xl p-3 border border-amber-200/30">
                {test.hypothesis || 'No hypothesis provided'}
              </p>
            </div>

            {/* Problem Statement */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <AlertCircle size={12} className="text-red-500"/> Problem Statement
              </h4>
              <p className="text-sm font-medium text-slate-700 leading-relaxed bg-gradient-to-br from-red-50/50 to-pink-50/50 backdrop-blur-sm rounded-xl p-3 border border-red-200/30">
                {test.problem_statement || 'No problem statement provided'}
              </p>
            </div>

            {/* Targeting & Tags */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Targeting & Tags</h4>
              <div className="flex flex-wrap gap-2">
                {/* Devices */}
                {test.devices?.map(d => (
                  <span 
                    key={d} 
                    className="px-3 py-1.5 bg-gradient-to-br from-slate-100 to-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-slate-200 shadow-sm"
                  >
                    {d === 'Desktop' ? <Monitor size={11}/> : <Smartphone size={11}/>} 
                    {d}
                  </span>
                ))}
                
                {/* Tags */}
                {test.tags?.map(t => (
                  <span 
                    key={t} 
                    className="px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Tag size={10}/> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Traffic Channels */}
            {test.traffic_channels && test.traffic_channels.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Traffic Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {test.traffic_channels.map(channel => (
                    <span 
                      key={channel}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200"
                    >
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary KPIs */}
            {test.secondary_kpis && test.secondary_kpis.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Secondary KPIs</h4>
                <div className="space-y-1.5">
                  {test.secondary_kpis.map((kpi, idx) => (
                    <div 
                      key={idx}
                      className="text-xs font-medium text-slate-600 bg-white/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/60"
                    >
                      • {kpi}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in-from-top-2 {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}