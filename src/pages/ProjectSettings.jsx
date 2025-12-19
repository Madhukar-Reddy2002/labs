import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  ArrowLeft, Save, Trash2, Users, Settings, 
  Globe, DollarSign, Calendar, Shield, X, 
  UserPlus, Loader2, Zap, Layout, Clock, 
  Mail, ChevronRight, UserMinus
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
      
      // 1. Fetch Project Details
      const { data: proj, error: projError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (projError) throw projError
      setProject(proj)

      // 2. Fetch Members with Profiles
      const { data: mems, error: memError } = await supabase
        .from('project_members')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('project_id', projectId)
        .order('joined_at', { ascending: true })

      if (memError) throw memError
      setMembers(mems || [])

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
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 animate-in fade-in">
      {/* Glossy Header Bar */}
      <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="group p-2.5 bg-white shadow-neu border border-slate-100 rounded-xl hover:bg-slate-900 transition-all duration-300"
            >
              <ArrowLeft size={20} className="text-slate-600 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{project?.name}</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Layout size={12} /> Project Management
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleUpdateProject}
            disabled={saving}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
            Save Changes
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-10 grid lg:grid-cols-[280px_1fr] gap-10">
        
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'general' ? 'bg-white shadow-neu text-blue-600 border border-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings size={20} /> General Details
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'team' ? 'bg-white shadow-neu text-blue-600 border border-blue-50' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className="flex items-center gap-3"><Users size={20} /> Team Access</div>
            <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full">{members.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('danger')}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'danger' ? 'bg-red-50 text-red-600' : 'text-slate-400 hover:text-red-400'}`}
          >
            <Trash2 size={20} /> Danger Zone
          </button>
        </aside>

        {/* Content Area */}
        <main>
          {activeTab === 'general' && project && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white p-10 shadow-sm shadow-slate-200/50">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Zap size={20}/></div>
                  Core Identity
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Display Name</label>
                    <input 
                      value={project.name || ''} 
                      onChange={e => setProject({...project, name: e.target.value})}
                      className="w-full px-6 py-4 bg-white shadow-neu-inner border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-all text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Primary Domain</label>
                    <div className="relative">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                      <input 
                        value={project.domain || ''} 
                        onChange={e => setProject({...project, domain: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-white shadow-neu-inner border border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                        placeholder="example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Quarterly Budget</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
                      <input 
                        type="number"
                        value={project.budget_total || ''} 
                        onChange={e => setProject({...project, budget_total: e.target.value})}
                        className="w-full pl-14 pr-6 py-4 bg-white shadow-neu-inner border border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white p-10 shadow-sm shadow-slate-200/50">
                <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Clock size={20}/></div>
                  Timeline Tracking
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Launch Date</label>
                    <input 
                      type="date"
                      value={project.planned_start_date || ''} 
                      onChange={e => setProject({...project, planned_start_date: e.target.value})}
                      className="w-full px-6 py-4 bg-white shadow-neu-inner border border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Project Sunset</label>
                    <input 
                      type="date"
                      value={project.planned_end_date || ''} 
                      onChange={e => setProject({...project, planned_end_date: e.target.value})}
                      className="w-full px-6 py-4 bg-white shadow-neu-inner border border-slate-100 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-white overflow-hidden shadow-sm shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-10 border-b border-white flex justify-between items-center bg-white/30">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Project Team</h3>
                  <p className="text-slate-500 font-medium text-sm">Manage roles and permissions</p>
                </div>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <UserPlus size={18}/> Invite Member
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {members.map((member) => {
                  const displayName = member.profiles?.full_name || (member.email ? member.email.split('@')[0] : 'Unknown User');
                  const initial = member.email ? member.email[0].toUpperCase() : '?';
                  const isYou = member.user_id === user?.id;

                  return (
                    <div key={member.id} className="p-6 flex items-center justify-between hover:bg-white/80 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-black text-slate-500 shadow-inner ring-4 ring-white">
                          {initial}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 flex items-center gap-2">
                            {displayName}
                            {isYou && (
                              <span className="text-[8px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">You</span>
                            )}
                            {member.status === 'pending' && (
                              <span className="text-[8px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Pending</span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400 font-bold flex items-center gap-1">
                            <Mail size={10}/> {member.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <select 
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            disabled={member.role === 'owner'}
                            className="appearance-none bg-white shadow-neu-inner border border-slate-100 pl-4 pr-10 py-2.5 rounded-xl text-[10px] font-black text-slate-700 outline-none focus:border-blue-500 cursor-pointer disabled:opacity-50 uppercase tracking-widest"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <Shield size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"/>
                        </div>

                        {!isYou && member.role !== 'owner' && (
                          <button 
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <UserMinus size={18}/>
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
            <div className="bg-red-50/50 backdrop-blur-md rounded-[2.5rem] border border-red-100 p-10 shadow-sm shadow-red-100/50 animate-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-4 mb-6">
                 <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><Trash2 size={24}/></div>
                 <div>
                   <h3 className="text-2xl font-black text-red-900">Destroy Project</h3>
                   <p className="text-red-600 font-medium">This action is permanent and irreversible.</p>
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
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black hover:bg-red-700 shadow-xl shadow-red-200 transition-all"
               >
                 Permanently Delete Workspace
               </button>
            </div>
          )}
        </main>
      </div>

      {showInviteModal && (
        <AddMemberModal 
          projectId={projectId} 
          onClose={() => setShowInviteModal(false)}
          onMemberAdded={fetchProjectData}
        />
      )}

      <style>{`
        .shadow-neu {
          box-shadow: 8px 8px 16px #e2e8f0, -8px -8px 16px #ffffff;
        }
        .shadow-neu-inner {
          box-shadow: inset 2px 2px 5px #e2e8f0, inset -2px -2px 5px #ffffff;
        }
      `}</style>
    </div>
  )
}