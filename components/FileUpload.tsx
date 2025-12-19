
import React, { useRef, useState } from 'react';
import { PIPData } from '../types';
import { PIP_FIELDS } from '../constants';

interface FileUploadProps {
  onDataLoaded: (data: PIPData[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = (window as any).XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = (window as any).XLSX.utils.sheet_to_json(sheet);

      // Mapping Logic
      // Assuming headers might be slightly different, we try to match them or use indices
      const mappedData: PIPData[] = json.map((row: any) => {
        const entry: any = {};
        PIP_FIELDS.forEach((field) => {
          // Try matching by label or field id
          const key = Object.keys(row).find(k => {
            const searchKey = k.toLowerCase();
            // Fix: Cast field.id to string because keyof PIPData can be string | number | symbol in some TS contexts
            return searchKey.includes(field.label.toLowerCase()) || 
                   searchKey.includes(String(field.id).toLowerCase());
          });
          entry[field.id] = key ? String(row[key]) : "";
        });
        return entry;
      });

      onDataLoaded(mappedData);
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
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white hover:border-blue-400'
      }`}
      onClick={() => fileInputRef.current?.click()}
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
  );
};

export default FileUpload;
