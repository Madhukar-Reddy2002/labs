import { ArrowRight, Activity, Calendar, DollarSign } from 'lucide-react'

export default function ProjectCard({ project, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white/60 hover:bg-white/80 backdrop-blur-xl border border-white/60 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 cursor-pointer overflow-hidden"
    >
      {/* Hover Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {project.name.charAt(0)}
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Active
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
        {project.name}
      </h3>
      <p className="text-xs text-slate-500 font-medium mb-6">
        {project.domain || 'No domain configured'}
      </p>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <DollarSign size={10} /> Budget
          </div>
          <div className="text-sm font-bold text-slate-700">
            ${project.budget_total?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
           <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <Calendar size={10} /> End Date
          </div>
          <div className="text-sm font-bold text-slate-700">
            {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : '-'}
          </div>
        </div>
      </div>

      <div className="flex items-center text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        Enter Workspace <ArrowRight size={14} className="ml-1" />
      </div>
    </div>
  )
}