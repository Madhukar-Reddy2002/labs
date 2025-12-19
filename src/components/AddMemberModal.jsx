import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { 
  X, UserPlus, Search, Mail, Loader2, 
  ShieldCheck, ShieldAlert, Eye, Edit3, Crown 
} from 'lucide-react'

const ROLES = [
  { value: 'viewer', label: 'Viewer', icon: <Eye size={14} />, desc: 'Read-only' },
  { value: 'member', label: 'Member', icon: <Edit3 size={14} />, desc: 'Can edit' },
  { value: 'admin', label: 'Admin', icon: <Crown size={14} />, desc: 'Manage team' }
]

export default function AddMemberModal({ projectId, onClose, onMemberAdded }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [selectedRole, setSelectedRole] = useState('member')

  // 1. Search Logic
  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) { setSuggestions([]); return }
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .ilike('email', `%${query}%`)
        .limit(4)
      setSuggestions(data || [])
      setLoading(false)
    }
    const timer = setTimeout(searchUsers, 300)
    return () => clearTimeout(timer)
  }, [query])

  // 2. Invite Logic
  const handleInvite = async (targetEmail, targetId = null) => {
    setAdding(true)
    try {
      const { error } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: targetId,
          email: targetEmail,
          role: selectedRole,
          status: targetId ? 'active' : 'pending'
        })

      if (error) {
        if (error.code === '23505') throw new Error("This user is already in the project!")
        throw error
      }

      toast.success("Team member updated!")
      if (onMemberAdded) onMemberAdded()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 relative border border-white/20">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Expand Team</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Project Access</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all">
            <X size={20}/>
          </button>
        </div>

        {/* --- NEUMORPHIC ROLE SELECTOR --- */}
        <div className="mb-8">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block ml-1">Select Permission Level</label>
          <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            {ROLES.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300
                  ${selectedRole === role.value 
                    ? 'bg-white shadow-neu-sm text-blue-600 scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-600'}
                `}
              >
                <div className={`mb-1 ${selectedRole === role.value ? 'text-blue-500' : 'text-slate-300'}`}>
                  {role.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{role.label}</span>
                {selectedRole === role.value && (
                   <div className="absolute -top-1 -right-1 bg-blue-500 w-2 h-2 rounded-full border-2 border-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* --- SEARCH INPUT --- */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-4 text-slate-300">
            {loading ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
          </div>
          <input 
            type="email"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type user email..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 shadow-inner"
          />
        </div>

        {/* --- SUGGESTIONS / ACTION --- */}
        <div className="space-y-2 min-h-[60px]">
          {suggestions.map((user) => (
            <button
              key={user.id}
              onClick={() => handleInvite(user.email, user.id)}
              disabled={adding}
              className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black uppercase shadow-sm">
                  {user.email[0]}
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800 line-clamp-1">{user.full_name || user.email.split('@')[0]}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{user.email}</p>
                </div>
              </div>
              <div className="p-2 bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-all">
                <UserPlus size={16} />
              </div>
            </button>
          ))}

          {/* Manual Invite Fallback */}
          {query && suggestions.length === 0 && !loading && (
            <div className="p-6 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
              <Mail className="mx-auto text-slate-300 mb-3" size={24}/>
              <p className="text-xs font-bold text-slate-500 mb-4">User not found in our database.</p>
              <button 
                onClick={() => handleInvite(query)}
                disabled={adding || !query.includes('@')}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
              >
                {adding ? <Loader2 className="animate-spin" size={18}/> : <Mail size={16}/>}
                Invite via External Email
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .shadow-neu-sm {
          box-shadow: 4px 4px 10px #e2e8f0, -4px -4px 10px #ffffff;
        }
      `}</style>
    </div>
  )
}