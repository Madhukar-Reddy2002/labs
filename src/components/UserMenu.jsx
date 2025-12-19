import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0]

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  return (
    <div className="relative flex items-center gap-3 pl-4 border-l border-slate-200/50">

      {/* Avatar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="
          w-10 h-10 rounded-full
          bg-gradient-to-br from-slate-100 to-slate-200
          border border-slate-300
          flex items-center justify-center
          font-bold text-xs text-slate-700
          shadow-sm
          hover:ring-2 hover:ring-indigo-200
          transition-all
        "
      >
        {initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 top-14 w-64
            rounded-xl
            bg-white/80 backdrop-blur-xl
            border border-white/40
            shadow-xl
            overflow-hidden
            animate-in fade-in slide-in-from-top-2
          "
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-200/60">
            <div className="text-sm font-semibold text-slate-800">
              {name}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {user?.email}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="
              w-full px-4 py-3
              flex items-center gap-2
              text-sm text-red-500
              hover:bg-red-50
              transition-colors
            "
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}