
import React, { useState } from 'react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('backend');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const backendCode = `/** 
 * COPY KODE INI KE GOOGLE APPS SCRIPT (gs)
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var contents = JSON.parse(e.postData.contents);
    var data = Array.isArray(contents) ? contents : [contents];
    
    data.forEach(function(item) {
      sheet.appendRow([
        "'" + (item.nik || ""), 
        "'" + (item.nisn || ""),
        item.namaLengkap || "",
        item.jenisKelamin || "",
        item.tempatTanggalLahir || "",
        "'" + (item.nikIbu || ""),
        item.namaIbu || "",
        "'" + (item.emis || ""),
        "'" + (item.npsn || ""),
        item.jenisSekolah || "",
        item.namaSekolah || "",
        item.kabKota || "",
        item.provinsi || "",
        item.bank || "",
        "'" + (item.noRekening || ""),
        item.namaRekening || "",
        item.nominal || "",
        item.tahunPenerimaan || ""
      ]);
    });
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput("API PIP Satuan Pendidikan Keagamaan Kristen Aktif.");
}`;

  const frontendCode = `// URL Web App yang digunakan:
// https://script.google.com/macros/s/AKfycbzQwnYfU3GocQS5NEkNAvE_2HZv2G4im8y5TT3zJ6C5WkVdGqorLCS5CZxkQxQyaWBG7w/exec

// Komponen utama (App.tsx) menggunakan React dan Tailwind CSS.
// Input manual divalidasi dengan regex untuk NIK (16 digit) dan NISN (10 digit).
// Font isian kolom disetel hitam (text-black) untuk keterbacaan maksimal.
// Fitur unggah excel menggunakan library xlsx.full.min.js.`;

  const handleCopy = () => {
    const code = activeTab === 'backend' ? backendCode : frontendCode;
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Salin Kode Aplikasi</h2>
            <p className="text-xs text-slate-500">Gunakan kode ini untuk deployment Anda</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fa-solid fa-circle-xmark text-2xl"></i>
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 m-4 rounded-xl">
          <button 
            onClick={() => setActiveTab('backend')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'backend' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Backend (Google Apps Script)
          </button>
          <button 
            onClick={() => setActiveTab('frontend')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'frontend' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Informasi Frontend
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="relative group">
            <pre className="bg-slate-900 text-slate-300 p-5 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
              {activeTab === 'backend' ? backendCode : frontendCode}
            </pre>
            <button 
              onClick={handleCopy}
              className={`absolute top-3 right-3 px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
                copySuccess ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {copySuccess ? <><i className="fa-solid fa-check"></i> Tersalin!</> : <><i className="fa-solid fa-copy"></i> Salin Kode</>}
            </button>
          </div>
          
          {activeTab === 'backend' && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <h4 className="text-xs font-bold text-amber-800 mb-1 uppercase">Cara Deploy:</h4>
              <ol className="text-[11px] text-amber-900 space-y-1 list-decimal ml-4">
                <li>Buka Google Spreadsheet Anda.</li>
                <li>Klik <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
                <li>Hapus kode lama dan tempelkan kode di atas.</li>
                <li>Klik <strong>Deploy</strong> &gt; <strong>New Deployment</strong>.</li>
                <li>Pilih type <strong>Web App</strong>, akses: <strong>Anyone</strong>.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-bold rounded-lg text-sm hover:bg-slate-900 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeModal;
