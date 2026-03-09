import { useState } from 'react';
import { Book } from '../types';
import { supabase } from '../lib/supabase';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface CirculationProps {
  books: Book[];
  refreshBooks: () => void;
}

export default function Circulation({ books, refreshBooks }: CirculationProps) {
  const [activeTab, setActiveTab] = useState<'pinjam' | 'kembali'>('pinjam');
  
  // Pinjam State
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [pilihanBukuPinjam, setPilihanBukuPinjam] = useState('');
  const [isSubmittingPinjam, setIsSubmittingPinjam] = useState(false);
  const [pinjamMessage, setPinjamMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Kembali State
  const [pilihanBukuKembali, setPilihanBukuKembali] = useState('');
  const [isSubmittingKembali, setIsSubmittingKembali] = useState(false);
  const [kembaliMessage, setKembaliMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const bukuTersedia = books.filter(b => b.status === 'Tersedia');
  const bukuDipinjam = books.filter(b => b.status === 'Dipinjam');

  const handlePinjam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPeminjam || !pilihanBukuPinjam || !supabase) {
      setPinjamMessage({ type: 'error', text: 'Mohon lengkapi formulir dengan benar.' });
      return;
    }

    setIsSubmittingPinjam(true);
    setPinjamMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('books')
        .update({ status: 'Dipinjam' })
        .eq('id_buku', pilihanBukuPinjam);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('borrow_history')
        .insert({
          nama_peminjam: namaPeminjam,
          id_buku: pilihanBukuPinjam,
          tanggal_pinjam: new Date().toISOString().split('T')[0],
          status: 'Dipinjam'
        });

      if (insertError) throw insertError;

      const bookTitle = books.find(b => b.id_buku === pilihanBukuPinjam)?.judul;
      setPinjamMessage({ type: 'success', text: `Berhasil! Buku '${bookTitle}' dipinjam oleh ${namaPeminjam}.` });
      setNamaPeminjam('');
      setPilihanBukuPinjam('');
      refreshBooks();
    } catch (error: any) {
      console.error(error);
      setPinjamMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmittingPinjam(false);
    }
  };

  const handleKembali = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pilihanBukuKembali || !supabase) {
      setKembaliMessage({ type: 'error', text: 'Pilih buku yang akan dikembalikan.' });
      return;
    }

    setIsSubmittingKembali(true);
    setKembaliMessage(null);

    try {
      const { error: updateError } = await supabase
        .from('books')
        .update({ status: 'Tersedia' })
        .eq('id_buku', pilihanBukuKembali);

      if (updateError) throw updateError;

      const bookTitle = books.find(b => b.id_buku === pilihanBukuKembali)?.judul;
      setKembaliMessage({ type: 'success', text: `Buku '${bookTitle}' berhasil dikembalikan ke rak.` });
      setPilihanBukuKembali('');
      refreshBooks();
    } catch (error: any) {
      console.error(error);
      setKembaliMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmittingKembali(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Sistem Sirkulasi Perpustakaan</h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">Kelola peminjaman dan pengembalian buku fisik dengan mudah dan cepat.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'pinjam' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
            onClick={() => setActiveTab('pinjam')}
          >
            <ArrowUpRight size={18} /> Pinjam Buku Fisik
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'kembali' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
            onClick={() => setActiveTab('kembali')}
          >
            <ArrowDownLeft size={18} /> Pengembalian Buku
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'pinjam' && (
            <div className="animate-in fade-in duration-300">
              <p className="text-slate-600 mb-8 font-medium">Silakan isi formulir di bawah ini untuk mencatat peminjaman buku fisik.</p>
              
              {pinjamMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${pinjamMessage.type === 'success' ? 'bg-teal-50 text-teal-800 border-teal-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                  {pinjamMessage.text}
                </div>
              )}

              <form onSubmit={handlePinjam} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">👤 Nama Lengkap Siswa/Peminjam</label>
                  <input
                    type="text"
                    value={namaPeminjam}
                    onChange={(e) => setNamaPeminjam(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">📚 Pilih Buku yang Tersedia</label>
                  <select
                    value={pilihanBukuPinjam}
                    onChange={(e) => setPilihanBukuPinjam(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Buku --</option>
                    {bukuTersedia.map(b => (
                      <option key={b.id_buku} value={b.id_buku}>{b.judul}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingPinjam}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmittingPinjam ? 'Memproses...' : 'Catat Peminjaman'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'kembali' && (
            <div className="animate-in fade-in duration-300">
              <p className="text-slate-600 mb-8 font-medium">Catat pengembalian buku agar statusnya kembali 'Tersedia'.</p>
              
              {kembaliMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${kembaliMessage.type === 'success' ? 'bg-teal-50 text-teal-800 border-teal-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                  {kembaliMessage.text}
                </div>
              )}

              <form onSubmit={handleKembali} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">📚 Pilih Buku yang Dikembalikan</label>
                  <select
                    value={pilihanBukuKembali}
                    onChange={(e) => setPilihanBukuKembali(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer"
                  >
                    <option value="">-- Pilih Buku --</option>
                    {bukuDipinjam.map(b => (
                      <option key={b.id_buku} value={b.id_buku}>{b.judul}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingKembali}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmittingKembali ? 'Memproses...' : 'Proses Pengembalian'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
