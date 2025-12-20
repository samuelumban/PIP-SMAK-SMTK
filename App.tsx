
import React, { useState, useEffect } from 'react';
import { PIPData } from './types';
import { PIP_FIELDS, WEB_APP_URL } from './constants';
import ManualForm from './components/ManualForm';
import FileUpload from './components/FileUpload';

const App: React.FC = () => {
  const [dataQueue, setDataQueue] = useState<PIPData[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const addData = (newData: PIPData) => {
    setDataQueue(prev => [...prev, newData]);
    showToast("Data berhasil ditambahkan ke antrean!", "success");
  };

  const addBulkData = (newEntries: PIPData[]) => {
    setDataQueue(prev => [...prev, ...newEntries]);
    showToast(`${newEntries.length} data berhasil dimuat ke antrean!`, "success");
  };

  const removeData = (index: number) => {
    setDataQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.confirm("Apakah Anda yakin ingin menghapus SEMUA data dalam antrean? Tindakan ini tidak dapat dibatalkan.")) {
      setDataQueue([]);
      showToast("Seluruh antrean telah dibersihkan.", "info");
    }
  };

  const handleSubmitToGoogle = async () => {
    if (dataQueue.length === 0) {
      showToast("Antrean masih kosong.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataQueue)
      });

      showToast("Data berhasil dikirim ke Spreadsheet!", "success");
      setDataQueue([]);
    } catch (error) {
      console.error("Submission error:", error);
      showToast("Gagal mengirim data. Periksa koneksi internet.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableColumnOrder: (keyof PIPData)[] = [
    'nik', 'nisn', 'namaLengkap', 'jenisKelamin', 'tempatTanggalLahir', 'nikIbu', 'namaIbu',
    'emis', 'npsn', 'jenisSekolah', 'namaSekolah', 'kabKota', 'provinsi', 'bank',
    'noRekening', 'namaRekening', 'nominal', 'tahunPenerimaan'
  ];

  const getFieldLabel = (id: keyof PIPData) => {
    return PIP_FIELDS.find(f => f.id === id)?.label || String(id);
  };

  const downloadTemplate = () => {
    const headers = tableColumnOrder.map(id => getFieldLabel(id));
    const templateData = [headers];
    
    try {
      const wb = (window as any).XLSX.utils.book_new();
      const ws = (window as any).XLSX.utils.aoa_to_sheet(templateData);
      (window as any).XLSX.utils.book_append_sheet(wb, ws, "Template_PIP");
      (window as any).XLSX.writeFile(wb, "Template_Data_PIP_SMAK_SMTK.xlsx");
      showToast("Template kosong berhasil diunduh!", "success");
    } catch (e) {
      showToast("Gagal mengunduh template.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-black">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in">
          <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-bold border ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <i className={`fa-solid ${
              toast.type === 'error' ? 'fa-circle-exclamation' : 
              toast.type === 'success' ? 'fa-circle-check' : 
              'fa-circle-info'
            }`}></i>
            {toast.message}
          </div>
        </div>
      )}

      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-graduation-cap text-2xl"></i>
            <div>
              <h1 className="text-lg font-bold leading-tight uppercase">PIP SMAK / SMTK</h1>
              <p className="text-[10px] uppercase font-semibold opacity-70 tracking-wider">Satuan Pendidikan Keagamaan Kristen</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="md:flex justify-between items-center">
            <div className="md:max-w-2xl">
              <h2 className="text-3xl font-bold mb-2 uppercase tracking-tight">Pengumpulan Data Siswa</h2>
              <p className="opacity-90">Kumpulkan data penerima PIP Satuan Pendidikan Keagamaan Kristen (SMAK/SMTK) secara kolektif untuk dikirim ke Google Spreadsheet pusat.</p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-4 items-center">
              <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-xl text-center border border-white/20 min-w-[120px]">
                <div className="text-3xl font-bold">{dataQueue.length}</div>
                <div className="text-[10px] uppercase font-bold opacity-75">Antrean</div>
              </div>
              <button 
                onClick={handleSubmitToGoogle}
                disabled={isSubmitting || dataQueue.length === 0}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up text-xl group-hover:scale-110 transition-transform"></i>}
                Kirim Ke Database
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
          <button 
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            className="w-full p-5 flex justify-between items-center hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-map-location-dot text-blue-600"></i>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Lihat Panduan Alur Pengumpulan Data Massal
              </h3>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform duration-300 ${isGuideOpen ? 'rotate-180' : ''}`}></i>
          </button>
          
          {isGuideOpen && (
            <div className="px-6 pb-8 pt-2 animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50 hover:border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">1</div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Unduh Template</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Ambil format Excel resmi di menu sebelah kanan</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50 hover:border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">2</div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Isi Data Siswa</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Lengkapi semua kolom sesuai dokumen siswa</p>
                </div>

                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50 hover:border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">3</div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Unggah File</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Tarik file Excel ke area unggah yang tersedia</p>
                </div>

                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50 hover:border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">4</div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Cek Kevalidan</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Review data di tabel antrean (lihat kolom merah)</p>
                </div>

                <div className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100 relative group transition-all hover:bg-blue-50 hover:border-blue-100">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold mb-3 shadow-md group-hover:scale-110 transition-transform">5</div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase mb-1">Kirim Database</h4>
                  <p className="text-[10px] text-slate-500 leading-tight">Klik tombol hijau untuk simpan permanen ke pusat</p>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex gap-1 bg-slate-200 p-1 rounded-xl w-fit">
              <button 
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'manual' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Input Manual
              </button>
              <button 
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'upload' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Unggah Excel
              </button>
            </div>

            <div className="animate-in">
              {activeTab === 'manual' ? (
                <ManualForm onSubmit={addData} />
              ) : (
                <FileUpload onDataLoaded={addBulkData} />
              )}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-amber-800 font-bold mb-3 text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-info"></i>
                Penting
              </h3>
              <ul className="text-xs text-amber-900 space-y-3 leading-relaxed list-disc ml-4">
                <li><strong>NIK & NISN</strong> harus sesuai dengan data dokumen siswa.</li>
                <li><strong>Nominal</strong> hanya angka saja tanpa tanda baca (misal: 1000000).</li>
                <li>Gunakan template Excel resmi untuk pengisian massal.</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-blue-800 font-bold mb-3 text-sm flex items-center gap-2">
                <i className="fa-solid fa-file-excel"></i>
                Template
              </h3>
              <button 
                onClick={downloadTemplate}
                className="w-full bg-blue-600 text-white text-xs font-bold py-3 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fa-solid fa-download"></i>
                Unduh Template Excel
              </button>
            </div>
          </div>
        </div>

        {dataQueue.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800">Review Antrean Data ({dataQueue.length})</h3>
                <p className="text-xs text-slate-500">Berikut adalah data yang siap dikirim ke database pusat.</p>
              </div>
              <button 
                type="button"
                onClick={clearQueue}
                className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-200 transition-all active:scale-95 shadow-sm"
              >
                <i className="fa-solid fa-trash-can"></i>
                Hapus Semua Antrean
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-500 uppercase font-bold">
                  <tr>
                    <th className="px-4 py-3 border-b sticky left-0 bg-slate-100 z-10 shadow-sm">Hapus</th>
                    <th className="px-4 py-3 border-b text-center">No</th>
                    {tableColumnOrder.map(colId => (
                      <th key={colId} className="px-4 py-3 border-b">{getFieldLabel(colId)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataQueue.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 text-center">
                        <button 
                          onClick={() => removeData(idx)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <i className="fa-solid fa-circle-xmark text-lg"></i>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                      {tableColumnOrder.map(colId => (
                        <td key={colId} className={`px-4 py-3 text-black font-medium ${!item[colId] ? 'bg-red-50' : ''}`}>
                          {item[colId] || <span className="text-red-400 italic">Kosong</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-4 px-4 text-center z-30">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            © 2024 Ditjen Bimas Kristen - Satuan Pendidikan Keagamaan Kristen
        </p>
      </footer>
    </div>
  );
};

export default App;
