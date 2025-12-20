import { useState, useEffect } from 'react'
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, KeyRound, Wand2, Eye, EyeOff, CheckCircle2, AlertCircle, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [view, setView] = useState('login')
  const [method, setMethod] = useState('magic')
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName } // Critical: Trigger uses this!
          }
        })
        if (error) throw error
        showNotification('Account created! Check your email to confirm.', 'success')
        //console.log('Sign up:', { email, password, fullName })
      } 
      else if (method === 'password') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        showNotification('Welcome back!', 'success')
        //console.log('Password login:', { email, password })
      } 
      else {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        setCooldown(60)
        showNotification('Magic link sent! Check your inbox.', 'success')
        console.log('Magic link sent to:', email)
      }
    } catch (error) {
      showNotification(error.message || 'Something went wrong', 'error')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setPassword('')
    setFullName('')
    setShowPassword(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden p-4">
      
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute transition-all duration-[3000ms] ease-in-out ${view === 'login' ? 'top-[-20%] left-[-10%]' : 'top-[10%] left-[30%]'} w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-blue-600/20 rounded-full blur-[100px] md:blur-[150px]`} 
             style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite'}} />
        <div className={`absolute transition-all duration-[3000ms] ease-in-out ${view === 'login' ? 'bottom-[-20%] right-[-10%]' : 'bottom-[10%] right-[30%]'} w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-purple-600/20 rounded-full blur-[100px] md:blur-[150px]`}
             style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s'}} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"
             style={{animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.5s'}} />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s linear infinite ${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 transition-all duration-500 ${notification ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
          <div className={`relative overflow-hidden rounded-2xl backdrop-blur-xl border shadow-2xl p-4 ${
            notification.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/20' 
              : 'bg-red-500/10 border-red-500/30 shadow-red-500/20'
          }`}>
            <div className="flex items-start gap-3">
              {notification.type === 'success' ? (
                <CheckCircle2 className="text-emerald-400 flex-shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              )}
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-emerald-100' : 'text-red-100'}`}>
                {notification.message}
              </p>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 ${notification.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
                 style={{animation: 'shrink 5s linear forwards'}} />
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md relative z-10">
        
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000" />
          
          <div className="relative bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/50 p-6 md:p-8">
            
            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-18 md:h-18 rounded-2xl md:rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 mb-4 md:mb-5 shadow-lg shadow-blue-500/30 transform transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer relative overflow-hidden group/icon">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/icon:translate-x-full transition-transform duration-1000" />
                <Sparkles className="text-white relative z-10" size={28} />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text">
                {view === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              
              <p className="text-slate-400 text-sm md:text-base px-4">
                {view === 'login' 
                  ? 'Enter your credentials to access your workspace' 
                  : 'Join CRO Lab and start experimenting today'}
              </p>
            </div>

            {/* Method Switcher (Login Only) */}
            {view === 'login' && (
              <div className="relative mb-6 p-1 bg-slate-950/50 rounded-2xl border border-slate-700/50 shadow-inner">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => setMethod('magic')}
                    className={`relative py-3 md:py-3.5 text-xs md:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                      method === 'magic' 
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/50 scale-[1.02]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <Wand2 size={16} className={method === 'magic' ? 'animate-pulse' : ''} />
                    <span>Magic Link</span>
                    {method === 'magic' && <Zap size={14} className="absolute -top-1 -right-1 text-yellow-400 animate-bounce" />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setMethod('password')}
                    className={`relative py-3 md:py-3.5 text-xs md:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                      method === 'password' 
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-lg shadow-slate-900/50 scale-[1.02]' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                    }`}
                  >
                    <KeyRound size={16} />
                    <span>Password</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 md:space-y-5">
              
              {/* Full Name (Signup Only) */}
              {view === 'signup' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Full Name
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                      <User className="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 md:py-4 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-inner"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Work Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center">
                    <Mail className="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 md:py-4 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              {(view === 'signup' || method === 'password') && (
                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-500">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300 pointer-events-none" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3.5 md:py-4 pl-11 pr-12 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-slate-500 hover:text-slate-300 transition-colors duration-300"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  {view === 'signup' && (
                    <p className="text-xs text-slate-500 ml-1 mt-1">
                      Must be at least 6 characters
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleAuth}
                disabled={loading || cooldown > 0}
                className="relative w-full group/button mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-50 group-hover/button:opacity-75 transition duration-300 group-disabled/button:opacity-30" />
                
                <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3.5 md:py-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group-hover/button:-translate-y-0.5 active:translate-y-0 overflow-hidden">
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000" />
                  
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> 
                      <span>{view === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : cooldown > 0 ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Resend in {cooldown}s</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {view === 'signup' 
                          ? 'Create Account' 
                          : (method === 'magic' ? 'Send Magic Link' : 'Sign In')}
                      </span>
                      <ArrowRight size={18} className="group-hover/button:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 md:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700/50"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900/80 px-4 text-slate-500 font-bold tracking-wider">
                  {view === 'login' ? 'New here?' : 'Have an account?'}
                </span>
              </div>
            </div>

            {/* Footer Toggle */}
            <div className="text-center">
              <button 
                onClick={() => {
                  setView(view === 'login' ? 'signup' : 'login')
                  setMethod('magic')
                  resetForm()
                }}
                className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-all duration-300"
              >
                <span>{view === 'login' ? "Don't have an account?" : 'Already registered?'}</span>
                <span className="text-blue-400 group-hover:text-blue-300 group-hover:underline underline-offset-4 decoration-2 transition-all">
                  {view === 'login' ? 'Sign Up Free' : 'Log In'}
                </span>
                <ArrowRight size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Protected by enterprise-grade security
          </p>
        </div>

      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}