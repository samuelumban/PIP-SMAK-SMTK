
import React, { useRef, useState } from 'react';
import { PIPData } from '../types';
import { PIP_FIELDS } from '../constants';

interface FileUploadProps {
  onDataLoaded: (data: PIPData[]) => Promise<void> | void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        // Membaca workbook dengan raw: false untuk mendapatkan teks yang diformat (menghindari eksponen)
        const workbook = (window as any).XLSX.read(data, { type: 'binary', cellNF: true, cellText: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Menggunakan raw: false dan defval agar library XLSX memberikan string yang sudah diformat di Excel-nya
        const json = (window as any).XLSX.utils.sheet_to_json(sheet, { 
          raw: false, 
          defval: "",
          blankrows: false 
        });

        if (!json || json.length === 0) {
          throw new Error("File kosong atau tidak terbaca.");
        }

        const mappedData: PIPData[] = json.map((row: any) => {
          const entry: any = {};
          const rowKeys = Object.keys(row);

          PIP_FIELDS.forEach((field) => {
            // Cari kunci yang paling mirip dengan label kolom
            const key = rowKeys.find(k => {
              const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
              const normalizedLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
              const normalizedId = String(field.id).toLowerCase().replace(/[^a-z0-9]/g, '');
              
              return normalizedKey.includes(normalizedLabel) || 
                     normalizedLabel.includes(normalizedKey) ||
                     normalizedKey === normalizedId;
            });

            let val = key ? String(row[key]).trim() : "";
            
            // Pembersihan khusus untuk kolom angka besar (NIK, NISN, Rekening)
            // Hapus karakter non-digit yang mungkin terbawa (seperti spasi, tanda petik, atau titik ribuan)
            // Fix: Cast field.id to string to resolve 'keyof PIPData' (string | number) compatibility with string array
            if (['nik', 'nisn', 'noRekening', 'nikIbu', 'nominal', 'emis', 'npsn'].includes(field.id as string)) {
              val = val.replace(/\D/g, '');
            }

            entry[field.id] = val;
          });
          return entry;
        });

        await onDataLoaded(mappedData);
      } catch (err: any) {
        console.error("Error processing excel file:", err);
        alert(`Gagal memproses file: ${err.message || "Pastikan format file sesuai."}`);
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      alert("Gagal membaca file.");
    };

    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="relative">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if(f) processFile(f); }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer min-h-[220px] flex items-center justify-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".xlsx, .xls, .csv" 
        />
        
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i className="fa-solid fa-file-excel text-3xl text-blue-600"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Unggah File Excel / CSV</h3>
          <p className="text-slate-500 mt-1">Seret file Anda ke sini atau klik untuk memilih file</p>
          <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">Format angka NIK/NISN akan dipertahankan</p>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-blue-50/90 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
          <h3 className="text-blue-600 font-bold">Memproses Data...</h3>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
