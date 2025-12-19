// src/pages/SignUp.jsx
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await signUp(email, password, name)
      if (error) throw error
      toast.success('Account created! Please verify your email.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg p-8 md:p-12 relative">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
           <p className="text-slate-500">Join the lab and start experimenting.</p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input 
              type="text" required
              className="glass-input w-full px-4 py-3 rounded-xl text-slate-800"
              placeholder="John Doe"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input 
              type="email" required
              className="glass-input w-full px-4 py-3 rounded-xl text-slate-800"
              placeholder="john@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input 
              type="password" required
              className="glass-input w-full px-4 py-3 rounded-xl text-slate-800"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="glass-btn w-full py-3.5 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}