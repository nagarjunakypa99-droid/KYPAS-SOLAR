import React, { useState } from 'react';
import { Sun, Shield, Lock, Mail, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/crm';
import { StorageService } from '../../services/storageService';

export const LoginPage: React.FC = () => {
  const { login, users } = useAuth();
  const settings = StorageService.getSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your company email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const ok = login(email);
      if (!ok) {
        setError('Invalid credentials or unauthorized account. Try the quick-login roles below.');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (role: UserRole) => {
    setError('');
    setIsLoading(true);
    const targetUser = users.find(u => u.role === role);
    if (targetUser) {
      setEmail(targetUser.email);
    }
    setTimeout(() => {
      login('', role);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Solar Flare & Glow Effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full z-10">
        <div className="flex items-center gap-3">
          {settings.logoUrl && settings.logoType !== 'icon' ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shrink-0">
              <img
                src={settings.logoUrl}
                alt={settings.brandName || settings.companyName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Sun className="w-6 h-6 animate-pulse" />
            </div>
          )}
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              {settings.brandName || 'KYPAS SOLAR'}{' '}
              <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black">
                {settings.brandBadge || 'CRM PRO'}
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">{settings.companyName}</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise 256-Bit TLS Secured</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8 relative">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-3">
              <Zap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise CRM Login</h2>
            <p className="mt-1 text-xs text-slate-400">
              Sign in to manage solar sales, quotations, loans, and field engineering
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. admin@kypassolar.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 text-white rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 text-white rounded-xl border border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to CRM</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Logins */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                1-Click Quick Login by Role
              </span>
              <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-bold">
                Proposal Verified
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('Administrator')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-blue-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Admin
                </div>
                <div className="text-[10px] text-slate-400 truncate">Nagarjuna Kypa</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Sales Manager')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-emerald-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Sales Mgr
                </div>
                <div className="text-[10px] text-slate-400 truncate">Vikram Aditya</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Sales Executive')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-cyan-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Sales Exec
                </div>
                <div className="text-[10px] text-slate-400 truncate">Rahul Varma</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Loan Processing Executive')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-amber-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Loan Exec
                </div>
                <div className="text-[10px] text-slate-400 truncate">Priya Sharma</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Service Manager')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-purple-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" /> Service Mgr
                </div>
                <div className="text-[10px] text-slate-400 truncate">Suresh Reddy</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Service Technician')}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-rose-500 transition-all text-xs"
              >
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Technician
                </div>
                <div className="text-[10px] text-slate-400 truncate">Anji Babu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Telecaller')}
                className="col-span-2 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-left border border-slate-700/60 hover:border-indigo-500 transition-all text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Telecaller Desk
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Kavitha Reddy / Suma Latha</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                  Quick Inbound Calls
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer corporate info */}
      <div className="p-6 text-center text-xs text-slate-500 border-t border-slate-900 max-w-7xl mx-auto w-full z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 Kypas Solar Power Private Limited. All rights reserved.</p>
        <p className="text-[11px] text-slate-600">CIN: U40106TG2022PTC168924 • GSTIN: 36AABCK9876P1ZV • Hyderabad</p>
      </div>
    </div>
  );
};
