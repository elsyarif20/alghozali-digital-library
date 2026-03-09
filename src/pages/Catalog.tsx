import { useState, useMemo } from 'react';
import { Book } from '../types';
import { Search, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface CatalogProps {
  books: Book[];
}

export default function Catalog({ books }: CatalogProps) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">🔍 Eksplorasi Katalog Buku</h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">Temukan buku yang Anda cari dengan mudah melalui fitur pencarian dan filter kategori.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-10 flex flex-col md:flex-row gap-5">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Ketik judul buku atau penulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-all bg-slate-50 focus:bg-white"
          />
        </div>
        <div className="w-full md:w-72">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full pl-4 pr-10 py-3 text-base border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 transition-all bg-slate-50 focus:bg-white appearance-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBooks.map(book => (
            <div key={book.id_buku} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden group">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Cover</div>
                )}
                <div className="absolute top-4 right-4">
                  {book.status === 'Tersedia' ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100/90 text-teal-800 backdrop-blur-sm shadow-sm">
                      Tersedia
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100/90 text-rose-800 backdrop-blur-sm shadow-sm">
                      Dipinjam
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-slate-900 mb-2 leading-tight">{book.judul}</h3>
                <p className="text-sm text-slate-600 mb-4 font-medium">✍️ {book.penulis} <span className="mx-2 text-slate-300">•</span> 🏷️ {book.kategori}</p>
                
                <div className="mt-auto pt-4">
                  <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => setExpandedBook(expandedBook === book.id_buku ? null : book.id_buku)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-100 transition-colors text-sm font-semibold text-indigo-700"
                    >
                      <span className="flex items-center gap-2"><BookOpen size={18} /> Detail & Baca E-Book</span>
                      {expandedBook === book.id_buku ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    
                    {expandedBook === book.id_buku && (
                      <div className="p-5 bg-white border-t border-slate-100 text-sm animate-in slide-in-from-top-2 duration-200">
                        <p className="font-bold text-slate-900 mb-2">Sinopsis:</p>
                        <p className="text-slate-600 mb-5 leading-relaxed">
                          {book.sinopsis || <span className="italic text-slate-400">Sinopsis belum tersedia.</span>}
                        </p>
                        
                        {book.link_pdf ? (
                          <a
                            href={book.link_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold shadow-sm hover:shadow"
                          >
                            ↗️ BUKA PDF E-BOOK
                          </a>
                        ) : (
                          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-center font-medium border border-amber-100">
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
        <div className="bg-sky-50 text-sky-700 p-6 rounded-2xl border border-sky-100 flex items-center justify-center gap-3">
          <Search size={24} className="text-sky-500" />
          <span className="font-medium text-lg">Buku yang Anda cari tidak ditemukan.</span>
        </div>
      )}
    </div>
  );
}
