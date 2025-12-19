// ============================================
// FILE: components/experiment-details/ResultsAccordion.jsx
// ============================================

import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, Edit, Save, Trophy, Info } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

// Statistical Significance Calculator
function calculateSignificance(control, variant) {
  const n1 = control.sessions || 0
  const n2 = variant.sessions || 0
  const p1 = n1 > 0 ? control.conversions / n1 : 0
  const p2 = n2 > 0 ? variant.conversions / n2 : 0
  
  if (n1 === 0 || n2 === 0) return { oneTail: 0, twoTail: 0, zScore: 0 }
  
  const pooled = (control.conversions + variant.conversions) / (n1 + n2)
  const se = Math.sqrt(pooled * (1 - pooled) * (1/n1 + 1/n2))
  
  if (se === 0) return { oneTail: 0, twoTail: 0, zScore: 0 }
  
  const zScore = (p2 - p1) / se
  
  // Standard normal CDF approximation
  const phi = (z) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(z))
    const d = 0.3989423 * Math.exp(-z * z / 2)
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
    return z > 0 ? 1 - prob : prob
  }
  
  const oneTail = (1 - phi(Math.abs(zScore))) * 100
  const twoTail = (1 - phi(Math.abs(zScore))) * 2 * 100
  
  return { 
    oneTail: Math.max(0, Math.min(100, oneTail)),
    twoTail: Math.max(0, Math.min(100, twoTail)),
    zScore: zScore
  }
}

