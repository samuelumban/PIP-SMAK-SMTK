
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

  // Fungsi helper untuk merubah angka (termasuk scientific notation) menjadi string murni
  const formatCellValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    
    // Jika tipe data adalah number, kita paksa ke string tanpa notasi ilmiah
    if (typeof val === 'number') {
      // Menggunakan toFixed(0) untuk angka bulat besar seperti NIK
      // Jika angka sangat besar, toFixed(0) tetap memberikan representasi string lengkapnya
      return val.toLocaleString('fullwide', { useGrouping: false });
    }
    
    return String(val).trim();
  };

  const processFile = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        // Membaca workbook dengan cellNF (Number Format) true
        const workbook = (window as any).XLSX.read(data, { type: 'binary', cellNF: true, cellText: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Menggunakan raw: true agar kita bisa menangani angka sendiri dan menghindari pembulatan library
        const json = (window as any).XLSX.utils.sheet_to_json(sheet, { raw: true, defval: "" });

        if (!json || json.length === 0) {
          throw new Error("File kosong atau tidak terbaca.");
        }

        const mappedData: PIPData[] = json
          .filter((row: any) => {
            const values = Object.values(row).join("").trim();
            return values.length > 0;
          })
          .map((row: any) => {
            const entry: any = {};
            const rowKeys = Object.keys(row);

            PIP_FIELDS.forEach((field) => {
              const key = rowKeys.find(k => {
                const normalizedKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normalizedLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normalizedId = String(field.id).toLowerCase().replace(/[^a-z0-9]/g, '');
                
                return normalizedKey.includes(normalizedLabel) || 
                       normalizedLabel.includes(normalizedKey) ||
                       normalizedKey === normalizedId;
              });

              // Ambil nilai mentah dan format agar tidak menjadi eksponen
              let rawVal = key ? row[key] : "";
              let val = formatCellValue(rawVal);
              
              // Pembersihan khusus untuk kolom angka agar hanya berisi digit (menghapus tanda titik/koma ribuan jika ada)
              if (field.id === 'nik' || field.id === 'nisn' || field.id === 'noRekening' || field.id === 'nikIbu' || field.id === 'nominal' || field.id === 'emis' || field.id === 'npsn') {
                val = val.replace(/[^0-9]/g, '');
              }

              entry[field.id] = val;
            });
            return entry;
          });

        console.log(`Berhasil memetakan ${mappedData.length} baris data.`);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="relative">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
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
          <div className="mt-4 flex gap-2">
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">Format: .xlsx, .xls, .csv</span>
          </div>
        </div>
      </div>

      {isProcessing && (
        <div className="absolute inset-0 bg-blue-50/90 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center z-10 animate-in">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h3 className="text-blue-600 font-bold text-lg">Memproses Seluruh Data...</h3>
          <p className="text-blue-400 text-xs font-medium mt-1 text-center px-6">
            Sistem sedang memetakan kolom dan memproses format angka. Mohon tunggu sebentar.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
