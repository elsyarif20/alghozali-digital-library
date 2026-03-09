import { useState, useEffect } from 'react';
import { BookOpen, UserPlus, LogIn, ShieldCheck, Users } from 'lucide-react';

export interface Member {
  id: string;
  nama: string;
  jenjang: string;
  kelas: string;
  joinedAt: string;
  role: 'admin' | 'user';
}

interface AuthProps {
  onLogin: (member: Member) => void;
  bgColor: string;
}

export default function Auth({ onLogin, bgColor }: AuthProps) {
  const [loginMode, setLoginMode] = useState<'member' | 'admin'>('member');
  const [isLogin, setIsLogin] = useState(true);
  
  // Member state
  const [nama, setNama] = useState('');
  const [jenjang, setJenjang] = useState('');
  const [kelas, setKelas] = useState('');
  
  // Admin state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginMode === 'admin') {
      if (adminUsername === 'admin' && adminPassword === 'admin123') {
        onLogin({
          id: 'admin-1',
          nama: 'Administrator',
          jenjang: 'Admin',
          kelas: 'Pusat',
          joinedAt: new Date().toISOString(),
          role: 'admin'
        });
      } else {
        setError('Username atau password admin salah.');
      }
      return;
    }

    if (!nama.trim() || !jenjang.trim() || !kelas.trim()) {
      setError('Harap isi semua kolom (Nama, Jenjang, dan Kelas).');
      return;
    }

    const members: Member[] = JSON.parse(localStorage.getItem('app_members') || '[]');
    
    // Normalize inputs for comparison
    const normalizedNama = nama.trim().toLowerCase();
    const normalizedJenjang = jenjang.trim().toLowerCase();
    const normalizedKelas = kelas.trim().toLowerCase();

    const existingMember = members.find(
      m => m.nama.toLowerCase() === normalizedNama && 
           m.jenjang.toLowerCase() === normalizedJenjang && 
           m.kelas.toLowerCase() === normalizedKelas
    );

    if (isLogin) {
      if (existingMember) {
        onLogin({ ...existingMember, role: existingMember.role || 'user' });
      } else {
        setError('Data tidak ditemukan. Silakan Daftar (Sign Up) terlebih dahulu.');
      }
    } else {
      if (existingMember) {
        setError('Anda sudah terdaftar! Silakan Masuk (Sign In).');
      } else {
        const newMember: Member = {
          id: Date.now().toString(),
          nama: nama.trim(),
          jenjang: jenjang.trim(),
          kelas: kelas.trim(),
          joinedAt: new Date().toISOString(),
          role: 'user'
        };
        members.push(newMember);
        localStorage.setItem('app_members', JSON.stringify(members));
        onLogin(newMember);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
          <h1 className="relative z-10 text-2xl font-serif font-bold text-white mb-2">Perpustakaan Al-Ghozali</h1>
          <p className="relative z-10 text-indigo-100 text-sm">Portal Akses Perpustakaan</p>
        </div>

        <div className="p-8">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${loginMode === 'member' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setLoginMode('member'); setError(''); }}
            >
              <Users size={16} /> Anggota
            </button>
            <button
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${loginMode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setLoginMode('admin'); setError(''); }}
            >
              <ShieldCheck size={16} /> Admin
            </button>
          </div>

          {loginMode === 'member' && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Masuk (Sign In)
              </button>
              <button
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Daftar (Sign Up)
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-sm font-medium flex items-start gap-3">
              <span className="text-lg leading-none">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMode === 'admin' ? (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Username Admin</label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap Anda"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Jenjang</label>
                    <select
                      value={jenjang}
                      onChange={(e) => setJenjang(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Pilih Jenjang</option>
                      <option value="SD">SD / MI</option>
                      <option value="SMP">SMP / MTs</option>
                      <option value="SMA">SMA / MA / SMK</option>
                      <option value="Umum">Umum / Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Kelas</label>
                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      placeholder="Contoh: 10A"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 mt-4"
            >
              {loginMode === 'admin' ? (
                <><ShieldCheck size={20} /> Masuk sebagai Admin</>
              ) : isLogin ? (
                <><LogIn size={20} /> Masuk ke Perpustakaan</>
              ) : (
                <><UserPlus size={20} /> Daftar & Mulai Akses</>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {loginMode === 'admin' 
                ? "Gunakan kredensial admin untuk masuk."
                : isLogin 
                  ? "Belum punya akun? Pilih tab Daftar untuk bergabung." 
                  : "Dengan mendaftar, Anda akan menjadi member permanen."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
