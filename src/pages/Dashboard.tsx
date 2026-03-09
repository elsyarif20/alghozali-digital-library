import { Book } from '../types';
import { BookCopy, CheckCircle2, Users } from 'lucide-react';

interface DashboardProps {
  books: Book[];
}

export default function Dashboard({ books }: DashboardProps) {
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.status === 'Tersedia').length;
  const borrowedBooks = totalBooks - availableBooks;
  const recentBooks = [...books].slice(-4).reverse();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-3 tracking-tight">Selamat Datang di Perpustakaan Digital <span className="inline-block animate-bounce-slow">📚</span></h1>
        <p className="text-lg text-slate-600 max-w-3xl leading-relaxed">Menebar ilmu dan hikmah melalui literasi Islami. Jelajahi ribuan koleksi buku fisik dan e-book kami.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-5 group">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-100 transition-all duration-300">
            <BookCopy size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Koleksi</p>
            <p className="text-3xl font-bold text-slate-900">{totalBooks}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-5 group">
          <div className="p-4 bg-teal-50 text-teal-600 rounded-xl group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300">
            <CheckCircle2 size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Tersedia di Rak</p>
            <p className="text-3xl font-bold text-slate-900">{availableBooks}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-5 group">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 group-hover:bg-amber-100 transition-all duration-300">
            <Users size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Sedang Dipinjam</p>
            <p className="text-3xl font-bold text-slate-900">{borrowedBooks}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6 flex items-center">
          <span className="text-amber-400 mr-3">🌟</span> Koleksi Terbaru
        </h2>
        {recentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentBooks.map(book => (
              <div key={book.id_buku} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No Cover</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 line-clamp-1 mb-1" title={book.judul}>{book.judul}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1 font-medium">{book.penulis}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-sky-50 text-sky-700 p-5 rounded-2xl text-sm font-medium border border-sky-100 flex items-center">
            <span className="mr-2">ℹ️</span> Belum ada koleksi buku yang ditambahkan.
          </div>
        )}
      </div>
    </div>
  );
}
