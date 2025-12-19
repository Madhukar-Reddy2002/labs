import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, KeyRound, Wand2 } from 'lucide-react'

export default function Login() {
  // State: 'login' or 'signup'
  const [view, setView] = useState('login')
  // State: 'magic' or 'password' (only for login)
  const [method, setMethod] = useState('magic')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (view === 'signup') {
        // --- SIGN UP LOGIC ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName } // Critical: Trigger uses this!
          }
        })
        if (error) throw error
        toast.success('Account created! Check your email to confirm.')
      } 
      
      else if (method === 'password') {
        // --- PASSWORD LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        // No toast needed, App.jsx handles the session change automatically
      } 
      
      else {
        // --- MAGIC LINK LOGIC ---
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        toast.success('Magic link sent! Check your inbox.')
      }

    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className={`absolute transition-all duration-1000 ${view === 'login' ? 'top-[-10%] left-[-10%]' : 'top-[20%] left-[20%]'} w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]`} />
      <div className={`absolute transition-all duration-1000 ${view === 'login' ? 'bottom-[-10%] right-[-10%]' : 'bottom-[20%] right-[50%]'} w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]`} />

      <div className="glass-panel w-full max-w-md p-8 relative z-10 mx-4 border-slate-700 bg-slate-800/60 backdrop-blur-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-5 shadow-lg shadow-blue-500/30 transform transition-transform hover:scale-105 hover:rotate-3">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-400 text-sm">
            {view === 'login' 
              ? 'Enter your credentials to access your workspace' 
              : 'Join CRO Lab and start experimenting today'}
          </p>
        </div>

        {/* Method Switcher (Only visible in Login) */}
        {view === 'login' && (
          <div className="flex p-1 bg-slate-900/50 rounded-xl mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setMethod('magic')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                method === 'magic' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Wand2 size={14} /> Magic Link
            </button>
            <button
              type="button"
              onClick={() => setMethod('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                method === 'password' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <KeyRound size={14} /> Password
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Full Name (Signup Only) */}
          {view === 'signup' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Work Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Password (Signup OR Password Login) */}
          {(view === 'signup' || method === 'password') && (
            <div className="space-y-1.5 animate-in fade-in zoom-in-95">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> 
                {view === 'signup' ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {view === 'signup' ? 'Create Account' : (method === 'magic' ? 'Send Magic Link' : 'Sign In')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login')
                setMethod('magic') // Reset method on toggle
                setPassword('')
                setFullName('')
              }}
              className="ml-2 text-blue-400 hover:text-blue-300 font-bold hover:underline transition-colors"
            >
              {view === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  )
}