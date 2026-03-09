import { Home, Search, Repeat, Settings, BookOpen, LogOut } from 'lucide-react';
import { Member } from './Auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  currentUser: Member;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, currentUser }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Beranda', icon: Home, roles: ['admin'] },
    { id: 'catalog', label: 'E-Katalog & Baca', icon: Search, roles: ['admin', 'user'] },
    { id: 'circulation', label: 'Sirkulasi (Pinjam/Kembali)', icon: Repeat, roles: ['admin'] },
    { id: 'admin', label: 'Panel Admin', icon: Settings, roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(currentUser.role || 'user'));

  return (
    <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
      <div className="p-8 flex flex-col items-center border-b border-slate-100 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="w-20 h-20 bg-indigo-100 rounded-2xl shadow-inner flex items-center justify-center mb-5 text-indigo-600 transform rotate-3 hover:rotate-0 transition-transform duration-300">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-serif font-bold text-slate-900 text-center leading-tight">Al-Ghozali<br/>Digital Library</h1>
        <p className="text-xs text-slate-500 text-center mt-2 font-medium tracking-wide">SMA & SMP ISLAM</p>
      </div>
      <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5 px-3">Menu Utama</div>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400'} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-5 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
              <span className="text-indigo-700 font-bold text-lg">{currentUser.nama.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser.nama}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.jenjang} - {currentUser.kelas}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors text-sm font-semibold border border-rose-100"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
        <p className="text-xs text-center text-slate-400 font-medium tracking-wide">© 2026 - Liyas S. (El-Syarif)</p>
      </div>
    </div>
  );
}
