
import { FormField } from './types';

export const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzQwnYfU3GocQS5NEkNAvE_2HZv2G4im8y5TT3zJ6C5WkVdGqorLCS5CZxkQxQyaWBG7w/exec";

export const PIP_FIELDS: FormField[] = [
  { 
    id: 'nik', 
    label: 'NIK (16 Digit)', 
    placeholder: 'Masukkan 16 digit NIK', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d{16}$/.test(v) ? 'NIK harus 16 digit angka' : null 
  },
  { 
    id: 'nisn', 
    label: 'NISN (10 Digit)', 
    placeholder: 'Masukkan 10 digit NISN', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d{10}$/.test(v) ? 'NISN harus 10 digit angka' : null 
  },
  { id: 'namaLengkap', label: 'Nama Lengkap Siswa', placeholder: 'Sesuai Akta Kelahiran', type: 'text', required: true },
  { id: 'jenisKelamin', label: 'Jenis Kelamin', placeholder: 'Pilih Jenis Kelamin', type: 'select', required: true, options: ['Laki-laki', 'Perempuan'] },
  { id: 'tempatTanggalLahir', label: 'Tempat Tanggal Lahir', placeholder: 'Contoh: Jakarta, 01-01-2010', type: 'text', required: true },
  { 
    id: 'nikIbu', 
    label: 'NIK Ibu Kandung', 
    placeholder: 'Masukkan 16 digit NIK Ibu', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d{16}$/.test(v) ? 'NIK Ibu harus 16 digit angka' : null 
  },
  { id: 'namaIbu', label: 'Nama Ibu Kandung', placeholder: 'Sesuai Kartu Keluarga', type: 'text', required: true },
  { 
    id: 'emis', 
    label: 'No. Statistik EMIS', 
    placeholder: 'Nomor Statistik EMIS (Hanya Angka)', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d+$/.test(v) ? 'No. EMIS hanya boleh berisi angka' : null
  },
  { 
    id: 'npsn', 
    label: 'NPSN Sekolah', 
    placeholder: '8 Digit NPSN', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d{8}$/.test(v) ? 'NPSN harus tepat 8 digit angka' : null 
  },
  { id: 'jenisSekolah', label: 'Jenis Sekolah', placeholder: 'Pilih Jenis Sekolah', type: 'select', required: true, options: ['SMAK', 'SMTK'] },
  { id: 'namaSekolah', label: 'Nama Satuan Pendidikan', placeholder: 'Nama Sekolah Lengkap', type: 'text', required: true },
  { id: 'kabKota', label: 'Kab/Kota Sekolah', placeholder: 'Contoh: Jakarta Selatan', type: 'text', required: true },
  { id: 'provinsi', label: 'Provinsi Sekolah', placeholder: 'Contoh: DKI Jakarta', type: 'text', required: true },
  { id: 'bank', label: 'Nama Bank Penyalur', placeholder: 'Contoh: BRI / BNI', type: 'text', required: true },
  { 
    id: 'noRekening', 
    label: 'Nomor Rekening', 
    placeholder: 'Hanya Angka (Tanpa - atau spasi)', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d+$/.test(v) ? 'Nomor rekening hanya boleh angka (tidak boleh ada huruf, spasi, atau simbol)' : null
  },
  { id: 'namaRekening', label: 'Nama di Rekening', placeholder: 'Sesuai Buku Tabungan', type: 'text', required: true },
  { 
    id: 'nominal', 
    label: 'Nominal Disalurkan', 
    placeholder: 'Hanya Angka (Contoh: 750000)', 
    type: 'text', 
    required: true, 
    validation: (v) => !/^\d+$/.test(v) ? 'Nominal hanya boleh angka (tanpa titik, koma, atau huruf)' : null
  },
  { 
    id: 'tahunPenerimaan', 
    label: 'Tahun Penerimaan', 
    placeholder: 'Pilih Tahun', 
    type: 'select', 
    required: true, 
    options: ['2024', '2025'] 
  },
];

export const INITIAL_FORM_STATE: any = PIP_FIELDS.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {});

export const APP_CONFIG = {
  PRIMARY_COLOR: 'blue-700',
  SECONDARY_COLOR: 'slate-100',
  ACCENT_COLOR: 'amber-500'
};
