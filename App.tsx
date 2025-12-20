
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
  
  // State untuk Inline Editing
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<PIPData | null>(null);

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
    showToast("Data ditambahkan ke antrean!", "success");
  };

  const addBulkData = (newEntries: PIPData[]) => {
    setDataQueue(prev => [...prev, ...newEntries]);
    showToast(`${newEntries.length} data dimuat ke antrean!`, "success");
  };

  const removeData = (index: number) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditFormData(null);
    }
    setDataQueue(prev => prev.filter((_, i) => i !== index));
  };

  // Logika Editing
  const startEditing = (index: number, item: PIPData) => {
    setEditingIndex(index);
    setEditFormData({ ...item });
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setEditFormData(null);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editFormData) {
      const newDataQueue = [...dataQueue];
      newDataQueue[editingIndex] = editFormData;
      setDataQueue(newDataQueue);
      setEditingIndex(null);
      setEditFormData(null);
      showToast("Perubahan data disimpan.", "success");
    }
  };

  // Fixed: Changed fieldId type to keyof PIPData to allow passing colId which is (keyof PIPData)
  const handleEditChange = (fieldId: keyof PIPData, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [fieldId]: value });
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
              <h1 className="text-lg font-bold leading-tight uppercase tracking-tight">PIP SMAK / SMTK</h1>
              <p className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Ditjen Bimas Kristen</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <section className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-8 text-white shadow-2xl border border-blue-600/50">
          <div className="md:flex justify-between items-center gap-8">
            <div className="md:max-w-2xl">
              <h2 className="text-3xl font-black mb-3 uppercase tracking-tight">Pengumpulan Data Siswa</h2>
              <p className="opacity-80 text-sm leading-relaxed">Kelola data penerima PIP secara kolektif. Anda dapat mengedit isian langsung pada tabel sebelum dikirim ke pusat.</p>
            </div>
            <div className="mt-8 md:mt-0 flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="bg-white/10 backdrop-blur-xl px-8 py-4 rounded-2xl text-center border border-white/20 shadow-inner">
                <div className="text-4xl font-black">{dataQueue.length}</div>
                <div className="text-[10px] uppercase font-black opacity-60 tracking-tighter">Antrean Data</div>
              </div>
              <button 
                onClick={handleSubmitToGoogle}
                disabled={isSubmitting || dataQueue.length === 0}
                className="px-10 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
              >
                {isSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-cloud-arrow-up text-xl group-hover:scale-110 transition-transform"></i>}
                KIRIM DATA
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex gap-2 bg-slate-200/50 p-1.5 rounded-2xl w-fit border border-slate-200">
              <button onClick={() => setActiveTab('manual')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-white text-blue-800 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                Input Manual
              </button>
              <button onClick={() => setActiveTab('upload')} className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'upload' ? 'bg-white text-blue-800 shadow-md ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800'}`}>
                Unggah Excel
              </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'manual' ? <ManualForm onSubmit={addData} /> : <FileUpload onDataLoaded={addBulkData} />}
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-4">
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl shadow-sm">
              <h3 className="text-blue-900 font-black mb-4 text-xs uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-file-excel"></i>
                Template
              </h3>
              <button onClick={downloadTemplate} className="w-full bg-white text-blue-700 text-xs font-black py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all border border-blue-200 shadow-sm">
                UNDUH TEMPLATE EXCEL
              </button>
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-slate-800 font-black mb-3 text-xs uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square text-blue-600"></i>
                Edit Data
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Klik ikon pensil di kolom aksi tabel untuk memperbaiki data yang salah ketik.
              </p>
            </div>
          </div>
        </div>

        {dataQueue.length > 0 && (
          <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">Review Antrean Data</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total: {dataQueue.length} Siswa</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] whitespace-nowrap">
                <thead className="bg-slate-100 text-slate-500 uppercase font-black tracking-tighter">
                  <tr>
                    <th className="px-5 py-4 border-b sticky left-0 bg-slate-100 z-10 text-center">Aksi</th>
                    <th className="px-5 py-4 border-b text-center">No</th>
                    {tableColumnOrder.map(colId => (
                      <th key={colId} className="px-5 py-4 border-b">{getFieldLabel(colId)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dataQueue.map((item, idx) => {
                    const isEditing = editingIndex === idx;
                    return (
                      <tr key={idx} className={`group transition-colors ${isEditing ? 'bg-blue-50/70' : 'hover:bg-blue-50/30'}`}>
                        <td className="px-5 py-4 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 border-r border-slate-100 text-center shadow-sm">
                          <div className="flex items-center justify-center gap-3">
                            {isEditing ? (
                              <>
                                <button onClick={saveEdit} className="text-green-600 hover:scale-125 transition-all" title="Simpan">
                                  <i className="fa-solid fa-circle-check text-xl"></i>
                                </button>
                                <button onClick={cancelEditing} className="text-slate-400 hover:scale-125 transition-all" title="Batal">
                                  <i className="fa-solid fa-circle-xmark text-xl"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEditing(idx, item)} className="text-blue-500 hover:scale-125 transition-all" title="Edit">
                                  <i className="fa-solid fa-pen-to-square text-lg"></i>
                                </button>
                                <button onClick={() => removeData(idx)} className="text-slate-300 hover:text-red-500 transition-all hover:scale-125" title="Hapus">
                                  <i className="fa-solid fa-trash text-lg"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-mono text-center font-bold">{idx + 1}</td>
                        {tableColumnOrder.map(colId => {
                          const fieldCfg = PIP_FIELDS.find(f => f.id === colId);
                          return (
                            <td key={colId} className={`px-5 py-4 text-slate-800 font-bold ${!item[colId] && !isEditing ? 'bg-red-50/50' : ''}`}>
                              {isEditing && editFormData ? (
                                fieldCfg?.type === 'select' ? (
                                  <select 
                                    value={editFormData[colId]} 
                                    onChange={(e) => handleEditChange(colId, e.target.value)}
                                    className="bg-white border border-blue-300 rounded px-2 py-1 outline-none min-w-[120px]"
                                  >
                                    <option value="">Pilih</option>
                                    {fieldCfg.options?.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                ) : (
                                  <input 
                                    type="text" 
                                    value={editFormData[colId]} 
                                    onChange={(e) => handleEditChange(colId, e.target.value)}
                                    className="bg-white border border-blue-300 rounded px-2 py-1 outline-none min-w-[120px] focus:ring-1 focus:ring-blue-500"
                                  />
                                )
                              ) : (
                                item[colId] || <span className="text-red-400 italic font-black">KOSONG</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 py-4 px-4 text-center z-30 shadow-2xl">
        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.4em]">
            © 2024 Ditjen Bimas Kristen • Satuan Pendidikan Keagamaan Kristen
        </p>
      </footer>
    </div>
  );
};

export default App;
