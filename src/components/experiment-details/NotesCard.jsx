import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotesCard({ experimentId }) {
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!noteText.trim()) return

    setSubmitting(true)
    try {
      // Here you would save to your notes table in Supabase
      // await supabase.from('experiment_notes').insert({
      //   experiment_id: experimentId,
      //   note: noteText,
      //   created_at: new Date()
      // })
      
      toast.success("Note saved successfully!")
      setNoteText('')
    } catch (error) {
      toast.error("Failed to save note")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
            <MessageSquare className="text-white" size={18} />
          </div>
          <h3 className="font-black text-slate-900 text-lg">Notes & Discussion</h3>
        </div>

        <textarea 
          className="w-full bg-white/40 backdrop-blur-sm border-2 border-slate-200/50 rounded-xl p-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
          rows={4}
          placeholder="Add observations, insights, or next steps..."
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
        />
        
        <button 
          onClick={handleSubmit}
          disabled={!noteText.trim() || submitting}
          className="mt-3 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send size={16}/>
          {submitting ? 'Saving...' : 'Post Note'}
        </button>

        {/* Future: Display existing notes here */}
        <div className="mt-4 pt-4 border-t border-slate-200/50">
          <p className="text-xs text-slate-500 text-center italic">
            Notes history coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}