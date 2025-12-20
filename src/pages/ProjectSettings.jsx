import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Save, Trash2, Users, Settings, 
  Globe, DollarSign, Calendar, Shield, X, 
  UserPlus, Loader2, Zap, Layout, Clock, 
  Mail, ChevronRight, UserMinus, Check
} from 'lucide-react'
import AddMemberModal from '../components/AddMemberModal'

export default function ProjectSettings() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [saving, setSaving] = useState(false)
  
  const [activeTab, setActiveTab] = useState('general')
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (projectId) fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      
      // Fetch Project and Members (using the explicit Foreign Key hint)
      const [projRes, memsRes] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single(),
        supabase
          .from('project_members')
          .select(`
            id,
            role,
            email,
            user_id,
            status,
            joined_at,
            profiles!project_members_user_id_fkey (
              full_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)
          .order('joined_at', { ascending: true })
      ])

      if (projRes.error) throw projRes.error
      if (memsRes.error) throw memsRes.error

      setProject(projRes.data)
      setMembers(memsRes.data || [])

    } catch (error) {
      console.error("Settings Error:", error)
      toast.error("Project not found or access denied")
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          domain: project.domain,
          budget_total: project.budget_total,
          planned_start_date: project.planned_start_date,
          planned_end_date: project.planned_end_date
        })
        .eq('id', projectId)

      if (error) throw error
      toast.success("Identity Updated")
      navigate('/')
    } catch (error) {
      toast.error("Update failed")
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error
      toast.success("Permissions Synced")
      fetchProjectData()
    } catch (error) {
      toast.error("Permission error")
    }
  }

  const handleRemoveMember = async (memberId) => {
    if(!confirm("Revoke user access?")) return
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId)
      
      if (error) throw error
      toast.success("Member removed")
      fetchProjectData()
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  if (loading) return (
    <div className="min-h-screen w-full overflow-x-hidden flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="relative animate-spin text-indigo-600" size={40} />
        </div>
        <p className="text-sm font-semibold text-slate-500">Loading settings...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100/50 pb-32">
      
      {/* Header Area */}
      <div className="bg-gradient-to-br from-white/80 via-slate-50/50 to-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button 
              onClick={() => navigate('/')} 
              className="
                shrink-0 p-2 sm:p-2.5 
                bg-gradient-to-br from-slate-50 to-white
                border border-slate-200/60
                rounded-lg sm:rounded-xl 
                shadow-[2px_2px_6px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]
                hover:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                transition-all duration-200
                group
              "
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5 text-slate-600 group-hover:text-slate-900" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight truncate">{project?.name}</h1>
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Layout size={10} className="shrink-0" /> 
                <span className="hidden sm:inline">Project</span> Settings
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-10 grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`
              w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all
              ${activeTab === 'general' 
                ? 'bg-gradient-to-br from-white to-slate-50 shadow-[2px_2px_8px_rgba(99,102,241,0.1),-2px_-2px_8px_rgba(255,255,255,0.9)] text-indigo-600 border border-indigo-100' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'
              }
            `}
          >
            <Settings size={18} className="sm:w-5 sm:h-5 shrink-0" /> 
            <span className="truncate">General</span>
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`
              w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all
              ${activeTab === 'team' 
                ? 'bg-gradient-to-br from-white to-slate-50 shadow-[2px_2px_8px_rgba(99,102,241,0.1),-2px_-2px_8px_rgba(255,255,255,0.9)] text-indigo-600 border border-indigo-100' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-white/50'
              }
            `}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Users size={18} className="sm:w-5 sm:h-5 shrink-0" /> 
              <span className="truncate">Team</span>
            </div>
            <span className="shrink-0 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{members.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('danger')}
            className={`
              w-full flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all
              ${activeTab === 'danger' 
                ? 'bg-gradient-to-br from-red-50 to-red-100/50 text-red-600 border border-red-200' 
                : 'text-slate-400 hover:text-red-500 hover:bg-red-50/30'
              }
            `}
          >
            <Trash2 size={18} className="sm:w-5 sm:h-5 shrink-0" /> 
            <span className="truncate">Danger Zone</span>
          </button>
        </aside>

        {/* Content Area */}
        <main className="min-w-0">
          {activeTab === 'general' && project && (
            <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Core Identity */}
              <section className="
                bg-gradient-to-br from-white/90 via-slate-50/50 to-white/90
                backdrop-blur-md 
                rounded-2xl sm:rounded-3xl 
                border border-slate-200/60
                p-5 sm:p-8 lg:p-10 
                shadow-[2px_2px_12px_rgba(0,0,0,0.06),-2px_-2px_12px_rgba(255,255,255,0.9)]
              ">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-lg sm:rounded-xl shadow-sm">
                    <Zap size={18} className="sm:w-5 sm:h-5"/>
                  </div>
                  <span>Core Identity</span>
                </h3>
                
                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 sm:mb-3 block">Display Name</label>
                    <input 
                      value={project.name || ''} 
                      onChange={e => setProject({...project, name: e.target.value})}
                      className="
                        w-[90%] px-4 sm:px-6 py-3 sm:py-4 
                        bg-white 
                        border border-slate-200/60
                        rounded-xl sm:rounded-2xl 
                        font-semibold text-sm sm:text-base text-slate-900 
                        shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                        focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                        focus:border-indigo-200
                        outline-none 
                        transition-all
                      "
                    />
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 sm:mb-3 block">Primary Domain</label>
                      <div className="relative">
                        <Globe className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          value={project.domain || ''} 
                          onChange={e => setProject({...project, domain: e.target.value})}
                          className="
                            w-[82%] pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 
                            bg-white 
                            border border-slate-200/60
                            rounded-xl sm:rounded-2xl 
                            font-semibold text-sm sm:text-base text-slate-700
                            shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                            focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                            focus:border-indigo-200
                            outline-none 
                            transition-all
                          "
                          placeholder="example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 sm:mb-3 block">Quarterly Budget</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input 
                          type="number"
                          value={project.budget_total || ''} 
                          onChange={e => setProject({...project, budget_total: e.target.value})}
                          className="
                            w-[82%] pl-11 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 
                            bg-white 
                            border border-slate-200/60
                            rounded-xl sm:rounded-2xl 
                            font-semibold text-sm sm:text-base text-slate-700
                            shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                            focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                            focus:border-indigo-200
                            outline-none 
                            transition-all
                          "
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Timeline */}
              <section className="
                bg-gradient-to-br from-white/90 via-slate-50/50 to-white/90
                backdrop-blur-md 
                rounded-2xl sm:rounded-3xl 
                border border-slate-200/60
                p-5 sm:p-8 lg:p-10 
                shadow-[2px_2px_12px_rgba(0,0,0,0.06),-2px_-2px_12px_rgba(255,255,255,0.9)]
              ">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-6 sm:mb-8 flex items-center gap-3">
                  <div className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 rounded-lg sm:rounded-xl shadow-sm">
                    <Clock size={18} className="sm:w-5 sm:h-5"/>
                  </div>
                  <span>Timeline</span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 sm:mb-3 block">Launch Date</label>
                    <input 
                      type="date"
                      value={project.planned_start_date || ''} 
                      onChange={e => setProject({...project, planned_start_date: e.target.value})}
                      className="
                        w-[92%] px-4 sm:px-6 py-3 sm:py-4 
                        bg-white 
                        border border-slate-200/60
                        rounded-xl sm:rounded-2xl 
                        font-semibold text-sm sm:text-base text-slate-700
                        shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                        focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                        focus:border-indigo-200
                        outline-none 
                        transition-all
                      "
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 sm:mb-3 block">Project Sunset</label>
                    <input 
                      type="date"
                      value={project.planned_end_date || ''} 
                      onChange={e => setProject({...project, planned_end_date: e.target.value})}
                      className="
                        w-[92%] px-4 sm:px-6 py-3 sm:py-4 
                        bg-white 
                        border border-slate-200/60
                        rounded-xl sm:rounded-2xl 
                        font-semibold text-sm sm:text-base text-slate-700
                        shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.9)]
                        focus:shadow-[inset_2px_2px_8px_rgba(99,102,241,0.1),inset_-2px_-2px_8px_rgba(255,255,255,0.9)]
                        focus:border-indigo-200
                        outline-none 
                        transition-all
                      "
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="
              bg-gradient-to-br from-white/90 via-slate-50/50 to-white/90
              backdrop-blur-md 
              rounded-2xl sm:rounded-3xl 
              border border-slate-200/60
              overflow-hidden 
              shadow-[2px_2px_12px_rgba(0,0,0,0.06),-2px_-2px_12px_rgba(255,255,255,0.9)]
              animate-in fade-in slide-in-from-bottom-2 duration-300
            ">
              <div className="p-5 sm:p-8 lg:p-10 border-b border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-br from-white/50 to-transparent">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">Project Team</h3>
                  <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">Manage roles and permissions</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="
                    w-full sm:w-auto
                    bg-gradient-to-br from-indigo-600 to-blue-600
                    text-white px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl 
                    font-bold text-sm sm:text-base flex items-center justify-center gap-2 
                    shadow-[0_4px_16px_rgba(99,102,241,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
                    hover:scale-[1.02]
                    active:scale-[0.98]
                    transition-all
                  "
                >
                  <UserPlus size={18}/> Invite Member
                </button>
              </div>

              <div className="divide-y divide-slate-200/60">
                {members.map((member) => {
                  const displayName = member.profiles?.full_name || (member.email ? member.email.split('@')[0] : 'Unknown User');
                  const avatar = member.profiles?.avatar_url;
                  const initial = member.email ? member.email[0].toUpperCase() : '?';
                  const isYou = member.user_id === user?.id;

                  return (
                    <div key={member.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/80 transition-all group">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto">
                        <div className="
                          shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl 
                          bg-gradient-to-br from-slate-100 to-slate-200 
                          flex items-center justify-center 
                          font-black text-sm text-slate-600 
                          shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]
                          ring-2 ring-white overflow-hidden
                        ">
                          {avatar ? (
                            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
                          ) : initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm sm:text-base text-slate-900 flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="truncate">{displayName}</span>
                            {isYou && (
                              <span className="shrink-0 text-[8px] bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">You</span>
                            )}
                            {member.status === 'pending' && (
                              <span className="shrink-0 text-[8px] bg-gradient-to-r from-amber-100 to-orange-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Pending</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 truncate">
                            <Mail size={10} className="shrink-0"/> 
                            <span className="truncate">{member.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          <select 
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            disabled={member.role === 'owner'}
                            className="
                              w-full appearance-none 
                              bg-white 
                              border border-slate-200/60
                              pl-4 pr-10 py-2.5 rounded-xl 
                              text-[10px] sm:text-xs font-black text-slate-700 
                              shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]
                              focus:border-indigo-200
                              outline-none 
                              cursor-pointer 
                              disabled:opacity-50 
                              uppercase tracking-wider
                              transition-all
                            "
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <Shield size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>

                        {!isYou && member.role !== 'owner' && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="
                              shrink-0 p-2.5 sm:p-3 
                              text-slate-300 
                              hover:text-red-500 hover:bg-red-50 
                              rounded-xl 
                              shadow-[2px_2px_4px_rgba(0,0,0,0.04),-1px_-1px_2px_rgba(255,255,255,0.9)]
                              transition-all
                            "
                          >
                            <UserMinus size={16} className="sm:w-[18px] sm:h-[18px]"/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="
              bg-gradient-to-br from-red-50/80 via-red-50/50 to-red-100/50
              backdrop-blur-md 
              rounded-2xl sm:rounded-3xl 
              border border-red-200/60
              p-5 sm:p-8 lg:p-10 
              shadow-[2px_2px_12px_rgba(239,68,68,0.1),-2px_-2px_12px_rgba(255,255,255,0.9)]
              animate-in fade-in slide-in-from-bottom-2 duration-300
            ">
               <div className="flex items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                 <div className="shrink-0 p-2.5 sm:p-3 bg-gradient-to-br from-red-100 to-red-200 text-red-600 rounded-xl sm:rounded-2xl shadow-sm">
                   <Trash2 size={20} className="sm:w-6 sm:h-6"/>
                 </div>
                 <div className="min-w-0">
                   <h3 className="text-xl sm:text-2xl font-black text-red-900 mb-1">Destroy Project</h3>
                   <p className="text-red-600 font-medium text-xs sm:text-sm">This action is permanent and irreversible.</p>
                 </div>
               </div>
               <button 
                onClick={async () => {
                  if(confirm(`Are you sure you want to delete "${project.name}"?`)) {
                    await supabase.from('projects').delete().eq('id', projectId)
                    toast.success("Project Erased")
                    navigate('/')
                  }
                }}
                className="
                  w-full py-3.5 sm:py-4 
                  bg-gradient-to-br from-red-600 to-red-700
                  text-white 
                  rounded-xl sm:rounded-2xl 
                  font-black text-sm sm:text-base
                  hover:shadow-lg
                  active:scale-[0.98]
                  transition-all
                "
               >
                 Permanently Delete Workspace
               </button>
            </div>
          )}
        </main>
      </div>

      {/* Sticky Save Button - Bottom */}
      {activeTab === 'general' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pb-6 sm:pb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="
              bg-white/80
              backdrop-blur-2xl
              border border-white
              rounded-2xl sm:rounded-[2.5rem]
              p-3 sm:p-4
              shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.5)]
              flex items-center justify-between
              gap-4
            ">
              <div className="hidden sm:flex items-center gap-3 pl-4">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Unsaved Changes Detected
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/')}
                  className="
                    flex-1 sm:flex-none
                    px-6 py-3
                    rounded-xl sm:rounded-2xl
                    font-bold text-sm
                    text-slate-500
                    hover:text-slate-800
                    hover:bg-slate-100
                    transition-all
                  "
                >
                  Discard
                </button>
                <button
                  onClick={handleUpdateProject}
                  disabled={saving}
                  className="
                    flex-[2] sm:flex-none
                    min-w-[140px]
                    bg-slate-900
                    text-white
                    px-8 py-3.5
                    rounded-xl sm:rounded-2xl
                    font-black text-sm
                    flex items-center justify-center gap-2
                    shadow-xl shadow-slate-200
                    hover:bg-indigo-600
                    active:scale-[0.98]
                    disabled:opacity-50
                    transition-all
                  "
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showInviteModal && (
        <AddMemberModal 
          projectId={projectId} 
          onClose={() => setShowInviteModal(false)}
          onMemberAdded={fetchProjectData}
        />
      )}

      <style>{`
        .shadow-neu-inner {
          box-shadow: inset 2px 2px 5px #e2e8f0, inset -2px -2px 5px #ffffff;
        }
        
        @keyframes shine {
          from { left: -100%; }
          to { left: 100%; }
        }

        .animate-shine {
          position: relative;
          overflow: hidden;
        }

        .animate-shine::after {
          content: "";
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent);
          animation: shine 2s infinite;
        }
      `}</style>
    </div>
  )
}