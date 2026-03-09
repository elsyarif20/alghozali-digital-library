import { useState, useRef, useEffect } from 'react';
import { Book } from '../types';
import { supabase } from '../lib/supabase';
import { PlusCircle, Edit3, Trash2, Save, UploadCloud, Palette, Users, CheckCircle, XCircle } from 'lucide-react';
import { Member } from '../components/Auth';

interface AdminProps {
  books: Book[];
  refreshBooks: () => void;
  bgColor: string;
  setBgColor: (color: string) => void;
}

const THEME_COLORS = [
  { name: 'Dark Gray (Default)', hex: '#18181b' },
  { name: 'Deep Blue', hex: '#0f172a' },
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Midnight', hex: '#171717' },
  { name: 'Black', hex: '#000000' },
  { name: 'Dark Indigo', hex: '#312e81' },
];

export default function Admin({ books, refreshBooks, bgColor, setBgColor }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'tambah' | 'edit' | 'tema' | 'anggota'>('tambah');
  
  // Tambah State
  const [newId, setNewId] = useState('');
  const [newJudul, setNewJudul] = useState('');
  const [newPenulis, setNewPenulis] = useState('');
  const [newKategori, setNewKategori] = useState('');
  const [newSinopsis, setNewSinopsis] = useState('');
  const [fileCover, setFileCover] = useState<File | null>(null);
  const [filePdf, setFilePdf] = useState<File | null>(null);
  const [isSubmittingTambah, setIsSubmittingTambah] = useState(false);
  const [tambahMessage, setTambahMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Edit State
  const [selectedBookId, setSelectedBookId] = useState('');
  const [editJudul, setEditJudul] = useState('');
  const [editPenulis, setEditPenulis] = useState('');
  const [editKategori, setEditKategori] = useState('');
  const [editStatus, setEditStatus] = useState<'Tersedia' | 'Dipinjam'>('Tersedia');
  const [editSinopsis, setEditSinopsis] = useState('');
  const [editFileCover, setEditFileCover] = useState<File | null>(null);
  const [editFilePdf, setEditFilePdf] = useState<File | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);
  const [editMessage, setEditMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const editCoverInputRef = useRef<HTMLInputElement>(null);
  const editPdfInputRef = useRef<HTMLInputElement>(null);

  // Members State
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (activeTab === 'anggota') {
      const storedMembers = JSON.parse(localStorage.getItem('app_members') || '[]');
      setMembers(storedMembers);
    }
  }, [activeTab]);

  const toggleDownloadPermission = (memberId: string) => {
    const updatedMembers = members.map(m => {
      if (m.id === memberId) {
        return { ...m, canDownload: !m.canDownload };
      }
      return m;
    });
    setMembers(updatedMembers);
    localStorage.setItem('app_members', JSON.stringify(updatedMembers));
  };

  const handleBookSelect = (id: string) => {
    setSelectedBookId(id);
    const book = books.find(b => b.id_buku === id);
    if (book) {
      setEditJudul(book.judul);
      setEditPenulis(book.penulis);
      setEditKategori(book.kategori);
      setEditStatus(book.status);
      setEditSinopsis(book.sinopsis || '');
      setEditFileCover(null);
      setEditFilePdf(null);
      if (editCoverInputRef.current) editCoverInputRef.current.value = '';
      if (editPdfInputRef.current) editPdfInputRef.current.value = '';
    }
  };

  const uploadFile = async (bucket: string, file: File, prefix: string) => {
    if (!supabase) return '';
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `${prefix}_${timestamp}.${ext}`;
    
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, {
      contentType: file.type
    });
    
    if (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return '';
    }
    
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleTambah = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newJudul || !newPenulis || !newKategori || !supabase) {
      setTambahMessage({ type: 'error', text: 'Harap lengkapi ID, Judul, Penulis, dan Kategori.' });
      return;
    }

    setIsSubmittingTambah(true);
    setTambahMessage(null);

    try {
      // Check ID
      const { data: existing } = await supabase.from('books').select('id_buku').eq('id_buku', newId);
      if (existing && existing.length > 0) {
        throw new Error('ID Buku sudah ada! Silakan gunakan ID yang lain.');
      }

      let link_pdf_publik = '';
      let link_cover_publik = '';

      if (filePdf) {
        link_pdf_publik = await uploadFile('buku_pdf', filePdf, newId);
      }
      if (fileCover) {
        link_cover_publik = await uploadFile('buku_cover', fileCover, newId);
      }

      const { error } = await supabase.from('books').insert({
        id_buku: newId,
        judul: newJudul,
        penulis: newPenulis,
        kategori: newKategori,
        status: 'Tersedia',
        link_pdf: link_pdf_publik,
        sinopsis: newSinopsis,
        cover_url: link_cover_publik
      });

      if (error) throw error;

      setTambahMessage({ type: 'success', text: 'Koleksi baru berhasil ditambahkan!' });
      
      // Reset form
      setNewId('');
      setNewJudul('');
      setNewPenulis('');
      setNewKategori('');
      setNewSinopsis('');
      setFileCover(null);
      setFilePdf(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      
      refreshBooks();
    } catch (error: any) {
      setTambahMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmittingTambah(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookId || !supabase) return;

    setIsSubmittingEdit(true);
    setEditMessage(null);

    try {
      const book = books.find(b => b.id_buku === selectedBookId);
      if (!book) throw new Error('Buku tidak ditemukan');

      let link_pdf_baru = book.link_pdf;
      let link_cover_baru = book.cover_url;

      if (editFilePdf) {
        link_pdf_baru = await uploadFile('buku_pdf', editFilePdf, `${selectedBookId}_update`);
      }
      if (editFileCover) {
        link_cover_baru = await uploadFile('buku_cover', editFileCover, `${selectedBookId}_update`);
      }

      const { error } = await supabase.from('books').update({
        judul: editJudul,
        penulis: editPenulis,
        kategori: editKategori,
        status: editStatus,
        sinopsis: editSinopsis,
        link_pdf: link_pdf_baru,
        cover_url: link_cover_baru
      }).eq('id_buku', selectedBookId);

      if (error) throw error;

      setEditMessage({ type: 'success', text: 'Perubahan berhasil disimpan!' });
      setEditFileCover(null);
      setEditFilePdf(null);
      if (editCoverInputRef.current) editCoverInputRef.current.value = '';
      if (editPdfInputRef.current) editPdfInputRef.current.value = '';
      
      refreshBooks();
    } catch (error: any) {
      setEditMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedBookId || !supabase) return;
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;

    setIsSubmittingDelete(true);
    setEditMessage(null);

    try {
      const { error } = await supabase.from('books').delete().eq('id_buku', selectedBookId);
      if (error) throw error;

      setEditMessage({ type: 'success', text: 'Buku berhasil dihapus dari sistem.' });
      setSelectedBookId('');
      refreshBooks();
    } catch (error: any) {
      setEditMessage({ type: 'error', text: error.message || 'Terjadi kesalahan' });
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-amber-500 mb-3 tracking-tight">Panel Administrator</h1>
        <div className="bg-zinc-900 text-amber-500 p-5 rounded-2xl text-sm font-medium border border-amber-500/30 flex items-center gap-3">
          <span className="text-xl">⚙️</span> Gunakan halaman ini untuk mengatur koleksi perpustakaan, tema, dan izin anggota.
        </div>
      </div>

      <div className="bg-zinc-900 rounded-2xl border border-amber-500/30 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-amber-500/20 bg-zinc-950">
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'tambah' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/50'
            }`}
            onClick={() => setActiveTab('tambah')}
          >
            <PlusCircle size={18} /> Tambah Koleksi
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'edit' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/50'
            }`}
            onClick={() => {
              setActiveTab('edit');
              if (!selectedBookId && books.length > 0) {
                handleBookSelect(books[0].id_buku);
              }
            }}
          >
            <Edit3 size={18} /> Edit / Hapus
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'anggota' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/50'
            }`}
            onClick={() => setActiveTab('anggota')}
          >
            <Users size={18} /> Izin Anggota
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'tema' ? 'bg-zinc-900 border-b-2 border-amber-500 text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-amber-400 hover:bg-zinc-900/50'
            }`}
            onClick={() => setActiveTab('tema')}
          >
            <Palette size={18} /> Tema
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'tambah' && (
            <div className="animate-in fade-in duration-300">
              {tambahMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${tambahMessage.type === 'success' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                  {tambahMessage.text}
                </div>
              )}

              <form onSubmit={handleTambah} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">🔑 ID Buku (Contoh: B001)</label>
                    <input type="text" value={newId} onChange={e => setNewId(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">📖 Judul Buku</label>
                    <input type="text" value={newJudul} onChange={e => setNewJudul(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">✍️ Penulis</label>
                    <input type="text" value={newPenulis} onChange={e => setNewPenulis(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">🏷️ Kategori</label>
                    <input type="text" value={newKategori} onChange={e => setNewKategori(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-2">📝 Sinopsis Singkat</label>
                  <textarea value={newSinopsis} onChange={e => setNewSinopsis(e.target.value)} rows={4} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none"></textarea>
                </div>

                <div className="border-t border-amber-500/20 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                    <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-amber-500" /> Upload Cover (JPG/PNG)</label>
                    <input type="file" accept=".jpg,.jpeg,.png" ref={coverInputRef} onChange={e => setFileCover(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500/20 file:text-amber-500 hover:file:bg-amber-500/30 transition-colors cursor-pointer" />
                  </div>
                  <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                    <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-teal-500" /> Upload E-Book (PDF)</label>
                    <input type="file" accept=".pdf" ref={pdfInputRef} onChange={e => setFilePdf(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30 transition-colors cursor-pointer" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmittingTambah} className="w-full py-4 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
                  {isSubmittingTambah ? 'Menyimpan...' : <><Save size={20} /> Simpan Data Buku</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="animate-in fade-in duration-300">
              {books.length === 0 ? (
                <div className="bg-amber-500/10 text-amber-500 p-6 rounded-2xl border border-amber-500/30 font-medium flex items-center gap-3">
                  <span className="text-xl">ℹ️</span> Belum ada data buku.
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-zinc-300 mb-2">Pilih Buku yang akan diedit:</label>
                    <select value={selectedBookId} onChange={e => handleBookSelect(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all appearance-none cursor-pointer outline-none">
                      <option value="" disabled>-- Pilih Buku --</option>
                      {books.map(b => (
                        <option key={b.id_buku} value={b.id_buku}>{b.judul}</option>
                      ))}
                    </select>
                  </div>

                  {selectedBookId && (
                     <div className="border-t border-amber-500/20 pt-8">
                      {editMessage && (
                        <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${editMessage.type === 'success' ? 'bg-teal-500/20 text-teal-400 border-teal-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                          {editMessage.text}
                        </div>
                      )}

                      <form onSubmit={handleEdit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-zinc-300 mb-2">Judul Buku</label>
                            <input type="text" value={editJudul} onChange={e => setEditJudul(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-zinc-300 mb-2">Penulis</label>
                            <input type="text" value={editPenulis} onChange={e => setEditPenulis(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-zinc-300 mb-2">Kategori</label>
                            <input type="text" value={editKategori} onChange={e => setEditKategori(e.target.value)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-zinc-300 mb-2">Status Fisik</label>
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all appearance-none cursor-pointer outline-none">
                              <option value="Tersedia">Tersedia</option>
                              <option value="Dipinjam">Dipinjam</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-zinc-300 mb-2">Sinopsis Buku</label>
                          <textarea value={editSinopsis} onChange={e => setEditSinopsis(e.target.value)} rows={4} className="w-full px-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-zinc-950 focus:bg-zinc-900 text-zinc-100 transition-all outline-none"></textarea>
                        </div>

                        <div className="border-t border-amber-500/20 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-amber-500" /> Timpa Cover Lama (Opsional)</label>
                            <input type="file" accept=".jpg,.jpeg,.png" ref={editCoverInputRef} onChange={e => setEditFileCover(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-500/20 file:text-amber-500 hover:file:bg-amber-500/30 transition-colors cursor-pointer" />
                          </div>
                          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                            <label className="block text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-teal-500" /> Timpa PDF Lama (Opsional)</label>
                            <input type="file" accept=".pdf" ref={editPdfInputRef} onChange={e => setEditFilePdf(e.target.files?.[0] || null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-500/20 file:text-teal-400 hover:file:bg-teal-500/30 transition-colors cursor-pointer" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <button type="submit" disabled={isSubmittingEdit} className="flex-1 py-4 px-4 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isSubmittingEdit ? 'Menyimpan...' : <><Save size={20} /> Simpan Perubahan</>}
                          </button>
                          <button type="button" onClick={handleDelete} disabled={isSubmittingDelete} className="flex-1 py-4 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold rounded-xl transition-colors border border-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isSubmittingDelete ? 'Menghapus...' : <><Trash2 size={20} /> Hapus Buku Ini</>}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'anggota' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-amber-500 mb-2">Manajemen Izin Anggota</h2>
                <p className="text-zinc-400">Berikan atau cabut izin download E-Book (PDF) untuk setiap anggota.</p>
              </div>

              {members.length === 0 ? (
                <div className="bg-amber-500/10 text-amber-500 p-6 rounded-2xl border border-amber-500/30 font-medium flex items-center gap-3">
                  <span className="text-xl">ℹ️</span> Belum ada anggota yang terdaftar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                        <th className="pb-4 font-semibold">Nama Anggota</th>
                        <th className="pb-4 font-semibold">Jenjang & Kelas</th>
                        <th className="pb-4 font-semibold text-center">Izin Download</th>
                        <th className="pb-4 font-semibold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {members.map(member => (
                        <tr key={member.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="py-4 text-zinc-200 font-medium">{member.nama}</td>
                          <td className="py-4 text-zinc-400">{member.jenjang} - {member.kelas}</td>
                          <td className="py-4 text-center">
                            {member.canDownload ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30">
                                <CheckCircle size={12} /> Diizinkan
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                <XCircle size={12} /> Terkunci
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => toggleDownloadPermission(member.id)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                                member.canDownload 
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20' 
                                  : 'bg-teal-500/10 text-teal-400 border-teal-500/30 hover:bg-teal-500/20'
                              }`}
                            >
                              {member.canDownload ? 'Cabut Izin' : 'Beri Izin'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tema' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-amber-500 mb-2">Pilih Warna Latar Belakang</h2>
                <p className="text-zinc-400">Sesuaikan warna latar belakang aplikasi sesuai preferensi Anda. Tema utama tetap gelap dengan aksen emas.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => setBgColor(color.hex)}
                    className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                      bgColor === color.hex 
                        ? 'border-amber-500 shadow-md scale-105 bg-amber-500/10' 
                        : 'border-zinc-800 hover:border-amber-500/50 hover:shadow-sm bg-zinc-950'
                    }`}
                  >
                    <div 
                      className="w-14 h-14 rounded-full shadow-inner mb-4 border border-zinc-700"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-bold text-zinc-300 text-center mb-1">{color.name}</span>
                    <span className="text-xs font-mono text-zinc-500">{color.hex}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
