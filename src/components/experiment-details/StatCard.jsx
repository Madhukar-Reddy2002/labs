export default function StatCard({ icon: Icon, label, value, change, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-500 to-indigo-600",
    green: "from-emerald-500 to-teal-600",
    amber: "from-amber-500 to-orange-600",
    purple: "from-purple-500 to-pink-600"
  }

  return (
    <div className="relative group">
      {/* Glassmorphic card with subtle glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg shadow-${color}-500/30`}>
            <Icon size={20} className="text-white" />
          </div>
          {change && (
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-xl ${
              parseFloat(change) > 0 
                ? 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/50' 
                : 'bg-red-100/80 text-red-700 border border-red-200/50'
            }`}>
              {parseFloat(change) > 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</div>
        <div className="text-3xl font-black text-slate-900">{value}</div>
      </div>
    </div>
  )
}