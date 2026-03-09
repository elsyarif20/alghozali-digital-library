import { useState, useRef } from 'react';
import { Book } from '../types';
import { supabase } from '../lib/supabase';
import { PlusCircle, Edit3, Trash2, Save, UploadCloud, Palette } from 'lucide-react';

interface AdminProps {
  books: Book[];
  refreshBooks: () => void;
  bgColor: string;
  setBgColor: (color: string) => void;
}

const THEME_COLORS = [
  { name: 'Default (Slate 50)', hex: '#f8fafc' },
  { name: 'Alice Blue', hex: '#F0F8FF' },
  { name: 'Antique White', hex: '#FAEBD7' },
  { name: 'Aqua', hex: '#00FFFF' },
  { name: 'Aquamarine', hex: '#7FFFD4' },
  { name: 'Azure', hex: '#F0FFFF' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Bisque', hex: '#FFE4C4' },
  { name: 'Black', hex: '#000000' },
  { name: 'Blanched Almond', hex: '#FFEBCD' },
  { name: 'Blue', hex: '#0000FF' },
];

export default function Admin({ books, refreshBooks, bgColor, setBgColor }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'tambah' | 'edit' | 'tema'>('tambah');
  
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
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Panel Administrator</h1>
        <div className="bg-indigo-50 text-indigo-800 p-5 rounded-2xl text-sm font-medium border border-indigo-100 flex items-center gap-3">
          <span className="text-xl">⚙️</span> Gunakan halaman ini untuk menambah, mengubah, menghapus koleksi perpustakaan, atau mengatur tema aplikasi.
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-slate-100 bg-slate-50/50">
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'tambah' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
            onClick={() => setActiveTab('tambah')}
          >
            <PlusCircle size={18} /> Tambah Koleksi Baru
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'edit' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
            onClick={() => {
              setActiveTab('edit');
              if (!selectedBookId && books.length > 0) {
                handleBookSelect(books[0].id_buku);
              }
            }}
          >
            <Edit3 size={18} /> Edit / Hapus Koleksi
          </button>
          <button
            className={`flex-1 py-5 px-6 text-center font-semibold text-sm focus:outline-none transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'tema' ? 'bg-white border-b-2 border-indigo-500 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
            onClick={() => setActiveTab('tema')}
          >
            <Palette size={18} /> Pengaturan Tema
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'tambah' && (
            <div className="animate-in fade-in duration-300">
              {tambahMessage && (
                <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${tambahMessage.type === 'success' ? 'bg-teal-50 text-teal-800 border-teal-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                  {tambahMessage.text}
                </div>
              )}

              <form onSubmit={handleTambah} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">🔑 ID Buku (Contoh: B001)</label>
                    <input type="text" value={newId} onChange={e => setNewId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">📖 Judul Buku</label>
                    <input type="text" value={newJudul} onChange={e => setNewJudul(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">✍️ Penulis</label>
                    <input type="text" value={newPenulis} onChange={e => setNewPenulis(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">🏷️ Kategori</label>
                    <input type="text" value={newKategori} onChange={e => setNewKategori(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">📝 Sinopsis Singkat</label>
                  <textarea value={newSinopsis} onChange={e => setNewSinopsis(e.target.value)} rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"></textarea>
                </div>

                <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-indigo-500" /> Upload Cover (JPG/PNG)</label>
                    <input type="file" accept=".jpg,.jpeg,.png" ref={coverInputRef} onChange={e => setFileCover(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors cursor-pointer" />
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-teal-500" /> Upload E-Book (PDF)</label>
                    <input type="file" accept=".pdf" ref={pdfInputRef} onChange={e => setFilePdf(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 transition-colors cursor-pointer" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmittingTambah} className="w-full py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
                  {isSubmittingTambah ? 'Menyimpan...' : <><Save size={20} /> Simpan Data Buku</>}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="animate-in fade-in duration-300">
              {books.length === 0 ? (
                <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl border border-amber-100 font-medium flex items-center gap-3">
                  <span className="text-xl">ℹ️</span> Belum ada data buku.
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Buku yang akan diedit:</label>
                    <select value={selectedBookId} onChange={e => handleBookSelect(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer">
                      <option value="" disabled>-- Pilih Buku --</option>
                      {books.map(b => (
                        <option key={b.id_buku} value={b.id_buku}>{b.judul}</option>
                      ))}
                    </select>
                  </div>

                  {selectedBookId && (
                    <div className="border-t border-slate-100 pt-8">
                      {editMessage && (
                        <div className={`p-4 mb-8 rounded-xl text-sm font-medium border ${editMessage.type === 'success' ? 'bg-teal-50 text-teal-800 border-teal-100' : 'bg-rose-50 text-rose-800 border-rose-100'}`}>
                          {editMessage.text}
                        </div>
                      )}

                      <form onSubmit={handleEdit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Judul Buku</label>
                            <input type="text" value={editJudul} onChange={e => setEditJudul(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Penulis</label>
                            <input type="text" value={editPenulis} onChange={e => setEditPenulis(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                            <input type="text" value={editKategori} onChange={e => setEditKategori(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all" required />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Status Fisik</label>
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value as any)} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all appearance-none cursor-pointer">
                              <option value="Tersedia">Tersedia</option>
                              <option value="Dipinjam">Dipinjam</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Sinopsis Buku</label>
                          <textarea value={editSinopsis} onChange={e => setEditSinopsis(e.target.value)} rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-all"></textarea>
                        </div>

                        <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-indigo-500" /> Timpa Cover Lama (Opsional)</label>
                            <input type="file" accept=".jpg,.jpeg,.png" ref={editCoverInputRef} onChange={e => setEditFileCover(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors cursor-pointer" />
                          </div>
                          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><UploadCloud size={18} className="text-teal-500" /> Timpa PDF Lama (Opsional)</label>
                            <input type="file" accept=".pdf" ref={editPdfInputRef} onChange={e => setEditFilePdf(e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-100 file:text-teal-700 hover:file:bg-teal-200 transition-colors cursor-pointer" />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <button type="submit" disabled={isSubmittingEdit} className="flex-1 py-4 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {isSubmittingEdit ? 'Menyimpan...' : <><Save size={20} /> Simpan Perubahan</>}
                          </button>
                          <button type="button" onClick={handleDelete} disabled={isSubmittingDelete} className="flex-1 py-4 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-colors border border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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

          {activeTab === 'tema' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Pilih Warna Latar Belakang</h2>
                <p className="text-slate-600">Sesuaikan warna latar belakang aplikasi sesuai preferensi Anda. Perubahan akan langsung diterapkan dan tersimpan.</p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                {THEME_COLORS.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => setBgColor(color.hex)}
                    className={`flex flex-col items-center p-5 rounded-2xl border-2 transition-all duration-300 ${
                      bgColor === color.hex 
                        ? 'border-indigo-500 shadow-md scale-105 bg-indigo-50/30' 
                        : 'border-slate-100 hover:border-indigo-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div 
                      className="w-14 h-14 rounded-full shadow-inner mb-4 border border-slate-200/50"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-bold text-slate-700 text-center mb-1">{color.name}</span>
                    <span className="text-xs font-mono text-slate-400">{color.hex}</span>
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
