
import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  currentUrl: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentUrl }) => {
  const [url, setUrl] = useState(currentUrl);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-800">Pengaturan Integrasi</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Masukkan <strong>Google Apps Script Web App URL</strong> Anda untuk mengintegrasikan data ke Google Sheets secara real-time.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Web App URL</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase mb-1">Instruksi Singkat:</h3>
            <ol className="text-xs text-blue-700 list-decimal pl-4 space-y-1">
              <li>Buka Google Sheet Anda.</li>
              <li>Klik Extensions &gt; Apps Script.</li>
              <li>Tempel kode <code>doPost</code> (lihat panduan di bawah).</li>
              <li>Klik Deploy &gt; New Deployment &gt; Web App.</li>
              <li>Set Access ke "Anyone". Salin URL yang dihasilkan.</li>
            </ol>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button 
            onClick={() => { onSave(url); onClose(); }}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Simpan Konfigurasi
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
