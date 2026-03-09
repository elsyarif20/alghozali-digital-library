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
        <h1 className="text-4xl font-serif font-bold text-amber-500 mb-3 tracking-tight">Sistem Sirkulasi Perpustakaan</h1>
        <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">Kelola peminjaman dan pengembalian buku fisik dengan mudah dan cepat.</p>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-amber-500/30 shadow-sm overflow-hidden">
        <div className="flex border-b border-amber-500/20 bg-zinc-950/50">
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'pinjam' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/50'
            }`}
            onClick={() => setActiveTab('pinjam')}
          >
            <ArrowUpRight size={18} /> Pinjam Buku Fisik
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'kembali' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-800/50'
            }`}
            onClick={() => setActiveTab('kembali')}
          >
            <ArrowDownLeft size={18} /> Pengembalian Buku
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'pinjam' && (
            <div className="animate-in fade-in duration-300">
              <p className="text-zinc-400 mb-8 font-medium">Silakan isi formulir di bawah ini untuk mencatat peminjaman buku fisik.</p>
              
              {pinjamMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${pinjamMessage.type === 'success' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                  {pinjamMessage.text}
                </div>
              )}

              <form onSubmit={handlePinjam} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">👤 Nama Lengkap Siswa/Peminjam</label>
                  <input
                    type="text"
                    value={namaPeminjam}
                    onChange={(e) => setNamaPeminjam(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-500/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 text-zinc-100 transition-all placeholder:text-zinc-600"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">📚 Pilih Buku yang Tersedia</label>
                  <select
                    value={pilihanBukuPinjam}
                    onChange={(e) => setPilihanBukuPinjam(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-500/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 text-zinc-100 transition-all appearance-none cursor-pointer"
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
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmittingPinjam ? 'Memproses...' : 'Catat Peminjaman'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'kembali' && (
            <div className="animate-in fade-in duration-300">
              <p className="text-zinc-400 mb-8 font-medium">Catat pengembalian buku agar statusnya kembali 'Tersedia'.</p>
              
              {kembaliMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${kembaliMessage.type === 'success' ? 'bg-teal-500/10 text-teal-400 border-teal-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                  {kembaliMessage.text}
                </div>
              )}

              <form onSubmit={handleKembali} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">📚 Pilih Buku yang Dikembalikan</label>
                  <select
                    value={pilihanBukuKembali}
                    onChange={(e) => setPilihanBukuKembali(e.target.value)}
                    className="w-full px-4 py-3 border border-amber-500/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 text-zinc-100 transition-all appearance-none cursor-pointer"
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
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