function ConfidenceIndicator({ control, variant }) {
  const sig = calculateSignificance(control, variant)
  const totalSessions = (control?.sessions || 0) + (variant?.sessions || 0)
  
  let label = 'Insufficient Data'
  let percent = 5
  let color = 'from-slate-300 to-slate-400'
  let textColor = 'text-slate-500'
  let bgColor = 'bg-slate-100/50'

  if (sig.twoTail < 5) {
    label = 'Statistically Significant ✓'
    percent = 95
    color = 'from-emerald-500 to-teal-500'
    textColor = 'text-emerald-700'
    bgColor = 'bg-emerald-50/50'
  } else if (sig.twoTail < 10) {
    label = 'Approaching Significance'
    percent = 70
    color = 'from-blue-500 to-indigo-500'
    textColor = 'text-blue-700'
    bgColor = 'bg-blue-50/50'
  } else if (totalSessions >= 100) {
    label = 'Trending...'
    percent = 40
    color = 'from-amber-500 to-orange-500'
    textColor = 'text-amber-700'
    bgColor = 'bg-amber-50/50'
  }

  return (
    <div className={`${bgColor} backdrop-blur-xl rounded-xl p-4 border border-white/60`}>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold uppercase tracking-wider ${textColor}`}>{label}</span>
        <span className="text-xs font-bold text-slate-600">{totalSessions.toLocaleString()} sessions</span>
      </div>
      <div className="w-full h-2.5 bg-slate-200/50 backdrop-blur-sm rounded-full overflow-hidden">
        <div 
          className={`bg-gradient-to-r ${color} h-full transition-all duration-700 ease-out shadow-lg`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-white/60">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">One-Tail p</div>
          <div className="text-sm font-black text-slate-700">{sig.oneTail.toFixed(3)}%</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-white/60">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Two-Tail p</div>
          <div className="text-sm font-black text-slate-700">{sig.twoTail.toFixed(3)}%</div>
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2.5 border border-white/60">
          <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Z-Score</div>
          <div className="text-sm font-black text-slate-700">{sig.zScore.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsAccordion({ variants, setVariants, experimentId }) {
  const [isOpen, setIsOpen] = useState(true)
  const [editingResults, setEditingResults] = useState(false)
  const [resultsData, setResultsData] = useState(() => {
    const init = {}
    variants.forEach(v => {
      init[v.id] = { sessions: v.sessions || 0, conversions: v.conversions || 0 }
    })
    return init
  })
  const [saving, setSaving] = useState(false)

  const saveResults = async () => {
    setSaving(true)
    const toastId = toast.loading("Calculating statistics...")

    try {
      // Calculate stats for each variant
      const updatedVariants = variants.map(v => {
        const d = resultsData[v.id]
        const sessions = parseInt(d.sessions) || 0
        const conversions = parseInt(d.conversions) || 0
        const cr = sessions > 0 ? (conversions / sessions) * 100 : 0
        return { ...v, sessions, conversions, conversion_rate: cr }
      })

      // Calculate uplift vs control
      const control = updatedVariants.find(v => v.is_control)
      const finalVariants = updatedVariants.map(v => {
        let uplift = 0
        if (!v.is_control && control?.conversion_rate > 0) {
          uplift = ((v.conversion_rate - control.conversion_rate) / control.conversion_rate) * 100
        }
        return { ...v, uplift_percentage: uplift }
      })

      // Update database
      await Promise.all(finalVariants.map(v => 
        supabase.from('variants').update({
          sessions: v.sessions,
          conversions: v.conversions,
          conversion_rate: v.conversion_rate,
          uplift_percentage: v.uplift_percentage
        }).eq('id', v.id)
      ))

      setVariants(finalVariants)
      setEditingResults(false)
      toast.success("Results updated successfully!", { id: toastId })

    } catch (error) {
      toast.error("Failed to save results", { id: toastId })
    } finally {
      setSaving(false)
    }
  }

  const totalSessions = variants.reduce((a, b) => a + (b.sessions || 0), 0)
  const totalConversions = variants.reduce((a, b) => a + (b.conversions || 0), 0)
  const avgCR = totalSessions ? ((totalConversions / totalSessions) * 100).toFixed(2) : 0
  const winner = variants.find(v => v.uplift_percentage > 0 && !v.is_control)
  const control = variants.find(v => v.is_control)
  const challenger = variants.find(v => !v.is_control)

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="p-6 cursor-pointer hover:bg-white/40 transition-all flex items-center justify-between"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <TrendingUp className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Results Analysis</h3>
              {!isOpen && (
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  {totalSessions.toLocaleString()} sessions • {avgCR}% avg CR
                  {winner && <span className="text-emerald-600 ml-2">• {winner.variant_name} leading</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOpen && totalSessions > 0 && (
              <Trophy className="text-amber-500" size={18} />
            )}
            {isOpen ? <ChevronUp size={20} className="text-slate-400"/> : <ChevronDown size={20} className="text-slate-400"/>}
          </div>
        </div>

        {/* Content */}
        {isOpen && (
          <div className="px-6 pb-6 space-y-6">
            
            {/* Action Button */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if(editingResults) saveResults()
                  else setEditingResults(true)
                }}
                disabled={saving}
                className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 backdrop-blur-xl border ${
                  editingResults 
                    ? 'bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/80 border-emerald-200/50' 
                    : 'bg-white/60 text-slate-600 hover:bg-white/80 border-white/60'
                }`}
              >
                {editingResults ? <Save size={16}/> : <Edit size={16}/>}
                {editingResults ? 'Save & Calculate' : 'Edit Data'}
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200/50">
                    <th className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Variant</th>
                    <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Sessions</th>
                    <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Conversions</th>
                    <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">CR %</th>
                    <th className="text-right py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Uplift</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className={`border-b border-slate-100/50 group/row transition-colors ${winner?.id === v.id ? 'bg-amber-50/30' : 'hover:bg-slate-50/30'}`}>
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${v.is_control ? 'bg-slate-400' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}></span>
                          <span className="font-bold text-slate-800">{v.variant_name}</span>
                          {v.is_control && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold border border-slate-200">CONTROL</span>}
                          {winner?.id === v.id && <Trophy size={14} className="text-amber-500"/>}
                        </div>
                      </td>
                      <td className="text-right py-4 px-3">
                        {editingResults ? (
                          <input 
                            type="number" 
                            className="w-24 text-right bg-white/60 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            value={resultsData[v.id]?.sessions}
                            onChange={e => setResultsData(p => ({...p, [v.id]: {...p[v.id], sessions: e.target.value}}))}
                          />
                        ) : <span className="font-mono text-slate-700 font-medium">{v.sessions?.toLocaleString()}</span>}
                      </td>
                      <td className="text-right py-4 px-3">
                        {editingResults ? (
                          <input 
                            type="number" 
                            className="w-24 text-right bg-white/60 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            value={resultsData[v.id]?.conversions}
                            onChange={e => setResultsData(p => ({...p, [v.id]: {...p[v.id], conversions: e.target.value}}))}
                          />
                        ) : <span className="font-mono text-slate-700 font-medium">{v.conversions?.toLocaleString()}</span>}
                      </td>
                      <td className="text-right py-4 px-3 font-bold text-slate-800">{v.conversion_rate?.toFixed(2)}%</td>
                      <td className={`text-right py-4 px-3 font-black ${v.uplift_percentage > 0 ? 'text-emerald-600' : v.uplift_percentage < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                        {v.uplift_percentage ? `${v.uplift_percentage > 0 ? '+' : ''}${v.uplift_percentage.toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Statistical Significance */}
            {control && challenger && totalSessions > 0 && (
              <ConfidenceIndicator control={control} variant={challenger} />
            )}

            {/* Info Banner */}
            <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5"/>
              <div className="text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-blue-900">Statistical Note:</span> Results are considered statistically significant when the two-tail p-value is below 5%. Use one-tail tests when you have a directional hypothesis.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}