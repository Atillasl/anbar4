import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, UserPlus, LogIn, AlertCircle, Sparkles } from 'lucide-react';
// 1. Şəkli import edirik
import MyLogo from '../assets/my-logo.jpeg';

const Login = ({ onLogin }) => {
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setInfo('');
    setFormData({ email: '', password: '', passwordConfirm: '' });
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (formData.password.length < 6) {
      setError('Şifrə ən az 6 simvoldan ibarət olmalıdır!');
      return;
    }

    if (!isLoginMode && formData.password !== formData.passwordConfirm) {
      setError('Şifrələr uyğun gəlmir!');
      return;
    }

    setLoading(true);
    try {
      if (!isLoginMode) {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setError(data.error || 'Qeydiyyat zamanı xəta baş verdi.');
          return;
        }

        setInfo('Qeydiyyat tamamlandı. Email təsdiqi tələb oluna bilər, poçtu yoxlayın.');
        setIsLoginMode(true);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || 'Giriş uğursuzdur. Məlumatları yoxlayın.');
        return;
      }

      if (data.access_token) {
        localStorage.setItem('auth_access_token', data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem('auth_refresh_token', data.refresh_token);
      }

      localStorage.setItem('isLoggedIn', 'true');
      onLogin();
    } catch {
      setError('Serverə qoşulmaq mümkün olmadı. Backend işlədiyindən əmin olun.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#05070A] relative overflow-hidden font-sans transition-colors duration-500">
      
      {/* ARXAFON DEKORASİYASI - İndi Sarı tonlarda */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* LOGO BÖLMƏSİ */}
        <div className="text-center mb-10">
          <div className="relative inline-block group">
            {/* Arxa fırlanan halqa effekti - Sarı */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-spin-slow"></div>
            
            {/* Əsas Yumru Loqo */}
            <div className="relative w-28 h-28 bg-white dark:bg-slate-900 rounded-full p-1 shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)] border-b-4 border-yellow-100 dark:border-yellow-900/30 transition-all duration-500 group-hover:scale-105 overflow-hidden mb-6">
              <img 
                src={MyLogo} 
                alt="Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <h1 className="text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter">
            FAL<span className="text-yellow-500">KON</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
             <span className="h-[1px] w-8 bg-yellow-500/30"></span>
             <p className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-[0.4em]">Production</p>
             <span className="h-[1px] w-8 bg-yellow-500/30"></span>
          </div>
        </div>

        {/* FORM KARTI */}
        <div className="bg-white dark:bg-[#0D1117] p-10 rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] border-b-[12px] border-yellow-500/10 dark:border-yellow-500/5 relative group">
          
          <div className="absolute -top-4 -right-4 bg-yellow-500 text-black p-3 rounded-2xl rotate-12 shadow-lg group-hover:scale-110 transition-transform">
            <Sparkles size={20} fill="currentColor" />
          </div>

          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-8 uppercase tracking-tighter italic">
            {isLoginMode ? 'Xoş Gəldin!' : 'Yeni İmperiya Qur'}
          </h2>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 p-4 rounded-2xl text-[10px] font-black mb-6 flex items-center gap-3 border-2 border-red-100 dark:border-red-900/20 animate-bounce">
              <AlertCircle size={18} />
              <span className="uppercase tracking-wider">{error}</span>
            </div>
          )}

          {info && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 p-4 rounded-2xl text-[10px] font-black mb-6 flex items-center gap-3 border-2 border-emerald-100 dark:border-emerald-900/20">
              <span className="uppercase tracking-wider">{info}</span>
            </div>
          )}

          <form onSubmit={handleAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest italic">Mail</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  required
                  type="email"
                  className="w-full bg-gray-50 dark:bg-white/5 p-5 pl-14 rounded-2xl outline-none border-2 border-transparent focus:border-yellow-500/50 dark:text-white font-bold transition-all placeholder:text-gray-300 text-gray-700"
                  placeholder="name@empire.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest italic">Gizli Şifrə</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-gray-50 dark:bg-white/5 p-5 pl-14 rounded-2xl outline-none border-2 border-transparent focus:border-yellow-500/50 dark:text-white font-bold transition-all placeholder:text-gray-300 text-gray-700"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-4 tracking-widest italic">Şifrə Təkrarı</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    required
                    type={showPasswordConfirm ? "text" : "password"}
                    className="w-full bg-gray-50 dark:bg-white/5 p-5 pl-14 rounded-2xl outline-none border-2 border-transparent focus:border-yellow-500/50 dark:text-white font-bold transition-all placeholder:text-gray-300 text-gray-700"
                    placeholder="••••••••"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({...formData, passwordConfirm: e.target.value})}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} 
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 text-black py-6 rounded-2xl font-black shadow-[0_10px_20px_-5px_rgba(234,179,8,0.3)] border-b-8 border-yellow-700 hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-3 mt-4 text-xs uppercase tracking-[0.2em]"
            >
              {loading
                ? 'Gözləyin...'
                : isLoginMode
                  ? <><LogIn size={20} strokeWidth={3}/> Daxil Ol</>
                  : <><UserPlus size={20} strokeWidth={3}/> Hesabını Aktivləşdir</>}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={toggleMode}
              className="text-[10px] font-black text-yellow-600 dark:text-yellow-500 uppercase tracking-widest hover:text-yellow-700 transition-all hover:scale-105"
            >
              {isLoginMode ? "Hələ qeydiyyatdan keçməmisən? Buradan keç" : "Artıq hesabın var? Geri dön"}
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-8 mt-10">
            <div className="flex flex-col items-center gap-1">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Server: Online</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Version: 2.0.26</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;