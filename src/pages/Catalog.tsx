import { useState, useMemo } from 'react';
import { Book } from '../types';
import { Search, ChevronDown, ChevronUp, BookOpen, Lock } from 'lucide-react';
import { Member } from '../components/Auth';

interface CatalogProps {
  books: Book[];
  currentUser: Member;
}

export default function Catalog({ books, currentUser }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(books.map(b => b.kategori));
    return ['Semua Kategori', ...Array.from(cats)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.judul.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            book.penulis.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'Semua Kategori' || book.kategori === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [books, searchQuery, filterCategory]);

  const canDownload = currentUser.role === 'admin' || currentUser.canDownload;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-amber-500 mb-3 tracking-tight">🔍 Eksplorasi Katalog Buku</h1>
        <p className="text-lg text-zinc-400 max-w-3xl leading-relaxed">Temukan buku yang Anda cari dengan mudah melalui fitur pencarian dan filter kategori.</p>
      </div>

      <div className="bg-zinc-900 p-5 rounded-2xl border border-amber-500/30 shadow-sm mb-10 flex flex-col md:flex-row gap-5">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-zinc-500" />
          </div>
          <input
            type="text"
            placeholder="Ketik judul buku atau penulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-zinc-100 transition-all bg-zinc-950 focus:bg-zinc-900 outline-none"
          />
        </div>
        <div className="w-full md:w-72 relative">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full pl-4 pr-10 py-3 text-base border border-zinc-800 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-zinc-100 transition-all bg-zinc-950 focus:bg-zinc-900 appearance-none cursor-pointer outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <ChevronDown size={20} className="text-zinc-500" />
          </div>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map(book => (
            <div key={book.id_buku} className="bg-zinc-900 rounded-2xl border border-amber-500/30 shadow-sm overflow-hidden flex flex-col hover:shadow-amber-500/10 hover:shadow-lg transition-all duration-300">
              <div className="aspect-[3/4] bg-zinc-950 relative overflow-hidden group border-b border-amber-500/20">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 font-medium">No Cover</div>
                )}
                <div className="absolute top-4 right-4">
                  {book.status === 'Tersedia' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-400 border border-teal-500/30 backdrop-blur-sm shadow-sm">
                      Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 backdrop-blur-sm shadow-sm">
                      Dipinjam
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-zinc-100 mb-2 leading-tight">{book.judul}</h3>
                <p className="text-sm text-zinc-400 mb-4 font-medium">✍️ {book.penulis} <span className="mx-2 text-zinc-700">•</span> 🏷️ {book.kategori}</p>
                
                <div className="mt-auto pt-4">
                  <div className="border border-amber-500/20 rounded-xl overflow-hidden bg-zinc-950">
                    <button
                      onClick={() => setExpandedBook(expandedBook === book.id_buku ? null : book.id_buku)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800 transition-colors text-sm font-semibold text-amber-500"
                    >
                      <span className="flex items-center gap-2"><BookOpen size={18} /> Detail & Baca E-Book</span>
                      {expandedBook === book.id_buku ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedBook === book.id_buku && (
                      <div className="p-6 bg-white border-t-2 border-amber-500 text-sm animate-in slide-in-from-top-2 duration-200">
                        <p className="font-bold text-black mb-2 text-lg font-serif border-b border-gray-200 pb-2">Sinopsis:</p>
                        <p className="text-gray-800 mb-6 leading-relaxed text-base">
                          {book.sinopsis || <span className="italic text-gray-500">Sinopsis belum tersedia.</span>}
                        </p>
                        
                        {book.link_pdf ? (
                          canDownload ? (
                            <a
                              href={book.link_pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center w-full px-5 py-3 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors font-bold shadow-sm hover:shadow"
                            >
                              ↗️ BUKA & DOWNLOAD E-BOOK
                            </a>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <button
                                disabled
                                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gray-200 text-gray-500 rounded-xl font-bold cursor-not-allowed"
                              >
                                <Lock size={18} /> DOWNLOAD TERKUNCI
                              </button>
                              <p className="text-xs text-center text-rose-600 font-medium">
                                Anda belum memiliki izin untuk mengunduh. Silakan hubungi Admin.
                              </p>
                            </div>
                          )
                        ) : (
                          <div className="p-4 bg-gray-100 text-gray-600 rounded-xl text-center font-medium border border-gray-200">
                            E-Book PDF tidak tersedia.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 text-zinc-400 p-6 rounded-2xl border border-zinc-800 flex items-center justify-center gap-3">
          <Search size={24} className="text-zinc-600" />
          <span className="font-medium text-lg">Buku yang Anda cari tidak ditemukan.</span>
        </div>
      )}
    </div>
  );
}
