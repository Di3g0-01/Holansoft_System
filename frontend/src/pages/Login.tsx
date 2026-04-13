import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import api from '../lib/api';
import { LogIn, User, Lock, Eye, EyeOff, AlertCircle, Loader2, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { username, password });
      setAuth(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales inválidas o servidor inactivo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] flex items-center justify-center p-4 relative overflow-hidden font-body">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-from)_0%,_transparent_50%),_radial-gradient(circle_at_bottom_left,_var(--tw-gradient-to)_0%,_transparent_50%)] from-primary/20 to-secondary/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ff791a 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-premium overflow-hidden relative z-10 animate-fade-in border border-white">
        
        <div className="p-8 sm:p-14">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-8 text-white">
               <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full"></div>
               <div className="relative bg-gradient-to-br from-primary to-primary-dark p-6 rounded-[2rem] shadow-primary transform transition-transform hover:scale-110 active:scale-95 cursor-pointer">
                  <BookOpen className="w-12 h-12" />
               </div>
            </div>
            <h1 className="text-5xl font-black text-secondary tracking-tighter mb-3">HolanSoft</h1>
            <div className="h-1.5 w-12 bg-primary rounded-full mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs text-center">Gestión Inteligente</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-7">
            {error && (
              <div className="bg-red-50/50 backdrop-blur-md border-2 border-red-100 text-red-600 p-5 rounded-3xl text-sm font-black flex items-center gap-4 animate-shake">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                </div>
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-black text-secondary/60 ml-2 uppercase tracking-wider">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-all duration-300">
                  <User size={22} />
                </div>
                <input 
                  type="text" 
                  required 
                  className="block w-full pl-14 pr-5 py-5 rounded-3xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-300 font-bold text-secondary text-lg placeholder:text-slate-300 shadow-sm"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-secondary/60 ml-2 uppercase tracking-wider">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-primary transition-all duration-300">
                  <Lock size={22} />
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  className="block w-full pl-14 pr-14 py-5 rounded-3xl border-2 border-slate-100 bg-white/50 focus:bg-white focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all duration-300 font-bold text-secondary text-lg placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer w-6 h-6 rounded-xl border-2 border-slate-200 text-primary focus:ring-primary/20 appearance-none cursor-pointer transition-all checked:bg-primary checked:border-primary" />
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-500 group-hover:text-secondary transition-colors">Recordarme</span>
              </label>
              <a href="#" className="text-sm font-black text-primary hover:text-primary-dark transition-all">¿Ayuda con tu clave?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary active:scale-[0.97] text-white py-5 rounded-3xl font-black text-xl shadow-primary transition-all flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-7 h-7 transition-transform group-hover:translate-x-1.5" />
                  <span>Ingresar al Sistema</span>
                </>
              )}
            </button>
          </form>

          <footer className="mt-14 text-center">
            <p className="text-slate-400 text-sm font-bold flex flex-col gap-1 items-center">
              <span>Versión 2.0 &bull; 2026</span>
              <span className="font-black text-secondary text-base">H O L A N S O F T</span>
            </p>
          </footer>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out 2;
        }
      `}</style>
    </div>
  );
}
