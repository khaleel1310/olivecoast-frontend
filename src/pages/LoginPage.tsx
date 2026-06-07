import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { api } from '../api/client'; // 🔌 Import your centralized Axios client
import { KeyRound, Mail, Loader2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const login = useAuthStore((state) => state.login); // Your store setter function
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    // 1. Fire credentials payload straight to your backend route
    const response = await api.post('/auth/login', { email, password });
    
    // 2. Extract the nested 'user' object from the backend response body
    const backendUser = response.data.user; 

    // 3. Map the backend fields cleanly to match what your Zustand UserProfile store expects
    const userProfile = {
      id: backendUser.id,
      username: backendUser.name, // Maps backend "name" safely to store "username"
      role: backendUser.role
    };

    // 4. Save the normalized session profile data into your Zustand store state
    login(userProfile);
    
    // 5. Intelligently route the employee straight to their workspace using the nested role!
    if (userProfile.role === 'OWNER') {
      navigate('/owner');
    } else if (userProfile.role === 'CHEF') {
      navigate('/chef');
    }
  } catch (err: any) {
    console.error(err);
    setError(err.response?.data?.error || 'Invalid email or password combination.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-4 font-sans selection:bg-[#0B2240] selection:text-white">
      
      {/* Central Login Card Container */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EFECE6] p-8 space-y-6">
        
        {/* Boutique Styled Logo Frame & Heading */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#EFECE6] p-1 items-center justify-center">
            <img 
              src="/assets/Olive_Coast_Logo.jpg" 
              alt="Olive Coast Emblem" 
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#0B2240] tracking-wide uppercase mt-2">
            Staff Portal
          </h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
            Olive Coast Mediterranean Kitchen
          </p>
        </div>

        {/* Local Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Interactive Fields Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@olivecoast.com"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B2240] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <KeyRound size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0B2240] focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Secure Submission Trigger Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-[#0B2240] hover:bg-[#15345c] disabled:bg-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Authorizing...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};