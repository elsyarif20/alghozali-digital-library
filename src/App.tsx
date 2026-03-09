/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Circulation from './pages/Circulation';
import Admin from './pages/Admin';
import Auth, { Member } from './components/Auth';
import { Book } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Member | null>(() => {
    const savedUser = localStorage.getItem('app_current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    const savedUser = localStorage.getItem('app_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return (user.role || 'user') === 'admin' ? 'dashboard' : 'catalog';
    }
    return 'dashboard';
  });
  
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState(() => {
    return localStorage.getItem('app_bg_color') || '#18181b'; // Default to zinc-900
  });

  const fetchBooks = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('books').select('*').order('id_buku');
    if (error) {
      console.error('Error fetching books:', error);
    } else {
      setBooks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (supabase) {
      fetchBooks();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('app_bg_color', bgColor);
  }, [bgColor]);

  const handleLogin = (member: Member) => {
    const memberWithRole = { ...member, role: member.role || 'user' };
    setCurrentUser(memberWithRole);
    localStorage.setItem('app_current_user', JSON.stringify(memberWithRole));
    setActiveTab(memberWithRole.role === 'admin' ? 'dashboard' : 'catalog');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('app_current_user');
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
        <div className="max-w-md w-full bg-zinc-800 p-8 rounded-2xl shadow-sm border border-amber-500/50">
          <h1 className="text-2xl font-serif font-bold text-amber-500 mb-4">Setup Required</h1>
          <p className="text-zinc-400 mb-4">
            Please configure your Supabase credentials in the environment variables to use this application.
          </p>
          <ul className="list-disc list-inside text-sm text-zinc-500 space-y-2">
            <li><code className="bg-zinc-900 px-2 py-1 rounded text-amber-400">VITE_SUPABASE_URL</code></li>
            <li><code className="bg-zinc-900 px-2 py-1 rounded text-amber-400">VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} bgColor={bgColor} />;
  }

  const role = currentUser.role || 'user';

  return (
    <div className="flex h-screen font-sans text-zinc-300 selection:bg-amber-500/20 selection:text-amber-500 transition-colors duration-500" style={{ backgroundColor: bgColor }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} currentUser={currentUser} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        {activeTab === 'dashboard' && role === 'admin' && <Dashboard books={books} />}
        {activeTab === 'catalog' && <Catalog books={books} currentUser={currentUser} />}
        {activeTab === 'circulation' && role === 'admin' && <Circulation books={books} refreshBooks={fetchBooks} />}
        {activeTab === 'admin' && role === 'admin' && <Admin books={books} refreshBooks={fetchBooks} bgColor={bgColor} setBgColor={setBgColor} />}
      </main>
    </div>
  );
}
