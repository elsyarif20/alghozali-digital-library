export interface Book {
  id_buku: string;
  judul: string;
  penulis: string;
  kategori: string;
  status: 'Tersedia' | 'Dipinjam';
  link_pdf: string | null;
  sinopsis: string | null;
  cover_url: string | null;
}

export interface BorrowHistory {
  id: number;
  nama_peminjam: string;
  id_buku: string;
  tanggal_pinjam: string;
  status: string;
}
