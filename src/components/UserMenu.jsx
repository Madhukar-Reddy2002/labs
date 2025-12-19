import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { LogOut, User, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0]
  
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'U'

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="relative flex items-center gap-3">
      {/* User Name - Hidden on mobile */}
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-semibold text-slate-700">{name}</span>
        <span className="text-xs text-slate-400">Account</span>
      </div>

      {/* Avatar Button - Neumorphic */}
      <button
        onClick={() => setOpen(v => !v)}
        className="
          w-11 h-11 sm:w-12 sm:h-12 rounded-xl
          bg-gradient-to-br from-slate-100 to-slate-50
          flex items-center justify-center
          font-bold text-sm text-slate-700
          shadow-[2px_2px_5px_rgba(0,0,0,0.08),-2px_-2px_5px_rgba(255,255,255,0.9)]
          hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.9)]
          active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.1),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]
          border border-slate-200/50
          transition-all duration-200
          relative
        "
      >
        {initials}
        {open && (
          <div className="absolute inset-0 rounded-xl bg-indigo-500/10 animate-pulse" />
        )}
      </button>

      {/* Dropdown - Neumorphic Glass */}
      {open && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setOpen(false)}
          />
          <div
            className="
              absolute right-0 top-16 w-72 sm:w-80
              rounded-2xl
              bg-gradient-to-br from-white/95 to-slate-50/95
              backdrop-blur-xl
              border border-slate-200/60
              shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]
              overflow-hidden
              z-50
            "
          >
            {/* User Info Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-transparent border-b border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className="
                  w-14 h-14 rounded-xl
                  bg-gradient-to-br from-indigo-500 to-violet-600
                  flex items-center justify-center
                  font-bold text-lg text-white
                  shadow-lg shadow-indigo-500/30
                ">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={14} className="text-slate-400" />
                    <div className="text-sm font-bold text-slate-800 truncate">
                      {name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-400" />
                    <div className="text-xs text-slate-500 truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="
                  w-full px-4 py-3 rounded-xl
                  flex items-center gap-3
                  text-sm font-semibold text-red-600
                  bg-slate-50/50
                  hover:bg-red-50
                  shadow-[inset_0_0_0_1px_rgba(226,232,240,0.5)]
                  hover:shadow-[inset_0_0_0_1px_rgba(239,68,68,0.2)]
                  transition-all duration-200
                  group
                "
              >
                <div className="
                  w-8 h-8 rounded-lg
                  bg-white
                  flex items-center justify-center
                  shadow-sm
                  group-hover:bg-red-50
                  group-hover:shadow-[inset_2px_2px_4px_rgba(239,68,68,0.1)]
                  transition-all
                ">
                  <LogOut size={16} />
                </div>
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}