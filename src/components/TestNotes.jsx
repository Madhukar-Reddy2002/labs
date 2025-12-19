import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { MessageSquare, Send, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function TestNotes({ testId }) {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch Notes on Load
  useEffect(() => {
    fetchNotes()
  }, [testId])

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('experiment_id', testId)
      .order('created_at', { ascending: false }) // Newest first

    if (!error) setNotes(data || [])
  }

  const handlePostNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('notes')
        .insert({
          experiment_id: testId,
          user_id: user.id,
          user_name: user.user_metadata?.name || user.email.split('@')[0], 
          note_text: newNote
        })

      if (error) throw error

      setNewNote('')
      fetchNotes() // Refresh list
      toast.success('Note added')
    } catch (err) {
      toast.error('Failed to post note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel p-6 bg-white/60 flex flex-col max-h-[500px]">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <MessageSquare size={20} className="text-blue-500" /> Team Activity
      </h3>

      {/* Input Area */}
      <form onSubmit={handlePostNote} className="relative mb-6 shrink-0">
        <input
          type="text"
          placeholder="Log an update..."
          className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={loading || !newNote.trim()}
          className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} />
        </button>
      </form>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar min-h-[100px]">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-xl">
            No activity yet. Be the first to post!
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="flex gap-3 animate-in slide-in-from-bottom-2 duration-300">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 text-xs font-bold border border-white shadow-sm shrink-0">
                {note.user_name?.[0].toUpperCase() || <User size={12} />}
              </div>
              
              {/* Bubble */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">{note.user_name}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-100 shadow-sm text-sm text-slate-600 leading-relaxed">
                  {note.note_text}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}