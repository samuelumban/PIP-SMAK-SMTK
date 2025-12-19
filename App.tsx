
import React, { useState, useEffect } from 'react';
import { PIPData, AppSettings } from './types';
import { PIP_FIELDS } from './constants';
import ManualForm from './components/ManualForm';
import FileUpload from './components/FileUpload';
import SettingsModal from './components/SettingsModal';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [dataQueue, setDataQueue] = useState<PIPData[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pip_app_settings');
    return saved ? JSON.parse(saved) : { googleWebAppUrl: '' };
  });

  useEffect(() => {
    localStorage.setItem('pip_app_settings', JSON.stringify(settings));
  }, [settings]);

  const addData = (newData: PIPData) => {
    setDataQueue(prev => [...prev, newData]);
  };

  const addBulkData = async (newEntries: PIPData[]) => {
    try {
      const validated = await geminiService.validateAndCleanData(newEntries);
      setDataQueue(prev => [...prev, ...validated]);
      alert(`${validated.length} data berhasil dimuat!`);
    } catch (error) {
      setDataQueue(prev => [...prev, ...newEntries]);
      alert("Data dimuat tanpa validasi AI.");
    }
  };

  const removeData = (index: number) => {
    setDataQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    if (window.confirm("Hapus semua data dalam antrean?")) {
      setDataQueue([]);
    }
  };

  const handleSubmitToGoogle = async () => {
    if (!settings.googleWebAppUrl) {
      alert("Harap atur URL tujuan di menu Pengaturan (ikon gear) terlebih dahulu.");
      setIsSettingsOpen(true);
      return;
    }

    if (dataQueue.length === 0) {
      alert("Antrean kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(settings.googleWebAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataQueue)
      });

      alert("Data sedang dikirim ke database! Silakan periksa spreadsheet Anda.");
      setDataQueue([]);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Gagal mengirim data. Periksa koneksi dan URL tujuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define custom column order for the Review Table
  const tableColumnOrder: (keyof PIPData)[] = [
    'namaLengkap',
    'tempatTanggalLahir',
    'nik',
    'nisn',
    'jenisKelamin',
    'nikIbu',
    'namaIbu',
    'emis',
    'npsn',
    'jenisSekolah',
    'namaSekolah',
    'kabKota',
    'provinsi',
    'bank',
    'noRekening',
    'namaRekening',
    'nominal',
    'tahunPenerimaan'
  ];

  const getFieldLabel = (id: keyof PIPData) => {
    return PIP_FIELDS.find(f => f.id === id)?.label || String(id);
  };

  const downloadTemplate = () => {
    const headers = tableColumnOrder.map(id => getFieldLabel(id));
    const sampleData = [
      headers,
      [
        "Budi Santoso", "Jakarta, 12-05-2008", "3171012345678901", "0081234567", 
        "Laki-laki", "3171012345678902", "Siti Aminah", "121232010001", 
        "20123456", "SMAK", "SMAK Kristen Jakarta", "Jakarta Pusat", 
        "DKI Jakarta", "BRI", "012345678910", "Budi Santoso", "1000000", "2024"
      ]
    ];
    
    const wb = (window as any).XLSX.utils.book_new();
    const ws = (window as any).XLSX.utils.aoa_to_sheet(sampleData);
    (window as any).XLSX.utils.book_append_sheet(wb, ws, "Template_PIP");
    // Perbaikan: writeFile berada langsung di bawah XLSX, bukan XLSX.utils
    (window as any).XLSX.writeFile(wb, "Template_Data_PIP_SMAK_SMTK.xlsx");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
              <i className="fa-solid fa-graduation-cap text-blue-800 text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PIP SMAK/SMTK</h1>
              <p className="text-[10px] uppercase font-semibold opacity-75">Satuan Pendidikan Keagamaan Kristen</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Pengaturan"
            >
              <i className="fa-solid fa-gear text-lg"></i>
            </button>
            <div className="hidden md:block h-6 w-px bg-blue-600 mx-2"></div>
            <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-medium">Satuan Pendidikan Keagamaan</span>
                <span className="text-[10px] opacity-75 leading-none">Status: Terverifikasi</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Intro Section */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl p-8 text-white shadow-xl">
          <div className="md:flex justify-between items-center">
            <div className="md:max-w-2xl">
              <h2 className="text-3xl font-bold mb-2 uppercase">Pengumpulan Data Siswa</h2>
              <p className="opacity-90">Sistem manajemen data penerima PIP khusus untuk SMAK dan SMTK. Pastikan data akurat sesuai dokumen resmi sekolah.</p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-4">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center border border-white/20 min-w-[120px]">
                <div className="text-2xl font-bold">{dataQueue.length}</div>
                <div className="text-[10px] uppercase font-bold opacity-75">Data Antrean</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs & Controls */}
        <div className="flex flex-col md:flex-row gap-8">
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

            <div className="animate-in fade-in duration-300">
              {activeTab === 'manual' ? (
                <ManualForm onSubmit={addData} />
              ) : (
                <FileUpload onDataLoaded={addBulkData} />
              )}
            </div>
          </div>

          {/* Guidelines Sidebar */}
          <div className="w-full md:w-80 space-y-4">
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-circle-info"></i>
                Ketentuan Validasi Ketat
              </h3>
              <ul className="text-xs text-amber-900 space-y-3">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>NIK & NIK Ibu wajib 16 digit angka.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>NISN wajib 10 digit angka.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-red-600">3.</span>
                  <span className="font-bold text-red-600">Nominal, Rekening, & EMIS wajib Angka saja.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Huruf, spasi, atau simbol pada kolom angka akan ditolak sistem.</span>
                </li>
              </ul>
            </div>

            {/* Template Download Section */}
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                <i className="fa-solid fa-file-arrow-down"></i>
                Template Excel
              </h3>
              <p className="text-xs text-blue-900 mb-4 leading-relaxed">
                Gunakan template Excel resmi kami untuk mempermudah proses pengisian data dalam jumlah banyak dan memastikan format sesuai dengan sistem.
              </p>
              <button 
                onClick={downloadTemplate}
                className="w-full bg-blue-600 text-white text-xs font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-download"></i>
                Download Template Excel
              </button>
            </div>
          </div>
        </div>

        {/* Preview Table & Global Submit Button */}
        {dataQueue.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 gap-4">
              <div>
                <h3 className="font-bold text-slate-800">Review Data SMAK/SMTK</h3>
                <p className="text-xs text-slate-500">Daftar siswa dalam antrean pengiriman database</p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button 
                  onClick={clearQueue}
                  className="flex-1 sm:flex-none px-4 py-2 text-red-600 text-sm font-bold hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                  <i className="fa-solid fa-trash-can mr-2"></i>
                  Hapus Semua
                </button>
                <button 
                  onClick={handleSubmitToGoogle}
                  disabled={isSubmitting}
                  className={`flex-1 sm:flex-none px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                  )}
                  {isSubmitting ? 'Mengirim...' : 'Kirim Ke Spreadsheet'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3 border-b sticky left-0 bg-slate-100 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Aksi</th>
                    <th className="px-6 py-3 border-b">No.</th>
                    {tableColumnOrder.map(colId => (
                      <th key={colId} className="px-6 py-3 border-b">{getFieldLabel(colId)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataQueue.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 group transition-colors">
                      <td className="px-6 py-3 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                        <button 
                          onClick={() => removeData(idx)}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          title="Hapus baris ini"
                        >
                          <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                      </td>
                      <td className="px-6 py-3 text-slate-500 font-mono text-xs">{idx + 1}</td>
                      {tableColumnOrder.map(colId => (
                        <td key={colId} className={`px-6 py-3 text-slate-700 ${!item[colId] ? 'bg-red-50' : ''}`}>
                          {item[colId] || <span className="text-red-500 italic font-bold">WAJIB ISI</span>}
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

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(url) => setSettings({ googleWebAppUrl: url })}
        currentUrl={settings.googleWebAppUrl}
      />

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3 px-4 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-4">
                <span>© 2024 PIP SMAK/SMTK</span>
                <span className="hidden sm:block h-3 w-px bg-slate-200"></span>
                <span className="hidden sm:block text-slate-500">Satuan Pendidikan Keagamaan Kristen</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${settings.googleWebAppUrl ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                <span className="text-slate-600">{settings.googleWebAppUrl ? 'Terhubung Ke Spreadsheet' : 'Koneksi Spreadsheet Belum Aktif'}</span>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
