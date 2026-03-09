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
    <div className="w-72 bg-zinc-950 border-r border-amber-500/30 flex flex-col shadow-2xl z-10">
      <div className="p-8 flex flex-col items-center border-b border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-zinc-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500 to-transparent pointer-events-none"></div>
        <div className="relative z-10 w-20 h-20 bg-zinc-900 rounded-2xl shadow-inner flex items-center justify-center mb-5 text-amber-500 transform rotate-3 hover:rotate-0 transition-transform duration-300 border border-amber-500/50">
          <BookOpen size={40} strokeWidth={1.5} />
        </div>
        <h1 className="relative z-10 text-xl font-serif font-bold text-amber-500 text-center leading-tight">Al-Ghozali<br/>Digital Library</h1>
        <p className="relative z-10 text-xs text-zinc-400 text-center mt-2 font-medium tracking-wide">SMA & SMP ISLAM</p>
      </div>
      <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5 px-3">Menu Utama</div>
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-500 font-semibold shadow-sm border border-amber-500/30' 
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-amber-400 font-medium border border-transparent'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-amber-500' : 'text-zinc-500'} strokeWidth={isActive ? 2 : 1.5} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-5 border-t border-amber-500/20 bg-zinc-950">
        <div className="bg-zinc-900 rounded-2xl p-4 border border-amber-500/30 shadow-sm mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50 shrink-0">
              <span className="text-amber-500 font-bold text-lg">{currentUser.nama.charAt(0).toUpperCase()}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-zinc-200 truncate">{currentUser.nama}</p>
              <p className="text-xs text-zinc-500 truncate">{currentUser.jenjang} - {currentUser.kelas}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-950/50 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-colors text-sm font-semibold border border-rose-500/30"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
        <p className="text-xs text-center text-zinc-600 font-medium tracking-wide">© 2026 - Liyas S. (El-Syarif)</p>
      </div>
    </div>
  );
}
